"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Camera } from "lucide-react";
import { saveFormCheckSetAction } from "@/app/rehabverse/formcheck-actions";
import { T } from "../useLang";
import type { FinishedSet } from "./FormCheckPanel";

/**
 * The button under the exercise player and, once pressed, the camera panel. The panel, the engine, the specs and the pose model are all loaded only now (never with the
 * page). The finished set's numbers are saved on the server, which checks the patient's AI switch again; a failed save never disturbs the exercise.
 */
const FormCheckPanel = dynamic(() => import("./FormCheckPanel").then((m) => m.FormCheckPanel), { ssr: false, loading: () => <div className="rv-glass h-40 animate-pulse" aria-hidden="true" /> });

export function FormCheckSlot({ exerciseId, side, reps, holdSeconds }: { exerciseId: string; side?: "left" | "right"; reps?: number; holdSeconds?: number }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved" | "failed">("idle");

  const onFinished = async (set: FinishedSet) => {
    const { summary } = set;
    const result = await saveFormCheckSetAction({
      specId: set.specId, pass: set.pass, side: set.side,
      summary: { durationMs: summary.durationMs, reps: summary.reps, partial: summary.partial, bestHoldMs: summary.bestHoldMs, coverage: summary.coverage, cues: summary.cues, peak: summary.peak, refusals: summary.refusals as Record<string, number> },
      software: set.software,
    }).catch(() => ({ ok: false as const }));
    setSaved(result.ok ? "saved" : "failed");
  };

  if (!open) {
    return (
      <div className="rv-glass flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Camera className="h-5 w-5" aria-hidden="true" /></span>
        <p className="min-w-0 flex-1 text-[13.5px] leading-5 text-slate-700"><b className="text-navy-800"><T en="Camera form check" ru="Camera se form check" /></b><br /><T en="Optional. Your phone's camera counts your repetitions and gives short tips. Nothing is recorded or sent." ru="Marzi ki baat hai. Aap ke phone ka camera repetitions ginta hai aur chhote mashware deta hai. Kuch record ya send nahi hota." /></p>
        <button type="button" className="rv-btn rv-btn-primary" onClick={() => { setSaved("idle"); setOpen(true); }} data-pna-formcheck-open><T en="Try it" ru="Aazmayein" /></button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <FormCheckPanel specId={exerciseId} side={side} targetReps={reps} targetHoldSeconds={holdSeconds} onFinished={onFinished} onClose={() => setOpen(false)} />
      {saved === "saved" ? <p className="px-1 text-[12.5px] text-slate-500" role="status"><T en="The numbers of this set were saved for your physiotherapist. No video or picture was kept." ru="Is set ke numbers aap ke physiotherapist ke liye save ho gaye. Koi video ya tasveer nahi rakhi gayi." /></p> : null}
      {saved === "failed" ? <p className="px-1 text-[12.5px] text-slate-500" role="status"><T en="The numbers could not be saved this time. Your exercise is not affected." ru="Is baar numbers save nahi ho sake. Aap ki exercise par koi asar nahi." /></p> : null}
    </div>
  );
}
