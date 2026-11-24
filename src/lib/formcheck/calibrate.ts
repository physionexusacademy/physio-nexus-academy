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
};
export type CalibrationState = { done: boolean; progress: number; baseline: Baseline | null; side: Side | null };

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
  private readonly opts: Required<Omit<CalibratorOptions, "tested" | "strict">>;
  private readonly strict: Set<string>;
  private readonly tested: Side | undefined;
  private samples: { t: number; values: Record<string, number> }[] = [];
  private startT: number | null = null;
  private result: Baseline | null = null;
  private nearSideSeen: Side | null = null;

  constructor(metrics: Metric[], opts: CalibratorOptions = {}) {
    this.metrics = metrics;
    this.opts = { stillMs: opts.stillMs ?? 800, angleTolerance: opts.angleTolerance ?? 3, ratioTolerance: opts.ratioTolerance ?? 0.02, minVisibility: opts.minVisibility ?? 0.5 };
    this.tested = opts.tested;
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
      values[metric.id] = reading.value;
    }
    if (!complete) {
      this.samples = [];
      this.startT = null;
      return { done: false, progress: 0, baseline: null, side: null };
    }
    this.nearSideSeen = near;
    this.samples.push({ t: frame.t, values });
    this.startT ??= frame.t;
    // keep only the samples inside the stillness window
    const windowStart = frame.t - this.opts.stillMs * 1.25;
    this.samples = this.samples.filter((s) => s.t >= windowStart);
    const span = frame.t - this.samples[0].t;
    const med = (id: string) => { const v = this.samples.map((s) => s.values[id]).filter((x) => x !== undefined).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : undefined; };
    let still = true;
    for (const metric of this.metrics) {
      if (!this.strict.has(metric.id)) continue;
      const m = med(metric.id)!;
      const tol = metric.kind === "rotation" ? Math.abs(m) * 0.03 : isRatio(metric) ? this.opts.ratioTolerance : this.opts.angleTolerance;
      if (this.samples.some((s) => Math.abs(s.values[metric.id] - m) > tol)) { still = false; break; }
    }
    if (!still) {
      // movement: restart the window from this sample so that a fidget does not carry over
      this.samples = [{ t: frame.t, values }];
      return { done: false, progress: 0, baseline: null, side: near };
    }
    const progress = Math.min(1, span / this.opts.stillMs);
    if (span >= this.opts.stillMs && this.samples.length >= 8) {
      const baseline: Baseline = {};
      for (const metric of this.metrics) { const m = med(metric.id); if (m !== undefined) baseline[metric.id] = m; }
      this.result = baseline;
      return { done: true, progress: 1, baseline, side: near };
    }
    return { done: false, progress, baseline: null, side: near };
  }

  reset() {
    this.samples = [];
    this.startT = null;
    this.result = null;
    this.nearSideSeen = null;
  }
}
