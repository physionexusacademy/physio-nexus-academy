"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, EyeOff, Gauge, Ghost, RotateCcw, Square, Video } from "lucide-react";
import { CAMERA_NOTE, GENERAL_LIMITS, STOP_IF_PAINFUL, healthTip, specFor, type CameraSpec, type Side } from "@/lib/formcheck";
import type { SoftwareRecord } from "@/lib/formcheck/version";
import type { SessionSummary } from "@/lib/formcheck";
import { PhoneLevel, type Tilt } from "@/lib/formcheck/browser/level";
import { speakText } from "@/lib/speech/voices";
import { useVoice } from "@/lib/speech/preference";
import { T, useRvLang } from "../useLang";
import { AlignmentOverlay } from "./AlignmentOverlay";
import { useFormCheck, type FormCheckProblem } from "./useFormCheck";

/**
 * The patient's camera form check for one exercise: set-up, the person's own neutral position, a live view with the skeleton, a gauge, a repetition counter or hold timer and
 * short cues, then a summary. Everything is processed on this device; nothing is recorded or sent (only the numbers of the finished set can be saved by `onFinished`).
 * The page that shows it decides whether it may be shown at all (the admin's AI switch for this patient is checked on the server).
 */
export type FinishedSet = { summary: SessionSummary; software: SoftwareRecord | null; side: Side | null; pass: 1 | 2; specId: string };

const PROBLEMS: Record<FormCheckProblem, { en: string; ru: string }> = {
  denied: { en: "The camera is blocked. Allow the camera for this site in your browser settings, then try again.", ru: "Camera blocked hai. Browser ki settings mein is site ke liye camera allow karein, phir dobara koshish karein." },
  none: { en: "No camera was found on this device.", ru: "Is device par koi camera nahi mila." },
  busy: { en: "The camera is being used by another app. Close it and try again.", ru: "Camera kisi doosri app mein istemal ho raha hai. Usay band karein aur dobara koshish karein." },
  insecure: { en: "The camera needs a secure (https) page.", ru: "Camera ke liye secure (https) page chahiye." },
  in_app: { en: "This app's built-in browser blocks the camera. Open this page in Chrome or Safari.", ru: "Is app ka apna browser camera rokta hai. Yeh page Chrome ya Safari mein kholein." },
  unsupported: { en: "This browser cannot open the camera.", ru: "Yeh browser camera nahi khol sakta." },
  failed: { en: "The camera could not start.", ru: "Camera shuru nahi ho saka." },
  model: { en: "The camera check could not load on this device. You can do your exercise as usual.", ru: "Camera check is device par load nahi ho saka. Aap apni exercise aam tareeqe se kar sakte hain." },
};

export function FormCheckPanel({ specId, side: initialSide, targetReps, targetHoldSeconds, onFinished, onClose }: {
  specId: string; side?: Side; targetReps?: number; targetHoldSeconds?: number; onFinished?: (set: FinishedSet) => void; onClose?: () => void;
}) {
  const spec = specFor(specId);
  if (!spec) return null;
  return <Panel spec={spec} side={initialSide} targetReps={targetReps} targetHoldSeconds={targetHoldSeconds} onFinished={onFinished} onClose={onClose} />;
}

/** The phone-level reading, started from the tap on "Start camera" (an iPhone asks for the motion sensor only then) and stopped with the camera. */
function usePhoneLevel() {
  const level = useRef<PhoneLevel | null>(null);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const start = useCallback(() => { level.current ??= new PhoneLevel(); void level.current.start(setTilt); }, []);
  const stop = useCallback(() => { level.current?.stop(); setTilt(null); }, []);
  useEffect(() => () => level.current?.stop(), []);
  return { tilt, start, stop };
}

function Panel({ spec, side: initialSide, targetReps, targetHoldSeconds, onFinished, onClose }: {
  spec: CameraSpec; side?: Side; targetReps?: number; targetHoldSeconds?: number; onFinished?: (set: FinishedSet) => void; onClose?: () => void;
}) {
  const [lang] = useRvLang();
  const [side, setSide] = useState<Side | undefined>(initialSide);
  const [pass, setPass] = useState<1 | 2>(1);
  const [simple, setSimple] = useState(false);
  const [showGhost, setShowGhost] = useState(true);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const fc = useFormCheck(spec, { tested: side, pass, simple, facing, ghost: showGhost });
  const phone = usePhoneLevel();
  const { voice, speaking } = useVoice();
  const placement = pass === 2 && spec.second ? spec.second.placement : spec.placement;
  const needSide = spec.sided && !side;
  const state = fc.state;
  const live = fc.status === "live";

  // speak a cue once when it appears (only when it has a recording; a cue is always on screen as text as well)
  const spoken = useRef<string>("");
  useEffect(() => {
    const cue = state?.cue;
    if (!cue || !voice || !speaking || spoken.current === cue.id + cue.t) return;
    spoken.current = cue.id + cue.t;
    void speakText(cue.text[lang], lang === "ru" ? "ur" : "en");
  }, [state?.cue, voice, speaking, lang]);

  // finish by itself when the prescribed repetitions or hold are done
  const finishing = useRef(false);
  useEffect(() => {
    if (!live || !state || finishing.current || pass !== 1) return;
    const done = (spec.primary.mode === "reps" && targetReps && state.reps >= targetReps) || (spec.primary.mode !== "reps" && targetHoldSeconds && state.holdMs >= targetHoldSeconds * 1000);
    if (!done) return;
    finishing.current = true;
    const timer = setTimeout(() => fc.stop(), 1500);
    return () => clearTimeout(timer);
  }, [live, state, spec.primary.mode, targetReps, targetHoldSeconds, pass, fc]);

  // hand the finished set to the page once
  const reported = useRef<SessionSummary | null>(null);
  useEffect(() => {
    if (fc.status !== "finished" || !fc.summary || reported.current === fc.summary) return;
    reported.current = fc.summary;
    onFinished?.({ summary: fc.summary, software: fc.software, side: side ?? null, pass, specId: spec.id });
  }, [fc.status, fc.summary, fc.software, onFinished, pass, side, spec.id]);

  const again = (nextPass: 1 | 2) => { finishing.current = false; reported.current = null; setPass(nextPass); phone.start(); setTimeout(() => void fc.start(), 0); };
  const gaugePct = Math.round(Math.max(0, Math.min(1, state?.progress ?? 0)) * 100);
  const isReps = spec.primary.mode === "reps";
  const seconds = (ms: number) => (ms / 1000).toFixed(0);

  return (
    <section className="rv-glass p-4" aria-label={lang === "ru" ? "Camera form check" : "Camera form check"} data-pna-formcheck={spec.id}>
      <div className="flex flex-wrap items-center gap-2">
        <Camera className="h-5 w-5 text-teal-700" aria-hidden="true" />
        <h3 className="font-heading text-base font-bold text-navy-800"><T en="Camera form check" ru="Camera se form check" /></h3>
        <span className="rv-chip">{spec.tier === "A" ? <T en="Sitting or standing" ru="Baithe ya khare" /> : <T en="Lying or on the floor" ru="Lete ya zameen par" />}</span>
        {onClose ? <button type="button" onClick={() => { fc.status === "live" && fc.stop(); phone.stop(); onClose(); }} className="rv-btn rv-btn-ghost ml-auto !min-h-0 !px-3 !py-1.5 text-[13px]"><T en="Close" ru="Band karein" /></button> : null}
      </div>

      {fc.status === "idle" || fc.status === "error" ? (
        <div className="mt-3 space-y-3">
          <p className="text-[14px] leading-6 text-slate-700">{placement.how[lang]}</p>
          {pass === 2 && spec.second ? <p className="rounded-xl bg-teal-50 px-3 py-2 text-[13.5px] leading-6 text-teal-950">{spec.second.why[lang]}</p> : null}
          {spec.sided ? (
            <fieldset>
              <legend className="rv-label"><T en="Which side are you exercising?" ru="Aap kis taraf ki exercise kar rahe hain?" /></legend>
              <div className="mt-1 flex gap-2" role="radiogroup">
                {(["left", "right"] as Side[]).map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={side === s} onClick={() => setSide(s)} className={"rv-btn " + (side === s ? "rv-btn-primary" : "rv-btn-ghost")}>{s === "left" ? <T en="Left" ru="Left (ulta)" /> : <T en="Right" ru="Right (seedha)" />}</button>
                ))}
              </div>
            </fieldset>
          ) : null}
          {spec.needFace ? <p className="text-[13px] text-slate-600"><T en="This exercise also reads the position of your head, so your face should be in view." ru="Yeh exercise aap ke sar ki position bhi dekhti hai, isliye chehra nazar aana chahiye." /></p> : null}
          <p className="text-[13px] text-slate-600">{CAMERA_NOTE[lang]}</p>
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13.5px] leading-5 text-amber-950"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span>{STOP_IF_PAINFUL[lang]}</span></p>
          {fc.status === "error" && fc.problem ? <p className="rv-error" role="alert">{PROBLEMS[fc.problem][lang]}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="rv-btn rv-btn-primary" disabled={needSide} onClick={() => { finishing.current = false; phone.start(); void fc.start(); }} data-pna-formcheck-start>
              <Video className="h-4 w-4" aria-hidden="true" /> {fc.status === "error" ? <T en="Try again" ru="Dobara koshish karein" /> : <T en="Start camera" ru="Camera shuru karein" />}
            </button>
            <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setFacing(facing === "user" ? "environment" : "user")}>{facing === "user" ? <T en="Use the back camera" ru="Peeche wala camera" /> : <T en="Use the front camera" ru="Samne wala camera" />}</button>
          </div>
        </div>
      ) : null}

      {/* the video element stays mounted so the camera can start from the button above */}
      <div className={"mt-3 " + (live || fc.status === "loading" ? "" : "hidden")}>
        {fc.status === "loading" ? <p className="mb-2 text-[13.5px] font-semibold text-slate-600" role="status"><T en="Getting the camera ready…" ru="Camera tayyar ho raha hai…" /></p> : null}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900" style={{ aspectRatio: placement.orientation === "portrait" ? "3 / 4" : "16 / 9", maxHeight: "70vh" }}>
          <video ref={fc.videoRef} playsInline muted className={"absolute inset-0 h-full w-full object-contain " + (simple ? "invisible" : "") + (facing === "user" ? " -scale-x-100" : "")} aria-label="" />
          <canvas ref={fc.canvasRef} className="absolute inset-0 h-full w-full object-contain" aria-hidden="true" />
          {state ? <AlignmentOverlay state={state} tilt={phone.tilt} /> : null}
          <div className="absolute inset-x-2 bottom-2 grid gap-2">
            {state?.hint ? <p className="fc-hint" data-tone={state.phase === "calibrating" || state.hint === null ? "ok" : undefined} role="status" aria-live="polite">{state.hint[lang]}</p> : null}
            {state?.cue ? <p className="fc-cue" role="alert" data-pna-formcheck-cue>{state.cue.text[lang]}</p> : null}
          </div>
        </div>

        {live && state ? (
          <div className="mt-3 space-y-2">
            {state.phase === "calibrating" ? <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true"><div className="h-full bg-teal-500 transition-[width]" style={{ width: `${Math.round(state.calibration * 100)}%` }} /></div> : null}
            {state.phase === "active" ? (
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={lang === "ru" ? "Harkat ka gauge" : "Movement gauge"}><div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-[width] duration-100" style={{ width: `${gaugePct}%` }} /></div>
                  <p className="mt-1 text-[12px] text-slate-500">{state.tracking ? <T en="Following your movement" ru="Aap ki harkat dekh raha hai" /> : <T en="Cannot see you well right now" ru="Abhi aap theek nazar nahi aa rahe" />}</p>
                </div>
                <div className="text-right" aria-live="off">
                  {isReps ? (
                    <b className="font-heading text-3xl text-navy-800" data-pna-formcheck-reps>{state.reps}{targetReps ? <span className="text-lg text-slate-400"> / {targetReps}</span> : null}</b>
                  ) : (
                    <b className="font-heading text-3xl text-navy-800" data-pna-formcheck-hold>{seconds(state.holdMs)}<span className="text-lg text-slate-400"> s{targetHoldSeconds ? ` / ${targetHoldSeconds}` : ""}</span></b>
                  )}
                  <span className="block text-[11.5px] font-semibold text-slate-500">{isReps ? <T en="repetitions" ru="repetitions" /> : <T en="time held" ru="waqt" />}{isReps && state.partial ? <> · {state.partial} <T en="shallower than the target" ru="target se kam range" /></> : null}</span>
                </div>
              </div>
            ) : null}
            {state.primary?.shown ? <p className="text-[13px] text-slate-600">{Math.round(state.primary.value)}°</p> : null}
            {fc.health && state.phase === "active" && healthTip(fc.health) ? <p className="flex items-start gap-2 rounded-xl bg-sky-50 px-3 py-2 text-[13px] leading-5 text-sky-950" role="status" data-pna-formcheck-speed={fc.health.level}><Gauge className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span>{healthTip(fc.health)![lang]}</span></p> : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rv-btn rv-btn-primary" onClick={() => { fc.stop(); phone.stop(); }} data-pna-formcheck-stop><Square className="h-4 w-4" aria-hidden="true" /> <T en="Finish" ru="Khatam" /></button>
              <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setSimple(!simple)} aria-pressed={simple}><EyeOff className="h-4 w-4" aria-hidden="true" /> <T en="Simple view" ru="Saada view" /></button>
              <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setShowGhost(!showGhost)} aria-pressed={showGhost} data-pna-formcheck-ghost-toggle><Ghost className="h-4 w-4" aria-hidden="true" /> {showGhost ? <T en="Hide the target" ru="Target chhupayein" /> : <T en="Show the target" ru="Target dikhayein" />}</button>
              <button type="button" className="rv-btn rv-btn-ghost" onClick={() => fc.recalibrate()}><RotateCcw className="h-4 w-4" aria-hidden="true" /> <T en="Start position again" ru="Shuruati position dobara" /></button>
            </div>
            <p className="text-[12.5px] text-slate-500">{STOP_IF_PAINFUL[lang]}</p>
          </div>
        ) : null}
      </div>

      {fc.status === "finished" && fc.summary ? (
        <div className="mt-3 space-y-3 rv-fade-up" role="status">
          <p className="flex items-center gap-2 font-bold text-teal-900"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> <T en="Set finished" ru="Set mukammal" /></p>
          <ul className="grid grid-cols-2 gap-2 text-[13.5px] sm:grid-cols-4">
            {pass === 1 ? (isReps
              ? <><li className="rv-card"><b className="block text-xl">{fc.summary.reps}</b><T en="repetitions counted" ru="repetitions gini gayin" /></li><li className="rv-card"><b className="block text-xl">{fc.summary.partial}</b><T en="of them shallower than the target range" ru="in mein se target se kam range ki" /></li></>
              : <li className="rv-card"><b className="block text-xl">{seconds(fc.summary.bestHoldMs)} s</b><T en="longest hold" ru="sab se lamba hold" /></li>) : null}
            <li className="rv-card"><b className="block text-xl">{Math.round(fc.summary.coverage.fraction * 100)}%</b><T en="of the time I could see you" ru="waqt jab aap nazar aa rahe the" /></li>
            {Object.keys(fc.summary.cues).length ? <li className="rv-card"><b className="block text-xl">{Object.values(fc.summary.cues).reduce((a, b) => a + b, 0)}</b><T en="tips given" ru="mashware diye gaye" /></li> : null}
          </ul>
          <p className="text-[13.5px] leading-6 text-slate-700"><b><T en="What the camera could not see: " ru="Camera kya nahi dekh saka: " /></b>{fc.summary.limits[lang]}</p>
          <p className="text-[13px] leading-5 text-slate-600">{GENERAL_LIMITS[lang]}</p>
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13.5px] leading-5 text-amber-950"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span>{STOP_IF_PAINFUL[lang]}</span></p>
          <div className="flex flex-wrap gap-2">
            {pass === 1 && spec.second ? <button type="button" className="rv-btn rv-btn-primary" onClick={() => again(2)}><T en="Short second check" ru="Chhota doosra check" /></button> : null}
            <button type="button" className={"rv-btn " + (pass === 1 && spec.second ? "rv-btn-ghost" : "rv-btn-primary")} onClick={() => again(1)}><T en="Do it again" ru="Dobara karein" /></button>
            {onClose ? <button type="button" className="rv-btn rv-btn-ghost" onClick={onClose}><T en="Close" ru="Band karein" /></button> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
