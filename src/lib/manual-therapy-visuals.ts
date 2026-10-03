export type ManualTherapyVisual = {
  id: string;
  title: string;
  path: string;
  alt: string;
  caption?: string;
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
 * Add entries here only after the matching asset has been uploaded to ImageKit.
 * This keeps the live website free of broken image requests.
 *
 * Recommended ImageKit folder:
 * pna/clinical-skills/manual-therapy/<technique-slug>/<asset-name>.webp
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {
  // Example once an asset exists:
  // "myofascial-release": [
  //   {
  //     id: "cross-hand-overview",
  //     title: "Cross-Hand Myofascial Release",
  //     path: "pna/clinical-skills/manual-therapy/myofascial-release/cross-hand-overview.webp",
  //     alt: "Illustrated cross-hand myofascial release showing therapist hand placement and tissue-force direction",
  //     caption: "Broad cross-hand contact with gradual opposing shear; arrows indicate the intended force direction.",
  //     group: "Hand Placement",
  //   },
  // ],
};

export function getManualTherapyVisuals(slug: string) {
  return manualTherapyVisuals[slug] ?? [];
}
