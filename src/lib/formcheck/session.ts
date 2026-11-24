import { assessAlignment, type Alignment } from "./alignment.ts";
import { Calibrator } from "./calibrate.ts";
import { CueEngine, type CueEvent, type CueReading } from "./cues.ts";
import { OneEuroFilter } from "./filter.ts";
import { GLITCH_FLOOR, HampelGuard } from "./guard.ts";
import { nearSide, needsHead, readMetric, type Side } from "./geometry.ts";
import { STATUS_MESSAGES, SETUP_MESSAGES } from "./messages.ts";
import { mayShowAngle, movementTypeOf } from "./movement-types.ts";
import { assessSetup, type SetupIssue, type SetupResult } from "./quality.ts";
import { HoldTimer, RepCounter, type RepRecord } from "./reps.ts";
import type { CameraSpec, CueRule, Primary } from "./spec-types.ts";
import type { Baseline, Bi, Frame, Metric } from "./types.ts";

/**
 * One exercise set from start to finish: the set-up check, the person's own neutral position, counting or timing, the cues, and the summary. Pure (no camera, no
 * DOM, no clock of its own: time is the frame's `t`), so it is tested with synthetic frames and the same code runs in the browser.
 *
 * The session refuses instead of guessing: with the set-up not met, a side not chosen or a face view it needs but does not have, it gives no number.
 */
export type SessionPhase = "unavailable" | "setup" | "calibrating" | "active" | "finished";
export type SessionOptions = {
  /** the side the person exercises (for sided exercises) */
  tested?: Side;
  /** 1: the main view; 2: the short second pass of the spec */
  pass?: 1 | 2;
  /** the face model is running and `Frame.head` is supplied */
  face?: boolean;
  minVisibility?: number;
  /** reject one-frame glitches of the pose model before smoothing (default true; switched off only to measure what the guard is worth) */
  guard?: boolean;
};
export type MetricReading = { raw: number; change: number; confidence: number };
export type SessionState = {
  phase: SessionPhase;
  /** what to say or show now (a set-up issue, "stay still", "I lost you"), or null */
  hint: Bi | null;
  setup: SetupResult | null;
  /** how far the neutral position has been taken, 0..1 */
  calibration: number;
  /** the primary metric could be read in this frame */
  tracking: boolean;
  /** 0 at the start position, 1 at the target (the gauge) */
  progress: number;
  reps: number;
  partial: number;
  /** the hold in progress, ms (hold-timer exercises: the time held; repetition exercises: the hold at the end of the repetition in progress) */
  holdMs: number;
  /** the primary metric now; `shown`: the validation study allows a number for this movement type */
  primary: { value: number; confidence: number; shown: boolean } | null;
  cue: CueEvent | null;
  /** every metric of the pass, this frame */
  readings: Record<string, MetricReading | null>;
  /** the alignment screen (set-up and neutral position only; null while a set is running) */
  alignment: Alignment | null;
};
export type SessionSummary = {
  specId: string;
  pass: 1 | 2;
  durationMs: number;
  reps: number;
  partial: number;
  records: RepRecord[];
  /** hold-timer exercises: the longest unbroken hold, ms */
  bestHoldMs: number;
  /** frames with a reading of the primary metric against all frames of the active phase */
  coverage: { frames: number; read: number; fraction: number };
  refusals: Partial<Record<SetupIssue, number>>;
  cues: Record<string, number>;
  baseline: Baseline | null;
  /** the largest change of each metric from the start position during the set (the range reached) */
  peak: Record<string, number>;
  limits: Bi;
  /** one-frame glitches of the pose model that were ignored (a measure of how steady the tracking was) */
  glitches: number;
};

const SETUP_OK_MS = 600;
const LOST_MS = 1500;
const BACK_MS = 400;
const REACH_ENTER = 0.7;
const ACTIVE_ISSUES: SetupIssue[] = ["no_person", "body_not_visible"];
const BUFFER_MS = 12000;

export class FormCheckSession {
  readonly spec: CameraSpec;
  private readonly pass: 1 | 2;
  private readonly tested: Side | undefined;
  private readonly face: boolean;
  private readonly minVisibility: number;
  private readonly useGuard: boolean;
  private guards = new Map<string, HampelGuard>();
  private readonly metrics: Metric[];
  private readonly need: CameraSpec["need"];
  private readonly view: "front" | "side" | "feet" | "head";
  /** seen end-on the body is foreshortened, so it fills less of the picture */
  private readonly size: [number, number] | undefined;
  private readonly primary: Primary | null;
  private readonly rules: CueRule[];

  private phase: SessionPhase = "setup";
  private calibrator: Calibrator;
  private baseline: Baseline | null = null;
  private filters = new Map<string, { filter: OneEuroFilter; lastT: number }>();
  private counter: RepCounter | null = null;
  private timer: HoldTimer | null = null;
  private cues: CueEngine;
  private okSince: number | null = null;
  private lostSince: number | null = null;
  private backSince: number | null = null;
  private paused = false;
  private startT: number | null = null;
  private lastT = 0;
  private frames = 0;
  private read = 0;
  private refusals: Partial<Record<SetupIssue, number>> = {};
  private best = 0;
  private peaks: Record<string, number> = {};
  private buffer: { t: number; value: number; confidence: number }[] = [];
  private cueLog: { id: string; t: number }[] = [];
  private current: SessionState;

  constructor(spec: CameraSpec, options: SessionOptions = {}) {
    this.spec = spec;
    this.pass = options.pass ?? 1;
    this.tested = options.tested;
    this.face = options.face ?? false;
    this.minVisibility = options.minVisibility ?? 0.5;
    this.useGuard = options.guard ?? true;
    const second = this.pass === 2 ? spec.second : undefined;
    if (this.pass === 2 && !second) throw new Error(`${spec.id} has no second pass`);
    this.metrics = (second?.metrics ?? spec.metrics).filter((m) => !needsHead(m) || this.face);
    this.need = second?.need ?? spec.need;
    this.view = (second?.placement ?? spec.placement).view;
    this.size = this.view === "feet" || this.view === "head" ? [0.12, 0.97] : undefined;
    this.primary = this.pass === 1 ? spec.primary : null;
    this.rules = spec.cues.filter((c) => (c.pass ?? 1) === this.pass && this.metrics.some((m) => m.id === c.metric));
    this.calibrator = this.newCalibrator();
    this.cues = new CueEngine(this.rules);
    this.current = this.blank();
    this.phase = this.unavailable() ? "unavailable" : "setup";
    this.current = { ...this.blank(), phase: this.phase, hint: this.unavailableHint() };
  }

  /** The neutral position must be still for the metrics that count or cue; the rest are followed without holding the set up. */
  private newCalibrator(): Calibrator {
    const strict = new Set<string>(this.rules.map((c) => c.metric));
    if (this.primary) strict.add(this.primary.metric);
    return new Calibrator(this.metrics, { tested: this.tested, minVisibility: this.minVisibility, strict: [...strict], guard: this.useGuard });
  }

  private unavailable(): boolean {
    if (this.spec.sided && !this.tested) return true;
    if (this.spec.needFace === "required" && !this.face && this.pass === 1) return true;
    return false;
  }
  private unavailableHint(): Bi | null {
    if (this.spec.sided && !this.tested) return STATUS_MESSAGES.needSide;
    if (this.spec.needFace === "required" && !this.face && this.pass === 1) return STATUS_MESSAGES.needFace;
    return null;
  }

  private blank(): SessionState {
    return { phase: this.phase, hint: null, setup: null, calibration: 0, tracking: false, progress: 0, reps: 0, partial: 0, holdMs: 0, primary: null, cue: null, readings: {}, alignment: null };
  }

  get state(): SessionState {
    return this.current;
  }

  /** Take the neutral position again (for example after the phone was moved). */
  recalibrate() {
    if (this.phase === "unavailable") return;
    this.calibrator = this.newCalibrator();
    this.baseline = null;
    this.phase = "setup";
    this.okSince = null;
    this.filters.clear();
    this.guards.clear();
    this.counter = null;
    this.timer = null;
    this.cues.reset();
    this.current = { ...this.blank(), phase: "setup" };
  }

  /** Feed one frame. `frame.t` is in milliseconds and must not go backwards. */
  push(frame: Frame): SessionState {
    this.lastT = frame.t;
    if (this.phase === "unavailable" || this.phase === "finished") return this.current;
    const side = nearSide(frame);

    if (this.phase === "setup") {
      const setup = assessSetup(frame, { need: this.need, view: this.view, tested: this.tested, minVisibility: this.minVisibility, size: this.size });
      this.okSince = setup.ok ? (this.okSince ?? frame.t) : null;
      if (setup.ok && frame.t - (this.okSince ?? frame.t) >= SETUP_OK_MS) {
        this.phase = "calibrating";
        this.current = { ...this.blank(), phase: "calibrating", setup, hint: STATUS_MESSAGES.calibrating, alignment: assessAlignment(frame, { need: this.need, view: this.view, tested: this.tested, minVisibility: this.minVisibility, size: this.size }, 0) };
        return this.current;
      }
      const steady = setup.ok ? Math.min(1, (frame.t - (this.okSince ?? frame.t)) / SETUP_OK_MS) : 0;
      const alignment = assessAlignment(frame, { need: this.need, view: this.view, tested: this.tested, minVisibility: this.minVisibility, size: this.size }, steady);
      this.current = { ...this.blank(), phase: "setup", setup, hint: setup.ok ? null : SETUP_MESSAGES[setup.issues[0]], alignment };
      return this.current;
    }

    if (this.phase === "calibrating") {
      const step = this.calibrator.push(frame);
      if (step.done && step.baseline) {
        this.baseline = step.baseline;
        this.phase = "active";
        this.startT = frame.t;
        this.buildCounters();
        this.current = { ...this.blank(), phase: "active", calibration: 1, hint: STATUS_MESSAGES.ready };
        return this.current;
      }
      const alignment = assessAlignment(frame, { need: this.need, view: this.view, tested: this.tested, minVisibility: this.minVisibility, size: this.size }, step.progress);
      this.current = { ...this.blank(), phase: "calibrating", calibration: step.progress, hint: STATUS_MESSAGES.calibrating, alignment };
      return this.current;
    }

    return this.active(frame, side);
  }

  private buildCounters() {
    const p = this.primary;
    if (!p) return;
    if (p.mode === "reps") this.counter = new RepCounter({ rest: p.rest, target: p.target, holdMs: p.holdMs });
    else this.timer = new HoldTimer();
  }

  /** One-frame glitches of the pose model are replaced by the recent median before smoothing (see guard.ts). */
  private deglitch(metric: Metric, value: number): number {
    if (!this.useGuard) return value;
    let guard = this.guards.get(metric.id);
    if (!guard) {
      guard = new HampelGuard(metric.kind === "offset" || metric.kind === "dist" ? GLITCH_FLOOR.ratio : GLITCH_FLOOR.angle);
      this.guards.set(metric.id, guard);
    }
    return guard.push(value).value;
  }

  private smooth(id: string, value: number, t: number): number {
    let entry = this.filters.get(id);
    if (!entry || t - entry.lastT > 1000) {
      entry = { filter: new OneEuroFilter(1.0, 0.02, 1.0), lastT: t };
      this.filters.set(id, entry);
    }
    entry.lastT = t;
    return entry.filter.filter(value, t);
  }

  private active(frame: Frame, side: Side): SessionState {
    const t = frame.t;
    const baseline = this.baseline ?? {};
    this.frames += 1;

    // the person must stay in view; the rest of the set-up check (size, centre, view) applies before the set starts, not while they move
    const setup = assessSetup(frame, { need: this.need, view: this.view, tested: this.tested, minVisibility: this.minVisibility, size: this.size });
    const blocking = setup.issues.filter((i) => ACTIVE_ISSUES.includes(i));
    if (blocking.length) {
      for (const issue of blocking) this.refusals[issue] = (this.refusals[issue] ?? 0) + 1;
      this.lostSince ??= t;
      this.backSince = null;
      if (t - this.lostSince >= LOST_MS) this.paused = true;
    } else {
      this.lostSince = null;
      if (this.paused) { this.backSince ??= t; if (t - this.backSince >= BACK_MS) { this.paused = false; this.backSince = null; } }
    }

    const readings: Record<string, MetricReading | null> = {};
    const cueReadings: Record<string, CueReading | null> = {};
    for (const metric of this.metrics) {
      const r = blocking.length || this.paused ? null : readMetric(metric, frame, { minVisibility: this.minVisibility, baseline, side, tested: this.tested });
      if (!r) { readings[metric.id] = null; cueReadings[metric.id] = null; continue; }
      const raw = this.smooth(metric.id, this.deglitch(metric, r.value), t);
      const change = metric.kind === "rotation" ? raw : raw - (baseline[metric.id] ?? 0);
      readings[metric.id] = { raw, change, confidence: r.confidence };
      cueReadings[metric.id] = { raw, change };
      this.peaks[metric.id] = Math.max(this.peaks[metric.id] ?? 0, Math.abs(change));
    }

    // the primary metric: counted as repetitions, or timed
    let tracking = false;
    let progress = 0;
    let primaryReading: SessionState["primary"] = null;
    let holdMs = 0;
    const p = this.primary;
    if (p) {
      const reading = readings[p.metric];
      if (reading) {
        tracking = true;
        this.read += 1;
        const value = p.reference === "baseline" ? reading.change : reading.raw;
        primaryReading = { value, confidence: reading.confidence, shown: mayShowAngle(movementTypeOf(this.spec, p.metric)) };
        this.buffer.push({ t, value, confidence: reading.confidence });
        while (this.buffer.length && t - this.buffer[0].t > BUFFER_MS) this.buffer.shift();
        if (p.mode === "reps" && this.counter) {
          const s = this.counter.push(value, t);
          progress = s.progress;
          holdMs = s.holdMs;
        } else if (this.timer) {
          const fraction = p.mode === "hold-reach" ? value / p.target : 1 - Math.abs(value) / p.target;
          holdMs = this.timer.push(p.mode === "hold-reach" ? fraction >= REACH_ENTER : Math.abs(value) <= p.target, t);
          progress = Math.max(0, Math.min(1.2, fraction));
          this.best = Math.max(this.best, holdMs);
        }
      } else {
        if (this.counter) this.counter.push(null, t);
        if (this.timer) holdMs = this.timer.push(null, t);
      }
    } else if (this.metrics.every((m) => readings[m.id])) {
      this.read += 1;
    }

    const started = this.cues.push(this.paused ? {} : cueReadings, t);
    if (started) { this.cueLog.push({ id: started.id, t }); if (this.cueLog.length > 200) this.cueLog.shift(); }
    const cue = this.cues.active(t);
    const counter = this.counter?.state();
    const per = p?.movementsPerRep ?? 1;
    this.current = {
      phase: "active",
      hint: this.paused ? STATUS_MESSAGES.paused : blocking.length ? STATUS_MESSAGES.lost : null,
      setup,
      calibration: 1,
      tracking,
      progress,
      reps: counter ? Math.floor(counter.reps / per) : 0,
      partial: counter?.partial ?? 0,
      holdMs,
      primary: primaryReading,
      cue,
      readings,
      alignment: null,
    };
    return this.current;
  }

  /** The median of the primary metric's readings between two times (for example the middle second of a hold), or null when there are none. */
  median(fromT: number, toT: number): number | null {
    const values = this.buffer.filter((b) => b.t >= fromT && b.t <= toT).map((b) => b.value).sort((a, b) => a - b);
    return values.length ? values[Math.floor(values.length / 2)] : null;
  }

  /**
   * The reading of the primary metric over a window of time (the middle second of a 3 s hold in the validation study): the median value, the median confidence and how many
   * frames it is made of, or null when there was no reading. The window must be inside the last 12 seconds.
   */
  capture(fromT: number, toT: number): { value: number; confidence: number; n: number } | null {
    const inside = this.buffer.filter((b) => b.t >= fromT && b.t <= toT);
    if (!inside.length) return null;
    const median = (values: number[]) => { const v = [...values].sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
    return { value: median(inside.map((b) => b.value)), confidence: median(inside.map((b) => b.confidence)), n: inside.length };
  }

  /** The ids of the cues that started between two times. */
  cuesBetween(fromT: number, toT: number): string[] {
    return this.cueLog.filter((c) => c.t >= fromT && c.t <= toT).map((c) => c.id);
  }

  finish(t: number = this.lastT): SessionSummary {
    this.phase = "finished";
    const counter = this.counter?.state();
    const per = this.primary?.movementsPerRep ?? 1;
    this.current = { ...this.current, phase: "finished", hint: STATUS_MESSAGES.done, cue: null };
    return {
      specId: this.spec.id,
      pass: this.pass,
      durationMs: this.startT === null ? 0 : Math.max(0, t - this.startT),
      reps: counter ? Math.floor(counter.reps / per) : 0,
      partial: counter?.partial ?? 0,
      records: counter?.records ?? [],
      bestHoldMs: this.best,
      coverage: { frames: this.frames, read: this.read, fraction: this.frames ? this.read / this.frames : 0 },
      refusals: { ...this.refusals },
      cues: { ...this.cues.counts },
      baseline: this.baseline,
      peak: { ...this.peaks },
      limits: this.spec.limits,
      glitches: [...this.guards.values()].reduce((n, g) => n + g.rejected, 0),
    };
  }
}
