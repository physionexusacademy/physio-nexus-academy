export type ManualApplicationGuide = {
  patientPosition: string[];
  therapistPosition: string[];
  handPlacement: string[];
  forceDirection: string[];
  applicationSteps: string[];
  expectedResponse: string[];
  stopCriteria: string[];
  commonMistakes: string[];
  clinicalExample: string[];
};

export const manualApplicationGuides: Record<string, ManualApplicationGuide> = {
  "maitland-joint-mobilization": {
    patientPosition: [
      "Place the patient in a relaxed position where the target joint is fully supported and the painful muscles do not need to hold the limb.",
      "Expose only the region you need. The patient should feel safe, warm and able to tell you immediately if symptoms change.",
      "Start in the joint position that produces the least guarding. In a highly irritable patient, do not force the joint into end range before you begin."
    ],
    therapistPosition: [
      "Stand close to the treatment table so your body weight, not only your hands, controls the movement.",
      "Keep your shoulders relaxed, elbows soft and spine neutral. A stable therapist position makes the mobilization smoother and safer.",
      "Position yourself in line with the intended accessory glide so the force travels through the joint in a clean direction."
    ],
    handPlacement: [
      "One hand stabilizes the proximal bone or segment. The other hand contacts the moving bone as close to the joint line as is comfortable and anatomically safe.",
      "Use a broad contact whenever possible. Avoid pressing directly on sensitive nerves, vessels, bony prominences or healing tissue.",
      "Before mobilizing, gently take up skin slack so your hands move the joint rather than simply rubbing over the skin."
    ],
    forceDirection: [
      "Apply the accessory glide in the direction selected from examination and the comparable sign.",
      "Grades I and II use small-amplitude oscillation in the early to mid range when pain and irritability dominate.",
      "Grades III and IV move further into resistance when stiffness is the main limitation and the joint is safe to mobilize.",
      "The force should be rhythmic and controlled. It should never feel like a sudden uncontrolled push."
    ],
    applicationSteps: [
      "1. Record the comparable sign first: for example shoulder abduction pain at 90 degrees, knee flexion limit, or painful cervical rotation.",
      "2. Screen red flags, instability, fracture risk and neurological concerns before treatment.",
      "3. Position and stabilize the joint. Find the direction of accessory movement you want to test.",
      "4. Begin with a low grade. Ask the patient what they feel: local pressure is acceptable; sharp pain, distal symptoms or neurological change is not.",
      "5. If symptoms settle and the joint remains relaxed, continue the selected oscillation for the planned set.",
      "6. Rest, then immediately repeat the original comparable sign.",
      "7. If pain or movement clearly improves, you may repeat the technique or progress the grade. If nothing changes, change the direction, grade or treatment choice.",
      "8. Finish by using the gained movement actively: active ROM, motor control, strengthening or a meaningful functional task."
    ],
    expectedResponse: [
      "A useful response is less pain, easier movement, increased range, reduced guarding or improved function immediately after the set.",
      "Temporary mild local soreness can occur, but the patient should not leave with a major flare or new distal symptoms."
    ],
    stopCriteria: [
      "Stop if pain becomes sharp, severe or unfamiliar.",
      "Stop if symptoms spread distally, numbness/weakness develops, dizziness occurs, or the patient feels unsafe.",
      "Stop if repeated sets create progressively worse range or pain."
    ],
    commonMistakes: [
      "Choosing a grade because of the diagnosis instead of irritability and response.",
      "Moving the whole limb instead of producing a true accessory glide.",
      "Using fingers alone and creating jerky oscillations.",
      "Continuing because the joint 'feels stiff' even though the patient's comparable sign is worse.",
      "Failing to reassess after the technique."
    ],
    clinicalExample: [
      "Example: a patient with painful shoulder elevation has restricted posterior glide. Record active elevation, apply a comfortable posterior glide, then retest elevation. If elevation becomes easier, follow with active reaching and rotator-cuff loading so the manual gain becomes functional."
    ]
  },
  "kaltenborn-evjenth-mobilization": {
    patientPosition: [
      "Support the joint in its resting or treatment position so surrounding muscles are relaxed.",
      "Use belts, towels or the table when appropriate to reduce the amount of muscular effort needed from the therapist and patient."
    ],
    therapistPosition: [
      "Stand in the line of the treatment plane and keep your body close to the patient.",
      "Use a stable base of support so you can maintain a sustained force without shaking or changing direction."
    ],
    handPlacement: [
      "Stabilize one bone firmly but comfortably.",
      "Contact the moving bone close to the joint line using a broad surface of the hand or a treatment belt when appropriate.",
      "Keep pressure away from superficial nerves and painful bony points."
    ],
    forceDirection: [
      "Traction is applied perpendicular to the treatment plane.",
      "Gliding is applied parallel to the treatment plane.",
      "Grade I is a very small distraction that reduces compressive contact; Grade II takes up slack; Grade III stretches restricted periarticular tissue.",
      "Convex-concave rules can guide the first choice of glide, but the patient's response confirms whether the direction is useful."
    ],
    applicationSteps: [
      "1. Measure active movement, passive movement, end feel and joint play.",
      "2. Place the joint in a comfortable treatment position.",
      "3. Stabilize the proximal segment and gently remove slack.",
      "4. Apply Grade I or II first when pain is dominant; use Grade III only when stiffness is dominant and the joint is safe.",
      "5. Hold the translatoric force steadily without bouncing.",
      "6. Release slowly, allow a short rest, then reassess range and symptoms.",
      "7. Repeat only if the response is positive and then reinforce the improvement with active movement."
    ],
    expectedResponse: ["Reduced compression pain, improved joint play, easier osteokinematic movement, or a more comfortable end range."],
    stopCriteria: ["Sharp joint pain, apprehension, neurological symptoms, increasing guarding, or worsening movement after each attempt."],
    commonMistakes: [
      "Confusing osteokinematic motion with translatoric glide.",
      "Applying traction in the wrong direction relative to the treatment plane.",
      "Using Grade III in an acutely irritable joint.",
      "Holding the distal limb without adequately stabilizing the proximal bone."
    ],
    clinicalExample: ["Example: limited ankle dorsiflexion after a healed sprain may respond to a sustained talocrural glide. Recheck the weight-bearing lunge immediately, then train calf strength and squat/step mechanics."]
  },
  "mulligan-mobilization-with-movement": {
    patientPosition: [
      "Choose a position that reproduces the patient's meaningful painful movement safely: standing is often useful for weight-bearing problems; sitting or supine may be better when balance or irritability is an issue.",
      "The patient must be able to actively perform the target movement while you maintain the accessory glide."
    ],
    therapistPosition: [
      "Stand where you can maintain one consistent glide through the whole active movement.",
      "Use a belt when it improves leverage and frees your hands, but make sure the belt does not compress sensitive structures."
    ],
    handPlacement: [
      "Stabilize one segment and contact the other segment in the direction of the corrective accessory glide.",
      "Your contact should be firm enough to maintain the glide but not so strong that it blocks active movement."
    ],
    forceDirection: [
      "The direction is found clinically. Start with the most anatomically reasonable glide, then fine-tune angle and force until the active movement becomes clearly easier and preferably pain-free.",
      "The glide remains sustained from the beginning to the end of the active movement."
    ],
    applicationSteps: [
      "1. Measure the painful or restricted active movement.",
      "2. Apply a sustained accessory glide and ask the patient to repeat the movement.",
      "3. If the movement is still painful, adjust the glide direction, angle, amount of force, stabilization or patient position.",
      "4. When you find a pain-free/improved combination, keep the glide steady and repeat 6–10 slow repetitions.",
      "5. Add gentle end-range overpressure only if the movement is already pain-free and clinically appropriate.",
      "6. Remove the glide and immediately retest the original movement.",
      "7. Teach a self-MWM only when the patient can reproduce the correct direction safely."
    ],
    expectedResponse: ["Pain-free or clearly less painful movement during the technique and some carry-over after the glide is removed."],
    stopCriteria: ["Pain increases during the glide, symptoms peripheralize, the patient guards more, or there is no meaningful improvement after direction/angle correction."],
    commonMistakes: [
      "Accepting a painful MWM. The classic principle is pain-free application.",
      "Changing the glide direction during the movement.",
      "Using excessive force instead of searching for the correct angle.",
      "Not checking whether the benefit remains when the manual glide is removed."
    ],
    clinicalExample: ["Example: painful weight-bearing ankle dorsiflexion. Apply a sustained posterior talar glide while the patient lunges forward. If the lunge becomes easier, repeat and then train squats, calf raises and balance."]
  },
  "mulligan-snags-nags": {
    patientPosition: [
      "For cervical or thoracic work, sitting often allows the patient to actively reproduce the restricted movement while you guide the segment.",
      "Keep the patient upright and relaxed, with feet supported when possible."
    ],
    therapistPosition: [
      "Stand slightly behind or beside the patient so your hands can contact the selected vertebral level without forcing your own wrists.",
      "Your body should follow the plane of the facet glide rather than pushing straight into the spine."
    ],
    handPlacement: [
      "Use a comfortable contact over the articular pillar or spinous process depending on the technique and region.",
      "A towel or belt can be used for self-SNAG teaching when appropriate.",
      "Avoid pressure over the anterior neck, carotid region or painful superficial structures."
    ],
    forceDirection: [
      "NAGs use a gentle oscillatory glide in the relevant facet plane.",
      "SNAGs use a sustained segmental glide while the patient actively performs the restricted movement.",
      "The force should assist the movement rather than jam the joint or create pain."
    ],
    applicationSteps: [
      "1. Screen cervical neurological and vascular concerns before cervical manual therapy.",
      "2. Record the painful/restricted movement.",
      "3. Select the suspected level and apply a low-force glide in the facet plane.",
      "4. For a SNAG, maintain the glide while the patient slowly performs the movement.",
      "5. If pain persists, modify level, angle or force. Do not force through pain.",
      "6. Repeat only when the movement becomes easier or pain-free.",
      "7. Retest without your hands. If useful, teach a safe self-SNAG and pair it with active control/strength."
    ],
    expectedResponse: ["Immediate improvement in pain-free spinal motion or a meaningful functional task."],
    stopCriteria: ["Dizziness, visual disturbance, unusual headache, neurological change, nausea, drop attacks, severe pain or any symptom that raises vascular/neurological concern."],
    commonMistakes: [
      "Using a generic posterior push rather than following the facet plane.",
      "Ignoring vascular/neurological screening.",
      "Forcing a painful SNAG.",
      "Teaching a self-SNAG before the patient can reproduce the correct direction safely."
    ],
    clinicalExample: ["Example: limited pain-free cervical rotation. Apply a carefully selected SNAG while the patient turns. If rotation improves, reinforce with active rotation and cervical/scapular endurance work."]
  },
  "cyriax-deep-transverse-friction": {
    patientPosition: ["Position the patient so the target tendon, ligament or muscle is easy to palpate and the surrounding muscles are relaxed.", "Support the limb so the patient does not need to hold tension."],
    therapistPosition: ["Sit or stand close enough to keep your wrist neutral and your finger contact precise.", "Do not work from a long reach because this encourages excessive finger pressure."],
    handPlacement: ["Use one or two supported fingertips over the clinically relevant tissue.", "Move the tissue under your fingers transversely rather than sliding over the skin.", "For deeper structures, accuracy matters more than force."],
    forceDirection: ["Move perpendicular to the fiber direction of the target structure.", "The excursion is small and controlled, not a long massage stroke."],
    applicationSteps: ["1. Confirm that the tissue you plan to treat is actually relevant to the patient's pain.", "2. Place the tissue in the recommended test/treatment position.", "3. Establish a precise contact and begin with light transverse movement.", "4. Increase pressure only to a tolerable level.", "5. Use a short bout, then reassess tenderness and loading.", "6. Follow with graded tendon or muscle loading rather than ending treatment with friction alone."],
    expectedResponse: ["Temporary reduction in local pain/tenderness or easier loading."],
    stopCriteria: ["Sharp pain, bruising, skin irritation, increased swelling or worsening pain after treatment."],
    commonMistakes: ["Using friction on every tendon problem.", "Rubbing the skin instead of moving the underlying tissue.", "Applying prolonged aggressive pressure to an irritable tendon.", "Replacing progressive exercise with friction."],
    clinicalExample: ["Example: lateral elbow pain may receive a brief friction adjunct, but the main plan remains progressive wrist-extensor and grip loading."]
  },
  "muscle-energy-technique": {
    patientPosition: ["Place the patient so the restricted motion is taken gently toward its barrier without pain.", "The patient must be comfortable enough to perform a controlled contraction."],
    therapistPosition: ["Stand in a position where you can stabilize the body segment and match the patient's force without losing your posture.", "Your resistance should be stable, not overpowering."],
    handPlacement: ["One contact stabilizes the proximal segment; the other controls the distal segment or provides resistance in the chosen direction.", "Use broad comfortable contacts rather than painful fingertip pressure."],
    forceDirection: ["The patient pushes in the instructed direction while you provide equal counterforce so the joint does not visibly move during an isometric technique.", "Use low-to-moderate effort; the technique is about control, not maximal strength."],
    applicationSteps: ["1. Measure the restricted movement.", "2. Move gently to the first comfortable barrier.", "3. Ask the patient to contract at about 10–30% effort for roughly 5–10 seconds.", "4. Tell them to relax completely.", "5. Wait briefly for relaxation, then gently take up the new available range.", "6. Repeat 3–5 cycles if the response remains comfortable.", "7. Reassess active range and use the gain in active exercise."],
    expectedResponse: ["Reduced guarding, increased comfortable range and improved movement confidence."],
    stopCriteria: ["Cramping, sharp pain, dizziness, significant symptom reproduction or inability to relax after the contraction."],
    commonMistakes: ["Using maximal contraction.", "Moving through the joint during an intended isometric hold.", "Pushing aggressively into the new barrier after relaxation.", "Using MET when contraction is medically restricted."],
    clinicalExample: ["Example: a patient with limited hamstring length performs a gentle isometric knee-flexion/hip-extension effort against resistance, relaxes, then moves into a slightly greater comfortable range before active hamstring loading."]
  },
  "strain-counterstrain": {
    patientPosition: ["Start in the position where the tender point is easy to access.", "Then move the patient passively toward the position of greatest comfort, usually shortening the painful tissues rather than stretching them."],
    therapistPosition: ["Support the body part fully so the patient can relax and does not need to hold the position.", "Stay close enough to monitor the tender point with one hand while positioning with the other."],
    handPlacement: ["Use one finger or a small contact only to monitor tenderness; do not continue pressing hard into the point.", "The positioning hand supports the limb or trunk and does most of the work."],
    forceDirection: ["This is an indirect technique: move away from pain and restriction toward ease.", "Fine-tune flexion/extension, rotation and side-bending until tenderness is substantially reduced."],
    applicationSteps: ["1. Identify a reproducible tender point and rate tenderness at baseline.", "2. Maintain only light monitoring pressure.", "3. Passively move the body part into the most comfortable position until tenderness drops markedly.", "4. Fine-tune the position; do not force.", "5. Hold the comfortable position—traditional teaching often uses about 90 seconds, but clinical response can guide duration.", "6. Return to neutral very slowly while the patient stays relaxed.", "7. Recheck the tender point and, more importantly, the original painful movement/function."],
    expectedResponse: ["Less tenderness, reduced guarding and easier movement."],
    stopCriteria: ["The position causes new pain, breathing difficulty, paresthesia, vascular symptoms or violates postoperative/medical precautions."],
    commonMistakes: ["Pressing hard on the tender point for the whole hold.", "Stretching the tissue instead of shortening toward comfort.", "Letting the patient actively return to neutral too quickly.", "Treating many tender points without checking functional relevance."],
    clinicalExample: ["Example: a highly irritable upper trapezius tender point is positioned into comfort, held, slowly returned, then cervical motion and scapular control are reassessed."]
  },
  "myofascial-release": {
    patientPosition: [
      "Before making contact, identify the patient's most relevant painful or restricted movement. Then expose only the treatment area and support it so the surrounding muscles can settle without unnecessary effort. A comfortable starting position often makes the response easier to interpret.",
      "Prone, supine, side-lying and sitting are all possible choices. Select the position that gives clear access, respects the patient's symptoms and allows them to report any change without having to brace against the table."
    ],
    therapistPosition: [
      "Stand close enough to keep your shoulders relaxed, your wrists comfortably aligned and your base of support stable. Think of controlled weight transfer from the body rather than trying to generate sustained pressure with the thumbs alone.",
      "Position yourself so you can gradually reduce or redirect the load at any moment. You should be able to watch the patient's response, hear their feedback and maintain an unhurried, steady contact."
    ],
    handPlacement: [
      "Begin with a broad, comfortable contact over the relevant soft-tissue region. Depending on its size and shape, the contact may come from the palms, forearms, fingertips or a supported cross-hand position; precision and tolerance determine the choice.",
      "When sustained skin-and-fascia contact is intended, little or no lubricant is often used so the hands do not slide excessively. Check skin tolerance and avoid unnecessary pressure over vulnerable structures rather than chasing a particular feeling under the fingers."
    ],
    forceDirection: [
      "In direct myofascial release, gently take up the perceived tissue slack toward the direction of resistance and maintain a controlled, tolerable load. This should be progressive and never forced through pain.",
      "In indirect myofascial release, follow the direction in which the region feels easier or less guarded. The emphasis is comfortable positioning and monitoring the response, not aggressively stretching into a barrier.",
      "In both approaches, the input is usually broad, gradual and sustained rather than sudden. A change in sensation is something to observe, not proof that adhesions have been physically broken."
    ],
    applicationSteps: [
      "1. Start with a baseline. Ask the patient to perform the movement that matters, and note pain, range or the functional difficulty before touching the treatment area.",
      "2. Help the region relax. Position and support the patient, obtain consent, and settle your hands into a broad contact that feels comfortable and easy to control.",
      "3. Find a useful direction. For direct MFR, gently take up tissue slack toward resistance; for indirect MFR, move toward the direction of ease. Do not force either approach.",
      "4. Maintain a measured contact while observing breathing, guarding, comfort and any familiar symptoms. Adjust or reduce the load if the response becomes uncomfortable.",
      "5. Resist the urge to press harder in search of a dramatic 'release'. Keep the pressure tolerable; the treatment's value will be judged after it ends.",
      "6. Return gradually to neutral, remove your hands and invite the same baseline movement again. Compare the response rather than relying only on what the tissue felt like during contact.",
      "7. If the trial was useful, follow it with appropriate active mobility, strengthening or a relevant functional task. Manual work should support rehabilitation, not become its entire purpose."
    ],
    expectedResponse: [
      "The patient may notice less perceived tightness, a short-term reduction in discomfort or an easier movement. Some patients will notice little change, and that is useful feedback too; avoid promising a permanent structural correction.",
      "Repeat the movement measured at the start and ask what is different in a meaningful, reproducible way. If no benefit appears, reconsider the clinical hypothesis instead of automatically increasing pressure."
    ],
    stopCriteria: [
      "Stop or modify the technique immediately for sharp pain, burning, bruising, new neurological symptoms, skin compromise or a clear worsening of the patient's familiar symptoms. Unusual or progressive symptoms require appropriate clinical assessment rather than more manual force."
    ],
    commonMistakes: [
      "Using too much lubricant can make a sustained skin-and-fascia contact difficult to control, while unnecessary thumb pressure can fatigue the therapist and irritate the patient.",
      "Another common mistake is pressing harder simply because no dramatic 'release' sensation is felt. A strong sensation is not evidence that the technique is working.",
      "Do not claim that fascia has been permanently rearranged or that adhesions have been broken by touch alone. Keep explanations evidence-conscious, and always connect any short-term gain with active rehabilitation."
    ],
    clinicalExample: [
      "Imagine a patient who feels a pulling sensation across the front of the chest when reaching overhead. First, check their comfortable shoulder elevation and ask which part of the reach is troublesome.",
      "With the patient supported, a trained clinician may trial a slow cross-hand or longitudinal soft-tissue contact over a relevant pectoral region, staying within comfort and watching the response. The clinician then retests the same overhead reach and follows any useful change with appropriate scapular and rotator-cuff exercise.",
      "The lesson is not that the fascia was 'freed'. It is whether the patient can use the shoulder more comfortably afterward—and what active rehabilitation helps sustain that progress."
    ]
  },
  "soft-tissue-mobilization": {
    patientPosition: ["Support the treated muscle so it can relax.", "Choose a position that exposes the tissue without putting it on painful stretch unless movement is intentionally part of the technique."],
    therapistPosition: ["Work close to the patient with relaxed shoulders and neutral wrists.", "Use larger body surfaces such as palm or forearm for large muscles rather than overloading your thumbs."],
    handPlacement: ["Use broad contact first, then become more specific only if clinically useful.", "Avoid direct pressure over nerves, vessels, fresh bruising and bony prominences."],
    forceDirection: ["Strokes may be longitudinal, transverse, circular or sustained depending on the goal.", "Pressure should build gradually and remain within the patient's tolerable range."],
    applicationSteps: ["1. Record movement or function before treatment.", "2. Begin with broad slow strokes to assess sensitivity.", "3. Focus only on areas relevant to the patient's symptoms.", "4. Adjust pressure, speed and direction based on comfort.", "5. Keep treatment time modest and avoid unnecessary soreness.", "6. Reassess and add active movement or loading."],
    expectedResponse: ["Relaxation, reduced pain sensitivity, less perceived stiffness and improved movement tolerance."],
    stopCriteria: ["Sharp pain, numbness, bruising, dizziness, autonomic symptoms or worsening function."],
    commonMistakes: ["Treating pain tolerance as the goal.", "Using deep pressure over acute injury.", "Spending the whole session on passive tissue work.", "Not explaining that temporary tenderness is possible."],
    clinicalExample: ["Example: calf soft-tissue mobilization before ankle mobility and calf strengthening may help a patient move more comfortably, but the exercise remains the main rehabilitation stimulus."]
  },
  "trigger-point-compression": {
    patientPosition: ["Place the muscle in a comfortable mid-range so it is neither maximally shortened nor aggressively stretched.", "Support the limb fully."],
    therapistPosition: ["Use a position where your pressure can come from body weight rather than thumb strain.", "Keep visual contact with the patient when possible so you can monitor their response."],
    handPlacement: ["Locate the clinically relevant sensitive region and use a broad thumb, fingertip, knuckle or supported contact.", "Confirm that the pressure reproduces familiar rather than alarming pain."],
    forceDirection: ["Pressure is gradual and directed into the muscle belly, not onto a nerve, vessel or bone.", "Hold steady or slightly reduce pressure as sensitivity changes."],
    applicationSteps: ["1. Establish baseline tenderness and the functional movement you want to influence.", "2. Apply pressure slowly until the patient reports moderate tolerable discomfort, not severe pain.", "3. Hold 20–90 seconds while the patient breathes normally.", "4. Reduce pressure if discomfort rises rather than settles.", "5. Release gradually and retest movement.", "6. Follow with active lengthening, motor control or strengthening."],
    expectedResponse: ["Reduced tenderness or easier movement; not necessarily complete disappearance of the point."],
    stopCriteria: ["Tingling, electric pain, severe burning, dizziness, bruising or escalating pain."],
    commonMistakes: ["Trying to 'destroy a knot'.", "Pressing directly on a nerve.", "Using maximum pain as proof of accuracy.", "Ignoring broader contributors such as load, sleep and exercise."],
    clinicalExample: ["Example: a sensitive upper trapezius region is treated briefly, then cervical rotation and scapular endurance are retested and trained."]
  },
  "iastm": {
    patientPosition: ["Expose the target area and support the limb so muscles can relax.", "Check skin integrity and sensation before treatment."],
    therapistPosition: ["Hold the instrument lightly enough to feel feedback without gripping it tightly.", "Keep your wrist neutral and use your arm/body for motion."],
    handPlacement: ["One hand may stabilize or tension the skin; the other controls the instrument.", "Choose a tool edge that fits the body region comfortably."],
    forceDirection: ["Use shallow-to-moderate instrument angles and controlled strokes along or across the tissue as clinically appropriate.", "The goal is useful mechanical/sensory loading, not visible bruising."],
    applicationSteps: ["1. Screen skin, circulation, sensation, medications and bleeding risk.", "2. Apply a small amount of lubricant if the technique requires glide.", "3. Begin with light scanning strokes.", "4. Treat a clinically relevant area with short controlled passes.", "5. Stop well before petechiae or bruising become a treatment goal.", "6. Reassess and immediately use the area in mobility or loading exercise."],
    expectedResponse: ["Temporary change in pain, perceived stiffness or range."],
    stopCriteria: ["Skin breakdown, marked redness that persists, petechiae, bruising, sharp pain, numbness or vascular symptoms."],
    commonMistakes: ["Believing redness is necessary.", "Scraping too hard or too long.", "Using the tool to 'diagnose scar tissue' by sound or texture.", "Skipping bleeding-risk screening."],
    clinicalExample: ["Example: brief IASTM to a stiff calf may be followed immediately by weight-bearing dorsiflexion and calf raises."]
  },
  "neurodynamic-mobilization": {
    patientPosition: ["Position the patient so the nerve pathway can be moved in a controlled way without forcing end range.", "Choose supine or sitting based on the nerve test and irritability."],
    therapistPosition: ["Support the limb throughout the movement and control multiple joints smoothly.", "Stand where you can coordinate proximal and distal movements without dropping the limb."],
    handPlacement: ["Support around bony segments, not directly over the nerve.", "Use one hand proximally and the other distally to coordinate the slider or tensioner."],
    forceDirection: ["A slider increases neural load at one end while reducing it at the other.", "A tensioner increases load at both ends and is reserved for lower-irritability presentations.", "Movement should be rhythmic, not a sustained aggressive stretch."],
    applicationSteps: ["1. Complete a neurological screen first.", "2. Identify a neurodynamic test that reproduces familiar symptoms and changes with structural differentiation.", "3. Start with a slider in an irritable patient.", "4. Move slowly through a comfortable range for 10–20 repetitions.", "5. Keep distal symptoms mild and short-lived; do not repeatedly provoke strong paresthesia.", "6. Reassess the neurodynamic test, neurological symptoms and function.", "7. Progress range or move toward tensioners only when symptoms are stable."],
    expectedResponse: ["Reduced mechanosensitivity, greater comfortable excursion and improved function."],
    stopCriteria: ["Increasing numbness, weakness, distal symptom spread, prolonged post-treatment paresthesia or worsening neurological signs."],
    commonMistakes: ["Treating neurodynamics as a nerve 'stretch'.", "Using tensioners too early.", "Ignoring progressive weakness/reflex changes.", "Pushing until tingling is strong because it 'must be working'."],
    clinicalExample: ["Example: median-nerve mechanosensitivity may begin with a gentle shoulder/elbow-wrist slider, then progress to functional upper-limb loading as irritability decreases."]
  },
  "manual-traction": {
    patientPosition: ["Place the patient in a relaxed position with the target joint/spine supported.", "For cervical traction, supine often allows better relaxation than sitting."],
    therapistPosition: ["Align your body with the long axis of the segment and use body weight rather than pulling with your arms.", "Maintain a stable base so the force increases and decreases smoothly."],
    handPlacement: ["For peripheral joints, grasp proximal to sensitive structures and avoid compressing nerves/vessels.", "For cervical traction, support the occiput and jaw/neck region comfortably without pressing the throat."],
    forceDirection: ["Apply a gradual long-axis distraction or joint-specific traction direction.", "Force should be smooth and can be sustained or intermittent depending on the response."],
    applicationSteps: ["1. Establish baseline symptoms, including whether pain is central or distal.", "2. Screen instability, fracture and neurological concerns.", "3. Apply a very gentle test traction first.", "4. Ask whether symptoms centralize, ease, remain unchanged or worsen.", "5. If the response is favorable, continue a short sustained or intermittent bout.", "6. Release slowly and reassess immediately.", "7. Continue only in responders and combine with active rehabilitation."],
    expectedResponse: ["Reduced compression-related pain or centralization/easier movement in a responder."],
    stopCriteria: ["Peripheralization, dizziness, nausea, new neurological symptoms, severe pain or apprehension."],
    commonMistakes: ["Assuming traction is indicated for every disc or radicular diagnosis.", "Pulling suddenly.", "Ignoring worsening distal symptoms.", "Using traction without active follow-up."],
    clinicalExample: ["Example: a cervical radicular presentation that clearly centralizes with gentle traction may use it briefly before cervical/scapular exercise and neural sliders."]
  },
  "high-velocity-low-amplitude-thrust": {
    patientPosition: ["Position depends on the region, but the patient must be comfortable, informed and able to stop the procedure at any time.", "Avoid provocative end-range positioning, especially in the cervical region."],
    therapistPosition: ["Only clinicians with formal hands-on training and appropriate scope should perform thrust manipulation.", "Use a balanced stance and minimal pre-thrust tension; avoid relying on force or speed to compensate for poor setup."],
    handPlacement: ["Contacts are region-specific and must avoid vulnerable neurovascular structures.", "Because safe thrust technique requires supervised practical training, this educational page should be used to understand principles, screening and decision-making—not to learn a cervical thrust from text alone."],
    forceDirection: ["The thrust is a very small-amplitude, high-velocity movement delivered within a controlled range after a safe setup.", "A cavitation is not the target and should never justify repeating forceful attempts."],
    applicationSteps: ["1. Confirm that a thrust is genuinely necessary compared with lower-risk options.", "2. Complete region-specific red-flag, neurological, fracture/instability and vascular risk assessment. For cervical care, follow a contemporary framework such as IFOMPT.", "3. Explain expected benefit, alternatives, uncertainties and potential adverse effects and obtain informed consent.", "4. Establish a comfortable, non-provocative setup with minimal pre-thrust force.", "5. If the patient becomes apprehensive or symptoms change, abandon the thrust and use another intervention.", "6. After any thrust, reassess neurological status, pain, range and function.", "7. Use the short-term change to support active rehabilitation."],
    expectedResponse: ["Possible short-term reduction in pain or improvement in motion. An audible click is neither necessary nor proof of correction."],
    stopCriteria: ["Any vascular or neurological warning symptom, patient withdrawal of consent, significant pain, unexpected resistance, instability concern or inability to establish a comfortable setup."],
    commonMistakes: ["Chasing cavitation.", "Using manipulation as first-line treatment when simpler options are equally suitable.", "Using outdated positional vascular tests as proof of safety.", "Telling patients a vertebra was 'put back in place'."],
    clinicalExample: ["Example: when a carefully screened thoracic manipulation is chosen for short-term mobility/pain modulation, it should be followed by the movement or strengthening task the patient actually needs."]
  },
  "pnf-manual-techniques": {
    patientPosition: ["Place the patient in a stable starting position that allows the desired diagonal movement without compensatory trunk motion.", "Support weaker limbs as needed."],
    therapistPosition: ["Stand in the line of the diagonal pattern so your resistance follows the movement rather than blocks it.", "Move your own body with the patient's limb."],
    handPlacement: ["Use lumbrical-style hand contacts over appropriate surfaces of the limb, avoiding painful grip.", "Your hands give direction, resistance and sensory information rather than squeezing."],
    forceDirection: ["Resistance is applied opposite the intended movement but should still allow smooth successful motion.", "For stabilizing techniques, resistance changes direction without allowing large movement."],
    applicationSteps: ["1. Define the functional goal: mobility, initiation, strength, stability or coordination.", "2. Choose the relevant pattern and starting position.", "3. Give a clear verbal command and allow visual tracking when useful.", "4. Apply only enough manual resistance to improve the movement.", "5. Use the selected PNF technique—rhythmic initiation, repeated contractions, hold-relax, stabilizing reversals, etc.", "6. Transfer the improved pattern into the real task such as reaching, gait or transfers."],
    expectedResponse: ["Smoother movement, improved initiation, greater strength/control or better functional performance."],
    stopCriteria: ["Pain, breath-holding, excessive fatigue, spasticity escalation or cardiovascular intolerance."],
    commonMistakes: ["Using too much resistance.", "Focusing on the diagonal rather than the functional goal.", "Poor verbal cueing.", "Allowing compensations to dominate the movement."],
    clinicalExample: ["Example: a post-stroke patient may use rhythmic initiation through an upper-limb diagonal before practicing functional reaching."]
  },
  "fascial-manipulation": {
    patientPosition: ["Position depends on the selected region and movement pattern; expose only the necessary area.", "The patient should be comfortable because focused friction can otherwise become unnecessarily painful."],
    therapistPosition: ["Stand close to the selected point and use body weight with controlled small movements.", "Protect your own thumb/finger joints by using supported contacts."],
    handPlacement: ["Use a precise supported contact over the clinically selected fascial region rather than treating large areas randomly.", "Avoid vulnerable superficial structures."],
    forceDirection: ["Focused friction/pressure is applied according to the chosen system and tissue orientation, but force remains patient-tolerable.", "System-specific theoretical maps should guide hypotheses, not replace clinical reassessment."],
    applicationSteps: ["1. Identify the movement dysfunction and relevant history.", "2. Select candidate fascial regions according to the system.", "3. Confirm local relevance through palpation and movement testing.", "4. Apply focused, tolerable friction/pressure for a limited period.", "5. Avoid creating unnecessary tissue trauma.", "6. Reassess the original movement immediately.", "7. Follow with active movement/loading."],
    expectedResponse: ["Reduced pain or improved movement if the selected point was clinically relevant."],
    stopCriteria: ["Sharp pain, bruising, autonomic symptoms, skin irritation or worsening function."],
    commonMistakes: ["Treating theoretical maps as certainty.", "Using very aggressive pressure.", "Treating many points without reassessment.", "Failing to integrate exercise."],
    clinicalExample: ["Example: if a selected fascial point is treated for a movement restriction, the same movement must be retested before deciding the point was meaningful."]
  },
  "active-release-style-soft-tissue": {
    patientPosition: ["Start with the target tissue in a comfortably shortened position when appropriate.", "The patient must be able to actively move the relevant joint through range."],
    therapistPosition: ["Stand where you can maintain one precise tissue contact while allowing the patient's limb to move freely.", "Do not pin the tissue with excessive force."],
    handPlacement: ["Contact the target muscle/tendon with a thumb, fingers or broad hand contact.", "Stabilize surrounding tissues as needed while leaving the joint free to move."],
    forceDirection: ["Maintain a controlled contact while the patient actively lengthens or moves the tissue underneath your hand.", "Pressure is directed into the tissue but should not create bruising or nerve symptoms."],
    applicationSteps: ["1. Identify the painful/restricted movement.", "2. Place the tissue in a comfortable shortened position.", "3. Establish a tolerable contact over the target.", "4. Ask the patient to actively move so the tissue lengthens beneath your contact.", "5. Release and repeat 3–8 slow repetitions.", "6. Reassess movement and progress to active loading."],
    expectedResponse: ["Improved movement tolerance or short-term flexibility."],
    stopCriteria: ["Sharp pain, tingling, bruising, or worsening movement."],
    commonMistakes: ["Using excessive pressure.", "Moving the limb passively when the technique is intended to be active.", "Treating acute tears aggressively.", "Skipping strength/loading afterward."],
    clinicalExample: ["Example: active soft-tissue release of the calf can be followed by dorsiflexion testing and functional calf loading."]
  },
  "manual-lymphatic-drainage": {
    patientPosition: ["Position the patient comfortably with the swollen limb supported and the skin accessible.", "Elevation may assist comfort but does not replace compression or active muscle pump when those are indicated."],
    therapistPosition: ["Sit or stand so your hands remain relaxed; MLD uses light skin stretch, not deep massage pressure.", "Move around the patient rather than reaching awkwardly."],
    handPlacement: ["Use broad flat hand contacts that stretch the skin gently.", "Avoid deep pressure into muscle, painful nodes, wounds or infected skin."],
    forceDirection: ["Follow an appropriate lymphatic drainage sequence based on the patient's condition and intact pathways.", "Pressure is superficial and rhythmic because initial lymphatic structures lie close to the skin."],
    applicationSteps: ["1. Confirm the cause of swelling and exclude DVT, cellulitis and decompensated cardiac failure.", "2. Explain that MLD is one component of lymphedema care.", "3. Begin with the appropriate proximal/central preparation according to the clinician's lymphatic training.", "4. Use slow rhythmic skin-stretch strokes.", "5. Progress through the limb in the planned drainage sequence.", "6. Combine with compression, exercise and skin care when indicated.", "7. Re-measure swelling and functional response over time."],
    expectedResponse: ["Improved comfort and fluid management as part of comprehensive decongestive therapy."],
    stopCriteria: ["Pain, redness/heat suggestive of cellulitis, sudden breathlessness, chest pain, suspected DVT or acute cardiac symptoms."],
    commonMistakes: ["Using deep massage pressure.", "Performing MLD on unexplained new unilateral swelling.", "Using MLD without compression/exercise when those are required.", "Treating acute cellulitis."],
    clinicalExample: ["Example: post-breast-cancer lymphedema management may include MLD only after medical screening and alongside compression, exercise and skin care."]
  },
  "scar-mobilization": {
    patientPosition: ["Position the patient so the healed scar is visible and the surrounding joint can move if needed.", "The tissue should be fully healed before direct mobilization."],
    therapistPosition: ["Sit or stand close enough to use light precise pressure without dragging the skin.", "Keep the patient comfortable and able to observe if education/self-mobilization is planned."],
    handPlacement: ["Place one or two fingers or a broad fingertip contact on and around the healed scar.", "Start with skin contact adjacent to the scar before progressing directly over sensitive areas."],
    forceDirection: ["Use gentle longitudinal, transverse, circular and lifting/rolling directions depending on restriction and healing.", "Force is gradually increased only as tissue tolerance improves."],
    applicationSteps: ["1. Confirm complete wound closure and absence of infection/dehiscence.", "2. Check sensation and sensitivity.", "3. Begin with light movement of the skin around the scar.", "4. Progress toward the scar with small multidirectional glides.", "5. Add movement of the related joint so the scar is loaded functionally.", "6. Teach gentle self-mobilization when appropriate.", "7. Reassess range, pain and function."],
    expectedResponse: ["Reduced sensitivity and improved local mobility/function over time."],
    stopCriteria: ["Skin opening, bleeding, increasing redness/warmth, discharge or sharp pain."],
    commonMistakes: ["Mobilizing before healing is complete.", "Using aggressive force on fragile/radiated tissue.", "Treating scar appearance instead of functional limitation.", "Ignoring altered sensation."],
    clinicalExample: ["Example: after a healed knee incision, gentle scar mobility can be paired with knee flexion and quadriceps loading."]
  }
};
