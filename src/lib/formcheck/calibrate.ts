import { GLITCH_FLOOR, HampelGuard } from "./guard.ts";
import { dist, nearSide, readMetric, resolveRef, type Side, type Sides } from "./geometry.ts";
import { LM, type Baseline, type Frame, type Metric, type PointRef } from "./types.ts";

/**
 * Taking the person's own neutral position as the zero. Small movements (a chin tuck, a head lift) cannot be judged against a fixed number because bodies
 * and camera angles differ; they are judged against where this person started. `Calibrator` watches the metrics while the person stays still and
 * hands back the baseline once the readings have stopped moving.
 */
export type CalibratorOptions = {
  /** how long the readings must stay put, in ms (default 800) */
  stillMs?: number;
  /** the most the metrics may drift while "still" (degrees for angles; a fraction for ratios and widths) */
  angleTolerance?: number;
  ratioTolerance?: number;
  minVisibility?: number;
  /** the side the person is exercising, for "tested:" and "other:" references */
  tested?: Side;
  /**
   * The ids of the metrics that must be readable and still for the neutral position to be taken (those that count repetitions or fire cues). The others are
   * followed on a best-effort basis: a short segment such as ear-to-nose jitters too much to demand stillness of it, and an unreadable one must not block the set.
   */
  strict?: string[];
  /** ignore one-frame glitches of the pose model while waiting for stillness (default true) */
  guard?: boolean;
};
export type CalibrationState = { done: boolean; progress: number; baseline: Baseline | null; side: Side | null };

/**
 * Is a window of readings "still"? Judged by the spread of the readings, not by the single worst frame: a pose model's ordinary jitter (and the odd frame that is a little off)
 * must not keep restarting the wait, while a real movement still does. All three must hold, with `tol` the drift the person may have:
 *   spread  the robust standard deviation (1.4826 x the median absolute deviation) is at most half of `tol`;
 *   drift   the first half of the window and the second half have medians no further apart than 0.7 x `tol` (a slow movement);
 *   extreme no reading is further from the median than 3 x `tol` (a jump or a large movement).
 */
export function isStill(values: number[], tol: number): boolean {
  if (values.length < 4) return true;
  const median = (v: number[]) => { const a = [...v].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const m = median(values);
  const mad = median(values.map((v) => Math.abs(v - m)));
  if (1.4826 * mad > tol * 0.5) return false;
  const half = Math.floor(values.length / 2);
  if (Math.abs(median(values.slice(0, half)) - median(values.slice(half))) > tol * 0.7) return false;
  return values.every((v) => Math.abs(v - m) <= tol * 3);
}

/** The fewest readings the neutral position is taken from: about 0.2 s of a 30 pictures a second camera, and still reachable on a phone that manages 4 or 5. */
export const MIN_SAMPLES = 5;

const isRatio = (metric: Metric) => metric.kind === "offset" || metric.kind === "dist";

function widthOf(metric: Extract<Metric, { kind: "rotation" }>, frame: Frame, sides: Sides): number | null {
  const locate = (ref: PointRef): { x: number; y: number; v: number } | null => {
    if (typeof ref === "string") {
      const name = resolveRef(ref, sides);
      const lm = name ? frame.lm[LM[name]] : undefined;
      return lm ? { x: lm.x * frame.w, y: lm.y * frame.h, v: lm.v } : null;
    }
    const a = locate(ref.mid[0]);
    const b = locate(ref.mid[1]);
    return a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, v: Math.min(a.v, b.v) } : null;
  };
  const a = locate(metric.a);
  const b = locate(metric.b);
  return a && b ? dist(a, b) : null;
}

export class Calibrator {
  private readonly metrics: Metric[];
  private readonly opts: Required<Omit<CalibratorOptions, "tested" | "strict" | "guard">>;
  private readonly strict: Set<string>;
  private readonly tested: Side | undefined;
  private readonly useGuard: boolean;
  private guards = new Map<string, HampelGuard>();
  private samples: { t: number; values: Record<string, number> }[] = [];
  private startT: number | null = null;
  private result: Baseline | null = null;
  private nearSideSeen: Side | null = null;

  constructor(metrics: Metric[], opts: CalibratorOptions = {}) {
    this.metrics = metrics;
    this.opts = { stillMs: opts.stillMs ?? 800, angleTolerance: opts.angleTolerance ?? 3, ratioTolerance: opts.ratioTolerance ?? 0.02, minVisibility: opts.minVisibility ?? 0.5 };
    this.tested = opts.tested;
    this.useGuard = opts.guard ?? true;
    this.strict = new Set(opts.strict ?? metrics.map((m) => m.id));
  }

  push(frame: Frame): CalibrationState {
    if (this.result) return { done: true, progress: 1, baseline: this.result, side: this.nearSideSeen };
    const near = nearSide(frame);
    const values: Record<string, number> = {};
    let complete = true;
    for (const metric of this.metrics) {
      const reading = metric.kind === "rotation" ? (() => { const w = widthOf(metric, frame, { near, tested: this.tested }); return w && w > 0 ? { value: w } : null; })() : readMetric(metric, frame, { minVisibility: this.opts.minVisibility, side: near, tested: this.tested, baseline: undefined });
      if (!reading) { if (this.strict.has(metric.id)) { complete = false; break; } continue; }
      values[metric.id] = this.useGuard ? this.deglitch(metric, reading.value) : reading.value;
    }
    if (!complete) {
      this.samples = [];
      this.startT = null;
      return { done: false, progress: 0, baseline: null, side: null };
    }
    this.nearSideSeen = near;
    this.samples.push({ t: frame.t, values });
    this.startT ??= frame.t;
    // keep the samples inside the stillness window, and never fewer than the last MIN_SAMPLES (up to 4 s old): a slow phone delivers only a few pictures a second, and a
    // window counted in time alone would then hold too few readings to ever finish
    const windowStart = frame.t - this.opts.stillMs * 1.25;
    const oldest = frame.t - 4000;
    this.samples = this.samples.filter((s, i) => s.t >= windowStart || (i >= this.samples.length - MIN_SAMPLES && s.t >= oldest));
    const span = frame.t - this.samples[0].t;
    const med = (id: string) => { const v = this.samples.map((s) => s.values[id]).filter((x) => x !== undefined).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : undefined; };
    let still = true;
    for (const metric of this.metrics) {
      if (!this.strict.has(metric.id)) continue;
      const m = med(metric.id)!;
      const tol = metric.kind === "rotation" ? Math.abs(m) * 0.03 : isRatio(metric) ? this.opts.ratioTolerance : this.opts.angleTolerance;
      if (!isStill(this.samples.map((s) => s.values[metric.id]).filter((x) => x !== undefined), tol)) { still = false; break; }
    }
    if (!still) {
      // movement: restart the window from this sample so that a fidget does not carry over
      this.samples = [{ t: frame.t, values }];
      return { done: false, progress: 0, baseline: null, side: near };
    }
    const progress = Math.min(1, span / this.opts.stillMs);
    if (span >= this.opts.stillMs && this.samples.length >= MIN_SAMPLES) {
      const baseline: Baseline = {};
      for (const metric of this.metrics) { const m = med(metric.id); if (m !== undefined) baseline[metric.id] = m; }
      this.result = baseline;
      return { done: true, progress: 1, baseline, side: near };
    }
    return { done: false, progress, baseline: null, side: near };
  }

  private deglitch(metric: Metric, value: number): number {
    // a trunk or head rotation is measured against a width in pixels here (not in degrees), so it has no fixed floor: its stillness test is relative and stays as it was
    if (metric.kind === "rotation") return value;
    let guard = this.guards.get(metric.id);
    if (!guard) {
      guard = new HampelGuard(isRatio(metric) ? GLITCH_FLOOR.ratio : GLITCH_FLOOR.angle);
      this.guards.set(metric.id, guard);
    }
    return guard.push(value).value;
  }

  reset() {
    this.guards.clear();
    this.samples = [];
    this.startT = null;
    this.result = null;
    this.nearSideSeen = null;
  }
}
