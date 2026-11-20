"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCopy, ListChecks, ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import type { AdminAiConversation, AdminAssessment, AdminPatient } from "@/lib/rehabverse/api-types";
import { briefToText, buildHistoryBrief } from "@/lib/rehabverse/brief";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * What the treating physiotherapist reads before the first visit: the patient's intake organised by fixed rules (see lib/rehabverse/brief.ts).
 * Nothing here is written by a model, nothing is a diagnosis, and the patient's own words are quoted as written.
 */
export function HistoryBrief({ patient, assessment, conversation }: { patient: AdminPatient["patient"]; assessment: AdminAssessment; conversation: AdminAiConversation | null }) {
  const brief = useMemo(() => buildHistoryBrief({ patient, assessment, conversation }), [patient, assessment, conversation]);
  const [copied, setCopied] = useState(false);
  const { safety } = brief;
  const flagged = safety.ticked.length > 0;
  const worth = safety.crossChecks.length > 0 || !!safety.chatAlert;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(briefToText(brief, { reference_code: patient.reference_code, submitted_at: dt(assessment.submitted_at) }));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4" data-history-brief>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[14px] font-bold text-navy-800">{brief.headline}</p>
        <button type="button" onClick={copy} className="rv-pill inline-flex items-center gap-1.5" aria-live="polite">
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />} {copied ? "Copied" : "Copy as text"}
        </button>
      </div>
      <p className="flex items-start gap-2 text-[12.5px] leading-5 text-slate-600">
        {brief.source.kind === "ai_chat" ? <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /> : <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}
        <span>{brief.source.text}</span>
      </p>

      {/* safety first */}
      {flagged || worth ? (
        <div className={"rounded-xl border p-3 " + (safety.level === "emergency" || safety.chatAlert ? "border-rose-300 bg-rose-50 text-rose-950" : "border-amber-300 bg-amber-50 text-amber-950")} role="alert">
          <p className="flex items-center gap-2 text-[13.5px] font-bold"><ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" /> Safety</p>
          {flagged ? (
            <div className="mt-1 text-[13px] leading-5">
              <p className="font-semibold">Red-flag screening ({safety.level}):</p>
              <ul className="list-disc pl-5">{safety.ticked.map((f) => <li key={f.id}>{f.label}</li>)}</ul>
            </div>
          ) : null}
          {safety.chatAlert ? <p className="mt-1 text-[13px] font-semibold">The AI conversation stopped on a safety alert: {safety.chatAlert.replace(/-/g, " ")}.</p> : null}
          {safety.crossChecks.length ? (
            <div className="mt-1 text-[13px] leading-5">
              <p className="font-semibold">Worth confirming: the patient&rsquo;s wording matches an alert, but that screening question was not ticked.</p>
              <ul className="list-disc pl-5">{safety.crossChecks.map((c, i) => <li key={i}><b className="capitalize">{c.kind.replace(/-/g, " ")}</b> in {c.where}: <span className="italic">&ldquo;{c.quote}&rdquo;</span></li>)}</ul>
            </div>
          ) : null}
        </div>
      ) : <p className="rounded-xl bg-teal-50 px-3 py-2 text-[13px] font-semibold text-teal-900">Red-flag screening: nothing ticked, and no alert wording found in the patient&rsquo;s own text.</p>}

      {/* the story */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">The story, in the patient&rsquo;s answers</p>
        <p className="text-[14px] leading-6 text-slate-800">{brief.narrative.join(" ")}</p>
      </div>

      {brief.mentions.length ? (
        <p className="text-[13px] leading-5 text-slate-700">
          <b className="text-navy-800">Mentioned in the history:</b> {brief.mentions.map((m) => m.label).join(", ")}. <span className="text-slate-500">Worth knowing when choosing exercise or hands-on techniques.</span>
        </p>
      ) : null}

      {/* what the patient changed after the chat */}
      {brief.changes ? (
        <div className="rounded-xl border border-slate-200 p-3.5">
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Changed by the patient after the chat</p>
          {brief.changes.length ? (
            <ul className="space-y-1 text-[13px] leading-5 text-slate-800">
              {brief.changes.map((c) => <li key={c.label}><b>{c.label}:</b> <span className="text-slate-500">chat</span> &ldquo;{c.chat}&rdquo; <span className="text-slate-400">→</span> <span className="text-slate-500">form</span> &ldquo;{c.form}&rdquo;</li>)}
            </ul>
          ) : <p className="text-[13px] text-slate-600">Nothing: the patient submitted what the assistant had noted.</p>}
        </div>
      ) : null}

      {brief.checks.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-[13px] leading-5 text-amber-950">
          <p className="mb-1 flex items-center gap-1.5 font-bold"><TriangleAlert className="h-4 w-4" aria-hidden="true" /> Check these answers</p>
          <ul className="list-disc pl-5">{brief.checks.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      ) : null}

      {/* gaps become questions */}
      <div className="rounded-xl border border-slate-200 p-3.5">
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Worth asking at the first visit</p>
        {brief.asks.length ? (
          <ul className="space-y-1.5 text-[13px] leading-5 text-slate-800">
            {brief.asks.map((a) => <li key={a.id}>{a.text} <span className="text-slate-500">({a.because})</span></li>)}
          </ul>
        ) : <p className="text-[13px] text-slate-600">The history is complete and nothing stands out to ask beyond your usual assessment.</p>}
      </div>

      <details className="rounded-xl border border-slate-200 px-3.5 py-2.5">
        <summary className="cursor-pointer text-[13px] font-bold text-navy-800">All answers, side by side</summary>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {brief.facts.map((f) => <div key={f.label}><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{f.label}</dt><dd className="text-[13.5px] leading-5 text-slate-800">{f.value}</dd></div>)}
        </dl>
      </details>

      <p className="text-[11.5px] leading-5 text-slate-500">{brief.footer}</p>
    </div>
  );
}
