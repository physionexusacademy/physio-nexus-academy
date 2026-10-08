import { manualTherapyTechniques } from "@/lib/all-manual-therapy";

export type ManualRegion =
  | "Cervical"
  | "Thoracic"
  | "Lumbar"
  | "Shoulder"
  | "Elbow"
  | "Wrist & Hand"
  | "Hip & Pelvis"
  | "Knee"
  | "Ankle & Foot"
  | "Upper Limb Neural"
  | "Lower Limb Neural"
  | "TMJ & Craniofacial"
  | "Ribs & Chest Wall";

export type RegionalManualApplication = {
  slug: string;
  techniqueSlug: string;
  techniqueName: string;
  region: ManualRegion;
  title: string;
  clinicalUse: string[];
  patientPosition: string[];
  therapistPosition: string[];
  stabilization: string[];
  contact: string[];
  forceDirection: string[];
  dosage: string[];
  steps: string[];
  reassess: string[];
  mistakes: string[];
  safety: string[];
  visualCue: string;
  applicability?: "Detailed" | "Selected" | "Not routine";
};

export const regionalManualApplications: RegionalManualApplication[] = [
  {
    slug: "maitland-cervical-pa-mobilization",
    techniqueSlug: "maitland-joint-mobilization",
    techniqueName: "Maitland Joint Mobilization",
    region: "Cervical",
    title: "Cervical Central / Unilateral PA Mobilization",
    clinicalUse: [
      "Mechanical neck pain with segmental stiffness.",
      "Painful or restricted cervical extension/rotation when neurological and vascular screening is clear.",
      "Use as an adjunct when a comparable sign improves after a low-force trial."
    ],
    patientPosition: [
      "Prone with forehead supported and cervical spine close to neutral.",
      "Shoulders relaxed and arms comfortable beside the body.",
      "If prone is poorly tolerated, use an alternative supported position rather than forcing the posture."
    ],
    therapistPosition: [
      "Stand at the head or side of the table, close to the target segment.",
      "Keep elbows soft and use body weight through relaxed shoulders."
    ],
    stabilization: [
      "The table and patient position provide most of the stabilization.",
      "Avoid excessive global neck movement; the contact should create a local accessory motion."
    ],
    contact: [
      "Central PA: hypothenar/thumb contact over the spinous process of the selected vertebra.",
      "Unilateral PA: contact over the articular pillar on the side being assessed/treated.",
      "Use a broad comfortable contact and avoid painful fingertip pressure."
    ],
    forceDirection: [
      "Force travels anteriorly through the selected segment for a PA mobilization.",
      "Grade I–II for pain-dominant presentations; Grade III–IV when stiffness dominates and irritability is lower.",
      "Oscillation should be smooth, rhythmic and in the same line throughout the set."
    ],
    dosage: [
      "Common starting dose: 30–60 seconds of oscillation × 2–4 bouts.",
      "Reassess after each bout rather than completing a fixed number regardless of response."
    ],
    steps: [
      "1. Record the comparable sign such as painful rotation or extension.",
      "2. Screen for neurological deficit, instability, fracture risk and cervical vascular concerns.",
      "3. Identify the segment that appears relevant to the comparable sign.",
      "4. Apply a low-grade PA first and ask the patient to report pain quality and location.",
      "5. Continue only if symptoms remain local and acceptable.",
      "6. Re-test the comparable movement immediately.",
      "7. If movement improves, repeat or progress carefully and then add active cervical control/strength."
    ],
    reassess: ["Cervical rotation/extension", "Pain location/intensity", "Functional task such as looking over shoulder"],
    mistakes: [
      "Pushing the whole neck instead of the selected segment.",
      "Using high grades before judging irritability.",
      "Continuing despite dizziness, unusual headache or distal neurological symptoms."
    ],
    safety: [
      "Do not perform when instability, fracture, acute inflammatory instability, severe neurological compromise or vascular pathology is suspected.",
      "Cervical manual therapy requires appropriate contemporary vascular/neurological screening."
    ],
    visualCue: "Contact: spinous process/articular pillar → Force: PA (posterior-to-anterior) → Re-test cervical movement."
  },
  {
    slug: "maitland-thoracic-pa-mobilization",
    techniqueSlug: "maitland-joint-mobilization",
    techniqueName: "Maitland Joint Mobilization",
    region: "Thoracic",
    title: "Thoracic Central PA Mobilization",
    clinicalUse: ["Thoracic stiffness", "Extension/rotation restriction", "Adjunct in selected neck/shoulder presentations when thoracic mobility is relevant"],
    patientPosition: ["Prone with head supported and arms relaxed.", "A pillow under the chest may be used if extension is uncomfortable."],
    therapistPosition: ["Stand beside the target level.", "Stack shoulders over hands to use body weight rather than arm strength."],
    stabilization: ["The rib cage and table provide support.", "Avoid allowing the trunk to roll during unilateral work."],
    contact: ["Place hypothenar eminence or supported thumbs over the target spinous process for central PA.", "For unilateral PA, contact the transverse process/articular region as trained."],
    forceDirection: ["Posterior-to-anterior, approximately perpendicular to the local thoracic contour.", "Use low grade for pain, higher grade for stiffness when safe."],
    dosage: ["30–60 seconds × 2–4 bouts, response-guided."],
    steps: ["1. Record thoracic extension/rotation or the functional task.", "2. Select the target level.", "3. Apply gentle PA oscillation.", "4. Progress only if comfortable.", "5. Re-test movement.", "6. Follow with active thoracic extension/rotation or loaded upper-quarter work."],
    reassess: ["Thoracic rotation/extension", "Neck/shoulder comparable sign if that was the reason for treatment"],
    mistakes: ["Excessive force over painful ribs.", "Mobilizing without checking osteoporosis/fracture risk.", "Using thoracic mobilization when the thoracic spine is not clinically relevant."],
    safety: ["Use caution with osteoporosis, rib fracture history, inflammatory disease and recent trauma."],
    visualCue: "Contact over thoracic segment → PA oscillation → Re-test thoracic or linked neck/shoulder movement."
  },
  {
    slug: "maitland-lumbar-pa-mobilization",
    techniqueSlug: "maitland-joint-mobilization",
    techniqueName: "Maitland Joint Mobilization",
    region: "Lumbar",
    title: "Lumbar Central / Unilateral PA Mobilization",
    clinicalUse: ["Selected non-specific low-back pain with a positive comparable sign", "Lumbar stiffness", "Pain modulation to enable movement"],
    patientPosition: ["Prone with pillow under abdomen if needed for comfort.", "Arms relaxed and breathing unrestricted."],
    therapistPosition: ["Stand beside the patient at the target level.", "Keep wrists neutral and use controlled body weight."],
    stabilization: ["Pelvis remains supported by the table.", "Avoid creating excessive global lumbar extension."],
    contact: ["Central PA over spinous process using hypothenar/thumb contact.", "Unilateral PA over the relevant posterior element with a broad contact."],
    forceDirection: ["Posterior-to-anterior through the chosen segment.", "Grade and amplitude are selected from irritability and stiffness."],
    dosage: ["30–60 seconds × 2–4 bouts with immediate reassessment."],
    steps: ["1. Record painful/restricted lumbar movement.", "2. Screen serious pathology and neurological red flags.", "3. Apply low-grade PA.", "4. Progress if symptoms remain acceptable.", "5. Re-test flexion/extension/rotation or functional task.", "6. Follow with active movement or loading."],
    reassess: ["Painful lumbar movement", "Sit-to-stand, bending or walking", "Leg symptom distribution if present"],
    mistakes: ["Using PA mobilization despite progressive neurological signs.", "Treating imaging findings rather than the patient's comparable sign.", "No active follow-up."],
    safety: ["Do not use routine manual treatment when cauda equina, fracture, infection or malignancy is suspected."],
    visualCue: "Lumbar spinous contact → PA force → Re-test lumbar movement/function."
  },
  {
    slug: "maitland-shoulder-posterior-glide",
    techniqueSlug: "maitland-joint-mobilization",
    techniqueName: "Maitland Joint Mobilization",
    region: "Shoulder",
    title: "Glenohumeral Posterior Glide",
    clinicalUse: ["Painful shoulder stiffness", "Limited flexion/internal rotation when posterior glide is relevant", "Adhesive capsulitis according to irritability"],
    patientPosition: ["Supine with scapula supported.", "Arm positioned comfortably near resting position initially."],
    therapistPosition: ["Stand beside the shoulder.", "Support the arm and stay close to the joint line."],
    stabilization: ["Stabilize the scapula/acromial region so the humeral head glide is isolated."],
    contact: ["One hand supports the proximal humerus; the mobilizing hand contacts the anterior humeral head/proximal humerus broadly."],
    forceDirection: ["Posterior glide of the humeral head relative to the glenoid.", "Low grade in pain-dominant stage; higher grade when stiffness dominates and irritability is low."],
    dosage: ["30–60 seconds × 2–4 bouts, reassessing flexion/internal rotation."],
    steps: ["1. Record shoulder ROM and painful arc.", "2. Stabilize scapula.", "3. Apply a gentle posterior glide.", "4. Progress only if pain remains acceptable.", "5. Re-test the movement.", "6. Add active reaching and rotator-cuff/scapular exercise."],
    reassess: ["Flexion", "Internal rotation", "Functional reach"],
    mistakes: ["Letting scapula move instead of humeral head.", "Using aggressive Grade IV in highly irritable adhesive capsulitis.", "Pushing directly into anterior shoulder pain."],
    safety: ["Avoid in acute dislocation, fracture, unstable postoperative restrictions or severe acute inflammatory states."],
    visualCue: "Scapula fixed → Humeral head glides posteriorly → Re-test flexion/IR."
  },
  {
    slug: "maitland-knee-tibiofemoral-glide",
    techniqueSlug: "maitland-joint-mobilization",
    techniqueName: "Maitland Joint Mobilization",
    region: "Knee",
    title: "Tibiofemoral AP / PA Mobilization",
    clinicalUse: ["Painful knee stiffness", "Loss of flexion/extension", "OA-related hypomobility when clinically relevant"],
    patientPosition: ["Supine with knee supported in a comfortable flexed or near-extended position depending on target motion."],
    therapistPosition: ["Stand beside the knee with hands close to the joint line."],
    stabilization: ["Stabilize femur while mobilizing tibia or stabilize tibia while mobilizing femur according to chosen glide."],
    contact: ["Broad contact over proximal tibia, avoiding fibular head/peroneal nerve compression."],
    forceDirection: ["AP or PA glide selected from target movement and response.", "Use small amplitude for pain, larger amplitude into resistance for stiffness."],
    dosage: ["30–60 seconds × 2–4 bouts."],
    steps: ["1. Measure flexion/extension and functional task.", "2. Choose glide direction.", "3. Stabilize proximal segment.", "4. Apply rhythmic glide.", "5. Re-test ROM and squat/sit-to-stand.", "6. Follow with quadriceps/functional strengthening."],
    reassess: ["Knee flexion/extension", "Sit-to-stand", "Squat/step pain"],
    mistakes: ["Compressing fibular head/peroneal nerve.", "Mobilizing without checking postoperative precautions.", "Not linking mobility gain to exercise."],
    safety: ["Avoid with fracture, acute ligamentous instability, infection, DVT or immediately post-op without clearance."],
    visualCue: "Femur stable ↔ Tibia glides AP/PA → Re-test knee ROM/function."
  },
  {
    slug: "maitland-ankle-posterior-talar-glide",
    techniqueSlug: "maitland-joint-mobilization",
    techniqueName: "Maitland Joint Mobilization",
    region: "Ankle & Foot",
    title: "Talocrural Posterior Talar Glide",
    clinicalUse: ["Limited dorsiflexion after healed ankle sprain", "Stiffness affecting squat/lunge/gait"],
    patientPosition: ["Supine or long sitting with ankle near neutral and heel supported."],
    therapistPosition: ["Stand at foot end or beside ankle."],
    stabilization: ["Stabilize distal tibia/fibula.", "Keep heel/talus controlled."],
    contact: ["Broad contact over anterior talus/neck of talus without compressing dorsalis pedis region excessively."],
    forceDirection: ["Posterior glide of talus relative to tibia/fibula.", "Rhythmic Maitland oscillation or sustained glide depending on chosen approach."],
    dosage: ["30–60 seconds × 2–4 bouts."],
    steps: ["1. Measure weight-bearing lunge.", "2. Stabilize tibia.", "3. Apply gentle posterior talar glide.", "4. Progress if comfortable.", "5. Re-test lunge.", "6. Add calf raise, squat and balance work."],
    reassess: ["Weight-bearing lunge", "Squat depth", "Walking/step mechanics"],
    mistakes: ["Pulling foot without true talar glide.", "Treating acute unstable sprain aggressively.", "Ignoring syndesmotic injury signs."],
    safety: ["Avoid with fracture, acute syndesmotic instability or severe swelling requiring further assessment."],
    visualCue: "Tibia fixed → Talus glides posteriorly → Dorsiflexion/lunge re-test."
  },

  {
    slug: "kaltenborn-shoulder-traction",
    techniqueSlug: "kaltenborn-evjenth-mobilization",
    techniqueName: "Kaltenborn–Evjenth Mobilization",
    region: "Shoulder",
    title: "Glenohumeral Traction",
    clinicalUse: ["Compression-sensitive shoulder pain", "Capsular stiffness", "Pain modulation before active movement"],
    patientPosition: ["Supine with shoulder in resting position, often slight abduction/flexion as comfortable."],
    therapistPosition: ["Stand beside shoulder with arm supported."],
    stabilization: ["Stabilize scapula/thorax."],
    contact: ["Grasp proximal humerus close to joint line using both hands or belt-assisted technique."],
    forceDirection: ["Traction perpendicular to glenoid treatment plane.", "Grade I neutralizes compression, Grade II takes up slack, Grade III stretches capsule."],
    dosage: ["Sustained holds commonly 10–30 seconds repeated 3–5 times, adjusted to response."],
    steps: ["1. Measure pain/ROM.", "2. Position in resting position.", "3. Apply Grade I–II first.", "4. Progress to Grade III only in stiffness-dominant presentation.", "5. Reassess.", "6. Follow with active movement."],
    reassess: ["Pain", "Flexion/abduction", "Functional reach"],
    mistakes: ["Using wrong treatment plane.", "Pulling distal arm instead of creating joint distraction.", "Using Grade III in high irritability."],
    safety: ["Avoid acute dislocation, fracture, unstable repair."],
    visualCue: "Scapula fixed → Humeral head distracted from glenoid → Re-test ROM."
  },
  {
    slug: "kaltenborn-hip-traction",
    techniqueSlug: "kaltenborn-evjenth-mobilization",
    techniqueName: "Kaltenborn–Evjenth Mobilization",
    region: "Hip & Pelvis",
    title: "Hip Long-Axis / Lateral Traction",
    clinicalUse: ["Hip OA pain/stiffness", "Compression-sensitive hip pain", "Restricted hip mobility"],
    patientPosition: ["Supine, hip in comfortable resting position.", "For lateral traction, hip may be slightly flexed/abducted according to technique."],
    therapistPosition: ["At foot end for long-axis traction or beside hip for belt-assisted lateral traction."],
    stabilization: ["Pelvis stabilized manually or with belt."],
    contact: ["Long-axis: secure distal leg above ankle without compressing sensitive structures.", "Lateral: belt/contact around proximal femur as trained."],
    forceDirection: ["Long-axis traction follows femoral shaft.", "Lateral traction pulls femoral head laterally from acetabulum."],
    dosage: ["10–30 second holds × 3–5 repetitions or sustained longer bouts if tolerated."],
    steps: ["1. Measure hip pain/ROM.", "2. Stabilize pelvis.", "3. Apply low-grade traction.", "4. Progress if symptoms improve.", "5. Re-test gait, flexion/rotation.", "6. Add hip strengthening/walking."],
    reassess: ["Hip flexion/rotation", "Walking", "Sit-to-stand"],
    mistakes: ["Pelvis moving with traction.", "Excessive force in osteoporosis.", "Using traction without functional follow-up."],
    safety: ["Avoid fracture, dislocation, severe osteoporosis or acute postoperative restrictions."],
    visualCue: "Pelvis fixed → Femur distracted along shaft/laterally → Re-test hip motion."
  },
  {
    slug: "kaltenborn-knee-traction",
    techniqueSlug: "kaltenborn-evjenth-mobilization",
    techniqueName: "Kaltenborn–Evjenth Mobilization",
    region: "Knee",
    title: "Tibiofemoral Traction",
    clinicalUse: ["Painful OA", "Capsular knee stiffness", "Compression-sensitive knee pain"],
    patientPosition: ["Sitting with knee flexed or supine depending on technique."],
    therapistPosition: ["Stand/sit in line with tibia."],
    stabilization: ["Femur stabilized against table."],
    contact: ["Grasp proximal/distal tibia securely without compressing fibular nerve."],
    forceDirection: ["Long-axis tibial distraction from femur."],
    dosage: ["10–30 second holds × 3–5 reps."],
    steps: ["1. Measure pain/ROM.", "2. Stabilize femur.", "3. Apply Grade I–II traction.", "4. Use Grade III only for stiffness when appropriate.", "5. Re-test.", "6. Follow with quadriceps/functional exercise."],
    reassess: ["Knee ROM", "Walking", "Sit-to-stand"],
    mistakes: ["Pulling from ankle without controlling knee.", "Compressing fibular head.", "Ignoring swelling/inflammation."],
    safety: ["Avoid DVT, unstable ligament injury, fracture."],
    visualCue: "Femur fixed → Tibia distracted longitudinally → Re-test knee pain/ROM."
  },
  {
    slug: "kaltenborn-ankle-traction",
    techniqueSlug: "kaltenborn-evjenth-mobilization",
    techniqueName: "Kaltenborn–Evjenth Mobilization",
    region: "Ankle & Foot",
    title: "Talocrural Traction",
    clinicalUse: ["Ankle pain with compression", "Post-immobilization stiffness after healing", "Adjunct before dorsiflexion work"],
    patientPosition: ["Supine or long sitting with ankle near resting position."],
    therapistPosition: ["At foot end."],
    stabilization: ["Stabilize distal tibia/fibula."],
    contact: ["Cup calcaneus/talus region with broad hands."],
    forceDirection: ["Distraction in line with talocrural treatment plane/foot axis as taught."],
    dosage: ["10–30 second holds × 3–5 repetitions."],
    steps: ["1. Measure dorsiflexion/pain.", "2. Stabilize leg.", "3. Apply low-grade traction.", "4. Progress if comfortable.", "5. Re-test lunge.", "6. Add loaded mobility/strength."],
    reassess: ["Weight-bearing dorsiflexion", "Walking", "Squat"],
    mistakes: ["Pulling toes instead of talus/calcaneus.", "Using strong traction in acute sprain.", "No stabilization."],
    safety: ["Avoid fracture or unstable acute injury."],
    visualCue: "Leg fixed → Talocrural joint distracted → Re-test dorsiflexion."
  },

  {
    slug: "mulligan-cervical-rotation-snag",
    techniqueSlug: "mulligan-snags-nags",
    techniqueName: "Mulligan NAGs, SNAGs & Self-SNAGs",
    region: "Cervical",
    title: "Cervical Rotation SNAG",
    clinicalUse: ["Painful/restricted cervical rotation with a clear immediate response", "Selected cervicogenic headache presentations after appropriate screening"],
    patientPosition: ["Sitting upright with feet supported.", "Neck begins in comfortable neutral."],
    therapistPosition: ["Stand slightly behind and to the side."],
    stabilization: ["Stabilize adjacent segment as needed.", "Keep trunk from rotating."],
    contact: ["Thumb/finger contact over the selected articular pillar; reinforce with opposite hand if trained."],
    forceDirection: ["Sustained glide in the plane of the facet while patient actively rotates.", "Movement must remain pain-free or clearly improved."],
    dosage: ["6–10 repetitions × 1–3 sets if response is positive."],
    steps: ["1. Record rotation.", "2. Screen vascular/neurological concerns.", "3. Apply glide.", "4. Patient rotates actively.", "5. Adjust level/angle if needed.", "6. Repeat only if pain-free.", "7. Retest without glide.", "8. Teach self-SNAG if appropriate."],
    reassess: ["Rotation ROM", "Pain", "Functional turning"],
    mistakes: ["Pushing straight anteriorly instead of facet plane.", "Accepting pain during SNAG.", "No retest without glide."],
    safety: ["Stop with dizziness, unusual headache, visual symptoms, neurological change."],
    visualCue: "Facet glide sustained + patient rotates → Pain-free gain should persist on retest."
  },
  {
    slug: "mulligan-shoulder-mwm",
    techniqueSlug: "mulligan-mobilization-with-movement",
    techniqueName: "Mulligan Mobilization With Movement",
    region: "Shoulder",
    title: "Shoulder Elevation MWM",
    clinicalUse: ["Painful shoulder elevation with an immediate correctable sign"],
    patientPosition: ["Sitting or standing if safe, so active elevation can be reproduced."],
    therapistPosition: ["Beside affected shoulder."],
    stabilization: ["Stabilize scapula/thorax as needed."],
    contact: ["Broad contact or belt around proximal humerus depending on direction."],
    forceDirection: ["Commonly posterolateral or lateral corrective glide while patient elevates; exact direction is found clinically."],
    dosage: ["6–10 reps × 2–3 sets when pain-free and beneficial."],
    steps: ["1. Record painful elevation.", "2. Apply trial glide.", "3. Patient elevates.", "4. Fine-tune angle until pain-free/improved.", "5. Repeat.", "6. Retest without glide.", "7. Follow with cuff/scapular loading."],
    reassess: ["Painful arc", "Elevation ROM", "Reach"],
    mistakes: ["Using force instead of finding correct direction.", "Allowing painful movement.", "Not stabilizing scapula when needed."],
    safety: ["Avoid acute dislocation/fracture/unstable repair."],
    visualCue: "Corrective humeral glide + active elevation → Retest elevation without glide."
  },
  {
    slug: "mulligan-elbow-mwm",
    techniqueSlug: "mulligan-mobilization-with-movement",
    techniqueName: "Mulligan Mobilization With Movement",
    region: "Elbow",
    title: "Lateral Elbow MWM",
    clinicalUse: ["Lateral elbow pain with painful grip and immediate improvement during glide"],
    patientPosition: ["Sitting or supine with elbow positioned comfortably."],
    therapistPosition: ["Beside arm."],
    stabilization: ["Stabilize distal humerus as needed."],
    contact: ["Contact proximal forearm near elbow joint line using hands or belt."],
    forceDirection: ["Sustained lateral glide of forearm relative to humerus while patient performs pain-free grip or wrist movement."],
    dosage: ["6–10 repetitions or repeated pain-free grips × 2–3 sets."],
    steps: ["1. Measure pain-free grip.", "2. Apply lateral glide.", "3. Patient grips.", "4. Adjust angle until grip improves.", "5. Repeat.", "6. Retest grip without glide.", "7. Follow with wrist extensor loading."],
    reassess: ["Pain-free grip strength", "Pain with wrist extension"],
    mistakes: ["No objective grip retest.", "Painful MWM.", "Using MWM instead of tendon loading."],
    safety: ["Avoid acute fracture/instability."],
    visualCue: "Forearm lateral glide + grip → Immediate grip improvement = useful response."
  },
  {
    slug: "mulligan-knee-mwm",
    techniqueSlug: "mulligan-mobilization-with-movement",
    techniqueName: "Mulligan Mobilization With Movement",
    region: "Knee",
    title: "Knee MWM During Squat / Step",
    clinicalUse: ["Painful squat/step in OA or mechanical knee pain when a corrective glide reduces symptoms"],
    patientPosition: ["Standing with support available."],
    therapistPosition: ["Beside knee using belt/manual contact."],
    stabilization: ["Control femur/pelvis and ensure balance."],
    contact: ["Belt/contact around proximal tibia or knee according to chosen glide."],
    forceDirection: ["Sustained medial/lateral or AP corrective glide while patient squats/steps; direction determined by pain-free response."],
    dosage: ["6–10 reps × 2–3 sets."],
    steps: ["1. Record painful squat/step.", "2. Apply trial glide.", "3. Patient performs task.", "4. Fine-tune direction.", "5. Repeat pain-free reps.", "6. Retest without glide.", "7. Continue strengthening."],
    reassess: ["Squat pain", "Step pain", "Knee ROM"],
    mistakes: ["Using the same glide direction for everyone.", "Ignoring balance.", "Not progressing to strength."],
    safety: ["Avoid unstable acute ligament injury/fracture."],
    visualCue: "Corrective knee glide + active squat/step → Retest without glide."
  },
  {
    slug: "mulligan-ankle-mwm",
    techniqueSlug: "mulligan-mobilization-with-movement",
    techniqueName: "Mulligan Mobilization With Movement",
    region: "Ankle & Foot",
    title: "Weight-Bearing Ankle Dorsiflexion MWM",
    clinicalUse: ["Limited weight-bearing dorsiflexion after healed ankle injury"],
    patientPosition: ["Standing lunge position with foot flat and support available."],
    therapistPosition: ["In front/side of ankle using belt/manual contact."],
    stabilization: ["Foot remains flat; tibia moves forward in line with second toe."],
    contact: ["Belt/manual contact provides posterior talar glide while tibia advances."],
    forceDirection: ["Sustained posterior talar glide during active dorsiflexion lunge."],
    dosage: ["6–10 reps × 2–3 sets."],
    steps: ["1. Measure lunge distance.", "2. Apply posterior talar glide.", "3. Patient lunges forward.", "4. Keep heel down.", "5. Repeat pain-free.", "6. Retest lunge.", "7. Add squat/calf/balance work."],
    reassess: ["Weight-bearing lunge", "Squat", "Step-down"],
    mistakes: ["Heel lifting.", "Knee collapsing medially without control.", "Glide lost during movement."],
    safety: ["Avoid acute unstable sprain/fracture."],
    visualCue: "Posterior talar glide + forward tibial lunge → Heel stays down."
  },

  {
    slug: "met-cervical-rotation",
    techniqueSlug: "muscle-energy-technique",
    techniqueName: "Muscle Energy Technique (MET)",
    region: "Cervical",
    title: "Cervical Rotation MET",
    clinicalUse: ["Pain-limited or muscle-guarded cervical rotation after red-flag screening"],
    patientPosition: ["Supine with head supported."],
    therapistPosition: ["At head of table."],
    stabilization: ["Support head and control trunk so movement is cervical, not whole-body."],
    contact: ["Hands cradle occiput/side of head without compressing jaw or neck vessels."],
    forceDirection: ["Move to comfortable rotation barrier; patient gently attempts rotation opposite therapist resistance for isometric contraction."],
    dosage: ["10–20% effort, 5–7 seconds × 3–5 cycles."],
    steps: ["1. Measure rotation.", "2. Move to first comfortable barrier.", "3. Ask gentle isometric effort.", "4. Relax.", "5. Take up new range.", "6. Repeat.", "7. Retest active rotation."],
    reassess: ["Active rotation", "Pain", "Functional turning"],
    mistakes: ["Too much force.", "Holding breath.", "Pushing into pain after relaxation."],
    safety: ["Avoid in instability, acute trauma, vascular/neurological concern."],
    visualCue: "Move to barrier → Gentle isometric hold → Relax → Take up new range."
  },
  {
    slug: "met-lumbar-pelvic-rotation",
    techniqueSlug: "muscle-energy-technique",
    techniqueName: "Muscle Energy Technique (MET)",
    region: "Lumbar",
    title: "Lumbar / Pelvic Rotation MET",
    clinicalUse: ["Selected non-specific low-back stiffness with muscular guarding"],
    patientPosition: ["Side-lying or hook-lying according to chosen setup."],
    therapistPosition: ["Beside patient with trunk/pelvis controlled."],
    stabilization: ["Stabilize pelvis or thorax so contraction is directed to target movement."],
    contact: ["Broad hand contacts over shoulder/pelvis or limb lever depending on technique."],
    forceDirection: ["Patient gently contracts into the restricted direction or against the corrective direction while therapist matches force."],
    dosage: ["10–30% effort, 5–10 seconds × 3–5 cycles."],
    steps: ["1. Record lumbar rotation/flexion-related movement.", "2. Position at comfortable barrier.", "3. Apply gentle isometric contraction.", "4. Relax.", "5. Take up slack.", "6. Retest.", "7. Add active trunk/hip movement."],
    reassess: ["Lumbar rotation", "Bending", "Sit-to-stand"],
    mistakes: ["Large-force contraction.", "Using MET in acute radicular flare without checking symptom behavior.", "No active follow-up."],
    safety: ["Avoid if contraction/movement is medically contraindicated."],
    visualCue: "Barrier → Gentle isometric → Relax → New range → Active movement."
  },
  {
    slug: "met-hamstring",
    techniqueSlug: "muscle-energy-technique",
    techniqueName: "Muscle Energy Technique (MET)",
    region: "Hip & Pelvis",
    title: "Hamstring MET",
    clinicalUse: ["Hamstring flexibility limitation without acute tear"],
    patientPosition: ["Supine with opposite leg supported."],
    therapistPosition: ["Beside target leg."],
    stabilization: ["Pelvis stabilized to avoid posterior tilt substituting for hip flexion."],
    contact: ["Support heel/calf and distal thigh as needed."],
    forceDirection: ["Move into comfortable straight-leg-raise barrier; patient gently pushes leg downward/into extension against resistance."],
    dosage: ["10–20% effort, 5–10 seconds × 3–5 cycles."],
    steps: ["1. Measure SLR.", "2. Move to comfortable barrier.", "3. Gentle isometric push.", "4. Relax.", "5. Increase range slightly.", "6. Repeat.", "7. Retest active/functional flexibility."],
    reassess: ["SLR", "Hip flexion", "Functional reach"],
    mistakes: ["High-force contraction.", "Treating acute hamstring strain with aggressive MET.", "Allowing pelvic substitution."],
    safety: ["Avoid in acute muscle tear/hematoma."],
    visualCue: "SLR barrier → Gentle downward isometric → Relax → Slightly more range."
  },

  {
    slug: "mfr-cervical-upper-trapezius",
    techniqueSlug: "myofascial-release",
    techniqueName: "Myofascial Release (Direct & Indirect)",
    region: "Cervical",
    title: "Cervical / Upper Trapezius MFR",
    clinicalUse: ["Myofascial neck pain", "Protective muscle guarding", "Adjunct before active cervical movement"],
    patientPosition: ["Supine or supported sitting."],
    therapistPosition: ["At head/side of table."],
    stabilization: ["Support head/shoulder so patient can relax."],
    contact: ["Broad hand/finger contact over upper trapezius/cervical fascia, avoiding anterior neck."],
    forceDirection: ["Slow longitudinal, cross-hand or indirect ease direction depending on irritability."],
    dosage: ["30–90 second holds × 2–4 applications."],
    steps: ["1. Record neck movement.", "2. Establish broad contact.", "3. Take up slack slowly.", "4. Hold without forcing.", "5. Release gradually.", "6. Retest.", "7. Add active cervical/scapular exercise."],
    reassess: ["Neck ROM", "Pain", "Scapular movement"],
    mistakes: ["Deep pressure over carotid/anterior neck.", "Aggressive pain-provoking pressure.", "No active follow-up."],
    safety: ["Avoid acute vascular/neurological concern, infection or unstable injury."],
    visualCue: "Broad fascial contact → Slow sustained load → Re-test neck movement."
  },
  {
    slug: "mfr-pectoral-shoulder",
    techniqueSlug: "myofascial-release",
    techniqueName: "Myofascial Release (Direct & Indirect)",
    region: "Shoulder",
    title: "Pectoral / Anterior Shoulder MFR",
    clinicalUse: ["Anterior chest/pectoral tightness limiting comfortable shoulder elevation", "Postural/overhead movement restriction as an adjunct"],
    patientPosition: ["Supine with arm supported in comfortable abduction."],
    therapistPosition: ["Beside shoulder/chest, respecting draping/privacy."],
    stabilization: ["Scapula/thorax supported."],
    contact: ["Broad contact over pectoral tissue lateral to sternum and near anterior shoulder, avoiding breast tissue and neurovascular bundle."],
    forceDirection: ["Slow cross-hand or longitudinal fascial load away from restriction, within comfort."],
    dosage: ["30–90 second holds × 2–4."],
    steps: ["1. Record elevation/ER.", "2. Position arm comfortably.", "3. Establish broad contact.", "4. Sustain slow load.", "5. Release.", "6. Retest shoulder movement.", "7. Add active scapular/cuff exercise."],
    reassess: ["Shoulder elevation", "External rotation", "Functional reach"],
    mistakes: ["Poor draping/privacy.", "Excessive pressure near brachial plexus/axilla.", "Assuming 'tightness' is the only cause of shoulder pain."],
    safety: ["Respect post-mastectomy/oncology precautions, wound healing and lymphedema risk."],
    visualCue: "Broad pectoral contact → Slow fascial load → Re-test elevation/ER."
  },
  {
    slug: "mfr-lumbar-thoracolumbar",
    techniqueSlug: "myofascial-release",
    techniqueName: "Myofascial Release (Direct & Indirect)",
    region: "Lumbar",
    title: "Thoracolumbar Fascial MFR",
    clinicalUse: ["Perceived lumbar stiffness/myofascial pain as an adjunct"],
    patientPosition: ["Prone with abdomen supported if needed."],
    therapistPosition: ["Beside trunk."],
    stabilization: ["Pelvis supported by table."],
    contact: ["Cross-hand or broad palm contact over thoracolumbar fascia, avoiding direct painful pressure on spinous processes."],
    forceDirection: ["Slow longitudinal/diagonal load toward restriction or direction of ease."],
    dosage: ["30–120 second holds × 2–4."],
    steps: ["1. Record lumbar movement.", "2. Establish broad contact.", "3. Take up slack.", "4. Sustain comfortable load.", "5. Release.", "6. Retest.", "7. Add active bending/hinge/strength."],
    reassess: ["Lumbar movement", "Bending", "Walking"],
    mistakes: ["Very deep pressure in acute pain.", "Claiming fascia has been permanently released.", "No graded loading."],
    safety: ["Avoid over acute fracture, infection, open wound or suspected serious pathology."],
    visualCue: "Cross-hand thoracolumbar contact → Slow sustained load → Active re-test."
  },
  {
    slug: "mfr-calf",
    techniqueSlug: "myofascial-release",
    techniqueName: "Myofascial Release (Direct & Indirect)",
    region: "Ankle & Foot",
    title: "Calf / Posterior Leg MFR",
    clinicalUse: ["Calf myofascial discomfort", "Adjunct for dorsiflexion limitation when calf sensitivity contributes"],
    patientPosition: ["Prone or supine with knee supported."],
    therapistPosition: ["Beside lower leg."],
    stabilization: ["Leg supported to allow relaxation."],
    contact: ["Broad palm/forearm or cross-hand contact over gastrocnemius/soleus, avoiding popliteal fossa."],
    forceDirection: ["Slow longitudinal or cross-hand load along posterior calf."],
    dosage: ["30–90 second holds × 2–4."],
    steps: ["1. Record dorsiflexion/lunge.", "2. Apply broad contact.", "3. Sustain comfortable load.", "4. Release.", "5. Retest.", "6. Add calf stretching/strength as indicated."],
    reassess: ["Dorsiflexion", "Lunge", "Calf raise"],
    mistakes: ["Deep pressure over suspected DVT.", "Aggressive pressure into acute strain.", "No strength progression."],
    safety: ["Never treat suspected DVT; avoid acute tear/hematoma."],
    visualCue: "Broad calf contact → Slow fascial load → Re-test dorsiflexion/calf function."
  },

  {
    slug: "neurodynamic-median-slider",
    techniqueSlug: "neurodynamic-mobilization",
    techniqueName: "Neurodynamic Mobilization",
    region: "Upper Limb Neural",
    title: "Median Nerve Slider",
    clinicalUse: ["Median-nerve mechanosensitivity", "Selected cervical radicular/peripheral nerve presentations"],
    patientPosition: ["Supine, shoulder supported."],
    therapistPosition: ["Beside affected arm."],
    stabilization: ["Scapula controlled without aggressive depression."],
    contact: ["Support shoulder/elbow/wrist; do not press directly over nerve."],
    forceDirection: ["Increase neural load at one end while decreasing it at the other, e.g. elbow extension with wrist flexion then elbow flexion with wrist extension depending on chosen slider."],
    dosage: ["10–20 reps × 1–3 sets."],
    steps: ["1. Neurological screen.", "2. Establish mild familiar symptoms only.", "3. Perform smooth slider.", "4. Avoid sustained end range.", "5. Re-test symptoms/function."],
    reassess: ["Neurodynamic test", "Paresthesia", "Functional reach/grip"],
    mistakes: ["Strong nerve stretching.", "Scapular depression too forceful.", "Provoking prolonged tingling."],
    safety: ["Stop if numbness/weakness worsens."],
    visualCue: "One end loads while the other unloads ↔ smooth rhythmic slider."
  },
  {
    slug: "neurodynamic-ulnar-slider",
    techniqueSlug: "neurodynamic-mobilization",
    techniqueName: "Neurodynamic Mobilization",
    region: "Upper Limb Neural",
    title: "Ulnar Nerve Slider",
    clinicalUse: ["Ulnar nerve mechanosensitivity/cubital tunnel-related symptoms after screening"],
    patientPosition: ["Supine or sitting with arm supported."],
    therapistPosition: ["Beside arm."],
    stabilization: ["Shoulder/scapula supported."],
    contact: ["Support elbow/wrist/hand without compressing cubital tunnel."],
    forceDirection: ["Coordinate shoulder/elbow/wrist movements so one end unloads while the other loads."],
    dosage: ["10–20 reps × 1–3 sets."],
    steps: ["1. Screen motor/sensation.", "2. Set low-irritability start position.", "3. Perform slider rhythmically.", "4. Keep symptoms mild/brief.", "5. Reassess."],
    reassess: ["Paresthesia", "Elbow flexion tolerance", "Grip/hand function"],
    mistakes: ["Holding prolonged elbow flexion.", "Pressing over ulnar nerve.", "Using tensioners too early."],
    safety: ["Progressive intrinsic hand weakness requires medical review."],
    visualCue: "Elbow/wrist/shoulder alternate loading ↔ unloading."
  },
  {
    slug: "neurodynamic-radial-slider",
    techniqueSlug: "neurodynamic-mobilization",
    techniqueName: "Neurodynamic Mobilization",
    region: "Upper Limb Neural",
    title: "Radial Nerve Slider",
    clinicalUse: ["Radial nerve mechanosensitivity", "Selected lateral forearm/radial nerve presentations"],
    patientPosition: ["Supine or standing with arm supported."],
    therapistPosition: ["Beside patient."],
    stabilization: ["Scapula controlled gently."],
    contact: ["Support arm segments; avoid compressing radial tunnel."],
    forceDirection: ["Coordinate shoulder depression/abduction, elbow extension and wrist flexion/ulnar deviation with proximal unloading to create slider rather than sustained stretch."],
    dosage: ["10–20 reps × 1–3 sets."],
    steps: ["1. Screen nerve function.", "2. Begin below symptom threshold.", "3. Alternate load/unload.", "4. Reassess symptoms and function."],
    reassess: ["Radial neurodynamic response", "Wrist/finger extension comfort", "Forearm symptoms"],
    mistakes: ["Using maximal wrist flexion.", "Strong shoulder depression.", "Provoking prolonged symptoms."],
    safety: ["Stop with increasing weakness/numbness."],
    visualCue: "Distal load ↔ proximal unload in alternating rhythm."
  },
  {
    slug: "neurodynamic-sciatic-slider",
    techniqueSlug: "neurodynamic-mobilization",
    techniqueName: "Neurodynamic Mobilization",
    region: "Lower Limb Neural",
    title: "Sciatic Nerve Slider",
    clinicalUse: ["Selected lumbar radicular/sciatic mechanosensitivity when neurological status is stable"],
    patientPosition: ["Supine SLR or sitting slump-modified position depending on irritability."],
    therapistPosition: ["Beside leg or patient in sitting."],
    stabilization: ["Pelvis/trunk controlled without forced flexion."],
    contact: ["Support leg; avoid pressure over posterior knee."],
    forceDirection: ["Increase knee extension/hip flexion while reducing ankle or cervical neural load, then reverse."],
    dosage: ["10–20 reps × 1–3 sets."],
    steps: ["1. Neurological screen.", "2. Start below strong symptom threshold.", "3. Alternate load/unload.", "4. Avoid sustained stretch.", "5. Reassess leg symptoms and SLR/slump."],
    reassess: ["SLR/slump", "Leg pain distribution", "Walking/sitting"],
    mistakes: ["Calling it a hamstring stretch.", "Peripheralizing symptoms repeatedly.", "Ignoring progressive weakness."],
    safety: ["Do not delay urgent referral for cauda equina/progressive motor loss."],
    visualCue: "Knee/hip load ↔ ankle/neck unload; rhythmic, not sustained."
  },

  {
    slug: "iastm-forearm-extensors",
    techniqueSlug: "iastm",
    techniqueName: "Instrument-Assisted Soft-Tissue Mobilization (IASTM)",
    region: "Elbow",
    title: "IASTM for Forearm Extensors",
    clinicalUse: ["Adjunct in lateral elbow/forearm pain when short-term symptom reduction helps exercise"],
    patientPosition: ["Sitting with forearm supported, wrist relaxed."],
    therapistPosition: ["Beside table."],
    stabilization: ["Forearm supported fully."],
    contact: ["Instrument edge over extensor muscle mass, avoiding bony lateral epicondyle pressure and superficial radial nerve path."],
    forceDirection: ["Light-to-moderate longitudinal/oblique strokes along muscle/tendon region."],
    dosage: ["30–90 seconds, up to a few minutes total."],
    steps: ["1. Screen skin/bleeding risk.", "2. Apply small lubricant amount if needed.", "3. Light scanning strokes.", "4. Brief targeted strokes.", "5. Reassess grip.", "6. Follow with wrist-extensor loading."],
    reassess: ["Pain-free grip", "Wrist extension pain"],
    mistakes: ["Creating petechiae deliberately.", "Scraping over bone.", "Using IASTM instead of strengthening."],
    safety: ["Avoid open skin, anticoagulation concerns, acute hematoma."],
    visualCue: "Tool glides over extensor mass → brief dose → grip re-test."
  },
  {
    slug: "iastm-hamstring",
    techniqueSlug: "iastm",
    techniqueName: "Instrument-Assisted Soft-Tissue Mobilization (IASTM)",
    region: "Hip & Pelvis",
    title: "IASTM for Hamstring Region",
    clinicalUse: ["Adjunct for chronic hamstring-related stiffness/pain after acute injury phase"],
    patientPosition: ["Prone with knee slightly flexed/relaxed."],
    therapistPosition: ["Beside thigh."],
    stabilization: ["Leg supported."],
    contact: ["Instrument over muscle belly, avoiding ischial region if highly irritable and avoiding sciatic nerve pathway pressure."],
    forceDirection: ["Longitudinal/oblique controlled strokes."],
    dosage: ["30–90 seconds per area, few minutes total."],
    steps: ["1. Screen acute tear/hematoma.", "2. Light scanning.", "3. Short targeted strokes.", "4. Reassess ROM/strength.", "5. Follow with hamstring loading."],
    reassess: ["SLR", "Pain with contraction", "Functional hinge"],
    mistakes: ["Treating acute tear.", "Aggressive bruising.", "No eccentric/strength progression."],
    safety: ["Avoid acute tear, hematoma, DVT."],
    visualCue: "Tool along hamstring muscle belly → short dose → active load re-test."
  },
  {
    slug: "iastm-calf",
    techniqueSlug: "iastm",
    techniqueName: "Instrument-Assisted Soft-Tissue Mobilization (IASTM)",
    region: "Ankle & Foot",
    title: "IASTM for Calf",
    clinicalUse: ["Calf stiffness/myofascial discomfort as adjunct before mobility/loading"],
    patientPosition: ["Prone or supine with calf supported."],
    therapistPosition: ["Beside leg."],
    stabilization: ["Leg relaxed."],
    contact: ["Instrument over gastrocnemius/soleus; avoid popliteal fossa and varicosities."],
    forceDirection: ["Longitudinal strokes, light-to-moderate pressure."],
    dosage: ["30–90 seconds per area."],
    steps: ["1. Screen DVT/skin/bleeding risk.", "2. Apply controlled strokes.", "3. Reassess dorsiflexion.", "4. Follow with calf raises."],
    reassess: ["Dorsiflexion", "Calf raise"],
    mistakes: ["Deep pressure over varicosities.", "Bruising as goal.", "No exercise."],
    safety: ["Never treat suspected DVT."],
    visualCue: "Instrument along calf → short controlled dose → dorsiflexion/calf raise re-test."
  },

  {
    slug: "pnf-upper-limb-d1",
    techniqueSlug: "pnf-manual-techniques",
    techniqueName: "PNF Manual Techniques",
    region: "Shoulder",
    title: "Upper-Limb D1 Flexion Pattern",
    clinicalUse: ["Neurological and orthopedic rehabilitation for coordinated reach/hand-to-mouth type pattern"],
    patientPosition: ["Supine or sitting depending on control."],
    therapistPosition: ["Beside affected arm, facing movement direction."],
    stabilization: ["Trunk supported; allow scapular motion when appropriate."],
    contact: ["One hand guides hand/wrist; other guides forearm/upper arm with lumbrical grip."],
    forceDirection: ["Resistance opposite the diagonal while allowing smooth motion into flexion-adduction-external rotation pattern."],
    dosage: ["1–3 sets × 6–12 quality reps."],
    steps: ["1. Demonstrate pattern.", "2. Place limb in start position.", "3. Give clear verbal cue.", "4. Apply graded resistance.", "5. Let patient complete pattern.", "6. Reduce assistance as control improves.", "7. Transfer to functional reach."],
    reassess: ["Reach quality", "Strength/control", "Functional task"],
    mistakes: ["Too much resistance.", "Gripping painfully.", "Ignoring scapular motion."],
    safety: ["Modify with shoulder pain/instability."],
    visualCue: "Diagonal from low/outside → up/across toward face; smooth resisted pattern."
  },
  {
    slug: "pnf-lower-limb-d1",
    techniqueSlug: "pnf-manual-techniques",
    techniqueName: "PNF Manual Techniques",
    region: "Hip & Pelvis",
    title: "Lower-Limb D1 Flexion Pattern",
    clinicalUse: ["Gait/neurological rehab for coordinated hip flexion-adduction-external rotation pattern"],
    patientPosition: ["Supine initially; progress to functional standing tasks."],
    therapistPosition: ["Beside leg in diagonal line."],
    stabilization: ["Pelvis controlled as needed."],
    contact: ["One hand guides foot/ankle, other distal thigh."],
    forceDirection: ["Resistance opposite diagonal while allowing smooth pattern."],
    dosage: ["1–3 sets × 6–12 quality reps."],
    steps: ["1. Set start position.", "2. Verbal cue.", "3. Guide diagonal.", "4. Add graded resistance.", "5. Reduce help.", "6. Transfer to stepping/gait."],
    reassess: ["Step initiation", "Hip control", "Gait"],
    mistakes: ["Too much resistance.", "Pattern practiced without functional carryover."],
    safety: ["Modify for hip pain/replacement precautions."],
    visualCue: "Foot/leg moves up-and-in diagonal → transfer to stepping."
  },

  {
    slug: "scar-knee-mobilization",
    techniqueSlug: "scar-mobilization",
    techniqueName: "Scar Mobilization",
    region: "Knee",
    title: "Healed Knee Scar Mobilization",
    clinicalUse: ["Healed postoperative scar limiting skin glide or knee movement"],
    patientPosition: ["Supine with knee supported."],
    therapistPosition: ["Beside knee."],
    stabilization: ["Support limb."],
    contact: ["Fingertips adjacent to and then over fully healed scar."],
    forceDirection: ["Gentle longitudinal, transverse, circular and lifting glides."],
    dosage: ["1–3 minutes, 1–2 times/day for self-care if skin tolerates and clinician has taught technique."],
    steps: ["1. Confirm full healing.", "2. Check sensation.", "3. Mobilize skin around scar.", "4. Progress directly over scar.", "5. Add knee flexion/extension.", "6. Reassess."],
    reassess: ["Scar mobility", "Knee flexion", "Sensitivity"],
    mistakes: ["Treating open wound.", "Aggressive pressure.", "Ignoring numbness."],
    safety: ["Stop for redness, drainage, wound opening."],
    visualCue: "Healed scar → small multidirectional skin glides → add knee motion."
  }
  ,
  {
    slug: "maitland-wrist-radiocarpal-glide",
    techniqueSlug: "maitland-joint-mobilization",
    techniqueName: "Maitland Joint Mobilization",
    region: "Wrist & Hand",
    title: "Radiocarpal AP / PA Glide",
    clinicalUse: ["Wrist stiffness after healed injury/immobilization", "Painful restriction where accessory glide changes the comparable sign"],
    patientPosition: ["Sitting with forearm fully supported on table and hand over edge."],
    therapistPosition: ["Sit facing the hand so the wrist joint line is easy to control."],
    stabilization: ["Stabilize distal radius/ulna firmly but comfortably."],
    contact: ["Mobilizing hand contacts proximal carpal row broadly, avoiding excessive pressure over superficial nerves/tendons."],
    forceDirection: ["Apply AP or PA glide according to the restricted movement and response.", "Use low grade for pain and higher grade for stiffness when safe."],
    dosage: ["30–60 seconds × 2–4 bouts with immediate reassessment."],
    steps: ["1. Record flexion/extension or grip-limited task.", "2. Stabilize distal forearm.", "3. Apply low-grade glide.", "4. Progress only if comfortable.", "5. Re-test wrist motion/grip.", "6. Follow with active ROM and grip/loading."],
    reassess: ["Wrist flexion/extension", "Grip", "Functional hand use"],
    mistakes: ["Moving whole forearm instead of carpus.", "Over-compressing carpal tunnel.", "Aggressive mobilization after recent fracture without clearance."],
    safety: ["Avoid acute fracture, unstable carpal injury, inflammatory flare or unhealed surgery."],
    visualCue: "Distal forearm fixed → proximal carpal row glides AP/PA → re-test wrist ROM."
  },
  {
    slug: "mulligan-wrist-mwm",
    techniqueSlug: "mulligan-mobilization-with-movement",
    techniqueName: "Mulligan Mobilization With Movement",
    region: "Wrist & Hand",
    title: "Wrist MWM With Active Flexion / Extension",
    clinicalUse: ["Painful wrist movement with an immediate correctable sign"],
    patientPosition: ["Sitting with forearm supported."],
    therapistPosition: ["Beside or facing the hand."],
    stabilization: ["Stabilize distal forearm."],
    contact: ["Manual contact or belt at carpal region depending on glide direction."],
    forceDirection: ["Sustain the accessory glide while the patient actively flexes/extends the wrist.", "Direction is adjusted until movement is pain-free or clearly easier."],
    dosage: ["6–10 reps × 2–3 sets if beneficial."],
    steps: ["1. Record painful wrist movement.", "2. Apply trial glide.", "3. Patient moves actively.", "4. Fine-tune glide angle.", "5. Repeat only if pain-free/improved.", "6. Re-test without glide.", "7. Add grip and wrist strengthening."],
    reassess: ["Pain-free wrist ROM", "Grip", "Functional task"],
    mistakes: ["Accepting pain during MWM.", "Losing glide during active motion.", "Using too much force."],
    safety: ["Avoid acute fracture/instability or unhealed surgical restriction."],
    visualCue: "Accessory carpal glide + active wrist movement → pain-free gain should remain on retest."
  },
  {
    slug: "cyriax-lateral-elbow-friction",
    techniqueSlug: "cyriax-deep-transverse-friction",
    techniqueName: "Cyriax Deep Transverse Friction",
    region: "Elbow",
    title: "Transverse Friction for Common Extensor Tendon Region",
    clinicalUse: ["Selected lateral elbow tendinopathy as a short-term adjunct to loading"],
    patientPosition: ["Sitting with elbow supported and forearm relaxed."],
    therapistPosition: ["Sit close to the lateral elbow with wrist neutral."],
    stabilization: ["Forearm supported so extensor muscles can relax."],
    contact: ["Supported fingertip contact over clinically relevant tendon region near lateral epicondyle."],
    forceDirection: ["Small transverse movement across tendon fibers rather than sliding along skin."],
    dosage: ["Short tolerable bouts, typically 30–90 seconds initially rather than prolonged aggressive friction."],
    steps: ["1. Confirm tendon-related presentation.", "2. Establish precise contact.", "3. Apply light transverse friction.", "4. Keep discomfort tolerable.", "5. Stop before tissue irritation.", "6. Re-test pain-free grip.", "7. Follow with extensor loading."],
    reassess: ["Pain-free grip", "Resisted wrist extension pain"],
    mistakes: ["Very prolonged friction.", "Treating skin instead of tissue.", "Using friction instead of progressive strengthening."],
    safety: ["Avoid acute tear, hematoma, skin lesion or uncontrolled bleeding risk."],
    visualCue: "Precise tendon contact ↔ small transverse motion → grip re-test."
  },
  {
    slug: "scs-upper-trapezius",
    techniqueSlug: "strain-counterstrain",
    techniqueName: "Strain Counterstrain / Positional Release",
    region: "Cervical",
    title: "Upper Trapezius Positional Release",
    clinicalUse: ["Highly irritable upper trapezius tenderness/guarding", "Painful neck movement where comfort positioning improves the comparable sign"],
    patientPosition: ["Supine or supported sitting with head and arm supported."],
    therapistPosition: ["At head/side of table so shoulder and neck can be positioned without patient effort."],
    stabilization: ["Support head and affected arm fully."],
    contact: ["One light monitoring finger over the tender point; avoid strong sustained pressure."],
    forceDirection: ["Move shoulder/head toward the position of maximal comfort and tissue shortening rather than stretch."],
    dosage: ["Hold comfortable position about 60–90 seconds or until tenderness clearly settles, then return slowly."],
    steps: ["1. Rate tenderness.", "2. Maintain only light monitoring contact.", "3. Position toward comfort.", "4. Fine-tune until tenderness reduces substantially.", "5. Hold.", "6. Return very slowly.", "7. Re-test neck motion."],
    reassess: ["Tenderness", "Cervical rotation/side-bending", "Functional comfort"],
    mistakes: ["Pressing hard on tender point.", "Stretching rather than shortening.", "Returning too quickly."],
    safety: ["Avoid positions that provoke dizziness, neurological symptoms or violate medical precautions."],
    visualCue: "Tender point monitored lightly → position toward ease → hold → slow return → re-test."
  },
  {
    slug: "stm-shoulder-posterior-cuff",
    techniqueSlug: "soft-tissue-mobilization",
    techniqueName: "Soft-Tissue Mobilization",
    region: "Shoulder",
    title: "Posterior Cuff / Periscapular Soft-Tissue Mobilization",
    clinicalUse: ["Posterior shoulder muscle tenderness/guarding as an adjunct to active rehabilitation"],
    patientPosition: ["Side-lying or prone with shoulder supported."],
    therapistPosition: ["Beside scapular region with relaxed shoulders/wrists."],
    stabilization: ["Arm and scapula supported so muscles can relax."],
    contact: ["Broad palm/thumb/forearm contact over posterior cuff/periscapular muscles, avoiding direct pressure on bony scapular borders."],
    forceDirection: ["Slow longitudinal or cross-fiber strokes within tolerance."],
    dosage: ["2–5 minutes targeted work, then reassess."],
    steps: ["1. Record painful reach/rotation.", "2. Begin broad contact.", "3. Focus on clinically relevant tender region.", "4. Keep pressure tolerable.", "5. Re-test.", "6. Follow with cuff/scapular exercise."],
    reassess: ["External/internal rotation", "Overhead reach", "Pain"],
    mistakes: ["Deep painful pressure.", "Treating every tender area.", "No active loading after treatment."],
    safety: ["Avoid acute tear, bruising, open wound or unstable postoperative tissue."],
    visualCue: "Broad posterior shoulder contact → slow tissue glide → re-test reach/rotation."
  },
  {
    slug: "trigger-point-upper-trapezius",
    techniqueSlug: "trigger-point-compression",
    techniqueName: "Trigger-Point Pressure Release",
    region: "Cervical",
    title: "Upper Trapezius Pressure Release",
    clinicalUse: ["Localized myofascial tenderness reproducing familiar neck/shoulder symptoms"],
    patientPosition: ["Supported sitting or supine."],
    therapistPosition: ["Beside patient with good visual contact."],
    stabilization: ["Shoulder supported."],
    contact: ["Broad thumb/finger/knuckle contact over relevant muscle belly, away from anterior neck and nerve structures."],
    forceDirection: ["Gradual pressure into muscle until moderate tolerable discomfort, then hold rather than repeatedly poking."],
    dosage: ["20–60 seconds × 1–3 applications."],
    steps: ["1. Confirm familiar symptom reproduction.", "2. Increase pressure slowly.", "3. Hold while patient breathes normally.", "4. Reduce pressure if symptoms escalate.", "5. Release gradually.", "6. Re-test neck/scapular movement.", "7. Add active exercise."],
    reassess: ["Tenderness", "Neck ROM", "Scapular function"],
    mistakes: ["Maximum pain as goal.", "Pressing near brachial plexus/anterior neck.", "Treating point without addressing load/stress/strength."],
    safety: ["Stop with electric pain, paresthesia, dizziness or marked autonomic response."],
    visualCue: "Gradual broad pressure → tolerable hold → slow release → movement re-test."
  },
  {
    slug: "manual-cervical-traction",
    techniqueSlug: "manual-traction",
    techniqueName: "Manual Traction & Joint Distraction",
    region: "Cervical",
    title: "Manual Cervical Traction",
    clinicalUse: ["Selected compression-sensitive neck/radicular symptoms with clear favorable response"],
    patientPosition: ["Supine with head comfortably supported and neck near neutral/slight flexion as tolerated."],
    therapistPosition: ["Seated at head of table."],
    stabilization: ["Therapist supports occiput and controls head throughout."],
    contact: ["Hands cradle occiput/suboccipital region without throat pressure."],
    forceDirection: ["Smooth longitudinal distraction along cervical axis.", "Begin with very low force and increase only if symptoms improve."],
    dosage: ["Short test of 10–20 seconds; if helpful, repeat 3–5 times or use brief sustained bouts."],
    steps: ["1. Record neck/arm symptoms.", "2. Screen instability/vascular/neurological concerns.", "3. Apply gentle traction.", "4. Monitor centralization/peripheralization.", "5. Release slowly.", "6. Re-test.", "7. Continue only if clearly helpful."],
    reassess: ["Arm symptom distribution", "Neck pain", "Cervical ROM"],
    mistakes: ["Sudden pull.", "Continuing despite peripheralization.", "Treating all radiculopathy automatically with traction."],
    safety: ["Avoid instability, fracture, severe myelopathy, suspected vascular pathology or progressive neurological loss."],
    visualCue: "Occiput supported → smooth longitudinal distraction ↑ → monitor arm symptom response."
  },
  {
    slug: "hvla-thoracic-principles",
    techniqueSlug: "high-velocity-low-amplitude-thrust",
    techniqueName: "HVLA Thrust Manipulation",
    region: "Thoracic",
    title: "Thoracic HVLA — Clinical Setup & Safety Principles",
    clinicalUse: ["Selected thoracic mechanical pain/hypomobility when trained clinician judges a thrust appropriate"],
    patientPosition: ["Position depends on the trained technique; patient must be comfortable and consented."],
    therapistPosition: ["Only clinicians with supervised practical HVLA training should perform the thrust component."],
    stabilization: ["Control adjacent segments and avoid excessive end-range preloading."],
    contact: ["Region-specific contacts are taught hands-on; avoid learning thrust contact from text alone."],
    forceDirection: ["A short low-amplitude thrust is delivered through a controlled setup; cavitation is not the target."],
    dosage: ["Usually one carefully selected attempt or a very small number; do not repeat forcefully to chase a click."],
    steps: ["1. Confirm indication and exclude fracture/instability/systemic risk.", "2. Explain benefits, alternatives and risks; obtain consent.", "3. Establish comfortable setup with minimal pre-thrust tension.", "4. If apprehension/pain appears, abandon thrust.", "5. Trained clinician performs thrust.", "6. Immediately re-check pain, motion and neurological status.", "7. Follow with active rehabilitation."],
    reassess: ["Thoracic movement", "Pain", "Linked neck/shoulder comparable sign"],
    mistakes: ["Chasing cavitation.", "Too much pre-thrust force.", "Using HVLA when mobilization/exercise would be equally suitable."],
    safety: ["Not appropriate as a text-only self-teaching procedure; formal practical training, consent and screening are required."],
    visualCue: "Screen + consent → controlled setup → brief trained thrust → immediate re-test."
  },
  {
    slug: "fascial-manipulation-lumbar",
    techniqueSlug: "fascial-manipulation",
    techniqueName: "Fascial Manipulation",
    region: "Lumbar",
    title: "Lumbar Fascial Manipulation — Focused Point Approach",
    clinicalUse: ["Selected myofascial lumbar movement restriction using the system's assessment logic"],
    patientPosition: ["Prone or side-lying depending on selected point."],
    therapistPosition: ["Close to selected area with supported hand posture."],
    stabilization: ["Trunk/pelvis supported."],
    contact: ["Precise supported contact over selected fascial region, not broad random treatment."],
    forceDirection: ["Focused friction/pressure according to tissue orientation and system-specific hypothesis."],
    dosage: ["Short focused applications with reassessment; avoid unnecessary prolonged soreness."],
    steps: ["1. Map movement dysfunction.", "2. Select candidate point.", "3. Confirm local relevance.", "4. Apply tolerable focused friction.", "5. Stop before excessive irritation.", "6. Re-test original movement.", "7. Follow with active loading."],
    reassess: ["Lumbar movement", "Functional task", "Pain"],
    mistakes: ["Treating theoretical maps as certainty.", "Too much pressure.", "No functional reassessment."],
    safety: ["Avoid acute injury, open skin, infection, bleeding risk."],
    visualCue: "Movement problem → selected fascial point → focused friction → same movement re-test."
  },
  {
    slug: "active-release-forearm",
    techniqueSlug: "active-release-style-soft-tissue",
    techniqueName: "Active Soft-Tissue Release",
    region: "Elbow",
    title: "Active Release-Style Forearm Extensor Technique",
    clinicalUse: ["Forearm extensor stiffness/pain where active tissue excursion improves symptoms"],
    patientPosition: ["Sitting with forearm supported."],
    therapistPosition: ["Beside arm."],
    stabilization: ["Forearm supported."],
    contact: ["Controlled contact over extensor muscle mass."],
    forceDirection: ["Maintain pressure while patient moves wrist from shortened toward lengthened position."],
    dosage: ["3–8 slow repetitions."],
    steps: ["1. Record painful movement/grip.", "2. Position wrist so tissue is shortened.", "3. Establish tolerable contact.", "4. Patient actively lengthens tissue.", "5. Release and repeat.", "6. Re-test.", "7. Add strengthening."],
    reassess: ["Grip", "Wrist extension/flexion", "Forearm pain"],
    mistakes: ["Excessive pressure.", "Passive rather than active movement.", "Treating acute tear aggressively."],
    safety: ["Avoid acute tear, hematoma, nerve symptoms."],
    visualCue: "Contact maintained + tissue actively lengthens → re-test grip/motion."
  },
  {
    slug: "active-release-calf",
    techniqueSlug: "active-release-style-soft-tissue",
    techniqueName: "Active Soft-Tissue Release",
    region: "Ankle & Foot",
    title: "Active Release-Style Calf Technique",
    clinicalUse: ["Calf stiffness/pain as adjunct to dorsiflexion/loading"],
    patientPosition: ["Prone or supine with ankle free to move."],
    therapistPosition: ["Beside lower leg."],
    stabilization: ["Leg supported."],
    contact: ["Tolerable contact over gastrocnemius/soleus muscle belly, away from popliteal fossa."],
    forceDirection: ["Maintain contact while patient actively dorsiflexes/extends knee as appropriate to lengthen target tissue."],
    dosage: ["3–8 slow repetitions."],
    steps: ["1. Measure dorsiflexion.", "2. Start tissue shortened.", "3. Establish contact.", "4. Patient actively lengthens.", "5. Repeat.", "6. Re-test.", "7. Add calf loading."],
    reassess: ["Dorsiflexion", "Calf raise", "Walking"],
    mistakes: ["Deep pressure over suspected DVT.", "Too much force.", "No strength work."],
    safety: ["Avoid DVT, acute tear/hematoma."],
    visualCue: "Calf contact + active dorsiflexion/lengthening → re-test dorsiflexion."
  },
  {
    slug: "mld-upper-limb",
    techniqueSlug: "manual-lymphatic-drainage",
    techniqueName: "Manual Lymphatic Drainage",
    region: "Shoulder",
    title: "Upper-Limb MLD Principles After Breast-Cancer Treatment",
    clinicalUse: ["Selected upper-limb lymphedema after appropriate medical assessment"],
    patientPosition: ["Supine or supported sitting with arm elevated comfortably and skin accessible."],
    therapistPosition: ["Beside arm/trunk with relaxed hands."],
    stabilization: ["Arm fully supported."],
    contact: ["Flat broad hands using very light skin-stretch contact."],
    forceDirection: ["Follow the drainage sequence appropriate to intact lymphatic pathways as taught in formal lymphedema training."],
    dosage: ["Session length is individualized within complete decongestive therapy; manual work is not used alone."],
    steps: ["1. Exclude cellulitis, DVT and acute cardiac decompensation.", "2. Confirm lymphedema plan.", "3. Use proximal/central preparation according to training.", "4. Apply slow rhythmic skin stretch.", "5. Progress through limb sequence.", "6. Combine with compression, exercise and skin care.", "7. Re-measure swelling/function."],
    reassess: ["Limb circumference/volume", "Heaviness/tightness", "Shoulder function"],
    mistakes: ["Deep massage pressure.", "Treating unexplained new swelling.", "Using MLD without compression/exercise when indicated."],
    safety: ["Do not perform during acute cellulitis, untreated DVT or acute decompensated heart failure."],
    visualCue: "Very light skin stretch → trained drainage sequence → compression + exercise + skin care."
  }

];

export const manualRegions: ManualRegion[] = [
  "TMJ & Craniofacial",
  "Cervical",
  "Thoracic",
  "Ribs & Chest Wall",
  "Lumbar",
  "Shoulder",
  "Elbow",
  "Wrist & Hand",
  "Hip & Pelvis",
  "Knee",
  "Ankle & Foot",
  "Upper Limb Neural",
  "Lower Limb Neural",
];

type RegionProfile = {
  focus: string;
  patientPosition: string[];
  therapistPosition: string[];
  stabilization: string[];
  contact: string[];
  reassess: string[];
  safety: string[];
};

const regionProfiles: Record<ManualRegion, RegionProfile> = {
  "TMJ & Craniofacial": {
    focus: "jaw opening/closing, lateral excursion, chewing tolerance and related craniofacial muscle symptoms",
    patientPosition: ["Supported sitting or supine with the head and neck relaxed.", "Keep the jaw in a comfortable resting position before testing or treatment."],
    therapistPosition: ["Stand or sit at the head/side with the patient's head fully supported.", "Use small, precise contacts; avoid forcing the mandible."],
    stabilization: ["Support the cranium and, when needed, stabilize one side of the mandible without compressing the throat."],
    contact: ["Use broad, gentle extra-oral contact over the relevant joint or muscle target.", "Intra-oral techniques require specific training, infection-control procedures and explicit consent."],
    reassess: ["Pain-free mouth opening", "Lateral excursion", "Chewing or speaking tolerance"],
    safety: ["Avoid aggressive force after acute trauma, suspected fracture/dislocation, active dental infection or unexplained cranial nerve signs."]
  },
  Cervical: {
    focus: "neck pain, cervical range, headache-related comparable signs and upper-limb symptom behavior",
    patientPosition: ["Use supported sitting, supine or prone according to the technique and irritability.", "Keep the head and shoulders relaxed and avoid unnecessary end-range positioning."],
    therapistPosition: ["Work close to the patient with the head/neck fully controlled.", "Use relaxed shoulders and low force before considering progression."],
    stabilization: ["Control adjacent cervical segments and the shoulder girdle so the intended target is not replaced by global neck motion."],
    contact: ["Use a broad region-appropriate contact and avoid pressure over the anterior neck, carotid sinus or vulnerable neural/vascular structures."],
    reassess: ["Cervical rotation/flexion/extension", "Pain or headache intensity", "Upper-limb symptom distribution when relevant"],
    safety: ["Screen fracture/instability, progressive neurological deficit, myelopathy and vascular warning features before cervical manual therapy."]
  },
  Thoracic: {
    focus: "thoracic extension/rotation, posture-related symptoms and linked neck/shoulder comparable signs",
    patientPosition: ["Prone, side-lying or supported sitting according to technique.", "Use pillows as needed so breathing remains unrestricted."],
    therapistPosition: ["Stand close to the target level and use body weight rather than excessive arm force."],
    stabilization: ["Control the trunk/rib cage to localize the intended region and prevent rolling."],
    contact: ["Use broad contact over the intended thoracic or paraspinal target and avoid direct aggressive pressure on painful ribs."],
    reassess: ["Thoracic rotation/extension", "Linked neck/shoulder movement", "Breathing-related discomfort if relevant"],
    safety: ["Check trauma, osteoporosis/fracture risk, inflammatory disease and unexplained chest symptoms."]
  },
  "Ribs & Chest Wall": {
    focus: "rib/chest-wall pain, respiratory movement tolerance and thoracic-linked mobility",
    patientPosition: ["Supported sitting, side-lying or supine/prone depending on the rib level and technique.", "Position must allow comfortable breathing throughout."],
    therapistPosition: ["Stand beside the involved rib level with hands supported and force kept low."],
    stabilization: ["Stabilize the adjacent thorax while respecting normal respiratory excursion."],
    contact: ["Use broad contact over the rib or surrounding soft tissue; avoid focal pressure over suspected fracture or vulnerable anterior structures."],
    reassess: ["Pain with deep breath/cough", "Thoracic rotation", "Shoulder or trunk movement linked to symptoms"],
    safety: ["Do not manually treat unexplained chest pain, dyspnea, suspected rib fracture, acute cardiopulmonary symptoms or systemic illness."]
  },
  Lumbar: {
    focus: "low-back movement, local pain, lower-limb symptom behavior and function such as bending or sit-to-stand",
    patientPosition: ["Prone, side-lying or supine based on the technique and symptom response.", "Use abdominal/pelvic support if it reduces irritability."],
    therapistPosition: ["Stand close to the trunk with neutral wrists and controlled body weight."],
    stabilization: ["Control pelvis and adjacent trunk so the intended manual input is localized."],
    contact: ["Use broad lumbar/paraspinal or pelvic contact and avoid direct pressure over painful bony prominences."],
    reassess: ["Lumbar flexion/extension/rotation", "Sit-to-stand or bending", "Leg symptom distribution when relevant"],
    safety: ["Screen cauda equina features, fracture, infection, malignancy and progressive neurological loss before routine manual treatment."]
  },
  Shoulder: {
    focus: "glenohumeral/scapular pain, elevation, rotation and functional reach",
    patientPosition: ["Supine, side-lying or sitting with the arm supported.", "Begin near a comfortable resting position in irritable presentations."],
    therapistPosition: ["Stand beside the shoulder and keep the arm close to the joint line when applying manual force."],
    stabilization: ["Stabilize the scapula/thorax when the target is glenohumeral; allow scapular motion when that is the intended target."],
    contact: ["Use broad contact over proximal humerus, scapula or relevant soft tissue and protect sensitive anterior structures."],
    reassess: ["Flexion/abduction", "Internal/external rotation", "Functional reach or painful arc"],
    safety: ["Respect dislocation history, fracture, postoperative restrictions, acute inflammatory states and neurological symptoms."]
  },
  Elbow: {
    focus: "elbow flexion/extension, forearm rotation, grip and load-related pain",
    patientPosition: ["Sitting or supine with the upper limb supported.", "Keep wrist and shoulder relaxed unless movement is part of the technique."],
    therapistPosition: ["Stand or sit beside the arm with the elbow supported close to the body."],
    stabilization: ["Stabilize humerus or forearm according to the target joint/tissue."],
    contact: ["Use broad contact around the ulnohumeral/radiocapitellar region or target soft tissue; protect the ulnar nerve and radial head region."],
    reassess: ["Elbow flexion/extension", "Pronation/supination", "Grip or task-specific loading"],
    safety: ["Avoid aggressive treatment with suspected fracture, unstable ligament injury, acute nerve irritation or major swelling."]
  },
  "Wrist & Hand": {
    focus: "wrist/hand range, grip, dexterity and task-related pain",
    patientPosition: ["Sitting with forearm and hand supported on the table.", "Keep fingers relaxed unless active movement is part of the technique."],
    therapistPosition: ["Sit or stand beside the hand so small contacts can be controlled precisely."],
    stabilization: ["Stabilize the forearm or adjacent carpal/metacarpal segment."],
    contact: ["Use small, broad contacts over the intended joint/tendon/muscle and avoid compressing superficial nerves or inflamed structures."],
    reassess: ["Wrist flexion/extension", "Forearm rotation", "Grip/pinch or dexterity task"],
    safety: ["Respect fracture, acute ligament injury, inflammatory flare, nerve compression and postoperative precautions."]
  },
  "Hip & Pelvis": {
    focus: "hip mobility, pelvic/SI-region symptoms, gait and functional loading",
    patientPosition: ["Supine, prone or side-lying with the pelvis well supported.", "Use a comfortable hip position and avoid forcing painful end range."],
    therapistPosition: ["Stand close to the pelvis/hip and use a belt when appropriate and trained."],
    stabilization: ["Stabilize pelvis when targeting the hip; stabilize the trunk/leg according to the pelvic technique."],
    contact: ["Use broad contact over proximal femur, pelvis or target soft tissue; avoid excessive pressure over groin neurovascular structures."],
    reassess: ["Hip flexion/rotation", "Squat or sit-to-stand", "Walking or stair tolerance"],
    safety: ["Screen fracture, severe OA irritability, postoperative restrictions, acute inflammatory pathology and red-flag pelvic symptoms."]
  },
  Knee: {
    focus: "knee flexion/extension, patellofemoral/tibiofemoral symptoms and functional loading",
    patientPosition: ["Supine, prone or sitting with the knee supported in the position required by the technique."],
    therapistPosition: ["Stand beside the knee with hands close to the joint line and the limb fully supported."],
    stabilization: ["Stabilize femur, tibia or patella depending on the target."],
    contact: ["Use broad contact and avoid sustained compression over the fibular head/common peroneal nerve."],
    reassess: ["Knee flexion/extension", "Sit-to-stand", "Squat, step or gait pain"],
    safety: ["Avoid routine manual therapy with suspected DVT, fracture, acute instability, infection or uncleared postoperative restriction."]
  },
  "Ankle & Foot": {
    focus: "dorsiflexion/plantarflexion, foot mobility, gait, balance and load tolerance",
    patientPosition: ["Supine, prone, long sitting or weight-bearing according to the technique.", "Keep the foot supported and relaxed unless movement is required."],
    therapistPosition: ["Stand at the foot end or beside the ankle with the lower leg stabilized."],
    stabilization: ["Stabilize distal tibia/fibula, calcaneus or adjacent foot segment based on the target."],
    contact: ["Use broad contact over talus/calcaneus/midfoot or soft tissue and avoid excessive pressure over superficial neurovascular structures."],
    reassess: ["Weight-bearing lunge", "Ankle/foot ROM", "Squat, gait or single-leg task"],
    safety: ["Screen fracture, syndesmotic instability, severe swelling, neurovascular compromise and suspected DVT."]
  },
  "Upper Limb Neural": {
    focus: "upper-limb neural mechanosensitivity and symptom distribution",
    patientPosition: ["Supine is commonly used so the shoulder girdle, elbow, wrist and neck can be controlled.", "Begin well short of symptom provocation."],
    therapistPosition: ["Stand beside the involved upper limb with multiple joints supported."],
    stabilization: ["Control scapula and adjacent joints so the neural load can be changed one component at a time."],
    contact: ["Use support rather than focal pressure over the nerve; neural techniques are produced by joint sequencing, not direct nerve compression."],
    reassess: ["Symptom distribution", "Neurodynamic test response", "Functional reach/grip when relevant"],
    safety: ["Do not aggressively tension progressive neurological deficit, acute nerve injury or symptoms that rapidly worsen/peripheralize."]
  },
  "Lower Limb Neural": {
    focus: "lower-limb neural mechanosensitivity, leg symptom distribution and function",
    patientPosition: ["Supine, side-lying or slump sitting according to the selected neurodynamic sequence.", "Start well below the symptomatic threshold."],
    therapistPosition: ["Stand beside the limb and support the leg so movement remains smooth."],
    stabilization: ["Control pelvis/trunk and change one sensitizing component at a time."],
    contact: ["Support the limb without focal compression over peripheral nerves."],
    reassess: ["Leg symptom distribution", "SLR/slump response when relevant", "Walking or functional movement"],
    safety: ["Use caution with progressive neurological loss, acute nerve injury, severe irritability or red-flag spinal presentations."]
  }
};

type TechniqueRegionPolicy = {
  primary: ManualRegion[];
  selected?: ManualRegion[];
  contact: string[];
  force: string[];
  dosage: string[];
  extraSafety?: string[];
  titleNoun?: string;
};

const techniqueRegionPolicies: Record<string, TechniqueRegionPolicy> = {
  "maitland-joint-mobilization": {
    primary: ["Cervical","Thoracic","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot","TMJ & Craniofacial","Ribs & Chest Wall"],
    selected: ["Upper Limb Neural","Lower Limb Neural"],
    contact: ["Select the joint surface/accessory motion that best relates to the patient's comparable sign.", "Use a comfortable broad contact and localize the intended segment rather than moving the whole region."],
    force: ["Apply rhythmic Grade I–IV oscillation according to pain, stiffness and irritability.", "Direction is chosen from the joint mechanics and, more importantly, the immediate clinical response."],
    dosage: ["A common trial is 30–60 seconds for 2–4 bouts with reassessment after each bout."],
    titleNoun: "Joint Mobilization"
  },
  "kaltenborn-evjenth-mobilization": {
    primary: ["Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["TMJ & Craniofacial","Cervical","Thoracic","Lumbar","Ribs & Chest Wall"],
    contact: ["Stabilize one bone and contact the adjacent segment close to the joint line.", "Use the treatment plane appropriate to the joint rather than pulling from a distant lever."],
    force: ["Traction is applied perpendicular to the treatment plane; glide is applied parallel to it.", "Grade I reduces compression, Grade II takes up slack and Grade III provides a sustained stretch when appropriate."],
    dosage: ["Use brief sustained trials, often 10–30 seconds repeated 3–5 times, adjusted to irritability and response."],
    titleNoun: "Traction / Translatoric Glide"
  },
  "mulligan-mobilization-with-movement": {
    primary: ["Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["TMJ & Craniofacial","Ribs & Chest Wall"],
    contact: ["Apply the accessory glide that makes the patient's active movement easier or pain-free.", "A belt may be used only where trained and where it improves control."],
    force: ["Maintain the accessory glide while the patient performs the comparable active movement.", "The direction is modified until the movement shows an immediate acceptable improvement."],
    dosage: ["Often 6–10 repetitions for 2–3 sets when the response stays pain-free and useful."],
    titleNoun: "Mobilization With Movement"
  },
  "mulligan-snags-nags": {
    primary: ["Cervical","Thoracic","Lumbar"],
    selected: ["Ribs & Chest Wall","TMJ & Craniofacial"],
    contact: ["Use a trained facet/segmental contact that supports the intended spinal glide.", "Self-SNAGs use a towel/belt only after the direction has been taught and reproduced safely."],
    force: ["NAGs use a passive oscillatory glide; SNAGs sustain the glide while the patient actively moves.", "The movement should be pain-free or clearly easier."],
    dosage: ["Commonly 6–10 repetitions, stopping if symptoms worsen or the pain-free effect is lost."],
    titleNoun: "NAG / SNAG Guidance"
  },
  "cyriax-deep-transverse-friction": {
    primary: ["Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Cervical","Thoracic","Lumbar","Ribs & Chest Wall"],
    contact: ["Identify a specific symptomatic tendon, ligament or muscle structure rather than rubbing a broad area.", "Move transversely across the target tissue while minimizing sliding over the skin."],
    force: ["Use localized transverse loading that remains tolerable and does not provoke escalating pain."],
    dosage: ["Use short, symptom-guided bouts; progressive loading remains the main rehabilitation strategy for most tendinopathies."],
    titleNoun: "Deep Transverse Friction"
  },
  "muscle-energy-technique": {
    primary: ["TMJ & Craniofacial","Cervical","Thoracic","Ribs & Chest Wall","Lumbar","Shoulder","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Elbow","Wrist & Hand"],
    contact: ["Position the target muscle/joint at a comfortable barrier and provide matched resistance without allowing unwanted movement."],
    force: ["Use a gentle isometric contraction, commonly about 10–30% effort, followed by relaxation and taking up the newly available range."],
    dosage: ["Usually 3–5 cycles of 5–10 second contractions before reassessment."],
    titleNoun: "Muscle Energy Application"
  },
  "strain-counterstrain": {
    primary: ["TMJ & Craniofacial","Cervical","Thoracic","Ribs & Chest Wall","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: [],
    contact: ["Locate a reproducible tender point with light palpation, then monitor it while positioning the region toward maximal comfort.", "Do not maintain painful pressure on the tender point."],
    force: ["The treatment direction is indirect: shorten/unload the painful tissue until tenderness is substantially reduced, then hold without force."],
    dosage: ["Traditional teaching often uses about 90 seconds, individualized to comfort and response."],
    titleNoun: "Positional Release / Counterstrain"
  },
  "myofascial-release": {
    primary: ["TMJ & Craniofacial","Cervical","Thoracic","Ribs & Chest Wall","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: [],
    contact: ["Use broad skin/fascial contact over the relevant soft-tissue region with enough grip to engage tissue without slipping.", "Direct work follows the perceived restriction; indirect work follows the direction of ease."],
    force: ["Apply slow sustained multidirectional loading rather than a fast thrust.", "Pressure is adjusted to comfort, tissue response and the intended direct/indirect strategy."],
    dosage: ["Sustained contacts are commonly held 60–120 seconds or until a clear change is felt, with reassessment rather than fixed over-treatment."],
    titleNoun: "Myofascial Release"
  },
  "soft-tissue-mobilization": {
    primary: ["TMJ & Craniofacial","Cervical","Thoracic","Ribs & Chest Wall","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: [],
    contact: ["Use broad hand, thumb, knuckle or forearm contact appropriate to the size and sensitivity of the target tissue.", "Avoid direct sustained compression over nerves, vessels or acute lesions."],
    force: ["Use longitudinal, transverse, kneading or sustained pressure according to the clinical target and patient tolerance."],
    dosage: ["Use short-to-moderate bouts with frequent symptom checks; stop before excessive soreness."],
    titleNoun: "Soft-Tissue Mobilization"
  },
  "trigger-point-compression": {
    primary: ["TMJ & Craniofacial","Cervical","Thoracic","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Ribs & Chest Wall"],
    contact: ["Palpate the symptomatic muscle and use a small but comfortable contact over the tender/trigger area.", "Confirm that pressure reproduces the patient's familiar local or referred symptoms before treating."],
    force: ["Apply gradually increasing sustained pressure that remains tolerable; do not chase severe pain."],
    dosage: ["Commonly 20–60 seconds per point, repeated only if the comparable sign improves."],
    titleNoun: "Trigger-Point Pressure Release"
  },
  iastm: {
    primary: ["Thoracic","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Cervical","Ribs & Chest Wall"],
    contact: ["Use an appropriate instrument edge over intact skin with lubricant when required by the tool/system.", "Keep the tool moving and avoid vulnerable neurovascular structures or bony prominences."],
    force: ["Use light-to-moderate scanning or treatment strokes; excessive redness/bruising is not the goal."],
    dosage: ["Often 30–120 seconds per small area within a brief treatment bout, followed by active movement/loading."],
    titleNoun: "IASTM"
  },
  "neurodynamic-mobilization": {
    primary: ["Upper Limb Neural","Lower Limb Neural","Cervical","Lumbar"],
    selected: ["Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    contact: ["Support the limb and use coordinated joint movement to alter neural bed length; do not press directly on the nerve.", "Choose slider before tensioner in irritable presentations."],
    force: ["Sliders increase load at one end while decreasing it at another; tensioners increase load more globally and require lower irritability."],
    dosage: ["A conservative trial is 5–10 smooth repetitions for 1–3 sets, staying below symptom flare."],
    titleNoun: "Neurodynamic Mobilization"
  },
  "manual-traction": {
    primary: ["Cervical","Lumbar","Shoulder","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Elbow","Wrist & Hand","TMJ & Craniofacial"],
    contact: ["Support the segment close to the joint/region and create a comfortable distraction rather than a sudden pull."],
    force: ["Apply smooth longitudinal or joint-plane distraction and begin with very low force.", "Continue only if symptoms centralize, pain decreases or movement becomes easier."],
    dosage: ["Trial 10–30 second holds repeated 3–5 times, individualized to response."],
    titleNoun: "Traction / Distraction"
  },
  "high-velocity-low-amplitude-thrust": {
    primary: ["Thoracic","Lumbar"],
    selected: ["Cervical","Ribs & Chest Wall","Hip & Pelvis"],
    contact: ["Region-specific thrust contacts should be learned in supervised practical training, not from text alone.", "Use comfortable setup with minimal pre-thrust tension and clear consent."],
    force: ["A trained clinician may deliver a short low-amplitude impulse through a controlled setup; cavitation is not the treatment goal."],
    dosage: ["Use a very small number of attempts and do not repeat forcefully to chase a click."],
    extraSafety: ["HVLA requires formal hands-on training, informed consent and region-specific screening. This guide intentionally does not teach a thrust maneuver step-by-step."],
    titleNoun: "HVLA Safety & Application Principles"
  },
  "pnf-manual-techniques": {
    primary: ["Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Cervical","Thoracic","Lumbar"],
    contact: ["Use lumbrical/manual contacts that cue the intended diagonal pattern without gripping painfully.", "Provide resistance where it improves movement quality rather than simply maximizing force."],
    force: ["Guide diagonal/spiral movement with graded manual resistance, stretch or rhythmic stabilization depending on the goal."],
    dosage: ["Commonly 5–10 controlled repetitions or 5–10 second isometric holds for 2–3 sets, response-guided."],
    titleNoun: "PNF Manual Pattern"
  },
  "fascial-manipulation": {
    primary: ["Cervical","Thoracic","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["TMJ & Craniofacial","Ribs & Chest Wall"],
    contact: ["Use focused contact over the selected fascial point only after movement-based assessment.", "Do not treat theoretical maps as proof of a structural lesion."],
    force: ["Apply focused friction/pressure according to the trained system and tissue orientation, staying within tolerable limits."],
    dosage: ["Use brief focused applications with immediate movement reassessment and avoid unnecessary prolonged soreness."],
    titleNoun: "Fascial Manipulation"
  },
  "active-release-style-soft-tissue": {
    primary: ["Cervical","Thoracic","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["TMJ & Craniofacial","Ribs & Chest Wall"],
    contact: ["Establish a tolerable contact over the target muscle/tendon while it is relatively shortened.", "Maintain contact as the patient actively lengthens or moves the tissue."],
    force: ["Pressure remains controlled while the patient produces the movement; avoid dragging aggressively across skin."],
    dosage: ["Often 3–8 slow active repetitions followed by reassessment and loading."],
    titleNoun: "Active Soft-Tissue Release"
  },
  "manual-lymphatic-drainage": {
    primary: ["Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Ribs & Chest Wall","Cervical"],
    contact: ["Use flat broad hands and very light skin-stretch pressure; this is not deep massage.", "Follow a drainage sequence appropriate to intact lymphatic pathways as taught in lymphedema training."],
    force: ["Slow rhythmic skin stretch is directed according to the established drainage plan and underlying lymphatic anatomy."],
    dosage: ["Session length is individualized within complete decongestive therapy and should be combined with compression/exercise/skin care when indicated."],
    extraSafety: ["Do not treat unexplained acute swelling; exclude cellulitis, untreated DVT and acute decompensated heart failure."],
    titleNoun: "Manual Lymphatic Drainage"
  },
  "scar-mobilization": {
    primary: ["TMJ & Craniofacial","Cervical","Thoracic","Ribs & Chest Wall","Lumbar","Shoulder","Elbow","Wrist & Hand","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: [],
    contact: ["Only work on a fully closed/healed scar once wound and surgical precautions allow.", "Use fingertip or broad contact to move skin/scar longitudinally, transversely and in small circles."],
    force: ["Begin with light skin mobility and progress gradually toward deeper tissue loading only when healing stage and tolerance permit."],
    dosage: ["Short bouts of 1–3 minutes per area are usually sufficient before reassessing mobility and function."],
    titleNoun: "Scar Mobilization"
  },
  "paivm-ppivm-spinal-assessment": {
    primary: ["Cervical","Thoracic","Lumbar"],
    selected: ["Ribs & Chest Wall"],
    contact: ["Use a trained segmental contact for PAIVM or guide physiological motion for PPIVM while monitoring symptoms.", "Interpret palpation as one clinical finding rather than proof that a segment is 'out'."],
    force: ["Use the minimum accessory/physiological force needed to judge symptom response and movement behavior."],
    dosage: ["Assessment uses brief graded trials; therapeutic oscillations may use 30–60 seconds for 2–4 bouts when appropriate."],
    titleNoun: "PAIVM / PPIVM"
  },
  "myofascial-decompression-dry-cupping": {
    primary: ["Thoracic","Lumbar","Shoulder","Elbow","Hip & Pelvis","Knee","Ankle & Foot"],
    selected: ["Cervical","Wrist & Hand","Ribs & Chest Wall"],
    contact: ["Place an appropriate cup only on intact soft tissue with conservative suction.", "Avoid vulnerable neurovascular areas, open skin and regions where a cup cannot be controlled safely."],
    force: ["Use the lowest negative pressure that creates a tolerable effect; static or movement-assisted application may be used when appropriate."],
    dosage: ["A conservative application is about 3–10 minutes per region, shorter for first exposure or sensitive skin."],
    extraSafety: ["Temporary discoloration can occur; more bruising does not mean a better treatment."],
    titleNoun: "Dry Cupping / Myofascial Decompression"
  },
  "facilitated-positional-release": {
    primary: ["Cervical","Thoracic","Ribs & Chest Wall","Lumbar","Shoulder","Hip & Pelvis"],
    selected: ["TMJ & Craniofacial","Elbow","Wrist & Hand","Knee","Ankle & Foot"],
    contact: ["Position the symptomatic region toward ease and add the trained facilitating force without forcing end range."],
    force: ["Use brief low-force compression, distraction or torsion according to the trained regional setup.", "Return slowly to neutral and reassess immediately."],
    dosage: ["Brief holds, often about 3–10 seconds, repeated only a small number of times before reassessment."],
    titleNoun: "Facilitated Positional Release"
  }
};

const defaultPolicy: TechniqueRegionPolicy = {
  primary: [],
  selected: manualRegions,
  contact: ["Use a region-appropriate contact that matches the parent technique and the patient's identified target.", "Avoid vulnerable neurovascular structures and painful bony prominences."],
  force: ["Use the lowest force that can test the clinical hypothesis and modify it according to symptom response."],
  dosage: ["Use a conservative trial dose, reassess immediately and continue only if pain, movement or function improves."],
  titleNoun: "Regional Application"
};

function regionSlug(region: ManualRegion) {
  return region
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getApplicability(policy: TechniqueRegionPolicy, region: ManualRegion): "Selected" | "Not routine" {
  if (policy.primary.includes(region)) return "Selected";
  if (policy.selected?.includes(region)) return "Selected";
  return "Not routine";
}

function buildGeneratedApplication(
  technique: (typeof manualTherapyTechniques)[number],
  region: ManualRegion
): RegionalManualApplication {
  const profile = regionProfiles[region];
  const policy = techniqueRegionPolicies[technique.slug] ?? defaultPolicy;
  const applicability = getApplicability(policy, region);
  const isNotRoutine = applicability === "Not routine";
  const title = isNotRoutine
    ? region + " — " + technique.name + " Clinical Guidance"
    : region + " — " + (policy.titleNoun ?? technique.name);

  return {
    slug: "guide-" + technique.slug + "-" + regionSlug(region),
    techniqueSlug: technique.slug,
    techniqueName: technique.name,
    region,
    title,
    applicability,
    clinicalUse: isNotRoutine
      ? [
          technique.name + " is not routinely a first-choice application for " + region + ".",
          "Use it only when examination identifies a relevant target, the clinician is appropriately trained and a safer/more direct option is not preferable.",
          "The treatment decision must still be based on the patient's comparable sign: " + profile.focus + "."
        ]
      : [
          "Use when assessment identifies a relevant impairment in " + region + " and the parent technique fits the patient's presentation.",
          "Primary treatment target: " + profile.focus + ".",
          "Retain the technique only if it produces a meaningful within-session improvement."
        ],
    patientPosition: profile.patientPosition,
    therapistPosition: profile.therapistPosition,
    stabilization: profile.stabilization,
    contact: isNotRoutine
      ? [
          "Do not force a textbook contact simply to make this technique fit the region.",
          ...policy.contact
        ]
      : [...profile.contact, ...policy.contact],
    forceDirection: policy.force,
    dosage: policy.dosage,
    steps: [
      "1. Record the exact comparable sign for " + region + ": " + profile.focus + ".",
      "2. Screen regional red flags, contraindications and technique-specific precautions before touching the patient.",
      "3. Position and stabilize the patient so the target is comfortable and the manual input can be localized.",
      "4. " + (isNotRoutine
        ? "Confirm that this technique is genuinely relevant to the identified target; if not, choose a more appropriate regional technique."
        : "Apply a low-force trial using the parent technique principles and the region-specific contact described above."),
      "5. Monitor pain quality, symptom distribution, guarding and patient confidence throughout.",
      "6. Re-test the original comparable sign immediately after the trial.",
      "7. Keep the technique only when the response is useful, then transfer the gain into active movement, loading or self-management."
    ],
    reassess: profile.reassess,
    mistakes: [
      "Applying the technique because it is familiar rather than because the examination supports it.",
      "Using more force when the response is unclear or worsening.",
      "Failing to re-test the exact movement or function that justified the treatment."
    ],
    safety: [
      ...profile.safety,
      ...(policy.extraSafety ?? []),
      "Stop or modify if symptoms peripheralize, neurological status worsens, the response is disproportionate or the patient asks to stop."
    ],
    visualCue: region + " assessment → correct regional setup → " + (policy.titleNoun ?? technique.name) + " → immediate comparable-sign re-test."
  };
}

const generatedRegionalApplications: RegionalManualApplication[] =
  manualTherapyTechniques.flatMap((technique) => {
    const explicitRegions = new Set(
      regionalManualApplications
        .filter((item) => item.techniqueSlug === technique.slug)
        .map((item) => item.region)
    );

    return manualRegions
      .filter((region) => !explicitRegions.has(region))
      .map((region) => buildGeneratedApplication(technique, region));
  });

export const completeRegionalManualApplications: RegionalManualApplication[] = [
  ...regionalManualApplications.map((item) => ({ ...item, applicability: item.applicability ?? "Detailed" as const })),
  ...generatedRegionalApplications,
];

export function getRegionalManualApplication(slug: string) {
  return completeRegionalManualApplications.find((item) => item.slug === slug);
}

export function getApplicationsForTechnique(techniqueSlug: string) {
  return completeRegionalManualApplications
    .filter((item) => item.techniqueSlug === techniqueSlug)
    .sort((a, b) => manualRegions.indexOf(a.region) - manualRegions.indexOf(b.region));
}

/** Generated guide-* records are orientation templates, never validated technique-specific protocols. */
export function isTechniqueSpecificRegionalApplication(application: { slug: string }) {
  return !application.slug.startsWith("guide-");
}
