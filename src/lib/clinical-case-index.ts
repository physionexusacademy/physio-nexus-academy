export type ClinicalCaseIndexItem = {
  slug: string;
  title: string;
  specialty: string;
  difficulty: "Clinical" | "Advanced";
  estimatedTime: string;
  summary: string;
};

export const clinicalCaseIndex: ClinicalCaseIndexItem[] = [
  {
    slug: "postpartum-running-stress-urinary-incontinence",
    title: "Postpartum Runner With Urinary Leakage During Impact",
    specialty: "Women's & Pelvic Health",
    difficulty: "Clinical",
    estimatedTime: "10–12 min",
    summary:
      "A simulated postpartum case integrating pelvic-floor symptoms, impact readiness, differential diagnosis and graded return to running.",
  },
  {
    slug: "older-adult-recurrent-falls-orthostatic-symptoms",
    title: "Recurrent Falls With Dizziness: Balance Problem or Orthostatic Hypotension?",
    specialty: "Geriatrics",
    difficulty: "Advanced",
    estimatedTime: "12 min",
    summary:
      "A simulated case showing why recurrent falls with position-related dizziness require cardiovascular and multidomain reasoning, not balance exercises alone.",
  },
  {
    slug: "overhead-athlete-shoulder-load-capacity",
    title: "Overhead Athlete With Shoulder Pain: Load, Capacity and Return to Training",
    specialty: "Sports / Musculoskeletal",
    difficulty: "Advanced",
    estimatedTime: "10 min",
    summary:
      "A simulated rehabilitation case focused on shoulder load tolerance, strength and graded return to overhead sport.",
  },
  {
    slug: "runner-anterior-knee-pain-load-capacity",
    title: "Runner With Anterior Knee Pain: Load and Capacity",
    specialty: "Sports",
    difficulty: "Advanced",
    estimatedTime: "10 min",
    summary:
      "Simulated case on differential reasoning, progressive strengthening and graded return to running.",
  },
  {
    slug: "copd-rehab-exertional-desaturation-clinical-reasoning",
    title: "COPD Rehabilitation: When Exertional Breathlessness Needs a Rethink",
    specialty: "Cardiopulmonary",
    difficulty: "Advanced",
    estimatedTime: "10–12 min",
    summary:
      "A simulated pulmonary rehabilitation case requiring the clinician to distinguish expected exertional dyspnea from a concerning change in exercise response.",
  },
  {
    slug: "low-back-pain-new-bladder-saddle-symptoms",
    title: "Low Back Pain + New Bladder and Saddle Symptoms",
    specialty: "Musculoskeletal / Neurological Red Flags",
    difficulty: "Advanced",
    estimatedTime: "8–10 min",
    summary:
      "A red-flag reasoning case where the correct physiotherapy decision is urgent escalation, not treatment.",
  },
  {
    slug: "stroke-gait-balance-task-specific-rehab",
    title: "Post-Stroke Gait and Balance Rehabilitation",
    specialty: "Neurological",
    difficulty: "Advanced",
    estimatedTime: "10–12 min",
    summary:
      "A task-specific neurorehabilitation case focused on dosage, functional goals and progression after stroke.",
  },
  {
    slug: "copd-post-exacerbation-pulmonary-rehab",
    title: "COPD After Exacerbation: Pulmonary Rehabilitation Planning",
    specialty: "Cardiopulmonary",
    difficulty: "Advanced",
    estimatedTime: "9–11 min",
    summary:
      "A cardiopulmonary case that links exertional symptoms, exercise capacity and pulmonary rehabilitation planning.",
  },
  {
    slug: "acl-reconstruction-return-to-sport-readiness",
    title: "ACL Reconstruction: Is This Athlete Ready to Return to Pivoting Sport?",
    specialty: "Sports",
    difficulty: "Advanced",
    estimatedTime: "12–15 min",
    summary:
      "A criterion-based return-to-sport case that integrates symptoms, quadriceps strength, jump testing, psychological readiness and sport-specific exposure after ACL reconstruction.",
  },
];
