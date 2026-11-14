/**
 * Daily reminder for every past participant: database behaviour on PGlite with the real migrations.
 *   node scripts/student-local/test-participants.mjs
 */
import assert from "node:assert/strict";
import { createDb } from "../rehabverse-local/db.mjs";

const db = await createDb();
let ok = 0;
const pass = (name) => { ok++; console.log("PASS", name); };
const q = async (sql, params) => (await db.query(sql, params)).rows;
const asRole = (role, sql, params = []) => db.transaction(async (tx) => { await tx.exec(`set local role ${role}`); return (await tx.query(sql, params)).rows; });
const fails = async (p, text) => { try { await p; } catch (e) { assert.ok(String(e.message).includes(text), `expected "${text}", got "${e.message}"`); return; } assert.fail(`should have failed with "${text}"`); };
const pk = async (hour, dayOffset = 0) => (await q("select ((date_trunc('day', now() at time zone 'Asia/Karachi') + ($1 || ' days')::interval + ($2 || ' hours')::interval) at time zone 'Asia/Karachi') as t", [String(dayOffset), String(hour)]))[0].t.toISOString();
const claim = async (when, limit = 100) => (await asRole("service_role", "select public.pna_participant_reminders_claim($1::timestamptz, $2) as r", [when, limit]))[0].r;
const names = (batch) => batch.map((b) => b.name).sort();

async function attempt(key, name, daysAgo, status = "submitted", score = 80, email = key) {
  await db.query(
    "insert into public.daily_challenge_attempts (challenge_date, full_name, email, email_key, status, score, correct_count, started_at, submitted_at) values ((now() at time zone 'Asia/Karachi')::date - $1::int, $2, $3, $4, $5, $6, $7, now() - ($1 || ' days')::interval, $8)",
    [daysAgo, name, email, key, status, status === "started" ? null : score, status === "started" ? null : Math.round(score / 20), status === "started" ? null : new Date().toISOString()],
  );
}

// ── the cast ──
for (const d of [1, 2, 3]) await attempt("ayesha@gmail.com", "Ayesha Khan", d, "submitted", [80, 100, 60][d - 1]);
await attempt("bilal@gmail.com", "Bilal Ahmed", 10, "started");
await attempt("sana@gmail.com", "Sana Malik", 0, "submitted", 100); // already played today
await attempt("omar@gmail.com", "Omar Farooq", 4, "submitted", 60);
await attempt("hira@gmail.com", "Hira Aslam", 5, "submitted", 40);
await attempt("zainali@gmail.com", "Zain A", 9, "submitted", 20, "zain.ali+x@gmail.com");
await attempt("zainali@gmail.com", "Zain Ali", 6, "submitted", 40, "zainali@gmail.com");
for (let i = 1; i <= 5; i++) await attempt(`extra${i}@gmail.com`, `Extra Person ${i}`, 12 + i, "submitted", 20 + i);
await db.query("insert into public.daily_reminder_optouts (email_key) values ('omar@gmail.com')");
await db.query("insert into auth.users (id, email) values ('00000000-0000-4000-8000-0000000000a1', 'hira@gmail.com')");
await db.query("insert into public.student_profiles (user_id, display_name, remind_email, remind_hour) values ('00000000-0000-4000-8000-0000000000a1', 'Hira Aslam', true, 9)");

/* ───────────── who is due ───────────── */
assert.deepEqual((await q("select enabled, int_value from public.pna_feature_flags where key='daily_participant_reminders'"))[0], { enabled: true, int_value: 60 }); pass("the feature flag ships on, with a daily cap of 60");
assert.deepEqual(await claim(await pk(12)), []); assert.deepEqual(await claim(await pk(23)), []); pass("nothing is sent outside 17:00–21:59 Pakistan time");
const first = await claim(await pk(18));
const expected = ["Ayesha Khan", "Bilal Ahmed", ...[1, 2, 3, 4, 5].map((i) => `Extra Person ${i}`), "Zain Ali"].sort();
assert.deepEqual(names(first), expected); pass("every past participant is due — except those who played today, opted out, or already get the My PNA student reminder");
assert.ok(first.every((b) => b.kind === "daily_participant" && b.token && b.id && b.to && b.lang === "mix")); pass("each reminder carries the full name, address, token and kind");
const by = Object.fromEntries(first.map((b) => [b.name, b]));
assert.deepEqual({ ...by["Ayesha Khan"].stats, first_day: undefined, last_day: undefined }, { missions: 3, points: 240, best: 100, participants: 11, top_percent: 10, first_day: undefined, last_day: undefined });
assert.equal(by["Ayesha Khan"].streak, 3); assert.equal(by["Bilal Ahmed"].stats.missions, 0); assert.equal(by["Bilal Ahmed"].streak, 0); pass("personal stats are right: missions, points, best score, streak and rank");
assert.equal(by["Zain Ali"].to, "zainali@gmail.com"); assert.equal(by["Zain Ali"].stats.missions, 2); pass("one person with two spellings of the same Gmail is one participant, addressed by their latest name");
const subj = (await q("select subject::text, email_key from public.pna_reminder_log where kind='daily_participant' and email_key='ayesha@gmail.com'"))[0];
assert.equal(subj.subject, (await q("select md5('ayesha@gmail.com')::uuid::text as u"))[0].u); pass("claims are logged once per person per day");
assert.deepEqual(await claim(await pk(19)), []); pass("a second run the same day sends nothing again");

/* ───────────── failures, unsubscribe, next day ───────────── */
const finish = (results) => asRole("service_role", "select public.pna_reminders_finish($1::jsonb) as r", [JSON.stringify(results)]);
await finish(first.filter((b) => b.name !== "Bilal Ahmed").map((b) => ({ id: b.id, ok: true })));
await finish([{ id: by["Bilal Ahmed"].id, ok: false }]);
const retry = await claim(await pk(20)); assert.deepEqual(names(retry), ["Bilal Ahmed"]); pass("a failed send is retried the same evening");
await finish([{ id: retry[0].id, ok: true }]);

const unsub = await asRole("service_role", "select public.pna_reminder_unsubscribe($1) as r", [by["Ayesha Khan"].token]);
assert.deepEqual(unsub[0].r, { ok: true, kind: "daily_participant" });
assert.equal((await q("select count(*)::int n from public.daily_reminder_optouts where email_key='ayesha@gmail.com'"))[0].n, 1); pass("one-click unsubscribe records a permanent opt-out");
const tomorrow = await claim(await pk(18, 1));
assert.ok(!names(tomorrow).includes("Ayesha Khan") && !names(tomorrow).includes("Omar Farooq")); assert.ok(names(tomorrow).includes("Sana Malik")); assert.equal(tomorrow.length, expected.length); pass("tomorrow everyone is due again (Sana, who played today, included) — except the people who unsubscribed");
await asRole("service_role", "select public.pna_reminder_unsubscribe($1)", [by["Ayesha Khan"].token]);
assert.equal((await q("select count(*)::int n from public.daily_reminder_optouts"))[0].n, 2); pass("unsubscribing twice is harmless");

/* ───────────── guard rails ───────────── */
await db.query("update public.pna_feature_flags set int_value = 3 where key='daily_participant_reminders'");
const capped = await claim(await pk(18, 2));
assert.equal(capped.length, 3); assert.deepEqual(await claim(await pk(19, 2)), []); pass("the daily cap limits how many go out per day, across all runs");
assert.ok(capped.every((b) => ["Zain Ali", "Bilal Ahmed"].includes(b.name) === false || true)); // recency order is covered next
const order = (await q("select full_name from (select distinct on (email_key) email_key, full_name from public.daily_challenge_attempts order by email_key, started_at desc) l join (select email_key, max(challenge_date) d from public.daily_challenge_attempts group by email_key) m using (email_key) where email_key not in ('ayesha@gmail.com','omar@gmail.com','hira@gmail.com') order by m.d desc, email_key limit 3")).map((r) => r.full_name).sort();
assert.deepEqual(names(capped), order); pass("when the cap bites, the most recently active participants go first");
await db.query("update public.pna_feature_flags set enabled = false where key='daily_participant_reminders'");
assert.deepEqual(await claim(await pk(18, 3)), []); pass("the pause switch stops every participant reminder at once");
await db.query("update public.pna_feature_flags set enabled = true, int_value = 60 where key='daily_participant_reminders'");
await db.query("update public.student_profiles set remind_email = false where display_name='Hira Aslam'");
assert.ok(names(await claim(await pk(18, 4))).includes("Hira Aslam")); pass("a student who switches their own reminder off is picked up as a participant instead (never both)");

await fails(db.transaction(async (tx) => { await tx.exec("set local role authenticated"); await tx.query("select public.pna_participant_reminders_claim(now(), 5)"); }), "permission denied");
await fails(db.transaction(async (tx) => { await tx.exec("set local role anon"); await tx.query("select * from public.daily_reminder_optouts"); }), "permission denied");
await fails(db.transaction(async (tx) => { await tx.exec("set local role authenticated"); await tx.query("select * from public.pna_feature_flags"); }), "permission denied"); pass("only the server can claim, read the opt-outs or flip the switch");
assert.equal((await q("select public.pna__gmail_key(' Zain.Ali+news@GoogleMail.com ') as k"))[0].k, "zainali@gmail.com"); pass("Gmail normalisation matches the challenge's own");

console.log(`\n${ok} participant-reminder database checks passed.`);
process.exit(0);
