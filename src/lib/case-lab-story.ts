import type {ClinicalCase} from "./clinical-cases";
import type {ClinicalCaseGuide} from "./clinical-case-guides";
import {expandedCases,expandedFlows} from "./clinical-arena-expanded";
import {getClinicalExamination} from "./clinical-arena-examinations";
import {coreMskCases,coreMskFlows} from "./case-lab-msk-core";
import {richerMskDiagnosisOptions} from "./case-lab-msk-differentials";
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
 teachingDiagnosis?:string;
};

/** Practical safety-net and referral prompts for teaching cases. These guide triage;
 * they do not replace local emergency protocols or an in-person clinical assessment. */
function referralSafety(title:string,category:string,urgent:boolean):string[]{
 const t=title.toLowerCase();
 if(/cauda equina|bladder|saddle|new urinary retention/.test(t))
  return ["RED FLAG / EMERGENCY: new bladder or bowel dysfunction, saddle sensory change, or rapidly progressive bilateral leg weakness with back pain requires immediate emergency-department assessment for possible cauda equina syndrome. Do not continue routine physiotherapy or send the patient for a routine outpatient appointment."];
 if(/chest|cardiac|myocardial|heart attack|acute coronary/.test(t)||category==="Cardiopulmonary Rehabilitation"&&urgent)
  return ["RED FLAG / EMERGENCY: new severe chest pressure, collapse, acute breathlessness, cold sweating or suspected acute cardiac event requires emergency services and urgent medical assessment. Stop exercise; do not attempt to diagnose or treat this as a routine rehabilitation problem."];
 if(/stroke|facial droop|speech change|sudden weakness/.test(t))
  return ["RED FLAG / EMERGENCY: sudden facial weakness, arm weakness, speech disturbance or another abrupt focal neurological deficit requires immediate stroke-pathway activation/emergency assessment, even if symptoms begin to improve."];
 if(/fall|orthostatic|syncope|faint/.test(t))
  return ["SAFETY CHECK: ask about loss of consciousness, injury, new neurological symptoms, chest pain and palpitations. Syncope with chest pain, exertional onset, serious injury or new neurological signs needs emergency assessment; recurrent unexplained episodes need prompt medical review before challenging balance work."];
 if(/copd|desaturation|breathlessness|pulmonary/.test(t)||category==="Cardiopulmonary Rehabilitation")
  return ["SAFETY CHECK: monitor symptoms and prescribed observations within the person's clinical plan. Unexpected marked desaturation, severe breathlessness, cyanosis, confusion or chest pain means stop exercise and follow the site's urgent/emergency escalation protocol; stable but unexplained deterioration needs prompt medical-team review."];
 if(/postpartum|urinary incontinence|pelvic|pelvic floor/.test(t)||category==="Pelvic Health")
  return ["REFERRAL: pelvic-health physiotherapy is appropriate for persistent pelvic-floor symptoms when the person is medically stable and consents. New severe pelvic/abdominal pain, heavy bleeding, fever, inability to pass urine or acute postpartum deterioration needs urgent medical assessment rather than routine pelvic-floor treatment."];
 if(/cancer|oncology|tumou?r/.test(t)||category==="Oncology Rehabilitation")
  return ["REFERRAL: coordinate with the oncology team for new unexplained symptoms or a change from baseline. Severe new spinal pain with neurological deficit, suspected cord compression, acute chest symptoms or sudden clinical deterioration requires emergency assessment."];
 if(/child|infant|pediatric|paediatric/.test(t)||category==="Pediatric Rehabilitation")
  return ["SAFETY CHECK: urgent medical assessment is required for a seriously unwell child, breathing difficulty, reduced responsiveness, new focal neurological signs or rapidly worsening symptoms. Contact the paediatric team for concerns beyond physiotherapy scope."];
 if(/neck|arm|radicul|neurolog/.test(t)||category==="Neurological Rehabilitation")
  return [urgent?"URGENT REFERRAL: new or rapidly progressive neurological deficit needs urgent medical assessment; sudden focal neurological symptoms require emergency services.":"REFERRAL: progressive weakness, widespread neurological signs, gait deterioration or new bowel/bladder symptoms warrants prompt medical assessment. Sudden-onset focal deficits or cauda-equina features require emergency escalation."];
 if(/shoulder|knee|ankle|hip|acl|fracture|orthop|joint/.test(t)||category==="MSK & Sports")
  return ["REFERRAL: suspected fracture/dislocation, a hot swollen joint with fever, neurovascular compromise or inability to bear weight after significant trauma needs urgent medical assessment. Persistent unexplained pain, recurrent instability or failure to progress merits planned review by an appropriate medical/orthopaedic clinician; routine MSK rehabilitation is suitable only when serious pathology has been reasonably excluded."];
 return [urgent?"SAFETY FIRST: pause routine physiotherapy and arrange urgent medical assessment; use emergency services if the patient is acutely unwell or time-critical red flags are present.":"REFERRAL DECISION: if findings are outside physiotherapy scope, unexplained, worsening or inconsistent with the working diagnosis, discuss with the appropriate medical team. Match urgency to severity; emergency features must not be sent to a routine outpatient clinic."];
}
\nexport function getLabEpisode(id:string):CaseStory|null{
 const core=coreMskCases.find(c=>c.id===id);
 if(core){
  const flow=coreMskFlows[core.id],exam=getClinicalExamination(core);
  if(!flow)return null;
  return{
   id:core.id,category:labCategory(core.specialty,core.safety),patient:core.patient,opening:flow.chief,
   scene:[core.history,"At this point you know what brought the patient to clinic, but you have not yet tested a working diagnosis. Choose what to ask and examine next.",
    "A useful question: which finding would make you change your mind or seek urgent medical evaluation?"],
   history:flow.historyQuestions,bestHistory:flow.bestHistory,findings:core.findings,
   examPrompt:exam.question,examChoices:[...exam.options],examCorrect:exam.correct,examReason:exam.why,
   diagnosisPrompt:core.question,diagnosisChoices:core.options,diagnosisCorrect:core.correct,diagnosisReason:core.explanation,
   differentials:core.options.map((name,i)=>({diagnosis:name,reasoning:i===core.correct?core.explanation:"Compare this possibility with the patient history, objective findings and safety screening. Use targeted testing before drawing a conclusion."})),
   management:[flow.treatment[flow.treatmentCorrect],flow.treatmentWhy],
   progression:[core.safety?"Ensure emergency evaluation before starting routine physiotherapy.":"Review functional goals and objective change before changing rehabilitation load.",
     "Document symptom behavior, function and adverse responses; adjust the plan if the pattern changes.",...referralSafety(core.title,labCategory(core.specialty,core.safety),!!core.safety)],
   learning:[core.explanation,flow.differentialWhy,"The patient story, safety screening, examination and decision must all fit together.",...referralSafety(core.title,labCategory(core.specialty,core.safety),!!core.safety)],
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
    template.safety?"Prioritize urgent medical communication and reassess only after medical clearance.":"Progress only as symptoms, movement quality and real-life function allow; coordinate with the wider care team if recovery is unexpected.",...referralSafety(m.title,labCategory(m.specialty,m.safety),!!m.safety)
   ],
   learning:[template.examWhy,template.why,"A clinical hypothesis stays open to revision when new evidence arrives.",...referralSafety(m.title,labCategory(m.specialty,m.safety),!!m.safety)],
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
  id,category:labCategory(e.specialty,e.safety),patient:e.patient,opening:flow.chief,
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
   e.safety?"Urgent referral precedes routine rehabilitation.":"Monitor symptom behavior, tolerability and relevant objective tests at follow-up.",...referralSafety(e.title,labCategory(e.specialty,e.safety),!!e.safety)],
  learning:[e.explanation,flow.differentialWhy,"Symptoms, objective findings and patient goals belong in the same clinical decision.",...referralSafety(e.title,labCategory(e.specialty,e.safety),!!e.safety)],
  urgent:!!e.safety,fullyAuthored:false,references:[]
 };
}
export function adaptDetailedCase(item:ClinicalCase,guide?:ClinicalCaseGuide):CaseStory{
 const urgent=item.specialty.includes("Red Flags") || item.slug==="low-back-pain-new-bladder-saddle-symptoms" ||
  !!item.redFlags?.some(flag=>/bladder|bowel|saddle|stroke|chest pain|acute breathlessness|rapidly progressive|emergency/i.test(flag));
 const referral=referralSafety(item.title,labCategory(item.specialty,urgent),urgent);
 const ageOrContext=item.presentation[0]||item.summary;
 return{
  id:"deep-"+item.slug,category:labCategory(item.specialty,urgent),patient:ageOrContext,
  opening:item.presentation[0]||item.summary,
  scene:[...item.presentation,
   "Pause before choosing a treatment: identify the patient's main functional goal, the findings that support your working hypothesis, and what would make you stop and escalate.",
   "This is a simulated educational case. Use the information provided; do not assume unreported examination findings, vital signs or treatment responses."],
  history:item.presentation.slice(0,5).map((answer,i)=>[
   ["What brings you to rehabilitation today?","What has changed and when did it start?","How is this affecting daily activities?","What is the patient's main goal or concern?","What other symptoms or medical history could change the plan?"][i],
   answer
  ] as [string,string]),
  bestHistory:0,findings:item.keyFindings,
  examPrompt:"Which assessment step should come next, and what safety question must be answered before proceeding?",
  examChoices:(guide?.examinationSequence||item.keyFindings).slice(0,4),examCorrect:-1,
  examReason:[item.reasoning[0]||"",...(item.redFlags||[]).map(x=>"Safety screen: "+x)].filter(Boolean).join(" "),
  diagnosisPrompt:"Which clinical explanation best fits the information available, and which alternative must not be missed?",
  diagnosisChoices:item.differentials.map(d=>d.diagnosis),diagnosisCorrect:-1,diagnosisReason:item.reasoning.join(" "),
  differentials:item.differentials,management:[...item.management,...referral],progression:[...(item.progression||[]),...referral],
  learning:[...item.learningPoints,...referral],urgent,fullyAuthored:true,references:item.references,guide,teachingDiagnosis:item.finalDiagnosis
 };
}