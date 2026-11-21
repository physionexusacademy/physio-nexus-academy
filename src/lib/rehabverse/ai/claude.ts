import "server-only";
import { chatProvider, fromEnvironment } from "./provider.ts";
import { DEFAULT_CLAUDE_MODEL, sendClaude, type ClaudeEffort, type ClaudeMessage } from "./claude-request.ts";

/**
 * Claude Haiku (Anthropic's API, pay-as-you-go) for the chats: more natural replies than the free Workers AI models, and far better Roman Urdu.
 * It is used only when ANTHROPIC_API_KEY is set (a Worker secret); without it the chats run exactly as before on the free Workers AI chain.
 * If Claude cannot answer (timeout, rate limit, outage, no credit left, a refusal) the caller carries on with the free chain, and if that is
 * silent too the scripted conversation answers: a patient is never left without a reply.
 *
 *   ANTHROPIC_API_KEY   the key (Worker secret; never in the repository or in the browser)
 *   CLAUDE_CHAT_MODEL   optional: the model id (default claude-haiku-5-5)
 *   REHAB_AI_PROVIDER   optional, see provider.ts ("auto", "claude", "groq" or "workers-ai")
 */
export const claudeKey = (): string | null => fromEnvironment("ANTHROPIC_API_KEY") || null;
export const claudeModel = (): string => fromEnvironment("CLAUDE_CHAT_MODEL") || DEFAULT_CLAUDE_MODEL;
/** True when Claude should be tried: a key is set and the provider setting allows it. */
export const claudeEnabled = (): boolean => Boolean(claudeKey()) && ["auto", "claude"].includes(chatProvider());

/** After a rejected key (wrong, revoked, no credit) Claude is skipped for a few minutes, so a dead key is not hit on every message. */
const PAUSE_MS = 10 * 60 * 1000;
let pausedUntil = 0;
export const claudePaused = (): boolean => Date.now() < pausedUntil;

export async function callClaude(
  messages: ClaudeMessage[],
  options: { model?: string; maxTokens?: number; effort?: ClaudeEffort; timeoutMs?: number } = {},
): Promise<{ text: string; model: string } | null> {
  const key = claudeKey();
  if (!key || claudePaused()) return null;
  const outcome = await sendClaude({ key, messages, model: options.model ?? claudeModel(), maxTokens: options.maxTokens, effort: options.effort, timeoutMs: options.timeoutMs });
  if (outcome.ok) {
    // the size of the call, for watching the bill: no text, no identifiers
    console.log("CLAUDE_AI_USAGE", outcome.model, outcome.inputTokens, outcome.outputTokens);
    return { text: outcome.text, model: outcome.model };
  }
  // only the status and the error's own type (and, for a malformed request, its message): never the key, never the conversation
  console.error("CLAUDE_AI_FAILED", outcome.reason, outcome.status ?? "", outcome.errorType ?? "", outcome.detail ?? "");
  if (outcome.reason === "pause") pausedUntil = Date.now() + PAUSE_MS;
  return null;
}
