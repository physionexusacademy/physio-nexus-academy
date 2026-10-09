import type { Template } from "./clinical-arena-multispecialty-core";
export const pediatricTemplates:Template[]=[
 {
  "key": "peds-cp-unilateral",
  "title": "Unilateral cerebral palsy motor function",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "child",
  "chief": "My child uses one hand much less during play.",
  "history": "Caregiver describes early-onset asymmetrical hand use and difficulty manipulating toys; the child has a known nonprogressive motor disorder.",
  "findings": [
   "Persistent unilateral upper-limb control difference",
   "Task participation improves with adaptive play setup"
  ],
  "exam": [
   "Observe bilateral hand use, selective motor control, play and function; screen vision and tone.",
   "Rely on passive wrist range alone to estimate dexterity.",
   "Assess respiratory endurance before hand skills.",
   "Measure only grip strength without bimanual play."
  ],
  "examWhy": "Participation-based motor assessment is more informative than isolated tone measurement.",
  "alternatives": [
   "Brachial plexus injury",
   "Developmental coordination disorder",
   "Peripheral nerve injury"
  ],
  "management": [
   "Provide meaningful goal-directed bimanual activity and caregiver-supported play practice.",
   "Use prolonged restraint of the stronger arm without assessment or family agreement.",
   "Treat only with passive massage instead of functional practice."
  ],
  "why": "Evidence-informed goal-directed activity and family engagement support functional outcomes.",
  "safety": false
 },
 {
  "key": "peds-cp-bilateral",
  "title": "Bilateral spastic cerebral palsy mobility",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "child",
  "chief": "My child gets tired and stiff while walking.",
  "history": "The child has established bilateral spastic motor impairment with reduced walking endurance and difficulty negotiating school environments.",
  "findings": [
   "Bilateral plantarflexor stiffness affects gait",
   "Walking speed and functional endurance limited"
  ],
  "exam": [
   "Document gross motor function, gait, range, selective motor control and assistive-device needs.",
   "Measure ankle tone alone to prescribe all interventions.",
   "Prioritize hand dexterity testing as only examination.",
   "Assess only resting heart rate without function."
  ],
  "examWhy": "Functional classification and gait measures guide therapy and participation.",
  "alternatives": [
   "Duchenne muscular dystrophy",
   "Developmental coordination disorder",
   "Hereditary spastic paraplegia"
  ],
  "management": [
   "Use individualized strengthening, mobility skill training, orthotic review and participation goals.",
   "Perform forceful prolonged stretching without monitoring comfort.",
   "Avoid walking practice permanently due to spasticity."
  ],
  "why": "Caregiver-led goals and targeted mobility interventions support participation.",
  "safety": false
 },
 {
  "key": "peds-motor-delay",
  "title": "Early gross-motor developmental delay",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "infant",
  "chief": "My baby is not reaching the movement milestones I expected.",
  "history": "Caregiver reports delayed rolling or supported sitting compared with expected age range; no single cause has yet been established.",
  "findings": [
   "Gross motor milestones are behind age expectations",
   "Observation shows limited variety of age-appropriate movement transitions"
  ],
  "exam": [
   "Use age-corrected developmental history and standardized milestone assessment plus neurological/red-flag screen.",
   "Label the child with cerebral palsy based on one delayed skill.",
   "Prioritize adult balance tests.",
   "Measure ankle dorsiflexion alone and infer global development."
  ],
  "examWhy": "Developmental delay describes a finding requiring broad evaluation, not one confirmed etiological diagnosis.",
  "alternatives": [
   "Normal variation without functional concern",
   "Generalized low tone",
   "Neuromuscular disease"
  ],
  "management": [
   "Provide family-centered, play-based opportunities while arranging developmental assessment and indicated referrals.",
   "Wait indefinitely without evaluating a persistent developmental concern.",
   "Use repetitive forced milestone positioning without child engagement."
  ],
  "why": "Identify developmental needs early and investigate underlying causes rather than assigning a definitive disease from one milestone.",
  "safety": false
 },
 {
  "key": "peds-torticollis",
  "title": "Congenital muscular torticollis",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "infant",
  "chief": "My baby's head usually turns toward the same side.",
  "history": "Caregiver notices a persistent head preference and restricted rotation during play; pediatric medical screening has not shown acute illness.",
  "findings": [
   "Asymmetric cervical rotation and side-flexion",
   "Possible positional head shape asymmetry"
  ],
  "exam": [
   "Observe active/passive cervical movement, head posture, cranial shape and neurological/visual red flags.",
   "Perform forceful cervical rotation to end range before screening.",
   "Measure only developmental sitting time.",
   "Prioritize adult cervical radiculopathy provocation testing."
  ],
  "examWhy": "Typical torticollis evaluation includes motion symmetry, position preference and nonmuscular cause screening.",
  "alternatives": [
   "Ocular torticollis",
   "Osseous cervical anomaly",
   "Positional preference without fixed restriction"
  ],
  "management": [
   "Use gentle positioning, active play and caregiver guidance with pediatric follow-up.",
   "Use forceful manual neck manipulation.",
   "Ignore atypical neurological signs or painful torticollis."
  ],
  "why": "Gentle family-centered treatment supports symmetry; atypical findings require referral.",
  "safety": false
 },
 {
  "key": "peds-plagio",
  "title": "Positional cranial asymmetry with motor preference",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "infant",
  "chief": "The back of my baby's head seems flatter on one side.",
  "history": "Caregiver reports a stable positional head shape difference and a strong play-time head-turn preference.",
  "findings": [
   "Occipital cranial flattening with positional preference",
   "Motor and neck movement need screening"
  ],
  "exam": [
   "Assess head shape, cervical motion, repositioning patterns and age-appropriate development; screen for craniosynostosis signs.",
   "Assume every flat head requires surgery.",
   "Use only gross lower-limb strength tests.",
   "Perform high-velocity neck manipulation."
  ],
  "examWhy": "Differentiate positional changes from cranial suture abnormalities requiring specialist input.",
  "alternatives": [
   "Craniosynostosis",
   "Congenital muscular torticollis",
   "Congenital cranial malformation"
  ],
  "management": [
   "Use awake supervised tummy time and responsive repositioning with developmental follow-up.",
   "Recommend unsafe prone sleeping to reshape the head.",
   "Force passive neck rotations without screening."
  ],
  "why": "Safe sleep remains supine; positioning advice applies during awake supervised play.",
  "safety": false
 },
 {
  "key": "peds-down",
  "title": "Down syndrome gross-motor participation",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "infant",
  "chief": "My baby needs more time and help with movement.",
  "history": "A baby with a documented genetic developmental condition has delayed transitional movement and generalized low muscle tone; family asks about safe play.",
  "findings": [
   "Low postural tone and delayed transitions",
   "Caregiver reports fatigue with supported upright play"
  ],
  "exam": [
   "Assess developmental mobility and participation, joint stability risks and relevant cardiac precautions.",
   "Prescribe vigorous head/neck overpressure to improve control.",
   "Perform adult maximal treadmill test.",
   "Measure only hip flexor length and disregard participation."
  ],
  "examWhy": "Therapy should assess hypotonia, joint stability, development and medical comorbidities.",
  "alternatives": [
   "Isolated motor delay without known syndrome",
   "Cerebral palsy",
   "Peripheral neuropathy"
  ],
  "management": [
   "Use developmentally appropriate active play and family-supported movement with individualized medical precautions.",
   "Use unsupported high-force cervical positioning.",
   "Expect all children to achieve milestones on an identical timetable."
  ],
  "why": "Support functional development and respect cervical/cardiac precautions.",
  "safety": false
 },
 {
  "key": "peds-dcd",
  "title": "Developmental coordination disorder",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "child",
  "chief": "My child struggles with catching, writing and learning new movements.",
  "history": "The child is slower learning and coordinating age-appropriate motor tasks despite opportunities to practice, affecting school and home routines.",
  "findings": [
   "Difficulty coordinating age-appropriate ball and fine-motor tasks",
   "Task performance affects school participation"
  ],
  "exam": [
   "Assess everyday motor participation with age-appropriate standardized motor tasks and school needs.",
   "Interpret one handwriting sample as sufficient diagnosis.",
   "Prioritize cervical reflex examination alone.",
   "Assess maximal leg strength without task skill."
  ],
  "examWhy": "DCD evaluation focuses on meaningful motor learning, daily function and differential screening.",
  "alternatives": [
   "Cerebral palsy",
   "Uncorrected visual difficulty",
   "Specific learning disorder without motor impairment"
  ],
  "management": [
   "Use task-oriented skill practice, graded feedback and school-family collaboration.",
   "Recommend only passive stretching instead of practicing skills.",
   "Tell the child to try harder without adapting instructions."
  ],
  "why": "Task-oriented learning and supportive participation plans are appropriate.",
  "safety": false
 },
 {
  "key": "peds-autism",
  "title": "Autism-associated motor and sensory participation needs",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "child",
  "chief": "My child avoids some playground games and finds busy places overwhelming.",
  "history": "A child with documented neurodevelopmental differences has sensory-related movement avoidance and coordination challenges affecting preferred play activities.",
  "findings": [
   "Movement planning and sensory tolerance vary by task",
   "Engagement improves with predictable cues and familiar routines"
  ],
  "exam": [
   "Ask family and child preferences and assess functional play, motor coordination and sensory environment sensitively.",
   "Require eye contact as a test of motor competence.",
   "Use only isolated ankle reflex tests.",
   "Force unexpected touch-based balance tasks without consent."
  ],
  "examWhy": "Functional assessment should be individualized and neurodiversity-affirming rather than coercive.",
  "alternatives": [
   "Developmental coordination disorder",
   "Anxiety related to sensory environments",
   "Vestibular hypofunction"
  ],
  "management": [
   "Co-design predictable, enjoyable goal-directed motor activities with accommodations.",
   "Use aversive sensory exposure without assent or choice.",
   "Treat differences in communication as a reason to exclude the child."
  ],
  "why": "Meaningful functional engagement and respectful accommodations guide care.",
  "safety": false
 },
 {
  "key": "peds-dmd",
  "title": "Progressive childhood proximal muscle weakness concern",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "child",
  "chief": "My child uses their hands to climb up their legs to stand.",
  "history": "Caregiver notices progressive difficulty running and rising from the floor, with frequent falls over months.",
  "findings": [
   "Gowers-type rise and proximal symmetrical weakness",
   "Calf enlargement may coexist, and specialist assessment is required"
  ],
  "exam": [
   "Assess safe proximal motor function and fatigue; arrange prompt pediatric neuromuscular evaluation.",
   "Prescribe exhaustive eccentric calf training before medical evaluation.",
   "Perform only local ankle ligament stress tests.",
   "Reassure based on normal hand grip and discharge."
  ],
  "examWhy": "Progressive proximal weakness with Gowers-type pattern merits investigation for muscular dystrophy or other neuromuscular disease.",
  "alternatives": [
   "Congenital myopathy",
   "Spinal muscular atrophy",
   "Developmental coordination disorder"
  ],
  "management": [
   "Refer promptly for medical evaluation and coordinated gentle functional support; avoid overexertion.",
   "Tell family progression is normal aging.",
   "Start maximal resistance exercises before specialist review."
  ],
  "why": "Early specialist assessment is essential for progressive pediatric weakness.",
  "safety": false
 },
 {
  "key": "peds-jia",
  "title": "Juvenile idiopathic arthritis functional restriction",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "child",
  "chief": "My child seems stiff when getting moving in the morning.",
  "history": "Known inflammatory joint disorder with intermittent swelling and morning stiffness affecting play and school tasks.",
  "findings": [
   "Joint swelling or limited range at affected joints",
   "Morning stiffness improves after gentle movement"
  ],
  "exam": [
   "Document joint inflammation, range, function and symptom patterns while coordinating rheumatology care.",
   "Push maximal resisted exercise through swollen painful joints.",
   "Assess only neck posture and ignore active inflammation.",
   "Diagnose from one isolated tender point."
  ],
  "examWhy": "Inflammatory joint status and functional response guide rehabilitation intensity.",
  "alternatives": [
   "Acute septic arthritis",
   "Postinfectious reactive arthritis",
   "Mechanical overuse pain"
  ],
  "management": [
   "Use gentle movement and strengthening appropriate to inflammation, with pediatric rheumatology coordination.",
   "Ignore hot feverish joint during an acute systemic illness.",
   "Prescribe immobilization of all involved joints indefinitely."
  ],
  "why": "Adjust exercise to flare status and protect joints while supporting participation.",
  "safety": false
 },
 {
  "key": "peds-bpi",
  "title": "Infant brachial plexus birth injury rehabilitation",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "infant",
  "chief": "My baby moves one arm much less than the other.",
  "history": "Caregiver reports persistent asymmetric arm movement since birth, with a peripheral pattern of weakness requiring specialist follow-up.",
  "findings": [
   "Reduced active shoulder and elbow movement on affected side",
   "Hand movement pattern may help characterize nerve level"
  ],
  "exam": [
   "Assess passive and spontaneous active upper-limb movement, muscle activation and contracture risk with specialist review.",
   "Use vigorous traction on the involved arm.",
   "Perform only lower-limb developmental testing.",
   "Use painful maximal resistance to decide nerve recovery."
  ],
  "examWhy": "Serial motor observation and specialist timing determine management and possible intervention.",
  "alternatives": [
   "Central motor asymmetry",
   "Humeral fracture-related pseudoparalysis",
   "Isolated radial nerve injury"
  ],
  "management": [
   "Use gentle positioning and active play, preserve mobility and coordinate specialist follow-up.",
   "Forcefully stretch weak shoulder into pain.",
   "Delay all follow-up until school age."
  ],
  "why": "Avoid traction on the injured limb, protect passive shoulder range, track return of active elbow and shoulder movement, and coordinate time-sensitive brachial-plexus specialist review.",
  "safety": false
 },
 {
  "key": "peds-scoliosis",
  "title": "Adolescent spinal curvature evaluation",
  "track": "Pediatric Rehabilitation",
  "region": "Child Development",
  "cohort": "teen",
  "chief": "My shoulders look uneven and I was told to check my spine.",
  "history": "An adolescent has progressive trunk asymmetry noticed during growth, without neurological or systemic warning features.",
  "findings": [
   "Asymmetry on forward-bend screening",
   "Growth status affects referral and management choices"
  ],
  "exam": [
   "Assess posture, Adams forward bend and scoliometer angle; arrange imaging/referral according to clinical thresholds.",
   "Use repeated spinal thrust manipulation to correct structural curve.",
   "Diagnose exact Cobb angle by visual inspection alone.",
   "Prioritize ankle stability tests before examining the trunk."
  ],
  "examWhy": "Structural curvature assessment requires growth history and appropriate radiographic confirmation where indicated.",
  "alternatives": [
   "Postural asymmetry",
   "Leg-length discrepancy-related pelvic obliquity",
   "Congenital vertebral anomaly"
  ],
  "management": [
   "Support function, activity and specialist scoliosis referral when thresholds or progression warrant it.",
   "Promise structural correction from stretching alone.",
   "Ignore rapid progression during growth."
  ],
  "why": "Growth-aware screening and appropriate specialist pathways are important.",
  "safety": false
 }
];
