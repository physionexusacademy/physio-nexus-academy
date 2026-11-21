import "server-only";
import { chatProvider, fromEnvironment } from "./provider.ts";
import { DEFAULT_GROQ_MODELS, GROQ_PREFIX, sendGroq, type GroqMessage } from "./groq-request.ts";

/**
 * Groq for the chats (free tier, OpenAI-compatible API). Used only when GROQ_API_KEY is set (a Worker secret; never in the repository or the
 * browser). If Groq cannot answer (timeout, rate limit, outage, a retired model) the caller carries on with the next route.
 *
 *   GROQ_API_KEY      the key (Worker secret)
 *   GROQ_CHAT_MODEL   optional: one Groq model id (default: llama-3.3-70b-versatile, then openai/gpt-oss-120b and openai/gpt-oss-20b if a model is not available)
 */
export const groqKey = (): string | null => fromEnvironment("GROQ_API_KEY") || null;
/** The id as it appears in the model chain: "groq:<model>". */
export const groqModel = (): string => `${GROQ_PREFIX}${fromEnvironment("GROQ_CHAT_MODEL") || DEFAULT_GROQ_MODELS[0]}`;
const groqModels = (): string[] => {
  const configured = fromEnvironment("GROQ_CHAT_MODEL");
  return configured ? [configured] : DEFAULT_GROQ_MODELS;
};

/** Why the last call failed (a reason and an HTTP status, nothing else), so the site assistant can say "the service is unavailable" and why. */
let lastFailure: { reason: string; status: number | null } | null = null;
export const groqLastFailure = () => lastFailure;
export const groqEnabled = (): boolean => Boolean(groqKey()) && ["auto", "groq"].includes(chatProvider());

/** A rejected key pauses Groq for ten minutes; the free tier's rate limit only for the seconds Groq asks for. */
let pausedUntil = 0;
export const groqPaused = (): boolean => Date.now() < pausedUntil;

export async function callGroq(
  messages: GroqMessage[],
  options: { model?: string; maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<{ text: string; model: string } | null> {
  const key = groqKey();
  if (!key) return null;
  if (groqPaused()) {
    lastFailure = { reason: "paused", status: null };
    return null;
  }
  // a model that was retired or is not available (a 400 / 404 about the model) hands over to the next one in the list; any other failure stops
  for (const model of groqModels()) {
    const outcome = await sendGroq({ key, messages, model, maxTokens: options.maxTokens, temperature: options.temperature, timeoutMs: options.timeoutMs });
    if (outcome.ok) {
      lastFailure = null;
      // the size of the call, for watching the free allowance: no text, no identifiers
      console.log("GROQ_AI_USAGE", outcome.model, outcome.inputTokens, outcome.outputTokens);
      return { text: outcome.text, model: outcome.model };
    }
    // only the status and the error's own type (and, for a malformed request, its message): never the key, never the conversation
    console.error("GROQ_AI_FAILED", model, outcome.reason, outcome.status ?? "", outcome.errorType ?? "", outcome.detail ?? "");
    lastFailure = { reason: outcome.reason, status: outcome.status ?? null };
    if (outcome.reason === "pause") pausedUntil = Date.now() + 10 * 60 * 1000;
    if (outcome.reason === "limit") pausedUntil = Date.now() + (outcome.retryAfterMs ?? 20000);
    if (outcome.reason !== "bug") break;
  }
  return null;
}
