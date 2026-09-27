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
    title: "Central Sensitization and Nociplastic Pain: Clinical Reasoning Beyond 'Pain = Damage'",
    excerpt:
      "A deeper pain-science lesson on sensitization, nociplastic pain, allodynia, hyperalgesia, clinical inference and how these concepts change rehabilitation planning.",
    category: "Pain Science",
    audience: "Students",
    level: "Advanced",
    learningObjectives: [
      "Define sensitization, central sensitization and nociplastic pain using current IASP terminology.",
      "Explain why clinical signs can suggest sensitization without directly measuring central nervous system neurons.",
      "Differentiate nociceptive, neuropathic and nociplastic pain mechanisms while recognizing that mixed presentations are common.",
      "Translate pain-mechanism reasoning into communication, pacing, graded activity and rehabilitation decisions.",
    ],
    references: [
      {
        title: "IASP Pain Terminology",
        organization: "International Association for the Study of Pain",
        url: "https://www.iasp-pain.org/resources/terminology/",
      },
      {
        title: "The concept of nociplastic pain—where to from here?",
        organization: "International Association for the Study of Pain / PAIN",
        year: "2024",
        url: "https://www.iasp-pain.org/publications/pain-research-forum/papers-of-the-week/paper/the-concept-of-nociplastic-pain-where-to-from-here/",
      },
    ],
    readTime: "14 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. Start with the language",
        paragraphs: [
          "IASP defines sensitization as increased responsiveness of nociceptive neurons to normal input and/or recruitment of a response to normally subthreshold input. Central sensitization specifically refers to increased responsiveness of nociceptive neurons in the central nervous system.",
          "This distinction matters because central sensitization is a neurophysiological phenomenon. In routine clinical practice, we do not directly measure central nociceptive neuron firing; we infer altered sensitivity from the broader pattern of symptoms and examination findings.",
        ],
      },
      {
        heading: "2. Nociplastic pain is related, but not identical",
        paragraphs: [
          "Nociplastic pain is a mechanistic descriptor for pain arising from altered nociception when the presentation is not adequately explained by clear tissue damage activating peripheral nociceptors or by a lesion/disease of the somatosensory system.",
          "A person can have mixed mechanisms. For example, osteoarthritis-related nociceptive input may coexist with widespread hypersensitivity and sleep disturbance. Avoid forcing every patient into a single mechanism box.",
        ],
      },
      {
        heading: "3. Clinical features that may raise suspicion",
        bullets: [
          "Pain distribution broader than a single local tissue pattern.",
          "Allodynia: pain in response to normally non-painful stimuli.",
          "Hyperalgesia: an exaggerated response to a painful stimulus.",
          "Symptoms disproportionate to the expected local tissue behaviour.",
          "Multiple areas of pain or variable symptom distribution.",
          "Poor sleep, fatigue, cognitive symptoms or heightened sensitivity to other sensory inputs in some patients.",
        ],
      },
      {
        heading: "4. What these signs do not prove",
        paragraphs: [
          "Tenderness, widespread pain or a high pain score does not by itself prove central sensitization. Fear, poor sleep, acute inflammation, neuropathic pain, systemic illness and other factors can also alter sensitivity and behaviour.",
          "The reasoning must remain differential: first ask whether there is a specific pathology, neurological lesion, inflammatory disorder or other condition that better explains the presentation.",
        ],
      },
      {
        heading: "5. Why pain intensity can exceed apparent tissue damage",
        paragraphs: [
          "Pain is influenced by nociceptive input, previous experience, threat, attention, context, sleep, mood and the state of the nervous system. This does not make pain 'psychological' or imaginary. It means pain is a protective output shaped by multiple systems.",
          "This also explains why imaging severity and pain severity often do not map perfectly to each other. Imaging findings can still matter, but they should be interpreted in the context of history, examination and function.",
        ],
      },
      {
        heading: "6. Assessment: think pattern, not one special test",
        bullets: [
          "Map the pain distribution and variability.",
          "Ask about sleep, fatigue, activity tolerance and recovery.",
          "Screen neurological signs when neuropathic mechanisms are possible.",
          "Look for local nociceptive drivers that may still be modifiable.",
          "Assess fear, avoidance and confidence where relevant.",
          "Track function and participation, not only pain intensity.",
        ],
      },
      {
        heading: "7. Rehabilitation implications",
        paragraphs: [
          "When sensitivity is high, aggressive tissue-focused treatment can become counterproductive if it repeatedly confirms the message that the body is fragile. Rehabilitation often works better when it combines understandable pain education, graded activity, exercise, pacing and restoration of valued function.",
          "This does not mean ignoring local tissue impairments. Strength, mobility and conditioning still matter; the difference is that the plan is framed around improving capacity and reducing threat rather than repeatedly searching for a single painful structure.",
        ],
      },
      {
        heading: "8. Graded activity is not 'do less forever'",
        paragraphs: [
          "Pacing is useful when it creates a repeatable baseline from which activity can gradually expand. The goal is not permanent avoidance of symptoms, but a controlled return to meaningful activity with enough recovery to permit progression.",
          "A flare does not automatically mean damage occurred. The therapist should examine whether the progression was too large, recovery was inadequate, another stressor changed the response or a different pathology needs reconsideration.",
        ],
      },
      {
        heading: "9. Communication matters",
        bullets: [
          "Validate the pain experience without equating pain intensity with tissue destruction.",
          "Avoid language such as 'your spine is worn out' or 'your nervous system is broken'.",
          "Explain that sensitivity can change and capacity can be retrained.",
          "Use the patient's own goals to guide progression.",
          "Be clear when uncertainty exists rather than inventing a structural explanation.",
        ],
      },
      {
        heading: "10. Clinical reasoning example",
        paragraphs: [
          "A patient with persistent low-back pain reports pain spreading to multiple regions, sensitivity to light pressure, poor sleep, fatigue and avoidance of activity after repeated reassurance that imaging shows no dangerous pathology. A purely local manual-therapy strategy may miss the larger problem.",
          "A stronger plan may combine graded strengthening and walking exposure, sleep and activity education, confidence-building, symptom monitoring and treatment of any specific local impairments that remain relevant.",
        ],
      },
      {
        heading: "Advanced takeaway",
        paragraphs: [
          "Central sensitization is a neurophysiological concept inferred clinically, while nociplastic pain is a pain-mechanism descriptor. The practical value of both concepts is not in labelling the patient; it is in recognizing when a narrow tissue-only model fails to explain the presentation and when rehabilitation needs to target sensitivity, capacity, behaviour and function together.",
        ],
      },
    ],
  },
  {
    slug: "sciatica-red-flags-when-to-seek-care",
    specialty: "Musculoskeletal (MSK)",
    title: "Low Back Pain and Sciatica: Assessment, Red Flags and Evidence-Informed Management",
    excerpt:
      "A clinical guide to differentiating uncomplicated low-back pain and radicular symptoms from serious pathology, deciding when imaging matters, and planning evidence-informed rehabilitation.",
    category: "Spine & Radicular Pain",
    audience: "Students",
    level: "Clinical",
    learningObjectives: [
      "Separate common low-back pain and sciatica presentations from features suggesting serious pathology.",
      "Explain why routine imaging is usually unnecessary in non-specialist care.",
      "Use history, neurological examination and function to guide referral and rehabilitation.",
      "Describe the role of self-management, exercise, manual therapy and psychosocial factors in evidence-informed care.",
    ],
    references: [
      {
        title: "Low back pain and sciatica in over 16s: assessment and management (NG59)",
        organization: "NICE",
        url: "https://www.nice.org.uk/guidance/NG59/chapter/recommendations",
      },
      {
        title: "Suspected neurological conditions: recognition and referral (NG127)",
        organization: "NICE",
        url: "https://www.nice.org.uk/guidance/ng127/chapter/Recommendations-for-adults-aged-over-16",
      },
    ],
    readTime: "14 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. First decide whether this is a routine MSK presentation",
        paragraphs: [
          "Most episodes of low-back pain are not caused by dangerous pathology. The first job is therefore not to identify the exact painful spinal structure; it is to decide whether the presentation fits common mechanical or radicular pain, or whether features suggest infection, fracture, cancer, inflammatory disease or serious neurological compromise.",
          "This triage decision changes everything: a routine rehabilitation plan is appropriate only after important red flags have been considered in context.",
        ],
      },
      {
        heading: "2. Sciatica is a symptom pattern, not an imaging diagnosis",
        paragraphs: [
          "Sciatica usually refers to leg pain related to irritation or compromise of a lumbosacral nerve root. Symptoms may include radiating pain, paraesthesia, sensory change, weakness or altered reflexes.",
          "The clinical picture should be built from symptom distribution and neurological examination. Imaging findings such as disc bulges are common and should not automatically be assumed to explain the patient's symptoms.",
        ],
      },
      {
        heading: "3. Red flags that need urgent thinking",
        bullets: [
          "New bladder or bowel dysfunction with back/leg symptoms.",
          "New saddle or perineal sensory disturbance.",
          "Rapidly progressive or severe neurological weakness.",
          "Major trauma or fracture risk, including bone fragility.",
          "History or features raising concern for malignancy, infection or systemic disease.",
          "Constitutional illness, fever or unexplained deterioration when clinically relevant.",
        ],
      },
      {
        heading: "4. Cauda equina pattern: do not manage as routine physiotherapy",
        paragraphs: [
          "The combination of severe low-back or leg symptoms with new bladder, bowel or sexual dysfunction and/or perineal numbness requires immediate assessment through an appropriate emergency pathway. The physiotherapist's role is recognition and escalation, not trialling a routine exercise programme first.",
        ],
      },
      {
        heading: "5. Neurological examination",
        bullets: [
          "Myotomal strength relevant to the suspected nerve root.",
          "Dermatomal or clinically meaningful sensory testing.",
          "Reflexes where appropriate.",
          "Neural mechanosensitivity tests interpreted alongside the rest of the examination.",
          "Walking, heel/toe function and functional weakness.",
          "Change over time: stable mild deficit is different from rapidly progressive weakness.",
        ],
      },
      {
        heading: "6. Imaging: ask whether the result will change management",
        paragraphs: [
          "NICE advises against routine imaging in non-specialist settings for low-back pain with or without sciatica. Imaging is more useful when serious pathology is suspected or when a specialist decision depends on the result.",
          "A scan can identify anatomy, but it does not replace clinical reasoning. The key question is not 'Can we see a disc change?' but 'Does the imaging finding fit the symptoms and alter the treatment pathway?'",
        ],
      },
      {
        heading: "7. Self-management and activity",
        paragraphs: [
          "Education should support continued normal activity as far as possible, reduce unnecessary fear and explain the expected course. Prolonged avoidance can contribute to deconditioning and loss of confidence.",
          "Exercise should be selected according to the person's needs, preferences and capabilities rather than because one universal exercise is believed to 'put the disc back'.",
        ],
      },
      {
        heading: "8. Manual therapy: an adjunct, not the entire plan",
        paragraphs: [
          "NICE allows manual therapy as part of a package that includes exercise, with or without a psychological approach. That wording is important: passive treatment should not replace active rehabilitation, education and restoration of function.",
        ],
      },
      {
        heading: "9. Psychosocial obstacles can change recovery",
        paragraphs: [
          "Fear of movement, low confidence, catastrophizing, work concerns and previous failed treatment can influence disability and recovery. These factors do not make the pain imaginary; they are part of the clinical context and may justify a combined physical and psychologically informed rehabilitation approach.",
        ],
      },
      {
        heading: "10. Clinical reasoning example",
        paragraphs: [
          "A patient with unilateral leg pain, reduced ankle reflex and sensory change that fit a nerve-root pattern but no progressive weakness or bladder/bowel symptoms may be managed conservatively with education, activity and individualized exercise while monitoring neurological status.",
          "A second patient with similar pain but new urinary difficulty and saddle numbness belongs on an urgent referral pathway. The leg-pain label is the same, but the management is completely different because the risk profile is different.",
        ],
      },
      {
        heading: "11. Common mistakes",
        bullets: [
          "Ordering imaging simply because pain is severe.",
          "Using one positive neural tension test as the diagnosis.",
          "Ignoring progression of weakness.",
          "Giving bed rest or excessive activity restriction without a clear reason.",
          "Using passive treatment indefinitely without functional progression.",
          "Missing psychosocial barriers that are maintaining disability.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Good spine care begins with triage, then neurological and functional reasoning, then an active management plan. The therapist should know what would make them continue conservative care, what would make them modify it and what would make them urgently escalate.",
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
    title: "Falls in Older Adults: Assessment, Risk Stratification and Physiotherapy Management",
    excerpt:
      "A multifactorial, advanced guide to fall-risk assessment, balance and gait testing, progressive exercise, environmental contributors, confidence and clinical escalation.",
    category: "Falls Prevention",
    audience: "Students",
    level: "Advanced",
    learningObjectives: [
      "Use a multifactorial model rather than a single balance test to assess fall risk.",
      "Connect examination findings to individualized balance, strength, gait and environmental interventions.",
      "Recognize when medication, cardiovascular, neurological or visual contributors require wider-team input.",
      "Design progression that challenges balance safely instead of prescribing generic low-level exercise.",
    ],
    references: [
      {
        title: "Physical Therapy Management of Fall Risk in Community-Dwelling Older Adults",
        organization: "APTA Geriatrics",
        year: "2025",
        url: "https://www.apta.org/patient-care/evidence-based-practice-resources/cpgs/physical-therapy-management-of-fall-risk-in-community-dwelling-older-adults",
      },
      {
        title: "Physical activity and sedentary behaviour: a brief to support older people",
        organization: "World Health Organization",
        year: "2022",
        url: "https://www.who.int/publications/b/67181",
      },
    ],
    readTime: "14 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. A fall is an event; fall risk is a system problem",
        paragraphs: [
          "Falls often emerge from several interacting factors: lower-limb weakness, impaired balance reactions, gait variability, reduced vision, medication effects, footwear, environmental hazards, fear, cognition or acute illness.",
          "Because the causes are multifactorial, one test cannot represent the entire risk profile. The purpose of assessment is to identify modifiable contributors and the situations in which the person is most likely to lose stability.",
        ],
      },
      {
        heading: "2. History is part of the balance assessment",
        bullets: [
          "Number of falls and near-falls in the past year.",
          "Where and when the falls happened.",
          "What the person was doing immediately before the fall.",
          "Dizziness, syncope, palpitations or loss of consciousness.",
          "Use of walking aids and whether they were being used at the time.",
          "Fear of falling and activity restriction.",
          "Medication changes, acute illness and visual problems.",
        ],
      },
      {
        heading: "3. Examine the movement system",
        paragraphs: [
          "Assessment should sample the capacities needed in daily life: rising from a chair, initiating gait, turning, changing speed, stepping over obstacles, reaching outside the base of support and recovering from perturbation.",
          "Static standing alone may look good even when the patient becomes unstable during turning or dual-task walking. Testing should therefore reflect the situations in which the patient actually falls or feels unsafe.",
        ],
      },
      {
        heading: "4. Outcome measures: choose them for a reason",
        bullets: [
          "Timed mobility tests can quantify transfer and walking efficiency.",
          "Sit-to-stand tests can reflect lower-limb functional strength.",
          "Walking-speed measures help track mobility change.",
          "Structured balance scales can document multidimensional balance performance.",
          "Patient-reported fear or confidence measures can capture avoidance that performance tests miss.",
        ],
      },
      {
        heading: "5. Balance training must actually challenge balance",
        paragraphs: [
          "Exercises that are easy enough to perform automatically may not provide enough stimulus. Balance training can be progressed by narrowing the base of support, reducing hand support, changing surface or visual input, adding reaching or stepping, increasing speed, introducing turns or adding safe dual-task demands.",
          "Challenge must remain controlled. The therapist should manipulate the difficulty while preserving an environment in which loss of balance can be safely managed.",
        ],
      },
      {
        heading: "6. Strength and power matter",
        paragraphs: [
          "Repeated chair rise, stair control and protective stepping all require lower-limb force. Progressive resistance exercise can therefore be an important component of fall-prevention programmes when weakness is present.",
          "For some older adults, speed of force production is also relevant because a protective step must occur quickly. Power-oriented progression may be appropriate once a safe strength base and medical suitability are established.",
        ],
      },
      {
        heading: "7. Walking aids: prescribe and train, do not just hand one over",
        paragraphs: [
          "An aid that is the wrong height, poorly sequenced or abandoned indoors may not reduce risk. Check fit, hand placement, turning, thresholds, stairs where relevant and whether the person can use the device under real-life conditions.",
        ],
      },
      {
        heading: "8. The home and the wider team",
        paragraphs: [
          "Loose rugs, poor lighting, cluttered pathways and difficult bathroom transfers may be modifiable. Medication review, vision assessment, cardiovascular review or neurological assessment may also be needed when the history suggests contributors outside physiotherapy.",
        ],
      },
      {
        heading: "9. Clinical reasoning example",
        paragraphs: [
          "An older adult performs well on quiet standing but reports repeated falls when turning quickly at night. The meaningful assessment should therefore include turning, low-light/environmental factors, footwear, urgency, medication and gait under divided attention rather than repeating static balance practice alone.",
        ],
      },
      {
        heading: "10. Common mistakes",
        bullets: [
          "Using one screening score as the entire diagnosis.",
          "Prescribing balance exercises that never become challenging.",
          "Ignoring medication, syncope or vision-related contributors.",
          "Failing to ask about near-falls.",
          "Focusing on fear reduction without rebuilding physical capacity.",
          "Progressing unsafely without an appropriate guarding strategy.",
        ],
      },
      {
        heading: "Advanced takeaway",
        paragraphs: [
          "Falls prevention is individualized risk reduction. Assessment should identify why this person falls in this context, and treatment should progressively train the exact capacities that are modifiable while coordinating non-physiotherapy contributors with the wider team.",
        ],
      },
    ],
  },
  {
    slug: "pelvic-floor-rehabilitation-basics",
    specialty: "Women's & Pelvic Health",
    title: "Pelvic Floor Rehabilitation: Assessment, Coordination and Individualized Training",
    excerpt:
      "A clinical guide to pelvic-floor function, contraction and relaxation, symptom patterns, supervised training, pressure management, progression and common mistakes.",
    category: "Pelvic Health",
    audience: "Students",
    level: "Clinical",
    learningObjectives: [
      "Explain the roles of the pelvic floor in continence, support, pressure management and sexual function.",
      "Differentiate weakness from overactivity, poor relaxation and coordination problems.",
      "Understand why supervised pelvic-floor muscle training begins with assessment of contraction and relaxation.",
      "Integrate breathing, pressure management and functional progression into rehabilitation.",
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
        url: "https://www.nice.org.uk/guidance/ng123/chapter/recommendations",
      },
    ],
    readTime: "13 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. The pelvic floor must contract, relax and coordinate",
        paragraphs: [
          "The pelvic floor contributes to continence, pelvic-organ support, pressure management and sexual function. Function depends not only on strength but also on timing, endurance, relaxation and coordination with breathing and trunk activity.",
          "A patient can therefore have pelvic-floor symptoms despite having muscles that feel 'tight' or strong. The question is not simply whether the muscles can contract; it is whether they can perform the right action at the right time.",
        ],
      },
      {
        heading: "2. Symptoms do not tell you the muscle state automatically",
        paragraphs: [
          "Urinary leakage may reflect weakness or poor timing, but pelvic pain, urgency or difficulty emptying can coexist with overactivity or poor relaxation. Symptoms should guide assessment rather than trigger an automatic strengthening programme.",
        ],
      },
      {
        heading: "3. What assessment is trying to establish",
        bullets: [
          "Can the patient identify and perform a pelvic-floor contraction?",
          "Can the patient fully relax after contraction?",
          "Is there pain, guarding or breath-holding?",
          "How is endurance across repeated contractions?",
          "Does coughing, lifting or impact reveal a timing problem?",
          "Are bowel, bladder, prolapse, sexual or pain symptoms present?",
          "What functional activities matter most to the patient?",
        ],
      },
      {
        heading: "4. Supervised training should be individualized",
        paragraphs: [
          "NICE recommends that pelvic-floor muscle training programmes be supervised by an appropriately trained physiotherapist or healthcare professional and tailored to the person's ability to contract and relax, discomfort, needs and goals.",
          "This supports a key clinical principle: the prescription comes after confirming what the patient can actually do.",
        ],
      },
      {
        heading: "5. Strength, endurance and timing are different targets",
        paragraphs: [
          "A programme designed for force production may differ from one designed for endurance or pre-contraction before a cough. The therapist should identify the functional deficit and select the contraction pattern accordingly.",
          "Quality matters. Repeated compensatory gluteal, abdominal or breath-holding strategies can make the exercise look successful while the target coordination remains poor.",
        ],
      },
      {
        heading: "6. When relaxation is the priority",
        paragraphs: [
          "For a patient with pain, guarding or difficulty relaxing, more forceful contractions may be the wrong direction. Down-training may include awareness, diaphragmatic breathing, comfortable positions, graded exposure and learning to reduce unnecessary pelvic-floor activation.",
        ],
      },
      {
        heading: "7. Pressure management",
        paragraphs: [
          "Breathing and pelvic-floor function interact with abdominal pressure during lifting, coughing and exercise. Rehabilitation may therefore include coordinated exhalation, trunk strategy and graded exposure to the actual task that provokes symptoms.",
          "The goal is not to teach permanent bracing. It is to help the patient manage pressure efficiently while returning to normal activity.",
        ],
      },
      {
        heading: "8. Progression back to function",
        bullets: [
          "Move from awareness to reliable contraction and relaxation.",
          "Build endurance or force according to the deficit.",
          "Add functional positions such as standing.",
          "Integrate coughing, lifting or impact when relevant.",
          "Progress toward the patient's real activity, sport or occupational goal.",
        ],
      },
      {
        heading: "9. Common mistakes",
        bullets: [
          "Prescribing 'Kegels' before assessing relaxation ability.",
          "Using the same set/rep prescription for every symptom.",
          "Ignoring bowel, sexual or pain symptoms because the referral says 'incontinence'.",
          "Teaching constant bracing.",
          "Failing to progress from isolated contractions into real tasks.",
        ],
      },
      {
        heading: "Clinical takeaway",
        paragraphs: [
          "Pelvic-floor rehabilitation is a coordination problem before it is a repetition problem. Good treatment identifies whether the main need is strength, endurance, timing, relaxation or functional integration, then progresses that target toward the patient's symptoms and goals.",
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
    title: "RCT vs Observational Study: Design, Bias and What the Results Can Actually Tell You",
    excerpt:
      "A clinical research lesson on randomization, confounding, cohort and case-control designs, cross-sectional studies, risk of bias, causal claims and choosing the right design for the question.",
    category: "Research Methods",
    audience: "Students",
    level: "Advanced",
    learningObjectives: [
      "Match randomized and observational designs to treatment, prognosis, prevalence and association questions.",
      "Explain how randomization reduces confounding and why it does not automatically guarantee a high-quality trial.",
      "Recognize major sources of bias in randomized and observational studies.",
      "Avoid making causal claims from designs that primarily establish association.",
    ],
    references: [
      {
        title: "Cochrane Handbook Chapter 8: Assessing risk of bias in a randomized trial",
        organization: "Cochrane",
        year: "2024",
        url: "https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-08",
      },
    ],
    readTime: "15 min read",
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    sections: [
      {
        heading: "1. Start with the research question",
        paragraphs: [
          "Study design should follow the question. If the question asks whether an intervention causes better outcomes than another treatment, a well-conducted randomized controlled trial is often appropriate. If the question asks about prevalence, prognosis, risk factors or naturally occurring exposure, an observational design may be more suitable.",
          "There is no universal 'best study design' independent of the question.",
        ],
      },
      {
        heading: "2. What randomization is trying to achieve",
        paragraphs: [
          "Random allocation aims to create groups that are, on average, similar in known and unknown prognostic factors before treatment. This reduces confounding when estimating the effect of an intervention.",
          "Randomization does not automatically solve poor measurement, high dropout, deviations from the assigned intervention, selective reporting or weak statistical analysis.",
        ],
      },
      {
        heading: "3. Allocation concealment and blinding are different",
        paragraphs: [
          "Allocation concealment protects the randomization process before a participant enters a group; blinding reduces knowledge of group assignment after allocation. They address different risks of bias.",
          "In physiotherapy trials, therapist and participant blinding is often difficult or impossible, which makes blinded outcome assessment, standardized procedures and transparent reporting even more important.",
        ],
      },
      {
        heading: "4. Observational designs answer different questions",
        bullets: [
          "Cross-sectional study: measures variables at one time point; useful for prevalence and associations.",
          "Cohort study: follows groups over time; useful for prognosis, incidence and exposure-outcome relationships.",
          "Case-control study: starts with outcome status and looks backward for exposures; useful for uncommon outcomes.",
          "Case series/report: describes clinical observations; useful for hypothesis generation but weak for causal inference.",
        ],
      },
      {
        heading: "5. Confounding: the central challenge in observational treatment comparisons",
        paragraphs: [
          "In routine care, treatment is not assigned randomly. Sicker patients may receive one treatment while healthier patients receive another. If outcome differences are later observed, the treatment and baseline prognosis are entangled.",
          "Statistical adjustment can reduce measured confounding, but unmeasured confounding may remain. This is why association should not automatically be translated into causation.",
        ],
      },
      {
        heading: "6. Risk of bias in an RCT",
        paragraphs: [
          "Cochrane's RoB 2 framework examines bias arising from the randomization process, deviations from intended interventions, missing outcome data, outcome measurement and selection of the reported result.",
          "The important lesson is that 'randomized' is the beginning of appraisal, not the end.",
        ],
      },
      {
        heading: "7. Statistical significance is not clinical importance",
        paragraphs: [
          "A very small difference can be statistically significant in a large sample but clinically trivial. Conversely, a clinically important effect may fail to reach statistical significance in an underpowered study.",
          "Interpret the effect size, confidence interval, measurement properties, harms, feasibility and the patient's priorities rather than reading the p-value alone.",
        ],
      },
      {
        heading: "8. External validity: can this study inform your patient?",
        paragraphs: [
          "A trial may be internally rigorous but include a narrow population that differs from your patient in age, comorbidity, severity or setting. Applicability requires comparing the study population and intervention dose with the real clinical context.",
        ],
      },
      {
        heading: "9. Example: two studies, two different conclusions",
        paragraphs: [
          "An observational study finds that patients who receive more physiotherapy visits have worse outcomes. A causal interpretation would be misleading if patients with more severe problems simply required more visits.",
          "An RCT comparing two treatment doses can address the intervention effect more directly, but its result is still only trustworthy if randomization, follow-up, measurement and reporting are sound.",
        ],
      },
      {
        heading: "10. A quick appraisal sequence",
        bullets: [
          "What exact question was the study designed to answer?",
          "Was the design appropriate for that question?",
          "Who was included and how were they selected?",
          "How were exposure/intervention and outcomes measured?",
          "What major sources of bias or confounding remain?",
          "How large and precise is the effect?",
          "Are the conclusions stronger than the methods justify?",
          "Does the result apply to my clinical population?",
        ],
      },
      {
        heading: "Advanced takeaway",
        paragraphs: [
          "Evidence hierarchy is useful, but methodological quality and question-design fit matter more than the study label alone. Strong clinical appraisal asks not 'Is this an RCT?' but 'How credible is this estimate, what biases remain, and what claim can this design legitimately support?'",
        ],
      },
    ],
  },
];

export function getKnowledgeArticle(slug: string) {
  return knowledgeArticles.find((article) => article.slug === slug);
}
