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

/**
 * First approved PNA 3D anatomy batch.
 *
 * These images are anatomy-first teaching assets, so structure visuals can be
 * reused across compatible manual-therapy techniques instead of duplicating
 * the same anatomy for every technique family.
 */
const READY_3D_ASSETS = {
  masseter: "czxmnbdvag77ejpuzocs",
  temporalis: "jbq8a2vs1pch421usa6q",
  suboccipital: "l4ocacerz3cj1hs4kd3t",
  tmj: "rewea37nooztxy5eknbq",
  thoracicParaspinals: "tfuqogqnk8lt9qboqpjp",
  intercostalRibAngle: "exwpcpwltstbcikqrmq5",
  quadratusLumborum: "sgsx27zr83dmlznsxfte",
  glenohumeralPosteriorGlide: "my7sknkgvla6h8so2sz3",
} as const;

export const cloudinary3DEnabled =
  process.env.NEXT_PUBLIC_CLOUDINARY_3D_ENABLED !== "false";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getReady3DPublicId(args: {
  techniqueSlug: string;
  region: ManualRegion;
  subTechniqueName: string;
}) {
  const name = args.subTechniqueName.toLowerCase();

  if (name === "glenohumeral posterior glide") {
    return READY_3D_ASSETS.glenohumeralPosteriorGlide;
  }

  if (name.startsWith("masseter")) {
    return READY_3D_ASSETS.masseter;
  }

  if (name.startsWith("temporalis")) {
    return READY_3D_ASSETS.temporalis;
  }

  if (name.startsWith("suboccipital")) {
    return READY_3D_ASSETS.suboccipital;
  }

  if (
    args.region === "TMJ & Craniofacial" &&
    (name.startsWith("tmj ") || name.includes("temporomandibular"))
  ) {
    return READY_3D_ASSETS.tmj;
  }

  if (name.startsWith("thoracic paraspinal")) {
    return READY_3D_ASSETS.thoracicParaspinals;
  }

  if (name.startsWith("intercostal")) {
    return READY_3D_ASSETS.intercostalRibAngle;
  }

  if (name.startsWith("quadratus lumborum")) {
    return READY_3D_ASSETS.quadratusLumborum;
  }

  return "";
}

/**
 * Resolve a deep manual-therapy 3D image.
 *
 * Approved uploaded assets are returned immediately. Unknown cards stay
 * image-free, which prevents broken Cloudinary requests while the atlas is
 * still being expanded.
 *
 * The deterministic convention is kept below for future bulk publishing:
 * pna/clinical-skills/manual-therapy-3d/<technique>/<region>/<sub-technique>
 */
export function getManualTherapy3DAssetPublicId(args: {
  techniqueSlug: string;
  region: ManualRegion;
  subTechniqueName: string;
}) {
  const readyAsset = getReady3DPublicId(args);
  if (readyAsset) return readyAsset;

  if (process.env.NEXT_PUBLIC_CLOUDINARY_3D_ALLOW_UNPUBLISHED === "true") {
    const regionSlug = REGION_SLUGS[args.region];
    const assetSlug = slugify(args.subTechniqueName);

    return [
      "pna",
      "clinical-skills",
      "manual-therapy-3d",
      args.techniqueSlug,
      regionSlug,
      assetSlug,
    ].join("/");
  }

  return "";
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
