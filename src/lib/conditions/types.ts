import type { AreaId, TypeId } from "./taxonomy";
import type { MSKStory } from "../msk-clinical-stories";
import type { BookChapter, BookHelp } from "./book-types";

export type Evidence = "Strong" | "Moderate" | "Mixed";

/** Small record kept in the worker: lists, search, SEO shell and the quick guide for crawlers. */
export type CatalogItem = {
  slug: string;
  name: string;
  area: AreaId;
  type: TypeId;
  evidence: Evidence | "";
  /** One or two sentences. */
  summary: string;
  /** "book" = a chapter of The Complete Physiotherapy Clinical Mastery (every guide since 27 Nov 2026). */
  kind: "book" | "injury" | "plan" | "both";
  /** How many stages the plan has (for the card). */
  stages: number;
  /** First quick-guide lines, so the page has real text before the browser loads the rest. */
  redFlags: string[];
  firstSteps: string[];
  /** Everyday names, abbreviations and old names (search only). */
  aka: string;
  /** The book's volume and chapter, the lettered sections it has (e.g. "ABCDEFGHIJKLMN") and how many special tests it describes. */
  vol: number;
  ch: number;
  letters: string;
  tests: number;
};

/** A Clinical Foundations chapter (reasoning, assessment, treatment methods): /conditions/foundations/<slug>. */
export type FoundationItem = { slug: string; title: string; vol: number; ch: number; lead: string };

export type Stage = {
  label: string;
  goal: string;
  /** How you know you are ready for this stage (the previous stage's exit criteria). */
  when: string[];
  do: string[];
  dose: string[];
  moveOn: string[];
};

export type TestShort = { name: string; purpose: string; positive: string };

export type TestFull = TestShort & {
  patientPosition: string;
  therapistPosition: string;
  handPlacement: string;
  procedure: string[];
  interpretation: string;
  clinicalNote?: string;
};

export type Story = MSKStory;

export type ConditionDetail = {
  v: 1;
  slug: string;
  name: string;
  area: AreaId;
  type: TypeId;
  evidence: Evidence | "";
  summary: string;
  image?: { url: string; title: string; credit: string };
  quick: { lookLabel: string; looksLike: string[]; redFlags: string[]; firstSteps: string[]; selfCare: string[] };
  clinical: { assess: string[]; tests: TestShort[]; differentials: string[]; measures: string[]; stages: Stage[]; returnCriteria: string[] };
  expert: {
    logic: string[]; structures: string[]; mechanism: string[]; classification: string[]; investigations: string[];
    manual: string[]; modalities: string[]; dosing: string[]; progression: string[]; mistakes: string[]; pearls: string[];
    education: string[]; escalation: string[]; tests: TestFull[]; story?: Story; refs: { title: string; url: string }[];
  };
  links: { label: string; href: string }[];
  related: string[];
  /** The whole chapter, word for word (the page shows this). */
  book?: BookChapter;
  /** Roman Urdu help written for the site, per section. */
  help?: BookHelp;
};

export type FoundationDetail = FoundationItem & { v: 1; book: BookChapter; help?: BookHelp };
