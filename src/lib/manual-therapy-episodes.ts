/** Hand-edited illustrative cases for the 22 PNA parent techniques.
 * Scenes are fictional education, not patient testimony or proof of efficacy.
 * Technical application and precautions stay in the separate evidence guides.
 */
export type ClinicalEpisode = {
  patient: string;
  decision: string;
  retest: string;
  spark: string;
};

export const clinicalEpisodes: Record<string, ClinicalEpisode> = {
  "maitland-joint-mobilization": {
    patient: "A driver comes in because checking the blind spot has become a little adventure—and not the fun kind. When they turn the head, a familiar ache appears before the movement is finished. You note the direction, the range and what happens afterward. That's your baseline, not a verdict about a 'stuck vertebra.'",
    decision: "After screening and gaining consent, you choose a comfortable position and a graded oscillatory input. The direction, grade and duration are selected to explore the symptom response—not to prove you can produce the strongest mobilization.",
    retest: "Now the driver turns to check that imaginary blind spot again. If it is easier, you may have created a useful window for active movement. If it is unchanged, you change the hypothesis rather than turning up the force.",
    spark: "Your thumbs are asking questions, not issuing traffic tickets."
  },
  "kaltenborn-evjenth-mobilization": {
    patient: "A painter struggles to reach above shoulder height. The arm moves, then hesitates. A joint-surface diagram might suggest one glide, but the patient's pain, irritability and functional goal are much more interesting than memorizing the arrow in that diagram.",
    decision: "You consider the joint's treatment plane and the purpose of traction or a translatoric glide. With support and a clear baseline, you test an appropriate direction. If discomfort increases, you do not defend the diagram—you change course.",
    retest: "You ask for the same overhead reach. Better tolerance may support continuing. If the arm still refuses the job, the correct textbook direction has not earned a permanent place in the plan.",
    spark: "The anatomy diagram is a map. The patient is the GPS."
  },
  "mulligan-mobilization-with-movement": {
    patient: "A footballer demonstrates the problem in one move: a squat that becomes uncomfortable around the knee. No lengthy mystery. The movement itself is your reference point, and the patient can tell you immediately whether it changes.",
    decision: "After screening, you trial a selected accessory glide while the patient actively repeats the squat. In the Mulligan approach, the response should be comfortable and meaningful. If it hurts, you modify or stop—never talk the patient into pretending it helped.",
    retest: "Repeat the squat without your glide. A smoother, more comfortable movement suggests a useful trial, which should be reinforced with active practice. If the effect vanishes, that is information too.",
    spark: "The squat is the final examiner, and it does not award marks for elegant hand placement."
  },
  "mulligan-snags-nags": {
    patient: "A teacher turns to face a student at the back of the classroom and gets an unwelcome reminder from the neck. The familiar painful rotation becomes a measurable starting point, but cervical screening comes before any clever technique.",
    decision: "Depending on the presentation and training, you consider an appropriate NAG or SNAG. Contact, direction and timing matter, and any assisted active movement should remain comfortable. The neck is not a steering wheel you force into a turn.",
    retest: "When your hands leave, the teacher turns again. You look for a meaningful change in symptoms or range, while remaining alert for any unusual headache, dizziness, visual or neurological symptoms that require stopping and assessment.",
    spark: "A smoother head turn beats an impressive-looking maneuver every time."
  },
  "cyriax-deep-transverse-friction": {
    patient: "A carpenter reports pain while gripping a tool and asks whether you can 'rub the tendon loose.' First check the irritated tissue's response to grip and loading. Tenderness may be present, but it does not automatically identify the cause or justify aggressive friction.",
    decision: "If local transverse friction is a suitable adjunct, you use a short, precise, tolerable trial. You also explain that graded loading and activity decisions remain central; local pressure is not the entire rehabilitation story.",
    retest: "The carpenter grips again. If function has not improved, the extra soreness from friction is not a badge of success. Adjust the plan rather than promising that stronger rubbing is the answer.",
    spark: "The tendon didn't ask for a wrestling match."
  },
  "muscle-energy-technique": {
    patient: "A student describes a stubborn, tight-feeling neck after long days at a desk. When turning, the movement seems guarded. You begin by checking the comfortable barrier and whether the chosen muscle action is relevant to that restriction.",
    decision: "Instead of forcing a stretch, you invite a small, controlled contraction against gentle resistance, then allow relaxation before exploring the new comfortable range. The patient is a participant, not a passenger.",
    retest: "Ask for the original turn again. If movement feels easier, help the student practice controlling it actively. If not, repeating a harder contraction is not the natural next chapter.",
    spark: "Sometimes the best way forward begins with the gentlest pushback."
  },
  "strain-counterstrain": {
    patient: "A person points to a tender upper-shoulder region and flinches when it is stretched. Instead of treating the muscle like a rope that needs more tension, you search for a position that reduces tenderness and feels easy to maintain.",
    decision: "A carefully selected position shortens the involved tissues while you monitor the tender point. You maintain comfort according to the chosen protocol and return slowly to neutral. Force and speed are not the stars of this scene.",
    retest: "You recheck tenderness and a relevant everyday movement. Relief is a possible response, but you do not promise the muscle has been structurally 'reset.'",
    spark: "Plot twist: the comfortable position may be the interesting one."
  },
  "myofascial-release": {
    patient: "A teacher reaches for a book on a high shelf and stops because the front of the shoulder feels tight. They say, 'The fascia must be stuck.' You don't dismiss the feeling, but you also don't claim to have spotted an adhesion through the skin.",
    decision: "With the arm supported and consent obtained, you trial an appropriate, comfortable soft-tissue contact. For direct work you move gradually toward perceived resistance; for indirect work you follow the direction of ease. You monitor the person, not just the texture beneath your hands.",
    retest: "Back to the imaginary bookshelf. Does the reach feel easier? If yes, build on it with active shoulder movement. If the therapist felt a dramatic 'release' but the reach is identical, that's a sensation—not a demonstrated functional gain.",
    spark: "Fascia won't email you a progress report. The patient's reach might."
  },
  "soft-tissue-mobilization": {
    patient: "A hiker says the calf feels like concrete on the stairs. You check gait, ankle movement and tenderness, looking for the task that can be repeated after care. Two people with the same complaint may tolerate touch very differently.",
    decision: "You begin with broad, comfortable contact and adjust depth, rhythm and direction to the person's response. Pressure is not a loyalty program; extra force doesn't earn clinical bonus points.",
    retest: "Try the same ankle movement or step again. If the hiker feels more comfortable, follow with appropriate movement and strengthening. If the calf is only sorer, rethink the dose.",
    spark: "The goal is better stairs, not the world's deepest massage."
  },
  "trigger-point-compression": {
    patient: "A desk worker points to a tender area near the upper trapezius and announces, 'Found the knot!' You can reproduce familiar discomfort there, but you still check neck movement, load, symptoms and other possible contributors.",
    decision: "If a pressure trial is appropriate, you use a controlled, tolerable contact—not an attempt to crush a mythical pebble inside the muscle. You keep feedback and symptom behavior central.",
    retest: "The desk worker repeats the head turn or work-related movement. A tender spot may feel different afterward, but a change in meaningful function matters more than declaring the case solved by one thumb.",
    spark: "A clue isn't the culprit just because it hurts when pressed."
  },
  "iastm": {
    patient: "A runner notices the shiny instrument before you even begin: 'Will it scrape the tightness away?' You explain that the tool can provide controlled sensory and mechanical input, but visible marks are not proof of tissue repair.",
    decision: "After skin and bleeding-risk screening, you select a suitable edge, angle and conservative dose. You avoid creating bruises simply to make the treatment look dramatic.",
    retest: "Check the runner's relevant ankle movement or loading task. Improvement may justify a short adjunctive role; a beautiful red stripe on the skin does not.",
    spark: "Skin redness is not a five-star review."
  },
  "neurodynamic-mobilization": {
    patient: "Someone notices tingling that changes when they straighten the leg and move the ankle. It is tempting to conclude that a nerve is trapped, but the examination needs a neurological check and a careful look at symptom behavior first.",
    decision: "If suitable, you explore a gentle slider that varies loading along the neural pathway without pursuing a painful stretch. You monitor symptoms during and after every repetition.",
    retest: "When the person repeats the original movement, you look for more comfortable tolerance and sensible symptom recovery. Lingering or worsening tingling is a reason to reassess, not to pull harder.",
    spark: "Nerves are living tissue, not exercise bands competing for stretch."
  },
  "manual-traction": {
    patient: "A patient with non-specific neck pain asks, 'Can you just pull the pressure away?' It's a perfectly understandable request, but the response to unloading cannot diagnose a disc problem on its own.",
    decision: "After relevant screening, you trial gentle, well-supported traction with controlled direction and force. You stop for worsening or unexpected symptoms; this is not a contest to see how far the body can be pulled.",
    retest: "Recheck the patient's familiar movement and comfort. Temporary relief can be useful, but it doesn't prove that a disc has popped back into place.",
    spark: "Traction isn't a tow truck for vertebrae."
  },
  "high-velocity-low-amplitude-thrust": {
    patient: "A patient arrives with a very specific request: 'I want the loud click I saw online.' You acknowledge the preference, then move the conversation toward assessment, risks, alternatives and what meaningful relief would actually look like.",
    decision: "Thrust manipulation requires specific training, appropriate screening and informed consent. For some patients, a lower-risk option is better; for others, manipulation may not be appropriate at all.",
    retest: "Judge any intervention by symptoms, movement and safety. The presence or absence of a pop is not evidence that a bone was repositioned or that treatment succeeded.",
    spark: "Great sound effects belong in cinema. Rehabilitation needs better evidence."
  },
  "pnf-manual-techniques": {
    patient: "A person recovering from a neurological condition can lift an arm in the clinic but struggles to bring a cup safely toward the mouth. The goal isn't simply to demonstrate a perfect diagonal; it's to improve a useful action.",
    decision: "You select a meaningful pattern, an appropriate level of resistance and clear cues so the patient actively participates. As coordination improves, practice becomes more like the everyday task.",
    retest: "The cup task is the test. Better control in real activity matters more than a beautifully performed exercise pattern by itself.",
    spark: "The diagonal gets the rehearsal. Daily life gets the opening night."
  },
  "fascial-manipulation": {
    patient: "A runner points to thigh discomfort, but a clinician considers whether a different region might influence the movement. The proposed fascial model offers a hypothesis. It does not prove that a hidden mechanical fault has been found.",
    decision: "After assessment and consent, a carefully selected contact may be trialed against a measurable task. Keep explanations conservative, particularly when a proposed mechanism has uncertain evidence.",
    retest: "Ask the runner to repeat the original movement. A useful change may support the treatment decision, but it cannot validate every anatomical claim attached to a model.",
    spark: "A fascinating map is not proof you've found buried treasure."
  },
  "active-release-style-soft-tissue": {
    patient: "A graphic designer reports pulling in the forearm when gripping a stylus. At rest, it may feel fairly comfortable. You check the grip and wrist movement before adding manual contact.",
    decision: "During an appropriate trial, the patient actively moves while you maintain precise, tolerable contact. If the action becomes sharper or more sensitive, you reduce pressure or stop rather than treating pain as a performance goal.",
    retest: "Repeat the stylus grip without the therapist's hand. Useful change can lead into active loading and work adjustments. No improvement? The next step is better reasoning, not automatically deeper pressure.",
    spark: "Two people contribute to the technique, but only one has to live with the wrist afterward."
  },
  "manual-lymphatic-drainage": {
    patient: "Someone with established, assessed limb lymphedema describes heaviness by the end of the day. They want to know whether massage can move the fluid. You first confirm the medical context and screen for new warning symptoms.",
    decision: "Where appropriate and within training, gentle, methodical skin movement may be one component of an overall edema-management plan. New unexplained swelling, infection or possible thrombosis changes the decision entirely.",
    retest: "Follow objective measurements, comfort and function over time rather than promising a dramatic single-session disappearance of swelling.",
    spark: "Light hands; serious clinical thinking."
  },
  "scar-mobilization": {
    patient: "Months after a healed abdominal incision, a patient feels hesitant to stretch upward because the scar area pulls. You check healing, sensitivity and the task that matters, not just whether the skin feels different under a fingertip.",
    decision: "With appropriate clearance and consent, you begin graded, gentle contact only on adequately healed tissue and connect it with comfortable active movement. Forceful pulling at a healing wound is never a shortcut.",
    retest: "Can the patient reach, turn or tolerate contact with more confidence? The outcome is comfortable participation, not a requirement that the scar feel identical to nearby skin.",
    spark: "Every scar has a history; it doesn't need a dramatic sequel."
  },
  "paivm-ppivm-spinal-assessment": {
    patient: "Two clinicians examine the same lower-back region. One feels a stiff segment; the other isn't convinced. The patient simply wants to bend down without the familiar ache. That shared movement becomes the more dependable starting point.",
    decision: "PAIVMs and PPIVMs can explore accessory or physiological movement as one part of a wider examination. Neither technique alone proves that a vertebra is 'out of place.'",
    retest: "Return to bending and consider the complete clinical picture. If the segmental finding doesn't help explain a meaningful change, don't let it dominate the diagnosis.",
    spark: "A palpation finding is a clue, not a jury verdict."
  },
  "myofascial-decompression-dry-cupping": {
    patient: "A recreational athlete shows a photo of dark cupping circles and asks for the same look. You acknowledge the trend but ask what movement or symptom actually needs to change. Skin discoloration is a side effect, not a therapeutic trophy.",
    decision: "Screen the skin, sensation and bleeding risk, explain possible marks and use conservative suction only when appropriate. Never increase suction just to leave a darker circle.",
    retest: "Retest the original activity. Improvement may support limited adjunctive use; a vivid photograph of marks proves very little about recovery.",
    spark: "Darker circles make louder photos, not stronger evidence."
  },
  "facilitated-positional-release": {
    patient: "A patient turns the head cautiously, expecting discomfort before the movement even begins. Could a brief comfortable position ease the next attempt? Maybe—but a safe, measurable trial matters more than a confident story about the mechanism.",
    decision: "In trained hands, an appropriately positioned brief facilitating input is tried without forcing end range. You monitor comfort and return carefully to neutral.",
    retest: "Repeat the original head turn. If nothing changes, reconsider rather than escalating force. Limited evidence is a reason for thoughtful modesty, not theatrical certainty.",
    spark: "The technique may be brief. The reasoning shouldn't be."
  }
};

export function getClinicalEpisode(slug: string): ClinicalEpisode | undefined {
  return clinicalEpisodes[slug];
}
