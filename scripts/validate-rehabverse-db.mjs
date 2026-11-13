/**
 * RehabVerse database validator (runs the real migration on local Postgres 17 and exercises it):
 *   node scripts/validate-rehabverse-db.mjs
 *
 * Covers: who can read what (RLS, per role), the intake → programme → daily unlock → feedback → clinician
 * decision loop, red-flag routing, configurable unlock rules, admin override, ERRP follow-up windows,
 * immutable history and the append-only audit log.
 */
import assert from "node:assert/strict";
import { createDb, callRpc, withRole } from "./rehabverse-local/db.mjs";

const db = await createDb();
let checks = 0;
const ok = (condition, message) => {
  checks += 1;
  assert.ok(condition, message);
};
const eq = (actual, expected, message) => {
  checks += 1;
  assert.deepEqual(actual, expected, message);
};

/* ----------------------------- helpers ----------------------------- */
async function makeUser(email, { admin = false } = {}) {
  const { rows } = await db.query("insert into auth.users (email) values ($1) returning id", [email]);
  const id = rows[0].id;
  if (admin) await db.query("insert into public.profiles (id, full_name, role) values ($1, 'Dr Test', 'owner')", [id]);
  return { sub: id, email, role: "authenticated", aud: "authenticated" };
}
const rpc = async (claims, fn, args) => (await callRpc(db, claims, fn, args)).value;
async function fails(claims, fn, args, pattern, message) {
  checks += 1;
  try {
    await callRpc(db, claims, fn, args);
  } catch (error) {
    assert.match(String(error.message), pattern, `${message} (got: ${error.message})`);
    return error;
  }
  assert.fail(`${message}: expected an error matching ${pattern}`);
}
const rows = (claims, sql, params = []) => withRole(db, claims, (tx) => tx.query(sql, params)).then((r) => r.rows);
async function rowsFail(claims, sql, pattern, message) {
  checks += 1;
  try {
    await rows(claims, sql);
  } catch (error) {
    assert.match(String(error.message), pattern, `${message} (got: ${error.message})`);
    return;
  }
  assert.fail(`${message}: expected a permission error`);
}
const sql = (text, params = []) => db.query(text, params).then((r) => r.rows);

const INTAKE = {
  regions: ["knee"], symptoms: ["pain", "stiffness"], pain_now: 5, pain_worst: 7, pain_best: 2, duration: "1_3m",
  onset: "After football", aggravating: "Stairs", relieving: "Rest", functional_limitations: "Cannot squat",
  own_words: "Mera ghutna seedhi chadhte waqt dard karta hai.", red_flags: [],
};
const PLAN = (extra = {}) => ({
  title: "Knee loading", goal: "Climb stairs without pain", unlock_mode: "admin_approval", min_hours_between_sessions: 0,
  sessions: [
    { day_number: 1, title: "Day 1 — gentle start", patient_note: "Go slowly.", exercises: [
      { exercise_id: "quad-set", exercise_title: "Quad set", sets: 2, reps: 10, hold_seconds: 5, rest_seconds: 30 },
      { exercise_id: "heel-slide", exercise_title: "Heel slide", sets: 2, reps: 10 } ] },
    { day_number: 2, title: "Day 2", exercises: [{ exercise_id: "mini-squat", exercise_title: "Mini squat", sets: 3, reps: 8 }] },
    { day_number: 3, title: "Day 3", exercises: [{ exercise_id: "step-up", exercise_title: "Step up", sets: 3, reps: 8 }] },
  ],
  ...extra,
});
const FEEDBACK = (over = {}) => ({
  completion: "all", pain_before: 3, pain_during: 4, pain_after: 3, difficulty: 5, unusual_symptoms: false, safety_flags: [], ...over,
});

/* ----------------------------- accounts ----------------------------- */
const admin = await makeUser("admin@pna.test", { admin: true });
const alice = await makeUser("alice@pna.test");
const bob = await makeUser("bob@pna.test");
const stranger = await makeUser("nobody@pna.test"); // signed in, never registered as a patient

/* ----------------------------- 1. registration ----------------------------- */
await fails(alice, "rehab_register_patient", { p_payload: { full_name: "Alice Khan", age_years: 17, consent: true } }, /under_18/, "under-18s are routed to the clinic");
await fails(alice, "rehab_register_patient", { p_payload: { full_name: "Alice Khan", age_years: 30, consent: false } }, /consent/, "consent is required");
await fails(admin, "rehab_register_patient", { p_payload: { full_name: "Dr Test", age_years: 40, consent: true } }, /staff accounts/, "staff cannot become patients");
const aliceReg = await rpc(alice, "rehab_register_patient", { p_payload: { full_name: "Alice Khan", age_years: 30, sex: "female", city: "Karachi", consent: true, consent_version: "v1" } });
ok(/^RV-[A-Z0-9]{6}$/.test(aliceReg.reference_code), "reference code issued");
const again = await rpc(alice, "rehab_register_patient", { p_payload: { full_name: "Alice K. Khan", age_years: 30, consent: true } });
eq(again.id, aliceReg.id, "registering twice does not create a duplicate patient");
eq((await sql("select count(*)::int n from rehab_patients where user_id = $1", [alice.sub]))[0].n, 1, "one patient row per account");
const bobReg = await rpc(bob, "rehab_register_patient", { p_payload: { full_name: "Bob Ali", age_years: 45, consent: true } });

/* ----------------------------- 2. who can call what ----------------------------- */
for (const fn of ["rehab_my_overview", "rehab_admin_inbox", "rehab_admin_patients", "rehab_my_history"]) {
  await fails(null, fn, {}, /permission denied|not authorised/i, `anonymous cannot call ${fn}`);
}
await fails(alice, "rehab_admin_inbox", {}, /not authorised/, "a patient cannot use admin functions");
await fails(stranger, "rehab_submit_assessment", { p_payload: INTAKE }, /patient profile required/, "an unregistered account cannot submit");
await fails(alice, "rehab__require_admin", {}, /permission denied|Could not find/i, "internal helpers are not callable through the API");
await fails(alice, "rehab__release_next", { p_programme_id: aliceReg.id, p_mode: "clinician", p_gap_hours: 0 }, /permission denied|Could not find/i, "internal unlock helper is not callable");

/* ----------------------------- 3. intake + red flags ----------------------------- */
await fails(alice, "rehab_submit_assessment", { p_payload: { ...INTAKE, regions: ["knee", "brain"] } }, /unknown value/, "unknown regions are rejected");
await fails(alice, "rehab_submit_assessment", { p_payload: { ...INTAKE, pain_now: 11 } }, /out of range/, "NPRS is limited to 0-10");
await fails(alice, "rehab_submit_assessment", { p_payload: { ...INTAKE, red_flags: ["rf_made_up"] } }, /unknown value/, "unknown flags are rejected");
const token = "11111111-1111-4111-8111-111111111111";
const a1 = await rpc(alice, "rehab_submit_assessment", { p_payload: { ...INTAKE, client_token: token } });
eq(a1.status, "submitted", "clean intake is submitted");
eq(a1.red_flag_level, "none", "no red flags");
const dup = await rpc(alice, "rehab_submit_assessment", { p_payload: { ...INTAKE, client_token: token } });
ok(dup.duplicate === true && dup.id === a1.id, "a double submit returns the original assessment");
await fails(alice, "rehab_submit_assessment", { p_payload: INTAKE }, /open_assessment_exists/, "only one open assessment at a time");

const b1 = await rpc(bob, "rehab_submit_assessment", { p_payload: { ...INTAKE, regions: ["lumbar"], red_flags: ["rf_bladder"] } });
eq(b1.status, "needs_clinical_assessment", "red-flag intake is routed to clinical assessment");
eq(b1.red_flag_level, "emergency", "emergency level recorded");

/* ----------------------------- 4. isolation between patients and roles ----------------------------- */
eq((await rows(alice, "select id from rehab_assessments")).map((r) => r.id), [a1.id], "alice sees only her own assessment");
eq((await rows(bob, "select id from rehab_assessments")).map((r) => r.id), [b1.id], "bob sees only his own assessment");
eq((await rows(alice, "select id from rehab_patients")).map((r) => r.id), [aliceReg.id], "alice sees only her own profile");
eq((await rows(stranger, "select id from rehab_patients")).length, 0, "an unregistered account sees nothing");
eq((await rows(admin, "select id from rehab_assessments")).length, 2, "admin sees every assessment");
await rowsFail(null, "select * from rehab_patients", /permission denied/, "anonymous has no table access");
await rowsFail(alice, "insert into rehab_assessments (patient_id, regions, symptoms, pain_now) values ('" + bobReg.id + "', '{knee}', '{}', 1)", /permission denied/, "patients cannot write tables directly");
await rowsFail(alice, "update rehab_patients set full_name = 'Hacked' where true", /permission denied/, "patients cannot update tables directly");
eq((await rows(alice, "select * from rehab_audit_log")).length, 0, "audit log shows patients nothing");
eq((await rows(alice, "select * from rehab_adverse_events")).length, 0, "adverse events are staff-only");
eq((await rows(alice, "select * from rehab_reviews")).length, 0, "clinician reviews are staff-only");

/* ----------------------------- 5. programme building ----------------------------- */
await fails(admin, "rehab_admin_save_plan", { p_assessment_id: b1.id, p_programme_id: null, p_payload: PLAN() }, /assessment_not_cleared/, "no programme for a red-flag assessment until cleared");
await fails(admin, "rehab_admin_set_assessment_status", { p_assessment_id: b1.id, p_status: "cleared_for_programme", p_note: "ok" }, /clearance note/, "clearance needs a real note");
await rpc(admin, "rehab_admin_set_assessment_status", { p_assessment_id: b1.id, p_status: "cleared_for_programme", p_note: "Assessed in clinic, cauda equina excluded, cleared for exercise." });
await fails(alice, "rehab_admin_save_plan", { p_assessment_id: a1.id, p_programme_id: null, p_payload: PLAN() }, /not authorised/, "patients cannot prescribe");
await fails(admin, "rehab_admin_save_plan", { p_assessment_id: a1.id, p_programme_id: null, p_payload: PLAN({ sessions: [{ day_number: 1, title: "Day 1", exercises: [{ exercise_id: "BAD ID", exercise_title: "x", sets: 1 }] }] }) }, /./, "invalid exercise ids are rejected");
await fails(admin, "rehab_admin_save_plan", { p_assessment_id: a1.id, p_programme_id: null, p_payload: PLAN({ sessions: [{ day_number: 1, title: "Day 1", exercises: [{ exercise_id: "quad-set", exercise_title: "Quad set", sets: 99 }] }] }) }, /out of range/, "dosage limits are enforced");
const plan = await rpc(admin, "rehab_admin_save_plan", { p_assessment_id: a1.id, p_programme_id: null, p_payload: PLAN() });
eq(plan.days, 3, "3 days saved");
eq(plan.status, "draft", "a new programme is a draft");
eq((await sql("select status from rehab_assessments where id = $1", [a1.id]))[0].status, "programme_created", "assessment marked as programme created");
eq((await rows(alice, "select id from rehab_programmes")).length, 0, "patients cannot see a draft programme");
eq((await rows(alice, "select id from rehab_session_exercises")).length, 0, "patients cannot see draft exercises");
const ov0 = await rpc(alice, "rehab_my_overview", {});
ok(!ov0.programme, "the patient dashboard shows no programme yet");
await fails(admin, "rehab_admin_save_plan", { p_assessment_id: a1.id, p_programme_id: null, p_payload: PLAN() }, /assessment_not_cleared|patient_has_programme/, "no second programme while one is live");

/* ----------------------------- 6. approval opens Day 1 only ----------------------------- */
await fails(alice, "rehab_admin_programme_action", { p_programme_id: plan.id, p_action: "approve" }, /not authorised/, "patients cannot approve");
await rpc(admin, "rehab_admin_programme_action", { p_programme_id: plan.id, p_action: "approve" });
const ov1 = await rpc(alice, "rehab_my_overview", {});
eq(ov1.programme.status, "active", "programme is active");
eq(ov1.sessions.map((s) => s.status), ["unlocked", "locked", "locked"], "Day 1 open, Day 2 and 3 locked");
eq(ov1.sessions[1].exercise_count, null, "locked days do not reveal their exercises");
const day1 = ov1.sessions[0].id;
const day2 = ov1.sessions[1].id;
const day3 = ov1.sessions[2].id;
const s1 = await rpc(alice, "rehab_my_session", { p_session_id: day1 });
eq(s1.access, "open", "Day 1 is open");
eq(s1.exercises.length, 2, "Day 1 exercises visible");
const s2 = await rpc(alice, "rehab_my_session", { p_session_id: day2 });
eq(s2.access, "locked", "Day 2 is locked");
eq(s2.exercises, [], "Day 2 exercises are hidden");
const visible = (await rows(alice, "select exercise_id from rehab_session_exercises")).map((r) => r.exercise_id).sort();
eq(visible, ["heel-slide", "quad-set"], "RLS shows only Day 1 exercises (the locked days stay hidden even by direct query)");
await fails(bob, "rehab_my_session", { p_session_id: day1 }, /session not found/, "another patient cannot open Alice's day");
eq((await rows(bob, "select id from rehab_sessions")).length, 0, "another patient sees no sessions of Alice");
eq((await rows(alice, "select day_number from rehab_sessions order by day_number")).map((r) => r.day_number), [1], "a direct query shows only the released day (locked days' titles and notes stay hidden)");
await fails(alice, "rehab_submit_feedback", { p_session_id: day2, p_payload: FEEDBACK() }, /session_not_open/, "a locked day cannot receive feedback");
await fails(bob, "rehab_submit_feedback", { p_session_id: day1, p_payload: FEEDBACK() }, /session not found/, "another patient cannot submit feedback for Alice's day");

/* ----------------------------- 7. feedback does not open the next day ----------------------------- */
await fails(alice, "rehab_submit_feedback", { p_session_id: day1, p_payload: FEEDBACK({ pain_during: 14 }) }, /out of range/, "pain is 0-10");
await fails(alice, "rehab_submit_feedback", { p_session_id: day1, p_payload: FEEDBACK({ safety_flags: ["nope"] }) }, /unknown value/, "unknown safety flags are rejected");
const ex = (await sql("select id from rehab_session_exercises where session_id = $1 order by position", [day1])).map((r) => r.id);
const fb1 = await rpc(alice, "rehab_submit_feedback", { p_session_id: day1, p_payload: FEEDBACK({ exercises: [{ session_exercise_id: ex[0], done: true, sets_done: 2, reps_done: 10, difficulty: 4, pain_during: 3 }] }) });
eq(fb1.status, "awaiting_review", "feedback waits for the clinician");
eq(fb1.auto_released, false, "submitting feedback does NOT release the next day");
const ov2 = await rpc(alice, "rehab_my_overview", {});
eq(ov2.sessions.map((s) => s.status), ["awaiting_review", "locked", "locked"], "Day 2 stays locked after feedback");
eq((await sql("select count(*)::int n from rehab_exercise_completions where feedback_id = (select id from rehab_feedback where session_id = $1)", [day1]))[0].n, 2, "a completion row exists for every exercise");
eq((await sql("select timepoint from rehab_errp_observations where session_id = $1 order by timepoint", [day1])).map((r) => r.timepoint), ["before", "during", "immediately_after"], "ERRP before/during/after saved");
eq((await sql("select patient_id from rehab_feedback where session_id = $1", [day1]))[0].patient_id, aliceReg.id, "feedback is tied to the right patient and session");
const dupFb = await rpc(alice, "rehab_submit_feedback", { p_session_id: day1, p_payload: FEEDBACK() });
ok(dupFb.duplicate === true, "double submit is harmless");
eq((await sql("select count(*)::int n from rehab_feedback where session_id = $1", [day1]))[0].n, 1, "no duplicate feedback rows");
eq((await rows(admin, "select count(*)::int n from rehab_notifications where audience = 'admin' and kind = 'feedback_received'"))[0].n, 1, "admin is notified");

/* ----------------------------- 8. clinician decision opens Day 2 ----------------------------- */
await fails(alice, "rehab_admin_review_session", { p_session_id: day1, p_decision: "progress" }, /not authorised/, "patients cannot approve progress");
await fails(admin, "rehab_admin_review_session", { p_session_id: day1, p_decision: "fly" }, /invalid decision/, "unknown decisions are rejected");
await fails(admin, "rehab_admin_review_session", { p_session_id: day2, p_decision: "progress" }, /session_not_awaiting_review/, "only a day with feedback can be reviewed");
const dec = await rpc(admin, "rehab_admin_review_session", { p_session_id: day1, p_decision: "progress", p_notes: "Pain settled.", p_patient_message: "Great work — Day 2 is ready.", p_suggestion: { suggestion: "progress" } });
eq(dec.released_session_id, day2, "approval releases exactly the next day");
const ov3 = await rpc(alice, "rehab_my_overview", {});
eq(ov3.sessions.map((s) => s.status), ["reviewed", "unlocked", "locked"], "Day 2 open after approval, Day 3 still locked");
eq(ov3.sessions[0].review_message, "Great work — Day 2 is ready.", "the patient sees the clinician message");
eq((await rows(alice, "select count(*)::int n from rehab_reviews"))[0].n, 0, "internal notes stay hidden from the patient");
await fails(admin, "rehab_admin_review_session", { p_session_id: day1, p_decision: "progress" }, /session_not_awaiting_review/, "a review cannot be repeated");
eq((await rpc(alice, "rehab_my_session", { p_session_id: day1 })).access, "done", "completed days stay readable");

/* ----------------------------- 9. configurable rule: minimum gap between days ----------------------------- */
await rpc(admin, "rehab_admin_save_plan", { p_assessment_id: null, p_programme_id: plan.id, p_payload: PLAN({ min_hours_between_sessions: 12, sessions: (await rpc(admin, "rehab_admin_patient", { p_patient_id: aliceReg.id })).programmes[0].sessions.map((s) => ({ id: s.session.id, day_number: s.session.day_number, title: s.session.title, exercises: s.exercises.length ? s.exercises.map((e) => ({ exercise_id: e.exercise_id, exercise_title: e.exercise_title, sets: e.sets, reps: e.reps })) : [{ exercise_id: "x1", exercise_title: "x1" }] })) }) });
eq((await sql("select count(*)::int n from rehab_feedback where session_id = $1", [day1]))[0].n, 1, "editing the plan keeps reviewed history");
eq((await sql("select count(*)::int n from rehab_session_exercises where session_id = $1", [day1]))[0].n, 2, "a reviewed day's exercises are immutable");
const fb2 = await rpc(alice, "rehab_submit_feedback", { p_session_id: day2, p_payload: FEEDBACK({ pain_during: 6, pain_after: 4 }) });
eq(fb2.status, "awaiting_review", "Day 2 feedback awaits review");
const dec2 = await rpc(admin, "rehab_admin_review_session", { p_session_id: day2, p_decision: "maintain", p_notes: "Pain 6 during — hold the level.", p_repeat_current: true });
ok(dec2.released_session_id, "maintain with repeat opens a repeat day");
const days = await sql("select day_number, title, status from rehab_sessions where programme_id = $1 order by day_number", [plan.id]);
eq(days.map((d) => d.day_number), [1, 2, 3, 4], "repeat day is inserted and later days shift");
ok(/repeat/.test(days[2].title) && days[2].status === "unlocked", "the repeat day is the next one and is open");
ok(days[3].status === "locked", "the original Day 3 is now Day 4 and stays locked");
const repeatDay = (await sql("select id, available_from > now() as later from rehab_sessions where programme_id = $1 and day_number = 3", [plan.id]))[0];
ok(repeatDay.later === true, "the 12 h minimum gap schedules the next day for later");
eq((await rpc(alice, "rehab_my_session", { p_session_id: repeatDay.id })).access, "scheduled", "the patient sees the day as scheduled, not open");
eq((await rows(alice, "select exercise_id from rehab_session_exercises where session_id = $1", [repeatDay.id])).length, 0, "a scheduled day's exercises are hidden by RLS until it is available");
await fails(alice, "rehab_submit_feedback", { p_session_id: repeatDay.id, p_payload: FEEDBACK() }, /session_not_open/, "a scheduled day cannot receive feedback early");
await sql("update rehab_sessions set available_from = now() - interval '1 minute' where id = $1", [repeatDay.id]);
eq((await rpc(alice, "rehab_my_session", { p_session_id: repeatDay.id })).access, "open", "the day opens when its time comes");

/* ----------------------------- 10. ERRP follow-up windows ----------------------------- */
await sql("update rehab_feedback set submitted_at = now() - interval '30 hours' where session_id = $1", [day1]);
await fails(alice, "rehab_submit_followup", { p_session_id: day1, p_timepoint: "later_same_day", p_payload: { pain: 2, symptom_response: "same" } }, /window_closed/, "old days no longer accept a same-day follow-up");
await fails(alice, "rehab_submit_followup", { p_session_id: day2, p_timepoint: "48h", p_payload: { pain: 2, symptom_response: "same" } }, /timepoint_not_scheduled/, "48 h check-in only when the clinician schedules it");
await fails(alice, "rehab_submit_followup", { p_session_id: day2, p_timepoint: "later_same_day", p_payload: { pain: 2, symptom_response: "same" } }, /too_early/, "too early for the same-day check-in");
await sql("update rehab_feedback set submitted_at = now() - interval '5 hours' where session_id = $1", [day2]);
await rpc(alice, "rehab_submit_followup", { p_session_id: day2, p_timepoint: "later_same_day", p_payload: { pain: 3, function_score: 7, symptom_response: "same" } });
await fails(alice, "rehab_submit_followup", { p_session_id: day2, p_timepoint: "24h", p_payload: { pain: 3, symptom_response: "same" } }, /too_early/, "24 h check-in cannot be filled in at 5 h");
await sql("update rehab_feedback set submitted_at = now() - interval '26 hours' where session_id = $1", [day2]);
const dupFollow = await rpc(alice, "rehab_submit_followup", { p_session_id: day2, p_timepoint: "later_same_day", p_payload: { pain: 3, symptom_response: "same" } }).catch((e) => ({ err: e.message }));
ok(dupFollow.duplicate === true || /window_closed/.test(dupFollow.err ?? ""), "a repeated check-in is harmless");
await rpc(alice, "rehab_submit_followup", { p_session_id: day2, p_timepoint: "24h", p_payload: { pain: 5, function_score: 6, symptom_response: "worse", new_symptoms: false } });
eq((await rows(admin, "select count(*)::int n from rehab_notifications where kind = 'recovery_worse'"))[0].n, 1, "a 'worse' recovery report alerts the clinician");
eq((await sql("select count(*)::int n from rehab_errp_observations where session_id = $1", [day2]))[0].n, 5, "five ERRP timepoints for Day 2");
await fails(bob, "rehab_submit_followup", { p_session_id: day2, p_timepoint: "24h", p_payload: { pain: 1, symptom_response: "better" } }, /session not found/, "another patient cannot add follow-ups to Alice's day");

/* ----------------------------- 11. concerning symptoms pause everything ----------------------------- */
const day3Id = repeatDay.id;
const flagged = await rpc(alice, "rehab_submit_feedback", { p_session_id: day3Id, p_payload: FEEDBACK({ safety_flags: ["fb_calf"], unusual_symptoms: true, unusual_text: "Calf swelling" }) });
eq(flagged.flag_level, "emergency", "emergency feedback flagged");
eq(flagged.status, "awaiting_review", "flagged days always wait for the clinician");
eq((await rpc(alice, "rehab_my_overview", {})).programme.status, "paused", "the programme is paused automatically");
eq((await sql("select severity, source from rehab_adverse_events where patient_id = $1", [aliceReg.id]))[0], { severity: "severe", source: "patient" }, "an adverse event is recorded");
eq((await rows(admin, "select count(*)::int n from rehab_notifications where kind = 'safety_flag' and severity = 'urgent'"))[0].n, 1, "urgent alert for the clinician");
eq((await rpc(alice, "rehab_my_session", { p_session_id: day3Id })).access, "done", "the flagged day itself is closed");
const lockedAfter = (await rpc(alice, "rehab_my_overview", {})).sessions.map((s) => s.status);
ok(!lockedAfter.includes("unlocked"), "no day stays open while paused");
await fails(admin, "rehab_admin_review_session", { p_session_id: day3Id, p_decision: "progress" }, /programme_not_active_resume_first/, "cannot progress a paused programme");
await fails(admin, "rehab_admin_programme_action", { p_programme_id: plan.id, p_action: "resume", p_reason: "x" }, /reason is required/, "resuming needs a written reason");
await rpc(admin, "rehab_admin_review_session", { p_session_id: day3Id, p_decision: "reassess", p_notes: "Possible DVT — referred urgently.", p_patient_message: "Please see a doctor today." });
eq((await rpc(alice, "rehab_my_overview", {})).programme.status, "paused", "reassess keeps the programme paused");
await rpc(admin, "rehab_admin_programme_action", { p_programme_id: plan.id, p_action: "resume", p_reason: "Doppler negative; cleared to continue." });
eq((await rpc(alice, "rehab_my_overview", {})).programme.status, "active", "the clinician can resume after review");
await rpc(admin, "rehab_admin_update_adverse_event", { p_id: (await sql("select id from rehab_adverse_events limit 1"))[0].id, p_status: "closed", p_action_taken: "Referred, negative." });
const evId = await rpc(admin, "rehab_admin_log_adverse_event", { p_patient_id: aliceReg.id, p_session_id: null, p_severity: "mild", p_description: "Muscle soreness after Day 2 (patient called)." });
ok(evId, "the clinician can log an adverse event manually");

/* ----------------------------- 12. admin override of the lock ----------------------------- */
const lockedId = (await sql("select id from rehab_sessions where programme_id = $1 and status = 'locked' order by day_number limit 1", [plan.id]))[0].id;
await fails(admin, "rehab_admin_override_unlock", { p_session_id: lockedId, p_reason: "short" }, /reason is required/, "override needs a reason");
await fails(alice, "rehab_admin_override_unlock", { p_session_id: lockedId, p_reason: "I want to skip ahead please" }, /not authorised/, "patients cannot override");
await rpc(admin, "rehab_admin_override_unlock", { p_session_id: lockedId, p_reason: "Patient travelling — bringing the day forward." });
eq((await sql("select status, release_mode from rehab_sessions where id = $1", [lockedId]))[0], { status: "unlocked", release_mode: "override" }, "override opens a locked day and records how");

/* ----------------------------- 13. automatic unlock rule ----------------------------- */
const cleared = b1.id;
const bobPlan = await rpc(admin, "rehab_admin_save_plan", { p_assessment_id: cleared, p_programme_id: null, p_payload: { ...PLAN(), title: "Back endurance", unlock_mode: "auto_after_feedback", auto_unlock_max_pain: 5, min_hours_between_sessions: 0 } });
await rpc(admin, "rehab_admin_programme_action", { p_programme_id: bobPlan.id, p_action: "approve" });
const bobSessions = (await rpc(bob, "rehab_my_overview", {})).sessions;
const bobAuto = await rpc(bob, "rehab_submit_feedback", { p_session_id: bobSessions[0].id, p_payload: FEEDBACK({ pain_during: 4 }) });
ok(bobAuto.auto_released === true && bobAuto.status === "reviewed", "auto rule: complete feedback with low pain opens the next day");
eq((await sql("select decision from rehab_reviews where session_id = $1", [bobSessions[0].id]))[0].decision, "auto_continue", "the automatic release is recorded as a rule, not a clinician decision");
const bobDay2 = (await rpc(bob, "rehab_my_overview", {})).sessions[1].id;
const bobHigh = await rpc(bob, "rehab_submit_feedback", { p_session_id: bobDay2, p_payload: FEEDBACK({ pain_during: 8 }) });
ok(bobHigh.auto_released === false && bobHigh.status === "awaiting_review", "auto rule: pain above the limit waits for the clinician");
await fails(bob, "rehab_my_session", { p_session_id: day1 }, /session not found/, "bob still cannot open Alice's days");

/* ----------------------------- 14. audit log ----------------------------- */
const audit = await sql("select count(*)::int n from rehab_audit_log");
ok(audit[0].n > 30, "actions are written to the audit log");
const kinds = new Set((await sql("select action from rehab_audit_log")).map((r) => r.action));
for (const needed of ["insert", "update", "plan_saved", "programme_approve", "session_reviewed", "feedback_submitted", "safety_flag_raised", "session_override_unlock", "programme_resume"]) {
  ok(kinds.has(needed), `audit has '${needed}'`);
}
eq((await sql("select actor_role from rehab_audit_log where action = 'session_reviewed' limit 1"))[0].actor_role, "admin", "audit records who acted (admin)");
eq((await sql("select actor_role from rehab_audit_log where action = 'feedback_submitted' limit 1"))[0].actor_role, "patient", "audit records who acted (patient)");
await assert.rejects(() => sql("update rehab_audit_log set action = 'x'"), /append-only/);
await assert.rejects(() => sql("delete from rehab_audit_log"), /append-only/);
checks += 2;
eq((await rows(admin, "select count(*)::int n from rehab_audit_log"))[0].n, audit[0].n, "admins can read the audit log");

/* ----------------------------- 15. admin views ----------------------------- */
const inbox = await rpc(admin, "rehab_admin_inbox", {});
ok(Array.isArray(inbox.awaiting_review) && inbox.awaiting_review.some((x) => x.full_name === "Bob Ali"), "inbox lists days awaiting review");
const record = await rpc(admin, "rehab_admin_patient", { p_patient_id: aliceReg.id });
ok(record.programmes[0].sessions.length >= 4 && record.adverse_events.length >= 2 && record.audit.length > 5, "admin sees the full record");
ok(!("user_id" in record.patient), "internal account ids are not exposed to the UI");
ok((await rpc(admin, "rehab_admin_patients", {})).length === 2, "admin patient list");

/* ----------------------------- 16. safety net: nothing in the public schema is open to anon ----------------------------- */
const anonCan = await sql(`select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname like 'rehab_%' and c.relkind = 'r'
     and (has_table_privilege('anon', c.oid, 'select') or has_table_privilege('anon', c.oid, 'insert') or has_table_privilege('anon', c.oid, 'update') or has_table_privilege('anon', c.oid, 'delete'))`);
eq(anonCan, [], "anon has no privileges on any rehab table");
const authWrite = await sql(`select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname like 'rehab_%' and c.relkind = 'r'
     and (has_table_privilege('authenticated', c.oid, 'insert') or has_table_privilege('authenticated', c.oid, 'update') or has_table_privilege('authenticated', c.oid, 'delete'))`);
eq(authWrite, [], "signed-in users have no direct write privileges on any rehab table");
const noRls = await sql(`select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname like 'rehab_%' and c.relkind = 'r' and not c.relrowsecurity`);
eq(noRls, [], "row level security is on for every rehab table");
const openFns = await sql(`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname like 'rehab%' and has_function_privilege('anon', p.oid, 'execute')`);
eq(openFns, [], "anon can execute none of the rehab functions");
const internalOpen = await sql(`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname like 'rehab\\_\\_%' and has_function_privilege('authenticated', p.oid, 'execute')`);
eq(internalOpen, [], "internal helpers are not executable by signed-in users");
const definerNoPath = await sql(`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname like 'rehab%' and p.prosecdef and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')`);
eq(definerNoPath, [], "every security-definer function pins its search_path");

console.log(`RehabVerse database OK — ${checks} checks passed (real migration on Postgres ${(await sql("show server_version"))[0].server_version}).`);
await db.close();
