/**
 * PNA Clinical Arena multidisciplinary authored blueprints.
 * Five functional contexts per clinical presentation create different patient
 * encounters; these are context variants, NOT 300 independent diagnoses.
 * Clinical decision blueprints are scenario-specific and educational only.
 */
export type NewTrack = "Neurological Rehabilitation" | "Pediatric Rehabilitation" |
 "Cardiopulmonary Rehabilitation" | "Geriatrics & Falls" | "Vestibular Rehabilitation" |
 "Women's Health & Pelvic Floor" | "Oncology Rehabilitation" | "Critical Care & ICU";
export type NewRegion = "Neurological Function" | "Child Development" |
 "Heart & Lungs" | "Falls & Mobility" | "Vestibular & Balance" |
 "Pelvic Health" | "Cancer Rehabilitation" | "ICU & Acute Care";
export type Cohort = "adult" | "older" | "infant" | "child" | "teen" | "postpartum" | "icu";
export type Template = {
 key:string; title:string; track:NewTrack; region:NewRegion; cohort:Cohort;
 chief:string; history:string; findings:[string,string];
 exam:[string,string,string,string]; examWhy:string;
 alternatives:[string,string,string]; management:[string,string,string];
 why:string; safety?:boolean; urgency?:string;
};
export type NewCase={
 id:string;specialty:string;title:string;patient:string;history:string;findings:string[];
 question:string;options:string[];correct:number;explanation:string;clue:string;safety?:boolean;
};
export type NewFlow={
 chief:string;historyQuestions:[string,string][];bestHistory:number;
 differential:string[];differentialCorrect:number;differentialWhy:string;
 treatment:string[];treatmentCorrect:number;treatmentWhy:string;
};
export type NewExam={
 question:string;options:[string,string,string,string];correct:number;
 why:string;alternatives:[string,string,string];
};

const settings: Record<Cohort,{patients:string[];contexts:string[];goals:string[]}> = {
 adult:{
  patients:["34-year-old adult in outpatient rehabilitation","47-year-old working adult","29-year-old community-dwelling adult","52-year-old adult receiving follow-up care","40-year-old adult with family responsibilities"],
  contexts:["Routine tasks became harder over the last month.","Work or household roles have been interrupted.","Confidence with community activities has declined.","The patient seeks a safer daily routine.","The patient wants to participate more independently."],
  goals:["Returning to usual daily tasks","Managing work or household demands","Improving community participation","Developing a safe self-management plan","Regaining confidence with everyday activities"]},
 older:{
  patients:["72-year-old retired adult","78-year-old person living with family","69-year-old independently living adult","83-year-old community resident","75-year-old older adult attending follow-up"],
  contexts:["The person is more cautious when moving around home.","Family members have noticed some activity limitations.","Community errands have become less manageable.","Mobility in familiar surroundings is a growing concern.","The person wants to remain active at home."],
  goals:["Staying safely mobile at home","Reducing dependence on caregivers","Returning to community errands","Maintaining day-to-day independence","Participating in valued social activities"]},
 infant:{
  patients:["6-month-old infant accompanied by a caregiver","9-month-old infant seen with a parent","12-month-old child attending an early-development review","10-month-old infant with family","8-month-old infant seen in pediatric therapy"],
  contexts:["A caregiver noticed differences during floor play.","Family members raised concerns about everyday positioning.","Motor milestones are harder during play.","The family is seeking guidance for home activities.","The caregiver is concerned about participation in age-appropriate play."],
  goals:["Comfortable supported play","Active floor exploration","Participation in age-appropriate movement","Caregiver confidence with positioning","More independent movement during play"]},
 child:{
  patients:["4-year-old child accompanied by a caregiver","6-year-old child attending pediatric therapy","8-year-old child with a parent","5-year-old child in a developmental review","7-year-old child and caregiver"],
  contexts:["Everyday play at home has become more challenging.","School or playground participation is affected.","Caregivers have noticed changes in activity tolerance.","The family wants to improve daily mobility.","Movement during familiar games has been difficult."],
  goals:["Joining age-appropriate games","Safe school or playground participation","More comfortable daily routines","Improving family and peer participation","Building confidence during play"]},
 teen:{
  patients:["13-year-old adolescent with caregiver","15-year-old student","12-year-old school-age patient","16-year-old adolescent in outpatient therapy","14-year-old adolescent attending with family"],
  contexts:["School mobility and participation are affected.","Daily routines need extra time and support.","Participation in hobbies has been disrupted.","The family is seeking practical activity strategies.","The patient wants more independence in ordinary tasks."],
  goals:["Participating at school","Managing routine tasks independently","Returning to valued hobbies","Safe participation with peers","Building independence at home and school"]},
 postpartum:{
  patients:["30-year-old postpartum adult","35-year-old parent attending pelvic rehabilitation","28-year-old adult after childbirth","39-year-old parent at follow-up","33-year-old postpartum patient"],
  contexts:["Daily childcare has changed activity routines.","The patient wants to return gradually to usual exercise.","Symptoms affect household and caregiving tasks.","The patient is concerned about everyday comfort.","Confidence about physical activity has been affected."],
  goals:["Comfortable daily childcare","Returning to suitable exercise","Managing family and household activities","Improving comfort and confidence","Returning to valued activities safely"]},
 icu:{
  patients:["62-year-old medically stable hospital patient","55-year-old inpatient on a monitored ward","69-year-old patient recovering in critical care","48-year-old adult transitioning from intensive care","73-year-old hospital patient with close clinical monitoring"],
  contexts:["Mobility is being reconsidered following recent critical illness.","The care team is assessing readiness for activity.","Bedside functional ability has declined.","The multidisciplinary team is planning staged mobilization.","The patient needs closely monitored rehabilitation planning."],
  goals:["Safe bedside participation","Coordinating appropriate mobilization","Regaining basic functional activity","Transitioning safely toward greater activity","Tolerating graded rehabilitation with the care team"]},
};
export function createMultidisciplinaryCases(templates:Template[]){
 const cases:NewCase[]=[];
 const flows:Record<string,NewFlow>={};
 const exams:Record<string,NewExam>={};
 const regionById:Record<string,NewRegion>={};
 for(const t of templates){
  const config=settings[t.cohort];
  // Five functional contexts remain available to Clinical Arena.\n  for(let i=0;i<5;i++){
   const v=i+1,id=`multi-${t.key}-${v}`;
   const patient=config.patients[i],context=config.contexts[i],goal=config.goals[i];
   // Clinical condition is kept out of initial patient speech and history.
   const story=`${t.history} ${context} Main functional priority: ${goal.toLowerCase()}.`;
   const options=[
    t.title,t.alternatives[0],t.alternatives[1],t.alternatives[2]
   ];
   const rotation=(i*3+t.key.length)%4;
   const rotated=[...options.slice(rotation),...options.slice(0,rotation)];
   cases.push({
    id,specialty:t.track,title:`${t.title}: Scenario ${v}`,patient,history:story,
    findings:[t.findings[0],t.findings[1],`Patient goal: ${goal}.`],
    question:t.safety?"What is the leading safety concern that requires prioritized clinical action?":
      "Which working hypothesis best explains the findings, after checking important alternatives?",
    options:rotated,correct:rotated.indexOf(t.title),
    explanation:t.why,clue:"Combine the symptom timeline, targeted functional changes, objective findings and relevant safety screening.",
    safety:!!t.safety
   });
   // Clinical red flags MUST be asked about if the case is urgent.
   const historyQuestions:[string,string][]=[
    ["What matters most to you or your caregiver in everyday life?",`${goal} is important right now.`],
    ["Can you describe when this changed and which symptoms you noticed?",t.history],
    ["Have there been signs of deterioration or other concerning symptoms?",t.safety?
       (t.urgency||"There has been a concerning change that requires prompt assessment."):
       "No emergency warning symptoms have been reported in this teaching vignette, but please screen for them."],
   ];
   // For urgent situations, screening is the strongest history priority;
   // in routine rehabilitation, the onset/symptom behavior question is strongest.
   const bestHistory=t.safety?2:1;
   const diffOptions=[
    `Compare ${t.title} with ${t.alternatives[0]} and ${t.alternatives[1]}; check the most discriminating findings and safety features.`,
    `Prioritize ${t.alternatives[0]} and ${t.alternatives[2]} without exploring the leading examination pattern.`,
    `Consider ${t.title} alone without screening for related mimics or important warning signs.`
   ];
   const diffShift=(i+t.key.length)%3;
   const differential=[...diffOptions.slice(diffShift),...diffOptions.slice(0,diffShift)];
   const treatmentOptions=t.management;
   const treatmentShift=(i*2+t.key.length)%3;
   const treatment=[...treatmentOptions.slice(treatmentShift),...treatmentOptions.slice(0,treatmentShift)];
   flows[id]={
    chief:t.chief,historyQuestions,bestHistory,
    differential,differentialCorrect:differential.indexOf(diffOptions[0]),
    differentialWhy:`Consider the complete clinical pattern and investigate alternatives before choosing a working diagnosis. ${t.examWhy}`,
    treatment,treatmentCorrect:treatment.indexOf(t.management[0]),treatmentWhy:t.why
   };
   exams[id]={
    question:t.safety?
       "Which examination or escalation is the safest immediate clinical priority?":
       "Which examination will best discriminate the main functional problem and relevant safety risks?",
    options:t.exam,correct:0,why:t.examWhy,
    alternatives:[
      "This may be clinically relevant but does not address the main evidence needed first.",
      "This is a reasonable secondary assessment, but another priority better matches the current symptom and safety pattern.",
      "This can be added if subsequent findings justify it; it is not the most informative first choice."
    ]
   };
   regionById[id]=t.region;
  }
 }
 return {cases,flows,exams,regionById};
}
