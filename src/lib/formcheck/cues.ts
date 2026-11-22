import type { CueRule } from "./spec-types.ts";
import type { Bi } from "./types.ts";

/**
 * Decides when a cue is spoken or shown. A cue fires when its condition has held for the rule's minimum time (a flicker never fires one), then stays visible for a
 * short while, never more than one at a time, with a rest before the next, and it fires again only after the condition has cleared (so a cue is not repeated at a
 * person who has not changed). Cues are written never to ask for more range or effort; this engine only decides the timing.
 */
export type CueEvent = { id: string; text: Bi; t: number };
export type CueReading = { change: number; raw: number };
export type CueOptions = {
  /** how long a cue stays visible, ms */
  showMs?: number;
  /** the least time between one cue ending and the next starting, ms */
  restMs?: number;
  /** the condition must be clear for this long before the same cue can fire again, ms */
  rearmMs?: number;
};

type RuleState = { since: number | null; clearSince: number | null; armed: boolean };

export class CueEngine {
  private readonly rules: CueRule[];
  private readonly showMs: number;
  private readonly restMs: number;
  private readonly rearmMs: number;
  private state = new Map<string, RuleState>();
  private current: CueEvent | null = null;
  private lastEnd = -Infinity;
  readonly counts: Record<string, number> = {};

  constructor(rules: CueRule[], options: CueOptions = {}) {
    this.rules = rules;
    this.showMs = options.showMs ?? 3500;
    this.restMs = options.restMs ?? 2500;
    this.rearmMs = options.rearmMs ?? 1000;
    for (const rule of rules) this.state.set(rule.id, { since: null, clearSince: null, armed: true });
  }

  /** The cue now visible (or null). */
  active(t: number): CueEvent | null {
    if (this.current && t - this.current.t >= this.showMs) {
      this.lastEnd = this.current.t + this.showMs;
      this.current = null;
    }
    return this.current;
  }

  /**
   * `readings` holds, by metric id, the smoothed reading of this frame: its change from the person's own start position and the raw value; null when the metric could
   * not be read (that clears the condition: a cue is never fired from a missing reading). Returns the cue that starts now, if any.
   */
  push(readings: Record<string, CueReading | null | undefined>, t: number): CueEvent | null {
    let ready: CueRule | null = null;
    for (const rule of this.rules) {
      const reading = readings[rule.metric];
      const state = this.state.get(rule.id)!;
      const holds = reading ? (rule.when === "change_over" ? Math.abs(reading.change) >= rule.value : reading.raw < rule.value) : false;
      if (holds) {
        state.clearSince = null;
        state.since ??= t;
        if (state.armed && !ready && t - state.since >= rule.forMs) ready = rule;
      } else {
        state.since = null;
        state.clearSince ??= t;
        if (t - state.clearSince >= this.rearmMs) state.armed = true;
      }
    }
    if (this.active(t) || t - this.lastEnd < this.restMs || !ready) return null;
    const state = this.state.get(ready.id)!;
    state.armed = false;
    this.current = { id: ready.id, text: ready.text, t };
    this.counts[ready.id] = (this.counts[ready.id] ?? 0) + 1;
    return this.current;
  }

  reset() {
    for (const state of this.state.values()) { state.since = null; state.clearSince = null; state.armed = true; }
    this.current = null;
    this.lastEnd = -Infinity;
    for (const key of Object.keys(this.counts)) delete this.counts[key];
  }
}
