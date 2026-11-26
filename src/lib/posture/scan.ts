/**
 * PNA Full Posture Scan: four short captures (front, side, back, forward bend) put together into one picture of how a person stands.
 *
 * Pure functions on the pose model's landmarks (no browser code), like measures.ts, so every number can be tested with worked examples
 * (scripts/validate-posture-scan.ts). The front and side views are read by measures.ts; this file adds the BACK view, the FORWARD BEND
 * (seen from the side), the combining of the four captures, and the pose that the illustrative 3D skeleton is drawn in.
 *
 * What this cannot do (the page says so): the pose model has no landmark for the spine, so the skeleton is an ILLUSTRATION fitted through points that were
 * measured (head, shoulders, hips, knees), not a picture of the person's bones. It does not measure spinal curves, it does not measure a rib hump, and it
 * does not check for scoliosis or any spine condition. The cut-offs are provisional until the validation study has compared them with a reference.
 */
import { LM, type Frame, type LandmarkName } from "../formcheck/types.ts";
import { facing, nearSide, type Side } from "../formcheck/geometry.ts";
import { band, metricDef, MIN_FRAMES, readFrame, type Band, type CaptureResult, type PostureMetricId, type Result } from "./measures.ts";

export type ScanView = "front" | "side" | "back" | "bend";
export const SCAN_VIEWS: ScanView[] = ["front", "side", "back", "bend"];

/** Metrics that exist only in the scan. */
export type BendMetricId = "bendTrunk" | "bendHip" | "bendKnee" | "reach";
export type ScanMetricId = PostureMetricId | BendMetricId;

type Pt = { x: number; y: number };
const RAD = 180 / Math.PI;
const pt = (frame: Frame, name: LandmarkName): Pt => ({ x: frame.lm[LM[name]].x * frame.w, y: frame.lm[LM[name]].y * frame.h });
const vis = (frame: Frame, name: LandmarkName) => frame.lm[LM[name]]?.v ?? 0;
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const round = (n: number, places = 1) => Math.round(n * 10 ** places) / 10 ** places;
const interior = (a: Pt, b: Pt, c: Pt): number => {
  const v1 = { x: a.x - b.x, y: a.y - b.y }, v2 = { x: c.x - b.x, y: c.y - b.y };
  const n = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  return n === 0 ? NaN : Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / n))) * RAD;
};

/** floor = the least uncertainty the tool will ever state; steady = the most the frame-to-frame spread may be before the capture is called unsteady. Provisional. */
export const BEND_METRICS: Record<BendMetricId, { unit: "deg" | "pct"; steady: number; floor: number }> = {
  bendTrunk: { unit: "deg", steady: 4, floor: 3 },
  bendHip: { unit: "deg", steady: 4, floor: 3 },
  bendKnee: { unit: "deg", steady: 4, floor: 3 },
  reach: { unit: "pct", steady: 6, floor: 4 },
};

export type ScanReading = Partial<Record<ScanMetricId, number>> & { _side?: Side };

/**
 * BACK view. The model's own left and right labels are not trusted from behind (a back view gives it no face to go by), so the person's left is taken from the
 * view itself: facing away from the camera, the person's LEFT is on the LEFT of the picture. Signs match the front view: a tilt is positive when the person's
 * LEFT landmark is higher; trunk shift is positive when the shoulders sit to the person's left of the hips.
 */
export function readBack(frame: Frame, minVis = 0.6): ScanReading {
  if (frame.lm.length < 33) return {};
  const out: ScanReading = {};
  const both = (a: LandmarkName, b: LandmarkName) => vis(frame, a) >= minVis && vis(frame, b) >= minVis;
  const pair = (a: LandmarkName, b: LandmarkName) => {
    const p = pt(frame, a), q = pt(frame, b);
    const [leftP, rightP] = p.x <= q.x ? [p, q] : [q, p];
    const run = rightP.x - leftP.x;
    if (run < 1) return null;
    return { tilt: Math.atan2(rightP.y - leftP.y, run) * RAD, leftP, rightP };
  };
  if (both("leftShoulder", "rightShoulder")) { const p = pair("leftShoulder", "rightShoulder"); if (p) out.shoulderTilt = p.tilt; }
  if (both("leftHip", "rightHip")) { const p = pair("leftHip", "rightHip"); if (p) out.hipTilt = p.tilt; }
  if (both("leftEar", "rightEar")) { const p = pair("leftEar", "rightEar"); if (p) out.headTilt = p.tilt; }
  if (both("leftShoulder", "rightShoulder") && both("leftHip", "rightHip")) {
    const s = pair("leftShoulder", "rightShoulder"), h = pair("leftHip", "rightHip");
    if (s && h) {
      const width = s.rightP.x - s.leftP.x;
      // the person's left is the smaller x in a back view: shoulders to the person's left of the hips means a smaller x
      if (width > 1) out.trunkShift = (((mid(h.leftP, h.rightP).x - mid(s.leftP, s.rightP).x)) / width) * 100;
    }
  }
  return out;
}

/**
 * FORWARD BEND, seen from the side. The person bends forward as far as is comfortable, knees straight, arms hanging.
 *  bendTrunk  how far the line from hip to shoulder has moved from upright (0 upright, 90 level with the floor, more than 90 below level)
 *  bendHip    the angle at the hip between the trunk and the thigh (180 standing straight; smaller means more bend at the hip)
 *  bendKnee   the angle at the knee (180 straight): it shows whether the knees were kept straight during the bend
 *  reach      where the fingertips stop, as a share of the leg: 0 at the height of the ankle, 100 at the height of the hip, negative below the ankle
 */
export function readBend(frame: Frame, minVis = 0.6): ScanReading {
  if (frame.lm.length < 33) return {};
  const out: ScanReading = {};
  const side = nearSide(frame);
  out._side = side;
  const L = (part: string) => `${side}${part}` as LandmarkName;
  const ok = (names: LandmarkName[]) => names.every((n) => vis(frame, n) >= minVis);
  const shoulder = pt(frame, L("Shoulder")), hip = pt(frame, L("Hip")), knee = pt(frame, L("Knee")), ankle = pt(frame, L("Ankle")), finger = pt(frame, L("Index"));
  if (ok([L("Shoulder"), L("Hip")])) out.bendTrunk = Math.atan2(Math.abs(shoulder.x - hip.x), hip.y - shoulder.y) * RAD;
  if (ok([L("Shoulder"), L("Hip"), L("Knee")])) out.bendHip = interior(shoulder, hip, knee);
  if (ok([L("Hip"), L("Knee"), L("Ankle")])) out.bendKnee = interior(hip, knee, ankle);
  if (ok([L("Hip"), L("Ankle"), L("Index")])) {
    const leg = ankle.y - hip.y; // positive when the hip is above the ankle in the picture
    if (leg > 1) out.reach = ((ankle.y - finger.y) / leg) * 100;
  }
  return out;
}

const quantile = (xs: number[], q: number) => {
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};
const median = (xs: number[]) => quantile(xs, 0.5);

export type ScanResult = { id: ScanMetricId; value: number; wobble: number; plusMinus: number; frames: number; steady: boolean };
export type ScanCapture =
  | { ok: true; view: ScanView; side?: Side; results: ScanResult[]; unreadable: ScanMetricId[]; frames: number }
  | { ok: false; reason: "too_few_frames" | "no_person"; frames: number };

const idsFor = (view: ScanView): ScanMetricId[] =>
  view === "bend" ? (Object.keys(BEND_METRICS) as BendMetricId[]) : view === "back" ? ["shoulderTilt", "hipTilt", "headTilt", "trunkShift"] : (["headForward", "earShoulderAngle", "trunkLean", "standingOffset", "kneeAngle", "shoulderTilt", "hipTilt", "headTilt", "trunkShift", "leftKnee", "rightKnee"] as PostureMetricId[]).filter((id) => metricDef(id).view === (view === "front" ? "front" : "side"));
const defFor = (id: ScanMetricId, view: ScanView): { steady: number; floor: number } => (view === "bend" ? BEND_METRICS[id as BendMetricId] : metricDef(id as PostureMetricId));

/** One capture of one view into one value per metric (the median) with its spread. Same rules as measures.summarise. */
export function summariseScan(frames: Frame[], view: ScanView, minVis = 0.6): ScanCapture {
  const read = (f: Frame): ScanReading => (view === "bend" ? readBend(f, minVis) : view === "back" ? readBack(f, minVis) : readFrame(f, view, minVis));
  const readings = frames.map(read);
  const usable = readings.filter((r) => Object.keys(r).some((k) => k !== "_side"));
  if (frames.length < MIN_FRAMES) return { ok: false, reason: "too_few_frames", frames: frames.length };
  if (usable.length === 0) return { ok: false, reason: "no_person", frames: frames.length };
  const results: ScanResult[] = [];
  const unreadable: ScanMetricId[] = [];
  for (const id of idsFor(view)) {
    const values = readings.map((r) => r[id]).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (values.length < MIN_FRAMES) { unreadable.push(id); continue; }
    const def = defFor(id, view);
    const wobble = (quantile(values, 0.75) - quantile(values, 0.25)) / 2;
    results.push({ id, value: round(median(values)), wobble: round(wobble), plusMinus: round(Math.max(def.floor, wobble)), frames: values.length, steady: wobble <= def.steady });
  }
  const sides = readings.map((r) => r._side).filter((s): s is Side => !!s);
  const side = sides.length ? (sides.filter((s) => s === "left").length >= sides.length / 2 ? "left" : "right") : undefined;
  return { ok: true, view, side, results, unreadable, frames: usable.length };
}

/** Provisional bands for the bend metrics. The bend is described, not graded: a short reach is common and not a finding on its own. */
export type BendNote = "straight" | "bent_knees" | "reaches_ankle" | "stops_short";
export function bendNotes(capture: ScanCapture): BendNote[] {
  if (!capture.ok) return [];
  const get = (id: BendMetricId) => capture.results.find((r) => r.id === id);
  const notes: BendNote[] = [];
  const knee = get("bendKnee");
  if (knee) notes.push(knee.value < 165 ? "bent_knees" : "straight");
  const reach = get("reach");
  if (reach) notes.push(reach.value >= -reach.plusMinus ? "reaches_ankle" : "stops_short");
  return notes;
}

/* ------------------------------------------------------------------------------------------ */
/* Putting the four captures together                                                          */
/* ------------------------------------------------------------------------------------------ */

export type Captures = Partial<Record<ScanView, ScanCapture>>;
export type Region = "neck" | "shoulders" | "trunk" | "pelvis" | "leftKnee" | "rightKnee";
export const REGIONS: Region[] = ["neck", "shoulders", "trunk", "pelvis", "leftKnee", "rightKnee"];

const value = (c: ScanCapture | undefined, id: ScanMetricId): ScanResult | undefined => (c && c.ok ? c.results.find((r) => r.id === id) : undefined);

/** A tilt or shift seen in both the front and the back views is averaged; when the two disagree about the direction, the tool says so rather than choose one. */
export type Combined = { value: number; plusMinus: number; sources: ScanView[]; disagree: boolean };
function combine(id: PostureMetricId, a: ScanResult | undefined, b: ScanResult | undefined): Combined | undefined {
  if (a && b) {
    const disagree = Math.sign(a.value) !== Math.sign(b.value) && Math.abs(a.value) > a.plusMinus && Math.abs(b.value) > b.plusMinus;
    return { value: round((a.value + b.value) / 2), plusMinus: round(Math.max(a.plusMinus, b.plusMinus)), sources: ["front", "back"], disagree };
  }
  const only = a ?? b;
  return only ? { value: only.value, plusMinus: only.plusMinus, sources: [a ? "front" : "back"], disagree: false } : undefined;
}

export type Summary = {
  headForward?: Combined; earShoulderAngle?: Combined; trunkLean?: Combined; standingOffset?: Combined; kneeAngle?: Combined;
  shoulderTilt?: Combined; hipTilt?: Combined; headTilt?: Combined; trunkShift?: Combined; leftKnee?: Combined; rightKnee?: Combined;
  bend: Partial<Record<BendMetricId, ScanResult>>;
  viewsDone: ScanView[];
};

export function summarise(captures: Captures): Summary {
  const f = captures.front, b = captures.back, s = captures.side, d = captures.bend;
  const single = (id: PostureMetricId, from: ScanCapture | undefined, view: ScanView): Combined | undefined => {
    const r = value(from, id);
    return r ? { value: r.value, plusMinus: r.plusMinus, sources: [view], disagree: false } : undefined;
  };
  const bend: Summary["bend"] = {};
  if (d && d.ok) for (const r of d.results) bend[r.id as BendMetricId] = r;
  return {
    headForward: single("headForward", s, "side"), earShoulderAngle: single("earShoulderAngle", s, "side"), trunkLean: single("trunkLean", s, "side"),
    standingOffset: single("standingOffset", s, "side"), kneeAngle: single("kneeAngle", s, "side"),
    shoulderTilt: combine("shoulderTilt", value(f, "shoulderTilt"), value(b, "shoulderTilt")),
    hipTilt: combine("hipTilt", value(f, "hipTilt"), value(b, "hipTilt")),
    headTilt: combine("headTilt", value(f, "headTilt"), value(b, "headTilt")),
    trunkShift: combine("trunkShift", value(f, "trunkShift"), value(b, "trunkShift")),
    leftKnee: single("leftKnee", f, "front"), rightKnee: single("rightKnee", f, "front"),
    bend,
    viewsDone: SCAN_VIEWS.filter((v) => captures[v]?.ok),
  };
}

const SEVERITY: Record<Band, 0 | 1 | 2> = { typical: 0, within_error: 0, mild: 1, marked: 2 };
export type Severity = 0 | 1 | 2;

/** The measures that speak for each region of the body, and how far each is from the usual range. A region with no readable measure has no severity (null), never a guess. */
export const REGION_MEASURES: Record<Region, PostureMetricId[]> = {
  neck: ["headForward", "earShoulderAngle", "headTilt"],
  shoulders: ["shoulderTilt"],
  trunk: ["trunkLean", "trunkShift", "standingOffset"],
  pelvis: ["hipTilt"],
  leftKnee: ["leftKnee"],
  rightKnee: ["rightKnee"],
};
export function regionSeverity(summary: Summary): Record<Region, Severity | null> {
  const out = {} as Record<Region, Severity | null>;
  for (const region of REGIONS) {
    let worst: Severity | null = null;
    for (const id of REGION_MEASURES[region]) {
      const c = summary[id];
      if (!c) continue;
      const s = SEVERITY[band(id, c.value, c.plusMinus)];
      worst = worst === null ? s : (Math.max(worst, s) as Severity);
    }
    // the knee angle seen from the side speaks for both knees
    if ((region === "leftKnee" || region === "rightKnee") && summary.kneeAngle) {
      const s = SEVERITY[band("kneeAngle", summary.kneeAngle.value, summary.kneeAngle.plusMinus)];
      worst = worst === null ? s : (Math.max(worst, s) as Severity);
    }
    out[region] = worst;
  }
  return out;
}

/* ------------------------------------------------------------------------------------------ */
/* The pose the illustrative skeleton is drawn in                                              */
/* ------------------------------------------------------------------------------------------ */

/** Everything in degrees or shares of body size, with 0 meaning "as drawn in the neutral standing pose". Missing measures stay 0, and `known` says which were measured. */
export type SkeletonPose = {
  /** head moved forward of the shoulders, as a share of the trunk length (side view) */
  headForward: number;
  /** whole trunk leaning forward (positive) or back, degrees (side view) */
  trunkLean: number;
  /** each knee bent (positive) or bent back (negative), degrees from straight (side view) */
  kneeFlex: number;
  /** the person's left shoulder higher (positive), degrees */
  shoulderTilt: number;
  hipTilt: number;
  headTilt: number;
  /** the shoulders sitting to the person's left (positive) of the hips, as a share of shoulder width */
  trunkShift: number;
  /** knees falling in (positive) or bowing out (negative), share of the leg */
  leftKnee: number;
  rightKnee: number;
  known: Partial<Record<keyof Omit<SkeletonPose, "known">, boolean>>;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** A value inside its own uncertainty is drawn as level (0): the tool must not draw a tilt it cannot tell from zero. */
const drawn = (c: Combined | undefined, limit: number): number => (c && Math.abs(c.value) > c.plusMinus ? clamp(c.value, -limit, limit) : 0);

export function skeletonPose(summary: Summary): SkeletonPose {
  const known: SkeletonPose["known"] = {};
  const mark = (key: keyof Omit<SkeletonPose, "known">, c: Combined | undefined) => { if (c) known[key] = true; };
  mark("headForward", summary.headForward); mark("trunkLean", summary.trunkLean); mark("kneeFlex", summary.kneeAngle);
  mark("shoulderTilt", summary.shoulderTilt); mark("hipTilt", summary.hipTilt); mark("headTilt", summary.headTilt); mark("trunkShift", summary.trunkShift);
  mark("leftKnee", summary.leftKnee); mark("rightKnee", summary.rightKnee);
  return {
    headForward: drawn(summary.headForward, 40),
    trunkLean: drawn(summary.trunkLean, 20),
    kneeFlex: summary.kneeAngle ? (Math.abs(180 - summary.kneeAngle.value) > summary.kneeAngle.plusMinus ? clamp(180 - summary.kneeAngle.value, -15, 40) : 0) : 0,
    shoulderTilt: drawn(summary.shoulderTilt, 15),
    hipTilt: drawn(summary.hipTilt, 15),
    headTilt: drawn(summary.headTilt, 25),
    trunkShift: drawn(summary.trunkShift, 30),
    leftKnee: drawn(summary.leftKnee, 15),
    rightKnee: drawn(summary.rightKnee, 15),
    known,
  };
}

/** Plain-number copy of a summary for keeping on the person's own device: only the numbers, never a picture. */
export type SavedScan = { v: 1; at: string; summary: Summary };
export const toSaved = (summary: Summary, at = new Date().toISOString()): SavedScan => ({ v: 1, at, summary });
export const isSaved = (x: unknown): x is SavedScan => typeof x === "object" && x !== null && (x as SavedScan).v === 1 && typeof (x as SavedScan).at === "string" && typeof (x as SavedScan).summary === "object";

/** How a number moved between two scans, said with the uncertainty of both: a change smaller than the two uncertainties together is not called a change. */
export type Change = "better" | "worse" | "same";
export function compareScans(before: Combined | undefined, after: Combined | undefined, direction: "toward_zero" = "toward_zero"): Change | null {
  if (!before || !after || direction !== "toward_zero") return null;
  const delta = Math.abs(after.value) - Math.abs(before.value);
  const noise = before.plusMinus + after.plusMinus;
  return Math.abs(delta) <= noise ? "same" : delta < 0 ? "better" : "worse";
}

export type { Result };
