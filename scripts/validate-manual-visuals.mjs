#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file));
const txt = (file) => read(file).toString("utf8");
const config = JSON.parse(txt("src/data/manual-therapy-visual-manifest.json"));
const publishMode = process.argv.includes("--publish");
const dir = path.join(root, "public/images/manual-therapy/cards");
const baseSlugs = [
  ...txt("src/lib/manual-therapy.ts").matchAll(/\bslug:\s*"([^"]+)"/g),
  ...txt("src/lib/manual-therapy-additions.ts").matchAll(/\bslug:\s*"([^"]+)"/g),
].map((match) => match[1]);
const worldSlugs = [...txt("src/lib/manual-therapy-world.ts")
  .matchAll(/["']slug["']\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
const expected = [...baseSlugs, ...worldSlugs];

assert.equal(expected.length, 35, "Expected 22 original and 13 worldwide techniques");
assert.equal(new Set(expected).size, 35, "Duplicate live technique slugs");
assert.equal(config.schemaVersion, 1, "Unsupported manifest schema");
assert.equal(config.publish === true || config.publish === false, true, "Publish must be boolean");
assert.deepEqual(config.targetSize, { width: 480, height: 600 }, "Unexpected standard card dimensions");
assert(Array.isArray(config.entries) && config.entries.length === 35, "Exactly 35 manifest entries required");
assert.deepEqual(
  config.entries.map((entry) => entry.slug).sort(),
  expected.sort(),
  "Visual manifest must match every published technique slug"
);
const statuses = { pending: 0, review: 0, approved: 0 };
for (const entry of config.entries) {
  assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");
  assert(["pending", "review", "approved"].includes(entry.status), entry.slug + ": invalid approval status");
  statuses[entry.status] += 1;
  for (const coord of ["x", "y"]) {
    assert(Number.isInteger(entry.crop?.[coord]) && entry.crop[coord] >= 0 && entry.crop[coord] <= 100,
      entry.slug + ": invalid normalized crop " + coord);
  }
  assert(typeof entry.reviewNote === "string" && entry.reviewNote.trim().length >= 8,
    entry.slug + ": missing audit note");
}
if (config.publish) {
  assert.equal(statuses.approved, 35, "Manifest may not publish until 35/35 are approved");
}
if (publishMode) {
  assert.equal(config.publish, true, "Publish validation requires manifest.publish=true");
  assert.equal(statuses.approved, 35, "All 35 must be clinically approved");
}
let totalBytes = 0;
const hashes = new Set();
let assetsFound = 0;
for (const entry of config.entries) {
  const files = ["avif", "webp"].map((ext) => path.join(dir, entry.slug + "." + ext));
  const present = files.map((file) => existsSync(file));
  if (publishMode) assert(present.every(Boolean), entry.slug + ": missing optimized file(s)");
  if (present.some(Boolean) && !present.every(Boolean)) {
    throw Error(entry.slug + ": WebP/AVIF pair incomplete");
  }
  if (!present.every(Boolean)) continue;
  assetsFound += 1;
  for (const [i, file] of files.entries()) {
    const ext = i === 0 ? "avif" : "webp";
    const bytes = statSync(file).size;
    assert(bytes >= 1024 && bytes <= (ext === "avif" ? 65000 : 85000),
      file + ": asset exceeds performance budget or is empty (" + bytes + " bytes)");
    const header = readFileSync(file);
    assert(
      ext === "avif"
        ? header.subarray(4, 12).toString("latin1") === "ftypavif"
        : header.subarray(0, 4).toString("latin1") === "RIFF" && header.subarray(8, 12).toString("latin1") === "WEBP",
      file + ": invalid image signature"
    );
    if (ext === "avif") {
      const hash = createHash("sha256").update(header).digest("hex");
      assert(!hashes.has(hash), entry.slug + ": same image reused for a different technique");
      hashes.add(hash);
    }
    totalBytes += bytes;
  }
}
if (existsSync(dir)) {
  const valid = new Set(config.entries.flatMap((entry) => ["avif", "webp"].map((ext) => entry.slug + "." + ext)));
  for (const file of readdirSync(dir)) {
    if (file.startsWith(".") || file === "README.md") continue;
    assert(valid.has(file), "Unexpected manual therapy asset in live output: " + file);
  }
}
assert(totalBytes <= 4_000_000, "Entire encyclopedia exceeds 4 MB image budget");
if (publishMode) assert.equal(assetsFound, 35, "All 35 complete AVIF/WebP pairs required");
console.log(
  `PNA images OK: ${config.entries.length} slugs; ${statuses.approved} approved; ${statuses.review} review; ${statuses.pending} pending; ${assetsFound} image pairs; ${totalBytes} bytes; publish=${config.publish}`
);
