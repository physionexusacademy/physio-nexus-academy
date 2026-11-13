/** Reflexes: the hammer finds the tendon, strikes, and the limb answers — with a grade selector (0 to 4+) so absent, normal, brisk and clonic reflexes can be compared. */
import { P } from "../../virtual-patient/parts.ts";
import type { Ctx, Scene, SceneOption } from "../scene-types.ts";
import { bounce, PRO } from "./shared.ts";

const GRADE: SceneOption = {
  id: "grade",
  label: "Reflex grade",
  choices: [
    { id: "0", label: "0" },
    { id: "1", label: "1+" },
    { id: "2", label: "2+" },
    { id: "3", label: "3+" },
    { id: "4", label: "4+" },
  ],
  initial: "2",
};
const AMP: Record<string, number> = { "0": 0, "1": 0.3, "2": 0.65, "3": 1.1, "4": 1.5 };
const NAME: Record<string, string> = { "0": "Absent", "1": "Diminished", "2": "Normal", "3": "Brisk", "4": "Very brisk, with clonus" };
const SYMBOL: Record<string, string> = { "0": "0", "1": "1+", "2": "2+", "3": "3+", "4": "4+" };
const grade = (c: Ctx) => c.opt.grade ?? "2";

/** Response size after the strike (0 before it). Grade 4+ adds a few rhythmic beats (clonus). */
const response = (c: Ctx) => {
  const g = grade(c);
  let r = AMP[g] * bounce(c.u, 0.5, 0.17);
  if (g === "4" && c.u > 0.56 && c.u < 0.82) r += 0.45 * Math.sin((c.u - 0.56) * 70) * (1 - (c.u - 0.56) / 0.26);
  return r;
};

type Tendon = {
  title: string;
  roots: string;
  position: Scene["position"];
  tendon: string;
  /** Pose given the response size r (0 = at rest). */
  pose: Scene["pose"];
  frame: Scene["frame"];
  where: string;
  response: string;
  down?: Scene["down"];
};

function tendonReflex(t: Tendon): Scene {
  return {
    kind: "reflex",
    title: t.title,
    position: t.position,
    down: t.down,
    loopMs: 9000,
    frame: t.frame,
    pose: t.pose,
    options: [GRADE],
    beats: [
      { to: 0.28, text: `Relax the limb and find the tendon — ${t.where}`, chip: "Find the tendon" },
      { to: 0.5, text: "Strike the tendon briskly with the hammer", chip: "Strike" },
      { to: 0.72, text: (c) => `Response: ${t.response} — ${NAME[grade(c)].toLowerCase()}`, chip: "Response" },
      { to: 1, text: (c) => `Grade ${SYMBOL[grade(c)]} (${NAME[grade(c)].toLowerCase()}) — always compare both sides`, chip: "Grade" },
    ],
    overlays: [
      { t: "beacon", at: t.tendon, label: "Tendon", when: [0.02, 0.5] },
      { t: "hammer", at: t.tendon, when: [0.27, 0.5] },
    ],
    hud: [
      { t: "stat", label: t.roots, value: (c) => SYMBOL[grade(c)], sub: (c) => NAME[grade(c)], tone: "amber" },
    ],
  };
}

const sit = (s: "left" | "right", parts: Parameters<typeof P>[1]) => P(s, parts);

const bicepsScene = tendonReflex({
  title: "Biceps reflex",
  roots: "C5–C6",
  position: "sitting",
  tendon: "lowerarm01[0,0.005,0.03]",
  pose: (s, u, c) => sit(s, { shoulder: { flex: 10 }, elbow: { flex: 90 + 14 * response({ ...c, u }), rot: 10 + 22 * response({ ...c, u }) } }),
  frame: { focus: "lowerarm01", zoom: 1.1, view: [1, 0.25, 0.5], around: ["wrist", "upperarm01"] },
  where: "in the crook of the elbow, under your thumb",
  response: "the elbow flexes and the biceps jumps",
});

const brachioradialisScene = tendonReflex({
  title: "Brachioradialis reflex",
  roots: "C5–C6",
  position: "sitting",
  tendon: "lowerarm01+wrist*0.85",
  pose: (s, u, c) => sit(s, { shoulder: { flex: 10 }, elbow: { flex: 90 + 11 * response({ ...c, u }), rot: 0 } }),
  frame: { focus: "lowerarm01+wrist", zoom: 1.0, view: [1, 0.3, 0.4], around: ["wrist", "lowerarm01"] },
  where: "the radial border of the forearm, 5–8 cm above the wrist",
  response: "the elbow flexes and the forearm supinates",
});

const tricepsScene = tendonReflex({
  title: "Triceps reflex",
  roots: "C7",
  position: "prone",
  tendon: "upperarm01+lowerarm01*0.88",
  pose: (s, u, c) => P(s, { shoulder: { abd: 90 }, elbow: { flex: 90 - 20 * response({ ...c, u }) } }),
  frame: { focus: "lowerarm01", zoom: 1.2, view: [0.4, 1, -0.3], around: ["upperarm01", "wrist"] },
  where: "just above the olecranon, with the arm supported and the forearm hanging",
  response: "the elbow extends as the triceps contracts",
});

const patellarScene = tendonReflex({
  title: "Patellar (knee) reflex",
  roots: "L3–L4",
  position: "sitting",
  tendon: "@patella+@tibial-tuberosity*0.55",
  pose: (s, u, c) => P(s, { knee: { flex: 85 - 32 * response({ ...c, u }) } }),
  frame: { focus: "lowerleg01", zoom: 1.4, view: [1, 0.15, 0.4], around: ["foot", "upperleg01"] },
  where: "the patellar tendon, between the kneecap and the tibial tuberosity",
  response: "the knee extends (the leg kicks forward)",
});

const hamstringScene = tendonReflex({
  title: "Medial hamstring reflex",
  roots: "L5–S1",
  position: "prone",
  tendon: "@popliteal-fossa{-0.02,0,0}",
  pose: (s, u, c) => P(s, { knee: { flex: 60 + 9 * response({ ...c, u }) } }),
  frame: { focus: "lowerleg01", zoom: 1.2, view: [1, 0.15, -0.5], around: ["foot", "upperleg01"] },
  where: "the medial hamstring tendons behind the knee (strike your own thumb placed over them)",
  response: "a small flexion of the knee",
});

const achillesScene = tendonReflex({
  title: "Achilles (ankle) reflex",
  roots: "S1",
  position: "sitting",
  tendon: "@achilles-tendon",
  pose: (s, u, c) => P(s, { ankle: { flex: 10 - 20 * response({ ...c, u }) } }),
  frame: { focus: "foot", zoom: 1.1, view: [1, 0.05, 0.3], around: ["lowerleg01", "toe3-1"] },
  where: "the Achilles tendon, with the foot gently held in slight dorsiflexion",
  response: "the ankle plantarflexes",
});

/* ---------------- plantar response (Babinski) ---------------- */

const SOLE_HEEL = "foot[0.02,-0.07,-0.02]";
const SOLE_BALL5 = "toe5-1[0,-0.026,0]";
const SOLE_BALL1 = "toe1-1[0,-0.026,0]";

const babinskiScene: Scene = {
  kind: "reflex",
  title: "Plantar response (Babinski)",
  position: "supine",
  loopMs: 10000,
  frame: { focus: "foot", zoom: 0.75, view: [0.3, -1, 0.3], around: ["toe1-1", "toe5-1"] },
  pose: (s, u, c) => {
    const up = (c.opt.response ?? "normal") === "upgoing";
    const r = u < 0.55 ? 0 : Math.min(1, (u - 0.55) / 0.12);
    return P(s, { toe: { flex: up ? 38 * r : -10 * r }, "hip:o": { abd: 12 } });
  },
  options: [{ id: "response", label: "Response", choices: [{ id: "normal", label: "Normal (toes curl down)" }, { id: "upgoing", label: "Babinski (great toe up)" }], initial: "normal" }],
  beats: [
    { to: 0.28, text: "Hold the ankle and use a blunt point — firm, not painful", chip: "Prepare" },
    { to: 0.55, text: "Stroke up the lateral sole, then across the ball of the foot", chip: "Stroke" },
    { to: 0.8, text: (c) => ((c.opt.response ?? "normal") === "upgoing" ? "Great toe extends and the toes fan: upper motor neurone sign" : "Toes flex down: normal (flexor) response"), chip: "Response" },
    { to: 1, text: (c) => ((c.opt.response ?? "normal") === "upgoing" ? "Extensor plantar response: look for other UMN signs" : "Normal — repeat on the other foot"), chip: "Meaning" },
  ],
  overlays: [
    { t: "touch", at: SOLE_HEEL, to: SOLE_BALL5, style: "stroke", label: "Heel → ball", when: [0.28, 0.43] },
    { t: "touch", at: SOLE_BALL5, to: SOLE_BALL1, style: "stroke", when: [0.43, 0.55] },
    { t: "arrow", at: "toe1-2", to: "toe1-2{0,0.045,0}", label: "Great toe up", tone: "red", when: [0.62, 1] },
  ],
  hud: [{ t: "stat", label: "Plantar response", value: (c) => ((c.opt.response ?? "normal") === "upgoing" ? "Extensor" : "Flexor"), sub: (c) => ((c.opt.response ?? "normal") === "upgoing" ? "UMN sign" : "normal"), tone: "amber" }],
};

/* ---------------- Hoffmann sign ---------------- */

const hoffmannScene: Scene = {
  kind: "reflex",
  title: "Hoffmann sign",
  position: "sitting",
  loopMs: 9000,
  frame: { focus: "wrist", zoom: 0.55, view: [1, 0.35, 0.4], around: ["finger3-3>", "finger1-3>"] },
  pose: (s, u, c) => {
    const pos = (c.opt.response ?? "negative") === "positive";
    const r = (pos ? 1 : 0) * bounce(u, 0.5, 0.2);
    return P(s, { shoulder: { flex: 12 }, elbow: { flex: 90, rot: PRO }, wrist: { flex: 0 }, fingers: { flex: 22 + 14 * r, abd: 22 + 10 * r, rot: 12 }, thumb: { flex: 6 + 30 * r, rot: 8 + 22 * r } });
  },
  options: [{ id: "response", label: "Result", choices: [{ id: "negative", label: "Negative (normal)" }, { id: "positive", label: "Positive (UMN)" }], initial: "negative" }],
  beats: [
    { to: 0.3, text: "Hold the middle finger loosely, hand relaxed", chip: "Position" },
    { to: 0.5, text: "Flick the fingernail down — a sudden stretch of the finger flexors", chip: "Flick" },
    { to: 0.75, text: (c) => ((c.opt.response ?? "negative") === "positive" ? "Thumb and index finger flex together: positive" : "No movement of the thumb or index finger: normal"), chip: "Response" },
    { to: 1, text: "A positive sign suggests an upper motor neurone lesion (cord or brain) above C8", chip: "Meaning" },
  ],
  overlays: [
    { t: "beacon", at: "finger3-3>", label: "Nail", when: [0.02, 0.5] },
    { t: "touch", at: "finger3-3>", style: "tap", label: "Flick", when: [0.3, 0.5] },
  ],
  hud: [{ t: "stat", label: "Hoffmann", value: (c) => ((c.opt.response ?? "negative") === "positive" ? "Positive" : "Negative"), tone: "amber" }],
};

/* ---------------- ankle clonus ---------------- */

export const ankleClonusScene: Scene = {
  kind: "reflex",
  title: "Ankle clonus",
  position: "supine",
  loopMs: 10000,
  frame: { focus: "foot", zoom: 1.0, view: [1, 0.1, 0.5], around: ["lowerleg01", "toe3-1"] },
  pose: (s, u, c) => {
    const sustained = (c.opt.response ?? "sustained") === "sustained";
    const push = u < 0.3 ? 0 : u < 0.4 ? (u - 0.3) / 0.1 : 1;
    const t = Math.max(0, u - 0.4);
    const osc = sustained ? (u < 0.88 ? 11 * Math.sin(t * 2 * Math.PI * 9) : 0) : 11 * Math.sin(t * 2 * Math.PI * 9) * Math.max(0, 1 - t / 0.13);
    const release = u > 0.9 ? Math.max(0, 1 - (u - 0.9) / 0.08) : 1;
    return P(s, { hip: { flex: 30 }, knee: { flex: 45 }, ankle: { flex: (16 * push + osc) * release } });
  },
  options: [{ id: "response", label: "Result", choices: [{ id: "normal", label: "Normal (0–2 beats)" }, { id: "sustained", label: "Sustained clonus" }], initial: "sustained" }],
  beats: [
    { to: 0.3, text: "Support the knee slightly bent; cup the sole with your other hand", chip: "Position" },
    { to: 0.42, text: "Sharply dorsiflex the foot and hold the stretch", chip: "Stretch" },
    { to: 0.9, text: (c) => ((c.opt.response ?? "sustained") === "sustained" ? "Rhythmic beats continue while the stretch is held: sustained clonus" : "One or two beats that die away: normal"), chip: "Count beats" },
    { to: 1, text: "Release — more than 5 beats is a UMN sign", chip: "Meaning" },
  ],
  overlays: [{ t: "arrow", at: "toe3-1{0,-0.03,0}", to: "toe3-1{0,0.05,0}", label: "Sharp dorsiflexion, then hold", tone: "amber", when: [0.28, 0.45] }],
  hud: [
    {
      t: "stat",
      label: "Beats counted",
      value: (c) => {
        const sustained = (c.opt.response ?? "sustained") === "sustained";
        const t = Math.max(0, c.u - 0.4);
        if (c.u < 0.4) return "0";
        return String(Math.min(sustained ? 9 : 2, Math.floor(t * 9)));
      },
      sub: (c) => ((c.opt.response ?? "sustained") === "sustained" ? "> 5 = sustained" : "≤ 2 = normal"),
      tone: "amber",
    },
  ],
};

/* ---------------- jaw jerk ---------------- */

const jawScene: Scene = {
  kind: "reflex",
  title: "Jaw jerk",
  position: "sitting",
  loopMs: 9000,
  frame: { focus: "@chin", zoom: 0.65, view: [0.9, 0.2, 0.9], around: ["@nose", "@ear"] },
  face: (u, c) => {
    const amp = (c.opt.response ?? "normal") === "brisk" ? 1 : 0.3;
    const j = bounce(u, 0.5, 0.15);
    return { jaw: Math.max(0, 0.13 - 0.12 * amp * j) };
  },
  options: [{ id: "response", label: "Response", choices: [{ id: "normal", label: "Normal (slight)" }, { id: "brisk", label: "Brisk (UMN)" }], initial: "normal" }],
  beats: [
    { to: 0.3, text: "Mouth relaxed and slightly open; place a finger on the chin", chip: "Position" },
    { to: 0.5, text: "Tap your finger downwards with the hammer", chip: "Tap" },
    { to: 0.75, text: (c) => ((c.opt.response ?? "normal") === "brisk" ? "The jaw snaps shut: brisk response" : "A slight closing of the jaw, or none: normal"), chip: "Response" },
    { to: 1, text: "A brisk jaw jerk with brisk limb reflexes points above the pons (CN V arc is intact)", chip: "Meaning" },
  ],
  overlays: [
    { t: "beacon", at: "@chin", label: "Finger on chin", when: [0.02, 0.5] },
    { t: "hammer", at: "@chin", when: [0.27, 0.5] },
  ],
  hud: [{ t: "stat", label: "Jaw jerk (CN V)", value: (c) => ((c.opt.response ?? "normal") === "brisk" ? "Brisk" : "Normal"), tone: "amber" }],
};

/* ---------------- superficial abdominal reflexes ---------------- */

const abdominalScene: Scene = {
  kind: "reflex",
  title: "Superficial abdominal reflexes",
  position: "supine",
  loopMs: 11000,
  frame: { focus: "@umbilicus:m", zoom: 1.0, view: [0.2, 0.3, 1], around: ["@xiphoid:m", "@asis"] },
  beats: [
    { to: 0.25, text: "Patient relaxed, abdomen exposed. Use the blunt end of a key or an orange stick", chip: "Prepare" },
    { to: 0.5, text: "Stroke briskly towards the umbilicus in the upper quadrant (T8–T9)", chip: "Upper" },
    { to: 0.75, text: "Then the lower quadrant (T10–T12)", chip: "Lower" },
    { to: 1, text: "The umbilicus moves towards the stroke. Absent: UMN lesion (or obesity, surgery, multiparity)", chip: "Response" },
  ],
  overlays: [
    { t: "touch", at: "@xiphoid:m+@asis*0.7", to: "@umbilicus:m{0,0.03,0}", style: "stroke", label: "Upper: T8–T9", when: [0.25, 0.5] },
    { t: "touch", at: "@asis{0,0.03,0}", to: "@umbilicus:m{0,-0.03,0}", style: "stroke", label: "Lower: T10–T12", when: [0.5, 0.75] },
    { t: "arrow", at: "@umbilicus:m", to: "@umbilicus:m{0.045,0,0}", label: "Umbilicus moves towards the stroke", tone: "green", when: [0.76, 1] },
  ],
  hud: [{ t: "stat", label: "Abdominal reflex", value: "T8–T12", sub: "superficial (cutaneous)", tone: "amber" }],
};

export const reflexScenes: Record<string, Scene> = {
  "reflexes/biceps": bicepsScene,
  "reflexes/brachioradialis": brachioradialisScene,
  "reflexes/triceps": tricepsScene,
  "reflexes/patellar": patellarScene,
  "reflexes/medial-hamstring": hamstringScene,
  "reflexes/achilles": achillesScene,
  "reflexes/babinski": babinskiScene,
  "reflexes/hoffmann": hoffmannScene,
  "reflexes/ankle-clonus": ankleClonusScene,
  "reflexes/jaw-jerk": jawScene,
  "reflexes/abdominal": abdominalScene,
  // Concept demonstrations reuse an atlas item.
  "reflexes/concept:technique": patellarScene,
  "reflexes/concept:grading": bicepsScene,
  "reflexes/concept:umn-signs": babinskiScene,
};
