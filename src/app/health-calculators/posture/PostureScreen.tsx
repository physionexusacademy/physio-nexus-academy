"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Camera, CheckCircle2, Printer, RotateCcw, ShieldCheck } from "lucide-react";
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
import { band, MIN_FRAMES, summarise, metricDef, type CaptureResult, type PostureMetricId, type PostureView } from "@/lib/posture/measures";
import { BAND_TEXT, METRIC_TEXT, NEXT_STEPS, SETUP_GUIDE, TERMS, type Bi } from "@/lib/posture/text";

type Stage = "intro" | "choose" | "camera" | "countdown" | "capturing" | "results";
type Who = "self" | "helper";
const CAPTURE_MS = 3500;
const FRONT_NEED = ["leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"] as const;
const SIDE_NEED = ["near:ear", "near:shoulder", "near:hip", "near:knee", "near:ankle"] as const;

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

export default function PostureScreen() {
  const [lang] = useLang();
  const t = useCallback((b: Bi) => (lang === "ur" ? b.ur : b.en), [lang]);
  const [stage, setStage] = useState<Stage>("intro");
  const [agreed, setAgreed] = useState(false);
  const [view, setView] = useState<PostureView>("side");
  const [who, setWho] = useState<Who>("self");
  const [issues, setIssues] = useState<SetupIssue[]>([]);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const [levelOn, setLevelOn] = useState(false);
  const [problem, setProblem] = useState<CameraProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [validation, setValidation] = useState(false);
  const [rows, setRows] = useState<string[][]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});

  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<PoseRuntime | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const level = useRef<PhoneLevel | null>(null);
  const stageRef = useRef<Stage>("intro");
  const viewRef = useRef<PostureView>("side");
  const collecting = useRef(false);
  const frames = useRef<Frame[]>([]);
  const issuesKey = useRef("");

  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { setValidation(new URLSearchParams(window.location.search).get("validation") === "1"); }, []);
  // Arriving by an in-app link keeps the previous page's Permissions-Policy (camera off): load this page as its own document (see permission.ts).
  useEffect(() => { reloadIfPolicyBlocksCamera(); }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
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
    // a plumb line and a level line help the person line up the phone
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; g.setLineDash([10, 10]);
    g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); g.setLineDash([]);
    if (!landmarks) return;
    g.fillStyle = "#2ee6d6";
    for (const i of [7, 8, 11, 12, 23, 24, 25, 26, 27, 28]) { const p = landmarks[i]; if (p && p.v > 0.5) { g.beginPath(); g.arc(p.x * w, p.y * h, 7, 0, Math.PI * 2); g.fill(); } }
  };

  const loop = useCallback(() => {
    const v = video.current;
    const rt = runtime.current;
    if (!v || !rt) return;
    if (v.readyState >= 2) {
      const { frame, landmarks } = rt.detect(v);
      const result = assessSetup(frame, { need: viewRef.current === "side" ? [...SIDE_NEED] : [...FRONT_NEED], view: viewRef.current === "side" ? "side" : "front", size: [0.55, 0.97], minVisibility: 0.6 });
      const key = result.issues.join(",");
      if (key !== issuesKey.current) { issuesKey.current = key; setIssues(result.issues); }
      draw(landmarks, frame.w, frame.h);
      if (collecting.current && result.ok) frames.current.push(frame);
    }
    raf.current = requestAnimationFrame(loop);
  }, []);

  const startCamera = async () => {
    setProblem(null); setLoading(true); setStage("camera"); setCapture(null); issuesKey.current = ""; setIssues(["no_person"]);
    // an iPhone asks about its motion sensor only from a tap: start it first
    const lv = new PhoneLevel();
    level.current = lv;
    void lv.start((tl) => setTilt(tl)).then(setLevelOn);
    const el = video.current;
    if (!el) return;
    const opened = await openCamera(el, who === "self" ? "user" : "environment");
    if (!opened.ok) {
      if (opened.problem === "policy" && reloadIfPolicyBlocksCamera()) return;
      setProblem(opened.problem); setLoading(false); setStage("choose"); return;
    }
    stream.current = opened.camera.stream;
    try {
      const { PoseRuntime } = await import("@/lib/formcheck/browser/runtime");
      runtime.current = await PoseRuntime.create({ model: "full" });
    } catch {
      closeCamera(el, stream.current); stream.current = null;
      setProblem("failed"); setLoading(false); setStage("choose");
      return;
    }
    setLoading(false);
    raf.current = requestAnimationFrame(loop);
  };

  const begin = () => {
    const wait = who === "self" ? 10 : 3;
    setStage("countdown"); setSeconds(wait);
    let left = wait;
    const timer = window.setInterval(() => {
      left -= 1;
      setSeconds(left);
      if (left > 0) { beep(660, 120); return; }
      window.clearInterval(timer);
      beep(990, 350);
      frames.current = []; collecting.current = true; setStage("capturing");
      window.setTimeout(() => {
        collecting.current = false;
        const out = summarise(frames.current, viewRef.current);
        setCapture(out);
        stop();
        setStage("results");
      }, CAPTURE_MS);
    }, 1000);
  };

  const levelBlocks = levelOn && tilt !== null && !tilt.level;
  const ready = issues.length === 0 && !loading && !levelBlocks;

  const retake = () => { stop(); setCapture(null); setStage("choose"); setRefs({}); };

  const addRow = () => {
    if (!capture?.ok) return;
    const now = new Date().toISOString();
    const add = capture.results.map((r) => [now, capture.view, r.id, String(r.value), String(r.plusMinus), refs[r.id] ?? "", who, tilt ? tilt.pitch.toFixed(1) : "", tilt ? tilt.roll.toFixed(1) : ""]);
    setRows((old) => [...old, ...add]);
  };
  const download = () => {
    const head = ["time", "view", "metric", "app_value", "app_plus_minus", "reference_value", "capture_by", "phone_pitch_deg", "phone_roll_deg"];
    const csv = [head, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "posture-validation.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
      <div className="ps-shell">
        {stage === "intro" && (
          <section className="ps-card" aria-labelledby="ps-terms">
            <h2 id="ps-terms"><ShieldCheck aria-hidden="true" /> {t(TERMS.title)}</h2>
            <ul className="ps-terms">{TERMS.items.map((i) => (<li key={i.en}>{t(i)}</li>))}</ul>
            <label className="ps-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>{t({ en: "I have read this and understand that it is a screen, not a diagnosis.", ur: "Maine yeh parha hai aur samajhta hoon ke yeh screen hai, tashkhees nahi." })}</span>
            </label>
            <button type="button" className="ps-btn" disabled={!agreed} onClick={() => setStage("choose")}>{t({ en: "Continue", ur: "Aage barhein" })}</button>
          </section>
        )}

        {(stage === "choose" || stage === "camera" || stage === "countdown" || stage === "capturing") && (
          <section className="ps-card">
            {stage === "choose" && (
              <>
                <h2>{t({ en: "Choose what to check", ur: "Chunein kya check karna hai" })}</h2>
                <div className="ps-choices" role="radiogroup" aria-label={t({ en: "View", ur: "View" })}>
                  <button type="button" role="radio" aria-checked={view === "side"} className="ps-choice" data-active={view === "side"} onClick={() => setView("side")}><strong>{t({ en: "Side view", ur: "Side view" })}</strong><span>{t({ en: "Head forward, trunk lean, standing balance, knee angle", ur: "Sar aage, dhad ka jhukao, khare hone ka tawazun, ghutne ka zaviya" })}</span></button>
                  <button type="button" role="radio" aria-checked={view === "front"} className="ps-choice" data-active={view === "front"} onClick={() => setView("front")}><strong>{t({ en: "Front view", ur: "Samne ka view" })}</strong><span>{t({ en: "Shoulder, hip and head level, trunk shift, knees in or out", ur: "Kandhon, kulhon aur sar ki sateh, dhad ka khisakna, ghutne andar ya bahar" })}</span></button>
                </div>
                <div className="ps-choices" role="radiogroup" aria-label={t({ en: "Who takes the picture", ur: "Tasveer kaun leta hai" })}>
                  <button type="button" role="radio" aria-checked={who === "self"} className="ps-choice" data-active={who === "self"} onClick={() => setWho("self")}><strong>{t({ en: "Phone on a stand (just me)", ur: "Stand par phone (sirf main)" })}</strong><span>{t({ en: "Front camera, 10 second countdown", ur: "Front camera, 10 second ki ginti" })}</span></button>
                  <button type="button" role="radio" aria-checked={who === "helper"} className="ps-choice" data-active={who === "helper"} onClick={() => setWho("helper")}><strong>{t({ en: "Someone takes it", ur: "Koi aur leta hai" })}</strong><span>{t({ en: "Back camera, 3 second countdown", ur: "Peechay ka camera, 3 second ki ginti" })}</span></button>
                </div>
                <h3>{t({ en: "Set-up", ur: "Set-up" })}</h3>
                <ol className="ps-steps">{SETUP_GUIDE[view].map((s) => (<li key={s.en}>{t(s)}</li>))}</ol>
                {problem && (
                  <div className="ps-warn" role="alert">
                    <AlertTriangle aria-hidden="true" /> <span>{t(CAMERA_PROBLEM[problem])}</span>
                    {problem === "denied" && <ol className="ps-steps">{GUIDE_STEPS[platform()].map((s) => (<li key={s.en}>{lang === "ur" ? s.ru : s.en}</li>))}</ol>}
                  </div>
                )}
                <button type="button" className="ps-btn" onClick={startCamera}><Camera aria-hidden="true" /> {t({ en: "Open the camera", ur: "Camera kholein" })}</button>
              </>
            )}

            <div className="ps-stage" hidden={stage === "choose"}>
              <video ref={video} playsInline muted className="ps-video" data-mirror={who === "self"} />
              <canvas ref={canvas} className="ps-canvas" data-mirror={who === "self"} aria-hidden="true" />
              {stage === "countdown" && <div className="ps-count" aria-live="assertive">{seconds}</div>}
              {stage === "capturing" && <div className="ps-count ps-hold" aria-live="assertive">{t({ en: "Hold still", ur: "Saakit rahein" })}</div>}
            </div>

            {stage === "camera" && (
              <div className="ps-setup" aria-live="polite">
                {loading ? <p>{t({ en: "Starting the camera and loading the pose model…", ur: "Camera shuru ho raha hai aur pose model load ho raha hai…" })}</p> : (
                  <>
                    {levelOn && tilt && <p className="ps-level" data-ok={tilt.level}>{t({ en: "Phone level", ur: "Phone ki sateh" })}: {tilt.pitch.toFixed(1)}° / {tilt.roll.toFixed(1)}° {tilt.level ? <CheckCircle2 aria-hidden="true" /> : t({ en: "Hold the phone upright and level", ur: "Phone ko seedha aur barabar rakhein" })}</p>}
                    {!levelOn && <p className="ps-note">{t({ en: "This phone cannot report its tilt. Make sure it is upright and not leaning, or the angles will be off.", ur: "Yeh phone apna jhukao nahi bata sakta. Yaqeeni banayein ke woh seedha hai, jhuka hua nahi, warna angles ghalat honge." })}</p>}
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

        {stage === "results" && capture && (
          <section className="ps-card" aria-labelledby="ps-results">
            <h2 id="ps-results">{t({ en: view === "side" ? "Your side view" : "Your front view", ur: view === "side" ? "Aap ka side view" : "Aap ka samne ka view" })}</h2>
            {!capture.ok ? (
              <div className="ps-warn" role="alert"><AlertTriangle aria-hidden="true" /> <span>{t(capture.reason === "too_few_frames" ? { en: `I could not see you clearly for long enough (${capture.frames} good pictures, ${MIN_FRAMES} needed). Check the light and that your whole body is in the picture, then try again.`, ur: `Main aap ko itni der saaf nahi dekh saka (${capture.frames} achhi tasveerein, ${MIN_FRAMES} chahiye). Roshni aur poora jism tasveer mein hone ki jaanch karein, phir dobara koshish karein.` } : { en: "I could not find a person in the picture. Try again.", ur: "Tasveer mein koi shakhs nahi mila. Dobara koshish karein." })}</span></div>
            ) : (
              <>
                <p className="ps-prov">{t({ en: "A screen with limits. The ranges below are provisional until the validation study is finished. Left and right are your own sides.", ur: "Hadood wali screen. Neeche ki ranges tab tak aarzi hain jab tak validation study khatam na ho. Left aur right aap ke apne sides hain." })}</p>
                <ul className="ps-results">
                  {capture.results.map((r) => {
                    const id = r.id as PostureMetricId;
                    const b = band(id, r.value, r.plusMinus);
                    const unit = metricDef(id).unit === "deg" ? "°" : "%";
                    return (
                      <li key={id} className="ps-result" data-band={b}>
                        <div className="ps-result-head"><strong>{t(METRIC_TEXT[id].label)}</strong><span className="ps-chip">{t(BAND_TEXT[b].label)}</span></div>
                        <p className="ps-value">{r.value}{unit} <span>± {r.plusMinus}{unit}</span></p>
                        <p>{t(BAND_TEXT[b].line)}</p>
                        {!r.steady && <p className="ps-note">{t({ en: "You moved a little during the picture, so this number is less certain. Try again, standing still.", ur: "Tasveer ke dauran aap thora hile, is liye yeh number kam yaqeeni hai. Saakit khare ho kar dobara koshish karein." })}</p>}
                        <details><summary>{t({ en: "What this measures", ur: "Yeh kya naapta hai" })}</summary><p>{t(METRIC_TEXT[id].what)}</p></details>
                        {validation && <label className="ps-ref"><span>Reference value</span><input inputMode="decimal" value={refs[id] ?? ""} onChange={(e) => setRefs((old) => ({ ...old, [id]: e.target.value }))} /></label>}
                      </li>
                    );
                  })}
                </ul>
                {capture.unreadable.length > 0 && <p className="ps-note">{t({ en: "Not measured because they could not be seen clearly: ", ur: "Naapa nahi gaya kyunke saaf nazar nahi aaye: " })}{capture.unreadable.map((u) => t(METRIC_TEXT[u].label)).join(", ")}.</p>}
                <div className="ps-safe"><AlertTriangle aria-hidden="true" /> <span>{t({ en: "See a physiotherapist or doctor if you have pain that does not settle, numbness or tingling, weakness, or any worry about your spine. This tool cannot tell you why your posture looks the way it does.", ur: "Dard jo na thame, sunn hona ya jhunjhunahat, kamzori, ya reedh ke baare mein koi fikr ho to physiotherapist ya doctor ko dikhayein. Yeh tool nahi bata sakta ke aap ki posture aisi kyun hai." })}</span></div>
                <h3>{t({ en: "What next", ur: "Ab aage" })}</h3>
                <ul className="ps-next">{NEXT_STEPS.map((n) => (<li key={n.href}>{t(n.text)} <Link href={n.href}>{t(n.label)}</Link></li>))}</ul>
              </>
            )}
            <div className="ps-row" data-print-hide>
              <button type="button" className="ps-btn" onClick={retake}><RotateCcw aria-hidden="true" /> {t({ en: "Take it again", ur: "Dobara lein" })}</button>
              <button type="button" className="ps-btn ps-ghost" onClick={() => { setView(view === "side" ? "front" : "side"); retake(); }}>{t({ en: view === "side" ? "Now the front view" : "Now the side view", ur: view === "side" ? "Ab samne ka view" : "Ab side view" })}</button>
              <button type="button" className="ps-btn ps-ghost" onClick={() => window.print()}><Printer aria-hidden="true" /> {t({ en: "Print", ur: "Print" })}</button>
            </div>
            {validation && capture.ok && (
              <div className="ps-valid" data-print-hide>
                <h3>Validation study (researcher mode)</h3>
                <p>Enter the reference measurement for each metric, add the capture to the table, and download the CSV. Nothing is sent anywhere: the table lives in this page until you download it.</p>
                <div className="ps-row"><button type="button" className="ps-btn" onClick={addRow}>Add this capture ({rows.length} rows)</button><button type="button" className="ps-btn ps-ghost" onClick={download} disabled={!rows.length}>Download CSV</button></div>
              </div>
            )}
          </section>
        )}
      </div>
  );
}
