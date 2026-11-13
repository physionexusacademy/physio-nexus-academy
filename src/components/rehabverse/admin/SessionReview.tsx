"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronDown, Info, ShieldAlert, Unlock } from "lucide-react";
import { overrideUnlockAction, reviewSessionAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { AdminSessionBundle, ProgrammeStatus, ReviewDecision } from "@/lib/rehabverse/api-types";
import { flagLabel, TIMEPOINT_LABEL } from "@/lib/rehabverse/intake";
import { REFERENCES } from "@/lib/rehabverse/references";
import { decisionSupport, type Suggestion } from "@/lib/rehabverse/rules";

const DECISIONS: { id: Exclude<ReviewDecision, "auto_continue">; label: string; help: string }[] = [
  { id: "progress", label: "Progress — open the next day", help: "Releases the next day as planned." },
  { id: "maintain", label: "Maintain — repeat this level", help: "Repeat today's day, then continue." },
  { id: "regress", label: "Regress — lower the load", help: "Repeat today's day (edit the new copy to reduce the dose)." },
  { id: "modify", label: "Modify — change the plan", help: "Repeat today's day with changes you make next." },
  { id: "reassess", label: "Reassess — pause and see the patient", help: "Pauses the programme and asks the patient to book a reassessment." },
  { id: "pause", label: "Pause the programme", help: "Pauses the programme with a message." },
  { id: "discontinue", label: "Discontinue the programme", help: "Stops the programme." },
];
const REPEATING: ReviewDecision[] = ["maintain", "regress", "modify"];
const TONE: Record<Suggestion, string> = {
  pause_refer: "border-rose-300 bg-rose-50 text-rose-950", reassess: "border-amber-300 bg-amber-50 text-amber-950", regress: "border-amber-200 bg-amber-50/70 text-amber-950",
  maintain: "border-slate-200 bg-slate-50 text-slate-800", progress: "border-teal-300 bg-teal-50 text-teal-950",
};
const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function SessionReview({ bundle, previous, programmeStatus }: { bundle: AdminSessionBundle; previous: AdminSessionBundle[]; programmeStatus: ProgrammeStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { session, feedback, exercises, completions, observations, reviews } = bundle;
  const support = useMemo(() => decisionSupport(bundle, previous), [bundle, previous]);
  const reviewable = session.status === "awaiting_review";
  const [open, setOpen] = useState(reviewable);
  const [decision, setDecision] = useState<Exclude<ReviewDecision, "auto_continue">>(support.decision as Exclude<ReviewDecision, "auto_continue">);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [override, setOverride] = useState("");
  const [result, setResult] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const picked = DECISIONS.find((d) => d.id === decision)!;
  const needsResume = ["progress", "maintain", "regress", "modify"].includes(decision) && programmeStatus !== "active";
  const departs = support.suggestion !== "progress" && decision === "progress" || (support.suggestion === "pause_refer" && !["pause", "reassess", "discontinue"].includes(decision));

  const submit = () =>
    start(async () => {
      const r = await reviewSessionAction(session.id, decision, notes, message, REPEATING.includes(decision) && repeat, { suggestion: support.suggestion, fired: support.rules.filter((x) => x.fired).map((x) => x.id), provisional: support.provisional.length > 0 });
      if (!r.ok) return setResult({ kind: "error", text: r.error === "programme_not_active_resume_first" ? "Resume the programme before continuing." : `Could not save (${r.error}).` });
      setResult({ kind: "ok", text: "Decision saved." });
      router.refresh();
    });

  const done = (id: string) => completions.find((c) => c.session_exercise_id === id);

  return (
    <article className={"rounded-2xl border bg-white " + (reviewable ? "border-amber-300 shadow-[0_0_0_3px_rgba(251,191,36,0.18)]" : "border-slate-200")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-3 text-left" aria-expanded={open}>
        <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold " + (session.status === "reviewed" ? "bg-navy-800 text-white" : reviewable ? "bg-amber-200 text-amber-900" : session.status === "unlocked" ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500")}>{session.day_number}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold text-navy-800">{session.title}</span>
          <span className="block text-[12px] text-slate-500">{session.status.replace("_", " ")}{feedback ? ` · feedback ${dt(feedback.submitted_at)} · pain ${feedback.pain_before ?? "–"}/${feedback.pain_during ?? "–"}/${feedback.pain_after ?? "–"}` : ""}</span>
        </span>
        {feedback && (feedback.safety_flag_ids.length || feedback.unusual_symptoms) ? <span className="rv-chip rv-chip-rose">warning</span> : null}
        <ChevronDown className={"h-4 w-4 text-slate-400 transition-transform " + (open ? "rotate-180" : "")} aria-hidden="true" />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-slate-100 p-3 sm:p-4">
          {/* Prescription */}
          <div>
            <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Prescribed</h4>
            <ul className="mt-1.5 space-y-1">
              {exercises.map((e) => {
                const c = done(e.id);
                return (
                  <li key={e.id} className="flex items-center gap-2 text-[13.5px]">
                    {feedback ? (c?.done ? <CheckCircle2 className="h-4 w-4 text-teal-600" aria-label="done" /> : <span className="h-4 w-4 rounded-full border-2 border-slate-300" aria-label="not done" />) : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                    <span className="font-semibold text-navy-800">{e.exercise_title}</span>
                    <span className="text-slate-500">{[e.sets ? `${e.sets}×` : "", e.reps ? `${e.reps}` : "", e.hold_seconds ? ` hold ${e.hold_seconds}s` : "", e.duration_seconds ? ` ${e.duration_seconds}s` : ""].join("") || ""}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Feedback */}
          {feedback ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3 text-[13.5px] leading-6">
                <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Patient feedback</h4>
                <p>Completion: <b>{feedback.completion}</b> · Difficulty: <b>{feedback.difficulty ?? "–"}/10</b></p>
                <p>Pain before / during / after: <b>{feedback.pain_before ?? "–"} / {feedback.pain_during ?? "–"} / {feedback.pain_after ?? "–"}</b></p>
                {feedback.safety_flag_ids.length ? <p className="font-bold text-rose-800">Warning signs: {feedback.safety_flag_ids.map((f) => flagLabel(f)?.en ?? f).join("; ")}</p> : <p className="text-slate-500">No warning signs reported.</p>}
                {feedback.unusual_symptoms ? <p className="text-amber-900">Unusual symptoms: {feedback.unusual_text || "ticked, no detail"}</p> : null}
                {feedback.notes ? <p>Notes: “{feedback.notes}”</p> : null}
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-[13.5px] leading-6">
                <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Recovery (ERRP)</h4>
                <ul>
                  {(["before", "during", "immediately_after", "later_same_day", "24h", "48h"] as const).map((t) => {
                    const o = observations.find((x) => x.timepoint === t);
                    return <li key={t} className={o ? "" : "text-slate-400"}>{TIMEPOINT_LABEL[t].en}: {o ? <b>{o.pain ?? "–"}/10{o.symptom_response ? ` · ${o.symptom_response}` : ""}{o.function_score !== null && o.function_score !== undefined ? ` · function ${o.function_score}/10` : ""}{o.new_symptoms ? " · NEW SYMPTOMS" : ""}{o.flag_ids.length ? " · WARNING" : ""}</b> : "not yet"}</li>;
                  })}
                </ul>
              </div>
            </div>
          ) : <p className="text-[13px] text-slate-500">No feedback yet for this day.</p>}

          {/* Decision support */}
          {feedback ? (
            <div className={"rounded-xl border p-3 " + TONE[support.suggestion]}>
              <p className="flex items-start gap-2 text-[13.5px] font-bold">{support.suggestion === "pause_refer" ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />} {support.headline}</p>
              <details className="mt-1.5 text-[12.5px] leading-5">
                <summary className="cursor-pointer font-bold">How this was worked out ({support.rules.filter((r) => r.fired).length} rule(s) fired)</summary>
                <ul className="mt-1.5 space-y-1">
                  {support.rules.map((r) => (
                    <li key={r.id} className={r.fired ? "" : "opacity-55"}>
                      <b>{r.id}</b> {r.fired ? "✓ fired" : "– not met"} → {r.suggests.replace("_", " & ")}: {r.check}{r.found ? <span className="block pl-4 italic">Found: {r.found}</span> : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">References: {support.references.map((k) => REFERENCES[k]?.text.split(".")[0] + " (" + k.replace(/\D+/, "") + ")").join("; ")}.</p>
              </details>
              {support.provisional.length ? <p className="mt-1.5 text-[12.5px]"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />Provisional: {support.provisional.join(" ")}</p> : null}
              <p className="mt-1.5 text-[11.5px] italic leading-4 opacity-80">{support.disclaimer}</p>
            </div>
          ) : null}

          {/* Decision */}
          {reviewable ? (
            <fieldset className="space-y-3 rounded-xl border border-slate-200 p-3">
              <legend className="px-1 text-[13px] font-extrabold text-navy-800">Your decision (you are in control)</legend>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {DECISIONS.map((d) => (
                  <label key={d.id} className={"flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-[13px] " + (decision === d.id ? "border-teal-400 bg-teal-50/60" : "border-slate-200")}>
                    <input type="radio" name={`dec-${session.id}`} checked={decision === d.id} onChange={() => setDecision(d.id)} className="mt-1 accent-teal-600" />
                    <span><b className="block text-navy-800">{d.label}</b><span className="text-slate-500">{d.help}</span></span>
                  </label>
                ))}
              </div>
              {REPEATING.includes(decision) ? (
                <label className="flex items-start gap-2 text-[13px]"><input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="mt-1 accent-teal-600" /> <span>Insert a repeat copy of this day before the next one (then edit the copy in the programme builder).</span></label>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <textarea className="rv-input" rows={3} placeholder="Clinical notes (private — not shown to the patient)" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={3000} aria-label="Clinical notes" />
                <textarea className="rv-input" rows={3} placeholder="Message to the patient (optional, shown to them)" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={600} aria-label="Message to patient" />
              </div>
              {departs ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-950"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> This differs from the decision-support suggestion. That is allowed — it is recorded with your decision; please note your reasoning above.</p> : null}
              {needsResume ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] text-rose-900">The programme is {programmeStatus}. Resume it first (programme controls above), then continue.</p> : null}
              {result ? <p className={"text-[13px] font-semibold " + (result.kind === "ok" ? "text-teal-800" : "text-rose-800")} role={result.kind === "error" ? "alert" : "status"}>{result.text}</p> : null}
              <button type="button" className="rv-btn rv-btn-primary" disabled={pending || needsResume} onClick={submit}>Save decision — {picked.label.split(" — ")[0]}</button>
            </fieldset>
          ) : null}

          {reviews.length ? (
            <div>
              <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">Decisions</h4>
              <ul className="mt-1 space-y-1 text-[13px]">
                {reviews.map((r) => <li key={r.id}><b className="capitalize">{r.decision.replace("_", " ")}</b> · {dt(r.created_at)}{r.reviewer_id ? "" : " · automatic rule"}{r.notes ? ` — ${r.notes}` : ""}{r.patient_message ? ` · message: “${r.patient_message}”` : ""}</li>)}
              </ul>
            </div>
          ) : null}

          {session.status === "locked" ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-2.5">
              <input className="rv-input !min-h-[38px] min-w-[14rem] flex-1 !text-[13px]" placeholder="Reason for opening this day early (required, audited)" value={override} onChange={(e) => setOverride(e.target.value)} aria-label="Override reason" />
              <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px] !text-[13px]" disabled={pending || override.trim().length < 10 || programmeStatus !== "active"} onClick={() => start(async () => {
                const r = await overrideUnlockAction(session.id, override);
                setResult(r.ok ? { kind: "ok", text: "Day opened." } : { kind: "error", text: `Could not open (${r.error}).` });
                if (r.ok) { setOverride(""); router.refresh(); }
              })}><Unlock className="h-4 w-4" aria-hidden="true" /> Open this day now (override)</button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
