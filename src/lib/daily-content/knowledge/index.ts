import type { KnowledgeArticle } from "@/lib/knowledge-content";

// Automation-safe registry for future daily Knowledge Hub packs.
// Each daily pack should live in its own dated folder, for example:
// ./2026-10-01/index.ts -> imports that day's one-article-per-specialty files.

// DAILY_KNOWLEDGE_IMPORTS_START
import { knowledge20261001 } from "./2026-10-01";
import { knowledge20261002 } from "./2026-10-02";
import { knowledge20261003 } from "./2026-10-03";
import { knowledge20261004 } from "./2026-10-04";
import { knowledge20261005 } from "./2026-10-05";
import { knowledge20261010 } from "./2026-10-10";
import { knowledge20261011 } from "./2026-10-11";
import { knowledge20261012 } from "./2026-10-12";
// DAILY_KNOWLEDGE_IMPORTS_END

export const modularKnowledgeArticles: KnowledgeArticle[] = [
  // DAILY_KNOWLEDGE_SPREADS_START
  ...knowledge20261012,
  ...knowledge20261011,
  ...knowledge20261010,
  ...knowledge20261005,
  ...knowledge20261004,
  ...knowledge20261003,
  ...knowledge20261002,
  ...knowledge20261001,
  // DAILY_KNOWLEDGE_SPREADS_END
];
