import type { TeacherLesson } from "../types.ts";

export const convexConcaveRule: TeacherLesson = {
  slug: "convex-concave-rule",
  title: "The Convex–Concave Rule",
  hook: {
    en: "Stop memorising roll and glide. See it once and you'll never forget it.",
    ur: "Roll aur glide ka ratta band. Ek baar dekh lein, phir kabhi nahi bhoolenge.",
  },
  area: "Movement Science",
  level: "Foundation",
  bestFor: "1st–2nd year DPT",
  minutes: 10,
  goal: {
    en: "By the end, you'll know which way a joint surface glides — and how that decides your mobilization direction.",
    ur: "Is lesson ke end tak aap jaan jayenge ke joint surface kis taraf glide karti hai — aur yehi aap ki mobilization ki direction decide karta hai.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Let me start with a confession: most students memorise this rule and forget it by the next exam. So today we won't memorise. We'll **see** it.",
        ur: "Pehle ek sachi baat: zyada tar students yeh rule ratta laga kar yaad karte hain aur agle exam tak bhool jaate hain. Is liye aaj hum ratta nahi lagayenge — hum isay **dekh kar** samjhenge.",
      },
    },
    {
      type: "say",
      text: {
        en: "Two words first. **Osteokinematics** is the movement of the whole bone that you can see — flexion, abduction, rotation. **Arthrokinematics** is the tiny movement between the joint surfaces that you can't see: **roll, glide (slide) and spin**.",
        ur: "Pehle do alfaaz. **Osteokinematics** poori bone ki woh movement hai jo nazar aati hai — flexion, abduction, rotation. **Arthrokinematics** joint ke andar surfaces ki chhoti movement hai jo nazar nahi aati: **roll, glide (slide) aur spin**.",
      },
      simpler: {
        en: "Big movement you can see = osteokinematics. Tiny movement inside the joint = arthrokinematics.",
        ur: "Bari movement jo aankh se nazar aaye = osteokinematics. Joint ke andar chhoti movement = arthrokinematics.",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Picture a car tyre on a road. **Roll**: new points on the tyre touch new points on the road — normal driving. **Glide**: the same point of the tyre slides along the road — skidding on ice. **Spin**: the tyre turns on one spot — a wheel stuck in mud. Joint surfaces usually **roll and glide together**.",
        ur: "Socho road par gaari ka tyre hai. **Roll**: tyre ke naye points road ke naye points ko chhootay hain — normal driving. **Glide**: tyre ka ek hi point road par phisalta hai — jaise barf par skid. **Spin**: tyre ek hi jagah ghoomta hai — jaise keechar mein phansa pahiya. Joint surfaces aam tor par **roll aur glide saath saath** karti hain.",
      },
    },
    {
      type: "say",
      text: {
        en: "In most joints one surface is **convex** — it bulges outward like the back of a spoon. The other is **concave** — hollow like the inside of a spoon.",
        ur: "Zyada tar joints mein ek surface **convex** hoti hai — bahar ko ubhri hui, jaise chamach ki pusht. Doosri **concave** hoti hai — andar se khokhli, jaise chamach ka andar wala hissa.",
      },
      simpler: {
        en: "Convex = the ball. Concave = the bowl.",
        ur: "Convex = ball (gaind). Concave = bowl (pyala).",
      },
    },
    {
      type: "memory",
      text: {
        en: "Memory trick: con**CAVE** has a **cave** in it — it's the hollow one.",
        ur: "Yaad rakhne ka tareeqa: con**CAVE** mein **cave** (gufa) chhupi hai — yani khokhli, andar ko dhansi hui surface.",
      },
    },
    {
      type: "say",
      text: {
        en: "Here's the whole rule in two lines:\n**Convex moving on concave → roll and glide in OPPOSITE directions.**\n**Concave moving on convex → roll and glide in the SAME direction.**",
        ur: "Poora rule do lines mein:\n**Convex, concave par move kare → roll aur glide ULTI (opposite) direction mein.**\n**Concave, convex par move kare → roll aur glide EK HI (same) direction mein.**",
      },
    },
    {
      type: "widget",
      widget: "convex-concave",
      intro: {
        en: "Don't just trust me — test it. Move the slider and watch the arrows. Then switch from the shoulder to the knee.",
        ur: "Sirf meri baat na maanein — khud test karein. Slider move karein aur arrows dekhein. Phir shoulder se knee par switch karein.",
      },
    },
    {
      type: "say",
      text: {
        en: "Why opposite for a convex surface? Look at the shoulder. When you abduct, the convex humeral head **rolls up**. If it only rolled, it would roll off the top of the glenoid and jam under the acromion. So it must **glide down** at the same time to stay centred.",
        ur: "Convex surface mein opposite kyun? Shoulder dekhein. Abduction mein convex humeral head **upar roll** karta hai. Agar sirf roll karta to glenoid ke upar se nikal kar acromion ke neeche phans jata. Is liye usay saath saath **neeche glide** karna parta hai taake centre mein rahe.",
      },
      simpler: {
        en: "The ball rolls up, so it must slide down — otherwise it would fall out of its socket.",
        ur: "Ball upar roll karti hai, is liye usay neeche slide karna parta hai — warna socket se bahar nikal jaye.",
      },
    },
    {
      type: "check",
      question: {
        en: "A patient lifts their arm into abduction. Which way does the humeral head glide?",
        ur: "Patient bazu ko abduction mein upar uthata hai. Humeral head kis taraf glide karta hai?",
      },
      hint: {
        en: "The humeral head is convex and it is the surface that moves.",
        ur: "Humeral head convex hai aur wohi move kar raha hai.",
      },
      options: [
        {
          text: { en: "Superior (up)", ur: "Superior (upar)" },
          feedback: {
            en: "Tempting — the arm goes up, so it feels like everything goes up! But up is the **roll**. A convex head glides the **opposite** way: inferior.",
            ur: "Yeh jawab dil ko lagta hai — bazu upar jata hai to lagta hai sab kuch upar jaye ga! Lekin upar **roll** hai. Convex head **ulti** taraf glide karta hai: inferior.",
          },
        },
        {
          text: { en: "Inferior (down)", ur: "Inferior (neeche)" },
          correct: true,
          feedback: {
            en: "Exactly! Convex humeral head on a concave glenoid → rolls up, glides down. 🎯",
            ur: "Bilkul sahi! Convex humeral head, concave glenoid par → upar roll, neeche glide. 🎯",
          },
        },
        {
          text: { en: "It doesn't glide — it only rolls", ur: "Glide nahi karta — sirf roll karta hai" },
          feedback: {
            en: "If it only rolled, the head would hit the acromion early in abduction. Roll and glide happen **together**.",
            ur: "Agar sirf roll karta to abduction ke shuru mein hi head acromion se takra jata. Roll aur glide **saath saath** hote hain.",
          },
        },
      ],
    },
    {
      type: "say",
      text: {
        en: "Now the knee in sitting — open chain. When you straighten the knee, the **concave tibia** moves on the **convex femur**. The tibia rolls forward and glides forward — the **same direction**, like a bowl sliding around a ball.",
        ur: "Ab baith kar knee — open chain. Jab knee seedha karte hain to **concave tibia**, **convex femur** par move karti hai. Tibia aage roll aur aage hi glide karti hai — **same direction**, jaise pyala gaind ke gird phisle.",
      },
    },
    {
      type: "check",
      question: {
        en: "Knee extension in sitting (the tibia moves on a fixed femur). Which way does the tibia glide?",
        ur: "Baith kar knee extension (tibia, fixed femur par move kar rahi hai). Tibia kis taraf glide karti hai?",
      },
      options: [
        {
          text: { en: "Anterior", ur: "Anterior (aage)" },
          correct: true,
          feedback: {
            en: "Yes! Concave tibia on a convex femur → roll and glide in the **same** direction: anterior.",
            ur: "Haan! Concave tibia, convex femur par → roll aur glide **same** direction mein: anterior.",
          },
        },
        {
          text: { en: "Posterior", ur: "Posterior (peeche)" },
          feedback: {
            en: "That would be true if a **convex** surface were moving. Here the moving tibia is **concave** → glide goes the same way as the roll → anterior.",
            ur: "Yeh tab sahi hota agar **convex** surface move kar rahi hoti. Yahan move karne wali tibia **concave** hai → glide roll ki taraf hi → anterior.",
          },
        },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "Why should a physio care? It guides your **mobilization direction**. A stiff shoulder losing abduction → the classic choice is an **inferior glide** of the humerus. A knee lacking extension with the tibia moving → an **anterior glide** of the tibia.",
        ur: "Physio ko is ki parwah kyun? Yeh aap ki **mobilization direction** guide karta hai. Stiff shoulder jis ki abduction kam ho → classic choice humerus ki **inferior glide**. Knee jis ki extension kam ho aur tibia move kar rahi ho → tibia ki **anterior glide**.",
      },
    },
    {
      type: "mistake",
      text: {
        en: "The most common mistake: checking which bone is convex, but forgetting to ask **which bone is moving**. In closed chain — say, rising from a squat with the foot fixed — the **femur** moves on the tibia. Now a convex surface is moving, so the answer flips!",
        ur: "Sab se aam ghalti: yeh to dekh liya ke kaun si bone convex hai, lekin yeh poochna bhool gaye ke **kaun si bone move kar rahi hai**. Closed chain mein — maslan squat se uthte waqt jab paon fixed ho — **femur**, tibia par move karti hai. Ab convex surface move kar rahi hai, to jawab ulat jata hai!",
      },
    },
    {
      type: "check",
      question: {
        en: "Viva question: a patient stands up from a squat. The convex femur moves on the fixed tibia. During this knee extension, which way does the femur glide?",
        ur: "Viva sawal: patient squat se khara hota hai. Convex femur, fixed tibia par move karti hai. Is knee extension mein femur kis taraf glide karti hai?",
      },
      options: [
        {
          text: { en: "Anterior", ur: "Anterior (aage)" },
          feedback: {
            en: "Anterior is the **roll**. The femur is convex and moving, so its glide is the opposite: posterior.",
            ur: "Anterior to **roll** hai. Femur convex hai aur move kar rahi hai, is liye glide ulti: posterior.",
          },
        },
        {
          text: { en: "Posterior", ur: "Posterior (peeche)" },
          correct: true,
          feedback: {
            en: "Brilliant! You checked **which** bone moves. Convex femur moving → rolls anterior, glides posterior. This is exactly the thinking examiners look for.",
            ur: "Zabardast! Aap ne check kiya ke **kaun si** bone move kar rahi hai. Convex femur move kare → anterior roll, posterior glide. Examiner bilkul yehi soch dekhna chahte hain.",
          },
        },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "An honest note from the evidence: real joints aren't perfect balls and bowls. A review of the glenohumeral joint found the rule doesn't always hold, and one trial in adhesive capsulitis found **posterior** glides improved external rotation more than the anterior glides the rule predicts. So use the rule as your **starting point** — then let reassessment (did range and pain improve?) make the final decision.",
        ur: "Evidence ki imaandar baat: asal joints perfect ball aur bowl nahi hote. Glenohumeral joint par ek review ne dekha ke yeh rule hamesha sahi nahi baithta, aur adhesive capsulitis ki ek trial mein **posterior** glide ne external rotation zyada behtar ki — halaanke rule anterior glide predict karta hai. Is liye rule ko **starting point** samjhein — aakhri faisla reassessment kare (kya range aur dard behtar hua?).",
      },
    },
  ],
  summary: [
    {
      en: "Convex moving on concave → roll and glide in opposite directions.",
      ur: "Convex, concave par move kare → roll aur glide opposite direction mein.",
    },
    {
      en: "Concave moving on convex → roll and glide in the same direction.",
      ur: "Concave, convex par move kare → roll aur glide same direction mein.",
    },
    {
      en: "Always ask which surface moves — and let reassessment, not the rule alone, guide treatment.",
      ur: "Hamesha poochein kaun si surface move kar rahi hai — aur treatment ka faisla sirf rule nahi, reassessment kare.",
    },
  ],
  flashcards: [
    {
      id: "ccr-1",
      front: { en: "Name the three arthrokinematic movements.", ur: "Teen arthrokinematic movements ke naam batayein." },
      back: { en: "Roll, glide (slide) and spin.", ur: "Roll, glide (slide) aur spin." },
    },
    {
      id: "ccr-2",
      front: {
        en: "Convex surface moving on a fixed concave surface: roll and glide are…?",
        ur: "Convex surface, fixed concave surface par move kare: roll aur glide…?",
      },
      back: {
        en: "Opposite directions (e.g. shoulder abduction: humeral head rolls up, glides down).",
        ur: "Opposite directions (maslan shoulder abduction: humeral head upar roll, neeche glide).",
      },
    },
    {
      id: "ccr-3",
      front: {
        en: "Concave surface moving on a fixed convex surface: roll and glide are…?",
        ur: "Concave surface, fixed convex surface par move kare: roll aur glide…?",
      },
      back: {
        en: "Same direction (e.g. open-chain knee extension: tibia rolls and glides anterior).",
        ur: "Same direction (maslan open-chain knee extension: tibia anterior roll aur anterior glide).",
      },
    },
    {
      id: "ccr-4",
      front: {
        en: "Rising from a squat (closed chain): which way does the femur glide during knee extension?",
        ur: "Squat se uthna (closed chain): knee extension mein femur kis taraf glide karti hai?",
      },
      back: {
        en: "Posterior — the convex femur is moving, so it rolls anterior and glides posterior.",
        ur: "Posterior — convex femur move kar rahi hai, is liye anterior roll aur posterior glide.",
      },
    },
    {
      id: "ccr-5",
      front: {
        en: "Mobilization to gain shoulder abduction, based on the convex–concave rule?",
        ur: "Convex–concave rule ke mutabiq shoulder abduction barhane ke liye mobilization?",
      },
      back: {
        en: "Inferior glide of the humerus — then reassess range and pain.",
        ur: "Humerus ki inferior glide — phir range aur dard reassess karein.",
      },
    },
  ],
  goDeeper: [
    {
      title: "Maitland Joint Mobilization",
      href: "/manual-therapy/maitland-joint-mobilization",
      note: { en: "See how glide direction turns into a real technique.", ur: "Dekhein glide direction asal technique mein kaise badalti hai." },
    },
    {
      title: "Kaltenborn–Evjenth Mobilization",
      href: "/manual-therapy/kaltenborn-evjenth-mobilization",
      note: { en: "The approach where this rule is used most directly.", ur: "Woh approach jahan yeh rule sab se seedha use hota hai." },
    },
    {
      title: "Adhesive Capsulitis",
      href: "/msk-injuries/adhesive-capsulitis",
      note: { en: "Apply your new thinking to a stiff shoulder.", ur: "Apni nayi soch ko stiff shoulder par apply karein." },
    },
  ],
  sources: [
    { citation: "Neumann DA. Kinesiology of the Musculoskeletal System: Foundations for Rehabilitation. 3rd ed. Elsevier; 2017." },
    {
      citation:
        "Brandt C, Sole G, Krause MW, Nel M. An evidence-based review on the validity of the Kaltenborn rule as applied to the glenohumeral joint. Manual Therapy. 2007;12(1):3–11.",
      pubmedQuery: "Brandt Kaltenborn rule glenohumeral joint evidence-based review",
    },
    {
      citation:
        "Johnson AJ, Godges JJ, Zimmerman GJ, Ounanian LL. The effect of anterior versus posterior glide joint mobilization on external rotation range of motion in patients with shoulder adhesive capsulitis. JOSPT. 2007;37(3):88–99.",
      pubmedQuery: "anterior versus posterior glide joint mobilization external rotation adhesive capsulitis",
    },
  ],
};
