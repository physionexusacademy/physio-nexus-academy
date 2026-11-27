import type { TeacherLessonCard, TeacherPath } from "./types.ts";

/**
 * The PNA Teacher classroom. A student first picks a SUBJECT (like a class on a timetable), then a UNIT inside it, then a TOPIC (one lesson).
 * Every lesson belongs to exactly one subject and one unit: through its `area`, or, for the large Research subject, through the slug lists below.
 * Lessons are never shown as one mixed list.
 */
export type SubjectId =
  | "foundations"
  | "reasoning"
  | "assessment"
  | "manual"
  | "neuro"
  | "cardio"
  | "modalities"
  | "special"
  | "sports"
  | "imaging"
  | "research"
  | "safety"
  | "career";

export type SubjectIcon = "atom" | "brain" | "stethoscope" | "hand" | "activity" | "wind" | "zap" | "baby" | "dumbbell" | "flask" | "microscope" | "siren" | "cap";

export type SubjectUnit = {
  id: string;
  title: string;
  titleUr: string;
  /** Lessons whose area is one of these belong to the unit. */
  areas?: string[];
  /** Or: lessons with these slugs, in this teaching order. */
  slugs?: string[];
};

export type Subject = {
  id: SubjectId;
  title: string;
  titleUr: string;
  tagline: string;
  taglineUr: string;
  icon: SubjectIcon;
  /** Two colours of the subject's glow. */
  glow: [string, string];
  units: SubjectUnit[];
};

const RESEARCH_THINKING = [
  "why-evidence-based-practice", "why-treatments-seem-to-work", "clinical-question-to-pico", "finding-evidence-fast-pubmed-pedro-cochrane",
  "reading-a-paper-efficiently-spotting-spin", "hierarchy-of-evidence-and-where-it-misleads", "critical-appraisal-in-ten-minutes", "reading-a-randomised-trial",
  "clinical-practice-guidelines-agree-ii", "what-the-evidence-says-myth-busting", "judging-physio-claims-on-social-media",
];
const RESEARCH_DESIGNS = [
  "which-design-answers-which-question", "randomised-trials-for-therapists", "cohort-case-control-cross-sectional", "case-reports-and-case-series-care",
  "single-case-and-n-of-1-trials-in-your-clinic", "qualitative-research-for-therapists", "mixed-methods-research", "surveys-and-questionnaires-done-right",
  "delphi-and-consensus-methods", "diagnostic-accuracy-studies-stard", "prognostic-studies-and-prediction-models", "measurement-properties-reliability-validity-mdc",
  "clinical-audit-and-quality-improvement", "registries-and-routine-outcome-data", "implementation-science-evidence-into-practice",
];
const RESEARCH_NUMBERS = [
  "effect-sizes-confidence-intervals-p-values", "absolute-relative-risk-nnt-nnh", "sample-size-and-power-intuition", "choosing-a-statistical-test",
  "regression-confounders-adjustment", "missing-data-dropouts-and-bias", "subgroups-multiple-testing-p-hacking", "bayesian-thinking-for-clinicians",
  "meta-analysis-forest-plots-heterogeneity", "systematic-and-scoping-reviews-prisma-grade", "interpreting-patient-reported-outcomes",
  "outcome-measures-minimal-important-change", "honest-graphs-for-therapists", "health-economics-for-therapists",
];
const RESEARCH_DOING = [
  "choosing-a-research-question-finer", "writing-a-research-proposal", "research-ethics-for-therapists", "trial-registration-preregistration-open-science",
  "research-data-management-spreadsheets", "reporting-guidelines-map-equator", "describing-interventions-tidier", "writing-imrad-abstract-to-discussion",
  "choosing-a-journal-predatory-peer-review", "posters-and-conference-talks", "thesis-and-supervisor-management", "research-integrity-authorship-misconduct",
  "research-in-low-resource-settings-cbpr", "ai-in-research-verify-every-claim", "becoming-a-clinician-researcher-12-month-plan",
];

export const subjects: Subject[] = [
  {
    id: "foundations", title: "Movement & Exercise Science", titleUr: "Harkat aur Exercise ki Science",
    tagline: "How the body moves, how tissues heal and how to dose exercise.", taglineUr: "Jism kaise harkat karta hai, tissues kaise theek hote hain aur exercise ki dosage.",
    icon: "atom", glow: ["#2ee6d6", "#3b82f6"],
    units: [
      { id: "movement", title: "Movement science", titleUr: "Harkat ki science", areas: ["Movement Science"] },
      { id: "healing", title: "Tissue healing", titleUr: "Tissue ka theek hona", areas: ["Tissue Healing"] },
      { id: "exercise", title: "Exercise prescription", titleUr: "Exercise ka nuskha", areas: ["Exercise Prescription"] },
    ],
  },
  {
    id: "reasoning", title: "Clinical Reasoning & Pain", titleUr: "Clinical Reasoning aur Dard",
    tagline: "Think like an expert clinician and understand pain.", taglineUr: "Maahir clinician ki tarah sochein aur dard ko samjhein.",
    icon: "brain", glow: ["#8f7cff", "#ec4899"],
    units: [
      { id: "reasoning", title: "Clinical reasoning", titleUr: "Clinical reasoning", areas: ["Clinical Reasoning"] },
      { id: "pain", title: "Pain science", titleUr: "Dard ki science", areas: ["Pain Science"] },
    ],
  },
  {
    id: "assessment", title: "Assessment Skills", titleUr: "Assessment ki Maharat",
    tagline: "Measure, palpate, test and monitor: the hands-on exam.", taglineUr: "Naapna, palpate karna, test karna aur monitor karna: hands-on exam.",
    icon: "stethoscope", glow: ["#38bdf8", "#2ee6d6"],
    units: [
      { id: "measurement", title: "Measurement", titleUr: "Naap tol", areas: ["Skills · Measurement"] },
      { id: "posture", title: "Posture & palpation", titleUr: "Posture aur palpation", areas: ["Skills · Posture & Palpation"] },
      { id: "neuro-exam", title: "Neuro exam", titleUr: "Neuro exam", areas: ["Skills · Neuro Exam"] },
      { id: "vitals", title: "Vitals & monitoring", titleUr: "Vitals aur monitoring", areas: ["Skills · Vitals & Monitoring"] },
      { id: "balance", title: "Balance & function", titleUr: "Balance aur function", areas: ["Skills · Balance & Function"] },
    ],
  },
  {
    id: "manual", title: "Manual Therapy", titleUr: "Manual Therapy",
    tagline: "Joint and soft-tissue techniques, with honest evidence.", taglineUr: "Joint aur soft-tissue techniques, imaandar evidence ke saath.",
    icon: "hand", glow: ["#34d399", "#2ee6d6"],
    units: [
      { id: "principles", title: "Principles", titleUr: "Usool", areas: ["Manual Therapy"] },
      { id: "joint", title: "Joint mobilisation & manipulation", titleUr: "Joint mobilisation aur manipulation", areas: ["Manual Therapy · Joint"] },
      { id: "soft-tissue", title: "Soft-tissue techniques", titleUr: "Soft-tissue techniques", areas: ["Manual Therapy · Soft Tissue"] },
      { id: "world", title: "World approaches", titleUr: "Duniya ke approaches", areas: ["Manual Therapy · World Approaches"] },
    ],
  },
  {
    id: "neuro", title: "Neurology & Neuro-rehab", titleUr: "Neurology aur Neuro-rehab",
    tagline: "Stroke, spinal cord, Parkinson's and motor learning.", taglineUr: "Stroke, spinal cord, Parkinson aur motor learning.",
    icon: "activity", glow: ["#d946ef", "#8f7cff"],
    units: [{ id: "neurology", title: "Neurology", titleUr: "Neurology", areas: ["Neurology"] }],
  },
  {
    id: "cardio", title: "Heart & Lung", titleUr: "Dil aur Phephre",
    tagline: "Breathing, airway clearance and cardiac and pulmonary rehab.", taglineUr: "Saans, airway clearance aur dil aur phephron ki rehab.",
    icon: "wind", glow: ["#22d3ee", "#3b82f6"],
    units: [{ id: "cardiorespiratory", title: "Cardiorespiratory", titleUr: "Cardiorespiratory", areas: ["Cardiorespiratory"] }],
  },
  {
    id: "modalities", title: "Electrotherapy & Treatments", titleUr: "Electrotherapy aur Ilaaj",
    tagline: "Machines and popular treatments: what helps and what does not.", taglineUr: "Machines aur mashhoor ilaaj: kya madad karta hai aur kya nahi.",
    icon: "zap", glow: ["#fbbf24", "#fb923c"],
    units: [
      { id: "electro", title: "Electrotherapy", titleUr: "Electrotherapy", areas: ["Electrotherapy"] },
      { id: "treatments", title: "Popular treatments: the evidence", titleUr: "Mashhoor ilaaj: evidence", areas: ["Treatments & Evidence"] },
    ],
  },
  {
    id: "special", title: "Women, Children & Older Adults", titleUr: "Khawateen, Bachay aur Buzurg",
    tagline: "Pregnancy and the pelvic floor, children's development, and healthy ageing.", taglineUr: "Hamal aur pelvic floor, bachon ki nashonuma, aur sehatmand budhapa.",
    icon: "baby", glow: ["#f472b6", "#a78bfa"],
    units: [
      { id: "womens", title: "Women's health", titleUr: "Khawateen ki sehat", areas: ["Women's Health"] },
      { id: "pelvic", title: "Pelvic health", titleUr: "Pelvic health", areas: ["Pelvic Health"] },
      { id: "paeds", title: "Children", titleUr: "Bachay", areas: ["Paediatrics"] },
      { id: "older", title: "Older adults", titleUr: "Buzurg", areas: ["Geriatrics"] },
    ],
  },
  {
    id: "sports", title: "Sports & Surgery Rehab", titleUr: "Sports aur Surgery ke baad Rehab",
    tagline: "Return to play, and rehab after operations.", taglineUr: "Khel mein wapsi, aur operation ke baad rehab.",
    icon: "dumbbell", glow: ["#34d399", "#22d3ee"],
    units: [
      { id: "sports", title: "Sports & return to play", titleUr: "Sports aur khel mein wapsi", areas: ["Sports & Return to Play"] },
      { id: "postop", title: "After surgery", titleUr: "Surgery ke baad", areas: ["Post-operative Rehab"] },
    ],
  },
  {
    id: "imaging", title: "Scans, ECG & Lab Reports", titleUr: "Scans, ECG aur Lab Reports",
    tagline: "Read X-rays, MRI, ECG strips and blood tests, and know what to do.", taglineUr: "X-ray, MRI, ECG aur blood tests parhein, aur jaanein kya karna hai.",
    icon: "flask", glow: ["#60a5fa", "#2ee6d6"],
    units: [{ id: "imaging", title: "Imaging & reports", titleUr: "Imaging aur reports", areas: ["Imaging & Reports"] }],
  },
  {
    id: "research", title: "Research & Evidence", titleUr: "Research aur Evidence",
    tagline: "From a clinical question to your first published paper.", taglineUr: "Clinical sawal se apne pehle published paper tak.",
    icon: "microscope", glow: ["#a78bfa", "#38bdf8"],
    units: [
      { id: "thinking", title: "Thinking with evidence", titleUr: "Evidence se sochna", slugs: RESEARCH_THINKING },
      { id: "designs", title: "Study designs", titleUr: "Study designs", slugs: RESEARCH_DESIGNS },
      { id: "numbers", title: "Numbers made clear", titleUr: "Numbers ko samajhna", slugs: RESEARCH_NUMBERS },
      { id: "doing", title: "Doing and publishing research", titleUr: "Research karna aur publish karna", slugs: RESEARCH_DOING },
    ],
  },
  {
    id: "safety", title: "Medicines, Safety & Emergencies", titleUr: "Dawaiyan, Hifazat aur Emergencies",
    tagline: "What medicines do to rehab, and what to do when a patient is suddenly unwell.", taglineUr: "Dawaiyan rehab par kya asar daalti hain, aur mareez achanak bigre to kya karein.",
    icon: "siren", glow: ["#f87171", "#fbbf24"],
    units: [
      { id: "medicines", title: "Medicines & safety", titleUr: "Dawaiyan aur hifazat", areas: ["Medicines & Safety"] },
      { id: "emergency", title: "Emergency care", titleUr: "Emergency care", areas: ["Emergency Care"] },
    ],
  },
  {
    id: "career", title: "Exams, Career & Culture", titleUr: "Exams, Career aur Culture",
    tagline: "Exam skills, your first job, and care that fits life in Pakistan.", taglineUr: "Exam ki maharat, pehli naukri, aur Pakistan ki zindagi se milti care.",
    icon: "cap", glow: ["#60a5fa", "#8f7cff"],
    units: [
      { id: "exams", title: "Exams & career", titleUr: "Exams aur career", areas: ["Exam & Career"] },
      { id: "culture", title: "Pakistan & culture", titleUr: "Pakistan aur culture", areas: ["Culture & Context"] },
    ],
  },
];

const RESEARCH_AREA = "Research & Evidence";

/** The subject and unit a lesson sits in. A Research lesson not in any slug list goes to the first Research unit, so no lesson is ever lost. */
export function placeLesson(lesson: Pick<TeacherLessonCard, "slug" | "area">): { subject: Subject; unit: SubjectUnit } | null {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      if (unit.slugs?.includes(lesson.slug)) return { subject, unit };
      if (unit.areas?.includes(lesson.area)) return { subject, unit };
    }
  }
  if (lesson.area === RESEARCH_AREA) {
    const research = subjects.find((s) => s.id === "research")!;
    return { subject: research, unit: research.units[0] };
  }
  return null;
}

export type UnitWithLessons<L> = { unit: SubjectUnit; lessons: L[] };

/** The units of a subject with their lessons, in teaching order (slug lists keep their order; area units keep the lessons' own order). Empty units are left out. */
export function unitsOf<L extends Pick<TeacherLessonCard, "slug" | "area">>(subject: Subject, lessons: L[]): UnitWithLessons<L>[] {
  return subject.units
    .map((unit) => {
      const inUnit = lessons.filter((lesson) => { const place = placeLesson(lesson); return place?.subject.id === subject.id && place.unit.id === unit.id; });
      if (unit.slugs) inUnit.sort((a, b) => { const ia = unit.slugs!.indexOf(a.slug), ib = unit.slugs!.indexOf(b.slug); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); });
      return { unit, lessons: inUnit };
    })
    .filter((group) => group.lessons.length > 0);
}

export function lessonsOf<L extends Pick<TeacherLessonCard, "slug" | "area">>(subject: Subject, lessons: L[]): L[] {
  return lessons.filter((lesson) => placeLesson(lesson)?.subject.id === subject.id);
}

/** Courses (learning paths) that belong to a subject: most of their steps are lessons of that subject. */
export function pathsOf(subject: Subject, paths: TeacherPath[], lessons: Pick<TeacherLessonCard, "slug" | "area">[]): TeacherPath[] {
  const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  return paths.filter((path) => {
    const steps = path.steps.map((step) => (step.kind === "lesson" ? bySlug.get(step.lesson) : undefined)).filter((x): x is Pick<TeacherLessonCard, "slug" | "area"> => !!x);
    if (!steps.length) return false;
    const counts = new Map<string, number>();
    for (const step of steps) { const id = placeLesson(step)?.subject.id; if (id) counts.set(id, (counts.get(id) ?? 0) + 1); }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top?.[0] === subject.id;
  });
}

export function subjectById(id: string): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}
