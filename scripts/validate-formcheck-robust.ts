import assert from "node:assert/strict";
import { HampelGuard, assessAlignment, assessSetup, isStill, GLITCH_FLOOR, type Frame } from "../src/lib/formcheck/index.ts";
import { CLEAN, HARSH, NORMAL, score, trial } from "./formcheck-faults.ts";
import { cycles, frameFrom, play, rng, seatedSide } from "./formcheck-synthetic.ts";
import { FormCheckSession, specFor } from "../src/lib/formcheck/index.ts";

/**
 * How the tool copes when the pose model misbehaves, and the alignment screen. Everything is synthetic and seeded (deterministic): it shows the LOGIC survives faults that are
 * more generous than what was measured on the real model (see formcheck-faults.ts); it says nothing about accuracy on real bodies, which is the validation study's job.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert(condition, message); };

/* 1. the glitch guard */
{
  const run = (values: number[], floor = GLITCH_FLOOR.angle) => { const g = new HampelGuard(floor); return values.map((v) => g.push(v)); };
  const steady = Array.from({ length: 12 }, (_, i) => 20 + (i % 2 ? 0.4 : -0.4));
  ok(run(steady).every((r) => !r.rejected), "ordinary jitter is never touched");
  const spike = run([...steady, 62, ...steady]);
  ok(spike[steady.length].rejected && Math.abs(spike[steady.length].value - 20) < 1, "a one-frame jump is replaced by the recent median");
  ok(spike.filter((r) => r.rejected).length === 1, "and only that frame");
  const two = run([...steady, 62, 61, ...steady]);
  ok(two[steady.length].rejected && two[steady.length + 1].rejected, "a two-frame glitch is ignored too");
  const step = run([...steady, ...Array.from({ length: 12 }, () => 55)]);
  const flagged = step.slice(steady.length).findIndex((r) => !r.rejected);
  ok(flagged >= 0 && flagged <= 3, `a real, lasting movement is accepted within three frames (${flagged + 1})`);
  ok(Math.abs(step[steady.length + 8].value - 55) < 0.5, "and then followed exactly");
  const ramp = run(Array.from({ length: 30 }, (_, i) => i * 3));
  ok(ramp.every((r) => !r.rejected), "a steady fast movement (3 degrees a frame) is never taken for a glitch");
  ok(new HampelGuard(7).push(5).rejected === false, "the first values pass untouched");
}

/* 2. stillness is judged by the spread, not by the worst frame */
{
  const r = rng(11);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const jitter = Array.from({ length: 24 }, () => 30 + 1.0 * gauss());
  ok(isStill(jitter, 3), "readings that only jitter (1 degree) are still");
  ok(isStill([...jitter.slice(0, 12), 34.2, ...jitter.slice(13)], 3), "one frame that is 4 degrees off does not make a still person move");
  ok(!isStill([...Array.from({ length: 12 }, () => 30), ...Array.from({ length: 12 }, () => 38)], 3), "a step of 8 degrees is a movement");
  ok(!isStill(Array.from({ length: 24 }, (_, i) => 30 + i * 0.2), 3), "a slow drift of 4.6 degrees is a movement");
  ok(!isStill(Array.from({ length: 24 }, (_, i) => 30 + (i % 4 < 2 ? 0 : 12)), 3), "fidgeting is a movement");
  ok(isStill([1, 2], 3), "a window that is too short is not judged");
}

/* 3. the alignment screen agrees with the set-up check */
{
  const base = (over: Parameters<typeof frameFrom>[4] = {}, move: (x: number, y: number) => [number, number] = (x, y) => [x, y]): Frame => {
    const scene = seatedSide(() => ({}))(0);
    const lm = Object.fromEntries(Object.entries(scene.lm).map(([k, p]) => [k, move(p![0], p![1])])) as typeof scene.lm;
    return frameFrom(720, 1280, 0, lm, { far: scene.far, luma: 130, noise: 0, ...over });
  };
  const opts = { need: ["near:ear", "near:shoulder", "near:hip"] as const, view: "side" as const };
  const need = [...opts.need];
  const good = assessAlignment(base(), { ...opts, need }, 1);
  ok(good.score >= 90 && good.checks.every((c) => c.ok), `a person well placed scores 90 or more with every check ok (${good.score})`);
  ok(good.box !== null && good.box.x1 > good.box.x0 && good.issue === null, "the box around the body is given");
  const cases: { name: string; frame: Frame }[] = [
    { name: "too dark", frame: base({ luma: 30 }) },
    { name: "too bright", frame: base({ luma: 245 }) },
    { name: "off centre", frame: base({}, (x, y) => [x - 0.38, y]) },
    { name: "too far", frame: base({}, (x, y) => [0.5 + (x - 0.5) * 0.35, 0.5 + (y - 0.5) * 0.35]) },
    { name: "too close", frame: base({}, (x, y) => [0.5 + (x - 0.5) * 2.6, 0.5 + (y - 0.5) * 2.6]) },
    { name: "no person", frame: { t: 0, w: 720, h: 1280, lm: Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, v: 0 })), luma: 130 } },
  ];
  for (const c of cases) {
    const setup = assessSetup(c.frame, { ...opts, need });
    const a = assessAlignment(c.frame, { ...opts, need }, 1);
    ok(!setup.ok && !a.checks.every((k) => k.ok) && a.score <= 89, `${c.name}: the set-up check refuses and the screen shows a check not ok (score ${a.score})`);
    ok(a.issue === setup.issues[0], `${c.name}: both name the same first thing to fix (${a.issue})`);
  }
  ok(assessAlignment(cases[5].frame, { ...opts, need }, 0).score <= 8, "with nobody in view the score is near zero");
  const steadyHalf = assessAlignment(base(), { ...opts, need }, 0.5);
  ok(steadyHalf.score < good.score && steadyHalf.checks.find((c) => c.id === "steady")!.ok === false, "a position that has not yet been steady long enough scores lower and shows it");
  const nearly = assessAlignment(base({}, (x, y) => [0.5 + (x - 0.5) * 0.6, 0.5 + (y - 0.5) * 0.6]), { ...opts, need }, 1);
  ok(nearly.checks.find((c) => c.id === "distance")!.level < 1, "the distance gauge is not full until there is room on both sides");
}

/* 4. whole sets with a misbehaving pose model */
{
  const TRIALS = 40;
  for (const kind of ["chin-tuck", "glute-bridge"] as const) {
    const clean = [score(kind, CLEAN, false, 20), score(kind, CLEAN, true, 20)];
    ok(clean.every((s) => s.exact === s.trials), `${kind}: with clean input the guard changes nothing (${clean.map((s) => `${s.exact}/${s.trials}`).join(" and ")})`);
    const off = score(kind, NORMAL, false, TRIALS);
    const on = score(kind, NORMAL, true, TRIALS);
    ok(on.exact >= TRIALS * 0.93, `${kind}: five repetitions counted exactly in at least 93% of sets with ordinary glitches (${on.exact}/${on.trials})`);
    ok(on.falseReps <= 2 && on.neverReady === 0, `${kind}: at most 2 sets with a false extra repetition, and the neutral position is always taken (${on.falseReps}, never ready ${on.neverReady})`);
    ok(on.exact >= off.exact + TRIALS * 0.3, `${kind}: the guard is worth at least 30 points of correct sets (${off.exact} without, ${on.exact} with)`);
    ok(on.medianReadyMs <= 3000, `${kind}: the neutral position is taken within 3 s (${(on.medianReadyMs / 1000).toFixed(1)} s)`);
  }
  // a session made the way the page makes it (no options) has the guard on
  const byDefault = trial("chin-tuck", NORMAL, 1007);
  const switchedOff = trial("chin-tuck", NORMAL, 1007, false);
  ok(byDefault.glitches > 0 && switchedOff.glitches === 0, `a session made without options ignores glitches (${byDefault.glitches} ignored; none when switched off)`);
  const harsh = Array.from({ length: TRIALS }, (_, i) => trial("chin-tuck", HARSH, 1000 + (i + 1) * 7).reps);
  const within = harsh.filter((c) => Math.abs(c - 5) <= 1).length;
  ok(within >= TRIALS * 0.9, `chin tuck: even with ten times the measured jitter and frequent glitches, nine sets in ten are within one repetition of five (${within}/${TRIALS}; exact counts are in validate-formcheck-reps.ts)`);
}

/* 5. a slow phone: fewer pictures a second must not stop the neutral position or the counting */
{
  for (const fps of [3, 5, 8, 15, 30]) {
    const stride = Math.round(30 / fps);
    const session = new FormCheckSession(specFor("chin-tuck")!);
    let n = 0; let readyAt: number | null = null;
    // five held chin tucks; the person starts 2 s after the tool says ready
    let startAt = Number.POSITIVE_INFINITY;
    const scene = seatedSide((t) => ({ earBack: 0.05 * cycles(t, startAt, 1000, 5200, 1000, 1500, 5) }));
    play(scene, 720, 1280, 70, (frame) => {
      if (n++ % stride !== 0) return;
      const state = session.push(frame);
      if (readyAt === null && state.phase === "active") { readyAt = frame.t; startAt = frame.t + 2000; }
    }, { seed: 3 });
    const summary = session.finish();
    ok(readyAt !== null && readyAt <= 5000, `${fps} pictures a second: the neutral position is taken (${readyAt === null ? "never" : Math.round(readyAt) + " ms"})`);
    ok(summary.reps === 5, `${fps} pictures a second: five repetitions are counted as five (${summary.reps})`);
  }
}

console.log(`Form Check robustness: ${checks} checks passed (glitch guard, stillness by spread, alignment screen, sets with a misbehaving pose model).`);
