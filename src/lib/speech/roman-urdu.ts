/**
 * Roman Urdu → a script that a Hindi or Urdu text-to-speech voice can read (no dependencies, runs in the browser).
 *
 * The site's Urdu is written in Latin letters and mixed with English medical terms ("Shoulder ko posterior glide karein"). Browser
 * voices read Latin letters as English, so the Urdu words are converted to Devanagari (for Hindi voices, found on nearly every
 * phone and computer) or to Urdu script (for Urdu voices), while the English words are kept for the English voice.
 *
 * Which words are Urdu comes from a lexicon built from the site's own lessons (public/teacher/ur-lexicon.json, made by
 * scripts/build-ur-lexicon.mjs) plus a small spelling heuristic for words the lexicon has not seen.
 */

export type Run = { kind: "ur" | "en"; text: string };

/** Exact spellings for the most frequent words (Devanagari, Urdu script); the rules below handle everything else. */
const EXACT: Record<string, [string, string]> = {
  hai: ["है", "ہے"], hain: ["हैं", "ہیں"], tha: ["था", "تھا"], thi: ["थी", "تھی"], the: ["थे", "تھے"], aur: ["और", "اور"], ke: ["के", "کے"], ki: ["की", "کی"], ka: ["का", "کا"],
  ko: ["को", "کو"], se: ["से", "سے"], mein: ["में", "میں"], par: ["पर", "پر"], ya: ["या", "یا"], nahi: ["नहीं", "نہیں"], nahin: ["नहीं", "نہیں"], yeh: ["यह", "یہ"], ye: ["ये", "یہ"],
  woh: ["वह", "وہ"], wo: ["वो", "وہ"], ho: ["हो", "ہو"], ek: ["एक", "ایک"], liye: ["लिए", "لیے"], kar: ["कर", "کر"], kya: ["क्या", "کیا"], na: ["ना", "نہ"], saath: ["साथ", "ساتھ"],
  aap: ["आप", "آپ"], sab: ["सब", "سب"], lekin: ["लेकिन", "لیکن"], dard: ["दर्द", "درد"], karein: ["करें", "کریں"], dein: ["दें", "دیں"], karna: ["करना", "کرنا"], karne: ["करने", "کرنے"],
  karta: ["करता", "کرتا"], karti: ["करती", "کرتی"], karte: ["करते", "کرتے"], hota: ["होता", "ہوتا"], hoti: ["होती", "ہوتی"], hote: ["होते", "ہوتے"], chahiye: ["चाहिए", "چاہیے"],
  phir: ["फिर", "پھر"], jo: ["जो", "جو"], bhi: ["भी", "بھی"], tak: ["तक", "تک"], har: ["हर", "ہر"], kam: ["कम", "کم"], zyada: ["ज़्यादा", "زیادہ"], pehle: ["पहले", "پہلے"],
  baad: ["बाद", "بعد"], kuch: ["कुछ", "کچھ"], koi: ["कोई", "کوئی"], jab: ["जब", "جب"], tab: ["तब", "تب"], agar: ["अगर", "اگر"], toh: ["तो", "تو"], bohat: ["बहुत", "بہت"], bahut: ["बहुत", "بہت"],
  sahi: ["सही", "صحیح"], galat: ["ग़लत", "غلط"], ghalat: ["ग़लत", "غلط"], matlab: ["मतलब", "مطلب"], haan: ["हाँ", "ہاں"], kaun: ["कौन", "کون"], kab: ["कब", "کب"], kaise: ["कैसे", "کیسے"],
  kyun: ["क्यों", "کیوں"], kyunke: ["क्योंकि", "کیونکہ"], sirf: ["सिर्फ़", "صرف"], upar: ["ऊपर", "اوپر"], neeche: ["नीचे", "نیچے"], andar: ["अंदर", "اندر"], bahar: ["बाहर", "باہر"],
  dobara: ["दोबारा", "دوبارہ"], qadam: ["क़दम", "قدم"], ruk: ["रुक", "رک"], mushkil: ["मुश्किल", "مشکل"], zaroor: ["ज़रूर", "ضرور"], zaroori: ["ज़रूरी", "ضروری"], aasan: ["आसान", "آسان"],
};

/** Letters → [Devanagari consonant, Urdu consonant], longest first. */
const CONSONANTS: [string, string, string][] = [
  ["chh", "छ", "چھ"], ["ch", "च", "چ"], ["sh", "श", "ش"], ["kh", "ख", "خ"], ["gh", "ग़", "غ"], ["th", "थ", "تھ"], ["dh", "ध", "دھ"], ["ph", "फ", "پھ"], ["bh", "भ", "بھ"], ["jh", "झ", "جھ"],
  ["b", "ब", "ب"], ["p", "प", "پ"], ["t", "त", "ت"], ["d", "द", "د"], ["k", "क", "ک"], ["g", "ग", "گ"], ["q", "क़", "ق"], ["j", "ज", "ج"], ["z", "ज़", "ز"], ["s", "स", "س"],
  ["h", "ह", "ہ"], ["m", "म", "م"], ["n", "न", "ن"], ["r", "र", "ر"], ["l", "ल", "ل"], ["v", "व", "و"], ["w", "व", "و"], ["y", "य", "ی"], ["f", "फ़", "ف"], ["c", "क", "ک"], ["x", "क्स", "کس"],
];
/** Vowel graphemes → [independent, matra, Urdu medial, Urdu final, Urdu initial]. */
const VOWELS: Record<string, [string, string, string, string, string]> = {
  aa: ["आ", "ा", "ا", "ا", "آ"], ee: ["ई", "ी", "ی", "ی", "ای"], oo: ["ऊ", "ू", "و", "و", "او"], ai: ["ऐ", "ै", "ی", "ے", "ا"], au: ["औ", "ौ", "و", "او", "او"],
  ay: ["ए", "े", "ی", "ے", "ا"], ei: ["ए", "े", "ی", "ے", "ا"], a: ["अ", "", "", "ا", "ا"], e: ["ए", "े", "ی", "ے", "ا"], i: ["इ", "ि", "", "ی", "ا"], o: ["ओ", "ो", "و", "و", "ا"], u: ["उ", "ु", "", "و", "ا"],
};
const VOWEL_KEYS = ["aa", "ee", "oo", "ai", "au", "ay", "ei", "a", "e", "i", "o", "u"];

type Unit = { k: "C"; dev: string; ur: string } | { k: "V"; key: string } | { k: "N" };

function parse(word: string): Unit[] {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  const units: Unit[] = [];
  let i = 0;
  while (i < w.length) {
    let v = VOWEL_KEYS.find((key) => w.startsWith(key, i));
    // "ay" before another vowel is a + y (jayein, bajaye), not the vowel "ay".
    if (v === "ay" && /[aeiou]/.test(w[i + 2] ?? "")) v = "a";
    if (v) {
      units.push({ k: "V", key: v });
      i += v.length;
      continue;
    }
    const c = CONSONANTS.find(([key]) => w.startsWith(key, i));
    if (c) {
      units.push({ k: "C", dev: c[1], ur: c[2] });
      i += c[0].length;
      continue;
    }
    i += 1;
  }
  // Nasalised endings: -ein, -ain, -on, -oon, and yahan/wahan/jahan/kahan. A final "n" after those vowels is a nasal, not an "n".
  const last = units[units.length - 1];
  const before = units[units.length - 2];
  if (last && last.k === "C" && last.dev === "न" && before && before.k === "V" && ["ei", "ai", "o", "oo", "au"].includes(before.key)) units[units.length - 1] = { k: "N" };
  else if (/(yahan|wahan|jahan|kahan|yahin|wahin)$/.test(w)) units[units.length - 1] = { k: "N" };
  return units;
}

export function toDevanagari(word: string): string {
  const exact = EXACT[word.toLowerCase()];
  if (exact) return exact[0];
  const units = parse(word);
  let out = "";
  let prev: Unit | null = null;
  units.forEach((u, index) => {
    if (u.k === "C") {
      if (prev && prev.k === "C") out += "्";
      out += u.dev;
    } else if (u.k === "N") {
      out += "ं";
    } else {
      const v = VOWELS[u.key];
      const final = index === units.length - 1 || (index === units.length - 2 && units[index + 1].k === "N");
      if (!prev || prev.k !== "C") out += v[0];
      else if (u.key === "a") out += final && index > 0 ? "ा" : "";
      else if (u.key === "i" && final) out += "ी";
      else out += v[1];
    }
    prev = u;
  });
  return out;
}

/** Words whose "kh"/"gh" is an aspirated k/g (کھ / گھ) at the start of the word. */
const ASPIRATED_START = /^(khel|khul|khol|khan|khar|khad|khench|khaa|ghar|ghut|ghoom|ghant|ghat|ghis|gher|ghoda)/;

export function toUrdu(word: string): string {
  const exact = EXACT[word.toLowerCase()];
  if (exact) return exact[1];
  const lower = word.toLowerCase();
  if (ASPIRATED_START.test(lower)) {
    const head = lower.startsWith("kh") ? "کھ" : "گھ";
    return head + toUrdu(lower.slice(2));
  }
  const units = parse(word);
  let out = "";
  units.forEach((u, index) => {
    const prev = units[index - 1];
    if (u.k === "C") {
      out += u.ur === "خ" && prev && prev.k === "V" && ["e", "i", "ei", "ai"].includes(prev.key) ? "کھ" : u.ur;
    } else if (u.k === "N") {
      out += "ں";
    } else {
      const v = VOWELS[u.key];
      const final = index === units.length - 1 || (index === units.length - 2 && units[index + 1].k === "N");
      const nasalNext = units[index + 1]?.k === "N";
      if (!prev || prev.k !== "C") out += v[4];
      else if (final && nasalNext && ["ai", "ay", "ei", "e"].includes(u.key)) out += "ی"; // dekhein = دیکھیں, not ےں
      else if (final) out += v[3];
      else out += v[2];
    }
  });
  return out;
}

/* ---------------- which words are Urdu? ---------------- */

/** Spellings that appear in Roman Urdu but hardly ever in English. */
const URDU_SHAPE = /(?:kh|gh|chh|aa|ee|oo|ein$|ain$|aat$|ana$|ata$|ati$|ate$|nahi|hain|karein|wala|wali|wale|sakta|sakti|sakte|chahiye|tarah|zaroor)/;
const ENGLISH_ENDING = /(?:tion|sion|ment|ness|ity|ous|ive|ing|ly|ism|ology|ance|ence|ical|able|ible)$/;

export type Lexicon = Set<string>;

export function isUrduWord(word: string, lexicon: Lexicon): boolean {
  const w = word.toLowerCase();
  if (EXACT[w] || lexicon.has(w)) return true;
  if (w.length < 3 || ENGLISH_ENDING.test(w)) return false;
  return URDU_SHAPE.test(w);
}

/** Splits a line into consecutive Urdu and English runs (spaces and punctuation stay with the run they follow). */
export function splitRuns(text: string, lexicon: Lexicon): Run[] {
  const parts = text.match(/[A-Za-z'’]+|[^A-Za-z'’]+/g) ?? [];
  const runs: Run[] = [];
  let pendingGap = "";
  for (const part of parts) {
    if (!/[A-Za-z]/.test(part)) {
      pendingGap += part;
      continue;
    }
    const kind: Run["kind"] = isUrduWord(part.replace(/['’]/g, ""), lexicon) ? "ur" : "en";
    const last = runs[runs.length - 1];
    if (last && last.kind === kind) last.text += pendingGap + part;
    else {
      if (last) last.text += pendingGap;
      runs.push({ kind, text: part });
    }
    pendingGap = "";
  }
  if (pendingGap && runs.length) runs[runs.length - 1].text += pendingGap;
  return runs;
}

/** Converts an Urdu run's words (and keeps its punctuation, with Urdu punctuation for Urdu script). */
export function convertRun(text: string, script: "devanagari" | "urdu"): string {
  const convert = script === "devanagari" ? toDevanagari : toUrdu;
  const out = text.replace(/[A-Za-z'’]+/g, (word) => convert(word.replace(/['’]/g, "")));
  return script === "urdu" ? out.replace(/\?/g, "؟").replace(/,/g, "،").replace(/\./g, "۔") : out.replace(/\./g, "।");
}
