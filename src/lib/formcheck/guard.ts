/**
 * A pose model now and then gets one frame badly wrong: a landmark jumps to the wrong place for a frame or two (a hand taken for a foot, left and right swapped, a joint
 * lost behind a limb). Smoothing alone spreads such a glitch over several frames; it can also look like a very fast repetition, or break the stillness the neutral
 * position needs. `HampelGuard` is the standard remedy (Hampel 1974): a value that lies far from the median of the last few values is replaced by that median.
 *
 * It is causal (no future frames) and adds no delay to a value that is plausible. A real, quick movement is let through after `size/2` frames, because once most of the
 * window agrees on the new level it is no longer an outlier: three frames in a row (about 100 ms) at the new level are never treated as a glitch.
 */
/** how much time the guard looks back over, ms: about five readings at 30 pictures a second */
const WINDOW_MS = 170;

export class HampelGuard {
  private readonly window: number[] = [];
  private readonly size: number;
  private readonly k: number;
  private readonly floor: number;
  /** how many values were replaced so far */
  rejected = 0;
  private lastT: number | null = null;
  /** the usual time between readings, ms (a running average, starting from the first interval measured) */
  private gap: number | null = null;

  /** `floor`: the smallest departure from the median that can count as a glitch, in the unit of the signal (degrees for angles, a fraction for ratios). */
  constructor(floor: number, size = 5, k = 3) {
    this.floor = floor;
    this.size = size;
    this.k = k;
  }

  /**
   * `t`: the time of the reading in ms. With it the window follows the time between pictures: a glitch lasts a fraction of a second whatever the frame rate, so on a slow phone
   * (a few pictures a second) a window of five readings would be seconds long and would erase real movement, and below three readings there is nothing to compare against:
   * the guard then steps aside.
   */
  push(value: number, t?: number): { value: number; rejected: boolean } {
    if (t !== undefined) {
      if (this.lastT !== null && t > this.lastT) this.gap = this.gap === null ? t - this.lastT : 0.8 * this.gap + 0.2 * (t - this.lastT);
      this.lastT = t;
    }
    this.window.push(value);
    if (this.window.length > this.size) this.window.shift();
    const wanted = t === undefined ? this.size : this.gap === null ? 1 : Math.max(1, Math.min(this.size, Math.round(WINDOW_MS / this.gap)));
    if (wanted < 3 || this.window.length < 3) return { value, rejected: false };
    const recent = this.window.slice(-wanted);
    const sorted = [...recent].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const deviations = recent.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
    const mad = deviations[Math.floor(deviations.length / 2)];
    const limit = Math.max(this.floor, this.k * 1.4826 * mad);
    if (Math.abs(value - median) > limit) {
      this.rejected += 1;
      return { value: median, rejected: true };
    }
    return { value, rejected: false };
  }

  reset() {
    this.window.length = 0;
    this.lastT = null;
    this.gap = null;
  }
}

/** The smallest departure from the median that counts as a glitch for each kind of measurement: well above the model's ordinary jitter, well below a real movement. */
export const GLITCH_FLOOR = { angle: 7, ratio: 0.06 } as const;
