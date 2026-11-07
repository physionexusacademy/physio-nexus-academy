/**
 * Named skin points on the virtual patient, found on the real mesh at load time:
 *  - soft-tissue palpation sites (ligaments, joint lines) that sit too close to a
 *    bony landmark to be told apart by a tap's nearest-landmark search, and
 *  - sensory key points (ISNCSCI dermatome points and peripheral nerve zones)
 *    for the Sensation tool's quick test.
 *
 * Each point is a probe in the model's rest pose (metres, y up, patient's left +x,
 * front +z) for the patient's LEFT side: start inside the body at `origin` and look
 * along `dir`; the outermost skin vertex within `radius` of that ray is the point.
 * The right side is the mirror image. This module has no three.js import, so the
 * case validator can use the ids.
 */
import rig from "./generated/rig.json";

export type Vec = [number, number, number];
export type SkinProbe = { origin: Vec; dir: Vec; radius: number };

type Bone = { name: string; head: number[]; tail: number[] };
const bones = new Map((rig.bones as Bone[]).map((b) => [b.name, b]));
const H = (name: string) => bones.get(name)!.head as Vec;
const T = (name: string) => bones.get(name)!.tail as Vec;
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const lerp = (a: Vec, b: Vec, t: number): Vec => add(a, scale(sub(b, a), t));
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec): Vec => scale(a, 1 / (Math.hypot(...a) || 1));
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mix = (...parts: [Vec, number][]): Vec => norm(parts.reduce<Vec>((sum, [v, k]) => add(sum, scale(norm(v), k)), [0, 0, 0]));
const mid = (name: string, t = 0.5) => lerp(H(name), T(name), t);

/* Rest-pose reference geometry (left side). */
const shoulder = H("upperarm01.L");
const elbow = H("lowerarm01.L");
const wrist = H("wrist.L");
const hip = H("upperleg01.L");
const knee = H("lowerleg01.L");
const ankle = H("foot.L");
const neckBase = H("neck01");
const armAxis = norm(sub(elbow, shoulder));
const armLateral = norm([-armAxis[1], armAxis[0], 0]);
const forearm = norm(sub(wrist, elbow));
const radialRaw = sub(H("finger1-1.L"), wrist);
const radial = norm(sub(radialRaw, scale(forearm, dot(radialRaw, forearm))));
const handDistal = norm(sub(H("finger3-1.L"), wrist));
const handRadial = norm(sub(H("finger2-1.L"), H("finger5-1.L")));
const palmar = norm(cross(handDistal, handRadial));
const dorsal = scale(palmar, -1);
const FRONT: Vec = [0, 0, 1];
const BACK: Vec = [0, 0, -1];
const UP: Vec = [0, 1, 0];
const DOWN: Vec = [0, -1, 0];
const LATERAL: Vec = [1, 0, 0];
const MEDIAL: Vec = [-1, 0, 0];

const probe = (origin: Vec, dir: Vec, radius: number): SkinProbe => ({ origin, dir: norm(dir), radius });

export type SoftSite = { id: string; name: string; probe: SkinProbe };
/** Soft-tissue palpation sites — palpated like landmarks, alongside the bony ones in rig.json. */
export const SOFT_SITES: SoftSite[] = [
  { id: "atfl", name: "ATFL (in front of the lateral malleolus)", probe: probe(add(ankle, [0.005, -0.012, 0.03]), mix([LATERAL, 1], [FRONT, 0.55]), 0.03) },
  { id: "medial-joint-line", name: "Medial knee joint line", probe: probe(add(knee, [0, -0.008, 0.012]), mix([MEDIAL, 1], [FRONT, 0.35]), 0.035) },
  { id: "lateral-joint-line", name: "Lateral knee joint line", probe: probe(add(knee, [0, -0.008, 0.012]), mix([LATERAL, 1], [FRONT, 0.35]), 0.035) },
  { id: "subacromial", name: "Just below the acromion (supraspinatus insertion)", probe: probe(lerp(shoulder, elbow, 0.08), mix([armLateral, 1], [FRONT, 0.35]), 0.035) },
  { id: "bicipital-groove", name: "Bicipital groove", probe: probe(lerp(shoulder, elbow, 0.14), mix([FRONT, 1], [armLateral, 0.25]), 0.03) },
  { id: "common-extensor-origin", name: "Common extensor origin (tennis elbow)", probe: probe(lerp(elbow, wrist, 0.1), mix([armLateral, 1], [FRONT, 0.25]), 0.03) },
];
export const SOFT_SITE_IDS = SOFT_SITES.map((s) => s.id);

export type KeyPoint = { id: string; label: string; group: "Dermatome key points" | "Nerve zones"; where: string; probe: SkinProbe };
const dermatome = (id: string, where: string, p: SkinProbe): KeyPoint => ({ id, label: id, group: "Dermatome key points", where, probe: p });
const nerve = (id: string, label: string, where: string, p: SkinProbe): KeyPoint => ({ id, label, group: "Nerve zones", where, probe: p });

/** ISNCSCI dermatome key points and the autonomous zones of the main cutaneous nerves. */
export const KEY_POINTS: KeyPoint[] = [
  dermatome("C4", "Top of the AC joint", probe(sub(lerp(T("clavicle.L"), shoulder, 0.6), [0, 0.02, 0]), UP, 0.03)),
  dermatome("C5", "Lateral side of the antecubital fossa", probe(sub(elbow, scale(armAxis, 0.07)), mix([armLateral, 1], [FRONT, 0.5]), 0.03)),
  dermatome("C6", "Back of the thumb, proximal phalanx", probe(mid("finger1-2.L"), dorsal, 0.012)),
  dermatome("C7", "Back of the middle finger, proximal phalanx", probe(mid("finger3-1.L"), dorsal, 0.01)),
  dermatome("C8", "Back of the little finger, proximal phalanx", probe(mid("finger5-1.L"), dorsal, 0.01)),
  dermatome("T1", "Medial side of the antecubital fossa", probe(sub(elbow, scale(armAxis, 0.03)), mix([scale(armLateral, -1), 1], [FRONT, 0.6]), 0.03)),
  dermatome("T4", "Nipple line", probe([T("breast.L")[0], T("breast.L")[1], neckBase[2] - 0.02], FRONT, 0.03)),
  dermatome("T10", "Level of the umbilicus", probe([0.075, hip[1] + 0.1, hip[2]], FRONT, 0.03)),
  // Mid-anterior thigh, just below the exam shorts.
  dermatome("L2", "Middle of the front of the thigh", probe(lerp(knee, hip, 0.52), FRONT, 0.04)),
  dermatome("L3", "Medial femoral condyle", probe(add(knee, [0, 0.025, 0]), mix([MEDIAL, 1], [FRONT, 0.2]), 0.035)),
  dermatome("L4", "Medial malleolus", probe(ankle, MEDIAL, 0.04)),
  dermatome("L5", "Top of the foot at the 3rd MTP joint", probe(H("toe3-1.L"), mix([UP, 1], [FRONT, 0.15]), 0.02)),
  dermatome("S1", "Lateral side of the heel", probe(add(ankle, [0, -0.045, -0.035]), mix([LATERAL, 1], [BACK, 0.35]), 0.03)),
  dermatome("S2", "Middle of the popliteal fossa", probe(knee, BACK, 0.05)),
  nerve("axillary", "Axillary", "Regimental badge area over the lateral deltoid", probe(lerp(shoulder, elbow, 0.3), armLateral, 0.04)),
  nerve("musculocutaneous", "Musculocutaneous", "Lateral forearm", probe(lerp(elbow, wrist, 0.45), mix([radial, 1], [FRONT, 0.3]), 0.03)),
  nerve("radial", "Radial", "Back of the first web space", probe(lerp(H("finger1-2.L"), H("finger2-1.L"), 0.5), dorsal, 0.015)),
  nerve("median", "Median", "Pad of the index finger", probe(mid("finger2-3.L"), palmar, 0.01)),
  nerve("ulnar", "Ulnar", "Pad of the little finger", probe(mid("finger5-3.L"), palmar, 0.01)),
  nerve("saphenous", "Saphenous", "Medial side of the leg", probe(lerp(knee, ankle, 0.55), mix([MEDIAL, 1], [FRONT, 0.2]), 0.04)),
  nerve("superficial-fibular", "Superficial fibular", "Top of the foot", probe(lerp(ankle, H("toe3-1.L"), 0.45), UP, 0.03)),
  nerve("deep-fibular", "Deep fibular", "First web space of the foot", probe(lerp(H("toe1-1.L"), H("toe2-1.L"), 0.5), UP, 0.015)),
  nerve("sural", "Sural", "Lateral border of the foot", probe(lerp(ankle, H("toe5-1.L"), 0.35), mix([LATERAL, 1], [DOWN, 0.2]), 0.03)),
  nerve("tibial", "Tibial", "Sole of the foot", probe(lerp(ankle, H("toe3-1.L"), 0.5), DOWN, 0.03)),
];

/** The same probe for the patient's right side (mirror image across the midline). */
export function mirrorProbe(p: SkinProbe): SkinProbe {
  return { origin: [-p.origin[0], p.origin[1], p.origin[2]], dir: [-p.dir[0], p.dir[1], p.dir[2]], radius: p.radius };
}
