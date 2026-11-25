import type { TeacherGoal, TeacherPath, TeacherProfile, TeacherStage } from "./types.ts";

/**
 * Step-by-step learning paths. Lessons are taught by PNA Teacher; "missions"
 * send the learner into existing PNA pages with one specific thing to do, so
 * the whole site becomes one guided curriculum instead of a menu of sections.
 */
export const teacherPaths: TeacherPath[] = [
  {
    slug: "movement-science-foundations",
    title: "Movement Science Foundations",
    tagline: {
      en: "The building blocks every physio needs — explained so they finally make sense.",
      ur: "Woh buniyadi cheezein jo har physio ko chahiye — aise samjhayi gayi ke aakhir kaar samajh aa jayein.",
    },
    audience: "1st–2nd year DPT",
    outcomes: [
      { en: "Predict roll and glide at any joint", ur: "Kisi bhi joint par roll aur glide predict karna" },
      { en: "Explain two-joint muscle behaviour with real examples", ur: "Two-joint muscles ka rawaiya asli misaalon se samjhana" },
      { en: "Classify and choose open vs closed chain exercises", ur: "Open vs closed chain exercises classify aur choose karna" },
      { en: "Match treatment to the tissue healing phase", ur: "Treatment ko tissue healing phase ke mutabiq rakhna" },
    ],
    steps: [
      { id: "mf-1", kind: "lesson", lesson: "convex-concave-rule" },
      { id: "mf-2", kind: "lesson", lesson: "active-passive-insufficiency" },
      { id: "mf-3", kind: "lesson", lesson: "open-vs-closed-chain" },
      { id: "mf-3g", kind: "lesson", lesson: "gait-cycle" },
      {
        id: "mf-4",
        kind: "mission",
        title: "Patellofemoral Pain — treatment plan",
        href: "/conditions/patellofemoral-pain#clinical",
        mission: {
          en: "Open the plan and write down how Stage 2 progresses squatting for a patient. You've just linked movement science to exercise prescription.",
          ur: "Plan kholein aur likhein ke Stage 2 patient ke liye squat ko kaise progress karta hai. Aap ne movement science ko exercise prescription se jor diya.",
        },
        minutes: 8,
      },
      { id: "mf-5", kind: "lesson", lesson: "tissue-healing-phases" },
      {
        id: "mf-6",
        kind: "mission",
        title: "Daily Clinical Challenge",
        href: "/daily-challenge",
        mission: {
          en: "Checkpoint: take today's 5-question challenge. Whatever your score, read every explanation — that's where the learning is.",
          ur: "Checkpoint: aaj ka 5 sawalon wala challenge dein. Score jo bhi ho, har explanation zaroor parhein — asal seekhna wahin hai.",
        },
        minutes: 5,
      },
    ],
  },
  {
    slug: "clinical-reasoning-starter",
    title: "Clinical Reasoning Starter",
    tagline: {
      en: "Think like a clinician: read test results honestly, localise lesions and talk about pain the right way.",
      ur: "Clinician ki tarah sochein: test results imaandari se parhein, lesion ki jagah pehchanein aur dard par sahi tareeqe se baat karein.",
    },
    audience: "3rd year, final year & interns",
    outcomes: [
      { en: "Use SnNout and SpPin without falling into the classic trap", ur: "SnNout aur SpPin classic trap mein phanse baghair use karna" },
      { en: "Separate UMN from LMN lesions in seconds", ur: "Seconds mein UMN aur LMN lesions alag karna" },
      { en: "Explain pain to patients in simple, safe words", ur: "Patients ko asaan, mehfooz alfaaz mein dard samjhana" },
      { en: "Practise the full reasoning cycle on real cases", ur: "Asli cases par poora reasoning cycle practice karna" },
    ],
    steps: [
      { id: "cr-1", kind: "lesson", lesson: "sensitivity-specificity" },
      {
        id: "cr-2",
        kind: "mission",
        title: "MSK Special Tests library",
        href: "/msk-special-tests",
        mission: {
          en: "Pick any two knee tests. For each, ask yourself: would I use this to rule a condition OUT, or IN? Write one sentence explaining why.",
          ur: "Koi bhi do knee tests chunein. Har ek ke liye khud se poochein: kya main isay condition rule OUT karne ke liye use karunga ya IN? Wajah ek jumle mein likhein.",
        },
        minutes: 10,
      },
      { id: "cr-2r", kind: "lesson", lesson: "red-flags-screening" },
      { id: "cr-3", kind: "lesson", lesson: "umn-vs-lmn" },
      { id: "cr-4", kind: "lesson", lesson: "pain-science-basics" },
      {
        id: "cr-5",
        kind: "mission",
        title: "Virtual Patient",
        href: "/virtual-patient",
        mission: {
          en: "Open one Virtual Patient case. Before choosing a diagnosis, say out loud: which finding rules something IN, and which rules something OUT?",
          ur: "Virtual Patient ka ek case kholein. Diagnosis chunne se pehle zor se kahein: kaun si finding kuch rule IN karti hai aur kaun si rule OUT?",
        },
        minutes: 10,
      },
      {
        id: "cr-6",
        kind: "mission",
        title: "Conditions & Treatment Guide",
        href: "/conditions",
        mission: {
          en: "Open one condition and read its case story. Find three things: what was tested, what was ruled out, and what changed when the patient didn't improve.",
          ur: "Ek condition kholein aur uski case story parhein. Teen cheezein dhoondein: kya test hua, kya rule out hua, aur jab patient behtar na hua to kya badla.",
        },
        minutes: 12,
      },
    ],
  },
  {
    slug: "manual-therapy-starter",
    title: "Manual Therapy Starter",
    tagline: {
      en: "From joint mechanics to choosing the right grade — the thinking behind your hands.",
      ur: "Joint mechanics se sahi grade chunne tak — aap ke hands ke peeche ki soch.",
    },
    audience: "Final year, interns & graduates",
    outcomes: [
      { en: "Choose glide direction with the convex–concave rule (and know its limits)", ur: "Convex–concave rule se glide direction chunna (aur us ki hadood jaanna)" },
      { en: "Pick Maitland grades by irritability", ur: "Irritability ke mutabiq Maitland grades chunna" },
      { en: "Explain how manual therapy can ease pain", ur: "Samjhana ke manual therapy dard kaise kam kar sakti hai" },
      { en: "Apply it all to a stiff shoulder", ur: "Yeh sab stiff shoulder par apply karna" },
    ],
    steps: [
      { id: "mt-1", kind: "lesson", lesson: "convex-concave-rule" },
      { id: "mt-2", kind: "lesson", lesson: "maitland-grades" },
      { id: "mt-3l", kind: "lesson", lesson: "maitland-joint-mobilization" },
      { id: "mt-4l", kind: "lesson", lesson: "kaltenborn-evjenth-mobilization" },
      { id: "mt-4m", kind: "lesson", lesson: "mulligan-mobilization-with-movement" },
      { id: "mt-4r", kind: "lesson", lesson: "red-flags-screening" },
      { id: "mt-5", kind: "lesson", lesson: "pain-science-basics" },
      {
        id: "mt-6",
        kind: "mission",
        title: "Adhesive Capsulitis",
        href: "/conditions/adhesive-capsulitis",
        mission: {
          en: "Apply it: for a painful early-stage frozen shoulder and for a stiff later stage, which grades would you choose — and how would you reassess?",
          ur: "Apply karein: dard wale shuru ke frozen shoulder aur baad ke stiff stage ke liye aap kaun se grades chunenge — aur reassess kaise karenge?",
        },
        minutes: 10,
      },
    ],
  },
  {
    slug: "knee-rehab-mastery",
    title: "Knee Rehab Mastery",
    tagline: {
      en: "From the injury to the exercise plan — one joint, mastered step by step.",
      ur: "Injury se exercise plan tak — ek joint, qadam ba qadam master.",
    },
    audience: "Final year, interns & clinicians",
    outcomes: [
      { en: "Time your treatment to the healing phase", ur: "Treatment ko healing phase ke mutabiq time karna" },
      { en: "Interpret knee special tests honestly", ur: "Knee special tests ko imaandari se samajhna" },
      { en: "Combine open and closed chain work safely", ur: "Open aur closed chain kaam ko mehfooz tareeqe se milana" },
      { en: "Follow a full ACL rehabilitation plan", ur: "Poora ACL rehabilitation plan follow karna" },
    ],
    steps: [
      { id: "kn-1", kind: "lesson", lesson: "tissue-healing-phases" },
      {
        id: "kn-2",
        kind: "mission",
        title: "ACL Injury",
        href: "/conditions/acl-injury",
        mission: {
          en: "Read how an ACL injury presents. List the three history clues that would make you suspect it before you even touch the knee.",
          ur: "Parhein ke ACL injury kaise saamne aati hai. History ke woh teen ishare likhein jo knee chhoone se pehle hi aap ko shak mein daal dein.",
        },
        minutes: 10,
      },
      { id: "kn-3", kind: "lesson", lesson: "sensitivity-specificity" },
      {
        id: "kn-4",
        kind: "mission",
        title: "MSK Special Tests library",
        href: "/msk-special-tests",
        mission: {
          en: "Find the knee ligament tests. Practise the technique steps on a friend (gently!) — and decide which result would rule an ACL tear out.",
          ur: "Knee ligament tests dhoondein. Technique ke steps kisi dost par (naram hand se!) practice karein — aur tay karein kaun sa result ACL tear rule out karega.",
        },
        minutes: 12,
      },
      { id: "kn-5", kind: "lesson", lesson: "open-vs-closed-chain" },
      { id: "kn-5d", kind: "lesson", lesson: "exercise-dosage" },
      { id: "kn-5g", kind: "lesson", lesson: "gait-cycle" },
      {
        id: "kn-6",
        kind: "mission",
        title: "ACL Reconstruction Rehabilitation plan",
        href: "/conditions/acl-reconstruction-rehabilitation#clinical",
        mission: {
          en: "Walk through the plan phase by phase. At each phase, name one open-chain and one closed-chain exercise — and the criterion to progress.",
          ur: "Plan ko phase ba phase dekhein. Har phase mein ek open-chain aur ek closed-chain exercise ka naam lein — aur aage barhne ka criterion bhi.",
        },
        minutes: 15,
      },
      {
        id: "kn-7",
        kind: "mission",
        title: "Knee Osteoarthritis plan",
        href: "/conditions/knee-osteoarthritis#clinical",
        mission: {
          en: "Different knee, same principles: spot where load progression and patient education appear in this plan.",
          ur: "Alag knee, wohi usool: dekhein is plan mein load progression aur patient education kahan aate hain.",
        },
        minutes: 10,
      },
    ],
  },
  {
    slug: "safe-assessment-essentials",
    title: "Safe Assessment Essentials",
    tagline: {
      en: "Screen for danger, read the nervous system and interpret tests honestly — before you treat anyone.",
      ur: "Kisi ka ilaaj karne se pehle: khatre ke liye screen karein, nervous system ko parhein aur tests ko imaandari se samjhein.",
    },
    audience: "3rd year, interns & new graduates",
    outcomes: [
      { en: "Spot red flags and refer at the right speed", ur: "Red flags pehchan kar sahi raftaar se refer karna" },
      { en: "Run a complete dermatome, myotome and reflex screen", ur: "Mukammal dermatome, myotome aur reflex screen karna" },
      { en: "Tell UMN from LMN signs", ur: "UMN aur LMN signs mein farq karna" },
      { en: "Use test results without over-trusting them", ur: "Test results ko zaroorat se zyada bharose ke baghair use karna" },
    ],
    steps: [
      { id: "sa-1", kind: "lesson", lesson: "red-flags-screening" },
      { id: "sa-2", kind: "lesson", lesson: "dermatomes-myotomes-reflexes" },
      { id: "sa-3", kind: "lesson", lesson: "umn-vs-lmn" },
      { id: "sa-4", kind: "lesson", lesson: "sensitivity-specificity" },
      {
        id: "sa-5",
        kind: "mission",
        title: "MSK Symptom Checker",
        href: "/symptom-checker",
        mission: {
          en: "Run one example through the checker and notice which answers trigger a safety warning. Which red flags from the lesson did you spot?",
          ur: "Checker mein ek misaal chalayein aur dekhein kaun se jawab safety warning dete hain. Lesson ke kaun se red flags aap ne pehchane?",
        },
        minutes: 8,
      },
      {
        id: "sa-6",
        kind: "mission",
        title: "Virtual Patient",
        href: "/virtual-patient",
        mission: {
          en: "Open one case, and before you choose a diagnosis, list the red flags you screened for and the neuro findings you'd check.",
          ur: "Ek case kholein, aur diagnosis chunne se pehle woh red flags likhein jo aap ne screen kiye aur woh neuro findings jo aap check karenge.",
        },
        minutes: 10,
      },
    ],
  },
  {
    slug: "soft-tissue-toolkit",
    title: "Soft-Tissue Toolkit",
    tagline: {
      en: "The soft-tissue techniques you'll use most — when each fits, how to apply it safely, and how to prove it helped.",
      ur: "Sab se zyada use hone wali soft-tissue techniques — har ek kab theek hai, safe tareeqe se kaise karein, aur kaise prove karein ke faida hua.",
    },
    audience: "Final year, interns & clinicians",
    outcomes: [
      { en: "Choose between MET, positional release, myofascial release and trigger-point work", ur: "MET, positional release, myofascial release aur trigger-point work mein se chunna" },
      { en: "Explain how hands-on care can ease pain without 'fixing' tissue", ur: "Samjhana ke hands-on care tissue 'theek' kiye baghair dard kaise kam kar sakti hai" },
      { en: "Respect safety limits and reassess every time", ur: "Safety ki hadood ka khayal aur har baar reassess karna" },
    ],
    steps: [
      { id: "st-1", kind: "lesson", lesson: "pain-science-basics" },
      { id: "st-2", kind: "lesson", lesson: "tissue-healing-phases" },
      { id: "st-3", kind: "lesson", lesson: "muscle-energy-technique" },
      { id: "st-4", kind: "lesson", lesson: "strain-counterstrain" },
      { id: "st-5", kind: "lesson", lesson: "myofascial-release" },
      { id: "st-6", kind: "lesson", lesson: "trigger-point-compression" },
      {
        id: "st-7",
        kind: "mission",
        title: "Regional applications",
        href: "/manual-therapy/regions",
        mission: {
          en: "Pick one body region and compare two soft-tissue options for it. Which would you choose for an irritable, painful presentation — and why?",
          ur: "Body ka ek region chunein aur us ke liye do soft-tissue options compare karein. Irritable, dard wali presentation ke liye kaun sa chunenge — aur kyun?",
        },
        minutes: 10,
      },
    ],
  },
  {
    slug: "assessment-mastery",
    title: "Assessment Mastery",
    tagline: {
      en: "Take a history like an expert, read what your hands feel and examine safely — then prove it on a 3D patient.",
      ur: "Expert ki tarah history lein, jo haath mehsoos karein usay parhein aur safely examine karein — phir 3D patient par sabit karein.",
    },
    audience: "3rd year, final year & interns",
    outcomes: [
      { en: "Rate Severity, Irritability and Nature and plan the examination from them", ur: "Severity, Irritability aur Nature rate kar ke unhi se examination plan karna" },
      { en: "Identify end-feels, capsular patterns and contractile vs inert lesions", ur: "End-feels, capsular patterns aur contractile vs inert lesions pehchanna" },
      { en: "Screen for red flags and read neurological findings", ur: "Red flags screen karna aur neurological findings parhna" },
      { en: "Complete a full OSCE-style examination on the Virtual Patient", ur: "Virtual Patient par mukammal OSCE-style examination karna" },
    ],
    steps: [
      { id: "am-1", kind: "lesson", lesson: "subjective-assessment-sin" },
      { id: "am-2", kind: "lesson", lesson: "red-flags-screening" },
      { id: "am-3", kind: "lesson", lesson: "end-feel-capsular-patterns" },
      {
        id: "am-4",
        kind: "mission",
        title: "Goniometry — Skills Lab",
        href: "/skills/goniometry",
        mission: {
          en: "Pass the Goniometry skill test. Then measure shoulder external rotation on a friend and describe the end-feel you felt.",
          ur: "Goniometry skill test pass karein. Phir kisi dost ka shoulder external rotation naapein aur jo end-feel mehsoos hua woh likhein.",
        },
        minutes: 15,
      },
      { id: "am-5", kind: "lesson", lesson: "dermatomes-myotomes-reflexes" },
      { id: "am-6", kind: "lesson", lesson: "sensitivity-specificity" },
      {
        id: "am-7",
        kind: "mission",
        title: "Virtual Patient",
        href: "/virtual-patient",
        mission: {
          en: "Examine any patient in Guided mode: introduce yourself, rate SIN from the history, then score 80% or more.",
          ur: "Guided mode mein koi bhi patient examine karein: apna taaruf karayein, history se SIN rate karein, phir 80% ya zyada score karein.",
        },
        minutes: 15,
      },
    ],
  },
  {
    slug: "rehab-science",
    title: "Rehab Science & Exercise",
    tagline: {
      en: "The science behind every exercise you prescribe — muscles, levers, tendons, motor learning and balance.",
      ur: "Har exercise ke peeche ki science jo aap likhte hain — muscles, levers, tendons, motor learning aur balance.",
    },
    audience: "2nd year onwards",
    outcomes: [
      { en: "Choose contraction types and lever lengths to grade any exercise", ur: "Kisi bhi exercise ko grade karne ke liye contraction types aur lever lengths chunna" },
      { en: "Load a painful tendon safely with the pain-monitoring rules", ur: "Pain-monitoring rules ke saath dard wale tendon ko safely load karna" },
      { en: "Design practice that builds lasting motor learning", ur: "Aisi practice design karna jo pakki motor learning banaye" },
      { en: "Assess falls risk and prescribe balance training at an effective dose", ur: "Falls risk assess karna aur effective dose par balance training likhna" },
    ],
    steps: [
      { id: "rs-1", kind: "lesson", lesson: "muscle-contraction-types" },
      { id: "rs-2", kind: "lesson", lesson: "levers-torque" },
      { id: "rs-3", kind: "lesson", lesson: "scapulohumeral-rhythm" },
      { id: "rs-4", kind: "lesson", lesson: "tendinopathy-load-management" },
      { id: "rs-5", kind: "lesson", lesson: "exercise-dosage" },
      { id: "rs-6", kind: "lesson", lesson: "motor-learning-neuroplasticity" },
      { id: "rs-7", kind: "lesson", lesson: "balance-falls-assessment" },
      {
        id: "rs-8",
        kind: "mission",
        title: "Balance & Functional Tests — Skills Lab",
        href: "/skills/balance-function",
        mission: {
          en: "Work through the whole skill, then time a family member on the Timed Up and Go and interpret the result.",
          ur: "Poora skill mukammal karein, phir ghar ke kisi fard ka Timed Up and Go time karein aur nateeja samjhayein.",
        },
        minutes: 15,
      },
    ],
  },
  {
    slug: "cardiorespiratory-electrotherapy",
    title: "Cardiorespiratory & Electrotherapy Essentials",
    tagline: {
      en: "Clear airways, dose aerobic exercise and use electrotherapy honestly — the essentials every graduate needs.",
      ur: "Airways saaf karna, aerobic exercise ki dose aur electrotherapy ka imaandar istemal — har graduate ke liye zaroori baatein.",
    },
    audience: "3rd year, final year & interns",
    outcomes: [
      { en: "Teach the ACBT cycle and recognise when to stop", ur: "ACBT cycle sikhana aur rokne ka waqt pehchanna" },
      { en: "Monitor vital signs and dose aerobic exercise safely", ur: "Vital signs monitor karna aur aerobic exercise ki dose safely tay karna" },
      { en: "Set TENS for a purpose and screen every patient for contraindications", ur: "Kisi maqsad ke liye TENS set karna aur har patient ko contraindications ke liye screen karna" },
    ],
    steps: [
      { id: "ce-1", kind: "lesson", lesson: "airway-clearance-acbt" },
      {
        id: "ce-2",
        kind: "mission",
        title: "Vital Signs — Skills Lab",
        href: "/skills/vital-signs",
        mission: {
          en: "Pass the Vital Signs skill test, then measure your own resting heart rate and breathing rate and compare them with the normal ranges.",
          ur: "Vital Signs skill test pass karein, phir apni resting heart rate aur breathing rate naap kar normal ranges se compare karein.",
        },
        minutes: 12,
      },
      { id: "ce-3", kind: "lesson", lesson: "exercise-dosage" },
      { id: "ce-4", kind: "lesson", lesson: "pain-science-basics" },
      { id: "ce-5", kind: "lesson", lesson: "tens-ultrasound-evidence" },
      {
        id: "ce-6",
        kind: "mission",
        title: "COPD — Pulmonary Rehabilitation",
        href: "/conditions/copd-pulmonary-rehabilitation#clinical",
        mission: {
          en: "Read the plan and write one week of a COPD patient's programme: airway clearance, walking dose by RPE, and when you would stop.",
          ur: "Plan parhein aur COPD patient ke programme ka ek hafta likhein: airway clearance, RPE se walking ki dose, aur aap kab rokenge.",
        },
        minutes: 12,
      },
    ],
  },
  {
    slug: "neuro-exam-masterclass",
    title: "Neuro Exam Masterclass",
    tagline: {
      en: "Sensation, power, reflexes, tone and coordination: examine the nervous system step by step, with a 3D patient beside you.",
      ur: "Sensation, power, reflexes, tone aur coordination: nervous system ko step by step examine karein, 3D patient aap ke saath.",
    },
    audience: "2nd year to interns",
    outcomes: [
      { en: "Test dermatomes, myotomes and reflexes in a fixed order", ur: "Dermatomes, myotomes aur reflexes ko tay tarteeb mein test karna" },
      { en: "Recognise UMN, LMN, cerebellar and sensory patterns", ur: "UMN, LMN, cerebellar aur sensory patterns pehchanna" },
      { en: "Localise a lesion to root, cord or nerve", ur: "Lesion ko root, cord ya nerve par localise karna" },
    ],
    steps: [
      { id: "ne-1", kind: "lesson", lesson: "sensory-exam-dermatomes" },
      { id: "ne-2", kind: "lesson", lesson: "myotome-screening-root-levels" },
      { id: "ne-3", kind: "lesson", lesson: "deep-tendon-reflexes-technique" },
      {
        id: "ne-3m",
        kind: "mission",
        title: "Reflexes in the Skills Lab",
        href: "/skills/reflexes",
        mission: {
          en: "Open the knee jerk, set the grade to 4+ and watch the clonus, then switch to 0 and compare. Do the same on the left side.",
          ur: "Knee jerk kholein, grade 4+ karein aur clonus dekhein, phir 0 karein aur compare karein. Left side par bhi yahi karein.",
        },
        minutes: 8,
      },
      { id: "ne-4", kind: "lesson", lesson: "upper-motor-neuron-signs-bedside" },
      { id: "ne-5", kind: "lesson", lesson: "tone-spasticity-rigidity-ashworth" },
      { id: "ne-6", kind: "lesson", lesson: "cerebellar-exam-coordination" },
      { id: "ne-7", kind: "lesson", lesson: "romberg-tandem-pronator-drift" },
      { id: "ne-8", kind: "lesson", lesson: "arm-nerve-injuries" },
      { id: "ne-9", kind: "lesson", lesson: "leg-nerve-injuries" },
      { id: "ne-10", kind: "lesson", lesson: "radiculopathy-myelopathy-neuropathy" },
      {
        id: "ne-11",
        kind: "mission",
        title: "Virtual Patient — neurological case",
        href: "/virtual-patient",
        mission: {
          en: "Take a neurological case in the 3D exam room: choose the tests in a sensible order, then name the level and the type of lesion.",
          ur: "3D exam room mein neurological case lein: tests ko samajhdaar tarteeb se chunein, phir level aur lesion ki qisam batayein.",
        },
        minutes: 15,
      },
    ],
  },
  {
    slug: "measure-palpate-monitor",
    title: "Measure, Palpate, Monitor",
    tagline: {
      en: "Goniometry, MMT, tape measures, landmarks, vital signs and balance tests: the hands-on numbers that run every clinic.",
      ur: "Goniometry, MMT, tape measures, landmarks, vital signs aur balance tests: woh hands-on numbers jo har clinic chalate hain.",
    },
    audience: "1st year to final year",
    outcomes: [
      { en: "Measure range and strength without substitution", ur: "Substitution ke bagair range aur taqat naapna" },
      { en: "Palpate landmarks and apply the Ottawa rules", ur: "Landmarks palpate karna aur Ottawa rules lagana" },
      { en: "Monitor vital signs and balance safely during exercise", ur: "Exercise ke dauran vital signs aur balance ko mehfooz tareeqay se monitor karna" },
    ],
    steps: [
      { id: "mp-1", kind: "lesson", lesson: "goniometry-foundations" },
      { id: "mp-2", kind: "lesson", lesson: "goniometry-upper-limb" },
      { id: "mp-3", kind: "lesson", lesson: "goniometry-lower-limb" },
      { id: "mp-4", kind: "lesson", lesson: "mmt-grading-0-to-5" },
      {
        id: "mp-4m",
        kind: "mission",
        title: "Measure a joint in 3D",
        href: "/skills/goniometry",
        mission: {
          en: "Pick one movement, press play, pause at the end of range and read the goniometer. Then switch to slow motion and name the substitution you must prevent.",
          ur: "Ek movement chunein, play dabayein, range ke end par pause karein aur goniometer parhein. Phir slow motion lagayein aur woh substitution batayein jise rokna hai.",
        },
        minutes: 8,
      },
      { id: "mp-5", kind: "lesson", lesson: "muscle-length-testing" },
      { id: "mp-6", kind: "lesson", lesson: "limb-length-and-girth" },
      { id: "mp-7", kind: "lesson", lesson: "palpation-spinal-levels" },
      { id: "mp-8", kind: "lesson", lesson: "palpation-lower-limb-ottawa-rules" },
      { id: "mp-9", kind: "lesson", lesson: "pulse-blood-pressure-respiration" },
      { id: "mp-10", kind: "lesson", lesson: "exercise-intensity-borg-talk-test" },
      { id: "mp-11", kind: "lesson", lesson: "exercise-stop-signs-and-ward-mobilisation" },
      { id: "mp-12", kind: "lesson", lesson: "timed-up-and-go-gait-speed" },
      { id: "mp-13", kind: "lesson", lesson: "choosing-balance-tests" },
      {
        id: "mp-14",
        kind: "mission",
        title: "Skills Lab skill test",
        href: "/skills/vital-signs",
        mission: {
          en: "Open Vital Signs, take the skill test and read the explanation for every question you miss.",
          ur: "Vital Signs kholein, skill test dein aur jo sawal ghalat ho us ki explanation zaroor parhein.",
        },
        minutes: 12,
      },
    ],
  },
  {
    slug: "neuro-rehab-essentials",
    title: "Neuro Rehab Essentials",
    tagline: {
      en: "Locate the lesion, read the stroke, treat the dizzy patient and measure tone properly.",
      ur: "Lesion ki jagah pehchanein, stroke ko parhein, chakkar wale mareez ka ilaaj karein aur tone ko sahi tareeqe se naapein.",
    },
    audience: "3rd year, final year & interns",
    outcomes: [
      { en: "Predict which side is weak and which is numb in a spinal cord lesion", ur: "Spinal cord lesion mein andaza lagana ke kaunsi side kamzor aur kaunsi sunn hai" },
      { en: "Link a stroke pattern to its artery and plan around it", ur: "Stroke ke pattern ko us ki artery se jorna aur us ke mutabiq plan banana" },
      { en: "Test and treat posterior-canal BPPV, and know when to refer", ur: "Posterior-canal BPPV ko test aur treat karna, aur refer karna kab hai yeh jaanna" },
      { en: "Separate spasticity from rigidity and contracture with the Tardieu method", ur: "Tardieu tareeqe se spasticity ko rigidity aur contracture se alag karna" },
    ],
    steps: [
      { id: "nr-1", kind: "lesson", lesson: "umn-vs-lmn" },
      { id: "nr-2", kind: "lesson", lesson: "spinal-cord-syndromes-brown-sequard" },
      { id: "nr-3", kind: "lesson", lesson: "stroke-syndromes-by-territory" },
      {
        id: "nr-4",
        kind: "mission",
        title: "Stroke rehabilitation guide",
        href: "/conditions/stroke-rehabilitation",
        mission: {
          en: "Open the guide and find the stage plan for the first weeks. Write down one thing you would change for a patient with neglect and one for a patient with aphasia.",
          ur: "Guide kholein aur pehle hafton ka stage plan dhoondein. Neglect wale mareez ke liye ek cheez aur aphasia wale mareez ke liye ek cheez jo aap badlenge likhein.",
        },
        minutes: 10,
      },
      { id: "nr-5", kind: "lesson", lesson: "bppv-dix-hallpike-epley" },
      { id: "nr-6", kind: "lesson", lesson: "spasticity-tardieu-catch-lab" },
      {
        id: "nr-7",
        kind: "mission",
        title: "Skills Lab: tone and coordination",
        href: "/skills/tone-coordination",
        mission: {
          en: "Open Tone and Coordination, take the skill test and read the explanation for every question you miss.",
          ur: "Tone aur Coordination kholein, skill test dein aur jo sawal ghalat ho us ki explanation zaroor parhein.",
        },
        minutes: 12,
      },
    ],
  },
  {
    slug: "paediatric-physio-foundations",
    title: "Paediatric Physio Foundations",
    tagline: {
      en: "What is typical, what is a flag, and how cerebral palsy changes the plan.",
      ur: "Kya typical hai, kya flag hai, aur cerebral palsy plan ko kaise badalta hai.",
    },
    audience: "3rd year, final year & interns",
    outcomes: [
      { en: "Name the milestones from 2 months to 5 years and correct the age of a preterm baby", ur: "2 mahine se 5 saal tak ke milestones batana aur qabl-az-waqt bachay ki umar correct karna" },
      { en: "Test primitive reflexes and postural reactions and read their timing", ur: "Primitive reflexes aur postural reactions test karna aur un ki timing parhna" },
      { en: "Classify a child on the GMFCS and link it to hip risk and goals", ur: "Bachay ko GMFCS par classify karna aur hip risk aur goals se jorna" },
    ],
    steps: [
      { id: "pf-1", kind: "lesson", lesson: "developmental-milestones-0-5-years" },
      { id: "pf-2", kind: "lesson", lesson: "primitive-reflexes-postural-reactions" },
      { id: "pf-3", kind: "lesson", lesson: "cerebral-palsy-gmfcs" },
      { id: "pf-3t", kind: "lesson", lesson: "spasticity-tardieu-catch-lab" },
      {
        id: "pf-4",
        kind: "mission",
        title: "Cerebral palsy guide",
        href: "/conditions/cerebral-palsy",
        mission: {
          en: "Open the guide and find the surveillance advice for hips. Write down what you would tell a family about why standing and positioning matter.",
          ur: "Guide kholein aur hips ki surveillance ka mashwara dhoondein. Likhein ke aap family ko kya batayenge ke standing aur positioning kyun aham hain.",
        },
        minutes: 10,
      },
      {
        id: "pf-5",
        kind: "mission",
        title: "Daily Clinical Challenge",
        href: "/daily-challenge",
        mission: {
          en: "Checkpoint: take today's 5-question challenge. Whatever your score, read every explanation — that's where the learning is.",
          ur: "Checkpoint: aaj ka 5 sawalon wala challenge dein. Score jo bhi ho, har explanation zaroor parhein — asal seekhna wahin hai.",
        },
        minutes: 5,
      },
    ],
  },
  {
    slug: "examine-and-think-like-a-clinician",
    title: "Examine and Think Like a Clinician",
    tagline: {
      en: "Hip, hand and heart-lung measures, plus the thinking habits that stop you missing something serious.",
      ur: "Hip, hath aur dil-phephron ki pemaish, aur woh soch ki aadatein jo kisi sangeen cheez ko miss karne se bachati hain.",
    },
    audience: "3rd year, final year & interns",
    outcomes: [
      { en: "Examine hip and groin pain in order and spot a stress fracture or slipped epiphysis", ur: "Hip aur groin ke dard ko tartib se examine karna aur stress fracture ya slipped epiphysis pehchanna" },
      { en: "Tell carpal tunnel from an elbow or neck cause", ur: "Carpal tunnel ko kohni ya gardan ki wajah se alag karna" },
      { en: "Run a six-minute walk test safely and judge the change", ur: "Chhe minute walk test mehfooz tareeqe se chalana aur tabdeeli parkhna" },
      { en: "Name your thinking traps and use red flags well", ur: "Apni soch ke jaal pehchanna aur red flags ko theek istemal karna" },
    ],
    steps: [
      { id: "et-1", kind: "lesson", lesson: "clinical-reasoning-thinking-errors" },
      { id: "et-2", kind: "lesson", lesson: "hip-groin-pain-examination" },
      { id: "et-3", kind: "lesson", lesson: "carpal-tunnel-hand-nerve-examination" },
      { id: "et-4", kind: "lesson", lesson: "six-minute-walk-test-breathlessness" },
      {
        id: "et-5",
        kind: "mission",
        title: "Special tests atlas: hip and wrist",
        href: "/skills/special-tests",
        mission: {
          en: "Open the hip and wrist tests. For each of four tests, say out loud what a positive finding is, one pitfall and which hypothesis it would help you rule out.",
          ur: "Hip aur kalai ke tests kholein. Chaar tests mein se har ek ke liye zubaan se batayein ke positive finding kya hai, ek ghalti kya hai aur yeh kis hypothesis ko rule out karne mein madad dega.",
        },
        minutes: 12,
      },
    ],
  },
  {
    slug: "special-tests-masterclass",
    title: "Special Tests Masterclass",
    tagline: {
      en: "Use shoulder, knee and ankle tests like a clinician: what is positive, what it means and when a test is not enough.",
      ur: "Shoulder, knee aur ankle ke tests clinician ki tarah istemal karein: positive kya hai, matlab kya hai aur test kab kaafi nahi.",
    },
    audience: "3rd year, final year & interns",
    outcomes: [
      { en: "Use sensitivity, specificity and likelihood ratios to judge a test", ur: "Sensitivity, specificity aur likelihood ratios se test ka andaza lagana" },
      { en: "Examine a painful shoulder, an injured knee and a twisted ankle in order", ur: "Dardnak shoulder, zakhmi knee aur mure hue ankle ko tartib se examine karna" },
      { en: "Know when to image, retest or refer", ur: "Jaanna ke kab imaging, dobara test ya referral karna hai" },
    ],
    steps: [
      { id: "st-1", kind: "lesson", lesson: "special-tests-sensitivity-clusters" },
      { id: "st-2", kind: "lesson", lesson: "shoulder-cuff-tests-lag-signs" },
      { id: "st-3", kind: "lesson", lesson: "knee-ligament-meniscus-exam" },
      { id: "st-4", kind: "lesson", lesson: "ankle-sprain-ottawa-syndesmosis" },
      {
        id: "st-5",
        kind: "mission",
        title: "Special tests atlas",
        href: "/skills/special-tests",
        mission: {
          en: "Open the Skills Lab special tests. Choose five tests from different joints and, for each, say out loud what a positive finding is and one common pitfall.",
          ur: "Skills Lab ke special tests kholein. Alag alag joints ke paanch tests chunein aur har ek ke liye zubaan se batayein ke positive finding kya hai aur ek aam ghalti kya hai.",
        },
        minutes: 15,
      },
      {
        id: "st-6",
        kind: "mission",
        title: "Virtual Patient: knee that gave way",
        href: "/virtual-patient?case=acl-tear",
        mission: {
          en: "Work through the ACL case. Before you run a test, write what you expect it to show and why; then compare with the result.",
          ur: "ACL case hal karein. Test chalane se pehle likhein ke aap kya nateeja expect karte hain aur kyun; phir result se muqabla karein.",
        },
        minutes: 15,
      },
      {
        id: "st-7",
        kind: "mission",
        title: "Daily Clinical Challenge",
        href: "/daily-challenge",
        mission: {
          en: "Checkpoint: take today's 5-question challenge. Whatever your score, read every explanation — that's where the learning is.",
          ur: "Checkpoint: aaj ka 5 sawalon wala challenge dein. Score jo bhi ho, har explanation zaroor parhein — asal seekhna wahin hai.",
        },
        minutes: 5,
      },
    ],
  },
  {
    slug: "manual-therapy-safe-practice",
    title: "Manual Therapy: Safe, Honest Practice",
    tagline: {
      en: "Screen the neck, choose a technique, dose it gently and explain it without fear.",
      ur: "Gardan ki screening karein, technique chunein, halka dose dein aur bina dar ke samjhayein.",
    },
    audience: "Final year, interns & graduates",
    outcomes: [
      { en: "Screen a neck patient for artery problems and act correctly", ur: "Gardan ke patient mein artery ke masle ki screening karna aur sahi qadam uthana" },
      { en: "Choose and dose thoracic, neural and muscle energy techniques", ur: "Thoracic, neural aur muscle energy techniques chunna aur dose dena" },
      { en: "Explain what manual therapy does in calm, accurate words", ur: "Manual therapy kya karti hai, pur sukoon aur durust alfaz mein samjhana" },
    ],
    steps: [
      { id: "mt2-1", kind: "lesson", lesson: "cervical-manipulation-safety-screening" },
      { id: "mt2-2", kind: "lesson", lesson: "explaining-manual-therapy-effects" },
      { id: "mt2-3", kind: "lesson", lesson: "thoracic-manipulation-neck-pain" },
      { id: "mt2-4", kind: "lesson", lesson: "neural-mobilisation-neurodynamics" },
      { id: "mt2-5", kind: "lesson", lesson: "muscle-energy-technique-mechanics" },
      {
        id: "mt2-6",
        kind: "mission",
        title: "Red flags screening",
        href: "/learn/red-flags-screening",
        mission: {
          en: "Write the five questions you will ask every neck patient before you treat, and the two answers that would make you stop and refer.",
          ur: "Woh paanch sawal likhein jo aap ilaaj se pehle har gardan ke patient se poochhenge, aur do jawab jin par aap ruk kar refer karenge.",
        },
        minutes: 10,
      },
      {
        id: "mt2-7",
        kind: "mission",
        title: "Daily Clinical Challenge",
        href: "/daily-challenge",
        mission: {
          en: "Checkpoint: take today's 5-question challenge. Whatever your score, read every explanation — that's where the learning is.",
          ur: "Checkpoint: aaj ka 5 sawalon wala challenge dein. Score jo bhi ho, har explanation zaroor parhein — asal seekhna wahin hai.",
        },
        minutes: 5,
      },
    ],
  },
];

export function getTeacherPath(slug: string): TeacherPath | undefined {
  return teacherPaths.find((path) => path.slug === slug);
}

const pathByStage: Record<TeacherStage, string> = {
  "year1-2": "movement-science-foundations",
  "year3-4": "clinical-reasoning-starter",
  "final-intern": "safe-assessment-essentials",
  graduate: "manual-therapy-starter",
};

const pathByGoal: Partial<Record<TeacherGoal, string>> = {
  clinic: "assessment-mastery",
  manual: "manual-therapy-starter",
};

/** The path PNA Teacher recommends for a learner's stage and goal. */
export function recommendPathSlug(profile: Pick<TeacherProfile, "stage" | "goal">): string {
  if (profile.goal === "exams") {
    return profile.stage === "year1-2" ? "movement-science-foundations" : "clinical-reasoning-starter";
  }
  return pathByGoal[profile.goal] ?? pathByStage[profile.stage];
}

/** How many steps to suggest per day for the learner's chosen time. */
export function stepsPerDay(minutes: TeacherProfile["minutes"]): number {
  return minutes >= 30 ? 3 : minutes >= 15 ? 2 : 1;
}
