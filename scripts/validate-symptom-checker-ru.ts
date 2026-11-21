import {
  allConditionRules,
  commonHistoryOptions,
  getCarePriority,
  getImagingNotice,
  getNeurologicHint,
  redFlags,
  regions,
} from "../src/lib/msk-symptom-checker.ts";
import { CHECKER_COPY } from "../src/lib/symptom/copy.ts";
import { IMAGING_KEYS, RU_CONDITIONS, RU_OPTIONS, careText, compatText, conditionText, flagText, imagingText, neuroText, regionText } from "../src/lib/symptom/ru.ts";
import { RU_ADVICE, RU_CARE, RU_COMPAT, RU_NEURO, RU_SAFETY_TITLE } from "../src/lib/symptom/ru-text.ts";
import { RU_FLAGS, RU_REGIONS } from "../src/lib/symptom/ru-options-a.ts";

/**
 * Roman Urdu for the symptom checker and the RehabVerse intake. English stays the source of truth: every option, region, warning, pattern and advice
 * sentence must have a Roman Urdu version, written in Roman letters (no Urdu script), non-empty, and with the same numbers as the English
 * (an age, a "90°", "1122", "4 steps" must never change in translation). The screen's own words (copy.ts) must exist in both languages with the same shape.
 */
let checks = 0;
const failures: string[] = [];
const ok = (condition: boolean, message: string) => { checks++; if (!condition) failures.push(message); };

const ARABIC_SCRIPT = /[؀-ۿݐ-ݿ]/;
const digits = (text: string) => (text.match(/\d+/g) ?? []).sort().join(",");
/** Words a clinic never says in spoken Roman Urdu (the voice is mixed English and Urdu, not formal Urdu). */
const FORMAL = /\b(tashkhees|tashkhis|vichaar|mareez|ilaaj-e|markaz-e|tabeeb|haddiyon ka mahir|jism-e)\b/i;

function good(text: string | undefined, where: string, english?: string) {
  ok(typeof text === "string" && text.trim().length > 0, `${where}: Roman Urdu text is missing`);
  if (typeof text !== "string") return;
  ok(!ARABIC_SCRIPT.test(text), `${where}: must be Roman letters, not Urdu script`);
  ok(!FORMAL.test(text), `${where}: too formal for spoken Roman Urdu`);
  if (english !== undefined) ok(digits(text) === digits(english), `${where}: numbers must match the English (${digits(english)} vs ${digits(text)})`);
}

// 1. Every answer option (history, locations, clues).
const options = [
  ...commonHistoryOptions.age, ...commonHistoryOptions.onset, ...commonHistoryOptions.duration, ...commonHistoryOptions.impact,
  ...regions.flatMap((region) => [...region.locations, ...region.clues]),
];
ok(options.length >= 177, "the checker has its 177+ options");
for (const option of options) good(RU_OPTIONS[option.id], `option ${option.id}`, option.label);
ok(Object.keys(RU_OPTIONS).every((id) => options.some((option) => option.id === id)), "no Roman Urdu option for an id that does not exist");

// 2. Regions and safety warnings (a warning must keep its urgency words: the advice always says what to do).
for (const region of regions) {
  const words = regionText("ru", region);
  good(words.label, `region ${region.id} label`);
  good(words.hint, `region ${region.id} hint`);
  ok(RU_REGIONS[region.id] !== undefined, `region ${region.id} has Roman Urdu`);
}
ok(redFlags.length >= 8, "the safety check has its warnings");
for (const flag of redFlags) {
  const words = flagText("ru", flag);
  good(words.label, `warning ${flag.id} label`, flag.label);
  good(words.advice, `warning ${flag.id} advice`, flag.advice);
  ok(RU_FLAGS[flag.id] !== undefined, `warning ${flag.id} has Roman Urdu`);
  if (/emergency|ambulance|1122|urgent/i.test(flag.advice)) ok(/emergency|1122|ambulance|urgent|jaldi|foran|abhi/i.test(words.advice), `warning ${flag.id}: the urgency must survive translation`);
}
good(RU_SAFETY_TITLE.emergency, "safety title emergency");
good(RU_SAFETY_TITLE.urgent, "safety title urgent");

// 3. Every pattern: name, summary and advice.
const adviceSentences = new Set(allConditionRules.map((rule) => rule.advice));
ok(allConditionRules.length >= 107, "the checker has its 107+ patterns");
for (const rule of allConditionRules) {
  const words = conditionText("ru", rule);
  ok(RU_CONDITIONS[rule.id] !== undefined, `pattern ${rule.id} has Roman Urdu`);
  good(words.plainName, `pattern ${rule.id} name`);
  good(words.summary, `pattern ${rule.id} summary`, rule.summary);
  good(words.advice, `pattern ${rule.id} advice`, rule.advice);
}
for (const advice of adviceSentences) ok(RU_ADVICE[advice] !== undefined, `advice sentence has Roman Urdu: ${advice.slice(0, 60)}`);
ok(Object.keys(RU_ADVICE).every((key) => adviceSentences.has(key)), "no Roman Urdu advice for a sentence the engine no longer uses");
ok(Object.keys(RU_CONDITIONS).every((id) => allConditionRules.some((rule) => rule.id === id)), "no Roman Urdu pattern for an id that does not exist");

// 4. Urgency, nerve hints, compatibility, fracture screening.
for (const [selected, pain] of [[new Set<string>(), null], [new Set(["impact_moderate"]), null], [new Set(["impact_high"]), null], [new Set<string>(), 9]] as const) {
  const care = getCarePriority(new Set(selected), pain);
  const words = careText("ru", care);
  good(words.label, `care "${care.label}" label`);
  good(words.detail, `care "${care.label}" detail`);
}
ok(RU_CARE.high.label !== RU_CARE.moderate.label && RU_CARE.moderate.label !== RU_CARE.mild.label, "the three urgency levels read differently");
for (const key of ["high", "moderate", "possible"] as const) good(RU_COMPAT[key], `compatibility ${key}`);
ok(compatText("ru", "High compatibility") !== compatText("ru", "Moderate compatibility") && compatText("ru", "Moderate compatibility") !== compatText("ru", "Possible"), "compatibility levels read differently");
for (const id of Object.keys(RU_NEURO)) { good(RU_NEURO[id].label, `nerve hint ${id} label`); good(RU_NEURO[id].detail, `nerve hint ${id} detail`); }
const neckHint = getNeurologicHint("neck", new Set(["clue_neck_c6_dist"]));
if (neckHint) ok(neuroText("ru", new Set(["clue_c6_dist"]), neckHint).label.length > 0, "nerve hint translates");

const kneeAll = new Set(["onset_trauma", "age_60_plus", "clue_knee_fibular_head_tender", "clue_knee_patella_isolated_tender", "clue_knee_cant_flex90", "clue_knee_no_weight_initial", "clue_knee_no4steps"]);
const ankleAll = new Set(["onset_trauma", "loc_ankle_lateral", "clue_ankle_no_weight_initial", "clue_ankle_no4steps", "clue_ankle_malleolus_tender", "clue_ankle_hindfoot_tender"]);
for (const [region, selected] of [["knee", kneeAll], ["ankle-foot", ankleAll]] as const) {
  const notice = getImagingNotice(region, selected);
  ok(notice !== null, `${region}: the fracture screen fires with every criterion`);
  if (!notice) continue;
  const words = imagingText("ru", notice);
  for (const [english, roman] of [[notice.title, words.title], [notice.body, words.body], ...notice.criteria.map((c, i) => [c, words.criteria[i]] as const)]) {
    ok(IMAGING_KEYS.includes(english), `${region}: fracture-screen text has Roman Urdu: ${english.slice(0, 50)}`);
    good(roman, `${region} fracture screen: ${english.slice(0, 40)}`, english);
  }
}

// 5. The screen's own words: both languages, same shape, nothing empty, numbers kept.
const shape = (value: unknown, path: string, out: string[] = []): string[] => {
  if (typeof value === "function") out.push(`${path}()`);
  else if (Array.isArray(value)) value.forEach((item, index) => shape(item, `${path}[${index}]`, out));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) shape(item, `${path}.${key}`, out);
  else out.push(path);
  return out;
};
ok(JSON.stringify(shape(CHECKER_COPY.en, "copy")) === JSON.stringify(shape(CHECKER_COPY.ru, "copy")), "the screen has the same words in English and Roman Urdu");
const strings = (value: unknown, path: string, out: Array<[string, string]> = []): Array<[string, string]> => {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => strings(item, `${path}[${index}]`, out));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) strings(item, `${path}.${key}`, out);
  return out;
};
for (const [path, text] of strings(CHECKER_COPY.ru, "copy")) good(text, `screen text ${path}`);
const fn = (copy: typeof CHECKER_COPY.en | typeof CHECKER_COPY.ru) => [copy.stepOf(2, 6), copy.clues.count(3), copy.result.urgency(2), copy.result.reported(3, 7), copy.result.title("Neck"), copy.result.exercisesBody(12)];
fn(CHECKER_COPY.en).forEach((en, index) => good(fn(CHECKER_COPY.ru)[index], `screen function ${index}`, en));
ok(CHECKER_COPY.ru.emergencyBody.includes("1122"), "the emergency line keeps the 1122 number in Roman Urdu");
ok(CHECKER_COPY.ru.result.headlineNot.length > 0 && /diagnosis/i.test(CHECKER_COPY.ru.result.headlineNot), "the headline answer says it is a screening pattern, not a confirmed diagnosis");
ok(/diagnosis/i.test(CHECKER_COPY.ru.result.disclaimer) || /diagnosis/i.test(CHECKER_COPY.ru.result.lead), "Roman Urdu keeps the screening-not-diagnosis wording");

if (failures.length) {
  console.error(failures.map((message) => `✗ ${message}`).join("\n"));
  console.error(`\n${failures.length} of ${checks} checks failed.`);
  process.exit(1);
}
console.log(`Symptom checker Roman Urdu: ${checks} checks passed (${options.length} options, ${redFlags.length} warnings, ${allConditionRules.length} patterns).`);
