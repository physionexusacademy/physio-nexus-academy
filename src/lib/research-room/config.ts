import type { EligibilityItem, OutcomePlanItem, StudyConfig } from "./types.ts";

/**
 * Defaults for a study of adults with non-specific low back pain. The primary outcome is the RMDQ-24 at 12 weeks because that is the back-specific disability
 * measure; the RMDQ is not valid for neck pain (its neck counterpart, the NDI, needs the author's permission), so neck pain is off by default.
 * Every value is a starting point for the ethics application, not a clinical decision.
 */
export const DEFAULT_ELIGIBILITY: EligibilityItem[] = [
  { id: "lbp_4_weeks", kind: "include", en: "Non-specific low back pain for 4 weeks or more", ru: "Kamar ka dard (koi wazeh wajah nahi) 4 hafte ya zyada se" },
  { id: "smartphone", kind: "include", en: "Can use a smartphone with internet and a front camera", ru: "Smartphone, internet aur front camera istemal kar sakta/sakti hai" },
  { id: "reads_language", kind: "include", en: "Can read English or Roman Urdu", ru: "English ya Roman Urdu parh sakta/sakti hai" },
  { id: "red_flag", kind: "exclude", en: "Any red flag: suspected fracture, infection, cancer, cauda equina signs (bladder or bowel change, saddle numbness, worsening leg weakness)", ru: "Koi red flag: fracture, infection, cancer ka shak, ya cauda equina ki alamat (peshab/pakhana mein tabdeeli, saddle area sun, taang ki barhti kamzori)" },
  { id: "recent_surgery", kind: "exclude", en: "Spinal surgery in the last 6 months", ru: "Pichle 6 mahine mein spine ki surgery" },
  { id: "pregnant", kind: "exclude", en: "Currently pregnant", ru: "Is waqt hamila hain" },
];

export const DEFAULT_OUTCOME_PLAN: OutcomePlanItem[] = [
  { instrument: "rmdq24", version: 1, schedule: "standard" },
  { instrument: "nprs", version: 1, schedule: "standard" },
  { instrument: "psfs", version: 1, schedule: "standard" },
  { instrument: "groc", version: 1, schedule: "standard" },
];

export const DEFAULT_CONFIG: StudyConfig = {
  regions: ["low_back"],
  age_min: 18,
  age_max: 65,
  min_nprs: 3,
  strata_cuts: [6],
  eligibility: DEFAULT_ELIGIBILITY,
  outcome_plan: DEFAULT_OUTCOME_PLAN,
  primary: { instrument: "rmdq24", timepoint: "w12" },
  target_per_arm: 0,
  notify: { en: "", ru: "" },
};

const INT = (n: unknown) => typeof n === "number" && Number.isInteger(n);

/** Plain-language problems with a study's rules (empty when fine). Mirrors the database check so the form can say what is wrong before saving. */
export function checkStudyConfig(c: StudyConfig): string[] {
  const out: string[] = [];
  if (!c.regions.length || c.regions.some((r) => r !== "low_back" && r !== "neck")) out.push("Choose low back and/or neck.");
  if (!INT(c.age_min) || !INT(c.age_max) || c.age_min < 18 || c.age_max < c.age_min || c.age_max > 110) out.push("The age range must be within 18 to 110.");
  if (!INT(c.min_nprs) || c.min_nprs < 0 || c.min_nprs > 9) out.push("The lowest pain score must be 0 to 9.");
  if (!Array.isArray(c.strata_cuts) || c.strata_cuts.length > 3) out.push("Use at most 3 cut points for the pain bands.");
  else {
    let prev = -1;
    for (const cut of c.strata_cuts) {
      if (!INT(cut) || cut <= prev || cut <= c.min_nprs || cut > 10) { out.push("Pain cut points must rise and sit above the lowest score."); break; }
      prev = cut;
    }
  }
  if (!c.eligibility.length || c.eligibility.length > 20) out.push("Give between 1 and 20 eligibility questions.");
  const ids = new Set<string>();
  for (const e of c.eligibility) {
    if (!/^[a-z][a-z0-9_]{1,30}$/.test(e.id)) out.push(`The question id "${e.id}" is not valid (lower-case letters, digits and underscores).`);
    if (ids.has(e.id)) out.push(`The question id "${e.id}" is repeated.`);
    ids.add(e.id);
    if (e.en.trim().length < 5) out.push(`Question "${e.id}" needs English wording.`);
  }
  if (!c.outcome_plan.length || c.outcome_plan.length > 8) out.push("Choose between 1 and 8 outcome measures.");
  const inst = new Set<string>();
  for (const o of c.outcome_plan) {
    if (inst.has(o.instrument)) out.push(`${o.instrument} is chosen twice.`);
    inst.add(o.instrument);
  }
  if (!inst.has(c.primary.instrument)) out.push("The primary outcome must be one of the chosen outcome measures.");
  if (!INT(c.target_per_arm) || c.target_per_arm < 0 || c.target_per_arm > 5000) out.push("The target per arm must be 0 to 5000 (0 until the sample size is calculated).");
  return out;
}

/** The pain bands, in the same form the database uses ("3-5", "6-10"). */
export function strataOf(c: Pick<StudyConfig, "min_nprs" | "strata_cuts">): string[] {
  const cuts = [...c.strata_cuts].sort((a, b) => a - b);
  const out: string[] = [];
  let start = c.min_nprs;
  for (const cut of cuts) { out.push(`${start}-${cut - 1}`); start = cut; }
  out.push(`${start}-10`);
  return out;
}

/** Which band a baseline pain score falls in, or null when it is below the lowest eligible score. */
export function stratumFor(c: Pick<StudyConfig, "min_nprs" | "strata_cuts">, nprs: number): string | null {
  if (!Number.isInteger(nprs) || nprs < c.min_nprs || nprs > 10) return null;
  for (const s of strataOf(c)) {
    const [lo, hi] = s.split("-").map(Number);
    if (nprs >= lo && nprs <= hi) return s;
  }
  return null;
}

/** Plain wording for the reasons the database records (screening log and flow diagram). */
export function reasonLabel(reason: string, config?: StudyConfig): string {
  const fixed: Record<string, string> = {
    region_not_in_study: "Pain region not in this study",
    pain_below_minimum: "Baseline pain below the minimum",
    age_outside_range: "Age outside the study range",
    rejected_at_approval: "Account request rejected before screening",
    declined: "Declined to take part",
    clinical_judgement: "Not suitable (clinical judgement)",
    unreachable: "Could not be reached",
  };
  if (fixed[reason]) return fixed[reason];
  const id = reason.startsWith("not_") ? reason.slice(4) : reason;
  const item = config?.eligibility.find((e) => e.id === id);
  if (item) return reason.startsWith("not_") ? `Does not meet: ${item.en}` : `Excluded: ${item.en}`;
  return reason.replace(/_/g, " ");
}
