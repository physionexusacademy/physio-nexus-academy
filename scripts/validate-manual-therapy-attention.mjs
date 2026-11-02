/** PNA editorial attention and clinical depth release guard. */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const read=(f)=>readFileSync(f,"utf8");
const promptSource=read("src/lib/manual-therapy-attention-cues.ts");
const parentA=read("src/lib/manual-therapy.ts"),parentB=read("src/lib/manual-therapy-additions.ts");
const world=read("src/lib/manual-therapy-world.ts");
const coreIds=[...parentA.matchAll(/^\s+slug:\s*"([^"]+)"/gm),...parentB.matchAll(/^\s+slug:\s*"([^"]+)"/gm)].map(x=>x[1]);
const worldIds=[...world.matchAll(/^\s+"slug":\s*"([^"]+)"/gm)].map(x=>x[1]);
const cues=[...promptSource.matchAll(/^  "([^"]+)": \{\s*wake:/gm)].map(x=>x[1]);
function eq(a,b,message){assert.deepEqual([...new Set(a)].sort(),[...new Set(b)].sort(),message);assert.equal(a.length,new Set(a).size,message+" duplicates");}
eq(cues,[...coreIds,...worldIds],"35 technique-specific wake-up cues");
assert.equal(coreIds.length,22,"Expected 22 core techniques");
assert.equal(worldIds.length,13,"Expected 13 worldwide approaches");
for(const word of ["wake:", "question:", "answer:", "easy:", "remember:"]){
  assert.equal((promptSource.match(new RegExp(word + ' "', "g"))||[]).length,35,word+" must cover all 35");
}
const labs=read("src/lib/manual-therapy-regional-learning-labs.ts");
const labSlugs=[...labs.matchAll(/^"([a-z0-9-]+)": \{/gm)].map(x=>x[1]);
eq(labSlugs,["pnf-lower-limb-d1","neurodynamic-ulnar-slider","met-hamstring","scs-upper-trapezius"],"First four expanded regional learning labs");
for(const slug of labSlugs){
  assert(read("src/lib/manual-therapy-regional.ts").includes('slug: "'+slug+'"'),"Unknown regional application: "+slug);
}
const parent=read("src/app/manual-therapy/[slug]/page.tsx");
const expanded=read("src/app/manual-therapy/regions/[slug]/page.tsx");
const worldComponent=read("src/components/manual-therapy/WorldApproachDeepDive.tsx");
for(const mode of ["wake","think","remember"]){
  assert(parent.includes('moment="'+mode+'"'),"Core technique page missing "+mode);
  assert(worldComponent.includes('moment="'+mode+'"'),"Worldwide approach page missing "+mode);
}
assert(read("src/components/manual-therapy/WorldApproachChapter.tsx").includes("slug={lesson.slug}"),"World slug must reach deep chapter");
assert(expanded.includes("<RegionalAttentionReset") && expanded.includes("<RegionalLearningLab"),"Regional engagement/walkthrough missing");
const attention=read("src/components/manual-therapy/AttentionReset.tsx");
for(const marker of ["wake-v1","think-v1","remember-v1","regional-brain-v1"]){
  assert(attention.includes(marker),"Missing marker "+marker);
}
const learning=read("src/components/manual-therapy/RegionalLearningLab.tsx");
assert(learning.includes('data-pna-learning-depth="what-how-why-v1"') && learning.includes("stage.why") && learning.includes("lab.safety"),"Deep regional teaching lost why/safety");
assert(parent.includes("items={guide.stopCriteria}") && parent.includes("items={technique.contraindications}"),"Clinical core warnings missing");
assert(expanded.includes('data-pna-content-depth="general-overview"'),"Overview caution missing");
console.log("PNA accessible-English engagement checks pass: 35/35 unique technique cues, 22+13 section placements, 4 what/how/why labs, regional safety preserved.");
