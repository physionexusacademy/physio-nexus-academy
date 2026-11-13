/**
 * Rule-based decision support for the clinician's review of a day (ERRP: exercise response and
 * recovery pattern). Transparent by design:
 *   - every rule is listed here, with its id and plain-language wording;
 *   - the reviewer sees which rules fired and why;
 *   - it only SUGGESTS. The physiotherapist decides, and nothing opens the next day by itself unless
 *     the clinician chose the "auto-release after safe feedback" programme rule.
 * The rules follow the widely used pain-monitoring approach (pain up to about 5/10 during exercise is
 * acceptable if it settles within 24 hours and does not build up from day to day: Thomeé 1997,
 * Silbernagel 2007, Smith 2017). They are a predefined, conservative starting point that the
 * supervising physiotherapist must review and adopt — they have NOT been clinically validated by
 * a trial, and they are not a diagnosis or a prescription.
 */
import type { AdminSessionBundle, ReviewDecision } from "./api-types";

export type Suggestion = "pause_refer" | "reassess" | "regress" | "maintain" | "progress";

export type RuleResult = {
  id: string;
  fired: boolean;
  /** What the rule checks, in plain language. */
  check: string;
  /** What it found (only when fired). */
  found?: string;
  /** What the rule suggests when it fires. */
  suggests: Suggestion;
};

export type DecisionSupport = {
  suggestion: Suggestion;
  /** The decision the review form pre-selects for this suggestion. */
  decision: ReviewDecision;
  headline: string;
  rules: RuleResult[];
  /** Things that were missing, so the suggestion is provisional. */
  provisional: string[];
  disclaimer: string;
  references: string[];
};

export const DISCLAIMER =
  "Decision support only. These are predefined rules for the supervising physiotherapist to review; they are not a diagnosis, not clinically validated, and not a replacement for clinical judgement. The physiotherapist makes every decision.";

const PRIORITY: Suggestion[] = ["pause_refer", "reassess", "regress", "maintain", "progress"];
const DECISION_FOR: Record<Suggestion, ReviewDecision> = {
  pause_refer: "pause", reassess: "reassess", regress: "regress", maintain: "maintain", progress: "progress",
};
const HEADLINE: Record<Suggestion, string> = {
  pause_refer: "Suggest: pause the programme and arrange urgent clinical review",
  reassess: "Suggest: pause and reassess the patient before continuing",
  regress: "Suggest: reduce the load (regress) before progressing",
  maintain: "Suggest: repeat or maintain the current level",
  progress: "Suggest: the patient may be ready to progress",
};

export const RULE_CATALOGUE: { id: string; check: string; suggests: Suggestion }[] = [
  { id: "R1", suggests: "pause_refer", check: "The patient reported a possible emergency symptom (chest pain, dizziness/fainting, new numbness or weakness, hot swollen calf)." },
  { id: "R2", suggests: "pause_refer", check: "The patient reported another urgent safety symptom (severe pain that did not settle, a possible injury, a swollen or locked joint)." },
  { id: "R3", suggests: "reassess", check: "The patient described unusual symptoms." },
  { id: "R4", suggests: "reassess", check: "Pain was 7/10 or higher during or after the session." },
  { id: "R5", suggests: "reassess", check: "Symptoms were reported as worse at BOTH the next-day and 48-hour check-ins, or pain is climbing day after day." },
  { id: "R6", suggests: "regress", check: "Pain during exercise was above 5/10, or pain after exercise was 3 or more points above pain before." },
  { id: "R7", suggests: "regress", check: "Symptoms were reported as worse at a recovery check-in, or pain at the next-day check-in was 2 or more points above the pain before exercise." },
  { id: "R8", suggests: "regress", check: "The patient rated the session 8/10 or harder (too difficult)." },
  { id: "R9", suggests: "maintain", check: "The session was not fully completed." },
  { id: "R10", suggests: "progress", check: "Fully completed, pain during 3/10 or less, pain after no more than 1 point above before, difficulty 4/10 or easier, no worse-symptom report, no safety symptoms." },
];

const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "—" : `${n}/10`);

/** `previous` = the earlier reviewed/feedback days of the same programme, oldest first. */
export function decisionSupport(day: AdminSessionBundle, previous: AdminSessionBundle[] = []): DecisionSupport {
  const fb = day.feedback;
  const obs = day.observations;
  const provisional: string[] = [];
  const results: RuleResult[] = [];
  const add = (id: string, fired: boolean, found?: string) => {
    const base = RULE_CATALOGUE.find((r) => r.id === id)!;
    results.push({ id, fired, check: base.check, found: fired ? found : undefined, suggests: base.suggests });
  };

  if (!fb) {
    return {
      suggestion: "maintain", decision: "maintain", headline: "No feedback yet — nothing to suggest",
      rules: RULE_CATALOGUE.map((r) => ({ ...r, fired: false })), provisional: ["The patient has not submitted feedback for this day."],
      disclaimer: DISCLAIMER, references: ["thomee1997", "silbernagel2007", "smith2017"],
    };
  }

  const allFlags = [...fb.safety_flag_ids, ...obs.flatMap((o) => o.flag_ids)];
  const emergency = allFlags.filter((f) => ["fb_chest", "fb_dizzy", "fb_neuro", "fb_calf"].includes(f));
  const urgent = allFlags.filter((f) => ["fb_severe_pain", "fb_injury", "fb_joint"].includes(f));
  add("R1", emergency.length > 0, `Reported: ${emergency.join(", ")}.`);
  add("R2", urgent.length > 0, `Reported: ${urgent.join(", ")}.`);
  add("R3", fb.unusual_symptoms, fb.unusual_text ? `“${fb.unusual_text.slice(0, 200)}”` : "Unusual symptoms ticked.");

  const peak = Math.max(fb.pain_during ?? 0, fb.pain_after ?? 0);
  add("R4", peak >= 7, `Pain during ${fmt(fb.pain_during)}, after ${fmt(fb.pain_after)}.`);

  const at = (t: string) => obs.find((o) => o.timepoint === t);
  const d24 = at("24h");
  const d48 = at("48h");
  const worse24 = d24?.symptom_response === "worse";
  const worse48 = d48?.symptom_response === "worse";
  // Pain "climbing day after day": three consecutive days where the end-of-session pain rises.
  const chain = [...previous.filter((p) => p.feedback && (p.feedback.completion !== "none")), day].slice(-3).map((d) => d.feedback?.pain_after ?? null);
  const climbing = chain.length === 3 && chain.every((v) => v !== null) && (chain[1] as number) > (chain[0] as number) && (chain[2] as number) > (chain[1] as number) && (chain[2] as number) - (chain[0] as number) >= 2;
  add("R5", (worse24 && worse48) || climbing, worse24 && worse48 ? "Worse at the next-day and 48-hour check-ins." : `Pain after the last three days: ${chain.map(fmt).join(" → ")}.`);

  const before = fb.pain_before ?? 0;
  const rise = (fb.pain_after ?? 0) - before;
  add("R6", (fb.pain_during ?? 0) > 5 || rise >= 3, `Pain before ${fmt(fb.pain_before)}, during ${fmt(fb.pain_during)}, after ${fmt(fb.pain_after)}.`);
  const next = d24?.pain ?? null;
  const notSettled = next !== null && next - before >= 2;
  const worseAny = obs.some((o) => o.symptom_response === "worse");
  add("R7", worseAny || notSettled, worseAny ? "Reported as worse at a recovery check-in." : `Next-day pain ${fmt(next)} vs ${fmt(fb.pain_before)} before exercise.`);
  add("R8", (fb.difficulty ?? 0) >= 8, `Difficulty ${fmt(fb.difficulty)}.`);
  add("R9", fb.completion !== "all", fb.completion === "none" ? "The day was not done." : "Only part of the day was done.");

  const calm = fb.completion === "all" && (fb.pain_during ?? 0) <= 3 && rise <= 1 && (fb.difficulty ?? 0) <= 4 && !worseAny && !notSettled &&
    allFlags.length === 0 && !fb.unusual_symptoms;
  add("R10", calm, `Completed, pain during ${fmt(fb.pain_during)}, after ${fmt(fb.pain_after)}, difficulty ${fmt(fb.difficulty)}.`);

  // The most cautious fired rule wins; with nothing fired, repeat the level.
  const fired = results.filter((r) => r.fired);
  let suggestion: Suggestion = "maintain";
  for (const level of PRIORITY) {
    if (fired.some((r) => r.suggests === level)) { suggestion = level; break; }
  }
  if (suggestion === "progress" && fired.some((r) => r.suggests === "maintain")) suggestion = "maintain";

  const planned = (new Set(["later_same_day", "24h", "48h"]));
  for (const t of planned) if (!at(t)) provisional.push(`The ${t === "later_same_day" ? "later-same-day" : t} recovery check-in has not been reported.`);
  if (!d24 && (suggestion === "progress")) provisional.push("Consider waiting for the next-day response before progressing.");

  return {
    suggestion, decision: DECISION_FOR[suggestion], headline: HEADLINE[suggestion], rules: results, provisional,
    disclaimer: DISCLAIMER, references: ["thomee1997", "silbernagel2007", "smith2017"],
  };
}
