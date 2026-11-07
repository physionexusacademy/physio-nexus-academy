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
        title: "Progressive Overload in Rehabilitation",
        href: "/knowledge-hub/progressive-overload-in-rehabilitation",
        mission: {
          en: "Read the article and write down one way you would progress a squat for a patient. You've just linked movement science to exercise prescription.",
          ur: "Article parhein aur likhein ke aap patient ke liye squat ko kaise progress karenge. Aap ne movement science ko exercise prescription se jor diya.",
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
        title: "Clinical Challenge Arena",
        href: "/clinical-arena",
        mission: {
          en: "Solve one Arena case. Before choosing an answer, say out loud: which finding rules something IN, and which rules something OUT?",
          ur: "Arena ka ek case solve karein. Jawab chunne se pehle zor se kahein: kaun si finding kuch rule IN karti hai aur kaun si rule OUT?",
        },
        minutes: 10,
      },
      {
        id: "cr-6",
        kind: "mission",
        title: "Clinical Case Lab",
        href: "/case-lab",
        mission: {
          en: "Read one published case report. Find three things: what was tested, what was ruled out, and what the clinicians did when the patient didn't improve.",
          ur: "Ek published case report parhein. Teen cheezein dhoondein: kya test hua, kya rule out hua, aur jab patient behtar na hua to clinicians ne kya kiya.",
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
        href: "/msk-injuries/adhesive-capsulitis",
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
        href: "/msk-injuries/acl-injury",
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
        href: "/treatment-plans/acl-reconstruction-rehabilitation",
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
        href: "/treatment-plans/knee-osteoarthritis",
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
        title: "Clinical Challenge Arena",
        href: "/clinical-arena",
        mission: {
          en: "Solve one case, and before you choose a diagnosis, list the red flags you screened for and the neuro findings you'd check.",
          ur: "Ek case solve karein, aur diagnosis chunne se pehle woh red flags likhein jo aap ne screen kiye aur woh neuro findings jo aap check karenge.",
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
  clinic: "knee-rehab-mastery",
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
