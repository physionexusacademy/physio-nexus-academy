/** Posture: the ideal alignment against a plumb line, then the deviation develops and the line shows how far each landmark has moved. */
import { P } from "../../virtual-patient/parts.ts";
import type { Overlay, Scene } from "../scene-types.ts";
import { ramp } from "./shared.ts";

type Parts = Parameters<typeof P>[1];
type Posture = {
  id: string;
  title: string;
  /** Pose parts at full deviation (m = 1); scaled by the morph. */
  dev: (m: number) => Parts;
  view: "side" | "front" | "back";
  what: string;
  why: string;
  /** Extra overlays (a pelvic line, a limb axis). */
  extra?: Overlay[];
  zoom?: number;
  focus?: string;
  /** Keep the feet where they started (a posture that tilts the pelvis must not swing the legs). */
  planted?: boolean;
};

const VIEW = { side: [1, 0.06, 0.02] as [number, number, number], front: [0.12, 0.06, 1] as [number, number, number], back: [0.12, 0.06, -1] as [number, number, number] };
const PLUMB_SIDE: Overlay = { t: "plumb", from: "@lateral-malleolus", marks: [{ at: "@ear", label: "Ear" }, { at: "@ac-joint", label: "Shoulder" }, { at: "@greater-trochanter", label: "Hip" }, { at: "lowerleg01", label: "Knee" }] };

const POSTURES: Posture[] = [
  { id: "forward-head", title: "Forward head posture", view: "side", dev: (m) => ({ neck: { flex: 22 * m }, head: { flex: -12 * m } }), what: "The head sits in front of the plumb line: the lower neck flexes and the upper neck extends", why: "Overloads the posterior neck muscles and the facet joints; the deep neck flexors lengthen and weaken (upper crossed syndrome)" },
  { id: "rounded-shoulders", title: "Rounded shoulders (protracted scapulae)", view: "side", dev: (m) => ({ shoulder: { rot: 20 * m, flex: 7 * m }, "shoulder:o": { rot: 20 * m, flex: 7 * m }, trunk: { flex: 5 * m } }), what: "The shoulders roll forward and the arms turn inwards so the palms face backwards", why: "Pectoralis minor and major shorten while the lower and middle trapezius lengthen; linked with shoulder impingement" },
  { id: "hyperkyphosis", title: "Thoracic hyperkyphosis", view: "side", dev: (m) => ({ trunk: { flex: 13 * m }, neck: { flex: 9 * m }, head: { flex: -4 * m } }), planted: true, what: "An increased forward curve of the upper back (a Cobb angle over 40°) with the head pushed forward", why: "Common with age, osteoporosis and Scheuermann’s disease; reduces chest expansion and shoulder elevation" },
  { id: "kypho-lordotic", title: "Kypho-lordotic posture", view: "side", dev: (m) => ({ trunk: { flex: -2 * m }, hip: { flex: 9 * m }, "hip:o": { flex: 9 * m }, neck: { flex: 8 * m } }), planted: true, what: "Increased thoracic kyphosis with an anterior pelvic tilt and an increased lumbar lordosis", why: "Tight hip flexors and lumbar extensors with weak abdominals and gluteals (lower crossed syndrome)" },
  { id: "sway-back", title: "Sway-back posture", view: "side", dev: (m) => ({ hip: { flex: -6 * m }, "hip:o": { flex: -6 * m }, knee: { flex: -4 * m }, "knee:o": { flex: -4 * m }, trunk: { flex: 6 * m }, neck: { flex: 5 * m } }), planted: true, what: "The pelvis shifts forward of the plumb line, the hips and knees hang back in extension and the upper trunk leans back", why: "Hamstrings and upper abdominals are strong; hip flexors, external obliques and neck flexors are weak" },
  { id: "flat-back", title: "Flat-back posture", view: "side", dev: (m) => ({ hip: { flex: -5 * m }, "hip:o": { flex: -5 * m }, trunk: { flex: 4 * m }, neck: { flex: 6 * m } }), planted: true, what: "A posterior pelvic tilt with a reduced lumbar lordosis and a small thoracic curve", why: "Tight hamstrings and abdominals; poor tolerance for prolonged standing and for sitting" },
  { id: "scoliosis", title: "Scoliosis", view: "back", dev: (m) => ({ trunk: { abd: 14 * m, rot: 8 * m } }), what: "A sideways curve of the spine with rotation: one shoulder and one scapula sit higher, and the waist creases are uneven", why: "Check with the forward-bend (Adams) test for the rib hump; refer curves over 20° and any painful or fast-progressing curve" , zoom: 3.4, focus: "spine03" },
  { id: "lateral-pelvic-tilt", title: "Lateral pelvic tilt", view: "front", dev: (m) => ({ hip: { abd: 9 * m }, "hip:o": { abd: -9 * m }, trunk: { abd: -6 * m } }), what: "One iliac crest and ASIS sit higher than the other", why: "Leg-length difference, scoliosis or hip abductor imbalance; confirm with leg-length measures", extra: [{ t: "line", from: "@asis", to: "@asis:o", tone: "amber", dashed: true, label: "ASIS line", when: [0.05, 1] }] },
  { id: "genu-valgum", title: "Genu valgum (knock knees)", view: "front", dev: (m) => ({ hip: { abd: -5 * m, rot: 6 * m }, "hip:o": { abd: -5 * m, rot: 6 * m }, knee: { abd: 11 * m }, "knee:o": { abd: 11 * m }, ankle: { rot: -10 * m }, "ankle:o": { rot: -10 * m } }), what: "The knees angle towards each other and the ankles stay apart (the intermalleolar distance widens)", why: "Normal in 3–6 year olds; persistent deformity loads the lateral knee and overstretches the medial collateral structures", extra: [{ t: "angle", vertex: "lowerleg01", a: "upperleg01", b: "foot", tone: "amber", label: (c, d) => `Knee axis ${Math.round(d)}°`, when: [0.3, 1] }] },
  { id: "genu-varum", title: "Genu varum (bow legs)", view: "front", dev: (m) => ({ hip: { abd: 3 * m, rot: -6 * m }, "hip:o": { abd: 3 * m, rot: -6 * m }, knee: { abd: -10 * m }, "knee:o": { abd: -10 * m }, ankle: { rot: 8 * m }, "ankle:o": { rot: 8 * m } }), what: "The knees bow outwards with a gap between them when the ankles touch", why: "Normal in toddlers; later it loads the medial compartment of the knee and is linked with early osteoarthritis", extra: [{ t: "angle", vertex: "lowerleg01", a: "upperleg01", b: "foot", tone: "amber", label: (c, d) => `Knee axis ${Math.round(d)}°`, when: [0.3, 1] }] },
  { id: "genu-recurvatum", title: "Genu recurvatum", view: "side", dev: (m) => ({ knee: { flex: -15 * m }, "knee:o": { flex: -15 * m } }), what: "The knees hyperextend beyond straight when standing (the lower leg bows backwards)", why: "Hypermobility, weak quadriceps or hamstrings, or a drop foot; stretches the posterior capsule", extra: [{ t: "angle", vertex: "lowerleg01", a: "upperleg01", b: "foot", tone: "amber", label: (c, d) => `Knee ${Math.round(d)}°`, when: [0.3, 1] }], zoom: 2.8, focus: "lowerleg01" },
  { id: "pes-planus", title: "Pes planus (flat foot)", view: "back", dev: (m) => ({ ankle: { rot: -15 * m }, "ankle:o": { rot: -15 * m } }), what: "The medial arch collapses and the heel tilts outwards (valgus); the “too many toes” sign shows from behind", why: "Flexible flat foot corrects on tiptoe; a rigid one does not and needs assessment. Linked with tibialis posterior dysfunction", zoom: 2.6, focus: "foot" },
  { id: "pes-cavus", title: "Pes cavus (high arch)", view: "back", dev: (m) => ({ ankle: { rot: 14 * m }, "ankle:o": { rot: 14 * m } }), what: "A high medial arch with the heel tilted inwards (varus) so the weight sits on the outer border", why: "Often neurological (Charcot–Marie–Tooth): look for claw toes and recurrent ankle sprains; the foot is rigid and a poor shock absorber", zoom: 2.6, focus: "foot" },
];

function postureScene(p: Posture): Scene {
  const m = (u: number) => ramp(u, 0.3, 0.58);
  return {
    kind: "posture",
    title: p.title,
    position: "standing",
    planted: p.planted ? "toe3-1" : undefined,
    loopMs: 13000,
    frame: { focus: p.focus ?? "spine03", zoom: p.zoom ?? (p.view === "side" ? 4.4 : 3.8), view: VIEW[p.view], around: p.view === "side" ? ["@ear", "@lateral-malleolus"] : ["@nose", "foot", "foot:o"] },
    pose: (s, u) => P(s, p.dev(m(u))),
    beats: [
      { to: 0.28, text: p.view === "side" ? "Ideal alignment: a plumb line falls through the ear, shoulder, hip, knee and just in front of the ankle" : "Ideal alignment seen from the " + p.view + ": level, symmetrical and in line", chip: "Ideal" },
      { to: 0.58, text: p.title + " develops…", chip: "Change" },
      { to: 0.8, text: p.what, chip: "What you see" },
      { to: 1, text: p.why, chip: "Why it matters" },
    ],
    overlays: [...(p.view === "side" ? [PLUMB_SIDE] : []), ...(p.extra ?? [])],
    hud: [{ t: "stat", label: "View", value: p.view === "side" ? "Lateral" : p.view === "front" ? "Anterior" : "Posterior", sub: (c) => (c.u < 0.3 ? "ideal" : c.u < 0.58 ? "changing" : p.title.split(" (")[0].toLowerCase()), tone: "cyan" }],
  };
}

export const postureScenes: Record<string, Scene> = Object.fromEntries(POSTURES.map((p) => [`posture/${p.id}`, postureScene(p)]));
// Concept demonstrations reuse an atlas item.
postureScenes["posture/concept:plumb-line"] = postureScenes["posture/forward-head"];
postureScenes["posture/concept:crossed"] = postureScenes["posture/kypho-lordotic"];
postureScenes["posture/concept:kendall-types"] = postureScenes["posture/sway-back"];
postureScenes["posture/concept:structural-functional"] = postureScenes["posture/scoliosis"];
