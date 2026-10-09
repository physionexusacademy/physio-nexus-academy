import type { Template } from "./clinical-arena-multispecialty-core";
export const cardiopulmTemplates:Template[]=[
 {
  "key": "cardio-copd",
  "title": "Stable COPD activity limitation",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "older",
  "chief": "I get out of breath when walking farther than usual.",
  "history": "A medically stable patient with a long history of smoking-related obstructive breathing symptoms has exertional breathlessness and limited activity tolerance, without signs of a new flare.",
  "findings": [
   "Reduced functional walk distance and increased exertional dyspnea",
   "Breathing pattern and peripheral muscle endurance contribute to limitation"
  ],
  "exam": [
   "Assess resting status, exertional symptoms, pulse oximetry and standardized functional capacity with appropriate supervision.",
   "Use forced maximal repeated sprints as first assessment.",
   "Use only passive chest expansion measurement.",
   "Assess ankle reflexes as primary explanation of breathlessness."
  ],
  "examWhy": "Stable pulmonary rehabilitation needs appropriate risk screening and functional exercise measures.",
  "alternatives": [
   "Cardiac heart-failure decompensation",
   "Anemia-related dyspnea",
   "Pulmonary embolism"
  ],
  "management": [
   "Provide individualized supervised aerobic/strength conditioning and breathlessness strategies, with exacerbation education.",
   "Start an unsupervised maximal exertion program without monitoring.",
   "Treat dyspnea solely with passive massage."
  ],
  "why": "Evidence-informed pulmonary rehabilitation improves activity tolerance and self-management in stable COPD.",
  "safety": false
 },
 {
  "key": "cardio-asthma",
  "title": "Exercise-associated asthma symptom management",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "adult",
  "chief": "My chest feels tight and I cough during harder exercise.",
  "history": "Exertion-related wheeze and variable chest tightness occur with triggers; there is a medical inhaler action plan and no severe symptoms at rest today.",
  "findings": [
   "Symptoms fluctuate with exertion and triggers",
   "Exercise confidence and participation have reduced"
  ],
  "exam": [
   "Review asthma control, inhaler/action-plan use with medical team, and graded exercise symptoms including possible exercise-induced bronchoconstriction.",
   "Use maximal exercise without reliever access or safety planning.",
   "Assume all breathlessness is poor fitness.",
   "Use only trunk flexion range to evaluate breathing."
  ],
  "examWhy": "Poor asthma control and exertional bronchoconstriction require coordinated assessment before exercise progression.",
  "alternatives": [
   "Inducible laryngeal obstruction",
   "Deconditioning",
   "Cardiac arrhythmia"
  ],
  "management": [
   "Coordinate with asthma care and use safe, symptom-guided conditioning with warm-up and action-plan awareness.",
   "Ignore worsening wheeze and continue exertion.",
   "Replace prescribed asthma medicine with breathing exercises alone."
  ],
  "why": "Asthma rehabilitation complements rather than replaces guideline-directed medical care.",
  "safety": false
 },
 {
  "key": "cardio-bronchiectasis",
  "title": "Bronchiectasis secretion-clearance rehabilitation",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "older",
  "chief": "I bring up mucus most days, and physical activity tires me.",
  "history": "A patient with longstanding daily productive cough has difficulty clearing mucus and reduced activity tolerance; no new blood-streaked sputum is reported.",
  "findings": [
   "Ongoing sputum burden and reduced airway clearance confidence",
   "Decreased functional exercise tolerance"
  ],
  "exam": [
   "Assess sputum burden, exacerbation warning signs, breathlessness and ability to use airway-clearance techniques.",
   "Prescribe head-down drainage for every patient regardless of reflux or tolerance.",
   "Only assess shoulder range.",
   "Start intense exercise without checking infection symptoms."
  ],
  "examWhy": "Airway-clearance needs vary with symptoms, tolerances and comorbidities.",
  "alternatives": [
   "COPD without bronchiectasis",
   "Heart failure",
   "Upper-airway cough syndrome"
  ],
  "management": [
   "Teach individualized active cycle breathing/airway clearance and monitored conditioning alongside respiratory team.",
   "Stop all exercise indefinitely due to sputum.",
   "Use prolonged breath-holding without assessing tolerance."
  ],
  "why": "Airway-clearance education and fitness are individualized to clinical stability.",
  "safety": false
 },
 {
  "key": "cardio-pneumonia",
  "title": "Post-pneumonia functional deconditioning",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "older",
  "chief": "I feel weak and tired after my recent chest infection.",
  "history": "After a medically treated chest infection, the patient is improving but has reduced walking and transfer endurance.",
  "findings": [
   "Decreased walking distance with activity-related exertion",
   "No resting instability; recovery and oxygen response need monitoring"
  ],
  "exam": [
   "Check clinical stability, exertional oxygen response, breathlessness and functional transfer/walk tolerance.",
   "Begin maximal-intensity interval training on the first visit.",
   "Focus on cervical range of motion only.",
   "Ignore persistent fever or deterioration because infection was treated."
  ],
  "examWhy": "Post-illness mobilization follows physiological stability and symptom response.",
  "alternatives": [
   "Undiagnosed heart failure",
   "Post-viral fatigue without pneumonia",
   "Pulmonary embolism"
  ],
  "management": [
   "Begin graduated mobility and strengthening with fatigue and physiological monitoring and follow-up for deterioration.",
   "Prescribe bed rest for weeks despite stable status.",
   "Use aggressive manual chest percussion in all cases."
  ],
  "why": "Progressive mobilization supports recovery once instability is excluded.",
  "safety": false
 },
 {
  "key": "cardio-longcovid",
  "title": "Post-viral exertional symptom intolerance",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "adult",
  "chief": "Doing too much today can leave me exhausted tomorrow.",
  "history": "After a viral illness the patient reports fatigue, cognitive fog and worsening symptoms after physical or mental exertion.",
  "findings": [
   "Post-exertional symptom exacerbation reported",
   "Orthostatic intolerance may require screening"
  ],
  "exam": [
   "Identify post-exertional malaise, orthostatic symptoms and activity threshold before recommending exercise.",
   "Prescribe fixed weekly increases in exercise regardless of symptom crashes.",
   "Use one maximal exertion test without risk assessment.",
   "Treat fatigue as lack of motivation."
  ],
  "examWhy": "Post-exertional malaise changes exercise advice; screening must distinguish it from simple deconditioning.",
  "alternatives": [
   "Simple deconditioning without post-exertional relapse",
   "Anemia or thyroid disease",
   "Cardiopulmonary pathology"
  ],
  "management": [
   "Use pacing and energy-envelope support; coordinate medical evaluation for orthostatic or cardiopulmonary contributors.",
   "Enforce graded exercise that repeatedly triggers prolonged symptom worsening.",
   "Dismiss symptoms when routine test results are normal."
  ],
  "why": "Respect delayed symptom exacerbation and avoid pushing through post-exertional malaise.",
  "safety": false
 },
 {
  "key": "cardio-hf",
  "title": "Stable heart failure rehabilitation",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "older",
  "chief": "I tire more quickly walking than I used to, but my medicines are steady.",
  "history": "A patient under long-term cardiology care reports exertional fatigue but stable weight, no new peripheral edema and no worsening resting breathlessness.",
  "findings": [
   "Reduced exercise capacity in a medically stable phase",
   "Blood pressure, heart rate and perceived exertion require monitoring"
  ],
  "exam": [
   "Check recent clinical stability, exertional symptoms, blood pressure/heart-rate response and appropriate functional capacity.",
   "Perform unmonitored maximal exertion despite uncertainty about clinical stability.",
   "Assess only shoulder joint range.",
   "Ignore weight gain or new breathlessness before exercise."
  ],
  "examWhy": "Cardiac rehabilitation exercise requires monitoring and screening for decompensation.",
  "alternatives": [
   "COPD-related exertional limitation",
   "Anemia",
   "Ischemic heart disease"
  ],
  "management": [
   "Provide medically coordinated, monitored progressive aerobic and resistance activity after stabilization.",
   "Exercise through new orthopnea and rapid weight gain.",
   "Rely on strenuous unsupervised interval training before assessment."
  ],
  "why": "Stable heart failure rehabilitation can improve function with appropriate medical oversight.",
  "safety": false
 },
 {
  "key": "cardio-postmi",
  "title": "Post-myocardial infarction cardiac rehabilitation",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "adult",
  "chief": "I want to exercise again, but I am nervous after the heart attack.",
  "history": "After treatment for a recent cardiac event, a medically cleared patient is referred for monitored functional reconditioning.",
  "findings": [
   "Reduced confidence and aerobic activity after hospitalization",
   "Symptoms and medication effects influence exertional response"
  ],
  "exam": [
   "Review clearance, cardiac symptoms, medications, exertion response and graded functional activity.",
   "Use all-out exertion immediately to find maximum fitness.",
   "Assess only inspiratory chest wall mobility.",
   "Focus solely on handgrip strength."
  ],
  "examWhy": "Cardiac rehabilitation integrates risk review, monitored capacity, education and secondary prevention.",
  "alternatives": [
   "Stable angina without infarction",
   "Post-viral deconditioning",
   "Pulmonary limitation"
  ],
  "management": [
   "Use guideline-based monitored rehabilitation, education, risk-factor management and gradual conditioning.",
   "Ignore recurrent chest discomfort during exercise.",
   "Replace secondary prevention medicines with exercise alone."
  ],
  "why": "Individualized cardiac rehabilitation supports recovery and risk reduction.",
  "safety": false
 },
 {
  "key": "cardio-cabg",
  "title": "Early mobilization after coronary bypass surgery",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "older",
  "chief": "Getting out of bed and walking the corridor takes more effort after surgery.",
  "history": "After major heart surgery involving a chest incision, the team reports physiological stability and approves assisted early mobilization.",
  "findings": [
   "Postoperative fatigue and reduced transfer tolerance",
   "Incision and sternal healing considerations require team-approved movement precautions"
  ],
  "exam": [
   "Check hemodynamic stability, symptoms, lines, wound status and safe transfers before progressive ambulation.",
   "Apply strong resisted upper-limb loading without reviewing surgical precautions.",
   "Only measure ankle range.",
   "Use forced breath-holding during transfers."
  ],
  "examWhy": "Mobilization in early recovery requires surveillance of physiologic and surgical limitations.",
  "alternatives": [
   "Postoperative pulmonary complication",
   "Heart failure decompensation",
   "Simple deconditioning"
  ],
  "management": [
   "Coordinate progressive bedside-to-corridor mobility and supported breathing practice with the team.",
   "Exercise through unexplained chest pain or unstable vital signs.",
   "Use rigid universal sternal restrictions without individual surgical guidance."
  ],
  "why": "Safe graded mobilization begins after appropriate team clearance.",
  "safety": false
 },
 {
  "key": "cardio-valve",
  "title": "Post-valve surgery functional recovery",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "older",
  "chief": "I am recovering from valve surgery and want to get my stamina back.",
  "history": "After medically managed surgery for a structural heart condition, fatigue limits daily tasks during a stable recovery period.",
  "findings": [
   "Reduced aerobic capacity after surgery",
   "Medication and rhythm monitoring considerations affect progression"
  ],
  "exam": [
   "Review postoperative clearance, symptoms, anticoagulation-related precautions when relevant and graded exercise tolerance.",
   "Start strenuous unrestricted lifting without team clearance.",
   "Focus only on passive neck mobility.",
   "Prescribe exercise without checking arrhythmia symptoms."
  ],
  "examWhy": "Post-valve recovery requires individualized activity assessment and attention to medication or rhythm considerations.",
  "alternatives": [
   "Post-CABG rehabilitation",
   "Heart failure",
   "Pulmonary disease-related deconditioning"
  ],
  "management": [
   "Use staged supervised cardiac rehabilitation with education and medication-aware monitoring.",
   "Disregard new palpitations, faintness or unexplained chest symptoms.",
   "Treat anticoagulated patients as having no relevant safety considerations."
  ],
  "why": "Coordinate rehabilitation with surgical and cardiology teams.",
  "safety": false
 },
 {
  "key": "cardio-ild",
  "title": "Interstitial lung disease exertional limitation",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "older",
  "chief": "I get breathless quickly and need more rest during walking.",
  "history": "A patient with chronic progressive restriction of pulmonary gas exchange reports reduced exertional tolerance and is under respiratory specialist follow-up.",
  "findings": [
   "Exertional oxygen desaturation tendency",
   "Functional activity limited by breathlessness and fatigue"
  ],
  "exam": [
   "Monitor oxygen saturation and symptoms through appropriate submaximal exertion; review prescribed oxygen and safety guidance.",
   "Use high-intensity unmonitored exertion in a patient with possible significant desaturation.",
   "Assess only lumbar mobility.",
   "Focus only on palpation of accessory breathing muscles."
  ],
  "examWhy": "Desaturation and gas-exchange limitation demand monitored, individualized exercise planning.",
  "alternatives": [
   "COPD",
   "Heart failure",
   "Pulmonary vascular disease"
  ],
  "management": [
   "Use medically coordinated pulmonary rehabilitation with monitored oxygen needs, pacing and graded strengthening.",
   "Withhold all activity solely because chronic breathlessness is present.",
   "Increase intensity without monitoring saturation and symptoms."
  ],
  "why": "Supervised rehabilitation may help function while underlying pulmonary disease continues medical management.",
  "safety": false
 },
 {
  "key": "cardio-ph",
  "title": "Pulmonary hypertension with exertional syncope concern",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "adult",
  "chief": "I nearly faint when I walk uphill and my breathlessness has worsened.",
  "history": "A patient with known pulmonary vascular disease has new exertional near-fainting and progressive activity intolerance.",
  "findings": [
   "Near-syncope during exertion",
   "Reduced exercise capacity with possible hemodynamic compromise"
  ],
  "exam": [
   "Stop exertional testing and arrange urgent medical assessment of presyncope and cardiopulmonary status.",
   "Proceed with a maximal six-minute walk despite near-collapse.",
   "Use normal resting oxygen saturation to rule out serious risk.",
   "Treat only with breathing exercises and defer referral."
  ],
  "examWhy": "New exertional presyncope in pulmonary hypertension is a danger sign and exercise testing must not take priority.",
  "alternatives": [
   "Arrhythmia",
   "Aortic stenosis",
   "Anemia"
  ],
  "management": [
   "Arrange urgent clinician/cardiology assessment before any rehabilitation exercise progression.",
   "Start unsupervised high-load stair intervals.",
   "Reassure that near-fainting is normal with exercise."
  ],
  "why": "Syncope or presyncope with pulmonary vascular disease requires prompt escalation.",
  "safety": true,
  "urgency": "I feel like fainting with exertion and the breathlessness is worsening."
 },
 {
  "key": "cardio-pe",
  "title": "Suspected pulmonary embolism during rehabilitation",
  "track": "Cardiopulmonary Rehabilitation",
  "region": "Heart & Lungs",
  "cohort": "adult",
  "chief": "My breathing suddenly became difficult and my chest hurts with deep breaths.",
  "history": "Patient recently immobile after a procedure develops sudden dyspnea and pleuritic pain, with unilateral leg swelling.",
  "findings": [
   "Acute breathlessness with chest discomfort",
   "Unilateral leg swelling increases thromboembolic concern"
  ],
  "exam": [
   "Stop rehabilitation, assess vital signs without delaying emergency medical referral for suspected thromboembolism.",
   "Perform exertional step testing to determine whether symptoms are fitness related.",
   "Use ankle compression and massage to test suspected leg clot.",
   "Continue routine rehabilitation and reassess next week."
  ],
  "examWhy": "Sudden dyspnea with pleuritic pain and DVT clues requires emergency evaluation; physiotherapy cannot safely exclude embolism.",
  "alternatives": [
   "Acute coronary syndrome",
   "Pneumonia",
   "Panic-related dyspnea"
  ],
  "management": [
   "Activate emergency referral/medical handover immediately; do not start routine exercise or massage.",
   "Begin lower-limb deep tissue massage despite possible thrombosis.",
   "Perform maximal exertion as diagnostic confirmation."
  ],
  "why": "Potential pulmonary embolism is time-critical and requires medical assessment.",
  "safety": true,
  "urgency": "The difficulty breathing started suddenly with painful breathing and one swollen leg."
 }
];
