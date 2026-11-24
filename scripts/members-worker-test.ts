/**
 * Runs the REAL Worker (opennextjs-cloudflare build, then wrangler dev) against the local backend and checks that, with members-only mode on, no page can be reached without an
 * approval cookie, including the prebuilt (static) pages and the edge-cached pages, and that the right cookie passes:
 *
 *   REHAB_DEV_SQL=1 node scripts/rehabverse-local/server.mjs          (local backend on :54321)
 *   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key SUPABASE_SERVICE_ROLE_KEY=local-service-role-key npx opennextjs-cloudflare build
 *   node --experimental-strip-types scripts/members-worker-test.ts
 *
 * Takes about two minutes (the Worker remembers the mode for 30 seconds, so the test waits for that twice).
 */
import { spawn } from "node:child_process";
import { MEMBER_COOKIE, signMemberToken } from "../src/lib/members/cookie.ts";

const PORT = 8787;
const BASE = `http://127.0.0.1:${PORT}`;
const API = "http://127.0.0.1:54321";
const KEY = "local-service-role-key";
const UID = "11111111-2222-4333-8444-555555555555";
let passed = 0, failed = 0;
const check = (name: string, ok: boolean, detail = "") => { ok ? passed++ : failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const setMode = (on: boolean) => fetch(`${API}/__dev/sql`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sql: `update public.site_access_settings set members_only = ${on}` }) });
const get = (path: string, init: RequestInit = {}) => fetch(BASE + path, { redirect: "manual", ...init });
const cookieFor = async (secret: string, uid = UID, now = Math.floor(Date.now() / 1000)) => `${MEMBER_COOKIE}=${await signMemberToken(secret, uid, now)}`;

const worker = spawn("npx", ["wrangler", "dev", "--local", "--port", String(PORT), "--var", `SUPABASE_SERVICE_ROLE_KEY:${KEY}`, "--var", `NEXT_PUBLIC_SUPABASE_URL:${API}`, "--var", "NEXT_PUBLIC_SUPABASE_ANON_KEY:local-anon-key", "--var", "NEXT_PUBLIC_SITE_URL:http://127.0.0.1:8787"], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, CI: "1" } });
let log = "";
worker.stdout.on("data", (d) => (log += d)); worker.stderr.on("data", (d) => (log += d));
const stop = () => { try { worker.kill("SIGTERM"); } catch { /* already gone */ } };
process.on("exit", stop);

try {
  for (let i = 0; i < 120; i++) { if (/Ready on/.test(log)) break; if (worker.exitCode !== null) throw new Error("wrangler exited:\n" + log.slice(-1500)); await sleep(1000); }
  if (!/Ready on/.test(log)) throw new Error("wrangler did not start:\n" + log.slice(-1500));
  await setMode(false);

  // mode OFF: the site is open as before
  let r = await get("/");
  check("W1 Mode OFF: the home page opens as before", r.status === 200, `HTTP ${r.status}`);
  r = await get("/learn");
  check("W2 Mode OFF: a lesson hub opens as before", r.status === 200, `HTTP ${r.status}`);

  // mode ON (the Worker remembers the answer for 30 seconds)
  await setMode(true);
  console.log("   (waiting 32 seconds for the Worker's remembered answer to expire)");
  await sleep(32_000);
  for (const path of ["/", "/learn", "/skills/special-tests", "/faq", "/workshops", "/rehabverse", "/conditions", "/manual-therapy", "/account"]) {
    r = await get(path);
    const loc = r.headers.get("location") ?? "";
    check(`W3 Mode ON, no cookie: ${path} is sent to the check page`, r.status === 303 && loc.startsWith(`${BASE}/members/check?next=${encodeURIComponent(path)}`), `HTTP ${r.status} → ${loc}`);
  }
  r = await get("/", { method: "HEAD" });
  check("W4 A HEAD request is gated too", r.status === 303);
  r = await get("/learn", { method: "POST", body: "x" });
  check("W5 A POST without approval gets 401", r.status === 401, `HTTP ${r.status}`);
  r = await get("/learn", { headers: { accept: "application/json" } });
  check("W6 A data request without approval gets 401", r.status === 401, `HTTP ${r.status}`);
  for (const path of ["/members", "/admin/login"]) {
    r = await get(path);
    check(`W7 Mode ON: ${path} stays open`, r.status === 200 || r.status === 307 || r.status === 308 || (r.status === 303 && !(r.headers.get("location") ?? "").includes("/members/check")), `HTTP ${r.status}`);
  }
  r = await get("/members/check?next=%2Flearn");
  check("W8 The check page itself is open (and, with nobody signed in, sends them to sign in)", r.status === 303 && (r.headers.get("location") ?? "").includes("/members?next="), `HTTP ${r.status} → ${r.headers.get("location")}`);

  // the right cookie passes; the wrong ones do not
  const good = await cookieFor(KEY);
  for (const path of ["/", "/learn", "/skills/special-tests", "/faq"]) {
    r = await get(path, { headers: { cookie: good } });
    check(`W9 With a genuine approval cookie ${path} opens`, r.status === 200, `HTTP ${r.status}`);
  }
  const wrongKey = await cookieFor("another-key");
  const expired = await cookieFor(KEY, UID, Math.floor(Date.now() / 1000) - 3600);
  const tampered = good.replace(UID, "99999999-2222-4333-8444-555555555555");
  for (const [name, cookie] of [["signed with another key", wrongKey], ["expired", expired], ["with a changed user id", tampered], ["garbage", `${MEMBER_COOKIE}=nonsense`], ["a Supabase session only", "sb-x-auth-token=abc"]] as const) {
    r = await get("/learn", { headers: { cookie } });
    check(`W10 A cookie ${name} does not pass`, r.status === 303, `HTTP ${r.status}`);
  }

  // mode OFF again
  await setMode(false);
  console.log("   (waiting 32 seconds)");
  await sleep(32_000);
  r = await get("/learn");
  check("W11 Turned off again, the site opens for everyone", r.status === 200, `HTTP ${r.status}`);
} catch (error) {
  console.error(error);
  failed++;
} finally {
  stop();
  console.log(`\nWorker gate run: ${passed}/${passed + failed} passed`);
  process.exit(failed ? 1 : 0);
}
