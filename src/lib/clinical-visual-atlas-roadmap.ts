/** PNA Clinical Visual Atlas expansion roadmap.
 * Planned records are editorial inventory ONLY: they must never be rendered as published images.
 * Existing approved atlas entries remain in clinical-visual-atlas.ts.
 */
export type AtlasSpecialty = "MSK" | "Neurology" | "Pediatrics" | "Cardiopulmonary";
export type AtlasRoadmapEntry = {
  id: string;
  specialty: AtlasSpecialty;
  region: string;
  title: string;
  status: "planned" | "in-review" | "approved";
  visuals: string[];
  review: "pending" | "passed";
};
export const atlasExpansionRoadmap: AtlasRoadmapEntry[] = [
  {
    "id": "msk-cervical-radiculopathy",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Cervical Radiculopathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-cervical-spondylosis",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Cervical Spondylosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-mechanical-neck-pain",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Mechanical Neck Pain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-whiplash-associated-disorder",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Whiplash Associated Disorder",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-cervicogenic-headache",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Cervicogenic Headache",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-thoracic-outlet-syndrome",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Thoracic Outlet Syndrome",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-thoracic-kyphosis",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Thoracic Kyphosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-scoliosis",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Scoliosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-lumbar-disc-herniation",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Lumbar Disc Herniation",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-lumbar-spinal-stenosis",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Lumbar Spinal Stenosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-lumbar-radiculopathy",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Lumbar Radiculopathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-spondylolisthesis",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Spondylolisthesis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-facet-joint-pain",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Facet Joint Pain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-vertebral-compression-fracture",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Vertebral Compression Fracture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-axial-spondyloarthritis",
    "specialty": "MSK",
    "region": "Spine & Neck",
    "title": "Axial Spondyloarthritis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-rotator-cuff-tendinopathy",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Rotator Cuff Tendinopathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-rotator-cuff-tear",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Rotator Cuff Tear",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-adhesive-capsulitis",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Adhesive Capsulitis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-anterior-shoulder-instability",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Anterior Shoulder Instability",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-acromioclavicular-joint-injury",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Acromioclavicular Joint Injury",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-proximal-humerus-fracture",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Proximal Humerus Fracture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-lateral-epicondylalgia",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Lateral Epicondylalgia",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-medial-epicondylalgia",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Medial Epicondylalgia",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-distal-biceps-tendon-rupture",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Distal Biceps Tendon Rupture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-ulnar-neuropathy",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Ulnar Neuropathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-carpal-tunnel-syndrome",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Carpal Tunnel Syndrome",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-de-quervain-tenosynovitis",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "De Quervain Tenosynovitis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-distal-radius-fracture",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Distal Radius Fracture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-thumb-carpometacarpal-osteoarthritis",
    "specialty": "MSK",
    "region": "Shoulder & Arm",
    "title": "Thumb Carpometacarpal Osteoarthritis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-hip-osteoarthritis",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Hip Osteoarthritis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-femoroacetabular-impingement",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Femoroacetabular Impingement",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-acetabular-labral-tear",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Acetabular Labral Tear",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-greater-trochanteric-pain-syndrome",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Greater Trochanteric Pain Syndrome",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-hamstring-strain",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Hamstring Strain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-adductor-strain",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Adductor Strain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-acl-rupture",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "ACL Rupture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-pcl-injury",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "PCL Injury",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-mcl-sprain",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "MCL Sprain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-meniscal-tear",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Meniscal Tear",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-patellofemoral-pain",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Patellofemoral Pain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-patellar-tendinopathy",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Patellar Tendinopathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-knee-osteoarthritis",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Knee Osteoarthritis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-quadriceps-tendon-rupture",
    "specialty": "MSK",
    "region": "Hip & Knee",
    "title": "Quadriceps Tendon Rupture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-lateral-ankle-sprain",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Lateral Ankle Sprain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-syndesmotic-ankle-sprain",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Syndesmotic Ankle Sprain",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-achilles-tendinopathy",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Achilles Tendinopathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-achilles-rupture",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Achilles Rupture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-plantar-fasciopathy",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Plantar Fasciopathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-posterior-tibial-tendon-dysfunction",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Posterior Tibial Tendon Dysfunction",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-ankle-osteoarthritis",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Ankle Osteoarthritis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-metatarsal-stress-fracture",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Metatarsal Stress Fracture",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-hallux-valgus",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Hallux Valgus",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "msk-diabetic-foot-complications",
    "specialty": "MSK",
    "region": "Foot & Ankle",
    "title": "Diabetic Foot Complications",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-ischemic-stroke",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Ischemic Stroke",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-hemorrhagic-stroke",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Hemorrhagic Stroke",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-parkinson-disease",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Parkinson Disease",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-multiple-sclerosis",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Multiple Sclerosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-traumatic-brain-injury",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Traumatic Brain Injury",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-spinal-cord-injury",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Spinal Cord Injury",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-cerebellar-ataxia",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Cerebellar Ataxia",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-amyotrophic-lateral-sclerosis",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Amyotrophic Lateral Sclerosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-transverse-myelitis",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Transverse Myelitis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-normal-pressure-hydrocephalus",
    "specialty": "Neurology",
    "region": "Central nervous system",
    "title": "Normal Pressure Hydrocephalus",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-bell-palsy",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Bell Palsy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-guillain-barre-syndrome",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Guillain Barre Syndrome",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-peripheral-neuropathy",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Peripheral Neuropathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-radial-nerve-palsy",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Radial Nerve Palsy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-common-fibular-nerve-palsy",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Common Fibular Nerve Palsy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-brachial-plexus-injury",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Brachial Plexus Injury",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-benign-paroxysmal-positional-vertigo",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Benign Paroxysmal Positional Vertigo",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-vestibular-neuritis",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Vestibular Neuritis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-bilateral-vestibular-hypofunction",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Bilateral Vestibular Hypofunction",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-facial-nerve-anatomy",
    "specialty": "Neurology",
    "region": "Peripheral & vestibular",
    "title": "Facial Nerve Anatomy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-corticospinal-tract",
    "specialty": "Neurology",
    "region": "Neuroanatomy",
    "title": "Corticospinal Tract",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-basal-ganglia-circuitry",
    "specialty": "Neurology",
    "region": "Neuroanatomy",
    "title": "Basal Ganglia Circuitry",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-cerebellar-pathways",
    "specialty": "Neurology",
    "region": "Neuroanatomy",
    "title": "Cerebellar Pathways",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-dermatomes-and-myotomes",
    "specialty": "Neurology",
    "region": "Neuroanatomy",
    "title": "Dermatomes And Myotomes",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-spinal-cord-cross-section",
    "specialty": "Neurology",
    "region": "Neuroanatomy",
    "title": "Spinal Cord Cross Section",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "neurology-peripheral-nerve-anatomy",
    "specialty": "Neurology",
    "region": "Neuroanatomy",
    "title": "Peripheral Nerve Anatomy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-gross-motor-developmental-milestones",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Gross Motor Developmental Milestones",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-cerebral-palsy-spastic-diplegia",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Cerebral Palsy Spastic Diplegia",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-cerebral-palsy-hemiplegia",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Cerebral Palsy Hemiplegia",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-developmental-coordination-disorder",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Developmental Coordination Disorder",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-spina-bifida",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Spina Bifida",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-down-syndrome",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Down Syndrome",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-autism-associated-motor-differences",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Autism Associated Motor Differences",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-pediatric-traumatic-brain-injury",
    "specialty": "Pediatrics",
    "region": "Development & neuromotor",
    "title": "Pediatric Traumatic Brain Injury",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-developmental-dysplasia-of-the-hip",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Developmental Dysplasia Of The Hip",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-clubfoot",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Clubfoot",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-congenital-muscular-torticollis",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Congenital Muscular Torticollis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-legg-calve-perthes-disease",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Legg Calve Perthes Disease",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-slipped-capital-femoral-epiphysis",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Slipped Capital Femoral Epiphysis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-juvenile-idiopathic-arthritis",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Juvenile Idiopathic Arthritis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-osgood-schlatter-disease",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Osgood Schlatter Disease",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-adolescent-idiopathic-scoliosis",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Adolescent Idiopathic Scoliosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-limb-length-discrepancy",
    "specialty": "Pediatrics",
    "region": "Orthopedic & congenital",
    "title": "Limb Length Discrepancy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-duchenne-muscular-dystrophy",
    "specialty": "Pediatrics",
    "region": "Neuromuscular & respiratory",
    "title": "Duchenne Muscular Dystrophy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-spinal-muscular-atrophy",
    "specialty": "Pediatrics",
    "region": "Neuromuscular & respiratory",
    "title": "Spinal Muscular Atrophy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-brachial-plexus-birth-injury",
    "specialty": "Pediatrics",
    "region": "Neuromuscular & respiratory",
    "title": "Brachial Plexus Birth Injury",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-cystic-fibrosis-in-children",
    "specialty": "Pediatrics",
    "region": "Neuromuscular & respiratory",
    "title": "Cystic Fibrosis In Children",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-pediatric-asthma",
    "specialty": "Pediatrics",
    "region": "Neuromuscular & respiratory",
    "title": "Pediatric Asthma",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "pediatrics-bronchopulmonary-dysplasia",
    "specialty": "Pediatrics",
    "region": "Neuromuscular & respiratory",
    "title": "Bronchopulmonary Dysplasia",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-copd-emphysema",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "COPD Emphysema",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-copd-chronic-bronchitis",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "COPD Chronic Bronchitis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-asthma",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Asthma",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-bronchiectasis",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Bronchiectasis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-pneumonia",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Pneumonia",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-pulmonary-fibrosis",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Pulmonary Fibrosis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-pleural-effusion",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Pleural Effusion",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-pneumothorax",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Pneumothorax",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-atelectasis",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Atelectasis",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-pulmonary-embolism",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Pulmonary Embolism",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-interstitial-lung-disease",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Interstitial Lung Disease",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-obstructive-sleep-apnea",
    "specialty": "Cardiopulmonary",
    "region": "Pulmonary",
    "title": "Obstructive Sleep Apnea",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-coronary-artery-disease",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Coronary Artery Disease",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-myocardial-infarction",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Myocardial Infarction",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-heart-failure",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Heart Failure",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-cardiomyopathy",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Cardiomyopathy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-valvular-heart-disease",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Valvular Heart Disease",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-peripheral-artery-disease",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Peripheral Artery Disease",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-hypertension-and-cardiac-remodeling",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Hypertension And Cardiac Remodeling",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-post-cabg-recovery",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Post CABG Recovery",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-post-cardiac-valve-surgery-recovery",
    "specialty": "Cardiopulmonary",
    "region": "Cardiac",
    "title": "Post Cardiac Valve Surgery Recovery",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-normal-cardiac-anatomy",
    "specialty": "Cardiopulmonary",
    "region": "Functional anatomy & rehabilitation",
    "title": "Normal Cardiac Anatomy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-normal-lung-anatomy",
    "specialty": "Cardiopulmonary",
    "region": "Functional anatomy & rehabilitation",
    "title": "Normal Lung Anatomy",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-diaphragm-and-breathing-mechanics",
    "specialty": "Cardiopulmonary",
    "region": "Functional anatomy & rehabilitation",
    "title": "Diaphragm And Breathing Mechanics",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-ventilation-perfusion-matching",
    "specialty": "Cardiopulmonary",
    "region": "Functional anatomy & rehabilitation",
    "title": "Ventilation Perfusion Matching",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-airway-clearance-physiology",
    "specialty": "Cardiopulmonary",
    "region": "Functional anatomy & rehabilitation",
    "title": "Airway Clearance Physiology",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-cardiac-rehabilitation-phases",
    "specialty": "Cardiopulmonary",
    "region": "Functional anatomy & rehabilitation",
    "title": "Cardiac Rehabilitation Phases",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  },
  {
    "id": "cardiopulmonary-exercise-response-and-oxygen-delivery",
    "specialty": "Cardiopulmonary",
    "region": "Functional anatomy & rehabilitation",
    "title": "Exercise Response And Oxygen Delivery",
    "status": "planned",
    "visuals": [
      "normal anatomy",
      "condition or mechanism",
      "clinical relevance"
    ],
    "review": "pending"
  }
];
