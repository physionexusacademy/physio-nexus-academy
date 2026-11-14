/**
 * RehabVerse follow-up helpers — pure and tested. They turn the history the patient already sees into
 *  - the state of each recovery check-in (done / open now / opens later / missed), and
 *  - a plain pain trend. Nothing here decides anything clinical: the trend only describes what the patient reported.
 */
import type { FollowupPoint, HistoryDay } from "./api-types";

/** Hours after a day's feedback in which each check-in can be answered. Mirrors rehab_submit_followup in the database. */
export const WINDOWS: Record<FollowupPoint, readonly [number, number]> = { later_same_day: [2, 20], "24h": [18, 72], "48h": [40, 120] };

export type CheckinState = { point: FollowupPoint; state: "done" | "open" | "soon" | "missed"; pain: number | null; opensAt: number; closesAt: number };

export function checkinStates(day: Pick<HistoryDay, "submitted_at" | "completion" | "observations">, schedule: readonly FollowupPoint[], now: number): CheckinState[] {
  if (!day.submitted_at || day.completion === "none") return [];
  const base = Date.parse(day.submitted_at);
  return schedule.map((point) => {
    const [lo, hi] = WINDOWS[point];
    const opensAt = base + lo * 3_600_000;
    const closesAt = base + hi * 3_600_000;
    const seen = day.observations.find((o) => o.timepoint === point);
    const state: CheckinState["state"] = seen ? "done" : now < opensAt ? "soon" : now <= closesAt ? "open" : "missed";
    return { point, state, pain: seen?.pain ?? null, opensAt, closesAt };
  });
}

export type Trend = {
  verdict: "building" | "improving" | "steady" | "higher";
  points: { label: string; value: number }[];
  start: number | null;
  now: number | null;
  change: number | null;
};

/** One representative pain value per logged day: after exercise if reported, otherwise during, otherwise before. */
function dayPain(day: HistoryDay): number | null {
  const pick = (t: string) => day.observations.find((o) => o.timepoint === t)?.pain ?? null;
  return pick("immediately_after") ?? pick("during") ?? pick("before");
}

export function painTrend(days: HistoryDay[], baseline: number | null): Trend {
  const points: Trend["points"] = [];
  if (baseline !== null && baseline !== undefined) points.push({ label: "Start", value: baseline });
  for (const day of days) {
    if (!day.submitted_at) continue;
    const value = dayPain(day);
    if (value !== null) points.push({ label: `D${day.day_number}`, value });
  }
  if (points.length < 3) return { verdict: "building", points, start: points[0]?.value ?? null, now: points.at(-1)?.value ?? null, change: null };
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const head = mean(points.slice(0, 2).map((p) => p.value));
  const tail = mean(points.slice(-2).map((p) => p.value));
  const change = Math.round((tail - head) * 10) / 10;
  const verdict: Trend["verdict"] = change <= -1.5 ? "improving" : change >= 1.5 ? "higher" : "steady";
  return { verdict, points, start: points[0].value, now: points.at(-1)!.value, change };
}

export const TREND_COPY = {
  building: { en: "Log a few sessions and your trend will appear here.", ru: "Kuch sessions mukammal karein, aap ka trend yahan nazar aayega." },
  improving: { en: "Your reported pain is coming down.", ru: "Aap ka bataya hua dard kam ho raha hai." },
  steady: { en: "Your reported pain is staying about the same.", ru: "Aap ka bataya hua dard taqreeban same hai." },
  higher: { en: "Your reported pain is higher than at the start. Tell your physiotherapist in your next feedback.", ru: "Aap ka bataya hua dard shuru se zyada hai. Agle feedback mein apne physiotherapist ko zaroor batayein." },
} as const;
