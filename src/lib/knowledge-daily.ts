import type { KnowledgeArticle } from "@/lib/knowledge-content";
import { knowledgeArticles } from "@/lib/knowledge-content";

/**
 * Daily depth-first additions and substantial revisions live here so the core
 * content library stays stable. Educational content remains static in Git.
 */
export const dailyKnowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "mechanical-neck-pain-assessment-rehabilitation",
    specialty: "Musculoskeletal (MSK)",
    title: "Mechanical Neck Pain: Assessment, Clinical Reasoning and Evidence-Informed Rehabilitation",
    excerpt:
      "A clinical mini-class on nonspecific/mechanical neck pain: screening, classification, examination, outcome measures, differential diagnosis, exercise and manual-therapy reasoning, dosage, progression and common mistakes.",
    category: "Neck Pain",
    audience: "Students",
    level: "Clinical",
    readTime: "18 min read",
    publishedAt: "2026-09-28",
    updatedAt: "2026-09-28",
    learningObjectives: [
      "Screen a person with neck pain for findings that require medical assessment before routine rehabilitation.",
      "Build a focused examination using symptom behaviour, cervical motion, neurological testing and functional measures.",
      "Differentiate common mechanical presentations from radiculopathy, headache-related, traumatic and systemic presentations.",
      "Select exercise, education and manual therapy as parts of an active plan rather than isolated treatments.",
      "Progress rehabilitation using symptom response, function and objective reassessment instead of pain intensity alone.",
    ],
    references: [
      {
        title: "Neck Pain: Clinical Summary",
        organization: "American Physical Therapy Association (APTA)",
        year: "2024",
        url: "https://www.apta.org/patient-care/evidence-based-practice-resources/clinical-summaries/neck-pain",
      },
      {
        title: "Physical Therapy Assessment and Treatment in Patients With Nonspecific Neck Pain",
        organization: "Royal Dutch Society for Physical Therapy (KNGF) / APTA CPG Library",
        year: "2018",
        url: "https://www.apta.org/patient-care/evidence-based-practice-resources/cpgs/physical-therapy-assessment-and-treatment-in-patients-with-nonspecific-neck-pain",
      },
      {
        title: "Cervical Active Range of Motion (CROM)",
        organization: "American Physical Therapy Association (APTA)",
        year: "2017",
        url: "https://www.apta.org/patient-care/evidence-based-practice-resources/test-measures/cervical-active-range-of-motion-crom-cellphone-applications-apps-use-in-measuring-cervical-range-of-motion",
      },
      {
        title: "Neck Disability Index (NDI)",
        organization: "American Physical Therapy Association (APTA)",
        year: "2013",
        url: "https://www.apta.org/patient-care/evidence-based-practice-resources/test-measures/neck-disability-index-ndi",
      },
    ],
    sections: [
      {
        heading: "1. What do we mean by mechanical or nonspecific neck pain?",
        paragraphs: [
          "Mechanical or nonspecific neck pain is a clinical description rather than a single tissue diagnosis. Symptoms are commonly influenced by movement, posture, loading or sustained positions, but a precise pain-generating structure often cannot be identified with confidence. The useful question is therefore not simply 'which tissue hurts?' but 'what pattern of symptoms, impairments, functional limits and risk factors is present, and what can rehabilitation safely modify?'",
          "Neck pain is multifactorial. Local joint and muscle sensitivity, reduced movement confidence, altered motor performance, work demands, sleep, stress, physical activity and previous episodes can all influence the presentation. Imaging findings must be interpreted in context because structural changes do not automatically explain symptom severity or disability.",
        ],
      },
      {
        heading: "2. Relevant anatomy and biomechanics",
        paragraphs: [
          "The cervical spine combines mobility with protection of the spinal cord, nerve roots and vertebral arteries. Upper cervical segments contribute substantially to head-on-neck motion, while lower cervical and upper thoracic regions contribute to global neck movement. Scapular and thoracic mechanics can influence the loads and movement strategies used during reaching, desk work and sustained postures.",
          "Deep and superficial cervical muscles have different roles in segmental control, gross movement and endurance. A patient with neck pain may demonstrate reduced cervical motion, reduced flexor or extensor endurance, altered coordination or protective muscle activity, but these findings should be treated as modifiable impairments rather than proof of a single damaged structure.",
        ],
      },
      {
        heading: "3. First priority: screen before you classify",
        paragraphs: [
          "Most neck pain seen in rehabilitation is not caused by serious pathology, but the consequence of missing a high-risk presentation can be substantial. Screening is therefore a deliberate part of the history and examination, not a checkbox performed after treatment has already started.",
        ],
        bullets: [
          "Urgent neurological concern: progressive limb weakness, new gait disturbance, loss of hand dexterity, widespread neurological signs, or features suggesting cervical myelopathy.",
          "Trauma/fracture concern: significant trauma, especially with older age, osteoporosis or other fracture risk, or severe focal pain after injury.",
          "Systemic concern: fever, unexplained weight loss, history of cancer, immunosuppression, severe unremitting pain or other features inconsistent with a routine mechanical pattern.",
          "Vascular/neurological emergency concern: sudden unusual severe head or neck pain with new cranial-nerve, visual, speech, swallowing, coordination or other focal neurological symptoms requires urgent medical assessment.",
          "Do not use a single red flag in isolation as a diagnosis. Combine history, examination, risk profile and clinical trajectory, and escalate when the pattern is concerning.",
        ],
      },
      {
        heading: "4. History: identify the symptom behaviour and functional problem",
        bullets: [
          "Onset: gradual, sudden, traumatic, recurrent or associated with a new activity/load?",
          "Location and distribution: local neck pain, shoulder-girdle pain, headache, arm symptoms, numbness or tingling?",
          "Aggravating/easing factors: rotation, extension, prolonged sitting, driving, lifting, sleep position or sustained work?",
          "24-hour behaviour: morning stiffness, night symptoms, sleep disruption and recovery after activity.",
          "Neurological symptoms: weakness, sensory change, clumsiness, balance change or radiating arm pain.",
          "Function: work tolerance, reading, driving, lifting, exercise, sleep and participation restrictions.",
          "Context: previous episodes, beliefs about damage, fear of movement, workload, stress, recovery, physical activity and treatment expectations.",
        ],
      },
      {
        heading: "5. Examination: choose tests that answer clinical questions",
        paragraphs: [
          "The examination should be hypothesis-driven. A long list of tests is less useful than a small set that helps establish baseline impairment, reproduce the relevant complaint, screen neurological involvement and guide treatment.",
        ],
        bullets: [
          "Observe comfortable posture and movement behaviour without assuming that one posture is the cause of pain.",
          "Measure cervical active range of motion when mobility is limited or painful; reassess the same measure later to judge change.",
          "Assess relevant thoracic and shoulder movement when symptoms are linked to reaching, prolonged sitting or upper-quarter loading.",
          "When radiating symptoms are present, include a neurological screen and consider neurodynamic testing, Spurling-type provocation and distraction as part of a test cluster rather than isolated proof.",
          "When movement-coordination impairment is suspected, cervical flexor control/endurance and functional movement tasks may be useful.",
          "Palpation can identify tenderness and symptom reproduction, but tenderness alone does not establish a precise tissue diagnosis.",
        ],
      },
      {
        heading: "6. Outcome measures: track disability as well as pain",
        paragraphs: [
          "Pain intensity is useful but incomplete. The Neck Disability Index (NDI) is commonly used to quantify how neck symptoms affect everyday activities. Pairing a disability measure with a pain rating and one or two patient-specific functional targets gives a more useful picture of change.",
        ],
        bullets: [
          "Pain rating (for example NPRS) for symptom intensity and response to loading.",
          "Neck Disability Index for activity-related disability.",
          "Cervical active range of motion when motion restriction is clinically relevant.",
          "Patient-specific functional goals such as driving rotation, desk-work tolerance, sleep or lifting capacity.",
          "Neurological findings when arm symptoms or suspected radiculopathy are present.",
        ],
      },
      {
        heading: "7. Differential diagnosis: avoid calling every neck pain 'mechanical'",
        bullets: [
          "Cervical radiculopathy: arm pain and/or neurological symptoms consistent with nerve-root involvement.",
          "Cervical myelopathy: cord-related signs such as gait change, hand dysfunction, hyperreflexia or multi-limb neurological findings; this requires medical evaluation.",
          "Cervicogenic headache: headache associated with cervical dysfunction after competing headache causes are considered.",
          "Whiplash-associated disorder: traumatic acceleration-deceleration mechanism with its own symptom and risk profile.",
          "Shoulder or upper-quarter disorders that refer pain toward the neck.",
          "Inflammatory, infectious, neoplastic, fracture or vascular causes when history/examination raises concern.",
        ],
      },
      {
        heading: "8. Clinical reasoning: classify the dominant rehabilitation problem",
        paragraphs: [
          "Useful classification is about treatment direction, not forcing the patient into a rigid label. One patient may be dominated by mobility loss and pain with rotation; another by radiating arm symptoms; another by movement-coordination deficits after trauma; another by low activity tolerance, fear and persistent pain. Mixed presentations are common.",
          "Reassess the hypothesis as the patient changes. If a presumed mobility problem does not respond as expected, reconsider the diagnosis, adherence, dosage, psychosocial contributors and whether a different medical or neurological process needs investigation.",
        ],
      },
      {
        heading: "9. Education: reduce threat without dismissing symptoms",
        paragraphs: [
          "Explain that common neck pain is often manageable and that gradual movement is usually part of recovery once serious pathology has been screened. Avoid messages such as 'your neck is out of place' or 'your posture is destroying your spine.' These statements can increase fear and dependence without improving clinical reasoning.",
          "Ergonomic changes can be useful when they reduce sustained aggravating exposure, but there is no single perfect posture that everyone must hold all day. Encourage position variation, breaks and a return to meaningful activity.",
        ],
      },
      {
        heading: "10. Exercise: dose the impairment you are trying to change",
        paragraphs: [
          "Exercise is usually an active foundation of rehabilitation. The exact programme should reflect irritability, strength/endurance deficits, mobility, functional goals and patient preference. Evidence supports exercise within multimodal care, but there is no universal set-and-repetition formula for every neck-pain presentation.",
          "A practical starting dose may use low-to-moderate symptom-provoking mobility practice, cervical/scapular endurance or strengthening performed several times per week, then progressed according to response. These starting ranges are clinical programming examples rather than a guideline-mandated prescription.",
        ],
        bullets: [
          "Mobility: controlled active motion into tolerable ranges; use repeated short bouts when stiffness is the main limitation.",
          "Endurance/control: begin with low-load cervical and scapular tasks that can be performed without marked compensation, then increase duration or repetitions.",
          "Strength: progress resistance when technique is controlled and post-exercise symptoms settle predictably.",
          "General activity: restore walking, gym, work and recreational activity rather than keeping rehabilitation confined to isolated neck exercises.",
          "If symptoms flare, first adjust range, load, volume or frequency; a temporary increase in symptoms does not automatically mean tissue injury.",
        ],
      },
      {
        heading: "11. Manual therapy: useful adjunct, poor long-term strategy when used alone",
        paragraphs: [
          "Cervical or thoracic mobilization/manipulation and soft-tissue techniques may provide short-term symptom or mobility improvement in selected patients. Their best role is usually to create an opportunity for movement, exercise and return to function rather than to become the entire plan.",
          "Technique selection must respect contraindications, vascular/neurological screening, fracture risk, patient preference, clinician competence and local scope of practice. A positive short-term response is useful information, but it does not prove that a joint was 'put back in place.'",
        ],
      },
      {
        heading: "12. Progression and regression criteria",
        bullets: [
          "Progress when the current task is technically controlled, symptoms are acceptable, recovery is predictable and function is improving.",
          "Increase one meaningful variable at a time: range, repetitions, resistance, duration, speed or task complexity.",
          "Regress temporarily when pain escalation is large or persistent, technique deteriorates, neurological symptoms increase or recovery is taking longer than expected.",
          "Stop routine progression and reassess if new/progressive neurological findings, systemic symptoms or an unexpected clinical deterioration appears.",
          "Use objective reassessment — not habit — to decide whether the programme is working.",
        ],
      },
      {
        heading: "13. Common clinical mistakes",
        bullets: [
          "Treating imaging findings as the diagnosis without matching them to the clinical presentation.",
          "Using posture as a single-cause explanation for pain.",
          "Performing passive treatment every visit without building self-management capacity.",
          "Applying the same exercise programme to mobility-deficit, radiating-pain and movement-coordination presentations.",
          "Chasing tenderness with increasingly aggressive manual therapy.",
          "Progressing exercises without measuring disability, function or symptom recovery.",
          "Ignoring sleep, workload, fear, stress and general physical activity when they are clearly influencing recovery.",
        ],
      },
      {
        heading: "14. Prognosis and expected course",
        paragraphs: [
          "Many acute episodes improve over weeks, but recurrence and persistence are common. Prognosis is influenced by more than tissue status: baseline disability, symptom duration, neurological involvement, sleep, psychological distress, work demands, activity level and confidence can all matter. Avoid promising an exact recovery date.",
          "A good rehabilitation plan therefore includes relapse-prevention thinking: maintain useful exercise, vary sustained positions, manage training/workload and know which symptoms should trigger reassessment.",
        ],
      },
      {
        heading: "15. Clinical pearls",
        bullets: [
          "Screen first, then classify.",
          "Measure the patient's meaningful limitation, not only tenderness.",
          "Use passive treatment to support active rehabilitation, not replace it.",
          "A movement that hurts is not automatically a movement that is harmful.",
          "If the clinical trajectory is not behaving as expected, reconsider your hypothesis instead of simply increasing treatment intensity.",
        ],
      },
      {
        heading: "Concise summary",
        paragraphs: [
          "Mechanical/nonspecific neck pain is best managed as a clinical pattern rather than a hunt for one painful structure. Screen for serious pathology and neurological compromise, establish baseline disability and movement findings, identify the dominant functional problem, then combine education and progressive exercise with selected adjuncts when appropriate. Reassess objective outcomes and change the plan when the response does not match the hypothesis.",
        ],
      },
      {
        heading: "Evidence strength in practice",
        bullets: [
          "Stronger support: active rehabilitation, exercise, education and multimodal care matched to the presentation.",
          "Context-dependent support: manual therapy as an adjunct for selected patients, particularly when it helps movement and exercise participation.",
          "Limited/uncertain: claims that a single posture, palpated tissue fault or isolated manual technique identifies and permanently corrects the cause of nonspecific neck pain.",
          "Expert-practice consideration: exact exercise dosage should be individualized because guidelines support active care but do not prescribe one universal programme for every patient.",
        ],
      },
    ],
  },
{
  "slug": "parkinson-freezing-gait-balance-rehabilitation",
  "specialty": "Neurological",
  "title": "Parkinson Disease: Freezing of Gait, Balance and Cueing-Based Rehabilitation",
  "excerpt": "An advanced neurorehabilitation guide to freezing of gait, balance impairment, cueing, task-specific training, aerobic and resistance exercise, and progression in Parkinson disease.",
  "category": "Parkinson Disease",
  "audience": "Students",
  "level": "Advanced",
  "readTime": "16 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Recognize common gait and balance impairments in Parkinson disease and distinguish freezing of gait from simple weakness or deconditioning.",
    "Select outcome measures and task-specific tests that match the patient’s mobility goals.",
    "Use external cueing, balance training, aerobic exercise and resistance training within an individualized rehabilitation plan.",
    "Progress training while monitoring falls risk, fatigue, medication timing and functional carry-over."
  ],
  "references": [
    {
      "title": "Parkinson Disease (PD) Clinical Summary",
      "organization": "American Physical Therapy Association (APTA)",
      "year": "2024",
      "url": "https://www.apta.org/patient-care/evidence-based-practice-resources/clinical-summaries/parkinson-disease-pd"
    },
    {
      "title": "Canadian Guideline for Parkinson Disease",
      "organization": "APTA / Canadian Guideline",
      "year": "2019",
      "url": "https://www.apta.org/patient-care/evidence-based-practice-resources/cpgs/canadian-guideline-for-parkinson-disease"
    }
  ],
  "sections": [
    {
      "heading": "1. Clinical picture",
      "paragraphs": [
        "Parkinson disease can affect movement amplitude, automaticity, speed, postural control and the ability to adapt gait to environmental demands. A person may walk reasonably well in a quiet corridor yet freeze at doorways, during turning, under time pressure or while dual-tasking.",
        "The rehabilitation problem is therefore not just muscle weakness. The therapist must identify when gait breaks down, which contexts trigger freezing, whether balance reactions are impaired, and how much the person relies on attention or external cues to move safely."
      ]
    },
    {
      "heading": "2. Assessment priorities",
      "bullets": [
        "Falls history, near-falls and situations that provoke freezing.",
        "Gait speed, turning, step length, start hesitation and ability to stop safely.",
        "Dynamic balance during reaching, obstacle negotiation and direction changes.",
        "Lower-limb strength and power, especially sit-to-stand performance.",
        "Endurance and physical activity level.",
        "Medication timing, fatigue, orthostatic symptoms and cognitive/dual-task effects.",
        "Home and community environments where mobility actually fails."
      ]
    },
    {
      "heading": "3. Freezing of gait reasoning",
      "paragraphs": [
        "Freezing is typically episodic and context-dependent. It may be triggered by gait initiation, narrow spaces, turning, destination approach or competing cognitive demands. The therapist should reproduce relevant tasks safely rather than assuming a normal straight-line gait test rules the problem out.",
        "A sudden new or rapidly worsening gait disorder, recurrent unexplained syncope, acute focal neurological change or other atypical feature should prompt medical reassessment rather than automatic attribution to Parkinson disease."
      ]
    },
    {
      "heading": "4. External cueing",
      "bullets": [
        "Auditory rhythm can help some people regulate cadence and movement timing.",
        "Visual targets such as floor markers may improve step amplitude or help overcome freezing in selected situations.",
        "Verbal self-cues can convert an automatic task into a deliberate sequence.",
        "Cueing should be individualized; a cue that improves one context may distract in another.",
        "The goal is functional carry-over, not permanent dependence on a therapist-generated cue."
      ]
    },
    {
      "heading": "5. Task-specific gait and balance training",
      "paragraphs": [
        "Practice the exact mobility demands that matter: repeated starts and stops, turning, doorway negotiation, obstacle crossing, backward stepping, sit-to-stand, community walking and safe recovery strategies. Repetition should be high enough to challenge motor performance but not so fatiguing that movement quality collapses.",
        "Balance work should include anticipatory and reactive components when safe. Static standing alone is rarely sufficient for a person whose real-world problem occurs while turning, reaching or walking."
      ]
    },
    {
      "heading": "6. Aerobic and resistance exercise",
      "paragraphs": [
        "Aerobic and resistance exercise can reduce motor disability and improve general physical capacity. Intensity should be individualized to cardiovascular status, deconditioning, medication response and falls risk. Strength training should emphasize meaningful lower-limb and postural muscle groups and progress when technique and recovery are acceptable.",
        "The purpose is not to claim that exercise cures Parkinson disease. The practical goal is to preserve capacity, reduce secondary deconditioning and support function and participation."
      ]
    },
    {
      "heading": "7. Progression and regression",
      "bullets": [
        "Progress one variable at a time: speed, distance, direction changes, obstacle complexity, dual-task demand or reduction of support.",
        "Progress when gait quality is stable, recovery is predictable and falls risk remains controlled.",
        "Regress temporarily if repeated freezing, near-falls, marked fatigue or technique breakdown appears.",
        "Reassess after medication changes, new falls or sudden functional decline."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Training only straight-line walking while ignoring turning and gait initiation.",
        "Using cues without testing whether they improve the patient’s actual problem.",
        "Treating balance as a static task instead of a dynamic mobility problem.",
        "Ignoring medication timing and orthostatic symptoms.",
        "Assuming more dual-task difficulty is always better training; excessive cognitive load can increase risk."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Ask where freezing happens, not only whether it happens.",
        "Measure a meaningful task such as turning or doorway negotiation.",
        "Use cueing as a strategy, then train transfer to the patient’s own environment.",
        "Maintain aerobic fitness and strength alongside task-specific practice.",
        "Falls prevention and confidence are functional outcomes, not side issues."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "Parkinson rehabilitation should combine disease-specific gait and balance strategies with exercise that preserves physical capacity. Freezing of gait is best managed by identifying triggers, testing individualized cueing strategies and practicing relevant mobility tasks under controlled progression."
      ]
    }
  ]
},
{
  "slug": "cardiac-rehabilitation-after-mi-pci-exercise",
  "specialty": "Cardiopulmonary",
  "title": "Cardiac Rehabilitation After MI or PCI: Assessment, Exercise Prescription and Monitoring",
  "excerpt": "A practical cardiopulmonary rehabilitation lesson on secondary prevention, exercise assessment, aerobic and resistance training, symptom monitoring and safe progression after myocardial infarction or PCI.",
  "category": "Cardiac Rehabilitation",
  "audience": "Students",
  "level": "Advanced",
  "readTime": "17 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Explain the core components of comprehensive cardiac rehabilitation.",
    "Identify pre-exercise information needed after myocardial infarction or coronary intervention.",
    "Build an individualized aerobic and resistance programme using symptoms, exertion and clinical status.",
    "Recognize warning signs that require stopping exercise and medical reassessment."
  ],
  "references": [
    {
      "title": "Core Components of Cardiac Rehabilitation Programs: 2024 Update",
      "organization": "American Heart Association",
      "year": "2024",
      "url": "https://professional.heart.org/en/science-news/core-components-of-cardiac-rehabilitation-programs-2024-update"
    }
  ],
  "sections": [
    {
      "heading": "1. Cardiac rehabilitation is more than exercise",
      "paragraphs": [
        "Modern cardiac rehabilitation is a medically supervised secondary-prevention programme. Exercise is central, but it sits alongside patient assessment, risk-factor management, physical-activity counselling, nutrition, weight management, psychosocial support and programme quality.",
        "A physiotherapy plan should therefore connect exercise tolerance with the patient’s broader cardiovascular risk profile, medications, symptoms, goals and daily activity demands."
      ]
    },
    {
      "heading": "2. Pre-exercise assessment",
      "bullets": [
        "Recent cardiac event and procedure details, including complications and medical restrictions.",
        "Symptoms at rest and with exertion: chest discomfort, unusual dyspnoea, palpitations, dizziness or syncope.",
        "Resting heart rate and blood pressure where appropriate.",
        "Functional exercise capacity using a clinically suitable test.",
        "Current medications and their effect on heart-rate response.",
        "Comorbidities, musculoskeletal limitations and previous activity level.",
        "Patient goals, confidence and barriers to participation."
      ]
    },
    {
      "heading": "3. Aerobic exercise prescription",
      "paragraphs": [
        "Use walking, cycling or another safe mode that can be progressed. Intensity can be guided by exercise-test information when available, or by clinical markers such as perceived exertion and symptom response when heart-rate targets are less reliable because of medications or rhythm issues.",
        "Start with a duration and intensity the patient can repeat consistently. Progression should prioritize regular participation and predictable recovery before large increases in workload."
      ]
    },
    {
      "heading": "4. Resistance training",
      "paragraphs": [
        "Resistance training supports muscular strength, function and independence. Begin with technically controlled exercises at an intensity appropriate to the person’s medical status and prior training experience. Avoid unnecessary breath-holding and monitor symptoms and haemodynamic response when clinically indicated.",
        "Progress by adjusting resistance, repetitions or exercise complexity rather than changing every variable at once."
      ]
    },
    {
      "heading": "5. Monitoring during rehabilitation",
      "bullets": [
        "Rate of perceived exertion and symptom response.",
        "Heart rate and blood pressure when indicated by the programme and patient risk.",
        "Recovery time after exercise.",
        "Unusual breathlessness compared with expected exertion.",
        "Chest pressure, presyncope, new palpitations or other warning symptoms.",
        "Adherence and confidence with independent physical activity."
      ]
    },
    {
      "heading": "6. Stop and reassess when",
      "bullets": [
        "New or escalating chest pain or pressure occurs.",
        "Syncope, near-syncope or severe dizziness develops.",
        "There is marked breathlessness out of proportion to workload.",
        "A new clinically important rhythm disturbance is suspected.",
        "Blood-pressure response is concerning according to the supervising medical protocol.",
        "The person shows acute illness or clinical instability."
      ]
    },
    {
      "heading": "7. Progression logic",
      "paragraphs": [
        "A common clinical error is to progress intensity because a calendar date has passed. Progress should instead reflect symptom stability, recovery, functional goals and objective response. Increasing duration before intensity is often practical for deconditioned individuals, but the sequence should remain individualized.",
        "Reassessment should include not only exercise capacity but also confidence, daily physical activity and whether the patient is moving toward meaningful participation goals."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Treating cardiac rehab as treadmill time only.",
        "Ignoring medication effects on heart-rate targets.",
        "Using a single generic exercise prescription for every post-MI patient.",
        "Progressing load without checking symptoms and recovery.",
        "Neglecting psychosocial barriers, fear of exertion and return-to-work demands."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Cardiac rehabilitation is comprehensive secondary prevention.",
        "Use objective and subjective responses together.",
        "Progress exercise based on response, not time alone.",
        "Teach patients what normal exertion feels like and which symptoms are not normal.",
        "Functional independence and long-term activity behaviour matter as much as a test score."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "After MI or PCI, physiotherapy within cardiac rehabilitation should combine individualized aerobic and resistance training with careful assessment, symptom monitoring and secondary-prevention goals. Safe progression depends on clinical stability, repeatable exercise response and gradual restoration of function."
      ]
    }
  ]
},
{
  "slug": "cerebral-palsy-functional-assessment-goal-directed-rehab",
  "specialty": "Pediatrics",
  "title": "Cerebral Palsy: Functional Assessment and Goal-Directed Physiotherapy Rehabilitation",
  "excerpt": "A pediatric rehabilitation guide to functional classification, gait and motor assessment, family-centred goals, task-specific practice, strength, contracture surveillance and multidisciplinary care in cerebral palsy.",
  "category": "Cerebral Palsy",
  "audience": "Students",
  "level": "Advanced",
  "readTime": "17 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Assess function in cerebral palsy without reducing the child to muscle tone alone.",
    "Build family-centred goals linked to activity and participation.",
    "Use task-specific practice, strengthening and environmental adaptation within a multidisciplinary plan.",
    "Recognize changes that require medical or specialist reassessment."
  ],
  "references": [
    {
      "title": "Cerebral palsy in under 25s: assessment and management",
      "organization": "NICE",
      "year": "2017",
      "url": "https://www.nice.org.uk/guidance/ng62/chapter/Recommendations"
    }
  ],
  "sections": [
    {
      "heading": "1. Start with function, not tone",
      "paragraphs": [
        "Cerebral palsy is a group of permanent disorders of movement and posture related to non-progressive disturbances in the developing brain. The brain lesion is non-progressive, but the musculoskeletal and functional presentation can change as the child grows.",
        "Tone is only one part of the picture. Physiotherapy assessment should also consider selective motor control, strength, balance, endurance, range of motion, gait, hand function, self-care, participation and the environments in which the child needs to function."
      ]
    },
    {
      "heading": "2. Assessment framework",
      "bullets": [
        "Gross motor abilities and how the child moves between positions.",
        "Walking capacity, gait pattern and need for mobility aids or orthoses.",
        "Strength, selective motor control and balance.",
        "Joint range, muscle length, pain and emerging contracture.",
        "Fatigue, endurance and participation in school or play.",
        "Family priorities and the child or young person’s own goals.",
        "Environmental barriers such as stairs, classroom layout and transport."
      ]
    },
    {
      "heading": "3. Family-centred goal setting",
      "paragraphs": [
        "A technically correct exercise that does not connect to a meaningful goal may have poor adherence and limited carry-over. Goals should be specific to activities such as floor-to-stand, walking to class, playground access, transfers or self-care.",
        "The child and family should have a central role in decisions. Goals must be realistic but not unnecessarily restrictive; the aim is to expand participation and independence where possible."
      ]
    },
    {
      "heading": "4. Task-specific practice",
      "paragraphs": [
        "Motor learning improves when children practice relevant tasks repeatedly in contexts that resemble real life. Rehearse sit-to-stand if standing transfers are a goal; practice stepping, turning and obstacle negotiation if community mobility is the target.",
        "Assistance should be enough to make practice successful without doing the task for the child. Progress by changing support, repetitions, speed, environment or task complexity."
      ]
    },
    {
      "heading": "5. Strength and physical capacity",
      "paragraphs": [
        "Weakness and reduced physical activity can coexist with spasticity. Carefully prescribed strengthening does not need to be avoided simply because spasticity is present. The programme should target muscles and tasks that support function and should be progressed according to control, fatigue and recovery.",
        "Aerobic conditioning and opportunities for active play may be important, particularly when reduced activity contributes to deconditioning."
      ]
    },
    {
      "heading": "6. Range, contracture and growth",
      "paragraphs": [
        "Growth can reveal or worsen muscle-tendon shortening and skeletal alignment problems. Regular surveillance of range, pain, hip status and functional change is therefore important. Stretching may be part of care, but passive stretching alone should not replace active movement, strengthening and task practice.",
        "Orthoses, spasticity management, serial casting or surgical opinions may be considered by the wider team when clinically indicated."
      ]
    },
    {
      "heading": "7. Reconsider the diagnosis or trajectory when",
      "bullets": [
        "Previously acquired skills are being lost unexpectedly.",
        "New focal neurological signs appear.",
        "Pain, weakness or fatigue changes rapidly without a clear explanation.",
        "Function declines much faster than expected with growth.",
        "The clinical picture is inconsistent with the known diagnosis."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Measuring success only by reduction in tone.",
        "Setting therapist-centred goals that have little relevance to the child’s day.",
        "Using passive techniques as the main treatment for months without active practice.",
        "Ignoring pain, fatigue, participation and school demands.",
        "Assuming all children with cerebral palsy need the same exercise programme."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Function and participation are primary outcomes.",
        "Children need practice of meaningful tasks, not only impairment-level exercises.",
        "Strength and endurance matter alongside movement quality.",
        "Growth changes the biomechanical problem even when the brain lesion is stable.",
        "Multidisciplinary coordination is essential when orthopaedic, feeding, communication or respiratory issues coexist."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "High-quality physiotherapy in cerebral palsy is individualized, goal-directed and participation-focused. Assessment should integrate motor control, strength, range, gait and real-world function, then use task-specific practice and progressive exercise within coordinated multidisciplinary care."
      ]
    }
  ]
},
{
  "slug": "acl-reconstruction-criterion-based-return-to-sport",
  "specialty": "Sports",
  "title": "ACL Reconstruction Rehabilitation: Criterion-Based Progression and Return-to-Sport Reasoning",
  "excerpt": "A sports rehabilitation framework for ACL reconstruction covering early recovery, quadriceps restoration, running, plyometrics, change of direction, psychological readiness and return-to-sport criteria.",
  "category": "ACL Rehabilitation",
  "audience": "Students",
  "level": "Advanced",
  "readTime": "18 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Use criterion-based rather than purely time-based progression after ACL reconstruction.",
    "Identify key rehabilitation priorities from early recovery through running and sport-specific loading.",
    "Interpret strength, jump, knee function and psychological readiness as part of return-to-sport decision making.",
    "Recognize why symmetrical test scores alone do not prove full recovery."
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
  "sections": [
    {
      "heading": "1. Rehabilitation is criterion-based",
      "paragraphs": [
        "Time since surgery matters because biological healing takes time, but a calendar date does not tell you whether strength, range of motion, swelling, movement quality or sport capacity have recovered. Modern ACL rehabilitation therefore combines time with objective criteria.",
        "Concomitant meniscal or cartilage procedures can alter loading restrictions, so the surgeon’s procedure-specific guidance must be integrated into the plan."
      ]
    },
    {
      "heading": "2. Early priorities",
      "bullets": [
        "Control pain and effusion without allowing prolonged unnecessary inactivity.",
        "Restore full knee extension and progressive flexion.",
        "Recover quadriceps activation and reduce extension lag.",
        "Normalize gait as weight-bearing permissions allow.",
        "Maintain hip, calf and trunk capacity.",
        "Educate the athlete about milestones, expected variability and adherence."
      ]
    },
    {
      "heading": "3. Strength restoration",
      "paragraphs": [
        "Quadriceps deficits can persist long after pain settles. Progressive resistance exercise should therefore be a central feature, using both open- and closed-chain approaches as appropriate to the phase, symptoms and surgical considerations.",
        "Absolute strength matters as well as limb symmetry. An involved limb can appear symmetrical if the uninvolved limb has also deconditioned, so pre-injury or normative benchmarks are valuable when available."
      ]
    },
    {
      "heading": "4. Return to running",
      "paragraphs": [
        "Running should not begin simply because a set number of weeks has passed. Consider knee symptoms, range, effusion, strength, hopping/landing control and the ability to tolerate repeated loading. A gradual walk-jog exposure allows monitoring of knee response.",
        "If swelling or pain escalates and remains elevated into the next day, reduce the dose and reassess the loading strategy."
      ]
    },
    {
      "heading": "5. Plyometrics and change of direction",
      "paragraphs": [
        "Plyometrics should progress from low-intensity bilateral tasks toward unilateral, multiplanar and reactive demands. Change-of-direction training should be introduced when the athlete can decelerate and control force safely, not merely because straight-line running looks good.",
        "Quality, speed and decision-making demands should rise progressively until training resembles the sport."
      ]
    },
    {
      "heading": "6. Return-to-sport testing",
      "bullets": [
        "No clinically important pain or swelling and full knee range.",
        "Stable knee and acceptable clinical examination.",
        "Patient-reported knee function and psychological readiness.",
        "Quadriceps and hamstring strength relative to the uninvolved limb and, where possible, absolute or normative values.",
        "Jump and landing tests, ideally with both performance and movement-quality analysis.",
        "Completion of progressive sport-specific training before unrestricted competition."
      ]
    },
    {
      "heading": "7. Why symmetry is not enough",
      "paragraphs": [
        "A limb-symmetry index can hide bilateral deconditioning and does not capture every quality of movement. Return-to-sport decisions should combine strength, functional tests, clinical status, workload tolerance, psychological readiness and the demands of the athlete’s sport.",
        "A single hop test or a 90% threshold should not be treated as a magic clearance number."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Progressing because 'month 6 has arrived' despite persistent deficits.",
        "Ignoring quadriceps strength once gait becomes normal.",
        "Testing only distance and not landing strategy or repeatability.",
        "Clearing sport before the athlete has tolerated high-speed, reactive and sport-specific training.",
        "Using passive modalities as a substitute for progressive loading."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Exercise is the mainstay of ACL rehabilitation.",
        "Restore extension early and protect against persistent quadriceps inhibition.",
        "Track both absolute performance and side-to-side symmetry.",
        "Return to sport is a process, not a single test day.",
        "The final stages must resemble the speed, uncertainty and fatigue demands of the real sport."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "ACL rehabilitation should move from early symptom control and range restoration toward progressive strength, running, plyometrics, change of direction and sport-specific exposure. Return-to-sport decisions are strongest when time, biology, objective tests, psychological readiness and real training tolerance are considered together."
      ]
    }
  ]
},
{
  "slug": "falls-prevention-older-adults-strength-balance",
  "specialty": "Geriatrics",
  "title": "Falls Prevention in Older Adults: Assessment, Strength, Balance and Functional Progression",
  "excerpt": "A geriatric physiotherapy guide to falls history, gait and balance assessment, strength and power training, home hazards, fear of falling and individualized prevention planning.",
  "category": "Falls Prevention",
  "audience": "Students",
  "level": "Clinical",
  "readTime": "15 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Identify which older adults need comprehensive falls assessment.",
    "Build an exercise programme targeting balance, coordination, strength and power.",
    "Integrate home hazards, medications, vision, continence and other risk factors into reasoning.",
    "Progress exercise safely while addressing fear of falling and adherence."
  ],
  "references": [
    {
      "title": "Falls: assessment and prevention in older people and in people 50 and over at higher risk",
      "organization": "NICE",
      "year": "2025",
      "url": "https://www.nice.org.uk/guidance/ng249/chapter/Recommendations/"
    }
  ],
  "sections": [
    {
      "heading": "1. Falls are multifactorial",
      "paragraphs": [
        "A fall is rarely explained by one weak muscle. Risk can reflect gait and balance impairment, medications, vision, footwear, home hazards, neurological disease, cardiovascular issues, continence, fear of falling and reduced physical capacity.",
        "The therapist’s role is to identify modifiable contributors and connect them to a practical intervention plan."
      ]
    },
    {
      "heading": "2. Who needs comprehensive assessment?",
      "paragraphs": [
        "NICE recommends comprehensive falls assessment and management for higher-risk groups such as people with frailty, recurrent falls, injury requiring treatment, loss of consciousness related to a fall or inability to get up independently. A person with a single fall and gait or balance impairment should receive targeted exercise and relevant risk management.",
        "A simple 'falls risk score' should not replace clinical assessment of the individual."
      ]
    },
    {
      "heading": "3. Physiotherapy assessment",
      "bullets": [
        "Detailed falls and near-falls history, including context and direction.",
        "Gait, transfers, turning and balance under realistic conditions.",
        "Lower-limb strength and power.",
        "Ability to get up from the floor when appropriate.",
        "Use and fit of walking aids.",
        "Fear of falling and activity avoidance.",
        "Footwear, home environment and environmental barriers.",
        "Relevant neurological, visual, cardiovascular and medication factors requiring multidisciplinary input."
      ]
    },
    {
      "heading": "4. Exercise content",
      "paragraphs": [
        "Falls-prevention exercise should be progressive and tailored. Key components include balance, coordination, strength and power. Functional tasks such as sit-to-stand, step-ups, reaching, turning and walking can be progressed to challenge the specific deficits identified.",
        "Programmes should be reviewed regularly so the exercise remains challenging enough to drive adaptation without becoming unsafe."
      ]
    },
    {
      "heading": "5. Strength and power",
      "paragraphs": [
        "Older adults often need more than low-level seated exercise. When safe, progressive resistance and faster concentric intent can help restore the strength and power required for transfers, stair climbing and rapid balance corrections.",
        "Load and speed should be matched to medical status, technique and confidence. The presence of age alone is not a reason to avoid meaningful strength training."
      ]
    },
    {
      "heading": "6. Fear of falling",
      "paragraphs": [
        "Fear can reduce exposure to activity, which may worsen deconditioning and confidence. Education and graded functional practice should help the person regain safe movement rather than simply advising them to 'be careful'.",
        "When fear remains high despite physical improvement, psychological or cognitive-behavioural support may be appropriate within multidisciplinary care."
      ]
    },
    {
      "heading": "7. Progression",
      "bullets": [
        "Narrow base of support or reduce hand support when safe.",
        "Add direction changes, reaching and stepping reactions.",
        "Increase resistance in sit-to-stand, squats and step tasks.",
        "Progress from predictable to variable environments.",
        "Increase walking distance and community complexity.",
        "Reassess falls, near-falls and confidence as well as test scores."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Giving the same balance programme to every older adult.",
        "Keeping exercises too easy for months.",
        "Focusing on balance while ignoring strength and power.",
        "Telling a fearful patient to avoid activity instead of rebuilding capacity.",
        "Ignoring medication, vision, home hazards or neurological contributors."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Ask about near-falls, not only falls.",
        "Strength and balance should be progressively challenged.",
        "Functional tasks reveal risk that quiet standing may miss.",
        "Falls prevention works best when individual risk factors are addressed together.",
        "The goal is safer participation, not unnecessary restriction."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "Falls prevention is a targeted, multifactorial process. Physiotherapy should combine individualized assessment with progressive balance, strength, power and functional training, while coordinating management of non-exercise risk factors."
      ]
    }
  ]
},
{
  "slug": "pelvic-floor-muscle-training-stress-urinary-incontinence",
  "specialty": "Women's & Pelvic Health",
  "title": "Pelvic Floor Muscle Training for Stress and Mixed Urinary Incontinence: Assessment and Progression",
  "excerpt": "A pelvic-health physiotherapy lesson on symptom classification, pelvic floor muscle assessment, supervised training, dosage, progression, bladder training and referral considerations.",
  "category": "Pelvic Floor Rehabilitation",
  "audience": "Students",
  "level": "Clinical",
  "readTime": "15 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Differentiate stress, urgency and mixed urinary incontinence patterns clinically.",
    "Explain first-line pelvic floor muscle training recommendations for stress or mixed urinary incontinence.",
    "Progress pelvic floor exercise from correct contraction toward functional use.",
    "Identify symptoms that require specialist or medical assessment."
  ],
  "references": [
    {
      "title": "Urinary incontinence and pelvic organ prolapse in women: management",
      "organization": "NICE",
      "year": "2019",
      "url": "https://www.nice.org.uk/guidance/ng123/chapter/recommendations"
    },
    {
      "title": "Pelvic floor dysfunction: prevention and non-surgical management",
      "organization": "NICE",
      "year": "2021",
      "url": "https://www.nice.org.uk/guidance/ng210/chapter/Recommendations"
    }
  ],
  "sections": [
    {
      "heading": "1. Classify the symptom pattern",
      "paragraphs": [
        "Stress urinary incontinence is leakage associated with rises in intra-abdominal pressure such as coughing, sneezing, lifting or running. Urgency urinary incontinence is leakage associated with a compelling urge to void. Mixed incontinence contains features of both.",
        "The pattern matters because pelvic floor muscle training is central for stress and mixed incontinence, while urgency-dominant symptoms often also require bladder retraining and behavioural strategies."
      ]
    },
    {
      "heading": "2. Assessment priorities",
      "bullets": [
        "Leakage triggers, frequency and severity.",
        "Urgency, frequency and nocturia.",
        "Bowel symptoms and straining.",
        "Pregnancy and birth history where relevant.",
        "Pelvic organ prolapse symptoms.",
        "Ability to voluntarily contract and relax the pelvic floor.",
        "Impact on exercise, work, sexual function and confidence.",
        "Red-flag symptoms such as unexplained bleeding, recurrent urinary infection, significant pelvic pain or neurological change requiring appropriate referral."
      ]
    },
    {
      "heading": "3. First-line supervised training",
      "paragraphs": [
        "NICE recommends supervised pelvic floor muscle training for at least 3 months for women with stress or mixed urinary incontinence. The programme should ensure the person can perform an effective contraction before simply prescribing a large volume of exercises.",
        "One NICE recommendation specifies at least 8 contractions performed 3 times per day. In practice, contraction duration, rest and speed should be individualized to the person’s baseline function and ability to maintain quality."
      ]
    },
    {
      "heading": "4. Quality before quantity",
      "paragraphs": [
        "A pelvic floor contraction should not be replaced by breath-holding, excessive abdominal bracing, gluteal squeezing or bearing down. Training should include both contraction and full relaxation.",
        "If the patient cannot generate an effective contraction, supplementary biofeedback or electrical stimulation may be considered in selected cases rather than repeatedly practicing an incorrect strategy."
      ]
    },
    {
      "heading": "5. Progression to function",
      "bullets": [
        "Increase hold time only while contraction quality remains good.",
        "Train repeated contractions with adequate rest.",
        "Add faster contractions for sudden pressure demands.",
        "Practice pre-contraction before cough, lift or impact where appropriate.",
        "Progress positions from lying to sitting, standing and functional tasks.",
        "Integrate with return to exercise rather than keeping training isolated from real activities."
      ]
    },
    {
      "heading": "6. Mixed and urgency symptoms",
      "paragraphs": [
        "Bladder retraining is a first-line component for urgency or mixed symptoms. Education can address bladder habits, fluid intake, caffeine and urge-control strategies. Pelvic floor training and bladder retraining may be combined when both stress and urgency components are present.",
        "Treatment should be based on the dominant symptom pattern rather than assuming all leakage has the same mechanism."
      ]
    },
    {
      "heading": "7. Review and adherence",
      "paragraphs": [
        "A pelvic floor programme should be reviewed during the supervised period and again at completion. Improvement in leakage episodes, confidence, activity participation and patient-reported bother are meaningful outcomes.",
        "If training is beneficial, ongoing exercise can help maintain gains."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Prescribing exercises without confirming an effective contraction.",
        "Assuming stronger is always better when the pelvic floor is overactive or painful.",
        "Ignoring bladder habits and urgency in mixed incontinence.",
        "Keeping exercises in lying only and never progressing to functional pressure tasks.",
        "Using biofeedback routinely when it is not needed."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Classify the leakage pattern first.",
        "A correct contraction and relaxation strategy comes before high repetitions.",
        "Supervision and review improve quality of training.",
        "Functional progression should match the situations in which leakage occurs.",
        "Persistent, atypical or complex symptoms deserve appropriate specialist input."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "Pelvic floor rehabilitation for stress and mixed urinary incontinence is built around accurate symptom classification, supervised muscle training, progressive functional integration and bladder strategies when urgency is present."
      ]
    }
  ]
},
{
  "slug": "fibromyalgia-exercise-pacing-nociplastic-rehabilitation",
  "specialty": "Pain Science",
  "title": "Fibromyalgia Rehabilitation: Exercise, Pacing and Nociplastic Pain Reasoning",
  "excerpt": "A pain-science and rehabilitation guide to fibromyalgia covering symptom variability, exercise, pacing, sleep, education, flare management and avoidance of tissue-damage narratives.",
  "category": "Fibromyalgia",
  "audience": "Students",
  "level": "Advanced",
  "readTime": "16 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Explain why fibromyalgia requires a whole-person rehabilitation model rather than a single-tissue explanation.",
    "Use exercise and pacing without reinforcing fear of movement.",
    "Differentiate a temporary symptom flare from evidence of tissue injury.",
    "Build a graded rehabilitation plan around function, sleep, fatigue and recovery."
  ],
  "references": [
    {
      "title": "EULAR revised recommendations for the management of fibromyalgia",
      "organization": "Annals of the Rheumatic Diseases / PubMed",
      "year": "2017",
      "url": "https://pubmed.ncbi.nlm.nih.gov/27377815/"
    },
    {
      "title": "International multidisciplinary Delphi consensus recommendations on non-pharmacological interventions for fibromyalgia",
      "organization": "PubMed",
      "year": "2022",
      "url": "https://pubmed.ncbi.nlm.nih.gov/36183478/"
    }
  ],
  "sections": [
    {
      "heading": "1. Fibromyalgia is not a local tissue problem",
      "paragraphs": [
        "Fibromyalgia is characterized by widespread pain and commonly includes fatigue, sleep disturbance and cognitive symptoms. The presentation cannot be adequately managed by repeatedly treating one painful muscle or joint as if it were the sole cause.",
        "A useful rehabilitation model recognizes altered pain processing, physical deconditioning, sleep, stress, activity patterns, confidence and other individual contributors without suggesting that the pain is imaginary."
      ]
    },
    {
      "heading": "2. Assessment",
      "bullets": [
        "Pain distribution and variability.",
        "Fatigue and post-activity recovery.",
        "Sleep quality and daily rhythm.",
        "Current physical activity and deconditioning.",
        "Fear of movement and boom-bust activity patterns.",
        "Functional goals such as work, walking, household tasks or exercise.",
        "Other symptoms that may need medical assessment rather than automatic attribution to fibromyalgia."
      ]
    },
    {
      "heading": "3. Exercise is a core intervention",
      "paragraphs": [
        "EULAR recommendations identify exercise as the strongest therapy-based recommendation. Aerobic and strengthening approaches can both be useful. The challenge is not whether to move, but how to dose activity so it is repeatable and can be progressed.",
        "The starting point may be below conventional fitness targets when symptom sensitivity is high. Consistency is more valuable than an aggressive session followed by several days of collapse."
      ]
    },
    {
      "heading": "4. Pacing without permanent avoidance",
      "paragraphs": [
        "Pacing establishes a manageable baseline and reduces boom-bust cycles. It should not become a rule that the patient must stay below symptoms forever. Once a repeatable baseline is established, load, duration or frequency should gradually increase.",
        "A temporary flare can reflect sensitivity, fatigue or an overly large dose. It does not automatically mean tissue injury occurred."
      ]
    },
    {
      "heading": "5. Sleep and recovery",
      "paragraphs": [
        "Poor sleep can amplify pain, fatigue and exercise intolerance. Rehabilitation should therefore include basic sleep-hygiene discussion and appropriate referral when significant sleep disorder is suspected.",
        "Recovery should be tracked across days, not just during the session. The best exercise dose is one the patient can recover from and repeat."
      ]
    },
    {
      "heading": "6. Education",
      "bullets": [
        "Validate symptoms without equating pain intensity with structural damage.",
        "Explain that sensitivity and physical capacity can change over time.",
        "Avoid language such as 'your fascia is full of knots' or 'your body is damaged everywhere'.",
        "Use the patient’s goals to give exercise meaning.",
        "Encourage self-management rather than dependence on passive care."
      ]
    },
    {
      "heading": "7. Progression",
      "bullets": [
        "Increase one variable at a time.",
        "Use small, predictable increments when sensitivity is high.",
        "Monitor next-day recovery and function.",
        "Blend aerobic, strength and mobility work according to the patient’s goals.",
        "Reduce temporarily during a major flare, then rebuild rather than restarting from zero."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Treating every painful point as damaged tissue.",
        "Using only passive modalities for long periods.",
        "Progressing exercise too rapidly because the session itself felt easy.",
        "Telling patients to 'push through everything' or, at the opposite extreme, to avoid symptoms completely.",
        "Ignoring sleep, fatigue and psychosocial context."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Exercise works best when it is sustainable.",
        "A flare is information about dose, not automatic evidence of harm.",
        "Pacing should create a platform for progression.",
        "Function and participation are more meaningful than chasing zero pain.",
        "Communication can either reduce or amplify threat."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "Fibromyalgia rehabilitation should emphasize education, sustainable exercise, pacing, sleep and gradual restoration of function. A whole-person model is more useful than repeated local tissue treatment for a widespread, variable pain condition."
      ]
    }
  ]
},
{
  "slug": "resistance-training-prescription-rehabilitation",
  "specialty": "Exercise & Rehabilitation",
  "title": "Resistance Training Prescription in Rehabilitation: Load, Volume, Progression and Clinical Decision-Making",
  "excerpt": "A practical rehabilitation guide to prescribing resistance exercise using effort, load, sets, repetitions, frequency, recovery and progression rather than fixed one-size-fits-all formulas.",
  "category": "Exercise Prescription",
  "audience": "Students",
  "level": "Advanced",
  "readTime": "16 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Separate training variables such as load, volume, frequency, velocity and effort.",
    "Choose a starting resistance dose that matches the patient’s capacity and rehabilitation goal.",
    "Progress resistance exercise using performance and recovery criteria.",
    "Avoid common programming errors that lead to underloading or unnecessary flare-ups."
  ],
  "references": [
    {
      "title": "Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance: ACSM Position Stand",
      "organization": "American College of Sports Medicine",
      "year": "2026",
      "url": "https://acsm.org/science-spotlight-acsm-releases-new-position-stand-on-resistance-training/"
    },
    {
      "title": "ACSM Position Stands",
      "organization": "American College of Sports Medicine",
      "year": "2026",
      "url": "https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/"
    }
  ],
  "sections": [
    {
      "heading": "1. Exercise dosage has multiple variables",
      "paragraphs": [
        "Resistance training is not simply '3 sets of 10'. The training stimulus reflects load, repetitions, sets, frequency, exercise selection, range of motion, movement velocity, effort and recovery. Changing one variable changes the dose.",
        "Clinical programming should begin with the adaptation you want: strength, power, hypertrophy, endurance, confidence with loading or functional task capacity."
      ]
    },
    {
      "heading": "2. Choose the starting point",
      "bullets": [
        "What can the patient perform with acceptable technique?",
        "How irritable is the condition and how does it recover after loading?",
        "What is the training history?",
        "What equipment and time are available?",
        "Which movement pattern best connects to the functional goal?",
        "Are there medical or postoperative restrictions?"
      ]
    },
    {
      "heading": "3. Load and effort",
      "paragraphs": [
        "Heavier loading can be efficient for strength, but meaningful improvements can occur across a range of loads when effort and progression are appropriate. In early rehabilitation, a lighter load may allow better technique or symptom tolerance, while later phases may require heavier loading to restore high-level capacity.",
        "The load should be difficult enough to create adaptation but not so high that pain, compensation or recovery become unacceptable."
      ]
    },
    {
      "heading": "4. Volume and frequency",
      "paragraphs": [
        "Volume is commonly considered through sets and repetitions, but the useful dose depends on the individual’s training status and goal. Frequency determines how often a muscle or movement receives a training stimulus and must be balanced against recovery.",
        "For a deconditioned patient, two well-designed sessions may be more effective than a daily programme that is never completed."
      ]
    },
    {
      "heading": "5. Progression criteria",
      "bullets": [
        "Target repetitions are completed with stable technique.",
        "The final repetitions are challenging but controlled.",
        "Symptoms during training are acceptable for the condition.",
        "Post-exercise symptoms settle predictably.",
        "Performance is improving or the same task is becoming easier.",
        "The next functional demand requires greater strength, speed or endurance."
      ]
    },
    {
      "heading": "6. Strength versus power",
      "paragraphs": [
        "Strength is the ability to produce force; power includes the rate at which force is produced. A patient may regain slow strength yet still lack the rapid force needed to catch balance, climb stairs quickly or return to sport.",
        "Power training can be introduced with appropriate loads and faster intent when movement quality, tissue tolerance and safety allow."
      ]
    },
    {
      "heading": "7. Symptom-guided modification",
      "paragraphs": [
        "A symptom increase does not automatically require stopping all resistance training. First adjust the variable most likely responsible: range, load, number of sets, frequency, exercise choice or technique.",
        "When symptoms are severe, progressive, neurological or otherwise inconsistent with the expected response, reassess the diagnosis rather than endlessly changing exercise dosage."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Keeping patients on very light resistance long after they are ready to progress.",
        "Changing load, sets and frequency simultaneously so the cause of a flare is unclear.",
        "Using arbitrary repetitions without considering effort.",
        "Training isolated muscles while ignoring the functional task.",
        "Failing to track performance and therefore failing to progress."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Prescribe the adaptation, not a ritual.",
        "Effort and progression matter as much as the rep count.",
        "Recovery is part of the dose.",
        "Power may need specific training after basic strength returns.",
        "A simple programme performed consistently often beats a complicated programme with poor adherence."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "Resistance exercise in rehabilitation should be individualized around the patient’s goal, current capacity and recovery. Load, volume, effort, frequency and progression are adjustable tools, not fixed rules."
      ]
    }
  ]
},
{
  "slug": "mcid-mic-mdc-outcome-measure-interpretation",
  "specialty": "Research & Evidence",
  "title": "MCID vs MDC vs MIC: Meaningful Change and Measurement Error in Physiotherapy",
  "excerpt": "Understand MCID vs MDC, minimal important change, and measurement error in physiotherapy outcome measures—with clinical examples explaining whether a score change is real, meaningful, both or neither.",
  "category": "Outcome Measurement",
  "audience": "Students",
  "level": "Advanced",
  "readTime": "15 min read",
  "publishedAt": "2026-09-28",
  "updatedAt": "2026-09-28",
  "learningObjectives": [
    "Differentiate reliability, measurement error, responsiveness and interpretability.",
    "Explain the difference between minimal important change/difference and smallest detectable change.",
    "Avoid treating published MCID values as universal constants.",
    "Interpret patient change using measurement properties, context and uncertainty."
  ],
  "references": [
    {
      "title": "COSMIN: I’m deciding what to measure",
      "organization": "COSMIN",
      "url": "https://www.cosmin.nl/finding-right-tool/deciding-outcome-measure/"
    },
    {
      "title": "COSMIN Criteria for Good Measurement Properties Version 2.0",
      "organization": "COSMIN",
      "year": "2026",
      "url": "https://www.cosmin.nl/wp-content/uploads/COSMIN-Criteria-for-good-measurement-properties-version-2.0.pdf"
    },
    {
      "title": "COSMIN Manual for Systematic Reviews of PROMs",
      "organization": "COSMIN",
      "year": "2026",
      "url": "https://www.cosmin.nl/wp-content/uploads/COSMIN-manual-V2_final.pdf"
    }
  ],
  "sections": [
    {
      "heading": "1. Start with the construct",
      "paragraphs": [
        "Before choosing an outcome measure, define what you intend to measure. 'Pain' could mean pain intensity, interference, frequency or another construct. A measure can only be interpreted properly if its target construct is clear.",
        "Content validity is fundamental: if the items do not adequately represent the construct, excellent reliability statistics cannot rescue the measure."
      ]
    },
    {
      "heading": "2. Reliability versus measurement error",
      "paragraphs": [
        "Reliability describes how well an instrument can distinguish between people despite measurement error. Measurement error describes the random and systematic error in scores that is not true change.",
        "These ideas are related but not identical. A measure can rank people consistently yet still have enough absolute error to make small individual changes difficult to interpret."
      ]
    },
    {
      "heading": "3. Smallest detectable change",
      "paragraphs": [
        "The smallest detectable change, sometimes reported as SDC or MDC depending on terminology and method, estimates how large a change must be before it exceeds expected measurement error with a chosen level of confidence.",
        "A change smaller than this threshold may still matter to a patient, but the instrument may not be precise enough to distinguish that change confidently from noise."
      ]
    },
    {
      "heading": "4. Minimal important change or difference",
      "paragraphs": [
        "Minimal important change/difference refers to the smallest change considered meaningful from a patient or clinical perspective. It is an interpretability concept, not simply a property of the instrument itself.",
        "Values can differ across populations, anchors, baseline severity, follow-up intervals and methods. A published MCID should therefore not be treated as a universal biological constant."
      ]
    },
    {
      "heading": "5. Why SDC and MIC should be compared",
      "paragraphs": [
        "A useful measure should ideally have measurement error small enough that clinically important change can be detected. COSMIN criteria explicitly consider the relationship between smallest detectable change or limits of agreement and minimal important change.",
        "If the smallest detectable change is larger than the important-change threshold, small but meaningful improvements may be difficult to separate from measurement noise."
      ]
    },
    {
      "heading": "6. Responsiveness",
      "paragraphs": [
        "Responsiveness is the ability of an instrument to detect change over time in the construct it is intended to measure. It should be evaluated with hypotheses about expected change and relationships with other measures, not just by showing a statistically significant pre-post difference.",
        "A large effect size does not automatically prove that the measure is validly detecting the target construct."
      ]
    },
    {
      "heading": "7. Statistical significance is not clinical importance",
      "paragraphs": [
        "A group mean can change significantly with a large sample even when the average change is small. Conversely, an individual patient may report an important improvement that is not captured well by a noisy measure.",
        "Interpretation should combine magnitude of change, measurement error, meaningful-change estimates, confidence intervals and the patient’s functional context."
      ]
    },
    {
      "heading": "8. Common mistakes",
      "bullets": [
        "Using one MCID value for every population and time point.",
        "Confusing reliability with measurement error.",
        "Calling any statistically significant change clinically important.",
        "Using a measure because it is popular without checking content validity.",
        "Ignoring floor and ceiling effects.",
        "Assuming the instrument with the largest effect size is automatically the most responsive."
      ]
    },
    {
      "heading": "Clinical pearls",
      "bullets": [
        "Define the construct first.",
        "Check measurement properties in the population of interest.",
        "Ask whether the observed change exceeds likely measurement error.",
        "Treat MCID/MIC values as context-dependent estimates.",
        "Combine measurement with patient goals and functional change."
      ]
    },
    {
      "heading": "Concise summary",
      "paragraphs": [
        "Outcome-measure interpretation requires more than comparing a score with a single cutoff. Reliability, measurement error, responsiveness and meaningful-change estimates each answer different questions, and all must be interpreted in the context of the population and purpose."
      ]
    }
  ]
}
];

export const allKnowledgeArticles: KnowledgeArticle[] = [
  ...dailyKnowledgeArticles,
  ...knowledgeArticles.filter(
    (article) => !dailyKnowledgeArticles.some((daily) => daily.slug === article.slug)
  ),
];

export function getAllKnowledgeArticle(slug: string) {
  return allKnowledgeArticles.find((article) => article.slug === slug);
}
