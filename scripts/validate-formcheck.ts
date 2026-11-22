import assert from "node:assert/strict";
import {
  Calibrator, HoldTimer, LM, OneEuroFilter, RepCounter, STOP_IF_PAINFUL, angleAt, assessSetup, facing, lintCue, metricParts, needsBaseline, needsHead, readMetric, segmentAngle,
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
  ok(dropout.reps === 3, `repetitions interrupted by lost tracking are dropped, and one that resumes part way through is not invented (${dropout.reps} of 5: the one that lost tracking and the one that came back at its top)`);
  // tracking comes back while the person is already at the top of the movement: that is not a new repetition, it is the one that was interrupted
  const resumeAtTop = run({ rest: 0, target: 90 }, (t) => (t > 7500 && t < 10500 ? null : t < 12000 ? sine(t, 6000, 0, 90) : 0), 15.4);
  ok(resumeAtTop.reps === 1, `a repetition that resumes after a gap at the top of the movement is not counted twice (${resumeAtTop.reps})`);
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

/* ───── 6. the metric kinds the exercise specs use ───── */
const DEG = 180 / Math.PI;
{
  // near / far: the side the model sees best is "near"; the other is "far"; the choice follows the visibility
  const sideFrame = (leftVis: number, rightVis: number) => {
    const lm = blank();
    for (const [name, x, y] of [["Shoulder", 0.5, 0.3], ["Hip", 0.5, 0.5], ["Knee", 0.5, 0.7], ["Ankle", 0.5, 0.9]] as const) {
      set(lm, `left${name}` as LandmarkName, x, y, leftVis); set(lm, `right${name}` as LandmarkName, x, y, rightVis);
    }
    set(lm, "leftAnkle", 0.7, 0.7, leftVis); // the left knee bends to 90
    return lm;
  };
  const nearKnee: Metric = { id: "k", kind: "joint", a: "near:hip", b: "near:knee", c: "near:ankle" };
  const farKnee: Metric = { id: "k", kind: "joint", a: "far:hip", b: "far:knee", c: "far:ankle" };
  const leftNear = frame(sideFrame(0.95, 0.3), 1000, 1000);
  near(readMetric(nearKnee, leftNear, 0.5)!.value, 90, 1e-6, "near:knee is the left knee when the left side is seen best");
  near(readMetric(farKnee, leftNear, 0.2)!.value, 180, 1e-6, "far:knee is the other knee");
  ok(readMetric(farKnee, leftNear, 0.5) === null, "the far side, seen poorly, gives no reading at the usual minimum visibility");
  const rightNear = frame(sideFrame(0.3, 0.95), 1000, 1000);
  near(readMetric(nearKnee, rightNear, 0.5)!.value, 180, 1e-6, "near:knee follows the side that is seen best (the right one here)");
  // tested / other: the side the person says they exercise, whatever the camera sees
  const testedKnee: Metric = { id: "k", kind: "joint", a: "tested:hip", b: "tested:knee", c: "tested:ankle" };
  const otherKnee: Metric = { id: "k", kind: "joint", a: "other:hip", b: "other:knee", c: "other:ankle" };
  const both = frame(sideFrame(0.95, 0.95), 1000, 1000);
  near(readMetric(testedKnee, both, { minVisibility: 0.5, tested: "left" })!.value, 90, 1e-6, "tested:knee is the left knee when the person exercises the left side");
  near(readMetric(testedKnee, both, { minVisibility: 0.5, tested: "right" })!.value, 180, 1e-6, "tested:knee is the right knee when the person exercises the right side");
  near(readMetric(otherKnee, both, { minVisibility: 0.5, tested: "right" })!.value, 90, 1e-6, "other:knee is the opposite knee");
  ok(readMetric(testedKnee, both, 0.5) === null, "a tested: reference cannot be read until the person says which side they exercise");
  ok(metricParts(testedKnee).includes("tested:knee") && metricParts(nearKnee).includes("near:hip"), "the parts a metric needs include the sided references");
}
{
  // the face model's head pose; absent = no reading
  const lm = blank();
  const yaw: Metric = { id: "y", kind: "head", axis: "yaw" };
  ok(readMetric(yaw, frame(lm)) === null && needsHead(yaw), "a head metric gives no reading without the face model");
  near(readMetric(yaw, frame(lm, 1000, 1000, { head: { yaw: -30, pitch: 5, roll: 2, v: 0.9 } }))!.value, -30, 1e-9, "the head's yaw is read from the face model");
  near(readMetric({ ...yaw, abs: true }, frame(lm, 1000, 1000, { head: { yaw: -30, pitch: 5, roll: 2, v: 0.9 } }))!.value, 30, 1e-9, "abs reports the size of a movement to either side");
  near(readMetric({ id: "p", kind: "head", axis: "pitch" }, frame(lm, 1000, 1000, { head: { yaw: 0, pitch: 12, roll: 0, v: 0.9 } }))!.value, 12, 1e-9, "the head's pitch");
  ok(readMetric(yaw, frame(lm, 1000, 1000, { head: { yaw: 10, pitch: 0, roll: 0, v: 0.2 } }), 0.5) === null, "a face the model is unsure of gives no reading");
}
{
  // diff: the ears tilted on the shoulders = the head tilted on the trunk (the neck side bend); both tilting together = the trunk leaning, not the neck
  const tiltFrame = (shoulderDeg: number, earDeg: number) => {
    const lm = blank();
    const line = (a: LandmarkName, b: LandmarkName, cx: number, cy: number, half: number, deg: number) => {
      const dy = Math.tan((deg / DEG)) * half;
      set(lm, a, cx - half, cy + dy); set(lm, b, cx + half, cy - dy);
    };
    line("leftShoulder", "rightShoulder", 0.5, 0.4, 0.2, shoulderDeg);
    line("leftEar", "rightEar", 0.5, 0.2, 0.08, earDeg);
    return frame(lm, 1000, 1000);
  };
  const headTilt: Metric = { id: "h", kind: "diff", a: { id: "e", kind: "tilt", a: "leftEar", b: "rightEar" }, b: { id: "s", kind: "tilt", a: "leftShoulder", b: "rightShoulder" } };
  near(readMetric(headTilt, tiltFrame(0, 12))!.value, 12, 1e-6, "ears tilted 12 degrees on level shoulders read 12");
  near(readMetric(headTilt, tiltFrame(8, 8))!.value, 0, 1e-6, "ears and shoulders tilting together read 0 (the trunk leaned, the neck did not)");
  near(readMetric({ ...headTilt, abs: true }, tiltFrame(0, -12))!.value, 12, 1e-6, "a side bend to either side reads the same with abs");
}
{
  // dist and offset on the vertical axis, as fractions of a body length
  const lm = blank();
  set(lm, "leftShoulder", 0.3, 0.3); set(lm, "rightShoulder", 0.7, 0.3); set(lm, "leftWrist", 0.1, 0.5); set(lm, "rightWrist", 0.9, 0.5);
  near(readMetric({ id: "d", kind: "dist", a: "leftWrist", b: "rightWrist", scale: ["leftShoulder", "rightShoulder"] }, frame(lm, 1000, 1000))!.value, 2, 1e-9, "wrists twice a shoulder width apart read 2");
  set(lm, "leftElbow", 0.3, 0.2);
  near(readMetric({ id: "o", kind: "offset", a: "leftShoulder", b: "leftElbow", scale: ["leftShoulder", "rightShoulder"], axis: "y" }, frame(lm, 1000, 1000))!.value, 0.25, 1e-9, "an elbow a quarter of a shoulder width above its shoulder reads +0.25");
  set(lm, "leftElbow", 0.3, 0.4);
  ok(readMetric({ id: "o", kind: "offset", a: "leftShoulder", b: "leftElbow", scale: ["leftShoulder", "rightShoulder"], axis: "y" }, frame(lm, 1000, 1000))!.value < 0, "below the shoulder reads negative");
}
{
  // rotation from how much narrower the shoulders look than in the person's own neutral position
  const widthFrame = (halfWidth: number) => { const lm = blank(); set(lm, "leftShoulder", 0.5 - halfWidth, 0.3); set(lm, "rightShoulder", 0.5 + halfWidth, 0.3); return frame(lm, 1000, 1000); };
  const rotation: Metric = { id: "turn", kind: "rotation", a: "leftShoulder", b: "rightShoulder" };
  ok(needsBaseline(rotation) && readMetric(rotation, widthFrame(0.2)) === null, "a rotation cannot be read before the neutral position has been taken");
  const baseline = { turn: 400 };
  near(readMetric(rotation, widthFrame(0.2), { baseline })!.value, 0, 1e-6, "the neutral width reads 0 degrees");
  near(readMetric(rotation, widthFrame(0.2 * Math.cos(Math.PI / 4)), { baseline })!.value, 45, 1e-6, "a width of cos(45) of neutral reads 45 degrees");
  near(readMetric(rotation, widthFrame(0.22), { baseline })!.value, 0, 1e-6, "a wider reading than neutral reads 0, not an error");
}

/* ───── 7. taking the person's own neutral position ───── */
{
  const rr = rng(3);
  const shoulderFrame = (t: number, tiltDeg: number, noise = 0, half = 0.2) => {
    const lm = blank(); const dy = Math.tan(tiltDeg / DEG) * half;
    set(lm, "leftShoulder", 0.5 - half, 0.4 + dy + noise * 0.001 * gauss(rr)); set(lm, "rightShoulder", 0.5 + half, 0.4 - dy);
    return { ...frame(lm, 1000, 1000), t };
  };
  const tiltMetric: Metric = { id: "t", kind: "tilt", a: "leftShoulder", b: "rightShoulder" };
  const turnMetric: Metric = { id: "turn", kind: "rotation", a: "leftShoulder", b: "rightShoulder" };
  // holding still: done after about 0.8 s, and the baseline is the person's own reading
  const calibrator = new Calibrator([tiltMetric, turnMetric]);
  let state = calibrator.push(shoulderFrame(0, 4, 1));
  for (let t = 33; t < 1200 && !state.done; t += 33) state = calibrator.push(shoulderFrame(t, 4, 1));
  ok(state.done && state.baseline !== null, "holding still for under a second takes the neutral position");
  near(state.baseline!.t, readMetric(tiltMetric, shoulderFrame(0, 4))!.value, 0.5, "the baseline is the person's own tilt");
  near(state.baseline!.turn, 400, 4, "the baseline of a rotation is the shoulder width in pixels");
  ok(calibrator.push(shoulderFrame(5000, 30)).done, "once taken, the baseline stays");
  // fidgeting never completes it, and a movement restarts the wait
  const fidget = new Calibrator([tiltMetric]);
  let doneEver = false;
  for (let t = 0; t < 3000; t += 33) doneEver = fidget.push(shoulderFrame(t, (Math.floor(t / 150) % 2) * 15)).done || doneEver;
  ok(!doneEver, "a person who keeps moving never gets a neutral position taken");
  const restart = new Calibrator([tiltMetric]);
  let still = 0; let result = restart.push(shoulderFrame(0, 0));
  for (let t = 33; t < 700; t += 33) result = restart.push(shoulderFrame(t, 0));
  ok(!result.done, "700 ms is not enough");
  result = restart.push(shoulderFrame(733, 20)); still = result.progress;
  ok(!result.done && still === 0, "a movement restarts the wait");
  for (let t = 766; t < 1800 && !result.done; t += 33) result = restart.push(shoulderFrame(t, 20));
  ok(result.done && Math.abs(result.baseline!.t - readMetric(tiltMetric, shoulderFrame(0, 20))!.value) < 0.5, "and the new still position becomes the baseline");
  // a landmark that is lost gives no baseline
  const lost = new Calibrator([tiltMetric]);
  const missing = shoulderFrame(0, 0); missing.lm[LM.leftShoulder] = { x: 0.3, y: 0.4, v: 0.1 };
  ok(!lost.push(missing).done && lost.push({ ...missing, t: 2000 }).progress === 0, "a lost landmark never gives a baseline");
  // a sided reference needs the tested side
  const sided = new Calibrator([{ id: "elbow", kind: "joint", a: "tested:shoulder", b: "tested:elbow", c: "tested:wrist" }], { tested: "right" });
  const armFrame = (t: number) => { const lm = blank(); set(lm, "rightShoulder", 0.5, 0.3); set(lm, "rightElbow", 0.5, 0.5); set(lm, "rightWrist", 0.7, 0.5); return { ...frame(lm, 1000, 1000), t }; };
  let sidedState = sided.push(armFrame(0));
  for (let t = 33; t < 1200 && !sidedState.done; t += 33) sidedState = sided.push(armFrame(t));
  ok(sidedState.done && Math.abs(sidedState.baseline!.elbow - 90) < 1e-6, "a calibrator follows the side the person exercises");
}

/* ───── 8. the other views of the set-up check ───── */
{
  const lm = standing();
  ok(assessSetup(frame(lm, 1280, 720), { need: NEED, view: "feet" }).issues.includes("wrong_view") === false, "a feet-end view is judged like a front view (shoulders wide against the trunk)");
  const leftSeen = standing({ leftShoulder: [0.5, 0.26], leftHip: [0.5, 0.52], leftKnee: [0.5, 0.72], leftAnkle: [0.5, 0.92], rightShoulder: [0.5, 0.26, 0.3], rightHip: [0.5, 0.52, 0.3], rightKnee: [0.5, 0.72, 0.3], rightAnkle: [0.5, 0.92, 0.3] });
  const sidedNeeds = assessSetup(frame(leftSeen, 720, 1280), { need: ["near:shoulder", "near:hip", "near:knee", "near:ankle"], view: "side" });
  ok(sidedNeeds.ok, `near: needs are met by the side the model sees (${sidedNeeds.issues.join(",")})`);
  const farNeeds = assessSetup(frame(leftSeen, 720, 1280), { need: ["far:knee"], view: "side" });
  ok(farNeeds.missing.includes("far:knee"), "a far: need that is hidden is named");
  ok(assessSetup(frame(standing(), 720, 1280), { need: ["tested:knee"], view: "front", tested: "left" }).ok === true, "a tested: need is resolved with the side the person exercises");
  ok(assessSetup(frame(standing(), 720, 1280), { need: ["tested:knee"], view: "front" }).missing.includes("tested:knee"), "a tested: need cannot be judged before the side is known");
}

console.log(`Form Check engine: ${checks} checks passed.`);
