"use client";

/**
 * The PNA virtual physiotherapist guide: the Virtual Patient 3D model in scrubs, standing in a
 * welcome stage, who speaks to the patient with subtitles (English or Roman Urdu), gestures, points,
 * nods, blinks and moves their mouth while talking. It is a scripted guide, not a chatbot, and says
 * clearly that it is a virtual guide. Subtitles are always shown; voice is optional (English only,
 * free browser speech) and its mouth movement follows the speech.
 * If 3D is not available the same script plays as text.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Stethoscope, Volume2, VolumeX } from "lucide-react";
import type { ExamRoom, Pose } from "@/lib/virtual-patient/engine";
import { claimRoom, releaseRoom, shared, type Owner } from "@/lib/virtual-patient/shared-room";
import { P, type Parts } from "@/lib/virtual-patient/parts";
import { blendPose } from "@/lib/rehabverse/motion";
import type { Gesture, GuideBeat, GuideTopic } from "@/lib/rehabverse/guide";
import type { Lang } from "./ExercisePlayer";

const IDLE: Parts = { shoulder: { flex: 4, abd: 8 }, "shoulder:o": { flex: 4, abd: 8 }, elbow: { flex: 18 }, "elbow:o": { flex: 18 } };

/** Target pose (guide's right arm = "shoulder", so it appears on the viewer's left) for a gesture at time t. */
function gestureParts(gesture: Gesture, t: number, talk: number): Parts {
  const base: Parts = {
    ...IDLE,
    trunk: { flex: 1 + 0.8 * Math.sin(t * 1.4) },
    neck: { flex: 1.5 * talk * Math.sin(t * 2.4), rot: 3 * Math.sin(t * 0.55) },
  };
  switch (gesture) {
    case "wave":
      return { ...base, shoulder: { abd: 104, flex: 10, rot: 22 * Math.sin(t * 7) }, elbow: { flex: 98 } };
    case "open":
      return {
        ...base,
        shoulder: { flex: 30 + 4 * Math.sin(t * 2.2), abd: 24 }, "shoulder:o": { flex: 30 + 4 * Math.sin(t * 2.2 + 1), abd: 24 },
        elbow: { flex: 86 + 6 * Math.sin(t * 2.6) }, "elbow:o": { flex: 86 + 6 * Math.sin(t * 2.6 + 0.8) },
      };
    case "care":
      return { ...base, shoulder: { flex: 40, abd: -2 }, "shoulder:o": { flex: 40, abd: -2 }, elbow: { flex: 108 }, "elbow:o": { flex: 108 } };
    case "nod":
      return { ...base, neck: { flex: 11 * Math.abs(Math.sin(t * 3.2)), rot: 0 } };
    case "point_left":
      return { ...base, shoulder: { flex: 18, abd: 76 }, elbow: { flex: 6 } };
    case "point_right":
      return { ...base, "shoulder:o": { flex: 18, abd: 76 }, "elbow:o": { flex: 6 } };
    case "point_down":
      return { ...base, shoulder: { flex: 62, abd: 14 }, elbow: { flex: 14 } };
    default:
      return base;
  }
}

const CHARS_PER_SECOND = 26;
const BLINK_EVERY = 3600;

export type PhysioGuideProps = {
  beats: GuideBeat[];
  topics?: GuideTopic[];
  lang: Lang;
  autoPlay?: boolean;
  /** Changing this restarts the script (for example when the page state changes). */
  restartKey?: string;
  compact?: boolean;
  className?: string;
};

export default function PhysioGuide({ beats, topics = [], lang, autoPlay = true, restartKey, compact, className }: PhysioGuideProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<ExamRoom | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "active" | "text">("idle");
  const [progress, setProgress] = useState(shared.progress);
  const [active, setActive] = useState<{ id: string | null; beats: GuideBeat[] }>({ id: null, beats });
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [voice, setVoice] = useState(false);
  const [reduced, setReduced] = useState(false);
  const run = useRef({ index: 0, revealed: 0, holdLeft: 0, finished: false, spoken: -1 });
  const speaking = useRef(false);
  const lang_ = useRef(lang);
  lang_.current = lang;
  const ownerRef = useRef<Owner>({ lost: () => undefined, reload: () => undefined, activate: () => undefined, isVisible: () => true, hasRoom: () => roomRef.current !== null });

  const beat = active.beats[Math.min(index, active.beats.length - 1)];
  const line = beat ? beat.say[lang] : "";

  const restart = useCallback((next: GuideBeat[], id: string | null) => {
    setActive({ id, beats: next });
    setIndex(0);
    setShown(0);
    run.current = { index: 0, revealed: 0, holdLeft: 0, finished: false, spoken: -1 };
    setPlaying(true);
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    restart(beats, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartKey]);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  const activate = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    setStatus("loading");
    const listener = (p: number) => setProgress(p);
    shared.listeners.add(listener);
    claimRoom(host, ownerRef.current, "stage")
      .then((room) => {
        shared.listeners.delete(listener);
        if (shared.owner !== ownerRef.current) return;
        roomRef.current = room;
        room.setCasePosture(undefined);
        room.setPosition("standing", false);
        const plinth = room.scene.getObjectByName("plinth");
        if (plinth) plinth.visible = false;
        room.setOutfit("scrubs");
        room.setPose(P("right", IDLE), { animate: false, replace: true });
        const head = room.boneWorld("head");
        const waist = room.boneWorld("spine01");
        const centre = head.clone().lerp(waist, 0.46);
        const vfov = (room.camera.fov * Math.PI) / 180;
        const hfov = 2 * Math.atan(Math.tan(vfov / 2) * room.camera.aspect);
        const span = 1.04;
        const distance = Math.max(1.35, Math.max(span / (2 * Math.tan(vfov / 2)), 0.78 / (2 * Math.tan(hfov / 2))) * 1.08);
        room.frameCamera(false, centre, distance, new THREE.Vector3(0.12, 0.06, 1));
        setStatus("active");
      })
      .catch(() => {
        shared.listeners.delete(listener);
        setStatus("text");
      });
  }, []);

  ownerRef.current.lost = () => {
    roomRef.current = null;
    setStatus("text");
  };
  ownerRef.current.reload = () => {
    roomRef.current = null;
    if (shared.losses > 2) setStatus("text");
    else ownerRef.current.activate();
  };
  ownerRef.current.activate = activate;

  useEffect(() => {
    const owner = ownerRef.current;
    activate();
    return () => {
      releaseRoom(owner);
      window.speechSynthesis?.cancel();
    };
  }, [activate]);

  // The script runner and the animation share one loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let cur: Pose = P("right", IDLE);
    let nextBlink = last + 1500;
    let blinkUntil = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last);
      last = now;
      const r = run.current;
      const current = active.beats[Math.min(r.index, active.beats.length - 1)];
      const text = current ? current.say[lang_.current] : "";

      if (current && playing && !r.finished) {
        if (voice && lang_.current === "en" && r.spoken !== r.index && typeof window !== "undefined" && window.speechSynthesis) {
          r.spoken = r.index;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.onstart = () => (speaking.current = true);
          utterance.onend = () => (speaking.current = false);
          utterance.onerror = () => (speaking.current = false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
        if (reduced) r.revealed = text.length;
        else if (r.revealed < text.length) r.revealed = Math.min(text.length, r.revealed + (dt / 1000) * CHARS_PER_SECOND);
        else if (!speaking.current) {
          r.holdLeft += dt;
          const hold = 1700 + Math.min(2500, text.length * 14);
          if (r.holdLeft >= hold && !reduced) {
            if (r.index < active.beats.length - 1) {
              r.index += 1;
              r.revealed = 0;
              r.holdLeft = 0;
              setIndex(r.index);
            } else {
              r.finished = true;
              setPlaying(false);
            }
          }
        }
        const whole = Math.floor(r.revealed);
        setShown((prev) => (prev === whole ? prev : whole));
      }

      const room = roomRef.current;
      if (!room) return;
      const talking = playing && !r.finished && (r.revealed < text.length || speaking.current) ? 1 : 0;
      const t = now / 1000;
      const gesture: Gesture = reduced ? "calm" : r.finished || !playing ? "calm" : current?.gesture ?? "calm";
      cur = blendPose(cur, P("right", gestureParts(gesture, t, talking)), 1 - Math.exp(-dt / 130));
      room.setPose(cur, { animate: false, replace: true });
      // Face: mouth follows speech, soft smile, a blink every few seconds.
      if (now > nextBlink) {
        blinkUntil = now + 140;
        nextBlink = now + BLINK_EVERY + Math.random() * 1800;
      }
      room.setFace({
        jaw: talking ? 0.2 + 0.3 * Math.abs(Math.sin(t * 10.5 + Math.sin(t * 3.1))) : 0,
        smile: gesture === "wave" ? 0.7 : talking ? 0.48 : 0.34,
        blink: now < blinkUntil ? 1 : 0,
        brow: gesture === "nod" || gesture === "open" ? 0.35 : 0.1,
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, playing, voice, reduced]);

  const go = (to: number) => {
    const i = Math.max(0, Math.min(active.beats.length - 1, to));
    run.current = { index: i, revealed: 0, holdLeft: 0, finished: false, spoken: -1 };
    setIndex(i);
    setShown(0);
    setPlaying(true);
    window.speechSynthesis?.cancel();
  };

  const finished = run.current.finished;
  const text = line.slice(0, Math.max(0, shown));
  const label = lang === "ru" ? "Virtual guide — real clinician nahi" : "Virtual guide — not a real clinician";

  return (
    <section className={"rv-glass overflow-hidden " + (className ?? "")} aria-label={lang === "ru" ? "PNA virtual physio guide" : "PNA virtual physio guide"} data-rv-guide>
      <div className={"relative w-full bg-[#e8eef3] " + (compact ? "aspect-[16/11]" : "aspect-[4/3] sm:aspect-[16/10]")}>
        <div ref={hostRef} className="absolute inset-0" role="img" aria-label="3D virtual physiotherapist guide" />
        {status !== "active" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#e8eef3] p-4 text-center" role="status">
            {status === "text" ? (
              <>
                <Stethoscope className="h-10 w-10 text-teal-600" aria-hidden="true" />
                <p className="max-w-md text-[15px] font-semibold leading-6 text-navy-800">{line}</p>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-navy-800">{lang === "ru" ? "Guide aa raha hai…" : "Your guide is arriving…"} {Math.round(progress * 100)}%</span>
                <span className="h-1.5 w-40 overflow-hidden rounded-full bg-white">
                  <span className="block h-full rounded-full bg-teal-500 transition-[width]" style={{ width: `${Math.max(6, progress * 100)}%` }} />
                </span>
              </>
            )}
          </div>
        ) : null}
        <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-teal-800 shadow-sm">
          <Stethoscope className="h-3 w-3" aria-hidden="true" /> {label}
        </span>
        {status === "active" ? (
          <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 rounded-2xl rounded-bl-sm bg-[#0a1f3d]/92 px-3.5 py-2.5 text-[14px] font-semibold leading-[1.55] text-white shadow-lg sm:text-[15px]">
            <span className="mr-1.5 text-teal-300">Guide:</span>
            <span aria-hidden="true">{text}<span className="opacity-0">{line.slice(text.length)}</span></span>
            <span className="sr-only" aria-live="polite">{line}</span>
          </div>
        ) : null}
      </div>
      <div className="space-y-2.5 border-t border-slate-200 bg-white/85 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className="d3-btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" className="d3-btn" onClick={() => (finished ? go(0) : setPlaying((p) => !p))} aria-label={finished ? "Replay" : playing ? "Pause" : "Play"}>
            {finished ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button type="button" className="d3-btn" onClick={() => go(index + 1)} disabled={index >= active.beats.length - 1} aria-label="Next"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          <span className="ml-1 flex items-center gap-1" aria-hidden="true">
            {active.beats.map((_, i) => <span key={i} className={"h-1.5 rounded-full transition-all " + (i === index ? "w-5 bg-teal-500" : "w-1.5 bg-slate-300")} />)}
          </span>
          {lang === "en" ? (
            <button type="button" onClick={() => setVoice((v) => !v)} aria-pressed={voice} className={"d3-btn ml-auto " + (voice ? "d3-on" : "")} aria-label="Spoken guidance" title="Spoken guidance (English)">
              {voice ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
            </button>
          ) : (
            <span className="ml-auto text-[11px] font-semibold text-slate-500">{lang === "ru" ? "Awaaz sirf English mein; Roman Urdu subtitles ke saath." : ""}</span>
          )}
        </div>
        {topics.length ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={lang === "ru" ? "Guide se poochein" : "Ask the guide"}>
            {active.id ? (
              <button type="button" className="rv-pill" onClick={() => restart(beats, null)}>{lang === "ru" ? "← Wapis" : "← Back"}</button>
            ) : null}
            {topics.map((topic) => (
              <button key={topic.id} type="button" className={"rv-pill " + (active.id === topic.id ? "rv-pill-on" : "")} onClick={() => restart(topic.beats, topic.id)}>
                {topic.label[lang]}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
