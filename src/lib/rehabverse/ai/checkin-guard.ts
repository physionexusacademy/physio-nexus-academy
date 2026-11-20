import { RULES } from "./guard.ts";

/**
 * What the model may say in the check-in chat is one short acknowledgement sentence, checked here before the patient sees it. It must not
 * diagnose, reassure, predict recovery, advise anything, mention medicines or treatment, claim to be a person, ask for identifying details,
 * ask a question (the system asks the questions) or state a number the patient did not say. An acknowledgement that breaks a rule is
 * replaced by a scripted one (checkin-spec.ts, scriptedAck).
 */
export type AckResult = { ok: true; text: string } | { ok: false; reason: string };

/** The shared rules that apply to a one-sentence acknowledgement. */
const SHARED = new Set(["diagnosis", "medicine", "reassurance or promise", "asks for identifying details", "link or contact detail"]);

const ACK_RULES: { reason: string; test: (text: string) => boolean }[] = [
  { reason: "claims to be a person or clinician", test: (t) => /\b(i am|i'm|im)\s+(a |an |your |the |also )?(real |licensed |qualified |human |actual |trained )?(doctor|physician|physiotherapist|physio|surgeon|nurse|clinician|human|person)\b/i.test(t) || /\bmain\s+(aap\s+ka\s+|ek\s+)?(doctor|physiotherapist|physio|insaan)\s+hoon\b/i.test(t) },
  { reason: "prediction or reassurance", test: (t) => /\b(recover\w*|healing|heal|heals|on track|good sign|normal|natural|expected|common|nothing to worry|will (get|be|settle|pass|go|improve|ease)|should (get|be|settle|pass|improve|ease)|soon|theek ho jayega|theek ho jayegi|behtar ho jayega|behtar ho jayegi|fikr na|fikar na|ghabra)\b/i.test(t) },
  { reason: "speculates about a cause or condition", test: (t) => /\b(sounds like|looks like|seems like|could be|might be|may be|probably|likely|perhaps|maybe|suggests?|indicates?|caused by|due to|because of|strain|sprain|tendin\w+|bursitis|arthritis|inflammation|sciatica|herniat\w*|slipped disc|fracture|ligament|syndrome)\b/i.test(t) },
  { reason: "advice or instruction", test: (t) => /\b(you should|you could|you can try|try to|make sure you|i suggest|i recommend|keep (doing|going)|do not|dont|avoid|rest|stretch|ice|heat|massage|medicine|medication|tablet|painkiller)\b/i.test(t) || /\b(karein|kijiye|kijiyega|rakhein|lagayein|khayein|karna|lena)\b/i.test(t) },
  { reason: "asks a question", test: (t) => /\?/.test(t) },
  { reason: "markup or JSON", test: (t) => /[{}]/.test(t) || /<\/?[a-z][^>]*>/i.test(t) || /\[removed\]/.test(t) },
];

export function guardAck(raw: unknown, patientText: string): AckResult {
  if (typeof raw !== "string") return { ok: false, reason: "not text" };
  const text = raw.replace(/```[\s\S]*?```/g, " ").replace(/[*_`#>]+/g, "").replace(/^\s*[-•]\s+/gm, "").replace(/\s+/g, " ").trim();
  if (text.length < 3) return { ok: false, reason: "empty" };
  if (text.length > 220) return { ok: false, reason: "too long" };
  if ((text.match(/[.!]/g) ?? []).length > 2) return { ok: false, reason: "more than one sentence" };
  for (const rule of RULES) if (SHARED.has(rule.reason) && rule.test(text)) return { ok: false, reason: rule.reason };
  for (const rule of ACK_RULES) if (rule.test(text)) return { ok: false, reason: rule.reason };
  // every number must be one the patient wrote
  const said = new Set((patientText.match(/\d+/g) ?? []).map(Number));
  for (const match of text.matchAll(/\d+/g)) if (!said.has(Number(match[0]))) return { ok: false, reason: `a number the patient did not say (${match[0]})` };
  return { ok: true, text };
}
