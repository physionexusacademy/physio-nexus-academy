"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Camera, CheckCircle2, RotateCcw, ShieldCheck, SkipForward } from "lucide-react";
import { useLang } from "@/lib/lang";
import { assessSetup, type SetupIssue } from "@/lib/formcheck/quality";
import { SETUP_MESSAGES } from "@/lib/formcheck/messages";
import { openCamera, closeCamera, type CameraProblem } from "@/lib/formcheck/browser/camera";
import { reloadIfPolicyBlocksCamera } from "@/lib/formcheck/browser/policy-reload";
import { PhoneLevel, type Tilt } from "@/lib/formcheck/browser/level";
import { platform } from "@/lib/formcheck/browser/permission";
import { GUIDE_STEPS } from "@/components/rehabverse/formcheck/CameraPermissionGuide";
import type { PoseRuntime } from "@/lib/formcheck/browser/runtime";
import type { Frame, Landmark } from "@/lib/formcheck/types";
import { MIN_FRAMES, metricDef, type PostureMetricId } from "@/lib/posture/measures";
import { BEND_METRICS, SCAN_VIEWS, bendNotes, summariseScan, type BendMetricId, type Captures, type ScanView } from "@/lib/posture/scan";
import { METRIC_TEXT, type Bi } from "@/lib/posture/text";
import { BEND_NOTE_TEXT, BEND_TEXT, SCAN_TERMS, VIEW_TEXT } from "@/lib/posture/scan-text";
import ScanReport from "./ScanReport";

type Stage = "intro" | "setup" | "camera" | "countdown" | "capturing" | "viewdone" | "report";
type Who = "self" | "helper";
const CAPTURE_MS = 3500;
const CAPTURE_MAX_MS = 9000;
const NEED: Record<Exclude<ScanView, "bend">, string[]> = {
  front: ["leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"],
  side: ["near:ear", "near:shoulder", "near:hip", "near:knee", "near:ankle"],
  back: ["leftShoulder", "rightShoulder", "leftHip", "rightHip", "leftAnkle", "rightAnkle"],
};
const BEND_NEED = [11, 12, 23, 24, 25, 26, 27, 28];

const CAMERA_PROBLEM: Record<CameraProblem, Bi> = {
  denied: { en: "The camera is blocked for this site. Follow the steps below, then try again.", ur: "Is site ke liye camera blocked hai. Neeche ke qadam karein, phir dobara koshish karein." },
  policy: { en: "This page is not allowed to use the camera. Please tell the clinic.", ur: "Is page ko camera istemal karne ki ijazat nahi. Clinic ko batayein." },
  none: { en: "No camera was found on this device.", ur: "Is device par camera nahi mila." },
  busy: { en: "Another app is using the camera. Close it and try again.", ur: "Koi aur app camera istemal kar rahi hai. Isay band karein aur dobara koshish karein." },
  insecure: { en: "The camera needs a secure (https) connection.", ur: "Camera ke liye mehfooz (https) connection chahiye." },
  unsupported: { en: "This browser cannot use the camera. Try Chrome or Safari.", ur: "Yeh browser camera istemal nahi kar sakta. Chrome ya Safari try karein." },
  in_app: { en: "Open this page in Chrome or Safari: the camera does not work inside other apps.", ur: "Is page ko Chrome ya Safari mein kholein: doosri apps ke andar camera kaam nahi karta." },
  failed: { en: "The camera could not start. Try again.", ur: "Camera shuru nahi ho saka. Dobara koshish karein." },
};

function beep(freq: number, ms: number) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    window.setTimeout(() => { osc.stop(); void ctx.close(); }, ms);
  } catch { /* sound is a help, not a need */ }
}

/** A forward bend is wider and shorter than a standing body, so the standing-body checks do not apply: it only needs the trunk and legs to be seen. */
function bendIssues(landmarks: Landmark[] | null): SetupIssue[] {
  if (!landmarks || landmarks.length < 33 || landmarks.every((p) => !p || p.v < 0.2)) return ["no_person"];
  const near = (landmarks[11].v + landmarks[23].v + landmarks[25].v + landmarks[27].v) >= (landmarks[12].v + landmarks[24].v + landmarks[26].v + landmarks[28].v) ? [11, 23, 25, 27] : [12, 24, 26, 28];
  return near.every((i) => landmarks[i] && landmarks[i].v >= 0.6) ? [] : ["body_not_visible"];
}

/** A small picture of the capture with the lines the numbers were read from, for the person's own screen. Kept in this page only, never saved or sent. */
function snapshot(video: HTMLVideoElement, lm: Landmark[] | null, view: ScanView): string | null {
  try {
    const w = Math.min(360, video.videoWidth || 360);
    const h = Math.round((w * (video.videoHeight || 480)) / (video.videoWidth || 360));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    if (!g) return null;
    g.drawImage(video, 0, 0, w, h);
    if (lm && lm.length >= 33) {
      const P = (i: number) => ({ x: lm[i].x * w, y: lm[i].y * h, ok: lm[i].v > 0.5 });
      const line = (a: number, b: number, color: string) => { const p = P(a), q = P(b); if (!p.ok || !q.ok) return; g.strokeStyle = color; g.lineWidth = 3; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); };
      if (view === "front" || view === "back") {
        line(11, 12, "#2ee6d6"); line(23, 24, "#ffd166"); if (view === "front") line(7, 8, "#ff8fab");
        for (const i of [11, 12, 23, 24]) { const p = P(i); if (p.ok) { g.fillStyle = "#fff"; g.beginPath(); g.arc(p.x, p.y, 4, 0, 7); g.fill(); } }
      } else {
        const side = lm[11].v + lm[23].v + lm[25].v + lm[27].v >= lm[12].v + lm[24].v + lm[26].v + lm[28].v ? 0 : 1;
        const chain = side === 0 ? [7, 11, 23, 25, 27] : [8, 12, 24, 26, 28];
        for (let k = 0; k < chain.length - 1; k++) line(chain[k], chain[k + 1], "#2ee6d6");
        for (const i of chain) { const p = P(i); if (p.ok) { g.fillStyle = "#fff"; g.beginPath(); g.arc(p.x, p.y, 4, 0, 7); g.fill(); } }
      }
    }
    return c.toDataURL("image/jpeg", 0.72);
  } catch { return null; }
}

export default function ScanScreen() {
  const [lang] = useLang();
  const t = useCallback((b: Bi) => (lang === "ur" ? b.ur : b.en), [lang]);
  const [stage, setStage] = useState<Stage>("intro");
  const [agreed, setAgreed] = useState(false);
  const [who, setWho] = useState<Who>("self");
  const [view, setView] = useState<ScanView>("front");
  const [captures, setCaptures] = useState<Captures>({});
  const [photos, setPhotos] = useState<Partial<Record<ScanView, string>>>({});
  const [issues, setIssues] = useState<SetupIssue[]>([]);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const [levelOn, setLevelOn] = useState(false);
  const [problem, setProblem] = useState<CameraProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<PoseRuntime | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const level = useRef<PhoneLevel | null>(null);
  const viewRef = useRef<ScanView>("front");
  const collecting = useRef(false);
  const frames = useRef<Frame[]>([]);
  const lastLm = useRef<Landmark[] | null>(null);
  const issuesKey = useRef("");
  const timers = useRef<number[]>([]);

  useEffect(() => { viewRef.current = view; }, [view]);
  // Arriving by an in-app link keeps the previous page's Permissions-Policy (camera off): load this page as its own document (see permission.ts).
  useEffect(() => { reloadIfPolicyBlocksCamera(); }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    level.current?.stop();
    level.current = null;
    closeCamera(video.current, stream.current);
    stream.current = null;
    runtime.current?.close();
    runtime.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const draw = (landmarks: Landmark[] | null, w: number, h: number) => {
    const c = canvas.current;
    if (!c) return;
    if (c.width !== w) { c.width = w; c.height = h; }
    const g = c.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; g.setLineDash([10, 10]);
    g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); g.setLineDash([]);
    if (!landmarks) return;
    g.fillStyle = "#2ee6d6";
    for (const i of [7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 25, 26, 27, 28]) { const p = landmarks[i]; if (p && p.v > 0.5) { g.beginPath(); g.arc(p.x * w, p.y * h, 7, 0, Math.PI * 2); g.fill(); } }
  };

  const loop = useCallback(() => {
    const v = video.current;
    const rt = runtime.current;
    if (!v || !rt) return;
    if (v.readyState >= 2) {
      const { frame, landmarks } = rt.detect(v);
      const cur = viewRef.current;
      let list: SetupIssue[];
      let ok: boolean;
      if (cur === "bend") { list = bendIssues(landmarks); ok = list.length === 0; }
      else { const r = assessSetup(frame, { need: [...NEED[cur]] as never, view: cur === "side" ? "side" : "front", size: [0.55, 0.97], minVisibility: 0.6 }); list = r.issues; ok = r.ok; }
      const key = list.join(",");
      if (key !== issuesKey.current) { issuesKey.current = key; setIssues(list); }
      lastLm.current = landmarks;
      draw(landmarks, frame.w, frame.h);
      if (collecting.current && ok) frames.current.push(frame);
    }
    raf.current = requestAnimationFrame(loop);
  }, []);

  const startCamera = async () => {
    setProblem(null); setLoading(true); setStage("camera"); issuesKey.current = "no_person"; setIssues(["no_person"]);
    const lv = new PhoneLevel();
    level.current = lv;
    void lv.start((tl) => setTilt(tl)).then(setLevelOn);
    const el = video.current;
    if (!el) return;
    const opened = await openCamera(el, who === "self" ? "user" : "environment");
    if (!opened.ok) {
      if (opened.problem === "policy" && reloadIfPolicyBlocksCamera()) return;
      setProblem(opened.problem); setLoading(false); setStage("setup"); return;
    }
    stream.current = opened.camera.stream;
    try {
      const { PoseRuntime } = await import("@/lib/formcheck/browser/runtime");
      runtime.current = await PoseRuntime.create({ model: "full" });
    } catch {
      closeCamera(el, stream.current); stream.current = null;
      setProblem("failed"); setLoading(false); setStage("setup");
      return;
    }
    setLoading(false);
    raf.current = requestAnimationFrame(loop);
  };

  const begin = () => {
    const wait = who === "self" ? 10 : 3;
    setStage("countdown"); setSeconds(wait);
    let left = wait;
    const tick = () => {
      left -= 1;
      setSeconds(left);
      if (left > 0) { beep(660, 120); timers.current.push(window.setTimeout(tick, 1000)); return; }
      beep(990, 350);
      frames.current = []; collecting.current = true; setStage("capturing");
      // Hold for at least CAPTURE_MS, and a little longer on a slow phone until enough good frames have been seen (never more than CAPTURE_MAX_MS).
      const started = performance.now();
      const finish = () => {
        collecting.current = false;
        beep(990, 250);
        const cur = viewRef.current;
        const out = summariseScan(frames.current, cur);
        const pic = video.current ? snapshot(video.current, lastLm.current, cur) : null;
        setCaptures((old) => ({ ...old, [cur]: out }));
        if (pic) setPhotos((old) => ({ ...old, [cur]: pic }));
        stop();
        setStage("viewdone");
      };
      const check = () => {
        const elapsed = performance.now() - started;
        if ((elapsed >= CAPTURE_MS && frames.current.length >= MIN_FRAMES) || elapsed >= CAPTURE_MAX_MS) { finish(); return; }
        timers.current.push(window.setTimeout(check, 200));
      };
      timers.current.push(window.setTimeout(check, CAPTURE_MS));
    };
    timers.current.push(window.setTimeout(tick, 1000));
  };

  const levelBlocks = levelOn && tilt !== null && !tilt.level;
  const ready = issues.length === 0 && !loading && !levelBlocks;
  const doneViews = SCAN_VIEWS.filter((v) => captures[v]?.ok);
  const nextView = SCAN_VIEWS.find((v) => v !== view && !captures[v]?.ok && SCAN_VIEWS.indexOf(v) > SCAN_VIEWS.indexOf(view)) ?? SCAN_VIEWS.find((v) => !captures[v]?.ok && v !== view);

  const goTo = (v: ScanView) => { stop(); setView(v); viewRef.current = v; setStage("setup"); };
  const retake = () => { stop(); setStage("setup"); };
  const startOver = () => { stop(); setCaptures({}); setPhotos({}); setView("front"); viewRef.current = "front"; setStage("setup"); };

  const cue = stage === "countdown" && view === "bend" && seconds <= (who === "self" ? 4 : 3);
  const current = captures[view];

  return (
    <div className="ps-shell sc-shell">
      {stage === "intro" && (
        <section className="ps-card" aria-labelledby="sc-terms">
          <h2 id="sc-terms"><ShieldCheck aria-hidden="true" /> {t(SCAN_TERMS.title)}</h2>
          <ul className="ps-terms">{SCAN_TERMS.items.map((i) => (<li key={i.en}>{t(i)}</li>))}</ul>
          <label className="ps-agree">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>{t({ en: "I have read this and understand that it is a screen, the skeleton is an illustration, and neither is a diagnosis.", ur: "Maine yeh parha hai aur samajhta hoon ke yeh screen hai, skeleton tasveeri misaal hai, aur dono mein se koi tashkhees nahi." })}</span>
          </label>
          <button type="button" className="ps-btn" disabled={!agreed} onClick={() => setStage("setup")}>{t({ en: "Continue", ur: "Aage barhein" })}</button>
        </section>
      )}

      {(stage === "setup" || stage === "camera" || stage === "countdown" || stage === "capturing") && (
        <section className="ps-card">
          <ol className="sc-steps" aria-label={t({ en: "The four views", ur: "Chaar views" })}>
            {SCAN_VIEWS.map((v, i) => (
              <li key={v} data-state={v === view ? "now" : captures[v]?.ok ? "done" : captures[v] ? "failed" : "todo"}>
                <span aria-hidden="true">{captures[v]?.ok ? "✓" : i + 1}</span> {t(VIEW_TEXT[v].name)}
              </li>
            ))}
          </ol>
          {stage === "setup" && (
            <>
              <h2>{t(VIEW_TEXT[view].name)}</h2>
              <p className="ps-note">{t(VIEW_TEXT[view].short)}</p>
              <div className="ps-choices" role="radiogroup" aria-label={t({ en: "Who takes the picture", ur: "Tasveer kaun leta hai" })}>
                <button type="button" role="radio" aria-checked={who === "self"} className="ps-choice" data-active={who === "self"} onClick={() => setWho("self")}><strong>{t({ en: "Phone on a stand (just me)", ur: "Stand par phone (sirf main)" })}</strong><span>{t({ en: "Front camera, 10 second countdown", ur: "Front camera, 10 second ki ginti" })}</span></button>
                <button type="button" role="radio" aria-checked={who === "helper"} className="ps-choice" data-active={who === "helper"} onClick={() => setWho("helper")}><strong>{t({ en: "Someone takes it", ur: "Koi aur leta hai" })}</strong><span>{t({ en: "Back camera, 3 second countdown", ur: "Peechay ka camera, 3 second ki ginti" })}</span></button>
              </div>
              <h3>{t({ en: "Set-up", ur: "Set-up" })}</h3>
              <ol className="ps-steps">{VIEW_TEXT[view].guide.map((s) => (<li key={s.en}>{t(s)}</li>))}</ol>
              {problem && (
                <div className="ps-warn" role="alert">
                  <AlertTriangle aria-hidden="true" /> <span>{t(CAMERA_PROBLEM[problem])}</span>
                  {problem === "denied" && <ol className="ps-steps">{GUIDE_STEPS[platform()].map((s) => (<li key={s.en}>{lang === "ur" ? s.ru : s.en}</li>))}</ol>}
                </div>
              )}
              <div className="ps-row">
                <button type="button" className="ps-btn" onClick={startCamera}><Camera aria-hidden="true" /> {t({ en: "Open the camera", ur: "Camera kholein" })}</button>
                {current && !current.ok && <p className="ps-note" role="status">{t({ en: "The last try did not work. Check the light and that your whole body is in the picture.", ur: "Pichhli koshish kaam nahi ki. Roshni aur yeh dekhein ke poora jism tasveer mein hai." })}</p>}
                <button type="button" className="ps-btn ps-ghost" onClick={() => { const n = SCAN_VIEWS[SCAN_VIEWS.indexOf(view) + 1]; if (n) goTo(n); else setStage("report"); }} disabled={SCAN_VIEWS.indexOf(view) === SCAN_VIEWS.length - 1 && doneViews.length === 0}><SkipForward aria-hidden="true" /> {t({ en: SCAN_VIEWS.indexOf(view) === SCAN_VIEWS.length - 1 ? "Skip and see the report" : "Skip this view", ur: SCAN_VIEWS.indexOf(view) === SCAN_VIEWS.length - 1 ? "Chhor kar report dekhein" : "Yeh view chhor dein" })}</button>
                {doneViews.length > 0 && <button type="button" className="ps-btn ps-ghost" onClick={() => setStage("report")}>{t({ en: "See the report now", ur: "Report abhi dekhein" })}</button>}
              </div>
            </>
          )}

          <div className="ps-stage" hidden={stage === "setup"}>
            <video ref={video} playsInline muted className="ps-video" data-mirror={who === "self"} />
            <canvas ref={canvas} className="ps-canvas" data-mirror={who === "self"} aria-hidden="true" />
            {stage === "countdown" && <div className="ps-count" aria-live="assertive">{cue ? <span className="sc-cue">{t({ en: "Bend forward now", ur: "Ab aage jhukein" })}</span> : seconds}</div>}
            {stage === "capturing" && <div className="ps-count ps-hold" aria-live="assertive">{t({ en: view === "bend" ? "Hold the bend" : "Hold still", ur: view === "bend" ? "Jhuke rahein" : "Saakit rahein" })}</div>}
          </div>

          {stage === "camera" && (
            <div className="ps-setup" aria-live="polite">
              {loading ? <p>{t({ en: "Starting the camera and loading the pose model…", ur: "Camera shuru ho raha hai aur pose model load ho raha hai…" })}</p> : (
                <>
                  <p className="ps-note"><strong>{t(VIEW_TEXT[view].name)}</strong></p>
                  {levelOn && tilt && <p className="ps-level" data-ok={tilt.level}>{t({ en: "Phone level", ur: "Phone ki sateh" })}: {tilt.pitch.toFixed(1)}° / {tilt.roll.toFixed(1)}° {tilt.level ? <CheckCircle2 aria-hidden="true" /> : t({ en: "Hold the phone upright and level", ur: "Phone ko seedha aur barabar rakhein" })}</p>}
                  {!levelOn && <p className="ps-note">{t({ en: "This phone cannot report its tilt. Make sure it is upright and not leaning, or the angles will be off.", ur: "Yeh phone apna jhukao nahi bata sakta. Yaqeeni banayein ke woh seedha hai, jhuka hua nahi, warna angles ghalat honge." })}</p>}
                  {view === "bend" && <p className="ps-note">{t({ en: "Stand sideways. When the count reaches the last few seconds you will be told to bend: bend slowly with straight knees and hold.", ur: "Side mein khare hon. Jab ginti aakhri chand seconds par aaye to jhukne ko kaha jayega: aahista seedhay ghutnon ke saath jhukein aur ruke rahein." })}</p>}
                  {issues.length > 0 ? <ul className="ps-issues">{issues.map((i) => (<li key={i}>{lang === "ur" ? SETUP_MESSAGES[i].ru : SETUP_MESSAGES[i].en}</li>))}</ul> : <p className="ps-ok"><CheckCircle2 aria-hidden="true" /> {t({ en: "I can see you. Get ready.", ur: "Main aap ko dekh sakta hoon. Taiyar ho jayein." })}</p>}
                  <div className="ps-row">
                    <button type="button" className="ps-btn" disabled={!ready} onClick={begin}>{t({ en: who === "self" ? "Start the 10 second countdown" : "Take the picture", ur: who === "self" ? "10 second ki ginti shuru karein" : "Tasveer lein" })}</button>
                    <button type="button" className="ps-btn ps-ghost" onClick={retake}>{t({ en: "Back", ur: "Wapas" })}</button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {stage === "viewdone" && (
        <section className="ps-card" aria-labelledby="sc-viewdone">
          <h2 id="sc-viewdone">{t(VIEW_TEXT[view].name)}</h2>
          {!current ? null : !current.ok ? (
            <div className="ps-warn" role="alert"><AlertTriangle aria-hidden="true" /> <span>{t(current.reason === "too_few_frames" ? { en: `I could not see you clearly for long enough (${current.frames} good pictures, ${MIN_FRAMES} needed). Check the light and that your whole body is in the picture, then try again.`, ur: `Main aap ko itni der saaf nahi dekh saka (${current.frames} achhi tasveerein, ${MIN_FRAMES} chahiye). Roshni aur yeh dekhein ke poora jism tasveer mein hai, phir dobara koshish karein.` } : { en: "I could not find a person in the pictures. Check that you are in view and the light is good, then try again.", ur: "Tasveeron mein koi insaan nahi mila. Dekhein ke aap nazar aa rahe hain aur roshni achhi hai, phir dobara koshish karein." })}</span></div>
          ) : (
            <>
              <p className="ps-ok"><CheckCircle2 aria-hidden="true" /> {t({ en: "Captured. The full numbers are in your report.", ur: "Capture ho gaya. Poore numbers aap ki report mein hain." })}</p>
              <ul className="sc-quick">
                {current.results.map((r) => {
                  const bend = r.id in BEND_METRICS;
                  const label = bend ? BEND_TEXT[r.id as BendMetricId].label : METRIC_TEXT[r.id as PostureMetricId].label;
                  const unit = bend ? (BEND_METRICS[r.id as BendMetricId].unit === "deg" ? "°" : "%") : metricDef(r.id as PostureMetricId).unit === "deg" ? "°" : "%";
                  return <li key={r.id}><span>{t(label)}</span><strong>{r.value}{unit} <small>± {r.plusMinus}{unit}</small></strong></li>;
                })}
              </ul>
              {view === "bend" && bendNotes(current).map((n) => <p key={n} className="ps-note">{t(BEND_NOTE_TEXT[n])}</p>)}
              {current.unreadable.length > 0 && <p className="ps-note">{t({ en: "Not measured because they could not be seen clearly: ", ur: "Naapa nahi gaya kyunke saaf nazar nahi aaye: " })}{current.unreadable.map((u) => t(u in BEND_METRICS ? BEND_TEXT[u as BendMetricId].label : METRIC_TEXT[u as PostureMetricId].label)).join(", ")}.</p>}
              {photos[view] && <img className="sc-thumb" src={photos[view]} alt={t({ en: "Your picture with the lines used for the numbers (shown only on this screen)", ur: "Aap ki tasveer un lakeeron ke saath jin se numbers liye gaye (sirf is screen par)" })} />}
            </>
          )}
          <div className="ps-row">
            <button type="button" className="ps-btn ps-ghost" onClick={retake}><RotateCcw aria-hidden="true" /> {t({ en: "Take it again", ur: "Dobara lein" })}</button>
            {nextView ? <button type="button" className="ps-btn" onClick={() => goTo(nextView)}>{t({ en: `Next: ${VIEW_TEXT[nextView].name.en}`, ur: `Agla: ${VIEW_TEXT[nextView].name.ur}` })} <ArrowRight aria-hidden="true" /></button> : null}
            <button type="button" className={nextView ? "ps-btn ps-ghost" : "ps-btn"} onClick={() => setStage("report")} disabled={doneViews.length === 0}>{t({ en: "See my report", ur: "Meri report dekhein" })}</button>
          </div>
        </section>
      )}

      {stage === "report" && <ScanReport captures={captures} photos={photos} onAgain={startOver} onMore={(v) => goTo(v)} />}
    </div>
  );
}
