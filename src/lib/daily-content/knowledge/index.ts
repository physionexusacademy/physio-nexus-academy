import type { KnowledgeArticle } from "@/lib/knowledge-content";

// Automation-safe registry for future daily Knowledge Hub packs.
// Each daily pack should live in its own dated folder, for example:
// ./2026-10-01/index.ts -> imports that day's one-article-per-specialty files.

// DAILY_KNOWLEDGE_IMPORTS_START
import { knowledge20261001 } from "./2026-10-01";
import { knowledge20261002 } from "./2026-10-02";
// DAILY_KNOWLEDGE_IMPORTS_END

export const modularKnowledgeArticles: KnowledgeArticle[] = [
  // DAILY_KNOWLEDGE_SPREADS_START
  ...knowledge20261002,
  ...knowledge20261001,
  // DAILY_KNOWLEDGE_SPREADS_END
];