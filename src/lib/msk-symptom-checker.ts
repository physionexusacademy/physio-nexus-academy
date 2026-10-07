export type RegionId =
  | "neck"
  | "shoulder"
  | "elbow"
  | "wrist-hand"
  | "upper-back-ribs"
  | "low-back"
  | "hip-groin"
  | "knee"
  | "lower-leg"
  | "ankle-foot";

export type CheckerOption = {
  id: string;
  label: string;
  medical?: string;
};

export type RegionConfig = {
  id: RegionId;
  label: string;
  medical: string;
  hint: string;
  locations: CheckerOption[];
  clues: CheckerOption[];
};

export type ConditionRule = {
  id: string;
  region: RegionId;
  name: string;
  plainName: string;
  summary: string;
  weights: Record<string, number>;
  penalties?: Record<string, number>;
  advice: string;
};

export type RedFlag = {
  id: string;
  label: string;
  level: "emergency" | "urgent";
  advice: string;
};

export type ImagingNotice = {
  title: string;
  body: string;
  criteria: string[];
};

export const commonHistoryOptions = {
  age: [
    { id: "age_18_39", label: "18–39 years" },
    { id: "age_40_59", label: "40–59 years" },
    { id: "age_60_plus", label: "60+ years" },
  ] satisfies CheckerOption[],
  onset: [
    { id: "onset_trauma", label: "After a fall, twist, impact or sudden injury" },
    { id: "onset_gradual", label: "Gradually after repeated activity / overuse" },
    { id: "onset_no_clear", label: "No clear injury — it started on its own" },
  ] satisfies CheckerOption[],
  duration: [
    { id: "duration_acute", label: "Less than 2 weeks" },
    { id: "duration_subacute", label: "2–6 weeks" },
    { id: "duration_chronic", label: "More than 6 weeks" },
  ] satisfies CheckerOption[],
};

export const redFlags: RedFlag[] = [
  {
    id: "rf_bladder",
    label:
      "New difficulty controlling urine/bowel, inability to pass urine, or numbness around the inner thighs/genital area",
    level: "emergency",
    advice: "Seek emergency medical assessment now because this can indicate serious nerve compression.",
  },
  {
    id: "rf_chest",
    label: "Chest pressure/pain, severe shortness of breath, fainting, or pain with sudden sweating/nausea",
    level: "emergency",
    advice: "Seek emergency medical care now. These symptoms may not be musculoskeletal.",
  },
  {
    id: "rf_progressive_neuro",
    label: "New or rapidly worsening weakness, severe clumsiness, or new difficulty walking",
    level: "urgent",
    advice: "Arrange urgent medical assessment, especially if weakness is progressing.",
  },
  {
    id: "rf_major_trauma",
    label: "Major injury with obvious deformity, inability to bear weight/use the limb, or severe unremitting pain",
    level: "urgent",
    advice: "Urgent in-person assessment and possible imaging are recommended.",
  },
  {
    id: "rf_hot_joint",
    label: "A very hot, red, swollen joint together with fever or feeling very unwell",
    level: "urgent",
    advice: "Urgent medical assessment is recommended to exclude infection or another serious cause.",
  },
  {
    id: "rf_cancer",
    label: "Unexplained weight loss, known cancer history, or severe constant/night pain not changed by position",
    level: "urgent",
    advice: "Prompt medical assessment is recommended before assuming a routine musculoskeletal cause.",
  },
  {
    id: "rf_vascular",
    label: "A limb suddenly becomes cold, pale/blue, extremely painful, or loses sensation",
    level: "emergency",
    advice: "Seek emergency medical assessment now because circulation may be affected.",
  },
  {
    id: "rf_dvt",
    label: "New one-sided calf swelling/redness/warmth, especially with breathlessness or chest pain",
    level: "emergency",
    advice: "Seek urgent/emergency medical assessment to exclude a blood clot.",
  },
];

export const regions: RegionConfig[] = [
  {
    id: "neck",
    label: "Neck",
    medical: "Cervical region",
    hint: "Pain/stiffness from the base of the skull to the top of the shoulders.",
    locations: [
      { id: "loc_neck_central", label: "Middle of the neck" },
      { id: "loc_neck_side", label: "One side of the neck" },
      { id: "loc_base_skull", label: "Base of skull / upper neck" },
      { id: "loc_neck_to_arm", label: "Neck pain that goes into shoulder/arm", medical: "Radiating arm pain" },
    ],
    clues: [
      { id: "clue_neck_move", label: "Pain/stiffness changes with neck movement" },
      { id: "clue_arm_tingling", label: "Pins and needles / numbness in arm or hand", medical: "Paresthesia" },
      { id: "clue_arm_weakness", label: "Arm or hand feels weak" },
      { id: "clue_headache", label: "Headache starts with neck pain" },
      { id: "clue_after_whiplash", label: "Started after sudden acceleration/deceleration (for example a road accident)", medical: "Whiplash mechanism" },
      { id: "clue_neck_age_stiff", label: "Long-term stiffness, especially with turning the head" },
      { id: "clue_trigger_tender", label: "Local tender/tight muscle areas reproduce the pain" },
      { id: "clue_neck_ext_rotate", label: "One-sided neck pain is worse when looking up and turning toward that side", medical: "Extension-rotation pattern" },
      { id: "clue_torticollis", label: "My neck suddenly became stuck/tilted and turning it is very difficult", medical: "Acute torticollis pattern" },
      { id: "clue_overhead_neuro_arm", label: "Arm heaviness, tingling or numbness is brought on by overhead positions and eases when the arm is lowered" },
      { id: "clue_c6_dist", label: "Tingling/numbness is strongest toward the thumb/index-finger side of the hand", medical: "Possible C6 distribution" },
      { id: "clue_c7_dist", label: "Tingling/numbness is strongest around the middle finger", medical: "Possible C7 distribution" },
      { id: "clue_c8_dist", label: "Tingling/numbness is strongest toward the ring/little-finger side of the hand", medical: "Possible C8/T1 distribution" },
    ],
  },
  {
    id: "shoulder",
    label: "Shoulder",
    medical: "Shoulder complex",
    hint: "Pain around the shoulder joint, upper arm or collarbone area.",
    locations: [
      { id: "loc_shoulder_lateral", label: "Outer shoulder / upper arm" },
      { id: "loc_shoulder_front", label: "Front of shoulder" },
      { id: "loc_shoulder_top", label: "Top of shoulder near collarbone", medical: "AC joint area" },
      { id: "loc_shoulder_deep", label: "Deep inside the shoulder" },
    ],
    clues: [
      { id: "clue_overhead", label: "Worse when lifting the arm overhead" },
      { id: "clue_shoulder_weakness", label: "Noticeable weakness lifting the arm" },
      { id: "clue_painful_arc", label: "Pain mainly in the middle part of raising/lowering the arm", medical: "Painful arc" },
      { id: "clue_shoulder_stiff_all", label: "Shoulder is stiff in many directions, including reaching behind the back" },
      { id: "clue_instability", label: "Feels like the shoulder slips out / gives way", medical: "Instability" },
      { id: "clue_cross_body", label: "Pain when bringing the arm across the chest" },
      { id: "clue_biceps_load", label: "Front shoulder pain with lifting/carrying or resisted elbow flexion" },
      { id: "clue_click_catch", label: "Deep clicking/catching with movement" },
      { id: "clue_shoulder_crepitus_stiff", label: "Deep shoulder stiffness with grinding/creaking, especially with age" },
      { id: "clue_calcific_acute", label: "Very painful shoulder movement started suddenly without a clear injury and is difficult even at rest" },
      { id: "clue_posterior_overhead_weak", label: "Back-of-shoulder pain/weakness is worse with repeated overhead sport or activity" },
    ],
  },
  {
    id: "elbow",
    label: "Elbow / Forearm",
    medical: "Elbow and forearm",
    hint: "Pain around the inside, outside, front or back of the elbow.",
    locations: [
      { id: "loc_elbow_lateral", label: "Outer elbow" },
      { id: "loc_elbow_medial", label: "Inner elbow" },
      { id: "loc_elbow_back", label: "Back/tip of elbow" },
      { id: "loc_elbow_front", label: "Front of elbow" },
    ],
    clues: [
      { id: "clue_grip", label: "Worse with gripping, lifting a kettle/bag, or shaking hands" },
      { id: "clue_wrist_flex_load", label: "Inner elbow pain with wrist flexion/throwing" },
      { id: "clue_ulnar_tingling", label: "Numbness/tingling in ring and little fingers" },
      { id: "clue_elbow_swelling", label: "Visible swelling over the tip of the elbow" },
      { id: "clue_elbow_stiff", label: "Stiffness and reduced elbow movement" },
      { id: "clue_sudden_pop_elbow", label: "Sudden pop with bruising or major weakness after lifting" },
      { id: "clue_radial_tunnel", label: "Aching pain is a few centimetres below the outer elbow and worsens with forearm rotation" },
      { id: "clue_throwing_medial", label: "Inner-elbow pain occurs during throwing, especially late cocking/acceleration" },
      { id: "clue_triceps_load", label: "Back-of-elbow pain is worse with pushing, press-ups or resisted elbow straightening" },
      { id: "clue_elbow_lateral_instability", label: "Outer elbow clicks/shifts or feels unstable when pushing up from a chair" },
    ],
  },
  {
    id: "wrist-hand",
    label: "Wrist / Hand",
    medical: "Wrist and hand",
    hint: "Pain, tingling, stiffness or weakness in the wrist, thumb, fingers or palm.",
    locations: [
      { id: "loc_wrist_thumbside", label: "Thumb-side of wrist" },
      { id: "loc_palm_median", label: "Thumb, index, middle fingers / palm side" },
      { id: "loc_wrist_ulnar", label: "Little-finger side of wrist" },
      { id: "loc_wrist_dorsal", label: "Back of wrist" },
      { id: "loc_thumb_base", label: "Base of thumb" },
      { id: "loc_finger", label: "A finger / finger tendon" },
    ],
    clues: [
      { id: "clue_night_tingling", label: "Night-time numbness/tingling wakes me up" },
      { id: "clue_shake_hand", label: "Shaking the hand temporarily relieves tingling" },
      { id: "clue_thumb_motion", label: "Thumb movement/gripping jars or lifting a child is painful" },
      { id: "clue_triggering", label: "Finger catches/locks or clicks when bending/straightening" },
      { id: "clue_wrist_twist", label: "Pain with twisting/rotation or pushing up from a chair" },
      { id: "clue_wrist_trauma", label: "Started after a fall onto the hand or wrist twist" },
      { id: "clue_hand_weakness", label: "Grip feels weak or objects are being dropped" },
      { id: "clue_snuffbox_tender", label: "After a fall, the small hollow at the thumb-side of the wrist is very tender", medical: "Anatomical snuffbox tenderness" },
      { id: "clue_thumb_forced_out", label: "Thumb pain/instability started after the thumb was forced away from the hand", medical: "Thumb MCP UCL mechanism" },
      { id: "clue_intersection", label: "Pain/creaking is on the back of the thumb-side forearm a few centimetres above the wrist with repetitive hand use" },
      { id: "clue_dorsal_wrist_load", label: "Back-of-wrist pain is worse with repeated wrist extension, gripping or weight-bearing through the hand" },
    ],
  },
  {
    id: "upper-back-ribs",
    label: "Upper Back / Ribs",
    medical: "Thoracic spine and ribs",
    hint: "Pain between the shoulder blades, middle back or around the rib cage.",
    locations: [
      { id: "loc_thoracic_midline", label: "Middle of upper/mid back" },
      { id: "loc_between_blades", label: "Between the shoulder blades" },
      { id: "loc_rib_side", label: "One side of the ribs / chest wall" },
      { id: "loc_anterior_rib", label: "Front of chest/rib near the breastbone", medical: "Costosternal region" },
    ],
    clues: [
      { id: "clue_posture", label: "Worse after prolonged sitting or slouched posture" },
      { id: "clue_rotation", label: "Worse with trunk twisting/rotation" },
      { id: "clue_deep_breath", label: "Worse with deep breath, cough or sneeze" },
      { id: "clue_rib_tender", label: "Pressing a specific rib/chest-wall spot reproduces pain" },
      { id: "clue_thoracic_trauma", label: "Started after a direct hit/fall onto the ribs" },
      { id: "clue_costosternal_tender", label: "Pressing a specific front-rib/breastbone junction reproduces the pain" },
      { id: "clue_periscapular_overuse", label: "Aching around the shoulder blade builds with desk work, carrying or repeated arm use" },
      { id: "clue_thoracic_ext_rotate", label: "A focused one-sided upper-back pain is worse with arching/rotation" },
    ],
  },
  {
    id: "low-back",
    label: "Lower Back",
    medical: "Lumbar / lumbopelvic region",
    hint: "Pain across the lower back, buttock or pain travelling into the leg.",
    locations: [
      { id: "loc_lowback_central", label: "Centre of lower back" },
      { id: "loc_lowback_side", label: "One side of lower back" },
      { id: "loc_buttock", label: "Buttock / back of pelvis" },
      { id: "loc_leg_radiation", label: "Back pain travelling into the leg", medical: "Radiating leg pain / sciatica pattern" },
    ],
    clues: [
      { id: "clue_leg_tingling", label: "Numbness/tingling in the leg or foot" },
      { id: "clue_leg_weakness", label: "Leg/foot feels weak" },
      { id: "clue_sit_bend", label: "Worse with prolonged sitting, bending or lifting" },
      { id: "clue_walk_stand", label: "Worse with standing/walking and better when sitting/bending forward" },
      { id: "clue_back_extension", label: "Worse with arching backward or prolonged standing" },
      { id: "clue_sij_load", label: "One-sided buttock pain with turning in bed, stairs or single-leg loading" },
      { id: "clue_morning_30", label: "Morning stiffness lasts more than about 30 minutes and improves with movement" },
      { id: "clue_extension_young_athlete", label: "I am a younger active person and repeated back-bending/extension causes the pain" },
      { id: "clue_hamstring_tight_ext", label: "Back pain with extension is accompanied by marked hamstring tightness or a feeling of slipping" },
      { id: "clue_lowback_tender_side", label: "A very local tender/tight area beside the lower spine reproduces the pain" },
      { id: "clue_l4_dist", label: "Numbness/tingling is strongest toward the front of the knee or inner shin", medical: "Possible L4 distribution" },
      { id: "clue_l5_dist", label: "Numbness/tingling is strongest over the outer leg/top of foot or big-toe area", medical: "Possible L5 distribution" },
      { id: "clue_s1_dist", label: "Numbness/tingling is strongest down the back of the calf toward the outer/sole of the foot", medical: "Possible S1 distribution" },
    ],
  },
  {
    id: "hip-groin",
    label: "Hip / Groin",
    medical: "Hip and pelvic region",
    hint: "Pain in the groin, side of hip, buttock or front of hip.",
    locations: [
      { id: "loc_hip_groin", label: "Groin / front of hip" },
      { id: "loc_hip_lateral", label: "Outer side of hip" },
      { id: "loc_hip_buttock", label: "Deep buttock" },
      { id: "loc_hamstring_origin", label: "Sit-bone / upper hamstring area" },
    ],
    clues: [
      { id: "clue_hip_stiff", label: "Hip feels stiff; shoes/socks or getting in/out of car is difficult" },
      { id: "clue_hip_side_sleep", label: "Outer hip pain is worse lying on that side" },
      { id: "clue_hip_flex_rotate", label: "Groin pain with deep squat, pivoting or hip flexion/rotation" },
      { id: "clue_hip_click", label: "Deep clicking/catching in the hip" },
      { id: "clue_adductor", label: "Groin pain with running, cutting or squeezing knees together" },
      { id: "clue_hamstring_sit", label: "Pain near sit-bone with running or prolonged sitting" },
      { id: "clue_buttock_sciatic", label: "Buttock pain with tingling down the back of the leg" },
      { id: "clue_iliopsoas_load", label: "Front-of-hip/groin pain is worse with repeated hip flexion, stairs or resisted knee lifting" },
      { id: "clue_internal_snap", label: "A snapping/clicking sensation is felt at the front of the hip during hip movement" },
      { id: "clue_hip_flexor_sudden", label: "Front-of-hip pain started suddenly during sprinting, kicking or forceful hip flexion" },
      { id: "clue_pubalgia", label: "Deep groin/lower-abdominal pain is worse with cutting, sit-ups, coughing or forceful twisting" },
    ],
  },
  {
    id: "knee",
    label: "Knee",
    medical: "Knee joint",
    hint: "Pain, swelling, locking or instability around the knee.",
    locations: [
      { id: "loc_knee_front", label: "Front / around kneecap" },
      { id: "loc_knee_jointline", label: "Along the inner or outer joint line" },
      { id: "loc_knee_medial", label: "Inside of knee" },
      { id: "loc_knee_lateral", label: "Outside of knee" },
      { id: "loc_knee_back", label: "Back of knee" },
      { id: "loc_patellar_tendon", label: "Just below the kneecap" },
    ],
    clues: [
      { id: "clue_stairs_squat", label: "Worse on stairs, squatting or after sitting for a long time" },
      { id: "clue_knee_swelling", label: "Knee swells after activity/injury" },
      { id: "clue_locking", label: "True locking/catching that blocks movement" },
      { id: "clue_knee_give", label: "Knee gives way / feels unstable" },
      { id: "clue_pivot_pop", label: "Twisting/pivot injury with a pop" },
      { id: "clue_valgus_injury", label: "Injury from force pushing knee inward" },
      { id: "clue_varus_injury", label: "Injury from force pushing knee outward" },
      { id: "clue_dashboard", label: "Direct blow to front of bent knee", medical: "Dashboard-type mechanism" },
      { id: "clue_jump_tendon", label: "Pain below kneecap with jumping/running" },
      { id: "clue_knee_stiff_age", label: "Gradual stiffness/pain with walking in middle or older age" },
      { id: "clue_knee_age55", label: "I am 55 years or older", medical: "Acute knee fracture-screening criterion" },
      { id: "clue_knee_fibular_head_tender", label: "Very tender directly over the bony bump on the outer upper shin just below the knee", medical: "Fibular-head tenderness" },
      { id: "clue_knee_patella_isolated_tender", label: "The kneecap itself is the main very tender bony spot", medical: "Isolated patellar tenderness" },
      { id: "clue_knee_cant_flex90", label: "I cannot bend the injured knee to about a right angle (90°)" },
      { id: "clue_knee_no4steps", label: "I cannot take 4 weight-bearing steps because of the injury" },
      { id: "clue_quad_tendon", label: "Pain is just above the kneecap and worse with jumping, squatting or resisted knee straightening" },
      { id: "clue_pes_anserine", label: "Tender pain is on the inner upper shin a few centimetres below the knee joint" },
      { id: "clue_itb_running", label: "Outer-knee pain predictably appears during running/cycling and eases after stopping" },
      { id: "clue_prepatellar_swelling", label: "There is swelling directly in front of the kneecap, often after kneeling or a knock" },
      { id: "clue_patella_slip", label: "The kneecap feels like it shifts/slips sideways or has dislocated before" },
    ],
  },
  {
    id: "lower-leg",
    label: "Lower Leg / Shin / Calf",
    medical: "Lower leg",
    hint: "Pain along the shin, calf or outer lower leg.",
    locations: [
      { id: "loc_shin_medial", label: "Inner border of shin" },
      { id: "loc_shin_focal", label: "One small focal spot on the shin bone" },
      { id: "loc_calf", label: "Calf muscle" },
      { id: "loc_shin_front", label: "Front of shin / front of lower leg" },
      { id: "loc_outer_leg", label: "Outer lower leg" },
    ],
    clues: [
      { id: "clue_running_load", label: "Pain is linked to running/jumping load" },
      { id: "clue_shin_diffuse", label: "Tenderness spreads over several centimetres along the shin" },
      { id: "clue_shin_focal", label: "Very focal bone tenderness / hopping is painful" },
      { id: "clue_calf_sudden", label: "Sudden calf pain during sprinting/pushing off" },
      { id: "clue_exertional_tight", label: "Tightness/pain predictably builds during exercise and eases after stopping" },
      { id: "clue_foot_drop", label: "Foot slaps/drops or there is numbness over the outer leg/top of foot" },
      { id: "clue_tib_ant_load", label: "Pain at the front of the shin/ankle is worse with uphill walking or pulling the foot upward" },
      { id: "clue_soleus_load", label: "Deep calf pain is worse with running or a bent-knee calf raise" },
    ],
  },
  {
    id: "ankle-foot",
    label: "Ankle / Foot",
    medical: "Ankle and foot",
    hint: "Pain around the ankle, heel, arch, forefoot or big toe.",
    locations: [
      { id: "loc_ankle_lateral", label: "Outer ankle" },
      { id: "loc_heel_back", label: "Back of heel / Achilles tendon" },
      { id: "loc_heel_bottom", label: "Bottom of heel" },
      { id: "loc_ankle_medial", label: "Inner ankle / arch" },
      { id: "loc_ankle_front", label: "Front of ankle" },
      { id: "loc_forefoot", label: "Ball of foot / forefoot" },
      { id: "loc_bigtoe", label: "Big toe joint" },
    ],
    clues: [
      { id: "clue_inversion", label: "Rolled/twisted the ankle inward" },
      { id: "clue_achilles_load", label: "Back-of-heel pain with running, stairs or calf raises" },
      { id: "clue_achilles_pop", label: "Sudden pop at Achilles with difficulty pushing off / standing on toes" },
      { id: "clue_first_steps", label: "Bottom-of-heel pain is worst with first steps after rest" },
      { id: "clue_medial_arch", label: "Inner ankle/arch pain with prolonged walking; arch feels weaker/flatter" },
      { id: "clue_forefoot_burning", label: "Burning/tingling between toes, worse in tight shoes" },
      { id: "clue_bigtoe_stiff", label: "Big toe is stiff/painful when pushing off" },
      { id: "clue_forefoot_load", label: "Ball-of-foot pain with standing/running" },
      { id: "clue_foot_focal_bone", label: "Focal bone tenderness after increased running/walking load" },
      { id: "clue_ankle_no_weight_initial", label: "After the injury I could not put weight through the foot/ankle" },
      { id: "clue_ankle_no4steps", label: "I cannot take 4 weight-bearing steps because of the injury" },
      { id: "clue_ankle_malleolus_tender", label: "Very tender directly on the ankle bone on the inside or outside", medical: "Malleolar bony tenderness" },
      { id: "clue_ankle_hindfoot_tender", label: "Very tender directly over the heel/hindfoot bone after the injury", medical: "Talus/calcaneus region tenderness" },
      { id: "clue_high_ankle", label: "Pain is above the ankle joint and started with the foot twisting outward", medical: "Syndesmosis mechanism" },
      { id: "clue_eversion_injury", label: "Inner-ankle pain started when the foot was forced outward/rolled outward", medical: "Eversion injury" },
      { id: "clue_peroneal_load", label: "Outer-ankle pain behind the ankle bone is worse with walking, running or turning the foot outward" },
      { id: "clue_tarsal_tunnel", label: "Burning/tingling starts near the inner ankle and spreads into the sole of the foot" },
      { id: "clue_turf_toe", label: "Big-toe pain started when the toe was forcefully bent upward", medical: "Hyperextension injury" },
      { id: "clue_anterior_impinge", label: "Pinching pain at the front of the ankle is worse with deep ankle bend/squat" },
      { id: "clue_posterior_impinge", label: "Pain at the back of the ankle is worse when pointing the foot downward" },
      { id: "clue_bunion", label: "There is a painful bump at the base of the big toe and the toe angles toward the others" },
      { id: "clue_plantar_plate", label: "Pain is under the 2nd/3rd toe joint and the toe feels unstable or is drifting upward/sideways" },
    ],
  },
];

const C = (
  id: string,
  region: RegionId,
  name: string,
  plainName: string,
  summary: string,
  weights: Record<string, number>,
  advice = "A physiotherapy assessment can confirm the pattern and guide management.",
  penalties?: Record<string, number>,
): ConditionRule => ({ id, region, name, plainName, summary, weights, advice, penalties });

export const conditionRules: ConditionRule[] = [
  C("mechanical-neck-pain","neck","Mechanical Neck Pain / Cervical Strain","Common neck joint or muscle pain","Local neck pain and stiffness that changes with posture or movement.",{loc_neck_central:2,loc_neck_side:2,clue_neck_move:3,onset_no_clear:1,onset_gradual:1,clue_trigger_tender:1}),
  C("cervical-radiculopathy","neck","Cervical Radiculopathy","Neck nerve irritation","Neck-to-arm symptoms with numbness, tingling or weakness in a nerve-root pattern.",{loc_neck_to_arm:3,clue_arm_tingling:4,clue_arm_weakness:3,clue_neck_move:1,clue_c6_dist:2,clue_c7_dist:2,clue_c8_dist:2}),
  C("cervicogenic-headache","neck","Cervicogenic Headache","Headache linked to the neck","Headache associated with neck pain and neck movement, often beginning near the upper neck/base of skull.",{loc_base_skull:3,clue_headache:4,clue_neck_move:2}),
  C("whiplash-associated-disorder","neck","Whiplash-Associated Disorder","Neck pain after a sudden jolt","Neck pain/stiffness after rapid acceleration-deceleration such as a road-traffic collision.",{clue_after_whiplash:5,onset_trauma:3,clue_neck_move:1}),
  C("cervical-spondylosis","neck","Cervical Spondylosis / Degenerative Neck Pain","Age-related neck stiffness","Persistent neck stiffness and pain that is more common with increasing age.",{age_40_59:2,age_60_plus:3,duration_chronic:2,clue_neck_age_stiff:3,clue_neck_move:1}),
  C("myofascial-neck-pain","neck","Cervical Myofascial Pain","Tender neck muscle pain","Pain reproduced from locally tender/tight muscle areas.",{clue_trigger_tender:4,loc_neck_side:2,onset_gradual:1}),

  C("rotator-cuff-related","shoulder","Rotator Cuff-Related Shoulder Pain","Common shoulder tendon pain","Outer shoulder/upper-arm pain aggravated by lifting or overhead activity.",{loc_shoulder_lateral:3,clue_overhead:3,clue_painful_arc:3,onset_gradual:2}),
  C("rotator-cuff-tear","shoulder","Rotator Cuff Tear Pattern","Possible shoulder tendon tear","Shoulder pain with notable weakness, particularly after trauma or in older adults.",{clue_shoulder_weakness:4,onset_trauma:2,age_60_plus:2,loc_shoulder_lateral:2,clue_overhead:1},"Prompt assessment is recommended if weakness followed an injury."),
  C("adhesive-capsulitis","shoulder","Adhesive Capsulitis (Frozen Shoulder)","Frozen shoulder pattern","Progressive pain and marked stiffness in several shoulder directions.",{clue_shoulder_stiff_all:5,duration_chronic:2,age_40_59:2,age_60_plus:1},undefined,{onset_trauma:2,age_18_39:2}),
  C("ac-joint-pain","shoulder","Acromioclavicular Joint Pain","Top-of-shoulder joint pain","Pain focused over the top of the shoulder, often aggravated by cross-body movement.",{loc_shoulder_top:4,clue_cross_body:4,onset_trauma:1}),
  C("shoulder-instability","shoulder","Glenohumeral Instability","Shoulder slipping/giving-way pattern","A sense of slipping, apprehension or repeated instability, commonly after dislocation/subluxation.",{clue_instability:5,onset_trauma:2,age_18_39:2}),
  C("long-head-biceps","shoulder","Long-Head Biceps Tendinopathy","Front shoulder biceps tendon pain","Front shoulder pain aggravated by lifting/carrying or biceps loading.",{loc_shoulder_front:4,clue_biceps_load:4,onset_gradual:2}),
  C("shoulder-labral","shoulder","Shoulder Labral Injury Pattern","Deep shoulder catching/clicking pattern","Deep shoulder pain with catching/clicking, often after traction, instability or overhead load.",{loc_shoulder_deep:3,clue_click_catch:4,onset_trauma:2,clue_instability:1}),

  C("lateral-epicondylalgia","elbow","Lateral Epicondylalgia (Tennis Elbow)","Outer elbow tendon pain","Outer elbow pain with gripping and lifting.",{loc_elbow_lateral:5,clue_grip:4,onset_gradual:2}),
  C("medial-epicondylalgia","elbow","Medial Epicondylalgia (Golfer's Elbow)","Inner elbow tendon pain","Inner elbow pain aggravated by gripping, wrist flexion or throwing.",{loc_elbow_medial:5,clue_wrist_flex_load:4,onset_gradual:2}),
  C("cubital-tunnel","elbow","Cubital Tunnel Syndrome","Ulnar nerve irritation at the elbow","Inner elbow symptoms with numbness/tingling into the ring and little fingers.",{loc_elbow_medial:2,clue_ulnar_tingling:5}),
  C("olecranon-bursitis","elbow","Olecranon Bursitis","Swollen elbow-tip bursa","Localized swelling over the tip of the elbow, sometimes after pressure or a knock.",{loc_elbow_back:4,clue_elbow_swelling:5}),
  C("distal-biceps-injury","elbow","Distal Biceps Tendon Injury","Front elbow biceps tendon injury","Sudden front-of-elbow pain, bruising or weakness after a forceful lift.",{loc_elbow_front:4,clue_sudden_pop_elbow:5,onset_trauma:3},"Prompt assessment is recommended for suspected tendon rupture."),
  C("elbow-oa","elbow","Elbow Osteoarthritis Pattern","Degenerative elbow stiffness","Gradual elbow pain and stiffness, usually with reduced movement.",{clue_elbow_stiff:4,duration_chronic:2,age_40_59:2,age_60_plus:3}),

  C("carpal-tunnel","wrist-hand","Carpal Tunnel Syndrome","Median nerve compression at the wrist","Night-time tingling/numbness in the thumb, index and middle fingers, sometimes relieved by shaking the hand.",{loc_palm_median:4,clue_night_tingling:4,clue_shake_hand:3,clue_hand_weakness:1},undefined,{onset_trauma:2}),
  C("de-quervain","wrist-hand","De Quervain Tenosynovitis","Thumb-side wrist tendon irritation","Thumb-side wrist pain aggravated by thumb movement, gripping or lifting.",{loc_wrist_thumbside:5,clue_thumb_motion:4,onset_gradual:2}),
  C("thumb-cmc-oa","wrist-hand","Thumb CMC Osteoarthritis","Base-of-thumb arthritis pattern","Pain and stiffness at the base of the thumb, often with pinch/grip tasks.",{loc_thumb_base:5,age_40_59:2,age_60_plus:3,duration_chronic:2}),
  C("trigger-finger","wrist-hand","Trigger Finger","Finger locking/catching","A finger catches, clicks or locks during flexion/extension.",{loc_finger:3,clue_triggering:6}),
  C("tfcc-injury","wrist-hand","TFCC Injury Pattern","Little-finger-side wrist cartilage/ligament injury","Ulnar-sided wrist pain with twisting, loading through the hand or trauma.",{loc_wrist_ulnar:5,clue_wrist_twist:4,onset_trauma:2}),
  C("wrist-sprain","wrist-hand","Wrist Sprain","Wrist ligament injury","Wrist pain after a fall/twist without a clear fracture pattern.",{clue_wrist_trauma:5,onset_trauma:3}),
  C("ulnar-nerve-wrist","wrist-hand","Ulnar Nerve Compression at Wrist Pattern","Little-finger-side nerve symptoms","Tingling/weakness affecting the little-finger side of the hand.",{loc_wrist_ulnar:3,clue_hand_weakness:2}),

  C("thoracic-mechanical","upper-back-ribs","Mechanical Thoracic Pain","Common upper/mid-back mechanical pain","Thoracic pain linked to posture and movement.",{loc_thoracic_midline:2,loc_between_blades:2,clue_posture:4,clue_rotation:3}),
  C("costovertebral-pain","upper-back-ribs","Costovertebral / Rib Joint Pain","Rib-joint mechanical pain","Localized rib/thoracic pain aggravated by trunk movement or deep breathing.",{loc_rib_side:3,clue_rotation:3,clue_deep_breath:3,clue_rib_tender:2}),
  C("intercostal-strain","upper-back-ribs","Intercostal Muscle Strain","Rib muscle strain","Chest-wall/rib pain with breathing, coughing or twisting, often after exertion.",{loc_rib_side:3,clue_deep_breath:4,onset_trauma:1,onset_gradual:1}),
  C("rib-injury","upper-back-ribs","Rib Contusion / Fracture Pattern","Possible rib injury","Localized rib pain and tenderness following a direct hit or fall.",{loc_rib_side:4,clue_thoracic_trauma:5,clue_rib_tender:3,clue_deep_breath:2},"In-person assessment is recommended after significant rib trauma."),

  C("nonspecific-low-back","low-back","Non-Specific Mechanical Low Back Pain","Common lower-back pain","Localized back pain influenced by movement, lifting, posture or activity without clear nerve features.",{loc_lowback_central:2,loc_lowback_side:2,clue_sit_bend:3,onset_no_clear:1,onset_gradual:1},"A physiotherapy assessment can identify movement and load factors."),
  C("lumbar-radiculopathy","low-back","Lumbar Radiculopathy / Sciatica Pattern","Lower-back nerve irritation","Back-to-leg pain with numbness, tingling and/or weakness.",{loc_leg_radiation:4,clue_leg_tingling:4,clue_leg_weakness:3,clue_l4_dist:2,clue_l5_dist:2,clue_s1_dist:2}),
  C("disc-related-low-back","low-back","Lumbar Disc-Related Pain Pattern","Disc-related lower-back pattern","Back pain commonly aggravated by sitting, bending or lifting, sometimes with leg symptoms.",{clue_sit_bend:4,loc_lowback_central:2,loc_leg_radiation:1,age_18_39:1,age_40_59:1}),
  C("lumbar-stenosis","low-back","Lumbar Spinal Stenosis Pattern","Walking/standing-related nerve pain","Leg/back symptoms that build with standing or walking and ease with sitting or bending forward.",{clue_walk_stand:5,age_60_plus:4,duration_chronic:2,loc_leg_radiation:2}),
  C("lumbar-facet","low-back","Lumbar Facet / Extension-Related Pain Pattern","Back pain worse with arching/standing","Localized low-back pain aggravated by extension or prolonged standing.",{clue_back_extension:4,loc_lowback_side:2,age_40_59:1,age_60_plus:1}),
  C("sij-related","low-back","Sacroiliac Joint-Related Pain Pattern","One-sided buttock/pelvic load pain","Pain around one buttock/posterior pelvis aggravated by transfers, stairs or single-leg loading.",{loc_buttock:4,clue_sij_load:5}),
  C("inflammatory-back-pattern","low-back","Inflammatory Back Pain Pattern","Back pain that may need medical review","Persistent back pain with prolonged morning stiffness and improvement with movement can suggest an inflammatory pattern.",{clue_morning_30:5,duration_chronic:2,age_18_39:2},"Discuss this pattern with a clinician; medical review may be appropriate."),

  C("hip-oa","hip-groin","Hip Osteoarthritis","Hip arthritis pattern","Groin/anterior hip pain with stiffness and difficulty with shoes, socks or walking.",{loc_hip_groin:4,clue_hip_stiff:5,age_60_plus:4,age_40_59:2,duration_chronic:2},undefined,{age_18_39:3,onset_trauma:2,duration_acute:2}),
  C("gtps","hip-groin","Greater Trochanteric Pain Syndrome / Gluteal Tendinopathy","Outer hip tendon pain","Pain over the outer hip, often worse lying on that side, walking or stairs.",{loc_hip_lateral:5,clue_hip_side_sleep:5,onset_gradual:2}),
  C("fai","hip-groin","Femoroacetabular Impingement Syndrome Pattern","Hip impingement-type pattern","Groin pain provoked by deep hip flexion, squatting or pivoting.",{loc_hip_groin:4,clue_hip_flex_rotate:5,age_18_39:2,age_40_59:1}),
  C("hip-labral","hip-groin","Hip Labral Injury Pattern","Deep hip clicking/catching pattern","Deep groin pain with clicking/catching, often during flexion/rotation or sport.",{loc_hip_groin:3,clue_hip_click:5,clue_hip_flex_rotate:2}),
  C("adductor-strain","hip-groin","Adductor Strain / Tendinopathy","Inner-thigh/groin muscle pain","Groin pain linked to running, cutting, kicking or resisted adduction.",{loc_hip_groin:3,clue_adductor:5,onset_trauma:1,onset_gradual:1}),
  C("proximal-hamstring","hip-groin","Proximal Hamstring Tendinopathy","Upper hamstring / sit-bone tendon pain","Pain near the sit-bone with running, hinging or prolonged sitting.",{loc_hamstring_origin:5,clue_hamstring_sit:5,onset_gradual:2}),
  C("deep-gluteal","hip-groin","Deep Gluteal / Sciatic Nerve Irritation Pattern","Buttock-related sciatic irritation","Deep buttock pain with possible tingling down the leg.",{loc_hip_buttock:4,clue_buttock_sciatic:5}),

  C("patellofemoral-pain","knee","Patellofemoral Pain","Kneecap-related pain","Front-of-knee pain aggravated by stairs, squats, running or prolonged sitting.",{loc_knee_front:5,clue_stairs_squat:5,age_18_39:2,onset_gradual:2},undefined,{clue_locking:2,clue_pivot_pop:2}),
  C("knee-oa","knee","Knee Osteoarthritis","Knee arthritis pattern","Gradual knee pain and stiffness with walking and daily activity, more common with age.",{clue_knee_stiff_age:5,age_60_plus:4,age_40_59:2,duration_chronic:2},undefined,{age_18_39:3,onset_trauma:2,duration_acute:2}),
  C("meniscal-injury","knee","Meniscal Injury Pattern","Knee cartilage/meniscus injury","Joint-line pain with swelling, catching or locking, often after twisting.",{loc_knee_jointline:4,clue_locking:4,clue_knee_swelling:2,onset_trauma:2,clue_pivot_pop:1}),
  C("acl-injury","knee","ACL Injury Pattern","Major knee stabilizing ligament injury","Pivot injury with pop, early swelling and instability/giving way.",{clue_pivot_pop:5,clue_knee_give:4,clue_knee_swelling:3,onset_trauma:3},"Prompt sports/orthopaedic or physiotherapy assessment is recommended."),
  C("mcl-sprain","knee","MCL Sprain Pattern","Inner-knee ligament sprain","Medial knee pain after a force pushing the knee inward.",{loc_knee_medial:4,clue_valgus_injury:5,onset_trauma:3}),
  C("lcl-sprain","knee","LCL Sprain Pattern","Outer-knee ligament sprain","Lateral knee pain after a force pushing the knee outward.",{loc_knee_lateral:4,clue_varus_injury:5,onset_trauma:3}),
  C("pcl-injury","knee","PCL Injury Pattern","Posterior cruciate ligament injury","Knee pain/instability after a direct blow to the front of a bent knee.",{clue_dashboard:6,onset_trauma:3,clue_knee_give:2}),
  C("patellar-tendinopathy","knee","Patellar Tendinopathy","Jumper's knee tendon pain","Pain just below the kneecap with jumping, running or repeated loading.",{loc_patellar_tendon:5,clue_jump_tendon:5,onset_gradual:2}),
  C("bakers-cyst","knee","Baker's Cyst Pattern","Fluid swelling behind the knee","Tightness/fullness or swelling at the back of the knee, often associated with another knee disorder.",{loc_knee_back:5,clue_knee_swelling:2}),

  C("mtss","lower-leg","Medial Tibial Stress Syndrome (Shin Splints)","Diffuse inner-shin running pain","Exercise-related pain/tenderness spread along the inner border of the shin.",{loc_shin_medial:5,clue_running_load:4,clue_shin_diffuse:5,onset_gradual:2}),
  C("tibial-stress-injury","lower-leg","Tibial Stress Injury Pattern","Possible bone stress injury","Focal shin bone pain and tenderness after increased impact loading.",{loc_shin_focal:5,clue_shin_focal:6,clue_running_load:3,onset_gradual:2},"Reduce impact loading and arrange assessment; imaging may be needed depending on findings."),
  C("calf-strain","lower-leg","Calf Muscle Strain","Pulled calf muscle","Sudden calf pain during sprinting, jumping or push-off.",{loc_calf:5,clue_calf_sudden:5,onset_trauma:3}),
  C("exertional-compartment","lower-leg","Chronic Exertional Compartment Syndrome Pattern","Exercise-induced lower-leg pressure pattern","Tightness/pain that predictably develops during exercise and settles after stopping.",{clue_exertional_tight:6,clue_running_load:3}),
  C("common-peroneal-nerve","lower-leg","Common Peroneal Nerve Irritation Pattern","Outer-leg nerve problem","Outer-leg/top-of-foot numbness with possible foot-drop weakness.",{loc_outer_leg:3,clue_foot_drop:6},"Weakness such as foot drop deserves prompt clinical assessment."),

  C("lateral-ankle-sprain","ankle-foot","Lateral Ankle Sprain","Rolled ankle ligament injury","Outer-ankle pain and swelling after an inversion/rolling injury.",{loc_ankle_lateral:5,clue_inversion:6,onset_trauma:3},undefined,{onset_gradual:3}),
  C("achilles-tendinopathy","ankle-foot","Achilles Tendinopathy","Achilles tendon overload pain","Load-related pain at the back of the heel/Achilles during running, stairs or calf raises.",{loc_heel_back:5,clue_achilles_load:5,onset_gradual:2},undefined,{clue_achilles_pop:5,onset_trauma:2}),
  C("achilles-rupture","ankle-foot","Achilles Tendon Rupture Pattern","Possible Achilles tendon rupture","Sudden pop or kick-like sensation with major loss of push-off strength.",{loc_heel_back:4,clue_achilles_pop:7,onset_trauma:3},"Urgent in-person assessment is recommended for a suspected Achilles rupture."),
  C("plantar-heel-pain","ankle-foot","Plantar Heel Pain / Plantar Fasciopathy","Bottom-of-heel first-step pain","Heel pain that is typically worst with the first steps after rest and during prolonged weight-bearing.",{loc_heel_bottom:5,clue_first_steps:6,onset_gradual:2},undefined,{onset_trauma:3,clue_foot_focal_bone:2}),
  C("posterior-tibial-tendon","ankle-foot","Posterior Tibial Tendon Dysfunction Pattern","Inner-ankle/arch tendon problem","Medial ankle/arch pain with prolonged walking and possible progressive flattening of the arch.",{loc_ankle_medial:5,clue_medial_arch:6,onset_gradual:2}),
  C("mortons-neuroma","ankle-foot","Morton's Neuroma Pattern","Forefoot nerve irritation","Burning/tingling forefoot pain between the toes, often worse in tight shoes.",{loc_forefoot:4,clue_forefoot_burning:6}),
  C("metatarsalgia","ankle-foot","Metatarsalgia Pattern","Ball-of-foot load pain","Pain under the forefoot with standing, walking or running.",{loc_forefoot:5,clue_forefoot_load:5,onset_gradual:2}),
  C("hallux-rigidus","ankle-foot","Hallux Rigidus","Stiff painful big toe joint","Pain and stiffness at the big-toe joint, especially during push-off.",{loc_bigtoe:5,clue_bigtoe_stiff:6,duration_chronic:1}),
  C("foot-stress-injury","ankle-foot","Foot Stress Injury Pattern","Possible foot bone stress injury","Focal bony pain after a recent rise in walking/running load.",{clue_foot_focal_bone:6,onset_gradual:2,clue_running_load:2},"Reduce impact loading and arrange assessment; stress injuries can require imaging."),
];

export const expandedConditionRules: ConditionRule[] = [
  C("cervical-facet-pattern","neck","Cervical Facet-Mediated Pain Pattern","One-sided neck joint pain","Localized one-sided neck pain that is commonly provoked by extension and rotation.",{loc_neck_side:3,clue_neck_ext_rotate:5,clue_neck_move:2},undefined,{clue_arm_tingling:2,clue_arm_weakness:2}),
  C("acute-torticollis","neck","Acute Torticollis Pattern","Suddenly stuck or tilted neck","Sudden painful restriction with the head held turned or tilted and marked difficulty moving the neck.",{clue_torticollis:7,duration_acute:2,onset_no_clear:1}),
  C("neurogenic-thoracic-outlet","neck","Neurogenic Thoracic Outlet Syndrome Pattern","Arm symptoms linked to overhead position","Arm heaviness, tingling or numbness provoked by overhead positioning can fit a thoracic-outlet-type pattern.",{loc_neck_to_arm:2,clue_overhead_neuro_arm:6,clue_arm_tingling:2,clue_c8_dist:1},"A clinician should assess the neck, shoulder girdle, neurologic findings and vascular status before confirming this pattern."),

  C("glenohumeral-oa","shoulder","Glenohumeral Osteoarthritis","Shoulder joint arthritis pattern","Deep shoulder pain, stiffness and crepitus that gradually limit movement.",{loc_shoulder_deep:3,clue_shoulder_crepitus_stiff:6,age_60_plus:3,age_40_59:2,duration_chronic:2},undefined,{onset_trauma:2,age_18_39:2}),
  C("calcific-tendinopathy","shoulder","Calcific Rotator Cuff Tendinopathy Pattern","Sudden severe shoulder tendon pain","A very painful shoulder episode can occur without major trauma and may severely restrict movement.",{clue_calcific_acute:6,loc_shoulder_lateral:2,onset_no_clear:2,duration_acute:2},"Severe unexplained shoulder pain deserves clinical assessment; imaging may be considered depending on examination findings."),
  C("suprascapular-neuropathy","shoulder","Suprascapular Neuropathy Pattern","Posterior shoulder nerve-related weakness","Posterior shoulder pain and weakness can occur with repetitive overhead activity and suprascapular nerve involvement.",{clue_posterior_overhead_weak:6,clue_shoulder_weakness:3,loc_shoulder_deep:1},"Neurologic and shoulder examination is recommended before confirming this pattern."),

  C("radial-tunnel","elbow","Radial Tunnel Syndrome Pattern","Outer forearm nerve irritation","Aching pain just below the outer elbow that is aggravated by forearm rotation can fit radial-tunnel-type irritation.",{loc_elbow_lateral:3,clue_radial_tunnel:6,onset_gradual:2},undefined,{clue_ulnar_tingling:2}),
  C("elbow-ucl","elbow","Ulnar Collateral Ligament Injury Pattern","Throwing-related inner elbow ligament pain","Medial elbow pain during throwing can reflect UCL stress or injury.",{loc_elbow_medial:4,clue_throwing_medial:6,onset_gradual:1,onset_trauma:1},"Throwing athletes with instability or persistent pain should have an in-person sports/orthopaedic assessment."),
  C("triceps-tendinopathy","elbow","Distal Triceps Tendinopathy","Back-of-elbow triceps tendon pain","Posterior elbow pain linked to pushing and resisted elbow extension can fit distal triceps tendon overload.",{loc_elbow_back:4,clue_triceps_load:6,onset_gradual:2}),
  C("posterolateral-rotatory-instability","elbow","Posterolateral Rotatory Instability Pattern","Outer elbow instability pattern","Clicking, shifting or giving-way at the outer elbow during pushing can fit an instability pattern.",{loc_elbow_lateral:3,clue_elbow_lateral_instability:7,onset_trauma:1},"Recurrent instability deserves specialist clinical assessment."),

  C("scaphoid-injury","wrist-hand","Scaphoid Injury / Fracture Pattern","Possible thumb-side wrist bone injury","Thumb-side wrist pain with snuffbox tenderness after a fall can indicate a scaphoid injury.",{loc_wrist_thumbside:4,clue_wrist_trauma:3,clue_snuffbox_tender:8,onset_trauma:3},"Prompt in-person assessment and imaging consideration are recommended because scaphoid fractures can be occult."),
  C("thumb-mcp-ucl","wrist-hand","Thumb MCP UCL Injury (Skier's/Gamekeeper's Thumb) Pattern","Thumb ligament injury","Pain and instability after the thumb is forced away from the hand can fit an ulnar collateral ligament injury.",{loc_thumb_base:3,clue_thumb_forced_out:7,onset_trauma:3},"Marked thumb instability or weakness with pinch should be assessed promptly."),
  C("intersection-syndrome","wrist-hand","Intersection Syndrome Pattern","Thumb-side dorsal forearm tendon friction","Pain and creaking a few centimetres above the thumb-side wrist can occur with repetitive wrist/thumb loading.",{loc_wrist_thumbside:3,clue_intersection:7,onset_gradual:2}),
  C("wrist-extensor-tendinopathy","wrist-hand","Wrist Extensor Tendinopathy Pattern","Back-of-wrist tendon overload","Dorsal wrist pain aggravated by repeated extension, gripping or hand weight-bearing can fit extensor tendon overload.",{loc_wrist_dorsal:4,clue_dorsal_wrist_load:6,onset_gradual:2},undefined,{onset_trauma:2}),

  C("costochondral-pain","upper-back-ribs","Costochondral / Costosternal Pain Pattern","Tender front-rib/chest-wall pain","Localized pain at a front rib-sternum junction that is reproducible with pressure or movement can be musculoskeletal.",{loc_anterior_rib:5,clue_costosternal_tender:6,clue_deep_breath:1},"Chest symptoms still require appropriate medical screening when features are not clearly musculoskeletal."),
  C("periscapular-myofascial","upper-back-ribs","Periscapular Myofascial Pain","Shoulder-blade muscle overuse pain","Aching around the shoulder blade that builds with posture or repeated arm use commonly reflects local muscular overload.",{loc_between_blades:3,clue_periscapular_overuse:6,clue_posture:2}),
  C("thoracic-facet-pattern","upper-back-ribs","Thoracic Facet / Extension-Rotation Pain Pattern","Focused upper-back joint pain","A focal unilateral thoracic pain aggravated by extension/rotation can fit a local joint-mediated pattern.",{loc_thoracic_midline:1,loc_between_blades:2,clue_thoracic_ext_rotate:6,clue_rotation:2}),

  C("lumbar-spondylolysis","low-back","Lumbar Spondylolysis Pattern","Extension-related stress injury pattern","Extension-related low-back pain in a younger active person can raise suspicion of a pars stress injury.",{clue_extension_young_athlete:7,clue_back_extension:3,age_18_39:2,onset_gradual:1},"Persistent extension-related pain in an athlete deserves clinical assessment; imaging may be considered based on examination and duration."),
  C("spondylolisthesis","low-back","Lumbar Spondylolisthesis Pattern","Vertebral slip-related back pain pattern","Extension-related pain with chronic stiffness or hamstring tightness can be seen with spondylolisthesis.",{clue_hamstring_tight_ext:6,clue_back_extension:3,duration_chronic:2,age_18_39:1,age_40_59:1}),
  C("lumbar-myofascial","low-back","Lumbar Myofascial / Quadratus Lumborum Pain Pattern","Localized lower-back muscle pain","A focal tender/tight area beside the lower spine that reproduces pain can reflect a local muscular pain pattern.",{loc_lowback_side:3,clue_lowback_tender_side:7,clue_sit_bend:1},undefined,{clue_leg_tingling:2,clue_leg_weakness:3}),

  C("iliopsoas-tendinopathy","hip-groin","Iliopsoas Tendinopathy Pattern","Front hip flexor tendon pain","Anterior hip/groin pain aggravated by repeated hip flexion or resisted knee lifting can fit iliopsoas overload.",{loc_hip_groin:3,clue_iliopsoas_load:7,onset_gradual:2}),
  C("internal-snapping-hip","hip-groin","Internal Snapping Hip Pattern","Front-of-hip snapping","A reproducible snapping sensation at the front of the hip during movement can be related to iliopsoas mechanics.",{loc_hip_groin:3,clue_internal_snap:7,age_18_39:2}),
  C("hip-flexor-strain","hip-groin","Hip Flexor Strain","Pulled front-hip muscle","Sudden anterior hip pain during sprinting, kicking or forceful hip flexion can fit a muscle strain.",{loc_hip_groin:3,clue_hip_flexor_sudden:7,onset_trauma:3,duration_acute:1}),
  C("athletic-pubalgia","hip-groin","Athletic Pubalgia / Groin Pain Pattern","Sport-related deep groin/lower-abdominal pain","Groin or lower-abdominal pain with cutting, sit-ups, coughing or twisting can fit an athletic-pubalgia-type pattern.",{loc_hip_groin:3,clue_pubalgia:7,age_18_39:2,onset_gradual:1},"Groin pain has several possible sources; abdominal, hip and adductor assessment may be needed."),

  C("quadriceps-tendinopathy","knee","Quadriceps Tendinopathy","Above-kneecap tendon pain","Pain just above the kneecap with jumping, squatting or resisted knee extension can fit quadriceps tendon overload.",{loc_knee_front:3,clue_quad_tendon:7,onset_gradual:2}),
  C("pes-anserine","knee","Pes Anserine Pain / Bursitis Pattern","Inner upper-shin soft-tissue pain","Tender pain on the inner upper shin below the joint line can fit a pes anserine pain pattern.",{loc_knee_medial:3,clue_pes_anserine:7,onset_gradual:2}),
  C("itb-syndrome","knee","Iliotibial Band Syndrome Pattern","Running-related outer-knee pain","Lateral knee pain that predictably develops during running or cycling can fit ITB-related pain.",{loc_knee_lateral:4,clue_itb_running:7,onset_gradual:2}),
  C("prepatellar-bursitis","knee","Prepatellar Bursitis","Swelling in front of the kneecap","Localized swelling over the front of the kneecap often follows kneeling, pressure or a direct knock.",{loc_knee_front:3,clue_prepatellar_swelling:8}),
  C("patellar-instability","knee","Patellar Instability / Prior Dislocation Pattern","Kneecap slipping pattern","A sense that the kneecap shifts sideways, especially after prior dislocation, can fit patellar instability.",{loc_knee_front:3,clue_patella_slip:8,clue_knee_give:2,age_18_39:1},"Recurrent patellar instability should be assessed in person."),

  C("tibialis-anterior-tendinopathy","lower-leg","Tibialis Anterior Tendinopathy Pattern","Front-shin/ankle tendon overload","Pain at the front of the lower leg or ankle aggravated by dorsiflexion and uphill walking can fit tibialis anterior overload.",{loc_shin_front:4,clue_tib_ant_load:7,onset_gradual:2},undefined,{onset_trauma:2}),
  C("soleus-strain","lower-leg","Soleus Muscle Strain Pattern","Deep calf muscle strain","Deep calf pain during running or bent-knee calf loading can fit soleus muscle injury.",{loc_calf:4,clue_soleus_load:7,onset_trauma:1,onset_gradual:1}),

  C("syndesmotic-sprain","ankle-foot","Syndesmotic (High Ankle) Sprain Pattern","High ankle ligament injury","Pain above the ankle joint after an external-rotation mechanism can fit a syndesmotic sprain.",{loc_ankle_lateral:2,clue_high_ankle:8,onset_trauma:3},"High ankle sprains often need in-person assessment because recovery and stability differ from a routine lateral sprain."),
  C("deltoid-sprain","ankle-foot","Medial Ankle / Deltoid Ligament Sprain Pattern","Inner ankle ligament injury","Medial ankle pain after an eversion mechanism can fit deltoid-ligament injury.",{loc_ankle_medial:4,clue_eversion_injury:8,onset_trauma:3}),
  C("peroneal-tendinopathy","ankle-foot","Peroneal Tendinopathy Pattern","Outer ankle tendon overload","Pain behind the outer ankle bone aggravated by walking, running or eversion can fit peroneal tendon overload.",{loc_ankle_lateral:4,clue_peroneal_load:7,onset_gradual:2}),
  C("tarsal-tunnel","ankle-foot","Tarsal Tunnel Syndrome Pattern","Inner ankle nerve irritation","Burning or tingling near the inner ankle spreading into the sole can fit tibial-nerve compression at the tarsal tunnel.",{loc_ankle_medial:3,clue_tarsal_tunnel:8},"Persistent numbness, weakness or progressive symptoms deserve neurologic assessment."),
  C("turf-toe","ankle-foot","Turf Toe / First MTP Sprain Pattern","Big-toe hyperextension injury","Pain at the big-toe joint after forceful hyperextension can fit a first-MTP sprain.",{loc_bigtoe:5,clue_turf_toe:8,onset_trauma:3}),
  C("anterior-ankle-impingement","ankle-foot","Anterior Ankle Impingement Pattern","Front ankle pinching","Anterior ankle pinching during deep dorsiflexion, squatting or landing can fit an impingement pattern.",{loc_ankle_front:4,clue_anterior_impinge:8,onset_gradual:1}),
  C("posterior-ankle-impingement","ankle-foot","Posterior Ankle Impingement Pattern","Back ankle pinching","Posterior ankle pain aggravated by forced plantarflexion can fit a posterior impingement pattern.",{loc_heel_back:2,clue_posterior_impinge:8,onset_gradual:1}),
  C("hallux-valgus","ankle-foot","Hallux Valgus (Bunion) Pattern","Bunion-related big-toe pain","A painful prominence at the first MTP with the big toe angling toward the others fits hallux valgus.",{loc_bigtoe:4,clue_bunion:9,duration_chronic:1}),
  C("plantar-plate-injury","ankle-foot","Plantar Plate Injury Pattern","Forefoot/toe-joint stabilizer injury","Pain under a lesser toe joint with toe drift or instability can fit plantar-plate injury.",{loc_forefoot:4,clue_plantar_plate:8,onset_gradual:1,onset_trauma:1}),
];

export const allConditionRules: ConditionRule[] = [...conditionRules, ...expandedConditionRules];

export type NeurologicHint = {
  label: string;
  detail: string;
};

export function getNeurologicHint(region: RegionId, selected: Set<string>): NeurologicHint | null {
  if (region === "neck") {
    if (selected.has("clue_c6_dist")) return { label: "Possible C6 distribution", detail: "Thumb/index-side sensory symptoms can fit a C6-pattern, but peripheral nerve and local hand causes can overlap." };
    if (selected.has("clue_c7_dist")) return { label: "Possible C7 distribution", detail: "Middle-finger sensory symptoms can fit a C7-pattern, but this is not enough to identify a nerve root by itself." };
    if (selected.has("clue_c8_dist")) return { label: "Possible C8/T1 distribution", detail: "Ring/little-finger-side symptoms can overlap with C8/T1 and ulnar-nerve problems, so examination is important." };
  }

  if (region === "low-back") {
    if (selected.has("clue_l4_dist")) return { label: "Possible L4 distribution", detail: "Front-knee/medial-shin sensory symptoms can fit an L4-pattern, but clinical neurologic testing is needed." };
    if (selected.has("clue_l5_dist")) return { label: "Possible L5 distribution", detail: "Outer-leg/top-of-foot or big-toe sensory symptoms can fit an L5-pattern, but clinical neurologic testing is needed." };
    if (selected.has("clue_s1_dist")) return { label: "Possible S1 distribution", detail: "Posterior-calf/lateral-foot sensory symptoms can fit an S1-pattern, but clinical neurologic testing is needed." };
  }

  return null;
}

export const featureLabels = new Map<string, string>([
  ...commonHistoryOptions.age,
  ...commonHistoryOptions.onset,
  ...commonHistoryOptions.duration,
  ...regions.flatMap((region) => [...region.locations, ...region.clues]),
].map((item) => [item.id, item.label] as const));

export function scoreConditions(region: RegionId, selected: Set<string>) {
  return allConditionRules
    .filter((condition) => condition.region === region)
    .map((condition) => {
      let score = 0;
      const matches: string[] = [];
      const contradictions: string[] = [];

      for (const [feature, weight] of Object.entries(condition.weights)) {
        if (selected.has(feature)) {
          score += weight;
          const label = featureLabels.get(feature);
          if (label && !matches.includes(label)) matches.push(label);
        }
      }

      for (const [feature, penalty] of Object.entries(condition.penalties ?? {})) {
        if (selected.has(feature)) {
          score -= penalty;
          const label = featureLabels.get(feature);
          if (label && !contradictions.includes(label)) contradictions.push(label);
        }
      }

      return {
        condition,
        score,
        matches: matches.slice(0, 4),
        contradictions: contradictions.slice(0, 3),
      };
    })
    .filter((result) => result.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function compatibilityLabel(score: number) {
  if (score >= 9) return "High compatibility";
  if (score >= 6) return "Moderate compatibility";
  return "Possible";
}


export function getImagingNotice(region: RegionId, selected: Set<string>): ImagingNotice | null {
  if (!selected.has("onset_trauma")) return null;

  if (region === "knee") {
    const criteria: string[] = [];

    if (selected.has("age_60_plus") || selected.has("clue_knee_age55")) {
      criteria.push("Age 55 years or older");
    }
    if (selected.has("clue_knee_fibular_head_tender")) {
      criteria.push("Focal tenderness over the fibular head");
    }
    if (selected.has("clue_knee_patella_isolated_tender")) {
      criteria.push("Isolated bony tenderness over the kneecap");
    }
    if (selected.has("clue_knee_cant_flex90")) {
      criteria.push("Unable to flex the knee to about 90°");
    }
    if (selected.has("clue_knee_no4steps")) {
      criteria.push("Unable to take 4 weight-bearing steps");
    }

    if (criteria.length > 0) {
      return {
        title: "Knee X-ray assessment may be indicated",
        body:
          "Your answers meet one or more Ottawa Knee Rule fracture-screening criteria after an acute injury. This does not mean a fracture is confirmed, but an in-person medical assessment and consideration of knee radiography are appropriate before relying on a routine soft-tissue diagnosis.",
        criteria,
      };
    }
  }

  if (region === "ankle-foot") {
    const ankleLocations = new Set(["loc_ankle_lateral", "loc_ankle_medial", "loc_heel_back", "loc_heel_bottom"]);
    if (!Array.from(ankleLocations).some((item) => selected.has(item))) return null;

    const criteria: string[] = [];

    if (selected.has("clue_ankle_no_weight_initial")) {
      criteria.push("Unable to bear weight immediately after the injury");
    }
    if (selected.has("clue_ankle_no4steps")) {
      criteria.push("Unable to take 4 weight-bearing steps");
    }
    if (selected.has("clue_ankle_malleolus_tender")) {
      criteria.push("Focal bony tenderness over an ankle bone");
    }
    if (selected.has("clue_ankle_hindfoot_tender")) {
      criteria.push("Focal bony tenderness over the hindfoot/heel region");
    }

    if (criteria.length > 0) {
      return {
        title: "Ankle X-ray assessment may be indicated",
        body:
          "Your answers meet one or more Ottawa-style ankle fracture-screening criteria after an acute injury. This does not confirm a fracture, but an in-person assessment and consideration of radiography are appropriate.",
        criteria,
      };
    }
  }

  return null;
}
