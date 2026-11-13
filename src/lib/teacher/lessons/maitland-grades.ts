import type { TeacherLesson } from "../types.ts";

export const maitlandGrades: TeacherLesson = {
  slug: "maitland-grades",
  title: "Maitland Grades I–V, Made Visual",
  hook: {
    en: "Five grades, two questions: where in the range, and how big?",
    ur: "Paanch grades, sirf do sawal: range mein kahan, aur movement kitni bari?",
  },
  area: "Manual Therapy",
  level: "Foundation",
  bestFor: "3rd year onwards",
  minutes: 9,
  goal: {
    en: "By the end, you'll know where each grade happens in the range, how big it is, and when to choose it.",
    ur: "End tak aap jaan jayenge ke har grade range mein kahan hota hai, kitna bara hota hai, aur kab choose karna hai.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Grades I to V sound like five random levels to memorise. They're not. Every grade answers just two questions: **WHERE** in the range do you move, and **HOW BIG** is the movement (amplitude)?",
        ur: "Grade I se V tak paanch random levels lagte hain jo ratne parenge. Aisa nahi hai. Har grade sirf do sawalon ka jawab hai: range mein **KAHAN** move karna hai, aur movement **KITNI BARI** (amplitude) hai?",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Think of the joint's range as a road that ends at a wall. The start of the road is smooth. Near the end it gets bumpy — that's **resistance**, tissue starting to tighten. Then there's the wall — the **limit** of available range. Each grade tells you which part of the road you drive on, and whether you take long or short trips.",
        ur: "Joint ki range ko ek sarak samjhein jo deewar par khatam hoti hai. Shuru mein sarak hamwar hai. Aakhir ke qareeb jhatke shuru hote hain — yeh **resistance** hai, tissue tight hona shuru hota hai. Phir deewar — available range ki **limit**. Har grade batata hai ke aap sarak ke kis hisse par chal rahe hain, aur safar lamba hai ya chhota.",
      },
    },
    {
      type: "widget",
      widget: "maitland-grades",
      intro: {
        en: "Tap each grade and watch where it lives on the road.",
        ur: "Har grade par tap karein aur dekhein woh sarak par kahan rehta hai.",
      },
    },
    {
      type: "say",
      text: {
        en: "So:\n**Grade I** — small amplitude, at the beginning of the range.\n**Grade II** — large amplitude, within the range but not reaching resistance.\n**Grade III** — large amplitude, moving into resistance up to the limit.\n**Grade IV** — small amplitude, at the limit, into resistance.\n**Grade V** — a small-amplitude, high-velocity thrust at the end of available range (manipulation).",
        ur: "To:\n**Grade I** — chhoti movement, range ke shuru mein.\n**Grade II** — bari movement, range ke andar lekin resistance tak nahi pohanchti.\n**Grade III** — bari movement, resistance mein ja kar limit tak.\n**Grade IV** — chhoti movement, limit par, resistance ke andar.\n**Grade V** — range ke end par chhota lekin tez thrust (manipulation).",
      },
      simpler: {
        en: "I and IV are SMALL. II and III are BIG. I and II stay away from stiffness. III and IV go into stiffness. V is one quick thrust.",
        ur: "I aur IV CHHOTE. II aur III BARE. I aur II stiffness se door rehte hain. III aur IV stiffness ke andar jaate hain. V ek tez thrust hai.",
      },
    },
    {
      type: "memory",
      text: {
        en: "Trick: **small – BIG – BIG – small**. And the line between Grade II and Grade III is the moment you **feel resistance**.",
        ur: "Trick: **chhota – BARA – BARA – chhota**. Aur Grade II aur Grade III ke beech ki lakeer woh lamha hai jab aap ko **resistance mehsoos** ho.",
      },
    },
    {
      type: "check",
      question: {
        en: "Which grade is a LARGE amplitude movement that goes INTO resistance, up to the limit?",
        ur: "Kaun sa grade BARI movement hai jo resistance ke ANDAR limit tak jati hai?",
      },
      options: [
        {
          text: { en: "Grade II", ur: "Grade II" },
          feedback: {
            en: "Close! Grade II is large, but it stays in the resistance-free part of the range. Moving into resistance makes it Grade III.",
            ur: "Qareeb hain! Grade II bara hai, lekin resistance-free hisse mein rehta hai. Resistance mein jaye to Grade III ban jata hai.",
          },
        },
        {
          text: { en: "Grade III", ur: "Grade III" },
          correct: true,
          feedback: {
            en: "Correct! Large amplitude, into resistance, up to the limit = Grade III.",
            ur: "Sahi! Bari movement, resistance ke andar, limit tak = Grade III.",
          },
        },
        {
          text: { en: "Grade IV", ur: "Grade IV" },
          feedback: {
            en: "Grade IV does work into resistance — but it's **small** amplitude at the limit.",
            ur: "Grade IV bhi resistance mein kaam karta hai — lekin woh limit par **chhoti** movement hai.",
          },
        },
      ],
    },
    {
      type: "say",
      text: {
        en: "Now the clinical part: **which grade when?** A practical guide: when **pain** is the main problem — an irritable joint — start with **Grades I–II**: gentle, staying out of resistance. When **stiffness** is the main problem, use **Grades III–IV**, which work into the resistance.",
        ur: "Ab clinical hissa: **kaun sa grade kab?** Practical guide: jab asal masla **dard** ho — irritable joint — to **Grade I–II** se shuru karein: naram, resistance se door. Jab asal masla **stiffness** ho to **Grade III–IV**, jo resistance ke andar kaam karte hain.",
      },
      simpler: {
        en: "Pain → I–II. Stiffness → III–IV.",
        ur: "Dard → I–II. Stiffness → III–IV.",
      },
    },
    {
      type: "clinic",
      text: {
        en: "Example: a few days after an ankle sprain, the ankle is painful even at rest. After you've screened for fracture, gentle Grade I–II mobilization can help with pain. Six weeks later the ankle is stiff but not very painful → Grade III–IV to work on the stiffness. The grade follows the patient's **irritability**, not the name of the diagnosis.",
        ur: "Misaal: ankle sprain ke kuch din baad ankle aaraam mein bhi dard karta hai. Fracture screen karne ke baad naram Grade I–II mobilization dard mein madad kar sakti hai. Chhe hafte baad ankle stiff hai lekin zyada dard nahi → stiffness ke liye Grade III–IV. Grade diagnosis ke naam se nahi, patient ki **irritability** se tay hota hai.",
      },
    },
    {
      type: "check",
      question: {
        en: "A frozen shoulder: very stiff, only mild pain, not irritable. Which grades fit best?",
        ur: "Frozen shoulder: bohat stiff, halka sa dard, irritable nahi. Kaun se grades behtar hain?",
      },
      options: [
        {
          text: { en: "Grades I–II", ur: "Grade I–II" },
          feedback: {
            en: "Those are mainly for pain-dominant, irritable joints. This one is stiffness-dominant — we need to work into resistance.",
            ur: "Yeh zyada tar dard-dominant, irritable joints ke liye hain. Yeh joint stiffness-dominant hai — resistance mein kaam karna hoga.",
          },
        },
        {
          text: { en: "Grades III–IV", ur: "Grade III–IV" },
          correct: true,
          feedback: {
            en: "Yes! Stiffness-dominant → work into resistance with III–IV, then reassess range after each set.",
            ur: "Haan! Stiffness-dominant → III–IV se resistance mein kaam, phir har set ke baad range reassess.",
          },
        },
        {
          text: { en: "Grade V only", ur: "Sirf Grade V" },
          feedback: {
            en: "A thrust is a specific skill with its own screening, and it's rarely the first choice for a stiff capsular shoulder. Start with III–IV and reassess.",
            ur: "Thrust ek khaas skill hai jis ki apni screening hoti hai, aur stiff capsular shoulder mein yeh shayad hi pehli choice hota hai. III–IV se shuru karein aur reassess karein.",
          },
        },
      ],
    },
    {
      type: "mistake",
      text: {
        en: "A common mistake: thinking Grade IV is 'stronger' than Grade III. Grade IV is actually **smaller** — tiny oscillations at the limit. A higher number doesn't mean more force.",
        ur: "Aam ghalti: yeh samajhna ke Grade IV, Grade III se 'zyada strong' hai. Asal mein Grade IV **chhota** hai — limit par chhoti chhoti oscillations. Bara number zyada force nahi hota.",
      },
    },
    {
      type: "say",
      text: {
        en: "One more viva-level detail: the grade only describes **amplitude and position in range**. **Rhythm** (smooth or staccato oscillations) and **duration** (how long each set lasts) are separate choices — and reassessment after every set tells you whether to continue, change the grade or stop.",
        ur: "Ek aur viva-level baat: grade sirf **amplitude aur range mein position** batata hai. **Rhythm** (smooth ya jhatkay wali oscillations) aur **duration** (har set kitni dair) alag faislay hain — aur har set ke baad reassessment batata hai ke jaari rakhein, grade badlein ya ruk jayein.",
      },
    },
    {
      type: "check",
      question: {
        en: "Examiner: \"What exactly separates Grade II from Grade III?\"",
        ur: "Examiner: \"Grade II aur Grade III mein asal farq kya hai?\"",
      },
      options: [
        {
          text: { en: "The amount of force", ur: "Force ki miqdaar" },
          feedback: {
            en: "Force may change, but the defining line is whether the movement **enters resistance**.",
            ur: "Force badal sakti hai, lekin asal lakeer yeh hai ke movement **resistance mein dakhil** hoti hai ya nahi.",
          },
        },
        {
          text: { en: "Whether the movement enters resistance", ur: "Movement resistance mein jati hai ya nahi" },
          correct: true,
          feedback: {
            en: "Perfect answer. Both are large amplitude — Grade III goes into resistance, Grade II doesn't.",
            ur: "Behtareen jawab. Dono bari movements hain — Grade III resistance mein jata hai, Grade II nahi.",
          },
        },
        {
          text: { en: "The speed of the movement", ur: "Movement ki raftaar" },
          feedback: {
            en: "Speed defines Grade V (the thrust), not the difference between II and III.",
            ur: "Raftaar Grade V (thrust) ko define karti hai, II aur III ka farq nahi.",
          },
        },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "Safety first: before any mobilization, screen for red flags and contraindications. Grade V thrusts need extra screening and specific training. When in doubt — don't thrust, and refer if needed.",
        ur: "Pehle safety: kisi bhi mobilization se pehle red flags aur contraindications screen karein. Grade V thrust ke liye extra screening aur khaas training chahiye. Shak ho to thrust na karein, aur zaroorat ho to refer karein.",
      },
    },
  ],
  summary: [
    { en: "A grade = where in the range + how big the movement is.", ur: "Grade = range mein kahan + movement kitni bari." },
    {
      en: "I & IV are small, II & III are large; III & IV enter resistance; V is a thrust.",
      ur: "I aur IV chhote, II aur III bare; III aur IV resistance mein; V thrust hai.",
    },
    {
      en: "Pain-dominant → I–II; stiffness-dominant → III–IV; reassess after every set.",
      ur: "Dard-dominant → I–II; stiffness-dominant → III–IV; har set ke baad reassess.",
    },
  ],
  flashcards: [
    {
      id: "mg-1",
      front: { en: "Maitland Grade I?", ur: "Maitland Grade I?" },
      back: { en: "Small amplitude at the beginning of the range.", ur: "Range ke shuru mein chhoti movement." },
    },
    {
      id: "mg-2",
      front: { en: "Maitland Grade II?", ur: "Maitland Grade II?" },
      back: { en: "Large amplitude within the range, not reaching resistance.", ur: "Range ke andar bari movement, resistance tak nahi." },
    },
    {
      id: "mg-3",
      front: { en: "Maitland Grade III?", ur: "Maitland Grade III?" },
      back: { en: "Large amplitude into resistance, up to the limit.", ur: "Resistance ke andar limit tak bari movement." },
    },
    {
      id: "mg-4",
      front: { en: "Maitland Grade IV?", ur: "Maitland Grade IV?" },
      back: { en: "Small amplitude at the limit, into resistance.", ur: "Limit par, resistance ke andar chhoti movement." },
    },
    {
      id: "mg-5",
      front: { en: "Maitland Grade V?", ur: "Maitland Grade V?" },
      back: {
        en: "Small-amplitude, high-velocity thrust at the end of available range (manipulation).",
        ur: "Available range ke end par chhota, tez thrust (manipulation).",
      },
    },
    {
      id: "mg-6",
      front: { en: "Pain-dominant vs stiffness-dominant joint: which grades?", ur: "Dard-dominant vs stiffness-dominant joint: kaun se grades?" },
      back: { en: "Pain/irritable → I–II. Stiffness → III–IV. Reassess every set.", ur: "Dard/irritable → I–II. Stiffness → III–IV. Har set reassess." },
    },
  ],
  goDeeper: [
    {
      title: "Maitland Joint Mobilization — full guide",
      href: "/manual-therapy/maitland-joint-mobilization",
      note: { en: "Hand placement, dosage, safety and reasoning.", ur: "Hand placement, dosage, safety aur reasoning." },
    },
    {
      title: "Maitland cervical PA mobilization",
      href: "/manual-therapy/regions/maitland-cervical-pa-mobilization",
      note: { en: "See the grades applied to the neck.", ur: "Grades ko neck par apply hota dekhein." },
    },
    {
      title: "Adhesive Capsulitis",
      href: "/conditions/adhesive-capsulitis",
      note: { en: "Choose grades for a real stiff shoulder.", ur: "Asal stiff shoulder ke liye grades choose karein." },
    },
  ],
  sources: [
    { citation: "Hengeveld E, Banks K, eds. Maitland's Peripheral Manipulation. 5th ed. Elsevier; 2014." },
    { citation: "Hengeveld E, Banks K, eds. Maitland's Vertebral Manipulation. 8th ed. Elsevier; 2014." },
    { citation: "Kisner C, Colby LA, Borstad J. Therapeutic Exercise: Foundations and Techniques. 7th ed. F.A. Davis; 2017." },
  ],
};
