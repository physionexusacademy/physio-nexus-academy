import type { Bi } from "../types.ts";
import { RULES } from "./guard.ts";
import { allowedAmounts, AMOUNT_UNIT, amountKind, type CoachContext } from "./coach-spec.ts";

/**
 * Everything the coach's MODEL says is checked here before the patient sees it (the scripted answers are made from the reviewed plan and library
 * and need no check). The coach explains today's prescribed exercises; it must not diagnose, advise on medicines, heat or ice, reassure about
 * symptoms, claim to be a person, ask for identifying details or give links (the shared rules of guard.ts), and in addition it must not
 * change the prescription: no new amounts, no extra, fewer, harder or easier versions, no skipping or swapping, no other exercise from the
 * library, no "push through the pain" and no pain thresholds. A reply that breaks a rule is replaced by the scripted menu.
 */
export type CoachGuardResult = { ok: true; text: string } | { ok: false; reason: string };

/** The shared rules that apply to a coach: everything except the intake interviewer's own "treatment advice" wording, which would block ordinary coaching cues. */
const SHARED = new Set(["diagnosis", "medicine", "reassurance or promise", "asks for identifying details", "link or contact detail"]);

const COACH_RULES: { reason: string; test: (text: string) => boolean }[] = [
  // first person only: "as your physiotherapist wrote" is how a coach refers to the real one and is fine
  { reason: "claims to be a person or clinician", test: (t) => /\b(i am|i'm|im)\s+(a |an |your |the |also )?(real |licensed |qualified |human |actual |trained )?(doctor|physician|physiotherapist|physio|surgeon|nurse|clinician|human|person)\b/i.test(t) || /\bas (a|an) (doctor|physiotherapist|physio|clinician|nurse|surgeon)\b/i.test(t) || /\bmain\s+(aap\s+ka\s+|ek\s+)?(doctor|physiotherapist|physio|insaan)\s+hoon\b/i.test(t) },
  { reason: "medicine, heat, ice or other treatment", test: (t) => /\b(ice|ice pack|heat|heat pack|hot pack|cold pack|hot water bottle|massage|brace|tape|taping|cupping|painkillers?|medicines?|medication|tablets?|cream|gel|spray)\b/i.test(t) || /\b(garam seak|seak|barf|dawai|dawa|goli)\b/i.test(t) },
  { reason: "changes the prescription", test: (t) => /\b(do|try|perform|aim for|go for|add)\s+(a few |some |a couple of )?(more|extra|additional|another|fewer|less|double)\b/i.test(t) || /\b(increase|decrease|reduce|raise|lower|add|boost|cut)\s+(the |your |a few )?(reps|sets|weight|resistance|hold|load|intensity|time|speed|range)\b/i.test(t) || /\b(more|extra|fewer|less) (reps|sets|repetitions)\b/i.test(t) },
  { reason: "skips or swaps an exercise", test: (t) => /\b(skip|replace|swap|substitute|leave out|miss out|drop)\b.{0,40}\b(exercise|set|rep|session|it)\b/i.test(t) || /\b(instead of|in place of|rather than)\b/i.test(t) || /\byou (can|may|could) (stop|skip|miss|leave)\b/i.test(t) },
  { reason: "changes the prescription (Roman Urdu)", test: (t) => /\b(zyada|kam|double)\s+(kar|karein|karen|kijiye|kar lein)\b/i.test(t) || /\b(chhod|chor|skip)\s+(dein|den|do|sakte|sakti)\b/i.test(t) },
  { reason: "tells the patient to push through pain", test: (t) => /\b(push through|work through|ignore (the |any )?(pain|discomfort)|no pain,? no gain|pain is (normal|fine|ok|okay)|its (ok|okay|fine|normal) to (hurt|feel pain))\b/i.test(t) || /\b(dard (bardasht|sehte|sah)|dard ke bawajood|dard ko nazar andaz)\b/i.test(t) },
  { reason: "states a pain threshold", test: (t) => /\b\d+(\.\d+)?\s*(?:\/|out of)\s*10\b/i.test(t) },
  { reason: "markup or JSON in the reply", test: (t) => /[{}]/.test(t) || /<\/?[a-z][^>]*>/i.test(t) },
];

const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, fifteen: 15, twenty: 20, thirty: 30 };
const WORD_UNIT = new RegExp(`\\b(${Object.keys(WORDS).join("|")})\\s+(?:more\\s+)?(reps?|repetitions?|sets?|times|seconds?|secs?|minutes?|mins?)\\b`, "gi");

export function guardCoachReply(raw: unknown, ctx: CoachContext, catalogue: Bi[] = []): CoachGuardResult {
  if (typeof raw !== "string") return { ok: false, reason: "not text" };
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`#>]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length < 3) return { ok: false, reason: "empty" };
  if (text.length > 800) return { ok: false, reason: "too long" };
  if ((text.match(/\?/g) ?? []).length > 2) return { ok: false, reason: "asks several questions" };
  for (const rule of RULES) if (SHARED.has(rule.reason) && rule.test(text)) return { ok: false, reason: rule.reason };
  for (const rule of COACH_RULES) if (rule.test(text)) return { ok: false, reason: rule.reason };

  // every amount the coach states must be one in today's plan or in the library text for it
  const allowed = allowedAmounts(ctx);
  for (const match of text.matchAll(AMOUNT_UNIT)) if (!allowed[amountKind(match[2])].has(Number(match[1]))) return { ok: false, reason: `an amount that is not in the plan (${match[0]})` };
  for (const match of text.matchAll(WORD_UNIT)) if (!allowed[amountKind(match[2])].has(WORDS[match[1].toLowerCase()])) return { ok: false, reason: `an amount that is not in the plan (${match[0]})` };

  // it may talk only about today's exercises, not other exercises of the library
  const lower = text.toLowerCase();
  const today = new Set(ctx.exercises.flatMap((e) => [e.name.en.toLowerCase(), e.name.ru.toLowerCase()]));
  for (const name of catalogue) for (const variant of [name.en, name.ru]) {
    const key = variant.toLowerCase();
    if (key.length >= 6 && !today.has(key) && ![...today].some((t) => t.includes(key) || key.includes(t)) && lower.includes(key)) return { ok: false, reason: `an exercise that is not in today's plan (${variant})` };
  }
  return { ok: true, text };
}
