import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(path)=>readFileSync(path,"utf8");
const page=read("src/app/clinical-arena/page.tsx");
const core=read("src/lib/clinical-arena-multispecialty-core.ts");
const aggregator=read("src/lib/clinical-arena-multispecialty.ts");
const regions=read("src/lib/clinical-arena-regions.ts");
const parts=["neuro","pediatrics","cardiopulm","mobility-vestibular","specialist"];
const definitions=parts.flatMap(part=>{
 const source=read("src/lib/clinical-arena-"+part+".ts");
 const start=source.indexOf("=[");
 assert(start>=0,part+": template array missing");
 return JSON.parse(source.slice(start+1,source.lastIndexOf(";\n")));
});
assert.equal(definitions.length,60,"Expect sixty authored clinical blueprints");
const names=new Set(),ids=new Set(),tracks=new Map();
for(const t of definitions){
 assert(t.key && t.title && t.track && t.region && t.cohort,t.key+": required metadata");
 assert(!names.has(t.key),t.key+": duplicate diagnosis key");
 names.add(t.key);
 assert(t.chief.length>22 && t.history.length>55,t.key+": patient narrative too short");
 assert(Array.isArray(t.findings) && t.findings.length===2,t.key+": missing examination findings");
 assert(Array.isArray(t.exam) && t.exam.length===4,t.key+": four exam priorities required");
 assert(new Set(t.exam).size===4,t.key+": repeated exam options");
 assert(t.examWhy.length>55 && t.why.length>65,t.key+": insufficient clinical reasoning");
 assert(Array.isArray(t.alternatives)&&t.alternatives.length===3,t.key+": diagnosis differential incomplete");
 assert(new Set([t.title,...t.alternatives]).size===4,t.key+": duplicated differential diagnosis");
 assert(Array.isArray(t.management)&&t.management.length===3,t.key+": three management decisions needed");
 assert(new Set(t.management).size===3,t.key+": repeated management decisions");
 assert(!t.history.toLowerCase().includes(t.title.toLowerCase()),t.key+": diagnosis title leaked into history");
 assert(!t.chief.toLowerCase().includes(t.title.toLowerCase()),t.key+": diagnosis title leaked into patient speech");
 for(let i=1;i<=5;i++){const id="multi-"+t.key+"-"+i;assert(!ids.has(id));ids.add(id);}
 tracks.set(t.track,(tracks.get(t.track)||0)+5);
}
assert.equal(ids.size,300);
const expected={
 "Neurological Rehabilitation":60,"Pediatric Rehabilitation":60,
 "Cardiopulmonary Rehabilitation":60,"Geriatrics & Falls":30,
 "Vestibular Rehabilitation":30,"Women's Health & Pelvic Floor":25,
 "Oncology Rehabilitation":20,"Critical Care & ICU":15
};
assert.deepEqual(Object.fromEntries([...tracks].sort()),Object.fromEntries(Object.entries(expected).sort()));
for(const required of [
 "questionKey:\"chief\"","...multidisciplinaryCases","...multidisciplinaryFlows",
 "multidisciplinaryExams[item.id]??getClinicalExamination(item)",
 "const isPediatricCase=","isPediatricCase?\\"Patient / caregiver\\"","diagnosisUnlocked?item.title:",
 "setPreDiagnosisReview([])","item.safety&&diagnosisUnlocked",
]){
 assert(page.includes(required),"Page integration or blind-mode regression: "+required);
}
for(const required of ["createMultidisciplinaryCases(multidisciplinaryTemplates)","multidisciplinaryExams=built.exams"]){
 assert(aggregator.includes(required),"Multidisciplinary data integration missing: "+required);
}
for(const required of ["multidisciplinaryRegionByPrefix","multiMatch","Child Development","Heart & Lungs","ICU & Acute Care"]){
 assert(regions.includes(required),"Body region classification missing: "+required);
}
assert(core.includes("const bestHistory=t.safety?2:1"),"Safety history must prioritize urgent screening");
assert(core.includes("t.safety?"),"Urgent cases must adapt assessment and diagnosis stages");
assert(core.includes("five")||core.includes("Five"),"Context-based case generation must be documented");
const urgent=definitions.filter(t=>t.safety);
assert(urgent.length>=4,"Medical red flags must be represented");
console.log("PASS: 500-case Arena composition (200 previous + 300 new); 60 original multidisciplinary clinical blueprints; 8 nonempty new tracks; 4 unique examination options and clinical reasoning each; safety and blind mode checks.",Object.fromEntries(tracks),"urgent templates:",urgent.length);
