/**
 * Checks the clinical calculators against worked examples (written by hand, not produced by the code under test).
 *   npm run validate:calculators
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  activityFactors, dailyEnergy, heartRateZones, karvonenTarget, loadAtPercent, maxHeartRate, mic, oneRepMax, outcomeChange, waistHipRatio,
} from "../src/lib/calculators.ts";

// heart rate: age 40 -> Tanaka 208 - 28 = 180, Fox 180
assert.equal(maxHeartRate(40), 180);
assert.equal(maxHeartRate(40, "fox"), 180);
assert.equal(maxHeartRate(60), 166); // 208 - 42
assert.equal(maxHeartRate(60, "fox"), 160);
// Karvonen: (180 - 60) x 0.6 + 60 = 132
assert.equal(karvonenTarget(180, 60, 0.6), 132);
assert.equal(karvonenTarget(180, 60, 0.8), 156);
const zones = heartRateZones(180, 60);
assert.equal(zones.length, 3);
assert.equal(zones[1].lowBpm, 132);
assert.ok(zones[0].highBpm < zones[1].lowBpm + 1 && zones[1].highBpm < zones[2].lowBpm + 1, "zones should rise");
assert.throws(() => karvonenTarget(180, 190, 0.6), RangeError);
assert.throws(() => karvonenTarget(180, 60, 1.2), RangeError);
assert.throws(() => maxHeartRate(0), RangeError);

// waist to hip: 90 / 100 = 0.90, raised for a man (>= 0.90), not for... woman threshold 0.85 so raised too
assert.deepEqual(waistHipRatio(90, 100, "male"), { ratio: 0.9, raised: true, threshold: 0.9 });
assert.equal(waistHipRatio(89, 100, "male").raised, false);
assert.equal(waistHipRatio(85, 100, "female").raised, true);
assert.equal(waistHipRatio(84, 100, "female").raised, false);
assert.throws(() => waistHipRatio(10, 100, "male"), RangeError);

// one-rep max: Epley 100 x 5 = 100 x (1 + 5/30) = 116.7 ; Brzycki 100 x 36 / 32 = 112.5 ; 1 rep returns the weight
assert.equal(oneRepMax(100, 5), 116.7);
assert.equal(oneRepMax(100, 5, "brzycki"), 112.5);
assert.equal(oneRepMax(80, 1), 80);
assert.equal(loadAtPercent(100, 75), 75);
assert.equal(loadAtPercent(116.7, 60), 70);
assert.throws(() => oneRepMax(100, 0), RangeError);
assert.throws(() => oneRepMax(100, 31), RangeError);
assert.throws(() => oneRepMax(100, 2.5), RangeError);

// energy: man 80 kg 180 cm 30 y -> 800 + 1125 - 150 + 5 = 1780 ; woman 60 kg 165 cm 30 y -> 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320
assert.equal(dailyEnergy("male", 80, 180, 30, "sedentary").bmr, 1780);
assert.equal(dailyEnergy("male", 80, 180, 30, "sedentary").maintenance, Math.round(1780 * activityFactors.sedentary));
assert.equal(dailyEnergy("female", 60, 165, 30, "moderate").bmr, 1320);
assert.throws(() => dailyEnergy("male", 80, 180, 12, "light"), RangeError);

// outcome change (published thresholds: NPRS 2 points or 30 percent, RMDQ 5 points, ODI 10 points)
assert.equal(mic.nprs.points, 2);
assert.equal(mic.rmdq.points, 5);
assert.equal(mic.odi.points, 10);
const a = outcomeChange("nprs", 7, 6);
assert.deepEqual(a, { change: -1, percent: -14.3, improved: true, worsened: false, important: false });
assert.equal(outcomeChange("nprs", 7, 5).important, true); // 2 points
assert.equal(outcomeChange("nprs", 3, 2).important, true); // 33 percent of the baseline although only 1 point
assert.equal(outcomeChange("rmdq", 16, 13).important, false); // 3 points, 18.8 percent
assert.equal(outcomeChange("rmdq", 16, 11).important, true); // 5 points
assert.equal(outcomeChange("odi", 40, 31).important, false); // 9 points, 22.5 percent
assert.equal(outcomeChange("odi", 40, 30).important, true); // 10 points
assert.equal(outcomeChange("nprs", 4, 6).worsened, true);
assert.equal(outcomeChange("nprs", 0, 0).percent, 0);
assert.throws(() => outcomeChange("nprs", 11, 5), RangeError);

// page: honest wording and no data leaves the browser
const page = fs.readFileSync("src/app/health-calculators/clinical/ClinicalCalculators.tsx", "utf8");
assert.match(page, /never replace|does not replace|not a substitute/i, "the page must say the calculators do not replace clinical judgement");
assert.doesNotMatch(page, /fetch\(|XMLHttpRequest|localStorage|sendBeacon/, "calculators must not send or store anything");
for (const needle of ["beta-blocker", "Tanaka", "10 repetitions", "Ostelo"]) assert.ok(page.includes(needle), `the page should mention ${needle}`);

assert.ok(fs.existsSync("src/app/health-calculators/page.tsx"), "/health-calculators needs its own hub page so the short address does not 404");

console.log("Clinical calculators checks passed: heart rate zones, waist-hip ratio, one-rep max, daily energy and outcome change, with worked examples and range checks.");
