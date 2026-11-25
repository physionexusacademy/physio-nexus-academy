"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, BellRing, Camera, CheckCircle2, Eye, EyeOff, Gauge, Ghost, RotateCcw, Settings2, SwitchCamera, Square, Video, Volume2, VolumeX, X } from "lucide-react";
import { CAMERA_NOTE, GENERAL_LIMITS, STOP_IF_PAINFUL, healthTip, specFor, type CameraSpec, type Side } from "@/lib/formcheck";
import type { SoftwareRecord } from "@/lib/formcheck/version";
import type { SessionSummary } from "@/lib/formcheck";
import { PhoneLevel, type Tilt } from "@/lib/formcheck/browser/level";
import { reloadIfPolicyBlocksCamera } from "@/lib/formcheck/browser/policy-reload";
import { cameraPermission, policyAllowsCamera, watchCameraPermission, type CameraPermission } from "@/lib/formcheck/browser/permission";
import { useVoice } from "@/lib/speech/preference";
import { T, useRvLang } from "../useLang";
import { AlignmentOverlay } from "./AlignmentOverlay";
import { CameraPermissionGuide } from "./CameraPermissionGuide";
import { PlacementArt } from "./PlacementArt";
import { holdLine, repLine, START_LINE } from "@/lib/formcheck/spoken";
import { useSay } from "./useSay";
import { useFormCheck, type FormCheckProblem } from "./useFormCheck";
import "./camera-studio.css";

/**
 * The patient's camera form check for one exercise, as a full-screen "studio" that sits above every floating button: set-up (a picture of where the phone goes, the side, one big
 * start button), the person's own neutral position, a live view with the skeleton, a giant repetition counter or hold timer, short cues and spoken counting, then a happy
 * summary. Everything is processed on this device; nothing is recorded or sent (only the numbers of the finished set can be saved by `onFinished`).
 * The page that shows it decides whether it may be shown at all (the admin's AI switch for this patient is checked on the server).
 */
export type FinishedSet = { summary: SessionSummary; software: SoftwareRecord | null; side: Side | null; pass: 1 | 2; specId: string };

const PROBLEMS: Record<FormCheckProblem, { en: string; ru: string }> = {
  denied: { en: "The camera is blocked. Allow the camera for this site in your browser settings, then try again.", ru: "Camera blocked hai. Browser ki settings mein is site ke liye camera allow karein, phir dobara koshish karein." },
  policy: { en: "This page is not allowed to use the camera. Please tell the clinic so they can fix it.", ru: "Is page ko camera istemal karne ki ijazat nahi. Meharbani karke clinic ko batayein taake woh theek kar dein." },
  none: { en: "No camera was found on this device.", ru: "Is device par koi camera nahi mila." },
  busy: { en: "The camera is being used by another app. Close it and try again.", ru: "Camera kisi doosri app mein istemal ho raha hai. Usay band karein aur dobara koshish karein." },
  insecure: { en: "The camera needs a secure (https) page.", ru: "Camera ke liye secure (https) page chahiye." },
  in_app: { en: "This app's built-in browser blocks the camera. Open this page in Chrome or Safari.", ru: "Is app ka apna browser camera rokta hai. Yeh page Chrome ya Safari mein kholein." },
  unsupported: { en: "This browser cannot open the camera.", ru: "Yeh browser camera nahi khol sakta." },
  failed: { en: "The camera could not start.", ru: "Camera shuru nahi ho saka." },
  model: { en: "The camera check could not load on this device. You can do your exercise as usual.", ru: "Camera check is device par load nahi ho saka. Aap apni exercise aam tareeqe se kar sakte hain." },
};

export function FormCheckPanel({ specId, side: initialSide, targetReps, targetHoldSeconds, exerciseName, onFinished, onClose }: {
  specId: string; side?: Side; targetReps?: number; targetHoldSeconds?: number; exerciseName?: { en: string; ru: string }; onFinished?: (set: FinishedSet) => void; onClose?: () => void;
}) {
  const spec = specFor(specId);
  if (!spec) return null;
  return <Panel spec={spec} side={initialSide} targetReps={targetReps} targetHoldSeconds={targetHoldSeconds} exerciseName={exerciseName} onFinished={onFinished} onClose={onClose} />;
}

/** The phone-level reading, started from the tap on "Start" (an iPhone asks for the motion sensor only then) and stopped with the camera. */
function usePhoneLevel() {
  const level = useRef<PhoneLevel | null>(null);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const start = useCallback(() => { level.current ??= new PhoneLevel(); void level.current.start(setTilt); }, []);
  const stop = useCallback(() => { level.current?.stop(); setTilt(null); }, []);
  useEffect(() => () => level.current?.stop(), []);
  return { tilt, start, stop };
}

function Panel({ spec, side: initialSide, targetReps, targetHoldSeconds, exerciseName, onFinished, onClose }: {
  spec: CameraSpec; side?: Side; targetReps?: number; targetHoldSeconds?: number; exerciseName?: { en: string; ru: string }; onFinished?: (set: FinishedSet) => void; onClose?: () => void;
}) {
  const [lang] = useRvLang();
  const [side, setSide] = useState<Side | undefined>(initialSide);
  const [pass, setPass] = useState<1 | 2>(1);
  const [simple, setSimple] = useState(false);
  const [showGhost, setShowGhost] = useState(true);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [sheet, setSheet] = useState(false);
  const [perm, setPerm] = useState<CameraPermission>("unknown");
  const [checkedAgain, setCheckedAgain] = useState(false);
  const fc = useFormCheck(spec, { tested: side, pass, simple, facing, ghost: showGhost });
  const phone = usePhoneLevel();
  const { voice, setVoice, unlock } = useVoice();
  const { say, stop: stopSpeaking } = useSay(voice, lang);
  const placement = pass === 2 && spec.second ? spec.second.placement : spec.placement;
  const needSide = spec.sided && !side;
  const state = fc.state;
  const live = fc.status === "live";
  const showLive = fc.status === "loading" || live;
  const isReps = spec.primary.mode === "reps";
  const name = exerciseName?.[lang];

  // what the browser says about the camera: "prompt" (it will ask), "granted", or "denied" (blocked: only the browser settings can change that). Chrome tells the page when the person changes it.
  useEffect(() => {
    let off: (() => void) | undefined;
    void cameraPermission().then((state) => { setPerm(state); off = watchCameraPermission(setPerm); });
    return () => off?.();
  }, []);

  // lock the page behind the studio, close on Escape, and hand focus to the studio
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => { document.body.style.overflow = previous; };
  }, []);
  const close = useCallback(() => { stopSpeaking(); if (fc.status === "live") fc.stop(); phone.stop(); onClose?.(); }, [fc, phone, stopSpeaking, onClose]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (sheet) setSheet(false); else close(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, sheet]);

  // the set-up instruction is read aloud once when the studio opens (the voice switch is the site's one setting, on by default); "Listen" reads it again
  const intro = placement.how[lang] + (perm === "prompt" ? " " + (lang === "ru" ? "Shuru karne par aap ke phone par sawal aayega. Allow dabayein." : "When you press Start, your phone will ask about the camera. Press Allow.") : "");
  const introSpoken = useRef(false);
  useEffect(() => {
    if (introSpoken.current || fc.status !== "idle") return;
    introSpoken.current = true;
    say(intro, "now");
  }, [fc.status, intro, say]);

  // speak a cue once when it appears (a cue is always on screen as text as well)
  const spokenCue = useRef<string>("");
  useEffect(() => {
    const cue = state?.cue;
    if (!cue || spokenCue.current === cue.id + cue.t) return;
    spokenCue.current = cue.id + cue.t;
    say(cue.text[lang], "queue");
  }, [state?.cue, lang, say]);

  // count out loud: every repetition (never over a longer sentence), every 5 seconds of a hold, and a happy line when the set is done
  const lastReps = useRef(0);
  const lastHoldTick = useRef(0);
  const announcedStart = useRef(false);
  const announcedDone = useRef(false);
  useEffect(() => {
    if (!live || !state) return;
    if (state.phase === "active" && !announcedStart.current) { announcedStart.current = true; say(START_LINE[lang], "now"); }
    if (isReps && state.reps > lastReps.current) {
      lastReps.current = state.reps;
      const line = repLine(state.reps, targetReps, lang);
      if (line.done) { if (!announcedDone.current) { announcedDone.current = true; say(line.text, "now"); } } else say(line.text, "skip");
    }
    if (!isReps) {
      const tick = Math.floor(state.holdMs / 5000);
      if (tick > lastHoldTick.current) {
        lastHoldTick.current = tick;
        const line = holdLine(state.holdMs, targetHoldSeconds, lang);
        if (line?.done) { if (!announcedDone.current) { announcedDone.current = true; say(line.text, "now"); } } else if (line) say(line.text, "skip");
      }
    }
  }, [live, state, isReps, targetReps, targetHoldSeconds, lang, say]);

  // finish by itself when the prescribed repetitions or hold are done
  const finishing = useRef(false);
  useEffect(() => {
    if (!live || !state || finishing.current || pass !== 1) return;
    const done = (spec.primary.mode === "reps" && targetReps && state.reps >= targetReps) || (spec.primary.mode !== "reps" && targetHoldSeconds && state.holdMs >= targetHoldSeconds * 1000);
    if (!done) return;
    finishing.current = true;
    const timer = setTimeout(() => fc.stop(), 2200);
    return () => clearTimeout(timer);
  }, [live, state, spec.primary.mode, targetReps, targetHoldSeconds, pass, fc]);

  // hand the finished set to the page once
  const reported = useRef<SessionSummary | null>(null);
  useEffect(() => {
    if (fc.status !== "finished" || !fc.summary || reported.current === fc.summary) return;
    reported.current = fc.summary;
    onFinished?.({ summary: fc.summary, software: fc.software, side: side ?? null, pass, specId: spec.id });
  }, [fc.status, fc.summary, fc.software, onFinished, pass, side, spec.id]);

  const resetCounting = () => { finishing.current = false; lastReps.current = 0; lastHoldTick.current = 0; announcedStart.current = false; announcedDone.current = false; };
  const begin = () => { unlock(); resetCounting(); phone.start(); void fc.start(); };
  // Chrome tells us when the setting changes; where the browser cannot say (Safari) the last error decides
  const blocked = perm === "denied" || (fc.problem === "denied" && perm === "unknown");
  // "Check again" after the person changed the setting: read the state and start straight away unless it is still blocked (then try once anyway, in case the browser's answer is out of date)
  const checkAgain = async () => {
    unlock();
    const state = await cameraPermission();
    setPerm(state);
    setCheckedAgain(true);
    if (needSide) return; // the side must be chosen first; the Start button is shown once the block is gone
    if (state !== "denied") begin();
    else if (policyAllowsCamera() !== false) { resetCounting(); void fc.start(); }
    else reloadIfPolicyBlocksCamera();
  };
  const again = (nextPass: 1 | 2) => { resetCounting(); reported.current = null; setPass(nextPass); phone.start(); setTimeout(() => void fc.start(), 0); };
  const seconds = (ms: number) => (ms / 1000).toFixed(0);
  const count = isReps ? state?.reps ?? 0 : Math.floor((state?.holdMs ?? 0) / 1000);
  const target = isReps ? targetReps : targetHoldSeconds;
  const lying = spec.tier !== "A";
  const tip = fc.health && state?.phase === "active" ? healthTip(fc.health) : null;
  const counted = fc.summary ? (isReps ? fc.summary.reps > 0 : fc.summary.bestHoldMs > 0) : false;
  const title = <T en="Camera check" ru="Camera check" />;

  return createPortal(
    <div ref={rootRef} tabIndex={-1} className="fc-studio" role="dialog" aria-modal="true" aria-label={lang === "ru" ? "Camera check" : "Camera check"} data-pna-formcheck={spec.id}>
      <div className="fc-bar">
        <h2>{title}{name ? <small>{name}</small> : null}</h2>
        <button type="button" className="fc-iconbtn" aria-pressed={voice} aria-label={voice ? (lang === "ru" ? "Awaaz band karein" : "Turn the voice off") : (lang === "ru" ? "Awaaz on karein" : "Turn the voice on")} onClick={() => { unlock(); setVoice(!voice); if (voice) stopSpeaking(); }} data-pna-formcheck-voice>
          {voice ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </button>
        <button type="button" className="fc-iconbtn" aria-label={lang === "ru" ? "Band karein" : "Close"} onClick={close} data-pna-formcheck-close><X aria-hidden="true" /></button>
      </div>

      {fc.status === "idle" || fc.status === "error" ? (
        <div className="fc-body" data-pna-formcheck-setup>
          {blocked ? <CameraPermissionGuide stillBlocked={checkedAgain && perm === "denied"} onCheck={() => void checkAgain()} onReload={() => window.location.reload()} onListen={(text) => { unlock(); say(text, "now"); }} /> : null}
          <div className="fc-art"><PlacementArt lying={lying} label={lang === "ru" ? "Phone ko 2 metre door rakhein, poora jism nazar aaye" : "Put the phone 2 metres away so your whole body is in view"} /></div>
          <p className="fc-lead">{placement.how[lang]}</p>
          <button type="button" className="fc-soft" onClick={() => { unlock(); say(intro, "now"); }} data-pna-formcheck-listen><Volume2 aria-hidden="true" /> <T en="Listen" ru="Suniye" /></button>
          {pass === 2 && spec.second ? <p className="fc-note">{spec.second.why[lang]}</p> : null}
          {spec.needFace ? <p className="fc-note"><T en="Your face should be in view too." ru="Aap ka chehra bhi nazar aana chahiye." /></p> : null}
          {spec.sided ? (
            <fieldset>
              <legend className="fc-lead" style={{ marginBottom: 10 }}><T en="Which side are you exercising?" ru="Aap kis taraf ki exercise kar rahe hain?" /></legend>
              <div className="fc-side-grid" role="radiogroup">
                {(["left", "right"] as Side[]).map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={side === s} onClick={() => setSide(s)} className="fc-side">
                    {s === "left" ? <T en="Left" ru="Ulta (left)" /> : <T en="Right" ru="Seedha (right)" />}
                    <small>{s === "left" ? <T en="left side" ru="left taraf" /> : <T en="right side" ru="right taraf" />}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
          {fc.status === "error" && fc.problem && fc.problem !== "denied" ? <p className="fc-problem" role="alert">{PROBLEMS[fc.problem][lang]}</p> : null}
          {!blocked && perm !== "granted" && fc.problem !== "policy" ? (
            <p className="fc-prompt-note" data-pna-formcheck-prompt-note><BellRing aria-hidden="true" /> <span><T en="When you press Start, your phone will ask: “Allow the camera?” Press “Allow”." ru="Start dabane par aap ke phone par sawal aayega: “Camera allow karein?” Aap “Allow” dabayein." /></span></p>
          ) : null}
          {!blocked ? (
            <button type="button" className="fc-go" disabled={needSide} onClick={begin} data-pna-formcheck-start>
            <Video aria-hidden="true" /> {fc.status === "error" ? <T en="Try again" ru="Dobara koshish karein" /> : <T en="Start" ru="Shuru karein" />}
          </button>
          ) : null}
          {needSide && !blocked ? <p className="fc-note" role="status"><T en="Choose a side first." ru="Pehle taraf chunein." /></p> : null}
          <p className="fc-warn"><AlertTriangle aria-hidden="true" /> <span>{STOP_IF_PAINFUL[lang]}</span></p>
          <p className="fc-note">{CAMERA_NOTE[lang]}</p>
          <button type="button" className="fc-soft" onClick={() => setFacing(facing === "user" ? "environment" : "user")}><SwitchCamera aria-hidden="true" /> {facing === "user" ? <T en="Use the back camera" ru="Peeche wala camera" /> : <T en="Use the front camera" ru="Samne wala camera" />}</button>
        </div>
      ) : null}

      {/* the video element stays mounted so the camera can start from the button above */}
      <div className="fc-live" hidden={!showLive}>
        <div className="fc-video">
          <video ref={fc.videoRef} playsInline muted className={(simple ? "invisible " : "") + (facing === "user" ? "-scale-x-100" : "")} aria-label="" />
          <canvas ref={fc.canvasRef} aria-hidden="true" />
          {state ? <AlignmentOverlay state={state} tilt={phone.tilt} /> : null}
          {fc.status === "loading" ? <div className="fc-loading" role="status"><span className="fc-spin" /><T en="Getting the camera ready…" ru="Camera tayyar ho raha hai…" /></div> : null}
          <div className="fc-overlay-text">
            {state?.hint ? <p className="fc-hint" data-tone={state.phase === "calibrating" ? "ok" : undefined} role="status" aria-live="polite">{state.hint[lang]}</p> : null}
            {state?.cue ? <p className="fc-cue" role="alert" data-pna-formcheck-cue>{state.cue.text[lang]}</p> : null}
          </div>
        </div>
        {live && state ? (
          <div className="fc-dock">
            <div className="fc-dock-in">
              {state.phase === "calibrating" ? (
                <>
                  <p className="fc-state-line"><span className="fc-dot" /> <T en="Stand still for a moment…" ru="Zara der saakin rahein…" /></p>
                  <div className="fc-bar-track" aria-hidden="true"><div className="fc-bar-fill" style={{ width: `${Math.round(state.calibration * 100)}%` }} /></div>
                </>
              ) : (
                <>
                  <div className="fc-main">
                    <div className="fc-count" aria-live="off">
                      <b key={count} data-pop={count > 0} data-pna-formcheck-reps={isReps ? "" : undefined} data-pna-formcheck-hold={isReps ? undefined : ""}>{count}</b>
                      {target ? <span>/ {target}</span> : null}
                      <small>{isReps ? <T en="counted" ru="ginti" /> : <T en="seconds" ru="second" />}{isReps && state.partial ? <> · {state.partial} <T en="shallow" ru="kam range" /></> : null}</small>
                    </div>
                    <button type="button" className="fc-stop" onClick={() => { stopSpeaking(); fc.stop(); phone.stop(); }} data-pna-formcheck-stop>
                      <i><Square aria-hidden="true" /></i><T en="Finish" ru="Khatam" />
                    </button>
                  </div>
                  <p className="fc-state-line"><span className="fc-dot" data-bad={!state.tracking} /> {state.tracking ? <T en="I can see you" ru="Aap nazar aa rahe hain" /> : <T en="I cannot see you well" ru="Aap theek nazar nahi aa rahe" />}</p>
                </>
              )}
              {tip ? <p className="fc-tip" role="status" data-pna-formcheck-speed={fc.health?.level}><Gauge aria-hidden="true" /> <span>{tip[lang]}</span></p> : null}
              <div className="fc-row">
                <button type="button" className="fc-soft" aria-pressed={voice} onClick={() => { unlock(); setVoice(!voice); if (voice) stopSpeaking(); }}>{voice ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />} {voice ? <T en="Voice on" ru="Awaaz on" /> : <T en="Voice off" ru="Awaaz band" />}</button>
                <button type="button" className="fc-soft" onClick={() => setSheet(true)} data-pna-formcheck-more><Settings2 aria-hidden="true" /> <T en="More" ru="Aur" /></button>
              </div>
            </div>
          </div>
        ) : null}
        {sheet ? (
          <div className="fc-sheet-back" onClick={() => setSheet(false)}>
            <div className="fc-sheet" role="dialog" aria-label={lang === "ru" ? "Aur options" : "More options"} onClick={(e) => e.stopPropagation()}>
              <h3><T en="More options" ru="Aur options" /></h3>
              <button type="button" className="fc-soft" onClick={() => { fc.recalibrate(); resetCounting(); setSheet(false); }}><RotateCcw aria-hidden="true" /> <T en="Start position again" ru="Shuruati position dobara" /></button>
              <button type="button" className="fc-soft" onClick={() => setShowGhost(!showGhost)} aria-pressed={showGhost} data-pna-formcheck-ghost-toggle><Ghost aria-hidden="true" /> {showGhost ? <T en="Hide the target pose" ru="Target pose chhupayein" /> : <T en="Show the target pose" ru="Target pose dikhayein" />}</button>
              <button type="button" className="fc-soft" onClick={() => setSimple(!simple)} aria-pressed={simple}>{simple ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />} {simple ? <T en="Show the camera picture" ru="Camera ki tasveer dikhayein" /> : <T en="Hide the camera picture" ru="Camera ki tasveer chhupayein" />}</button>
              <p className="fc-warn"><AlertTriangle aria-hidden="true" /> <span>{STOP_IF_PAINFUL[lang]}</span></p>
              <button type="button" className="fc-go" onClick={() => setSheet(false)}><T en="Back to the exercise" ru="Wapas exercise par" /></button>
            </div>
          </div>
        ) : null}
      </div>

      {fc.status === "finished" && fc.summary ? (
        <div className="fc-body fc-done" role="status" data-pna-formcheck-finished>
          <div className="fc-tick" data-none={!counted}>{counted ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}</div>
          <h3>{counted ? <T en="Well done!" ru="Shabash!" /> : <T en="Nothing was counted" ru="Kuch ginti nahi hua" />}</h3>
          {!counted ? <p className="fc-lead"><T en="Let's try again. Put the phone as in the picture, step back until your whole body is in view, and keep still for a moment before you start." ru="Dobara koshish karte hain. Phone tasveer ki tarah rakhein, itna peeche hon ke poora jism nazar aaye, aur shuru karne se pehle zara saakin rahein." /></p> : null}
          {counted && pass === 1 ? (isReps
            ? <div className="fc-big">{fc.summary.reps}<small><T en="repetitions counted" ru="repetitions ginti gayin" /></small></div>
            : <div className="fc-big">{seconds(fc.summary.bestHoldMs)}<small><T en="seconds, your longest hold" ru="second, aap ka sab se lamba hold" /></small></div>) : null}
          <div className="fc-facts">
            {counted && pass === 1 && isReps ? <div className="fc-fact"><b>{fc.summary.partial}</b><T en="were shallower than the target" ru="target se kam range ki thin" /></div> : null}
            <div className="fc-fact"><b>{Math.round(fc.summary.coverage.fraction * 100)}%</b><T en="of the time I could see you" ru="waqt aap nazar aa rahe the" /></div>
          </div>
          <p className="fc-warn"><AlertTriangle aria-hidden="true" /> <span>{STOP_IF_PAINFUL[lang]}</span></p>
          <details className="fc-more">
            <summary><T en="What the camera could not see" ru="Camera kya nahi dekh saka" /></summary>
            <p>{fc.summary.limits[lang]}</p>
            <p>{GENERAL_LIMITS[lang]}</p>
          </details>
          <div className="fc-actions">
            {pass === 1 && spec.second ? <button type="button" className="fc-go" onClick={() => again(2)}><Camera aria-hidden="true" /> <T en="Short second check" ru="Chhota doosra check" /></button> : null}
            <button type="button" className={pass === 1 && spec.second ? "fc-soft" : "fc-go"} onClick={() => again(1)}><RotateCcw aria-hidden="true" /> <T en="Do it again" ru="Dobara karein" /></button>
            <button type="button" className="fc-soft" onClick={close}><T en="Close" ru="Band karein" /></button>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
