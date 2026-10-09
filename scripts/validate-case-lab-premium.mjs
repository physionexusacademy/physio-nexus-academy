import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
const files={
 home:read("src/app/case-lab/page.tsx"),
 library:read("src/app/case-lab/CaseLabLibrary.tsx"),
 experience:read("src/app/case-lab/CaseLabExperience.tsx"),
 deepPage:read("src/app/case-lab/[slug]/page.tsx"),
 episodePage:read("src/app/case-lab/episode/page.tsx"),
 episodeLoader:read("src/app/case-lab/episode/EpisodeByQuery.tsx"),
 catalog:read("src/lib/case-lab-catalog.ts"),
 episodes:read("src/lib/case-lab-story.ts"),
 msk:read("src/lib/case-lab-msk-core.ts"),
 extraGuides:read("src/lib/case-lab-extra-guides.ts"),
 oldGuides:read("src/lib/clinical-case-guides.ts"),
 index:read("src/lib/clinical-case-index.ts")
};
const featured=[...files.index.matchAll(/slug:\s*"([^"]+)"/g)].map(x=>x[1]);
const authored=[...files.msk.matchAll(/(?:\{|,)["']?id["']?:["']([^"']+)["']/g)].map(x=>x[1]);
const expanded=read("src/lib/clinical-arena-expanded.ts");
const position=expanded.indexOf("export const expandedCases");
const beginning=expanded.indexOf("=[",position),ending=expanded.indexOf(";\n",beginning);
const parsedExpanded=JSON.parse(expanded.slice(beginning+1,ending));
const parts=["neuro","pediatrics","cardiopulm","mobility-vestibular","specialist"];
const templates=parts.flatMap(part=>{
 const source=read("src/lib/clinical-arena-"+part+".ts");
 return JSON.parse(source.slice(source.indexOf("=[")+1,source.lastIndexOf(";\n")));
});
const total=featured.length+authored.length+parsedExpanded.length+templates.length*5;
assert.equal(featured.length,9,"Should preserve nine original in-depth cases");
assert.equal(authored.length,20,"Missing original MSK patient encounters");
assert.equal(parsedExpanded.length,180,"Missing original MSK scenarios");
assert.equal(templates.length,60,"Missing one or more specialist case templates");
assert.equal(total,509,"Expected 509 distinct Case Lab encounters");
const uniqueIds=new Set([...featured.map(x=>"deep-"+x),...authored,
 ...parsedExpanded.map(x=>x.id),...templates.flatMap(t=>Array.from({length:5},(_,i)=>"multi-"+t.key+"-"+(i+1)))]);
assert.equal(uniqueIds.size,total,"Case Lab has duplicate patient links");

const existingGuideKeys=[...files.oldGuides.matchAll(/^\s*"([^"]+)":\s*\{/gm)].map(x=>x[1]);
const added=JSON.parse(files.extraGuides.slice(files.extraGuides.indexOf("={")+1,files.extraGuides.lastIndexOf(";\n")));
assert.equal(Object.keys(added).length,5,"Missing additional deep-dive guides");
for(const slug of featured)assert(existingGuideKeys.includes(slug)||slug in added,"Deep dive lacks masterclass: "+slug);
const sections=["keyQuestions","examinationSequence","decisionLogic","practicalManagement","exerciseDose","reassessment","commonMistakes","masterTakeaway"];
for(const [key,guide] of Object.entries(added)){
 for(const section of sections)assert(Array.isArray(guide[section])&&guide[section].length>=3,key+": insufficient "+section);
}
const checks={
 premiumCss:read("src/app/case-lab/case-lab.css").includes(".cl-hero"),
 filter:files.library.includes("Search patient cases")&&files.library.includes("setCategorySafe"),
 showCount:files.library.includes("{cases.length}"),
 queryLinks:files.catalog.includes("/case-lab/episode?id="),
 bookmarkable:files.episodeLoader.includes('params.get("id")'),
 episodeExists:files.episodes.includes("export function getLabEpisode("),
 clinicalExam:files.episodes.includes("getClinicalExamination(e)")&&files.episodes.includes("getClinicalExamination(core)"),
 safeSelection:files.experience.includes("story.urgent?"),
 fiveChapters:files.experience.includes('const chapters=["The encounter","Take the history","Examine the clues","Your working hypothesis","Clinical debrief"]'),
 diagnosisLocked:files.experience.includes("const reveal=step===4")&&files.experience.includes("Submit working diagnosis & unlock debrief"),
 detailedGuides:files.deepPage.includes("supplementalCaseGuides"),
 gradeReview:files.experience.includes("story.diagnosisCorrect<0")&&files.experience.includes("story.diagnosisCorrect"),
 reducedMotion:files.experience.includes("prefers-reduced-motion: reduce"),
 categories:files.catalog.includes("Critical Care & ICU")&&files.catalog.includes("Oncology Rehabilitation"),
};
for(const [name,passed] of Object.entries(checks))assert(passed,"Missing Case Lab feature: "+name);
const typeCounts={};for(const t of templates)typeCounts[t.track]=(typeCounts[t.track]||0)+5;
for(const [track,n] of Object.entries(typeCounts))assert(n>=15,"Category too small: "+track);
console.log("PASS PNA Case Lab: 509 encounters = 9 deep dives + 20 original MSK + 180 expanded MSK + 300 multidisciplinary scenarios.");
console.log("All nine deep dives have detailed guides. Feature checks:",Object.keys(checks).length,". New specialty counts:",typeCounts);
