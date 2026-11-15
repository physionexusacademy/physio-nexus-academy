/**
 * Roman Urdu -> what the Urdu voice is given: the line cut into runs, each run either "hi" (Urdu words written in Devanagari, which the
 * Hindi/Urdu voice reads reliably) or "en" (English terms, left in Latin letters and read as English: "Shoulder ko posterior glide karein").
 * Used only while the recordings are made (scripts/voice/), never in the browser.
 *
 *  - A word in urdu-words.txt (the ~600 most frequent Urdu words, written by hand) uses that reading.
 *  - A word the site's English texts use (or an English-looking one: -tion, -ing ..., an acronym, a digit) is English.
 *  - Any other word is Urdu and is converted by the rules in lib/speech/roman-urdu.ts, with a fix for the long final "a" (hua, kiya).
 */
import fs from "node:fs";
import path from "node:path";
import { toDevanagari } from "../../src/lib/speech/roman-urdu.ts";

export type Segment = ["hi" | "en", string];

/** Urdu words that are also English words ("main", "tab", "do"): in Roman Urdu text they are Urdu. */
const URDU_FUNCTION = new Set("main is to do par me he ho hi na ab ya ye wo ko ka ki ke se ne tha the thi hum tum in un us ek hai hain hoon hue hua hui tab gir mil kar bar mor tor dil sar kam jin".split(" "));
/** English words the Urdu lines use that the site's English texts do not. */
const EXTRA_ENGLISH = new Set("analogy character library setup approve approves".split(" "));
const ENGLISH_ENDING = /(?:tion|sion|ment|ness|ity|ous|ive|ing|ly|ism|ology|ance|ence|ical|able|ible|ize|ise)$/;

export type Urdu = { words: Map<string, string>; english: Set<string> };

export function loadUrdu(root: string): Urdu {
  const words = new Map<string, string>();
  for (const line of fs.readFileSync(path.join(root, "scripts/voice/urdu-words.txt"), "utf8").split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [roman, reading] = line.trim().split(/\s+/);
    if (roman && reading) words.set(roman.toLowerCase(), reading);
  }
  // every word the site's English texts use
  const english = new Set<string>();
  const walk = (o: unknown) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      const node = o as Record<string, unknown>;
      if (typeof node.en === "string") for (const w of node.en.toLowerCase().match(/[a-z]+/g) ?? []) english.add(w);
      Object.values(node).forEach(walk);
    }
  };
  for (const dir of ["public/teacher-data/lessons", "public/rehabverse-data", "public/teacher/choreo"]) {
    for (const f of fs.readdirSync(path.join(root, dir))) if (f.endsWith(".json")) walk(JSON.parse(fs.readFileSync(path.join(root, dir, f), "utf8")));
  }
  return { words, english };
}

const fixFinalA = (dev: string) => dev.replace(/([ािीुूेैोौ])अ$/u, "$1आ");

/**
 * Rules for words that are not in urdu-words.txt. Roman Urdu does not write the long "a", so the common endings are spelled out here
 * (dikhayein = दिखाएँ, kalai = कलाई, darmiyana = दरमियाना, ghaltiyan = ग़लतियाँ) before the general converter is used.
 */
function ruleReading(w: string): string {
  const stem = (suffix: string) => w.endsWith(suffix) ? toDevanagari(w.slice(0, -suffix.length)) : "";
  let m: RegExpMatchArray | null;
  if ((m = w.match(/^(.{2,})ayein$/))) return toDevanagari(m[1]) + "ाएँ";
  if ((m = w.match(/^(.{2,})ayenge$/))) return toDevanagari(m[1]) + "ाएँगे";
  if ((m = w.match(/^(.{2,})ayegi$/))) return toDevanagari(m[1]) + "ाएगी";
  if ((m = w.match(/^(.{2,})aaye$/))) return toDevanagari(m[1]) + "ाए";
  if ((m = w.match(/^(.{2,}[^aeiou])iyan$/))) return toDevanagari(m[1]) + "ियाँ";
  if ((m = w.match(/^(.{2,}[^aeiou])iyon$/))) return toDevanagari(m[1]) + "ियों";
  if ((m = w.match(/^(.{2,}[^aeiou])ai$/))) return toDevanagari(m[1]) + "ाई";
  if ((m = w.match(/^(.{2,}[^aeiou])iya(.+)$/))) return toDevanagari(m[1]) + "िया" + toDevanagari(m[2]);
  if ((m = w.match(/^(.{2,}[^aeiou])aao$/))) return toDevanagari(m[1]) + "ाओ";
  if ((m = w.match(/^(.{2,}[^aeiou])ao$/))) return toDevanagari(m[1]) + "ाव";
  void stem;
  return fixFinalA(toDevanagari(w));
}

export function isEnglishWord(word: string, urdu: Urdu): boolean {
  const w = word.toLowerCase();
  if (urdu.words.has(w) || URDU_FUNCTION.has(w)) return false;
  if (word.length > 1 && word === word.toUpperCase()) return true; // PNA, ROM, CPD
  if (word.length === 1) return true; // "D" of 3D, "a"
  if (EXTRA_ENGLISH.has(w)) return true;
  if (urdu.english.has(w) || urdu.english.has(w + "s") || urdu.english.has(w.replace(/(es|s|ed|d|ing)$/, ""))) return true;
  return ENGLISH_ENDING.test(w);
}

export function readUrduWord(word: string, urdu: Urdu): string {
  const w = word.toLowerCase();
  return urdu.words.get(w) ?? ruleReading(w);
}

/** The line (already speakable text, see toSpoken) as runs for the voice. */
export function prepareUrdu(spoken: string, urdu: Urdu): Segment[] {
  const parts = spoken.match(/[A-Za-z'’]+|[^A-Za-z'’]+/g) ?? [];
  const segments: Segment[] = [];
  const push = (lang: "hi" | "en", text: string) => {
    const last = segments[segments.length - 1];
    if (last && last[0] === lang) last[1] += text;
    else segments.push([lang, text]);
  };
  for (const part of parts) {
    if (!/[A-Za-z]/.test(part)) {
      // a gap (spaces, punctuation, digits) stays with the run before it; at the start it belongs to the Urdu
      push(segments.length ? segments[segments.length - 1][0] : "hi", part);
      continue;
    }
    const clean = part.replace(/['’]/g, "");
    if (isEnglishWord(clean, urdu)) push("en", part);
    else push("hi", readUrduWord(clean, urdu));
  }
  return segments;
}
