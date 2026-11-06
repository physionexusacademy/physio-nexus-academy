import type { TeacherLesson } from "../types.ts";

export const gaitCycle: TeacherLesson = {
  slug: "gait-cycle",
  title: "The Gait Cycle Made Easy",
  hook: {
    en: "Break one step into 8 pieces — and suddenly every limp starts making sense.",
    ur: "Ek qadam ko 8 hisson mein torein — aur achanak har langrahat samajh aane lagti hai.",
  },
  area: "Movement Science",
  level: "Foundation",
  bestFor: "2nd year onwards",
  minutes: 11,
  goal: {
    en: "By the end, you'll name the 8 phases of gait, know which muscles work in each, and link common gait deviations to their cause.",
    ur: "End tak aap gait ke 8 phases ke naam bata sakenge, jaan jayenge har phase mein kaun se muscles kaam karte hain, aur aam gait deviations ko un ki wajah se jor sakenge.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "Walking looks simple — but it's one of the most complex things your patients do, and watching it carefully is one of the most powerful assessments you have. Let's break one step into pieces.",
        ur: "Chalna asaan lagta hai — lekin yeh aap ke patients ke sab se pecheeda kaamon mein se hai, aur ise ghaur se dekhna aap ki sab se taqatwar assessments mein se ek hai. Chaliye ek qadam ko tukron mein torte hain.",
      },
    },
    {
      type: "say",
      text: {
        en: "One **gait cycle** = from one heel touching the ground to the **same** heel touching again. It has two big parts: **stance** — the foot is on the ground (about **60%**) — and **swing** — the foot is in the air (about **40%**), at normal walking speed.",
        ur: "Ek **gait cycle** = ek aedi zameen ko chhoone se le kar **wohi** aedi dobara chhoone tak. Is ke do bare hisse hain: **stance** — paon zameen par (taqreeban **60%**) — aur **swing** — paon hawa mein (taqreeban **40%**), normal raftaar par.",
      },
      simpler: {
        en: "One cycle = heel down to the same heel down again. About 60% on the ground, 40% in the air.",
        ur: "Ek cycle = aedi neeche se wohi aedi dobara neeche. Taqreeban 60% zameen par, 40% hawa mein.",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Think of a relay race inside one leg. Each phase hands the job to the next: absorb the landing → carry the body over the foot → push off → swing the leg through → get ready to land. If one runner (one muscle group) is weak, you see the stumble at exactly that handover.",
        ur: "Ek taang ke andar relay race sochein. Har phase kaam agle ko deta hai: girne ka jhatka jazb karna → jism ko paon ke upar le jana → dhakka dena → taang aage jhulana → utarne ki tayyari. Agar ek runner (ek muscle group) kamzor ho, to theek usi handover par larkharahat nazar aati hai.",
      },
    },
    {
      type: "widget",
      widget: "gait-cycle",
      intro: {
        en: "Drag through one full gait cycle of the right leg. Watch the phase, what's happening, which muscles are working — and what you'd see if they were weak.",
        ur: "Right taang ki ek poori gait cycle mein slider chalayein. Dekhein phase kaun sa hai, kya ho raha hai, kaun se muscles kaam kar rahe hain — aur kamzor hon to kya nazar aayega.",
      },
    },
    {
      type: "compare",
      title: { en: "The 8 phases (Rancho Los Amigos)", ur: "8 phases (Rancho Los Amigos)" },
      headers: [
        { en: "Phase", ur: "Phase" },
        { en: "% of cycle", ur: "Cycle ka %" },
        { en: "Main job", ur: "Asal kaam" },
      ],
      rows: [
        [{ en: "Initial contact", ur: "Initial contact" }, { en: "0%", ur: "0%" }, { en: "Heel meets the ground", ur: "Aedi zameen se milti hai" }],
        [{ en: "Loading response", ur: "Loading response" }, { en: "0–10%", ur: "0–10%" }, { en: "Absorb the shock; accept weight (double support)", ur: "Jhatka jazb; wazan qubool (double support)" }],
        [{ en: "Mid stance", ur: "Mid stance" }, { en: "10–30%", ur: "10–30%" }, { en: "Body travels over one stable leg", ur: "Jism ek mazboot taang ke upar se guzarta hai" }],
        [{ en: "Terminal stance", ur: "Terminal stance" }, { en: "30–50%", ur: "30–50%" }, { en: "Heel rises; body moves ahead of the foot", ur: "Aedi uthti hai; jism paon se aage" }],
        [{ en: "Pre-swing", ur: "Pre-swing" }, { en: "50–60%", ur: "50–60%" }, { en: "Toe-off; weight shifts to the other leg (double support)", ur: "Toe-off; wazan doosri taang par (double support)" }],
        [{ en: "Initial swing", ur: "Initial swing" }, { en: "60–73%", ur: "60–73%" }, { en: "Foot lifts and clears the ground", ur: "Paon uth kar zameen se door" }],
        [{ en: "Mid swing", ur: "Mid swing" }, { en: "73–87%", ur: "73–87%" }, { en: "Leg swings forward; shin vertical", ur: "Taang aage jhoolti hai; shin seedhi" }],
        [{ en: "Terminal swing", ur: "Terminal swing" }, { en: "87–100%", ur: "87–100%" }, { en: "Leg slows and straightens, ready to land", ur: "Taang dheemi aur seedhi, utarne ko tayyar" }],
      ],
    },
    {
      type: "memory",
      text: {
        en: "Stance: **I Love My Tiny Puppy** — Initial contact, Loading response, Mid stance, Terminal stance, Pre-swing. Swing: **I'M Tired** — Initial, Mid, Terminal swing.",
        ur: "Stance: **I Love My Tiny Puppy** — Initial contact, Loading response, Mid stance, Terminal stance, Pre-swing. Swing: **I'M Tired** — Initial, Mid, Terminal swing.",
      },
    },
    {
      type: "check",
      question: {
        en: "At normal walking speed, roughly what percentage of the cycle is spent in stance?",
        ur: "Normal raftaar par cycle ka taqreeban kitna hissa stance mein guzarta hai?",
      },
      options: [
        { text: { en: "About 40%", ur: "Taqreeban 40%" }, feedback: { en: "40% is the swing phase. Stance is the bigger part.", ur: "40% swing phase hai. Stance bara hissa hai." } },
        { text: { en: "About 60%", ur: "Taqreeban 60%" }, correct: true, feedback: { en: "Right — about 60% stance, 40% swing.", ur: "Sahi — taqreeban 60% stance, 40% swing." } },
        { text: { en: "About 80%", ur: "Taqreeban 80%" }, feedback: { en: "Too high for normal walking — that would leave almost no time to swing the leg.", ur: "Normal chalne ke liye bohat zyada — taang jhulane ka waqt hi na bache." } },
      ],
    },
    {
      type: "say",
      text: {
        en: "Key muscle jobs:\n**Loading response** — dorsiflexors work eccentrically to lower the foot smoothly; quadriceps control the knee bend.\n**Mid stance** — the calf controls the shin moving forward; hip abductors keep the pelvis level.\n**Terminal stance / pre-swing** — the calf pushes off.\n**Swing** — hip flexors pull the leg through; dorsiflexors keep the toes up.",
        ur: "Muscles ke asal kaam:\n**Loading response** — dorsiflexors eccentric tareeqe se paon ko aahista neeche laate hain; quadriceps knee ke mur ko control karte hain.\n**Mid stance** — calf shin ke aage jaane ko control karta hai; hip abductors pelvis ko seedha rakhte hain.\n**Terminal stance / pre-swing** — calf dhakka (push-off) deta hai.\n**Swing** — hip flexors taang ko aage kheenchte hain; dorsiflexors ungliyan upar rakhte hain.",
      },
    },
    {
      type: "check",
      question: {
        en: "A patient's foot slaps down loudly just after heel strike. Which muscle group is likely weak?",
        ur: "Patient ka paon aedi lagne ke foran baad zor se \"thap\" se girta hai. Kaun sa muscle group kamzor ho sakta hai?",
      },
      options: [
        { text: { en: "Dorsiflexors (tibialis anterior)", ur: "Dorsiflexors (tibialis anterior)" }, correct: true, feedback: { en: "Yes — they normally lower the foot eccentrically in loading response. Weak dorsiflexors → foot slap.", ur: "Haan — yeh loading response mein paon ko eccentric tareeqe se neeche laate hain. Kamzor dorsiflexors → foot slap." } },
        { text: { en: "Plantarflexors (calf)", ur: "Plantarflexors (calf)" }, feedback: { en: "Weak calves show up later — reduced push-off and a short step on the other side.", ur: "Kamzor calf baad mein nazar aata hai — kam push-off aur doosri taraf chhota qadam." } },
        { text: { en: "Hamstrings", ur: "Hamstrings" }, feedback: { en: "Hamstrings mostly decelerate the leg at the end of swing — they don't lower the foot after heel strike.", ur: "Hamstrings zyada tar swing ke end par taang ko dheema karte hain — aedi ke baad paon neeche nahi laate." } },
      ],
    },
    {
      type: "check",
      question: {
        en: "While standing on the RIGHT leg, the patient's LEFT side of the pelvis drops. Which muscle is weak?",
        ur: "RIGHT taang par khare hote waqt patient ke pelvis ki LEFT side neeche girti hai. Kaun sa muscle kamzor hai?",
      },
      options: [
        { text: { en: "Right hip abductors (gluteus medius)", ur: "Right hip abductors (gluteus medius)" }, correct: true, feedback: { en: "Correct — a positive Trendelenburg sign points to weakness on the STANCE side. The right abductors should hold the pelvis level.", ur: "Sahi — positive Trendelenburg sign STANCE wali side ki kamzori batata hai. Right abductors ko pelvis seedha rakhna chahiye." } },
        { text: { en: "Left hip abductors", ur: "Left hip abductors" }, feedback: { en: "Tempting, because the left side drops — but the muscle that should hold it up is on the standing (right) leg.", ur: "Dil ko lagta hai kyun ke left side girti hai — lekin jo muscle use thamta hai woh khari (right) taang par hai." } },
        { text: { en: "Right quadriceps", ur: "Right quadriceps" }, feedback: { en: "Quadriceps control the knee, not the level of the pelvis.", ur: "Quadriceps knee ko control karte hain, pelvis ki satah ko nahi." } },
      ],
    },
    {
      type: "sort",
      prompt: { en: "When does each deviation show up — stance or swing?", ur: "Har deviation kab nazar aati hai — stance ya swing?" },
      categories: [
        { en: "Stance", ur: "Stance" },
        { en: "Swing", ur: "Swing" },
      ],
      items: [
        { text: { en: "Foot slap", ur: "Foot slap" }, answer: 0, why: { en: "Loading response — weak dorsiflexors.", ur: "Loading response — kamzor dorsiflexors." } },
        { text: { en: "Trendelenburg (pelvic drop)", ur: "Trendelenburg (pelvis girna)" }, answer: 0, why: { en: "Single-limb stance — weak hip abductors.", ur: "Ek taang par stance — kamzor hip abductors." } },
        { text: { en: "Toe drag / foot drop", ur: "Ungliyan ghasitna / foot drop" }, answer: 1, why: { en: "The foot can't clear the ground in swing.", ur: "Swing mein paon zameen se nahi uth pata." } },
        { text: { en: "Steppage (high knee lift)", ur: "Steppage (ghutna unchaa uthana)" }, answer: 1, why: { en: "Compensation to clear a dropped foot in swing.", ur: "Swing mein gire hue paon ko uthane ki compensation." } },
        { text: { en: "Knee buckling", ur: "Ghutna mur jana (buckling)" }, answer: 0, why: { en: "Weight-bearing — weak quadriceps.", ur: "Wazan uthate waqt — kamzor quadriceps." } },
        { text: { en: "Circumduction (leg swung out sideways)", ur: "Circumduction (taang bahar ki taraf ghuma kar)" }, answer: 1, why: { en: "A swing-phase strategy to clear the foot (e.g. after stroke).", ur: "Paon uthane ki swing-phase strategy (maslan stroke ke baad)." } },
      ],
    },
    {
      type: "mistake",
      text: {
        en: "Common mistakes: watching from one angle only (watch from the front, side and back); fixating on one joint and missing the real cause above or below; and watching for two steps — patients compensate, so watch several cycles, at different speeds, and barefoot when it's safe.",
        ur: "Aam ghaltiyan: sirf ek angle se dekhna (aage, side aur peeche se dekhein); ek joint par atak jana aur upar ya neeche ki asal wajah miss karna; aur sirf do qadam dekhna — patients compensate karte hain, is liye kai cycles, mukhtalif raftaar par, aur safe ho to nange paon dekhein.",
      },
    },
    {
      type: "clinic",
      text: {
        en: "In the clinic: after stroke, reduced dorsiflexion in swing and knee hyperextension in stance are common — an ankle-foot orthosis can help foot clearance. After ACL reconstruction, many patients avoid bending the knee in loading response (\"quad avoidance\"); retraining it is part of a full recovery.",
        ur: "Clinic mein: stroke ke baad swing mein dorsiflexion kam aur stance mein knee hyperextension aam hai — ankle-foot orthosis paon uthane mein madad kar sakta hai. ACL reconstruction ke baad bohat se patients loading response mein ghutna morne se bachte hain (\"quad avoidance\"); ise dobara sikhana mukammal recovery ka hissa hai.",
      },
    },
    {
      type: "reveal",
      question: { en: "Why is stance about 60% and not 50%?", ur: "Stance taqreeban 60% kyun hai, 50% kyun nahi?" },
      answer: {
        en: "Because both feet are on the ground at the same time twice in every cycle — double support, roughly 10% at the start and 10% at the end of stance. Walk faster and double support shrinks; in running it disappears and a flight phase appears.",
        ur: "Kyun ke har cycle mein do baar dono paon ek saath zameen par hote hain — double support, stance ke shuru aur end par taqreeban 10% 10%. Tez chalein to double support kam hota hai; daurne mein khatam ho kar flight phase aa jata hai.",
      },
    },
  ],
  summary: [
    { en: "One cycle = heel strike to the same heel strike: ~60% stance, ~40% swing.", ur: "Ek cycle = aedi lagne se wohi aedi lagne tak: ~60% stance, ~40% swing." },
    { en: "Eight phases — I Love My Tiny Puppy (stance), I'M Tired (swing).", ur: "Aath phases — I Love My Tiny Puppy (stance), I'M Tired (swing)." },
    { en: "Link the deviation to the phase and the muscle: foot slap → dorsiflexors; Trendelenburg → stance-side abductors.", ur: "Deviation ko phase aur muscle se jorein: foot slap → dorsiflexors; Trendelenburg → stance side ke abductors." },
  ],
  flashcards: [
    { id: "gc-1", front: { en: "Stance vs swing at normal speed?", ur: "Normal raftaar par stance vs swing?" }, back: { en: "About 60% stance, 40% swing.", ur: "Taqreeban 60% stance, 40% swing." } },
    { id: "gc-2", front: { en: "Name the 5 stance phases.", ur: "Stance ke 5 phases?" }, back: { en: "Initial contact, loading response, mid stance, terminal stance, pre-swing.", ur: "Initial contact, loading response, mid stance, terminal stance, pre-swing." } },
    { id: "gc-3", front: { en: "Foot slap after heel strike suggests weakness of…?", ur: "Aedi ke baad foot slap kis ki kamzori batata hai?" }, back: { en: "Dorsiflexors (tibialis anterior) — they lower the foot eccentrically in loading response.", ur: "Dorsiflexors (tibialis anterior) — yeh loading response mein paon ko eccentric tareeqe se neeche laate hain." } },
    { id: "gc-4", front: { en: "Pelvis drops on the left while standing on the right leg → weak…?", ur: "Right taang par khare hone par left pelvis gire → kamzor…?" }, back: { en: "Right hip abductors (gluteus medius) — positive Trendelenburg.", ur: "Right hip abductors (gluteus medius) — positive Trendelenburg." } },
    { id: "gc-5", front: { en: "What is double support?", ur: "Double support kya hai?" }, back: { en: "When both feet are on the ground — at the start and end of stance; it disappears in running.", ur: "Jab dono paon zameen par hon — stance ke shuru aur end par; daurne mein khatam." } },
  ],
  goDeeper: [
    { title: "Stroke Rehabilitation", href: "/treatment-plans/stroke-rehabilitation", note: { en: "Gait deviations after stroke and how to train them.", ur: "Stroke ke baad gait deviations aur un ki training." } },
    { title: "ACL Reconstruction Rehabilitation", href: "/treatment-plans/acl-reconstruction-rehabilitation", note: { en: "Restoring normal loading response.", ur: "Normal loading response wapas lana." } },
    { title: "UMN vs LMN Lesions", href: "/learn/umn-vs-lmn", note: { en: "Why foot drop has different causes.", ur: "Foot drop ki wajahein alag kyun hoti hain." } },
  ],
  sources: [
    { citation: "Perry J, Burnfield JM. Gait Analysis: Normal and Pathological Function. 2nd ed. SLACK; 2010." },
    { citation: "Whittle MW. Gait Analysis: An Introduction. Elsevier." },
    { citation: "Neumann DA. Kinesiology of the Musculoskeletal System: Foundations for Rehabilitation. 3rd ed. Elsevier; 2017." },
  ],
};
