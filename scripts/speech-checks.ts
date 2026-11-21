// Entry bundled by scripts/validate-speech.mjs: checks how a line finds its recording (sentence keys, planning, missing recordings, Roman Urdu),
// that every fixed English and Roman Urdu line of the site has a recording, and the spoken-style text and Roman Urdu conversion rules that remain.
import { NOTE_NO_RECORDING, NOTE_NO_RECORDING_UR, planSpeech } from "../src/lib/speech/voices";
import { clipKey, normalise, sentenceKey, splitSentences } from "../src/lib/speech/clip-key";
import { toSpoken } from "../src/lib/speech/spoken";
import { convertRun, splitRuns, toDevanagari, toUrdu } from "../src/lib/speech/roman-urdu";
import { collectGroups } from "./voice/collect.mts";
import { buildCycle } from "../src/lib/rehabverse/motion";
import { lineFor } from "../src/lib/rehabverse/lines";
import * as guideScripts from "../src/lib/rehabverse/guide";
import fs from "node:fs";
import path from "node:path";

const g = globalThis as unknown as Record<string, unknown>;
const voiceDir = "public/voice/george";
// The browser fetches /voice/george/<file>; here that is read from disk.
g.fetch = async (url: string) => {
  const file = String(url).startsWith("/voice/george/") ? path.join(voiceDir, String(url).slice("/voice/george/".length)) : "";
  if (!file || !fs.existsSync(file)) return { ok: false, status: 404, json: async () => null };
  return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, "utf8")) };
};

const failures: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) failures.push(what); };

// 1. Sentences and keys: the same text always has the same key, whatever the spacing; a decimal point is not a sentence end.
check(clipKey("Hold it  steady. ") === clipKey("Hold it steady."), "A key ignores extra spaces");
check(clipKey("Hold it steady.") !== clipKey("Hold it steady!"), "A different sentence has a different key");
check(/^[0-9a-z]{6,12}$/.test(clipKey("Hold it steady.")), "A key is a short base-36 string (got " + clipKey("Hold it steady.") + ")");
check(normalise("  a \n b ") === "a b", "normalise collapses white space");
let bits = splitSentences("Tilt the head 3.5 degrees. Hold it, then breathe out! Ready?");
check(bits.length === 3 && bits[0] === "Tilt the head 3.5 degrees." && bits[2] === "Ready?", "Sentences are cut after . ! ? but not inside 3.5 (got " + JSON.stringify(bits) + ")");
bits = splitSentences("No final stop here");
check(bits.length === 1 && bits[0] === "No final stop here", "A line without a final stop is one sentence");
check(splitSentences(" ... ?! ").length === 0, "Punctuation only: nothing to say");

// 2. Written text becomes spoken text (symbols to words, a pause instead of an arrow, a finished sentence)
check(toSpoken("Flex to 90° (about 3–5 mm) → then hold; e.g. 30% more") === "Flex to 90 degrees, about 3 to 5 mm, then hold; for example, 30 percent more.", "toSpoken: degrees, aside, range, arrow, e.g., percent, final stop");
check(toSpoken("**Step 1** — place the hand\n• keep the elbow relaxed") === "Step 1, place the hand. keep the elbow relaxed.", "toSpoken: markdown, dash, list mark, line break");
check(toSpoken("Already a sentence.") === "Already a sentence.", "toSpoken leaves a finished sentence alone");
check(toSpoken("5-10 baar", "ur") === "5 se 10 baar.", "toSpoken: Roman Urdu range");

// 3. The voice files and their index
const packs: string[] = JSON.parse(fs.readFileSync(`${voiceDir}/packs.json`, "utf8"));
const index = JSON.parse(fs.readFileSync(`${voiceDir}/clips.json`, "utf8")) as { packs: string[]; clips: Record<string, [number, number, number]>; rate: number };
check(packs.length >= 22 && packs.includes("avatar-site-tour") && packs.includes("rehab-guide") && packs.includes("ur-avatar-site-tour") && packs.includes("ur-rehab-guide"), "packs.json lists the English and Roman Urdu packs (got " + packs.length + ")");
check(index.packs.length === packs.length && index.packs.every((stem, i) => stem.startsWith(packs[i] + ".")), "clips.json packs match packs.json (name.hash)");
for (const stem of index.packs) check(fs.existsSync(`${voiceDir}/${stem}.mp3`), `Pack file missing: ${stem}.mp3`);
for (const [key, [pack, start, dur]] of Object.entries(index.clips)) {
  const size = fs.existsSync(`${voiceDir}/${index.packs[pack]}.mp3`) ? fs.statSync(`${voiceDir}/${index.packs[pack]}.mp3`).size : 0;
  // 32 kbit/s = 4000 bytes a second; a clip must lie inside its pack
  if (!(dur > 200 && start >= 0 && (start + dur) / 1000 <= size / 4000 + 0.5)) failures.push(`Clip ${key} lies outside its pack (${start} + ${dur} ms, pack ${size} bytes)`);
}
check(fs.statSync(`${voiceDir}/clips.json`).size < 400_000, "clips.json must stay small (it is loaded when something is first spoken)");
check(/Apache License/.test(fs.readFileSync(`${voiceDir}/README.txt`, "utf8")) && /hexgrad/.test(fs.readFileSync(`${voiceDir}/README.txt`, "utf8")) && /bm_george/.test(fs.readFileSync(`${voiceDir}/README.txt`, "utf8")) && /hm_psi/.test(fs.readFileSync(`${voiceDir}/README.txt`, "utf8")), "The voice README credits the model and both voices");

// 4. Every fixed line of the site (3D demonstrations, tour, RehabVerse guide and exercise cues), in English and in Roman Urdu, has a recording
const groups = collectGroups(process.cwd(), false, true);
let missing = 0;
for (const group of groups) {
  for (let i = 0; i < group.keys.length; i++) {
    if (!index.clips[group.keys[i]]) {
      missing++;
      if (missing <= 5) failures.push(`No recording for (${group.name}): ${group.sentences[i].slice(0, 70)}`);
    }
  }
  check(packs.includes(group.name) || group.sentences.length === 0, `No pack for group ${group.name}`);
}
if (missing > 5) failures.push(`... and ${missing - 5} more sentences without a recording (run scripts/voice/, see its README)`);

// 5. Planning a line: found, not found, Roman Urdu
const first = groups.find((x) => x.name === "avatar-site-tour")!.sentences[0];
const firstUr = groups.find((x) => x.name === "ur-avatar-site-tour")!.sentences[0];
let plan = await planSpeech(first, "en");
check(plan.mode === "english" && plan.engine === "recorded" && plan.parts.length >= 1 && plan.note === null, "A recorded line is planned for the recorded voice");
check(plan.parts.every((part) => part.dur > 0.2 && /^[a-z0-9_-]+\.[0-9a-f]{8}$/.test(part.pack)), "Parts point at hashed pack files");
plan = await planSpeech("This sentence was never recorded anywhere.", "en");
check(plan.mode === "none" && plan.engine === "none" && plan.note === NOTE_NO_RECORDING, "An unrecorded line is not spoken (no synthesiser takes over)");
plan = await planSpeech(first + " This one was never recorded.", "en");
check(plan.mode === "none", "A line is spoken completely or not at all");
plan = await planSpeech(firstUr, "ur");
check(plan.mode === "urdu" && plan.engine === "recorded" && plan.parts.length >= 1, "A recorded Roman Urdu line is planned for the Urdu voice");
check(plan.parts.every((part) => /^ur-[a-z0-9_-]+\.[0-9a-f]{8}$/.test(part.pack)), "Roman Urdu parts point at ur-* packs");
plan = await planSpeech("Shoulder ko posterior glide karein, ye line kabhi record nahi hui.", "ur");
check(plan.mode === "none" && plan.note === NOTE_NO_RECORDING_UR, "An unrecorded Roman Urdu line is not spoken (no synthesiser takes over)");
check((await planSpeech(first, "ur")).mode === "none", "English text is not read with the Urdu recordings (their keys are kept apart)");
// two recorded sentences of one pack play as one piece
const two = groups.find((x) => x.name === "rehab-guide")!.sentences.slice(0, 2).join(" ");
plan = await planSpeech(two, "en");
check(plan.mode === "english", "Two recorded sentences in a row are found (got " + plan.mode + ")");

// 6. Roman Urdu preparation (kept for a future Hindi recording)
const cases: [string, string, string][] = [["hai", "है", "ہے"], ["karein", "करें", "کریں"], ["mein", "में", "میں"], ["dekhein", "देखें", "دیکھیں"], ["logon", "लोगों", "لوگوں"], ["mushkil", "मुश्किल", "مشکل"], ["yahan", "यहां", "یہاں"]];
for (const [w, d, u] of cases) {
  check(toDevanagari(w) === d, `Devanagari ${w}: got ${toDevanagari(w)} want ${d}`);
  check(toUrdu(w) === u, `Urdu ${w}: got ${toUrdu(w)} want ${u}`);
}
const lex = new Set<string>(JSON.parse(fs.readFileSync("public/teacher/ur-lexicon.json", "utf8")));
const runs = splitRuns("Pehle patient ko aaram se lita dein, aur dard ke baare mein poochhein.", lex);
check(runs.map((r) => r.kind).join(",") === "ur,en,ur", "Run split: Urdu, English term, Urdu");
check(!convertRun("karein.", "devanagari").includes("."), "Full stop becomes danda");

let rehabLines = 0;
// 7. The RehabVerse 3D models never go silent. The lines above are the ones that EXIST in the data; this walks what the player and the guide
// really say: every segment of every exercise (correct and "mistake" version, both languages) and every beat of every guide script.
{
  const clipSet = new Set(Object.keys(index.clips));
  const spokenOk = (line: unknown, lang: "en" | "ur") => {
    if (typeof line !== "string" || !line.trim()) return "has no text";
    const sentences = splitSentences(toSpoken(line, lang));
    if (!sentences.length) return "has no sentences";
    const missing = sentences.filter((sentence) => !clipSet.has(sentenceKey(sentence, lang)));
    return missing.length ? "is not recorded: " + missing.join(" | ") : null;
  };
  const rehabDir = "public/rehabverse-data";
  let lines = 0;
  for (const file of fs.readdirSync(rehabDir).filter((f) => f.endsWith(".json"))) {
    for (const exercise of JSON.parse(fs.readFileSync(path.join(rehabDir, file), "utf8")) as { id: string; motion: { start: unknown; moves: unknown[]; mistake?: { moves: unknown[] } } }[]) {
      for (const variant of ["correct", "mistake"] as const) {
        const moves = variant === "mistake" ? exercise.motion.mistake?.moves : exercise.motion.moves;
        if (!moves) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const segments = buildCycle({ ...(exercise.motion as any), start: exercise.motion.start }, "left", moves as any);
        for (const segment of segments) {
          for (const lang of ["en", "ru"] as const) {
            lines++;
            const problem = spokenOk(lineFor(segment, lang), lang === "ru" ? "ur" : "en");
            check(!problem, `${exercise.id} (${variant}, ${lang}, ${segment.kind}): the exercise player's line ${problem}`);
          }
        }
      }
    }
  }
  const beats: { name: string; say: { en?: string; ru?: string } }[] = [];
  const visit = (name: string, value: unknown) => {
    if (typeof value === "function") check(false, `guide script ${name} is a function: a guide line must be fixed text so that it can be recorded`);
    else if (Array.isArray(value)) value.forEach((item, i) => visit(`${name}[${i}]`, item));
    else if (value && typeof value === "object") {
      const say = (value as { say?: { en?: string; ru?: string } }).say;
      if (say && typeof say === "object" && "en" in say) beats.push({ name, say });
      else for (const [key, item] of Object.entries(value)) visit(`${name}.${key}`, item);
    }
  };
  for (const [name, value] of Object.entries(guideScripts)) visit(name, value);
  for (const beat of beats) {
    for (const lang of ["en", "ru"] as const) {
      lines++;
      const problem = spokenOk(beat.say[lang], lang === "ru" ? "ur" : "en");
      check(!problem, `RehabVerse guide ${beat.name} (${lang}) ${problem}`);
    }
  }
  check(beats.length >= 30, "the guide scripts were found (checked " + beats.length + " beats)");
  rehabLines = lines;
}

if (failures.length) {
  console.error("Speech checks FAILED:\n - " + failures.join("\n - "));
  process.exit(1);
}
const total = groups.reduce((n, x) => n + x.keys.length, 0);
console.log(`Speech checks passed: sentence keys, spoken-style text, ${index.packs.length} voice packs and ${Object.keys(index.clips).length} clips consistent, all ${total} fixed English and Roman Urdu sentences recorded, planning (found / missing, English / Roman Urdu), ${rehabLines} RehabVerse player and guide lines spoken in both languages, ${cases.length} Roman Urdu conversion spot checks.`);
