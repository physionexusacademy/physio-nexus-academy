import { fromUrduScript } from "../../pna-ai/language.ts";

/**
 * Plain denials ("no chest pain", "chakkar nahi aaya") taken out of a patient's text BEFORE a safety screen reads it. The assistants sometimes ASK
 * about warning signs (the check-in's safety question, the intake's "any other symptoms or heart problems?"), so a denial is a normal answer, and the
 * shared screens have no idea about negation. Only a negator directly followed by the symptom (or the symptom directly followed by "nahi") is
 * removed; anything else is left for the screen: "no feeling in my foot", "no but my knee gave way", "no way I could bear the sharp pain" and
 * "no chest pain, sharp pain at night" all still alarm. A false stop only costs a physiotherapist's look; a hidden warning sign costs more.
 */
const norm = (text: string) =>
  fromUrduScript(text).toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9+/.\s]/g, " ").replace(/(?<!\d)[./]|[./](?!\d)/g, " ").replace(/\s+/g, " ").trim();

/** A symptom word a denial may start with, and the plain nouns it may continue with ("no chest pain, dizziness or numbness"). Qualified ones ("sharp pain") only count right after the negator. */
const EN_FIRST =
  "(?:chest\\s+(?:pain|pains|tightness|pressure|discomfort)|calf\\s+(?:pain|swelling)|(?:sharp|severe|bad)(?:\\s+(?:or|and)\\s+(?:sharp|severe|bad))?\\s+pain|pains?|dizziness|dizzy\\s+spells?|fainting|blackouts?|numbness|tingling|weakness|swelling|locking|falls?|pops?|tears?|twists?|breathlessness|shortness\\s+of\\s+breath|(?:trouble|difficulty|problems?|issues?)\\s+(?:in\\s+|with\\s+)?breathing|breathing\\s+(?:trouble|difficulty|problems?|issues?)|loss\\s+of\\s+(?:bladder|bowel)\\s+control|(?:bladder|bowel|bowels|urinary)\\s+(?:problems?|issues?|trouble|difficulty|accidents?|incontinence)|(?:trouble|difficulty|problems?|issues?)\\s+(?:with\\s+)?(?:controlling\\s+|holding\\s+)?(?:my\\s+)?(?:bladder|bowels?|urine|stool)|incontinence|injur(?:y|ies)|problems?|issues?|symptoms?|warning\\s+signs?)";
const EN_MORE = "(?:(?:bladder|bowel|bowels)\\s+(?:problems?|issues?|trouble|accidents?)|incontinence|chest\\s+pain|calf\\s+pain|calf\\s+swelling|pains?|dizziness|fainting|blackouts?|numbness|tingling|weakness|swelling|locking|falls?|pops?|tears?|twists?|breathlessness)";
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
  /\b(?:have not|havent|has not|hasnt|did not|didnt|never)\s+(?:lost|lose|losing)\s+(?:any\s+)?(?:control|my bladder|my bowels?)(?:\s+(?:of|over)\s+(?:my\s+)?(?:the\s+)?(?:bladder|bowels?|urine|stool))?(?![a-z])/g,
  /\b(?:peshab|pishab|pakhana|pakhane)\s+(?:par|pe|ka)\s+control\s+(?:hai|theek|barabar)(?![a-z])/g,
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

