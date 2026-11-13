/**
 * Pure movement maths for RehabVerse exercise demonstrations (no three.js): turns an exercise's
 * poses into a repeating timeline and samples the body pose at any moment.
 */
import type { JointAngles, Pose, Side } from "../virtual-patient/engine.ts";
import { P } from "../virtual-patient/parts.ts";
import type { Bi, Motion, Move } from "./types.ts";

export type Segment = {
  kind: "move" | "hold" | "return" | "rest";
  from: Pose;
  to: Pose;
  ms: number;
  /** Index of the stage in motion.moves (for move/hold); -1 for return/rest. */
  stage: number;
  breath?: "in" | "out" | "hold";
  say?: Bi;
};

/** Later poses replace whole joints of earlier ones. */
const merge = (base: Pose, over: Pose): Pose => ({ ...base, ...over });
const ease = (t: number) => t * t * (3 - 2 * t);

export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const out: Pose = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof Pose>;
  for (const key of keys) {
    const x = (a[key] ?? {}) as JointAngles;
    const y = (b[key] ?? {}) as JointAngles;
    (out as Record<string, JointAngles>)[key] = {
      flex: (x.flex ?? 0) + ((y.flex ?? 0) - (x.flex ?? 0)) * t,
      abd: (x.abd ?? 0) + ((y.abd ?? 0) - (x.abd ?? 0)) * t,
      rot: (x.rot ?? 0) + ((y.rot ?? 0) - (x.rot ?? 0)) * t,
    };
  }
  return out;
}

/** One repetition as a list of segments: start → (move, hold)… → return → rest. */
export function buildCycle(motion: Pick<Motion, "start" | "moves" | "returnMs" | "restMs">, side: Side, moves: Move[] = motion.moves): Segment[] {
  const start = P(side, motion.start);
  const segments: Segment[] = [];
  let current = start;
  moves.forEach((move, stage) => {
    const next = merge(current, P(side, move.to));
    segments.push({ kind: "move", from: current, to: next, ms: Math.max(200, move.ms), stage, breath: move.breath, say: move.say });
    if (move.hold) segments.push({ kind: "hold", from: next, to: next, ms: move.hold, stage, breath: "hold", say: move.say });
    current = next;
  });
  segments.push({ kind: "return", from: current, to: start, ms: Math.max(300, motion.returnMs ?? 1400), stage: -1 });
  segments.push({ kind: "rest", from: start, to: start, ms: Math.max(0, motion.restMs ?? 700), stage: -1 });
  return segments;
}

export const cycleLength = (segments: Segment[]) => segments.reduce((sum, s) => sum + s.ms, 0);

/** The pose, segment and repetition number at time `ms` (looping). */
export function sampleCycle(segments: Segment[], ms: number) {
  const total = cycleLength(segments);
  const rep = Math.floor(ms / total);
  let t = ms - rep * total;
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (t <= segment.ms || index === segments.length - 1) {
      const f = segment.ms ? Math.min(1, Math.max(0, t / segment.ms)) : 1;
      const pose = segment.kind === "move" || segment.kind === "return" ? blendPose(segment.from, segment.to, ease(f)) : segment.to;
      return { pose, segment, index, f, rep };
    }
    t -= segment.ms;
  }
  throw new Error("empty cycle");
}

/** Largest absolute joint angle used by a motion (for validation). */
export function maxAngle(motion: Motion): number {
  let max = 0;
  const scan = (parts: Motion["start"]) => {
    for (const angles of Object.values(parts)) for (const v of Object.values(angles ?? {})) max = Math.max(max, Math.abs(v as number));
  };
  scan(motion.start);
  motion.moves.forEach((m) => scan(m.to));
  motion.mistake?.moves.forEach((m) => scan(m.to));
  return max;
}
