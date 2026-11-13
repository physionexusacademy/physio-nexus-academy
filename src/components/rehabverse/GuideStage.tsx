"use client";

import dynamic from "next/dynamic";
import { COMMON_TOPICS, type GuideBeat, type GuideTopic } from "@/lib/rehabverse/guide";
import { useRvLang } from "./useLang";

const PhysioGuide = dynamic(() => import("./PhysioGuide"), {
  ssr: false,
  loading: () => <div className="rv-glass aspect-[4/3] animate-pulse sm:aspect-[16/10]" aria-hidden="true" />,
});

/** The 3D guide, loaded only in the browser. Uses the shared language choice. */
export function GuideStage({ beats, extraTopics = [], restartKey, compact, className, autoPlay = true }: { beats: GuideBeat[]; extraTopics?: GuideTopic[]; restartKey?: string; compact?: boolean; className?: string; autoPlay?: boolean }) {
  const [lang] = useRvLang();
  return <PhysioGuide beats={beats} topics={[...extraTopics, ...COMMON_TOPICS]} lang={lang} restartKey={restartKey} compact={compact} className={className} autoPlay={autoPlay} />;
}
