import { UrduChapterGuide, ChapterComponentsView } from "@/components/manual-therapy/ChapterClient";
import type { ChapterData, DemoCaption } from "@/lib/manual-therapy-chapter-types";

export type { DemoCaption };

/** The chapter theory in Roman Urdu (shown only when the visitor picked Roman Urdu). Nothing is rendered for a chapter without it. */
export function UrduGuideSection({ urdu, name }: { urdu: ChapterData["urdu"]; name: string }) {
  if (!urdu) return null;
  return <UrduChapterGuide name={name} short={urdu.short} sections={urdu.details} deeper={urdu.deeper} />;
}

/** The named techniques inside the chapter, explained one by one (FDM's six, Spencer's seven, the Maitland grades…). */
export function ComponentsSection({ components, name, demo }: { components: ChapterData["components"]; name: string; demo: NonNullable<ChapterData["depth"]>["demo"] | undefined }) {
  return components ? <ChapterComponentsView data={components} name={name} defaultKind={demo ?? "glide"} /> : null;
}
