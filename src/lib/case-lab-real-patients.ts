/**
 * Phase 1 — Real patient identities for Case Lab.
 * Pakistani + Indian names and life context so each case feels like a real clinic encounter.
 * Maps to core MSK ids, deep-dive slugs, and selected expanded/multi ids.
 */

export type RealPatient = {
  /** Matches case id or deep-dive slug (without deep- prefix) */
  caseKey: string;
  name: string;
  age: number;
  gender: "male" | "female";
  city: string;
  role: string;
  /** One-line life context shown on the card */
  lifeLine: string;
  /** Opening line in the patient's voice */
  voice: string;
  /** What makes this case clinically different from similar ones */
  clinicalAngle: string;
};

export const realPatients: RealPatient[] = [
  // ── Core MSK (authored scenarios) ───────────────────────────────────────
  {
    caseKey: "shoulder-01",
    name: "Imran Siddiqui",
    age: 52,
    gender: "male",
    city: "Karachi",
    role: "Accounts officer",
    lifeLine: "Karachi · accounts officer · cannot put on his kameez alone",
    voice: "Doctor, four months se mera right shoulder itna stiff hai ke peeche haath nahi jaata — dressing bhi mushkil ho gayi hai.",
    clinicalAngle: "Progressive active AND passive loss — adhesive capsulitis pattern, not just cuff pain",
  },
  {
    caseKey: "knee-01",
    name: "Hassan Raza",
    age: 24,
    gender: "male",
    city: "Lahore",
    role: "University footballer",
    lifeLine: "Lahore · university football · heard a pop while cutting",
    voice: "Cutting ke waqt ek pop suna, do ghanton mein knee phool gayi — ab pivot pe giving way feel hota hai.",
    clinicalAngle: "Pivot-pop-rapid effusion + soft Lachman — ACL priority, not simple sprain",
  },
  {
    caseKey: "hand-01",
    name: "Sana Malik",
    age: 46,
    gender: "female",
    city: "Islamabad",
    role: "Bank clerk",
    lifeLine: "Islamabad · bank clerk · night tingling, shakes her hand",
    voice: "Raat ko angushthe, index aur middle finger so jate hain — haath hilane se thoda asaan hota hai.",
    clinicalAngle: "Median distribution nocturnal paresthesia — carpal tunnel territory, not ulnar",
  },
  {
    caseKey: "back-01",
    name: "Tariq Mehmood",
    age: 35,
    gender: "male",
    city: "Faisalabad",
    role: "Warehouse supervisor",
    lifeLine: "Faisalabad · warehouse · buttock pain after lifting, centralizes with extension",
    voice: "Wazan uthate waqt lower back se buttock tak dard gaya — extension se dard wapas spine ki taraf aata hai.",
    clinicalAngle: "Centralization with repeated extension — directional preference, not red-flag neuro",
  },
  {
    caseKey: "ankle-01",
    name: "Bilal Ahmed",
    age: 21,
    gender: "male",
    city: "Karachi",
    role: "College basketball player",
    lifeLine: "Karachi · basketball · inversion landing, lateral swelling",
    voice: "Landing pe ankle andar roll ho gaya — lateral side pe swelling aur tenderness hai.",
    clinicalAngle: "Plantarflexion-inversion — ATFL most likely; still apply fracture rules",
  },
  {
    caseKey: "hip-01",
    name: "Ayesha Bibi",
    age: 49,
    gender: "female",
    city: "Hyderabad",
    role: "School teacher",
    lifeLine: "Hyderabad · teacher · cannot sleep on that side, stairs hurt",
    voice: "Is taraf leti hoon to lateral hip mein dard — stairs pe bhi abductor load se dard aata hai.",
    clinicalAngle: "Trochanteric tenderness + resisted abduction pain — GTPS, not pure OA",
  },
  {
    caseKey: "neck-01",
    name: "Ravi Kumar",
    age: 41,
    gender: "male",
    city: "Delhi",
    role: "Delivery supervisor",
    lifeLine: "Delhi · delivery work · neck pain into the arm with tingling",
    voice: "Gardan se right arm mein tingling jaati hai — kuch positions pe aur badh jaati hai.",
    clinicalAngle: "Dermatomal sensory + myotomal weakness — radiculopathy pattern",
  },
  {
    caseKey: "safety-01",
    name: "Ghulam Hussain",
    age: 57,
    gender: "male",
    city: "Multan",
    role: "Retired clerk",
    lifeLine: "Multan · retired · new bladder trouble + bilateral leg symptoms",
    voice: "Back dard ke saath ab urine control mushkil, aur dono legs mein numbness — aaj se shuru hua.",
    clinicalAngle: "Saddle change + new bladder dysfunction — escalate now, do not treat routinely",
  },
  {
    caseKey: "knee-oa-01",
    name: "Zainab Khatoon",
    age: 67,
    gender: "female",
    city: "Peshawar",
    role: "Homemaker",
    lifeLine: "Peshawar · homemaker · morning stiffness eases, stairs are hard",
    voice: "Subah thodi stiffness hoti hai jo chalne se kam ho jati hai — stairs pe knee dard karti hai.",
    clinicalAngle: "Activity-related pain, brief stiffness, bony change — OA pattern",
  },
  {
    caseKey: "elbow-01",
    name: "Farhan Qureshi",
    age: 38,
    gender: "male",
    city: "Gujranwala",
    role: "Carpenter",
    lifeLine: "Gujranwala · carpenter · grip and kettle lift hurt outside elbow",
    voice: "Tools pakarte aur kettle uthate waqt elbow ke bahar dard — lateral side pe.",
    clinicalAngle: "Resisted wrist extension pain at lateral epicondyle — lateral elbow tendinopathy",
  },
  {
    caseKey: "achilles-01",
    name: "Naveed Iqbal",
    age: 33,
    gender: "male",
    city: "Rawalpindi",
    role: "Recreational runner",
    lifeLine: "Rawalpindi · runner · sudden snap while sprinting",
    voice: "Sprint push-off pe peeche se snap suna — ab toes pe khara nahi ho sakta.",
    clinicalAngle: "Sudden snap + positive Thompson — Achilles rupture urgency",
  },
  {
    caseKey: "shoulder-02",
    name: "Kamran Ali",
    age: 44,
    gender: "male",
    city: "Karachi",
    role: "House painter",
    lifeLine: "Karachi · painter · overhead work, painful arc",
    voice: "Ceiling paint karte waqt arm sideways uthate hi dard — passive movement better hai.",
    clinicalAngle: "Painful arc + preserved passive ROM — rotator-cuff related pain",
  },
  {
    caseKey: "neck-03",
    name: "Priya Sharma",
    age: 39,
    gender: "female",
    city: "Mumbai",
    role: "Delivery driver",
    lifeLine: "Mumbai · delivery driver · neck to thumb, cough aggravates arm",
    voice: "Gardan se forearm aur thumb tak tingling — coughing se arm pain badhta hai.",
    clinicalAngle: "Cough-aggravated arm pain + reflex change — nerve-root priority",
  },
  {
    caseKey: "hip-02",
    name: "Nasreen Akhtar",
    age: 57,
    gender: "female",
    city: "Quetta",
    role: "Primary school teacher",
    lifeLine: "Quetta · teacher · side-sleeping and single-leg load hurt",
    voice: "Us side pe soti hoon to hip dard, single-leg stand pe bhi load se dard.",
    clinicalAngle: "Lateral hip + abductor loading — GTPS pattern again, different person",
  },
  {
    caseKey: "knee-03",
    name: "Ayesha Noor",
    age: 22,
    gender: "female",
    city: "Karachi",
    role: "Recreational runner",
    lifeLine: "Karachi · runner · stairs down and long sitting hurt the kneecap",
    voice: "Stairs utarte aur der tak baithne ke baad kneecap ke around dard — locking nahi.",
    clinicalAngle: "Loaded flexion pain without true locking — patellofemoral pattern",
  },
  {
    caseKey: "ankle-03",
    name: "Arjun Patel",
    age: 19,
    gender: "male",
    city: "Ahmedabad",
    role: "College basketball player",
    lifeLine: "Ahmedabad · basketball · inversion after jump, can take four steps",
    voice: "Jump se land karke ankle andar gaya — chal sakta hoon lekin lateral swelling hai.",
    clinicalAngle: "Inversion sprain likely — still screen bony tenderness (Ottawa logic)",
  },
  {
    caseKey: "wrist-03",
    name: "Fatima Zahra",
    age: 34,
    gender: "female",
    city: "Lahore",
    role: "Mother of a toddler",
    lifeLine: "Lahore · young mother · radial wrist pain lifting her child",
    voice: "Bachay ko uthate aur grip pe radial wrist dard — angushthe ki taraf.",
    clinicalAngle: "Radial styloid + thumb tendon load — de Quervain pattern",
  },
  {
    caseKey: "lumbar-03",
    name: "Abdul Sattar",
    age: 68,
    gender: "male",
    city: "Sukkur",
    role: "Retired teacher",
    lifeLine: "Sukkur · retired teacher · legs heavy after walking, eases when sitting",
    voice: "Thodi der walk ke baad dono legs heavy — shopping cart pakad ke walk asaan, baithne se relief.",
    clinicalAngle: "Flexion relief + walking tolerance — neurogenic claudication vs vascular",
  },
  {
    caseKey: "shoulder-03",
    name: "Haji Muhammad",
    age: 71,
    gender: "male",
    city: "Bahawalpur",
    role: "Retired shopkeeper",
    lifeLine: "Bahawalpur · fell yesterday · cannot actively lift the arm",
    voice: "Kal kandhe pe gira — ab khud arm nahi utha sakta, passive better hai.",
    clinicalAngle: "Acute trauma + major active weakness — cuff tear/fracture urgency",
  },
  {
    caseKey: "redflag-03",
    name: "Ashraf Khan",
    age: 63,
    gender: "male",
    city: "Karachi",
    role: "Shop owner with diabetes",
    lifeLine: "Karachi · diabetes · hot swollen knee + fever since last night",
    voice: "Kal raat se knee garam, phooli, bukhar 38.8 — trauma nahi, weight nahi le sakta.",
    clinicalAngle: "Hot joint + fever + diabetes — septic arthritis until proven otherwise",
  },

  // ── Deep-dive masterclasses (slug keys) ─────────────────────────────────
  {
    caseKey: "postpartum-running-stress-urinary-incontinence",
    name: "Mariam Saleem",
    age: 31,
    gender: "female",
    city: "Karachi",
    role: "New mother, wants to run again",
    lifeLine: "Karachi · 6 months postpartum · leaks on impact, wants to run",
    voice: "Pehle ki tarah run karna chahti hoon lekin jump aur jog pe urine leak hota hai.",
    clinicalAngle: "Impact leakage + return-to-run readiness — pelvic floor + load, not ‘just Kegels’",
  },
  {
    caseKey: "older-adult-recurrent-falls-orthostatic-symptoms",
    name: "Begum Razia",
    age: 72,
    gender: "female",
    city: "Hyderabad",
    role: "Grandmother living with family",
    lifeLine: "Hyderabad · recurrent falls · dizziness on standing",
    voice: "Baar baar gir rahi hoon — khade hote hi sir ghoomta hai, sirf balance exercise kaafi nahi.",
    clinicalAngle: "Falls + orthostatic symptoms — cardiovascular and multidomain, not balance alone",
  },
  {
    caseKey: "overhead-athlete-shoulder-load-capacity",
    name: "Usman Farooq",
    age: 28,
    gender: "male",
    city: "Karachi",
    role: "Club volleyball attacker",
    lifeLine: "Karachi · volleyball · can lift, but not another full training shift",
    voice: "Lift to kar leta hoon — lekin doosri training shift shoulder nahi sehti.",
    clinicalAngle: "Load capacity and return-to-training, not only pain location",
  },
  {
    caseKey: "runner-anterior-knee-pain-load-capacity",
    name: "Hina Fatima",
    age: 26,
    gender: "female",
    city: "Islamabad",
    role: "Amateur half-marathon runner",
    lifeLine: "Islamabad · runner · fine at rest, stairs tell a different story",
    voice: "Rest pe theek, lekin stairs utarte aur long run ke baad anterior knee dard.",
    clinicalAngle: "Load and capacity for anterior knee pain — strength and graded return",
  },
  {
    caseKey: "copd-rehab-exertional-desaturation-clinical-reasoning",
    name: "Bashir Ahmed",
    age: 64,
    gender: "male",
    city: "Lahore",
    role: "Retired bus driver",
    lifeLine: "Lahore · COPD rehab · walk starts fine, then one vital changes",
    voice: "Walk shuru normal, phir saans aur readings change — expected dyspnea ya warning?",
    clinicalAngle: "Exertional response change — rethink safety mid-session",
  },
  {
    caseKey: "low-back-pain-new-bladder-saddle-symptoms",
    name: "Saeed Anwar",
    age: 54,
    gender: "male",
    city: "Rawalpindi",
    role: "Shopkeeper",
    lifeLine: "Rawalpindi · routine back pain visit becomes urgent",
    voice: "Aaj back ke saath naya bladder issue aur saddle numbness — treatment nahi, escalation.",
    clinicalAngle: "New bladder + saddle symptoms — red-flag pathway, not routine physio",
  },
  {
    caseKey: "stroke-gait-balance-task-specific-rehab",
    name: "Shabana Begum",
    age: 58,
    gender: "female",
    city: "Karachi",
    role: "Homemaker, post-stroke",
    lifeLine: "Karachi · post-stroke · walking again — what does progress mean?",
    voice: "Phir se chal rahi hoon — lekin asal progress kya hai, sirf steps count nahi.",
    clinicalAngle: "Task-specific dosage and functional goals after stroke",
  },
  {
    caseKey: "copd-post-exacerbation-pulmonary-rehab",
    name: "Rafiq Shah",
    age: 61,
    gender: "male",
    city: "Peshawar",
    role: "Retired tailor",
    lifeLine: "Peshawar · after hospital discharge · every short walk feels steep",
    voice: "Discharge ke baad chhoti si walk bhi pahaad lagti hai — rehab plan kaise banaye.",
    clinicalAngle: "Post-exacerbation pulmonary rehab planning and tolerance",
  },
  {
    caseKey: "acl-reconstruction-return-to-sport-readiness",
    name: "Omar Sheikh",
    age: 23,
    gender: "male",
    city: "Lahore",
    role: "Football midfielder",
    lifeLine: "Lahore · ACL reconstruction · hop test passed — ready for pivoting?",
    voice: "Hop test pass ho gaya — kya ab pivoting sport safe hai? Strength aur confidence dono check.",
    clinicalAngle: "Criterion-based RTS — strength, hop, psychology, exposure",
  },
];

const byKey = new Map(realPatients.map((p) => [p.caseKey, p]));

/** Resolve identity from case id or deep-dive slug. */
export function getRealPatient(caseIdOrSlug: string): RealPatient | undefined {
  if (byKey.has(caseIdOrSlug)) return byKey.get(caseIdOrSlug);
  // deep-slug cards use id "deep-" + slug
  if (caseIdOrSlug.startsWith("deep-")) {
    return byKey.get(caseIdOrSlug.slice(5));
  }
  // episode query ids are raw
  return byKey.get(caseIdOrSlug);
}

export function formatPatientLabel(p: RealPatient): string {
  return `${p.name}, ${p.age} · ${p.role}`;
}
