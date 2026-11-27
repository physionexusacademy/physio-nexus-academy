/**
 * Skin points for the Treatment stage: the centre of each treatment area and four points around it (electrodes, the corners of a pack),
 * found on the real mesh like the dermatome key points (see points.ts: a rest-pose probe for the patient's LEFT side, mirrored for the
 * right). Resolved in 3D as "key:tx-<area>" and "key:tx-<area>-e1" … "-e4". No three.js import, so data and validators can use the ids.
 */
import rig from "./generated/rig.json";
import type { SkinProbe, Vec } from "./points";

type Bone = { name: string; head: number[]; tail: number[] };
const bones = new Map((rig.bones as Bone[]).map((b) => [b.name, b]));
const H = (name: string) => bones.get(name)!.head as Vec;
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const lerp = (a: Vec, b: Vec, t: number): Vec => add(a, scale(sub(b, a), t));
const norm = (a: Vec): Vec => scale(a, 1 / (Math.hypot(...a) || 1));
const mix = (...parts: [Vec, number][]): Vec => norm(parts.reduce<Vec>((sum, [v, k]) => add(sum, scale(norm(v), k)), [0, 0, 0]));

const shoulder = H("upperarm01.L");
const elbow = H("lowerarm01.L");
const wrist = H("wrist.L");
const hip = H("upperleg01.L");
const knee = H("lowerleg01.L");
const ankle = H("foot.L");
const armAxis = norm(sub(elbow, shoulder));
const armLateral = norm([-armAxis[1], armAxis[0], 0]);
const forearm = norm(sub(wrist, elbow));
const FRONT: Vec = [0, 0, 1];
const BACK: Vec = [0, 0, -1];
const UP: Vec = [0, 1, 0];
const DOWN: Vec = [0, -1, 0];
const LATERAL: Vec = [1, 0, 0];

export type TreatArea =
  | "lumbar" | "thoracic" | "cervical" | "shoulder" | "elbow-lateral" | "elbow-medial" | "wrist" | "forearm-dorsal"
  | "hip" | "thigh" | "knee" | "fibular-head" | "shin" | "calf" | "achilles" | "ankle" | "heel";

type AreaDef = {
  origin: Vec;
  /** Outward direction of the skin (the probe looks along it). */
  dir: Vec;
  /** Along the body or limb (rest pose), and across it: where the four surrounding points go. */
  along: Vec;
  across: Vec;
  /** Half-distances (m) of the surrounding points along and across. */
  spread: [number, number];
  radius: number;
  /** Midline areas have no side. */
  midline?: boolean;
};

export const TREAT_AREAS: Record<TreatArea, AreaDef> = {
  lumbar: { origin: add(H("spine05"), [0, 0.03, 0]), dir: BACK, along: UP, across: LATERAL, spread: [0.06, 0.055], radius: 0.05, midline: true },
  thoracic: { origin: H("spine02"), dir: BACK, along: UP, across: LATERAL, spread: [0.07, 0.06], radius: 0.05, midline: true },
  cervical: { origin: lerp(H("neck01"), H("neck02"), 0.4), dir: BACK, along: UP, across: LATERAL, spread: [0.03, 0.03], radius: 0.035, midline: true },
  shoulder: { origin: lerp(shoulder, elbow, 0.12), dir: armLateral, along: scale(armAxis, -1), across: FRONT, spread: [0.05, 0.04], radius: 0.04 },
  "elbow-lateral": { origin: lerp(elbow, wrist, 0.1), dir: mix([armLateral, 1], [FRONT, 0.25]), along: forearm, across: FRONT, spread: [0.04, 0.025], radius: 0.03 },
  "elbow-medial": { origin: lerp(elbow, shoulder, 0.02), dir: mix([scale(armLateral, -1), 1], [BACK, 0.3]), along: scale(armAxis, -1), across: FRONT, spread: [0.04, 0.02], radius: 0.03 },
  wrist: { origin: lerp(elbow, wrist, 0.9), dir: FRONT, along: forearm, across: LATERAL, spread: [0.035, 0.02], radius: 0.025 },
  "forearm-dorsal": { origin: lerp(elbow, wrist, 0.3), dir: mix([armLateral, 1], [BACK, 0.4]), along: forearm, across: FRONT, spread: [0.05, 0.02], radius: 0.03 },
  hip: { origin: add(hip, [0.04, -0.035, 0]), dir: LATERAL, along: UP, across: FRONT, spread: [0.06, 0.045], radius: 0.05 },
  thigh: { origin: lerp(knee, hip, 0.3), dir: FRONT, along: UP, across: LATERAL, spread: [0.08, 0.04], radius: 0.045 },
  knee: { origin: add(knee, [0, 0.015, 0]), dir: FRONT, along: UP, across: LATERAL, spread: [0.06, 0.045], radius: 0.04 },
  "fibular-head": { origin: add(knee, [0.035, -0.05, -0.005]), dir: LATERAL, along: UP, across: FRONT, spread: [0.04, 0.025], radius: 0.035 },
  shin: { origin: lerp(knee, ankle, 0.3), dir: mix([FRONT, 1], [LATERAL, 0.5]), along: UP, across: LATERAL, spread: [0.07, 0.02], radius: 0.035 },
  calf: { origin: lerp(knee, ankle, 0.3), dir: BACK, along: UP, across: LATERAL, spread: [0.06, 0.03], radius: 0.04 },
  achilles: { origin: add(ankle, [0, 0.05, -0.01]), dir: BACK, along: UP, across: LATERAL, spread: [0.04, 0.02], radius: 0.025 },
  ankle: { origin: add(ankle, [0.005, -0.012, 0.03]), dir: mix([LATERAL, 1], [FRONT, 0.55]), along: UP, across: FRONT, spread: [0.035, 0.03], radius: 0.03 },
  heel: { origin: add(ankle, [-0.004, -0.04, -0.03]), dir: mix([DOWN, 1], [BACK, 0.2]), along: FRONT, across: LATERAL, spread: [0.03, 0.02], radius: 0.03 },
};

const probe = (origin: Vec, dir: Vec, radius: number): SkinProbe => ({ origin, dir: norm(dir), radius });

export type TreatPoint = { id: string; probe: SkinProbe };
/** tx-<area> (centre) and tx-<area>-e1 … e4 (along +, along −, across +, across −) for every area. */
export const TREAT_POINTS: TreatPoint[] = (Object.entries(TREAT_AREAS) as [TreatArea, AreaDef][]).flatMap(([id, a]) => {
  const at = (u: number, v: number) => add(add(a.origin, scale(norm(a.along), u * a.spread[0])), scale(norm(a.across), v * a.spread[1]));
  return [
    { id: `tx-${id}`, probe: probe(a.origin, a.dir, a.radius) },
    { id: `tx-${id}-e1`, probe: probe(at(1, 1), a.dir, a.radius * 0.7) },
    { id: `tx-${id}-e2`, probe: probe(at(-1, -1), a.dir, a.radius * 0.7) },
    { id: `tx-${id}-e3`, probe: probe(at(1, -1), a.dir, a.radius * 0.7) },
    { id: `tx-${id}-e4`, probe: probe(at(-1, 1), a.dir, a.radius * 0.7) },
  ];
});
