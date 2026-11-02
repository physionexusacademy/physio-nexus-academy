import type { ClinicalCase } from "./clinical-cases";

export const clinicalCases20260929: ClinicalCase[] = [
  {
    slug: "stroke-new-shoulder-pain-upper-limb-recovery",
    title: "Post-Stroke Shoulder Pain: Protect, Assess or Push Through?",
    specialty: "Neurological",
    difficulty: "Advanced",
    estimatedTime: "12–15 min",
    summary: "A simulated stroke-rehabilitation case requiring differentiation of hemiplegic shoulder pain, poor motor control and urgent new pathology while preserving upper-limb recovery.",
    presentation: [
      "A 67-year-old adult is 5 weeks after a first unilateral ischemic stroke and attends outpatient neurorehabilitation.",
      "The patient has partial voluntary movement in the affected upper limb but reports increasing shoulder pain during dressing and when family members pull the arm during transfers.",
      "Pain is mild at rest and worse with unsupported handling and overhead movement. There is no new facial weakness, speech change or sudden loss of previously recovered movement."
    ],
    keyFindings: [
      "Reduced selective shoulder control and weakness of the affected upper limb.",
      "Pain with poorly controlled elevation and during traction on the arm.",
      "No new acute neurological deterioration compared with the previous rehabilitation visit.",
      "Sensation is altered but present; the patient needs cueing to protect the arm during transfers.",
      "Functional reach and grasp remain limited but are improving with task-specific practice."
    ],
    redFlags: [
      "Any sudden new neurological deficit, severe unexplained headache, altered consciousness or abrupt loss of recovered function requires emergency stroke reassessment.",
      "Marked swelling, erythema, fever, suspected fracture after trauma or signs of upper-limb thrombosis/infection require medical assessment.",
      "Severe disproportionate pain with evolving autonomic/trophic features should prompt consideration of complex regional pain syndrome and multidisciplinary review."
    ],
    differentials: [
      { diagnosis: "Post-stroke shoulder pain related to weakness, poor motor control and handling", reasoning: "The pain is mechanically provoked during unsupported elevation and traction, with clear motor-control impairment and no new neurological deterioration." },
      { diagnosis: "Rotator cuff/subacromial pain", reasoning: "Local shoulder tissue irritation can coexist after stroke, especially when movement and handling are poorly controlled; examination should assess whether local loading reproduces symptoms." },
      { diagnosis: "Complex regional pain syndrome", reasoning: "This becomes more likely if pain is disproportionate and accompanied by sensory, vasomotor, sudomotor/oedema or motor/trophic changes; the current presentation is incomplete for that diagnosis." },
      { diagnosis: "Recurrent stroke", reasoning: "A recurrent stroke must be considered with sudden new neurological loss, but the stable neurological examination and mechanically provoked shoulder pain make it less likely in this presentation." }
    ],
    finalDiagnosis: "Post-stroke shoulder pain associated with impaired upper-limb motor control and unsafe traction/handling, without current evidence of acute recurrent neurological deterioration.",
    reasoning: [
      "Post-stroke shoulder pain is multifactorial; weakness, altered motor control, sensory impairment and handling can all contribute.",
      "The affected arm should not be pulled during transfers. Positioning and handling should protect the shoulder while avoiding unnecessary immobilization.",
      "Pain does not justify abandoning upper-limb practice. The rehabilitation task is to find tolerable movement and loading that supports recovery while monitoring for competing pathology.",
      "Task-specific practice and strengthening are selected according to available voluntary control, symptoms and functional goals."
    ],
    management: [
      "Educate the patient, family and carers not to pull the affected arm during transfers or bed mobility.",
      "Support the arm appropriately in sitting and during mobility while encouraging active use within available control.",
      "Use pain-limited active or active-assisted reaching with scapular and humeral control rather than repeated forceful overhead passive movement.",
      "Continue repetitive task-specific upper-limb practice such as reach, grasp and release at an achievable challenge level.",
      "Add progressive strengthening when the patient can generate controlled movement; abnormal tone alone is not a reason to avoid strengthening.",
      "Address sensory deficits and teach visual checking/protection strategies where needed.",
      "Coordinate medical review if pain escalates, local pathology is suspected or new neurological/systemic signs appear."
    ],
    progression: [
      "Progress reach distance, object weight and repetition only while pain and movement quality remain acceptable.",
      "Reduce external support as active shoulder control improves.",
      "Increase task complexity from supported tabletop activity toward functional dressing, grooming and bimanual tasks.",
      "Reassess pain behaviour, active range, motor control and functional use at each progression stage.",
      "If pain worsens substantially or new swelling, autonomic change or neurological loss develops, stop routine progression and reassess the diagnosis."
    ],
    learningPoints: [
      "Post-stroke shoulder pain is not automatically a rotator cuff diagnosis or a reason to stop using the arm.",
      "Unsafe traction during transfers is preventable and should be corrected immediately.",
      "Protecting the shoulder and promoting active recovery are complementary goals.",
      "New neurological deterioration changes the pathway from rehabilitation to urgent medical assessment.",
      "Functional task practice should continue at a tolerable, progressively challenging dose."
    ],
    references: [
      { title: "Guidelines for Adult Stroke Rehabilitation and Recovery", organization: "American Heart Association / American Stroke Association", year: "2016", url: "https://www.ahajournals.org/doi/10.1161/STR.0000000000000098" }
    ],
    caseType: "Simulated evidence-based case"
  }
];
