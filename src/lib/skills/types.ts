/**
 * PNA Clinical Skills Lab — data model.
 *
 * A skill is learned in four levels. Content is authored in src/lib/skills/content/*
 * and compiled by scripts/build-skills-data.ts into static JSON under
 * public/skills-data (served by Cloudflare assets, never bundled in the Worker).
 */

export type SkillLevelId = "beginner" | "intermediate" | "advanced" | "expert";

export const SKILL_LEVELS: { id: SkillLevelId; label: string; labelUr: string; promise: string }[] = [
  { id: "beginner", label: "Beginner", labelUr: "Beginner", promise: "Know the language and the basic rules." },
  { id: "intermediate", label: "Intermediate", labelUr: "Intermediate", promise: "Perform every test correctly, step by step." },
  { id: "advanced", label: "Advanced", labelUr: "Advanced", promise: "Spot errors, substitutions and the tricky positions." },
  { id: "expert", label: "Expert", labelUr: "Expert", promise: "Reason like a clinician and pass any OSCE station." },
];

export const levelRank = (level: SkillLevelId) => SKILL_LEVELS.findIndex((item) => item.id === level);

export type SkillPose = "supine" | "prone" | "sitting" | "sidelying" | "standing" | "hooklying";

/**
 * Close-up joint demonstration. Angles are screen angles in degrees
 * (0 = right, 90 = up). The proximal segment points from the joint toward
 * `prox`; the distal segment starts at `from` and moves by `rom` (signed).
 */
export type JointDemoSpec = {
  pose: SkillPose;
  prox: number;
  from: number;
  rom: number;
  proxLabel: string;
  distLabel: string;
  axis: string;
  gravity?: "against" | "minimized";
  resist?: boolean;
  goniometer?: boolean;
};

/** A point on the front/back body chart (viewBox 200 × 440). */
export type BodyPoint = { view: "front" | "back"; x: number; y: number };

export type SkillField = {
  label: string;
  value: string;
  /** Lowest level at which this detail is shown and examined. */
  level: SkillLevelId;
  /** Turn this field into multiple-choice questions and flashcards. */
  quiz?: boolean;
  /** Flashcard only — for answers that overlap between items and would make unfair MCQs. */
  cardOnly?: boolean;
  /** Custom question stem, e.g. "Where is the axis placed for {title}?" */
  ask?: string;
};

export type SkillAtlasItem = {
  id: string;
  title: string;
  group: string;
  subtitle?: string;
  level: SkillLevelId;
  fields: SkillField[];
  demo?: JointDemoSpec;
  point?: BodyPoint;
  tip?: string;
};

export type SkillConcept = {
  id: string;
  level: SkillLevelId;
  title: string;
  body: string;
  bullets?: string[];
  ur?: string;
  demo?: JointDemoSpec;
  table?: { head: string[]; rows: string[][] };
};

export type SkillQuestion = {
  id: string;
  level: SkillLevelId;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  /** Clinical vignette shown above the question (expert cases). */
  case?: string;
};

export type SkillCard = { id: string; level: SkillLevelId; front: string; back: string };

export type SkillStation = {
  id: string;
  title: string;
  minutes: number;
  scenario: string;
  tasks: string[];
  checklist: string[];
};

export type SkillSimulator = "goniometer" | "mmt-grade" | "body-map" | "reflex-grade" | "mas-grade" | "vitals";

export type SkillPhase = "measure" | "neuro" | "patient";

export type SkillSource = { title: string; note?: string };

export type SkillDefinition = {
  slug: string;
  title: string;
  short: string;
  phase: SkillPhase;
  icon: string;
  summary: string;
  ur: string;
  sources: SkillSource[];
  goals: Record<SkillLevelId, string>;
  concepts: SkillConcept[];
  atlas: SkillAtlasItem[];
  atlasLabel: string;
  questions: SkillQuestion[];
  cards?: SkillCard[];
  stations: SkillStation[];
  simulators: SkillSimulator[];
  related?: { label: string; href: string }[];
  /** Extra words people search with (abbreviations, Roman Urdu, tool names). */
  keywords?: string;
};

/** Compiled skill as served to the browser. */
export type SkillData = Omit<SkillDefinition, "cards"> & { cards: SkillCard[]; version: number };

/** Small index entry rendered on the server (hub, SEO, AI navigator). */
export type SkillIndexEntry = {
  slug: string;
  version: number;
  title: string;
  short: string;
  phase: SkillPhase;
  icon: string;
  summary: string;
  ur: string;
  atlasLabel: string;
  counts: { concepts: number; atlas: number; questions: number; cards: number; stations: number };
  atlasTitles: string[];
  /** Concept (Learn tab) titles — used by search and the AI navigator. */
  topics: string[];
  keywords: string;
  goals: Record<SkillLevelId, string>;
  sources: string[];
};
