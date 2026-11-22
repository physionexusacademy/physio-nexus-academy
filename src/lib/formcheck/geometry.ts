import { LM, type Frame, type LandmarkName, type Metric, type PointRef, type Reading } from "./types.ts";

export type Pt = { x: number; y: number };
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

type Located = { pt: Pt; v: number };
function locate(frame: Frame, ref: PointRef): Located | null {
  if (typeof ref === "string") {
    const lm = frame.lm[LM[ref]];
    return lm ? { pt: { x: lm.x * frame.w, y: lm.y * frame.h }, v: lm.v } : null;
  }
  const a = locate(frame, ref.mid[0]);
  const b = locate(frame, ref.mid[1]);
  return a && b ? { pt: midpoint(a.pt, b.pt), v: Math.min(a.v, b.v) } : null;
}

/** The landmarks a metric uses (for the visibility check). */
export function landmarksOf(ref: PointRef): LandmarkName[] {
  return typeof ref === "string" ? [ref] : [...ref.mid];
}
export function metricLandmarks(metric: Metric): LandmarkName[] {
  const refs: PointRef[] = metric.kind === "joint" ? [metric.a, metric.b, metric.c] : metric.kind === "incline" ? [metric.from, metric.to] : metric.kind === "tilt" ? [metric.a, metric.b] : [metric.a, metric.b, ...metric.scale];
  return [...new Set(refs.flatMap(landmarksOf))];
}

/** One metric from one frame, or null when a landmark it needs is missing or below `minVisibility`. */
export function readMetric(metric: Metric, frame: Frame, minVisibility = 0.5): Reading | null {
  const get = (ref: PointRef) => locate(frame, ref);
  let points: (Located | null)[];
  let value: number;
  if (metric.kind === "joint") {
    points = [get(metric.a), get(metric.b), get(metric.c)];
    if (points.some((p) => !p)) return null;
    value = angleAt(points[0]!.pt, points[1]!.pt, points[2]!.pt);
  } else if (metric.kind === "incline") {
    points = [get(metric.from), get(metric.to)];
    if (points.some((p) => !p)) return null;
    value = segmentAngle(points[0]!.pt, points[1]!.pt, metric.ref);
    if (metric.byFacing) value *= facing(frame);
  } else if (metric.kind === "tilt") {
    points = [get(metric.a), get(metric.b)];
    if (points.some((p) => !p)) return null;
    value = segmentAngle(points[0]!.pt, points[1]!.pt, "horizontal");
  } else {
    points = [get(metric.a), get(metric.b), get(metric.scale[0]), get(metric.scale[1])];
    if (points.some((p) => !p)) return null;
    const length = dist(points[2]!.pt, points[3]!.pt);
    if (length === 0) return null;
    value = ((points[1]!.pt.x - points[0]!.pt.x) / length) * (metric.byFacing ? facing(frame) : 1);
  }
  if (!Number.isFinite(value)) return null;
  const confidence = Math.min(...points.map((p) => p!.v));
  return confidence >= minVisibility ? { value, confidence } : null;
}
