"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { setAiAssistAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { AiAssist } from "@/lib/rehabverse/api-types";

const STATE: Record<AiAssist, { text: string; chip: string }> = {
  off: { text: "Off", chip: "rv-chip" },
  requested: { text: "Patient asked for it. Your decision.", chip: "rv-chip rv-chip-amber" },
  on: { text: "On", chip: "rv-chip rv-chip-teal" },
};

/** The admin's switch: does this patient get AI assistance? Only an admin can turn it on; the patient can ask for it or withdraw. */
export function AiAssistSwitch({ patientId, value }: { patientId: string; value: AiAssist }) {
  const router = useRouter();
  const [current, setCurrent] = useState<AiAssist>(value);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const decide = (enabled: boolean) =>
    start(async () => {
      setError(null);
      const result = await setAiAssistAction(patientId, enabled);
      if (!result.ok) return setError("Could not change the switch. Please try again.");
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
          {current === "requested" ? <button type="button" disabled={pending} onClick={() => decide(false)} className="rv-btn rv-btn-ghost">Decline</button> : null}
        </span>
      </div>
      <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
        Only you can turn this on. When it is off, this patient sees no AI feature at all and RehabVerse works as usual. The patient can withdraw at any time, and every change is recorded in the audit trail.
      </p>
      {error ? <p className="mt-1 text-[12.5px] font-bold text-rose-700" role="alert">{error}</p> : null}
    </section>
  );
}
