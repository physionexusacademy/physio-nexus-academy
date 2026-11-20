import { fromUrduScript } from "../../pna-ai/language.ts";
import { alertFor, screenForSafety, type SafetyAlert } from "../../pna-ai/safety.ts";
import { stripDenials } from "./denials.ts";
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

/**
 * Loss of bladder or bowel control, on its own, is a red flag inside RehabVerse (the site-wide screen wants it together with back or leg symptoms,
 * which suits a public study chat but not a patient in a rehabilitation programme). Found by the physiotherapist's review pack.
 */
const BLADDER_LOSS: RegExp[] = [
  /\b(lost|lose|losing|loss of|no|cant|cannot|unable to|trouble|difficulty|problem|problems|issues?|struggl\w+)\b.{0,30}\b(control|controlling|holding|hold)\b.{0,25}\b(bladder|bowels?|urine|stool|pee|wee)\b/,
  /\b(bladder|bowels?)\b.{0,25}\b(control|accidents?|leak\w*|incontinen\w*)\b/,
  /\bincontinen\w*\b/,
  /\b(wet|wetting|soil\w*)\b.{0,20}\b(myself|my pants|my bed|the bed)\b/,
  /\b(peshab|pishab|pakhana|pakhane|paikhana)\b.{0,30}\b(control|rok\w*|ruk\w*|nikal\w*|lag\w*|khud ba khud|bina)\b/,
  /\bcontrol\b.{0,15}\b(peshab|pishab|pakhana|pakhane)\b/,
];

export function screenPatientText(text: string): IntakeSafety | null {
  // plain denials ("no chest pain") are not a report: the assistants ask about these things, so "no" is a normal answer
  const cleaned = normalise(stripDenials(text));
  const alert = screenForSafety(cleaned) ?? (BLADDER_LOSS.some((pattern) => pattern.test(cleaned)) ? alertFor("cauda-equina", "emergency") : null);
  if (!alert) return null;
  const plain = (value: string) => value.replace(/\*\*/g, "");
  return { level: alert.level, kind: alert.kind, message: { en: plain(alert.text.en), ru: plain(alert.text.ur) }, suggestedFlags: FLAGS[alert.kind] ?? [] };
}
