/**
 * Manual Therapy chapter data lives in static files, not in the Cloudflare worker.
 *   npm run validate:manual-therapy-data
 *
 * 1. The generated files (public/manual-therapy-data) are exactly what the content modules produce now (a stale file would publish old text).
 * 2. Every chapter that has a page has a file and a card, and the data is plain JSON (nothing is lost on the way: no undefined, functions, dates, NaN).
 * 3. The worker guard: none of the heavy chapter data modules (guides, mechanisms, mastery, expert depth, Roman Urdu, stories, ...) can be reached from any page, layout,
 *    route or the middleware. If one ever is, the worker grows by hundreds of KiB again, so this fails with the import chain.
 * 4. The loader reads only well-formed slugs, and the pages fail the build (rather than 404) when a listed chapter has no file.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadChapterBuilder } from "./manual-therapy-data-run.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
let checks = 0;
const ok = (condition, message) => { checks++; assert(condition, message); };

/* 1 + 2. freshness and plain data */
const { serializeChapterData, chapterSlugs, buildChapterData } = await loadChapterBuilder(root);
const files = serializeChapterData();
for (const [file, content] of Object.entries(files)) {
  ok(fs.existsSync(path.join(root, file)), `${file} is missing: run npm run build:manual-therapy-data`);
  ok(read(file) === content, `${file} is stale: run npm run build:manual-therapy-data`);
}
const chapterDir = path.join(root, "public/manual-therapy-data/chapters");
for (const file of fs.readdirSync(chapterDir)) ok(`public/manual-therapy-data/chapters/${file}` in files, `${file} is a leftover chapter file: run npm run build:manual-therapy-data`);

const slugs = chapterSlugs();
ok(slugs.length >= 35 && new Set(slugs).size === slugs.length, `unexpected chapter list (${slugs.length})`);
const index = JSON.parse(read("public/manual-therapy-data/index.json"));
const plain = (value, where) => {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") { ok(Number.isFinite(value), `${where}: a number that is not finite`); return; }
  if (Array.isArray(value)) { value.forEach((item, i) => plain(item, `${where}[${i}]`)); return; }
  ok(typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype, `${where}: not plain data (${typeof value})`);
  for (const [key, item] of Object.entries(value)) { ok(item !== undefined, `${where}.${key} is undefined (JSON would drop it)`); plain(item, `${where}.${key}`); }
};
for (const slug of slugs) {
  const data = buildChapterData(slug);
  ok(data, `${slug}: the chapter page needs data but none could be built (guide, mechanism or expert profile missing)`);
  ok(`public/manual-therapy-data/chapters/${slug}.json` in files, `${slug}: no chapter file`);
  ok(data.slug === slug && data.version === 1, `${slug}: wrong header`);
  ok(data.kind === "world" ? data.technique === null : data.technique !== null && data.worldDeep === null, `${slug}: technique/world parts do not match its kind`);
  ok(index.cards[slug] && index.cards[slug].slug === slug, `${slug}: no index card`);
  plain(data, slug);
  ok(fs.statSync(path.join(chapterDir, `${slug}.json`)).size < 120 * 1024, `${slug}: chapter file is unusually large`);
}
plain(index, "index");
ok(Object.keys(index.cards).length === slugs.length, "the index must hold exactly the chapters that have pages");

/* 3. the worker guard: reachability from every entry, type-only imports ignored (they are erased) */
const sources = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) sources.push(path.relative(root, full).split(path.sep).join("/"));
  }
})(path.join(root, "src"));
const known = new Set(sources);
const resolve = (from, spec) => {
  const base = spec.startsWith("@/") ? "src/" + spec.slice(2) : spec.startsWith(".") ? path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)) : null;
  if (!base) return null;
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) if (known.has(base + ext)) return base + ext;
  return null;
};
const deps = new Map();
for (const file of sources) {
  const text = read(file)
    .replace(/import\s+type\s+[^;]*?from\s*["'][^"']+["']\s*;?/g, "")
    .replace(/export\s+type\s*\{[^}]*\}\s*from\s*["'][^"']+["']\s*;?/g, "");
  const set = new Set();
  for (const match of text.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) { const target = resolve(file, match[1]); if (target) set.add(target); }
  deps.set(file, set);
}
const isEntry = (file) =>
  /^src\/app\/.*\/(page|layout|route|loading|error|not-found|template|default)\.(ts|tsx)$/.test(file) ||
  /^src\/app\/(layout|page|loading|error|not-found|global-error)\.tsx$/.test(file) ||
  /^src\/app\/(sitemap|robots|manifest|opengraph-image|icon)\.(ts|tsx)$/.test(file) ||
  /^src\/(middleware|instrumentation)\.ts$/.test(file);
const via = new Map(); // file -> the file that imported it first
const stack = sources.filter(isEntry);
for (const entry of stack) via.set(entry, null);
while (stack.length) {
  const file = stack.pop();
  for (const next of deps.get(file) ?? []) if (!via.has(next)) { via.set(next, file); stack.push(next); }
}
ok(via.size > 100, "the entry points were not found (" + via.size + " files reached)");
const HEAVY = /^src\/lib\/(all-)?manual-therapy-(guides?|guide-additions|mechanisms?|mechanism-additions|mastery(?!-types)[a-z-]*|depth(?!-types)[a-z-]*|urdu-content|urdu-depth|components|episodes|aha-moments|lesson-weave[a-z-]*|room-scenes|world-depth(?!-types)[a-z-]*|stories|expert|chapter-build)\.ts$/;
const heavy = sources.filter((file) => HEAVY.test(file));
ok(heavy.length >= 20, `the heavy module list matched only ${heavy.length} files (the guard needs updating)`);
for (const file of heavy) {
  if (!via.has(file)) continue;
  const chain = [file];
  for (let cursor = via.get(file); cursor; cursor = via.get(cursor)) chain.push(cursor);
  assert.fail(`${file} is reachable from a page, so its text would travel in the Cloudflare worker again: ${chain.reverse().join(" -> ")}\n` +
    "Put the data in the chapter data (src/lib/manual-therapy-chapter-build.ts) and read it with the loader instead.");
}
ok(!via.has("src/lib/manual-therapy-chapter-build.ts"), "the chapter builder must only be imported by scripts");

/* 4. the loader and the pages */
const loader = read("src/lib/manual-therapy-chapter-loader.ts");
ok(/\^\[a-z0-9\]\[a-z0-9-\]\{0,80\}\$/.test(loader), "the loader must refuse a slug that is not a plain lowercase slug before it builds a path");
ok(/path\.join\(process\.cwd\(\), "public", BASE, relative\)/.test(loader) && /assets\.fetch/.test(loader), "the loader reads the ASSETS binding on Cloudflare and the repository file otherwise");
const page = read("src/app/manual-therapy/[slug]/page.tsx");
ok(/loadChapterData\(slug\)/.test(page) && /throw new Error\(`Manual Therapy chapter data is missing/.test(page), "the chapter page must fail the build when a listed chapter has no data file");
const indexPage = read("src/app/manual-therapy/page.tsx");
ok(/loadChapterIndex\(\)/.test(indexPage) && /throw new Error\("Manual Therapy chapter index is missing/.test(indexPage), "the encyclopedia page must fail the build when the chapter index is missing");

console.log(`Manual Therapy chapter data: ${checks} checks passed (${slugs.length} chapters, ${heavy.length} heavy modules kept out of the worker).`);
