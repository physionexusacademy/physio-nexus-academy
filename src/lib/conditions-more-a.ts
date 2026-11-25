import type { TreatmentPlan } from "./treatment-plans.ts";
import type { TreatmentPlanGuide } from "./treatment-plan-guides.ts";

/**
 * Conditions & Treatment Guide: second batch (after surgery, spine, bone and joint disease).
 * Written in our own words from standard guidelines; each plan follows the surgeon's or physician's own instructions first.
 * The clinical lead should check the doses and cited sources before publication.
 */
export const plansA: TreatmentPlan[] = [
  {
    slug: "total-knee-replacement-rehabilitation",
    name: "Total Knee Replacement Rehabilitation",
    category: "Post-Operative Orthopaedics",
    summary: "Rehabilitation starts on the day of surgery or the day after: control swelling, regain full extension and early bending, rebuild the quadriceps and return to walking, stairs and daily life, following the surgeon's protocol.",
    assessment: ["Pain, swelling and wound status", "Knee extension and flexion range", "Quadriceps activation and strength", "Walking with an aid, stairs and transfers", "Calf and general warning signs (clot, infection)"],
    redFlags: ["Hot, red, swollen knee with fever or a leaking wound", "Hot, tender, swollen calf (possible clot)", "Chest pain or sudden breathlessness", "Sudden loss of weight-bearing or a knee that looks deformed", "Numbness or a cold, pale foot"],
    outcomeMeasures: ["Knee range of motion (extension and flexion)", "Timed up and go", "30-second chair stand", "KOOS or Oxford Knee Score", "NPRS"],
    modalities: ["Elevation and ice for comfort and swelling control if tolerated", "Compression garments as advised by the surgical team", "Cycling on a low-resistance bike once range allows"],
    manualTherapy: ["Gentle patellar mobility once the wound allows", "Soft-tissue work around the thigh and calf for comfort", "Avoid forceful stretching of the replaced knee unless the surgeon advises it"],
    exercises: ["Quadriceps sets and straight leg raises", "Heel slides and heel props for range", "Sit-to-stand and mini squats", "Step-ups, bridging and hamstring work", "Balance and gait retraining"],
    homePlan: ["Short, frequent walks with the prescribed aid", "Exercises several times a day in the early weeks", "Swelling control with elevation", "Know the warning signs and whom to call"],
    progression: ["Aim for full extension and about 90 degrees of bend in the first two weeks, then 110 to 120 over the following weeks", "Progress from short walks to longer outdoor walking and stairs", "Add load to strength exercises as comfort allows"],
    escalation: ["Urgent contact with the surgical team for infection, clot or chest symptoms", "Review with the surgeon if bending is not progressing or the knee stays stiff or painful"],
  },
  {
    slug: "total-hip-replacement-rehabilitation",
    name: "Total Hip Replacement Rehabilitation",
    category: "Post-Operative Orthopaedics",
    summary: "Early walking, the surgeon's hip precautions explained clearly, progressive hip strengthening and a return to daily activity, with attention to dislocation, infection and clot warning signs.",
    assessment: ["Surgical approach and the written precautions", "Pain, wound and swelling", "Transfers, walking aid and stairs", "Hip abductor and extensor strength", "Leg length and gait pattern"],
    redFlags: ["Sudden severe hip pain with a short, turned leg (possible dislocation)", "Hot, red wound or fever", "Hot, tender, swollen calf", "Chest pain or sudden breathlessness", "New foot numbness or weakness"],
    outcomeMeasures: ["Timed up and go", "30-second chair stand", "Harris Hip Score or Oxford Hip Score", "NPRS", "Walking distance"],
    modalities: ["Elevation and ice for comfort if tolerated", "Compression stockings as prescribed", "Raised seats and a reacher or long-handled aids to protect the hip in daily tasks"],
    manualTherapy: ["Gentle soft-tissue work around the thigh and buttock for comfort", "Scar mobility once healed", "Avoid forced end-range hip movements"],
    exercises: ["Gluteal sets and bridging", "Standing hip abduction and extension within the precautions", "Sit-to-stand and step-ups", "Balance work and gait retraining", "Cycling and walking progression"],
    homePlan: ["Written precautions and aids", "Short, frequent walks", "Daily exercises", "Safe dressing, toilet and car transfers"],
    progression: ["Progress the walking aid from frame to stick to none", "Increase walking distance and stairs", "Add resistance to hip strengthening as healing allows"],
    escalation: ["Urgent care for suspected dislocation, infection or clot", "Surgeon review for persistent limp, pain or instability"],
  },
  {
    slug: "rotator-cuff-repair-rehabilitation",
    name: "Rotator Cuff Repair Rehabilitation",
    category: "Post-Operative Orthopaedics",
    summary: "A staged programme protects the healing tendon first, then restores movement, strength and function; timing and loading follow the surgeon's protocol, which depends on the tear size and repair quality.",
    assessment: ["Surgeon's protocol, tear size and repair type", "Pain, sleep and wound status", "Passive and active range as permitted", "Scapular control and neck tension", "Function, work and sport demands"],
    redFlags: ["Signs of infection (heat, redness, fever, wound leakage)", "Sudden loss of active elevation or a pop with weakness (possible re-tear)", "Hot, swollen calf or chest pain", "Severe uncontrolled pain", "New numbness or weakness in the arm"],
    outcomeMeasures: ["DASH or QuickDASH", "Shoulder range of motion", "Constant-Murley or ASES score", "NPRS", "Patient-specific functional scale"],
    modalities: ["Sling use and positioning as instructed", "Cold or heat for comfort if tolerated", "TENS may be used for pain after screening"],
    manualTherapy: ["Gentle passive range within the permitted limits", "Soft-tissue work for the neck and upper back", "Avoid stretching into restricted ranges before the surgeon clears it"],
    exercises: ["Early elbow, wrist and hand movement", "Pendulum and passive range in the early weeks", "Active-assisted then active range", "Scapular control", "Progressive cuff and deltoid strengthening later"],
    homePlan: ["Sling and sleeping positions", "Daily range exercises", "Avoid lifting and pushing with the operated arm until cleared", "Gradual return to light daily use"],
    progression: ["Move from passive to active-assisted to active only when cleared", "Begin resistance exercise once healing and surgeon allow", "Return to lifting, work and sport in graded steps"],
    escalation: ["Contact the surgeon for suspected re-tear, infection or stiffness that is not improving", "Medical review for chest pain or calf swelling"],
  },
  {
    slug: "lumbar-spinal-stenosis",
    name: "Lumbar Spinal Stenosis",
    category: "Spine",
    summary: "Narrowing of the spinal canal can cause leg pain or heaviness with walking that eases with sitting or bending forward; exercise, walking programmes, posture strategies and education help most patients, and surgery is reserved for severe or progressive cases.",
    assessment: ["Walking tolerance and symptom behaviour (neurogenic claudication)", "Relief with sitting or forward bending", "Neurological screen of the legs", "Lumbar and hip movement", "Balance and falls risk"],
    redFlags: ["Loss of bladder or bowel control", "Saddle numbness", "Progressive leg weakness or foot drop", "Severe unremitting night pain or unexplained weight loss", "Fever with severe back pain"],
    outcomeMeasures: ["Walking distance or time", "Swiss Spinal Stenosis Questionnaire", "Oswestry Disability Index", "NPRS", "Timed up and go"],
    modalities: ["Heat for comfort if sensation is intact", "TENS may help short-term pain", "A walking aid or a stationary bike if standing walking is limited"],
    manualTherapy: ["Gentle lumbar and hip mobilisation for comfort", "Soft-tissue work for hip and thigh stiffness", "Avoid forceful extension techniques that provoke leg symptoms"],
    exercises: ["Walking in intervals and flexion-biased positions", "Stationary cycling (flexed posture)", "Core and hip strengthening", "Hip flexor and hamstring mobility", "Balance training"],
    homePlan: ["Daily walking with planned rests", "Stationary cycling for fitness", "Strengthening three times a week", "Sit or lean forward to settle symptoms"],
    progression: ["Lengthen walking time before intensity", "Progress hip and trunk strength", "Return to longer outings and hobbies in steps"],
    escalation: ["Urgent assessment for bladder or bowel change, saddle numbness or rapid weakness", "Specialist review if function remains poor after several months of good rehabilitation"],
  },
  {
    slug: "lumbar-spondylolisthesis",
    name: "Lumbar Spondylolisthesis",
    category: "Spine",
    summary: "Forward slip of one vertebra on another causes back and sometimes leg pain; most patients improve with activity modification, trunk and hip strengthening and graded return, with surgery for instability, severe nerve compression or failure of conservative care.",
    assessment: ["Age, grade of slip and cause (stress fracture versus degenerative)", "Pain pattern with extension and loading", "Neurological screen", "Hamstring tightness and gait", "Trunk and hip control"],
    redFlags: ["Loss of bladder or bowel control or saddle numbness", "Progressive leg weakness", "Severe night or constant pain", "Fever or unexplained weight loss", "Rapid increase in slip or deformity"],
    outcomeMeasures: ["Oswestry Disability Index", "NPRS", "Roland-Morris Disability Questionnaire", "Lumbar range of movement", "Function-specific tasks"],
    modalities: ["Heat for muscle comfort", "TENS as a short-term adjunct", "Bracing only when advised by the surgeon"],
    manualTherapy: ["Gentle hip and thoracic mobility", "Soft-tissue work for comfort", "Avoid aggressive end-range lumbar extension or rotation techniques"],
    exercises: ["Deep trunk and pelvic control", "Gluteal and hip strengthening", "Hamstring and hip flexor mobility", "Walking and low-impact aerobic training", "Graded return to sport with load management"],
    homePlan: ["Daily walking", "Trunk and hip strengthening three times a week", "Avoid repeated loaded extension if painful", "Education on staying active"],
    progression: ["Progress control to loaded tasks", "Graded return to running or sport", "Review symptoms and function at six to twelve weeks"],
    escalation: ["Urgent referral for cauda equina signs or progressive deficit", "Surgical opinion for persistent disabling symptoms or instability"],
  },
  {
    slug: "osteoporosis",
    name: "Osteoporosis",
    category: "Bone Health & Ageing",
    summary: "Exercise builds and protects bone, strengthens muscle and reduces falls; the programme includes weight-bearing, resistance and balance training, safe movement advice for the spine and coordination with the medical team for medicines, calcium and vitamin D.",
    assessment: ["Fracture history, bone density result and falls history", "Height loss and spinal posture", "Back pain pattern (new sudden pain)", "Leg strength, balance and gait", "Medicines and general health"],
    redFlags: ["Sudden new back pain after minor strain (possible vertebral fracture)", "A fall with severe pain, deformity or inability to bear weight", "Night or rest pain that is not mechanical", "Unexplained weight loss", "New leg weakness or numbness"],
    outcomeMeasures: ["Timed up and go", "30-second chair stand", "Berg Balance Scale or single-leg stand", "Height and posture", "NPRS"],
    modalities: ["Heat for muscle comfort", "A supportive brace only when prescribed", "Walking aids or hip protectors in selected high-risk people"],
    manualTherapy: ["Gentle soft-tissue work", "Avoid forceful spinal manipulation or end-range loaded techniques", "Mobilise the hip and thoracic spine very gently only if needed"],
    exercises: ["Brisk walking and stair climbing", "Progressive resistance training (legs, hips, back, arms)", "Hip hinge and back extension in standing", "Balance and tandem exercises", "Safe impact exercise if the spine is strong"],
    homePlan: ["Daily walking", "Strength sessions two to three times a week", "Balance practice near support", "Safe bending and lifting"],
    progression: ["Increase resistance and impact gradually", "Progress balance difficulty", "Review fracture risk and falls with the doctor"],
    escalation: ["Medical review for sudden back pain, falls with injury or new neurological signs", "Coordination with the physician for medicines, calcium and vitamin D"],
  },
  {
    slug: "rheumatoid-arthritis",
    name: "Rheumatoid Arthritis",
    category: "Inflammatory Joint Disease",
    summary: "Physiotherapy supports medical treatment with joint protection, range of movement, strengthening, aerobic exercise, pacing, hand and foot care and education about flares, adjusting the programme to disease activity.",
    assessment: ["Joint pain, swelling and morning stiffness", "Disease activity as reported by the medical team", "Hand function, grip and foot posture", "Fatigue and daily activities", "Aerobic fitness and muscle strength"],
    redFlags: ["Hot, very swollen single joint with fever (possible infection)", "New neck pain with arm weakness, numbness or gait change (possible cervical instability)", "Sudden loss of finger extension (possible tendon rupture)", "Unexplained weight loss or persistent fever", "Chest pain or breathlessness"],
    outcomeMeasures: ["Health Assessment Questionnaire", "Grip strength", "Joint counts as reported by the rheumatology team", "Morning stiffness duration", "Fatigue and pain scales"],
    modalities: ["Heat for stiffness and cold for hot joints if tolerated", "Splints for resting or functional support when prescribed", "Paraffin wax for hands when suitable"],
    manualTherapy: ["Gentle joint mobility within comfort", "Soft-tissue work for muscle tension", "Avoid forceful stretching of inflamed joints and the neck"],
    exercises: ["Gentle range exercises each day", "Low-impact aerobic training", "Progressive resistance training between flares", "Hand function exercises", "Balance and walking practice"],
    homePlan: ["Daily movement and pacing", "Joint protection strategies", "Flare plan: relative rest and gentle movement", "Footwear and hand aids"],
    progression: ["Increase exercise in quiet periods", "Reduce intensity but keep moving in flares", "Review with the rheumatology team for medicines"],
    escalation: ["Urgent medical review for suspected joint infection, cervical instability or tendon rupture", "Rheumatology review for persistent flares or new joint damage"],
  },
];

export const guidesA: Record<string, TreatmentPlanGuide> = {
  "total-knee-replacement-rehabilitation": {
    clinicalLogic: [
      "Early movement and weight-bearing speed recovery and lower complications, but the surgeon's protocol sets the limits.",
      "The three early priorities are swelling control, full extension and bending range, because stiffness is far easier to prevent than to treat.",
      "Quadriceps strength drives gait, stairs and stability, so strength training continues for at least three months.",
    ],
    firstSession: [
      "Read the operation note and protocol, check pain, wound, swelling and calf, and record range and walking.",
      "Mobilise with the aid, teach transfers and the first exercises.",
      "Agree weekly goals and teach the warning signs and whom to call.",
    ],
    exerciseDose: [
      "Quadriceps sets: 10 holds of 5 seconds, several times a day.",
      "Heel slides and heel props: 10 to 15 repetitions, 3 to 4 times a day in the early weeks.",
      "Sit-to-stand: 2 to 3 sets of 8 to 12 repetitions once able.",
      "Step-ups, bridging and cycling: 2 to 3 sets, increasing load as comfort allows.",
    ],
    manualApplication: [
      "Patellar glides and gentle soft-tissue techniques only after the wound has healed.",
      "Avoid forced bending beyond comfort; follow the surgeon on manipulation.",
    ],
    modalityDose: [
      "Elevate and use cold for 10 to 15 minutes with a barrier if it helps comfort.",
      "Compression and pain medicine timing as advised by the surgical team.",
    ],
    progressionRules: [
      "Aim for full extension and about 90 degrees of bend at two weeks, then 110 to 120 over the next weeks.",
      "Move from aid to stick to none as strength and confidence allow.",
      "Review at six and twelve weeks, and refer if progress stalls.",
    ],
    commonMistakes: [
      "Stopping exercises once the pain eases and leaving the quadriceps weak.",
      "Letting the knee stay flexed over a pillow and losing extension.",
      "Missing signs of infection or clot.",
      "Forcing range against heavy pain and swelling.",
    ],
    patientEducation: [
      "Explain the weekly goals and that swelling and some pain are normal for weeks.",
      "Teach the warning signs: hot red knee, fever, calf swelling, chest pain.",
      "Encourage daily walking and exercises beyond the clinic sessions.",
    ],
  },
  "total-hip-replacement-rehabilitation": {
    clinicalLogic: [
      "Early walking lowers clot and chest complications; hip precautions protect the joint while soft tissues heal.",
      "Precautions depend on the surgical approach and surgeon, so always follow the written instructions and explain the reasons.",
      "Strength of the hip abductors and extensors determines gait, so progressive strengthening is the core of recovery.",
    ],
    firstSession: [
      "Read the operation note, approach and precautions; check pain, wound and calf.",
      "Teach bed, chair and toilet transfers and walking with the aid.",
      "Show the first exercises and the safe ways to dress and enter a car.",
    ],
    exerciseDose: [
      "Gluteal sets and bridging: 10 repetitions, 3 times a day.",
      "Standing hip abduction and extension: 10 repetitions each, 2 to 3 sets, within precautions.",
      "Sit-to-stand: 2 to 3 sets of 8 to 12 repetitions.",
      "Walking: several short walks a day, increasing distance weekly.",
    ],
    manualApplication: [
      "Gentle soft-tissue techniques around the thigh and buttock for comfort.",
      "Avoid end-range hip movements that conflict with the precautions.",
    ],
    modalityDose: [
      "Cold or elevation for 10 to 15 minutes if swollen and uncomfortable.",
      "Aids such as a raised toilet seat and reacher as advised.",
    ],
    progressionRules: [
      "Progress from frame to stick to none as balance and strength allow.",
      "Increase resistance and walking as healing allows.",
      "Review at six and twelve weeks with the surgeon's advice on returning to driving and sport.",
    ],
    commonMistakes: [
      "Teaching only the list of forbidden movements and frightening the patient into stillness.",
      "Ignoring the surgeon's precautions or approach.",
      "Missing calf swelling, chest pain or a shortened turned leg.",
      "Neglecting hip abductor strength and leaving a limp.",
    ],
    patientEducation: [
      "Explain the precautions and why they exist, with practical ways to protect the hip in daily tasks.",
      "Teach the signs of dislocation, infection and clot.",
      "Encourage daily walking and exercise.",
    ],
  },
  "rotator-cuff-repair-rehabilitation": {
    clinicalLogic: [
      "The repaired tendon needs protection while it heals, so early passive range is safe but active loading must wait for the surgeon's clearance.",
      "Stiffness and weakness both limit recovery, so the programme balances protection with timely, graded movement.",
      "Larger tears and weaker repairs need slower progression, so the protocol must be individual.",
    ],
    firstSession: [
      "Read the operation note and protocol; check pain, sleep, wound and sling use.",
      "Teach sling and sleeping positions and hand, wrist and elbow movement.",
      "Show the first permitted exercises and what to avoid.",
    ],
    exerciseDose: [
      "Early passive range and pendulums: 3 to 4 times a day for 5 to 10 minutes.",
      "Active-assisted range: 10 to 15 repetitions, 2 to 3 times a day when cleared.",
      "Active range and scapular control: 2 to 3 sets of 10 repetitions when cleared.",
      "Strengthening: 2 to 3 sets of 8 to 12 repetitions, starting light, usually after about 12 weeks.",
    ],
    manualApplication: [
      "Gentle passive range within the permitted limits.",
      "Soft-tissue work for the neck and upper back; avoid stretching the repair.",
    ],
    modalityDose: [
      "Cold or heat for 10 to 15 minutes for comfort with a barrier.",
      "TENS for pain after screening, as an adjunct.",
    ],
    progressionRules: [
      "Move from passive to active-assisted to active only when cleared.",
      "Introduce resistance after the surgeon's clearance.",
      "Return to lifting, work and sport in graded steps based on strength and function.",
    ],
    commonMistakes: [
      "Starting active lifting too early and straining the repair.",
      "Leaving the shoulder stiff because exercises were avoided.",
      "Ignoring neck and elbow stiffness from the sling.",
      "Not following the surgeon's protocol.",
    ],
    patientEducation: [
      "Explain the healing timeline and why the sling and limits matter.",
      "Teach sleeping positions and pain control.",
      "Explain that full recovery can take six to twelve months.",
    ],
  },
  "lumbar-spinal-stenosis": {
    clinicalLogic: [
      "Leg symptoms that start on walking and ease with sitting or bending forward suggest neurogenic claudication, unlike the pattern of vascular claudication.",
      "Most patients improve with exercise and activity modification; surgery is for severe, progressive or non-responding cases.",
      "Aerobic fitness, leg and trunk strength and walking tolerance are the main goals.",
    ],
    firstSession: [
      "Record walking time, symptom behaviour and the position that relieves it.",
      "Screen the legs neurologically and check pulses if vascular claudication is possible.",
      "Teach a short walking-and-rest strategy and a few starter exercises.",
    ],
    exerciseDose: [
      "Interval walking: walk until symptoms start, rest in a flexed position, repeat, aiming for 20 to 30 minutes in total.",
      "Stationary cycling: 15 to 30 minutes, 3 to 5 days a week.",
      "Hip and trunk strengthening: 2 to 3 sets of 8 to 12 repetitions, 2 to 3 days a week.",
      "Hamstring and hip flexor mobility: daily.",
    ],
    manualApplication: [
      "Gentle lumbar and hip mobilisation to ease stiffness.",
      "Soft-tissue work for the hips and thighs; avoid provocative extension.",
    ],
    modalityDose: [
      "Heat for 15 minutes before activity if comfortable.",
      "TENS as a short-term adjunct for pain.",
    ],
    progressionRules: [
      "Lengthen walking time before increasing speed.",
      "Progress hip and trunk strength and balance.",
      "Review function and walking after eight to twelve weeks.",
    ],
    commonMistakes: [
      "Telling patients to avoid walking altogether.",
      "Missing vascular causes or red flags.",
      "Using aggressive extension techniques.",
      "Not building fitness with cycling or other flexed-posture exercise.",
    ],
    patientEducation: [
      "Explain that symptoms are related to posture and that bending forward often eases them.",
      "Teach the warning signs of cauda equina syndrome.",
      "Encourage daily activity and weight management if relevant.",
    ],
  },
  "lumbar-spondylolisthesis": {
    clinicalLogic: [
      "Most slips are stable and improve with activity modification and strengthening; instability or nerve compression needs specialist care.",
      "In young athletes, a stress fracture of the pars needs rest from provoking loads and a graded return.",
      "Trunk and hip control and hamstring flexibility reduce stress on the slipped segment.",
    ],
    firstSession: [
      "Record the pain pattern, neurological findings and any imaging details.",
      "Check hamstring length, trunk control and gait.",
      "Start gentle control exercises and agree on activity changes.",
    ],
    exerciseDose: [
      "Deep trunk control: 5 to 10 repetitions with 5 to 10 second holds, daily.",
      "Gluteal and hip strengthening: 2 to 3 sets of 8 to 12 repetitions, 3 days a week.",
      "Hamstring and hip flexor mobility: daily.",
      "Walking or low-impact aerobic training: 20 to 30 minutes, 3 to 5 days a week.",
    ],
    manualApplication: [
      "Gentle hip and thoracic mobility.",
      "Soft-tissue work for comfort; avoid aggressive lumbar extension or rotation.",
    ],
    modalityDose: [
      "Heat for 15 minutes for muscle comfort.",
      "TENS as an adjunct.",
    ],
    progressionRules: [
      "Progress from control exercises to loaded and sport-specific tasks.",
      "In young athletes, return to sport in stages after pain-free control.",
      "Review at six to twelve weeks.",
    ],
    commonMistakes: [
      "Repeated loaded lumbar extension in an irritable spine.",
      "Missing neurological deficit or instability.",
      "Complete rest rather than modified activity.",
      "Ignoring hamstring tightness.",
    ],
    patientEducation: [
      "Explain that a slip does not mean the spine is fragile and that most people recover.",
      "Teach safe movement and staying active.",
      "Explain the signs that need urgent review.",
    ],
  },
  "osteoporosis": {
    clinicalLogic: [
      "Exercise should load bone, strengthen muscle and train balance, because falls cause most fractures.",
      "After a vertebral fracture, avoid loaded forward bending and twisting, and teach a hip hinge.",
      "Medicines, calcium and vitamin D are managed by the doctor; physiotherapy supports them with exercise and falls prevention.",
    ],
    firstSession: [
      "Record fracture and falls history, height loss and any new sudden pain.",
      "Test balance and leg strength with simple functional tests.",
      "Teach safe bending and lifting and the first exercises.",
    ],
    exerciseDose: [
      "Walking and stair climbing: 30 minutes on most days.",
      "Resistance training: 2 to 3 sets of 8 to 12 repetitions, 2 to 3 days a week, progressing load.",
      "Balance training: 10 to 15 minutes, 3 or more times a week, near support.",
      "Back extension in standing and posture exercises: daily.",
    ],
    manualApplication: [
      "Gentle soft-tissue work for comfort.",
      "Avoid manipulation and forceful end-range techniques.",
    ],
    modalityDose: [
      "Heat for muscle comfort.",
      "Balance aids and hip protectors in selected people at high risk of falls.",
    ],
    progressionRules: [
      "Increase resistance and impact gradually and safely.",
      "Progress balance from stable to challenging positions.",
      "Re-measure balance and strength every three months.",
    ],
    commonMistakes: [
      "Telling a person with osteoporosis to stop exercising.",
      "Prescribing sit-ups or loaded forward bending after a vertebral fracture.",
      "Neglecting falls prevention.",
      "Missing sudden new back pain.",
    ],
    patientEducation: [
      "Explain that bones respond to load and exercise is part of treatment.",
      "Teach safe movement and the importance of medicines, calcium and vitamin D as advised.",
      "Make the home safe and teach how to get up after a fall.",
    ],
  },
  "rheumatoid-arthritis": {
    clinicalLogic: [
      "Exercise is safe and beneficial in rheumatoid arthritis, but intensity must follow joint inflammation and fatigue.",
      "Joint protection and pacing reduce strain, and the team manages medicines.",
      "Neck, hand and foot involvement need particular care.",
    ],
    firstSession: [
      "Record joint symptoms, morning stiffness, fatigue and hand and foot function.",
      "Ask about disease activity and screen for neck symptoms.",
      "Teach gentle range exercises, pacing and joint protection.",
    ],
    exerciseDose: [
      "Range exercises: 5 to 10 repetitions each joint daily.",
      "Aerobic training: 20 to 30 minutes, 3 to 5 days a week at moderate effort in quiet periods.",
      "Resistance training: 2 to 3 sets of 8 to 12 repetitions, 2 days a week, avoiding flared joints.",
      "Hand exercises: short sessions several times a day.",
    ],
    manualApplication: [
      "Gentle joint mobility within comfort.",
      "Soft-tissue work for muscle tension; avoid the neck and inflamed joints.",
    ],
    modalityDose: [
      "Heat for 10 to 15 minutes for stiffness; cold for hot joints.",
      "Wax baths or splints as appropriate.",
    ],
    progressionRules: [
      "Increase gradually in quiet periods.",
      "Reduce intensity but keep moving in a flare.",
      "Review with the rheumatology team.",
    ],
    commonMistakes: [
      "Resting completely during flares.",
      "Forceful stretching of inflamed joints.",
      "Ignoring neck symptoms or sudden loss of finger extension.",
      "Overdoing exercise in quiet periods.",
    ],
    patientEducation: [
      "Explain joint protection, pacing and the role of medicines.",
      "Teach the flare plan.",
      "Encourage regular physical activity and fatigue management.",
    ],
  },
};
