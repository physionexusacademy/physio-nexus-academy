import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
const files={
 home:read("src/app/case-lab/page.tsx"),
 library:read("src/app/case-lab/CaseLabLibrary.tsx"),
 experience:read("src/app/case-lab/CaseLabTeachingExperience.tsx"),
 learning:read("src/lib/case-lab-learning.ts"),
 arena:read("src/app/clinical-arena/page.tsx"),
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
const msks=read("src/lib/case-lab-msk-differentials.ts");
const starts=msks.indexOf(">=");
const jsonStart=msks.indexOf("={",starts);
const jsonEnd=msks.indexOf(";\nexport function",jsonStart);
assert(jsonStart>0&&jsonEnd>jsonStart,"MSK differential library missing");
const alternatives=JSON.parse(msks.slice(jsonStart+1,jsonEnd));
assert.equal(Object.keys(alternatives).length,36,"Expected thirty-six curated MSK differential sets");
for(const c of parsedExpanded){
 const key=c.title.split(": Scenario")[0];
 const set=alternatives[key];
 assert(set?.length===3,c.id+": MSK case needs three plausible differentials");
 const names=[c.options[c.correct],...set.map(x=>x.name)];
 assert.equal(new Set(names).size,4,c.id+": duplicate diagnosis options");
 for(const a of set)assert(a.why.length>35,c.id+": insufficient explanation for alternative");
}
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
assert(files.library.includes("router.push(next.href)"),"Surprise patient option missing");
assert(files.library.includes("c.keywords"),"Search should find diagnosis terms while keeping titles hidden");
assert(files.catalog.includes("focus:string"),"All case cards must expose a body region or clinical focus");
assert(files.episodes.includes("richerMskDiagnosisOptions"),"MSK Case Lab does not use improved clinical distractors");
assert(files.library.includes("Case lessons"),"Case Lab must be explicitly labelled as a learning library");
assert(files.episodes.includes("teachingDiagnosis:item.finalDiagnosis"),"Author's clinical conclusion missing from deep-dive lesson");
assert(files.learning.includes("story.teachingDiagnosis ||"),"Deep-dive clinical conclusion not used in teaching");
assert(files.episodes.includes('const urgent=item.specialty.includes("Red Flags")'),"Routine safety screens must not turn every authored case into an emergency");
assert(!files.episodes.includes("const urgent=!!item.redFlags?.length"),"A red-flag checklist alone does not mean an emergency is present");
assert(files.episodes.includes("history:item.presentation.slice(0,5).map"),"Patient interview answers must be based on case-provided history");
const novel=read("src/lib/case-lab-narrative.ts");
const style=read("src/app/case-lab/case-lab.css");
assert(novel.includes("export function buildClinicalEpisodes"),"Case-grounded narrative builder missing");
assert(novel.includes("educational simulation")||novel.includes("teaching case"),"Novel engine must label simulated evidence");
assert(files.experience.includes('data-pna-case-lab-lesson="clinical-novel-v2"'),"Novel reader not connected to patient files");
assert(files.experience.includes("scene.narrative.map"),"Story prose not rendering");
assert(files.experience.includes("scene.insight"),"Reflective clinical insight missing");
assert(files.experience.includes("setFocusMode"),"Reader focus mode missing");
assert(style.includes(".cl-novel-prose"),"Editorial reading typography missing");
assert(files.library.includes("isInClinicalCategory(c,name)"),"Category case counts must use cross-listing");
assert(files.library.includes('selected==="Clinical Red Flags"'),"Red flags collection must be cross-specialty");
assert(files.catalog.includes('if(specialty==="Clinical Red Flags"||specialty.includes("Red Flags"))'),"Cross-list safety cases in home specialty");
const checks={
 premiumCss:read("src/app/case-lab/case-lab.css").includes(".cl-hero"),
 filter:files.library.includes("pna-case-search")&&files.library.includes("chooseSpecialty(next:string)"),
 showCount:files.library.includes("{cases.length}")&&files.library.includes("{selectedTotal} cases"),
 queryLinks:files.catalog.includes("/case-lab/episode?id="),
 bookmarkable:files.episodeLoader.includes('params.get("id")'),
 episodeExists:files.episodes.includes("export function getLabEpisode("),
 clinicalExam:files.episodes.includes("getClinicalExamination(e)")&&files.episodes.includes("getClinicalExamination(core)"),
 safeSelection:files.experience.includes("story.urgent")&&files.learning.includes('story.urgent?"Clinical Red Flags"'),
 sevenTeachingChapters:files.experience.includes('name:"Meet the patient"')&&files.experience.includes('name:"Dosage & reassessment"')&&files.experience.includes('name:"Key lessons"'),
 readingNotQuiz:files.experience.includes("not an exam.")&&!files.experience.includes("Submit working diagnosis & unlock debrief"),
 detailedGuides:files.deepPage.includes("supplementalCaseGuides"),
 clinicalReasoning:files.learning.includes('const comparison=relevant.map')&&files.experience.includes('lesson.chapters.differential'),
 reducedMotion:files.experience.includes("prefers-reduced-motion: reduce"),
 clinicalDepth:files.learning.includes('chapters:{')&&files.experience.includes('lesson.chapters.dosage')&&files.experience.includes('lesson.chapters.pitfalls'),
 samePatientBridge:files.arena.includes('data-pna-arena-study-link="v1"')&&files.arena.includes('encodeURIComponent(item.id)'),
 unlockProtected:files.arena.includes('{diagnosisUnlocked?')&&files.arena.includes('target="_blank" rel="noopener noreferrer"'),
 teachingRoutes:files.deepPage.includes("CaseLabTeachingExperience")&&files.episodeLoader.includes("CaseLabTeachingExperience"),
 noInventedVitals:files.learning.includes("Avoid invented vitals"),
 categories:files.catalog.includes("Critical Care & ICU")&&files.catalog.includes("Oncology Rehabilitation"),
 specialtyFirst:files.library.includes('data-pna-case-lab="specialty-first-v4"')&&files.library.includes("!category?("),
 categoryNavigation:files.library.includes('aria-pressed={active}')&&files.library.includes('className="cl-specialty-choice'),
 categoryCaseFiltering:files.library.includes("isInClinicalCategory(c,category)")&&files.library.includes("function isInClinicalCategory"),
 regions:files.library.includes('c.focus!==focus')&&files.library.includes("focusOptions"),
 clinicalLevels:files.library.includes('c.difficulty!==level'),
 caseModes:files.library.includes('c.kind!=="Interactive scenario"')&&files.library.includes('c.kind!=="Clinical deep dive"'),
 mobile:files.library.includes('(max-width: 1023px)')&&files.library.includes('scrollIntoView'),
 pagination:files.library.includes('setLimit(n=>n+12)'),
};
for(const [name,passed] of Object.entries(checks))assert(passed,"Missing Case Lab feature: "+name);
const typeCounts={};for(const t of templates)typeCounts[t.track]=(typeCounts[t.track]||0)+5;
for(const [track,n] of Object.entries(typeCounts))assert(n>=15,"Category too small: "+track);
console.log("PASS PNA Case Lab: 509 encounters = 9 deep dives + 20 original MSK + 180 expanded MSK + 300 multidisciplinary scenarios.");
console.log("All nine deep dives have detailed guides. Feature checks:",Object.keys(checks).length,". New specialty counts:",typeCounts);
