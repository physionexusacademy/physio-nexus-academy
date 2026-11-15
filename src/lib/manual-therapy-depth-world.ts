import type { TechniqueDepth } from "./manual-therapy-depth-types.ts";

/**
 * The worldwide approaches. Each is described as practised and judged by what is known: where the evidence is weak the depth says so and teaches how
 * to test the claim (the "appraise" demonstration) instead of drawing a mechanism that has not been shown to exist.
 */
export const DEPTH_W: Record<string, TechniqueDepth> = {
  "paris-approach": {
    demo: "glide",
    why: "The Paris tradition is a way of reasoning more than a single technique: a full orthopedic examination (history, active and passive movement, accessory movement, palpation, neurological and special tests) decides whether a joint-specific technique is justified, which one, and how hard. Treatment is a trial: apply it, retest the same comparable sign and keep only what changes it. That discipline is the transferable value; branded protocols do not carry separate proof of superiority.",
    choose: [
      "Use the framework whenever a joint restriction, not pain alone, is the reason for considering mobilization.",
      "Prefer an active or education-led plan when the examination shows no joint-specific restriction or when symptoms are highly irritable.",
      "Choose the technique (graded oscillation, sustained stretch or a thrust) from irritability and end-feel, not from the name of the school.",
      "Combine every joint technique with active movement and loading so the new range is used.",
    ],
    parameters: [
      ["Examination first", "History, active and passive range, accessory movement, palpation, a neurological screen and a comparable sign before any technique"],
      ["Trial dose", "A short bout of a graded technique, then retest the comparable sign; repeat only if it improved"],
      ["Grade", "Chosen by irritability: gentle oscillations when irritable, sustained or end-range stretch when stiff and not irritable"],
      ["Follow-up", "Active range, motor control and loading in the same session"],
    ],
    progress: "Move from the passive technique to active range, then loaded function. Stop passive treatment as soon as the comparable sign no longer changes with it, and review the diagnosis if two or three trials give no gain, rather than repeating the same technique harder.",
    measure: [
      "The comparable sign (a painful movement or a range) measured the same way before and after each trial",
      "Segmental findings re-palpated, remembering that their reliability between examiners is limited",
      "Function: the patient's own task, retested at the end of the session",
    ],
    evidence: "The framework is a reasoning approach, not a tested treatment. Joint mobilization can help selected musculoskeletal problems in the short term, but that evidence belongs to mobilization in general and is not proof for every Paris-branded protocol.",
    pitfalls: [
      "Letting the name of a school choose the technique instead of the examination.",
      "Treating a palpated stiffness as the cause without testing whether treating it changes the patient's sign.",
      "Skipping the retest, so habit is mistaken for a treatment effect.",
      "Stopping at the passive technique and sending the patient away without active work.",
    ],
    screen: [
      "Instability, suspected fracture, infection or unexplained serious symptoms",
      "Significant or progressive neurological deficit",
    ],
  },
  "mckenzie-mdt": {
    demo: "response",
    why: "Mechanical Diagnosis and Therapy sorts patients by how symptoms respond to repeated movements or sustained positions. Centralisation (symptoms retreating toward the spine) or a directional preference points to a movement the patient can use as treatment; peripheralisation (symptoms spreading away) says that direction is wrong. Care is mostly active and patient-led, with education to prevent recurrence. The disc-displacement explanation is a model, not a proven mechanism; the clinical value is the structured response testing and the self-management it produces.",
    choose: [
      "Use it for spinal pain, especially with leg or arm symptoms, when movement changes the symptoms in a repeatable way.",
      "Prefer another assessment when no movement or position changes the symptom pattern, or when pain is constant and unaffected by movement.",
      "Choose it when the patient can understand and carry out frequent self-treatment between visits.",
      "Add clinician overpressure only when the patient's own movement stops short of the response.",
    ],
    parameters: [
      ["Test", "Repeated movements (commonly 10-15 repetitions) or sustained positions in one direction, noting where symptoms are during and after"],
      ["Response", "Symptoms retreating toward the spine are a good sign even if the back is briefly worse; spreading or worsening is a reason to stop that direction"],
      ["Dose", "Frequent, short self-treatment bouts through the day, often hourly at first, reduced as symptoms settle"],
      ["Review", "Re-check the same movement and the symptom location at each visit before changing direction"],
    ],
    progress: "Start with the direction that centralises or reduces symptoms, add overpressure or a progression only if the response stalls, then move to restoring function and to prevention exercises. As symptoms resolve, reduce the frequency and teach the patient to repeat the movement at the first sign of a recurrence.",
    measure: [
      "Symptom location (centralising, peripheralising or unchanged) recorded before, during and after each test",
      "Pain intensity and range in the tested direction, measured the same way each visit",
      "Function: sitting, walking or lifting tolerance, which shows whether the response carries over",
    ],
    evidence: "MDT has a substantial research base as an assessment and management system, and some trials support it in subgroups, especially patients who centralise. Results depend on the condition and the subgroup, so it is not established that any single exercise fixes every disc problem.",
    pitfalls: [
      "Testing too few repetitions or only one direction, then calling the test negative.",
      "Ignoring peripheralisation and continuing a direction that spreads the symptoms.",
      "Treating the method as a fixed exercise recipe instead of a response-driven process.",
      "Taking over the movement for the patient instead of building self-management.",
    ],
    screen: [
      "Progressive weakness, bladder or bowel change, or saddle symptoms (urgent medical assessment)",
      "Major trauma, suspected fracture, infection, or unexplained pain with a cancer history",
    ],
  },
  "mennell-joint-play": {
    demo: "glide",
    why: "Mennell described joint play: small accessory movements that cannot be produced by voluntary muscle action but are needed for full, pain-free movement. Testing them with distraction and glides asks whether a restriction lies inside the joint rather than in muscle or nerve. The concept is influential, but modern studies show that examiners often disagree on accessory-movement findings and that a palpated restriction does not reliably identify the pathology.",
    choose: [
      "Use it to examine whether a joint's accessory glide or distraction is reduced or painful when active and passive movement point to that joint.",
      "Compare with the other side and ask whether the finding reproduces the patient's pain; a finding that is symptom-free is of little value.",
      "Prefer functional movement tests and symptom response when the joint-play finding would not change the plan.",
      "Do not use it as proof that an exact structure is damaged.",
    ],
    parameters: [
      ["Position", "The joint in its loose-packed (resting) position, the patient relaxed and the segment supported"],
      ["Movement", "Small distraction and glides in each direction, a few millimetres, compared with the other side"],
      ["Record", "Normal, reduced or excessive, whether it reproduces the patient's pain, and the end-feel"],
      ["Repeat", "Each direction more than once, to check consistency before drawing a conclusion"],
    ],
    progress: "Use the finding to decide whether a joint technique is worth trying, then re-test the limited movement after treatment. As the restriction resolves, move to active and loaded work so the range is used, and drop the passive testing from the routine.",
    measure: [
      "Accessory glide and distraction compared with the other side, with the pain response recorded",
      "The patient's limiting movement before and after, to see whether the joint-play finding mattered",
      "Function: a daily task that was limited, retested after treatment",
    ],
    evidence: "Joint play is a historical concept that remains the basis of accessory-movement assessment. The reliability of palpated findings is limited, so an abnormal result should be read together with symptoms and function and never as a diagnosis on its own.",
    pitfalls: [
      "Treating a side-to-side difference as pathology when many people are naturally asymmetrical.",
      "Testing a painful joint hard enough to provoke guarding and then misreading the guarding as stiffness.",
      "Relying on one examiner's feel without a second finding that agrees.",
    ],
    screen: [
      "Acute fracture, dislocation or significant instability",
      "Active inflammatory joint disease or infection",
    ],
  },
  "fascial-distortion-model": {
    demo: "appraise",
    why: "The model proposes that specific fascial distortions cause pain and that the patient's gestures and words when describing it reveal which type is present; a matching manual technique is then chosen. The distortions have not been shown to exist or to be identified reliably, and trials do not show a clinically meaningful advantage over alternatives. It is useful here as a case study in how to appraise a model: separate the practitioner's hypothesis from demonstrated physiology.",
    choose: [
      "Treat it as a model to appraise, not as a first-line treatment.",
      "If a patient asks for it, exclude red flags first and keep an evidence-based active plan in place as well.",
      "Prefer methods with better support when the same complaint can be managed with exercise and education.",
      "Judge the technique by whether the patient's own measured sign changes, not by the model's explanation.",
    ],
    parameters: [
      ["Selection", "The patient's gesture and descriptive words are used to choose a distortion type (a hypothesis, not a diagnosis)"],
      ["Contact", "Firm, focal manual pressure for a short period, often described as uncomfortable"],
      ["Reassessment", "Pain and range retested straight away; the plan changes if there is no gain"],
    ],
    progress: "If used at all, combine it with active care and stop after two or three sessions without a measurable gain. Move the patient toward exercise, education and load management as soon as the symptom allows, and do not let the technique become the whole plan.",
    measure: [
      "Pain and range on the patient's own limiting movement, before and after, on the same scale",
      "Function at the task that brought the patient in, retested after treatment",
      "Next-day response, because firm pressure can leave soreness or bruising",
    ],
    evidence: "A July 2026 review of 14 studies (644 participants) found no clinically meaningful benefit over alternative interventions despite a modest pooled statistical difference. The proposed distortions themselves have not been shown to exist.",
    pitfalls: [
      "Accepting the model's explanation because the technique relieved pain for a few minutes.",
      "Using intense pressure on tissue that is injured, bruised or anticoagulated.",
      "Letting the gesture replace a proper examination.",
      "Telling a patient that a fascial distortion has been found and fixed.",
    ],
    screen: [
      "Acute tissue injury, bleeding risk, suspected thrombosis or skin infection",
      "Cancer-related tissue concerns or impaired sensation",
    ],
  },
  "balanced-ligamentous-tension": {
    demo: "position",
    why: "The clinician holds a joint or region in the position that balances the tension in surrounding ligaments and fascia, then waits for a change in the tissue response; the vocabulary is disengagement, exaggeration of ease and balance. The proposed correction of ligamentous tension has not been demonstrated. The effect is more plausibly relaxation, attention and a gentle contact the patient finds safe, which makes it a very low-force option for an irritable region.",
    choose: [
      "Use it only after training and supervision, when a gentle hands-on method is wanted for an irritable region.",
      "Prefer a graded active plan when the patient can move without provoking symptoms.",
      "Do not use it as the only treatment for a problem with a structural cause that needs load, immobilisation or surgery.",
    ],
    parameters: [
      ["Position", "The region supported and moved slowly to the position of greatest comfort, found by gentle exploration"],
      ["Hold", "Commonly 1-3 minutes, or until the clinician and the patient notice a change in tension or comfort"],
      ["Force", "Minimal: the contact guides the region and does not push it"],
      ["Review", "Retest the limiting movement and the symptom afterwards"],
    ],
    progress: "Follow with active movement as soon as comfort allows, then graded loading. If two or three sessions bring no measurable change, stop and choose another method rather than extending the hold.",
    measure: [
      "Pain with the limiting movement, before and after, on the same scale",
      "Range at a fixed measurement point, measured the same way each time",
      "Patient-reported comfort and ease of movement afterwards",
    ],
    evidence: "Osteopathic texts describe BLT, but high-quality clinical comparisons specific to it are limited. Theoretical explanations should not be presented as established tissue corrections.",
    pitfalls: [
      "Explaining the effect to the patient as a correction of a ligament that has not been shown to be out of balance.",
      "Holding for the clock instead of for a change in tissue or comfort.",
      "Using it where an unstable or acutely injured structure needs protection, not manual contact.",
    ],
    screen: [
      "Suspected fracture, dislocation or major instability",
      "Active infection or unexplained neurological symptoms",
    ],
  },
  "spencer-shoulder-sequence": {
    demo: "glide",
    why: "The Spencer sequence is a fixed order of passive and assisted shoulder movements, commonly taught as seven, used in the osteopathic tradition to improve mobility and ease symptoms. The movements put the glenohumeral joint and its surrounding tissues through rhythmic, graded range in several planes. The likely effect is short-term mobility and symptom relief from graded movement and attention, as with other articulatory methods, rather than a correction of a specific lesion.",
    choose: [
      "Use it when a stiff, painful shoulder needs gentle, graded passive movement and the examination excludes instability or a tear that needs protection.",
      "Prefer targeted treatment when the examination points to a specific structure.",
      "Adapt the order and range to the patient's tolerance; the sequence is a framework, not a fixed prescription.",
    ],
    parameters: [
      ["Sequence", "A fixed order of gentle movements through the shoulder's range, adapted to the patient's tolerance"],
      ["Position", "Side-lying with the trunk and scapula stabilised, the arm supported"],
      ["Repetitions", "A few smooth repetitions of each movement, within comfort and short of provoking pain"],
      ["Review", "Active range and pain on the provoking movement after the sequence"],
    ],
    progress: "Progress from assisted to active movement through the new range, then to loaded and overhead function. Reduce the passive sequence as soon as the patient can move the arm actively through most of the range.",
    measure: [
      "Active and passive range of elevation and rotation, measured the same way before and after",
      "Pain on the painful arc or reach, on the same scale",
      "Function: a task the patient finds hard, such as reaching overhead or behind the back",
    ],
    evidence: "The Spencer sequence is a documented osteopathic approach, but high-quality trials that isolate this exact sequence are sparse. General evidence for shoulder mobility work cannot be treated as technique-specific proof.",
    pitfalls: [
      "Moving a shoulder with an unrecognised cuff tear or instability through forceful end range.",
      "Applying the sequence rigidly regardless of irritability.",
      "Stopping at passive movement without handing the range back to the patient actively.",
    ],
    screen: [
      "Recent dislocation or fracture, acute cuff tear or marked instability",
      "Unexplained severe weakness or neurological signs",
    ],
  },
  "still-technique": {
    demo: "position",
    why: "Still technique is described as moving a joint into a position of ease, adding a compressive or traction component, and then guiding it through the restricted direction in one smooth motion. The explanation offered, release of a facilitated segment, is theory. The value for a modern clinician is to recognise it as a gentle positional and mobilising sequence, and to hold it to the same standards of examination, screening and retesting as any technique. In the neck the screening for vascular and neurological risk is especially important.",
    choose: [
      "Use it only when you are trained in it and the examination supports a joint-specific restriction that is not irritable.",
      "Prefer an established, better-supported method (graded mobilization, active exercise) when it would do the same job.",
      "Treat the neck with extra caution: complete the vascular and neurological screen before any positional technique.",
    ],
    parameters: [
      ["Position", "Positioned to the barrier or the position of ease, found by slow exploration"],
      ["Component", "A light compressive or traction input, held steady, never forced"],
      ["Guided movement", "A smooth, unhurried movement through the restricted direction, without a thrust"],
      ["Review", "Retest the comparable sign and the neurological screen straight afterwards"],
    ],
    progress: "Follow with active movement and loading. If the comparable sign does not change, do not repeat the technique with more force: re-examine and choose another method.",
    measure: [
      "The comparable sign (range or painful movement) before and after",
      "Neurological and vascular symptoms re-checked after any cervical technique",
      "Function: the patient's own task, retested at the end",
    ],
    evidence: "Still technique is established as a named historical osteopathic method, but clinical outcome claims specific to the maneuver are not robustly established.",
    pitfalls: [
      "Skipping the vascular and neurological screen because the technique feels gentle.",
      "Forcing the final movement when the barrier is protective.",
      "Claiming a mechanism (such as releasing a facilitated segment) as fact.",
    ],
    screen: [
      "Vascular red flags, new neurological deficit or suspected myelopathy",
      "Cervical instability, infection or recent trauma",
    ],
  },
  "osteopathic-articulatory": {
    demo: "glide",
    why: "Articulatory techniques move a joint repeatedly and rhythmically through its available range, gradually increasing amplitude as tolerated, instead of using one high-velocity thrust. The effect is probably a mix of short-term mobility, reduced guarding and symptom relief from graded, repeated movement, similar to other mobilization methods. It is best used as one option within a plan that includes exercise and education.",
    choose: [
      "Use it when a joint is stiff and the patient prefers or needs a graded, non-thrust technique.",
      "Prefer thrust or sustained techniques only when the examination calls for them and screening is clear.",
      "Choose it for patients who are nervous about manipulation, because the amplitude is always under their control.",
    ],
    parameters: [
      ["Rhythm", "Smooth, repeated movements within comfort, increasing in amplitude as the tissue allows"],
      ["Duration", "Commonly 30 seconds to a few minutes per joint, reassessed rather than continued by the clock"],
      ["Direction", "Along the restricted direction, with attention to the patient's pain response"],
      ["Follow-up", "Active movement through the new range before the patient leaves"],
    ],
    progress: "Progress the amplitude within comfort, then move to active range and loaded movement. Reduce the passive work as soon as the patient can maintain the range alone.",
    measure: [
      "Range of the treated joint at a fixed measurement point, before and after",
      "Pain on the limiting movement, on the same scale",
      "Function: a task that the stiffness limited, retested after treatment",
    ],
    evidence: "Research on manual therapy more broadly may support short-term symptom relief for some conditions, but it does not prove that this named osteopathic family is superior to other mobilization.",
    pitfalls: [
      "Increasing amplitude into pain because the patient is polite.",
      "Treating a joint that is stiff as a protective response to an injury that needs rest.",
      "Leaving the range unused by ending the session passively.",
    ],
    screen: [
      "Instability, suspected fracture, infection or acute inflammatory pathology",
      "Severe or progressive neurological findings",
    ],
  },
  "osteopathic-lymphatic-pump": {
    demo: "fluid",
    why: "Lymphatic pump techniques apply rhythmic compression, for example over the chest wall or the feet, with the aim of moving fluid. The physiological rationale is plausible, because pressure changes can move lymph, but effects on immune outcomes or on infections and other medical conditions have not been established. It is not a substitute for compression, exercise and medical care for oedema, infection or systemic illness.",
    choose: [
      "Use it only as an optional adjunct, within the limits of your training, and never in place of medical management.",
      "Prefer compression, exercise and manual lymphatic drainage when the problem is limb oedema.",
      "Do not use it to try to treat infections or illness: the evidence does not support that claim.",
    ],
    parameters: [
      ["Rhythm", "A slow, steady, repeated compression and release, comfortable for the patient"],
      ["Pressure", "Light to moderate, never forceful, adapted to the chest wall or the foot"],
      ["Duration", "Commonly a few minutes, reassessed rather than continued by the clock"],
      ["Position", "Supine or seated, with the patient relaxed and breathing normally"],
    ],
    progress: "Combine with breathing and movement, and rely on compression, exercise and skin care for anything that needs to last. Stop the technique if the patient becomes breathless, dizzy or in pain.",
    measure: [
      "Limb circumference or symptoms of heaviness, if the aim is oedema",
      "Breathing comfort and chest wall movement, if applied over the thorax",
      "Skin condition and any pain during or after the technique",
    ],
    evidence: "Lymphatic techniques are described in osteopathic literature, but effects on immune outcomes or on broad medical conditions should not be claimed without strong condition-specific evidence.",
    pitfalls: [
      "Promising a benefit for infection or immunity.",
      "Using it over a chest, abdomen or limb with a condition that needs medical review first.",
      "Replacing compression and exercise with the technique for lymphoedema.",
    ],
    screen: [
      "Suspected DVT, unstable heart failure or other circulatory instability",
      "Acute fracture, necrotizing infection or other systemic instability",
    ],
  },
  "rolfing-structural-integration": {
    demo: "appraise",
    why: "Structural integration is delivered as a series of sessions combining slow, deep soft-tissue contact with attention to posture, balance and movement. Clients often report feeling taller, freer and more aware of their body, and those experiences are real. The claim that the method permanently remodels fascia or realigns the body has not been demonstrated, and the contact and the movement education are better treated as one package whose benefit has to be measured, not assumed.",
    choose: [
      "Treat it as an optional, client-led bodywork choice, and make sure any pain complaint has been examined first.",
      "Prefer active care and graded loading when the aim is to change a specific musculoskeletal problem.",
      "Be honest with the client about what is known: comfort and awareness are plausible benefits, permanent alignment correction is not shown.",
    ],
    parameters: [
      ["Format", "A series of sessions, each with soft-tissue work and movement awareness, as described by the tradition"],
      ["Pressure", "Slow and sustained, from moderate to deep, adjusted to tolerance and never to bruising"],
      ["Movement", "Guided awareness of posture, breathing and weight-bearing during and after contact"],
      ["Review", "Pain, movement quality and the client's own goals reviewed across the series"],
    ],
    progress: "Link the work to movement, exercise and daily habits so the changes can be maintained, and stop or change the plan if there is no measurable gain by the middle of the series.",
    measure: [
      "Pain and range on the client's own limiting movement, at the start, midpoint and end of the series",
      "Movement quality and posture with a repeatable photograph or task, not a one-off impression",
      "The client's goal and satisfaction, recorded alongside the measured change",
    ],
    evidence: "There is limited high-quality, condition-specific evidence that this branded structural integration method outperforms established active care or permanently alters body alignment.",
    pitfalls: [
      "Promising lasting alignment correction.",
      "Using deep pressure on fragile or injured tissue.",
      "Mistaking a pleasant session for proof that the structure changed.",
    ],
    screen: [
      "Fragile tissue, acute injury, anticoagulant use or infection",
      "Unexplained neurological symptoms",
    ],
  },
  "bowen-technique": {
    demo: "appraise",
    why: "The Bowen technique uses gentle rolling moves over muscle, tendon and fascia, interspersed with pauses in which the therapist leaves the room or steps away. Claims that it resets the nervous system or the whole body are not supported by credible clinical evidence. Clients may find the light touch and the pause relaxing, which is a legitimate experience, but the method has to be judged on measured outcomes like any other.",
    choose: [
      "Treat it as an optional, low-force approach for a client who values it, after the problem has been properly assessed.",
      "Prefer rehabilitation and proven treatment pathways for injuries, neurological disease or significant pain.",
      "Never delay referral for red-flag symptoms because the client is relaxed by the session.",
    ],
    parameters: [
      ["Moves", "Gentle rolling moves over muscle, tendon or fascia at chosen points"],
      ["Pauses", "Breaks of a few minutes between sets of moves, as the tradition describes"],
      ["Pressure", "Light, never forceful"],
      ["Review", "Pain, range and the client's own goal reviewed at each visit"],
    ],
    progress: "Combine with graded movement and exercise, and stop if there is no measurable change after a few sessions. Keep the plan anchored to the client's goal and to evidence-based care.",
    measure: [
      "Pain and range on the client's own limiting movement, before and after, on the same scale",
      "Function at a task that matters to the client",
      "Whether any change lasts to the next session, not only the same day",
    ],
    evidence: "A systematic review identified very few rigorous studies, so convincing condition-specific effectiveness claims are not warranted.",
    pitfalls: [
      "Claiming a whole-body reset of the nervous system, which has not been shown.",
      "Substituting the technique for rehabilitation or medical assessment.",
      "Treating a symptom that needed examination.",
    ],
    screen: [
      "Red-flag symptoms, which need referral, not bodywork",
      "Significant injury or neurological disease that needs established care",
    ],
  },
  "visceral-manipulation": {
    demo: "appraise",
    why: "Visceral manipulation proposes that restrictions in the mobility of internal organs and their fascia cause symptoms elsewhere, and that gentle manual techniques can restore it. The idea is physiologically speculative, and attempts to test it have produced poor-quality evidence. The most important clinical point is safety: abdominal and pelvic symptoms can come from serious medical causes that must be excluded before any manual approach, and no manual technique should replace that.",
    choose: [
      "Approach it as a method to study critically, not as a treatment for internal disease.",
      "Use medical investigation and established pelvic, gastrointestinal or urological care first when symptoms point to the organs.",
      "If a patient chooses it, confirm that serious causes have been excluded and that the plan does not depend on it.",
    ],
    parameters: [
      ["Screening", "Red flags and medical causes excluded before any contact"],
      ["Contact", "Gentle manual contact over the abdomen or pelvis, as described by the tradition"],
      ["Pressure", "Light and slow, stopping at any pain or distress"],
      ["Review", "Symptoms and function reviewed, with referral if anything changes or worsens"],
    ],
    progress: "Do not escalate. If symptoms persist, return to medical assessment and established care rather than repeating the technique.",
    measure: [
      "The specific symptom the patient came with, scored before and after on the same scale",
      "Function and quality of life, recorded alongside any symptom change",
      "Any new symptom, such as fever, bleeding or worsening pain, which means stop and refer",
    ],
    evidence: "A systematic review of randomized trials concluded that the evidence for the efficacy of visceral fascial treatment is poor, and several of the included studies had a high risk of bias.",
    pitfalls: [
      "Treating abdominal symptoms before a medical cause has been excluded.",
      "Promising an effect on organ function.",
      "Delaying referral because the session felt helpful.",
    ],
    screen: [
      "Severe abdominal pain, gastrointestinal bleeding, fever, a suspected pregnancy complication or an acute surgical abdomen (urgent medical care)",
      "Any unexplained abdominal or pelvic symptom that has not been medically assessed",
    ],
  },
  "craniosacral-therapy": {
    demo: "appraise",
    why: "Craniosacral therapy uses very light touch on the head, spine and sacrum, linked to a proposed rhythm of cerebrospinal fluid that the therapist can feel and influence. Independent examiners do not agree on what they feel, and the rhythm has not been shown to be detectable in a reproducible way. Clients often find the session deeply relaxing, but relaxation is not evidence of the proposed mechanism, and the method has to be judged on its effects like any other.",
    choose: [
      "Use it, if at all, as an optional relaxation-oriented approach after the problem has been assessed.",
      "Prefer proven treatments and evidence-based pain management for headache, neck pain and other complaints.",
      "Never use it for new sudden severe headache, neurological symptoms, signs of infection or after a head injury.",
    ],
    parameters: [
      ["Contact", "Very light touch on the head, spine or sacrum, as described by the tradition"],
      ["Duration", "Often 30 to 60 minutes of quiet contact in a session"],
      ["Aim", "Relaxation and comfort; no reproducibly measurable rhythm is claimed here"],
      ["Review", "Symptoms and function reviewed, with referral if anything changes or worsens"],
    ],
    progress: "Do not treat relaxation as proof of the mechanism. If there is no measurable change after a few sessions, return to evidence-based care for the original complaint.",
    measure: [
      "The specific complaint (for example headache frequency or neck pain) scored before and after on the same scale",
      "Function, sleep or stress level, recorded as separate outcomes from the symptom",
      "Any new neurological symptom, which means stop and refer",
    ],
    evidence: "A systematic review and meta-analysis of 15 randomized trials in qualitative synthesis and seven in meta-analysis reported no significant or clinically relevant benefit for the assessed conditions.",
    pitfalls: [
      "Presenting the proposed rhythm as a verified clinical measurement.",
      "Using it for a headache or neurological symptom that needed assessment.",
      "Promising broad benefits for conditions that have not been tested.",
    ],
    screen: [
      "New sudden severe headache, neurological symptoms or signs of infection (urgent medical assessment)",
      "Head injury, which needs medical assessment, not bodywork",
    ],
  },
};
