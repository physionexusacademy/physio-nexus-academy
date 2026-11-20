import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildHistoryBrief, briefToText, BRIEF_FOOTER, type Brief } from "../src/lib/rehabverse/brief.ts";
import type { AdminAiConversation, AdminAssessment } from "../src/lib/rehabverse/api-types.ts";

/**
 * RehabVerse history brief: the clinician's view of an intake. It is built by fixed rules from the patient's own answers, so the tests
 * prove what matters: nothing is invented, nothing is a diagnosis, free text is quoted exactly, the patient's corrections after the chat are
 * shown, safety wording the screening tick missed is surfaced, and gaps become questions. No model is involved anywhere.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };

const assessment = (over: Partial<AdminAssessment> = {}): AdminAssessment => ({
  id: "a1", patient_id: "p1", status: "submitted", regions: ["lumbar"], symptoms: ["pain", "stiffness"], pain_now: 7, pain_worst: 9, pain_best: 3,
  duration: "1_4w", onset: "gradual", possible_cause: "lifting a heavy box", aggravating: "sitting and bending forward", relieving: "walking",
  functional_limitations: "it is hard to lift my child", previous_treatment: "paracetamol", medical_conditions: "none", medications: "None reported",
  other_symptoms: null, own_words: "I want to pick up my daughter without fear", red_flag_ids: [], red_flag_level: "none", submitted_at: "2026-11-20T09:00:00Z",
  clearance_note: null, admin_notes: null, reviewed_at: null, ...over,
});
const patient = { age_years: 34, sex: "female", preferred_language: "en" as const };
const chat = (over: Partial<AdminAiConversation> = {}): AdminAiConversation => ({
  id: "c1", kind: "intake", language: "en", status: "completed", messages: [
    { role: "assistant", text: "Hello, I am an AI assistant." }, { role: "patient", text: "my lower back hurts when I sit" },
  ], draft: { regions: ["lumbar"], symptoms: ["pain", "stiffness"], pain_now: 7, pain_worst: 9, pain_best: 3, duration: "1_4w", onset: "gradual", possible_cause: "lifting a heavy box",
    aggravating: "sitting and bending forward", relieving: "walking", functional_limitations: "it is hard to lift my child", previous_treatment: "paracetamol",
    medical_conditions: "none", medications: "None reported", other_symptoms: "", own_words: "I want to pick up my daughter without fear" },
  consent_version: "v1", consented_at: "2026-11-20T08:50:00Z", models: ["script"], turns: 13, fallback_turns: 13, safety_alert: null, assessment_id: "a1",
  created_at: "2026-11-20T08:50:00Z", updated_at: "2026-11-20T08:59:00Z", ...over,
});
const unquoted = (text: string) => text.replace(/“[^”]*”/g, "");
const allText = (brief: Brief) => JSON.stringify(brief);

/* 1. The story is made only of the patient's answers. */
{
  const brief = buildHistoryBrief({ patient, assessment: assessment(), conversation: chat() });
  eq(brief.headline, "34-year-old female · lower back · 1–4 weeks · pain 7/10", "the headline is age, sex, area, duration and pain");
  const story = brief.narrative.join(" ");
  ok(story.includes("reporting pain and stiffness in the lower back, present for 1–4 weeks"), "the first sentence names symptoms, area and duration");
  ok(story.includes("Pain is 7/10 now (worst 9/10, best 3/10)."), "the pain scores are stated");
  ok(buildHistoryBrief({ patient, assessment: assessment({ pain_worst: null, pain_best: null }) }).narrative.includes("Pain is 7/10 now."), "a missing worst/best is left out, not shown as a dash");
  ok(buildHistoryBrief({ patient, assessment: assessment({ pain_best: null }) }).narrative.includes("Pain is 7/10 now (worst 9/10)."), "only the scores that exist are stated");
  ok(story.includes("It started slowly, over time."), "the onset is stated");
  ok(story.includes("“lifting a heavy box”") && story.includes("“sitting and bending forward”") && story.includes("“walking”") && story.includes("“it is hard to lift my child”"), "free text is quoted exactly, never paraphrased");
  ok(story.includes("Red-flag screening: nothing ticked."), "the screening result is stated");
  // nothing invented: every number outside the patient's quotes is one the patient (or the form) gave
  const allowed = new Set(["34", "7", "9", "3", "10", "1", "4"]);
  for (const n of unquoted(story + " " + brief.headline).match(/\d+/g) ?? []) ok(allowed.has(n), `the number ${n} comes from the assessment`);
}

/* 2. It never diagnoses or advises. */
{
  const forbidden = /(diagnos|likely|probabl|suggests|consistent with|indicat|should|recommend|you must|treat with|sciatica|herniat|slipped|arthritis|strain|sprain)/i;
  const samples = [
    buildHistoryBrief({ patient, assessment: assessment(), conversation: chat() }),
    buildHistoryBrief({ patient, assessment: assessment({ regions: ["knee", "hip", "multiple"], pain_now: 9, duration: "gt_6m", symptoms: ["weakness", "balance"], red_flag_ids: ["rf_progressive_neuro"], red_flag_level: "urgent", medications: "warfarin" }) }),
    buildHistoryBrief({ patient: { ...patient, age_years: 72 }, assessment: assessment({ onset: null, possible_cause: null, previous_treatment: null, own_words: null, pain_worst: null }) }),
  ];
  for (const brief of samples) {
    const machine = [brief.headline, ...brief.narrative.map(unquoted), ...brief.asks.map((a) => a.text + " " + a.because), ...brief.checks, brief.footer].join(" ");
    ok(!forbidden.test(machine.replace(/not a diagnosis/gi, "")), "the brief's own words contain no diagnosis, probability or advice");
  }
  ok(samples[0].footer === BRIEF_FOOTER && /not written by AI/.test(BRIEF_FOOTER) && /physiotherapist makes every decision/.test(BRIEF_FOOTER), "the brief says who writes it and who decides");
}

/* 3. Safety: ticked flags, and wording the screening tick missed. */
{
  const ticked = buildHistoryBrief({ patient, assessment: assessment({ red_flag_ids: ["rf_bladder", "rf_cancer"], red_flag_level: "emergency" }) });
  eq(ticked.safety.level, "emergency", "the worst level is kept");
  eq(ticked.safety.ticked.map((f) => f.id), ["rf_bladder", "rf_cancer"], "every ticked flag is listed");
  ok(ticked.narrative.join(" ").includes("Red-flag screening ticked:"), "ticked flags are in the story");

  const missed = buildHistoryBrief({ patient, assessment: assessment({ own_words: "I have noticed weight loss and the pain is worst at night", red_flag_ids: [] }) });
  ok(missed.safety.crossChecks.some((c) => c.kind === "serious-pathology" && c.flags.includes("rf_cancer") && c.where === "the patient's own words"), "wording that matches an alert is surfaced when its screening question was not ticked");
  const confirmed = buildHistoryBrief({ patient, assessment: assessment({ own_words: "I have noticed weight loss and the pain is worst at night", red_flag_ids: ["rf_cancer"], red_flag_level: "urgent" }) });
  eq(confirmed.safety.crossChecks.length, 0, "...and is not repeated when the patient already ticked that question");

  const roman = buildHistoryBrief({ patient, assessment: assessment({ own_words: "mujhe seene mein dard hai aur saans nahi aa rahi" }) });
  ok(roman.safety.crossChecks.some((c) => c.kind === "cardiac" || c.kind === "breathing"), "Roman Urdu wording is screened too");
  const fromChat = buildHistoryBrief({ patient, assessment: assessment(), conversation: chat({ messages: [{ role: "patient", text: "I have chest pain and I can't breathe properly" }] }) });
  ok(fromChat.safety.crossChecks.some((c) => c.where === "the AI conversation"), "what the patient typed in the chat is screened as well");
  const crisis = buildHistoryBrief({ patient, assessment: assessment({ own_words: "I want to end my life" }) });
  ok(crisis.safety.crossChecks.some((c) => c.kind === "crisis"), "a wording with no screening question (an emotional crisis) is always surfaced");
  eq(buildHistoryBrief({ patient, assessment: assessment(), conversation: chat({ status: "safety_stop", safety_alert: "cardiac" }) }).safety.chatAlert, "cardiac", "a safety stop in the AI conversation is shown");
  ok(missed.safety.crossChecks.every((c) => c.quote.length <= 160), "quotes are kept short");
}

/* 4. What the patient corrected after the chat. */
{
  const same = buildHistoryBrief({ patient, assessment: assessment(), conversation: chat() });
  eq(same.changes, [], "no changes when the form matches the chat");
  const edited = buildHistoryBrief({ patient, assessment: assessment({ pain_now: 5, medications: "Amlodipine 5 mg", regions: ["lumbar", "hip"], pain_worst: null }), conversation: chat() });
  const byLabel = Object.fromEntries((edited.changes ?? []).map((c) => [c.label, c]));
  eq([byLabel["Pain now"].chat, byLabel["Pain now"].form], ["7/10", "5/10"], "a changed score is shown both ways");
  eq([byLabel["Medications"].chat, byLabel["Medications"].form], ["None reported", "Amlodipine 5 mg"], "a changed answer is shown both ways");
  eq([byLabel["Areas"].chat, byLabel["Areas"].form], ["Lower back", "Lower back, Hip"], "areas are shown by name");
  eq([byLabel["Pain, worst"].chat, byLabel["Pain, worst"].form], ["9/10", "—"], "a removed answer is shown as removed");
  eq((edited.changes ?? []).length, 4, "only the fields that differ are listed");
  eq(buildHistoryBrief({ patient, assessment: assessment() }).changes, null, "no AI conversation: no comparison");
  eq(buildHistoryBrief({ patient, assessment: assessment() }).source.kind, "form", "the source is the form when there was no chat");
  const withChat = buildHistoryBrief({ patient, assessment: assessment(), conversation: chat() });
  ok(withChat.source.kind === "ai_chat" && /13 turns, 13 scripted/.test(withChat.source.text) && /checked and submitted by the patient/.test(withChat.source.text), "the source line says it came from the AI chat and was submitted by the patient");
  eq(buildHistoryBrief({ patient, assessment: assessment(), conversation: chat({ draft: {} }) }).changes?.length, 15, "an empty draft shows every answer as added in the form (the free-text 'other symptoms' is empty on both sides)");
}

/* 5. Conditions and medicines mentioned. */
{
  const brief = buildHistoryBrief({ patient, assessment: assessment({ medical_conditions: "diabetes and high blood pressure, had an operation on my knee in 2019", medications: "warfarin and metformin" }) });
  const labels = brief.mentions.map((m) => m.label);
  for (const expected of ["Diabetes", "High blood pressure", "Blood thinner", "Fracture, surgery or implant"]) ok(labels.includes(expected), `${expected} is picked up from the history`);
  eq(buildHistoryBrief({ patient, assessment: assessment() }).mentions, [], "nothing is mentioned when nothing relevant was said");
  ok(brief.asks.some((a) => a.id === "H9"), "mentioned conditions become a question about details");
  ok(!brief.mentions.some((m) => m.label === "Heart condition"), "no false matches (diabetes is not a heart condition)");
}

/* 6. Gaps become questions, each with its reason. */
{
  const sparse = buildHistoryBrief({ patient: { ...patient, age_years: 72 }, assessment: assessment({ onset: "unknown", possible_cause: null, pain_worst: null, previous_treatment: null, own_words: null, regions: ["lumbar", "hip", "knee"], pain_now: 8, duration: "gt_6m", symptoms: ["weakness"] }) });
  const ids = sparse.asks.map((a) => a.id);
  for (const id of ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H10", "H11"]) ok(ids.includes(id), `${id} is asked for in a sparse history`);
  ok(sparse.asks.every((a) => a.text.length > 10 && a.because.length > 10), "every question says why it is asked");
  ok(buildHistoryBrief({ patient, assessment: assessment({ other_symptoms: "a bit of tingling in my right leg" }) }).asks.some((a) => a.id === "H12"), "numbness or tingling in the patient's words becomes a question about it");
  ok(buildHistoryBrief({ patient, assessment: assessment({ other_symptoms: "pairon mein jhunjhuni rehti hai" }) }).asks.some((a) => a.id === "H12"), "...in Roman Urdu too");
  const full = buildHistoryBrief({ patient, assessment: assessment({ pain_now: 4, duration: "lt_1w" }) });
  eq(full.asks.map((a) => a.id), [], "a complete, low-risk history asks nothing extra");
  eq(buildHistoryBrief({ patient, assessment: assessment({ pain_worst: 4, pain_now: 7 }) }).checks.length, 1, "worst pain lower than pain now is flagged for checking");
  eq(buildHistoryBrief({ patient, assessment: assessment({ pain_best: 6, pain_now: 4 }) }).checks.length, 1, "best pain higher than pain now is flagged for checking");
  eq(buildHistoryBrief({ patient, assessment: assessment() }).checks.length, 0, "consistent scores raise no check");
}

/* 7. Roman Urdu answers are quoted as written. */
{
  const brief = buildHistoryBrief({ patient: { ...patient, preferred_language: "ru" }, assessment: assessment({ possible_cause: "bhari wazan uthaya tha", aggravating: "baith kar jhukna", relieving: "chalna" }) });
  const story = brief.narrative.join(" ");
  ok(story.includes("“bhari wazan uthaya tha”") && story.includes("“baith kar jhukna”") && story.includes("“chalna”"), "Roman Urdu answers appear exactly as the patient wrote them");
}

/* 8. Robust and tidy. */
{
  const minimal = buildHistoryBrief({ patient: { age_years: 20, sex: null, preferred_language: "en" }, assessment: assessment({ regions: [], symptoms: [], pain_now: 0, pain_worst: null, pain_best: null, duration: null, onset: null, possible_cause: null, aggravating: null, relieving: null, functional_limitations: null, previous_treatment: null, medical_conditions: null, medications: null, other_symptoms: null, own_words: null }) });
  ok(minimal.narrative.length >= 3 && minimal.headline.includes("area not recorded"), "an almost empty assessment still produces a readable brief");
  const text = briefToText(buildHistoryBrief({ patient, assessment: assessment({ red_flag_ids: ["rf_chest"], red_flag_level: "emergency", own_words: "I want to end my life" }), conversation: chat() }), { reference_code: "RV-0001", submitted_at: "20 Nov 2026" });
  ok(text.startsWith("HISTORY BRIEF · RV-0001 · submitted 20 Nov 2026") && text.includes("SAFETY") && text.includes("STORY") && text.includes(BRIEF_FOOTER), "the copy-as-text version has its sections and the footer");
  ok(!/undefined|NaN|\[object|null/.test(text) && !/undefined|NaN|\[object/.test(allText(minimal)), "no 'undefined', 'null' or 'NaN' reaches the reader");
  eq(JSON.stringify(buildHistoryBrief({ patient, assessment: assessment(), conversation: chat() })), JSON.stringify(buildHistoryBrief({ patient, assessment: assessment(), conversation: chat() })), "the same answers always give the same brief");
  const spaced = buildHistoryBrief({ patient, assessment: assessment({ aggravating: "  sitting \n and   bending  " }) });
  ok(spaced.narrative.join(" ").includes("“sitting and bending”"), "stray spaces and line breaks in the patient's text are tidied");
}

/* 9. Wiring: where the brief is shown. */
{
  const src = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
  const record = src("src/components/rehabverse/admin/AdminPatientRecord.tsx");
  ok(record.includes("<HistoryBrief") && record.includes('"#brief"'), "the admin's patient record shows the brief and links to it");
  const view = src("src/components/rehabverse/admin/HistoryBrief.tsx");
  ok(view.includes("buildHistoryBrief") && view.includes("briefToText") && !view.includes("dangerouslySetInnerHTML"), "the brief is rendered as text, never as HTML");
  ok(!/from "@\/lib\/rehabverse\/ai\/(model|intake-turn|prompts)/.test(src("src/lib/rehabverse/brief.ts")) && !/getCloudflareContext|\.run\(|fetch\(/.test(src("src/lib/rehabverse/brief.ts")), "the brief library never calls a model or the network");
}

console.log(`RehabVerse history brief: ${checks} checks passed (nothing invented, no diagnosis, quotes exact, corrections after the chat shown, missed safety wording surfaced, gaps asked).`);
