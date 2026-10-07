import {
  allConditionRules,
  getCarePriority,
  getImagingNotice,
  getNeurologicHint,
  getSafetyDisposition,
  redFlags,
  scoreConditions,
  type RegionId,
} from "../src/lib/msk-symptom-checker.ts";

type CanonicalCase = {
  id: string;
  region: RegionId;
  expected: string;
  selected: string[];
};

const base = (
  age: "age_18_39" | "age_40_59" | "age_60_plus",
  onset: "onset_trauma" | "onset_gradual" | "onset_no_clear",
  duration: "duration_acute" | "duration_subacute" | "duration_chronic",
  impact: "impact_mild" | "impact_moderate" | "impact_high" = "impact_moderate",
) => [age, onset, duration, impact];

const canonicalCases: CanonicalCase[] = [
  { id: "neck-mechanical", region: "neck", expected: "mechanical-neck-pain", selected: [...base("age_40_59","onset_no_clear","duration_subacute"),"loc_neck_central","clue_neck_move"] },
  { id: "neck-radiculopathy-c6", region: "neck", expected: "cervical-radiculopathy", selected: [...base("age_40_59","onset_no_clear","duration_subacute","impact_high"),"loc_neck_to_arm","clue_arm_tingling","clue_arm_weakness","clue_c6_dist"] },
  { id: "neck-cervicogenic-headache", region: "neck", expected: "cervicogenic-headache", selected: [...base("age_40_59","onset_no_clear","duration_chronic"),"loc_base_skull","clue_headache","clue_neck_move"] },
  { id: "neck-whiplash", region: "neck", expected: "whiplash-associated-disorder", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_neck_side","clue_after_whiplash","clue_neck_move"] },
  { id: "neck-facet", region: "neck", expected: "cervical-facet-pattern", selected: [...base("age_40_59","onset_no_clear","duration_subacute"),"loc_neck_side","clue_neck_ext_rotate","clue_neck_move"] },
  { id: "neck-torticollis", region: "neck", expected: "acute-torticollis", selected: [...base("age_18_39","onset_no_clear","duration_acute"),"loc_neck_side","clue_torticollis"] },
  { id: "neck-thoracic-outlet", region: "neck", expected: "neurogenic-thoracic-outlet", selected: [...base("age_18_39","onset_gradual","duration_chronic"),"loc_neck_to_arm","clue_overhead_neuro_arm","clue_arm_tingling"] },

  { id: "shoulder-rotator-cuff", region: "shoulder", expected: "rotator-cuff-related", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_shoulder_lateral","clue_overhead","clue_painful_arc"] },
  { id: "shoulder-cuff-tear", region: "shoulder", expected: "rotator-cuff-tear", selected: [...base("age_60_plus","onset_trauma","duration_acute","impact_high"),"loc_shoulder_lateral","clue_shoulder_weakness","clue_overhead"] },
  { id: "shoulder-frozen", region: "shoulder", expected: "adhesive-capsulitis", selected: [...base("age_40_59","onset_no_clear","duration_chronic","impact_high"),"loc_shoulder_deep","clue_shoulder_stiff_all"] },
  { id: "shoulder-ac", region: "shoulder", expected: "ac-joint-pain", selected: [...base("age_40_59","onset_trauma","duration_acute"),"loc_shoulder_top","clue_cross_body"] },
  { id: "shoulder-instability", region: "shoulder", expected: "shoulder-instability", selected: [...base("age_18_39","onset_trauma","duration_subacute"),"loc_shoulder_deep","clue_instability"] },
  { id: "shoulder-biceps", region: "shoulder", expected: "long-head-biceps", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_shoulder_front","clue_biceps_load"] },
  { id: "shoulder-labral", region: "shoulder", expected: "shoulder-labral", selected: [...base("age_18_39","onset_trauma","duration_subacute"),"loc_shoulder_deep","clue_click_catch","clue_instability"] },
  { id: "shoulder-oa", region: "shoulder", expected: "glenohumeral-oa", selected: [...base("age_60_plus","onset_gradual","duration_chronic"),"loc_shoulder_deep","clue_shoulder_crepitus_stiff"] },
  { id: "shoulder-calcific", region: "shoulder", expected: "calcific-tendinopathy", selected: [...base("age_40_59","onset_no_clear","duration_acute","impact_high"),"loc_shoulder_lateral","clue_calcific_acute"] },

  { id: "elbow-tennis", region: "elbow", expected: "lateral-epicondylalgia", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_elbow_lateral","clue_grip"] },
  { id: "elbow-golfers", region: "elbow", expected: "medial-epicondylalgia", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_elbow_medial","clue_wrist_flex_load"] },
  { id: "elbow-cubital", region: "elbow", expected: "cubital-tunnel", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_elbow_medial","clue_ulnar_tingling"] },
  { id: "elbow-bursitis", region: "elbow", expected: "olecranon-bursitis", selected: [...base("age_40_59","onset_no_clear","duration_acute"),"loc_elbow_back","clue_elbow_swelling"] },
  { id: "elbow-radial-tunnel", region: "elbow", expected: "radial-tunnel", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_elbow_lateral","clue_radial_tunnel"] },
  { id: "elbow-ucl", region: "elbow", expected: "elbow-ucl", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_elbow_medial","clue_throwing_medial"] },

  { id: "wrist-carpal-tunnel", region: "wrist-hand", expected: "carpal-tunnel", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_palm_median","clue_night_tingling","clue_shake_hand"] },
  { id: "wrist-dequervain", region: "wrist-hand", expected: "de-quervain", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_wrist_thumbside","clue_thumb_motion"] },
  { id: "wrist-trigger-finger", region: "wrist-hand", expected: "trigger-finger", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_finger","clue_triggering"] },
  { id: "wrist-tfcc", region: "wrist-hand", expected: "tfcc-injury", selected: [...base("age_18_39","onset_trauma","duration_subacute"),"loc_wrist_ulnar","clue_wrist_twist"] },
  { id: "wrist-scaphoid", region: "wrist-hand", expected: "scaphoid-injury", selected: [...base("age_18_39","onset_trauma","duration_acute","impact_high"),"loc_wrist_thumbside","clue_wrist_trauma","clue_snuffbox_tender"] },
  { id: "wrist-thumb-ucl", region: "wrist-hand", expected: "thumb-mcp-ucl", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_thumb_base","clue_thumb_forced_out"] },

  { id: "thoracic-mechanical", region: "upper-back-ribs", expected: "thoracic-mechanical", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_between_blades","clue_posture","clue_rotation"] },
  { id: "thoracic-rib-joint", region: "upper-back-ribs", expected: "costovertebral-pain", selected: [...base("age_40_59","onset_no_clear","duration_subacute"),"loc_rib_side","clue_rotation","clue_deep_breath","clue_rib_tender"] },
  { id: "thoracic-costosternal", region: "upper-back-ribs", expected: "costochondral-pain", selected: [...base("age_40_59","onset_no_clear","duration_subacute"),"loc_anterior_rib","clue_costosternal_tender"] },

  { id: "lowback-mechanical", region: "low-back", expected: "nonspecific-low-back", selected: [...base("age_40_59","onset_no_clear","duration_subacute"),"loc_lowback_central","clue_sit_bend"] },
  { id: "lowback-radiculopathy-l5", region: "low-back", expected: "lumbar-radiculopathy", selected: [...base("age_40_59","onset_no_clear","duration_subacute","impact_high"),"loc_leg_radiation","clue_leg_tingling","clue_leg_weakness","clue_l5_dist"] },
  { id: "lowback-disc", region: "low-back", expected: "disc-related-low-back", selected: [...base("age_18_39","onset_no_clear","duration_subacute"),"loc_lowback_central","clue_sit_bend"] },
  { id: "lowback-stenosis", region: "low-back", expected: "lumbar-stenosis", selected: [...base("age_60_plus","onset_gradual","duration_chronic","impact_high"),"loc_leg_radiation","clue_walk_stand"] },
  { id: "lowback-facet", region: "low-back", expected: "lumbar-facet", selected: [...base("age_40_59","onset_no_clear","duration_chronic"),"loc_lowback_side","clue_back_extension"] },
  { id: "lowback-sij", region: "low-back", expected: "sij-related", selected: [...base("age_40_59","onset_no_clear","duration_subacute"),"loc_buttock","clue_sij_load"] },
  { id: "lowback-inflammatory", region: "low-back", expected: "inflammatory-back-pattern", selected: [...base("age_18_39","onset_no_clear","duration_chronic","impact_high"),"loc_lowback_central","clue_morning_30"] },
  { id: "lowback-spondylolysis", region: "low-back", expected: "lumbar-spondylolysis", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_lowback_side","clue_extension_young_athlete","clue_back_extension"] },

  { id: "hip-oa", region: "hip-groin", expected: "hip-oa", selected: [...base("age_60_plus","onset_gradual","duration_chronic","impact_high"),"loc_hip_groin","clue_hip_stiff"] },
  { id: "hip-gtps", region: "hip-groin", expected: "gtps", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_hip_lateral","clue_hip_side_sleep"] },
  { id: "hip-fai", region: "hip-groin", expected: "fai", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_hip_groin","clue_hip_flex_rotate"] },
  { id: "hip-labral", region: "hip-groin", expected: "hip-labral", selected: [...base("age_18_39","onset_trauma","duration_subacute"),"loc_hip_groin","clue_hip_click","clue_hip_flex_rotate"] },
  { id: "hip-adductor", region: "hip-groin", expected: "adductor-strain", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_hip_groin","clue_adductor"] },
  { id: "hip-hamstring", region: "hip-groin", expected: "proximal-hamstring", selected: [...base("age_18_39","onset_gradual","duration_chronic"),"loc_hamstring_origin","clue_hamstring_sit"] },
  { id: "hip-iliopsoas", region: "hip-groin", expected: "iliopsoas-tendinopathy", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_hip_groin","clue_iliopsoas_load"] },

  { id: "knee-pfp", region: "knee", expected: "patellofemoral-pain", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_knee_front","clue_stairs_squat"] },
  { id: "knee-oa", region: "knee", expected: "knee-oa", selected: [...base("age_60_plus","onset_gradual","duration_chronic","impact_high"),"loc_knee_front","clue_knee_stiff_age"] },
  { id: "knee-meniscus", region: "knee", expected: "meniscal-injury", selected: [...base("age_40_59","onset_trauma","duration_subacute"),"loc_knee_jointline","clue_locking","clue_knee_swelling"] },
  { id: "knee-acl", region: "knee", expected: "acl-injury", selected: [...base("age_18_39","onset_trauma","duration_acute","impact_high"),"loc_knee_jointline","clue_pivot_pop","clue_knee_give","clue_knee_swelling"] },
  { id: "knee-mcl", region: "knee", expected: "mcl-sprain", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_knee_medial","clue_valgus_injury"] },
  { id: "knee-pcl", region: "knee", expected: "pcl-injury", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_knee_front","clue_dashboard","clue_knee_give"] },
  { id: "knee-patellar-tendon", region: "knee", expected: "patellar-tendinopathy", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_patellar_tendon","clue_jump_tendon"] },
  { id: "knee-itb", region: "knee", expected: "itb-syndrome", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_knee_lateral","clue_itb_running"] },
  { id: "knee-patellar-instability", region: "knee", expected: "patellar-instability", selected: [...base("age_18_39","onset_trauma","duration_subacute"),"loc_knee_front","clue_patella_slip","clue_knee_give"] },

  { id: "leg-mtss", region: "lower-leg", expected: "mtss", selected: [...base("age_18_39","onset_gradual","duration_subacute"),"loc_shin_medial","clue_running_load","clue_shin_diffuse"] },
  { id: "leg-stress", region: "lower-leg", expected: "tibial-stress-injury", selected: [...base("age_18_39","onset_gradual","duration_subacute","impact_high"),"loc_shin_focal","clue_running_load","clue_shin_focal"] },
  { id: "leg-calf-strain", region: "lower-leg", expected: "calf-strain", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_calf","clue_calf_sudden"] },
  { id: "leg-compartment", region: "lower-leg", expected: "exertional-compartment", selected: [...base("age_18_39","onset_gradual","duration_chronic"),"loc_outer_leg","clue_running_load","clue_exertional_tight"] },

  { id: "ankle-lateral-sprain", region: "ankle-foot", expected: "lateral-ankle-sprain", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_ankle_lateral","clue_inversion"] },
  { id: "ankle-achilles-tendon", region: "ankle-foot", expected: "achilles-tendinopathy", selected: [...base("age_40_59","onset_gradual","duration_subacute"),"loc_heel_back","clue_achilles_load"] },
  { id: "ankle-achilles-rupture", region: "ankle-foot", expected: "achilles-rupture", selected: [...base("age_40_59","onset_trauma","duration_acute","impact_high"),"loc_heel_back","clue_achilles_pop"] },
  { id: "ankle-plantar-heel", region: "ankle-foot", expected: "plantar-heel-pain", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_heel_bottom","clue_first_steps"] },
  { id: "ankle-pttd", region: "ankle-foot", expected: "posterior-tibial-tendon", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_ankle_medial","clue_medial_arch"] },
  { id: "ankle-morton", region: "ankle-foot", expected: "mortons-neuroma", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_forefoot","clue_forefoot_burning"] },
  { id: "ankle-high-sprain", region: "ankle-foot", expected: "syndesmotic-sprain", selected: [...base("age_18_39","onset_trauma","duration_acute","impact_high"),"loc_ankle_lateral","clue_high_ankle"] },
  { id: "ankle-tarsal-tunnel", region: "ankle-foot", expected: "tarsal-tunnel", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_ankle_medial","clue_tarsal_tunnel"] },
  { id: "ankle-turf-toe", region: "ankle-foot", expected: "turf-toe", selected: [...base("age_18_39","onset_trauma","duration_acute"),"loc_bigtoe","clue_turf_toe"] },
  { id: "ankle-bunion", region: "ankle-foot", expected: "hallux-valgus", selected: [...base("age_40_59","onset_gradual","duration_chronic"),"loc_bigtoe","clue_bunion"] },
];

const failures: string[] = [];

let canonicalTop1 = 0;
let canonicalTop3 = 0;

for (const test of canonicalCases) {
  const results = scoreConditions(test.region, new Set(test.selected));
  const ids = results.map((result) => result.condition.id);

  if (ids[0] === test.expected) canonicalTop1 += 1;
  if (ids.slice(0, 3).includes(test.expected)) canonicalTop3 += 1;
  else {
    failures.push(
      `Canonical miss: ${test.id} expected=${test.expected} actual=${ids.slice(0, 3).join(",") || "none"}`,
    );
  }
}

let signatureTop3 = 0;
const signatureMisses: string[] = [];

for (const condition of allConditionRules) {
  const selected = new Set(Object.keys(condition.weights));
  selected.add("impact_moderate");

  const ids = scoreConditions(condition.region, selected)
    .slice(0, 3)
    .map((result) => result.condition.id);

  if (ids.includes(condition.id)) signatureTop3 += 1;
  else signatureMisses.push(`${condition.id} -> ${ids.join(",") || "none"}`);
}

let safetyPassed = 0;
for (const flag of redFlags) {
  const disposition = getSafetyDisposition(new Set([flag.id]));
  if (disposition?.level === flag.level && disposition.flags.some((item) => item.id === flag.id)) {
    safetyPassed += 1;
  } else {
    failures.push(`Safety miss: ${flag.id}`);
  }
}

const mixedSafety = getSafetyDisposition(new Set(["rf_hot_joint", "rf_chest"]));
if (mixedSafety?.level !== "emergency") failures.push("Safety precedence miss: emergency must outrank urgent");

const imagingTests = [
  {
    id: "knee-age55",
    pass: Boolean(getImagingNotice("knee", new Set(["onset_trauma","age_60_plus","loc_knee_front"]))),
  },
  {
    id: "knee-initial-weight",
    pass: Boolean(getImagingNotice("knee", new Set(["onset_trauma","age_18_39","loc_knee_front","clue_knee_no_weight_initial"]))),
  },
  {
    id: "knee-gradual-negative",
    pass: getImagingNotice("knee", new Set(["onset_gradual","age_60_plus","loc_knee_front"])) === null,
  },
  {
    id: "ankle-4-steps",
    pass: Boolean(getImagingNotice("ankle-foot", new Set(["onset_trauma","loc_ankle_lateral","clue_ankle_no4steps"]))),
  },
  {
    id: "ankle-gradual-negative",
    pass: getImagingNotice("ankle-foot", new Set(["onset_gradual","loc_ankle_lateral","clue_ankle_no4steps"])) === null,
  },
];

for (const test of imagingTests) {
  if (!test.pass) failures.push(`Imaging miss: ${test.id}`);
}

const neuroTests = [
  ["neck", ["clue_c6_dist"], "C6"],
  ["neck", ["clue_c7_dist"], "C7"],
  ["neck", ["clue_c8_dist"], "C8"],
  ["low-back", ["clue_l4_dist"], "L4"],
  ["low-back", ["clue_l5_dist"], "L5"],
  ["low-back", ["clue_s1_dist"], "S1"],
] as const;

for (const [region, features, marker] of neuroTests) {
  const hint = getNeurologicHint(region, new Set(features));
  if (!hint?.label.includes(marker)) failures.push(`Neurologic hint miss: ${marker}`);
}

const careTests = [
  ["impact_mild", "Monitor"],
  ["impact_moderate", "Professional"],
  ["impact_high", "Prompt"],
] as const;

for (const [impact, marker] of careTests) {
  const priority = getCarePriority(new Set([impact]));
  if (!priority.label.includes(marker)) failures.push(`Care priority miss: ${impact}`);
}

const canonicalTop1Rate = canonicalTop1 / canonicalCases.length;
const canonicalTop3Rate = canonicalTop3 / canonicalCases.length;
const signatureTop3Rate = signatureTop3 / allConditionRules.length;

console.log("PNA MSK validation");
console.log("------------------");
console.log(`Conditions: ${allConditionRules.length}`);
console.log(`Canonical cases: ${canonicalCases.length}`);
console.log(`Canonical top-1: ${canonicalTop1}/${canonicalCases.length} (${(canonicalTop1Rate * 100).toFixed(1)}%)`);
console.log(`Canonical top-3: ${canonicalTop3}/${canonicalCases.length} (${(canonicalTop3Rate * 100).toFixed(1)}%)`);
console.log(`Rule-signature top-3: ${signatureTop3}/${allConditionRules.length} (${(signatureTop3Rate * 100).toFixed(1)}%)`);
console.log(`Safety flags: ${safetyPassed}/${redFlags.length}`);
console.log(`Imaging checks: ${imagingTests.filter((item) => item.pass).length}/${imagingTests.length}`);
console.log(`Neurologic hints: ${neuroTests.length - failures.filter((item) => item.startsWith("Neurologic hint miss")).length}/${neuroTests.length}`);
console.log(`Care priority: ${careTests.length - failures.filter((item) => item.startsWith("Care priority miss")).length}/${careTests.length}`);

if (signatureMisses.length > 0) {
  console.log("\nRule-signature misses (informational):");
  for (const miss of signatureMisses.slice(0, 20)) console.log(`- ${miss}`);
}

const gates = [
  { label: "canonical top-1 >= 90%", pass: canonicalTop1Rate >= 0.9 },
  { label: "canonical top-3 = 100%", pass: canonicalTop3Rate === 1 },
  { label: "rule-signature top-3 >= 95%", pass: signatureTop3Rate >= 0.95 },
  { label: "all safety checks pass", pass: safetyPassed === redFlags.length && mixedSafety?.level === "emergency" },
  { label: "all imaging checks pass", pass: imagingTests.every((item) => item.pass) },
  { label: "all neurologic hints pass", pass: !failures.some((item) => item.startsWith("Neurologic hint miss")) },
  { label: "all care-priority checks pass", pass: !failures.some((item) => item.startsWith("Care priority miss")) },
];

console.log("\nQuality gates:");
for (const gate of gates) console.log(`- ${gate.pass ? "PASS" : "FAIL"}: ${gate.label}`);

const failedGates = gates.filter((gate) => !gate.pass);
if (failures.length > 0) {
  console.log("\nDetailed failures:");
  for (const failure of failures) console.log(`- ${failure}`);
}

if (failedGates.length > 0) process.exit(1);
