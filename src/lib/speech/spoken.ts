/**
 * Turns written text into text that is meant to be *said*: the lessons are written to be read on a screen, and a voice that reads their
 * symbols, arrows and brackets aloud sounds like a machine reading a page. This keeps the words and the clinical content exactly as they
 * are, and only changes how they are written: symbols become words (° → degrees, % → percent, ranges → "to"), arrows and dashes become
 * a pause or "then", brackets become a spoken aside, list marks and markdown disappear, and the line always ends like a sentence so the
 * voice finishes with falling intonation. Pure text in, text out (safe on the server, nothing is read from the browser).
 */
import type { SpeechLang } from "./voices";

export function toSpoken(input: string, lang: SpeechLang = "en"): string {
  let t = input;
  t = t.replace(/\*\*|__|`/g, "").replace(/^#{1,6}\s+/gm, "");
  t = t.replace(/^[\s>*•·\-–—]+(?=\S)/gm, "");
  t = t.replace(/\s*\r?\n+\s*/g, ". ");
  t = t.replace(/\be\.g\.,?/gi, "for example,").replace(/\bi\.e\.,?/gi, "that is,");
  t = t.replace(/\bvs\.?(?=\s)/gi, "versus").replace(/\bapprox\.?(?=\s)/gi, "approximately").replace(/\betc\.?/gi, "and so on");
  t = t.replace(/(\d+(?:\.\d+)?)\s*°\s*C\b/g, "$1 degrees Celsius").replace(/(\d+(?:\.\d+)?)\s*°/g, "$1 degrees");
  t = t.replace(/(\d+(?:\.\d+)?)\s*%/g, "$1 percent");
  t = t.replace(/(\d)\s*[–-]\s*(\d)/g, lang === "ur" ? "$1 se $2" : "$1 to $2");
  t = t.replace(/\s*(?:→|⇒|->)\s*/g, lang === "ur" ? ", phir " : ", then ").replace(/\bthen\s+then\b/gi, "then").replace(/\bphir\s+phir\b/gi, "phir");
  t = t.replace(/\s+[—–]\s+/g, ", ").replace(/\s*[·•|]\s*/g, ", ");
  t = t.replace(/\s*±\s*/g, " plus or minus ").replace(/\s*×\s*/g, " times ").replace(/\s*≥\s*/g, " at least ").replace(/\s*≤\s*/g, " at most ");
  t = t.replace(/\s*&\s*/g, " and ");
  t = t.replace(/\(([^()]{1,90})\)/g, ", $1, ");
  t = t.replace(/\s+,/g, ",").replace(/,(\s*,)+/g, ",").replace(/,\s*([.!?…])/g, "$1").replace(/([.!?])\s*\./g, "$1").replace(/\s{2,}/g, " ").trim();
  t = t.replace(/^,\s*/, "");
  // A line that stops without a full stop is read with rising "more to come" intonation: finish it like a sentence.
  if (t && !/[.!?…।؟]$/.test(t)) t += ".";
  return t;
}
