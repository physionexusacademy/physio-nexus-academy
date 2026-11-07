/**
 * PNA Teacher — content model.
 *
 * Every lesson is a scripted, editorially written conversation. Nothing here
 * is generated at runtime: the "teacher" reveals one beat at a time, waits for
 * the learner, checks understanding and explains mistakes. All learner-facing
 * text is bilingual (English + Roman Urdu) so the learner can switch at any
 * moment without losing their place.
 *
 * Keep imports in this folder relative (no "@/") so the content validator in
 * scripts/validate-pna-teacher.ts can import it directly with Node.
 */

export type TeacherLang = "en" | "ur";

/** Learner-facing copy in English and Roman Urdu. `**bold**` is supported. */
export type BiText = { en: string; ur: string };

export type TeacherWidgetKey =
  | "convex-concave"
  | "maitland-grades"
  | "sensitivity-specificity"
  | "healing-timeline"
  | "pain-inputs"
  | "lesion-locator"
  | "gait-cycle"
  | "rpe-scale";

export type CheckOption = {
  text: BiText;
  /** Exactly one option per check must be correct. */
  correct?: true;
  /** What the teacher says when this option is chosen — right or wrong. */
  feedback: BiText;
};

export type TeacherBeat =
  /** Plain teacher explanation, optionally with an even simpler re-explanation. */
  | { type: "say"; text: BiText; simpler?: BiText }
  /** Everyday comparison that makes an abstract idea concrete. */
  | { type: "analogy"; text: BiText; simpler?: BiText }
  /** Memory trick / mnemonic. */
  | { type: "memory"; text: BiText }
  /** Where students usually go wrong. */
  | { type: "mistake"; text: BiText }
  /** How the idea changes what a physiotherapist actually does. */
  | { type: "clinic"; text: BiText }
  /** Interactive visual explained by the teacher. */
  | { type: "widget"; widget: TeacherWidgetKey; intro: BiText }
  /** Understanding check with feedback for every option. */
  | { type: "check"; question: BiText; options: CheckOption[]; hint?: BiText }
  /** Embodied "try it on yourself" moment followed by a reflective question. */
  | {
      type: "try";
      title: BiText;
      steps: BiText[];
      ask: BiText;
      options: { text: BiText; feedback: BiText }[];
    }
  /** Quick classification game with instant feedback per item. */
  | {
      type: "sort";
      prompt: BiText;
      categories: [BiText, BiText];
      items: { text: BiText; answer: 0 | 1; why: BiText }[];
    }
  /** Stop signs: contraindications, red flags, when to refer. */
  | { type: "safety"; text: BiText }
  /** What the research does and does not support. */
  | { type: "evidence"; text: BiText }
  /** Ordered procedure. `ur`, when present, replaces the whole list in Roman Urdu. */
  | { type: "steps"; title: BiText; steps: { title: string; detail: string }[]; ur?: string }
  /** One patient followed from assessment to reassessment. */
  | {
      type: "case";
      patient: string;
      assessment: string;
      treatment: string;
      reassess: string;
      ur?: string;
    }
  /** Retrieval practice: think first, then reveal the answer. */
  | { type: "reveal"; question: BiText; answer: BiText }
  /** Side-by-side comparison table: first column is the feature. */
  | {
      type: "compare";
      title: BiText;
      headers: [BiText, BiText, BiText];
      rows: [BiText, BiText, BiText][];
    };

export type TeacherFlashcard = { id: string; front: BiText; back: BiText };

export type TeacherSource = {
  /** Citation as it should be displayed. */
  citation: string;
  /** When true, a PubMed search link is generated from `pubmedQuery`. */
  pubmedQuery?: string;
  /** Direct link, used only for sources already verified elsewhere on PNA. */
  url?: string;
};

export type TeacherArea =
  | "Manual Therapy · Joint"
  | "Manual Therapy · Soft Tissue"
  | "Manual Therapy · World Approaches"
  | "Exercise Prescription"
  | "Movement Science"
  | "Manual Therapy"
  | "Clinical Reasoning"
  | "Neurology"
  | "Tissue Healing"
  | "Pain Science";

export type TeacherLesson = {
  slug: string;
  title: string;
  /** One-line promise shown on cards. */
  hook: BiText;
  area: TeacherArea;
  level: "Foundation" | "Clinical";
  bestFor: string;
  minutes: number;
  /** "By the end of this lesson you'll be able to…" */
  goal: BiText;
  beats: TeacherBeat[];
  /** Three key takeaways shown on the completion card. */
  summary: BiText[];
  flashcards: TeacherFlashcard[];
  goDeeper: { title: string; href: string; note: BiText }[];
  sources: TeacherSource[];
};

export type TeacherPathStep =
  | { id: string; kind: "lesson"; lesson: string }
  | {
      id: string;
      kind: "mission";
      title: string;
      href: string;
      /** What exactly the learner should do on that page. */
      mission: BiText;
      minutes: number;
    };

export type TeacherPath = {
  slug: string;
  title: string;
  tagline: BiText;
  audience: string;
  /** What the learner will be able to do after the path. */
  outcomes: BiText[];
  steps: TeacherPathStep[];
};

export type TeacherStage = "year1-2" | "year3-4" | "final-intern" | "graduate";
export type TeacherGoal = "understand" | "exams" | "clinic" | "manual";

export type TeacherProfile = {
  v: 1;
  name: string;
  stage: TeacherStage;
  goal: TeacherGoal;
  minutes: 5 | 15 | 30;
  lang: TeacherLang;
  createdAt: string;
};

/** Lightweight lesson data that is safe to send to list pages. */
export type TeacherLessonCard = Pick<
  TeacherLesson,
  "slug" | "title" | "hook" | "area" | "level" | "bestFor" | "minutes"
> & { flashcardCount: number; href: string };

/** Everything the server needs about a lesson; the full lesson is fetched as a static file. */
export type TeacherLessonMeta = TeacherLessonCard & {
  kind: "concept" | "manual";
  goal: BiText;
  checks: number;
  summaryEn: string[];
  /** Search keywords for the PNA AI navigator (concept lessons). */
  keywords: string;
  next: { slug: string; title: string; href: string } | null;
};
