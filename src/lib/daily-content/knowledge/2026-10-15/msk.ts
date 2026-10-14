import type { KnowledgeArticle } from "@/lib/knowledge-content";

export const article: KnowledgeArticle = {
  slug: "tmd-chronic-pain-rehabilitation-20261015",
  title: "Temporomandibular Disorder: Function-Focused Assessment and Conservative Rehabilitation",
  excerpt: "A conservative pathway for painful temporomandibular disorders, including differential diagnosis, outcome tracking and evidence-informed exercise choices.",
  specialty: "Musculoskeletal (MSK)",
  category: "Jaw and Orofacial Rehabilitation",
  audience: "Professionals",
  level: "Advanced",
  readTime: "9–12 min read",
  publishedAt: "2026-10-15",
  learningObjectives: [
    "Distinguish pain-related TMD from incidental joint sounds and urgent mimics.",
    "Choose repeatable jaw-function measures and a person-specific goal.",
    "Build conservative care using education, graded exercise and appropriate manual therapy.",
    "Recognize features requiring dental or medical assessment."
  ],
  references: [
    { title: "Management of chronic pain associated with temporomandibular disorders: a clinical practice guideline", organization: "The BMJ", year: "2023", url: "https://www.bmj.com/content/383/bmj-2023-076227" },
    { title: "Diagnostic Criteria for Temporomandibular Disorders (DC/TMD)", organization: "Journal of Oral & Facial Pain and Headache", year: "2014", url: "https://doi.org/10.11607/jop.1151" }
  ],
  sections: [
    { heading: "Clinical framework", paragraphs: [
      "TMD is an umbrella term for disorders involving the temporomandibular joints, masticatory muscles and related structures. Pain, restricted movement and difficulty chewing matter more clinically than a click alone.",
      "For persistent pain, guidance favors reversible conservative approaches. Palpation or joint sounds alone do not prove a specific structural lesion."
    ]},
    { heading: "Assessment and differential diagnosis", bullets: [
      "Ask about familiar pain during chewing or yawning, locking, headache, dental symptoms, trauma, duration, sleep and limits on eating or speaking.",
      "Assess comfortable opening, lateral excursion, movement quality and reproduction of familiar symptoms. Track pain-free opening and a jaw-function questionnaire when available.",
      "Consider dental disease, neuropathic pain, headache disorders, inflammatory arthropathy, infection and cervical contributions when the pattern is atypical."
    ]},
    { heading: "Management and dose", bullets: [
      "Agree a meaningful goal such as eating comfortably or returning to a valued activity. Explain the working diagnosis and uncertainty.",
      "Use individualized jaw coordination/mobility exercise, gentle stretching when appropriate and supervised postural exercise. The BMJ guideline supports several conservative approaches for chronic painful TMD, including supervised jaw exercise and therapist-assisted mobilization.",
      "A pragmatic start may be brief, comfortable sets of controlled opening and lateral movement once or twice daily. Adjust to irritability and next-day response; this is not a universal prescription. Manual therapy should support active self-management, not promise realignment."
    ]},
    { heading: "Progression and outcomes", bullets: [
      "Progress range, repetitions and functional chewing exposure one variable at a time. Reassess familiar pain, opening and the chosen task in roughly 2–4 weeks.",
      "Avoid repeatedly provoking a severe flare to 'break adhesions'. Do not prescribe irreversible occlusal changes or invasive procedures as physiotherapy treatment.",
      "Refer when dental pathology is plausible, locking persists or diagnosis is uncertain."
    ]},
    { heading: "Safety and clinical pearl", bullets: [
      "Urgent assessment is warranted for facial swelling with fever, suspected infection, significant trauma, rapidly progressive trismus, new cranial-nerve signs or a suspicious mass. Exertional jaw pain with cardiopulmonary symptoms requires emergency assessment.",
      "Do not diagnose TMD from clicking alone or assume every headache is jaw-driven. Measure what matters to the person and reassess whether the chosen intervention is helping."
    ]}
  ]
};
