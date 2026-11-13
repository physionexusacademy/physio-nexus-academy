/**
 * Skills Lab 3D demonstrations: the Virtual Patient performs each measurement and test.
 * Keyed "<skill>/<atlas item id>" (concept demos: "<skill>/concept:<id>"). No three.js import,
 * so the skills build and validator can read the keys.
 *
 * Point syntax (for the goniometer, the examiner's hands and the camera):
 *   "upperarm01"        bone head (joint centre) on the tested side; ":o" = the other side
 *   "wrist>"            bone tail (far end of the segment)
 *   "a+b" / "a+b*0.8"   midpoint of two points / a point 80 % of the way from a to b
 *   "@lateral-epicondyle", "@asis:o", "@xiphoid:m"   palpation landmarks (":m" = midline)
 *   "^up" "^down" "^front" "^back" "^head" "^feet" "^lat" "^med"   a reference line from the goniometer axis
 */
import type { JointAngles, PatientPosition, Pose, Side } from "../virtual-patient/engine.ts";
import { P, toward, type Parts } from "../virtual-patient/parts.ts";

export type Demo3DKind = "rom" | "mmt" | "length";

export type Demo3DSpec = {
  kind: Demo3DKind;
  position: PatientPosition;
  /** Side-lying: which side lies on the plinth (default: the untested side, so the tested side is up). */
  down?: "tested" | "other";
  /** Slides the lying patient towards the foot end (metres), e.g. the Thomas test at the end of the plinth. */
  shift?: number;
  /** A point that stays where it started (standing tests), e.g. the ball of the foot in a heel raise. */
  planted?: string;
  /** Pose for the movement angle `a` (merged over the position's resting posture). */
  move: (s: Side, a: number) => Pose;
  /** Movement from the start position to the end position (or the held test position). */
  range: [number, number];
  /** What the reading measures (shown with the live angle). */
  label?: string;
  /** Reading for an angle (default: the angle itself). */
  read?: (a: number) => number;
  gonio?: { axis: string; fixed: string; moving: string };
  /** Examiner's hands: resistance (MMT) or moving the limb (muscle length), and stabilisation. */
  push?: string;
  stab?: string;
  /** Camera aim, distance (metres) and direction in the patient's frame: [towards the tested side, towards the head, towards the front]. */
  focus: string;
  zoom: number;
  view: [number, number, number];
};

/** Forearm rotation (elbow rot) for full supination; pronation is the opposite sign. */
const SUP = 90;
const PRO = -90;
/** Hook-lying: both hips and knees bent, feet flat. */
const HOOK: Parts = { hip: { flex: 45 }, knee: { flex: 90 }, "hip:o": { flex: 45 }, "knee:o": { flex: 90 } };
/** Sitting with the tested arm by the side and the elbow bent to 90°. */
const ELBOW90 = (rot = 0): Parts => ({ shoulder: { flex: 0 }, elbow: { flex: 90, rot }, "shoulder:o": { flex: 4 }, "elbow:o": { flex: 12 } });
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* Shared camera set-ups. */
const SIDE_VIEW: [number, number, number] = [1, 0.12, 0.4];
const PRONE_SIDE: [number, number, number] = [1, 0.12, -0.45];

/* ------------------------------------------------------------------ */
/* Goniometry                                                          */
/* ------------------------------------------------------------------ */

const shoulderGonio = { axis: "upperarm01", fixed: "upperleg01", moving: "lowerarm01" };
const hipGonio = { axis: "@greater-trochanter", fixed: "upperarm01", moving: "lowerleg01" };
const kneeGonio = { axis: "lowerleg01", fixed: "upperleg01", moving: "foot" };
const ankleGonio = { axis: "@lateral-malleolus", fixed: "lowerleg01", moving: "toe5-1" };

const goniometry: Record<string, Demo3DSpec> = {
  "shoulder-flexion": { kind: "rom", position: "supine", move: (s, a) => P(s, { ...HOOK, shoulder: { flex: a } }), range: [0, 180], gonio: shoulderGonio, focus: "upperarm01", zoom: 1.75, view: [1, 0.15, 0.45] },
  "shoulder-extension": { kind: "rom", position: "prone", move: (s, a) => P(s, { shoulder: { flex: -a } }), range: [0, 60], gonio: shoulderGonio, focus: "upperarm01", zoom: 1.45, view: PRONE_SIDE },
  "shoulder-abduction": { kind: "rom", position: "supine", move: (s, a) => P(s, { ...HOOK, shoulder: { abd: a, rot: a > 90 ? -(a - 90) * 0.6 : 0 } }), range: [0, 180], gonio: { axis: "upperarm01", fixed: "^feet", moving: "lowerarm01" }, focus: "upperarm01", zoom: 1.8, view: [0.35, 0.05, 1] },
  "shoulder-external-rotation": { kind: "rom", position: "supine", move: (s, a) => P(s, { shoulder: { abd: 90, rot: -a }, elbow: { flex: 90 } }), range: [0, 90], gonio: { axis: "lowerarm01", fixed: "^up", moving: "wrist" }, focus: "lowerarm01", zoom: 1.15, view: [1, 0.15, 0.35] },
  "shoulder-internal-rotation": { kind: "rom", position: "supine", move: (s, a) => P(s, { shoulder: { abd: 90, rot: a } , elbow: { flex: 90 } }), range: [0, 70], gonio: { axis: "lowerarm01", fixed: "^up", moving: "wrist" }, focus: "lowerarm01", zoom: 1.15, view: [1, 0.15, 0.35] },
  "elbow-flexion": { kind: "rom", position: "supine", move: (s, a) => P(s, { elbow: { flex: a, rot: SUP } }), range: [0, 150], gonio: { axis: "lowerarm01", fixed: "upperarm01", moving: "wrist" }, focus: "lowerarm01", zoom: 1.15, view: [1, 0.12, 0.5] },
  "forearm-pronation": { kind: "rom", position: "sitting", move: (s, a) => P(s, ELBOW90((PRO * a) / 90)), range: [0, 80], gonio: { axis: "wrist", fixed: "^up", moving: "@radial-styloid" }, focus: "wrist", zoom: 0.7, view: [0.25, 0.15, 1] },
  "forearm-supination": { kind: "rom", position: "sitting", move: (s, a) => P(s, ELBOW90((SUP * a) / 90)), range: [0, 80], gonio: { axis: "wrist", fixed: "^up", moving: "@radial-styloid" }, focus: "wrist", zoom: 0.7, view: [0.25, 0.15, 1] },
  "wrist-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), wrist: { flex: a } }), range: [0, 80], gonio: { axis: "wrist", fixed: "lowerarm01", moving: "finger5-1" }, focus: "wrist", zoom: 0.8, view: [1, 0.15, 0.3] },
  "wrist-extension": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), wrist: { flex: -a } }), range: [0, 70], gonio: { axis: "wrist", fixed: "lowerarm01", moving: "finger5-1" }, focus: "wrist", zoom: 0.8, view: [1, 0.15, 0.3] },
  "wrist-radial-deviation": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), wrist: { abd: a } }), range: [0, 20], gonio: { axis: "wrist", fixed: "lowerarm01", moving: "finger3-1" }, focus: "wrist", zoom: 0.75, view: [0.15, 1, 0.35] },
  "wrist-ulnar-deviation": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), wrist: { abd: -a } }), range: [0, 30], gonio: { axis: "wrist", fixed: "lowerarm01", moving: "finger3-1" }, focus: "wrist", zoom: 0.75, view: [0.15, 1, 0.35] },
  "mcp-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), fingers: { flex: a } }), range: [0, 90], gonio: { axis: "finger5-1", fixed: "wrist", moving: "finger5-2" }, focus: "finger5-1", zoom: 0.36, view: [1, 0.2, 0.3] },
  "pip-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), fingers: { abd: a } }), range: [0, 100], gonio: { axis: "finger5-2", fixed: "finger5-1", moving: "finger5-3" }, focus: "finger5-2", zoom: 0.32, view: [1, 0.2, 0.3] },
  "dip-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), fingers: { rot: a } }), range: [0, 90], gonio: { axis: "finger5-3", fixed: "finger5-2", moving: "finger5-3>" }, focus: "finger5-3", zoom: 0.3, view: [1, 0.2, 0.3] },
  "thumb-cmc-abduction": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), thumb: { abd: a } }), range: [0, 70], gonio: { axis: "finger1-1", fixed: "finger2-1", moving: "finger1-2" }, focus: "finger1-1", zoom: 0.45, view: [1, 0.3, 0.35] },
  "thumb-mcp-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(), thumb: { flex: a } }), range: [0, 50], gonio: { axis: "finger1-2", fixed: "finger1-1", moving: "finger1-3" }, focus: "finger1-2", zoom: 0.38, view: [1, 0.3, 0.35] },
  "thumb-ip-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(), thumb: { rot: a } }), range: [0, 80], gonio: { axis: "finger1-3", fixed: "finger1-2", moving: "finger1-3>" }, focus: "finger1-3", zoom: 0.36, view: [1, 0.3, 0.35] },
  "hip-flexion": { kind: "rom", position: "supine", move: (s, a) => P(s, { hip: { flex: a }, knee: { flex: Math.min(130, a * 1.1) } }), range: [0, 120], gonio: hipGonio, focus: "upperleg01", zoom: 1.6, view: [1, 0.08, 0.35] },
  "hip-extension": { kind: "rom", position: "prone", move: (s, a) => P(s, { hip: { flex: -a } }), range: [0, 30], gonio: hipGonio, focus: "upperleg01", zoom: 1.5, view: PRONE_SIDE },
  "hip-abduction": { kind: "rom", position: "supine", move: (s, a) => P(s, { hip: { abd: a } }), range: [0, 45], gonio: { axis: "@asis", fixed: "^feet", moving: "lowerleg01" }, focus: "upperleg01+lowerleg01", zoom: 1.6, view: [0.25, 0.1, 1] },
  "hip-adduction": { kind: "rom", position: "supine", move: (s, a) => P(s, { hip: { abd: -a }, "hip:o": { abd: 25 } }), range: [0, 30], gonio: { axis: "@asis", fixed: "^feet", moving: "lowerleg01" }, focus: "upperleg01+lowerleg01", zoom: 1.6, view: [0.25, 0.1, 1] },
  "hip-internal-rotation": { kind: "rom", position: "sitting", move: (s, a) => P(s, { hip: { flex: 88, rot: a } }), range: [0, 45], gonio: { axis: "lowerleg01", fixed: "^down", moving: "foot" }, focus: "lowerleg01+foot", zoom: 1.05, view: [0.15, 0.12, 1] },
  "hip-external-rotation": { kind: "rom", position: "sitting", move: (s, a) => P(s, { hip: { flex: 88, rot: -a }, "hip:o": { flex: 88, abd: 14 } }), range: [0, 45], gonio: { axis: "lowerleg01", fixed: "^down", moving: "foot" }, focus: "lowerleg01+foot", zoom: 1.05, view: [0.15, 0.12, 1] },
  "knee-flexion": { kind: "rom", position: "supine", move: (s, a) => P(s, { knee: { flex: a }, hip: { flex: a * 0.62 } }), range: [0, 135], gonio: kneeGonio, focus: "lowerleg01", zoom: 1.35, view: [1, 0.08, 0.35] },
  "ankle-dorsiflexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ankle: { flex: a } }), range: [0, 20], gonio: ankleGonio, focus: "foot", zoom: 0.75, view: [1, 0.05, 0.25] },
  "ankle-plantarflexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ankle: { flex: -a } }), range: [0, 50], gonio: ankleGonio, focus: "foot", zoom: 0.75, view: [1, 0.05, 0.25] },
  "foot-inversion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ankle: { rot: a } }), range: [0, 35], gonio: { axis: "foot", fixed: "lowerleg01", moving: "toe2-1" }, focus: "foot", zoom: 0.75, view: [0.15, 0.25, 1] },
  "foot-eversion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { ankle: { rot: -a } }), range: [0, 15], gonio: { axis: "foot", fixed: "lowerleg01", moving: "toe2-1" }, focus: "foot", zoom: 0.75, view: [0.15, 0.25, 1] },
  "mtp-extension": { kind: "rom", position: "supine", move: (s, a) => P(s, { toe: { flex: a }, "hip:o": { abd: 22 } }), range: [0, 70], gonio: { axis: "toe1-1", fixed: "foot", moving: "toe1-2" }, focus: "toe1-1", zoom: 0.5, view: [-0.9, 0.2, 0.8] },
  "mtp-flexion": { kind: "rom", position: "supine", move: (s, a) => P(s, { toe: { flex: -a }, "hip:o": { abd: 22 } }), range: [0, 45], gonio: { axis: "toe1-1", fixed: "foot", moving: "toe1-2" }, focus: "toe1-1", zoom: 0.5, view: [-0.9, 0.2, 0.8] },
  "cervical-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { neck: { flex: a } }), range: [0, 45], gonio: { axis: "head", fixed: "^front", moving: "eye+eye:o" }, focus: "head", zoom: 0.95, view: [1, 0.12, 0.15] },
  "cervical-extension": { kind: "rom", position: "sitting", move: (s, a) => P(s, { neck: { flex: -a } }), range: [0, 45], gonio: { axis: "head", fixed: "^front", moving: "eye+eye:o" }, focus: "head", zoom: 0.95, view: [1, 0.12, 0.15] },
  "cervical-lateral-flexion": { kind: "rom", position: "sitting", move: (s, a) => P(s, { neck: { abd: toward(s) * a } }), range: [0, 45], gonio: { axis: "neck01", fixed: "^up", moving: "head>" }, focus: "neck01+head", zoom: 1.05, view: [0, 0.15, -1] },
  "cervical-rotation": { kind: "rom", position: "sitting", move: (s, a) => P(s, { neck: { rot: toward(s) * a } }), range: [0, 80], gonio: { axis: "head>", fixed: "^front", moving: "eye+eye:o" }, focus: "head", zoom: 0.95, view: [0, 1, 0.3] },
  "thoracolumbar-lateral-flexion": { kind: "rom", position: "standing", move: (s, a) => P(s, { trunk: { abd: toward(s) * a } }), range: [0, 35], gonio: { axis: "root", fixed: "^up", moving: "neck01" }, focus: "spine02", zoom: 2.1, view: [0, 0.12, -1] },
  "thoracolumbar-rotation": { kind: "rom", position: "sitting", move: (s, a) => P(s, { trunk: { rot: toward(s) * a } }), range: [0, 45], gonio: { axis: "neck01", fixed: "^lat", moving: "upperarm01" }, focus: "neck01", zoom: 1.35, view: [0, 1, 0.25] },
};

/* ------------------------------------------------------------------ */
/* Manual muscle testing (range = start position → held test position) */
/* ------------------------------------------------------------------ */

const distalThigh = "upperleg01+lowerleg01*0.85";
const distalLeg = "lowerleg01+foot*0.85";
const distalForearm = "lowerarm01+wrist*0.85";

const mmt: Record<string, Demo3DSpec> = {
  "cervical-flexion": { kind: "mmt", position: "supine", move: (s, a) => P(s, { neck: { flex: a } }), range: [0, 40], push: "eye+eye:o", stab: "@xiphoid:m", focus: "neck01", zoom: 1.15, view: [1, 0.25, 0.55] },
  "cervical-extension": { kind: "mmt", position: "prone", move: (s, a) => P(s, { neck: { flex: -a } }), range: [0, 35], push: "head>", stab: "spine01", focus: "neck01", zoom: 1.15, view: [1, 0.3, -0.5] },
  "trunk-flexion": { kind: "mmt", position: "supine", move: (s, a) => P(s, { ...HOOK, trunk: { flex: a }, shoulder: { flex: 30 }, "shoulder:o": { flex: 30 } }), range: [0, 35], focus: "spine02", zoom: 1.9, view: [1, 0.3, 0.45] },
  "trunk-rotation": { kind: "mmt", position: "supine", move: (s, a) => P(s, { ...HOOK, trunk: { flex: a * 0.9, rot: -toward(s) * a }, shoulder: { flex: 40, abd: -15 }, "shoulder:o": { flex: 40 } }), range: [0, 30], focus: "spine02", zoom: 1.9, view: [1, 0.35, 0.5] },
  "trunk-extension": { kind: "mmt", position: "prone", move: (s, a) => P(s, { trunk: { flex: -a } }), range: [0, 25], stab: "foot+foot:o", focus: "spine02", zoom: 2, view: [1, 0.3, -0.4] },
  "serratus-anterior": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { shoulder: { flex: a } }), range: [0, 130], push: "lowerarm01", stab: "@inferior-angle", focus: "upperarm01", zoom: 1.6, view: SIDE_VIEW },
  "middle-trapezius": { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { flex: 90, abd: a, rot: -90 } }), range: [60, 100], push: "lowerarm01", stab: "@scapular-spine:o", focus: "upperarm01", zoom: 1.6, view: [0.35, 1, -0.35] },
  "lower-trapezius": { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { abd: 145, flex: a, rot: -90 } }), range: [0, 20], push: "lowerarm01", stab: "@inferior-angle:o", focus: "upperarm01", zoom: 1.6, view: [1, 0.4, -0.6] },
  rhomboids: { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { flex: -25 - a, abd: 10, rot: 70 }, elbow: { flex: 95 } }), range: [0, 20], push: "lowerarm01", stab: "@scapular-spine:o", focus: "upperarm01", zoom: 1.35, view: [1, 0.3, -0.7] },
  "shoulder-flexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { shoulder: { flex: a }, elbow: { flex: 10, rot: (PRO * a) / 180 } }), range: [0, 90], push: "lowerarm01", stab: "@ac-joint", focus: "upperarm01+lowerarm01", zoom: 1.45, view: SIDE_VIEW },
  "shoulder-extension": { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { flex: -a, rot: 80 } }), range: [0, 50], push: "lowerarm01", stab: "@scapular-spine", focus: "upperarm01", zoom: 1.45, view: PRONE_SIDE },
  "shoulder-abduction": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { shoulder: { abd: a }, elbow: { flex: 10 } }), range: [0, 90], push: "lowerarm01", stab: "@ac-joint", focus: "upperarm01", zoom: 1.45, view: [0.25, 0.15, 1] },
  "shoulder-horizontal-abduction": { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { flex: 90, abd: a }, elbow: { flex: 90 } }), range: [0, 90], push: "lowerarm01", stab: "@scapular-spine", focus: "upperarm01", zoom: 1.45, view: [0.4, 1, -0.4] },
  "shoulder-horizontal-adduction": { kind: "mmt", position: "supine", move: (s, a) => P(s, { shoulder: { flex: 90, abd: 90 - a }, elbow: { flex: 90 } }), range: [0, 100], push: "lowerarm01", stab: "upperarm01:o", focus: "upperarm01", zoom: 1.45, view: [0.5, 0.7, 1] },
  "shoulder-external-rotation": { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { abd: 90, rot: -a }, elbow: { flex: 90 } }), range: [0, 90], push: "wrist", stab: "lowerarm01", focus: "lowerarm01", zoom: 1.15, view: [1, 0.15, -0.35] },
  "shoulder-internal-rotation": { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { abd: 90, rot: a }, elbow: { flex: 90 } }), range: [0, 70], push: "wrist", stab: "lowerarm01", focus: "lowerarm01", zoom: 1.15, view: [1, 0.15, -0.35] },
  "elbow-flexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { shoulder: { flex: 0 }, elbow: { flex: a, rot: SUP } }), range: [5, 95], push: distalForearm, stab: "upperarm01+lowerarm01*0.7", focus: "lowerarm01", zoom: 1.15, view: SIDE_VIEW },
  "elbow-extension": { kind: "mmt", position: "prone", move: (s, a) => P(s, { shoulder: { abd: 90 }, elbow: { flex: 90 - a } }), range: [0, 80], push: distalForearm, stab: "upperarm01+lowerarm01*0.7", focus: "lowerarm01", zoom: 1.15, view: [0.4, 1, -0.3] },
  "forearm-supination": { kind: "mmt", position: "sitting", move: (s, a) => P(s, ELBOW90(a)), range: [PRO * 0.85, SUP * 0.85], push: distalForearm, stab: "upperarm01+lowerarm01*0.75", focus: "wrist", zoom: 0.75, view: [0.25, 0.15, 1] },
  "forearm-pronation": { kind: "mmt", position: "sitting", move: (s, a) => P(s, ELBOW90(a)), range: [SUP * 0.85, PRO * 0.85], push: distalForearm, stab: "upperarm01+lowerarm01*0.75", focus: "wrist", zoom: 0.75, view: [0.25, 0.15, 1] },
  "wrist-flexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), wrist: { flex: a } }), range: [0, 60], push: "finger3-1", stab: "lowerarm01+wrist*0.8", focus: "wrist", zoom: 0.8, view: [1, 0.2, 0.3] },
  "wrist-extension": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), wrist: { flex: -a } }), range: [0, 50], push: "finger3-1", stab: "lowerarm01+wrist*0.8", focus: "wrist", zoom: 0.8, view: [1, 0.2, 0.3] },
  "mcp-flexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), fingers: { flex: a } }), range: [0, 80], push: "finger3-1+finger3-2", stab: "wrist+finger3-1*0.6", focus: "finger3-1", zoom: 0.5, view: [1, 0.3, 0.3] },
  "pip-flexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), fingers: { abd: a } }), range: [0, 90], push: "finger3-2+finger3-3", stab: "finger3-1+finger3-2", focus: "finger3-2", zoom: 0.42, view: [1, 0.3, 0.3] },
  "dip-flexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), fingers: { rot: a } }), range: [0, 70], push: "finger3-3+finger3-3>", stab: "finger3-2+finger3-3", focus: "finger3-3", zoom: 0.4, view: [1, 0.3, 0.3] },
  "finger-extension": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(PRO), fingers: { flex: a, abd: 60, rot: 30 } }), range: [80, 0], push: "finger3-1+finger3-2", stab: "wrist+finger3-1*0.6", focus: "finger3-1", zoom: 0.5, view: [1, 0.3, 0.3] },
  "thumb-abduction": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), thumb: { abd: a } }), range: [0, 60], push: "finger1-2", stab: "wrist+finger3-1*0.6", focus: "finger1-1", zoom: 0.5, view: [1, 0.35, 0.4] },
  "thumb-opposition": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), thumb: { abd: a, flex: a * 0.7, rot: a * 0.5 }, fingers: { flex: a * 0.25 } }), range: [0, 60], push: "finger1-1+finger1-2", stab: "wrist", focus: "finger1-2", zoom: 0.5, view: [0.4, 1, 0.5] },
  "thumb-adduction": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ...ELBOW90(SUP), thumb: { abd: a } }), range: [55, 0], push: "finger1-2", stab: "wrist+finger3-1*0.6", focus: "finger1-1", zoom: 0.5, view: [1, 0.35, 0.4] },
  "hip-flexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { hip: { flex: a } }), range: [88, 112], push: distalThigh, stab: "@iliac-crest", focus: "upperleg01+lowerleg01", zoom: 1.25, view: [1, 0.15, 0.3] },
  "hip-extension": { kind: "mmt", position: "prone", move: (s, a) => P(s, { hip: { flex: -a } }), range: [0, 20], push: distalThigh, stab: "@psis", focus: "upperleg01", zoom: 1.55, view: PRONE_SIDE },
  "hip-abduction": { kind: "mmt", position: "sidelying", move: (s, a) => P(s, { hip: { flex: -5, abd: a }, knee: { flex: 0 } }), range: [0, 30], push: distalThigh, stab: "@iliac-crest", focus: "upperleg01+lowerleg01", zoom: 1.65, view: [0.3, 0.1, 1] },
  "hip-adduction": { kind: "mmt", position: "sidelying", down: "tested", move: (s, a) => P(s, { hip: { flex: 0, abd: -a }, knee: { flex: 0 }, "hip:o": { flex: 0, abd: 25 }, "knee:o": { flex: 0 } }), range: [0, 15], push: distalThigh, stab: "lowerleg01:o", focus: "upperleg01+lowerleg01", zoom: 1.65, view: [0, 0.1, 1] },
  "hip-external-rotation": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { hip: { flex: 88, rot: -a }, "hip:o": { flex: 88, abd: 14 } }), range: [0, 40], push: "foot", stab: distalThigh, focus: "lowerleg01+foot", zoom: 1.05, view: [0.15, 0.12, 1] },
  "hip-internal-rotation": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { hip: { flex: 88, rot: a } }), range: [0, 40], push: "foot", stab: distalThigh, focus: "lowerleg01+foot", zoom: 1.05, view: [0.15, 0.12, 1] },
  "knee-flexion": { kind: "mmt", position: "prone", move: (s, a) => P(s, { knee: { flex: a } }), range: [0, 90], push: distalLeg, stab: "upperleg01+lowerleg01*0.4", focus: "lowerleg01", zoom: 1.35, view: PRONE_SIDE },
  "knee-extension": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { knee: { flex: 85 - a } }), range: [0, 80], push: distalLeg, stab: distalThigh, focus: "lowerleg01", zoom: 1.25, view: SIDE_VIEW },
  "ankle-plantarflexion": { kind: "mmt", position: "standing", planted: "toe3-1", move: (s, a) => P(s, { ankle: { flex: -a }, toe: { flex: a * 0.9 }, "knee:o": { flex: 75 }, "hip:o": { flex: 15 } }), range: [0, 35], focus: "foot+lowerleg01", zoom: 1.35, view: [1, 0.45, 0.5] },
  "ankle-dorsiflexion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ankle: { flex: a, rot: Math.max(0, a) * 0.5 } }), range: [-15, 15], push: "toe2-1", stab: distalLeg, focus: "foot", zoom: 0.8, view: [1, 0.12, 0.4] },
  "foot-inversion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ankle: { flex: -10, rot: a } }), range: [0, 30], push: "toe1-1", stab: distalLeg, focus: "foot", zoom: 0.75, view: [0.2, 0.25, 1] },
  "foot-eversion": { kind: "mmt", position: "sitting", move: (s, a) => P(s, { ankle: { rot: -a } }), range: [0, 20], push: "toe5-1", stab: distalLeg, focus: "foot", zoom: 0.75, view: [0.2, 0.25, 1] },
  "great-toe-extension": { kind: "mmt", position: "supine", move: (s, a) => P(s, { toe: { flex: a }, "hip:o": { abd: 22 } }), range: [0, 50], push: "toe1-2", stab: "foot+toe1-1*0.7", focus: "toe1-1", zoom: 0.5, view: [-0.9, 0.25, 0.8] },
};

/* ------------------------------------------------------------------ */
/* Muscle length (range = start → end of the muscle's length)          */
/* ------------------------------------------------------------------ */

const length: Record<string, Demo3DSpec> = {
  "modified-thomas": { kind: "length", position: "supine", shift: 1.02, label: "Hip flexion", move: (s, a) => P(s, { hip: { flex: a }, knee: { flex: 80 + (clamp(a, 0, 110) / 110) * 50 }, "hip:o": { flex: 120 }, "knee:o": { flex: 135 } }), range: [110, 0], gonio: hipGonio, push: distalThigh, stab: "lowerleg01:o", focus: "upperleg01", zoom: 1.7, view: [1, 0.05, 0.35] },
  ely: { kind: "length", position: "prone", label: "Knee flexion", move: (s, a) => P(s, { knee: { flex: a } }), range: [0, 125], gonio: kneeGonio, push: distalLeg, stab: "@psis", focus: "lowerleg01", zoom: 1.4, view: PRONE_SIDE },
  ober: { kind: "length", position: "sidelying", label: "Hip abduction (− = below horizontal)", read: (a) => a, move: (s, a) => P(s, { hip: { flex: -10, abd: a }, knee: { flex: 90 } }), range: [30, -10], gonio: { axis: "upperleg01", fixed: "^feet", moving: "lowerleg01" }, push: "lowerleg01", stab: "@iliac-crest", focus: "upperleg01+lowerleg01", zoom: 1.6, view: [0.4, 0.1, -1] },
  "passive-slr": { kind: "length", position: "supine", label: "Hip flexion", move: (s, a) => P(s, { hip: { flex: a } }), range: [0, 80], gonio: hipGonio, push: distalLeg, stab: "upperleg01:o+lowerleg01:o", focus: "upperleg01+lowerleg01", zoom: 1.75, view: [1, 0.08, 0.3] },
  aket: { kind: "length", position: "supine", label: "Knee short of full extension", move: (s, a) => P(s, { hip: { flex: 90 }, knee: { flex: a } }), range: [90, 20], gonio: kneeGonio, push: distalLeg, stab: distalThigh, focus: "lowerleg01", zoom: 1.45, view: [1, 0.08, 0.3] },
  gastrocnemius: { kind: "length", position: "supine", label: "Dorsiflexion (knee straight)", read: (a) => a, move: (s, a) => P(s, { ankle: { flex: a } }), range: [-10, 12], gonio: ankleGonio, push: "toe3-1", stab: "lowerleg01", focus: "foot", zoom: 0.8, view: [1, 0.05, 0.25] },
  soleus: { kind: "length", position: "prone", label: "Dorsiflexion (knee bent 90°)", read: (a) => a, move: (s, a) => P(s, { knee: { flex: 90 }, ankle: { flex: a } }), range: [-10, 20], gonio: ankleGonio, push: "toe3-1", stab: "lowerleg01+foot*0.5", focus: "foot", zoom: 0.85, view: [1, 0.1, -0.3] },
  "hip-adductors": { kind: "length", position: "supine", label: "Hip abduction", move: (s, a) => P(s, { hip: { abd: a } }), range: [0, 45], gonio: { axis: "@asis", fixed: "^feet", moving: "lowerleg01" }, push: distalLeg, stab: "@asis:o", focus: "upperleg01+lowerleg01", zoom: 1.65, view: [0.25, 0.1, 1] },
  piriformis: { kind: "length", position: "supine", label: "Hip adduction (hip bent 60°)", move: (s, a) => P(s, { hip: { flex: 60, abd: -a, rot: a * 0.5 }, knee: { flex: 90 } }), range: [0, 25], push: "lowerleg01", stab: "@asis", focus: "upperleg01+lowerleg01", zoom: 1.35, view: [0.4, 0.45, 1] },
  "pec-major": { kind: "length", position: "supine", label: "Arm lowered from vertical", move: (s, a) => P(s, { ...HOOK, shoulder: { flex: 90, abd: a, rot: -60 } }), range: [20, 90], push: "lowerarm01", stab: "upperarm01:o", focus: "upperarm01", zoom: 1.45, view: [0.25, 1, 0.55] },
  latissimus: { kind: "length", position: "supine", label: "Shoulder flexion (both arms)", move: (s, a) => P(s, { ...HOOK, shoulder: { flex: a }, "shoulder:o": { flex: a } }), range: [0, 180], gonio: shoulderGonio, focus: "upperarm01", zoom: 1.8, view: [1, 0.15, 0.45] },
  "upper-trapezius": { kind: "length", position: "sitting", label: "Neck side flexion away", move: (s, a) => P(s, { neck: { flex: a * 0.25, abd: -toward(s) * a, rot: toward(s) * a * 0.3 } }), range: [0, 45], push: "head>", stab: "@ac-joint", focus: "neck01+head", zoom: 1.05, view: [0.3, 0.15, -1] },
  "levator-scapulae": { kind: "length", position: "sitting", label: "Neck flexion, side flexion and rotation away", move: (s, a) => P(s, { neck: { flex: a * 0.8, abd: -toward(s) * a * 0.6, rot: -toward(s) * a * 0.6 } }), range: [0, 45], push: "head>", stab: "@scapular-spine", focus: "neck01+head", zoom: 1.05, view: [0.6, 0.3, -1] },
};

/* ------------------------------------------------------------------ */
/* Myotomes: the key muscle of each root, tested exactly as in the muscle-testing atlas */
/* ------------------------------------------------------------------ */

const myo = (spec: Demo3DSpec, label: string): Demo3DSpec => ({ ...spec, label });
const myotomes: Record<string, Demo3DSpec> = {
  "c1-c2": myo(mmt["cervical-flexion"], "C1–C2 myotome · neck flexion"),
  c3: { kind: "mmt", position: "sitting", label: "C3 myotome · neck side-flexion", move: (s, a) => P(s, { neck: { abd: toward(s) * a } }), range: [0, 30], push: "@ear", stab: "@ac-joint:o", focus: "neck01", zoom: 1.15, view: [0.2, 0.3, 1] },
  c5: myo(mmt["shoulder-abduction"], "C5 myotome · shoulder abduction (deltoid)"),
  c6: myo(mmt["wrist-extension"], "C6 myotome · wrist extension"),
  c7: myo(mmt["elbow-extension"], "C7 myotome · elbow extension (triceps)"),
  c8: myo(mmt["dip-flexion"], "C8 myotome · finger flexion (FDP)"),
  l2: myo(mmt["hip-flexion"], "L2 myotome · hip flexion (iliopsoas)"),
  l3: myo(mmt["knee-extension"], "L3 myotome · knee extension (quadriceps)"),
  l4: myo(mmt["ankle-dorsiflexion"], "L4 myotome · ankle dorsiflexion"),
  l5: myo(mmt["great-toe-extension"], "L5 myotome · great-toe extension"),
  s1: myo(mmt["ankle-plantarflexion"], "S1 myotome · plantarflexion (toe raise)"),
  s2: myo(mmt["knee-flexion"], "S2 myotome · knee flexion (hamstrings)"),
};

const prefix = (skill: string, specs: Record<string, Demo3DSpec>) => Object.fromEntries(Object.entries(specs).map(([id, spec]) => [`${skill}/${id}`, spec]));

export const DEMO3D: Record<string, Demo3DSpec> = {
  ...prefix("goniometry", goniometry),
  ...prefix("manual-muscle-testing", mmt),
  ...prefix("muscle-length", length),
  ...prefix("myotomes", myotomes),
  // Concept demonstrations reuse an atlas item.
  "goniometry/concept:the-instrument": goniometry["knee-flexion"],
  "myotomes/concept:how-to-screen": myotomes.c5,
  "myotomes/concept:isncsci-key-muscles": myotomes.c7,
  "manual-muscle-testing/concept:gravity-decides": mmt["shoulder-abduction"],
  "manual-muscle-testing/concept:resistance": mmt["elbow-flexion"],
};

/** Items that stay as 2D diagrams on purpose (movement the 3D patient cannot show). */
export const DEMO3D_2D_ONLY = ["myotomes/c4", "myotomes/t1", "manual-muscle-testing/upper-trapezius", "manual-muscle-testing/pelvic-elevation", "manual-muscle-testing/finger-abduction", "manual-muscle-testing/finger-adduction", "muscle-length/pec-minor", "goniometry/lumbar-flexion-schober", "goniometry/tmj-opening"];

export const hasDemo3D = (key: string) => key in DEMO3D;
