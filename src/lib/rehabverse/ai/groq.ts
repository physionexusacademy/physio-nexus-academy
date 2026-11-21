import "server-only";
import { chatProvider, fromEnvironment } from "./provider.ts";
import { DEFAULT_GROQ_MODEL, GROQ_PREFIX, sendGroq, type GroqMessage } from "./groq-request.ts";

/**
 * Groq for the chats (free tier, OpenAI-compatible API). Used only when GROQ_API_KEY is set (a Worker secret; never in the repository or the
 * browser). If Groq cannot answer (timeout, rate limit, outage, a retired model) the caller carries on with the next route.
 *
 *   GROQ_API_KEY      the key (Worker secret)
 *   GROQ_CHAT_MODEL   optional: the Groq model id (default llama-3.3-70b-versatile)
 */
export const groqKey = (): string | null => fromEnvironment("GROQ_API_KEY") || null;
/** The id as it appears in the model chain: "groq:<model>". */
export const groqModel = (): string => `${GROQ_PREFIX}${fromEnvironment("GROQ_CHAT_MODEL") || DEFAULT_GROQ_MODEL}`;
export const groqEnabled = (): boolean => Boolean(groqKey()) && ["auto", "groq"].includes(chatProvider());

/** A rejected key pauses Groq for ten minutes; the free tier's rate limit only for the seconds Groq asks for. */
let pausedUntil = 0;
export const groqPaused = (): boolean => Date.now() < pausedUntil;

export async function callGroq(
  messages: GroqMessage[],
  options: { model?: string; maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<{ text: string; model: string } | null> {
  const key = groqKey();
  if (!key || groqPaused()) return null;
  const outcome = await sendGroq({ key, messages, model: options.model ?? groqModel(), maxTokens: options.maxTokens, temperature: options.temperature, timeoutMs: options.timeoutMs });
  if (outcome.ok) {
    // the size of the call, for watching the free allowance: no text, no identifiers
    console.log("GROQ_AI_USAGE", outcome.model, outcome.inputTokens, outcome.outputTokens);
    return { text: outcome.text, model: outcome.model };
  }
  // only the status and the error's own type (and, for a malformed request, its message): never the key, never the conversation
  console.error("GROQ_AI_FAILED", outcome.reason, outcome.status ?? "", outcome.errorType ?? "", outcome.detail ?? "");
  if (outcome.reason === "pause") pausedUntil = Date.now() + 10 * 60 * 1000;
  if (outcome.reason === "limit") pausedUntil = Date.now() + (outcome.retryAfterMs ?? 20000);
  return null;
}
