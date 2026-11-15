/**
 * How a spoken sentence finds its recording. Pure text functions (no browser, no Node), shared by the browser (lib/speech/recorded.ts)
 * and the script that makes the recordings (scripts/voice/), so both always agree on what a "sentence" is and what its key is.
 *
 * A line is first turned into speakable text (spoken.ts), then cut into sentences, and every sentence has its own recording. Cutting
 * into sentences (and not looking up a whole line) means a recording is found however the site joins texts together (a lesson that
 * reads two fields in a row, a step list, a subtitle), as long as the sentences themselves are the same.
 */

/** A small fast 53-bit hash of a string (cyrb53), written in base 36: about ten characters, the key of a recording. */
export function clipKey(sentence: string): string {
  const text = normalise(sentence);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** The key of a sentence in a language: Roman Urdu sentences have their own recordings (a different voice), so their keys are kept apart. */
export const sentenceKey = (sentence: string, lang: "en" | "ur"): string => clipKey(lang === "ur" ? "ur: " + normalise(sentence) : sentence);

/** One space between words, nothing at the ends. */
export function normalise(sentence: string): string {
  return sentence.replace(/\s+/g, " ").trim();
}

/**
 * Cuts speakable text (see toSpoken) into sentences: a full stop, question mark or exclamation mark that is followed by a space or the
 * end. A full stop inside a number ("1.5") is not an end. Fragments without letters or digits are dropped.
 */
export function splitSentences(spoken: string): string[] {
  const out: string[] = [];
  const text = normalise(spoken);
  const end = /\S[\s\S]*?[.!?…]+(?=\s|$)|\S[\s\S]*$/g;
  let match: RegExpExecArray | null;
  while ((match = end.exec(text))) {
    const sentence = match[0].trim();
    if (/[\p{L}\p{N}]/u.test(sentence)) out.push(sentence);
    if (end.lastIndex >= text.length) break;
  }
  return out;
}
