/**
 * What the camera says out loud. Pure text, so it can be tested in node. Roman Urdu number words are what the Urdu voice reads best; above 20 the digits are spoken.
 */
const RU_NUMBERS = ["", "ek", "do", "teen", "char", "paanch", "chhe", "saat", "aath", "nau", "das", "gyarah", "barah", "terah", "chaudah", "pandrah", "solah", "satrah", "atharah", "unnees", "bees"];

export type SpokenLang = "en" | "ru";

export const spokenNumber = (n: number, lang: SpokenLang): string => (lang === "ru" && Number.isInteger(n) && n >= 1 && n <= 20 ? RU_NUMBERS[n] : String(n));

/** The line after a repetition: just the number, or a happy line when the prescribed repetitions are done. */
export function repLine(reps: number, target: number | undefined, lang: SpokenLang): { text: string; done: boolean } {
  if (target && reps >= target) {
    return { done: true, text: lang === "ru" ? `${spokenNumber(reps, lang)}. Shabash! Set mukammal.` : `${reps}. Well done! Set complete.` };
  }
  return { done: false, text: spokenNumber(reps, lang) };
}

/** The line every 5 seconds of a hold: the seconds so far, or a happy line when the prescribed hold is done. */
export function holdLine(holdMs: number, target: number | undefined, lang: SpokenLang): { text: string; done: boolean } | null {
  if (target && holdMs >= target * 1000) return { done: true, text: lang === "ru" ? "Shabash! Hold mukammal." : "Well done! Hold complete." };
  const tick = Math.floor(holdMs / 5000);
  return tick >= 1 ? { done: false, text: spokenNumber(tick * 5, lang) } : null;
}

export const START_LINE: Record<SpokenLang, string> = { ru: "Ab shuru karein", en: "Start now" };
