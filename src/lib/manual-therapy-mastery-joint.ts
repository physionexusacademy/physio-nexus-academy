import type { MasteryGuide } from "@/lib/manual-therapy-mastery-types";

export const masteryJoint: MasteryGuide[] = [
  {
    slug: "maitland-joint-mobilization",
    oneLine: "Gentle, rhythmic rocking of a joint, graded I to IV by how far into the range you go, chosen by how irritable the patient's pain is.",
    whatItIs: "Maitland mobilization is a hands-on method where you move a joint passively (the patient stays relaxed) in small, smooth, repeated oscillations. The 'grade' tells you how big the movement is and how deep into the joint's range you work. You use it to calm pain or to stretch a stiff joint, then immediately check whether the patient's own movement improved.",
    analogy: "Think of pushing a child on a swing. Tiny, gentle pushes near the middle calm the swing; bigger pushes toward the end of the arc stretch it out. You choose the push size by how touchy the swing is today, not by what the swing is called.",
    coreIdeas: [
      "Treat the patient's movement problem, not a scan or a diagnosis name. Pick one movement or symptom (the 'comparable sign'), treat, then test it again.",
      "Pain-dominant and easily flared joints get small, gentle Grades I-II. Stiff but comfortable joints get Grades III-IV that reach into the resistance.",
      "Reassessment decides everything. If the comparable sign does not improve, change the glide, the grade or the whole plan. Never just push harder."
    ],
    terms: [
      { term: "Comparable sign", meaning: "The one movement or symptom you test before and after treatment, for example neck rotation to the right or shoulder lifting to 90 degrees." },
      { term: "Accessory movement", meaning: "A tiny joint glide the patient cannot do on their own, such as one vertebra gliding forward. You produce it with your hands." },
      { term: "Irritability", meaning: "How easily symptoms flare, how bad they get, and how long they take to settle. High irritability means be gentle." },
      { term: "P1 / R1", meaning: "P1 is where pain first starts as you move the joint. R1 is where you first feel resistance. These two points guide your grade." },
      { term: "Grades I-IV", meaning: "I: small movement at the start of range. II: large movement in the free part of range. III: large movement into resistance. IV: small movement into resistance. Grade V is a thrust and is a different technique." }
    ],
    whenToUse: [
      "A painful, stiff joint where one movement clearly reproduces the patient's pain (positive comparable sign).",
      "Pain-dominant, irritable joints (use Grades I-II) or stiffness-dominant, calmer joints (use Grades III-IV).",
      "Stiffness after immobilisation or injury once the tissue is safe to load."
    ],
    whenNot: [
      "Unstable fracture, dislocation, active infection, or suspected cancer in the area.",
      "Worsening neurological signs, or uncertainty about blood vessel safety (especially in the neck).",
      "Take extra care in hypermobile joints, recent trauma and highly irritable pain."
    ],
    steps: [
      { title: "Choose and record the comparable sign", detail: "Example: right neck rotation reaches 50 degrees and pain starts at 45. Write it down so you can prove change later." },
      { title: "Screen for red flags", detail: "Ask about night pain, unexplained weight loss, recent trauma, dizziness or neurological symptoms before touching." },
      { title: "Position for comfort", detail: "Support the joint so surrounding muscles can relax. A guarding muscle will block any glide you try." },
      { title: "Place a broad, specific contact", detail: "One hand fixes the bone that should stay still. The other contacts the moving bone close to the joint line. Take up the skin slack first so you move the joint, not the skin." },
      { title: "Use your body weight, not your fingers", detail: "Lean smoothly through relaxed arms. Finger-only pressure makes jerky, painful oscillations." },
      { title: "Start low and ask", detail: "Begin with a low grade. Local pressure is fine. Sharp pain, pins and needles or symptoms spreading down the limb mean stop." },
      { title: "Treat, rest, then retest", detail: "After a set, ask the patient to repeat the comparable sign. Keep, progress or change the technique based on that answer." },
      { title: "Hand the gain back to the patient", detail: "Finish with active movement or loading in the new range, so the improvement is used rather than lost." }
    ],
    dose: "Typical teaching range: about 1-2 oscillations per second, 30-60 seconds per set, 2-4 sets. Grades I-II for pain, III-IV for stiffness. This is a starting point; the patient's response sets the real dose.",
    example: {
      patient: "Ravi, 45, bank clerk, right-sided neck pain since a long drive four days ago.",
      assessment: "Right rotation is 50 degrees with pain at the end. Pain eases within a minute of resting, so irritability is low. Screening is clear. A gentle press on the right C5 joint reproduces his pain.",
      treatment: "In lying, Ravi relaxes while you apply a Grade III unilateral PA glide at C5 for 30 seconds, three sets, asking about symptoms after each set.",
      reassess: "Rotation improves to 65 degrees with less pain. You teach him gentle active rotation every hour and review in two days. If rotation had not changed, you would try another level or direction instead of pressing harder."
    },
    mistakes: [
      "Picking a grade from the diagnosis name instead of irritability and response.",
      "Moving the whole limb instead of producing a true, specific joint glide.",
      "Feeling a joint 'loosen' under your hand but skipping the retest of the patient's own movement."
    ],
    selfTest: [
      { q: "A very irritable shoulder: which grades and why?", a: "Grades I-II. They are small and gentle and aim to calm pain without provoking a flare." },
      { q: "The joint feels smoother but the patient's neck turn is unchanged. What have you proved?", a: "Only that your hand felt something. Trust the comparable sign, not your feel, and rethink the plan." }
    ],
    recap: "Test the movement, choose the glide and grade, test the movement again.",
    evidence: "Reviews support manual therapy, including mobilization, for short-term pain and function in several joint problems, usually alongside exercise. How it works is uncertain. It does not 'put a joint back in place', and one technique should not be promised to fix a specific structure."
  },
  {
    slug: "kaltenborn-evjenth-mobilization",
    oneLine: "Mobilization that uses joint shape (the convex-concave rule) to pick the glide direction, and traction grades to loosen, take up slack, or stretch.",
    whatItIs: "The Kaltenborn-Evjenth approach explains which way a joint surface should glide so that a restricted movement can improve. You apply sustained or gentle traction and gliding in the joint's own 'treatment plane', using three stages that range from simply relieving pressure to stretching tight tissue.",
    analogy: "A key only turns if you push it in the direction the lock expects. Joint surfaces are curved; if you know their shape, you know which way the bone must slide for the movement to open up.",
    coreIdeas: [
      "Convex-concave rule: when a convex surface moves on a concave one, the bone glides opposite to the direction the bone's shaft moves. When a concave surface moves on a convex one, the glide goes the same way as the shaft.",
      "Three stages of traction: Stage I loosens (relieves pressure, no stretch), Stage II takes up the slack, Stage III stretches tissue.",
      "Compare to the other side and feel the end-feel (the quality of the stop) to judge whether the joint is stiff, loose or normal."
    ],
    terms: [
      { term: "Convex / concave", meaning: "Convex is rounded outward like a ball; concave is curved inward like a cup." },
      { term: "Treatment plane", meaning: "An imaginary flat plane across the concave joint surface. Gliding runs parallel to it and traction runs at right angles to it." },
      { term: "Slack", meaning: "The free play in tissues before they begin to tighten." },
      { term: "End-feel", meaning: "What the stop at the end of a movement feels like: firm, hard, springy or empty." },
      { term: "Hypomobile", meaning: "A joint that moves less than expected." }
    ],
    whenToUse: [
      "A joint that moves less than the other side with a firm, capsular-type end-feel.",
      "When you need to decide glide direction logically, for example for shoulder elevation or knee extension.",
      "Pain-dominant joints (Stage I) and stiff joints (Stage III) in the same framework."
    ],
    whenNot: [
      "Unstable joints, acute fractures, active infection or inflammation, and suspected tumour.",
      "Hypermobile joints, where you stabilize instead of stretching.",
      "Any worsening neurological symptoms during the technique."
    ],
    steps: [
      { title: "Find the joint and its shape", detail: "Example: the shoulder. The humeral head is convex and the socket is concave." },
      { title: "Work out the glide direction", detail: "For shoulder elevation, the convex head must glide downward (inferior), opposite to the arm rising. For knee extension, the concave tibia glides forward on the convex femur." },
      { title: "Compare sides and feel the end-feel", detail: "Test the same glide on both joints. Note which is stiffer, and whether it is painful." },
      { title: "Stage I", detail: "Apply a small traction that just relieves joint pressure. Use this to calm pain and test sensitivity." },
      { title: "Stage II then III", detail: "Take up the slack, then add a sustained stretch into the resistance if the joint is not irritable." },
      { title: "Release slowly and retest", detail: "Let go gradually and re-check the original movement." }
    ],
    dose: "Typical teaching range: a gentle Stage I traction held about 10 seconds for pain; for stiffness, a Stage III stretch held roughly 6-10 seconds and released, repeated several times. Adjust to the response.",
    example: {
      patient: "Meena, 58, cannot lift her right arm above the shoulder after six weeks in a sling.",
      assessment: "Elevation is 100 degrees on the right and 160 on the left, stopping with a firm end-feel. Pain is mild and settles quickly.",
      treatment: "Using the convex-concave rule you apply an inferior glide of the humeral head with the arm supported, after a short Stage I traction to settle the joint, then a Stage III stretch.",
      reassess: "Elevation reaches 120 degrees. You follow with active lifting practice with a stick, then repeat within a few days."
    },
    mistakes: [
      "Applying the glide in the wrong direction because the rule was memorized, not understood.",
      "Stretching (Stage III) an irritable, painful joint.",
      "Forgetting to retest the movement."
    ],
    selfTest: [
      { q: "Concave tibia moves on a convex femur in knee extension. Which way does the tibia glide?", a: "Forward, in the same direction as the shaft moves." },
      { q: "What is Stage I traction for?", a: "To relieve pressure and settle pain, with no stretch." }
    ],
    recap: "Know the joint shape, choose the glide direction, escalate the stage only if the joint is calm.",
    evidence: "The convex-concave rule is a useful teaching model, but real joints do not always glide exactly as predicted. Evidence for outcomes is similar to other mobilization: helpful short-term for selected patients, best with exercise."
  },
  {
    slug: "manual-traction",
    oneLine: "A gentle pull that separates joint surfaces to reduce compression and test or calm symptoms.",
    whatItIs: "Manual traction is a hands-on pull along the length of a limb or spine (distraction means pulling the joint surfaces apart). It is used either to relieve pressure and pain or, with more force, to stretch tight joint tissue.",
    analogy: "Like loosening a tight lid by lifting it slightly before turning. A little less pressure can be enough to let the movement happen.",
    coreIdeas: [
      "Taking pressure off a joint can reduce pain, so traction is also a test: if it eases symptoms, the joint is probably contributing.",
      "Light traction calms; stronger sustained traction stretches. Choose by irritability.",
      "Direction matters: pull along the limb (long-axis) for general pressure relief, or at right angles to the joint surface (distraction) to separate surfaces."
    ],
    terms: [
      { term: "Distraction", meaning: "Separating two joint surfaces by pulling them directly apart." },
      { term: "Long-axis traction", meaning: "Pulling along the length of the limb, for example pulling the arm away from the shoulder." },
      { term: "Resting position", meaning: "The joint position where tissues are most relaxed and the joint has most room." },
      { term: "Peripheralization", meaning: "Symptoms spreading farther down the limb. A warning sign." }
    ],
    whenToUse: [
      "Joint pain that eases when compression is removed.",
      "Neck or arm pain with a positive response to gentle traction, as one part of a plan.",
      "Preparing a stiff joint before other mobilization."
    ],
    whenNot: [
      "Instability, fracture, infection, or rheumatoid involvement of the upper neck.",
      "Symptoms that spread or neurological signs that worsen during traction.",
      "Dizziness, visual change or nausea during cervical traction."
    ],
    steps: [
      { title: "Screen and position", detail: "Place the patient in a supported, relaxed position, joint in its resting position." },
      { title: "Stabilize the proximal side", detail: "Fix the segment closest to the body with a hand, belt or table so only the joint distal to it moves." },
      { title: "Take up the slack slowly", detail: "Pull gently until the tissue tension just begins. This is Stage I-II." },
      { title: "Hold and ask", detail: "Hold for a few seconds. Ask if symptoms ease, stay, or spread." },
      { title: "Release gradually", detail: "Let go slowly, never suddenly." },
      { title: "Retest", detail: "Repeat the comparable movement or symptom." }
    ],
    dose: "Typical teaching range: gentle holds of about 10-30 seconds, repeated several times, with force kept light. Increase only if the response is good and the joint is not irritable.",
    example: {
      patient: "Kamran, 52, aching in the right neck and shoulder, arm symptoms eased when he rests his hand on his head.",
      assessment: "Screening is clear. Neck rotation to the right hurts at 40 degrees.",
      treatment: "In lying, you support his head, apply a gentle cervical traction for 20 seconds, three times.",
      reassess: "Rotation improves to 55 degrees without arm symptoms, so you continue gently and add posture and movement advice. If symptoms had travelled down the arm, you would have stopped."
    },
    mistakes: [
      "Pulling hard and fast on an irritable joint.",
      "Leaving the patient in a tense position so muscles resist the pull.",
      "Ignoring spreading symptoms."
    ],
    selfTest: [
      { q: "What does 'distraction' mean?", a: "Pulling joint surfaces directly apart." },
      { q: "Symptoms spread down the arm during traction. What do you do?", a: "Stop and reassess; do not continue." }
    ],
    recap: "Less pressure, then test: if traction eases the symptom, the joint is involved.",
    evidence: "Evidence for traction is mixed. It may give short-term relief in selected neck or arm pain patients as part of a plan with exercise, but it should not be relied on alone."
  },
  {
    slug: "mulligan-mobilization-with-movement",
    oneLine: "A sustained joint glide applied by the therapist while the patient performs the movement that normally hurts, aiming for an instant pain-free result.",
    whatItIs: "Mobilization With Movement (MWM) combines a gentle sustained glide with the patient's own active movement. You search for a glide direction that makes the previously painful movement easy and pain-free right now. If it works, you repeat it; if it does not, you stop.",
    analogy: "It is like adjusting a sticky drawer while the person pulls it open. You try a small nudge in different directions until the drawer slides freely, instead of forcing it.",
    coreIdeas: [
      "The patient must be able to do the movement without pain while you apply the glide. No instant improvement means the glide is wrong; do not persist.",
      "Hold the glide the whole time the patient moves, then repeat several times and finish with gentle overpressure only if painless.",
      "The result should carry over: the movement stays better after you release (the 'long-lasting' rule)."
    ],
    terms: [
      { term: "PILL response", meaning: "Pain-free, Instant result, Long-lasting. The three signs that an MWM is right." },
      { term: "Sustained glide", meaning: "A held, comfortable joint glide that does not oscillate." },
      { term: "Overpressure", meaning: "A little extra gentle pressure at the end of movement, only if painless." },
      { term: "CROCKS", meaning: "A checklist: Contraindications, Repetitions, Overpressure, Communication, Knowledge, Skill." }
    ],
    whenToUse: [
      "A clearly painful or restricted movement that is easy to repeat, for example painful gripping at the elbow or restricted ankle dorsiflexion.",
      "Joints that can be glided safely in a direction that changes the movement at once."
    ],
    whenNot: [
      "No immediate pain-free improvement after a few careful tries.",
      "Unstable joints, fractures, infection or inflammation, and where glides are unsafe.",
      "Any increase in pain, dizziness or neurological symptoms."
    ],
    steps: [
      { title: "Find the painful movement", detail: "Example: pain when gripping with the elbow extended in tennis elbow. Record the pain score." },
      { title: "Search for the glide", detail: "Try a gentle glide (for example, sideways at the elbow) and ask the patient to repeat the movement." },
      { title: "Check the PILL", detail: "The movement should become pain-free right now. If not, adjust the direction slightly, or abandon the technique." },
      { title: "Hold and repeat", detail: "Hold the glide while the patient performs the movement 6-10 times." },
      { title: "Add gentle overpressure only if painless", detail: "Do not exceed comfort." },
      { title: "Release and retest", detail: "Check if the improvement stays. Teach a home version if suitable." }
    ],
    dose: "Typical teaching range: about 6-10 repetitions, 2-3 sets, only if the movement is pain-free. Repeat for sessions if the benefit persists; if it fades quickly, rethink.",
    example: {
      patient: "Sana, 38, hairdresser, outer elbow pain when gripping her hairdryer.",
      assessment: "Painful grip: 7/10. Pain-free grip is very weak.",
      treatment: "You apply a gentle sideways glide of the forearm at the elbow while she grips. Pain falls to 1/10 during the grip. She repeats 10 times, 3 sets.",
      reassess: "After release the grip is pain-free at 2/10 and stronger. You add strengthening exercises and review. Had the pain stayed at 7/10 you would have changed the glide or stopped."
    },
    mistakes: [
      "Continuing when pain does not drop instantly.",
      "Applying the glide with so much force it hurts.",
      "Giving no follow-up exercise so the improvement fades."
    ],
    selfTest: [
      { q: "What does PILL stand for?", a: "Pain-free, Instant result, Long-lasting." },
      { q: "No immediate improvement after several tries. What next?", a: "Change the direction slightly or abandon the technique." }
    ],
    recap: "Glide, move, ask: if it is not pain-free and instant, it is not the right glide.",
    evidence: "Small trials and reviews suggest short-term benefit for conditions such as tennis elbow and ankle stiffness, but the evidence quality varies. The mechanism is unclear and may include pain modulation."
  },
  {
    slug: "mulligan-snags-nags",
    oneLine: "Neck and spine glides applied along the facet joint while the patient moves actively (SNAG) or in gentle oscillation (NAG).",
    whatItIs: "SNAG means Sustained Natural Apophyseal Glide: you glide one vertebra along the angle of its facet joint while the patient actively moves the painful way. NAG means Natural Apophyseal Glide, applied as a gentle oscillating glide, often to find the right direction. Self-SNAGs let the patient apply the glide themselves with a towel or hands.",
    analogy: "A facet joint is like a ramp. If you push the vertebra up the ramp's own slope while the neck turns, the movement runs smoothly; if you push across it, the movement jams.",
    coreIdeas: [
      "Glide along the facet plane, roughly toward the patient's eyes in the neck, while the patient moves.",
      "The movement must be pain-free and clearly better at once (the same PILL idea as other Mulligan techniques).",
      "Because it is near the neck, careful screening for blood-vessel and neurological problems comes first."
    ],
    terms: [
      { term: "Apophyseal joint", meaning: "Another name for the facet joint, the small paired joints at the back of each vertebra." },
      { term: "Sustained glide", meaning: "A held glide with the patient moving through it." },
      { term: "Self-SNAG", meaning: "A version where the patient holds a towel or their fingers on the vertebra and applies the glide themselves." },
      { term: "Dizziness warning", meaning: "Dizziness, nausea, visual change or numbness mean stop immediately." }
    ],
    whenToUse: [
      "Painful neck rotation or flexion where a segment is tender.",
      "Headaches arising from the upper neck that are reproduced by neck movement.",
      "Stiff upper-back movements in sitting."
    ],
    whenNot: [
      "Dizziness, visual disturbance, difficulty speaking or swallowing, or any neurological sign.",
      "Fracture, instability, infection or unexplained severe pain.",
      "No instant pain-free improvement."
    ],
    steps: [
      { title: "Screen for neck red flags", detail: "Check for dizziness, visual change, previous neck injury, and neurological symptoms." },
      { title: "Find the painful movement", detail: "Example: right rotation is painful at 40 degrees." },
      { title: "Contact the vertebra", detail: "In sitting, place your thumb pads on the side of the painful vertebra's joint, with support behind your thumb." },
      { title: "Apply the glide", detail: "Glide gently along the facet plane toward the patient's eyes." },
      { title: "Ask the patient to move", detail: "They turn through the previously painful range while you hold the glide. It should feel easy and pain-free." },
      { title: "Repeat and retest", detail: "Repeat 6-10 times. Retest rotation. Teach a self-SNAG if effective." }
    ],
    dose: "Typical teaching range: 6-10 repetitions, 2-3 sets. Stay pain-free. Stop if no instant improvement.",
    example: {
      patient: "David, 50, desk worker, neck pain turning to the left to check traffic.",
      assessment: "Left rotation is painful at 45 degrees. Screening is clear.",
      treatment: "You apply a SNAG at the left C5-6 facet while he turns slowly left. The movement becomes pain-free through the range, so he repeats 8 times, three sets.",
      reassess: "Rotation reaches 65 degrees with minimal pain. You teach a towel self-SNAG for home and review in a week."
    },
    mistakes: [
      "Pushing straight forward instead of along the facet plane.",
      "Ignoring dizziness or neurological symptoms.",
      "Continuing when pain does not drop."
    ],
    selfTest: [
      { q: "In which direction is the cervical SNAG glide applied?", a: "Along the facet plane, roughly toward the patient's eyes." },
      { q: "The patient feels dizzy. What do you do?", a: "Stop immediately and reassess for safety." }
    ],
    recap: "Glide along the facet, move the neck, and keep it pain-free.",
    evidence: "Small studies suggest short-term improvement in neck pain and headache, but evidence is limited and the effect over time is uncertain."
  },
  {
    slug: "paivm-ppivm-spinal-assessment",
    oneLine: "Hands-on spinal examination: PPIVMs test movement between vertebrae through natural bends; PAIVMs test small glides between them.",
    whatItIs: "PPIVMs (Passive Physiological Intervertebral Movements) and PAIVMs (Passive Accessory Intervertebral Movements) are hands-on tests of how each spinal segment moves and whether it hurts. They help you decide where to treat. They are also used for mobilization.",
    analogy: "Walking along a row of doors and pushing each one lightly: you note which one sticks, which one swings too freely and which one makes a squeaky sound that matches the patient's complaint.",
    coreIdeas: [
      "Pain response is more reliable than judging stiffness by feel. Ask what the patient feels at every level.",
      "Always compare neighboring levels and think in three parts: how much it moves, how it feels and what it provokes.",
      "A stiff segment does not prove it is the cause. Link what you find to the patient's comparable sign."
    ],
    terms: [
      { term: "PA (posteroanterior) glide", meaning: "Pushing a vertebra from back to front." },
      { term: "Central vs unilateral", meaning: "Central pushes on the spinous process in the midline. Unilateral pushes on one side near the facet." },
      { term: "Hypomobile / hypermobile", meaning: "Stiffer than expected / moving more than expected." },
      { term: "Provocation", meaning: "Reproducing the patient's pain during the test." },
      { term: "Reliability", meaning: "How consistently different examiners find the same result. For spinal stiffness, it is only fair, so link it to symptoms." }
    ],
    whenToUse: [
      "Back or neck pain where you want to find the most relevant segment.",
      "Before choosing mobilization level and direction.",
      "To retest after treatment."
    ],
    whenNot: [
      "Suspected fracture, instability or serious pathology (use medical assessment first).",
      "Severe pain or irritability where testing would cause a flare.",
      "Any neurological deficit that is progressing."
    ],
    steps: [
      { title: "Screen and ask about the pain", detail: "Know the pain area and the comparable sign before testing." },
      { title: "Position", detail: "Example: prone with the spine in a neutral resting position for lumbar PAIVMs." },
      { title: "Locate the segments", detail: "Palpate the spinous processes and identify levels accurately." },
      { title: "Test central PA at each level", detail: "Press gently and rhythmically. Note stiffness, spring and pain at each level." },
      { title: "Compare unilateral PA, then PPIVM", detail: "Repeat to the left and right and in bending directions if needed." },
      { title: "Record and link", detail: "Record 'hypo/normal/hyper' and the pain response, then check whether treating that level improves the comparable sign." }
    ],
    dose: "Assessment pressure is gentle and brief: a few oscillations per level. When used as treatment, follow the Maitland grading and dose guidance.",
    example: {
      patient: "Priya, 34, low back pain on bending forward after gardening.",
      assessment: "Central PA at L4 reproduces her pain and feels stiffer than L3 and L5. Forward bending is limited by pain.",
      treatment: "A Grade III central PA at L4 for 30 seconds, three sets, in prone.",
      reassess: "Forward bending improves by several centimeters with less pain, which confirms L4 is relevant. If bending had not changed, you would search another level or direction."
    },
    mistakes: [
      "Trusting the feel of stiffness alone without linking to pain or function.",
      "Testing at the wrong level through poor palpation.",
      "Using too much force in an irritable spine."
    ],
    selfTest: [
      { q: "What is a PA glide?", a: "Pushing a vertebra from back to front." },
      { q: "Which is more reliable, pain response or perceived stiffness?", a: "Pain response." }
    ],
    recap: "Test each level, ask about pain, and prove relevance by retesting.",
    evidence: "Reliability of judging stiffness between examiners is limited, whereas reproducing the patient's pain is more consistent. These tests guide treatment but do not diagnose a structure."
  },
  {
    slug: "high-velocity-low-amplitude-thrust",
    oneLine: "A fast, small, controlled thrust at the end of a joint's range, used only after careful screening and supervised training.",
    whatItIs: "HVLA thrust manipulation is a quick, small-range movement applied to a joint at its end of range (Maitland's Grade V). Sometimes a 'pop' (cavitation) is heard. The sound is not the goal. It requires supervised training, informed consent and precise screening.",
    analogy: "Like a quick tap on a sticky door lock rather than a long steady push. It only makes sense if you know the door can safely take it.",
    coreIdeas: [
      "Decide first whether a thrust is safe and justified; the technique comes second.",
      "A pop does not mean success or realignment. Success is a better movement or less pain on retest.",
      "Choose regions and techniques you are trained in, and prefer gentler options when risk or irritability is high."
    ],
    terms: [
      { term: "Thrust / manipulation", meaning: "A fast, small-amplitude movement at the end of range." },
      { term: "Cavitation", meaning: "The popping sound, likely from gas changes inside the joint. It is not proof of a good result." },
      { term: "Pre-manipulative position", meaning: "Positioning the joint to its end of range so only a small thrust is needed." },
      { term: "Informed consent", meaning: "The patient understands benefits, risks and alternatives and agrees." },
      { term: "Cervical arterial dysfunction", meaning: "Problems with neck blood vessels. Screening is essential before neck manipulation." }
    ],
    whenToUse: [
      "Mechanical back or thoracic pain with local stiffness and no red flags, when the patient agrees and you are trained.",
      "Short-duration low back pain with no pain below the knee (as one example, based on prediction rules that have had mixed results in later studies)."
    ],
    whenNot: [
      "Fracture, osteoporosis, infection, cancer, spinal instability or inflammatory spine disease.",
      "Neurological deficit, cauda equina signs, anticoagulant use or blood vessel concerns.",
      "Neck manipulation when vascular or upper-cervical risk cannot be excluded.",
      "The patient does not consent, is highly irritable or very apprehensive."
    ],
    steps: [
      { title: "Screen thoroughly", detail: "Red flags, neurological check, vascular risk factors, medications, and a safe history." },
      { title: "Explain and obtain consent", detail: "Explain what you will do, the usual sensations, rare risks, alternatives, and that they can say stop." },
      { title: "Consider gentler options first", detail: "If mobilization achieves the goal, a thrust may not be needed." },
      { title: "Position and relax", detail: "Support the patient so muscles are relaxed and the joint is in the pre-manipulative position." },
      { title: "Apply the thrust (only if trained)", detail: "A fast, small, controlled movement with good contact and body mechanics. Practice under supervision." },
      { title: "Reassess and document", detail: "Retest the comparable sign and neurological status, and record consent, technique and response." }
    ],
    dose: "One or two attempts per segment is a common teaching principle. Repeated forceful attempts add risk, not benefit. If the first attempt fails, change the plan.",
    example: {
      patient: "Omar, 30, athlete, mid-back stiffness after a long flight, pain with twisting.",
      assessment: "No red flags. Thoracic rotation limited with local tenderness at T6-7.",
      treatment: "After consent and screening, a trained therapist applies a thoracic thrust technique once. A pop is heard.",
      reassess: "Rotation increases and pain reduces. The therapist does not claim the 'pop' fixed it. They add mobility exercises and review."
    },
    mistakes: [
      "Treating the audible pop as proof of success.",
      "Repeating failed thrusts with more force.",
      "Skipping consent or screening."
    ],
    selfTest: [
      { q: "Does a pop mean the joint was put back in place?", a: "No. Judge success by retesting movement and pain." },
      { q: "When is neck manipulation not appropriate?", a: "When vascular or upper-cervical risk cannot be excluded, or other red flags are present." }
    ],
    recap: "Screen, consent, choose the safest effective option, then retest. Never trust the pop.",
    evidence: "Manipulation can give short-term pain relief in some back and neck problems and is similar to other manual therapy options. Rare serious adverse events occur, so selection and screening matter."
  },
  {
    slug: "neurodynamic-mobilization",
    oneLine: "Gentle movements that slide or lightly tension a nerve so it moves freely and tolerates movement better.",
    whatItIs: "Neurodynamic mobilization treats the nervous system's ability to glide and stretch during movement. You use specific limb and neck positions to either slide the nerve (sliders) or lightly tension it (tensioners), always staying below sharp pain.",
    analogy: "A nerve is like a wire inside a flexible tube. When you bend the arm, the wire should slide along the tube. If it sticks or is irritated, moving the joints can pull on it and cause symptoms.",
    coreIdeas: [
      "Nerves must glide and tolerate tension; sensitive nerves may reproduce symptoms with limb and neck movements.",
      "Sliders (one end shortens while the other lengthens) are gentler than tensioners (both ends lengthen).",
      "Use sensitizing movements, such as tilting the head, to test whether symptoms are neural, but never force through sharp pain."
    ],
    terms: [
      { term: "Neural tension test", meaning: "A sequence of limb positions that stresses a nerve, for example the upper limb tension test for the median nerve." },
      { term: "Slider", meaning: "A movement that slides the nerve without increasing overall tension." },
      { term: "Tensioner", meaning: "A movement that raises tension along the nerve." },
      { term: "Structural differentiation", meaning: "Changing one movement at a distant joint (like the neck) to see whether symptoms change, which suggests a neural source." },
      { term: "Mechanosensitivity", meaning: "A nerve becoming overly sensitive to normal movement and pressure." }
    ],
    whenToUse: [
      "Arm or leg symptoms (tingling, aching, pulling) reproduced by neural tension positions with a clear pattern.",
      "Nerve irritation after injury or entrapment where movement is guarded."
    ],
    whenNot: [
      "Worsening weakness, spinal cord signs or cauda equina symptoms.",
      "Severe, unstable or rapidly worsening nerve symptoms.",
      "Pushing into sharp pain, lingering numbness or tingling."
    ],
    steps: [
      { title: "Take the history", detail: "Ask where the symptoms are, what provokes them, and whether they are constant or movement-related." },
      { title: "Neurological screen", detail: "Check strength, sensation and reflexes." },
      { title: "Perform the neural test", detail: "Example: for the median nerve, lower the shoulder, abduct the arm to about 90 degrees, extend the wrist and fingers, rotate the arm outward, then straighten the elbow. Stop at the first clear symptom." },
      { title: "Use structural differentiation", detail: "Add or remove head tilt; if symptoms change, the nerve is likely involved." },
      { title: "Treat with sliders first", detail: "Alternate elbow straightening with neck tilting toward it, gently, short of strong symptoms." },
      { title: "Retest and teach", detail: "Reassess the test and give a gentle home slider if helpful." }
    ],
    dose: "Typical teaching range: sliders 8-10 slow repetitions, 2-3 sets, a few times per day. Symptoms should be mild and settle quickly.",
    example: {
      patient: "Lena, 41, tingling in her thumb and index finger when typing, worse with her elbow straight.",
      assessment: "Median nerve test reproduces tingling at about 120 degrees of elbow extension, and tilting the head away increases it.",
      treatment: "She does gentle median nerve sliders: elbow straightens as the head tilts toward the arm, then reverses. 10 repetitions, 3 sets.",
      reassess: "Elbow extension increases by 20 degrees before symptoms start. She continues the sliders and adjusts her workstation."
    },
    mistakes: [
      "Using aggressive tensioners on an irritable nerve.",
      "Skipping a neurological screen.",
      "Treating symptoms that are not neural."
    ],
    selfTest: [
      { q: "Difference between sliders and tensioners?", a: "Sliders shorten one end while lengthening the other. Tensioners lengthen both ends." },
      { q: "What is structural differentiation for?", a: "To check whether symptoms change when a distant joint moves, suggesting a neural source." }
    ],
    recap: "Slide first, tension later, and never provoke sharp or lingering symptoms.",
    evidence: "Reviews suggest neural mobilization may help pain and function in some nerve-related conditions, though trial quality varies. The mechanisms are still debated."
  },
  {
    slug: "pnf-manual-techniques",
    oneLine: "Using the patient's own gentle muscle contractions, with your hand resistance, to improve range, strength and control.",
    whatItIs: "Proprioceptive Neuromuscular Facilitation (PNF) uses diagonal movement patterns and carefully timed muscle contractions against your resistance. Techniques include hold-relax, contract-relax, rhythmic initiation, slow reversal and rhythmic stabilization. They are used to gain range, teach control and build strength.",
    analogy: "Like a coach guiding a swing: you provide just enough resistance and timing for the muscles to coordinate, and then the athlete does the work.",
    coreIdeas: [
      "Muscles work in diagonal, spiral patterns (D1 and D2) that match daily and sports movement.",
      "After a gentle contraction, a muscle may stretch more easily, so you gain range right after it.",
      "Verbal commands, touch and resistance combine to guide the movement."
    ],
    terms: [
      { term: "D1 / D2 patterns", meaning: "Diagonal movement patterns of the arm or leg that combine flexion or extension with rotation." },
      { term: "Contract-relax", meaning: "Stretch to the limit, patient contracts the tight muscle, relaxes, then you move to a new range." },
      { term: "Hold-relax", meaning: "Similar, using an isometric hold (no movement) of the tight muscle." },
      { term: "Rhythmic stabilization", meaning: "Alternating isometric holds in opposite directions to improve joint stability." },
      { term: "Isometric", meaning: "A contraction where the muscle tightens without the joint moving." }
    ],
    whenToUse: [
      "Muscle tightness limiting range (hamstrings, calves, shoulder muscles).",
      "Weakness or poor control after injury or surgery.",
      "Neurological rehabilitation, where guided movement patterns help motor learning."
    ],
    whenNot: [
      "Uncontrolled high blood pressure or heart conditions (avoid strong breath-holding).",
      "Acute muscle tear, unstable fracture or joint instability.",
      "Pain that increases during the contraction."
    ],
    steps: [
      { title: "Explain and demonstrate", detail: "Show the movement pattern and what you want them to do." },
      { title: "Move to the first restriction", detail: "Example: lift the straight leg to the point where the hamstring feels tight." },
      { title: "Ask for a gentle contraction", detail: "'Push gently into my hand.' Use a light to moderate effort and breathe normally." },
      { title: "Hold, then relax", detail: "Hold about 5-10 seconds, then tell them to fully relax." },
      { title: "Move to the new range", detail: "Take the leg further into the freshly available range and hold briefly." },
      { title: "Repeat and retest", detail: "Repeat 3-5 times and retest range or function." }
    ],
    dose: "Typical teaching range: a gentle contraction of about 5-10 seconds followed by a 10-30 second stretch, repeated 3-5 times. Keep effort light to moderate.",
    example: {
      patient: "Jamal, 24, footballer, tight left hamstring; straight leg raise stops at 60 degrees.",
      assessment: "Pain-free, tight sensation behind the thigh, no tear signs.",
      treatment: "Contract-relax: at 60 degrees he pushes his heel gently into your shoulder for 8 seconds, relaxes, you lift the leg further. Repeat 4 times.",
      reassess: "Raise improves to 75 degrees. He follows with active hamstring control exercises."
    },
    mistakes: [
      "Asking for a maximum contraction.",
      "Letting the patient hold their breath.",
      "Stretching straight away without full relaxation."
    ],
    selfTest: [
      { q: "What is a contract-relax technique?", a: "Stretch to the limit, patient contracts the tight muscle, relaxes, then range is increased." },
      { q: "Why avoid breath-holding?", a: "It can raise blood pressure and reduces relaxation." }
    ],
    recap: "Gentle contraction, full relaxation, then move into the new range.",
    evidence: "PNF stretching can improve flexibility in the short term, similar to other stretching methods. Mechanisms likely include changes in stretch tolerance rather than only muscle lengthening."
  }
];
