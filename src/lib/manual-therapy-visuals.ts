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
 * Publish entries only after the matching image has passed clinical QC and
 * has been uploaded to Cloudinary.
 *
 * One verified master infographic may safely power several lightweight
 * teaching views through Cloudinary crops, so the website does not store or
 * download duplicate heavy images.
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {
  "maitland-cervical-pa-mobilization": [
    {
      id: "verified-master",
      title: "Cervical Central PA Mobilization",
      path: "pna/clinical-skills/manual-therapy/maitland-cervical-pa-mobilization/master",
      alt: "Verified clinical teaching visual of Maitland cervical central posterior-to-anterior mobilization with prone patient positioning, thumb-pad contact over the selected cervical spinous process, internal cervical anatomy and posterior-to-anterior force direction",
      caption:
        "Verified master view: prone neutral cervical position, localized thumb contact over the selected spinous process, fingers used for support rather than pressure, and controlled PA force through the target segment.",
      group: "Overview",
    },
    {
      id: "hand-placement",
      title: "Exact Hand Placement",
      path: "pna/clinical-skills/manual-therapy/maitland-cervical-pa-mobilization/master",
      alt: "Close-up of correct thumb-pad contact for Maitland cervical central PA mobilization over the selected spinous process",
      caption:
        "Primary contact is localized through the thumb pads at the selected spinous process; the fingers stabilize without fingertip pressure.",
      crop: { x: 960, y: 0, width: 576, height: 480 },
      group: "Hand Placement",
    },
    {
      id: "force-direction",
      title: "Anatomy & PA Force Direction",
      path: "pna/clinical-skills/manual-therapy/maitland-cervical-pa-mobilization/master",
      alt: "Sagittal cervical anatomy showing posterior-to-anterior mobilization force through a selected cervical spinous process",
      caption:
        "The accessory force travels posterior-to-anterior through the selected cervical segment while global neck movement is minimized.",
      crop: { x: 960, y: 480, width: 576, height: 544 },
      group: "Force Direction",
    },
  ],

  "maitland-thoracic-pa-mobilization": [
    {
      id: "verified-master",
      title: "Thoracic Central PA Mobilization",
      path: "pna/clinical-skills/manual-therapy/maitland-thoracic-pa-mobilization/master",
      alt: "Verified clinical teaching visual of Maitland thoracic central posterior-to-anterior mobilization showing prone patient position, pisiform or hypothenar contact over a selected thoracic spinous process, reinforcing hand, thoracic anatomy and PA force direction",
      caption:
        "Verified master view: patient prone and relaxed, pisiform/hypothenar contact on the selected spinous process, reinforcing hand above, relaxed fingers, and controlled PA oscillation.",
      group: "Overview",
    },
    {
      id: "hand-placement",
      title: "Pisiform / Hypothenar Contact",
      path: "pna/clinical-skills/manual-therapy/maitland-thoracic-pa-mobilization/master",
      alt: "Close-up of correct pisiform or hypothenar contact over a thoracic spinous process with reinforcing hand and relaxed fingers",
      caption:
        "Pressure is transmitted through the pisiform/hypothenar contact—not through the fingertips. The second hand reinforces the contact hand.",
      crop: { x: 948, y: 0, width: 588, height: 377 },
      group: "Hand Placement",
    },
    {
      id: "force-direction",
      title: "Thoracic Anatomy & PA Force",
      path: "pna/clinical-skills/manual-therapy/maitland-thoracic-pa-mobilization/master",
      alt: "Sagittal thoracic anatomy showing posterior-to-anterior mobilization force through the selected spinous process",
      caption:
        "Force is directed posterior-to-anterior through the selected thoracic segment, approximately perpendicular to the local thoracic contour.",
      crop: { x: 948, y: 385, width: 588, height: 360 },
      group: "Force Direction",
    },
  ],
};

export function getManualTherapyVisuals(slug: string) {
  return manualTherapyVisuals[slug] ?? [];
}
