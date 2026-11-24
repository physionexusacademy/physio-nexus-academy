import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MEMBER_COOKIE, MEMBER_COOKIE_TTL_SECONDS, clearMemberCookieHeader, memberCookieHeader, readCookie, signMemberToken, verifyMemberToken } from "../src/lib/members/cookie.ts";
import { isPublicPath, safeNext } from "../src/lib/members/paths.ts";
import { gateRequest, membersOnly, resetGateMemory, type GateEnv } from "../src/lib/members/worker-gate.ts";

/**
 * Members-only website: the approval cookie, which addresses stay open, and what the Worker's gate decides, plus a read of the wiring (the gate runs before any cache,
 * the cookie is set only by the server after the database says approved, only staff reach the approval panel). The database side is validate-site-members-db.mjs.
 */
let checks = 0;
const ok = (c: boolean, m: string) => { checks++; assert.ok(c, m); };
const eq = (a: unknown, b: unknown, m: string) => { checks++; assert.deepEqual(a, b, m); };
const read = (p: string) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

const SECRET = "service-role-key-for-tests";
const UID = "11111111-2222-4333-8444-555555555555";
const NOW = 1_800_000_000;

/* ---------- the approval cookie ---------- */
{
  const token = await signMemberToken(SECRET, UID, NOW);
  eq(await verifyMemberToken(SECRET, token, NOW), UID, "a fresh token verifies and gives the user id");
  eq(await verifyMemberToken(SECRET, token, NOW + MEMBER_COOKIE_TTL_SECONDS - 1), UID, "it is good until just before it expires");
  eq(await verifyMemberToken(SECRET, token, NOW + MEMBER_COOKIE_TTL_SECONDS), null, "it is refused once it expires");
  eq(await verifyMemberToken("another-key", token, NOW), null, "a token signed with another key is refused");
  const [v, , exp, sig] = token.split(".");
  eq(await verifyMemberToken(SECRET, [v, "99999999-2222-4333-8444-555555555555", exp, sig].join("."), NOW), null, "changing the user id breaks it");
  eq(await verifyMemberToken(SECRET, [v, UID, String(Number(exp) + 99999), sig].join("."), NOW), null, "extending the expiry breaks it");
  eq(await verifyMemberToken(SECRET, [v, UID, exp, sig.slice(0, -2) + "xx"].join("."), NOW), null, "a changed signature is refused");
  for (const bad of ["", "garbage", "v1.a.b", "v2." + token.slice(3), token + ".extra", "x".repeat(500), null, undefined]) eq(await verifyMemberToken(SECRET, bad as string, NOW), null, `refused: ${String(bad).slice(0, 20)}`);
  eq(await verifyMemberToken("", token, NOW), null, "with no key nothing verifies");
  let threw = false; try { await signMemberToken("", UID, NOW); } catch { threw = true; }
  ok(threw, "a token cannot be made without a key");
  threw = false; try { await signMemberToken(SECRET, "not-a-uuid", NOW); } catch { threw = true; }
  ok(threw, "a token cannot be made for something that is not a user id");
  eq(readCookie(`a=1; ${MEMBER_COOKIE}=${token}; b=2`, MEMBER_COOKIE), token, "the cookie is found among others");
  eq(readCookie("a=1", MEMBER_COOKIE), null, "…and its absence is null");
  const header = memberCookieHeader(token);
  ok(/HttpOnly/.test(header) && /Secure/.test(header) && /SameSite=Lax/.test(header) && /Path=\//.test(header) && new RegExp(`Max-Age=${MEMBER_COOKIE_TTL_SECONDS}`).test(header), "the cookie is HttpOnly, Secure, SameSite=Lax and short-lived");
  ok(/Max-Age=0/.test(clearMemberCookieHeader()), "it can be cleared");
  ok(MEMBER_COOKIE_TTL_SECONDS <= 15 * 60, "an approval is trusted for at most 15 minutes, so a suspension takes effect quickly");
}

/* ---------- which addresses stay open ---------- */
for (const open of ["/members", "/members/check", "/members/waiting", "/admin", "/admin/login", "/admin/members", "/api/anything", "/_next/static/chunk.js", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/offline",
  "/rehabverse/login", "/rehabverse/register", "/rehabverse/pending", "/rehabverse/me", "/rehabverse/me/day/abc", "/rehabverse/start", "/auth/callback", "/.well-known/security.txt"]) ok(isPublicPath(open), `${open} stays open`);
for (const closed of ["/", "/learn", "/learn/gait-cycle", "/skills/special-tests", "/rehabverse", "/rehabverse/library", "/manual-therapy", "/workshops", "/account", "/conditions", "/virtual-patient", "/members-area", "/administrator", "/apix", "/rehabverse/me-too", "/legal/privacy"]) ok(!isPublicPath(closed), `${closed} needs an approved member`);
eq(["/ok", "/a/b?c=d"].map((p) => safeNext(p)), ["/ok", "/a/b?c=d"], "a path on this site is kept");
eq(["//evil.example", "https://evil.example", "/\\evil", "javascript:alert(1)", "", null, undefined, "x", "/a\nb"].map((p) => safeNext(p as string)), ["/", "/", "/", "/", "/", "/", "/", "/", "/"], "anything that is not a path on this site becomes the home page");

/* ---------- the Worker's decisions ---------- */
const req = (path: string, init: RequestInit & { cookie?: string } = {}) => new Request(`https://physionexusacademy.com${path}`, { ...init, headers: { ...(init.headers as Record<string, string> | undefined), ...(init.cookie ? { cookie: init.cookie } : {}) } });
const fetchMode = (value: boolean | "error", calls: { n: number } = { n: 0 }) => (async () => { calls.n++; if (value === "error") throw new Error("down"); return new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json" } }); }) as unknown as typeof fetch;
const env: GateEnv = { SUPABASE_SERVICE_ROLE_KEY: SECRET, NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" };
const goodCookie = `${MEMBER_COOKIE}=${await signMemberToken(SECRET, UID, NOW)}`;
const io = (value: boolean | "error", t = NOW * 1000, calls?: { n: number }) => ({ fetch: fetchMode(value, calls), now: () => t });

resetGateMemory();
eq(await gateRequest(req("/learn"), env, io(false)), null, "mode OFF: every page passes");
resetGateMemory();
{
  const r = await gateRequest(req("/skills/special-tests?tab=atlas"), env, io(true));
  ok(r !== null && r.status === 303, "mode ON, no cookie: a page request is redirected");
  const loc = new URL(r!.headers.get("location")!);
  eq([loc.pathname, loc.searchParams.get("next")], ["/members/check", "/skills/special-tests?tab=atlas"], "…to the check page, remembering where the person wanted to go");
  ok(r!.headers.get("cache-control") === "no-store", "…and the redirect is never cached");
}
eq(await gateRequest(req("/members"), env, io(true)), null, "mode ON: the sign-in page itself stays open");
eq(await gateRequest(req("/admin/members"), env, io(true)), null, "mode ON: the admin area stays reachable (it has its own sign-in)");
eq(await gateRequest(req("/learn", { cookie: goodCookie }), env, io(true)), null, "mode ON: a genuine approval cookie passes");
{
  const expired = `${MEMBER_COOKIE}=${await signMemberToken(SECRET, UID, NOW - 10_000)}`;
  ok((await gateRequest(req("/learn", { cookie: expired }), env, io(true)))?.status === 303, "an expired cookie is sent back to be checked");
  const forged = `${MEMBER_COOKIE}=${(await signMemberToken("not-the-key", UID, NOW))}`;
  ok((await gateRequest(req("/learn", { cookie: forged }), env, io(true)))?.status === 303, "a cookie signed with another key is not accepted");
  ok((await gateRequest(req("/learn", { cookie: `${MEMBER_COOKIE}=whatever; sb-abc-auth-token=xyz` }), env, io(true)))?.status === 303, "a Supabase sign-in cookie alone does not pass: the server has to confirm approval");
}
{
  const post = await gateRequest(req("/learn", { method: "POST" }), env, io(true));
  ok(post?.status === 401, "mode ON: an action posted without approval gets 401, not a redirect");
  const json = await gateRequest(req("/learn", { headers: { accept: "application/json" } }), env, io(true));
  ok(json?.status === 401, "a data request without approval gets 401");
}
eq(await gateRequest(req("/learn"), { ...env, MEMBERS_CI_TOKEN: "ci-secret" }, io(true)) !== null, true, "without the CI token the page is gated");
eq(await gateRequest(req("/learn", { headers: { "x-pna-ci": "ci-secret" } }), { ...env, MEMBERS_CI_TOKEN: "ci-secret" }, io(true)), null, "with the right CI token the deploy's own checks pass");
eq(await gateRequest(req("/learn", { headers: { "x-pna-ci": "wrong" } }), { ...env, MEMBERS_CI_TOKEN: "ci-secret" }, io(true)) !== null, true, "with a wrong CI token they do not");
eq(await gateRequest(req("/learn", { headers: { "x-pna-ci": "" } }), { ...env, MEMBERS_CI_TOKEN: "" }, io(true)) !== null, true, "an empty CI token never matches an empty header");
resetGateMemory();
ok((await gateRequest(req("/learn"), { ...env, MEMBERS_ONLY: "1" }, io(false)))?.status === 303, "MEMBERS_ONLY=1 forces the gate on whatever the database says");
{
  // the answer is remembered for 30 seconds, then asked again
  resetGateMemory();
  const calls = { n: 0 };
  await membersOnly(env, io(true, 1_000_000, calls));
  await membersOnly(env, io(true, 1_000_000 + 29_000, calls));
  eq(calls.n, 1, "the database is asked once in 30 seconds");
  await membersOnly(env, io(true, 1_000_000 + 31_000, calls));
  eq(calls.n, 2, "and again after that");
  // the database goes away: the last answer is kept
  eq(await membersOnly(env, io("error", 1_000_000 + 80_000)), true, "if the database cannot be reached the last known answer is used");
  resetGateMemory();
  eq(await membersOnly(env, io("error")), false, "with no known answer the site stays open for that request");
  eq(await membersOnly({ ...env, SUPABASE_SERVICE_ROLE_KEY: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" }, io(true)), false, "with no key to ask with, the gate cannot know: open");
}
{
  // members-only is on but there is no signing key: nobody can be approved, so everyone is sent to the check page (which says it is not configured) rather than let through
  resetGateMemory();
  const r = await gateRequest(req("/learn", { cookie: goodCookie }), { ...env, MEMBERS_ONLY: "1", SUPABASE_SERVICE_ROLE_KEY: "" }, io(true));
  ok(r?.status === 303, "forced ON with no signing key: nobody passes (fail closed)");
}

/* ---------- the wiring ---------- */
{
  const worker = read("custom-worker.ts");
  const handle = worker.slice(worker.indexOf("async function handle("));
  ok(/gateRequest\(request, \(env \?\? \{\}\) as GateEnv\)/.test(handle) && handle.indexOf("gateRequest(") < handle.indexOf("edgeCache") && handle.indexOf("gateRequest(") < handle.indexOf("worker.fetch"), "the Worker runs the gate before the edge cache and before any page, so a cached page cannot be served around it");
  const check = read("src/app/members/check/route.ts");
  ok(/httpOnly: true, secure: true, sameSite: "lax"/.test(check) && /site_member_ensure/.test(check) && /status !== "approved"/.test(check) && /safeNext\(/.test(check), "the check route sets the HttpOnly cookie only when the database says approved, and only sends people to a path on this site");
  ok(check.indexOf('status === "pending"') < check.indexOf("cookies.set"), "a waiting person is turned away before any cookie is set");
  const actions = read("src/app/members/actions.ts");
  ok(/text\(form, "website"\)/.test(actions) && /isPublicFormRateLimited\(`members-register/.test(actions) && /isPublicFormRateLimited\(`members-login/.test(actions) && /email_confirm: true/.test(actions), "registration has a honeypot and rate limits for sign-up and sign-in; the sign-in needs no e-mail round trip");
  ok(!/signUp\(/.test(actions), "Supabase's own sign-up (which sends a confirmation mail) is not used");
  ok(/cookies\(\)\)\.delete\(MEMBER_COOKIE\)/.test(actions), "signing out clears the approval cookie");
  ok(/pathname === "\/members" \|\| pathname\?\.startsWith\("\/members\/"\)/.test(read("src/components/PublicChrome.tsx")), "the members' door shows none of the site's header, footer or floating buttons");
  const layout = read("src/app/members/layout.tsx");
  ok(/index: false/.test(layout), "the members' pages are not indexed");
  const panel = read("src/components/members/MembersPanel.tsx");
  ok(/setConfirmOn\(true\)/.test(panel) && /mode-confirm/.test(panel) && /disabled=\{busy \|\| note\.trim\(\)\.length < 3\}/.test(panel), "turning members-only on needs a confirmation, and a rejection or suspension needs a reason");
  const page = read("src/app/admin/(dashboard)/members/page.tsx");
  ok(/requireAdmin\(\)/.test(page), "the approval panel is staff only");
  ok(/href: "\/admin\/members"/.test(read("src/lib/admin/nav.ts")), "Members access is in the admin sidebar");
  const mig = read("supabase/migrations/20261203120000_site_members.sql");
  ok(/revoke all on public\.site_members from anon, authenticated/.test(mig) && /enable row level security/.test(mig) && /members_only boolean not null default false/.test(mig), "the member table is closed to the API and the switch defaults to OFF");
  const mw = read("src/middleware.ts");
  ok(/"\/admin\/:path\*"/.test(mw), "the admin area keeps its own middleware check");
  const paths = read("src/lib/members/paths.ts");
  ok(!/\["\/", /.test(paths) && !/\["\/learn/.test(paths), "the home page and the lessons are not in the open list");
}

console.log(`Members-only website: ${checks} checks passed (signed approval cookie, open addresses, the Worker's decisions, the gate runs before any cache).`);
