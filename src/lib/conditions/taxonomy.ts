/**
 * Conditions & Treatment Guide — taxonomy.
 * Two ways to browse: WHERE it is (area) and WHAT KIND of problem it is (type).
 * Three depths: Quick (understand), Clinical (assess and plan), Expert (everything).
 * Small on purpose: this file ships in the worker; the content is static JSON in /conditions-data/.
 */

export type AreaId = "neck" | "shoulder" | "arm" | "back" | "hip" | "knee" | "foot" | "neuro" | "chest" | "whole";
export type TypeId = "injury" | "tear" | "overuse" | "joint" | "spine" | "nerve" | "postop" | "neuro" | "chest" | "longterm";
export type DepthId = "quick" | "clinical" | "expert";

export const areas: { id: AreaId; label: string; hint: string }[] = [
  { id: "neck", label: "Neck & jaw", hint: "Neck pain, whiplash, arm-radiating neck pain, jaw" },
  { id: "shoulder", label: "Shoulder", hint: "Rotator cuff, stiff shoulder, instability, AC joint" },
  { id: "arm", label: "Elbow, wrist & hand", hint: "Tennis/golfer's elbow, carpal tunnel, thumb and finger tendons" },
  { id: "back", label: "Back & spine", hint: "Low back, sciatica, mid-back, inflammatory back pain" },
  { id: "hip", label: "Hip & thigh", hint: "Hip arthritis, groin, side-of-hip pain, hamstring" },
  { id: "knee", label: "Knee", hint: "ACL, meniscus, kneecap pain, arthritis, ligaments" },
  { id: "foot", label: "Leg, ankle & foot", hint: "Sprains, Achilles, heel pain, shin pain, flat foot" },
  { id: "neuro", label: "Nerves, brain & balance", hint: "Stroke, Parkinson's, spinal cord injury, cerebral palsy, dizziness" },
  { id: "chest", label: "Heart & lungs", hint: "COPD, after heart surgery" },
  { id: "whole", label: "Whole body & long-term pain", hint: "Fibromyalgia, after breast surgery" },
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
  { id: "longterm", label: "Long-term & inflammatory", hint: "Fibromyalgia, ankylosing spondylitis" },
];

export const depths: { id: DepthId; label: string; time: string; for: string; gives: string }[] = [
  { id: "quick", label: "Quick guide", time: "2 min", for: "Patients, families, first-year students", gives: "What it is, what it feels like, warning signs, what helps first." },
  { id: "clinical", label: "Clinical plan", time: "10 min", for: "Students and practising physiotherapists", gives: "How to assess it, key tests, differentials and a stage-by-stage plan with exercise doses and when to move on." },
  { id: "expert", label: "Expert detail", time: "Full", for: "Clinicians, educators, exam preparation", gives: "Mechanism, classification, test technique, manual therapy, mistakes, evidence, return-to-play criteria and a case story." },
];

export const areaLabel = (id: string) => areas.find((a) => a.id === id)?.label ?? id;
export const typeLabel = (id: string) => types.find((t) => t.id === id)?.label ?? id;

/** Condition → [area, type]. The builder fails if a condition is missing here. */
export const placement: Record<string, [AreaId, TypeId]> = {
  "mechanical-neck-pain": ["neck", "spine"],
  "whiplash-associated-disorder": ["neck", "spine"],
  "cervical-radiculopathy": ["neck", "nerve"],
  "temporomandibular-disorder": ["neck", "joint"],
  "rotator-cuff-tendinopathy": ["shoulder", "overuse"],
  "rotator-cuff-full-thickness-tear": ["shoulder", "tear"],
  "anterior-shoulder-instability": ["shoulder", "injury"],
  "adhesive-capsulitis": ["shoulder", "joint"],
  "acromioclavicular-joint-injury": ["shoulder", "injury"],
  "long-head-biceps-tendinopathy": ["shoulder", "overuse"],
  "lateral-epicondylalgia": ["arm", "overuse"],
  "medial-epicondylalgia": ["arm", "overuse"],
  "carpal-tunnel-syndrome": ["arm", "nerve"],
  "de-quervain-tenosynovitis": ["arm", "overuse"],
  "trigger-finger": ["arm", "overuse"],
  "non-specific-low-back-pain": ["back", "spine"],
  "lumbar-radiculopathy": ["back", "nerve"],
  "thoracic-spine-pain": ["back", "spine"],
  "ankylosing-spondylitis-rehabilitation": ["back", "longterm"],
  "hamstring-strain": ["hip", "tear"],
  "femoroacetabular-impingement-syndrome": ["hip", "joint"],
  "hip-osteoarthritis": ["hip", "joint"],
  "greater-trochanteric-pain-syndrome": ["hip", "overuse"],
  "gluteal-tendinopathy": ["hip", "overuse"],
  "adductor-related-groin-pain": ["hip", "tear"],
  "acl-injury": ["knee", "injury"],
  "acl-reconstruction-rehabilitation": ["knee", "postop"],
  "meniscal-injury": ["knee", "injury"],
  "knee-osteoarthritis": ["knee", "joint"],
  "patellofemoral-pain": ["knee", "overuse"],
  "patellar-tendinopathy": ["knee", "overuse"],
  "pcl-injury": ["knee", "injury"],
  "mcl-injury": ["knee", "injury"],
  "lateral-ankle-sprain": ["foot", "injury"],
  "achilles-tendon-rupture": ["foot", "tear"],
  "achilles-tendinopathy": ["foot", "overuse"],
  "plantar-heel-pain": ["foot", "overuse"],
  "posterior-tibial-tendon-dysfunction": ["foot", "overuse"],
  "tibial-stress-injury": ["foot", "overuse"],
  "stroke-rehabilitation": ["neuro", "neuro"],
  "parkinsons-disease": ["neuro", "neuro"],
  "spinal-cord-injury-rehabilitation": ["neuro", "neuro"],
  "cerebral-palsy": ["neuro", "neuro"],
  "vestibular-bppv": ["neuro", "neuro"],
  "copd-pulmonary-rehabilitation": ["chest", "chest"],
  "post-cabg-rehabilitation": ["chest", "postop"],
  "fibromyalgia": ["whole", "longterm"],
  "post-mastectomy-rehabilitation": ["whole", "postop"],
};

/** Old addresses that changed name when the two libraries were merged. */
export const renamedSlugs: Record<string, string> = {
  "nonspecific-low-back-pain": "non-specific-low-back-pain",
  "rotator-cuff-related-shoulder-pain": "rotator-cuff-tendinopathy",
  "lateral-elbow-tendinopathy": "lateral-epicondylalgia",
};
