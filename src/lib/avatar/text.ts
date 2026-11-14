/** Plain text for speaking and subtitles: markdown emphasis removed, bullet lines turned into sentences, whitespace collapsed. No imports. */
export function plain(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/[`_]/g, "")
    .replace(/([^.!?:;,\n])[ \t]*\n\s*[•\-]\s*/g, "$1. ")
    .replace(/\n\s*[•\-]\s*/g, " ")
    .replace(/^\s*[•\-]\s*/, "")
    .replace(/([^.!?:;,\s])[ \t]*\n\s*/g, "$1. ")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\.\s*\./g, ".")
    .trim();
}
