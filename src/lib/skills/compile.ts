import type { SkillCard, SkillData, SkillDefinition, SkillIndexEntry, SkillQuestion } from "./types.ts";

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

const fill = (template: string, title: string) => template.replace(/\{title\}/g, title);

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
      if (!field.quiz) continue;
      const id = `${skill.slug}:${item.id}:${slugPart(field.label)}`;
      const stem = field.ask ? fill(field.ask, item.title) : `${item.title} — ${field.label}?`;
      generatedCards.push({ id, level: field.level, front: stem, back: field.value });

      const sameLabel = (other: typeof item) => other.fields.find((candidate) => candidate.label === field.label)?.value;
      const pool = [
        ...skill.atlas.filter((other) => other.id !== item.id && other.group === item.group),
        ...skill.atlas.filter((other) => other.id !== item.id && other.group !== item.group),
      ]
        .map(sameLabel)
        .filter((value): value is string => Boolean(value) && value !== field.value);
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
        explain: `${item.title}: ${field.label.toLowerCase()} — ${field.value}.${item.tip ? " " + item.tip : ""}`,
      });
    }
  }

  const questions = [...skill.questions, ...generatedQuestions];
  const cards = [...(skill.cards ?? []), ...generatedCards];
  const data: SkillData = { ...skill, questions, cards, version: 0 };
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
    goals: data.goals,
    sources: data.sources.map((source) => source.title),
  };
}
