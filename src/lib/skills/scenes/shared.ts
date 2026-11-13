/** Helpers shared by the Skills Lab scene definitions (pure functions, no three.js). */
import type { SceneOption } from "../scene-types.ts";

export const ease = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 before u0, eased 0→1 between u0 and u1, then 1. */
export const ramp = (u: number, u0: number, u1: number) => ease(clamp01((u - u0) / (u1 - u0)));
/** Triangle wave 0→1→0 with `cycles` cycles per loop. */
export const tri = (u: number, cycles = 1) => {
  const x = (u * cycles) % 1;
  return x < 0.5 ? x * 2 : 2 - x * 2;
};
/** A damped bounce after `at`, lasting `len`: 0 before, peaks near the start, settles to 0. */
export const bounce = (u: number, at: number, len: number, rebound = 0.35) => {
  const t = (u - at) / len;
  if (t < 0 || t > 1) return 0;
  return Math.sin(Math.PI * Math.min(1, t * 1.6)) * (t < 0.62 ? 1 : 0) + (t >= 0.62 ? -rebound * Math.sin(((t - 0.62) / 0.38) * Math.PI) : 0);
};

export const SUP = 90;
export const PRO = -90;

export const gradeOption = (id: string, label: string, choices: string[], initial: string): SceneOption => ({ id, label, choices: choices.map((c) => ({ id: c, label: c })), initial });

/* ---------------- walking ---------------- */

/** A smooth bump centred at `c` (0–1, wraps round the cycle), `w` wide. */
export const bump = (p: number, c: number, w: number) => {
  const d = ((((p - c) % 1) + 1.5) % 1) - 0.5;
  return Math.exp(-((d / w) ** 2));
};

export type GaitOptions = {
  /** Degrees of hip abduction on both legs: + wide-based, − feet in a line (tandem). */
  width?: number;
  /** Scales the swing of the legs and arms (1 = normal). */
  stride?: number;
  /** Side-to-side trunk sway, degrees. */
  sway?: number;
  /** Arm swing scale. */
  arms?: number;
};

/** Pose parts for walking. `p` is the gait phase of the tested leg (0–1 per stride); the other leg is half a cycle behind. */
export function gaitParts(p: number, o: GaitOptions = {}) {
  const k = o.stride ?? 1;
  const leg = (q: number) => ({
    hip: 10 + 20 * k * Math.cos(2 * Math.PI * (q - 0.88)),
    knee: 6 + 52 * k * bump(q, 0.72, 0.11) + 10 * bump(q, 0.12, 0.06),
    ankle: 4 * Math.sin(2 * Math.PI * (q - 0.1)) - 10 * bump(q, 0.62, 0.06),
  });
  const A = leg(p);
  const B = leg(p + 0.5);
  const swing = (o.arms ?? 1) * 14 * k;
  const width = o.width ?? 0;
  return {
    hip: { flex: A.hip, abd: width },
    knee: { flex: A.knee },
    ankle: { flex: A.ankle },
    "hip:o": { flex: B.hip, abd: width },
    "knee:o": { flex: B.knee },
    "ankle:o": { flex: B.ankle },
    shoulder: { flex: 10 - swing * Math.sin(2 * Math.PI * p) },
    "shoulder:o": { flex: 10 + swing * Math.sin(2 * Math.PI * p) },
    elbow: { flex: 18 },
    "elbow:o": { flex: 18 },
    trunk: { abd: (o.sway ?? 0) * Math.sin(2 * Math.PI * p) },
  } as const;
}
