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
]);

/** Words that mark a message as Roman Urdu. */
export const URDU_MARKERS = new Set([
  "hai", "hain", "kya", "kia", "kaise", "kese", "kyun", "mujhe", "mera", "meri", "mere", "dard", "nahi", "nahin", "karna",
  "karein", "chahiye", "ilaj", "ilaaj", "batao", "samjhao", "mein", "ka", "ki", "ke", "ko", "aur", "raha", "rahi", "hota",
  "hoti", "kamar", "ghutna", "ghutne", "gardan", "kandha", "kandhe", "sunn", "akran", "chakkar", "tha", "thi", "wala",
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
