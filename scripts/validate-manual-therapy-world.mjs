import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { worldManualApproaches } from "../src/lib/manual-therapy-world.ts";

const expected = 13;
const required = [
  "title", "category", "kind", "evidenceLabel", "origin", "summary", "headline",
  "scene", "dialogue", "clue", "plotTwist", "aha", "approach", "patientExplanation",
  "evidence", "myth", "stop", "question", "explanation",
];
assert.equal(worldManualApproaches.length, expected, "The published worldwide collection is incomplete");
assert.equal(new Set(worldManualApproaches.map((item) => item.slug)).size, expected, "Duplicate slugs");

for (const item of worldManualApproaches) {
  assert.match(item.slug, /^[a-z0-9-]+$/, item.slug + ": invalid route slug");
  for (const field of required) {
    assert.equal(typeof item[field], "string", item.slug + ": missing " + field);
    assert(item[field].trim().length > (["title", "category", "kind", "evidenceLabel"].includes(field) ? 6 : 24), item.slug + ": insufficient depth in " + field);
  }
  assert(item.scene.length > 140 && item.dialogue.length > 65, item.slug + ": story is too thin");
  assert(item.clinicFlow.length === 4 && item.clinicFlow.every((step) => step.length > 60),
    item.slug + ": clinic reasoning stages missing");
  assert(item.options.length === 3 && item.options.every((option) => option.length > 16),
    item.slug + ": three distinct answers required");
  assert(new Set(item.options).size === 3, item.slug + ": repeated answer choices");
  assert(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 3, item.slug + ": invalid answer");
  assert(item.sources.length >= 1 && item.sources.every((source) => /^https:\/\//.test(source.url)),
    item.slug + ": cited contextual source required");
}

const content = (path) => readFileSync(path, "utf8");
const hub = content("src/app/manual-therapy/page.tsx");
const detail = content("src/app/manual-therapy/[slug]/page.tsx");
const chapter = content("src/components/manual-therapy/WorldApproachChapter.tsx");
const editorial = content("src/components/manual-therapy/EditorialManualEncyclopedia.tsx");
const editorialCss = content("src/app/manual-therapy/encyclopedia.css");
const artwork = content("src/lib/manual-therapy-editorial-art.ts");
const nextConfig = content("next.config.js");

const oldSource = [
  content("src/lib/manual-therapy.ts"),
  content("src/lib/manual-therapy-additions.ts"),
];
const originalSlugs = oldSource.flatMap((source) => [...source.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]));
assert.equal(originalSlugs.length, 22, "Original 22 technique chapters must be preserved");
assert.equal(new Set(originalSlugs).size, 22, "Duplicate original chapters");
assert(worldManualApproaches.every((item) => !originalSlugs.includes(item.slug)),
  "Worldwide approaches must not overwrite existing technique URLs");

assert(hub.includes("<EditorialManualEncyclopedia"), "Unified library must render editorial chapter component");
assert(editorial.includes('data-pna-library="unified-35-v1"'), "Unified main library marker missing");
assert(editorial.includes("World Manual Therapy Encyclopedia"), "Main heading was not renamed");
assert(hub.includes("...manualTherapyTechniques.map") && hub.includes("...worldManualApproaches.map"),
  "Main library must render all 22 existing and 13 worldwide items");
assert(editorial.includes("href={item.href}"), "All library cards must open their own chapter");
assert(editorial.includes('data-pna-editorial-design="anatomy-luxe-v1"'), "New editorial design marker missing");
assert(editorial.includes('loading="lazy"') && editorial.includes('decoding="async"'), "Illustrative anatomy previews must lazy-load and decode asynchronously");
assert(editorialCss.includes("@media(max-width:740px)") && editorialCss.includes("prefers-reduced-motion"), "Mobile and motion accessibility rules missing");
assert(artwork.includes("getEditorialArt"), "Cached image mapping missing");
assert(!hub.includes('data-pna-world-entry="v1"'), "Remove standalone worldwide promo card");
assert(!hub.includes("Explore the worldwide collection"), "No second collection call-to-action");
assert(detail.includes("...worldManualApproaches.map") && detail.includes("<WorldApproachChapter lesson={worldLesson} />"),
  "13 additional chapters must resolve on the same /manual-therapy/[slug] route");
assert(chapter.includes('data-pna-world-story="v1"') && chapter.includes("lesson.stop")
  && chapter.includes("lesson.evidence"), "Worldwide chapters need narrative, safety and evidence sections");
assert(content("src/app/manual-therapy/world-approaches/page.tsx").includes('redirect("/manual-therapy")'),
  "Legacy collection must redirect home");
assert(content("src/app/manual-therapy/world-approaches/[slug]/page.tsx").includes('redirect("/manual-therapy/" + slug)'),
  "Legacy chapter URLs must redirect to unified root");
assert(nextConfig.includes("source: '/manual-therapy/world-approaches/:slug'"),
  "Legacy chapter links need an SEO-preserving redirect");
assert(content("src/components/manual-therapy/WorldApproachChallenge.tsx").includes("lesson.explanation"),
  "Challenges must reveal clinical reasoning");


const deepFiles = [
  "src/lib/manual-therapy-world-depth-orthopedic.ts",
  "src/lib/manual-therapy-world-depth-osteopathic.ts",
  "src/lib/manual-therapy-world-depth-disputed.ts",
];
const authoredDepth = Object.assign({}, ...deepFiles.map((file) => {
  const raw = content(file);
  const match = raw.match(/= (\{[\s\S]*\});?\s*$/);
  assert(match, "Cannot parse structured expanded lessons: " + file);
  return JSON.parse(match[1]);
}));
assert.deepEqual(Object.keys(authoredDepth).sort(), worldManualApproaches.map((x) => x.slug).sort(),
  "All 13 worldwide approaches need individually authored, matching deep chapters");
for (const [slug, lesson] of Object.entries(authoredDepth)) {
  assert(lesson.opening.length > 175, slug + ": opening lacks narrative depth");
  assert(lesson.principles.length >= 5 && lesson.assessment.length >= 4 &&
    lesson.application.length >= 6, slug + ": theoretical/clinical chapter incomplete");
  for (const field of ["principles", "assessment", "application"]) {
    for (const part of lesson[field]) {
      assert(part.title.length >= 15 && part.body.length >= 125, slug + ": thin " + field + " section");
    }
  }
  for (const stage of ["scene", "findings", "decision", "twist", "finish"]) {
    assert(lesson.caseStudy[stage].length >= 110, slug + ": case misses " + stage);
  }
  for (const field of ["dose", "caution", "memoryHook"]) {
    assert(lesson[field].length >= 35, slug + ": missing " + field);
  }
  for (const field of ["known", "unknown", "communication"]) {
    assert(lesson.evidence[field].length >= 140, slug + ": evidence context lacks " + field);
  }
  assert(lesson.checks.length >= 2 && lesson.checks.every((q) => q.question.length > 30 && q.answer.length > 65),
    slug + ": needs two realistic reasoning checks");
  assert(lesson.sources.length >= 1 && lesson.sources.every((r) => r.url.startsWith("https://")),
    slug + ": missing contextual sources");
  const approximateWords = JSON.stringify(lesson).trim().split(/\\s+/).length;
  assert(approximateWords >= 700, slug + ": less than 700 words of additional depth");
}
assert(chapter.includes("<WorldApproachDeepDive chapter={deep} />"),
  "Deep clinical encyclopedia chapters must actually render on each approach page");
const longChapterComponent = content("src/components/manual-therapy/WorldApproachDeepDive.tsx");
assert(longChapterComponent.includes('data-pna-world-depth="full-chapter-v2"') &&
  longChapterComponent.includes("chapter.application") &&
  longChapterComponent.includes("chapter.evidence.unknown") &&
  longChapterComponent.includes("chapter.caution"),
  "Rendered deep chapter is missing clinical procedure, evidence or safety");
console.log("World Manual Therapy deep chapter validation passed: 13/13 expanded, 5 concepts, 4 assessment lenses, 6+ stages, full case, safety, evidence and quizzes.");

console.log("World Manual Therapy Encyclopedia validation passed: 35/35 chapters on one main library, no separate collection, 13 lessons with safety and quizzes, old URLs preserved.");
