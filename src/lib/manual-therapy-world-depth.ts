import { worldDepthOrthopedic } from "@/lib/manual-therapy-world-depth-orthopedic";
import { worldDepthOsteopathic } from "@/lib/manual-therapy-world-depth-osteopathic";
import { worldDepthFascialAndDisputed } from "@/lib/manual-therapy-world-depth-disputed";
import type { WorldDeepChapter } from "@/lib/manual-therapy-world-depth-types";
export type { WorldDeepChapter };
export const worldManualDeepChapters: Record<string, WorldDeepChapter> = {
  ...worldDepthOrthopedic,
  ...worldDepthOsteopathic,
  ...worldDepthFascialAndDisputed,
};
