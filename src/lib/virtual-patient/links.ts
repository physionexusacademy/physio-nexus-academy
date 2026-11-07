/**
 * Which Virtual Patient cases put each Skills Lab skill into practice. Kept apart
 * from cases.ts so server pages can link to cases without bundling the case data
 * (validate:virtual-patient checks every id here exists).
 */
export const VP_CASE_COUNT = 12;

export type VpCaseLink = { id: string; title: string; why: string };

const C = {
  l5: { id: "lumbar-l5", title: "Back pain into the leg", why: "dermatomes, myotomes and reflexes to find the level" },
  cauda: { id: "cauda-equina", title: "Back pain with red flags", why: "saddle sensation and the emergency you must not miss" },
  c6: { id: "c6-radiculopathy", title: "Neck pain into the arm", why: "upper-limb levels: C6 key point, wrist extensors, brachioradialis" },
  cts: { id: "carpal-tunnel", title: "Night numbness in the hand", why: "median nerve sensation, thenar strength and Phalen's test" },
  fibular: { id: "fibular-palsy", title: "Sudden foot drop", why: "nerve or root? Fibular territory versus L5" },
  cuff: { id: "rotator-cuff-tear", title: "Can't lift the arm after a fall", why: "active versus passive range, MMT and drop-arm" },
  frozen: { id: "frozen-shoulder", title: "Stiff, painful shoulder", why: "goniometry in the capsular pattern" },
  acl: { id: "acl-tear", title: "Knee gave way in football", why: "Lachman, effusion and thigh girth" },
  oa: { id: "knee-oa", title: "Knee pain on stairs", why: "range, joint-line palpation and vital signs" },
  ankle: { id: "ankle-sprain", title: "Twisted ankle", why: "Ottawa rules palpation and the anterior drawer" },
  stroke: { id: "stroke", title: "Weak one side", why: "tone, UMN signs and posture after stroke" },
  myelopathy: { id: "myelopathy", title: "Clumsy hands, unsteady walking", why: "brisk reflexes, Hoffmann's sign and Romberg" },
} satisfies Record<string, VpCaseLink>;

export const SKILL_CASES: Record<string, VpCaseLink[]> = {
  "manual-muscle-testing": [C.cuff, C.l5, C.stroke],
  goniometry: [C.frozen, C.oa, C.cuff],
  dermatomes: [C.l5, C.c6, C.cauda],
  myotomes: [C.l5, C.c6, C.fibular],
  reflexes: [C.myelopathy, C.stroke, C.l5],
  "peripheral-nerves": [C.cts, C.fibular, C.c6],
  "tone-coordination": [C.stroke, C.myelopathy],
  "muscle-length": [{ ...C.l5, why: "telling a tight hamstring from nerve tension in the SLR" }],
  "vital-signs": [C.oa, C.stroke],
  posture: [C.stroke, C.myelopathy, C.frozen],
  "balance-function": [C.myelopathy, C.stroke],
  "limb-measurements": [C.acl, C.oa],
  palpation: [C.ankle, C.oa, C.cuff],
};

export const vpCaseHref = (id: string) => `/virtual-patient?case=${encodeURIComponent(id)}`;
