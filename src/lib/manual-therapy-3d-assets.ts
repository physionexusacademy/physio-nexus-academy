import type { ManualRegion } from "@/lib/manual-therapy-regional";

const REGION_SLUGS: Record<ManualRegion, string> = {
  "TMJ & Craniofacial": "tmj-craniofacial",
  Cervical: "cervical",
  Thoracic: "thoracic",
  "Ribs & Chest Wall": "ribs-chest-wall",
  Lumbar: "lumbar",
  Shoulder: "shoulder",
  Elbow: "elbow",
  "Wrist & Hand": "wrist-hand",
  "Hip & Pelvis": "hip-pelvis",
  Knee: "knee",
  "Ankle & Foot": "ankle-foot",
  "Upper Limb Neural": "upper-limb-neural",
  "Lower Limb Neural": "lower-limb-neural",
};

export const imageKit3DEnabled =
  process.env.NEXT_PUBLIC_IMAGEKIT_3D_ENABLED === "true";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Deterministic ImageKit path for every deep manual-therapy variation.
 *
 * Upload the final WebP/PNG/JPG to this exact path and it becomes available
 * without changing the page code.
 *
 * Example:
 * pna/clinical-skills/manual-therapy-3d/maitland-joint-mobilization/
 * shoulder/glenohumeral-posterior-glide.webp
 */
export function getManualTherapy3DAssetPath(args: {
  techniqueSlug: string;
  region: ManualRegion;
  subTechniqueName: string;
}) {
  const regionSlug = REGION_SLUGS[args.region];
  const assetSlug = slugify(args.subTechniqueName);

  return [
    "pna",
    "clinical-skills",
    "manual-therapy-3d",
    args.techniqueSlug,
    regionSlug,
    assetSlug + ".webp",
  ].join("/");
}

export function getManualTherapy3DAlt(args: {
  techniqueName: string;
  region: ManualRegion;
  subTechniqueName: string;
  target: string;
}) {
  return [
    "Realistic 3D clinical anatomy view for",
    args.subTechniqueName + ",",
    "showing the",
    args.target,
    "target in the",
    args.region,
    "region.",
  ].join(" ");
}
