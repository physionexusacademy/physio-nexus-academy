"use client";

/**
 * The PNA Teacher's teaching stage inside a PNA Teacher lesson: the AI teaching assistant demonstrates a
 * manual-therapy technique on the shared 3D patient (see lib/avatar). Subtitles are always shown; voice is optional (English, free
 * browser speech). No camera, no microphone. Light mode (low-end phones, reduced motion, or the visitor's choice) shows one static pose
 * and no patient. Everything 3D loads in the browser only, after the visitor scrolls the demonstration into view.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Hand, Pause, Play, RotateCcw, Rotate3d, SkipBack, SkipForward, Snail, Volume2, VolumeX, Zap } from "lucide-react";
import type { ExamRoom } from "@/lib/virtual-patient/engine";
import { useRoomClaim } from "@/components/skills/useRoomClaim";
import { drawOverlay, type Env } from "@/components/skills/Scene3DPlayer";
import { resolvePoint } from "@/lib/skills/points3d";
import { plain } from "@/lib/avatar/text";
import AskPanel from "./AskPanel";
import { useLang } from "@/lib/lang";
import { unlockAudio } from "@/lib/speech/voices";
import { useVoice } from "@/lib/speech/preference";
import { VoiceHint } from "@/components/speech/VoiceHint";
import { recordedPacks, warmPack } from "@/lib/speech/recorded";
import { AVATAR_LABEL, AVATAR_NOTICE } from "@/lib/avatar/labels";
import type { BuiltChoreo } from "@/lib/avatar/choreo/built";
import type { StageView, TeachingStage } from "@/lib/avatar/stage";
import type { PnaTeacher } from "@/lib/avatar/teacher";
import "@/components/skills/scene3d.css";
import "./avatar.css";

const SPEEDS = [0.75, 1, 1.25, 1.5];
const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked */
  }
};

export default function AvatarStage({ demoKey, title, onFail }: { demoKey: string; title: string; say?: string; onFail: () => void }) {
  const slug = demoKey.replace(/^avatar\//, "");
  const { hostRef, roomRef, status, progress, poster, visible, posed, activate, mine } = useRoomClaim(true, onFail);
  const [lang, setLang] = useLang();
  const ur = lang === "ur";
  const [choreo, setChoreo] = useState<BuiltChoreo | null>(null);
  const [view, setView] = useState<StageView | null>(null);
  const [svg, setSvg] = useState<ReactNode>(null);
  // The voice is ON by default (one setting for every model, remembered); `speakNow` is true once this browser lets sound play.
  const { voice, setVoice, supported: voiceOk, speaking: speakNow } = useVoice();
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [turn, setTurn] = useState(false);
  const [light, setLight] = useState<boolean | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(false);
  const stageRef = useRef<TeachingStage | null>(null);
  const docRef = useRef<PnaTeacher | null>(null);
  const langRef = useRef(lang);
  // The latest voice and speed settings: the stage is built a few seconds after the first tap (dynamic imports, the character), and a setting changed meanwhile must not be lost.
  const settingsRef = useRef({ voice: false, speed: 1 });
  const sizeRef = useRef({ w: 600, h: 400 });
  const viewKey = useRef("");
  langRef.current = lang;
  settingsRef.current = { voice: speakNow, speed };

  // What this device can do.
  useEffect(() => {
    setSpeed(Number(read("pna-avatar-speed")) || 1);
    void import("@/lib/avatar/teacher").then((m) => setLight(m.detectLightMode()));
  }, []);

  // Whether this demonstration's lines are recorded in the language shown, and a head start on downloading them.
  useEffect(() => {
    if (!voice || !voiceOk) {
      setVoiceNote(null);
      return;
    }
    let cancelled = false;
    void recordedPacks().then((packs) => {
      if (cancelled) return;
      const pack = `${ur ? "ur-" : ""}avatar-${slug}`;
      const english = packs.includes(`avatar-${slug}`);
      if (packs.includes(pack)) {
        setVoiceNote(null);
        warmPack(pack);
      } else if (ur && english) {
        // some lines are read in English in this demonstration (technical wording), so its English recording is the one to warm
        setVoiceNote("Is demonstration ki Roman Urdu awaaz abhi nahi hai, is liye subtitles chalenge.");
      } else setVoiceNote(ur ? "Is demonstration ki awaaz abhi nahi hai, is liye subtitles chalenge." : "This demonstration has no recorded voice yet, so it plays with subtitles.");
    });
    return () => {
      cancelled = true;
    };
  }, [voice, voiceOk, ur, slug]);

  // The choreography (static JSON: not part of the worker).
  useEffect(() => {
    let cancelled = false;
    fetch(`/teacher/choreo/${slug}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: BuiltChoreo) => !cancelled && setChoreo(data))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const draw = useCallback(
    (v: StageView) => {
      const room = roomRef.current;
      const host = hostRef.current;
      if (!room || !host) return;
      // The page around the picture only changes a few times a second (a new step or line, play or pause, the percentage): re-rendering it on every
      // frame would compete with the 3D drawing for the same thread. Only the overlay lines, which must follow the moving body, update every frame.
      const key = [v.step, v.lineIndex, v.started, v.playing, v.done, v.speaking, v.extra?.text ?? "", Math.round(v.progress * 100), v.notes.length, v.link?.href ?? ""].join("|");
      if (key !== viewKey.current) {
        viewKey.current = key;
        setView(v);
      }
      if (!v.overlays.length) return setSvg((prev) => (prev === null ? prev : null));
      const w = host.clientWidth || 600, h = host.clientHeight || 400;
      sizeRef.current = { w, h };
      const side = v.ctx.side;
      const env: Env = { room, side, ctx: v.ctx, w, h, P: (s, axis) => room.project(resolvePoint(room, s, side, axis)), W: (s, axis) => resolvePoint(room, s, side, axis) };
      setSvg(<>{v.overlays.map((o, i) => drawOverlay(o, i, env))}</>);
    },
    [hostRef, roomRef],
  );

  // Build the stage when the shared 3D patient is ours and the choreography has arrived.
  useEffect(() => {
    const room = roomRef.current;
    if (status !== "active" || !room || !choreo || light === null) return;
    let cancelled = false;
    let raf = 0;
    setBuilding(true);
    (async () => {
      try {
        const [{ PnaTeacher }, { TeachingStage }] = await Promise.all([import("@/lib/avatar/teacher"), import("@/lib/avatar/stage")]);
        if (cancelled) return;
        // The character is built once per mount; it is rebuilt if light mode is switched (light mode changes its animation set).
        if (docRef.current && docRef.current.light !== light) {
          docRef.current.dispose();
          docRef.current = null;
        }
        if (!docRef.current) {
          docRef.current = await PnaTeacher.create({ light });
          if (cancelled) return;
        }
        const stage = new TeachingStage(room, docRef.current, choreo, { lang: langRef.current, voice: settingsRef.current.voice, speed: settingsRef.current.speed, light }, draw);
        stageRef.current = stage;
        stage.init();
        posed.current = true;
        room.viewInsetTop = 0;
        room.controls.enabled = turn;
        setBuilding(false);
        let last = performance.now();
        const tick = (now: number) => {
          raf = requestAnimationFrame(tick);
          const dt = (now - last) / 1000;
          last = now;
          if (!mine() || !visible.current) return;
          stage.tick(dt);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        console.error("[pna-teacher] could not start the demonstration", e);
        if (!cancelled) {
          setBuilding(false);
          setError(true);
          onFail();
        }
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stageRef.current?.dispose();
      stageRef.current = null;
      setSvg(null);
    };
    // The stage is rebuilt only when the 3D view, the choreography or light mode changes; the other settings are pushed to it below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, choreo, light]);

  useEffect(() => () => {
    docRef.current?.dispose();
    docRef.current = null;
  }, []);

  useEffect(() => {
    stageRef.current?.setLang(lang);
  }, [lang]);
  useEffect(() => {
    stageRef.current?.setVoice(speakNow);
  }, [speakNow]);
  useEffect(() => {
    stageRef.current?.setSpeed(speed);
  }, [speed]);
  useEffect(() => {
    const room = roomRef.current as ExamRoom | null;
    if (!room) return;
    room.controls.enabled = turn;
    room.renderer.domElement.style.touchAction = turn ? "none" : "pan-y";
    room.renderer.domElement.style.cursor = turn ? "grab" : "default";
  }, [turn, status, roomRef]);

  const stage = () => stageRef.current;
  const toggle = () => {
    if (status !== "active") activate();
    const s = stage();
    if (!s) return;
    if (!view?.started) s.start();
    else if (s.playing) s.pause();
    else s.play();
  };
  const started = Boolean(view?.started);
  const keys = (event: React.KeyboardEvent) => {
    // Let real controls keep their own keys (Space/Enter on a button, arrows in a select or text box).
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    const onControl = event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement;
    if ((event.key === " " || event.key === "k") && onControl) return;
    if (event.key === " " || event.key === "k") {
      event.preventDefault();
      toggle();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stage()?.next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stage()?.prev();
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      stage()?.restart();
    }
  };

  // The 3D host must exist from the first render (the visibility observer attaches once), so there is no early return while loading.
  const line = view?.line;
  const extra = view?.extra ?? null;
  const english = Boolean(line?.urFallback) && !extra;
  const tour = choreo?.kind === "tour";
  const idle = tour ? (ur ? "Play dabaiye — PNA Teacher academy ka tour karwayega." : "Press play and the PNA Teacher will show you around the academy.") : ur ? "Play dabaiye — PNA Teacher technique dikhayega." : "Press play and the PNA Teacher will demonstrate the technique.";
  const subtitle = extra ? plain(extra.text) : line ? plain(ur && !english ? line.ur : line.en) : idle;
  const stepTitle = choreo ? choreo.title[ur ? "ur" : "en"] : title;
  const subTag = extra ? extra.tag : view?.chip ? `${view.chip} · ${view.step + 1}/${view.steps}` : stepTitle;
  const chipOn = view?.step ?? 0;
  const draft = choreo ? choreo.review.status !== "reviewed" : false;

  return (
    <figure className="s3 av-focus" data-demo3d={demoKey} data-avatar="pna-teacher" tabIndex={0} onKeyDown={keys} aria-label={`${AVATAR_LABEL}: ${stepTitle}. Space plays or pauses, arrow keys change step, R replays.`}>
      <div className="s3-view av-view">
        <div ref={hostRef} className="absolute inset-0" role="img" aria-label={`3D demonstration by the ${AVATAR_LABEL}: ${title}`} />
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-3"><span className="pointer-events-auto"><VoiceHint ur={ur} /></span></div>
        <span className="s3-corner tl" /><span className="s3-corner tr" /><span className="s3-corner bl" /><span className="s3-corner br" />
        {status === "active" ? <span className="s3-scan" aria-hidden="true" /> : null}
        {status === "parked" || status === "idle" ? (
          <button type="button" onClick={() => { if (voice) unlockAudio(); activate(); }} className="absolute inset-0 z-[5] flex items-center justify-center bg-cover bg-center" style={poster ? { backgroundImage: `url(${poster})` } : undefined} aria-label={`Show the 3D demonstration: ${stepTitle}`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-[#06182f]/90 px-4 py-2 text-sm font-bold text-cyan-100 shadow-[0_0_24px_rgba(46,230,214,.45)]"><Play className="h-4 w-4" aria-hidden="true" /> {ur ? "PNA Teacher ka demo dekhein" : "Watch the PNA Teacher demonstrate"}</span>
          </button>
        ) : null}
        {error && !choreo ? (
          <p className="absolute inset-0 z-[5] flex items-center justify-center bg-[#06182f] px-6 text-center text-sm font-bold text-cyan-100">{ur ? "Yeh demonstration load nahi ho saka." : "This demonstration could not be loaded."}</p>
        ) : null}
        {!error && (status === "loading" || building || (!choreo && status === "active")) ? (
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-[#06182f]" role="status">
            <span className="text-sm font-bold text-cyan-100">{ur ? "PNA Teacher aa rahe hain…" : "Bringing in the PNA Teacher…"} {status === "loading" ? `${Math.round(progress * 100)}%` : ""}</span>
            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-cyan-300 transition-[width]" style={{ width: `${Math.max(8, (status === "loading" ? progress : 0.9) * 100)}%` }} /></span>
          </div>
        ) : null}
        {status === "active" && !building && choreo ? (
          <>
            <svg className="pointer-events-none absolute inset-0 z-[3] h-full w-full" viewBox={`0 0 ${sizeRef.current.w} ${sizeRef.current.h}`} aria-hidden="true">{svg}</svg>
            <div className="s3-label">
              <p>{AVATAR_LABEL}</p>
              <p>{stepTitle}</p>
              {draft ? <span className="av-badge" title="The hand placement and movement are a draft until the supervising physiotherapist has reviewed them.">Draft — pending clinical review</span> : null}
            </div>
            <div className="av-subs" aria-live="polite" role="status">
              <p className="av-subs-tag">{subTag}{english && ur ? " · English (guide wording)" : ""}</p>
              <p className={`av-subs-text${subtitle.length > 170 ? " long" : ""}`}>{subtitle}</p>
            </div>
            {!started ? (
              <button type="button" className="av-play" onClick={toggle} aria-label="Play the demonstration">
                <span><Play className="h-5 w-5" aria-hidden="true" /> {ur ? "Demo shuru karein" : "Play demonstration"}</span>
              </button>
            ) : null}
            {turn ? <p className="pointer-events-none absolute right-3 top-3 z-[4] rounded-full bg-[#06182f]/85 px-2.5 py-1 text-[11px] font-bold text-cyan-100">Drag to turn</p> : null}
          </>
        ) : null}
      </div>

      {status === "active" && !building && choreo ? (
        <div className="av-caption" aria-hidden="true">
          <p>{subTag}{english && ur ? " · English (guide wording)" : ""}</p>
          <p>{subtitle}</p>
        </div>
      ) : null}

      {view?.notes.length ? (
        <div className="av-notes" aria-label="Guide wording for this step">
          {view.notes.map((n) => (
            <p key={n.tag + n.text.src} className="av-note">
              <b>{n.tag}{n.text.urFallback && ur ? <em>English</em> : null}</b>
              <span>{n.text.en}</span>
            </p>
          ))}
        </div>
      ) : null}

      <div className="s3-chips" role="group" aria-label="Steps">
        {(choreo?.steps ?? []).map((s, i) => (
          <button key={s.chip} type="button" className={`s3-chip ${i === chipOn && started ? "on" : i < chipOn ? "done" : ""}`} onClick={() => { if (status !== "active") activate(); stage()?.goto(i); if (!stage()?.playing) stage()?.play(); }} aria-label={`Step ${i + 1}: ${s.chip}`}>
            <i>{i + 1}</i>{s.chip.replace(/^\d+\s/, "")}
          </button>
        ))}
      </div>

      {view?.link ? (
        <div className="av-link">
          <a href={view.link.href}>{ur ? view.link.label.ur : view.link.label.en} →</a>
        </div>
      ) : null}

      <figcaption className="s3-bar">
        <button type="button" className="s3-btn" onClick={toggle} aria-label={view?.playing ? "Pause" : view?.done ? "Replay" : "Play"}>
          {view?.playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : view?.done ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button type="button" className="s3-btn" onClick={() => stage()?.prev()} aria-label="Previous step" title="Previous step"><SkipBack className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" className="s3-btn" onClick={() => stage()?.next()} aria-label="Next step" title="Next step"><SkipForward className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" className="s3-btn" onClick={() => stage()?.restart()} aria-label="Replay from the start" title="Replay"><RotateCcw className="h-4 w-4" aria-hidden="true" /></button>
        <div className="s3-seg s3-lang" role="group" aria-label="Language">
          <button type="button" onClick={() => setLang("en")} aria-pressed={!ur}>EN</button>
          <button type="button" onClick={() => setLang("ur")} aria-pressed={ur} title="Roman Urdu mix">Urdu</button>
        </div>
        <label className="av-ctl text-[11px] font-bold text-cyan-100/80">
          <Snail className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Speed</span>
          <select className="rounded-full border border-cyan-300/30 bg-[#06182f] px-2 py-1 text-xs font-bold text-cyan-100" value={speed} onChange={(e) => { const v = Number(e.target.value); setSpeed(v); write("pna-avatar-speed", String(v)); }} aria-label="Speed">
            {SPEEDS.map((v) => <option key={v} value={v}>{v}×</option>)}
          </select>
        </label>
        <button type="button" className="s3-btn" onClick={() => { const v = !voice; if (v) unlockAudio(); setVoice(v); }} aria-pressed={voice && voiceOk} disabled={!voiceOk} title={voiceOk ? (ur ? "Awaaz: PNA Teacher ki recorded male awaaz" : "Voice: the PNA Teacher reads aloud (recorded male voice)") : "Voice is not available in this browser"} aria-label="Voice">
          {voice && voiceOk ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button type="button" className="s3-btn" onClick={() => setTurn((v) => !v)} aria-pressed={turn} title="Turn the view" aria-label="Turn the view"><Rotate3d className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" className="s3-btn" onClick={() => { const next = !(light ?? false); write("pna-avatar-light", next ? "1" : "0"); setLight(next); }} aria-pressed={Boolean(light)} title="Light mode: one still pose, no animation" aria-label="Light mode"><Zap className="h-4 w-4" aria-hidden="true" /></button>
        <span className="ml-auto hidden items-center gap-1 text-[11px] font-bold text-cyan-100/60 sm:inline-flex"><Hand className="h-3.5 w-3.5" aria-hidden="true" /> {Math.round((view?.progress ?? 0) * 100)}%</span>
      </figcaption>
      {tour ? <AskPanel ur={ur} onAnswer={(text, answerLang, tag) => { if (status !== "active") activate(); stage()?.interject(text, answerLang, tag); }} /> : null}
      {light ? (
        <p className="av-voice-note av-light-note" role="status">
          {ur ? "Abhi sirf saada still picture dikh rahi hai (light mode). Poora 3D demonstration patient ke saath dekhne ke liye bijli wala button dabayein." : "You are seeing the simple still picture (light mode). Press the lightning button for the full 3D demonstration with the patient."}{" "}
          <button type="button" className="underline" onClick={() => { write("pna-avatar-light", "0"); setLight(false); }}>{ur ? "Poora 3D dikhayein" : "Show the full 3D"}</button>
        </p>
      ) : null}
      {voice && voiceNote ? <p className="av-voice-note" role="status">{voiceNote}</p> : null}
      {voice && voiceOk ? (
        <p className="av-voice-note">
          {ur ? "Awaaz: recorded male awaaz (Psi), free Kokoro model se pehle se bani hui — aap ke device par kuch generate nahi hota." : "Voice: a recorded male voice (George), made offline with the free Kokoro model — nothing is generated on your device."}{" "}
          <a href="/voice/george/README.txt" className="underline">Credit and licence</a>
        </p>
      ) : null}
      <p className="av-foot">{AVATAR_LABEL}. {AVATAR_NOTICE}</p>
    </figure>
  );
}
