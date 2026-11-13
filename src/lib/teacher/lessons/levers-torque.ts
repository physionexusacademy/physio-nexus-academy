import type { TeacherLesson } from "../types.ts";

export const leversTorque: TeacherLesson = {
  slug: "levers-torque",
  title: "Levers, Torque & Moment Arms — Biomechanics You Actually Use",
  hook: {
    en: "Why does an ankle weight make a straight-leg raise so much harder? Why does a cane belong in the opposite hand? It's all torque.",
    ur: "Ankle weight straight-leg raise ko itna mushkil kyun bana deta hai? Cane opposite haath mein kyun? Sab torque ka khel hai.",
  },
  area: "Movement Science",
  level: "Foundation",
  bestFor: "1st–2nd year",
  minutes: 11,
  goal: {
    en: "By the end, you'll classify the three lever types, calculate torque, and use moment arms to make exercises easier or harder and to protect joints.",
    ur: "End tak aap teen lever types classify kar sakenge, torque calculate kar sakenge, aur moment arms se exercises asaan ya mushkil bana sakenge aur joints ko bacha sakenge.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "A joint is an **axis** (fulcrum), bones are **levers**, muscles provide the **effort** and body weight or external loads are the **resistance**. What turns a joint is not force alone but **torque**:\n**Torque = force × moment arm** (the perpendicular distance from the axis to the line of the force).",
        ur: "Joint ek **axis** (fulcrum) hai, haddiyan **levers** hain, muscles **effort** deti hain aur jism ka wazan ya bahar ka load **resistance** hai. Joint ko sirf force nahi ghumati balke **torque**:\n**Torque = force × moment arm** (axis se force ki line tak perpendicular faasla).",
      },
      simpler: {
        en: "Turning power = how hard you push × how far from the hinge you push.",
        ur: "Ghumane ki taqat = kitna zor × hinge se kitni door zor.",
      },
    },
    {
      type: "analogy",
      text: {
        en: "Push a door near its hinges and it barely moves. Push at the handle with the same force and it swings open. Same force, longer moment arm, more torque. Your muscles and your patients' limbs obey exactly the same rule.",
        ur: "Darwaze ko hinges ke paas dhakelein to mushkil se hilta hai. Wohi zor handle par lagayein to khul jata hai. Wohi force, lamba moment arm, zyada torque. Aap ki muscles aur patients ke limbs bilkul isi usool par chalte hain.",
      },
    },
    {
      type: "compare",
      title: { en: "The three lever classes", ur: "Teen lever classes" },
      headers: [
        { en: "Class", ur: "Class" },
        { en: "Arrangement", ur: "Tarteeb" },
        { en: "Body example", ur: "Jism mein misaal" },
      ],
      rows: [
        [
          { en: "1st class", ur: "1st class" },
          { en: "Axis in the middle (effort – axis – load), like a see-saw", ur: "Axis beech mein (effort – axis – load), see-saw jaisa" },
          { en: "Neck extensors balancing the head on the atlanto-occipital joint", ur: "Neck extensors sir ko atlanto-occipital joint par balance karte hain" },
        ],
        [
          { en: "2nd class", ur: "2nd class" },
          { en: "Load in the middle (axis – load – effort), like a wheelbarrow", ur: "Load beech mein (axis – load – effort), wheelbarrow jaisa" },
          { en: "Rising onto tiptoes: axis at the toes, body weight, calf pulls the heel up", ur: "Panjon par uthna: axis toes par, jism ka wazan, calf heel ko upar khenchti hai" },
        ],
        [
          { en: "3rd class", ur: "3rd class" },
          { en: "Effort in the middle (axis – effort – load), like tweezers", ur: "Effort beech mein (axis – effort – load), chimte jaisa" },
          { en: "Biceps lifting the forearm — the most common lever in the body", ur: "Biceps forearm uthata hai — jism mein sab se aam lever" },
        ],
      ],
    },
    {
      type: "memory",
      text: {
        en: "**FLE 1-2-3**: what's in the middle? 1st = **F**ulcrum, 2nd = **L**oad, 3rd = **E**ffort.",
        ur: "**FLE 1-2-3**: beech mein kya hai? 1st = **F**ulcrum, 2nd = **L**oad, 3rd = **E**ffort.",
      },
    },
    {
      type: "say",
      text: {
        en: "**Mechanical advantage = effort arm ÷ resistance arm.** Most body levers are 3rd class with a short effort arm: muscles must produce large forces, but they gain **speed and range** at the end of the limb. The biceps inserts only a few centimetres from the elbow — that's why it needs to be strong, and why the hand moves fast.",
        ur: "**Mechanical advantage = effort arm ÷ resistance arm.** Jism ke zyada tar levers 3rd class hain jin ka effort arm chhota hai: muscles ko bari force banani parti hai, lekin limb ke end par **speed aur range** milti hai. Biceps elbow se sirf kuch centimetre door lagti hai — isi liye usay strong hona parta hai, aur isi liye haath tez chalta hai.",
      },
    },
    {
      type: "check",
      question: {
        en: "A 2 kg weight is held in the hand 30 cm from the elbow axis, forearm horizontal. Roughly what torque does it create? (Use 10 N per kg.)",
        ur: "2 kg weight haath mein elbow axis se 30 cm door hai, forearm horizontal. Taqreeban kitna torque banata hai? (1 kg = 10 N.)",
      },
      options: [
        { text: { en: "0.6 Nm", ur: "0.6 Nm" }, feedback: { en: "Check the units: 30 cm is 0.3 m, and 2 kg is 20 N.", ur: "Units check karein: 30 cm = 0.3 m, aur 2 kg = 20 N." } },
        { text: { en: "6 Nm", ur: "6 Nm" }, correct: true, feedback: { en: "Yes: 20 N × 0.3 m = 6 Nm — and the biceps, with its tiny moment arm, must make far more force than 20 N to match it.", ur: "Haan: 20 N × 0.3 m = 6 Nm — aur biceps ko, apne chhote moment arm ke saath, ise barabar karne ke liye 20 N se kahin zyada force banani parti hai." } },
        { text: { en: "60 Nm", ur: "60 Nm" }, feedback: { en: "That would need a 3 m forearm!", ur: "Iske liye 3 m lamba forearm chahiye!" } },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "Change the **moment arm** to change difficulty without changing the weight:\n**Straight-leg raise** — weight at the ankle is much harder than at the knee.\n**Shoulder abduction** — bent elbow (short lever) is easier than straight arm.\n**Plank** — on the knees is easier than on the toes.\n**MMT** — apply your resistance at the distal end of the segment (long lever); you need less force and detect weakness more easily.",
        ur: "Weight badle baghair mushkil badalne ke liye **moment arm** badlein:\n**Straight-leg raise** — weight ankle par ho to knee se kaafi zyada mushkil.\n**Shoulder abduction** — muri hui elbow (chhota lever) seedhe haath se asaan.\n**Plank** — knees par toes se asaan.\n**MMT** — resistance segment ke distal end par lagayein (lamba lever); kam force chahiye aur kamzori asaani se pakri jati hai.",
      },
    },
    {
      type: "try",
      title: { en: "Feel the moment arm", ur: "Moment arm mehsoos karein" },
      steps: [
        { en: "Hold a full water bottle with your arm straight out to the side for 10 seconds.", ur: "Bhari pani ki bottle seedhe haath ko side mein phaila kar 10 second pakrein." },
        { en: "Now bend your elbow and hold the bottle near your shoulder for 10 seconds.", ur: "Ab elbow mor kar bottle ko shoulder ke paas 10 second pakrein." },
      ],
      ask: { en: "Why was the second hold so much easier for your deltoid?", ur: "Deltoid ke liye doosra hold itna asaan kyun tha?" },
      options: [
        { text: { en: "The bottle got lighter", ur: "Bottle halki ho gayi" }, feedback: { en: "Same bottle — the weight didn't change.", ur: "Wohi bottle — wazan nahi badla." } },
        { text: { en: "The load moved closer to the shoulder axis, shrinking its moment arm", ur: "Load shoulder axis ke qareeb aa gaya, moment arm chhota ho gaya" }, feedback: { en: "Exactly — less moment arm, less torque for the deltoid to resist.", ur: "Bilkul — kam moment arm, deltoid ke liye kam torque." } },
      ],
    },
    {
      type: "say",
      text: {
        en: "Joint protection uses the same idea. In single-leg stance, the hip abductors must balance body weight acting far from the hip — so joint compression at the hip can reach about 2–3 × body weight. A **cane in the opposite hand** creates an extra counter-torque far from the hip, so the abductors (and the joint) need much less force.",
        ur: "Joint protection bhi isi usool par hai. Ek taang par khare hone mein hip abductors ko jism ke wazan ko balance karna parta hai jo hip se door kaam karta hai — is liye hip par joint compression taqreeban 2–3 × body weight tak pohanch sakta hai. **Opposite haath mein cane** hip se door ek extra counter-torque banata hai, to abductors (aur joint) ko kaafi kam force chahiye.",
      },
    },
    {
      type: "check",
      question: {
        en: "A patient with right hip OA asks which hand to hold the walking stick in. Best advice?",
        ur: "Right hip OA wala patient poochta hai ke walking stick kis haath mein pakre. Behtareen mashwara?",
      },
      options: [
        { text: { en: "Right hand, next to the painful hip", ur: "Right haath, dard wale hip ke saath" }, feedback: { en: "Same-side use gives a short moment arm and little unloading of the hip abductors.", ur: "Usi side par chhota moment arm milta hai aur hip abductors ka load kam hi hota hai." } },
        { text: { en: "Left hand, moving the stick with the right leg", ur: "Left haath, stick right leg ke saath aage" }, correct: true, feedback: { en: "Yes — opposite hand, advanced with the painful leg. The long counter-moment reduces abductor force and hip compression.", ur: "Haan — opposite haath, dard wali leg ke saath aage. Lamba counter-moment abductor force aur hip compression kam karta hai." } },
        { text: { en: "Either hand — it makes no difference", ur: "Koi bhi haath — farq nahi parta" }, feedback: { en: "It makes a big biomechanical difference.", ur: "Biomechanically bara farq parta hai." } },
      ],
    },
    {
      type: "sort",
      prompt: {
        en: "Does each change make the exercise harder or easier for the target muscle?",
        ur: "Har tabdeeli target muscle ke liye exercise ko mushkil karti hai ya asaan?",
      },
      categories: [
        { en: "Harder (longer moment arm)", ur: "Mushkil (lamba moment arm)" },
        { en: "Easier (shorter moment arm)", ur: "Asaan (chhota moment arm)" },
      ],
      items: [
        { text: { en: "Moving a cuff weight from knee to ankle in SLR", ur: "SLR mein cuff weight knee se ankle par" }, answer: 0, why: { en: "Load moves further from the hip axis.", ur: "Load hip axis se door chala jata hai." } },
        { text: { en: "Side plank on knees instead of feet", ur: "Feet ke bajaye knees par side plank" }, answer: 1, why: { en: "Shorter body lever.", ur: "Jism ka lever chhota." } },
        { text: { en: "Lateral raise with a straight instead of bent elbow", ur: "Lateral raise muri ke bajaye seedhi elbow se" }, answer: 0, why: { en: "Hand (load) further from the shoulder.", ur: "Haath (load) shoulder se door." } },
        { text: { en: "Carrying shopping close to the body instead of at arm's length", ur: "Shopping baazu phaila kar ke bajaye jism ke qareeb uthana" }, answer: 1, why: { en: "Load closer to the spine — less back muscle torque.", ur: "Load spine ke qareeb — back muscles par kam torque." } },
      ],
    },
    {
      type: "check",
      question: {
        en: "When the biceps flexes the elbow to lift a cup, what lever class is it?",
        ur: "Jab biceps cup uthane ke liye elbow flex karta hai to yeh kaun si lever class hai?",
      },
      options: [
        { text: { en: "1st class", ur: "1st class" }, feedback: { en: "In a 1st-class lever the axis sits between effort and load — here the elbow axis is at one end.", ur: "1st class mein axis effort aur load ke beech hota hai — yahan elbow axis ek kinare par hai." } },
        { text: { en: "2nd class", ur: "2nd class" }, feedback: { en: "That needs the load in the middle; the cup in the hand is furthest from the elbow.", ur: "Is ke liye load beech mein chahiye; haath mein cup elbow se sab se door hai." } },
        { text: { en: "3rd class", ur: "3rd class" }, correct: true, feedback: { en: "Yes — axis (elbow), then effort (biceps insertion), then load (cup in the hand). Great for speed and range, costly in force.", ur: "Haan — axis (elbow), phir effort (biceps insertion), phir load (haath mein cup). Speed aur range ke liye zabardast, force mein mehnga." } },
      ],
    },
    {
      type: "mistake",
      text: {
        en: "Common mistakes: thinking only weight matters (the moment arm matters just as much); applying MMT resistance mid-segment on one side and at the wrist on the other, then comparing; and teaching back-care 'lift with your legs' without the simplest rule — keep the load close.",
        ur: "Aam ghaltiyan: sirf wazan ko aham samajhna (moment arm utna hi aham hai); MMT mein ek side segment ke beech aur doosri side wrist par resistance de kar compare karna; aur back-care mein 'legs se uthayein' sikhana lekin sab se seedha usool bhool jana — load ko qareeb rakhein.",
      },
    },
    {
      type: "reveal",
      question: {
        en: "Your post-op knee patient can't yet do a straight-leg raise with a 1 kg ankle weight. Give two ways to progress towards it without buying a lighter weight.",
        ur: "Aap ka post-op knee patient abhi 1 kg ankle weight ke saath straight-leg raise nahi kar pata. Halka weight khareede baghair is tak pohanchne ke do tareeqe batayein.",
      },
      answer: {
        en: "Shorten the moment arm: put the weight just above the knee, then gradually move it towards the ankle. Or reduce the effect of gravity: start with the leg in a less horizontal position (e.g. supported in slight hip flexion) or do the lift with the weight unloaded, then add the weight at the shortest lever first.",
        ur: "Moment arm chhota karein: weight knee ke bilkul upar rakhein, phir aahista aahista ankle ki taraf le jayein. Ya gravity ka asar kam karein: leg ko kam horizontal position se shuru karein (maslan halke hip flexion mein support) ya pehle bina weight ke uthayein, phir weight sab se chhote lever par add karein.",
      },
    },
  ],
  summary: [
    { en: "Torque = force × moment arm; moving a load further from the axis increases torque.", ur: "Torque = force × moment arm; load ko axis se door karne se torque barhta hai." },
    { en: "1st, 2nd, 3rd class levers have the fulcrum, load or effort in the middle; most body levers are 3rd class (speed and range over force).", ur: "1st, 2nd, 3rd class levers mein beech mein fulcrum, load ya effort hota hai; jism ke zyada tar levers 3rd class hain (force ke bajaye speed aur range)." },
    { en: "Use moment arms to grade exercises, standardise MMT and protect joints — e.g. a cane in the opposite hand.", ur: "Moment arms se exercises grade karein, MMT standard karein aur joints bachayein — maslan opposite haath mein cane." },
  ],
  flashcards: [
    { id: "lv-1", front: { en: "Formula for torque?", ur: "Torque ka formula?" }, back: { en: "Torque = force × perpendicular distance from the axis (moment arm).", ur: "Torque = force × axis se perpendicular faasla (moment arm)." } },
    { id: "lv-2", front: { en: "What's in the middle in 1st, 2nd and 3rd class levers?", ur: "1st, 2nd aur 3rd class levers mein beech mein kya hai?" }, back: { en: "Fulcrum, Load, Effort (FLE 1-2-3).", ur: "Fulcrum, Load, Effort (FLE 1-2-3)." } },
    { id: "lv-3", front: { en: "Most common lever class in the body, and what it favours?", ur: "Jism mein sab se aam lever class, aur kis cheez ko favour karti hai?" }, back: { en: "3rd class — favours speed and range of motion over force.", ur: "3rd class — force ke bajaye speed aur range of motion." } },
    { id: "lv-4", front: { en: "Which hand for a cane in hip OA, and why?", ur: "Hip OA mein cane kis haath mein, aur kyun?" }, back: { en: "Opposite hand — creates a long counter-moment that reduces hip abductor force and joint compression.", ur: "Opposite haath — lamba counter-moment banata hai jo hip abductor force aur joint compression kam karta hai." } },
    { id: "lv-5", front: { en: "Name two ways to make a shoulder abduction exercise easier.", ur: "Shoulder abduction exercise asaan karne ke do tareeqe?" }, back: { en: "Bend the elbow (shorter lever) or hold the weight closer to the shoulder; or reduce gravity's effect.", ur: "Elbow morein (chhota lever) ya weight shoulder ke qareeb pakrein; ya gravity ka asar kam karein." } },
  ],
  goDeeper: [
    { title: "Open vs Closed Kinetic Chain", href: "/learn/open-vs-closed-chain", note: { en: "Where the load and the moment arms change.", ur: "Jahan load aur moment arms badalte hain." } },
    { title: "Manual Muscle Testing — Skills Lab", href: "/skills/manual-muscle-testing", note: { en: "Correct hand placement for long-lever testing.", ur: "Long-lever testing ke liye sahi hand placement." } },
    { title: "Hip Osteoarthritis — treatment plan", href: "/conditions/hip-osteoarthritis#clinical", note: { en: "Joint protection and walking aids in practice.", ur: "Practice mein joint protection aur walking aids." } },
  ],
  sources: [
    { citation: "Neumann DA. Kinesiology of the Musculoskeletal System: Foundations for Rehabilitation. 3rd ed. Elsevier; 2017." },
    { citation: "Levangie PK, Norkin CC, Lewek MD. Joint Structure and Function: A Comprehensive Analysis. 6th ed. F.A. Davis; 2019." },
    {
      citation: "Neumann DA. Hip abductor muscle activity as subjects with hip prostheses walk with different methods of using a cane. Phys Ther. 1998;78(5):490–501.",
      pubmedQuery: "Neumann hip abductor muscle activity hip prostheses walk cane",
    },
  ],
};
