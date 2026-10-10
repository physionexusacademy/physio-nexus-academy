import type { ClinicalCase } from "@/lib/clinical-cases";

export const case20261010Myelopathy: ClinicalCase = {
  "slug": "cervical-myelopathy-hand-clumsiness-gait-instability",
  "title": "Hand Clumsiness and Unsteady Gait: Suspected Cervical Myelopathy",
  "specialty": "Musculoskeletal / Neurological Red Flags",
  "difficulty": "Advanced",
  "estimatedTime": "12–15 min",
  "summary": "A simulated neurological red-flag case where progressive cord symptoms demand timely specialist evaluation, not cervical manipulation.",
  "presentation": [
    "A 59-year-old adult reports three months of increasing difficulty fastening buttons, handwriting changes and frequent stumbling.",
    "Neck stiffness is mild, but both hands feel numb at times; symptoms have slowly progressed.",
    "The patient asks whether a neck adjustment can restore normal balance."
  ],
  "keyFindings": [
    "Broad-based unsteady gait and impaired tandem walking.",
    "Reduced finger dexterity, bilateral hand paresthesia and possible hyperreflexia on trained examination.",
    "Progressive functional decline despite relatively little neck pain."
  ],
  "redFlags": [
    "Progressive gait imbalance and bilateral hand dysfunction suggest possible spinal cord compromise.",
    "New bowel or bladder dysfunction, rapidly worsening weakness or severe neurological change requires emergency assessment."
  ],
  "differentials": [
    {
      "diagnosis": "Degenerative cervical myelopathy",
      "reasoning": "Progressive hand clumsiness plus gait imbalance and upper-motor-neuron findings suggest cervical spinal cord involvement."
    },
    {
      "diagnosis": "Peripheral entrapment neuropathy",
      "reasoning": "May explain hand paresthesia but not progressive gait imbalance or upper-motor-neuron signs."
    },
    {
      "diagnosis": "Parkinsonism or another neurological disorder",
      "reasoning": "Can cause gait and dexterity changes, requiring neurological differential assessment rather than assuming cervical pathology."
    }
  ],
  "finalDiagnosis": "Suspected degenerative cervical myelopathy — urgent specialist medical assessment and appropriate cervical MRI evaluation required; not confirmed by physiotherapy examination alone.",
  "reasoning": [
    "The neurological symptom cluster and progression are more concerning than the reported neck pain severity.",
    "Cervical manipulation or aggressive traction should not be used when cord compression is suspected.",
    "Prompt referral is essential; symptom-based exercises should not delay evaluation."
  ],
  "management": [
    "Explain the concern clearly and arrange urgent medical/spinal referral according to local pathway.",
    "Document onset and progression of dexterity, gait, reflex and sensory findings; advise emergency care for rapidly worsening deficits or new sphincter symptoms.",
    "Until specialist review, avoid high-velocity cervical techniques, risky balance tasks and any activity that provokes neurological deterioration.",
    "After definitive medical management, coordinate individualized mobility and upper-limb rehabilitation as indicated."
  ],
  "progression": [
    "Following specialist clearance, set measurable hand-function and gait goals with appropriate fall precautions.",
    "Reassess walking assistance, falls, hand dexterity and neurological status; escalate new deterioration."
  ],
  "learningPoints": [
    "Bilateral hand dysfunction plus gait disturbance is a spinal cord red-flag pattern.",
    "Absence of severe pain does not rule out serious neurological pathology.",
    "Do not offer routine manipulation in suspected cervical myelopathy."
  ],
  "references": [
    {
      "title": "Degenerative Cervical Myelopathy: Diagnosis and Management",
      "organization": "American Family Physician",
      "url": "https://www.aafp.org/pubs/afp/issues/2020/1201/p740.html",
      "year": "2020"
    },
    {
      "title": "Clinical Practice Guideline for the Management of Degenerative Cervical Myelopathy",
      "organization": "Global Spine Journal / AO Spine",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5684840/",
      "year": "2017"
    }
  ],
  "caseType": "Simulated evidence-based case"
};
