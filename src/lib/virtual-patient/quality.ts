/**
 * The 3D drawing resolution governor (no three.js and no DOM, so it is tested in node: scripts/validate-3d-smooth.ts).
 *
 * It decides, from the gaps between frames that were drawn one after the other, which resolution level the picture should use, the way a game's
 * dynamic resolution does: slow seconds step it down (at once when it is far too slow), a run of clean seconds steps it up by one (a trial), a trial
 * that cannot hold is taken back and not repeated in this visit. The caller only resizes the canvas for a level; nothing here rebuilds a shader.
 */
export type GovernorAction = { level: number; trial: boolean } | "last-resort" | null;

export const RATIOS = [0.6, 0.75, 0.9, 1, 1.25, 1.5, 1.75, 2] as const;

/** Ms per frame over a second of animation, above which the second counts as slow / far too slow / (during a trial) not holding; below which it is clean. */
export const SLOW_MS = 24;
export const FAR_TOO_SLOW_MS = 45;
export const TRIAL_FAIL_MS = 21;
export const CLEAN_MS = 18.5;
/** Clean seconds in a row before a step up is tried. */
export const CLEAN_SECONDS_BEFORE_TRIAL = 4;

export class ResolutionGovernor {
  level: number;
  cap: number;
  /** First level that failed a trial in this visit (levels from here up are not tried again). */
  lockedFrom = Infinity;
  trial: { from: number; until: number } | null = null;
  private settleUntil = 0;
  private winMs = 0;
  private winFrames = 0;
  private slowSeconds = 0;
  private cleanSeconds = 0;
  /** Set when a level has proved itself (two clean seconds): the caller may remember it. */
  provenLevel: number | null = null;

  constructor(start: number, cap: number) {
    this.cap = cap;
    this.level = Math.max(0, Math.min(cap, start));
  }

  /** The first moments after a load or a change carry the browser's one-off work, not the cost of the picture: they are not judged. */
  settle(now: number, ms: number) {
    this.settleUntil = Math.max(this.settleUntil, now + ms);
    this.winMs = 0;
    this.winFrames = 0;
  }

  setCap(cap: number) {
    this.cap = cap;
  }

  /** The caller has moved to `level`: restart the judging from there. */
  applied(level: number, now: number) {
    this.level = Math.max(0, Math.min(this.cap, level));
    this.slowSeconds = 0;
    this.cleanSeconds = 0;
    this.winMs = 0;
    this.winFrames = 0;
    this.settleUntil = now + 450;
  }

  /** One frame was drawn straight after another one, `gap` ms later (a hold, a pause or a hidden tab is simply not reported). */
  frame(gap: number, now: number): GovernorAction {
    this.provenLevel = null;
    if (!(gap > 0) || gap >= 1500) return null;
    if (now < this.settleUntil) return null;
    this.winMs += gap;
    this.winFrames += 1;
    if (this.winMs < 1000) return null;
    const avg = this.winMs / this.winFrames;
    this.winMs = 0;
    this.winFrames = 0;
    const trial = this.trial;
    if (avg > FAR_TOO_SLOW_MS || (trial && avg > TRIAL_FAIL_MS)) {
      if (trial) {
        // the step up could not hold: back to where it was fine, and no more tries above it in this visit
        this.lockedFrom = Math.min(this.lockedFrom, trial.from + 1);
        this.trial = null;
        return { level: trial.from, trial: false };
      }
      return this.level > 0 ? { level: Math.max(0, this.level - 2), trial: false } : "last-resort";
    }
    if (avg > SLOW_MS) {
      this.cleanSeconds = 0;
      this.slowSeconds += 1;
      if (this.slowSeconds >= 2) {
        this.slowSeconds = 0;
        if (this.level > 0) return { level: this.level - 1, trial: false };
      }
      return null;
    }
    this.slowSeconds = 0;
    if (trial && now > trial.until) this.trial = null;
    if (avg > CLEAN_MS) {
      this.cleanSeconds = 0;
      return null;
    }
    this.cleanSeconds += 1;
    if (this.cleanSeconds === 2 && !this.trial) this.provenLevel = this.level;
    if (!this.trial && this.cleanSeconds >= CLEAN_SECONDS_BEFORE_TRIAL && this.level < this.cap && this.level + 1 < this.lockedFrom) {
      this.trial = { from: this.level, until: now + 2200 };
      return { level: this.level + 1, trial: true };
    }
    return null;
  }
}
