/**
 * Student accounts: database behaviour, tested on the same PGlite stack as RehabVerse.
 *   node scripts/student-local/test-db.mjs
 * Covers: own-rows-only RLS, no direct writes, idempotent events, per-source and daily XP caps, one-time import,
 * streaks, summary shape, export and delete.
 */
import assert from "node:assert/strict";
import { createDb, withRole, callRpc } from "../rehabverse-local/db.mjs";

const db = await createDb();
const A = { sub: "11111111-1111-1111-1111-111111111111", role: "authenticated" };
const B = { sub: "22222222-2222-2222-2222-222222222222", role: "authenticated" };
for (const u of [A, B]) await db.query("insert into auth.users (id, email) values ($1, $2)", [u.sub, `${u.sub.slice(0, 4)}@example.test`]);
const rpc = (claims, fn, args) => callRpc(db, claims, fn, args).then((r) => r.value);
const fails = async (p, text) => { try { await p; } catch (e) { assert.ok(String(e.message).includes(text), `expected "${text}", got "${e.message}"`); return; } assert.fail(`should have failed with "${text}"`); };
const todayIso = new Date().toISOString();
let ok = 0; const pass = (name) => { ok++; console.log("PASS", name); };

// 1. signed-out and profile-less callers are refused
await fails(rpc(null, "student_my_summary", {}), "permission denied"); pass("anonymous cannot call the functions at all");
await fails(rpc(A, "student_record_activities", { p: { events: [] } }), "Create your student profile first"); pass("activity needs a profile first");

// 2. profile validation and upsert
await fails(rpc(A, "student_upsert_profile", { p: { display_name: "x" } }), "Name must be"); pass("name length enforced");
const prof = await rpc(A, "student_upsert_profile", { p: { display_name: "Sana Malik", stage: "year3-4", goal: "exams", university: "DUHS", city: "Karachi" } });
assert.equal(prof.display_name, "Sana Malik"); assert.equal(prof.league_opt_in, true); assert.equal(prof.remind_email, false); pass("profile created with safe defaults");
await rpc(B, "student_upsert_profile", { p: { display_name: "Bilal Khan" } });

// 3. recording: idempotent, capped, validated
const ev = (key, xp, extra = {}) => ({ source: "pna-teacher", event_key: key, label: "PNA Teacher lesson: " + key, xp, occurred_at: todayIso, ...extra });
let r = await rpc(A, "student_record_activities", { p: { events: [ev("pna-teacher:lesson:convex-concave-rule", 40), ev("pna-teacher:lesson:convex-concave-rule", 40)] } });
assert.equal(r.inserted, 1); assert.equal(r.skipped, 1); assert.equal(r.total_xp, 40); pass("the same event is stored once");
r = await rpc(A, "student_record_activities", { p: { events: [ev("pna-teacher:lesson:big", 99999)] } });
assert.equal(r.total_xp, 40 + 80); pass("per-activity XP is capped (teacher lesson max 80)");
r = await rpc(A, "student_record_activities", { p: { events: [{ source: "hack", event_key: "hack:1", label: "x", xp: 100 }, { source: "imported", event_key: "imported:xp", label: "x", xp: 100 }] } });
assert.equal(r.inserted, 0); pass("unknown and 'imported' sources are refused from the browser");
// daily cap 800
const many = Array.from({ length: 12 }, (_, i) => ({ source: "virtual-patient", event_key: `virtual-patient:case:cap-${i}`, label: "VP case " + i, xp: 200, occurred_at: todayIso }));
r = await rpc(A, "student_record_activities", { p: { events: many } });
const today = await db.query("select sum(xp)::int as xp from public.student_activity where user_id = $1 and source <> 'imported' and day = (now() at time zone 'Asia/Karachi')::date", [A.sub]);
assert.ok(today.rows[0].xp <= 800, `daily cap exceeded: ${today.rows[0].xp}`); pass("daily XP ceiling holds (≤ 800)");
await fails(rpc(A, "student_record_activities", { p: { events: Array.from({ length: 51 }, (_, i) => ev("pna-teacher:x" + i, 1)) } }), "up to 50"); pass("batch size limited to 50");

const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
// a malformed event is skipped on its own; the good events in the same batch are still saved
r = await rpc(A, "student_record_activities", { p: { events: [
  ev("pna-teacher:lesson:poison-1", "lots"), ev("pna-teacher:lesson:poison-2", 12.6, { occurred_at: fiveDaysAgo }), ev("pna-teacher:lesson:poison-3", 5, { occurred_at: "yesterday-ish" }), ev("pna-teacher:lesson:poison-4", 7, { score: "88.4", occurred_at: fiveDaysAgo }),
] } });
assert.equal(r.inserted, 2); assert.equal(r.skipped, 2);
const rounded = await db.query("select xp, score from public.student_activity where user_id=$1 and event_key in ('pna-teacher:lesson:poison-2','pna-teacher:lesson:poison-4') order by event_key", [A.sub]);
assert.equal(rounded.rows[0].xp, 13); assert.equal(rounded.rows[1].score, 88); pass("one malformed event never blocks the rest of the queue (and decimals are rounded)");

// 4. old timestamps are accepted for backfill, future ones are clamped
await rpc(A, "student_record_activities", { p: { events: [ev("pna-teacher:lesson:old", 10, { occurred_at: new Date(Date.now() - 3 * 86400000).toISOString() }), ev("pna-teacher:lesson:future", 10, { occurred_at: new Date(Date.now() + 30 * 86400000).toISOString() })] } });
const fut = await db.query("select occurred_at from public.student_activity where user_id=$1 and event_key='pna-teacher:lesson:future'", [A.sub]);
assert.ok(new Date(fut.rows[0].occurred_at).getTime() < Date.now() + 60000); pass("future timestamps are clamped to now");

// 5. one-time import
let imp = await rpc(B, "student_import_local", { p: { total_xp: 340, active_dates: [new Date(Date.now() - 86400000).toISOString().slice(0, 10), new Date().toISOString().slice(0, 10), "not-a-date"] } });
assert.equal(imp.imported, true); assert.equal(imp.days, 2);
imp = await rpc(B, "student_import_local", { p: { total_xp: 9999, active_dates: [] } });
assert.equal(imp.imported, false); pass("local progress is imported once, bad dates ignored");

// 6. isolation
const own = await withRole(db, A, (tx) => tx.query("select count(*)::int as n from public.student_activity"));
const bs = await withRole(db, B, (tx) => tx.query("select count(*)::int as n from public.student_activity"));
assert.ok(own.rows[0].n > 3 && bs.rows[0].n === 3); pass("each student sees only their own rows");
await fails(withRole(db, A, (tx) => tx.query("insert into public.student_activity (user_id, source, event_key, label, xp, day) values ($1,'pna-teacher','x:y:z','hack',500,current_date)", [A.sub])), "permission denied"); pass("no direct inserts");
await fails(withRole(db, A, (tx) => tx.query("update public.student_profiles set league_opt_in=false")), "permission denied"); pass("no direct updates");
await fails(withRole(db, null, (tx) => tx.query("select * from public.student_activity")), "permission denied"); pass("anonymous cannot read the table");

// 7. summary
const s = await rpc(B, "student_my_summary", { p_days: 30 });
assert.equal(s.profile.display_name, "Bilal Khan"); assert.equal(s.totals.xp, 340); assert.equal(s.streak.current >= 1, true); assert.ok(Array.isArray(s.by_day) && Array.isArray(s.recent)); pass("summary: totals, streak and lists");
const sa = await rpc(A, "student_my_summary", { p_days: 30 });
assert.ok(sa.by_source.some((x) => x.source === "pna-teacher") && sa.by_source.some((x) => x.source === "virtual-patient")); assert.ok(sa.recent.length >= 4); pass("summary: per-source breakdown and recent activity");

// 8. export and delete
const ex = await rpc(A, "student_export_my_data", {});
assert.ok(ex.activity.length > 3 && !("user_id" in ex.activity[0])); pass("export returns the student's own data");
await rpc(A, "student_delete_my_data", {});
const left = await db.query("select (select count(*) from public.student_activity where user_id=$1)::int a, (select count(*) from public.student_profiles where user_id=$1)::int p", [A.sub]);
assert.deepEqual(left.rows[0], { a: 0, p: 0 }); pass("delete removes the profile and every activity");
const stillB = await db.query("select count(*)::int n from public.student_activity where user_id=$1", [B.sub]);
assert.equal(stillB.rows[0].n, 3); pass("deleting one account leaves others untouched");

console.log(`\n${ok} student database checks passed.`);
process.exit(0);
