import { FormCheckSession, LM, specFor, type Frame, type LandmarkName } from "../src/lib/formcheck/index.ts";
import { cycles, frameFrom, lyingSide, rng, seatedSide, type Scene } from "./formcheck-synthetic.ts";

/**
 * A pose model that misbehaves, rehearsed on purpose: the synthetic people of formcheck-synthetic.ts with faults added to what the model "sees".
 *   jitter  ordinary landmark noise (a fraction of the picture, normal)
 *   glitch  per frame: a landmark jumps to a wrong place for one or two frames (a hand taken for a foot, a joint lost behind a limb)
 *   swap    per frame: the left and right ears (or hips) trade places for one or two frames
 *   timing  every frame's time is a few milliseconds early or late (a busy phone)
 * It tests the LOGIC of the tool against these faults. How often a real model does this, and by how much, is measured on real people (feasibility trial, validation
 * study); the rates below are deliberately generous so that the tool is shown to cope with more than it should meet.
 */
export type Faults = { jitter: number; glitch: number; swap: number; timing: number };
// Measured on the real pose model (full, MediaPipe 1.2.3) on a real person in a still pose with camera-like sensor noise at 1280 x 720: landmark jitter 0.2 to 0.7 px
// (0.0002 to 0.001 of the picture), no glitch larger than 5 px in 150 frames, one knee-angle frame 4 degrees off. A MOVING person in a dim room is worse, and glitches
// (a limb taken for another, a joint lost behind a limb) happen in moving people; those rates are assumptions, set higher than the still measurement on purpose.
export const CLEAN: Faults = { jitter: 0.0015, glitch: 0, swap: 0, timing: 0 };
export const NORMAL: Faults = { jitter: 0.0015, glitch: 0.005, swap: 0.002, timing: 6 };
export const HARSH: Faults = { jitter: 0.003, glitch: 0.02, swap: 0.008, timing: 10 };

const NAMES = Object.keys(LM) as LandmarkName[];

export function playWithFaults(scene: Scene, w: number, h: number, seconds: number, faults: Faults, seed: number, consume: (frame: Frame) => void) {
  const r = rng(seed);
  const pending = new Map<string, { until: number; to: [number, number] }>();
  let swapUntil = -1; let swapPair: [LandmarkName, LandmarkName] = ["leftEar", "rightEar"];
  for (let t = 0; t <= seconds * 1000; t += 1000 / 30) {
    const s = scene(t);
    const frame = frameFrom(w, h, t, s.lm, { far: s.far, head: s.head, luma: s.luma, random: r, noise: faults.jitter });
    const frameNo = Math.round(t / (1000 / 30));
    // a glitch: one visible landmark jumps for one or two frames
    if (faults.glitch > 0 && r() < faults.glitch) {
      const visible = NAMES.filter((n) => frame.lm[LM[n]].v >= 0.9);
      const name = visible[Math.floor(r() * visible.length)];
      if (name) pending.set(name, { until: frameNo + (r() < 0.5 ? 0 : 1), to: [Math.min(1, Math.max(0, 0.5 + (r() - 0.5) * 0.9)), Math.min(1, Math.max(0, 0.5 + (r() - 0.5) * 0.9))] });
    }
    for (const [name, g] of [...pending]) {
      if (frameNo > g.until) { pending.delete(name); continue; }
      const p = frame.lm[LM[name as LandmarkName]]; p.x = g.to[0]; p.y = g.to[1];
    }
    if (faults.swap > 0 && frameNo > swapUntil && r() < faults.swap) { swapUntil = frameNo + (r() < 0.5 ? 0 : 1); swapPair = r() < 0.5 ? ["leftEar", "rightEar"] : ["leftHip", "rightHip"]; }
    if (frameNo <= swapUntil) { const a = frame.lm[LM[swapPair[0]]]; const b = frame.lm[LM[swapPair[1]]]; const ax = a.x, ay = a.y; a.x = b.x; a.y = b.y; b.x = ax; b.y = ay; }
    // frames arrive a few milliseconds early or late, but never out of order
    const jitterT = faults.timing ? (r() - 0.5) * 2 * faults.timing : 0;
    consume({ ...frame, t: Math.max(frameNo * (1000 / 30) - 20 + 20 + jitterT, 0) });
  }
}

export type Trial = { reps: number; partial: number; calibratedAtMs: number | null; glitches: number };
/**
 * One set of chin tucks (five, each held) or glute bridges (five), with the faults, and what the tool made of it. Like a real person, the simulated one stays still until the
 * tool says it is ready and starts the first repetition a second and a half later: a slow neutral position costs time, it must not cost repetitions.
 */
export function trial(kind: "chin-tuck" | "glute-bridge", faults: Faults, seed: number, guard?: boolean): Trial {
  let startAt = Number.POSITIVE_INFINITY;
  const scene = kind === "chin-tuck"
    ? seatedSide((t) => ({ earBack: 0.05 * cycles(t, startAt, 1000, 5200, 1000, 1500, 5) }))
    : lyingSide((t) => ({ lift: cycles(t, startAt, 1200, 3200, 1200, 2000, 5) }));
  const [w, h, seconds] = kind === "chin-tuck" ? [720, 1280, 75] : [1280, 720, 75];
  const session = new FormCheckSession(specFor(kind)!, guard === undefined ? {} : { guard });
  let calibratedAtMs: number | null = null;
  let last = -1;
  playWithFaults(scene, w, h, seconds, faults, seed, (frame) => {
    if (frame.t <= last) return;
    last = frame.t;
    const state = session.push(frame);
    if (calibratedAtMs === null && state.phase === "active") { calibratedAtMs = frame.t; startAt = frame.t + 1500; }
  });
  const summary = session.finish();
  return { reps: summary.reps, partial: summary.partial, calibratedAtMs, glitches: summary.glitches };
}

export type Score = { exact: number; falseReps: number; missed: number; neverReady: number; trials: number; meanAbsError: number; medianReadyMs: number };
export function score(kind: "chin-tuck" | "glute-bridge", faults: Faults, guard: boolean, trials = 60): Score {
  let exact = 0, falseReps = 0, missed = 0, neverReady = 0, abs = 0;
  const ready: number[] = [];
  for (let seed = 1; seed <= trials; seed++) {
    const t = trial(kind, faults, 1000 + seed * 7, guard);
    if (t.calibratedAtMs === null) neverReady += 1; else ready.push(t.calibratedAtMs);
    if (t.reps === 5) exact += 1;
    if (t.reps > 5) falseReps += 1;
    if (t.reps < 5) missed += 1;
    abs += Math.abs(t.reps - 5);
  }
  ready.sort((a, b) => a - b);
  return { exact, falseReps, missed, neverReady, trials, meanAbsError: abs / trials, medianReadyMs: ready.length ? ready[Math.floor(ready.length / 2)] : -1 };
}
