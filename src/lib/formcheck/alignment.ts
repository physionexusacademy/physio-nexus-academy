import { assessSetup, type SetupIssue, type SetupOptions } from "./quality.ts";
import { LM, type Frame, type LandmarkName } from "./types.ts";
import { nearSide, resolveRef } from "./geometry.ts";

/**
 * The alignment screen: the same judgement as the set-up check (`assessSetup` stays the one authority on whether a set may start), shown in six parts with how close each
 * one is to ideal, and one score. Everything here is display: it never lets a set start that `assessSetup` would refuse, and the checks agree with it by construction
 * (a check is "ok" exactly when none of its issues was raised).
 */
export type AlignmentId = "view" | "distance" | "centre" | "light" | "angle" | "steady";
export type AlignmentCheck = { id: AlignmentId; ok: boolean; /** how close to ideal, 0..1 */ level: number };
export type Alignment = {
  /** 0..100. 90 or more only when every check is ok. */
  score: number;
  checks: AlignmentCheck[];
  /** the box around the landmarks the exercise needs, in 0..1 of the picture, or null when none can be seen */
  box: { x0: number; y0: number; x1: number; y1: number } | null;
  /** the first thing to fix, or null */
  issue: SetupIssue | null;
};

const WEIGHTS: Record<AlignmentId, number> = { view: 0.24, distance: 0.2, centre: 0.14, light: 0.1, angle: 0.2, steady: 0.12 };
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
/** 1 inside [lo, hi], falling to 0 at `lo - spread` and `hi + spread` */
const band = (v: number, lo: number, hi: number, spread: number) => (v < lo ? clamp01(1 - (lo - v) / spread) : v > hi ? clamp01(1 - (v - hi) / spread) : 1);

export function assessAlignment(frame: Frame, opts: SetupOptions, steady = 0): Alignment {
  const setup = assessSetup(frame, opts);
  const has = (...issues: SetupIssue[]) => issues.some((i) => setup.issues.includes(i));
  const minVis = opts.minVisibility ?? 0.5;
  const [minSize, maxSize] = opts.size ?? [0.4, 0.97];
  const near = nearSide(frame);
  const points = opts.need
    .map((need) => { const name: LandmarkName | null = resolveRef(need, { near, tested: opts.tested }); return name ? frame.lm[LM[name]] : undefined; })
    .filter((p): p is NonNullable<typeof p> => !!p && p.v >= minVis);

  const seen = frame.lm.length >= 33 && frame.lm.some((p) => p && p.v >= 0.2);
  const viewLevel = !seen ? 0 : opts.need.length ? points.length / opts.need.length : 1;
  let box: Alignment["box"] = null;
  let distanceLevel = 0;
  let centreLevel = 0;
  if (points.length >= 2) {
    const xs = points.map((p) => p.x); const ys = points.map((p) => p.y);
    box = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    const span = Math.max(box.y1 - box.y0, box.x1 - box.x0);
    // the ideal band sits inside the permitted one, so the gauge is full only when there is room on both sides
    distanceLevel = band(span, minSize * 1.15, maxSize * 0.92, minSize * 0.6);
    centreLevel = clamp01(1 - Math.abs((box.x0 + box.x1) / 2 - 0.5) / 0.25);
  }
  const lightLevel = frame.luma === undefined ? 1 : band(frame.luma, 90, 180, 55);

  let angleLevel = 0.5;
  const shoulders = [frame.lm[LM.leftShoulder], frame.lm[LM.rightShoulder], frame.lm[LM.leftHip], frame.lm[LM.rightHip]];
  if (shoulders.every((p) => p && p.v >= minVis)) {
    const [ls, rs, lh, rh] = shoulders.map((p) => ({ x: p.x * frame.w, y: p.y * frame.h }));
    const shoulderWidth = Math.hypot(ls.x - rs.x, ls.y - rs.y);
    const trunk = Math.hypot((ls.x + rs.x) / 2 - (lh.x + rh.x) / 2, (ls.y + rs.y) / 2 - (lh.y + rh.y) / 2);
    if (trunk > 0) {
      const ratio = shoulderWidth / trunk;
      angleLevel = opts.view === "side" ? clamp01(1 - ratio / 0.9 + 0.1) : clamp01(ratio / 0.8);
    }
  } else if (!has("wrong_view")) angleLevel = viewLevel > 0 ? 0.7 : 0;

  const checks: AlignmentCheck[] = [
    { id: "view", ok: !has("no_person", "body_not_visible"), level: viewLevel },
    { id: "distance", ok: !has("too_far", "too_close", "no_person"), level: distanceLevel },
    { id: "centre", ok: !has("off_centre", "no_person"), level: centreLevel },
    { id: "light", ok: !has("too_dark", "too_bright"), level: lightLevel },
    { id: "angle", ok: !has("wrong_view", "no_person"), level: has("wrong_view") ? Math.min(angleLevel, 0.6) : angleLevel },
    { id: "steady", ok: steady >= 1, level: clamp01(steady) },
  ];
  let score = 100 * checks.reduce((sum, c) => sum + WEIGHTS[c.id] * (c.ok ? Math.max(c.level, 0.85) : Math.min(c.level, 0.84)), 0);
  if (checks.some((c) => !c.ok)) score = Math.min(score, 89);
  if (!seen) score = Math.min(score, 8);
  return { score: Math.round(clamp01(score / 100) * 100), checks, box, issue: setup.issues[0] ?? null };
}
