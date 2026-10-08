/**
 * Brief technique-specific moments of clinical wit.
 *
 * Educational analogy != mechanistic proof. The challenge answer remains
 * clinically conservative; serious safety decisions are never punchlines.
 */
export type ManualTherapyAhaMoment = {
  hook: string;
  analogy: string;
  challenge: string;
  reveal: string;
};

export const manualTherapyAhaMoments: Record<string, ManualTherapyAhaMoment> = {
  "maitland-joint-mobilization": {
    hook: "The joint doesn't come with a 'stiffness meter.'",
    analogy: "Think of Maitland as a careful conversation: you ask a question with a graded oscillation, and the patient's movement replies. A harder question is not automatically a smarter one.",
    challenge: "After the mobilization, the joint feels softer under your hand—but neck rotation is unchanged. Is the technique a success?",
    reveal: "Not yet. Palpated feel alone is not the goal. Recheck the familiar movement, symptoms and function, and revise the plan if nothing meaningful improves."
  },
  "kaltenborn-evjenth-mobilization": {
    hook: "Joint surfaces never studied the convex–concave rule.",
    analogy: "The treatment plane is your map, not your autopilot. Traction and glide help you navigate, but the patient tells you whether you are heading in the right direction.",
    challenge: "A glide follows the textbook direction perfectly, but the task remains painful. What wins: the diagram or the reassessment?",
    reveal: "The reassessment. The model informs a safe trial; it cannot substitute for a useful clinical change."
  },
  "mulligan-mobilization-with-movement": {
    hook: "Imagine a movement getting a second audition.",
    analogy: "The first squat hurts. Now repeat it with an appropriate accessory glide. If it becomes comfortable, the movement gets another chance—but the therapist still has to show the improvement lasts after the hands leave.",
    challenge: "The patient reports sharp pain during an MWM repetition. Should you finish the set anyway?",
    reveal: "No. A pain-free, beneficial response is central to the approach. Modify the glide or stop and reconsider."
  },
  "mulligan-snags-nags": {
    hook: "Your hand is not a steering wheel for the patient's neck.",
    analogy: "With a carefully selected SNAG, the patient remains an active driver of the movement. Your role is to guide the trial safely, not to force the turn farther than their symptoms allow.",
    challenge: "A cervical glide produces dizziness and an unusual headache. Is that just part of finding the right angle?",
    reveal: "No. Stop, assess the symptoms appropriately and do not continue manual treatment through concerning signs."
  },
  "cyriax-deep-transverse-friction": {
    hook: "A tendon cannot be persuaded by a tougher thumb.",
    analogy: "You can make a sore spot sore-er; that does not mean you helped it. Local friction is a possible adjunct, not a substitute for a carefully graded loading plan.",
    challenge: "The tendon feels very tender after friction, but grip remains worse. Was extra soreness proof that the technique reached the target?",
    reveal: "No. Greater tenderness is not a measure of treatment success. Reconsider the dose and prioritize function and loading tolerance."
  },
  "muscle-energy-technique": {
    hook: "The patient is not a passenger in MET.",
    analogy: "Instead of the therapist pushing while the patient waits, both take a tiny, coordinated turn. A gentle contraction becomes a doorway to reassessing comfortable movement.",
    challenge: "If a 15% effort works comfortably, is a maximal contraction likely to be better?",
    reveal: "Not necessarily. Low, controlled effort and a clean response often matter more than strength. Match effort to the patient and protocol."
  },
  "strain-counterstrain": {
    hook: "Plot twist: sometimes the answer is less stretch.",
    analogy: "A tender muscle is already complaining. Strain Counterstrain asks whether a comfortable, shortened position can calm the situation instead of arguing with the tissue.",
    challenge: "The selected position increases tenderness rather than easing it. Should you keep holding?",
    reveal: "No. Adjust toward a genuine position of ease or stop and reassess; comfort and symptom response guide this technique."
  },
  "myofascial-release": {
    hook: "Fascia does not send a 'release complete' notification.",
    analogy: "You might feel a change beneath your hands, but your most reliable update comes from the patient: can they now reach, turn or bend more comfortably? Touch starts the conversation; movement finishes it.",
    challenge: "The therapist senses a dramatic 'melting' feeling, yet the patient's shoulder reach is unchanged. What has actually been demonstrated?",
    reveal: "A change in the therapist's sensation—not a proven structural release or functional gain. Reassess, avoid overstated claims and adapt the plan."
  },
  "soft-tissue-mobilization": {
    hook: "More pressure is not a loyalty programme.",
    analogy: "Your hands don't earn bonus points for every extra newton. Soft-tissue mobilization works best as a thoughtful trial of contact, comfort and function—not a contest to see how much the patient can tolerate.",
    challenge: "The patient guards more as pressure increases. Does that mean you are finally reaching the right depth?",
    reveal: "No. Guarding can signal poor tolerance. Reduce or stop the input and reconsider the approach."
  },
  "trigger-point-compression": {
    hook: "Not every tender spot is the villain of the story.",
    analogy: "Finding a tender area is like finding a clue in a detective novel: interesting, but not enough to solve the whole case. Sleep, load, movement and other causes may be part of the plot.",
    challenge: "A tender point hurts under your thumb. Does that establish it as the sole cause of the patient's pain?",
    reveal: "No. It is one finding. Interpret it alongside symptoms, examination and the patient's functional problem."
  },
  "iastm": {
    hook: "The metal tool is shiny; the clinical result should be clearer.",
    analogy: "Redness can look dramatic, but the skin is not a scoreboard. The valuable question is whether the patient can move or load more comfortably—not whether the tool left its autograph.",
    challenge: "An instrument leaves red marks but no improvement in motion or comfort. Has a useful outcome been established?",
    reveal: "No. Visible skin response is not evidence of benefit. Do not intentionally chase petechiae or bruising."
  },
  "neurodynamic-mobilization": {
    hook: "Nerves are not elastic bands to be stretched for points.",
    analogy: "An angry nerve-related symptom is a reason to be curious, not heroic. A small, coordinated slider may tell you more than pulling harder at the first sign of tingling.",
    challenge: "Tingling intensifies and lingers after every repetition. Should the clinician push for a larger range?",
    reveal: "No. Reduce or stop the input and reassess neurological and symptom responses. Neurodynamic treatment should be graded and tolerable."
  },
  "manual-traction": {
    hook: "'Pull harder' is not a treatment objective.",
    analogy: "Sometimes a gentle unloading trial offers helpful symptom information. Traction is not a tow truck that drags a disc back into position; the patient's response still decides whether it belongs in care.",
    challenge: "Traction temporarily feels good, but the patient's chosen activity remains unchanged. What should you avoid claiming?",
    reveal: "Do not claim a displaced disc or joint has been repositioned. The response may still be relevant, but assess meaningful function and overall progress."
  },
  "high-velocity-low-amplitude-thrust": {
    hook: "A pop is sound design, not a clinical outcome.",
    analogy: "Movies use sound effects to announce the big moment. Manual therapy does not get that luxury: a joint sound can occur without showing that anything was 'put back in place.'",
    challenge: "There is no audible click after an appropriately selected thrust. Does that alone mean it failed?",
    reveal: "No. Sound is not the outcome measure. Safety, informed consent and meaningful symptom or functional change matter far more."
  },
  "pnf-manual-techniques": {
    hook: "A diagonal is a rehearsal, not the entire show.",
    analogy: "Beautiful movement patterns look great in a teaching lab. But the real encore happens when a patient rolls, reaches or steps more confidently in everyday life.",
    challenge: "The patient performs a perfect PNF diagonal but still struggles to put on a shirt. What's missing?",
    reveal: "Transfer to the functional goal. Adapt practice toward the activity and reassess performance where it matters."
  },
  "fascial-manipulation": {
    hook: "An interesting map still needs a destination.",
    analogy: "A fascial model can suggest a place to explore, but it cannot tell you the ending in advance. Think 'clinical hypothesis,' not 'hidden knot located with certainty.'",
    challenge: "A distant contact seems to ease movement immediately. Does that prove the exact proposed fascial mechanism?",
    reveal: "No. A useful response does not by itself validate every proposed mechanism. Preserve uncertainty and retest the function."
  },
  "active-release-style-soft-tissue": {
    hook: "This time, the patient joins the plot.",
    analogy: "The therapist makes a controlled contact; the patient adds active movement. It is a duet, not a solo performance by a pair of thumbs.",
    challenge: "The movement becomes sharper as contact pressure increases. Is that a cue to press deeper?",
    reveal: "No. Adjust or stop the technique. Both the manual input and active movement should remain within a clinically acceptable response."
  },
  "manual-lymphatic-drainage": {
    hook: "Gentle does not mean casual.",
    analogy: "The light touch may look simple, but the important decisions happen before the first movement: why is this limb swollen, and is it safe to treat?",
    challenge: "A person has new, unexplained one-sided leg swelling. Should manual drainage begin immediately?",
    reveal: "No. New unexplained unilateral swelling needs appropriate medical evaluation, including consideration of thrombosis, before routine manual treatment."
  },
  "scar-mobilization": {
    hook: "Healing is the opening chapter, not a footnote.",
    analogy: "A scar can tell a long story—tenderness, hesitation and altered movement. But pulling on an unhealed incision is like opening a book before the pages are bound.",
    challenge: "The incision is not fully healed, but the skin feels stiff. Should you mobilize it to avoid future restriction?",
    reveal: "No. Respect wound healing and surgical restrictions. Consider graded scar contact only when appropriate and cleared."
  },
  "paivm-ppivm-spinal-assessment": {
    hook: "A stiff-feeling segment is a clue, not a courtroom verdict.",
    analogy: "Your hands can ask useful questions about movement and symptom response, but one palpation finding does not get to declare a vertebra 'out of place.'",
    challenge: "Two clinicians disagree about which segment is stiff. What should guide the next decision?",
    reveal: "Use history, neurological examination, active movement and a reproducible comparable sign. Segmental palpation is one imperfect piece of the assessment."
  },
  "myofascial-decompression-dry-cupping": {
    hook: "The circles are memorable. The evidence needs a better selfie.",
    analogy: "Cupping marks may attract attention, but they are not a progress report. Darker circles don't mean more toxins were removed—because toxin removal is not an established explanation.",
    challenge: "A patient asks for stronger suction to make darker marks. What is the appropriate response?",
    reveal: "Explain the limits of the evidence and the skin risks. Choose conservative, appropriate suction only when clinically justified; do not chase discoloration."
  },
  "facilitated-positional-release": {
    hook: "Sometimes the shortest chapter is the gentlest one.",
    analogy: "Brief, comfortable positioning may be all you need for a sensible trial. The technique doesn't need a dramatic finale; it needs a clear, measurable response.",
    challenge: "A brief, comfortable trial produces no change. Is applying much more force the obvious next step?",
    reveal: "No. Reassess the original movement and reconsider the choice. Evidence is limited, and force escalation is not a substitute for clinical reasoning."
  }
};

export function getManualTherapyAhaMoment(slug: string): ManualTherapyAhaMoment | undefined {
  return manualTherapyAhaMoments[slug];
}
