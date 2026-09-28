import { allKnowledgeArticles as priorKnowledgeArticles } from "@/lib/knowledge-daily";
import { knowledgeArticles20260929 } from "@/lib/daily-content-2026-09-29";

export const allKnowledgeArticles = [...priorKnowledgeArticles, ...knowledgeArticles20260929];

export function getAllKnowledgeArticle(slug: string) {
  return allKnowledgeArticles.find((article) => article.slug === slug);
}
