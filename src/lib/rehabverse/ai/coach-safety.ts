import { fromUrduScript } from "../../pna-ai/language.ts";
import type { Bi } from "../types.ts";
import { screenPatientText } from "./safety.ts";
import { COACH_STOP } from "./coach-spec.ts";

/**
 * The safety screen the exercise coach runs on EVERY patient message BEFORE any model is called. It has two layers: the same English and Roman Urdu
 * alert rules as the intake assistant (chest pain, breathing, stroke signs, saddle numbness, ...), and the things that matter in the middle of
 * an exercise session (a pop or tearing, a joint giving way, sharp or worsening pain, dizziness, new numbness or weakness, a swollen or hot limb,
 * a fall). The rules are deliberately cautious: a false alarm only means "stop and your physiotherapist looks at it". On a hit the coach does not
 * answer the question: it says stop, and the physiotherapist is told.
 */
export type CoachSafety = { level: "emergency" | "urgent"; kind: string; message: Bi };

const normalise = (text: string) =>
  fromUrduScript(text).toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();

const LIMB = "(calf|leg|knee|joint|ankle|foot|arm|elbow|wrist|hand|shoulder|hip|pindli|taang|ghutna|jor|takhna|paon|haath|kohni|kalai|kandha|kulha)";

const RULES: { kind: string; test: RegExp[] }[] = [
  {
    kind: "pop-or-tear",
    test: [
      /\b(felt|heard|had|got|there was|there is|suddenly|just)\b.{0,30}\b(pop|popped|snap|snapped|tear|tore|torn|tearing|rip|ripped|crack|cracked)\b/,
      /\b(pop|popped|snap|snapped|tore|ripped)\b.{0,12}\b(in|on|at)\b.{0,6}\b(my )?(back|neck|knee|shoulder|hip|ankle|calf|thigh|hamstring|elbow|wrist)\b/,
      /\b(awaaz|awaz|chatak)\b.{0,15}\b(aayi|aai|aya|hui)\b|\b(phat|phata|phatne|toot|toota|tootne)\b.{0,15}\b(gaya|gayi|jaisa|ka ehsaas)\b/,
    ],
  },
  {
    kind: "giving-way",
    test: [
      /\b(gave way|give way|gave out|giving way|buckled|locked up|locked|got stuck|stuck and cant|cant (bend|straighten|move|put weight|bear weight|stand))\b/,
      /\b(jawab de gaya|jawab de gayi|phans gaya|phans gayi|lock ho gaya|lock ho gayi)\b/,
    ],
  },
  {
    kind: "severe-pain",
    test: [
      /\b(sharp|stabbing|shooting|severe|excruciating|unbearable|worst|intense|terrible)\b.{0,25}\bpain\b/,
      /\bpain\b.{0,25}\b(sharp|stabbing|shooting|severe|unbearable|getting worse|worse and worse|worsening|not settling|wont go|will not go|wont stop)\b/,
      /\b(tez|shadeed|bardasht se bahar|bohat zyada|bohat tez)\b.{0,20}\bdard\b|\bdard\b.{0,20}\b(tez|shadeed|barh (raha|rahi)|bardasht|kam nahi)\b/,
    ],
  },
  {
    kind: "dizziness",
    test: [/\b(dizz\w*|faint\w*|black(ed)? out|light ?headed|going to pass out|spinning|chakkar|behosh\w*|andhera)\b/],
  },
  {
    kind: "numbness-or-weakness",
    test: [
      /\b(numb|numbness|tingling|tingle|pins and needles|cant feel|lost (the )?feeling|no feeling)\b/,
      /\b(sunn|sunn pan|sunnpan|jhunjhun\w*|chubhan)\b/,
      new RegExp(`\\b(weak|weakness|giving out|kamzor|kamzori)\\b.{0,25}\\b${LIMB}\\b|\\b${LIMB}\\b.{0,25}\\b(weak|weakness|kamzor|kamzori)\\b`),
    ],
  },
  {
    kind: "swelling",
    test: [
      new RegExp(`\\b(swell\\w*|swollen|sooj\\w*|soojan|hot and red|red and hot|hot to touch)\\b.{0,25}\\b${LIMB}\\b|\\b${LIMB}\\b.{0,25}\\b(swell\\w*|swollen|sooj\\w*|soojan|hot and red|red and hot|hot to touch)\\b`),
    ],
  },
  {
    kind: "fall",
    test: [/\b(i )?(fell|fallen|slipped|tripped)\b.{0,25}\b(down|over|while|during|on|and)\b|\bgir (gaya|gayi|gya|gai)\b|\bphisal (gaya|gayi)\b/],
  },
  {
    kind: "heart",
    test: [/\b(heart (is |was |feels? |keeps? |has been |started )?(racing|pounding|fluttering|skipping|beating (too )?fast)|palpitation\w*|dil (tez|zor se|bohat) dhadak\w*)\b/],
  },
];

export function screenCoachText(text: string): CoachSafety | null {
  // the same alert rules as everywhere else on the site first: they carry their own, more specific, emergency wording
  const common = screenPatientText(text);
  if (common) return { level: common.level === "emergency" ? "emergency" : "urgent", kind: common.kind, message: common.message };
  const t = normalise(text);
  for (const rule of RULES) if (rule.test.some((pattern) => pattern.test(t))) return { level: rule.kind === "heart" || rule.kind === "dizziness" ? "emergency" : "urgent", kind: rule.kind, message: COACH_STOP };
  return null;
}
