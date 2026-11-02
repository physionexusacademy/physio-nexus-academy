/**
 * PNA Clinical Arena regional classification for the existing 200 MSK cases.
 * These are body regions / clinical-focus filters, not additional specialties.
 * All 180 expanded cases and 20 authored starter cases are mapped without
 * changing their clinical stories, findings, or working diagnoses.
 */
export const clinicalRegions = [
  "Spine & Neck",
  "Shoulder",
  "Elbow & Forearm",
  "Wrist & Hand",
  "Hip",
  "Knee",
  "Foot & Ankle",
  "General / Other",
  "Neurological Function",
  "Child Development",
  "Heart & Lungs",
  "Falls & Mobility",
  "Vestibular & Balance",
  "Pelvic Health",
  "Cancer Rehabilitation",
  "ICU & Acute Care",
] as const;

export type ClinicalRegion = typeof clinicalRegions[number];
export const ALL_CLINICAL_REGIONS = "All regions" as const;
export type ClinicalRegionSelection = ClinicalRegion | typeof ALL_CLINICAL_REGIONS;

const authoredRegions:Record<string,ClinicalRegion> = {
  "neck-01":"Spine & Neck",
  "neck-03":"Spine & Neck",
  "back-01":"Spine & Neck",
  "lumbar-03":"Spine & Neck",
  "safety-01":"Spine & Neck",
  "shoulder-01":"Shoulder",
  "shoulder-02":"Shoulder",
  "shoulder-03":"Shoulder",
  "elbow-01":"Elbow & Forearm",
  "hand-01":"Wrist & Hand",
  "wrist-03":"Wrist & Hand",
  "hip-01":"Hip",
  "hip-02":"Hip",
  "knee-01":"Knee",
  "knee-oa-01":"Knee",
  "knee-03":"Knee",
  "redflag-03":"Knee",
  "ankle-01":"Foot & Ankle",
  "ankle-03":"Foot & Ankle",
  "achilles-01":"Foot & Ankle",
};

const multidisciplinaryRegionByPrefix:Record<string,ClinicalRegion>={
 "multi-neuro-stroke-motor": "Neurological Function",
 "multi-neuro-neglect": "Neurological Function",
 "multi-neuro-aphasia": "Neurological Function",
 "multi-neuro-parkinson": "Neurological Function",
 "multi-neuro-ms": "Neurological Function",
 "multi-neuro-sci-incomplete": "Neurological Function",
 "multi-neuro-sci-pressure": "Neurological Function",
 "multi-neuro-tbi": "Neurological Function",
 "multi-neuro-neuropathy": "Neurological Function",
 "multi-neuro-gbs": "Neurological Function",
 "multi-neuro-als": "Neurological Function",
 "multi-neuro-fnd": "Neurological Function",
 "multi-peds-cp-unilateral": "Child Development",
 "multi-peds-cp-bilateral": "Child Development",
 "multi-peds-motor-delay": "Child Development",
 "multi-peds-torticollis": "Child Development",
 "multi-peds-plagio": "Child Development",
 "multi-peds-down": "Child Development",
 "multi-peds-dcd": "Child Development",
 "multi-peds-autism": "Child Development",
 "multi-peds-dmd": "Child Development",
 "multi-peds-jia": "Child Development",
 "multi-peds-bpi": "Child Development",
 "multi-peds-scoliosis": "Child Development",
 "multi-cardio-copd": "Heart & Lungs",
 "multi-cardio-asthma": "Heart & Lungs",
 "multi-cardio-bronchiectasis": "Heart & Lungs",
 "multi-cardio-pneumonia": "Heart & Lungs",
 "multi-cardio-longcovid": "Heart & Lungs",
 "multi-cardio-hf": "Heart & Lungs",
 "multi-cardio-postmi": "Heart & Lungs",
 "multi-cardio-cabg": "Heart & Lungs",
 "multi-cardio-valve": "Heart & Lungs",
 "multi-cardio-ild": "Heart & Lungs",
 "multi-cardio-ph": "Heart & Lungs",
 "multi-cardio-pe": "Heart & Lungs",
 "multi-ger-frailty": "Falls & Mobility",
 "multi-ger-sarcopenia": "Falls & Mobility",
 "multi-ger-hip-fracture": "Falls & Mobility",
 "multi-ger-falls": "Falls & Mobility",
 "multi-ger-osteoporosis": "Falls & Mobility",
 "multi-ger-orthostatic": "Falls & Mobility",
 "multi-vest-posterior": "Vestibular & Balance",
 "multi-vest-horizontal": "Vestibular & Balance",
 "multi-vest-uvh": "Vestibular & Balance",
 "multi-vest-migraine": "Vestibular & Balance",
 "multi-vest-pppd": "Vestibular & Balance",
 "multi-vest-central": "Vestibular & Balance",
 "multi-women-sui": "Pelvic Health",
 "multi-women-uui": "Pelvic Health",
 "multi-women-prolapse": "Pelvic Health",
 "multi-women-diastasis": "Pelvic Health",
 "multi-women-pgp": "Pelvic Health",
 "multi-onc-breast": "Cancer Rehabilitation",
 "multi-onc-cipn": "Cancer Rehabilitation",
 "multi-onc-fatigue": "Cancer Rehabilitation",
 "multi-onc-mscc": "Cancer Rehabilitation",
 "multi-icu-weakness": "ICU & Acute Care",
 "multi-icu-vent": "ICU & Acute Care",
 "multi-icu-unstable": "ICU & Acute Care"
};

export function regionOfClinicalCase(id:string):ClinicalRegion {
  if(Object.prototype.hasOwnProperty.call(authoredRegions,id)) return authoredRegions[id];
  const multiMatch=/^(multi-.+)-[1-5]$/.exec(id);
  if(multiMatch&&Object.prototype.hasOwnProperty.call(multidisciplinaryRegionByPrefix,multiMatch[1])){
    return multidisciplinaryRegionByPrefix[multiMatch[1]];
  }
  const match=/^expanded-(\d{2})-[1-5]$/.exec(id);
  if(!match) return "General / Other";
  const condition=Number(match[1]);
  if(condition>=1&&condition<=10)return "Spine & Neck";
  if(condition>=11&&condition<=15)return "Shoulder";
  if(condition>=16&&condition<=18)return "Elbow & Forearm";
  if(condition>=19&&condition<=21)return "Wrist & Hand";
  if(condition>=22&&condition<=24)return "Hip";
  if(condition>=25&&condition<=30)return "Knee";
  if(condition>=31&&condition<=35)return "Foot & Ankle";
  // Septic-arthritis scenarios involve a potentially serious joint presentation,
  // not a reliably identified body region; do not mislabel them as knee cases.
  return "General / Other";
}
