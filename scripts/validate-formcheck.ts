import assert from "node:assert/strict";
import {
  HoldTimer, LM, OneEuroFilter, RepCounter, STOP_IF_PAINFUL, angleAt, assessSetup, facing, lintCue, readMetric, segmentAngle,
  type Frame, type Landmark, type LandmarkName, type Metric,
} from "../src/lib/formcheck/index.ts";
import { DEFAULT_LINES } from "../src/lib/rehabverse/lines.ts";

/**
 * Form Check engine: the rules that need no camera and no model. Everything here is deterministic (a seeded random generator), so a failure is a real
 * change in behaviour. This checks the engine's logic (geometry, smoothing, counting, the set-up gate, the wording rules). How closely the camera
 * model's numbers agree with a reference instrument is a different question, answered only by the validation study (docs/camera-form-check).
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert(condition, message); };
const near = (a: number, b: number, tolerance: number, message: string) => { checks++; assert(Math.abs(a - b) <= tolerance, `${message}: ${a} is not within ${tolerance} of ${b}`); };
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

/* ───── 1. geometry ───── */
near(angleAt({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }), 90, 1e-9, "a right angle");
near(angleAt({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }), 180, 1e-9, "a straight line");
near(angleAt({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }), 45, 1e-9, "45 degrees");
ok(Number.isNaN(angleAt({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 })), "a zero-length segment has no angle");
near(segmentAngle({ x: 0, y: 0 }, { x: 0, y: -1 }, "vertical"), 0, 1e-9, "straight up is 0 from the vertical");
near(segmentAngle({ x: 0, y: 0 }, { x: 1, y: 0 }, "vertical"), 90, 1e-9, "pointing right is +90 from the vertical");
near(segmentAngle({ x: 0, y: 0 }, { x: -1, y: 0 }, "vertical"), -90, 1e-9, "pointing left is -90 from the vertical");
near(Math.abs(segmentAngle({ x: 0, y: 0 }, { x: 0, y: 1 }, "vertical")), 180, 1e-9, "pointing down is 180 from the vertical");
near(segmentAngle({ x: 0, y: 0 }, { x: 1, y: 0 }, "horizontal"), 0, 1e-9, "pointing right is 0 from the horizontal");
near(segmentAngle({ x: 0, y: 0 }, { x: 0, y: -1 }, "horizontal"), 90, 1e-9, "pointing up is +90 from the horizontal");

const blank = (): Landmark[] => Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 1 }));
const frame = (lm: Landmark[], w = 1920, h = 1080, extra: Partial<Frame> = {}): Frame => ({ t: 0, w, h, lm, ...extra });
const set = (lm: Landmark[], name: LandmarkName, x: number, y: number, v = 1) => { lm[LM[name]] = { x, y, v }; return lm; };

// A 45 degree line in the pixel image is NOT 45 degrees in the normalised square: the engine must use pixels.
{
  const lm = blank();
  set(lm, "leftShoulder", 0.5, 0.5); set(lm, "rightShoulder", 0.6, 0.6);
  const tilt: Metric = { id: "t", kind: "tilt", a: "leftShoulder", b: "rightShoulder" };
  near(readMetric(tilt, frame(lm, 1920, 1080))!.value, -Math.atan((0.1 * 1080) / (0.1 * 1920)) * (180 / Math.PI), 1e-9, "angles are worked out in pixels (16:9)");
  near(readMetric(tilt, frame(lm, 1000, 1000))!.value, -45, 1e-9, "a square image gives 45");
  near(readMetric(tilt, frame(lm, 720, 1280))!.value, -Math.atan((0.1 * 1280) / (0.1 * 720)) * (180 / Math.PI), 1e-9, "a portrait phone frame (9:16)");
}
// joint angle through a midpoint reference
{
  const lm = blank();
  set(lm, "leftHip", 0.4, 0.5); set(lm, "rightHip", 0.6, 0.5); set(lm, "leftKnee", 0.5, 0.7); set(lm, "rightKnee", 0.5, 0.7);
  set(lm, "leftShoulder", 0.4, 0.2); set(lm, "rightShoulder", 0.6, 0.2);
  const joint: Metric = { id: "j", kind: "joint", a: { mid: ["leftShoulder", "rightShoulder"] }, b: { mid: ["leftHip", "rightHip"] }, c: { mid: ["leftKnee", "rightKnee"] } };
  near(readMetric(joint, frame(lm, 1000, 1000))!.value, 180, 1e-9, "shoulders-hips-knees in line read 180 through midpoints");
}
// facing and the sign of a side-view measurement
{
  const right = blank(); set(right, "nose", 0.55, 0.2); set(right, "leftEar", 0.5, 0.2); set(right, "rightEar", 0.5, 0.2);
  const left = blank(); set(left, "nose", 0.45, 0.2); set(left, "leftEar", 0.5, 0.2); set(left, "rightEar", 0.5, 0.2);
  ok(facing(frame(right)) === 1 && facing(frame(left)) === -1, "facing right and facing left are told apart");
  for (const [lm, dir] of [[right, 1], [left, -1]] as const) {
    set(lm, "leftShoulder", 0.5 + dir * 0.1, 0.4); set(lm, "leftHip", 0.5, 0.6); // shoulders ahead of the hips: a trunk leaning forward by atan(0.1/0.2)
    const lean: Metric = { id: "lean", kind: "incline", from: "leftHip", to: "leftShoulder", ref: "vertical", byFacing: true };
    near(readMetric(lean, frame(lm, 1000, 1000))!.value, Math.atan(0.1 / 0.2) * (180 / Math.PI), 1e-9, "forward lean reads the same, and positive, whichever way the person faces");
    const back = blank(); set(back, "nose", dir === 1 ? 0.55 : 0.45, 0.2); set(back, "leftEar", 0.5, 0.2); set(back, "rightEar", 0.5, 0.2); set(back, "leftShoulder", 0.5 - dir * 0.1, 0.4); set(back, "leftHip", 0.5, 0.6);
    ok(readMetric(lean, frame(back, 1000, 1000))!.value < 0, "leaning backwards reads negative");
  }
}
// visibility: a missing landmark gives no reading, and the confidence is the lowest visibility used
{
  const lm = blank(); set(lm, "leftKnee", 0.5, 0.7, 0.3); set(lm, "leftHip", 0.5, 0.5, 0.9); set(lm, "leftAnkle", 0.5, 0.9, 0.8);
  const knee: Metric = { id: "k", kind: "joint", a: "leftHip", b: "leftKnee", c: "leftAnkle" };
  ok(readMetric(knee, frame(lm)) === null, "a landmark below the minimum visibility gives no reading");
  const confident = readMetric(knee, frame(lm), 0.2);
  near(confident!.confidence, 0.3, 1e-9, "confidence is the lowest visibility used");
  ok(readMetric(knee, frame(lm.slice(0, 20))) === null, "a frame with too few landmarks gives no reading");
}

/* ───── 2. smoothing ───── */
{
  const r = rng(7);
  const filter = new OneEuroFilter(1, 0.02, 1);
  const raw: number[] = []; const smooth: number[] = [];
  for (let i = 0; i < 300; i++) { const v = 90 + gauss(r) * 2; raw.push(v); smooth.push(filter.filter(v, i * 33)); }
  const sd = (a: number[]) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
  ok(sd(smooth.slice(60)) < 0.5 * sd(raw.slice(60)), "a still signal is smoothed to less than half its noise");
  const step = new OneEuroFilter(1, 0.02, 1); let frames = 0; let value = 0;
  for (let i = 0; i < 90; i++) { value = step.filter(i < 5 ? 0 : 60, i * 33); if (i >= 5 && value < 54) frames++; }
  ok(frames <= 25, `a real movement of 60 degrees is followed within about 0.8 s (${frames} frames)`);
}

/* ───── 3. repetition counting ───── */
const sine = (t: number, periodMs: number, rest: number, target: number, depth = 1) => rest + ((target - rest) * depth * (1 - Math.cos((2 * Math.PI * t) / periodMs))) / 2;
function run(cfg: ConstructorParameters<typeof RepCounter>[0], signal: (t: number) => number | null, seconds: number, hz = 30) {
  const counter = new RepCounter(cfg);
  let state = counter.state();
  for (let t = 0; t <= seconds * 1000; t += 1000 / hz) state = counter.push(signal(t), t);
  return state;
}
{
  const r = rng(11);
  const noisy = (t: number) => sine(t, 3000, 0, 90) + gauss(r) * 3;
  const state = run({ rest: 0, target: 90 }, noisy, 30.4); // ten periods
  ok(state.reps === 10 && state.partial === 0, `ten noisy repetitions are counted as ten (${state.reps}, partial ${state.partial})`);
  const half = run({ rest: 0, target: 90 }, (t) => sine(t, 3000, 0, 90, 0.5) + gauss(r) * 3, 30.4);
  ok(half.reps === 0 && half.partial >= 8, `half-range movements are partial, never repetitions (${half.reps} reps, ${half.partial} partial)`);
  const down = run({ rest: 90, target: 0 }, (t) => sine(t, 3000, 90, 0) + gauss(r) * 3, 15.4);
  ok(down.reps === 5, `a movement that goes from a high value to a low one counts the same (${down.reps})`);
  const flicker = run({ rest: 0, target: 90 }, (t) => (Math.floor(t / 100) % 2 === 0 ? 0 : 90), 5);
  ok(flicker.reps === 0, "a 5 Hz flicker between rest and target is noise, not repetitions");
  const hover = run({ rest: 0, target: 90 }, (t) => 60 + 6 * Math.sin(t / 40), 20); // jitters around the enter threshold (63) without leaving the middle
  ok(hover.reps <= 1, `jitter around the threshold does not count repeatedly (${hover.reps})`);
  const dropout = run({ rest: 0, target: 90 }, (t) => (t > 7000 && t < 10500 ? null : sine(t, 3000, 0, 90)), 15.4);
  ok(dropout.reps === 4, `a repetition interrupted by lost tracking is dropped, not invented (${dropout.reps} of 5)`);
  const gapRest = run({ rest: 0, target: 90 }, (t) => (t > 3200 && t < 5800 ? null : sine(t, 3000, 0, 90)), 9.4);
  ok(gapRest.reps >= 2, `a gap while at rest costs nothing (${gapRest.reps})`);
}
// holds
{
  const plateau = (hold: number) => (t: number) => { const cycle = 6000; const u = t % cycle; if (u < 1500) return (90 * u) / 1500; if (u < 1500 + hold) return 90; if (u < 3000 + hold) return 90 * (1 - (u - 1500 - hold) / 1500); return 0; };
  const long = run({ rest: 0, target: 90, holdMs: 3000 }, plateau(3200), 12.1);
  ok(long.reps === 2 && long.records.every((x) => !x.shortHold && x.holdMs >= 3000), `a 3.2 s hold satisfies a 3 s hold (${JSON.stringify(long.records.map((x) => Math.round(x.holdMs)))})`);
  const short = run({ rest: 0, target: 90, holdMs: 3000 }, plateau(1000), 12.1);
  ok(short.reps === 2 && short.records.every((x) => x.shortHold), "a 1 s hold is counted but flagged as a short hold");
}
{
  const timer = new HoldTimer(800);
  let t = 0; let ms = 0;
  for (; t < 5000; t += 33) ms = timer.push(true, t);
  ok(ms >= 4900 && ms <= 5000, `a timer counts a held position (${Math.round(ms)} ms)`);
  for (const end = t + 400; t < end; t += 33) ms = timer.push(false, t);
  for (const end = t + 2000; t < end; t += 33) ms = timer.push(true, t);
  ok(ms >= 7000, `a blip of 0.4 s does not restart the timer (${Math.round(ms)} ms)`);
  for (const end = t + 1500; t < end; t += 33) ms = timer.push(null, t);
  ok(ms === 0, "a break longer than the grace time restarts the timer");
}
ok((() => { try { new RepCounter({ rest: 5, target: 5 }); return false; } catch { return true; } })(), "rest and target must differ");

/* ───── 4. the set-up check ───── */
const standing = (over: Partial<Record<LandmarkName, [number, number, number?]>> = {}): Landmark[] => {
  const lm = blank();
  const base: Partial<Record<LandmarkName, [number, number]>> = {
    // proportions of a real front view on a 720 x 1280 frame: shoulder width about 0.75 of the trunk length
    nose: [0.5, 0.12], leftEar: [0.53, 0.12], rightEar: [0.47, 0.12], leftShoulder: [0.67, 0.26], rightShoulder: [0.33, 0.26],
    leftHip: [0.6, 0.52], rightHip: [0.4, 0.52], leftKnee: [0.6, 0.72], rightKnee: [0.4, 0.72], leftAnkle: [0.6, 0.92], rightAnkle: [0.4, 0.92],
  };
  for (const [name, [x, y]] of Object.entries(base) as [LandmarkName, [number, number]][]) set(lm, name, x, y);
  for (const [name, [x, y, v]] of Object.entries(over) as [LandmarkName, [number, number, number?]][]) set(lm, name, x, y, v ?? 1);
  return lm;
};
const NEED: LandmarkName[] = ["nose", "leftShoulder", "rightShoulder", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
{
  const good = assessSetup(frame(standing(), 720, 1280, { luma: 130 }), { need: NEED, view: "front" });
  ok(good.ok && good.issues.length === 0, `a person standing fully in frame passes (${good.issues.join(",")})`);
  const hidden = assessSetup(frame(standing({ leftAnkle: [0.55, 0.92, 0.1] }), 720, 1280), { need: NEED, view: "front" });
  ok(!hidden.ok && hidden.issues.includes("body_not_visible") && hidden.missing.includes("leftAnkle"), "a hidden ankle is named");
  const tiny = standing(); for (const p of tiny) { p.x = 0.5 + (p.x - 0.5) * 0.4; p.y = 0.3 + (p.y - 0.12) * 0.4; }
  ok(assessSetup(frame(tiny, 720, 1280), { need: NEED, view: "front" }).issues.includes("too_far"), "a person too far away is told to come closer");
  const huge = standing({ nose: [0.5, 0.003], leftAnkle: [0.55, 0.995], rightAnkle: [0.45, 0.995] });
  ok(assessSetup(frame(huge, 720, 1280), { need: NEED, view: "front" }).issues.includes("too_close"), "a body cut off at the edge is told to step back");
  const off = standing(); for (const p of off) p.x += 0.3;
  ok(assessSetup(frame(off, 720, 1280), { need: NEED, view: "front" }).issues.includes("off_centre"), "a person at the edge of the frame is told to move to the middle");
  ok(assessSetup(frame(standing(), 720, 1280, { luma: 30 }), { need: NEED, view: "front" }).issues.includes("too_dark"), "a dark room is reported");
  ok(assessSetup(frame(standing(), 720, 1280, { luma: 240 }), { need: NEED, view: "front" }).issues.includes("too_bright"), "a washed-out image is reported");
  ok(assessSetup(frame(standing(), 720, 1280), { need: NEED, view: "side" }).issues.includes("wrong_view"), "a front-on person is told to turn when a side view is needed");
  const side = standing({ leftShoulder: [0.51, 0.26], rightShoulder: [0.49, 0.26], leftHip: [0.51, 0.52], rightHip: [0.49, 0.52] });
  ok(assessSetup(frame(side, 720, 1280), { need: NEED, view: "front" }).issues.includes("wrong_view"), "a side-on person is told to turn when a front view is needed");
  ok(assessSetup(frame(side, 720, 1280), { need: NEED, view: "side" }).ok, "a side-on person passes a side view");
  ok(assessSetup({ t: 0, w: 720, h: 1280, lm: [] }, { need: NEED, view: "front" }).issues[0] === "no_person", "an empty frame says nobody is there");
}

/* ───── 5. the wording rules ───── */
for (const line of ["Move slowly and with control.", "Hold it steady.", "Breathe out as you come back.", "Aahista wapis aayein.", "Rep 4 of 10", STOP_IF_PAINFUL.en, STOP_IF_PAINFUL.ru]) ok(lintCue(line).length === 0, `"${line}" is acceptable`);
for (const [line, word] of [["Push deeper into the stretch", "push"], ["Go a bit more", "a bit more"], ["Try to go lower", "lower"], ["Keep going through the pain", "through the pain"], ["Aur neeche jayein", "aur neeche"], ["Zor lagayein", "zor lagayein"], ["Your posture is bad posture", "bad posture"], ["Weak back muscles", "weak back"], ["Dard ke bawajood jari rakhein", "dard ke bawajood"]] as const) {
  ok(lintCue(line).some((p) => p.toLowerCase().includes(word)), `"${line}" is rejected for "${word}"`);
}
ok(lintCue("x".repeat(80)).some((p) => p.includes("longer")), "a cue that is too long to be said in one breath is rejected");
ok(lintCue("").includes("empty"), "an empty cue is rejected");
// the lines the exercise player already says must satisfy the same rules
for (const [kind, line] of Object.entries(DEFAULT_LINES)) for (const lang of ["en", "ru"] as const) ok(lintCue(line[lang]).length === 0, `exercise player line ${kind}/${lang} breaks the wording rules: ${lintCue(line[lang]).join("; ")}`);

console.log(`Form Check engine: ${checks} checks passed.`);
