"use server";

import { RehabError, rpc } from "@/lib/rehabverse/api";
import type { PlanPayload, ReviewDecision } from "@/lib/rehabverse/api-types";
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
