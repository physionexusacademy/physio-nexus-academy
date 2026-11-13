"use client";

/**
 * The Virtual Patient performing a Skills Lab measurement or test. One patient model is
 * loaded once and shared: opening another demo moves the same 3D view there, so switching
 * items is instant. Only the demo in use animates; the others keep a still picture.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Hand, Pause, Play, Rotate3d, RotateCcw, Snail } from "lucide-react";
import { ExamRoom, type Side } from "@/lib/virtual-patient/engine";
import { claimRoom, handOff, players, releaseRoom, shared, snapshot, type Owner } from "@/lib/virtual-patient/shared-room";
import { DEMO3D, type Demo3DSpec } from "@/lib/skills/demo3d";

const other = (side: Side): Side => (side === "left" ? "right" : "left");

/* ---------------- points and directions ---------------- */

function patientDir(room: ExamRoom, local: [number, number, number]) {
  return new THREE.Vector3(...local).applyQuaternion(room.patientRoot.quaternion).normalize();
}

function resolvePoint(room: ExamRoom, spec: string, side: Side, axis?: THREE.Vector3): THREE.Vector3 {
  const sign = side === "left" ? 1 : -1;
  if (spec.startsWith("^")) {
    const base = axis ?? new THREE.Vector3();
    const ref: Record<string, THREE.Vector3> = {
      up: new THREE.Vector3(0, 1, 0),
      down: new THREE.Vector3(0, -1, 0),
      front: patientDir(room, [0, 0, 1]),
      back: patientDir(room, [0, 0, -1]),
      head: patientDir(room, [0, 1, 0]),
      feet: patientDir(room, [0, -1, 0]),
      lat: patientDir(room, [sign, 0, 0]),
      med: patientDir(room, [-sign, 0, 0]),
    };
    return base.clone().addScaledVector(ref[spec.slice(1)] ?? ref.up, 0.25);
  }
  const [pair, weight] = spec.split("*");
  if (pair.includes("+")) {
    const [a, b] = pair.split("+");
    return resolvePoint(room, a, side).lerp(resolvePoint(room, b, side), weight ? Number(weight) : 0.5);
  }
  const tail = pair.endsWith(">");
  const [name, flag] = pair.replace(/>$/, "").split(":");
  const which: Side = flag === "o" ? other(side) : side;
  if (name.startsWith("@")) {
    try {
      return room.landmarkWorld(name.slice(1), flag === "m" ? "mid" : which);
    } catch {
      return new THREE.Vector3();
    }
  }
  return tail ? room.boneEnd(name, which) : room.boneWorld(name, which);
}

/** Camera for a demo: aimed between the start and end positions, far enough back to keep the whole movement in view. */
function frameFor(room: ExamRoom, spec: Demo3DSpec, side: Side) {
  const sign = side === "left" ? 1 : -1;
  const dir = patientDir(room, [spec.view[0] * sign, spec.view[1], spec.view[2]]);
  if (dir.y < 0.12) dir.setY(0.12).normalize();
  const points: THREE.Vector3[] = [];
  const targets = [spec.focus, spec.gonio?.moving, spec.push].filter((p): p is string => Boolean(p) && !p!.startsWith("^"));
  const focusAt: THREE.Vector3[] = [];
  for (const a of [spec.range[1], (spec.range[0] + spec.range[1]) / 2, spec.range[0]]) {
    room.setPose(spec.move(side, a), { animate: false, replace: true });
    focusAt.push(resolvePoint(room, spec.focus, side));
    targets.forEach((t) => points.push(resolvePoint(room, t, side)));
  }
  const centre = new THREE.Box3().setFromPoints([...focusAt, ...points]).getCenter(new THREE.Vector3()).lerp(focusAt[0].clone().add(focusAt[2]).multiplyScalar(0.5), 0.4);
  // Keep the moving parts inside the view: distance from their spread across the view direction.
  const spread = points.reduce((max, p) => {
    const off = p.clone().sub(centre);
    return Math.max(max, off.sub(dir.clone().multiplyScalar(off.dot(dir))).length());
  }, 0);
  return { centre, dir, distance: Math.max(spec.zoom, spread * 3.6) };
}

/* ---------------- timeline ---------------- */

type Phase = "start" | "move" | "end" | "back" | "manual";
const TIMES: Record<Demo3DSpec["kind"], [number, number, number, number]> = {
  rom: [800, 2400, 1400, 1800],
  length: [800, 2600, 1500, 1800],
  mmt: [800, 1500, 2900, 1200],
};
const PHASE_TEXT: Record<Demo3DSpec["kind"], Record<Phase, string>> = {
  rom: { start: "Starting position", move: "Moving through the range", end: "End of range — read the goniometer", back: "Back to the start", manual: "Your position" },
  length: { start: "Starting position", move: "Examiner slowly lengthens the muscle", end: "End of muscle length — read the angle", back: "Back to the start", manual: "Your position" },
  mmt: { start: "Starting position", move: "Patient moves against gravity", end: "Hold — examiner resists", back: "Relax", manual: "Your position" },
};
const ease = (t: number) => t * t * (3 - 2 * t);

function sample(kind: Demo3DSpec["kind"], ms: number, slow: boolean): { phase: Phase; f: number } {
  const times = TIMES[kind].map((t) => t * (slow ? 1.8 : 1));
  const total = times.reduce((sum, t) => sum + t, 0);
  let t = ms % total;
  if (t < times[0]) return { phase: "start", f: 0 };
  t -= times[0];
  if (t < times[1]) return { phase: "move", f: ease(t / times[1]) };
  t -= times[1];
  if (t < times[2]) return { phase: "end", f: 1 };
  t -= times[2];
  return { phase: "back", f: 1 - ease(t / times[3]) };
}

/* ---------------- overlays ---------------- */

type Screen = { x: number; y: number; visible: boolean };

function GoniometerOverlay({ axis, fixed, moving, reading }: { axis: Screen; fixed: Screen; moving: Screen; reading: number }) {
  if (!axis.visible) return null;
  const arm = (p: Screen, min: number) => {
    const dx = p.x - axis.x, dy = p.y - axis.y;
    const l = Math.hypot(dx, dy) || 1;
    const len = Math.min(130, Math.max(min, l));
    return { x: axis.x + (dx / l) * len, y: axis.y + (dy / l) * len };
  };
  const a = arm(fixed, 64);
  const b = arm(moving, 64);
  const ticks = Array.from({ length: 36 }, (_, k) => k * 10);
  return (
    <g aria-hidden="true">
      <circle cx={axis.x} cy={axis.y} r="30" fill="rgba(255,255,255,0.28)" stroke="rgba(10,31,61,0.55)" strokeWidth="1.2" />
      {ticks.map((deg) => {
        const r = (deg * Math.PI) / 180;
        const inner = deg % 90 === 0 ? 22 : 26;
        return <line key={deg} x1={axis.x + Math.cos(r) * inner} y1={axis.y + Math.sin(r) * inner} x2={axis.x + Math.cos(r) * 30} y2={axis.y + Math.sin(r) * 30} stroke="rgba(10,31,61,0.55)" strokeWidth="1" />;
      })}
      <line x1={axis.x} y1={axis.y} x2={a.x} y2={a.y} stroke="rgba(245,248,252,0.92)" strokeWidth="10" strokeLinecap="round" />
      <line x1={axis.x} y1={axis.y} x2={a.x} y2={a.y} stroke="#0a1f3d" strokeWidth="2" strokeLinecap="round" />
      <line x1={axis.x} y1={axis.y} x2={b.x} y2={b.y} stroke="rgba(46,230,214,0.9)" strokeWidth="10" strokeLinecap="round" />
      <line x1={axis.x} y1={axis.y} x2={b.x} y2={b.y} stroke="#0a1f3d" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      <circle cx={axis.x} cy={axis.y} r="6" fill="#fff" stroke="#0a1f3d" strokeWidth="2" />
      <g transform={`translate(${axis.x + 14}, ${axis.y < 110 ? axis.y + 18 : axis.y - 46})`}>
        <rect width="58" height="26" rx="9" fill="#0a1f3d" />
        <text x="29" y="18" textAnchor="middle" fontSize="14" fontWeight="800" fill="#2ee6d6">{reading}°</text>
      </g>
    </g>
  );
}

function ArrowOverlay({ at, dir, label, tone }: { at: Screen; dir: { x: number; y: number }; label: string; tone: "resist" | "move" }) {
  if (!at.visible) return null;
  const colour = tone === "resist" ? "#f5c542" : "#7cc4ff";
  const tail = { x: at.x - dir.x * 78, y: at.y - dir.y * 78 };
  const head = { x: at.x - dir.x * 12, y: at.y - dir.y * 12 };
  return (
    <g aria-hidden="true">
      <defs>
        <marker id={`d3-arrow-${tone}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={colour} />
        </marker>
      </defs>
      <line x1={tail.x} y1={tail.y} x2={head.x} y2={head.y} stroke="rgba(10,31,61,0.55)" strokeWidth="10" strokeLinecap="round" />
      <line x1={tail.x} y1={tail.y} x2={head.x} y2={head.y} stroke={colour} strokeWidth="6" strokeLinecap="round" markerEnd={`url(#d3-arrow-${tone})`} className="d3-push" />
      <text x={tail.x + (dir.x <= 0 ? 8 : -8)} y={tail.y - 8} textAnchor={dir.x <= 0 ? "start" : "end"} fontSize="12" fontWeight="800" fill="#0a1f3d" stroke="white" strokeWidth="3.5" paintOrder="stroke">{label}</text>
    </g>
  );
}

function StabiliseOverlay({ at }: { at: Screen }) {
  if (!at.visible) return null;
  return (
    <g aria-hidden="true">
      <circle cx={at.x} cy={at.y} r="15" fill="rgba(124,196,255,0.32)" stroke="#2f7fc8" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx={at.x} cy={at.y} r="4" fill="#2f7fc8" />
      <text x={at.x + 19} y={at.y + 4} fontSize="11.5" fontWeight="800" fill="#0a1f3d" stroke="white" strokeWidth="3.5" paintOrder="stroke">Stabilise</text>
    </g>
  );
}

/* ---------------- the player ---------------- */

type Frame = {
  phase: Phase;
  reading: number;
  gonio?: { axis: Screen; fixed: Screen; moving: Screen };
  push?: { at: Screen; dir: { x: number; y: number } };
  stab?: Screen;
};

export default function Demo3DPlayer({ demoKey, title, say, onFail }: { demoKey: string; title: string; say?: string; onFail: () => void }) {
  const spec = DEMO3D[demoKey];
  const hostRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<ExamRoom | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "active" | "parked">("idle");
  const [progress, setProgress] = useState(shared.progress);
  const [poster, setPoster] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("right");
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const [turn, setTurn] = useState(false);
  const [manual, setManual] = useState<number | null>(null);
  const [frame, setFrame] = useState<Frame>({ phase: "start", reading: 0 });
  const clock = useRef({ start: 0, pausedAt: 0 });
  const lastF = useRef(0);
  const visible = useRef(false);
  const baseRef = useRef<THREE.Vector3 | null>(null);
  const framing = useRef<ReturnType<typeof frameFor> | null>(null);
  /** True once the shared patient has been posed for this demo (so a still picture shows this test). */
  const posed = useRef(false);
  const ownerRef = useRef<Owner>({ lost: () => undefined, reload: () => undefined, activate: () => undefined, isVisible: () => visible.current, hasRoom: () => roomRef.current !== null });

  // The owner object stays the same; what its callbacks do is updated below.
  ownerRef.current.lost = () => {
    const room = roomRef.current;
    if (room && posed.current) setPoster(snapshot(room));
    posed.current = false;
    roomRef.current = null;
    setStatus("parked");
  };
  ownerRef.current.reload = () => {
    posed.current = false;
    roomRef.current = null;
    setPoster(null);
    // Rebuild once or twice; if the device keeps dropping 3D, use the simple diagram.
    if (shared.losses > 2) onFail();
    else ownerRef.current.activate();
  };

  const activate = useCallback(() => {
    const host = hostRef.current;
    if (!host || !spec) return;
    setStatus((s) => (s === "active" ? s : "loading"));
    const listener = (p: number) => setProgress(p);
    shared.listeners.add(listener);
    claimRoom(host, ownerRef.current)
      .then((room) => {
        shared.listeners.delete(listener);
        if (shared.owner !== ownerRef.current) return;
        roomRef.current = room;
        if (process.env.NODE_ENV !== "production") (window as unknown as { __pnaDemoRoom?: ExamRoom }).__pnaDemoRoom = room;
        setStatus("active");
      })
      .catch(() => {
        shared.listeners.delete(listener);
        onFail();
      });
  }, [spec, onFail]);
  ownerRef.current.activate = activate;

  // Start when the demo first scrolls into view (and pause the animation while it is off-screen).
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        // The demo that has just come into sight (opened or scrolled to) takes the 3D view; the
        // previous one keeps a still picture. When the demo holding the view scrolls away, pass it
        // to one that is still on screen.
        // (Two demos side by side can come into sight together: the one that took the view a moment ago keeps it.)
        const owner = shared.owner;
        const justClaimed = owner && owner !== ownerRef.current && owner.isVisible() && performance.now() - shared.claimedAt < 700;
        if (entry.isIntersecting && !roomRef.current && !justClaimed) activate();
        else if (!entry.isIntersecting && shared.owner === ownerRef.current) handOff(ownerRef.current);
      },
      { threshold: 0.35 },
    );
    observer.observe(host);
    const owner = ownerRef.current;
    players.add(owner);
    return () => {
      observer.disconnect();
      players.delete(owner);
      releaseRoom(owner);
    };
  }, [activate]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      setManual(1);
    }
  }, []);

  // Put the patient in position for this test and side, and frame the camera.
  useEffect(() => {
    const room = roomRef.current;
    if (status !== "active" || !room || !spec) return;
    const down = spec.position === "sidelying" ? (spec.down === "tested" ? side : other(side)) : undefined;
    room.setCasePosture(undefined);
    room.setPosition(spec.position, false, down ? { down } : {});
    if (spec.shift) room.patientRoot.position.addScaledVector(patientDir(room, [0, -1, 0]), spec.shift);
    room.patientRoot.updateMatrixWorld(true);
    baseRef.current = room.patientRoot.position.clone();
    framing.current = frameFor(room, spec, side);
    room.setPose(spec.move(side, spec.range[0]), { animate: false, replace: true });
    room.frameCamera(false, framing.current.centre, framing.current.distance, framing.current.dir);
    posed.current = true;
    clock.current = { start: performance.now(), pausedAt: 0 };
  }, [status, spec, side]);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;
    room.controls.enabled = turn;
    room.renderer.domElement.style.touchAction = turn ? "none" : "pan-y";
    room.renderer.domElement.style.cursor = turn ? "grab" : "default";
  }, [turn, status]);

  // Animation and overlays.
  useEffect(() => {
    const room = roomRef.current;
    if (status !== "active" || !room || !spec) return;
    let raf = 0;
    const [r0, r1] = spec.range;
    const angleAt = (f: number) => r0 + (r1 - r0) * f;
    const base = baseRef.current ?? room.patientRoot.position.clone();
    const mine = () => shared.owner === ownerRef.current;
    // Standing tests keep one point on the floor (rising onto the toes lifts the whole body).
    let plantedY: number | null = null;
    const poseAt = (a: number) => {
      if (spec.planted) {
        room.patientRoot.position.copy(base);
        room.patientRoot.updateMatrixWorld(true);
      }
      room.setPose(spec.move(side, a), { animate: false, replace: true });
      if (spec.planted) {
        const y = resolvePoint(room, spec.planted, side).y;
        if (plantedY === null) plantedY = y;
        room.patientRoot.position.y = base.y + (plantedY - y);
        room.patientRoot.updateMatrixWorld(true);
      }
    };
    if (spec.planted) {
      poseAt(r0);
      poseAt(angleAt(manual ?? lastF.current));
    }
    // Direction the examiner's hand pushes: towards the start (resistance) or towards the end (lengthening).
    const cache = { a: NaN, dir: new THREE.Vector3() };
    const pushDir = (a: number) => {
      if (!spec.push) return null;
      if (Math.abs(cache.a - a) > 0.5 || Number.isNaN(cache.a)) {
        const towardStart = spec.kind === "mmt";
        const step = Math.sign(r1 - r0) * (towardStart ? -4 : 4);
        poseAt(a + step);
        const ahead = resolvePoint(room, spec.push, side);
        poseAt(a);
        cache.a = a;
        cache.dir = ahead.sub(resolvePoint(room, spec.push, side)).normalize();
      }
      const here = resolvePoint(room, spec.push, side);
      const p = room.project(here);
      const q = room.project(here.clone().addScaledVector(cache.dir, 0.08));
      const dx = q.x - p.x, dy = q.y - p.y;
      const l = Math.hypot(dx, dy);
      return l > 0.5 ? { at: p, dir: { x: dx / l, y: dy / l } } : { at: p, dir: { x: 0, y: 1 } };
    };
    const draw = (phase: Phase, f: number, a: number) => {
      const next: Frame = { phase, reading: Math.round(spec.read ? spec.read(a) : Math.abs(a)) };
      if (spec.gonio) {
        const axisWorld = resolvePoint(room, spec.gonio.axis, side);
        next.gonio = {
          axis: room.project(axisWorld),
          fixed: room.project(resolvePoint(room, spec.gonio.fixed, side, axisWorld)),
          moving: room.project(resolvePoint(room, spec.gonio.moving, side, axisWorld)),
        };
      }
      const showPush = spec.kind === "mmt" ? phase === "end" || (phase === "manual" && f > 0.98) : spec.kind === "length" && (phase === "move" || phase === "end" || phase === "manual");
      if (showPush) next.push = pushDir(a) ?? undefined;
      if (spec.stab && phase !== "start") next.stab = room.project(resolvePoint(room, spec.stab, side));
      setFrame(next);
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (manual !== null || !mine()) return;
      if (!playing || !visible.current) {
        if (!clock.current.pausedAt) clock.current.pausedAt = now;
        return;
      }
      if (clock.current.pausedAt) {
        clock.current.start += now - clock.current.pausedAt;
        clock.current.pausedAt = 0;
      }
      const { phase, f } = sample(spec.kind, now - clock.current.start, slow);
      // While the examiner resists, the limb holds with a small effort tremor.
      const effort = spec.kind === "mmt" && phase === "end" ? 0.025 + 0.018 * Math.sin(now * 0.017) : 0;
      lastF.current = f;
      const a = angleAt(f - effort);
      poseAt(a);
      draw(phase, f, a);
      stillPhase = phase;
      stillAngle = a;
    };
    if (manual !== null) {
      const a = angleAt(manual);
      poseAt(a);
      draw("manual", manual, a);
    }
    raf = requestAnimationFrame(tick);
    // Redraw the overlays when the view is turned while the patient is still (the pose is cached, so no render loop).
    let stillPhase: Phase = "start";
    let stillAngle = angleAt(manual ?? 0);
    const off = room.onChange(() => {
      if (!mine() || (playing && manual === null)) return;
      draw(manual !== null ? "manual" : stillPhase, manual ?? lastF.current, manual !== null ? angleAt(manual) : stillAngle);
    });
    return () => {
      cancelAnimationFrame(raf);
      off();
    };
  }, [status, spec, side, playing, slow, manual]);

  if (!spec) return null;
  const phaseText = PHASE_TEXT[spec.kind][frame.phase];
  const showSay = spec.kind === "mmt" && say && frame.phase === "end";
  const label = spec.label ?? title;
  const fraction = manual ?? lastF.current;

  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-[#e8eef3]" data-demo3d={demoKey}>
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        <div ref={hostRef} className="absolute inset-0" role="img" aria-label={`3D patient demonstrating ${title} on the ${side} side`} />
        {status === "parked" || status === "idle" ? (
          <button type="button" onClick={activate} className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={poster ? { backgroundImage: `url(${poster})` } : undefined} aria-label={`Show ${title} in 3D`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0a1f3d]/90 px-4 py-2 text-sm font-bold text-white shadow-lg">
              <Play className="h-4 w-4" aria-hidden="true" /> Show in 3D
            </span>
          </button>
        ) : null}
        {status === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#e8eef3]" role="status">
            <span className="text-sm font-bold text-navy-800">Bringing in the patient… {Math.round(progress * 100)}%</span>
            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-white">
              <span className="block h-full rounded-full bg-teal-500 transition-[width]" style={{ width: `${Math.max(6, progress * 100)}%` }} />
            </span>
          </div>
        ) : null}
        {status === "active" ? (
          <>
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {frame.stab ? <StabiliseOverlay at={frame.stab} /> : null}
              {frame.gonio ? <GoniometerOverlay {...frame.gonio} reading={frame.reading} /> : null}
              {frame.push ? <ArrowOverlay at={frame.push.at} dir={frame.push.dir} label={spec.kind === "mmt" ? "Resist" : "Examiner moves"} tone={spec.kind === "mmt" ? "resist" : "move"} /> : null}
            </svg>
            <div className="pointer-events-none absolute left-2 top-2 max-w-[62%] rounded-xl bg-white/90 px-2.5 py-1 shadow-sm sm:left-2.5 sm:top-2.5 sm:max-w-[70%] sm:rounded-2xl sm:px-3 sm:py-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-teal-700">{spec.kind === "mmt" ? "Muscle test" : label}</p>
              <p className="text-xs font-bold leading-4 text-navy-800 sm:text-sm sm:leading-5" aria-live="polite">{phaseText}</p>
            </div>
            {showSay ? (
              <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 rounded-2xl rounded-bl-sm bg-[#0a1f3d]/90 px-3 py-2 text-[13px] font-semibold leading-5 text-white shadow-lg">
                <span className="mr-1 text-teal-300">You say:</span> “{say}”
              </div>
            ) : null}
            {turn ? <p className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-600">Drag to turn</p> : null}
          </>
        ) : null}
      </div>
      <figcaption className="flex flex-wrap items-center gap-1.5 border-t border-slate-200 bg-white px-2.5 py-2">
        <button type="button" onClick={() => { if (status !== "active") activate(); setManual(null); setPlaying((p) => (manual !== null ? true : !p)); }} className="d3-btn" aria-label={playing && manual === null ? "Pause" : "Play"}>
          {playing && manual === null ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
        <div className="inline-flex rounded-full border border-slate-200 p-0.5" role="group" aria-label="Side">
          {(["left", "right"] as Side[]).map((s) => (
            <button key={s} type="button" onClick={() => setSide(s)} aria-pressed={side === s} className={"rounded-full px-2.5 py-1 text-xs font-bold capitalize " + (side === s ? "bg-[#0a1f3d] text-white" : "text-slate-600")}>
              {s}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setSlow((v) => !v)} aria-pressed={slow} className={"d3-btn " + (slow ? "d3-on" : "")} title="Slow motion" aria-label="Slow motion">
          <Snail className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setTurn((v) => !v)} aria-pressed={turn} className={"d3-btn " + (turn ? "d3-on" : "")} title="Turn the view" aria-label="Turn the view">
          <Rotate3d className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            const room = roomRef.current;
            if (!room || !framing.current) return;
            room.frameCamera(true, framing.current.centre, framing.current.distance, framing.current.dir);
          }}
          className="d3-btn"
          title="Reset the view"
          aria-label="Reset the view"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <label className="ml-auto flex min-w-[120px] flex-1 items-center gap-2 text-[11px] font-bold text-slate-500 sm:max-w-[220px]">
          <Hand className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(fraction * 100)}
            onPointerDown={() => {
              if (status !== "active") return;
              setPlaying(false);
              setManual(lastF.current);
            }}
            onChange={(event) => {
              if (status !== "active") activate();
              setPlaying(false);
              setManual(Number(event.target.value) / 100);
            }}
            className="w-full accent-teal-600"
            aria-label={`Move through the ${spec.kind === "mmt" ? "test" : "range"} yourself`}
          />
        </label>
      </figcaption>
    </figure>
  );
}
