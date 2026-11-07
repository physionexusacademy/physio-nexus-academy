import type { TeacherLesson } from "../types.ts";

export const activePassiveInsufficiency: TeacherLesson = {
  slug: "active-passive-insufficiency",
  title: "Active & Passive Insufficiency — Feel It in Your Own Hand",
  hook: {
    en: "Your own hand is the lab. Two quick experiments and this topic is yours.",
    ur: "Aap ka apna hand lab hai. Do chhotay experiments aur yeh topic aap ka.",
  },
  area: "Movement Science",
  level: "Foundation",
  bestFor: "1st–2nd year DPT",
  minutes: 8,
  goal: {
    en: "By the end, you'll explain why two-joint muscles 'run out' of force or length — using your own body as proof.",
    ur: "End tak aap samjha sakenge ke two-joint muscles ki force ya length kyun 'khatam' ho jati hai — apne body ko saboot bana kar.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Today your own body is the textbook. Keep one hand free — you'll need it in a minute. 🖐️",
        ur: "Aaj aap ka apna body textbook hai. Ek hand khaali rakhein — thori dair mein zaroorat paregi. 🖐️",
      },
    },
    {
      type: "say",
      text: {
        en: "First, a key fact: a muscle produces its best force at a **middle length** — not too stretched, not too shortened. This is the **length–tension relationship**.",
        ur: "Pehle ek zaroori baat: muscle apni sab se achi force **darmiyani length** par paida karta hai — na zyada khincha hua, na zyada chhota. Isay **length–tension relationship** kehte hain.",
      },
      simpler: {
        en: "A muscle is strongest in the middle. Too short or too long = weaker.",
        ur: "Muscle beech mein sab se taqatwar hai. Bohat chhota ya bohat lamba = weak.",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Imagine a team pulling a rope while standing in a line. Stand too far apart and they can barely grab it. Squeeze them too close and they bump into each other. In the middle, everyone pulls well. Inside a muscle fibre, the actin and myosin filaments behave in a similar way — their overlap decides how many 'hands' can pull.",
        ur: "Sochein ek team line mein khari rassi kheench rahi hai. Bohat door khare hon to rassi mushkil se pakar paate hain. Bohat qareeb hon to aapas mein takrate hain. Beech mein sab ache se kheenchte hain. Muscle fibre ke andar actin aur myosin bhi kuch aisa hi karte hain — un ka overlap tay karta hai ke kitne 'hand' kheench sakte hain.",
      },
    },
    {
      type: "say",
      text: {
        en: "Now, **two-joint muscles** cross two joints — like the long finger flexors (wrist + fingers), the hamstrings (hip + knee) and rectus femoris (hip + knee). When they try to act at BOTH joints at the same time, they hit a limit.",
        ur: "Ab **two-joint muscles** do joints cross karte hain — jaise lambe finger flexors (wrist + fingers), hamstrings (hip + knee) aur rectus femoris (hip + knee). Jab yeh DONO joints par ek saath kaam karne ki koshish karte hain to limit aa jati hai.",
      },
    },
    {
      type: "try",
      title: { en: "Try it now: active insufficiency", ur: "Abhi try karein: active insufficiency" },
      steps: [
        { en: "Bend your wrist fully forward (wrist flexion) and hold it there.", ur: "Apni wrist ko poori tarah aage moorein (wrist flexion) aur wahin rokein." },
        { en: "Now try to make a strong, tight fist.", ur: "Ab zor se, tight fist banane ki koshish karein." },
      ],
      ask: { en: "What did you notice?", ur: "Aap ne kya mehsoos kiya?" },
      options: [
        {
          text: { en: "My grip felt weak — I couldn't squeeze fully", ur: "Grip weak laga — poori tarah daba nahi saka" },
          feedback: {
            en: "Exactly! That's **active insufficiency**. Your finger flexors are already shortened across the wrist, so they can't shorten enough to squeeze the fingers tightly as well. (The stretched finger extensors on the back of your forearm are adding a brake too.)",
            ur: "Bilkul! Yehi **active insufficiency** hai. Aap ke finger flexors wrist par pehle hi chhotay ho chuke hain, is liye fingers ko bhi zor se dabane ke liye mazeed chhotay nahi ho sakte. (Forearm ki pusht par khinche hue finger extensors bhi brake laga rahe hain.)",
          },
        },
        {
          text: { en: "I didn't notice any difference", ur: "Mujhe koi farq mehsoos nahi hua" },
          feedback: {
            en: "Try once more with the wrist bent as far as it goes, then compare with a fist made with the wrist slightly extended. Most people feel a clear drop in grip strength — that drop is active insufficiency.",
            ur: "Ek baar phir try karein, wrist ko jitna ho sake moor kar, phir wrist thori peeche (extension) rakh kar fist se compare karein. Zyada tar logon ko grip mein wazeh kami mehsoos hoti hai — yehi kami active insufficiency hai.",
          },
        },
      ],
    },
    {
      type: "say",
      text: {
        en: "**Active insufficiency**: a two-joint muscle is so **shortened** across both joints that it can't produce effective force or complete its range at both. The **contracting** muscle runs out of shortening.",
        ur: "**Active insufficiency**: two-joint muscle dono joints par itna **chhota** ho chuka hai ke dono par effective force ya poori range nahi de sakta. **Contract hone wale** muscle ki chhota hone ki gunjaish khatam ho jati hai.",
      },
    },
    {
      type: "try",
      title: { en: "Try it now: passive insufficiency", ur: "Abhi try karein: passive insufficiency" },
      steps: [
        { en: "Sit on a chair with one knee straight out in front of you.", ur: "Kursi par baith kar ek knee seedha aage phela lein." },
        { en: "Keep that knee straight and lean forward from your hips, reaching towards your toes.", ur: "Knee seedha rakhte hue hips se aage jhukein aur toes ki taraf hand barhayein." },
      ],
      ask: { en: "Where did you feel the tightness?", ur: "Tightness kahan mehsoos hui?" },
      options: [
        {
          text: { en: "Behind my thigh / knee", ur: "Thigh / knee ke peeche" },
          feedback: {
            en: "That's **passive insufficiency** of the hamstrings: they're being stretched across BOTH joints — hip flexing and knee extended. They run out of length, so they stop further hip flexion. Now bend that knee a little: suddenly you can lean further!",
            ur: "Yeh hamstrings ki **passive insufficiency** hai: woh DONO joints par kheenche ja rahe hain — hip flexion aur knee extension. Un ki length khatam ho jati hai aur mazeed hip flexion ruk jati hai. Ab knee thora moorein: achanak aap aur aage jhuk sakte hain!",
          },
        },
        {
          text: { en: "In my lower back", ur: "Lower back mein" },
          feedback: {
            en: "Some people feel it there — often the hamstrings hit their limit first and the spine bends to make up the difference. Bend the knee slightly and lean again: if you go further, the hamstrings were the limit.",
            ur: "Kuch logon ko wahan mehsoos hota hai — aksar hamstrings pehle limit par pohanchte hain aur back jhuk kar kami poori karti hai. Knee thora moor kar dobara jhukein: agar zyada aage jaa sakein to limit hamstrings thay.",
          },
        },
      ],
    },
    {
      type: "say",
      text: {
        en: "**Passive insufficiency**: a two-joint muscle is so **stretched** across both joints that it can't lengthen any further — so it **limits movement** in the opposite direction. The **stretched** muscle acts like a brake.",
        ur: "**Passive insufficiency**: two-joint muscle dono joints par itna **khincha** hua hai ke mazeed lamba nahi ho sakta — is liye ulti direction ki **movement ko rok deta hai**. **Khincha hua** muscle brake ka kaam karta hai.",
      },
    },
    {
      type: "memory",
      text: {
        en: "**Active = too short to squeeze** (the working muscle gives up).\n**Passive = too long to stretch** (the muscle on the other side becomes the brake).",
        ur: "**Active = itna chhota ke daba na sake** (kaam karne wala muscle haar jata hai).\n**Passive = itna lamba ke aur khinch na sake** (doosri taraf ka muscle brake ban jata hai).",
      },
    },
    {
      type: "check",
      question: {
        en: "Back to the first experiment: wrist fully flexed, trying to make a fist. Which muscle group is PASSIVELY insufficient there?",
        ur: "Pehla experiment yaad karein: wrist poori flexed, fist banane ki koshish. Wahan kaun sa muscle group PASSIVELY insufficient hai?",
      },
      hint: {
        en: "Look for the muscle being stretched across both the wrist and the fingers.",
        ur: "Woh muscle dhoondein jo wrist aur fingers dono par khinch raha hai.",
      },
      options: [
        {
          text: { en: "The finger extensors (back of the forearm)", ur: "Finger extensors (forearm ki pusht)" },
          correct: true,
          feedback: {
            en: "Yes! They're stretched over the flexed wrist AND the bending fingers, so they act as a brake. Active insufficiency of the flexors + passive insufficiency of the extensors = weak fist.",
            ur: "Haan! Woh flexed wrist AUR mudti fingers dono par khinch rahe hain, is liye brake ban jaate hain. Flexors ki active insufficiency + extensors ki passive insufficiency = weak fist.",
          },
        },
        {
          text: { en: "The finger flexors (front of the forearm)", ur: "Finger flexors (forearm ka saamne wala hissa)" },
          feedback: {
            en: "The flexors are the ones SHORTENING — that's their active insufficiency. The passive brake comes from the muscles being stretched: the finger extensors.",
            ur: "Flexors to CHHOTAY ho rahe hain — yeh un ki active insufficiency hai. Passive brake khinche hue muscles se aata hai: finger extensors.",
          },
        },
        {
          text: { en: "The biceps", ur: "Biceps" },
          feedback: {
            en: "The biceps doesn't cross the wrist or the fingers, so it isn't involved in this experiment.",
            ur: "Biceps na wrist cross karta hai na fingers, is liye is experiment mein shamil nahi.",
          },
        },
      ],
    },
    {
      type: "check",
      question: {
        en: "During a passive straight-leg raise, the leg stops at about 60° with tension behind the thigh. Which concept best explains this?",
        ur: "Passive straight-leg raise mein leg taqreeban 60° par ruk jati hai aur thigh ke peeche tightness hai. Kaun sa concept is ki behtareen wazahat hai?",
      },
      options: [
        {
          text: { en: "Passive insufficiency of the hamstrings", ur: "Hamstrings ki passive insufficiency" },
          correct: true,
          feedback: {
            en: "Correct — hip flexion with the knee straight stretches the hamstrings over both joints until they run out of length.",
            ur: "Sahi — knee seedha rakh kar hip flexion hamstrings ko dono joints par kheenchta hai yahan tak ke un ki length khatam ho jaye.",
          },
        },
        {
          text: { en: "Active insufficiency of the hamstrings", ur: "Hamstrings ki active insufficiency" },
          feedback: {
            en: "Active insufficiency is when a muscle is too SHORT to contract well. Here the hamstrings are being STRETCHED — that's passive.",
            ur: "Active insufficiency tab hai jab muscle contract karne ke liye bohat CHHOTA ho. Yahan hamstrings KHINCH rahe hain — yeh passive hai.",
          },
        },
        {
          text: { en: "Active insufficiency of the hip flexors", ur: "Hip flexors ki active insufficiency" },
          feedback: {
            en: "In a passive SLR the hip flexors aren't doing the work, and the barrier is at the back of the thigh — the hamstrings.",
            ur: "Passive SLR mein hip flexors kaam nahi kar rahe, aur rukawat thigh ke peeche hai — hamstrings.",
          },
        },
      ],
    },
    {
      type: "mistake",
      text: {
        en: "Don't blame every limited SLR on 'tight hamstrings'! Pain or tension behind the thigh can also come from the **sciatic nerve** (neural sensitivity). Adding ankle dorsiflexion or neck flexion at the end of the SLR — structural differentiation — helps you tell muscle from nerve.",
        ur: "Har limited SLR ko 'tight hamstrings' na kahein! Thigh ke peeche dard ya tension **sciatic nerve** (neural sensitivity) se bhi ho sakti hai. SLR ke end par ankle dorsiflexion ya neck flexion add karna — structural differentiation — muscle aur nerve mein farq karne mein madad karta hai.",
      },
    },
    {
      type: "check",
      question: {
        en: "A patient lies prone with the hip extended and tries to bend the knee fully. Which muscle is most likely to become ACTIVELY insufficient?",
        ur: "Patient prone (pait ke bal) hai, hip extended hai aur knee poori tarah moorne ki koshish karta hai. Kaun sa muscle ACTIVELY insufficient hone ka sab se zyada imkaan hai?",
      },
      options: [
        {
          text: { en: "Hamstrings", ur: "Hamstrings" },
          correct: true,
          feedback: {
            en: "Yes! Hip extension + knee flexion shortens the hamstrings at both joints — they lose force (and may even cramp) near full knee flexion.",
            ur: "Haan! Hip extension + knee flexion hamstrings ko dono joints par chhota karta hai — full knee flexion ke qareeb un ki force kam ho jati hai (cramp bhi ho sakta hai).",
          },
        },
        {
          text: { en: "Rectus femoris", ur: "Rectus femoris" },
          feedback: {
            en: "Rectus femoris is being STRETCHED in this position — it would be PASSIVELY insufficient, limiting knee flexion (that's the idea behind Ely's test).",
            ur: "Is position mein rectus femoris KHINCH raha hai — woh PASSIVELY insufficient hoga aur knee flexion ko rokega (Ely's test ka yehi idea hai).",
          },
        },
        {
          text: { en: "Gluteus maximus", ur: "Gluteus maximus" },
          feedback: {
            en: "Gluteus maximus crosses only the hip, so it can't become insufficient across two joints.",
            ur: "Gluteus maximus sirf hip cross karta hai, is liye do joints par insufficient nahi ho sakta.",
          },
        },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "In the clinic: (1) Test two-joint muscle length in positions that load **both** joints — hamstrings with the hip flexed and the knee extending. (2) Grip is strongest with the wrist in slight extension, which is why functional wrist splints usually keep that position. (3) When a patient's grip test looks weak, check the wrist position first.",
        ur: "Clinic mein: (1) Two-joint muscle ki length aisi positions mein test karein jo **dono** joints ko load karein — hamstrings: hip flexed aur knee extend hota hua. (2) Grip wrist ki halki extension mein sab se strong hoti hai, isi liye functional wrist splints aam tor par wohi position rakhte hain. (3) Agar patient ka grip test weak lage to pehle wrist ki position check karein.",
      },
    },
  ],
  summary: [
    {
      en: "Muscles are strongest at mid-length (length–tension relationship).",
      ur: "Muscles darmiyani length par sab se strong hote hain (length–tension relationship).",
    },
    {
      en: "Active insufficiency: a two-joint muscle is too short across both joints to produce full force.",
      ur: "Active insufficiency: two-joint muscle dono joints par itna chhota ke poori force na de sake.",
    },
    {
      en: "Passive insufficiency: a two-joint muscle is too stretched across both joints, limiting the opposite movement.",
      ur: "Passive insufficiency: two-joint muscle dono joints par itna khincha hua ke ulti movement ko rok de.",
    },
  ],
  flashcards: [
    {
      id: "api-1",
      front: { en: "Length–tension relationship in one line?", ur: "Length–tension relationship ek line mein?" },
      back: { en: "Muscle force is greatest near mid-length; it falls when the muscle is very short or very long.", ur: "Muscle ki force darmiyani length par zyada; bohat chhota ya bohat lamba ho to kam." },
    },
    {
      id: "api-2",
      front: { en: "Define active insufficiency.", ur: "Active insufficiency ki definition?" },
      back: {
        en: "A two-joint muscle is so shortened across both joints that it can't produce effective force or full range at both.",
        ur: "Two-joint muscle dono joints par itna chhota ke dono par effective force ya poori range na de sake.",
      },
    },
    {
      id: "api-3",
      front: { en: "Define passive insufficiency.", ur: "Passive insufficiency ki definition?" },
      back: {
        en: "A two-joint muscle is so lengthened across both joints that it limits further movement in the opposite direction.",
        ur: "Two-joint muscle dono joints par itna lamba ke ulti direction mein mazeed movement rok de.",
      },
    },
    {
      id: "api-4",
      front: { en: "Why is a fist weak with the wrist fully flexed?", ur: "Wrist poori flexed ho to fist weak kyun?" },
      back: {
        en: "Active insufficiency of the long finger flexors (plus passive tension in the finger extensors).",
        ur: "Lambe finger flexors ki active insufficiency (aur finger extensors ki passive tension).",
      },
    },
    {
      id: "api-5",
      front: { en: "How do you tell hamstring tightness from neural tension in an SLR?", ur: "SLR mein hamstring tightness aur neural tension mein farq kaise?" },
      back: {
        en: "Structural differentiation — add ankle dorsiflexion or neck flexion; symptom change suggests a neural contribution.",
        ur: "Structural differentiation — ankle dorsiflexion ya neck flexion add karein; symptoms badlein to neural hissa ho sakta hai.",
      },
    },
  ],
  goDeeper: [
    {
      title: "Hamstring Strain",
      href: "/msk-injuries/hamstring-strain",
      note: { en: "Two-joint muscle injuries in real athletes.", ur: "Asli athletes mein two-joint muscle injuries." },
    },
    {
      title: "Neurodynamic Mobilization",
      href: "/manual-therapy/neurodynamic-mobilization",
      note: { en: "When the 'tight hamstring' is really the nerve.", ur: "Jab 'tight hamstring' asal mein nerve ho." },
    },
    {
      title: "Progressive Overload in Rehabilitation",
      href: "/knowledge-hub/progressive-overload-in-rehabilitation",
      note: { en: "Use length–tension when you plan strength work.", ur: "Strength plan banate waqt length–tension use karein." },
    },
  ],
  sources: [
    { citation: "Neumann DA. Kinesiology of the Musculoskeletal System: Foundations for Rehabilitation. 3rd ed. Elsevier; 2017." },
    { citation: "Levangie PK, Norkin CC, Lewek MD. Joint Structure and Function: A Comprehensive Analysis. 6th ed. F.A. Davis; 2019." },
    {
      citation:
        "Gordon AM, Huxley AF, Julian FJ. The variation in isometric tension with sarcomere length in vertebrate muscle fibres. J Physiol. 1966;184(1):170–192.",
      pubmedQuery: "Gordon Huxley Julian variation in isometric tension with sarcomere length vertebrate muscle fibres",
    },
  ],
};
