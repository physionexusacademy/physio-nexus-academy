"use server";

/**
 * The blinded outcome assessor (Research Room phase 2). An assessor is named by the clinic and is never a clinic admin or a patient. Everything here is read
 * through the assessor's own database functions, which return participants under a code with their outcome plan and nothing about the arm or the AI.
 * A record is scored on the server, the same way as a physiotherapist's, and saved as collected by the assessor.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { rpc } from "@/lib/rehabverse/api";
import { instrumentFor } from "@/lib/outcomes/instruments";
import { timepointsFor, type PlanItem } from "@/lib/outcomes/plan";
import { scoreResponse } from "@/lib/outcomes/scoring";
import type { TimepointKey } from "@/lib/outcomes/types";

export type AssessorParticipant = {
  code: string;
  patient_id: string;
  full_name: string;
  phone: string | null;
  preferred_language: "en" | "ru" | null;
  enrolled_at: string;
  plan: PlanItem[] | null;
  /** The activities written in the starting PSFS: a follow-up PSFS asks about the same ones. */
  psfs_activities: string[];
  recorded: { instrument: string; timepoint: TimepointKey; collected_by: "patient" | "therapist" | "assessor"; taken_at: string }[];
};
export type AssessorQueue = { study: { code: string; title: string; status: string } | null; participants: AssessorParticipant[] };

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

export async function assessorQueueAction(): Promise<Result<{ queue: AssessorQueue }>> {
  try {
    const queue = await rpc<AssessorQueue>("rehab_assessor_queue");
    return { ok: true, queue };
  } catch {
    return { ok: false, error: "not_authorised" };
  }
}

export async function assessorRecordAction(patientId: string, input: { instrument: string; timepoint: TimepointKey; answers: unknown; language: "en" | "ru" }): Promise<Result<{ saved: boolean }>> {
  let plan: { plan_id: string; items: PlanItem[]; recorded: { instrument: string; timepoint: string; answers: Record<string, unknown> }[] };
  try {
    plan = await rpc("rehab_assessor_plan", { p_patient_id: patientId });
  } catch {
    return { ok: false, error: "not_authorised" };
  }
  const instrument = instrumentFor(String(input.instrument));
  if (!instrument || instrument.status !== "ready") return { ok: false, error: "This measure is not available." };
  const item = plan.items.find((i) => i.instrument === instrument.id && i.version === instrument.version);
  if (!item) return { ok: false, error: "This measure is not in the participant's plan." };
  if (!timepointsFor(item).includes(input.timepoint) && input.timepoint !== "discharge") return { ok: false, error: "That time point is not in the plan." };
  if (plan.recorded.some((r) => r.instrument === instrument.id && r.timepoint === input.timepoint)) return { ok: false, error: "That time point already has a record (records are not edited)." };
  let answers = input.answers;
  if (instrument.form.type === "psfs" && input.timepoint !== "baseline") {
    const baseline = plan.recorded.find((r) => r.instrument === "psfs" && r.timepoint === "baseline");
    const names = ((baseline?.answers.activities as { name: string }[] | undefined) ?? []).map((a) => a.name);
    const sent = (answers as { activities?: { rating?: unknown }[] } | null)?.activities;
    if (names.length === 0 || !Array.isArray(sent) || sent.length !== names.length) return { ok: false, error: "Rate the same activities that were written at the start." };
    answers = { activities: names.map((name, index) => ({ name, rating: sent[index]?.rating })) };
  }
  const scored = scoreResponse(instrument, answers);
  if (!scored.ok) return { ok: false, error: scored.reason };
  const { data, error } = await createAdminClient().rpc("rehab_outcome_save", {
    p_patient_id: patientId, p_plan_id: plan.plan_id, p_instrument: instrument.id, p_version: instrument.version, p_timepoint: input.timepoint,
    p_answers: scored.answers, p_score: scored.score, p_language: input.language === "ru" ? "ru" : "en", p_collected_by: "assessor",
  });
  if (error) return { ok: false, error: "Could not save the record." };
  return { ok: true, saved: Boolean((data as { saved?: boolean } | null)?.saved) };
}
