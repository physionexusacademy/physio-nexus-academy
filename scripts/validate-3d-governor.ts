import assert from "node:assert/strict";
import { ResolutionGovernor, RATIOS, CLEAN_SECONDS_BEFORE_TRIAL } from "../src/lib/virtual-patient/quality.ts";

/**
 * The 3D resolution governor is a feedback loop between a device's speed and the picture's resolution. This runs it against simulated devices (frame time
 * as a function of the resolution level) and checks what matters for smooth movement: it climbs on a fast device, settles on a medium one without
 * oscillating, drops on a slow one within seconds, is not fooled by one stall, and never judges a pause or the first moments after a load.
 */
let checks = 0;
const ok = (condition: boolean, message: string) => { checks++; assert.ok(condition, message); };

type Result = { level: number; changes: { t: number; level: number; trial: boolean }[]; lastResorts: number; trials: number; failedTrials: number; gov: ResolutionGovernor };

/** Runs `seconds` of animation. `ms(level, t)` is the time one frame takes at a level; the screen shows at most 60 frames a second (16.7 ms), or `refresh` ms. */
function simulate(opts: { start: number; cap: number; seconds: number; ms: (level: number, t: number) => number; refresh?: number; settleMs?: number; stalls?: [number, number][] }): Result {
  const gov = new ResolutionGovernor(opts.start, opts.cap);
  let now = 10_000;
  const t0 = now;
  gov.settle(now, opts.settleMs ?? 2500);
  const changes: Result["changes"] = [];
  let lastResorts = 0, trials = 0, failedTrials = 0;
  const stalls = [...(opts.stalls ?? [])];
  while (now - t0 < opts.seconds * 1000) {
    let gap = Math.max(opts.refresh ?? 16.7, opts.ms(gov.level, now - t0));
    if (stalls.length && now - t0 >= stalls[0][0]) gap = stalls.shift()![1];
    now += gap;
    const action = gov.frame(gap, now);
    if (action === "last-resort") lastResorts++;
    else if (action) {
      if (action.trial) trials++;
      else if (action.level < gov.level && changes.length && changes[changes.length - 1].trial) failedTrials++;
      changes.push({ t: (now - t0) / 1000, level: action.level, trial: action.trial });
      gov.applied(action.level, now);
    }
  }
  return { level: gov.level, changes, lastResorts, trials, failedTrials, gov };
}

ok(RATIOS.every((r, i) => i === 0 || r > RATIOS[i - 1]) && RATIOS[0] >= 0.6 && RATIOS[RATIOS.length - 1] <= 2, "levels rise from 0.6 to at most 2");

// A fast device: it climbs to the highest level it may use, in steps of one, and does not come back down
const fast = simulate({ start: 3, cap: 5, seconds: 30, ms: () => 6 });
ok(fast.level === 5, `fast device ends at its highest level (got ${fast.level})`);
ok(fast.changes.every((c) => c.trial) && fast.changes.length === 2, `fast device: two steps up, no step down (${fast.changes.length} changes)`);
ok(fast.changes[0].t >= CLEAN_SECONDS_BEFORE_TRIAL && fast.changes[0].t < 12, `fast device: the first step up comes after a few clean seconds, not at once (at ${fast.changes[0].t.toFixed(1)} s)`);

// A medium device: the next level up costs 22.75 ms, which cannot hold: tried once, taken back, never tried again
const medium = simulate({ start: 3, cap: 5, seconds: 90, ms: (level) => 4 + 12 * RATIOS[level] ** 2 });
ok(medium.level === 3, `medium device settles at the level that holds (got ${medium.level})`);
ok(medium.trials === 1 && medium.failedTrials === 1 && medium.gov.lockedFrom === 4, `medium device: one failed trial, taken back, not repeated (${medium.trials} trials)`);
ok(medium.changes.length === 2, `medium device does not oscillate (${medium.changes.length} changes in 90 s)`);

// A slow device: far too slow at the start level; it drops within a few seconds and stays
const slow = simulate({ start: 3, cap: 5, seconds: 40, ms: (level) => 6 + 40 * RATIOS[level] ** 2 });
ok(slow.level === 0, `slow device ends at the lowest level (got ${slow.level})`);
ok(slow.changes[0].t <= 4.5 && slow.lastResorts === 0, `slow device: the first drop comes within about four seconds (${slow.changes[0].t.toFixed(1)} s), and no last resort`);
ok(slow.changes.every((c) => !c.trial), "slow device never tries to climb");

// A device that cannot keep up at any level: the last resort is asked for, once per report, and the level stays at the floor
const weak = simulate({ start: 3, cap: 5, seconds: 30, ms: () => 80 });
ok(weak.level === 0 && weak.lastResorts >= 1, `a device that cannot keep up at the lowest level asks for the last resort (${weak.lastResorts})`);

// One stall (a shader being linked, a garbage collection) lowers nothing; neither does a short stall every ten seconds
const stalled = simulate({ start: 3, cap: 3, seconds: 40, ms: () => 6, stalls: [[12_000, 500]] });
ok(stalled.changes.length === 0 && stalled.level === 3, "a single half-second stall changes nothing");
const periodic = simulate({ start: 3, cap: 3, seconds: 60, ms: () => 6, stalls: [[10_000, 300], [20_000, 300], [30_000, 300], [40_000, 300], [50_000, 300]] });
ok(periodic.changes.length === 0, "a short stall every ten seconds changes nothing");

// A screen limited to 30 frames a second (power saving) is slow, but not "far too slow": it steps down, without the last resort
const throttled = simulate({ start: 3, cap: 5, seconds: 40, ms: () => 6, refresh: 33.3 });
ok(throttled.level === 0 && throttled.lastResorts === 0, "a 30 Hz screen steps down to the lowest level and never asks for the last resort");

// The first moments after a load are not judged, and a pause or a hidden tab is not a measurement
const settling = simulate({ start: 3, cap: 5, seconds: 4, ms: () => 60, settleMs: 5000 });
ok(settling.changes.length === 0, "nothing is judged while the picture is settling after a load");
const gov = new ResolutionGovernor(3, 5);
let now = 1000;
let acted = 0;
for (let i = 0; i < 40; i++) { now += 2000; if (gov.frame(2000, now) !== null) acted++; }
ok(acted === 0, "gaps of a second and a half or more (a pause, a hidden tab) are not measurements");

// The highest level can be capped (light mode) and is never passed
const capped = simulate({ start: 3, cap: 3, seconds: 40, ms: () => 6 });
ok(capped.level === 3 && capped.changes.length === 0, "light mode (cap at 1x) never climbs above it");

// A level that has proved itself is reported once, for the caller to remember
const proving = new ResolutionGovernor(3, 3);
let reported = 0;
let t = 5000;
proving.settle(0, 0);
for (let i = 0; i < 400; i++) { t += 16.7; proving.frame(16.7, t); if (proving.provenLevel !== null) reported++; }
ok(reported >= 1 && reported <= 4, `a level that held for two clean seconds is reported for remembering (${reported})`);

console.log(`3D governor: ${checks} checks passed (climbs on a fast device, settles on a medium one without oscillating, drops on a slow one within seconds, ignores a single stall, a pause or the first moments after a load).`);
