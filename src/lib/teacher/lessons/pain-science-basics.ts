import type { TeacherLesson } from "../types.ts";

export const painScienceBasics: TeacherLesson = {
  slug: "pain-science-basics",
  title: "Pain Science Basics — Why Hurt ≠ Harm",
  hook: {
    en: "Pain is always real — but it isn't a damage meter. Learn to explain this to any patient.",
    ur: "Dard hamesha asli hota hai — lekin yeh nuqsan naapne ka meter nahi. Yeh baat kisi bhi patient ko samjhana seekhein.",
  },
  area: "Pain Science",
  level: "Clinical",
  bestFor: "All years & practising physios",
  minutes: 10,
  goal: {
    en: "By the end, you'll explain — in simple words a patient understands — why pain is real but isn't a direct measure of tissue damage.",
    ur: "End tak aap — aise asaan alfaaz mein jo patient samjhe — bata sakenge ke dard asli hai lekin tissue damage ka seedha paimana nahi.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Let's start with a true story, reported in the BMJ. A builder jumped onto a 15 cm nail. It went straight through his boot. He was in agony and needed strong pain relief. At the hospital they carefully removed the boot… and the nail had passed **between his toes**. No wound at all.",
        ur: "Ek sachi kahani se shuru karte hain jo BMJ mein report hui. Ek mistri 15 cm ke keel par kooda. Keel seedha boot ke aar paar ho gaya. Woh shadeed dard mein tha aur usay taqatwar dard ki dawa deni pari. Hospital mein ehtiyaat se boot utara gaya… aur keel **ungliyon ke beech** se guzra tha. Koi zakhm nahi.",
      },
    },
    {
      type: "check",
      question: {
        en: "Was the builder's pain real?",
        ur: "Kya mistri ka dard asli tha?",
      },
      options: [
        {
          text: { en: "No — he imagined it", ur: "Nahi — us ne sirf socha" },
          feedback: {
            en: "His pain was 100% real — he felt every bit of it. What the story shows is that pain doesn't **need** tissue damage.",
            ur: "Us ka dard 100% asli tha — us ne har zarra mehsoos kiya. Kahani yeh dikhati hai ke dard ke liye tissue damage **zaroori nahi**.",
          },
        },
        {
          text: { en: "Yes — it was real", ur: "Haan — asli tha" },
          correct: true,
          feedback: {
            en: "Yes! Real pain, zero damage. The brain produced pain to protect him because everything it saw said 'danger!'",
            ur: "Haan! Asli dard, zero nuqsan. Dimagh ne us ki hifazat ke liye dard paida kiya kyun ke jo kuch woh dekh raha tha sab 'khatra!' keh raha tha.",
          },
        },
      ],
    },
    {
      type: "say",
      text: {
        en: "The official definition (IASP, revised 2020) calls pain \"an unpleasant sensory and emotional experience **associated with, or resembling** that associated with, **actual or potential** tissue damage.\" Notice **potential** and **resembling**: pain is about **protection**, not just damage.",
        ur: "Sarkari definition (IASP, 2020 mein revise) dard ko kehti hai \"ek naagawar sensory aur emotional tajurba jo **actual ya potential** tissue damage se **juda hua ho, ya us jaisa** ho.\" **Potential** aur **us jaisa** par ghaur karein: dard **hifazat** ke baare mein hai, sirf nuqsan ke baare mein nahi.",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Pain works like a **smoke alarm**. A good alarm goes off when there's a fire. But an over-sensitive alarm can go off when you just make toast. The alarm is real and loud — but it doesn't tell you how big the fire is. In persistent pain, the 'alarm system' (the nervous system) can become more sensitive.",
        ur: "Dard **smoke alarm** ki tarah kaam karta hai. Acha alarm aag lagne par bajta hai. Lekin zyada sensitive alarm sirf toast banane par bhi baj sakta hai. Alarm asli aur tez hai — lekin yeh nahi batata ke aag kitni bari hai. Lambe arse ke dard mein 'alarm system' (nervous system) zyada sensitive ho sakta hai.",
      },
      simpler: {
        en: "Pain is an alarm. A loud alarm doesn't always mean a big fire.",
        ur: "Dard ek alarm hai. Tez alarm ka matlab hamesha bari aag nahi.",
      },
    },
    {
      type: "say",
      text: {
        en: "Key distinction: **nociception ≠ pain**. Nociception is the danger signal travelling from the tissues to the spinal cord and brain. Pain is what the brain produces after weighing **all** the evidence — that signal plus context, past experience, beliefs, stress, sleep and mood.",
        ur: "Ahem farq: **nociception ≠ dard**. Nociception woh khatre ka signal hai jo tissues se spinal cord aur dimagh tak jata hai. Dard woh hai jo dimagh **saare** saboot tol kar paida karta hai — woh signal, aur saath mein halaat, purane tajurbe, khayalaat, stress, neend aur mood.",
      },
      simpler: {
        en: "Nerves send danger messages. The brain decides whether to create pain — and how much.",
        ur: "Nerves khatre ke paighaam bhejti hain. Dimagh faisla karta hai ke dard banana hai ya nahi — aur kitna.",
      },
    },
    {
      type: "widget",
      widget: "pain-inputs",
      intro: {
        en: "Same knee, same tissue signal. Switch on what else is going on in this patient's life and watch the brain's 'protection level' change. (A teaching illustration, not a formula.)",
        ur: "Wohi knee, wohi tissue signal. Patient ki zindagi mein aur kya chal raha hai woh on karein aur dimagh ka 'protection level' badalta dekhein. (Samjhane ke liye misaal hai, formula nahi.)",
      },
    },
    {
      type: "check",
      question: {
        en: "Two patients have the same lumbar MRI findings. One has severe pain, the other has none. What's the best explanation?",
        ur: "Do patients ki lumbar MRI ek jaisi hai. Ek ko shadeed dard hai, doosre ko bilkul nahi. Behtareen wazahat kya hai?",
      },
      options: [
        {
          text: { en: "One of them is not telling the truth", ur: "Un mein se ek sach nahi bol raha" },
          feedback: {
            en: "No need to doubt either patient. Pain is shaped by many factors beyond the scan.",
            ur: "Kisi patient par shak ki zaroorat nahi. Dard scan ke ilawa bohat si cheezon se shape hota hai.",
          },
        },
        {
          text: { en: "Pain depends on many factors, not just tissue findings", ur: "Dard bohat se factors par depend karta hai, sirf tissue findings par nahi" },
          correct: true,
          feedback: {
            en: "Exactly. And disc bulges and degeneration are very common in people with **no** pain at all — imaging is only one piece of the picture.",
            ur: "Bilkul. Aur disc bulge aur degeneration un logon mein bhi bohat aam hain jinhein **bilkul dard nahi** — imaging tasveer ka sirf ek hissa hai.",
          },
        },
        {
          text: { en: "The MRI must be wrong", ur: "MRI ghalat hogi" },
          feedback: {
            en: "The MRI can be accurate — it just doesn't measure pain. Many pain-free people have the same findings.",
            ur: "MRI theek ho sakti hai — bas woh dard nahi naapti. Bohat se be-dard logon mein yehi findings hoti hain.",
          },
        },
      ],
    },
    {
      type: "mistake",
      text: {
        en: "The biggest mistake: telling a patient \"it's all in your head\". **Never.** Pain is always real. The message is: \"Your pain is real, and your nervous system has become more protective — and we can help it calm down.\"",
        ur: "Sab se bari ghalti: patient ko kehna \"yeh sab aap ke dimagh mein hai\". **Kabhi nahi.** Dard hamesha asli hai. Paighaam yeh hai: \"Aap ka dard asli hai, aap ka nervous system zyada hifazati ho gaya hai — aur hum usay pur-sukoon karne mein madad kar sakte hain.\"",
      },
    },
    {
      type: "mistake",
      text: {
        en: "Second mistake: using pain science to ignore the body. You still take a full history, examine properly and **screen for red flags**. Pain science adds to good assessment — it never replaces it.",
        ur: "Doosri ghalti: pain science ke naam par jism ko nazar-andaaz karna. Phir bhi poori history lein, theek se examine karein aur **red flags screen** karein. Pain science achi assessment mein izafa karti hai — us ki jagah kabhi nahi leti.",
      },
    },
    {
      type: "clinic",
      text: {
        en: "Simple words that work with patients: \"**Hurt doesn't always mean harm.**\" \"Your back is strong and adaptable.\" \"We'll build up activity step by step so your system becomes confident again.\" Pair this education with graded activity and exercise — education alone is rarely enough.",
        ur: "Patients ke saath kaam karne wale asaan alfaaz: \"**Har dard nuqsan nahi hota.**\" \"Aap ki kamar mazboot hai aur dhal sakti hai.\" \"Hum qadam ba qadam activity barhayenge taake aap ka system dobara pur-aitmaad ho.\" Is education ke saath graded activity aur exercise zaroor dein — sirf education shayad hi kaafi hoti hai.",
      },
    },
    {
      type: "check",
      question: {
        en: "Which phrase is BEST to say to a patient with persistent low back pain?",
        ur: "Persistent low back pain wale patient ko kaun sa jumla kehna BEHTAREEN hai?",
      },
      options: [
        {
          text: { en: "\"Your disc is degenerated, so avoid bending.\"", ur: "\"Aap ki disc ghis gayi hai, is liye jhukne se parhez karein.\"" },
          feedback: {
            en: "Fear-inducing language can increase protection — and pain. Many people with disc changes have no pain.",
            ur: "Darane wali zabaan protection — aur dard — barha sakti hai. Disc changes wale bohat se logon ko dard nahi hota.",
          },
        },
        {
          text: {
            en: "\"Hurt doesn't always mean harm — we'll build up your activity step by step.\"",
            ur: "\"Har dard nuqsan nahi hota — hum qadam ba qadam aap ki activity barhayenge.\"",
          },
          correct: true,
          feedback: {
            en: "Perfect. Validating, reassuring and action-focused. That's how a great clinician talks.",
            ur: "Behtareen. Tasleem karne wala, tasalli dene wala aur amal par mabni. Acha clinician aise hi baat karta hai.",
          },
        },
        {
          text: { en: "\"There's nothing wrong with you.\"", ur: "\"Aap ko kuch nahi hua.\"" },
          feedback: {
            en: "This dismisses a real experience. Validate first, then explain.",
            ur: "Yeh ek asli tajurbe ko rad karta hai. Pehle tasleem karein, phir samjhayein.",
          },
        },
      ],
    },
  ],
  summary: [
    { en: "Pain is always real, but it isn't a direct measure of tissue damage.", ur: "Dard hamesha asli hai, lekin tissue damage ka seedha paimana nahi." },
    {
      en: "Nociception is a signal; pain is the brain's protective output, shaped by many factors.",
      ur: "Nociception ek signal hai; dard dimagh ka hifazati output hai jo bohat se factors se shape hota hai.",
    },
    {
      en: "Validate, reassure ('hurt ≠ harm'), screen red flags and pair education with graded activity.",
      ur: "Tasleem karein, tasalli dein ('dard ≠ nuqsan'), red flags screen karein aur education ke saath graded activity dein.",
    },
  ],
  flashcards: [
    {
      id: "ps-1",
      front: { en: "IASP (2020) definition of pain?", ur: "IASP (2020) ki dard ki definition?" },
      back: {
        en: "An unpleasant sensory and emotional experience associated with, or resembling that associated with, actual or potential tissue damage.",
        ur: "An unpleasant sensory and emotional experience associated with, or resembling that associated with, actual or potential tissue damage.",
      },
    },
    {
      id: "ps-2",
      front: { en: "Nociception vs pain?", ur: "Nociception vs dard?" },
      back: {
        en: "Nociception = danger signalling from tissues. Pain = the brain's protective experience; neither guarantees the other.",
        ur: "Nociception = tissues se khatre ka signal. Dard = dimagh ka hifazati tajurba; aik doosre ki zamanat nahi.",
      },
    },
    {
      id: "ps-3",
      front: { en: "What does the 'nail through the boot' case show?", ur: "'Boot mein keel' wala case kya dikhata hai?" },
      back: { en: "Severe, real pain can occur with no tissue damage.", ur: "Shadeed, asli dard bina tissue damage ke bhi ho sakta hai." },
    },
    {
      id: "ps-4",
      front: { en: "A simple, evidence-informed phrase for patients?", ur: "Patients ke liye ek asaan, evidence-informed jumla?" },
      back: { en: "\"Hurt doesn't always mean harm — we'll build up step by step.\"", ur: "\"Har dard nuqsan nahi hota — hum qadam ba qadam barhenge.\"" },
    },
  ],
  goDeeper: [
    {
      title: "Central Sensitization Explained",
      href: "/knowledge-hub/central-sensitization-explained",
      note: { en: "The next step after this lesson.", ur: "Is lesson ke baad agla qadam." },
    },
    {
      title: "Non-specific Low Back Pain — treatment plan",
      href: "/treatment-plans/nonspecific-low-back-pain",
      note: { en: "Pain science inside a full rehab plan.", ur: "Poore rehab plan ke andar pain science." },
    },
    {
      title: "Fibromyalgia — treatment plan",
      href: "/treatment-plans/fibromyalgia",
      note: { en: "Where sensitivity and pacing matter most.", ur: "Jahan sensitivity aur pacing sab se ahem hain." },
    },
  ],
  sources: [
    {
      citation:
        "Raja SN, Carr DB, Cohen M, et al. The revised International Association for the Study of Pain definition of pain: concepts, challenges, and compromises. Pain. 2020;161(9):1976–1982.",
      pubmedQuery: "revised International Association for the Study of Pain definition of pain concepts challenges compromises",
    },
    {
      citation: "Fisher JP, Hassan DT, O'Connor N. Minerva. BMJ. 1995;310(6971):70 (case of the builder and the nail).",
      pubmedQuery: "Fisher Hassan O'Connor Minerva BMJ 1995",
    },
    {
      citation:
        "Brinjikji W, Luetmer PH, Comstock B, et al. Systematic literature review of imaging features of spinal degeneration in asymptomatic populations. AJNR Am J Neuroradiol. 2015;36(4):811–816.",
      pubmedQuery: "Systematic literature review of imaging features of spinal degeneration in asymptomatic populations",
    },
    { citation: "Moseley GL, Butler DS. Explain Pain. 2nd ed. Noigroup Publications; 2013." },
  ],
};
