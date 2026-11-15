/**
 * Weekly goal and badges for My PNA, worked out from the numbers of the student's own record (the same summary the insights use).
 * Pure and tested (scripts/validate-student.ts). The goal the student picks is kept in this browser only; nothing here is stored on the server.
 */
import { mainSources, type StudentSummary } from "./insights.ts";

export type GoalId = "light" | "steady" | "focused";
export const GOALS: { id: GoalId; label: string; xp: number; note: string }[] = [
  { id: "light", label: "Light", xp: 100, note: "two short sessions" },
  { id: "steady", label: "Steady", xp: 250, note: "a few sessions" },
  { id: "focused", label: "Focused", xp: 500, note: "most days" },
];
export const DEFAULT_GOAL: GoalId = "steady";
export const goalXp = (id: string | null | undefined) => (GOALS.find((g) => g.id === id) ?? GOALS.find((g) => g.id === DEFAULT_GOAL)!).xp;

const DAY = 86400000;
const dayNumber = (iso: string) => Math.floor(Date.parse(iso + "T00:00:00Z") / DAY);
const isoOf = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);

/** The Monday of the week that holds `today` (a YYYY-MM-DD date). Leagues also run Monday to Sunday. */
export function weekStart(today: string): string {
  const n = dayNumber(today);
  const weekday = (new Date(n * DAY).getUTCDay() + 6) % 7; // Monday = 0
  return isoOf(n - weekday);
}

export type WeekProgress = { start: string; xp: number; goal: number; percent: number; left: number; daysLeft: number; perDay: number; achieved: boolean };
export function weekProgress(summary: StudentSummary, today: string, goal: number): WeekProgress {
  const start = weekStart(today);
  const xp = (summary.by_day ?? []).reduce((total, d) => (d.day >= start && d.day <= today ? total + d.xp : total), 0);
  const left = Math.max(0, goal - xp);
  const daysLeft = 7 - (dayNumber(today) - dayNumber(start)); // today counts
  return { start, xp, goal, percent: Math.min(100, Math.round((xp / goal) * 100)), left, daysLeft, perDay: left ? Math.ceil(left / daysLeft) : 0, achieved: xp >= goal };
}

export type Badge = { id: string; name: string; text: string; earned: boolean; progress: string };
const STREAKS = [3, 7, 14, 30];

export function buildBadges(summary: StudentSummary, today: string): Badge[] {
  const out: Badge[] = [];
  const events = summary.totals?.events ?? 0;
  out.push({ id: "first-step", name: "First step", text: "Your first recorded activity.", earned: events >= 1, progress: events >= 1 ? "Done" : "Finish one lesson, skill, patient or challenge" });

  const best = Math.max(summary.streak?.best ?? 0, summary.streak?.current ?? 0);
  for (const target of STREAKS) out.push({ id: `streak-${target}`, name: `${target}-day streak`, text: `${target} days in a row.`, earned: best >= target, progress: best >= target ? "Done" : `${best} of ${target} days` });

  const stats = new Map((summary.by_source ?? []).map((s) => [s.source, s]));
  const tried = mainSources.filter((s) => (stats.get(s)?.xp ?? 0) > 0).length;
  out.push({ id: "all-rounder", name: "All-rounder", text: "Learn, practise, examine and take the challenge at least once.", earned: tried === mainSources.length, progress: tried === mainSources.length ? "Done" : `${tried} of ${mainSources.length} areas` });

  const sharp = [...stats.values()].some((s) => s.events >= 5 && (s.avg_score ?? 0) >= 80);
  out.push({ id: "sharp-mind", name: "Sharp mind", text: "An average score of 80% or more over at least five scored activities in one area.", earned: sharp, progress: sharp ? "Done" : "Score 80% or more over five activities" });

  const days30 = (summary.by_day ?? []).filter((d) => d.events > 0 && dayNumber(today) - dayNumber(d.day) <= 29).length;
  out.push({ id: "regular", name: "Regular", text: "Learned on 12 or more days in the last 30.", earned: days30 >= 12, progress: days30 >= 12 ? "Done" : `${days30} of 12 days` });
  return out;
}
