/**
 * PNA posture screen: what is measured from one phone picture, and how.
 *
 * Pure functions on the pose model's landmarks (no browser code), so every number can be tested with worked examples (scripts/validate-posture.ts) and the same code runs
 * in the page and in the validators. Everything is worked out in PIXELS (x times width, y times height), never in the normalised square, and every distance is given as
 * a share of the person's own body (the trunk or the leg), so it does not depend on how far away the phone stood.
 *
 * Two views: SIDE (head forward of the shoulder, trunk lean, standing alignment, knee angle) and FRONT (shoulder, hip and head tilt, trunk shift, knees in or out).
 * "Left" and "right" are the person's own sides, taken from the model's anatomical labels, never from which side of the picture a limb appears on.
 *
 * What this cannot do (the page says so): the model has no landmark for the spine or the C7 vertebra and a flat picture has no depth, so these are SCREENING estimates.
 * The cut-offs are provisional until the validation study (docs/posture-validation.md) has compared them with a reference measurement.
 */
import { facing, nearSide, type Side } from "../formcheck/geometry.ts";
import { LM, type Frame, type LandmarkName } from "../formcheck/types.ts";

export type PostureView = "side" | "front";
export type Pt = { x: number; y: number };

export type PostureMetricId =
  | "headForward" | "earShoulderAngle" | "trunkLean" | "standingOffset" | "kneeAngle"
  | "shoulderTilt" | "hipTilt" | "headTilt" | "trunkShift" | "leftKnee" | "rightKnee";

export type MetricDef = {
  id: PostureMetricId;
  view: PostureView;
  unit: "deg" | "pct";
  /** the landmarks that must be seen well for the number to be trusted */
  needs: LandmarkName[];
  /** the most the frame-to-frame spread may be before the capture is called unsteady (same unit as the value) */
  steady: number;
  /** a floor for the stated uncertainty: the tool never claims to be more exact than this (provisional, set from the validation study) */
  floor: number;
};

const SIDE_NEEDS = (side: Side): LandmarkName[] => [`${side}Ear`, `${side}Shoulder`, `${side}Hip`, `${side}Knee`, `${side}Ankle`] as LandmarkName[];

export const METRICS: MetricDef[] = [
  { id: "headForward", view: "side", unit: "pct", needs: [], steady: 4, floor: 2 },
  { id: "earShoulderAngle", view: "side", unit: "deg", needs: [], steady: 3, floor: 2 },
  { id: "trunkLean", view: "side", unit: "deg", needs: [], steady: 2, floor: 1.5 },
  { id: "standingOffset", view: "side", unit: "pct", needs: [], steady: 3, floor: 1.5 },
  { id: "kneeAngle", view: "side", unit: "deg", needs: [], steady: 3, floor: 2.5 },
  { id: "shoulderTilt", view: "front", unit: "deg", needs: ["leftShoulder", "rightShoulder"], steady: 1.5, floor: 1 },
  { id: "hipTilt", view: "front", unit: "deg", needs: ["leftHip", "rightHip"], steady: 1.5, floor: 1 },
  { id: "headTilt", view: "front", unit: "deg", needs: ["leftEar", "rightEar"], steady: 2, floor: 1.5 },
  { id: "trunkShift", view: "front", unit: "pct", needs: ["leftShoulder", "rightShoulder", "leftHip", "rightHip"], steady: 3, floor: 2 },
  { id: "leftKnee", view: "front", unit: "pct", needs: ["leftHip", "leftKnee", "leftAnkle", "rightHip"], steady: 3, floor: 2 },
  { id: "rightKnee", view: "front", unit: "pct", needs: ["rightHip", "rightKnee", "rightAnkle", "leftHip"], steady: 3, floor: 2 },
];
export const metricDef = (id: PostureMetricId) => METRICS.find((m) => m.id === id)!;

/** Landmarks needed in a side view depend on which side faces the camera. */
export const sideNeeds = (side: Side) => SIDE_NEEDS(side);

const RAD = 180 / Math.PI;
const pt = (frame: Frame, name: LandmarkName): Pt => ({ x: frame.lm[LM[name]].x * frame.w, y: frame.lm[LM[name]].y * frame.h });
const vis = (frame: Frame, name: LandmarkName) => frame.lm[LM[name]]?.v ?? 0;
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const round = (n: number, places = 1) => Math.round(n * 10 ** places) / 10 ** places;

/** The interior angle at b between b-a and b-c, 0..180 degrees. */
function interior(a: Pt, b: Pt, c: Pt): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const n = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (n === 0) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / n))) * RAD;
}

export type FrameReading = Partial<Record<PostureMetricId, number>> & { _side?: Side };

/** Reads every metric of one view from one frame. A metric whose landmarks are not seen well enough (visibility below minVis) is left out. */
export function readFrame(frame: Frame, view: PostureView, minVis = 0.6): FrameReading {
  if (frame.lm.length < 33) return {};
  const out: FrameReading = {};
  const ok = (names: LandmarkName[]) => names.every((n) => vis(frame, n) >= minVis);

  if (view === "side") {
    const side = nearSide(frame);
    const dir = facing(frame); // +1: the person faces the right of the picture
    out._side = side;
    const L = (part: string) => `${side}${part}` as LandmarkName;
    const ear = pt(frame, L("Ear")), shoulder = pt(frame, L("Shoulder")), hip = pt(frame, L("Hip")), knee = pt(frame, L("Knee")), ankle = pt(frame, L("Ankle"));
    const trunk = dist(shoulder, hip);
    if (ok([L("Ear"), L("Shoulder"), L("Hip")]) && trunk > 0) {
      // forward = in the direction the person faces; positive means the ear is in front of the shoulder
      out.headForward = (((ear.x - shoulder.x) * dir) / trunk) * 100;
      // 90 degrees: the ear straight above the shoulder; smaller: the head forward of the shoulder (the angle of the shoulder-to-ear line against the horizontal, measured in the direction the person faces)
      out.earShoulderAngle = Math.atan2(shoulder.y - ear.y, (ear.x - shoulder.x) * dir) * RAD;
      // trunk lean against the vertical: positive when the shoulder is in front of the hip
      out.trunkLean = Math.atan2((shoulder.x - hip.x) * dir, hip.y - shoulder.y) * RAD;
    }
    if (ok([L("Ear"), L("Shoulder"), L("Hip"), L("Ankle")])) {
      const height = ankle.y - ear.y;
      // how far the shoulder is in front of the ankle, as a share of the height from the ear to the ankle
      if (height > 0) out.standingOffset = (((shoulder.x - ankle.x) * dir) / height) * 100;
    }
    if (ok([L("Hip"), L("Knee"), L("Ankle")])) out.kneeAngle = interior(hip, knee, ankle);
    return out;
  }

  // front (or back) view: tilts are given by which landmark is higher, so they never depend on the side of the picture
  const pair = (l: LandmarkName, r: LandmarkName) => {
    const a = pt(frame, l), b = pt(frame, r);
    const run = Math.abs(a.x - b.x);
    if (run < 1) return null;
    // positive: the person's LEFT landmark is higher in the picture (smaller y) than the right one
    return { tilt: Math.atan2(b.y - a.y, run) * RAD, a, b };
  };
  if (ok(["leftShoulder", "rightShoulder"])) { const p = pair("leftShoulder", "rightShoulder"); if (p) out.shoulderTilt = p.tilt; }
  if (ok(["leftHip", "rightHip"])) { const p = pair("leftHip", "rightHip"); if (p) out.hipTilt = p.tilt; }
  if (ok(["leftEar", "rightEar"])) { const p = pair("leftEar", "rightEar"); if (p) out.headTilt = p.tilt; }
  if (ok(["leftShoulder", "rightShoulder", "leftHip", "rightHip"])) {
    const ls = pt(frame, "leftShoulder"), rs = pt(frame, "rightShoulder"), lh = pt(frame, "leftHip"), rh = pt(frame, "rightHip");
    const width = Math.abs(ls.x - rs.x);
    const toLeft = Math.sign(ls.x - rs.x) || 1; // which way along x is the person's left
    if (width > 1) out.trunkShift = (((mid(ls, rs).x - mid(lh, rh).x) * toLeft) / width) * 100; // positive: the shoulders sit to the person's left of the hips
  }
  const knee = (side: Side) => {
    const other: Side = side === "left" ? "right" : "left";
    const L = (part: string) => `${side}${part}` as LandmarkName;
    if (!ok([L("Hip"), L("Knee"), L("Ankle"), `${other}Hip` as LandmarkName])) return;
    const hip = pt(frame, L("Hip")), k = pt(frame, L("Knee")), ankle = pt(frame, L("Ankle"));
    const midline = mid(pt(frame, "leftHip"), pt(frame, "rightHip")).x;
    const length = dist(hip, ankle);
    if (length < 1 || ankle.y === hip.y) return;
    // where the straight hip-to-ankle line is at the height of the knee, and how far the knee is from it as a share of the leg
    const lineX = hip.x + ((k.y - hip.y) / (ankle.y - hip.y)) * (ankle.x - hip.x);
    const towardMidline = Math.sign(midline - hip.x) || 0;
    // positive: the knee is on the midline side of the line (knees falling in, the knock-knee pattern); negative: bowed outward
    out[side === "left" ? "leftKnee" : "rightKnee"] = (((k.x - lineX) * towardMidline) / length) * 100;
  };
  knee("left"); knee("right");
  return out;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const quantile = (xs: number[], q: number) => {
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};

export type Result = {
  id: PostureMetricId;
  value: number;
  /** half the spread between the 25th and 75th percentile of the frames: how much the number wobbled during the capture */
  wobble: number;
  /** the stated uncertainty (never smaller than the metric's floor) */
  plusMinus: number;
  frames: number;
  steady: boolean;
};
export type CaptureResult =
  | { ok: true; view: PostureView; side?: Side; results: Result[]; unreadable: PostureMetricId[]; frames: number }
  | { ok: false; reason: "too_few_frames" | "no_person"; frames: number };

export const MIN_FRAMES = 20;

/** Turns the frames of one capture into one value per metric (the median) with its spread. A metric seen in fewer than MIN_FRAMES frames is reported as unreadable. */
export function summarise(frames: Frame[], view: PostureView, minVis = 0.6): CaptureResult {
  const readings = frames.map((f) => readFrame(f, view, minVis));
  const usable = readings.filter((r) => Object.keys(r).some((k) => k !== "_side"));
  if (frames.length < MIN_FRAMES) return { ok: false, reason: "too_few_frames", frames: frames.length };
  if (usable.length === 0) return { ok: false, reason: "no_person", frames: frames.length };
  const ids = METRICS.filter((m) => m.view === view).map((m) => m.id);
  const results: Result[] = [];
  const unreadable: PostureMetricId[] = [];
  for (const id of ids) {
    const values = readings.map((r) => r[id]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (values.length < MIN_FRAMES) { unreadable.push(id); continue; }
    const def = metricDef(id);
    const wobble = (quantile(values, 0.75) - quantile(values, 0.25)) / 2;
    results.push({ id, value: round(median(values)), wobble: round(wobble), plusMinus: round(Math.max(def.floor, wobble)), frames: values.length, steady: wobble <= def.steady });
  }
  const sides = readings.map((r) => r._side).filter((s): s is Side => !!s);
  const side = sides.length ? (sides.filter((s) => s === "left").length >= sides.length / 2 ? "left" : "right") : undefined;
  return { ok: true, view, side, results, unreadable, frames: usable.length };
}

export type Band = "typical" | "mild" | "marked" | "within_error";
/** Provisional screening bands (see the file note). A value inside its own uncertainty is "within_error": the tool cannot tell it from zero. */
export function band(id: PostureMetricId, value: number, plusMinus: number): Band {
  const size = (limits: [number, number], v = Math.abs(value)): Band => (v < limits[0] ? "typical" : v < limits[1] ? "mild" : "marked");
  switch (id) {
    case "headForward": return value < 10 ? "typical" : value < 20 ? "mild" : "marked";
    case "earShoulderAngle": return value >= 65 ? "typical" : value >= 55 ? "mild" : "marked";
    case "trunkLean": return size([3, 6]);
    case "standingOffset": return Math.abs(value) < 5 ? "typical" : Math.abs(value) < 10 ? "mild" : "marked";
    case "kneeAngle": return value >= 172 ? "typical" : value >= 160 ? "mild" : "marked";
    case "shoulderTilt": case "hipTilt": return Math.abs(value) <= plusMinus ? "within_error" : size([1.5, 3]);
    case "headTilt": return Math.abs(value) <= plusMinus ? "within_error" : size([3, 6]);
    case "trunkShift": return Math.abs(value) <= plusMinus ? "within_error" : size([3, 6]);
    case "leftKnee": case "rightKnee": return Math.abs(value) <= plusMinus ? "within_error" : size([3, 6]);
  }
}
