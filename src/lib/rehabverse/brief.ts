/**
 * The history brief: what the treating physiotherapist reads before the first visit. Built by plain code from the submitted assessment and,
 * when there is one, the AI intake conversation that produced it. No model writes any of it, so nothing can be invented: every sentence is
 * a fixed template filled with the patient's own answers (free text is quoted, never paraphrased). It organises and points out gaps; it
 * never diagnoses, never suggests treatment, and the physiotherapist decides everything.
 *
 * Pure code (no server imports) so the validator can test every rule.
 */
import type { AdminAiConversation, AdminAssessment, FlagLevel } from "./api-types";
import { INTAKE_DURATION, INTAKE_REGIONS, INTAKE_RED_FLAGS, INTAKE_SYMPTOMS, flagLabel } from "./intake.ts";
import { screenPatientText } from "./ai/safety.ts";

export type BriefPatient = { age_years: number; sex: string | null; preferred_language: "en" | "ru" };
export type BriefInput = { patient: BriefPatient; assessment: AdminAssessment; conversation?: AdminAiConversation | null };

export type BriefFlag = { id: string; level: "emergency" | "urgent"; label: string };
export type BriefCrossCheck = { kind: string; level: string; quote: string; where: string; flags: string[] };
export type BriefChange = { label: string; chat: string; form: string };
export type BriefAsk = { id: string; text: string; because: string };

export type Brief = {
  source: { kind: "ai_chat" | "form"; text: string };
  headline: string;
  safety: { level: FlagLevel; ticked: BriefFlag[]; crossChecks: BriefCrossCheck[]; chatAlert: string | null };
  /** The story in plain sentences (patient's words quoted). */
  narrative: string[];
  facts: { label: string; value: string }[];
  /** Conditions or medicines the patient mentioned that matter when choosing exercise or hands-on techniques. */
  mentions: { label: string; term: string }[];
  /** What the patient corrected after the chat; null when there was no AI conversation. */
  changes: BriefChange[] | null;
  asks: BriefAsk[];
  /** Scores or answers that do not fit together. */
  checks: string[];
  footer: string;
};

export const BRIEF_FOOTER =
  "Organised by fixed rules from the patient's own answers, not written by AI, and not a diagnosis. Quoted text is the patient's. The physiotherapist makes every decision.";

const ONSET: Record<string, string> = {
  sudden: "suddenly (an injury or one moment)",
  gradual: "slowly, over time",
  after_surgery: "after surgery or a procedure",
  unknown: "not sure how it started",
};

const lc = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);
const optionLabel = (options: { id: string; label: { en: string } }[], id: string) => options.find((o) => o.id === id)?.label.en ?? id;
const clean = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, " ").trim();
const quote = (value: string) => `“${clean(value)}”`;
const pain = (value: number | null | undefined) => (value === null || value === undefined ? "–" : `${value}/10`);
const list = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

const areasOf = (regions: string[]) => regions.map((id) => lc(optionLabel(INTAKE_REGIONS, id)));
const symptomsOf = (ids: string[]) => ids.map((id) => lc(optionLabel(INTAKE_SYMPTOMS, id)));

/** Conditions and medicines worth knowing about, found by words in the history (English and common Roman Urdu spellings). */
const MENTIONS: { label: string; test: RegExp }[] = [
  { label: "Diabetes", test: /\b(diabet\w*|sugar|insulin|metformin)\b/i },
  { label: "High blood pressure", test: /\b(hypertens\w*|blood pressure|bp|high bp)\b/i },
  { label: "Heart condition", test: /\b(heart|cardiac|stent|bypass|angina|pacemaker|dil)\b/i },
  { label: "Blood thinner", test: /\b(warfarin|blood thinner\w*|anticoag\w*|clopidogrel|rivaroxaban|apixaban|aspirin|disprin)\b/i },
  { label: "Steroids", test: /\b(steroid\w*|prednisolone|prednisone|cortisone|deltacortril)\b/i },
  { label: "Osteoporosis (thin bones)", test: /\b(osteopor\w*|brittle bones?|weak bones?|bone density)\b/i },
  { label: "Pregnancy", test: /\b(pregnan\w*|expecting|hamla)\b/i },
  { label: "Cancer", test: /\b(cancer|tumou?r|chemo\w*|radiotherapy|malignan\w*)\b/i },
  { label: "Asthma or lung condition", test: /\b(asthma|copd|inhaler|lung)\b/i },
  { label: "Kidney or liver condition", test: /\b(kidney|renal|dialysis|liver)\b/i },
  { label: "Thyroid", test: /\bthyroid\b/i },
  { label: "Epilepsy or seizures", test: /\b(epilep\w*|seizure\w*|fits)\b/i },
  { label: "Inflammatory joint disease", test: /\b(rheumat\w*|arthritis|lupus|spondyl\w*|gout)\b/i },
  { label: "Fracture, surgery or implant", test: /\b(fracture\w*|surgery|surgical|operation|operated|replacement|implant\w*|plate|screws?)\b/i },
];

const TEXT_FIELDS: { key: keyof AdminAssessment; label: string }[] = [
  { key: "own_words", label: "the patient's own words" },
  { key: "other_symptoms", label: "other symptoms" },
  { key: "possible_cause", label: "what the patient thinks caused it" },
  { key: "aggravating", label: "what makes it worse" },
  { key: "relieving", label: "what eases it" },
  { key: "functional_limitations", label: "what it limits" },
  { key: "previous_treatment", label: "previous treatment" },
  { key: "medical_conditions", label: "medical conditions" },
  { key: "medications", label: "medications" },
];

const ticked = (assessment: AdminAssessment): BriefFlag[] =>
  assessment.red_flag_ids.map((id) => {
    const known = INTAKE_RED_FLAGS.find((f) => f.id === id);
    return { id, level: known?.level ?? "urgent", label: flagLabel(id)?.en ?? id };
  });

/** Words in the patient's free text that the red-flag screening would have caught, when the screening question was answered "no". */
function crossChecks(assessment: AdminAssessment, conversation: AdminAiConversation | null | undefined): BriefCrossCheck[] {
  const units: { where: string; text: string }[] = [];
  for (const { key, label } of TEXT_FIELDS) {
    const text = clean(assessment[key] as string | null);
    if (text) units.push({ where: label, text });
  }
  for (const message of conversation?.messages ?? []) {
    if (message.role === "patient" && clean(message.text)) units.push({ where: "the AI conversation", text: clean(message.text) });
  }
  const answered = new Set(assessment.red_flag_ids);
  const found: BriefCrossCheck[] = [];
  const seen = new Set<string>();
  for (const unit of units) {
    const hit = screenPatientText(unit.text);
    if (!hit) continue;
    const open = hit.suggestedFlags.filter((flag) => !answered.has(flag));
    // a kind that has no screening question (an emotional crisis) is always worth a look; the others only when the question was not ticked
    if (hit.suggestedFlags.length > 0 && open.length === 0) continue;
    const id = `${hit.kind}:${unit.text.slice(0, 40)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    found.push({ kind: hit.kind, level: hit.level, quote: unit.text.length > 160 ? unit.text.slice(0, 157) + "…" : unit.text, where: unit.where, flags: open });
  }
  return found.slice(0, 5);
}

function mentionsOf(assessment: AdminAssessment): Brief["mentions"] {
  const text = [assessment.medical_conditions, assessment.medications, assessment.previous_treatment, assessment.own_words, assessment.other_symptoms, assessment.possible_cause]
    .map((value) => clean(value))
    .filter(Boolean)
    .join(" ; ");
  const out: Brief["mentions"] = [];
  for (const { label, test } of MENTIONS) {
    const hit = test.exec(text);
    if (hit) out.push({ label, term: hit[0] });
  }
  return out;
}

const norm = (value: unknown): string => {
  if (Array.isArray(value)) return [...value].map(String).sort().join("|");
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim().toLowerCase();
};

/** The assistant's last draft against what the patient finally submitted. */
function changesOf(assessment: AdminAssessment, conversation: AdminAiConversation): BriefChange[] {
  const draft = conversation.draft ?? {};
  const show = (key: string, value: unknown): string => {
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return "—";
    if (key === "regions") return (value as string[]).map((id) => optionLabel(INTAKE_REGIONS, id)).join(", ");
    if (key === "symptoms") return (value as string[]).map((id) => optionLabel(INTAKE_SYMPTOMS, id)).join(", ");
    if (key === "duration") return optionLabel(INTAKE_DURATION, String(value));
    if (key === "onset") return ONSET[String(value)] ?? String(value);
    if (key.startsWith("pain_")) return pain(Number(value));
    return String(value);
  };
  const fields: [string, string][] = [
    ["regions", "Areas"], ["symptoms", "Symptoms"], ["pain_now", "Pain now"], ["pain_worst", "Pain, worst"], ["pain_best", "Pain, best"],
    ["duration", "How long"], ["onset", "How it started"], ["possible_cause", "Possible cause"], ["aggravating", "Makes it worse"], ["relieving", "Eases it"],
    ["functional_limitations", "What it limits"], ["previous_treatment", "Previous treatment"], ["medical_conditions", "Medical conditions"],
    ["medications", "Medications"], ["other_symptoms", "Other symptoms"], ["own_words", "Own words"],
  ];
  const record = assessment as unknown as Record<string, unknown>;
  const changes: BriefChange[] = [];
  for (const [key, label] of fields) {
    if (norm(draft[key]) !== norm(record[key])) changes.push({ label, chat: show(key, draft[key]), form: show(key, record[key]) });
  }
  return changes;
}

function asksOf(assessment: AdminAssessment, patient: BriefPatient, mentions: Brief["mentions"]): { asks: BriefAsk[]; checks: string[] } {
  const asks: BriefAsk[] = [];
  const add = (id: string, text: string, because: string) => asks.push({ id, text, because });
  const checks: string[] = [];

  if (!assessment.onset || assessment.onset === "unknown") add("H1", "How and when it started: suddenly or gradually, and after what.", assessment.onset === "unknown" ? "The patient was not sure how it started." : "How it started was not recorded.");
  if (!clean(assessment.possible_cause)) add("H2", "What the patient thinks started it.", "No possible cause was given.");
  if (assessment.pain_worst === null || assessment.pain_best === null) add("H3", "The pain range over the last week (worst and best).", "Only the pain score for now was recorded.");
  if (!clean(assessment.previous_treatment)) add("H4", "What has already been tried and what happened.", "No previous treatment was recorded.");
  if (assessment.regions.includes("multiple") || assessment.regions.length > 2) add("H5", "Which area bothers the patient most, and whether the areas are related.", "More than one area was reported.");
  if (assessment.pain_now >= 7) add("H6", "What the pain stops the patient doing, and how settled it is at rest.", `Pain now is ${assessment.pain_now}/10.`);
  if (assessment.duration === "3_6m" || assessment.duration === "gt_6m") add("H7", "Sleep, stress, work and activity levels, which can affect recovery.", `The problem has lasted ${lc(optionLabel(INTAKE_DURATION, assessment.duration))}.`);
  const neuro = assessment.symptoms.filter((s) => ["weakness", "balance", "walking_difficulty"].includes(s));
  if (neuro.length) add("H8", "Whether the weakness, balance or walking problem is changing, and any numbness or tingling.", `Reported: ${list(symptomsOf(neuro))}.`);
  if (mentions.length) add("H9", "Details of the conditions and medicines mentioned, as they matter when choosing exercise or hands-on techniques.", `Mentioned: ${list(mentions.map((m) => lc(m.label)))}.`);
  if (!clean(assessment.own_words)) add("H10", "What the patient most wants help with.", "No own words were given.");
  if (patient.age_years >= 65) add("H11", "Falls, balance and general activity.", "The patient is 65 or older.");
  const wording = [assessment.other_symptoms, assessment.own_words, assessment.functional_limitations, assessment.aggravating, assessment.possible_cause].map(clean).join(" ; ");
  if (/\b(numb\w*|tingl\w*|pins and needles|sunn\w*|jhunjhun\w*|burning)\b/i.test(wording)) add("H12", "Where the numbness or tingling is felt, when it started, whether it is changing, and any weakness with it.", "Numbness or tingling was mentioned in the patient's words.");

  if (assessment.pain_worst !== null && assessment.pain_worst < assessment.pain_now) checks.push(`Pain "worst" (${assessment.pain_worst}/10) is lower than pain now (${assessment.pain_now}/10): confirm the scores.`);
  if (assessment.pain_best !== null && assessment.pain_best > assessment.pain_now) checks.push(`Pain "best" (${assessment.pain_best}/10) is higher than pain now (${assessment.pain_now}/10): confirm the scores.`);
  if (assessment.pain_now === 0 && assessment.symptoms.includes("pain")) checks.push("Pain is listed as a symptom but pain now is 0/10.");
  return { asks, checks };
}

export function buildHistoryBrief({ patient, assessment, conversation }: BriefInput): Brief {
  const areas = areasOf(assessment.regions);
  const symptoms = symptomsOf(assessment.symptoms);
  const flags = ticked(assessment);
  const sex = patient.sex && /^(male|female)$/i.test(patient.sex) ? patient.sex.toLowerCase() : "";
  const duration = assessment.duration ? lc(optionLabel(INTAKE_DURATION, assessment.duration)) : "";

  const headline = [`${patient.age_years}-year-old${sex ? ` ${sex}` : ""}`, areas.length ? list(areas) : "area not recorded", duration, `pain ${pain(assessment.pain_now)}`].filter(Boolean).join(" · ");

  const narrative: string[] = [];
  narrative.push(
    `${patient.age_years}-year-old${sex ? ` ${sex}` : ""} patient reporting ${symptoms.length ? list(symptoms) : "a problem"} in the ${areas.length ? list(areas) : "area not recorded"}${duration ? `, present for ${duration}` : ""}.`,
  );
  const range = [assessment.pain_worst !== null ? `worst ${pain(assessment.pain_worst)}` : "", assessment.pain_best !== null ? `best ${pain(assessment.pain_best)}` : ""].filter(Boolean);
  narrative.push(`Pain is ${pain(assessment.pain_now)} now${range.length ? ` (${range.join(", ")})` : ""}.`);
  if (assessment.onset) narrative.push(`It started ${ONSET[assessment.onset] ?? assessment.onset}.`);
  if (clean(assessment.possible_cause)) narrative.push(`The patient links it to: ${quote(assessment.possible_cause!)}.`);
  if (clean(assessment.aggravating)) narrative.push(`Worse with: ${quote(assessment.aggravating!)}.`);
  if (clean(assessment.relieving)) narrative.push(`Eased by: ${quote(assessment.relieving!)}.`);
  if (clean(assessment.functional_limitations)) narrative.push(`It limits: ${quote(assessment.functional_limitations!)}.`);
  if (clean(assessment.other_symptoms)) narrative.push(`Other symptoms: ${quote(assessment.other_symptoms!)}.`);
  if (clean(assessment.previous_treatment)) narrative.push(`Previous treatment: ${quote(assessment.previous_treatment!)}.`);
  if (clean(assessment.medical_conditions)) narrative.push(`Medical history: ${quote(assessment.medical_conditions!)}.`);
  if (clean(assessment.medications)) narrative.push(`Medications: ${quote(assessment.medications!)}.`);
  narrative.push(flags.length ? `Red-flag screening ticked: ${list(flags.map((f) => lc(f.label)))}.` : "Red-flag screening: nothing ticked.");

  const facts = [
    { label: "Areas", value: areas.length ? list(areas.map((a) => a.charAt(0).toUpperCase() + a.slice(1))) : "" },
    { label: "Symptoms", value: symptoms.join(", ") },
    { label: "Pain now / worst / best", value: `${pain(assessment.pain_now)} / ${pain(assessment.pain_worst)} / ${pain(assessment.pain_best)}` },
    { label: "How long", value: assessment.duration ? optionLabel(INTAKE_DURATION, assessment.duration) : "" },
    { label: "How it started", value: assessment.onset ? ONSET[assessment.onset] ?? assessment.onset : "" },
    { label: "Possible cause", value: clean(assessment.possible_cause) },
    { label: "Makes it worse", value: clean(assessment.aggravating) },
    { label: "Eases it", value: clean(assessment.relieving) },
    { label: "What it limits", value: clean(assessment.functional_limitations) },
    { label: "Previous treatment", value: clean(assessment.previous_treatment) },
    { label: "Medical conditions", value: clean(assessment.medical_conditions) },
    { label: "Medications", value: clean(assessment.medications) },
    { label: "Other symptoms", value: clean(assessment.other_symptoms) },
    { label: "In the patient's own words", value: clean(assessment.own_words) },
  ].filter((fact) => fact.value);

  const mentions = mentionsOf(assessment);
  const { asks, checks } = asksOf(assessment, patient, mentions);
  const hasChat = !!conversation && conversation.messages.length > 0;

  return {
    source: hasChat
      ? { kind: "ai_chat", text: `Collected in a conversation with the AI assistant (${conversation!.turns} turn${conversation!.turns === 1 ? "" : "s"}${conversation!.fallback_turns ? `, ${conversation!.fallback_turns} scripted` : ""}), then checked and submitted by the patient.` }
      : { kind: "form", text: "Filled in by the patient on the assessment form." },
    headline,
    safety: { level: assessment.red_flag_level, ticked: flags, crossChecks: crossChecks(assessment, conversation), chatAlert: conversation?.safety_alert ?? null },
    narrative,
    facts,
    mentions,
    changes: hasChat ? changesOf(assessment, conversation!) : null,
    asks,
    checks,
    footer: BRIEF_FOOTER,
  };
}

/** The brief as plain text, to paste into the clinical notes. */
export function briefToText(brief: Brief, who: { reference_code: string; submitted_at?: string }): string {
  const lines: string[] = [];
  lines.push(`HISTORY BRIEF · ${who.reference_code}${who.submitted_at ? ` · submitted ${who.submitted_at}` : ""}`);
  lines.push(brief.headline);
  lines.push(brief.source.text);
  lines.push("");
  lines.push("SAFETY");
  if (brief.safety.ticked.length) {
    lines.push(`Red-flag screening (${brief.safety.level}):`);
    brief.safety.ticked.forEach((f) => lines.push(`- ${f.label} [${f.level}]`));
  } else lines.push("Red-flag screening: nothing ticked.");
  if (brief.safety.chatAlert) lines.push(`The AI conversation stopped on a safety alert: ${brief.safety.chatAlert}.`);
  brief.safety.crossChecks.forEach((c) => lines.push(`- Worth confirming: wording in ${c.where} (${c.quote}) matches a ${c.kind.replace(/-/g, " ")} alert.`));
  lines.push("");
  lines.push("STORY");
  brief.narrative.forEach((s) => lines.push(s));
  if (brief.mentions.length) {
    lines.push("");
    lines.push(`MENTIONED: ${brief.mentions.map((m) => m.label).join(", ")}`);
  }
  if (brief.changes && brief.changes.length) {
    lines.push("");
    lines.push("CHANGED BY THE PATIENT AFTER THE CHAT");
    brief.changes.forEach((c) => lines.push(`- ${c.label}: chat "${c.chat}" -> form "${c.form}"`));
  }
  if (brief.checks.length) {
    lines.push("");
    lines.push("CHECK");
    brief.checks.forEach((c) => lines.push(`- ${c}`));
  }
  if (brief.asks.length) {
    lines.push("");
    lines.push("WORTH ASKING AT THE FIRST VISIT");
    brief.asks.forEach((a) => lines.push(`- ${a.text} (${a.because})`));
  }
  lines.push("");
  lines.push(brief.footer);
  return lines.join("\n");
}
