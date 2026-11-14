/** Symptom checker transparency features: node --experimental-strip-types scripts/validate-msk-transparency.ts */
import assert from "node:assert/strict";
import { allConditionRules, featureLabels, getCarePriority, getImagingNotice, getOverlapNote, regions, scoreConditions, type RegionId } from "../src/lib/msk-symptom-checker.ts";
import { buildSummaryText } from "../src/lib/msk-symptom-summary.ts";

let n = 0; const ok = (m: string) => { n++; console.log("PASS", m); };
const HISTORY = /^(age_|onset_|duration_|impact_)/;

// every pattern: counts are consistent and "missing" only offers real, unticked, non-history features
for (const rule of allConditionRules) {
  const selected = new Set(Object.keys(rule.weights).filter((f) => !HISTORY.test(f)).slice(0, 2));
  selected.add("age_40_59"); selected.add("onset_gradual"); selected.add("duration_subacute"); selected.add("impact_moderate");
  const hit = scoreConditions(rule.region, selected).find((r) => r.condition.id === rule.id);
  if (!hit) continue;
  assert.ok(hit.matchedCount >= 1 && hit.matchedCount <= hit.featureCount, `${rule.id}: counts`);
  assert.equal(hit.featureCount, Object.keys(rule.weights).length);
  assert.ok(hit.missing.length <= 2);
  for (const label of hit.missing) {
    const id = [...featureLabels.entries()].find(([, l]) => l === label)?.[0] as string;
    assert.ok(!selected.has(id) && !HISTORY.test(id) && rule.weights[id] >= 3, `${rule.id}: missing "${label}" must be a strong, unreported symptom feature`);
  }
}
ok(`all ${allConditionRules.length} patterns report consistent counts and sensible "what was not reported"`);

// overlap note
const fake = (a: number, b: number) => [{ score: a, condition: { plainName: "Outer hip tendon pain" } }, { score: b, condition: { plainName: "Hip arthritis pattern" } }] as never;
assert.equal(getOverlapNote(fake(9, 6)), null); assert.equal(getOverlapNote([]), null);
assert.match(getOverlapNote(fake(8, 7)) ?? "", /Outer hip tendon pain and hip arthritis pattern look very similar/); ok("close calls are flagged, clear winners are not");

// care priority with pain
const mild = new Set(["impact_mild"]);
assert.equal(getCarePriority(mild).label, "Monitor and assess as needed");
assert.equal(getCarePriority(mild, 7).label, "Monitor and assess as needed");
assert.equal(getCarePriority(mild, 8).label, "Prompt professional assessment recommended");
assert.equal(getCarePriority(mild, null).label, "Monitor and assess as needed");
assert.equal(getCarePriority(new Set(["impact_high"]), 2).label, "Prompt professional assessment recommended"); ok("pain 8+/10 raises the care priority; lower ratings never lower it");

// the summary
const region = regions.find((r) => r.id === ("knee" as RegionId))!;
const selected = new Set(["age_18_39", "onset_trauma", "duration_acute", "impact_moderate", "clue_knee_no4steps"]);
const results = scoreConditions("knee", selected);
const text = buildSummaryText({ region, selected, pain: 6, results, priority: getCarePriority(selected, 6), imaging: getImagingNotice("knee", selected), flagIds: new Set(), date: new Date("2026-11-16T10:00:00Z") });
assert.match(text, /Main area: Knee/); assert.match(text, /Pain right now: 6\/10/); assert.match(text, /16 November 2026/); assert.match(text, /not a diagnosis/); assert.match(text, /Safety warnings: none selected/);
assert.match(text, /Fracture screening: Knee X-ray assessment may be indicated/);
const flagged = buildSummaryText({ region, selected, pain: null, results, priority: getCarePriority(selected), imaging: null, flagIds: new Set(["rf_dvt"]) });
assert.match(flagged, /Safety warnings I selected/); assert.match(flagged, /calf swelling/); assert.ok(!/Patterns that fit/.test(flagged), "no patterns are listed once a safety warning is selected"); ok("the copyable summary lists answers, safety status and patterns — and stops at a safety warning");
console.log(`\n${n} transparency checks passed.`);
