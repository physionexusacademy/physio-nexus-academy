import type { TeacherLesson } from "../types.ts";

export const openVsClosedChain: TeacherLesson = {
  slug: "open-vs-closed-chain",
  title: "Open vs Closed Kinetic Chain — The Foot Decides",
  hook: {
    en: "Look at just one thing — the hand or the foot — and you'll classify any exercise in 3 seconds.",
    ur: "Sirf ek cheez dekhein — hand ya foot — aur kisi bhi exercise ko 3 second mein classify karein.",
  },
  area: "Movement Science",
  level: "Foundation",
  bestFor: "2nd–3rd year DPT",
  minutes: 8,
  goal: {
    en: "By the end, you'll classify any exercise as open or closed chain and explain why it matters after a knee injury.",
    ur: "End tak aap kisi bhi exercise ko open ya closed chain mein classify kar sakenge aur bata sakenge ke knee injury ke baad yeh kyun zaroori hai.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Here's the secret that makes this topic easy: you only need to look at **one thing — the far end of the limb** (the hand or the foot).",
        ur: "Is topic ko asaan banane wala raaz: sirf **ek cheez dekhni hai — limb ka aakhri sira** (hand ya foot).",
      },
    },
    {
      type: "say",
      text: {
        en: "**Open kinetic chain (OKC)**: the distal segment is **free to move** in space. Examples: seated knee extension, kicking a ball, a biceps curl.\n**Closed kinetic chain (CKC)**: the distal segment is **fixed** against something — floor, wall, bar — and the body moves over it. Examples: squat, lunge, push-up.",
        ur: "**Open kinetic chain (OKC)**: distal hissa hawa mein **azaadi se move** karta hai. Misaalein: baith kar knee extension, ball ko kick, biceps curl.\n**Closed kinetic chain (CKC)**: distal hissa kisi cheez — farsh, deewar, bar — par **fixed** hota hai aur body us ke upar move karta hai. Misaalein: squat, lunge, push-up.",
      },
      simpler: {
        en: "Hand or foot moving freely in the air = open. Hand or foot stuck on the floor/wall = closed.",
        ur: "Hand ya foot hawa mein azaad = open. Hand ya foot farsh/deewar par tika hua = closed.",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Open chain is like **waving a flag** — the end moves freely. Closed chain is like **pushing a car** — your hands stay on the car and your body does the moving.",
        ur: "Open chain **jhanda lehrane** jaisa hai — sira azaadi se hilta hai. Closed chain **gaari ko dhakka dene** jaisa hai — hand gaari par tikay rehte hain aur body move karta hai.",
      },
    },
    {
      type: "sort",
      prompt: {
        en: "Your turn. Sort each exercise — tap Open or Closed.",
        ur: "Ab aap ki baari. Har exercise ko sort karein — Open ya Closed par tap karein.",
      },
      categories: [
        { en: "Open chain", ur: "Open chain" },
        { en: "Closed chain", ur: "Closed chain" },
      ],
      items: [
        {
          text: { en: "Seated knee extension", ur: "Baith kar knee extension" },
          answer: 0,
          why: { en: "The foot moves freely through the air.", ur: "Foot hawa mein azaadi se move karta hai." },
        },
        {
          text: { en: "Squat", ur: "Squat" },
          answer: 1,
          why: { en: "Feet fixed on the floor; the body moves over them.", ur: "Foot farsh par fixed; body un ke upar move karta hai." },
        },
        {
          text: { en: "Push-up", ur: "Push-up" },
          answer: 1,
          why: { en: "Hands fixed on the floor.", ur: "Hand farsh par fixed." },
        },
        {
          text: { en: "Biceps curl", ur: "Biceps curl" },
          answer: 0,
          why: { en: "The hand moves freely with the dumbbell.", ur: "Hand dumbbell ke saath azaadi se move karta hai." },
        },
        {
          text: { en: "Straight-leg raise", ur: "Straight-leg raise" },
          answer: 0,
          why: { en: "The foot lifts freely off the bed.", ur: "Foot bed se azaadi se uthta hai." },
        },
        {
          text: { en: "Wall squat", ur: "Wall squat" },
          answer: 1,
          why: { en: "Feet fixed on the floor, back on the wall.", ur: "Foot farsh par fixed, back deewar par." },
        },
        {
          text: { en: "Pull-up", ur: "Pull-up" },
          answer: 1,
          why: { en: "Hands fixed on the bar; the body moves up.", ur: "Hand bar par fixed; body upar jata hai." },
        },
      ],
    },
    {
      type: "say",
      text: {
        en: "Why does it matter? They load joints differently. **CKC** exercises usually involve **several joints working together**, with muscle **co-contraction**, and they look like daily tasks — standing up, stairs. **OKC** exercises **isolate** a muscle — perfect for targeting a specific weakness, like the quadriceps.",
        ur: "Yeh kyun zaroori hai? Dono joints ko alag tarah load karte hain. **CKC** mein aam tor par **kai joints mil kar** kaam karte hain, muscles ki **co-contraction** hoti hai, aur yeh rozmarra ke kaamon jaisi hain — uthna, seerhiyan. **OKC** ek muscle ko **isolate** karti hai — kisi khaas weakness, jaise quadriceps, ko target karne ke liye behtareen.",
      },
    },
    {
      type: "check",
      question: {
        en: "A patient's quadriceps is much weaker than the other muscles of the leg. Which exercise best ISOLATES the quadriceps?",
        ur: "Patient ka quadriceps leg ke baqi muscles se kaafi weak hai. Kaun si exercise quadriceps ko sab se behtar ISOLATE karti hai?",
      },
      options: [
        {
          text: { en: "Seated knee extension", ur: "Baith kar knee extension" },
          correct: true,
          feedback: {
            en: "Right — open chain and single-joint, so the quadriceps can't hide behind the hip and ankle muscles.",
            ur: "Sahi — open chain aur single-joint, is liye quadriceps hip aur ankle muscles ke peeche chhup nahi sakta.",
          },
        },
        {
          text: { en: "Squat", ur: "Squat" },
          feedback: {
            en: "A squat is excellent and functional — but the hip and ankle muscles share the work, so a weak quadriceps can be compensated for.",
            ur: "Squat zabardast aur functional hai — lekin hip aur ankle muscles kaam baant lete hain, is liye weak quadriceps ki kami poori ho jati hai.",
          },
        },
        {
          text: { en: "Walking lunge", ur: "Walking lunge" },
          feedback: {
            en: "Lunges are closed chain and multi-joint — great later, but not the best way to isolate one muscle.",
            ur: "Lunges closed chain aur multi-joint hain — baad mein zabardast, lekin ek muscle isolate karne ka behtareen tareeqa nahi.",
          },
        },
      ],
    },
    {
      type: "check",
      question: {
        en: "Which exercise best combines several lower-limb joints with the foot fixed — closest to rising from a chair?",
        ur: "Kaun si exercise foot fixed rakh kar kai lower-limb joints ko milati hai — kursi se uthne ke sab se qareeb?",
      },
      options: [
        {
          text: { en: "Sit-to-stand", ur: "Sit-to-stand" },
          correct: true,
          feedback: {
            en: "Yes — closed chain, multi-joint and directly task-specific.",
            ur: "Haan — closed chain, multi-joint aur seedha task-specific.",
          },
        },
        {
          text: { en: "Seated knee extension", ur: "Baith kar knee extension" },
          feedback: {
            en: "Great for isolating the quadriceps, but it's open chain and single-joint.",
            ur: "Quadriceps isolate karne ke liye zabardast, lekin yeh open chain aur single-joint hai.",
          },
        },
        {
          text: { en: "Hamstring curl machine", ur: "Hamstring curl machine" },
          feedback: {
            en: "Open chain and isolating the hamstrings — not the multi-joint pattern of standing up.",
            ur: "Open chain aur hamstrings ko isolate karti hai — uthne wala multi-joint pattern nahi.",
          },
        },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "After ACL reconstruction, the quadriceps becomes very weak. For years, open-chain knee extension was avoided early because of worry about strain on the graft. Current evidence-based guidance supports using **both**: open-chain knee extension is introduced in a **restricted range** (commonly 90°–45° of knee flexion) and progressed over time — always in line with the surgeon's protocol and graft type.",
        ur: "ACL reconstruction ke baad quadriceps bohat weak ho jata hai. Saalon tak graft par strain ke dar se shuru mein open-chain knee extension se parhez kiya jata tha. Aaj ki evidence-based guidance **dono** ki himayat karti hai: open-chain knee extension **mehdood range** (aam tor par 90°–45° knee flexion) mein shuru ki jati hai aur waqt ke saath barhayi jati hai — hamesha surgeon ke protocol aur graft type ke mutabiq.",
      },
    },
    {
      type: "mistake",
      text: {
        en: "A common mistake: \"closed chain = safe, open chain = dangerous\". Both are tools. The real questions are: **how much load, through which range, at what stage of healing**?",
        ur: "Aam ghalti: \"closed chain = mehfooz, open chain = khatarnak\". Dono auzaar hain. Asal sawal yeh hain: **kitna load, kis range mein, healing ke kis marhale par**?",
      },
    },
    {
      type: "check",
      question: {
        en: "A patient lies supine and lifts a straight leg off the bed. Which type of exercise is this?",
        ur: "Patient seedha leta hai aur seedhi leg bed se uthata hai. Yeh kis qism ki exercise hai?",
      },
      options: [
        {
          text: { en: "Open kinetic chain", ur: "Open kinetic chain" },
          correct: true,
          feedback: {
            en: "Right — the foot is free in the air.",
            ur: "Sahi — foot hawa mein azaad hai.",
          },
        },
        {
          text: { en: "Closed kinetic chain", ur: "Closed kinetic chain" },
          feedback: {
            en: "The foot isn't fixed against anything — it's moving freely, so it's open chain.",
            ur: "Foot kisi cheez par tika hua nahi — azaadi se move kar raha hai, is liye open chain.",
          },
        },
      ],
    },
    {
      type: "say",
      text: {
        en: "Viva pro tip: some exercises are hard to classify — leg press, cycling, an exercise bike. Don't panic. Explain your reasoning: **is the distal segment fixed or free? Is load going up through the foot?** Examiners reward clear reasoning more than a one-word label.",
        ur: "Viva pro tip: kuch exercises classify karna mushkil hai — leg press, cycling. Ghabrayein nahi. Apni reasoning batayein: **distal hissa fixed hai ya azaad? Kya load foot se upar aa raha hai?** Examiner ek lafz ke label se zyada saaf reasoning ko number dete hain.",
      },
    },
  ],
  summary: [
    { en: "Look at the distal segment: free = open chain; fixed = closed chain.", ur: "Distal hissa dekhein: azaad = open chain; fixed = closed chain." },
    {
      en: "Closed chain = multi-joint and functional; open chain = isolates a muscle.",
      ur: "Closed chain = multi-joint aur functional; open chain = ek muscle isolate karti hai.",
    },
    {
      en: "Both are tools — choose by load, range and healing stage (e.g. after ACL reconstruction).",
      ur: "Dono auzaar hain — load, range aur healing stage dekh kar chunein (maslan ACL reconstruction ke baad).",
    },
  ],
  flashcards: [
    {
      id: "oc-1",
      front: { en: "Define an open kinetic chain exercise.", ur: "Open kinetic chain exercise ki definition?" },
      back: { en: "The distal segment (hand/foot) is free to move in space — e.g. seated knee extension.", ur: "Distal hissa (hand/foot) hawa mein azaad — maslan baith kar knee extension." },
    },
    {
      id: "oc-2",
      front: { en: "Define a closed kinetic chain exercise.", ur: "Closed kinetic chain exercise ki definition?" },
      back: { en: "The distal segment is fixed and the body moves over it — e.g. squat, push-up.", ur: "Distal hissa fixed aur body us ke upar move kare — maslan squat, push-up." },
    },
    {
      id: "oc-3",
      front: { en: "Main advantage of closed chain exercise?", ur: "Closed chain exercise ka asal faida?" },
      back: { en: "Multi-joint, co-contraction, closer to functional tasks like standing up and stairs.", ur: "Multi-joint, co-contraction, uthne aur seerhiyon jaise functional kaamon ke qareeb." },
    },
    {
      id: "oc-4",
      front: { en: "Open-chain knee extension after ACL reconstruction?", ur: "ACL reconstruction ke baad open-chain knee extension?" },
      back: {
        en: "Can be used — introduced in a restricted range (commonly 90°–45°) and progressed per the surgeon's protocol.",
        ur: "Use ho sakti hai — mehdood range (aam tor par 90°–45°) mein shuru, surgeon ke protocol ke mutabiq barhayein.",
      },
    },
  ],
  goDeeper: [
    {
      title: "ACL Reconstruction Rehabilitation",
      href: "/treatment-plans/acl-reconstruction-rehabilitation",
      note: { en: "See OKC and CKC placed into a real rehab timeline.", ur: "OKC aur CKC ko asli rehab timeline mein dekhein." },
    },
    {
      title: "ACL Injury",
      href: "/msk-injuries/acl-injury",
      note: { en: "Understand the injury behind the exercises.", ur: "Exercises ke peeche ki injury samjhein." },
    },
    {
      title: "Patellofemoral Pain",
      href: "/treatment-plans/patellofemoral-pain",
      note: { en: "Another knee where exercise choice matters.", ur: "Ek aur knee jahan exercise ka chunao ahem hai." },
    },
  ],
  sources: [
    { citation: "Kisner C, Colby LA, Borstad J. Therapeutic Exercise: Foundations and Techniques. 7th ed. F.A. Davis; 2017." },
    {
      citation:
        "van Melick N, van Cingel REH, Brooijmans F, et al. Evidence-based clinical practice update: practice guidelines for anterior cruciate ligament rehabilitation based on a systematic review and multidisciplinary consensus. Br J Sports Med. 2016;50(24):1506–1515.",
      pubmedQuery: "Evidence-based clinical practice update practice guidelines for anterior cruciate ligament rehabilitation multidisciplinary consensus",
    },
  ],
};
