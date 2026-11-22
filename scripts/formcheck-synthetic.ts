import { LM, type Frame, type Landmark, type LandmarkName } from "../src/lib/formcheck/index.ts";

/**
 * Synthetic people for rehearsing a whole exercise set through the session: a flat (2D) body whose joints move as a function of time, with a little camera noise.
 * This tests the LOGIC of the tool (set-up gate, neutral position, counting, timing, cues, refusals). It says nothing about how well the pose model finds a real body:
 * that is the feasibility trial and the validation study.
 */
export function rng(seed: number) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

export type Pt = [number, number];
export type Scene = (t: number) => { lm: Partial<Record<LandmarkName, Pt>>; far?: LandmarkName[]; head?: Frame["head"]; luma?: number; visible?: boolean };

/** A frame from named points (normalised 0..1). Landmarks not given sit at the middle with zero visibility; `far` landmarks are the hidden side (low visibility). */
export function frameFrom(w: number, h: number, t: number, pts: Partial<Record<LandmarkName, Pt>>, opts: { far?: LandmarkName[]; head?: Frame["head"]; luma?: number; noise?: number; random?: () => number } = {}): Frame {
  const r = opts.random ?? rng(1);
  const noise = opts.noise ?? 0.0015;
  const lm: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 0 }));
  for (const [name, p] of Object.entries(pts) as [LandmarkName, Pt][]) {
    const far = opts.far?.includes(name);
    lm[LM[name]] = { x: p[0] + noise * gauss(r), y: p[1] + noise * gauss(r) * (w / h), v: far ? 0.4 : 0.95 };
  }
  return { t, w, h, lm, luma: opts.luma ?? 130, head: opts.head };
}

/** Smooth 0..1..0 pulse: rise over `up` ms, hold for `hold` ms, fall over `down` ms. */
export const pulse = (u: number, up: number, hold: number, down: number) => (u < up ? 0.5 - 0.5 * Math.cos((Math.PI * u) / up) : u < up + hold ? 1 : u < up + hold + down ? 0.5 + 0.5 * Math.cos((Math.PI * (u - up - hold)) / down) : 0);
/** A repeating pulse: `rest` ms of stillness at the start, then repeated cycles (up, hold, down, gap). */
export const cycles = (t: number, start: number, up: number, hold: number, down: number, gap: number, n: number) => {
  if (t < start) return 0;
  const period = up + hold + down + gap;
  const k = Math.floor((t - start) / period);
  return k >= n ? 0 : pulse((t - start) % period, up, hold, down);
};

const rotate = (p: Pt, c: Pt, deg: number, aspect: number): Pt => {
  const a = (deg * Math.PI) / 180;
  const dx = (p[0] - c[0]) * aspect; const dy = p[1] - c[1];
  return [c[0] + (dx * Math.cos(a) - dy * Math.sin(a)) / aspect, c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};

/** Seated, side on, portrait frame 720 x 1280, facing right; the near side is the left. `earBack`: how far the head is drawn back, in trunk lengths. */
export const seatedSide = (params: (t: number) => { earBack?: number; lean?: number; nodDeg?: number }): Scene => (t) => {
  const { earBack = 0, lean = 0 } = params(t);
  const hip: Pt = [0.45, 0.68]; const shoulderBase: Pt = [0.45 + lean * 0.12, 0.36];
  const trunk = 0.32 * 1280; // pixels
  const ear: Pt = [shoulderBase[0] + (0.12 - earBack) * trunk / 720, 0.22];
  return { lm: {
    nose: [ear[0] + 0.05, ear[1] + 0.01], leftEar: ear, rightEar: [ear[0] - 0.005, ear[1]],
    leftShoulder: shoulderBase, rightShoulder: [shoulderBase[0] - 0.004, shoulderBase[1]], leftElbow: [0.45, 0.52], leftWrist: [0.52, 0.58],
    leftHip: hip, rightHip: [hip[0] - 0.004, hip[1]], leftKnee: [0.62, 0.7], leftAnkle: [0.62, 0.92], rightKnee: [0.62, 0.7], rightAnkle: [0.62, 0.92],
  }, far: ["rightEar", "rightShoulder", "rightHip", "rightKnee", "rightAnkle"] };
};

/** Seated, facing the camera, portrait frame 720 x 1280. `tilt`: head tilt in degrees (ears turn about the neck); `shrug`: one shoulder raised, in degrees of shoulder line;
 *  `turn`: trunk turn in degrees (shoulders and nose); `hipTurn`: hip turn in degrees. */
export const seatedFront = (params: (t: number) => { tilt?: number; shrug?: number; turn?: number; hipTurn?: number; yaw?: number; nod?: number }): Scene => (t) => {
  const { tilt = 0, shrug = 0, turn = 0, hipTurn = 0, yaw = 0, nod = 0 } = params(t);
  const aspect = 720 / 1280;
  const c: Pt = [0.5, 0.38];
  const shoulderHalf = 0.17 * Math.cos((turn * Math.PI) / 180);
  const sh: [Pt, Pt] = [[0.5 - shoulderHalf, 0.38], [0.5 + shoulderHalf, 0.38]];
  const lift = Math.tan((shrug * Math.PI) / 180) * shoulderHalf * 2 * aspect; // raise the left shoulder
  sh[0] = [sh[0][0], sh[0][1] - lift];
  const hipHalf = 0.1 * Math.cos((hipTurn * Math.PI) / 180);
  const earHalf = 0.06;
  const headC: Pt = [0.5, 0.22];
  const ears: [Pt, Pt] = [rotate([0.5 - earHalf, 0.22], c, tilt, aspect), rotate([0.5 + earHalf, 0.22], c, tilt, aspect)];
  const noseX = 0.5 + 0.02 * Math.sin(((yaw + turn) * Math.PI) / 180) * 3;
  return { lm: {
    nose: [noseX, headC[1] + 0.02], leftEar: ears[0], rightEar: ears[1], leftShoulder: sh[0], rightShoulder: sh[1],
    leftHip: [0.5 - hipHalf, 0.68], rightHip: [0.5 + hipHalf, 0.68], leftKnee: [0.4, 0.8], rightKnee: [0.6, 0.8], leftAnkle: [0.4, 0.95], rightAnkle: [0.6, 0.95],
    leftElbow: [0.3, 0.55], rightElbow: [0.7, 0.55], leftWrist: [0.34, 0.66], rightWrist: [0.66, 0.66],
  }, head: { yaw, pitch: nod, roll: tilt, v: 0.9 } };
};

/** Lying on the back, side on, landscape frame 1280 x 720, head on the left; the near side is the left. `lift`: the hip rises (0..1, 1 = the bridge's top). */
export const lyingSide = (params: (t: number) => { lift?: number; kneeIn?: number }): Scene => (t) => {
  const { lift = 0 } = params(t);
  const hip: Pt = [0.52, 0.65 - 0.12 * lift];
  return { lm: {
    nose: [0.22, 0.57], leftEar: [0.2, 0.6], rightEar: [0.2, 0.6], leftShoulder: [0.28, 0.64], rightShoulder: [0.28, 0.64], leftElbow: [0.34, 0.66], leftWrist: [0.4, 0.66],
    leftHip: hip, rightHip: hip, leftKnee: [0.62, 0.48], rightKnee: [0.62, 0.48], leftAnkle: [0.64, 0.65], rightAnkle: [0.64, 0.65],
  }, far: ["rightEar", "rightShoulder", "rightHip", "rightKnee", "rightAnkle"] };
};

/** Seen from the feet end, lying on the back (landscape 1280 x 720): the hip line tilts by `drop` degrees; the knees are `gap` of a hip width apart. */
export const feetEnd = (params: (t: number) => { drop?: number; gap?: number }): Scene => (t) => {
  const { drop = 0, gap = 1 } = params(t);
  const aspect = 1280 / 720;
  const c: Pt = [0.5, 0.55];
  const hips: [Pt, Pt] = [rotate([0.4, 0.55], c, drop, aspect), rotate([0.6, 0.55], c, drop, aspect)];
  const kneeHalf = 0.06 * gap;
  return { lm: {
    leftHip: hips[0], rightHip: hips[1], leftKnee: [0.5 - kneeHalf, 0.4], rightKnee: [0.5 + kneeHalf, 0.4], leftShoulder: [0.4, 0.7], rightShoulder: [0.6, 0.7],
    leftAnkle: [0.47, 0.3], rightAnkle: [0.53, 0.3],
  } };
};

/** A forearm plank, side on, landscape frame 1280 x 720, head on the left. `sag`: the hip drops by this fraction of the shoulder-to-ankle length. */
export const plankSide = (params: (t: number) => { sag?: number }): Scene => (t) => {
  const { sag = 0 } = params(t);
  const shoulder: Pt = [0.25, 0.58]; const ankle: Pt = [0.78, 0.62];
  const len = Math.hypot((ankle[0] - shoulder[0]) * 1280, (ankle[1] - shoulder[1]) * 720) / 720;
  const hip: Pt = [0.5, (shoulder[1] + ankle[1]) / 2 + sag * len];
  return { lm: {
    nose: [0.2, 0.6], leftEar: [0.21, 0.58], rightEar: [0.21, 0.58], leftShoulder: shoulder, rightShoulder: shoulder, leftElbow: [0.25, 0.68], leftWrist: [0.32, 0.68],
    leftHip: hip, rightHip: hip, leftKnee: [0.64, 0.6], rightKnee: [0.64, 0.6], leftAnkle: ankle, rightAnkle: ankle, leftFootIndex: [0.82, 0.65], rightFootIndex: [0.82, 0.65],
  }, far: ["rightEar", "rightShoulder", "rightElbow", "rightHip", "rightKnee", "rightAnkle", "rightFootIndex"] };
};

/** Play a scene through a consumer at 30 frames per second; returns the frames' times. `gaps`: [from, to] ms ranges where the person cannot be found at all. */
export function play(scene: Scene, w: number, h: number, seconds: number, consume: (frame: Frame) => void, opts: { gaps?: [number, number][]; seed?: number; luma?: number; noise?: number } = {}) {
  const random = rng(opts.seed ?? 5);
  for (let t = 0; t <= seconds * 1000; t += 1000 / 30) {
    const s = scene(t);
    if (opts.gaps?.some(([a, b]) => t >= a && t <= b)) { consume({ t, w, h, lm: Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 0 })), luma: 130 }); continue; }
    consume(frameFrom(w, h, t, s.lm, { far: s.far, head: s.head, luma: opts.luma ?? s.luma, random, noise: opts.noise }));
  }
}
