import type { ManualTherapyTechnique } from "@/lib/manual-therapy";

export const manualTherapyAdditions: ManualTherapyTechnique[] = [
  {
    slug: "paivm-ppivm-spinal-assessment",
    name: "PAIVM & PPIVM Spinal Assessment / Mobilization",
    family: "Spinal Mobilization",
    level: "Advanced",
    summary:
      "Passive accessory and physiological intervertebral movement testing used as part of a broader spinal examination, with treatment guided by symptom response rather than assumed segmental diagnosis.",
    science: [
      "PAIVMs apply controlled accessory forces such as central or unilateral posterior-anterior pressure; PPIVMs examine passive physiological movement between spinal segments.",
      "Segmental motion palpation has limited stand-alone reliability and diagnostic validity, so findings should be interpreted alongside history, neurological examination, active movement and the patient's comparable sign.",
      "The most defensible clinical use is hypothesis testing: does a controlled segmental input reproduce, reduce or meaningfully change the patient's symptoms or movement?"
    ],
    procedure: [
      "Establish active movement, neurological status and the comparable sign before segmental testing.",
      "Position the patient so the region is relaxed and the target level can be contacted without unnecessary force.",
      "For PAIVM, apply a graded central or unilateral accessory pressure while monitoring pain, resistance and symptom distribution.",
      "For PPIVM, guide the relevant physiological movement while palpating relative segmental motion.",
      "Do not label a segment 'stuck' or 'out of place' from palpation alone.",
      "If a treatment trial is used, reassess the original comparable sign immediately and retain the technique only when it produces a useful change."
    ],
    dosage: [
      "Assessment uses the minimum force needed to judge symptom response and movement behavior.",
      "When used therapeutically, oscillatory bouts of roughly 30–60 seconds for 2–4 sets can be trialed, with grade and amplitude matched to irritability.",
      "Dose is response-led rather than predetermined by a palpated stiffness finding."
    ],
    indications: [
      "Mechanical spinal pain with a reproducible comparable sign",
      "Painful or restricted spinal movement where a segmental treatment trial may help",
      "Adjunct to a broader cervical, thoracic or lumbar examination"
    ],
    precautions: [
      "High irritability",
      "Osteoporosis or fracture risk",
      "Recent trauma or surgery",
      "Neurological symptoms",
      "Upper cervical presentations requiring specific vascular and ligamentous screening"
    ],
    contraindications: [
      "Suspected fracture or instability",
      "Acute myelopathy or progressive neurological deficit",
      "Active infection or malignancy affecting the region",
      "Suspected cervical arterial pathology",
      "Any presentation requiring urgent medical assessment"
    ],
    reassessment: [
      "Original comparable sign",
      "Active spinal range",
      "Symptom distribution",
      "Neurological status when relevant",
      "Functional task meaningful to the patient"
    ],
    pearls: [
      "Treat PAIVM/PPIVM findings as one piece of clinical reasoning, not a stand-alone diagnosis.",
      "A segment that feels stiff to the examiner is not automatically the source of pain.",
      "Use the smallest effective manual input, then transfer any gain into active movement."
    ]
  },
  {
    slug: "myofascial-decompression-dry-cupping",
    name: "Myofascial Decompression / Dry Cupping",
    family: "Instrument-Assisted",
    level: "Intermediate",
    summary:
      "Non-invasive negative-pressure cupping used as a short-term adjunct for symptom modulation and movement exposure, with evidence and claims kept conservative.",
    science: [
      "Dry cupping creates local negative pressure that deforms skin and superficial soft tissue and produces strong sensory input.",
      "Proposed effects include short-term changes in pain sensitivity, local blood flow and movement tolerance; evidence for clinically important benefit remains uncertain.",
      "It should not be presented as removing toxins, breaking adhesions or permanently changing fascia."
    ],
    procedure: [
      "Screen skin, vascular status, sensation, medications and relevant medical history.",
      "Explain that temporary circular skin discoloration can occur and obtain consent.",
      "Apply an appropriate cup to intact skin with conservative suction.",
      "Use static placement or controlled movement only when comfortable and anatomically safe.",
      "Limit the first exposure, monitor skin response and symptoms, then remove the cup without tissue trauma.",
      "Reassess movement or function and combine any short-term benefit with active rehabilitation."
    ],
    dosage: [
      "Use the lowest suction that produces a tolerable treatment effect.",
      "Short applications of approximately 3–10 minutes per region are generally more defensible than prolonged aggressive suction.",
      "Reduce duration and suction for first-time, highly sensitive or easily bruised patients."
    ],
    indications: [
      "Selected musculoskeletal pain where the patient prefers a trial of adjunctive care",
      "Perceived soft-tissue tightness",
      "Short-term movement preparation before active exercise"
    ],
    precautions: [
      "Anticoagulant or antiplatelet use",
      "Fragile skin",
      "Reduced sensation",
      "Varicosities",
      "History of excessive bruising"
    ],
    contraindications: [
      "Open wound, burn or active skin infection",
      "Suspected DVT or thrombophlebitis",
      "Uncontrolled bleeding disorder",
      "Acute serious illness",
      "Application where suction could compromise vulnerable tissue"
    ],
    reassessment: [
      "Pain and movement tolerance",
      "Skin response",
      "Functional task",
      "Post-treatment soreness at follow-up"
    ],
    pearls: [
      "More discoloration does not mean a better treatment.",
      "Do not use cupping as a substitute for loading, exercise or medical assessment.",
      "If there is no meaningful change in the patient's comparable sign, do not keep repeating the technique by habit."
    ]
  },
  {
    slug: "facilitated-positional-release",
    name: "Facilitated Positional Release (FPR)",
    family: "Osteopathic & Neuromuscular",
    level: "Advanced",
    summary:
      "An indirect positional technique using a brief position of ease with a facilitating force such as compression or torsion to reduce pain or guarding before active rehabilitation.",
    science: [
      "FPR is taught as a rapid indirect technique that unloads or shortens a symptomatic region before adding a controlled facilitating force.",
      "Plausible clinical effects include altered sensory input, reduced protective muscle activity and short-term changes in movement tolerance.",
      "Evidence is limited compared with mainstream exercise and guideline-supported rehabilitation, so FPR should be framed as an adjunct rather than a corrective structural treatment."
    ],
    procedure: [
      "Identify a reproducible painful or restricted movement and screen for contraindications.",
      "Position the region toward relative ease without forcing end range.",
      "Add the selected facilitating force, commonly gentle compression, distraction or torsion depending on the region and training model.",
      "Maintain a comfortable, controlled position briefly while monitoring the patient.",
      "Return slowly to neutral.",
      "Immediately reassess pain, range and function, then reinforce improvement with active movement."
    ],
    dosage: [
      "Use low-force, brief holds, often around 3–10 seconds depending on the region and patient response.",
      "Repeat only a small number of times before reassessment.",
      "Avoid escalating force when the technique does not produce a clear clinical benefit."
    ],
    indications: [
      "Selected painful muscle guarding",
      "Movement restriction with high irritability",
      "Short-term symptom modulation to enable active exercise"
    ],
    precautions: [
      "Osteoporosis",
      "Recent surgery",
      "High symptom irritability",
      "Poor tolerance of positioning"
    ],
    contraindications: [
      "Unstable fracture or dislocation",
      "Acute neurological deterioration",
      "Positioning that compromises breathing or circulation",
      "Active infection or serious pathology in the region"
    ],
    reassessment: [
      "Pain with the comparable sign",
      "Range of motion",
      "Muscle guarding",
      "Functional task"
    ],
    pearls: [
      "The clinical target is a useful change in symptoms or movement, not correction of a presumed positional fault.",
      "Keep the technique gentle and brief.",
      "If active movement cannot retain the improvement, the manual effect has limited practical value."
    ]
  }
];
