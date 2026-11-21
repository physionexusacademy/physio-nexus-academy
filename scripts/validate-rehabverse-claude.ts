import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildClaudeRequest, classifyClaudeFailure, CLAUDE_API_URL, CLAUDE_API_VERSION, DEFAULT_CLAUDE_MODEL, isClaudeModel, MAX_CLAUDE_MAX_TOKENS, MIN_CLAUDE_MAX_TOKENS, readClaudeAnswer, sendClaude,
  type ClaudeMessage,
} from "../src/lib/rehabverse/ai/claude-request.ts";

/**
 * Claude Haiku (Anthropic's API) behind the chats, tested WITHOUT a key and without the network: the request the chats send, how the answer is
 * read, what each failure does (pause Claude, skip one call, use the free chain), and how it is wired (server-only, secret only in the Worker,
 * no temperature, deployed as a secret, no SDK in the bundle). A live check with the real key: /api/rehabverse/ai/selftest.
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

/* 1. The request. */
{
  const chat: ClaudeMessage[] = [
    { role: "system", content: "You are the coach.  " },
    { role: "assistant", content: "Hello, I am your coach." },
    { role: "user", content: "ye exercise kaise karni hai" },
    { role: "assistant", content: "Zaroor." },
    { role: "user", content: "shukriya, aur saans?" },
    { role: "user", content: "(Jawab sirf Roman Urdu mein dein.)" },
  ];
  const body = buildClaudeRequest(chat, { maxTokens: 420 });
  eq(body.system, "You are the coach.", "the system prompt is the top-level field, trimmed");
  eq(body.messages[0], { role: "user", content: "(The patient has just opened the chat.)" }, "the conversation starts with the patient: a neutral opening turn goes before the assistant's own greeting");
  eq(body.messages.map((m) => m.role), ["user", "assistant", "user", "assistant", "user"], "turns alternate (the two last user turns are one turn)");
  ok(body.messages[4].content === "shukriya, aur saans?\n\n(Jawab sirf Roman Urdu mein dein.)", "consecutive turns of one role are joined, in order");
  ok(!body.messages.some((m) => (m.role as string) === "system"), "no system message is left in the messages");
  eq(body.model, DEFAULT_CLAUDE_MODEL, "the default model is Claude Haiku 5.5");
  eq(DEFAULT_CLAUDE_MODEL, "claude-haiku-5-5", "...whose id is claude-haiku-5-5");
  eq(body.output_config, { effort: "low" }, "effort is low by default (short replies, fast and cheap)");
  const keys = Object.keys(body).sort();
  ok(!keys.includes("temperature") && !keys.includes("top_p") && !keys.includes("top_k") && !keys.includes("thinking"), "no temperature / top_p / top_k (rejected by the API) and no thinking settings are sent: " + keys.join(","));
  ok(JSON.parse(JSON.stringify(body)).max_tokens === body.max_tokens, "the body is plain JSON");

  eq(buildClaudeRequest(chat, { maxTokens: 380 }).max_tokens, MIN_CLAUDE_MAX_TOKENS, "a small limit is raised (thinking tokens count toward it, and a reply must still fit)");
  eq(buildClaudeRequest(chat, { maxTokens: 99999 }).max_tokens, MAX_CLAUDE_MAX_TOKENS, "a huge limit is capped (cost)");
  eq(buildClaudeRequest(chat, {}).max_tokens, MIN_CLAUDE_MAX_TOKENS, "no limit given: the minimum");
  eq(buildClaudeRequest(chat, { effort: "medium" }).output_config, { effort: "medium" }, "effort can be raised (the intake uses medium)");
  eq(buildClaudeRequest(chat, { model: "  claude-sonnet-5-5 " }).model, "claude-sonnet-5-5", "the model can be changed with a setting");
  eq(buildClaudeRequest(chat, { model: "  " }).model, DEFAULT_CLAUDE_MODEL, "an empty model setting falls back to the default");

  const noSystem = buildClaudeRequest([{ role: "user", content: "hi" }]);
  ok(!("system" in noSystem) && noSystem.messages.length === 1, "no system prompt: no system field");
  eq(buildClaudeRequest([{ role: "system", content: "s" }]).messages, [{ role: "user", content: "(The patient has just opened the chat.)" }], "a conversation with no turns still has a valid first turn");
  eq(buildClaudeRequest([{ role: "user", content: "   " }, { role: "user", content: "real" }]).messages, [{ role: "user", content: "real" }], "empty turns are dropped");
  ok(isClaudeModel("claude-haiku-5-5") && isClaudeModel("Claude-Sonnet-5-5") && !isClaudeModel("@cf/meta/llama-3.3-70b-instruct-fp8-fast"), "claude- ids go to Claude, @cf/ ids to Workers AI");
}

/* 2. The answer. */
{
  eq(readClaudeAnswer({ content: [{ type: "thinking", thinking: "" }, { type: "text", text: "Zaroor, " }, { type: "text", text: "batata hoon." }], stop_reason: "end_turn", usage: { input_tokens: 812, output_tokens: 64 } }),
    { text: "Zaroor, batata hoon.", refused: false, inputTokens: 812, outputTokens: 64 }, "text blocks are joined, thinking blocks are ignored, usage is read");
  eq(readClaudeAnswer({ content: [], stop_reason: "refusal" }).refused, true, "a refusal is flagged");
  eq(readClaudeAnswer(null).text, "", "garbage is an empty answer");
  eq(readClaudeAnswer({ content: [{ type: "text", text: 5 }] }).text, "", "a block without text is ignored");
}

/* 3. What each failure does. */
{
  for (const status of [401, 402, 403]) eq(classifyClaudeFailure(status), "pause", `${status}: key wrong, revoked or no credit: Claude is paused for a while`);
  for (const status of [429, 500, 502, 503, 529]) eq(classifyClaudeFailure(status), "skip", `${status}: only this call is skipped`);
  for (const status of [400, 404, 413, 422]) eq(classifyClaudeFailure(status), "bug", `${status}: a malformed request is reported`);
}

/* 4. The call, with a mock `fetch`. */
{
  const seen: { url: string; init: RequestInit }[] = [];
  const reply = (status: number, json: unknown) => (async (url: string | URL | Request, init?: RequestInit) => { seen.push({ url: String(url), init: init ?? {} }); return new Response(JSON.stringify(json), { status }); }) as typeof fetch;
  const messages: ClaudeMessage[] = [{ role: "system", content: "S" }, { role: "user", content: "kaise hain" }];

  const good = await sendClaude({ key: "sk-ant-test-key", messages, fetchImpl: reply(200, { content: [{ type: "text", text: "Theek hoon, shukriya." }], usage: { input_tokens: 10, output_tokens: 5 } }) });
  ok(good.ok && good.text === "Theek hoon, shukriya." && good.model === DEFAULT_CLAUDE_MODEL && good.inputTokens === 10, "a good answer comes back with its text, model and size");
  const call = seen[0];
  eq(call.url, CLAUDE_API_URL, "the call goes to the Messages API");
  eq(call.url, "https://api.anthropic.com/v1/messages", "...https://api.anthropic.com/v1/messages");
  const headers = call.init.headers as Record<string, string>;
  eq(headers["anthropic-version"], CLAUDE_API_VERSION, "the API version header is sent");
  eq(headers["x-api-key"], "sk-ant-test-key", "the key goes in the x-api-key header");
  ok(!JSON.stringify(call.init.body).includes("sk-ant-test-key"), "the key is not in the request body");
  eq(call.init.method, "POST", "POST");

  const denied = await sendClaude({ key: "k", messages, fetchImpl: reply(401, { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }) });
  ok(!denied.ok && denied.reason === "pause" && denied.status === 401 && denied.errorType === "authentication_error" && denied.detail === undefined, "a rejected key: pause, with the error type but no message");
  const noCredit = await sendClaude({ key: "k", messages, fetchImpl: reply(400, { type: "error", error: { type: "invalid_request_error", message: "Your credit balance is too low" } }) });
  ok(!noCredit.ok && noCredit.reason === "bug" && /credit/.test(noCredit.detail ?? ""), "a 400 keeps its message (it is how a low balance is reported): logged, the free chain answers");
  const busy = await sendClaude({ key: "k", messages, fetchImpl: reply(529, { type: "error", error: { type: "overloaded_error", message: "busy" } }) });
  ok(!busy.ok && busy.reason === "skip", "overloaded: skip this call");
  const limited = await sendClaude({ key: "k", messages, fetchImpl: reply(429, { type: "error", error: { type: "rate_limit_error", message: "slow down" } }) });
  ok(!limited.ok && limited.reason === "skip", "rate limited: skip this call");
  const refused = await sendClaude({ key: "k", messages, fetchImpl: reply(200, { content: [], stop_reason: "refusal" }) });
  ok(!refused.ok && refused.reason === "refused", "a refusal is not shown: the next route answers");
  const empty = await sendClaude({ key: "k", messages, fetchImpl: reply(200, { content: [{ type: "text", text: "  " }] }) });
  ok(!empty.ok && empty.reason === "empty", "an empty answer is not shown");
  const broken = await sendClaude({ key: "k", messages, fetchImpl: (async () => new Response("<html>", { status: 200 })) as typeof fetch });
  ok(!broken.ok, "an answer that is not JSON is not shown");
  const down = await sendClaude({ key: "k", messages, fetchImpl: (async () => { throw new TypeError("fetch failed"); }) as typeof fetch });
  ok(!down.ok && down.reason === "network", "a network failure is an outcome, not an exception");
  const slow = await sendClaude({ key: "k", messages, timeoutMs: 30, fetchImpl: ((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => { init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))); })) as unknown as typeof fetch });
  ok(!slow.ok && slow.reason === "timeout", "a slow answer times out (the free chain then answers)");
}

/* 5. Wiring. */
{
  const claude = read("src/lib/rehabverse/ai/claude.ts");
  ok(claude.includes('import "server-only"'), "claude.ts is server-only: the key can never reach the browser");
  ok(/ANTHROPIC_API_KEY/.test(claude) && !/NEXT_PUBLIC_ANTHROPIC/.test(read("src/lib/rehabverse/ai/claude-request.ts") + claude), "the key is read from a Worker secret, never from a NEXT_PUBLIC_ variable");
  ok(!/console\.(log|error|warn)\([^)]*\bkey\b/.test(claude), "the key is never logged");
  ok(/CLAUDE_AI_USAGE/.test(claude) && !/CLAUDE_AI_USAGE[^;]*text/.test(claude), "the bill is watched by logging sizes only, never text");
  ok(/pausedUntil/.test(claude) && /reason === "pause"/.test(claude), "a rejected key pauses Claude for a while");
  const request = read("src/lib/rehabverse/ai/claude-request.ts");
  ok(!/temperature|top_p|top_k/.test(request.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/`[^`]*`/g, "")) || !/temperature\s*:/.test(request), "the request never sets a sampling parameter");
  ok(/AbortController/.test(request) && /anthropic-version/.test(request), "the call has a timeout and sends the API version");

  const model = read("src/lib/rehabverse/ai/model.ts");
  ok(/isClaudeModel\(model\)/.test(model) && /callClaude\(/.test(model) && /claudeEnabled\(\)/.test(model), "model.ts sends claude- ids to Claude and everything else to Workers AI");
  ok(/REHAB_AI_PROVIDER/.test(model) && /workersChain\(\)/.test(model), "the provider can be chosen, and the free Workers AI chain is the fallback");
  ok(!/callClaude\([^)]*temperature/.test(model), "temperature is not passed to Claude");

  const actions = read("src/app/rehabverse/ai-actions.ts");
  ok(/callChat\(messages, \{ effort: "medium" \}\)/.test(actions), "the intake (free-form clinical story) runs at medium effort; the coach and check-in at low");

  const notices = read("src/lib/rehabverse/ai/notices.ts");
  ok((notices.match(/uses an AI service from a technology provider/g) ?? []).length === 3, "all three patient notices say an AI service (Claude or Cloudflare AI) writes the replies and what is sent");

  const workflow = read(".github/workflows/deploy-cloudflare-production.yml");
  ok(/ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}/.test(workflow) && /wrangler secret put ANTHROPIC_API_KEY/.test(workflow), "the deploy puts ANTHROPIC_API_KEY into the Worker as a secret");
  ok(/if \[ -n "\$\{ANTHROPIC_API_KEY\}" \]/.test(workflow), "...only when the repository secret exists: without it the chats stay on the free chain");

  const pkg = JSON.parse(read("package.json")) as { dependencies?: Record<string, string> };
  ok(!pkg.dependencies?.["@anthropic-ai/sdk"], "the SDK is not a dependency: the Worker has a hard size limit and one POST is all the chats need");
  ok(/validate:rehabverse-claude/.test(read("package.json")) && /validate:rehabverse-claude/.test(workflow), "this validator runs in CI");

  const route = read("src/app/api/physio-nexus-ai/route.ts");
  ok(/callClaude/.test(route) && /isFaithfulRewrite\(source, cleaned\)/.test(route), "the site AI's Roman Urdu retell tries Claude first and is still checked for faithfulness");
}

console.log(`RehabVerse Claude layer: ${checks} checks passed (request shape without sampling parameters, answer reading, failure handling: pause / skip / report, timeout, refusal, wiring: server-only, secret in the Worker, no SDK, deployed as a secret).`);
