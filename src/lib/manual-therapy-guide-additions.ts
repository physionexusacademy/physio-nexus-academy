import type { ManualApplicationGuide } from "@/lib/manual-therapy-guides";

export const manualApplicationGuideAdditions: Record<string, ManualApplicationGuide> = {
  "paivm-ppivm-spinal-assessment": {
    patientPosition: [
      "Use prone, side-lying, sitting or supine according to the region and test. The patient must be relaxed enough that guarding does not dominate the finding.",
      "Support the head, trunk and limbs so the target spinal region is exposed without unnecessary end-range positioning.",
      "In cervical work, establish neurological, vascular and ligamentous safety before applying segmental force."
    ],
    therapistPosition: [
      "Stand or sit so your shoulders stay relaxed and your body weight can control the force rather than isolated finger pressure.",
      "Align yourself with the intended accessory or physiological movement so the force is precise and repeatable."
    ],
    handPlacement: [
      "For PAIVM, contact the relevant spinous process, articular pillar or transverse process using a broad, anatomically safe contact.",
      "For PPIVM, palpate adjacent segments while the other hand guides the physiological movement.",
      "Avoid direct compression over superficial nerves, painful bony prominences, surgical sites or vulnerable tissue."
    ],
    forceDirection: [
      "Central PAIVM: controlled posterior-to-anterior force through the selected spinous process.",
      "Unilateral PAIVM: posterior-to-anterior force through the selected articular pillar or transverse process, modified for region and anatomy.",
      "PPIVM: move the spine through the relevant physiological direction while judging relative motion and symptom response between adjacent segments.",
      "Use lower amplitude within comfortable range for pain-dominant presentations and larger amplitude toward resistance only when stiffness dominates and safety is clear."
    ],
    applicationSteps: [
      "1. Record the comparable sign: pain, active range, symptom distribution or functional limitation.",
      "2. Complete neurological and red-flag screening appropriate to the spinal region.",
      "3. Position the patient and establish a comfortable contact at the suspected level.",
      "4. Apply the lowest useful force and observe pain, resistance, guarding and any distal symptom behavior.",
      "5. Compare adjacent levels only as clinically necessary; do not search for a single 'abnormal segment' as a diagnosis.",
      "6. If a therapeutic trial is indicated, apply a short controlled set matched to irritability.",
      "7. Retest the original comparable sign immediately.",
      "8. Keep the technique only if it produces a meaningful, repeatable benefit and then reinforce the gain with active movement."
    ],
    expectedResponse: [
      "Reduced pain, easier active movement, improved tolerance of the comparable sign or less guarding.",
      "A useful response should be clinically relevant to the patient, not just a change in what the examiner feels."
    ],
    stopCriteria: [
      "New or worsening distal neurological symptoms.",
      "Dizziness, visual disturbance, drop attacks, severe headache or other vascular warning features during cervical work.",
      "Sharp, severe or unfamiliar pain, marked guarding, or repeated worsening after each trial."
    ],
    commonMistakes: [
      "Treating palpated stiffness as proof of a painful or dysfunctional segment.",
      "Using excessive force to make the segment 'move'.",
      "Ignoring poor reliability of stand-alone segmental motion testing.",
      "Failing to compare the manual finding with active movement, neurological examination and function."
    ],
    clinicalExample: [
      "Example: a patient has painful right cervical rotation without neurological deficit. After baseline screening, a low-grade unilateral PA trial at a clinically relevant level is applied. If rotation becomes easier immediately, the therapist follows with active rotation and motor-control work rather than repeatedly mobilizing the segment."
    ]
  },

  "myofascial-decompression-dry-cupping": {
    patientPosition: [
      "Position the target area so skin and superficial tissues are relaxed and fully visible.",
      "Use a position that allows the patient to report symptoms easily and permits immediate cup removal."
    ],
    therapistPosition: [
      "Work close enough to monitor the skin continuously and control the suction precisely.",
      "Keep cups, pump or silicone devices within reach so suction can be reduced immediately if needed."
    ],
    handPlacement: [
      "Place the cup on intact, clean skin away from open wounds, inflamed lesions, superficial thrombosed veins and vulnerable structures.",
      "For moving cupping, maintain one hand on or near the cup to control glide and prevent excessive traction."
    ],
    forceDirection: [
      "Static dry cupping uses perpendicular negative pressure through the cup.",
      "Moving cupping adds a slow glide over the skin while suction remains low enough for comfortable movement.",
      "Active-movement cupping combines conservative suction with selected active movement only when the patient tolerates it."
    ],
    applicationSteps: [
      "1. Screen for anticoagulants, skin fragility, impaired sensation, vascular disease, DVT risk and other contraindications.",
      "2. Explain expected skin marks and obtain informed consent.",
      "3. Test a low level of suction first.",
      "4. Apply one or more cups conservatively without chasing strong discoloration.",
      "5. Monitor pain, skin color, numbness, burning and patient comfort throughout.",
      "6. Remove the cup early if the response is excessive.",
      "7. Recheck movement or function after the application.",
      "8. Use any short-term symptom change to support active exercise or loading."
    ],
    expectedResponse: [
      "Tolerable local pulling sensation, temporary erythema or circular marks, and possibly easier movement.",
      "The desired endpoint is improved function or symptom tolerance, not darker skin discoloration."
    ],
    stopCriteria: [
      "Sharp pain, burning, numbness, blistering, rapidly increasing skin irritation or excessive bruising.",
      "Systemic symptoms, faintness or any concern for vascular compromise."
    ],
    commonMistakes: [
      "Assuming stronger suction is more effective.",
      "Using prolonged application in first-time or sensitive patients.",
      "Presenting bruising or discoloration as evidence that toxins were removed.",
      "Repeating cupping despite no meaningful change in pain or function."
    ],
    clinicalExample: [
      "Example: a patient with non-specific calf tightness has a normal vascular screen and no red flags. A brief low-suction trial is used before active calf loading. If ankle movement feels easier, the session continues with mobility and strengthening rather than extending the cupping dose."
    ]
  },

  "facilitated-positional-release": {
    patientPosition: [
      "Place the patient in a comfortable position that allows the target region to be moved toward relative ease.",
      "Avoid positions that reproduce neurological symptoms, compromise breathing or violate postoperative precautions."
    ],
    therapistPosition: [
      "Stand close to the region so the facilitating force is low-load and easy to control.",
      "Maintain a stable base so the return to neutral is smooth rather than abrupt."
    ],
    handPlacement: [
      "One hand guides the region toward the position of ease while the other controls the facilitating force.",
      "Use broad contacts and avoid direct pressure over painful bony prominences or neurovascular structures."
    ],
    forceDirection: [
      "Move the region away from the restrictive or painful direction toward relative ease.",
      "Add a gentle facilitating force such as compression, distraction or torsion according to the region and training model.",
      "The total force should remain low and should not create pain."
    ],
    applicationSteps: [
      "1. Record the painful or restricted comparable sign.",
      "2. Screen for instability, fracture risk and regional red flags.",
      "3. Position the region toward comfort rather than into the painful barrier.",
      "4. Add the facilitating force gently.",
      "5. Maintain the position briefly while the patient remains relaxed.",
      "6. Release the facilitating force first, then return slowly to neutral.",
      "7. Retest the comparable sign.",
      "8. If improved, reinforce the change with active range, motor control or loading."
    ],
    expectedResponse: [
      "Less guarding, easier movement or reduced pain with the original comparable sign.",
      "The patient should not need to tolerate high discomfort for the technique to work."
    ],
    stopCriteria: [
      "Pain increases during positioning.",
      "Neurological symptoms, dizziness, shortness of breath or apprehension occur.",
      "The technique repeatedly worsens the comparable sign."
    ],
    commonMistakes: [
      "Using excessive facilitating force.",
      "Treating a presumed positional fault instead of the patient's actual functional problem.",
      "Holding too long despite no benefit.",
      "Failing to retest immediately."
    ],
    clinicalExample: [
      "Example: a patient with irritable upper thoracic muscle guarding has pain with rotation. The region is positioned toward ease with a brief gentle facilitating force, then rotation is retested. If motion improves, the therapist follows with active thoracic rotation and strengthening."
    ]
  }
};
