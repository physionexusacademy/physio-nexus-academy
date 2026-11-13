/** Tone and coordination: passive movement with a live resistance curve, and the classic coordination and balance tests. */
import { P } from "../../virtual-patient/parts.ts";
import type { Ctx, Scene, SceneOption } from "../scene-types.ts";
import { clamp01, ease, gaitParts, PRO, ramp, SUP, tri } from "./shared.ts";
import { ankleClonusScene } from "./reflexes.ts";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* Tone                                                                */
/* ------------------------------------------------------------------ */

const MAS: SceneOption = {
  id: "grade",
  label: "Ashworth grade",
  choices: ["0", "1", "1+", "2", "3", "4"].map((g) => ({ id: g, label: g })),
  initial: "2",
};
const MAS_NAME: Record<string, string> = {
  "0": "No increase in tone",
  "1": "Slight increase: a catch and release, or minimal resistance at the very end of range",
  "1+": "Slight increase: a catch, then minimal resistance through less than half of the range",
  "2": "More marked increase through most of the range, but the limb moves easily",
  "3": "Considerable increase: passive movement is difficult",
  "4": "Rigid in flexion or extension",
};
const ROM: Record<string, number> = { "0": 1, "1": 1, "1+": 1, "2": 0.93, "3": 0.68, "4": 0.14 };
const g = (c: Ctx) => c.opt.grade ?? "2";

/** Resistance felt (0–1) by the examiner at fraction `a` of the passive range, for each grade. */
const resist = (grade: string, a: number) => {
  const peak = (at: number, w: number, h: number) => h * Math.exp(-(((a - at) / w) ** 2));
  switch (grade) {
    case "0": return 0.05;
    case "1": return 0.06 + peak(0.93, 0.03, 0.34);
    case "1+": return 0.06 + peak(0.45, 0.035, 0.42) + (a > 0.45 && a < 0.95 ? 0.07 : 0);
    case "2": return 0.18 + 0.32 * a;
    case "3": return 0.45 + 0.35 * a;
    default: return 0.95;
  }
};

const passive = (rom: number, u: number, cycles = 2) => ease(tri(u, cycles)) * 125 * rom;

const masScene: Scene = {
  kind: "tone",
  title: "Modified Ashworth Scale",
  position: "supine",
  loopMs: 12000,
  frame: { focus: "lowerarm01", zoom: 1.5, view: [1, 0.9, 0.55], around: ["wrist", "upperarm01"] },
  pose: (s, u, c) => P(s, { shoulder: { flex: 12 }, elbow: { flex: passive(ROM[g(c)], u), rot: SUP } }),
  options: [MAS],
  beats: [
    { to: 0.34, text: "Start with the elbow in full flexion, the patient relaxed", chip: "Position" },
    { to: 0.7, text: "Move the elbow into full extension in about one second, feeling for resistance", chip: "Move" },
    { to: 1, text: (c) => `Grade ${g(c)}: ${MAS_NAME[g(c)]}`, chip: "Grade" },
  ],
  overlays: [{ t: "beacon", at: "wrist", label: "Examiner moves here", when: [0, 1] }],
  hud: [
    { t: "stat", label: "Modified Ashworth", value: (c) => g(c), sub: (c) => (g(c) === "0" ? "normal tone" : "spasticity"), tone: "amber" },
    { t: "curve", label: "Resistance felt through the range", resist: (a, c) => resist(g(c), a), angle: (c) => tri(c.u, 2) },
  ],
};

/* Tardieu: a slow stretch gives the full range (R2); a fast stretch gives the angle of catch (R1). */
const R1 = 62;
const R2 = 128;
const tardieuAngle = (u: number) => {
  if (u < 0.08) return 0;
  if (u < 0.36) return R2 * ease((u - 0.08) / 0.28);
  if (u < 0.46) return R2 * (1 - ease((u - 0.36) / 0.1));
  if (u < 0.55) return 0;
  if (u < 0.61) return R1 * ease((u - 0.55) / 0.06);
  if (u < 0.66) return R1;
  if (u < 0.71) return R1 + (R2 - R1) * ease((u - 0.66) / 0.05);
  if (u < 0.78) return R2;
  return R2 * (1 - ease((u - 0.78) / 0.14));
};
const tardieuScene: Scene = {
  kind: "tone",
  title: "Modified Tardieu Scale",
  position: "supine",
  loopMs: 13000,
  frame: { focus: "lowerarm01", zoom: 1.5, view: [1, 0.9, 0.55], around: ["wrist", "upperarm01"] },
  pose: (s, u) => P(s, { shoulder: { flex: 12 }, elbow: { flex: tardieuAngle(u), rot: SUP } }),
  beats: [
    { to: 0.08, text: "Elbow flexed, patient relaxed", chip: "Position" },
    { to: 0.5, text: "Slow stretch (V1): the full passive range of motion is R2", chip: "Slow: R2" },
    { to: 0.78, text: "Fast stretch (V3): a catch at R1, then a release — the angle of catch", chip: "Fast: R1" },
    { to: 1, text: "The difference R2 − R1 shows how much of the restriction is spasticity rather than contracture", chip: "R2 − R1" },
  ],
  hud: [
    { t: "bar", label: "Elbow angle", unit: "°", min: 0, max: 140, value: (c) => tardieuAngle(c.u), marks: [{ at: R1, label: "R1" }, { at: R2, label: "R2" }] },
    { t: "stat", label: "R2 (full range)", value: `${R2}°`, tone: "cyan", when: [0.2, 1] },
    { t: "stat", label: "R1 (catch)", value: `${R1}°`, tone: "amber", at: "tr", when: [0.6, 1] },
  ],
};

const stairs = (x: number, n: number) => {
  const k = x * n;
  return (Math.floor(k) + ease(clamp01((k % 1) * 2))) / n;
};
const rigidScene = (kind: "lead" | "cog"): Scene => ({
  kind: "tone",
  title: kind === "lead" ? "Lead-pipe rigidity" : "Cogwheel rigidity",
  position: "supine",
  loopMs: 12000,
  frame: { focus: "lowerarm01", zoom: 1.5, view: [1, 0.9, 0.55], around: ["wrist", "upperarm01"] },
  pose: (s, u) => {
    const x = tri(u, 2);
    const a = kind === "cog" ? stairs(x, 12) : x;
    return P(s, { shoulder: { flex: 12 }, elbow: { flex: 125 * 0.55 * ease(a), rot: SUP } });
  },
  beats: [
    { to: 0.34, text: kind === "lead" ? "Move the limb slowly through its range, in either direction" : "Move the limb slowly through its range while the patient relaxes", chip: "Move" },
    { to: 0.7, text: kind === "lead" ? "Resistance is constant and smooth throughout, in both flexion and extension" : "The resistance gives way in rhythmic steps, like a ratchet", chip: "Feel" },
    { to: 1, text: kind === "lead" ? "Lead-pipe: uniform rigidity (basal ganglia disease, drug-induced parkinsonism, NMS)" : "Cogwheel: rigidity with a superimposed tremor — typical of Parkinson’s disease; reinforce by asking the other hand to draw circles", chip: "Meaning" },
  ],
  hud: [
    { t: "stat", label: "Rigidity", value: kind === "lead" ? "Lead-pipe" : "Cogwheel", tone: "amber" },
    { t: "curve", label: "Resistance felt through the range", resist: (a) => (kind === "lead" ? 0.78 : 0.6 + 0.28 * Math.sin(a * 12 * Math.PI * 2 * 0.5) ** 3), angle: (c) => tri(c.u, 2) },
  ],
});

/* ------------------------------------------------------------------ */
/* Coordination                                                        */
/* ------------------------------------------------------------------ */

const CEREBELLAR: SceneOption = { id: "who", label: "Patient", choices: [{ id: "healthy", label: "Healthy" }, { id: "cerebellar", label: "Cerebellar lesion" }], initial: "healthy" };
const cerebellar = (c: Ctx) => c.opt.who === "cerebellar";

/** Finger-to-nose: angles solved so the index fingertip lands on the nose (calibrated on the 3D patient). */
const NOSE_TARGET = "@nose{0.246,-0.131,0.542}";
const fingerNosePose = (s: "left" | "right", u: number, c: Ctx) => {
  const a = ease(tri(u, 3)); // 0 = at the examiner's finger, 1 = on the nose
  const bad = cerebellar(c);
  // Intention tremor grows as the finger nears its target; past-pointing at the examiner's finger.
  const near = Math.max(ramp(a, 0.7, 1), 1 - ramp(a, 0, 0.25));
  const tremor = bad ? 9 * near * Math.sin(u * 150) : 0.6 * Math.sin(u * 40);
  const overshoot = bad ? 12 * Math.max(0, 1 - ramp(a, 0, 0.3)) : 0;
  return P(s, {
    shoulder: { flex: lerp(85, 60, a), abd: lerp(5, 32, a) + tremor + overshoot * 0.5, rot: lerp(0, 30, a) },
    elbow: { flex: lerp(12, 140, a) + tremor * 0.8 - overshoot, rot: lerp(0, -70, a) },
    fingers: { flex: 0 },
    "shoulder:o": { flex: 10 },
    "elbow:o": { flex: 70 },
  });
};
const fingerNoseScene: Scene = {
  kind: "coordination",
  title: "Finger-to-nose test",
  position: "sitting",
  loopMs: 12000,
  frame: { focus: "@nose", zoom: 1.7, view: [1, 0.2, 0.9], around: [NOSE_TARGET, "finger2-3>"] },
  pose: fingerNosePose,
  options: [CEREBELLAR],
  beats: [
    { to: 0.2, text: "Hold your finger at arm’s length from the patient", chip: "Set up" },
    { to: 0.8, text: (c) => (cerebellar(c) ? "Shaking that gets worse near the target (intention tremor) and overshoot (past-pointing)" : "The patient touches their nose, then your finger, quickly and smoothly"), chip: "Test" },
    { to: 1, text: "Move your finger to a new place to test accuracy; repeat with the eyes closed and on the other side", chip: "Vary it" },
  ],
  overlays: [
    { t: "beacon", at: NOSE_TARGET, label: "Examiner’s finger", when: [0, 1] },
    { t: "beacon", at: "@nose", label: "Nose", tone: "green", when: [0, 1] },
    { t: "line", from: "@nose", to: NOSE_TARGET, dashed: true, tone: "white", when: [0, 1] },
  ],
  hud: [{ t: "stat", label: "Finger–nose", value: (c) => (cerebellar(c) ? "Dysmetria" : "Accurate"), sub: (c) => (cerebellar(c) ? "intention tremor" : "smooth, on target"), tone: "cyan" }],
};

const alternatingScene: Scene = {
  kind: "coordination",
  title: "Rapid alternating movements",
  position: "sitting",
  loopMs: 9000,
  frame: { focus: "lowerarm01+wrist", zoom: 1.2, view: [1, 0.7, 0.5], around: ["wrist", "finger3-3>"] },
  pose: (s, u, c) => {
    const bad = cerebellar(c);
    const phase = u * (bad ? 9 : 24) * 2 * Math.PI;
    const amp = bad ? 60 + 28 * Math.sin(u * 13) : 86;
    const jitter = bad ? 14 * Math.sin(u * 37) : 0;
    return P(s, { shoulder: { flex: 14 }, elbow: { flex: 92, rot: amp * Math.sin(phase) + jitter }, "shoulder:o": { flex: 12 }, "elbow:o": { flex: 80 } });
  },
  options: [CEREBELLAR],
  beats: [
    { to: 0.15, text: "Patient taps one palm on the other hand or thigh", chip: "Set up" },
    { to: 0.85, text: (c) => (cerebellar(c) ? "Slow, uneven and clumsy: dysdiadochokinesia" : "Pronating and supinating quickly, smoothly and regularly"), chip: "Test" },
    { to: 1, text: "Repeat on the other side and compare speed and rhythm", chip: "Compare" },
  ],
  hud: [{ t: "stat", label: "Rhythm", value: (c) => (cerebellar(c) ? "Irregular" : "Regular"), sub: (c) => (cerebellar(c) ? "dysdiadochokinesia" : "fast and even"), tone: "cyan" }],
};

/* Heel-to-shin: keyframes solved on the 3D patient (t = how far down the opposite shin the heel is). */
const HEEL: [number, number, number, number, number][] = [
  [0, 55, -5, -30, 110],
  [0.2, 47, -5, -30, 100],
  [0.4, 39, -5, -30, 80],
  [0.6, 39, -13, -15, 70],
  [0.8, 23, -13, -15, 40],
  [1, 15, -13, -15, 30],
];
const heelAt = (t: number) => {
  for (let i = 1; i < HEEL.length; i++) {
    if (t <= HEEL[i][0]) {
      const a = HEEL[i - 1], b = HEEL[i];
      const k = (t - a[0]) / (b[0] - a[0]);
      return { flex: lerp(a[1], b[1], k), abd: lerp(a[2], b[2], k), rot: lerp(a[3], b[3], k), knee: lerp(a[4], b[4], k) };
    }
  }
  const z = HEEL[HEEL.length - 1];
  return { flex: z[1], abd: z[2], rot: z[3], knee: z[4] };
};
const heelShinScene: Scene = {
  kind: "coordination",
  title: "Heel-to-shin test",
  position: "supine",
  loopMs: 12000,
  frame: { focus: "lowerleg01:o", zoom: 1.7, view: [0.4, 0.15, 1], around: ["foot", "foot:o", "upperleg01"] },
  pose: (s, u, c) => {
    const t = ease(tri(u, 2));
    const h = heelAt(t);
    const bad = cerebellar(c);
    const wander = bad ? 9 * Math.sin(u * 120) + 6 * Math.sin(u * 53) : 0;
    return P(s, { hip: { flex: h.flex + wander * 0.5, abd: h.abd + wander, rot: h.rot }, knee: { flex: h.knee - wander * 0.6 }, "hip:o": { abd: 4 } });
  },
  options: [CEREBELLAR],
  beats: [
    { to: 0.15, text: "Patient lies supine; place the heel of one leg on the opposite knee", chip: "Set up" },
    { to: 0.85, text: (c) => (cerebellar(c) ? "The heel wanders off the shin and overshoots: ataxia" : "Slide the heel smoothly down the shin to the ankle, then back up"), chip: "Test" },
    { to: 1, text: "Repeat on the other leg, then with the eyes closed", chip: "Compare" },
  ],
  overlays: [
    { t: "line", from: "lowerleg01:o", to: "foot:o", label: "Opposite shin", tone: "white", dashed: true, when: [0, 1] },
    { t: "beacon", at: "foot", label: "Heel", when: [0, 1] },
  ],
  hud: [{ t: "stat", label: "Heel–shin", value: (c) => (cerebellar(c) ? "Ataxic" : "Smooth"), sub: (c) => (cerebellar(c) ? "heel leaves the shin" : "stays on the shin"), tone: "cyan" }],
};

/* Romberg: feet together, eyes open then closed; the sway is shown and measured. */
const ROMBERG_OPT: SceneOption = {
  id: "eyes",
  label: "Eyes",
  choices: [{ id: "open", label: "Open" }, { id: "closed", label: "Closed (normal)" }, { id: "positive", label: "Closed (positive Romberg)" }],
  initial: "closed",
};
const swayDeg = (u: number, c: Ctx) => {
  const eyes = c.opt.eyes ?? "closed";
  const closed = u > 0.35;
  const base = !closed || eyes === "open" ? 0.8 : eyes === "closed" ? 1.6 : 1.6 + 7 * ramp(u, 0.4, 0.8);
  return base;
};
export const rombergScene: Scene = {
  kind: "coordination",
  title: "Romberg test",
  position: "standing",
  loopMs: 12000,
  frame: { focus: "spine03", zoom: 3.4, view: [0.3, 0.1, 1], around: ["foot", "foot:o", "@nose"] },
  pose: (s, u, c) => {
    const k = swayDeg(u, c);
    const step = (c.opt.eyes ?? "closed") === "positive" && u > 0.82 ? ramp(u, 0.82, 0.88) : 0;
    return P(s, { hip: { abd: -3 + 6 * step }, "hip:o": { abd: -3 }, trunk: { abd: k * Math.sin(u * 40) + 0.5 * k * Math.sin(u * 91), flex: 0.6 * k * Math.sin(u * 53 + 1) }, shoulder: { abd: 6 }, "shoulder:o": { abd: 6 } });
  },
  options: [ROMBERG_OPT],
  beats: [
    { to: 0.35, text: "Feet together, arms by the sides, eyes open: stand close to catch a fall", chip: "Eyes open" },
    { to: 0.85, text: (c) => ((c.opt.eyes ?? "closed") === "positive" ? "Eyes closed: sway increases until the patient steps — a positive Romberg (sensory ataxia)" : "Eyes closed for 30 s: a little sway is normal"), chip: "Eyes closed" },
    { to: 1, text: (c) => ((c.opt.eyes ?? "closed") === "positive" ? "Loss of balance only with the eyes shut means a proprioceptive (dorsal column) or vestibular problem" : "Steady: proprioception and the vestibular system are doing their job"), chip: "Meaning" },
  ],
  overlays: [{ t: "beacon", at: "@nose", label: (c) => (c.u > 0.35 && (c.opt.eyes ?? "closed") !== "open" ? "Eyes closed" : "Eyes open"), tone: "amber", when: [0, 1] }],
  hud: [
    { t: "bar", label: "Sway", unit: "cm", min: 0, max: 12, goodFrom: 0, goodTo: 3, value: (c) => swayDeg(c.u, c) * 1.2 * (0.55 + 0.45 * Math.abs(Math.sin(c.u * 40))) },
    { t: "stat", label: "Result", value: (c) => ((c.opt.eyes ?? "closed") === "positive" && c.u > 0.82 ? "Steps" : "Steady"), tone: "cyan", when: [0.35, 1] },
  ],
};

/* Tandem gait: heel-to-toe along a line. */
const tandemScene: Scene = {
  kind: "coordination",
  title: "Tandem gait",
  position: "standing",
  loopMs: 11000,
  frame: { focus: "spine03", zoom: 3, view: [1, 0.12, 0.25] },
  props: [{ kind: "walkway", size: 1 }],
  pose: (s, u, c) => {
    const bad = cerebellar(c);
    const parts = gaitParts(((u - 0.05) / 0.9) * 2, { width: bad ? 9 : -4, stride: bad ? 0.7 : 0.55, sway: bad ? 7 : 1.5, arms: bad ? 0.25 : 0.5 });
    return P(s, parts);
  },
  root: (s, u) => ({ dz: -1.2 + 2.4 * clamp01((u - 0.05) / 0.9) }),
  options: [CEREBELLAR],
  beats: [
    { to: 0.1, text: "Stand at one end of a straight line", chip: "Set up" },
    { to: 0.92, text: (c) => (cerebellar(c) ? "Wide-based, lurching steps and constant side-to-side correction: truncal ataxia" : "Walk heel-to-toe along the line, one foot directly in front of the other"), chip: "Walk" },
    { to: 1, text: "Failure to walk a straight line is the most sensitive bedside test for mild cerebellar disease", chip: "Meaning" },
  ],
  hud: [{ t: "stat", label: "Tandem gait", value: (c) => (cerebellar(c) ? "Ataxic" : "Steady"), tone: "cyan" }],
};

/* Pronator drift: arms forward, palms up, eyes closed. The tested arm drifts. */
const driftScene: Scene = {
  kind: "coordination",
  title: "Pronator drift",
  position: "standing",
  loopMs: 12000,
  frame: { focus: "wrist+wrist:o", zoom: 2.4, view: [0.15, 0.25, 1], around: ["upperarm01", "upperarm01:o", "finger3-3>"] },
  pose: (s, u, c) => {
    const drift = (c.opt.arm ?? "drift") === "drift" ? ramp(u, 0.3, 0.9) : 0;
    return P(s, {
      shoulder: { flex: 88 - 20 * drift, abd: 4 },
      elbow: { flex: 6 + 6 * drift, rot: SUP - (SUP - 12) * drift },
      "shoulder:o": { flex: 88, abd: 4 },
      "elbow:o": { flex: 6, rot: SUP },
    });
  },
  options: [{ id: "arm", label: "Result", choices: [{ id: "normal", label: "Normal" }, { id: "drift", label: "Drift (pyramidal weakness)" }], initial: "drift" }],
  beats: [
    { to: 0.3, text: "Both arms out in front, palms up, eyes closed — hold for 20–30 seconds", chip: "Hold" },
    { to: 0.9, text: (c) => ((c.opt.arm ?? "drift") === "drift" ? "One forearm slowly turns palm-down (pronates) and the arm sinks" : "Both arms stay level, palms up"), chip: "Watch" },
    { to: 1, text: "Pronator drift is a subtle sign of an upper motor neurone (pyramidal) lesion; downward drift without pronation suggests a cerebellar or parietal cause", chip: "Meaning" },
  ],
  overlays: [{ t: "arrow", at: "wrist", to: "wrist{0,-0.08,0}", label: "Drifts down and pronates", tone: "red", when: [0.55, 1] }],
  hud: [{ t: "stat", label: "Pronator drift", value: (c) => ((c.opt.arm ?? "drift") === "drift" ? "Positive" : "Negative"), tone: "amber" }],
};

export const toneScenes: Record<string, Scene> = {
  "tone-coordination/mas": masScene,
  "tone-coordination/tardieu": tardieuScene,
  "tone-coordination/clonus": ankleClonusScene,
  "tone-coordination/lead-pipe": rigidScene("lead"),
  "tone-coordination/cogwheel": rigidScene("cog"),
  "tone-coordination/finger-nose": fingerNoseScene,
  "tone-coordination/rapid-alternating": alternatingScene,
  "tone-coordination/heel-shin": heelShinScene,
  "tone-coordination/romberg": rombergScene,
  "tone-coordination/tandem": tandemScene,
  "tone-coordination/pronator-drift": driftScene,
  // Concept demonstrations reuse an atlas item.
  "tone-coordination/concept:mas-method": masScene,
  "tone-coordination/concept:spasticity-vs-rigidity": rigidScene("lead"),
  "tone-coordination/concept:coordination-tests": fingerNoseScene,
  "tone-coordination/concept:cerebellar-signs": heelShinScene,
  "tone-coordination/concept:romberg-meaning": rombergScene,
};

void PRO;
