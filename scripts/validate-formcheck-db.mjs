/**
 * The camera Form Check's records, on the real migration (local Postgres 17):  node scripts/validate-formcheck-db.mjs
 *
 * Numbers only; a patient's set is accepted only when the admin switched AI assistance on for that patient (the database checks, not only the page); the browser roles
 * cannot read or write the tables; records cannot be changed; a withdrawal can remove a study participant's records until the analysis is locked, never after; the
 * validation export holds study codes and no names.
 */
import assert from "node:assert/strict";
import { createDb, callRpc, withRole } from "./rehabverse-local/db.mjs";

const db = await createDb();
let checks = 0;
const ok = (condition, message) => { checks += 1; assert.ok(condition, message); };
const eq = (actual, expected, message) => { checks += 1; assert.deepEqual(actual, expected, message); };
async function makeUser(email, { admin = false } = {}) {
  const { rows } = await db.query("insert into auth.users (email) values ($1) returning id", [email]);
  const id = rows[0].id;
  if (admin) await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Dr Test', 'owner')", [id]);
  return { sub: id, email, role: "authenticated", aud: "authenticated" };
}
const rpc = async (claims, fn, args) => (await callRpc(db, claims, fn, args)).value;
async function fails(claims, fn, args, pattern, message) {
  checks += 1;
  try { await callRpc(db, claims, fn, args); } catch (error) { assert.match(String(error.message), pattern, `${message} (got: ${error.message})`); return; }
  assert.fail(`${message}: expected an error matching ${pattern}`);
}
const rows = (claims, sql) => withRole(db, claims, (tx) => tx.query(sql)).then((r) => r.rows);
async function rowsFail(claims, sql, pattern, message) {
  checks += 1;
  try { await rows(claims, sql); } catch (error) { assert.match(String(error.message), pattern, `${message} (got: ${error.message})`); return; }
  assert.fail(`${message}: expected an error`);
}
const sql = (text, params = []) => db.query(text, params).then((r) => r.rows);
const SERVICE = { role: "service_role" };

const admin = await makeUser("admin@pna.test", { admin: true });
const alice = await makeUser("alice@pna.test");
const bob = await makeUser("bob@pna.test");
const aliceReg = await rpc(alice, "rehab_register_patient", { p_payload: { full_name: "Alice Khan", age_years: 41, phone: "0300 1112223", consent: true } });
const bobReg = await rpc(bob, "rehab_register_patient", { p_payload: { full_name: "Bob Ali", age_years: 35, phone: "0300 9998887", consent: true } });
for (const reg of [aliceReg, bobReg]) await rpc(admin, "rehab_admin_decide_patient", { p_patient_id: reg.id, p_decision: "approve" });
await rpc(admin, "rehab_admin_set_ai_assist", { p_patient_id: aliceReg.id, p_enabled: true });

const SUMMARY = { specId: "chin-tuck", pass: 1, durationMs: 62000, reps: 5, partial: 1, records: [], bestHoldMs: 0, coverage: { frames: 1800, read: 1760, fraction: 0.98 }, refusals: {}, cues: { "chin-tuck-eyes": 1 }, baseline: { ear_fwd: 0.12 }, peak: { ear_fwd: 0.05 } };
const SOFTWARE = { engine: "formcheck-0.1.0", library: "@mediapipe/tasks-vision@1.2.3", poseModel: "pose_landmarker_full.task", poseModelSha256: "5134a3aa", faceModel: null, faceModelSha256: null, delegate: "CPU" };
const patientSet = (over = {}) => ({ spec_id: "chin-tuck", pass: 1, side: null, software: SOFTWARE, device: { orientation: "portrait" }, summary: SUMMARY, ...over });

/* patient sets: only for a patient whose AI is on, only through the server role */
const saved = await rpc(SERVICE, "rehab_formcheck_save_patient_set", { p_patient_id: aliceReg.id, p_payload: patientSet() });
ok(saved.id, "a set is saved for a patient whose AI assistance is on");
await fails(SERVICE, "rehab_formcheck_save_patient_set", { p_patient_id: bobReg.id, p_payload: patientSet() }, /not enabled for this patient/, "a patient whose AI is off is refused by the database itself");
await fails(alice, "rehab_formcheck_save_patient_set", { p_patient_id: aliceReg.id, p_payload: patientSet() }, /permission denied|Could not find|not authorised/i, "a patient cannot call the save function from the browser");
await rpc(admin, "rehab_admin_set_ai_assist", { p_patient_id: aliceReg.id, p_enabled: false });
await fails(SERVICE, "rehab_formcheck_save_patient_set", { p_patient_id: aliceReg.id, p_payload: patientSet() }, /not enabled for this patient/, "switching AI off stops the saving at once");
await rpc(admin, "rehab_admin_set_ai_assist", { p_patient_id: aliceReg.id, p_enabled: true });
await fails(SERVICE, "rehab_formcheck_save_patient_set", { p_patient_id: aliceReg.id, p_payload: patientSet({ summary: "x" }) }, /invalid camera record/, "a record without a summary object is refused");
await fails(SERVICE, "rehab_formcheck_save_patient_set", { p_patient_id: aliceReg.id, p_payload: patientSet({ spec_id: "Bad Id!" }) }, /violates check constraint/, "an exercise id that is not a plain id is refused");
await fails(SERVICE, "rehab_formcheck_save_patient_set", { p_patient_id: aliceReg.id, p_payload: patientSet({ summary: { blob: "x".repeat(13000) } }) }, /violates check constraint/, "an oversized summary is refused (numbers, not footage)");
const mine = await rpc(admin, "rehab_admin_formcheck_patient_sets", { p_patient_id: aliceReg.id });
eq(mine.length, 1, "the physiotherapist sees the patient's saved set");
eq([mine[0].reps, mine[0].spec_id], [5, "chin-tuck"], "with its counts");
await fails(alice, "rehab_admin_formcheck_patient_sets", { p_patient_id: aliceReg.id }, /not authorised/, "a patient cannot read this list");

/* the browser roles cannot touch the tables */
for (const table of ["rehab_formcheck_sets", "rehab_formcheck_trials", "rehab_formcheck_study"]) {
  await rowsFail(alice, `select * from public.${table}`, /permission denied/, `${table}: a patient cannot read it`);
  await rowsFail(admin, `select * from public.${table}`, /permission denied/, `${table}: not even a signed-in admin reads it directly`);
  await rowsFail(null, `select * from public.${table}`, /permission denied/, `${table}: the public cannot read it`);
}
await rowsFail(alice, `insert into public.rehab_formcheck_sets (kind, patient_id, spec_id, software, summary) values ('patient', '${aliceReg.id}', 'chin-tuck', '{}', '{}')`, /permission denied/, "a patient cannot insert a record directly");

/* validation mode */
const VAL = (over = {}) => ({ study_code: "PNA-V-001", session_no: 1, spec_id: "neck-rotation", pass: 1, side: null, software: SOFTWARE, device: { phone: "Pixel 8", orientation: "portrait", height_cm: 105, distance_m: 1.5 }, conditions: { light: "normal", clothing: "loose" }, summary: SUMMARY, ...over });
await fails(alice, "rehab_admin_formcheck_save_set", { p_payload: VAL() }, /not authorised/, "a patient cannot save a validation set");
await fails(admin, "rehab_admin_formcheck_save_set", { p_payload: VAL({ study_code: "Alice Khan" }) }, /violates check constraint/, "a name with spaces cannot be used as a study code");
const vset = await rpc(admin, "rehab_admin_formcheck_save_set", { p_payload: VAL() });
ok(vset.id, "staff save a validation set by study code");
const TRIAL = (over = {}) => ({ movement_id: "neck-rotation", movement_type: "head-yaw", repetition: 1, camera_value: 41.5, camera_confidence: 0.93, reference_value: 44, reference_instrument: "CROM", instructed_error: false, camera_captured_at: new Date(Date.now() - 20000).toISOString(), ...over });
const t1 = await rpc(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: TRIAL() });
eq(t1.seq, 1, "the first trial is number 1");
eq((await rpc(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: TRIAL({ repetition: 2 }) })).seq, 2, "the next is 2");
await fails(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: TRIAL({ reference_value: null }) }, /violates check constraint/, "a trial the camera read must have its reference value");
await fails(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: TRIAL({ camera_captured_at: new Date(Date.now() + 3600e3).toISOString() }) }, /violates check constraint/, "a camera value cannot be captured after the row was written");
ok((await rpc(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: { movement_id: "neck-rotation", refused: true, refused_reason: "tracking lost" } })).id, "a trial the tool refused is recorded with its reason, with no values");
ok((await rpc(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: { movement_id: "neck-rotation", count_tool: 10, count_manual: 10, hold_tool_s: 3.1, hold_stopwatch_s: 3 } })).id, "a count and hold check is recorded as its own trial");
await fails(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: { movement_id: "neck-rotation", count_tool: 10 } }, /violates check constraint/, "a count without the manual count is refused");
await fails(admin, "rehab_admin_formcheck_add_trial", { p_set_id: saved.id, p_trial: TRIAL() }, /validation set not found/, "trials belong to validation sets only");
await fails(alice, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: TRIAL() }, /not authorised/, "a patient cannot add a trial");
const fix = await rpc(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: TRIAL({ reference_value: 43, corrects_id: t1.id }) });
ok(fix.id, "a correction is a new trial that points at the one it corrects");

/* immutability */
await db.query("select 1");
for (const [table, set] of [["rehab_formcheck_trials", "reference_value = 1"], ["rehab_formcheck_sets", "spec_id = 'other-id'"]]) {
  checks += 1;
  await assert.rejects(() => db.query(`update public.${table} set ${set}`), /cannot be changed/, `${table}: a record cannot be changed`);
  checks += 1;
  await assert.rejects(() => db.query(`delete from public.${table}`), /only be removed by a withdrawal/, `${table}: a record cannot be deleted directly`);
}

/* the export: study codes, no names */
const exported = await rpc(admin, "rehab_admin_formcheck_validation_export", {});
eq(exported.length, 5, "the export has one row per trial");
ok(exported.every((row) => row.study_code === "PNA-V-001" && /^\d{4}-\d{2}$/.test(row.month)), "rows carry the study code and the month only");
ok(!JSON.stringify(exported).match(/Alice|Bob|Khan|Ali\b/), "no name is in the export");
ok(exported.every((row) => !("patient_id" in row)), "and no patient id");
await fails(alice, "rehab_admin_formcheck_validation_export", {}, /not authorised/, "a patient cannot export");
const codes = await rpc(admin, "rehab_admin_formcheck_codes", {});
eq([codes.codes.length, codes.codes[0].trials, codes.locked_at], [1, 5, null], "the visit list shows the code, its trials and that the analysis is not locked");

/* withdrawal until the analysis is locked, never after */
await rpc(admin, "rehab_admin_formcheck_save_set", { p_payload: VAL({ study_code: "PNA-V-002" }) });
const gone = await rpc(admin, "rehab_admin_formcheck_withdraw", { p_study_code: "PNA-V-002" });
eq(gone.sets, 1, "a withdrawing participant's records are removed");
eq((await rpc(admin, "rehab_admin_formcheck_codes", {})).codes.map((c) => c.study_code), ["PNA-V-001"], "and only theirs");
ok((await sql("select count(*)::int n from rehab_formcheck_sets where kind = 'patient'"))[0].n === 1, "patients' sets are not touched by a study withdrawal");
ok((await sql("select details from rehab_audit_log where action = 'formcheck.withdrawal'")).length === 1, "the withdrawal is in the audit log");
await fails(alice, "rehab_admin_formcheck_withdraw", { p_study_code: "PNA-V-001" }, /not authorised/, "a patient cannot withdraw anyone");
await rpc(admin, "rehab_admin_formcheck_lock_analysis", {});
await fails(admin, "rehab_admin_formcheck_withdraw", { p_study_code: "PNA-V-001" }, /analysis is locked/, "after the lock nothing can be removed");
await fails(admin, "rehab_admin_formcheck_save_set", { p_payload: VAL({ study_code: "PNA-V-003" }) }, /analysis is locked/, "or added");
await fails(admin, "rehab_admin_formcheck_add_trial", { p_set_id: vset.id, p_trial: TRIAL() }, /analysis is locked/, "trials neither");
checks += 1;
await assert.rejects(() => db.query("update rehab_formcheck_study set analysis_locked_at = null"), /cannot be changed/, "the lock cannot be undone");
ok((await sql("select count(*)::int n from rehab_audit_log where action like 'formcheck.%'"))[0].n >= 6, "every camera write is audited");

console.log(`Form Check database OK — ${checks} checks passed (real migration on Postgres 17.5).`);
