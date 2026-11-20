"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { setAiAssistAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { AiAssist } from "@/lib/rehabverse/api-types";

const STATE: Record<AiAssist, { text: string; chip: string }> = {
  off: { text: "Off", chip: "rv-chip" },
  on: { text: "On", chip: "rv-chip rv-chip-teal" },
};

/** The admin's switch: does this patient get AI assistance? Only the admin can change it. Patients never see a control, so allocation stays in your hands (research design). */
export function AiAssistSwitch({ patientId, value }: { patientId: string; value: AiAssist }) {
  const router = useRouter();
  const [current, setCurrent] = useState<AiAssist>(value);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const decide = (enabled: boolean) =>
    start(async () => {
      setError(null);
      const result = await setAiAssistAction(patientId, enabled);
      if (!result.ok) return setError(result.error === "pilot_limit" ? "Pilot limit reached: AI is already on for as many patients as the pilot allows. Raise the limit on the AI pilot page (or turn AI off for another patient first)." : "Could not change the switch. Please try again.");
      setCurrent(result.ai_assist);
      router.refresh();
    });

  return (
    <section className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5" aria-label="AI assistance for this patient" data-pna-ai-switch="v1">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-teal-700" aria-hidden="true" />
        <b className="text-[13.5px] text-navy-800">AI assistance</b>
        <span className={STATE[current].chip}>{STATE[current].text}</span>
        <span className="ml-auto flex flex-wrap gap-1.5">
          {current !== "on" ? (
            <button type="button" role="switch" aria-checked="false" disabled={pending} onClick={() => decide(true)} className="rv-btn rv-btn-primary">Turn AI on</button>
          ) : (
            <button type="button" role="switch" aria-checked="true" disabled={pending} onClick={() => decide(false)} className="rv-btn rv-btn-ghost">Turn AI off</button>
          )}
        </span>
      </div>
      <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
        Only you can change this: the patient has no control over it. When it is off, this patient sees no AI feature at all and RehabVerse works as usual. When it is on, the patient can talk with the AI assistant when filling in the assessment, and the conversation is saved for you below. Every change is recorded in the audit trail.
      </p>
      <p className="mt-1.5 text-[12px] text-slate-500">
        Check the assistant yourself first: <a href="/api/rehabverse/ai/selftest" target="_blank" rel="noopener noreferrer" className="font-bold text-teal-700 underline">run the AI self-test</a> (admin only, about a minute). <a href="/admin/rehabverse/ai-pilot" className="font-bold text-teal-700 underline">AI pilot, review pack and sign-off</a>.
      </p>
      {error ? <p className="mt-1 text-[12.5px] font-bold text-rose-700" role="alert">{error}</p> : null}
    </section>
  );
}
