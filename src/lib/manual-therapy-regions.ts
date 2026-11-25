/**
 * The regional manual-therapy guides as static data (public/manual-therapy-data/regions/), the same idea as the chapter data (manual-therapy-chapter-types.ts).
 *
 * The guides (src/lib/manual-therapy-regional*.ts, -subtechniques, -priority-depth, -stories, -learning-labs: about 230 KB of source, ~60 KiB gzip) used to be imported by the
 * regions pages, the sitemap and the AI assistant, so they travelled inside the Cloudflare worker. Now only the generator script and the validator import them;
 * pages read one small file per guide and one index through manual-therapy-chapter-loader.ts.
 *
 * This file holds types and one tiny function: nothing heavy may be imported here except as `import type` (erased).
 */
import type { ManualRegion, RegionalManualApplication } from "@/lib/manual-therapy-regional";
import type { RegionalSubTechnique } from "@/lib/manual-therapy-subtechniques";
import type { RegionalClinicalStory } from "@/lib/manual-therapy-regional-stories";
import type { Walkthrough } from "@/lib/manual-therapy-regional-learning-labs";

export type { ManualRegion, RegionalManualApplication, RegionalSubTechnique, RegionalClinicalStory, Walkthrough };

/** Everything the page of one regional guide needs. */
export type RegionData = {
  /** Bump when the shape changes (the loader refuses a file it does not understand). */
  version: 1;
  item: RegionalManualApplication;
  /** Specific variations, only for guides that have no clinical story (as the page always did). */
  subTechniques: RegionalSubTechnique[];
  story: RegionalClinicalStory | null;
  /** The learning lab shown with the story (looked up by technique, as before). */
  lab: Walkthrough | null;
};

/** What the lists, the sitemap and the assistant need of each guide. */
export type RegionIndexItem = Pick<RegionalManualApplication, "slug" | "techniqueSlug" | "techniqueName" | "region" | "title" | "applicability"> & {
  /** The first two lines are enough for the cards and the assistant. */
  clinicalUse: string[];
  /** True for the hand-authored base list that the sitemap and the assistant index (not the generated overviews). */
  listed: boolean;
  /** That list's own applicability (the assistant shows "Clinical" when there is none). */
  listedApplicability: RegionalManualApplication["applicability"] | null;
};

export type RegionIndex = { version: 1; regions: ManualRegion[]; items: RegionIndexItem[] };

/** Generated guide-* records are orientation templates, never validated technique-specific protocols. */
export function isTechniqueSpecificRegionalApplication(application: { slug: string }) {
  return !application.slug.startsWith("guide-");
}
