"use client";

import { useState, useTransition } from "react";
import { logDeviationAction } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";

const KINDS: [string, string][] = [["eligibility", "Eligibility (should not have been enrolled)"], ["outcome_window", "Outcome taken outside its window"], ["missed_contact", "Missed contact or follow-up"], ["extra_contact", "Extra contact outside the protocol"], ["assessor_unblinded", "Assessor learned the group"], ["other", "Other"]];

/** Research Room phase 3: record a protocol deviation for this participant. Records cannot be changed afterwards. */
export function DeviationForm({ patientId }: { patientId: string }) {
  const [kind, setKind] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <details className="mt-2 rounded-xl border border-slate-200 p-3 text-[13px]">
      <summary className="cursor-pointer font-bold text-navy-800">Record a protocol deviation</summary>
      <div className="mt-2 space-y-2">
        <select className="rv-input" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Kind of deviation"><option value="">Choose the kind…</option>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <textarea className="rv-input" rows={2} placeholder="What happened (at least 10 characters)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} aria-label="Description" />
        <label className="block">Date<input type="date" className="rv-input mt-1" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        {msg ? <p className="font-semibold text-slate-700" role="status">{msg}</p> : null}
        <button type="button" className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]" disabled={pending || !kind || description.trim().length < 10} onClick={() => start(async () => {
          const r = await logDeviationAction(patientId, kind, description, date);
          setMsg(r.ok ? "Recorded." : r.error);
          if (r.ok) { setKind(""); setDescription(""); }
        })}>Record deviation</button>
      </div>
    </details>
  );
}
