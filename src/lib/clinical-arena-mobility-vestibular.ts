import type { Template } from "./clinical-arena-multispecialty-core";
export const mobilityVestibularTemplates:Template[]=[
 {
  "key": "ger-frailty",
  "title": "Frailty-related mobility limitation",
  "track": "Geriatrics & Falls",
  "region": "Falls & Mobility",
  "cohort": "older",
  "chief": "I am moving more slowly and everyday tasks take longer.",
  "history": "Older adult with reduced reserve after recent activity decline; no acute illness reported.",
  "findings": [
   "Slower chair-rise performance and walking speed",
   "Low endurance across repeated functional movements"
  ],
  "exam": [
   "Assess frailty indicators, gait speed, chair rises, balance, nutrition and meaningful tasks.",
   "Use only maximal knee strength to classify frailty.",
   "Measure grip alone and ignore participation.",
   "Prescribe maximal treadmill speed before safety screening."
  ],
  "examWhy": "Frailty is multidimensional and should be assessed with physical function and contextual risks.",
  "alternatives": [
   "Sarcopenia alone",
   "Untreated cardiac instability",
   "Parkinsonian gait"
  ],
  "management": [
   "Provide progressive supervised multicomponent strength/balance work with nutrition and medical coordination.",
   "Prescribe bed rest to preserve strength.",
   "Use only passive joint movement without functional training."
  ],
  "why": "Multicomponent functional conditioning supports independence in frailty.",
  "safety": false
 },
 {
  "key": "ger-sarcopenia",
  "title": "Sarcopenia-related strength decline",
  "track": "Geriatrics & Falls",
  "region": "Falls & Mobility",
  "cohort": "older",
  "chief": "Lifting groceries and getting out of chairs has become harder.",
  "history": "Progressive reduction in muscle strength and physical performance without recent focal neurological deficit.",
  "findings": [
   "Low handgrip or chair-rise strength",
   "Reduced habitual walking speed and physical activity"
  ],
  "exam": [
   "Measure strength and physical performance using validated sarcopenia pathways and review nutrition.",
   "Use BMI alone to exclude muscle impairment.",
   "Perform only vestibular positional testing.",
   "Use one unguarded maximal balance test as main diagnostic measure."
  ],
  "examWhy": "Sarcopenia screening uses muscle strength, quantity/quality where appropriate, and performance.",
  "alternatives": [
   "Frailty from multiple systems",
   "Peripheral neuropathy",
   "Osteoarthritis-associated activity limitation"
  ],
  "management": [
   "Use progressive resistance training with nutritional/medical support tailored to tolerance.",
   "Assume no strengthening is worthwhile after a certain age.",
   "Use stretching alone to rebuild lost muscle."
  ],
  "why": "Strength-focused training is a principal rehabilitation strategy.",
  "safety": false
 },
 {
  "key": "ger-hip-fracture",
  "title": "Recovery after hip-fracture repair",
  "track": "Geriatrics & Falls",
  "region": "Falls & Mobility",
  "cohort": "older",
  "chief": "I need help getting up and walking after the operation.",
  "history": "After surgically managed hip fracture with documented weight-bearing instructions, transfer and gait confidence are reduced.",
  "findings": [
   "Reduced hip muscle performance and guarded gait",
   "Balance and assistive-device needs remain significant"
  ],
  "exam": [
   "Check surgical precautions and weight-bearing orders, then test transfers, gait and falls risk.",
   "Use full unrestricted resistance irrespective of orders.",
   "Assess only cervical motion.",
   "Wait for pain-free independent walking before any mobility assessment."
  ],
  "examWhy": "Orthopedic orders and safe functional mobility are core early rehabilitation priorities.",
  "alternatives": [
   "Hip osteoarthritis",
   "Lumbar radicular pain",
   "Greater trochanteric pain syndrome"
  ],
  "management": [
   "Progress permitted transfers and gait training with strength, falls prevention and equipment review.",
   "Ignore postoperative DVT symptoms or implant restrictions.",
   "Delay all walking until full muscular strength returns."
  ],
  "why": "Coordinate fracture rehabilitation with post-operative precautions and goals.",
  "safety": false
 },
 {
  "key": "ger-falls",
  "title": "Multifactorial recurrent falls",
  "track": "Geriatrics & Falls",
  "region": "Falls & Mobility",
  "cohort": "older",
  "chief": "I have fallen more than once and now I avoid going outside.",
  "history": "Recurrent trips and near-falls involve variable triggers, medications and environmental hazards.",
  "findings": [
   "Impaired turning and reduced single-leg balance",
   "Fear of falling affects participation"
  ],
  "exam": [
   "Review fall circumstances, orthostatic pressure, medications, gait/balance, footwear, vision and home hazards.",
   "Use one isolated ankle MMT grade to explain all falls.",
   "Prescribe balance exercises without screening syncope.",
   "Assess solely vestibular positional testing in every case."
  ],
  "examWhy": "Falls frequently have several interacting causes, so comprehensive assessment matters.",
  "alternatives": [
   "Vestibular hypofunction",
   "Peripheral neuropathy",
   "Orthostatic hypotension"
  ],
  "management": [
   "Deliver individualized strength/balance exercise and multidisciplinary risk modification.",
   "Advise permanent avoidance of outdoor activity without rehabilitation planning.",
   "Treat fear as irrelevant and encourage unguarded complex tasks."
  ],
  "why": "Multi-domain fall prevention improves safety and confidence.",
  "safety": false
 },
 {
  "key": "ger-osteoporosis",
  "title": "Osteoporosis with vertebral fragility risk",
  "track": "Geriatrics & Falls",
  "region": "Falls & Mobility",
  "cohort": "older",
  "chief": "I want to exercise safely because my bones are fragile.",
  "history": "Low bone density is documented; older adult seeks strength and posture training without new acute spinal pain.",
  "findings": [
   "Kyphotic posture and reduced back extensor endurance",
   "Fracture history and fall risk influence exercise selection"
  ],
  "exam": [
   "Review fragility fractures, risk, pain red flags and functional balance, then select safe loading progression.",
   "Perform loaded end-range repeated spinal flexion before risk review.",
   "Use spinal thrust manipulation to test bone strength.",
   "Assess only hand sensation and ignore skeletal risk."
  ],
  "examWhy": "Bone health exercise planning must respect fracture risks and falls.",
  "alternatives": [
   "Age-related postural changes alone",
   "Active vertebral compression fracture",
   "Degenerative lumbar stenosis"
  ],
  "management": [
   "Teach progressive resistance and balance training with safer spinal movement strategies and medical osteoporosis care.",
   "Use high-force spinal manipulation despite fragility.",
   "Restrict all safe weight-bearing activity indefinitely."
  ],
  "why": "Safe loading and fall reduction are central to osteoporosis care.",
  "safety": false
 },
 {
  "key": "ger-orthostatic",
  "title": "Orthostatic hypotension-related instability",
  "track": "Geriatrics & Falls",
  "region": "Falls & Mobility",
  "cohort": "older",
  "chief": "I feel lightheaded when I stand up quickly.",
  "history": "Older adult reports positional lightheadedness after medication changes and occasional near-falls; medical review is pending.",
  "findings": [
   "Symptoms follow transition from sitting to standing",
   "Standing blood pressure response may be abnormal"
  ],
  "exam": [
   "Measure lying/sitting-to-standing blood pressure and symptoms safely; review medications and syncope red flags.",
   "Assume BPPV and use repeated Dix-Hallpike as only test.",
   "Proceed with dynamic balance challenges without supervising standing.",
   "Test lumbar range as main reason for presyncope."
  ],
  "examWhy": "Orthostatic blood pressure measurement and medical medication review are relevant.",
  "alternatives": [
   "BPPV",
   "Cardiac arrhythmia",
   "Peripheral vestibular hypofunction"
  ],
  "management": [
   "Use safe transition education, fall prevention and prompt medical medication review.",
   "Encourage rapid repeated standing without support.",
   "Ignore fainting or chest symptoms if they emerge."
  ],
  "why": "Address hemodynamic contributors to dizziness and falls.",
  "safety": true,
  "urgency": "Standing can make me feel faint; I need an assessment before high-risk balance training."
 },
 {
  "key": "vest-posterior",
  "title": "Posterior-canal BPPV",
  "track": "Vestibular Rehabilitation",
  "region": "Vestibular & Balance",
  "cohort": "older",
  "chief": "The room spins for a short time when I roll in bed.",
  "history": "Brief position-triggered vertigo lasting seconds without new neurological symptoms.",
  "findings": [
   "Characteristic latency and torsional-upbeating nystagmus with appropriate positional testing",
   "Symptoms settle between position changes"
  ],
  "exam": [
   "Perform a safe Dix-Hallpike with neck/vascular screening and observe direction and duration of nystagmus.",
   "Rely only on Romberg balance without checking position triggers.",
   "Test hearing alone to diagnose a canal.",
   "Use smooth pursuit as the only vestibular measure."
  ],
  "examWhy": "Positional nystagmus direction and history guide the involved canal and side.",
  "alternatives": [
   "Central positional vertigo",
   "Vestibular migraine",
   "Orthostatic hypotension"
  ],
  "management": [
   "Use an appropriate posterior-canal repositioning maneuver after positive assessment and contraindication screening.",
   "Perform indiscriminate cervical manipulation.",
   "Treat only with balance strengthening while ignoring correctable positional vertigo."
  ],
  "why": "Canal-specific repositioning is preferred once BPPV is supported.",
  "safety": false
 },
 {
  "key": "vest-horizontal",
  "title": "Horizontal-canal BPPV",
  "track": "Vestibular Rehabilitation",
  "region": "Vestibular & Balance",
  "cohort": "adult",
  "chief": "When I turn my head lying down, everything spins for a few seconds.",
  "history": "Positional vertigo is most marked during supine head turns without constant spontaneous vertigo.",
  "findings": [
   "Direction-changing horizontal positional nystagmus",
   "Head roll provokes brief rotational sensation"
  ],
  "exam": [
   "Perform supine roll testing with safety screening and compare geotropic/apogeotropic nystagmus.",
   "Use Dix-Hallpike alone and never perform head roll.",
   "Diagnose migraine based solely on positional symptoms.",
   "Prioritize maximal walking endurance without positional testing."
  ],
  "examWhy": "Horizontal nystagmus patterns require correct canal identification.",
  "alternatives": [
   "Posterior canal BPPV",
   "Central positional vertigo",
   "Vestibular neuritis"
  ],
  "management": [
   "Select a horizontal-canal repositioning approach according to nystagmus pattern and contraindications.",
   "Use posterior-canal treatment without recognizing a horizontal pattern.",
   "Suggest complete bed rest as definitive therapy."
  ],
  "why": "Canal-specific maneuvers follow accurate pattern assessment.",
  "safety": false
 },
 {
  "key": "vest-uvh",
  "title": "Unilateral vestibular hypofunction",
  "track": "Vestibular Rehabilitation",
  "region": "Vestibular & Balance",
  "cohort": "adult",
  "chief": "Moving my head makes the world bounce and walking is less steady.",
  "history": "Following a medically assessed vestibular insult, head movement causes gaze instability and balance problems.",
  "findings": [
   "Reduced vestibulo-ocular reflex gain or corrective saccades on appropriate test",
   "Dynamic visual acuity and balance may be impaired"
  ],
  "exam": [
   "Assess gaze stability, vestibular ocular reflex, balance and activity tolerance while screening central causes.",
   "Use only passive cervical range tests.",
   "Treat all dizziness with positional maneuvers.",
   "Focus solely on hearing without balance or gaze function."
  ],
  "examWhy": "Vestibular rehabilitation targets gaze instability and sensory integration deficits.",
  "alternatives": [
   "Bilateral vestibular hypofunction",
   "Persistent postural-perceptual dizziness",
   "Vestibular migraine"
  ],
  "management": [
   "Use individualized gaze stabilization and progressive balance/gait exercises.",
   "Avoid every head movement indefinitely.",
   "Perform repeated nonspecific repositioning without BPPV evidence."
  ],
  "why": "Graded vestibular adaptation and substitution support function.",
  "safety": false
 },
 {
  "key": "vest-migraine",
  "title": "Vestibular migraine activity limitation",
  "track": "Vestibular Rehabilitation",
  "region": "Vestibular & Balance",
  "cohort": "adult",
  "chief": "I get dizzy episodes with headaches and bright environments bother me.",
  "history": "Recurrent episodic dizziness with migraine features and visual motion sensitivity; medical assessment has ruled out immediate danger.",
  "findings": [
   "Sensory motion sensitivity during busy visual tasks",
   "Variable balance between episodes"
  ],
  "exam": [
   "Take migraine-related symptom history and assess visual motion/balance triggers while screening central and positional causes.",
   "Diagnose posterior BPPV without positional nystagmus.",
   "Use only neck ROM to explain all episodes.",
   "Complete maximum exertion as first dizziness assessment."
  ],
  "examWhy": "Vestibular migraine is a clinical diagnosis informed by migraine features and episodes.",
  "alternatives": [
   "BPPV",
   "Persistent postural-perceptual dizziness",
   "Ménière disease"
  ],
  "management": [
   "Coordinate medical migraine management with individually paced balance and motion-tolerance rehabilitation.",
   "Use repeated canalith maneuvers without supporting positional findings.",
   "Ignore triggers and insist on rapid maximal exposure."
  ],
  "why": "Carefully tailored vestibular exercise may support function with multidisciplinary migraine care.",
  "safety": false
 },
 {
  "key": "vest-pppd",
  "title": "Persistent postural-perceptual dizziness",
  "track": "Vestibular Rehabilitation",
  "region": "Vestibular & Balance",
  "cohort": "adult",
  "chief": "Supermarkets and busy places make me feel unsteady.",
  "history": "Persistent non-spinning dizziness is aggravated by upright posture, motion and visually busy environments over months.",
  "findings": [
   "Visual-motion sensitivity and postural insecurity",
   "No acute focal neurological changes on current screening"
  ],
  "exam": [
   "Assess chronic symptom triggers, gait, visual motion tolerance and anxiety interplay; screen vestibular and neurological causes.",
   "Use repeated Epley maneuvers without BPPV confirmation.",
   "Prescribe only eye exercises without graded function.",
   "Diagnose purely from a normal MRI."
  ],
  "examWhy": "PPPD is characterized by persistent motion/posture-related symptoms with appropriate differential assessment.",
  "alternatives": [
   "Vestibular migraine",
   "Unilateral vestibular hypofunction",
   "Orthostatic intolerance"
  ],
  "management": [
   "Use graded vestibular/visual exposure, activity participation and coordinated psychological/medical support where needed.",
   "Advise permanent avoidance of every provoking environment.",
   "Increase visual exposure so fast that symptoms become intolerable."
  ],
  "why": "Individualized habituation and broader supportive care are useful.",
  "safety": false
 },
 {
  "key": "vest-central",
  "title": "Acute central vestibular syndrome concern",
  "track": "Vestibular Rehabilitation",
  "region": "Vestibular & Balance",
  "cohort": "adult",
  "chief": "The dizziness started suddenly and I cannot stand safely.",
  "history": "New continuous severe vertigo and imbalance with difficulty walking and a concerning new neurological symptom.",
  "findings": [
   "Acute severe truncal ataxia with focal neurological finding",
   "Presentation is continuous rather than brief position-triggered spinning"
  ],
  "exam": [
   "Prioritize emergency stroke pathway and neurological evaluation; specialized HINTS testing only by properly trained clinicians where appropriate.",
   "Perform routine Epley before central signs are addressed.",
   "Prescribe habituation exercises and discharge.",
   "Classify as BPPV based only on severe dizziness."
  ],
  "examWhy": "New continuous vertigo with truncal ataxia and focal neurological signs requires urgent stroke evaluation.",
  "alternatives": [
   "Vestibular neuritis",
   "Vestibular migraine",
   "BPPV"
  ],
  "management": [
   "Arrange emergency medical evaluation and safe handover immediately.",
   "Wait a week to see if exercises help.",
   "Use intense balance training while major stroke symptoms remain unevaluated."
  ],
  "why": "Acute vestibular syndrome with central signs is time-sensitive.",
  "safety": true,
  "urgency": "My new dizziness comes with inability to walk safely and another new neurological symptom."
 }
];
