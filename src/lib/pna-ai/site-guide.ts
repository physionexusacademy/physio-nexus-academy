/**
 * Physio Nexus AI — what the academy offers, in plain English and Roman Urdu.
 * One authored entry per flagship feature (the seven on the homepage, plus the overview and a few hubs).
 * Used to answer "what is X?", "what does the website have?" and "how do I start?" — grounded, never generated.
 * Pure data, no imports.
 */
export type SiteFeature = {
  /** Page the entry belongs to. Existing resources with the same href are enriched; new ones are added. */
  href: string;
  id: string;
  title: string;
  category: string;
  summary: string;
  hookUr: string;
  points: string[];
  pointsUr: string[];
  /** Curated names people search with (weighted above body text). */
  tags: string;
  keywords: string;
  /** Add a new resource when no existing one has this href. */
  create?: boolean;
};

export const siteGuide: SiteFeature[] = [
  {
    href: "/#features",
    id: "overview",
    create: true,
    title: "What Physio Nexus Academy offers",
    category: "About PNA",
    summary:
      "Physio Nexus Academy (PNA) is Pakistan's online physiotherapy academy: free step-by-step lessons, 3D practice patients, a clinical skills lab, manual therapy techniques, guided home rehab, a daily challenge, books and hands-on CPD workshops — in English and Roman Urdu.",
    hookUr:
      "Physio Nexus Academy (PNA) Pakistan ki online physiotherapy academy hai: free step-by-step lessons, 3D practice patients, clinical skills lab, manual therapy, ghar par guided rehab, daily challenge, books aur hands-on CPD workshops — English aur Roman Urdu dono mein.",
    points: [
      "**PNA Teacher** — free lessons, one small step at a time",
      "**Clinical Skills Lab** — practise muscle testing, goniometry and neuro exam in 3D",
      "**Virtual Patient** — examine a 3D patient and get an OSCE score",
      "**RehabVerse** — guided 3D home rehab built by your physiotherapist",
      "**Manual Therapy** — 35 techniques with hand placement and safety",
      "**Daily Clinical Challenge** — 5 questions a day and a leaderboard",
      "**Books** — printed physiotherapy books by Dr. Sajjad Raza PT",
    ],
    pointsUr: [
      "**PNA Teacher** — free lessons, ek ek chhota qadam",
      "**Clinical Skills Lab** — muscle testing, goniometry aur neuro exam 3D mein practice karein",
      "**Virtual Patient** — 3D patient ko examine karein aur OSCE score payein",
      "**RehabVerse** — aap ke physiotherapist ka banaya hua ghar par 3D rehab",
      "**Manual Therapy** — 35 techniques, hand placement aur safety ke saath",
      "**Daily Clinical Challenge** — rozana 5 sawal aur leaderboard",
      "**Books** — Dr. Sajjad Raza PT ki printed physiotherapy books",
    ],
    tags: "overview website offer offers features everything sections kya hai pna about start here what can i do explore academy services",
    keywords: "physio nexus academy what do you offer what is on this website what can I do here start beginner new student patient clinician features learn practise recover",
  },
  {
    href: "/learn",
    id: "teacher",
    title: "PNA Teacher",
    category: "Learn",
    summary: "Free step-by-step physiotherapy lessons with analogies, clinical use, quick checks and flashcards — in English or Roman Urdu.",
    hookUr: "PNA Teacher mushkil concepts ko ek ek chhote qadam mein samjhata hai — analogy, clinical use, checks aur flashcards ke saath, English ya Roman Urdu mein.",
    points: [
      "Each lesson takes about 10 minutes: one idea, a picture-it analogy, why it matters in the clinic, and quick checks",
      "Switch between English and Roman Urdu at any time, or tap “explain more simply”",
      "Flashcards and spaced review help you remember it for exams",
      "Free to use — no sign-up needed",
    ],
    pointsUr: [
      "Har lesson taqreeban 10 minute ka hai: ek idea, ek analogy, clinic mein is ki ahmiyat aur chhote checks",
      "Kisi bhi waqt English aur Roman Urdu badal sakte hain, ya “aur aasan karein” dabayein",
      "Flashcards aur spaced review exam ke liye yaad rakhne mein madad karte hain",
      "Bilkul free — sign-up ki zaroorat nahi",
    ],
    tags: "pna teacher lessons learn teach study concepts step by step roman urdu course",
    keywords: "pna teacher what is lessons free learn physiotherapy concepts students",
  },
  {
    href: "/skills",
    id: "skills",
    title: "Clinical Skills Lab",
    category: "Practise",
    summary: "Practise manual muscle testing, goniometry, neuro exam, balance, posture and more — with 3D demonstrations, quizzes and OSCE stations.",
    hookUr: "Clinical Skills Lab mein aap MMT, goniometry, neuro exam, balance aur posture jaisi skills 3D demonstrations, quizzes aur OSCE stations ke saath practice karte hain.",
    points: [
      "Practise manual muscle testing, goniometry, dermatomes, reflexes, balance, posture and more",
      "Four levels from Beginner to Expert, each with a level test",
      "3D demonstrations, flashcards and OSCE stations",
    ],
    pointsUr: [
      "Manual muscle testing, goniometry, dermatomes, reflexes, balance, posture aur mazeed skills practice karein",
      "Beginner se Expert tak chaar levels, har level ka apna test",
      "3D demonstrations, flashcards aur OSCE stations",
    ],
    tags: "skills lab clinical skills practise osce mmt goniometry practical",
    keywords: "clinical skills lab what is skills practise levels beginner expert osce 3d demonstrations",
  },
  {
    href: "/virtual-patient",
    id: "virtual-patient",
    title: "Virtual Patient",
    category: "Practise",
    summary: "Examine a realistic 3D patient — history, positioning, goniometry, MMT, reflexes, sensation, palpation and special tests — then diagnose and get an OSCE-style score.",
    hookUr: "Virtual Patient mein aap asli patient ki tarah 3D patient ko examine karte hain — history se special tests tak — phir diagnosis karte hain aur OSCE-style score paate hain.",
    points: [
      "Take the history, position the patient, measure range, test strength, reflexes and sensation",
      "Find the hidden diagnosis — red flags included",
      "Get an OSCE-style score; choose guided mode or timed OSCE mode",
    ],
    pointsUr: [
      "History lein, patient ko position karein, range naapein, strength, reflexes aur sensation test karein",
      "Chhupi hui diagnosis dhoondein — red flags bhi shamil hain",
      "OSCE-style score payein; guided mode ya timed OSCE mode chunein",
    ],
    tags: "virtual patient 3d patient examine simulator osce diagnosis practice",
    keywords: "virtual patient how to use examine 3d patient diagnose score osce guided",
  },
  {
    href: "/rehabverse",
    id: "rehabverse",
    create: true,
    title: "PNA RehabVerse — guided 3D home rehab",
    category: "Care",
    summary:
      "RehabVerse is guided rehab at home: your physiotherapist reviews your assessment and approves an exercise programme, and every exercise is shown by a 3D virtual physio guide, in English or Roman Urdu.",
    hookUr:
      "RehabVerse ghar par guided rehab hai: aap ka physiotherapist aap ka assessment dekh kar exercise programme approve karta hai, aur har exercise 3D virtual physio guide dikhata hai — English ya Roman Urdu mein.",
    points: [
      "Create your account — one minute, with a clear consent step",
      "Answer simple questions about your pain, plus safety questions",
      "Your physiotherapist reviews them and builds your programme",
      "Follow each day with 3D demos; your feedback opens the next day safely",
      "It supports your care and is not for emergencies",
    ],
    pointsUr: [
      "Apna account banayein — sirf ek minute, wazeh consent ke saath",
      "Apne dard ke baare mein aasan sawalon aur safety sawalon ke jawab dein",
      "Aap ka physiotherapist unhein dekh kar aap ka programme banata hai",
      "Har din 3D demos ke saath exercise karein; aap ka feedback agla din safely kholta hai",
      "Yeh aap ki care ko support karta hai — emergency ke liye nahi hai",
    ],
    tags: "rehabverse rehab verse home rehab ghar par 3d exercise programme account register create account physio guide",
    keywords: "rehabverse what is how do I start create account register login sign up home exercises programme patient guided 3d library",
  },
  {
    href: "/manual-therapy",
    id: "manual-therapy",
    create: true,
    title: "Manual Therapy — 35 techniques",
    category: "Learn",
    summary: "35 manual therapy techniques with hand placement, dosage, contraindications and safety, each taught step by step with PNA Teacher.",
    hookUr: "Manual Therapy mein 35 techniques hain — hand placement, dosage, contraindications aur safety ke saath — har ek PNA Teacher ke saath qadam ba qadam.",
    points: [
      "35 techniques, from Maitland and Mulligan to muscle energy, myofascial release and more",
      "Each chapter shows hand placement, dosage, indications and when NOT to use it",
      "Open any chapter with PNA Teacher: analogy, safety, steps with reasons, a patient case and checks",
    ],
    pointsUr: [
      "35 techniques — Maitland aur Mulligan se muscle energy, myofascial release tak",
      "Har chapter hand placement, dosage, indications aur kab istemal NAHI karni batata hai",
      "Kisi bhi chapter ko PNA Teacher ke saath kholein: analogy, safety, wajah ke saath steps, patient case aur checks",
    ],
    tags: "manual therapy techniques hand placement mobilization manipulation encyclopedia chapters",
    keywords: "manual therapy how many techniques what is hands on technique library",
  },
  {
    href: "/conditions",
    id: "conditions",
    create: true,
    title: "Conditions & Treatment Guide",
    category: "Learn",
    summary: "48 conditions by body area, each at three depths (quick guide, clinical plan, expert detail) with a stage-by-stage treatment plan.",
    hookUr: "Conditions & Treatment Guide mein 48 conditions hain — body area ke hisaab se — har ek teen depth par (quick, clinical, expert) aur stage-by-stage treatment plan ke saath.",
    points: [
      "Find a condition by body area, kind of problem, or an everyday name like “sciatica”",
      "Quick guide: what it feels like, warning signs and what helps first",
      "Clinical plan: assessment, key tests and a stage planner with doses and rules for when to progress",
      "Expert detail: mechanism, test technique, manual therapy, evidence and a case story",
    ],
    pointsUr: [
      "Body area, problem ki qisam ya “sciatica” jaise aam naam se condition dhoondein",
      "Quick guide: kaisa mehsoos hota hai, warning signs aur shuru mein kya madad karta hai",
      "Clinical plan: assessment, key tests aur stage planner — doses aur agle stage ke rules ke saath",
      "Expert detail: mechanism, test technique, manual therapy, evidence aur case story",
    ],
    tags: "conditions treatment guide plans stage planner depth quick clinical expert",
    keywords: "conditions and treatment guide what is treatment plans by body area stages rehab",
  },
  {
    href: "/case-lab",
    id: "case-lab",
    create: true,
    title: "Clinical Case Lab",
    category: "Practise",
    summary: "Real, reasoned physiotherapy cases to work through step by step — history, findings, differentials and a plan.",
    hookUr: "Case Lab mein asli-style physiotherapy cases hain jin par aap qadam ba qadam reasoning karte hain — history, findings, differentials aur plan.",
    points: [
      "Work through a case: history, findings, differential diagnosis and plan",
      "Reading-first, with clear limits on what each case can and cannot tell us",
      "Great for building clinical reasoning for exams and practice",
    ],
    pointsUr: [
      "Case par kaam karein: history, findings, differential diagnosis aur plan",
      "Pehle parhna, phir sochna — har case ki hadood bhi wazeh hain",
      "Exams aur practice ke liye clinical reasoning banane ka behtareen tareeqa",
    ],
    tags: "case lab cases clinical reasoning case studies reports",
    keywords: "case lab what is cases clinical reasoning differential",
  },
  {
    href: "/daily-challenge",
    id: "daily-challenge",
    title: "Daily Clinical Challenge",
    category: "Practise",
    summary: "Five timed clinical questions every day. Score points, learn from every explanation and climb the public leaderboard.",
    hookUr: "Daily Clinical Challenge mein rozana 5 timed clinical sawal hote hain. Points kamayein, har explanation se seekhein aur public leaderboard par upar jayein.",
    points: [
      "Five questions a day, 30 seconds each, up to 100 points",
      "Learn from the explanation after every answer",
      "A public leaderboard resets at midnight Pakistan time; it is learning activity, not certification",
    ],
    pointsUr: [
      "Rozana 5 sawal, har ek ke 30 seconds, ziyada se ziyada 100 points",
      "Har jawab ke baad explanation se seekhein",
      "Public leaderboard Pakistan ke waqt ke mutabiq raat 12 baje reset hota hai; yeh seekhne ki activity hai, certification nahi",
    ],
    tags: "daily challenge daily quiz leaderboard points mcq quiz",
    keywords: "daily clinical challenge what is how it works questions points leaderboard",
  },
  {
    href: "/resources",
    id: "books",
    title: "Books by Dr. Sajjad Raza PT",
    category: "Books",
    summary: "Printed physiotherapy books by Dr. Sajjad Raza PT — order online and get an Order ID and a delivery estimate.",
    hookUr: "Dr. Sajjad Raza PT ki printed physiotherapy books — online order karein aur Order ID aur delivery estimate payein.",
    points: [
      "All printed books are listed on the homepage and on the Books & Resources page",
      "Order online in a minute — every order gets its own Order ID and a delivery estimate",
    ],
    pointsUr: [
      "Tamam printed books homepage aur Books & Resources page par maujood hain",
      "Ek minute mein online order karein — har order ko apna Order ID aur delivery estimate milta hai",
    ],
    tags: "books book order buy purchase textbook physiotherapy books dr sajjad raza",
    keywords: "books where can I buy order books price delivery sajjad raza pt",
  },
  {
    href: "/workshops",
    id: "workshops",
    title: "Workshops & CPD",
    category: "Hands-on learning",
    summary: "Hands-on CPD workshops across Pakistan with verifiable certificates. PNA is an approved CPD provider (#791052).",
    hookUr: "Pakistan bhar mein hands-on CPD workshops — verifiable certificates ke saath. PNA ek approved CPD provider hai (#791052).",
    points: [
      "Practical, hands-on workshops you can register for online",
      "Certificates can be verified on the Verify page",
      "PNA is an approved CPD provider (#791052)",
    ],
    pointsUr: [
      "Practical, hands-on workshops jin ke liye aap online register kar sakte hain",
      "Certificates Verify page par check kiye ja sakte hain",
      "PNA ek approved CPD provider hai (#791052)",
    ],
    tags: "workshops cpd training hands on certificate register",
    keywords: "workshops and cpd what is register certificates approved provider",
  },
];
