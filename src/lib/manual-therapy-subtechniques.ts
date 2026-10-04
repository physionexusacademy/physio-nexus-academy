import type { ManualRegion } from "@/lib/manual-therapy-regional";
import { getPriorityRegionalSubTechniques } from "@/lib/manual-therapy-priority-depth";

export type RegionalSubTechnique = {
  name: string;
  target: string;
  clinicalGoal: string;
  patientSetup: string;
  contact: string;
  direction: string;
  dosage: string;
  reassess: string;
  clinicalPearl?: string;
  safetyNote?: string;
};

type Seed = {
  name: string;
  target: string;
  goal: string;
  direction: string;
  setup?: string;
  contact?: string;
  dosage?: string;
  reassess?: string;
  pearl?: string;
  safety?: string;
};

const jointSeeds: Partial<Record<string, Partial<Record<ManualRegion, Seed[]>>>> = {
  "maitland-joint-mobilization": {
    "TMJ & Craniofacial": [
      { name: "TMJ Distraction", target: "Temporomandibular joint", goal: "Reduce compression sensitivity and improve comfortable opening", direction: "Gentle inferior distraction of the mandibular condyle", reassess: "Pain-free mouth opening and chewing" },
      { name: "TMJ Anterior Glide", target: "Mandibular condyle/disc complex", goal: "Improve limited mouth opening when anterior translation is clinically relevant", direction: "Controlled anterior glide in the treatment plane", reassess: "Opening range and end-feel" },
      { name: "TMJ Medial/Lateral Glide", target: "Temporomandibular joint", goal: "Improve asymmetrical excursion", direction: "Small transverse glide selected from the restricted direction", reassess: "Lateral excursion and opening symmetry" }
    ],
    Cervical: [
      { name: "Central PA Mobilization", target: "Selected cervical spinous process", goal: "Pain modulation or segmental extension tolerance", direction: "Posterior-to-anterior oscillation through the selected segment", reassess: "Cervical extension/rotation" },
      { name: "Unilateral PA Mobilization", target: "Cervical articular pillar", goal: "Improve painful or restricted rotation/extension when the segment is clinically relevant", direction: "Posterior-to-anterior oscillation over the articular pillar", reassess: "Rotation to the comparable side" },
      { name: "Cervical Side Glide", target: "Mid/lower cervical segment", goal: "Improve lateral translation and selected radicular/mechanical comparable signs", direction: "Gentle transverse glide while the head remains supported", reassess: "Side-bending, rotation and arm symptom behavior" }
    ],
    Thoracic: [
      { name: "Central PA Mobilization", target: "Thoracic spinous process", goal: "Improve thoracic extension tolerance and local stiffness", direction: "Posterior-to-anterior oscillation", reassess: "Thoracic extension/rotation" },
      { name: "Unilateral PA Mobilization", target: "Thoracic facet/transverse-process region", goal: "Address asymmetric stiffness", direction: "Posterior-to-anterior oscillation on the selected side", reassess: "Thoracic rotation" },
      { name: "Transverse Glide", target: "Thoracic segment", goal: "Test/change a rotation-related comparable sign", direction: "Controlled lateral translation of the selected segment", reassess: "Rotation and linked neck/shoulder movement" }
    ],
    Lumbar: [
      { name: "Central PA Mobilization", target: "Lumbar spinous process", goal: "Pain modulation and extension tolerance", direction: "Posterior-to-anterior oscillation", reassess: "Lumbar extension and functional bend" },
      { name: "Unilateral PA Mobilization", target: "Lumbar posterior element", goal: "Address asymmetric local stiffness", direction: "Posterior-to-anterior oscillation on the selected side", reassess: "Rotation/side-bending" },
      { name: "Lumbar Transverse Mobilization", target: "Lumbar segment", goal: "Modify a rotation-sensitive comparable sign", direction: "Small transverse glide under controlled stabilization", reassess: "Trunk rotation and symptoms" }
    ],
    Shoulder: [
      { name: "Glenohumeral Posterior Glide", target: "Humeral head on glenoid", goal: "Improve flexion/internal-rotation tolerance when posterior glide is relevant", direction: "Posterior translation of humeral head", reassess: "Flexion, internal rotation and reach" },
      { name: "Glenohumeral Inferior Glide", target: "Humeral head on glenoid", goal: "Improve elevation/abduction tolerance", direction: "Inferior glide relative to glenoid", reassess: "Abduction/elevation" },
      { name: "Glenohumeral Anterior Glide", target: "Humeral head on glenoid", goal: "Selected external-rotation/extension restriction when clinically indicated", direction: "Anterior glide with scapula stabilized", reassess: "External rotation/extension" },
      { name: "Glenohumeral Distraction", target: "Glenohumeral joint", goal: "Reduce compression sensitivity and prepare for movement", direction: "Gentle lateral/long-axis distraction", reassess: "Pain and elevation" }
    ],
    Elbow: [
      { name: "Ulnohumeral Distraction", target: "Ulnohumeral joint", goal: "Pain modulation and flexion/extension mobility", direction: "Long-axis distraction", reassess: "Elbow flexion/extension" },
      { name: "Proximal Radioulnar AP/PA Glide", target: "Radial head", goal: "Improve pronation/supination when joint-play restriction is relevant", direction: "Small anterior/posterior radial-head glide", reassess: "Pronation/supination" },
      { name: "Humeroulnar Medial/Lateral Glide", target: "Ulnohumeral joint", goal: "Selected side-to-side accessory restriction", direction: "Controlled transverse glide", reassess: "Pain-free elbow motion and grip" }
    ],
    "Wrist & Hand": [
      { name: "Radiocarpal Dorsal Glide", target: "Proximal carpal row on radius", goal: "Improve wrist flexion when the glide is clinically relevant", direction: "Dorsal carpal glide with forearm stabilized", reassess: "Wrist flexion" },
      { name: "Radiocarpal Volar Glide", target: "Proximal carpal row on radius", goal: "Improve wrist extension when clinically relevant", direction: "Volar carpal glide", reassess: "Wrist extension and weight-bearing" },
      { name: "Radiocarpal Distraction", target: "Radiocarpal joint", goal: "Pain modulation and joint-play preparation", direction: "Long-axis distraction", reassess: "Pain and wrist ROM" },
      { name: "Thumb CMC Glide", target: "First carpometacarpal joint", goal: "Improve selected thumb mobility", direction: "Small accessory glide based on restricted motion", reassess: "Thumb opposition/abduction" }
    ],
    "Hip & Pelvis": [
      { name: "Hip Long-Axis Distraction", target: "Femoroacetabular joint", goal: "Reduce compression sensitivity and improve hip movement tolerance", direction: "Long-axis distraction along femoral shaft", reassess: "Hip flexion/rotation and gait" },
      { name: "Hip Lateral Glide", target: "Femoral head", goal: "Improve flexion/rotation when lateral distraction is helpful", direction: "Lateral translation using hands or belt as trained", reassess: "Flexion and rotation" },
      { name: "Hip Posterior Glide", target: "Femoral head", goal: "Selected flexion/internal-rotation restriction", direction: "Posterior glide with pelvis stabilized", reassess: "Flexion/internal rotation" },
      { name: "Hip Anterior Glide", target: "Femoral head", goal: "Selected extension/external-rotation restriction", direction: "Anterior glide with careful positioning", reassess: "Extension/external rotation" }
    ],
    Knee: [
      { name: "Tibiofemoral AP Glide", target: "Proximal tibia", goal: "Selected flexion/extension restriction depending setup", direction: "Anterior-to-posterior tibial glide", reassess: "Knee ROM and squat" },
      { name: "Tibiofemoral PA Glide", target: "Proximal tibia", goal: "Selected extension/flexion restriction depending setup", direction: "Posterior-to-anterior tibial glide", reassess: "Knee ROM and step task" },
      { name: "Patellar Superior/Inferior Glide", target: "Patellofemoral joint", goal: "Improve patellar mobility linked to flexion/extension restriction", direction: "Superior or inferior patellar translation", reassess: "Knee flexion/extension" },
      { name: "Tibiofemoral Distraction", target: "Knee joint", goal: "Pain modulation and joint-play preparation", direction: "Long-axis distraction", reassess: "Pain, ROM and weight-bearing" }
    ],
    "Ankle & Foot": [
      { name: "Posterior Talar Glide", target: "Talocrural joint", goal: "Improve dorsiflexion", direction: "Posterior glide of talus with tibia/fibula stabilized", reassess: "Weight-bearing lunge" },
      { name: "Anterior Talar Glide", target: "Talocrural joint", goal: "Improve plantarflexion when clinically relevant", direction: "Anterior talar glide", reassess: "Plantarflexion" },
      { name: "Talocrural Distraction", target: "Talocrural joint", goal: "Pain modulation and joint-play preparation", direction: "Long-axis distraction", reassess: "Ankle ROM and gait" },
      { name: "Subtalar Medial/Lateral Glide", target: "Subtalar joint", goal: "Improve inversion/eversion-related accessory motion", direction: "Controlled calcaneal medial/lateral glide", reassess: "Rear-foot motion and functional stance" }
    ]
  },

  "kaltenborn-evjenth-mobilization": {
    Shoulder: [
      { name: "Grade I–III Glenohumeral Traction", target: "Glenohumeral joint", goal: "Neutralize compression, take up slack or stretch capsule", direction: "Perpendicular to the glenoid treatment plane", reassess: "Pain and shoulder ROM" },
      { name: "Posterior Translatoric Glide", target: "Humeral head", goal: "Improve selected flexion/internal-rotation restriction", direction: "Parallel to treatment plane in posterior direction", reassess: "Flexion/internal rotation" },
      { name: "Inferior Translatoric Glide", target: "Humeral head", goal: "Improve elevation/abduction restriction", direction: "Inferior parallel glide", reassess: "Abduction/elevation" }
    ],
    Elbow: [
      { name: "Ulnohumeral Traction", target: "Ulnohumeral joint", goal: "Pain modulation or capsular stretch", direction: "Perpendicular distraction in treatment plane", reassess: "Flexion/extension" },
      { name: "Radial Head Translatoric Glide", target: "Proximal radioulnar joint", goal: "Improve forearm rotation", direction: "AP/PA glide selected from restriction", reassess: "Pronation/supination" }
    ],
    "Wrist & Hand": [
      { name: "Radiocarpal Traction", target: "Radiocarpal joint", goal: "Pain modulation and capsular preparation", direction: "Perpendicular distraction", reassess: "Wrist ROM" },
      { name: "Radiocarpal Dorsal/Volar Glide", target: "Proximal carpal row", goal: "Improve flexion or extension", direction: "Parallel dorsal or volar translatoric glide", reassess: "Wrist flexion/extension" }
    ],
    "Hip & Pelvis": [
      { name: "Hip Long-Axis Traction", target: "Femoroacetabular joint", goal: "Reduce compression and improve mobility", direction: "Long-axis traction", reassess: "Hip ROM and gait" },
      { name: "Hip Lateral Traction", target: "Femoral head", goal: "Joint-play stretch and flexion/rotation preparation", direction: "Lateral distraction", reassess: "Flexion/rotation" },
      { name: "Hip Posterior Translatoric Glide", target: "Femoral head", goal: "Selected capsular restriction", direction: "Posterior parallel glide", reassess: "Flexion/internal rotation" }
    ],
    Knee: [
      { name: "Tibiofemoral Traction", target: "Tibiofemoral joint", goal: "Pain modulation or capsular stretch", direction: "Perpendicular joint distraction", reassess: "Knee ROM" },
      { name: "AP/PA Tibial Translatoric Glide", target: "Proximal tibia", goal: "Improve selected flexion/extension restriction", direction: "Parallel anterior/posterior glide", reassess: "Flexion/extension and functional squat" }
    ],
    "Ankle & Foot": [
      { name: "Talocrural Traction", target: "Talocrural joint", goal: "Pain modulation and capsular stretch", direction: "Long-axis/perpendicular distraction", reassess: "Dorsiflexion/plantarflexion" },
      { name: "Posterior Talar Translatoric Glide", target: "Talus", goal: "Improve dorsiflexion", direction: "Posterior parallel glide", reassess: "Weight-bearing lunge" }
    ]
  },

  "mulligan-mobilization-with-movement": {
    Shoulder: [
      { name: "Lateral Glide + Active Elevation", target: "Glenohumeral joint", goal: "Pain-free shoulder elevation", direction: "Sustained lateral accessory glide during active elevation", reassess: "Pain-free flexion/abduction" },
      { name: "Posterolateral Glide + Rotation", target: "Glenohumeral joint", goal: "Improve a painful rotation comparable sign", direction: "Sustained posterolateral glide while patient actively rotates", reassess: "Internal/external rotation" }
    ],
    Elbow: [
      { name: "Lateral Elbow Glide + Grip", target: "Elbow complex", goal: "Reduce pain with gripping in selected lateral-elbow presentations", direction: "Sustained lateral glide during pain-free gripping", reassess: "Pain-free grip strength" },
      { name: "Elbow Glide + Flexion/Extension", target: "Ulnohumeral/radiocapitellar region", goal: "Improve painful active elbow motion", direction: "Accessory glide maintained during active movement", reassess: "Flexion/extension" }
    ],
    "Wrist & Hand": [
      { name: "Wrist MWM + Extension", target: "Radiocarpal/midcarpal region", goal: "Improve painful wrist extension", direction: "Sustained accessory glide while patient actively extends", reassess: "Extension and weight-bearing" },
      { name: "Thumb MWM", target: "Thumb CMC/MCP region", goal: "Improve painful thumb movement in selected cases", direction: "Pain-free accessory glide maintained during active thumb motion", reassess: "Opposition/abduction and pinch" }
    ],
    "Hip & Pelvis": [
      { name: "Belt-Assisted Lateral Hip Glide + Flexion", target: "Femoroacetabular joint", goal: "Improve pain-free hip flexion", direction: "Sustained lateral glide while patient actively flexes", reassess: "Hip flexion and squat" },
      { name: "Hip Glide + Rotation", target: "Femoroacetabular joint", goal: "Improve selected painful rotation", direction: "Sustained accessory glide during active rotation", reassess: "Internal/external rotation" }
    ],
    Knee: [
      { name: "Tibial Glide + Active Flexion/Extension", target: "Tibiofemoral joint", goal: "Improve painful active knee movement", direction: "Sustained tibial accessory glide during active motion", reassess: "Knee ROM and squat" },
      { name: "Patellar MWM + Functional Task", target: "Patellofemoral region", goal: "Reduce selected task-related anterior knee pain", direction: "Comfortable patellar correction maintained during task", reassess: "Step-down/squat pain" }
    ],
    "Ankle & Foot": [
      { name: "Weight-Bearing Ankle MWM", target: "Talocrural joint", goal: "Improve dorsiflexion in lunge/squat", direction: "Sustained posterior talar or anterior tibial glide during weight-bearing dorsiflexion", reassess: "Weight-bearing lunge distance" },
      { name: "Foot/Ankle Glide + Functional Step", target: "Selected ankle/foot joint", goal: "Improve a pain-limited functional movement", direction: "Accessory glide maintained during the exact functional motion", reassess: "Step, squat or gait task" }
    ]
  }
};

const spinalSnagSeeds: Partial<Record<ManualRegion, Seed[]>> = {
  Cervical: [
    { name: "Cervical NAG", target: "Selected cervical segment", goal: "Pain modulation and movement preparation", direction: "Gentle facet-directed oscillatory glide", reassess: "Cervical ROM" },
    { name: "Cervical SNAG", target: "Selected cervical facet/segment", goal: "Restore a painful/restricted active movement", direction: "Sustained segmental glide during active movement", reassess: "Exact painful movement" },
    { name: "Self-SNAG", target: "Cervical movement restriction", goal: "Safe self-management when the manual direction is known to help", direction: "Towel-assisted sustained glide during active movement", reassess: "Pain-free ROM after self-treatment" }
  ],
  Thoracic: [
    { name: "Thoracic SNAG", target: "Selected thoracic segment", goal: "Improve active thoracic extension/rotation", direction: "Sustained segmental glide during active movement", reassess: "Thoracic rotation/extension" }
  ],
  Lumbar: [
    { name: "Lumbar SNAG", target: "Selected lumbar segment", goal: "Improve pain-free flexion/extension/side-bending", direction: "Sustained segmental glide during active movement", reassess: "Original lumbar comparable sign" }
  ]
};

const muscleTargets: Record<ManualRegion, string[]> = {
  "TMJ & Craniofacial": ["Masseter", "Temporalis", "Suboccipital muscles"],
  Cervical: ["Upper trapezius", "Levator scapulae", "Scalenes"],
  Thoracic: ["Thoracic paraspinals", "Rhomboids", "Latissimus dorsi"],
  "Ribs & Chest Wall": ["Intercostal region", "Pectoralis minor", "Serratus anterior"],
  Lumbar: ["Quadratus lumborum", "Lumbar paraspinals", "Thoracolumbar fascia"],
  Shoulder: ["Pectoralis minor/major", "Posterior cuff", "Latissimus/teres major"],
  Elbow: ["Common wrist extensors", "Common wrist flexors", "Biceps/triceps distal myofascial region"],
  "Wrist & Hand": ["Forearm flexor tendons/muscles", "Forearm extensor tendons/muscles", "Thenar/hypothenar soft tissue"],
  "Hip & Pelvis": ["Gluteal muscles", "Hip flexors", "Adductors/piriformis region"],
  Knee: ["Quadriceps", "Hamstrings", "Popliteus/gastrocnemius proximal region"],
  "Ankle & Foot": ["Gastrocnemius–soleus", "Peroneal muscles", "Plantar fascia/intrinsic foot muscles"],
  "Upper Limb Neural": ["Neural interface soft tissue of shoulder/arm", "Forearm neural interfaces", "Scapular/cervical interfaces"],
  "Lower Limb Neural": ["Posterior thigh neural interfaces", "Calf neural interfaces", "Gluteal/lumbopelvic interfaces"]
};

const frictionTargets: Partial<Record<ManualRegion, string[]>> = {
  Shoulder: ["Rotator-cuff tendon region", "Long-head biceps tendon region", "Selected capsuloligamentous tissue after diagnosis"],
  Elbow: ["Common extensor tendon", "Common flexor tendon", "Distal biceps/triceps tendon region"],
  "Wrist & Hand": ["Selected wrist/hand tendon", "De Quervain-region tendons when appropriately assessed", "Collateral ligament after healed sprain"],
  "Hip & Pelvis": ["Gluteal tendon region", "Adductor tendon region", "Proximal hamstring tendon"],
  Knee: ["Patellar tendon", "Quadriceps tendon", "Selected healed collateral-ligament region"],
  "Ankle & Foot": ["Achilles tendon", "Peroneal tendon region", "Selected healed ankle-ligament region"]
};

const neuralSeeds: Partial<Record<ManualRegion, Seed[]>> = {
  "Upper Limb Neural": [
    { name: "Median Nerve Slider", target: "Median nerve pathway", goal: "Reduce mechanosensitivity while preserving movement", direction: "Alternate loading and unloading between neck/shoulder/elbow/wrist components", reassess: "Median-biased neurodynamic response and symptoms" },
    { name: "Radial Nerve Slider", target: "Radial nerve pathway", goal: "Improve tolerance to radial-biased upper-limb movement", direction: "Coordinated proximal/distal slider sequence", reassess: "Radial-biased neurodynamic response" },
    { name: "Ulnar Nerve Slider", target: "Ulnar nerve pathway", goal: "Improve tolerance to ulnar-biased movement", direction: "Coordinated shoulder/elbow/wrist slider sequence", reassess: "Ulnar-biased neurodynamic response" }
  ],
  "Lower Limb Neural": [
    { name: "Sciatic Nerve Slider", target: "Sciatic nerve pathway", goal: "Improve leg-movement tolerance without sustained neural load", direction: "Alternate hip/knee/ankle or spinal components to slide the neural bed", reassess: "SLR/slump response and leg symptoms" },
    { name: "Tibial Nerve Slider", target: "Tibial nerve pathway", goal: "Improve posterior-calf/plantar neural movement tolerance", direction: "Controlled knee/ankle slider sequence", reassess: "Tibial-biased symptoms and ankle/foot function" },
    { name: "Common Fibular Nerve Slider", target: "Common fibular nerve pathway", goal: "Improve lateral-leg neural movement tolerance", direction: "Controlled knee/ankle/foot slider sequence", reassess: "Peroneal-biased symptoms" },
    { name: "Femoral Nerve Slider", target: "Femoral nerve pathway", goal: "Improve anterior-thigh neural movement tolerance", direction: "Controlled hip/knee slider sequence", reassess: "Femoral-biased neurodynamic response" }
  ]
};

const tractionSeeds: Partial<Record<ManualRegion, Seed[]>> = {
  Cervical: [
    { name: "Manual Cervical Traction", target: "Cervical spine", goal: "Short-term symptom modulation in selected neck/arm presentations", direction: "Smooth longitudinal distraction along cervical axis", reassess: "Neck/arm symptoms and cervical ROM" }
  ],
  Lumbar: [
    { name: "Manual Lumbar Distraction", target: "Lumbar/lumbopelvic region", goal: "Selected short-term unloading or movement preparation", direction: "Controlled longitudinal or position-specific distraction", reassess: "Back/leg symptoms and movement" }
  ],
  Shoulder: [{ name: "Glenohumeral Distraction", target: "Shoulder joint", goal: "Reduce compression sensitivity and prepare ROM", direction: "Gentle joint-plane distraction", reassess: "Pain and elevation" }],
  "Hip & Pelvis": [{ name: "Hip Long-Axis Distraction", target: "Hip joint", goal: "Reduce compression sensitivity and prepare mobility", direction: "Long-axis distraction", reassess: "Hip ROM and gait" }],
  Knee: [{ name: "Tibiofemoral Distraction", target: "Knee joint", goal: "Pain modulation and joint-play preparation", direction: "Long-axis distraction", reassess: "Knee ROM and weight-bearing" }],
  "Ankle & Foot": [{ name: "Talocrural Distraction", target: "Ankle joint", goal: "Pain modulation and mobility preparation", direction: "Long-axis distraction", reassess: "Ankle ROM and lunge" }]
};

const pnfSeeds: Partial<Record<ManualRegion, Seed[]>> = {
  Shoulder: [
    { name: "Upper-Limb D1 Pattern", target: "Shoulder–elbow–wrist diagonal", goal: "Improve coordinated reach and functional upper-limb movement", direction: "Diagonal/spiral D1 flexion-extension pattern with graded resistance", reassess: "Functional reach/task" },
    { name: "Upper-Limb D2 Pattern", target: "Shoulder–elbow–wrist diagonal", goal: "Improve coordinated overhead/opening movement", direction: "Diagonal/spiral D2 flexion-extension pattern with graded resistance", reassess: "Reach and movement quality" },
    { name: "Rhythmic Stabilization", target: "Shoulder girdle", goal: "Improve co-contraction and control", direction: "Alternating multidirectional isometric resistance", reassess: "Stability during functional reach" }
  ],
  "Hip & Pelvis": [
    { name: "Lower-Limb D1 Pattern", target: "Hip–knee–ankle diagonal", goal: "Improve coordinated stepping and lower-limb control", direction: "Diagonal/spiral D1 pattern with graded resistance", reassess: "Step/gait task" },
    { name: "Lower-Limb D2 Pattern", target: "Hip–knee–ankle diagonal", goal: "Improve coordinated multidirectional lower-limb control", direction: "Diagonal/spiral D2 pattern with graded resistance", reassess: "Functional step/balance" },
    { name: "Pelvic Anterior Elevation / Posterior Depression", target: "Pelvic girdle", goal: "Facilitate gait-related pelvic control", direction: "Diagonal pelvic pattern with manual resistance", reassess: "Gait and trunk-pelvis control" }
  ]
};

const mldSeeds: Partial<Record<ManualRegion, Seed[]>> = {
  Shoulder: [
    { name: "Proximal Preparation", target: "Trunk/axillary drainage territories", goal: "Prepare proximal pathways before distal limb work", direction: "Very light rhythmic skin stretch following trained lymphatic sequence", reassess: "Heaviness, skin feel and limb measurement" },
    { name: "Upper-Limb Sequence", target: "Arm/forearm/hand", goal: "Support fluid movement within a complete decongestive plan", direction: "Proximal-to-distal preparation then distal-to-proximal working sequence as formally trained", reassess: "Limb volume/circumference and symptoms" }
  ],
  "Hip & Pelvis": [
    { name: "Lower-Trunk/Proximal Preparation", target: "Inguinal/lower-trunk territories", goal: "Prepare proximal drainage pathways", direction: "Very light rhythmic skin stretch", reassess: "Swelling/heaviness and skin response" }
  ],
  Knee: [
    { name: "Lower-Limb MLD Sequence", target: "Thigh/knee/lower leg", goal: "Support edema/lymphedema management within CDT", direction: "Trained proximal preparation followed by limb sequence", reassess: "Circumference/volume and function" }
  ],
  "Ankle & Foot": [
    { name: "Distal Lower-Limb Sequence", target: "Ankle/foot", goal: "Address distal swelling after proximal pathways are prepared", direction: "Very light skin stretch integrated into full lower-limb sequence", reassess: "Foot/ankle swelling and shoe tolerance" }
  ]
};

const hvlaSeeds: Partial<Record<ManualRegion, Seed[]>> = {
  Thoracic: [
    { name: "Thoracic HVLA Safety Framework", target: "Selected thoracic region", goal: "Guide clinical selection, consent and reassessment without teaching a thrust maneuver from text", direction: "Region-specific thrust direction is taught only in supervised practical training", reassess: "Thoracic ROM, pain and neurological status", safety: "Do not learn or perform HVLA from text-only instructions; formal hands-on training and screening are required." }
  ],
  Lumbar: [
    { name: "Lumbar HVLA Safety Framework", target: "Selected lumbar/lumbopelvic region", goal: "Guide safe selection and post-technique reassessment", direction: "Specific thrust mechanics require supervised practical instruction", reassess: "Lumbar movement, pain and neurological status", safety: "Formal practical training, consent and red-flag screening are required." }
  ],
  Cervical: [
    { name: "Cervical HVLA — Screening & Decision Framework", target: "Cervical region", goal: "Emphasize vascular/neurological/instability screening and safer alternatives", direction: "No thrust instruction is provided here", reassess: "Neurological status, symptoms and ROM", safety: "Cervical HVLA carries additional risk and should only be performed by appropriately trained clinicians after contemporary screening and informed consent." }
  ]
};

function defaultSetup(region: ManualRegion) {
  const map: Record<ManualRegion, string> = {
    "TMJ & Craniofacial": "Supported sitting or supine with head and jaw relaxed.",
    Cervical: "Supported sitting, supine or prone with the cervical spine relaxed.",
    Thoracic: "Prone, side-lying or supported sitting according to target.",
    "Ribs & Chest Wall": "Supported sitting or side-lying with breathing unrestricted.",
    Lumbar: "Prone, side-lying or supine with pelvis/trunk supported.",
    Shoulder: "Supine, side-lying or sitting with the arm supported.",
    Elbow: "Sitting or supine with the upper limb supported.",
    "Wrist & Hand": "Sitting with forearm and hand supported.",
    "Hip & Pelvis": "Supine, prone or side-lying with pelvis stabilized.",
    Knee: "Supine, prone or sitting with the knee comfortably supported.",
    "Ankle & Foot": "Supine, long sitting, prone or weight-bearing depending on the technique.",
    "Upper Limb Neural": "Supine with the shoulder girdle and arm supported.",
    "Lower Limb Neural": "Supine, side-lying or slump sitting with the limb supported."
  };
  return map[region];
}

function defaultContact(techniqueSlug: string, target: string) {
  if (techniqueSlug === "strain-counterstrain") return "Light monitoring contact over the tender point while the body region is positioned toward maximal comfort.";
  if (techniqueSlug === "myofascial-release") return "Broad skin/fascial contact over " + target + " with enough grip to engage tissue without sliding.";
  if (techniqueSlug === "soft-tissue-mobilization") return "Broad hand/thumb/forearm contact over " + target + ", avoiding nerves, vessels and painful bony prominences.";
  if (techniqueSlug === "trigger-point-compression") return "Small comfortable contact over the clinically relevant tender/trigger area within " + target + ".";
  if (techniqueSlug === "iastm") return "Appropriate instrument edge over intact skin at " + target + " with conservative pressure.";
  if (techniqueSlug === "active-release-style-soft-tissue") return "Tolerable contact over " + target + " while the tissue begins in a shortened position.";
  if (techniqueSlug === "myofascial-decompression-dry-cupping") return "Appropriately sized cup placed on intact soft tissue over " + target + " with low suction.";
  if (techniqueSlug === "scar-mobilization") return "Fingertip or broad contact on a fully healed scar in the " + target + " region.";
  if (techniqueSlug === "facilitated-positional-release") return "Support the region and position " + target + " toward ease before adding the trained facilitating force.";
  if (techniqueSlug === "muscle-energy-technique") return "Position " + target + " at a comfortable barrier and provide matched resistance to the prescribed contraction.";
  if (techniqueSlug === "cyriax-deep-transverse-friction") return "Precise transverse contact over the confirmed symptomatic structure: " + target + ".";
  if (techniqueSlug === "fascial-manipulation") return "Focused supported contact over the selected fascial area after movement-based assessment.";
  return "Region-specific contact over " + target + " using the parent technique principles.";
}

function softTissueSeeds(techniqueSlug: string, region: ManualRegion): Seed[] {
  const targets = techniqueSlug === "cyriax-deep-transverse-friction"
    ? (frictionTargets[region] ?? [])
    : (muscleTargets[region] ?? []);

  const labels: Record<string, string> = {
    "strain-counterstrain": "Positional Release",
    "myofascial-release": "Myofascial Release",
    "soft-tissue-mobilization": "Soft-Tissue Mobilization",
    "trigger-point-compression": "Trigger-Point Release",
    iastm: "IASTM",
    "active-release-style-soft-tissue": "Active Soft-Tissue Release",
    "myofascial-decompression-dry-cupping": "Dry Cupping / Decompression",
    "scar-mobilization": "Scar Mobilization",
    "facilitated-positional-release": "Facilitated Positional Release",
    "muscle-energy-technique": "Muscle Energy Technique",
    "cyriax-deep-transverse-friction": "Deep Transverse Friction",
    "fascial-manipulation": "Fascial Manipulation"
  };

  return targets.map((target) => {
    let direction = "Apply the parent technique in the tissue-specific direction while monitoring comfort and the comparable sign.";
    let goal = "Improve pain, movement tolerance or tissue-related function when this target is clinically relevant.";
    let dosage = "Use a conservative trial dose, reassess immediately and continue only if useful.";

    if (techniqueSlug === "strain-counterstrain") {
      direction = "Position the region toward maximal comfort/shortening until tenderness is substantially reduced; hold without force.";
      dosage = "Commonly about 90 seconds, individualized to comfort and response.";
    } else if (techniqueSlug === "myofascial-release") {
      direction = "Use slow sustained direct loading toward restriction or indirect loading toward ease.";
      dosage = "Sustained contact commonly 60–120 seconds or until a clear clinical change, then reassess.";
    } else if (techniqueSlug === "soft-tissue-mobilization") {
      direction = "Use longitudinal, transverse, kneading or sustained pressure matched to tissue orientation and tolerance.";
      dosage = "Short-to-moderate bouts with frequent symptom checks.";
    } else if (techniqueSlug === "trigger-point-compression") {
      direction = "Apply gradually increasing sustained pressure that remains tolerable.";
      dosage = "Often 20–60 seconds per clinically relevant point.";
    } else if (techniqueSlug === "iastm") {
      direction = "Use light-to-moderate scanning/treatment strokes; bruising is not the goal.";
      dosage = "Often 30–120 seconds per small area followed by active movement/loading.";
    } else if (techniqueSlug === "active-release-style-soft-tissue") {
      direction = "Maintain controlled contact while the patient actively lengthens/moves the target tissue.";
      dosage = "Often 3–8 slow repetitions followed by reassessment.";
    } else if (techniqueSlug === "myofascial-decompression-dry-cupping") {
      direction = "Use the lowest suction that creates a tolerable effect; static or movement-assisted application as appropriate.";
      dosage = "Conservative application approximately 3–10 minutes, shorter for first exposure or sensitive skin.";
    } else if (techniqueSlug === "scar-mobilization") {
      direction = "Move a fully healed scar longitudinally, transversely and in small circles; progress gradually with healing stage.";
      dosage = "Short bouts of about 1–3 minutes per area.";
    } else if (techniqueSlug === "facilitated-positional-release") {
      direction = "Move toward ease, add the trained low-force compression/distraction/torsion, then return slowly to neutral.";
      dosage = "Brief holds, often around 3–10 seconds, repeated only a small number of times.";
    } else if (techniqueSlug === "muscle-energy-technique") {
      direction = "Use a gentle isometric contraction against matched resistance, then relax and take up available range.";
      dosage = "Usually 3–5 cycles of 5–10 second contractions at low effort.";
    } else if (techniqueSlug === "cyriax-deep-transverse-friction") {
      direction = "Apply small transverse movement across the confirmed symptomatic tendon/ligament while minimizing skin sliding.";
      dosage = "Use short tolerable bouts; progressive loading remains primary for most chronic tendinopathies.";
    } else if (techniqueSlug === "fascial-manipulation") {
      direction = "Use focused friction/pressure according to the trained system and selected fascial point.";
      dosage = "Brief focused applications with immediate movement reassessment.";
    }

    return {
      name: target + " — " + labels[techniqueSlug],
      target,
      goal,
      direction,
      dosage,
      reassess: "Re-test the region's original pain, range or functional task."
    };
  });
}

function seedsForTechnique(techniqueSlug: string, region: ManualRegion): Seed[] {
  const joint = jointSeeds[techniqueSlug]?.[region];
  if (joint?.length) return joint;

  if (techniqueSlug === "mulligan-snags-nags") return spinalSnagSeeds[region] ?? [];
  if (techniqueSlug === "neurodynamic-mobilization") return neuralSeeds[region] ?? [];
  if (techniqueSlug === "manual-traction") return tractionSeeds[region] ?? [];
  if (techniqueSlug === "pnf-manual-techniques") return pnfSeeds[region] ?? [];
  if (techniqueSlug === "manual-lymphatic-drainage") return mldSeeds[region] ?? [];
  if (techniqueSlug === "high-velocity-low-amplitude-thrust") return hvlaSeeds[region] ?? [];

  if ([
    "strain-counterstrain",
    "myofascial-release",
    "soft-tissue-mobilization",
    "trigger-point-compression",
    "iastm",
    "active-release-style-soft-tissue",
    "myofascial-decompression-dry-cupping",
    "scar-mobilization",
    "facilitated-positional-release",
    "muscle-energy-technique",
    "cyriax-deep-transverse-friction",
    "fascial-manipulation"
  ].includes(techniqueSlug)) {
    // Do not invent muscle/tendon applications inside neural-only regions.
    // Neural regions are reserved for neurodynamic guidance unless a future
    // evidence-based interface-specific module is written explicitly.
    if (region === "Upper Limb Neural" || region === "Lower Limb Neural") {
      return [];
    }
    return softTissueSeeds(techniqueSlug, region);
  }

  if (techniqueSlug === "paivm-ppivm-spinal-assessment" && ["Cervical","Thoracic","Lumbar"].includes(region)) {
    return [
      { name: "Central PAIVM", target: region + " segment", goal: "Assess/treat accessory posterior-anterior movement as one part of the clinical examination", direction: "Graded central PA pressure", reassess: "Original comparable sign and active movement" },
      { name: "Unilateral PAIVM", target: region + " facet/posterior element", goal: "Assess side-specific accessory response", direction: "Graded unilateral PA pressure", reassess: "Rotation/side-bending and symptoms" },
      { name: "PPIVM", target: region + " physiological movement", goal: "Assess relative segmental contribution during passive physiological motion", direction: "Guide flexion/extension/rotation or side-bending while palpating relative movement", reassess: "Active movement and function" }
    ];
  }

  return [];
}

export function getRegionalSubTechniques(
  techniqueSlug: string,
  region: ManualRegion
): RegionalSubTechnique[] {
  const curated = getPriorityRegionalSubTechniques(techniqueSlug, region);
  if (curated) return curated;

  return seedsForTechnique(techniqueSlug, region).map((seed) => ({
    name: seed.name,
    target: seed.target,
    clinicalGoal: seed.goal,
    patientSetup: seed.setup ?? defaultSetup(region),
    contact: seed.contact ?? defaultContact(techniqueSlug, seed.target),
    direction: seed.direction,
    dosage: seed.dosage ?? "Use a conservative response-guided trial and reassess before repeating.",
    reassess: seed.reassess ?? "Re-test the original comparable sign.",
    clinicalPearl: seed.pearl,
    safetyNote: seed.safety
  }));
}
