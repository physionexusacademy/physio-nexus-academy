/** "Day 2 — Build up" → "Build up" (the screens already say "Day 2" next to it). */
export const cleanDayTitle = (title: string) => title.replace(/^\s*(day|din)\s*\d+\s*[—–:.\-]*\s*/i, "").trim() || title;
