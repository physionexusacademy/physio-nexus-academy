import type { TreatmentPlan } from "./treatment-plans.ts";
import type { TreatmentPlanGuide } from "./treatment-plan-guides.ts";

/**
 * Conditions & Treatment Guide: second batch (nerve, brain, limb, swelling and pregnancy conditions).
 * Written in our own words from standard guidelines; each plan follows the treating team's instructions first.
 * The clinical lead should check the doses and cited sources before publication.
 */
export const plansB: TreatmentPlan[] = [
  {
    slug: "guillain-barre-syndrome",
    name: "Guillain-Barre Syndrome Rehabilitation",
    category: "Neurology",
    summary: "Rehabilitation follows the acute medical phase and adapts to weakness, fatigue and breathing; it uses careful positioning, graded strengthening that avoids overwork, and gait and function training as nerves recover.",
    assessment: ["Medical stage and breathing status", "Muscle strength, sensation and reflexes", "Fatigue and pain", "Autonomic signs (blood pressure and heart rate changes)", "Function, transfers and walking"],
    redFlags: ["Worsening breathing, breathlessness or a falling vital capacity", "Marked blood pressure or heart rate swings", "Difficulty swallowing or speaking", "Rapidly ascending weakness", "Signs of a clot, pressure sore or infection"],
    outcomeMeasures: ["Medical Research Council sum score", "Hughes functional grade", "Barthel Index", "Timed up and go once able", "Fatigue Severity Scale"],
    modalities: ["Positioning and splints to prevent contracture", "Pressure care", "Tilt table or standing frame as the medical team permits"],
    manualTherapy: ["Gentle passive range to maintain joint movement", "Soft-tissue work for comfort", "Avoid overstretching weak or painful muscles"],
    exercises: ["Active-assisted then active exercise as strength returns", "Low-resistance strengthening with rest between sets", "Balance and gait training", "Respiratory exercises when advised", "Functional task practice"],
    homePlan: ["Energy conservation and pacing", "Short, frequent exercise sessions", "Splint and positioning plan", "Safe mobility and home aids"],
    progression: ["Progress slowly and watch for fatigue and weakness the next day", "Increase resistance only if recovery is complete", "Add endurance and balance as strength allows"],
    escalation: ["Urgent medical care for breathing or swallowing difficulty or autonomic instability", "Review with neurology for slow recovery or relapse"],
  },
  {
    slug: "multiple-sclerosis",
    name: "Multiple Sclerosis",
    category: "Neurology",
    summary: "Physiotherapy supports mobility, balance, strength, fatigue management and activity throughout the disease, with exercise adapted to heat sensitivity and fatigue and coordinated with the neurology team.",
    assessment: ["Symptoms, relapses and fatigue pattern", "Walking, balance and falls", "Spasticity, strength and coordination", "Heat sensitivity", "Bladder, vision and cognitive concerns"],
    redFlags: ["New or sudden neurological symptoms (possible relapse)", "Sudden visual loss or severe vertigo", "Bladder retention or new bladder or bowel control loss", "Fever or infection with worsening weakness", "Marked worsening of spasticity with pain"],
    outcomeMeasures: ["Timed 25-foot walk", "Six-minute walk test", "Berg Balance Scale", "Modified Ashworth Scale", "Modified Fatigue Impact Scale"],
    modalities: ["Cooling strategies for heat sensitivity", "Orthoses for foot drop", "Walking aids and energy-saving devices"],
    manualTherapy: ["Gentle stretching and positioning for spasticity", "Soft-tissue techniques for comfort", "Avoid overstretching or overheating"],
    exercises: ["Aerobic training at moderate effort", "Progressive resistance training", "Balance and gait training", "Stretching for spastic muscles", "Task-specific practice"],
    homePlan: ["Regular activity with pacing and rest breaks", "Exercise in cool conditions", "Daily stretching", "Falls prevention at home"],
    progression: ["Increase duration before intensity", "Add challenge to balance and gait in safe settings", "Adapt the plan after a relapse and return gradually"],
    escalation: ["Urgent medical review for suspected relapse, vision loss or bladder retention", "Neurology review for worsening disability or spasticity"],
  },
  {
    slug: "traumatic-brain-injury",
    name: "Traumatic Brain Injury Rehabilitation",
    category: "Neurology",
    summary: "Rehabilitation addresses movement, balance, fatigue, headache, vision and thinking changes in a staged way, with a safe return to activity and close teamwork with medical, cognitive and occupational therapy services.",
    assessment: ["Injury severity, medical stage and precautions", "Movement, balance and coordination", "Headache, dizziness and vision", "Fatigue, sleep, mood and thinking changes", "Safety awareness and function"],
    redFlags: ["Worsening headache, repeated vomiting or drowsiness", "New confusion, seizure or weakness on one side", "Neck pain after major trauma not yet cleared", "Clear fluid from nose or ear", "Rapid deterioration in alertness"],
    outcomeMeasures: ["Glasgow Coma Scale and Rancho Los Amigos level (from the medical team)", "Berg Balance Scale", "Timed up and go", "Dizziness Handicap Inventory", "Functional Independence Measure or similar"],
    modalities: ["Positioning and splints to prevent contracture", "Orthoses for foot drop or spasticity", "Environmental changes to reduce distraction"],
    manualTherapy: ["Gentle stretching and positioning", "Soft-tissue work for neck and shoulder tension", "Avoid forceful techniques in the early stage"],
    exercises: ["Early mobilisation as cleared", "Balance and gait training", "Graded aerobic exercise with symptom monitoring", "Strength training", "Task-specific and dual-task practice"],
    homePlan: ["Structured daily routine and pacing", "Graded activity with symptom checks", "Falls prevention", "Support for the family and carers"],
    progression: ["Increase activity in small steps if symptoms stay stable", "Add dual-task challenge when single tasks are safe", "Graded return to school, work and sport"],
    escalation: ["Urgent care for red-flag symptoms", "Referral to neuropsychology, occupational therapy and medical review as needed"],
  },
  {
    slug: "bells-palsy",
    name: "Bell's Palsy",
    category: "Neurology",
    summary: "Most people recover, and physiotherapy supports gentle facial exercise, eye care, education and protection against synkinesis; medical review is needed to confirm the diagnosis and rule out other causes.",
    assessment: ["Onset and facial weakness pattern (forehead involved or spared)", "Eye closure and corneal protection", "Facial symmetry at rest and in movement", "Taste, hearing and ear symptoms", "Emotional impact"],
    redFlags: ["Forehead spared (suggests a central cause such as stroke)", "Limb weakness, speech or swallowing difficulty or severe headache", "Rash with ear pain (possible Ramsay Hunt syndrome)", "Inability to close the eye with pain or redness", "No improvement after several months"],
    outcomeMeasures: ["House-Brackmann grade", "Sunnybrook Facial Grading System", "Facial Disability Index", "Eye closure measurement"],
    modalities: ["Eye protection with drops, ointment and taping at night as advised", "Warm compress for comfort", "Avoid electrical stimulation in the early stage unless advised by the specialist"],
    manualTherapy: ["Gentle facial massage for comfort", "Avoid forceful stretching of the face"],
    exercises: ["Slow, small, symmetrical facial movements in front of a mirror", "Eye closure and blinking practice", "Relaxation of overactive muscles", "Avoid forceful or repetitive exercise"],
    homePlan: ["Eye care routine", "Short mirror exercise sessions", "Facial massage", "Sun and wind protection for the eye"],
    progression: ["Progress from small to larger movements as control returns", "Add expression and speech tasks", "Avoid overuse if synkinesis appears"],
    escalation: ["Urgent medical review for suspected stroke or Ramsay Hunt syndrome", "Specialist review for eye problems or poor recovery"],
  },
  {
    slug: "diabetic-peripheral-neuropathy",
    name: "Diabetic Peripheral Neuropathy",
    category: "Neurology & Diabetes",
    summary: "Physiotherapy improves balance, strength, walking and foot protection and supports pain management; patients must learn foot checks and safe exercise because sensation loss can hide injuries.",
    assessment: ["Symptoms (burning, numbness, pain)", "Foot sensation with monofilament and vibration", "Balance and falls history", "Foot skin, deformity and footwear", "Strength, walking and exercise tolerance"],
    redFlags: ["Open ulcer, infection or a hot swollen foot (possible Charcot foot)", "Blackened or very pale, cold toes", "Sudden severe pain or new weakness", "Dizziness on standing or fainting", "Blood sugar problems during exercise"],
    outcomeMeasures: ["Monofilament and vibration testing", "Berg Balance Scale or single-leg stand", "Timed up and go", "Neuropathy pain scales", "Six-minute walk test"],
    modalities: ["Protective footwear and insoles", "TENS may help neuropathic pain in selected patients", "Avoid heat packs and hot water on insensate skin"],
    manualTherapy: ["Gentle soft-tissue work on the calves and feet if the skin is intact", "Mobilise stiff ankles and toes gently"],
    exercises: ["Balance and proprioceptive training", "Lower-limb strengthening", "Low-impact aerobic training", "Walking programme with foot checks", "Flexibility for the calf and ankle"],
    homePlan: ["Daily foot inspection", "Well-fitting shoes and socks", "Regular walking and strength exercises", "Blood sugar monitoring around exercise"],
    progression: ["Increase walking and strength gradually while checking the skin", "Progress balance difficulty near support", "Review footwear and foot health each visit"],
    escalation: ["Urgent medical review for ulcers, infection or a hot swollen foot", "Podiatry and diabetes team review for deformity or recurring problems"],
  },
  {
    slug: "lymphoedema",
    name: "Lymphoedema",
    category: "Oncology & Vascular",
    summary: "Management combines skin care, compression, exercise, specialised massage and self-care taught by trained therapists, with careful screening to exclude clots, infection and recurrent disease.",
    assessment: ["Swelling pattern, measurements and skin changes", "History of cancer treatment, surgery or infection", "Skin condition and signs of infection", "Function, range of movement and pain", "Compression and self-care ability"],
    redFlags: ["Hot, red, painful limb with fever (cellulitis)", "Sudden swelling with pain (possible clot)", "New unexplained swelling in someone with cancer", "Chest pain or breathlessness", "Heart failure or kidney disease as the cause"],
    outcomeMeasures: ["Limb circumference or volume", "Skin condition", "Arm or leg function questionnaire", "Quality of life scale"],
    modalities: ["Compression garments or bandaging by a trained therapist", "Skin care and moisturising", "Intermittent pneumatic compression only when advised by the specialist team"],
    manualTherapy: ["Manual lymphatic drainage by a trained therapist when indicated", "Gentle soft-tissue techniques", "Avoid deep or heavy massage"],
    exercises: ["Gentle, regular movement and deep breathing", "Range and strengthening exercise in compression", "Aerobic activity", "Elevation with movement"],
    homePlan: ["Daily skin check and care", "Wearing compression as taught", "Regular gentle exercise", "Avoid cuts, burns, injections and tight clothing on the affected limb where advised"],
    progression: ["Increase exercise slowly while watching swelling", "Adjust compression as swelling changes", "Review regularly with the lymphoedema service"],
    escalation: ["Urgent care for infection or suspected clot", "Referral for new or rapidly increasing swelling"],
  },
  {
    slug: "lower-limb-amputation-rehabilitation",
    name: "Lower-Limb Amputation Rehabilitation",
    category: "Orthopaedic & Vascular",
    summary: "Rehabilitation covers wound and limb care, positioning to prevent contracture, strengthening, balance, transfers, walking with or without a prosthesis and a return to function, with attention to the other leg and to general health.",
    assessment: ["Level of amputation and cause (vascular, diabetes, trauma)", "Wound healing and residual limb shape", "Range of movement and contracture risk", "Strength, balance and transfers", "Skin and the opposite foot"],
    redFlags: ["Wound infection, spreading redness or discharge", "Hot, swollen calf (possible clot)", "Chest pain or breathlessness", "Skin breakdown on the residual or opposite limb", "Severe uncontrolled phantom or stump pain"],
    outcomeMeasures: ["Timed up and go", "Amputee Mobility Predictor", "Two-minute or six-minute walk test", "Locomotor Capabilities Index", "Pain scales for phantom and residual limb pain"],
    modalities: ["Residual limb shrinkers or bandaging", "Positioning to keep the hip and knee straight", "Mirror therapy for phantom pain when appropriate", "Prosthetic fitting by the prosthetist"],
    manualTherapy: ["Gentle soft-tissue and scar mobilisation once healed", "Desensitisation of the residual limb", "Avoid pressure on healing wounds"],
    exercises: ["Hip and knee range and strengthening", "Trunk and core control", "Balance and weight-shift training", "Gait training with the prosthesis or aids", "Aerobic conditioning"],
    homePlan: ["Daily range and strengthening", "Positioning, skin checks and limb care", "Walking practice as taught", "Foot and skin care for the other leg"],
    progression: ["Progress from parallel bars to walking aids to independent walking", "Increase prosthetic wearing time gradually", "Add stairs, slopes and outdoor mobility"],
    escalation: ["Urgent medical review for infection, clot or non-healing wounds", "Prosthetist review for fit problems or skin breakdown"],
  },
  {
    slug: "pregnancy-related-pelvic-girdle-pain",
    name: "Pregnancy-Related Pelvic Girdle Pain",
    category: "Women's Health",
    summary: "Pain around the sacroiliac joints and pubic symphysis in pregnancy responds to education, positions, pelvic support, activity modification and gentle exercise, and most women improve after birth.",
    assessment: ["Pain location and aggravating activities", "Posterior pelvic pain provocation (thigh thrust) test", "Active straight leg raise", "Lumbar and neurological screen", "Impact on sleep, walking and work"],
    redFlags: ["Vaginal bleeding, fluid leakage or reduced baby movements", "Severe headache, visual change or swelling (possible pre-eclampsia)", "Fever, burning urine or a hot swollen calf", "Saddle numbness or loss of bladder or bowel control", "Severe pain after a fall"],
    outcomeMeasures: ["Pelvic Girdle Questionnaire", "NPRS", "Active straight leg raise score", "Walking tolerance", "Sleep quality"],
    modalities: ["Pelvic support belt worn low over the hips", "Heat for muscle comfort if tolerated", "Sleep positioning with pillows", "Avoid TENS over the abdomen or lower back in pregnancy"],
    manualTherapy: ["Gentle soft-tissue work for the buttock and back", "Avoid strong mobilisation of the pelvic joints", "Positioning for comfort"],
    exercises: ["Pelvic floor and deep abdominal training", "Gluteal and hip strengthening", "Gentle walking in short spells", "Water exercise if available", "Avoid wide-leg and single-leg loading"],
    homePlan: ["Move in even, balanced ways", "Pelvic belt and sleep positions", "Short walks with rests", "Know the signs that need the midwife"],
    progression: ["Increase walking and strength gradually as comfort allows", "Review every two to three weeks", "Plan postnatal return to exercise gradually"],
    escalation: ["Urgent care for obstetric red flags", "Review by the obstetric team for severe or worsening pain"],
  },
];

export const guidesB: Record<string, TreatmentPlanGuide> = {
  "guillain-barre-syndrome": {
    clinicalLogic: [
      "Rehabilitation follows medical stability and adapts to rapid changes in strength and breathing, so monitoring is constant.",
      "Overwork can cause fatigue and weakness the next day, so exercise should be gentle, frequent and well paced.",
      "Prevent secondary problems: contracture, pressure injury, clot and pain, then rebuild strength and function as nerves recover.",
    ],
    firstSession: [
      "Check medical stability, breathing and autonomic signs before starting.",
      "Assess strength, sensation, pain and positioning.",
      "Set up positioning, passive range and a short, gentle programme.",
    ],
    exerciseDose: [
      "Passive or active-assisted range: 5 to 10 repetitions several times a day.",
      "Active strengthening: low resistance, 5 to 10 repetitions with rests, 3 to 5 days a week.",
      "Standing and gait practice: short bouts with support, increasing slowly.",
      "Endurance training: low intensity, short sessions with breaks.",
    ],
    manualApplication: [
      "Gentle passive range and positioning to maintain joint movement.",
      "Avoid overstretching or aggressive manual work.",
    ],
    modalityDose: [
      "Splints and positioning programme as set by the team.",
      "Pressure care and tilt table work as the medical team permits.",
    ],
    progressionRules: [
      "Progress slowly and check for next-day fatigue.",
      "Increase resistance only when recovery between sessions is complete.",
      "Move from supported standing to walking aids to independent walking as strength returns.",
    ],
    commonMistakes: [
      "Pushing to fatigue and causing a setback.",
      "Missing breathing or autonomic changes.",
      "Overstretching weak or painful muscles.",
      "Neglecting pain, positioning and pressure care.",
    ],
    patientEducation: [
      "Explain that recovery is often slow and that rest and pacing are part of the plan.",
      "Teach energy conservation and early signs of overwork.",
      "Support the family and set achievable goals.",
    ],
  },
  "multiple-sclerosis": {
    clinicalLogic: [
      "Exercise is safe and beneficial in MS, but heat and fatigue can worsen symptoms temporarily, so the programme is paced and cool.",
      "Treat the most limiting problems: walking, balance, spasticity and fatigue.",
      "Adapt during and after relapses and coordinate with the neurology team.",
    ],
    firstSession: [
      "Record symptoms, fatigue pattern, falls, walking and balance.",
      "Screen for relapse symptoms and heat sensitivity.",
      "Teach pacing and start gentle, achievable exercise.",
    ],
    exerciseDose: [
      "Aerobic training: 10 to 30 minutes at moderate effort, 2 to 3 days a week, in cool conditions.",
      "Resistance training: 2 to 3 sets of 8 to 12 repetitions, 2 days a week.",
      "Balance and gait training: 10 to 20 minutes, 3 or more days a week.",
      "Stretching for spasticity: daily, holding 30 seconds.",
    ],
    manualApplication: [
      "Gentle stretching and positioning for tight muscles.",
      "Avoid vigorous stretching and heat that worsens symptoms.",
    ],
    modalityDose: [
      "Cooling vests or cool drinks for heat sensitivity.",
      "Orthoses for foot drop and aids to save energy.",
    ],
    progressionRules: [
      "Increase duration before intensity and rest well between sessions.",
      "Progress balance difficulty safely near support.",
      "Reduce and rebuild after a relapse.",
    ],
    commonMistakes: [
      "Advising rest to avoid fatigue instead of graded activity.",
      "Overheating the patient during exercise.",
      "Missing signs of a relapse.",
      "Neglecting falls prevention.",
    ],
    patientEducation: [
      "Explain that exercise does not cause relapses and that planned rest is useful.",
      "Teach pacing, cooling and fatigue management.",
      "Support the patient to stay active with realistic goals.",
    ],
  },
  "traumatic-brain-injury": {
    clinicalLogic: [
      "Rehabilitation starts when the patient is medically stable and uses a staged approach guided by symptoms and cognition.",
      "Problems are often multiple: movement, balance, vision, fatigue and thinking, so the plan is shared with the team.",
      "Fatigue, headache and safety awareness shape how much and how fast to progress.",
    ],
    firstSession: [
      "Review the medical stage, precautions and cognitive level.",
      "Assess movement, balance, vision and symptoms.",
      "Set short, simple tasks and agree on a routine with carers.",
    ],
    exerciseDose: [
      "Early mobilisation: short, frequent bouts as cleared.",
      "Balance and gait training: 10 to 20 minutes, most days.",
      "Aerobic exercise: start light (for example 10 to 15 minutes) and increase if symptoms stay stable.",
      "Strength training: 2 to 3 sets of 8 to 12 repetitions, 2 to 3 days a week.",
    ],
    manualApplication: [
      "Gentle stretching and positioning.",
      "Soft-tissue work for neck and shoulder tension when appropriate.",
    ],
    modalityDose: [
      "Orthoses and positioning for tone or foot drop.",
      "Quiet, low-stimulation settings for people sensitive to noise and light.",
    ],
    progressionRules: [
      "Progress in small steps if headache, dizziness and fatigue stay stable.",
      "Add dual-task and community practice when single tasks are safe.",
      "Stage the return to school, work and sport.",
    ],
    commonMistakes: [
      "Pushing too hard and triggering symptoms.",
      "Missing red-flag signs such as worsening headache or drowsiness.",
      "Ignoring vision, balance or cognitive problems.",
      "Not involving the family.",
    ],
    patientEducation: [
      "Explain that recovery varies and that pacing helps.",
      "Teach the warning signs and when to seek urgent help.",
      "Give the family simple strategies and set clear, small goals.",
    ],
  },
  "bells-palsy": {
    clinicalLogic: [
      "Bell's palsy affects one side of the face including the forehead; if the forehead is spared, think of a central cause and refer urgently.",
      "Eye protection is the most important early task, because the eye may not close.",
      "Gentle, small, symmetrical exercise supports recovery, while forceful exercise can encourage synkinesis.",
    ],
    firstSession: [
      "Confirm that a doctor has examined the patient and excluded other causes.",
      "Assess facial symmetry, eye closure and function, and teach eye care.",
      "Teach gentle mirror exercises and massage.",
    ],
    exerciseDose: [
      "Facial movements: 5 to 10 small, slow repetitions of each movement, 2 to 3 times a day.",
      "Eye closure and blinking: several times through the day.",
      "Facial massage: 5 minutes, 2 times a day.",
      "Relaxation of overactive muscles: as needed.",
    ],
    manualApplication: [
      "Gentle massage in the direction of the muscle fibres.",
      "Avoid forceful stretching of the face.",
    ],
    modalityDose: [
      "Eye drops by day and ointment or taping at night as advised.",
      "Warm compress for 10 minutes for comfort.",
    ],
    progressionRules: [
      "Progress from small to larger movements as control returns.",
      "Avoid overuse if synkinesis appears and seek specialist advice.",
      "Review at regular intervals and refer if no improvement.",
    ],
    commonMistakes: [
      "Missing a central cause such as a stroke.",
      "Neglecting eye protection.",
      "Encouraging strong, forced facial exercise.",
      "Using electrical stimulation without specialist advice.",
    ],
    patientEducation: [
      "Explain that most people recover well within weeks to months.",
      "Teach eye care and when to seek urgent help.",
      "Reassure and address the emotional impact.",
    ],
  },
  "diabetic-peripheral-neuropathy": {
    clinicalLogic: [
      "Loss of sensation allows injuries to go unnoticed, so foot protection and daily checks are as important as exercise.",
      "Balance and strength training reduce falls and improve walking, and aerobic exercise improves diabetes control.",
      "Exercise must be adjusted for blood sugar, footwear and skin condition.",
    ],
    firstSession: [
      "Check feet, sensation and footwear, and ask about ulcers and blood sugar.",
      "Test balance and strength.",
      "Teach daily foot inspection and start gentle, safe exercise.",
    ],
    exerciseDose: [
      "Balance training: 10 to 15 minutes, 3 or more times a week near support.",
      "Strength training: 2 to 3 sets of 8 to 12 repetitions, 2 to 3 days a week.",
      "Aerobic exercise: 150 minutes a week at moderate effort if well tolerated, in suitable footwear.",
      "Calf and ankle stretches: daily.",
    ],
    manualApplication: [
      "Gentle soft-tissue work if the skin is intact.",
      "Avoid manual work over wounds or fragile skin.",
    ],
    modalityDose: [
      "Avoid hot packs and hot water on insensate skin.",
      "Protective footwear and insoles prescribed by the team.",
    ],
    progressionRules: [
      "Increase activity slowly while checking the feet after each session.",
      "Progress balance difficulty safely.",
      "Review footwear and foot health at every visit.",
    ],
    commonMistakes: [
      "Using heat on numb skin.",
      "Ignoring foot checks and footwear.",
      "Missing a hot swollen foot or a wound.",
      "Neglecting balance and falls risk.",
    ],
    patientEducation: [
      "Teach daily foot checks, good footwear and never walking barefoot.",
      "Explain that exercise helps diabetes and nerve health.",
      "Teach when to seek urgent help for a wound or swelling.",
    ],
  },
  "lymphoedema": {
    clinicalLogic: [
      "Lymphoedema is chronic and needs lifelong self-care; early treatment prevents progression and infection.",
      "Exclude other causes of swelling first, such as clot, infection, heart or kidney disease and cancer recurrence.",
      "Compression, skin care, exercise and trained manual drainage work best together.",
    ],
    firstSession: [
      "Measure the limb, check the skin and exclude red-flag causes of swelling.",
      "Teach skin care, compression and gentle exercise.",
      "Arrange specialist support and review.",
    ],
    exerciseDose: [
      "Gentle movement and breathing: several times a day.",
      "Aerobic exercise: 20 to 30 minutes, 3 to 5 days a week in compression as advised.",
      "Resistance exercise: 2 to 3 sets of 8 to 12 repetitions, starting light and progressing slowly.",
      "Range exercises for the affected limb: daily.",
    ],
    manualApplication: [
      "Manual lymphatic drainage by a trained therapist when indicated.",
      "Avoid deep or heavy massage.",
    ],
    modalityDose: [
      "Compression garments or bandages applied by a trained therapist.",
      "Skin care and moisturising daily.",
    ],
    progressionRules: [
      "Increase exercise gradually and watch for swelling changes.",
      "Adjust compression with limb size.",
      "Review regularly with the lymphoedema service.",
    ],
    commonMistakes: [
      "Treating swelling without excluding a clot or infection.",
      "Advising complete avoidance of exercise.",
      "Using deep tissue massage.",
      "Applying compression without proper assessment.",
    ],
    patientEducation: [
      "Teach skin care, infection signs and compression use.",
      "Explain that gentle exercise is safe and helpful.",
      "Give a clear plan for what to do if the limb becomes hot, red or painful.",
    ],
  },
  "lower-limb-amputation-rehabilitation": {
    clinicalLogic: [
      "Early positioning and range prevent contracture, which makes prosthetic walking harder.",
      "Strength, balance and cardiovascular fitness determine function, and the other leg and general health must be protected.",
      "Rehabilitation is shared with the surgeon, prosthetist and the rest of the team.",
    ],
    firstSession: [
      "Check wound, skin and limb shape and the cause of amputation.",
      "Teach positioning and range exercises, and start bed mobility and transfers.",
      "Plan strengthening and balance work and discuss goals.",
    ],
    exerciseDose: [
      "Hip and knee range: 10 repetitions several times a day.",
      "Strength: 2 to 3 sets of 8 to 12 repetitions for the hips, knee, trunk and arms, 3 to 5 days a week.",
      "Balance and weight-shift training: 10 to 20 minutes daily.",
      "Gait training: short, frequent sessions, increasing as tolerated.",
    ],
    manualApplication: [
      "Gentle scar and soft-tissue mobilisation once healed.",
      "Desensitisation of the residual limb.",
    ],
    modalityDose: [
      "Shrinkers or bandaging as prescribed, and limb positioning.",
      "Mirror therapy for phantom pain, 10 to 15 minutes daily if helpful.",
    ],
    progressionRules: [
      "Progress prosthetic wearing time and walking distance gradually.",
      "Add stairs, slopes and outdoor walking in steps.",
      "Check the skin after every session.",
    ],
    commonMistakes: [
      "Allowing the hip or knee to stay bent and contract.",
      "Ignoring the other foot and skin.",
      "Starting prosthetic walking before the limb is ready.",
      "Not treating pain and mood.",
    ],
    patientEducation: [
      "Teach skin care, positioning and daily checks.",
      "Explain what to expect from prosthetic training.",
      "Support the patient to set goals and to join peer support.",
    ],
  },
  "pregnancy-related-pelvic-girdle-pain": {
    clinicalLogic: [
      "Separate pelvic girdle pain from lumbar pain and from obstetric problems before treating.",
      "Share load evenly, avoid provocative positions and keep gently active.",
      "Support, education and reassurance matter as much as exercise.",
    ],
    firstSession: [
      "Screen for obstetric red flags and take a clear history.",
      "Perform the thigh thrust and active straight leg raise tests, and a lumbar and neurological screen.",
      "Teach positions for turning, stairs and sleeping, and fit a pelvic belt if appropriate.",
    ],
    exerciseDose: [
      "Pelvic floor and deep abdominal exercise: 5 to 10 repetitions with short holds, several times a day.",
      "Gluteal strengthening: 2 sets of 10 repetitions, 3 days a week.",
      "Walking: short spells, 10 to 20 minutes, with rests.",
      "Avoid wide-leg and single-leg loading.",
    ],
    manualApplication: [
      "Gentle soft-tissue work for the buttock and back.",
      "Avoid strong mobilisation of the pelvic joints.",
    ],
    modalityDose: [
      "Pelvic belt worn low over the hips for walking and standing.",
      "Heat for 10 to 15 minutes if comfortable; avoid TENS over the abdomen or lower back.",
    ],
    progressionRules: [
      "Increase walking and strength gradually as comfort allows.",
      "Review every two to three weeks.",
      "Plan a gradual return to exercise after birth.",
    ],
    commonMistakes: [
      "Telling a woman that pain is normal and to wait.",
      "Missing obstetric red flags.",
      "Using strong manipulation or deep squats.",
      "Neglecting sleep and fear of movement.",
    ],
    patientEducation: [
      "Explain that most pain improves after birth and that gentle activity is safe.",
      "Teach positions and pelvic belt use.",
      "Give clear signs for contacting the midwife or doctor.",
    ],
  },
};
