/**
 * Checks the printable patient handouts.  npm run validate:handouts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { handouts } from "../src/lib/handouts.ts";

assert.ok(handouts.length >= 8, "expected at least 8 handouts");
const slugs = handouts.map((h) => h.slug);
assert.equal(new Set(slugs).size, slugs.length, "duplicate handout slug");

const words = (s: string) => s.trim().split(/\s+/).length;
for (const h of handouts) {
  const where = h.slug;
  assert.match(h.slug, /^[a-z0-9-]+$/, `${where}: bad slug`);
  const lines: [string, { en: string; ur: string }][] = [["title", h.title], ["forWhom", h.forWhom], ["intro", h.intro]];
  for (const s of h.sections) {
    lines.push(["heading", s.heading]);
    for (const item of s.items) lines.push(["item", item]);
  }
  for (const item of h.help) lines.push(["help", item]);
  for (const [kind, line] of lines) {
    assert.ok(line.en.trim().length > 2, `${where}: empty English ${kind}`);
    assert.ok(line.ur.trim().length > 2, `${where}: empty Roman Urdu ${kind}`);
    assert.notEqual(line.en, line.ur, `${where}: the Roman Urdu ${kind} is the English text`);
    if (kind === "item" || kind === "help") assert.ok(words(line.en) <= 30, `${where}: line too long for a patient sheet: "${line.en}"`);
  }
  assert.ok(h.sections.length >= 2, `${where}: needs at least two sections`);
  assert.ok(h.sections.some((s) => s.kind === "steps" || s.kind === "bullets"), `${where}: sections need a kind`);
  assert.ok(h.help.length >= 3, `${where}: every sheet needs at least three warning signs`);
  assert.ok(h.sections.every((s) => s.items.length >= 3), `${where}: every section needs at least three items`);
}

// Surgery sheets must defer to the surgeon.
for (const slug of ["knee-replacement", "hip-replacement"]) {
  const h = handouts.find((x) => x.slug === slug)!;
  assert.match(h.forWhom.en, /surgeon/i, `${slug}: must say to follow the surgeon first`);
  assert.ok(h.help.some((x) => /chest pain|breathless/i.test(x.en)), `${slug}: must warn about chest pain or breathlessness (clot)`);
}
assert.ok(handouts.find((x) => x.slug === "low-back-pain")!.help.some((x) => /urine|stool/i.test(x.en)), "back pain sheet must warn about bladder or bowel loss");

// The sheet shows the disclaimer and the clinic's details, and does not send or store anything.
const sheet = fs.readFileSync("src/app/handouts/HandoutSheet.tsx", "utf8");
assert.match(sheet, /advice for you comes first|comes first/i, "sheet needs the disclaimer");
assert.ok(sheet.includes("siteConfig.contact.phoneDisplay"), "sheet should carry the clinic phone number");
assert.doesNotMatch(sheet, /fetch\(|XMLHttpRequest|sendBeacon/, "handouts must not send data");
const css = fs.readFileSync("src/app/handouts/handouts.css", "utf8");
assert.ok(/@media print/.test(css) && /display:none!important/.test(css), "print styles must hide the site chrome");

console.log(`Handout checks passed: ${handouts.length} sheets, every line in English and Roman Urdu, warning signs on each, surgeon-first wording on the surgery sheets.`);
