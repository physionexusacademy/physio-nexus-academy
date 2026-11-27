"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ShieldAlert } from "lucide-react";
import { monitorAction, type StudyMonitor } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";

const TP: Record<string, string> = { baseline: "Start", w1: "Week 1", w2: "Week 2", w4: "Week 4", w6: "Week 6", w12: "Week 12" };
const DEV: Record<string, string> = { eligibility: "Eligibility", outcome_window: "Outcome outside its window", missed_contact: "Missed contact", extra_contact: "Extra contact", assessor_unblinded: "Assessor unblinded", other: "Other" };
const pct = (done: number, due: number) => (due ? `${Math.round((done / due) * 100)}%` : "–");

/**
 * Research Room phase 3: the trial monitor. Process measures only: recruitment, follow-up completeness of the primary outcome, baseline balance,
 * discontinuations, deviations and safety. Outcome scores are never shown by arm here; they belong to the final analysis.
 */
export function MonitorPanel() {
  const [m, setM] = useState<StudyMonitor | null>(null);
  useEffect(() => { monitorAction().then((r) => setM(r.ok ? r.monitor : null)); }, []);
  if (!m || !m.study || !m.recruitment) return null;
  const { recruitment: rec, followup = [], lost_primary, discontinued, balance = [], deviations, safety } = m;
  const target = m.study.target_per_arm * 2;
  const other = deviations ? Object.entries(deviations.other) : [];
  return (
    <section className="rv-glass space-y-4 p-5" aria-labelledby="rr-monitor-h">
      <h2 id="rr-monitor-h" className="flex items-center gap-2 font-heading text-lg font-bold text-navy-800"><Activity className="h-5 w-5 text-teal-600" aria-hidden="true" /> Trial monitor</h2>
      <p className="text-[13px] leading-6 text-slate-600">How the trial is running. Outcome scores are never shown by group here; only whether they were collected. The primary outcome is <b>{m.study.primary}</b> at <b>{TP[m.study.primary_timepoint] ?? m.study.primary_timepoint}</b>.</p>

      {safety?.review_needed || safety?.overdue ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-[13.5px] text-red-950" role="alert">
          <p className="flex items-center gap-2 font-bold"><ShieldAlert className="h-5 w-5" aria-hidden="true" /> Safety needs attention</p>
          {safety.review_needed ? <p className="mt-1">{safety.serious_related} serious events at least possibly related to the intervention (review threshold: {safety.review_threshold}). Hold a safety review with the monitoring committee before enrolling more people.</p> : null}
          {safety.overdue ? <p className="mt-1">{safety.overdue} serious event report(s) to the ethics committee are past their deadline.</p> : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-500">Recruited</p>
          <p className="text-2xl font-extrabold tabular-nums text-navy-800">{rec.allocated}{target ? <span className="text-base font-bold text-slate-500"> / {target}</span> : null}</p>
          <p className="text-[12px] text-slate-600">AI {rec.by_arm.ai} · no AI {rec.by_arm.no_ai}</p>
          {target ? <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, (rec.allocated / target) * 100)}%` }} /></span> : null}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-500">Primary outcome missing</p>
          <p className="text-2xl font-extrabold tabular-nums text-navy-800">{(lost_primary?.ai ?? 0) + (lost_primary?.no_ai ?? 0)}</p>
          <p className="text-[12px] text-slate-600">AI {lost_primary?.ai ?? 0} · no AI {lost_primary?.no_ai ?? 0} (two weeks past its window)</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-500">Programme discontinued</p>
          <p className="text-2xl font-extrabold tabular-nums text-navy-800">{(discontinued?.ai ?? 0) + (discontinued?.no_ai ?? 0)}</p>
          <p className="text-[12px] text-slate-600">AI {discontinued?.ai ?? 0} · no AI {discontinued?.no_ai ?? 0}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-[13px]">
          <caption className="mb-1 text-left text-[12.5px] font-bold text-slate-600">Primary outcome collected (of those due)</caption>
          <thead><tr className="text-slate-500"><th className="py-1 pr-2">Time point</th><th className="py-1 pr-2">AI</th><th className="py-1 pr-2">No AI</th></tr></thead>
          <tbody>{followup.map((f) => (
            <tr key={f.timepoint} className="border-t border-slate-100"><td className="py-1.5 pr-2 font-bold text-navy-800">{TP[f.timepoint] ?? f.timepoint}</td>
              <td className="py-1.5 pr-2 tabular-nums">{f.ai_done}/{f.ai_due} <span className="text-slate-500">({pct(f.ai_done, f.ai_due)})</span></td>
              <td className="py-1.5 pr-2 tabular-nums">{f.no_ai_done}/{f.no_ai_due} <span className="text-slate-500">({pct(f.no_ai_done, f.no_ai_due)})</span></td></tr>
          ))}</tbody>
        </table>
      </div>

      {balance.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <caption className="mb-1 text-left text-[12.5px] font-bold text-slate-600">Baseline balance</caption>
            <thead><tr className="text-slate-500"><th className="py-1 pr-2">Group</th><th className="py-1 pr-2">n</th><th className="py-1 pr-2">Age, mean (SD)</th><th className="py-1 pr-2">Pain NPRS, mean (SD)</th><th className="py-1 pr-2">Female / male</th><th className="py-1 pr-2">Pain bands</th></tr></thead>
            <tbody>{balance.map((b) => (
              <tr key={b.arm} className="border-t border-slate-100"><td className="py-1.5 pr-2 font-bold text-navy-800">{b.arm === "ai" ? "AI" : "No AI"}</td><td className="py-1.5 pr-2 tabular-nums">{b.n}</td>
                <td className="py-1.5 pr-2 tabular-nums">{b.age_mean ?? "–"} ({b.age_sd ?? "–"})</td><td className="py-1.5 pr-2 tabular-nums">{b.nprs_mean ?? "–"} ({b.nprs_sd ?? "–"})</td>
                <td className="py-1.5 pr-2 tabular-nums">{b.female} / {b.male}</td><td className="py-1.5 pr-2">{b.strata ? Object.entries(b.strata).map(([k, v]) => `${k}: ${v}`).join(", ") : "–"}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-[13px]">
          <p className="font-bold text-navy-800">Protocol deviations</p>
          <ul className="mt-1 space-y-0.5 text-slate-700">
            <li>AI setting overridden: {deviations?.ai_override ?? 0}</li>
            {other.map(([k, v]) => <li key={k}>{DEV[k] ?? k}: {v}</li>)}
            {!other.length && !deviations?.ai_override ? <li className="text-slate-500">None recorded.</li> : null}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-[13px]">
          <p className="flex items-center gap-1.5 font-bold text-navy-800"><AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" /> Safety</p>
          <ul className="mt-1 space-y-0.5 text-slate-700">
            <li>Adverse events after enrolment: AI {safety?.adverse_events.ai ?? 0} · no AI {safety?.adverse_events.no_ai ?? 0}</li>
            <li>Serious: AI {safety?.serious.ai ?? 0} · no AI {safety?.serious.no_ai ?? 0}</li>
            <li>Waiting for a safety assessment: {safety?.not_assessed ?? 0}</li>
            <li>Ethics reports due in 3 days: {safety?.due_soon ?? 0} · overdue: {safety?.overdue ?? 0}</li>
          </ul>
        </div>
      </div>
      <p className="text-[12px] text-slate-500">Recruitment by month: {rec.by_month.map((x) => `${x.month} (${x.n})`).join(", ") || "none yet"}.</p>
    </section>
  );
}
