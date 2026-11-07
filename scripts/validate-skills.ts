/**
 * Clinical Skills Lab validator — run in CI before every deploy:
 *   npm run validate:skills
 * Fails when the generated data is stale, a skill is missing a level, a question
 * is malformed or ambiguous, a demo/body point is out of range, or a link is dead.
 */
import fs from "node:fs";
import path from "node:path";
import { serializeSkillsData } from "../src/lib/skills/build-data.ts";
import { compileSkill } from "../src/lib/skills/compile.ts";
import { skillDefinitions } from "../src/lib/skills/registry.ts";
import { SKILL_LEVELS, type SkillData, type SkillDefinition, type SkillLevelId } from "../src/lib/skills/types.ts";

const root = process.cwd();
const failures: string[] = [];
const fail = (where: string, message: string) => failures.push(`${where}: ${message}`);

const LEVELS = SKILL_LEVELS.map((level) => level.id);
const POSES = new Set(["supine", "prone", "sitting", "sidelying", "standing", "hooklying"]);
const PHASES = new Set(["measure", "neuro", "patient"]);
const SIMULATORS = new Set(["goniometer", "mmt-grade", "body-map", "reflex-grade", "mas-grade", "vitals"]);
const ICONS = new Set(["mmt", "goniometer", "dermatomes", "myotomes", "reflexes", "nerves", "tone", "length", "vitals", "posture", "balance", "measures", "palpation", "gait", "network"]);
const MIN_QUESTIONS_PER_LEVEL = 9; // a level test draws 9 from its own level
const MIN_BEGINNER_QUESTIONS = 12; // the Beginner test has no earlier level to borrow from
const MIN_EXPERT_CASES = 8;

/* 1. Generated files are up to date ------------------------------------------------ */
const expected = serializeSkillsData();
for (const [file, content] of Object.entries(expected)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) fail(file, "missing — run npm run build:skills-data");
  else if (fs.readFileSync(full, "utf8") !== content) fail(file, "stale — run npm run build:skills-data");
}
const dataDir = path.join(root, "public/skills-data");
for (const file of fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : []) {
  if (!expected[`public/skills-data/${file}`]) fail(`public/skills-data/${file}`, "orphan file — run npm run build:skills-data");
}

/* 2. Link targets that exist in the app -------------------------------------------- */
const slugs = new Set(skillDefinitions.map((skill) => skill.slug));
const lessonDir = path.join(root, "public/teacher-data/lessons");
const lessons = new Set(fs.existsSync(lessonDir) ? fs.readdirSync(lessonDir).map((file) => file.replace(/\.json$/, "")) : []);
function linkExists(href: string): boolean {
  const skill = /^\/skills\/([a-z0-9-]+)$/.exec(href);
  if (skill) return slugs.has(skill[1]);
  const lesson = /^\/learn\/([a-z0-9-]+)$/.exec(href);
  if (lesson) return lessons.has(lesson[1]);
  const page = path.join(root, "src/app", href, "page.tsx");
  return fs.existsSync(page);
}

/* 3. Per-skill checks ----------------------------------------------------------------- */
const textProblems = (text: string) => {
  const problems: string[] = [];
  if (/\s{2,}/.test(text)) problems.push("double space");
  if (/\.\.(?!\.)/.test(text)) problems.push("double full stop");
  if (/\bundefined\b|\bnull\b|\[object/.test(text)) problems.push("template leak");
  if (text !== text.trim()) problems.push("leading/trailing space");
  return problems;
};

function normalMax(value: string): number | null {
  const match = value.match(/0\s*[–-]\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function checkSkill(skill: SkillDefinition, data: SkillData) {
  const at = (part: string) => `${skill.slug} › ${part}`;

  if (!/^[a-z0-9-]+$/.test(skill.slug)) fail(skill.slug, "slug must be lowercase-kebab");
  if (!PHASES.has(skill.phase)) fail(at("phase"), `unknown phase ${skill.phase}`);
  if (!ICONS.has(skill.icon)) fail(at("icon"), `no SkillIcon for "${skill.icon}"`);
  for (const sim of skill.simulators) if (!SIMULATORS.has(sim)) fail(at("simulators"), `unknown simulator ${sim}`);
  for (const level of LEVELS) if (!skill.goals[level]) fail(at("goals"), `missing goal for ${level}`);
  if (skill.sources.length < 2) fail(at("sources"), "cite at least two sources");
  for (const link of skill.related ?? []) if (!linkExists(link.href)) fail(at("related"), `dead link ${link.href}`);

  // Concepts: every level taught.
  const conceptIds = new Set<string>();
  for (const concept of skill.concepts) {
    if (conceptIds.has(concept.id)) fail(at(`concept ${concept.id}`), "duplicate id");
    conceptIds.add(concept.id);
    if (!concept.body.trim()) fail(at(`concept ${concept.id}`), "empty body");
    for (const row of concept.table?.rows ?? []) {
      if (row.length !== concept.table!.head.length) fail(at(`concept ${concept.id}`), "table row/head length mismatch");
    }
  }
  for (const level of LEVELS) {
    if (!skill.concepts.some((concept) => concept.level === level)) fail(at("concepts"), `no ${level} concept`);
  }

  // Atlas.
  const atlasIds = new Set<string>();
  for (const item of skill.atlas) {
    if (atlasIds.has(item.id)) fail(at(`atlas ${item.id}`), "duplicate id");
    atlasIds.add(item.id);
    const labels = new Set<string>();
    for (const field of item.fields) {
      if (labels.has(field.label)) fail(at(`atlas ${item.id}`), `duplicate field ${field.label}`);
      labels.add(field.label);
      if (!field.value.trim()) fail(at(`atlas ${item.id}`), `empty field ${field.label}`);
      for (const problem of textProblems(field.value)) fail(at(`atlas ${item.id} › ${field.label}`), problem);
      if (!LEVELS.includes(field.level)) fail(at(`atlas ${item.id}`), `bad level on ${field.label}`);
    }
    if (item.demo) {
      const demo = item.demo;
      if (!POSES.has(demo.pose)) fail(at(`atlas ${item.id}`), `bad demo pose ${demo.pose}`);
      for (const key of ["prox", "from", "rom"] as const) {
        if (!Number.isFinite(demo[key])) fail(at(`atlas ${item.id}`), `demo ${key} not a number`);
      }
      if (Math.abs(demo.rom) < 5 || Math.abs(demo.rom) > 200) fail(at(`atlas ${item.id}`), `demo rom ${demo.rom} out of range`);
      if (demo.goniometer && skill.simulators.includes("goniometer")) {
        const range = item.fields.find((field) => field.label === "Normal range")?.value;
        if (range && normalMax(range) === null) fail(at(`atlas ${item.id}`), `goniometer item's Normal range "${range}" must read 0–N°`);
      }
    }
    if (item.point) {
      const { x, y, view } = item.point;
      if (view !== "front" && view !== "back") fail(at(`atlas ${item.id}`), "point view must be front/back");
      if (!(x >= 0 && x <= 200 && y >= 0 && y <= 440)) fail(at(`atlas ${item.id}`), `point (${x}, ${y}) outside the 200×440 chart`);
    }
  }
  if (skill.simulators.includes("body-map")) {
    const points = skill.atlas.filter((item) => item.point);
    if (points.length < 4) fail(at("body-map"), "needs at least 4 atlas points");
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i].point!;
        const b = points[j].point!;
        if (a.view === b.view && Math.hypot(a.x - b.x, a.y - b.y) < 6) fail(at("body-map"), `${points[i].id} and ${points[j].id} are too close to tell apart`);
      }
    }
  }
  if (skill.simulators.includes("goniometer")) {
    const usable = skill.atlas.filter((item) => item.demo?.goniometer && normalMax(item.fields.find((field) => field.label === "Normal range")?.value ?? ""));
    if (usable.length < 3) fail(at("goniometer"), "needs at least 3 measurable items");
  }
  if (skill.simulators.includes("mmt-grade") && !skill.atlas.some((item) => item.fields.some((field) => field.label === "Position (grades 0–2)"))) fail(at("mmt-grade"), "no gravity-minimised positions");
  if (skill.simulators.includes("reflex-grade") && !skill.atlas.some((item) => item.fields.some((field) => field.label === "Tap"))) fail(at("reflex-grade"), "no reflex items with a Tap field");

  // Questions (compiled — includes generated ones).
  const questionIds = new Set<string>();
  const perLevel: Record<SkillLevelId, number> = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
  for (const question of data.questions) {
    const where = at(`question ${question.id}`);
    if (questionIds.has(question.id)) fail(where, "duplicate id");
    questionIds.add(question.id);
    perLevel[question.level] += 1;
    if (question.options.length !== 4) fail(where, `has ${question.options.length} options (need 4)`);
    if (new Set(question.options.map((option) => option.trim().toLowerCase())).size !== question.options.length) fail(where, "duplicate options");
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) fail(where, "answer index out of range");
    if (!question.explain.trim()) fail(where, "missing explanation");
    for (const problem of [...textProblems(question.prompt), ...textProblems(question.explain)]) fail(where, problem);
    const correct = question.options[question.answer]?.toLowerCase() ?? "";
    for (const [index, option] of question.options.entries()) {
      if (index === question.answer) continue;
      const other = option.toLowerCase();
      if (other.includes(correct) || correct.includes(other)) fail(where, `option "${option}" overlaps the answer`);
    }
  }
  if (perLevel.beginner < MIN_BEGINNER_QUESTIONS) fail(at("questions"), `only ${perLevel.beginner} beginner questions (need ${MIN_BEGINNER_QUESTIONS} for a full test)`);
  for (const level of LEVELS) {
    if (perLevel[level] < MIN_QUESTIONS_PER_LEVEL) fail(at("questions"), `only ${perLevel[level]} ${level} questions (need ${MIN_QUESTIONS_PER_LEVEL})`);
  }
  const expertAuthored = skill.questions.filter((question) => question.level === "expert").length;
  if (expertAuthored < MIN_EXPERT_CASES) fail(at("questions"), `only ${expertAuthored} hand-written expert questions (need ${MIN_EXPERT_CASES})`);
  // Authored questions are written answer-first; the build must have moved the answers around.
  const authored = data.questions.filter((question) => !question.id.includes(":"));
  if (authored.length >= 8 && authored.every((question) => question.answer === 0)) fail(at("questions"), "every answer is option A — option arranging failed");

  // Flashcards.
  const cardIds = new Set<string>();
  for (const card of data.cards) {
    if (cardIds.has(card.id)) fail(at(`card ${card.id}`), "duplicate id");
    cardIds.add(card.id);
    if (!card.front.trim() || !card.back.trim()) fail(at(`card ${card.id}`), "empty side");
  }
  if (data.cards.length < 30) fail(at("cards"), `only ${data.cards.length} flashcards`);

  // OSCE stations.
  if (skill.stations.length < 2) fail(at("stations"), "needs at least 2 OSCE stations");
  const stationIds = new Set<string>();
  for (const station of skill.stations) {
    if (stationIds.has(station.id)) fail(at(`station ${station.id}`), "duplicate id");
    stationIds.add(station.id);
    if (station.checklist.length < 5) fail(at(`station ${station.id}`), "checklist needs at least 5 items");
    if (!station.tasks.length) fail(at(`station ${station.id}`), "no tasks");
    if (station.minutes < 3 || station.minutes > 15) fail(at(`station ${station.id}`), `unusual length ${station.minutes} min`);
  }
}

if (slugs.size !== skillDefinitions.length) fail("registry", "duplicate skill slug");
for (const skill of skillDefinitions) checkSkill(skill, compileSkill(skill));

/* 4. App wiring ------------------------------------------------------------------------ */
const sitemap = fs.readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
// The sitemap may list skills from the generated index (preferred) or by hand.
const sitemapCoversSkills = /skillIndex/.test(sitemap);
if (!sitemapCoversSkills && !sitemap.includes('"/skills"')) fail("sitemap", "Skills Lab pages are not in the sitemap");
const academyMap = fs.readFileSync(path.join(root, "src/lib/academy-map.ts"), "utf8");
if (!academyMap.includes('"/skills"')) fail("academy-map", "Skills Lab is missing from the campus map");
for (const slug of slugs) {
  if (!academyMap.includes(`"/skills/${slug}"`)) fail("academy-map", `skillPlaces is missing /skills/${slug} (search and command palette)`);
  if (!sitemapCoversSkills && !sitemap.includes(`/skills/${slug}`)) fail("sitemap", `missing /skills/${slug}`);
}

if (failures.length) {
  console.error(`Skills Lab validation failed (${failures.length}):`);
  for (const message of failures) console.error("  ✗ " + message);
  process.exit(1);
}
const compiled = skillDefinitions.map(compileSkill);
const totals = compiled.reduce((sum, skill) => ({ q: sum.q + skill.questions.length, c: sum.c + skill.cards.length, a: sum.a + skill.atlas.length }), { q: 0, c: 0, a: 0 });
console.log(`Skills Lab OK — ${compiled.length} skills, ${totals.a} atlas items, ${totals.q} questions, ${totals.c} flashcards.`);
