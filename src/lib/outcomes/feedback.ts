import { INSTRUMENT_BY_ID } from "./instruments.ts";
import { interpretChange, measureImprovement } from "./interpret.ts";
import { dueList, type PlanInput } from "./plan.ts";
import type { Bi, ChangeBand, OutcomeLang, Score, TimepointKey } from "./types.ts";
import { TIMEPOINT_LABEL } from "./types.ts";

/**
 * Feedback for the patient about their outcome measures. The FACTS are worked out by fixed rules from the stored scores (nothing here invents a number), and
 * a DRAFT message is written from the facts in English or natural spoken Roman Urdu. The physiotherapist reads it, edits it and sends it; nothing reaches the
 * patient on its own. An AI service may be asked to smooth the wording of the draft, but only under the rules in checkPolished(): it may not add a number,
 * a diagnosis, a treatment, a medicine, a promise or a link.
 */
export type ResponseLike = { instrument: string; timepoint: TimepointKey; score: Score; answers?: Record<string, unknown> };

export type PatientFact = { instrument: string; name: Bi; latest: TimepointKey; first: number | null; last: number | null; improvement: number | null; percent: number | null; band: ChangeBand };
export type MeasureFact = { instrument: string; label: Bi; unit: string; first: number; last: number; improvement: number };
export type OutcomeFacts = { patient: PatientFact[]; measures: MeasureFact[]; open: number; late: number; worse: boolean; risk: string | null; groc: number | null };

const byTime = (rows: ResponseLike[]) => {
  const order: TimepointKey[] = ["baseline", "w1", "w2", "w4", "w6", "w12", "discharge"];
  return [...rows].sort((a, b) => order.indexOf(a.timepoint) - order.indexOf(b.timepoint));
};

export function collectFacts(plan: PlanInput, responses: ResponseLike[], now: Date): OutcomeFacts {
  const facts: OutcomeFacts = { patient: [], measures: [], open: 0, late: 0, worse: false, risk: null, groc: null };
  for (const item of plan.items) {
    const instrument = INSTRUMENT_BY_ID[item.instrument];
    if (!instrument) continue;
    const rows = byTime(responses.filter((r) => r.instrument === item.instrument));
    if (rows.length === 0) continue;
    const first = rows[0];
    const last = rows[rows.length - 1];
    if (instrument.id === "sbst") facts.risk = first.score.band;
    if (instrument.id === "groc") {
      const read = interpretChange(instrument, null, last.score);
      facts.groc = last.score.primary;
      facts.patient.push({ instrument: instrument.id, name: instrument.name, latest: last.timepoint, first: null, last: last.score.primary, improvement: read.improvement, percent: null, band: read.band });
      if (read.band === "worse" || read.band === "much_worse") facts.worse = true;
      continue;
    }
    if (instrument.form.type === "measures") {
      if (rows.length < 2) continue;
      for (const field of instrument.form.fields) {
        const a = first.score.parts[field.id];
        const b = last.score.parts[field.id];
        if (a === undefined || b === undefined) continue;
        facts.measures.push({ instrument: instrument.id, label: field.label, unit: field.unit, first: a, last: b, improvement: measureImprovement(field.better, a, b) });
      }
      continue;
    }
    if (rows.length < 2 || instrument.kind !== "patient_reported" || instrument.id === "sbst") continue;
    const read = interpretChange(instrument, first.score, last.score);
    facts.patient.push({ instrument: instrument.id, name: instrument.name, latest: last.timepoint, first: first.score.primary, last: last.score.primary, improvement: read.improvement, percent: read.percent, band: read.band });
    if (read.band === "worse" || read.band === "much_worse") facts.worse = true;
  }
  const answered = new Set(responses.map((r) => `${r.instrument}:${r.timepoint}`));
  const open = dueList(plan, answered, now).filter((d) => d.state !== "upcoming");
  facts.open = open.length;
  facts.late = open.filter((d) => d.state === "late").length;
  return facts;
}

const num = (n: number) => String(Math.round(n * 10) / 10);

const LINES: Record<string, (f: PatientFact, lang: OutcomeLang) => string> = {
  nprs: (f, lang) => {
    const pct = f.percent !== null && f.improvement !== null && f.improvement > 0 ? ` (${num(Math.abs(f.percent))}% ${lang === "ru" ? "kam" : "lower"})` : f.percent !== null && f.improvement !== null && f.improvement < 0 ? ` (${num(Math.abs(f.percent))}% ${lang === "ru" ? "zyada" : "higher"})` : "";
    return lang === "ru"
      ? `Dard: aap ka pichle hafte ka average dard ${num(f.first ?? 0)}/10 se ${num(f.last ?? 0)}/10 ho gaya${pct}.`
      : `Pain: your average pain over the week went from ${num(f.first ?? 0)}/10 to ${num(f.last ?? 0)}/10${pct}.`;
  },
  psfs: (f, lang) => (lang === "ru"
    ? `Aap ke apne kaam (PSFS): average ${num(f.first ?? 0)} se ${num(f.last ?? 0)} (10 mein se) ho gaya.`
    : `Your own activities (PSFS): the average went from ${num(f.first ?? 0)} to ${num(f.last ?? 0)} out of 10.`),
  groc: (f, lang) => (lang === "ru"
    ? `Aap ne shuru ke muqable mein apni halat ko ${f.last !== null && f.last > 0 ? "+" : ""}${f.last} rate kiya.`
    : `Compared with the start, you rated your condition ${f.last !== null && f.last > 0 ? "+" : ""}${f.last} (on a scale from -7 to +7).`),
  rmdq24: (f, lang) => (lang === "ru"
    ? `Roz ke kaamon mein rukawat (RMDQ): ${num(f.first ?? 0)} se ${num(f.last ?? 0)} (24 mein se).`
    : `Limits in daily activities (RMDQ): ${num(f.first ?? 0)} to ${num(f.last ?? 0)} out of 24.`),
};

const TAIL: Record<ChangeBand, Bi> = {
  much_better: { en: "That is a clear improvement.", ru: "Yeh saaf behtari hai." },
  better: { en: "That is an improvement.", ru: "Yeh behtari hai." },
  no_important_change: { en: "That is about the same as at the start.", ru: "Yeh shuru ke jaisa hi hai." },
  worse: { en: "That is worse than at the start.", ru: "Yeh shuru se zyada kharab hai." },
  much_worse: { en: "That is clearly worse than at the start.", ru: "Yeh shuru se saaf kharab hai." },
  not_comparable: { en: "", ru: "" },
};

const SAFETY: Bi = {
  en: "Please tell your physiotherapist about this at your next contact. If you notice new weakness or numbness, or trouble controlling your bladder or bowels, seek urgent medical care.",
  ru: "Meherbani karke apne agle rabte par physiotherapist ko yeh zaroor batayein. Agar nayi kamzori ya sunn-pan ho, ya peshab/pakhane par control mein mushkil ho to foran medical madad lein.",
};

/** A first draft in the chosen language. It says only what the facts say, and always ends by saying who it is from. */
export function draftFeedback(facts: OutcomeFacts, lang: OutcomeLang): string {
  const out: string[] = [lang === "ru" ? "Aap ke sawalnaamon ke natayej ka chhota sa update:" : "A short update from your outcome questionnaires:"];
  for (const f of facts.patient) {
    const line = LINES[f.instrument];
    if (!line) continue;
    out.push(`- ${line(f, lang)} ${TAIL[f.band][lang]}`.trim());
  }
  for (const m of facts.measures) {
    const sign = m.improvement > 0 ? "+" : "";
    out.push(lang === "ru"
      ? `- ${m.label.ru}: ${num(m.first)} se ${num(m.last)} ${m.unit} (${sign}${num(m.improvement)} ${m.unit} ${m.improvement > 0 ? "behtar" : m.improvement < 0 ? "kam" : "barabar"}).`
      : `- ${m.label.en}: ${num(m.first)} to ${num(m.last)} ${m.unit} (${sign}${num(m.improvement)} ${m.unit}${m.improvement > 0 ? " better" : m.improvement < 0 ? " worse" : ", the same"}).`);
  }
  if (out.length === 1) out.push(lang === "ru" ? "- Abhi tak itne jawab nahi aaye ke koi tabdeeli dikhayi ja sake." : "- There are not enough answers yet to show a change.");
  if (facts.open > 0) out.push(lang === "ru" ? `- ${facts.open} sawalnaame abhi baaqi hain: meherbani karke jab ho sake jawab dein.` : `- ${facts.open} questionnaire(s) are still waiting: please answer them when you can.`);
  if (facts.worse) out.push(SAFETY[lang]);
  out.push(lang === "ru" ? "— Aap ka physiotherapist" : "— Your physiotherapist");
  return out.join("\n");
}

export const WORDING_FOR_TIMEPOINT = (tp: TimepointKey, lang: OutcomeLang) => TIMEPOINT_LABEL[tp][lang];

/** Every number in a text, so a polished text can be held to the numbers of the draft it came from. */
export const numbersIn = (text: string): string[] => (text.match(/\d+(?:\.\d+)?/g) ?? []).map((n) => String(Number(n)));

const FORBIDDEN = /(https?:\/\/|www\.|\S+@\S+\.\S+|\b(paracetamol|panadol|ibuprofen|brufen|diclofenac|voltaren|naproxen|tramadol|aspirin|steroid|cortisone|painkiller|antibiotic)\b|\bdiagnos\w*|\b(guarantee\w*|definitely|100\s?%)\b)/i;

/**
 * Holds an AI-smoothed text to the draft it came from: same numbers (none added, none dropped), no link, medicine, diagnosis or promise, a sensible length, still
 * signed as from the physiotherapist, and the safety sentence kept when the draft had it. Anything else is refused and the draft is used unchanged.
 */
export function checkPolished(draft: string, polished: string): { ok: true; text: string } | { ok: false; reason: string } {
  const text = polished.replace(/```[\s\S]*?```/g, " ").replace(/[*_`#]+/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < 20 || text.length > 1500) return { ok: false, reason: "length" };
  if (FORBIDDEN.test(text)) return { ok: false, reason: "forbidden content" };
  const before = numbersIn(draft).sort().join(",");
  const after = numbersIn(text).sort().join(",");
  if (before !== after) return { ok: false, reason: "numbers changed" };
  if (/urgent medical care|foran medical madad/i.test(draft) && !/urgent medical care|foran medical madad/i.test(text)) return { ok: false, reason: "safety sentence dropped" };
  if (!/physiotherapist/i.test(text)) return { ok: false, reason: "not signed" };
  return { ok: true, text };
}
