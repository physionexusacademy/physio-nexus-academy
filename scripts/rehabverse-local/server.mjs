/**
 * Local "Supabase-lite" for developing and testing RehabVerse without touching the real project.
 *
 *   node scripts/rehabverse-local/server.mjs            # in-memory database, port 54321
 *   REHAB_DB_DIR=.local-db node scripts/rehabverse-local/server.mjs
 *
 * It speaks just enough of the Supabase HTTP API for @supabase/supabase-js and @supabase/ssr:
 *   /auth/v1/signup | token (password, refresh_token) | user | logout | settings   (email + password, auto-confirmed)
 *   /rest/v1/rpc/<function>                                                         (runs the real SQL under RLS)
 * The database is the real RehabVerse migration on PGlite (Postgres 17). Seeded staff login:
 *   admin@pna.test / AdminPass#2026
 *
 * LOCAL USE ONLY: the JWT secret is public and passwords are hashed with scrypt for convenience.
 */
import http from "node:http";
import crypto from "node:crypto";
import { createDb, callRpc, httpStatus } from "./db.mjs";

const PORT = Number(process.env.PORT ?? 54321);
const SECRET = process.env.REHAB_LOCAL_JWT_SECRET ?? "local-only-secret-not-for-production-use";
const ISSUER = `http://127.0.0.1:${PORT}/auth/v1`;
const db = await createDb({ dataDir: process.env.REHAB_DB_DIR });

/* ----------------------------- tokens and passwords ----------------------------- */
const b64 = (value) => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
function sign(payload) {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64(payload);
  const mac = crypto.createHmac("sha256", SECRET).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${mac}`;
}
function verify(token) {
  const [head, body, mac] = String(token ?? "").split(".");
  if (!head || !body || !mac) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(`${head}.${body}`).digest();
  let given;
  try {
    given = Buffer.from(mac, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.exp && payload.exp < Math.floor(Date.now() / 1000) ? null : payload;
  } catch {
    return null;
  }
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `scrypt:${salt}:${crypto.scryptSync(password, salt, 32).toString("hex")}`;
}
function checkPassword(password, stored) {
  const [, salt, hash] = String(stored ?? "").split(":");
  if (!salt || !hash) return false;
  return crypto.timingSafeEqual(crypto.scryptSync(password, salt, 32), Buffer.from(hash, "hex"));
}
const publicUser = (u) => ({
  id: u.id, aud: "authenticated", role: "authenticated", email: u.email, email_confirmed_at: unconfirmed.has(u.id) ? null : u.created_at, phone: "",
  confirmed_at: unconfirmed.has(u.id) ? null : u.created_at, last_sign_in_at: new Date().toISOString(), app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: u.raw_user_meta_data ?? {}, identities: [], created_at: u.created_at, updated_at: u.created_at, is_anonymous: false,
});
function session(u) {
  const now = Math.floor(Date.now() / 1000);
  const claims = { aud: "authenticated", exp: now + 3600, iat: now, iss: ISSUER, sub: u.id, email: u.email, phone: "", role: "authenticated", aal: "aal1", session_id: crypto.randomUUID(), is_anonymous: false };
  return {
    access_token: sign(claims), token_type: "bearer", expires_in: 3600, expires_at: now + 3600,
    refresh_token: sign({ typ: "refresh", sub: u.id, exp: now + 60 * 60 * 24 * 30 }), user: publicUser(u),
  };
}
const normaliseEmail = (e) => String(e ?? "").trim().toLowerCase();

/* E-mail flows. REHAB_LOCAL_CONFIRM=1 turns on "confirm your email" (new users cannot sign in until the code is used),
   like a project with e-mail confirmation enabled. Codes are one-time, kept in memory, and readable in tests via /__dev/last-code. */
const CONFIRM = process.env.REHAB_LOCAL_CONFIRM === "1";
const unconfirmed = new Set();
const codes = new Map();
const lastCode = new Map();
const issueCode = (userId, email) => {
  const code = crypto.randomBytes(12).toString("hex");
  codes.set(code, userId);
  lastCode.set(email, code);
  return code;
};

/* ----------------------------- seed the staff account ----------------------------- */
{
  const email = "admin@pna.test";
  const exists = await db.query("select id from auth.users where email = $1", [email]);
  if (!exists.rows.length) {
    const { rows } = await db.query("insert into auth.users (email, encrypted_password) values ($1, $2) returning id", [email, hashPassword("AdminPass#2026")]);
    await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Dr. Sajjad Raza PT (local)', 'owner')", [rows[0].id]);
  }
}

/* ----------------------------- http ----------------------------- */
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "apikey, authorization, content-type, x-client-info, prefer, accept-profile, content-profile",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};
function send(res, status, body) {
  const text = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, { ...cors, ...(text ? { "content-type": "application/json; charset=utf-8" } : {}) });
  res.end(text);
}
const authError = (res, status, code, msg) => send(res, status, { code: status, error_code: code, msg });
async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
const bearerClaims = (req) => {
  const header = String(req.headers.authorization ?? "");
  const payload = header.startsWith("Bearer ") ? verify(header.slice(7)) : null;
  return payload && payload.role === "authenticated" && payload.sub ? payload : null;
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    if (req.method === "OPTIONS") return send(res, 204);

    if (url.pathname === "/auth/v1/settings") {
      return send(res, 200, { external: { email: true, phone: false }, disable_signup: false, mailer_autoconfirm: true, phone_autoconfirm: false });
    }
    if (url.pathname === "/auth/v1/signup" && req.method === "POST") {
      const body = await readJson(req);
      const email = normaliseEmail(body.email);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return authError(res, 422, "validation_failed", "Unable to validate email address: invalid format");
      if (String(body.password ?? "").length < 8) return authError(res, 422, "weak_password", "Password should be at least 8 characters.");
      const exists = await db.query("select * from auth.users where email = $1", [email]);
      if (exists.rows.length) {
        // With e-mail confirmation on, GoTrue hides that the address is taken: a user with no identities comes back.
        if (CONFIRM) return send(res, 200, { ...publicUser(exists.rows[0]), identities: [] });
        return authError(res, 422, "user_already_exists", "User already registered");
      }
      const { rows } = await db.query(
        "insert into auth.users (email, encrypted_password, raw_user_meta_data) values ($1, $2, $3::jsonb) returning *",
        [email, hashPassword(String(body.password)), JSON.stringify(body.data ?? {})],
      );
      if (CONFIRM) {
        unconfirmed.add(rows[0].id);
        issueCode(rows[0].id, email);
        return send(res, 200, { ...publicUser(rows[0]), identities: [{ identity_id: rows[0].id, provider: "email" }] });
      }
      return send(res, 200, session(rows[0]));
    }
    if (url.pathname === "/auth/v1/recover" && req.method === "POST") {
      const body = await readJson(req);
      const { rows } = await db.query("select id from auth.users where email = $1", [normaliseEmail(body.email)]);
      if (rows.length) issueCode(rows[0].id, normaliseEmail(body.email));
      return send(res, 200, {});
    }
    if (url.pathname === "/auth/v1/resend" && req.method === "POST") {
      const body = await readJson(req);
      const { rows } = await db.query("select id from auth.users where email = $1", [normaliseEmail(body.email)]);
      if (rows.length && unconfirmed.has(rows[0].id)) issueCode(rows[0].id, normaliseEmail(body.email));
      return send(res, 200, {});
    }
    if (url.pathname === "/auth/v1/user" && req.method === "PUT") {
      const claims = bearerClaims(req);
      if (!claims) return authError(res, 401, "bad_jwt", "invalid JWT: unable to parse or verify signature");
      const body = await readJson(req);
      const { rows } = await db.query("select * from auth.users where id = $1", [claims.sub]);
      if (!rows.length) return authError(res, 403, "user_not_found", "User from sub claim in JWT does not exist");
      if (body.password !== undefined) {
        if (String(body.password).length < 8) return authError(res, 422, "weak_password", "Password should be at least 8 characters.");
        if (checkPassword(String(body.password), rows[0].encrypted_password)) return authError(res, 422, "same_password", "New password should be different from the old password.");
        await db.query("update auth.users set encrypted_password = $1 where id = $2", [hashPassword(String(body.password)), claims.sub]);
      }
      return send(res, 200, publicUser(rows[0]));
    }
    if (url.pathname === "/auth/v1/token" && req.method === "POST") {
      const body = await readJson(req);
      const grant = url.searchParams.get("grant_type");
      if (grant === "password") {
        const { rows } = await db.query("select * from auth.users where email = $1", [normaliseEmail(body.email)]);
        if (!rows.length || !checkPassword(String(body.password ?? ""), rows[0].encrypted_password)) {
          return authError(res, 400, "invalid_credentials", "Invalid login credentials");
        }
        if (unconfirmed.has(rows[0].id)) return authError(res, 400, "email_not_confirmed", "Email not confirmed");
        return send(res, 200, session(rows[0]));
      }
      if (grant === "pkce") {
        const userId = codes.get(String(body.auth_code ?? ""));
        if (!userId) return authError(res, 400, "flow_state_not_found", "invalid flow state, no valid flow state found");
        codes.delete(String(body.auth_code));
        unconfirmed.delete(userId);
        const { rows } = await db.query("select * from auth.users where id = $1", [userId]);
        return send(res, 200, session(rows[0]));
      }
      if (grant === "refresh_token") {
        const payload = verify(body.refresh_token);
        if (!payload || payload.typ !== "refresh") return authError(res, 400, "refresh_token_not_found", "Invalid Refresh Token: Refresh Token Not Found");
        const { rows } = await db.query("select * from auth.users where id = $1", [payload.sub]);
        if (!rows.length) return authError(res, 400, "refresh_token_not_found", "Invalid Refresh Token: Refresh Token Not Found");
        return send(res, 200, session(rows[0]));
      }
      return authError(res, 400, "unsupported_grant_type", "Unsupported grant type");
    }
    if (url.pathname === "/auth/v1/user" && req.method === "GET") {
      const claims = bearerClaims(req);
      if (!claims) return authError(res, 401, "bad_jwt", "invalid JWT: unable to parse or verify signature");
      const { rows } = await db.query("select * from auth.users where id = $1", [claims.sub]);
      return rows.length ? send(res, 200, publicUser(rows[0])) : authError(res, 403, "user_not_found", "User from sub claim in JWT does not exist");
    }
    if (url.pathname === "/auth/v1/logout" && req.method === "POST") return send(res, 204);

    // The admin middleware reads the caller's own profile row (owner/admin) over REST.
    if (url.pathname === "/rest/v1/profiles" && req.method === "GET") {
      const claims = bearerClaims(req);
      const id = /^eq\.([0-9a-f-]{36})$/i.exec(url.searchParams.get("id") ?? "")?.[1];
      if (!claims || !id || id !== claims.sub) return send(res, 200, []);
      const { rows } = await db.query("select id, role from public.profiles where id = $1", [id]);
      if (String(req.headers.accept ?? "").includes("pgrst.object")) return rows.length ? send(res, 200, rows[0]) : send(res, 406, { code: "PGRST116", message: "The result contains 0 rows" });
      return send(res, 200, rows);
    }

    const rpc = url.pathname.match(/^\/rest\/v1\/rpc\/([a-z_][a-z0-9_]*)$/);
    if (rpc && req.method === "POST") {
      const claims = bearerClaims(req);
      try {
        const { value, returns } = await callRpc(db, claims, rpc[1], await readJson(req));
        return returns === "void" ? send(res, 204) : send(res, 200, value);
      } catch (error) {
        return send(res, httpStatus(error, !claims), { code: error.code ?? "P0001", details: null, hint: null, message: error.message });
      }
    }

    if (url.pathname === "/__dev/last-code" && process.env.REHAB_DEV_SQL === "1") {
      return send(res, 200, { code: lastCode.get(normaliseEmail(url.searchParams.get("email"))) ?? null });
    }
    // Test-only: run SQL as the database owner (to age timestamps in end-to-end tests).
    if (url.pathname === "/__dev/sql" && req.method === "POST" && process.env.REHAB_DEV_SQL === "1") {
      const body = await readJson(req);
      const result = await db.query(String(body.sql ?? ""), body.params ?? []);
      return send(res, 200, result.rows);
    }
    send(res, 404, { message: "Not found" });
  } catch (error) {
    console.error("local backend error:", error);
    send(res, 500, { message: String(error?.message ?? error) });
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`RehabVerse local backend on http://127.0.0.1:${PORT}  (staff login admin@pna.test / AdminPass#2026)`));
const stop = async () => {
  server.close();
  await db.close().catch(() => undefined);
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
