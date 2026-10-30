export type LicensedMSKIllustration = { file: string; title: string; region: "Head & Neck" | "Spine" | "Shoulder" | "Elbow & Forearm" | "Wrist & Hand" | "Hip & Groin" | "Knee" | "Ankle & Foot"; source: string; license: string };
const source = "https://www.injurymap.com/free-human-anatomy-illustrations";
const cc = "CC BY-SA 4.0";
export const licensedMSKIllustrations: Record<string, LicensedMSKIllustration> = {
  "mechanical-neck-pain": { file:"Neck_Anatomy.svg", title:"Neck anatomy", region:"Head & Neck", source, license:cc },
  "whiplash-associated-disorder": { file:"Cervicothoracic_junction.svg", title:"Cervicothoracic junction", region:"Head & Neck", source, license:cc },
  "non-specific-low-back-pain": { file:"Healthy_spine.svg", title:"Healthy spine — anatomical orientation", region:"Spine", source, license:cc },
  "lumbar-radiculopathy": { file:"Back_pain_with_radiation_into_legs.svg", title:"Back pain with leg radiation", region:"Spine", source, license:cc },
  "thoracic-spine-pain": { file:"Upper_back_muscles.svg", title:"Upper-back muscle anatomy", region:"Spine", source, license:cc },
  "adhesive-capsulitis": { file:"Shoulder_anatomy.svg", title:"Shoulder anatomy", region:"Shoulder", source, license:cc },
  "acromioclavicular-joint-injury": { file:"Shoulder_anatomy.svg", title:"Shoulder anatomy", region:"Shoulder", source, license:cc },
  "long-head-biceps-tendinopathy": { file:"Rotator_cuff_muscles.svg", title:"Rotator cuff and shoulder muscle anatomy", region:"Shoulder", source, license:cc },
  "medial-epicondylalgia": { file:"Medial_epicondylitis.svg", title:"Elbow anatomy", region:"Elbow & Forearm", source, license:cc },
  "de-quervain-tenosynovitis": { file:"Wrist_pain.svg", title:"Wrist anatomy and pain region", region:"Wrist & Hand", source, license:cc },
  "trigger-finger": { file:"Wrist_pain.svg", title:"Wrist and hand region", region:"Wrist & Hand", source, license:cc },
  "greater-trochanteric-pain-syndrome": { file:"Hip_anatomy.svg", title:"Hip anatomy", region:"Hip & Groin", source, license:cc },
  "gluteal-tendinopathy": { file:"Hip_anatomy.svg", title:"Hip anatomy", region:"Hip & Groin", source, license:cc },
  "adductor-related-groin-pain": { file:"Hip_and_groin_pain.svg", title:"Hip and groin region", region:"Hip & Groin", source, license:cc },
  "patellofemoral-pain": { file:"Knee_anatomy.svg", title:"Knee anatomy", region:"Knee", source, license:cc },
  "patellar-tendinopathy": { file:"Quadriceps_tendon.svg", title:"Quadriceps and patellar extensor mechanism", region:"Knee", source, license:cc },
  "pcl-injury": { file:"Knee_injuries.svg", title:"Knee ligament injury overview", region:"Knee", source, license:cc },
  "mcl-injury": { file:"Knee_injuries.svg", title:"Knee ligament injury overview", region:"Knee", source, license:cc },
  "plantar-heel-pain": { file:"Plantar_fascia.svg", title:"Plantar fascia anatomy", region:"Ankle & Foot", source, license:cc },
  "achilles-tendinopathy": { file:"Achilles_tendonitis.svg", title:"Achilles tendon illustration", region:"Ankle & Foot", source, license:cc },
  "posterior-tibial-tendon-dysfunction": { file:"Pronation_of_the_foot.svg", title:"Foot posture and pronation", region:"Ankle & Foot", source, license:cc },
  "tibial-stress-injury": { file:"Shin_splints.svg", title:"Shin pain region", region:"Ankle & Foot", source, license:cc },
};
export function getLicensedMSKImageUrl(slug: string) {
  const item = licensedMSKIllustrations[slug];
  return item ? "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + item.file : "";
}
