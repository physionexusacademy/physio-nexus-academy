import type { KnowledgeArticle } from "@/lib/knowledge-content";
import { allKnowledgeArticles as previousKnowledgeArticles } from "@/lib/knowledge-daily";
import { dailyKnowledgeArticles20260929 } from "@/lib/knowledge-daily-2026-09-29";

export const allKnowledgeArticles: KnowledgeArticle[] = [
  ...dailyKnowledgeArticles20260929,
  ...previousKnowledgeArticles.filter(
    (article) => !dailyKnowledgeArticles20260929.some((daily) => daily.slug === article.slug)
  ),
];

export function getAllKnowledgeArticle(slug: string) {
  return allKnowledgeArticles.find((article) => article.slug === slug);
}
