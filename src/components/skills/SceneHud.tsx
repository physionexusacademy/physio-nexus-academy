"use client";

/** Futuristic read-outs laid over a Skills Lab 3D scene: stat chips, gauges, ECG / pulse / breathing traces, scales, timers, tone curves. */
import { Heart } from "lucide-react";
import type { Ctx, Hud, Tone } from "@/lib/skills/scene-types";

export const TONE: Record<Tone, string> = { cyan: "#2ee6d6", amber: "#ffc65c", magenta: "#ff5bd8", green: "#5dff9d", red: "#ff5d6c", white: "#eaf6ff" };

const val = <T,>(v: T | ((c: Ctx) => T), c: Ctx): T => (typeof v === "function" ? (v as (c: Ctx) => T)(c) : v);
const fade = (u: number, when?: [number, number]) => {
  if (!when) return 1;
  const e = 0.025;
  if (u < when[0] || u > when[1]) return 0;
  return Math.min(1, (u - when[0]) / e, (when[1] - u) / e);
};

/* ---- wave forms (one beat / breath = phase 0–1) ---- */
const g = (x: number, c: number, w: number, a: number) => a * Math.exp(-((x - c) ** 2) / (2 * w * w));
const ecg = (p: number) => g(p, 0.12, 0.025, 0.12) + g(p, 0.27, 0.007, -0.16) + g(p, 0.3, 0.011, 1) + g(p, 0.335, 0.009, -0.26) + g(p, 0.55, 0.05, 0.3);
const pulse = (p: number) => g(p, 0.16, 0.07, 1) + g(p, 0.46, 0.1, 0.32);
const resp = (p: number) => 0.5 - 0.5 * Math.cos(p * Math.PI * 2);

function Wave({ kind, bpm, ms, label }: { kind: "ecg" | "pulse" | "resp" | "spo2"; bpm: number; ms: number; label?: string }) {
  const W = 210, H = 54, window = 3.2;
  const f = kind === "ecg" ? ecg : kind === "resp" ? resp : pulse;
  const pts: string[] = [];
  for (let i = 0; i <= 105; i++) {
    const t = ms / 1000 - ((105 - i) / 105) * window;
    const phase = (((t * bpm) / 60) % 1 + 1) % 1;
    const v = f(phase);
    pts.push(`${(i / 105) * W},${H - 6 - v * (H - 14) * (kind === "resp" ? 1 : 0.9)}`);
  }
  const beat = (((ms / 1000) * bpm) / 60) % 1;
  const colour = kind === "resp" ? TONE.amber : kind === "spo2" ? TONE.magenta : TONE.green;
  return (
    <div className="s3-card s3-card-wave">
      <div className="s3-card-head">
        <span>{label ?? (kind === "ecg" ? "Heart rhythm" : kind === "resp" ? "Breathing" : kind === "spo2" ? "SpO₂ signal" : "Pulse wave")}</span>
        <strong style={{ color: colour }}>
          {kind !== "resp" ? <Heart className="mr-1 inline h-3 w-3" style={{ transform: `scale(${beat < 0.18 ? 1.35 : 1})`, transition: "transform .12s" }} aria-hidden="true" /> : null}
          {Math.round(bpm)} <small>{kind === "resp" ? "/min" : "bpm"}</small>
        </strong>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-[54px] w-[210px]" aria-hidden="true">
        {[0.25, 0.5, 0.75].map((k) => <line key={k} x1="0" x2={W} y1={H * k} y2={H * k} stroke="rgba(120,190,255,.12)" />)}
        <polyline points={pts.join(" ")} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${colour})` }} />
        <circle cx={W} cy={pts[pts.length - 1].split(",")[1]} r="3" fill="#fff" />
      </svg>
    </div>
  );
}

function Bar({ h, c }: { h: Extract<Hud, { t: "bar" }>; c: Ctx }) {
  const v = Math.min(h.max, Math.max(h.min, h.value(c)));
  const pct = ((v - h.min) / (h.max - h.min)) * 100;
  const good = h.goodFrom !== undefined && h.goodTo !== undefined && v >= h.goodFrom && v <= h.goodTo;
  return (
    <div className="s3-card" style={{ minWidth: 168 }}>
      <div className="s3-card-head"><span>{h.label}</span><strong style={{ color: good ? TONE.green : TONE.cyan }}>{Math.round(v * 10) / 10}<small> {h.unit}</small></strong></div>
      <div className="relative mt-1 h-2 rounded-full bg-white/10">
        {h.goodFrom !== undefined && h.goodTo !== undefined ? <span className="absolute top-0 h-2 rounded-full bg-emerald-400/30" style={{ left: `${((h.goodFrom - h.min) / (h.max - h.min)) * 100}%`, width: `${((h.goodTo - h.goodFrom) / (h.max - h.min)) * 100}%` }} /> : null}
        <span className="absolute top-0 h-2 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${TONE.cyan}, ${good ? TONE.green : "#6f9bff"})`, boxShadow: `0 0 10px ${TONE.cyan}` }} />
        {(h.marks ?? []).map((m) => <span key={m.label} className="absolute top-[-3px] h-[14px] w-px bg-white/50" style={{ left: `${((m.at - h.min) / (h.max - h.min)) * 100}%` }} />)}
      </div>
      {h.marks?.length ? <div className="relative mt-1 h-3 text-[9px] font-semibold text-cyan-100/70">{h.marks.map((m) => <span key={m.label} className="absolute -translate-x-1/2" style={{ left: `${((m.at - h.min) / (h.max - h.min)) * 100}%` }}>{m.label}</span>)}</div> : null}
    </div>
  );
}

function ScaleBar({ h, c }: { h: Extract<Hud, { t: "scale" }>; c: Ctx }) {
  const step = h.step ?? 1;
  const v = Math.round(h.value(c) / step) * step;
  const n = Math.round((h.max - h.min) / step) + 1;
  return (
    <div className="s3-card" style={{ minWidth: 190 }}>
      <div className="s3-card-head"><span>{h.label}</span><strong style={{ color: TONE.amber }}>{v}</strong></div>
      <div className="mt-1.5 flex gap-[2px]">
        {Array.from({ length: n }, (_, i) => {
          const x = h.min + i * step;
          const on = x <= v;
          return <span key={x} className="h-3 flex-1 rounded-[3px]" style={{ background: on ? `hsl(${Math.max(0, 150 - (i / (n - 1)) * 150)} 95% 58%)` : "rgba(255,255,255,.12)", boxShadow: x === v ? "0 0 8px #fff" : "none" }} />;
        })}
      </div>
      {h.words?.[v] ? <p className="mt-1 text-[11px] font-bold text-cyan-100">{h.words[v]}</p> : null}
    </div>
  );
}

function Timer({ h, c }: { h: Extract<Hud, { t: "timer" }>; c: Ctx }) {
  const s = h.seconds(c);
  const over = h.target !== undefined && s > h.target;
  return (
    <div className="s3-card"><div className="s3-card-head"><span>{h.label}</span><strong style={{ color: over ? TONE.red : TONE.cyan, fontVariantNumeric: "tabular-nums" }}>{s.toFixed(1)}<small> s</small></strong></div>{h.target !== undefined ? <p className="mt-0.5 text-[10px] font-semibold text-cyan-100/70">cut-off {h.target} s</p> : null}</div>
  );
}

function Curve({ h, c }: { h: Extract<Hud, { t: "curve" }>; c: Ctx }) {
  const W = 168, H = 56;
  const pts = Array.from({ length: 41 }, (_, i) => `${(i / 40) * W},${H - 6 - Math.min(1, Math.max(0, h.resist(i / 40, c))) * (H - 14)}`);
  const a = Math.min(1, Math.max(0, h.angle(c)));
  const r = Math.min(1, Math.max(0, h.resist(a, c)));
  return (
    <div className="s3-card">
      <div className="s3-card-head"><span>{h.label}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-[56px] w-[168px]" aria-hidden="true">
        <polyline points={pts.join(" ")} fill="none" stroke={TONE.amber} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px ${TONE.amber})` }} />
        <circle cx={a * W} cy={H - 6 - r * (H - 14)} r="4.5" fill="#fff" />
        <line x1="0" x2={W} y1={H - 3} y2={H - 3} stroke="rgba(255,255,255,.25)" />
      </svg>
      <p className="flex justify-between text-[9px] font-semibold text-cyan-100/70"><span>start of range</span><span>end of range</span></p>
    </div>
  );
}

const DEFAULT_AT: Record<Hud["t"], "tl" | "tr" | "bl" | "br"> = { stat: "tr", bar: "br", wave: "bl", scale: "tr", timer: "tr", curve: "br" };

export function HudLayer({ hud, ctx }: { hud: Hud[]; ctx: Ctx }) {
  const corners: Record<"tl" | "tr" | "bl" | "br", { key: string; alpha: number; node: React.ReactNode }[]> = { tl: [], tr: [], bl: [], br: [] };
  hud.forEach((h, i) => {
    const alpha = fade(ctx.u, h.when);
    if (alpha <= 0) return;
    let node: React.ReactNode = null;
    if (h.t === "stat") {
      const tone = TONE[h.tone ?? "cyan"];
      node = (
        <div className="s3-card s3-card-stat" style={{ borderColor: `${tone}66` }}>
          <span className="s3-stat-label">{h.label}</span>
          <strong style={{ color: tone, textShadow: `0 0 14px ${tone}`, fontSize: val(h.value, ctx).length > 14 ? 15 : val(h.value, ctx).length > 8 ? 20 : undefined }}>{val(h.value, ctx)}</strong>
          {h.sub ? <span className="s3-stat-sub">{val(h.sub, ctx)}</span> : null}
        </div>
      );
    } else if (h.t === "bar") node = <Bar h={h} c={ctx} />;
    else if (h.t === "wave") node = <Wave kind={h.kind} bpm={val(h.bpm, ctx)} ms={ctx.ms} label={h.label} />;
    else if (h.t === "scale") node = <ScaleBar h={h} c={ctx} />;
    else if (h.t === "timer") node = <Timer h={h} c={ctx} />;
    else if (h.t === "curve") node = <Curve h={h} c={ctx} />;
    corners[h.at ?? DEFAULT_AT[h.t]].push({ key: `${h.t}-${i}`, alpha, node });
  });
  return (
    <>
      {(Object.keys(corners) as (keyof typeof corners)[]).map((pos) =>
        corners[pos].length ? (
          <div key={pos} className={`s3-hud s3-hud-${pos}`}>
            {corners[pos].map((item) => <div key={item.key} style={{ opacity: item.alpha }}>{item.node}</div>)}
          </div>
        ) : null,
      )}
    </>
  );
}
