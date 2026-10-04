export type ManualTherapyVisual = {
  id: string;
  title: string;
  path: string;
  alt: string;
  caption?: string;
  target?: string;
  force?: string;
};

/**
 * Manual Therapy Visual Lab
 *
 * IMPORTANT:
 * Existing Clinical Visual Atlas assets are NOT reused here.
 * This library now accepts only NEW technique-specific, book-style clinical
 * visuals created for the exact manual-therapy technique.
 *
 * Technique theory pages remain unchanged.
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {};

export function getManualTherapyVisuals(slug: string) {
  return manualTherapyVisuals[slug] ?? [];
}
