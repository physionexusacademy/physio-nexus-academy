"use server";

import { randomBytes } from "node:crypto";
import { RehabError, getStudyOverview, rpc } from "@/lib/rehabverse/api";
import { instrumentFor } from "@/lib/outcomes/instruments";
import { checkStudyConfig, generateSequence, parseSequenceCsv, strataOf, type ConsentMethod, type StudyConfig } from "@/lib/research-room";

/**
 * Research Room actions (staff only; the database functions refuse anyone else and re-check every rule). The app adds the checks the database cannot make:
 * the instruments in the outcome plan must exist at the version named, and a study cannot start recruiting while one of them is not yet cleared for patients.
 */
export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };
const fail = (e: unknown): { ok: false; error: string } => ({ ok: false, error: e instanceof RehabError ? e.code : "failed" });

export type StudyForm = {
  code: string; title: string; version: string; ethics_ref: string; ethics_date: string; registry_id: string; consent_version: string; config: StudyConfig;
};

export async function saveStudyAction(form: StudyForm): Promise<Result<{ problems?: string[] }>> {
  try {
    const problems = checkStudyConfig(form.config);
    for (const item of form.config.outcome_plan) if (!instrumentFor(item.instrument, item.version)) problems.push(`${item.instrument} version ${item.version} is not in the outcome library.`);
    if (problems.length) return { ok: false, error: problems[0] };
    await rpc("rehab_admin_study_save", { p_payload: { ...form, config: form.config } });
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** A placeholder list for testing and small pilots: the seed is random, used once here and never stored or shown. */
export async function generateListAction(perGroup: number): Promise<Result<{ rows: number }>> {
  try {
    const overview = await getStudyOverview();
    if (!overview.study || overview.study.status !== "draft") return { ok: false, error: "no_draft_study" };
    const rows = generateSequence({ seed: randomBytes(24).toString("hex"), strata: strataOf(overview.study.config), perStratum: perGroup });
    const r = await rpc<{ rows: number }>("rehab_admin_study_load_sequence", { p_rows: rows, p_source: "generated" });
    return { ok: true, rows: r.rows };
  } catch (e) { return fail(e); }
}

/** A list prepared by an independent person (CSV: stratum,position,arm). Only counts come back; the arms are never shown. */
export async function importListAction(csv: string): Promise<Result<{ rows: number; warnings: string[] }>> {
  try {
    const overview = await getStudyOverview();
    if (!overview.study || overview.study.status !== "draft") return { ok: false, error: "no_draft_study" };
    if (csv.length > 600_000) return { ok: false, error: "file_too_large" };
    const parsed = parseSequenceCsv(csv, strataOf(overview.study.config));
    if (parsed.problems.length) return { ok: false, error: parsed.problems[0] };
    const r = await rpc<{ rows: number }>("rehab_admin_study_load_sequence", { p_rows: parsed.rows, p_source: "independent" });
    return { ok: true, rows: r.rows, warnings: parsed.warnings };
  } catch (e) { return fail(e); }
}

export async function startRecruitingAction(): Promise<Result<{ hash: string }>> {
  try {
    const overview = await getStudyOverview();
    if (!overview.study) return { ok: false, error: "no_draft_study" };
    for (const item of overview.study.config.outcome_plan) {
      const inst = instrumentFor(item.instrument, item.version);
      if (!inst) return { ok: false, error: `${item.instrument} is not in the outcome library` };
      if (inst.status !== "ready") return { ok: false, error: `${inst.short} is not cleared for patients yet (${inst.status.replace(/_/g, " ")}). Compare its wording with the official copy first.` };
    }
    const r = await rpc<{ hash: string }>("rehab_admin_study_set_status", { p_to: "recruiting" });
    return { ok: true, hash: r.hash };
  } catch (e) { return fail(e); }
}

export async function closeStudyAction(reason: string): Promise<Result> {
  try { await rpc("rehab_admin_study_set_status", { p_to: "closed", p_reason: reason }); return { ok: true }; } catch (e) { return fail(e); }
}

export type EnrolResult = { enrolled: true; arm: "ai" | "no_ai"; stratum: string; full_name: string; phone: string | null; preferred_language: "en" | "ru" } | { enrolled: false; reasons: string[] };

export async function enrolAction(patientId: string, screen: { region: string; nprs: number; answers: Record<string, boolean> },
  consent: { given: boolean; method: ConsentMethod; version: string; obtained_at: string; witness?: string; note?: string }): Promise<Result<{ result: EnrolResult }>> {
  try {
    const result = await rpc<EnrolResult>("rehab_admin_study_enrol", { p_patient_id: patientId, p_screen: screen, p_consent: consent });
    return { ok: true, result };
  } catch (e) { return fail(e); }
}

export async function screenOutAction(patientId: string, outcome: "excluded" | "declined", reasons: string[], note: string): Promise<Result> {
  try { await rpc("rehab_admin_study_screen_out", { p_patient_id: patientId, p_outcome: outcome, p_reasons: reasons, p_note: note || null }); return { ok: true }; } catch (e) { return fail(e); }
}

export async function overrideAiAction(patientId: string, aiOn: boolean, reason: string): Promise<Result> {
  try { await rpc("rehab_admin_study_override_ai", { p_patient_id: patientId, p_ai_on: aiOn, p_reason: reason }); return { ok: true }; } catch (e) { return fail(e); }
}
