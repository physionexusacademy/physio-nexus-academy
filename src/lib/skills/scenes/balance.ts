/** Balance and function: sit-to-stand, standing balance, walking and the clinical walking tests, each with a stopwatch or score read-out. */
import { P } from "../../virtual-patient/parts.ts";
import type { Ctx, Scene, SceneOption } from "../scene-types.ts";
import { clamp01, ease, gaitParts, ramp, tri } from "./shared.ts";
import { rombergScene } from "./tone.ts";

type Parts = Parameters<typeof P>[1];

/** Sitting (k = 1) to standing (k = 0): hips and knees straighten, the trunk leans forward on the way up. */
const sitToStand = (k: number): Parts => ({
  hip: { flex: 88 * k }, "hip:o": { flex: 88 * k }, knee: { flex: 88 * k }, "knee:o": { flex: 88 * k },
  trunk: { flex: 24 * Math.sin(Math.PI * (1 - k)) + 3 * k },
  shoulder: { flex: 14 }, "shoulder:o": { flex: 14 }, elbow: { flex: 70 }, "elbow:o": { flex: 70 },
});
const CHAIR: Scene["props"] = [{ kind: "chair", at: [0, 0, -0.16] }];
const base = { kind: "task" as const, hidePlinth: true, position: "standing" as const };
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ---------------- sit-to-stand tests ---------------- */

const stsScene = (title: string, reps: number, seconds: number, target: number, beats: Scene["beats"], chair = true): Scene => ({
  ...base,
  title,
  planted: "toe3-1",
  props: chair ? CHAIR : undefined,
  loopMs: 14000,
  frame: { focus: "spine03", zoom: 3.4, view: [1, 0.12, 0.2], around: ["foot", "@nose"] },
  pose: (s, u) => P(s, sitToStand(1 - ease(tri(clamp01((u - 0.06) / 0.88), reps)))),
  beats,
  hud: [
    { t: "stat", label: "Stand-ups", value: (c) => `${Math.min(reps, Math.floor(clamp01((c.u - 0.06) / 0.88) * reps + 0.5))} / ${reps}`, tone: "cyan" },
    { t: "timer", label: "Time", seconds: (c) => clamp01((c.u - 0.06) / 0.88) * seconds, target, when: [0.04, 1] },
  ],
});

const fiveSts = stsScene("Five Times Sit-to-Stand (5×STS)", 5, 11.4, 15, [
  { to: 0.06, text: "Seated on a standard chair (about 43 cm), arms folded across the chest, back against the chair", chip: "Position" },
  { to: 0.92, text: "On “go”: stand up fully and sit down five times as fast as possible; start the timer on “go” and stop when the buttocks touch the seat the fifth time", chip: "Five stands" },
  { to: 1, text: "Norms: about 11 s at ages 60–69, 13 s in the 70s and 15 s in the 80s; over 15 s predicts recurrent falls. Stop and re-start if the arms are used", chip: "Interpret" },
]);
const thirtyCst = stsScene("30-Second Chair Stand", 12, 30, 30, [
  { to: 0.06, text: "Seated on a 43 cm chair, arms folded across the chest, feet flat on the floor", chip: "Position" },
  { to: 0.92, text: "Stand up fully and sit back down as many times as possible in 30 seconds; count each full stand", chip: "Count" },
  { to: 1, text: "Below-average scores for age (for example fewer than 12 for men and 10 for women aged 70–74) indicate a falls risk", chip: "Interpret" },
]);

/* ---------------- standing balance ---------------- */

const reach = (u: number) => ramp(u, 0.25, 0.55) * (1 - ramp(u, 0.7, 0.85));
const functionalReach: Scene = {
  ...base,
  title: "Functional Reach Test",
  planted: "toe3-1",
  loopMs: 13000,
  frame: { focus: "spine03", zoom: 3.2, view: [1, 0.1, 0.1], around: ["finger3-3>", "foot", "@nose"] },
  pose: (s, u) => {
    const m = reach(u);
    return P(s, { shoulder: { flex: 90 }, elbow: { flex: 4 }, trunk: { flex: 20 * m }, hip: { flex: 14 * m }, "hip:o": { flex: 14 * m }, ankle: { flex: 5 * m }, "ankle:o": { flex: 5 * m }, "shoulder:o": { flex: 14 }, "elbow:o": { flex: 50 } });
  },
  beats: [
    { to: 0.22, text: "Stand next to a wall, feet shoulder-width apart; one fist-clenched arm raised to 90° and level with the shoulder", chip: "Position" },
    { to: 0.62, text: "Reach forward as far as possible without taking a step or touching the wall; note the movement of the third metacarpal along a ruler", chip: "Reach" },
    { to: 1, text: "Reaches under 15 cm indicate a high risk of falls; over 25 cm is normal; use the best of three trials", chip: "Interpret" },
  ],
  hud: [{ t: "bar", label: "Forward reach", unit: "cm", min: 0, max: 45, goodFrom: 25, goodTo: 45, value: (c) => 31 * reach(c.u), marks: [{ at: 15, label: "15" }, { at: 25, label: "25" }] }],
};

const singleLegStance: Scene = {
  ...base,
  title: "Single-leg stance test",
  planted: "toe3-1",
  loopMs: 13000,
  frame: { focus: "spine03", zoom: 3.4, view: [1, 0.1, 0.4], around: ["foot", "foot:o", "@nose"] },
  pose: (s, u) => {
    const lift = ramp(u, 0.12, 0.2) * (1 - ramp(u, 0.86, 0.92));
    const sway = 1.8 * Math.sin(u * 70) + 0.8 * Math.sin(u * 137);
    return P(s, { "hip:o": { flex: 55 * lift }, "knee:o": { flex: 80 * lift }, trunk: { abd: sway * lift }, shoulder: { abd: 22 * lift }, "shoulder:o": { abd: 22 * lift } });
  },
  beats: [
    { to: 0.12, text: "Stand barefoot with the arms crossed over the chest and eyes open (then repeat with eyes closed)", chip: "Position" },
    { to: 0.86, text: "Lift one foot a few centimetres off the floor without touching the other leg; start the stopwatch when the foot leaves the floor", chip: "Stand on one leg" },
    { to: 1, text: "Stop if the lifted foot touches down, the stance foot moves or the arms uncross. Over 10 s (eyes open) is expected for ages under 60; under 5 s predicts falls", chip: "Interpret" },
  ],
  hud: [{ t: "timer", label: "On one leg", seconds: (c) => clamp01((c.u - 0.18) / 0.68) * 30, target: 10, when: [0.18, 0.9] }],
};

/* ---------------- walking ---------------- */

/** Walking pose for a distance travelled (metres): one stride is 1.4 m. */
const walking = (dist: number, o: Parameters<typeof gaitParts>[1] = {}): Parts => gaitParts(dist / 1.4, o);

const tug: Scene = {
  ...base,
  title: "Timed Up and Go (TUG)",
  planted: "toe3-1",
  plantedWhen: [[0.03, 0.19], [0.89, 0.99]],
  props: [...CHAIR!, { kind: "cones", at: [0, 0, 1.5], size: 0 }, { kind: "walkway", at: [0, 0, 0.9], size: 0.9 }],
  loopMs: 16000,
  frame: { focus: "spine03", zoom: 4.8, view: [1, 0.12, 0.3], around: ["foot"] },
  root: (s, u) => {
    const out = ramp(u, 0.2, 0.5);
    const back = ramp(u, 0.6, 0.86);
    return { dz: 3 * out - 3 * back, ry: 180 * ramp(u, 0.5, 0.6) - 180 * ramp(u, 0.86, 0.9) * 0 };
  },
  pose: (s, u) => {
    const sit = u < 0.03 ? 1 : u < 0.19 ? 1 - ease((u - 0.03) / 0.16) : u < 0.89 ? 0 : ease((u - 0.89) / 0.1);
    const moving = (u > 0.2 && u < 0.5) || (u > 0.6 && u < 0.86);
    const dist = 3 * ramp(u, 0.2, 0.5) + 3 * ramp(u, 0.6, 0.86);
    const turning = u >= 0.5 && u <= 0.6;
    return P(s, { ...sitToStand(sit), ...(moving || turning ? walking(turning ? 3 + (u - 0.5) * 8 : dist, { stride: 0.9 }) : {}), ...(sit > 0.02 ? {} : {}) });
  },
  beats: [
    { to: 0.03, text: "Patient seated with the back against a chair, wearing their usual shoes and walking aid", chip: "Seated" },
    { to: 0.2, text: "On “go”: stand up", chip: "Stand" },
    { to: 0.5, text: "Walk 3 metres at a comfortable and safe pace", chip: "Walk" },
    { to: 0.6, text: "Turn around", chip: "Turn" },
    { to: 0.88, text: "Walk back to the chair", chip: "Return" },
    { to: 1, text: "Sit down: stop the timer when the back touches the chair. Under 10 s is normal for healthy adults; 12 s or more suggests a risk of falls (CDC STEADI), and 14 s or more is a stronger warning in community-dwelling older adults", chip: "Sit" },
  ],
  hud: [
    { t: "timer", label: "Time", seconds: (c) => clamp01((c.u - 0.03) / 0.93) * 10.2, target: 12, when: [0.03, 1] },
    { t: "stat", label: "TUG", value: (c) => (c.u > 0.95 ? "10.2 s" : "…"), sub: "normal ≤ 12 s", tone: "cyan" },
  ],
};

const tenMwt: Scene = {
  ...base,
  title: "10-Metre Walk Test (gait speed)",
  props: [{ kind: "walkway", at: [0, 0, 0], size: 1.1 }],
  loopMs: 12000,
  frame: { focus: "spine03", zoom: 4.8, view: [1, 0.12, 0.25], around: ["foot"] },
  root: (s, u) => ({ dz: -1.6 + 3.2 * ramp(u, 0.06, 0.94) }),
  pose: (s, u) => P(s, walking(3.2 * ramp(u, 0.06, 0.94), { stride: 1 })),
  beats: [
    { to: 0.08, text: "Mark a 10 m walkway with 2 m at each end for getting up to speed and slowing down", chip: "Set up" },
    { to: 0.92, text: "Patient walks at a comfortable (or fast) speed; time only the middle 6 m, with no coaching during the walk", chip: "Walk" },
    { to: 1, text: "Gait speed = distance ÷ time. Under 0.8 m/s is limited community walking; 1.2 m/s or more is typical for healthy adults; 0.1 m/s is clinically meaningful", chip: "Speed" },
  ],
  hud: [
    { t: "timer", label: "Middle 6 m", seconds: (c) => clamp01((c.u - 0.2) / 0.6) * 5, when: [0.2, 1] },
    { t: "stat", label: "Gait speed", value: (c) => (c.u > 0.82 ? "1.2 m/s" : "…"), sub: "6 m ÷ 5.0 s", tone: "green" },
  ],
};

const sixMwt: Scene = {
  ...base,
  title: "Six-Minute Walk Test (6MWT)",
  props: [{ kind: "cones", at: [0, 0, 0], size: 0.95 }, { kind: "walkway", at: [0, 0, 0], size: 0.9 }],
  loopMs: 18000,
  frame: { focus: "spine03", zoom: 4.8, view: [1, 0.12, 0.25], around: ["foot"] },
  root: (s, u) => {
    const t = tri(u * 1.1, 2);
    return { dz: -1.4 + 2.8 * t, ry: ((u * 1.1 * 2) % 1) < 0.5 ? 0 : 180 };
  },
  pose: (s, u) => P(s, walking(11.2 * u, { stride: 0.95 })),
  beats: [
    { to: 0.1, text: "A flat 30 m corridor with cones at both ends; record resting heart rate, SpO₂, blood pressure and breathlessness", chip: "Before" },
    { to: 0.92, text: "Walk back and forth as far as possible in 6 minutes; give standard encouragement each minute and note any rests", chip: "Six minutes" },
    { to: 1, text: "Record the distance, SpO₂, heart rate and breathlessness at the end. Under 350 m is a marker of poor prognosis in heart and lung disease", chip: "After" },
  ],
  hud: [
    { t: "stat", label: "Time", value: (c) => fmt(clamp01(c.u / 0.95) * 360), tone: "cyan" },
    { t: "bar", label: "Distance", unit: "m", min: 0, max: 600, goodFrom: 400, goodTo: 600, value: (c) => 432 * clamp01(c.u / 0.95) },
  ],
};

/* DGI / FGA: the same walk with a task changed in each part. */
const DGI_TASKS = ["Level walking", "Change in speed", "Head turns", "Narrow base"];
const taskIndex = (u: number) => Math.min(3, Math.floor(clamp01((u - 0.04) / 0.92) * 4));
const taskWalk = (title: string, beats: Scene["beats"]): Scene => ({
  ...base,
  title,
  props: [{ kind: "walkway", at: [0, 0, 0], size: 1.1 }],
  loopMs: 18000,
  frame: { focus: "spine03", zoom: 4.8, view: [1, 0.12, 0.25], around: ["foot"] },
  root: (s, u) => ({ dz: -1.6 + 3.2 * ramp(u, 0.04, 0.96) }),
  pose: (s, u) => {
    const t = taskIndex(u);
    const d = 3.2 * ramp(u, 0.04, 0.96);
    const speed = t === 1 ? (Math.sin(u * 30) > 0 ? 1.1 : 0.6) : 1;
    const head = t === 2 ? 38 * Math.sin(u * 60) : 0;
    return P(s, { ...walking(d, { stride: speed, width: t === 3 ? -4 : 0 }), head: { rot: head }, neck: { rot: head * 0.6 } });
  },
  beats,
  hud: [
    { t: "stat", label: "Task", value: (c) => `${taskIndex(c.u) + 1} / 4`, sub: (c) => DGI_TASKS[taskIndex(c.u)], tone: "cyan" },
    { t: "stat", label: "Score", value: (c) => ["3", "2", "2", "3"][taskIndex(c.u)], sub: "example (0–3 scale)", tone: "amber", at: "bl" },
  ],
});
const dgi = taskWalk("Dynamic Gait Index (DGI)", [
  { to: 0.27, text: "Level walking: walk 6 m at a normal pace", chip: "Level" },
  { to: 0.52, text: "Change in speed: walk at normal pace, then fast when told “go”, then slowly when told “slow”", chip: "Speed" },
  { to: 0.77, text: "Head turns: walk while turning the head right and left on command", chip: "Head turns" },
  { to: 1, text: "Narrow base (and other tasks: step over and around obstacles, stairs): each task is scored 0 (severe impairment) to 3 (normal); a total of 19 or less predicts falls", chip: "Narrow base" },
]);
const fga = taskWalk("Functional Gait Assessment (FGA)", [
  { to: 0.27, text: "Gait on level surface and change in gait speed", chip: "Level" },
  { to: 0.52, text: "Gait with horizontal head turns, and with vertical head turns", chip: "Head turns" },
  { to: 0.77, text: "Gait and pivot turn; step over an obstacle; gait with a narrow base of support", chip: "Turn / obstacle" },
  { to: 1, text: "Gait with eyes closed, ambulating backwards and steps: ten items scored 0–3; 22 or less out of 30 suggests a falls risk in older adults", chip: "Eyes closed / steps" },
]);

/* Mini-BESTest: one example from each of the four sections. */
const mini: Scene = {
  ...base,
  title: "Mini-BESTest",
  props: [{ kind: "foam", at: [0.55, 0, 0], size: 1 }],
  loopMs: 18000,
  frame: { focus: "spine03", zoom: 4.2, view: [1, 0.12, 0.3], around: ["foot", "@nose"] },
  root: (s, u) => ({ dx: 0.55 * ramp(u, 0.5, 0.54), dz: u > 0.76 ? -0.4 + 2.0 * ramp(u, 0.76, 0.98) : 0 }),
  pose: (s, u) => {
    const heel = ramp(u, 0.05, 0.12) * (1 - ramp(u, 0.2, 0.25));
    const lean = ramp(u, 0.28, 0.34) * (1 - ramp(u, 0.4, 0.46));
    const step = Math.max(0, Math.sin(Math.PI * ramp(u, 0.36, 0.46)));
    const sway = u > 0.54 && u < 0.76 ? 3 * Math.sin(u * 90) : 0;
    const walk = u > 0.76 ? walking(2.0 * ramp(u, 0.76, 0.98), { stride: 0.9 }) : {};
    const head = u > 0.76 ? 35 * Math.sin(u * 70) : 0;
    return P(s, { ankle: { flex: -30 * heel }, "ankle:o": { flex: -30 * heel }, toe: { flex: 28 * heel }, "toe:o": { flex: 28 * heel }, trunk: { flex: 20 * lean, abd: sway }, "hip:o": { flex: 45 * step }, "knee:o": { flex: 60 * step }, ...walk, head: { rot: head }, shoulder: { abd: 10 }, "shoulder:o": { abd: 10 } });
  },
  beats: [
    { to: 0.26, text: "Anticipatory postural adjustments: rise up onto the toes (and stand on one leg)", chip: "Anticipatory" },
    { to: 0.5, text: "Reactive postural control: lean forward against the examiner’s hands and recover with a step when released", chip: "Reactive" },
    { to: 0.76, text: "Sensory orientation: stand on a foam pad with the eyes closed for 30 s", chip: "Sensory" },
    { to: 1, text: "Dynamic gait: walk with head turns, pivot turns and over obstacles. Fourteen items, each 0–2; 19 or less out of 28 flags a falls risk", chip: "Gait" },
  ],
  hud: [{ t: "stat", label: "Section", value: (c) => ["Anticipatory", "Reactive", "Sensory", "Gait"][c.u < 0.26 ? 0 : c.u < 0.5 ? 1 : c.u < 0.76 ? 2 : 3], tone: "cyan" }],
};

/* Berg: four of the fourteen items. */
const berg: Scene = {
  ...base,
  title: "Berg Balance Scale",
  planted: "toe3-1",
  props: CHAIR,
  loopMs: 18000,
  frame: { focus: "spine03", zoom: 3.4, view: [1, 0.1, 0.25], around: ["foot", "@nose"] },
  pose: (s, u) => {
    const sit = u < 0.04 ? 1 : u < 0.2 ? 1 - ease((u - 0.04) / 0.16) : 0;
    const closed = u > 0.28 && u < 0.46 ? 3 * Math.sin(u * 70) : 0;
    const r = ramp(u, 0.52, 0.62) * (1 - ramp(u, 0.68, 0.74));
    const lift = ramp(u, 0.78, 0.85) * (1 - ramp(u, 0.95, 0.99));
    return P(s, { ...sitToStand(sit), trunk: { flex: 24 * Math.sin(Math.PI * (1 - sit)) * (u < 0.25 ? 1 : 0) + 20 * r, abd: closed + 2 * Math.sin(u * 60) * lift }, shoulder: { flex: 14 + 76 * r }, elbow: { flex: 70 - 66 * r }, "hip:o": { flex: 55 * lift }, "knee:o": { flex: 80 * lift }, "shoulder:o": { flex: 14 } });
  },
  beats: [
    { to: 0.26, text: "Item 1 · Sitting to standing: stand up without using the hands", chip: "Sit to stand" },
    { to: 0.5, text: "Item 3/7 · Standing unsupported, then with the eyes closed (and feet together)", chip: "Stand" },
    { to: 0.76, text: "Item 8 · Reaching forward with the outstretched arm while standing", chip: "Reach" },
    { to: 1, text: "Item 14 · Standing on one leg. Fourteen items scored 0–4: under 45 of 56 predicts falls; 20 or less means a wheelchair is likely", chip: "One leg" },
  ],
  hud: [
    { t: "stat", label: "Berg item", value: (c) => (c.u < 0.26 ? "1" : c.u < 0.5 ? "3 / 7" : c.u < 0.76 ? "8" : "14"), tone: "cyan" },
    { t: "stat", label: "Score", value: "4 / 4", sub: "example: safe", tone: "green", at: "bl" },
  ],
};

/* Four Square Step Test: step over four canes in order. */
const SQ = 0.45;
const FSST_PATH: [number, number][] = [[0, 0], [0, SQ], [-SQ, SQ], [-SQ, 0], [0, 0], [-SQ, 0], [-SQ, SQ], [0, SQ], [0, 0]];
const fsstPos = (u: number) => {
  const t = clamp01((u - 0.06) / 0.88) * (FSST_PATH.length - 1);
  const i = Math.min(FSST_PATH.length - 2, Math.floor(t));
  const k = ease(t - i);
  return { x: FSST_PATH[i][0] + (FSST_PATH[i + 1][0] - FSST_PATH[i][0]) * k, z: FSST_PATH[i][1] + (FSST_PATH[i + 1][1] - FSST_PATH[i][1]) * k, step: Math.min(8, Math.floor(t) + 1) };
};
const fsst: Scene = {
  ...base,
  title: "Four Square Step Test (FSST)",
  props: [{ kind: "walkway", at: [-0.2, 0, 0.2], size: 0.35 }],
  loopMs: 16000,
  frame: { focus: "spine03", zoom: 4.2, view: [0.6, 0.35, 0.8], around: ["foot"] },
  root: (s, u) => { const p = fsstPos(u); return { dx: p.x, dz: p.z }; },
  pose: (s, u) => {
    const t = clamp01((u - 0.06) / 0.88) * (FSST_PATH.length - 1);
    return P(s, walking(t * 0.5, { stride: 0.6, arms: 0.3 }));
  },
  beats: [
    { to: 0.06, text: "Four canes form a cross on the floor, making four squares; the patient stands in square 1 facing square 2", chip: "Set up" },
    { to: 0.5, text: "Step forward, right, back and left, in order, over the canes and into each square", chip: "Clockwise" },
    { to: 0.94, text: "Then reverse: step right, forward, left and back, facing forwards the whole time", chip: "Anticlockwise" },
    { to: 1, text: "Timed as fast as is safe: 15 s or more suggests a risk of multiple falls in older adults; healthy adults usually finish in 10–12 s or less", chip: "Interpret" },
  ],
  hud: [
    { t: "timer", label: "Time", seconds: (c) => clamp01((c.u - 0.06) / 0.88) * 12.4, target: 15, when: [0.05, 1] },
    { t: "stat", label: "Step", value: (c) => `${fsstPos(c.u).step} / 8`, tone: "cyan" },
  ],
};

/* Tinetti POMA: balance items then gait items. */
const tinetti: Scene = {
  ...base,
  title: "Tinetti POMA",
  planted: "toe3-1",
  plantedWhen: [[0.03, 0.17]],
  props: [...CHAIR!, { kind: "walkway", at: [0, 0, 0.9], size: 0.9 }],
  loopMs: 18000,
  frame: { focus: "spine03", zoom: 4.6, view: [1, 0.12, 0.3], around: ["foot"] },
  root: (s, u) => ({ dz: 3 * ramp(u, 0.55, 0.95) }),
  pose: (s, u) => {
    const sit = u < 0.03 ? 1 : u < 0.17 ? 1 - ease((u - 0.03) / 0.14) : 0;
    const nudge = u > 0.3 && u < 0.4 ? 4 * Math.sin(Math.PI * ramp(u, 0.3, 0.4)) : 0;
    const turn = u > 0.4 && u < 0.5 ? 1 : 0;
    const walk = u > 0.55 ? walking(3 * ramp(u, 0.55, 0.95), { stride: 0.9 }) : {};
    return P(s, { ...sitToStand(sit), trunk: { flex: 24 * Math.sin(Math.PI * (1 - sit)) * (u < 0.2 ? 1 : 0) - nudge * 2, abd: 3 * Math.sin(u * 60) * (u > 0.2 && u < 0.3 ? 1 : 0) }, ...(turn ? { "hip:o": { flex: 20 * Math.sin(Math.PI * ramp(u, 0.4, 0.5)) } } : {}), ...walk });
  },
  beats: [
    { to: 0.2, text: "Balance: sitting balance, then rising from a chair without using the arms", chip: "Sit and rise" },
    { to: 0.4, text: "Balance: standing, and the response to a gentle sternal nudge with the feet together", chip: "Nudge" },
    { to: 0.55, text: "Balance: turning through 360° and sitting down; are the steps continuous and steady?", chip: "Turn" },
    { to: 1, text: "Gait: initiation, step length and height, symmetry, path and trunk sway. Under 19 of 28 means a high falls risk; 19–23 moderate", chip: "Gait" },
  ],
  hud: [{ t: "stat", label: "Section", value: (c) => (c.u < 0.55 ? "Balance" : "Gait"), sub: (c) => (c.u < 0.55 ? "max 16" : "max 12"), tone: "cyan" }],
};

/* mCTSIB: firm and foam, eyes open and closed. */
const mctsib: Scene = {
  ...base,
  title: "Modified CTSIB (sensory organisation)",
  props: [{ kind: "foam", at: [0.5, 0, 0], size: 1 }],
  loopMs: 20000,
  frame: { focus: "spine03", zoom: 3.8, view: [0.4, 0.1, 1], around: ["foot", "foot:o", "@nose"] },
  root: (s, u) => ({ dx: 0.5 * ramp(u, 0.49, 0.52) }),
  pose: (s, u) => {
    const cond = u < 0.25 ? 0 : u < 0.5 ? 1 : u < 0.75 ? 2 : 3;
    const k = [0.8, 1.6, 2.2, 6][cond];
    const sway = k * Math.sin(u * 90) + 0.5 * k * Math.sin(u * 221);
    return P(s, { hip: { abd: -3 }, "hip:o": { abd: -3 }, trunk: { abd: sway, flex: 0.5 * k * Math.sin(u * 53 + 1) }, shoulder: { abd: 8 }, "shoulder:o": { abd: 8 } });
  },
  beats: [
    { to: 0.25, text: "1 · Firm surface, eyes open: all three senses are available", chip: "Firm, open" },
    { to: 0.5, text: "2 · Firm surface, eyes closed: vision removed, so touch and the vestibular system carry balance", chip: "Firm, closed" },
    { to: 0.75, text: "3 · Foam pad, eyes open: the feet’s feedback is unreliable, so vision and the vestibular system are needed", chip: "Foam, open" },
    { to: 1, text: "4 · Foam pad, eyes closed: only the vestibular system is left. Falling in 30 s points to a vestibular problem", chip: "Foam, closed" },
  ],
  overlays: [{ t: "beacon", at: "@nose", label: (c) => (c.u > 0.25 && c.u < 0.5) || c.u > 0.75 ? "Eyes closed" : "Eyes open", tone: "amber", when: [0, 1] }],
  hud: [{ t: "bar", label: "Sway", unit: "cm", min: 0, max: 14, goodFrom: 0, goodTo: 4, value: (c) => [1, 2, 2.8, 8][c.u < 0.25 ? 0 : c.u < 0.5 ? 1 : c.u < 0.75 ? 2 : 3] * (0.55 + 0.45 * Math.abs(Math.sin(c.u * 90))) }],
};
void ({} as Ctx);
void ({} as SceneOption);

export const balanceScenes: Record<string, Scene> = {
  "balance-function/berg": berg,
  "balance-function/tug": tug,
  "balance-function/five-sts": fiveSts,
  "balance-function/thirty-cst": thirtyCst,
  "balance-function/functional-reach": functionalReach,
  "balance-function/single-leg-stance": singleLegStance,
  "balance-function/romberg": { ...rombergScene, hidePlinth: true },
  "balance-function/ten-mwt": tenMwt,
  "balance-function/six-mwt": sixMwt,
  "balance-function/dgi": dgi,
  "balance-function/fga": fga,
  "balance-function/mini-bestest": mini,
  "balance-function/fsst": fsst,
  "balance-function/tinetti": tinetti,
  "balance-function/mctsib": mctsib,
  // Concept demonstrations reuse an atlas item.
  "balance-function/concept:three-systems": mctsib,
  "balance-function/concept:why-falls": berg,
  "balance-function/concept:four-stage": berg,
  "balance-function/concept:standardise": tug,
  "balance-function/concept:choose": tug,
  "balance-function/concept:systems": mctsib,
};

/** The Activities-specific Balance Confidence scale is a questionnaire: it stays a 2D description. */
export const BALANCE_2D_ONLY = ["balance-function/abc"];
