import type { ClinicalCase } from "@/lib/clinical-cases";

export const case20261001Copd: ClinicalCase = {
  slug: "copd-rehab-exertional-desaturation-clinical-reasoning",
  title: "COPD Rehabilitation: When Exertional Breathlessness Needs a Rethink",
  specialty: "Cardiopulmonary",
  difficulty: "Advanced",
  estimatedTime: "10–12 min",
  summary: "A simulated pulmonary rehabilitation case requiring the clinician to distinguish expected exertional dyspnea from a concerning change in exercise response.",
  presentation: [
    "A 67-year-old adult with physician-diagnosed COPD is referred for pulmonary rehabilitation after increasing activity limitation.",
    "At baseline the patient reports dyspnea on hills and stairs but is independent in daily activities and has had no current fever or acute infective symptoms.",
    "During a supervised walking session, breathlessness rises much faster than in the previous sessions and oxygen saturation falls substantially below the patient's usual exercise response despite reducing pace."
  ],
  keyFindings: [
    "Disproportionate change from the individual's established exercise response rather than breathlessness alone.",
    "Reduced walking tolerance compared with prior sessions.",
    "No obvious musculoskeletal explanation for the sudden decline.",
    "The clinician has objective baseline data from previous standardized sessions for comparison."
  ],
  redFlags: [
    "New or disproportionate exertional desaturation compared with baseline.",
    "New chest pain, presyncope/syncope, confusion, cyanosis or marked distress would require urgent escalation.",
    "Possible acute exacerbation, cardiovascular event, infection, pulmonary embolic disease or other acute pathology must be considered when the pattern changes unexpectedly."
  ],
  differentials: [
    { diagnosis: "Expected COPD exertional limitation", reasoning: "COPD commonly causes exertional dyspnea, but a substantial sudden departure from a previously reproducible response should not automatically be attributed to stable COPD." },
    { diagnosis: "COPD exacerbation or intercurrent respiratory illness", reasoning: "A change in dyspnea/exercise tolerance may precede or accompany exacerbation; cough, sputum, wheeze, fever and recent symptom trajectory should be reviewed." },
    { diagnosis: "Cardiovascular or thromboembolic cause", reasoning: "Disproportionate dyspnea, chest symptoms, presyncope or unexpected desaturation can reflect pathology outside routine pulmonary rehabilitation and requires appropriate medical assessment." }
  ],
  finalDiagnosis: "Unexpected deterioration during COPD exercise training — stop routine progression and medically reassess before attributing the response to stable COPD",
  reasoning: [
    "Pulmonary rehabilitation intentionally provokes manageable breathlessness, so symptom intensity alone does not define danger.",
    "The key signal is the meaningful change from the patient's established response combined with objective deterioration in exercise tolerance and oxygenation.",
    "Safe rehabilitation requires distinguishing a trainable chronic limitation from an acute change that needs medical evaluation."
  ],
  management: [
    "Stop the exercise bout, position and monitor the patient, repeat vital observations and assess symptoms according to local emergency and pulmonary rehabilitation protocols.",
    "Escalate urgently if severe or persistent symptoms, chest pain, syncope, marked hypoxemia, acute neurological change or other emergency features are present.",
    "Do not independently alter prescribed oxygen outside the clinician's scope/local protocol; coordinate with the medical team when oxygen needs appear to have changed.",
    "Once medically stable and cleared, re-establish baseline exercise tolerance and resume individualized endurance/interval and resistance training rather than immediately returning to the prior workload."
  ],
  progression: [
    "Reassessment criteria: stable resting status, no unresolved acute red flags and an exercise response consistent with the revised medical plan.",
    "Restart below the previously provocative workload and monitor dyspnea, fatigue, heart rate and oxygen saturation when indicated.",
    "Progress duration before intensity when tolerance is limited, or use intervals; reassess standardized walking capacity and patient goals after the rehabilitation block.",
    "GOLD 2026 describes pulmonary rehabilitation programs of about 6–8 weeks with supervised exercise at least twice weekly, individualized to functional goals."
  ],
  learningPoints: [
    "Breathlessness is expected in pulmonary rehabilitation; an unexplained change from baseline is the clinical reasoning trigger.",
    "Objective trend data are valuable because they help distinguish chronic limitation from acute deterioration.",
    "Pulmonary rehabilitation is individualized and multidisciplinary; safety decisions may require medical escalation rather than exercise modification alone.",
    "Reassessment should include exercise capacity, symptoms, functional goals and the response to the revised workload."
  ],
  references: [
    { title: "Global Strategy for Prevention, Diagnosis and Management of COPD: 2026 Report", organization: "GOLD", year: "2026", url: "https://goldcopd.org/2026-gold-report/" }
  ],
  caseType: "Simulated evidence-based case"
};