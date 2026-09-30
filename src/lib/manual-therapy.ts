export type ManualTherapyTechnique = {
  slug: string;
  name: string;
  family: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  summary: string;
  science: string[];
  procedure: string[];
  dosage: string[];
  indications: string[];
  precautions: string[];
  contraindications: string[];
  reassessment: string[];
  pearls: string[];
};

export const manualTherapyTechniques: ManualTherapyTechnique[] = [
  {
    slug: "maitland-joint-mobilization",
    name: "Maitland Joint Mobilization",
    family: "Joint Mobilization",
    level: "Foundation",
    summary: "Graded passive oscillatory mobilization selected from the patient's comparable sign, irritability and response to treatment.",
    science: [
      "Uses symptom response and movement behavior to guide grade, direction and progression rather than relying on a single structural diagnosis.",
      "Potential effects include short-term pain modulation, altered muscle guarding, improved tolerance to movement and increased accessory motion.",
      "Clinical value depends on reassessment: a technique is retained only when it produces a meaningful change in the comparable sign."
    ],
    procedure: [
      "Identify the comparable sign and establish baseline pain, range, accessory motion and functional limitation.",
      "Position the patient comfortably and stabilize the proximal segment.",
      "Select the accessory glide that best relates to the restricted or painful movement.",
      "Apply the chosen Maitland grade with relaxed, rhythmic oscillations while monitoring symptoms.",
      "Stop or modify if symptoms peripheralize, neurological signs worsen or the response is disproportionate.",
      "Immediately reassess the comparable sign and integrate active movement or exercise if improved."
    ],
    dosage: [
      "Grades I–II: commonly used for pain-dominant or highly irritable presentations.",
      "Grades III–IV: commonly used for stiffness-dominant presentations when irritability is lower.",
      "Typical clinical sets may use 30–60 seconds of oscillation repeated 2–4 times, adjusted to response rather than fixed by rule."
    ],
    indications: ["Painful hypomobility", "Capsular restriction", "Movement-limited joint stiffness", "Short-term symptom modulation to enable exercise"],
    precautions: ["High irritability", "Recent trauma", "Hypermobility", "Neurological symptoms requiring close monitoring"],
    contraindications: ["Unstable fracture or dislocation", "Active joint infection", "Suspected malignancy in the region", "Severe uninvestigated neurological deficit", "When vascular or ligamentous safety is uncertain"],
    reassessment: ["Pain during comparable movement", "Active and passive range", "Accessory motion", "Functional task meaningful to the patient"],
    pearls: ["Do not chase a textbook glide if the patient's comparable sign is not improving.", "Mobilization should create a window for active rehabilitation, not replace it."]
  },
  {
    slug: "kaltenborn-evjenth-mobilization",
    name: "Kaltenborn–Evjenth Mobilization",
    family: "Joint Mobilization",
    level: "Intermediate",
    summary: "Sustained translatoric joint play using traction and gliding, classically guided by convex–concave mechanics and tissue slack.",
    science: [
      "Separates treatment movement from osteokinematic movement by emphasizing translatoric joint play.",
      "Traction grades are used to neutralize compression, take up slack or stretch periarticular tissues.",
      "The mechanical model is useful for planning, but treatment should still be confirmed by symptom and function reassessment."
    ],
    procedure: [
      "Assess active motion, end feel and joint-play restriction.",
      "Place the joint in a resting or treatment position and stabilize one bone.",
      "Apply traction perpendicular to the treatment plane or a glide parallel to it.",
      "Use a sustained force matched to the treatment goal and tissue response.",
      "Reassess range, end feel and the patient’s functional complaint."
    ],
    dosage: ["Grade I traction: neutralizes joint compression.", "Grade II: takes up slack.", "Grade III: applies a sustained stretch to restricted tissues.", "Hold times are individualized; sustained bouts are commonly repeated with rest and reassessment."],
    indications: ["Joint pain related to compression", "Capsular or periarticular stiffness", "Restricted joint play"],
    precautions: ["Osteoporosis", "Postoperative restrictions", "Hypermobility", "Inflammatory flare"],
    contraindications: ["Acute unstable injury", "Fracture", "Dislocation", "Active infection", "Unexplained severe pain or neurological deterioration"],
    reassessment: ["Joint play", "Osteokinematic range", "Pain response", "Functional movement"],
    pearls: ["Know the treatment plane, but let the patient's response decide whether the technique is clinically useful."]
  },
  {
    slug: "mulligan-mobilization-with-movement",
    name: "Mulligan Mobilization With Movement (MWM)",
    family: "Mobilization With Movement",
    level: "Intermediate",
    summary: "A sustained accessory glide is combined with the patient's active movement and retained only when it is pain-free and functionally beneficial.",
    science: [
      "Combines manual correction, active movement and repeated exposure to a previously painful or restricted task.",
      "Benefits may involve short-term mechanical, sensorimotor and pain-modulatory effects.",
      "The hallmark is a rapid within-session change in pain-free movement or function."
    ],
    procedure: [
      "Choose a painful or restricted active movement as the baseline comparable sign.",
      "Apply a sustained accessory glide while the patient repeats the movement.",
      "Adjust direction, angle or belt assistance until movement is pain-free or clearly improved.",
      "Repeat the movement while maintaining the glide.",
      "Add pain-free overpressure only when appropriate and reassess without the glide."
    ],
    dosage: ["Commonly 6–10 repetitions per set for 2–3 sets when the response is positive.", "Dosage should stop before symptom aggravation or loss of the pain-free effect."],
    indications: ["Movement-related joint pain", "Painful restriction with an immediate correctable sign", "Ankle, knee, hip, shoulder, elbow and spinal movement impairments"],
    precautions: ["Irritable acute conditions", "Postoperative restrictions", "Uncertain structural stability"],
    contraindications: ["Instability or fracture", "Severe neurological or vascular warning signs", "Pain that cannot be made acceptable with technique modification"],
    reassessment: ["Pain-free range", "Functional task", "Movement quality", "Retention of benefit after the glide is removed"],
    pearls: ["PILL principle: Pain-free, Immediate improvement, Long-lasting effect. If these are absent, reconsider the technique."]
  },
  {
    slug: "mulligan-snags-nags",
    name: "Mulligan NAGs, SNAGs & Self-SNAGs",
    family: "Spinal Mobilization",
    level: "Intermediate",
    summary: "Spinal mobilization techniques combining facet-directed glides with passive or active movement, including self-management variants.",
    science: [
      "Aims to improve pain-free spinal movement while maintaining patient participation.",
      "Self-SNAGs extend the manual concept into an active home strategy when safely taught.",
      "Response should be judged by immediate movement change and symptom behavior."
    ],
    procedure: ["Identify the limited spinal movement.", "Apply the segmental glide in the intended treatment direction.", "For SNAGs, maintain the glide while the patient actively moves.", "Repeat only if the movement remains comfortable and improves.", "Teach a self-SNAG only when the patient can reproduce the direction safely."],
    dosage: ["Often 6–10 repetitions in a set, repeated according to response.", "Home self-SNAG dosage should be conservative and symptom-guided."],
    indications: ["Mechanical spinal pain", "Painful restriction", "Selected headache or cervicogenic presentations after screening"],
    precautions: ["Upper cervical symptoms", "Dizziness", "History suggesting vascular or ligamentous disorder"],
    contraindications: ["Suspected cervical arterial pathology", "Instability", "Fracture", "Acute myelopathy or progressive neurological deficit"],
    reassessment: ["Pain-free spinal range", "Functional movement", "Headache or symptom response when relevant"],
    pearls: ["Cervical techniques require appropriate vascular, neurological and ligamentous screening before treatment."]
  },
  {
    slug: "cyriax-deep-transverse-friction",
    name: "Cyriax Deep Transverse Friction",
    family: "Soft-Tissue Mobilization",
    level: "Foundation",
    summary: "Localized transverse soft-tissue loading traditionally applied across a symptomatic tendon, ligament or muscle lesion.",
    science: [
      "Historically proposed to influence scar mobility and local tissue behavior.",
      "Modern evidence for superiority over progressive loading is limited for many tendinopathies.",
      "Best considered an adjunct for selected patients rather than a stand-alone tissue-healing treatment."
    ],
    procedure: ["Confirm the symptomatic structure clinically.", "Place the tissue in a position that allows accurate contact.", "Apply a small transverse movement across the target tissue rather than sliding over skin.", "Monitor pain and irritability throughout.", "Follow with appropriate active loading when tolerated."],
    dosage: ["Use short, tolerable bouts; avoid aggressive prolonged friction in highly irritable tissues.", "Progressive exercise loading remains the primary rehabilitation strategy for most chronic tendinopathies."],
    indications: ["Selected localized tendon or ligament pain", "Adjunct to loading-based rehabilitation"],
    precautions: ["High irritability", "Anticoagulant use", "Fragile skin", "Acute inflammatory presentation"],
    contraindications: ["Open wound", "Infection", "Acute tear where loading is contraindicated", "Hematoma or bleeding disorder"],
    reassessment: ["Local tenderness", "Pain with resisted testing", "Functional loading tolerance"],
    pearls: ["Do not use friction as a substitute for graded tendon loading."]
  },
  {
    slug: "muscle-energy-technique",
    name: "Muscle Energy Technique (MET)",
    family: "Osteopathic & Neuromuscular",
    level: "Intermediate",
    summary: "Uses voluntary patient muscle contraction against a controlled resistance to influence range, tone and movement tolerance.",
    science: [
      "Mechanisms may involve altered stretch tolerance, sensorimotor effects and reduction in protective muscle activity.",
      "Post-isometric relaxation and reciprocal inhibition are commonly taught models, but clinical response is not explained by a single reflex mechanism.",
      "Works best when integrated with active mobility and strengthening."
    ],
    procedure: ["Assess the restricted movement and identify a comfortable barrier.", "Position the patient short of pain.", "Ask for a gentle isometric contraction in the prescribed direction while the therapist provides matched resistance.", "After relaxation, take up the new available range without forcing.", "Repeat and reassess."],
    dosage: ["Common contractions are gentle, approximately 10–30% effort for 5–10 seconds.", "Usually 3–5 cycles are sufficient before reassessment."],
    indications: ["Painful muscle guarding", "Restricted range", "Selected pelvic, spinal or peripheral movement impairments"],
    precautions: ["Recent muscle injury", "Poor ability to follow commands", "Pain with contraction"],
    contraindications: ["Acute fracture", "Unstable joint", "Contraction prohibited after surgery", "Severe acute pain"],
    reassessment: ["Range of motion", "Pain", "Movement quality", "Functional task"],
    pearls: ["More force is not better; low-load accurate contraction is usually enough."]
  },
  {
    slug: "strain-counterstrain",
    name: "Strain Counterstrain / Positional Release",
    family: "Osteopathic & Neuromuscular",
    level: "Intermediate",
    summary: "An indirect positional technique that places a painful or tender region into a position of maximal comfort before gradual return to neutral.",
    science: [
      "May reduce pain and protective muscle activity through comfortable positioning, contextual effects and altered sensory input.",
      "Tender-point models are clinically useful for localization, but should not be treated as proof of a specific structural lesion.",
      "Best used to reduce irritability and enable movement."
    ],
    procedure: ["Identify a reproducible tender point and establish baseline tenderness.", "Passively position the patient toward maximal comfort until tenderness is substantially reduced.", "Maintain the position without provoking pain.", "Return slowly to neutral without asking the patient to assist.", "Reassess tenderness and functional movement."],
    dosage: ["Traditional teaching often uses approximately 90 seconds, but duration can be individualized to response.", "One to several points may be treated, avoiding unnecessary overtreatment."],
    indications: ["Highly irritable myofascial pain", "Protective muscle guarding", "Tender-point dominant presentations"],
    precautions: ["Patients unable to tolerate positioning", "Severe osteoporosis", "Recent surgery"],
    contraindications: ["Positioning that compromises breathing, circulation or surgical precautions", "Unstable injury"],
    reassessment: ["Tenderness", "Range", "Pain during movement", "Functional tolerance"],
    pearls: ["The goal is not to hunt every tender point; use the technique when it changes function."]
  },
  {
    slug: "myofascial-release",
    name: "Myofascial Release (Direct & Indirect)",
    family: "Fascial & Soft-Tissue",
    level: "Intermediate",
    summary: "Sustained or progressive manual loading of skin, fascia and soft tissues using direct or indirect strategies according to symptom behavior.",
    science: [
      "Clinical effects are more plausibly explained by sensory modulation, altered stretch tolerance, fluid/tissue deformation and relaxation than by permanently 'breaking adhesions' with the hands.",
      "Direct approaches load into the perceived restriction; indirect approaches move toward ease.",
      "Evidence generally supports short-term symptom and mobility effects in some populations, with best results when paired with active care."
    ],
    procedure: ["Assess movement and identify the region relevant to symptoms.", "Establish broad comfortable contact without excessive lubricant when sustained fascial contact is desired.", "For direct MFR, engage the barrier gradually; for indirect MFR, follow the direction of ease.", "Maintain controlled load while monitoring tissue and patient response.", "Reassess movement and integrate active exercise."],
    dosage: ["Sustained holds commonly range from 30–120 seconds depending on technique and irritability.", "Use the minimum dose that creates a useful clinical change."],
    indications: ["Myofascial pain", "Movement restriction with soft-tissue sensitivity", "Adjunct during rehabilitation"],
    precautions: ["Fragile skin", "Anticoagulation", "Acute inflammatory states", "Recent surgery"],
    contraindications: ["Open wounds", "Acute infection", "Unstable fracture", "Suspected DVT", "Active bleeding"],
    reassessment: ["Pain", "Range", "Functional movement", "Patient-perceived ease"],
    pearls: ["Describe mechanisms conservatively; do not tell patients fascia has been permanently 'released' or 'realigned'."]
  },
  {
    slug: "soft-tissue-mobilization",
    name: "Soft-Tissue Mobilization",
    family: "Fascial & Soft-Tissue",
    level: "Foundation",
    summary: "A broad family of manual contacts including longitudinal strokes, kneading, sustained pressure, skin rolling and tissue gliding.",
    science: ["Likely effects include short-term modulation of pain, muscle tone, perceived stiffness and movement tolerance.", "Pressure and speed should match tissue irritability and patient preference.", "The clinical endpoint is improved function, not a specific sensation under the therapist's fingers."],
    procedure: ["Screen the region and establish baseline movement.", "Choose contact depth and direction appropriate to the target and patient comfort.", "Apply slow or rhythmic mobilization while monitoring response.", "Progress from broad to more specific contact if needed.", "Reassess and follow with active movement."],
    dosage: ["Usually 2–10 minutes per region depending on purpose and irritability.", "Avoid unnecessary high-pressure treatment that produces prolonged soreness."],
    indications: ["Perceived muscle tightness", "Myofascial pain", "Warm-up for movement or exercise"],
    precautions: ["Bruising tendency", "Sensory loss", "Varicosities", "Recent injury"],
    contraindications: ["Open wound", "Infection", "DVT", "Acute compartment syndrome", "Unstable fracture"],
    reassessment: ["Movement", "Pain", "Muscle performance", "Function"],
    pearls: ["Pressure should be clinically useful, not a test of pain tolerance."]
  },
  {
    slug: "trigger-point-compression",
    name: "Trigger-Point Pressure Release",
    family: "Fascial & Soft-Tissue",
    level: "Foundation",
    summary: "Sustained pressure applied to a clinically relevant hypersensitive muscle region while monitoring symptom reproduction and relief.",
    science: ["May alter pain sensitivity and muscle tone transiently.", "Trigger points are best considered a clinical pain phenomenon rather than a proven fixed structural knot.", "Long-term improvement usually requires addressing load, movement, sleep, stress and exercise."],
    procedure: ["Identify a palpably sensitive area that reproduces relevant symptoms.", "Apply gradual tolerable pressure rather than sudden high force.", "Maintain or modulate the pressure while symptoms settle.", "Release slowly and reassess movement.", "Add mobility or strengthening relevant to the impairment."],
    dosage: ["Commonly 20–90 seconds per site with one or several repetitions.", "Keep discomfort tolerable and avoid post-treatment flare."],
    indications: ["Localized myofascial pain", "Muscle-related referred pain patterns"],
    precautions: ["Anticoagulation", "Allodynia", "Sensory impairment"],
    contraindications: ["Open wound", "Acute muscle tear", "Hematoma", "DVT", "Infection"],
    reassessment: ["Tenderness", "Pain-free movement", "Functional task"],
    pearls: ["Do not imply that a painful point must be 'destroyed' or aggressively released."]
  },
  {
    slug: "iastm",
    name: "Instrument-Assisted Soft-Tissue Mobilization (IASTM)",
    family: "Instrument-Assisted",
    level: "Intermediate",
    summary: "Use of a rigid instrument to apply controlled soft-tissue pressure and gliding as an adjunct to active rehabilitation.",
    science: ["May produce short-term changes in pain and range through sensory and mechanical loading.", "Visible redness or petechiae are not required for effectiveness.", "Evidence does not support intentionally bruising tissue as a therapeutic goal."],
    procedure: ["Screen skin, circulation, sensation and bleeding risk.", "Choose an instrument edge and angle that allows controlled contact.", "Apply light-to-moderate strokes over the relevant region.", "Keep dosage symptom-guided.", "Follow with active mobility or loading."],
    dosage: ["Often 30 seconds to a few minutes per region.", "Avoid repeated aggressive passes that create bruising or prolonged soreness."],
    indications: ["Soft-tissue pain or stiffness as an adjunct", "Warm-up before loading"],
    precautions: ["Anticoagulation", "Fragile skin", "Neuropathy", "Varicosities"],
    contraindications: ["Open wound", "Active infection", "Uncontrolled bleeding disorder", "Suspected DVT", "Acute hematoma"],
    reassessment: ["Pain", "Range", "Loading tolerance"],
    pearls: ["The tool does not diagnose scar tissue by sound or texture."]
  },
  {
    slug: "neurodynamic-mobilization",
    name: "Neurodynamic Mobilization",
    family: "Neural Mobilization",
    level: "Advanced",
    summary: "Graded movement of the nervous system and surrounding interfaces using slider or tensioner strategies selected from neurodynamic assessment.",
    science: ["Aims to improve neural movement tolerance, reduce mechanosensitivity and restore function.", "Sliders generally create less strain than tensioners and are often better tolerated initially.", "Neurodynamic findings must be interpreted with neurological examination rather than in isolation."],
    procedure: ["Perform neurological screening and establish a comparable neurodynamic test.", "Select a slider or tensioner based on irritability.", "Move one or more joints rhythmically within a non-threatening range.", "Avoid sustained reproduction of neurological symptoms.", "Reassess the test and the functional complaint."],
    dosage: ["Commonly 10–20 gentle repetitions for 1–3 sets.", "High irritability favors smaller ranges and sliders."],
    indications: ["Selected radicular or peripheral nerve mechanosensitivity", "Post-immobilization neural movement restriction"],
    precautions: ["Acute radiculopathy", "Diabetes or neuropathy", "Recent nerve repair"],
    contraindications: ["Progressive neurological deficit", "Cauda equina symptoms", "Acute nerve injury requiring protection", "Unexplained severe neurological signs"],
    reassessment: ["Neurodynamic test", "Neurological symptoms", "Function", "Strength/sensation/reflexes where relevant"],
    pearls: ["Neural mobilization should not repeatedly provoke distal symptoms."]
  },
  {
    slug: "manual-traction",
    name: "Manual Traction & Joint Distraction",
    family: "Joint Mobilization",
    level: "Foundation",
    summary: "Long-axis or joint-specific distraction used to reduce compression, modulate symptoms or test whether unloading changes the presentation.",
    science: ["May temporarily reduce joint compression and pain or create a comfortable movement window.", "Response varies widely; sustained benefit requires addressing the underlying functional problem.", "Spinal traction should not be presented as universally effective for radiculopathy or disc disorders."],
    procedure: ["Screen for instability, fracture, neurological and vascular concerns.", "Position the patient comfortably.", "Apply a gradual distraction force in the desired line.", "Monitor symptom centralization, peripheralization and comfort.", "Release slowly and reassess."],
    dosage: ["Use brief intermittent or sustained bouts according to symptom response.", "Stop if neurological symptoms worsen or peripheralize."],
    indications: ["Compression-sensitive joint pain", "Selected radicular presentations with a clear favorable response"],
    precautions: ["Hypermobility", "Osteoporosis", "Pregnancy depending on region/position", "Inflammatory instability"],
    contraindications: ["Fracture", "Instability", "Malignancy in the region", "Severe myelopathy", "Progressive neurological deficit"],
    reassessment: ["Pain distribution", "Range", "Neurological symptoms", "Function"],
    pearls: ["Use traction as a response test, not as an automatic diagnosis-driven treatment."]
  },
  {
    slug: "high-velocity-low-amplitude-thrust",
    name: "HVLA Thrust Manipulation",
    family: "Manipulation",
    level: "Advanced",
    summary: "A rapid, low-amplitude thrust delivered to a joint after appropriate examination, consent and safety screening.",
    science: ["Benefits are most plausibly neurophysiological and movement-related rather than 'putting a bone back in place'.", "Clinical effects are typically short-term and should be paired with active rehabilitation.", "Cervical thrust techniques require advanced training, informed consent and careful vascular/neurological risk assessment."],
    procedure: ["Confirm a clinical indication and exclude contraindications.", "Explain options, expected benefits, uncertainties and risks; obtain informed consent.", "Position the patient without end-range provocation.", "Take up controlled pre-thrust tension with minimal force.", "Deliver the thrust only if safety and patient comfort remain acceptable.", "Reassess immediately and provide active follow-up care."],
    dosage: ["Usually one or a small number of attempts rather than repeated high-force thrusting.", "Do not repeat simply to obtain an audible cavitation."],
    indications: ["Selected mechanical joint pain or hypomobility when lower-risk options are appropriate and insufficient", "Short-term improvement to facilitate active care"],
    precautions: ["Older age or bone fragility", "Connective-tissue disorder", "Anticoagulation", "Recent trauma", "Cervical vascular risk factors"],
    contraindications: ["Fracture or instability", "Severe osteoporosis", "Active inflammatory instability", "Malignancy affecting the region", "Myelopathy", "Suspected cervical arterial pathology", "Patient does not consent"],
    reassessment: ["Pain", "Range", "Neurological status", "Functional task"],
    pearls: ["A cavitation is not proof of correction and is not required for a good outcome.", "Only clinicians with appropriate formal training should perform thrust manipulation."]
  },
  {
    slug: "pnf-manual-techniques",
    name: "PNF Manual Techniques",
    family: "Neuromuscular Facilitation",
    level: "Intermediate",
    summary: "Manual resistance, stretch and diagonal movement patterns used to facilitate coordinated movement and functional motor control.",
    science: ["Uses task-specific sensory input, resistance and patterned movement to influence motor output.", "Techniques include rhythmic initiation, repeated contractions, hold-relax, contract-relax, stabilizing reversals and rhythmic stabilization.", "It is a flexible clinical framework rather than a single technique."],
    procedure: ["Select a functional goal and relevant diagonal or movement pattern.", "Position therapist contacts to guide direction without causing pain.", "Use verbal cues, visual tracking and graded manual resistance.", "Select the PNF technique that matches the goal: mobility, initiation, strength or stability.", "Translate the gain into a functional task."],
    dosage: ["Usually short sets of high-quality repetitions with rest.", "Resistance should allow smooth movement rather than maximal effort unless specifically testing strength."],
    indications: ["Neurological rehabilitation", "Sports and orthopedic rehabilitation", "Movement coordination deficits"],
    precautions: ["Painful acute injury", "Cardiovascular limitations with sustained isometrics"],
    contraindications: ["Movement or contraction prohibited by surgical or medical restrictions"],
    reassessment: ["Movement quality", "Strength", "Functional task", "Balance or control"],
    pearls: ["Use the pattern to improve function, not because the diagonal itself is the goal."]
  },
  {
    slug: "fascial-manipulation",
    name: "Fascial Manipulation",
    family: "Fascial & Soft-Tissue",
    level: "Advanced",
    summary: "A system of assessment and focused manual loading of selected fascial regions based on movement dysfunction patterns.",
    science: ["Proposed mechanisms involve fascial tissue behavior and nociceptive modulation, but several system-specific claims remain under investigation.", "Clinical use should distinguish established observations from theoretical constructs.", "Active movement reassessment is essential after treatment."],
    procedure: ["Map the patient's movement problem and relevant regions.", "Identify clinically relevant tender or densified areas according to the system used.", "Apply controlled focused friction or pressure within tolerance.", "Limit treatment volume to avoid excessive soreness.", "Reassess movement and symptoms."],
    dosage: ["Short focused treatment per selected point, avoiding aggressive tissue trauma.", "Follow with movement and load progression."],
    indications: ["Selected myofascial movement disorders as an adjunct"],
    precautions: ["Fragile skin", "High pain sensitivity", "Anticoagulation"],
    contraindications: ["Open wound", "Acute infection", "DVT", "Acute hematoma"],
    reassessment: ["Movement pattern", "Pain", "Functional task"],
    pearls: ["Present system-specific explanations as hypotheses, not settled facts."]
  },
  {
    slug: "active-release-style-soft-tissue",
    name: "Active Soft-Tissue Release",
    family: "Fascial & Soft-Tissue",
    level: "Intermediate",
    summary: "A clinician maintains targeted soft-tissue contact while the patient actively moves the related joint or muscle through range.",
    science: ["Combines local pressure with active tissue excursion and movement exposure.", "May improve short-term flexibility, pain and movement tolerance.", "Technique names and branded systems vary; the underlying clinical concept can be taught generically."],
    procedure: ["Identify a clinically relevant soft-tissue region.", "Place controlled contact over the tissue.", "Position the tissue shortened if appropriate.", "Maintain contact while the patient actively lengthens or moves through range.", "Reassess the target movement."],
    dosage: ["Commonly 3–8 slow repetitions per target area.", "Use tolerable pressure and avoid creating bruising."],
    indications: ["Movement-related soft-tissue discomfort", "Selected muscle/tendon stiffness"],
    precautions: ["Acute strain", "Bruising tendency", "Neuropathy"],
    contraindications: ["Open wound", "Acute tear requiring protection", "DVT", "Infection"],
    reassessment: ["Range", "Pain", "Functional movement"],
    pearls: ["Active movement is the key feature; the pressure should guide, not overpower, the tissue."]
  },
  {
    slug: "manual-lymphatic-drainage",
    name: "Manual Lymphatic Drainage",
    family: "Specialized Manual Therapy",
    level: "Advanced",
    summary: "Gentle, specialized skin-stretch techniques used within comprehensive lymphedema management by appropriately trained clinicians.",
    science: ["Aims to support lymphatic fluid movement and edema management.", "Usually used as one component of complete decongestive therapy rather than as a stand-alone treatment.", "Compression, exercise, skin care and self-management are often central to long-term control."],
    procedure: ["Screen for causes of swelling and medical contraindications.", "Use light, rhythmical skin-stretch strokes following an appropriate drainage sequence.", "Avoid deep pressure that may damage fragile tissues.", "Combine with compression and therapeutic exercise when indicated.", "Measure limb response and educate self-management."],
    dosage: ["Session duration and frequency depend on lymphedema severity, phase of care and compression plan.", "Requires individualized clinical planning."],
    indications: ["Selected lymphedema after medical assessment", "Post-cancer treatment swelling when cleared"],
    precautions: ["Cardiac or renal disease", "Fragile skin", "Cancer-related precautions requiring medical coordination"],
    contraindications: ["Acute cellulitis", "Untreated DVT", "Acute decompensated heart failure", "Unexplained new swelling until medically assessed"],
    reassessment: ["Circumference or volume", "Skin condition", "Symptoms", "Function"],
    pearls: ["Unilateral new swelling should never be assumed to be simple lymphedema without appropriate medical screening."]
  },
  {
    slug: "scar-mobilization",
    name: "Scar Mobilization",
    family: "Specialized Manual Therapy",
    level: "Foundation",
    summary: "Graded manual loading of healed scar and surrounding tissues to improve comfort, mobility and tolerance to movement.",
    science: ["Mature scar can adapt to progressive mechanical loading.", "Manual contact may help pain, sensitivity and local mobility, especially when paired with movement.", "Scar appearance alone does not determine the need for treatment."],
    procedure: ["Confirm wound closure and healing status.", "Assess scar sensitivity, adherence and impact on movement.", "Begin with light skin movement and progress to multidirectional loading.", "Add movement that tensions the scar region.", "Reassess function and sensitivity."],
    dosage: ["Short daily self-mobilization may be used once healing is adequate and the patient is instructed.", "Intensity should not disrupt tissue integrity."],
    indications: ["Healed postoperative or traumatic scar limiting comfort or movement"],
    precautions: ["Recent wound closure", "Radiated or fragile tissue", "Altered sensation"],
    contraindications: ["Open wound", "Infection", "Dehiscence", "Unhealed surgical site"],
    reassessment: ["Scar mobility", "Sensitivity", "Range", "Functional task"],
    pearls: ["Never mobilize an unhealed incision simply because it feels stiff."]
  }
];

export const manualTherapyFamilies = Array.from(
  new Set(manualTherapyTechniques.map((item) => item.family))
);
