export type ManualTherapyExpertProfile = {
  variants: string[];
  selectionRules: string[];
  technicalVariables: string[];
  progressionRegression: string[];
  integration: string[];
  documentation: string[];
  evidencePosition: string[];
};

export const manualTherapyExpertProfiles: Record<string, ManualTherapyExpertProfile> = {
  "maitland-joint-mobilization": {
    variants: [
      "Grades I–IV oscillatory mobilization; Grade V belongs to thrust manipulation and should not be casually grouped with non-thrust mobilization.",
      "Central, unilateral and direction-specific accessory glides vary by joint and region.",
      "Treatment can be pain-dominant, stiffness-dominant or movement-specific depending on irritability and the comparable sign."
    ],
    selectionRules: [
      "High irritability: favor smaller-amplitude, mid-range input and shorter exposure.",
      "Low irritability with clear hypomobility: larger-amplitude/end-range work may be trialed if safe.",
      "Choose grade and direction from the patient's response, not from diagnosis alone."
    ],
    technicalVariables: [
      "Amplitude, frequency, direction, joint position, stabilization and total exposure all change the treatment dose.",
      "A smooth force-time profile is more important than aggressive pressure.",
      "The accessory glide should be anatomically clean enough that the intended joint receives the majority of the movement."
    ],
    progressionRegression: [
      "Regress by reducing amplitude, moving away from resistance, shortening sets or using a more supported position.",
      "Progress by increasing amplitude toward resistance, adding functional position or combining with active movement.",
      "Stop progressing when the comparable sign plateaus or worsens."
    ],
    integration: [
      "Pair a successful mobilization with active ROM, motor control or loading in the newly available range.",
      "Use self-mobilization only when the patient can reproduce the direction safely and without symptom escalation."
    ],
    documentation: [
      "Record joint, direction, grade, duration/repetitions, symptom response and pre/post comparable sign.",
      "Document any neurological or safety screening relevant to the region."
    ],
    evidencePosition: [
      "Manual therapy can improve pain and function for selected musculoskeletal presentations, usually as part of multimodal care.",
      "Mechanisms are likely multisystem; avoid structural repositioning claims."
    ]
  },

  "kaltenborn-evjenth-mobilization": {
    variants: [
      "Translatoric traction grades I–III and sustained gliding parallel to the treatment plane.",
      "Resting position, actual resting position and treatment position are selected according to irritability and the target tissue.",
      "Belt-assisted mobilization can improve force control and reduce therapist effort."
    ],
    selectionRules: [
      "Use low-grade traction when compression sensitivity dominates.",
      "Use sustained Grade III only when stiffness is the principal limitation and tissue tolerance is adequate.",
      "Treat convex–concave rules as a starting hypothesis, then confirm with reassessment."
    ],
    technicalVariables: [
      "Treatment plane, direction of traction/glide, stabilization, lever arm and hold duration determine the mechanical dose.",
      "Force should build gradually to avoid protective guarding."
    ],
    progressionRegression: [
      "Regress by returning toward the resting position or Grade I–II traction.",
      "Progress by increasing sustained stretch, changing joint position or adding active movement after the glide."
    ],
    integration: [
      "Follow gained range with active mobility or strength so the change becomes functional.",
      "Teach self-traction or self-glide only when the patient can control alignment."
    ],
    documentation: [
      "Record joint position, treatment plane, grade, direction, hold time and pre/post movement.",
      "Note whether symptom relief came from distraction, glide or both."
    ],
    evidencePosition: [
      "The translatoric model is clinically useful, but exact arthrokinematic rules are not perfect predictors of individual response.",
      "Clinical benefit should be judged by pain, range and function rather than assumed capsular correction."
    ]
  },

  "mulligan-mobilization-with-movement": {
    variants: [
      "Peripheral MWMs, weight-bearing MWMs, belt-assisted techniques and self-MWM variants.",
      "Pain-free overpressure can be added only after the movement is already clearly improved."
    ],
    selectionRules: [
      "Use when a specific active movement has a repeatable painful or restricted comparable sign.",
      "Retain only a glide that produces immediate, meaningful and acceptable improvement.",
      "Do not force a technique that cannot be made comfortable."
    ],
    technicalVariables: [
      "Glide direction, angle, stabilization, belt line of pull, active movement speed and overpressure all matter.",
      "Small changes in glide vector can completely change the response."
    ],
    progressionRegression: [
      "Regress by reducing movement range, repetitions or glide force.",
      "Progress toward loaded or functional versions while maintaining the same positive response."
    ],
    integration: [
      "Move from therapist-assisted MWM to self-MWM and then to unassisted task practice.",
      "Use the pain-free window to load the relevant muscle-tendon and movement system."
    ],
    documentation: [
      "Record the painful movement, exact glide vector, repetitions, pain response and carry-over after removing the glide."
    ],
    evidencePosition: [
      "MWM can produce meaningful short-term changes in some conditions; individual response is variable.",
      "A positional-fault explanation should not be presented as established mechanism."
    ]
  },

  "mulligan-snags-nags": {
    variants: [
      "NAGs, SNAGs, self-SNAGs and headache-oriented upper cervical applications where appropriately trained.",
      "Techniques may be segment-specific or movement-specific depending on the clinical goal."
    ],
    selectionRules: [
      "Select a clear painful or restricted spinal movement and screen regional safety first.",
      "The active movement during a SNAG should remain pain-free or distinctly easier."
    ],
    technicalVariables: [
      "Facet-plane direction, contact point, sustained glide, patient movement and optional overpressure determine the technique.",
      "Cervical force should be especially precise and conservative."
    ],
    progressionRegression: [
      "Regress to smaller range, fewer repetitions or a self-assisted low-force variant.",
      "Progress to functional positions or self-SNAGs when the patient demonstrates control."
    ],
    integration: [
      "Follow with active spinal movement, endurance or sensorimotor exercise.",
      "Use self-SNAGs to reduce dependence on therapist-delivered care."
    ],
    documentation: [
      "Record segment/region, movement, glide direction, repetitions and pre/post ROM or symptom change."
    ],
    evidencePosition: [
      "Use as a symptom-modulation and movement strategy within multimodal care.",
      "Upper cervical application requires disciplined vascular, neurological and ligamentous screening."
    ]
  },

  "cyriax-deep-transverse-friction": {
    variants: [
      "Localized transverse loading can be applied to selected tendon, ligament or musculotendinous tissue.",
      "Friction can be delivered with finger pad, reinforced finger or thumb depending on tissue and clinician ergonomics."
    ],
    selectionRules: [
      "Use only when a specific superficial tissue is clinically relevant and the patient tolerates local compression.",
      "Do not choose friction simply because tenderness is present."
    ],
    technicalVariables: [
      "Tissue position, transverse direction, contact depth, amplitude, speed and duration determine the dose.",
      "The contact should move the target tissue, not merely rub across the skin."
    ],
    progressionRegression: [
      "Regress by reducing depth, duration or frequency.",
      "Progress primarily through active loading rather than increasingly aggressive friction."
    ],
    integration: [
      "Pair with tendon or ligament loading, movement retraining and load-management education."
    ],
    documentation: [
      "Record target structure, duration, symptom response and change in resisted/functional testing."
    ],
    evidencePosition: [
      "Evidence for superiority over loading-based rehabilitation is limited in many tendinopathies.",
      "Use as an adjunct, not as a scar-breaking or tissue-healing requirement."
    ]
  },

  "muscle-energy-technique": {
    variants: [
      "Post-isometric relaxation, reciprocal inhibition, resisted isometric mobilization and region-specific MET applications.",
      "Contraction direction can target an agonist, antagonist or multi-planar movement restriction."
    ],
    selectionRules: [
      "Use when the patient can produce a controlled pain-free contraction and a movement restriction is modifiable.",
      "Avoid high effort in acute muscle injury or highly irritable states."
    ],
    technicalVariables: [
      "Starting barrier, contraction direction, effort level, contraction duration, breathing and post-contraction repositioning all change the effect.",
      "Low effort is usually sufficient; excessive force increases substitution and guarding."
    ],
    progressionRegression: [
      "Regress by reducing contraction intensity and staying further from the barrier.",
      "Progress toward active mobility, loaded range and strength after a successful MET response."
    ],
    integration: [
      "Use MET as a bridge into active movement rather than the endpoint of treatment.",
      "Teach self-MET variants selectively when positioning can be reproduced safely."
    ],
    documentation: [
      "Record direction, effort estimate, contraction time, cycles and pre/post ROM."
    ],
    evidencePosition: [
      "Short-term ROM or pain changes are plausible, but single-reflex explanations are oversimplified.",
      "Best used as one component of active rehabilitation."
    ]
  },

  "strain-counterstrain": {
    variants: [
      "Classical tender-point positioning, region-specific positional release and symptom-guided positions of ease.",
      "Different teaching systems use different point maps; the underlying clinical strategy is indirect positioning."
    ],
    selectionRules: [
      "Consider when direct loading is poorly tolerated and a reproducible tender or painful region eases with positioning.",
      "Do not assume every tender point requires treatment."
    ],
    technicalVariables: [
      "Position of ease, amount of shortening/unloading, hold duration and speed of return to neutral determine the application.",
      "The return to neutral should be passive and slow."
    ],
    progressionRegression: [
      "Regress by using less extreme positioning or shorter holds.",
      "Progress by transitioning immediately to active movement once irritability decreases."
    ],
    integration: [
      "Use symptom reduction to facilitate ROM, strengthening or functional exposure.",
      "Avoid creating dependence on repeated tender-point searching."
    ],
    documentation: [
      "Record tender region, position of ease, hold time and pre/post tenderness or movement."
    ],
    evidencePosition: [
      "Technique-specific evidence is modest; claims of precise lesion correction are not supported.",
      "Use as a low-force symptom-modulation option when clinically appropriate."
    ]
  },

  "myofascial-release": {
    variants: [
      "Direct MFR, indirect MFR, cross-hand spreading, longitudinal loading, transverse loading and broad sustained fascial contact.",
      "Region-specific applications differ mainly by contact, direction, body position and tissue depth."
    ],
    selectionRules: [
      "Direct loading suits lower-irritability restriction; indirect positioning may suit more irritable or guarded presentations.",
      "Choose direction by the patient's response and movement goal rather than a presumed fascial line diagnosis."
    ],
    technicalVariables: [
      "Contact area, shear direction, depth, rate of loading, hold time and use of lubricant all alter tissue input.",
      "Sustained fascial contact usually requires minimal lubricant so the hands can transmit shear rather than slide."
    ],
    progressionRegression: [
      "Regress to broad light contact or an indirect direction of ease.",
      "Progress to more specific direction, active movement under contact or loaded functional motion."
    ],
    integration: [
      "Follow with mobility, strength or motor-control work in the improved range.",
      "Use self-myofascial strategies only when they support independence and do not reinforce fragility beliefs."
    ],
    documentation: [
      "Record region, direct/indirect strategy, force direction, duration and pre/post functional change."
    ],
    evidencePosition: [
      "Short-term pain and mobility effects are possible in some populations.",
      "Permanent fascial release, realignment or adhesion-breaking claims should be avoided."
    ]
  },

  "soft-tissue-mobilization": {
    variants: [
      "Longitudinal strokes, kneading, compression, tissue gliding, skin rolling, broad cross-fiber loading and sustained contact.",
      "Techniques can be static, rhythmic or combined with active movement."
    ],
    selectionRules: [
      "Choose contact based on the patient's goal, irritability, tissue depth and preference.",
      "Avoid treating palpable firmness as pathology by default."
    ],
    technicalVariables: [
      "Pressure, speed, direction, tissue slack, contact surface and duration determine intensity.",
      "Broader slower contact is generally easier to tolerate than focal high pressure."
    ],
    progressionRegression: [
      "Regress by broadening contact and reducing pressure/speed.",
      "Progress by adding active movement, longer lever positions or functional loading."
    ],
    integration: [
      "Use the technique to prepare movement, not to replace strength or mobility training."
    ],
    documentation: [
      "Record target region, technique style, duration, tolerance and change in movement/function."
    ],
    evidencePosition: [
      "Likely benefits are primarily short-term symptom and movement effects.",
      "Avoid language suggesting manual pressure physically removes knots or scar tissue."
    ]
  },

  "trigger-point-compression": {
    variants: [
      "Sustained pressure release, intermittent compression and pressure combined with active movement or breathing.",
      "Pressure can be broad or focal depending on tissue depth and sensitivity."
    ],
    selectionRules: [
      "Use when palpation reproduces the patient's familiar symptom and no more important pathology explains the presentation.",
      "Do not equate every tender spot with a trigger point requiring treatment."
    ],
    technicalVariables: [
      "Pressure rate, depth, hold time and symptom reproduction should be titrated.",
      "Aim for tolerable familiar symptoms rather than maximal pain."
    ],
    progressionRegression: [
      "Regress by reducing pressure or using surrounding tissue contact.",
      "Progress into active loading and movement rather than repeated deeper compression."
    ],
    integration: [
      "Address relevant load, sleep, stress, strength and movement factors after local symptom modulation."
    ],
    documentation: [
      "Record location, familiar symptom reproduction, duration and pre/post movement response."
    ],
    evidencePosition: [
      "Trigger points remain a clinical construct with imperfect objective reliability.",
      "Pressure techniques may help symptoms transiently but should not be framed as destroying a knot."
    ]
  },

  "iastm": {
    variants: [
      "Scanning/light contact, treatment strokes, sweeping, fanning, strumming and movement-assisted IASTM depending on instrument design and training model.",
      "Different instrument edges alter contact area rather than creating fundamentally different biological mechanisms."
    ],
    selectionRules: [
      "Choose IASTM when instrument contact improves ergonomics or provides a tolerable sensory input the patient prefers.",
      "Do not use petechiae or bruising as a treatment target."
    ],
    technicalVariables: [
      "Instrument angle, edge, pressure, stroke speed, direction, duration and tissue position all affect load.",
      "Lower angle and broader contact generally reduce focal pressure."
    ],
    progressionRegression: [
      "Regress by reducing angle, pressure, duration or placing tissue on slack.",
      "Progress with active movement under the tool and then exercise loading."
    ],
    integration: [
      "Use any short-term mobility change to perform strengthening, tendon loading or movement practice."
    ],
    documentation: [
      "Record instrument region, contact angle/pressure description, duration, skin response and functional reassessment."
    ],
    evidencePosition: [
      "Evidence supports possible short-term ROM or symptom effects in some settings, with uncertainty about superiority over other care.",
      "Claims of breaking scar tissue or adhesions mechanically are not supported."
    ]
  },

  "neurodynamic-mobilization": {
    variants: [
      "Sliders, tensioners, interface-focused techniques and nerve-specific upper- or lower-limb sequences.",
      "Structural differentiation helps judge whether symptom change is consistent with neural mechanosensitivity."
    ],
    selectionRules: [
      "Use only after neurological screening and when symptoms are plausibly influenced by the neural system.",
      "High irritability favors sliders; tensioners require lower irritability and stable neurological status."
    ],
    technicalVariables: [
      "Joint sequence, movement amplitude, speed, repetitions, remote sensitizers and whether one end is released or loaded determine neural load.",
      "Do not chase maximal neural tension."
    ],
    progressionRegression: [
      "Regress from tensioner to slider, reduce range, remove sensitizers or slow the movement.",
      "Progress by increasing range, integrating functional movement and graded loading."
    ],
    integration: [
      "Combine with treatment of mechanical interfaces, strength, movement exposure and education where relevant.",
      "Nerve-by-nerve sequences should be taught as adaptable clinical tools, not rigid tests."
    ],
    documentation: [
      "Record nerve bias, slider/tensioner, sequence, repetitions, symptom response and neurological reassessment."
    ],
    evidencePosition: [
      "Neurodynamic mobilization can help selected neural mechanosensitivity presentations, but effects vary by condition.",
      "Avoid interpreting a positive test as proof of nerve damage."
    ]
  },

  "manual-traction": {
    variants: [
      "Intermittent or sustained spinal traction, manual joint distraction and peripheral joint long-axis traction.",
      "Position can be neutral, flexed, extended or directionally biased depending on diagnosis and response."
    ],
    selectionRules: [
      "Use only when a traction trial improves a meaningful symptom or movement.",
      "Do not continue simply because decompression sounds mechanically logical."
    ],
    technicalVariables: [
      "Direction, force, duration, duty cycle and patient position determine the dose.",
      "Manual traction allows immediate symptom-guided adjustment."
    ],
    progressionRegression: [
      "Regress by reducing force or duration and returning toward neutral.",
      "Progress toward active movement and self-management rather than escalating passive traction."
    ],
    integration: [
      "Pair with neurological monitoring, exercise and functional progression."
    ],
    documentation: [
      "Record region, position, sustained/intermittent method, duration and pre/post symptoms."
    ],
    evidencePosition: [
      "Evidence is condition-specific and often mixed; traction should be treated as a response-based adjunct.",
      "Routine use without a clear responder profile is not justified."
    ]
  },

  "high-velocity-low-amplitude-thrust": {
    variants: [
      "Spinal and peripheral joint thrust techniques differ by region, locking strategy, patient position and lever arm.",
      "Direct, indirect and mechanically assisted thrust systems exist, but competence must be technique- and region-specific."
    ],
    selectionRules: [
      "Use only when indicated, within scope, after informed consent and region-specific risk assessment.",
      "A non-thrust option should always be considered when benefit is likely similar with lower perceived risk."
    ],
    technicalVariables: [
      "Preload, localization, lever length, thrust direction, velocity and amplitude determine the maneuver.",
      "End-range force should not be increased simply to obtain cavitation."
    ],
    progressionRegression: [
      "Regress to non-thrust mobilization, smaller lever techniques or active movement.",
      "There is no need to repeat thrusts solely because no audible cavitation occurred."
    ],
    integration: [
      "Use short-term symptom change to enable active exercise and self-management.",
      "Reassess neurological and vascular symptoms immediately when regionally relevant."
    ],
    documentation: [
      "Document indication, consent, screening, technique region/direction, response and any adverse symptoms."
    ],
    evidencePosition: [
      "Thrust manipulation can help selected musculoskeletal conditions, usually with similar overall goals to other manual options.",
      "Cavitation is not proof of successful repositioning; safety and clinical response matter more."
    ]
  },

  "pnf-manual-techniques": {
    variants: [
      "Rhythmic initiation, repeated contractions, slow reversal, slow reversal hold, rhythmic stabilization, alternating isometrics, hold-relax and contract-relax.",
      "Upper- and lower-extremity D1/D2 patterns plus scapular and pelvic patterns can be used."
    ],
    selectionRules: [
      "Select technique from the motor goal: initiate movement, improve coordination, increase stability, gain range or build strength.",
      "Match resistance so the patient can produce the desired pattern without substitution."
    ],
    technicalVariables: [
      "Manual contacts, verbal cues, visual tracking, resistance direction, timing and stretch input shape the motor response.",
      "Resistance should facilitate the pattern, not overpower it."
    ],
    progressionRegression: [
      "Regress to rhythmic initiation or partial-range patterns.",
      "Progress to stronger resistance, reversals, functional positions and task-specific patterns."
    ],
    integration: [
      "Translate diagonal patterns into reaching, gait, transfers, sport or ADL goals."
    ],
    documentation: [
      "Record pattern, technique, assistance/resistance, repetitions and functional response."
    ],
    evidencePosition: [
      "PNF is a broad facilitation framework rather than one treatment; evidence varies by goal and population.",
      "Motor learning and progressive task practice remain central."
    ]
  },

  "fascial-manipulation": {
    variants: [
      "Assessment and treatment systems may use defined fascial points, movement directions and sequence-based hypotheses.",
      "Local and remote points are sometimes selected within the model."
    ],
    selectionRules: [
      "Use only when the model adds a testable hypothesis and the patient tolerates focal pressure.",
      "Do not treat a palpated fascial point as proof of a biomechanical chain lesion."
    ],
    technicalVariables: [
      "Contact location, pressure, friction direction and duration determine intensity.",
      "Focal friction can be provocative and should be carefully dosed."
    ],
    progressionRegression: [
      "Regress by reducing pressure or choosing broader soft-tissue contact.",
      "Progress by using the symptom change to restore active movement."
    ],
    integration: [
      "Link any manual effect to region-specific mobility, strength and functional tasks."
    ],
    documentation: [
      "Record treated point/region, rationale, dose and pre/post comparable sign."
    ],
    evidencePosition: [
      "Technique-specific evidence is limited relative to broader manual therapy literature.",
      "Present fascial-chain explanations as hypotheses rather than established structural facts."
    ]
  },

  "active-release-style-soft-tissue": {
    variants: [
      "Static contact with active shortening-to-lengthening movement, passive movement under contact and movement-specific soft-tissue loading.",
      "The method can be adapted to muscle, tendon interface and selected superficial neural interfaces."
    ],
    selectionRules: [
      "Use when active movement under controlled contact changes a meaningful restriction or symptom.",
      "Avoid high compression over nerves or acutely injured tissue."
    ],
    technicalVariables: [
      "Contact depth, tissue pre-position, active movement direction, speed and range determine load.",
      "Movement should remain controlled and non-threatening."
    ],
    progressionRegression: [
      "Regress by reducing pressure or movement range.",
      "Progress to loaded movement and functional exercise after symptom improvement."
    ],
    integration: [
      "Use immediately before task-specific mobility or strength when the technique improves movement."
    ],
    documentation: [
      "Record tissue/region, movement under contact, pressure tolerance and pre/post functional change."
    ],
    evidencePosition: [
      "Evidence for branded or specific active-release systems is limited; effects likely overlap with other soft-tissue and movement interventions.",
      "Avoid adhesion-breaking claims."
    ]
  },

  "manual-lymphatic-drainage": {
    variants: [
      "Different schools use distinct sequences, but all rely on gentle skin-stretch techniques integrated into comprehensive decongestive care.",
      "Treatment may include proximal preparation, regional drainage and patient self-management."
    ],
    selectionRules: [
      "Use only after appropriate medical assessment of swelling and within lymphedema competence.",
      "New unilateral swelling requires diagnostic caution before manual treatment."
    ],
    technicalVariables: [
      "Pressure must be light enough to stretch skin without deep tissue compression.",
      "Sequence, direction, rhythm and integration with compression are more important than force."
    ],
    progressionRegression: [
      "Regress by shortening sessions or limiting treated regions in fragile patients.",
      "Progress toward self-drainage, compression use, exercise and independent edema management."
    ],
    integration: [
      "MLD should sit within comprehensive decongestive therapy when indicated, not function as a stand-alone cure."
    ],
    documentation: [
      "Record limb measurements, skin status, compression plan, treated regions and symptom response."
    ],
    evidencePosition: [
      "Benefit varies by lymphedema type and phase of care; compression and exercise are major components of management.",
      "Avoid unsupported detoxification claims."
    ]
  },

  "scar-mobilization": {
    variants: [
      "Skin glide, multidirectional shear, lifting, rolling, longitudinal loading and movement combined with scar tension.",
      "Desensitization and graded texture exposure can be used when sensitivity dominates."
    ],
    selectionRules: [
      "Begin only after adequate wound closure and healing status are confirmed.",
      "Treat function, sensitivity and mobility—not scar appearance alone."
    ],
    technicalVariables: [
      "Direction, depth, tissue position and movement under tension determine the scar load.",
      "Radiated, grafted or fragile tissue requires especially conservative dosing."
    ],
    progressionRegression: [
      "Regress to light skin contact and desensitization.",
      "Progress to multidirectional load, longer lever movement and functional stretch."
    ],
    integration: [
      "Combine with ROM, strength and task exposure that loads the involved region."
    ],
    documentation: [
      "Record healing status, mobility, sensitivity, treatment direction and functional change."
    ],
    evidencePosition: [
      "Scar tissue can adapt to progressive mechanical loading, but aggressive manual disruption is unnecessary.",
      "Tissue integrity and healing stage override mobility goals."
    ]
  },

  "paivm-ppivm-spinal-assessment": {
    variants: [
      "Central and unilateral PAIVMs plus physiological intervertebral flexion, extension, rotation and side-flexion assessment.",
      "The same contacts can be used as low-grade treatment trials when appropriate."
    ],
    selectionRules: [
      "Use as one part of a broader examination, not as an isolated segmental diagnosis.",
      "Prioritize symptom behavior, neurological status and active movement over examiner-perceived stiffness."
    ],
    technicalVariables: [
      "Contact level, direction, grade, amplitude, speed, spinal position and stabilization alter the input.",
      "Reliability improves when terminology, patient position and testing intent are standardized, but remains limited."
    ],
    progressionRegression: [
      "Regress to lighter grades or broader regional mobilization.",
      "Progress only if a segmental treatment trial improves the comparable sign without adverse neurological response."
    ],
    integration: [
      "Use a positive response to guide active spinal movement, sensorimotor training or loading."
    ],
    documentation: [
      "Record region/level, PAIVM or PPIVM direction, grade, symptom response and active pre/post test."
    ],
    evidencePosition: [
      "Stand-alone PAIVM/PPIVM reliability and diagnostic validity are limited.",
      "Their value is stronger as response-based hypothesis testing within a complete clinical examination."
    ]
  },

  "myofascial-decompression-dry-cupping": {
    variants: [
      "Static dry cupping, moving cupping and conservative active-movement cupping.",
      "Silicone and pump cups differ mainly in how suction is generated and controlled."
    ],
    selectionRules: [
      "Use only as a preference-sensitive adjunct after screening skin, vascular and bleeding risk.",
      "Do not prioritize cupping over better-supported active rehabilitation."
    ],
    technicalVariables: [
      "Cup size, suction level, application time, movement under suction and tissue location determine the dose.",
      "Skin response should be monitored continuously."
    ],
    progressionRegression: [
      "Regress by lowering suction, shortening time or reducing number of cups.",
      "Progress by adding comfortable movement under low suction—not by chasing darker marks."
    ],
    integration: [
      "Use any short-term gain to perform mobility, strength or functional exercise."
    ],
    documentation: [
      "Record region, cup type, suction intensity description, duration, skin response and pre/post function."
    ],
    evidencePosition: [
      "Recent placebo-controlled evidence finds very uncertain effects for musculoskeletal pain.",
      "Explain uncertainty clearly and avoid toxin-removal or permanent fascial-change claims."
    ]
  },

  "facilitated-positional-release": {
    variants: [
      "Indirect positioning with compression, distraction or torsional facilitating force according to region and training model.",
      "Cervical, thoracic, rib and peripheral adaptations exist."
    ],
    selectionRules: [
      "Consider when a low-force indirect strategy is preferable to direct loading.",
      "Use only when positioning is comfortable and there is a clear comparable sign to retest."
    ],
    technicalVariables: [
      "Position of ease, facilitating force, hold duration and return speed determine the application.",
      "The facilitating force should remain low and controlled."
    ],
    progressionRegression: [
      "Regress by reducing positioning and facilitating force.",
      "Progress by transitioning immediately into active movement or stabilization."
    ],
    integration: [
      "Use the technique as a short bridge from guarding to active control."
    ],
    documentation: [
      "Record region, position of ease, facilitating force, hold duration and pre/post sign."
    ],
    evidencePosition: [
      "Technique-specific evidence is limited, so present FPR as an adjunct rather than a structural correction.",
      "Clinical value depends on measurable symptom or movement improvement."
    ]
  }
};

export function getManualTherapyExpertProfile(slug: string) {
  return manualTherapyExpertProfiles[slug];
}
