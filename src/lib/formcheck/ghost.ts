import { dist, nearSide, readMetric, resolveRef, type Pt, type Side } from "./geometry.ts";
import type { CameraSpec } from "./spec-types.ts";
import { LM, type Baseline, type Frame, type Landmark, type LandmarkName, type Metric, type PointRef } from "./types.ts";

/**
 * The ghost coach: where the moving part of the person's body has to be for the exercise's own measurement to read its target. It is SOLVED with the same `readMetric` that
 * the repetition counter uses, on a copy of the person's current pose with the moving part turned (or shifted) until the measurement reads the target. So the ghost is
 * never a drawing of what the exercise "should look like": when the person's body reaches it, the counter's number reaches the target, by construction. It is anchored to
 * the person (it follows them if they shift in the picture) and made fresh from every picture.
 *
 * Which part moves, and about what, follows from the measurement: a joint angle turns its distal end about the joint; an incline turns the far end about the near one; a tilt
 * of a line of landmarks (shoulders, knees) turns that line, and what hangs on it, about the middle of the hips; a head tilt (ears against shoulders) turns the head about
 * the neck; an offset slides one landmark (and what hangs on it) along its axis; a trunk rotation narrows the shoulders. A head turn from the face model has no skeleton
 * equivalent, and a position that is only held steady has no target to move to: those exercises get no ghost.
 */
export type Ghost = {
  /** the person's pose with the moving part at the target (normalised 0..1, like a frame's landmarks) */
  lm: Landmark[];
  /** the landmarks that moved */
  moved: number[];
  /** the landmark that travels furthest (where the target marker goes) */
  main: number;
  /** +1 or -1: which way an either-direction exercise (a side bend) goes, 0 when the exercise has one direction */
  dir: -1 | 0 | 1;
  /** how far the measurement of the ghost pose is from the target, in the measurement's own units (about 0) */
  error: number;
};

const RAD = 180 / Math.PI;
const HEAD: LandmarkName[] = ["nose", "leftEyeInner", "leftEye", "leftEyeOuter", "rightEyeInner", "rightEye", "rightEyeOuter", "leftEar", "rightEar", "mouthLeft", "mouthRight"];
const sideOf = (name: LandmarkName): Side => (name.startsWith("left") ? "left" : "right");
const part = (name: LandmarkName) => name.replace(/^(left|right)/, "").replace(/^./, (c) => c.toLowerCase());
const arm = (s: Side): LandmarkName[] => [`${s}Shoulder`, `${s}Elbow`, `${s}Wrist`, `${s}Pinky`, `${s}Index`, `${s}Thumb`] as LandmarkName[];
const leg = (s: Side): LandmarkName[] => [`${s}Hip`, `${s}Knee`, `${s}Ankle`, `${s}Heel`, `${s}FootIndex`] as LandmarkName[];
/** how far from the trunk a landmark is along its limb: the more distal end of a joint is the one that moves */
const REACH: Record<string, number> = { ear: 0, nose: 0, eye: 0, mouth: 0, shoulder: 1, hip: 1.2, elbow: 2, knee: 2.5, wrist: 3, pinky: 3.2, index: 3.2, thumb: 3.2, ankle: 3.5, heel: 4, footIndex: 4.2 };
const reach = (name: LandmarkName) => REACH[part(name)] ?? (name.includes("Eye") ? 0 : name.includes("mouth") ? 0 : 1);

/** What moves with a landmark when it is the moving part. */
function expand(name: LandmarkName, trunkMoves: boolean): LandmarkName[] {
  const p = part(name);
  const s = sideOf(name);
  if (HEAD.includes(name)) return HEAD;
  if (p === "shoulder") return trunkMoves ? [...HEAD, ...arm("left"), ...arm("right")] : arm(s);
  if (p === "elbow") return [`${s}Elbow`, `${s}Wrist`, `${s}Pinky`, `${s}Index`, `${s}Thumb`] as LandmarkName[];
  if (p === "wrist") return [`${s}Wrist`, `${s}Pinky`, `${s}Index`, `${s}Thumb`] as LandmarkName[];
  if (p === "hip") return [...leg("left"), ...leg("right")];
  if (p === "knee") return [`${s}Knee`, `${s}Ankle`, `${s}Heel`, `${s}FootIndex`] as LandmarkName[];
  if (p === "ankle") return [`${s}Ankle`, `${s}Heel`, `${s}FootIndex`] as LandmarkName[];
  return [name];
}

type Ctx = { side: Side; tested?: Side };
const names = (ref: PointRef, ctx: Ctx): LandmarkName[] => {
  if (typeof ref !== "string") return [...names(ref.mid[0], ctx), ...names(ref.mid[1], ctx)];
  const n = resolveRef(ref, { near: ctx.side, tested: ctx.tested });
  return n ? [n] : [];
};
const metricNames = (m: Metric, ctx: Ctx): LandmarkName[] => {
  switch (m.kind) {
    case "joint": return [...names(m.a, ctx), ...names(m.b, ctx), ...names(m.c, ctx)];
    case "incline": return [...names(m.from, ctx), ...names(m.to, ctx)];
    case "tilt": case "rotation": return [...names(m.a, ctx), ...names(m.b, ctx)];
    case "offset": case "dist": return [...names(m.a, ctx), ...names(m.b, ctx), ...names(m.scale[0], ctx), ...names(m.scale[1], ctx)];
    case "diff": return [...metricNames(m.a, ctx), ...metricNames(m.b, ctx)];
    case "head": return [];
  }
};

type Plan = { mover: LandmarkName[]; pivot: Pt | null; kind: "turn" | "slide" | "narrow"; axis?: "x" | "y"; /** for a slide: the length the measurement is a fraction of, in pixels */ scalePx?: number };

/** Which landmarks move, about what, and how, for this measurement; null when the measurement has no skeleton equivalent. */
function plan(metric: Metric, frame: Frame, ctx: Ctx): Plan | null {
  const px = (name: LandmarkName): Pt | null => { const p = frame.lm[LM[name]]; return p ? { x: p.x * frame.w, y: p.y * frame.h } : null; };
  const centre = (list: LandmarkName[]): Pt | null => {
    const pts = list.map(px).filter((p): p is Pt => p !== null);
    return pts.length && pts.length === list.length ? pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 }) : null;
  };
  switch (metric.kind) {
    case "joint": {
      const a = names(metric.a, ctx)[0]; const b = names(metric.b, ctx)[0]; const c = names(metric.c, ctx)[0];
      if (!a || !b || !c) return null;
      const mover = reach(c) >= reach(a) ? c : a;
      return { mover: expand(mover, false), pivot: px(b), kind: "turn" };
    }
    case "incline": {
      const from = names(metric.from, ctx); const to = names(metric.to, ctx);
      if (!from.length || !to.length) return null;
      return { mover: [...new Set(to.flatMap((n) => expand(n, true)))], pivot: centre(from), kind: "turn" };
    }
    case "tilt": {
      const ends = [...names(metric.a, ctx), ...names(metric.b, ctx)];
      const hips = centre(["leftHip", "rightHip"]);
      const trunk = ends.some((n) => part(n) === "shoulder");
      return { mover: [...new Set(ends.flatMap((n) => expand(n, trunk)))], pivot: hips ?? centre(ends), kind: "turn" };
    }
    case "diff": {
      if (metric.a.kind !== "tilt" || metric.b.kind !== "tilt") return null;
      const head = [...names(metric.a.a, ctx), ...names(metric.a.b, ctx)];
      const neck = centre([...names(metric.b.a, ctx), ...names(metric.b.b, ctx)]);
      return neck ? { mover: [...new Set(head.flatMap((n) => expand(n, false)))], pivot: neck, kind: "turn" } : null;
    }
    case "offset": {
      const b = names(metric.b, ctx);
      if (!b.length) return null;
      const s0 = names(metric.scale[0], ctx)[0]; const s1 = names(metric.scale[1], ctx)[0];
      const p0 = s0 ? px(s0) : null; const p1 = s1 ? px(s1) : null;
      if (!p0 || !p1) return null;
      return { mover: [...new Set(b.flatMap((n) => expand(n, false)))], pivot: null, kind: "slide", axis: metric.axis ?? "x", scalePx: dist(p0, p1) };
    }
    case "rotation": {
      const ends = [...names(metric.a, ctx), ...names(metric.b, ctx)];
      return { mover: [...new Set(ends.flatMap((n) => expand(n, false)))], pivot: centre(ends), kind: "narrow" };
    }
    default: return null;
  }
}

const turn = (p: Pt, c: Pt, deg: number): Pt => { const a = deg / RAD; const dx = p.x - c.x; const dy = p.y - c.y; return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) }; };

/**
 * The ghost pose(s) for the person's current frame, or null when the exercise has none or the parts it needs cannot be seen. An exercise that works in either direction
 * (a side bend) gets two, one each way. `baseline` is the person's neutral position (the measurement's zero).
 */
export function computeGhost(spec: CameraSpec, frame: Frame, baseline: Baseline, ctx: { tested?: Side; minVisibility?: number } = {}): Ghost[] | null {
  const primary = spec.primary;
  if (primary.mode === "hold-steady") return null;
  const metric = spec.metrics.find((m) => m.id === primary.metric);
  if (!metric || metric.kind === "head") return null;
  const side = nearSide(frame);
  const cx: Ctx = { side, tested: ctx.tested };
  const minVis = ctx.minVisibility ?? 0.5;
  // everything the measurement uses must be seen, or the ghost would be built on a guess
  const needed = metricNames(metric, cx);
  if (!needed.length || needed.some((n) => !frame.lm[LM[n]] || frame.lm[LM[n]].v < minVis)) return null;
  const how = plan(metric, frame, cx);
  if (!how || !how.mover.length || (how.kind !== "slide" && !how.pivot)) return null;

  const signedMetric = { ...metric, abs: false } as Metric;
  // an exercise that works either way gets a ghost each way; a trunk rotation is seen as the shoulders narrowing, which looks the same whichever way the person turns
  const eitherWay = !!metric.abs && metric.kind !== "rotation";
  const zero = primary.reference === "baseline" && metric.kind !== "rotation" ? baseline[metric.id] ?? 0 : 0;
  const read = (f: Frame, m: Metric) => readMetric(m, f, { minVisibility: 0, side, tested: ctx.tested, baseline })?.value ?? NaN;
  const px = frame.lm.map((p) => ({ x: p.x * frame.w, y: p.y * frame.h }));
  const idx = how.mover.map((n) => LM[n]);

  const build = (amount: number): Frame => {
    const lm = frame.lm.map((p) => ({ ...p }));
    for (const i of idx) {
      let q: Pt;
      if (how.kind === "turn") q = turn(px[i], how.pivot!, amount);
      else if (how.kind === "slide") q = how.axis === "y" ? { x: px[i].x, y: px[i].y + amount } : { x: px[i].x + amount, y: px[i].y };
      else q = { x: how.pivot!.x + (px[i].x - how.pivot!.x) * amount, y: px[i].y };
      lm[i] = { ...lm[i], x: q.x / frame.w, y: q.y / frame.h };
    }
    return { ...frame, lm };
  };

  // solve `amount` so that the measurement reads `want` (the target away from zero), by a few secant steps from the two obvious first guesses
  const solve = (want: number, m: Metric): { amount: number; error: number } | null => {
    const unit = how.kind === "slide" ? Math.max(1, Math.abs(want) * (how.scalePx ?? 100)) : Math.max(1, Math.abs(want));
    if (how.kind === "narrow") {
      const reference = baseline[metric.id];
      const width = reference && reference > 0 ? reference : 0;
      const now = (() => { const e = needed.map((n) => px[LM[n]]); return e.length >= 2 ? Math.hypot(e[0].x - e[1].x, e[0].y - e[1].y) : 0; })();
      if (!width || !now) return null;
      const f = build((width * Math.cos(Math.abs(want) / RAD)) / now);
      return { amount: 0, error: read(f, m) - Math.abs(want) };
    }
    const err = (a: number) => read(build(a), m) - zero - want;
    let best: { a: number; e: number } | null = null;
    for (const a0 of [unit, -unit, unit * 0.5, -unit * 0.5]) { const e0 = err(a0); if (Number.isFinite(e0) && (!best || Math.abs(e0) < Math.abs(best.e))) best = { a: a0, e: e0 }; }
    if (!best) return null;
    let { a, e } = best;
    let a1 = a + (how.kind === "slide" ? unit * 0.1 : 0.5);
    let e1 = err(a1);
    for (let i = 0; i < 8 && Number.isFinite(e1) && Math.abs(e) > 1e-4 * Math.max(1, Math.abs(want)); i++) {
      const slope = (e1 - e) / (a1 - a);
      if (!Number.isFinite(slope) || Math.abs(slope) < 1e-9) break;
      const next = a1 - e1 / slope;
      a = a1; e = e1; a1 = next; e1 = err(a1);
    }
    return Number.isFinite(e1) && Math.abs(e1) <= Math.abs(e) ? { amount: a1, error: e1 } : { amount: a, error: e };
  };

  const out: Ghost[] = [];
  const wants = eitherWay ? [primary.target, -primary.target] : [primary.target];
  for (const want of wants) {
    const m = eitherWay ? signedMetric : metric;
    const s = solve(want, m);
    // within 4% of the target (and, for an angle, within 0.3 degrees; for a ratio, within 0.0004)
    const tolerance = Math.max(0.04 * Math.abs(primary.target), how.kind === "slide" ? 0.0004 : 0.3);
    if (!s || Math.abs(s.error) > tolerance) continue;
    const built = how.kind === "narrow" ? build((baseline[metric.id] * Math.cos(Math.abs(want) / RAD)) / Math.max(1e-6, Math.hypot(px[LM[needed[0]]].x - px[LM[needed[1]]].x, px[LM[needed[0]]].y - px[LM[needed[1]]].y))) : build(s.amount);
    // the moving part is the whole body part, wherever it is now: when the person is ON the target the ghost sits on them, and that is when it should say so
    const moved: number[] = [...new Set<number>(idx)];
    const distance = new Map<number, number>();
    for (const i of moved) distance.set(i, Math.hypot((built.lm[i].x - frame.lm[i].x) * frame.w, (built.lm[i].y - frame.lm[i].y) * frame.h));
    // the marker goes on the part the measurement reads (the shoulders for a shoulder line, the knee for a hip angle), the one that travels furthest of those; else the furthest of all
    const read_ = moved.filter((i) => needed.some((n) => LM[n] === i));
    const pool = read_.length ? read_ : moved;
    const main = pool.reduce((best, i) => ((distance.get(i) ?? 0) > (distance.get(best) ?? 0) ? i : best), pool[0]);
    const lm = built.lm.map((p, i) => (moved.includes(i) ? p : frame.lm[i]));
    out.push({ lm, moved, main, dir: eitherWay ? (want > 0 ? 1 : -1) : 0, error: s.error });
  }
  return out.length ? out : null;
}

