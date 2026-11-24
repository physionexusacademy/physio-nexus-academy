/**
 * Repetition and hold counting from one measured quantity (an angle or a distance) over time.
 *
 * A repetition counts only when the value goes at least `enter` of the way from the resting value to the target value AND comes back to within `exit`
 * of rest (hysteresis, so noise around a threshold never counts twice). A movement that is too quick to be real (`minRepMs`) is noise, a movement that
 * leaves rest but never gets far enough is counted as "partial" (shown to the person, never as a repetition), and a gap in the readings longer than
 * `maxGapMs` drops the repetition in progress instead of guessing (a repetition is never invented from missing data).
 */
export type RepConfig = {
  rest: number;
  target: number;
  enter?: number;
  exit?: number;
  minRepMs?: number;
  maxGapMs?: number;
  /** a hold needed at the end of each repetition, in ms (0 or missing: none) */
  holdMs?: number;
};
export type RepPhase = "rest" | "going" | "hold" | "returning";
export type RepRecord = { peak: number; ms: number; holdMs: number; shortHold: boolean };
export type RepState = {
  phase: RepPhase;
  reps: number;
  partial: number;
  /** 0 at rest, 1 at the target (can exceed 1 or go below 0 briefly) */
  progress: number;
  /** time held at the end of the repetition in progress, ms */
  holdMs: number;
  last: RepRecord | null;
  records: RepRecord[];
};

export class RepCounter {
  private readonly cfg: RepConfig;
  private readonly enter: number;
  private readonly exit: number;
  private readonly minRepMs: number;
  private readonly maxGapMs: number;
  private readonly holdMs: number;
  private phase: RepPhase = "rest";
  private startT = 0;
  private lastT: number | null = null;
  private peakProgress = 0;
  private reached = false;
  private held = 0;
  private reps = 0;
  private partial = 0;
  private progress = 0;
  private last: RepRecord | null = null;
  private records: RepRecord[] = [];

  constructor(cfg: RepConfig) {
    this.cfg = cfg;
    if (cfg.rest === cfg.target) throw new Error("RepCounter: rest and target must differ");
    this.enter = cfg.enter ?? 0.7;
    this.exit = cfg.exit ?? 0.3;
    this.minRepMs = cfg.minRepMs ?? 500;
    this.maxGapMs = cfg.maxGapMs ?? 1500;
    this.holdMs = cfg.holdMs ?? 0;
    if (!(this.exit < this.enter)) throw new Error("RepCounter: exit must be below enter");
  }

  private fraction(value: number) {
    return (value - this.cfg.rest) / (this.cfg.target - this.cfg.rest);
  }

  /** After tracking was lost in the middle of a repetition the person may come back already part way through the movement: wait until they are back at rest before a new repetition can start, so none is invented from what was not seen. */
  private awaitRest = false;

  private abort() {
    this.phase = "rest";
    this.reached = false;
    this.peakProgress = 0;
    this.held = 0;
  }

  /** `value` is null when the quantity could not be read this frame. `t` in ms. */
  push(value: number | null, t: number): RepState {
    if (value === null || !Number.isFinite(value)) {
      if (this.lastT !== null && this.phase !== "rest" && t - this.lastT > this.maxGapMs) { this.abort(); this.awaitRest = true; }
      return this.state();
    }
    const dt = this.lastT === null ? 0 : Math.min(t - this.lastT, this.maxGapMs);
    this.lastT = t;
    const p = this.fraction(value);
    this.progress = p;
    if (this.awaitRest) {
      if (p < this.exit) this.awaitRest = false;
      else return this.state();
    }
    if (this.phase === "rest") {
      if (p > this.exit) {
        this.phase = "going";
        this.startT = t;
        this.peakProgress = p;
        this.reached = false;
        this.held = 0;
      }
    }
    if (this.phase === "going" || this.phase === "hold" || this.phase === "returning") {
      this.peakProgress = Math.max(this.peakProgress, p);
      if (p >= this.enter) {
        this.reached = true;
        this.phase = this.holdMs > 0 ? "hold" : "going";
        if (this.holdMs > 0) this.held += dt;
      } else if (this.reached && p < this.enter) {
        this.phase = "returning";
      }
      if (p < this.exit) {
        const ms = t - this.startT;
        if (ms >= this.minRepMs) {
          if (this.reached) {
            const record: RepRecord = { peak: this.cfg.rest + this.peakProgress * (this.cfg.target - this.cfg.rest), ms, holdMs: this.held, shortHold: this.holdMs > 0 && this.held < this.holdMs };
            this.reps += 1;
            this.last = record;
            this.records.push(record);
          } else if (this.peakProgress >= 0.35) {
            this.partial += 1;
          }
        }
        this.abort();
      }
    }
    return this.state();
  }

  state(): RepState {
    return { phase: this.phase, reps: this.reps, partial: this.partial, progress: this.progress, holdMs: this.held, last: this.last, records: this.records };
  }

  reset() {
    this.abort();
    this.awaitRest = false;
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
