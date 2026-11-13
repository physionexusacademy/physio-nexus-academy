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
import { DEMO3D, DEMO3D_2D_ONLY } from "../src/lib/skills/demo3d.ts";
import { SCENES, SCENES_2D_ONLY } from "../src/lib/skills/scenes.ts";
import { DERMATOME_KEY_IDS } from "../src/lib/skills/scenes/dermatomes.ts";

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
const MIN_CARDS_PER_LEVEL = 9;

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
  // "Examine 15 key nerves…" must match the atlas, so marketing copy never drifts from the content.
  const counted = /\b(\d+)\s+(?:[A-Za-z-]+\s+){0,4}?(joint motions|nerves|tests|muscles|deviations|landmarks)\b/.exec(skill.summary);
  if (counted && Number(counted[1]) !== skill.atlas.length) fail(at("summary"), `says ${counted[1]} ${counted[2]} but the atlas has ${skill.atlas.length}`);

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
  // Every level needs cards, or its Flashcards tab is empty for students studying that level.
  for (const level of LEVELS) {
    const count = data.cards.filter((card) => card.level === level).length;
    if (count < MIN_CARDS_PER_LEVEL) fail(at("cards"), `only ${count} ${level} flashcards (need ${MIN_CARDS_PER_LEVEL})`);
  }

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

/* 3D demonstrations on the Virtual Patient ----------------------------------------- */
{
  const rig = JSON.parse(fs.readFileSync(path.join(root, "src/lib/virtual-patient/generated/rig.json"), "utf8")) as { bones: { name: string }[]; landmarks: Record<string, unknown> };
  const bones = new Set(rig.bones.map((bone) => bone.name));
  const softSites = [...fs.readFileSync(path.join(root, "src/lib/virtual-patient/points.ts"), "utf8").matchAll(/\{ id: "([a-z-]+)", name:/g)].map((m) => m[1]);
  const landmarks = new Set([...Object.keys(rig.landmarks), ...softSites]);
  const DIRECTIONS = new Set(["up", "down", "front", "back", "head", "feet", "lat", "med"]);
  const JOINTS = new Set(["shoulder", "elbow", "wrist", "hand", "fingers", "thumb", "hip", "knee", "ankle", "toe"]);
  const POSITIONS = new Set(["standing", "supine", "prone", "sitting", "sidelying"]);
  const FACE = new Set(["nose", "chin", "forehead", "ear"]);
  const pointsSource = fs.readFileSync(path.join(root, "src/lib/virtual-patient/points.ts"), "utf8");
  const keyIds = new Set([...pointsSource.matchAll(/(?:dermatome|nerve)\("([A-Za-z0-9-]+)"/g)].map((m) => m[1]));
  const numbers3 = (text: string) => text.split(",").length === 3 && text.split(",").every((n) => Number.isFinite(Number(n)));
  const pointError = (spec: string, allowDirection: boolean): string | null => {
    let rest = spec;
    // Offsets ({x,y,z}) and floor / axis overrides (|floor, |z=0.2) can come in either order.
    for (let guard = 0; guard < 3; guard++) {
      const shifted = /^(.*)\{([-\d.,\s]+)\}$/.exec(rest);
      if (shifted) {
        if (!numbers3(shifted[2])) return `bad offset in ${spec}`;
        rest = shifted[1];
      }
      const axis = /^(.*)\|(floor|[xyz]=-?[\d.]+)$/.exec(rest);
      if (axis) rest = axis[1];
    }
    if (rest === "zone") return null;
    if (rest.startsWith("key:")) return keyIds.has(rest.slice(4).split(":")[0]) ? null : `unknown key point ${rest}`;
    if (rest.startsWith("^")) return allowDirection && DIRECTIONS.has(rest.slice(1)) ? null : `bad reference line ${spec}`;
    const [pair, weight] = rest.split("*");
    if (weight !== undefined && !(Number(weight) >= 0 && Number(weight) <= 1)) return `bad weight in ${spec}`;
    const parts = pair.split("+");
    if (parts.length > 2) return `too many points in ${spec}`;
    for (const part of parts) {
      let name = part;
      const offset = /^(.*)\[([-\d.,\s]+)\]$/.exec(name);
      if (offset) {
        if (!numbers3(offset[2])) return `bad bone offset in ${spec}`;
        name = offset[1];
      }
      const [id, flag] = name.replace(/>$/, "").split(":");
      if (flag !== undefined && flag !== "o" && flag !== "m") return `bad side flag in ${spec}`;
      if (id.startsWith("@")) {
        if (!landmarks.has(id.slice(1)) && !FACE.has(id.slice(1))) return `unknown landmark ${id}`;
      } else if (!bones.has(id) && !bones.has(`${id}.L`)) return `unknown bone ${id}`;
    }
    return null;
  };
  const bySlug = new Map(skillDefinitions.map((skill) => [skill.slug, skill]));
  for (const [key, spec] of Object.entries(DEMO3D)) {
    const at = `demo3d ${key}`;
    const [slug, ref] = key.split("/");
    const skill = bySlug.get(slug);
    if (!skill) fail(at, "unknown skill");
    else if (ref.startsWith("concept:") ? !skill.concepts.some((c) => c.id === ref.slice(8)) : !skill.atlas.some((item) => item.id === ref)) fail(at, "no such atlas item or concept");
    if (!POSITIONS.has(spec.position)) fail(at, `unknown position ${spec.position}`);
    if (!spec.range.every(Number.isFinite) || spec.range[0] === spec.range[1]) fail(at, "range must be two different numbers");
    if (!(spec.zoom > 0.15 && spec.zoom < 4)) fail(at, "zoom out of range");
    if (spec.view.every((v) => v === 0)) fail(at, "view direction is zero");
    if (spec.kind === "rom" && !spec.gonio) fail(at, "a goniometry demo needs a goniometer");
    const points: [string, boolean][] = [[spec.focus, false], ...(spec.push ? [[spec.push, false] as [string, boolean]] : []), ...(spec.stab ? [[spec.stab, false] as [string, boolean]] : []), ...(spec.planted ? [[spec.planted, false] as [string, boolean]] : [])];
    if (spec.gonio) points.push([spec.gonio.axis, false], [spec.gonio.fixed, true], [spec.gonio.moving, true]);
    for (const [point, allowDirection] of points) {
      const error = pointError(point, allowDirection);
      if (error) fail(at, error);
    }
    for (const side of ["left", "right"] as const) {
      for (const a of [spec.range[0], (spec.range[0] + spec.range[1]) / 2, spec.range[1]]) {
        for (const [poseKey, angles] of Object.entries(spec.move(side, a))) {
          const [joint, poseSide] = poseKey.split(".");
          const valid = poseKey === "neck" || poseKey === "trunk" || poseKey === "head" || (JOINTS.has(joint) && (poseSide === "left" || poseSide === "right"));
          if (!valid) fail(at, `unknown pose key ${poseKey}`);
          for (const value of Object.values(angles ?? {})) if (!Number.isFinite(value) || Math.abs(value as number) > 200) fail(at, `${poseKey} angle out of range at ${a}`);
        }
      }
    }
  }
  /* 3D scenes (dermatomes, nerves, reflexes, tone, vitals, posture, measures, balance, palpation) */
  const NEW_SKILLS = ["dermatomes", "myotomes", "reflexes", "peripheral-nerves", "tone-coordination", "vital-signs", "posture", "balance-function", "limb-measurements", "palpation"];
  const DERMATOMES = new Set(["C2", "C3", "C4", "C5", "C6", "C7", "C8", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "L1", "L2", "L3", "L4", "L5", "S1", "S2"]);
  const NERVES = new Set(["trigeminal", "axillary", "radial", "musculocutaneous", "median", "ulnar", "medial-antebrachial", "lateral-femoral-cutaneous", "femoral", "obturator", "saphenous", "superficial-fibular", "deep-fibular", "sural", "tibial", "posterior-femoral-cutaneous"]);
  const PROPS = new Set(["chair", "wall", "foam", "cones", "walkway", "block"]);
  for (const id of DERMATOME_KEY_IDS) if (!keyIds.has(id)) fail("scenes", `dermatome key point ${id} is not in virtual-patient/points.ts`);
  for (const [key, scene] of Object.entries(SCENES)) {
    const at = `scene ${key}`;
    const [slug, ref] = key.split("/");
    const skill = bySlug.get(slug);
    if (!skill) fail(at, "unknown skill");
    else if (ref.startsWith("concept:") ? !skill.concepts.some((c) => c.id === ref.slice(8)) : !skill.atlas.some((item) => item.id === ref)) fail(at, "no such atlas item or concept");
    if (DEMO3D[key]) fail(at, "also has a joint-movement demo");
    if (!POSITIONS.has(scene.position)) fail(at, `unknown position ${scene.position}`);
    if (!(scene.loopMs >= 4000 && scene.loopMs <= 30000)) fail(at, "loopMs should be 4–30 s");
    if (!(scene.frame.zoom > 0.3 && scene.frame.zoom < 6)) fail(at, "zoom out of range");
    if (scene.frame.view.every((v) => v === 0)) fail(at, "view direction is zero");
    if (scene.beats.length < 2) fail(at, "needs at least two beats");
    let last = 0;
    for (const beat of scene.beats) {
      if (!(beat.to > last && beat.to <= 1)) fail(at, `beat times must rise to 1 (${beat.to})`);
      last = beat.to;
    }
    if (last !== 1) fail(at, "the last beat must end at 1");
    for (const point of [scene.frame.focus, ...(scene.frame.around ?? [])]) {
      const error = pointError(point, false);
      if (error) fail(at, `frame: ${error}`);
    }
    if (scene.planted) {
      const error = pointError(scene.planted, false);
      if (error) fail(at, `planted: ${error}`);
      for (const w of scene.plantedWhen ?? []) if (!(w[0] >= 0 && w[1] <= 1 && w[0] < w[1])) fail(at, "bad plantedWhen window");
    }
    for (const kind of scene.props ?? []) if (!PROPS.has(kind.kind)) fail(at, `unknown prop ${kind.kind}`);
    for (const d of scene.zone?.dermatomes ?? []) if (!DERMATOMES.has(d)) fail(at, `unknown dermatome ${d}`);
    for (const n of scene.zone?.nerves ?? []) if (!NERVES.has(n)) fail(at, `unknown nerve territory ${n}`);
    for (const o of scene.overlays ?? []) {
      const points: string[] = o.t === "beacon" || o.t === "touch" || o.t === "hammer" || o.t === "device" || o.t === "ring" ? [o.at] : o.t === "path" ? o.pts : o.t === "line" ? [o.from, o.to] : o.t === "arrow" ? [o.at, o.to] : o.t === "angle" ? [o.vertex, o.a, o.b] : o.t === "plumb" ? [o.from, ...o.marks.map((m) => m.at)] : [];
      if (o.t === "touch" && o.to) points.push(o.to);
      if (o.t === "device" && o.to) points.push(o.to);
      if (o.t === "ring") points.push(...o.along);
      if (o.t === "touch" && o.style === "stroke" && !o.to) fail(at, "a stroke needs a destination");
      if (o.t === "hammer" && !(o.when[0] < o.when[1])) fail(at, "hammer window");
      for (const point of points) {
        const error = pointError(point, false);
        if (error) fail(at, `overlay ${o.t}: ${error}`);
      }
      if ("when" in o && o.when && !(o.when[0] >= 0 && o.when[1] <= 1 && o.when[0] < o.when[1])) fail(at, `overlay ${o.t} has a bad window`);
    }
    for (const side of ["left", "right"] as const) {
      const optionSets: Record<string, string>[] = [{}];
      for (const option of scene.options ?? []) for (const choice of option.choices) optionSets.push({ ...Object.fromEntries((scene.options ?? []).map((o) => [o.id, o.initial ?? o.choices[0].id])), [option.id]: choice.id });
      for (const opt of optionSets) {
        for (const u of [0, 0.13, 0.31, 0.5, 0.67, 0.86, 1]) {
          const c = { side, u, ms: u * scene.loopMs, opt };
          for (const beat of scene.beats) if (typeof beat.text === "function" && !String(beat.text(c)).length) fail(at, "empty beat text");
          for (const [poseKey, angles] of Object.entries(scene.pose?.(side, u, c) ?? {})) {
            const [joint, poseSide] = poseKey.split(".");
            const valid = poseKey === "neck" || poseKey === "trunk" || poseKey === "head" || (JOINTS.has(joint) && (poseSide === "left" || poseSide === "right"));
            if (!valid) fail(at, `unknown pose key ${poseKey}`);
            for (const value of Object.values(angles ?? {})) if (!Number.isFinite(value) || Math.abs(value as number) > 200) fail(at, `${poseKey} angle out of range at u=${u}`);
          }
          const r = scene.root?.(side, u, c);
          if (r && !Object.values(r).every((v) => v === undefined || Number.isFinite(v))) fail(at, "root movement is not finite");
          for (const h of scene.hud ?? []) {
            if (h.t === "stat") { const v = typeof h.value === "function" ? h.value(c) : h.value; if (typeof v !== "string") fail(at, "stat value must be text"); }
            if (h.t === "bar" || h.t === "scale") { const v = h.value(c); if (!Number.isFinite(v)) fail(at, `${h.t} value is not finite at u=${u}`); }
            if (h.t === "timer") { const v = h.seconds(c); if (!Number.isFinite(v)) fail(at, "timer is not finite"); }
            if (h.t === "curve") { const v = h.resist(0.5, c); if (!Number.isFinite(v) || !Number.isFinite(h.angle(c))) fail(at, "curve is not finite"); }
          }
        }
      }
    }
  }
  const only2dScenes = new Set([...DEMO3D_2D_ONLY, ...SCENES_2D_ONLY]);
  for (const key of SCENES_2D_ONLY) {
    const [slug, id] = key.split("/");
    if (!bySlug.get(slug)?.atlas.some((item) => item.id === id)) fail(`scene 2D-only ${key}`, "no such atlas item");
    if (SCENES[key] || DEMO3D[key]) fail(`scene 2D-only ${key}`, "also has a 3D demonstration");
  }
  for (const slug of NEW_SKILLS) {
    for (const item of bySlug.get(slug)?.atlas ?? []) {
      const key = `${slug}/${item.id}`;
      if (!SCENES[key] && !DEMO3D[key] && !only2dScenes.has(key)) fail(`scene ${key}`, "has no 3D demonstration (add a scene or list it in SCENES_2D_ONLY)");
    }
  }

  // Every 2D diagram in these skills has a 3D demonstration, unless it is listed as 2D-only.
  const only2d = new Set(DEMO3D_2D_ONLY);
  for (const key of only2d) {
    const [slug, id] = key.split("/");
    if (!bySlug.get(slug)?.atlas.some((item) => item.id === id)) fail(`demo3d 2D-only ${key}`, "no such atlas item");
    if (DEMO3D[key]) fail(`demo3d 2D-only ${key}`, "also has a 3D demo");
  }
  for (const slug of ["goniometry", "manual-muscle-testing", "muscle-length"]) {
    for (const item of bySlug.get(slug)?.atlas ?? []) {
      const key = `${slug}/${item.id}`;
      if (item.demo && !DEMO3D[key] && !only2d.has(key)) fail(`demo3d ${key}`, "has a 2D diagram but no 3D demonstration (add one or list it in DEMO3D_2D_ONLY)");
    }
  }
}

if (failures.length) {
  console.error(`Skills Lab validation failed (${failures.length}):`);
  for (const message of failures) console.error("  ✗ " + message);
  process.exit(1);
}
const compiled = skillDefinitions.map(compileSkill);
const totals = compiled.reduce((sum, skill) => ({ q: sum.q + skill.questions.length, c: sum.c + skill.cards.length, a: sum.a + skill.atlas.length }), { q: 0, c: 0, a: 0 });
console.log(`Skills Lab OK — ${compiled.length} skills, ${totals.a} atlas items, ${totals.q} questions, ${totals.c} flashcards, ${Object.keys(DEMO3D).length + Object.keys(SCENES).length} 3D demonstrations (${Object.keys(SCENES).length} scenes).`);
