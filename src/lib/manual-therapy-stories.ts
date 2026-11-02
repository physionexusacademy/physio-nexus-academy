/**
 * Editorial, patient-centered learning invitations for all 22 parent techniques.
 * Vignettes are hypothetical teaching examples, not patient testimonials.
 * Technique instructions, clinical safety and evidence remain in the main registries.
 */
export type ManualTherapyStory = {
  headline: string;
  scene: string;
  question: string;
  bridge: string;
};

export const manualTherapyStories: Record<string, ManualTherapyStory> = {
  "maitland-joint-mobilization": {
    headline: "The movement stops. But what is really stopping it?",
    scene: "A patient turns their neck. Halfway through, pain appears, and the movement stops. Is the joint stiff, the area sensitive, or the movement simply difficult today? Maitland begins by taking that uncertainty seriously. First, find a movement you can test. Then choose a gentle, graded input and see whether anything meaningful changes.",
    question: "What can a small, controlled oscillation teach us about this patient's pain and movement?",
    bridge: "The grade is only a tool. The before-and-after response is the clinical conversation."
  },
  "kaltenborn-evjenth-mobilization": {
    headline: "A joint can feel restricted. Which direction deserves your attention?",
    scene: "An everyday movement feels blocked, but pushing harder is not a plan. The Kaltenborn–Evjenth approach invites you to think about joint surfaces, the treatment plane, traction and translatoric glide. You choose a direction deliberately, not because it sounds impressive, but because it might help the movement that matters to the patient.",
    question: "What changes when you separate the joint's small gliding motion from the visible movement?",
    bridge: "Anatomical rules guide your hands; the patient's response decides what stays in the plan."
  },
  "mulligan-mobilization-with-movement": {
    headline: "What if the painful movement could be tested differently—right now?",
    scene: "The patient reaches, squats or turns, and a familiar pain appears. Instead of treating a resting joint and hoping for a change later, Mulligan MWM brings the important movement into the session. A carefully selected accessory glide accompanies the patient's own action. Then you ask the most useful question: did that movement become easier and more comfortable?",
    question: "Can a pain-free, assisted repetition reveal a useful treatment direction?",
    bridge: "The impressive part is not the hand placement. It is a repeatable improvement in the patient's own task."
  },
  "mulligan-snags-nags": {
    headline: "A painful neck movement. A different way to explore it.",
    scene: "Someone looks over their shoulder and stops because the neck feels painful or restricted. NAGs and SNAGs explore whether a carefully directed mobilization, sometimes combined with active movement, can change that familiar complaint. The direction and timing matter—but so does knowing when the response is not good enough to continue.",
    question: "What makes a glide useful rather than merely technically correct?",
    bridge: "Follow the patient's pain-free movement, not the temptation to force a larger range."
  },
  "cyriax-deep-transverse-friction": {
    headline: "A tender tendon is asking for judgment, not a harder thumb.",
    scene: "A patient points to a painful tendon and asks for something to loosen it. Deep transverse friction is often taught as a precise local technique, but tenderness alone is not a reason to rub harder. First consider tissue irritability, load tolerance and whether the technique adds anything useful to active rehabilitation.",
    question: "When might brief local manual input help—and when could it simply aggravate an already irritable tendon?",
    bridge: "Precision is valuable. Force without a clinical reason is not."
  },
  "muscle-energy-technique": {
    headline: "Sometimes the next movement begins with a gentle contraction.",
    scene: "A muscle seems to guard a movement. Forcing it into more range may only create more resistance. Muscle Energy Technique offers a more cooperative starting point: the patient performs a small, controlled contraction against resistance, then relaxes while you reassess the comfortable movement available.",
    question: "How can voluntary muscle activity become part of a careful mobility strategy?",
    bridge: "The patient is an active partner. Low effort, control and reassessment matter more than strength."
  },
  "strain-counterstrain": {
    headline: "The tender point hurts. So why move toward comfort instead of stretch?",
    scene: "A tender muscle is already sensitive. Strong pressure or stretching may make it more uncomfortable. Strain Counterstrain turns that instinct around: shorten and position the involved tissues toward ease, monitor the tender point and return slowly. It is a quiet technique that demands careful positioning, not force.",
    question: "Can finding a position of ease change tenderness or movement tolerance?",
    bridge: "The goal is comfort and a meaningful response—not forcing length into an irritated muscle."
  },
  "myofascial-release": {
    headline: "The patient says, 'It feels stuck.' What does that actually mean?",
    scene: "A patient describes pulling, tightness or an area that never seems to relax. Myofascial Release explores how sustained, comfortable manual contact might change symptoms and movement tolerance. But there is a crucial difference between feeling a change and claiming you physically melted adhesions.",
    question: "How do you use touch to test a clinical hypothesis without promising a structural miracle?",
    bridge: "Use the patient's movement and function to judge the treatment, not a story about fascia that cannot be verified."
  },
  "soft-tissue-mobilization": {
    headline: "A skilled hand does more than press on a painful muscle.",
    scene: "A patient comes in with stiff, protective movement. Soft-tissue mobilization may help them tolerate touch and movement, but the strongest treatment is not automatically the deepest. You begin by listening to tissue sensitivity and the patient's feedback, then choose a pressure and movement that can be reassessed.",
    question: "When does manual contact open a useful window for active rehabilitation?",
    bridge: "The aim is a more confident movement afterward—not a painful treatment for its own sake."
  },
  "trigger-point-compression": {
    headline: "One tender spot. A whole movement affected.",
    scene: "Pressing a small region of muscle may reproduce the patient's familiar discomfort. It is tempting to call that spot the entire diagnosis. A better approach is to map the symptoms, distinguish local tenderness from a broader pain problem, and trial controlled pressure only when it is appropriate and tolerated.",
    question: "Can this local input change the movement or task the patient actually cares about?",
    bridge: "A tender point is a finding to interpret, not a diagnosis to worship."
  },
  "iastm": {
    headline: "The tool looks powerful. The clinical reasoning must be stronger.",
    scene: "A metal instrument glides across the skin, and a patient asks whether it is breaking scar tissue. That is a good moment to separate sensation from science. IASTM applies controlled mechanical and sensory input; any benefit should be judged through tolerance, symptoms and function rather than redness or dramatic claims.",
    question: "What is the smallest, safest dose that might help this patient's next movement?",
    bridge: "Redness is not a result. Improved function is the reason to continue."
  },
  "neurodynamic-mobilization": {
    headline: "Why does a tiny change in position send symptoms down the limb?",
    scene: "A patient raises a leg, tilts the head or straightens an elbow—and familiar tingling changes. The nervous system is sensitive to movement and surrounding loads, but this does not mean a nerve is physically trapped. Neurodynamic assessment and gentle sliders can help explore symptom behavior without aggressively provoking it.",
    question: "How do you restore comfortable movement while respecting neural sensitivity?",
    bridge: "A response-guided slider is not a contest to reach the biggest stretch."
  },
  "manual-traction": {
    headline: "Sometimes the revealing movement is the one that takes pressure away.",
    scene: "A patient feels discomfort with a particular position. A carefully supported traction or distraction trial may change how that position feels. The technique is not about pulling as hard as possible. It is about screening first, choosing a safe direction and watching whether the patient's symptoms respond.",
    question: "Does unloading provide useful short-term relief that can support better movement?",
    bridge: "Comfort is information; excessive force is not an achievement."
  },
  "high-velocity-low-amplitude-thrust": {
    headline: "The sound grabs attention. The clinical decision should come first.",
    scene: "A quick thrust and a joint sound can look dramatic. Yet a click does not prove that a bone moved back into place, and silence does not mean failure. HVLA belongs in the hands of trained clinicians who have screened carefully, obtained consent and weighed lower-risk alternatives.",
    question: "When, if ever, does a carefully selected thrust add value beyond safer options?",
    bridge: "A successful session is judged by patient outcomes and safety—not by the sound."
  },
  "pnf-manual-techniques": {
    headline: "The patient moves. Your hands help the movement make sense.",
    scene: "Reaching, rolling and stepping ask several muscle groups to work together. PNF uses purposeful resistance, direction and sensory cues to support coordinated movement. Instead of memorizing diagonal patterns as choreography, start with a function the patient wants to regain.",
    question: "How can a movement pattern become practice for a real task?",
    bridge: "The diagonal is a pathway. Function is the destination."
  },
  "fascial-manipulation": {
    headline: "A point feels important. But does it explain the problem?",
    scene: "Some approaches link movement problems to selected fascial points and sequences. Fascial Manipulation gives clinicians a structured way to form and test those ideas. The challenge is to separate a useful clinical response from claims about fascial anatomy or mechanics that remain uncertain.",
    question: "Can a targeted intervention make the relevant movement better without overstating why?",
    bridge: "Test the idea in the patient in front of you; keep uncertainty visible."
  },
  "active-release-style-soft-tissue": {
    headline: "What happens when the patient moves beneath your contact?",
    scene: "A tender area may behave differently when the patient actively moves through a comfortable range. Active soft-tissue release combines manual contact with movement, creating an opportunity to explore sensitivity, glide and function. The most useful repetitions are controlled, tolerable and connected to a meaningful task.",
    question: "Does adding active movement make the manual input more relevant?",
    bridge: "Movement is part of the treatment—not merely something you do afterward."
  },
  "manual-lymphatic-drainage": {
    headline: "For this technique, lighter can be more appropriate than stronger.",
    scene: "A swollen limb may feel heavy and uncomfortable. Manual lymphatic drainage is often misunderstood as deep massage, but the approach uses carefully directed, light skin movements in appropriate patients. Before beginning, the important decisions are the cause of swelling, safety screening and whether specialist management is needed.",
    question: "How do gentle contact and a safe care plan work together in edema management?",
    bridge: "Never treat unexplained swelling as a simple massage problem."
  },
  "scar-mobilization": {
    headline: "The wound has closed. The movement still feels different.",
    scene: "A healed scar may feel sensitive or less comfortable when the person reaches, walks or bends. Scar mobilization can be considered as one part of graded exposure and functional recovery. The first question is not how strongly to move the tissue, but whether healing is complete and the person can tolerate contact.",
    question: "How can gentle, progressive contact support confidence in movement?",
    bridge: "Healthy healing comes before manual mobility. Never trade tissue safety for a quick sensation of stretch."
  },
  "paivm-ppivm-spinal-assessment": {
    headline: "A spinal segment feels stiff. Is that enough to call it the problem?",
    scene: "A clinician feels resistance under the hands and a patient asks which vertebra is out of place. PAIVMs and PPIVMs can contribute to a spinal examination, but segmental palpation is not a stand-alone diagnosis. Their greater value is in testing whether controlled movement changes the patient's familiar symptoms.",
    question: "What does the response tell you when you combine palpation with the full clinical picture?",
    bridge: "A finding is a clue, not a verdict."
  },
  "myofascial-decompression-dry-cupping": {
    headline: "The circular marks are visible. The actual benefit needs measuring.",
    scene: "Cupping is memorable because its marks are easy to see. But visible discoloration is not evidence that toxins left the body or adhesions broke apart. The clinical conversation begins with realistic expectations, informed consent, skin safety and a short trial linked to a movement the patient wants to improve.",
    question: "Could gentle negative-pressure input help symptoms enough to support activity?",
    bridge: "The real result is not what the skin looks like afterward."
  },
  "facilitated-positional-release": {
    headline: "Can a few seconds of comfort change what happens next?",
    scene: "When movement is guarded, adding force is not always the most thoughtful first move. Facilitated Positional Release explores a brief position of ease with a carefully selected facilitating input. The technique should stay gentle, comfortable and honest about the limited evidence for its proposed mechanisms.",
    question: "Does this brief positional input help the patient return to movement more comfortably?",
    bridge: "A short, controlled trial makes more sense than repeating a technique simply because it has an impressive name."
  }
};

export function getManualTherapyStory(slug: string): ManualTherapyStory | undefined {
  return manualTherapyStories[slug];
}
