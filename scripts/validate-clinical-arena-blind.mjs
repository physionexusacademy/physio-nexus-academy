import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/clinical-arena/page.tsx");
const expanded = read("src/lib/clinical-arena-expanded.ts");

for (const text of [
  'data-pna-blind-case="v1"',
  'diagnosisUnlocked?item.title:',
  'data-pna-diagnosis-feedback={diagnosisUnlocked?"unlocked":"locked"}',
  'data-pna-clinical-review="v1"',
  '{diagnosisUnlocked?score:"—"} correct',
  '{diagnosisUnlocked?xp:"—"} XP',
  'item.safety&&diagnosisUnlocked',
  'setPreDiagnosisReview([])',
  'setCaseScore(0);setNotes([]);setBranchAnswers([])',
  'No spoilers before then.',
]) {
  assert(page.includes(text), "Blind clinical challenge guard missing: " + text);
}

assert(!page.includes('<h2 className="mt-3 text-2xl font-bold">{item.title}</h2>'),
  "Case condition shown directly in initial heading");
assert(page.includes('stage==="diagnosis"&&revealed'),
  "Unlock must happen only once a working diagnosis is submitted");
assert(page.includes('stages.indexOf(stage)<stages.indexOf("diagnosis")'),
  "Pre-diagnosis exam and differential reviews must be locked");
assert(page.includes('stage==="diagnosis"&&preDiagnosisReview.length>0'),
  "Earlier decisions must be reviewed only after diagnosis submission");

// Regression: submitting, moving to the next stage and resetting a case
// should return the student to the case heading instead of leaving them near the footer.
for (const marker of [
  'ref={casePanelRef} tabIndex={-1} id="clinical-arena-case"',
  'scroll-mt-28',
  'panel.scrollIntoView({',
  'panel.focus({preventScroll:true})',
  'if(scrollRequest===0)return;',
  'setRevealed(true);setScrollRequest(n=>n+1)',
  'function advance(){',
  'setCaseStart(Date.now());setScrollRequest(n=>n+1)',
]) {
  assert(page.includes(marker), "Case auto-scroll safeguard missing: " + marker);
}

assert(/function advance\(\)\{\s*setScrollRequest\(n=>n\+1\);/.test(page),
  "Stage transitions must also scroll back to the start of the case");

const start=expanded.indexOf("export const expandedCases");
const arrayStart=expanded.indexOf("=[",start);
const arrayEnd=expanded.indexOf(";\n",arrayStart);
assert(start>=0 && arrayStart>=0 && arrayEnd>arrayStart,
  "Expanded patient scenarios not readable");
const cases=JSON.parse(expanded.slice(arrayStart+1,arrayEnd));
assert.equal(cases.length,180,"Expected 180 expanded scenarios");
for(const c of cases){
  const condition=c.title.split(": Scenario")[0].toLowerCase();
  assert(!c.history.toLowerCase().includes(condition),
    c.id+": patient history directly gives away case title");
  assert(!c.clue.toLowerCase().includes(condition),
    c.id+": initial hint directly gives away case title");
}
console.log("Clinical Arena blind challenge validation passed: 180 expanded patient scenarios, diagnosis hidden in early UI, pre-diagnosis feedback and scores locked, answer review after Stage 4.");
