/**
 * One Manual Therapy chapter, everything its page needs except the base technique record, as plain data.
 *
 * Why this exists: the chapter pages are prerendered, but their data (guides, mechanisms, mastery guides, expert depth, Roman Urdu text...) used to be imported by
 * the page code and so travelled inside the Cloudflare worker (about 760 KB of source, over 200 KiB gzip). The data now lives in static files
 * (public/manual-therapy-data/chapters/<slug>.json, written by `npm run build:manual-therapy-data`) and a chapter reads its own file when it is built (or, on a
 * cache miss, through the ASSETS binding). The page then renders exactly what it rendered before, from the same values.
 *
 * This file holds TYPES ONLY (type imports are erased, so nothing here reaches the worker). The values are put together by
 * src/lib/manual-therapy-chapter-build.ts, which only the generator script and the validator import.
 */
import type { MasteryGuide } from "@/lib/manual-therapy-mastery-types";
import type { TechniqueDepth } from "@/lib/manual-therapy-depth-types";
import type { ChapterComponents } from "@/lib/manual-therapy-components";
import type { TechniqueUrduContent, TechniqueUrduSection } from "@/components/manual-therapy/UnderstandThisTechnique";
import type { AttentionCue } from "@/lib/manual-therapy-attention-cues";
import type { ClinicalEpisode } from "@/lib/manual-therapy-episodes";
import type { ManualTherapyAhaMoment } from "@/lib/manual-therapy-aha-moments";
import type { LessonWeave } from "@/lib/manual-therapy-lesson-weave";
import type { ManualApplicationGuide } from "@/lib/manual-therapy-guides";
import type { ManualTherapyMechanism, manualTherapyMechanismEvidence } from "@/lib/manual-therapy-mechanisms";
import type { ManualTherapyVisual } from "@/lib/manual-therapy-visuals";
import type { WorldDeepChapter } from "@/lib/manual-therapy-world-depth-types";

export type DemoCaption = { title: string; detail: string };
export type RoomScene = { arrival: string; touch: string; retest: string };
export type ChapterUrdu = { short: TechniqueUrduContent["short"]; details: TechniqueUrduContent["details"]; deeper: TechniqueUrduSection[] };

export type ChapterData = {
  /** Bump when the shape changes (the loader refuses a file it does not understand). */
  version: 1;
  slug: string;
  kind: "technique" | "world";
  mastery: MasteryGuide | null;
  depth: TechniqueDepth | null;
  components: ChapterComponents | null;
  urdu: ChapterUrdu | null;
  /** The technique's own demonstration steps in English and Roman Urdu (taken from the mastery guide and the Urdu "steps" section). */
  captions: { en: DemoCaption[]; ur: DemoCaption[] };
  cue: AttentionCue | null;
  /** Technique chapters only (null for the world approaches). */
  technique: {
    storyHeadline: string | null;
    episode: ClinicalEpisode | null;
    aha: ManualTherapyAhaMoment | null;
    weave: LessonWeave | null;
    guide: ManualApplicationGuide;
    mechanism: ManualTherapyMechanism;
    mechanismEvidence: typeof manualTherapyMechanismEvidence;
    visuals: ManualTherapyVisual[];
    room: RoomScene | null;
  } | null;
  /** World-approach chapters only: the long "go deeper" chapter. */
  worldDeep: WorldDeepChapter | null;
};

/** What the Manual Therapy index page needs of every chapter (a card): a one-line story, a scene, the closing line, and whether it has the 2D demonstration + expert depth. */
export type ChapterCard = { slug: string; hasDepth: boolean; oneLine: string | null; storyHeadline: string | null; storyScene: string | null; closer: string | null };
export type ChapterIndex = { version: 1; cards: Record<string, ChapterCard> };
