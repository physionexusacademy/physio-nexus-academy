/** League display rules (zones, advice, countdown, compact rows): node --experimental-strip-types scripts/validate-league.ts */
import assert from "node:assert/strict";
import { adviceFor, compactRows, countdownText, resultCopy, tierInfo, timeLeft, TIERS, zoneOf, type LeagueReady } from "../src/lib/student/league.ts";

let n = 0;
const ok = (name: string) => { n++; console.log("PASS", name); };
const rows = (xps: number[]) => xps.map((xp, i) => ({ rank: i + 1, name: `S${i + 1}`, xp, me: false }));
function league(xps: number[], rank: number, extra: Partial<LeagueReady> = {}): LeagueReady {
  const standings = rows(xps).map((r) => ({ ...r, me: r.rank === rank }));
  const size = xps.length;
  return { enabled: true, week_start: "2026-11-16", ends_at: "2026-11-23T00:00:00+05:00", tier: 3, best_tier: 3, size, rank, xp: xps[rank - 1], practice: size < 5,
    promote_n: size >= 5 ? Math.ceil(size * 0.3) : 0, demote_n: size >= 5 ? Math.floor(size * 0.2) : 0, promote_min_xp: 100, standings, history: [], ...extra };
}

assert.equal(TIERS.length, 7); assert.equal(tierInfo(1).name, "Bronze"); assert.equal(tierInfo(7).name, "Diamond"); assert.equal(tierInfo(99).name, "Diamond"); assert.equal(tierInfo(0).name, "Bronze"); ok("seven tiers, clamped lookups");

const xps = [500, 400, 300, 250, 200, 150, 100, 60, 20, 5]; // size 10: promote top 3, demote bottom 2
assert.equal(zoneOf(league(xps, 2)), "promote");
assert.equal(zoneOf(league([90, 80, 70, 60, 50, 40, 30, 20, 10, 5], 1)), "promote-locked");
assert.equal(zoneOf(league(xps, 5)), "safe");
assert.equal(zoneOf(league(xps, 9)), "danger"); assert.equal(zoneOf(league(xps, 10)), "danger"); assert.equal(zoneOf(league(xps, 8)), "safe");
assert.equal(zoneOf(league(xps, 10, { tier: 1, demote_n: 0 })), "safe");
assert.equal(zoneOf(league([50, 20], 2)), "practice"); ok("zones follow the database rules");

assert.match(adviceFor(league(xps, 5)).en, /^\d+ XP to reach the promotion zone for Platinum/);
assert.match(adviceFor(league(xps, 5)).en, /^101 XP to reach the promotion zone for Platinum/);
assert.match(adviceFor(league(xps, 9)).en, /41 XP gets you out/); // first safe rank 8 = 60 → 60 − 20 + 1
assert.match(adviceFor(league(xps, 1)).en, /promotion zone for Platinum/);
assert.match(adviceFor(league([90, 80, 70, 60, 50, 40, 30, 20, 10, 5], 1)).en, /needs 100 XP this week — 10 more/);
assert.match(adviceFor(league([50, 20], 2)).en, /invite a classmate/);
assert.match(adviceFor(league([100, 0, 0, 0, 0], 3, { xp: 0 })).en, /first XP/);
assert.ok(adviceFor(league(xps, 5)).ur.includes("XP chahiye")); ok("advice names the exact XP gap, in English and Roman Urdu");

assert.match(resultCopy("promoted", 2, 1).en, /Promoted.*Gold/); assert.match(resultCopy("demoted", 3, 9).en, /dropped to Silver/); assert.equal(resultCopy("stayed", 4, 5).tone, "flat"); assert.match(resultCopy("practice", 1, 1).en, /too small/); ok("last-week results read clearly");

const end = "2026-11-23T00:00:00+05:00"; const at = (s: string) => Date.parse(s);
assert.deepEqual(timeLeft(end, at("2026-11-20T18:30:00+05:00")), { done: false, days: 2, hours: 5, minutes: 30 });
assert.equal(countdownText(end, at("2026-11-20T18:30:00+05:00")), "2d 05h"); assert.equal(countdownText(end, at("2026-11-22T20:15:00+05:00")), "3h 45m"); assert.equal(countdownText(end, at("2026-11-22T23:50:00+05:00")), "10m"); assert.equal(timeLeft(end, at("2026-11-23T00:00:01+05:00")).done, true); ok("countdown to Sunday midnight Pakistan time");

const big = rows(Array.from({ length: 30 }, (_, i) => 300 - i * 5));
assert.deepEqual(compactRows(big, 15).map((r) => r.rank), [1, 2, 3, 14, 15, 16]); assert.deepEqual(compactRows(big, 1).map((r) => r.rank), [1, 2, 3]); assert.deepEqual(compactRows(big, 30).map((r) => r.rank), [1, 2, 3, 29, 30]); ok("compact card: top three plus me and neighbours");
console.log(`\n${n} league display checks passed.`);
