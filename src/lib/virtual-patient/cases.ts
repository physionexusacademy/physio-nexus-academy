/**
 * Virtual Patient cases. Each patient hides one diagnosis; every test answers
 * consistently with it (exam.ts supplies healthy defaults for everything else).
 */
import type { PatientPosition } from "./engine";
import type { CaseFindings, HistoryId, MotionId, MuscleTestId, ReflexId, SpecialTestId, TapeId } from "./exam";
import type { CutaneousNerve, Dermatome } from "./anatomy";
import { MORE_CASES } from "./cases-more";

export type ExamKey =
  | `rom:${MotionId}` | `mmt:${MuscleTestId}` | `reflex:${ReflexId}` | `special:${SpecialTestId}`
  | `sensation:${Dermatome | CutaneousNerve}` | `palpate:${string}` | `tape:${TapeId}` | "vitals";

type Line = { en: string; ur: string };
export type VirtualCase = {
  id: string;
  diagnosis: string;
  patient: { name: string; age: number; job: string };
  referral: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  area: string;
  start: PatientPosition;
  history: Partial<Record<HistoryId, Line>>;
  findings: CaseFindings;
  key: { history: HistoryId[]; exam: ExamKey[]; redFlag?: string };
  questions: { diagnosis: { options: string[]; answer: number; why: string }; plan: { options: string[]; answer: number; why: string } };
  teaching: string[];
};

const L = (en: string, ur: string): Line => ({ en, ur });
const ALL_DERMATOMES: Dermatome[] = ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "L1", "L2", "L3", "L4", "L5", "S1", "S2"];

export const DEFAULT_ANSWER = L("No, nothing like that.", "Nahi, aisa kuch nahi.");
export const CONSENT_ANSWER = L("Yes, of course — please go ahead.", "Ji bilkul, zaroor — please start karein.");

export const CASES: VirtualCase[] = [
  {
    id: "lumbar-l5",
    diagnosis: "Left L5 radiculopathy",
    patient: { name: "Imran Khan", age: 38, job: "motorbike delivery rider" },
    referral: "38-year-old man with low back pain spreading into the left leg for 3 weeks. Please assess and advise.",
    level: "Intermediate",
    area: "Lumbar spine",
    start: "standing",
    history: {
      complaint: L("Pain in my lower back that goes down my left leg, for three weeks.", "Teen weeks se lower back pain hai jo left leg mein neeche tak jata hai."),
      onset: L("I lifted a heavy box off my bike and felt a sharp pain in my back. Two days later it went down the leg.", "Bike se ek heavy box uthaya to back mein sharp pain hua. Do din baad pain leg mein chala gaya."),
      location: L("Back of the left buttock, outside of the calf, down to the top of my foot and big toe.", "Left buttock ke peeche se, calf ki outer side se hota hua foot ke upar aur big toe tak."),
      behaviour: L("Sitting on the bike and bending forward make it worse. Walking a little and lying down help.", "Bike par baithna aur aage jhukna pain barhata hai. Thora walk karun ya let jaun to relief milta hai."),
      night: L("Stiff for ten minutes in the morning. It wakes me only when I turn over.", "Subah das minute stiffness hoti hai. Raat ko sirf side change karne par neend khulti hai."),
      severity: L("Leg seven out of ten, back four.", "Leg mein 7, back mein 4."),
      neuro: L("Pins and needles on top of my foot, and my left foot slaps a bit when I walk fast.", "Foot ke upar tingling hoti hai, aur tez chalun to left foot slap karta hai."),
      bladder: L("No, the toilet is normal and no numbness there.", "Nahi, urine aur toilet bilkul normal hain, wahan koi numbness nahi."),
      redflags: L("No fever or weight loss. Never had cancer.", "Na fever hai, na weight loss. Cancer kabhi nahi hua."),
      pmh: L("I'm healthy. Sometimes I take paracetamol.", "Main healthy hoon. Kabhi kabhi Panadol le leta hoon."),
      previous: L("First time. The doctor gave me painkillers.", "Pehli dafa hua hai. Doctor ne painkillers di theen."),
      social: L("I deliver food, ten hours a day on the bike.", "Food delivery karta hoon, roz das ghante bike par."),
      goals: L("To ride my bike again without the leg pain.", "Bas leg pain ke baghair dobara bike chalana chahta hoon."),
    },
    findings: {
      observation: "Stands with a slight shift away from the left; walks with a mild left foot slap.",
      posture: { standing: { trunk: { abd: 4 }, "knee.left": { flex: 6 } } },
      strength: { "ehl.left": 3, "ankle-df.left": 4, "hip-abd.left": 4 },
      strengthNote: { "hip-abd.left": "He hitches his pelvis to help lift the leg.", "ehl.left": "The big toe lifts but gives way under light pressure." },
      sensation: [{ sides: ["left"], dermatomes: ["L5"], change: "reduced" }],
      special: {
        "slr.left": { positive: true, text: "At about 40° he says: “That's my pain — shooting down to my foot!” It worsens when you dorsiflex the ankle. Positive." },
        "slump.left": { positive: true, text: "Reproduces his leg pain; it eases when he lifts his head. Positive." },
      },
    },
    key: { history: ["onset", "location", "neuro", "bladder", "redflags"], exam: ["mmt:ehl", "mmt:ankle-df", "mmt:hip-abd", "sensation:L5", "reflex:achilles", "special:slr"] },
    questions: {
      diagnosis: { options: ["Left L5 radiculopathy (L4–L5 disc)", "Common fibular nerve palsy", "Left S1 radiculopathy", "Piriformis syndrome", "Cauda equina syndrome"], answer: 0, why: "Weak big-toe extension and dorsiflexion, reduced sensation on the top of the foot — and weak hip abduction, which the fibular nerve does not supply. SLR positive at 40°, ankle reflex normal (S1 spared)." },
      plan: { options: ["Explain, stay active, nerve-friendly exercise and graded return to riding; review in 1–2 weeks and refer if weakness progresses", "Urgent same-day referral for an emergency MRI", "Strict bed rest for two weeks", "Daily lumbar manipulation"], answer: 0, why: "No red flags. Most radiculopathies settle with active care; progressive weakness or cauda equina signs would change the plan." },
    },
    teaching: ["Hip abduction separates L5 root from fibular nerve.", "SLR positive below 60–70° with distal symptoms is significant.", "Always ask about bladder, bowel and saddle sensation in back pain with leg symptoms."],
  },
  {
    id: "cauda-equina",
    diagnosis: "Cauda equina syndrome",
    patient: { name: "Farhan Ali", age: 45, job: "warehouse loader" },
    referral: "45-year-old man with severe low back pain and bilateral leg pain for 2 days.",
    level: "Expert",
    area: "Lumbar spine",
    start: "standing",
    history: {
      complaint: L("Terrible back pain for two days, and now both legs hurt.", "Do din se back mein bohat severe pain hai, aur ab dono legs mein bhi."),
      onset: L("I was lifting flour sacks two days ago.", "Do din pehle warehouse mein aate ki boriyan utha raha tha."),
      location: L("Both buttocks and down the backs of both legs to my heels.", "Dono buttocks se dono legs ke peeche heel tak."),
      behaviour: L("Everything hurts — I can't find a comfortable position.", "Har position mein pain hai, koi comfortable position nahi milti."),
      severity: L("Nine out of ten.", "Nau, out of ten."),
      neuro: L("The soles of both feet feel numb, and between my legs feels strange — numb.", "Dono feet ke talwe numb hain, aur legs ke beech wali jagah ajeeb si numb lag rahi hai."),
      bladder: L("Since this morning I can't pass urine properly — I have to strain and I didn't feel the need to go.", "Aaj subah se urine theek se pass nahi ho raha — zor lagana parta hai, aur urge bhi feel nahi hua."),
      redflags: L("No fever. No weight loss.", "Fever nahi hai, weight bhi kam nahi hua."),
      pmh: L("Nothing, I'm usually healthy.", "Kuch nahi, usually healthy hoon."),
      social: L("I load trucks at a warehouse.", "Warehouse mein trucks load karta hoon."),
    },
    findings: {
      observation: "Walks slowly and stiffly, clearly distressed.",
      strength: { "ankle-pf.left": 4, "ankle-pf.right": 4, "ehl.left": 4, "ehl.right": 4 },
      reflexes: { "achilles.left": "1+", "achilles.right": "0" },
      sensation: [{ sides: ["left", "right"], dermatomes: ["S1", "S2"], change: "reduced" }],
      special: {
        "slr.left": { positive: true, text: "Back and leg pain at 45°. Positive." },
        "slr.right": { positive: true, text: "Back and leg pain at 40°. Positive." },
      },
    },
    key: { history: ["bladder", "neuro", "onset"], exam: ["reflex:achilles", "sensation:S1", "mmt:ankle-pf", "special:slr"], redFlag: "Urinary retention with saddle numbness and bilateral leg signs = cauda equina syndrome — an emergency." },
    questions: {
      diagnosis: { options: ["Cauda equina syndrome (large central disc)", "Bilateral S1 radiculopathy — manage conservatively", "Peripheral neuropathy", "Non-specific mechanical low back pain"], answer: 0, why: "Bilateral leg symptoms, saddle numbness and painless urinary retention with reduced ankle reflexes and S1–S2 sensory loss." },
      plan: { options: ["Emergency referral today for MRI and spinal surgical assessment", "Start physiotherapy and review next week", "Prescribe a back brace", "Bed rest and painkillers"], answer: 0, why: "Every hour counts: delay risks permanent bladder, bowel and sexual dysfunction." },
    },
    teaching: ["Ask every back-pain patient about bladder, bowel and saddle sensation.", "Painless retention is a late, serious sign.", "Bilateral sciatica is a warning sign by itself."],
  },
  {
    id: "c6-radiculopathy",
    diagnosis: "Right C6 radiculopathy",
    patient: { name: "Bilal Ahmed", age: 50, job: "accountant" },
    referral: "50-year-old man with neck pain and right arm symptoms for a month.",
    level: "Advanced",
    area: "Cervical spine",
    start: "sitting",
    history: {
      complaint: L("Neck pain spreading into my right arm for about a month.", "Ek month se neck pain hai jo right arm mein jata hai."),
      onset: L("It came on slowly during tax season — long hours at the computer.", "Tax season mein computer par lambe ghante kaam karte hue aahista aahista start hua."),
      location: L("Right side of the neck, outer arm and forearm, into my thumb and index finger.", "Neck ki right side, arm aur forearm ki outer side se thumb aur index finger tak."),
      behaviour: L("Looking up and turning my head to the right make the arm worse. Resting my hand on my head eases it.", "Upar dekhun ya head right side ghumaun to arm pain barhta hai. Hand sar par rakhun to relief milta hai."),
      night: L("It's sore at night if I sleep on too many pillows.", "Zyada pillows par sooun to raat ko pain hota hai."),
      severity: L("Arm six out of ten.", "Arm mein 6."),
      neuro: L("My thumb and index finger tingle, and gripping a pen feels weaker.", "Thumb aur index finger mein tingling hoti hai, aur pen pakarne mein grip weak lagti hai."),
      redflags: L("No, nothing like that.", "Nahi, aisa kuch nahi."),
      pmh: L("High blood pressure — I take amlodipine.", "BP hai — amlodipine leta hoon."),
      social: L("I'm an accountant, at a desk all day.", "Accountant hoon, saara din desk par."),
      goals: L("Work at my computer without the arm pain.", "Arm pain ke baghair computer par kaam karna."),
    },
    findings: {
      strength: { "wrist-ext.right": 4, "elbow-flex.right": 4 },
      reflexes: { "biceps.right": "1+", "brachioradialis.right": "1+" },
      sensation: [{ sides: ["right"], dermatomes: ["C6"], change: "reduced" }],
      special: { "spurling.right": { positive: true, text: "Reproduces burning down the arm into his right thumb. Positive." } },
      vitals: { hr: 76, bp: "138/86", rr: 14, spo2: 98, temp: 36.7 },
    },
    key: { history: ["location", "neuro", "behaviour", "redflags"], exam: ["special:spurling", "reflex:brachioradialis", "reflex:biceps", "mmt:wrist-ext", "sensation:C6"] },
    questions: {
      diagnosis: { options: ["Right C6 radiculopathy (C5–C6 disc/foramen)", "Carpal tunnel syndrome", "Cervical myelopathy", "Rotator cuff tear", "Thoracic outlet syndrome"], answer: 0, why: "Weak wrist extension and elbow flexion, reduced biceps and brachioradialis reflexes, C6 sensory loss including the forearm, and a positive Spurling's test. No UMN signs (not myelopathy)." },
      plan: { options: ["Education, neural mobility and neck exercises, work-station advice; review and refer if weakness worsens", "Emergency referral today", "Wrist splint only", "Immobilise the arm in a sling"], answer: 0, why: "A stable radiculopathy without UMN signs is managed actively; monitor strength." },
    },
    teaching: ["C5–C6 disc → C6 root (cervical roots exit above their vertebra).", "Reflex + myotome + dermatome together localise the level.", "Check for UMN signs to rule out myelopathy."],
  },
  {
    id: "carpal-tunnel",
    diagnosis: "Right carpal tunnel syndrome",
    patient: { name: "Usman Tariq", age: 52, job: "tailor" },
    referral: "52-year-old tailor with right hand tingling at night for 3 months.",
    level: "Intermediate",
    area: "Wrist and hand",
    start: "sitting",
    history: {
      complaint: L("My right hand tingles and wakes me up at night.", "Right hand mein tingling hoti hai aur raat ko neend se utha deti hai."),
      onset: L("About three months ago, slowly getting worse.", "Taqreeban teen months pehle, aur aahista aahista barh rahi hai."),
      location: L("Thumb, index and middle fingers. Not the little finger.", "Thumb, index aur middle finger mein. Little finger mein nahi."),
      behaviour: L("Long sewing sessions and riding my scooter. Shaking my hand helps.", "Lambi silai aur scooter chalane se. Hand jhatkun to relief milta hai."),
      night: L("It wakes me two or three times a night — I shake it out.", "Raat mein do teen dafa utha deti hai — phir hand jhatakta hoon."),
      neuro: L("My fingertips feel numb and I've started dropping needles.", "Fingertips numb lagti hain aur needles hand se girne lagi hain."),
      pmh: L("Diabetes for eight years — I take metformin.", "Aath saal se diabetes hai — metformin leta hoon."),
      social: L("I'm a tailor, sewing most of the day.", "Tailor hoon, din bhar silai karta hoon."),
      goals: L("Sleep through the night and keep sewing.", "Raat ko poori neend aur silai continue rakhna."),
    },
    findings: {
      strength: { "grip.right": 4 },
      sensation: [{ sides: ["right"], nerves: ["median"], change: "reduced" }],
      special: {
        "phalen.right": { positive: true, text: "Within 30 seconds: “Tingling in my thumb, index and middle fingers.” Positive on the right." },
        phalen: { positive: true, text: "Within 30 seconds the right thumb, index and middle fingers tingle; the left is fine. Positive (right)." },
        "tinel-wrist.right": { positive: true, text: "Tapping the carpal tunnel sends tingling into his fingers. Positive." },
      },
    },
    key: { history: ["location", "night", "neuro", "pmh"], exam: ["special:phalen", "special:tinel-wrist", "sensation:median", "special:spurling"] },
    questions: {
      diagnosis: { options: ["Right carpal tunnel syndrome", "Right C6 radiculopathy", "Ulnar neuropathy at the elbow", "De Quervain's tenosynovitis"], answer: 0, why: "Night symptoms in the median distribution (palmar thumb, index, middle; little finger and back of the hand spared), positive Phalen's and Tinel's, negative Spurling's, diabetes as a risk factor." },
      plan: { options: ["Night splint in wrist neutral, activity modification and nerve gliding; refer for nerve conduction if persistent or weak", "Emergency surgery", "Cervical traction", "No treatment needed"], answer: 0, why: "Mild-moderate CTS responds to splinting; wasting or constant numbness warrants a surgical opinion." },
    },
    teaching: ["Map the sensory loss: nerve territory vs dermatome.", "Always screen the neck (Spurling's) — double crush is possible.", "Diabetes increases CTS risk."],
  },
  {
    id: "fibular-palsy",
    diagnosis: "Right common fibular nerve palsy",
    patient: { name: "Kashif Mehmood", age: 30, job: "car mechanic" },
    referral: "30-year-old man with right foot drop noticed after removal of a below-knee plaster.",
    level: "Advanced",
    area: "Lower limb nerves",
    start: "standing",
    history: {
      complaint: L("My right foot drags and slaps when I walk.", "Right foot ghasitta hai aur chalte hue slap karta hai."),
      onset: L("I noticed it the day the plaster came off, last week.", "Pichhle hafte jis din plaster utra, usi din notice kiya."),
      location: L("No back pain at all. The top of my foot and outside of my shin feel numb.", "Back pain bilkul nahi. Foot ke upar aur shin ki outer side par numbness hai."),
      neuro: L("Numb on the top of the foot; I can't lift my foot up.", "Foot upar se numb hai, aur main foot upar utha hi nahi sakta."),
      bladder: L("No, all normal.", "Nahi, sab normal hai."),
      previous: L("I broke my ankle six weeks ago. The plaster went up to my knee — it felt tight at the top.", "Chhe weeks pehle ankle fracture hua tha. Plaster knee tak tha — upar se bohat tight lagta tha."),
      social: L("Car mechanic, kneeling and squatting a lot.", "Car mechanic hoon, kaafi der knees ke bal aur squat karke kaam karta hoon."),
    },
    findings: {
      observation: "High-stepping gait on the right to clear the foot.",
      posture: { supine: { "ankle.right": { flex: -28 } }, sitting: { "ankle.right": { flex: -25 } }, prone: { "ankle.right": { flex: -15 } } },
      strength: { "ankle-df.right": 1, "ehl.right": 1 },
      strengthNote: { "ankle-df.right": "Only a flicker in tibialis anterior.", "ehl.right": "A flicker, no movement." },
      rom: { "ankle-df.right": { active: 0, passive: 15 } },
      sensation: [{ sides: ["right"], nerves: ["superficial-fibular", "deep-fibular"], change: "reduced" }],
      tender: [{ side: "right", landmarks: ["fibular-head"], text: "“That's tender — that's where the plaster pressed.”" }],
    },
    key: { history: ["onset", "previous", "location"], exam: ["mmt:ankle-df", "mmt:ehl", "mmt:hip-abd", "special:slr", "sensation:superficial-fibular", "palpate:fibular-head"] },
    questions: {
      diagnosis: { options: ["Common fibular nerve palsy at the fibular neck", "Right L5 radiculopathy", "Stroke", "Peripheral polyneuropathy"], answer: 0, why: "Dorsiflexion and EHL 1/5 with numbness in the fibular territory, but normal hip abduction, normal reflexes, negative SLR and no back pain — after a tight plaster at the fibular neck." },
      plan: { options: ["Ankle-foot orthosis, protect the nerve from pressure, maintain range and strengthen; nerve studies if no recovery in 6–12 weeks", "Emergency spinal MRI", "Re-apply a below-knee plaster", "Bed rest"], answer: 0, why: "Compression neuropraxia usually recovers; support function and monitor." },
    },
    teaching: ["Normal hip abduction rules out L5.", "The fibular nerve winds around the fibular neck — vulnerable to plasters and leg crossing.", "Foot drop: compare root, nerve and central causes."],
  },
  {
    id: "rotator-cuff-tear",
    diagnosis: "Right supraspinatus tear",
    patient: { name: "Asif Raza", age: 58, job: "house painter" },
    referral: "58-year-old man unable to lift the right arm after a fall 3 weeks ago.",
    level: "Intermediate",
    area: "Shoulder",
    start: "sitting",
    history: {
      complaint: L("My right shoulder hurts and I can't lift my arm up properly.", "Right shoulder mein pain hai aur arm theek se upar nahi uthta."),
      onset: L("I fell off a ladder three weeks ago onto my outstretched arm.", "Teen weeks pehle ladder se gira, arm phaila hua tha."),
      location: L("Outside of the shoulder, down towards the elbow.", "Shoulder ki outer side, elbow ki taraf jata hai."),
      behaviour: L("Lifting the arm and reaching overhead. Lying on that side.", "Arm upar uthana aur overhead reach karna. Usi side par letna."),
      night: L("It wakes me when I roll onto it.", "Us side par turn karun to neend khul jaati hai."),
      severity: L("Seven out of ten when I lift.", "Uthate waqt 7."),
      neuro: L("No tingling.", "Koi tingling nahi."),
      social: L("I paint houses — I can't reach the ceilings now.", "Gharon mein paint karta hoon — ab arm ceiling tak nahi jata."),
      goals: L("Back to painting ceilings.", "Dobara ceiling paint karna."),
    },
    findings: {
      rom: {
        "shoulder-abduction.right": { active: 70, passive: 175, pain: "Painful from 60° as he tries to lift" },
        "shoulder-flexion.right": { active: 90, passive: 170, pain: "Painful lifting" },
      },
      strength: { "shoulder-abd.right": 3 },
      painOnResistance: { "shoulder-abd.right": "Sharp pain at the outer shoulder." },
      special: {
        "empty-can.right": { positive: true, text: "Weak and painful — the arm gives way. Positive." },
        "hawkins.right": { positive: true, text: "Pain in the outer shoulder on internal rotation. Positive." },
        "drop-arm.right": { positive: true, text: "The arm drops suddenly from about 90°. Positive." },
      },
      tender: [
        { side: "right", landmarks: ["ac-joint"], text: "Pressing the AC joint itself: not tender." },
        { side: "right", landmarks: ["subacromial"], regions: ["Top of the shoulder"], text: "“Ouch — yes, there.” Tender just below the front edge of the acromion, over the supraspinatus insertion." },
      ],
    },
    key: { history: ["onset", "night"], exam: ["rom:shoulder-abduction", "mmt:shoulder-abd", "special:drop-arm", "special:empty-can"] },
    questions: {
      diagnosis: { options: ["Full-thickness supraspinatus (rotator cuff) tear", "Adhesive capsulitis (frozen shoulder)", "C5 radiculopathy", "Acromioclavicular joint sprain"], answer: 0, why: "Active elevation is lost but passive range is full (not frozen shoulder); abduction is weak and painful; drop arm positive after trauma at 58." },
      plan: { options: ["Refer for imaging and orthopaedic opinion within weeks (traumatic tear); meanwhile pain relief and gentle range", "Frozen-shoulder stretching only", "Cervical traction", "Sling for three months"], answer: 0, why: "Acute traumatic tears in active patients do better with early surgical assessment." },
    },
    teaching: ["Compare active and passive range: active loss with full passive = contractile/neurological problem.", "Drop arm + weakness after trauma = full-thickness tear.", "Frozen shoulder loses passive range too."],
  },
  {
    id: "frozen-shoulder",
    diagnosis: "Left adhesive capsulitis",
    patient: { name: "Saleem Akhtar", age: 54, job: "school teacher" },
    referral: "54-year-old teacher with a stiff, painful left shoulder for 4 months.",
    level: "Beginner",
    area: "Shoulder",
    start: "standing",
    history: {
      complaint: L("My left shoulder has become stiff and painful.", "Left shoulder stiff ho gaya hai aur pain karta hai."),
      onset: L("About four months ago, no injury — it came on slowly.", "Taqreeban chaar months pehle, koi injury nahi — aahista aahista hua."),
      location: L("Deep in the shoulder and upper arm.", "Shoulder ke andar deep, aur upper arm mein."),
      behaviour: L("Putting on a shirt, reaching behind my back, combing my hair.", "Shirt pehenna, hand back ke peeche le jana, baal banana."),
      night: L("It aches at night; I can't lie on it.", "Raat ko ache karta hai; us side par let nahi sakta."),
      neuro: L("No tingling or numbness.", "Koi tingling ya numbness nahi."),
      pmh: L("Diabetes for ten years, and thyroid tablets.", "Das saal se diabetes hai, aur thyroid ki tablets leta hoon."),
      social: L("I teach — writing on the board is hard now.", "Teacher hoon — ab board par likhna mushkil hai."),
      goals: L("Write on the board and dress easily.", "Board par likhna aur aasani se kapre pehenna."),
    },
    findings: {
      observation: "Holds the left arm close to the body, slightly internally rotated; reduced arm swing.",
      posture: { standing: { "shoulder.left": { rot: 18 }, "elbow.left": { flex: 15 } }, sitting: { "shoulder.left": { rot: 18 } } },
      rom: {
        "shoulder-er.left": { active: 15, passive: 20, endFeel: "Firm, capsular — early", pain: "Painful at the end of range" },
        "shoulder-abduction.left": { active: 80, passive: 85, endFeel: "Firm, capsular" },
        "shoulder-flexion.left": { active: 110, passive: 115, endFeel: "Firm, capsular" },
        "shoulder-ir.left": { active: 35, passive: 40, endFeel: "Firm, capsular" },
      },
    },
    key: { history: ["onset", "pmh", "night"], exam: ["rom:shoulder-er", "rom:shoulder-abduction", "rom:shoulder-ir"] },
    questions: {
      diagnosis: { options: ["Adhesive capsulitis (frozen shoulder)", "Rotator cuff tear", "Glenohumeral osteoarthritis", "C5 radiculopathy"], answer: 0, why: "Active AND passive range lost in a capsular pattern (external rotation most, then abduction, then internal rotation) with a firm end-feel, no trauma, in a man with diabetes and thyroid disease." },
      plan: { options: ["Education on the natural history, pain-guided mobility and stretching; consider an injection referral in the painful phase", "Urgent surgery", "Heavy resistance training", "Complete rest in a sling"], answer: 0, why: "Frozen shoulder is self-limiting; reassurance plus phase-appropriate mobility helps." },
    },
    teaching: ["Capsular pattern of the shoulder: ER > abduction > IR.", "Diabetes and thyroid disease raise the risk.", "Passive range is the key difference from a cuff tear."],
  },
  {
    id: "acl-tear",
    diagnosis: "Right ACL rupture",
    patient: { name: "Hamza Siddiqui", age: 22, job: "university footballer" },
    referral: "22-year-old footballer with a right knee injury 5 days ago.",
    level: "Intermediate",
    area: "Knee",
    start: "supine",
    history: {
      complaint: L("My right knee gave way playing football five days ago.", "Paanch din pehle football khelte hue right knee nikal gaya."),
      onset: L("I landed from a header and twisted — I felt a pop, couldn't carry on, and it swelled within an hour.", "Header ke baad land karte hue twist hua — 'pop' feel hua, khel continue nahi kar saka, aur ek ghante mein swelling aa gayi."),
      location: L("Deep inside the knee.", "Knee ke andar deep."),
      behaviour: L("Twisting and stairs — the knee feels like it might give way.", "Twist karna aur stairs — lagta hai knee phir give way kar jaega."),
      neuro: L("No numbness.", "Koi numbness nahi."),
      social: L("Student, I play football four times a week.", "Student hoon, hafte mein chaar dafa football khelta hoon."),
      goals: L("Back to football this season.", "Isi season football mein wapsi."),
    },
    findings: {
      observation: "Swollen right knee; walks with the knee held slightly bent.",
      posture: { standing: { "knee.right": { flex: 12 }, "hip.right": { flex: 6 } }, supine: { "knee.right": { flex: 18 }, "hip.right": { flex: 8 } } },
      rom: {
        "knee-flexion.right": { active: 105, passive: 110, endFeel: "Firm — limited by swelling", pain: "Tight and sore at the end" },
        "knee-extension.right": { active: -5, passive: 0, pain: "Lacks the last few degrees actively" },
      },
      strength: { "knee-ext.right": 4 },
      tape: { "knee-girth.right": 2.5, "thigh-girth.right": -0.8 },
      special: {
        "lachman.right": { positive: true, text: "Increased forward glide of the tibia with a soft, mushy end-feel. Positive." },
        "anterior-drawer-knee.right": { positive: true, text: "The tibia slides forward more than the left. Positive." },
      },
    },
    key: { history: ["onset"], exam: ["special:lachman", "tape:knee-girth", "special:mcmurray", "special:valgus-stress"] },
    questions: {
      diagnosis: { options: ["ACL rupture", "MCL sprain", "Patellar dislocation", "Isolated meniscal tear"], answer: 0, why: "Non-contact pivot with a pop and swelling within an hour (haemarthrosis), positive Lachman with a soft end-feel; valgus stress and McMurray negative." },
      plan: { options: ["Protect, settle the swelling, restore extension and quads; refer to sports orthopaedics for ACL management", "Return to football next week", "Immobilise in a cast for six weeks", "Emergency surgery today"], answer: 0, why: "Early rehab before any reconstruction gives better outcomes; it is not an emergency." },
    },
    teaching: ["Pop + rapid swelling = haemarthrosis: think ACL first.", "Lachman is the most sensitive ACL test.", "Measure effusion and quadriceps wasting."],
  },
  {
    id: "knee-oa",
    diagnosis: "Right knee osteoarthritis",
    patient: { name: "Ghulam Rasool", age: 64, job: "farmer" },
    referral: "64-year-old farmer with right knee pain for 2 years.",
    level: "Beginner",
    area: "Knee",
    start: "standing",
    history: {
      complaint: L("Both knees ache, the right is worse — for about two years.", "Dono knees mein pain rehta hai, right mein zyada — do saal se."),
      onset: L("It came on gradually, no injury.", "Aahista aahista, koi injury nahi."),
      location: L("Inside of the right knee.", "Right knee ki andar wali side."),
      behaviour: L("Sitting on the floor for prayer and climbing stairs. Rest helps.", "Namaz ke liye zameen par baithna aur stairs. Rest se behtar hota hai."),
      night: L("Stiff in the morning for about fifteen minutes, then it loosens.", "Subah pandrah minute stiffness hoti hai, phir khul jata hai."),
      severity: L("Five out of ten, seven on stairs.", "Paanch, stairs par saat."),
      pmh: L("High blood pressure.", "BP ka masla hai."),
      social: L("I work on my farm every day.", "Roz apne khet mein kaam karta hoon."),
      goals: L("Pray on the floor and keep working in my fields.", "Zameen par namaz parhna aur khet mein kaam karte rehna."),
    },
    findings: {
      observation: "Mild varus alignment of the right knee; slight antalgic gait.",
      posture: { standing: { "knee.right": { flex: 6 }, "knee.left": { flex: 3 } }, supine: { "knee.right": { flex: 6 } } },
      rom: {
        "knee-flexion.right": { active: 100, passive: 105, endFeel: "Hard with crepitus", pain: "Ache at the end of range" },
        "knee-extension.right": { active: -5, passive: -5, endFeel: "Hard" },
      },
      strength: { "knee-ext.right": 4 },
      tender: [
        { side: "right", landmarks: ["medial-joint-line"], regions: ["Inner knee"], text: "Tender along the medial joint line." },
        { side: "right", landmarks: ["lateral-joint-line"], text: "Lateral joint line: mildly uncomfortable, much less than the inside." },
      ],
      tape: { "knee-girth.right": 1 },
      special: { "mcmurray.right": { positive: false, text: "Coarse crepitus but no click or locking. Negative." } },
      vitals: { hr: 78, bp: "142/88", rr: 15, spo2: 97, temp: 36.6 },
    },
    key: { history: ["night", "behaviour", "location"], exam: ["rom:knee-flexion", "palpate:medial-joint-line", "mmt:knee-ext"] },
    questions: {
      diagnosis: { options: ["Knee osteoarthritis (medial compartment)", "Rheumatoid arthritis", "ACL tear", "Gout"], answer: 0, why: "Over 45, activity-related pain and morning stiffness under 30 minutes (NICE clinical criteria), medial joint-line tenderness, crepitus and limited flexion." },
      plan: { options: ["Education, weight and activity advice, quadriceps and hip strengthening and a walking programme", "Immediate total knee replacement referral", "Complete rest", "Regular steroid injections"], answer: 0, why: "Exercise and education are first-line for knee OA." },
    },
    teaching: ["OA can be diagnosed clinically — no X-ray needed for typical cases.", "Morning stiffness under 30 minutes favours OA over inflammatory arthritis.", "Strength training reduces pain."],
  },
  {
    id: "ankle-sprain",
    diagnosis: "Left lateral ankle sprain (ATFL)",
    patient: { name: "Danish Iqbal", age: 19, job: "club fast bowler" },
    referral: "19-year-old cricketer who twisted his left ankle yesterday.",
    level: "Beginner",
    area: "Ankle",
    start: "supine",
    history: {
      complaint: L("I twisted my left ankle yesterday playing cricket.", "Kal cricket khelte hue left ankle mur gaya."),
      onset: L("My foot rolled inwards as I landed in my delivery stride. It swelled up quickly.", "Bowling karte hue land kiya to foot andar ki taraf mur gaya. Jaldi swelling aa gayi."),
      location: L("Front and outside of the ankle.", "Ankle ke front aur outer side par."),
      behaviour: L("It hurts to walk, but I walked to the car on my own.", "Walk karne mein pain hai, lekin khud chal kar car tak gaya tha."),
      severity: L("Six out of ten walking.", "Chalte waqt 6."),
      neuro: L("No numbness.", "Koi numbness nahi."),
      previous: L("I sprained the same ankle last season.", "Pichhle season bhi yahi ankle mura tha."),
      goals: L("Bowl again in two weeks if possible.", "Ho sake to do weeks mein dobara bowling."),
    },
    findings: {
      observation: "Swelling and bruising over the outer left ankle.",
      posture: { supine: { "ankle.left": { flex: -12 } } },
      rom: { "ankle-df.left": { active: 8, passive: 10, pain: "Tight and painful at the front" }, "ankle-pf.left": { active: 35, passive: 40 } },
      tender: [
        { side: "left", landmarks: ["lateral-malleolus"], text: "Pressing the bony tip and back edge of the lateral malleolus: not tender." },
        { side: "left", landmarks: ["atfl"], regions: ["Lateral ankle", "Outer border of the foot"], text: "“Ouch — there!” Tender in the soft hollow just in front of the lateral malleolus (ATFL)." },
        { side: "left", landmarks: ["medial-malleolus"], text: "Not tender over the medial malleolus." },
      ],
      special: {
        "ankle-anterior-drawer.left": { positive: true, text: "More forward glide of the talus than on the right, with a soft end-feel. Positive." },
        "talar-tilt.left": { positive: false, text: "Slightly sore but similar to the right side. Negative." },
      },
    },
    key: { history: ["onset", "behaviour"], exam: ["palpate:lateral-malleolus", "palpate:medial-malleolus", "palpate:atfl", "special:ankle-anterior-drawer"] },
    questions: {
      diagnosis: { options: ["Lateral ankle sprain (ATFL) — no X-ray needed by the Ottawa rules", "Lateral malleolus fracture", "Achilles tendon rupture", "High ankle (syndesmosis) sprain"], answer: 0, why: "Inversion injury, ATFL tender but no bone tenderness at either malleolus and able to bear weight — Ottawa rules negative; positive anterior drawer." },
      plan: { options: ["PEACE & LOVE: protect, elevate, early loading, balance and proprioception training, graded return to bowling", "X-ray and a plaster for six weeks", "Complete rest for four weeks", "Surgical repair"], answer: 0, why: "Functional rehab with balance training reduces re-injury — important after a previous sprain." },
    },
    teaching: ["Ottawa ankle rules: bone tenderness at the posterior edge/tip of a malleolus or unable to weight-bear 4 steps → X-ray.", "Balance training prevents recurrence.", "Previous sprain is the biggest risk factor."],
  },
  {
    id: "stroke",
    diagnosis: "Right hemisphere stroke — left hemiparesis",
    patient: { name: "Rashid Mahmood", age: 66, job: "retired clerk" },
    referral: "66-year-old man, 3 weeks after an ischaemic stroke, for outpatient rehabilitation.",
    level: "Advanced",
    area: "Neurology",
    start: "sitting",
    history: {
      complaint: L("My left arm and leg became weak three weeks ago.", "Teen weeks pehle mera left arm aur left leg weak ho gaye."),
      onset: L("I woke up and couldn't move my left side. The hospital said it was a stroke.", "Subah utha to left side move nahi ho rahi thi. Hospital walon ne bataya stroke hai."),
      location: L("The whole left side of my body.", "Body ki poori left side."),
      neuro: L("My left side feels heavy and numb.", "Left side heavy aur numb lagti hai."),
      bladder: L("I'm managing the toilet now.", "Ab toilet khud manage kar leta hoon."),
      pmh: L("High blood pressure and diabetes. I take several tablets.", "BP aur diabetes hai. Kai medicines leta hoon."),
      social: L("Retired. I live with my son's family.", "Retired hoon. Bete ki family ke saath rehta hoon."),
      goals: L("Walk to the mosque on my own.", "Khud chal kar mosque tak jana."),
    },
    findings: {
      observation: "Left arm held flexed at the elbow; left face slightly droopy; walks with a stick, circumducting the left leg.",
      posture: {
        standing: { "shoulder.left": { abd: 6, rot: 25 }, "elbow.left": { flex: 80 }, "wrist.left": { flex: 35 }, "hand.left": { flex: 70 }, "knee.left": { flex: -3 }, trunk: { abd: -3 } },
        sitting: { "shoulder.left": { flex: 10, rot: 25 }, "elbow.left": { flex: 85 }, "wrist.left": { flex: 35 }, "hand.left": { flex: 70 } },
        supine: { "elbow.left": { flex: 60 }, "wrist.left": { flex: 30 }, "hand.left": { flex: 60 }, "ankle.left": { flex: -20, rot: 10 } },
      },
      strength: { "shoulder-abd.left": 2, "elbow-flex.left": 3, "elbow-ext.left": 2, "wrist-ext.left": 1, "grip.left": 2, "finger-abd.left": 1, "hip-flex.left": 3, "hip-abd.left": 2, "knee-ext.left": 3, "knee-flex.left": 2, "ankle-df.left": 1, "ehl.left": 1, "ankle-pf.left": 2 },
      strengthNote: { "shoulder-abd.left": "He hitches the shoulder with upper trapezius to lift the arm.", "hip-flex.left": "He leans back to help lift the thigh." },
      reflexes: { "biceps.left": "3+", "brachioradialis.left": "3+", "triceps.left": "3+", "patellar.left": "3+", "achilles.left": "4+" },
      signs: { "babinski.left": true, "hoffmann.left": true, "clonus.left": true },
      sensation: [{ sides: ["left"], dermatomes: ALL_DERMATOMES, change: "reduced" }],
      vitals: { hr: 82, bp: "158/94", rr: 16, spo2: 97, temp: 36.8 },
    },
    key: { history: ["onset", "pmh", "goals"], exam: ["reflex:babinski", "reflex:patellar", "reflex:hoffmann", "mmt:knee-ext", "vitals"] },
    questions: {
      diagnosis: { options: ["Right hemisphere stroke (UMN) — left hemiparesis", "Left L5 radiculopathy", "Guillain–Barré syndrome", "Peripheral neuropathy"], answer: 0, why: "Weakness of the whole left side with brisk reflexes, clonus, Babinski and Hoffmann positive and reduced sensation — an upper motor neuron pattern from a right-hemisphere lesion." },
      plan: { options: ["Neurological rehab: task-specific practice, balance and gait training, spasticity management; check BP before exercise", "Bed rest", "Lumbar traction", "Emergency spinal surgery"], answer: 0, why: "Early intensive task-specific rehab drives recovery; BP 158/94 needs monitoring." },
    },
    teaching: ["UMN signs: brisk reflexes, clonus, Babinski, Hoffmann, spasticity.", "Check vitals before exercising stroke survivors.", "Substitutions (hitching, leaning back) show weakness."],
  },
  {
    id: "myelopathy",
    diagnosis: "Degenerative cervical myelopathy",
    patient: { name: "Akbar Shah", age: 61, job: "retired engineer" },
    referral: "61-year-old man with clumsy hands and unsteady walking for 6 months.",
    level: "Expert",
    area: "Cervical spine",
    start: "standing",
    history: {
      complaint: L("My hands have become clumsy and I'm unsteady when I walk.", "Mere hands clumsy ho gaye hain aur chalte hue balance kharab hota hai."),
      onset: L("Slowly over about six months.", "Taqreeban chhe months mein aahista aahista."),
      location: L("Some neck stiffness. Mostly my hands and legs.", "Neck mein thori stiffness. Zyada masla hands aur legs mein hai."),
      neuro: L("Buttons are hard, my writing has changed, my fingers feel numb, and my legs feel stiff.", "Buttons lagana mushkil hai, handwriting change ho gayi hai, fingers numb hain, aur legs stiff lagti hain."),
      bladder: L("Sometimes I have to rush to the toilet now.", "Ab kabhi kabhi toilet ke liye jaldi bhaagna parta hai."),
      redflags: L("No weight loss or fever.", "Weight kam nahi hua, fever bhi nahi."),
      pmh: L("Nothing important.", "Koi khaas nahi."),
      social: L("Retired engineer; I used to repair watches as a hobby.", "Retired engineer hoon; shauq se watches repair karta tha."),
      goals: L("Repair watches again and walk without fear of falling.", "Dobara watches repair karna aur girne ke darr ke baghair chalna."),
    },
    findings: {
      observation: "Wide-based, slightly stiff gait.",
      posture: { standing: { "hip.left": { abd: 5 }, "hip.right": { abd: 5 }, "hand.left": { flex: 15 }, "hand.right": { flex: 15 } } },
      strength: { "finger-abd.left": 4, "finger-abd.right": 4, "grip.left": 4, "grip.right": 4 },
      reflexes: { "biceps.left": "3+", "biceps.right": "3+", "triceps.left": "3+", "triceps.right": "3+", "brachioradialis.left": "3+", "brachioradialis.right": "3+", "patellar.left": "3+", "patellar.right": "3+", "achilles.left": "3+", "achilles.right": "3+" },
      signs: { "hoffmann.left": true, "hoffmann.right": true, "babinski.left": true, "babinski.right": true },
      sensation: [{ sides: ["left", "right"], dermatomes: ["C6", "C7", "C8"], change: "reduced" }],
      special: {
        romberg: { positive: true, text: "He sways and has to step out within 10 seconds with eyes closed. Positive." },
        "spurling.left": { positive: false, text: "Neck stiffness only. Negative." },
        "spurling.right": { positive: false, text: "Neck stiffness only. Negative." },
      },
    },
    key: { history: ["neuro", "bladder", "onset"], exam: ["reflex:hoffmann", "reflex:babinski", "special:romberg", "mmt:finger-abd"], redFlag: "UMN signs in arms and legs with hand clumsiness and bladder urgency = cord compression." },
    questions: {
      diagnosis: { options: ["Degenerative cervical myelopathy (spinal cord compression)", "Bilateral carpal tunnel syndrome", "Peripheral neuropathy", "Normal ageing"], answer: 0, why: "Bilateral hand clumsiness and numbness, gait imbalance, bladder urgency, brisk reflexes everywhere with Hoffmann and Babinski positive." },
      plan: { options: ["Urgent referral to a spinal surgeon for MRI; avoid neck manipulation", "Bilateral wrist splints", "Cervical manipulation", "Reassure and discharge"], answer: 0, why: "Myelopathy progresses; early decompression protects function. Manipulation is contraindicated." },
    },
    teaching: ["Hand clumsiness + gait change in an older adult: test Hoffmann and Babinski.", "Bilateral 'carpal tunnel' plus UMN signs = think cord.", "Never manipulate a myelopathic neck."],
  },
  ...MORE_CASES,
];

export const caseById = (id: string) => CASES.find((c) => c.id === id);

/** A healthy patient for free practice (every test is normal). */
export const PRACTICE_CASE: VirtualCase = {
  id: "practice",
  diagnosis: "Healthy volunteer",
  patient: { name: "Ali (volunteer)", age: 28, job: "physiotherapy student" },
  referral: "Free practice: a healthy volunteer. Every finding is normal — practise your techniques and normal values.",
  level: "Beginner",
  area: "All regions",
  start: "standing",
  history: {
    complaint: L("Nothing — I'm here to help you practise.", "Kuch nahi — main aap ki practice ke liye aaya hoon."),
    social: L("I'm a physiotherapy student too.", "Main bhi physiotherapy student hoon."),
  },
  findings: {},
  key: { history: [], exam: [] },
  questions: { diagnosis: { options: ["Healthy"], answer: 0, why: "" }, plan: { options: ["None"], answer: 0, why: "" } },
  teaching: [],
};
