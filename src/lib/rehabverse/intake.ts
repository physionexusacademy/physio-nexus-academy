/**
 * Patient-facing definitions for the symptom intake and the daily feedback: plain language,
 * English and Roman Urdu (natural spoken Urdu–English mix). Ids match the database
 * (rehab_assessments, rehab_safety_flags). These are screening questions, never a diagnosis.
 */
import type { Bi } from "./types";

export type Option = { id: string; label: Bi; hint?: Bi };

export const INTAKE_REGIONS: Option[] = [
  { id: "cervical", label: { en: "Neck", ru: "Gardan (neck)" } },
  { id: "thoracic", label: { en: "Upper / mid back", ru: "Peeth ka upar wala hissa" } },
  { id: "lumbar", label: { en: "Lower back", ru: "Kamar (lower back)" } },
  { id: "shoulder", label: { en: "Shoulder", ru: "Kandha (shoulder)" } },
  { id: "elbow", label: { en: "Elbow", ru: "Kohni (elbow)" } },
  { id: "wrist_hand", label: { en: "Wrist or hand", ru: "Kalai ya haath" } },
  { id: "hip", label: { en: "Hip", ru: "Kulha (hip)" } },
  { id: "knee", label: { en: "Knee", ru: "Ghutna (knee)" } },
  { id: "ankle_foot", label: { en: "Ankle or foot", ru: "Takhna ya paon" } },
  { id: "multiple", label: { en: "More than one area", ru: "Ek se zyada jagah" } },
];

export const INTAKE_SYMPTOMS: Option[] = [
  { id: "pain", label: { en: "Pain", ru: "Dard" } },
  { id: "stiffness", label: { en: "Stiffness", ru: "Akraahat (stiffness)" } },
  { id: "weakness", label: { en: "Weakness", ru: "Kamzori" } },
  { id: "restricted_movement", label: { en: "Hard to move it fully", ru: "Poori harkat nahi ho pati" } },
  { id: "tightness", label: { en: "Tightness", ru: "Khinchao (tightness)" } },
  { id: "walking_difficulty", label: { en: "Difficulty walking", ru: "Chalne mein mushkil" } },
  { id: "balance", label: { en: "Balance problems", ru: "Balance ka masla" } },
  { id: "reduced_endurance", label: { en: "Tire quickly", ru: "Jaldi thak jana" } },
  { id: "functional_limitation", label: { en: "Hard to do daily tasks", ru: "Rozmarra ke kaam mein mushkil" } },
  { id: "other", label: { en: "Something else", ru: "Kuch aur" } },
];

export const INTAKE_DURATION: Option[] = [
  { id: "lt_1w", label: { en: "Less than a week", ru: "Ek hafte se kam" } },
  { id: "1_4w", label: { en: "1–4 weeks", ru: "1 se 4 hafte" } },
  { id: "1_3m", label: { en: "1–3 months", ru: "1 se 3 maheene" } },
  { id: "3_6m", label: { en: "3–6 months", ru: "3 se 6 maheene" } },
  { id: "gt_6m", label: { en: "More than 6 months", ru: "6 maheene se zyada" } },
];

/** Red-flag screening. Any "yes" routes the person to a clinical assessment — no automatic programme. */
export const INTAKE_RED_FLAGS: (Option & { level: "emergency" | "urgent" })[] = [
  { id: "rf_bladder", level: "emergency",
    label: { en: "Numbness around the groin/private area, or trouble controlling urine or stool, or new trouble passing urine", ru: "Groin ya private hissay mein sunn-pan, ya peshab/pakhana rokne mein mushkil, ya peshab shuru karne mein nayi mushkil" } },
  { id: "rf_chest", level: "emergency",
    label: { en: "Chest pain, chest pressure or unusual breathlessness", ru: "Seene mein dard, dabao ya saans phoolna (jo aam nahi)" } },
  { id: "rf_vascular", level: "emergency",
    label: { en: "A sudden, severe, tearing or pulsing pain in the back, belly or a limb, or a cold, pale or blue limb", ru: "Achanak shadeed, phaarne wala ya dhadakta hua dard (kamar, pait ya haath/paon mein), ya haath/paon thanda, peela ya neela" } },
  { id: "rf_dvt", level: "emergency",
    label: { en: "A hot, swollen, painful calf or leg (especially after surgery, travel or long rest)", ru: "Pindli ya taang garam, sooji hui aur dardnaak (khaas tor par surgery, safar ya lambay aaram ke baad)" } },
  { id: "rf_neck_cad", level: "emergency",
    label: { en: "Sudden severe neck pain or headache with dizziness, double vision, slurred speech, facial droop or weakness", ru: "Achanak shadeed gardan dard ya sar dard ke saath chakkar, double nazar aana, zubaan larkhrana, chehra latakna ya kamzori" } },
  { id: "rf_progressive_neuro", level: "urgent",
    label: { en: "Arm or leg weakness, numbness or tingling that is getting worse, or the leg giving way", ru: "Haath ya taang mein kamzori, sunn-pan ya jhunjhuni jo barh rahi ho, ya taang ka achanak jawab de dena" } },
  { id: "rf_major_trauma", level: "urgent",
    label: { en: "A recent fall, accident or injury (for example a heavy fall, road accident or sports injury) that this problem started after", ru: "Haal hi mein girna, hadsa ya chot (jaise bhaari girna, road accident ya sports injury) jis ke baad ye masla shuru hua" } },
  { id: "rf_hot_joint", level: "urgent",
    label: { en: "A joint that is hot, red and swollen, or fever or feeling generally unwell with the pain", ru: "Koi jor garam, surkh aur sooja hua, ya dard ke saath bukhar ya tabiyat kharab" } },
  { id: "rf_cancer", level: "urgent",
    label: { en: "A history of cancer, or unexplained weight loss, or pain that is worst at night and does not settle with rest", ru: "Cancer ki history, ya bina wajah wazan kam hona, ya raat ko sab se zyada dard jo aaram se kam na ho" } },
  { id: "rf_recent_surgery_fracture", level: "urgent",
    label: { en: "A recent fracture or surgery, or a surgeon has told you to limit movement or weight", ru: "Haal hi mein fracture ya operation, ya surgeon ne harkat ya wazan par pabandi lagayi ho" } },
  { id: "rf_cardiac_exercise_unsafe", level: "urgent",
    label: { en: "A heart problem, very high blood pressure or other condition for which a doctor has limited exercise", ru: "Dil ka masla, bohat high blood pressure ya aisi bimari jis mein doctor ne exercise se roka ho" } },
  { id: "rf_falls_blackouts", level: "urgent",
    label: { en: "Fainting, blackouts or repeated falls", ru: "Behoshi, aankhon ke aage andhera ya baar baar girna" } },
];

/** Safety questions asked after each exercise day and at each recovery check-in. */
export const FEEDBACK_FLAGS: (Option & { level: "emergency" | "urgent" })[] = [
  { id: "fb_chest", level: "emergency", label: { en: "Chest pain or pressure, or hard to breathe", ru: "Seene mein dard/dabao ya saans lene mein mushkil" } },
  { id: "fb_dizzy", level: "emergency", label: { en: "Dizziness, fainting or feeling like I might black out", ru: "Chakkar, behoshi ya aisa lagna ke andhera chha jayega" } },
  { id: "fb_neuro", level: "emergency", label: { en: "New numbness, pins and needles or weakness in an arm or leg; or trouble controlling urine/stool", ru: "Haath ya taang mein naya sunn-pan, jhunjhuni ya kamzori; ya peshab/pakhana rokne mein mushkil" } },
  { id: "fb_calf", level: "emergency", label: { en: "A hot, swollen or very painful calf", ru: "Pindli garam, sooji hui ya bohat dardnaak" } },
  { id: "fb_severe_pain", level: "urgent", label: { en: "Sharp or severe pain that did not settle when I stopped", ru: "Tez ya shadeed dard jo ruk jaane ke baad bhi kam nahi hua" } },
  { id: "fb_injury", level: "urgent", label: { en: "I think I hurt myself (a pop, tear, twist or fall)", ru: "Mujhe lagta hai mujhe chot lag gayi (pop, phatna, mur jana ya girna)" } },
  { id: "fb_joint", level: "urgent", label: { en: "A joint has become more swollen, hot or locked", ru: "Koi jor zyada soojh gaya, garam hua ya phans gaya" } },
];

export const PAIN_WORDS: Bi[] = [
  { en: "No pain", ru: "Dard nahi" },
  { en: "Barely noticeable", ru: "Mushkil se mehsoos" },
  { en: "Mild", ru: "Halka" },
  { en: "Mild", ru: "Halka" },
  { en: "Moderate", ru: "Darmiyana" },
  { en: "Moderate", ru: "Darmiyana" },
  { en: "Strong", ru: "Tez" },
  { en: "Strong", ru: "Tez" },
  { en: "Very strong", ru: "Bohat tez" },
  { en: "Severe", ru: "Shadeed" },
  { en: "Worst possible", ru: "Sab se zyada" },
];

export const DIFFICULTY_WORDS: Bi[] = [
  { en: "Very easy", ru: "Bohat aasaan" },
  { en: "Very easy", ru: "Bohat aasaan" },
  { en: "Easy", ru: "Aasaan" },
  { en: "Easy", ru: "Aasaan" },
  { en: "Manageable", ru: "Theek-thaak" },
  { en: "Manageable", ru: "Theek-thaak" },
  { en: "Hard", ru: "Mushkil" },
  { en: "Hard", ru: "Mushkil" },
  { en: "Very hard", ru: "Bohat mushkil" },
  { en: "Very hard", ru: "Bohat mushkil" },
  { en: "Could not do it", ru: "Kar nahi saka/saki" },
];

export const TIMEPOINT_LABEL: Record<string, Bi> = {
  before: { en: "Before", ru: "Pehle" },
  during: { en: "During", ru: "Dauran" },
  immediately_after: { en: "Right after", ru: "Foran baad" },
  later_same_day: { en: "Later that day", ru: "Usi din baad mein" },
  "24h": { en: "Next day (~24 h)", ru: "Agle din (~24 ghante)" },
  "48h": { en: "After ~48 h", ru: "~48 ghante baad" },
};

export const flagLabel = (id: string): Bi | undefined =>
  [...INTAKE_RED_FLAGS, ...FEEDBACK_FLAGS].find((f) => f.id === id)?.label;
