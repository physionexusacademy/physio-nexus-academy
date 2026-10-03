import {
  manualApplicationGuides as legacyManualApplicationGuides,
  type ManualApplicationGuide,
} from "@/lib/manual-therapy-guides";
import { manualApplicationGuideAdditions } from "@/lib/manual-therapy-guide-additions";

export const manualApplicationGuides: Record<string, ManualApplicationGuide> = {
  ...legacyManualApplicationGuides,
  ...manualApplicationGuideAdditions,
};
