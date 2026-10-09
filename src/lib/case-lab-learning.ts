import type {CaseStory} from "./case-lab-story";
import type {ClinicalCaseGuide} from "./clinical-case-guides";

/**
 * Case Lab is a TEACHING reference; Clinical Arena is the scored challenge.
 * All findings below come from authored case data. Avoid invented vitals,
 * imagined examination results or prescriptive doses without assessment.
 */
export type CaseLearningGuide={
 condition:string;
 chapters:{
  context:string[];
  subjective:string[];
  examination:string[];
  differential:string[];
  management:string[];
  dosage:string[];
  followUp:string[];
  pitfalls:string[];
  takeaways:string[];
 };
 practiceQuestion:string;
 practiceAnswer:string;
 patientDialogue:{question:string;answer:string}[];
 isFullyAuthored:boolean;
};

type Guidance={
 history:string[];
 exam:string[];
 therapy:string[];
 dose:string[];
 follow:string[];
 caution:string[];
};

const commonQuestions=[
 "What was the timeline, how did the problem begin, and what has changed?",
 "Which activities matter most to the person, and what makes them easier or harder?",
 "What features would make routine rehabilitation unsafe or require medical review?"
];

/** Category-specific clinical teaching principles, not claims about measured patient findings. */
const guidance:Record<string,Guidance>={
 "MSK & Sports":{
  history:["Clarify location, onset, loading pattern, 24-hour behavior, irritability, trauma history and functional goal.","Ask how much activity was tolerated before symptoms started and which movements create a reproducible response."],
  exam:["Start with observation and relevant active movement; compare appropriate sides or tasks, then choose targeted strength, neurological or special tests as indicated.","Explain the test, position the patient securely, stabilize the intended segment and use a graded, controlled movement; document exactly what reproduces their familiar symptoms.","A positive special test changes the probability of a diagnosis; one isolated test is not definitive."],
  therapy:["Use education and graded, meaningful movement to address the main functional limitation, checking whether the response matches the working hypothesis.","Choose exercise and manual techniques only when supported by presentation, consent, goals and evidence; none is mandatory for every diagnosis."],
  dose:["Choose starting load, range, repetitions and frequency based on irritability, strength and current tolerance, not a fixed prescription applied to everyone.","Recheck symptoms during the session and their next-day response before increasing resistance, speed or overall training volume."],
  follow:["Repeat the same relevant functional task, movement or strength measure under comparable conditions.","Progress toward work or sport-specific demands in stages; reassess the hypothesis if symptoms change unexpectedly."],
  caution:["Avoid assuming pain location identifies a single injured tissue.","Do not use forceful testing or manipulation where fracture, instability, major neurological deficit or systemic illness is suspected."]
 },
 "Neurological Rehabilitation":{
  history:["Ask what the patient could do before the neurological event or progression, what changed and which goals matter to them and their caregivers.","Screen new weakness, sensory change, swallowing or breathing concerns, falls, fatigue and medication timing when appropriate."],
  exam:["Observe function first: bed mobility, transfers, postural control, gait and arm use as appropriate to the patient.","Select neurological measures by presentation—motor control, sensation, tone, coordination, balance, cognition and mobility; standardize tests when available.","Do not treat poor verbal expression as poor understanding or assume one impaired movement explains all activity limits."],
  therapy:["Build a meaningful, supervised task-practice program with graded challenge, feedback and adaptive equipment when required.","Coordinate speech, occupational, medical and caregiver support; neurological recovery is not just a strength score."],
  dose:["Dose the number and difficulty of task repetitions around fatigue, cardiovascular response, attention and quality of movement.","Progress complexity, environmental distractions and independence only when guarding and clinical status make it safe."],
  follow:["Track a patient-important task plus appropriate standardized mobility or participation outcomes.","Monitor new neurological symptoms and changes in cognition, fatigue or ability to follow the program."],
  caution:["New focal deficits or sudden change require urgent medical evaluation; do not label acute deterioration as routine rehabilitation.","Avoid unsafe unsupervised standing and walking when balance or awareness is impaired."]
 },
 "Pediatric Rehabilitation":{
  history:["Interview the child where developmentally appropriate and the caregiver; ask about birth/developmental history, play, school participation and the family's priorities.","Interpret milestones using developmental age and individual history rather than treating one missed milestone as a confirmed diagnosis."],
  exam:["Use age-appropriate observation of play, transitional movement, posture, coordination and functional activity.","Position and handle gently, explain to the caregiver, obtain appropriate consent or assent, and choose valid pediatric assessments when trained.","Screen neurological, musculoskeletal, visual, medical and developmental contributors instead of interpreting one isolated movement."],
  therapy:["Make therapy play-based, family-centered and linked to a meaningful skill; agree on small, achievable home activities.","Coach caregivers to create safe everyday practice opportunities without forcing positions or painful ranges."],
  dose:["Choose short, engaging bouts suited to attention, endurance, age and comfort, adjusting to the child's cues.","Progress task difficulty and repetition through familiar games rather than forcing one fixed adult exercise schedule."],
  follow:["Observe the same functional milestones or participation goals over time and ask what improved at home or school.","Modify the plan as the child grows; involve pediatric specialist services when skills regress or warning signs appear."],
  caution:["Do not present caregiver suspicions as confirmed diagnoses.","Regression of previously acquired milestones, progressive weakness or acute illness needs prompt medical assessment."]
 },
 "Cardiopulmonary Rehabilitation":{
  history:["Ask about breathlessness, cough, exertional symptoms, chest discomfort, recovery time, recent admissions and relevant medical care.","Review known exercise restrictions and whether symptoms are stable or worsening; ask the patient what daily activity they wish to regain."],
  exam:["Confirm medical stability before exertion, review available clinical observations, and monitor symptoms and appropriate physiological measures.","Choose a suitable supervised functional capacity assessment; describe duration, workload, recovery and observed response instead of relying on one number.","Stop and escalate new concerning chest symptoms, syncope, severe respiratory distress or unexpected deterioration."],
  therapy:["Use coordinated respiratory or cardiac rehabilitation and functional reconditioning only when medically appropriate.","Teach symptom-aware pacing and condition-specific education; medical therapy and rehabilitation complement one another."],
  dose:["Start at a medically appropriate, tolerated intensity, monitor exertion, breathlessness and relevant vital signs, and adjust according to stability.","Progress duration and intensity in measured steps; stop when physiological response breaches the individual's clinical safety limits."],
  follow:["Compare an appropriate functional capacity outcome and symptom recovery under similar conditions.","Review changes in medical status, medication, oxygen requirements or worsening dyspnea with the treating team."],
  caution:["Physiotherapy exercise is not the first response to suspected pulmonary embolism, acute cardiac instability or severe desaturation.","Never invent oxygen thresholds or infer stability from resting symptoms alone."]
 },
 "Geriatrics & Falls":{
  history:["Ask for the circumstances of each fall: timing, dizziness, syncope, injury, medications, vision, mobility aid and environmental hazards.","Explore the patient's priorities and fear of falling without implying that avoiding all activity is the solution."],
  exam:["Use safe transfer, gait and balance observation with appropriate guarding and validated tests when feasible.","Consider orthostatic vital signs and sensory, strength, cognitive and environmental contributors; do not assume all falls arise from weak leg muscles."],
  therapy:["Combine individualized strength and balance tasks with practical falls-risk modification and interdisciplinary review.","Choose the right assistive device and safe home practice with the patient and caregiver."],
  dose:["Begin with supported, repeatable tasks the person can perform safely, using rest as needed.","Progress challenge slowly by changing one variable—support, step height, speed or dual-task demand—while preserving safety."],
  follow:["Track falls or near-falls, confidence and a repeatable gait, chair-rise or balance measure.","Coordinate medication or cardiovascular review when indicated and revisit home or community barriers."],
  caution:["New syncope, sudden neurologic deficit or injury after a fall needs appropriate medical assessment.","Guard challenging standing tasks; do not encourage patients to push through presyncope."]
 },
 "Vestibular Rehabilitation":{
  history:["Distinguish seconds-long positional spinning from continuous vertigo, prolonged imbalance, visual motion sensitivity and presyncope.","Ask about new headache, neurological symptoms, hearing changes, triggers, duration, falls and migraine features."],
  exam:["Perform neurological and vascular/neck safety screening before provocative positional or gaze testing.","Choose an appropriate vestibular evaluation—positional nystagmus, gaze stability, balance or gait—according to history and professional training.","Document the direction, duration and context of eye-movement findings rather than calling all dizziness BPPV."],
  therapy:["For supported BPPV, select canal-specific repositioning; for gaze or balance impairment, choose individualized graded vestibular exercises.","Explain that different dizziness mechanisms require different management, including medical referral when appropriate."],
  dose:["Use symptom-guided repetitions and rest, adjusting exposure rather than giving every patient the same head movements.","Increase head movement speed, visual complexity and functional challenge only with an appropriate recovery response."],
  follow:["Reassess the original positional, gaze-stability or functional balance complaint using a consistent method.","Check whether dizziness, falls and activity participation have changed."],
  caution:["Sudden continuous severe vertigo with new focal neurological signs or severe ataxia requires emergency stroke assessment.","Do not perform indiscriminate repositioning or forceful cervical movement when contraindications exist."]
 },
 "Pelvic Health":{
  history:["Ask sensitively about leakage, urgency, pelvic pressure, pain, function, birth or surgical history and what activities are being avoided.","Use consent-led, private questioning; symptoms may have several causes and should not be dismissed as 'normal'."],
  exam:["Begin with functional history, symptom diary and noninvasive movement or breathing tasks where indicated.","Only appropriately trained clinicians should offer intimate assessment with explicit informed consent, privacy and the ability to stop.","Screen medical and obstetric warning signs before loading or making a diagnosis."],
  therapy:["Use individualized pelvic-floor coordination and muscle training or pressure-management strategies when appropriate.","Relate treatment to childcare, work, exercise or other meaningful goals; involve pelvic-health specialists as needed."],
  dose:["Choose hold times, relaxation, repetitions and loading based on actual assessed function; more squeezing is not universally better.","Increase impact or lifting exposure gradually and use symptom and next-day response to adjust load."],
  follow:["Review symptom frequency, functional confidence, a relevant diary and the patient's stated participation goal.","Refer persistent, worsening or atypical symptoms for appropriate medical care."],
  caution:["Never assume invasive examinations are mandatory or permitted.","New retention, severe pain, bleeding or other concerning symptoms warrant medical review."]
 },
 "Oncology Rehabilitation":{
  history:["Ask about current and past treatments, wound healing, fatigue, swelling, pain, bone involvement, numbness and goals.","Review whether the oncology team has placed activity or loading precautions."],
  exam:["Screen for medical instability, bone fragility or neurological signs before functional or resisted testing.","Select mobility, strength, balance or activity-tolerance measures only after considering treatment effects and clinical safety."],
  therapy:["Tailor mobility, strengthening and supportive education to the patient's current capacity and medical guidance.","Coordinate with oncology, surgical, lymphatic or palliative teams as appropriate, respecting the patient's own priorities."],
  dose:["Begin conservatively and progress with symptom, fatigue, healing and medical monitoring.","Modify or pause loading if there is concerning bone pain, new swelling or neurological deterioration."],
  follow:["Reassess a meaningful daily task and the relevant treatment-related impairments.","Monitor fatigue, swelling, pain and new red flags with the medical team."],
  caution:["Known cancer with new progressive spinal pain, weakness or bladder changes requires emergency evaluation for possible cord compression.","Do not use aggressive manual techniques over fragile bones, unhealed tissue or suspicious areas."]
 },
 "Critical Care & ICU":{
  history:["Review current medical status, clinical team clearance, baseline function and the person's communication and rehabilitation goals.","Consult nursing, respiratory and medical teams about lines, support, consciousness and physiological risks."],
  exam:["Assess mobilization readiness and monitor airway, hemodynamics, alertness, lines and symptoms before any bedside task.","Start with safe bed-level movement, supported sitting or transfer assessment only if the multidisciplinary team considers it appropriate."],
  therapy:["Coordinate graded mobility with the ICU team while protecting airway, vascular access and physiological stability.","Prioritize function, safe positioning and patient engagement rather than pursuing high-intensity exercise."],
  dose:["Use brief, closely monitored activity appropriate to readiness with reassessment after each position change.","Stop or defer mobilization if vital signs become unstable, support needs escalate or new symptoms arise."],
  follow:["Record tolerance, function achieved and reasons for stopping or progressing.","Review readiness again as sedation, strength and organ support change."],
  caution:["Unstable blood pressure, escalating circulatory support or respiratory deterioration takes precedence over exercise goals.","Never mobilize a ventilated or line-dependent patient without appropriate staff and institutional precautions."]
 },
 "Clinical Red Flags":{
  history:["Clarify onset and progression of the dangerous features, the patient's exact words and any changes from baseline.","Determine the urgency from the clinical pattern and medical pathways rather than waiting for more routine musculoskeletal testing."],
  exam:["Prioritize brief, safe information gathering and immediate referral or emergency response as required.","Do not delay escalation to complete every impairment test; record what was observed and communicated."],
  therapy:["Pause routine physiotherapy interventions and arrange appropriate urgent or emergency medical assessment.","Communicate a structured handover including timeline, observations, relevant medical history and the reason for concern."],
  dose:["No routine exercise dose is appropriate before the suspected emergency has been assessed and cleared.","Resume rehabilitation only after medical direction and an updated safety plan."],
  follow:["Confirm that the referral pathway and handover were completed and document the response.","Reassess rehabilitation eligibility only following appropriate medical review."],
  caution:["Do not use reassuring pain scores to exclude neurological, infectious, vascular or cardiopulmonary emergencies.","Avoid provocative or forceful testing that could worsen a serious condition."]
 }
};
function strings(values:(string|null|undefined)[]):string[]{
 return [...new Set(values.map(x=>(x||"").trim()).filter(Boolean))];
}
function authored(g:ClinicalCaseGuide|undefined,key:keyof ClinicalCaseGuide,fallback:string[]):string[]{
 return g?.[key]?.length ? g[key] : fallback;
}
export function buildCaseLearningGuide(story:CaseStory):CaseLearningGuide{
 const group=story.urgent?"Clinical Red Flags":story.category;
 const advice=guidance[group]||guidance["MSK & Sports"];
 const saved=story.guide;
 const relevant=story.differentials;
 const condition=story.diagnosisCorrect>=0
  ?story.diagnosisChoices[story.diagnosisCorrect]
  :relevant[0]?.diagnosis||"Clinical working hypothesis";
 const clinical=story.diagnosisReason;
 const guidedHistory=story.history.slice(0,5).map(([q,a])=>q+" — Teaching clue: "+a);
 const meaningful=story.findings.slice(0,3);
 const subjective=authored(saved,"keyQuestions",strings([
  ...guidedHistory,
  ...advice.history,
  "Relate the reported symptoms to the patient's personal goals and the pattern of function in this case."
 ]));
 const examination=authored(saved,"examinationSequence",strings([
  ...meaningful.map((x,i)=>"Observation "+(i+1)+": "+x),
  "Most useful assessment priority: "+story.examChoices[story.examCorrect>=0?story.examCorrect:0],
  "Why it matters: "+story.examReason,
  ...advice.exam
 ]));
 const comparison=relevant.map((x,i)=>(
  (i===0?"Clinical hypothesis: ":"Alternative to check: ")+x.diagnosis+
  ". "+x.reasoning
 ));
 const differentials=authored(saved,"decisionLogic",strings([
  "Working interpretation: "+clinical,
  ...comparison,
  "Ask: Which examination finding, warning sign or symptom response would change this hypothesis?"
 ]));
 const management=authored(saved,"practicalManagement",strings([
  ...story.management,
  ...advice.therapy,
  story.urgent?"Do not replace referral with routine physiotherapy treatment.":
   "Decide together what activity or function will show that the treatment plan is working."
 ]));
 const dosage=authored(saved,"exerciseDose",story.urgent
  ?guidance["Clinical Red Flags"].dose
  :strings([...advice.dose,
    "Record the baseline response and choose reassessment timing based on the condition, setting and patient's tolerance."]));
 const followUp=authored(saved,"reassessment",strings([
  ...story.progression,
  ...advice.follow,
  story.urgent?"Document escalation and specialist communication before considering rehabilitation.":"Adjust the plan when outcomes do not support the original hypothesis."
 ]));
 const pitfalls=authored(saved,"commonMistakes",advice.caution);
 const takeaways=authored(saved,"masterTakeaway",strings([
  ...story.learning,
  "The best plan fits the patient's story, clinical signs, safety status and personal goals."
 ]));
 return{
  condition,
  chapters:{
   context:strings([
    story.opening,
    ...story.scene.filter(x=>!x.startsWith("You are seeing this patient")&&!x.startsWith("Your next decision")&&!x.startsWith("The patient's initial words")),
    "Patient profile: "+story.patient,
    story.urgent?"Safety-sensitive presentation: urgent evaluation may be the correct next action.":"Teaching focus: connect the person's functional limitation with measurable clinical reasoning."
   ]),
   subjective,examination,differential:differentials,
   management,dosage,followUp,pitfalls,takeaways
  },
  patientDialogue:story.history.slice(0,6).map(([question,answer])=>({question,answer})),
  practiceQuestion:story.examPrompt,
  practiceAnswer:story.examCorrect>=0
   ?story.examChoices[story.examCorrect]+". "+story.examReason
   :"Several assessment steps may be useful. Compare the detailed examination sequence and safety priorities.",
  isFullyAuthored:!!saved
 };
}
