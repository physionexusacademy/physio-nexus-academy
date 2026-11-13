/**
 * Local database for RehabVerse development and tests: PGlite (WASM Postgres 17, the same major
 * version as the production project) + a stub of the Supabase roles/auth helpers + the real migration.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

export async function createDb({ dataDir } = {}) {
  const db = dataDir ? new PGlite(dataDir) : new PGlite();
  await db.waitReady;
  const already = await db.query("select to_regclass('public.rehab_patients') as t").then((r) => r.rows[0].t);
  if (!already) {
    await db.exec(fs.readFileSync(path.join(here, "stub-supabase.sql"), "utf8"));
    await db.exec(fs.readFileSync(path.join(root, "supabase/migrations/20261114120000_rehabverse.sql"), "utf8"));
  }
  const hasStudent = await db.query("select to_regclass('public.student_profiles') as t").then((r) => r.rows[0].t);
  if (!hasStudent) await db.exec(fs.readFileSync(path.join(root, "supabase/migrations/20261115120000_student_accounts.sql"), "utf8"));
  return db;
}

/** Runs SQL as a Supabase API role ("anon" | "authenticated") with the given JWT claims. */
export async function withRole(db, claims, fn) {
  const role = claims ? "authenticated" : "anon";
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true)", [
      claims ? JSON.stringify(claims) : "",
      claims?.sub ?? "",
    ]);
    return fn(tx);
  });
}

const procCache = new Map();
async function procInfo(tx, fn) {
  const missing = () => Object.assign(new Error(`Could not find the function public.${fn}`), { code: "PGRST202" });
  if (!/^[a-z_][a-z0-9_]*$/.test(fn)) throw missing();
  if (procCache.has(fn)) return procCache.get(fn);
  const { rows } = await tx.query(
    `select p.proargnames as names, array(select format_type(t, null) from unnest(p.proargtypes::oid[]) t) as types,
            format_type(p.prorettype, null) as ret
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = $1 limit 1`,
    [fn],
  );
  if (!rows.length) throw missing();
  procCache.set(fn, rows[0]);
  return rows[0];
}

/** PostgREST-style RPC: POST /rest/v1/rpc/<fn> with named JSON arguments. */
export async function callRpc(db, claims, fn, args = {}) {
  return withRole(db, claims, async (tx) => {
    const info = await procInfo(tx, fn);
    const names = info.names ?? [];
    const parts = [];
    const params = [];
    for (const [key, value] of Object.entries(args ?? {})) {
      const index = names.indexOf(key);
      if (index < 0) throw Object.assign(new Error(`Could not find the function public.${fn}(${Object.keys(args).join(", ")})`), { code: "PGRST202" });
      const type = info.types[index];
      params.push(type === "jsonb" || type === "json" ? (value === undefined ? null : JSON.stringify(value)) : value);
      parts.push(`${key} => $${params.length}::${type}`);
    }
    const { rows } = await tx.query(`select public.${fn}(${parts.join(", ")}) as result`, params);
    return { value: rows[0]?.result ?? null, returns: info.ret };
  });
}

/** Maps a Postgres error to the HTTP status PostgREST would use. */
export function httpStatus(error, isAnon) {
  const code = error?.code ?? "";
  if (code === "PGRST202") return 404;
  if (code === "42501") return isAnon ? 401 : 403;
  if (code.startsWith("23")) return 409;
  return 400;
}
