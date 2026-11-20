"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { signoffAiAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { AiSignoffDecision } from "@/lib/rehabverse/api-types";

const DECISIONS: { id: AiSignoffDecision; label: string; help: string }[] = [
  { id: "approved", label: "Approved", help: "I have read the pack. It may be used with patients, and (if you choose) opened to all." },
  { id: "approved_with_changes", label: "Approved with changes", help: "It may be used in the pilot, but the changes in my notes are needed before opening it to all." },
  { id: "not_approved", label: "Not approved", help: "It must not be used with patients until the problems in my notes are fixed." },
];

/** Records the physiotherapist's review of this exact version of the pack. Sign-offs are kept for good and cannot be edited. */
export function SignoffForm({ version }: { version: string }) {
  const router = useRouter();
  const [reviewer, setReviewer] = useState("");
  const [decision, setDecision] = useState<AiSignoffDecision>("approved");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = () =>
    start(async () => {
      setMessage(null);
      if (reviewer.trim().length < 2) return setMessage({ ok: false, text: "Please write your name." });
      const result = await signoffAiAction({ reviewer, decision, notes, seenVersion: version });
      if (!result.ok) return setMessage({ ok: false, text: result.error === "pack_changed" ? "The pack changed while this page was open. Reload the page and read it again before signing off." : "Could not record the sign-off. Please try again." });
      setMessage({ ok: true, text: `Recorded for version ${result.version}.` });
      setNotes("");
      router.refresh();
    });

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-ai-signoff-form>
      <h2 className="font-heading text-base font-bold text-navy-800">Sign-off for version <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">{version}</code></h2>
      <label className="block text-[13px] font-bold text-navy-800">Your name
        <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} maxLength={100} className="rv-input mt-1" aria-label="Reviewer name" disabled={pending} />
      </label>
      <fieldset className="space-y-1.5">
        <legend className="text-[13px] font-bold text-navy-800">Decision</legend>
        {DECISIONS.map((d) => (
          <label key={d.id} className={"flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-[13px] " + (decision === d.id ? "border-teal-400 bg-teal-50" : "border-slate-200")}>
            <input type="radio" name="decision" checked={decision === d.id} onChange={() => setDecision(d.id)} className="mt-1" disabled={pending} />
            <span><b className="text-navy-800">{d.label}</b><span className="block text-slate-600">{d.help}</span></span>
          </label>
        ))}
      </fieldset>
      <label className="block text-[13px] font-bold text-navy-800">Notes (what to change, what worried you)
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={3000} className="rv-input mt-1" aria-label="Notes" disabled={pending} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="rv-btn rv-btn-primary" disabled={pending} onClick={submit}>Record sign-off</button>
        <button type="button" className="rv-btn rv-btn-ghost" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden="true" /> Print or save as PDF</button>
      </div>
      {message ? <p className={"text-[13px] font-bold " + (message.ok ? "text-teal-800" : "text-rose-700")} role={message.ok ? "status" : "alert"}>{message.text}</p> : null}
    </div>
  );
}
