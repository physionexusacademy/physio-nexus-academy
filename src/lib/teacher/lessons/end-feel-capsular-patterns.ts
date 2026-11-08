import type { TeacherLesson } from "../types.ts";

export const endFeelCapsularPatterns: TeacherLesson = {
  slug: "end-feel-capsular-patterns",
  title: "End-Feel, Capsular Patterns & Selective Tissue Tension",
  hook: {
    en: "What your hands feel at the end of range is a diagnosis in itself. Learn Cyriax's system for telling joint, muscle and serious problems apart.",
    ur: "Range ke end par hathon ko jo mehsoos hota hai woh khud ek diagnosis hai. Cyriax ka system seekhein jo joint, muscle aur serious problems ko alag karta hai.",
  },
  area: "Clinical Reasoning",
  level: "Clinical",
  bestFor: "2nd year onwards",
  minutes: 13,
  goal: {
    en: "By the end, you'll name normal and abnormal end-feels, recognise the common capsular patterns and read resisted tests to tell contractile from inert tissue.",
    ur: "End tak aap normal aur abnormal end-feels pehchan sakenge, aam capsular patterns jaan sakenge aur resisted tests se contractile aur inert tissue alag kar sakenge.",
  },
  beats: [
    {
      type: "say",
      text: {
        en: "When you move a joint passively to the end of its range, you feel *how* the movement stops. That sensation is the **end-feel**. Normal joints have a predictable end-feel; a different one — or one at the wrong point in range — tells you something is wrong.",
        ur: "Jab aap joint ko passively range ke end tak le jate hain, aap mehsoos karte hain ke movement *kaise* rukti hai. Yehi ehsaas **end-feel** hai. Normal joints ka end-feel predictable hota hai; mukhtalif end-feel — ya range ke ghalat point par — batata hai ke kuch ghalat hai.",
      },
    },
    {
      type: "compare",
      title: { en: "Normal (physiological) end-feels", ur: "Normal (physiological) end-feels" },
      headers: [
        { en: "End-feel", ur: "End-feel" },
        { en: "What stops the movement", ur: "Movement kya rokta hai" },
        { en: "Example", ur: "Misaal" },
      ],
      rows: [
        [
          { en: "Soft", ur: "Soft" },
          { en: "Soft tissues squeezing together", ur: "Soft tissues ka aapas mein dabna" },
          { en: "Knee flexion (calf meets thigh), elbow flexion", ur: "Knee flexion (calf thigh se milti hai), elbow flexion" },
        ],
        [
          { en: "Firm", ur: "Firm" },
          { en: "Capsule, ligament or muscle being stretched", ur: "Capsule, ligament ya muscle ka stretch" },
          { en: "Shoulder external rotation, hip rotation, ankle dorsiflexion", ur: "Shoulder external rotation, hip rotation, ankle dorsiflexion" },
        ],
        [
          { en: "Hard", ur: "Hard" },
          { en: "Bone meeting bone", ur: "Haddi ka haddi se milna" },
          { en: "Elbow extension (olecranon into fossa)", ur: "Elbow extension (olecranon fossa mein)" },
        ],
      ],
    },
    {
      type: "analogy",
      text: {
        en: "Closing a door: a cushion behind it feels **soft**, a rubber door-stop feels **firm**, the door frame feels **hard**. An abnormal end-feel is the door stopping too early, bouncing back, or you stopping because someone shouts in pain before anything blocks it.",
        ur: "Darwaza band karna: peeche cushion ho to **soft**, rubber door-stop ho to **firm**, darwaze ki chaukhat ho to **hard**. Abnormal end-feel aisa hai jaise darwaza bohat pehle ruk jaye, wapas uchhle, ya aap is liye rukein ke koi dard se cheekhta hai jabke kuch bhi rok nahi raha.",
      },
    },
    {
      type: "compare",
      title: { en: "Abnormal (pathological) end-feels", ur: "Abnormal (pathological) end-feels" },
      headers: [
        { en: "End-feel", ur: "End-feel" },
        { en: "What it feels like", ur: "Kaisa lagta hai" },
        { en: "Think of", ur: "Kya sochein" },
      ],
      rows: [
        [
          { en: "Early firm (capsular)", ur: "Early firm (capsular)" },
          { en: "Firm stop, but well before normal range", ur: "Firm stop, lekin normal range se kaafi pehle" },
          { en: "Capsular tightness: frozen shoulder, OA", ur: "Capsular tightness: frozen shoulder, OA" },
        ],
        [
          { en: "Spasm", ur: "Spasm" },
          { en: "Sudden, guarded halt with pain — muscles 'grab'", ur: "Achanak, dard ke saath ruk jana — muscles 'pakar' leti hain" },
          { en: "Acute injury, instability, inflammation", ur: "Acute injury, instability, inflammation" },
        ],
        [
          { en: "Boggy", ur: "Boggy" },
          { en: "Soft, squishy, fluid-filled", ur: "Naram, pilpila, fluid bhara" },
          { en: "Joint effusion", ur: "Joint effusion" },
        ],
        [
          { en: "Springy block", ur: "Springy block" },
          { en: "Rebound before end of range", ur: "End of range se pehle wapas uchhalna" },
          { en: "Internal derangement, e.g. torn meniscus", ur: "Internal derangement, maslan meniscus tear" },
        ],
        [
          { en: "Empty", ur: "Empty" },
          { en: "No mechanical resistance — the patient's pain stops you", ur: "Koi mechanical resistance nahi — patient ka dard aap ko rokta hai" },
          { en: "Serious: acute bursitis, abscess, fracture, tumour — refer", ur: "Serious: acute bursitis, abscess, fracture, tumour — refer karein" },
        ],
      ],
    },
    {
      type: "check",
      question: {
        en: "You move a painful shoulder into abduction. You feel no resistance at all, but the patient begs you to stop at 60°. This end-feel is…",
        ur: "Aap dard wale shoulder ko abduction mein le jate hain. Koi resistance mehsoos nahi hoti, lekin patient 60° par rukne ki minnat karta hai. Yeh end-feel…",
      },
      options: [
        { text: { en: "Firm", ur: "Firm" }, feedback: { en: "Firm means you feel tissue resistance. Here you felt nothing.", ur: "Firm ka matlab tissue resistance mehsoos ho. Yahan kuch mehsoos nahi hua." } },
        { text: { en: "Empty", ur: "Empty" }, correct: true, feedback: { en: "Yes — pain stops the movement before any resistance. Consider acute bursitis or serious pathology; don't push on.", ur: "Haan — kisi resistance se pehle dard movement rok deta hai. Acute bursitis ya serious pathology sochein; zor na lagayein." } },
        { text: { en: "Hard", ur: "Hard" }, feedback: { en: "Hard means bone-on-bone resistance — you felt none.", ur: "Hard ka matlab haddi par haddi — aap ne koi resistance mehsoos nahi ki." } },
      ],
    },
    {
      type: "say",
      text: {
        en: "**Capsular pattern** (Cyriax): when the whole joint capsule is involved — arthritis, capsulitis — movements are lost in a typical proportion, not randomly:\n**Shoulder:** external rotation > abduction > internal rotation.\n**Hip:** internal rotation most, then flexion and abduction.\n**Knee:** flexion much more than extension.\n**Elbow:** flexion more than extension.\n**Ankle (talocrural):** plantarflexion more than dorsiflexion.",
        ur: "**Capsular pattern** (Cyriax): jab poora joint capsule involved ho — arthritis, capsulitis — to movements ek khaas tanasub se kam hoti hain, randomly nahi:\n**Shoulder:** external rotation > abduction > internal rotation.\n**Hip:** sab se zyada internal rotation, phir flexion aur abduction.\n**Knee:** flexion extension se kaafi zyada.\n**Elbow:** flexion extension se zyada.\n**Ankle (talocrural):** plantarflexion dorsiflexion se zyada.",
      },
      simpler: {
        en: "A whole-joint problem steals movements in a fixed order. A single-structure problem doesn't.",
        ur: "Poore joint ka masla movements ek muqarrar tarteeb se cheenta hai. Ek structure ka masla aisa nahi karta.",
      },
    },
    {
      type: "memory",
      text: {
        en: "Shoulder capsular pattern — \"**E**very **A**ngry **I**njury\": **E**R > **A**BD > **I**R. Think frozen shoulder: they can't turn the hand out to the side.",
        ur: "Shoulder capsular pattern — \"**E**very **A**ngry **I**njury\": **E**R > **A**BD > **I**R. Frozen shoulder sochein: haath bahar side par ghuma nahi sakte.",
      },
    },
    {
      type: "check",
      question: {
        en: "A 55-year-old has a stiff shoulder: passive ER 10°, abduction 80°, IR 40°, all with an early firm end-feel. Most likely?",
        ur: "55 saal ke patient ka shoulder stiff hai: passive ER 10°, abduction 80°, IR 40°, sab mein early firm end-feel. Sab se zyada mumkin?",
      },
      options: [
        { text: { en: "Rotator cuff tear", ur: "Rotator cuff tear" }, feedback: { en: "A cuff tear mainly loses active and resisted movement; passive range is usually near normal.", ur: "Cuff tear mein zyada tar active aur resisted movement kam hoti hai; passive range aksar normal ke qareeb hoti hai." } },
        { text: { en: "Capsular pattern — adhesive capsulitis or glenohumeral OA", ur: "Capsular pattern — adhesive capsulitis ya glenohumeral OA" }, correct: true, feedback: { en: "Yes — passive loss in the order ER > ABD > IR with early firm end-feel is the shoulder capsular pattern.", ur: "Haan — passive loss ER > ABD > IR ki tarteeb mein, early firm end-feel ke saath, shoulder ka capsular pattern hai." } },
        { text: { en: "Normal for age", ur: "Umar ke hisaab se normal" }, feedback: { en: "ER of 10° is far from normal at any age.", ur: "10° ER kisi bhi umar mein normal se bohat door hai." } },
      ],
    },
    {
      type: "say",
      text: {
        en: "**Selective tissue tension** separates two kinds of tissue:\n**Inert** (capsule, ligament, bursa): pain on **passive** movement, usually in the same direction as active.\n**Contractile** (muscle, tendon): pain on **resisted isometric** testing, and on passive stretch in the opposite direction.\nResisted tests are read as **strong/weak** and **painful/painless**.",
        ur: "**Selective tissue tension** do qism ke tissue alag karta hai:\n**Inert** (capsule, ligament, bursa): **passive** movement par dard, aksar active wali direction mein.\n**Contractile** (muscle, tendon): **resisted isometric** test par dard, aur opposite direction mein passive stretch par.\nResisted tests ko **strong/weak** aur **painful/painless** ke hisaab se parhte hain.",
      },
    },
    {
      type: "compare",
      title: { en: "Reading a resisted isometric test", ur: "Resisted isometric test parhna" },
      headers: [
        { en: "Result", ur: "Result" },
        { en: "Most likely meaning", ur: "Aam matlab" },
        { en: "Example", ur: "Misaal" },
      ],
      rows: [
        [
          { en: "Strong & painless", ur: "Strong & painless" },
          { en: "That muscle–tendon unit is normal", ur: "Woh muscle–tendon unit normal hai" },
          { en: "Look elsewhere for the source", ur: "Source kahin aur dhoondein" },
        ],
        [
          { en: "Strong & painful", ur: "Strong & painful" },
          { en: "Minor lesion of the muscle or tendon", ur: "Muscle ya tendon ka minor lesion" },
          { en: "Tendinopathy, e.g. lateral elbow", ur: "Tendinopathy, maslan lateral elbow" },
        ],
        [
          { en: "Weak & painless", ur: "Weak & painless" },
          { en: "Complete rupture or a neurological cause", ur: "Mukammal rupture ya neurological wajah" },
          { en: "Full-thickness cuff tear, nerve palsy", ur: "Full-thickness cuff tear, nerve palsy" },
        ],
        [
          { en: "Weak & painful", ur: "Weak & painful" },
          { en: "Significant lesion — partial tear, fracture, serious pathology", ur: "Bara lesion — partial tear, fracture, serious pathology" },
          { en: "Avulsion, metastasis — investigate", ur: "Avulsion, metastasis — investigate karein" },
        ],
      ],
    },
    {
      type: "try",
      title: { en: "Feel end-feels on yourself", ur: "Apne upar end-feels mehsoos karein" },
      steps: [
        { en: "Bend your elbow fully with the other hand — notice the soft stop.", ur: "Doosre haath se elbow poori moriye — soft stop note karein." },
        { en: "Straighten it fully — notice the hard, bony stop.", ur: "Poori seedhi karein — hard, bony stop note karein." },
        { en: "Gently pull your fingers back into extension — notice the firm, stretchy stop.", ur: "Ungliyon ko aahista extension mein peeche khenchein — firm, stretchy stop note karein." },
      ],
      ask: { en: "Which stop had the most 'give' before it ended?", ur: "Kis stop mein khatam hone se pehle sab se zyada 'lachak' thi?" },
      options: [
        { text: { en: "Elbow extension", ur: "Elbow extension" }, feedback: { en: "Hard end-feels have almost no give — bone meets bone.", ur: "Hard end-feel mein lachak na hone ke barabar — haddi haddi se milti hai." } },
        { text: { en: "Finger extension", ur: "Finger extension" }, feedback: { en: "Yes — firm end-feels have a slightly elastic, leathery give from capsule and ligaments.", ur: "Haan — firm end-feel mein capsule aur ligaments ki halki elastic, chamre jaisi lachak hoti hai." } },
      ],
    },
    {
      type: "evidence",
      text: {
        en: "Honest caveat: agreement between clinicians on end-feel is only fair to moderate, and better when combined with the pain–resistance sequence. Use end-feel as one piece of the puzzle with history, active range and resisted tests — never alone.",
        ur: "Imaandari ki baat: clinicians ke darmiyan end-feel par itifaq sirf fair se moderate hai, aur pain–resistance sequence ke saath behtar hota hai. End-feel ko history, active range aur resisted tests ke saath puzzle ka ek hissa samjhein — akela kabhi nahi.",
      },
    },
    {
      type: "check",
      question: {
        en: "Resisted wrist extension is strong but reproduces lateral elbow pain; passive wrist flexion with the elbow straight also hurts. Which tissue?",
        ur: "Resisted wrist extension strong hai lekin lateral elbow pain laata hai; seedhi elbow ke saath passive wrist flexion bhi dukhta hai. Kaun sa tissue?",
      },
      options: [
        { text: { en: "Inert — elbow joint capsule", ur: "Inert — elbow joint capsule" }, feedback: { en: "Capsular problems hurt on passive movement in a capsular pattern, not mainly on resisted tests.", ur: "Capsular problems capsular pattern mein passive movement par dukhte hain, zyada tar resisted tests par nahi." } },
        { text: { en: "Contractile — common extensor tendon", ur: "Contractile — common extensor tendon" }, correct: true, feedback: { en: "Yes — strong & painful on resistance plus pain on passive stretch the opposite way = contractile lesion (lateral elbow tendinopathy).", ur: "Haan — resistance par strong & painful aur opposite direction mein passive stretch par dard = contractile lesion (lateral elbow tendinopathy)." } },
        { text: { en: "A nerve palsy", ur: "Nerve palsy" }, feedback: { en: "Palsy gives weakness, often painless — this was strong.", ur: "Palsy kamzori deti hai, aksar bina dard — yeh strong tha." } },
      ],
    },
    {
      type: "clinic",
      text: {
        en: "How it changes treatment: an early firm, capsular end-feel suggests the capsule needs graded mobilisation and range work (e.g. Maitland grade III–IV into the stiffness when irritability allows); a strong-and-painful resisted test points to loading the tendon; spasm or a painful early end-feel means calm things down first; and an empty end-feel means stop and refer.",
        ur: "Ilaaj kaise badalta hai: early firm, capsular end-feel batata hai ke capsule ko graded mobilisation aur range work chahiye (maslan irritability ijazat de to stiffness mein Maitland grade III–IV); strong-and-painful resisted test tendon ko load karne ki taraf ishara karta hai; spasm ya dard wala early end-feel matlab pehle masla thanda karein; aur empty end-feel matlab rokein aur refer karein.",
      },
    },
    {
      type: "mistake",
      text: {
        en: "Common mistakes: forcing through an empty end-feel; calling every stiff joint 'capsular' without checking the pattern; testing resisted movements with the joint moving (they must be isometric, or you also load inert tissue); and forgetting to compare with the other side.",
        ur: "Aam ghaltiyan: empty end-feel ke bawajood zor lagana; har stiff joint ko pattern check kiye baghair 'capsular' kehna; resisted tests mein joint ko hilne dena (yeh isometric hone chahiye, warna inert tissue bhi load hota hai); aur doosri side se compare karna bhool jana.",
      },
    },
  ],
  summary: [
    { en: "Normal end-feels are soft, firm or hard; early firm, spasm, boggy, springy and empty are abnormal — empty means stop and investigate.", ur: "Normal end-feels soft, firm ya hard hain; early firm, spasm, boggy, springy aur empty abnormal hain — empty ka matlab ruk kar investigate karein." },
    { en: "A capsular pattern (e.g. shoulder ER > ABD > IR) points to a whole-joint problem such as capsulitis or arthritis.", ur: "Capsular pattern (maslan shoulder ER > ABD > IR) poore joint ke masle jaise capsulitis ya arthritis ki taraf ishara karta hai." },
    { en: "Resisted isometric tests separate contractile from inert tissue: strong/weak × painful/painless.", ur: "Resisted isometric tests contractile aur inert tissue alag karte hain: strong/weak × painful/painless." },
  ],
  flashcards: [
    { id: "ef-1", front: { en: "Three normal end-feels with an example each?", ur: "Teen normal end-feels, har ek ki misaal?" }, back: { en: "Soft (knee flexion), firm (shoulder ER), hard (elbow extension).", ur: "Soft (knee flexion), firm (shoulder ER), hard (elbow extension)." } },
    { id: "ef-2", front: { en: "What is an empty end-feel and why does it matter?", ur: "Empty end-feel kya hai aur kyun aham?" }, back: { en: "Pain stops movement before any resistance is felt — suggests acute bursitis or serious pathology; don't force, investigate/refer.", ur: "Kisi resistance se pehle dard movement rok deta hai — acute bursitis ya serious pathology; zor na dein, investigate/refer karein." } },
    { id: "ef-3", front: { en: "Shoulder capsular pattern?", ur: "Shoulder capsular pattern?" }, back: { en: "External rotation > abduction > internal rotation.", ur: "External rotation > abduction > internal rotation." } },
    { id: "ef-4", front: { en: "Knee and hip capsular patterns?", ur: "Knee aur hip capsular patterns?" }, back: { en: "Knee: flexion > extension. Hip: internal rotation most, then flexion and abduction.", ur: "Knee: flexion > extension. Hip: sab se zyada internal rotation, phir flexion aur abduction." } },
    { id: "ef-5", front: { en: "Resisted test weak & painless — think?", ur: "Resisted test weak & painless — kya sochein?" }, back: { en: "Complete rupture or a neurological cause.", ur: "Mukammal rupture ya neurological wajah." } },
  ],
  goDeeper: [
    { title: "Adhesive Capsulitis (Frozen Shoulder)", href: "/msk-injuries/adhesive-capsulitis", note: { en: "The classic capsular pattern, start to finish.", ur: "Classic capsular pattern, shuru se aakhir tak." } },
    { title: "Goniometry — Skills Lab", href: "/skills/goniometry", note: { en: "Measure the range before you judge the end-feel.", ur: "End-feel judge karne se pehle range naapein." } },
    { title: "Cyriax Deep Transverse Friction", href: "/manual-therapy/cyriax-deep-transverse-friction", note: { en: "Cyriax's treatment for contractile lesions.", ur: "Contractile lesions ke liye Cyriax ka treatment." } },
  ],
  sources: [
    { citation: "Cyriax J. Textbook of Orthopaedic Medicine, Vol 1: Diagnosis of Soft Tissue Lesions. 8th ed. Baillière Tindall; 1982." },
    { citation: "Magee DJ, Manske RC. Orthopedic Physical Assessment. 7th ed. Elsevier; 2021." },
    {
      citation: "Hayes KW, Petersen CM. Reliability of assessing end-feel and pain and resistance sequence in subjects with painful shoulders and knees. J Orthop Sports Phys Ther. 2001;31(8):432–445.",
      pubmedQuery: "Hayes Petersen reliability of assessing end-feel and pain and resistance sequence",
    },
  ],
};
