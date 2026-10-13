import { allKnowledgeArticles } from "@/lib/all-knowledge-content";
import { knowledgeSpecialties } from "@/lib/knowledge-content";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { regionalManualApplications } from "@/lib/manual-therapy-regional";
import { mskSpecialTests } from "@/lib/msk-special-tests";
import { clinicalVisualAtlas } from "@/lib/clinical-visual-atlas";
import { mskConditions } from "@/lib/msk-injury-hub";
import { treatmentPlans } from "@/lib/treatment-plans";
import { clinicalCases } from "@/lib/all-clinical-cases";

export type PnaLearningResource = {
  id: string;
  title: string;
  href: string;
  category: string;
  summary: string;
  level?: string;
  keywords: string;
};

const knowledgeResources: PnaLearningResource[] = allKnowledgeArticles.map((item) => ({
  id: `knowledge:${item.slug}`,
  title: item.title,
  href: `/knowledge-hub/${encodeURIComponent(item.slug)}`,
  category: item.specialty,
  summary: item.excerpt,
  level: item.level ?? "Clinical",
  keywords: [item.title, item.slug, item.specialty, item.category, item.audience, item.level, ...(item.learningObjectives ?? [])].filter(Boolean).join(" "),
}));

const specialtyResources: PnaLearningResource[] = knowledgeSpecialties.map((item) => ({
  id: `specialty:${item.slug}`,
  title: `${item.name} Learning Resources`,
  href: `/knowledge-hub/specialty/${encodeURIComponent(item.slug)}`,
  category: "Knowledge Hub",
  summary: item.description,
  level: "Foundation to Advanced",
  keywords: [item.name, item.slug, item.description].join(" "),
}));

const manualResources: PnaLearningResource[] = [
  ...manualTherapyTechniques.map((item) => ({
    id: `manual:${item.slug}`,
    title: item.name,
    href: `/manual-therapy/${encodeURIComponent(item.slug)}`,
    category: item.family,
    summary: item.summary,
    level: item.level,
    keywords: [item.name, item.slug, item.family, item.level, item.summary, ...item.indications].join(" "),
  })),
  ...worldManualApproaches.map((item) => ({
    id: `approach:${item.slug}`,
    title: item.title,
    href: `/manual-therapy/${encodeURIComponent(item.slug)}`,
    category: item.category,
    summary: item.summary,
    level: "Clinical",
    keywords: [item.title, item.slug, item.category, item.kind, item.summary].join(" "),
  })),
  ...regionalManualApplications.map((item) => ({
    id: `regional:${item.slug}`,
    title: item.title,
    href: `/manual-therapy/regions/${encodeURIComponent(item.slug)}`,
    category: `Regional manual therapy · ${item.region}`,
    summary: item.clinicalUse.slice(0, 2).join(" "),
    level: item.applicability ?? "Clinical",
    keywords: [item.title, item.slug, item.techniqueName, item.region, ...item.clinicalUse].join(" "),
  })),
];

const mskResources: PnaLearningResource[] = mskConditions.map((item) => ({
  id: `msk:${item.slug}`,
  title: item.name,
  href: `/msk-injuries/${encodeURIComponent(item.slug)}`,
  category: `MSK condition · ${item.region}`,
  summary: item.summary,
  level: "Clinical",
  keywords: [item.name, item.slug, item.region, item.category, item.summary, ...item.symptoms, ...item.differentials].join(" "),
}));

const treatmentResources: PnaLearningResource[] = treatmentPlans.map((item) => ({
  id: `plan:${item.slug}`,
  title: `${item.name} — Treatment Plan`,
  href: `/treatment-plans/${encodeURIComponent(item.slug)}`,
  category: item.category,
  summary: item.summary,
  level: "Clinical",
  keywords: [item.name, item.slug, item.category, item.summary, ...item.assessment, ...item.exercises].join(" "),
}));

const assessmentResources: PnaLearningResource[] = [
  {
    id: "library:msk-special-tests",
    title: "MSK Special Tests Library",
    href: "/msk-special-tests",
    category: "Assessment",
    summary: "Browse physiotherapy special tests with purpose, patient position, steps, positive findings and clinical interpretation.",
    level: "Clinical",
    keywords: ["MSK special tests assessment examination " + mskSpecialTests.map((item) => [item.name, item.region, item.purpose, item.meaning].join(" ")).join(" ")].join(" "),
  },
  ...clinicalVisualAtlas.filter((item) => item.assetReady).map((item) => ({
    id: `atlas:${item.slug}`,
    title: item.title,
    href: `/clinical-visual-atlas/${encodeURIComponent(item.slug)}`,
    category: `Clinical Visual Atlas · ${item.region}`,
    summary: item.summary,
    level: "Visual learning",
    keywords: [item.title, item.slug, item.region, item.category, item.summary, ...item.learningPoints].join(" "),
  })),
];

const caseResources: PnaLearningResource[] = clinicalCases.map((item) => ({
  id: `case:${item.slug}`,
  title: item.title,
  href: `/case-lab/${encodeURIComponent(item.slug)}`,
  category: item.specialty,
  summary: item.summary,
  level: item.difficulty,
  keywords: [item.title, item.slug, item.specialty, item.summary, ...item.learningPoints].join(" "),
}));

const browseResources: PnaLearningResource[] = [
  {
    id: "service:appointment",
    title: "Request an Appointment or Online Consultation",
    href: "/appointment",
    category: "Patient services",
    summary: "Open the existing appointment form to request an in-person or online consultation. The team confirms availability; this AI does not book or confirm slots.",
    level: "Patient service",
    keywords: "appointment book booking schedule consultation online clinic physiotherapy appointment date time request reserve",
  },
  {
    id: "service:home-visit",
    title: "Request a Physiotherapy Home Visit",
    href: "/home-visit",
    category: "Patient services",
    summary: "Open the home-visit request form for Karachi or Hyderabad. The team must confirm service area and availability before a visit is finalized.",
    level: "Patient service",
    keywords: "home visit home-visit house call at home physiotherapy home treatment book booking request Karachi Hyderabad area address appointment",
  },
  {
    id: "quiz:daily-challenge",
    title: "Daily Clinical Challenge",
    href: "/daily-challenge",
    category: "Quiz and clinical practice",
    summary: "Open the daily five-question physiotherapy challenge, timed questions and public leaderboard.",
    level: "Clinical practice",
    keywords: "daily quiz daily challenge MCQ test questions practice exam score leaderboard",
  },
  {
    id: "quiz:weekly-clinical",
    title: "Weekly Clinical Quiz",
    href: "/clinical-quiz",
    category: "Quiz and clinical practice",
    summary: "Open the weekly clinical quiz with timed questions and top-scorer information.",
    level: "Clinical practice",
    keywords: "weekly quiz clinical quiz test MCQ questions timer score winners",
  },
  {
    id: "service:patient-services",
    title: "Patient Services",
    href: "/patient-services",
    category: "Patient services",
    summary: "Explore the patient-service options available through Physio Nexus Academy.",
    level: "Patient service",
    keywords: "patient service patient services help appointment home visit physiotherapy care",
  },
  {
    id: "tool:symptom-checker",
    title: "Symptom Checker",
    href: "/symptom-checker",
    category: "Website tool",
    summary: "Open the website's symptom-checking tool. It is not a diagnosis and does not replace professional assessment.",
    level: "Information tool",
    keywords: "symptom checker symptoms pain problem where to start guidance body area",
  },
  {
    id: "browse:contact",
    title: "Contact PNA",
    href: "/contact",
    category: "Contact and support",
    summary: "Find the website's contact options for questions and support.",
    level: "Support",
    keywords: "contact support message email ask question help reach team",
  },
  {
    id: "browse:faq",
    title: "Frequently Asked Questions",
    href: "/faq",
    category: "Help",
    summary: "Read answers to common questions about Physio Nexus Academy and its services.",
    level: "Help",
    keywords: "FAQ frequently asked questions help how does it work policy",
  },
  {
    id: "browse:about",
    title: "About Physio Nexus Academy",
    href: "/about",
    category: "About PNA",
    summary: "Learn about Physio Nexus Academy and its purpose.",
    level: "Information",
    keywords: "about academy mission vision who are we physio nexus",
  },
  {
    id: "browse:faculty",
    title: "PNA Faculty",
    href: "/faculty",
    category: "People",
    summary: "Explore faculty and contributors listed by Physio Nexus Academy.",
    level: "Information",
    keywords: "faculty trainers teachers instructors team educators",
  },
  {
    id: "browse:updates",
    title: "PNA Updates",
    href: "/updates",
    category: "News and updates",
    summary: "Browse updates and announcements from Physio Nexus Academy.",
    level: "Information",
    keywords: "updates announcements news latest events",
  },
  {
    id: "browse:reviews",
    title: "Reviews",
    href: "/reviews",
    category: "Feedback",
    summary: "Open the reviews section for Physio Nexus Academy.",
    level: "Information",
    keywords: "reviews testimonials feedback ratings experience",
  },
  {
    id: "browse:training",
    title: "Training & Learning History",
    href: "/training",
    category: "Training",
    summary: "Browse training and learning experiences recorded on the PNA website.",
    level: "All levels",
    keywords: "training experience learning history workshops events",
  },
  {
    id: "browse:resources",
    title: "Books & Learning Resources",
    href: "/resources",
    category: "Books, PDFs and study material",
    summary: "Browse the learning resources currently available from Physio Nexus Academy.",
    level: "All levels",
    keywords: "books pdf ebook study guide learning material download manual therapy",
  },
  {
    id: "browse:workshops",
    title: "Workshops & Practical Training",
    href: "/workshops",
    category: "Hands-on learning",
    summary: "Explore upcoming workshops and practical training opportunities.",
    level: "Professional development",
    keywords: "workshop course practical hands-on training registration certificate contact hours",
  },
  {
    id: "browse:research",
    title: "Research Support",
    href: "/research",
    category: "Research and evidence",
    summary: "Explore research guidance, evidence-based practice, and academic support.",
    level: "Students and professionals",
    keywords: "research thesis synopsis systematic review meta-analysis RCT methodology evidence",
  },
  {
    id: "browse:daily-challenge",
    title: "Daily Clinical Challenge",
    href: "/daily-challenge",
    category: "Clinical reasoning practice",
    summary: "Practise with daily physiotherapy questions and clinical decision-making.",
    level: "Clinical",
    keywords: "quiz daily challenge MCQ test questions practice exam clinical reasoning",
  },
  {
    id: "browse:courses",
    title: "Courses",
    href: "/courses",
    category: "Structured learning",
    summary: "Browse the course section on Physio Nexus Academy.",
    level: "All levels",
    keywords: "course curriculum learning program",
  },
];

const uniqueResources = new Map<string, PnaLearningResource>();
for (const resource of [...knowledgeResources, ...specialtyResources, ...manualResources, ...mskResources, ...treatmentResources, ...assessmentResources, ...caseResources, ...browseResources]) {
  if (!uniqueResources.has(resource.href)) uniqueResources.set(resource.href, resource);
}

export const pnaLearningResources = Array.from(uniqueResources.values());

const stopWords = new Set([
  "a", "an", "and", "are", "at", "be", "by", "can", "do", "for", "from", "how",
  "i", "in", "is", "it", "learn", "me", "my", "of", "on", "or", "please", "show",
  "start", "the", "to", "want", "what", "where", "with", "would",
]);

const synonymMap: Record<string, string[]> = {
  mfr: ["myofascial", "release", "soft tissue"],
  "myofascial release": ["mfr", "fascia", "soft tissue"],
  scs: ["strain", "counterstrain", "positional release"],
  "strain counterstrain": ["scs", "positional release", "osteopathic"],
  "dry needling": ["needling", "trigger point"],
  "neck": ["cervical"],
  "low back": ["lumbar", "low-back"],
  "back pain": ["lumbar", "spine"],
  "knee": ["patellofemoral", "acl", "meniscus"],
  "shoulder": ["rotator cuff", "glenohumeral"],
  "stroke": ["neurological", "neurorehabilitation", "hemiplegia"],
  "research": ["evidence", "systematic review", "randomized controlled trial"],
  "treatment plan": ["rehabilitation", "exercise", "assessment"],
  "home visit": ["home-visit", "house call", "at home", "physiotherapy"],
  "appointment": ["booking", "consultation", "schedule"],
  "book": ["booking", "appointment", "home visit", "resources"],
  "quiz": ["daily challenge", "clinical quiz", "MCQ", "test"],
  "contact": ["support", "message", "help"],
  "symptom checker": ["symptoms", "patient services"],
};

export function expandPnaQuery(query: string): string[] {
  const normalized = query.toLowerCase().replace(/[^a-z0-9+\s-]/g, " ").replace(/\s+/g, " ").trim();
  const expanded = new Set(normalized.split(" ").filter((token) => token.length > 1 && !stopWords.has(token)));
  for (const [phrase, synonyms] of Object.entries(synonymMap)) {
    if (normalized.includes(phrase)) {
      for (const synonym of synonyms) {
        for (const token of synonym.split(" ")) if (token.length > 1) expanded.add(token);
      }
    }
  }
  return Array.from(expanded);
}

export function searchPnaResources(query: string, limit = 8) {
  const tokens = expandPnaQuery(query);
  if (tokens.length === 0) return [];

  const normalizedQuery = query.toLowerCase().trim();
  return pnaLearningResources
    .map((resource) => {
      const title = resource.title.toLowerCase();
      const slug = resource.href.toLowerCase();
      const haystack = resource.keywords.toLowerCase();
      let score = 0;

      if (title === normalizedQuery) score += 18;
      if (title.includes(normalizedQuery) && normalizedQuery.length > 3) score += 10;

      for (const token of tokens) {
        if (title.includes(token)) score += 5;
        if (slug.includes(token)) score += 4;
        if (haystack.includes(token)) score += 1;
      }

      const uniqueTokens = new Set(tokens);
      const matchedTitleTokens = Array.from(uniqueTokens).filter((token) => title.includes(token)).length;
      if (uniqueTokens.size > 0) score += Math.round((matchedTitleTokens / uniqueTokens.size) * 5);

      return { resource, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.title.localeCompare(b.resource.title))
    .slice(0, limit);
}
