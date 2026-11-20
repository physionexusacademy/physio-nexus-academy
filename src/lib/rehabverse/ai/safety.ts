import { fromUrduScript } from "../../pna-ai/language.ts";
import { screenForSafety, type SafetyAlert } from "../../pna-ai/safety.ts";
import type { Bi } from "../types";

/**
 * The safety screen the intake assistant runs on EVERY patient message BEFORE any model is called. It is plain code (the same rules the
 * site-wide PNA AI uses, English and Roman Urdu): if a patient describes an emergency, the model never answers; the patient is told what
 * to do, and the matching red-flag questions are pre-ticked for them to confirm in the normal assessment.
 */
export type IntakeSafety = { level: SafetyAlert["level"]; kind: SafetyAlert["kind"]; message: Bi; suggestedFlags: string[] };

const FLAGS: Record<SafetyAlert["kind"], string[]> = {
  "cauda-equina": ["rf_bladder"],
  stroke: ["rf_neck_cad"],
  cardiac: ["rf_chest"],
  breathing: ["rf_chest"],
  "neck-vascular": ["rf_neck_cad"],
  fracture: ["rf_major_trauma"],
  "serious-pathology": ["rf_cancer"],
  crisis: [],
};

const normalise = (text: string) =>
  fromUrduScript(text).toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();

export function screenPatientText(text: string): IntakeSafety | null {
  const alert = screenForSafety(normalise(text));
  if (!alert) return null;
  const plain = (value: string) => value.replace(/\*\*/g, "");
  return { level: alert.level, kind: alert.kind, message: { en: plain(alert.text.en), ru: plain(alert.text.ur) }, suggestedFlags: FLAGS[alert.kind] ?? [] };
}
