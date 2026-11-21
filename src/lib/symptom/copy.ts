/**
 * Every word the checker screen says itself (the medical content is in ru.ts). Kept apart from the screen so the public checker and the
 * RehabVerse intake can show the same questions with the same words. "ru" is natural spoken Roman Urdu mixed with English, the way a
 * clinic talks, never formal Urdu. scripts/validate-symptom-checker-ru.ts checks both languages have every key.
 */
import type { CheckerLang } from "./ru.ts";

export type CheckerCopy = {
  emergencyLead: string;
  emergencyBody: string;
  kicker: string;
  badge: string;
  steps: [string, string, string, string, string, string];
  stepOf: (n: number, total: number) => string;
  progress: string;
  start: { eyebrow: string; title: string; lead: string };
  history: { eyebrow: string; title: string; lead: string; age: string; onset: string; duration: string; impact: string };
  pain: { title: string; optional: string; aria: string; none: string; moderate: string; worst: string; notSet: string; set: (n: number) => string; clear: string; valueText: (n: number | null) => string };
  location: { eyebrow: string; title: string; lead: string };
  clues: { eyebrow: string; title: string; lead: string; count: (n: number) => string };
  safety: { eyebrow: string; title: string; lead: string; emergency: string; urgent: string; none: string };
  nav: { back: string; next: string; show: string };
  errors: { history: string; location: string; safety: string };
  result: {
    kicker: string;
    title: (region: string) => string;
    lead: string;
    stopTitle: string;
    stopBody: string;
    copyClinician: string;
    copied: string;
    copyMine: string;
    again: string;
    anotherProblem: string;
    blocked: string;
    urgency: (level: number) => string;
    meter: [string, string, string];
    priority: string;
    nerve: string;
    fracture: string;
    criteria: string;
    secondary: string;
    mostCompatible: string;
    alternative: string;
    headline: string;
    headlineHow: string;
    headlineNot: string;
    reported: (matched: number, total: number) => string;
    reportedAria: (matched: number, total: number) => string;
    why: string;
    missing: string;
    against: string;
    noneTitle: string;
    noneBody: string;
    exercisesTitle: (area: string) => string;
    exercisesBody: (count: number) => string;
    exercisesLink: string;
    needTitle: string;
    needBody: string;
    book: string;
    home: string;
    disclaimer: string;
    handoverTitle: string;
    handoverBody: string;
    handoverButton: string;
  };
  language: string;
  /** The words only the RehabVerse intake adds around the same questions. */
  rehab: {
    kicker: string;
    historyTitle: string;
    historyLead: string;
    onset: string;
    duration: string;
    impact: string;
    errHistory: string;
    next: string;
    resultKicker: string;
    resultTitle: string;
    resultLead: string;
    waitingTitle: string;
    waitingBody: string;
    fractureNote: string;
    youAnswered: string;
    change: string;
    handoverNote: string;
  };
};

const en: CheckerCopy = {
  emergencyLead: "Emergency?",
  emergencyBody: "Chest pain, trouble breathing, sudden weakness or numbness, or loss of bladder/bowel control — call your local emergency number now (1122 in much of Pakistan). This tool is not for emergencies.",
  kicker: "PNA MSK Screening Assistant",
  badge: "Adults 18+ · Clinical screening",
  steps: ["Body area", "Your history", "Pain location", "Symptoms", "Safety check", "Result"],
  stepOf: (n, total) => `Step ${n} / ${total}`,
  progress: "Progress",
  start: { eyebrow: "Start here", title: "Where is your main problem?", lead: "Choose the body area that bothers you most. Simple wording comes first; the medical term is shown underneath." },
  history: { eyebrow: "Clinical context", title: "A few basics first", lead: "These details help separate injury, overuse and longer-term patterns.", age: "Your age", onset: "How did it start?", duration: "How long has it been present?", impact: "How much is it affecting normal life?" },
  pain: {
    title: "How strong is the pain right now?",
    optional: "(optional)",
    aria: "Pain right now from 0 (none) to 10 (worst imaginable)",
    none: "0 none",
    moderate: "5 moderate",
    worst: "10 worst",
    notSet: "Not set — slide to rate it, or skip.",
    set: (n) => `${n}/10`,
    clear: "Clear",
    valueText: (n) => (n === null ? "not set" : `${n} out of 10`),
  },
  location: { eyebrow: "Symptom location", title: "Where exactly do you feel it?", lead: "Choose the closest match for your main symptom location." },
  clues: { eyebrow: "Pattern matching", title: "Which statements fit you?", lead: "Select every option that clearly matches. Leave an option unticked if you are unsure — unsure is fine.", count: (n) => `${n} selected` },
  safety: {
    eyebrow: "Safety gate",
    title: "Safety check",
    lead: "Before showing musculoskeletal possibilities, we screen for symptoms that need medical care first. Tick anything that applies right now.",
    emergency: "Emergency warning",
    urgent: "Urgent warning",
    none: "None of these apply to me",
  },
  nav: { back: "Back", next: "Continue", show: "Show My Screening Result" },
  errors: {
    history: "Please choose your age range, how the problem started, how long it has been present and how much it affects daily activity.",
    location: "Please choose the location that best matches your symptoms.",
    safety: "Please confirm whether any safety warning applies, or choose ‘None of these apply’.",
  },
  result: {
    kicker: "Your screening result",
    title: (region) => `Possible ${region} patterns`,
    lead: "These are ranked compatibility patterns from your answers — not confirmed diagnoses.",
    stopTitle: "Medical assessment recommended",
    stopBody: "The checker has stopped before giving a musculoskeletal differential because one or more safety warnings were selected.",
    copyClinician: "Copy summary for a clinician",
    copied: "Copied",
    copyMine: "Copy summary for my clinician",
    again: "Start again",
    anotherProblem: "Check another problem",
    blocked: "Your browser blocked copying. Select and copy the text below:",
    urgency: (level) => `Urgency level ${level} of 3`,
    meter: ["Monitor", "Assess", "Prompt"],
    priority: "Next-step priority",
    nerve: "Nerve distribution hint",
    fracture: "Fracture screening",
    criteria: "Matched criteria",
    secondary: "The MSK possibilities below are secondary until a fracture is reasonably excluded.",
    mostCompatible: "Most compatible pattern",
    alternative: "Alternative possibility",
    headline: "Your answers fit this pattern best",
    headlineHow: "It is the closest match to what you reported. A physiotherapist confirms it by examining you.",
    headlineNot: "A screening pattern, not a confirmed diagnosis.",
    reported: (matched, total) => `You reported ${matched} of ${total} typical features`,
    reportedAria: (matched, total) => `You reported ${matched} of ${total} typical features`,
    why: "Why it matched",
    missing: "Often also present — not reported",
    against: "What argues against it",
    noneTitle: "No single pattern stands out strongly",
    noneBody: "Your answers are not specific enough for a useful ranking. An in-person assessment can clarify the source of symptoms.",
    exercisesTitle: (area) => `See gentle ${area} exercises in 3D`,
    exercisesBody: (count) => `${count} exercises performed step by step by the PNA virtual physiotherapist, in English or Roman Urdu. They are for learning, not a prescription: stop if pain increases, and have it assessed if it is not settling.`,
    exercisesLink: "Open the exercise library",
    needTitle: "Need a professional assessment?",
    needBody: "Book with Physio Nexus Academy for examination, confirmation of the clinical pattern and an individualized management plan.",
    book: "Book Appointment",
    home: "Request Home Visit",
    disclaimer: "This screening result does not replace physical examination, neurologic/vascular testing, imaging when indicated, or medical diagnosis. Your answers stay in this browser tab and are not saved.",
    handoverTitle: "Want a physiotherapist to look at this?",
    handoverBody: "Continue in PNA RehabVerse: your answers are carried over, you check them and add a few more details, and your physiotherapist reviews everything and prepares a programme. You need a RehabVerse account (the clinic approves new accounts).",
    handoverButton: "Send to a physiotherapist in RehabVerse",
  },
  language: "Language",
  rehab: {
    kicker: "Body check",
    historyTitle: "How it started, and for how long",
    historyLead: "Your age comes from your account. These answers help separate an injury, overuse and a longer-term problem.",
    onset: "How did it start?",
    duration: "How long has it been present?",
    impact: "How much is it affecting normal life?",
    errHistory: "Please choose how it started, how long it has been present and how much it affects daily life.",
    next: "Continue",
    resultKicker: "Your screening",
    resultTitle: "What your answers point to",
    resultLead: "This comes from your answers only — it is a screening, not a diagnosis. Your physiotherapist will go through the details and decide with you what is right for you.",
    waitingTitle: "Your screening will appear after review",
    waitingBody: "Your physiotherapist reviews your assessment first, and your screening is shown to you after that.",
    fractureNote: "Because this started with an injury and some answers need a check, your physiotherapist may ask for an in-person assessment (and possibly an X-ray) before exercises.",
    youAnswered: "Your answers",
    change: "Change",
    handoverNote: "Your answers from the symptom checker are filled in. Please check each one, and tell us how long you have had it (that was not asked there).",
  },
};

const ru: CheckerCopy = {
  emergencyLead: "Emergency hai?",
  emergencyBody: "Seene mein dard, saans lene mein mushkil, achanak kamzori ya sunn ho jana, ya peshab/pakhane par control na rehna — abhi emergency number par call karein (Pakistan mein aam tor par 1122). Yeh tool emergency ke liye nahi hai.",
  kicker: "PNA MSK Screening Assistant",
  badge: "Adults 18+ · Clinical screening",
  steps: ["Body ka hissa", "Aap ki history", "Dard ki jagah", "Symptoms", "Safety check", "Result"],
  stepOf: (n, total) => `Step ${n} / ${total}`,
  progress: "Progress",
  start: { eyebrow: "Yahan se shuru karein", title: "Aap ka main masla kahan hai?", lead: "Woh body area chunein jo sab se zyada tang kar raha hai. Pehle aasaan lafz, neeche medical term bhi likha hai." },
  history: { eyebrow: "Clinical context", title: "Pehle chand basic baatein", lead: "Yeh details chot, overuse aur purane masle mein farq karne mein madad karti hain.", age: "Aap ki age", onset: "Yeh kaise shuru hua?", duration: "Kitne arse se hai?", impact: "Rozmarra ki zindagi par kitna asar hai?" },
  pain: {
    title: "Abhi dard kitna strong hai?",
    optional: "(zaroori nahi)",
    aria: "Abhi ka dard 0 (bilkul nahi) se 10 (sab se zyada) tak",
    none: "0 bilkul nahi",
    moderate: "5 darmiyana",
    worst: "10 sab se zyada",
    notSet: "Set nahi kiya — slide karke batayein, ya chhor dein.",
    set: (n) => `${n}/10`,
    clear: "Hata dein",
    valueText: (n) => (n === null ? "set nahi" : `10 mein se ${n}`),
  },
  location: { eyebrow: "Symptom ki jagah", title: "Bilkul kahan mehsoos hota hai?", lead: "Apni main takleef ki jagah ke sab se qareeb option chunein." },
  clues: { eyebrow: "Pattern matching", title: "Kaun se statements aap par fit hote hain?", lead: "Jo options saaf tor par match karte hain unhein tick karein. Agar pakka nahi pata to khali chhor dein — pakka na hona bilkul theek hai.", count: (n) => `${n} chune gaye` },
  safety: {
    eyebrow: "Safety gate",
    title: "Safety check",
    lead: "Muscles aur joints ki possibilities dikhane se pehle hum woh symptoms check karte hain jin mein pehle doctor ko dikhana zaroori hai. Jo abhi aap par lagu hota hai usay tick karein.",
    emergency: "Emergency warning",
    urgent: "Urgent warning",
    none: "Mujh par inmein se koi lagu nahi hota",
  },
  nav: { back: "Wapas", next: "Aage chalein", show: "Mera Screening Result Dikhayein" },
  errors: {
    history: "Meherbani karke apni age, masla kaise shuru hua, kitne arse se hai aur rozmarra kaam par kitna asar hai — yeh sab chun lein.",
    location: "Meherbani karke woh jagah chunein jo aap ke symptoms se sab se zyada milti ho.",
    safety: "Meherbani karke batayein ke koi safety warning lagu hoti hai ya nahi, ya ‘Mujh par inmein se koi lagu nahi hota’ chunein.",
  },
  result: {
    kicker: "Aap ka screening result",
    title: (region) => `Mumkin ${region} patterns`,
    lead: "Yeh aap ke jawabon se bane ranked compatibility patterns hain — confirmed diagnosis nahi.",
    stopTitle: "Medical assessment recommend hai",
    stopBody: "Aap ne ek ya zyada safety warning chuni hain, is liye checker muscles/joints ki possibilities dikhane se pehle hi ruk gaya hai.",
    copyClinician: "Clinician ke liye summary copy karein",
    copied: "Copy ho gaya",
    copyMine: "Apne clinician ke liye summary copy karein",
    again: "Dobara shuru karein",
    anotherProblem: "Koi aur masla check karein",
    blocked: "Aap ke browser ne copy block kar diya. Neeche likha text select karke copy kar lein:",
    urgency: (level) => `Urgency level 3 mein se ${level}`,
    meter: ["Nazar rakhein", "Assess karwayein", "Jaldi"],
    priority: "Agla qadam kitna zaroori hai",
    nerve: "Nerve distribution ka ishara",
    fracture: "Fracture screening",
    criteria: "Jo criteria match hue",
    secondary: "Neeche di gayi MSK possibilities ab doosre number par hain, jab tak fracture ko theek se exclude na kar liya jaye.",
    mostCompatible: "Sab se zyada match karne wala pattern",
    alternative: "Doosri possibility",
    headline: "Aap ke jawab is pattern se sab se zyada milte hain",
    headlineHow: "Jo aap ne bataya usay yeh sab se qareeb se match karta hai. Physiotherapist aap ko examine karke isay confirm karta hai.",
    headlineNot: "Yeh screening pattern hai, confirmed diagnosis nahi.",
    reported: (matched, total) => `Aap ne ${total} mein se ${matched} typical features bataye`,
    reportedAria: (matched, total) => `Aap ne ${total} mein se ${matched} typical features bataye`,
    why: "Yeh kyun match hua",
    missing: "Aksar saath hota hai — aap ne nahi bataya",
    against: "Kya is ke khilaf jata hai",
    noneTitle: "Koi ek pattern wazeh tor par nazar nahi aa raha",
    noneBody: "Aap ke jawab itne specific nahi ke kaam ki ranking ban sake. In-person assessment se masle ka source saaf ho sakta hai.",
    exercisesTitle: (area) => `Halki ${area} exercises 3D mein dekhein`,
    exercisesBody: (count) => `${count} exercises, PNA ka virtual physiotherapist step by step karke dikhata hai, English ya Roman Urdu mein. Yeh seekhne ke liye hain, prescription nahi: dard barhe to ruk jayein, aur agar theek na ho raha ho to assess karwayein.`,
    exercisesLink: "Exercise library kholein",
    needTitle: "Professional assessment chahiye?",
    needBody: "Physio Nexus Academy ke saath book karein: examination, clinical pattern ki confirmation aur aap ke liye individualized management plan.",
    book: "Appointment Book Karein",
    home: "Home Visit Request Karein",
    disclaimer: "Yeh screening result physical examination, neurologic/vascular testing, zaroorat par imaging ya medical diagnosis ka badal nahi hai. Aap ke jawab sirf is browser tab mein rehte hain, save nahi hote.",
    handoverTitle: "Chahte hain koi physiotherapist isay dekhe?",
    handoverBody: "PNA RehabVerse mein aage barhein: aap ke jawab saath chale jate hain, aap unhein check karke kuch aur tafseel dete hain, aur aap ka physiotherapist sab kuch review karke programme tayyar karta hai. Iske liye RehabVerse account chahiye (naye account ko clinic approve karta hai).",
    handoverButton: "RehabVerse mein physiotherapist ko bhejein",
  },
  language: "Zubaan",
  rehab: {
    kicker: "Body check",
    historyTitle: "Kaise shuru hua, aur kitne arse se",
    historyLead: "Aap ki age aap ke account se li gayi hai. Yeh jawab chot, overuse aur purane masle mein farq karne mein madad karte hain.",
    onset: "Yeh kaise shuru hua?",
    duration: "Kitne arse se hai?",
    impact: "Rozmarra ki zindagi par kitna asar hai?",
    errHistory: "Meherbani karke chunein ke yeh kaise shuru hua, kitne arse se hai aur rozmarra ki zindagi par kitna asar hai.",
    next: "Aage chalein",
    resultKicker: "Aap ki screening",
    resultTitle: "Aap ke jawab kis taraf ishara karte hain",
    resultLead: "Yeh sirf aap ke jawabon se bani hai — screening hai, diagnosis nahi. Aap ka physiotherapist tafseel dekh kar aap ke saath tay karega ke aap ke liye kya theek hai.",
    waitingTitle: "Aap ki screening review ke baad nazar aayegi",
    waitingBody: "Pehle aap ka physiotherapist aap ka assessment review karta hai, uske baad aap ko screening dikhayi jati hai.",
    fractureNote: "Kyunke yeh chot se shuru hua aur kuch jawabon ko check ki zaroorat hai, aap ka physiotherapist exercises se pehle in-person assessment (aur shayad X-ray) ke liye keh sakta hai.",
    youAnswered: "Aap ke jawab",
    change: "Badlein",
    handoverNote: "Symptom checker ke aap ke jawab bhar diye gaye hain. Meherbani karke har jawab check karein, aur batayein ke yeh kitne arse se hai (wahan yeh nahi poocha gaya tha).",
  },
};

export const checkerCopy = (lang: CheckerLang): CheckerCopy => (lang === "ru" ? ru : en);
export const CHECKER_COPY = { en, ru } as const;
