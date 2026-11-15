import { manualTherapyUrduContent } from "@/lib/manual-therapy-urdu-content";
import { manualTherapyUrduDepth } from "@/lib/manual-therapy-urdu-depth";
import { manualTherapyComponents } from "@/lib/manual-therapy-components";
import { getTechniqueDepth } from "@/lib/manual-therapy-depth";
import { getMasteryGuide } from "@/lib/manual-therapy-mastery";
import { UrduChapterGuide, ChapterComponentsView } from "@/components/manual-therapy/ChapterClient";

export type DemoCaption = { title: string; detail: string };

/** The chapter theory in Roman Urdu (shown only when the visitor picked Roman Urdu). Nothing is rendered for a slug without it. */
export function UrduGuideSection({ slug, name }: { slug: string; name: string }) {
  const content = manualTherapyUrduContent[slug];
  if (!content) return null;
  return <UrduChapterGuide name={name} short={content.short} sections={content.details} deeper={manualTherapyUrduDepth[slug] ?? []} />;
}

/** The named techniques inside the chapter, explained one by one (FDM's six, Spencer's seven, the Maitland grades…). */
export function ComponentsSection({ slug, name }: { slug: string; name: string }) {
  const data = manualTherapyComponents[slug];
  return data ? <ChapterComponentsView data={data} name={name} defaultKind={getTechniqueDepth(slug)?.demo ?? "glide"} /> : null;
}

/** This technique's own steps for the 2D demonstration, in English and in Roman Urdu. */
export function demoCaptions(slug: string): { en: DemoCaption[]; ur: DemoCaption[] } {
  const en = (getMasteryGuide(slug)?.steps ?? []).map((step) => ({ title: step.title, detail: step.detail }));
  const text = manualTherapyUrduContent[slug]?.details.find((section) => /^steps/i.test(section.heading))?.text ?? "";
  const parts = /^\s*1[.)]\s/.test(text) ? text.split(/\s*\n\s*|\s+(?=\d{1,2}[.)]\s)/).map((part) => part.replace(/^\d{1,2}[.)]\s*/, "").trim()).filter(Boolean) : [];
  const ur = parts.map((detail, index) => ({ title: `Qadam ${index + 1}`, detail }));
  return { en, ur };
}
