/**
 * Groq (an OpenAI-compatible chat API with a free tier) as another route for the chats: the request they send and how its answer is read.
 * Pure functions (no network, no secrets, no server-only imports) so every rule is tested without a key (scripts/validate-rehabverse-groq.ts).
 * The network call is in groq.ts. Plain `fetch`, like Claude's: the Worker has a hard size limit.
 *
 * Model ids that go to Groq carry the prefix "groq:" in the model chain ("groq:llama-3.3-70b-versatile"), so one list can hold every route.
 */
export type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_PREFIX = "groq:";
/** A strong open model that Groq serves for free within its limits. Change it with GROQ_CHAT_MODEL (for example "openai/gpt-oss-120b"). */
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const MIN_GROQ_MAX_TOKENS = 200;
export const MAX_GROQ_MAX_TOKENS = 2048;

export const isGroqModel = (model: string) => model.trim().startsWith(GROQ_PREFIX);
export const groqModelName = (model: string) => (isGroqModel(model) ? model.trim().slice(GROQ_PREFIX.length) : model.trim()) || DEFAULT_GROQ_MODEL;

export type GroqRequestBody = {
  model: string;
  messages: GroqMessage[];
  max_completion_tokens: number;
  temperature: number;
};

export function buildGroqRequest(messages: GroqMessage[], options: { model?: string; maxTokens?: number; temperature?: number } = {}): GroqRequestBody {
  const turns: GroqMessage[] = [];
  for (const m of messages) {
    const content = m.content.trim();
    if (!content) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role && m.role !== "system") last.content += `\n\n${content}`;
    else turns.push({ role: m.role, content });
  }
  if (!turns.some((m) => m.role === "user")) turns.push({ role: "user", content: "(The patient has just opened the chat.)" });
  const wanted = Math.round(options.maxTokens ?? 0);
  const temperature = typeof options.temperature === "number" && Number.isFinite(options.temperature) ? Math.min(1, Math.max(0, options.temperature)) : 0.4;
  return {
    model: groqModelName(options.model ?? DEFAULT_GROQ_MODEL),
    messages: turns,
    max_completion_tokens: Math.min(MAX_GROQ_MAX_TOKENS, Math.max(MIN_GROQ_MAX_TOKENS, wanted)),
    temperature,
  };
}

type GroqAnswer = { choices?: { message?: { content?: unknown }; finish_reason?: string | null }[]; usage?: { prompt_tokens?: number; completion_tokens?: number }; error?: { type?: string; message?: string } };

export function readGroqAnswer(raw: unknown): { text: string; inputTokens: number; outputTokens: number } {
  const answer = (raw && typeof raw === "object" ? raw : {}) as GroqAnswer;
  const content = answer.choices?.[0]?.message?.content;
  return { text: typeof content === "string" ? content.trim() : "", inputTokens: answer.usage?.prompt_tokens ?? 0, outputTokens: answer.usage?.completion_tokens ?? 0 };
}

/** 401 / 403: key wrong or revoked: pause for a long while. 429: the free limit is reached: pause briefly. 400 / 404 / 413 / 422: a bug (for example a retired model id). Everything else: skip this call. */
export function classifyGroqFailure(status: number): "pause" | "limit" | "skip" | "bug" {
  if (status === 401 || status === 403) return "pause";
  if (status === 429) return "limit";
  if (status === 400 || status === 404 || status === 413 || status === 422) return "bug";
  return "skip";
}

export type GroqOutcome =
  | { ok: true; text: string; model: string; inputTokens: number; outputTokens: number }
  | { ok: false; reason: "pause" | "limit" | "skip" | "bug" | "empty" | "timeout" | "network"; status?: number; errorType?: string; detail?: string; retryAfterMs?: number };

/** One chat call. Never throws: every failure is an outcome. `fetchImpl` is injected so the behaviour is tested with a mock. */
export async function sendGroq(args: {
  key: string;
  messages: GroqMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GroqOutcome> {
  const body = buildGroqRequest(args.messages, { model: args.model, maxTokens: args.maxTokens, temperature: args.temperature });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeoutMs ?? 14000);
  try {
    const response = await (args.fetchImpl ?? fetch)(GROQ_API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${args.key}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      const kind = classifyGroqFailure(response.status);
      const detail = (await response.json().catch(() => null)) as { error?: { type?: string; message?: string } } | null;
      const retry = Number(response.headers?.get?.("retry-after"));
      return {
        ok: false,
        reason: kind,
        status: response.status,
        errorType: detail?.error?.type,
        detail: kind === "bug" ? (detail?.error?.message ?? "").slice(0, 200) : undefined,
        retryAfterMs: Number.isFinite(retry) && retry > 0 ? Math.min(120, retry) * 1000 : undefined,
      };
    }
    const answer = readGroqAnswer(await response.json().catch(() => null));
    if (!answer.text) return { ok: false, reason: "empty", status: response.status };
    return { ok: true, text: answer.text, model: `${GROQ_PREFIX}${body.model}`, inputTokens: answer.inputTokens, outputTokens: answer.outputTokens };
  } catch (error) {
    return { ok: false, reason: error instanceof Error && error.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
