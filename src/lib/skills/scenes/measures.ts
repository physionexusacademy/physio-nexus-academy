/** Limb measurements: the tape and the girth ring are drawn on the 3D patient between real landmarks, with the length read live from the model. */
import { P } from "../../virtual-patient/parts.ts";
import type { Ctx, Overlay, Scene, SceneOption } from "../scene-types.ts";
import { ease, ramp, tri } from "./shared.ts";

const cm = (m: number) => `${(m * 100).toFixed(0)} cm`;
const resp = (u: number, cycles: number) => 0.5 - 0.5 * Math.cos(u * cycles * 2 * Math.PI);

const lengthScene = (title: string, from: string, to: string, name: string, beats: Scene["beats"], extra: Partial<Scene> = {}): Scene => ({
  kind: "measure",
  title,
  position: "supine",
  loopMs: 12000,
  frame: { focus: `${from}+${to}`, zoom: 2.0, view: [0.4, 0.3, 1], around: [from, to] },
  beats,
  overlays: [
    { t: "beacon", at: from, label: "Start", tone: "white", when: [0.18, 1] },
    { t: "beacon", at: to, label: "End", tone: "white", when: [0.18, 1] },
    { t: "line", from, to, grow: true, label: (c, m) => `${name}: ${cm(m)}`, tone: "amber", when: [0.4, 1] },
  ],
  hud: [{ t: "stat", label: name, value: (c) => (c.u > 0.55 ? "measured" : "—"), sub: "compare both sides", tone: "amber" }],
  ...extra,
});

const ringScene = (title: string, o: { at: string; axis: [string, string]; r: number; name: string; position?: Scene["position"]; focus?: string; zoom?: number; view?: [number, number, number]; beats: Scene["beats"]; level?: Overlay; opt?: SceneOption; radius?: (c: Ctx) => number; sub?: string }): Scene => ({
  kind: "measure",
  title,
  position: o.position ?? "supine",
  loopMs: 12000,
  frame: { focus: o.focus ?? o.at, zoom: o.zoom ?? 1.5, view: o.view ?? [0.45, 0.3, 1], around: [o.axis[0], o.axis[1], o.at] },
  options: o.opt ? [o.opt] : undefined,
  beats: o.beats,
  overlays: [
    { t: "ring", at: o.at, along: o.axis, r: o.radius ?? o.r, label: (c, circ) => `${o.name}: ${cm(circ)}`, tone: "amber", when: [0.3, 1] },
    ...(o.level ? [o.level] : []),
  ],
  hud: [{ t: "stat", label: o.name, value: (c) => cm(2 * Math.PI * (o.radius ? o.radius(c) : o.r)), sub: o.sub ?? "measure both sides", tone: "amber", when: [0.3, 1] }],
});

const TRUE_LEG = lengthScene("True leg length", "@asis", "@medial-malleolus", "ASIS → medial malleolus", [
  { to: 0.22, text: "Patient supine, pelvis square, legs parallel and the same distance from the midline", chip: "Position" },
  { to: 0.45, text: "Mark the ASIS and the tip of the medial malleolus on both sides", chip: "Mark" },
  { to: 0.8, text: "Measure from the ASIS, across the inner side of the knee, to the tip of the medial malleolus", chip: "Measure" },
  { to: 1, text: "Repeat on the other side. A difference of more than 1 cm is clinically significant (true shortening)", chip: "Compare" },
]);

const APPARENT_LEG = lengthScene("Apparent leg length", "@umbilicus:m", "@medial-malleolus", "Umbilicus → medial malleolus", [
  { to: 0.22, text: "Patient supine with the legs together and as straight as possible", chip: "Position" },
  { to: 0.45, text: "Mark the umbilicus (or xiphisternum) and the tip of each medial malleolus", chip: "Mark" },
  { to: 0.8, text: "Measure from the umbilicus to the medial malleolus on each side", chip: "Measure" },
  { to: 1, text: "A difference with equal true lengths points to pelvic obliquity or an adduction/abduction contracture", chip: "Compare" },
]);

const GALEAZZI_OPT: SceneOption = { id: "result", label: "Result", choices: [{ id: "equal", label: "Equal" }, { id: "tibia", label: "Short tibia" }, { id: "femur", label: "Short femur" }], initial: "tibia" };
const galeazzi: Scene = {
  kind: "measure",
  title: "Galeazzi (Allis) test",
  position: "supine",
  loopMs: 12000,
  frame: { focus: "@patella", zoom: 2.4, view: [1, 0.12, 0.15], around: ["@patella", "@patella:o", "foot", "foot:o", "@asis"] },
  pose: (s, u, c) => {
    const r = c.opt.result ?? "tibia";
    const tib = r === "tibia" ? 1 : 0;
    const fem = r === "femur" ? 1 : 0;
    return P(s, { hip: { flex: 45 + 7 * tib * ramp(u, 0.3, 0.5) - 0 }, knee: { flex: 90 + 14 * tib * ramp(u, 0.3, 0.5) - 12 * fem * ramp(u, 0.3, 0.5) }, "hip:o": { flex: 45 }, "knee:o": { flex: 90 } });
  },
  options: [GALEAZZI_OPT],
  beats: [
    { to: 0.28, text: "Patient supine, hips and knees bent and the feet flat and level, side by side", chip: "Position" },
    { to: 0.55, text: "Look from the side at the height of the two knees", chip: "Knees" },
    { to: 0.8, text: (c) => ((c.opt.result ?? "tibia") === "tibia" ? "One knee sits lower: the tibia is shorter on that side" : (c.opt.result ?? "tibia") === "femur" ? "One knee sits further back: the femur is shorter on that side" : "Both knees level and at the same distance: no difference"), chip: "Compare" },
    { to: 1, text: "Looks for a short tibia or short femur; it is positive in hip dysplasia and fracture shortening", chip: "Meaning" },
  ],
  overlays: [
    { t: "line", from: "@patella", to: "@patella:o", label: "Knee level", tone: "amber", dashed: true, when: [0.28, 1] },
    { t: "beacon", at: "@patella", tone: "amber", when: [0.28, 1] },
    { t: "beacon", at: "@patella:o", tone: "white", when: [0.28, 1] },
  ],
  hud: [{ t: "stat", label: "Galeazzi", value: (c) => ((c.opt.result ?? "tibia") === "equal" ? "Negative" : "Positive"), sub: (c) => (c.opt.result === "femur" ? "short femur" : c.opt.result === "equal" ? "equal" : "short tibia"), tone: "amber" }],
};

const block: Scene = {
  kind: "measure",
  title: "Standing block method",
  position: "standing",
  loopMs: 13000,
  frame: { focus: "@asis+@asis:o", zoom: 2.6, view: [0.1, 0.1, 1], around: ["@asis", "@asis:o", "foot", "foot:o"] },
  pose: (s, u) => P(s, { trunk: { abd: -3.6 * (1 - ramp(u, 0.35, 0.8)) } }),
  beats: [
    { to: 0.3, text: "Patient stands with the feet together, knees straight; mark both ASISs and look for a pelvic tilt", chip: "Stand" },
    { to: 0.8, text: "Put blocks of known height (about 5 mm each) under the shorter leg until the ASISs are level", chip: "Add blocks" },
    { to: 1, text: "The total height of the blocks is the functional leg-length discrepancy", chip: "Read" },
  ],
  overlays: [
    { t: "line", from: "@asis", to: "@asis:o", label: "ASIS line", tone: "amber", dashed: true, when: [0.05, 1] },
    { t: "beacon", at: "@asis", tone: "amber", when: [0.05, 1] },
    { t: "beacon", at: "@asis:o", tone: "white", when: [0.05, 1] },
  ],
  hud: [
    { t: "bar", label: "Height of blocks", unit: "mm", min: 0, max: 30, value: (c) => Math.round(20 * ramp(c.u, 0.35, 0.8)), goodFrom: 19, goodTo: 21, marks: [{ at: 20, label: "20" }] },
    { t: "stat", label: "Pelvis", value: (c) => (c.u < 0.4 ? "Tilted" : c.u < 0.8 ? "Levelling" : "Level"), sub: "example: 20 mm", tone: "amber", at: "tr" },
  ],
};

const THIGH = ringScene("Thigh circumference", {
  at: "@patella{0,0.10,0}",
  axis: ["upperleg01", "lowerleg01"],
  r: 0.074,
  name: "Thigh 10 cm above the patella",
  focus: "upperleg01+lowerleg01",
  zoom: 1.9,
  beats: [
    { to: 0.25, text: "Patient supine with the quadriceps relaxed; mark the upper pole of the patella", chip: "Mark" },
    { to: 0.5, text: "Measure 10 cm up from the patella and mark the level (the same for both thighs)", chip: "10 cm up" },
    { to: 0.8, text: "Wrap the tape flat and snug, at the mark, without pinching the skin", chip: "Tape" },
    { to: 1, text: "A difference of more than 1–2 cm suggests quadriceps wasting (or swelling); record the level and side", chip: "Compare" },
  ],
  level: { t: "line", from: "@patella", to: "@patella{0,0.10,0}", label: "10 cm", tone: "white", dashed: true, when: [0.3, 1] },
});

const KNEE_OPT: SceneOption = { id: "knee", label: "Knee", choices: [{ id: "normal", label: "Normal" }, { id: "effusion", label: "Effusion" }], initial: "effusion" };
const KNEE = ringScene("Knee circumference (effusion)", {
  at: "@patella",
  axis: ["upperleg01", "lowerleg01"],
  r: 0.064,
  radius: (c) => ((c.opt.knee ?? "effusion") === "effusion" ? 0.0715 : 0.0635),
  name: "Knee at the joint line",
  zoom: 1.5,
  opt: KNEE_OPT,
  beats: [
    { to: 0.3, text: "Patient supine with the knee extended; the tape goes round the mid-patella, level with the joint line", chip: "Level" },
    { to: 0.7, text: "Take the same measurement on both knees: the same level, the same tape tension", chip: "Measure" },
    { to: 1, text: (c) => ((c.opt.knee ?? "effusion") === "effusion" ? "About 1 cm or more bigger than the other side suggests effusion; confirm with the patellar tap or sweep test" : "Equal sides: no effusion"), chip: "Meaning" },
  ],
  sub: "compare with the other knee",
});

const CALF = ringScene("Calf circumference", {
  at: "lowerleg01+foot*0.26",
  axis: ["lowerleg01", "foot"],
  r: 0.056,
  name: "Calf at its widest",
  focus: "lowerleg01+foot",
  zoom: 1.7,
  beats: [
    { to: 0.3, text: "Patient supine, leg relaxed; find the widest part of the calf by eye and feel", chip: "Find" },
    { to: 0.7, text: "Mark that level and measure its distance from the joint line, so it can be repeated", chip: "Mark" },
    { to: 1, text: "A calf more than 2 cm bigger than the other side after injury or immobilisation: think of swelling or a DVT and refer", chip: "Meaning" },
  ],
  sub: "check for swelling or wasting",
});

const figureEight: Scene = {
  kind: "measure",
  title: "Figure-of-eight ankle measure",
  position: "supine",
  loopMs: 12000,
  frame: { focus: "foot", zoom: 1.1, view: [0.5, 0.35, 1], around: ["@medial-malleolus", "@lateral-malleolus", "toe3-1"] },
  pose: () => P("right", {}),
  beats: [
    { to: 0.25, text: "Foot relaxed at a right angle; start on the front of the ankle, between the two malleoli", chip: "Start" },
    { to: 0.55, text: "Take the tape over the navicular, across the arch and round the base of the fifth metatarsal", chip: "Under the arch" },
    { to: 0.85, text: "Bring it up and over the front of the ankle, then round the malleoli and back to the start", chip: "Round the malleoli" },
    { to: 1, text: "A difference of 1 cm or more from the other ankle shows swelling; useful after a sprain", chip: "Compare" },
  ],
  overlays: [
    { t: "path", pts: ["@lateral-malleolus{0,0.02,0.05}", "foot{-0.03,-0.04,0.07}", "foot{0,-0.07,0.04}", "foot{0.03,-0.04,0.07}", "@medial-malleolus{0,0.02,0.05}", "@lateral-malleolus{0,0.0,-0.03}", "@medial-malleolus{0,0.0,-0.03}", "@lateral-malleolus{0,0.02,0.05}"], tone: "amber", width: 4, flow: true, when: [0.2, 1] },
    { t: "beacon", at: "@lateral-malleolus", label: "Lateral malleolus", tone: "white", when: [0.1, 0.9] },
    { t: "beacon", at: "@medial-malleolus", label: "Medial malleolus", tone: "white", when: [0.1, 0.9] },
  ],
  hud: [{ t: "stat", label: "Figure-of-eight", value: "58 cm", sub: "example reading", tone: "amber", when: [0.8, 1] }],
};

const LYMPH_OPT: SceneOption = { id: "arm", label: "Arm", choices: [{ id: "normal", label: "Normal side" }, { id: "affected", label: "Affected side" }], initial: "affected" };
const lymphoedema: Scene = {
  kind: "measure",
  title: "Arm circumference (lymphoedema)",
  position: "supine",
  loopMs: 12000,
  frame: { focus: "upperarm01+lowerarm01", zoom: 1.8, view: [0.4, 0.4, 1], around: ["upperarm01", "wrist"] },
  pose: (s) => P(s, { shoulder: { abd: 25 }, elbow: { flex: 6, rot: 80 } }),
  options: [LYMPH_OPT],
  beats: [
    { to: 0.3, text: "Arm resting on a pillow; mark points 10 cm above and 10 cm below the lateral epicondyle", chip: "Mark" },
    { to: 0.7, text: "Measure the circumference at each mark with the same tape tension on both arms", chip: "Measure" },
    { to: 1, text: (c) => ((c.opt.arm ?? "affected") === "affected" ? "A difference of 2 cm or more between the arms is lymphoedema until proven otherwise (volume rises about 10 %)" : "Equal arms: no lymphoedema"), chip: "Meaning" },
  ],
  overlays: [
    { t: "ring", at: "upperarm01+lowerarm01*0.74", along: ["upperarm01", "lowerarm01"], r: (c) => ((c.opt.arm ?? "affected") === "affected" ? 0.055 : 0.045), label: (c, circ) => `10 cm above: ${cm(circ)}`, tone: "amber", when: [0.3, 1] },
    { t: "ring", at: "lowerarm01+wrist*0.34", along: ["lowerarm01", "wrist"], r: (c) => ((c.opt.arm ?? "affected") === "affected" ? 0.047 : 0.039), label: (c, circ) => `10 cm below: ${cm(circ)}`, tone: "cyan", when: [0.35, 1] },
    { t: "beacon", at: "@lateral-epicondyle", label: "Lateral epicondyle", tone: "white", when: [0.05, 1] },
  ],
  hud: [{ t: "stat", label: "Arm difference", value: (c) => ((c.opt.arm ?? "affected") === "affected" ? "+2.8 cm" : "0.2 cm"), sub: (c) => ((c.opt.arm ?? "affected") === "affected" ? "lymphoedema" : "normal"), tone: "amber", when: [0.3, 1] }],
};

const ARM_LENGTH = lengthScene("Upper-limb length", "@ac-joint", "finger3-3>", "Acromion → middle fingertip", [
  { to: 0.22, text: "Patient supine or standing, the arm straight by the side, palm facing the thigh", chip: "Position" },
  { to: 0.45, text: "Mark the lateral border of the acromion and the tip of the middle finger", chip: "Mark" },
  { to: 0.8, text: "Measure from the acromion to the tip of the middle finger (add the segments for arm, forearm and hand)", chip: "Measure" },
  { to: 1, text: "A difference of more than 1 cm points to a fracture shortening or a growth problem; compare sides", chip: "Compare" },
], { pose: (s) => P(s, { shoulder: { abd: 18 }, elbow: { flex: 4 } }) });

const CHEST_OPT: SceneOption = { id: "chest", label: "Chest", choices: [{ id: "normal", label: "Normal" }, { id: "reduced", label: "Reduced (e.g. ankylosing spondylitis)" }], initial: "normal" };
const chestAmp = (c: Ctx) => ((c.opt.chest ?? "normal") === "normal" ? 0.0068 : 0.0024);
const chestExpansion: Scene = {
  kind: "measure",
  title: "Chest expansion",
  position: "standing",
  loopMs: 12000,
  frame: { focus: "spine03", zoom: 2.4, view: [0.3, 0.12, 1], around: ["@suprasternal-notch", "@xiphoid"] },
  pose: (s) => P(s, { shoulder: { abd: 14 }, "shoulder:o": { abd: 14 } }),
  options: [CHEST_OPT],
  beats: [
    { to: 0.25, text: "Patient stands with the hands on the head; the tape goes round the chest at the 4th intercostal space (nipple line)", chip: "Tape" },
    { to: 0.7, text: "Ask for a full breath out, then a full breath in, and read the difference", chip: "Breathe" },
    { to: 1, text: (c) => ((c.opt.chest ?? "normal") === "normal" ? "Normal: at least 2.5 cm (often 4–5 cm) of expansion" : "Less than 2.5 cm: reduced expansion, e.g. ankylosing spondylitis or lung disease"), chip: "Meaning" },
  ],
  overlays: [{ t: "ring", at: "spine03{0,0.01,0.03}", along: ["spine02", "spine04"], r: (c) => 0.148 + chestAmp(c) * resp(c.u, 3), label: (c, circ) => `Chest: ${(circ * 100).toFixed(1)} cm`, tone: "amber", when: [0.2, 1] }],
  hud: [
    { t: "wave", kind: "resp", bpm: 15, label: "Breathing", when: [0.2, 1] },
    { t: "stat", label: "Expansion", value: (c) => `${(2 * Math.PI * 2 * chestAmp(c) * 100).toFixed(1)} cm`, sub: (c) => ((c.opt.chest ?? "normal") === "normal" ? "normal" : "reduced"), tone: "amber" },
  ],
};

const schober: Scene = {
  kind: "measure",
  title: "Modified Schober test",
  position: "standing",
  loopMs: 13000,
  frame: { focus: "spine04", zoom: 3.0, view: [0.7, 0.15, -1], around: ["spine03", "spine05"] },
  pose: (s, u) => {
    const b = ease(tri(Math.min(1, Math.max(0, (u - 0.25) / 0.5)), 1));
    return P(s, { trunk: { flex: 52 * b }, hip: { flex: 28 * b }, "hip:o": { flex: 28 * b }, shoulder: { flex: 8 * b }, "shoulder:o": { flex: 8 * b } });
  },
  beats: [
    { to: 0.25, text: "Standing: mark the level of the dimples of Venus (PSIS), then 10 cm above and 5 cm below", chip: "Mark" },
    { to: 0.7, text: "Ask the patient to bend forward as far as possible with the knees straight, and re-measure between the upper and lower marks", chip: "Bend" },
    { to: 1, text: "The 15 cm between the marks should grow to at least 20 cm (an increase of 5 cm or more); less suggests reduced lumbar flexion", chip: "Read" },
  ],
  overlays: [
    { t: "line", from: "spine05{0,0.0,-0.085}", to: "spine03{0,0.0,-0.085}", label: (c, m) => `Between marks: ${(m * 100).toFixed(0)} cm`, tone: "amber", when: [0.1, 1] },
    { t: "beacon", at: "spine05{0,0.0,-0.085}", tone: "white", when: [0.1, 1] },
    { t: "beacon", at: "spine03{0,0.0,-0.085}", tone: "white", when: [0.1, 1] },
  ],
  hud: [{ t: "stat", label: "Schober", value: "+5 cm", sub: "normal increase ≥ 5 cm", tone: "amber", when: [0.55, 1] }],
};

const occiputWall: Scene = {
  kind: "measure",
  title: "Occiput-to-wall distance",
  position: "standing",
  loopMs: 12000,
  frame: { focus: "head", zoom: 3.4, view: [1, 0.12, 0.05], around: ["head", "spine03", "foot"] },
  props: [{ kind: "wall", at: [0, 0, -0.205] }],
  pose: (s, u) => {
    const m = ramp(u, 0.3, 0.6);
    return P(s, { trunk: { flex: 20 * m }, neck: { flex: 12 * m }, head: { flex: -6 * m } });
  },
  beats: [
    { to: 0.28, text: "Heels and buttocks against the wall, the patient looks straight ahead with the chin level", chip: "Stand" },
    { to: 0.62, text: "A stooped upper back moves the head away from the wall", chip: "Posture" },
    { to: 1, text: "Measure the horizontal distance from the back of the head to the wall: normal is 0 cm; more than 0 (above about 2 cm) suggests thoracic kyphosis or spondylitis", chip: "Measure" },
  ],
  overlays: [{ t: "line", from: "head{0,0,-0.095}", to: "head{0,0,-0.095}|z=-0.205", label: (c, m) => `Occiput to wall: ${(m * 100).toFixed(0)} cm`, tone: "amber", when: [0.25, 1] }],
  hud: [{ t: "stat", label: "Occiput–wall", value: (c) => (c.u < 0.3 ? "0 cm" : "> 0 cm"), sub: "normal = 0", tone: "amber" }],
};

const bmiWaist: Scene = {
  kind: "measure",
  title: "BMI and waist circumference",
  position: "standing",
  loopMs: 12000,
  frame: { focus: "spine03", zoom: 4.2, view: [0.3, 0.1, 1], around: ["head>", "foot"] },
  pose: (s) => P(s, { shoulder: { abd: 10 }, "shoulder:o": { abd: 10 } }),
  beats: [
    { to: 0.3, text: "Shoes off, standing straight: measure height to the nearest 0.5 cm and weight in light clothing", chip: "Height and weight" },
    { to: 0.65, text: "Waist: tape level with the midpoint between the lowest rib and the iliac crest, read at the end of a normal breath out", chip: "Waist" },
    { to: 1, text: "BMI = weight (kg) ÷ height (m)². Healthy 18.5–24.9; waist risk above about 94 cm (men) or 80 cm (women)", chip: "Calculate" },
  ],
  overlays: [
    { t: "line", from: "head>", to: "head>|floor", label: (c, m) => `Height: ${(m * 100).toFixed(0)} cm`, tone: "cyan", grow: true, when: [0.05, 0.4] },
    { t: "ring", at: "@umbilicus:m", along: ["spine02", "spine05"], r: 0.135, label: (c, circ) => `Waist: ${cm(circ)}`, tone: "amber", when: [0.35, 1] },
  ],
  hud: [{ t: "stat", label: "BMI", value: (c) => (c.u > 0.7 ? "23.4" : "—"), sub: "70 kg, 1.73 m", tone: "green" }],
};

const gripScene: Scene = {
  kind: "measure",
  title: "Grip strength (hand dynamometer)",
  position: "sitting",
  loopMs: 13000,
  frame: { focus: "wrist", zoom: 1.1, view: [1, 0.35, 0.4], around: ["lowerarm01", "finger3-3>"] },
  pose: (s, u) => P(s, { shoulder: { flex: 4 }, elbow: { flex: 90, rot: 0 }, hand: { flex: 100 * ease(tri(Math.min(1, Math.max(0, (u - 0.28) / 0.65)), 3)) }, "elbow:o": { flex: 80 } }),
  beats: [
    { to: 0.28, text: "Seated, shoulder by the side, elbow bent to 90° and the forearm in the neutral position", chip: "Position" },
    { to: 0.93, text: "Squeeze the dynamometer as hard as possible for about 3 seconds; three trials with a rest between", chip: "Squeeze" },
    { to: 1, text: "Record the best (or average) of three trials in kg and compare with the other hand and with norms for age and sex. Low grip strength is under 27 kg in men and 16 kg in women (EWGSOP2)", chip: "Record" },
  ],
  overlays: [{ t: "device", kind: "meter", at: "finger3-1", label: "Dynamometer", when: [0.1, 1] }],
  hud: [{ t: "bar", label: "Grip force", unit: "kg", min: 0, max: 50, goodFrom: 27, goodTo: 50, value: (c) => 36 * ease(tri(Math.min(1, Math.max(0, (c.u - 0.28) / 0.65)), 3)) * (c.u < 0.28 ? 0 : 1), marks: [{ at: 16, label: "F 16" }, { at: 27, label: "M 27" }] }],
};

const navicular: Scene = {
  kind: "measure",
  title: "Navicular drop",
  position: "standing",
  loopMs: 13000,
  frame: { focus: "foot", zoom: 1.5, view: [-1, 0.05, 0.4], around: ["foot", "@medial-malleolus", "toe1-1"] },
  pose: (s, u) => P(s, { ankle: { rot: -9 * ramp(u, 0.45, 0.7) } }),
  beats: [
    { to: 0.4, text: "Sitting with the subtalar joint in neutral: mark the navicular tuberosity and measure its height from the floor", chip: "Neutral" },
    { to: 0.72, text: "Now relaxed standing: the arch settles as the foot pronates", chip: "Stand" },
    { to: 1, text: "Measure again: a drop of more than 10 mm is excessive pronation (a cut-off of about 9–10 mm is used)", chip: "Drop" },
  ],
  overlays: [
    { t: "line", from: "foot{-0.03,-0.035,0.05}", to: "foot{-0.03,-0.035,0.05}|floor", label: (c, m) => `Navicular height: ${(m * 1000).toFixed(0)} mm`, tone: "amber", when: [0.05, 1] },
    { t: "beacon", at: "foot{-0.03,-0.035,0.05}", label: "Navicular", tone: "white", when: [0.05, 1] },
  ],
  hud: [{ t: "stat", label: "Navicular drop", value: (c) => (c.u < 0.45 ? "0 mm" : `${Math.round(10 * ramp(c.u, 0.45, 0.7))} mm`), sub: "> 10 mm = excessive", tone: "amber" }],
};

const qAngle: Scene = {
  kind: "measure",
  title: "Q-angle",
  position: "supine",
  loopMs: 12000,
  frame: { focus: "@patella", zoom: 2.2, view: [0.4, 0.3, 1], around: ["@asis", "@patella", "@tibial-tuberosity"] },
  beats: [
    { to: 0.25, text: "Patient supine with the quadriceps relaxed and the legs straight", chip: "Position" },
    { to: 0.55, text: "Draw a line from the ASIS to the middle of the patella", chip: "ASIS → patella" },
    { to: 0.8, text: "Draw a second line from the middle of the patella to the tibial tuberosity", chip: "Patella → tubercle" },
    { to: 1, text: "The angle between them is the Q-angle: normal about 13° in men and 18° in women; over 20° suggests patellofemoral malalignment", chip: "Read" },
  ],
  overlays: [
    { t: "line", from: "@asis", to: "@patella", tone: "cyan", grow: true, when: [0.25, 1] },
    { t: "line", from: "@patella", to: "@tibial-tuberosity", tone: "amber", grow: true, when: [0.55, 1] },
    { t: "angle", vertex: "@patella", a: "@asis", b: "@tibial-tuberosity", label: (c, d) => `Q-angle ${Math.round(180 - d)}°`, tone: "green", when: [0.8, 1] },
  ],
  hud: [{ t: "stat", label: "Q-angle", value: (c) => (c.u > 0.78 ? "measured" : "—"), sub: "normal ≈ 13–18°", tone: "green" }],
};

export const measureScenes: Record<string, Scene> = {
  "limb-measurements/true-leg-length": TRUE_LEG,
  "limb-measurements/apparent-leg-length": APPARENT_LEG,
  "limb-measurements/galeazzi": galeazzi,
  "limb-measurements/block-method": block,
  "limb-measurements/thigh-girth": THIGH,
  "limb-measurements/knee-effusion": KNEE,
  "limb-measurements/calf-girth": CALF,
  "limb-measurements/figure-eight": figureEight,
  "limb-measurements/lymphoedema": lymphoedema,
  "limb-measurements/arm-length": ARM_LENGTH,
  "limb-measurements/chest-expansion": chestExpansion,
  "limb-measurements/modified-schober": schober,
  "limb-measurements/occiput-wall": occiputWall,
  "limb-measurements/bmi-waist": bmiWaist,
  "limb-measurements/grip-strength": gripScene,
  "limb-measurements/navicular-drop": navicular,
  "limb-measurements/q-angle": qAngle,
  // Concept demonstrations reuse an atlas item.
  "limb-measurements/concept:tape-rules": THIGH,
  "limb-measurements/concept:true-vs-apparent": TRUE_LEG,
  "limb-measurements/concept:swelling": KNEE,
  "limb-measurements/concept:why-measure": CALF,
};
