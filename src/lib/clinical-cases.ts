export type ClinicalCaseReference = {
  title: string;
  organization: string;
  year?: string;
  url: string;
};

export type ClinicalCase = {
  slug: string;
  title: string;
  specialty: string;
  difficulty: "Clinical" | "Advanced";
  estimatedTime: string;
  summary: string;
  presentation: string[];
  keyFindings: string[];
  redFlags?: string[];
  differentials: Array<{
    diagnosis: string;
    reasoning: string;
  }>;
  finalDiagnosis: string;
  reasoning: string[];
  management: string[];
  progression?: string[];
  learningPoints: string[];
  references: ClinicalCaseReference[];
  caseType: "Simulated evidence-based case";
};

export const clinicalCases: ClinicalCase[] = [
  {
    slug: "low-back-pain-new-bladder-saddle-symptoms",
    title: "Low Back Pain + New Bladder and Saddle Symptoms",
    specialty: "Musculoskeletal / Neurological Red Flags",
    difficulty: "Advanced",
    estimatedTime: "8–10 min",
    summary:
      "A red-flag reasoning case where the correct physiotherapy decision is urgent escalation, not treatment.",
    presentation: [
      "A 48-year-old adult presents with severe low-back pain radiating into both legs.",
      "Over the last several hours, the patient reports new difficulty initiating urination and altered sensation around the perineal/saddle region.",
      "Leg symptoms are worsening and the patient feels less confident walking.",
    ],
    keyFindings: [
      "Severe low-back pain with bilateral leg symptoms.",
      "New bladder disturbance.",
      "New perineal/saddle sensory change.",
      "Progressive neurological symptoms.",
    ],
    redFlags: [
      "New-onset bladder or bowel disturbance.",
      "New-onset perineal numbness.",
      "Progressive neurological deficit.",
    ],
    differentials: [
      {
        diagnosis: "Cauda equina syndrome",
        reasoning:
          "The combination of severe low-back/leg pain with new bladder disturbance and perineal sensory change is a classic emergency pattern requiring immediate assessment.",
      },
      {
        diagnosis: "Lumbar radiculopathy without cauda equina syndrome",
        reasoning:
          "Radiculopathy can explain leg pain and neurological symptoms, but new bladder and saddle symptoms make isolated radiculopathy an unsafe working diagnosis.",
      },
      {
        diagnosis: "Conus medullaris or other compressive neurological pathology",
        reasoning:
          "Other compressive lesions can overlap clinically and must be considered during emergency medical assessment.",
      },
    ],
    finalDiagnosis:
      "Suspected cauda equina syndrome — emergency medical assessment required before any routine physiotherapy management.",
    reasoning: [
      "The decision is driven by the symptom cluster, not by trying to confirm the lesion in a physiotherapy clinic.",
      "NICE recommends immediate referral for severe low-back pain radiating into the leg with new bladder, bowel or sexual dysfunction, or new perineal numbness.",
      "A normal or partially reassuring musculoskeletal examination should not override these new neurological red flags.",
    ],
    management: [
      "Stop routine musculoskeletal treatment.",
      "Escalate immediately according to the local emergency pathway for suspected cauda equina syndrome.",
      "Communicate the red-flag findings clearly and document onset/timing of bladder, saddle and neurological symptoms.",
      "Do not delay referral in order to trial exercise, manual therapy, electrotherapy or analgesic modalities.",
    ],
    progression: [
      "Physiotherapy rehabilitation may become appropriate later, after urgent medical investigation and management have addressed the suspected neurological emergency.",
    ],
    learningPoints: [
      "Clinical reasoning sometimes means knowing when not to treat.",
      "Bladder/bowel change plus saddle sensory symptoms radically changes the urgency of a low-back presentation.",
      "Red-flag clusters matter more than a single isolated symptom.",
    ],
    references: [
      {
        title: "Suspected neurological conditions: recognition and referral — recommendations for adults",
        organization: "NICE",
        year: "2019, updated",
        url: "https://www.nice.org.uk/guidance/ng127/chapter/Recommendations-for-adults-aged-over-16",
      },
      {
        title: "Low back pain and sciatica in over 16s: assessment and management",
        organization: "NICE",
        year: "2016, updated 2020",
        url: "https://www.nice.org.uk/guidance/ng59/chapter/recommendations",
      },
    ],
    caseType: "Simulated evidence-based case",
  },
  {
    slug: "stroke-gait-balance-task-specific-rehab",
    title: "Post-Stroke Gait and Balance Rehabilitation",
    specialty: "Neurological",
    difficulty: "Advanced",
    estimatedTime: "10–12 min",
    summary:
      "A task-specific neurorehabilitation case focused on dosage, functional goals and progression after stroke.",
    presentation: [
      "A 63-year-old adult is medically stable after a first ischaemic stroke and has entered specialist rehabilitation.",
      "The patient can sit independently but needs assistance for sit-to-stand and walks a short distance with supervision and an assistive device.",
      "Primary goals are independent toilet transfers and safe household walking.",
    ],
    keyFindings: [
      "Reduced lower-limb motor control and strength on one side.",
      "Slow sit-to-stand with heavy upper-limb support.",
      "Reduced gait speed, step symmetry and endurance.",
      "Impaired dynamic balance during turning and obstacle negotiation.",
    ],
    differentials: [
      {
        diagnosis: "Motor impairment secondary to stroke",
        reasoning:
          "Unilateral weakness, impaired selective control and gait/balance limitations are consistent with the known stroke diagnosis.",
      },
      {
        diagnosis: "Deconditioning contributing to mobility limitation",
        reasoning:
          "Reduced activity after acute illness can compound neurological impairment and should be addressed in rehabilitation.",
      },
      {
        diagnosis: "Vestibular or musculoskeletal contributors",
        reasoning:
          "These should be screened when balance loss or pain is disproportionate to the expected stroke presentation.",
      },
    ],
    finalDiagnosis:
      "Functional mobility limitation after stroke requiring specialist multidisciplinary neurorehabilitation.",
    reasoning: [
      "The treatment target is meaningful activity: transfers, walking and balance required for the patient's stated goals.",
      "Task-specific practice and sufficient repetition are prioritized over isolated exercise alone.",
      "NICE recommends needs-based multidisciplinary stroke rehabilitation for at least 3 hours a day on at least 5 days a week when the person can participate at that level.",
    ],
    management: [
      "Repeated sit-to-stand practice with progressive reduction of upper-limb support.",
      "High-repetition stepping and overground gait practice matched to safety and fatigue.",
      "Progressive balance tasks including turning, reaching and obstacle negotiation.",
      "Strength and endurance training to support functional practice.",
      "Use objective measures such as gait speed, transfer performance and balance tests to track change.",
      "Coordinate goals and dosage with the wider stroke rehabilitation team.",
    ],
    progression: [
      "Progress from high-support to lower-support transfers and gait.",
      "Increase walking distance, environmental complexity and dual-task demand as appropriate.",
      "Move from supervised household mobility toward community-relevant tasks when safe.",
    ],
    learningPoints: [
      "Neurorehabilitation should be goal-directed, intensive enough to drive change, and specific to the task.",
      "Dose is not just sets and reps; it includes meaningful therapy time, repetition and challenge.",
      "Outcome measures should connect to the person's goals.",
    ],
    references: [
      {
        title: "Stroke rehabilitation in adults (NG236)",
        organization: "NICE",
        year: "2023",
        url: "https://www.nice.org.uk/guidance/ng236/chapter/Recommendations",
      },
    ],
    caseType: "Simulated evidence-based case",
  },
  {
    slug: "copd-post-exacerbation-pulmonary-rehab",
    title: "COPD After Exacerbation: Pulmonary Rehabilitation Planning",
    specialty: "Cardiopulmonary",
    difficulty: "Advanced",
    estimatedTime: "9–11 min",
    summary:
      "A cardiopulmonary case that links exertional symptoms, exercise capacity and pulmonary rehabilitation planning.",
    presentation: [
      "A 67-year-old adult with confirmed COPD is referred after a recent exacerbation-related hospital admission.",
      "The patient reports marked exertional breathlessness, reduced walking tolerance and fear of becoming short of breath during activity.",
      "At rest the patient is clinically stable and has been cleared for rehabilitation.",
    ],
    keyFindings: [
      "Reduced exercise tolerance compared with pre-exacerbation function.",
      "Dyspnoea with everyday walking and stair activity.",
      "Lower-limb deconditioning.",
      "Activity avoidance related to breathlessness.",
    ],
    differentials: [
      {
        diagnosis: "Post-exacerbation deconditioning in COPD",
        reasoning:
          "The timing, reduced activity and exertional limitation fit a common post-hospitalization rehabilitation presentation.",
      },
      {
        diagnosis: "Unstable cardiopulmonary disease",
        reasoning:
          "New chest pain, syncope, severe resting hypoxaemia or rapidly worsening symptoms would require medical reassessment before progression.",
      },
      {
        diagnosis: "Peripheral musculoskeletal limitation",
        reasoning:
          "Leg pain or joint limitation can reduce walking performance and may need parallel management.",
      },
    ],
    finalDiagnosis:
      "Reduced exercise capacity and functional tolerance in stable COPD following a recent exacerbation, appropriate for individualized pulmonary rehabilitation.",
    reasoning: [
      "Pulmonary rehabilitation targets more than lung mechanics; it addresses exercise tolerance, dyspnoea, confidence and function.",
      "The 2026 GOLD report supports pulmonary rehabilitation for symptomatic people with COPD and those at high risk of exacerbation.",
      "Program content should be individualized and commonly combines endurance and resistance training with education and self-management.",
    ],
    management: [
      "Baseline assessment of symptoms, functional exercise capacity and relevant vital signs.",
      "Individualized aerobic/endurance training using walking or cycling as appropriate.",
      "Progressive resistance exercise for upper and lower limbs.",
      "Breathlessness management, pacing and recovery strategies.",
      "Education and supported self-management rather than education alone.",
      "Monitor exercise response and adjust intensity based on symptoms, exertion and clinical status.",
    ],
    progression: [
      "Increase duration and/or intensity as tolerated rather than making abrupt jumps.",
      "Add functional tasks that reflect the patient's daily activity goals.",
      "Reassess exercise capacity and participation after the rehabilitation block.",
    ],
    learningPoints: [
      "Pulmonary rehabilitation is a comprehensive intervention, not simply breathing exercises.",
      "Exercise training is central to improving function in stable COPD.",
      "Post-exacerbation rehabilitation can be especially important because inactivity and deconditioning accumulate quickly.",
    ],
    references: [
      {
        title: "Global Strategy for Prevention, Diagnosis and Management of COPD: 2026 Report",
        organization: "GOLD",
        year: "2026",
        url: "https://goldcopd.org/2026-gold-report-and-pocket-guide/",
      },
    ],
    caseType: "Simulated evidence-based case",
  },,
{
  "slug": "acl-reconstruction-return-to-sport-readiness",
  "title": "ACL Reconstruction: Is This Athlete Ready to Return to Pivoting Sport?",
  "specialty": "Sports",
  "difficulty": "Advanced",
  "estimatedTime": "12–15 min",
  "summary": "A criterion-based return-to-sport case that integrates symptoms, quadriceps strength, jump testing, psychological readiness and sport-specific exposure after ACL reconstruction.",
  "presentation": [
    "A 22-year-old recreational football player is 8 months after primary ACL reconstruction and asks to return to unrestricted team training.",
    "The athlete reports no giving-way episodes and only occasional mild anterior knee discomfort after heavy gym sessions.",
    "Jogging and planned cutting drills have been resumed, but full-speed reactive football drills and contact training have not yet been completed.",
    "The athlete is highly motivated because an important tournament begins in 4 weeks."
  ],
  "keyFindings": [
    "Full knee extension and near-symmetrical flexion with no clinically important effusion at rest.",
    "Single-leg squat is controlled at slow speed, but high-speed deceleration shows reduced confidence on the reconstructed side.",
    "Quadriceps peak torque is approximately 86% of the uninvolved limb; hamstring strength is closer to symmetry.",
    "Single-hop distance is 92% symmetrical, but repeated jump testing shows poorer landing stiffness and reduced eccentric control on the reconstructed side.",
    "Patient-reported knee function is good, while psychological readiness remains lower than desired for unrestricted pivoting sport.",
    "The athlete has not yet completed repeated high-speed, reactive, unplanned change-of-direction sessions under fatigue."
  ],
  "redFlags": [
    "A new large effusion, locking, recurrent giving way or acute loss of motion would require reassessment before further progression.",
    "New calf swelling, unexplained shortness of breath or other postoperative medical warning signs require urgent medical assessment."
  ],
  "differentials": [
    {
      "diagnosis": "Incomplete neuromuscular and strength recovery after ACL reconstruction",
      "reasoning": "Persistent quadriceps deficit, reduced deceleration quality and poorer repeated landing control suggest that recovery is not yet complete despite good basic function."
    },
    {
      "diagnosis": "Adequate physical recovery but low psychological readiness",
      "reasoning": "Fear or reduced confidence can independently limit sport performance, but this athlete also has objective strength and reactive-task deficits, so psychology is not the only issue."
    },
    {
      "diagnosis": "Patellofemoral or donor-site-related anterior knee pain",
      "reasoning": "Mild anterior discomfort after heavy loading may coexist with ACL rehabilitation and should be assessed, but it does not explain the full pattern of strength and high-speed control deficits."
    },
    {
      "diagnosis": "Ready for unrestricted pivoting sport",
      "reasoning": "This is less likely because objective testing and sport-specific exposure are incomplete. Calendar time and a single hop symmetry score are insufficient for clearance."
    }
  ],
  "finalDiagnosis": "Late-stage ACL reconstruction rehabilitation with incomplete quadriceps recovery and insufficient high-speed reactive sport exposure; not yet ready for unrestricted pivoting competition.",
  "reasoning": [
    "Return to sport is a process rather than a single test or date. Biological healing time matters, but objective strength, symptoms, movement quality, psychological readiness and tolerance of sport-specific workload must also be considered.",
    "The 92% single-hop symmetry result is reassuring but does not override the 86% quadriceps strength result or the poorer repeated landing and deceleration quality.",
    "Limb symmetry can overestimate recovery if the uninvolved limb has deconditioned; absolute or normative values are useful when available.",
    "Aspetar guidance emphasizes exercise as the foundation of ACL rehabilitation and proposes criteria including absence of pain/swelling, full range, knee stability, patient-reported function, psychological readiness and high-level strength/jump performance before return to high-demand pivoting sport.",
    "Recent evidence-based consensus also supports individualized, multimodal rehabilitation lasting long enough to restore function rather than relying on an accelerated time-only pathway."
  ],
  "management": [
    "Continue progressive quadriceps strengthening with loads high enough to address the remaining strength deficit while monitoring knee symptoms and next-day response.",
    "Progress eccentric and deceleration training from planned to reactive tasks at increasing speed.",
    "Use plyometric progressions that include repeated unilateral landings, horizontal and vertical force production, and movement-quality feedback.",
    "Add unplanned change-of-direction drills that reproduce football-specific perception and decision-making demands.",
    "Progress from non-contact technical training to controlled team drills, then higher-speed and fatigue-exposed sessions before unrestricted competition.",
    "Address psychological readiness through graded exposure, shared testing results and successful completion of increasingly representative football tasks.",
    "Reassess quadriceps strength, jump performance, knee symptoms and sport-specific tolerance before clearance."
  ],
  "progression": [
    "First milestone: repeated high-load strength sessions without clinically important effusion or prolonged pain.",
    "Second milestone: improved quadriceps strength toward sport-appropriate targets together with acceptable absolute performance, not symmetry alone.",
    "Third milestone: controlled high-speed deceleration, planned cutting and repeated unilateral plyometrics.",
    "Fourth milestone: reactive/unplanned cutting, football-specific drills and repeated efforts under fatigue.",
    "Final stage: graded return to team training and competition only after the athlete demonstrates stable knee response, adequate physical testing, confidence and sport-specific workload tolerance."
  ],
  "learningPoints": [
    "A good hop-test symmetry score does not automatically equal return-to-sport readiness.",
    "Quadriceps strength and eccentric control remain important late-stage targets.",
    "Psychological readiness should be assessed but should not be used to explain away objective physical deficits.",
    "Sport-specific exposure must progress from predictable drills to reactive, fatigued and representative environments.",
    "Return to sport is a shared, criterion-based decision rather than a reward for reaching a particular postoperative month."
  ],
  "references": [
    {
      "title": "Aspetar clinical practice guideline on rehabilitation after anterior cruciate ligament reconstruction",
      "organization": "British Journal of Sports Medicine / Aspetar",
      "year": "2023",
      "url": "https://bjsm.bmj.com/content/57/9/500"
    },
    {
      "title": "ACL rehabilitation after reconstruction: Evidence-based consensus recommendations from the German Knee Society-Part IV",
      "organization": "PubMed",
      "year": "2026",
      "url": "https://pubmed.ncbi.nlm.nih.gov/42549304/"
    }
  ],
  "caseType": "Simulated evidence-based case"
}
];

export function getClinicalCase(slug: string) {
  return clinicalCases.find((item) => item.slug === slug);
}
