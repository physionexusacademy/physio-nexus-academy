/**
 * Search-result text helpers. Google shows roughly 60 characters of a title and 155 of a description, so long data-driven
 * titles (case reports, techniques, conditions) are cut at a natural boundary instead of being truncated mid-word by the search engine.
 */
const SEPARATORS = /(\s+[—–|]\s+|\s+-\s+|:\s+)/;

/** Removes a trailing brand/section suffix that the layout template adds again, collapses spaces. */
export function bareTitle(raw: string): string {
  return raw.replace(/\s+/g, " ").replace(/\s*\|\s*(Physio Nexus Academy|PNA)[^|]*$/i, "").trim();
}

/** Keeps whole segments ("Topic — Qualifier — More") while they fit, otherwise cuts at a word boundary. */
export function fitTitle(raw: string, max = 54): string {
  const text = bareTitle(raw);
  if (text.length <= max) return text;
  const parts = text.split(SEPARATORS); // [segment, separator, segment, ...]
  let out = parts[0];
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const next = out + parts[i] + parts[i + 1];
    if (next.length > max) break;
    out = next;
  }
  if (out.length >= 18 && out.length <= max) return out;
  const cut = text.slice(0, max + 1);
  const space = cut.lastIndexOf(" ");
  return (space > 24 ? cut.slice(0, space) : text.slice(0, max)).replace(/[\s,;:—–\-(]+$/, "");
}

/** 70–158 characters: cuts at a sentence or word boundary; short text gets the fallback sentence appended. */
export function fitDescription(raw: string, fallback = "Free physiotherapy learning from Physio Nexus Academy.", min = 70, max = 158): string {
  let text = raw.replace(/\s+/g, " ").trim();
  if (text && !/[.!?…]$/.test(text) && text.length < max - 5) text += ".";
  if (text.length < min && fallback) text = `${text} ${fallback}`.trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sentence >= min) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > min ? space : cut.length).replace(/[\s,;:—–\-(]+$/, "")}…`;
}
