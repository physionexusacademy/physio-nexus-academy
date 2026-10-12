import type { ClinicalCase } from "@/lib/clinical-cases";
export const case20261013LateralElbow: ClinicalCase = {
 slug: "lateral-elbow-tendinopathy-workload-case-20261013",
 title: "Lateral Elbow Pain During Repetitive Work: Tendon, Nerve or Neck?",
 specialty: "Musculoskeletal", difficulty: "Clinical", estimatedTime: "9–11 min",
 summary: "A simulated case on load-related elbow pain, differential diagnosis and graded return to work.",
 presentation: [
  "An adult in their early forties reports seven weeks of lateral elbow pain after increased repetitive gripping and lifting at work, without a single traumatic event.",
  "Pain occurs when lifting a mug with the forearm pronated, carrying a bag and gripping tools. Symptoms ease on lighter workdays but recur after prolonged gripping.",
  "The person denies fever, major trauma, hand numbness, progressive weakness, neck-dominant pain or systemic illness."
 ],
 keyFindings: [
  "Localized tenderness around the common wrist-extensor origin.",
  "Familiar pain with resisted wrist extension and gripping; no single test is treated as diagnostic.",
  "Elbow range is near full without warmth, marked swelling or deformity.",
  "Grip is limited by familiar pain; cervical and distal neurological screens are not suggestive of a clear deficit.",
  "Workload increased recently."
 ],
 redFlags: ["Significant trauma, deformity, hot swollen joint or fever.", "Progressive neurological deficit or persistent sensory change.", "Severe unremitting pain, unexplained mass or systemic symptoms."],
 differentials: [
  { diagnosis: "Lateral elbow tendinopathy", reasoning: "Load-related pain, local tenderness and increased gripping demand fit a common extensor tendon presentation." },
  { diagnosis: "Radial tunnel or posterior interosseous nerve disorder", reasoning: "Consider with more distal pain, resisted-supination symptoms or neurological findings." },
  { diagnosis: "Cervical radiculopathy", reasoning: "Consider if neck symptoms, sensory change, reflex or myotomal findings emerge." },
  { diagnosis: "Elbow joint pathology", reasoning: "More likely with restricted passive movement, locking, swelling or trauma." }
 ],
 finalDiagnosis: "Working diagnosis: probable lateral elbow tendinopathy associated with increased repetitive gripping load; reconsider if progress or examination is atypical.",
 reasoning: ["The load-related pattern and localized findings support a tendon-related presentation but do not prove a specific lesion.", "No red flags are identified in this simulated history; reassess if symptoms change.", "Provocation tests support rather than confirm the diagnosis."],
 management: [
  "Agree temporary modification of the most provocative gripping volume or force while maintaining tolerable activity.",
  "Record PRTEE or QuickDASH, pain-free grip where available and a meaningful work task.",
  "Begin tolerable wrist-extensor isometrics or slow resistance, for example 2–3 sets of 8–15 repetitions on 2–3 days weekly, adjusted to symptoms and next-day response.",
  "Review tool ergonomics and task rotation; progress resistance and work simulation one variable at a time."
 ],
 progression: ["Review symptoms during exercise and over 24 hours; reduce dose if a substantial flare persists.", "At 2–4 weeks repeat the chosen outcome measure, grip measure and functional task.", "Progress toward usual work when tolerance improves; reassess or refer if neurological signs, swelling, joint restriction or atypical rest pain appears."],
 learningPoints: ["Load-related pain does not prove a specific tendon lesion.", "Consider radial nerve, cervical and joint alternatives.", "Active rehabilitation and graded return to work should guide care.", "Use repeatable outcomes and a patient-selected task."],
 references: [
  { title: "Lateral Elbow Pain and Muscle Function Impairments: Clinical Practice Guideline", organization: "JOSPT", year: "2022", url: "https://www.jospt.org/doi/10.2519/jospt.2022.0302" },
  { title: "Tennis elbow", organization: "NHS", url: "https://www.nhs.uk/conditions/tennis-elbow/" }
 ],
 caseType: "Simulated evidence-based case"
};