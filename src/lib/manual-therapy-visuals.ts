export type ManualTherapyVisual = {
  id: string;
  title: string;
  path: string;
  alt: string;
  caption?: string;
  crop?: { x: number; y: number; width: number; height: number };
  group:
    | "Overview"
    | "Patient Position"
    | "Therapist Position"
    | "Hand Placement"
    | "Force Direction"
    | "Step-by-Step"
    | "Safety"
    | "Common Errors"
    | "Anatomy";
};

/**
 * Manual-therapy technique visuals are intentionally unpublished while the
 * library undergoes clinical QC for anatomy, patient position, hand contact,
 * stabilization and force direction. Publish a visual only after it passes
 * technique-specific verification.
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {};

export function getManualTherapyVisuals(slug: string) {
  return manualTherapyVisuals[slug] ?? [];
}
