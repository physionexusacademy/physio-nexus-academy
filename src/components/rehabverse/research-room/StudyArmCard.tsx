"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { overrideAiAction } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";
import type { StudyPatient } from "@/lib/research-room";

/**
 * Replaces the free AI switch for a study participant. The arm was set by the allocation list and cannot be changed. If the AI really has to be turned off or on for
 * a safety or practical reason, the override needs a written reason and is recorded as a departure from the allocation (the person is still analysed in the arm allocated).
 */
export function StudyArmCard({ patientId, study, aiNow }: { patientId: string; study: Extract<StudyPatient, { enrolled: true }>; aiNow: "on" | "off" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const go = () => start(async () => {
    setError(null);
    const r = await overrideAiAction(patientId, aiNow === "off", reason);
    if (r.ok) { setOpen(false); setReason(""); router.refresh(); } else setError(r.error);
  });
  return (
    <section className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5" aria-label="Study allocation" data-testid="study-arm-card">
      <div className="flex flex-wrap items-center gap-2">
        <FlaskConical className="h-4 w-4 text-teal-700" aria-hidden="true" />
        <b className="text-[13.5px] text-navy-800">Study participant</b>
        <span className="rv-chip rv-chip-navy">{study.arm === "ai" ? "AI-assisted arm" : "Standard (no AI) arm"}</span>
        <span className="rv-chip">AI now: {aiNow}</span>
        <span className="rv-chip">pain band {study.stratum}</span>
      </div>
      <p className="mt-1.5 text-[12px] leading-5 text-slate-600">The arm was set by random allocation and cannot be changed. The AI switch is locked.</p>
      {study.deviations.length ? <ul className="mt-1.5 list-disc pl-5 text-[12.5px] text-amber-900">{study.deviations.map((d) => <li key={d.recorded_at}>Departure: AI set {d.received_ai} ({d.reason})</li>)}</ul> : null}
      {open ? (
        <div className="mt-2 space-y-2">
          <label className="rv-label" htmlFor="ov-reason">Why must the AI be turned {aiNow === "on" ? "off" : "on"}? (this is recorded as a departure from the allocation)</label>
          <input id="ov-reason" className="rv-input" value={reason} onChange={(e) => setReason(e.target.value)} />
          {error ? <p className="rv-error" role="alert">Could not save ({error}).</p> : null}
          <div className="flex gap-2"><button type="button" className="rv-btn rv-btn-danger" disabled={pending || reason.trim().length < 10} onClick={go}>Record the departure and turn AI {aiNow === "on" ? "off" : "on"}</button><button type="button" className="rv-btn rv-btn-ghost" onClick={() => setOpen(false)}>Cancel</button></div>
        </div>
      ) : <button type="button" className="rv-btn rv-btn-ghost mt-2 !min-h-[34px]" onClick={() => setOpen(true)}>Override the AI setting (logged)</button>}
    </section>
  );
}
