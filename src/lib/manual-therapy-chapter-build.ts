/**
 * Puts together the static data of every Manual Therapy chapter (see manual-therapy-chapter-types.ts).
 *
 * ONLY scripts/build-manual-therapy-data.ts and scripts/validate-manual-therapy-data.ts import this file. It pulls in every heavy data module on purpose;
 * if a page or component imported it, those modules would travel inside the Cloudflare worker again (the validator fails when anything under src/app or
 * src/components imports it, or imports one of the heavy data modules for a chapter directly).
 */
import { manualTherapyTechniques } from "@/lib/all-manual-therapy";
import { worldManualApproaches } from "@/lib/manual-therapy-world";
import { manualApplicationGuides } from "@/lib/all-manual-therapy-guides";
import { manualTherapyMechanisms, manualTherapyMechanismEvidence } from "@/lib/all-manual-therapy-mechanisms";
import { getManualTherapyStory } from "@/lib/manual-therapy-stories";
import { getClinicalEpisode } from "@/lib/manual-therapy-episodes";
import { getManualTherapyAhaMoment } from "@/lib/manual-therapy-aha-moments";
import { manualTherapyLessonWeaves } from "@/lib/manual-therapy-lesson-weave";
import { getManualTherapyExpertProfile } from "@/lib/manual-therapy-expert";
import { getMasteryGuide } from "@/lib/manual-therapy-mastery";
import { getTechniqueDepth } from "@/lib/manual-therapy-depth";
import { manualTherapyComponents } from "@/lib/manual-therapy-components";
import { manualTherapyUrduContent } from "@/lib/manual-therapy-urdu-content";
import { manualTherapyUrduDepth } from "@/lib/manual-therapy-urdu-depth";
import { coreAttentionCues } from "@/lib/manual-therapy-attention-cues";
import { clinicalRoomScenes } from "@/lib/manual-therapy-room-scenes";
import { getManualTherapyVisuals } from "@/lib/manual-therapy-visuals";
import { worldManualDeepChapters } from "@/lib/manual-therapy-world-depth";
import { completeRegionalManualApplications, regionalManualApplications, manualRegions } from "@/lib/manual-therapy-regional";
import { getRegionalSubTechniques } from "@/lib/manual-therapy-subtechniques";
import { regionalClinicalStories } from "@/lib/manual-therapy-regional-stories";
import { regionalLearningLabs } from "@/lib/manual-therapy-regional-learning-labs";
import type { ChapterCard, ChapterData, ChapterIndex, DemoCaption } from "@/lib/manual-therapy-chapter-types";
import type { RegionData, RegionIndex } from "@/lib/manual-therapy-regions";

/** The steps of the 2D demonstration in English and Roman Urdu (moved here from ChapterExtras, same rules). */
function demoCaptions(slug: string): { en: DemoCaption[]; ur: DemoCaption[] } {
  const en = (getMasteryGuide(slug)?.steps ?? []).map((step) => ({ title: step.title, detail: step.detail }));
  const text = manualTherapyUrduContent[slug]?.details.find((section) => /^steps/i.test(section.heading))?.text ?? "";
  const parts = /^\s*1[.)]\s/.test(text) ? text.split(/\s*\n\s*|\s+(?=\d{1,2}[.)]\s)/).map((part) => part.replace(/^\d{1,2}[.)]\s*/, "").trim()).filter(Boolean) : [];
  const ur = parts.map((detail, index) => ({ title: `Qadam ${index + 1}`, detail }));
  return { en, ur };
}

/** Every slug that has a chapter page (the same list the page's generateStaticParams uses). */
export function chapterSlugs(): string[] {
  return [...manualTherapyTechniques.map((technique) => technique.slug), ...worldManualApproaches.map((approach) => approach.slug)];
}

/** null when the chapter page would answer 404 (a technique without its guide, mechanism or expert profile). */
export function buildChapterData(slug: string): ChapterData | null {
  const common = {
    version: 1 as const,
    slug,
    mastery: getMasteryGuide(slug) ?? null,
    depth: getTechniqueDepth(slug) ?? null,
    components: manualTherapyComponents[slug] ?? null,
    urdu: manualTherapyUrduContent[slug]
      ? { short: manualTherapyUrduContent[slug].short, details: manualTherapyUrduContent[slug].details, deeper: manualTherapyUrduDepth[slug] ?? [] }
      : null,
    captions: demoCaptions(slug),
    cue: coreAttentionCues[slug] ?? null,
  };
  if (worldManualApproaches.some((approach) => approach.slug === slug)) {
    return { ...common, kind: "world", technique: null, worldDeep: worldManualDeepChapters[slug] ?? null };
  }
  const technique = manualTherapyTechniques.find((item) => item.slug === slug);
  const guide = manualApplicationGuides[slug];
  const mechanism = manualTherapyMechanisms[slug];
  if (!technique || !guide || !mechanism || !getManualTherapyExpertProfile(slug)) return null;
  return {
    ...common,
    kind: "technique",
    technique: {
      storyHeadline: getManualTherapyStory(slug)?.headline ?? null,
      episode: getClinicalEpisode(slug) ?? null,
      aha: getManualTherapyAhaMoment(slug) ?? null,
      weave: manualTherapyLessonWeaves[slug] ?? null,
      guide,
      mechanism,
      mechanismEvidence: manualTherapyMechanismEvidence,
      visuals: getManualTherapyVisuals(slug),
      room: clinicalRoomScenes[slug] ?? null,
    },
    worldDeep: null,
  };
}

export function buildChapterIndex(): ChapterIndex {
  const cards: Record<string, ChapterCard> = {};
  for (const slug of chapterSlugs()) {
    const story = getManualTherapyStory(slug);
    cards[slug] = {
      slug,
      hasDepth: Boolean(getTechniqueDepth(slug)),
      oneLine: getMasteryGuide(slug)?.oneLine ?? null,
      storyHeadline: story?.headline ?? null,
      storyScene: story?.scene ?? null,
      closer: manualTherapyLessonWeaves[slug]?.closer ?? null,
    };
  }
  return { version: 1, cards };
}

/** The regional guides: one index and one file per guide (see manual-therapy-regions.ts). */
export function regionSlugs(): string[] {
  return completeRegionalManualApplications.map((item) => item.slug);
}

export function buildRegionIndex(): RegionIndex {
  const base = new Map(regionalManualApplications.map((item) => [item.slug, item]));
  return {
    version: 1,
    regions: [...manualRegions],
    items: completeRegionalManualApplications.map((item) => {
      const listed = base.get(item.slug);
      return {
        slug: item.slug,
        techniqueSlug: item.techniqueSlug,
        techniqueName: item.techniqueName,
        region: item.region,
        title: item.title,
        applicability: item.applicability,
        clinicalUse: item.clinicalUse.slice(0, 2),
        listed: Boolean(listed),
        listedApplicability: listed ? listed.applicability ?? null : null,
      };
    }),
  };
}

export function buildRegionData(slug: string): RegionData | null {
  const item = completeRegionalManualApplications.find((entry) => entry.slug === slug);
  if (!item) return null;
  const story = regionalClinicalStories[item.slug] ?? null;
  const data: RegionData = {
    version: 1,
    item,
    subTechniques: story ? [] : getRegionalSubTechniques(item.techniqueSlug, item.region),
    story,
    lab: story ? regionalLearningLabs[item.techniqueSlug] ?? null : null,
  };
  // Optional fields that are undefined simply are not there in the file (the page reads them the same way); spelling that out keeps the data plain.
  return JSON.parse(JSON.stringify(data)) as RegionData;
}

/** Exact file contents (path -> text), so the validator can tell when the generated files are stale. */
export function serializeChapterData(): Record<string, string> {
  const files: Record<string, string> = {
    "public/manual-therapy-data/index.json": JSON.stringify(buildChapterIndex()) + "\n",
    "public/manual-therapy-data/regions/index.json": JSON.stringify(buildRegionIndex()) + "\n",
  };
  for (const slug of regionSlugs()) {
    const data = buildRegionData(slug);
    if (data) files[`public/manual-therapy-data/regions/${slug}.json`] = JSON.stringify(data) + "\n";
  }
  for (const slug of chapterSlugs()) {
    const data = buildChapterData(slug);
    if (data) files[`public/manual-therapy-data/chapters/${slug}.json`] = JSON.stringify(data) + "\n";
  }
  return files;
}
