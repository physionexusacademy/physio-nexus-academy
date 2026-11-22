import { LM, type Baseline, type Frame, type LandmarkName, type Metric, type PointRef, type Reading, type SidePart, type SidedRef } from "./types.ts";

export type Pt = { x: number; y: number };
export type Side = "left" | "right";
const RAD = 180 / Math.PI;

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const midpoint = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** The interior angle at b between b-a and b-c, 0..180 degrees (a straight line is 180). */
export function angleAt(a: Pt, b: Pt, c: Pt): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const n = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (n === 0) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / n))) * RAD;
}

/**
 * The signed angle of the segment from -> to against the upward vertical (0 = pointing straight up, +90 = pointing right, -90 = left, 180 = down;
 * image coordinates, y grows downwards) or against the horizontal (0 = pointing right, +90 = pointing up).
 */
export function segmentAngle(from: Pt, to: Pt, ref: "vertical" | "horizontal"): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return ref === "vertical" ? Math.atan2(dx, -dy) * RAD : Math.atan2(-dy, dx) * RAD;
}

/** Which way the person faces in a side view: +1 towards the right of the image, -1 towards the left (the nose against the middle of the ears). */
export function facing(frame: Frame): 1 | -1 {
  const nose = frame.lm[LM.nose];
  const l = frame.lm[LM.leftEar];
  const r = frame.lm[LM.rightEar];
  const ears = l && r ? (l.v >= r.v ? l.x : r.x) : (l ?? r)?.x ?? 0.5;
  return nose && nose.x >= ears ? 1 : -1;
}

const cap = (part: string) => part.charAt(0).toUpperCase() + part.slice(1);
const named = (side: Side, part: SidePart) => `${side}${cap(part)}` as LandmarkName;

/** The side of the body nearest the camera in a side view: the one whose shoulder, hip, knee and ankle the model sees best. */
export function nearSide(frame: Frame): Side {
  const score = (side: Side) => (["shoulder", "hip", "knee", "ankle"] as SidePart[]).reduce((sum, part) => sum + (frame.lm[LM[named(side, part)]]?.v ?? 0), 0);
  return score("left") >= score("right") ? "left" : "right";
}

/** Which side is which: the side nearest the camera (side views) and the side the person is exercising (when they have said). */
export type Sides = { near: Side; tested?: Side };
const opposite = (side: Side): Side => (side === "left" ? "right" : "left");

/** The landmark a reference names for this frame, or null when it depends on a side that is not known. */
export function resolveRef(ref: string, sides: Sides): LandmarkName | null {
  const colon = ref.indexOf(":");
  if (colon < 0) return ref as LandmarkName;
  const which = ref.slice(0, colon);
  const part = ref.slice(colon + 1) as SidePart;
  let side: Side | undefined;
  if (which === "near") side = sides.near;
  else if (which === "far") side = opposite(sides.near);
  else if (which === "tested") side = sides.tested;
  else if (which === "other") side = sides.tested ? opposite(sides.tested) : undefined;
  return side ? named(side, part) : null;
}

type Located = { pt: Pt; v: number };
function locate(frame: Frame, ref: PointRef, sides: Sides): Located | null {
  if (typeof ref === "string") {
    const name = resolveRef(ref, sides);
    const lm = name ? frame.lm[LM[name]] : undefined;
    return lm ? { pt: { x: lm.x * frame.w, y: lm.y * frame.h }, v: lm.v } : null;
  }
  const a = locate(frame, ref.mid[0], sides);
  const b = locate(frame, ref.mid[1], sides);
  return a && b ? { pt: midpoint(a.pt, b.pt), v: Math.min(a.v, b.v) } : null;
}

/** The landmarks (and near/far parts) a point reference uses. */
export function partsOf(ref: PointRef): (LandmarkName | SidedRef)[] {
  return typeof ref === "string" ? [ref] : [...partsOf(ref.mid[0]), ...partsOf(ref.mid[1])];
}
/** Everything a metric needs to see (for the set-up check and for tests). `head` and `rotation` metrics are listed separately by their callers. */
export function metricParts(metric: Metric): (LandmarkName | SidedRef)[] {
  let refs: PointRef[] = [];
  switch (metric.kind) {
    case "joint": refs = [metric.a, metric.b, metric.c]; break;
    case "incline": refs = [metric.from, metric.to]; break;
    case "tilt": case "rotation": refs = [metric.a, metric.b]; break;
    case "offset": case "dist": refs = [metric.a, metric.b, ...metric.scale]; break;
    case "head": return [];
    case "diff": return [...new Set([...metricParts(metric.a), ...metricParts(metric.b)])];
  }
  return [...new Set(refs.flatMap(partsOf))];
}
/** True when the metric needs the face model. */
export const needsHead = (metric: Metric): boolean => metric.kind === "head" || (metric.kind === "diff" && (needsHead(metric.a) || needsHead(metric.b)));
/** True when the metric is measured against the person's own neutral width (so a baseline must be taken first). */
export const needsBaseline = (metric: Metric): boolean => metric.kind === "rotation" || (metric.kind === "diff" && (needsBaseline(metric.a) || needsBaseline(metric.b)));

export type ReadOptions = { minVisibility?: number; baseline?: Baseline; side?: Side; /** the side the person is exercising (for "tested:" and "other:" references) */ tested?: Side };

/**
 * One metric from one frame, or null when a landmark it needs is missing or below the minimum visibility, the face model is needed and absent, or a
 * baseline is needed and not taken yet. `options` can be the minimum visibility alone (a number).
 */
export function readMetric(metric: Metric, frame: Frame, options: number | ReadOptions = 0.5): Reading | null {
  const opts: ReadOptions = typeof options === "number" ? { minVisibility: options } : options;
  const minVis = opts.minVisibility ?? 0.5;
  const sides: Sides = { near: opts.side ?? nearSide(frame), tested: opts.tested };
  const get = (ref: PointRef) => locate(frame, ref, sides);
  let points: (Located | null)[] = [];
  let value: number;
  let confidence: number | null = null;
  switch (metric.kind) {
    case "joint": {
      points = [get(metric.a), get(metric.b), get(metric.c)];
      if (points.some((p) => !p)) return null;
      value = angleAt(points[0]!.pt, points[1]!.pt, points[2]!.pt);
      break;
    }
    case "incline": {
      points = [get(metric.from), get(metric.to)];
      if (points.some((p) => !p)) return null;
      value = segmentAngle(points[0]!.pt, points[1]!.pt, metric.ref);
      if (metric.byFacing) value *= facing(frame);
      break;
    }
    case "tilt": {
      points = [get(metric.a), get(metric.b)];
      if (points.some((p) => !p)) return null;
      value = segmentAngle(points[0]!.pt, points[1]!.pt, "horizontal");
      break;
    }
    case "offset": {
      points = [get(metric.a), get(metric.b), get(metric.scale[0]), get(metric.scale[1])];
      if (points.some((p) => !p)) return null;
      const length = dist(points[2]!.pt, points[3]!.pt);
      if (length === 0) return null;
      if ((metric.axis ?? "x") === "y") value = (points[0]!.pt.y - points[1]!.pt.y) / length;
      else value = ((points[1]!.pt.x - points[0]!.pt.x) / length) * (metric.byFacing ? facing(frame) : 1);
      break;
    }
    case "dist": {
      points = [get(metric.a), get(metric.b), get(metric.scale[0]), get(metric.scale[1])];
      if (points.some((p) => !p)) return null;
      const length = dist(points[2]!.pt, points[3]!.pt);
      if (length === 0) return null;
      value = dist(points[0]!.pt, points[1]!.pt) / length;
      break;
    }
    case "rotation": {
      points = [get(metric.a), get(metric.b)];
      if (points.some((p) => !p)) return null;
      const width = dist(points[0]!.pt, points[1]!.pt);
      const reference = opts.baseline?.[metric.id];
      if (!reference || reference <= 0) return null;
      value = Math.acos(Math.min(1, width / reference)) * RAD;
      break;
    }
    case "head": {
      if (!frame.head) return null;
      value = frame.head[metric.axis];
      confidence = frame.head.v;
      break;
    }
    case "diff": {
      const a = readMetric(metric.a, frame, opts);
      const b = readMetric(metric.b, frame, opts);
      if (!a || !b) return null;
      value = a.value - b.value;
      confidence = Math.min(a.confidence, b.confidence);
      break;
    }
  }
  if (!Number.isFinite(value)) return null;
  const c = confidence ?? Math.min(...points.map((p) => p!.v));
  if (c < minVis) return null;
  return { value: metric.abs ? Math.abs(value) : value, confidence: c };
}
