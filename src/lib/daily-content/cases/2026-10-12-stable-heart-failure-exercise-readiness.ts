import type { ClinicalCase } from "@/lib/clinical-cases";

export const case20261012HeartFailure: ClinicalCase = {
  slug: "stable-heart-failure-exercise-readiness",
  title: "Stable Heart Failure: Deciding Whether and How to Begin Exercise",
  specialty: "Cardiopulmonary",
  difficulty: "Advanced",
  estimatedTime: "10–12 min",
  summary: "A simulated case on exercise readiness, baseline assessment and individualized rehabilitation in chronic heart failure, with emphasis on recognizing possible decompensation.",
  presentation: [
    "A 69-year-old adult with established chronic heart failure is referred to outpatient physiotherapy for reduced walking tolerance after several months of low activity.",
    "The patient reports breathlessness when walking uphill but is comfortable at rest and reports no recent change in symptoms. The cardiology team has documented clinical stability and supports supervised rehabilitation.",
    "The patient takes a beta-blocker and diuretic, uses a walking stick outdoors and wants to return to a nearby grocery shop."
  ],
  keyFindings: [
    "Reduced walking endurance and lower-limb deconditioning.",
    "Resting observations are within the patient's documented baseline; exertion and recovery still require monitoring.",
    "The beta-blocker may blunt heart-rate response, so heart rate alone is an unreliable intensity guide.",
    "Balance and confidence affect outdoor walking."
  ],
  redFlags: [
    "New or worsening breathlessness at rest, orthopnoea, rapidly increasing oedema or rapid fluid-related weight gain.",
    "Chest pressure, syncope, new confusion or symptomatic palpitations.",
    "Unexpected haemodynamic response or marked deterioration from the patient's usual baseline."
  ],
  differentials: [
    { diagnosis: "Stable chronic heart failure with deconditioning", reasoning: "The documented stable status, exertional limitation and reduced activity fit the referral, subject to confirming baseline and current symptoms." },
    { diagnosis: "Acute heart-failure decompensation", reasoning: "Must be reconsidered if congestion symptoms, rapid weight change or resting breathlessness are new or worsening; routine exercise should then stop pending medical review." },
    { diagnosis: "Pulmonary disease, anaemia or musculoskeletal limitation", reasoning: "These can contribute to exertional symptoms and should be considered if the pattern is disproportionate, changing or not explained by the known condition." }
  ],
  finalDiagnosis: "Simulated case: exercise limitation in medically stable chronic heart failure, appropriate for individualized supervised rehabilitation after routine pre-session checks.",
  reasoning: [
    "The referral and stable clinical history support rehabilitation, but readiness must be checked at each session rather than assumed indefinitely.",
    "A beta-blocker can blunt heart-rate response; symptoms, perceived exertion, functional response and relevant observations should guide intensity.",
    "The patient's goal is community function, so training should include aerobic capacity, lower-limb strength, balance and task-specific walking."
  ],
  management: [
    "Confirm current symptoms, recent weight/fluid changes, medication changes and the cardiology team's precautions before the first session.",
    "Record baseline blood pressure, heart rate/rhythm as indicated, perceived exertion, symptom response and an appropriate functional measure such as a 6-minute walk or sit-to-stand test.",
    "If stable and cleared, begin with walking or cycling in short 5–10-minute bouts at light-to-moderate perceived exertion, with recovery intervals. Adapt mode and duration to response.",
    "Add individualized lower-limb resistance exercise, initially light-to-moderate and controlled, avoiding breath-holding or excessive straining.",
    "Use balance and outdoor-walking practice to address the patient's grocery-shop goal; coordinate with the wider team when needed."
  ],
  progression: [
    "Progress duration before intensity when endurance is limited, changing one variable at a time.",
    "Review symptoms during exercise and later that day; increase challenge only when the previous dose is tolerated.",
    "Stop and follow the local escalation pathway for chest pain, syncope/presyncope, disproportionate breathlessness or other concerning responses.",
    "Reassess walking tolerance, sit-to-stand performance, confidence and goal participation after a defined rehabilitation block."
  ],
  learningPoints: [
    "Confirm clinical stability and screen for decompensation before and during rehabilitation.",
    "Heart-rate targets may be misleading with beta-blockers; use individualized multidimensional monitoring.",
    "Rehabilitation should combine aerobic, resistance and functional training around the patient's goals.",
    "New deterioration changes the plan: stop routine exercise and seek appropriate medical review."
  ],
  references: [
    { title: "Chronic heart failure in adults: diagnosis and management (NG106)", organization: "NICE", url: "https://www.nice.org.uk/guidance/ng106/chapter/recommendations" },
    { title: "2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure", organization: "European Society of Cardiology", year: "2021", url: "https://academic.oup.com/eurheartj/article/42/36/3599/6358045" }
  ],
  caseType: "Simulated evidence-based case"
};
