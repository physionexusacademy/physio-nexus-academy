/**
 * Roman Urdu for the MSK symptom checker, in one place: the checker and the RehabVerse intake both read their words from here.
 * English is the source of truth (src/lib/msk-symptom-checker.ts); a word without a Roman Urdu entry falls back to English, and
 * scripts/validate-symptom-checker-ru.ts fails when any option, region, pattern, warning or advice sentence is missing.
 */
import { featureLabels, type ConditionRule, type ImagingNotice, type RedFlag, type RegionConfig, type ScoredCondition } from "../msk-symptom-checker.ts";
import { RU_FLAGS, RU_HISTORY, RU_OPTIONS_A, RU_REGIONS } from "./ru-options-a.ts";
import { RU_OPTIONS_B } from "./ru-options-b.ts";
import { RU_CONDITIONS_A } from "./ru-conditions-a.ts";
import { RU_CONDITIONS_B } from "./ru-conditions-b.ts";
import { RU_CONDITIONS_C } from "./ru-conditions-c.ts";
import { RU_ADVICE, RU_CARE, RU_COMPAT, RU_NEURO, RU_SAFETY_TITLE } from "./ru-text.ts";

export type CheckerLang = "en" | "ru";

export const RU_OPTIONS: Record<string, string> = { ...RU_HISTORY, ...RU_OPTIONS_A, ...RU_OPTIONS_B };
export const RU_CONDITIONS = { ...RU_CONDITIONS_A, ...RU_CONDITIONS_B, ...RU_CONDITIONS_C };

const idByLabel = new Map<string, string>([...featureLabels].map(([id, label]) => [label, id] as const));

/** An answer option (or its English label, as the scorer returns it) in the chosen language. */
export const optionText = (lang: CheckerLang, id: string, english: string) => (lang === "ru" ? RU_OPTIONS[id] ?? english : english);
export const labelText = (lang: CheckerLang, englishLabel: string) => (lang === "ru" ? RU_OPTIONS[idByLabel.get(englishLabel) ?? ""] ?? englishLabel : englishLabel);

export const regionText = (lang: CheckerLang, region: Pick<RegionConfig, "id" | "label" | "hint">) =>
  lang === "ru" && RU_REGIONS[region.id] ? RU_REGIONS[region.id] : { label: region.label, hint: region.hint };

export const flagText = (lang: CheckerLang, flag: RedFlag) => (lang === "ru" && RU_FLAGS[flag.id] ? RU_FLAGS[flag.id] : { label: flag.label, advice: flag.advice });
export const safetyTitle = (lang: CheckerLang, level: "emergency" | "urgent", english: string) => (lang === "ru" ? RU_SAFETY_TITLE[level] : english);

export const conditionText = (lang: CheckerLang, condition: Pick<ConditionRule, "id" | "plainName" | "summary" | "advice">) => {
  const ru = lang === "ru" ? RU_CONDITIONS[condition.id] : undefined;
  return { plainName: ru?.plainName ?? condition.plainName, summary: ru?.summary ?? condition.summary, advice: lang === "ru" ? RU_ADVICE[condition.advice] ?? condition.advice : condition.advice };
};

export const compatText = (lang: CheckerLang, english: string) => {
  if (lang !== "ru") return english;
  return english === "High compatibility" ? RU_COMPAT.high : english === "Moderate compatibility" ? RU_COMPAT.moderate : RU_COMPAT.possible;
};

const careKey = (english: string) => (/^Prompt/.test(english) ? "high" : /^Professional/.test(english) ? "moderate" : "mild");
export const careText = (lang: CheckerLang, care: { label: string; detail: string }) => (lang === "ru" ? RU_CARE[careKey(care.label)] : care);

export const neuroText = (lang: CheckerLang, selected: Set<string>, hint: { label: string; detail: string }) => {
  if (lang !== "ru") return hint;
  const id = [...selected].find((item) => RU_NEURO[item]);
  return id ? RU_NEURO[id] : hint;
};

/** "X and Y look very similar..." (the English sentence is built from two pattern names). */
export const overlapText = (lang: CheckerLang, results: ScoredCondition[], english: string | null) => {
  if (!english || lang !== "ru" || results.length < 2) return english;
  const a = conditionText("ru", results[0].condition).plainName;
  const b = conditionText("ru", results[1].condition).plainName;
  return `${a} aur ${b} sirf sawalon se bohat milte julte lagte hain. Inhein alag karne ke liye hands-on examination zaroori hai.`;
};

const RU_IMAGING: Record<string, string> = {
  "Knee X-ray assessment may be indicated": "Knee ke X-ray assessment ki zaroorat ho sakti hai",
  "Ankle X-ray assessment may be indicated": "Ankle ke X-ray assessment ki zaroorat ho sakti hai",
  "Your answers meet one or more Ottawa Knee Rule fracture-screening criteria after an acute injury. This does not mean a fracture is confirmed, but an in-person medical assessment and consideration of knee radiography are appropriate before relying on a routine soft-tissue diagnosis.":
    "Achanak chot ke baad aap ke jawab Ottawa Knee Rule ke fracture-screening criteria mein se ek ya zyada poore karte hain. Iska matlab yeh nahi ke fracture confirm hai, lekin routine soft-tissue diagnosis par bharosa karne se pehle in-person assessment karwana aur knee ke X-ray ke baare mein sochna theek rahega.",
  "Your answers meet one or more Ottawa-style ankle fracture-screening criteria after an acute injury. This does not confirm a fracture, but an in-person assessment and consideration of radiography are appropriate.":
    "Achanak chot ke baad aap ke jawab Ottawa-style ankle fracture-screening criteria mein se ek ya zyada poore karte hain. Isse fracture confirm nahi hota, lekin in-person assessment aur X-ray ke baare mein sochna theek rahega.",
  "Age 55 years or older": "Age 55 saal ya us se zyada",
  "Focal tenderness over the fibular head": "Fibula head (knee ke neeche bahar wali haddi ke ubhaar) par dabane se khaas dard",
  "Isolated bony tenderness over the kneecap": "Sirf kneecap ki haddi par dabane se dard",
  "Unable to flex the knee to about 90°": "Knee ko taqreeban 90° tak mor na sakna",
  "Unable to bear weight immediately after the injury": "Chot ke foran baad wazan na utha sakna",
  "Unable to take 4 weight-bearing steps": "Wazan daal kar 4 qadam na chal sakna",
  "Focal bony tenderness over an ankle bone": "Ankle ki haddi par dabane se khaas dard",
  "Focal bony tenderness over the hindfoot/heel region": "Heel / paaon ke peechay wali haddi par dabane se khaas dard",
};
export const imagingText = (lang: CheckerLang, notice: ImagingNotice): ImagingNotice =>
  lang === "ru" ? { title: RU_IMAGING[notice.title] ?? notice.title, body: RU_IMAGING[notice.body] ?? notice.body, criteria: notice.criteria.map((item) => RU_IMAGING[item] ?? item) } : notice;
export const IMAGING_KEYS = Object.keys(RU_IMAGING);
