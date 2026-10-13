import { allKnowledgeArticles } from "@/lib/all-knowledge-content";
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
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

const caseResources: PnaLearningResource[] = clinicalCases.map((item) => ({
  id: `case:${item.slug}`,
  title: item.title,
  href: `/case-lab/${encodeURIComponent(item.slug)}`,
  category: item.specialty,
  summary: item.summary,
  level: item.difficulty,
  keywords: [item.title, item.slug, item.specialty, item.summary, ...item.learningPoints].join(" "),
}));

const uniqueResources = new Map<string, PnaLearningResource>();
for (const resource of [...knowledgeResources, ...manualResources, ...mskResources, ...treatmentResources, ...caseResources]) {
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
