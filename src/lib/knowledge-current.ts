import { allKnowledgeArticles as priorKnowledgeArticles } from "./knowledge-daily";
import { knowledgeArticles20260929 } from "./daily-content-2026-09-29";

export const allKnowledgeArticles = [...priorKnowledgeArticles, ...knowledgeArticles20260929];

export function getAllKnowledgeArticle(slug: string) {
  return allKnowledgeArticles.find((article) => article.slug === slug);
}
