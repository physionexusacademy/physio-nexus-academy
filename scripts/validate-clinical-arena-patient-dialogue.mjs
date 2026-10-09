import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { expandedCases } from "../src/lib/clinical-arena-expanded.ts";
import {
  patientAnswer,
  naturalPatientSpeech,
  PATIENT_DIALOGUE_VARIANTS_PER_CASE,
} from "../src/lib/clinical-arena-patient-dialogue.ts";

const page=readFileSync("src/app/clinical-arena/page.tsx","utf8");
const regular=expandedCases.filter(c=>!c.safety);
const urgent=expandedCases.filter(c=>c.safety);
const unique=new Set();

assert.equal(expandedCases.length,180);
assert.equal(PATIENT_DIALOGUE_VARIANTS_PER_CASE,12);
for(const c of regular){
  const answers=new Set();
  for(let visit=0;visit<PATIENT_DIALOGUE_VARIANTS_PER_CASE;visit++){
    const line=patientAnswer({
      caseId:c.id,questionKey:"onset",clinicalAnswer:c.history,
      encounter:visit,urgent:false,allowHumor:true,
    });
    assert(line.startsWith(naturalPatientSpeech(c.history)),`${c.id}: core facts changed`);
    assert(line.length>naturalPatientSpeech(c.history).length,`${c.id}: humor missing`);
    answers.add(line);
    unique.add(line);
  }
  assert.equal(answers.size,PATIENT_DIALOGUE_VARIANTS_PER_CASE,
    `${c.id}: repeated visits should rotate dialogue`);
}
assert(unique.size>=1000,`Only ${unique.size} unique patient replies`);

for(const c of urgent){
  for(let visit=0;visit<12;visit++){
    const line=patientAnswer({
      caseId:c.id,questionKey:"onset",clinicalAnswer:c.history,
      encounter:visit,urgent:true,allowHumor:true,
    });
    assert.equal(line,naturalPatientSpeech(c.history),
      `${c.id}: serious red-flag case must never contain jokes`);
  }
}
for(const required of [
  'const rawFlow=item?flows[item.id]:undefined',
  'questionKey:"chief"',
  'questionKey:"history-"+i',
  'questionKey:"onset"',
  'questionKey:"function"',
  'rotatePatientConversation()',
  'urgent:!!item.safety',
  'everydayImpact(item.history)',
  'pna-arena-dialogue-encounters-v1',
]){
  assert(page.includes(required),`Patient dialogue integration missing: ${required}`);
}
assert(!page.includes('a:item.clue'),"Clinician hint must not masquerade as patient speech");
console.log(`PASS: ${unique.size} distinct clinically faithful funny patient answers across ${regular.length} routine scenarios (${PATIENT_DIALOGUE_VARIANTS_PER_CASE} per scenario). ${urgent.length} red-flag scenarios remain serious. Repeat visits rotate replies; no hidden clinician hint as patient answer.`);
