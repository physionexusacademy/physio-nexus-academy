import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ChatMessage } from "./prompts.ts";
import { callClaude, claudeEnabled, claudeModel, claudeProvider } from "./claude.ts";
import { isClaudeModel } from "./claude-request.ts";

/**
 * The model behind the three chats (intake, coach, check-in). Two routes, tried in order:
 *   1. Claude Haiku (Anthropic's API, pay-as-you-go; claude.ts) when ANTHROPIC_API_KEY is set: natural replies, strong Roman Urdu;
 *   2. Cloudflare Workers AI (the free plan's daily allowance): the models below, tried in order.
 * If a route is slow, unavailable, out of allowance or credit, the next answers; if none does, the conversation falls back to the scripted
 * questions. Override the Workers AI order with REHAB_AI_MODELS (comma-separated model ids) without a code change; REHAB_AI_PROVIDER
 * ("auto" | "claude" | "workers-ai") chooses the routes. A model id that starts with "claude-" always goes to Claude.
 * Patient data: what leaves Cloudflare for Claude is only the (name- and contact-free) chat text the prompts build; see notices.ts.
 */
type AiBinding = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
type ModelAnswer = { response?: unknown; result?: { response?: unknown }; choices?: { message?: { content?: unknown } }[] };

export const DEFAULT_MODELS = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/google/gemma-3-12b-it", "@cf/zai-org/glm-4.7-flash"];
const workersChain = (): string[] => {
  const configured = (process.env.REHAB_AI_MODELS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return configured.length ? configured : DEFAULT_MODELS;
};
/** Every model the chats may use, in the order they are tried: Claude first (when it is switched on), then the free Workers AI chain. */
export const modelChain = (): string[] => {
  const provider = claudeProvider();
  return [...(claudeEnabled() ? [claudeModel()] : []), ...(provider === "claude" && claudeEnabled() ? [] : workersChain())].filter((model, i, all) => all.indexOf(model) === i);
};

const textOf = (raw: unknown): string => {
  const answer = (raw ?? {}) as ModelAnswer;
  const value = answer.response ?? answer.result?.response ?? answer.choices?.[0]?.message?.content ?? "";
  return typeof value === "string" ? value : "";
};

export async function callChat(
  messages: ChatMessage[],
  options: { models?: string[]; maxTokens?: number; temperature?: number; timeoutMs?: number; effort?: "low" | "medium" | "high" } = {},
): Promise<{ text: string; model: string } | null> {
  const models = options.models ?? modelChain();
  let ai: AiBinding | undefined;
  let aiLooked = false;
  for (const model of models) {
    // Claude: `temperature` is not sent (the API rejects it); the call has its own timeout and never throws
    if (isClaudeModel(model)) {
      if (!claudeEnabled()) continue;
      const answer = await callClaude(messages, { model, maxTokens: options.maxTokens, effort: options.effort, timeoutMs: options.timeoutMs });
      if (answer) return answer;
      continue;
    }
    if (!aiLooked) {
      aiLooked = true;
      try {
        ai = (getCloudflareContext() as unknown as { env?: { AI?: AiBinding } }).env?.AI;
      } catch {
        ai = undefined; // outside Cloudflare (local development): the scripted conversation carries on
      }
    }
    if (!ai) continue;
    try {
      const run = ai.run(model, { messages, max_tokens: options.maxTokens ?? 380, temperature: options.temperature ?? 0.5 });
      const raw = await Promise.race([run, new Promise<null>((resolve) => setTimeout(() => resolve(null), options.timeoutMs ?? 16000))]);
      const text = textOf(raw).trim();
      if (text) return { text, model };
    } catch (error) {
      console.error("REHAB_AI_MODEL_FAILED", model, error instanceof Error ? error.message : String(error));
    }
  }
  return null;
}
