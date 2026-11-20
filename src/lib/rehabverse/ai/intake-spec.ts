import { INTAKE_DURATION, INTAKE_REGIONS, INTAKE_SYMPTOMS } from "../intake.ts";

/**
 * What the intake assistant collects: exactly the fields of the RehabVerse assessment form, so a conversation fills the same record a patient
 * would fill by hand. Pure code (no server imports) so the validator can test every rule without a model.
 */
export type Lang = "en" | "ru";

export type IntakeDraft = {
  regions: string[];
  symptoms: string[];
  other_symptoms: string;
  pain_now: number | null;
  pain_worst: number | null;
  pain_best: number | null;
  duration: string;
  onset: string;
  possible_cause: string;
  aggravating: string;
  relieving: string;
  functional_limitations: string;
  previous_treatment: string;
  medical_conditions: string;
  medications: string;
  own_words: string;
};

export type FieldKey = keyof IntakeDraft;

export const EMPTY_DRAFT: IntakeDraft = {
  regions: [], symptoms: [], other_symptoms: "", pain_now: null, pain_worst: null, pain_best: null, duration: "", onset: "",
  possible_cause: "", aggravating: "", relieving: "", functional_limitations: "", previous_treatment: "", medical_conditions: "", medications: "", own_words: "",
};

export const REGION_IDS: string[] = INTAKE_REGIONS.map((option) => option.id);
export const SYMPTOM_IDS: string[] = INTAKE_SYMPTOMS.map((option) => option.id);
export const DURATION_IDS: string[] = INTAKE_DURATION.map((option) => option.id);
export const ONSET_IDS: string[] = ["sudden", "gradual", "after_surgery", "unknown"];

const TEXT_KEYS = ["other_symptoms", "possible_cause", "aggravating", "relieving", "functional_limitations", "previous_treatment", "medical_conditions", "medications", "own_words"] as const;
const PAIN_KEYS = ["pain_now", "pain_worst", "pain_best"] as const;
export const MAX_TEXT = 600;
export const MAX_OWN_WORDS = 900;
export const MAX_PATIENT_MESSAGE = 800;
export const MAX_TURNS = 26;

/** The order the assistant naturally explores the story. */
export const ASK_ORDER: FieldKey[] = [
  "regions", "pain_now", "duration", "onset", "possible_cause", "aggravating", "relieving", "symptoms",
  "functional_limitations", "previous_treatment", "medical_conditions", "medications", "own_words",
];
/** What must be known before the assistant hands over to the patient's review. */
export const REQUIRED: FieldKey[] = ["regions", "pain_now", "duration", "aggravating", "relieving", "functional_limitations", "medical_conditions", "medications", "own_words"];

export function isAnswered(draft: IntakeDraft, key: FieldKey): boolean {
  if (key === "symptoms") return draft.symptoms.length > 0 || draft.other_symptoms.trim().length > 0; // "no other symptoms" is an answer too
  const value = draft[key];
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return true;
  return typeof value === "string" && value.trim().length > 0;
}
/** The next thing worth asking about (first unanswered in the natural order), or null when everything is known. */
export const nextFocus = (draft: IntakeDraft): FieldKey | null => ASK_ORDER.find((key) => !isAnswered(draft, key)) ?? null;
export const isReady = (draft: IntakeDraft): boolean => REQUIRED.every((key) => isAnswered(draft, key));
export const progress = (draft: IntakeDraft) => ({ done: REQUIRED.filter((key) => isAnswered(draft, key)).length, total: REQUIRED.length });

const tidy = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

const toPain = (value: unknown): number | null => {
  const number = typeof value === "number" ? value : typeof value === "string" && /^\s*\d{1,2}(\.\d+)?\s*(\/\s*10)?\s*$/.test(value) ? parseFloat(value) : NaN;
  return Number.isFinite(number) && number >= 0 && number <= 10 ? Math.round(number) : null;
};

const toIds = (value: unknown, allowed: string[]): string[] => {
  const list = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return [...new Set(list.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter((item) => allowed.includes(item)))].slice(0, 10);
};

/**
 * Merges what the model says it learned into the draft. The model is never trusted: unknown fields and values are dropped, ids must be real,
 * numbers are clamped, text is cleaned and shortened, and an empty value can never wipe something already recorded.
 */
export function applyUpdates(draft: IntakeDraft, raw: unknown): { draft: IntakeDraft; accepted: FieldKey[] } {
  const next: IntakeDraft = { ...draft, regions: [...draft.regions], symptoms: [...draft.symptoms] };
  const accepted: FieldKey[] = [];
  const updates = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const note = (key: FieldKey) => { if (!accepted.includes(key)) accepted.push(key); };

  const regions = toIds(updates.regions, REGION_IDS);
  if (regions.length) { next.regions = regions; note("regions"); }
  const symptoms = toIds(updates.symptoms, SYMPTOM_IDS);
  if (symptoms.length) { next.symptoms = symptoms; note("symptoms"); }
  for (const key of PAIN_KEYS) {
    const pain = toPain(updates[key]);
    if (pain !== null) { next[key] = pain; note(key); }
  }
  const duration = tidy(updates.duration, 20);
  if (DURATION_IDS.includes(duration)) { next.duration = duration; note("duration"); }
  const onset = tidy(updates.onset, 20);
  if (ONSET_IDS.includes(onset)) { next.onset = onset; note("onset"); }
  for (const key of TEXT_KEYS) {
    const text = tidy(updates[key], key === "own_words" ? MAX_OWN_WORDS : MAX_TEXT);
    if (text) { next[key] = text; note(key); }
  }
  return { draft: next, accepted };
}

/** Removes things the assistant must never receive: e-mail addresses, phone numbers and ID numbers. */
export function scrubPII(text: string): string {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[removed]")
    .replace(/\b\d{5}[- ]?\d{7}[- ]?\d\b/g, "[removed]")
    .replace(/\+?\d(?:[\s-]?\d){8,}/g, "[removed]");
}
