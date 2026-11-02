/**
 * Narrative bridges for PNA's 22 manual therapy parent techniques.
 * These hypothetical educational scenes introduce reasoning only; the exact
 * technique procedures, medical cautions, and evidence notes stay in the source registries.
 */
export type ClinicalNarrative = {
  clue: string;
  trial: string;
  ending: string;
};

export const clinicalNarratives: Record<string, ClinicalNarrative> = {
  "maitland-joint-mobilization": {
    clue: "First, find one movement the patient recognizes. Neck rotation, overhead reach or a painful bend becomes your reference point. Note the range, the pain and what makes it worse; irritability matters more than chasing a textbook grade.",
    trial: "With the patient supported, choose a direction and rhythm that can be tested safely. A controlled oscillation is a question asked with your hands: does this input change the complaint, or merely reproduce it?",
    ending: "Ask for the same movement after the trial. Improvement gives you a useful short-term clue, not proof that a bone was 'out of place'. No change is information too. Follow the result, not your favorite technique."
  },
  "kaltenborn-evjenth-mobilization": {
    clue: "Imagine a stiff-feeling shoulder. The visible movement is large, yet small translations between joint surfaces may influence the examination. The convex–concave model can help you choose where to begin; it is not a substitute for listening to the patient.",
    trial: "Set the joint comfortably, stabilize carefully and choose traction or a directional glide with a specific goal. The dose should fit pain, tissue response and the person's level of irritability—not the clinician's strength.",
    ending: "The treatment only earns its place if something meaningful changes. Return to the movement or activity that was limited, and let that retest outweigh the elegance of the anatomical diagram."
  },
  "mulligan-mobilization-with-movement": {
    clue: "The patient squats and the knee hurts. Before trying to correct anything, watch exactly where the movement becomes difficult. A well-chosen comparable sign is the beginning of the investigation.",
    trial: "Offer a controlled accessory glide while the patient actively repeats the task. Mulligan MWM should produce a comfortable, useful response. If pain appears, modify the direction, ease the pressure or abandon that attempt.",
    ending: "When your hands leave, can the patient perform the same task more comfortably? A helpful response opens the door to practice; it does not prove you permanently repositioned a joint."
  },
  "mulligan-snags-nags": {
    clue: "The person turns their head toward traffic and stops halfway. Is the main problem pain, restriction or a symptom pattern that calls for further screening? That difference determines whether a cervical manual trial makes sense.",
    trial: "Choose the trained technique's precise contact and direction. For SNAGs, the patient moves actively while the glide remains controlled and comfortable. Never push through unusual neurological or vascular-type warning symptoms.",
    ending: "Retest the same head turn without assistance. A small gain matters when it makes the patient's real task easier; persistent symptoms require a new hypothesis, not automatically more force."
  },
  "cyriax-deep-transverse-friction": {
    clue: "A painful tendon may also be tender under the fingers, but a tender spot is not permission to rub harder. Consider tissue irritability, activity load and whether manual friction offers anything beyond well-planned exercise.",
    trial: "Where clinically justified, use a brief, precise transverse contact and monitor the reaction. The aim is a tolerable trial—not creating pain to prove that you have reached the correct tissue.",
    ending: "A successful outcome means the patient can load and use the region more comfortably. Intense soreness on the treatment table is not a measure of progress."
  },
  "muscle-energy-technique": {
    clue: "The patient says a muscle is tight, yet forcing a stretch seems to trigger more guarding. What if the next movement begins with cooperation instead of resistance? First identify a safe barrier and explain the task.",
    trial: "You steady the limb or region; the patient performs a small, deliberate contraction. Following relaxation, explore only the new comfortable range. The clinician guides the process without overpowering it.",
    ending: "When the movement improves, ask the patient to control that range independently. MET is most useful when it becomes a bridge to active movement rather than an isolated ritual."
  },
  "strain-counterstrain": {
    clue: "A tender point flares when the muscle is lengthened. This technique asks a surprisingly different question: where does the tenderness become quieter? The answer is usually a position that shortens the relevant tissues.",
    trial: "Guide the body toward ease and fine-tune the position while monitoring the tender point. Keep the patient relaxed, hold the chosen position according to the protocol and return slowly, without an abrupt stretch.",
    ending: "Recheck tenderness and the familiar movement. Reduced discomfort is a possible useful response; it is not evidence that a muscle was permanently 'reset'."
  },
  "myofascial-release": {
    clue: "The patient says, 'It feels stuck.' Respect that sensation without assuming an anatomical adhesion has been identified. Notice where movement feels restricted and which everyday action the patient wants back.",
    trial: "Apply slow, comfortable contact using a direct or indirect strategy appropriate for the person's response. Sensory input, expectations and movement tolerance may contribute; 'melting fascia' is not an established explanation.",
    ending: "When the patient repeats the task, does it feel easier? Use any helpful change for graded movement and loading. Function matters more than the story we tell about the tissue."
  },
  "soft-tissue-mobilization": {
    clue: "Two people describe the same tightness, but one tolerates touch comfortably and the other becomes sore after very light pressure. Those differences are the most important part of the opening examination.",
    trial: "Choose kneading, glide or sustained contact only to the extent that it helps the patient's symptoms and movement. Pressure is a clinical variable, not a measure of professional skill.",
    ending: "Finish with the task that was troublesome before treatment. If touch makes activity easier, use the opportunity; if not, repeating harder strokes is unlikely to solve the reasoning problem."
  },
  "trigger-point-compression": {
    clue: "A small region of muscle reproduces a familiar ache. Interesting—but not proof that a single 'knot' explains everything. Connect the local finding with movement, load, neurological symptoms and the wider history.",
    trial: "Apply measured, tolerable pressure and watch how the patient's familiar symptoms respond. Stop if the reaction becomes disproportionate, spreads worryingly or increases guarding.",
    ending: "Ask whether the original movement or function improves. A tender spot that feels less tender is useful information, but not the whole treatment goal."
  },
  "iastm": {
    clue: "An instrument can make an ordinary contact look dramatic. Scraping marks, however, do not show that scar tissue was broken down. Start by asking why this tool is preferable to a simpler contact.",
    trial: "Set a modest edge angle, pressure and duration; screen the skin and explain what the patient might notice. Avoid aggressive passes, especially over vulnerable or highly sensitive tissue.",
    ending: "Recheck walking, reaching or another meaningful task. A visible red streak is not an outcome measure. Better movement and tolerable recovery are."
  },
  "neurodynamic-mobilization": {
    clue: "A small ankle movement changes symptoms up the leg. That clue suggests the nervous system may be sensitive to movement, but it does not establish that a nerve is trapped.",
    trial: "Check the neurological picture and use a gentle movement strategy, often a slider, that respects symptom irritability. Coordinated motion matters more than maximizing stretch.",
    ending: "Look for calmer symptoms, better movement and timely recovery after the test. The patient should leave feeling safer to move, not overwhelmed by provoked tingling."
  },
  "manual-traction": {
    clue: "The patient asks if you can 'take the pressure off'. A sense of relief during unloading can be real without confirming what structure caused the pain. Screening for instability and other serious conditions comes first.",
    trial: "Support the region and introduce a careful, controlled pull in a relevant direction. Begin with the smallest force likely to clarify the response and stop if symptoms become worse or unexpected.",
    ending: "If the patient can then move more comfortably, traction may have provided a useful short-term window. It does not mean a disc or joint was pulled back into place."
  },
  "high-velocity-low-amplitude-thrust": {
    clue: "The loudest part of manipulation is often the least informative. Before a thrust, examine the history, risks, alternatives and informed preference. A click does not tell you what the underlying problem was.",
    trial: "Appropriate HVLA requires region-specific training, screening, consent and a clear clinical rationale. Suspected serious pathology, instability or neurological deterioration calls for a different decision.",
    ending: "Judge the intervention by patient safety, function and meaningful symptom change—not by whether a joint made a sound. The rest of rehabilitation remains essential."
  },
  "pnf-manual-techniques": {
    clue: "Someone struggles to roll in bed or bring a cup to their mouth. Instead of starting with a memorized diagonal, identify which part of this real movement needs more coordination, strength or confidence.",
    trial: "Use appropriate manual resistance, movement patterns and clear sensory cues so the patient actively participates. The task should challenge coordination without overwhelming it.",
    ending: "Repeat the meaningful activity. A smooth diagonal is satisfying, but the goal is a patient who can do more outside the treatment room."
  },
  "fascial-manipulation": {
    clue: "A painful action may lead an examiner to consider a site away from the obvious complaint. The fascial model offers a hypothesis, not a guaranteed anatomical map of the patient's problem.",
    trial: "After relevant assessment and consent, test an appropriate, tolerable contact against a clearly measured movement or symptom. Avoid claiming that an invisible structural fault has been definitively corrected.",
    ending: "If the action improves, acknowledge the helpful response and the uncertainty surrounding its mechanism. Clinical usefulness and scientific certainty are different questions."
  },
  "active-release-style-soft-tissue": {
    clue: "An area may feel fine at rest but pull when the patient reaches or bends. This invites a practical question: what changes when gentle contact and active motion happen together?",
    trial: "Place the patient comfortably and pair targeted, tolerable soft-tissue contact with controlled movement. Keep pressure within the person's limits rather than forcing tissue beneath the fingers.",
    ending: "Remove the contact and repeat the movement independently. Progress is what the patient can do without the therapist's hand."
  },
  "manual-lymphatic-drainage": {
    clue: "A swollen limb may feel heavy, but not every cause of swelling belongs in the treatment room. First consider whether new, unexplained or concerning swelling requires medical assessment.",
    trial: "For an appropriate condition, trained clinicians use gentle, planned skin movement within a broader edema-management program. Forceful massage is not the goal, and infection or possible thrombosis demands caution.",
    ending: "Follow objective swelling, comfort and daily activity over time. The meaningful story is better overall management, not a dramatic single-session impression."
  },
  "scar-mobilization": {
    clue: "The incision has closed, yet a reach or bend still feels unfamiliar. Healing status comes before manual treatment; not every pulling sensation means an adhesion must be broken.",
    trial: "Begin only after adequate healing, use graded comfortable touch and respect surgical restrictions. Link contact to safe active movement rather than aggressive stretching.",
    ending: "Measure what the patient can tolerate: touch, movement, clothing contact or daily tasks. A scar need not feel perfectly soft to stop limiting a person's life."
  },
  "paivm-ppivm-spinal-assessment": {
    clue: "One examiner says a segment feels stiff. Another may disagree. Segmental palpation offers a clue, not a reliable stand-alone diagnosis. The patient's symptoms and broader examination must lead.",
    trial: "Use the appropriate PAIVM accessory pressure or PPIVM physiological movement in a controlled way while monitoring the comparable sign. Never treat an assumed 'out-of-place' vertebra as an established finding.",
    ending: "Ask whether the assessment or short treatment trial changed the original movement or symptom pattern. Clinical hypotheses become stronger through converging evidence, not a single thumb test."
  },
  "myofascial-decompression-dry-cupping": {
    clue: "Cupping circles are memorable—and easy to mistake for proof of success. Explain that discoloration is a skin response, not evidence that toxins were removed or fascia was permanently changed.",
    trial: "If appropriate, check skin and bleeding risk, obtain consent and use conservative suction for a short monitored trial. Protect vulnerable tissue and avoid chasing stronger marks.",
    ending: "Retest the patient's relevant movement or symptom. Darker circles do not mean a better treatment, and an unhelpful trial does not deserve repetition by habit."
  },
  "facilitated-positional-release": {
    clue: "The region guards the moment the person tries to move. Could a brief position of ease help them begin again? That is a reasonable question, even though evidence for specific proposed mechanisms is limited.",
    trial: "Find a comfortable position, apply the chosen gentle facilitating input and return smoothly to neutral after the brief hold. Avoid escalating force when the method is not helping.",
    ending: "Reassess the movement that started the encounter and build any useful gain into active control. A concise, thoughtful trial beats a complicated ritual."
  }
};

export function getClinicalNarrative(slug: string): ClinicalNarrative | undefined {
  return clinicalNarratives[slug];
}
