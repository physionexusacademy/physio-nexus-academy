/**
 * Virtual Patient cases. Each patient hides one diagnosis; every test answers
 * consistently with it (exam.ts supplies healthy defaults for everything else).
 */
import type { PatientPosition } from "./engine";
import type { CaseFindings, HistoryId, MotionId, MuscleTestId, ReflexId, SpecialTestId, TapeId } from "./exam";
import type { CutaneousNerve, Dermatome } from "./anatomy";

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
      complaint: L("Pain in my lower back that goes down my left leg, for three weeks.", "Teen hafte se kamar ka dard hai jo baayen taang mein jaata hai."),
      onset: L("I lifted a heavy box off my bike and felt a sharp pain in my back. Two days later it went down the leg.", "Bike se bhaari dabba uthaya to kamar mein tez dard hua. Do din baad taang mein chala gaya."),
      location: L("Back of the left buttock, outside of the calf, down to the top of my foot and big toe.", "Baayen kulhe ke peeche, pindli ke bahar, paon ke oopar aur angoothe tak."),
      behaviour: L("Sitting on the bike and bending forward make it worse. Walking a little and lying down help.", "Bike par baithna aur aage jhukna barhata hai. Thora chalna aur letna aaram deta hai."),
      night: L("Stiff for ten minutes in the morning. It wakes me only when I turn over.", "Subah das minute akran hoti hai. Sirf karwat badalne par aankh khulti hai."),
      severity: L("Leg seven out of ten, back four.", "Taang saat, kamar chaar."),
      neuro: L("Pins and needles on top of my foot, and my left foot slaps a bit when I walk fast.", "Paon ke oopar jhunjhunahat, aur tez chalne par baayan paon thappar sa maarta hai."),
      bladder: L("No, the toilet is normal and no numbness there.", "Nahi, peshab pakhana bilkul theek hai, wahan koi sunn-pan nahi."),
      redflags: L("No fever or weight loss. Never had cancer.", "Na bukhar, na wazan kam hua. Cancer kabhi nahi hua."),
      pmh: L("I'm healthy. Sometimes I take paracetamol.", "Sehatmand hoon. Kabhi kabhi Panadol leta hoon."),
      previous: L("First time. The doctor gave me painkillers.", "Pehli dafa hai. Doctor ne dard ki goliyan di theen."),
      social: L("I deliver food, ten hours a day on the bike.", "Khana deliver karta hoon, roz das ghante bike par."),
      goals: L("To ride my bike again without the leg pain.", "Taang ke dard ke baghair dobara bike chalana."),
    },
    findings: {
      observation: "Stands with a slight shift away from the left; walks with a mild left foot slap.",
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
      complaint: L("Terrible back pain for two days, and now both legs hurt.", "Do din se kamar mein shadeed dard hai, aur ab dono taangon mein bhi."),
      onset: L("I was lifting flour sacks two days ago.", "Do din pehle aate ki boriyan utha raha tha."),
      location: L("Both buttocks and down the backs of both legs to my heels.", "Dono kulhon se dono taangon ke peeche aedi tak."),
      behaviour: L("Everything hurts — I can't find a comfortable position.", "Har cheez se dard hota hai, koi aaram wali position nahi milti."),
      severity: L("Nine out of ten.", "Nau."),
      neuro: L("The soles of both feet feel numb, and between my legs feels strange — numb.", "Dono talwe sunn hain, aur tangon ke beech ajeeb sa sunn-pan hai."),
      bladder: L("Since this morning I can't pass urine properly — I have to strain and I didn't feel the need to go.", "Aaj subah se peshab theek se nahi aa raha — zor lagana parta hai, aur hajat mehsoos hi nahi hui."),
      redflags: L("No fever. No weight loss.", "Bukhar nahi, wazan kam nahi hua."),
      pmh: L("Nothing, I'm usually healthy.", "Kuch nahi, aam tor par sehatmand hoon."),
      social: L("I load trucks at a warehouse.", "Godaam mein truck load karta hoon."),
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
      complaint: L("Neck pain spreading into my right arm for about a month.", "Ek mahine se gardan ka dard daayen baazu mein jaata hai."),
      onset: L("It came on slowly during tax season — long hours at the computer.", "Tax season mein computer par lambe ghante kaam karte hue aahista aahista shuru hua."),
      location: L("Right side of the neck, outer arm and forearm, into my thumb and index finger.", "Gardan ka daayan hissa, baazu aur kalai ka bahar, angoothe aur shahadat ki ungli tak."),
      behaviour: L("Looking up and turning my head to the right make the arm worse. Resting my hand on my head eases it.", "Oopar dekhna aur sar daayen ghumana barhata hai. Haath sar par rakhne se aaram aata hai."),
      night: L("It's sore at night if I sleep on too many pillows.", "Zyada takiye par soun to raat ko dard hota hai."),
      severity: L("Arm six out of ten.", "Baazu chhe."),
      neuro: L("My thumb and index finger tingle, and gripping a pen feels weaker.", "Angootha aur shahadat ki ungli jhunjhunati hain, aur qalam pakarna kamzor lagta hai."),
      redflags: L("No, nothing like that.", "Nahi, aisa kuch nahi."),
      pmh: L("High blood pressure — I take amlodipine.", "Blood pressure hai — amlodipine leta hoon."),
      social: L("I'm an accountant, at a desk all day.", "Accountant hoon, saara din mez par."),
      goals: L("Work at my computer without the arm pain.", "Baazu ke dard ke baghair computer par kaam karna."),
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
      complaint: L("My right hand tingles and wakes me up at night.", "Daayan haath jhunjhunata hai aur raat ko jaga deta hai."),
      onset: L("About three months ago, slowly getting worse.", "Taqreeban teen mahine pehle, aahista aahista barh raha hai."),
      location: L("Thumb, index and middle fingers. Not the little finger.", "Angootha, shahadat aur beech wali ungli. Chhoti ungli nahi."),
      behaviour: L("Long sewing sessions and riding my scooter. Shaking my hand helps.", "Lambi silai aur scooter chalana. Haath jhatakne se aaram aata hai."),
      night: L("It wakes me two or three times a night — I shake it out.", "Raat mein do teen dafa jaga deta hai — haath jhatakta hoon."),
      neuro: L("My fingertips feel numb and I've started dropping needles.", "Ungliyon ke sire sunn lagte hain aur suiyan girne lagi hain."),
      pmh: L("Diabetes for eight years — I take metformin.", "Aath saal se sugar hai — metformin leta hoon."),
      social: L("I'm a tailor, sewing most of the day.", "Darzi hoon, din bhar silai karta hoon."),
      goals: L("Sleep through the night and keep sewing.", "Poori raat sona aur silai jaari rakhna."),
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
      complaint: L("My right foot drags and slaps when I walk.", "Daayan paon ghasitta hai aur chalte hue thappar maarta hai."),
      onset: L("I noticed it the day the plaster came off, last week.", "Pichhle hafte jis din plaster utra, usi din mehsoos hua."),
      location: L("No back pain at all. The top of my foot and outside of my shin feel numb.", "Kamar mein bilkul dard nahi. Paon ke oopar aur pindli ke bahar sunn-pan hai."),
      neuro: L("Numb on the top of the foot; I can't lift my foot up.", "Paon oopar se sunn hai; paon oopar nahi utha sakta."),
      bladder: L("No, all normal.", "Nahi, sab theek hai."),
      previous: L("I broke my ankle six weeks ago. The plaster went up to my knee — it felt tight at the top.", "Chhe hafte pehle takhna toota tha. Plaster ghutne tak tha — oopar se tang lagta tha."),
      social: L("Car mechanic, kneeling and squatting a lot.", "Car mechanic hoon, bohat ghutnon ke bal aur ukroo baithna parta hai."),
    },
    findings: {
      observation: "High-stepping gait on the right to clear the foot.",
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
      complaint: L("My right shoulder hurts and I can't lift my arm up properly.", "Daayan kandha dukhta hai aur baazu theek se oopar nahi uthta."),
      onset: L("I fell off a ladder three weeks ago onto my outstretched arm.", "Teen hafte pehle seerhi se gira, baazu phaila hua tha."),
      location: L("Outside of the shoulder, down towards the elbow.", "Kandhe ke bahar, kohni ki taraf."),
      behaviour: L("Lifting the arm and reaching overhead. Lying on that side.", "Baazu uthana aur oopar pahunchna. Usi karwat letna."),
      night: L("It wakes me when I roll onto it.", "Us taraf karwat lun to aankh khul jaati hai."),
      severity: L("Seven out of ten when I lift.", "Uthate waqt saat."),
      neuro: L("No tingling.", "Koi jhunjhunahat nahi."),
      social: L("I paint houses — I can't reach the ceilings now.", "Gharon mein rang karta hoon — ab chhat tak nahi pahunch sakta."),
      goals: L("Back to painting ceilings.", "Dobara chhat paint karna."),
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
      tender: [{ side: "right", landmarks: ["ac-joint"], regions: ["Top of the shoulder"], text: "Tender just below the front edge of the acromion." }],
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
      complaint: L("My left shoulder has become stiff and painful.", "Baayan kandha akar gaya hai aur dard karta hai."),
      onset: L("About four months ago, no injury — it came on slowly.", "Taqreeban chaar mahine pehle, koi chot nahi — aahista aahista hua."),
      location: L("Deep in the shoulder and upper arm.", "Kandhe ke andar aur oopri baazu mein."),
      behaviour: L("Putting on a shirt, reaching behind my back, combing my hair.", "Qameez pehenna, haath peeth ke peeche le jaana, baal banana."),
      night: L("It aches at night; I can't lie on it.", "Raat ko dard karta hai; us taraf nahi let sakta."),
      neuro: L("No tingling or numbness.", "Koi jhunjhunahat ya sunn-pan nahi."),
      pmh: L("Diabetes for ten years, and thyroid tablets.", "Das saal se sugar, aur thyroid ki goliyan."),
      social: L("I teach — writing on the board is hard now.", "Parhata hoon — ab board par likhna mushkil hai."),
      goals: L("Write on the board and dress easily.", "Board par likhna aur aasani se kapre pehenna."),
    },
    findings: {
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
      complaint: L("My right knee gave way playing football five days ago.", "Paanch din pehle football khelte hue daayan ghutna nikal gaya."),
      onset: L("I landed from a header and twisted — I felt a pop, couldn't carry on, and it swelled within an hour.", "Header ke baad girte hue ghooma — 'pop' mehsoos hua, khel nahi saka, aur ghante ke andar soojan aa gayi."),
      location: L("Deep inside the knee.", "Ghutne ke andar gehraai mein."),
      behaviour: L("Twisting and stairs — the knee feels like it might give way.", "Mudna aur seerhiyan — lagta hai ghutna phir nikal jaega."),
      neuro: L("No numbness.", "Koi sunn-pan nahi."),
      social: L("Student, I play football four times a week.", "Talib-e-ilm hoon, hafte mein chaar dafa football khelta hoon."),
      goals: L("Back to football this season.", "Isi season football mein wapsi."),
    },
    findings: {
      observation: "Swollen right knee; walks with the knee held slightly bent.",
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
      complaint: L("Both knees ache, the right is worse — for about two years.", "Dono ghutne dukhte hain, daayan zyada — do saal se."),
      onset: L("It came on gradually, no injury.", "Aahista aahista, koi chot nahi."),
      location: L("Inside of the right knee.", "Daayen ghutne ke andar ki taraf."),
      behaviour: L("Sitting on the floor for prayer and climbing stairs. Rest helps.", "Namaz ke liye zameen par baithna aur seerhiyan. Aaram se behtar."),
      night: L("Stiff in the morning for about fifteen minutes, then it loosens.", "Subah pandrah minute akran, phir khul jaata hai."),
      severity: L("Five out of ten, seven on stairs.", "Paanch, seerhiyon par saat."),
      pmh: L("High blood pressure.", "Blood pressure."),
      social: L("I work on my farm every day.", "Roz apne khet par kaam karta hoon."),
      goals: L("Pray on the floor and keep working in my fields.", "Zameen par namaz parhna aur khet mein kaam karte rehna."),
    },
    findings: {
      observation: "Mild varus alignment of the right knee; slight antalgic gait.",
      rom: {
        "knee-flexion.right": { active: 100, passive: 105, endFeel: "Hard with crepitus", pain: "Ache at the end of range" },
        "knee-extension.right": { active: -5, passive: -5, endFeel: "Hard" },
      },
      strength: { "knee-ext.right": 4 },
      tender: [{ side: "right", regions: ["Inner knee"], text: "Tender along the inner joint line." }],
      tape: { "knee-girth.right": 1 },
      special: { "mcmurray.right": { positive: false, text: "Coarse crepitus but no click or locking. Negative." } },
      vitals: { hr: 78, bp: "142/88", rr: 15, spo2: 97, temp: 36.6 },
    },
    key: { history: ["night", "behaviour", "location"], exam: ["rom:knee-flexion", "palpate:Inner knee", "mmt:knee-ext"] },
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
      complaint: L("I twisted my left ankle yesterday playing cricket.", "Kal cricket khelte hue baayan takhna mur gaya."),
      onset: L("My foot rolled inwards as I landed in my delivery stride. It swelled up quickly.", "Bowling karte hue paon andar ki taraf mura. Jaldi soojan aa gayi."),
      location: L("Front and outside of the ankle.", "Takhne ke aage aur bahar ki taraf."),
      behaviour: L("It hurts to walk, but I walked to the car on my own.", "Chalne mein dard hai, lekin khud gaari tak chal kar gaya."),
      severity: L("Six out of ten walking.", "Chalte waqt chhe."),
      neuro: L("No numbness.", "Koi sunn-pan nahi."),
      previous: L("I sprained the same ankle last season.", "Pichhle season bhi yahi takhna mura tha."),
      goals: L("Bowl again in two weeks if possible.", "Ho sake to do hafte mein dobara bowling."),
    },
    findings: {
      observation: "Swelling and bruising over the outer left ankle.",
      rom: { "ankle-df.left": { active: 8, passive: 10, pain: "Tight and painful at the front" }, "ankle-pf.left": { active: 35, passive: 40 } },
      tender: [
        { side: "left", landmarks: ["lateral-malleolus"], text: "Pressing the bony tip and back edge of the lateral malleolus: not tender." },
        { side: "left", regions: ["Lateral ankle", "Outer border of the foot"], text: "“Ouch — there!” Tender in the soft hollow just in front of the lateral malleolus (ATFL)." },
        { side: "left", landmarks: ["medial-malleolus"], text: "Not tender over the medial malleolus." },
      ],
      special: {
        "ankle-anterior-drawer.left": { positive: true, text: "More forward glide of the talus than on the right, with a soft end-feel. Positive." },
        "talar-tilt.left": { positive: false, text: "Slightly sore but similar to the right side. Negative." },
      },
    },
    key: { history: ["onset", "behaviour"], exam: ["palpate:lateral-malleolus", "palpate:medial-malleolus", "special:ankle-anterior-drawer"] },
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
      complaint: L("My left arm and leg became weak three weeks ago.", "Teen hafte pehle mera baayan baazu aur taang kamzor ho gaye."),
      onset: L("I woke up and couldn't move my left side. The hospital said it was a stroke.", "Subah utha to baayan hissa hil nahi raha tha. Hospital walon ne kaha falij ka hamla hai."),
      location: L("The whole left side of my body.", "Jism ka poora baayan hissa."),
      neuro: L("My left side feels heavy and numb.", "Baayan hissa bhaari aur sunn lagta hai."),
      bladder: L("I'm managing the toilet now.", "Ab toilet khud kar leta hoon."),
      pmh: L("High blood pressure and diabetes. I take several tablets.", "Blood pressure aur sugar. Kai goliyan leta hoon."),
      social: L("Retired. I live with my son's family.", "Retired hoon. Bete ke ghar walon ke saath rehta hoon."),
      goals: L("Walk to the mosque on my own.", "Khud masjid tak chal kar jaana."),
    },
    findings: {
      observation: "Left arm held flexed at the elbow; left face slightly droopy; walks with a stick, circumducting the left leg.",
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
      complaint: L("My hands have become clumsy and I'm unsteady when I walk.", "Mere haath bhadde ho gaye hain aur chalte hue larkharata hoon."),
      onset: L("Slowly over about six months.", "Taqreeban chhe mahine mein aahista aahista."),
      location: L("Some neck stiffness. Mostly my hands and legs.", "Gardan mein thori akran. Zyada haath aur taangen."),
      neuro: L("Buttons are hard, my writing has changed, my fingers feel numb, and my legs feel stiff.", "Button lagana mushkil hai, likhaai badal gayi hai, ungliyan sunn hain, aur taangen akri hui lagti hain."),
      bladder: L("Sometimes I have to rush to the toilet now.", "Ab kabhi kabhi jaldi toilet bhaagna parta hai."),
      redflags: L("No weight loss or fever.", "Wazan kam nahi hua, bukhar nahi."),
      pmh: L("Nothing important.", "Koi khaas nahi."),
      social: L("Retired engineer; I used to repair watches as a hobby.", "Retired engineer hoon; shauq mein gharriyan theek karta tha."),
      goals: L("Repair watches again and walk without fear of falling.", "Dobara gharriyan theek karna aur girne ke darr ke baghair chalna."),
    },
    findings: {
      observation: "Wide-based, slightly stiff gait.",
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
    social: L("I'm a physiotherapy student too.", "Main bhi physiotherapy ka talib-e-ilm hoon."),
  },
  findings: {},
  key: { history: [], exam: [] },
  questions: { diagnosis: { options: ["Healthy"], answer: 0, why: "" }, plan: { options: ["None"], answer: 0, why: "" } },
  teaching: [],
};
