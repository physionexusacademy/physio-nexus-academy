/** Read-aloud editorial weave: playful, clinically conservative, unique to 22 parent techniques.
 * Analogies aid recall; they are not mechanism claims or substitutes for protocol training.
 */
export type LessonWeave = { dialogue:string; watch:string; method:string; science:string; question:string; answer:string; closer:string };
export const lessonWeavePartA: Record<string, LessonWeave> = {
  "maitland-joint-mobilization": {
    dialogue: "Patient: 'Can you unlock this neck?' Clinician: 'First, let's see exactly which turn feels locked.' The hands do not get to start the story until the patient's movement has introduced the problem.",
    watch: "Picture the shoulders resting against the table, not creeping toward the ears. The contact is specific, the oscillation controlled, the patient's expression readable. The clinician stops briefly. 'Turn again—same speed, same direction.' Suddenly the reassessment feels like the plot twist, not a formality.",
    method: "A grading system is a useful vocabulary, not an automatic volume knob. A sore, irritable presentation may need a gentler trial; a stiffer but comfortable presentation raises different questions. Nobody wins extra marks for reaching a higher grade.",
    science: "Think of the nervous system as a mixing desk, not a jammed door hinge. Sensory input, expectation, motor guarding and tissue loading may all influence the final experience. One better head turn does not tell us which slider moved.",
    question: "The clinician thinks a segment feels 'looser', but the patient's original neck turn is unchanged. What should guide the decision?",
    answer: "The original comparable movement and symptom response. Record the finding, reconsider the technique or dosage, and avoid claiming a vertebra was mechanically realigned.",
    closer: "The thumb supplies the question. The patient's movement writes the answer."
  },
  "kaltenborn-evjenth-mobilization": {
    dialogue: "Patient: 'Why does the joint need a sideways movement when I want to lift my arm upward?' Clinician: 'Because the big movement includes smaller joint-surface motions. But our diagram is only a starting hypothesis.'",
    watch: "Imagine the arm fully supported while one hand stabilizes and the other introduces a measured glide. Nothing jerks; nothing needs to pop. The therapist asks about the familiar reach and watches the patient test it rather than admiring the neatness of the glide.",
    method: "Convex–concave principles help choose an initial direction, but they are not a GPS that shouts 'recalculating' whenever the patient disagrees. Anatomy, comfort, symptom behavior and clinical objective refine the trial.",
    science: "A joint is not two billiard balls rolling in an empty room: capsule, cartilage, muscles and neural responses all matter. The selected translatoric force is a controlled input, not visual proof of a particular hidden joint-surface correction.",
    question: "The glide follows the textbook perfectly but the functional reach worsens. Is the treatment still correct?",
    answer: "No meaningful positive response has been demonstrated. Stop or modify, assess symptom irritability, and use the patient's response rather than treating a model as a verdict.",
    closer: "The treatment plane is the map. Reassessment is the destination."
  },
  "mulligan-mobilization-with-movement": {
    dialogue: "Patient: 'So you hold my knee while I squat and it stops hurting?' Clinician: 'Maybe. But you get to be the judge, and the squat has to stay comfortable.' The patient looks pleased: finally, an examination they can grade themselves.",
    watch: "Watch the patient perform the identical task before and during the assisted glide. The clinician adjusts only within comfort. Then the contact disappears. The patient tries again alone. That unassisted repetition is where the story either delivers—or sends us back to the drawing board.",
    method: "The glide is not a secret joint-reset button. The intended Mulligan trial combines a carefully directed accessory movement with the patient's active action and an immediately favorable response. If pain climbs, abandon the hero pose.",
    science: "The patient's new experience could involve altered sensorimotor input, temporary symptom modulation or task confidence; a single successful squat cannot prove a joint was displaced and corrected.",
    question: "Assisted squatting is easier, but the pain returns immediately without the glide. Can you call the joint permanently corrected?",
    answer: "No. Treat it as a short-term trial response. Reassess dosage, independent movement and active rehabilitation, and avoid claims of permanent positional correction.",
    closer: "A skilled hand can open the door. The patient still has to walk through it."
  },
  "mulligan-snags-nags": {
    dialogue: "Patient: 'I need to turn my head to drive, not audition for a circus trick.' Clinician: 'Excellent. We'll test the actual movement, and comfort comes before range.'",
    watch: "Picture a seated patient, feet supported, eyes level. The practitioner chooses a trained, precise cervical contact. During an appropriate SNAG, the patient—not the therapist—performs the head turn. The task stops before unusual symptoms or painful forcing begin.",
    method: "This is guidance, not a steering wheel attached to someone else's neck. Keep the line of force controlled, check the symptom response immediately, and never let a smoother-looking movement hide concerning dizziness, headache or neurological changes.",
    science: "A short-term improvement in neck movement may reflect several interacting processes. It is not a camera view of a facet joint being 'pushed back' into a normal place.",
    question: "The patient reports sudden dizziness during the glide, even though rotation increased. Does the extra range make the technique successful?",
    answer: "No. Stop and assess the unexpected symptom appropriately; consider cervical vascular and neurological screening. A range gain never overrules safety.",
    closer: "The patient owns the neck turn; the therapist owns the responsibility to stop."
  },
  "cyriax-deep-transverse-friction": {
    dialogue: "Patient: 'Can you really rub a tendon healthy?' Clinician: 'That's a bigger claim than the evidence allows. First tell me what happens when you grip.' The tendon is excused from the press conference.",
    watch: "Imagine the carpenter testing a tool grip before local contact. The clinician identifies the tissue carefully, explains the planned brief friction trial and watches irritability. The same grip is tested afterward; nobody awards points for how much rubbing the patient endured.",
    method: "Transverse means across the relevant tissue orientation; it does not mean 'keep going until everyone regrets this appointment.' Local input, when chosen, needs a reason and a tolerable dose. Progressive loading remains central.",
    science: "Painful tendons have complex load-related and neurophysiological responses. A brief manual friction cannot be assumed to rearrange collagen or erase a tendinopathy; clinical outcomes need testing in function.",
    question: "The tendon becomes markedly sore after friction, yet the patient grips less comfortably. Is soreness proof the target was treated effectively?",
    answer: "No. Increased soreness alone is not a therapeutic marker. Reduce or abandon the local input, review irritability and prioritize graded loading.",
    closer: "The grip test has better judgment than the therapist's thumb."
  },
  "muscle-energy-technique": {
    dialogue: "Patient: 'How hard should I push?' Clinician: 'Imagine pressing a doorbell, not trying to move the building.' The patient laughs—and finally stops recruiting every muscle in the room.",
    watch: "Picture a well-supported limb at a comfortable barrier. The patient's contraction is brief, deliberate and easy to breathe through. The clinician matches the effort, waits for relaxation, then explores the changed movement rather than assuming there must be a dramatic release.",
    method: "MET is a partnership: the patient's gentle force gives information and movement practice, and the therapist provides controlled resistance and positioning. Maximal contraction is not the secret bonus level.",
    science: "Post-contraction comfort and range changes are not simply proof that a muscle was lengthened. Sensorimotor responses, altered tolerance and active participation may matter, and mechanisms remain technique- and condition-dependent.",
    question: "A patient braces, holds their breath and pushes at maximum effort. Do you count the repetition as a better MET trial?",
    answer: "No. Stop, re-explain low controlled effort and easy breathing, and tailor the selected muscle action and dose to the clinical presentation.",
    closer: "Less wrestling, more teamwork. That is the whole plot."
  },
  "strain-counterstrain": {
    dialogue: "Patient: 'Wait—you want me to move toward the comfortable side instead of stretching the sore one?' Clinician: 'Exactly. For once, the muscle doesn't have to argue with us.'",
    watch: "A tender point is identified using respectful contact. The clinician moves the supported body into a comfortable position that shortens the relevant tissues; the patient's face softens, and the monitor contact becomes less sensitive. Nothing is forced. The return to neutral happens slowly enough that the patient barely notices.",
    method: "Position of ease is not a cute label for a stretch. The tender tissues are generally shortened, not pulled into resistance; the exact region-specific positioning is chosen by anatomy and response. No active muscle contraction is demanded in classical SCS.",
    science: "Comfort-focused positioning may change nociceptive and protective responses, but a tender point feeling easier does not show that a muscle spindle was reset or that a fixed structural lesion disappeared.",
    question: "The therapist moves the neck away from a monitored upper-trapezius tender point and tenderness increases. Should the hold continue because the protocol timer started?",
    answer: "No. Reassess the point and restore a genuine position of ease with appropriate shortening; stop if an acceptable comfortable position cannot be found.",
    closer: "The plot twist is comfort—and it is doing actual clinical work."
  },
  "myofascial-release": {
    dialogue: "Patient: 'Will you melt the fascia?' Clinician: 'If I could melt connective tissue with my hands, I would have a very different job—and some serious explaining to do.' They agree instead to measure an overhead reach.",
    watch: "The hand contact is broad and unhurried. For direct work, the clinician gradually engages perceived resistance; for indirect work, the region follows a comfortable direction. The patient breathes, the clinician observes, and the room stays pleasantly free of the word 'magic'.",
    method: "A sensation beneath the palms is useful feedback, not a press release about microscopic tissue change. Choose an appropriate contact and dose, observe guarding and movement, then remove the hands and repeat the original action.",
    science: "Fascia is connective tissue, but short-term symptom changes do not prove it has melted, broken adhesions or permanently reshaped. Sensory input, expectations and movement tolerance are plausible contributors; exact mechanisms are uncertain.",
    question: "The therapist feels a dramatic 'release' yet the patient's overhead reach is unchanged. What has been demonstrated?",
    answer: "A subjective change in therapist sensation, not a confirmed functional gain or fascial remodelling. Retest, adjust the hypothesis and support active movement as appropriate.",
    closer: "The hands can feel a story. The reach determines its ending."
  },
  "soft-tissue-mobilization": {
    dialogue: "Patient: 'Doc, go as deep as possible!' Clinician: 'My job is to help you move, not to win a thumb-wrestling championship against your calf.'",
    watch: "The supported muscle rests quietly. The therapist changes direction and pressure in small, measured ways, noticing whether the patient can breathe and remain comfortable. A short trial is followed by standing or walking, because life happens off the treatment table.",
    method: "Palms, supported fingers and forearms each offer different contact options. More force is not more precise. A patient who guards harder as the hand presses deeper is sending a very useful message: change course.",
    science: "Manual contact can alter perceived discomfort and movement tolerance. Palpable 'softness' is not direct proof of adhesions being torn or a muscle permanently lengthening.",
    question: "The therapist feels the tissue soften but the patient's first step is more painful. Which observation guides treatment?",
    answer: "The worse functional response matters. Reassess pressure, irritability and the plan rather than treating palpated softness as success.",
    closer: "The real treatment outcome walks out of the room on its own legs."
  },
  "trigger-point-compression": {
    dialogue: "Patient: 'Found the knot, right?' Clinician: 'Found a tender clue. Let's not arrest the first suspect.' A painful spot can be memorable without being the whole diagnosis.",
    watch: "The clinician supports the relevant limb, locates the muscular area carefully and starts with light, steady contact. The patient identifies a familiar sensation. The clinician asks whether it stays tolerable; electric or spreading symptoms prompt immediate reassessment.",
    method: "Compression is not an attempt to crush a literal pebble inside a muscle. Tolerable pressure and the later movement test matter more than bravado. The clinician's index finger is not a detective badge.",
    science: "Local tenderness and referred discomfort are real experiences, but trigger-point identification and explanatory models have limitations. Reduced tenderness after pressure cannot establish the single cause of a complex pain complaint.",
    question: "Pressing one spot reproduces familiar shoulder pain. Does that prove the spot alone explains the entire complaint?",
    answer: "No. Combine the finding with movement, load, neurological screening and patient history. Test whether treatment improves a meaningful task.",
    closer: "One clue can start the case. It rarely closes it."
  },
  "iastm": {
    dialogue: "Patient: 'That tool looks powerful. Will it scrape away all the bad tissue?' Clinician: 'Let's aim for better movement, not an impressive photo of your skin.'",
    watch: "The instrument catches the clinic light. Before using it, the clinician screens skin integrity and bleeding risk, chooses a controlled edge and angle, then uses a small tolerable trial. The patient repeats the chosen activity before anyone celebrates.",
    method: "The tool can deliver contact in a way hands sometimes cannot, but pressure, exposure and skin response still need care. Petechiae are not proof of effectiveness, and aggressive scraping is not the advanced level of a video game.",
    science: "Possible sensory and short-term symptom effects do not show 'scar tissue breaking'. Skin discoloration is a local response; meaningful improvement requires function and symptom assessment.",
    question: "A treatment leaves impressive red streaks, but stair descent is unchanged. What did the practitioner prove?",
    answer: "Only that the skin responded. Avoid intentionally pursuing redness or bruising and choose next steps based on function, symptoms and safety.",
    closer: "The stainless steel shines. Clinical reasoning has to shine brighter."
  }
};
