import { Activity } from "lucide-react";
import { flowSummary, reasonLabel, type StudyLog, type StudyOverview } from "@/lib/research-room";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** The numbers a CONSORT-style flow diagram needs, the reasons people were not enrolled, and the logs. */
export function FlowPanel({ overview, log }: { overview: StudyOverview; log: StudyLog | null }) {
  const flow = flowSummary(overview);
  const config = overview.study?.config;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="rr-flow">
      <h2 id="rr-flow" className="flex items-center gap-2 font-heading text-base font-bold text-navy-800"><Activity className="h-4 w-4 text-teal-600" aria-hidden="true" /> Recruitment and allocation</h2>
      {flow.lines.length ? (
        <dl className="mt-2 grid gap-2 sm:grid-cols-4" data-testid="flow">
          {flow.lines.map((l) => (
            <div key={l.label} className="rounded-xl border border-slate-200 px-3 py-2"><dt className="text-[12px] text-slate-500">{l.label}</dt><dd className="text-xl font-bold text-navy-800">{l.value}</dd></div>
          ))}
        </dl>
      ) : <p className="mt-2 text-[13.5px] text-slate-500">No one has been screened yet.</p>}
      {overview.study?.config.target_per_arm ? <p className="mt-2 text-[12.5px] text-slate-600">Target: {overview.study.config.target_per_arm} per arm ({overview.study.config.target_per_arm * 2} in all).</p> : null}
      {!flow.consistent ? <p className="rv-error mt-2" role="alert">The flow numbers do not add up ({flow.waiting} not accounted for). Check the screening log.</p> : null}
      {overview.exclusion_reasons?.length ? (
        <div className="mt-3"><p className="text-[13px] font-bold text-navy-800">Why people were not enrolled</p>
          <ul className="mt-1 text-[13px] text-slate-700">{overview.exclusion_reasons.map((r) => <li key={r.reason}>{r.n} × {reasonLabel(r.reason, config)}</li>)}</ul></div>
      ) : null}
      {log?.allocations.length ? (
        <details className="mt-3"><summary className="cursor-pointer text-[13px] font-bold text-teal-700">Allocation log ({log.allocations.length})</summary>
          <ul className="mt-1 divide-y divide-slate-100 text-[13px]">{log.allocations.map((a) => <li key={a.reference_code} className="flex flex-wrap justify-between gap-2 py-1"><span>{a.full_name} <span className="text-slate-500">· {a.reference_code}</span></span><span>pain {a.stratum} · <b>{a.arm === "ai" ? "AI-assisted" : "standard"}</b> · {dt(a.allocated_at)}</span></li>)}</ul></details>
      ) : null}
      {log?.screening.length ? (
        <details className="mt-2"><summary className="cursor-pointer text-[13px] font-bold text-teal-700">Screening log ({log.screening.length})</summary>
          <ul className="mt-1 divide-y divide-slate-100 text-[13px]">{log.screening.map((s) => <li key={s.reference_code} className="flex flex-wrap justify-between gap-2 py-1"><span>{s.full_name} <span className="text-slate-500">· {s.reference_code}</span></span><span>{s.outcome}{s.reasons.length ? `: ${s.reasons.map((r) => reasonLabel(r, config)).join("; ")}` : ""} · {dt(s.screened_at)}</span></li>)}</ul></details>
      ) : null}
    </section>
  );
}
