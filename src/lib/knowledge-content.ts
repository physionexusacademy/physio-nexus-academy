export type KnowledgeSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type KnowledgeLevel = "Foundation" | "Clinical" | "Advanced";

export type KnowledgeReference = {
  title: string;
  organization: string;
  year?: string;
  url: string;
};

export type KnowledgeSpecialty =
  | "Musculoskeletal (MSK)"
  | "Neurological"
  | "Cardiopulmonary"
  | "Pediatrics"
  | "Sports"
  | "Geriatrics"
  | "Women's & Pelvic Health"
  | "Pain Science"
  | "Exercise & Rehabilitation"
  | "Research & Evidence";

export type KnowledgeArticle = {
  slug: string;
  title: string;
  excerpt: string;
  specialty: KnowledgeSpecialty;
  category: string;
  audience: "Students" | "Professionals" | "Patients" | "All";
  level?: KnowledgeLevel;
  learningObjectives?: string[];
  references?: KnowledgeReference[];
  readTime: string;
  publishedAt: string;
  updatedAt?: string;
  sections: KnowledgeSection[];
};

export const knowledgeSpecialties: Array<{
  name: KnowledgeSpecialty;
  slug: string;
  description: string;
}> = [
  {
    name: "Musculoskeletal (MSK)",
    slug: "msk",
    description: "Spine, joints, soft tissue, manual therapy, common MSK conditions and clinical reasoning.",
  },
  {
    name: "Neurological",
    slug: "neuro",
    description: "Stroke, spinal cord injury, Parkinson's disease, balance, gait and neurorehabilitation.",
  },
  {
    name: "Cardiopulmonary",
    slug: "cardio",
    description: "Cardiac rehabilitation, respiratory physiotherapy, airway clearance and exercise tolerance.",
  },
  {
    name: "Pediatrics",
    slug: "pediatrics",
    description: "Development, cerebral palsy, clubfoot, pediatric assessment and rehabilitation.",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Sports injuries, return-to-sport, load management, rehabilitation and performance.",
  },
  {
    name: "Geriatrics",
    slug: "geriatrics",
    description: "Falls, frailty, osteoporosis, mobility, balance and healthy aging.",
  },
  {
    name: "Women's & Pelvic Health",
    slug: "womens-health",
    description: "Pelvic health, pregnancy, postpartum rehabilitation and related physiotherapy topics.",
  },
  {
    name: "Pain Science",
    slug: "pain-science",
    description: "Pain mechanisms, central sensitization, persistent pain and patient education.",
  },
  {
    name: "Exercise & Rehabilitation",
    slug: "exercise-rehab",
    description: "Exercise prescription, mobility, strengthening, progression and rehabilitation planning.",
  },
  {
    name: "Research & Evidence",
    slug: "research",
    description: "Research methods, outcome measures, evidence summaries and critical appraisal.",
  },
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "trigger-point-vs-tender-point",
    specialty: "Musculoskeletal (MSK)",
    title: "Trigger Point vs Tender Point: What Is the Difference?",
    excerpt:
      "A simple clinical explanation of trigger points, tender points, taut bands and muscle spasm — and why the terms should not be used interchangeably.",
    category: "Clinical Concepts",
    audience: "Students",
    readTime: "5 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Start with the big picture",
        paragraphs: [
          "These terms describe different findings. A patient can have local tenderness without a trigger point, and a trigger point can exist within a palpable taut band. Muscle spasm is a different phenomenon again.",
        ],
      },
      {
        heading: "Tender point",
        paragraphs: [
          "A tender point is a localized area that is painful when pressure is applied. The key feature is tenderness. It does not necessarily reproduce a familiar referred-pain pattern and it does not automatically mean that a trigger point is present.",
        ],
      },
      {
        heading: "Trigger point",
        paragraphs: [
          "A myofascial trigger point is described clinically as a hypersensitive spot associated with skeletal muscle, commonly within a taut band. Palpation may reproduce the patient’s familiar pain and may sometimes produce referred symptoms.",
        ],
      },
      {
        heading: "Taut band",
        paragraphs: [
          "A taut band is a palpable, tense band of muscle fibers. It is a physical finding rather than a diagnosis by itself. A trigger point may be located within a taut band, but a taut band is not automatically a trigger point.",
        ],
      },
      {
        heading: "Muscle spasm",
        paragraphs: [
          "A muscle spasm is an involuntary contraction of muscle. It is broader than a focal tender or trigger point and should not be treated as a synonym for either.",
        ],
      },
      {
        heading: "Clinical takeaway",
        bullets: [
          "Tender point = local tenderness to pressure.",
          "Trigger point = hypersensitive focal spot with characteristic clinical features.",
          "Taut band = palpable tense band of muscle fibers.",
          "Spasm = involuntary muscle contraction.",
          "Assessment should consider the whole clinical picture rather than a single palpation finding.",
        ],
      },
    ],
  },
  {
    slug: "direct-vs-indirect-myofascial-release",
    specialty: "Musculoskeletal (MSK)",
    title: "Direct vs Indirect Myofascial Release — Explained Simply",
    excerpt:
      "Direct MFR works into a perceived tissue barrier, while indirect MFR follows the tissues toward relative ease. Here is the concept without the confusing jargon.",
    category: "Myofascial Release",
    audience: "Students",
    readTime: "5 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "The easiest way to understand it",
        paragraphs: [
          "Think about the direction of the therapist’s force relative to the tissue barrier. In direct myofascial release, the clinician engages the restrictive barrier. In indirect approaches, the tissues are positioned or guided toward relative ease and the response is monitored.",
        ],
      },
      {
        heading: "Direct MFR",
        paragraphs: [
          "Direct techniques generally take up tissue slack and apply a slow, sustained load toward the perceived restriction. The force should remain controlled and appropriate to the region and the patient’s tolerance.",
        ],
        bullets: [
          "Engage the restrictive barrier.",
          "Use slow and controlled loading.",
          "Monitor symptoms and tissue response.",
          "Avoid aggressive, painful force simply to 'break' tissue.",
        ],
      },
      {
        heading: "Indirect MFR",
        paragraphs: [
          "Indirect approaches move or position the tissues away from the restrictive barrier and toward a position of relative ease. The clinician maintains gentle contact while waiting for a change in tissue tension or comfort.",
        ],
      },
      {
        heading: "Is indirect MFR the same as Strain Counterstrain?",
        paragraphs: [
          "They can look similar because both may use comfortable positioning and gentle loading, but they are not automatically the same technique. Strain Counterstrain is a distinct positional-release approach with its own assessment and positioning logic.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "The labels direct and indirect describe the mechanical strategy used during treatment. They do not tell you whether a technique is appropriate for a particular patient. Clinical reasoning, irritability, precautions and the treatment goal still matter.",
        ],
      },
    ],
  },
  {
    slug: "dry-needling-vs-acupuncture",
    specialty: "Musculoskeletal (MSK)",
    title: "Dry Needling vs Acupuncture: Similar Needle, Different Framework",
    excerpt:
      "Both use thin filiform needles, but their assessment models, treatment rationale, training pathways and clinical context are not identical.",
    category: "Dry Needling",
    audience: "All",
    readTime: "6 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Why people confuse them",
        paragraphs: [
          "Both practices can use thin solid filiform needles, so they may look similar from the outside. The important difference is not just the needle itself; it is the framework used to select targets and explain the treatment.",
        ],
      },
      {
        heading: "Dry needling",
        paragraphs: [
          "Dry needling is commonly used within musculoskeletal rehabilitation. Clinicians may select targets based on anatomy, pain presentation, muscle function and other physical-examination findings. The exact scope and permitted practice depend on professional regulation and local law.",
        ],
      },
      {
        heading: "Acupuncture",
        paragraphs: [
          "Acupuncture is a broader therapeutic system with historical roots in traditional East Asian medicine. Modern acupuncture practice can include traditional diagnostic frameworks as well as contemporary biomedical interpretations, depending on the practitioner and setting.",
        ],
      },
      {
        heading: "What they share",
        bullets: [
          "Use of filiform needles.",
          "Need for appropriate infection-control procedures.",
          "Need for practitioner training and competence.",
          "Potential adverse effects such as soreness, bruising or bleeding.",
        ],
      },
      {
        heading: "What patients should know",
        paragraphs: [
          "Needling is not appropriate for every person or every condition. A qualified clinician should screen for contraindications and precautions, explain expected benefits and risks, and obtain informed consent before treatment.",
        ],
      },
    ],
  },
  {
    slug: "central-sensitization-explained",
    specialty: "Pain Science",
    title: "Central Sensitization: Why Pain Can Become More Sensitive",
    excerpt:
      "Pain intensity is not always a direct measure of tissue damage. Central sensitization helps explain why the nervous system may become more responsive to sensory input.",
    category: "Pain Science",
    audience: "All",
    readTime: "6 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Pain is protective, not a damage meter",
        paragraphs: [
          "Pain is an experience produced by the nervous system when the body interprets threat. Tissue injury can contribute to pain, but pain severity and tissue damage do not always match one-to-one.",
        ],
      },
      {
        heading: "What central sensitization means",
        paragraphs: [
          "Central sensitization refers to increased responsiveness of neurons in the central nervous system to sensory input. In clinical pain discussions, the term is used to help explain features such as disproportionate sensitivity, pain spreading beyond the original area or pain provoked by normally less-painful stimuli.",
        ],
      },
      {
        heading: "What it does not mean",
        bullets: [
          "It does not mean the pain is imaginary.",
          "It does not mean every persistent pain problem is caused by central sensitization.",
          "It does not replace a proper assessment for tissue injury, neurological disease or other pathology.",
        ],
      },
      {
        heading: "Why it matters in rehabilitation",
        paragraphs: [
          "When pain sensitivity is high, rehabilitation may need to combine education, graded activity, sleep and lifestyle support, pacing and progressive exercise rather than relying only on a local tissue treatment.",
        ],
      },
    ],
  },
  {
    slug: "sciatica-red-flags-when-to-seek-care",
    specialty: "Musculoskeletal (MSK)",
    title: "Sciatica and Back Pain: Red Flags That Need Urgent Assessment",
    excerpt:
      "Most back and leg pain is not an emergency, but certain symptoms need prompt medical assessment. Learn the major warning signs in simple language.",
    category: "Patient Education",
    audience: "Patients",
    readTime: "5 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Most cases are not emergencies",
        paragraphs: [
          "Back pain with leg symptoms can occur for many reasons. Many presentations improve with appropriate conservative care, but a small number of symptoms can signal a condition that needs urgent medical assessment.",
        ],
      },
      {
        heading: "Seek urgent medical care if back or leg pain is accompanied by",
        bullets: [
          "New difficulty starting or controlling urination or bowel movements.",
          "New numbness around the groin, inner thighs or saddle area.",
          "Rapidly worsening weakness in one or both legs.",
          "Major trauma, especially in an older adult or someone with known bone fragility.",
          "Fever or marked systemic illness with severe back pain.",
        ],
      },
      {
        heading: "Why these symptoms matter",
        paragraphs: [
          "Some combinations of bladder, bowel, saddle-sensation and neurological symptoms can be associated with serious compression of the nerves in the lower spine. These presentations should not be managed only with home exercises or routine physiotherapy advice.",
        ],
      },
      {
        heading: "What to do",
        paragraphs: [
          "If any major red-flag symptom is new or worsening, seek urgent in-person medical assessment. For non-urgent back or leg pain, a physiotherapist can assess movement, neurological signs, function and appropriate rehabilitation options.",
        ],
      },
    ],
  },

  {
    slug: "stroke-rehabilitation-principles",
    specialty: "Neurological",
    title: "Stroke Rehabilitation: From Impairment to Task-Specific Recovery",
    excerpt:
      "An advanced clinical guide to goal setting, rehabilitation intensity, task-specific practice, gait retraining, progression and outcome measurement after stroke.",
    category: "Stroke Rehabilitation",
    audience: "Students",
    level: "Advanced",
    learningObjectives: [
      "Translate stroke impairments into functional activity and participation goals.",
      "Plan task-specific rehabilitation using repetition, challenge and progressive practice.",
      "Understand how rehabilitation intensity and multidisciplinary input influence programme design.",
      "Select outcome measures that reflect mobility, balance and functional goals.",
    ],
    references: [
      {
        title: "Stroke rehabilitation in adults (NG236)",
        organization: "NICE",
        year: "2023",
        url: "https://www.nice.org.uk/guidance/ng236/chapter/Recommendations",
      },
    ],
    readTime: "14 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "1. Start with function, not the impairment list",
        paragraphs: [
          "After stroke, weakness, altered tone, sensory loss, reduced selective motor control, balance impairment and fatigue may all be present. These findings matter, but rehabilitation becomes clinically meaningful when they are connected to activities the person needs to recover: rolling, transfers, standing, walking, stair negotiation, reaching, self-care and community mobility.",
          "A useful treatment plan therefore moves from impairment → activity limitation → participation goal. For example, reduced ankle dorsiflexion is not treated only because range is limited; it is treated because it may affect foot clearance, step length, walking safety or confidence.",
        ],
      },
      {
        heading: "2. Build goals that can guide treatment dose",
        paragraphs: [
          "Goals should describe what the person needs to do, under what conditions and with what level of assistance. 'Improve balance' is too vague to guide progression. 'Stand unsupported for 2 minutes to complete grooming' or 'walk 20 metres with a stick and supervision' gives the therapist a functional target.",
          "Goal difficulty should be reviewed frequently because rapid change can occur in early rehabilitation and plateaus may require a different strategy rather than simply repeating the same exercise.",
        ],
      },
      {
        heading: "3. Rehabilitation intensity is a clinical variable",
        paragraphs: [
          "NICE recommends needs-based multidisciplinary rehabilitation after stroke for at least 3 hours a day on at least 5 days of the week when the person is able and willing to participate at that level. This is multidisciplinary therapy time, not 3 hours of physiotherapy alone.",
          "Intensity should still be individualized. Severe fatigue, medical instability, cognition, communication, mood, pain and cardiopulmonary tolerance can change how the available therapy time is distributed and how much active practice is realistic.",
        ],
      },
      {
        heading: "4. Task-specific practice: train the task you want to improve",
        paragraphs: [
          "If the goal is sit-to-stand, the programme needs repeated sit-to-stand practice. If the goal is walking, the patient needs meaningful stepping and walking practice. Strengthening and impairment-based exercise can support recovery, but they should connect back to the target task.",
          "Task practice can be graded by changing seat height, hand support, walking speed, distance, surface, direction changes, obstacle complexity, dual-task demand or the amount of physical assistance.",
        ],
        bullets: [
          "Increase repetition before making the task unnecessarily complicated.",
          "Keep the task challenging enough to require adaptation but safe enough to permit quality practice.",
          "Use feedback strategically; too much constant feedback can make the patient dependent on the therapist.",
          "Track whether gains transfer to real activities outside the treatment session.",
        ],
      },
      {
        heading: "5. Gait rehabilitation is more than 'walking the patient'",
        paragraphs: [
          "Gait analysis should identify the specific problem limiting safe and efficient mobility. Reduced stance control, poor foot clearance, asymmetrical loading, short step length, slow speed, fear, reduced endurance or turning difficulty may require different treatment priorities.",
          "Overground walking, treadmill-based practice, strengthening, balance training and assistive devices can all be useful depending on the presentation. The therapist should be able to explain why each component is included and what measurable change is expected.",
        ],
      },
      {
        heading: "6. Measure what matters",
        paragraphs: [
          "Outcome measures should match the treatment goal and the patient's current ability. A single measure rarely captures the entire recovery picture.",
        ],
        bullets: [
          "Walking speed can reflect functional mobility and change over time.",
          "Timed transfer or mobility tests can track task efficiency.",
          "Balance measures help quantify postural control and fall-related limitations.",
          "Walking endurance measures can reveal capacity that a short gait test misses.",
          "Level of assistance and device use should be documented alongside the numerical score.",
        ],
      },
      {
        heading: "7. Progression should change the problem the patient has to solve",
        paragraphs: [
          "Progression is not only adding repetitions. A patient may need less hand support, a lower chair, faster walking, greater distance, more variable surfaces, obstacle negotiation or community-relevant tasks. Progression should mirror the real-world demands that currently limit independence.",
          "If performance deteriorates sharply with added challenge, reduce one variable and rebuild quality rather than allowing repeated poor practice.",
        ],
      },
      {
        heading: "8. Clinical reasoning checkpoint",
        bullets: [
          "What is the patient's highest-priority functional goal?",
          "Which impairment is genuinely limiting that task?",
          "How much active practice is the patient receiving?",
          "Is the task challenging enough to drive change?",
          "Is there objective evidence of improvement?",
          "Are fatigue, cognition, communication, mood or medical factors limiting the planned dose?",
          "Can the patient perform the improved skill outside the therapy environment?",
        ],
      },
      {
        heading: "Advanced takeaway",
        paragraphs: [
          "High-level stroke rehabilitation is not a collection of neurological techniques. It is a structured process of identifying the functional problem, selecting the limiting factors that are modifiable, delivering sufficient meaningful practice, measuring change and progressively increasing real-world task demand.",
        ],
      },
    ],
  },
  {
    slug: "cardiac-rehabilitation-basics",
    specialty: "Cardiopulmonary",
    title: "Cardiac Rehabilitation: A Simple Physiotherapy Overview",
    excerpt:
      "Understand exercise training, monitoring, pacing and education in cardiac rehabilitation without getting lost in terminology.",
    category: "Cardiac Rehabilitation",
    audience: "Students",
    level: "Clinical",
    learningObjectives: [
      "Identify the major components of cardiac rehabilitation.",
      "Connect exercise monitoring to safe progression.",
      "Recognize symptoms that should trigger reassessment rather than exercise progression.",
    ],
    readTime: "8 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "What cardiac rehabilitation includes",
        paragraphs: [
          "Cardiac rehabilitation is a structured program that commonly combines supervised exercise, risk-factor education, lifestyle support and symptom monitoring for people recovering from or living with cardiovascular disease.",
        ],
      },
      {
        heading: "The physiotherapy role",
        bullets: [
          "Assess exercise tolerance and functional capacity.",
          "Prescribe and progress aerobic and resistance exercise.",
          "Teach pacing, warm-up and cool-down strategies.",
          "Monitor symptoms and vital signs where appropriate.",
          "Reinforce safe activity and self-management.",
        ],
      },
      {
        heading: "Exercise progression",
        paragraphs: [
          "Exercise is usually progressed through duration, frequency and intensity rather than by making sudden large jumps. The person should be able to recover appropriately and should not ignore new chest pain, marked breathlessness, dizziness or other concerning symptoms.",
        ],
      },
      {
        heading: "Why monitoring matters",
        paragraphs: [
          "Heart rate, blood pressure, symptoms, perceived exertion and oxygen saturation may be used depending on the clinical setting and diagnosis. Monitoring helps the clinician judge whether the current exercise dose is appropriate.",
        ],
      },
    ],
  },
  {
    slug: "pediatric-developmental-milestones-clinical-use",
    specialty: "Pediatrics",
    title: "Developmental Milestones: How Physiotherapists Use Them Clinically",
    excerpt:
      "Milestones are guides, not rigid deadlines. Learn how pediatric physiotherapists use them to understand movement development and identify concerns.",
    category: "Development",
    audience: "All",
    readTime: "6 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Milestones are a pattern, not a race",
        paragraphs: [
          "Children develop at different rates. Milestones help clinicians observe the sequence and quality of emerging skills, but a single late milestone does not automatically mean that a child has a disorder.",
        ],
      },
      {
        heading: "What physiotherapists observe",
        bullets: [
          "Head and trunk control.",
          "Rolling and transitional movements.",
          "Sitting balance.",
          "Crawling or other floor mobility.",
          "Standing and walking.",
          "Symmetry, movement quality and use of both sides of the body.",
        ],
      },
      {
        heading: "When broader assessment is useful",
        paragraphs: [
          "A child may need closer assessment when there is clear loss of previously acquired skills, persistent asymmetry, unusual stiffness or floppiness, major difficulty with age-expected mobility, or concerns raised by caregivers or the healthcare team.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Pediatric assessment looks beyond the age at which a skill appears. Movement quality, symmetry, environment, participation and the child's overall development are equally important.",
        ],
      },
    ],
  },
  {
    slug: "return-to-sport-after-injury",
    specialty: "Sports",
    title: "Return to Sport After Injury: More Than Being Pain-Free",
    excerpt:
      "Returning to sport should combine symptom control, strength, capacity, sport-specific testing and confidence rather than relying on time alone.",
    category: "Return to Sport",
    audience: "All",
    readTime: "7 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Pain-free is not the finish line",
        paragraphs: [
          "An athlete may feel much better before strength, power, endurance and movement capacity have fully recovered. Return-to-sport decisions should therefore consider function as well as symptoms.",
        ],
      },
      {
        heading: "Key areas to check",
        bullets: [
          "Range of motion relevant to the sport.",
          "Strength and power.",
          "Balance and control.",
          "Running, jumping, cutting or throwing demands when relevant.",
          "Tolerance to repeated training loads.",
          "Confidence and readiness to perform.",
        ],
      },
      {
        heading: "Build exposure gradually",
        paragraphs: [
          "A useful progression is to move from rehabilitation exercise to controlled sport drills, then partial training, full training and finally competition. Each stage should be tolerated before the next one is added.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Return to sport is a process rather than a single test. Time, symptoms, objective capacity and sport-specific demands should all be considered together.",
        ],
      },
    ],
  },
  {
    slug: "falls-risk-older-adults-physiotherapy",
    specialty: "Geriatrics",
    title: "Falls in Older Adults: What Physiotherapy Assessment Should Look For",
    excerpt:
      "Falls are usually multifactorial. A good assessment considers strength, balance, gait, environment, vision, medications and confidence.",
    category: "Falls Prevention",
    audience: "All",
    level: "Advanced",
    learningObjectives: [
      "Use a multifactorial model rather than a single balance test to think about falls.",
      "Connect examination findings to individualized fall-prevention intervention.",
      "Recognize the role of progressive balance and strength training within broader risk management.",
    ],
    references: [
      {
        title: "Physical Therapy Management of Fall Risk in Community-Dwelling Older Adults",
        organization: "APTA Geriatrics",
        year: "2025",
        url: "https://www.apta.org/patient-care/evidence-based-practice-resources/cpgs/physical-therapy-management-of-fall-risk-in-community-dwelling-older-adults",
      },
    ],
    readTime: "9 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Falls rarely have one cause",
        paragraphs: [
          "A fall can reflect a combination of reduced strength, impaired balance, slower reactions, unsafe footwear, environmental hazards, visual problems, medication effects or acute illness.",
        ],
      },
      {
        heading: "What a physiotherapy screen may include",
        bullets: [
          "Recent falls and near-falls.",
          "Sit-to-stand ability.",
          "Walking speed and gait quality.",
          "Static and dynamic balance.",
          "Lower-limb strength.",
          "Use and fit of walking aids.",
          "Confidence and fear of falling.",
        ],
      },
      {
        heading: "Intervention principles",
        paragraphs: [
          "Exercise programs commonly emphasize progressive balance training, strengthening and task practice. Home-environment changes and multidisciplinary review may also be needed when non-physical risk factors are present.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Effective falls prevention is usually individualized. The goal is not only fewer falls, but safer mobility, better confidence and greater participation.",
        ],
      },
    ],
  },
  {
    slug: "pelvic-floor-rehabilitation-basics",
    specialty: "Women's & Pelvic Health",
    title: "Pelvic Floor Rehabilitation: The Basics",
    excerpt:
      "Pelvic floor physiotherapy is more than 'Kegels'. Assessment considers strength, relaxation, coordination, symptoms and function.",
    category: "Pelvic Health",
    audience: "All",
    level: "Clinical",
    learningObjectives: [
      "Differentiate pelvic floor strengthening from relaxation and coordination needs.",
      "Understand why assessment should confirm contraction and relaxation ability.",
      "Relate symptoms and goals to individualized pelvic floor muscle training.",
    ],
    references: [
      {
        title: "Pelvic floor dysfunction: prevention and non-surgical management (NG210)",
        organization: "NICE",
        year: "2021",
        url: "https://www.nice.org.uk/guidance/ng210/chapter/Recommendations",
      },
      {
        title: "Urinary incontinence and pelvic organ prolapse in women: management (NG123)",
        organization: "NICE",
        year: "2019, updated",
        url: "https://www.nice.org.uk/guidance/ng123/chapter/recommendations",
      },
    ],
    readTime: "8 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "What the pelvic floor does",
        paragraphs: [
          "The pelvic floor contributes to continence, support of pelvic organs, pressure management and sexual function. It must be able to contract, relax and coordinate with breathing and movement.",
        ],
      },
      {
        heading: "Why strengthening is not always the answer",
        paragraphs: [
          "Some people need strengthening, while others have difficulty relaxing or coordinating the pelvic floor. Treatment should match the assessment rather than automatically prescribing repeated contractions.",
        ],
      },
      {
        heading: "What rehabilitation may include",
        bullets: [
          "Pelvic floor awareness and coordination.",
          "Breathing and pressure-management strategies.",
          "Strength or endurance training when indicated.",
          "Relaxation and down-training when indicated.",
          "Gradual return to lifting, exercise and daily activity.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Pelvic health rehabilitation should be individualized and respectful. Symptoms such as persistent pelvic pain, urinary or bowel changes, or postpartum concerns may benefit from assessment by a suitably trained clinician.",
        ],
      },
    ],
  },
  {
    slug: "progressive-overload-in-rehabilitation",
    specialty: "Exercise & Rehabilitation",
    title: "Progressive Overload in Rehabilitation: How to Progress Exercise Safely",
    excerpt:
      "Rehabilitation improves when the body is challenged enough to adapt, then given time to recover. Progression should be planned, not random.",
    category: "Exercise Prescription",
    audience: "Students",
    readTime: "6 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "The basic idea",
        paragraphs: [
          "Progressive overload means gradually increasing the challenge placed on the body so that strength, endurance, mobility or skill can continue to improve.",
        ],
      },
      {
        heading: "Ways to progress an exercise",
        bullets: [
          "Increase resistance.",
          "Increase repetitions or sets.",
          "Increase range of motion.",
          "Increase time under tension.",
          "Increase speed or power when appropriate.",
          "Reduce external support.",
          "Make the task more specific to the person's goal.",
        ],
      },
      {
        heading: "Progress one variable at a time",
        paragraphs: [
          "Changing several variables at once makes it harder to know what caused a flare-up or improvement. Small planned changes make exercise response easier to monitor.",
        ],
      },
      {
        heading: "Use response to guide the next dose",
        paragraphs: [
          "Exercise should be challenging enough to create adaptation but not so aggressive that recovery becomes difficult. Symptoms during and after training, movement quality and performance can all help guide progression.",
        ],
      },
    ],
  },
  {
    slug: "rct-vs-observational-study",
    specialty: "Research & Evidence",
    title: "RCT vs Observational Study: A Simple Research Guide",
    excerpt:
      "Learn what randomized controlled trials and observational studies can tell you — and why one design is not automatically best for every research question.",
    category: "Research Methods",
    audience: "Students",
    level: "Clinical",
    learningObjectives: [
      "Match common study designs to the questions they are best suited to answer.",
      "Separate study design hierarchy from actual methodological quality.",
      "Recognize common threats to interpretation such as bias, confounding and measurement quality.",
    ],
    readTime: "8 min read",
    publishedAt: "2026-09-27",
    sections: [
      {
        heading: "Randomized controlled trial",
        paragraphs: [
          "In an RCT, eligible participants are randomly allocated to intervention groups. Randomization helps reduce systematic differences between groups and is especially useful when studying treatment effects.",
        ],
      },
      {
        heading: "Observational study",
        paragraphs: [
          "In observational research, the investigator observes exposures or outcomes without assigning treatment. Cross-sectional, cohort and case-control designs are common examples.",
        ],
      },
      {
        heading: "What each design is good for",
        bullets: [
          "RCT: treatment efficacy or comparative intervention questions.",
          "Cohort study: prognosis, risk and change over time.",
          "Case-control study: exploring possible exposures linked with an outcome.",
          "Cross-sectional study: prevalence, characteristics and associations at one point in time.",
        ],
      },
      {
        heading: "Do not judge quality by design name alone",
        paragraphs: [
          "A poorly conducted RCT can be less useful than a carefully designed observational study. Always examine sampling, bias, measurement quality, missing data and whether the conclusions match the methods.",
        ],
      },
    ],
  },
];

export function getKnowledgeArticle(slug: string) {
  return knowledgeArticles.find((article) => article.slug === slug);
}
