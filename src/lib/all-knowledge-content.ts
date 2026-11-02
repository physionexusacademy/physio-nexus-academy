import type { KnowledgeArticle } from "@/lib/knowledge-content";
import { allKnowledgeArticles as legacyKnowledgeArticles } from "@/lib/knowledge-daily";
import { modularKnowledgeArticles } from "@/lib/daily-content/knowledge";

export const allKnowledgeArticles: KnowledgeArticle[] = [
  ...modularKnowledgeArticles,
  ...legacyKnowledgeArticles.filter(
    (legacy) => !modularKnowledgeArticles.some((daily) => daily.slug === legacy.slug)
  ),
];

export function getAllKnowledgeArticle(slug: string) {
  return allKnowledgeArticles.find((article) => article.slug === slug);
}
