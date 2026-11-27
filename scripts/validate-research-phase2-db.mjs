/**
 * Research Room phase 2 database validator (real migrations on local Postgres 17):
 *   node scripts/validate-research-phase2-db.mjs
 *
 * Covers: engagement events are logged the same way for every patient, only for the patient's own sessions, and cannot be changed or read through the API;
 * a blinded assessor can only be someone who is not a clinic admin or a patient, sees participants under codes with no arm or AI information, and can be
 * removed; outcomes can be stored as collected by the assessor; every history review records the time, and AI counts are required exactly when the
 * history was organised by the AI (decided by the database); reviews cannot be repeated or changed.
 */
import assert from "node:assert/strict";
import { createDb, callRpc, withRole } from "./rehabverse-local/db.mjs";

const db = await createDb();
let checks = 0;
const ok = (c, m) => { checks += 1; assert.ok(c, m); };
const eq = (a, b, m) => { checks += 1; assert.deepEqual(a, b, m); };
const sql = (text, params = []) => db.query(text, params).then((r) => r.rows);
const rpc = async (claims, fn, args) => (await callRpc(db, claims, fn, args)).value;
async function fails(claims, fn, args, pattern, message) {
  checks += 1;
  try { await callRpc(db, claims, fn, args); } catch (error) { assert.match(String(error.message), pattern, `${message} (got: ${error.message})`); return; }
  assert.fail(`${message}: expected an error matching ${pattern}`);
}
async function sqlFails(text, params, pattern, message) {
  checks += 1;
  try { await db.query(text, params); } catch (error) { assert.match(String(error.message), pattern, `${message} (got: ${error.message})`); return; }
  assert.fail(`${message}: expected an error`);
}
const rowsAs = (claims, text) => withRole(db, claims, (tx) => tx.query(text)).then((r) => r.rows);

async function makeUser(email, { admin = false } = {}) {
  const { rows } = await db.query("insert into auth.users (email) values ($1) returning id", [email]);
  const id = rows[0].id;
  if (admin) await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Dr Test', 'owner')", [id]);
  return { sub: id, email, role: "authenticated", aud: "authenticated" };
}
async function register(name, email) {
  const u = await makeUser(email);
  const r = await rpc(u, "rehab_register_patient", { p_payload: { full_name: name, age_years: 40, phone: "0300 1112223", consent: true, preferred_language: "en" } });
  return { claims: u, id: r.id };
}

const admin = await makeUser("doc2@example.com", { admin: true });
const stranger = await makeUser("nobody2@example.com");
const assessorUser = await makeUser("assessor@example.com");

/* ---------- a recruiting study with two participants ---------- */
const CONFIG = {
  regions: ["low_back"], age_min: 18, age_max: 65, min_nprs: 3, strata_cuts: [6],
  eligibility: [{ id: "lbp_4_weeks", kind: "include", en: "Low back pain 4 weeks or more", ru: "x" }, { id: "red_flag", kind: "exclude", en: "Any red flag", ru: "x" }],
  outcome_plan: [{ instrument: "rmdq24", version: 1, schedule: "standard" }, { instrument: "nprs", version: 1, schedule: "standard" }],
  primary: { instrument: "rmdq24", timepoint: "w12" }, target_per_arm: 0, notify: { en: "", ru: "" },
};
const LIST = [];
for (const [s, pattern] of [["3-5", ["ai", "no_ai", "no_ai", "ai"]], ["6-10", ["no_ai", "ai", "ai", "no_ai"]]]) for (let i = 1; i <= 4; i++) LIST.push({ stratum: s, position: i, arm: pattern[i - 1] });
await rpc(admin, "rehab_admin_study_save", { p_payload: { code: "RV-AI-02", title: "AI-assisted versus standard telerehabilitation", version: "1.0", config: CONFIG, ethics_ref: "ERC/2026/18", ethics_date: "2026-11-01", registry_id: null, consent_version: "C1" } });
await rpc(admin, "rehab_admin_study_load_sequence", { p_rows: LIST, p_source: "independent" });
await rpc(admin, "rehab_admin_study_set_status", { p_to: "recruiting" });
const CONSENT = { given: true, method: "in_person_written", version: "C1", obtained_at: new Date(Date.now() - 3600_000).toISOString() };
const enrol = (p, nprs) => rpc(admin, "rehab_admin_study_enrol", { p_patient_id: p.id, p_screen: { region: "low_back", nprs, answers: { lbp_4_weeks: true, red_flag: false } }, p_consent: CONSENT });
const pa = await register("Participant A", "pa@example.com");
const pb = await register("Participant B", "pb@example.com");
eq((await enrol(pa, 4)).arm, "ai", "participant A is in the AI arm");
eq((await enrol(pb, 4)).arm, "no_ai", "participant B is in the no-AI arm");

/* ---------- 1. engagement events: the same for both arms ---------- */
for (const p of [pa, pb]) {
  await rpc(p.claims, "rehab_log_engagement", { p_event: "day_opened", p_session_id: null, p_exercise: null, p_seconds: null });
  await rpc(p.claims, "rehab_log_engagement", { p_event: "exercise_opened", p_session_id: null, p_exercise: "pelvic-tilt", p_seconds: null });
  await rpc(p.claims, "rehab_log_engagement", { p_event: "exercise_done", p_session_id: null, p_exercise: "pelvic-tilt", p_seconds: 95 });
  await rpc(p.claims, "rehab_log_engagement", { p_event: "feedback_sent", p_session_id: null, p_exercise: null, p_seconds: null });
}
const summary = async (p) => rpc(admin, "rehab_admin_engagement", { p_patient_id: p.id });
const sa = await summary(pa), sb = await summary(pb);
eq([sa.days_opened, sa.exercises_done, sa.feedback_sent, sa.minutes], [1, 1, 1, 2], "the AI-arm participant's day is counted");
eq([sb.days_opened, sb.exercises_done, sb.feedback_sent, sb.minutes], [1, 1, 1, 2], "the no-AI participant's identical day is counted identically");
await fails(pa.claims, "rehab_log_engagement", { p_event: "hacked", p_session_id: null, p_exercise: null, p_seconds: null }, /unknown event/, "an unknown event is refused");
await fails(pa.claims, "rehab_log_engagement", { p_event: "day_opened", p_session_id: "11111111-1111-1111-1111-111111111111", p_exercise: null, p_seconds: null }, /session not found/, "another patient's or a made-up session is refused");
await fails(pa.claims, "rehab_log_engagement", { p_event: "exercise_done", p_session_id: null, p_exercise: "DROP TABLE", p_seconds: 10 }, /unknown exercise/, "a strange exercise name is refused");
await fails(pa.claims, "rehab_log_engagement", { p_event: "exercise_done", p_session_id: null, p_exercise: "pelvic-tilt", p_seconds: 99999 }, /out of range/, "an impossible time on task is refused");
await fails(stranger, "rehab_log_engagement", { p_event: "day_opened", p_session_id: null, p_exercise: null, p_seconds: null }, /patient profile required/, "only an active patient can log");
await fails(null, "rehab_log_engagement", { p_event: "day_opened", p_session_id: null, p_exercise: null, p_seconds: null }, /permission denied|not authorised/, "anonymous cannot log");
await fails(stranger, "rehab_admin_engagement", { p_patient_id: pa.id }, /not authorised/, "only staff read the engagement summary");
await sqlFails("update public.rehab_engagement_events set seconds = 1", [], /cannot be changed/, "engagement events cannot be changed");
await sqlFails("delete from public.rehab_engagement_events", [], /cannot be changed/, "engagement events cannot be removed");

/* ---------- 2. the blinded assessor ---------- */
await fails(admin, "rehab_admin_study_set_assessor", { p_email: "doc2@example.com", p_active: true }, /admin cannot be the blinded assessor/, "a clinic admin cannot be an assessor");
await fails(admin, "rehab_admin_study_set_assessor", { p_email: "pa@example.com", p_active: true }, /patient account cannot be an assessor/, "a patient cannot be an assessor");
await fails(admin, "rehab_admin_study_set_assessor", { p_email: "missing@example.com", p_active: true }, /no account with that e-mail/, "an unknown e-mail is refused");
await fails(stranger, "rehab_admin_study_set_assessor", { p_email: "assessor@example.com", p_active: true }, /not authorised/, "only staff can name an assessor");
await fails(assessorUser, "rehab_assessor_queue", {}, /not authorised/, "nobody is an assessor until named");
await rpc(admin, "rehab_admin_study_set_assessor", { p_email: "Assessor@Example.com", p_active: true });
eq((await rpc(admin, "rehab_admin_study_assessors", {})).map((a) => [a.email, a.active]), [["assessor@example.com", true]], "the assessor is listed for staff");
const queue = await rpc(assessorUser, "rehab_assessor_queue", {});
eq(queue.participants.map((p) => [p.code, p.full_name]), [["P001", "Participant A"], ["P002", "Participant B"]], "participants appear under codes in order of enrolment");
const text = JSON.stringify(queue);
for (const leak of ["\"arm\"", "no_ai", "ai_assist", "stratum", "sequence", "\"ai\""]) ok(!text.includes(leak), `the assessor's list never contains ${leak}`);
ok(queue.participants.every((p) => Array.isArray(p.plan) && p.plan.length === 2), "the assessor sees each participant's outcome plan");
const planA = await rpc(assessorUser, "rehab_assessor_plan", { p_patient_id: pa.id });
ok(planA.plan_id && !JSON.stringify(planA).includes("no_ai") && !JSON.stringify(planA).includes("\"arm\""), "the plan call gives the plan and nothing about the arm");
const outsider = await register("Not In Study", "out@example.com");
await fails(assessorUser, "rehab_assessor_plan", { p_patient_id: outsider.id }, /not a study participant/, "the assessor cannot open anyone outside the study");
await fails(admin, "rehab_assessor_queue", {}, /not authorised/, "an admin (who can see arms) is not treated as the assessor");
await fails(stranger, "rehab_assessor_queue", {}, /not authorised/, "a stranger cannot open the assessor list");
for (const t of ["rehab_engagement_events", "rehab_study_assessors", "rehab_history_reviews"]) {
  for (const who of [admin, assessorUser, pa.claims, null]) {
    checks += 1;
    let blocked = false;
    try { await rowsAs(who, `select * from public.${t}`); } catch { blocked = true; }
    assert.ok(blocked, `${t}: the API roles cannot read the table (${who ? who.email ?? "patient" : "anon"})`);
  }
}
// an outcome collected by the assessor is stored as such (the server saves it with the service role after scoring)
const saveAs = (who) => sql("select public.rehab_outcome_save($1, $2, 'nprs', 1, 'w2', $3::jsonb, $4::jsonb, 'en', $5) as r",
  [pa.id, planA.plan_id, JSON.stringify({ now: 4, avg7: 4, worst7: 6, best7: 2 }), JSON.stringify({ total: 4 }), who]).then((r) => r[0].r);
ok((await saveAs("assessor")).saved === true, "an assessor-collected outcome is saved");
eq((await sql("select collected_by from public.rehab_outcome_responses where patient_id = $1 and timepoint = 'w2'", [pa.id]))[0].collected_by, "assessor", "it is marked as collected by the assessor");
await sqlFails("select public.rehab_outcome_save($1, $2, 'nprs', 1, 'w6', '{}'::jsonb, '{}'::jsonb, 'en', 'robot')", [pa.id, planA.plan_id], /collected_by_check/, "an unknown collector is refused");
const q2 = await rpc(assessorUser, "rehab_assessor_queue", {});
eq(q2.participants[0].recorded.map((r) => [r.instrument, r.timepoint, r.collected_by]), [["nprs", "w2", "assessor"]], "the assessor sees what is already recorded");
await rpc(admin, "rehab_admin_study_set_assessor", { p_email: "assessor@example.com", p_active: false });
await fails(assessorUser, "rehab_assessor_queue", {}, /not authorised/, "a removed assessor loses access at once");
await rpc(admin, "rehab_admin_study_set_assessor", { p_email: "assessor@example.com", p_active: true });
await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Now Staff', 'admin') on conflict (id) do update set role = 'admin'", [assessorUser.sub]);
await fails(assessorUser, "rehab_assessor_queue", {}, /not authorised/, "an assessor who later becomes an admin is no longer treated as blinded");
await db.query("delete from public.profiles where id = $1", [assessorUser.sub]);

/* ---------- 3. history reviews ---------- */
const submit = (p, token) => rpc(p.claims, "rehab_submit_assessment", { p_payload: { client_token: token, regions: ["lumbar"], symptoms: ["pain"], pain_now: 4, red_flags: [] } });
const asA = await submit(pa, "22222222-2222-2222-2222-222222222222");
const asB = await submit(pb, "33333333-3333-3333-3333-333333333333");
const conv = (await sql("select public.rehab_ai_open_conversation($1, 'intake', 'en', 'ai-v1', 'Hello') as r", [pa.id]))[0].r;
await sql("select public.rehab_ai_link_conversation($1, $2, $3)", [pa.id, conv.id, asA.id]);
await fails(admin, "rehab_admin_history_review", { p_assessment_id: asA.id, p_seconds: 240, p_omissions: null, p_errors: null, p_invented: null, p_note: null }, /count the omissions/, "an AI history needs the three counts");
await fails(admin, "rehab_admin_history_review", { p_assessment_id: asB.id, p_seconds: 300, p_omissions: 0, p_errors: 0, p_invented: 0, p_note: null }, /not organised by the AI/, "a standard-form history cannot be given AI counts");
await fails(admin, "rehab_admin_history_review", { p_assessment_id: asB.id, p_seconds: 0, p_omissions: null, p_errors: null, p_invented: null, p_note: null }, /review time out of range/, "a review needs its time");
await fails(stranger, "rehab_admin_history_review", { p_assessment_id: asB.id, p_seconds: 60, p_omissions: null, p_errors: null, p_invented: null, p_note: null }, /not authorised/, "only staff record a review");
eq((await rpc(admin, "rehab_admin_history_review", { p_assessment_id: asA.id, p_seconds: 240, p_omissions: 1, p_errors: 0, p_invented: 0, p_note: "missed night pain" })).ai_organised, true, "the AI history review is stored as AI-organised");
eq((await rpc(admin, "rehab_admin_history_review", { p_assessment_id: asB.id, p_seconds: 300, p_omissions: null, p_errors: null, p_invented: null, p_note: null })).ai_organised, false, "the standard history review stores the time only");
await fails(admin, "rehab_admin_history_review", { p_assessment_id: asA.id, p_seconds: 100, p_omissions: 0, p_errors: 0, p_invented: 0, p_note: null }, /already been reviewed/, "a history is reviewed once");
await sqlFails("update public.rehab_history_reviews set errors = 5", [], /cannot be changed/, "a review cannot be changed");
eq((await rpc(admin, "rehab_admin_history_reviews", { p_patient_id: pa.id })).map((r) => [r.review_seconds, r.omissions, r.errors, r.invented]), [[240, 1, 0, 0]], "staff can read the reviews");
ok((await sql("select count(*)::int as n from public.rehab_audit_log where action = 'history.reviewed'"))[0].n === 2, "reviews are in the audit log");

console.log(`Research Room phase 2 database: ${checks} checks passed (symmetric engagement events, blinded assessor, history reviews, append-only records).`);
await db.close?.();
