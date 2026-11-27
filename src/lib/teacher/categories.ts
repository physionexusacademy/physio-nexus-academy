import type { TeacherArea } from "./types.ts";

/**
 * The PNA Teacher shelves. Every concept lesson belongs to exactly one category through its `area`, so a student finds a topic by
 * the kind of work they are doing (examining, treating, thinking, exam preparation) instead of scrolling one long list.
 * A category with no lessons yet is not shown.
 */
export type TeacherCategoryId =
  | "foundations"
  | "reasoning"
  | "exam"
  | "neuro"
  | "cardio"
  | "paeds"
  | "womens"
  | "geriatrics"
  | "sports"
  | "postop"
  | "electro"
  | "imaging"
  | "career"
  | "safety"
  | "culture";

export type TeacherCategory = {
  id: TeacherCategoryId;
  title: string;
  tagline: string;
  /** Roman Urdu line, shown when the site language is Roman Urdu. */
  taglineUr: string;
  /** Icon name from lucide-react (resolved in the catalogue). */
  icon: "atom" | "brain" | "stethoscope" | "activity" | "wind" | "baby" | "flower" | "person" | "dumbbell" | "bandage" | "zap" | "cap" | "flask";
  /** Two colours of the card glow (CSS colours). */
  glow: [string, string];
  areas: TeacherArea[];
};

export const teacherCategories: TeacherCategory[] = [
  {
    id: "foundations",
    title: "Foundations & Exercise",
    tagline: "Movement science, tissue healing and how to dose exercise.",
    taglineUr: "Movement science, tissue healing aur exercise ki dosage.",
    icon: "atom",
    glow: ["#2ee6d6", "#3b82f6"],
    areas: ["Movement Science", "Tissue Healing", "Exercise Prescription"],
  },
  {
    id: "reasoning",
    title: "Reasoning, Pain & Evidence",
    tagline: "Think like an expert, understand pain and read research.",
    taglineUr: "Maahir ki tarah sochein, dard samjhein aur research parhein.",
    icon: "brain",
    glow: ["#8f7cff", "#ec4899"],
    areas: ["Clinical Reasoning", "Pain Science", "Research & Evidence"],
  },
  {
    id: "exam",
    title: "Examination Skills",
    tagline: "Measure, palpate, test and monitor: the hands-on exam skills.",
    taglineUr: "Naapna, palpate karna, test karna aur monitor karna: hands-on exam skills.",
    icon: "stethoscope",
    glow: ["#38bdf8", "#2ee6d6"],
    areas: ["Skills · Measurement", "Skills · Neuro Exam", "Skills · Posture & Palpation", "Skills · Vitals & Monitoring", "Skills · Balance & Function"],
  },
  {
    id: "neuro",
    title: "Neurology & Neuro-rehab",
    tagline: "Stroke, spinal cord, Parkinson's and motor learning.",
    taglineUr: "Stroke, spinal cord, Parkinson aur motor learning.",
    icon: "activity",
    glow: ["#d946ef", "#8f7cff"],
    areas: ["Neurology"],
  },
  {
    id: "cardio",
    title: "Heart & Lung",
    tagline: "Breathing, airway clearance and cardiac and pulmonary rehab.",
    taglineUr: "Saans, airway clearance aur dil aur phephron ki rehab.",
    icon: "wind",
    glow: ["#22d3ee", "#3b82f6"],
    areas: ["Cardiorespiratory"],
  },
  {
    id: "paeds",
    title: "Children",
    tagline: "Development, reflexes and cerebral palsy.",
    taglineUr: "Nashonuma, reflexes aur cerebral palsy.",
    icon: "baby",
    glow: ["#f472b6", "#fb923c"],
    areas: ["Paediatrics"],
  },
  {
    id: "womens",
    title: "Women's & Pelvic Health",
    tagline: "Pregnancy, the pelvic floor in women and men, and life after childbirth.",
    taglineUr: "Hamal, aurat aur mard ka pelvic floor, aur bachay ki paidaish ke baad ki zindagi.",
    icon: "flower",
    glow: ["#f472b6", "#a78bfa"],
    areas: ["Women's Health", "Pelvic Health"],
  },
  {
    id: "geriatrics",
    title: "Older Adults",
    tagline: "Falls, frailty, bone health and staying independent.",
    taglineUr: "Girna, kamzori, haddiyon ki sehat aur khud mukhtar rehna.",
    icon: "person",
    glow: ["#fbbf24", "#34d399"],
    areas: ["Geriatrics"],
  },
  {
    id: "sports",
    title: "Sports & Return to Play",
    tagline: "Load, injury risk and safe return to sport.",
    taglineUr: "Load, chot ka khatra aur khel mein mehfooz wapsi.",
    icon: "dumbbell",
    glow: ["#34d399", "#2ee6d6"],
    areas: ["Sports & Return to Play"],
  },
  {
    id: "postop",
    title: "After Surgery",
    tagline: "Rehab after joint replacement, repairs and fractures.",
    taglineUr: "Joint replacement, repair aur fracture ke baad rehab.",
    icon: "bandage",
    glow: ["#fb7185", "#fb923c"],
    areas: ["Post-operative Rehab"],
  },
  {
    id: "electro",
    title: "Electrotherapy & Modalities",
    tagline: "TENS, ultrasound, heat and cold: when they help and when they do not.",
    taglineUr: "TENS, ultrasound, garmi aur sardi: kab madad karte hain aur kab nahi.",
    icon: "zap",
    glow: ["#fbbf24", "#fb923c"],
    areas: ["Electrotherapy", "Treatments & Evidence"],
  },
  {
    id: "imaging",
    title: "Scans, ECG & Lab Reports",
    tagline: "Read X-rays, CT, MRI, ECG strips and blood tests, and know what to do with them.",
    taglineUr: "X-ray, CT, MRI, ECG strips aur blood tests parhein, aur jaanein un ka kya karna hai.",
    icon: "flask",
    glow: ["#60a5fa", "#2ee6d6"],
    areas: ["Imaging & Reports"],
  },
  {
    id: "career",
    title: "Exams & Career",
    tagline: "Licensing exam skills, viva practice and your first job.",
    taglineUr: "Licensing exam ki maharat, viva practice aur pehli naukri.",
    icon: "cap",
    glow: ["#60a5fa", "#8f7cff"],
    areas: ["Exam & Career"],
  },
  {
    id: "safety",
    title: "Medicines, Safety & Emergencies",
    tagline: "What medicines do to rehab, and what to do when a patient is suddenly unwell.",
    taglineUr: "Dawaiyan rehab par kya asar daalti hain, aur mareez achanak bigre to kya karein.",
    icon: "activity",
    glow: ["#f87171", "#fbbf24"],
    areas: ["Medicines & Safety", "Emergency Care"],
  },
  {
    id: "culture",
    title: "Pakistan & Culture",
    tagline: "Care that fits daily life here: prayer, fasting, family and heat.",
    taglineUr: "Aisi care jo yahan ki rozmarra zindagi se milti hai: namaaz, roza, khandaan aur garmi.",
    icon: "person",
    glow: ["#2ee6d6", "#a3e635"],
    areas: ["Culture & Context"],
  },
];

const byArea = new Map<string, TeacherCategory>();
for (const category of teacherCategories) for (const area of category.areas) byArea.set(area, category);

export function categoryForArea(area: string): TeacherCategory | undefined {
  return byArea.get(area);
}
