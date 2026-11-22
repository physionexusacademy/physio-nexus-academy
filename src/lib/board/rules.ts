import { interpretChange } from "../outcomes/interpret.ts";
import { INSTRUMENT_BY_ID } from "../outcomes/instruments.ts";
import { dueList } from "../outcomes/plan.ts";
import type { OutcomePlanItem } from "../rehabverse/api-types.ts";

/**
 * The therapist board's traffic lights. They come from fixed rules over the rows the database returns, never from a model, so each light can be explained
 * ("red: pain is worse than at the start (4 to 7)") and tested. Red needs the physiotherapist's attention first, amber soon, green is on track.
 */
export type BoardRow = {
  id: string; reference_code: string; full_name: string; age_years: number; sex: string | null; city: string | null; created_at: string; research_consent: boolean; ai_assist: string;
  assessment_id: string | null; assessment_status: string | null; red_flag_level: "none" | "urgent" | "emergency" | null; regions: string[] | null; baseline_pain: number | null;
  assessment_submitted_at: string | null; assessment_reviewed_at: string | null;
  programme_id: string | null; programme_status: string | null; pause_reason: string | null; programme_approved_at: string | null;
  days_total: number | null; days_released: number | null; days_done: number | null; days_awaiting_review: number | null; awaiting_since: string | null;
  last_feedback_at: string | null; last_pain_after: number | null; open_adverse_events: number | null;
  outcome_plan: { items: OutcomePlanItem[]; anchor_at: string } | null;
  outcome_responses: { instrument: string; timepoint: string; primary: number | null; collected_by: string }[] | null;
};
export type Reason = { level: "red" | "amber"; text: string };
export type Attention = { level: "red" | "amber" | "green"; reasons: Reason[]; good: string[]; adherence: number | null; stage: string };

const DAY = 86_400_000;
const days = (from: string | null, now: Date) => (from ? Math.floor((now.getTime() - new Date(from).getTime()) / DAY) : null);
const ORDER = ["baseline", "w1", "w2", "w4", "w6", "w12", "discharge"];

export function assess(row: BoardRow, now: Date): Attention {
  const reasons: Reason[] = [];
  const good: string[] = [];
  const red = (text: string) => reasons.push({ level: "red", text });
  const amber = (text: string) => reasons.push({ level: "amber", text });

  // safety first
  if ((row.open_adverse_events ?? 0) > 0) red(`${row.open_adverse_events} open adverse event${row.open_adverse_events === 1 ? "" : "s"}`);
  if (row.red_flag_level && row.red_flag_level !== "none" && row.assessment_status === "needs_clinical_assessment") red(`Safety warning (${row.red_flag_level}): needs a clinical assessment`);
  if (row.programme_status === "paused") red(`Programme paused${row.pause_reason ? `: ${row.pause_reason}` : ""}`);

  // pain over time from the outcome measures
  const responses = row.outcome_responses ?? [];
  const nprs = responses.filter((r) => r.instrument === "nprs" && r.primary !== null).sort((a, b) => ORDER.indexOf(a.timepoint) - ORDER.indexOf(b.timepoint));
  if (nprs.length >= 2) {
    const first = nprs[0];
    const last = nprs[nprs.length - 1];
    const read = interpretChange(INSTRUMENT_BY_ID.nprs, { primary: first.primary, parts: {}, band: null }, { primary: last.primary, parts: {}, band: null });
    if (read.band === "worse" || read.band === "much_worse") red(`Pain is worse than at the start (${first.primary} to ${last.primary} out of 10)`);
    else if (read.band === "better" || read.band === "much_better") good.push(`Pain better (${first.primary} to ${last.primary})`);
    else if (row.outcome_plan && days(row.outcome_plan.anchor_at, now)! >= 28) amber(`No important pain change after ${Math.floor(days(row.outcome_plan.anchor_at, now)! / 7)} weeks (${first.primary} to ${last.primary})`);
  }

  // waiting on the physiotherapist
  const waiting = row.assessment_status && ["submitted", "in_review"].includes(row.assessment_status) ? days(row.assessment_submitted_at, now) : null;
  if (waiting !== null && waiting >= 2 && row.red_flag_level === "none") amber(`Assessment waiting ${waiting} days`);
  if ((row.days_awaiting_review ?? 0) > 0) {
    const waited = days(row.awaiting_since, now);
    if (waited !== null && waited >= 1) amber(`${row.days_awaiting_review} day${row.days_awaiting_review === 1 ? "" : "s"} awaiting your review for ${waited} day${waited === 1 ? "" : "s"}`);
  }

  // outcome measures that are late
  if (row.outcome_plan) {
    const answered = new Set(responses.map((r) => `${r.instrument}:${r.timepoint}`));
    const due = dueList({ items: row.outcome_plan.items, anchor: new Date(row.outcome_plan.anchor_at) }, answered, now, false).filter((d) => d.state === "late");
    const patientLate = due.filter((d) => INSTRUMENT_BY_ID[d.instrument]?.kind === "patient_reported").length;
    const measureLate = due.length - patientLate;
    if (patientLate) amber(`${patientLate} questionnaire${patientLate === 1 ? "" : "s"} late`);
    if (measureLate) amber(`${measureLate} measurement${measureLate === 1 ? "" : "s"} overdue`);
  }

  // going quiet
  const released = row.days_released ?? 0;
  const done = row.days_done ?? 0;
  if (row.programme_status === "active" && released > done) {
    const quiet = days(row.last_feedback_at ?? row.programme_approved_at, now);
    if (quiet !== null && quiet >= 5) amber(`No activity for ${quiet} days`);
  }
  const adherence = released > 0 ? Math.round((done / released) * 100) : null;
  if (adherence !== null && adherence >= 80 && released >= 3) good.push(`${adherence}% of released days done`);

  const stage = !row.assessment_id ? "No assessment yet" : row.programme_status === "active" ? "Programme running" : row.programme_status === "completed" ? "Programme completed" : row.programme_status === "paused" ? "Programme paused" : row.assessment_status === "programme_created" ? "Programme being prepared" : row.assessment_status === "needs_clinical_assessment" ? "Needs clinical assessment" : row.assessment_status === "cleared_for_programme" ? "Cleared for a programme" : "Assessment to review";
  const level = reasons.some((r) => r.level === "red") ? "red" : reasons.length ? "amber" : "green";
  return { level, reasons, good, adherence, stage };
}

export function sortBoard<T extends { attention: Attention; row: BoardRow }>(items: T[]): T[] {
  const rank = { red: 0, amber: 1, green: 2 } as const;
  return [...items].sort((a, b) => rank[a.attention.level] - rank[b.attention.level] || b.attention.reasons.length - a.attention.reasons.length || a.row.created_at.localeCompare(b.row.created_at));
}
