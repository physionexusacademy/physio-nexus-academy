"use server";

import { aiAssistAllowed } from "@/lib/rehabverse/ai-access";
import { getOverview } from "@/lib/rehabverse/api";
import { specFor } from "@/lib/formcheck";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Saves the numbers of one finished camera set for the signed-in patient. Nothing but numbers is ever stored: no video, no picture, no landmark coordinates.
 * Order of checks: (1) the AI switch (global and this patient's own, set by the admin) on the server, (2) the patient is taken from the signed-in session, never from the
 * request, (3) the exercise must have a camera spec, (4) the record is rebuilt from a whitelist of numeric fields, and (5) the database function checks the patient's
 * switch once more. A failure never blocks the exercise: the patient has already seen the result on the screen.
 */
export type SaveFormCheckInput = {
  specId: string;
  pass: 1 | 2;
  side: "left" | "right" | null;
  summary: {
    durationMs: number; reps: number; partial: number; bestHoldMs: number;
    coverage: { frames: number; read: number; fraction: number };
    cues: Record<string, number>; peak: Record<string, number>; refusals: Record<string, number>;
  };
  software: { engine: string; library: string; poseModel: string; poseModelSha256: string; faceModel: string | null; faceModelSha256: string | null; delegate: string } | null;
};
export type SaveFormCheckResult = { ok: true } | { ok: false; error: "ai_off" | "bad_request" | "failed" };

const num = (value: unknown, max: number) => (typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(max, Math.round(value * 1000) / 1000)) : 0);
const counts = (value: unknown, decimals = 0, limit = 30): Record<string, number> => {
  const out: Record<string, number> = {};
  if (!value || typeof value !== "object") return out;
  for (const [key, count] of Object.entries(value as Record<string, unknown>).slice(0, limit)) {
    if (/^[a-z0-9_-]{1,50}$/i.test(key)) out[key] = Number(num(count, 100000).toFixed(decimals));
  }
  return out;
};
const text = (value: unknown, max: number) => (typeof value === "string" ? value.replace(/[^\w@./:+ -]/g, "").slice(0, max) : "");

export async function saveFormCheckSetAction(input: SaveFormCheckInput): Promise<SaveFormCheckResult> {
  try {
    if (!(await aiAssistAllowed())) return { ok: false, error: "ai_off" };
    if (!input || !specFor(input.specId) || (input.pass !== 1 && input.pass !== 2) || (input.side !== null && input.side !== "left" && input.side !== "right") || !input.summary) return { ok: false, error: "bad_request" };
    const overview = await getOverview();
    const patient = overview.patient;
    if (!patient) return { ok: false, error: "ai_off" };

    const s = input.summary;
    const sw = input.software;
    const payload = {
      spec_id: input.specId,
      pass: input.pass,
      side: input.side,
      software: sw
        ? { engine: text(sw.engine, 40), library: text(sw.library, 60), poseModel: text(sw.poseModel, 60), poseModelSha256: text(sw.poseModelSha256, 64), faceModel: sw.faceModel ? text(sw.faceModel, 60) : null, faceModelSha256: sw.faceModelSha256 ? text(sw.faceModelSha256, 64) : null, delegate: text(sw.delegate, 10) }
        : { engine: "unknown" },
      device: {},
      summary: {
        durationMs: num(s.durationMs, 3_600_000), reps: Math.round(num(s.reps, 500)), partial: Math.round(num(s.partial, 500)), bestHoldMs: num(s.bestHoldMs, 600_000),
        coverage: { frames: Math.round(num(s.coverage?.frames, 1_000_000)), read: Math.round(num(s.coverage?.read, 1_000_000)), fraction: num(s.coverage?.fraction, 1) },
        cues: counts(s.cues), peak: counts(s.peak, 2), refusals: counts(s.refusals),
      },
    };
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("rehab_formcheck_save_patient_set", { p_patient_id: patient.id, p_payload: payload });
    if (error) return { ok: false, error: /not enabled/.test(error.message) ? "ai_off" : "failed" };
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}
