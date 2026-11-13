/** Dermatomes: the level glows on the 3D skin, then the key sensory point is found and tested (light touch, then pinprick). */
import { P } from "../../virtual-patient/parts.ts";
import type { Scene } from "../scene-types.ts";

/** Dermatome key points that exist on the skin (virtual-patient/points.ts KEY_POINTS; the validator checks this list). The other levels use the middle of the glowing zone. */
export const DERMATOME_KEY_IDS = ["C4", "C5", "C6", "C7", "C8", "T1", "T4", "T10", "L2", "L3", "L4", "L5", "S1", "S2"];
const hasKey = (id: string) => DERMATOME_KEY_IDS.includes(id);

type Spec = { id: string; levels: string[]; where: string; area: string; view?: [number, number, number]; zoom?: number };

const SPECS: Spec[] = [
  { id: "c2", levels: ["C2"], where: "Occipital protuberance, at the back of the head", area: "back of the head", view: [0.5, 0.2, -1] },
  { id: "c3", levels: ["C3"], where: "Supraclavicular fossa, just above the collarbone", area: "neck", view: [0.7, 0.2, 1] },
  { id: "c4", levels: ["C4"], where: "Top of the acromioclavicular joint", area: "top of the shoulder", view: [0.8, 0.3, 1] },
  { id: "c5", levels: ["C5"], where: "Lateral side of the antecubital fossa", area: "outer upper arm", view: [1, 0.15, 0.7] },
  { id: "c6", levels: ["C6"], where: "Back of the thumb, proximal phalanx", area: "outer forearm, thumb and index finger", view: [1, 0.25, 0.5] },
  { id: "c7", levels: ["C7"], where: "Back of the middle finger, proximal phalanx", area: "back of the forearm and middle finger", view: [1, 0.25, 0.35] },
  { id: "c8", levels: ["C8"], where: "Back of the little finger, proximal phalanx", area: "inner forearm and little finger", view: [1, 0.25, 0.35] },
  { id: "t1", levels: ["T1"], where: "Medial side of the antecubital fossa", area: "inner upper arm and forearm", view: [1, 0.15, 0.7] },
  { id: "t2", levels: ["T2"], where: "Apex of the axilla", area: "upper chest and inner upper arm", view: [0.6, 0.2, 1] },
  { id: "t4", levels: ["T4"], where: "Nipple line", area: "chest at the nipple line", view: [0.4, 0.1, 1] },
  { id: "t6", levels: ["T6"], where: "Xiphisternum", area: "lower chest", view: [0.4, 0.1, 1] },
  { id: "t10", levels: ["T10"], where: "Level of the umbilicus", area: "abdomen at the umbilicus", view: [0.4, 0.1, 1] },
  { id: "l2", levels: ["L2"], where: "Middle of the front of the thigh", area: "front of the thigh", view: [0.7, 0.1, 1] },
  { id: "l3", levels: ["L3"], where: "Medial femoral condyle", area: "inner thigh and knee", view: [-0.8, 0.1, 1] },
  { id: "l4", levels: ["L4"], where: "Medial malleolus", area: "inner shin and ankle", view: [-0.9, 0.1, 1] },
  { id: "l5", levels: ["L5"], where: "Top of the foot at the 3rd metatarsophalangeal joint", area: "outer shin, top of the foot, big toe", view: [0.7, 0.2, 1] },
  { id: "s1", levels: ["S1"], where: "Lateral side of the heel", area: "outer foot, heel and calf", view: [0.9, 0.1, -0.7] },
  { id: "s2", levels: ["S2"], where: "Midpoint of the popliteal fossa", area: "back of the thigh and knee", view: [0.3, 0.1, -1] },
];

function dermatomeScene(spec: Spec): Scene {
  const level = spec.levels[0];
  const point = hasKey(level) ? `key:${level}` : "zone";
  return {
    kind: "zone",
    position: "standing",
    loopMs: 13000,
    // Arms and legs a little away from the body so every zone can be seen.
    pose: (s) => P(s, { shoulder: { abd: 28 }, "shoulder:o": { abd: 28 }, hip: { abd: 9 }, "hip:o": { abd: 9 } }),
    frame: { zone: true, focus: "zone", zoom: 0.85, view: spec.view ?? [1, 0.15, 1] },
    zone: { dermatomes: spec.levels, when: [0.02, 1] },
    beats: [
      { to: 0.24, text: `${level} dermatome: ${spec.area}`, chip: "Find it" },
      { to: 0.45, text: `Key sensory point: ${spec.where}`, chip: "Key point" },
      { to: 0.73, text: "Light touch with cotton wool — compare both sides", chip: "Light touch" },
      { to: 1, text: "Pinprick: ask “sharp or blunt?”", chip: "Pinprick" },
    ],
    overlays: [
      { t: "beacon", at: point, label: "Key point", when: [0.24, 0.45] },
      { t: "beacon", at: point, when: [0.45, 1] },
      { t: "touch", at: point, style: "tap", label: "Light touch", tone: "cyan", when: [0.45, 0.73] },
      { t: "touch", at: point, style: "press", label: "Pinprick", tone: "amber", when: [0.73, 1] },
    ],
    hud: [
      { t: "stat", label: "Dermatome", value: level, sub: spec.area, tone: "cyan" },
      { t: "stat", label: "Side", value: (c) => (c.side === "left" ? "Left" : "Right"), tone: "white", at: "bl", when: [0.45, 1] },
    ],
  };
}

export const dermatomeScenes: Record<string, Scene> = Object.fromEntries(SPECS.map((s) => [`dermatomes/${s.id}`, dermatomeScene(s)]));

/**
 * Stay 2D diagrams on purpose: saddle (S3, S4–S5) skin is perianal and examined privately with a chaperone; T12 and L1 lie at the groin, under the
 * patient's shorts, so there is no skin to glow on the 3D model.
 */
export const DERMATOME_2D_ONLY = ["dermatomes/s3", "dermatomes/s45", "dermatomes/t12", "dermatomes/l1"];
