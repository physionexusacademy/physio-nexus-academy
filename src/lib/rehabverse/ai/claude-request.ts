/**
 * Claude (Anthropic) Messages API: the request the chats send and how its answer is read. Pure functions (no network, no secrets, no
 * server-only imports), so every rule below is tested without a key (scripts/validate-rehabverse-claude.ts). The network call itself is in
 * claude.ts.
 *
 * Why plain `fetch` and not the SDK: the Cloudflare Worker has a hard size limit (3 MiB gzip) and the SDK would add about 100 KiB of it plus
 * Node-only modules the Worker does not have; one POST to /v1/messages is all the chats need.
 *
 * Rules of the API this file follows: the system prompt is a top-level field (not a message); messages start with a user turn; consecutive
 * turns of one role are allowed (the API merges them) but are merged here too so the logs read cleanly; `temperature` / `top_p` / `top_k`
 * are NOT sent (API version 2026-10-21 and the Haiku 5.5 model reject them); effort goes in `output_config.effort`.
 */
export type ClaudeMessage = { role: "system" | "user" | "assistant"; content: string };
export type ClaudeEffort = "low" | "medium" | "high";

export const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
/** The API version header (a date). 2026-10-21 is the current one: sampling parameters are rejected on it, so none are ever sent. */
export const CLAUDE_API_VERSION = "2026-10-21";
/** Claude Haiku 5.5: the fast, low-cost model ($0.10 / $0.50 per million input / output tokens for prompts up to 100K tokens). */
export const DEFAULT_CLAUDE_MODEL = "claude-haiku-5-5";
/** The model may think before it answers and thinking tokens count toward max_tokens: a low cap could leave no room for the reply itself. */
export const MIN_CLAUDE_MAX_TOKENS = 1024;
export const MAX_CLAUDE_MAX_TOKENS = 4096;
const OPENING_TURN = "(The patient has just opened the chat.)";

export const isClaudeModel = (model: string) => /^claude-/i.test(model.trim());

export type ClaudeRequestBody = {
  model: string;
  max_tokens: number;
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  output_config: { effort: ClaudeEffort };
};

/** Turns the chats' message list (a system prompt, the recent turns, the newest patient message) into one Messages API request body. */
export function buildClaudeRequest(messages: ClaudeMessage[], options: { model?: string; maxTokens?: number; effort?: ClaudeEffort } = {}): ClaudeRequestBody {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content.trim())
    .filter(Boolean)
    .join("\n\n");
  const turns: ClaudeRequestBody["messages"] = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    const content = m.content.trim();
    if (!content) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${content}`;
    else turns.push({ role: m.role, content });
  }
  // the conversation must start with the patient: the assistant's own greeting (the first turn of every chat) is kept, after a neutral opening turn
  if (!turns.length || turns[0].role === "assistant") turns.unshift({ role: "user", content: OPENING_TURN });
  const wanted = Math.round(options.maxTokens ?? 0);
  return {
    model: (options.model ?? DEFAULT_CLAUDE_MODEL).trim() || DEFAULT_CLAUDE_MODEL,
    max_tokens: Math.min(MAX_CLAUDE_MAX_TOKENS, Math.max(MIN_CLAUDE_MAX_TOKENS, wanted)),
    ...(system ? { system } : {}),
    messages: turns,
    output_config: { effort: options.effort ?? "low" },
  };
}

type ClaudeAnswer = {
  type?: string;
  content?: { type?: string; text?: unknown }[];
  stop_reason?: string | null;
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { type?: string; message?: string };
};

/** The reply text of an answer: every text block joined. `refused` is true when the model declined (the chats then use another route), `empty` when it said nothing. */
export function readClaudeAnswer(raw: unknown): { text: string; refused: boolean; inputTokens: number; outputTokens: number } {
  const answer = (raw && typeof raw === "object" ? raw : {}) as ClaudeAnswer;
  const text = (answer.content ?? [])
    .filter((block) => block && block.type === "text" && typeof block.text === "string")
    .map((block) => String(block.text))
    .join("")
    .trim();
  return { text, refused: answer.stop_reason === "refusal", inputTokens: answer.usage?.input_tokens ?? 0, outputTokens: answer.usage?.output_tokens ?? 0 };
}

/**
 * What to do about an HTTP failure. 401 / 403 (key wrong, revoked, or no credit left on a postpaid account) pause Claude for a while so a dead
 * key is not hit on every message, and the free chain answers meanwhile; 429 / 529 / 5xx and timeouts only skip this one call; a 400 is a bug
 * in the request and is logged (never with the conversation).
 */
export function classifyClaudeFailure(status: number): "pause" | "skip" | "bug" {
  if (status === 401 || status === 403 || status === 402) return "pause";
  if (status === 400 || status === 404 || status === 413 || status === 422) return "bug";
  return "skip";
}

export type ClaudeOutcome =
  | { ok: true; text: string; model: string; inputTokens: number; outputTokens: number }
  | { ok: false; reason: "pause" | "skip" | "bug" | "refused" | "empty" | "timeout" | "network"; status?: number; errorType?: string; detail?: string };

/**
 * One Messages API call. Never throws: every failure is an outcome the caller can act on (pause Claude, skip this call, use the next route).
 * `fetchImpl` is injected so the whole behaviour is tested with a mock; the real call passes the platform's `fetch`.
 */
export async function sendClaude(args: {
  key: string;
  messages: ClaudeMessage[];
  model?: string;
  maxTokens?: number;
  effort?: ClaudeEffort;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<ClaudeOutcome> {
  const body = buildClaudeRequest(args.messages, { model: args.model, maxTokens: args.maxTokens, effort: args.effort });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeoutMs ?? 14000);
  try {
    const response = await (args.fetchImpl ?? fetch)(CLAUDE_API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": args.key, "anthropic-version": CLAUDE_API_VERSION },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      const kind = classifyClaudeFailure(response.status);
      const detail = (await response.json().catch(() => null)) as { error?: { type?: string; message?: string } } | null;
      return { ok: false, reason: kind, status: response.status, errorType: detail?.error?.type, detail: kind === "bug" ? (detail?.error?.message ?? "").slice(0, 200) : undefined };
    }
    const answer = readClaudeAnswer(await response.json().catch(() => null));
    if (answer.refused) return { ok: false, reason: "refused", status: response.status };
    if (!answer.text) return { ok: false, reason: "empty", status: response.status };
    return { ok: true, text: answer.text, model: body.model, inputTokens: answer.inputTokens, outputTokens: answer.outputTokens };
  } catch (error) {
    return { ok: false, reason: error instanceof Error && error.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
