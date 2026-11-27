"use client";

import { useEffect, useState } from "react";
import { engagementAction, type EngagementSummary } from "@/app/admin/(dashboard)/rehabverse/actions";

/** Research Room phase 2: what the patient did, recorded by the server the same way for every patient (with or without AI). Hidden until the tables exist. */
export function EngagementPanel({ patientId }: { patientId: string }) {
  const [s, setS] = useState<EngagementSummary | null>(null);
  useEffect(() => { engagementAction(patientId).then((r) => setS(r.ok ? r.summary : null)); }, [patientId]);
  if (!s) return null;
  const cells: [string, string | number][] = [
    ["Active days", s.active_days], ["Days opened", s.days_opened], ["Exercises done", s.exercises_done], ["Minutes on the day page", s.minutes],
    ["Feedback sent", s.feedback_sent], ["Questionnaires sent", s.outcomes_sent],
  ];
  return (
    <div data-rv-engagement>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cells.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-slate-500">{k}</dt>
            <dd className="text-lg font-extrabold tabular-nums text-navy-800">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[12px] text-slate-500">Recorded by the server in the same way for every patient. Last activity: {s.last_at ? new Date(s.last_at).toLocaleString() : "none yet"}.</p>
    </div>
  );
}
