export type KnowledgeSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type KnowledgeArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  audience: "Students" | "Professionals" | "Patients" | "All";
  readTime: string;
  publishedAt: string;
  updatedAt?: string;
  sections: KnowledgeSection[];
};

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "trigger-point-vs-tender-point",
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
];

export function getKnowledgeArticle(slug: string) {
  return knowledgeArticles.find((article) => article.slug === slug);
}
