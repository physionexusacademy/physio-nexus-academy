// Builds public/teacher/ur-lexicon.json: the Roman Urdu words used by the site's lessons (words that appear in Urdu text and never in
// the English text of the same lessons). The browser uses it to tell Urdu words from English terms when reading a line aloud.
import fs from "node:fs";
import path from "node:path";
const dir = "public/teacher-data/lessons";
const en = new Map();
const ur = new Map();
const bump = (map, w) => map.set(w, (map.get(w) ?? 0) + 1);
const walk = (o) => {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === "object") {
    if (typeof o.en === "string" && typeof o.ur === "string") {
      for (const w of o.en.toLowerCase().match(/[a-z]+/g) ?? []) bump(en, w);
      for (const w of o.ur.toLowerCase().match(/[a-z]+/g) ?? []) bump(ur, w);
    }
    Object.values(o).forEach(walk);
  }
};
for (const f of fs.readdirSync(dir)) if (f.endsWith(".json")) walk(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
// English words that only occur inside Urdu sentences are rare (1-2 uses) and end like English words; keep the frequent ones and the Urdu-shaped ones.
const ENGLISH_ENDING = /(?:tion|sion|ment|ness|ity|ous|ive|ing|ly|ism|ology|ance|ence|ical|able|ible|ize|ise|ular|ory|ant|ent)$/;
const words = [...ur.entries()]
  .filter(([w, c]) => w.length > 1 && !(en.get(w) > 0) && (c >= 3 || !ENGLISH_ENDING.test(w)))
  .map(([w]) => w)
  .sort();
fs.writeFileSync("public/teacher/ur-lexicon.json", JSON.stringify(words));
console.log(`ur-lexicon.json: ${words.length} Roman Urdu words`);
