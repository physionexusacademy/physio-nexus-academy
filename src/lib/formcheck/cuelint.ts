/**
 * The wording rules for everything the camera says or shows during an exercise (checked by scripts/validate-formcheck.ts for every cue and line).
 * A cue may help a person keep the position, the tempo and the safe range; it must never ask for more range, effort or force, never ride over
 * pain, and never name a medical judgement (the tool does not diagnose and cannot see the spine).
 */
const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /\b(deeper|further|farther|harder|lower|higher|more range|stretch more|a bit more|a little more|push|pushing|force|forced|strain|go on|keep going|no pain no gain)\b/i, why: "asks for more range or effort" },
  { pattern: /\b(until it hurts|through the pain|despite (the )?pain|bear the pain|ignore (the )?pain)\b/i, why: "rides over pain" },
  { pattern: /\b(aur neeche|aur andar|aur upar|aur zyada|thoda aur|zor lagayein|zor se|zabardasti|dard ke bawajood|dard bardasht|jab tak dard|dard ko nazar andaz)\b/i, why: "asks for more range or effort / rides over pain (Roman Urdu)" },
  { pattern: /\b(diagnos\w*|abnormal|damag\w*|injur\w*|disease|disorder|degenerat\w*|slipped disc|disc problem|weak back|weak neck|stiff|tight muscles?|bad posture|wrong posture|your problem|nerve (damage|problem)|kharab posture|bimari|chot lagi|kamzor)\b/i, why: "names a medical judgement" },
];
export const MAX_CUE_LENGTH = 70;

/** The problems found in one cue (empty when it is fine). */
export function lintCue(text: string): string[] {
  const problems: string[] = [];
  if (!text.trim()) problems.push("empty");
  if (text.length > MAX_CUE_LENGTH) problems.push(`longer than ${MAX_CUE_LENGTH} characters`);
  for (const { pattern, why } of BANNED) {
    const found = text.match(pattern);
    if (found) problems.push(`"${found[0]}": ${why}`);
  }
  return problems;
}

/** The sentence every set-up and summary screen carries (English and Roman Urdu), so stopping for pain is always said. */
export const STOP_IF_PAINFUL = {
  en: "Stop if anything hurts, feels dizzy or tingles.",
  ru: "Agar dard ho, chakkar aaye ya sunn-pan ho to ruk jayein.",
};
