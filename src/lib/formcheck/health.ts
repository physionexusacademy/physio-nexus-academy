import type { Bi } from "./types.ts";

/**
 * How well the phone can follow a movement: from the number of pictures it manages a second. A repetition needs about seven pictures to be followed whatever the style of
 * movement (measured: every style is counted exactly from five, flowing repetitions that do not go back to rest need seven) and never less than 0.7 s (it must stay above half
 * its height for a quarter of a second), so the quicker the phone, the quicker the movement it can follow; a slow phone follows a slower one. The counter itself keeps working on a slow phone (it was tested
 * down to 3 pictures a second), but a movement that is too quick for the pictures cannot be seen by any method, so the person is told how long to take over each repetition.
 */
export type HealthLevel = "good" | "slow" | "very-slow" | "too-slow";
export type TrackingHealth = {
  level: HealthLevel;
  /** pictures a second, rounded */
  fps: number;
  /** the quickest a repetition can be and still be followed (about seven pictures, never under 0.7 s), in seconds, rounded up to a tenth */
  minRepSeconds: number;
};
const PICTURES_PER_REPETITION = 7;
/** the quickest repetition any phone follows, s */
const FASTEST_REPETITION_S = 0.7;

export function trackingHealth(fps: number): TrackingHealth {
  const safe = Math.max(0.5, fps);
  return {
    level: safe >= 15 ? "good" : safe >= 8 ? "slow" : safe >= 2.5 ? "very-slow" : "too-slow",
    fps: Math.round(safe),
    minRepSeconds: Math.max(FASTEST_REPETITION_S, Math.ceil((PICTURES_PER_REPETITION / safe) * 10 - 1e-9) / 10),
  };
}

/** What to tell the person, or null when the phone is quick enough that nothing needs saying. */
export function healthTip(health: TrackingHealth): Bi | null {
  if (health.level === "good") return null;
  if (health.level === "too-slow") {
    return {
      en: "The camera check is too slow on this phone to follow your repetitions. You can do your exercise as usual, or close other apps and try again.",
      ru: "Is phone par camera check itna sust hai ke aap ke repetitions nahi dekh sakta. Aap apni exercise aam tareeqe se kar sakte hain, ya doosri apps band karke dobara koshish karein.",
    };
  }
  const seconds = health.minRepSeconds.toFixed(1).replace(".0", "");
  return health.level === "slow"
    ? {
        en: `Your phone sees about ${health.fps} pictures a second. Counting works; for very quick repetitions take at least ${seconds} s each.`,
        ru: `Aap ka phone aik second mein taqriban ${health.fps} tasveerein leta hai. Counting chalti hai; bohat tez repetitions ke liye har aik par kam az kam ${seconds} second lagayein.`,
      }
    : {
        en: `Your phone is slow (about ${health.fps} pictures a second). Take at least ${seconds} s for each repetition so none is missed, and close other apps.`,
        ru: `Aap ka phone sust hai (taqriban ${health.fps} tasveerein per second). Har repetition par kam az kam ${seconds} second lagayein taake koi na chhute, aur doosri apps band karein.`,
      };
}
