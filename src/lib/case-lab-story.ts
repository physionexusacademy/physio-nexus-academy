import type {ClinicalCase} from "./clinical-cases";
import type {ClinicalCaseGuide} from "./clinical-case-guides";
import {expandedCases,expandedFlows} from "./clinical-arena-expanded";
import {getClinicalExamination} from "./clinical-arena-examinations";
import {coreMskCases,coreMskFlows} from "./case-lab-msk-core";
import {richerMskDiagnosisOptions} from "./case-lab-msk-differentials";
import {multidisciplinaryCases,multidisciplinaryFlows,multidisciplinaryExams,multidisciplinaryTemplates} from "./clinical-arena-multispecialty";
import {labCategory} from "./case-lab-catalog";
import {getRealPatient,formatPatientLabel} from "./case-lab-real-patients";

export type CaseStory={
 id:string;category:string;patient:string;opening:string;
 /** Optional Roman Urdu patient line for the opening (toggle in UI) */
 openingUrdu?:string;
 scene:string[];history:[string,string][];bestHistory:number;
 findings:string[];examPrompt:string;examChoices:string[];examCorrect:number;examReason:string;
 diagnosisPrompt:string;diagnosisChoices:string[];diagnosisCorrect:number;
 diagnosisReason:string;differentials:{diagnosis:string;reasoning:string}[];
 management:string[];progression:string[];learning:string[];
 urgent:boolean;fullyAuthored:boolean;
 references:{title:string;organization:string;url:string;year?:string}[];
 guide?:ClinicalCaseGuide;
 teachingDiagnosis?:string;
};

function patientLabel(id:string,fallback:string){
 const rp=getRealPatient(id);
 return rp?formatPatientLabel(rp):fallback;
}
function openingLine(id:string,fallback:string){
 const rp=getRealPatient(id);
 return rp?.voice||fallback;
}
function openingUrduLine(id:string){
 return getRealPatient(id)?.voiceUrdu;
}

export function getLabEpisode(id:string):CaseStory|null{
 const core=coreMskCases.find(c=>c.id===id);
 if(core){
  const flow=coreMskFlows[core.id],exam=getClinicalExamination(core);
  if(!flow)return null;
  const rp=getRealPatient(core.id);
  return{
   id:core.id,category:labCategory(core.specialty,core.safety),
   patient:patientLabel(core.id,core.patient),
   opening:openingLine(core.id,flow.chief),
   openingUrdu:openingUrduLine(core.id),
   scene:[
    rp?`${rp.name} is in your clinic. ${core.history}`:core.history,
    "At this point you know what brought the patient to clinic, but you have not yet tested a working diagnosis. Choose what to ask and examine next.",
    "A useful question: which finding would make you change your mind or seek urgent medical evaluation?"
   ],
   history:flow.historyQuestions,bestHistory:flow.bestHistory,findings:core.findings,
   examPrompt:exam.question,examChoices:[...exam.options],examCorrect:exam.correct,examReason:exam.why,
   diagnosisPrompt:core.question,diagnosisChoices:core.options,diagnosisCorrect:core.correct,diagnosisReason:core.explanation,
   differentials:core.options.map((name,i)=>({diagnosis:name,reasoning:i===core.correct?core.explanation:"Compare this possibility with the patient history, objective findings and safety screening. Use targeted testing before drawing a conclusion."})),
   management:[flow.treatment[flow.treatmentCorrect],flow.treatmentWhy],
   progression:[core.safety?"Ensure emergency evaluation before starting routine physiotherapy.":"Review functional goals and objective change before changing rehabilitation load.",
     "Document symptom behavior, function and adverse responses; adjust the plan if the pattern changes."],
   learning:[core.explanation,flow.differentialWhy,"The patient story, safety screening, examination and decision must all fit together."],
   urgent:!!core.safety,fullyAuthored:false,references:[]
  };
 }
 const m=multidisciplinaryCases.find(c=>c.id===id);
 if(m){
  const flow=multidisciplinaryFlows[id],exam=multidisciplinaryExams[id];
  const template=multidisciplinaryTemplates.find(t=>id.startsWith("multi-"+t.key+"-"));
  if(!flow||!exam||!template)return null;
  const originals=[template.title,...template.alternatives];
  return{
   id,category:labCategory(m.specialty,m.safety),
   patient:patientLabel(id,m.patient),
   opening:openingLine(id,flow.chief),
   openingUrdu:openingUrduLine(id),
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
 const examined=getClinicalExamination(e);
 const enriched=richerMskDiagnosisOptions(e.title.split(": Scenario")[0],e.correct);
 return{
  id,category:labCategory(e.specialty,e.safety),
  patient:patientLabel(id,e.patient),
  opening:openingLine(id,flow.chief),
  openingUrdu:openingUrduLine(id),
  scene:[e.history,"The patient's initial words give you a starting point, not a diagnosis. Listen for timing, what provokes symptoms and what matters to them.",
   "Your next decision should test a clinical hypothesis while keeping safety in view."],
  history:flow.historyQuestions,bestHistory:flow.bestHistory,
  findings:e.findings,
  examPrompt:examined.question,
  examChoices:[...examined.options],
  examCorrect:examined.correct,examReason:examined.why,
  diagnosisPrompt:e.question,diagnosisChoices:enriched?.names||e.options,diagnosisCorrect:e.correct,diagnosisReason:e.explanation,
  differentials:enriched?[{diagnosis:e.title.split(": Scenario")[0],reasoning:e.explanation},...enriched.alternatives.map(a=>({diagnosis:a.name,reasoning:a.why}))]:options.map((name,i)=>({diagnosis:name,reasoning:i===flow.differentialCorrect?flow.differentialWhy:"Compare this alternative with the history and examination findings; avoid assuming one sign is diagnostic."})),
  management:[flow.treatment[flow.treatmentCorrect],flow.treatmentWhy],
  progression:["Agree a specific functional goal and document a baseline before changing the plan.",
   e.safety?"Urgent referral precedes routine rehabilitation.":"Monitor symptom behavior, tolerability and relevant objective tests at follow-up."],
  learning:[e.explanation,flow.differentialWhy,"Symptoms, objective findings and patient goals belong in the same clinical decision."],
  urgent:!!e.safety,fullyAuthored:false,references:[]
 };
}

export function adaptDetailedCase(item:ClinicalCase,guide?:ClinicalCaseGuide):CaseStory{
 const urgent=item.specialty.includes("Red Flags") || item.slug==="low-back-pain-new-bladder-saddle-symptoms";
 const rp=getRealPatient(item.slug);
 const sceneIntro=rp?`${rp.name} is in your clinic.`:null;
 return{
  id:"deep-"+item.slug,category:labCategory(item.specialty,urgent),
  patient:rp?formatPatientLabel(rp):"Detailed teaching consultation",
  opening:rp?.voice||item.presentation[0]||item.summary,
  openingUrdu:rp?.voiceUrdu,
  scene:sceneIntro
    ?[sceneIntro,...item.presentation,item.summary]
    :[...item.presentation,item.summary],
  history:item.presentation.slice(0,5).map((answer,i)=>[
   ["What brings you to rehabilitation today?","What changes have you noticed recently?","How has this affected your usual activities?","What is your biggest concern or goal right now?","Is there anything else you want us to understand?"][i],
   answer
  ] as [string,string]),
  bestHistory:0,findings:item.keyFindings,
  examPrompt:"Which clinical examination step would you prioritize? Several steps may be useful; record your choice, then compare the full assessment sequence in the debrief.",
  examChoices:(guide?.examinationSequence||item.keyFindings).slice(0,4),examCorrect:-1,examReason:item.reasoning[0]||"",
  diagnosisPrompt:"Which clinical explanation best fits the full picture?",
  diagnosisChoices:item.differentials.map(d=>d.diagnosis),diagnosisCorrect:-1,diagnosisReason:item.reasoning.join(" "),
  differentials:item.differentials,management:item.management,progression:item.progression||[],learning:item.learningPoints,
  urgent,fullyAuthored:true,references:item.references,guide,teachingDiagnosis:item.finalDiagnosis
 };
}
