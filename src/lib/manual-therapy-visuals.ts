export type ManualTherapyVisual = {
  id: string;
  title: string;
  path: string;
  alt: string;
  caption?: string;
  target?: string;
  force?: string;
};

const CERVICAL = "pna/clinical-visual-atlas/head-neck/cervical-spine-anatomy";
const CERVICAL_PA = "pna/clinical-skills/manual-therapy/maitland-cervical-pa-mobilization/force-anatomy-v1";
const THORACIC_PARASPINALS = "tfuqogqnk8lt9qboqpjp";
const LUMBAR_PA = "pna/clinical-skills/manual-therapy/maitland-lumbar-pa-mobilization/force-anatomy-v1";
const QL = "sgsx27zr83dmlznsxfte";

const SHOULDER_NORMAL = "pna/clinical-visual-atlas/shoulder/normal-shoulder-anatomy";
const SHOULDER_ROTATOR_CUFF = "pna/clinical-visual-atlas/shoulder/rotator-cuff-anatomy";
const SHOULDER_BURSA = "pna/clinical-visual-atlas/shoulder/subacromial-bursitis-impingement";
const SHOULDER_INSTABILITY = "pna/clinical-visual-atlas/shoulder/anterior-shoulder-instability";
const SHOULDER_POSTERIOR_GLIDE = "my7sknkgvla6h8so2sz3";
const SHOULDER_INFERIOR_GLIDE = "rojfcrp8qhq9fpxzqblj";
const SHOULDER_ANTERIOR_GLIDE = "uq8p6nwhoefxqzirzsxm";

const KNEE_OA = "pna/clinical-visual-atlas/knee/knee-osteoarthritis";
const KNEE_PF = "pna/clinical-visual-atlas/knee/patellofemoral-pain";
const PATELLAR_TENDON = "swvfhjbwbroyj6lysdxi";

const ANKLE_TALAR_GLIDE = "vdnhp1cc1ytjwsqb3zgp";
const ANKLE_LATERAL = "pna/clinical-visual-atlas/ankle-foot/lateral-ankle-sprain";
const ACHILLES = "pna/clinical-visual-atlas/ankle-foot/achilles-tendon-rupture";

const HIP_FAIS = "pna/clinical-visual-atlas/hip-groin/fais";
const HIP_OA = "pna/clinical-visual-atlas/hip-groin/hip-osteoarthritis";
const HAMSTRING = "pna/clinical-visual-atlas/thigh/hamstring-strain";

const ELBOW = "pna/clinical-visual-atlas/elbow-forearm/lateral-epicondylalgia";
const WRIST = "pna/clinical-visual-atlas/wrist-hand/carpal-tunnel-syndrome";

function v(
  id: string,
  title: string,
  path: string,
  target: string,
  force: string,
  caption: string
): ManualTherapyVisual {
  return {
    id,
    title,
    path,
    target,
    force,
    caption,
    alt: `${title}. Real clinical anatomy view highlighting ${target}. Force or movement cue: ${force}.`,
  };
}

/**
 * PNA Manual Therapy Visual Lab
 *
 * REAL-ASSET RULE:
 * - no generic stick/body graphics
 * - no therapist/person
 * - only real 3D / textbook-style PNA anatomy assets
 * - technique-specific target + force cue stays attached to each image
 * - existing theory pages remain untouched
 */
export const manualTherapyVisuals: Partial<Record<string, ManualTherapyVisual[]>> = {
  "maitland-cervical-pa-mobilization": [
    v("central-pa","Central / Unilateral PA Anatomy",CERVICAL_PA,"Selected cervical spinous process or articular pillar","Posterior → anterior through the selected segment","Use the central spinous process for central PA; move the target to the selected-side articular pillar for unilateral PA."),
    v("cervical-orientation","Cervical Segment Orientation",CERVICAL,"Facet joints, discs and neural foramina at the selected level","Segment-specific PA loading; avoid broad whole-neck compression","Use this view to orient the selected level before applying a local accessory glide."),
  ],
  "maitland-thoracic-pa-mobilization": [
    v("thoracic-pa","Thoracic Central PA Anatomy",THORACIC_PARASPINALS,"Selected thoracic spinous process / posterior segment","Posterior → anterior, localized to the selected thoracic segment","The thoracic visual is kept anatomy-first: target one segment rather than a broad chest-wall push."),
  ],
  "maitland-lumbar-pa-mobilization": [
    v("lumbar-pa","Lumbar Central / Unilateral PA Anatomy",LUMBAR_PA,"Selected lumbar spinous process or unilateral posterior element","Posterior → anterior through the selected lumbar level","Central PA uses the spinous process; unilateral PA shifts the target to the selected posterior element."),
    v("lumbar-soft-tissue","Lumbar Soft-Tissue Orientation",QL,"Quadratus lumborum and posterolateral lumbar soft tissue","Technique force remains local to the chosen segment or tissue target","Useful regional orientation when symptoms include posterolateral lumbar soft-tissue sensitivity."),
  ],
  "maitland-shoulder-posterior-glide": [
    v("gh-post","Glenohumeral Posterior Glide",SHOULDER_POSTERIOR_GLIDE,"Humeral head relative to the glenoid","Anterior → posterior humeral-head glide","A real 3D glenohumeral glide asset showing the treatment direction without a therapist scene."),
    v("shoulder-anatomy","Shoulder Joint Orientation",SHOULDER_NORMAL,"Glenohumeral joint, labrum and humeral head","Posterior translation of the humeral head while the scapula remains controlled","Use the joint anatomy to visualize the humeral head moving relative to the glenoid."),
  ],
  "maitland-knee-tibiofemoral-glide": [
    v("knee-ap-pa","Tibiofemoral AP / PA Mobilization",KNEE_OA,"Tibiofemoral joint line","Anterior ↔ posterior tibial translation relative to the femur","Use the joint line as the target and choose AP or PA direction according to the movement being reassessed."),
  ],
  "maitland-ankle-posterior-talar-glide": [
    v("talar-post","Posterior Talar Glide",ANKLE_TALAR_GLIDE,"Talus within the ankle mortise","Anterior → posterior talar glide","This is the PNA real 3D posterior talar glide asset used to visualize dorsiflexion-focused mobilization."),
    v("ankle-orientation","Ankle Joint Orientation",ANKLE_LATERAL,"Talocrural region and lateral ankle structures","Posterior talar translation while tibia/fibula remain controlled","Regional anatomy view for locating the talocrural joint before applying the glide."),
  ],

  "kaltenborn-shoulder-traction": [
    v("shoulder-traction","Glenohumeral Traction",SHOULDER_NORMAL,"Humeral head–glenoid joint space","Distraction away from the glenoid, perpendicular to the treatment plane","Visualize separation of the articular surfaces rather than a translatory posterior glide."),
    v("inferior-reference","Inferior Glide Reference",SHOULDER_INFERIOR_GLIDE,"Inferior capsular / humeral-head relationship","Inferior glide is a separate direction from pure traction","Included to distinguish joint distraction from an inferior translatory glide."),
  ],
  "kaltenborn-hip-traction": [
    v("hip-traction","Hip Long-Axis / Lateral Traction",HIP_OA,"Femoral head within the acetabulum","Long-axis distraction and, when selected, lateral distraction","The femoral head is distracted from the acetabulum without implying a rotational glide."),
  ],
  "kaltenborn-knee-traction": [
    v("knee-traction","Tibiofemoral Traction",KNEE_OA,"Tibiofemoral articular surfaces","Longitudinal distraction of tibia from femur","Traction separates the joint surfaces; it is different from AP/PA translation."),
  ],
  "kaltenborn-ankle-traction": [
    v("ankle-traction","Talocrural Traction",ANKLE_TALAR_GLIDE,"Talocrural joint","Long-axis distraction through the ankle joint","Use distraction rather than posterior translation when the goal is joint separation."),
  ],

  "mulligan-cervical-rotation-snag": [
    v("snag","Cervical Rotation SNAG",CERVICAL,"Selected cervical facet / articular pillar","Sustained facet-plane glide + active cervical rotation","The accessory glide is sustained while the patient actively rotates; the vectors are not the same as a central PA."),
  ],
  "mulligan-shoulder-mwm": [
    v("shoulder-mwm","Shoulder Elevation MWM",SHOULDER_INFERIOR_GLIDE,"Glenohumeral joint during active elevation","Corrective accessory glide + active elevation","The visual emphasizes a real glenohumeral glide paired with active movement rather than a passive-only mobilization."),
    v("shoulder-elevation","Shoulder Elevation Anatomy",SHOULDER_ROTATOR_CUFF,"Rotator cuff and humeral head during elevation","Active elevation while the selected corrective glide is maintained","Use the cuff/joint anatomy to understand why the corrective glide must remain pain-free."),
  ],
  "mulligan-elbow-mwm": [
    v("elbow-mwm","Lateral Elbow MWM",ELBOW,"Lateral elbow / proximal forearm relationship","Lateral forearm glide + active grip or task","The accessory glide is maintained only if the comparable grip/task improves immediately."),
  ],
  "mulligan-knee-mwm": [
    v("knee-mwm","Knee MWM During Squat / Step",KNEE_PF,"Patellofemoral and tibiofemoral load-sensitive region","Corrective knee glide + active squat/step","The selected glide is paired with the functional task and retained only when it improves the comparable sign."),
  ],
  "mulligan-ankle-mwm": [
    v("ankle-mwm","Weight-Bearing Ankle Dorsiflexion MWM",ANKLE_TALAR_GLIDE,"Talus in the ankle mortise","Posterior talar glide + forward tibial lunge","The heel stays down while the tibia advances and the talus is guided posteriorly."),
  ],

  "met-cervical-rotation": [
    v("cervical-met","Cervical Rotation MET",CERVICAL,"Restricted cervical segment / surrounding rotator tissues","Move to barrier → gentle isometric rotation → relax → new range","The visual target is the restricted cervical region; force is a low-intensity isometric effort, not a joint thrust."),
  ],
  "met-lumbar-pelvic-rotation": [
    v("lumbar-met","Lumbar / Pelvic Rotation MET",LUMBAR_PA,"Lumbar-pelvic rotational barrier","Move to rotational barrier → gentle isometric → relax → new range","Use the lumbar anatomy to orient the rotational barrier before the low-load isometric contraction."),
    v("ql-met","Posterolateral Lumbar Soft Tissue",QL,"Quadratus lumborum / posterolateral lumbar region","Low-load isometric effort followed by controlled repositioning","A real soft-tissue view for the regional muscular contribution to lumbar-pelvic asymmetry."),
  ],
  "met-hamstring": [
    v("hamstring-met","Hamstring MET",HAMSTRING,"Hamstring musculotendinous unit","SLR barrier → gentle downward isometric → relax → slightly more range","The highlighted hamstring anatomy is used to visualize the tissue being loaded during the isometric phase."),
  ],

  "mfr-cervical-upper-trapezius": [
    v("cervical-mfr","Cervical / Upper Trapezius MFR",CERVICAL,"Upper cervical–shoulder soft-tissue interface","Slow sustained fascial load in the selected tissue direction","The anatomy view keeps the cervical region real while the technique cue remains a slow sustained load rather than an oscillatory joint glide."),
  ],
  "mfr-pectoral-shoulder": [
    v("pectoral-mfr","Pectoral / Anterior Shoulder MFR",SHOULDER_NORMAL,"Pectoral/anterior shoulder soft-tissue region","Slow sustained tissue load along the restricted fascial direction","The joint and anterior shoulder anatomy provide the reference for a broad, non-thrust soft-tissue load."),
  ],
  "mfr-lumbar-thoracolumbar": [
    v("thoracolumbar-mfr","Thoracolumbar Fascial MFR",QL,"Thoracolumbar fascia / posterolateral lumbar region","Slow sustained longitudinal or oblique fascial load","The QL/posterolateral lumbar asset provides the real tissue orientation for the release direction."),
  ],
  "mfr-calf": [
    v("calf-mfr","Calf / Posterior Leg MFR",ACHILLES,"Gastrocnemius–soleus–Achilles continuum","Slow sustained longitudinal fascial load","Use the posterior lower-leg anatomy to visualize force transmission from calf to Achilles/calcaneus."),
  ],

  "neurodynamic-median-slider": [
    v("median-prox","Median Slider — Proximal Orientation",CERVICAL,"Cervical nerve-root / brachial plexus origin region","One end loads while the other unloads","Proximal neural anatomy orientation."),
    v("median-distal","Median Slider — Distal Orientation",WRIST,"Median nerve through the carpal tunnel","Alternate distal load ↔ proximal unload","Distal real anatomy view showing the median nerve pathway at the wrist."),
  ],
  "neurodynamic-ulnar-slider": [
    v("ulnar-prox","Ulnar Slider — Proximal Orientation",CERVICAL,"Lower cervical / brachial plexus origin region","Alternate shoulder/elbow/wrist loading ↔ unloading","Proximal orientation for the neural pathway."),
    v("ulnar-elbow","Ulnar Slider — Elbow Corridor",ELBOW,"Medial-to-posteromedial elbow neural corridor","Alternate elbow/wrist loading ↔ proximal unloading","Real elbow anatomy used to orient the nerve corridor; slider dosage remains symptom-guided."),
  ],
  "neurodynamic-radial-slider": [
    v("radial-prox","Radial Slider — Proximal Orientation",CERVICAL,"Cervical / brachial plexus origin region","Distal load ↔ proximal unload","Proximal neural orientation."),
    v("radial-elbow","Radial Slider — Lateral Elbow / Forearm Corridor",ELBOW,"Lateral elbow and proximal forearm neural corridor","Alternating distal and proximal loading","Real lateral elbow anatomy provides the regional corridor for the radial-nerve biased slider."),
  ],
  "neurodynamic-sciatic-slider": [
    v("sciatic-prox","Sciatic Slider — Proximal Orientation",LUMBAR_PA,"Lumbosacral neural origin region","Hip/knee load ↔ ankle/neck unload","Proximal lumbosacral orientation for the slider."),
    v("sciatic-thigh","Sciatic Slider — Posterior Thigh Corridor",HAMSTRING,"Posterior thigh neural corridor adjacent to hamstrings","Alternate knee/hip and ankle loading","Posterior-thigh anatomy helps visualize the corridor while avoiding a sustained stretch."),
  ],

  "iastm-forearm-extensors": [
    v("iastm-extensors","IASTM — Forearm Extensors",ELBOW,"Common extensor tendon and extensor muscle mass","Short controlled strokes along / across the selected tissue","The real lateral elbow anatomy keeps the treatment focused on the extensor origin rather than the joint line."),
  ],
  "iastm-hamstring": [
    v("iastm-hamstring","IASTM — Hamstring Region",HAMSTRING,"Hamstring muscle belly / musculotendinous region","Short controlled strokes along the selected muscle direction","Use the real posterior-thigh tissue anatomy to guide the treatment corridor."),
  ],
  "iastm-calf": [
    v("iastm-calf","IASTM — Calf",ACHILLES,"Calf–Achilles soft-tissue continuum","Short controlled longitudinal / oblique strokes","The treatment remains within the posterior lower-leg soft tissues and avoids aggressive pressure over vulnerable structures."),
  ],

  "pnf-upper-limb-d1": [
    v("pnf-ul-d1","Upper-Limb D1 Flexion Pattern",SHOULDER_ROTATOR_CUFF,"Shoulder girdle and glenohumeral complex","Diagonal low/outside → up/across toward the face","Real shoulder anatomy provides the proximal reference for the multi-joint diagonal."),
  ],
  "pnf-lower-limb-d1": [
    v("pnf-ll-d1","Lower-Limb D1 Flexion Pattern",HIP_FAIS,"Hip and proximal femur","Diagonal up-and-in through the lower-limb pattern","The hip is the proximal driver of the diagonal; the pattern continues through knee, ankle and foot."),
    v("pnf-knee","Lower-Limb D1 — Knee Orientation",KNEE_OA,"Knee within the diagonal chain","Coordinated flexion pattern during the diagonal","Use the knee anatomy as a secondary reference within the full pattern."),
  ],

  "scar-knee-mobilization": [
    v("scar-knee","Healed Knee Scar Mobilization",PATELLAR_TENDON,"Healed anterior knee scar / skin interface","Small multidirectional skin glides","The real anterior knee anatomy provides the tissue context; mobilization is only for a fully healed scar."),
  ],
  "mulligan-wrist-mwm": [
    v("wrist-mwm","Wrist MWM With Active Flexion / Extension",WRIST,"Carpal region / symptomatic wrist joint","Accessory carpal glide + active flexion or extension","The accessory glide is paired with active movement and retained only if the movement becomes easier or less painful."),
  ],
  "cyriax-lateral-elbow-friction": [
    v("cyriax-elbow","Deep Transverse Friction — Common Extensor Tendon",ELBOW,"Common extensor tendon origin at the lateral epicondyle","Small transverse motion across the tendon fibers","Real tendon-origin anatomy is essential so the friction remains precise rather than broadly rubbing the lateral elbow."),
  ],
  "scs-upper-trapezius": [
    v("scs-upper-trap","Upper Trapezius Positional Release",CERVICAL,"Upper trapezius / cervical-shoulder tender-point region","Position toward ease; minimal monitoring pressure; slow return","The technique is positional rather than a forceful manual glide."),
  ],
  "stm-shoulder-posterior-cuff": [
    v("posterior-cuff-stm","Posterior Cuff / Periscapular Soft-Tissue Mobilization",SHOULDER_ROTATOR_CUFF,"Posterior rotator cuff / periscapular tissues","Slow broad tissue glide along the selected soft-tissue direction","The cuff anatomy keeps the visual focused on posterior shoulder soft tissue rather than the anterior joint."),
  ],
  "trigger-point-upper-trapezius": [
    v("upper-trap-pressure","Upper Trapezius Pressure Release",CERVICAL,"Upper trapezius trigger-point region","Gradual localized pressure → tolerable hold → slow release","Pressure is local and response-guided; it is not a cervical joint mobilization."),
  ],
  "manual-cervical-traction": [
    v("cervical-traction","Manual Cervical Traction",CERVICAL,"Cervical spine / intervertebral and foraminal region","Longitudinal cranial distraction","The visual emphasizes longitudinal separation rather than PA translation or rotation."),
  ],
  "hvla-thoracic-principles": [
    v("thoracic-hvla","Thoracic HVLA — Anatomy & Safety Orientation",THORACIC_PARASPINALS,"Selected thoracic segment","Brief trained thrust through a carefully screened setup","Visual Lab shows anatomy and direction only; technique execution requires appropriate training, screening and consent."),
  ],
  "fascial-manipulation-lumbar": [
    v("fascial-lumbar","Lumbar Fascial Manipulation — Focused Point",QL,"Selected lumbar fascial point","Focused friction / shear at the selected point","The real QL/posterolateral lumbar anatomy provides the regional reference for point selection."),
  ],
  "active-release-forearm": [
    v("active-forearm","Active Release-Style Forearm Extensor Technique",ELBOW,"Forearm extensor muscle-tendon unit","Contact maintained while the tissue actively lengthens","The target is the extensor tissue corridor rather than the elbow joint itself."),
  ],
  "active-release-calf": [
    v("active-calf","Active Release-Style Calf Technique",ACHILLES,"Gastrocnemius–soleus / Achilles continuum","Contact maintained while ankle dorsiflexion actively lengthens the tissue","The posterior lower-leg anatomy shows the tissue line being lengthened."),
  ],
  "mld-upper-limb": [
    v("mld-shoulder","Upper-Limb MLD — Proximal Anatomy Orientation",SHOULDER_NORMAL,"Upper-limb / axillary and shoulder region","Very light proximal-to-distal / drainage-sequence skin stretch according to trained pathway","The visual is anatomical orientation only; post-cancer lymphedema care should follow trained MLD and compression protocols."),
  ],
};

export function getManualTherapyVisuals(slug: string) {
  return manualTherapyVisuals[slug] ?? [];
}
