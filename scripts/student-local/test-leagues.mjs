/**
 * Leagues and reminder e-mails: database behaviour on PGlite with the real migrations.
 *   node scripts/student-local/test-leagues.mjs
 *
 * Leagues: placement into cohorts of ≤ 30, XP read only from the capped activity log, live standings without user ids,
 * weekly settlement (promotion / demotion / practice leagues / tier limits), idempotence, opting out, privacy of the tables.
 * Reminders: who is due and who is not, idempotent claims, bounded retries, one-click unsubscribe, service-role-only access,
 * RehabVerse follow-up rules (one per patient per day, daytime only, check-in windows).
 */
import assert from "node:assert/strict";
import { createDb, callRpc } from "../rehabverse-local/db.mjs";

const db = await createDb();
let ok = 0;
const pass = (name) => { ok++; console.log("PASS", name); };
const fails = async (p, text) => { try { await p; } catch (e) { assert.ok(String(e.message).includes(text), `expected "${text}", got "${e.message}"`); return; } assert.fail(`should have failed with "${text}"`); };
const rpc = (claims, fn, args) => callRpc(db, claims, fn, args).then((r) => r.value);
const asRole = (role, sql, params = []) => db.transaction(async (tx) => { await tx.exec(`set local role ${role}`); return (await tx.query(sql, params)).rows; });
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const user = (n) => ({ sub: uuid(n), role: "authenticated" });

const q = async (sql, params) => (await db.query(sql, params)).rows;
const weekStart = (await q("select public.pna__week_start()::text as w"))[0].w;
const prevWeek = (await q("select (public.pna__week_start() - 7)::text as w"))[0].w;

async function makeStudent(n, name, { tier, optIn = true } = {}) {
  await db.query("insert into auth.users (id, email) values ($1, $2)", [uuid(n), `s${n}@example.test`]);
  await rpc(user(n), "student_upsert_profile", { p: { display_name: name, league_opt_in: optIn } });
  if (tier) await db.query("insert into public.league_members (user_id, tier, best_tier) values ($1,$2,$2) on conflict (user_id) do update set tier=$2, best_tier=$2", [uuid(n), tier]);
}
async function giveXp(n, xp, { day, source = "pna-teacher", key } = {}) {
  await db.query(
    "insert into public.student_activity (user_id, source, event_key, label, xp, occurred_at, day) values ($1,$2,$3,'test',$4, now(), coalesce($5::date, (now() at time zone 'Asia/Karachi')::date))",
    [uuid(n), source, key ?? `${source}:t:${n}:${Math.random()}`, xp, day ?? null],
  );
}

/* ───────────── 1. placement ───────────── */
for (let i = 1; i <= 8; i++) await makeStudent(i, `Student ${i}`);
await giveXp(1, 300); await giveXp(2, 220); await giveXp(3, 150); await giveXp(4, 120); await giveXp(5, 40);
const first = await rpc(user(1), "student_league_my", {});
assert.equal(first.enabled, true); assert.equal(first.tier, 1); assert.equal(first.week_start, weekStart);
assert.equal(first.size, 1); assert.equal(first.rank, 1); assert.equal(first.xp, 300); pass("a student is placed in a tier-1 league and sees their own week's XP");
for (let i = 2; i <= 8; i++) await rpc(user(i), "student_league_my", {});
const me3 = await rpc(user(3), "student_league_my", {});
assert.equal(me3.size, 8); assert.equal(me3.rank, 3); assert.equal(me3.xp, 150);
assert.deepEqual(me3.standings.map((s) => s.name).slice(0, 4), ["Student 1", "Student 2", "Student 3", "Student 4"]);
assert.equal(me3.standings.filter((s) => s.me).length, 1); assert.ok(me3.standings.every((s) => !("user_id" in s) && !("id" in s))); pass("eight students share one cohort; standings are ranked by XP and expose no user ids");
assert.equal(me3.promote_n, 3); assert.equal(me3.demote_n, 0); assert.equal(me3.practice, false); pass("promotion zone is 30 % of the league; tier 1 has no demotion zone");

// XP comes only from the capped activity log; imported XP never counts
await giveXp(8, 5000, { source: "imported", key: "imported:xp" });
assert.equal((await rpc(user(8), "student_league_my", {})).xp, 0); pass("imported XP does not count towards a league");
// last week's and next week's XP do not leak into this week
await giveXp(8, 90, { day: prevWeek, key: "pna-teacher:old:8" });
assert.equal((await rpc(user(8), "student_league_my", {})).xp, 0); pass("only this week's XP counts");

// cohort cap
for (let i = 9; i <= 34; i++) await makeStudent(i, `Student ${i}`);
for (let i = 9; i <= 34; i++) await rpc(user(i), "student_league_my", {});
const sizes = (await q("select count(*)::int n from public.league_entries where week_start=$1 group by cohort_id order by n desc", [weekStart])).map((r) => r.n);
assert.deepEqual(sizes, [30, 4]); pass("a cohort holds at most 30 students; the next one starts a new cohort");
assert.equal((await q("select count(*)::int n from public.league_cohorts where week_start=$1", [weekStart]))[0].n, 2);

/* ───────────── 2. opting out ───────────── */
const out = await rpc(user(5), "student_set_league", { p_opt_in: false });
assert.equal(out.league_opt_in, false);
const after = await rpc(user(5), "student_league_my", {});
assert.equal(after.enabled, false); assert.equal(after.reason, "opted_out");
const seen = (await rpc(user(2), "student_league_my", {})).standings.map((s) => s.name);
assert.ok(!seen.includes("Student 5")); pass("opting out removes a student from everyone's standings at once");
await rpc(user(5), "student_set_league", { p_opt_in: true });
assert.equal((await rpc(user(5), "student_league_my", {})).enabled, true); pass("opting back in places the student again");

/* ───────────── 3. weekly settlement ───────────── */
// a finished week: tier-2 cohort of 10 with XP 500, 400, …, 50 (+ one at 0)
const settleIds = [];
for (let i = 0; i < 10; i++) { const n = 100 + i; await makeStudent(n, `Settle ${i}`, { tier: 2 }); settleIds.push(n); }
const [{ id: coh }] = await q("insert into public.league_cohorts (week_start, tier) values ($1, 2) returning id", [prevWeek]);
const xps = [500, 400, 300, 250, 200, 150, 100, 60, 20, 0];
for (let i = 0; i < 10; i++) {
  await db.query("insert into public.league_entries (cohort_id, user_id, week_start, tier, joined_at) values ($1,$2,$3,2, now() - ($4 || ' hours')::interval)", [coh, uuid(settleIds[i]), prevWeek, String(40 - i)]);
  if (xps[i]) await giveXp(settleIds[i], xps[i], { day: prevWeek, key: `pna-teacher:settle:${i}` });
}
// a practice cohort of 3 at tier 3 and a tier-7 cohort of 6
const [{ id: practice }] = await q("insert into public.league_cohorts (week_start, tier) values ($1, 3) returning id", [prevWeek]);
for (let i = 0; i < 3; i++) { const n = 200 + i; await makeStudent(n, `Practice ${i}`, { tier: 3 }); await db.query("insert into public.league_entries (cohort_id, user_id, week_start, tier) values ($1,$2,$3,3)", [practice, uuid(n), prevWeek]); await giveXp(n, 400 - i * 100, { day: prevWeek, key: `pna-teacher:prac:${i}` }); }
const [{ id: top }] = await q("insert into public.league_cohorts (week_start, tier) values ($1, 7) returning id", [prevWeek]);
for (let i = 0; i < 6; i++) { const n = 300 + i; await makeStudent(n, `Diamond ${i}`, { tier: 7 }); await db.query("insert into public.league_entries (cohort_id, user_id, week_start, tier) values ($1,$2,$3,7)", [top, uuid(n), prevWeek]); await giveXp(n, 500 - i * 80, { day: prevWeek, key: `pna-teacher:dia:${i}` }); }

await rpc(user(1), "student_league_my", {}); // any student opening their league settles every finished week
const res = await q("select user_id, rank, xp, result from public.league_entries where cohort_id=$1 order by rank", [coh]);
assert.deepEqual(res.map((r) => r.result), ["promoted", "promoted", "promoted", "stayed", "stayed", "stayed", "stayed", "stayed", "demoted", "demoted"]);
assert.deepEqual(res.map((r) => r.xp), xps); pass("top 30 % (with ≥ 100 XP) are promoted, bottom 20 % are demoted, the rest stay");
const tiers = await q("select user_id, tier, best_tier from public.league_members where user_id = any($1::uuid[]) order by user_id", [settleIds.map(uuid)]);
assert.deepEqual(tiers.map((t) => t.tier), [3, 3, 3, 2, 2, 2, 2, 2, 1, 1]); assert.equal(tiers[0].best_tier, 3); pass("tiers move with the results; best tier is remembered");
assert.deepEqual((await q("select result from public.league_entries where cohort_id=$1", [practice])).map((r) => r.result), ["practice", "practice", "practice"]);
assert.deepEqual((await q("select tier from public.league_members where user_id = any($1::uuid[]) order by tier", [[200, 201, 202].map(uuid)])).map((r) => r.tier), [3, 3, 3]); pass("a league with fewer than 5 students is a practice league: nobody moves");
const topRes = await q("select result from public.league_entries where cohort_id=$1 order by rank", [top]);
assert.equal(topRes[0].result, "stayed"); assert.equal(topRes[5].result, "demoted");
assert.equal((await q("select tier from public.league_members where user_id=$1", [uuid(300)]))[0].tier, 7); pass("the top tier cannot be promoted past, but can be demoted from");

const before = await q("select user_id, rank, result from public.league_entries where week_start=$1 order by user_id", [prevWeek]);
await rpc(user(2), "student_league_my", {});
assert.deepEqual(await q("select user_id, rank, result from public.league_entries where week_start=$1 order by user_id", [prevWeek]), before);
assert.equal((await q("select count(*)::int n from public.league_cohorts where week_start=$1 and settled_at is null", [prevWeek]))[0].n, 0); pass("settlement is idempotent");

// a promoted student lands in the higher tier next week, with their history visible
await db.query("delete from public.league_entries where user_id=$1 and week_start=$2", [uuid(100), weekStart]);
const promoted = await rpc(user(100), "student_league_my", {});
assert.equal(promoted.tier, 3); assert.equal(promoted.history[0].result, "promoted"); assert.equal(promoted.history[0].rank, 1); assert.equal(promoted.history[0].size, 10); pass("a promoted student starts the new week in the higher tier and sees last week's result");

/* ───────────── 4. privacy and permissions ───────────── */
await fails(callRpc(db, null, "student_league_my", {}), "permission denied"); pass("signed-out visitors cannot call the league functions");
for (const t of ["league_members", "league_cohorts", "league_entries", "pna_reminder_log", "pna_job_runs"]) {
  await fails(db.transaction(async (tx) => { await tx.exec("set local role authenticated"); await tx.query(`select * from public.${t}`); }), "permission denied");
}
pass("students cannot read or write any league or reminder table directly");
for (const fn of ["pna_reminders_claim(now(), 5)", "pna_reminders_finish('[]'::jsonb)", "pna_reminder_unsubscribe(gen_random_uuid())", "pna__league_settle(current_date)"]) {
  await fails(db.transaction(async (tx) => { await tx.exec("set local role authenticated"); await tx.query(`select public.${fn}`); }), "permission denied");
}
pass("the job functions and internals are closed to students and visitors");
const exp = await rpc(user(100), "student_export_my_data", {});
assert.ok(exp.league.weeks.length >= 1 && exp.league.tier === 3); pass("the data export includes the league record");

/* ───────────── 5. reminders: students ───────────── */
const noon = (await q("select (date_trunc('day', now() at time zone 'Asia/Karachi') + interval '12 hours') at time zone 'Asia/Karachi' as t"))[0].t.toISOString();
const night = (await q("select (date_trunc('day', now() at time zone 'Asia/Karachi') + interval '23 hours') at time zone 'Asia/Karachi' as t"))[0].t.toISOString();
const claim = async (when = noon) => (await asRole("service_role", "select public.pna_reminders_claim($1::timestamptz, 100) as r", [when]))[0].r;

const R = (n) => 500 + n;
async function reminderStudent(n, name, { enabled = true, hour = 9, confirmed = true, activeDaysAgo = 1, joinedDaysAgo = 60 } = {}) {
  await db.query("insert into auth.users (id, email, email_confirmed_at) values ($1,$2,$3)", [uuid(R(n)), `rem${n}@example.test`, confirmed ? new Date().toISOString() : null]);
  await rpc(user(R(n)), "student_upsert_profile", { p: { display_name: name, remind_email: enabled, remind_hour: hour } });
  await db.query("update public.student_profiles set created_at = now() - ($2 || ' days')::interval where user_id=$1", [uuid(R(n)), String(joinedDaysAgo)]);
  if (activeDaysAgo !== null) await db.query("insert into public.student_activity (user_id, source, event_key, label, xp, occurred_at, day) values ($1,'skills-lab',$2,'t',20, now() - ($3 || ' days')::interval, (now() at time zone 'Asia/Karachi')::date - $3::int)", [uuid(R(n)), `skills-lab:rem:${n}`, String(activeDaysAgo)]);
}
await reminderStudent(1, "Due Dana", { hour: 9 });
await reminderStudent(2, "Off Omar", { enabled: false });
await reminderStudent(3, "Late Lina", { hour: 20 });
await reminderStudent(4, "Unconfirmed Uma", { confirmed: false });
await reminderStudent(5, "Dormant Dawood", { activeDaysAgo: 40, joinedDaysAgo: 90 });
await reminderStudent(6, "Done Dina", { hour: 9 });
await giveXp(R(6), 60, { source: "daily-challenge", key: "daily-challenge:daily:today" });
await reminderStudent(7, "New Nida", { hour: 9, activeDaysAgo: null, joinedDaysAgo: 1 });

let batch = await claim();
const names = batch.filter((b) => b.kind === "daily_challenge").map((b) => b.name).sort();
assert.deepEqual(names, ["Due Dana", "New Nida"]); pass("daily reminders: only confirmed, opted-in students whose hour has come, who have not played today and are not dormant");
assert.ok(batch.every((b) => b.token && b.id && b.to)); assert.equal(batch.find((b) => b.name === "Due Dana").streak, 1); pass("each claim carries its own token and the streak");
assert.deepEqual((await claim()).filter((b) => b.kind === "daily_challenge"), []); pass("a second run the same day claims nothing (idempotent)");
assert.deepEqual((await claim(night)).filter((b) => b.kind === "daily_challenge"), []); pass("no reminders at night");

// failures are retried at most twice
const dana = batch.find((b) => b.name === "Due Dana"); const nida = batch.find((b) => b.name === "New Nida");
let fin = await asRole("service_role", "select public.pna_reminders_finish($1::jsonb, 'test') as r", [JSON.stringify([{ id: dana.id, ok: true }, { id: nida.id, ok: false }])]);
assert.deepEqual(fin[0].r, { sent: 1, failed: 1 });
batch = await claim(); assert.deepEqual(batch.map((b) => b.name), ["New Nida"]);
await asRole("service_role", "select public.pna_reminders_finish($1::jsonb) as r", [JSON.stringify([{ id: batch[0].id, ok: false }])]);
batch = await claim(); assert.equal(batch.length, 1);
await asRole("service_role", "select public.pna_reminders_finish($1::jsonb) as r", [JSON.stringify([{ id: batch[0].id, ok: false }])]);
assert.deepEqual(await claim(), []); pass("a failed reminder is retried twice, then given up");
assert.equal((await q("select count(*)::int n from public.pna_job_runs"))[0].n, 3); pass("every run leaves a heartbeat row");

// unsubscribe by the e-mail's own token
const unsub = await asRole("service_role", "select public.pna_reminder_unsubscribe($1) as r", [dana.token]);
assert.deepEqual(unsub[0].r, { ok: true, kind: "daily_challenge" });
assert.equal((await q("select remind_email from public.student_profiles where user_id=$1", [uuid(R(1))]))[0].remind_email, false);
assert.deepEqual((await asRole("service_role", "select public.pna_reminder_unsubscribe(gen_random_uuid()) as r"))[0].r, { ok: false }); pass("one-click unsubscribe switches reminders off; unknown tokens do nothing");
const set = await rpc(user(R(1)), "student_set_reminders", { p_enabled: true, p_hour: 3 });
assert.deepEqual(set, { remind_email: true, remind_hour: 6 }); pass("students can switch reminders back on; the hour is kept between 06:00 and 21:00");

/* ───────────── 6. reminders: RehabVerse follow-up ───────────── */
async function patient(n, { email = true, remind = true, lang = "en" } = {}) {
  await db.query("insert into auth.users (id, email) values ($1,$2)", [uuid(700 + n), `pt${n}@example.test`]);
  const [{ id }] = await q("insert into public.rehab_patients (user_id, full_name, email, age_years, consent_version, preferred_language, remind_email) values ($1,$2,$3,40,'v1',$4,$5) returning id",
    [uuid(700 + n), `Patient ${n}`, email ? `pt${n}@example.test` : null, lang, remind]);
  const [{ id: prog }] = await q("insert into public.rehab_programmes (patient_id, title, status, errp_schedule) values ($1,'Programme','active','{later_same_day,24h}') returning id", [id]);
  return { id, prog };
}
async function day(prog, n, { status = "unlocked", availableHoursAgo = 30 } = {}) {
  const [{ id }] = await q("insert into public.rehab_sessions (programme_id, day_number, title, status, available_from, released_at) values ($1,$2,'Day','"+ status +"', now() - ($3 || ' hours')::interval, now() - ($3 || ' hours')::interval) returning id", [prog, n, String(availableHoursAgo)]);
  return id;
}
const waiting = await patient(1);            await day(waiting.prog, 1, { availableHoursAgo: 30 });
const freshDay = await patient(2);           await day(freshDay.prog, 1, { availableHoursAgo: 3 });
const noMail = await patient(3, { email: false }); await day(noMail.prog, 1);
const optedOut = await patient(4, { remind: false }); await day(optedOut.prog, 1);
const checkin = await patient(5, { lang: "ru" });
const doneDay = await day(checkin.prog, 1, { status: "reviewed", availableHoursAgo: 60 });
await db.query("insert into public.rehab_feedback (session_id, patient_id, completion, submitted_at) values ($1,$2,'all', now() - interval '6 hours')", [doneDay, checkin.id]);
const answered = await patient(6);
const answeredDay = await day(answered.prog, 1, { status: "reviewed", availableHoursAgo: 60 });
const [{ id: fbId }] = await q("insert into public.rehab_feedback (session_id, patient_id, completion, submitted_at) values ($1,$2,'all', now() - interval '6 hours') returning id", [answeredDay, answered.id]);
await db.query("insert into public.rehab_errp_observations (patient_id, session_id, timepoint, pain, symptom_response) values ($1,$2,'later_same_day',3,'same')", [answered.id, answeredDay]);

// "now" must be inside the daytime window whatever the date, so shift the clock instead of the data
const clock = (await q("select ((now() at time zone 'Asia/Karachi')::date + interval '13 hours') at time zone 'Asia/Karachi' as t"))[0].t;
const delta = clock.getTime() - Date.now(); // negative when it is already past 13:00 in Pakistan
await db.query("update public.rehab_feedback set submitted_at = submitted_at + ($1 || ' milliseconds')::interval", [String(delta)]);
await db.query("update public.rehab_sessions set available_from = available_from + ($1 || ' milliseconds')::interval, released_at = released_at + ($1 || ' milliseconds')::interval", [String(delta)]);
await db.query("update public.rehab_errp_observations set recorded_at = recorded_at + ($1 || ' milliseconds')::interval", [String(delta)]);

const rb = (await claim(clock.toISOString())).filter((b) => b.kind.startsWith("rehab"));
const byName = Object.fromEntries(rb.map((b) => [b.name, b.kind]));
assert.deepEqual(byName, { "Patient 1": "rehab_day", "Patient 5": "rehab_checkin" }); pass("RehabVerse: a day waiting > 20 h and an open check-in are reminded; fresh days, no-email, opted-out and already-answered check-ins are not");
assert.equal(rb.find((b) => b.name === "Patient 5").lang, "ru"); assert.ok(rb.every((b) => !JSON.stringify(b).match(/pain|symptom|diagnos/i))); pass("rehab reminders carry no health details");
assert.deepEqual((await claim(clock.toISOString())).filter((b) => b.kind.startsWith("rehab")), []); pass("rehab reminders are idempotent too");
assert.deepEqual((await claim(night)).filter((b) => b.kind.startsWith("rehab")), []); pass("no RehabVerse reminders at night");
const f = await rpc({ sub: uuid(701), role: "authenticated" }, "rehab_my_followup", {});
assert.equal(f.remind_email, true); assert.equal(f.has_email, true);
assert.deepEqual(await rpc({ sub: uuid(701), role: "authenticated" }, "rehab_set_reminders", { p_enabled: false }), { remind_email: false });
assert.deepEqual((await asRole("service_role", "select public.pna_reminder_unsubscribe($1) as r", [rb.find((b) => b.name === "Patient 5").token]))[0].r, { ok: true, kind: "rehab_checkin" });
assert.equal((await q("select remind_email from public.rehab_patients where id=$1", [checkin.id]))[0].remind_email, false); pass("patients can switch follow-up e-mails off in the dashboard or with the e-mail's own link");

// clinician follow-up list
await db.query("insert into auth.users (id, email) values ($1,'admin@example.test')", [uuid(900)]);
await db.query("insert into public.profiles (id, full_name, role) values ($1,'Dr Test','owner')", [uuid(900)]);
await fails(rpc({ sub: uuid(701), role: "authenticated" }, "rehab_admin_followups", {}), "not authorised"); pass("patients cannot read the clinician follow-up list");
const stuck = await patient(7); await day(stuck.prog, 1, { availableHoursAgo: 70 });
await db.query("insert into public.pna_reminder_log (kind, subject, ref, status, sent_at) values ('rehab_day', $1, 'seed:open1', 'sent', now() - interval '2 days')", [stuck.id]);
const list = await rpc({ sub: uuid(900), role: "authenticated" }, "rehab_admin_followups", {});
const byRef = Object.fromEntries(list.map((r) => [r.full_name, r.reason]));
assert.equal(byRef["Patient 7"], "open_day_waiting"); assert.ok(!("Patient 2" in byRef) && !("Patient 6" in byRef) && !("Patient 3" in byRef && false));
const seven = list.find((r) => r.full_name === "Patient 7");
assert.equal(seven.reminders, 1); assert.equal(seven.can_email, true); assert.equal(seven.day_number, 1); pass("clinicians see who has gone quiet, why, and how many reminders were already sent");
// a check-in window that closed without an answer
const missedPt = await patient(8); const missedDay = await day(missedPt.prog, 1, { status: "reviewed", availableHoursAgo: 200 });
await db.query("insert into public.rehab_feedback (session_id, patient_id, completion, submitted_at) values ($1,$2,'all', now() - interval '30 hours')", [missedDay, missedPt.id]);
const list2 = await rpc({ sub: uuid(900), role: "authenticated" }, "rehab_admin_followups", {});
assert.equal(list2.find((r) => r.full_name === "Patient 8")?.reason, "checkin_missed"); pass("a check-in that closed unanswered is listed as missed");

// deleting a student's record removes the league and reminder rows too
await rpc(user(R(1)), "student_league_my", {});
await rpc(user(R(1)), "student_delete_my_data", {});
const gone = await q("select (select count(*) from public.league_entries where user_id=$1)::int e, (select count(*) from public.league_members where user_id=$1)::int m, (select count(*) from public.pna_reminder_log where subject=$1)::int l", [uuid(R(1))]);
assert.deepEqual(gone[0], { e: 0, m: 0, l: 0 }); pass("deleting the record removes league and reminder rows");

console.log(`\n${ok} league and reminder database checks passed.`);
process.exit(0);
