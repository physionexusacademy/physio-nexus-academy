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

export function regionOfClinicalCase(id:string):ClinicalRegion {
  if(Object.prototype.hasOwnProperty.call(authoredRegions,id)) return authoredRegions[id];
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
