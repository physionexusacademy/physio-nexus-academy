// Guards the worker stubs (scripts/worker-stubs/README.md): the server and edge builds replace parts of the Supabase client, so the
// code must never reach for them. Fails if source starts using realtime channels or passkey sign-in on the server, or storage /
// edge functions in the middleware.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(name)) files.push(path);
  }
})(join(root, "src"));

const text = (path) => readFileSync(path, "utf8");
const isClient = (source) => /^\s*["']use client["']/.test(source);
const problems = [];
for (const path of files) {
  const source = text(path);
  const rel = relative(root, path);
  // Realtime is stubbed everywhere on the server side, and nothing in the browser uses it either.
  if (/\.(channel|removeChannel|removeAllChannels|getChannels)\(/.test(source) && /supabase/i.test(source)) problems.push(`${rel}: uses Supabase Realtime`);
  if (/@supabase\/realtime-js/.test(source)) problems.push(`${rel}: imports @supabase/realtime-js`);
  // Passkeys are a browser ceremony; a server module must not start one.
  if (!isClient(source) && /(signInWithPasskey|registerPasskey|mfa\.webauthn|\.webauthn\.)/.test(source)) problems.push(`${rel}: uses passkeys on the server`);
}
const middleware = text(join(root, "src/middleware.ts"));
if (/\.storage\b|\.functions\b|storage-js|functions-js/.test(middleware)) problems.push("src/middleware.ts: uses Supabase storage or edge functions, which the edge build stubs out");
assert.deepEqual(problems, [], `Worker stub guard:\n${problems.join("\n")}`);

const config = text(join(root, "next.config.js"));
for (const stub of ["realtime-js.mjs", "auth-webauthn.mjs", "storage-js.mjs", "functions-js.mjs"]) {
  assert(existsSync(join(root, "scripts/worker-stubs", stub)), `scripts/worker-stubs/${stub} is missing`);
  assert(config.includes(stub), `next.config.js does not use scripts/worker-stubs/${stub}`);
}
assert(/if \(!isServer\) return config;/.test(config), "The stubs must apply to the server and edge builds only, never the browser build");
console.log(`worker stubs: ${files.length} source files checked, no use of realtime, server passkeys, or middleware storage/functions`);
