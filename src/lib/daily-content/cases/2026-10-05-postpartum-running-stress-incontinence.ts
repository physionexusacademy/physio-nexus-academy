import type { ClinicalCase } from "@/lib/clinical-cases";

export const case20261005Pelvic: ClinicalCase = {
 slug:"postpartum-running-stress-urinary-incontinence",
 title:"Postpartum Runner With Urinary Leakage During Impact",
 specialty:"Women's & Pelvic Health",
 difficulty:"Clinical",
 estimatedTime:"10–12 min",
 summary:"A simulated postpartum case integrating pelvic-floor symptoms, impact readiness, differential diagnosis and graded return to running.",
 presentation:[
  "A 33-year-old recreational runner is several months postpartum and wants to resume regular 5 km running.",
  "Walking and daily activities are comfortable, but small-volume urinary leakage occurs during jogging and repeated jumping.",
  "There is no fever, heavy bleeding, calf pain, chest pain or acute pelvic pain. The patient is frustrated and has started avoiding exercise."
 ],
 keyFindings:[
  "Leakage is linked to impact and increases with fatigue.",
  "Comfortable brisk walking is tolerated for 30 minutes.",
  "Single-leg calf endurance and repeated hop tolerance are below the patient's pre-pregnancy level.",
  "No neurological symptoms are reported.",
  "A pelvic-floor assessment by an appropriately trained clinician has not yet been completed."
 ],
 redFlags:[
  "Heavy or increasing vaginal bleeding, fever, wound concerns or acute pelvic/abdominal deterioration requires medical assessment.",
  "New unilateral calf swelling/pain, chest pain or unexplained shortness of breath requires urgent assessment for possible thromboembolic disease."
 ],
 differentials:[
  {diagnosis:"Stress urinary incontinence",reasoning:"Leakage occurs predictably with running and jumping, which increase intra-abdominal pressure and impact demand."},
  {diagnosis:"Pelvic organ prolapse-related dysfunction",reasoning:"Pelvic heaviness or bulging would increase suspicion; these symptoms should be asked about directly even when leakage is the main complaint."},
  {diagnosis:"Urinary tract or other urological disorder",reasoning:"Urgency, dysuria, hematuria, infection symptoms or leakage unrelated to exertion would alter the differential and referral pathway."},
  {diagnosis:"Global postpartum load-capacity deficit",reasoning:"Reduced calf and impact endurance can coexist with pelvic-floor symptoms and may contribute to poor running readiness without explaining leakage by itself."}
 ],
 finalDiagnosis:"Probable stress urinary incontinence during postpartum impact activity, with reduced whole-body running capacity; pelvic-health assessment and graded rehabilitation are indicated.",
 reasoning:[
  "Urinary leakage during impact is common but should not be dismissed as an inevitable postpartum finding.",
  "Running readiness is not determined by time postpartum alone; symptoms, tissue recovery, pelvic-floor function and whole-body capacity matter.",
  "The program should address both pelvic-health needs and the progressive impact demands required for running."
 ],
 management:[
  "Refer to or coordinate with a pelvic-health physiotherapist for appropriate pelvic-floor assessment and individualized training.",
  "Continue symptom-tolerated walking and progressive lower-limb strengthening rather than stopping all exercise.",
  "Train calf, hip and functional single-leg capacity with progressive resistance.",
  "Introduce graded low-level impact only when clinically appropriate, monitoring leakage, heaviness, pain and recovery.",
  "Use walk-run intervals as a bridge to continuous running when impact tasks are tolerated.",
  "Provide education that symptoms are treatable and should guide dosage rather than create fear of movement."
 ],
 progression:[
  "Build comfortable brisk walking and strength capacity first.",
  "Progress from controlled bilateral impact to repeated and single-leg impact when symptom response permits.",
  "Begin short walk-run intervals and increase one main variable at a time: running duration, frequency, speed or terrain.",
  "Reassess leakage, pelvic symptoms, impact tolerance and running confidence before advancing."
 ],
 learningPoints:[
  "Postpartum return to running should be criterion- and symptom-informed rather than calendar-only.",
  "Pelvic-floor symptoms and whole-body load capacity should be considered together.",
  "Urinary leakage during exercise is a clinical symptom worth assessing, not something the patient must simply accept.",
  "Red-flag postpartum symptoms require medical escalation rather than exercise progression."
 ],
 references:[
  {title:"Returning to running postnatal – guidelines for medical, health and fitness professionals managing this population",organization:"POGP / Running Physio",year:"2019",url:"https://thepogp.co.uk/_userfiles/pages/files/returning_to_running_postnatal_guideline_for_medical_health_and_fitness_professionals_managing_this_population.pdf"},
  {title:"Physical Activity and Exercise During Pregnancy and the Postpartum Period",organization:"American College of Obstetricians and Gynecologists",year:"2020",url:"https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/04/physical-activity-and-exercise-during-pregnancy-and-the-postpartum-period"}
 ],
 caseType:"Simulated evidence-based case"
};
