import type {ClinicalCase} from "./clinical-cases";
import type {ClinicalCaseGuide} from "./clinical-case-guides";
import {expandedCases,expandedFlows} from "./clinical-arena-expanded";
import {multidisciplinaryCases,multidisciplinaryFlows,multidisciplinaryExams,multidisciplinaryTemplates} from "./clinical-arena-multispecialty";
import {labCategory} from "./case-lab-catalog";

export type CaseStory={
 id:string;category:string;patient:string;opening:string;
 scene:string[];history:[string,string][];bestHistory:number;
 findings:string[];examPrompt:string;examChoices:string[];examCorrect:number;examReason:string;
 diagnosisPrompt:string;diagnosisChoices:string[];diagnosisCorrect:number;
 diagnosisReason:string;differentials:{diagnosis:string;reasoning:string}[];
 management:string[];progression:string[];learning:string[];
 urgent:boolean;fullyAuthored:boolean;
 references:{title:string;organization:string;url:string;year?:string}[];
 guide?:ClinicalCaseGuide;
};
export function getLabEpisode(id:string):CaseStory|null{
 const m=multidisciplinaryCases.find(c=>c.id===id);
 if(m){
  const flow=multidisciplinaryFlows[id],exam=multidisciplinaryExams[id];
  const template=multidisciplinaryTemplates.find(t=>id.startsWith("multi-"+t.key+"-"));
  if(!flow||!exam||!template)return null;
  const originals=[template.title,...template.alternatives];
  return{
   id,category:labCategory(m.specialty,m.safety),patient:m.patient,opening:flow.chief,
   scene:[m.history,
    "You are seeing this patient in a teaching consultation. You do not get the answer in the referral notes. Your job is to notice what changes the clinical priority.",
    "The patient's goal is not a footnote. Think about what safe recovery should help them do next."],
   history:flow.historyQuestions,bestHistory:flow.bestHistory,
   findings:m.findings,examPrompt:exam.question,examChoices:[...exam.options],examCorrect:exam.correct,examReason:exam.why,
   diagnosisPrompt:m.question,diagnosisChoices:m.options,diagnosisCorrect:m.correct,diagnosisReason:m.explanation,
   differentials:originals.map((name,i)=>({diagnosis:name,reasoning:i===0?template.examWhy:"A plausible alternative to consider; compare the objective findings, timeline and safety profile before giving it priority."})),
   management:[template.management[0],template.why],progression:[
    "Recheck the functional task that matters most to this patient, rather than relying only on an impairment measure.",
    template.safety?"Prioritize urgent medical communication and reassess only after medical clearance.":"Progress only as symptoms, movement quality and real-life function allow; coordinate with the wider care team if recovery is unexpected."
   ],
   learning:[template.examWhy,template.why,"A clinical hypothesis stays open to revision when new evidence arrives."],
   urgent:!!m.safety,fullyAuthored:false,references:[]
  };
 }
 const e=expandedCases.find(c=>c.id===id);
 if(!e)return null;
 const flow=expandedFlows[id];
 if(!flow)return null;
 const options=flow.differential;
 return{
  id,category:labCategory(e.specialty,e.safety),patient:e.patient,opening:flow.chief,
  scene:[e.history,"The patient's initial words give you a starting point, not a diagnosis. Listen for timing, what provokes symptoms and what matters to them.",
   "Your next decision should test a clinical hypothesis while keeping safety in view."],
  history:flow.historyQuestions,bestHistory:flow.bestHistory,
  findings:e.findings,
  examPrompt:"Which initial examination direction will best clarify this clinical presentation?",
  examChoices:[...options],
  examCorrect:flow.differentialCorrect,examReason:flow.differentialWhy,
  diagnosisPrompt:e.question,diagnosisChoices:e.options,diagnosisCorrect:e.correct,diagnosisReason:e.explanation,
  differentials:options.map((name,i)=>({diagnosis:name,reasoning:i===flow.differentialCorrect?flow.differentialWhy:"Compare this alternative with the history and examination findings; avoid assuming one sign is diagnostic."})),
  management:[flow.treatment[flow.treatmentCorrect],flow.treatmentWhy],
  progression:["Agree a specific functional goal and document a baseline before changing the plan.",
   e.safety?"Urgent referral precedes routine rehabilitation.":"Monitor symptom behavior, tolerability and relevant objective tests at follow-up."],
  learning:[e.explanation,flow.differentialWhy,"Symptoms, objective findings and patient goals belong in the same clinical decision."],
  urgent:!!e.safety,fullyAuthored:false,references:[]
 };
}
export function adaptDetailedCase(item:ClinicalCase,guide?:ClinicalCaseGuide):CaseStory{
 const urgent=!!item.redFlags?.length;
 return{
  id:"deep-"+item.slug,category:labCategory(item.specialty,urgent),patient:"Detailed teaching consultation",
  opening:item.presentation[0]||item.summary,
  scene:[...item.presentation,item.summary],
  history:(guide?.keyQuestions||item.presentation.slice(1)).slice(0,6).map((q,i)=>[q,
    "Consider how the patient's symptom pattern, onset and meaningful goals would change the next clinical decision. Compare with the documented presentation."] as [string,string]),
  bestHistory:0,findings:item.keyFindings,
  examPrompt:"Which differential would you prioritize at this point? Record a working hypothesis before you see the clinical analysis.",
  examChoices:item.differentials.map(d=>d.diagnosis),examCorrect:-1,examReason:item.reasoning[0]||"",
  diagnosisPrompt:"Which clinical explanation best fits the full picture?",
  diagnosisChoices:item.differentials.map(d=>d.diagnosis),diagnosisCorrect:-1,diagnosisReason:item.reasoning.join(" "),
  differentials:item.differentials,management:item.management,progression:item.progression||[],learning:item.learningPoints,
  urgent,fullyAuthored:true,references:item.references,guide
 };
}
