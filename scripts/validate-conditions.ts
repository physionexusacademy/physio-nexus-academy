/**
 * Conditions & Treatment Guide validator (runs in CI before every deploy).
 *   npm run validate:conditions
 * The guide is the owner's book, "The Complete Physiotherapy Clinical Mastery" (Dr. Sajjad Raza PT). Fails when:
 *   the static data is stale; a chapter's words were changed by hand (content/book/fingerprints.json, made from the PDF by
 *   scripts/book/check-verbatim.py); a chapter is not placed, or a placed chapter is missing; a guide lacks the parts the page needs;
 *   the Roman Urdu help is for the wrong chapter or section, or is not in Roman letters; an old address would 404;
 *   a figure placeholder leaked onto the site; or a page still links to a retired section or guide.
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { mskConditionIndex } from "../src/lib/msk-injury-index.ts";
import { treatmentPlans } from "../src/lib/treatment-plans.ts";
import { areas, types } from "../src/lib/conditions/taxonomy.ts";
import { chapterMap, retired } from "../content/book/map.ts";
import type { BookChapter, BookHelp } from "../src/lib/conditions/book-types.ts";
import type { CatalogItem, ConditionDetail, FoundationItem } from "../src/lib/conditions/types.ts";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");
const json = <T>(p: string) => JSON.parse(read(p)) as T;

// 1. Static data must match the book data.
execFileSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "scripts/build-conditions-data.ts", "--check"], { stdio: "inherit" });

// 2. The book's words are exactly as extracted from the PDF (same word list as scripts/book/check-verbatim.py).
const words = (s: string) => s.replace(/\*\*/g, "").split(/\s+/).filter(Boolean);
const unwrap = (ws: string[]) => {
  const out: string[] = [];
  for (const w of ws) {
    if (out.length && out[out.length - 1].endsWith("-") && out[out.length - 1].length > 1 && /^[\p{L}\p{N}]/u.test(w)) out[out.length - 1] += w;
    else out.push(w);
  }
  return out;
};
function chapterWords(c: BookChapter): string[] {
  const out: string[] = [];
  if (c.lead) out.push(...words(c.lead));
  for (const s of c.sections) {
    if (s.title) out.push(...words(s.title));
    for (const b of s.blocks) {
      if (b.t === "p" || b.t === "h") out.push(...words(b.text));
      else if (b.t === "ul") b.items.forEach((it) => out.push(...words(it)));
      else if (b.t === "ol") b.items.forEach((it, i) => out.push(`${b.start + i}.`, ...words(it)));
      else if (b.t === "table") {
        for (let r = 0; r < (b.repeats ?? 0); r++) b.rows[0].forEach((cell) => out.push(...words(cell)));
        b.rows.forEach((row) => row.forEach((cell) => out.push(...words(cell))));
      } else if (b.t === "callout") { out.push(...words(b.label)); b.body.forEach((x) => out.push(...words(x))); }
      else if (b.t === "flow") b.steps.forEach((x) => out.push(...words(x)));
    }
  }
  return unwrap(out);
}
// Python sorts code points; JavaScript's default sort compares UTF-16 units. Compare by code point so the two agree.
const byCodePoint = (a: string, b: string) => {
  const A = [...a].map((ch) => ch.codePointAt(0)!);
  const B = [...b].map((ch) => ch.codePointAt(0)!);
  for (let i = 0; i < Math.min(A.length, B.length); i++) if (A[i] !== B[i]) return A[i] - B[i];
  return A.length - B.length;
};
const fingerprints = json<Record<string, { words: number; sha256: string }>>("content/book/fingerprints.json");
const chapterFiles = fs.readdirSync(path.join(root, "content/book/chapters")).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).sort();
assert.equal(chapterFiles.length, 84, `the book has 84 chapters, found ${chapterFiles.length}`);
assert.deepEqual(Object.keys(fingerprints).sort(), chapterFiles, "every chapter needs a fingerprint (re-run scripts/book/check-verbatim.py)");
let bookWords = 0;
for (const f of chapterFiles) {
  const c = json<BookChapter>(`content/book/chapters/${f}.json`);
  const w = chapterWords(c);
  bookWords += w.length;
  const sha = crypto.createHash("sha256").update([...w].sort(byCodePoint).join("\n")).digest("hex");
  assert.equal(w.length, fingerprints[f].words, `${f}: ${w.length} words, the book has ${fingerprints[f].words} (the chapter text was changed)`);
  assert.equal(sha, fingerprints[f].sha256, `${f}: the chapter's words differ from the book (the text was changed by hand)`);
  const text = JSON.stringify(c);
  assert.ok(!/Figure\s+[\d.]+\s*\(needed\)/.test(text), `${f}: a "Figure (needed)" placeholder must stay hidden`);
  assert.ok(c.title.length > 3 && c.sections.length > 0, `${f}: no title or sections`);
}

// 3. Placement: every chapter is placed once; every guide and foundation chapter has its page data.
assert.deepEqual(chapterMap.map((p) => p.file).sort(), chapterFiles, "content/book/map.ts must place every chapter exactly once");
const catalog = json<CatalogItem[]>("src/lib/conditions/generated/catalog.json");
const foundations = json<FoundationItem[]>("src/lib/conditions/generated/foundations.json");
const slugs = catalog.map((c) => c.slug);
assert.equal(new Set(slugs).size, slugs.length, "duplicate condition slug");
assert.equal(catalog.length, chapterMap.filter((p) => p.kind === "condition").length, "every condition chapter needs a guide");
assert.equal(foundations.length, chapterMap.filter((p) => p.kind === "foundation").length, "every foundation chapter needs a page");
const areaIds = new Set(areas.map((a) => a.id));
const typeIds = new Set(types.map((t) => t.id));
for (const a of areas) assert.ok(catalog.some((c) => c.area === a.id), `area "${a.label}" has no condition`);

for (const item of catalog) {
  const d = json<ConditionDetail>(`public/conditions-data/${item.slug}.json`);
  const where = item.slug;
  assert.ok(areaIds.has(item.area) && typeIds.has(item.type), `${where}: unknown area or type`);
  assert.ok(d.book && d.book.sections.length >= 5, `${where}: the chapter is missing from the guide`);
  assert.ok(item.letters.startsWith("A"), `${where}: the chapter has no Section A`);
  assert.ok(item.summary.length >= 60, `${where}: summary too short`);
  assert.ok(d.quick.looksLike.length >= 1 || !item.letters.includes("B"), `${where}: Section B gave no presentation lines`);
  assert.ok(item.letters.includes("G") && item.redFlags.length >= 1, `${where}: no red flags`);
  assert.ok(item.firstSteps.length >= 1, `${where}: no first steps`);
  assert.equal(d.name, d.book!.title, `${where}: the guide's name must be the chapter title`);
}
for (const f of foundations) {
  const d = json<{ book: BookChapter }>(`public/conditions-data/foundations/${f.slug}.json`);
  assert.ok(d.book?.sections.length, `foundations/${f.slug}: no chapter`);
}

// 4. Roman Urdu help: PNA's own words, for the right chapter and sections, in Roman letters.
const helpDir = path.join(root, "content/book/help");
const helps = fs.existsSync(helpDir) ? fs.readdirSync(helpDir).filter((f) => f.endsWith(".json")) : [];
for (const f of helps) {
  const slug = f.replace(/\.json$/, "");
  const place = chapterMap.find((p) => p.slug === slug);
  assert.ok(place, `content/book/help/${f}: no chapter has the address ${slug}`);
  const h = json<BookHelp>(`content/book/help/${f}`);
  assert.equal(h.chapter, place!.file, `content/book/help/${f}: written for ${h.chapter}, but ${slug} is ${place!.file}`);
  const chapter = json<BookChapter>(`content/book/chapters/${place!.file}.json`);
  const keys = new Set(chapter.sections.map((s) => s.key));
  for (const [k, text] of Object.entries(h.sections)) {
    assert.ok(keys.has(k), `content/book/help/${f}: section "${k}" is not in the chapter`);
    assert.ok(text.trim().length >= 20, `content/book/help/${f}: section "${k}" is too short`);
    assert.ok(!/[؀-ۿ]/.test(text), `content/book/help/${f}: section "${k}" must be Roman Urdu (Latin letters), not Urdu script`);
  }
}

// 5. Every old address still lands somewhere: a guide, or a redirect (renamed or retired guides).
const redirects = json<{ source: string; destination: string }[]>("src/lib/conditions/generated/redirects.json");
const redirected = new Map(redirects.map((r) => [r.source.replace("/conditions/", ""), r.destination]));
const lands = (slug: string) => slugs.includes(slug) || redirected.has(slug);
const legacyPlanNames: Record<string, string> = { "nonspecific-low-back-pain": "non-specific-low-back-pain", "rotator-cuff-related-shoulder-pain": "rotator-cuff-tendinopathy", "lateral-elbow-tendinopathy": "lateral-epicondylalgia" };
for (const old of mskConditionIndex.map((c) => c.slug)) assert.ok(lands(old), `old /msk-injuries/${old} would 404`);
for (const plan of treatmentPlans.map((p) => p.slug)) assert.ok(lands(legacyPlanNames[plan] ?? plan), `old /treatment-plans/${plan} would 404`);
for (const r of redirects) {
  const dest = r.destination.replace(/^\/conditions\/?/, "");
  assert.ok(dest === "" || slugs.includes(dest), `${r.source} redirects to ${r.destination}, which is not a guide`);
}
for (const old of Object.keys(retired)) assert.ok(!slugs.includes(old), `${old} is retired but still a guide`);

// 6. Redirects for retired sections and for renamed guides are wired.
const config = read("next.config.js");
assert.ok(config.includes("src/lib/conditions/generated/redirects.json"), "next.config.js must load the generated guide redirects");
for (const needle of ["/knowledge-hub/:path*", "'/knowledge-hub'", "'/clinical-arena'", "'/msk-injuries/:slug'", "'/treatment-plans/:slug'", ...Object.keys(legacyPlanNames).map((k) => `/treatment-plans/${k}`)]) {
  assert.ok(config.includes(needle), `next.config.js is missing a redirect for ${needle}`);
}

// 7. Nothing links to a retired section or to a guide address that only redirects now.
const retiredSections = [/["'`(]\/knowledge-hub[/"'`?#)]/, /["'`(]\/clinical-arena["'`?#)]/, /["'`(]\/msk-injuries[/"'`?#)]/, /["'`(]\/treatment-plans[/"'`?#)]/];
const oldGuide = new RegExp(`/conditions/(${[...redirected.keys()].join("|")})(?=["'\`#?)\\s])`);
const offenders: string[] = [];
(function walk(dir: string) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!rel.includes("generated")) walk(rel); continue; }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    const text = read(rel);
    if (retiredSections.some((re) => re.test(text))) offenders.push(`${rel} (retired section)`);
    const m = text.match(oldGuide);
    if (m) offenders.push(`${rel} (${m[0]})`);
  }
})("src");
assert.deepEqual(offenders, [], `these files still link to retired places: ${offenders.join(", ")}`);
for (const gone of ["src/app/knowledge-hub", "src/app/clinical-arena", "src/app/msk-injuries", "src/app/treatment-plans"]) assert.ok(!fs.existsSync(path.join(root, gone)), `${gone} should be removed`);

// 8. Pages, sitemap and homepage are wired.
for (const page of ["src/app/conditions/page.tsx", "src/app/conditions/[slug]/page.tsx", "src/app/conditions/foundations/page.tsx", "src/app/conditions/foundations/[slug]/page.tsx"]) assert.ok(fs.existsSync(path.join(root, page)), `${page} missing`);
assert.ok(read("src/app/conditions/[slug]/page.tsx").includes("BookGuide"), "condition pages must show the book chapter");
const sitemap = read("src/app/sitemap.ts");
assert.ok(sitemap.includes("conditionRoutes") && sitemap.includes("foundationRoutes"), "sitemap must list every condition and foundation chapter");
assert.ok(read("src/components/home/PremiumPathwayBrowser.tsx").includes('href: "/conditions"'), "homepage pathways must link to /conditions");

console.log(
  `Conditions guide checks passed: ${catalog.length} conditions + ${foundations.length} foundation chapters from the book (${bookWords} words, unchanged), ${helps.length} Roman Urdu help file(s), ${redirects.length} guide redirects, links verified.`,
);
