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
