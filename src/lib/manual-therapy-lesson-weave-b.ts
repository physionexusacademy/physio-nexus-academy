import type { LessonWeave } from "@/lib/manual-therapy-lesson-weave-a";
/** Companion half of the technique-specific PNA storytelling weave. */
export const lessonWeavePartB: Record<string, LessonWeave> = {
  "neurodynamic-mobilization": {
    dialogue: "Patient: 'Does this mean my nerve is trapped?' Clinician: 'It means a movement changes your symptoms. That's a clue, not a courtroom confession from the nerve.'",
    watch: "Picture the leg or arm fully supported. A small joint movement changes a familiar tingle. The clinician notices when symptoms appear and how quickly they settle. Rather than tugging harder for drama, a gentle slider explores a tolerable response with coordinated movement along the neural pathway.",
    method: "Sliders are not stretching competitions. They deliberately vary mechanical loading along different parts of a pathway, aiming to stay within an acceptable symptom response. Pain that lingers afterward is information to respect.",
    science: "Neurodynamic tests and interventions can affect symptoms through several processes. Symptom reproduction alone does not prove nerve entrapment, and neural tissue is not an ordinary elastic band.",
    question: "A slider causes tingling that intensifies after each repetition and lingers afterward. Is a larger excursion the next step?",
    answer: "No. Stop or reduce the trial, reassess symptom irritability and neurological findings, and avoid provoking progressive symptoms.",
    closer: "The nerve is not auditioning for the longest stretch award."
  },
  "manual-traction": {
    dialogue: "Patient: 'Can you pull my disc back into place?' Clinician: 'Let's first see whether carefully unloading the region changes what you feel. It's not a towing service for vertebrae.'",
    watch: "The patient is supported; the therapist establishes a comfortable line of pull. A small, controlled unloading trial begins. The patient's face and symptom response tell the story. The clinician releases gradually and immediately compares the original movement.",
    method: "Traction needs a clear purpose, a safe screening decision and a controlled dose. Bigger force isn't automatically a more convincing experiment. Unexpected neurological or vascular-type symptoms end the trial.",
    science: "An unloading response may change pain or movement tolerance but cannot reveal that a disc was repositioned. The effects of traction differ by population, indication and how it is combined with rehabilitation.",
    question: "The patient feels relief during traction but unchanged pain while turning afterward. Did the clinician 'fix the disc'?",
    answer: "No. Document temporary unloading relief if present, reassess the meaningful movement, and do not claim structural repositioning.",
    closer: "A gentle pull can ask a useful question. It cannot tow a diagnosis out of thin air."
  },
  "high-velocity-low-amplitude-thrust": {
    dialogue: "Patient: 'Can you make the famous cracking sound?' Clinician: 'We can discuss treatment options. The sound effects department is not in charge of clinical decisions.'",
    watch: "Before a hand touches the patient, the therapist reviews symptoms, relevant health history, contraindications and alternatives, explains risks and seeks informed consent. If appropriate and within specific training, a thrust may be considered. The room does not become safer or smarter because it makes a noise.",
    method: "Never present an HVLA maneuver as the dramatic finale that everyone must experience. Region-specific risk assessment matters—especially where cervical vascular or neurological concerns arise—and many patients require other options.",
    science: "Joint sounds can reflect cavitation-related phenomena, but they are neither an accurate marker of tissue repositioning nor proof of benefit. Any therapeutic response is broader and more complex than the click.",
    question: "No pop occurs, but movement becomes easier. Is the treatment automatically a failure?",
    answer: "No. Audible sound is not an outcome measure. Base decisions on screening, consent, symptom change, adverse effects and meaningful function.",
    closer: "Hollywood gets the soundtrack. Rehabilitation needs the outcome."
  },
  "pnf-manual-techniques": {
    dialogue: "Patient: 'Why are we moving my arm diagonally?' Clinician: 'Because reaching for your cup involves coordinated movement, not just a single muscle posing for the camera.'",
    watch: "The therapist guides a purposeful pattern with clear contact and manageable resistance. The patient participates actively. As control improves, the clinic prop—a cup, a rail, a jacket—takes center stage. Movement quality matters more than how elegant the therapist looks while cueing.",
    method: "Manual contacts and diagonal patterns are tools for facilitating active control, not routines to perform in isolation forever. The task should challenge the patient while leaving room for success and recovery.",
    science: "Improvement may reflect motor learning, practice effects, attention and sensory cues. A pattern rehearsed on the table does not guarantee transfer into daily activities unless functional practice follows.",
    question: "The patient performs a flawless diagonal but still spills the cup at home. What's missing?",
    answer: "Task-specific transfer. Reassess the real activity and adapt practice, cueing, resistance and environment toward function.",
    closer: "A diagonal is rehearsal. Daily life is opening night."
  },
  "fascial-manipulation": {
    dialogue: "Patient: 'You're treating away from where it hurts?' Clinician: 'Sometimes the examination suggests another site is worth testing. Worth testing—not magically proven.'",
    watch: "The painful action is demonstrated first. The clinician uses a structured assessment to select a proposed contact site, explains what is uncertain, and performs a tolerable trial. The patient then repeats exactly the same action. The story belongs to the response, not to the model's mythology.",
    method: "A map of fascial hypotheses can organize examination, but it is not a treasure map with an X that guarantees a hidden adhesion. Use informed clinical judgment, feedback and a measurable comparable sign.",
    science: "Specific mechanistic claims for fascial manipulation are debated and not established for every condition. A useful short-term response cannot confirm the full proposed model or an anatomical correction.",
    question: "A distant contact helps the painful movement. Has the therapist proven the exact proposed fascial pathway?",
    answer: "No. It may support an individually useful trial while leaving the specific mechanism unconfirmed. Reassess function and avoid overselling anatomy.",
    closer: "The treasure is a useful movement, not an invisible knot with a certificate."
  },
  "active-release-style-soft-tissue": {
    dialogue: "Patient: 'Do I just lie still?' Clinician: 'Not this time. Your movement is half the duet—and much more important than how dramatic my thumb looks.'",
    watch: "The clinician finds a safe, relevant muscle region, establishes comfortable contact, then asks the patient to move through a controlled action. The therapist follows the response, not a script that forces the same pressure on every person.",
    method: "Touch combined with motion needs coordination and comfort. Too much contact can add guarding; too much movement can irritate tissues. The winning combination is thoughtful, not exhausting.",
    science: "The contact-and-movement combination may influence symptoms and movement tolerance. It cannot, by itself, show that a scar adhesion was physically torn free.",
    question: "The patient starts to guard as the therapist presses deeper during active movement. Should pressure increase to 'finish the release'?",
    answer: "No. Reduce or stop the contact, retest tolerable movement and revise the dose or technique. Sharp pain is not evidence of a successful release.",
    closer: "It's a duet. If one partner starts shouting, turn the volume down."
  },
  "manual-lymphatic-drainage": {
    dialogue: "Patient: 'Shouldn't stronger pressure move the fluid faster?' Clinician: 'Think careful drainage planning, not squeezing toothpaste. First, we need to know why the limb is swollen.'",
    watch: "The clinician asks about onset and symptoms before touching the limb. Where care is appropriate, light, planned skin movements are used within the broader program. Follow-up is based on swelling measures, comfort, skin condition and function—not the sensation of liquid rushing under a hand.",
    method: "The technique may look gentle but demands serious clinical judgment. New one-sided swelling, possible thrombosis, acute infection or medical instability is never a situation to 'just try a little massage.'",
    science: "Edema management depends on the underlying condition. Manual lymphatic drainage is not universally necessary or sufficient, and outcomes may depend on compression, exercise and comprehensive care.",
    question: "A person has unexplained one-sided swelling and warmth today. Should you begin drainage to see if the swelling decreases?",
    answer: "No. Arrange appropriate medical assessment, including consideration of thrombosis or infection, before routine hands-on care.",
    closer: "Light hands. Heavy-duty screening."
  },
  "scar-mobilization": {
    dialogue: "Patient: 'Does that scar mean my skin will never move normally?' Clinician: 'It may change how this region feels, but let's find out what you can comfortably do before predicting the ending.'",
    watch: "The wound is adequately healed and cleared for appropriate contact. The clinician asks permission, starts gently near the scar, observes sensitivity and pairs graded touch with safe movement. The patient's confidence becomes part of the outcome.",
    method: "Scar work is not a contest to see who can tug hardest on a healed incision. Healing status, tissue tolerance and surgical restrictions decide the pace; an unhealed wound is not ready for mobilization.",
    science: "Scar symptoms involve tissue healing, sensitivity, movement habits and context. Improving comfort with touch does not establish that every felt 'adhesion' was broken.",
    question: "The incision is still partly open, but the region feels tight. Is early firm mobilization the clever way to prevent a restriction?",
    answer: "No. Protect wound healing and follow medical or surgical guidance. Begin any appropriate graded contact only after adequate healing and clearance.",
    closer: "Healing wrote the first chapter. Don't tear out its pages."
  },
  "paivm-ppivm-spinal-assessment": {
    dialogue: "Patient: 'So you can feel exactly which vertebra is out?' Clinician: 'I can explore movement and symptom response—but my thumb is not a spinal X-ray.'",
    watch: "One examiner supports the trunk and applies controlled accessory or physiological movement while observing the patient's response. Another clinician might perceive segmental stiffness differently. The familiar bend or turn is retested to place the palpation finding in context.",
    method: "PAIVMs and PPIVMs are structured examination inputs, not lie detectors for a vertebra. Use them alongside history, neurological screening, active motion and reproducible functional signs.",
    science: "Reliability of segmental motion palpation is limited as a stand-alone diagnostic method. A stiff-feeling segment does not prove a malpositioned vertebra or identify the sole source of pain.",
    question: "Two skilled examiners disagree about which segment is stiff. Is it reasonable to diagnose a displaced vertebra anyway?",
    answer: "No. Interpret the finding cautiously and prioritize a convergent clinical examination with reproducible comparable signs.",
    closer: "The thumb can contribute a clue. It cannot deliver the entire verdict."
  },
  "myofascial-decompression-dry-cupping": {
    dialogue: "Patient: 'I saw deep purple circles online. Can mine look like that?' Clinician: 'We are treating movement, not designing a new polka-dot shirt.'",
    watch: "The clinician checks skin integrity, sensation and bleeding risk, then uses cautious suction only where appropriate. The patient notes the feeling. After removal, the same reach or bend is retested—without awarding extra points for a more dramatic circle.",
    method: "Negative pressure is a clinical input, not a contest for the darkest mark. Avoid vulnerable tissues, excessive suction and the temptation to market discoloration as 'toxins leaving the body'.",
    science: "Cupping may change sensation or short-term symptoms in some contexts, but skin marks do not prove toxin removal, restored circulation to a specific degree or permanent fascial restructuring.",
    question: "A dark mark appears but the relevant movement does not change. Is the color a success indicator?",
    answer: "No. The skin response is not a therapeutic outcome measure. Reassess the patient's function, comfort and skin safety.",
    closer: "The circle makes a photograph. The retest makes the clinical story."
  },
  "facilitated-positional-release": {
    dialogue: "Patient: 'That was only a few seconds. Did you forget the treatment?' Clinician: 'No. The plan is a short comfortable input followed by a very careful retest—not a dramatic performance.'",
    watch: "A comfortable position is found with the region fully supported. The therapist introduces the technique-specific gentle facilitating element for a brief, controlled period, then returns smoothly to neutral. The original movement is repeated before anyone declares victory.",
    method: "Short does not mean casual. The clinician still chooses positioning, dose and facilitating input carefully, monitoring the patient's response. When the trial does nothing, adding force is not a clever sequel.",
    science: "Evidence and proposed mechanisms for facilitated positional release are limited. Possible short-term symptom modulation should not be described as permanent anatomical correction.",
    question: "A brief trial produces no improvement. Should the therapist simply apply much more force?",
    answer: "No. Reassess the diagnosis and the comparable sign, and choose another supported intervention where appropriate rather than escalating force.",
    closer: "Short scene. Long-lasting lesson: measure before you celebrate."
  }
};
