import manifest from "@/data/manual-therapy-visual-manifest.json";

export type ManualCover = {
  avif: string;
  webp: string;
  position: string;
};
export type ManualCoverMap = Record<string, ManualCover>;

/**
 * Fail closed. This is evaluated on the server while Next builds the static
 * encyclopedia. The regular PNA Cloudinary cards remain unchanged unless:
 *   1. every technique has been clinically approved in the manifest,
 *   2. the manifest has publish=true, AND
 *   3. the deployment sets MANUAL_THERAPY_VISUALS_LIVE=true.
 * The CI publish validator also checks all actual asset files and sizes.
 */
export function getPublishedManualCoverMap(): ManualCoverMap {
  if (!manifest.publish || process.env.MANUAL_THERAPY_VISUALS_LIVE !== "true") {
    return {};
  }

  if (manifest.entries.length !== 35 || manifest.entries.some((entry) => entry.status !== "approved")) {
    throw new Error("Refusing Manual Therapy covers: all 35 entries require clinical approval.");
  }

  return Object.fromEntries(
    manifest.entries.map((entry) => [
      entry.slug,
      {
        avif: `/images/manual-therapy/cards/${entry.slug}.avif`,
        webp: `/images/manual-therapy/cards/${entry.slug}.webp`,
        position: `${entry.crop.x}% ${entry.crop.y}%`,
      },
    ])
  );
}
