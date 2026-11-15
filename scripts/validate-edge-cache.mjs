/**
 * The edge copy of the database-backed pages (custom-worker.ts) must be keyed by the Worker version: a cached page from the previous deploy
 * points at JavaScript and CSS files that no longer exist, so the first visit of each page after every deploy loaded unstyled and dead.
 * This checks that the worker reads the version binding, puts it in the cache key, and that wrangler.jsonc declares the binding.
 */
import fs from "node:fs";

const worker = fs.readFileSync("custom-worker.ts", "utf8");
const config = fs.readFileSync("wrangler.jsonc", "utf8");
const problems = [];
if (!/CF_VERSION_METADATA\?\.id/.test(worker)) problems.push("custom-worker.ts does not read CF_VERSION_METADATA.id");
if (!/new Request\(`[^`]*__pna_v=\$\{versionOf\(env\)\}`/.test(worker)) problems.push("the edge cache key does not include the Worker version (__pna_v)");
if (!/"version_metadata"\s*:\s*\{\s*"binding"\s*:\s*"CF_VERSION_METADATA"\s*\}/.test(config)) problems.push('wrangler.jsonc has no "version_metadata" binding named CF_VERSION_METADATA');
if (problems.length) {
  console.error("Edge cache checks FAILED\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log("Edge cache checks passed (the cache key carries the Worker version, and the binding is declared).");
