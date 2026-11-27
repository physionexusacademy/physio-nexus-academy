import data from "./generated/related.json";

/**
 * Links that join the site's sections (built by scripts/build-related-data.ts; see that file for how they are chosen).
 * relatedForCondition: what a condition guide points to. conditionsLinkingTo: the condition guides that point at a page, so that page can link back.
 */
export type RelLink = { href: string; title: string };
export type RelatedFor = { handouts: RelLink[]; atlas: RelLink[]; lessons: RelLink[]; skills: RelLink[]; techniques: RelLink[] };

const rel = data as { conditions: Record<string, string>; byCondition: Record<string, RelatedFor>; back: Record<string, string[]> };

export function relatedForCondition(slug: string): RelatedFor | undefined {
  return rel.byCondition[slug];
}

/** Condition guides that link to this page (href like "/handouts/neck-pain"), as links. */
export function conditionsLinkingTo(href: string, limit = 12): RelLink[] {
  return (rel.back[href] ?? []).slice(0, limit).map((slug) => ({ href: `/conditions/${slug}`, title: rel.conditions[slug] ?? slug }));
}
