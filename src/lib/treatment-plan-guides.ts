export type TreatmentPlanGuide = {
  clinicalLogic: string[];
  firstSession: string[];
  exerciseDose: string[];
  manualApplication: string[];
  modalityDose: string[];
  progressionRules: string[];
  commonMistakes: string[];
  patientEducation: string[];
};

export const treatmentPlanGuides: Record<string, TreatmentPlanGuide> = {
  "mechanical-neck-pain": {
    clinicalLogic: [
      "First decide whether this is uncomplicated mechanical neck pain or whether the presentation suggests radiculopathy, myelopathy, fracture, inflammatory disease, infection or vascular pathology.",
      "Do not choose treatment only from the pain location. Let irritability, movement loss, functional limitation and the patient's response to testing guide the plan.",
      "Passive treatment is mainly used to create a window for active movement. Long-term recovery depends more on movement confidence, strength, endurance and load tolerance."
    ],
    firstSession: [
      "Record NPRS, Neck Disability Index, active cervical ROM and one meaningful functional task such as looking over the shoulder while driving.",
      "Screen upper-limb neurology if arm symptoms are present and ask about headache, dizziness, trauma, systemic symptoms and vascular warning features.",
      "Choose one or two low-risk interventions that target the main problem: pain-dominant, stiffness-dominant or motor-control/endurance dominant.",
      "Reassess the exact same comparable sign after manual therapy or exercise. Keep only what creates a useful change."
    ],
    exerciseDose: [
      "Cervical active ROM: 5–10 comfortable repetitions in each useful direction, 2–4 times/day in an irritable stage.",
      "Deep neck flexor nods: 5–10-second holds × 5–10 repetitions, progressing quality before resistance.",
      "Cervical isometrics: gentle 20–30% effort, 5–10 seconds × 5 repetitions in flexion, extension and side-bending as tolerated.",
      "Scapular row/retraction: 2–3 sets × 8–15 repetitions, 2–4 days/week.",
      "Progress toward loaded carries, pulling, pushing and task-specific endurance when symptoms remain stable."
    ],
    manualApplication: [
      "For pain-dominant presentations, use gentle Maitland Grade I–II cervical or thoracic mobilization for 30–60 seconds × 2–4 bouts and immediately reassess.",
      "For stiffness-dominant presentations, use a direction-specific Grade III–IV mobilization or a pain-free SNAG/MWM only when screening is clear and the patient tolerates end range.",
      "Soft-tissue work can be used briefly over cervical/thoracic muscles when it reduces guarding; follow it immediately with active ROM.",
      "Cervical thrust manipulation is not a text-only technique. It requires advanced practical training, informed consent and contemporary vascular/neurological risk assessment."
    ],
    modalityDose: [
      "Heat: commonly 10–15 minutes for comfort before movement if the patient prefers it and sensation/circulation are intact.",
      "TENS: may be trialed for short-term analgesia using a comfortable strong sensory intensity; do not let it replace movement and exercise.",
      "Avoid routine dependence on ultrasound or multiple passive modalities when the patient can safely participate in active care."
    ],
    progressionRules: [
      "Progress range first when movement is highly irritable; progress load and endurance when pain is more stable.",
      "A mild temporary increase in symptoms can be acceptable if it settles quickly and function is improving.",
      "Advance from isolated neck/scapular exercise to work, driving, lifting or sport-specific tasks."
    ],
    commonMistakes: [
      "Treating every neck pain as a 'facet problem' or 'muscle spasm'.",
      "Using too many passive techniques in one session.",
      "Ignoring neurological or vascular screening.",
      "Giving 8–10 home exercises that the patient will not realistically perform."
    ],
    patientEducation: [
      "Explain that common neck pain is usually safe to move when serious pathology has been excluded.",
      "Encourage frequent position changes instead of searching for one perfect posture.",
      "Teach the patient what symptoms should prompt medical review, especially progressive weakness, gait change or unusual severe headache/dizziness."
    ]
  },

  "cervical-radiculopathy": {
    clinicalLogic: [
      "Confirm whether symptoms behave like a cervical nerve-root problem rather than shoulder pathology, peripheral nerve entrapment or myelopathy.",
      "Neurological status is more important than pain intensity alone. Track myotomes, dermatomes and reflexes over time.",
      "Centralization or reduction of distal arm symptoms is generally a favorable response; repeated peripheralization is a warning to change the intervention."
    ],
    firstSession: [
      "Record pain distribution, neurological findings, grip/upper-limb strength and a functional limit such as sitting, sleep or overhead use.",
      "Perform a careful cervical and upper-limb neurological examination and appropriate neurodynamic testing.",
      "Test whether unloading, a directional movement, gentle traction or supported posture reduces arm symptoms.",
      "Choose the least provocative intervention and recheck distal symptoms after every meaningful step."
    ],
    exerciseDose: [
      "Pain-free cervical repeated movement in the helpful direction: 5–10 repetitions, repeated several times/day if it centralizes symptoms.",
      "Median/ulnar/radial nerve sliders: usually 10–20 gentle repetitions × 1–3 sets/day without prolonged distal tingling.",
      "Deep neck flexor and scapular endurance: 2–3 sets of low-load controlled work.",
      "Progress upper-limb strengthening from light resistance to normal functional loading once neurological irritability is stable."
    ],
    manualApplication: [
      "Gentle cervical or thoracic mobilization can be used if it reduces arm symptoms or improves motion.",
      "Manual traction can be tested with a low force first; continue only if symptoms ease or centralize.",
      "Neurodynamic sliders are preferred before tensioners in irritable cases.",
      "Avoid aggressive end-range cervical techniques when neurological symptoms are easily provoked."
    ],
    modalityDose: [
      "Heat or TENS can be used for short-term comfort but should not be the main intervention.",
      "Traction is not automatically indicated by the diagnosis; dose it only in clear responders."
    ],
    progressionRules: [
      "Progress when distal symptoms are less frequent/intense and strength is stable or improving.",
      "Move from sliders to greater neural excursion gradually.",
      "Return to lifting/overhead tasks only after the patient can load the arm without progressive paresthesia or weakness."
    ],
    commonMistakes: [
      "Continuing an exercise that repeatedly pushes symptoms farther down the arm.",
      "Missing progressive motor weakness.",
      "Assuming every arm symptom is radiculopathy.",
      "Using traction for long periods without checking whether it actually changes symptoms."
    ],
    patientEducation: [
      "Teach the difference between local neck soreness and worsening neurological symptoms.",
      "Explain that movement is usually helpful when it does not progressively spread symptoms distally.",
      "Advise urgent review for progressive weakness, gait changes, hand clumsiness or bowel/bladder changes."
    ]
  },

  "nonspecific-low-back-pain": {
    clinicalLogic: [
      "First exclude serious spinal pathology and major neurological compromise.",
      "Classify what mainly limits the patient: high irritability, movement fear, directional preference, deconditioning, load intolerance or persistent pain complexity.",
      "Avoid over-medicalizing normal age-related imaging findings. Treatment should be driven by function and response, not MRI wording alone."
    ],
    firstSession: [
      "Record pain, Oswestry Disability Index or Patient-Specific Functional Scale and one functional task such as bending, walking or lifting.",
      "Screen cauda equina symptoms, fracture risk, cancer/infection features and progressive neurological loss.",
      "Test repeated movement/directional preference when appropriate.",
      "Give one or two exercises the patient can perform confidently the same day."
    ],
    exerciseDose: [
      "Walking: start from the amount tolerated without a major flare and build by 5–10% as tolerated.",
      "Directional-preference movement when clearly helpful: commonly 5–10 repetitions, several times/day.",
      "Bridge, squat, hip hinge, row/carry or trunk exercises: 2–3 sets × 6–15 repetitions depending on tolerance.",
      "For persistent pain, build general strength and aerobic capacity rather than endlessly searching for one 'weak core muscle'."
    ],
    manualApplication: [
      "Lumbar or thoracic mobilization: 30–60 seconds × 2–4 bouts when a comparable sign improves.",
      "Soft-tissue work may help short-term pain or movement comfort but should be followed by active movement.",
      "Manipulation may provide short-term benefit in selected patients after screening and consent, but it is not required for recovery."
    ],
    modalityDose: [
      "Heat: 10–20 minutes for short-term comfort if useful.",
      "TENS can be trialed for temporary analgesia.",
      "Avoid making traction, ultrasound or passive electrotherapy the central plan in routine non-specific low back pain."
    ],
    progressionRules: [
      "Progress from comfortable movement to loaded bending, squat, carry and lift.",
      "Increase one variable at a time: range, load, repetitions or speed.",
      "Use functional confidence and recovery after activity as progression markers."
    ],
    commonMistakes: [
      "Telling the patient the back is 'out of place'.",
      "Prescribing bed rest.",
      "Avoiding bending forever.",
      "Giving a complicated core program before restoring basic activity."
    ],
    patientEducation: [
      "Explain that most non-specific low back pain improves with activity and graded loading.",
      "Encourage normal movement and gradual return to meaningful tasks.",
      "Explain red flags clearly without frightening the patient."
    ]
  },

  "lumbar-radiculopathy": {
    clinicalLogic: [
      "Confirm nerve-root involvement using the neurological examination and symptom behavior rather than relying only on leg pain.",
      "Track motor deficit carefully. Progressive weakness changes urgency.",
      "Prefer interventions that centralize or reduce distal symptoms."
    ],
    firstSession: [
      "Document dermatomes, myotomes, reflexes and neurodynamic findings.",
      "Screen cauda equina symptoms immediately.",
      "Test repeated movement or positions to identify centralization.",
      "Start a simple symptom-guided movement plus walking plan."
    ],
    exerciseDose: [
      "Directional-preference exercise if present: 5–10 repetitions repeated through the day.",
      "Neural sliders: 10–20 gentle repetitions × 1–3 sets/day.",
      "Walking: several short bouts/day, gradually lengthened.",
      "Progress trunk, hip and leg strength to 2–3 sets × 6–15 repetitions when irritability falls."
    ],
    manualApplication: [
      "Gentle lumbar/thoracic mobilization may be used if it improves symptoms.",
      "Traction can be tested briefly; continue only if distal symptoms reduce or centralize.",
      "Avoid aggressive neural tensioning in a highly irritable nerve-root presentation."
    ],
    modalityDose: [
      "Heat/TENS can be used for temporary pain control.",
      "No passive modality should delay neurological reassessment or active rehabilitation."
    ],
    progressionRules: [
      "Progress when leg symptoms are less distal, neurological findings are stable and walking tolerance improves.",
      "Build from basic movement to loaded lifting and work tasks.",
      "Increase neural loading only after symptoms stop flaring easily."
    ],
    commonMistakes: [
      "Treating all sciatica with hamstring stretching.",
      "Missing cauda equina symptoms.",
      "Ignoring progressive weakness.",
      "Using repeated peripheralizing movements."
    ],
    patientEducation: [
      "Explain that leg symptoms can change before back pain fully resolves.",
      "Teach emergency symptoms: saddle numbness, bladder/bowel dysfunction or rapidly worsening weakness.",
      "Encourage activity within symptom limits rather than prolonged bed rest."
    ]
  },

  "knee-osteoarthritis": {
    clinicalLogic: [
      "Strength and physical activity are the core treatment. Pain does not automatically mean joint damage is worsening.",
      "Choose exercise around the patient's functional goals: stairs, walking, sit-to-stand, prayer positions or community mobility.",
      "Manual therapy is mainly used to make exercise and movement easier."
    ],
    firstSession: [
      "Record pain, WOMAC/KOOS, knee ROM, swelling, sit-to-stand and walking tolerance.",
      "Assess quadriceps, hip strength and gait.",
      "Teach one strength exercise and one functional activity that the patient can continue at home.",
      "Discuss pacing and realistic progression."
    ],
    exerciseDose: [
      "Sit-to-stand or squat-to-chair: 2–3 sets × 6–12 reps, 2–4 days/week.",
      "Knee extension or quadriceps strengthening: 2–4 sets × 6–15 reps, progressing resistance.",
      "Hip abductor/extensor strengthening: 2–3 sets × 8–15 reps.",
      "Calf raises: 2–3 sets × 10–20 reps.",
      "Aerobic walking/cycling: build toward 20–30 minutes most days if tolerated."
    ],
    manualApplication: [
      "Patellar or tibiofemoral mobilization can be used when a clear mobility restriction is relevant.",
      "Use Grade I–II for pain-dominant presentations and higher grades for safe stiffness-dominant restriction.",
      "MWM can be trialed during squat/step if it immediately reduces pain."
    ],
    modalityDose: [
      "Heat: 10–15 minutes for stiffness if helpful.",
      "Cold: 10–15 minutes after activity for symptom relief if preferred.",
      "TENS can be an adjunct for short-term pain but should not replace strengthening."
    ],
    progressionRules: [
      "Increase resistance when the patient completes the top end of the rep range with good form and symptoms settle within about 24 hours.",
      "Progress chair height, step height, walking distance and external load gradually.",
      "Use function, not pain elimination, as the only progression target."
    ],
    commonMistakes: [
      "Avoiding strength training because of crepitus.",
      "Using only modalities.",
      "Not loading the quadriceps enough to create adaptation.",
      "Progressing too fast after a long period of inactivity."
    ],
    patientEducation: [
      "Explain that exercise is safe and can improve pain/function even when X-rays show OA.",
      "Normalize painless crepitus.",
      "Discuss body-weight management sensitively only when relevant and desired."
    ]
  },

  "hip-osteoarthritis": {
    clinicalLogic: [
      "Prioritize walking tolerance, hip strength and functional independence.",
      "Manual traction/mobilization is useful only if it improves movement enough to support active work.",
      "Differentiate hip OA from lumbar referral and other hip pathology."
    ],
    firstSession: [
      "Measure pain, hip ROM, sit-to-stand, gait and walking tolerance.",
      "Test hip abductors/extensors and functional step control.",
      "Start strengthening at a dose the patient can repeat consistently."
    ],
    exerciseDose: [
      "Sit-to-stand: 2–3 sets × 6–12 reps.",
      "Bridge or hip extension: 2–3 sets × 8–15 reps.",
      "Hip abduction: 2–3 sets × 8–15 reps.",
      "Step-ups: 2–3 sets × 6–12 reps/side.",
      "Walking/cycling: build duration gradually."
    ],
    manualApplication: [
      "Hip long-axis traction: gentle test force first, then sustained/intermittent bouts if pain reduces.",
      "Posterior/anterior/lateral glides: select from movement restriction and response.",
      "Avoid aggressive mobilization in severe osteoporosis or irritable inflammatory states."
    ],
    modalityDose: [
      "Heat can be used 10–15 minutes for comfort before exercise.",
      "TENS may be trialed but is optional."
    ],
    progressionRules: [
      "Progress external resistance, walking distance and step height.",
      "Use an assistive device temporarily if it improves gait safety and allows more activity.",
      "Refer for orthopedic discussion when disability remains severe despite adequate conservative care."
    ],
    commonMistakes: [
      "Focusing only on stretching.",
      "Not strengthening hip abductors/extensors.",
      "Ignoring lumbar contribution.",
      "Waiting for zero pain before progressing function."
    ],
    patientEducation: [
      "Explain the role of regular movement and strength.",
      "Teach pacing for longer walking days.",
      "Discuss assistive devices as tools for activity, not signs of failure."
    ]
  },

  "patellofemoral-pain": {
    clinicalLogic: [
      "The main problem is often load tolerance rather than a patella that must be permanently 'realigned'.",
      "Treat the whole kinetic chain when relevant, especially knee extensor and hip capacity.",
      "Use taping/manual therapy as short-term pain reducers to allow better exercise."
    ],
    firstSession: [
      "Measure pain during squat/step, hip/knee strength and recent training-load change.",
      "Identify the most provocative task and reduce only enough load to make rehabilitation possible.",
      "Teach a squat or knee-extension variation that stays within tolerable symptoms."
    ],
    exerciseDose: [
      "Quadriceps strengthening: 3 sets × 8–15 reps, 2–4 days/week.",
      "Hip abduction/external rotation: 2–3 sets × 10–20 reps.",
      "Step-down/squat control: 2–3 sets × 6–12 reps.",
      "Calf/foot work when relevant: 2–3 sets × 10–20 reps.",
      "Return-to-running exposure: increase only one variable at a time."
    ],
    manualApplication: [
      "Patellar mobilization is only indicated if there is a relevant mobility deficit.",
      "A pain-reducing MWM or taping strategy can be used during squat/step and then gradually withdrawn as capacity improves."
    ],
    modalityDose: [
      "Cold can be used for comfort after activity.",
      "Passive electrotherapy is not required in routine management."
    ],
    progressionRules: [
      "Allow mild pain during exercise if it remains acceptable and settles by the next day.",
      "Progress depth, load, speed and single-leg demand gradually.",
      "Return to jumping/running after basic strength and step control improve."
    ],
    commonMistakes: [
      "Blaming every case on VMO weakness.",
      "Avoiding all knee flexion.",
      "Keeping the patient in low-load band exercises for months.",
      "Ignoring sudden training-volume spikes."
    ],
    patientEducation: [
      "Explain load tolerance in simple terms: the knee usually needs better capacity, not permanent avoidance.",
      "Normalize gradual exposure to stairs, squats and running.",
      "Use pain-monitoring rather than fear-based restriction."
    ]
  },

  "lateral-ankle-sprain": {
    clinicalLogic: [
      "After excluding fracture and major syndesmotic injury, early protected loading is usually better than unnecessary prolonged immobilization.",
      "Restore dorsiflexion, calf/peroneal strength, balance and later hopping/cutting capacity.",
      "Return to sport should be criteria-based."
    ],
    firstSession: [
      "Use Ottawa rules when appropriate and assess weight bearing, swelling and neurovascular status.",
      "Measure dorsiflexion and pain-free gait.",
      "Begin protected weight bearing, ROM and simple balance as tolerated."
    ],
    exerciseDose: [
      "Ankle pumps/circles: 10–20 reps, several times/day.",
      "Calf raises: progress double-leg to single-leg, 2–4 sets × 8–20 reps.",
      "Band eversion/inversion: 2–3 sets × 10–20 reps.",
      "Single-leg balance: 20–45 seconds × 3–5 repetitions.",
      "Later hopping/landing: low volume first, then multidirectional work."
    ],
    manualApplication: [
      "Talocrural posterior glide/MWM can be used when dorsiflexion is limited.",
      "Retest the weight-bearing lunge immediately after mobilization.",
      "Soft-tissue work can be used after acute bruising/hematoma settles."
    ],
    modalityDose: [
      "Compression/elevation early if swelling is significant.",
      "Cold 10–15 minutes for comfort if useful; it is not required for healing."
    ],
    progressionRules: [
      "Walk without limp before running.",
      "Achieve good single-leg balance and calf strength before higher-speed tasks.",
      "Progress hopping → running → cutting → sport practice."
    ],
    commonMistakes: [
      "Keeping the ankle immobilized too long.",
      "Ignoring balance retraining.",
      "Returning to sport because swelling is gone while hop control remains poor.",
      "Forcing painful stretching in the first days."
    ],
    patientEducation: [
      "Encourage safe early movement and loading.",
      "Explain that brace/tape can support return to sport but does not replace balance and strength training.",
      "Teach signs that require reassessment such as inability to progress weight bearing."
    ]
  },

  "achilles-tendinopathy": {
    clinicalLogic: [
      "The tendon usually needs progressive loading, not prolonged rest.",
      "Differentiate insertional from mid-portion pain because deep dorsiflexion may irritate insertional disease.",
      "Monitor total tendon load from walking, running, jumping and exercise."
    ],
    firstSession: [
      "Measure pain, morning stiffness, heel-raise capacity and training-load change.",
      "Screen rupture when onset is sudden with major weakness.",
      "Choose an initial calf-loading exercise that is tolerable."
    ],
    exerciseDose: [
      "Isometric calf raise hold: 30–45 seconds × 4–5 repetitions when helpful for pain.",
      "Heavy slow calf raises: 3–4 sets × 6–12 reps, 2–4 days/week, progressing load.",
      "Bent-knee soleus raises: 3 sets × 8–15 reps.",
      "Later pogo/hopping and running progression once strength/load tolerance improves."
    ],
    manualApplication: [
      "Manual therapy is optional and secondary.",
      "Use ankle mobilization only if a meaningful dorsiflexion restriction limits function.",
      "Soft-tissue work should be brief and should not replace progressive loading."
    ],
    modalityDose: [
      "Heat/cold only for comfort.",
      "Routine ultrasound is not necessary."
    ],
    progressionRules: [
      "Progress load when exercise pain is acceptable and the tendon returns to baseline by the next day.",
      "Increase resistance before speed.",
      "Add plyometric work before full-speed running."
    ],
    commonMistakes: [
      "Complete rest for weeks.",
      "Repeated stretching into painful insertional compression.",
      "Doing only eccentric exercise when other progressive resistance options are suitable.",
      "Ignoring training-load spikes."
    ],
    patientEducation: [
      "Explain that tendon pain can improve with appropriate loading even if some discomfort occurs during exercise.",
      "Use next-day response to judge dose.",
      "Set expectations that recovery may take weeks to months."
    ]
  },

  "plantar-heel-pain": {
    clinicalLogic: [
      "Treat the foot and calf as a load-tolerance system rather than assuming a fixed 'spur' is the cause.",
      "First-step pain and cumulative standing/running load are useful markers.",
      "Strength and sensible load management usually matter more than passive treatment."
    ],
    firstSession: [
      "Measure first-step pain, calf strength and ankle dorsiflexion.",
      "Screen stress fracture and neurological causes if symptoms are atypical.",
      "Teach plantar fascia/calf mobility plus one strengthening exercise."
    ],
    exerciseDose: [
      "Plantar fascia stretch: 20–30 seconds × 3–5 repetitions, especially before first steps.",
      "Calf stretch: 30 seconds × 3 reps if dorsiflexion is limited.",
      "Calf raises: 3 sets × 8–15 reps, progressing to single leg and added load.",
      "Intrinsic foot exercise: 2–3 sets × 10–15 controlled reps."
    ],
    manualApplication: [
      "Ankle/foot mobilization can be used when a mobility deficit is clearly relevant.",
      "Soft-tissue work to calf/plantar tissues can be used briefly for symptom relief.",
      "Reassess walking or first-step simulation after treatment."
    ],
    modalityDose: [
      "Ice massage 5–10 minutes may be used for comfort.",
      "Taping can be used short term to reduce pain during walking."
    ],
    progressionRules: [
      "Progress calf load and walking volume gradually.",
      "Add hopping/running only after daily walking is well tolerated.",
      "Use symptom response the next morning as a useful load marker."
    ],
    commonMistakes: [
      "Focusing only on a heel spur.",
      "Stretching without strengthening.",
      "Abrupt return to long standing/running.",
      "Using painful deep massage every day."
    ],
    patientEducation: [
      "Explain that the plantar fascia is load-sensitive and often improves with gradual capacity building.",
      "Footwear may help symptoms but is not the only treatment.",
      "Avoid sudden increases in running/standing."
    ]
  },

  "adhesive-capsulitis": {
    clinicalLogic: [
      "Match treatment intensity to irritability. A very painful shoulder often needs gentle movement, not aggressive stretching.",
      "Expect recovery to be gradual. The goal is steady improvement in function and sleep, not forcing normal range in one session.",
      "Differentiate true capsular restriction from rotator-cuff pain, arthritis or neurological disease."
    ],
    firstSession: [
      "Measure active/passive ROM, SPADI, night pain and functional reach.",
      "Identify whether pain or stiffness is the dominant problem.",
      "Teach gentle assisted ROM that does not create a prolonged flare."
    ],
    exerciseDose: [
      "Pendulum or relaxed movement: 30–60 seconds × 2–3 bouts.",
      "Assisted flexion/external rotation: 5–10 slow reps, several times/day.",
      "Low-load stretching: 20–30 seconds × 3–5 reps when irritability allows.",
      "Later cuff/scapular strength: 2–3 sets × 8–15 reps."
    ],
    manualApplication: [
      "High irritability: Grade I–II glenohumeral mobilization for pain modulation.",
      "Lower irritability/stiffness dominant: progress posterior/inferior/anterior glides with careful reassessment.",
      "Scapulothoracic mobilization can be added if it improves functional reach."
    ],
    modalityDose: [
      "Heat 10–15 minutes before mobility if helpful.",
      "TENS can be used short term for pain."
    ],
    progressionRules: [
      "Increase stretch intensity only when post-treatment flare is small and short-lived.",
      "Progress from assisted to active motion, then resistance and overhead function.",
      "If progress is very limited with severe pain, coordinate medical options such as injection when appropriate."
    ],
    commonMistakes: [
      "Aggressive end-range mobilization in the painful stage.",
      "Forcing through severe pain because the shoulder is stiff.",
      "Neglecting strength as motion improves.",
      "Promising a rapid cure."
    ],
    patientEducation: [
      "Explain the slow natural course in simple language.",
      "Encourage frequent gentle movement rather than rare aggressive stretching.",
      "Teach comfortable sleep positioning."
    ]
  },

  "rotator-cuff-related-shoulder-pain": {
    clinicalLogic: [
      "The main rehabilitation target is shoulder load capacity.",
      "Pain with elevation does not automatically mean tendon damage is worsening.",
      "Use manual therapy or taping only to make movement/exercise easier."
    ],
    firstSession: [
      "Measure SPADI/DASH, active ROM, painful arc, rotator-cuff strength and functional lifting.",
      "Screen neck/neurological contribution.",
      "Choose a pain-tolerable cuff exercise immediately."
    ],
    exerciseDose: [
      "External rotation isometric: 20–30 seconds × 4–5 reps.",
      "External/internal rotation resistance: 3 sets × 8–15 reps.",
      "Scaption or overhead raise: 2–3 sets × 8–15 reps.",
      "Rows/serratus work: 2–3 sets × 10–20 reps.",
      "Progress to overhead and task-specific load."
    ],
    manualApplication: [
      "Glenohumeral or thoracic mobilization can be used when movement is restricted.",
      "MWM can be trialed if it immediately improves painful elevation.",
      "Soft-tissue work may reduce short-term sensitivity; follow with loading."
    ],
    modalityDose: [
      "Heat/cold according to preference.",
      "TENS is optional for temporary pain.",
      "Routine ultrasound is not central."
    ],
    progressionRules: [
      "Increase resistance when symptoms settle within 24 hours and technique remains good.",
      "Progress from below-shoulder work to overhead, then speed and endurance.",
      "Use work/sport demands to set the final stage."
    ],
    commonMistakes: [
      "Avoiding all overhead movement.",
      "Using only scapular posture correction.",
      "Keeping resistance too light to build capacity.",
      "Assuming imaging abnormalities are the full cause of symptoms."
    ],
    patientEducation: [
      "Explain gradual tendon/muscle adaptation.",
      "Encourage modified use rather than complete rest.",
      "Teach acceptable exercise pain and next-day monitoring."
    ]
  },

  "lateral-elbow-tendinopathy": {
    clinicalLogic: [
      "Progressive wrist-extensor and grip loading is central.",
      "Use pain-free grip change to judge whether an adjunct such as MWM is useful.",
      "Screen cervical/radial nerve contribution when the pattern is atypical."
    ],
    firstSession: [
      "Measure PRTEE, pain-free grip and resisted wrist-extension pain.",
      "Review work/tool/racquet load.",
      "Teach an isometric or light isotonic wrist-extensor exercise."
    ],
    exerciseDose: [
      "Wrist-extensor isometric: 30–45 seconds × 4–5 reps.",
      "Wrist extension strengthening: 3 sets × 8–15 reps.",
      "Pronation/supination: 2–3 sets × 10–15 reps.",
      "Gripping: 2–3 sets × 8–15 submaximal reps, progressing load."
    ],
    manualApplication: [
      "Lateral elbow MWM can be used if it immediately improves pain-free grip.",
      "Soft-tissue/friction techniques are optional adjuncts and should remain tolerable.",
      "Do not aggressively friction an irritable tendon."
    ],
    modalityDose: [
      "Counterforce strap may be trialed during provoking tasks.",
      "Heat/cold for comfort only."
    ],
    progressionRules: [
      "Increase load as pain-free grip improves.",
      "Progress speed, tool/racquet demand and endurance later.",
      "Use next-day tendon response to adjust dose."
    ],
    commonMistakes: [
      "Resting completely for long periods.",
      "Using friction instead of strengthening.",
      "Ignoring work-load modification.",
      "Repeated painful stretching."
    ],
    patientEducation: [
      "Explain tendon load tolerance and gradual strengthening.",
      "Temporarily modify the heaviest gripping, then reintroduce it.",
      "Set realistic recovery expectations."
    ]
  },

  "acl-reconstruction-rehabilitation": {
    clinicalLogic: [
      "Follow surgeon-specific restrictions first, then use criteria rather than calendar time alone for progression.",
      "Early priorities are extension, swelling control, quadriceps activation and normal gait.",
      "Later priorities are strength symmetry, landing control, running, cutting and psychological readiness."
    ],
    firstSession: [
      "Review operative note, graft and restrictions.",
      "Check wound, effusion, extension, flexion, quadriceps activation, gait and DVT warning signs.",
      "Start extension restoration and quadriceps activation immediately if permitted."
    ],
    exerciseDose: [
      "Quad sets: 5–10-second holds × 10–20 reps, multiple times/day early.",
      "Straight-leg raise when no extension lag: 2–3 sets × 8–15 reps.",
      "Sit-to-stand/squat/leg press as allowed: 3 sets × 8–15 reps.",
      "Progressive knee extension and hamstring work according to graft/protocol.",
      "Later running, plyometrics and change-of-direction are criterion-based."
    ],
    manualApplication: [
      "Patellar mobilization after surgery when safe and needed for mobility.",
      "Gentle tibiofemoral mobilization for ROM when cleared.",
      "Scar mobilization only after full wound healing."
    ],
    modalityDose: [
      "Cryotherapy/compression 10–20 minutes for swelling/comfort.",
      "NMES can be paired with quadriceps contraction when activation is poor."
    ],
    progressionRules: [
      "Do not progress high-impact work with significant effusion or poor strength control.",
      "Use objective strength and hop testing before return-to-sport decisions.",
      "Aim for high limb symmetry plus good movement quality, not symmetry alone."
    ],
    commonMistakes: [
      "Losing full extension early.",
      "Progressing based only on postoperative weeks.",
      "Underloading quadriceps.",
      "Returning to sport without strength/hop testing."
    ],
    patientEducation: [
      "Explain that swelling is a load-response signal.",
      "Teach DVT/infection warning signs.",
      "Set expectations for long-term strength and sport-specific rehabilitation."
    ]
  },

  "hamstring-strain": {
    clinicalLogic: [
      "Early controlled loading is usually better than long rest.",
      "Long-length strength and gradual sprint exposure are important because recurrence risk is high.",
      "Suspect proximal avulsion when there is sudden severe proximal pain, bruising and major weakness."
    ],
    firstSession: [
      "Assess walking, pain-free ROM and low-load isometric strength.",
      "Document mechanism and exact location.",
      "Begin pain-limited isometrics if safe."
    ],
    exerciseDose: [
      "Isometric hamstring: 20–45 seconds × 4–5 reps.",
      "Bridge progression: 3 sets × 8–15 reps.",
      "RDL/hip hinge progression: 3 sets × 6–12 reps.",
      "Nordic/eccentric progression later: 2–4 sets × 4–10 reps.",
      "Running: walk-jog → moderate speed → high speed → sprint."
    ],
    manualApplication: [
      "Avoid deep massage over an acute tear or hematoma.",
      "Gentle soft-tissue work can be added later for comfort, but loading is the main treatment."
    ],
    modalityDose: [
      "Compression/cold early only for comfort/swelling management.",
      "Do not let passive treatment delay loading progression."
    ],
    progressionRules: [
      "Progress when walking is pain-free and strength improves.",
      "Increase running speed gradually; do not jump from jogging directly to maximal sprinting.",
      "Include long-length and high-speed preparation before return to sport."
    ],
    commonMistakes: [
      "Aggressive stretching in the acute stage.",
      "No sprint exposure before return.",
      "Ignoring hip-extension strength.",
      "Returning when pain is gone but strength remains reduced."
    ],
    patientEducation: [
      "Explain recurrence risk and why high-speed preparation matters.",
      "Use soreness next day to adjust training dose.",
      "Teach early signs of overload."
    ]
  },

  "stroke-rehabilitation": {
    clinicalLogic: [
      "Prioritize meaningful tasks and high-quality repetition rather than passive movement alone.",
      "Dose practice according to cardiovascular tolerance, fatigue, cognition and motor severity.",
      "Use manual facilitation only to help the patient perform the task more successfully."
    ],
    firstSession: [
      "Assess transfers, sitting/standing balance, walking, upper-limb function, sensation, neglect and communication needs.",
      "Check blood pressure, heart rate and medical stability.",
      "Choose one mobility goal and one upper-limb/ADL goal."
    ],
    exerciseDose: [
      "Sit-to-stand: repeated task practice, e.g. 2–5 sets of 5–10 reps as tolerated.",
      "Walking: frequent bouts accumulating meaningful steps; increase duration/speed gradually.",
      "Strength training: 2–3 sets × 6–15 reps for available muscle groups.",
      "Reaching/grasp practice: high repetition with task variation.",
      "Aerobic training: moderate intensity when medically appropriate."
    ],
    manualApplication: [
      "Use guided handling to improve alignment or allow successful movement practice.",
      "Mobilize painful/stiff joints only when there is a true secondary musculoskeletal restriction.",
      "Do not describe spasticity as something that can simply be 'released' permanently by massage."
    ],
    modalityDose: [
      "FES/NMES can support selected motor goals when appropriately indicated.",
      "Use orthoses/positioning only for a defined goal."
    ],
    progressionRules: [
      "Increase repetitions, reduce assistance and increase task complexity.",
      "Progress from blocked practice to variable real-world practice.",
      "Monitor fatigue and cardiovascular response."
    ],
    commonMistakes: [
      "Too much passive ROM and too little task practice.",
      "Doing exercises without functional relevance.",
      "Ignoring neglect/cognition.",
      "Not measuring walking speed or function over time."
    ],
    patientEducation: [
      "Explain neuroplasticity as repeated meaningful practice.",
      "Encourage safe activity outside therapy.",
      "Train caregivers in assistance that promotes independence rather than doing everything for the patient."
    ]
  },

  "parkinsons-disease": {
    clinicalLogic: [
      "Target bradykinesia, gait, balance, freezing and deconditioning with large-amplitude and task-specific practice.",
      "Consider medication on/off periods when scheduling challenging mobility work.",
      "Build lifelong exercise habits because the condition is progressive."
    ],
    firstSession: [
      "Assess gait speed, turning, freezing triggers, balance, falls and dual-task difficulty.",
      "Check orthostatic symptoms and fatigue.",
      "Teach one amplitude strategy and one cueing strategy."
    ],
    exerciseDose: [
      "Large-amplitude movement: 1–2 sets × 8–10 repetitions of major patterns.",
      "Strength: 2–3 sets × 6–15 reps, 2–3 days/week.",
      "Balance/reactive stepping: 10–20 minutes, 3+ days/week as safe.",
      "Aerobic exercise: build toward 20–30 minutes on most days.",
      "Gait cueing: short focused bouts using visual or auditory cues."
    ],
    manualApplication: [
      "Manual therapy can address secondary musculoskeletal stiffness but should not be the main Parkinson's intervention.",
      "Use it only if it makes active movement practice easier."
    ],
    modalityDose: ["External cueing is often more clinically useful than passive electrotherapy."],
    progressionRules: [
      "Increase amplitude, speed, turning challenge and dual-task demand.",
      "Progress from predictable clinic tasks to community mobility.",
      "Review falls risk regularly."
    ],
    commonMistakes: [
      "Doing only stretching.",
      "Ignoring freezing/turning.",
      "Not training reactive balance.",
      "Under-dosing exercise."
    ],
    patientEducation: [
      "Teach cueing strategies for freezing.",
      "Encourage regular vigorous-enough exercise when medically safe.",
      "Discuss falls prevention and home setup."
    ]
  },

  "spinal-cord-injury-rehabilitation": {
    clinicalLogic: [
      "Plan is determined by neurological level, completeness, medical status and patient goals.",
      "Prevent secondary complications while maximizing independence.",
      "Protect insensate skin and osteoporotic bone during manual and exercise interventions."
    ],
    firstSession: [
      "Review neurological level/completeness and medical precautions.",
      "Check respiratory status, skin, ROM, spasticity, transfers and wheelchair needs.",
      "Screen autonomic dysreflexia risk in lesions where relevant."
    ],
    exerciseDose: [
      "Strength: 2–4 sets × 6–15 reps for available musculature.",
      "Pressure-relief practice: according to seating/rehabilitation protocol.",
      "Transfer and wheelchair skills: repeated task practice with progressive independence.",
      "Aerobic arm/leg exercise: individualized moderate-intensity bouts.",
      "Standing/gait training when clinically appropriate."
    ],
    manualApplication: [
      "Gentle joint/soft-tissue mobilization can address secondary stiffness.",
      "Avoid forceful mobilization in osteoporotic bone or areas lacking protective sensation.",
      "Inspect skin after treatment."
    ],
    modalityDose: ["FES/NMES may support muscle activation, conditioning or cycling in selected patients."],
    progressionRules: [
      "Progress independence and endurance before unnecessary complexity.",
      "Increase community wheelchair or gait demands gradually.",
      "Reassess equipment as function changes."
    ],
    commonMistakes: [
      "Ignoring skin checks.",
      "Overstretching insensate joints.",
      "Poor autonomic dysreflexia awareness.",
      "Focusing on walking when wheelchair independence may be the more meaningful goal."
    ],
    patientEducation: [
      "Teach pressure injury prevention.",
      "Teach autonomic dysreflexia warning signs where relevant.",
      "Develop a lifelong exercise and equipment-maintenance plan."
    ]
  },

  "cerebral-palsy": {
    clinicalLogic: [
      "Use family-centered, goal-directed treatment focused on participation and function.",
      "Strength training is appropriate and does not automatically worsen spasticity.",
      "Passive techniques should never replace active skill practice."
    ],
    firstSession: [
      "Clarify child/family goals.",
      "Assess GMFCS level, mobility, strength, ROM, selective motor control and equipment.",
      "Choose functional play tasks that directly match goals."
    ],
    exerciseDose: [
      "Functional strength: 2–3 sets × 6–15 reps using sit-to-stand, step, squat or play-based tasks.",
      "Balance: repeated short play bouts.",
      "Gait practice: frequent task-specific repetitions with appropriate device.",
      "Aerobic play/cycling: build duration according to age and tolerance."
    ],
    manualApplication: [
      "Use gentle mobility for true contracture/stiffness and handling to support active task practice.",
      "Avoid painful stretching or claims that manual treatment permanently normalizes tone."
    ],
    modalityDose: ["Orthoses/FES may be used for defined functional goals with appropriate specialist input."],
    progressionRules: [
      "Increase task challenge while keeping the child successful and engaged.",
      "Reduce assistance as skill improves.",
      "Update goals as participation needs change."
    ],
    commonMistakes: [
      "Therapy dominated by passive stretching.",
      "Ignoring child preference and family goals.",
      "Underloading strength training.",
      "Treating tone rather than function."
    ],
    patientEducation: [
      "Embed exercises in play and daily routines.",
      "Teach caregivers easy home activities instead of long complex programs.",
      "Encourage participation in school/community physical activity."
    ]
  },

  "copd-pulmonary-rehabilitation": {
    clinicalLogic: [
      "Exercise training is the core intervention; dyspnea is monitored and managed rather than avoided completely.",
      "Monitor oxygen saturation and cardiovascular response according to medical status.",
      "Airway clearance is indicated when secretion retention exists, not simply because the diagnosis is COPD."
    ],
    firstSession: [
      "Record dyspnea, SpO2, heart rate, 6MWT/sit-to-stand and exacerbation history.",
      "Review oxygen prescription and medical restrictions.",
      "Teach pacing and breathing control during exertion."
    ],
    exerciseDose: [
      "Aerobic: interval or continuous training, often 20–40 minutes total, 3–5 days/week as tolerated.",
      "Strength: 2–3 sets × 6–15 reps for major muscle groups, 2–3 days/week.",
      "Sit-to-stand: 2–4 sets × 5–15 reps.",
      "Inspiratory muscle training only in selected patients with appropriate assessment."
    ],
    manualApplication: [
      "Thoracic mobility or supported positioning may improve comfort.",
      "Percussion/vibration only when airway-clearance indications are present."
    ],
    modalityDose: [
      "Supplemental oxygen must follow medical prescription/criteria.",
      "Pursed-lip breathing can be practiced during exertion if it helps dyspnea control."
    ],
    progressionRules: [
      "Increase duration first in very deconditioned patients.",
      "Progress resistance and walking speed while monitoring SpO2, dyspnea and recovery.",
      "Use interval training when continuous exercise is not tolerated."
    ],
    commonMistakes: [
      "Stopping exercise whenever the patient feels any breathlessness.",
      "Ignoring desaturation.",
      "Using chest percussion without secretion-retention indication.",
      "Not training legs strongly enough."
    ],
    patientEducation: [
      "Teach pacing, inhaler/medical adherence through the appropriate team and exacerbation action planning.",
      "Explain safe breathlessness versus warning symptoms.",
      "Encourage daily physical activity."
    ]
  },

  "post-cabg-rehabilitation": {
    clinicalLogic: [
      "Early mobilization and progressive cardiac rehabilitation improve function, but hemodynamic and wound safety come first.",
      "Follow surgeon/cardiology guidance for sternotomy precautions and resistance progression.",
      "Use RPE, symptoms and vital signs to dose activity."
    ],
    firstSession: [
      "Check heart rate, BP, SpO2, rhythm concerns, wound and sternal status.",
      "Assess bed mobility, transfers and walking.",
      "Teach supported cough/breathing if needed and begin safe walking."
    ],
    exerciseDose: [
      "Walking: several short bouts/day early, progressing duration.",
      "Sit-to-stand: 1–3 sets × 5–10 reps as tolerated.",
      "Aerobic rehab later: moderate-intensity continuous or interval work according to cardiac rehab guidance.",
      "Resistance training: begin when medically cleared and sternum healing allows."
    ],
    manualApplication: [
      "Gentle shoulder/thoracic mobility after clearance.",
      "Scar mobilization only after healing.",
      "Avoid manual forces that stress an unstable or painful sternum."
    ],
    modalityDose: ["Breathing/airway-clearance techniques only when indicated; routine passive electrotherapy is unnecessary."],
    progressionRules: [
      "Increase walking duration before intensity early.",
      "Monitor RPE, vitals and symptom recovery.",
      "Progress upper-body resistance gradually after healing/clearance."
    ],
    commonMistakes: [
      "Ignoring chest pain or rhythm symptoms.",
      "Overly restrictive long-term arm avoidance.",
      "Advancing resistance without medical clearance.",
      "Not teaching home walking progression."
    ],
    patientEducation: [
      "Teach wound/infection warning signs.",
      "Teach when chest pain, syncope or severe breathlessness requires urgent care.",
      "Encourage structured cardiac rehabilitation."
    ]
  },

  "post-mastectomy-rehabilitation": {
    clinicalLogic: [
      "Restore shoulder motion and strength while monitoring wound healing, pain and lymphedema risk.",
      "Progress arm use rather than promoting long-term fear of lifting.",
      "Manual lymphatic drainage is specialized and only one part of lymphedema care."
    ],
    firstSession: [
      "Check wound status, shoulder ROM, pain, swelling and sensory symptoms.",
      "Measure arm circumference/volume when lymphedema concern exists.",
      "Begin gentle shoulder mobility and breathing."
    ],
    exerciseDose: [
      "Assisted shoulder flexion/abduction: 5–10 reps, several times/day early.",
      "Scapular control: 2–3 sets × 10–15 reps.",
      "Progressive resistance: 2–3 sets × 8–15 reps once healing allows.",
      "Aerobic activity: gradual return to regular walking/cycling."
    ],
    manualApplication: [
      "Scar mobilization only after full healing.",
      "Gentle shoulder/thoracic mobilization if stiffness limits function.",
      "MLD only after appropriate swelling assessment and by trained clinicians."
    ],
    modalityDose: [
      "Compression only when clinically indicated and properly fitted.",
      "TENS may be used for selected pain after screening."
    ],
    progressionRules: [
      "Increase overhead range and resistance slowly.",
      "Progress lifting based on symptom/swelling response.",
      "Monitor for new persistent swelling."
    ],
    commonMistakes: [
      "Keeping the arm protected for too long.",
      "Aggressive scar work before healing.",
      "Treating unexplained new swelling as routine lymphedema.",
      "Avoiding strength training unnecessarily."
    ],
    patientEducation: [
      "Teach skin care and swelling awareness.",
      "Encourage gradual return to normal arm use.",
      "Explain when redness, fever or rapid swelling needs medical review."
    ]
  },

  "vestibular-bppv": {
    clinicalLogic: [
      "Classic BPPV is treated with canalith repositioning after identifying the involved canal/side.",
      "Atypical nystagmus or neurological signs require a different diagnostic pathway.",
      "Do not substitute generic balance exercises for correct repositioning in clear BPPV."
    ],
    firstSession: [
      "Take a detailed vertigo history: duration, triggers and associated neurological symptoms.",
      "Perform oculomotor/neurological screening if presentation is not classic.",
      "Use Dix-Hallpike or supine roll testing as appropriate.",
      "Choose the maneuver based on canal and side."
    ],
    exerciseDose: [
      "No generic strengthening dosage is required for isolated BPPV.",
      "If residual imbalance remains, add balance/gaze-stability work based on findings."
    ],
    manualApplication: [
      "Posterior-canal BPPV: use an appropriate canalith repositioning sequence such as Epley when indicated.",
      "Move the head/body through each position carefully and observe symptom/nystagmus response.",
      "Cervical limitations may require modified maneuvers."
    ],
    modalityDose: ["Electrotherapy has no routine role."],
    progressionRules: [
      "Re-test after treatment when appropriate.",
      "If positional tests normalize but imbalance persists, treat residual vestibular deficits.",
      "If repeated maneuvers fail, reconsider diagnosis/canal."
    ],
    commonMistakes: [
      "Treating dizziness without identifying the canal.",
      "Missing central neurological signs.",
      "Doing repeated maneuvers despite no diagnostic fit.",
      "Forcing cervical extension in a patient who cannot tolerate it."
    ],
    patientEducation: [
      "Explain that BPPV can recur.",
      "Teach a home maneuver only after diagnosis and correct technique are established.",
      "Explain warning signs that are not typical of BPPV."
    ]
  },

  "temporomandibular-disorder": {
    clinicalLogic: [
      "Treat musculoskeletal TMD with jaw-control exercise, habit modification and selected manual therapy.",
      "Screen dental/maxillofacial causes and true locking.",
      "Cervical contribution can matter in some patients."
    ],
    firstSession: [
      "Measure comfortable mouth opening and pain with chewing/yawning.",
      "Assess deviation, joint sounds, masticatory tenderness and cervical function.",
      "Identify clenching or high-load habits."
    ],
    exerciseDose: [
      "Controlled opening with tongue resting gently on palate: 6–10 reps, 2–4 times/day.",
      "Jaw isometrics: gentle 5-second holds × 5 reps in selected directions.",
      "Cervical/scapular exercise: 2–3 sets × 8–15 reps if relevant."
    ],
    manualApplication: [
      "Gentle TMJ distraction or glide when mobility restriction is present.",
      "Masseter/temporalis soft-tissue work using tolerable pressure.",
      "Cervical mobilization only if it changes the comparable jaw/neck symptom."
    ],
    modalityDose: ["Heat 10–15 minutes can help muscle-dominant pain; TENS is optional."],
    progressionRules: [
      "Increase chewing challenge gradually.",
      "Progress jaw resistance only when baseline pain is stable.",
      "Reduce manual therapy as self-management improves."
    ],
    commonMistakes: [
      "Aggressive intraoral pressure.",
      "Ignoring clenching/stress behavior.",
      "Treating joint sounds that are painless and not functionally limiting.",
      "Not screening for true locking."
    ],
    patientEducation: [
      "Reduce non-functional clenching.",
      "Temporarily modify very hard/chewy foods during flares.",
      "Teach relaxed jaw posture and controlled movement."
    ]
  },

  "carpal-tunnel-syndrome": {
    clinicalLogic: [
      "Mild-to-moderate cases may respond to night splinting, activity modification and nerve/tendon gliding.",
      "Progressive thenar weakness or constant major sensory loss needs medical review.",
      "Screen cervical/proximal median nerve contribution."
    ],
    firstSession: [
      "Record symptom distribution, thenar strength, grip/pinch and functional limits.",
      "Assess provocative positions and work habits.",
      "Fit/advise neutral wrist positioning at night when indicated."
    ],
    exerciseDose: [
      "Median nerve slider: 5–10 gentle reps, 1–3 times/day initially.",
      "Tendon glides: 5–10 reps, 2–4 times/day.",
      "Grip/hand strengthening later: 2–3 sets × 8–15 reps."
    ],
    manualApplication: [
      "Median nerve sliders should remain gentle and should not create prolonged numbness.",
      "Carpal/forearm mobilization can be trialed if it improves symptoms.",
      "Avoid aggressive pressure directly over the carpal tunnel."
    ],
    modalityDose: ["Night neutral wrist splinting is often more useful than electrotherapy for symptom control."],
    progressionRules: [
      "Increase hand loading as nocturnal symptoms and irritability reduce.",
      "Progress work tasks gradually.",
      "Escalate if strength declines."
    ],
    commonMistakes: [
      "Repeated strong nerve stretching.",
      "Ignoring thenar weakness.",
      "Using only wrist massage.",
      "Keeping the wrist splint on all day without need."
    ],
    patientEducation: [
      "Avoid long sustained wrist flexion/extension when possible.",
      "Use frequent micro-breaks for repetitive work.",
      "Explain when surgical/medical opinion may be needed."
    ]
  },

  "de-quervain-tenosynovitis": {
    clinicalLogic: [
      "Reduce the most provocative thumb/wrist load temporarily, then rebuild tendon capacity.",
      "Splinting can be useful short term when daily tasks repeatedly irritate symptoms.",
      "Manual therapy is adjunctive."
    ],
    firstSession: [
      "Identify painful tasks and thumb/wrist loading pattern.",
      "Measure grip/pinch and functional limits.",
      "Teach a low-load thumb isometric."
    ],
    exerciseDose: [
      "Thumb abduction/extension isometric: 20–30 seconds × 4–5 reps.",
      "Progress to isotonic thumb/wrist loading: 3 sets × 8–15 reps.",
      "Grip strengthening later: 2–3 sets × 8–15 reps."
    ],
    manualApplication: [
      "Gentle forearm/thumb soft-tissue techniques for comfort.",
      "Avoid aggressive friction over highly irritable tendon sheaths."
    ],
    modalityDose: ["Thumb-spica support may be used short term; heat/cold only for comfort."],
    progressionRules: [
      "Increase resistance before repetitive speed.",
      "Reintroduce caregiving/work tasks gradually.",
      "Reduce splint use as load tolerance improves."
    ],
    commonMistakes: [
      "Long-term complete thumb avoidance.",
      "Aggressive painful stretching.",
      "No progressive loading.",
      "Ignoring task ergonomics."
    ],
    patientEducation: [
      "Teach load modification rather than total rest.",
      "Use larger joints/two hands for heavy tasks temporarily.",
      "Explain gradual tendon adaptation."
    ]
  },

  "ankylosing-spondylitis-rehabilitation": {
    clinicalLogic: [
      "Exercise is a long-term management strategy alongside rheumatology medical care.",
      "Maintain spinal mobility, chest expansion, strength and aerobic fitness.",
      "Forceful manipulation can be dangerous in ankylosed/osteoporotic spines."
    ],
    firstSession: [
      "Measure spinal mobility, posture, chest expansion, hip/shoulder ROM and function.",
      "Ask about eye symptoms, fracture history and neurological change.",
      "Build a daily mobility routine."
    ],
    exerciseDose: [
      "Spinal mobility: 5–10 reps per direction daily.",
      "Postural extension: 2–3 sets × 8–15 reps.",
      "Chest expansion/breathing: 5–10 deep controlled breaths × several bouts/day.",
      "Strength: 2–3 sets × 6–15 reps, 2–3 days/week.",
      "Aerobic: build toward 20–30+ minutes most days."
    ],
    manualApplication: [
      "Gentle mobility techniques only when bone/joint safety is clear.",
      "Avoid high-force manipulation where ankylosis, osteoporosis or fracture risk exists."
    ],
    modalityDose: ["Heat may help stiffness temporarily."],
    progressionRules: [
      "Progress strength/aerobic load while preserving daily mobility.",
      "Modify during inflammatory flares but avoid prolonged inactivity."
    ],
    commonMistakes: [
      "Forceful spinal manipulation.",
      "Exercise only during symptomatic periods.",
      "Ignoring chest expansion.",
      "Missing fracture risk after minor trauma."
    ],
    patientEducation: [
      "Emphasize lifelong exercise consistency.",
      "Teach urgent review for new neurological symptoms after trauma.",
      "Coordinate with rheumatology for inflammatory control."
    ]
  },

  "fibromyalgia": {
    clinicalLogic: [
      "The goal is to build activity tolerance without reinforcing fear that normal movement is damaging tissue.",
      "Use pacing, sleep support and graded exercise.",
      "Manual therapy may provide comfort but should not become the only strategy."
    ],
    firstSession: [
      "Assess widespread pain, fatigue, sleep, current activity and the patient's biggest functional limitation.",
      "Start below the patient's flare threshold.",
      "Choose an enjoyable form of aerobic activity plus simple strength."
    ],
    exerciseDose: [
      "Aerobic: start as low as 5–10 minutes and gradually build toward 20–30 minutes, 3–5 days/week.",
      "Strength: 1–3 sets × 6–15 reps, 2–3 days/week, starting light.",
      "Mobility: short daily sessions focused on comfort.",
      "Aquatic exercise is an option if preferred."
    ],
    manualApplication: [
      "Use gentle soft-tissue/MFR only if soothing.",
      "Avoid aggressive pressure that creates multi-day flares.",
      "Always pair passive treatment with active self-management."
    ],
    modalityDose: ["Heat or TENS may be used for short-term comfort."],
    progressionRules: [
      "Increase one variable at a time—duration, then frequency, then intensity.",
      "Expect some symptom variability; judge progress over weeks, not single days.",
      "During mild flares, reduce dose rather than stopping all activity."
    ],
    commonMistakes: [
      "Boom-bust exercise cycles.",
      "Very aggressive manual treatment.",
      "Promising a tissue 'release' will cure widespread pain.",
      "Changing the program every time symptoms fluctuate."
    ],
    patientEducation: [
      "Explain sensitized pain processing in simple non-threatening language.",
      "Emphasize consistency, sleep and gradual capacity.",
      "Validate symptoms without promoting fragility beliefs."
    ]
  }
};
