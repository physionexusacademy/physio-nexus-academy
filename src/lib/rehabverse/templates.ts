/**
 * Starter programmes for the clinician's builder. They are DRAFT suggestions assembled from the
 * 3D library, to save typing: the physiotherapist adapts exercises, doses and precautions to the
 * patient, and approves the programme. They are not a prescription and not condition-specific advice.
 * Every exercise id must exist in the library (checked by validate:rehabverse-library).
 */
export type TemplateLine = { id: string; sets?: number; reps?: number; hold?: number };
export type TemplateDay = { title: string; note?: string; exercises: TemplateLine[] };
export type ProgrammeTemplate = {
  id: string;
  title: string;
  goal: string;
  /** Library regions it draws on (for filtering and display). */
  regions: string[];
  summary: string;
  frequency: string;
  days: TemplateDay[];
};

const MOVE_NOTE = "Move slowly and breathe. A mild ache (up to about 3–4 out of 10) can be normal, but stop if the pain is sharp, spreading or worse the next day, and tell us in your feedback.";
const BALANCE_NOTE = "Do these next to a counter or wall so you can steady yourself. Stop if you feel dizzy or unsteady, and tell us in your feedback.";

export const TEMPLATES: ProgrammeTemplate[] = [
  {
    id: "low-back-gentle", title: "Low back — gentle start", regions: ["lumbar", "hip"], frequency: "Once a day",
    goal: "Calm the back, regain easy movement and build basic trunk and hip control.",
    summary: "5 days: gentle mobility, then core control and hip strength.",
    days: [
      { title: "Settle and move", note: MOVE_NOTE, exercises: [{ id: "knee-to-chest", sets: 2, reps: 8 }, { id: "knee-rock", sets: 2, reps: 10 }, { id: "glute-bridge", sets: 2, reps: 8, hold: 3 }] },
      { title: "Mobility and first core work", note: MOVE_NOTE, exercises: [{ id: "knee-to-chest", sets: 2, reps: 8 }, { id: "cat-camel", sets: 2, reps: 8 }, { id: "glute-bridge", sets: 2, reps: 10, hold: 3 }, { id: "dead-bug", sets: 2, reps: 6 }] },
      { title: "Build control", note: MOVE_NOTE, exercises: [{ id: "cat-camel", sets: 2, reps: 10 }, { id: "bird-dog", sets: 2, reps: 6, hold: 5 }, { id: "dead-bug", sets: 2, reps: 8 }, { id: "hip-hinge", sets: 2, reps: 8 }] },
      { title: "Strength and control", note: MOVE_NOTE, exercises: [{ id: "bird-dog", sets: 3, reps: 6, hold: 5 }, { id: "glute-bridge", sets: 3, reps: 10, hold: 3 }, { id: "clamshell", sets: 2, reps: 12 }, { id: "hip-hinge", sets: 3, reps: 8 }] },
      { title: "Put it together", note: MOVE_NOTE, exercises: [{ id: "cat-camel", sets: 2, reps: 10 }, { id: "bird-dog", sets: 3, reps: 8, hold: 5 }, { id: "dead-bug", sets: 3, reps: 8 }, { id: "hip-hinge", sets: 3, reps: 10 }] },
    ],
  },
  {
    id: "neck-posture", title: "Neck stiffness and posture", regions: ["cervical", "thoracic"], frequency: "Once or twice a day",
    goal: "Ease neck stiffness and improve upper-back and shoulder-blade control.",
    summary: "4 days: neck mobility, then posture and mid-back work.",
    days: [
      { title: "Gentle neck movement", note: MOVE_NOTE, exercises: [{ id: "chin-tuck", sets: 2, reps: 8, hold: 3 }, { id: "neck-rotation", sets: 2, reps: 8 }, { id: "neck-side-bend", sets: 2, reps: 8 }] },
      { title: "Stretch and settle", note: MOVE_NOTE, exercises: [{ id: "chin-tuck", sets: 2, reps: 10, hold: 3 }, { id: "upper-trapezius-stretch", sets: 2, hold: 20 }, { id: "neck-rotation", sets: 2, reps: 10 }] },
      { title: "Posture and shoulder blades", note: MOVE_NOTE, exercises: [{ id: "chin-tuck", sets: 2, reps: 10, hold: 3 }, { id: "shoulder-blade-squeeze", sets: 2, reps: 10, hold: 3 }, { id: "thoracic-extension-chair", sets: 2, reps: 8 }] },
      { title: "Mid-back mobility", note: MOVE_NOTE, exercises: [{ id: "shoulder-blade-squeeze", sets: 3, reps: 10, hold: 3 }, { id: "open-book", sets: 2, reps: 8 }, { id: "upper-trapezius-stretch", sets: 2, hold: 20 }] },
    ],
  },
  {
    id: "shoulder-early", title: "Shoulder — early mobility to strength", regions: ["shoulder"], frequency: "Once a day",
    goal: "Restore comfortable shoulder movement, then build rotator cuff and shoulder-blade strength.",
    summary: "5 days: pendulum and assisted movement, then band strengthening.",
    days: [
      { title: "Relax and swing", note: MOVE_NOTE, exercises: [{ id: "codman-pendulum", sets: 2, reps: 10 }, { id: "wand-flexion", sets: 2, reps: 8 }] },
      { title: "Assisted movement and stretch", note: MOVE_NOTE, exercises: [{ id: "codman-pendulum", sets: 2, reps: 10 }, { id: "wand-flexion", sets: 2, reps: 10 }, { id: "cross-body-shoulder-stretch", sets: 2, hold: 20 }] },
      { title: "Active control", note: MOVE_NOTE, exercises: [{ id: "wand-flexion", sets: 2, reps: 10 }, { id: "wall-angel", sets: 2, reps: 8 }, { id: "sidelying-external-rotation", sets: 2, reps: 8 }] },
      { title: "Begin strengthening", note: MOVE_NOTE, exercises: [{ id: "wall-angel", sets: 2, reps: 10 }, { id: "band-external-rotation", sets: 2, reps: 10 }, { id: "seated-band-row", sets: 2, reps: 10 }] },
      { title: "Strength and range", note: MOVE_NOTE, exercises: [{ id: "band-external-rotation", sets: 3, reps: 10 }, { id: "band-internal-rotation", sets: 2, reps: 10 }, { id: "scaption-full-can", sets: 2, reps: 8 }, { id: "seated-band-row", sets: 3, reps: 10 }] },
    ],
  },
  {
    id: "knee-strength", title: "Knee — gentle strengthening", regions: ["knee", "hip"], frequency: "Once a day",
    goal: "Regain knee movement and thigh strength, and return to stairs and standing from a chair.",
    summary: "5 days: quadriceps activation and range, then functional strengthening.",
    days: [
      { title: "Wake up the thigh", note: MOVE_NOTE, exercises: [{ id: "quad-set", sets: 2, reps: 10, hold: 5 }, { id: "heel-slide", sets: 2, reps: 10 }, { id: "straight-leg-raise", sets: 2, reps: 8 }] },
      { title: "Range and strength", note: MOVE_NOTE, exercises: [{ id: "quad-set", sets: 2, reps: 10, hold: 5 }, { id: "short-arc-quad", sets: 2, reps: 10, hold: 3 }, { id: "heel-slide", sets: 2, reps: 12 }, { id: "seated-knee-extension", sets: 2, reps: 10, hold: 3 }] },
      { title: "Stand and squat", note: MOVE_NOTE, exercises: [{ id: "mini-squat", sets: 2, reps: 10 }, { id: "sit-to-stand", sets: 2, reps: 8 }, { id: "straight-leg-raise", sets: 3, reps: 10 }] },
      { title: "Build the thigh", note: MOVE_NOTE, exercises: [{ id: "wall-squat", sets: 2, reps: 6, hold: 10 }, { id: "terminal-knee-extension", sets: 2, reps: 10, hold: 3 }, { id: "standing-hamstring-curl", sets: 2, reps: 10 }] },
      { title: "Functional strength", note: MOVE_NOTE, exercises: [{ id: "step-up", sets: 2, reps: 8 }, { id: "sit-to-stand", sets: 3, reps: 10 }, { id: "wall-squat", sets: 3, reps: 6, hold: 10 }] },
    ],
  },
  {
    id: "hip-control", title: "Hip — strength and mobility", regions: ["hip", "lumbar"], frequency: "Once a day",
    goal: "Improve hip strength and control, and ease hip and buttock tightness.",
    summary: "4 days: side-lying strength, bridging, then standing control.",
    days: [
      { title: "Wake up the hip", note: MOVE_NOTE, exercises: [{ id: "clamshell", sets: 2, reps: 10 }, { id: "glute-bridge", sets: 2, reps: 8, hold: 3 }, { id: "figure-4-stretch", sets: 2, hold: 20 }] },
      { title: "Side-lying strength", note: MOVE_NOTE, exercises: [{ id: "clamshell", sets: 3, reps: 12 }, { id: "sidelying-hip-abduction", sets: 2, reps: 10 }, { id: "glute-bridge", sets: 3, reps: 10, hold: 3 }] },
      { title: "Stretch and hinge", note: MOVE_NOTE, exercises: [{ id: "hip-flexor-stretch-edge", sets: 2, hold: 20 }, { id: "figure-4-stretch", sets: 2, hold: 20 }, { id: "hip-hinge", sets: 2, reps: 8 }] },
      { title: "Standing control", note: MOVE_NOTE, exercises: [{ id: "standing-hip-abduction", sets: 2, reps: 10 }, { id: "standing-hip-extension", sets: 2, reps: 10 }, { id: "hip-hinge", sets: 3, reps: 8 }] },
    ],
  },
  {
    id: "ankle-return", title: "Ankle — return to walking and balance", regions: ["ankle_foot"], frequency: "Once a day",
    goal: "Restore ankle movement, calf and foot strength, and balance after a sprain (once cleared to load).",
    summary: "5 days: movement and stretch, strengthening, then balance.",
    days: [
      { title: "Move the ankle", note: MOVE_NOTE, exercises: [{ id: "ankle-pumps", sets: 3, reps: 15 }, { id: "ankle-circles", sets: 2, reps: 10 }, { id: "supine-calf-stretch", sets: 2, hold: 20 }] },
      { title: "Foot and calf", note: MOVE_NOTE, exercises: [{ id: "ankle-circles", sets: 2, reps: 10 }, { id: "towel-scrunch", sets: 2, reps: 12 }, { id: "supine-calf-stretch", sets: 2, hold: 30 }, { id: "double-heel-raise", sets: 2, reps: 10 }] },
      { title: "Ankle strength", note: MOVE_NOTE, exercises: [{ id: "double-heel-raise", sets: 3, reps: 12 }, { id: "ankle-eversion-band", sets: 2, reps: 12 }, { id: "ankle-inversion-band", sets: 2, reps: 12 }, { id: "toe-raise", sets: 2, reps: 12 }] },
      { title: "Start balance", note: BALANCE_NOTE, exercises: [{ id: "single-leg-stance", sets: 3, hold: 20 }, { id: "single-heel-raise", sets: 2, reps: 8 }, { id: "ankle-eversion-band", sets: 3, reps: 12 }] },
      { title: "Balance and control", note: BALANCE_NOTE, exercises: [{ id: "single-leg-stance", sets: 3, hold: 30 }, { id: "marching", sets: 2, reps: 10 }, { id: "single-leg-reach", sets: 2, reps: 6 }] },
    ],
  },
  {
    id: "wrist-elbow", title: "Wrist and elbow — load and movement", regions: ["elbow_hand"], frequency: "Once or twice a day",
    goal: "Ease wrist and forearm tightness and build gradual tolerance to load.",
    summary: "4 days: movement and stretch, then eccentric and grip strengthening.",
    days: [
      { title: "Move and stretch", note: MOVE_NOTE, exercises: [{ id: "wrist-flexion-extension", sets: 2, reps: 10 }, { id: "forearm-rotation", sets: 2, reps: 10 }, { id: "wrist-flexor-stretch", sets: 2, hold: 20 }, { id: "wrist-extensor-stretch", sets: 2, hold: 20 }] },
      { title: "Glide and grip", note: MOVE_NOTE, exercises: [{ id: "tendon-glides", sets: 2, reps: 8 }, { id: "grip-squeeze", sets: 2, reps: 10, hold: 3 }, { id: "wrist-flexor-stretch", sets: 2, hold: 20 }] },
      { title: "Begin loading", note: MOVE_NOTE, exercises: [{ id: "eccentric-wrist-extension", sets: 2, reps: 10 }, { id: "grip-squeeze", sets: 3, reps: 10, hold: 3 }, { id: "wrist-extensor-stretch", sets: 2, hold: 20 }] },
      { title: "Strength", note: MOVE_NOTE, exercises: [{ id: "eccentric-wrist-extension", sets: 3, reps: 12 }, { id: "eccentric-wrist-flexion", sets: 2, reps: 10 }, { id: "biceps-curl", sets: 2, reps: 10 }, { id: "triceps-band-pushdown", sets: 2, reps: 10 }] },
    ],
  },
  {
    id: "balance-falls", title: "Balance and falls prevention", regions: ["knee", "ankle_foot", "hip"], frequency: "Once a day",
    goal: "Improve leg strength and balance for safer walking and standing up.",
    summary: "4 days: chair strength, heel and toe work, then single-leg balance.",
    days: [
      { title: "Chair strength", note: BALANCE_NOTE, exercises: [{ id: "sit-to-stand", sets: 2, reps: 8 }, { id: "double-heel-raise", sets: 2, reps: 10 }] },
      { title: "Heels and toes", note: BALANCE_NOTE, exercises: [{ id: "sit-to-stand", sets: 2, reps: 10 }, { id: "double-heel-raise", sets: 2, reps: 12 }, { id: "toe-raise", sets: 2, reps: 12 }] },
      { title: "Marching and balance", note: BALANCE_NOTE, exercises: [{ id: "marching", sets: 2, reps: 10 }, { id: "single-leg-stance", sets: 3, hold: 15 }, { id: "sit-to-stand", sets: 3, reps: 10 }] },
      { title: "Steadier on one leg", note: BALANCE_NOTE, exercises: [{ id: "single-leg-stance", sets: 3, hold: 25 }, { id: "single-heel-raise", sets: 2, reps: 8 }, { id: "marching", sets: 3, reps: 10 }, { id: "toe-raise", sets: 2, reps: 12 }] },
    ],
  },
];
