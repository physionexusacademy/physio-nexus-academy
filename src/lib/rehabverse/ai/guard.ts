/**
 * Everything the assistant says is checked here before the patient sees it. The assistant is an interviewer, not a clinician: it must not
 * diagnose, name a likely condition, recommend any treatment or medicine, promise an outcome, call anything "not serious", claim to be a
 * person or a doctor, or ask for identifying details. A reply that breaks a rule is replaced by a scripted, warm question instead.
 */
export type GuardResult = { ok: true; text: string } | { ok: false; reason: string };

const CONDITIONS = "slipped disc|slip disc|herniat\\w*|disc (?:prolapse|bulge|problem|issue)|sciatica|arthritis|osteoarthritis|tendin\\w+|bursitis|sprain\\w*|strain\\w*|tear|torn|fracture\\w*|frozen shoulder|carpal tunnel|cauda equina|pinched nerve|nerve (?:compression|damage|entrapment|pain)|spondyl\\w+|stenosis|gout|ligament (?:tear|injury)|meniscus";

export type GuardRule = { reason: string; test: (text: string) => boolean };
/** The rules, exported so the exercise coach (coach-guard.ts) can reuse the ones that apply to it. */
export const RULES: GuardRule[] = [
  { reason: "claims to be a person or clinician", test: (t) => /\b(i am|i'm|im|as)\s+(a |an |your |the )?(real |licensed |qualified |human )?(doctor|physician|physiotherapist|physio|surgeon|nurse|clinician|human|person)\b/i.test(t) || /\bmain\s+(aap\s+ka\s+|ek\s+)?(doctor|physiotherapist|physio|insaan)\s+hoon\b/i.test(t) },
  { reason: "diagnosis", test: (t) => new RegExp(`\\b(you (?:probably |likely |may |might |could |seem to )?have|you've got|youve got|it'?s|it is|this is|that is|sounds like|looks like|could be|might be|may be|probably|likely)\\s+(?:a |an |some )?(?:${CONDITIONS})`, "i").test(t) },
  { reason: "diagnosis", test: (t) => /\byou (are suffering from|suffer from|are diagnosed|were diagnosed)\b/i.test(t) || /\b(your|the) diagnosis (is|would be)\b/i.test(t) },
  { reason: "diagnosis", test: (t) => new RegExp(`\\baap\\s+ko\\s+.{0,30}\\b(?:${CONDITIONS}|gathiya|hernia)`, "i").test(t) || new RegExp(`\\b(?:yeh|ye)\\s+(?:${CONDITIONS}|gathiya|hernia)`, "i").test(t) },
  { reason: "treatment advice", test: (t) => /\byou (should|must|need to|ought to|have to) (take|try|use|apply|start|stop|avoid|do|rest|stretch|exercise|ice|massage|see a|go to|visit|get)\b/i.test(t) || /\b(i|we) (recommend|suggest|advise|prescribe)\b/i.test(t) || /\b(try|take|use|apply) (some |a |an )?(ice|heat|hot|cold|pack|massage|stretch\w*|exercise\w*|rest|brace|belt|pillow|rub)\b/i.test(t) },
  { reason: "treatment advice", test: (t) => /\b(dawai|dawa|tablet|goli|injection|cream|gel|spray)\b.{0,25}\b(lein|len|khayen|khaiye|le lijiye|lagayen|lagaiye|lagayein)\b/i.test(t) || /\b(garam seak|seak|barf|massage|stretch|exercise)\s+(karein|kijiye|kar lein|karen|lagayen)\b/i.test(t) || /\baap\s+ko\s+.{0,25}\b(karna chahiye|lena chahiye|lagana chahiye|rest karna)\b/i.test(t) },
  { reason: "medicine", test: (t) => /\b\d+(\.\d+)?\s?(mg|mcg|ml|g)\b/i.test(t) || (/\b(paracetamol|panadol|ibuprofen|brufen|diclofenac|voltaren|naproxen|tramadol|aspirin|steroid|cortisone|muscle relaxant|painkiller|pain killer|antibiotic)\b/i.test(t) && /\b(you (could|can|may|should|might|must)|try|take|use|start|lein|le lein|khayen|better)\b/i.test(t)) },
  { reason: "reassurance or promise", test: (t) => /\b(guarantee\w*|definitely (get|be|heal|recover)|will (surely|definitely) (heal|recover|get better)|will (heal|cure|fix)|100\s?%|nothing (serious|to worry|wrong)|not (serious|anything serious)|no need to worry|dont worry about it|don't worry about it)\b/i.test(t) || /\bkoi\s+(bari|serious)\s+baat\s+nahi\b|\bkuch\s+nahi\s+(hoga|hai)\b|\bpakka\s+theek\b|\bfikr\s+ki\s+koi\s+baat\s+nahi\b|\btension\s+(mat|na)\s+lein\b/i.test(t) },
  { reason: "asks for identifying details", test: (t) => /\b(your|aap\s+ka|apna|apni)\s+(full\s+|poora\s+)?(name|phone|mobile|number|cnic|address|email|pata|naam)\b/i.test(t) },
  { reason: "link or contact detail", test: (t) => /(https?:\/\/|www\.)/i.test(t) || /\S+@\S+\.\S+/.test(t) || /\+?\d(?:[\s-]?\d){7,}/.test(t) },
];

/** Cleans markdown and checks the reply. On success returns the plain text to show. */
export function guardReply(raw: unknown): GuardResult {
  if (typeof raw !== "string") return { ok: false, reason: "not text" };
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`#>]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length < 3) return { ok: false, reason: "empty" };
  if (text.length > 900) return { ok: false, reason: "too long" };
  if ((text.match(/\?/g) ?? []).length > 2) return { ok: false, reason: "asks several questions" };
  for (const rule of RULES) if (rule.test(text)) return { ok: false, reason: rule.reason };
  return { ok: true, text };
}
