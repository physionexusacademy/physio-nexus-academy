"use server";

import { RehabError, getAdminOutcomes, isStaff, rpc } from "@/lib/rehabverse/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPlanItems, timepointsFor } from "@/lib/outcomes/plan";
import { instrumentFor } from "@/lib/outcomes/instruments";
import { scoreResponse } from "@/lib/outcomes/scoring";
import type { TimepointKey } from "@/lib/outcomes/types";
import { checkPolished } from "@/lib/outcomes/feedback";
import { callChat } from "@/lib/rehabverse/ai/model";
import type { AiAssist, AiSignoffDecision, PlanPayload, ReviewDecision } from "@/lib/rehabverse/api-types";
import { buildReviewPack } from "@/lib/rehabverse/ai/review-pack";
import { emailPatient, type PatientEmailKind } from "@/lib/rehabverse/notify";

/**
 * Clinician actions. The database functions refuse anyone who is not owner/admin, so these are safe
 * even if called directly; the reason texts required by the database are checked there too.
 */
export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

const fail = (e: unknown): { ok: false; error: string } => ({ ok: false, error: e instanceof RehabError ? e.code : "failed" });

export async function setAssessmentStatusAction(assessmentId: string, status: "in_review" | "cleared_for_programme" | "closed" | "needs_clinical_assessment", note?: string): Promise<Result> {
  try {
    await rpc("rehab_admin_set_assessment_status", { p_assessment_id: assessmentId, p_status: status, p_note: note ?? null });
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function savePlanAction(assessmentId: string | null, programmeId: string | null, payload: PlanPayload): Promise<Result<{ id: string; days: number }>> {
  try {
    const r = await rpc<{ id: string; days: number }>("rehab_admin_save_plan", { p_assessment_id: assessmentId, p_programme_id: programmeId, p_payload: payload });
    return { ok: true, id: r.id, days: r.days };
  } catch (e) { return fail(e); }
}

const PROGRAMME_EMAIL: Partial<Record<"approve" | "pause" | "resume" | "discontinue" | "complete", PatientEmailKind>> = {
  approve: "programme_ready", pause: "paused", resume: "day_opened", discontinue: "stopped", complete: "completed",
};

export async function programmeAction(patientId: string, programmeId: string, action: "approve" | "pause" | "resume" | "discontinue" | "complete", reason?: string): Promise<Result> {
  try {
    await rpc("rehab_admin_programme_action", { p_programme_id: programmeId, p_action: action, p_reason: reason ?? null });
    const kind = PROGRAMME_EMAIL[action];
    if (kind) await emailPatient(patientId, kind);
    return { ok: true };
  } catch (e) { return fail(e); }
}

const REVIEW_EMAIL: Partial<Record<Exclude<ReviewDecision, "auto_continue">, PatientEmailKind>> = {
  progress: "next_day_ready", maintain: "next_day_ready", regress: "next_day_ready", modify: "next_day_ready",
  reassess: "paused", pause: "paused", discontinue: "stopped",
};

export async function reviewSessionAction(patientId: string, sessionId: string, decision: Exclude<ReviewDecision, "auto_continue">, notes: string, patientMessage: string, repeatCurrent: boolean, suggestion: unknown): Promise<Result> {
  try {
    await rpc("rehab_admin_review_session", {
      p_session_id: sessionId, p_decision: decision, p_notes: notes || null, p_patient_message: patientMessage || null,
      p_repeat_current: repeatCurrent, p_suggestion: suggestion ?? null,
    });
    const kind = REVIEW_EMAIL[decision];
    if (kind) await emailPatient(patientId, kind);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function overrideUnlockAction(patientId: string, sessionId: string, reason: string): Promise<Result> {
  try {
    await rpc("rehab_admin_override_unlock", { p_session_id: sessionId, p_reason: reason });
    await emailPatient(patientId, "day_opened");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function logAdverseEventAction(patientId: string, sessionId: string | null, severity: "mild" | "moderate" | "severe", description: string, actionTaken: string): Promise<Result> {
  try {
    await rpc("rehab_admin_log_adverse_event", { p_patient_id: patientId, p_session_id: sessionId, p_severity: severity, p_description: description, p_action_taken: actionTaken || null });
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function updateAdverseEventAction(id: string, status: "open" | "reviewed" | "closed", actionTaken: string): Promise<Result> {
  try {
    await rpc("rehab_admin_update_adverse_event", { p_id: id, p_status: status, p_action_taken: actionTaken || null });
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function markAdminNotificationsReadAction(): Promise<Result> {
  try {
    await rpc("rehab_admin_mark_notifications_read");
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** The admin's decision on AI assistance for one patient. Only the admin can turn it on; the database refuses anyone else. */
export async function setAiAssistAction(patientId: string, enabled: boolean): Promise<Result<{ ai_assist: AiAssist }>> {
  try {
    const r = await rpc<{ ai_assist: AiAssist }>("rehab_admin_set_ai_assist", { p_patient_id: patientId, p_enabled: enabled });
    return { ok: true, ai_assist: r.ai_assist };
  } catch (e) { return fail(e); }
}

/* ───────────────────────── AI pilot and sign-off (Phase F) ───────────────────────── */

/**
 * Records the physiotherapist's review of the AI review pack. The version it covers is worked out here, on the server, from the code that is live
 * right now; if the pack changed since the page was opened (`seenVersion`), the review is refused so nobody signs off text they did not read.
 */
export async function signoffAiAction(input: { reviewer: string; decision: AiSignoffDecision; notes: string; seenVersion: string }): Promise<Result<{ version: string }>> {
  try {
    const pack = await buildReviewPack();
    if (input.seenVersion !== pack.version) return { ok: false, error: "pack_changed" };
    await rpc("rehab_admin_ai_signoff", { p_reviewer: input.reviewer, p_decision: input.decision, p_notes: input.notes || null, p_pack_version: pack.version });
    return { ok: true, version: pack.version };
  } catch (e) { return fail(e); }
}

/** The pilot limit, and "open to all patients" (which the database allows only after an 'approved' sign-off for the CURRENT pack version). */
export async function setAiPilotAction(input: { maxPatients: number; openToAll: boolean }): Promise<Result> {
  try {
    const pack = await buildReviewPack();
    await rpc("rehab_admin_set_ai_pilot", { p_max: Math.trunc(input.maxPatients), p_open_to_all: input.openToAll, p_pack_version: pack.version });
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Study setting: when patients are shown their symptom screening (at once, or only after the physiotherapist has reviewed the assessment). Admin only; every change is audited. */
export async function setScreeningVisibilityAction(value: "immediate" | "after_review"): Promise<Result<{ value: "immediate" | "after_review" }>> {
  try {
    const r = await rpc<{ screening_visibility: "immediate" | "after_review" }>("rehab_admin_set_screening_visibility", { p_value: value });
    return { ok: true, value: r.screening_visibility };
  } catch (e) { return fail(e); }
}

/** Approve or reject a new account request. The database refuses anyone who is not staff and writes the decision to the audit log. */
export async function decideRegistrationAction(patientId: string, decision: "approve" | "reject", note?: string): Promise<Result<{ status: string; phone: string | null; fullName: string; language: "en" | "ru" }>> {
  try {
    const r = await rpc<{ status: string; phone: string | null; full_name: string; preferred_language: "en" | "ru" }>("rehab_admin_decide_patient", {
      p_patient_id: patientId, p_decision: decision, p_note: (note ?? "").trim().slice(0, 500) || null,
    });
    return { ok: true, status: r.status, phone: r.phone, fullName: r.full_name, language: r.preferred_language };
  } catch (e) { return fail(e); }
}

/* ─────────────────────────────── outcome measures ─────────────────────────────── */

/** Choose what to follow for a patient and how often. Only instruments that are available (their wording is settled) at their current version are accepted. */
export async function setOutcomePlanAction(patientId: string, items: unknown, note?: string): Promise<Result<{ id: string }>> {
  try {
    const checked = checkPlanItems(items);
    if (!checked.ok) return { ok: false, error: checked.reason };
    const r = await rpc<{ id: string }>("rehab_admin_set_outcome_plan", { p_patient_id: patientId, p_items: checked.items, p_note: (note ?? "").trim().slice(0, 500) || null });
    return { ok: true, id: r.id };
  } catch (e) { return fail(e); }
}

/**
 * Record a measurement the physiotherapist took (or answers given in the clinic) for a patient. The score is worked out here from the raw values; the staff check is
 * made first because the write itself goes through the server-only function.
 */
export async function recordOutcomeAction(patientId: string, input: { instrument: string; timepoint: TimepointKey; answers: unknown; language?: "en" | "ru" }): Promise<Result<{ saved: boolean }>> {
  try {
    if (!(await isStaff())) return { ok: false, error: "not authorised" };
    const instrument = instrumentFor(String(input.instrument));
    if (!instrument || instrument.status !== "ready") return { ok: false, error: "That instrument is not available yet." };
    const outcomes = await getAdminOutcomes(patientId);
    const item = outcomes.plan?.items.find((i) => i.instrument === instrument.id && i.version === instrument.version);
    if (!outcomes.plan || !item) return { ok: false, error: "That instrument is not in this patient's plan." };
    if (!timepointsFor(item).includes(input.timepoint) && input.timepoint !== "discharge") return { ok: false, error: "That time point is not in the plan." };
    if (outcomes.responses.some((r) => r.instrument === instrument.id && r.timepoint === input.timepoint)) return { ok: false, error: "That time point already has a record (records are not edited)." };
    let answers = input.answers;
    if (instrument.form.type === "psfs" && input.timepoint !== "baseline") {
      const baseline = outcomes.responses.find((r) => r.instrument === "psfs" && r.timepoint === "baseline");
      const names = ((baseline?.answers.activities as { name: string }[] | undefined) ?? []).map((a) => a.name);
      const sent = (answers as { activities?: { rating?: unknown }[] } | null)?.activities;
      if (names.length === 0 || !Array.isArray(sent) || sent.length !== names.length) return { ok: false, error: "Rate the same activities that were written at the start." };
      answers = { activities: names.map((name, index) => ({ name, rating: sent[index]?.rating })) };
    }
    const scored = scoreResponse(instrument, answers);
    if (!scored.ok) return { ok: false, error: scored.reason };
    const { data, error } = await createAdminClient().rpc("rehab_outcome_save", {
      p_patient_id: patientId, p_plan_id: outcomes.plan.id, p_instrument: instrument.id, p_version: instrument.version, p_timepoint: input.timepoint,
      p_answers: scored.answers, p_score: scored.score, p_language: input.language === "ru" ? "ru" : "en", p_collected_by: "therapist",
    });
    if (error) return { ok: false, error: "Could not save the record." };
    return { ok: true, saved: Boolean((data as { saved?: boolean } | null)?.saved) };
  } catch (e) { return fail(e); }
}

/** Send the physiotherapist's message about the results. `source` says how the text started (fixed rules, an AI smoothing of that draft, or written from nothing). */
export async function sendOutcomeFeedbackAction(patientId: string, input: { message: string; language: "en" | "ru"; source: "rules" | "ai" | "written"; basedOn?: Record<string, unknown> }): Promise<Result<{ id: string }>> {
  try {
    const r = await rpc<{ id: string }>("rehab_admin_send_outcome_feedback", {
      p_patient_id: patientId, p_message: String(input.message ?? "").slice(0, 1500), p_language: input.language === "ru" ? "ru" : "en",
      p_source: input.source === "ai" || input.source === "written" ? input.source : "rules", p_based_on: input.basedOn ?? {},
    });
    return { ok: true, id: r.id };
  } catch (e) { return fail(e); }
}

/**
 * Ask an AI service to smooth the wording of the draft. Only the draft goes (numbers and instrument names: no name or contact detail), the answer must keep the same
 * numbers and may add no diagnosis, treatment, medicine, promise or link (checkPolished); anything else is refused and the draft stays as it is. The physiotherapist
 * still reads and sends the message.
 */
export async function polishOutcomeFeedbackAction(draft: string, language: "en" | "ru"): Promise<Result<{ text: string; model: string }>> {
  try {
    if (!(await isStaff())) return { ok: false, error: "not authorised" };
    const text = String(draft ?? "").slice(0, 1500);
    if (text.length < 20) return { ok: false, error: "Write or draft the message first." };
    const style = language === "ru"
      ? "Write in natural, spoken Roman Urdu mixed with common English words, the way a Pakistani clinic talks (not formal or pure Urdu), in Roman letters."
      : "Write in plain, warm English.";
    const answer = await callChat([
      { role: "system", content: `You help a physiotherapist polish a short message to a patient about their progress on outcome questionnaires. ${style} Rewrite the DRAFT so it reads naturally and kindly. Rules: keep every number exactly as in the draft and add no number; add no new facts, no diagnosis, no treatment advice, no medicine, no promise or guarantee; keep any sentence about urgent medical care; keep it under 120 words; keep the sign-off as from the physiotherapist. Output only the message.` },
      { role: "user", content: text },
    ], { maxTokens: 420, temperature: 0.3, timeoutMs: 20000 });
    if (!answer) return { ok: false, error: "No AI service answered. The draft is unchanged." };
    const checked = checkPolished(text, answer.text);
    if (!checked.ok) return { ok: false, error: `The AI's version was not used (${checked.reason}). The draft is unchanged.` };
    return { ok: true, text: checked.text, model: answer.model };
  } catch (e) { return fail(e); }
}

/** Record (or withdraw) a patient's research consent. The physiotherapist says how it was obtained; both changes are in the audit log. Only consenting patients are in the research export. */
export async function setResearchConsentAction(patientId: string, consent: boolean, note?: string): Promise<Result<{ consent: boolean }>> {
  try {
    const r = await rpc<{ research_consent: boolean }>("rehab_admin_set_research_consent", { p_patient_id: patientId, p_consent: consent, p_note: (note ?? "").trim().slice(0, 300) || null });
    return { ok: true, consent: r.research_consent };
  } catch (e) { return fail(e); }
}
