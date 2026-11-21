import type { Bi } from "../types.ts";
import { guardCoachReply } from "./coach-guard.ts";
import { buildCoachMessages } from "./coach-prompts.ts";
import { screenCoachText, type CoachSafety } from "./coach-safety.ts";
import { answerFor, COACH_LIMIT, COACH_MENU, conversational, detectIntent, MAX_COACH_MESSAGE, MAX_COACH_TURNS, maskExerciseNames, NOTED_FOR_PHYSIO, pickExercise, type CoachContext, type Intent } from "./coach-spec.ts";
import { parseModelJson, type ModelCall } from "./intake-turn.ts";
import type { Lang } from "./intake-spec.ts";
import type { Turn } from "./prompts.ts";
import { LANGUAGE_REMINDER, replyLanguage, replyMatchesLanguage } from "./reply-lang.ts";

/**
 * One turn of the exercise coach. The order of the steps is the safety design:
 *   1. a plain-code safety screen runs first, and on a hit the model is never called: the patient is told to stop and the physiotherapist is alerted;
 *   2. questions that only the physiotherapist can answer (changing the plan, medicines, diagnosis, outcome) are routed to them, again without the model;
 *   3. everyday questions about an exercise (how, how many, breathing, mistakes, equipment, what if it hurts) are answered from the prescription and the
 *      reviewed library, again without the model: exact, instant, free and identical every time;
 *   4. only a free-form technique question reaches the model, and its reply is used only if the guard passes it; otherwise the scripted menu answers.
 * Every reply, scripted or from the model, is in the language the patient WRITES in (reply-lang.ts), not the language switch of the page.
 * The model call is injected, so every path is tested without a model.
 */
export type CoachTurnInput = { lang: Lang; history: Turn[]; patientText: string; ctx: CoachContext; focus: number | null; turnNumber: number; catalogue?: Bi[] };
export type CoachTurnResult = {
  reply: string;
  status: "open" | "completed" | "safety_stop";
  safety: CoachSafety | null;
  model: string;
  fallback: boolean;
  /** What the physiotherapist should be told: a safety problem (urgent) or a question (attention). */
  notify: "safety" | "question" | null;
  how: "safety" | "limit" | "script" | "model" | "menu";
  intent: Intent | null;
  exercise: number | null;
};

export async function runCoachTurn(input: CoachTurnInput, deps: { callModel: ModelCall }): Promise<CoachTurnResult> {
  const text = input.patientText.trim().slice(0, MAX_COACH_MESSAGE);
  const base = { safety: null, model: "script", fallback: false, notify: null, intent: null, exercise: null } as const;
  const lang = replyLanguage(text, input.history, input.lang);

  // 0. a long conversation ends (the physiotherapist reads it all)
  if (input.turnNumber > MAX_COACH_TURNS) return { ...base, reply: COACH_LIMIT[lang], status: "completed", how: "limit" };

  // 1. safety first: the model is not consulted
  const safety = screenCoachText(maskExerciseNames(text, input.ctx));
  if (safety) return { ...base, reply: safety.message[lang], status: "safety_stop", safety, model: "safety", notify: "safety", how: "safety" };

  // 2 and 3. answers made from the plan and the library
  const intent = detectIntent(text, input.ctx);
  if (intent) {
    const exercise = pickExercise(text, input.ctx, input.focus);
    const answer = answerFor(intent, exercise, input.ctx, lang);
    return { ...base, reply: conversational(intent, answer.text, lang, input.turnNumber), status: "open", notify: answer.notify ? "question" : null, how: "script", intent, exercise: exercise?.index ?? null };
  }

  // 4. a free-form question about technique: the model, behind the guard
  const messages = buildCoachMessages({ lang, history: input.history, ctx: input.ctx, focus: input.focus, patientText: text });
  let parsed: { reply: unknown; needs_therapist?: unknown } | null = null;
  let model = "script";
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    const answer = await deps.callModel(attempt === 0 ? messages : [...messages, { role: "user", content: `Reply again with ONLY the JSON object described in the instructions, nothing else. ${LANGUAGE_REMINDER[lang]}` }]);
    if (!answer) break;
    model = answer.model;
    const json = parseModelJson(answer.text) as { reply: unknown; needs_therapist?: unknown } | null;
    let candidate: { reply: unknown; needs_therapist?: unknown } | null = null;
    if (json && typeof json.reply === "string") candidate = json;
    else {
      // some models answer in plain text: accept it as the reply (the guard still applies)
      const plain = answer.text.trim();
      if (plain && !/[{}]/.test(plain)) candidate = { reply: plain };
    }
    // a reply in the wrong language (English to someone writing Roman Urdu) is not used: ask once more, then the scripted menu answers in the right one
    if (candidate && typeof candidate.reply === "string" && !replyMatchesLanguage(candidate.reply, lang)) continue;
    parsed = candidate;
  }
  if (parsed) {
    const guarded = guardCoachReply(parsed.reply, input.ctx, input.catalogue ?? []);
    if (guarded.ok) {
      const question = parsed.needs_therapist === true;
      return { ...base, reply: question && !guarded.text.includes(NOTED_FOR_PHYSIO[lang]) ? `${guarded.text} ${NOTED_FOR_PHYSIO[lang]}` : guarded.text, status: "open", model, notify: question ? "question" : null, how: "model", exercise: input.focus };
    }
  }
  return { ...base, reply: COACH_MENU[lang], status: "open", model, fallback: true, how: "menu", exercise: input.focus };
}
