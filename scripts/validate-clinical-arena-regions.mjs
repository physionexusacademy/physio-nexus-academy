import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  regionOfClinicalCase, clinicalRegions, ALL_CLINICAL_REGIONS
} from "../src/lib/clinical-arena-regions.ts";

const page=readFileSync("src/app/clinical-arena/page.tsx","utf8");
const expanded=readFileSync("src/lib/clinical-arena-expanded.ts","utf8");
const base=page.split("const cases: Case[] = [")[1]?.split("...expandedCases")[0]||"";
const authoredIds=[...base.matchAll(/(?:\{|,)["']?id["']?:["']([^"']+)["']/g)].map(match=>match[1]);
const start=expanded.indexOf("export const expandedCases");
const arrayStart=expanded.indexOf("=[",start);
const arrayEnd=expanded.indexOf(";\n",arrayStart);
assert(start>=0&&arrayStart>=0&&arrayEnd>arrayStart);
const expandedCases=JSON.parse(expanded.slice(arrayStart+1,arrayEnd));
assert.equal(authoredIds.length,20,"Unexpected count for authored starter cases");
assert.equal(expandedCases.length,180,"Unexpected count for expanded cases");
const seeds=[
 "neuro","pediatrics","cardiopulm","mobility-vestibular","specialist"
].flatMap(name=>{
 const source=readFileSync("src/lib/clinical-arena-"+name+".ts","utf8");
 const start=source.indexOf("=[");
 const items=JSON.parse(source.slice(start+1,source.lastIndexOf(";\n")));
 return items.flatMap(template=>Array.from({length:5},(_,i)=>"multi-"+template.key+"-"+(i+1)));
});
assert.equal(seeds.length,300,"Expected 300 multidisciplinary patient variants");
const idList=[...authoredIds,...expandedCases.map(c=>c.id),...seeds];
assert.equal(new Set(idList).size,500,"All patient case IDs must be unique");
const allowed=new Set(clinicalRegions);
const counts=new Map(clinicalRegions.map(name=>[name,0]));
for(const id of idList){
  const region=regionOfClinicalCase(id);
  assert(allowed.has(region),`${id}: unmapped region`);
  counts.set(region,counts.get(region)+1);
}
assert.equal([...counts.values()].reduce((a,b)=>a+b,0),500);
assert.equal(clinicalRegions.length,16);
for(const [name,count] of counts)assert(count>0,`Empty filter: ${name}`);

const baseExpectations={
  "neck-01":"Spine & Neck","shoulder-01":"Shoulder","elbow-01":"Elbow & Forearm",
  "hand-01":"Wrist & Hand","hip-01":"Hip","knee-01":"Knee",
  "ankle-01":"Foot & Ankle","expanded-36-1":"General / Other",
};
for(const [id,expected] of Object.entries(baseExpectations)){
 assert.equal(regionOfClinicalCase(id),expected,`Wrong anatomical region: ${id}`);
}
for(const required of [
  "Body Region / Focus",
  "Clinical Track",
  "regionOfClinicalCase(c.id)===region",
  "regionOfClinicalCase(c.id)===nextRegion",
  "reset(specialty,region)",
  "setRegion(nextRegion)",
  "diagnosisUnlocked?item.title:",
]){
 assert(page.includes(required),`Missing case filter or existing blind-mode safeguard: ${required}`);
}
const regular=expandedCases.filter(c=>!c.safety);
const risk=expandedCases.filter(c=>c.safety);
assert.equal(regular.length+risk.length,180);
assert.equal(ALL_CLINICAL_REGIONS,"All regions");
console.log("Clinical Arena region filters PASS:",Object.fromEntries(counts),`500 mapped cases, ${risk.length} expanded MSK red-flag cases retained`);
