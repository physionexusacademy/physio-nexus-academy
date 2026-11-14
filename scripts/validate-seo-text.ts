/** Title/description helpers: node --experimental-strip-types scripts/validate-seo-text.ts */
import assert from "node:assert/strict";
import { bareTitle, fitDescription, fitTitle } from "../src/lib/seo/text.ts";
let n = 0; const ok = (m: string) => { n++; console.log("PASS", m); };

assert.equal(fitTitle("Lateral Epicondylalgia"), "Lateral Epicondylalgia");
assert.equal(bareTitle("Cervical SNAG | Regional Manual Therapy | Physio Nexus Academy"), "Cervical SNAG | Regional Manual Therapy");
assert.equal(bareTitle("Something | Physio Nexus Academy"), "Something"); assert.equal(bareTitle("Something | PNA Teacher"), "Something"); ok("brand suffixes the layout adds again are removed");

const long = "Greater Trochanteric Pain Syndrome (GTPS) — Assessment, Treatment Plan & Rehab Stages";
assert.equal(fitTitle(long), "Greater Trochanteric Pain Syndrome (GTPS)"); assert.ok(fitTitle(long, 70).endsWith("Assessment, Treatment Plan & Rehab Stages") === false || fitTitle(long, 90) === long); ok("keeps whole segments that fit and drops trailing qualifiers");
const paper = "The Effectiveness of Physiotherapy Rehabilitation in an Adult With Multiple Joint Fractures - A Case Report of a Complex Recovery";
const cut = fitTitle(paper, 54); assert.ok(cut.length <= 54 && !cut.endsWith(" ") && !/[,;:\-—]$/.test(cut) && paper.startsWith(cut.split(" ").slice(0, 3).join(" "))); ok("long single-segment titles are cut at a word boundary");
for (const t of ["A".repeat(120), "Word ".repeat(40), "x — " + "y".repeat(100)]) assert.ok(fitTitle(t, 54).length <= 54); ok("never longer than the limit");

assert.ok(fitDescription("Thoracic stiffness").length >= 70); assert.match(fitDescription("Thoracic stiffness"), /^Thoracic stiffness\. Free physiotherapy learning/);
const d = fitDescription("First sentence is short. Second sentence carries on for a while with extra detail about the method, the safety checks and the evidence behind it, then goes on well past the limit of a snippet.");
assert.ok(d.length <= 158 && d.length >= 70); assert.ok(/[.…]$/.test(d)); assert.equal(fitDescription("x ".repeat(200)).length <= 158, true); ok("descriptions are 70–158 characters and end cleanly");
console.log(`\n${n} SEO text checks passed.`);
