import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import {
  buildGroqRequest, classifyGroqFailure, DEFAULT_GROQ_MODEL, GROQ_API_URL, GROQ_PREFIX, groqModelName, isGroqModel, MAX_GROQ_MAX_TOKENS, MIN_GROQ_MAX_TOKENS, readGroqAnswer, sendGroq,
  type GroqMessage,
} from "../src/lib/rehabverse/ai/groq-request.ts";

/**
 * Groq (free tier, OpenAI-compatible) as a route for the chats, tested WITHOUT a key and without the network: the request, how the answer is
 * read, what each failure does, and how it is wired (server-only, key only as a Worker secret, never in the repository, used only when set).
 */
let checks = 0;
const ok = (condition: unknown, message: string) => { checks++; assert.ok(condition, message); };
const eq = (actual: unknown, expected: unknown, message: string) => { checks++; assert.deepEqual(actual, expected, message); };
const read = (path: string) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

/* 1. The request. */
{
  const chat: GroqMessage[] = [
    { role: "system", content: "You are the coach.  " },
    { role: "assistant", content: "Hello, I am your coach." },
    { role: "user", content: "ye exercise kaise karni hai" },
    { role: "user", content: "(Jawab sirf Roman Urdu mein dein.)" },
  ];
  const body = buildGroqRequest(chat, { maxTokens: 420 });
  eq(body.messages[0], { role: "system", content: "You are the coach." }, "the system prompt stays a system message");
  eq(body.messages.map((m) => m.role), ["system", "assistant", "user"], "consecutive user turns are one turn");
  ok(body.messages[2].content === "ye exercise kaise karni hai\n\n(Jawab sirf Roman Urdu mein dein.)", "...joined in order");
  eq(body.model, DEFAULT_GROQ_MODEL, "the default model is the free Llama 3.3 70B");
  eq(buildGroqRequest(chat, { model: "groq:openai/gpt-oss-120b" }).model, "openai/gpt-oss-120b", "the groq: prefix of the model chain is removed before the call");
  eq(buildGroqRequest(chat, { maxTokens: 50 }).max_completion_tokens, MIN_GROQ_MAX_TOKENS, "a tiny limit is raised so a reply fits");
  eq(buildGroqRequest(chat, { maxTokens: 99999 }).max_completion_tokens, MAX_GROQ_MAX_TOKENS, "a huge limit is capped");
  eq(buildGroqRequest(chat, {}).temperature, 0.4, "temperature defaults to 0.4");
  eq(buildGroqRequest(chat, { temperature: 7 }).temperature, 1, "temperature is kept in range");
  eq(buildGroqRequest([{ role: "system", content: "s" }]).messages[1], { role: "user", content: "(The patient has just opened the chat.)" }, "a conversation with no user turn still has one");
  ok(isGroqModel("groq:llama-3.3-70b-versatile") && !isGroqModel("claude-haiku-5-5") && !isGroqModel("@cf/meta/llama-3.3-70b-instruct-fp8-fast"), "only groq: ids go to Groq");
  eq(groqModelName("groq:x/y"), "x/y", "the model name after the prefix is kept whole");
  eq(GROQ_PREFIX, "groq:", "the prefix");
}

/* 2. The answer and the failures. */
{
  eq(readGroqAnswer({ choices: [{ message: { content: " Zaroor, batata hoon. " } }], usage: { prompt_tokens: 700, completion_tokens: 40 } }), { text: "Zaroor, batata hoon.", inputTokens: 700, outputTokens: 40 }, "the reply and its size are read");
  eq(readGroqAnswer({ choices: [] }).text, "", "no choice is an empty answer");
  eq(readGroqAnswer(null).text, "", "garbage is an empty answer");
  for (const status of [401, 403]) eq(classifyGroqFailure(status), "pause", `${status}: key wrong or revoked: Groq is paused for a while`);
  eq(classifyGroqFailure(429), "limit", "429: the free limit is reached: paused for the seconds Groq asks for");
  for (const status of [400, 404, 413, 422]) eq(classifyGroqFailure(status), "bug", `${status}: a malformed request or a retired model is reported`);
  for (const status of [500, 502, 503]) eq(classifyGroqFailure(status), "skip", `${status}: only this call is skipped`);
}

/* 3. The call, with a mock `fetch`. */
{
  const seen: { url: string; init: RequestInit }[] = [];
  const reply = (status: number, json: unknown, headers: Record<string, string> = {}) => (async (url: string | URL | Request, init?: RequestInit) => { seen.push({ url: String(url), init: init ?? {} }); return new Response(JSON.stringify(json), { status, headers }); }) as typeof fetch;
  const messages: GroqMessage[] = [{ role: "system", content: "S" }, { role: "user", content: "kaise hain" }];

  const good = await sendGroq({ key: "gsk_test_key", messages, fetchImpl: reply(200, { choices: [{ message: { content: "Theek hoon, shukriya." } }], usage: { prompt_tokens: 12, completion_tokens: 6 } }) });
  ok(good.ok && good.text === "Theek hoon, shukriya." && good.model === `groq:${DEFAULT_GROQ_MODEL}` && good.inputTokens === 12, "a good answer comes back with its text, its model (with the prefix) and its size");
  eq(seen[0].url, GROQ_API_URL, "the call goes to Groq's chat completions endpoint");
  eq(GROQ_API_URL, "https://api.groq.com/openai/v1/chat/completions", "...https://api.groq.com/openai/v1/chat/completions");
  eq((seen[0].init.headers as Record<string, string>).authorization, "Bearer gsk_test_key", "the key goes in the Authorization header");
  ok(!String(seen[0].init.body).includes("gsk_test_key"), "the key is not in the request body");

  const denied = await sendGroq({ key: "k", messages, fetchImpl: reply(401, { error: { type: "invalid_request_error", message: "Invalid API Key" } }) });
  ok(!denied.ok && denied.reason === "pause" && denied.errorType === "invalid_request_error" && denied.detail === undefined, "a rejected key: pause, with the error type but no message");
  const limited = await sendGroq({ key: "k", messages, fetchImpl: reply(429, { error: { type: "tokens", message: "rate" } }, { "retry-after": "17" }) });
  ok(!limited.ok && limited.reason === "limit" && limited.retryAfterMs === 17000, "the free limit: Groq's own retry-after is used");
  const gone = await sendGroq({ key: "k", messages, fetchImpl: reply(404, { error: { type: "invalid_request_error", message: "The model `x` does not exist" } }) });
  ok(!gone.ok && gone.reason === "bug" && /does not exist/.test(gone.detail ?? ""), "a retired model id is reported with its message (and the next route answers)");
  const empty = await sendGroq({ key: "k", messages, fetchImpl: reply(200, { choices: [{ message: { content: "  " } }] }) });
  ok(!empty.ok && empty.reason === "empty", "an empty answer is not shown");
  const down = await sendGroq({ key: "k", messages, fetchImpl: (async () => { throw new TypeError("fetch failed"); }) as typeof fetch });
  ok(!down.ok && down.reason === "network", "a network failure is an outcome, not an exception");
  const slow = await sendGroq({ key: "k", messages, timeoutMs: 30, fetchImpl: ((_u: string, init?: RequestInit) => new Promise((_r, reject) => { init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))); })) as unknown as typeof fetch });
  ok(!slow.ok && slow.reason === "timeout", "a slow answer times out (the next route then answers)");
}

/* 4. Wiring: where the key may live, and how Groq is chosen. */
{
  const groq = read("src/lib/rehabverse/ai/groq.ts");
  ok(groq.includes('import "server-only"'), "groq.ts is server-only: the key can never reach the browser");
  ok(/GROQ_API_KEY/.test(groq) && !/NEXT_PUBLIC_GROQ/.test(groq + read("src/lib/rehabverse/ai/groq-request.ts")), "the key is read from a Worker secret, never from a NEXT_PUBLIC_ variable");
  ok(!/console\.(log|error|warn)\([^)]*\bkey\b/.test(groq), "the key is never logged");
  ok(/export const groqEnabled =/.test(groq) && /\["auto", "groq"\]/.test(groq), "Groq is used only when its key is set and the provider setting allows it");

  const model = read("src/lib/rehabverse/ai/model.ts");
  ok(/isGroqModel\(model\)/.test(model) && /callGroq\(/.test(model) && /groqEnabled\(\)/.test(model), "model.ts sends groq: ids to Groq");
  ok(/chain\.push\(claudeModel\(\)\)/.test(model) && /chain\.push\(groqModel\(\)\)/.test(model) && model.indexOf("claudeModel()") < model.indexOf("groqModel()"), "the order is Claude, then Groq, then the free Workers AI chain");
  ok(/export const externalChain/.test(model), "the keyed services can be asked for alone (the site assistant never uses the free Workers AI models for written answers)");
  ok(/"claude" \|\| value === "groq" \|\| value === "workers-ai"/.test(read("src/lib/rehabverse/ai/provider.ts")), "REHAB_AI_PROVIDER accepts auto, claude, groq and workers-ai");

  const workflow = read(".github/workflows/deploy-cloudflare-production.yml");
  ok(/GROQ_API_KEY: \$\{\{ secrets\.GROQ_API_KEY \}\}/.test(workflow) && /wrangler secret put GROQ_API_KEY/.test(workflow), "the deploy puts GROQ_API_KEY into the Worker as a secret");
  ok(/if \[ -n "\$\{GROQ_API_KEY\}" \]/.test(workflow), "...only when the repository secret exists");

  // no key in the repository: nothing that looks like a Groq or Anthropic key anywhere in the tracked source
  const walk = (dir: string): string[] => { return readdirSync(new URL("../" + dir + "/", import.meta.url)).flatMap((f: string) => { const p = `${dir}/${f}`; return statSync(new URL("../" + p, import.meta.url)).isDirectory() ? walk(p) : [p]; }); };
  const leaked = ["src", "scripts", ".github"].flatMap(walk).filter((f) => /\.(ts|tsx|js|mjs|cjs|json|yml|yaml|md)$/.test(f)).filter((f) => /\bgsk_[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9_-]{20,}/.test(read(f)));
  eq(leaked, [], "no API key is written anywhere in the repository");
}

console.log(`RehabVerse Groq layer: ${checks} checks passed (request shape, answer reading, failure handling: pause / limit / report, timeout, wiring: server-only, Worker secret, order Claude, Groq, Workers AI, no key in the repository).`);
