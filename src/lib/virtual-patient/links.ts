/**
 * Which Virtual Patient cases put each Skills Lab skill into practice. Kept apart
 * from cases.ts so server pages can link to cases without bundling the case data
 * (validate:virtual-patient checks every id here exists).
 */
export const VP_CASE_COUNT = 22;

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
  radial: { id: "radial-nerve-palsy", title: "Woke up with a dropped wrist", why: "radial nerve versus C7: triceps, brachioradialis and the first web space" },
  ulnar: { id: "ulnar-neuropathy-elbow", title: "Numb little finger, weak grip", why: "ulnar nerve versus C8: Froment's sign and the medial forearm" },
  diabetic: { id: "diabetic-neuropathy", title: "Numb feet and falls at night", why: "stocking sensory loss, absent ankle jerks and Romberg" },
  gbs: { id: "guillain-barre", title: "Weakness climbing up both legs", why: "areflexia, ascending weakness and the breathing red flag" },
  stenosis: { id: "lumbar-stenosis", title: "Legs give out after 200 metres", why: "neurogenic versus vascular claudication and foot pulses" },
  achilles: { id: "achilles-rupture", title: "'Kicked' in the calf at badminton", why: "Thompson's test and the palpable gap" },
  dvt: { id: "dvt-post-op", title: "Swollen calf after knee surgery", why: "calf girth, Wells criteria and when to stop" },
  elbow: { id: "lateral-elbow", title: "Carpenter with elbow pain", why: "contractile testing, Cozen's test and tendon loading" },
  heel: { id: "plantar-heel-pain", title: "First-step heel pain", why: "medial heel palpation, windlass test and calf length" },
  hip: { id: "hip-oa", title: "Groin pain and stiff hip", why: "the hip capsular pattern and FABER" },
} satisfies Record<string, VpCaseLink>;

export const SKILL_CASES: Record<string, VpCaseLink[]> = {
  "manual-muscle-testing": [C.cuff, C.radial, C.hip, C.l5],
  goniometry: [C.frozen, C.hip, C.oa],
  dermatomes: [C.l5, C.c6, C.diabetic, C.cauda],
  myotomes: [C.l5, C.c6, C.radial, C.fibular],
  reflexes: [C.myelopathy, C.gbs, C.stroke, C.diabetic],
  "peripheral-nerves": [C.cts, C.ulnar, C.radial, C.fibular],
  "tone-coordination": [C.stroke, C.myelopathy, C.gbs],
  "muscle-length": [{ ...C.l5, why: "telling a tight hamstring from nerve tension in the SLR" }, { ...C.heel, why: "calf length and dorsiflexion in heel pain" }],
  "vital-signs": [C.gbs, C.dvt, C.oa, C.stroke],
  posture: [C.stroke, C.stenosis, C.frozen],
  "balance-function": [C.diabetic, C.myelopathy, C.stroke],
  "limb-measurements": [C.dvt, C.acl, C.oa],
  palpation: [C.ankle, C.elbow, C.heel, C.achilles],
};

export const vpCaseHref = (id: string) => `/virtual-patient?case=${encodeURIComponent(id)}`;
