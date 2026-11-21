import assert from "node:assert/strict";
import { AVAILABLE_INSTRUMENTS, GROC_OPTIONS, INSTRUMENTS, INSTRUMENT_BY_ID, instrumentFor } from "../src/lib/outcomes/instruments.ts";
import { interpretChange, measureImprovement } from "../src/lib/outcomes/interpret.ts";
import { MAX_PLAN_ITEMS, checkPlanItems, dueList, timepointsFor } from "../src/lib/outcomes/plan.ts";
import { scoreResponse } from "../src/lib/outcomes/scoring.ts";
import { SCHEDULES, TIMEPOINT_DAYS, type Bi, type Instrument, type Score } from "../src/lib/outcomes/types.ts";

/**
 * Outcome measures: the catalogue is complete and honest about what may be given to a patient, every answer is scored by one function that refuses anything
 * unexpected, changes are read with their published thresholds and sources, and a plan only ever contains instruments that are available.
 */
let checks = 0;
const failures: string[] = [];
const ok = (condition: boolean, message: string) => { checks++; if (!condition) failures.push(message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; try { assert.deepEqual(actual, expected); } catch { failures.push(`${message} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`); } };
const ARABIC = /[؀-ۿ]/;
const nums = (text: string) => (text.match(/\d+/g) ?? []).sort().join(",");

const get = (id: string): Instrument => { const found = INSTRUMENT_BY_ID[id]; if (!found) throw new Error(`missing instrument ${id}`); return found; };
const S = (primary: number | null, parts: Record<string, number> = {}, band: string | null = null): Score => ({ primary, parts, band });

/* ---------- 1. the catalogue ---------- */
ok(new Set(INSTRUMENTS.map((i) => i.id)).size === INSTRUMENTS.length, "instrument ids are unique");
for (const i of INSTRUMENTS) {
  ok(i.citation.length > 10 && i.licence.length > 3 && i.statusNote.length > 10, `${i.id}: source, licence and status note are written`);
  ok(i.name.en.length > 0 && i.name.ru.length > 0 && i.purpose.en.length > 20 && i.purpose.ru.length > 20, `${i.id}: name and purpose in both languages`);
  ok(!ARABIC.test(i.name.ru + i.purpose.ru), `${i.id}: Roman Urdu is in Roman letters`);
  ok(i.version >= 0, `${i.id}: has a version`);
}
const texts = (instrument: Instrument): Array<[string, Bi]> => {
  const out: Array<[string, Bi]> = [];
  const form = instrument.form;
  if (form.type === "numbers") for (const item of form.items) { out.push([`${item.id} prompt`, item.prompt]); if (item.minLabel) out.push([`${item.id} min`, item.minLabel]); if (item.maxLabel) out.push([`${item.id} max`, item.maxLabel]); }
  if (form.type === "psfs") out.push(["instruction", form.instruction], ["min", form.minLabel], ["max", form.maxLabel]);
  if (form.type === "change") { out.push(["prompt", form.prompt]); form.options.forEach((o) => out.push([`option ${o.value}`, o.label])); }
  if (form.type === "checklist") { out.push(["instruction", form.instruction]); form.items.forEach((item) => out.push([item.id, item.text])); }
  if (form.type === "sbst") { out.push(["instruction", form.instruction]); form.items.forEach((item) => { out.push([item.id, item.prompt]); item.options.forEach((o) => out.push([`${item.id} option ${o.value}`, o.label])); }); }
  if (form.type === "measures") { out.push(["protocol", form.protocol]); form.fields.forEach((f) => out.push([f.id, f.label])); }
  return out;
};
for (const i of INSTRUMENTS) {
  if (i.status === "ready" || i.status === "verify_wording") {
    const all = texts(i);
    ok(all.length > 0, `${i.id}: has wording`);
    for (const [where, text] of all) {
      ok(text.en.trim().length > 0 && text.ru.trim().length > 0, `${i.id} ${where}: English and Roman Urdu are both written`);
      ok(!ARABIC.test(text.ru), `${i.id} ${where}: Roman Urdu is in Roman letters`);
      if (/\d/.test(text.en)) ok(nums(text.en) === nums(text.ru), `${i.id} ${where}: numbers are the same in both languages (${text.en} / ${text.ru})`);
    }
  } else {
    ok(i.form.type === "checklist" && i.form.items.length === 0 && i.version === 0, `${i.id}: no wording is stored while ${i.status.replace(/_/g, " ")}`);
  }
}
const numbersForm = get("nprs").form;
ok(numbersForm.type === "numbers" && numbersForm.items.length === 4 && numbersForm.items.every((x) => x.min === 0 && x.max === 10), "NPRS: four 0-10 questions");
const rmdq = get("rmdq24").form;
ok(rmdq.type === "checklist" && rmdq.items.length === 24, "RMDQ-24: exactly 24 statements");
const sbst = get("sbst").form;
ok(sbst.type === "sbst" && sbst.items.length === 9 && sbst.items[8].options.length === 5 && sbst.items.slice(0, 8).every((x) => x.options.length === 2), "STarT Back: 8 agree/disagree items and the 5-level bothersome item");
eq(GROC_OPTIONS.map((o) => o.value), [7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7], "GROC: the 15 answers from +7 to -7");
// availability: only what is ready may be given or recorded
eq(AVAILABLE_INSTRUMENTS.map((i) => i.id).sort(), INSTRUMENTS.filter((i) => i.status === "ready").map((i) => i.id).sort(), "only 'ready' instruments are available");
ok(!AVAILABLE_INSTRUMENTS.some((i) => ["rmdq24", "sbst", "ndi", "odi"].includes(i.id)), "RMDQ, STarT Back, NDI and ODI are not available until their wording or permission is settled");
ok(instrumentFor("nprs", 1) !== null && instrumentFor("nprs", 2) === null && instrumentFor("nope") === null, "an instrument is found by id and exact version only");

/* ---------- 2. scoring: numbers (NPRS) ---------- */
const nprs = get("nprs");
const good = { now: 4, avg7: 5, worst7: 8, best7: 2 };
const nOk = scoreResponse(nprs, { ...good, extra: 99 });
ok(nOk.ok && nOk.score.primary === 5 && nOk.score.parts.worst7 === 8, "NPRS: the average over the week is the number followed");
ok(nOk.ok && !("extra" in nOk.answers), "NPRS: an unknown key is not stored");
for (const [name, value] of [["a string", "5"], ["a decimal", 5.5], ["above 10", 11], ["below 0", -1], ["null", null], ["NaN", NaN]] as const) ok(!scoreResponse(nprs, { ...good, avg7: value }).ok, `NPRS: ${name} is refused`);
ok(!scoreResponse(nprs, { now: 4 }).ok, "NPRS: a missing question is refused");
ok(!scoreResponse(nprs, null).ok && !scoreResponse(nprs, [1, 2]).ok && !scoreResponse(nprs, "x").ok, "NPRS: not an object is refused");
ok(scoreResponse(nprs, { now: 0, avg7: 0, worst7: 0, best7: 0 }).ok && scoreResponse(nprs, { now: 10, avg7: 10, worst7: 10, best7: 10 }).ok, "NPRS: 0 and 10 are accepted");

/* ---------- 3. PSFS ---------- */
const psfs = get("psfs");
const p1 = scoreResponse(psfs, { activities: [{ name: "  Lifting   my   child ", rating: 3 }, { name: "Sitting at work", rating: 5 }, { name: "Walking", rating: 4 }] });
ok(p1.ok && p1.score.primary === 4 && p1.score.parts.a1 === 3, "PSFS: the average of the ratings");
ok(p1.ok && (p1.answers.activities as { name: string }[])[0].name === "Lifting my child", "PSFS: the activity name is tidied");
const p2 = scoreResponse(psfs, { activities: [{ name: "A walk", rating: 3 }, { name: "Prayer", rating: 4 }] });
ok(p2.ok && p2.score.primary === 3.5, "PSFS: two activities are allowed (3.5)");
const p3 = scoreResponse(psfs, { activities: [{ name: "One", rating: 1 }, { name: "Two", rating: 2 }, { name: "Three", rating: 2 }] });
ok(p3.ok && p3.score.primary === 1.7, "PSFS: the average is rounded to one decimal (1.7)");
ok(!scoreResponse(psfs, { activities: [] }).ok, "PSFS: no activity is refused");
ok(!scoreResponse(psfs, { activities: Array.from({ length: 4 }, (_, i) => ({ name: `Activity ${i}`, rating: 5 })) }).ok, "PSFS: more than three activities are refused");
ok(!scoreResponse(psfs, { activities: [{ name: "Walk", rating: 11 }] }).ok && !scoreResponse(psfs, { activities: [{ name: "Walk", rating: -1 }] }).ok, "PSFS: a rating outside 0-10 is refused");
ok(!scoreResponse(psfs, { activities: [{ name: "x", rating: 5 }] }).ok && !scoreResponse(psfs, { activities: [{ name: "y".repeat(81), rating: 5 }] }).ok, "PSFS: a name must be 2 to 80 characters");
ok(!scoreResponse(psfs, { activities: [{ name: "Walk", rating: 2.5 }] }).ok && !scoreResponse(psfs, { activities: "walk" }).ok, "PSFS: a half rating or a non-list is refused");

/* ---------- 4. GROC ---------- */
const groc = get("groc");
for (const v of [-7, 0, 7]) ok(scoreResponse(groc, { value: v }).ok, `GROC: ${v} is accepted`);
for (const v of [8, -8, 1.5, "3", null]) ok(!scoreResponse(groc, { value: v }).ok, `GROC: ${JSON.stringify(v)} is refused`);
ok(!INSTRUMENT_BY_ID.groc.atBaseline && timepointsFor({ instrument: "groc", version: 1, schedule: "standard" }).join() === "w2,w6,w12", "GROC is asked at follow-up only");

/* ---------- 5. RMDQ and STarT Back (scoreable; not yet offered) ---------- */
const r = get("rmdq24");
ok(scoreResponse(r, { ticked: ["q1", "q1", "q24", "q13"] }).ok && (scoreResponse(r, { ticked: ["q1", "q1", "q24", "q13"] }) as { score: Score }).score.primary === 3, "RMDQ: each ticked statement is one point, repeats count once");
ok(scoreResponse(r, { ticked: [] }).ok && (scoreResponse(r, { ticked: [] }) as { score: Score }).score.primary === 0, "RMDQ: none ticked is 0");
ok(((scoreResponse(r, { ticked: Array.from({ length: 24 }, (_, i) => `q${i + 1}`) }) as { score: Score }).score.primary) === 24, "RMDQ: all 24 is 24");
ok(!scoreResponse(r, { ticked: ["q25"] }).ok && !scoreResponse(r, { ticked: "q1" }).ok && !scoreResponse(r, { ticked: [1] }).ok, "RMDQ: an unknown id or a bad list is refused");
// STarT Back: compare the scorer with an independent statement of the published rule over every possible set of answers
const sb = get("sbst");
let sbCases = 0;
for (let mask = 0; mask < 256; mask++) {
  for (let bother = 0; bother < 5; bother++) {
    const answers: Record<string, number> = { q9: bother };
    for (let i = 0; i < 8; i++) answers[`q${i + 1}`] = (mask >> i) & 1;
    const total = [...Array(8).keys()].reduce((s, i) => s + ((mask >> i) & 1), 0) + (bother >= 3 ? 1 : 0);
    const psycho = [4, 5, 6, 7].reduce((s, i) => s + ((mask >> i) & 1), 0) + (bother >= 3 ? 1 : 0);
    const expected = psycho >= 4 ? "high" : total >= 4 ? "medium" : "low";
    const result = scoreResponse(sb, answers);
    sbCases++;
    if (!result.ok || result.score.band !== expected || result.score.parts.total !== total || result.score.parts.psychosocial !== psycho) failures.push(`STarT Back wrong for ${JSON.stringify(answers)}`);
  }
}
checks += sbCases;
ok(!scoreResponse(sb, { q1: 2, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 }).ok && !scoreResponse(sb, { q1: 1 }).ok, "STarT Back: an out-of-range or missing answer is refused");
ok((scoreResponse(sb, { q1: 1, q2: 1, q3: 1, q4: 1, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0 }) as { score: Score }).score.band === "medium", "STarT Back: 4 physical points with no psychosocial points is medium risk");
ok((scoreResponse(sb, { q1: 0, q2: 0, q3: 0, q4: 0, q5: 1, q6: 1, q7: 1, q8: 1, q9: 0 }) as { score: Score }).score.band === "high", "STarT Back: 4 psychosocial points is high risk");

/* ---------- 6. measurements taken by the physiotherapist ---------- */
const back = get("back_function_tests");
const m1 = scoreResponse(back, { sorensen: 47.4, five_sts: 11.26 });
ok(m1.ok && m1.score.primary === null && m1.score.parts.sorensen === 47 && m1.score.parts.five_sts === 11.3, "Measurements: each value is kept to its own decimals");
ok(m1.ok && Object.keys(m1.answers).length === 2, "Measurements: only the ones taken are stored");
ok(!scoreResponse(back, {}).ok && !scoreResponse(back, { sorensen: "" }).ok, "Measurements: at least one is needed");
ok(!scoreResponse(back, { sorensen: 301 }).ok && !scoreResponse(back, { sorensen: -1 }).ok && !scoreResponse(back, { sorensen: NaN }).ok && !scoreResponse(back, { sorensen: "40" }).ok, "Measurements: out of range, NaN or text is refused");
ok(!scoreResponse(back, { sorensen: 40, unknown_test: 3 }).ok, "Measurements: an unknown test is refused");
ok(measureImprovement("higher", 30, 42) === 12 && measureImprovement("lower", 12.5, 10.1) === 2.4 && measureImprovement("lower", 10, 12) === -2, "Measurements: improvement is signed by which direction is better");
ok(!scoreResponse(get("ndi"), { a: 1 }).ok && !scoreResponse(get("odi"), { a: 1 }).ok, "NDI and ODI cannot be scored while their wording is not stored");

/* ---------- 7. reading a change ---------- */
const N = (a: number, b: number) => interpretChange(nprs, S(a), S(b));
eq([N(6, 4).band, N(6, 4).improvement, N(6, 4).percent], ["better", 2, 33.3], "NPRS 6 to 4: 2 points and 33% is an important improvement");
eq(N(6, 5).band, "no_important_change", "NPRS 6 to 5: 1 point is not important");
eq(N(8, 3).band, "much_better", "NPRS 8 to 3: 62% is substantial");
eq(N(10, 7).band, "better", "NPRS 10 to 7: 30% is important");
eq(N(10, 8).band, "no_important_change", "NPRS 10 to 8: 2 points but only 20%");
eq(N(2, 0).band, "much_better", "NPRS 2 to 0: all of it");
eq([N(0, 2).band, N(0, 2).percent], ["worse", null], "NPRS 0 to 2: worse (no percentage from zero)");
eq(N(5, 7).band, "worse", "NPRS 5 to 7: 2 points and 40% worse");
eq(N(4, 8).band, "much_worse", "NPRS 4 to 8: 100% worse");
eq(N(5, 5).band, "no_important_change", "NPRS 5 to 5: no change");
ok(N(6, 4).basis.includes("IMMPACT"), "NPRS: the source of the threshold is written beside the result");
const P = (a: number, b: number) => interpretChange(get("psfs"), S(a), S(b)).band;
eq([P(3, 5), P(3, 4.9), P(5, 3), P(3, 3)], ["better", "no_important_change", "worse", "no_important_change"], "PSFS: 2 points is the change that counts");
const G = (v: number) => interpretChange(groc, null, S(v)).band;
eq([G(7), G(6), G(5), G(4), G(3), G(0), G(-3), G(-4), G(-6)], ["much_better", "much_better", "better", "better", "no_important_change", "no_important_change", "no_important_change", "worse", "much_worse"], "GROC: bands from Jaeschke");
eq(interpretChange(nprs, null, S(4)).band, "not_comparable", "No earlier score: not comparable");
eq(interpretChange(get("back_function_tests"), S(null), S(null)).band, "not_comparable", "Measured tests claim no threshold");
eq(interpretChange(sb, S(5, {}, "high"), S(3)).band, "not_comparable", "STarT Back risk class is not read as a change");

/* ---------- 8. plans ---------- */
const item = (instrument: string, schedule = "standard", version = 1) => ({ instrument, version, schedule });
ok(checkPlanItems([item("nprs"), item("psfs"), item("groc"), item("back_function_tests", "single")]).ok, "A plan of available instruments is accepted");
for (const [plan, why] of [
  [[], "an empty plan"],
  [Array.from({ length: MAX_PLAN_ITEMS + 1 }, (_, i) => item(["nprs", "psfs", "groc", "neck_rom", "neck_endurance", "back_function_tests"][i % 6])), "too many"],
  [[item("rmdq24", "standard", 1)], "an instrument whose wording is not verified"],
  [[item("ndi", "standard", 0)], "an instrument that needs permission"],
  [[item("odi", "standard", 0)], "an instrument that needs a licence"],
  [[item("nope")], "an unknown instrument"],
  [[item("nprs", "standard", 2)], "a wrong version"],
  [[item("nprs", "weekly")], "an unknown schedule"],
  [[item("nprs"), item("nprs", "single")], "the same instrument twice"],
  ["nprs", "not a list"],
  [[null], "a null entry"],
] as Array<[unknown, string]>) ok(!checkPlanItems(plan).ok, `A plan with ${why} is refused`);
const anchor = new Date("2026-12-01T09:00:00Z");
const plan = { items: [item("nprs", "standard"), item("groc", "standard"), item("neck_rom", "single")].map((i) => ({ ...i, version: 1, schedule: i.schedule as "standard" | "single" })), anchor };
const day = (n: number) => new Date(anchor.getTime() + n * 86_400_000);
const due0 = dueList(plan, new Set(), day(0));
eq(due0.filter((d) => d.state === "due").map((d) => `${d.instrument}:${d.timepoint}`), ["nprs:baseline"], "On the first day only the starting questionnaire is due (a rating of change has no start, a measurement is the physiotherapist's)");
eq(due0.map((d) => d.instrument).includes("neck_rom"), false, "The physiotherapist's measurements are not on the patient's list");
ok(dueList(plan, new Set(), day(0), false).some((d) => d.instrument === "neck_rom" && d.timepoint === "baseline" && d.state === "due"), "...but they are on the physiotherapist's list");
eq(dueList(plan, new Set(["nprs:baseline"]), day(0)).some((d) => d.timepoint === "baseline"), false, "An answered point is not listed again");
eq(dueList(plan, new Set(), day(13)).find((d) => d.instrument === "nprs" && d.timepoint === "w2")?.state, "upcoming", "Day 13: the 2-week point is still upcoming");
eq(dueList(plan, new Set(), day(14)).find((d) => d.instrument === "nprs" && d.timepoint === "w2")?.state, "due", "Day 14: the 2-week point is due");
eq(dueList(plan, new Set(), day(21)).find((d) => d.instrument === "nprs" && d.timepoint === "w2")?.state, "due", "Day 21: still due");
eq(dueList(plan, new Set(), day(22)).find((d) => d.instrument === "nprs" && d.timepoint === "w2")?.state, "late", "Day 22: late");
eq(dueList(plan, new Set(), day(0)).map((d) => d.dueAt.getTime()), [...dueList(plan, new Set(), day(0))].map((d) => d.dueAt.getTime()).sort((a, b) => a - b), "The list is in the order things fall due");
eq(Object.keys(SCHEDULES).sort(), ["intensive", "single", "standard"], "There are three schedules");
for (const [key, schedule] of Object.entries(SCHEDULES)) {
  ok(schedule.points[0] === "baseline", `${key}: starts at the start`);
  const days = schedule.points.map((p) => (p === "discharge" ? 0 : TIMEPOINT_DAYS[p]));
  ok(days.every((d, i) => i === 0 || d > days[i - 1]), `${key}: the points are in time order`);
  ok(schedule.label.en.length > 5 && schedule.label.ru.length > 5, `${key}: labelled in both languages`);
}
// scoring never changes what it is given
const frozen = Object.freeze({ now: 3, avg7: 3, worst7: 6, best7: 1 });
ok(scoreResponse(nprs, frozen).ok, "Scoring does not change the answers it is given");

if (failures.length) {
  console.error(failures.map((f) => `✗ ${f}`).join("\n"));
  console.error(`\n${failures.length} of ${checks} checks failed.`);
  process.exit(1);
}
console.log(`Outcome measures: ${checks} checks passed (${INSTRUMENTS.length} instruments, ${AVAILABLE_INSTRUMENTS.length} available).`);
