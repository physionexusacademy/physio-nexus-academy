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
    ],
    clues: [
      { id: "clue_posture", label: "Worse after prolonged sitting or slouched posture" },
      { id: "clue_rotation", label: "Worse with trunk twisting/rotation" },
      { id: "clue_deep_breath", label: "Worse with deep breath, cough or sneeze" },
      { id: "clue_rib_tender", label: "Pressing a specific rib/chest-wall spot reproduces pain" },
      { id: "clue_thoracic_trauma", label: "Started after a direct hit/fall onto the ribs" },
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
      { id: "loc_outer_leg", label: "Outer lower leg" },
    ],
    clues: [
      { id: "clue_running_load", label: "Pain is linked to running/jumping load" },
      { id: "clue_shin_diffuse", label: "Tenderness spreads over several centimetres along the shin" },
      { id: "clue_shin_focal", label: "Very focal bone tenderness / hopping is painful" },
      { id: "clue_calf_sudden", label: "Sudden calf pain during sprinting/pushing off" },
      { id: "clue_exertional_tight", label: "Tightness/pain predictably builds during exercise and eases after stopping" },
      { id: "clue_foot_drop", label: "Foot slaps/drops or there is numbness over the outer leg/top of foot" },
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
  C("cervical-radiculopathy","neck","Cervical Radiculopathy","Neck nerve irritation","Neck-to-arm symptoms with numbness, tingling or weakness in a nerve-root pattern.",{loc_neck_to_arm:3,clue_arm_tingling:4,clue_arm_weakness:3,clue_neck_move:1}),
  C("cervicogenic-headache","neck","Cervicogenic Headache","Headache linked to the neck","Headache associated with neck pain and neck movement, often beginning near the upper neck/base of skull.",{loc_base_skull:3,clue_headache:4,clue_neck_move:2}),
  C("whiplash-associated-disorder","neck","Whiplash-Associated Disorder","Neck pain after a sudden jolt","Neck pain/stiffness after rapid acceleration-deceleration such as a road-traffic collision.",{clue_after_whiplash:5,onset_trauma:3,clue_neck_move:1}),
  C("cervical-spondylosis","neck","Cervical Spondylosis / Degenerative Neck Pain","Age-related neck stiffness","Persistent neck stiffness and pain that is more common with increasing age.",{age_40_59:2,age_60_plus:3,duration_chronic:2,clue_neck_age_stiff:3,clue_neck_move:1}),
  C("myofascial-neck-pain","neck","Cervical Myofascial Pain","Tender neck muscle pain","Pain reproduced from locally tender/tight muscle areas.",{clue_trigger_tender:4,loc_neck_side:2,onset_gradual:1}),

  C("rotator-cuff-related","shoulder","Rotator Cuff-Related Shoulder Pain","Common shoulder tendon pain","Outer shoulder/upper-arm pain aggravated by lifting or overhead activity.",{loc_shoulder_lateral:3,clue_overhead:3,clue_painful_arc:3,onset_gradual:2}),
  C("rotator-cuff-tear","shoulder","Rotator Cuff Tear Pattern","Possible shoulder tendon tear","Shoulder pain with notable weakness, particularly after trauma or in older adults.",{clue_shoulder_weakness:4,onset_trauma:2,age_60_plus:2,loc_shoulder_lateral:2,clue_overhead:1},"Prompt assessment is recommended if weakness followed an injury."),
  C("adhesive-capsulitis","shoulder","Adhesive Capsulitis (Frozen Shoulder)","Frozen shoulder pattern","Progressive pain and marked stiffness in several shoulder directions.",{clue_shoulder_stiff_all:5,duration_chronic:2,age_40_59:2,age_60_plus:1}),
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

  C("carpal-tunnel","wrist-hand","Carpal Tunnel Syndrome","Median nerve compression at the wrist","Night-time tingling/numbness in the thumb, index and middle fingers, sometimes relieved by shaking the hand.",{loc_palm_median:4,clue_night_tingling:4,clue_shake_hand:3,clue_hand_weakness:1}),
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
  C("lumbar-radiculopathy","low-back","Lumbar Radiculopathy / Sciatica Pattern","Lower-back nerve irritation","Back-to-leg pain with numbness, tingling and/or weakness.",{loc_leg_radiation:4,clue_leg_tingling:4,clue_leg_weakness:3}),
  C("disc-related-low-back","low-back","Lumbar Disc-Related Pain Pattern","Disc-related lower-back pattern","Back pain commonly aggravated by sitting, bending or lifting, sometimes with leg symptoms.",{clue_sit_bend:4,loc_lowback_central:2,loc_leg_radiation:1,age_18_39:1,age_40_59:1}),
  C("lumbar-stenosis","low-back","Lumbar Spinal Stenosis Pattern","Walking/standing-related nerve pain","Leg/back symptoms that build with standing or walking and ease with sitting or bending forward.",{clue_walk_stand:5,age_60_plus:4,duration_chronic:2,loc_leg_radiation:2}),
  C("lumbar-facet","low-back","Lumbar Facet / Extension-Related Pain Pattern","Back pain worse with arching/standing","Localized low-back pain aggravated by extension or prolonged standing.",{clue_back_extension:4,loc_lowback_side:2,age_40_59:1,age_60_plus:1}),
  C("sij-related","low-back","Sacroiliac Joint-Related Pain Pattern","One-sided buttock/pelvic load pain","Pain around one buttock/posterior pelvis aggravated by transfers, stairs or single-leg loading.",{loc_buttock:4,clue_sij_load:5}),
  C("inflammatory-back-pattern","low-back","Inflammatory Back Pain Pattern","Back pain that may need medical review","Persistent back pain with prolonged morning stiffness and improvement with movement can suggest an inflammatory pattern.",{clue_morning_30:5,duration_chronic:2,age_18_39:2},"Discuss this pattern with a clinician; medical review may be appropriate."),

  C("hip-oa","hip-groin","Hip Osteoarthritis","Hip arthritis pattern","Groin/anterior hip pain with stiffness and difficulty with shoes, socks or walking.",{loc_hip_groin:4,clue_hip_stiff:5,age_60_plus:4,age_40_59:2,duration_chronic:2}),
  C("gtps","hip-groin","Greater Trochanteric Pain Syndrome / Gluteal Tendinopathy","Outer hip tendon pain","Pain over the outer hip, often worse lying on that side, walking or stairs.",{loc_hip_lateral:5,clue_hip_side_sleep:5,onset_gradual:2}),
  C("fai","hip-groin","Femoroacetabular Impingement Syndrome Pattern","Hip impingement-type pattern","Groin pain provoked by deep hip flexion, squatting or pivoting.",{loc_hip_groin:4,clue_hip_flex_rotate:5,age_18_39:2,age_40_59:1}),
  C("hip-labral","hip-groin","Hip Labral Injury Pattern","Deep hip clicking/catching pattern","Deep groin pain with clicking/catching, often during flexion/rotation or sport.",{loc_hip_groin:3,clue_hip_click:5,clue_hip_flex_rotate:2}),
  C("adductor-strain","hip-groin","Adductor Strain / Tendinopathy","Inner-thigh/groin muscle pain","Groin pain linked to running, cutting, kicking or resisted adduction.",{loc_hip_groin:3,clue_adductor:5,onset_trauma:1,onset_gradual:1}),
  C("proximal-hamstring","hip-groin","Proximal Hamstring Tendinopathy","Upper hamstring / sit-bone tendon pain","Pain near the sit-bone with running, hinging or prolonged sitting.",{loc_hamstring_origin:5,clue_hamstring_sit:5,onset_gradual:2}),
  C("deep-gluteal","hip-groin","Deep Gluteal / Sciatic Nerve Irritation Pattern","Buttock-related sciatic irritation","Deep buttock pain with possible tingling down the leg.",{loc_hip_buttock:4,clue_buttock_sciatic:5}),

  C("patellofemoral-pain","knee","Patellofemoral Pain","Kneecap-related pain","Front-of-knee pain aggravated by stairs, squats, running or prolonged sitting.",{loc_knee_front:5,clue_stairs_squat:5,age_18_39:2,onset_gradual:2}),
  C("knee-oa","knee","Knee Osteoarthritis","Knee arthritis pattern","Gradual knee pain and stiffness with walking and daily activity, more common with age.",{clue_knee_stiff_age:5,age_60_plus:4,age_40_59:2,duration_chronic:2}),
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

  C("lateral-ankle-sprain","ankle-foot","Lateral Ankle Sprain","Rolled ankle ligament injury","Outer-ankle pain and swelling after an inversion/rolling injury.",{loc_ankle_lateral:5,clue_inversion:6,onset_trauma:3}),
  C("achilles-tendinopathy","ankle-foot","Achilles Tendinopathy","Achilles tendon overload pain","Load-related pain at the back of the heel/Achilles during running, stairs or calf raises.",{loc_heel_back:5,clue_achilles_load:5,onset_gradual:2}),
  C("achilles-rupture","ankle-foot","Achilles Tendon Rupture Pattern","Possible Achilles tendon rupture","Sudden pop or kick-like sensation with major loss of push-off strength.",{loc_heel_back:4,clue_achilles_pop:7,onset_trauma:3},"Urgent in-person assessment is recommended for a suspected Achilles rupture."),
  C("plantar-heel-pain","ankle-foot","Plantar Heel Pain / Plantar Fasciopathy","Bottom-of-heel first-step pain","Heel pain that is typically worst with the first steps after rest and during prolonged weight-bearing.",{loc_heel_bottom:5,clue_first_steps:6,onset_gradual:2}),
  C("posterior-tibial-tendon","ankle-foot","Posterior Tibial Tendon Dysfunction Pattern","Inner-ankle/arch tendon problem","Medial ankle/arch pain with prolonged walking and possible progressive flattening of the arch.",{loc_ankle_medial:5,clue_medial_arch:6,onset_gradual:2}),
  C("mortons-neuroma","ankle-foot","Morton's Neuroma Pattern","Forefoot nerve irritation","Burning/tingling forefoot pain between the toes, often worse in tight shoes.",{loc_forefoot:4,clue_forefoot_burning:6}),
  C("metatarsalgia","ankle-foot","Metatarsalgia Pattern","Ball-of-foot load pain","Pain under the forefoot with standing, walking or running.",{loc_forefoot:5,clue_forefoot_load:5,onset_gradual:2}),
  C("hallux-rigidus","ankle-foot","Hallux Rigidus","Stiff painful big toe joint","Pain and stiffness at the big-toe joint, especially during push-off.",{loc_bigtoe:5,clue_bigtoe_stiff:6,duration_chronic:1}),
  C("foot-stress-injury","ankle-foot","Foot Stress Injury Pattern","Possible foot bone stress injury","Focal bony pain after a recent rise in walking/running load.",{clue_foot_focal_bone:6,onset_gradual:2,clue_running_load:2},"Reduce impact loading and arrange assessment; stress injuries can require imaging."),
];

export const featureLabels = new Map<string, string>([
  ...commonHistoryOptions.age,
  ...commonHistoryOptions.onset,
  ...commonHistoryOptions.duration,
  ...regions.flatMap((region) => [...region.locations, ...region.clues]),
].map((item) => [item.id, item.label] as const));

export function scoreConditions(region: RegionId, selected: Set<string>) {
  return conditionRules
    .filter((condition) => condition.region === region)
    .map((condition) => {
      let score = 0;
      const matches: string[] = [];

      for (const [feature, weight] of Object.entries(condition.weights)) {
        if (selected.has(feature)) {
          score += weight;
          const label = featureLabels.get(feature);
          if (label && !matches.includes(label)) matches.push(label);
        }
      }

      for (const [feature, penalty] of Object.entries(condition.penalties ?? {})) {
        if (selected.has(feature)) score -= penalty;
      }

      return { condition, score, matches: matches.slice(0, 4) };
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
