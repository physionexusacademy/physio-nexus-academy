import type { Bi, Metric, PointRef } from "./types.ts";
import type { Placement } from "./spec-types.ts";

/** Pieces the 27 camera specs share: where the phone goes for each kind of exercise, the metrics many of them read, and the cue sentences. */

/* ───── where the phone goes ───── */
const place = (view: Placement["view"], orientation: Placement["orientation"], distanceM: [number, number], heightCm: [number, number], subject: Placement["subject"], en: string, ru: string): Placement =>
  ({ view, orientation, distanceM, heightCm, subject, how: { en, ru } });

/** Seated or standing tall, side to the phone: the plane of nodding, flexion and extension. */
export const SIDE_UPRIGHT = place("side", "portrait", [1.0, 1.6], [90, 120], "head-to-hips",
  "Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit with your side to the phone so your head, shoulders and hips are all in view.",
  "Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ki taraf apna side karke baithein, sar, kandhe aur kulhe sab nazar aayein.");
/** Facing the phone: the plane of side bends and turns. */
export const FRONT_UPRIGHT = place("front", "portrait", [1.0, 1.6], [90, 120], "head-to-hips",
  "Stand the phone upright on a shelf or stand about 1.5 metres away, at chest height. Sit facing the phone so your head, shoulders and hips are all in view.",
  "Phone ko seedha shelf ya stand par taqreeban 1.5 meter door, seene ki unchai par rakhein. Phone ke samne baithein, sar, kandhe aur kulhe sab nazar aayein.");
export const FRONT_STANDING = place("front", "portrait", [2.0, 3.0], [90, 110], "full-body",
  "Stand the phone upright on a shelf or stand about 2.5 metres away, at hip height. Stand facing the phone with your whole body in view.",
  "Phone ko seedha shelf ya stand par taqreeban 2.5 meter door, kulhon ki unchai par rakhein. Phone ke samne khare hon, poora jism nazar aaye.");
/** Lying on the back or front, side on: a low phone on the working side. */
export const LYING_SIDE = place("side", "landscape", [1.8, 2.8], [30, 60], "full-body-lying",
  "Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and level with your hips, on the side you are exercising. Your whole body should be in view.",
  "Phone ko lete hue side par, taqreeban 2 meter door, mat se kulhon ki unchai par, jis taraf exercise kar rahe hon us taraf rakhein. Poora jism nazar aaye.");
/** On all fours, side on. */
export const QUADRUPED_SIDE = place("side", "landscape", [1.8, 2.8], [30, 60], "full-body",
  "Lay the phone on its long side on a low stand or the floor, about 2 metres from the mat and at the height of your back. Your whole body should be in view.",
  "Phone ko lete hue side par, taqreeban 2 meter door, apni peeth ki unchai par rakhein. Poora jism nazar aaye.");
/** Lying, from the feet end looking up the body. */
export const FEET_END = place("feet", "landscape", [1.5, 2.5], [30, 50], "full-body-lying",
  "Put the phone on its long side on the floor beyond your feet, about 2 metres away and level with your knees. Your knees, hips and shoulders should be in view.",
  "Phone ko lete hue side par, apne pairon ke aage taqreeban 2 meter door, ghutnon ki unchai par rakhein. Ghutne, kulhe aur kandhe nazar aayein.");
/** On all fours or lying, from the head end looking down the body. */
export const HEAD_END = place("head", "landscape", [1.5, 2.5], [30, 50], "shoulders-to-hands",
  "Put the phone on its long side on the floor beyond your head, about 2 metres away and level with your shoulders. Your shoulders and arms should be in view.",
  "Phone ko lete hue side par, apne sar ke aage taqreeban 2 meter door, kandhon ki unchai par rakhein. Kandhe aur bazu nazar aayein.");
/** On all fours facing the phone, low. */
export const QUADRUPED_FRONT = place("front", "landscape", [1.5, 2.5], [30, 50], "shoulders-to-hands",
  "Put the phone on its long side on the floor about 2 metres in front of you, level with your shoulders. Your head, shoulders and arms should be in view.",
  "Phone ko lete hue side par, apne samne taqreeban 2 meter door, kandhon ki unchai par rakhein. Sar, kandhe aur bazu nazar aayein.");
/** On all fours or lying, from behind the hips (the feet end), seeing the pelvis. */
export const BEHIND = place("feet", "landscape", [1.5, 2.5], [30, 60], "full-body",
  "Put the phone on its long side on the floor about 2 metres behind you, level with your hips. Your hips and shoulders should be in view.",
  "Phone ko lete hue side par, apne peeche taqreeban 2 meter door, kulhon ki unchai par rakhein. Kulhe aur kandhe nazar aayein.");

/* ───── metrics many exercises read ───── */
const mid = (a: PointRef, b: PointRef): PointRef => ({ mid: [a, b] });
export const MID_SHOULDERS = mid("leftShoulder", "rightShoulder");
export const MID_HIPS = mid("leftHip", "rightHip");

export const joint = (id: string, a: PointRef, b: PointRef, c: PointRef): Metric => ({ id, kind: "joint", a, b, c });
export const incline = (id: string, from: PointRef, to: PointRef, ref: "vertical" | "horizontal", extra: { byFacing?: boolean; abs?: boolean } = {}): Metric => ({ id, kind: "incline", from, to, ref, ...extra });
export const tilt = (id: string, a: PointRef, b: PointRef, abs = false): Metric => ({ id, kind: "tilt", a, b, ...(abs ? { abs: true } : {}) });
export const head = (id: string, axis: "yaw" | "pitch" | "roll", abs = false): Metric => ({ id, kind: "head", axis, ...(abs ? { abs: true } : {}) });

/** The shoulder line against the horizontal, either way (a raised shoulder). */
export const shoulderLevel = (): Metric => tilt("shoulder_level", "leftShoulder", "rightShoulder", true);
/** The ear line against the shoulder line = the head tilted on the trunk (front view), either way. */
export const headTilt = (): Metric => ({ id: "head_tilt", kind: "diff", abs: true, a: tilt("ears", "leftEar", "rightEar"), b: tilt("shoulders", "leftShoulder", "rightShoulder") });
/** Trunk lean in a side view: the hip-to-shoulder line against the vertical, positive = leaning the way the person faces. */
export const trunkLean = (): Metric => incline("trunk_lean", "near:hip", "near:shoulder", "vertical", { byFacing: true });
/** The pelvis line against the horizontal seen from the feet end (a dropping or hiking hip), either way. */
export const pelvisLevel = (): Metric => tilt("pelvis_level", "leftHip", "rightHip", true);

/* ───── cue sentences (checked by lintCue for every spec) ───── */
export const CUE = {
  eyesLevel: { en: "Keep your eyes level.", ru: "Nazar barabar rakhein." },
  shouldersLevel: { en: "Keep your shoulders level and relaxed.", ru: "Kandhe barabar aur dheele rakhein." },
  turnHeadOnly: { en: "Turn only your head; keep your shoulders still.", ru: "Sirf sar ghumayein; kandhe wahin rakhein." },
  sitTall: { en: "Sit tall and keep your body still.", ru: "Seedhe baithein aur jism ko saakin rakhein." },
  hipsFacing: { en: "Keep your hips facing the phone.", ru: "Kulhe phone ki taraf seedhe rakhein." },
  enoughRange: { en: "That is enough. Come back slowly.", ru: "Itna kaafi hai. Aahista wapas aayein." },
  hipsLevel: { en: "Keep your hips level.", ru: "Kulhe barabar rakhein." },
  shouldersFlat: { en: "Keep both shoulders resting on the mat.", ru: "Dono kandhe mat par tikay rakhein." },
  bodyLine: { en: "Keep your body in one line.", ru: "Jism ek seedhi line mein rakhein." },
  headInLine: { en: "Keep your head in line with your chest.", ru: "Sar ko seene ki seedh mein rakhein." },
  backLevel: { en: "Keep your back level.", ru: "Peeth ko barabar rakhein." },
  ballBetweenKnees: { en: "Keep the ball between your knees.", ru: "Ball ko ghutnon ke darmiyan rakhein." },
  chestFacing: { en: "Keep your chest facing the phone.", ru: "Seena phone ki taraf rakhein." },
} satisfies Record<string, Bi>;
