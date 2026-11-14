/** RehabVerse follow-up helpers: node --experimental-strip-types scripts/validate-rehabverse-followup.ts */
import assert from "node:assert/strict";
import { checkinStates, painTrend, WINDOWS } from "../src/lib/rehabverse/followup.ts";
import type { HistoryDay } from "../src/lib/rehabverse/api-types.ts";

let n = 0; const ok = (m: string) => { n++; console.log("PASS", m); };
const H = 3_600_000; const t0 = Date.parse("2026-11-16T08:00:00Z");
const day = (d: number, obs: Record<string, number>, extra: Partial<HistoryDay> = {}): HistoryDay => ({
  session_id: "s" + d, day_number: d, title: "Day", status: "reviewed", released_at: null, completion: "all", submitted_at: new Date(t0 + d * 24 * H).toISOString(), difficulty: 3,
  observations: Object.entries(obs).map(([timepoint, pain]) => ({ timepoint: timepoint as never, pain, function_score: null, symptom_response: null, recorded_at: "" })), ...extra });

/* windows mirror the database function */
assert.deepEqual(WINDOWS, { later_same_day: [2, 20], "24h": [18, 72], "48h": [40, 120] }); ok("check-in windows match the database rule");

const d = day(1, { immediately_after: 4, later_same_day: 3 });
const at = (h: number) => Date.parse(d.submitted_at!) + h * H;
let s = checkinStates(d, ["later_same_day", "24h", "48h"], at(1));
assert.deepEqual(s.map((x) => x.state), ["done", "soon", "soon"]);
s = checkinStates(d, ["later_same_day", "24h", "48h"], at(20));
assert.deepEqual(s.map((x) => x.state), ["done", "open", "soon"]);
s = checkinStates(d, ["24h", "48h"], at(60)); assert.deepEqual(s.map((x) => x.state), ["open", "open"]);
s = checkinStates(d, ["24h", "48h"], at(80)); assert.deepEqual(s.map((x) => x.state), ["missed", "open"]);
s = checkinStates(d, ["24h", "48h"], at(130)); assert.deepEqual(s.map((x) => x.state), ["missed", "missed"]);
assert.equal(checkinStates(d, ["later_same_day"], at(1))[0].pain, 3);
assert.deepEqual(checkinStates({ ...d, completion: "none" }, ["24h"], at(30)), []); assert.deepEqual(checkinStates({ ...d, submitted_at: null }, ["24h"], at(30)), []); ok("check-ins are done, open, soon or missed — and skipped for days that were not done");

assert.equal(painTrend([], null).verdict, "building");
assert.equal(painTrend([day(1, { immediately_after: 5 })], 7).verdict, "building");
const improving = painTrend([day(1, { before: 6, immediately_after: 6 }), day(2, { immediately_after: 4 }), day(3, { immediately_after: 3 }), day(4, { immediately_after: 2 })], 7);
assert.equal(improving.verdict, "improving"); assert.equal(improving.start, 7); assert.equal(improving.now, 2); assert.ok(improving.change! <= -1.5);
assert.equal(painTrend([day(1, { immediately_after: 5 }), day(2, { immediately_after: 5 }), day(3, { immediately_after: 4 })], 5).verdict, "steady");
const worse = painTrend([day(1, { immediately_after: 3 }), day(2, { immediately_after: 5 }), day(3, { immediately_after: 6 })], 3);
assert.equal(worse.verdict, "higher");
assert.deepEqual(painTrend([day(1, { before: 4 }), day(2, { during: 3 }), day(3, {}), day(4, { immediately_after: 2 })], null).points.map((p) => p.value), [4, 3, 2]);
assert.equal(painTrend([day(1, { immediately_after: 4 }, { submitted_at: null })], 5).points.length, 1); ok("pain trend: building, improving, steady, higher; one value per logged day");
console.log(`\n${n} follow-up checks passed.`);
