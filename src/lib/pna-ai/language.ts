/**
 * Physio Nexus AI — language understanding tables.
 * Roman Urdu body parts and symptoms, lay terms and clinical abbreviations are
 * expanded into the vocabulary used by PNA's own pages. Pure data, no imports.
 */

/** Words that carry no topic meaning (English + Roman Urdu). */
export const STOP_WORDS = new Set([
  // English
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "could", "do", "does", "did", "for", "from", "get",
  "give", "go", "have", "has", "had", "help", "how", "i", "if", "in", "into", "is", "it", "its", "just", "know", "let", "like",
  "me", "more", "most", "much", "my", "need", "of", "on", "or", "our", "please", "pls", "plz", "should", "show", "so", "some",
  "tell", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "to", "too", "us", "very",
  "want", "was", "we", "what", "when", "where", "which", "who", "why", "will", "with", "would", "you", "your", "about",
  "find", "learn", "read", "any", "best", "good", "really", "also", "kindly", "sir", "madam", "doctor", "dr",
  // Roman Urdu function words
  "ka", "ki", "ke", "ko", "se", "mein", "main", "me", "mai", "hai", "hain", "hy", "he", "ho", "hota", "hoti", "hote",
  "kya", "kia", "kaise", "kese", "kaisay", "kyun", "kyon", "kab", "kahan", "aur", "or", "ya", "ye", "yeh", "wo", "woh",
  "mujhe", "mujhay", "mera", "meri", "mere", "humein", "hamara", "aap", "ap", "apna", "apni", "kar", "karna", "karein",
  "karen", "karo", "kr", "raha", "rahi", "rahe", "tha", "thi", "the", "bhi", "to", "toh", "bata", "batao", "bataen",
  "batayein", "btao", "samjhao", "samjha", "samjhaen", "chahiye", "chahye", "liye", "lye", "wala", "wali", "wale", "sa",
  "si", "na", "nahi", "nahin", "jab", "agar", "phir", "bohat", "bahut", "zyada", "thora", "thoda", "ab", "abhi",
  "roman", "urdu", "english", "language", "par", "pe", "mareez", "mareezon", "mariz", "karun", "karoon", "lun", "dena", "dein", "den", "lagate", "karte", "krte", "lete", "kahan", "kidhar",
  "tareeqe", "tareeka", "tarika", "tariqa", "lafzon", "lafzo", "lafz", "kitni", "kitne", "kitna", "konsa", "kaunsa", "kaun", "kon", "kuch", "kya",
]);

/** Words that mark a message as Roman Urdu. */
export const URDU_MARKERS = new Set([
  "hai", "hain", "kya", "kia", "kaise", "kese", "kyun", "mujhe", "mera", "meri", "mere", "dard", "nahi", "nahin", "karna",
  "karein", "chahiye", "ilaj", "ilaaj", "batao", "samjhao", "mein", "ka", "ki", "ke", "ko", "aur", "raha", "rahi", "hota",
  "hoti", "kamar", "ghutna", "ghutne", "gardan", "kandha", "kandhe", "sunn", "akran", "chakkar", "tha", "thi", "wala",
  "samjha", "samjhaen", "samjhain", "samjhaiye", "karun", "karoon", "bhejein", "bhejo", "bulayein", "lun", "milengi", "milega", "milti",
  "kahan", "kidhar", "kaun", "kaunsa", "konsa", "kitni", "kitne", "saath", "sath", "lekin", "magar", "pehle", "baad", "aasan", "asaan",
  "lafzon", "tareeqe", "tareeka", "padhai", "parhai", "parhein", "padhein", "ghar", "hota", "hotay", "hotey", "lagate", "karte", "mareez",
  "pindli", "neend", "dil", "bazu", "haath", "paon", "taang", "reerh", "pasli", "peeth",
]);

type Expansion = { re: RegExp; to: string; urduOnly?: boolean };

/**
 * Roman Urdu → English, applied word-for-word to the message before searching.
 * `urduOnly` entries collide with English words and apply only to Urdu messages.
 */
export const URDU_TERMS: Expansion[] = [
  { re: /\b(kamar|kamr|qamar)\b/g, to: "low back" },
  { re: /\b(reerh|reedh|rerh|reeh)\b/g, to: "spine" },
  { re: /\b(gardan|gardn|gardin|gerdan)\b/g, to: "neck" },
  { re: /\b(kandha|kandhe|kandhay|kandhon|kandho|kanda)\b/g, to: "shoulder" },
  { re: /\b(kohni|kohniyon)\b/g, to: "elbow" },
  { re: /\b(kalai|kalaai|kalayi)\b/g, to: "wrist" },
  { re: /\b(haath|hath|hathon|haathon)\b/g, to: "hand" },
  { re: /\b(ungli|ungliyan|ungliyon|ungliyaan|unglian)\b/g, to: "finger" },
  { re: /\b(ghutna|ghutne|ghutnay|ghutnon|ghutno|gutna|gutne)\b/g, to: "knee" },
  { re: /\b(takhna|takhne|takhnay|takhnon|takhno|tukhna)\b/g, to: "ankle" },
  { re: /\b(aedi|aidi|airi|eri|eddi|edi|aeri)\b/g, to: "heel" },
  { re: /\b(paon|paaon|paon|pao|pairon|pairo|peron)\b/g, to: "foot" },
  { re: /\b(pair|paer|per)\b/g, to: "foot", urduOnly: true },
  { re: /\b(taang|taangon|tangon|tangein|taangein)\b/g, to: "leg" },
  { re: /\b(tang)\b/g, to: "leg", urduOnly: true },
  { re: /\b(kulha|koolha|kooli|kulhay|kulhe|koolhay)\b/g, to: "hip" },
  { re: /\b(jabra|jabray|jabre)\b/g, to: "jaw" },
  { re: /\b(seena|sina|seene|chhati|chati|chhaati)\b/g, to: "chest" },
  { re: /\b(sar|sir)\s+(dard|dard\w*)\b/g, to: "headache" },
  { re: /\b(sar|sir)\b/g, to: "head", urduOnly: true },
  { re: /\b(dard|dardd|dukh|dukhta|dukhti|dukhtay|dard\w*)\b/g, to: "pain" },
  { re: /\b(sunn|sunnpan|sunpan|sun\s+ho)\b/g, to: "numbness" },
  { re: /\b(sun)\b/g, to: "numbness", urduOnly: true },
  { re: /\b(jhunjhunahat|jhunjhuni|jhun jhun|jhanjhanahat|sui chubh\w*|chuntiyan)\b/g, to: "tingling" },
  { re: /\b(sujan|soojan|sooja|suja|soojh|sujh)\b/g, to: "swelling" },
  { re: /\b(akran|akarn|akadan|akarna|jakran|jakar|jakarr|jakaran|akar)\b/g, to: "stiffness" },
  { re: /\b(kamzori|kamzor)\b/g, to: "weakness" },
  { re: /\b(chot|chout|zakhm)\b/g, to: "injury" },
  { re: /\b(moch|mooch|mouch)\b/g, to: "sprain" },
  { re: /\b(haddi|haddiyon|haddiyan|hadi)\s+(toot|tooti|tut|tuti|tootna)\w*\b/g, to: "fracture" },
  { re: /\b(toot|tooti|tut|tuti)\s+(gayi|gai|gaya|gya)\b/g, to: "fracture" },
  { re: /\b(haddi|haddiyon|haddiyan|hadi)\b/g, to: "bone" },
  { re: /\b(nas|nasen|nason|nass|rag|ragen|ragon)\b/g, to: "nerve" },
  { re: /\b(pattha|patthay|patthe|pathay|pathe|patthon)\b/g, to: "muscle" },
  { re: /\b(jor|joron|jorr|jodon|jod)\b/g, to: "joint" },
  { re: /\b(chakkar|chakar|chakkr)\b/g, to: "dizziness vertigo" },
  { re: /\b(falij|faalij|falaj|faalaj)\b/g, to: "stroke" },
  { re: /\b(laqwa|lakwa|laqwah)\b/g, to: "facial palsy" },
  { re: /\b(kampan|kaanpna|kampkampi|larza)\b/g, to: "tremor parkinson" },
  { re: /\b(peshab|pishab|peshaab)\b/g, to: "urine" },
  { re: /\b(pakhana|paakhana|latrine|paikhana)\b/g, to: "bowel" },
  { re: /\b(saans|sans|saas)\s+(phool\w*|ruk\w*)\b/g, to: "breathlessness" },
  { re: /\b(saans|sans)\b/g, to: "breathing" },
  { re: /\b(bukhar|bukhaar|bukar)\b/g, to: "fever" },
  { re: /\b(ilaj|ilaaj|elaj|ilaaj\w*)\b/g, to: "treatment" },
  { re: /\b(warzish|warzishen|kasrat|exercises?)\b/g, to: "exercise" },
  { re: /\b(gir|gira|giri|girna|girne)\s+(gaya|gayi|gai|gya|parna|para)\b/g, to: "fall" },
  { re: /\b(bachcha|bacha|bachay|bachon|bachche|bache)\b/g, to: "child pediatric" },
  { re: /\b(buzurg|boorha|boorhi|budhapa|budhape)\b/g, to: "older adult" },
  { re: /\b(hamal|zachgi)\b/g, to: "pregnancy" },
  { re: /\b(motapa|motapay)\b/g, to: "obesity" },
  { re: /\b(chalna|chalne|chalnay|chalte)\b/g, to: "walking" },
  { re: /\b(seerhi|seerhiyan|seerhiyon|siddhi)\b/g, to: "stairs" },
  { re: /\b(jhukna|jhukne|jhuknay)\b/g, to: "bending" },
  { re: /\b(theek|thik|sahi)\s+(kaise|kese|kaisay)\b/g, to: "treatment" },
  { re: /\b(pindli|pindlee|pindliyon|pindliyan)\b/g, to: "calf" },
  { re: /\b(bazu|bazoo|baazu|bazuon)\b/g, to: "arm" },
  { re: /\b(pasli|pasliyan|pasliyon)\b/g, to: "rib chest" },
  { re: /\b(peeth|pith)\b/g, to: "back" },
  { re: /\b(neend|neendh|nind)\b/g, to: "night sleep" },
  { re: /\b(raat|raaat|raatko)\b/g, to: "night", urduOnly: true },
  { re: /\b(subah|subha|sawere)\b/g, to: "morning", urduOnly: true },
  { re: /\b(dil)\s+(ke|ka|ki)?\s*(operation|surgery|ki surgery)\b/g, to: "heart surgery cardiac rehabilitation post cabg" },
  { re: /\b(dil|dill)\b/g, to: "heart", urduOnly: true },
  { re: /\b(operation|aperation|surgery)\b/g, to: "surgery" },
  { re: /\b(sugar|shugar|diabetes)\b/g, to: "diabetes", urduOnly: true },
  { re: /\b(padhai|parhai|padhna|parhna|padhein|parhein|parho|padho)\b/g, to: "study learn" },
  { re: /\b(shuru|start)\s+(karun|karoon|karein|karen|kahan se)\b/g, to: "start here beginner" },
  { re: /\b(bhejein|bhejo|bhejiye|bhej\s+do|bulayein|bulao|bulaen)\b/g, to: "visit", urduOnly: true },
  { re: /\b(ghar)\b/g, to: "home", urduOnly: true },
  { re: /\b(asaan|aasan|asan|aasaan)\b/g, to: "simple", urduOnly: true },
];

/**
 * Lay terms, synonyms and abbreviations → the words PNA pages use.
 * Applied to the (translated) message; each match adds its expansion.
 */
export const CLINICAL_TERMS: Expansion[] = [
  // Conditions in everyday words
  { re: /\b(slipped|slip|bulging|bulge|herniated|prolapsed)\s+(disc|disk)\b|\bdisk\b|\bdisc\s+(problem|issue|bulge|herniation)\b/g, to: "disc herniation radiculopathy sciatica lumbar" },
  { re: /\bsciatica\b/g, to: "lumbar radiculopathy sciatic nerve" },
  { re: /\bfrozen\s+shoulder\b|\bshoulder\s+(jam|jama|jamm|jum)\w*\b|\b(stiff|jammed)\s+shoulder\b/g, to: "adhesive capsulitis" },
  { re: /\btennis\s+elbow\b/g, to: "lateral epicondylalgia lateral elbow tendinopathy" },
  { re: /\bgolfers?\s+elbow\b/g, to: "medial epicondylalgia" },
  { re: /\bjumpers?\s+knee\b/g, to: "patellar tendinopathy" },
  { re: /\b(runners?\s+knee|anterior\s+knee\s+pain|kneecap\s+pain|knee\s+cap\s+pain)\b/g, to: "patellofemoral pain" },
  { re: /\bshin\s+splints?\b/g, to: "tibial stress" },
  { re: /\b(plantar\s+fasciitis|plantar\s+fasciopathy|heel\s+spur|heel\s+pain)\b/g, to: "plantar heel pain" },
  { re: /\b(text\s+neck|stiff\s+neck|neck\s+pain)\b/g, to: "mechanical neck pain cervical" },
  { re: /\b(lbp|lower\s+back|low\s+back|back\s+pain|backache)\b/g, to: "low back pain lumbar nonspecific" },
  { re: /\bknee\s+(pain|problem)\b/g, to: "knee osteoarthritis patellofemoral" },
  { re: /\bshoulder\s+(pain|problem)\b/g, to: "rotator cuff shoulder pain" },
  { re: /\bankle\s+(twist|sprain|roll)\w*\b|\btwisted\s+ankle\b/g, to: "lateral ankle sprain" },
  { re: /\bpinched\s+nerve\b/g, to: "radiculopathy nerve root" },
  { re: /\b(oa|osteoarthrosis|arthritis)\b/g, to: "osteoarthritis" },
  { re: /\bacl\b/g, to: "anterior cruciate ligament acl" },
  { re: /\bpcl\b/g, to: "posterior cruciate ligament pcl" },
  { re: /\bmcl\b/g, to: "medial collateral ligament mcl" },
  { re: /\b(cva|brain\s+stroke|paralysis|hemiplegia|hemiparesis)\b/g, to: "stroke" },
  { re: /\bsci\b/g, to: "spinal cord injury" },
  { re: /\bcp\b/g, to: "cerebral palsy" },
  { re: /\b(pd|parkinsons?)\b/g, to: "parkinson" },
  { re: /\bcopd\b/g, to: "copd pulmonary rehabilitation" },
  { re: /\b(cabg|bypass)\b/g, to: "post cabg cardiac rehabilitation" },
  { re: /\b(heart\s+attack|mi|cardiac\s+rehab)\b/g, to: "cardiac rehabilitation" },
  { re: /\b(bppv|vertigo|dizziness)\b/g, to: "vestibular bppv" },
  { re: /\b(tmj|tmd|jaw)\b/g, to: "temporomandibular" },
  { re: /\bwhiplash\b/g, to: "whiplash associated disorder" },
  { re: /\bmastectomy\b/g, to: "post mastectomy rehabilitation" },
  { re: /\b(fibromyalgia|widespread\s+pain)\b/g, to: "fibromyalgia" },
  { re: /\b(ankylosing|as\s+spondylitis)\b/g, to: "ankylosing spondylitis" },
  // Techniques and their abbreviations
  { re: /\bmet\b/g, to: "muscle energy technique" },
  { re: /\bmwm\b/g, to: "mulligan mobilization with movement" },
  { re: /\b(snags?|nags?|self\s+snags?)\b/g, to: "mulligan snags" },
  { re: /\bpnf\b/g, to: "pnf proprioceptive neuromuscular facilitation" },
  { re: /\biastm\b/g, to: "iastm instrument assisted soft tissue" },
  { re: /\bmld\b/g, to: "manual lymphatic drainage" },
  { re: /\b(hvla|thrust|cracking|crack)\b/g, to: "high velocity thrust manipulation" },
  { re: /\b(dtf|cross\s+friction|transverse\s+friction)\b/g, to: "deep transverse friction cyriax" },
  { re: /\b(paivm|ppivm|pa\s+glide)\b/g, to: "paivm ppivm spinal assessment" },
  { re: /\b(cupping|hijama)\b/g, to: "cupping myofascial decompression" },
  { re: /\b(art|active\s+release)\b/g, to: "active release soft tissue" },
  { re: /\b(tender\s+point|positional\s+release)\b/g, to: "strain counterstrain positional release" },
  { re: /\b(nerve\s+glide|nerve\s+flossing|neural\s+mobili[sz]ation|neurodynamics?)\b/g, to: "neurodynamic mobilization" },
  // Assessment and concepts taught by PNA Teacher
  { re: /\bslr\b/g, to: "straight leg raise neurodynamic hamstring" },
  { re: /\b(rom|range\s+of\s+motion)\b/g, to: "range motion" },
  { re: /\b(snnout|sppin|sensitivity|specificity|likelihood\s+ratio)\b/g, to: "sensitivity specificity" },
  { re: /\b(fitt|rpe|borg|reps\s+in\s+reserve|rir|dosage|sets\s+and\s+reps|exercise\s+dose|exercise\s+prescription)\b/g, to: "exercise dosage" },
  { re: /\b(gait|walking\s+pattern|limp|limping|trendelenburg|foot\s+drop)\b/g, to: "gait cycle" },
  { re: /\b(dermatomes?|myotomes?|reflexes|reflex|neuro\s+screen|neurological\s+exam\w*)\b/g, to: "dermatomes myotomes reflexes" },
  { re: /\b(red\s+flags?|cauda\s+equina|serious\s+pathology|when\s+not\s+to\s+treat)\b/g, to: "red flags screening" },
  { re: /\b(convex|concave|roll\s+and\s+glide|arthrokinematics?|joint\s+glide)\b/g, to: "convex concave rule" },
  { re: /\b(insufficiency|two\s+joint\s+muscles?|length\s+tension)\b/g, to: "active passive insufficiency" },
  { re: /\b(open\s+chain|closed\s+chain|okc|ckc|kinetic\s+chain)\b/g, to: "open closed kinetic chain" },
  { re: /\b(healing|tissue\s+healing|inflammation\s+phase|remodel\w*)\b/g, to: "tissue healing phases" },
  { re: /\b(pain\s+science|central\s+sensiti[sz]ation|nociception|hurt\s+vs\s+harm)\b/g, to: "pain science" },
  { re: /\b(umn|lmn|upper\s+motor|lower\s+motor|spasticity|rigidity)\b/g, to: "umn lmn" },
  { re: /\b(evidence|research|rct|systematic\s+review|meta\s+analysis)\b/g, to: "research evidence" },
];

/** First-person / caregiver phrasing → the person is describing real symptoms. */
export const FIRST_PERSON = /\b(i have|i've|i am|i'm|i feel|i can't|i cannot|i cant|my|mine|me|mujhe|mujhay|mujh|mera|meri|mere|hamare|hamari|ammi|abbu|walid|walida|mother|father|mom|dad|grandmother|grandfather|nani|dadi|nana|dada|wife|husband|beta|beti|son|daughter|patient has|he has|she has|unhe|unko|usay|use)\b/;

/** Academic phrasing → a learner asking about a topic, not a live symptom. */
export const ACADEMIC = /\b(what is|what are|what does|explain|define|definition|signs of|symptoms of|features of|causes of|difference|differentiate|vs|versus|lesson|teach|learn|notes|viva|exam|mcq|osce|kya hai|kya hota|kya hoti|kya hain|matlab|samjhao|samjha do|parhao|sikhao)\b/;

/* ---------------- Urdu script ---------------- */

/**
 * Many learners type, or dictate by voice, in Urdu script. Known words are mapped to the Roman Urdu / English
 * vocabulary the rest of the engine already understands; unknown words are dropped. Pure data and one function.
 */
const URDU_SCRIPT_WORDS: Record<string, string> = {
  // body parts
  "کمر": "kamar", "گردن": "gardan", "کندھا": "kandha", "کندھے": "kandhe", "کندھوں": "kandhe", "کہنی": "kohni", "کلائی": "kalai", "ہاتھ": "haath", "انگلی": "ungli", "انگلیاں": "ungliyan",
  "گھٹنا": "ghutna", "گھٹنے": "ghutne", "گھٹنوں": "ghutne", "ٹخنہ": "takhna", "ٹخنے": "takhne", "ایڑی": "aedi", "پاؤں": "paon", "پاوں": "paon", "پیر": "paon", "پیروں": "paon", "ٹانگ": "taang", "ٹانگوں": "taang",
  "کولہا": "kulha", "کولہے": "kulha", "جبڑا": "jabra", "جبڑے": "jabra", "سینہ": "seena", "سینے": "seena", "سر": "sar", "ریڑھ": "reerh", "ریڑھ کی": "reerh", "پٹھا": "pattha", "پٹھے": "pattha", "ہڈی": "haddi", "ہڈیاں": "haddi",
  "جوڑ": "jor", "جوڑوں": "jor", "نس": "nas", "نسیں": "nas", "پسلی": "pasli", "بازو": "bazu", "پنڈلی": "pindli", "پیٹھ": "peeth", "دل": "dil",
  // symptoms
  "درد": "dard", "دردیں": "dard", "سوجن": "sujan", "اکڑن": "akran", "اکڑاہٹ": "akran", "کمزوری": "kamzori", "سن": "sunn", "سنّ": "sunn", "جھنجھناہٹ": "jhunjhunahat", "چکر": "chakkar", "بخار": "bukhar",
  "چوٹ": "chot", "موچ": "moch", "فالج": "falij", "کپکپی": "kampan", "سانس": "saans", "پھولنا": "phoolna", "پھولتی": "phoolna", "پھولتا": "phoolna",
  // question and function words
  "کیا": "kya", "کیسے": "kaise", "کیوں": "kyun", "ہے": "hai", "ہیں": "hain", "ہوتا": "hota", "ہوتی": "hoti", "ہوتے": "hote", "کا": "ka", "کی": "ki", "کے": "ke", "میں": "mein", "سے": "se", "کو": "ko",
  "اور": "aur", "کب": "kab", "کہاں": "kahan", "مجھے": "mujhe", "میرا": "mera", "میری": "meri", "میرے": "mere", "ہمارے": "hamare", "بتائیں": "batao", "بتاؤ": "batao", "بتائیے": "batao", "بتاو": "batao",
  "سمجھاؤ": "samjhao", "سمجھائیں": "samjhao", "سمجھائیے": "samjhao", "سمجھاو": "samjhao", "سمجھا": "samjha", "علاج": "ilaj", "ورزش": "warzish", "ورزشیں": "warzish",
  "کرنا": "karna", "کریں": "karein", "کرو": "karo", "چاہیے": "chahiye", "چاہئے": "chahiye", "پر": "par", "بعد": "baad", "لیے": "liye", "لئے": "liye", "جب": "jab", "اگر": "agar", "نہیں": "nahi", "آسان": "asaan", "لفظوں": "lafzon", "الفاظ": "lafzon",
  "رات": "raat", "صبح": "subah", "نیند": "neend", "چلتے": "chalte", "چلنے": "chalne", "بچے": "bachay", "بچوں": "bachon", "بزرگ": "buzurg", "بزرگوں": "buzurgon",
  // site and clinical vocabulary written in Urdu script
  "فزیوتھراپی": "physiotherapy", "فزیو": "physio", "فزیوتھراپسٹ": "physiotherapist", "ڈاکٹر": "doctor", "مریض": "mareez", "اپائنٹمنٹ": "appointment", "ملاقات": "appointment", "بکنگ": "booking",
  "گھر": "ghar", "ہوم": "home", "ویزٹ": "visit", "ویب": "website", "سائٹ": "website", "ویب سائٹ": "website", "کتاب": "book", "کتابیں": "books", "کتابوں": "books", "ورکشاپ": "workshop", "ورکشاپس": "workshops",
  "ٹریننگ": "training", "سرٹیفکیٹ": "certificate", "امتحان": "imtihan", "ویوا": "viva", "کوئز": "quiz", "چیلنج": "challenge", "ڈیلی": "daily", "ورچوئل": "virtual", "پیشنٹ": "patient", "سکلز": "skills", "لیب": "lab",
  "مینوئل": "manual", "تھراپی": "therapy", "ٹیچر": "teacher", "لیسن": "lesson", "سبق": "lesson", "فلیش": "flash", "کارڈز": "cards", "ریہاب": "rehab", "ریہب": "rehab", "ایکسرسائز": "exercise", "ٹریٹمنٹ": "treatment",
  "پین": "pain", "بیک": "back", "نیک": "neck", "شولڈر": "shoulder", "نی": "knee", "اینکل": "ankle", "ہپ": "hip", "ایلبو": "elbow", "رسٹ": "wrist",
  "سٹروک": "stroke", "پارکنسن": "parkinson", "سرجری": "surgery", "آپریشن": "operation", "حمل": "hamal", "شوگر": "sugar", "ذیابیطس": "sugar", "موٹاپا": "motapa",
  "ٹینس": "tennis", "فروزن": "frozen", "سائیٹیکا": "sciatica", "سلپ": "slipped", "ڈسک": "disc", "آرتھرائٹس": "arthritis", "گٹھیا": "arthritis", "کنفرم": "confirm",
  "کنویکس": "convex", "کانویکس": "convex", "کنکیو": "concave", "کانکیو": "concave", "کونکیو": "concave", "رول": "rule", "گلائیڈ": "glide", "گریڈ": "grade", "گریڈز": "grades",
  "میٹلینڈ": "maitland", "مائٹلینڈ": "maitland", "ملیگن": "mulligan", "جوائنٹ": "joint", "موبلائزیشن": "mobilization", "ٹیسٹ": "test", "ٹیسٹس": "tests", "ریڈ": "red", "فلیگز": "flags",
  "گونیومیٹری": "goniometry", "گونیومیٹر": "goniometer", "ریفلیکس": "reflex", "پوسچر": "posture", "بیلنس": "balance", "ٹینڈینوپیتھی": "tendinopathy", "کیس": "case", "کیسز": "cases",
};

/** Urdu script → the Roman Urdu / English the engine understands. Text without Urdu script is returned unchanged. */
export function fromUrduScript(text: string): string {
  if (!/[؀-ۿ]/.test(text)) return text;
  const cleaned = text
    .replace(/[ً-ٰٟ۔؟،؛]/g, " ") // diacritics, Urdu full stop, question mark, commas
    .replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/ە/g, "ہ").replace(/ۀ/g, "ہ").replace(/ئ/g, "ئ");
  return cleaned
    .split(/(\s+)/)
    .map((part) => {
      if (!/[؀-ۿ]/.test(part)) return part;
      return URDU_SCRIPT_WORDS[part] ?? URDU_SCRIPT_WORDS[part.replace(/[ۂہ]$/, "ہ")] ?? "";
    })
    .join(" ");
}

export const hasUrduScript = (text: string) => /[؀-ۿ]/.test(text);
