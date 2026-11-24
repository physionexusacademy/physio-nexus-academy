/**
 * Repetition counting from one measured quantity (an angle or a distance) over time, the way a person counting by eye does it: a repetition is one movement away from where
 * the person started and back, wherever that start is and however far they go. It is found by its PEAK and its VALLEY, not by fixed thresholds:
 *
 *   - a peak counts when the quantity has moved at least `minAmp` (a quarter of the way to the target) of the way to the target from the valley before it, and then falls back by a third of that movement;
 *   - the valley need not be the resting value: a person who flows from one repetition into the next without coming all the way back still gets every repetition;
 *   - a repetition that goes less far than `enter` of the target is still COUNTED (that is what a person counting would do) and is reported as shallow (`partial`), so
 *     the range achieved is never hidden; a movement smaller than `minAmp` (or than a few times the measured noise) is a tremor or a breath, not a repetition;
 *   - a movement too quick to be real (`minHalfMs` from valley to peak) is noise, and a gap in the readings longer than `maxGapMs` drops the repetition in progress
 *     instead of guessing (a repetition is never invented from missing data, and one that resumes at the top is not counted twice).
 *
 * Found by simulating how people really move (scripts/formcheck-replab.ts): the earlier counter needed full range and a full return every time, so a person who flowed, or
 * had less range on one side, or moved a little differently each time, had about half their repetitions counted (13 of 25), or none.
 */
export type RepConfig = {
  rest: number;
  target: number;
  /** a repetition that reaches this fraction of the way from rest to target is a full one; a shallower one is counted and reported as shallow (default 0.7) */
  enter?: number;
  /** the smallest movement that is a repetition at all, as a fraction of rest-to-target (default 0.25); never below four times the noise */
  minAmp?: number;
  /** the quickest valley-to-peak that is a real movement, ms (default 250) */
  minHalfMs?: number;
  /** the least time between two counted repetitions, peak to peak, ms (default 500: the fastest real cycle a person makes) */
  minCycleMs?: number;
  maxGapMs?: number;
  /** a hold needed at the top of each repetition, in ms (0 or missing: none) */
  holdMs?: number;
  /** the noise of the quantity in the same units as rest and target, as a standard deviation: movements must be several times larger (default: 3% of rest-to-target) */
  noise?: number;
};
export type RepPhase = "rest" | "going" | "hold" | "returning";
export type RepRecord = {
  /** the peak, in the quantity's own units */
  peak: number;
  /** from the valley to the peak, ms */
  ms: number;
  /** time held near the top, ms */
  holdMs: number;
  shortHold: boolean;
  /** reached `enter` of the way to the target */
  full: boolean;
  /** how far the movement went from its valley, as a fraction of rest-to-target */
  amp: number;
  /** when the peak was, ms */
  at: number;
};
export type RepState = {
  phase: RepPhase;
  /** every repetition counted, deep or shallow */
  reps: number;
  /** of those, how many did not reach the full range */
  partial: number;
  /** 0 at rest, 1 at the target (can exceed 1 or go below 0 briefly) */
  progress: number;
  /** time held near the top of the repetition in progress, ms */
  holdMs: number;
  last: RepRecord | null;
  records: RepRecord[];
};

/** a fall from the top (or a rise from the bottom) must last this long, and this many readings, to be real: a single dip of the noise in the middle of a hold is not the end of a repetition */
const PERSIST_MS = 60;
const PERSIST_N = 2;
/** how far below the top the valley can really be, in range-units (the person's whole range is about 1): anything deeper is a burst of bad readings, and the valley is pulled back so that it can heal */
const MAX_AMP = 2.5;
const MIN_DROP = 0.1;
const HOLD_TOLERANCE = 0.85;
const KEEP_MS = 40_000;

export class RepCounter {
  private readonly cfg: RepConfig;
  private readonly enter: number;
  private readonly minAmp: number;
  private readonly minHalfMs: number;
  private readonly minCycleMs: number;
  private readonly maxGapMs: number;
  private readonly holdMs: number;
  /** noise as a fraction of rest-to-target */
  private readonly sigma: number;
  private mode: "peak" | "valley" = "peak";
  /** the valley the movement started from, in progress units */
  private v: number | null = null;
  private vT = 0;
  private hi = Number.NEGATIVE_INFINITY;
  private hiT = 0;
  private lo = Number.POSITIVE_INFINITY;
  private loT = 0;
  private lastPeak = 0;
  /** a peak whose way up was too small to count on its own: it counts if the way down turns out to be a real movement (see `finishValley`) */
  private tentative: { hi: number; hiT: number; vT: number; vLevel: number; up: number; held: number } | null = null;
  private samples: { t: number; p: number }[] = [];
  /** since when, and for how many readings, the quantity has been past the fall (or rise) threshold without a break */
  private turnSince: number | null = null;
  private turnN = 0;
  private lastT: number | null = null;
  /** the last three readings: their median is what the state machine sees, so one bad reading can never move a peak or a valley */
  private recent: number[] = [];
  /** a possible lower valley, adopted only when the quantity stays below the current one */
  private belowN = 0;
  private belowSince: number | null = null;
  private belowMin = Number.POSITIVE_INFINITY;
  private belowT = 0;
  /** the last stretch spent near the top: when it began, when it last was there, and whether the person is there now */
  private topStart: number | null = null;
  private topEnd = 0;
  private inTop = false;
  private reps = 0;
  private partial = 0;
  private progress = 0;
  private last: RepRecord | null = null;
  private records: RepRecord[] = [];

  constructor(cfg: RepConfig) {
    this.cfg = cfg;
    if (cfg.rest === cfg.target) throw new Error("RepCounter: rest and target must differ");
    const span = Math.abs(cfg.target - cfg.rest);
    this.sigma = Math.min(0.3, Math.max(0, (cfg.noise ?? 0.03 * span) / span));
    this.enter = cfg.enter ?? 0.7;
    this.minAmp = Math.max(cfg.minAmp ?? 0.25, 4 * this.sigma);
    this.minHalfMs = cfg.minHalfMs ?? 250;
    this.minCycleMs = cfg.minCycleMs ?? 500;
    this.maxGapMs = cfg.maxGapMs ?? 1500;
    this.holdMs = cfg.holdMs ?? 0;
    if (!(this.minAmp < 1.5)) throw new Error("RepCounter: minAmp is too large");
  }

  private fraction(value: number) {
    return (value - this.cfg.rest) / (this.cfg.target - this.cfg.rest);
  }
  private get dMin() {
    return Math.max(MIN_DROP, 2.5 * this.sigma);
  }
  private band(amp: number) {
    return Math.max(0.12, 0.15 * amp, 2 * this.sigma);
  }

  /** Start looking again from the next reading: nothing that was in progress is carried over. */
  private restart() {
    this.mode = "peak";
    this.v = null;
    this.hi = Number.NEGATIVE_INFINITY;
    this.lo = Number.POSITIVE_INFINITY;
    this.samples = [];
    this.topStart = null;
    this.inTop = false;
    this.tentative = null;
    this.turnSince = null;
    this.turnN = 0;
    this.recent = [];
    this.belowN = 0;
    this.belowSince = null;
    this.belowMin = Number.POSITIVE_INFINITY;
  }

  /** Is the quantity past its threshold now, and has it been for long enough to be real? */
  private turned(past: boolean, t: number): boolean {
    if (!past) { this.turnSince = null; this.turnN = 0; return false; }
    this.turnSince ??= t;
    this.turnN += 1;
    return this.turnN >= PERSIST_N && t - this.turnSince >= PERSIST_MS;
  }

  /** `value` is null when the quantity could not be read this frame. `t` in ms. */
  push(value: number | null, t: number): RepState {
    if (value === null || !Number.isFinite(value)) {
      if (this.lastT !== null && t - this.lastT > this.maxGapMs && (this.mode === "valley" || (this.v !== null && this.hi - this.v >= this.minAmp * 0.5))) this.restart();
      return this.state();
    }
    if (this.lastT !== null && t - this.lastT > this.maxGapMs) this.restart();
    this.lastT = t;
    this.recent.push(this.fraction(value));
    if (this.recent.length > 3) this.recent.shift();
    const p = this.recent.length < 3 ? this.recent[this.recent.length - 1] : [...this.recent].sort((a, b) => a - b)[1];
    this.progress = p;
    this.samples.push({ t, p });
    while (this.samples.length > 1 && t - this.samples[0].t > KEEP_MS) this.samples.shift();

    if (this.v === null) { this.v = p; this.vT = t; this.hi = p; this.hiT = t; this.mode = "peak"; this.topStart = null; return this.state(); }

    if (this.mode === "peak") {
      if (p < this.v) {
        // below the valley: the valley moves down with the person, but only when they stay down (two readings in a row), never for one reading
        this.belowN += 1;
        this.belowSince ??= t;
        if (p < this.belowMin) { this.belowMin = p; this.belowT = t; }
        if (this.belowN >= PERSIST_N && t - this.belowSince >= PERSIST_MS) {
          this.v = this.belowMin; this.vT = this.belowT; this.hi = p; this.hiT = t; this.topStart = null; this.inTop = false; this.turnSince = null; this.turnN = 0;
          this.belowN = 0; this.belowSince = null; this.belowMin = Number.POSITIVE_INFINITY;
          this.samples = [{ t, p }];
        }
        return this.state();
      }
      this.belowN = 0; this.belowSince = null; this.belowMin = Number.POSITIVE_INFINITY;
      if (p > this.hi) { this.hi = p; this.hiT = t; }
      if (this.hi - this.v > MAX_AMP) this.v = this.hi - MAX_AMP;
      const amp = this.hi - this.v;
      const drop = Math.max(this.dMin, 0.35 * amp);
      // time near the top (for a hold): a stretch begins when the person gets near the top, and a fall out of the band ends it (the last stretch is what the repetition held)
      if (amp >= this.minAmp && p >= this.hi - this.band(amp)) { if (!this.inTop) { this.topStart = t; this.inTop = true; } this.topEnd = t; } else this.inTop = false;
      if (this.turned(p <= this.hi - drop, t)) {
        if (amp >= this.minAmp && this.hiT - this.vT >= this.minHalfMs) {
          this.confirmPeak(amp, t);
        } else if (amp >= Math.max(this.dMin, 0.4 * this.minAmp) && this.hiT - this.vT >= this.minHalfMs) {
          // the way up was small, but the way down may be a real movement: decide when the valley is known
          const held = this.topStart === null ? 0 : Math.max(0, this.topEnd - this.topStart);
          this.tentative = { hi: this.hi, hiT: this.hiT, vT: this.vT, vLevel: this.v, up: amp, held };
          this.mode = "valley"; this.lastPeak = this.hi; this.lo = p; this.loT = t; this.topStart = null; this.inTop = false; this.turnSince = null; this.turnN = 0;
        } else {
          // a movement that is too small or too quick: not a repetition; the top starts again from here
          this.hi = p; this.hiT = t; this.topStart = null; this.inTop = false; this.turnSince = null; this.turnN = 0;
        }
      }
    } else {
      if (p < this.lo) { this.lo = p; this.loT = t; }
      const rise = Math.max(this.dMin, 0.25 * (this.lastPeak - this.lo));
      if (this.turned(p >= this.lo + rise, t)) {
        this.finishValley();
        this.v = this.lo; this.vT = this.loT; this.mode = "peak"; this.hi = p; this.hiT = t; this.topStart = null; this.inTop = false; this.turnSince = null; this.turnN = 0;
        this.samples = this.samples.filter((x) => x.t >= this.loT);
      }
    }
    return this.state();
  }

  /** The valley after a tentative peak is known: if the way down was a real movement, the repetition counts. */
  private finishValley() {
    const tp = this.tentative;
    this.tentative = null;
    if (!tp) return;
    const down = tp.hi - this.lo;
    if (down < this.minAmp) return;
    this.record(tp.hi, tp.hiT, tp.vT, tp.vLevel, Math.max(tp.up, down), tp.held);
  }

  private confirmPeak(amp: number, t: number) {
    const held = this.topStart === null ? 0 : Math.max(0, this.topEnd - this.topStart);
    this.record(this.hi, this.hiT, this.vT, this.v ?? 0, amp, held);
    this.mode = "valley";
    this.lastPeak = this.hi;
    this.lo = this.progress; this.loT = t;
    this.topStart = null;
    this.inTop = false;
    this.turnSince = null;
    this.turnN = 0;
  }

  /** How long the movement stayed above half of its own height around its peak, ms (a real repetition, even a quick one, is up for a few hundred ms; a flicker is not). */
  private widthAtHalf(hiT: number, level: number): number {
    const i = this.samples.findIndex((x) => x.t >= hiT);
    if (i < 0) return 0;
    let a = i; let b = i;
    while (a > 0 && this.samples[a - 1].p >= level) a--;
    while (b < this.samples.length - 1 && this.samples[b + 1].p >= level) b++;
    return this.samples[b].t - this.samples[a].t;
  }

  private record(hi: number, hiT: number, vT: number, vLevel: number, amp: number, held: number) {
    if (this.widthAtHalf(hiT, vLevel + 0.5 * (hi - vLevel)) < this.minHalfMs) return;
    // two peaks closer than a real person can make are one movement seen twice (or a flicker of the tracking), not two repetitions
    if (this.last && hiT - this.last.at < this.minCycleMs) return;
    const peakValue = this.cfg.rest + hi * (this.cfg.target - this.cfg.rest);
    const full = hi >= this.enter;
    const record: RepRecord = { peak: peakValue, ms: hiT - vT, holdMs: held, shortHold: this.holdMs > 0 && held < this.holdMs * HOLD_TOLERANCE, full, amp, at: hiT };
    this.reps += 1;
    if (!full) this.partial += 1;
    this.last = record;
    this.records.push(record);
  }

  state(): RepState {
    const amp = this.v === null ? 0 : this.hi - this.v;
    const phase: RepPhase = this.mode === "valley" ? "returning" : amp >= this.minAmp ? (this.topStart !== null ? "hold" : "going") : "rest";
    const held = this.mode === "peak" && this.inTop && this.topStart !== null ? Math.max(0, this.topEnd - this.topStart) : 0;
    return { phase, reps: this.reps, partial: this.partial, progress: this.progress, holdMs: held, last: this.last, records: this.records };
  }

  reset() {
    this.restart();
    this.reps = 0;
    this.partial = 0;
    this.progress = 0;
    this.last = null;
    this.records = [];
    this.lastT = null;
  }
}

/**
 * A timer for a position that is simply held (a plank, a 30-second stretch): it counts the time a condition is true, forgives short breaks of
 * `graceMs` (tracking blips) and starts again after a longer one.
 */
export class HoldTimer {
  private ms = 0;
  private lastT: number | null = null;
  private falseMs = 0;
  private readonly graceMs: number;
  constructor(graceMs = 800) {
    this.graceMs = graceMs;
  }

  /** `inBand` is true while the position is held, false while it is not, null when it cannot be judged (counts as a break only after the grace time). */
  push(inBand: boolean | null, t: number): number {
    const dt = this.lastT === null ? 0 : Math.min(t - this.lastT, 1000);
    this.lastT = t;
    if (inBand === true) {
      this.ms += dt + (this.falseMs > 0 && this.falseMs <= this.graceMs ? this.falseMs : 0);
      this.falseMs = 0;
    } else {
      this.falseMs += dt;
      if (this.falseMs > this.graceMs) this.ms = 0;
    }
    return this.ms;
  }

  get held() {
    return this.ms;
  }

  reset() {
    this.ms = 0;
    this.lastT = null;
    this.falseMs = 0;
  }
}
