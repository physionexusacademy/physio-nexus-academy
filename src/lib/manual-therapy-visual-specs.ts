export type TechniqueVector =
  | "pa"
  | "ap"
  | "ap-pa"
  | "posterior"
  | "inferior"
  | "traction"
  | "rotation"
  | "lateral"
  | "diagonal"
  | "isometric"
  | "longitudinal"
  | "slider"
  | "friction"
  | "pressure"
  | "multidirectional"
  | "active-lengthening"
  | "drainage";

export type ManualTherapyVisualSpec = {
  slug: string;
  title: string;
  basePublicId: string;
  target: string;
  force: string;
  targetX: number;
  targetY: number;
  vector: TechniqueVector;
  note?: string;
};

const CERVICAL = "pna/clinical-visual-atlas/head-neck/cervical-spine-anatomy";
const CERVICAL_PA = "pna/clinical-skills/manual-therapy/maitland-cervical-pa-mobilization/force-anatomy-v1";
const THORACIC = "tfuqogqnk8lt9qboqpjp";
const LUMBAR_PA = "pna/clinical-skills/manual-therapy/maitland-lumbar-pa-mobilization/force-anatomy-v1";
const QL = "sgsx27zr83dmlznsxfte";

const SHOULDER = "pna/clinical-visual-atlas/shoulder/normal-shoulder-anatomy";
const ROTATOR_CUFF = "pna/clinical-visual-atlas/shoulder/rotator-cuff-anatomy";
const GH_POST = "my7sknkgvla6h8so2sz3";
const GH_INF = "rojfcrp8qhq9fpxzqblj";

const KNEE = "pna/clinical-visual-atlas/knee/knee-osteoarthritis";
const PATELLA = "pna/clinical-visual-atlas/knee/patellofemoral-pain";
const PATELLAR_TENDON = "swvfhjbwbroyj6lysdxi";

const ANKLE = "vdnhp1cc1ytjwsqb3zgp";
const ACHILLES = "pna/clinical-visual-atlas/ankle-foot/achilles-tendon-rupture";

const HIP = "pna/clinical-visual-atlas/hip-groin/hip-osteoarthritis";
const HAMSTRING = "pna/clinical-visual-atlas/thigh/hamstring-strain";
const ELBOW = "pna/clinical-visual-atlas/elbow-forearm/lateral-epicondylalgia";
const WRIST = "pna/clinical-visual-atlas/wrist-hand/carpal-tunnel-syndrome";

function s(
  slug: string,
  title: string,
  basePublicId: string,
  target: string,
  force: string,
  targetX: number,
  targetY: number,
  vector: TechniqueVector,
  note?: string,
): ManualTherapyVisualSpec {
  return { slug, title, basePublicId, target, force, targetX, targetY, vector, note };
}

/**
 * Manual Therapy Visual Lab — real-anatomy plates.
 *
 * These are NOT the old Clinical Visual Atlas cards.
 * Each technique receives a technique-specific target marker and force vector
 * over a real PNA 3D/textbook anatomy source.
 */
export const manualTherapyVisualSpecs: ManualTherapyVisualSpec[] = [
  s("maitland-cervical-pa-mobilization","Cervical Central / Unilateral PA Mobilization",CERVICAL_PA,"Selected cervical spinous process / selected-side articular pillar","Posterior → anterior through the selected segment",55,46,"pa","Central PA stays midline; unilateral PA shifts the target to the selected articular pillar."),
  s("maitland-thoracic-pa-mobilization","Thoracic Central PA Mobilization",THORACIC,"Selected thoracic spinous process","Posterior → anterior through one selected thoracic segment",50,45,"pa"),
  s("maitland-lumbar-pa-mobilization","Lumbar Central / Unilateral PA Mobilization",LUMBAR_PA,"Selected lumbar posterior element","Posterior → anterior through the selected lumbar level",53,47,"pa"),
  s("maitland-shoulder-posterior-glide","Glenohumeral Posterior Glide",GH_POST,"Humeral head relative to the glenoid","Anterior → posterior humeral-head glide",54,50,"posterior"),
  s("maitland-knee-tibiofemoral-glide","Tibiofemoral AP / PA Mobilization",KNEE,"Tibiofemoral joint line","Anterior ↔ posterior tibial translation relative to femur",51,54,"ap-pa"),
  s("maitland-ankle-posterior-talar-glide","Talocrural Posterior Talar Glide",ANKLE,"Talus within the ankle mortise","Anterior → posterior talar glide",52,49,"posterior"),
  s("maitland-wrist-radiocarpal-glide","Radiocarpal Joint Glide",WRIST,"Radiocarpal / proximal carpal joint","Accessory carpal glide selected to improve restricted wrist motion",50,57,"lateral"),

  s("kaltenborn-shoulder-traction","Glenohumeral Traction",SHOULDER,"Humeral head–glenoid joint space","Distraction away from the glenoid",53,51,"traction"),
  s("kaltenborn-hip-traction","Hip Long-Axis / Lateral Traction",HIP,"Femoral head within acetabulum","Long-axis or lateral distraction from acetabulum",51,50,"traction"),
  s("kaltenborn-knee-traction","Tibiofemoral Traction",KNEE,"Tibiofemoral articular surfaces","Longitudinal distraction of tibia from femur",51,55,"traction"),
  s("kaltenborn-ankle-traction","Talocrural Traction",ANKLE,"Talocrural joint","Long-axis distraction through the ankle joint",52,50,"traction"),

  s("mulligan-cervical-rotation-snag","Cervical Rotation SNAG",CERVICAL,"Selected cervical facet / articular pillar","Sustained facet-plane glide + active rotation",56,44,"rotation"),
  s("mulligan-shoulder-mwm","Shoulder Elevation MWM",GH_INF,"Glenohumeral joint during elevation","Corrective accessory glide + active elevation",54,50,"inferior"),
  s("mulligan-elbow-mwm","Lateral Elbow MWM",ELBOW,"Lateral elbow / proximal forearm","Lateral forearm glide + active grip/task",48,49,"lateral"),
  s("mulligan-knee-mwm","Knee MWM During Squat / Step",PATELLA,"Patellofemoral / tibiofemoral load-sensitive region","Corrective knee glide + active squat or step",51,51,"lateral"),
  s("mulligan-ankle-mwm","Weight-Bearing Ankle Dorsiflexion MWM",ANKLE,"Talus in ankle mortise","Posterior talar glide + forward tibial lunge",52,49,"posterior"),
  s("mulligan-wrist-mwm","Wrist MWM With Active Flexion / Extension",WRIST,"Symptomatic carpal joint","Accessory carpal glide + active wrist movement",50,57,"lateral"),

  s("met-cervical-rotation","Cervical Rotation MET",CERVICAL,"Restricted cervical rotator region","Barrier → gentle isometric rotation → relax → new range",55,44,"isometric"),
  s("met-lumbar-pelvic-rotation","Lumbar / Pelvic Rotation MET",LUMBAR_PA,"Lumbar-pelvic rotational barrier","Barrier → gentle isometric → relax → new range",52,52,"isometric"),
  s("met-hamstring","Hamstring MET",HAMSTRING,"Hamstring musculotendinous unit","SLR barrier → gentle isometric → relax → slightly more range",51,50,"isometric"),

  s("mfr-cervical-upper-trapezius","Cervical / Upper Trapezius MFR",CERVICAL,"Upper cervical–shoulder fascial region","Slow sustained fascial load along the selected restriction",58,58,"longitudinal"),
  s("mfr-pectoral-shoulder","Pectoral / Anterior Shoulder MFR",SHOULDER,"Pectoral / anterior shoulder soft tissue","Slow sustained fascial load",61,46,"longitudinal"),
  s("mfr-lumbar-thoracolumbar","Thoracolumbar Fascial MFR",QL,"Thoracolumbar fascia / QL region","Slow sustained longitudinal or oblique fascial load",52,50,"longitudinal"),
  s("mfr-calf","Calf / Posterior Leg MFR",ACHILLES,"Gastrocnemius–soleus–Achilles continuum","Slow sustained longitudinal fascial load",52,48,"longitudinal"),

  s("neurodynamic-median-slider","Median Nerve Slider",WRIST,"Median nerve pathway / carpal tunnel","One end loads while the other unloads in rhythmic alternation",49,55,"slider"),
  s("neurodynamic-ulnar-slider","Ulnar Nerve Slider",ELBOW,"Ulnar nerve corridor around elbow","Alternate proximal and distal loading / unloading",43,48,"slider"),
  s("neurodynamic-radial-slider","Radial Nerve Slider",ELBOW,"Radial nerve-biased lateral elbow / forearm corridor","Alternate distal load ↔ proximal unload",55,48,"slider"),
  s("neurodynamic-sciatic-slider","Sciatic Nerve Slider",HAMSTRING,"Posterior thigh neural corridor","Hip/knee load ↔ ankle/neck unload; rhythmic not sustained",48,52,"slider"),

  s("iastm-forearm-extensors","IASTM for Forearm Extensors",ELBOW,"Common extensor tendon and extensor mass","Short controlled strokes along / across selected tissue",58,47,"friction"),
  s("iastm-hamstring","IASTM for Hamstring Region",HAMSTRING,"Hamstring muscle belly / musculotendinous region","Short controlled strokes along the muscle direction",51,50,"friction"),
  s("iastm-calf","IASTM for Calf",ACHILLES,"Calf–Achilles soft-tissue continuum","Short controlled longitudinal / oblique strokes",52,48,"friction"),

  s("pnf-upper-limb-d1","Upper-Limb D1 Flexion Pattern",ROTATOR_CUFF,"Shoulder girdle / glenohumeral complex","Diagonal low-outside → up-across toward face",54,50,"diagonal"),
  s("pnf-lower-limb-d1","Lower-Limb D1 Flexion Pattern",HIP,"Hip and proximal femur","Diagonal up-and-in through lower-limb pattern",51,50,"diagonal"),

  s("scar-knee-mobilization","Healed Knee Scar Mobilization",PATELLAR_TENDON,"Healed anterior knee scar / skin interface","Small multidirectional skin glides",51,44,"multidirectional"),
  s("cyriax-lateral-elbow-friction","Deep Transverse Friction — Common Extensor Tendon",ELBOW,"Common extensor tendon origin","Small transverse motion across tendon fibers",58,45,"friction"),
  s("scs-upper-trapezius","Upper Trapezius Positional Release",CERVICAL,"Upper trapezius tender-point region","Position toward ease; minimal monitoring pressure; slow return",60,60,"pressure"),
  s("stm-shoulder-posterior-cuff","Posterior Cuff / Periscapular STM",ROTATOR_CUFF,"Posterior rotator cuff / periscapular tissues","Slow broad tissue glide along selected tissue direction",39,50,"longitudinal"),
  s("trigger-point-upper-trapezius","Upper Trapezius Pressure Release",CERVICAL,"Upper trapezius trigger-point region","Gradual localized pressure → hold → slow release",60,60,"pressure"),
  s("manual-cervical-traction","Manual Cervical Traction",CERVICAL,"Cervical intervertebral / foraminal region","Longitudinal cranial distraction",52,45,"traction"),
  s("hvla-thoracic-principles","Thoracic HVLA — Anatomy & Safety Orientation",THORACIC,"Selected thoracic segment","Brief trained thrust through a screened setup",50,45,"pa","Visual shows anatomy and vector only; execution requires training, screening and consent."),
  s("fascial-manipulation-lumbar","Lumbar Fascial Manipulation — Focused Point",QL,"Selected lumbar fascial point","Focused friction / shear at the selected point",55,50,"friction"),
  s("active-release-forearm","Active Release-Style Forearm Extensor Technique",ELBOW,"Forearm extensor muscle-tendon unit","Contact maintained while tissue actively lengthens",60,51,"active-lengthening"),
  s("active-release-calf","Active Release-Style Calf Technique",ACHILLES,"Gastrocnemius–soleus / Achilles continuum","Contact maintained while dorsiflexion lengthens tissue",52,48,"active-lengthening"),
  s("mld-upper-limb","Upper-Limb MLD Principles",SHOULDER,"Upper-limb / axillary drainage region","Very light skin stretch through trained drainage sequence",65,42,"drainage"),
];

export function getManualTherapyVisualSpec(slug: string) {
  return manualTherapyVisualSpecs.find((item) => item.slug === slug);
}
