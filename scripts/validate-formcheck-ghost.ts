import assert from "node:assert/strict";
import { cycles, play, seatedSide } from "./formcheck-synthetic.ts";
import { CAMERA_SPECS, FormCheckSession, LM, computeGhost, specFor, nearSide, readMetric, type Baseline, type Frame, type Landmark, type LandmarkName, type Metric } from "../src/lib/formcheck/index.ts";

/**
 * The ghost coach, for all 27 exercises. The property that matters: the ghost pose is where the moving part of the body has to be for the exercise's OWN measurement (the
 * one the repetition counter reads) to equal its target. So when the person's body reaches the ghost, the counter reaches the target; it cannot show a pose the counter would
 * not accept. Tested on a full figure seen from the side and from the front, with the real specs.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert(condition, message); };
const W = 720, H = 1280;

type P = [number, number];
function figure(view: "side" | "front"): Frame {
  const lm: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 0 }));
  const put = (name: LandmarkName, p: P, v = 0.95) => { lm[LM[name]] = { x: p[0], y: p[1], v }; };
  if (view === "side") {
    // seen from the right of the person, facing right of the picture: the left side is nearest the camera
    const far = 0.6; // the far side is seen less well, but well enough to be read (the exercises that work the far limb need it)
    put("nose", [0.56, 0.10]); put("leftEyeInner", [0.54, 0.09]); put("leftEye", [0.545, 0.09]); put("leftEyeOuter", [0.55, 0.09]); put("rightEyeInner", [0.535, 0.09], far); put("rightEye", [0.53, 0.09], far); put("rightEyeOuter", [0.525, 0.09], far);
    put("mouthLeft", [0.55, 0.125]); put("mouthRight", [0.545, 0.125], far); put("leftEar", [0.50, 0.105]); put("rightEar", [0.495, 0.105], far);
    put("leftShoulder", [0.50, 0.22]); put("rightShoulder", [0.495, 0.22], far); put("leftElbow", [0.50, 0.36]); put("rightElbow", [0.495, 0.36], far);
    put("leftWrist", [0.53, 0.47]); put("rightWrist", [0.525, 0.47], far); put("leftPinky", [0.54, 0.50]); put("leftIndex", [0.545, 0.50]); put("leftThumb", [0.545, 0.49]);
    put("rightPinky", [0.535, 0.50], far); put("rightIndex", [0.54, 0.50], far); put("rightThumb", [0.54, 0.49], far);
    // seated-style lower body: the hip and knee are bent about 100 and 90 degrees, so every joint exercise has room to move both ways
    put("leftHip", [0.50, 0.50]); put("rightHip", [0.495, 0.50], far); put("leftKnee", [0.68, 0.52]); put("rightKnee", [0.675, 0.52], far);
    put("leftAnkle", [0.66, 0.74]); put("rightAnkle", [0.655, 0.74], far); put("leftHeel", [0.64, 0.76]); put("rightHeel", [0.635, 0.76], far); put("leftFootIndex", [0.72, 0.77]); put("rightFootIndex", [0.715, 0.77], far);
  } else {
    put("nose", [0.50, 0.10]); put("leftEyeInner", [0.49, 0.09]); put("leftEye", [0.48, 0.09]); put("leftEyeOuter", [0.47, 0.09]); put("rightEyeInner", [0.51, 0.09]); put("rightEye", [0.52, 0.09]); put("rightEyeOuter", [0.53, 0.09]);
    put("mouthLeft", [0.48, 0.125]); put("mouthRight", [0.52, 0.125]); put("leftEar", [0.45, 0.105]); put("rightEar", [0.55, 0.105]);
    put("leftShoulder", [0.38, 0.22]); put("rightShoulder", [0.62, 0.22]); put("leftElbow", [0.32, 0.36]); put("rightElbow", [0.68, 0.36]);
    put("leftWrist", [0.30, 0.48]); put("rightWrist", [0.70, 0.48]); put("leftPinky", [0.29, 0.50]); put("leftIndex", [0.31, 0.50]); put("leftThumb", [0.32, 0.49]); put("rightPinky", [0.71, 0.50]); put("rightIndex", [0.69, 0.50]); put("rightThumb", [0.68, 0.49]);
    put("leftHip", [0.43, 0.50]); put("rightHip", [0.57, 0.50]); put("leftKnee", [0.42, 0.70]); put("rightKnee", [0.58, 0.70]); put("leftAnkle", [0.42, 0.90]); put("rightAnkle", [0.58, 0.90]);
    put("leftHeel", [0.41, 0.925]); put("rightHeel", [0.59, 0.925]); put("leftFootIndex", [0.40, 0.935]); put("rightFootIndex", [0.60, 0.935]);
  }
  return { t: 0, w: W, h: H, lm, luma: 130 };
}

const baselineOf = (spec: (typeof CAMERA_SPECS)[number], frame: Frame): Baseline => {
  const base: Baseline = {};
  const side = nearSide(frame);
  for (const m of spec.metrics) {
    if (m.kind === "head") continue;
    if (m.kind === "rotation") { const a = frame.lm[LM.leftShoulder]; const b = frame.lm[LM.rightShoulder]; base[m.id] = Math.hypot((a.x - b.x) * frame.w, (a.y - b.y) * frame.h); continue; }
    const r = readMetric(m, frame, { minVisibility: 0, side, tested: "left" });
    if (r) base[m.id] = r.value;
  }
  return base;
};

/** Which body part must move for each exercise (anything that moves must belong to the set, and the marker must be on it). The measurement alone cannot tell: either end of a joint reaches the same angle. */
const HEAD: LandmarkName[] = ["nose", "leftEyeInner", "leftEye", "leftEyeOuter", "rightEyeInner", "rightEye", "rightEyeOuter", "leftEar", "rightEar", "mouthLeft", "mouthRight"];
const ARMS: LandmarkName[] = ["leftShoulder", "leftElbow", "leftWrist", "leftPinky", "leftIndex", "leftThumb", "rightShoulder", "rightElbow", "rightWrist", "rightPinky", "rightIndex", "rightThumb"];
const SHOULDERS_ARMS = ARMS;
const UPPER = [...HEAD, ...ARMS];
const LEG = (s: "left" | "right"): LandmarkName[] => [`${s}Knee`, `${s}Ankle`, `${s}Heel`, `${s}FootIndex`] as LandmarkName[];
const LEGS = [...LEG("left"), ...LEG("right")];
/** `min`: how many of the set must move together (the whole body part, never one detached landmark) */
const MOVES: Record<string, { set: LandmarkName[]; marker: LandmarkName[]; min: number }> = {
  "chin-tuck": { set: HEAD, marker: HEAD, min: 9 }, "chin-tuck-head-lift": { set: HEAD, marker: HEAD, min: 9 }, "supine-nod": { set: HEAD, marker: HEAD, min: 9 },
  "neck-side-bend": { set: HEAD, marker: HEAD, min: 9 }, "upper-trapezius-stretch": { set: HEAD, marker: HEAD, min: 9 }, "scalene-stretch": { set: HEAD, marker: HEAD, min: 9 },
  "shoulder-blade-squeeze": { set: ARMS, marker: ["leftShoulder", "leftElbow", "leftWrist", "rightShoulder", "rightElbow", "rightWrist"], min: 6 },
  "open-book": { set: UPPER, marker: ARMS, min: 20 }, "quadruped-thoracic-rotation": { set: UPPER, marker: ARMS, min: 20 }, "seated-thoracic-rotation": { set: SHOULDERS_ARMS, marker: ARMS, min: 12 },
  "thoracic-extension-chair": { set: UPPER, marker: UPPER, min: 20 }, "cat-camel": { set: HEAD, marker: HEAD, min: 9 }, "prone-thoracic-extension": { set: UPPER, marker: UPPER, min: 20 },
  "mcgill-curl-up": { set: UPPER, marker: UPPER, min: 20 }, "prone-on-elbows": { set: UPPER, marker: UPPER, min: 20 }, "standing-side-bend": { set: UPPER, marker: UPPER, min: 20 },
  "knee-to-chest": { set: LEG("left"), marker: LEG("left"), min: 4 }, "glute-bridge": { set: LEG("left"), marker: LEG("left"), min: 4 }, "bridge-with-ball": { set: LEG("left"), marker: LEG("left"), min: 4 },
  "single-leg-bridge": { set: LEG("left"), marker: LEG("left"), min: 4 }, "supine-marching": { set: LEG("left"), marker: LEG("left"), min: 4 },
  "dead-bug": { set: LEG("right"), marker: LEG("right"), min: 4 }, "bird-dog": { set: LEG("right"), marker: LEG("right"), min: 4 }, "knee-rock": { set: LEGS, marker: LEGS, min: 8 },
};

let withGhost = 0; const without: string[] = [];
for (const spec of CAMERA_SPECS) {
  const view = spec.placement.view === "side" ? "side" : "front";
  const frame = figure(view);
  const baseline = baselineOf(spec, frame);
  const ghosts = computeGhost(spec, frame, baseline, { tested: "left" });
  const pm = spec.metrics.find((m) => m.id === spec.primary.metric)!;
  const expectNone = pm.kind === "head" || spec.primary.mode === "hold-steady";
  if (expectNone) { ok(ghosts === null, `${spec.id}: no ghost (${pm.kind === "head" ? "a head turn from the face model has no skeleton equivalent" : "a position held steady has no target to move to"})`); without.push(spec.id); continue; }
  ok(ghosts !== null && ghosts.length >= 1, `${spec.id}: has a ghost`);
  if (!ghosts) continue;
  withGhost++;
  const either = !!pm.abs && pm.kind !== "rotation";
  ok(ghosts.length === (either ? 2 : 1), `${spec.id}: ${either ? "an exercise in either direction gets one ghost each way" : "one ghost"} (${ghosts.length})`);
  const side = nearSide(frame);
  for (const g of ghosts) {
    const virtual: Frame = { ...frame, lm: g.lm };
    const m: Metric = either ? ({ ...pm, abs: false } as Metric) : pm;
    const value = readMetric(m, virtual, { minVisibility: 0, side, tested: "left", baseline })!.value;
    const zero = spec.primary.reference === "baseline" && pm.kind !== "rotation" ? baseline[pm.id] ?? 0 : 0;
    const want = g.dir < 0 ? -spec.primary.target : spec.primary.target;
    const tolerance = Math.max(0.04 * Math.abs(spec.primary.target), pm.kind === "offset" ? 0.0004 : 0.3);
    ok(Math.abs(value - zero - want) <= tolerance, `${spec.id}: the ghost pose reads ${(value - zero).toFixed(3)} on the exercise's own measurement, the target is ${want} (within ${tolerance.toFixed(3)})`);
    ok(g.moved.length > 0 && g.moved.includes(g.main), `${spec.id}: some landmarks move and the marker is on one of them (${g.moved.length} moved)`);
    const allowed = MOVES[spec.id];
    ok(!!allowed, `${spec.id}: it is listed which body part moves`);
    if (allowed) {
      const names = (list: number[]) => list.map((i) => (Object.keys(LM) as LandmarkName[]).find((n) => LM[n] === i)!);
      ok(names(g.moved).every((n) => allowed.set.includes(n)), `${spec.id}: only the right body part moves (${names(g.moved).join(", ")})`);
      ok(g.moved.length >= allowed.min, `${spec.id}: the whole body part moves together, not one detached landmark (${g.moved.length} of at least ${allowed.min})`);
      ok(names([g.main]).every((n) => allowed.marker.includes(n)), `${spec.id}: the target marker is on the right body part (${names([g.main])[0]})`);
    }
    const still = g.lm.every((p, i) => g.moved.includes(i) || (p.x === frame.lm[i].x && p.y === frame.lm[i].y));
    ok(still, `${spec.id}: nothing that is not meant to move moves`);
    const far = Math.max(...g.moved.map((i) => Math.hypot((g.lm[i].x - frame.lm[i].x) * W, (g.lm[i].y - frame.lm[i].y) * H)));
    ok(far < 0.7 * Math.hypot(W, H), `${spec.id}: the ghost stays within the picture's scale (${Math.round(far)} px at most)`);
    ok(g.lm.every((p) => p.x > -0.3 && p.x < 1.3 && p.y > -0.3 && p.y < 1.3), `${spec.id}: the ghost stays near the picture`);
  }
  // anchored to the person: the same pose shifted in the picture gives the same ghost, shifted
  const shifted: Frame = { ...frame, lm: frame.lm.map((p) => ({ ...p, x: p.x + 0.08, y: p.y + 0.04 })) };
  const again = computeGhost(spec, shifted, baseline, { tested: "left" });
  ok(again !== null && again.length === ghosts.length && again[0].lm.every((p, i) => Math.abs(p.x - 0.08 - ghosts[0].lm[i].x) < 1e-6 && Math.abs(p.y - 0.04 - ghosts[0].lm[i].y) < 1e-6), `${spec.id}: the ghost follows the person when they shift in the picture`);
  // nothing is built on a landmark the camera cannot see
  const blind: Frame = { ...frame, lm: frame.lm.map((p) => ({ ...p, v: 0.1 })) };
  ok(computeGhost(spec, blind, baseline, { tested: "left" }) === null, `${spec.id}: no ghost when the parts it needs are not seen`);
}
ok(withGhost >= 22, `most exercises have a ghost (${withGhost} of ${CAMERA_SPECS.length}; none for ${without.join(", ")})`);

/* through a whole session: the ghost is where the person ends up when they reach the target */
{
  const T0 = 5000;
  const run = (ghost: boolean) => {
    const session = new FormCheckSession(specFor("chin-tuck")!, { ghost });
    const states: { t: number; state: ReturnType<typeof session.push>; frame: Frame }[] = [];
    // the ear goes back by exactly the target (0.03 of a trunk length), is held, and comes forward again
    const scene = seatedSide((t) => ({ earBack: 0.03 * cycles(t, T0, 1000, 5200, 1000, 1500, 1) }));
    play(scene, 720, 1280, 15, (frame) => states.push({ t: frame.t, state: session.push(frame), frame }));
    return states;
  };
  const withGhost = run(true);
  const rest = withGhost.find((x) => x.state.phase === "active" && x.t > T0 - 1500 && x.t < T0 - 800)!;
  const top = withGhost.find((x) => x.t > T0 + 3000 && x.t < T0 + 3100)!;
  ok(rest.state.ghost !== null && rest.state.ghost.length === 1, "while the person is at rest the session offers the ghost");
  const gap = (x: typeof rest) => { const g = x.state.ghost![0]; const p = x.frame.lm[g.main]; const q = g.lm[g.main]; return Math.hypot((p.x - q.x) * 720, (p.y - q.y) * 1280); };
  ok(gap(rest) > 8, `at rest the target marker is clearly away from the ear (${gap(rest).toFixed(1)} px)`);
  ok(top.state.ghost !== null && gap(top) < 4, `holding at the target the person's ear is on the target marker (${top.state.ghost ? gap(top).toFixed(1) : "-"} px)`);
  ok(top.state.holdTargetMs === 5000, "the session says how long the hold asked for is, so the marker can fill as it is kept");
  ok(run(false).every((x) => x.state.ghost === null), "the ghost is off unless asked for");
  ok(run(true).every((x) => x.state.phase !== "setup" || x.state.ghost === null), "no ghost during the set-up (there is nothing to move to yet)");
}

console.log(`Form Check ghost coach: ${checks} checks passed (${withGhost} exercises: the ghost pose reads the target on the exercise's own measurement).`);
