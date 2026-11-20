import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ChatMessage } from "./prompts.ts";

/**
 * Cloudflare Workers AI (the free plan's daily allowance, no extra provider and no patient data leaving Cloudflare). The models are tried in
 * order: if the first is slow, unavailable or out of allowance, the next answers; if none does, the conversation falls back to the scripted
 * questions. Override the order with REHAB_AI_MODELS (comma-separated model ids) without a code change.
 */
type AiBinding = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
type ModelAnswer = { response?: unknown; result?: { response?: unknown }; choices?: { message?: { content?: unknown } }[] };

export const DEFAULT_MODELS = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/google/gemma-3-12b-it", "@cf/zai-org/glm-4.7-flash"];
export const modelChain = (): string[] => {
  const configured = (process.env.REHAB_AI_MODELS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return configured.length ? configured : DEFAULT_MODELS;
};

const textOf = (raw: unknown): string => {
  const answer = (raw ?? {}) as ModelAnswer;
  const value = answer.response ?? answer.result?.response ?? answer.choices?.[0]?.message?.content ?? "";
  return typeof value === "string" ? value : "";
};

export async function callChat(
  messages: ChatMessage[],
  options: { models?: string[]; maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<{ text: string; model: string } | null> {
  let ai: AiBinding | undefined;
  try {
    ai = (getCloudflareContext() as unknown as { env?: { AI?: AiBinding } }).env?.AI;
  } catch {
    return null; // outside Cloudflare (local development): the scripted conversation carries on
  }
  if (!ai) return null;
  for (const model of options.models ?? modelChain()) {
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
