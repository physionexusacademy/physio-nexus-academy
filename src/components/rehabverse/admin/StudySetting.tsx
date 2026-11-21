"use client";

import { useState, useTransition } from "react";
import { FlaskConical } from "lucide-react";
import { setScreeningVisibilityAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { ScreeningVisibility } from "@/lib/rehabverse/api-types";

const OPTIONS: { id: ScreeningVisibility; title: string; body: string }[] = [
  { id: "immediate", title: "Straight after the form is sent", body: "The patient sees what their answers point to as soon as they send the assessment (never when a safety warning was ticked)." },
  { id: "after_review", title: "After I have reviewed it", body: "The patient sees it only once you have reviewed the assessment." },
];

/**
 * Study setting: when a patient is shown the symptom screening. Each participant is recorded in the arm that was in force when they sent the
 * assessment, so changing this never rewrites an earlier participant's record. The change itself is in the audit log.
 */
export function StudySetting({ value }: { value: ScreeningVisibility }) {
  const [current, setCurrent] = useState<ScreeningVisibility>(value);
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const choose = (next: ScreeningVisibility) => {
    if (next === current) return;
    start(async () => {
      const r = await setScreeningVisibilityAction(next);
      if (r.ok) { setCurrent(r.value); setNote("Saved. New participants are recorded in this arm; earlier participants keep theirs."); } else setNote("Could not save the setting.");
    });
  };
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="study-setting">
      <h2 id="study-setting" className="flex items-center gap-2 font-heading text-base font-bold text-navy-800"><FlaskConical className="h-4 w-4 text-teal-600" aria-hidden="true" /> Study setting: when patients see their screening</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="When patients see their screening">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={current === o.id} disabled={pending} onClick={() => choose(o.id)}
            className={"rv-card text-left " + (current === o.id ? "rv-card-on" : "")}>
            <span className="block text-[14px] font-bold text-navy-800">{o.title}</span>
            <span className="mt-0.5 block text-[12.5px] leading-5 text-slate-600">{o.body}</span>
          </button>
        ))}
      </div>
      {note ? <p className="mt-2 text-[12.5px] font-semibold text-slate-600" role="status">{note}</p> : null}
    </section>
  );
}
