"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Camera, ChevronRight, ShieldCheck } from "lucide-react";
import { saveFormCheckSetAction } from "@/app/rehabverse/formcheck-actions";
import { unlockRecorded } from "@/lib/speech/recorded";
import { T } from "../useLang";
import type { FinishedSet } from "./FormCheckPanel";
import "./camera-studio.css";

/**
 * The big glowing button under the exercise player and, once pressed, the full-screen camera studio. The studio, the engine, the specs and the pose model are all loaded only now
 * (never with the page). The finished set's numbers are saved on the server, which checks the patient's AI switch again; a failed save never disturbs the exercise.
 */
const FormCheckPanel = dynamic(() => import("./FormCheckPanel").then((m) => m.FormCheckPanel), { ssr: false, loading: () => <div className="fc-studio" aria-hidden="true"><div className="fc-loading"><span className="fc-spin" /></div></div> });

export function FormCheckSlot({ exerciseId, side, reps, holdSeconds, name }: { exerciseId: string; side?: "left" | "right"; reps?: number; holdSeconds?: number; name?: { en: string; ru: string } }) {
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

  return (
    <div className="fc-entry">
      <button type="button" className="fc-hero" onClick={() => { unlockRecorded(); setSaved("idle"); setOpen(true); }} data-pna-formcheck-open>
        <span className="fc-orb"><Camera aria-hidden="true" /></span>
        <span className="fc-hero-text">
          <b><T en="Check with the camera" ru="Camera se check karein" /></b>
          <small><T en="Your phone counts for you and tells you if you are doing it right." ru="Aap ka phone ginti karega aur batayega ke aap sahi kar rahe hain." /></small>
        </span>
        <span className="fc-hero-go"><ChevronRight aria-hidden="true" /></span>
      </button>
      <p className="fc-privacy"><ShieldCheck aria-hidden="true" /> <T en="No video or picture is kept." ru="Koi video ya tasveer save nahi hoti." /></p>
      {saved === "saved" ? <p className="fc-privacy" role="status"><T en="Your numbers were saved for your physiotherapist." ru="Aap ke numbers aap ke physiotherapist ke liye save ho gaye." /></p> : null}
      {saved === "failed" ? <p className="fc-privacy" role="status"><T en="The numbers could not be saved this time. Your exercise is not affected." ru="Is baar numbers save nahi ho sake. Aap ki exercise par koi asar nahi." /></p> : null}
      {open ? <FormCheckPanel specId={exerciseId} side={side} targetReps={reps} targetHoldSeconds={holdSeconds} exerciseName={name} onFinished={onFinished} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
