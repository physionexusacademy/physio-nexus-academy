/**
 * Where each chapter of "The Complete Physiotherapy Clinical Mastery" (Dr. Sajjad Raza PT) lives on the website.
 *
 * kind "condition": a guide in the Conditions & Treatment Guide (/conditions/<slug>), placed by body area and type of problem.
 * kind "foundation": a reasoning, assessment or treatment-method chapter on the Clinical Foundations shelf (/conditions/foundations/<slug>).
 * `was`: older addresses of guides this chapter replaces; they redirect here.
 * `aka`: everyday names people search for (search only; never shown as the author's text).
 */
import type { AreaId, TypeId } from "../../src/lib/conditions/taxonomy";

export type ChapterPlace =
  | { file: string; kind: "condition"; slug: string; area: AreaId; type: TypeId; was?: string[]; aka?: string }
  | { file: string; kind: "foundation"; slug: string };

export const chapterMap: ChapterPlace[] = [
  // Volume 1 — Clinical Reasoning and Assessment Foundations
  { file: "v01c01", kind: "foundation", slug: "clinical-reasoning-framework" },
  { file: "v01c02", kind: "foundation", slug: "history-taking-and-pain-assessment" },
  { file: "v01c03", kind: "foundation", slug: "physical-examination-and-neurological-screening" },
  { file: "v01c04", kind: "foundation", slug: "special-tests-diagnostic-accuracy-and-imaging" },
  { file: "v01c05", kind: "foundation", slug: "outcome-measures-documentation-consent-and-referral" },
  // Volume 2 — Cervical Spine and Headache
  { file: "v02c01", kind: "condition", slug: "cervical-radiculopathy", area: "neck", type: "nerve", aka: "pinched nerve in neck arm pain from neck cervical disc nerve root" },
  { file: "v02c02", kind: "condition", slug: "cervical-myelopathy", area: "neck", type: "nerve", aka: "spinal cord compression neck clumsy hands DCM degenerative cervical myelopathy" },
  { file: "v02c03", kind: "condition", slug: "cervicogenic-headache", area: "neck", type: "spine", aka: "headache from the neck neck headache occipital headache" },
  { file: "v02c04", kind: "condition", slug: "whiplash-associated-disorder", area: "neck", type: "spine", aka: "whiplash neck injury car accident neck WAD" },
  { file: "v02c05", kind: "condition", slug: "mechanical-neck-pain", area: "neck", type: "spine", aka: "neck pain stiff neck text neck cervical spondylosis cervical pain gardan dard" },
  { file: "v02c06", kind: "condition", slug: "cervical-artery-dysfunction", area: "neck", type: "spine", aka: "vertebral artery VBI cervical artery dissection upper cervical instability neck manipulation screening" },
  // Volume 3 — Thoracic Spine and Chest-Related Presentations
  { file: "v03c01", kind: "condition", slug: "thoracic-spine-pain", area: "back", type: "spine", aka: "mid back pain upper back pain thoracic pain between shoulder blades" },
  { file: "v03c02", kind: "condition", slug: "rib-related-pain", area: "back", type: "injury", aka: "rib pain costochondritis rib fracture rib dysfunction chest wall pain" },
  { file: "v03c03", kind: "condition", slug: "thoracic-serious-pathology", area: "back", type: "spine", aka: "visceral referred pain thoracic red flags chest pain referred to back" },
  { file: "v03c04", kind: "condition", slug: "thoracic-outlet-syndrome", area: "neck", type: "nerve", aka: "TOS thoracic outlet arm numbness overhead brachial plexus" },
  // Volume 4 — Lumbar Spine and Pelvic Region
  { file: "v04c01", kind: "condition", slug: "non-specific-low-back-pain", area: "back", type: "spine", aka: "low back pain backache lumbago kamar dard nonspecific LBP mechanical back pain" },
  { file: "v04c02", kind: "condition", slug: "lumbar-radiculopathy", area: "back", type: "nerve", aka: "sciatica slipped disc disc herniation prolapse sciatic nerve leg pain from back radiating leg pain" },
  { file: "v04c03", kind: "condition", slug: "cauda-equina-syndrome", area: "back", type: "nerve", aka: "CES saddle numbness bladder bowel back emergency" },
  { file: "v04c04", kind: "condition", slug: "lumbar-spinal-stenosis", area: "back", type: "spine", aka: "spinal stenosis neurogenic claudication leg pain walking narrowing" },
  { file: "v04c05", kind: "condition", slug: "lumbar-spondylolisthesis", area: "back", type: "spine", aka: "spondylolysis spondylolisthesis pars fracture slipped vertebra" },
  { file: "v04c06", kind: "condition", slug: "pelvic-girdle-pain", area: "back", type: "spine", was: ["pregnancy-related-pelvic-girdle-pain"], aka: "sacroiliac joint SIJ pain pelvic pain pregnancy pelvic girdle pain PGP" },
  // Volume 5 — Shoulder and Upper Arm
  { file: "v05c01", kind: "condition", slug: "rotator-cuff-tendinopathy", area: "shoulder", type: "overuse", aka: "rotator cuff related shoulder pain impingement subacromial pain painful arc shoulder pain overhead" },
  { file: "v05c02", kind: "condition", slug: "adhesive-capsulitis", area: "shoulder", type: "joint", aka: "frozen shoulder stiff shoulder shoulder freezing capsulitis" },
  { file: "v05c03", kind: "condition", slug: "glenohumeral-instability", area: "shoulder", type: "injury", was: ["anterior-shoulder-instability"], aka: "dislocated shoulder shoulder dislocation shoulder subluxation Bankart instability" },
  { file: "v05c04", kind: "condition", slug: "acromioclavicular-joint-injury", area: "shoulder", type: "injury", aka: "AC joint separated shoulder AC sprain" },
  { file: "v05c05", kind: "condition", slug: "glenohumeral-osteoarthritis", area: "shoulder", type: "joint", aka: "shoulder arthritis shoulder OA" },
  { file: "v05c06", kind: "condition", slug: "biceps-related-shoulder-pain", area: "shoulder", type: "overuse", was: ["long-head-biceps-tendinopathy"], aka: "biceps tendinitis biceps tendon pain front of shoulder biceps rupture Popeye" },
  { file: "v05c07", kind: "condition", slug: "proximal-humerus-and-clavicle-fractures", area: "shoulder", type: "injury", aka: "broken shoulder humerus fracture collarbone fracture clavicle" },
  // Volume 6 — Elbow, Wrist and Hand
  { file: "v06c01", kind: "condition", slug: "lateral-epicondylalgia", area: "arm", type: "overuse", aka: "tennis elbow lateral elbow tendinopathy lateral epicondylitis outer elbow pain" },
  { file: "v06c02", kind: "condition", slug: "medial-epicondylalgia", area: "arm", type: "overuse", aka: "golfer's elbow medial elbow tendinopathy medial epicondylitis inner elbow pain" },
  { file: "v06c03", kind: "condition", slug: "cubital-tunnel-syndrome", area: "arm", type: "nerve", aka: "ulnar nerve elbow little finger tingling funny bone" },
  { file: "v06c04", kind: "condition", slug: "carpal-tunnel-syndrome", area: "arm", type: "nerve", aka: "CTS median nerve tingling fingers numb hands at night" },
  { file: "v06c05", kind: "condition", slug: "de-quervain-tenosynovitis", area: "arm", type: "overuse", aka: "mother's wrist thumb tendon pain texting thumb wrist thumb side pain" },
  { file: "v06c06", kind: "condition", slug: "distal-radius-fracture", area: "arm", type: "injury", aka: "wrist fracture Colles fracture broken wrist" },
  { file: "v06c07", kind: "condition", slug: "scaphoid-fracture", area: "arm", type: "injury", aka: "scaphoid wrist fracture snuffbox" },
  { file: "v06c08", kind: "condition", slug: "trigger-finger", area: "arm", type: "overuse", aka: "stenosing tenosynovitis finger locking finger catching mallet finger finger tendon injury" },
  // Volume 7 — Hip, Groin and Thigh
  { file: "v07c01", kind: "condition", slug: "hip-osteoarthritis", area: "hip", type: "joint", aka: "hip arthritis hip OA hip wear" },
  { file: "v07c02", kind: "condition", slug: "gluteal-tendinopathy", area: "hip", type: "overuse", was: ["greater-trochanteric-pain-syndrome"], aka: "GTPS trochanteric bursitis side of hip pain lateral hip pain gluteal tendon" },
  { file: "v07c03", kind: "condition", slug: "hamstring-strain", area: "hip", type: "tear", aka: "hamstring injury pulled hamstring hamstring tear back of thigh pain sprinter" },
  { file: "v07c04", kind: "condition", slug: "femoroacetabular-impingement-syndrome", area: "hip", type: "joint", aka: "FAI hip impingement cam pincer labral tear groin pain hip" },
  { file: "v07c05", kind: "condition", slug: "hip-fracture", area: "hip", type: "injury", aka: "neck of femur fracture broken hip fall older adult" },
  { file: "v07c06", kind: "condition", slug: "groin-pain-in-athletes", area: "hip", type: "tear", was: ["adductor-related-groin-pain"], aka: "groin strain adductor strain groin pain footballer inguinal pubic" },
  // Volume 8 — Knee, Leg, Ankle and Foot
  { file: "v08c01", kind: "condition", slug: "knee-osteoarthritis", area: "knee", type: "joint", aka: "knee arthritis knee OA ghutno ka dard" },
  { file: "v08c02", kind: "condition", slug: "patellofemoral-pain", area: "knee", type: "overuse", aka: "PFPS kneecap pain runner's knee anterior knee pain" },
  { file: "v08c03", kind: "condition", slug: "acl-injury", area: "knee", type: "injury", aka: "ACL tear anterior cruciate ligament cruciate knee giving way" },
  { file: "v08c04", kind: "condition", slug: "meniscal-injury", area: "knee", type: "injury", aka: "meniscus tear cartilage tear knee locking torn cartilage" },
  { file: "v08c05", kind: "condition", slug: "lateral-ankle-sprain", area: "foot", type: "injury", aka: "ankle sprain twisted ankle rolled ankle" },
  { file: "v08c06", kind: "condition", slug: "plantar-heel-pain", area: "foot", type: "overuse", aka: "plantar fasciitis plantar fasciopathy heel pain heel spur" },
  { file: "v08c07", kind: "condition", slug: "achilles-tendinopathy", area: "foot", type: "overuse", aka: "achilles tendinitis achilles pain back of heel" },
  { file: "v08c08", kind: "condition", slug: "patellar-tendinopathy", area: "knee", type: "overuse", aka: "jumper's knee patellar tendinitis" },
  { file: "v08c09", kind: "condition", slug: "knee-collateral-and-pcl-injuries", area: "knee", type: "injury", was: ["mcl-injury", "pcl-injury"], aka: "MCL LCL PCL collateral ligament knee sprain posterior cruciate" },
  { file: "v08c10", kind: "condition", slug: "tibial-stress-injury", area: "foot", type: "overuse", aka: "shin splints MTSS medial tibial stress syndrome stress fracture bone stress injury" },
  // Volume 9 — Neurological Physiotherapy
  { file: "v09c01", kind: "condition", slug: "stroke-rehabilitation", area: "neuro", type: "neuro", aka: "stroke CVA paralysis hemiplegia falij" },
  { file: "v09c02", kind: "condition", slug: "traumatic-brain-injury", area: "neuro", type: "neuro", aka: "TBI head injury concussion" },
  { file: "v09c03", kind: "condition", slug: "spinal-cord-injury-rehabilitation", area: "neuro", type: "neuro", aka: "SCI paraplegia tetraplegia quadriplegia" },
  { file: "v09c04", kind: "condition", slug: "parkinsons-disease", area: "neuro", type: "neuro", aka: "Parkinson's tremor freezing of gait" },
  { file: "v09c05", kind: "condition", slug: "multiple-sclerosis", area: "neuro", type: "neuro", aka: "MS demyelination fatigue" },
  { file: "v09c06", kind: "condition", slug: "guillain-barre-syndrome", area: "neuro", type: "neuro", aka: "GBS acute inflammatory polyneuropathy ascending weakness" },
  { file: "v09c07", kind: "condition", slug: "vestibular-bppv", area: "neuro", type: "neuro", aka: "BPPV vertigo dizziness vestibular hypofunction chakkar" },
  // Volume 10 — Cardiopulmonary Physiotherapy
  { file: "v10c01", kind: "foundation", slug: "cardiopulmonary-assessment-and-exercise-monitoring" },
  { file: "v10c02", kind: "condition", slug: "copd-pulmonary-rehabilitation", area: "chest", type: "chest", aka: "COPD chronic bronchitis emphysema pulmonary rehabilitation breathlessness" },
  { file: "v10c03", kind: "condition", slug: "asthma", area: "chest", type: "chest", aka: "asthma wheeze breathing" },
  { file: "v10c04", kind: "condition", slug: "pneumonia-and-airway-clearance", area: "chest", type: "chest", aka: "pneumonia sputum retention chest physiotherapy airway clearance" },
  { file: "v10c05", kind: "condition", slug: "postoperative-respiratory-care", area: "chest", type: "postop", aka: "after abdominal surgery after thoracic surgery chest physio post-op" },
  { file: "v10c06", kind: "condition", slug: "cardiac-rehabilitation", area: "chest", type: "chest", was: ["post-cabg-rehabilitation"], aka: "cardiac rehab heart attack MI PCI stent CABG bypass" },
  { file: "v10c07", kind: "condition", slug: "heart-failure", area: "chest", type: "chest", aka: "heart failure HF breathless swelling legs" },
  // Volume 11 — Paediatrics, Geriatrics and Special Populations
  { file: "v11c01", kind: "condition", slug: "cerebral-palsy", area: "neuro", type: "neuro", aka: "CP child spasticity GMFCS" },
  { file: "v11c02", kind: "condition", slug: "developmental-motor-delay", area: "neuro", type: "neuro", aka: "late walking milestones delay baby development" },
  { file: "v11c03", kind: "condition", slug: "paediatric-hip-and-knee-conditions", area: "hip", type: "joint", aka: "DDH hip dysplasia Perthes SCFE slipped upper femoral epiphysis Osgood-Schlatter child limp" },
  { file: "v11c04", kind: "condition", slug: "falls-and-frailty", area: "whole", type: "longterm", aka: "falls older adults frailty balance elderly" },
  { file: "v11c05", kind: "condition", slug: "osteoporosis", area: "whole", type: "longterm", aka: "weak bones fragility fracture bone density" },
  // Volume 12 — Sports, Postoperative and Functional Rehabilitation
  { file: "v12c01", kind: "foundation", slug: "tissue-healing-and-load-management" },
  { file: "v12c02", kind: "condition", slug: "acl-reconstruction-rehabilitation", area: "knee", type: "postop", aka: "ACL surgery ACL reconstruction rehab after ACL operation graft" },
  { file: "v12c03", kind: "condition", slug: "knee-and-hip-arthroplasty-rehabilitation", area: "knee", type: "postop", was: ["total-knee-replacement-rehabilitation", "total-hip-replacement-rehabilitation"], aka: "TKR TKA THR THA knee replacement hip replacement" },
  { file: "v12c04", kind: "condition", slug: "rotator-cuff-repair-rehabilitation", area: "shoulder", type: "postop", aka: "rotator cuff surgery cuff repair rehab" },
  { file: "v12c05", kind: "foundation", slug: "return-to-sport-and-work" },
  // Volume 13 — Manual Therapy, Exercise and Physical Modalities
  { file: "v13c01", kind: "foundation", slug: "choosing-manual-therapy-and-maitland" },
  { file: "v13c02", kind: "foundation", slug: "mulligan-concept" },
  { file: "v13c03", kind: "foundation", slug: "mckenzie-method" },
  { file: "v13c04", kind: "foundation", slug: "muscle-energy-myofascial-and-strain-counterstrain" },
  { file: "v13c05", kind: "foundation", slug: "neurodynamic-assessment-and-treatment" },
  { file: "v13c06", kind: "foundation", slug: "joint-manipulation" },
  { file: "v13c07", kind: "foundation", slug: "therapeutic-exercise-prescription" },
  { file: "v13c08", kind: "foundation", slug: "physical-modalities" },
];

/** Guides that were on the site but are not in the book (owner's decision, 27 Nov 2026): their addresses go to the guide list, or to the chapter that covers them. */
export const retired: Record<string, string> = {
  // nearest page on the site for each (owner's choice, 27 Nov 2026); rheumatoid arthritis has no close page, so it goes to the guide list
  "temporomandibular-disorder": "/manual-therapy/regions/by-region/tmj-and-craniofacial",
  "rotator-cuff-full-thickness-tear": "/conditions/rotator-cuff-tendinopathy",
  "ankylosing-spondylitis-rehabilitation": "/conditions/thoracic-spine-pain",
  "achilles-tendon-rupture": "/conditions/achilles-tendinopathy",
  "posterior-tibial-tendon-dysfunction": "/learn/tendinopathy-load-management",
  "fibromyalgia": "/learn/pain-science-basics",
  "post-mastectomy-rehabilitation": "/manual-therapy/regions/mld-upper-limb",
  "rheumatoid-arthritis": "/conditions",
  "lymphoedema": "/manual-therapy/manual-lymphatic-drainage",
  "lower-limb-amputation-rehabilitation": "/learn/gait-cycle",
  "bells-palsy": "/learn/umn-vs-lmn",
  // not the same disease as Guillain-Barré syndrome (which used to list it): the lesson on localising a nerve problem fits better
  "diabetic-peripheral-neuropathy": "/learn/radiculopathy-myelopathy-neuropathy",
};
