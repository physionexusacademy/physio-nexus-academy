import { regionalVignettesA, type RegionalVignette } from "@/lib/manual-therapy-regional-vignettes-a";
import { regionalVignettesB } from "@/lib/manual-therapy-regional-vignettes-b";
export type { RegionalVignette };
export const regionalManualVignettes: Record<string, RegionalVignette> = {
  ...regionalVignettesA,
  ...regionalVignettesB,
};