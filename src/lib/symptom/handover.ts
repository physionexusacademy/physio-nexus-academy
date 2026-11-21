/**
 * Carrying the public symptom checker's answers over to a RehabVerse assessment. The answers travel only in this browser tab (sessionStorage), never to a
 * server until the person sends the assessment, and the receiving side checks every id against the checker's own lists, because anything in storage can be edited.
 */
import { commonHistoryOptions, type RegionId } from "../msk-symptom-checker.ts";
import { allowedAnswerIds, isCheckerRegion } from "./snapshot.ts";

export const HANDOVER_KEY = "pna-checker-handover-v1";
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type Handover = { v: 1; region: RegionId; answers: string[]; language: "en" | "ru"; at: number };

/** What the RehabVerse questions can be pre-filled with: its own "how did it start" ids (only where the meaning is the same), the impact id, location and clues. */
export type HandoverFlow = { region: RegionId; onset: string; impact: string; location: string; clues: string[] };

const ONSET_FROM_CHECKER: Record<string, string> = { onset_trauma: "sudden", onset_gradual: "gradual" };

export function saveHandover(input: { region: RegionId; answers: string[]; language: "en" | "ru" }): void {
  try {
    const value: Handover = { v: 1, region: input.region, answers: input.answers, language: input.language, at: Date.now() };
    window.sessionStorage.setItem(HANDOVER_KEY, JSON.stringify(value));
  } catch {
    /* private mode or storage off: the person simply starts the assessment from the beginning */
  }
}

export function clearHandover(): void {
  try {
    window.sessionStorage.removeItem(HANDOVER_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** The stored hand-over, or null when there is none, it is old, or it does not pass the checks. */
export function readHandover(now = Date.now()): Handover | null {
  try {
    const raw = window.sessionStorage.getItem(HANDOVER_KEY);
    if (!raw) return null;
    return parseHandover(JSON.parse(raw), now);
  } catch {
    return null;
  }
}

export function parseHandover(value: unknown, now = Date.now()): Handover | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.v !== 1 || !isCheckerRegion(v.region) || !Array.isArray(v.answers) || typeof v.at !== "number") return null;
  if (now - v.at > MAX_AGE_MS || v.at > now + 60_000) return null;
  const allowed = allowedAnswerIds(v.region);
  const answers = (v.answers as unknown[]).filter((id): id is string => typeof id === "string" && allowed.has(id));
  return { v: 1, region: v.region, answers: [...new Set(answers)], language: v.language === "ru" ? "ru" : "en", at: v.at };
}

export function flowFromHandover(handover: Handover): HandoverFlow {
  const region = handover.region;
  const answers = new Set(handover.answers);
  const impact = commonHistoryOptions.impact.find((o) => answers.has(o.id))?.id ?? "";
  const onsetId = commonHistoryOptions.onset.find((o) => answers.has(o.id))?.id ?? "";
  const hasPrefix = (prefix: string) => [...answers].filter((id) => id.startsWith(prefix));
  const location = hasPrefix("loc_")[0] ?? "";
  const history = new Set<string>([...commonHistoryOptions.age, ...commonHistoryOptions.onset, ...commonHistoryOptions.duration, ...commonHistoryOptions.impact].map((o) => o.id));
  const clues = [...answers].filter((id) => !history.has(id) && !id.startsWith("loc_"));
  return { region, onset: ONSET_FROM_CHECKER[onsetId] ?? "", impact, location, clues };
}
