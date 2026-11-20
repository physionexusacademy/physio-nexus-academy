/**
 * How a lying body rests when an exercise says nothing about a limb.
 *
 * Without this, a limb the exercise does not use keeps the model's standing pose: lying on the back the hands hover 12 cm above the
 * bed ("always in the fundamental position"), lying face down the legs and hands float, and on the side the top leg hangs in the air.
 * Real people let a free limb rest on what is under it, so every lying exercise starts from a resting pose and the exercise's own
 * movements are laid on top of it.
 *
 * A resting joint is replaced only when the exercise does not use it: a joint is "taken over" by the exercise when any of its movements
 * (or the faulty version's) mentions it, or when its start pose sets it clearly away from neutral (more than NEUTRAL degrees, e.g. the
 * arms raised in a dead bug). A small start angle ("arms 4° forward") only means "by the sides" and is replaced by the resting pose.
 *
 * The numbers were solved on the real model (lying, measuring the lowest vertex of each limb against the surface): in the resting pose
 * every limb is within about 3 cm of the bed or mat, with the body itself not held up by an arm.
 */
import type { Parts, PartKey } from "../virtual-patient/parts.ts";
import type { Motion } from "./types.ts";

/** Joint angles at or below this are "neutral" (the author meant "by the sides"), not a real arm movement. */
export const NEUTRAL = 25;

/** Arms lying on the back: slightly behind the body, forearm turned palm down, the back of the hand on the bed. */
const SUPINE_ARM: Parts = {
  shoulder: { flex: -16, abd: 6 },
  elbow: { flex: 14, rot: 50 },
  hand: { flex: 8 },
};
/** Arms face down: along the sides, the hand reaching the mat. */
const PRONE_ARM: Parts = { shoulder: { flex: 3, abd: 26 }, elbow: { flex: 2 }, hand: { flex: 0 } };
/** Legs face down: a little hip flexion and the foot pointing, so the front of the thigh, the shin and the top of the foot lie on the mat. */
const PRONE_LEG: Parts = { hip: { flex: 7 }, ankle: { flex: -75 } };
/** The top leg on the side: lying along the bottom leg (same bend), a little adducted and turned so its knee and shin rest on it. */
const SIDE_TOP_LEG: Parts = { hip: { flex: 30, abd: -5, rot: -20 }, knee: { flex: 45 } };

const both = (parts: Parts): Parts => {
  const out: Parts = {};
  for (const [key, angles] of Object.entries(parts) as [PartKey, NonNullable<Parts[PartKey]>][]) {
    out[key] = { ...angles };
    out[`${key}:o` as PartKey] = { ...angles };
  }
  return out;
};

/** The resting pose of a lying position, named for the tested side ("hip") and the other side ("hip:o"). */
export function restingParts(position: Motion["position"]): Parts {
  if (position === "supine") return both(SUPINE_ARM);
  if (position === "prone") return { ...both(PRONE_ARM), ...both(PRONE_LEG) };
  if (position === "sidelying") return { ...SIDE_TOP_LEG };
  return {};
}

const mentions = (parts: Parts | undefined, key: PartKey) => parts?.[key] !== undefined;
const sets = (parts: Parts | undefined, key: PartKey) => Object.values(parts?.[key] ?? {}).some((v) => Math.abs(v as number) > NEUTRAL);

/**
 * `start` with the resting pose filled in for every joint the exercise does not use. `start` is the start pose actually used (the faulty
 * version's changes already merged in).
 */
export function withResting(motion: Pick<Motion, "position" | "moves" | "mistake">, start: Parts): Parts {
  const rest = restingParts(motion.position);
  const out: Parts = { ...start };
  const moves = [...motion.moves, ...(motion.mistake?.moves ?? [])];
  for (const key of Object.keys(rest) as PartKey[]) {
    const used = moves.some((move) => mentions(move.to, key)) || sets(start, key) || sets(motion.mistake?.start, key);
    if (!used) out[key] = rest[key];
  }
  return out;
}

const LIMB_JOINTS = { arm: ["shoulder", "elbow", "wrist", "hand", "fingers", "thumb"], leg: ["hip", "knee", "ankle", "toe"] } as const;
export type RestLimb = "arm" | "arm:o" | "leg" | "leg:o";

/**
 * The limbs that lie still on what is under them for the whole repetition: the resting pose covers them, and the exercise neither moves nor
 * holds any of their joints. The pose quality gate checks that these really touch the bed or mat (or, for the top leg lying on its side, the
 * leg below it). "arm" / "leg" are on the tested side, "arm:o" / "leg:o" on the other.
 */
export function restingLimbs(motion: Pick<Motion, "position" | "moves" | "mistake">, start: Parts): RestLimb[] {
  const rest = restingParts(motion.position);
  const moves = [...motion.moves, ...(motion.mistake?.moves ?? [])];
  const out: RestLimb[] = [];
  for (const limb of ["arm", "leg"] as const) {
    for (const other of [false, true]) {
      const key = (joint: string) => (other ? `${joint}:o` : joint) as PartKey;
      const joints = LIMB_JOINTS[limb];
      if (!joints.some((joint) => rest[key(joint)] !== undefined)) continue;
      const moved = joints.some((joint) => moves.some((move) => mentions(move.to, key(joint))));
      const held = joints.some((joint) => sets(start, key(joint)) || sets(motion.mistake?.start, key(joint)));
      if (!moved && !held) out.push((other ? `${limb}:o` : limb) as RestLimb);
    }
  }
  return out;
}
