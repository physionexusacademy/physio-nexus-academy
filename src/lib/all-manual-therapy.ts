import {
  manualTherapyTechniques as legacyManualTherapyTechniques,
  type ManualTherapyTechnique,
} from "@/lib/manual-therapy";
import { manualTherapyAdditions } from "@/lib/manual-therapy-additions";

export const manualTherapyTechniques: ManualTherapyTechnique[] = [
  ...legacyManualTherapyTechniques,
  ...manualTherapyAdditions.filter(
    (addition) => !legacyManualTherapyTechniques.some((legacy) => legacy.slug === addition.slug)
  ),
];

export const manualTherapyFamilies = Array.from(
  new Set(manualTherapyTechniques.map((item) => item.family))
);
