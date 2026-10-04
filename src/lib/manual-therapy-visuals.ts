export type QCResult = "pass" | "na";

export type ManualTherapyVisualQC = {
  anatomy: QCResult;
  patientPosition: QCResult;
  therapistPosition: QCResult;
  primaryContact: QCResult;
  fingerPosition: QCResult;
  stabilization: QCResult;
  forceDirection: QCResult;
  labels: QCResult;
  branding: QCResult;
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
    Object.values(visual.qc).every((result) => result === "pass" || result === "na")
  );
}

/**
 * Technique visuals remain hidden until every depicted clinical feature has
 * been checked. A criterion may be marked "na" only when that feature is not
 * shown in the visual at all.
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {
  "maitland-cervical-pa-mobilization": [
    {
      id: "central-pa-force-anatomy-v1",
      title: "Central PA — Anatomy & Force Direction",
      path: "pna/clinical-skills/manual-therapy/maitland-cervical-pa-mobilization/force-anatomy-v1",
      alt: "Sagittal cervical spine teaching view showing a posterior-to-anterior force through a selected cervical spinous process with facet joint and intervertebral disc anatomy.",
      caption:
        "QC-approved anatomy panel: the force travels from posterior toward anterior through the selected cervical segment. A separate hand-contact visual will be added only after it independently passes QC.",
      group: "Force Direction",
      qcStatus: "approved",
      qc: {
        anatomy: "pass",
        patientPosition: "na",
        therapistPosition: "na",
        primaryContact: "na",
        fingerPosition: "na",
        stabilization: "na",
        forceDirection: "pass",
        labels: "pass",
        branding: "na",
      },
    },
  ],

  "maitland-thoracic-pa-mobilization": [
    {
      id: "central-pa-hand-contact-v1",
      title: "Central PA — Hand Contact",
      path: "pna/clinical-skills/manual-therapy/maitland-thoracic-pa-mobilization/hand-contact-v1",
      alt: "Close clinical view showing supported pisiform or hypothenar contact for thoracic central posterior-to-anterior mobilization with a reinforcing hand and relaxed fingers.",
      caption:
        "QC-approved contact panel: the ulnar hand heel/pisiform-hypothenar region provides the central contact, the second hand reinforces, and the fingers remain relaxed rather than pressing into the spine.",
      group: "Hand Placement",
      qcStatus: "approved",
      qc: {
        anatomy: "na",
        patientPosition: "pass",
        therapistPosition: "na",
        primaryContact: "pass",
        fingerPosition: "pass",
        stabilization: "pass",
        forceDirection: "na",
        labels: "pass",
        branding: "na",
      },
    },
  ],

  "maitland-lumbar-pa-mobilization": [
    {
      id: "central-pa-hand-contact-v1",
      title: "Central PA — Hand Contact",
      path: "pna/clinical-skills/manual-therapy/maitland-lumbar-pa-mobilization/hand-contact-v1",
      alt: "Close clinical view showing pisiform or hypothenar contact over a lumbar spinous process with the second hand reinforcing and the fingers relaxed beside the spine.",
      caption:
        "QC-approved contact panel: the lower hand transmits pressure through the pisiform/hypothenar region over the selected spinous process while the upper hand reinforces the contact.",
      group: "Hand Placement",
      qcStatus: "approved",
      qc: {
        anatomy: "pass",
        patientPosition: "pass",
        therapistPosition: "na",
        primaryContact: "pass",
        fingerPosition: "pass",
        stabilization: "pass",
        forceDirection: "pass",
        labels: "pass",
        branding: "na",
      },
    },
    {
      id: "central-pa-force-anatomy-v1",
      title: "Central PA — Anatomy & Force Direction",
      path: "pna/clinical-skills/manual-therapy/maitland-lumbar-pa-mobilization/force-anatomy-v1",
      alt: "Sagittal lumbar spine teaching view showing posterior-to-anterior force through the selected lumbar spinous process with lumbar vertebrae, facet joint and intervertebral disc labels.",
      caption:
        "QC-approved anatomy panel: posterior-to-anterior force is directed through the selected lumbar segment toward the anterior vertebral column.",
      group: "Force Direction",
      qcStatus: "approved",
      qc: {
        anatomy: "pass",
        patientPosition: "na",
        therapistPosition: "na",
        primaryContact: "na",
        fingerPosition: "na",
        stabilization: "na",
        forceDirection: "pass",
        labels: "pass",
        branding: "na",
      },
    },
  ],
};

export function getManualTherapyVisuals(slug: string) {
  return (manualTherapyVisuals[slug] ?? []).filter(passesClinicalQC);
}
