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
    title: "Cardiac Rehabilitation: From Screening to Exercise Progression",
    excerpt:
      "A clinical-level guide to the structure of cardiac rehabilitation, baseline assessment, aerobic and resistance training, monitoring, progression, warning symptoms and outcome measurement.",
    category: "Cardiac Rehabilitation",
    audience: "Students",
    level: "Clinical",
    learningObjectives: [
      "Explain the core components of a modern cardiac rehabilitation programme.",
      "Structure a physiotherapy assessment around symptoms, functional capacity, haemodynamic response and risk.",
      "Use FITT principles, perceived exertion and symptom response to guide exercise prescription and progression.",
      "Recognize findings that require modification, reassessment or medical escalation rather than routine progression.",
    ],
    references: [
      {
        title: "Core Components of Cardiac Rehabilitation Programs: 2024 Update",
        organization: "American Heart Association / AACVPR",
        year: "2024",
        url: "https://professional.heart.org/en/science-news/core-components-of-cardiac-rehabilitation-programs-2024-update",
      },
      {
        title: "What is Cardiac Rehabilitation?",
        organization: "American Heart Association",
        url: "https://www.heart.org/en/health-topics/cardiac-rehab/what-is-cardiac-rehabilitation/",
      },
    ],
    readTime: "14 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. Cardiac rehabilitation is secondary prevention, not just supervised walking",
        paragraphs: [
          "Modern cardiac rehabilitation is a structured, multidisciplinary secondary-prevention programme. Exercise is one major component, but high-quality programmes also address patient assessment, cardiovascular risk factors, nutrition, body composition, psychosocial health, physical activity behaviour and measurable outcomes.",
          "For the physiotherapist, this means the exercise session should sit inside a wider clinical plan. A patient who can cycle for 15 minutes may still need blood-pressure review, education about activity pacing, support for fear of exertion, resistance training, functional goals and coordination with the wider cardiac team.",
        ],
      },
      {
        heading: "2. Start with a baseline clinical picture",
        paragraphs: [
          "Before progressing exercise, establish what the person can currently tolerate and what limits them. Review the cardiac diagnosis and procedure history, current symptoms, relevant comorbidities, medications, resting observations, mobility, habitual activity, functional goals and any previous exercise response.",
          "The assessment should answer a practical question: what level of activity can this person perform safely today, and what evidence will tell us that the next dose is appropriate?",
        ],
        bullets: [
          "Resting heart rate and blood pressure where clinically indicated.",
          "Current chest discomfort, breathlessness, palpitations, dizziness, fatigue or unusual exercise intolerance.",
          "Functional mobility and exercise capacity using an appropriate test for the setting.",
          "Musculoskeletal limitations that could change the mode of exercise.",
          "Confidence, fear of exertion and barriers to adherence.",
          "Medication effects that may alter heart-rate response or symptom interpretation.",
        ],
      },
      {
        heading: "3. Aerobic prescription: think FITT plus response",
        paragraphs: [
          "Aerobic exercise prescription can be organized using frequency, intensity, time and type, but the numbers should never be separated from the patient's clinical response. Walking, cycling and other rhythmic large-muscle activities are common choices because intensity can be adjusted and monitored.",
          "Heart rate can be useful, but it is not always sufficient on its own. Rate-limiting medication, rhythm disturbance, autonomic impairment or a poor chronotropic response can make perceived exertion and symptoms especially important.",
        ],
        bullets: [
          "Frequency: build regular exposure across the week rather than relying on occasional hard sessions.",
          "Intensity: use the prescribed clinical target, perceived exertion and symptom response together.",
          "Time: begin with a tolerable duration; intervals may be useful when continuous exercise is not yet tolerated.",
          "Type: select a mode the person can perform safely and is likely to continue.",
        ],
      },
      {
        heading: "4. Resistance training belongs in cardiac rehabilitation",
        paragraphs: [
          "Resistance exercise can support strength, physical function and independence when appropriately prescribed. The starting load should allow controlled technique and normal breathing without excessive strain. Progression is usually gradual and guided by tolerance, movement quality and the programme's medical criteria.",
          "Teach the patient to avoid breath-holding and unnecessary Valsalva-type straining. The aim is not to reproduce a gym competition environment; it is to rebuild useful strength safely and confidently.",
        ],
      },
      {
        heading: "5. Monitoring: what are you actually watching for?",
        paragraphs: [
          "Monitoring is not a ritual. Each variable should help answer whether exercise is being tolerated as expected. Depending on the person and setting, this may include heart rate, blood pressure, rhythm information, oxygen saturation, perceived exertion, dyspnoea and recovery time.",
          "A normal-looking heart rate does not overrule concerning symptoms. New or increasing chest pressure, presyncope or syncope, marked unexplained breathlessness, sustained palpitations, abnormal haemodynamic response or sudden deterioration should trigger reassessment according to the local medical pathway.",
        ],
      },
      {
        heading: "6. Progression: change one meaningful variable at a time",
        paragraphs: [
          "A common progression strategy is to establish consistent tolerance first, then increase duration, frequency or intensity according to the goal and clinical response. Increasing every variable together makes it difficult to identify what caused a problem.",
          "For a deconditioned patient, adding several minutes of walking may be more useful than immediately making the same short bout much harder. For someone who already tolerates duration well, intensity or task specificity may become the next priority.",
        ],
      },
      {
        heading: "7. Outcome measures should match the goal",
        bullets: [
          "Exercise capacity or walking tests when the goal is endurance.",
          "Sit-to-stand or other functional tasks when lower-limb function is limiting daily activity.",
          "Symptoms and perceived exertion at a standardized workload.",
          "Physical-activity behaviour and confidence, not only supervised-session performance.",
          "Programme adherence and meaningful patient goals.",
        ],
      },
      {
        heading: "8. Clinical reasoning example",
        paragraphs: [
          "A patient after coronary revascularization can walk for 10 minutes but stops because of fear, not because of chest symptoms or physiological intolerance. Simply prescribing more minutes may not solve the real barrier. Education, graded exposure, monitoring feedback and a clear home plan may be more important than changing the exercise mode.",
          "Contrast this with a patient whose exercise is limited by new exertional chest pressure. That presentation requires reassessment rather than motivational coaching or routine progression.",
        ],
      },
      {
        heading: "9. Common mistakes",
        bullets: [
          "Treating cardiac rehabilitation as exercise only.",
          "Using heart rate as the only intensity marker in every patient.",
          "Progressing load despite new warning symptoms.",
          "Ignoring resistance training and functional strength.",
          "Failing to document the patient's actual response and recovery.",
          "Giving a generic home programme without addressing adherence barriers.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Cardiac rehabilitation is safest and most effective when exercise prescription, monitoring and progression are individualized inside a broader secondary-prevention programme. The therapist should always be able to explain why today's dose is appropriate, what response is expected and what finding would make the plan change.",
        ],
      },
    ],
  },
  {
    slug: "pediatric-developmental-milestones-clinical-use",
    specialty: "Pediatrics",
    title: "Pediatric Motor Development: Milestones, Movement Quality and Clinical Reasoning",
    excerpt:
      "A clinical guide to using developmental milestones without reducing pediatric assessment to a checklist: movement quality, symmetry, red flags, family concerns and when deeper assessment is needed.",
    category: "Development",
    audience: "Students",
    level: "Clinical",
    learningObjectives: [
      "Use developmental milestones as reference points rather than rigid pass-or-fail deadlines.",
      "Assess movement quality, symmetry, variability and participation alongside milestone timing.",
      "Recognize developmental patterns that should trigger broader neurological or pediatric assessment.",
      "Explain why standardized assessment tools are more informative than milestone age alone.",
    ],
    references: [
      {
        title: "Early Detection of Cerebral Palsy Care Pathway",
        organization: "American Academy for Cerebral Palsy and Developmental Medicine",
        url: "https://www.aacpdm.org/publications/care-pathways/early-detection-of-cerebral-palsy",
      },
      {
        title: "Developmental Milestones",
        organization: "Centers for Disease Control and Prevention",
        url: "https://www.cdc.gov/ncbddd/actearly/milestones/index.html",
      },
    ],
    readTime: "13 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. A milestone is a reference point, not the whole examination",
        paragraphs: [
          "Developmental milestones help clinicians describe when common skills tend to emerge, but they should not be used as a rigid race between children. A child can reach a skill later than another child and still show a healthy developmental pattern, while another child may achieve a milestone on time but use a persistently asymmetric or inefficient strategy that deserves attention.",
          "The physiotherapist therefore asks two questions: has the skill emerged, and how is the child performing it?",
        ],
      },
      {
        heading: "2. Observe the quality of movement",
        bullets: [
          "Symmetry: does the child consistently use one side differently from the other?",
          "Variability: can the child solve a movement task in more than one way?",
          "Postural control: how are head, trunk and pelvis organized during movement?",
          "Selective control: can the child move one body segment without excessive mass-pattern movement?",
          "Transitions: how does the child move between lying, sitting, kneeling, standing and walking?",
          "Participation: does the movement limitation actually restrict play, exploration or family routines?",
        ],
      },
      {
        heading: "3. Build the developmental history",
        paragraphs: [
          "Ask about pregnancy and birth history, prematurity, neonatal complications, feeding, vision and hearing concerns, previous developmental progress, regression, family observations and the child's opportunity to move and play.",
          "Corrected age is important when interpreting early development in children born preterm. The clinical picture should also consider medical and environmental factors rather than assigning every delay to a neuromotor disorder.",
        ],
      },
      {
        heading: "4. Red flags are patterns, not a single late skill",
        paragraphs: [
          "Loss of an acquired skill is more concerning than simply acquiring a new skill later than expected. Persistent marked asymmetry, unusual stiffness or floppiness, poor head control beyond the expected developmental window, early strong hand preference, abnormal movement repertoire or a cluster of delays may justify further assessment.",
          "Parental concern should be taken seriously. Families observe the child across many more hours and contexts than the clinician sees in one appointment.",
        ],
      },
      {
        heading: "5. When cerebral palsy is a concern",
        paragraphs: [
          "For infants at risk of cerebral palsy, specialist pathways combine neurological examination with validated tools rather than waiting for a traditional milestone delay to become obvious. The AACPDM early-detection pathway highlights combinations of General Movements Assessment, neuroimaging and age-appropriate standardized motor assessment in high-risk infants.",
          "The important clinical lesson is that early detection should be active and evidence-based. 'Wait and see' is not a neutral strategy when a high-risk pattern is already present.",
        ],
      },
      {
        heading: "6. Standardized measures add structure",
        paragraphs: [
          "A standardized tool helps document motor ability, compare performance over time and communicate findings with the wider team. The choice depends on age, diagnosis, clinical setting and the question being asked.",
          "The score is useful, but the therapist should still document how the child performs the task, what assistance is needed and whether the change is meaningful in daily life.",
        ],
      },
      {
        heading: "7. Treatment should target participation, not a milestone chart",
        paragraphs: [
          "Therapy is more meaningful when it helps the child access play, mobility, family routines and age-appropriate participation. Practice can be embedded into transitions, reaching, floor mobility, standing, walking and play rather than delivered as isolated exercises only.",
          "Parent coaching is central: a short clinic session cannot replace the learning opportunities available throughout the child's normal day.",
        ],
      },
      {
        heading: "8. Clinical reasoning example",
        paragraphs: [
          "A 10-month-old child is not yet crawling. If the child moves around efficiently by bottom-shuffling, uses both sides symmetrically, transitions independently, has good trunk control and continues to gain skills, the absence of crawling alone may be less concerning.",
          "If the same child shows persistent unilateral fisting, clear asymmetry, poor sitting reactions and little developmental progression, the reasoning changes. The concern comes from the pattern, not from the single missing milestone.",
        ],
      },
      {
        heading: "9. Common mistakes",
        bullets: [
          "Treating milestone tables as diagnostic tests.",
          "Ignoring corrected age in premature infants.",
          "Focusing on skill timing while missing abnormal movement quality.",
          "Waiting for severe delay before acting on a high-risk neurological pattern.",
          "Designing therapy around isolated exercises without family goals or play.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Pediatric physiotherapy assessment combines milestone timing with movement quality, symmetry, standardized assessment, developmental history and participation. The strongest clinical reasoning comes from recognizing patterns over time, not checking a single box.",
        ],
      },
    ],
  },
  {
    slug: "return-to-sport-after-injury",
    specialty: "Sports",
    title: "Return to Sport After Injury: A Criterion-Based Decision Process",
    excerpt:
      "Return to sport is a continuum from participation to full performance. Learn how symptoms, capacity, sport demands, psychology and risk are combined in a defensible clinical decision.",
    category: "Return to Sport",
    audience: "Students",
    level: "Advanced",
    learningObjectives: [
      "Describe return to participation, return to sport and return to performance as different stages.",
      "Build a return-to-sport plan around criteria rather than time alone.",
      "Match rehabilitation testing to the actual physical and psychological demands of the sport.",
      "Recognize why shared decision-making and risk tolerance matter at the final stages of rehabilitation.",
    ],
    references: [
      {
        title: "2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern",
        organization: "British Journal of Sports Medicine",
        year: "2016",
        url: "https://bjsm.bmj.com/content/50/14/853",
      },
    ],
    readTime: "14 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. Return to sport is a continuum",
        paragraphs: [
          "The Bern consensus describes return to sport as a process rather than a single clearance moment. A useful framework separates return to participation, return to sport and return to performance.",
          "An athlete may be back in modified training but not ready for unrestricted competition. Another may have returned to competition but still be below pre-injury performance. Calling both situations simply 'returned' hides clinically important differences.",
        ],
      },
      {
        heading: "2. Start by defining the destination",
        paragraphs: [
          "Return criteria depend on the actual sport, position, level and role. A recreational runner, a football winger and a competitive powerlifter do not require the same capacity even if they share the same diagnosis.",
          "Before testing readiness, define what successful return means for this athlete: full training, match minutes, unrestricted cutting, sprinting, throwing volume, competition performance or another specific goal.",
        ],
      },
      {
        heading: "3. Time is context, not the only criterion",
        paragraphs: [
          "Biological healing time matters, but time alone does not prove readiness. The athlete may still have deficits in strength, power, endurance, reactive control, confidence or sport-specific load tolerance.",
          "The opposite is also true: passing one functional test early does not overrule tissue-healing constraints or medical restrictions. Return decisions combine time, biology, capacity and context.",
        ],
      },
      {
        heading: "4. Build a demand profile",
        bullets: [
          "What are the peak running, sprinting or change-of-direction demands?",
          "Does the sport require jumping, landing, tackling, throwing or contact?",
          "How long must high performance be repeated before fatigue changes technique?",
          "What is the athlete's position-specific workload?",
          "What environmental or competition factors increase risk?",
        ],
      },
      {
        heading: "5. Test the qualities that matter",
        paragraphs: [
          "Range of motion, strength and simple hop tests can be useful, but the test battery should reflect the sport. A low-demand test should not be used to justify return to a high-demand environment.",
          "Where relevant, assess strength, rate of force development, hop or jump performance, running exposure, deceleration, cutting, repeated efforts, fatigue response and sport-specific skill. Interpretation should include movement strategy and symptoms, not only a percentage score.",
        ],
      },
      {
        heading: "6. Exposure progression",
        paragraphs: [
          "A practical progression often moves from rehabilitation exercise to controlled sport drills, then modified training, full training and competition. The athlete should tolerate each stage before the next stage is added.",
          "Load can be progressed through volume, intensity, speed, complexity, unpredictability, contact and fatigue. Increasing all of these simultaneously removes the ability to identify which demand exceeded capacity.",
        ],
      },
      {
        heading: "7. Psychological readiness is part of readiness",
        paragraphs: [
          "Fear of reinjury, low confidence and hesitation can alter movement and participation. Psychological readiness should be discussed openly rather than assumed from physical test scores.",
          "Graded exposure to feared but necessary sport tasks can be integrated into rehabilitation while preserving safety and objective progression.",
        ],
      },
      {
        heading: "8. Shared decision-making and risk tolerance",
        paragraphs: [
          "Return-to-sport decisions involve the athlete, clinicians and relevant performance staff. Different stakeholders may tolerate different levels of risk, especially when competition pressure is high.",
          "The clinician's role is to make the known risks and uncertainties explicit, document the athlete's current capacity and protect health when participation would be unsafe.",
        ],
      },
      {
        heading: "9. Example progression",
        bullets: [
          "Stage 1: pain and swelling controlled; restore basic range and strength.",
          "Stage 2: rebuild force capacity and general conditioning.",
          "Stage 3: introduce running, jumping or sport-specific patterns.",
          "Stage 4: increase speed, reactive demand and repeated efforts.",
          "Stage 5: modified team or sport training.",
          "Stage 6: unrestricted training with adequate recovery.",
          "Stage 7: competition exposure and return-to-performance monitoring.",
        ],
      },
      {
        heading: "10. Common mistakes",
        bullets: [
          "Clearing an athlete because the calendar date has arrived.",
          "Using one test as a universal pass/fail decision.",
          "Ignoring fatigue and repeated-effort capacity.",
          "Skipping the transition through training before competition.",
          "Ignoring confidence, fear and athlete preference.",
          "Failing to document the specific sport demands used to justify clearance.",
        ],
      },
      {
        heading: "Advanced takeaway",
        paragraphs: [
          "A defensible return-to-sport decision is criterion-based, sport-specific and shared. The question is not 'Is the injury healed?' but 'Does the athlete currently have enough biological, physical and psychological capacity for the demands and risk of the next stage?'",
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
    title: "Progressive Overload in Rehabilitation: Dose, Adaptation and Clinical Progression",
    excerpt:
      "A clinical guide to choosing load, reps, sets, frequency and progression using goals, RPE/RIR, tissue response and the difference between strength, hypertrophy, power and endurance.",
    category: "Exercise Prescription",
    audience: "Students",
    level: "Advanced",
    learningObjectives: [
      "Explain progressive overload as a principle of adaptation rather than simply adding weight.",
      "Match resistance-training variables to strength, hypertrophy, power, endurance and functional goals.",
      "Use RPE, repetitions in reserve and symptom response to individualize load when percentage-based prescription is impractical.",
      "Progress or regress exercise without changing multiple variables blindly.",
    ],
    references: [
      {
        title: "Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults",
        organization: "American College of Sports Medicine",
        year: "2026",
        url: "https://acsm.org/resistance-training-guidelines-update-2026/",
      },
      {
        title: "5 Things to Know About Creating an Effective Resistance Training Plan",
        organization: "American College of Sports Medicine",
        year: "2026",
        url: "https://acsm.org/effective-resistance-training-program-infographic/",
      },
    ],
    readTime: "15 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. Progressive overload is an adaptation principle",
        paragraphs: [
          "The body adapts when training demand is high enough to challenge current capacity and recovery is sufficient. Once the same task becomes easy, the training stimulus may no longer be large enough to continue producing the desired adaptation.",
          "Overload does not mean 'add weight every session'. It means progressively increasing the relevant demand: force, volume, speed, range, duration, complexity, frequency or task specificity.",
        ],
      },
      {
        heading: "2. Start with the goal: what are you trying to adapt?",
        paragraphs: [
          "A strength programme, an endurance programme and a power programme may use the same exercise with very different prescriptions. The clinical mistake is choosing sets and reps from habit rather than from the patient's goal.",
        ],
        bullets: [
          "Strength: prioritize the ability to produce high force.",
          "Hypertrophy: prioritize sufficient weekly training volume and effort.",
          "Power: develop force quickly, using appropriate loads and high movement intent.",
          "Muscular endurance: improve repeated-force capacity over time.",
          "Functional rehabilitation: transfer the gained capacity into the task the patient actually needs.",
        ],
      },
      {
        heading: "3. What current ACSM guidance adds",
        paragraphs: [
          "The 2026 ACSM position stand emphasizes that consistent resistance training matters more than complicated programming for most healthy adults. It also reinforces goal-specific prescription rather than a one-size-fits-all routine.",
          "For healthy adults, ACSM highlights heavier loading for maximal strength, greater weekly volume for hypertrophy, and moderate loads moved with high concentric intent for power. Rehabilitation populations may need modified starting points based on pathology, irritability, surgery, age, comorbidity and current capacity.",
        ],
      },
      {
        heading: "4. RPE and repetitions in reserve",
        paragraphs: [
          "Percentage of one-repetition maximum can be useful, but it is not always practical in clinical rehabilitation. Rating of perceived exertion and repetitions in reserve provide flexible ways to judge how difficult a set was.",
          "If a patient completes a set and could comfortably perform many more repetitions, the load may be too low for a strength-focused goal. If every set reaches uncontrolled technique or complete failure, the programme may be unnecessarily fatiguing.",
        ],
      },
      {
        heading: "5. The progression toolbox",
        bullets: [
          "Resistance: increase external load.",
          "Volume: increase repetitions or sets.",
          "Range: train through a greater safe range of motion.",
          "Tempo: alter time under tension or movement speed.",
          "Frequency: add another weekly exposure when recovery allows.",
          "Support: reduce hand support or external assistance.",
          "Stability demand: change base of support only when it serves the goal.",
          "Velocity: increase movement speed when power or sport demand requires it.",
          "Specificity: make the task look more like the patient's real activity.",
        ],
      },
      {
        heading: "6. Change one important variable, then observe",
        paragraphs: [
          "Changing load, sets, frequency and range at the same time can turn progression into guesswork. A more clinical approach is to change one major variable, observe performance and recovery, then decide whether the next exposure should progress, stay the same or regress.",
          "This is especially useful in painful or post-operative rehabilitation, where the response over the next day or two may be as informative as the response during the session.",
        ],
      },
      {
        heading: "7. Symptom response: pain is information, not an automatic stop signal",
        paragraphs: [
          "Some rehabilitation programmes allow mild, tolerable symptoms during exercise, while others require stricter protection because of tissue healing or medical risk. The acceptable response therefore depends on diagnosis, stage, irritability and the treating team's precautions.",
          "A useful reasoning framework is to monitor symptom intensity, movement quality, whether symptoms settle after the exercise, and whether function is worse at the next meaningful time point. Persistent escalation suggests the dose needs review.",
        ],
      },
      {
        heading: "8. Progression example: knee extensor weakness",
        paragraphs: [
          "Suppose a patient can perform three sets of 10 sit-to-stands from a high chair with good control and low effort. Instead of immediately adding many more repetitions, the therapist might lower the chair slightly or add external resistance if the goal is strength.",
          "If the same patient cannot maintain knee control after six repetitions, adding load is not the next step. The current task may need fewer repetitions, more rest or a simpler starting position so useful force can be produced with quality.",
        ],
      },
      {
        heading: "9. Regression is not failure",
        bullets: [
          "Reduce load when technique deteriorates.",
          "Reduce range when the current range exceeds tissue tolerance.",
          "Increase external support when balance limits the target muscle stimulus.",
          "Reduce volume during symptom flare or inadequate recovery.",
          "Use intervals or shorter bouts when endurance limits quality.",
        ],
      },
      {
        heading: "10. Common mistakes",
        bullets: [
          "Using 3 × 10 for every goal and every patient.",
          "Progressing because the calendar changed rather than because capacity changed.",
          "Confusing instability with useful overload.",
          "Chasing fatigue instead of the target adaptation.",
          "Ignoring sleep, recovery, nutrition, disease status or total weekly load.",
          "Stopping progression indefinitely because the patient once had pain.",
        ],
      },
      {
        heading: "11. Clinical decision rule",
        paragraphs: [
          "Ask four questions after each training block: Was the target tissue or task challenged? Was technique acceptable? Was the response tolerable during and after the session? Has performance improved enough that the same dose is no longer challenging?",
          "If the answer to the first three is yes and the fourth shows adaptation, progression is reasonable. If quality or recovery is poor, hold or regress before adding more demand.",
        ],
      },
      {
        heading: "Advanced takeaway",
        paragraphs: [
          "Progressive overload is not a recipe. It is a feedback loop: define the adaptation, choose a measurable dose, observe performance and recovery, then adjust one meaningful variable. That is what turns exercise prescription into clinical reasoning.",
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
