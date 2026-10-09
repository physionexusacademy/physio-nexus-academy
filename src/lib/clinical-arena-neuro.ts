import type { Template } from "./clinical-arena-multispecialty-core";
export const neuroTemplates:Template[]=[
 {
  "key": "neuro-stroke-motor",
  "title": "Post-stroke motor impairment",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "older",
  "chief": "Since leaving hospital, one side feels weaker when I stand and walk.",
  "history": "After a medically managed brain event, unilateral weakness and slower transfers persist; family seeks a functional assessment.",
  "findings": [
   "Reduced selective ankle dorsiflexion and asymmetric sit-to-stand",
   "Gait speed lower than premorbid level; no new acute deficit"
  ],
  "exam": [
   "Assess strength, selective control, balance and gait speed alongside safe transfer performance.",
   "Perform isolated passive ankle range without observing functional transfers.",
   "Assess only vestibular positional responses.",
   "Measure endurance without checking fall risk."
  ],
  "examWhy": "Task-based strength, motor control and gait measures guide post-stroke rehabilitation; screen for new neurological changes.",
  "alternatives": [
   "Deconditioning without focal deficit",
   "Parkinsonian gait",
   "Peripheral nerve entrapment"
  ],
  "management": [
   "Use progressive, supervised task-specific transfers, balance and walking practice tailored to safety.",
   "Perform maximal unassisted walking despite frequent loss of balance.",
   "Use passive modalities as the only intervention."
  ],
  "why": "Unilateral motor impairment following stroke calls for task-oriented therapy, appropriate assistive devices and ongoing outcome reassessment.",
  "safety": false
 },
 {
  "key": "neuro-neglect",
  "title": "Unilateral spatial neglect after stroke",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "older",
  "chief": "I keep missing things on one side, and my family worries about my safety.",
  "history": "Caregiver reports collisions with doorframes on one side during mobility after a right-hemisphere event.",
  "findings": [
   "Reduced attention to stimuli in left hemispace during functional tasks",
   "Motor ability alone does not explain collisions"
  ],
  "exam": [
   "Assess visual field and functional spatial attention with cancellation, scanning and real-world mobility tasks.",
   "Test isolated limb tone without screening spatial awareness.",
   "Assess only cardiopulmonary endurance.",
   "Measure neck range as sole reason for collisions."
  ],
  "examWhy": "Neglect must be distinguished from visual field loss and motor deficits; use functional attention tasks.",
  "alternatives": [
   "Hemianopia without neglect",
   "Peripheral vestibular disorder",
   "Primary shoulder weakness"
  ],
  "management": [
   "Use structured visual scanning, environmental cues and supervised mobility with fall prevention.",
   "Increase independent unsupervised mobility before environmental safety training.",
   "Use only passive stretching as a treatment for missed objects."
  ],
  "why": "Address attention-related safety and participation with functional training and caregiver education.",
  "safety": false
 },
 {
  "key": "neuro-aphasia",
  "title": "Post-stroke communication-related participation",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "I know what I want to do, but getting words out is frustrating.",
  "history": "Following a documented cerebrovascular event, spoken language is reduced, while the main rehabilitation goal is safe mobility and shared decision making.",
  "findings": [
   "Expressive communication barriers during multistep instruction",
   "Mobility assessment possible with adapted communication supports"
  ],
  "exam": [
   "Use supported communication and comprehension checks while testing task-based mobility and decision preferences.",
   "Judge motor capacity only from verbal response speed.",
   "Perform complex multitask instructions without verifying comprehension.",
   "Assess language alone and omit physical function."
  ],
  "examWhy": "Adapt communication while partnering with speech-language professionals; aphasia alone does not imply reduced intelligence.",
  "alternatives": [
   "Dysarthria with intact language",
   "Apraxia of speech",
   "Cognitive impairment alone"
  ],
  "management": [
   "Use concise instructions, visual demonstrations, confirmation of understanding and interdisciplinary speech-language support.",
   "Assume the patient lacks decision-making capacity solely because speech is impaired.",
   "Require rapid spoken replies before allowing task practice."
  ],
  "why": "Supported communication permits more accurate assessment and respectful neurorehabilitation.",
  "safety": false
 },
 {
  "key": "neuro-parkinson",
  "title": "Parkinsonian freezing of gait",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "older",
  "chief": "My feet seem stuck when I start walking or turn around.",
  "history": "A person with established Parkinson disease reports short shuffling steps and start hesitation near doorways.",
  "findings": [
   "Freezing during turning and dual-task walking",
   "Reduced amplitude of steps without new focal neurological signs"
  ],
  "exam": [
   "Observe gait initiation, turning and freezing triggers; assess balance, falls and medication timing.",
   "Measure ankle muscle length alone as explanation for hesitation.",
   "Use brief treadmill speed as the only test.",
   "Prioritize cervical myotome testing."
  ],
  "examWhy": "Freezing varies with attention, environment and medication timing; task observation and fall assessment are essential.",
  "alternatives": [
   "Normal aging alone",
   "Peripheral neuropathic sensory ataxia",
   "Cerebellar ataxia"
  ],
  "management": [
   "Trial individualized cueing, amplitude-based movement strategies and safe gait practice with team coordination.",
   "Ask the patient to rush through freezing episodes without an external support strategy.",
   "Treat only with passive spinal mobilization."
  ],
  "why": "Cueing and context-specific mobility practice can help function while medication and falls are reviewed.",
  "safety": false
 },
 {
  "key": "neuro-ms",
  "title": "Multiple sclerosis-related fatigue and imbalance",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "I run out of energy quickly, and I feel less steady as the day goes on.",
  "history": "Established multiple sclerosis with fluctuating fatigue, heat sensitivity and walking limitation; no reported acute relapse.",
  "findings": [
   "Balance decreases during prolonged activity",
   "Self-reported fatigue and perceived exertion rise with workload"
  ],
  "exam": [
   "Assess fatigue impact, balance, gait and perceived exertion with heat and relapse screening.",
   "Use one maximal endurance test without monitoring fatigue or temperature.",
   "Assess only plantar fascia loading.",
   "Perform repeated cervical high-velocity testing."
  ],
  "examWhy": "Fatigue, heat intolerance and fluctuating symptoms require paced, tailored functional testing.",
  "alternatives": [
   "Primary sedentary deconditioning only",
   "Acute vestibular neuritis",
   "Iron deficiency without neurological condition"
  ],
  "management": [
   "Use appropriately dosed aerobic and strength training, pacing, cooling strategies and individualized goals.",
   "Train repeatedly to exhaustion during symptom flare.",
   "Avoid all physical activity permanently."
  ],
  "why": "Safe individualized exercise and energy management can support MS-related function.",
  "safety": false
 },
 {
  "key": "neuro-sci-incomplete",
  "title": "Incomplete spinal cord injury mobility rehabilitation",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "My legs move, but balance and walking still need a lot of attention.",
  "history": "After medically stabilized incomplete spinal cord injury, assisted standing is possible with residual sensory and motor deficits.",
  "findings": [
   "Segmental motor and sensory deficits below injury level",
   "Assisted gait and transfers vary with fatigue and support"
  ],
  "exam": [
   "Characterize neurological level using ISNCSCI-trained assessment and functional transfers, gait, skin and autonomic safety.",
   "Estimate neurological level from pain alone.",
   "Prioritize unsupported maximal balance tests without guarding.",
   "Skip skin inspection because walking is possible."
  ],
  "examWhy": "Classification and autonomy require complete neurological and functional assessment plus pressure and autonomic precautions.",
  "alternatives": [
   "Peripheral polyneuropathy alone",
   "Functional movement disorder",
   "Simple lower-limb deconditioning"
  ],
  "management": [
   "Deliver progressive individualized locomotor, transfer and strengthening practice with skin and autonomic monitoring.",
   "Use unmonitored prolonged standing despite orthostatic intolerance.",
   "Focus solely on ankle mobilization without a transfer plan."
  ],
  "why": "Incomplete injury requires individualized rehabilitation with prevention of pressure and autonomic complications.",
  "safety": false
 },
 {
  "key": "neuro-sci-pressure",
  "title": "Spinal cord injury skin-protection needs",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "I cannot always feel pressure when I sit for a long time.",
  "history": "Established spinal cord injury with wheelchair use and reduced skin sensation; caregiver requests safer pressure management.",
  "findings": [
   "Reduced sensation over weight-bearing seated areas",
   "Prolonged sitting without reliable pressure-relief strategy"
  ],
  "exam": [
   "Review skin risk, cushion fit, seated alignment and ability to complete individualized pressure relief.",
   "Rely on pain reports to detect early pressure damage.",
   "Use only upper-limb strength as pressure assessment.",
   "Assess peak wheelchair speed before skin status."
  ],
  "examWhy": "Absent sensation means lack of pain cannot be used to exclude tissue injury.",
  "alternatives": [
   "Localized skin trauma from a known one-off event",
   "Spasticity alone",
   "Peripheral joint stiffness"
  ],
  "management": [
   "Provide pressure-injury prevention education, seating review and individualized pressure relief with skin surveillance.",
   "Wait for pain before modifying pressure management.",
   "Ignore a new non-blanching red patch and continue prolonged sitting."
  ],
  "why": "Protecting tissue and participation is a core SCI rehabilitation priority.",
  "safety": false
 },
 {
  "key": "neuro-tbi",
  "title": "Traumatic brain injury dual-task balance",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "Walking feels fine until I have to think about two things at once.",
  "history": "Following medically stabilized mild-to-moderate traumatic brain injury, distraction worsens balance and community navigation.",
  "findings": [
   "Reduced gait performance while performing a cognitive task",
   "Attention and fatigue affect movement consistency"
  ],
  "exam": [
   "Compare single-task and dual-task gait, balance, cognition, fatigue and safety awareness.",
   "Measure static hamstring length as the sole outcome.",
   "Use a maximal cardiovascular stress test before balance screening.",
   "Assess isolated grip strength and infer community safety."
  ],
  "examWhy": "Functional dual-task testing reveals everyday attentional demands relevant to falls.",
  "alternatives": [
   "Peripheral vestibular hypofunction",
   "Post-stroke neglect",
   "Parkinsonian freezing"
  ],
  "management": [
   "Use graded dual-task gait and attention strategies with appropriate supervision and cognitive rehabilitation support.",
   "Introduce complex crowded dual-task walking immediately without guarding.",
   "Treat only with passive tissue techniques."
  ],
  "why": "Train community mobility gradually while respecting cognitive fatigue and safety.",
  "safety": false
 },
 {
  "key": "neuro-neuropathy",
  "title": "Peripheral neuropathy-related sensory gait imbalance",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "older",
  "chief": "I cannot always tell where my feet are when the lights are low.",
  "history": "Longstanding distal symmetric numbness is associated with unsteadiness on uneven surfaces.",
  "findings": [
   "Reduced distal vibration and protective sensation",
   "Wider-based gait with poorer balance when visual input is reduced"
  ],
  "exam": [
   "Assess distal sensation, ankle strength, balance with altered visual input and footwear/skin risks.",
   "Prioritize cervical nerve-root provocation only.",
   "Assess only shoulder rotation range.",
   "Use a head impulse test as the sole balance investigation."
  ],
  "examWhy": "Distal sensory loss and reduced proprioceptive feedback support a peripheral sensory gait problem.",
  "alternatives": [
   "Cerebellar ataxia without distal sensory loss",
   "BPPV",
   "Vestibular migraine"
  ],
  "management": [
   "Combine balance and strengthening training with footwear advice, fall prevention and medical review of neuropathy causes.",
   "Encourage barefoot obstacle walking without fall or skin safeguards.",
   "Use only calf stretching for sensory loss."
  ],
  "why": "Sensory integration, skin protection and targeted balance practice are important.",
  "safety": false
 },
 {
  "key": "neuro-gbs",
  "title": "Post-acute Guillain–Barré rehabilitation",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "My muscles still tire quickly after being in hospital.",
  "history": "After medically treated Guillain–Barré syndrome, generalized weakness persists, with slow endurance recovery and no current deterioration.",
  "findings": [
   "Symmetric weakness with reduced activity tolerance",
   "Potential autonomic symptoms require monitoring during exertion"
  ],
  "exam": [
   "Screen respiratory and autonomic stability, strength and fatigue before graded functional mobilization.",
   "Use high-intensity strengthening to complete exhaustion at the first visit.",
   "Focus only on cervical range without checking breathing.",
   "Assess ankle ligament laxity as the first priority."
  ],
  "examWhy": "GBS rehabilitation requires paced activity and monitoring for respiratory or autonomic instability.",
  "alternatives": [
   "Critical illness myopathy",
   "Chronic inflammatory demyelinating neuropathy",
   "General deconditioning alone"
  ],
  "management": [
   "Progress gradually within fatigue limits, monitoring cardiorespiratory and autonomic tolerance with the medical team.",
   "Use repeated maximal muscle tests until fatigue becomes severe.",
   "Skip respiratory screening because the patient is ambulant."
  ],
  "why": "Monitor recovery while avoiding overwork and escalating any renewed weakness or breathing difficulty.",
  "safety": false
 },
 {
  "key": "neuro-als",
  "title": "Progressive motor neuron disorder functional planning",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "Daily tasks take more effort now, and I want to plan ahead.",
  "history": "A person with an established progressive motor neuron disorder reports worsening functional weakness and difficulty conserving energy.",
  "findings": [
   "Progressive bilateral weakness affects transfers and self-care",
   "Swallowing or respiratory problems require ongoing multidisciplinary review"
  ],
  "exam": [
   "Assess function, strength without overwork, breathing/swallowing symptoms and equipment needs with multidisciplinary input.",
   "Push heavy resistance exercise until fatigue prevents movement.",
   "Measure ankle flexibility only.",
   "Focus solely on a single manual muscle score without function."
  ],
  "examWhy": "Progressive disease requires timely assistive technology and respiratory, nutrition and swallowing surveillance.",
  "alternatives": [
   "Chronic peripheral neuropathy",
   "Cervical myelopathy",
   "Myasthenia gravis"
  ],
  "management": [
   "Use goal-directed energy conservation, safe mobility/equipment planning and coordinated specialist follow-up.",
   "Promise reversal of weakness with vigorous strengthening.",
   "Defer equipment discussions until mobility is lost completely."
  ],
  "why": "Preserve participation and safety through anticipatory interdisciplinary planning.",
  "safety": false
 },
 {
  "key": "neuro-fnd",
  "title": "Functional neurological gait disorder rehabilitation",
  "track": "Neurological Rehabilitation",
  "region": "Neurological Function",
  "cohort": "adult",
  "chief": "My walking sometimes stops working normally, even though scans did not explain everything.",
  "history": "With positive specialist clinical signs of functional gait symptoms, movement is inconsistent and improves during automatic tasks.",
  "findings": [
   "Positive inconsistency between deliberate and automatic movement",
   "No new acute neurological red flags on screening"
  ],
  "exam": [
   "Observe positive functional signs, automatic versus attention-focused movement and safe gait variability.",
   "Assume symptoms are fabricated because imaging is unremarkable.",
   "Conclude diagnosis from a normal scan alone.",
   "Use only isolated strength grading without studying function."
  ],
  "examWhy": "FND is diagnosed with positive signs of internal inconsistency, not by dismissing the patient or excluding every disease.",
  "alternatives": [
   "Cerebellar ataxia",
   "Peripheral neuropathy",
   "Myelopathy"
  ],
  "management": [
   "Explain positive findings sensitively and use distraction, automatic movement practice and coordinated care.",
   "Tell the patient symptoms are imaginary and prescribe no rehabilitation.",
   "Force movements through distress while ignoring collaboration."
  ],
  "why": "Respectful explanation and functional retraining support recovery.",
  "safety": false
 }
];
