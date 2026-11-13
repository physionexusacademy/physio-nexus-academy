"use client";

/**
 * A Skills Lab scene on the 3D Virtual Patient (see lib/skills/scene-types.ts): the patient is posed from the scene's
 * functions, a dermatome or nerve territory can glow on the skin, and futuristic overlays (beacons, touch, ribbons, tapes,
 * rings, a reflex hammer, devices) and read-outs follow the 3D points. The same shared patient as the other demos is used.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Hand, Pause, Play, Rotate3d, RotateCcw, Snail } from "lucide-react";
import type { ExamRoom, Side } from "@/lib/virtual-patient/engine";
import { SCENES } from "@/lib/skills/scenes";
import type { Ctx, Overlay, Scene, Tone, When } from "@/lib/skills/scene-types";
import { clearPointCache, patientDir, resolvePoint, setZoneAnchor } from "@/lib/skills/points3d";
import { useRoomClaim } from "./useRoomClaim";
import { addProps, clearProps } from "./scene-props";
import { HudLayer, TONE } from "./SceneHud";
import { useLang } from "@/lib/lang";
import { UR_BEATS, UR_CHIPS, UR_OPTIONS } from "@/lib/skills/ur/scene-captions";
import "./scene3d.css";

const other = (side: Side): Side => (side === "left" ? "right" : "left");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const fade = (u: number, when?: When) => {
  if (!when) return 1;
  const e = 0.025;
  if (u < when[0] || u > when[1]) return 0;
  return Math.min(1, (u - when[0]) / e, (when[1] - u) / e);
};

type Pt2 = { x: number; y: number; visible: boolean };

/* ------------------------------------------------------------------ */
/* Drawing helpers                                                     */
/* ------------------------------------------------------------------ */

function Tag({ x, y, text: full, tone = "cyan", w, h, anchor = "start" }: { x: number; y: number; text: string; tone?: Tone; w: number; h: number; anchor?: "start" | "end" | "middle" }) {
  // Long labels are shortened so the tag always fits on screen (shorter still on a phone).
  const per = 7.1;
  const maxChars = Math.max(14, Math.min(w < 520 ? 24 : 46, Math.floor((w * 0.72 - 16) / per)));
  const text = full.length > maxChars ? `${full.slice(0, maxChars - 1)}…` : full;
  const width = Math.max(34, text.length * per + 16);
  let left = anchor === "end" ? x - width : anchor === "middle" ? x - width / 2 : x;
  left = Math.min(w - width - 4, Math.max(4, left));
  const top = Math.min(h - 26, Math.max(4, y - 11));
  const c = TONE[tone];
  return (
    <g aria-hidden="true">
      <rect x={left} y={top} width={width} height={22} rx={8} fill="rgba(6,24,47,.88)" stroke={c} strokeOpacity={0.7} />
      <text x={left + width / 2} y={top + 15} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{text}</text>
    </g>
  );
}

const glow = (c: string) => ({ filter: `drop-shadow(0 0 5px ${c})` });

type Env = {
  room: ExamRoom;
  side: Side;
  ctx: Ctx;
  w: number;
  h: number;
  P: (spec: string, axis?: THREE.Vector3) => Pt2;
  W: (spec: string, axis?: THREE.Vector3) => THREE.Vector3;
};

function drawOverlay(o: Overlay, i: number, env: Env): ReactNode {
  const { ctx, w, h, P, W } = env;
  // A hammer stays in view a little after the strike (the rebound and the impact flash).
  const window: When | undefined = o.t === "hammer" ? [o.when[0], o.when[1] + 0.08] : "when" in o ? o.when : undefined;
  const a = fade(ctx.u, window);
  if (a <= 0) return null;
  const tone = "tone" in o && o.tone ? o.tone : "cyan";
  const c = TONE[tone];
  const text = (label: unknown, ...args: number[]) => (typeof label === "function" ? (label as (c: Ctx, ...n: number[]) => string)(ctx, ...args) : (label as string | undefined));

  if (o.t === "beacon") {
    const p = P(o.at);
    if (!p.visible) return null;
    const label = text(o.label);
    return (
      <g key={i} opacity={a} aria-hidden="true">
        <circle className="s3-ping" cx={p.x} cy={p.y} r="14" fill="none" stroke={c} strokeWidth="2" />
        <circle className="s3-ping s3-ping2" cx={p.x} cy={p.y} r="14" fill="none" stroke={c} strokeWidth="1.5" />
        <circle cx={p.x} cy={p.y} r="9.5" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.2" />
        <circle cx={p.x} cy={p.y} r="5" fill={c} style={glow(c)} />
        {label ? <Tag x={p.x + 16} y={p.y - 16} text={label} tone={tone} w={w} h={h} /> : null}
      </g>
    );
  }

  if (o.t === "touch") {
    const p = P(o.at);
    if (!p.visible) return null;
    const style = o.style ?? "tap";
    const ph = (ctx.ms % 1500) / 1500;
    let dx = 0, dy = 0, press = 0;
    let tip = { x: p.x, y: p.y };
    if (style === "tap") {
      const off = ph < 0.3 ? 1 - ease(ph / 0.3) : ph < 0.45 ? 0 : ph < 0.8 ? ease((ph - 0.45) / 0.35) : 1;
      dx = off * 40;
      dy = -off * 34;
      press = ph >= 0.3 && ph < 0.6 ? 1 : 0;
    } else if (style === "press") {
      const off = ph < 0.22 ? 1 - ease(ph / 0.22) : ph < 0.88 ? 0 : ease((ph - 0.88) / 0.12);
      dx = off * 40;
      dy = -off * 34;
      press = ph >= 0.2 && ph < 0.9 ? 1 : 0;
    } else if (o.to) {
      const q = P(o.to);
      const t = ph < 0.12 ? 0 : ph < 0.8 ? ease((ph - 0.12) / 0.68) : 1;
      tip = { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
      press = 1;
      dx = 0;
      dy = 0;
      const trailLength = t;
      return (
        <g key={i} opacity={a} aria-hidden="true">
          <line x1={p.x} y1={p.y} x2={p.x + (q.x - p.x) * trailLength} y2={p.y + (q.y - p.y) * trailLength} stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 7" style={glow(c)} />
          <line x1={tip.x} y1={tip.y} x2={tip.x + 38} y2={tip.y - 30} stroke="rgba(6,24,47,.6)" strokeWidth="14" strokeLinecap="round" />
          <line x1={tip.x} y1={tip.y} x2={tip.x + 38} y2={tip.y - 30} stroke="#eaf6ff" strokeWidth="9" strokeLinecap="round" style={glow(c)} />
          <circle cx={tip.x} cy={tip.y} r="5" fill={c} />
          {text(o.label) ? <Tag x={p.x + 14} y={p.y + 30} text={text(o.label)!} tone={tone} w={w} h={h} /> : null}
        </g>
      );
    }
    const r = press ? 8 + ((ctx.ms % 700) / 700) * 16 : 0;
    return (
      <g key={i} opacity={a} aria-hidden="true">
        {press ? <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={c} strokeWidth="2" opacity={1 - r / 26} /> : null}
        <line x1={p.x + dx} y1={p.y + dy} x2={p.x + dx + 38} y2={p.y + dy - 30} stroke="rgba(6,24,47,.6)" strokeWidth="14" strokeLinecap="round" />
        <line x1={p.x + dx} y1={p.y + dy} x2={p.x + dx + 38} y2={p.y + dy - 30} stroke="#eaf6ff" strokeWidth="9" strokeLinecap="round" style={glow(c)} />
        <circle cx={p.x + dx} cy={p.y + dy} r={press ? 6 : 4.5} fill={c} />
        {text(o.label) ? <Tag x={p.x + 14} y={p.y + 30} text={text(o.label)!} tone={tone} w={w} h={h} /> : null}
      </g>
    );
  }

  if (o.t === "path") {
    const pts = o.pts.map((s) => P(s)).filter((p) => p.visible);
    if (pts.length < 2) return null;
    const d = pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const width = o.width ?? 9;
    const mid = pts[Math.floor(pts.length / 2)];
    const label = text(o.label);
    return (
      <g key={i} opacity={a} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke={c} strokeOpacity=".2" strokeWidth={width + 10} />
        <path d={d} stroke={c} strokeOpacity=".7" strokeWidth={width} style={glow(c)} />
        <path d={d} stroke="#fff" strokeOpacity=".75" strokeWidth="2" />
        {o.flow ? <path className="s3-flow" d={d} stroke="#fff" strokeWidth={width * 0.55} strokeDasharray="1 22" /> : null}
        {label ? <Tag x={mid.x + 12} y={mid.y} text={label} tone={tone} w={w} h={h} /> : null}
      </g>
    );
  }

  if (o.t === "line" || o.t === "arrow") {
    const from = o.t === "line" ? o.from : o.at;
    const p = P(from);
    const q = P(o.to);
    if (!p.visible || !q.visible) return null;
    const grow = o.t === "line" && o.grow && o.when ? clamp01((ctx.u - o.when[0]) / Math.max(0.001, (o.when[1] - o.when[0]) * 0.4)) : 1;
    const ex = p.x + (q.x - p.x) * grow, ey = p.y + (q.y - p.y) * grow;
    const metres = o.t === "line" ? W(from).distanceTo(W(o.to)) : 0;
    const label = o.t === "line" ? text(o.label, metres) : text(o.label as never);
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    return (
      <g key={i} opacity={a} aria-hidden="true">
        <line x1={p.x} y1={p.y} x2={ex} y2={ey} stroke={c} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={o.t === "line" && o.dashed ? "6 6" : undefined} style={glow(c)} className={o.t === "line" && o.dashed ? "s3-dash" : undefined} />
        <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke={c} strokeWidth="2" />
        {o.t === "line" ? <circle cx={ex} cy={ey} r="4.5" fill="#fff" stroke={c} strokeWidth="2" /> : <polygon points={`${ex},${ey} ${ex - 12 * Math.cos(ang - 0.45)},${ey - 12 * Math.sin(ang - 0.45)} ${ex - 12 * Math.cos(ang + 0.45)},${ey - 12 * Math.sin(ang + 0.45)}`} fill={c} />}
        {label && grow > 0.85 ? <Tag x={(p.x + q.x) / 2 + 10} y={(p.y + q.y) / 2 - 8} text={label} tone={tone} w={w} h={h} /> : null}
      </g>
    );
  }

  if (o.t === "angle") {
    const v = W(o.vertex), A = W(o.a), B = W(o.b);
    const deg = (new THREE.Vector3().subVectors(A, v).angleTo(new THREE.Vector3().subVectors(B, v)) * 180) / Math.PI;
    const pv = P(o.vertex), pa = P(o.a), pb = P(o.b);
    if (!pv.visible) return null;
    const dirA = Math.atan2(pa.y - pv.y, pa.x - pv.x), dirB = Math.atan2(pb.y - pv.y, pb.x - pv.x);
    const R = 38;
    let d = dirB - dirA;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const sx = pv.x + R * Math.cos(dirA), sy = pv.y + R * Math.sin(dirA), ex = pv.x + R * Math.cos(dirB), ey = pv.y + R * Math.sin(dirB);
    const mid = dirA + d / 2;
    const label = text(o.label, deg) ?? `${Math.round(deg)}°`;
    return (
      <g key={i} opacity={a} aria-hidden="true" fill="none">
        <line x1={pv.x} y1={pv.y} x2={pv.x + 90 * Math.cos(dirA)} y2={pv.y + 90 * Math.sin(dirA)} stroke={c} strokeWidth="3" strokeOpacity=".9" style={glow(c)} />
        <line x1={pv.x} y1={pv.y} x2={pv.x + 90 * Math.cos(dirB)} y2={pv.y + 90 * Math.sin(dirB)} stroke={c} strokeWidth="3" strokeOpacity=".9" strokeDasharray="6 5" style={glow(c)} />
        <path d={`M${sx} ${sy} A${R} ${R} 0 0 ${d > 0 ? 1 : 0} ${ex} ${ey}`} stroke="#fff" strokeWidth="2.5" />
        <circle cx={pv.x} cy={pv.y} r="5" fill="#fff" stroke={c} strokeWidth="2" />
        <Tag x={pv.x + (R + 14) * Math.cos(mid)} y={pv.y + (R + 14) * Math.sin(mid)} text={label} tone={tone} w={w} h={h} />
      </g>
    );
  }

  if (o.t === "hammer") {
    const p = P(o.at);
    if (!p.visible) return null;
    const [w0, w1] = o.when;
    const t = clamp01((ctx.u - w0) / (w1 - w0));
    const after = ctx.u > w1 ? clamp01((ctx.u - w1) / 0.05) : 0;
    const L = 104;
    const sx = p.x > w * 0.55 ? -1 : 1; // swing in from the side with more room
    const theta = ctx.u <= w1 ? 62 * (1 - ease(t) * ease(t)) : 22 * ease(after);
    const rad = (theta * Math.PI) / 180;
    const pivot = { x: p.x + sx * 6, y: p.y - L };
    const tipX = pivot.x - sx * L * Math.sin(rad), tipY = pivot.y + L * Math.cos(rad);
    const hx = Math.cos(rad) * 12 * sx, hy = Math.sin(rad) * 12;
    const hit = ctx.u >= w1 && ctx.u < w1 + 0.045;
    return (
      <g key={i} aria-hidden="true" opacity={a}>
        <line x1={pivot.x} y1={pivot.y} x2={tipX} y2={tipY} stroke="rgba(6,24,47,.6)" strokeWidth="9" strokeLinecap="round" />
        <line x1={pivot.x} y1={pivot.y} x2={tipX} y2={tipY} stroke="#cfe7ff" strokeWidth="5" strokeLinecap="round" />
        <line x1={tipX - hx} y1={tipY - hy} x2={tipX + hx} y2={tipY + hy} stroke="#ff7a8a" strokeWidth="14" strokeLinecap="round" style={glow("#ff5d6c")} />
        {hit ? <><circle cx={p.x} cy={p.y} r="20" fill="none" stroke="#fff" strokeWidth="3" /><circle cx={p.x} cy={p.y} r="34" fill="none" stroke={c} strokeWidth="2" opacity=".7" /></> : null}
      </g>
    );
  }

  if (o.t === "ring") {
    const centre = W(o.at);
    const p0 = W(o.along[0]), p1 = W(o.along[1]);
    const axis = p1.clone().sub(p0).normalize();
    const ref = Math.abs(axis.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const u1 = new THREE.Vector3().crossVectors(axis, ref).normalize();
    const u2 = new THREE.Vector3().crossVectors(axis, u1).normalize();
    const r = typeof o.r === "function" ? o.r(ctx) : o.r;
    const pts: Pt2[] = [];
    for (let k = 0; k <= 36; k++) {
      const t = (k / 36) * Math.PI * 2;
      pts.push(env.room.project(centre.clone().addScaledVector(u1, Math.cos(t) * r).addScaledVector(u2, Math.sin(t) * r)));
    }
    if (pts.some((p) => !p.visible)) return null;
    const d = pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + "Z";
    const pc = P(o.at);
    const label = text(o.label, 2 * Math.PI * r);
    return (
      <g key={i} opacity={a} aria-hidden="true" fill="none">
        <path d={d} stroke={c} strokeOpacity=".25" strokeWidth="12" />
        <path d={d} stroke={c} strokeWidth="4" style={glow(c)} />
        <path d={d} stroke="#fff" strokeWidth="1.2" strokeOpacity=".8" strokeDasharray="3 5" />
        {label ? <Tag x={pc.x + 18} y={pc.y} text={label} tone={tone} w={w} h={h} /> : null}
      </g>
    );
  }

  if (o.t === "device") {
    const p = P(o.at);
    if (!p.visible) return null;
    const label = text(o.label);
    const beat = ((ctx.ms / 1000) * 1.2) % 1;
    let glyph: ReactNode = null;
    if (o.kind === "clip") {
      glyph = (
        <g transform={`translate(${p.x},${p.y}) rotate(-25)`}>
          <rect x="-20" y="-9" width="40" height="18" rx="6" fill="#0b2a4a" stroke="#cfe7ff" strokeWidth="1.5" />
          <rect x="-14" y="-4" width="12" height="8" rx="3" fill="#0a1830" />
          <circle cx="8" cy="0" r="3.4" fill={beat < 0.5 ? "#ff3d4f" : "#7a1a24"} style={glow("#ff3d4f")} />
        </g>
      );
    } else if (o.kind === "thermo") {
      glyph = (
        <g transform={`translate(${p.x},${p.y}) rotate(35)`}>
          <rect x="-4" y="-34" width="8" height="42" rx="4" fill="#eaf6ff" stroke="#0b2a4a" strokeWidth="1.4" />
          <rect x="-1.8" y="-24" width="3.6" height="30" rx="1.8" fill="#ff5d6c" />
          <circle cx="0" cy="10" r="7" fill="#ff5d6c" stroke="#0b2a4a" strokeWidth="1.4" />
        </g>
      );
    } else if (o.kind === "probe") {
      glyph = (
        <g transform={`translate(${p.x},${p.y}) rotate(-35)`}>
          <rect x="-7" y="-30" width="14" height="34" rx="6" fill="#0b2a4a" stroke="#cfe7ff" strokeWidth="1.5" />
          <rect x="-5" y="2" width="10" height="5" rx="2" fill="#2ee6d6" style={glow("#2ee6d6")} />
        </g>
      );
    } else if (o.kind === "meter") {
      glyph = (
        <g transform={`translate(${p.x},${p.y})`}>
          <rect x="-22" y="-22" width="44" height="44" rx="12" fill="#0b2a4a" stroke="#cfe7ff" strokeWidth="1.5" />
          <circle cx="0" cy="-3" r="13" fill="#06182f" stroke="#2ee6d6" />
          <line x1="0" y1="-3" x2="9" y2="-10" stroke="#ffc65c" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    } else if (o.kind === "cuff" && o.to) {
      const q = P(o.to);
      const inflate = 1 + 0.12 * Math.sin(ctx.ms / 260);
      glyph = (
        <g aria-hidden="true">
          <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(6,24,47,.55)" strokeWidth={34 * inflate} strokeLinecap="round" />
          <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#2f7fe0" strokeWidth={28 * inflate} strokeLinecap="round" style={glow("#2f7fe0")} />
          <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#cfe7ff" strokeOpacity=".55" strokeWidth="2" strokeDasharray="2 6" />
        </g>
      );
    }
    return (
      <g key={i} opacity={a} aria-hidden="true">
        {glyph}
        {label ? <Tag x={p.x + 24} y={p.y - 22} text={label} tone={tone} w={w} h={h} /> : null}
      </g>
    );
  }

  if (o.t === "plumb") {
    const base = W(o.from);
    const front = patientDir(env.room, [0, 0, 1]);
    const top = base.clone().setY(1.85);
    const pb = env.room.project(base.clone().setY(0.004)), pt = env.room.project(top);
    return (
      <g key={i} opacity={a} aria-hidden="true">
        <line x1={pb.x} y1={pb.y} x2={pt.x} y2={pt.y} stroke={TONE.white} strokeOpacity=".9" strokeWidth="2" strokeDasharray="7 6" style={glow("#fff")} className="s3-dash" />
        <circle cx={pb.x} cy={pb.y} r="4" fill="#fff" />
        {o.marks.map((m, k) => {
          const mp = W(m.at);
          const onLine = new THREE.Vector3(base.x, mp.y, base.z);
          const cm = mp.clone().sub(onLine).dot(front) * 100;
          const pm = env.room.project(mp);
          if (!pm.visible) return null;
          const bad = Math.abs(cm) > 3;
          const mc = bad ? TONE.amber : TONE.green;
          return (
            <g key={k}>
              <line x1={pm.x} y1={pm.y} x2={env.room.project(onLine).x} y2={env.room.project(onLine).y} stroke={mc} strokeWidth="2" />
              <circle cx={pm.x} cy={pm.y} r="5" fill={mc} stroke="#fff" strokeWidth="1.5" style={glow(mc)} />
              <Tag x={pm.x + 12} y={pm.y - 12} text={`${m.label} ${cm >= 0 ? "+" : ""}${cm.toFixed(0)} cm`} tone={bad ? "amber" : "green"} w={w} h={h} />
            </g>
          );
        })}
      </g>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* The player                                                          */
/* ------------------------------------------------------------------ */

type FrameState = { ctx: Ctx; svg: ReactNode; beat: number };

export default function Scene3DPlayer({ demoKey, title, onFail }: { demoKey: string; title: string; say?: string; onFail: () => void }) {
  const scene = SCENES[demoKey] as Scene | undefined;
  const { hostRef, roomRef, status, progress, poster, visible, posed, activate, mine } = useRoomClaim(Boolean(scene), onFail);
  const [side, setSide] = useState<Side>("right");
  const [lang, setLang] = useLang();
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const [turn, setTurn] = useState(false);
  const [manual, setManual] = useState<number | null>(null);
  const initialOptions = useMemo(() => Object.fromEntries((scene?.options ?? []).map((o) => [o.id, o.initial ?? o.choices[0].id])), [scene]);
  const [opt, setOpt] = useState<Record<string, string>>(initialOptions);
  const [frame, setFrame] = useState<FrameState>({ ctx: { side: "right", u: 0, ms: 0, opt: initialOptions }, svg: null, beat: 0 });
  const clock = useRef({ start: 0, pausedAt: 0 });
  const lastU = useRef(0);
  const framing = useRef<{ centre: THREE.Vector3; distance: number; dir: THREE.Vector3 } | null>(null);
  const base = useRef<THREE.Vector3 | null>(null);
  const baseQuat = useRef<THREE.Quaternion | null>(null);
  const zoneOn = useRef(false);
  const lastUi = useRef(0);

  useEffect(() => setOpt(initialOptions), [initialOptions]);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      setManual(0.5);
    }
  }, []);

  const loop = (scene?.loopMs ?? 10000) * (slow ? 1.8 : 1);

  /** Applies the scene at a loop position: pose, patient placement, face, glowing zone. */
  const apply = useCallback(
    (room: ExamRoom, sc: Scene, u: number, ms: number, o: Record<string, string>) => {
      const ctx: Ctx = { side, u, ms, opt: o };
      const origin = base.current ?? room.patientRoot.position.clone();
      const quat = baseQuat.current ?? room.patientRoot.quaternion.clone();
      const left = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
      const front = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
      const sticky = new THREE.Vector3();
      /** Puts the patient where the scene's root movement says, plus any offset that keeps the planted foot in place. */
      const place = (uu: number, c: Ctx) => {
        room.patientRoot.position.copy(origin).add(sticky);
        if (sc.root) {
          const r = sc.root(side, uu, c);
          room.patientRoot.position.addScaledVector(left, r.dx ?? 0).addScaledVector(front, r.dz ?? 0);
          if (r.ry !== undefined) room.patientRoot.rotation.y = (r.ry * Math.PI) / 180;
        }
        room.patientRoot.updateMatrixWorld(true);
        room.setPose(sc.pose?.(side, uu, c) ?? {}, { animate: false, replace: true });
      };
      if (sc.planted) {
        // Each planting window holds the foot where it was when the window began; the offset stays after the window ends.
        for (const [w0, w1] of sc.plantedWhen ?? [[0, 1]]) {
          if (u < w0) break;
          place(w0, { ...ctx, u: w0 });
          const target = resolvePoint(room, sc.planted, side);
          const uu = Math.min(u, w1);
          place(uu, { ...ctx, u: uu });
          sticky.add(target.sub(resolvePoint(room, sc.planted, side)));
        }
      }
      place(u, ctx);
      if (sc.face) room.setFace(sc.face(u, ctx));
      const wantZone = Boolean(sc.zone) && fade(u, sc.zone?.when) > 0;
      if (wantZone && !zoneOn.current) {
        room.highlightZone({ dermatomes: sc.zone!.dermatomes, nerves: sc.zone!.nerves, side }, sc.zone!.color ?? TONE.cyan);
        setZoneAnchor(room);
        zoneOn.current = true;
      } else if (!wantZone && zoneOn.current) {
        room.highlightZone(null);
        zoneOn.current = false;
      }
      if (zoneOn.current) room.pulseZone(0.5 + 0.5 * Math.sin(ms / 380), ms / 1000);
      return ctx;
    },
    [side],
  );

  // Put the patient in position and frame the camera whenever the scene or side changes.
  useEffect(() => {
    const room = roomRef.current;
    if (status !== "active" || !room || !scene) return;
    clearPointCache(room);
    room.viewInsetTop = window.innerWidth >= 640 ? 76 : 0; // keep the subject clear of the caption
    zoneOn.current = false;
    room.highlightZone(null);
    room.setCasePosture(undefined);
    room.setFace({ jaw: 0, blink: 0 });
    const downSide = scene.position === "sidelying" ? (scene.down === "tested" ? side : other(side)) : undefined;
    room.setPosition(scene.position, false, downSide ? { down: downSide } : {});
    if (scene.shift) room.patientRoot.position.addScaledVector(patientDir(room, [0, -1, 0]), scene.shift);
    room.patientRoot.updateMatrixWorld(true);
    base.current = room.patientRoot.position.clone();
    baseQuat.current = room.patientRoot.quaternion.clone();
    addProps(room, scene.props, { x: base.current.x, z: base.current.z });
    const plinth = room.scene.getObjectByName("plinth");
    if (plinth) plinth.visible = !(scene.hidePlinth ?? scene.position === "standing");
    const sign = side === "left" ? 1 : -1;
    const dir = patientDir(room, [scene.frame.view[0] * sign, scene.frame.view[1], scene.frame.view[2]]);
    if (dir.y < 0.1) dir.setY(0.1).normalize();
    let centre: THREE.Vector3;
    let distance = scene.frame.zoom;
    if (scene.frame.zone && scene.zone) {
      apply(room, scene, 0.5, 0, opt);
      const zb = room.zoneBounds();
      if (zb) {
        centre = zb.box.getCenter(new THREE.Vector3());
        distance = Math.max(scene.frame.zoom, zb.box.getSize(new THREE.Vector3()).length() * 1.9);
      } else centre = resolvePoint(room, scene.frame.focus, side);
    } else {
      const pts: THREE.Vector3[] = [];
      for (const u of [0.08, 0.3, 0.5, 0.7, 0.92]) {
        apply(room, scene, u, u * (scene.loopMs ?? 1000), opt);
        pts.push(resolvePoint(room, scene.frame.focus, side), ...(scene.frame.around ?? []).map((s) => resolvePoint(room, s, side)));
      }
      const box = new THREE.Box3().setFromPoints(pts);
      centre = box.getCenter(new THREE.Vector3());
      const spread = pts.reduce((m, p) => {
        const off = p.clone().sub(centre);
        return Math.max(m, off.sub(dir.clone().multiplyScalar(off.dot(dir))).length());
      }, 0);
      distance = Math.max(scene.frame.zoom, spread * 3.4);
    }
    apply(room, scene, 0.001, 0, opt);
    framing.current = { centre, distance, dir };
    room.frameCamera(false, centre, distance, dir);
    posed.current = true;
    clock.current = { start: performance.now(), pausedAt: 0 };
    lastU.current = 0;
    return () => {
      clearProps(room);
      const shown = room.scene.getObjectByName("plinth");
      if (shown) shown.visible = true;
      room.highlightZone(null);
      room.viewInsetTop = 0;
      zoneOn.current = false;
    };
    // `apply`/`opt` are read once at start; later changes are handled by the animation effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, scene, side]);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;
    room.controls.enabled = turn;
    room.renderer.domElement.style.touchAction = turn ? "none" : "pan-y";
    room.renderer.domElement.style.cursor = turn ? "grab" : "default";
  }, [turn, status, roomRef]);

  // Animation and overlays.
  useEffect(() => {
    const room = roomRef.current;
    if (status !== "active" || !room || !scene) return;
    let raf = 0;
    const host = hostRef.current;
    const draw = (u: number, ms: number) => {
      const ctx = apply(room, scene, u, ms, opt);
      const w = host?.clientWidth ?? 600, h = host?.clientHeight ?? 400;
      const env: Env = { room, side, ctx, w, h, P: (s, axis) => room.project(resolvePoint(room, s, side, axis)), W: (s, axis) => resolvePoint(room, s, side, axis) };
      const beat = Math.max(0, scene.beats.findIndex((b) => u < b.to));
      setFrame({ ctx, svg: <>{(scene.overlays ?? []).map((o, i) => drawOverlay(o, i, env))}</>, beat: beat === -1 ? scene.beats.length - 1 : beat });
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
      const ms = now - clock.current.start;
      const u = (ms % loop) / loop;
      lastU.current = u;
      room.invalidate();
      if (now - lastUi.current > 30) {
        lastUi.current = now;
        draw(u, (ms % loop) / (slow ? 1.8 : 1));
      } else apply(room, scene, u, ms, opt);
    };
    if (manual !== null) draw(manual, manual * scene.loopMs);
    raf = requestAnimationFrame(tick);
    const off = room.onChange(() => {
      if (!mine() || (playing && manual === null)) return;
      draw(manual ?? lastU.current, (manual ?? lastU.current) * scene.loopMs);
    });
    return () => {
      cancelAnimationFrame(raf);
      off();
    };
  }, [status, scene, side, playing, slow, manual, opt, loop, apply, mine, roomRef, hostRef, visible]);

  if (!scene) return null;
  const beat = scene.beats[Math.min(frame.beat, scene.beats.length - 1)];
  const beatEn = typeof beat.text === "function" ? beat.text(frame.ctx) : beat.text;
  const ur = lang === "ur";
  const beatText = ur ? UR_BEATS[beatEn] ?? beatEn : beatEn;
  const chipText = (c: string) => (ur ? UR_CHIPS[c] ?? c : c);
  const optText = (c: string) => (ur ? UR_OPTIONS[c] ?? c : c);
  const u = manual ?? frame.ctx.u;
  const w = hostRef.current?.clientWidth ?? 600, h = hostRef.current?.clientHeight ?? 400;

  return (
    <figure className="s3" data-demo3d={demoKey} data-scene={scene.kind}>
      <div className="s3-view">
        <div ref={hostRef} className="absolute inset-0" role="img" aria-label={`3D patient demonstrating ${title}`} />
        <span className="s3-corner tl" /><span className="s3-corner tr" /><span className="s3-corner bl" /><span className="s3-corner br" />
        {status === "active" ? <span className="s3-scan" aria-hidden="true" /> : null}
        {status === "parked" || status === "idle" ? (
          <button type="button" onClick={activate} className="absolute inset-0 z-[5] flex items-center justify-center bg-cover bg-center" style={poster ? { backgroundImage: `url(${poster})` } : undefined} aria-label={`Show ${title} in 3D`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-[#06182f]/90 px-4 py-2 text-sm font-bold text-cyan-100 shadow-[0_0_24px_rgba(46,230,214,.45)]"><Play className="h-4 w-4" aria-hidden="true" /> Show in 3D</span>
          </button>
        ) : null}
        {status === "loading" ? (
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-[#06182f]" role="status">
            <span className="text-sm font-bold text-cyan-100">Bringing in the patient… {Math.round(progress * 100)}%</span>
            <span className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-cyan-300 transition-[width]" style={{ width: `${Math.max(6, progress * 100)}%` }} /></span>
          </div>
        ) : null}
        {status === "active" ? (
          <>
            <svg className="pointer-events-none absolute inset-0 z-[3] h-full w-full" viewBox={`0 0 ${w} ${h}`}>{frame.svg}</svg>
            <div className="s3-label">
              <p>{scene.title ?? title}</p>
              <p aria-live="polite">{beatText}</p>
            </div>
            {scene.hud ? <HudLayer hud={scene.hud} ctx={{ ...frame.ctx, u }} /> : null}
            {turn ? <p className="pointer-events-none absolute bottom-2.5 right-3 z-[4] rounded-full bg-[#06182f]/85 px-2.5 py-1 text-[11px] font-bold text-cyan-100">Drag to turn</p> : null}
          </>
        ) : null}
      </div>

      {status === "active" ? (
        <div className="s3-caption" aria-hidden="true">
          <p>{scene.title ?? title}</p>
          <p>{beatText}</p>
        </div>
      ) : null}

      {scene.beats.some((b) => b.chip) ? (
        <div className="s3-chips" role="group" aria-label="Steps">
          {scene.beats.map((b, i) => {
            if (!b.chip) return null;
            const state = i === frame.beat ? "on" : i < frame.beat ? "done" : "";
            return (
              <button key={i} type="button" className={`s3-chip ${state}`} onClick={() => { if (status !== "active") activate(); setPlaying(false); setManual(i === 0 ? 0.005 : scene.beats[i - 1].to + 0.01); }} aria-label={`Step ${i + 1}: ${chipText(b.chip)}`}>
                <i>{i + 1}</i>{chipText(b.chip)}
              </button>
            );
          })}
        </div>
      ) : null}

      {scene.options?.length ? (
        <div className="s3-opts">
          {scene.options.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-2">
              <span>{optText(o.label)}</span>
              <div className="s3-seg" role="group" aria-label={optText(o.label)}>
                {o.choices.map((ch) => (
                  <button key={ch.id} type="button" aria-pressed={opt[o.id] === ch.id} onClick={() => setOpt((prev) => ({ ...prev, [o.id]: ch.id }))}>{optText(ch.label)}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <figcaption className="s3-bar">
        <button type="button" className="s3-btn" onClick={() => { if (status !== "active") activate(); setManual(null); setPlaying((p) => (manual !== null ? true : !p)); }} aria-label={playing && manual === null ? "Pause" : "Play"}>
          {playing && manual === null ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
        <div className="s3-seg" role="group" aria-label="Side">
          {(["left", "right"] as Side[]).map((s) => (
            <button key={s} type="button" onClick={() => setSide(s)} aria-pressed={side === s} className="capitalize">{s}</button>
          ))}
        </div>
        <div className="s3-seg s3-lang" role="group" aria-label="Language">
          <button type="button" onClick={() => setLang("en")} aria-pressed={!ur}>EN</button>
          <button type="button" onClick={() => setLang("ur")} aria-pressed={ur} title="Roman Urdu mix">Urdu</button>
        </div>
        <button type="button" className="s3-btn" onClick={() => setSlow((v) => !v)} aria-pressed={slow} title="Slow motion" aria-label="Slow motion"><Snail className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" className="s3-btn" onClick={() => setTurn((v) => !v)} aria-pressed={turn} title="Turn the view" aria-label="Turn the view"><Rotate3d className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" className="s3-btn" title="Reset the view" aria-label="Reset the view" onClick={() => { const room = roomRef.current; if (room && framing.current) room.frameCamera(true, framing.current.centre, framing.current.distance, framing.current.dir); }}><RotateCcw className="h-4 w-4" aria-hidden="true" /></button>
        <label className="ml-auto flex min-w-[120px] flex-1 items-center gap-2 text-[11px] font-bold text-cyan-100/70 sm:max-w-[240px]">
          <Hand className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(u * 1000)}
            className="s3-range"
            aria-label={scene.scrub ?? "Move through the demonstration yourself"}
            onPointerDown={() => { if (status === "active") { setPlaying(false); setManual(lastU.current); } }}
            onChange={(event) => { if (status !== "active") activate(); setPlaying(false); setManual(Number(event.target.value) / 1000); }}
          />
        </label>
      </figcaption>
    </figure>
  );
}
