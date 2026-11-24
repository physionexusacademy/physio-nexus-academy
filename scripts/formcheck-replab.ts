import { HampelGuard, OneEuroFilter, RepCounter, GLITCH_FLOOR, type RepConfig } from "../src/lib/formcheck/index.ts";
import { rng } from "./formcheck-synthetic.ts";

/**
 * The repetition lab: 25-repetition sets made the way real people move, played into the counter as a bare signal (one measured quantity, rest 0, target 90, as the
 * specs define it). The person's repetitions are known exactly, so the count can be compared with the truth. This tests the LOGIC of the counter; how real bodies move on a
 * real camera is the validation study's job. Patterns:
 *   discrete   full range, back to rest between repetitions, a pause at rest (the easy case)
 *   flowing    full range, but the next repetition starts before the person is back at rest (the valley stays at half range)
 *   shallow    60% of the target range every time (a stiff neck, a weak core)
 *   oneside    every second repetition (the other side) reaches 55% of the range
 *   quick      about one repetition a second
 *   fast       about 0.7 of a second a repetition (the quickest a person really does a full-range movement)
 *   variable   every repetition different: range 50% to 120%, return 0% to 45% (never closer than 40% of the range to the top), speed 1.4 to 3.6 s
 *   lostTop    full range, tracking lost for 0.2 to 0.5 s around the top of every other repetition (a face turned too far)
 *   noisy      flowing with strong noise and glitches
 *   drift      full range while the resting position creeps up by a quarter of the range
 */
export type Pattern = "discrete" | "flowing" | "shallow" | "oneside" | "quick" | "fast" | "variable" | "lostTop" | "noisy" | "drift";
export const PATTERNS: Pattern[] = ["discrete", "flowing", "shallow", "oneside", "quick", "fast", "variable", "lostTop", "noisy", "drift"];
export const REPS = 25;
export const TARGET = 90;

type Rep = { peak: number; valley: number; ms: number; pause: number; gapAtTop: number };
export type Truth = { at: number; amp: number };
export function makeSet(pattern: Pattern, seed: number, cycleMs?: number): { signal: (t: number) => number | null; seconds: number; truth: Truth[] } {
  const r = rng(seed);
  const reps: Rep[] = [];
  for (let i = 0; i < REPS; i++) {
    let rep: Rep;
    switch (pattern) {
      case "discrete": rep = { peak: 100, valley: 0, ms: 3000, pause: 700, gapAtTop: 0 }; break;
      case "flowing": rep = { peak: 100, valley: 50 + 6 * (r() - 0.5), ms: 1800, pause: 0, gapAtTop: 0 }; break;
      case "shallow": rep = { peak: 60 + 4 * (r() - 0.5), valley: 5, ms: 2200, pause: 200, gapAtTop: 0 }; break;
      case "oneside": rep = { peak: i % 2 ? 55 : 100, valley: 8, ms: 2200, pause: 200, gapAtTop: 0 }; break;
      case "quick": rep = { peak: 100, valley: 0, ms: 900 + 150 * r(), pause: 0, gapAtTop: 0 }; break;
      case "fast": rep = { peak: 100, valley: 0, ms: 650 + 100 * r(), pause: 0, gapAtTop: 0 }; break;
      case "variable": { const peak = 50 + 70 * r(); rep = { peak, valley: Math.min(45 * r(), peak - 40), ms: 1400 + 2200 * r(), pause: 600 * r(), gapAtTop: 0 }; break; }
      case "lostTop": rep = { peak: 100, valley: 0, ms: 2600, pause: 300, gapAtTop: i % 2 ? 200 + 300 * r() : 0 }; break;
      case "noisy": rep = { peak: 100, valley: 40 + 10 * r(), ms: 2000, pause: 0, gapAtTop: 0 }; break;
      case "drift": rep = { peak: 100 + (i / REPS) * 25, valley: (i / REPS) * 25, ms: 2600, pause: 300, gapAtTop: 0 }; break;
    }
    // `cycleMs`: every repetition takes exactly this long (to test the advice a slow phone gives about how long to take)
    if (cycleMs) rep.ms = cycleMs;
    reps.push(rep);
  }
  const noise = pattern === "noisy" ? 4 : 1.2;
  // the signal is a chain of half-cosine moves valley -> peak -> valley, with a pause at the valley
  const segments: { t0: number; t1: number; from: number; to: number; gap?: [number, number] }[] = [];
  const truth: Truth[] = [];
  let t = 1500; let level = 0;
  for (const rep of reps) {
    truth.push({ at: t + rep.ms / 2, amp: (rep.peak - rep.valley) / 100 });
    const up = rep.ms / 2; const down = rep.ms / 2;
    const top = (rep.peak / 100) * TARGET; const bottom = (rep.valley / 100) * TARGET;
    segments.push({ t0: t, t1: t + up, from: level, to: top, gap: rep.gapAtTop ? [t + up - rep.gapAtTop / 2, t + up + rep.gapAtTop / 2] : undefined });
    segments.push({ t0: t + up, t1: t + up + down, from: top, to: bottom });
    t += up + down + rep.pause; level = bottom;
  }
  const end = t + 1500;
  const noiseR = rng(seed * 31 + 7);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - noiseR())) * Math.cos(2 * Math.PI * noiseR());
  let nextGlitch = -1; let glitchUntil = -1; let glitchValue = 0;
  return {
    truth,
    seconds: end / 1000,
    signal: (time) => {
      let v = 0;
      if (time >= 1500) {
        const seg = segments.find((s) => time >= s.t0 && time < s.t1);
        if (seg) {
          if (seg.gap && time >= seg.gap[0] && time <= seg.gap[1]) return null;
          const u = (time - seg.t0) / (seg.t1 - seg.t0);
          v = seg.from + (seg.to - seg.from) * (0.5 - 0.5 * Math.cos(Math.PI * u));
        } else {
          const last = [...segments].reverse().find((s) => time >= s.t1);
          v = last ? last.to : 0;
        }
      }
      v += noise * gauss();
      if (pattern === "noisy") {
        if (time > nextGlitch && nextGlitch >= 0) { glitchUntil = time + 33; glitchValue = (noiseR() - 0.5) * 120; nextGlitch = time + 1200 + noiseR() * 2500; }
        else if (nextGlitch < 0) nextGlitch = time + 2000;
        if (time < glitchUntil) v += glitchValue;
      }
      return v;
    },
  };
}

export type Counted = { reps: number; partial?: number };
export type CounterLike = { push: (value: number | null, t: number) => unknown; state: () => Counted };
/**
 * Plays a set into a counter the way the session does: every reading goes through the glitch guard and the smoothing first (`pipeline: false` feeds the raw signal,
 * as the first versions of this lab did).
 */
export function countSet(pattern: Pattern, seed: number, make: () => CounterLike, pipeline = true, fps = 30, cycleMs?: number): number {
  const { signal, seconds } = makeSet(pattern, seed, cycleMs);
  const counter = make();
  const guard = new HampelGuard(GLITCH_FLOOR.angle);
  const filter = new OneEuroFilter(1.0, 0.02, 1.0);
  // `fps`: how many pictures a second the phone manages (a slow phone sees a repetition in only a few pictures)
  for (let t = 0; t <= seconds * 1000; t += 1000 / fps) {
    const raw = signal(t);
    counter.push(raw === null || !pipeline ? raw : filter.filter(guard.push(raw, t).value, t), t);
  }
  return counter.state().reps;
}
export const oldCounter = (cfg: Partial<RepConfig> = {}) => () => new RepCounter({ rest: 0, target: TARGET, ...cfg });
