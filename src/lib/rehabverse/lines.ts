/**
 * The lines the exercise player says (and shows) during a repetition. A movement can carry its own cue (`say`, in the exercise's data);
 * a segment without one gets the default for its kind. Shared by the player, the voice recorder (scripts/voice/collect.mts) and the
 * voice checks, so all of them agree on exactly which sentences must be recorded.
 */
import type { Segment } from "./motion";

export const DEFAULT_LINES = {
  start: { en: "Get into the starting position.", ru: "Pehle starting position mein aa jayein." },
  move: { en: "Move slowly and with control.", ru: "Aahista aahista, control ke saath harkat karein." },
  hold: { en: "Hold it steady.", ru: "Is position ko stable rakhein." },
  return: { en: "Come back slowly — do not drop.", ru: "Aahista wapis aayein — jhatka na dein." },
  rest: { en: "Relax, then go again.", ru: "Thora relax karein, phir dobara." },
};

/** The line spoken (and shown) during a segment of the repetition. */
export const lineFor = (segment: Pick<Segment, "kind" | "say">, lang: "en" | "ru") => {
  const base = segment.say ?? (segment.kind === "move" ? DEFAULT_LINES.move : segment.kind === "hold" ? DEFAULT_LINES.hold : segment.kind === "return" ? DEFAULT_LINES.return : DEFAULT_LINES.rest);
  return lang === "ru" ? base.ru : base.en;
};
