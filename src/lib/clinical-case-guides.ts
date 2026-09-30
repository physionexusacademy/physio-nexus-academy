export type ClinicalCaseGuide = {
  keyQuestions: string[];
  examinationSequence: string[];
  decisionLogic: string[];
  practicalManagement: string[];
  exerciseDose: string[];
  reassessment: string[];
  commonMistakes: string[];
  masterTakeaway: string[];
};

export const clinicalCaseGuides: Record<string, ClinicalCaseGuide> = {
  "low-back-pain-new-bladder-saddle-symptoms": {
    keyQuestions: [
      "When did the bladder change start? Ask specifically about difficulty starting urine, reduced sensation of flow, retention, overflow leakage and new incontinence.",
      "Ask about new bowel dysfunction and whether the patient can feel wiping normally.",
      "Ask about altered sensation around the inner thighs, genitals, buttocks and saddle/perineal area.",
      "Ask whether leg weakness, numbness or walking difficulty is new or rapidly worsening.",
      "Clarify onset time because urgent services need a clear timeline.",
      "Do not use vague wording such as 'any bladder problem?' — patients may not recognize retention or altered urinary sensation as a red flag."
    ],
    examinationSequence: [
      "1. Stop routine mechanical assessment as soon as the red-flag cluster becomes clear.",
      "2. Record vital observations if clinically indicated and available, but do not let routine testing delay escalation.",
      "3. Briefly document lower-limb neurological status if it can be done without delaying referral: key myotomes, dermatomes and major change from baseline.",
      "4. Document the exact bladder/bowel/saddle symptoms and their onset.",
      "5. Do not perform repeated spinal movements, aggressive neurodynamic testing or manual therapy to 'see if symptoms improve'.",
      "6. Activate the local urgent/emergency pathway and communicate suspected cauda equina syndrome clearly."
    ],
    decisionLogic: [
      "Bilateral leg symptoms alone do not diagnose cauda equina syndrome, but new bladder/bowel/sexual dysfunction or saddle sensory change with severe back/leg symptoms changes the urgency dramatically.",
      "The physiotherapist does not need to prove cauda equina syndrome before referral. The job is to recognize a sufficiently concerning pattern and escalate.",
      "A patient can still walk and still have an evolving emergency; do not use preserved walking as reassurance."
    ],
    practicalManagement: [
      "No routine physiotherapy treatment should be started in this encounter.",
      "Arrange urgent medical assessment according to local protocol.",
      "Document the time of recognition, symptoms reported, neurological changes and the person/service contacted.",
      "If the patient refuses escalation, explain the potential seriousness, document the discussion and follow local professional policy."
    ],
    exerciseDose: [
      "No exercise prescription is appropriate until emergency pathology has been medically assessed.",
      "Do not give stretching, core exercise, nerve glides or walking advice as a substitute for urgent assessment."
    ],
    reassessment: [
      "The relevant 'reassessment' is confirmation that the patient has entered the emergency pathway.",
      "Future physiotherapy may be appropriate after medical/surgical management, but the later rehabilitation plan depends on neurological outcome."
    ],
    commonMistakes: [
      "Trying one treatment first because the patient also has mechanical back pain.",
      "Asking only about incontinence and missing urinary retention or altered urinary sensation.",
      "Waiting for complete saddle anesthesia before acting.",
      "Delaying referral while completing a long musculoskeletal examination."
    ],
    masterTakeaway: [
      "Master-level reasoning here is not a clever manual technique — it is recognizing that treatment is unsafe until serious compression is excluded.",
      "When red flags cluster, speed and clarity of escalation matter more than collecting every possible physical finding."
    ]
  },

  "stroke-gait-balance-task-specific-rehab": {
    keyQuestions: [
      "What activities matter most to the patient right now: toilet transfer, walking to the kitchen, stairs, community walking or returning to work?",
      "What assistance/device is currently required for transfers and gait?",
      "Is fatigue limiting performance? Ask when in the day function is best.",
      "Ask about falls, neglect, visual problems, dizziness, pain, communication difficulty and confidence.",
      "Clarify pre-stroke mobility and home environment so goals are realistic and meaningful."
    ],
    examinationSequence: [
      "1. Observe sitting alignment, trunk control and the ability to shift weight safely.",
      "2. Assess sit-to-stand: foot placement, forward trunk movement, symmetry, assistance required and control on sitting down.",
      "3. Assess lower-limb strength and selective motor control, not just tone.",
      "4. Assess static and dynamic balance, including turning and reaching.",
      "5. Observe gait: step length, stance control, foot clearance, speed, device use and assistance.",
      "6. Choose objective measures such as 10-Meter Walk Test, Berg/Mini-BESTest, Timed Up and Go or 6-Minute Walk Test according to ability.",
      "7. Identify the single biggest limiter to the patient's functional goal and target that first."
    ],
    decisionLogic: [
      "If the patient cannot repeatedly rise from a chair, isolated ankle exercises alone will not solve the transfer problem; practice the transfer itself.",
      "If gait is slow because of poor push-off, combine task-specific walking with calf/hip strengthening.",
      "If balance loss is mainly during turning, train turning progressively instead of only static standing.",
      "Manual facilitation is useful only when it improves task practice — it should not replace repetitions."
    ],
    practicalManagement: [
      "Use repeated sit-to-stand with only the assistance needed for success.",
      "Practice stepping and overground walking in many repetitions, not only a few perfect steps.",
      "Train turns, obstacle negotiation and reaching as soon as safety allows.",
      "Use external cues, hand placement or tactile guidance briefly, then reduce assistance so the patient learns to control the task.",
      "Coordinate orthotic/device decisions with the rehabilitation team when foot clearance or stability remains limited."
    ],
    exerciseDose: [
      "Sit-to-stand: begin around 2–5 sets of 5–10 repetitions, adjusted for fatigue and movement quality.",
      "Walking practice: accumulate meaningful walking time/steps in repeated bouts; increase total volume before adding excessive complexity.",
      "Strength: 2–3 sets × 6–15 repetitions for key lower-limb groups when medically stable.",
      "Balance: 10–20 minutes of progressively challenging task practice within a safe environment.",
      "Aerobic work: moderate intensity can be added according to medical stability, monitoring symptoms and cardiovascular response."
    ],
    reassessment: [
      "Repeat the same transfer assistance level and measure whether less help is required.",
      "Recheck gait speed and walking distance.",
      "Track whether the patient can turn, reach and negotiate obstacles with less support.",
      "Link every measure back to the patient's stated participation goal."
    ],
    commonMistakes: [
      "Spending most of the session on passive limb movement.",
      "Counting isolated exercise repetitions but not task repetitions.",
      "Providing too much physical assistance and preventing active problem solving.",
      "Treating spasticity as the main problem when weakness, motor control or balance is more limiting."
    ],
    masterTakeaway: [
      "A stroke session should look like practice for real life.",
      "The therapist's hands are there to enable movement, not to become the movement."
    ]
  },

  "copd-post-exacerbation-pulmonary-rehab": {
    keyQuestions: [
      "What activity causes breathlessness first: dressing, walking, stairs or showering?",
      "What was the patient's functional level before the exacerbation?",
      "Ask about chest pain, syncope, palpitations, new edema, fever and current exacerbation symptoms.",
      "Clarify prescribed oxygen use and inhaler/medical plan.",
      "Ask whether fear of breathlessness is causing activity avoidance."
    ],
    examinationSequence: [
      "1. Check resting SpO2, heart rate, respiratory rate and overall clinical stability as appropriate.",
      "2. Measure dyspnea using mMRC or another suitable scale.",
      "3. Assess functional exercise capacity with 6MWT, sit-to-stand or a lower-intensity test depending on stability.",
      "4. Measure lower-limb strength and observe sit-to-stand quality.",
      "5. During exercise, monitor dyspnea, fatigue, SpO2 and recovery rather than focusing on one number alone.",
      "6. Identify whether the main limitation is ventilatory, muscular deconditioning, fear/pacing or another cardiopulmonary problem."
    ],
    decisionLogic: [
      "Breathlessness during exercise is expected in COPD rehabilitation; the goal is not zero dyspnea.",
      "A patient who desaturates, has chest pain, syncope or disproportionate symptoms requires a different response than a patient with expected exertional breathlessness.",
      "If lower-limb fatigue stops walking before breathlessness, resistance training is especially important."
    ],
    practicalManagement: [
      "Begin with interval walking or cycling if continuous exercise is poorly tolerated.",
      "Use pacing and recovery positions rather than stopping all activity.",
      "Add progressive resistance exercise for major upper- and lower-limb muscle groups.",
      "Teach breathing control strategies only if they improve the patient's symptoms or task performance.",
      "Airway-clearance techniques are added only when secretion retention is clinically relevant."
    ],
    exerciseDose: [
      "Aerobic: accumulate about 20–40 minutes per session using continuous or interval work, typically 3–5 days/week depending on program and tolerance.",
      "Resistance: 2–3 sets × 6–15 repetitions for major muscle groups, usually 2–3 days/week.",
      "Sit-to-stand: 2–4 sets × 5–15 repetitions when appropriate.",
      "Start lower in severely deconditioned patients and build duration before intensity."
    ],
    reassessment: [
      "Repeat walk/sit-to-stand performance after the rehabilitation block.",
      "Track dyspnea at the same workload — improvement may appear as less breathlessness or greater work at the same breathlessness.",
      "Measure confidence and participation, not only physiological numbers."
    ],
    commonMistakes: [
      "Teaching only breathing exercises and calling it pulmonary rehabilitation.",
      "Stopping exercise whenever the patient becomes breathless.",
      "Ignoring leg strength and deconditioning.",
      "Using airway-clearance techniques in a patient without secretion-retention indication."
    ],
    masterTakeaway: [
      "Pulmonary rehabilitation is exercise rehabilitation with careful cardiopulmonary monitoring, not a collection of passive chest techniques.",
      "Teach the patient how to be active safely despite breathlessness."
    ]
  },

  "copd-rehab-exertional-desaturation-clinical-reasoning": {
    keyQuestions: [
      "Is the current breathlessness new, clearly worse than usual, or associated with chest pain, syncope, fever or palpitations?",
      "What is the patient's prescribed oxygen plan and usual resting/exercise SpO2?",
      "Did symptoms change after a recent exacerbation, medication change or new illness?",
      "Is the patient using the oxygen/inhaler regimen as prescribed?",
      "What workload causes the desaturation and how quickly does the patient recover?"
    ],
    examinationSequence: [
      "1. Confirm resting clinical stability before exercise.",
      "2. Measure SpO2 and heart rate using reliable technique and check waveform/signal quality if available.",
      "3. Begin at a low workload and observe the trend rather than reacting to a single artifact reading.",
      "4. Monitor symptoms: chest pain, dizziness, severe dyspnea, confusion, cyanosis and abnormal recovery.",
      "5. Stop or modify exercise according to local protocol and medical prescription when concerning desaturation or symptoms occur.",
      "6. Document workload, SpO2 trend, symptoms, oxygen use and recovery time."
    ],
    decisionLogic: [
      "Do not assume every low SpO2 reading is real; check sensor fit and signal, but never dismiss a concerning symptomatic fall.",
      "Do not independently change prescribed oxygen beyond scope/protocol.",
      "A stable patient with expected monitored desaturation may continue in a medically guided rehabilitation plan; a new or disproportionate pattern requires medical review."
    ],
    practicalManagement: [
      "Reduce workload or use interval training when continuous exercise produces excessive physiological stress.",
      "Allow seated recovery and controlled breathing.",
      "Use prescribed supplemental oxygen exactly according to the medical plan.",
      "Coordinate with the medical/pulmonary rehabilitation team when exercise oxygen needs or symptoms change."
    ],
    exerciseDose: [
      "Begin with short intervals such as 1–3 minutes work followed by recovery when continuous exercise is poorly tolerated.",
      "Accumulate total exercise time gradually toward the program target.",
      "Strength training may be useful because it can improve peripheral muscle capacity with lower ventilatory demand than continuous aerobic work."
    ],
    reassessment: [
      "Compare SpO2 and dyspnea at the same workload across sessions.",
      "Track whether the patient tolerates longer work intervals and recovers faster.",
      "Reassess immediately if the symptom pattern changes."
    ],
    commonMistakes: [
      "Continuing exercise through severe symptomatic desaturation.",
      "Changing oxygen flow independently without authorization.",
      "Stopping all rehabilitation because one session showed desaturation.",
      "Ignoring equipment/sensor error."
    ],
    masterTakeaway: [
      "The skill is not memorizing one saturation number; it is integrating the trend, symptoms, workload, prescription and clinical context.",
      "Know when to modify exercise and when the patient needs medical reassessment."
    ]
  }
};
