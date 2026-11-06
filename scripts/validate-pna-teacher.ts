/**
 * PNA Teacher content + progress validator.
 * Run: npm run validate:teacher
 *
 * Content: bilingual copy everywhere, exactly one correct answer per check,
 * unique ids, and every internal link resolves to a real page.
 * Progress: XP is awarded once, flashcards are scheduled, missions are idempotent.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { teacherLessons } from "../src/lib/teacher/lessons/index.ts";
import { recommendPathSlug, teacherPaths } from "../src/lib/teacher/paths.ts";
import type { BiText, TeacherGoal, TeacherStage } from "../src/lib/teacher/types.ts";

const root = process.cwd();
const failures: string[] = [];
const check = (condition: unknown, message: string) => {
  if (!condition) failures.push(message);
};

/* ---------- route resolution ---------- */

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const libSource = walk(path.join(root, "src/lib"))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
const knownSlugs = new Set([...libSource.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((match) => match[1]));

function routeExists(href: string): boolean {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean.startsWith("/")) return false;
  if (fs.existsSync(path.join(root, "src/app", clean, "page.tsx"))) return true;
  const parts = clean.split("/").filter(Boolean);
  const slug = parts.pop();
  const parent = path.join(root, "src/app", ...parts);
  return Boolean(slug) && fs.existsSync(path.join(parent, "[slug]", "page.tsx")) && knownSlugs.has(slug!);
}

/* ---------- content ---------- */

function bi(text: BiText | undefined, where: string) {
  check(text && text.en.trim().length > 0, `${where}: missing English`);
  check(text && text.ur.trim().length > 0, `${where}: missing Roman Urdu`);
  check(text && (text.en.split("**").length - 1) % 2 === 0, `${where}: unbalanced **bold** markers (en)`);
  check(text && (text.ur.split("**").length - 1) % 2 === 0, `${where}: unbalanced **bold** markers (ur)`);
}

const lessonSlugs = new Set<string>();
const cardIds = new Set<string>();
let beatCount = 0;
let checkCount = 0;

for (const lesson of teacherLessons) {
  const at = `lesson ${lesson.slug}`;
  check(/^[a-z0-9-]+$/.test(lesson.slug), `${at}: invalid slug`);
  check(!["paths", "review"].includes(lesson.slug), `${at}: slug collides with a /learn route`);
  check(!lessonSlugs.has(lesson.slug), `${at}: duplicate slug`);
  lessonSlugs.add(lesson.slug);
  bi(lesson.hook, `${at} hook`);
  bi(lesson.goal, `${at} goal`);
  check(lesson.minutes >= 5 && lesson.minutes <= 20, `${at}: minutes out of range`);
  check(lesson.beats.length >= 10, `${at}: needs at least 10 beats`);
  check(lesson.summary.length === 3, `${at}: summary must have exactly 3 points`);
  lesson.summary.forEach((point, i) => bi(point, `${at} summary ${i}`));
  check(lesson.flashcards.length >= 4, `${at}: needs at least 4 flashcards`);
  check(lesson.sources.length >= 2, `${at}: needs at least 2 sources`);
  check(lesson.goDeeper.length >= 2, `${at}: needs at least 2 go-deeper links`);

  const checks = lesson.beats.filter((beat) => beat.type === "check");
  check(checks.length >= 3, `${at}: needs at least 3 understanding checks`);
  check(lesson.beats.some((beat) => beat.type === "analogy"), `${at}: needs an analogy`);
  check(lesson.beats.some((beat) => beat.type === "mistake"), `${at}: needs a common-mistake beat`);
  check(lesson.beats.some((beat) => beat.type === "clinic"), `${at}: needs a clinical-application beat`);
  check(lesson.beats[0].type !== "check", `${at}: should not open with a question before teaching`);

  lesson.beats.forEach((beat, index) => {
    beatCount += 1;
    const where = `${at} beat ${index} (${beat.type})`;
    switch (beat.type) {
      case "say":
      case "analogy":
        bi(beat.text, where);
        if (beat.simpler) bi(beat.simpler, `${where} simpler`);
        break;
      case "memory":
      case "mistake":
      case "clinic":
        bi(beat.text, where);
        break;
      case "widget":
        bi(beat.intro, where);
        check(
          fs.readdirSync(path.join(root, "src/components/teacher/widgets")).some((file) =>
            fs.readFileSync(path.join(root, "src/components/teacher/widgets", file), "utf8").includes(`data-pna-widget="${beat.widget}"`),
          ),
          `${where}: widget "${beat.widget}" has no component`,
        );
        break;
      case "check": {
        checkCount += 1;
        bi(beat.question, where);
        if (beat.hint) bi(beat.hint, `${where} hint`);
        check(beat.options.length >= 2 && beat.options.length <= 4, `${where}: needs 2–4 options`);
        check(beat.options.filter((option) => option.correct).length === 1, `${where}: needs exactly one correct option`);
        beat.options.forEach((option, o) => {
          bi(option.text, `${where} option ${o}`);
          bi(option.feedback, `${where} feedback ${o}`);
        });
        break;
      }
      case "try":
        bi(beat.title, where);
        bi(beat.ask, `${where} ask`);
        check(beat.steps.length >= 1, `${where}: needs steps`);
        beat.steps.forEach((step, s) => bi(step, `${where} step ${s}`));
        check(beat.options.length >= 2, `${where}: needs 2+ reflective options`);
        beat.options.forEach((option, o) => {
          bi(option.text, `${where} option ${o}`);
          bi(option.feedback, `${where} feedback ${o}`);
        });
        break;
      case "sort":
        bi(beat.prompt, where);
        beat.categories.forEach((category, c) => bi(category, `${where} category ${c}`));
        check(beat.items.length >= 4, `${where}: needs 4+ items`);
        check(beat.items.some((item) => item.answer === 0) && beat.items.some((item) => item.answer === 1), `${where}: both categories must be used`);
        beat.items.forEach((item, i) => {
          bi(item.text, `${where} item ${i}`);
          bi(item.why, `${where} why ${i}`);
        });
        break;
      case "compare":
        bi(beat.title, where);
        beat.headers.forEach((header, h) => bi(header, `${where} header ${h}`));
        check(beat.rows.length >= 3, `${where}: needs 3+ rows`);
        beat.rows.forEach((row, r) => row.forEach((cell, c) => bi(cell, `${where} row ${r} col ${c}`)));
        break;
    }
  });

  lesson.flashcards.forEach((card) => {
    check(!cardIds.has(card.id), `${at}: duplicate flashcard id ${card.id}`);
    cardIds.add(card.id);
    bi(card.front, `${at} card ${card.id} front`);
    bi(card.back, `${at} card ${card.id} back`);
  });
  lesson.goDeeper.forEach((link) => {
    check(routeExists(link.href), `${at}: go-deeper link does not resolve: ${link.href}`);
    bi(link.note, `${at} go-deeper note ${link.href}`);
  });
}

/* ---------- paths ---------- */

const pathSlugs = new Set<string>();
for (const learningPath of teacherPaths) {
  const at = `path ${learningPath.slug}`;
  check(!pathSlugs.has(learningPath.slug), `${at}: duplicate slug`);
  pathSlugs.add(learningPath.slug);
  bi(learningPath.tagline, `${at} tagline`);
  learningPath.outcomes.forEach((outcome, i) => bi(outcome, `${at} outcome ${i}`));
  check(learningPath.steps.length >= 5, `${at}: needs 5+ steps`);
  check(learningPath.steps.some((step) => step.kind === "lesson"), `${at}: needs at least one lesson`);
  check(learningPath.steps.some((step) => step.kind === "mission"), `${at}: needs at least one mission`);
  const stepIds = new Set<string>();
  for (const step of learningPath.steps) {
    check(!stepIds.has(step.id), `${at}: duplicate step id ${step.id}`);
    stepIds.add(step.id);
    if (step.kind === "lesson") check(lessonSlugs.has(step.lesson), `${at}: unknown lesson ${step.lesson}`);
    else {
      check(routeExists(step.href), `${at}: mission link does not resolve: ${step.href}`);
      bi(step.mission, `${at} mission ${step.id}`);
    }
  }
}

const stages: TeacherStage[] = ["year1-2", "year3-4", "final-intern", "graduate"];
const goals: TeacherGoal[] = ["understand", "exams", "clinic", "manual"];
for (const stage of stages) {
  for (const goal of goals) {
    check(pathSlugs.has(recommendPathSlug({ stage, goal })), `recommendation for ${stage}/${goal} points to a missing path`);
  }
}

/* ---------- deployment safety ---------- */

for (const page of ["src/app/learn/[slug]/page.tsx", "src/app/learn/paths/[slug]/page.tsx"]) {
  const source = fs.readFileSync(path.join(root, page), "utf8");
  check(!/dynamicParams\s*=\s*false/.test(source), `${page}: dynamicParams must not be false — the Cloudflare Worker has no prerender cache and returns 404`);
  check(source.includes("notFound()"), `${page}: unknown slugs must call notFound()`);
}

/* ---------- progress logic (browser storage simulated) ---------- */

const store = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
    dispatchEvent: () => true,
  },
});

const progress = await import("../src/lib/teacher/progress.ts");
const unified = await import("../src/lib/unified-progress.ts");
const { shiftPakistanDate } = unified;

const lesson = teacherLessons[0];
const first = progress.completeTeacherLesson({
  slug: lesson.slug,
  title: lesson.title,
  firstTryCorrect: 2,
  checks: 3,
  flashcardIds: lesson.flashcards.map((card) => card.id),
});
assert.equal(first.firstCompletion, true, "first completion must be detected");
assert.equal(first.xpAwarded, 40, "lesson XP = 30 + 5 per first-try correct check");
assert.equal(first.newCards, lesson.flashcards.length, "all flashcards must be added on first completion");
assert.equal(unified.getUnifiedProgress().totalXP, 40, "lesson XP must reach the unified progress card");

const replay = progress.completeTeacherLesson({
  slug: lesson.slug,
  title: lesson.title,
  firstTryCorrect: 3,
  checks: 3,
  flashcardIds: lesson.flashcards.map((card) => card.id),
});
assert.equal(replay.xpAwarded, 0, "replaying a lesson must not award XP again");
assert.equal(replay.newCards, 0, "replaying a lesson must not duplicate flashcards");
assert.equal(unified.getUnifiedProgress().totalXP, 40, "replay must not change total XP");

const today = progress.teacherToday();
assert.equal(progress.getDueCardIds().length, 0, "new cards are first due tomorrow, not today");
assert.equal(progress.getDueCardIds(progress.getDeck(), shiftPakistanDate(today, 1)).length, lesson.flashcards.length, "all new cards are due tomorrow");

const cardId = lesson.flashcards[0].id;
progress.reviewCard(cardId, true);
assert.equal(progress.getDeck()[cardId].box, 1, "a known card moves up one box");
assert.equal(progress.getDeck()[cardId].due, shiftPakistanDate(today, progress.REVIEW_INTERVALS[1]), "a known card is scheduled further out");
progress.reviewCard(cardId, false);
assert.equal(progress.getDeck()[cardId].box, 0, "a missed card returns to box 0");
assert.equal(progress.getDeck()[cardId].lapses, 1, "a missed card records a lapse");

const learningPath = teacherPaths[0];
const mission = learningPath.steps.find((step) => step.kind === "mission")!;
progress.completeMission(learningPath.slug, mission.id, "test mission");
progress.completeMission(learningPath.slug, mission.id, "test mission");
assert.equal(unified.getUnifiedProgress().totalXP, 50, "a mission awards 10 XP exactly once");
assert.ok(progress.isStepDone(learningPath, mission, progress.getTeacherProgress()), "completed mission must count as done");
progress.undoMission(learningPath.slug, mission.id);
assert.ok(!progress.isStepDone(learningPath, mission, progress.getTeacherProgress()), "undo must clear a mission");

assert.equal(progress.getTeacherProfile(), null, "no profile before onboarding");
progress.saveTeacherProfile({ v: 1, name: "  Ayesha  ", stage: "year1-2", goal: "exams", minutes: 15, lang: "ur", createdAt: today });
assert.equal(progress.getTeacherProfile()?.name, "Ayesha", "names are trimmed");
assert.equal(progress.getTeacherLang(), "ur", "language preference follows the profile");
store.set("pna-teacher-profile-v1", JSON.stringify({ v: 1, stage: "hacker", goal: "exams" }));
assert.equal(progress.getTeacherProfile(), null, "invalid stored profiles are ignored");

/* ---------- report ---------- */

if (failures.length) {
  console.error(`PNA Teacher validation failed (${failures.length}):`);
  for (const failure of failures) console.error(" ✗ " + failure);
  process.exit(1);
}
console.log(
  `PNA Teacher checks passed: ${teacherLessons.length} lessons, ${beatCount} beats, ${checkCount} understanding checks, ${cardIds.size} flashcards, ${teacherPaths.length} paths, all links resolve, bilingual copy complete, progress/XP/spaced-review logic verified.`,
);
