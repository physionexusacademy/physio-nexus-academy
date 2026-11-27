"use client";

import { useEffect, useState, useTransition } from "react";
import { ClipboardCheck, EyeOff, Phone } from "lucide-react";
import { assessorQueueAction, assessorRecordAction, type AssessorQueue } from "@/app/rehabverse/assessor-actions";
import { instrumentFor } from "@/lib/outcomes/instruments";
import { dueList } from "@/lib/outcomes/plan";
import type { TimepointKey } from "@/lib/outcomes/types";
import { OutcomeForm } from "../OutcomeForm";

const TP_LABEL: Record<string, string> = { baseline: "Start", w1: "Week 1", w2: "Week 2", w4: "Week 4", w6: "Week 6", w12: "Week 12", discharge: "Discharge" };

/**
 * The blinded assessor's page. It shows participants under a code with what is due; it never receives the arm or anything about the AI, because the
 * database functions it calls do not return them. The assessor collects each outcome in a call or visit and records it here.
 */
export function AssessorRoom() {
  const [queue, setQueue] = useState<AssessorQueue | null>(null);
  const [denied, setDenied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const load = () => assessorQueueAction().then((r) => (r.ok ? setQueue(r.queue) : setDenied(true)));
  useEffect(() => { void load(); }, []);

  if (denied) {
    return (
      <div className="rv-glass mx-auto max-w-xl p-6 text-center">
        <EyeOff className="mx-auto h-8 w-8 text-slate-500" aria-hidden="true" />
        <p className="mt-3 font-bold text-navy-800">This page is for the study's outcome assessor.</p>
        <p className="mt-1 text-sm text-slate-600">Sign in with the account the clinic named as assessor. Clinic admins cannot be the assessor, because they can see the groups.</p>
      </div>
    );
  }
  if (!queue) return <div className="rv-glass mx-auto max-w-xl animate-pulse p-6 text-center text-sm text-slate-500">Loading the participant list…</div>;
  if (!queue.study) return <div className="rv-glass mx-auto max-w-xl p-6 text-center text-sm text-slate-600">No study has been set up yet.</div>;

  const record = (patientId: string, instrument: string, timepoint: TimepointKey, answers: unknown) => {
    setError(null);
    start(async () => {
      const r = await assessorRecordAction(patientId, { instrument, timepoint, answers, language: "en" });
      if (!r.ok) return setError(r.error);
      setOpen(null);
      await load();
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4" data-rv-assessor>
      <header className="rv-glass p-5">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700"><EyeOff className="h-4 w-4" aria-hidden="true" /> Blinded outcome assessor</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-800">{queue.study.code}: {queue.study.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You see participants by code only. Their group is never shown here. If a participant tells you which version of the app they use, do not write it down,
          and tell the study lead that you may have been unblinded. Read each questionnaire exactly as written.
        </p>
      </header>
      {queue.participants.length === 0 ? <p className="rv-glass p-5 text-sm text-slate-600">No participants yet.</p> : null}
      {queue.participants.map((p) => {
        const answered = new Set(p.recorded.map((r) => `${r.instrument}:${r.timepoint}`));
        const due = p.plan ? dueList({ items: p.plan, anchor: new Date(p.enrolled_at) }, answered, new Date(), false) : [];
        const now = due.filter((d) => d.state !== "upcoming");
        return (
          <section key={p.patient_id} className="rv-glass p-5" aria-label={`Participant ${p.code}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-navy-800 px-3 py-1.5 font-mono text-sm font-bold text-white">{p.code}</span>
              <span className="font-bold text-navy-800">{p.full_name}</span>
              {p.phone ? <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 text-sm font-bold text-teal-700"><Phone className="h-4 w-4" aria-hidden="true" />{p.phone}</a> : null}
              <span className="text-xs text-slate-500">Enrolled {new Date(p.enrolled_at).toLocaleDateString()} · {p.preferred_language === "ru" ? "Roman Urdu" : "English"}</span>
            </div>
            {now.length === 0 ? <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><ClipboardCheck className="h-4 w-4 text-teal-600" aria-hidden="true" /> Nothing due now{due[0] ? ` · next: ${instrumentFor(due[0].instrument)?.short ?? due[0].instrument} ${TP_LABEL[due[0].timepoint]} on ${due[0].dueAt.toLocaleDateString()}` : ""}</p> : null}
            <ul className="mt-3 space-y-2">
              {now.map((d) => {
                const ins = instrumentFor(d.instrument);
                if (!ins) return null;
                const key = `${p.patient_id}:${d.instrument}:${d.timepoint}`;
                return (
                  <li key={key} className="rounded-xl border border-slate-200 bg-white p-3">
                    <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen(open === key ? null : key)} aria-expanded={open === key}>
                      <span><b className="text-navy-800">{ins.short}</b> · {TP_LABEL[d.timepoint]} <span className={d.state === "late" ? "text-red-700" : "text-amber-700"}>({d.state})</span></span>
                      <span className="text-sm font-bold text-teal-700">{open === key ? "Close" : "Record"}</span>
                    </button>
                    {open === key ? (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <OutcomeForm instrument={ins} timepoint={d.timepoint} baselineActivities={ins.id === "psfs" && d.timepoint !== "baseline" ? p.psfs_activities : undefined} onSubmit={(a) => record(p.patient_id, d.instrument, d.timepoint, a)} pending={pending} error={error} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
