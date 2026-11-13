import type { SkillCard, SkillData, SkillDefinition, SkillIndexEntry, SkillQuestion } from "./types.ts";
import { hasDemo3D } from "./demo3d.ts";
import { hasScene } from "./scenes.ts";

const hasAnyDemo = (key: string) => hasDemo3D(key) || hasScene(key);

/** Stable, readable id fragment. */
export function slugPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Deterministic shuffle so every build produces identical question files. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  const copy = [...items];
  let state = hash(seed) || 1;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/** Ends a fragment with exactly one full stop (values may or may not already have one). */
const sentence = (text: string) => (/[.!?]$/.test(text.trim()) ? text.trim() : text.trim() + ".");

const fill = (template: string, title: string) => template.replace(/\{title\}/g, title);

/** A distractor that equals, contains or sits inside the right answer would be partly correct. */
function overlaps(candidate: string, correct: string): boolean {
  const a = candidate.toLowerCase().trim();
  const b = correct.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

/** Sort key for "ordinal" options (spinal levels, grades, numbers, AIS letters); null otherwise. */
function ordinalKey(option: string): number | null {
  const text = option.trim();
  const level = /^([CTLS])(\d+)$/.exec(text);
  if (level) return "CTLS".indexOf(level[1]) * 100 + Number(level[2]);
  if (/^[A-E]$/.test(text)) return text.charCodeAt(0);
  const grade = /^(\d+(?:\.\d+)?)([+−-]?)$/.exec(text);
  if (grade) return Number(grade[1]) + (grade[2] === "+" ? 0.3 : grade[2] ? -0.3 : 0);
  return null;
}

/**
 * Authors write the correct option first; the build re-orders options so the
 * answer position is unpredictable. Ordinal options are sorted (C5 before C6,
 * grade 0 before 5) because a shuffled scale is harder to read, not harder to know.
 */
function arrangeOptions(question: SkillQuestion): SkillQuestion {
  const correct = question.options[question.answer];
  const keys = question.options.map(ordinalKey);
  const options = keys.every((key) => key !== null)
    ? [...question.options].sort((left, right) => (ordinalKey(left) ?? 0) - (ordinalKey(right) ?? 0))
    : seededShuffle(question.options, question.id + ":arrange");
  return { ...question, options, answer: options.indexOf(correct) };
}

/**
 * Builds questions and flashcards from every atlas field marked `quiz`.
 * Wrong options come from the same field of other items (same group first),
 * which makes them plausible — exactly the confusions students make.
 */
export function compileSkill(skill: SkillDefinition): SkillData {
  const generatedQuestions: SkillQuestion[] = [];
  const generatedCards: SkillCard[] = [];

  for (const item of skill.atlas) {
    for (const field of item.fields) {
      if (!field.quiz && !field.cardOnly) continue;
      const id = `${skill.slug}:${item.id}:${slugPart(field.label)}`;
      const stem = field.ask ? fill(field.ask, item.title) : `${item.title} — ${field.label}?`;
      generatedCards.push({ id, level: field.level, front: stem, back: field.value });
      if (!field.quiz) continue;

      const sameLabel = (other: typeof item) => other.fields.find((candidate) => candidate.label === field.label)?.value;
      const pool = [
        ...skill.atlas.filter((other) => other.id !== item.id && other.group === item.group),
        ...skill.atlas.filter((other) => other.id !== item.id && other.group !== item.group),
      ]
        .map(sameLabel)
        .filter((value): value is string => typeof value === "string" && value.length > 0 && !overlaps(value, field.value));
      const distractors = [...new Set(pool)].slice(0, 12);
      const chosen = seededShuffle(distractors, id).slice(0, 3);
      if (chosen.length < 3) continue;
      const options = seededShuffle([field.value, ...chosen], id + ":options");
      generatedQuestions.push({
        id,
        level: field.level,
        prompt: stem,
        options,
        answer: options.indexOf(field.value),
        explain: `${item.title}: ${field.label.toLowerCase()} — ${sentence(field.value)}${item.tip ? " " + item.tip : ""}`,
      });
    }
  }

  // Every hand-written question (including expert cases) is also a flashcard, so each level has cards to revise.
  const questionCards: SkillCard[] = skill.questions.map((question) => ({
    id: `${skill.slug}:q:${question.id}`,
    level: question.level,
    front: question.case ? `${question.case} — ${question.prompt}` : question.prompt,
    back: `${sentence(question.options[question.answer])} ${question.explain}`,
  }));
  // Expert-only atlas notes (clinical pearls, pitfalls) become expert flashcards.
  const pearlCards: SkillCard[] = skill.atlas.flatMap((item) =>
    item.fields
      .filter((field) => field.level === "expert" && !field.quiz && !field.cardOnly)
      .map((field) => ({
        id: `${skill.slug}:${item.id}:${slugPart(field.label)}`,
        level: "expert" as const,
        front: `${item.title} — ${field.label.toLowerCase()}: what must you remember?`,
        back: field.value,
      })),
  );

  const questions = [...skill.questions.map(arrangeOptions), ...generatedQuestions];
  const cards = [...(skill.cards ?? []), ...generatedCards, ...questionCards, ...pearlCards];
  // Mark the items and concepts the 3D Virtual Patient can demonstrate.
  const atlas = skill.atlas.map((item) => (hasAnyDemo(`${skill.slug}/${item.id}`) ? { ...item, demo3d: true } : item));
  const concepts = skill.concepts.map((concept) => (hasAnyDemo(`${skill.slug}/concept:${concept.id}`) ? { ...concept, demo3d: true } : concept));
  const data: SkillData = { ...skill, atlas, concepts, questions, cards, version: 0 };
  data.version = hash(JSON.stringify(data));
  return data;
}

export function indexEntry(data: SkillData): SkillIndexEntry {
  return {
    slug: data.slug,
    version: data.version,
    title: data.title,
    short: data.short,
    phase: data.phase,
    icon: data.icon,
    summary: data.summary,
    ur: data.ur,
    atlasLabel: data.atlasLabel,
    counts: {
      concepts: data.concepts.length,
      atlas: data.atlas.length,
      questions: data.questions.length,
      cards: data.cards.length,
      stations: data.stations.length,
    },
    atlasTitles: data.atlas.map((item) => item.title),
    topics: data.concepts.map((concept) => concept.title),
    keywords: data.keywords ?? "",
    goals: data.goals,
    sources: data.sources.map((source) => source.title),
  };
}
