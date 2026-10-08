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
 *   2. the manifest has publish=true.
 * The CI publish validator also checks every AVIF/WebP asset and size before
 * release. Do not use a process.env flag here: the Cloudflare Workers runtime
 * does not necessarily inherit the GitHub Actions build-time environment.
 * A missing runtime flag silently displayed repeated old Cloudinary artwork
 * even when all 35 unique optimized files were successfully deployed.
 * To roll back, set manifest.publish=false and redeploy.
 */
export function getPublishedManualCoverMap(): ManualCoverMap {
  if (!manifest.publish) {
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
