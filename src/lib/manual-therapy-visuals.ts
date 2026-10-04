export type ManualTherapyVisual = {
  id: string;
  title: string;
  path: string;
  alt: string;
  caption?: string;
};

/**
 * Public manual-therapy image assets are intentionally empty while the new
 * anatomy-first pipeline is rebuilt from the single control manifest:
 * automation/manual-therapy-visual-pipeline.json
 *
 * Latest visual standard:
 * - no therapist/person
 * - technique-specific anatomy
 * - technique-specific target / pain-sensitive area
 * - exact force / glide / movement direction
 * - PNA branding
 * - no generic repeated regional template
 *
 * Only assets marked approved + published in the central pipeline should be
 * added here.
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {};

export function getManualTherapyVisuals(slug: string) {
  return manualTherapyVisuals[slug] ?? [];
}
