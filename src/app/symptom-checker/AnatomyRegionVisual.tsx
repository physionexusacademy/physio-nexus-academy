import Image from "next/image";
import type { RegionId } from "@/lib/msk-symptom-checker";

type AnatomyRegionVisualProps = {
  region: RegionId;
  className?: string;
  compact?: boolean;
};

const photoByRegion: Record<RegionId, string> = {
  neck: "neck",
  shoulder: "shoulder",
  elbow: "elbow-forearm",
  "wrist-hand": "wrist-hand",
  "upper-back-ribs": "upper-back-ribs",
  "low-back": "lower-back",
  "hip-groin": "hip-groin",
  knee: "knee",
  "lower-leg": "lower-leg",
  "ankle-foot": "ankle-foot",
};

/**
 * Real-human regional symptom illustrations. Each SVG asset contains one
 * optimized WebP crop (~3-4 KB) and is served statically by Cloudflare.
 * Keep screening / red flag / booking logic entirely separate from visuals.
 */
export function AnatomyRegionVisual({ region, className = "", compact = false }: AnatomyRegionVisualProps) {
  return (
    <Image
      unoptimized
      src={`/images/symptom-checker/${photoByRegion[region]}.svg`}
      width={170}
      height={245}
      alt={`Realistic human illustration highlighting ${region.replace(/-/g, " ")} pain`}
      loading={compact ? "lazy" : "eager"}
      decoding="async"
      draggable={false}
      className={`${className} object-contain`}
    />
  );
}
