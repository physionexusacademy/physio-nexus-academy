import { applyUpdates, isReady, MAX_PATIENT_MESSAGE, MAX_TURNS, nextFocus, type FieldKey, type IntakeDraft, type Lang } from "./intake-spec.ts";
import { guardReply } from "./guard.ts";
import { buildIntakeMessages, type ChatMessage, type Turn } from "./prompts.ts";
import { CLOSING, extractFromAnswer, QUESTIONS, scriptedReply, TRY_AGAIN } from "./questions.ts";
import { screenPatientText, type IntakeSafety } from "./safety.ts";
import { LANGUAGE_REMINDER, replyLanguage, replyMatchesLanguage } from "./reply-lang.ts";

/**
 * One turn of the intake conversation. The order of the steps is the safety design:
 *   1. a plain-code safety screen runs first, and on a hit the model is never called;
 *   2. the model's reply is checked by the guard and its notes are validated before they touch the form;
 *   3. whether the interview is finished is decided by code (every required field known), never by the model;
 *   4. if the model is unavailable, breaks a rule or returns nonsense, a scripted warm question carries the conversation on.
 * The model call is injected, so every one of these paths is tested without a model.
 * Every reply is in the language the patient WRITES in (reply-lang.ts), not the language switch of the page.
 */
export type ModelCall = (messages: ChatMessage[]) => Promise<{ text: string; model: string } | null>;
export type TurnInput = { lang: Lang; history: Turn[]; draft: IntakeDraft; patientText: string; turnNumber: number };
export type TurnResult = {
  reply: string;
  draft: IntakeDraft;
  ready: boolean;
  status: "open" | "completed" | "safety_stop";
  safety: IntakeSafety | null;
  model: string;
  fallback: boolean;
  focus: FieldKey | null;
};

type Parsed = { reply: unknown; updates: unknown; ready: unknown };

/** Finds the JSON object in a model answer, tolerating code fences and text around it. */
export function parseModelJson(text: string): Parsed | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(text.slice(start, end + 1));
    return value && typeof value === "object" && typeof value.reply === "string" ? (value as Parsed) : null;
  } catch {
    return null;
  }
}

export async function runIntakeTurn(input: TurnInput, deps: { callModel: ModelCall }): Promise<TurnResult> {
  const text = input.patientText.trim().slice(0, MAX_PATIENT_MESSAGE);
  const focus = nextFocus(input.draft);
  const lang = replyLanguage(text, input.history, input.lang);

  // 1. Safety first: the model is not consulted.
  const safety = screenPatientText(text);
  if (safety) {
    return { reply: safety.message[lang], draft: input.draft, ready: false, status: "safety_stop", safety, model: "safety", fallback: false, focus };
  }

  // 2. Ask the model (one repair attempt if it does not return the JSON we asked for).
  const messages = buildIntakeMessages({ lang, history: input.history, draft: input.draft, focus, patientText: text });
  let parsed: Parsed | null = null;
  let model = "script";
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    const answer = await deps.callModel(
      attempt === 0 ? messages : [...messages, { role: "user", content: `Reply again with ONLY the JSON object described in the instructions, nothing else. ${LANGUAGE_REMINDER[lang]}` }],
    );
    if (!answer) break;
    model = answer.model;
    const candidate = parseModelJson(answer.text);
    // a reply in the wrong language (English to someone writing Roman Urdu) is not used: ask once more, then the scripted question answers in the right one
    if (candidate && typeof candidate.reply === "string" && !replyMatchesLanguage(candidate.reply, lang)) continue;
    parsed = candidate;
  }

  // 3. What did we learn? The model's notes are validated; without a model, plain code reads the answer to the question that was just asked.
  const learned = parsed ? parsed.updates : extractFromAnswer(focus, text);
  const { draft } = applyUpdates(input.draft, learned);
  const changed = JSON.stringify(draft) !== JSON.stringify(input.draft);
  let fallback = !parsed;

  // 4. What do we say? The model's reply if it passes the guard and agrees with the code about being finished, otherwise a scripted question.
  const ready = isReady(draft) || input.turnNumber >= MAX_TURNS;
  const next = nextFocus(draft);
  let reply = "";
  if (parsed) {
    const guarded = guardReply(parsed.reply);
    if (guarded.ok && (parsed.ready === true) === ready) reply = guarded.text;
    else fallback = true;
  }
  if (!reply) {
    const question = next ? QUESTIONS[next] : undefined;
    if (ready) reply = CLOSING[lang];
    else if (!parsed && !changed && question) reply = `${TRY_AGAIN[lang]} ${question[lang]}`;
    else reply = scriptedReply(draft, next, lang, input.turnNumber);
  }
  return { reply, draft, ready, status: ready ? "completed" : "open", safety: null, model, fallback, focus: next };
}
