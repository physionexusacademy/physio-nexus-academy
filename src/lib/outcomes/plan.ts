import { INSTRUMENT_BY_ID } from "./instruments.ts";
import { SCHEDULES, TIMEPOINT_DAYS, type ScheduleKey, type TimepointKey } from "./types.ts";

/** What a physiotherapist chose for a patient: each instrument with how often it is asked. The plan starts on `anchor` (normally the day it is set). */
export type PlanItem = { instrument: string; version: number; schedule: ScheduleKey };
export type PlanInput = { items: PlanItem[]; anchor: Date };
export type DueState = "upcoming" | "due" | "late";
export type DueEntry = { instrument: string; timepoint: TimepointKey; dueAt: Date; state: DueState };

const DAY = 86_400_000;
export const MAX_PLAN_ITEMS = 8;
/** A patient can answer from the due day; it is called late a week after. */
export const LATE_AFTER_DAYS = 7;

export function timepointsFor(item: PlanItem): TimepointKey[] {
  const instrument = INSTRUMENT_BY_ID[item.instrument];
  const points = SCHEDULES[item.schedule]?.points ?? [];
  return instrument && !instrument.atBaseline ? points.filter((point) => point !== "baseline") : points;
}

export type PlanCheck = { ok: true; items: PlanItem[] } | { ok: false; reason: string };

/** Checks a plan the physiotherapist sent: known, available instruments at their current version, valid schedules, no repeats. */
export function checkPlanItems(input: unknown): PlanCheck {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_PLAN_ITEMS) return { ok: false, reason: `choose between 1 and ${MAX_PLAN_ITEMS} instruments` };
  const seen = new Set<string>();
  const items: PlanItem[] = [];
  for (const entry of input) {
    if (typeof entry !== "object" || entry === null) return { ok: false, reason: "invalid plan entry" };
    const { instrument, version, schedule } = entry as Record<string, unknown>;
    if (typeof instrument !== "string" || typeof schedule !== "string" || typeof version !== "number") return { ok: false, reason: "invalid plan entry" };
    const found = INSTRUMENT_BY_ID[instrument];
    if (!found) return { ok: false, reason: `unknown instrument ${instrument}` };
    if (found.status !== "ready") return { ok: false, reason: `${found.short} is not available yet (${found.status.replace(/_/g, " ")})` };
    if (found.version !== version) return { ok: false, reason: `${found.short} is now version ${found.version}` };
    if (!(schedule in SCHEDULES)) return { ok: false, reason: "unknown schedule" };
    if (seen.has(instrument)) return { ok: false, reason: `${found.short} is chosen twice` };
    seen.add(instrument);
    items.push({ instrument, version, schedule: schedule as ScheduleKey });
  }
  return { ok: true, items };
}

/**
 * Every question or measurement that is not answered yet, with when it is due. `answered` lists what already exists ("psfs:baseline"). Only patient-reported
 * instruments are for the patient; the physiotherapist's measurements are listed with `onlyPatientReported = false`.
 */
export function dueList(plan: PlanInput, answered: Set<string>, now: Date, onlyPatientReported = true): DueEntry[] {
  const out: DueEntry[] = [];
  for (const item of plan.items) {
    const instrument = INSTRUMENT_BY_ID[item.instrument];
    if (!instrument) continue;
    if (onlyPatientReported && instrument.kind !== "patient_reported") continue;
    for (const timepoint of timepointsFor(item)) {
      if (answered.has(`${item.instrument}:${timepoint}`)) continue;
      const days = timepoint === "discharge" ? 0 : TIMEPOINT_DAYS[timepoint];
      const dueAt = new Date(plan.anchor.getTime() + days * DAY);
      const state: DueState = now.getTime() < dueAt.getTime() ? "upcoming" : now.getTime() > dueAt.getTime() + LATE_AFTER_DAYS * DAY ? "late" : "due";
      out.push({ instrument: item.instrument, timepoint, dueAt, state });
    }
  }
  return out.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime() || a.instrument.localeCompare(b.instrument));
}
