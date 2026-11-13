/** Vital signs and exercise monitoring: where the measurement is taken, the device on the body, and a live read-out. */
import { P } from "../../virtual-patient/parts.ts";
import type { Ctx, Scene } from "../scene-types.ts";
import { clamp01, gaitParts, ramp, SUP } from "./shared.ts";

const ARM_REST = (s: "left" | "right") => P(s, { shoulder: { flex: 14 }, elbow: { flex: 82, rot: SUP }, "shoulder:o": { flex: 14 }, "elbow:o": { flex: 80 } });
const resp = (u: number, cycles: number) => 0.5 - 0.5 * Math.cos(u * cycles * 2 * Math.PI);

const heartRate: Scene = {
  kind: "vitals",
  title: "Heart rate (pulse)",
  position: "sitting",
  loopMs: 12000,
  frame: { focus: "wrist", zoom: 0.8, view: [0.5, 0.7, 0.8], around: ["lowerarm01", "finger3-1"] },
  pose: (s) => ARM_REST(s),
  beats: [
    { to: 0.25, text: "Patient seated and rested; support the forearm, palm up", chip: "Position" },
    { to: 0.5, text: "Place two fingertips on the radial artery, at the thumb side of the wrist (never your thumb)", chip: "Find it" },
    { to: 0.85, text: "Count the beats for 30 seconds and double it (a full 60 s if irregular); note rate, rhythm and strength", chip: "Count" },
    { to: 1, text: "Normal adult resting rate: 60–100 beats per minute", chip: "Normal" },
  ],
  overlays: [
    { t: "beacon", at: "@radial-styloid{-0.014,0.0,0.0}", label: "Radial artery", when: [0.1, 1] },
    { t: "touch", at: "@radial-styloid{-0.014,0.0,0.0}", style: "press", label: "Two fingertips", when: [0.3, 1] },
  ],
  hud: [
    { t: "wave", kind: "pulse", bpm: 72, label: "Pulse", when: [0.3, 1] },
    { t: "timer", label: "Counting", seconds: (c) => clamp01((c.u - 0.5) / 0.35) * 30, target: 30, when: [0.5, 0.88] },
    { t: "stat", label: "Heart rate", value: (c) => (c.u > 0.85 ? "72 bpm" : "—"), sub: "36 beats × 2", tone: "green" },
  ],
};

const bpCuff = "upperarm01+lowerarm01*0.12";
const bpCuff2 = "upperarm01+lowerarm01*0.58";
const cuffPressure = (u: number) => (u < 0.3 ? 0 : u < 0.5 ? 180 * ((u - 0.3) / 0.2) : u < 0.9 ? 180 - 120 * ((u - 0.5) / 0.4) : 0);
const bloodPressure: Scene = {
  kind: "vitals",
  title: "Blood pressure",
  position: "sitting",
  loopMs: 14000,
  frame: { focus: "upperarm01+lowerarm01", zoom: 1.5, view: [1, 0.2, 0.5], around: ["upperarm01", "wrist"] },
  pose: (s) => P(s, { shoulder: { flex: 4 }, elbow: { flex: 28, rot: SUP }, "elbow:o": { flex: 60 } }),
  beats: [
    { to: 0.28, text: "Seated, back supported, arm at heart level; cuff 2–3 cm above the elbow crease", chip: "Cuff" },
    { to: 0.5, text: "Inflate quickly to about 30 mmHg above where the brachial pulse disappears", chip: "Inflate" },
    { to: 0.9, text: "Deflate at 2–3 mmHg per second. First sounds = systolic; sounds vanish = diastolic", chip: "Listen" },
    { to: 1, text: "Normal adult: about 120/80 mmHg. Take two readings and use the average", chip: "Result" },
  ],
  overlays: [
    { t: "device", kind: "cuff", at: bpCuff, to: bpCuff2, label: "Cuff", when: [0, 1] },
    { t: "device", kind: "probe", at: "lowerarm01{0,0,0.02}", label: "Stethoscope over the brachial artery", when: [0.1, 1] },
  ],
  hud: [
    { t: "bar", label: "Cuff pressure", unit: "mmHg", min: 0, max: 200, value: (c) => cuffPressure(c.u), marks: [{ at: 80, label: "80" }, { at: 120, label: "120" }] },
    { t: "stat", label: "Systolic", value: (c) => (c.u > 0.5 && cuffPressure(c.u) <= 120 ? "120" : "—"), sub: "first sound", tone: "red", at: "tr" },
    { t: "stat", label: "Diastolic", value: (c) => (c.u > 0.5 && cuffPressure(c.u) <= 80 ? "80" : "—"), sub: "sounds vanish", tone: "cyan", at: "tr" },
  ],
};

const respRate: Scene = {
  kind: "vitals",
  title: "Respiratory rate",
  position: "sitting",
  loopMs: 12000,
  frame: { focus: "spine03", zoom: 2.0, view: [0.4, 0.15, 1], around: ["@suprasternal-notch", "@xiphoid"] },
  pose: (s, u) => P(s, { ...{ trunk: { flex: -1.2 * resp(u, 4) } }, shoulder: { flex: 10 }, elbow: { flex: 60 } }),
  beats: [
    { to: 0.25, text: "Keep your fingers on the wrist as if still taking the pulse, so the patient does not alter their breathing", chip: "Discreetly" },
    { to: 0.85, text: "Watch the chest rise and fall: count each rise as one breath for 30 seconds, then double it", chip: "Count" },
    { to: 1, text: "Normal adult: 12–20 breaths per minute. Note depth, effort and pattern", chip: "Normal" },
  ],
  overlays: [{ t: "ring", at: "spine03{0,0,0.04}", along: ["spine02", "spine04"], r: (c) => 0.152 + 0.014 * resp(c.u, 4), tone: "amber", label: "Chest wall", when: [0.1, 1] }],
  hud: [
    { t: "wave", kind: "resp", bpm: 16, label: "Breathing", when: [0.1, 1] },
    { t: "stat", label: "Respiratory rate", value: (c) => (c.u > 0.85 ? "16 /min" : "—"), sub: "8 breaths × 2", tone: "amber" },
  ],
};

const spo2: Scene = {
  kind: "vitals",
  title: "Oxygen saturation (SpO₂)",
  position: "sitting",
  loopMs: 12000,
  frame: { focus: "finger2-3", zoom: 0.6, view: [0.5, 0.7, 0.8], around: ["wrist", "finger2-3>"] },
  pose: (s) => P(s, { shoulder: { flex: 14 }, elbow: { flex: 82, rot: SUP }, fingers: { flex: 10 }, "elbow:o": { flex: 80 } }),
  beats: [
    { to: 0.25, text: "Warm hands, remove nail varnish; the patient rests the hand still", chip: "Prepare" },
    { to: 0.5, text: "Clip the probe on a finger so the light shines through the nail bed", chip: "Clip on" },
    { to: 0.85, text: "Wait for a steady waveform and a stable number before you read it", chip: "Wait" },
    { to: 1, text: "Normal: 95–100 %. Below 92 %: tell the nurse or doctor; stop exercise below 88–90 %", chip: "Read" },
  ],
  overlays: [{ t: "device", kind: "clip", at: "finger2-2", label: "Pulse oximeter", when: [0.25, 1] }],
  hud: [
    { t: "wave", kind: "spo2", bpm: 72, label: "Pleth waveform", when: [0.5, 1] },
    { t: "stat", label: "SpO₂", value: (c) => (c.u > 0.68 ? "98 %" : c.u > 0.5 ? "96 %" : "—"), sub: "pulse 72", tone: "magenta" },
  ],
};

const temperature: Scene = {
  kind: "vitals",
  title: "Body temperature",
  position: "sitting",
  loopMs: 11000,
  frame: { focus: "@ear", zoom: 0.8, view: [1, 0.15, 0.5], around: ["@nose", "@ear"] },
  beats: [
    { to: 0.3, text: "Choose the route: ear (tympanic), forehead, mouth or armpit; clean the probe", chip: "Prepare" },
    { to: 0.6, text: "Place the probe snugly in the ear canal (pull the ear gently up and back)", chip: "Place" },
    { to: 0.85, text: "Wait for the beep, then read and record the value and the route", chip: "Read" },
    { to: 1, text: "Normal: about 36.1–37.2 °C. Fever from 38 °C; below 35 °C is hypothermia", chip: "Normal" },
  ],
  overlays: [{ t: "device", kind: "thermo", at: "@ear", label: "Tympanic probe", when: [0.3, 1] }],
  hud: [{ t: "stat", label: "Temperature", value: (c) => (c.u > 0.65 ? "36.8 °C" : "…"), sub: "tympanic", tone: "red" }],
};

/* ---------------- exercise monitoring: the patient steps while the scale moves ---------------- */

const stepping = (u: number) => P("right", gaitParts(u * 7, { stride: 0.7, arms: 0.8 }));
const exertion = (u: number) => 7 + 6.2 * ramp(u, 0.12, 0.75);
const exerciseScene = (title: string, beats: Scene["beats"], hud: Scene["hud"], overlays?: Scene["overlays"]): Scene => ({
  kind: "vitals",
  title,
  position: "standing",
  loopMs: 14000,
  frame: { focus: "spine03", zoom: 3, view: [1, 0.1, 0.35] },
  pose: (s, u) => P(s, gaitParts(u * 7, { stride: 0.7, arms: 0.8 })),
  beats,
  hud,
  overlays,
});
void stepping;

const rpe = exerciseScene(
  "Rating of perceived exertion (Borg 6–20)",
  [
    { to: 0.2, text: "Show the Borg scale before the exercise: 6 = no exertion, 20 = maximal", chip: "Explain" },
    { to: 0.8, text: "Ask during the exercise: “how hard does this feel overall — legs, breathing, effort?”", chip: "Ask" },
    { to: 1, text: "For most patients aim for 11–14 (light to somewhat hard); stop and review above 17 or with symptoms", chip: "Target" },
  ],
  [{ t: "scale", label: "Borg RPE", min: 6, max: 20, value: (c) => exertion(c.u), words: { 6: "No exertion", 7: "Extremely light", 9: "Very light", 11: "Light", 13: "Somewhat hard", 15: "Hard", 17: "Very hard", 19: "Extremely hard", 20: "Maximal" } }],
);

const dyspnoea = exerciseScene(
  "Breathlessness (modified Borg CR10)",
  [
    { to: 0.2, text: "Explain: 0 = no breathlessness, 10 = the worst you can imagine", chip: "Explain" },
    { to: 0.8, text: "Ask about breathlessness only (not leg effort) at rest and during exercise", chip: "Ask" },
    { to: 1, text: "Stop and rest at 7 or more, or if breathlessness is out of proportion to the work", chip: "Limit" },
  ],
  [{ t: "scale", label: "Breathlessness (CR10)", min: 0, max: 10, value: (c) => Math.round(0.5 + 6 * ramp(c.u, 0.15, 0.78)), words: { 0: "None at all", 1: "Very slight", 3: "Moderate", 5: "Strong", 7: "Very strong", 10: "Maximal" } }, { t: "wave", kind: "resp", bpm: (c) => 14 + 16 * ramp(c.u, 0.15, 0.78), label: "Breathing" }],
);

const talkTest = exerciseScene(
  "Talk test",
  [
    { to: 0.3, text: "Light effort: the patient can talk in full sentences, even sing", chip: "Light" },
    { to: 0.65, text: "Moderate: can talk but not sing, in short sentences — the target zone", chip: "Moderate" },
    { to: 1, text: "Too hard: can only say a few words between breaths — slow down", chip: "Too hard" },
  ],
  [{ t: "stat", label: "Speech", value: (c) => (c.u < 0.3 ? "Sentences" : c.u < 0.65 ? "Phrases" : "Words"), sub: (c) => (c.u < 0.3 ? "light" : c.u < 0.65 ? "moderate" : "stop"), tone: "amber" }, { t: "wave", kind: "resp", bpm: (c) => 14 + 16 * ramp(c.u, 0.1, 0.8), label: "Breathing" }],
  [{ t: "beacon", at: "@chin", label: "“Can you finish a sentence?”", tone: "amber", when: [0.05, 1] }],
);

const painScale: Scene = {
  kind: "vitals",
  title: "Pain (Numeric Rating Scale)",
  position: "sitting",
  loopMs: 12000,
  frame: { focus: "spine02", zoom: 2.2, view: [0.8, 0.1, -0.8], around: ["spine02", "spine04"] },
  pose: (s) => P(s, { trunk: { flex: 6 }, shoulder: { flex: 10 }, elbow: { flex: 50 } }),
  zone: undefined,
  beats: [
    { to: 0.3, text: "Ask where it hurts and mark the area on the body", chip: "Where" },
    { to: 0.75, text: "“On a scale from 0 (no pain) to 10 (the worst pain imaginable), how bad is it right now?”", chip: "Ask" },
    { to: 1, text: "Record the number with the activity; a change of 2 points (or 30 %) is clinically meaningful", chip: "Record" },
  ],
  overlays: [{ t: "beacon", at: "spine04{0,0,-0.07}", label: "Pain here", tone: "red", when: [0.05, 1] }],
  hud: [{ t: "scale", label: "Pain NRS", min: 0, max: 10, value: (c) => Math.round(6 * ramp(c.u, 0.35, 0.65)), words: { 0: "No pain", 3: "Mild", 5: "Moderate", 6: "Moderate–severe", 8: "Severe", 10: "Worst imaginable" } }],
};

/* ---------------- special checks ---------------- */

const standBp = (c: Ctx) => (c.u < 0.4 ? "128/80" : c.u < 0.65 ? "112/72" : "104/64");
const orthostatic: Scene = {
  kind: "vitals",
  title: "Orthostatic (postural) hypotension check",
  position: "standing",
  hidePlinth: true,
  planted: "toe3-1",
  props: [{ kind: "chair", at: [0, 0, -0.16] }],
  loopMs: 15000,
  frame: { focus: "spine03", zoom: 3.2, view: [1, 0.15, 0.2], around: ["foot", "@nose"] },
  pose: (s, u) => {
    const up = ramp(u, 0.36, 0.5);
    return P(s, { hip: { flex: 88 * (1 - up) }, "hip:o": { flex: 88 * (1 - up) }, knee: { flex: 88 * (1 - up) }, "knee:o": { flex: 88 * (1 - up) }, trunk: { flex: 24 * Math.sin(up * Math.PI) + 3 * (1 - up) }, shoulder: { flex: 14 }, "shoulder:o": { flex: 14 }, elbow: { flex: 70 * (1 - up) + 40 * up }, "elbow:o": { flex: 70 * (1 - up) + 40 * up } });
  },
  beats: [
    { to: 0.36, text: "Rest the patient (lying, or sitting if lying is not possible) for 5 minutes, then take BP and pulse", chip: "Rest" },
    { to: 0.52, text: "Stand the patient up; ask about dizziness; watch for unsteadiness", chip: "Stand" },
    { to: 0.8, text: "Measure again at 1 and 3 minutes of standing", chip: "Re-measure" },
    { to: 1, text: "A fall of 20 mmHg systolic or 10 mmHg diastolic (or dizziness) means orthostatic hypotension", chip: "Result" },
  ],
  hud: [
    { t: "stat", label: "Blood pressure", value: standBp, sub: (c) => (c.u < 0.4 ? "lying / sitting" : c.u < 0.65 ? "standing 1 min" : "standing 3 min"), tone: "cyan" },
    { t: "stat", label: "Change", value: (c) => (c.u < 0.4 ? "—" : c.u < 0.65 ? "−16/−8" : "−24/−16"), sub: (c) => (c.u > 0.7 ? "positive" : ""), tone: "red", at: "tr", when: [0.4, 1] },
  ],
};

const glucose: Scene = {
  kind: "vitals",
  title: "Blood glucose (finger-prick)",
  position: "sitting",
  loopMs: 12000,
  frame: { focus: "finger3-3", zoom: 0.55, view: [0.5, 0.7, 0.8], around: ["wrist", "finger3-3>"] },
  pose: (s) => P(s, { shoulder: { flex: 14 }, elbow: { flex: 82, rot: SUP }, fingers: { flex: 20 }, "elbow:o": { flex: 80 } }),
  beats: [
    { to: 0.28, text: "Wash and dry the hands; load a new test strip and lancet", chip: "Prepare" },
    { to: 0.55, text: "Prick the side of a fingertip (not the pad) and touch the drop to the strip", chip: "Prick" },
    { to: 0.85, text: "Read the meter; record the value and the time of the last meal", chip: "Read" },
    { to: 1, text: "Fasting: 4–7 mmol/L (72–126 mg/dL). Below 4 (70 mg/dL) or above 15 (270 mg/dL): act before exercise", chip: "Check" },
  ],
  overlays: [
    { t: "device", kind: "meter", at: "finger3-3>{0.0,-0.03,0.02}", label: "Glucose meter", when: [0.3, 1] },
    { t: "beacon", at: "finger3-3", label: "Side of fingertip", tone: "red", when: [0.28, 0.6] },
  ],
  hud: [{ t: "stat", label: "Blood glucose", value: (c) => (c.u > 0.68 ? "5.4" : "…"), sub: "mmol/L  (97 mg/dL)", tone: "green" }],
};

const abpi: Scene = {
  kind: "vitals",
  title: "Ankle–brachial pressure index (ABPI)",
  position: "supine",
  loopMs: 14000,
  frame: { focus: "lowerleg01+foot", zoom: 1.6, view: [0.4, 0.4, 1], around: ["foot", "toe3-1"] },
  pose: (s) => P(s, { "hip:o": { abd: 8 } }),
  beats: [
    { to: 0.25, text: "Patient supine and rested for 10 minutes", chip: "Rest" },
    { to: 0.55, text: "Cuff above the ankle; Doppler probe on the dorsalis pedis pulse; inflate until the signal stops", chip: "Ankle" },
    { to: 0.8, text: "Deflate slowly: the pressure when the signal returns is the ankle systolic pressure", chip: "Read" },
    { to: 1, text: "ABPI = ankle ÷ higher arm pressure. 1.0–1.3 normal; < 0.9 arterial disease; > 1.3 stiff vessels", chip: "Calculate" },
  ],
  overlays: [
    { t: "device", kind: "cuff", at: "lowerleg01+foot*0.72", to: "lowerleg01+foot*0.96", label: "Ankle cuff", when: [0.1, 1] },
    { t: "device", kind: "probe", at: "@dorsalis-pedis", label: "Doppler probe", when: [0.3, 1] },
  ],
  hud: [
    { t: "bar", label: "Cuff pressure", unit: "mmHg", min: 0, max: 200, value: (c) => (c.u < 0.3 ? 0 : c.u < 0.45 ? 170 * ((c.u - 0.3) / 0.15) : c.u < 0.7 ? 170 - 52 * ((c.u - 0.45) / 0.25) : 118), marks: [{ at: 118, label: "118" }] },
    { t: "stat", label: "ABPI", value: (c) => (c.u > 0.8 ? "0.91" : "—"), sub: "118 ÷ 130 mmHg", tone: "amber", at: "tr" },
  ],
};

const capRefill: Scene = {
  kind: "vitals",
  title: "Capillary refill time",
  position: "sitting",
  loopMs: 11000,
  frame: { focus: "finger3-3", zoom: 0.5, view: [0.5, 0.7, 0.8], around: ["finger3-3>", "finger3-1"] },
  pose: (s) => P(s, { shoulder: { flex: 14 }, elbow: { flex: 82, rot: SUP }, fingers: { flex: 14 }, "elbow:o": { flex: 80 } }),
  beats: [
    { to: 0.2, text: "Hand at heart level, warm room; use the fingertip or the sternum", chip: "Prepare" },
    { to: 0.55, text: "Press on the nail bed for 5 seconds until it blanches white", chip: "Press" },
    { to: 0.85, text: "Release and count how long the pink colour takes to return", chip: "Count" },
    { to: 1, text: "Normal: under 2 seconds. Longer suggests poor perfusion, cold, shock or dehydration", chip: "Normal" },
  ],
  overlays: [{ t: "touch", at: "finger3-3>", style: "press", label: "Press 5 s", when: [0.2, 0.55] }, { t: "beacon", at: "finger3-3>", label: "Colour returns", tone: "green", when: [0.58, 0.88] }],
  hud: [
    { t: "timer", label: "Refill time", seconds: (c) => Math.max(0, Math.min(1.4, (c.u - 0.58) / 0.2 * 1.4)), target: 2, when: [0.55, 1] },
    { t: "stat", label: "Result", value: (c) => (c.u > 0.8 ? "1.4 s" : "…"), sub: "normal (< 2 s)", tone: "green", when: [0.55, 1] },
  ],
};

export const vitalScenes: Record<string, Scene> = {
  "vital-signs/heart-rate": heartRate,
  "vital-signs/blood-pressure": bloodPressure,
  "vital-signs/respiratory-rate": respRate,
  "vital-signs/spo2": spo2,
  "vital-signs/temperature": temperature,
  "vital-signs/rpe": rpe,
  "vital-signs/dyspnoea": dyspnoea,
  "vital-signs/talk-test": talkTest,
  "vital-signs/pain-nrs": painScale,
  "vital-signs/orthostatic": orthostatic,
  "vital-signs/glucose": glucose,
  "vital-signs/abpi": abpi,
  "vital-signs/capillary-refill": capRefill,
  // Concept demonstrations reuse an atlas item.
  "vital-signs/concept:bp-steps": bloodPressure,
  "vital-signs/concept:normal-values": heartRate,
  "vital-signs/concept:intensity": rpe,
  "vital-signs/concept:stop-signs": dyspnoea,
};
