/**
 * Outcome measures for the RehabVerse research record: what a physiotherapist can choose to ask a patient (or to measure) and how every answer is scored.
 * Plain data and plain functions (no React, no database) so the same code scores an answer on the server, draws the form in the browser and is tested in node.
 */
export type OutcomeLang = "en" | "ru";
export type Bi = { en: string; ru: string };

/**
 * Whether the instrument may be given to a patient yet.
 *   ready            the wording is standard and checked, or the instrument is a measurement the physiotherapist takes;
 *   verify_wording   the wording is in the library but has not been compared with the official source in this build, so it is not offered to patients;
 *   needs_permission the author's permission is required before the wording may be used (no wording is stored);
 *   needs_licence    a licence is required (no wording is stored).
 */
export type InstrumentStatus = "ready" | "verify_wording" | "needs_permission" | "needs_licence";

/** Where in a course of care an instrument is asked. Follow-up points are counted in days from the start of the plan. */
export type TimepointKey = "baseline" | "w1" | "w2" | "w4" | "w6" | "w12" | "discharge";
export const TIMEPOINT_DAYS: Record<Exclude<TimepointKey, "discharge">, number> = { baseline: 0, w1: 7, w2: 14, w4: 28, w6: 42, w12: 84 };
export type ScheduleKey = "standard" | "intensive" | "single";
export const SCHEDULES: Record<ScheduleKey, { label: Bi; points: TimepointKey[] }> = {
  standard: { label: { en: "Standard: start, 2, 6 and 12 weeks", ru: "Standard: shuru, 2, 6 aur 12 hafte" }, points: ["baseline", "w2", "w6", "w12"] },
  intensive: { label: { en: "Close follow-up: start, 1, 2, 4, 6 and 12 weeks", ru: "Qareebi follow-up: shuru, 1, 2, 4, 6 aur 12 hafte" }, points: ["baseline", "w1", "w2", "w4", "w6", "w12"] },
  single: { label: { en: "Short: start and 6 weeks", ru: "Mukhtasar: shuru aur 6 hafte" }, points: ["baseline", "w6"] },
};
export const TIMEPOINT_LABEL: Record<TimepointKey, Bi> = {
  baseline: { en: "Start", ru: "Shuru" },
  w1: { en: "1 week", ru: "1 hafta" },
  w2: { en: "2 weeks", ru: "2 hafte" },
  w4: { en: "4 weeks", ru: "4 hafte" },
  w6: { en: "6 weeks", ru: "6 hafte" },
  w12: { en: "12 weeks", ru: "12 hafte" },
  discharge: { en: "Discharge", ru: "Discharge" },
};

export type NumberItem = { id: string; prompt: Bi; min: number; max: number; minLabel?: Bi; maxLabel?: Bi };
export type ChoiceItem = { id: string; prompt: Bi; options: { value: number; label: Bi }[] };
export type MeasureField = { id: string; label: Bi; unit: string; min: number; max: number; decimals: 0 | 1 | 2; better: "higher" | "lower"; how?: Bi };

export type FormSpec =
  | { type: "numbers"; items: NumberItem[]; primary: string; better: "lower" }
  | { type: "psfs"; minActivities: number; maxActivities: number; min: 0; max: 10; instruction: Bi; minLabel: Bi; maxLabel: Bi }
  | { type: "change"; prompt: Bi; options: { value: number; label: Bi }[] }
  | { type: "checklist"; instruction: Bi; items: { id: string; text: Bi }[] }
  | { type: "sbst"; instruction: Bi; items: ChoiceItem[] }
  | { type: "measures"; fields: MeasureField[]; protocol: Bi };

export type Instrument = {
  id: string;
  version: number;
  short: string;
  name: Bi;
  /** One line a physiotherapist reads when choosing: what it measures and when it helps. */
  purpose: Bi;
  kind: "patient_reported" | "clinician_measured";
  /** RehabVerse intake region ids it suits, or "any". */
  regions: string[];
  form: FormSpec;
  /** Asked at the start too, or only at follow-up (a global rating of change has no starting point). */
  atBaseline: boolean;
  status: InstrumentStatus;
  statusNote: string;
  citation: string;
  licence: string;
  /** Roman Urdu is a help beside the official English wording; it is not a validated translation. The language used is recorded with every answer. */
  translation: "none" | "assist_not_validated";
};

export type Score = {
  /** The number used to follow change over time (null when the instrument gives a class, not a number). */
  primary: number | null;
  parts: Record<string, number>;
  /** A class the instrument defines (for example a risk group). */
  band: string | null;
};

/** `answers` is the cleaned form of what was sent (only known ids, numbers as numbers), the form that is stored. */
export type ScoreResult = { ok: true; score: Score; answers: Record<string, unknown> } | { ok: false; reason: string };

export type ChangeBand = "much_better" | "better" | "no_important_change" | "worse" | "much_worse" | "not_comparable";
export type Interpretation = {
  band: ChangeBand;
  /** later minus earlier, in the instrument's own units, signed so that a positive number is an improvement. */
  improvement: number | null;
  percent: number | null;
  /** What the thresholds are and where they come from, shown beside the result so nothing looks more certain than it is. */
  basis: string;
};
