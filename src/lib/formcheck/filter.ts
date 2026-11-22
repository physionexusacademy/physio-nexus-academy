/**
 * The One Euro filter (Casiez, Roussel, Vogel, 2012): smooths a noisy signal strongly while it is still and lightly while it moves fast, so the
 * number on the screen does not shake and does not lag behind a real movement. One filter per measured quantity.
 */
export class OneEuroFilter {
  private x: number | null = null;
  private dx = 0;
  private t: number | null = null;
  private readonly minCutoff: number;
  private readonly beta: number;
  private readonly dCutoff: number;
  constructor(minCutoff = 1.0, beta = 0.02, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private alpha(cutoff: number, dt: number) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  /** `t` in milliseconds. Returns the smoothed value. */
  filter(value: number, t: number): number {
    if (this.x === null || this.t === null) {
      this.x = value;
      this.t = t;
      return value;
    }
    const dt = Math.max((t - this.t) / 1000, 1e-3);
    const rawDx = (value - this.x) / dt;
    this.dx += this.alpha(this.dCutoff, dt) * (rawDx - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += this.alpha(cutoff, dt) * (value - this.x);
    this.t = t;
    return this.x;
  }

  reset() {
    this.x = null;
    this.t = null;
    this.dx = 0;
  }
}
