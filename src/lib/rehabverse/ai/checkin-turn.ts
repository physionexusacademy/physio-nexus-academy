import { guardAck } from "./checkin-guard.ts";
import { buildCheckinMessages, type CheckinContext } from "./checkin-prompts.ts";
import { flagsForAlert, flagsFromText, readSigns, screenCheckinText } from "./checkin-safety.ts";
import { MAX_CHECKIN_MESSAGE, MAX_CHECKIN_TURNS, isAnswered, nextStep, type CheckinDraft, type CheckinStep } from "./checkin-shared.ts";
import { AFTER_STOP, applyReading, CHECKIN_STOP, isPlainAck, asksPhysio, FOR_PHYSIO, HELP, HIGH_PAIN, LIMIT, QUESTION, readResponse, readStepAnswer, scriptedAck, summaryText, TRY_AGAIN, UNCLEAR_SIGNS } from "./checkin-spec.ts";
import type { CoachSafety } from "./coach-safety.ts";
import type { ModelCall } from "./intake-turn.ts";
import type { Lang } from "./intake-spec.ts";
import type { Turn } from "./prompts.ts";
import { LANGUAGE_REMINDER, replyLanguage, replyMatchesLanguage } from "./reply-lang.ts";

/**
 * One turn of the recovery check-in chat. The order of the steps is the safety design:
 *   1. a plain-code safety screen runs first (after removing plain denials such as "no chest pain"); on a hit the model is never called, the
 *      patient is told to stop, the warning sign is pre-ticked on their form, and the physiotherapist is told;
 *   2. the safety question is asked and read by code, never by the model, and a "yes" always stops the chat;
 *   3. the other answers are read by code first; the model only helps with free wording and writes one short acknowledgement, which a guard checks;
 *   4. what is asked next, and whether the chat is finished, is decided by code. The patient's own form is what gets saved.
 * The model call is injected, so every path is tested without a model.
 * Every reply is in the language the patient WRITES in (reply-lang.ts), not the language switch of the page.
 */
export type CheckinTurnInput = { lang: Lang; history: Turn[]; draft: CheckinDraft; patientText: string; turnNumber: number; ctx: CheckinContext };
export type CheckinTurnResult = {
  reply: string;
  draft: CheckinDraft;
  status: "open" | "completed" | "safety_stop";
  safety: CoachSafety | null;
  model: string;
  fallback: boolean;
  /** What the physiotherapist should be told: a warning sign (urgent) or something to look at (attention). */
  notify: "safety" | "question" | null;
  alert: string | null;
  how: "safety" | "script" | "model" | "limit" | "physio";
  step: CheckinStep | null;
};

type Parsed = { ack?: unknown; updates?: unknown; needs_therapist?: unknown };

/** Finds the JSON object in a model answer, tolerating code fences and text around it. */
export function parseCheckinJson(text: string): Parsed | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(text.slice(start, end + 1));
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Parsed) : null;
  } catch {
    return null;
  }
}

export async function runCheckinTurn(input: CheckinTurnInput, deps: { callModel: ModelCall }): Promise<CheckinTurnResult> {
  const text = input.patientText.trim().slice(0, MAX_CHECKIN_MESSAGE);
  const lang = replyLanguage(text, input.history, input.lang);
  let draft: CheckinDraft = applyReading(input.draft, "note", null);
  const base = { safety: null, model: "script", fallback: false, notify: null, alert: null, step: nextStep(draft) } as const;

  // 0. a long conversation ends: what was understood is already in the form
  if (input.turnNumber > MAX_CHECKIN_TURNS) return { ...base, draft: { ...draft, done: true }, reply: LIMIT[lang], status: "completed", how: "limit" };

  // 1. safety first: the model is not consulted
  const alert = screenCheckinText(text);
  if (alert) {
    const flags = flagsForAlert(alert.kind, text);
    draft = { ...draft, signs: "reported", flags: [...new Set([...draft.flags, ...flags])], done: true };
    return { ...base, draft, reply: `${alert.message[lang]} ${AFTER_STOP(draft.flags.length > 0)[lang]}`, status: "safety_stop", safety: alert, model: "safety", notify: "safety", alert: alert.kind, how: "safety", step: null };
  }

  const step = nextStep(draft);
  if (step === null) return { ...base, draft: { ...draft, done: true }, reply: summaryText(draft, lang), status: "open", how: "script", step: null };
  const tries = (draft.tries[step] ?? 0) + 1;
  let notify: "question" | null = asksPhysio(text) ? "question" : null;
  let alertKind: string | null = notify ? "question" : null;

  // 2. the safety question is read by code
  if (step === "signs") {
    const signs = readSigns(text);
    if (signs.answer === "yes") {
      draft = { ...draft, signs: "reported", flags: [...new Set([...draft.flags, ...signs.flags])], done: true };
      const stop: CoachSafety = { level: "urgent", kind: "reported-sign", message: CHECKIN_STOP };
      return { ...base, draft, reply: `${CHECKIN_STOP[lang]} ${AFTER_STOP(draft.flags.length > 0)[lang]}`, status: "safety_stop", safety: stop, model: "safety", notify: "safety", alert: "reported-sign", how: "safety", step: null };
    }
    if (signs.answer === "no") draft = { ...draft, signs: "no" };
    else if (tries >= 2) draft = { ...draft, signs: "unclear", tries: { ...draft.tries, signs: tries } };
    else draft = { ...draft, tries: { ...draft.tries, signs: tries } };
    if (draft.signs === null) return { ...base, draft, reply: `${TRY_AGAIN[lang]} ${HELP.signs[lang]}`, status: "open", notify, alert: alertKind, how: "script", step: "signs" };
    return finish(input, lang, draft, notify, alertKind, { ack: draft.signs === "unclear" ? UNCLEAR_SIGNS[lang] : scriptedAck({ pain: null, response: null }, lang, input.turnNumber), model: "script", fallback: false, how: "script" });
  }

  // 3. read the answer in plain code, then ask the model to help and to write the acknowledgement
  const before = draft;
  let reading = readStepAnswer(step, text);
  // "no, but a little tingly": a "no" that names a symptom is not taken as a no
  if (step === "new_symptoms" && reading?.new_symptoms === false && flagsFromText(text).length) reading = null;
  draft = applyReading(draft, step, reading);
  if (draft.symptom_response === null && step !== "response") {
    const response = readResponse(text);
    if (response) draft = { ...draft, symptom_response: response };
  }

  let parsed: Parsed | null = null;
  let model = "script";
  const messages = buildCheckinMessages({ lang, history: input.history, ctx: input.ctx, draft, step, patientText: text });
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    const answer = await deps.callModel(attempt === 0 ? messages : [...messages, { role: "user", content: `Reply again with ONLY the JSON object described in the instructions, nothing else. ${LANGUAGE_REMINDER[lang]}` }]);
    if (!answer) break;
    model = answer.model;
    const candidate = parseCheckinJson(answer.text);
    // an acknowledgement in the wrong language (English to someone writing Roman Urdu) is not used: ask once more, then the scripted one is in the right language
    if (candidate && typeof candidate.ack === "string" && !replyMatchesLanguage(candidate.ack, lang)) continue;
    parsed = candidate;
  }
  if (parsed) {
    const updates = parsed.updates && typeof parsed.updates === "object" ? (parsed.updates as Record<string, unknown>) : {};
    const said = updates.symptom_response;
    if (draft.symptom_response === null && (said === "better" || said === "same" || said === "worse") && (step === "response" || text.length >= 12)) draft = { ...draft, symptom_response: said };
    if (draft.new_symptoms === null && ((updates.new_symptoms === true) || (updates.new_symptoms === false && step === "new_symptoms"))) draft = { ...draft, new_symptoms: updates.new_symptoms };
    if (parsed.needs_therapist === true && !notify) { notify = "question"; alertKind = "question"; }
  }

  // 4. understood? if not, ask again (twice at most, then it is left for the form)
  if (!isAnswered(draft, step)) {
    if (tries >= 2) draft = { ...draft, skipped: [...new Set([...draft.skipped, step])] };
    else return { ...base, draft: { ...draft, tries: { ...draft.tries, [step]: tries } }, reply: `${TRY_AGAIN[lang]} ${HELP[step][lang]}`, status: "open", model, fallback: !parsed, notify, alert: alertKind, how: parsed ? "model" : "script", step };
  }
  const highPain = draft.pain !== null && before.pain === null && draft.pain >= 8;
  if (highPain) { notify = "question"; alertKind = alertKind ?? "high-pain"; }

  const learned = { pain: before.pain === null ? draft.pain : null, response: before.symptom_response === null ? draft.symptom_response : null };
  const guarded = parsed ? guardAck(parsed.ack, text) : null;
  const ack = guarded?.ok ? guarded.text : scriptedAck(learned, lang, input.turnNumber);
  return finish(input, lang, draft, notify, alertKind, { ack, model, fallback: !(guarded?.ok), how: guarded?.ok ? "model" : "script", highPain });
}

/** Puts the acknowledgement together with the next question (or the summary when every question is answered). */
function finish(
  input: CheckinTurnInput, lang: Lang, draft: CheckinDraft, notify: "question" | null, alertKind: string | null,
  said: { ack: string; model: string; fallback: boolean; how: "script" | "model"; highPain?: boolean },
): CheckinTurnResult {
  const next = nextStep(draft);
  const extras = [notify === "question" && alertKind === "question" ? FOR_PHYSIO[lang] : "", said.highPain ? HIGH_PAIN[lang] : ""].filter(Boolean);
  const done = next === null;
  const closing = done ? summaryText(draft, lang) : QUESTION[next][lang];
  const reply = [done && isPlainAck(said.ack) ? "" : said.ack, ...extras, closing].filter(Boolean).join(" ");
  return { reply, draft: done ? { ...draft, done: true } : draft, status: "open", safety: null, model: said.model, fallback: said.fallback, notify, alert: alertKind, how: said.how, step: next };
}
