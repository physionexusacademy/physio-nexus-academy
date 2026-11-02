import type { ManualTherapyMechanism } from "@/lib/manual-therapy-mechanisms";

export const manualTherapyMechanismAdditions: Record<string, ManualTherapyMechanism> = {
  "paivm-ppivm-spinal-assessment": {
    mechanismMap:
      "Controlled segmental pressure or passive movement → mechanical + sensory input → symptom provocation/modulation → hypothesis testing → active reassessment",
    simpleExplanation:
      "PAIVMs and PPIVMs are most useful when treated as clinical tests and treatment trials rather than as proof that one spinal segment is mechanically abnormal. The manual input loads local tissues and changes sensory input, which may alter pain and movement temporarily. The clinically important question is whether the patient's meaningful sign changes.",
    stepByStep: [
      "1. A controlled accessory or physiological movement is applied.",
      "2. Local skin, joint, muscle and periarticular receptors respond to the mechanical input.",
      "3. The movement can reproduce, reduce or leave symptoms unchanged.",
      "4. The therapist compares this response with active movement, neurological findings and function.",
      "5. A short treatment trial may reduce pain or guarding through multisystem sensory and mechanical effects.",
      "6. The original comparable sign is immediately retested.",
      "7. The finding is retained only as part of the broader clinical hypothesis."
    ],
    physiology: [
      "Accessory loading changes local mechanical stress and afferent input.",
      "Pain modulation may occur through peripheral, spinal and supraspinal mechanisms.",
      "Short-term changes in guarding and movement tolerance can occur.",
      "Manual perception of segmental stiffness has limited stand-alone reliability, so it should not be overinterpreted."
    ],
    clinicalTranslation: [
      "Use PAIVM/PPIVM to add information, not to replace history, neurological screening and active movement testing.",
      "A positive treatment response is more clinically useful than simply finding a level that feels stiff.",
      "When improvement occurs, move quickly into active movement and self-management."
    ],
    myths: [
      "A palpably stiff segment is not proof that it is the pain generator.",
      "The examiner cannot reliably identify a vertebra that is 'out of place' by PAIVM or PPIVM.",
      "Manual treatment does not permanently reposition spinal segments."
    ],
    evidenceNote:
      "Research on stand-alone segmental motion testing shows limited reliability and diagnostic validity. Use these techniques as part of a multi-factor clinical examination and judge treatment value by meaningful reassessment."
  },

  "myofascial-decompression-dry-cupping": {
    mechanismMap:
      "Negative pressure → skin/superficial tissue deformation + strong sensory input → local vascular/sensory changes → possible short-term symptom modulation",
    simpleExplanation:
      "Dry cupping applies negative pressure rather than compression. This changes skin and superficial tissue shape, produces intense sensory input and temporarily changes local blood flow. Any symptom benefit is more plausibly explained by short-term neurophysiological and local mechanical effects than by toxin removal or permanent fascial release.",
    stepByStep: [
      "1. Negative pressure lifts skin and superficial soft tissue into the cup.",
      "2. Local tissue deformation activates mechanosensitive and nociceptive receptors.",
      "3. Local microcirculatory and sensory changes occur.",
      "4. Pain perception or movement tolerance may change temporarily.",
      "5. The patient may then tolerate movement or exercise more easily.",
      "6. The response should be reassessed rather than assumed."
    ],
    physiology: [
      "Local hyperemia and superficial tissue deformation are expected.",
      "Strong sensory input can alter pain perception temporarily.",
      "Skin discoloration reflects local vascular effects and is not evidence of toxin removal.",
      "Evidence does not establish permanent fascial remodeling as the main mechanism."
    ],
    clinicalTranslation: [
      "Use conservative suction and short exposure.",
      "Treat it as an optional adjunct, not a primary rehabilitation strategy.",
      "Only continue if it helps a meaningful movement or function and does not create excessive skin trauma."
    ],
    myths: [
      "Darker marks do not mean more toxins were removed.",
      "More suction is not automatically more effective.",
      "Cupping does not replace progressive exercise, loading or medical assessment."
    ],
    evidenceNote:
      "Recent placebo-controlled evidence for dry cupping in musculoskeletal pain remains very uncertain. If used, it should be a preference-sensitive adjunct after higher-certainty rehabilitation options are considered."
  },

  "facilitated-positional-release": {
    mechanismMap:
      "Position of ease + low facilitating force → altered proprioceptive/sensory input + reduced protective activity → short-term movement change",
    simpleExplanation:
      "FPR places the region in a comfortable shortened or neutral position and adds a low facilitating force. The technique may reduce guarding and change pain or movement through altered sensory input and reduced threat. A permanent structural correction has not been demonstrated.",
    stepByStep: [
      "1. The symptomatic region is moved away from the painful barrier.",
      "2. A low facilitating force is added.",
      "3. Sensory input from muscle, joint and skin changes while the patient remains relaxed.",
      "4. Protective muscle activity may decrease temporarily.",
      "5. The region returns slowly to neutral.",
      "6. Pain and movement are retested.",
      "7. Any gain is reinforced actively."
    ],
    physiology: [
      "Comfortable positioning can reduce threat and protective co-contraction.",
      "Low-load compression or torsion provides additional proprioceptive input.",
      "Short-term changes in stretch tolerance and pain sensitivity may occur.",
      "The exact mechanism has not been established."
    ],
    clinicalTranslation: [
      "Choose FPR only when low-irritability positioning is safe and comfortable.",
      "Use brief, low-force application and judge value by reassessment.",
      "Follow immediately with active movement so the patient owns the change."
    ],
    myths: [
      "FPR does not prove or correct a vertebral positional fault.",
      "More compression or torsion does not mean a stronger therapeutic effect.",
      "A passive improvement that cannot be carried into active function has limited value."
    ],
    evidenceNote:
      "Technique-specific clinical evidence is limited. FPR is best presented as a low-force adjunct within a broader evidence-informed rehabilitation plan rather than as a stand-alone corrective treatment."
  }
};
