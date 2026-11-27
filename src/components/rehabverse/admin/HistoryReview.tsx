"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Timer } from "lucide-react";
import { historyReviewsAction, saveHistoryReviewAction, type HistoryReviewRow } from "@/app/admin/(dashboard)/rehabverse/actions";

/**
 * Research Room phase 2: the review of this history, recorded once. The time from opening the record to "Review finished" is stored for every patient (a
 * workload outcome, measured the same way in both arms). When the AI organised the history, the physiotherapist also counts what it left out, got wrong or
 * invented; the database decides which case applies and refuses the counts otherwise.
 */
export function HistoryReview({ patientId, assessmentId, aiOrganised }: { patientId: string; assessmentId: string; aiOrganised: boolean }) {
  const opened = useRef(performance.now());
  const [existing, setExisting] = useState<HistoryReviewRow | null | undefined>(undefined);
  const [counts, setCounts] = useState({ omissions: 0, errors: 0, invented: 0 });
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  useEffect(() => {
    historyReviewsAction(patientId).then((r) => setExisting(r.ok ? r.reviews.find((x) => x.assessment_id === assessmentId) ?? null : undefined));
  }, [patientId, assessmentId]);

  if (existing === undefined) return null; // not loaded, or the research tables are not set up yet
  if (existing) {
    return (
      <p className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-[13px] text-teal-950">
        <CheckCircle2 className="h-4 w-4 text-teal-600" aria-hidden="true" /> Review recorded: {Math.round(existing.review_seconds / 60)} min
        {existing.ai_organised ? ` · AI history: ${existing.omissions} left out, ${existing.errors} wrong, ${existing.invented} invented` : ""}
      </p>
    );
  }
  const save = () => {
    setError(null);
    const seconds = (performance.now() - opened.current) / 1000;
    start(async () => {
      const r = await saveHistoryReviewAction(assessmentId, aiOrganised ? { seconds, ...counts, note } : { seconds, note });
      if (!r.ok) return setError(r.error);
      const again = await historyReviewsAction(patientId);
      setExisting(again.ok ? again.reviews.find((x) => x.assessment_id === assessmentId) ?? null : null);
    });
  };
  const field = (key: keyof typeof counts, label: string, help: string) => (
    <label className="block text-[13px]">
      <span className="font-bold text-navy-800">{label}</span> <span className="text-slate-500">{help}</span>
      <input type="number" min={0} max={50} inputMode="numeric" value={counts[key]} onChange={(event) => setCounts((c) => ({ ...c, [key]: Math.max(0, Math.min(50, Number(event.target.value) || 0)) }))} className="rv-input mt-1 w-24" />
    </label>
  );
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3" data-rv-history-review>
      <p className="flex items-center gap-2 text-[13.5px] font-bold text-navy-800"><Timer className="h-4 w-4 text-teal-600" aria-hidden="true" /> Research: record your review of this history</p>
      <p className="mt-1 text-[12.5px] leading-5 text-slate-600">The time from opening this record to the button below is saved. Press it when you have finished checking the history against the patient.</p>
      {aiOrganised ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {field("omissions", "Left out", "facts the patient gave that the AI brief missed")}
          {field("errors", "Wrong", "facts the AI brief got wrong")}
          {field("invented", "Invented", "details the patient never said")}
        </div>
      ) : null}
      <textarea value={note} onChange={(event) => setNote(event.target.value.slice(0, 1000))} placeholder="Note (optional)" rows={2} className="rv-input mt-3 w-full" />
      {error ? <p className="rv-error mt-2" role="alert">{error}</p> : null}
      <button type="button" className="rv-btn rv-btn-primary mt-2" disabled={pending} onClick={save}>Review finished</button>
    </div>
  );
}
