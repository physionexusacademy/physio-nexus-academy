/**
 * Lists every English sentence the site can read aloud from its fixed texts, grouped into "packs" (one audio file each).
 *
 *   node --experimental-strip-types scripts/voice/collect.mts <out.json> [lessons] [urdu]
 *
 * It follows the same path the site takes (toSpoken, then cut into sentences with clip-key.ts), so a sentence listed here is exactly the
 * sentence the browser will look up. Groups:
 *   avatar-*  the PNA Teacher's lines in the 3D demonstrations and the "Guide me" tour (public/teacher/choreo/*.json), one group per file
 *   rehab-*   the RehabVerse guide's scripts (rehab-guide) and each region's exercise cues (public/rehabverse-data/*.json)
 *   lesson-*  (only with the "lessons" argument) one group per PNA Teacher lesson (public/teacher-data/lessons/*.json)
 *   ur-*      (only with the "urdu" argument) the same sources in Roman Urdu: ur-avatar-*, ur-rehab-*, ur-lesson-<slug> (with "lessons")
 * Not covered, by design: text made on the fly (PNA AI answers).
 * `collectGroups` is also used by scripts/validate-speech.mjs, which checks that every listed sentence has a recording.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { toSpoken } from "../../src/lib/speech/spoken.ts";
import { sentenceKey, splitSentences } from "../../src/lib/speech/clip-key.ts";
import { loadUrdu, prepareUrdu, type Segment } from "./urdu.mts";
import { plain } from "../../src/lib/avatar/text.ts";
import * as guide from "../../src/lib/rehabverse/guide.ts";

/** One pack of recordings: the sentences, their keys and, for Roman Urdu, how each is read (runs of Hindi-script Urdu and English). */
export type Group = { name: string; lang: "en" | "ur"; sentences: string[]; keys: string[]; segments?: Segment[][] };

type Json = unknown;
const read = (file: string): Json => JSON.parse(fs.readFileSync(file, "utf8"));
const walk = (value: Json, visit: (key: string, node: any) => void, key = "") => {
  if (Array.isArray(value)) value.forEach((item) => walk(item, visit, key));
  else if (value && typeof value === "object") {
    visit(key, value);
    for (const [k, v] of Object.entries(value)) walk(v, visit, k);
  }
};
const spokenPlain = (line: string) => toSpoken(plain(line), "en");
const spokenDirect = (line: string) => toSpoken(line, "en");
const spokenPlainUr = (line: string) => toSpoken(plain(line), "ur");
const spokenDirectUr = (line: string) => toSpoken(line, "ur");

export function collectGroups(root: string, withLessons = false, withUrdu = false): Group[] {
  const seen = new Set<string>();
  const groups: Group[] = [];
  const urdu = withUrdu ? loadUrdu(root) : null;
  const add = (name: string, lines: string[], speak: (line: string) => string, lang: "en" | "ur" = "en") => {
    const group: Group = { name, lang, sentences: [], keys: [], ...(lang === "ur" ? { segments: [] } : {}) };
    for (const line of lines) {
      for (const sentence of splitSentences(speak(line))) {
        const key = sentenceKey(sentence, lang);
        if (seen.has(key)) continue;
        seen.add(key);
        group.sentences.push(sentence);
        group.keys.push(key);
        if (lang === "ur") group.segments!.push(prepareUrdu(sentence, urdu!));
      }
    }
    groups.push(group);
  };
  const says = (file: string) => {
    const lines: string[] = [];
    // `say` is a list of {en, ...}: the walk sees each item with the key "say" (the list's name)
    walk(read(file), (key, node) => {
      if (key === "say" && typeof node.en === "string") lines.push(node.en);
    });
    return lines;
  };

  // avatar: every {en} line in a step's `say` list, one group per choreography (the tour, each technique)
  const choreoDir = path.join(root, "public/teacher/choreo");
  for (const file of fs.readdirSync(choreoDir).sort()) {
    if (file === "index.json" || !file.endsWith(".json")) continue;
    add(`avatar-${file.replace(/\.json$/, "")}`, says(path.join(choreoDir, file)), spokenPlain);
  }

  // rehab: the guide's scripts and the players' default cues, then every region's exercises (their `say` cues)
  const guideLines: string[] = [];
  walk(guide, (key, node) => {
    if (key === "say" && typeof node.en === "string") guideLines.push(node.en);
  });
  const player = fs.readFileSync(path.join(root, "src/components/rehabverse/ExercisePlayer.tsx"), "utf8");
  const block = player.match(/const DEFAULT_LINES = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  for (const m of block.matchAll(/en: "((?:[^"\\]|\\.)*)"/g)) guideLines.push(JSON.parse(`"${m[1]}"`));
  add("rehab-guide", guideLines, spokenDirect);
  const rehabDir = path.join(root, "public/rehabverse-data");
  for (const file of fs.readdirSync(rehabDir).sort()) {
    if (file.endsWith(".json")) add(`rehab-${file.replace(/\.json$/, "")}`, says(path.join(rehabDir, file)), spokenDirect);
  }

  if (withLessons) {
    const dir = path.join(root, "public/teacher-data/lessons");
    for (const file of fs.readdirSync(dir).sort()) {
      const lesson: any = read(path.join(dir, file));
      const lines: string[] = [];
      walk(lesson.beats ?? [], (_key, node) => {
        if (typeof node.en === "string") lines.push(node.en);
      });
      add(`lesson-${lesson.slug}`, lines, spokenDirect);
    }
  }

  if (withUrdu) {
    // Roman Urdu, in the voice of the Urdu recordings (see urdu.mts). The 3D stage reads the English line instead where a line has `urFallback`.
    const urSays = (file: string, field: "ur" | "ru") => {
      const lines: string[] = [];
      walk(read(file), (key, node) => {
        if (key === "say" && typeof node[field] === "string" && !node.urFallback) lines.push(node[field]);
      });
      return lines;
    };
    for (const file of fs.readdirSync(choreoDir).sort()) {
      if (file === "index.json" || !file.endsWith(".json")) continue;
      add(`ur-avatar-${file.replace(/\.json$/, "")}`, urSays(path.join(choreoDir, file), "ur"), spokenPlainUr, "ur");
    }
    const urGuide: string[] = [];
    walk(guide, (key, node) => {
      if (key === "say" && typeof node.ru === "string") urGuide.push(node.ru);
    });
    for (const m of block.matchAll(/ru: "((?:[^"\\]|\\.)*)"/g)) urGuide.push(JSON.parse(`"${m[1]}"`));
    add("ur-rehab-guide", urGuide, spokenDirectUr, "ur");
    for (const file of fs.readdirSync(rehabDir).sort()) {
      if (file.endsWith(".json")) add(`ur-rehab-${file.replace(/\.json$/, "")}`, urSays(path.join(rehabDir, file), "ru"), spokenDirectUr, "ur");
    }
    if (withLessons) {
      const dir = path.join(root, "public/teacher-data/lessons");
      for (const file of fs.readdirSync(dir).sort()) {
        const lesson: any = read(path.join(dir, file));
        const lines: string[] = [];
        walk(lesson.beats ?? [], (_key, node) => {
          if (typeof node.ur === "string") lines.push(node.ur);
        });
        add(`ur-lesson-${lesson.slug}`, lines, spokenDirectUr, "ur");
      }
    }
  }
  return groups;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = process.argv[2];
  if (!out) throw new Error("usage: collect.mts <out.json> [lessons] [urdu]");
  const groups = collectGroups(path.resolve(import.meta.dirname, "../.."), process.argv.includes("lessons"), process.argv.includes("urdu"));
  fs.writeFileSync(out, JSON.stringify({ groups }));
  const total = groups.reduce((n, g) => n + g.sentences.length, 0);
  const words = groups.reduce((n, g) => n + g.sentences.reduce((m, s) => m + s.split(" ").length, 0), 0);
  console.log(`${groups.length} groups, ${total} sentences, ${words} words (about ${Math.round(words / 150)} minutes of speech)`);
}
