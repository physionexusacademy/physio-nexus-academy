/**
 * Research Room phase 3 database validator (real migrations on local Postgres 17):
 *   node scripts/validate-research-phase3-db.mjs
 *
 * Covers: safety reports (seriousness, relatedness, expectedness, outcome, the reporting deadline of 7 or 15 days, follow-up versions that keep the first
 * awareness time, the safety-review alarm and notice), protocol deviations, and the monitoring summary (flow, follow-up completeness of the primary
 * outcome by arm without any score, baseline balance, discontinuations, deviations, safety counts); staff only; records cannot be changed.
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
async function sqlFails(text, pattern, message) {
  checks += 1;
  try { await db.query(text); } catch (error) { assert.match(String(error.message), pattern, `${message} (got: ${error.message})`); return; }
  assert.fail(`${message}: expected an error`);
}
const rowsAs = (claims, text) => withRole(db, claims, (tx) => tx.query(text)).then((r) => r.rows);
async function makeUser(email, { admin = false } = {}) {
  const { rows } = await db.query("insert into auth.users (email) values ($1) returning id", [email]);
  if (admin) await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Dr Test', 'owner')", [rows[0].id]);
  return { sub: rows[0].id, email, role: "authenticated", aud: "authenticated" };
}
async function register(name, email, sex) {
  const u = await makeUser(email);
  const r = await rpc(u, "rehab_register_patient", { p_payload: { full_name: name, age_years: 40, sex, phone: "0300 1112223", consent: true, preferred_language: "en" } });
  return { claims: u, id: r.id };
}

const admin = await makeUser("doc3@example.com", { admin: true });
const stranger = await makeUser("nobody3@example.com");
eq(await rpc(admin, "rehab_admin_study_monitor", {}), { study: null }, "no study, no monitoring");

/* ---------- a recruiting study with four participants ---------- */
const CONFIG = {
  regions: ["low_back"], age_min: 18, age_max: 65, min_nprs: 3, strata_cuts: [6], safety_review_after: 2,
  eligibility: [{ id: "lbp_4_weeks", kind: "include", en: "Low back pain 4 weeks or more", ru: "x" }],
  outcome_plan: [{ instrument: "rmdq24", version: 1, schedule: "standard" }],
  primary: { instrument: "rmdq24", timepoint: "w12" }, target_per_arm: 30, notify: { en: "", ru: "" },
};
const LIST = [];
for (const [s, pattern] of [["3-5", ["ai", "no_ai", "no_ai", "ai"]], ["6-10", ["no_ai", "ai", "ai", "no_ai"]]]) for (let i = 1; i <= 4; i++) LIST.push({ stratum: s, position: i, arm: pattern[i - 1] });
await rpc(admin, "rehab_admin_study_save", { p_payload: { code: "RV-AI-03", title: "AI-assisted versus standard telerehabilitation", version: "1.0", config: CONFIG, ethics_ref: "ERC/2026/19", ethics_date: "2026-11-01", registry_id: null, consent_version: "C1" } });
await rpc(admin, "rehab_admin_study_load_sequence", { p_rows: LIST, p_source: "independent" });
await rpc(admin, "rehab_admin_study_set_status", { p_to: "recruiting" });
const CONSENT = { given: true, method: "in_person_written", version: "C1", obtained_at: new Date(Date.now() - 3600_000).toISOString() };
const enrol = (p, nprs) => rpc(admin, "rehab_admin_study_enrol", { p_patient_id: p.id, p_screen: { region: "low_back", nprs, answers: { lbp_4_weeks: true } }, p_consent: CONSENT });
const p1 = await register("One", "m1@example.com", "female"), p2 = await register("Two", "m2@example.com", "male");
const p3 = await register("Three", "m3@example.com", "female"), p4 = await register("Four", "m4@example.com", "male");
const arms = [(await enrol(p1, 4)).arm, (await enrol(p2, 4)).arm, (await enrol(p3, 7)).arm, (await enrol(p4, 7)).arm];
eq(arms, ["ai", "no_ai", "no_ai", "ai"], "four participants, two per arm");
// move the enrolment 100 days back so every time point is due and week 12 is two weeks late
await sql("alter table public.rehab_study_allocations disable trigger rehab_study_allocations_append_only");
await sql("update public.rehab_study_allocations set allocated_at = now() - interval '100 days'");
await sql("alter table public.rehab_study_allocations enable trigger rehab_study_allocations_append_only");

/* ---------- 1. safety reports ---------- */
const ev = async (p, severity = "severe") => rpc(admin, "rehab_admin_log_adverse_event", { p_patient_id: p.id, p_session_id: null, p_severity: severity, p_description: "Fell at home after the exercises", p_action_taken: null });
const e1 = await ev(p1);
const today = new Date().toISOString().slice(0, 10);
const aware = new Date(Date.now() - 2 * 86400_000).toISOString();
const R = (over = {}) => ({ criteria: ["hospitalisation"], relatedness: "possible", expectedness: "unexpected", outcome: "recovering", onset_date: new Date(Date.now() - 3 * 86400_000).toISOString().slice(0, 10), aware_at: aware, ...over });
await fails(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R({ relatedness: null }) }, /how related/, "relatedness is required");
await fails(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R({ expectedness: "maybe" }) }, /expected/, "expectedness is required");
await fails(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R({ outcome: "fatal" }) }, /fatal outcome must be marked serious/, "a fatal outcome needs the death criterion");
await fails(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R({ criteria: ["bad"] }) }, /unknown value in criteria/, "an unknown criterion is refused");
await fails(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R({ onset_date: "2999-01-01" }) }, /cannot begin after/, "onset after awareness is refused");
await fails(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R({ aware_at: "2999-01-01T00:00:00Z" }) }, /in the future/, "a future awareness time is refused");
await fails(stranger, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R() }, /not authorised/, "only staff report safety");
const v1 = await rpc(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R() });
eq([v1.version, v1.serious], [1, true], "the first report is version 1 and serious");
const due1 = new Date(v1.report_due_at).getTime() - new Date(aware).getTime();
eq(Math.round(due1 / 86400_000), 15, "a serious event that is not fatal or life-threatening is due in 15 days");
ok((await sql("select count(*)::int as n from public.rehab_notifications where kind = 'safety_review' and severity = 'urgent'"))[0].n === 1, "a serious, possibly related event alerts the clinic");
const v2 = await rpc(admin, "rehab_admin_safety_report", { p_adverse_event_id: e1, p_payload: R({ criteria: ["life_threatening"], aware_at: new Date().toISOString(), outcome: "recovered" }) });
eq(v2.version, 2, "a follow-up is a new version");
eq(Math.round((new Date(v2.report_due_at).getTime() - new Date(aware).getTime()) / 86400_000), 7, "life-threatening, unexpected and possibly related: 7 days, counted from the FIRST awareness");
ok((await sql("select count(*)::int as n from public.rehab_notifications where kind = 'safety_review'"))[0].n === 1, "a follow-up version does not alert again");
const e2 = await ev(p2, "mild");
const v3 = await rpc(admin, "rehab_admin_safety_report", { p_adverse_event_id: e2, p_payload: R({ criteria: [], relatedness: "unlikely", expectedness: "expected" }) });
eq([v3.serious, v3.report_due_at], [false, null], "a non-serious event has no reporting deadline");
await sqlFails("update public.rehab_safety_reports set outcome = 'recovered'", /cannot be changed/, "a safety report cannot be changed");
await sqlFails("delete from public.rehab_safety_reports", /cannot be changed/, "a safety report cannot be removed");
eq((await rpc(admin, "rehab_admin_safety_reports", { p_patient_id: p1.id })).map((r) => r.version), [1, 2], "staff read every version");

/* ---------- 2. protocol deviations ---------- */
await fails(admin, "rehab_admin_study_log_deviation", { p_patient_id: p1.id, p_kind: "bogus", p_description: "Something happened here", p_occurred_on: today }, /unknown kind/, "an unknown kind is refused");
await fails(admin, "rehab_admin_study_log_deviation", { p_patient_id: p1.id, p_kind: "other", p_description: "short", p_occurred_on: today }, /describe the deviation/, "a description is required");
await fails(admin, "rehab_admin_study_log_deviation", { p_patient_id: p1.id, p_kind: "other", p_description: "Something happened here", p_occurred_on: "2999-01-01" }, /between enrolment and today/, "a future date is refused");
const outsider = await register("Outsider", "m5@example.com", "male");
await fails(admin, "rehab_admin_study_log_deviation", { p_patient_id: outsider.id, p_kind: "other", p_description: "Something happened here", p_occurred_on: today }, /not a study participant/, "only participants have deviations");
await rpc(admin, "rehab_admin_study_log_deviation", { p_patient_id: p2.id, p_kind: "outcome_window", p_description: "Week 12 questionnaire taken 3 weeks late", p_occurred_on: today });
await rpc(admin, "rehab_admin_study_log_deviation", { p_patient_id: p3.id, p_kind: "assessor_unblinded", p_description: "Participant mentioned the AI chat during the call", p_occurred_on: today });
await sqlFails("update public.rehab_study_protocol_deviations set kind = 'other'", /cannot be changed/, "a deviation cannot be changed");

/* ---------- 3. monitoring ---------- */
// primary outcome collected: baseline for all four, week 12 for p1 only
const plans = await sql("select patient_id, id from public.rehab_outcome_plans");
const planOf = Object.fromEntries(plans.map((r) => [r.patient_id, r.id]));
for (const [p, tp] of [[p1, "baseline"], [p2, "baseline"], [p3, "baseline"], [p4, "baseline"], [p1, "w12"]]) {
  await sql("select public.rehab_outcome_save($1, $2, 'rmdq24', 1, $3, '{}'::jsonb, '{\"total\": 12}'::jsonb, 'en', 'patient')", [p.id, planOf[p.id], tp]);
}
const m = await rpc(admin, "rehab_admin_study_monitor", {});
eq([m.recruitment.allocated, m.recruitment.by_arm], [4, { ai: 2, no_ai: 2 }], "recruitment by arm");
eq(m.study.target_per_arm, 30, "the target is shown");
const w12 = m.followup.find((f) => f.timepoint === "w12");
eq([w12.ai_due, w12.ai_done, w12.no_ai_due, w12.no_ai_done], [2, 1, 2, 0], "primary outcome at week 12: due and collected per arm");
eq(m.followup.find((f) => f.timepoint === "baseline").ai_done + m.followup.find((f) => f.timepoint === "baseline").no_ai_done, 4, "baseline collected for everyone");
eq(m.lost_primary, { ai: 1, no_ai: 2 }, "missing the primary outcome two weeks after its window opened");
const text = JSON.stringify(m);
ok(!/"total"|"score"|"answers"/.test(text), "the monitor never shows outcome scores");
eq(m.balance.map((b) => [b.arm, b.n, b.female, b.male]), [["ai", 2, 1, 1], ["no_ai", 2, 1, 1]], "baseline balance by arm");
eq(m.balance.find((b) => b.arm === "ai").strata, { "3-5": 1, "6-10": 1 }, "strata by arm");
eq(m.deviations.other, { outcome_window: 1, assessor_unblinded: 1 }, "deviations by kind");
eq([m.safety.serious.ai, m.safety.serious.no_ai, m.safety.serious_related], [1, 0, 1], "serious events by arm (latest version)");
eq(m.safety.adverse_events, { ai: 1, no_ai: 1 }, "adverse events after enrolment by arm");
eq([m.safety.review_threshold, m.safety.review_needed], [2, false], "the safety review threshold comes from the study rules");
const e3 = await ev(p4);
eq((await rpc(admin, "rehab_admin_study_monitor", {})).safety.not_assessed, 1, "an event without a safety report is counted as not assessed");
await rpc(admin, "rehab_admin_safety_report", { p_adverse_event_id: e3, p_payload: R({ relatedness: "probable", aware_at: new Date(Date.now() - 20 * 86400_000).toISOString(), onset_date: new Date(Date.now() - 21 * 86400_000).toISOString().slice(0, 10) }) });
const m2 = await rpc(admin, "rehab_admin_study_monitor", {});
eq([m2.safety.serious_related, m2.safety.review_needed], [2, true], "two serious related events reach the threshold: a safety review is needed");
eq(m2.safety.overdue, 1, "a serious event past its deadline without an ethics report is overdue");
await fails(stranger, "rehab_admin_study_monitor", {}, /not authorised/, "only staff see the monitor");
for (const t of ["rehab_safety_reports", "rehab_study_protocol_deviations"]) {
  for (const who of [admin, stranger, null]) {
    checks += 1;
    let blocked = false;
    try { await rowsAs(who, `select * from public.${t}`); } catch { blocked = true; }
    assert.ok(blocked, `${t}: the API roles cannot read the table`);
  }
}

console.log(`Research Room phase 3 database: ${checks} checks passed (safety reports and deadlines, deviations, monitoring without scores).`);
await db.close?.();
