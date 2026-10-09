import {clinicalCaseIndex} from "./clinical-case-index";
import {expandedCases,expandedFlows} from "./clinical-arena-expanded";
import {multidisciplinaryCases,multidisciplinaryFlows} from "./clinical-arena-multispecialty";
import {coreMskCases,coreMskFlows} from "./case-lab-msk-core";
import {regionOfClinicalCase} from "./clinical-arena-regions";
export type LabCaseCard={
 id:string; href:string; category:string; patient:string; hook:string; difficulty:"Clinical"|"Advanced";
 kind:"Clinical deep dive"|"Interactive scenario";minutes:string;safety:boolean;keywords:string;focus:string;
};
export const labCategories=[
 "MSK & Sports","Neurological Rehabilitation","Pediatric Rehabilitation",
 "Cardiopulmonary Rehabilitation","Geriatrics & Falls","Vestibular Rehabilitation",
 "Pelvic Health","Oncology Rehabilitation","Critical Care & ICU","Clinical Red Flags",
] as const;
export function labCategory(specialty:string,safety=false):string{
 if(specialty==="Clinical Red Flags"||specialty.includes("Red Flags")||safety)return "Clinical Red Flags";
 if(specialty==="Neurological Rehabilitation"||specialty==="Neurological")return "Neurological Rehabilitation";
 if(specialty==="Pediatric Rehabilitation")return "Pediatric Rehabilitation";
 if(specialty==="Cardiopulmonary Rehabilitation"||specialty==="Cardiopulmonary")return "Cardiopulmonary Rehabilitation";
 if(specialty==="Geriatrics & Falls"||specialty==="Geriatrics")return "Geriatrics & Falls";
 if(specialty==="Vestibular Rehabilitation")return "Vestibular Rehabilitation";
 if(specialty==="Women's Health & Pelvic Floor"||specialty.includes("Pelvic"))return "Pelvic Health";
 if(specialty==="Oncology Rehabilitation")return "Oncology Rehabilitation";
 if(specialty==="Critical Care & ICU")return "Critical Care & ICU";
 return "MSK & Sports";
}
const featuredHooks:Record<string,string>={
 "postpartum-running-stress-urinary-incontinence":"A new parent wants to run again. What should we ask first?",
 "older-adult-recurrent-falls-orthostatic-symptoms":"The falls keep happening. Is the balance test enough?",
 "overhead-athlete-shoulder-load-capacity":"A painter can lift—but can they tolerate another shift?",
 "runner-anterior-knee-pain-load-capacity":"The knee feels fine at rest. Stairs tell a different story.",
 "copd-rehab-exertional-desaturation-clinical-reasoning":"The walk starts normally. Then one vital sign changes.",
 "low-back-pain-new-bladder-saddle-symptoms":"A routine back-pain appointment suddenly becomes urgent.",
 "stroke-gait-balance-task-specific-rehab":"The patient is walking again. What does progress really mean?",
 "copd-post-exacerbation-pulmonary-rehab":"After discharge, every small walk feels like a mountain.",
 "acl-reconstruction-return-to-sport-readiness":"The athlete passed a hop test. Is that really enough?",
};
const featuredFocus:Record<string,string>={
 "postpartum-running-stress-urinary-incontinence":"Pelvic Health",
 "older-adult-recurrent-falls-orthostatic-symptoms":"Falls & Mobility",
 "overhead-athlete-shoulder-load-capacity":"Shoulder",
 "runner-anterior-knee-pain-load-capacity":"Knee",
 "copd-rehab-exertional-desaturation-clinical-reasoning":"Heart & Lungs",
 "low-back-pain-new-bladder-saddle-symptoms":"Spine & Neck",
 "stroke-gait-balance-task-specific-rehab":"Neurological Function",
 "copd-post-exacerbation-pulmonary-rehab":"Heart & Lungs",
 "acl-reconstruction-return-to-sport-readiness":"Knee",
};
const rawLabCaseCards:LabCaseCard[]=[
 ...clinicalCaseIndex.map(c=>({
   id:"deep-"+c.slug,href:"/case-lab/"+c.slug,
   category:labCategory(c.specialty),patient:"Detailed teaching case",
   hook:featuredHooks[c.slug]||c.summary,difficulty:c.difficulty,keywords:c.title+" "+c.summary,focus:featuredFocus[c.slug]||"General / Other",
   kind:"Clinical deep dive" as const,minutes:c.estimatedTime,safety:c.specialty.includes("Red Flags")
 })),
 ...coreMskCases.map(c=>({
   id:c.id,href:"/case-lab/episode?id="+encodeURIComponent(c.id),
   category:labCategory(c.specialty,c.safety),patient:c.patient,
   hook:coreMskFlows[c.id]?.chief||c.history.split(".")[0],keywords:c.title+" "+c.history,focus:regionOfClinicalCase(c.id),
   difficulty:"Clinical" as const,kind:"Interactive scenario" as const,
   minutes:"7–10 min",safety:!!c.safety
 })),
 ...multidisciplinaryCases.map((c)=>{
   const flow=multidisciplinaryFlows[c.id];
   return {
    id:c.id,href:"/case-lab/episode?id="+encodeURIComponent(c.id),
    category:labCategory(c.specialty,c.safety),patient:c.patient,
    hook:flow?.chief||c.history.split(".")[0],keywords:c.title+" "+c.history,focus:regionOfClinicalCase(c.id),
    difficulty:"Clinical" as const,kind:"Interactive scenario" as const,minutes:"7–10 min",safety:!!c.safety
   };
 }),
 ...expandedCases.map((c)=>{
   const flow=expandedFlows[c.id];
   return {
    id:c.id,href:"/case-lab/episode?id="+encodeURIComponent(c.id),
    category:labCategory(c.specialty,c.safety),patient:c.patient,
    hook:flow?.chief||c.history.split(".")[0],keywords:c.title+" "+c.history,focus:regionOfClinicalCase(c.id),
    difficulty:"Clinical" as const,kind:"Interactive scenario" as const,minutes:"7–10 min",safety:!!c.safety
   };
 })
];
// Each early page of cards represents the range of clinical categories,
// rather than showing dozens of the same specialty before anything else.
const featured=rawLabCaseCards.filter(c=>c.kind==="Clinical deep dive");
const grouped=new Map<string,LabCaseCard[]>();
for(const c of rawLabCaseCards.filter(c=>c.kind==="Interactive scenario")){
 const batch=grouped.get(c.category)||[];
 batch.push(c);grouped.set(c.category,batch);
}
const interleaved:LabCaseCard[]=[];
while([...grouped.values()].some(items=>items.length>0)){
 for(const label of labCategories){
  const next=grouped.get(label)?.shift();
  if(next)interleaved.push(next);
 }
}
export const labCaseCards:LabCaseCard[]=[...featured,...interleaved];
export const labCaseTotal=labCaseCards.length;
