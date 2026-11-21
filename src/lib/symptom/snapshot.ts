/**
 * The screening snapshot: what the person answered in the symptom checker and what the checker's engine made of it, in a form that can be stored
 * with a RehabVerse assessment for the treating physiotherapist and for research.
 *
 * The server builds it from the raw answers (never from patterns sent by the browser), so the stored patterns are always what this engine
 * version produces for those answers. The engine version is stamped on every snapshot; it changes whenever any question, pattern, weight or
 * warning changes, so a record can always be re-read against the exact rules that made it.
 */
import {
  allConditionRules,
  commonHistoryOptions,
  getCarePriority,
  getImagingNotice,
  getNeurologicHint,
  redFlags,
  regions,
  scoreConditions,
  type RegionId,
} from "../msk-symptom-checker.ts";

/** Bump the first part by hand when the meaning of a snapshot changes; the hash part follows the engine's data automatically. */
const SNAPSHOT_FORMAT = "msk1";

function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export const CHECKER_ENGINE_VERSION = `${SNAPSHOT_FORMAT}-${fnv1a(JSON.stringify({ regions, allConditionRules, redFlags, commonHistoryOptions }))}`;

export type SnapshotPattern = { id: string; score: number; matched: number; total: number };
export type CheckerSnapshot = {
  engine_version: string;
  region: RegionId;
  /** Every answer id the person chose (history, location, symptoms), in a stable order. */
  answers: string[];
  pain_now: number | null;
  /** The patterns that fit best (at most 3), best first. Empty when nothing stood out. */
  top: SnapshotPattern[];
  /** 0 monitor, 1 assess, 2 prompt: the next-step priority the checker gave. */
  priority: 0 | 1 | 2;
  /** The acute-injury fracture screen (Ottawa-style) fired: the patterns are then secondary. */
  fracture_screen: boolean;
  /** Which nerve-root hint (if any) the answers raised. */
  nerve_hint: string | null;
  language: "en" | "ru";
  source: "checker" | "handover";
};

const PRIORITY: Record<string, 0 | 1 | 2> = {
  "Monitor and assess as needed": 0,
  "Professional assessment recommended": 1,
  "Prompt professional assessment recommended": 2,
};

const regionIds = new Set<string>(regions.map((region) => region.id));
export const isCheckerRegion = (id: unknown): id is RegionId => typeof id === "string" && regionIds.has(id);

/** Every answer id a person can legitimately give for one region. */
export function allowedAnswerIds(region: RegionId): Set<string> {
  const config = regions.find((item) => item.id === region);
  const ids = new Set<string>([...commonHistoryOptions.age, ...commonHistoryOptions.onset, ...commonHistoryOptions.duration, ...commonHistoryOptions.impact].map((o) => o.id));
  for (const item of config ? [...config.locations, ...config.clues] : []) ids.add(item.id);
  return ids;
}

export type SnapshotInput = { region: unknown; answers: unknown; pain_now?: unknown; language?: unknown; source?: unknown };
export type SnapshotResult = { ok: true; snapshot: CheckerSnapshot } | { ok: false; reason: "region" | "answers" | "pain" };

export function buildSnapshot(input: SnapshotInput): SnapshotResult {
  if (!isCheckerRegion(input.region)) return { ok: false, reason: "region" };
  const region = input.region;
  if (!Array.isArray(input.answers) || input.answers.length > 60 || input.answers.some((item) => typeof item !== "string")) return { ok: false, reason: "answers" };
  const allowed = allowedAnswerIds(region);
  const unique = [...new Set(input.answers as string[])];
  if (unique.some((id) => !allowed.has(id))) return { ok: false, reason: "answers" };
  let pain: number | null = null;
  if (input.pain_now !== undefined && input.pain_now !== null) {
    if (typeof input.pain_now !== "number" || !Number.isInteger(input.pain_now) || input.pain_now < 0 || input.pain_now > 10) return { ok: false, reason: "pain" };
    pain = input.pain_now;
  }
  const selected = new Set(unique);
  const results = scoreConditions(region, selected).slice(0, 3);
  const imaging = getImagingNotice(region, selected);
  const hint = getNeurologicHint(region, selected);
  return {
    ok: true,
    snapshot: {
      engine_version: CHECKER_ENGINE_VERSION,
      region,
      answers: unique.sort(),
      pain_now: pain,
      top: results.map((r) => ({ id: r.condition.id, score: r.score, matched: r.matchedCount, total: r.featureCount })),
      priority: PRIORITY[getCarePriority(selected, pain).label] ?? 0,
      fracture_screen: imaging !== null,
      nerve_hint: hint ? hint.label : null,
      language: input.language === "ru" ? "ru" : "en",
      source: input.source === "handover" ? "handover" : "checker",
    },
  };
}

/**
 * RehabVerse asks "how long" and "how did it start" with its own, finer options. The checker engine scores with three bands, and only ever
 * uses "acute" and "chronic" (never "subacute"), so each RehabVerse option is mapped CAUTIOUSLY: a band is claimed only when the option is
 * certain to lie inside it. 1–4 weeks and 1–3 months straddle a boundary, so they map to subacute and trigger no acute-only or chronic-only weight.
 */
export const DURATION_TO_CHECKER: Record<string, string> = {
  lt_1w: "duration_acute",
  "1_4w": "duration_subacute",
  "1_3m": "duration_subacute",
  "3_6m": "duration_chronic",
  gt_6m: "duration_chronic",
};
/** "Suddenly" is the checker's injury onset; "slowly" its gradual onset. After surgery and "not sure" have no equivalent and add nothing. */
export const ONSET_TO_CHECKER: Record<string, string> = { sudden: "onset_trauma", gradual: "onset_gradual" };

/** RehabVerse region ids by checker region (the library regions are coarser; the intake ids are the ones stored with an assessment). */
export const INTAKE_REGION_FOR_CHECKER: Record<RegionId, string> = {
  neck: "cervical",
  shoulder: "shoulder",
  elbow: "elbow",
  "wrist-hand": "wrist_hand",
  "upper-back-ribs": "thoracic",
  "low-back": "lumbar",
  "hip-groin": "hip",
  knee: "knee",
  "lower-leg": "ankle_foot",
  "ankle-foot": "ankle_foot",
};

export const ageBandForYears = (years: number): string => (years >= 60 ? "age_60_plus" : years >= 40 ? "age_40_59" : "age_18_39");

/** The checker answer ids for one RehabVerse intake: age from the account, the history the person chose, the location and the symptom clues. */
export function checkerAnswersFromIntake(input: { ageYears: number; onset: string; duration: string; impact: string; location: string; clues: string[] }): string[] {
  const ids = [ageBandForYears(input.ageYears), ONSET_TO_CHECKER[input.onset], DURATION_TO_CHECKER[input.duration], input.impact, input.location, ...input.clues];
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))];
}
