import type { Instrument, ScoreResult } from "./types.ts";

/**
 * Scores one set of answers for one instrument. This is the only place a score is worked out: the server runs it on what the browser sent and stores its result,
 * so a stored score can never be one the person (or a changed page) made up. Anything unexpected is refused, not corrected.
 */
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isInt = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value);
const round = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;
const fail = (reason: string): ScoreResult => ({ ok: false, reason });

export function scoreResponse(instrument: Instrument, input: unknown): ScoreResult {
  if (instrument.status !== "ready" && instrument.status !== "verify_wording") return fail("instrument has no wording");
  if (!isObject(input)) return fail("answers must be an object");
  const form = instrument.form;

  if (form.type === "numbers") {
    const answers: Record<string, unknown> = {};
    const parts: Record<string, number> = {};
    for (const item of form.items) {
      const value = input[item.id];
      if (!isInt(value) || value < item.min || value > item.max) return fail(`${item.id}: a whole number from ${item.min} to ${item.max} is needed`);
      answers[item.id] = value;
      parts[item.id] = value;
    }
    return { ok: true, answers, score: { primary: parts[form.primary], parts, band: null } };
  }

  if (form.type === "psfs") {
    const list = input.activities;
    if (!Array.isArray(list) || list.length < form.minActivities || list.length > form.maxActivities) return fail(`between ${form.minActivities} and ${form.maxActivities} activities are needed`);
    const activities: { name: string; rating: number }[] = [];
    const parts: Record<string, number> = {};
    for (const [index, entry] of list.entries()) {
      if (!isObject(entry) || typeof entry.name !== "string" || !isInt(entry.rating) || entry.rating < form.min || entry.rating > form.max) return fail(`activity ${index + 1}: a name and a whole-number rating from ${form.min} to ${form.max} are needed`);
      const name = entry.name.replace(/\s+/g, " ").trim();
      if (name.length < 2 || name.length > 80) return fail(`activity ${index + 1}: the name must be 2 to 80 characters`);
      activities.push({ name, rating: entry.rating });
      parts[`a${index + 1}`] = entry.rating;
    }
    const mean = activities.reduce((sum, a) => sum + a.rating, 0) / activities.length;
    return { ok: true, answers: { activities }, score: { primary: round(mean, 1), parts, band: null } };
  }

  if (form.type === "change") {
    const value = input.value;
    if (!isInt(value) || !form.options.some((option) => option.value === value)) return fail("choose one of the listed answers");
    return { ok: true, answers: { value }, score: { primary: value, parts: {}, band: null } };
  }

  if (form.type === "checklist") {
    const ticked = input.ticked;
    if (!Array.isArray(ticked) || ticked.some((id) => typeof id !== "string")) return fail("ticked must be a list of item ids");
    const known = new Set(form.items.map((item) => item.id));
    const unique = [...new Set(ticked as string[])];
    if (unique.some((id) => !known.has(id))) return fail("an unknown item was ticked");
    const sorted = form.items.map((item) => item.id).filter((id) => unique.includes(id));
    return { ok: true, answers: { ticked: sorted }, score: { primary: sorted.length, parts: {}, band: null } };
  }

  if (form.type === "sbst") {
    const answers: Record<string, unknown> = {};
    const points: Record<string, number> = {};
    for (const item of form.items) {
      const value = input[item.id];
      if (!isInt(value) || !item.options.some((option) => option.value === value)) return fail(`${item.id}: choose one of the listed answers`);
      answers[item.id] = value;
      // Items 1-8: agree scores 1. Item 9 (how bothersome): "very much" or "extremely" scores 1.
      points[item.id] = item.id === "q9" ? (value >= 3 ? 1 : 0) : value;
    }
    const total = Object.values(points).reduce((a, b) => a + b, 0);
    const psychosocial = ["q5", "q6", "q7", "q8", "q9"].reduce((sum, id) => sum + points[id], 0);
    const band = psychosocial >= 4 ? "high" : total >= 4 ? "medium" : "low";
    return { ok: true, answers, score: { primary: total, parts: { total, psychosocial }, band } };
  }

  // measures: the physiotherapist records the ones taken (at least one), each inside its plausible range
  const answers: Record<string, unknown> = {};
  const parts: Record<string, number> = {};
  for (const field of form.fields) {
    const value = input[field.id];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value < field.min || value > field.max) return fail(`${field.id}: a number from ${field.min} to ${field.max} ${field.unit} is needed`);
    const rounded = round(value, field.decimals);
    answers[field.id] = rounded;
    parts[field.id] = rounded;
  }
  if (Object.keys(parts).length === 0) return fail("record at least one measurement");
  if (Object.keys(input).some((key) => !form.fields.some((field) => field.id === key))) return fail("an unknown measurement was sent");
  return { ok: true, answers, score: { primary: null, parts, band: null } };
}
