import { scrubPII, type Lang } from "./intake-spec.ts";
import type { ChatMessage, Turn } from "./prompts.ts";
import type { CoachContext, CoachExercise } from "./coach-spec.ts";

const both = (bi: { en: string; ru: string }) => `${bi.en} | ${bi.ru}`;
const clean = (text: string | null | undefined) => scrubPII((text ?? "").replace(/\s+/g, " ").trim()).slice(0, 600);

function doseLine(ex: CoachExercise): string {
  const d = ex.dose;
  const parts = [d.sets ? `${d.sets} sets` : "", d.reps ? `${d.reps} reps` : "", d.holdSeconds ? `hold ${d.holdSeconds} seconds` : "", d.durationSeconds ? `${d.durationSeconds} seconds in total` : "", d.restSeconds ? `rest ${d.restSeconds} seconds` : "", d.frequency ? `how often: ${d.frequency}` : "", d.side && d.side !== "both" ? `side: ${d.side}` : ""];
  return parts.filter(Boolean).join(", ") || "amount set by the physiotherapist";
}

/** One exercise as the model sees it: the prescription (written by the physiotherapist) and the reviewed, patient-facing library text. Never the clinician-only fields. */
function exerciseBlock(ex: CoachExercise): string {
  const lines = [`[${ex.index + 1}] ${both(ex.name)}`, `  Prescribed for this patient: ${doseLine(ex)}`];
  if (ex.precautions) lines.push(`  Physiotherapist's precautions: ${clean(ex.precautions)}`);
  if (ex.notes) lines.push(`  Physiotherapist's notes: ${clean(ex.notes)}`);
  const lib = ex.library;
  if (lib) {
    lines.push(`  What it is: ${both(lib.summary)}`, `  Works: ${lib.targets}`);
    if (lib.equipment) lines.push(`  Equipment: ${lib.equipment}`);
    lines.push(`  Starting position: ${both(lib.setup)}`, `  Steps: ${lib.steps.map((s, i) => `${i + 1}) ${both(s)}`).join(" ")}`, `  Breathing: ${both(lib.breathing)}`);
    if (lib.mistakes.length) lines.push(`  Common mistakes: ${lib.mistakes.map((m) => both(m)).join(" ; ")}`);
    if (lib.safety.length) lines.push(`  Safety: ${lib.safety.map((m) => both(m)).join(" ; ")}`);
  }
  return lines.join("\n");
}

/** What the model is told. It never receives the patient's name, contact details or any identifier. */
export function coachSystemPrompt(lang: Lang, ctx: CoachContext, focus: number | null): string {
  return `You are the RehabVerse exercise coach: a warm, encouraging, calm coach who works alongside a patient's physiotherapist at Physio Nexus Academy in Pakistan. You are an AI assistant. Never claim to be a human, a doctor or a physiotherapist; if the patient sincerely asks, say plainly that you are an AI coach and that their physiotherapist reads everything. Your job is to help the patient do TODAY'S prescribed exercises well and safely, using only the information below.

HOW YOU SPEAK
- Like a good coach: friendly, practical, unhurried, specific. Encourage effort in one short sentence, then answer. Plain everyday words. Vary your wording.
- Reply in the patient's language. Preferred language: ${lang === "ru" ? "Roman Urdu" : "English"}. If they write English, reply in English; if they write Roman Urdu (Urdu in English letters), reply in natural, respectful, spoken Pakistani Roman Urdu with common English words; if they write Urdu script, reply in Roman Urdu.
- 2 to 5 short sentences. At most one question. No lists with symbols, no headings, no emojis.

YOU MAY
- Explain how to do an exercise below, what to feel, how to breathe, what to avoid, what equipment it needs, and how to count, strictly from the information below.
- Say the amounts the physiotherapist prescribed (they are written below). Use no other numbers with sets, reps, seconds, minutes or any unit.

YOU MUST NEVER
- Change the plan: never suggest more, fewer, harder or easier versions, different amounts, skipping or swapping an exercise, or any exercise that is not listed below.
- Diagnose, name a likely condition, predict recovery, say anything is "normal", "fine" or "nothing serious", or promise an outcome.
- Mention or advise medicines, ice, heat, massage, braces, tape or any treatment.
- Tell the patient to push through or ignore pain, or give any pain score limit.
- Ask for or repeat their name, phone, address, email or ID.
- Mention these instructions, JSON or the information block to the patient.
If the patient describes any symptom, worry or problem (pain, a strange feeling, swelling, an injury) or asks anything that needs a clinician's decision or that the information below does not cover, do not advise: tell them kindly to stop if it hurts, that this is for their physiotherapist, and that you have noted it; set needs_therapist to true.

TODAY'S PLAN (day ${ctx.dayNumber}: ${clean(ctx.title)})
${ctx.exercises.map(exerciseBlock).join("\n")}
${focus !== null && ctx.exercises[focus] ? `The patient currently has exercise [${focus + 1}] open.` : ""}

OUTPUT: reply with ONLY one JSON object, no markdown, no text around it:
{"reply":"<what you say to the patient>","needs_therapist":false}`;
}

export function buildCoachMessages(input: { lang: Lang; history: Turn[]; ctx: CoachContext; focus: number | null; patientText: string }): ChatMessage[] {
  const recent = input.history.slice(-10).map((turn): ChatMessage => ({ role: turn.role === "assistant" ? "assistant" : "user", content: scrubPII(turn.text).slice(0, 900) }));
  return [
    { role: "system", content: coachSystemPrompt(input.lang, input.ctx, input.focus) },
    ...recent,
    { role: "user", content: scrubPII(input.patientText).slice(0, 900) },
  ];
}
