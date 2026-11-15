import type { BiText, TeacherLesson } from "./types";

/**
 * The Concept Lab of a PNA Teacher lesson: the same kind of tabbed, animated demonstrations the Manual Therapy chapters have, built from the
 * lesson's own beats (nothing is written twice, and everything is bilingual because the lessons are). A tab exists only when the lesson
 * has the material for it. Keep imports relative: scripts/validate-manual-therapy-depth.ts and the lesson validator import this file with Node.
 */
export type LabCheck = { question: BiText; options: { text: BiText; correct: boolean; feedback: BiText }[] };
export type LabData = {
  how: BiText[];
  picture: { kind: "analogy" | "memory"; text: BiText }[];
  caseFlow: { patient: string; assessment: string; treatment: string; reassess: string; ur?: string } | null;
  clinic: BiText[];
  steps: { title: string; detail: string }[];
  stepsUr: string[];
  safety: BiText[];
  mistakes: BiText[];
  compare: { title: BiText; headers: [BiText, BiText, BiText]; rows: [BiText, BiText, BiText][] } | null;
  checks: LabCheck[];
  reveals: { question: BiText; answer: BiText }[];
};

export type LabTab = "how" | "picture" | "clinic" | "steps" | "safety" | "compare" | "quiz";

export function labData(lesson: Pick<TeacherLesson, "beats">): LabData {
  const out: LabData = { how: [], picture: [], caseFlow: null, clinic: [], steps: [], stepsUr: [], safety: [], mistakes: [], compare: null, checks: [], reveals: [] };
  for (const beat of lesson.beats) {
    if (beat.type === "say") out.how.push(beat.text);
    else if (beat.type === "analogy") out.picture.push({ kind: "analogy", text: beat.text });
    else if (beat.type === "memory") out.picture.push({ kind: "memory", text: beat.text });
    else if (beat.type === "clinic") out.clinic.push(beat.text);
    else if (beat.type === "case" && !out.caseFlow) out.caseFlow = { patient: beat.patient, assessment: beat.assessment, treatment: beat.treatment, reassess: beat.reassess, ur: beat.ur };
    else if (beat.type === "steps" && !out.steps.length) {
      out.steps = beat.steps;
      out.stepsUr = beat.ur ? beat.ur.split(/\s*\n\s*|\s+(?=\d{1,2}[.)]\s)/).map((part) => part.replace(/^\d{1,2}[.)]\s*/, "").trim()).filter(Boolean) : [];
    } else if (beat.type === "safety") out.safety.push(beat.text);
    else if (beat.type === "mistake") out.mistakes.push(beat.text);
    else if (beat.type === "compare" && !out.compare) out.compare = { title: beat.title, headers: beat.headers, rows: beat.rows };
    else if (beat.type === "check") out.checks.push({ question: beat.question, options: beat.options.map((option) => ({ text: option.text, correct: Boolean(option.correct), feedback: option.feedback })) });
    else if (beat.type === "reveal") out.reveals.push({ question: beat.question, answer: beat.answer });
  }
  return out;
}

export function labTabs(data: LabData): LabTab[] {
  const tabs: LabTab[] = [];
  if (data.how.length) tabs.push("how");
  if (data.picture.length) tabs.push("picture");
  if (data.caseFlow || data.clinic.length) tabs.push("clinic");
  if (data.steps.length >= 2) tabs.push("steps");
  if (data.safety.length || data.mistakes.length) tabs.push("safety");
  if (data.compare) tabs.push("compare");
  if (data.checks.length || data.reveals.length) tabs.push("quiz");
  return tabs;
}
