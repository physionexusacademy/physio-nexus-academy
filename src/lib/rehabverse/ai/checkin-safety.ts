import { fromUrduScript } from "../../pna-ai/language.ts";
import { COACH_STOP } from "./coach-spec.ts";
import { screenCoachText, type CoachSafety } from "./coach-safety.ts";
import { CHECKIN_STOP, norm } from "./checkin-spec.ts";

/**
 * The safety side of the recovery check-in chat. Two things make it different from the exercise coach:
 *   - the chat itself ASKS about warning signs, so the natural answer is a negation ("no chest pain, no dizziness"). The shared screen has no
 *     idea about negation, so a narrow set of plain denials is taken out of the text before it is screened. Only a negator directly followed
 *     by the symptom (or the symptom directly followed by "nahi") is removed: "no feeling in my foot", "no way I could bear the sharp pain" and
 *     "no but my knee gave way" are left alone and still alarm.
 *   - what the patient reports is turned into the ids of the check-in form's own warning-sign list, so the form can be pre-ticked for them.
 *     The chat never ticks "None of these": a negative answer is something the patient confirms themselves on the form.
 */
/** A symptom word a denial may start with, and the plain nouns it may continue with ("no chest pain, dizziness or numbness"). Qualified ones ("sharp pain") only count right after the negator. */
const EN_FIRST =
  "(?:chest\\s+(?:pain|pains|tightness|pressure|discomfort)|calf\\s+(?:pain|swelling)|(?:sharp|severe|bad)(?:\\s+(?:or|and)\\s+(?:sharp|severe|bad))?\\s+pain|pains?|dizziness|dizzy\\s+spells?|fainting|blackouts?|numbness|tingling|weakness|swelling|locking|falls?|pops?|tears?|twists?|breathlessness|shortness\\s+of\\s+breath|(?:trouble|difficulty|problems?|issues?)\\s+(?:in\\s+|with\\s+)?breathing|breathing\\s+(?:trouble|difficulty|problems?|issues?)|injur(?:y|ies)|problems?|issues?|symptoms?|warning\\s+signs?)";
const EN_MORE = "(?:chest\\s+pain|calf\\s+pain|calf\\s+swelling|pains?|dizziness|fainting|blackouts?|numbness|tingling|weakness|swelling|locking|falls?|pops?|tears?|twists?|breathlessness)";
const EN_LIST = `(?:(?:\\s*[,;]\\s*(?:(?:or|nor|and)\\s+)?|\\s+(?:or|nor|and)\\s+)(?:(?:no|any)\\s+)?${EN_MORE})*`;
const UR_FIRST =
  "(?:seene\\s+(?:mein|me|main)\\s+dard|seene\\s+ka\\s+dard|dard|chakkar|behoshi|sunn\\s*pan|sunnpan|jhunjhun\\w*|kamzori|sooj\\w*|soojan|sujan|saans\\s+(?:ki|mein|me|main)\\s+(?:takleef|mushkil|dikkat)|chot|girna|phisalna|takleef)";
const UR_MORE = "(?:seene\\s+(?:mein|me|main)\\s+dard|dard|chakkar|behoshi|sunn\\s*pan|sunnpan|jhunjhun\\w*|kamzori|sooj\\w*|soojan|sujan)";
const UR_LIST = `(?:${UR_MORE}(?:\\s*[,;]\\s*|\\s+(?:ya|aur)\\s+))*`;

const DENIALS: RegExp[] = [
  new RegExp(`\\b(?:no|nope|not\\s+any|never\\s+any|without(?:\\s+any)?)\\s+(?:new\\s+|more\\s+|real\\s+|such\\s+)?${EN_FIRST}${EN_LIST}(?![a-z])`, "g"),
  /\b(?:not|never|isnt|arent|wasnt|am not|is not|are not|was not)\s+(?:at all\s+|really\s+|very\s+|that\s+)?(?:dizzy|swollen|numb|weak|locked|faint|breathless)(?![a-z])/g,
  new RegExp(`\\b(?:didnt|did not|dont|do not|havent|have not|hasnt|has not|never)\\s+(?:have|had|get|got|feel|felt|notice|noticed|experience|experienced|see|saw|hear|heard)\\s+(?:any\\s+|a\\s+)?${EN_FIRST}${EN_LIST}(?![a-z])`, "g"),
  /\b(?:didnt|did not|never)\s+(?:fall|fell|slip|slipped|trip|tripped|twist|twisted)(?![a-z])/g,
  new RegExp(`\\b(?:koi\\s+)?${UR_LIST}${UR_FIRST}\\s+(?:bilkul\\s+|koi\\s+|abhi tak\\s+|kabhi\\s+)?(?:nahi|nahin|nai|nhi)(?![a-z])(?:\\s+(?:hai|hain|hua|hui|huwa|aaya|aayi|aya|hoti|hota|mila|mili|tha|thi)(?![a-z]))*`, "g"),
];

/** Keeps commas (they tell a list of denials from a denial followed by a report); everything else is normalised like the rest of the chat. */
const light = (text: string) => fromUrduScript(text).toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9+/.,;\s]/g, " ").replace(/\s+/g, " ").trim();

/** The text without the plain denials ("no chest pain", "no chest pain, dizziness or numbness", "chakkar nahi aaya"). Used only to decide what to screen and read as a warning sign. */
export function stripDenials(text: string): string {
  let t = light(text);
  for (const pattern of DENIALS) t = t.replace(pattern, " , ");
  return norm(t);
}

/** What the screen says about a message, with the wording of this chat (the exercise coach's "do not carry on with today's session" is replaced). */
export function screenCheckinText(text: string): CoachSafety | null {
  const hit = screenCoachText(stripDenials(text));
  return hit ? { ...hit, message: hit.message === COACH_STOP ? CHECKIN_STOP : hit.message } : null;
}

/* ───────────────────────── which warning sign of the form it is ───────────────────────── */

const KIND_FLAGS: Record<string, string[]> = {
  cardiac: ["fb_chest"], breathing: ["fb_chest"], heart: ["fb_chest"], stroke: ["fb_neuro"], "cauda-equina": ["fb_neuro"], "neck-vascular": ["fb_dizzy"],
  fracture: ["fb_injury"], dizziness: ["fb_dizzy"], "numbness-or-weakness": ["fb_neuro"], "severe-pain": ["fb_severe_pain"], "pop-or-tear": ["fb_injury"],
  fall: ["fb_injury"], "giving-way": ["fb_joint"], swelling: [],
};
/** Each sign has a loose pattern (a bare word is enough when the patient is only naming the sign: "chest", "my calf") and a strict one used in longer sentences, where "my calf is fine" must not count. */
const NEAR = (word: string, symptom: string) => new RegExp(`\\b(?:${word})\\b.{0,25}\\b(?:${symptom})\\b|\\b(?:${symptom})\\b.{0,25}\\b(?:${word})\\b`);
const FLAG_WORDS: { id: string; loose: RegExp; strict?: RegExp }[] = [
  { id: "fb_chest", loose: /\b(chest|seene|breath\w*|saans)\b/, strict: NEAR("chest|seene|breath\\w*|saans", "pain\\w*|hurt\\w*|tight\\w*|pressure|ache|aching|discomfort|heavy|hard|difficult\\w*|trouble|short\\w*|struggl\\w*|dard|takleef|mushkil|dikkat|bhaari|ghut\\w*") },
  { id: "fb_dizzy", loose: /\b(dizz\w*|faint\w*|black\w*|light ?headed|chakkar|behosh\w*|andhera)\b/ },
  { id: "fb_neuro", loose: /\b(numb\w*|tingl\w*|pins and needles|weak\w*|sunn\w*|jhunjhun\w*|kamzor\w*|urine|bladder|bowel|peshab|pakhana)\b/ },
  { id: "fb_calf", loose: /\b(calf|pindli)\b/, strict: NEAR("calf|pindli", "pain\\w*|hurt\\w*|sore|tender|swell\\w*|swollen|hot|warm|red|ache|aching|cramp\\w*|dard\\w*|sooj\\w*|garam") },
  { id: "fb_severe_pain", loose: /\b(sharp|severe|stabbing|unbearable|excruciating|tez|shadeed|bardasht)\b/ },
  { id: "fb_injury", loose: /\b(pop\w*|tear\w*|tore|torn|twist\w*|fell|fall\w*|slip\w*|trip\w*|mur gaya|mur gayi|gir gaya|gir gayi|chot|ripped|snap\w*)\b/ },
  { id: "fb_joint", loose: /\b(swell\w*|swollen|lock\w*|stuck|sooj\w*|soojan|sujan|phans\w*)\b|\b(hot|warm|garam)\b.{0,12}\b(joint|knee|ankle|elbow|wrist|shoulder|hip|jor|ghutna|takhna)\b/ },
];

/** Warning signs mentioned in the text (denials removed first), as ids of the check-in form's list. */
export function flagsFromText(text: string): string[] {
  const t = stripDenials(text);
  const naming = t.split(" ").filter(Boolean).length <= 4;
  return FLAG_WORDS.filter((flag) => (naming ? flag.loose : flag.strict ?? flag.loose).test(t)).map((flag) => flag.id);
}

/** The form's warning-sign ids for an alert: what the alert's kind says, plus any sign the words name (so a swollen calf is the calf, not just "a joint"). */
export function flagsForAlert(kind: string, text: string): string[] {
  const named = flagsFromText(text);
  if (kind === "swelling") {
    // a swollen calf is the calf sign; any other swollen or hot limb is the joint sign
    const others = named.filter((id) => id !== "fb_calf" && id !== "fb_joint");
    return [...new Set([named.includes("fb_calf") ? "fb_calf" : "fb_joint", ...others])];
  }
  return [...new Set([...(KIND_FLAGS[kind] ?? []), ...named])];
}

/* ───────────────────────── the answer to the safety question ───────────────────────── */

const NO_START = /^(?:no|nope|nah|none|nothing|nahi|nahin|nai|nhi|na|negative|not really|not at all|bilkul nahi|koi nahi|koi (?:masla|dikkat|takleef|problem) nahi|kuch nahi|kuch bhi nahi|sab theek|all (?:good|fine|clear|ok|okay)|none of (?:those|these|them|the above))\b/;
const YES_START = /^(?:yes|yeah|yep|yup|haan|han|ha|ji haan|ji han|hanji)\b/;

/** Words that may be left over when a denial is taken out ("I have no chest pain" leaves "i have"): they say nothing about a symptom. */
const FILLER = new Set("i ive have has had dont do did didnt not any no the a an my me is am are was and or nor thanks thank you please really at all now so far since session nothing none felt feel feeling noticed notice experienced got get such like that those these of to it there been today yesterday last night anything either ok okay fine good well mujhe mein me koi hai hain hua hui knee leg arm foot ankle hip back shoulder elbow wrist hand calf thigh neck chest ghutna taang kamar kandha pair haath".split(" "));

/**
 * "no": the patient has none of them. "yes": at least one (named, or just "yes"). "unclear": cannot tell, so it is asked again. A "yes" is always taken
 * seriously: the chat stops, the physiotherapist is told, and the patient names the sign on the form.
 */
export function readSigns(text: string): { answer: "no" | "yes" | "unclear"; flags: string[] } {
  const t = norm(text);
  const alert = screenCheckinText(text);
  const flags = [...new Set([...(alert ? flagsForAlert(alert.kind, text) : []), ...flagsFromText(text)])];
  if (alert || flags.length) return { answer: "yes", flags };
  if (YES_START.test(t)) return { answer: "yes", flags: [] };
  const stripped = stripDenials(text);
  const left = stripped.split(/[ ,;]+/).filter(Boolean);
  if (NO_START.test(t) || (t !== "" && stripped !== t && left.every((word) => FILLER.has(word)))) return { answer: "no", flags: [] };
  return { answer: "unclear", flags: [] };
}
