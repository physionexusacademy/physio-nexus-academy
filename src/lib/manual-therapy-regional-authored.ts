import type { RegionalManualApplication } from "@/lib/manual-therapy-regional";

/**
 * Individually authored regional procedures, phase one.
 * Educational guides for trained physiotherapists; doses are starting examples,
 * not universal prescriptions. Case scenes live separately from safety details.
 */
export const authoredRegionalManualApplications: RegionalManualApplication[] = [
  {
    "slug": "scs-quadratus-lumborum-lumbar",
    "techniqueSlug": "strain-counterstrain",
    "techniqueName": "Strain Counterstrain",
    "region": "Lumbar",
    "title": "Lumbar Quadratus Lumborum — Positional Ease",
    "applicability": "Detailed",
    "clinicalUse": [
      "A person feels a familiar localized ache when rising from a chair or reaching to one side. The question is whether a specific quadratus-lumborum-related tender point can be made comfortably quieter in a shortened position.",
      "Consider only after assessment of mechanical versus non-musculoskeletal pain, neurological features and irritability; a tender point is not a definitive diagnosis.",
      "The movement you will retest is standing side-bending or another familiar, comfortable functional task."
    ],
    "patientPosition": [
      "Begin in supported side-lying or another relaxed position where the lumbar region and pelvis can be moved as one comfortable unit.",
      "Use pillows under the waist, knees and head. The treated side must be able to move toward comfortable shortening rather than hanging in an uncontrolled stretch."
    ],
    "therapistPosition": [
      "Stand beside the trunk with a secure stance, one hand supporting the pelvis and the other monitoring the relevant tender area as appropriate.",
      "Keep the patient's legs supported and do not rely on forceful twisting to create an apparent position of ease."
    ],
    "stabilization": [
      "Support the rib cage and pelvis; control their relationship without forced rotation.",
      "If the tender point becomes more sensitive, undo the latest adjustment. The patient's feedback is your compass."
    ],
    "contact": [
      "Palpate the relevant quadratus lumborum region with light, respectful contact, avoiding the kidney area and unnecessary deep abdominal or flank pressure.",
      "Use a supported hand to monitor relative tenderness; the positioning hand gently controls pelvic hike or side-bending, not high-velocity manipulation."
    ],
    "forceDirection": [
      "Gently approximate the iliac crest toward the ipsilateral lower ribs through comfortable trunk side-bending and/or pelvic hiking on the treated side, adjusting until tenderness is reduced.",
      "The preferred position is the one that feels easier to this patient, not a fixed posture forced to match a diagram."
    ],
    "dosage": [
      "For a selected classical SCS-style protocol, a comfortable hold around 60–90 seconds may be used by trained clinicians; it is a protocol convention, not a guaranteed optimum.",
      "Return to neutral very slowly, then reassess rather than immediately adding more positioning force."
    ],
    "steps": [
      "Record the patient's familiar standing side-bend or sit-to-stand discomfort before treatment.",
      "Exclude red flags and clarify that a local tender point does not explain all causes of back pain.",
      "Position side-lying with comfortable pillows, locate the clinically relevant tender area with gentle monitoring pressure.",
      "Bring the tissues toward ease by controlled ipsilateral side-bending and/or pelvic approximation; do not force rotation.",
      "Fine-tune until the tender point is notably less sensitive and the patient feels relaxed; abandon any painful position.",
      "Maintain the comfortable protocol hold, then guide the trunk and pelvis back to neutral slowly.",
      "Repeat the original movement and add graded active trunk control if the response is helpful."
    ],
    "reassess": [
      "Comfort during the same side-bend or sit-to-stand task",
      "Reported tenderness at the original point under comparable light contact",
      "Symptoms and activity tolerance over subsequent movement"
    ],
    "mistakes": [
      "Mistaking painful lumbar rotation for adequate shortening: comfortable positioning is the point of this method.",
      "Pressing hard into the flank to 'prove' a tender point exists.",
      "Promising that one hold realigned vertebrae or permanently corrected fascial structure."
    ],
    "safety": [
      "Stop for new neurological symptoms, severe unrelenting pain, suspected fracture or other red flags; refer as clinically indicated.",
      "Avoid direct aggressive pressure over the renal/flank region and avoid positions that stress an unstable spine or recent surgery.",
      "Do not proceed when a position of ease cannot be found without discomfort."
    ],
    "visualCue": "Softly approximate same-side rib and iliac crest → monitor ease → slow return → retest familiar side-bend."
  },
  {
    "slug": "scs-upper-trapezius-shoulder",
    "techniqueSlug": "strain-counterstrain",
    "techniqueName": "Strain Counterstrain",
    "region": "Shoulder",
    "title": "Upper Trapezius — Shoulder Girdle Position of Ease",
    "applicability": "Detailed",
    "clinicalUse": [
      "A patient points to a tender superior shoulder after a long laptop session. Moving the head or lowering a tense shoulder reproduces their familiar ache.",
      "Use as a comfort-based positional trial only when shoulder/neck screening supports a local muscular contribution.",
      "Compare a comfortable head turn and arm reach before and after; neither one has to improve automatically."
    ],
    "patientPosition": [
      "Supine or supported sitting, with head and upper limb fully supported so the patient does not have to hold the shoulder in the air.",
      "A pillow under the treated arm helps the scapula elevate comfortably without the clinician forcing the neck."
    ],
    "therapistPosition": [
      "Stand at the head/side of the table with one hand supporting the shoulder girdle and the other guiding head position if needed.",
      "Watch for jaw clenching or global bracing; a 'position of ease' that requires effort is missing the point."
    ],
    "stabilization": [
      "Support the head and arm, keeping the rest of the trunk relaxed and avoiding end-range cervical loading.",
      "Hold the scapular/shoulder girdle position lightly rather than pushing forcefully toward the ear."
    ],
    "contact": [
      "Light monitoring contact over the selected upper-trapezius tender area; avoid the anterior neck and supraclavicular neurovascular structures.",
      "Use the supporting hand to position shoulder elevation while the head moves gently toward the treated side if tolerated."
    ],
    "forceDirection": [
      "Shorten the target upper trapezius region through comfortable ipsilateral cervical side-bending together with scapular elevation, then fine-tune toward maximal ease.",
      "Do not side-bend away into stretch or demand a fixed rotation direction; choose according to monitored comfort."
    ],
    "dosage": [
      "A trained clinician may use a comfortable 60–90-second hold according to the SCS variation, then return very slowly.",
      "Check tolerance before repetition. Repeated holds are optional, not a reward for producing tenderness."
    ],
    "steps": [
      "Ask the patient to show a familiar upper-shoulder symptom during head turning or arm elevation, and record it.",
      "Screen the neck/shoulder region for neurological, vascular and serious pathology concerns.",
      "Support the patient supine; identify a representative tender area using gentle contact.",
      "Elevate the ipsilateral shoulder girdle and softly side-bend the head toward the tender side to shorten the region.",
      "Adjust only within comfort until monitoring tenderness settles, with no voluntary contraction required.",
      "Maintain the selected ease position for the protocol hold and return slowly to supported neutral.",
      "Recheck the original head turn or arm movement and use a suitable active movement if the trial helps."
    ],
    "reassess": [
      "Same active cervical side-bend or rotation",
      "Same shoulder elevation task",
      "Tenderness and confidence during normal postural movement"
    ],
    "mistakes": [
      "Moving the head away from the treated upper trapezius while claiming to shorten that region.",
      "Letting the patient actively hold the shoulder up during a supposedly relaxed positioning technique.",
      "Using a tender point to justify ignoring neurological symptoms or referred pain."
    ],
    "safety": [
      "Do not force cervical rotation, extension or shoulder elevation in an irritable neck.",
      "Stop and assess if dizziness, unusual headache, visual symptoms, neurological symptoms or unexpected symptom spread occurs.",
      "Avoid direct pressure in the supraclavicular fossa and respect recent shoulder/neck surgery."
    ],
    "visualCue": "Upper-trapezius ease = supported shoulder elevation + head side-bend toward treated side; monitor tenderness."
  },
  {
    "slug": "trigger-point-infraspinatus-shoulder",
    "techniqueSlug": "trigger-point-compression",
    "techniqueName": "Trigger Point Compression",
    "region": "Shoulder",
    "title": "Infraspinatus Region — Gentle Trigger Point Compression",
    "applicability": "Detailed",
    "clinicalUse": [
      "A swimmer says reaching across the body feels sore, and gentle palpation of the posterior scapular region reproduces a familiar local discomfort. A tender spot is a clue, not the diagnosis.",
      "Consider a short, tolerable local compression trial only alongside shoulder evaluation and functional exercise.",
      "Identify a safe repeated baseline such as controlled shoulder external rotation or reaching behind the back."
    ],
    "patientPosition": [
      "Side-lying with the treated shoulder uppermost, or prone with the shoulder and arm comfortably supported.",
      "Support the head, scapula and arm; avoid positioning that aggravates an unstable or acutely inflamed shoulder."
    ],
    "therapistPosition": [
      "Stand beside the scapula with relaxed shoulders, forearm support where possible and a neutral wrist.",
      "Maintain clear access to the posterior scapular surface without leaning your full body weight on a small contact point."
    ],
    "stabilization": [
      "Support the arm so the posterior shoulder musculature need not guard against gravity.",
      "Use broad contact to steady the area near the infraspinous fossa, remaining away from the axilla."
    ],
    "contact": [
      "Palpate the infraspinatus muscle belly over the infraspinous scapular fossa, inferior to the scapular spine, with a supported thumb pad or finger pads.",
      "Do not compress the axilla, suprascapular notch or other neurovascular areas; avoid painful bony contact."
    ],
    "forceDirection": [
      "Introduce gradually increasing, stationary, comfortable pressure toward the soft tissue supported by the scapula, without forceful digging.",
      "Ask whether the pressure reproduces a familiar, tolerable sensation; radiating electrical pain or numbness is not an acceptable target."
    ],
    "dosage": [
      "Begin with a brief 15–30-second monitored trial, adjusting or ending earlier as needed; specific optimal dosing is not established.",
      "Pressure is titrated to comfort and clinical response. More pain does not mean more effective release."
    ],
    "steps": [
      "Check the familiar shoulder movement and screen for rotator-cuff tear, acute injury, cervical referral or neurological features as appropriate.",
      "Position the patient with the arm supported and identify the infraspinatus muscle region anatomically.",
      "Apply broad supported contact first, then a small amount of steady, tolerable pressure over the selected muscular area.",
      "Ask for feedback and adjust immediately for guarding, symptom spread or discomfort; do not chase high pain scores.",
      "Release slowly and let the shoulder settle.",
      "Repeat the same shoulder rotation/reach and measure whether anything useful changed.",
      "Link any improvement to graded external-rotation control or other relevant functional exercise."
    ],
    "reassess": [
      "Pain-free shoulder rotation",
      "Reach behind the back or across the body",
      "Symptom irritability after the trial"
    ],
    "mistakes": [
      "Calling every tender area a validated active trigger point or the sole cause of shoulder symptoms.",
      "Digging forcefully with a thumb near vulnerable scapular borders.",
      "Ignoring changes in the neck or arm simply because pressure on the scapula reproduces discomfort."
    ],
    "safety": [
      "Do not use sustained compression over suspected acute tear, local infection, fracture, hematoma or damaged skin.",
      "Stop for numbness, electric shock sensations, worsening radiating pain or disproportionate discomfort.",
      "Screen referred pain and neurological signs before treating a small tender region as a stand-alone diagnosis."
    ],
    "visualCue": "Posterior scapula/infraspinous fossa → tolerable static muscular pressure → retest active shoulder rotation."
  },
  {
    "slug": "stm-lumbar-paraspinals",
    "techniqueSlug": "soft-tissue-mobilization",
    "techniqueName": "Soft Tissue Mobilization",
    "region": "Lumbar",
    "title": "Lumbar Paraspinal Soft-Tissue Mobilization",
    "applicability": "Detailed",
    "clinicalUse": [
      "A patient says their back feels 'locked' after a long day standing. The visible problem might be guarded bending, not a tissue knot waiting to be crushed.",
      "Trial soft-tissue contact as an adjunct to assessment-based movement and exercise rather than diagnosing stiffness by touch alone.",
      "Use a repeatable functional task such as a comfortable forward bend or sit-to-stand."
    ],
    "patientPosition": [
      "Prone with a small pillow under the abdomen if comfortable, or side-lying when prone is not tolerated.",
      "Keep knees, hips and shoulders supported to reduce guarding and avoid forcing lumbar extension."
    ],
    "therapistPosition": [
      "Stand alongside the treatment area with a broad stance, shoulders relaxed and wrists aligned.",
      "Transfer weight gently through the arms rather than repeatedly loading a small thumb joint."
    ],
    "stabilization": [
      "The treatment table and pillows support the trunk; place the contact beside, not directly on, spinous processes.",
      "Keep the pelvis stable enough that comfortable tissue movement can be controlled."
    ],
    "contact": [
      "Use broad palm/thenar or supported forearm contact over lumbar erector-spinae muscle mass adjacent to the spine.",
      "Avoid direct focal pressure on spinous processes, kidneys/flanks or suspected injured tissues."
    ],
    "forceDirection": [
      "Slowly glide longitudinally along the lumbar paraspinal muscle region or use gentle stationary contact, staying within symptom tolerance.",
      "Choose direction by comfort and clinically observed response, not a belief that one stroke must 'break adhesions'."
    ],
    "dosage": [
      "Use short, response-guided bouts (for example, 30–60 seconds per selected region) with feedback after each; there is no universal ideal dose.",
      "Reduce pressure with highly irritable presentations and proceed to active movement rather than repeating manual work indefinitely."
    ],
    "steps": [
      "Record one meaningful functional task and ask about pain distribution, neurologic symptoms and clinical red flags.",
      "Support the trunk in prone or side-lying and explain the intended comfortable contact.",
      "Locate lumbar paraspinal muscle mass safely, lateral to the spinous processes.",
      "Apply broad, slow, tolerable longitudinal gliding or stationary contact while monitoring guarding and feedback.",
      "Modify pressure immediately if the response becomes sharper, radiating or unpleasant.",
      "End the brief trial, ask the patient to stand safely, and repeat the same bending or transfer task.",
      "If useful, practise graded trunk movement, strengthening or pacing strategies relevant to the patient's goal."
    ],
    "reassess": [
      "Comfort during the same sit-to-stand or bending task",
      "Pain location/intensity and next-movement tolerance",
      "Ability to participate in active lumbar exercise"
    ],
    "mistakes": [
      "Mistaking temporary perceived tissue softness for proof of structural realignment.",
      "Applying firm pressure directly over vertebral processes or vulnerable flank structures.",
      "Finishing an elaborate massage without rechecking the task that mattered."
    ],
    "safety": [
      "Screen serious back-pain red flags and progressive neurologic symptoms before routine manual intervention.",
      "Avoid pressure over recent trauma, suspected fracture, infection, severe osteoporosis-related vulnerability or unhealed surgery.",
      "Stop for worsening radiating symptoms, new weakness, saddle sensory disturbance or bladder/bowel changes; urgent assessment may be needed."
    ],
    "visualCue": "Broad lumbar paraspinal contact → short comfortable glide → standing bend retest → active movement."
  },
  {
    "slug": "stm-calf-ankle-foot",
    "techniqueSlug": "soft-tissue-mobilization",
    "techniqueName": "Soft Tissue Mobilization",
    "region": "Ankle & Foot",
    "title": "Gastrocnemius–Soleus Soft-Tissue Mobilization",
    "applicability": "Detailed",
    "clinicalUse": [
      "A walker reports calf tightness descending steps. Ask what happens during ankle dorsiflexion and stair movement before assuming that the muscle is physically shortened.",
      "May be considered alongside exercise and load management when local muscular sensitivity contributes; assess vascular and tendon conditions first.",
      "Compare weight-bearing ankle dorsiflexion or a controlled step task."
    ],
    "patientPosition": [
      "Prone with ankle supported beyond the table if safe, or supine with the knee and lower leg supported.",
      "Relax the calf and avoid aggressive end-range dorsiflexion during manual contact."
    ],
    "therapistPosition": [
      "Stand beside the leg with shoulders over the contact and wrists neutral; do not press directly on the Achilles tendon to 'find the calf'.",
      "Keep access broad and supported so you can modify pressure immediately."
    ],
    "stabilization": [
      "Support the distal leg and ankle, keeping the knee comfortable and the lower limb from rolling.",
      "Use a towel or pillow to avoid unnecessary pressure around the malleoli."
    ],
    "contact": [
      "Use broad palmar contact over the gastrocnemius muscle belly and, as appropriate, more distal soleus musculature.",
      "Avoid the popliteal fossa and the deep neurovascular bundle, the Achilles insertion and any focal bruised area."
    ],
    "forceDirection": [
      "Apply slow longitudinal glide along the muscle mass or gentle cross-direction work within comfort, never forceful friction into a tender Achilles tendon.",
      "Work proximally/distally as appropriate for the chosen contact; direction alone does not demonstrate improved blood flow or tissue remodelling."
    ],
    "dosage": [
      "Short, low-pressure trials of approximately 30–60 seconds per comfortable area can be used as teaching examples, not a fixed curative dose.",
      "Use patient response to decide whether to continue; manual work should not displace progressive calf loading."
    ],
    "steps": [
      "Reproduce the chosen step-down or weight-bearing dorsiflexion task and note how it feels.",
      "Screen swelling, redness, acute rupture signs, neurovascular problems, calf clot risk, bruising and skin integrity.",
      "Support the lower leg in a comfortable position and obtain consent.",
      "Make broad contact with the muscle belly while avoiding the popliteal fossa and tendon insertion.",
      "Trial a slow, controlled, comfortable glide while monitoring sensation and guarding.",
      "Stop immediately if pressure creates unexpected sharp pain, swelling-related concern or neurological symptoms.",
      "Retest the same ankle/stair task and follow with progressive heel raises or mobility work when indicated."
    ],
    "reassess": [
      "Weight-bearing ankle dorsiflexion and heel-rise comfort",
      "Pain on descending steps",
      "Calf tolerance to relevant loading later in the day"
    ],
    "mistakes": [
      "Trying to 'strip' the calf aggressively through pain.",
      "Massaging a hot, swollen or unexplained painful calf without appropriate medical screening.",
      "Attributing every change in dorsiflexion to a permanent tissue lengthening."
    ],
    "safety": [
      "Unexplained unilateral swelling, warmth, redness or calf pain needs medical evaluation for possible thrombosis; do not massage until assessed.",
      "Do not manipulate over acute muscle rupture, infection, fragile skin or a recent bleeding injury.",
      "Watch for altered sensation, vascular symptoms or significant pain escalation."
    ],
    "visualCue": "Supported calf muscle belly → broad gentle glide, avoid popliteal fossa → test ankle dorsiflexion."
  },
  {
    "slug": "met-shoulder-external-rotation",
    "techniqueSlug": "muscle-energy-technique",
    "techniqueName": "Muscle Energy Technique",
    "region": "Shoulder",
    "title": "Shoulder Rotation MET — Gentle Isometric Trial",
    "applicability": "Detailed",
    "clinicalUse": [
      "A patient tries to rotate the shoulder outward to put on a jacket. The arm stops at a comfortable limit; you check whether the problem is irritability, weakness, capsular restriction or another source.",
      "A low-effort shoulder-rotation MET variation may be explored in a medically appropriate and well-screened presentation, alongside active rehabilitation.",
      "Retest external-rotation range in the same supported position and the patient's dressing-related task."
    ],
    "patientPosition": [
      "Supine with the shoulder comfortably close to the side and the elbow flexed around 90°, a small towel supporting the upper arm as needed.",
      "Only move toward the first comfortable external-rotation barrier; do not force an apprehensive or unstable shoulder."
    ],
    "therapistPosition": [
      "Stand beside the shoulder, supporting the elbow with one hand and controlling the distal forearm with the other.",
      "Keep your own arm position secure so resistance can be matched gently rather than applied in a sudden jerk."
    ],
    "stabilization": [
      "Stabilize the upper arm against unwanted abduction and the trunk against rotation while preserving comfort.",
      "Do not pin down a shoulder that becomes guarded or painful."
    ],
    "contact": [
      "One hand supports the elbow/upper arm, the other gives broad contact at distal forearm for gentle resisted internal-rotation intent.",
      "Avoid torque directly at the wrist, painful pressure at the bicipital groove, or loading through an unstable joint."
    ],
    "forceDirection": [
      "With the shoulder near the comfortable external-rotation limit, ask for a gentle internal-rotation effort against matched isometric resistance (roughly toward the abdomen, without actual joint movement).",
      "After full relaxation, cautiously re-explore only the available comfortable external-rotation range. Technique choice depends on the impairment and the patient's response."
    ],
    "dosage": [
      "A teaching starting point can be 3–5 low-effort holds of around 3–6 seconds with easy breathing and sufficient relaxation; this is not a universally validated optimum.",
      "Stop or reduce effort if pain or apprehension rises, and reassess before another repetition."
    ],
    "steps": [
      "Measure comfortable shoulder external rotation and a functional movement such as reaching into a jacket.",
      "Check instability/apprehension, traumatic injury, post-operative precautions and neurological status.",
      "Support the elbow near the side, gently find the first comfortable external-rotation limit and explain the task.",
      "Ask the patient to push very gently toward internal rotation while you match the effort without allowing movement.",
      "Hold briefly at low effort with breathing relaxed, then ask for a complete release.",
      "Reassess the new comfortable external-rotation range without forcing end range.",
      "Repeat only if comfortable and useful, then train active rotator-cuff/scapular control."
    ],
    "reassess": [
      "Active and supported external rotation in a consistent position",
      "Comfort putting on clothing",
      "Tolerance during targeted active external-rotation exercise"
    ],
    "mistakes": [
      "Resisting with maximal force because the word 'energy' sounds powerful.",
      "Letting the shoulder translate or the trunk twist rather than producing a gentle isometric effort.",
      "Claiming a brief contraction permanently corrected a capsular restriction."
    ],
    "safety": [
      "Do not use forceful end-range rotation in anterior instability, recent dislocation or acute trauma.",
      "Respect post-operative limits, fracture concern, severe inflammation and marked apprehension.",
      "Stop for neurological symptoms, sharp pain or worsening instability sensation."
    ],
    "visualCue": "Support elbow at side → gentle isometric internal-rotation effort → relax → retest external rotation."
  },
  {
    "slug": "mulligan-hip-lateral-mwm",
    "techniqueSlug": "mulligan-mobilization-with-movement",
    "techniqueName": "Mulligan Mobilization With Movement",
    "region": "Hip & Pelvis",
    "title": "Hip Lateral Glide With Active Flexion — MWM Trial",
    "applicability": "Detailed",
    "clinicalUse": [
      "A patient says bringing the knee toward the chest is uncomfortable and a squat feels restricted. You establish a safe, reproducible hip-flexion comparable sign.",
      "Consider a selected belt-assisted hip lateral glide only when joint-related pain/mobility impairment is suspected and screening supports a manual trial.",
      "Hip therapy should be integrated with activity modification, strengthening and movement training rather than sold as a joint 'reset'."
    ],
    "patientPosition": [
      "Supine on a stable treatment table with the pelvis supported and the hip in a comfortable starting position.",
      "The patient must be able to actively flex the hip without severe pain; stop before a pinching end-range that worsens with the trial."
    ],
    "therapistPosition": [
      "Stand beside the treated hip with a stable stance and a suitable wide mobilization belt applied by an appropriately trained clinician.",
      "Keep the belt line controlled, avoid slipping and ensure the clinician can release the load immediately."
    ],
    "stabilization": [
      "Support/stabilize the pelvis so excessive lumbar rotation or pelvic hiking does not substitute for hip flexion.",
      "Do not press or anchor over the femoral triangle, groin vessels or other sensitive neurovascular structures."
    ],
    "contact": [
      "Use a broad mobilization belt or clinically trained hand contact near the proximal femoral/thigh region, positioned to give a lateral accessory glide without compressing the groin.",
      "Check padding, skin comfort and belt security before loading."
    ],
    "forceDirection": [
      "Introduce a gentle lateral accessory glide to the proximal femoral region while the patient actively brings the hip toward comfortable flexion.",
      "Fine-tune the line of the glide only if the task becomes clearly more comfortable; Mulligan's intended trial is pain-free/beneficial rather than forced through discomfort."
    ],
    "dosage": [
      "Begin with just a few controlled, pain-free repetitions (for example 3–6) and retest independently before further sets.",
      "Do not prescribe a rigid repetition count when the comparable sign fails to improve or symptoms become worse."
    ],
    "steps": [
      "Record a comfortable active hip-flexion angle or relevant squat sign, including pain location and quality.",
      "Screen trauma, fracture/stress-injury concern, unexplained groin pain, marked irritability and hip red flags.",
      "Set the patient supine; position the wide belt for a lateral glide with pelvic stabilization, avoiding the femoral neurovascular region.",
      "Apply a modest lateral glide and ask the patient to actively flex the hip within a pain-free improving range.",
      "Adjust the belt direction or stop if symptoms do not improve; never overpower a painful pinching sensation.",
      "Release the belt and immediately repeat hip flexion without assistance.",
      "Connect any useful change with graded hip strength and movement practice."
    ],
    "reassess": [
      "Same independent active hip flexion or squat",
      "Groin/hip pain and movement quality",
      "Ability to complete the target daily task without the belt"
    ],
    "mistakes": [
      "Pushing into a painful pinch because the belt feels strong.",
      "Claiming a lateral glide corrected a proven femoral-head displacement.",
      "Allowing the pelvis to rotate so hip movement gains are falsely measured."
    ],
    "safety": [
      "Avoid routine mobilization if fracture/stress fracture, recent dislocation, severe trauma, unstable joint or major neurological/vascular issues are suspected.",
      "Do not compress femoral vessels/nerve with the belt or force symptomatic end-range flexion.",
      "Refer for further evaluation when severe groin pain, night/rest pain or persistent unremitting symptoms suggest non-routine pathology."
    ],
    "visualCue": "Controlled lateral proximal-femur glide + patient active hip flexion → independent hip-flexion retest."
  },
  {
    "slug": "mfr-thoracic-paraspinals",
    "techniqueSlug": "myofascial-release",
    "techniqueName": "Myofascial Release",
    "region": "Thoracic",
    "title": "Thoracic Paraspinal MFR — Broad, Sustained Contact",
    "applicability": "Detailed",
    "clinicalUse": [
      "A person says their upper back 'feels like cardboard' when twisting to reach the back seat. You check thoracic rotation and rib sensitivity rather than assuming fascia is adhered.",
      "A slow, tolerable soft-tissue contact may be used as a short adjunct when it helps comfortable movement, not as proof of tissue remodelling.",
      "Compare the same seated thoracic rotation and breathing comfort after the trial."
    ],
    "patientPosition": [
      "Prone with the head and rib cage supported, or side-lying if prone is uncomfortable or affects breathing.",
      "Allow the shoulder girdle to relax and ensure no pressure restricts respiration."
    ],
    "therapistPosition": [
      "Stand beside the upper/mid-thoracic region with a stable base; contact is broad enough to avoid digging at one rib.",
      "Maintain relaxed wrists and shift body weight gently rather than pressing with stiff thumbs."
    ],
    "stabilization": [
      "Support chest and head in a neutral comfortable line; ask the patient to breathe normally during contact.",
      "Stabilize with broad gentle contact rather than forced thoracic extension."
    ],
    "contact": [
      "Use palms or a supported cross-hand contact across the paraspinal/inter-scapular muscular region, lateral to the spinous processes.",
      "Avoid direct focused pressure over spinous processes, ribs that may be injured, or vulnerable medical/surgical sites."
    ],
    "forceDirection": [
      "For direct work, slowly take up the perceived soft-tissue slack with gentle opposing hand vectors over a broad area.",
      "For indirect work, follow an easier direction and wait without adding sudden thrust or painful stretch."
    ],
    "dosage": [
      "A gentle sustained contact for about 30–90 seconds can be a training example, with regular checks for comfort and breathing.",
      "There is no established optimal duration for fascial tissue change; retest rather than treating until an imagined release occurs."
    ],
    "steps": [
      "Measure the original seated thoracic rotation or comfortable upper-back reach before treatment.",
      "Screen trauma, rib fracture concern, unexplained chest pain, infection, osteoporosis-related vulnerability and neurological red flags.",
      "Support the chest and head comfortably in prone or side-lying while preserving easy breathing.",
      "Place broad contacts lateral to the spinous processes across a suitable paraspinal muscular region.",
      "Apply slow, low-force sustained load toward comfortable resistance or ease, using the selected direct/indirect approach.",
      "Monitor breathing and guarding; stop or reduce pressure if symptoms become unpleasant or spread.",
      "Return contact to neutral, repeat the target rotation, then practise controlled active thoracic mobility if helpful."
    ],
    "reassess": [
      "Seated thoracic rotation and back-seat reach",
      "Comfort during normal breathing",
      "Confidence during active thoracic extension/rotation"
    ],
    "mistakes": [
      "Treating a rib or vertebral spinous process like a muscle belly.",
      "Pressing harder when the patient holds their breath.",
      "Explaining a short-lived movement change as proof that fascia melted."
    ],
    "safety": [
      "Unexplained chest pain, dyspnea or serious cardiopulmonary symptoms warrant medical evaluation rather than manual therapy.",
      "Avoid suspected rib fracture, infection, recent unstable surgery or significant bone fragility.",
      "Stop for new neurological symptoms, marked chest discomfort or difficulty breathing during positioning."
    ],
    "visualCue": "Broad sustained paraspinal contact, breathing freely → retest seated upper-back rotation."
  }
];
