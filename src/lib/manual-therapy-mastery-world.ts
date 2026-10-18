import type { MasteryGuide } from "@/lib/manual-therapy-mastery-types";

export const masteryWorld: MasteryGuide[] = [
  {
    slug: "paris-approach",
    oneLine: "A step-by-step orthopedic examination that decides first whether a joint needs mobilizing, stabilizing or something else, then treats and retests.",
    whatItIs: "The Paris approach, associated with Stanley Paris, is a framework for orthopedic manual therapy. You examine in a set order, classify the problem (for example hypomobile, hypermobile or not mechanical), choose joint-specific treatment, and teach exercises for lasting change.",
    analogy: "Like a mechanic who diagnoses with a checklist before touching any bolt. The checking is the skill; the spanner comes later.",
    coreIdeas: [
      "Examine before you treat: history, observation, active and passive movement, joint-play and neurological checks, in a consistent order.",
      "Treat according to the finding: stiff joints may be mobilized, loose joints need stabilizing exercise.",
      "Retest the functional problem and build active rehabilitation around it."
    ],
    terms: [
      { term: "Hypomobile", meaning: "A joint moving less than expected." },
      { term: "Hypermobile", meaning: "A joint moving more than expected; usually needs stability, not stretching." },
      { term: "Joint play", meaning: "Small passive movements of a joint surface the patient cannot do actively." },
      { term: "Classification", meaning: "Grouping the problem to guide treatment choice." },
      { term: "Clinical reasoning", meaning: "Using findings to decide and revise the plan." }
    ],
    whenToUse: [
      "Joint or spine problems where you need a clear reason for choosing manual therapy.",
      "Teaching and learning systematic examination."
    ],
    whenNot: [
      "When red flags need medical review first.",
      "As a rigid recipe: the order serves the patient, not the other way round."
    ],
    steps: [
      { title: "Listen and screen", detail: "Take the history and rule out red flags." },
      { title: "Observe and test active movement", detail: "Watch the movement and note where pain or limitation occurs." },
      { title: "Test passive movement and joint play", detail: "Check range, end-feel and small glides, comparing sides." },
      { title: "Check nerves, muscles and neighbouring joints", detail: "The problem may come from elsewhere." },
      { title: "Classify and choose", detail: "Stiff joint: consider mobilization. Loose joint: stabilize. Unclear: refer or gather more data." },
      { title: "Treat, retest and teach", detail: "Apply the treatment, retest the movement, and give exercises." }
    ],
    dose: "No fixed dose. Dose follows the technique you choose (for example mobilization grades) and the patient's irritability.",
    example: {
      patient: "Daniel, 55, architect, shoulder stiffness for weeks.",
      assessment: "Active and passive elevation are both limited with a firm end-feel; the glide of the joint is reduced; the neck and nerves are clear.",
      treatment: "A hypomobile pattern is identified, so joint mobilization and stretching are chosen, plus home exercises.",
      reassess: "Elevation improves and he returns to lifting tasks. Had the examination shown a loose joint, stabilizing exercises would have been chosen."
    },
    mistakes: [
      "Treating the diagram instead of the examination.",
      "Mobilizing a hypermobile joint.",
      "Skipping the retest."
    ],
    selfTest: [
      { q: "Hypermobile joint: mobilize or stabilize?", a: "Stabilize." },
      { q: "What comes before treatment choice?", a: "A systematic examination." }
    ],
    recap: "Examine, classify, treat to match, retest.",
    evidence: "The Paris approach is a reasoning framework, not one treatment. Its components (manual therapy plus exercise) have varying evidence depending on the condition."
  },
  {
    slug: "mckenzie-mdt",
    oneLine: "An assessment system that uses how symptoms respond to repeated movements to guide a self-management exercise plan.",
    whatItIs: "McKenzie Mechanical Diagnosis and Therapy (MDT) is mostly active care. You test repeated movements or sustained positions, watch how pain moves, and use the response to classify the problem and choose exercises the patient does themselves.",
    analogy: "Like a compass for movement: the pain's behavior points toward the direction that helps, rather than assuming one exercise suits everyone.",
    coreIdeas: [
      "Directional preference: some people improve with a repeated movement direction (often extension), others with flexion or sideways movements.",
      "Centralization: pain moving from the leg toward the spine during testing is a good sign; peripheralization (moving away) is a warning.",
      "The patient learns to manage symptoms themselves, with minimal dependence on hands-on treatment."
    ],
    terms: [
      { term: "Centralization", meaning: "Pain or symptoms moving from the limb back toward the spine." },
      { term: "Peripheralization", meaning: "Symptoms moving farther down the limb." },
      { term: "Directional preference", meaning: "A movement direction that consistently reduces symptoms." },
      { term: "Derangement", meaning: "A pattern where repeated movements change symptom location and range." },
      { term: "Dysfunction / Postural", meaning: "Pain from tight tissue at end range, or from prolonged poor positions." }
    ],
    whenToUse: [
      "Back or neck pain, with or without arm or leg pain, with no red flags.",
      "When you want the patient to take charge of treatment."
    ],
    whenNot: [
      "Red flags: progressive weakness, loss of bowel or bladder control, saddle numbness, major trauma or systemic illness.",
      "When symptoms peripheralize or neurological signs worsen during testing."
    ],
    steps: [
      { title: "Draw a symptom map", detail: "Record where symptoms are, which is the farthest, and daily-task limits." },
      { title: "Screen", detail: "Rule out red flags and check neurological status." },
      { title: "Test repeated movements", detail: "Example: repeated extension in lying for about 10 repetitions." },
      { title: "Watch the response", detail: "Note location, intensity and after-effects. Does leg pain retreat toward the back?" },
      { title: "Classify and prescribe", detail: "If a direction helps, teach it as a home exercise; if not, test another." },
      { title: "Review across visits", detail: "Recheck symptom map, function and neurological status." }
    ],
    dose: "Typical teaching range: about 10 repetitions of the helpful movement, repeated several times a day while symptoms are active, adjusted by a trained clinician.",
    example: {
      patient: "Carlos, 41, driver, low back pain and calf pain after sitting.",
      assessment: "Repeated extension in lying makes the calf pain retreat to the buttock; flexion makes it worse.",
      treatment: "He is taught extension in lying, 10 repetitions every few hours, and posture advice for driving.",
      reassess: "Calf pain is gone after a week and walking improves. If it had worsened or weakness appeared, the plan would change."
    },
    mistakes: [
      "Giving extension to everyone.",
      "Continuing when symptoms peripheralize.",
      "Declaring a disc has been 'put back'."
    ],
    selfTest: [
      { q: "Centralization means?", a: "Symptoms moving toward the spine." },
      { q: "Is extension right for everyone?", a: "No. The response decides." }
    ],
    recap: "Follow the symptom response, not the famous exercise.",
    evidence: "MDT has research as an assessment and self-management system, with benefits depending on the condition and comparison. Directional preference and centralization are recognized patterns, though they do not prove a disc moved."
  },
  {
    slug: "mennell-joint-play",
    oneLine: "Testing tiny involuntary joint movements ('joint play') that you cannot do by yourself, to find out if a joint is blocked.",
    whatItIs: "Joint play (Mennell) means the small, passive give inside a joint, such as a slight glide or spin, which allows normal movement. If it is lost, normal movement may be restricted or painful. You test each joint's play, compare sides, and treat if it is reduced.",
    analogy: "A door hinge needs a tiny bit of wiggle to swing smoothly. If the hinge has no wiggle, the door sticks even though the door itself is fine.",
    coreIdeas: [
      "Joint play cannot be performed actively; you must test it passively with the joint relaxed.",
      "Test in a loose-packed position, compare to the other side, and look for lost or painful play.",
      "Reduced joint play is one finding to interpret alongside pain and function."
    ],
    terms: [
      { term: "Joint play", meaning: "Small passive movements of joint surfaces." },
      { term: "Loose-packed position", meaning: "The joint position with the most room for joint play." },
      { term: "Close-packed position", meaning: "The joint position with the least play, most stable." },
      { term: "Capsular pattern", meaning: "A pattern of limited movements typical for joint capsule stiffness." }
    ],
    whenToUse: [
      "A joint with restricted movement and no clear tissue cause.",
      "As part of an orthopedic examination."
    ],
    whenNot: [
      "Fractures, infection, or instability.",
      "Joint play testing that increases pain sharply."
    ],
    steps: [
      { title: "Position in loose-pack", detail: "Support the joint so muscles relax." },
      { title: "Stabilize one bone", detail: "Hold one side still." },
      { title: "Glide the other bone", detail: "Apply a gentle glide, traction or compression." },
      { title: "Compare with the other side", detail: "Note amount, end-feel and pain." },
      { title: "Decide", detail: "Reduced play with a link to the patient's problem supports treatment." },
      { title: "Treat and retest", detail: "Mobilize if appropriate and recheck the movement." }
    ],
    dose: "Testing is brief and gentle. Treatment dose follows the mobilization technique chosen.",
    example: {
      patient: "Hannah, 36, wrist pain after a cast was removed; wrist extension is limited.",
      assessment: "Joint play at the radiocarpal joint is reduced compared with the other wrist.",
      treatment: "A gentle glide mobilization is applied, followed by active movement.",
      reassess: "Wrist extension improves. She continues home exercises."
    },
    mistakes: [
      "Testing in a tense position.",
      "Forgetting to compare sides.",
      "Treating a finding that does not match the patient's complaint."
    ],
    selfTest: [
      { q: "Can the patient do joint play on their own?", a: "No, it must be tested passively." },
      { q: "Which position is best?", a: "Loose-packed." }
    ],
    recap: "Test the hinge's wiggle, compare sides, and link to function.",
    evidence: "Joint-play testing is a classic examination concept. Reliability varies, so findings should be linked to symptoms and function rather than used alone."
  },
  {
    slug: "fascial-distortion-model",
    oneLine: "A model (Typaldos) that sorts pain into six fascial 'distortions', each treated with a specific manual technique.",
    whatItIs: "The Fascial Distortion Model (FDM) proposes that many injuries and pains arise from six types of distorted fascia and that each can be reversed with a particular manual technique. Practitioners notice how patients describe and gesture toward their pain to classify it.",
    analogy: "Like a map where each type of fold in a sheet needs a different way of smoothing it out. Whether the folds are real is what research still has to show.",
    coreIdeas: [
      "Six proposed distortion types: triggerband, continuum, cylinder, herniated trigger point, tectonic fixation and folding.",
      "Patient gestures and words are used as clues.",
      "The model's explanations are not proven, so judge the outcome and keep care safe."
    ],
    terms: [
      { term: "Fascial distortion", meaning: "The model's term for a proposed twist, fold or tension in connective tissue." },
      { term: "Triggerband", meaning: "A line of tight fascia, often shown by tracing a line along the body." },
      { term: "Herniated trigger point", meaning: "A proposed small bulge of tissue through a fascial layer." },
      { term: "Gesture clue", meaning: "A patient's hand movement when describing pain, used as a diagnostic hint." }
    ],
    whenToUse: [
      "Practitioners trained in the model, where the patient understands and consents to firm techniques.",
      "As a way to organize patient descriptions of pain."
    ],
    whenNot: [
      "Fractures, infection, bleeding disorders or red flags.",
      "When firm pressure is not tolerated.",
      "Using the model's claims as proven science."
    ],
    steps: [
      { title: "Listen and screen", detail: "Take a history and rule out red flags." },
      { title: "Observe how the patient describes the pain", detail: "Note words and hand gestures." },
      { title: "Propose a distortion type", detail: "Match it to the model as a working idea." },
      { title: "Apply the matching technique", detail: "Use firm, controlled manual pressure as trained." },
      { title: "Retest", detail: "Check pain and movement immediately." },
      { title: "Keep the model honest", detail: "Record outcomes, and add exercise and education." }
    ],
    dose: "Dose depends on the training for each technique; keep pressure within the patient's tolerance and stop if pain spikes.",
    example: {
      patient: "Helen, 48, shoulder pain, traces a line down her arm with her fingers.",
      assessment: "The practitioner considers a triggerband pattern and screens for red flags.",
      treatment: "Firm pressure along the band is applied briefly, within tolerance.",
      reassess: "Shoulder movement improves and pain reduces. The practitioner notes the result without claiming proof of the fascial theory."
    },
    mistakes: [
      "Assuming the gesture proves the diagnosis.",
      "Applying very hard pressure.",
      "Ignoring red flags."
    ],
    selfTest: [
      { q: "How many distortion types?", a: "Six." },
      { q: "Is the model proven?", a: "No. Evidence is limited." }
    ],
    recap: "Use the model as a hypothesis, measure the result, stay safe.",
    evidence: "Evidence for FDM is very limited, mostly small studies and case reports. The proposed mechanisms are unproven."
  },
  {
    slug: "balanced-ligamentous-tension",
    oneLine: "A very light osteopathic method: hold a joint at the point where its ligaments feel evenly balanced, until the tissue seems to settle.",
    whatItIs: "Balanced Ligamentous Tension (BLT) is an osteopathic approach in which you hold a joint in the position where ligament tension feels equal in all directions. You wait for a sense of release. It is gentle and slow.",
    analogy: "Like balancing a tent with guy ropes: you adjust until all ropes feel equally taut, then the tent sits still.",
    coreIdeas: [
      "Find the neutral point of balance rather than pushing a barrier.",
      "Hold light contact and wait.",
      "The perceived release is subjective, so judge results by patient-reported change."
    ],
    terms: [
      { term: "Point of balance", meaning: "The position where tissue tension feels equal around the joint." },
      { term: "Ligamentous tension", meaning: "The pull felt from ligaments holding bones together." },
      { term: "Release", meaning: "A sense of softening or settling, interpreted by the practitioner." },
      { term: "Neutral", meaning: "A mid-position of the joint with minimal tension." }
    ],
    whenToUse: [
      "Gentle treatment of joints or soft tissues in people who cannot tolerate firm techniques.",
      "Practitioners trained in osteopathic methods."
    ],
    whenNot: [
      "Fractures, instability, infection or unexplained severe pain.",
      "Using it to replace needed medical care."
    ],
    steps: [
      { title: "Screen and explain", detail: "Check for red flags and explain the slow, light technique." },
      { title: "Support the joint", detail: "For example, support the wrist in the patient's comfortable position." },
      { title: "Find balance", detail: "Slightly move the joint to find where tension feels even." },
      { title: "Hold light contact", detail: "Maintain minimal pressure and wait for changes." },
      { title: "Release slowly", detail: "When the tissue seems to settle, let go gradually." },
      { title: "Retest function", detail: "Recheck pain or movement." }
    ],
    dose: "Typical teaching range: a hold of about 1-5 minutes, light contact only. There is no proven optimum.",
    example: {
      patient: "Tom, 62, wrist pain after a fall, fracture excluded, painful with firm touch.",
      assessment: "Tender and guarded; X-ray clear.",
      treatment: "You hold the wrist in its balanced position with very light contact for three minutes.",
      reassess: "The wrist feels less guarded and rotation is easier. You add gentle exercise."
    },
    mistakes: [
      "Using force.",
      "Believing the felt release proves ligament change.",
      "Ignoring red flags."
    ],
    selfTest: [
      { q: "What are you looking for?", a: "The balanced neutral point." },
      { q: "How do you judge success?", a: "Patient-reported pain and function." }
    ],
    recap: "Balance, hold lightly, wait, retest.",
    evidence: "Evidence is minimal. Benefits may come from relaxation and patient context rather than a ligament effect."
  },
  {
    slug: "spencer-shoulder-sequence",
    oneLine: "A seven-step osteopathic sequence of gentle, rhythmic shoulder movements used for stiff shoulders.",
    whatItIs: "The Spencer technique is a fixed sequence of seven shoulder movements, performed with the patient lying on their side. It is used for stiffness such as adhesive capsulitis. Each step gently moves the shoulder toward its limit in a rhythmic way.",
    analogy: "Like a warm-up routine: seven short moves that gradually loosen the shoulder in a planned order.",
    coreIdeas: [
      "The sequence covers extension, flexion, circumduction (with compression and traction), abduction, adduction with internal rotation, and a final traction step.",
      "Rhythm and gentle pressure matter more than force.",
      "Assess shoulder movement before and after."
    ],
    terms: [
      { term: "Adhesive capsulitis", meaning: "Frozen shoulder: painful, progressive stiffness of the shoulder joint capsule." },
      { term: "Circumduction", meaning: "Moving the arm in a circle." },
      { term: "Side-lying", meaning: "Lying on the unaffected side." },
      { term: "Articulation", meaning: "Repeated gentle joint movement." }
    ],
    whenToUse: [
      "A stiff shoulder in the stiff or recovery phase, once other causes have been screened.",
      "Practitioners trained in the technique."
    ],
    whenNot: [
      "Shoulder fracture, dislocation, severe pain or infection.",
      "Neurological signs, or pain that rises sharply during the steps."
    ],
    steps: [
      { title: "Screen and assess range", detail: "Record how far the arm lifts and rotates." },
      { title: "Position the patient", detail: "Lie on the unaffected side with the shoulder supported." },
      { title: "Steps 1-2", detail: "Gently take the shoulder into extension and flexion within comfort." },
      { title: "Steps 3-4", detail: "Perform circumduction first with gentle compression, then with gentle traction." },
      { title: "Steps 5-6", detail: "Move the arm into abduction, then adduction with internal rotation." },
      { title: "Step 7 and retest", detail: "Finish with gentle rhythmic traction and then retest range." }
    ],
    dose: "Typical teaching range: each step performed gently for several rhythmic repetitions. Follow your training and keep within comfort.",
    example: {
      patient: "Margaret, 63, stiff right shoulder for four months, can lift to 90 degrees.",
      assessment: "Painful and stiff, with no fracture and no nerve signs.",
      treatment: "Seven-step sequence performed gently in side-lying.",
      reassess: "She can lift to 105 degrees and pain is slightly reduced. A home exercise plan follows."
    },
    mistakes: [
      "Forcing past pain.",
      "Skipping the screen.",
      "Treating the sequence as a cure."
    ],
    selfTest: [
      { q: "How many steps?", a: "Seven." },
      { q: "What is it commonly used for?", a: "Stiff shoulders such as adhesive capsulitis." }
    ],
    recap: "Seven gentle steps, then retest and exercise.",
    evidence: "Evidence is limited to small studies. It may help stiffness for some, but it is not proven better than other approaches."
  },
  {
    slug: "still-technique",
    oneLine: "An osteopathic method that moves the tissue into ease, adds a small compression, then guides it through the restriction.",
    whatItIs: "Still technique is a combined approach: you first move the tissue toward its position of ease (indirect), then add gentle compression or traction, and then guide it through the restricted direction (direct). It aims to reduce tension without a fast thrust.",
    analogy: "Like loosening a stiff zipper: you first ease the fabric, then guide the slider along rather than tugging.",
    coreIdeas: [
      "Indirect first, then direct. The first move reduces guarding.",
      "A small, steady force is maintained during the movement.",
      "The aim is a smooth movement, not a forceful stretch."
    ],
    terms: [
      { term: "Somatic dysfunction", meaning: "An osteopathic term for impaired movement of a body region." },
      { term: "Indirect", meaning: "Moving toward the easy direction." },
      { term: "Direct", meaning: "Moving toward the restriction." },
      { term: "Facilitating force", meaning: "A gentle compression or traction applied during positioning." }
    ],
    whenToUse: [
      "Stiff, tender joints or regions where a gentle method is wanted.",
      "Practitioners trained in osteopathic techniques."
    ],
    whenNot: [
      "Fractures, instability, infection or blood-vessel concerns.",
      "Pain or neurological symptoms increasing during the technique."
    ],
    steps: [
      { title: "Find the restriction", detail: "Palpate and test the stiff movement." },
      { title: "Move into ease", detail: "Position toward the easiest direction." },
      { title: "Add a gentle force", detail: "Apply light compression or traction." },
      { title: "Guide toward the barrier", detail: "Slowly move through the restricted direction while keeping the force." },
      { title: "Return and retest", detail: "Return to neutral and retest movement." }
    ],
    dose: "No fixed dose; usually one to a few smooth repetitions per region. Keep force light.",
    example: {
      patient: "Priyanka, 33, stiff neck after sleeping badly; rotation to the left is limited.",
      assessment: "No red flags; tenderness at the left neck muscles.",
      treatment: "You ease the head toward comfort, add light traction, and gently guide the head toward left rotation.",
      reassess: "Rotation improves and discomfort reduces. You advise gentle neck movement."
    },
    mistakes: [
      "Skipping the ease step.",
      "Using force to push through guarding.",
      "Ignoring neck safety screening."
    ],
    selfTest: [
      { q: "Indirect then direct: what does that mean?", a: "Ease first, then guide toward the restriction." },
      { q: "Force level?", a: "Light." }
    ],
    recap: "Ease first, guide second, retest.",
    evidence: "Evidence is limited, mainly case reports and small studies. Results may reflect general effects of gentle manual therapy."
  },
  {
    slug: "osteopathic-articulatory",
    oneLine: "Slow, rhythmic, repeated joint movements, taken a little further each time toward a stiff direction.",
    whatItIs: "Osteopathic articulatory techniques are low-speed, moderate-amplitude movements. You gently move a joint through and slightly beyond its restricted range, repeating rhythmically and monitoring comfort.",
    analogy: "Like working a rusty hinge back and forth, a little further each time, until it moves freely.",
    coreIdeas: [
      "Repetition and rhythm gradually increase range.",
      "No sudden thrust; keep the movement smooth.",
      "Work within the patient's comfort and retest."
    ],
    terms: [
      { term: "Articulation", meaning: "Repeated passive movement of a joint." },
      { term: "Amplitude", meaning: "How big the movement is." },
      { term: "Barrier", meaning: "The point where resistance begins." },
      { term: "Thoracic spine", meaning: "The mid-back region." }
    ],
    whenToUse: [
      "Stiff joints, such as the mid-back, where gentle repeated movement is suitable.",
      "People who prefer a non-thrust method."
    ],
    whenNot: [
      "Fractures, osteoporosis concerns, infection or instability.",
      "Pain that rises sharply."
    ],
    steps: [
      { title: "Screen and position", detail: "Seat or place the patient with the joint supported." },
      { title: "Find the restricted direction", detail: "Test rotation or bending to see the stiffer side." },
      { title: "Begin gentle rhythm", detail: "Move the joint slowly toward the limit and back." },
      { title: "Increase range gradually", detail: "Take it a little further each repetition, within comfort." },
      { title: "Monitor responses", detail: "Ask about pain and look at breathing and guarding." },
      { title: "Retest", detail: "Check the original movement." }
    ],
    dose: "Typical teaching range: about 5-10 slow repetitions per direction, depending on response. Keep within comfort.",
    example: {
      patient: "Victor, 50, stiff mid-back, rotation to the right limited.",
      assessment: "No red flags; rotation stiffer to the right.",
      treatment: "In sitting with arms crossed, you rock the trunk gently into right rotation for 8 repetitions, increasing range slightly.",
      reassess: "Rotation improves. You give mobility exercises."
    },
    mistakes: [
      "Moving too fast.",
      "Forcing past pain.",
      "Not retesting."
    ],
    selfTest: [
      { q: "Is it a thrust technique?", a: "No." },
      { q: "How is range increased?", a: "Gradually with each repetition within comfort." }
    ],
    recap: "Rhythm, repetition, gradual range, retest.",
    evidence: "Evidence is limited. Gentle repeated mobilization likely behaves like other mobilization approaches, with short-term benefit for some."
  },
  {
    slug: "osteopathic-lymphatic-pump",
    oneLine: "Rhythmic pressure on the chest, belly or feet to encourage lymph and fluid movement, used as an adjunct in some settings.",
    whatItIs: "Osteopathic lymphatic pump techniques use rhythmic compressions (thoracic, abdominal or pedal) intended to move lymph. They have been studied as an add-on for conditions like pneumonia, but claims about boosting immunity or 'clearing' the body are not established.",
    analogy: "Like pressing a squeeze bottle gently and rhythmically to move liquid along a tube.",
    coreIdeas: [
      "Rhythm and light to moderate pressure matter; avoid aggressive force.",
      "It is an adjunct and never a substitute for medical treatment of infection.",
      "Benefits are not proven, so keep claims modest."
    ],
    terms: [
      { term: "Lymphatic pump", meaning: "Rhythmic compression intended to move lymph." },
      { term: "Thoracic pump", meaning: "Rhythmic pressure on the chest wall." },
      { term: "Pedal pump", meaning: "Rhythmic movement at the feet." },
      { term: "Adjunct", meaning: "An add-on to standard care." }
    ],
    whenToUse: [
      "Trained practitioners offering it as an adjunct, with medical approval where there is infection.",
      "Gentle chest-wall mobility work when appropriate."
    ],
    whenNot: [
      "Rib fractures, severe osteoporosis, or recent chest or abdominal surgery.",
      "Acute abdominal conditions, severe breathing difficulty or unstable illness without medical approval.",
      "Replacing antibiotics or medical care."
    ],
    steps: [
      { title: "Check medical status", detail: "Confirm safety, especially if the patient is unwell." },
      { title: "Position", detail: "Usually lying on the back with the chest accessible." },
      { title: "Apply gentle rhythm", detail: "Use light, regular compression and release on the chest wall." },
      { title: "Match breathing comfort", detail: "Keep within what the patient tolerates." },
      { title: "Stop and monitor", detail: "Stop if pain, dizziness or breathlessness increase." },
      { title: "Reassess", detail: "Check comfort and breathing; do not claim a cure." }
    ],
    dose: "No proven optimum. Teaching examples often use gentle pumping for a few minutes. Follow your training and medical guidance.",
    example: {
      patient: "Walter, 72, recovering from pneumonia under medical care, asks about adding hands-on help.",
      assessment: "His doctor approves gentle chest-wall work; no rib pain.",
      treatment: "A gentle thoracic pump is used for three minutes alongside his medical treatment.",
      reassess: "He feels more comfortable breathing. The therapist records the result without claiming it treated the infection."
    },
    mistakes: [
      "Promising to boost immunity.",
      "Using strong pressure.",
      "Delaying medical care."
    ],
    selfTest: [
      { q: "Is it a replacement for antibiotics?", a: "No." },
      { q: "When avoid it?", a: "Rib fracture, unstable illness, acute abdomen, or without medical approval." }
    ],
    recap: "Gentle rhythm as an adjunct, with modest claims.",
    evidence: "Some studies of pneumonia in older adults suggest possible benefit, but results are not conclusive. It does not replace medical treatment."
  },
  {
    slug: "rolfing-structural-integration",
    oneLine: "A structured series of deep soft-tissue sessions aimed at improving posture and movement.",
    whatItIs: "Rolfing Structural Integration is a hands-on approach, typically delivered in a series of about ten sessions, using firm fascial work and movement education to change how the body organizes itself against gravity.",
    analogy: "Like re-stacking a leaning tower of blocks: the idea is to improve how the pieces line up, but whether manual pressure alone can do that is debated.",
    coreIdeas: [
      "Work happens in a planned series, each session focused on a region.",
      "Movement awareness is part of the process.",
      "Claims about permanent postural realignment are not proven."
    ],
    terms: [
      { term: "Structural integration", meaning: "A body-work method focusing on posture and fascia." },
      { term: "Ten-series", meaning: "A traditional plan of about ten sessions." },
      { term: "Posture", meaning: "How the body is held and aligned." },
      { term: "Fascia", meaning: "Connective tissue wrapping muscles and organs." }
    ],
    whenToUse: [
      "People wanting a structured, longer program of bodywork with a trained practitioner.",
      "As a complement to exercise, not a replacement."
    ],
    whenNot: [
      "Acute injuries, infection, blood clots, or serious medical conditions without clearance.",
      "Bleeding disorders or strong blood-thinning medicines without checking.",
      "When firm pressure is not tolerated."
    ],
    steps: [
      { title: "Screen and set goals", detail: "Agree on measurable goals, such as comfortable walking or reaching." },
      { title: "Observe posture and movement", detail: "Look at standing, walking and balance." },
      { title: "Apply session work", detail: "Use firm, slow fascial techniques within tolerance." },
      { title: "Add movement education", detail: "Teach awareness and gentle exercises." },
      { title: "Review progress", detail: "Check function against the original goals." },
      { title: "Support active habits", detail: "Encourage regular exercise." }
    ],
    dose: "Traditional series of about ten sessions. No evidence proves this number is required. Use goals and response to decide.",
    example: {
      patient: "Samuel, 45, sedentary worker with a stiff upper back and rounded shoulders.",
      assessment: "Reduced shoulder movement, no red flags.",
      treatment: "A short series of sessions plus daily posture and mobility exercises.",
      reassess: "He reports easier movement and less tightness. The practitioner avoids claiming his bones were realigned."
    },
    mistakes: [
      "Promising permanent posture change.",
      "Over-pressing and bruising.",
      "Ignoring red flags."
    ],
    selfTest: [
      { q: "Typical series length?", a: "About ten sessions." },
      { q: "Is posture realignment proven?", a: "No." }
    ],
    recap: "A structured program with modest claims and measurable goals.",
    evidence: "Evidence is limited and low quality. Some small studies report improvements in comfort or movement, but permanent structural change is not demonstrated."
  },
  {
    slug: "bowen-technique",
    oneLine: "Very light rolling moves on the muscles with built-in pauses; popular but with little strong evidence.",
    whatItIs: "Bowen technique uses gentle, brief rolling moves over muscles and tendons with pauses between sets of moves. Practitioners claim it 'resets' the body, but this has not been shown.",
    analogy: "Like a light tap sequence with rests: it feels pleasant, but a pleasant feeling is not proof of a specific treatment effect.",
    coreIdeas: [
      "The pause is part of the tradition, not proven physiology.",
      "Judge it by the patient's goals, such as movement or pain, not by relaxation alone.",
      "It must not delay proper medical assessment."
    ],
    terms: [
      { term: "Bowenwork", meaning: "The practice named after Tom Bowen." },
      { term: "Rolling move", meaning: "A gentle roll over a muscle or tendon." },
      { term: "Pause", meaning: "A rest period built into the sequence." },
      { term: "Reset claim", meaning: "A claim that the nervous system is rebooted, which is unproven." }
    ],
    whenToUse: [
      "Someone who wants a gentle, relaxing option after screening.",
      "Alongside, not instead of, exercise and medical care."
    ],
    whenNot: [
      "Red flags, progressive weakness, severe headache or serious illness.",
      "Skin damage in the area.",
      "Using it to replace medical care."
    ],
    steps: [
      { title: "Screen", detail: "Check for red flags and understand the patient's goal." },
      { title: "Explain the limited evidence", detail: "Be honest that evidence is limited." },
      { title: "Agree a functional measure", detail: "Choose something like walking tolerance or reach." },
      { title: "Apply light moves with pauses", detail: "Use gentle rolling contacts as trained." },
      { title: "Retest", detail: "Check the chosen measure." },
      { title: "Keep evidence-based care going", detail: "Continue exercise and medical follow-up." }
    ],
    dose: "No dose is proven. Keep sessions light and brief, and judge benefit by function.",
    example: {
      patient: "Linda, 58, librarian with mild neck stiffness, asks for gentle bodywork.",
      assessment: "No red flags; neck rotation slightly limited.",
      treatment: "She receives a gentle session and also learns neck exercises.",
      reassess: "She feels relaxed but rotation is unchanged. The practitioner explains that relaxation is not proof of functional change, and focuses on exercises."
    },
    mistakes: [
      "Claiming a nervous-system reset.",
      "Skipping screening.",
      "Using it instead of needed treatment."
    ],
    selfTest: [
      { q: "Is the pause proven to reset the nervous system?", a: "No." },
      { q: "What should you measure?", a: "A real functional outcome." }
    ],
    recap: "Gentle and pleasant, but judge it by function, not calm.",
    evidence: "A systematic review found few rigorous studies, so strong claims are not justified."
  },
  {
    slug: "visceral-manipulation",
    oneLine: "Gentle hand pressure on the abdomen to affect the movement of organs and their connective tissue, with limited evidence.",
    whatItIs: "Visceral manipulation uses light, slow hand contact on the abdomen and organs' connective tissue with the aim of improving mobility and reducing pain. Its proposed mechanisms are not proven, and the organs are not physically 'moved' in the way sometimes claimed.",
    analogy: "Like softly pressing on a sealed bag of fluid: you can feel tension in the wall, but that does not prove you reshaped what is inside.",
    coreIdeas: [
      "Use very gentle pressure and watch for patient response.",
      "Screen first: abdominal pain can signal serious illness.",
      "Be honest about the limits of evidence."
    ],
    terms: [
      { term: "Viscera", meaning: "The internal organs, such as intestines and liver." },
      { term: "Acute abdomen", meaning: "Sudden severe abdominal pain needing urgent medical review." },
      { term: "Fascial attachment", meaning: "Connective tissue linking organs to the body wall." },
      { term: "Palpation reliability", meaning: "How consistently different examiners feel the same finding. For visceral work, it is poor." }
    ],
    whenToUse: [
      "Trained practitioners offering gentle abdominal touch for comfort when medically cleared.",
      "As an adjunct, never as the main treatment for a disease."
    ],
    whenNot: [
      "Acute abdominal pain, fever, vomiting, bleeding, pregnancy complications or unexplained weight loss.",
      "Aneurysm, recent abdominal surgery, hernia or active infection.",
      "When a diagnosis has not been made for persistent abdominal symptoms."
    ],
    steps: [
      { title: "Take a careful history", detail: "Ask about pain, bowel, bladder and general health." },
      { title: "Screen for red flags", detail: "Refer for medical review if concerned." },
      { title: "Explain and gain consent", detail: "Describe the gentle touch and the limited evidence." },
      { title: "Apply gentle contact", detail: "Use light, slow pressure as trained." },
      { title: "Monitor", detail: "Stop if pain or discomfort increases." },
      { title: "Review", detail: "Judge by comfort and function, not by claims about organs." }
    ],
    dose: "No proven dose. Use short, light sessions and stop if symptoms rise.",
    example: {
      patient: "Rosa, 40, tight feeling in the abdomen after surgery months ago, medically cleared.",
      assessment: "No red flags; scar area feels tight.",
      treatment: "Gentle contact and slow stretches around the scar and abdominal wall, plus scar mobilization advice.",
      reassess: "She feels less pulling when standing tall. The practitioner records the response without claiming organ repositioning."
    },
    mistakes: [
      "Treating abdominal pain without a diagnosis.",
      "Claiming organs are repositioned.",
      "Using pressure that hurts."
    ],
    selfTest: [
      { q: "What must you screen for?", a: "Red flags and an acute abdomen." },
      { q: "Can you prove organs moved?", a: "No." }
    ],
    recap: "Screen carefully, touch gently, claim modestly.",
    evidence: "Evidence is limited, with small studies and poor reliability of the findings. Claims about organ mobility are not supported."
  },
  {
    slug: "craniosacral-therapy",
    oneLine: "Extremely light touch on the head, spine and sacrum, with claims about subtle rhythms that are not supported by evidence.",
    whatItIs: "Craniosacral therapy uses very light touch (often described as about the weight of a few coins) on the skull, spine and sacrum. Practitioners say they feel a 'craniosacral rhythm', but studies have not shown that examiners agree on it or that it exists as described.",
    analogy: "Like trying to tune a radio by touch: the practitioner senses something, but independent checks do not agree on what is being sensed.",
    coreIdeas: [
      "Safety first: head and neck conditions need proper screening.",
      "Relaxation may be real, but claims about moving skull bones or correcting rhythms are unsupported.",
      "Be honest with patients about the evidence."
    ],
    terms: [
      { term: "Craniosacral rhythm", meaning: "A proposed slow rhythm in the head and spine fluids, not confirmed by research." },
      { term: "Sacrum", meaning: "The triangular bone at the base of the spine." },
      { term: "Inter-examiner reliability", meaning: "How well different practitioners agree. For this rhythm, it is poor." },
      { term: "Placebo effect", meaning: "Improvement due to expectation and care context." }
    ],
    whenToUse: [
      "People who want a gentle, relaxing hands-on session after screening.",
      "Only as an adjunct, and with honest explanation."
    ],
    whenNot: [
      "Recent head injury, bleeding in the brain, aneurysm or raised pressure in the skull.",
      "Severe headache of sudden onset, neurological signs or unexplained serious symptoms.",
      "Instead of medical investigation."
    ],
    steps: [
      { title: "Screen and explain", detail: "Check for red flags and explain limited evidence." },
      { title: "Set goals", detail: "Agree on a measurable goal such as sleep, tension or comfort." },
      { title: "Settle the patient", detail: "Comfortable position, quiet space." },
      { title: "Apply very light contact", detail: "Gentle hand contact as trained." },
      { title: "Monitor the patient", detail: "Stop if symptoms worsen." },
      { title: "Review outcomes", detail: "Compare with the original goal and follow with evidence-based care if needed." }
    ],
    dose: "No proven dose. Sessions are typically gentle and calm; judge benefit by the patient's goals.",
    example: {
      patient: "Ingrid, 36, tension headaches and stress, medically assessed with no serious cause found.",
      assessment: "Tight neck and shoulders, no red flags.",
      treatment: "A gentle session as an optional relaxation approach, plus stress and posture advice.",
      reassess: "She feels calmer. The practitioner explains that calm is real but does not prove the rhythm theory."
    },
    mistakes: [
      "Claiming skull bones are moved.",
      "Ignoring head injury or sudden severe headache.",
      "Dropping evidence-based care."
    ],
    selfTest: [
      { q: "Is the craniosacral rhythm confirmed?", a: "No." },
      { q: "A sudden severe headache: what do you do?", a: "Refer urgently, do not treat." }
    ],
    recap: "Gentle and safe if screened, but claims must stay modest.",
    evidence: "Reviews find weak evidence and quality problems. Reported benefits may be due to relaxation and expectation."
  }
];
