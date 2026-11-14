/** Turns the numbers of a student's own record into plain observations. Pure and tested. */
export type SourceStat = { source: string; xp: number; events: number; xp_7d: number; last_day: string | null; avg_score: number | null };
export type StudentSummary = {
  profile: { display_name: string; stage: string | null; goal: string | null; university: string | null; city: string | null; created_at: string; league_opt_in?: boolean; remind_email?: boolean; remind_hour?: number } | null;
  totals?: { xp: number; events: number; active_days: number; first_day: string | null };
  streak?: { current: number; best: number };
  by_day?: { day: string; xp: number; events: number }[];
  by_source?: SourceStat[];
  recent?: { source: string; label: string; xp: number; score: number | null; at: string }[];
};
export type Insight = { tone: "good" | "tip" | "info"; title: string; text: string; href?: string; cta?: string };

export const sourceInfo: Record<string, { name: string; short: string; href: string; verb: string }> = {
  "pna-teacher": { name: "PNA Teacher", short: "Learn", href: "/learn", verb: "finish a lesson" },
  "skills-lab": { name: "Clinical Skills Lab", short: "Practise", href: "/skills", verb: "practise a skill" },
  "virtual-patient": { name: "Virtual Patient", short: "Examine", href: "/virtual-patient", verb: "examine a patient" },
  "daily-challenge": { name: "Daily Challenge", short: "Challenge", href: "/daily-challenge", verb: "take today's challenge" },
  "clinical-arena": { name: "Clinical Arena", short: "Arena", href: "/case-lab", verb: "work through a case" },
};
export const mainSources = ["pna-teacher", "skills-lab", "virtual-patient", "daily-challenge"] as const;

const dayNumber = (iso: string) => Math.floor(Date.parse(iso + "T00:00:00Z") / 86400000);

export function buildInsights(summary: StudentSummary, today: string): Insight[] {
  const out: Insight[] = [];
  const byDay = new Map((summary.by_day ?? []).map((d) => [d.day, d]));
  const stats = new Map((summary.by_source ?? []).map((s) => [s.source, s]));
  const streak = summary.streak?.current ?? 0;
  const todayRow = byDay.get(today);

  if (todayRow && todayRow.events > 0) {
    out.push({ tone: "good", title: "Today is recorded", text: `${todayRow.events} ${todayRow.events === 1 ? "activity" : "activities"} and +${todayRow.xp} XP saved to your PNA record today.${streak > 1 ? ` Your ${streak}-day streak is alive.` : ""}` });
  } else {
    out.push({ tone: "tip", title: "Nothing recorded yet today", text: streak > 0 ? `One 10-minute lesson keeps your ${streak}-day streak alive.` : "One 10-minute lesson starts your streak.", href: "/learn", cta: "Open PNA Teacher" });
  }

  const ranked = [...stats.values()].filter((s) => s.xp > 0 && s.source in sourceInfo).sort((a, b) => b.xp - a.xp);
  if (ranked[0]) out.push({ tone: "good", title: `Strongest area: ${sourceInfo[ranked[0].source].name}`, text: `${ranked[0].xp} XP across ${ranked[0].events} ${ranked[0].events === 1 ? "activity" : "activities"}${ranked[0].avg_score ? `, average score ${ranked[0].avg_score}%` : ""}.` });

  // The main area they have neglected the longest (or never tried).
  const gaps = mainSources.map((source) => {
    const s = stats.get(source);
    const idle = s?.last_day ? dayNumber(today) - dayNumber(s.last_day) : Infinity;
    return { source, idle };
  }).filter((g) => g.idle >= 6).sort((a, b) => b.idle - a.idle);
  if (gaps[0]) {
    const info = sourceInfo[gaps[0].source];
    out.push({ tone: "tip", title: gaps[0].idle === Infinity ? `You have not tried ${info.name} yet` : `${info.name}: ${gaps[0].idle} days since your last visit`, text: `Balanced practice builds clinical confidence. A short session today would help you ${info.verb}.`, href: info.href, cta: `Open ${info.name}` });
  }

  // Week against week (needs two weeks of history).
  const sum = (from: number, to: number) => (summary.by_day ?? []).reduce((total, d) => {
    const age = dayNumber(today) - dayNumber(d.day);
    return age >= from && age <= to ? total + d.xp : total;
  }, 0);
  const thisWeek = sum(0, 6);
  const lastWeek = sum(7, 13);
  if (thisWeek + lastWeek > 0) {
    if (lastWeek === 0) out.push({ tone: "info", title: "A new week of learning", text: `${thisWeek} XP in the last 7 days.` });
    else {
      const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
      out.push({ tone: change >= 0 ? "good" : "info", title: change >= 0 ? `Up ${change}% on last week` : `Down ${Math.abs(change)}% on last week`, text: `${thisWeek} XP in the last 7 days against ${lastWeek} the week before.` });
    }
  }

  const days30 = (summary.by_day ?? []).filter((d) => d.events > 0).length;
  if (days30 > 0) out.push({ tone: days30 >= 12 ? "good" : "info", title: `${days30} active ${days30 === 1 ? "day" : "days"} in the last 30`, text: days30 >= 20 ? "Excellent consistency — this is how clinical skill is built." : days30 >= 12 ? "Strong rhythm. A few more days and it becomes a habit." : "Small and regular beats long and rare. Aim for four days a week." });
  return out;
}
