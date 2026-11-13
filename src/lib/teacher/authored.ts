/**
 * Reads PNA Teacher lessons written in the compact `.pna` format (src/lib/teacher/lessons/authored/*.pna).
 * Node-only (build and validate scripts); the app itself serves the generated static JSON.
 *
 * One lesson per file. `key: value` lines; `EN || UR` separates English and Roman Urdu; `\n` inside a value is a line break.
 * See docs/pna-teacher-format.md for the full grammar.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BiText, CheckOption, TeacherArea, TeacherBeat, TeacherLesson } from "./types.ts";

const SEP = " || ";
const CELL = " ;; ";

const unescape = (value: string) => value.replace(/\\n/g, "\n").trim();
const parts = (value: string, sep = SEP) => value.split(sep).map(unescape);
const bi = (en: string, ur: string): BiText => ({ en, ur });

function pair(value: string, where: string): BiText {
  const p = parts(value);
  if (p.length !== 2) throw new Error(`${where}: expected "English || Roman Urdu", got ${p.length} part(s): ${value.slice(0, 80)}`);
  return bi(p[0], p[1]);
}

function quad(value: string, where: string): [BiText, BiText] {
  const p = parts(value);
  if (p.length !== 4) throw new Error(`${where}: expected "a EN || a UR || b EN || b UR", got ${p.length} part(s): ${value.slice(0, 80)}`);
  return [bi(p[0], p[1]), bi(p[2], p[3])];
}

const SIMPLE = new Set(["say", "analogy", "memory", "mistake", "clinic", "safety", "evidence"]);
const BEAT_KEYS = new Set([...SIMPLE, "widget", "demo", "check", "reveal", "steps", "compare", "sort", "case", "try"]);

type Line = { key: string; value: string; n: number };

function tokenize(text: string): Line[] {
  const lines: Line[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const at = line.indexOf(":");
    if (at < 1) throw new Error(`line ${i + 1}: expected "key: value", got: ${line.slice(0, 60)}`);
    lines.push({ key: line.slice(0, at).trim(), value: line.slice(at + 1).trim(), n: i + 1 });
  });
  return lines;
}

export function parseLesson(text: string, file: string): TeacherLesson {
  const lines = tokenize(text);
  const head: Record<string, string> = {};
  const beats: TeacherBeat[] = [];
  const summary: BiText[] = [];
  const flashcards: TeacherLesson["flashcards"] = [];
  const goDeeper: TeacherLesson["goDeeper"] = [];
  const sources: TeacherLesson["sources"] = [];

  let i = 0;
  const at = (line: Line) => `${file}:${line.n}`;
  // Consumes the following lines whose key is in `keys`.
  const follow = (keys: string[]) => {
    const out: Line[] = [];
    while (i < lines.length && keys.includes(lines[i].key)) out.push(lines[i++]);
    return out;
  };

  while (i < lines.length) {
    const line = lines[i++];
    const { key, value } = line;
    const where = at(line);
    if (SIMPLE.has(key)) {
      beats.push({ type: key as "say", text: pair(value, where) });
      const next = follow(["simpler"]);
      if (next.length && (key === "say" || key === "analogy")) {
        (beats[beats.length - 1] as { simpler?: BiText }).simpler = pair(next[0].value, at(next[0]));
      } else if (next.length) throw new Error(`${at(next[0])}: "simpler" only follows say or analogy`);
    } else if (key === "widget") {
      const [widget, rest] = value.split(" :: ");
      beats.push({ type: "widget", widget: widget.trim() as never, intro: pair(rest ?? "", where) });
    } else if (key === "demo") {
      const p = value.split(" :: ");
      if (p.length !== 3) throw new Error(`${where}: demo needs "skill/item :: Title :: EN || UR"`);
      beats.push({ type: "demo", demo: p[0].trim(), title: p[1].trim(), intro: pair(p[2], where) });
    } else if (key === "check") {
      const options: CheckOption[] = [];
      let hint: BiText | undefined;
      for (const opt of follow(["ok", "no", "hint"])) {
        if (opt.key === "hint") hint = pair(opt.value, at(opt));
        else {
          const [text1, feedback] = quad(opt.value, at(opt));
          options.push({ text: text1, feedback, ...(opt.key === "ok" ? { correct: true as const } : {}) });
        }
      }
      beats.push({ type: "check", question: pair(value, where), options, ...(hint ? { hint } : {}) });
    } else if (key === "reveal") {
      const p = parts(value);
      if (p.length !== 4) throw new Error(`${where}: reveal needs "Q EN || Q UR || A EN || A UR"`);
      beats.push({ type: "reveal", question: bi(p[0], p[1]), answer: bi(p[2], p[3]) });
    } else if (key === "steps") {
      const stepLines = follow(["step", "stepsur"]);
      const items = stepLines.filter((l) => l.key === "step").map((l) => {
        const [title, detail] = l.value.split(" :: ");
        if (!detail) throw new Error(`${at(l)}: step needs "title :: detail"`);
        return { title: title.trim(), detail: unescape(detail) };
      });
      const ur = stepLines.find((l) => l.key === "stepsur");
      beats.push({ type: "steps", title: pair(value, where), steps: items, ...(ur ? { ur: unescape(ur.value) } : {}) });
    } else if (key === "compare") {
      const cells = (v: string, w: string) => v.split(CELL).map((c) => pair(c, w));
      const rows = follow(["head", "row"]);
      const headLine = rows.find((l) => l.key === "head");
      if (!headLine) throw new Error(`${where}: compare needs a head line`);
      const headers = cells(headLine.value, at(headLine));
      if (headers.length !== 3) throw new Error(`${at(headLine)}: compare head needs 3 columns separated by " ;; "`);
      const body = rows.filter((l) => l.key === "row").map((l) => {
        const row = cells(l.value, at(l));
        if (row.length !== 3) throw new Error(`${at(l)}: compare row needs 3 cells separated by " ;; "`);
        return row as [BiText, BiText, BiText];
      });
      beats.push({ type: "compare", title: pair(value, where), headers: headers as [BiText, BiText, BiText], rows: body });
    } else if (key === "sort") {
      const sub = follow(["cats", "item"]);
      const catLine = sub.find((l) => l.key === "cats");
      if (!catLine) throw new Error(`${where}: sort needs a cats line`);
      const cats = catLine.value.split(CELL).map((c) => pair(c, at(catLine)));
      if (cats.length !== 2) throw new Error(`${at(catLine)}: sort needs exactly 2 categories separated by " ;; "`);
      const items = sub.filter((l) => l.key === "item").map((l) => {
        const p = parts(l.value);
        if (p.length !== 5) throw new Error(`${at(l)}: item needs "text EN || text UR || 0|1 || why EN || why UR"`);
        return { text: bi(p[0], p[1]), answer: (p[2] === "1" ? 1 : 0) as 0 | 1, why: bi(p[3], p[4]) };
      });
      beats.push({ type: "sort", prompt: pair(value, where), categories: cats as [BiText, BiText], items });
    } else if (key === "case") {
      const p = parts(value);
      if (p.length !== 4) throw new Error(`${where}: case needs "patient || assessment || treatment || reassessment"`);
      const ur = follow(["caseur"])[0];
      beats.push({ type: "case", patient: p[0], assessment: p[1], treatment: p[2], reassess: p[3], ...(ur ? { ur: unescape(ur.value) } : {}) });
    } else if (key === "try") {
      const sub = follow(["tstep", "ask", "topt"]);
      const ask = sub.find((l) => l.key === "ask");
      if (!ask) throw new Error(`${where}: try needs an ask line`);
      beats.push({
        type: "try",
        title: pair(value, where),
        steps: sub.filter((l) => l.key === "tstep").map((l) => pair(l.value, at(l))),
        ask: pair(ask.value, at(ask)),
        options: sub.filter((l) => l.key === "topt").map((l) => {
          const [text1, feedback] = quad(l.value, at(l));
          return { text: text1, feedback };
        }),
      });
    } else if (key === "summary") summary.push(pair(value, where));
    else if (key === "card") {
      const [front, back] = quad(value, where);
      flashcards.push({ id: `${head.slug}-c${flashcards.length + 1}`, front, back });
    } else if (key === "deeper") {
      const p = parts(value);
      if (p.length !== 4) throw new Error(`${where}: deeper needs "title || href || note EN || note UR"`);
      goDeeper.push({ title: p[0], href: p[1], note: bi(p[2], p[3]) });
    } else if (key === "source") {
      const [citation, pubmedQuery] = value.split(SEP).map((s) => s.trim());
      sources.push({ citation, ...(pubmedQuery ? { pubmedQuery } : {}) });
    } else if (BEAT_KEYS.has(key)) throw new Error(`${where}: unexpected ${key}`);
    else head[key] = value;
  }

  const need = (k: string) => {
    if (!head[k]) throw new Error(`${file}: missing "${k}:"`);
    return head[k];
  };
  return {
    slug: need("slug"),
    title: need("title"),
    hook: pair(need("hook"), `${file} hook`),
    area: need("area") as TeacherArea,
    level: need("level") as TeacherLesson["level"],
    bestFor: need("best"),
    minutes: Number(need("minutes")),
    goal: pair(need("goal"), `${file} goal`),
    beats,
    summary,
    flashcards,
    goDeeper,
    sources,
  };
}

/** Every lesson file in lessons/authored, in file-name order. */
export function loadAuthoredLessons(): TeacherLesson[] {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "lessons", "authored");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".pna"))
    .sort()
    .map((name) => parseLesson(fs.readFileSync(path.join(dir, name), "utf8"), name));
}
