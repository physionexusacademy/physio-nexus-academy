import type { MasteryGuide } from "@/lib/manual-therapy-mastery-types";
import { masteryJoint } from "@/lib/manual-therapy-mastery-joint";
import { masterySoftTissue } from "@/lib/manual-therapy-mastery-soft";
import { masteryWorld } from "@/lib/manual-therapy-mastery-world";

export type { MasteryGuide } from "@/lib/manual-therapy-mastery-types";

const all: MasteryGuide[] = [...masteryJoint, ...masterySoftTissue, ...masteryWorld];
const bySlug: Record<string, MasteryGuide> = Object.fromEntries(all.map((g) => [g.slug, g]));

export function getMasteryGuide(slug: string): MasteryGuide | undefined {
  return bySlug[slug];
}
export const masteryGuideCount = all.length;
