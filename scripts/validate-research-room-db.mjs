/**
 * Research Room database validator (runs the real migrations on local Postgres 17 and exercises phase 1):
 *   node scripts/validate-research-room-db.mjs
 *
 * Covers: concealed, stratified randomisation that happens in one step with approval; eligibility judged from the study rules; consent evidence;
 * the AI switch of a participant cannot be changed by the patient, the clinician or any function except the logged override; the study cannot start
 * without ethics, a consent version and a complete list; records cannot be changed; existing patients are untouched; nothing is readable by the API.
 */
import assert from "node:assert/strict";
import { createDb, callRpc, withRole } from "./rehabverse-local/db.mjs";

const db = await createDb();
let checks = 0;
const ok = (c, m) => { checks += 1; assert.ok(c, m); };
const eq = (a, b, m) => { checks += 1; assert.deepEqual(a, b, m); };
const sql = (text, params = []) => db.query(text, params).then((r) => r.rows);

async function makeUser(email, { admin = false } = {}) {
  const { rows } = await db.query("insert into auth.users (email) values ($1) returning id", [email]);
  const id = rows[0].id;
  if (admin) await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Dr Test', 'owner')", [id]);
  return { sub: id, email, role: "authenticated", aud: "authenticated" };
}
const rpc = async (claims, fn, args) => (await callRpc(db, claims, fn, args)).value;
async function fails(claims, fn, args, pattern, message) {
  checks += 1;
  try { await callRpc(db, claims, fn, args); } catch (error) {
    assert.match(String(error.message), pattern, `${message} (got: ${error.message})`);
    return;
  }
  assert.fail(`${message}: expected an error matching ${pattern}`);
}
async function sqlFails(text, pattern, message) {
  checks += 1;
  try { await db.query(text); } catch (error) { assert.match(String(error.message), pattern, `${message} (got: ${error.message})`); return; }
  assert.fail(`${message}: expected an error`);
}
const rowsAs = (claims, text) => withRole(db, claims, (tx) => tx.query(text)).then((r) => r.rows);

const admin = await makeUser("doc@example.com", { admin: true });
const stranger = await makeUser("nobody@example.com");

async function register(name, email, { age = 40 } = {}) {
  const u = await makeUser(email);
  const r = await rpc(u, "rehab_register_patient", { p_payload: { full_name: name, age_years: age, phone: "0300 1112223", consent: true, preferred_language: "en" } });
  return { claims: u, id: r.id };
}
const SCREEN = (nprs, extra = {}) => ({ region: "low_back", nprs, answers: { lbp_4_weeks: true, smartphone: true, reads_language: true, red_flag: false, recent_surgery: false, pregnant: false, ...extra } });
const CONSENT = { given: true, method: "in_person_written", version: "C1", obtained_at: new Date(Date.now() - 3600_000).toISOString() };

const CONFIG = {
  regions: ["low_back"], age_min: 18, age_max: 65, min_nprs: 3, strata_cuts: [6],
  eligibility: [
    { id: "lbp_4_weeks", kind: "include", en: "Low back pain 4 weeks or more", ru: "x" },
    { id: "smartphone", kind: "include", en: "Has a smartphone", ru: "x" },
    { id: "reads_language", kind: "include", en: "Can read English or Roman Urdu", ru: "x" },
    { id: "red_flag", kind: "exclude", en: "Any red flag", ru: "x" },
    { id: "recent_surgery", kind: "exclude", en: "Recent spinal surgery", ru: "x" },
    { id: "pregnant", kind: "exclude", en: "Pregnant", ru: "x" },
  ],
  outcome_plan: [{ instrument: "rmdq24", version: 1, schedule: "standard" }, { instrument: "nprs", version: 1, schedule: "standard" }],
  primary: { instrument: "rmdq24", timepoint: "w12" }, target_per_arm: 0, notify: { en: "", ru: "" },
};
const STUDY = (over = {}) => ({ code: "RV-AI-01", title: "AI-assisted versus standard telerehabilitation", version: "1.0", config: CONFIG, ethics_ref: "ERC/2026/17", ethics_date: "2026-11-01", registry_id: null, consent_version: "C1", ...over });
// A fixed list: group 3-5 goes ai, no_ai, no_ai, ai, ...; group 6-10 goes no_ai, ai, ai, no_ai, ...
const LIST = [];
for (const [s, pattern] of [["3-5", ["ai", "no_ai", "no_ai", "ai"]], ["6-10", ["no_ai", "ai", "ai", "no_ai"]]]) {
  for (let i = 1; i <= 8; i++) LIST.push({ stratum: s, position: i, arm: pattern[(i - 1) % 4] });
}

/* ---------- an existing patient, before any study ---------- */
const old = await register("Old Patient", "old@example.com");
await rpc(admin, "rehab_admin_decide_patient", { p_patient_id: old.id, p_decision: "approve", p_note: null });
await rpc(admin, "rehab_admin_set_ai_assist", { p_patient_id: old.id, p_enabled: true });
eq((await sql("select ai_assist from public.rehab_patients where id = $1", [old.id]))[0].ai_assist, "on", "before a study, the AI switch works by hand as always");

/* ---------- access: nothing is readable by the API, only staff can call ---------- */
for (const t of ["rehab_studies", "rehab_study_sequence", "rehab_study_screening", "rehab_study_consents", "rehab_study_allocations", "rehab_study_deviations"]) {
  for (const who of [admin, stranger, null]) {
    checks += 1;
    let blocked = false;
    try { await rowsAs(who, `select * from public.${t}`); } catch { blocked = true; }
    assert.ok(blocked, `${t}: the API roles cannot read the table (${who ? who.email : "anon"})`);
  }
}
await fails(stranger, "rehab_admin_study_overview", {}, /not authorised/, "a non-staff user cannot open the study");
await fails(stranger, "rehab_admin_study_enrol", { p_patient_id: old.id, p_screen: SCREEN(5), p_consent: CONSENT }, /not authorised/, "a non-staff user cannot enrol");
await fails(null, "rehab_admin_study_log", {}, /permission denied|not authorised/, "anonymous cannot read the log");
eq(await rpc(admin, "rehab_admin_study_overview", {}), { study: null }, "no study yet");

/* ---------- set-up rules ---------- */
await fails(admin, "rehab_admin_study_save", { p_payload: STUDY({ config: { ...CONFIG, strata_cuts: [3] } }) }, /cut points must rise/, "a cut point at or below the lowest score is refused");
await fails(admin, "rehab_admin_study_save", { p_payload: STUDY({ config: { ...CONFIG, age_min: 15 } }) }, /age range/, "under-18 is refused");
await fails(admin, "rehab_admin_study_save", { p_payload: STUDY({ config: { ...CONFIG, primary: { instrument: "ndi", timepoint: "w12" } } }) }, /primary outcome must be one of/, "the primary outcome must be in the plan");
await fails(admin, "rehab_admin_study_save", { p_payload: STUDY({ config: { ...CONFIG, eligibility: [{ id: "BAD", kind: "include", en: "Some text here", ru: "" }] } }) }, /eligibility question is not valid/, "an invalid question id is refused");
const saved = await rpc(admin, "rehab_admin_study_save", { p_payload: STUDY({ ethics_ref: null, ethics_date: null }) });
ok(saved.created === true, "the draft is created");
await fails(admin, "rehab_admin_study_set_status", { p_to: "recruiting" }, /ethics approval number/, "cannot start without ethics");
await rpc(admin, "rehab_admin_study_save", { p_payload: STUDY() });
await fails(admin, "rehab_admin_study_set_status", { p_to: "recruiting" }, /load the allocation list/, "cannot start without a list");
await fails(admin, "rehab_admin_study_load_sequence", { p_rows: LIST.filter((r) => r.stratum === "3-5"), p_source: "independent" }, /no rows for the group 6-10/, "a list missing a group is refused");
await fails(admin, "rehab_admin_study_load_sequence", { p_rows: [...LIST.slice(0, 3), ...LIST.slice(4)], p_source: "independent" }, /no gap or repeat/, "a gap in positions is refused");
await fails(admin, "rehab_admin_study_load_sequence", { p_rows: [...LIST, { stratum: "9-9", position: 1, arm: "ai" }], p_source: "independent" }, /does not match the study/, "an unknown group is refused");
await fails(admin, "rehab_admin_study_load_sequence", { p_rows: LIST, p_source: "someone" }, /independent person/, "the source must be stated");
await rpc(admin, "rehab_admin_study_load_sequence", { p_rows: LIST.filter((r) => r.position <= 3 || r.stratum === "6-10"), p_source: "independent" });
await fails(admin, "rehab_admin_study_set_status", { p_to: "recruiting" }, /at least 4 rows in group 3-5/, "a too-short list is refused");
await rpc(admin, "rehab_admin_study_load_sequence", { p_rows: LIST, p_source: "independent" });
await rpc(admin, "rehab_admin_study_save", { p_payload: STUDY({ ethics_date: "2999-01-01" }) });
await fails(admin, "rehab_admin_study_set_status", { p_to: "recruiting" }, /ethics approval date is in the future/, "a future ethics date is refused");
await rpc(admin, "rehab_admin_study_save", { p_payload: STUDY() });
eq((await sql("select public.rehab_study__strata($1::jsonb) as s", [JSON.stringify(CONFIG)]))[0].s, ["3-5", "6-10"], "the pain bands are 3-5 and 6-10");
eq((await sql("select public.rehab_study__stratum($1::jsonb, 2) as a, public.rehab_study__stratum($1::jsonb, 5) as b, public.rehab_study__stratum($1::jsonb, 6) as c, public.rehab_study__stratum($1::jsonb, 10) as d", [JSON.stringify(CONFIG)]))[0], { a: null, b: "3-5", c: "6-10", d: "6-10" }, "pain scores map to the right band");

/* ---------- start recruiting: the rules freeze ---------- */
const started = await rpc(admin, "rehab_admin_study_set_status", { p_to: "recruiting" });
ok(/^[0-9a-f]{64}$/.test(started.hash), "recruiting stores a SHA-256 of the rules");
await fails(admin, "rehab_admin_study_save", { p_payload: STUDY({ title: "A different title now" }) }, /frozen/, "the rules cannot be edited while recruiting");
await fails(admin, "rehab_admin_study_load_sequence", { p_rows: LIST, p_source: "independent" }, /frozen/, "the list cannot be replaced while recruiting");
await fails(admin, "rehab_admin_study_set_status", { p_to: "recruiting" }, /already recruiting/, "cannot start twice");
const ov0 = await rpc(admin, "rehab_admin_study_overview", {});
eq(ov0.list, [{ stratum: "3-5", total: 8, left: 8 }, { stratum: "6-10", total: 8, left: 8 }], "the overview shows how many list rows are left per group");
ok(!JSON.stringify(ov0).includes('"arm"') && !/"no_ai"/.test(JSON.stringify(ov0.list)), "the overview never shows which arm comes next");
eq(ov0.study.frozen_hash, started.hash, "the hash is shown");

/* ---------- approval now goes through enrolment ---------- */
const p1 = await register("Participant One", "p1@example.com");
await fails(admin, "rehab_admin_decide_patient", { p_patient_id: p1.id, p_decision: "approve", p_note: null }, /through study enrolment/, "a plain approval is refused while a study is recruiting");

/* ---------- enrolment and allocation ---------- */
async function enrol(patient, nprs, extra) { return rpc(admin, "rehab_admin_study_enrol", { p_patient_id: patient.id, p_screen: SCREEN(nprs, extra), p_consent: CONSENT }); }
const e1 = await enrol(p1, 4);
eq([e1.enrolled, e1.arm, e1.stratum], [true, "ai", "3-5"], "participant 1 takes the first row of group 3-5 (ai)");
const row1 = (await sql("select status, ai_assist, decided_by is not null as decided from public.rehab_patients where id = $1", [p1.id]))[0];
eq(row1, { status: "active", ai_assist: "on", decided: true }, "approval and the AI switch happen together");
eq((await sql("select count(*)::int as n from public.rehab_study_consents where patient_id = $1 and method = 'in_person_written' and consent_version = 'C1'", [p1.id]))[0].n, 1, "consent evidence is stored");
const plan = (await sql("select items from public.rehab_outcome_plans where patient_id = $1", [p1.id]))[0];
eq(plan.items, CONFIG.outcome_plan, "the outcome plan is the study plan");
ok((await sql("select count(*)::int as n from public.rehab_notifications where patient_id = $1 and kind = 'study_enrolled'", [p1.id]))[0].n === 1, "the patient is told");
ok((await sql("select count(*)::int as n from public.rehab_audit_log where action = 'study.enrolled' and patient_id = $1", [p1.id]))[0].n === 1, "enrolment is in the audit log");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: p1.id, p_screen: SCREEN(4), p_consent: CONSENT }, /not waiting for a decision/, "a person cannot be enrolled twice");

const p2 = await register("Participant Two", "p2@example.com");
const e2 = await enrol(p2, 5);
eq([e2.arm, e2.stratum], ["no_ai", "3-5"], "participant 2 takes the second row of group 3-5 (no_ai)");
eq((await sql("select ai_assist from public.rehab_patients where id = $1", [p2.id]))[0].ai_assist, "off", "the no-AI arm has the AI switch off");
const p3 = await register("Participant Three", "p3@example.com");
const e3 = await enrol(p3, 8);
eq([e3.arm, e3.stratum], ["no_ai", "6-10"], "a severe score is allocated from group 6-10 (first row: no_ai)");
const p4 = await register("Participant Four", "p4@example.com");
eq((await enrol(p4, 10)).arm, "ai", "second row of group 6-10 is ai");

/* ---------- not eligible / not consented: nothing is allocated, nothing is consumed ---------- */
const leftBefore = (await rpc(admin, "rehab_admin_study_overview", {})).list;
const bad = [
  ["young-old", register("Too Old", "old70@example.com", { age: 70 }), 5, {}, "age_outside_range"],
  ["low pain", register("Low Pain", "low@example.com"), 2, {}, "pain_below_minimum"],
  ["red flag", register("Red Flag", "rf@example.com"), 5, { red_flag: true }, "red_flag"],
  ["no phone", register("No Phone", "np@example.com"), 5, { smartphone: false }, "not_smartphone"],
];
for (const [name, pending, nprs, extra, reason] of bad) {
  const person = await pending;
  const r = await rpc(admin, "rehab_admin_study_enrol", { p_patient_id: person.id, p_screen: SCREEN(nprs, extra), p_consent: CONSENT });
  ok(r.enrolled === false && r.reasons.includes(reason), `${name}: screened out with the reason ${reason}`);
  eq((await sql("select status, ai_assist from public.rehab_patients where id = $1", [person.id]))[0], { status: "pending", ai_assist: "off" }, `${name}: the account stays waiting and the AI switch is untouched`);
  eq((await sql("select count(*)::int as n from public.rehab_study_allocations where patient_id = $1", [person.id]))[0].n, 0, `${name}: no allocation`);
}
const neck = await register("Neck Pain", "neck@example.com");
const rn = await rpc(admin, "rehab_admin_study_enrol", { p_patient_id: neck.id, p_screen: { ...SCREEN(5), region: "neck" }, p_consent: CONSENT });
ok(rn.reasons.includes("region_not_in_study"), "neck pain is outside this study's regions");
eq((await rpc(admin, "rehab_admin_study_overview", {})).list, leftBefore, "screening someone out uses no row of the list");

// the person who was screened out can still be approved as an ordinary clinic patient (outside the study)
const ordinary = (await sql("select id from public.rehab_patients where full_name = 'Low Pain'"))[0].id;
await rpc(admin, "rehab_admin_decide_patient", { p_patient_id: ordinary, p_decision: "approve", p_note: null });
eq((await sql("select status, ai_assist from public.rehab_patients where id = $1", [ordinary]))[0], { status: "active", ai_assist: "off" }, "a screened-out person can be approved as an ordinary patient");
await rpc(admin, "rehab_admin_set_ai_assist", { p_patient_id: ordinary, p_enabled: true });
eq((await sql("select ai_assist from public.rehab_patients where id = $1", [ordinary]))[0].ai_assist, "on", "…and their AI switch still works by hand (they are not a participant)");

// incomplete or wrong forms change nothing
const q = await register("Quiet Person", "quiet@example.com");
const leftQ = (await rpc(admin, "rehab_admin_study_overview", {})).list;
async function untouched(label) {
  eq((await sql("select status from public.rehab_patients where id = $1", [q.id]))[0].status, "pending", `${label}: still waiting`);
  eq((await sql("select count(*)::int as n from public.rehab_study_screening where patient_id = $1", [q.id]))[0].n, 0, `${label}: nothing logged`);
  eq((await rpc(admin, "rehab_admin_study_overview", {})).list, leftQ, `${label}: no list row used`);
}
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: q.id, p_screen: { region: "low_back", nprs: 5, answers: { smartphone: true } }, p_consent: CONSENT }, /answer every eligibility question/, "an unanswered question is refused");
await untouched("unanswered question");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: q.id, p_screen: SCREEN(5), p_consent: { ...CONSENT, given: false } }, /consent has not been given/, "no consent, no enrolment");
await untouched("no consent");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: q.id, p_screen: SCREEN(5), p_consent: { ...CONSENT, version: "OLD" } }, /consent version does not match/, "a wrong consent version is refused");
await untouched("wrong consent version");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: q.id, p_screen: SCREEN(5), p_consent: { ...CONSENT, method: "email" } }, /how consent was obtained/, "an unknown consent method is refused");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: q.id, p_screen: SCREEN(5), p_consent: { ...CONSENT, obtained_at: new Date(Date.now() + 86400_000).toISOString() } }, /in the future/, "a consent time in the future is refused");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: q.id, p_screen: SCREEN(5), p_consent: { ...CONSENT, method: "verbal_witnessed" } }, /witness is needed/, "verbal consent needs a witness");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: q.id, p_screen: SCREEN(11), p_consent: CONSENT }, /baseline pain score/, "a pain score above 10 is refused");
await untouched("bad forms");
// declined
await rpc(admin, "rehab_admin_study_screen_out", { p_patient_id: q.id, p_outcome: "declined", p_reasons: ["declined"], p_note: "Prefers usual care" });
await fails(admin, "rehab_admin_study_screen_out", { p_patient_id: q.id, p_outcome: "declined", p_reasons: ["declined"] }, /already been screened/, "a person is screened once");
await rpc(admin, "rehab_admin_decide_patient", { p_patient_id: q.id, p_decision: "approve", p_note: null });
eq((await sql("select status from public.rehab_patients where id = $1", [q.id]))[0].status, "active", "someone who declined can still be approved as an ordinary patient");
// a plain rejection during recruiting is logged for the flow diagram
const rj = await register("Rejected Person", "rj@example.com");
await rpc(admin, "rehab_admin_decide_patient", { p_patient_id: rj.id, p_decision: "reject", p_note: "Could not verify" });
eq((await sql("select outcome, reasons from public.rehab_study_screening where patient_id = $1", [rj.id]))[0], { outcome: "excluded", reasons: ["rejected_at_approval"] }, "a rejection is written to the screening log");

/* ---------- the AI switch of a participant is locked (patients cannot change it at all any more; the clinician's switch and direct updates are refused) ---------- */
await fails(admin, "rehab_admin_set_ai_assist", { p_patient_id: p1.id, p_enabled: false }, /set by the study/, "the clinician cannot flip a participant's switch by hand");
await fails(admin, "rehab_admin_set_ai_assist", { p_patient_id: p2.id, p_enabled: true }, /set by the study/, "…in either direction");
await sqlFails(`update public.rehab_patients set ai_assist = 'off' where id = '${p1.id}'`, /set by the study/, "even a direct update is refused");
await db.query(`update public.rehab_patients set city = 'Lahore' where id = '${p1.id}'`);
ok(true, "other fields of a participant can still be updated");

/* ---------- the logged override ---------- */
await fails(admin, "rehab_admin_study_override_ai", { p_patient_id: p1.id, p_ai_on: false, p_reason: "short" }, /reason of at least 10/, "an override needs a reason");
await fails(admin, "rehab_admin_study_override_ai", { p_patient_id: p1.id, p_ai_on: true, p_reason: "Already on, nothing to do" }, /already on/, "an override must change something");
await fails(admin, "rehab_admin_study_override_ai", { p_patient_id: ordinary, p_ai_on: false, p_reason: "Not a participant here" }, /not in the study/, "only participants have overrides");
await rpc(admin, "rehab_admin_study_override_ai", { p_patient_id: p1.id, p_ai_on: false, p_reason: "Patient asked to stop the AI chat" });
eq((await sql("select ai_assist from public.rehab_patients where id = $1", [p1.id]))[0].ai_assist, "off", "the override switches the AI off");
const sp = await rpc(admin, "rehab_admin_study_patient", { p_patient_id: p1.id });
eq([sp.enrolled, sp.arm, sp.deviations.length, sp.deviations[0].received_ai], [true, "ai", 1, "off"], "the person stays in the allocated arm and the departure is recorded");
await fails(admin, "rehab_admin_set_ai_assist", { p_patient_id: p1.id, p_enabled: true }, /set by the study/, "the lock is back after an override");
eq(await rpc(admin, "rehab_admin_study_patient", { p_patient_id: ordinary }), { enrolled: false }, "an ordinary patient is not in the study");

/* ---------- records cannot be changed ---------- */
for (const t of ["rehab_study_screening", "rehab_study_consents", "rehab_study_allocations", "rehab_study_deviations"]) {
  await sqlFails(`update public.${t} set study_id = study_id`, /cannot be changed or removed/, `${t}: cannot be updated`);
  await sqlFails(`delete from public.${t}`, /cannot be changed or removed/, `${t}: cannot be deleted`);
}

/* ---------- the list is followed in order, and runs out cleanly ---------- */
const order = (await sql("select a.arm from public.rehab_study_allocations a where a.stratum = '3-5' order by a.allocated_at, a.id")).map((r) => r.arm);
eq(order, ["ai", "no_ai"], "so far group 3-5 followed the list");
for (let i = 3; i <= 8; i++) {
  const p = await register("Filler " + i, `f${i}@example.com`);
  const r = await enrol(p, 4);
  eq(r.arm, LIST.filter((x) => x.stratum === "3-5")[i - 1].arm, `group 3-5, row ${i}: the arm is exactly what the list says`);
}
const extra = await register("One Too Many", "toomany@example.com");
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: extra.id, p_screen: SCREEN(4), p_consent: CONSENT }, /used up/, "when a group's list is used up, enrolment stops with a clear message");
eq((await sql("select status from public.rehab_patients where id = $1", [extra.id]))[0].status, "pending", "…and the person is not approved");

/* ---------- flow numbers add up ---------- */
const ov = await rpc(admin, "rehab_admin_study_overview", {});
const f = ov.flow;
eq(f.screened, f.excluded + f.declined + f.allocated + 0, "assessed = excluded + declined + randomised (everyone waiting has not been screened yet)");
eq([f.allocated, f.allocated_ai + f.allocated_no_ai, f.deviations], [10, 10, 1], "ten randomised, arms add up, one departure");
ok(ov.exclusion_reasons.some((r) => r.reason === "red_flag") && ov.exclusion_reasons.some((r) => r.reason === "age_outside_range"), "exclusion reasons are counted");
const log = await rpc(admin, "rehab_admin_study_log", {});
eq([log.allocations.length, log.screening.length], [10, f.screened], "the log lists everyone");

/* ---------- close ---------- */
await fails(admin, "rehab_admin_study_set_status", { p_to: "closed", p_reason: "short" }, /reason of at least 10/, "closing needs a reason");
await rpc(admin, "rehab_admin_study_set_status", { p_to: "closed", p_reason: "Recruitment target reached" });
await fails(admin, "rehab_admin_study_enrol", { p_patient_id: extra.id, p_screen: SCREEN(4), p_consent: CONSENT }, /no study is recruiting/, "no enrolment after closing");
await rpc(admin, "rehab_admin_decide_patient", { p_patient_id: extra.id, p_decision: "approve", p_note: null });
eq((await sql("select status from public.rehab_patients where id = $1", [extra.id]))[0].status, "active", "after closing, ordinary approval works again");
eq((await sql("select count(*)::int as n from public.rehab_study_allocations"))[0].n, 10, "the allocations are kept");
eq((await sql("select ai_assist from public.rehab_patients where id = $1", [old.id]))[0].ai_assist, "on", "the patient from before the study was never touched");

console.log(`Research Room database: ${checks} checks passed (concealed stratified randomisation, consent evidence, locked AI switch, frozen rules, append-only records).`);
