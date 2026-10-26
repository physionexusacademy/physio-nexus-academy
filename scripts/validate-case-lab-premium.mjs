import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(path,"utf8");
const catalog=read("src/lib/case-lab-catalog.ts");
const library=read("src/app/case-lab/CaseLabLibrary.tsx");
const experience=read("src/app/case-lab/CaseLabTeachingExperience.tsx");
const style=read("src/app/case-lab/case-lab.css");
const index=read("src/lib/clinical-case-index.ts");
const core=read("src/lib/case-lab-msk-core.ts");
const expanded=read("src/lib/clinical-arena-expanded.ts");
const templateFiles=[
 "src/lib/clinical-arena-neuro.ts",
 "src/lib/clinical-arena-pediatrics.ts",
 "src/lib/clinical-arena-cardiopulm.ts",
 "src/lib/clinical-arena-mobility-vestibular.ts",
 "src/lib/clinical-arena-specialist.ts"
].map(read);

const block=catalog.match(/const curatedCaseIds = new Set<string>\(\[([\s\S]*?)\]\);/);
assert(block,"Curated 50-case allowlist missing");
const selected=[...block[1].matchAll(/"([^"]+)"/g)].map(match=>match[1]);
assert.equal(selected.length,50,"Case Lab must launch with exactly 50 curated cases");
assert.equal(new Set(selected).size,50,"Curated case list contains duplicate IDs");

const available=new Set();
for(const match of index.matchAll(/slug:\s*"([^"]+)"/g))available.add("deep-"+match[1]);
for(const match of core.matchAll(/id:"([^"]+)"/g))available.add(match[1]);
for(const match of expanded.matchAll(/"id":"([^"]+)"/g))available.add(match[1]);
for(const source of templateFiles){
 const keys=[...source.matchAll(/"key":\s*"([^"]+)"/g)].map(match=>match[1]);
 for(const key of keys)for(let i=1;i<=5;i++)available.add("multi-"+key+"-"+i);
}
for(const id of selected)assert(available.has(id),"Curated case ID does not exist in source data: "+id);

assert(catalog.includes("rawLabCaseCards.filter(c=>curatedCaseIds.has(c.id))"),"The public Case Lab catalog must use the curated allowlist");
assert(library.includes('data-pna-case-lab="curated-clinical-files-v2"'),"New clinical case library is not connected");
assert(library.includes("Clinical Case Library")&&library.includes("Search a condition, symptom or patient story"),"Clean case library search is missing");
assert(!library.includes("Today’s clinic — start here")&&!library.includes("cl-ministat"),"Remove repeated dashboard cards and duplicate starter rail");
assert(experience.includes('data-pna-case-lab-lesson="continuous-clinical-file-v3"'),"Continuous case file renderer missing");
for(const section of ["The patient arrives","The consultation","Physical examination","Clinical reasoning","Management decision","Follow-up and reassessment","Evidence and references"]){
 assert(experience.includes(section),"Clinical narrative section missing: "+section);
}
assert(experience.includes("dialogueHistory.map"),"Patient/physiotherapist dialogue must use authored history pairs");
assert(experience.includes("story.findings"),"Case reader must show case-provided findings");
assert(experience.includes("story.references"),"Case reader must expose case-specific references when available");
assert(experience.includes("no measured recovery outcome is assumed"),"Reader must not invent follow-up outcomes");
assert(experience.includes("Clinical notes")&&experience.includes("story.guide"),"Detailed authored teaching notes should remain available");
assert(style.includes(".cl-case-row")&&style.includes(".cl-case-dialogue-turn")&&style.includes(".cl-case-section-title"),"Minimal clinical-file styles are missing");
assert(catalog.includes('"multi-neuro-parkinson-1"')&&catalog.includes('"multi-peds-torticollis-1"'),"Specialty variety missing from curated cases");

console.log("PASS PNA Case Lab: exactly 50 curated case IDs, all mapped to existing case sources.");
console.log("PASS PNA Case Lab: compact case library, continuous consultation narrative, documented findings, transparent follow-up and reference display.");
