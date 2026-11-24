import assert from "node:assert/strict";
import { HampelGuard, OneEuroFilter, RepCounter, GLITCH_FLOOR } from "../src/lib/formcheck/index.ts";
import { CLEAN, HARSH, NORMAL, trial } from "./formcheck-faults.ts";
import { PATTERNS, REPS, TARGET, countSet, makeSet, type Pattern } from "./formcheck-replab.ts";
import { healthTip, lintCue, trackingHealth } from "../src/lib/formcheck/index.ts";
import { rng } from "./formcheck-synthetic.ts";

/**
 * Repetition counting, tested against how people really move. A user counted 25 repetitions and the tool showed 12 or 13; it missed one side; it did not notice that the
 * exercise had begun. The causes, each reproduced here before it was fixed (scripts/formcheck-replab.ts plays 25-repetition sets into the counter):
 *   - a repetition had to reach 70% of a fixed population target and come back to within 30% of rest: a weaker side, a shallow range, or a person who flows from one
 *     repetition into the next without fully returning, was not counted at all (flowing: 0 of 25, shallow: 0, one side weaker: 13, variable: 14 of 25);
 *   - nothing was counted until a "stay still" step had finished, and moving restarted it.
 * Now a repetition is a peak and a valley, wherever they are, shallow ones are counted and labelled as shallow, and a person who starts at once is counted from the start.
 * The tests also guard the other side: stillness, breathing, a tremor, fidgeting and a flickering track must not make repetitions.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert(condition, message); };
const SETS = 30;

/* 1. every way of moving, 25 repetitions, through the same guard and smoothing as the session */
for (const pattern of PATTERNS) {
  const counts: number[] = [];
  for (let s = 1; s <= SETS; s++) counts.push(countSet(pattern, s * 17, () => new RepCounter({ rest: 0, target: TARGET })));
  const exact = counts.filter((c) => c === REPS).length;
  const worst = Math.max(...counts.map((c) => Math.abs(c - REPS)));
  if (pattern === "variable") ok(worst <= 3 && exact >= SETS * 0.6, `${pattern}: repetitions that all differ are counted within 3 of 25, most exactly (${exact}/${SETS} exact, worst off by ${worst})`);
  else ok(exact >= SETS - 1 && worst <= 1, `${pattern}: 25 repetitions are counted as 25 (${exact}/${SETS} sets exact, worst off by ${worst})`);
}
{
  // per repetition on the hardest pattern: how many of the true repetitions were found
  let found = 0, total = 0;
  for (let s = 1; s <= SETS; s++) {
    const { signal, seconds, truth } = makeSet("variable", s * 17);
    const c = new RepCounter({ rest: 0, target: TARGET }); const g = new HampelGuard(GLITCH_FLOOR.angle); const f = new OneEuroFilter(1, 0.02, 1);
    for (let t = 0; t <= seconds * 1000; t += 1000 / 30) { const raw = signal(t); c.push(raw === null ? null : f.filter(g.push(raw).value, t), t); }
    const recs = c.state().records;
    for (const tr of truth) { total++; if (recs.some((r) => Math.abs(r.at - tr.at) < 600)) found++; }
  }
  ok(found / total >= 0.97, `variable: at least 97% of the true repetitions are found one by one (${found}/${total})`);
}

/* 2. the label: a shallow repetition is counted and says so */
{
  const shallow = countSetFull("shallow");
  ok(shallow.reps === REPS && shallow.partial === REPS, `shallow: every repetition is counted and every one is labelled shallow (${shallow.reps} reps, ${shallow.partial} shallow)`);
  const full = countSetFull("discrete");
  ok(full.reps === REPS && full.partial === 0, `full range: none is labelled shallow (${full.partial})`);
  const oneSide = countSetFull("oneside");
  ok(oneSide.reps === REPS && oneSide.partial >= 11 && oneSide.partial <= 13, `one side weaker: all 25 counted and the 12 shallow ones are labelled (${oneSide.partial} shallow)`);
}
function countSetFull(pattern: Pattern) {
  const { signal, seconds } = makeSet(pattern, 17);
  const c = new RepCounter({ rest: 0, target: TARGET }); const g = new HampelGuard(GLITCH_FLOOR.angle); const f = new OneEuroFilter(1, 0.02, 1);
  for (let t = 0; t <= seconds * 1000; t += 1000 / 30) { const raw = signal(t); c.push(raw === null ? null : f.filter(g.push(raw).value, t), t); }
  return c.state();
}

/* 3. nothing that is not a repetition is counted */
{
  const gaussOf = (r: () => number) => () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const quiet: Record<string, (t: number, g: () => number) => number> = {
    "standing still, ordinary noise": (_t, g) => 2.7 * g(),
    "standing still, strong noise": (_t, g) => 4.5 * g(),
    "breathing (0.3 Hz, 9% of the range)": (t, g) => 8 * Math.sin((2 * Math.PI * 0.3 * t) / 1000) + 2 * g(),
    "a tremor (6 Hz, 8% of the range)": (t, g) => 7 * Math.sin((2 * Math.PI * 6 * t) / 1000) + 2 * g(),
    "a restless person (steps of up to 20% of the range)": (t, g) => 18 * (rng(Math.floor(t / 400) * 977 + 3)() - 0.5) + 2 * g(),
    "tracking that flickers between rest and target at 5 Hz": (t) => (Math.floor(t / 100) % 2 === 0 ? 0 : TARGET),
  };
  for (const [name, fn] of Object.entries(quiet)) {
    let total = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const g = gaussOf(rng(seed * 29 + 1));
      const c = new RepCounter({ rest: 0, target: TARGET }); const gd = new HampelGuard(GLITCH_FLOOR.angle); const f = new OneEuroFilter(1, 0.02, 1);
      for (let t = 0; t <= 60000; t += 1000 / 30) c.push(f.filter(gd.push(fn(t, g)).value, t), t);
      total += c.state().reps;
    }
    ok(total === 0, `${name}: no repetition in 60 s (${total} over 12 runs)`);
  }
}

/* 3b. a hold with dips of the noise in the middle of it is one repetition, not several */
{
  const r = rng(5);
  const plateau = (t: number) => { const u = t % 9000; return u < 1200 ? (TARGET * u) / 1200 : u < 6400 ? TARGET : u < 7600 ? TARGET * (1 - (u - 6400) / 1200) : 0; };
  let total = 0; let sets = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const c = new RepCounter({ rest: 0, target: TARGET, holdMs: 5000 });
    for (let t = 0, n = 0; t < 9000 * 5 - 1500; t += 1000 / 30, n++) {
      // one reading in about every 29th and every 37th, in the middle of the plateau, drops by half the range (a dip of the noise that the guard does not see); never two in a row
      const mid = (t % 9000) > 1500 && (t % 9000) < 6200;
      const dip = mid && (((n + seed) % 29 === 0) !== ((n + seed + 1) % 37 === 0)) && (n + seed) % 29 === 0 ? -0.55 * TARGET : mid && (n + seed) % 37 === 0 && (n + seed) % 29 !== 1 ? -0.55 * TARGET : 0;
      c.push(plateau(t) + dip + 1.5 * (r() - 0.5), t);
    }
    sets += 1; total += c.state().reps;
  }
  ok(total === sets * 5, `a 5 s hold with one-reading dips in the middle is one repetition each time, never several (${total} reps in ${sets} sets of 5)`);
}

/* 3c. a slow phone: the same repetitions seen in only a few pictures a second. Each way of moving is counted exactly down to the frame rate below, which is where the
   movement itself becomes too fast to see (a 0.7 s repetition is only about three pictures at 4 a second: no method can resolve it). The first version of the counter, whose
   filters were counted in readings, lost flowing repetitions at 6 pictures a second, quick ones at 10 and very fast ones at 15. */
{
  const SLOW: [Pattern, number][] = [["discrete", 3], ["flowing", 3], ["shallow", 3], ["oneside", 3], ["quick", 6], ["fast", 10]];
  for (const [pattern, fps] of SLOW) {
    for (const rate of [30, 15, 10, 6, 4, 3].filter((r) => r >= fps)) {
      let exact = 0;
      for (let seed = 1; seed <= 20; seed++) if (countSet(pattern, seed * 17, () => new RepCounter({ rest: 0, target: TARGET }), true, rate) === REPS) exact++;
      ok(exact >= 19, `${pattern}: 25 repetitions counted exactly at ${rate} pictures a second (${exact}/20 sets)`);
    }
  }
  const worst = Math.max(...Array.from({ length: 20 }, (_, i) => Math.abs(countSet("variable", (i + 1) * 17, () => new RepCounter({ rest: 0, target: TARGET }), true, 6) - REPS)));
  ok(worst <= 4, `variable repetitions at 6 pictures a second: never more than 4 off (${worst})`);
  // a slow phone counts less, never wildly more: nothing is invented
  let most = 0;
  for (const pattern of PATTERNS) for (let seed = 1; seed <= 10; seed++) for (const rate of [6, 4, 3]) most = Math.max(most, countSet(pattern, seed * 17, () => new RepCounter({ rest: 0, target: TARGET }), true, rate) - REPS);
  ok(most <= 2, `on a slow phone no pattern is ever counted more than 2 above the truth (${most})`);
}

/* 3d. the advice a slow phone gives is true: a repetition that takes at least the time it asks for is counted */
{
  const levels = [[60, "good"], [30, "good"], [15, "good"], [14, "slow"], [8, "slow"], [7, "very-slow"], [3, "very-slow"], [2.5, "very-slow"], [2, "too-slow"], [1, "too-slow"]] as const;
  for (const [fps, level] of levels) ok(trackingHealth(fps).level === level, `${fps} pictures a second is "${level}" (${trackingHealth(fps).level})`);
  ok(trackingHealth(30).minRepSeconds === 0.7 && trackingHealth(10).minRepSeconds === 0.7 && trackingHealth(6).minRepSeconds === 1.2 && trackingHealth(4).minRepSeconds === 1.8 && trackingHealth(3).minRepSeconds === 2.4, "about seven pictures a repetition, never under 0.7 s: 0.7 s at 30 and 10 a second, 1.2 s at 6, 1.8 s at 4, 2.4 s at 3");
  ok(healthTip(trackingHealth(30)) === null && healthTip(trackingHealth(20)) === null, "a quick phone is told nothing");
  const tooSlow = healthTip(trackingHealth(1));
  ok(tooSlow !== null && /too slow/.test(tooSlow.en) && !/\d+(\.\d)? s for each/.test(tooSlow.en), "a phone that is too slow to follow is told so, not given an absurd repetition time");
  for (const fps of [12, 5]) {
    const tip = healthTip(trackingHealth(fps));
    ok(tip !== null && tip.en.length > 20 && tip.ru.length > 20, `a slower phone (${fps} a second) is told in both languages`);
    const wording = tip ? [...lintCue(tip.en), ...lintCue(tip.ru)].filter((p) => !p.startsWith("longer than")) : ["no tip"];
    ok(wording.length === 0, `the tip for ${fps} a second keeps to the wording rules (${wording.join("; ") || "ok"})`);
  }
  for (const fps of [10, 6, 4, 3]) {
    const cycle = trackingHealth(fps).minRepSeconds * 1000;
    let exact = 0;
    for (let seed = 1; seed <= 20; seed++) for (const pattern of ["flowing", "discrete"] as const) if (countSet(pattern, seed * 17, () => new RepCounter({ rest: 0, target: TARGET }), true, fps, cycle) === REPS) exact++;
    ok(exact >= 38, `at ${fps} pictures a second, repetitions that take the advised ${(cycle / 1000).toFixed(1)} s are counted exactly (${exact}/40 sets)`);
  }
}

/* 4. whole sets through the session with a misbehaving pose model, the person starting 1.5 s after "ready" */
for (const kind of ["chin-tuck", "glute-bridge"] as const) {
  const hist = (faults: typeof NORMAL) => { const counts: number[] = []; for (let s = 1; s <= 30; s++) counts.push(trial(kind, faults, 1000 + s * 7).reps); return counts; };
  const clean = hist(CLEAN); const normal = hist(NORMAL); const harsh = hist(HARSH);
  ok(clean.every((c) => c === 5), `${kind}: clean input, five of five every time`);
  ok(normal.filter((c) => c === 5).length >= 29, `${kind}: at the ordinary fault level at least 29 of 30 sets are counted exactly (${normal.filter((c) => c === 5).length})`);
  ok(harsh.filter((c) => Math.abs(c - 5) <= 1).length >= 27, `${kind}: even with ten times the measured jitter at least 27 of 30 sets are within one repetition (${harsh.filter((c) => Math.abs(c - 5) <= 1).length})`);
  ok(Math.min(...harsh) >= 3, `${kind}: the worst harsh set still counts 3 or more of 5 (${Math.min(...harsh)})`);
}

console.log(`Form Check repetitions: ${checks} checks passed (every way of moving, shallow labelled, no phantom repetitions, whole sets with a misbehaving pose model).`);
