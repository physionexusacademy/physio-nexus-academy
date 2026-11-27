/**
 * Conditions & Treatment Guide — taxonomy.
 * Two ways to browse: WHERE it is (area) and WHAT KIND of problem it is (type).
 * Every guide has three parts on one page: At a glance (understand), Clinical plan (assess and plan), Expert detail (everything). Nothing is hidden behind a level.
 * Small on purpose: this file ships in the worker; the content is static JSON in /conditions-data/.
 */

export type AreaId = "neck" | "shoulder" | "arm" | "back" | "hip" | "knee" | "foot" | "neuro" | "chest" | "whole";
export type TypeId = "injury" | "tear" | "overuse" | "joint" | "spine" | "nerve" | "postop" | "neuro" | "chest" | "longterm";
export type DepthId = "quick" | "clinical" | "expert";

export const areas: { id: AreaId; label: string; hint: string }[] = [
  { id: "neck", label: "Neck & head", hint: "Neck pain, whiplash, nerve root pain, myelopathy, neck headache, thoracic outlet" },
  { id: "shoulder", label: "Shoulder", hint: "Rotator cuff, stiff shoulder, instability, AC joint" },
  { id: "arm", label: "Elbow, wrist & hand", hint: "Tennis/golfer's elbow, carpal tunnel, thumb and finger tendons" },
  { id: "back", label: "Back, chest wall & pelvis", hint: "Low back, sciatica, stenosis, cauda equina, mid-back, ribs, pelvic girdle" },
  { id: "hip", label: "Hip & thigh", hint: "Hip arthritis, groin, side-of-hip pain, hamstring" },
  { id: "knee", label: "Knee", hint: "ACL, meniscus, kneecap pain, arthritis, ligaments" },
  { id: "foot", label: "Leg, ankle & foot", hint: "Sprains, Achilles, heel pain, shin pain, flat foot" },
  { id: "neuro", label: "Nerves, brain, balance & children", hint: "Stroke, Parkinson's, MS, spinal cord injury, cerebral palsy, motor delay, dizziness" },
  { id: "chest", label: "Heart & lungs", hint: "COPD, asthma, pneumonia, after surgery, cardiac rehab, heart failure" },
  { id: "whole", label: "Bones, falls & older adults", hint: "Osteoporosis, falls and frailty" },
];

export const types: { id: TypeId; label: string; hint: string }[] = [
  { id: "injury", label: "Ligament, joint & cartilage injury", hint: "Sprains, instability, meniscus, ACL" },
  { id: "tear", label: "Muscle & tendon tears", hint: "Strains and ruptures" },
  { id: "overuse", label: "Tendon & overuse pain", hint: "Tendinopathy, heel pain, stress injury" },
  { id: "joint", label: "Joint pain & stiffness", hint: "Arthritis, frozen shoulder, hip impingement, jaw" },
  { id: "spine", label: "Neck & back pain", hint: "Mechanical spinal pain, whiplash" },
  { id: "nerve", label: "Nerve problems", hint: "Pinched or irritated nerves" },
  { id: "postop", label: "After surgery", hint: "Structured rehab after an operation" },
  { id: "neuro", label: "Neurological & balance", hint: "Stroke, Parkinson's, spinal cord, cerebral palsy, BPPV" },
  { id: "chest", label: "Heart & lung", hint: "Breathing and cardiac rehabilitation" },
  { id: "longterm", label: "Bone health & frailty", hint: "Osteoporosis, falls and frailty" },
];

export const depths: { id: DepthId; label: string; time: string; for: string; gives: string }[] = [
  { id: "quick", label: "Quick guide", time: "2 min", for: "Patients, families, first-year students", gives: "What it is, what it feels like, warning signs, what helps first." },
  { id: "clinical", label: "Clinical plan", time: "10 min", for: "Students and practising physiotherapists", gives: "How to assess it, key tests, differentials and a stage-by-stage plan with exercise doses and when to move on." },
  { id: "expert", label: "Expert detail", time: "Full", for: "Clinicians, educators, exam preparation", gives: "Mechanism, classification, test technique, manual therapy, mistakes, evidence, return-to-play criteria and a case story." },
];

export const areaLabel = (id: string) => areas.find((a) => a.id === id)?.label ?? id;
export const typeLabel = (id: string) => types.find((t) => t.id === id)?.label ?? id;
