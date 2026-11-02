"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CalendarCheck, Flame, Trophy, Zap } from "lucide-react";
import { getPakistanDate, getUnifiedProgress, shiftPakistanDate, type UnifiedProgress } from "@/lib/unified-progress";

const levels = [
  { name: "Rising Clinician", min: 100 },
  { name: "Case Solver", min: 400 },
  { name: "Clinical Master", min: 1000 },
  { name: "Clinical Legend", min: 2500 },
];
export function UnifiedProgressCard() {
  const [progress, setProgress] = useState<UnifiedProgress | null>(null);
  const refresh = useCallback(() => setProgress(getUnifiedProgress()), []);
  useEffect(() => {
    refresh();
    window.addEventListener("pna-unified-progress-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("pna-daily-score-saved", refresh);
    return () => {
      window.removeEventListener("pna-unified-progress-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pna-daily-score-saved", refresh);
    };
  }, [refresh]);
  if (!progress) return <section aria-label="Your learning progress" className="container-content py-5"><div className="rounded-2xl border border-teal-100 bg-white p-5 text-sm text-slate-500">Preparing your learning progress…</div></section>;

  const today = getPakistanDate();
  const activeToday = progress.activeDates.includes(today);
  const nextLevel = levels.find((level) => progress.totalXP < level.min);
  const previousLevel = nextLevel ? Math.max(0, ...levels.filter((level) => level.min < nextLevel.min).map((level) => level.min)) : 2500;
  const progressPercent = nextLevel ? Math.min(100, Math.max(0, ((progress.totalXP - previousLevel) / (nextLevel.min - previousLevel)) * 100)) : 100;
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = shiftPakistanDate(today, index - 6);
    return { date, active: progress.activeDates.includes(date) };
  });
  return <section data-pna-unified-progress="v1" aria-labelledby="pna-progress-title" className="container-content py-5 sm:py-7">
    <div className="overflow-hidden rounded-3xl border border-[#d7e9e6] bg-white shadow-sm">
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-teal-700"><Activity className="h-4 w-4"/> Your PNA learning journey</p>
          <h2 id="pna-progress-title" className="mt-2 text-2xl font-bold tracking-tight text-[#183c4d] sm:text-3xl">Small steps. Stronger clinical thinking.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Your streak grows when you complete a Daily Clinical Challenge or finish a Clinical Arena case. Your progress stays on this browser and device.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/daily-challenge#play-daily" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800">Today's challenge <ArrowRight className="h-4 w-4"/></Link>
            <Link href="/clinical-arena" className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-100">Solve a case <ArrowRight className="h-4 w-4"/></Link>
          </div>
        </div>
        <div className="rounded-2xl bg-[#f2f9f7] p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white bg-white p-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Flame className="h-4 w-4 text-orange-500"/> Current streak</div><p className="mt-2 text-3xl font-bold tabular-nums text-[#183c4d]">{progress.currentStreak}<span className="ml-1 text-sm font-semibold text-slate-500">days</span></p></div>
            <div className="rounded-xl border border-white bg-white p-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Zap className="h-4 w-4 text-amber-500"/> Total XP</div><p className="mt-2 text-3xl font-bold tabular-nums text-[#183c4d]">{progress.totalXP.toLocaleString()}<span className="ml-1 text-sm font-semibold text-slate-500">XP</span></p></div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3"><span className="text-sm font-bold text-[#183c4d]">{nextLevel ? nextLevel.name : "Clinical Legend"}</span><span className="text-xs font-semibold text-slate-500">{nextLevel ? Math.max(0, nextLevel.min - progress.totalXP) + " XP to next level" : "Top level reached"}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dcebe7]" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPercent)}><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: progressPercent + "%" }}/></div>
          <div className="mt-4 flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><CalendarCheck className="h-4 w-4 text-teal-700"/> Last 7 days</span><span className="text-xs text-slate-500">Best streak: {progress.longestStreak} days</span></div>
          <div className="mt-2 grid grid-cols-7 gap-1.5" aria-label="Activity in the last seven Pakistan-local days">{week.map((day) => <div key={day.date} title={day.date + (day.active ? " · learning completed" : " · no completed activity")} className={"h-7 rounded-md border " + (day.active ? "border-teal-700 bg-teal-600" : "border-slate-200 bg-white")}/>)}</div>
          <p className="mt-3 text-xs leading-5 text-slate-600" role="status">{activeToday ? "Today's learning mission is complete. Come back tomorrow to keep your streak going." : progress.currentStreak > 0 ? "One completed case or today's challenge keeps your streak alive." : "Start today: finish a clinical case or the Daily Clinical Challenge to begin your streak."}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5efed] px-5 py-3 text-xs text-slate-500 sm:px-7"><span><Trophy className="mr-1 inline h-3.5 w-3.5 text-amber-500"/> Best streak: {progress.longestStreak} days</span><span>Dates follow Pakistan time · Progress stored on this device</span></div>
    </div>
  </section>;
}
