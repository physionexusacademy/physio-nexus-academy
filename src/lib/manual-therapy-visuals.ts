export type ManualTherapyVisualQC = {
  anatomy: boolean;
  patientPosition: boolean;
  therapistPosition: boolean;
  primaryContact: boolean;
  fingerPosition: boolean;
  stabilization: boolean;
  forceDirection: boolean;
  labels: boolean;
  branding: boolean;
};

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
  qcStatus: "candidate" | "rejected" | "approved";
  qc: ManualTherapyVisualQC;
};

function passesClinicalQC(visual: ManualTherapyVisual) {
  return (
    visual.qcStatus === "approved" &&
    Object.values(visual.qc).every(Boolean)
  );
}

/**
 * Technique visuals stay hidden unless EVERY clinical QC field is true and the
 * asset is explicitly marked approved. This prevents a generated candidate
 * from reaching the public teaching page before anatomy, contact, position,
 * stabilization, force direction and labels have all been checked.
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {};

export function getManualTherapyVisuals(slug: string) {
  return (manualTherapyVisuals[slug] ?? []).filter(passesClinicalQC);
}
