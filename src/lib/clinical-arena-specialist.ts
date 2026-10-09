import type { Template } from "./clinical-arena-multispecialty-core";
export const specialistTemplates:Template[]=[
 {
  "key": "women-sui",
  "title": "Stress urinary incontinence",
  "track": "Women's Health & Pelvic Floor",
  "region": "Pelvic Health",
  "cohort": "postpartum",
  "chief": "I sometimes leak urine when I cough or jump.",
  "history": "Following childbirth, small urine leakage is linked to pressure increases during coughing and jumping, without dysuria or concerning neurological symptoms.",
  "findings": [
   "Leakage during exertion-related pressure increase",
   "Impact on exercise participation and confidence"
  ],
  "exam": [
   "Use consent-based pelvic floor history, bladder diary and appropriately trained pelvic floor assessment, including contraction coordination.",
   "Assume any leakage is a urinary infection.",
   "Begin invasive examination without consent or scope.",
   "Measure only abdominal strength as pelvic floor function."
  ],
  "examWhy": "Stress-related urinary leakage is associated with pressure activities; a broader screen remains necessary.",
  "alternatives": [
   "Urge urinary incontinence",
   "Urinary tract infection",
   "Mixed urinary incontinence"
  ],
  "management": [
   "Offer individualized pelvic floor muscle training with correct technique and bladder education, within practitioner competence.",
   "Recommend prolonged breath holding to prevent leakage.",
   "Avoid all exercise permanently."
  ],
  "why": "Pelvic floor muscle training is a first-line conservative option for stress leakage.",
  "safety": false
 },
 {
  "key": "women-uui",
  "title": "Urgency urinary incontinence",
  "track": "Women's Health & Pelvic Floor",
  "region": "Pelvic Health",
  "cohort": "postpartum",
  "chief": "When the urge to pee comes, sometimes I cannot reach the toilet.",
  "history": "Urine leakage follows sudden strong urgency and frequency rather than only coughing or impact activity.",
  "findings": [
   "Urgency episodes documented on bladder diary",
   "Possible trigger-related voiding behavior"
  ],
  "exam": [
   "Review bladder history, fluid habits, diary and red flags; assess pelvic floor function with informed consent.",
   "Assume isolated stress leakage without checking urgency.",
   "Perform pelvic internal examination without permission.",
   "Focus only on hip abductor strength."
  ],
  "examWhy": "Symptom pattern and exclusion of infection/other causes guide conservative care.",
  "alternatives": [
   "Stress urinary incontinence",
   "Urinary tract infection",
   "Overflow incontinence"
  ],
  "management": [
   "Teach bladder-training strategies and individualized pelvic floor work with appropriate medical review.",
   "Restrict fluids excessively without clinical reason.",
   "Delay care when new hematuria or retention is reported."
  ],
  "why": "Bladder training and pelvic floor rehabilitation can improve urgency symptoms.",
  "safety": false
 },
 {
  "key": "women-prolapse",
  "title": "Symptomatic pelvic organ prolapse",
  "track": "Women's Health & Pelvic Floor",
  "region": "Pelvic Health",
  "cohort": "postpartum",
  "chief": "I feel pressure or a bulging sensation after being on my feet.",
  "history": "Pelvic heaviness is greater during prolonged standing and straining and easier after rest; patient seeks a nonoperative option.",
  "findings": [
   "Reported vaginal bulge/heaviness affecting participation",
   "Bowel strain and lifting demands may increase symptoms"
  ],
  "exam": [
   "Use sensitive consent-based symptom and functional history and coordinate indicated pelvic examination with appropriately trained care.",
   "Diagnose prolapse grade solely by abdominal palpation.",
   "Perform an internal exam without informed consent.",
   "Assume pelvic pain is always prolapse."
  ],
  "examWhy": "Symptoms and appropriate examination distinguish prolapse from other pelvic presentations.",
  "alternatives": [
   "Pelvic floor myalgia",
   "Urinary incontinence without prolapse",
   "Pelvic mass"
  ],
  "management": [
   "Offer pelvic floor training, pressure-management strategies and referral for pessary/medical options if desired.",
   "Advise maximal straining as the preferred strengthening method.",
   "Dismiss symptomatic protrusion without discussion."
  ],
  "why": "Shared decision-making supports conservative prolapse management.",
  "safety": false
 },
 {
  "key": "women-diastasis",
  "title": "Postpartum abdominal wall function change",
  "track": "Women's Health & Pelvic Floor",
  "region": "Pelvic Health",
  "cohort": "postpartum",
  "chief": "My stomach feels less supportive when lifting my child.",
  "history": "After childbirth, patient notices abdominal midline change and reduced trunk function without a new painful or nonreducible mass.",
  "findings": [
   "Abdominal wall task performance is reduced",
   "Inter-recti distance alone does not determine function"
  ],
  "exam": [
   "Assess functional trunk control, symptoms and abdominal wall behavior during relevant activities; screen hernia red flags.",
   "Judge success only by finger-width gap.",
   "Perform heavy loaded sit-ups regardless of symptoms.",
   "Diagnose severe pathology from visible abdominal shape alone."
  ],
  "examWhy": "Functional measures are more relevant than treating a single inter-recti distance as a disease.",
  "alternatives": [
   "Abdominal wall hernia",
   "Pelvic girdle pain",
   "Low back pain"
  ],
  "management": [
   "Use individualized progressive strength and functional loading matched to symptoms and patient goals.",
   "Ban all abdominal exercise indefinitely.",
   "Promise that a single exercise will close the gap for everyone."
  ],
  "why": "Graded loading and individualized goals guide postpartum abdominal rehabilitation.",
  "safety": false
 },
 {
  "key": "women-pgp",
  "title": "Pregnancy-related pelvic girdle pain",
  "track": "Women's Health & Pelvic Floor",
  "region": "Pelvic Health",
  "cohort": "postpartum",
  "chief": "Turning in bed and standing on one leg is uncomfortable.",
  "history": "During pregnancy or in postpartum recovery, localized pelvic girdle pain occurs during asymmetric loading and transfers.",
  "findings": [
   "Pain reproduced during specific transfers and single-leg loading",
   "Mobility limits affect childcare and stairs"
  ],
  "exam": [
   "Screen obstetric/neurological red flags, then assess functional pelvic loading and pain response with informed consent.",
   "Use one provocative test to confirm a specific tissue lesion.",
   "Apply high-force pelvic thrust without obstetric screening.",
   "Only examine cervical posture."
  ],
  "examWhy": "Pelvic girdle pain involves characteristic functional aggravation and must be assessed in context.",
  "alternatives": [
   "Lumbar radiculopathy",
   "Hip joint pathology",
   "Pubic symphysis pain"
  ],
  "management": [
   "Teach load modification, individualized pelvic/trunk strength and supportive activity strategies.",
   "Prescribe complete bed rest as routine care.",
   "Continue high-intensity painful unilateral loading without adjustment."
  ],
  "why": "Supportive exercise and practical movement strategies may reduce limitation.",
  "safety": false
 },
 {
  "key": "onc-breast",
  "title": "Post-breast-surgery shoulder limitation",
  "track": "Oncology Rehabilitation",
  "region": "Cancer Rehabilitation",
  "cohort": "adult",
  "chief": "My shoulder feels tight when reaching overhead after surgery.",
  "history": "After breast surgery, shoulder movement is restricted, and scar discomfort limits daily tasks; surgical healing is being monitored.",
  "findings": [
   "Reduced shoulder elevation and external rotation",
   "Scar sensitivity and possible lymphatic issues affect exercise progression"
  ],
  "exam": [
   "Screen wound/medical restrictions, then measure active/passive shoulder range, function and lymphedema signs.",
   "Use forceful manual scar mobilization despite unhealed incision.",
   "Assess only cervical spinal rotation.",
   "Ignore new arm swelling during loading."
  ],
  "examWhy": "Breast cancer rehabilitation requires post-surgical safety and function assessment.",
  "alternatives": [
   "Adhesive capsulitis",
   "Rotator cuff-related shoulder pain",
   "Cervical radiculopathy"
  ],
  "management": [
   "Use gentle progressive shoulder mobility and strengthening with scar/wound and lymphatic precautions.",
   "Apply vigorous stretching through fresh surgical healing.",
   "Assume all arm swelling is benign and continue."
  ],
  "why": "Coordinate functional shoulder recovery with oncology and surgical teams.",
  "safety": false
 },
 {
  "key": "onc-cipn",
  "title": "Chemotherapy-associated peripheral neuropathy balance",
  "track": "Oncology Rehabilitation",
  "region": "Cancer Rehabilitation",
  "cohort": "adult",
  "chief": "My feet feel numb since treatment and I stumble more.",
  "history": "Cancer survivor reports distal tingling and reduced balance after neurotoxic systemic therapy.",
  "findings": [
   "Symmetric distal sensory disturbance",
   "Balance and footwear safety are affected"
  ],
  "exam": [
   "Review treatment history, sensory function, balance, fall risk and neuropathy monitoring with oncology team.",
   "Use only local shoulder strength.",
   "Assume symptoms always indicate spinal radiculopathy.",
   "Prescribe eyes-closed obstacles without guarding."
  ],
  "examWhy": "Chemotherapy neuropathy is a clinical and treatment-history-associated cause of sensory gait impairment.",
  "alternatives": [
   "Diabetic peripheral neuropathy",
   "Lumbar radiculopathy",
   "Vestibular hypofunction"
  ],
  "management": [
   "Offer guarded strength/balance and sensory-compensation training, plus safety and symptom monitoring.",
   "Use barefoot unsupervised balance challenges despite poor sensation.",
   "Ignore worsening motor weakness."
  ],
  "why": "Fall prevention and tailored exercise may help treatment-related neuropathy.",
  "safety": false
 },
 {
  "key": "onc-fatigue",
  "title": "Cancer-related fatigue rehabilitation",
  "track": "Oncology Rehabilitation",
  "region": "Cancer Rehabilitation",
  "cohort": "adult",
  "chief": "Even after resting, I feel drained and want to do more again.",
  "history": "Person receiving stable oncology follow-up has persistent fatigue, sleep disruption and activity reduction without current acute emergency signs.",
  "findings": [
   "Fatigue limits daily participation",
   "Functional tolerance varies with treatment cycles"
  ],
  "exam": [
   "Assess fatigue severity, activity tolerance, anemia/infection warning symptoms and patient goals.",
   "Use exhaustive exercise without checking oncology status.",
   "Assume all fatigue is lack of motivation.",
   "Rely on resting pulse alone to quantify fatigue."
  ],
  "examWhy": "Fatigue is multidimensional and should be evaluated alongside medical causes and treatment status.",
  "alternatives": [
   "Anemia",
   "Depression-related fatigue",
   "Cardiopulmonary deconditioning"
  ],
  "management": [
   "Use individually paced aerobic and resistance activities with symptom-aware coordination of medical care.",
   "Push maximal intensity despite treatment-related symptom worsening.",
   "Advise complete inactivity as the only strategy."
  ],
  "why": "Individualized activity can help fatigue while medical contributors are addressed.",
  "safety": false
 },
 {
  "key": "onc-mscc",
  "title": "Metastatic spinal cord compression warning",
  "track": "Oncology Rehabilitation",
  "region": "Cancer Rehabilitation",
  "cohort": "adult",
  "chief": "My back pain is new, and my legs are getting weaker.",
  "history": "Person with cancer history reports progressively worsening spinal pain and new gait weakness with bladder symptoms.",
  "findings": [
   "New objective leg weakness in cancer context",
   "Spinal pain with possible autonomic change"
  ],
  "exam": [
   "Stop provocative therapy and arrange emergency medical assessment for possible metastatic spinal cord compression.",
   "Perform high-force spinal mobilization to localize segment.",
   "Use resisted gait testing to exhaustion.",
   "Wait for standard exercise reassessment next week."
  ],
  "examWhy": "Known malignancy with evolving neurological deficits and bladder change is an oncologic emergency.",
  "alternatives": [
   "Degenerative lumbar stenosis",
   "Peripheral neuropathy",
   "Vertebral compression fracture"
  ],
  "management": [
   "Initiate emergency medical handover and avoid spinal loading pending assessment.",
   "Prescribe loaded lumbar flexion before imaging.",
   "Treat as simple mechanical back pain without escalation."
  ],
  "why": "Prompt evaluation is critical for possible metastatic spinal cord compression.",
  "safety": true,
  "urgency": "The leg weakness is new and my bladder control has changed."
 },
 {
  "key": "icu-weakness",
  "title": "ICU-acquired weakness functional recovery",
  "track": "Critical Care & ICU",
  "region": "ICU & Acute Care",
  "cohort": "icu",
  "chief": "I am very weak after being critically ill and need help sitting up.",
  "history": "Patient is medically stabilized after prolonged critical illness and has generalized weakness affecting basic mobility.",
  "findings": [
   "Global limb strength and bed mobility reduced",
   "Physiological response to positioning and transfers requires monitoring"
  ],
  "exam": [
   "Assess readiness, MRC-sum strength when appropriate, bed mobility, lines, vitals and exertional response.",
   "Begin unguarded stair climbing before bedside tolerance.",
   "Use only passive wrist range as a global function measure.",
   "Ignore delirium and command following."
  ],
  "examWhy": "Post-critical illness weakness assessment combines strength, alertness, hemodynamic stability and function.",
  "alternatives": [
   "Primary neurological stroke",
   "Chronic peripheral neuropathy",
   "Simple disuse without critical illness"
  ],
  "management": [
   "Start a graded multidisciplinary bedside mobility program with physiological and line monitoring.",
   "Use heavy strengthening despite unstable vital signs.",
   "Skip nursing and respiratory team coordination."
  ],
  "why": "Early rehabilitation is individualized to readiness and safety.",
  "safety": false
 },
 {
  "key": "icu-vent",
  "title": "Mechanically ventilated patient mobilization readiness",
  "track": "Critical Care & ICU",
  "region": "ICU & Acute Care",
  "cohort": "icu",
  "chief": "I am awake and want to move, but the monitors and tubes make me nervous.",
  "history": "Awake mechanically ventilated patient has a collaborative team and potential for graded bedside mobilization if stability checks are met.",
  "findings": [
   "Requires coordinated management of airway, lines and support",
   "Sedation, strength and hemodynamic status affect readiness"
  ],
  "exam": [
   "Use ICU mobilization readiness checklist with airway, vital stability, sedation, lines and multidisciplinary staffing.",
   "Remove ventilator support to test spontaneous walking without team clearance.",
   "Perform only ankle MMT with no airway check.",
   "Transfer patient without staff guarding lines."
  ],
  "examWhy": "Safe mobilization on ventilation depends on readiness and skilled multidisciplinary coordination.",
  "alternatives": [
   "ICU-acquired weakness without ventilation",
   "Post-sedation delirium",
   "Orthostatic intolerance"
  ],
  "management": [
   "Mobilize in graded team-supervised stages only after airway and hemodynamic clearance.",
   "Stand the patient alone while tubing remains unsecured.",
   "Ignore new desaturation during activity."
  ],
  "why": "Mechanical ventilation does not automatically prohibit mobilization, but risk control is essential.",
  "safety": false
 },
 {
  "key": "icu-unstable",
  "title": "Hemodynamic instability during early mobilization",
  "track": "Critical Care & ICU",
  "region": "ICU & Acute Care",
  "cohort": "icu",
  "chief": "When I try to sit up, I feel faint and the team notices my blood pressure falling.",
  "history": "During critical care, patient has unstable blood pressure and escalating support requirements; bedside mobility is being considered.",
  "findings": [
   "Symptomatic hypotension during upright positioning",
   "Clinical team reports instability requiring stabilization"
  ],
  "exam": [
   "Defer active mobilization, reassess vital trends and involve ICU team for stabilization before any progression.",
   "Continue transfer training despite hypotension and rising support.",
   "Use maximal bedside exercise to restore pressure.",
   "Ignore monitoring alarms during sitting."
  ],
  "examWhy": "Hemodynamic instability or escalating vasopressor needs can contraindicate active mobilization until stabilized.",
  "alternatives": [
   "Orthostatic intolerance in a stable patient",
   "ICU-acquired weakness",
   "Uncomplicated deconditioning"
  ],
  "management": [
   "Stop activity, stabilize with ICU team and reassess eligibility once safe.",
   "Proceed with out-of-bed walking despite worsening pressure.",
   "Use exercise intensity to correct an unstable circulation."
  ],
  "why": "Physiological safety takes priority over mobilization goals.",
  "safety": true,
  "urgency": "The blood pressure keeps dropping and the team is adjusting support."
 }
];
