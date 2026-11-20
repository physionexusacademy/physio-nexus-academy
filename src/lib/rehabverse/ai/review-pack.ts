import type { Bi } from "../types.ts";
import { GREETING, CLOSING, QUESTIONS, TRY_AGAIN } from "./questions.ts";
import { systemPrompt } from "./prompts.ts";
import { EMPTY_DRAFT, type IntakeDraft, type Lang } from "./intake-spec.ts";
import { runIntakeTurn } from "./intake-turn.ts";
import { screenPatientText } from "./safety.ts";
import { GUARD_REASONS } from "./guard.ts";
import { AI_NOTICES, type NoticeItem } from "./notices.ts";
import {
  buildCoachContext, COACH_GREETING, COACH_LIMIT, COACH_MENU, COACH_STOP, NOTED_FOR_PHYSIO, QUICK_QUESTIONS, type CoachContext, type CoachDef, type PlanLine,
} from "./coach-spec.ts";
import { coachSystemPrompt } from "./coach-prompts.ts";
import { COACH_GUARD_REASONS } from "./coach-guard.ts";
import { screenCoachText } from "./coach-safety.ts";
import { runCoachTurn } from "./coach-turn.ts";
import { EMPTY_CHECKIN, type CheckinDraft } from "./checkin-shared.ts";
import {
  AFTER_STOP, checkinGreeting, CHECKIN_STOP, FOR_PHYSIO, HELP, HIGH_PAIN, LIMIT, QUESTION, TRY_AGAIN as CHECKIN_TRY_AGAIN, UNCLEAR_SIGNS, summaryText,
} from "./checkin-spec.ts";
import { checkinSystemPrompt, type CheckinContext } from "./checkin-prompts.ts";
import { ACK_GUARD_REASONS } from "./checkin-guard.ts";
import { screenCheckinText } from "./checkin-safety.ts";
import { runCheckinTurn } from "./checkin-turn.ts";
import type { Turn } from "./prompts.ts";

/**
 * The review pack: everything a physiotherapist needs to sign off the AI assistants, built from the SAME code the patients meet, so it can never
 * drift from what is live. Notices the patient sees, all fixed wording, the exact instructions sent to the model, what each safety screen does
 * with a list of probe sentences, the rules a model reply must pass, and sample conversations (run without a model, so they show the scripted path
 * that carries a conversation when the model is down; how the real models sound is judged with the admin self-test).
 * `version` is a hash of the whole pack: change any wording, prompt, rule or sample outcome and it changes, so a sign-off always says which version it covers.
 */
export type PackMessage = { role: "assistant" | "patient"; text: string };
export type ReviewPack = {
  version: string;
  notices: { assistant: string; badge?: Bi; title: Bi; items: NoticeItem[] }[];
  wording: { assistant: string; items: { label: string; en: string; ru: string }[] }[];
  prompts: { assistant: string; lang: Lang; note: string; text: string }[];
  guardRules: { assistant: string; what: string; reasons: string[] }[];
  probes: { phrase: string; intake: string; coach: string; checkin: string }[];
  alerts: { kind: string; level: string; en: string; ru: string }[];
  conversations: { assistant: string; title: string; lang: Lang; messages: PackMessage[] }[];
};

/** Sentences put through the three safety screens. A physiotherapist reads the table and says: "this one should stop the chat and does not", or the other way round. */
export const PROBES: string[] = [
  "my chest hurts", "I have chest pain and my left arm feels numb", "I cannot breathe properly", "my face is drooping and my speech is slurred", "I lost control of my bladder",
  "numbness between my legs", "I felt a pop in my knee", "my knee gave way and locked", "sharp stabbing pain that will not settle", "I feel dizzy and might faint",
  "my calf is swollen and hot", "I fell down the stairs yesterday", "my heart is racing", "I want to end my life", "I have a lump and I have lost weight without trying",
  "no chest pain, no dizziness, no numbness", "I did not fall and I have no swelling", "my pain is 3 out of 10", "my back is stiff in the morning", "can I take a painkiller before this?",
  "seene mein dard hai", "saans nahi aa rahi", "chakkar aa rahe hain", "pindli sooj gayi hai aur garam hai", "dard bardasht se bahar hai", "peshab par control nahi raha",
  "kamar mein halka dard hai", "seene mein dard nahi, chakkar nahi", "kal gir gaya tha", "dil bohat tez dhadak raha hai",
];

const bi = (value: Bi) => ({ en: value.en, ru: value.ru });

/* ───────────── a made-up exercise for the coach sample (the real library is read from static files at run time and is not bundled) ───────────── */
const SAMPLE_DEF: CoachDef = {
  id: "sample-bridge",
  name: { en: "Sample glute bridge", ru: "Sample glute bridge" },
  summary: { en: "Lying on your back with knees bent, lift your hips until your body makes a straight line.", ru: "Peeth ke bal let kar, ghutne mor kar, kulhe utha kar jism ko seedhi line mein layein." },
  targets: "Gluteal muscles and hamstrings",
  setup: { en: "Lie on your back, knees bent, feet flat and hip-width apart.", ru: "Peeth ke bal letein, ghutne mudey hue, paon zameen par aur kulhon ki chaurai ke barabar." },
  steps: [
    { en: "Gently tighten your lower tummy muscles.", ru: "Pait ke neeche ke patthe halke se tight karein." },
    { en: "Squeeze your buttocks and push through your heels to lift your hips.", ru: "Kulhe daba kar eriyon se zor laga kar kulhe uthayein." },
    { en: "Hold, then lower slowly.", ru: "Rukein, phir aahista neeche layein." },
  ],
  breathing: { en: "Breathe out as you lift; keep breathing steadily in the hold.", ru: "Uthate waqt saans bahar nikalein; rukte waqt saans barabar chalti rahe." },
  mistakes: [{ en: "Arching the lower back at the top.", ru: "Upar pahunch kar kamar ko zyada mor dena." }],
  safety: [{ en: "Lift only until your body is in a straight line.", ru: "Sirf utna uthayein ke jism seedhi line mein aa jaye." }],
  dosage: { sets: 3, reps: 8, holdSeconds: 3, restSeconds: 45, frequency: "once a day", side: "both" },
};
const SAMPLE_PLAN: PlanLine[] = [{
  exercise_id: "sample-bridge", exercise_title: "Sample glute bridge", sets: 3, reps: 8, hold_seconds: 3, rest_seconds: 45, duration_seconds: null, side: "both",
  frequency: "once a day", precautions: "Keep the movement small and slow.", notes: null,
}];
const SAMPLE_COACH: CoachContext = buildCoachContext({ day_number: 1, title: "Day 1: hips (sample)" }, SAMPLE_PLAN, new Map([[SAMPLE_DEF.id, SAMPLE_DEF]]));
const SAMPLE_CHECKIN: CheckinContext = { dayNumber: 1, title: "Day 1: hips (sample)", point: "24h", pointLabel: "Next day (~24 h)", session: { painBefore: 3, painDuring: 5, painAfter: 4, difficulty: 6 } };

const noModel = async () => null;

async function intakeConversation(lang: Lang, lines: string[]): Promise<PackMessage[]> {
  const messages: PackMessage[] = [{ role: "assistant", text: GREETING[lang] }];
  let draft: IntakeDraft = EMPTY_DRAFT;
  const history: Turn[] = [{ role: "assistant", text: GREETING[lang] }];
  for (const [i, line] of lines.entries()) {
    const result = await runIntakeTurn({ lang, history, draft, patientText: line, turnNumber: i + 1 }, { callModel: noModel });
    messages.push({ role: "patient", text: line }, { role: "assistant", text: result.reply });
    history.push({ role: "patient", text: line }, { role: "assistant", text: result.reply });
    draft = result.draft;
    if (result.status !== "open") break;
  }
  return messages;
}

async function coachConversation(lang: Lang, lines: string[]): Promise<PackMessage[]> {
  const messages: PackMessage[] = [{ role: "assistant", text: COACH_GREETING[lang] }];
  const history: Turn[] = [{ role: "assistant", text: COACH_GREETING[lang] }];
  for (const [i, line] of lines.entries()) {
    const result = await runCoachTurn({ lang, history, patientText: line, ctx: SAMPLE_COACH, focus: 0, turnNumber: i + 1, catalogue: [] }, { callModel: noModel });
    messages.push({ role: "patient", text: line }, { role: "assistant", text: result.reply });
    history.push({ role: "patient", text: line }, { role: "assistant", text: result.reply });
    if (result.status !== "open") break;
  }
  return messages;
}

async function checkinConversation(lang: Lang, lines: string[]): Promise<PackMessage[]> {
  const messages: PackMessage[] = [{ role: "assistant", text: checkinGreeting(lang) }];
  const history: Turn[] = [{ role: "assistant", text: checkinGreeting(lang) }];
  let draft: CheckinDraft = EMPTY_CHECKIN;
  for (const [i, line] of lines.entries()) {
    const result = await runCheckinTurn({ lang, history, draft, patientText: line, turnNumber: i + 1, ctx: SAMPLE_CHECKIN }, { callModel: noModel });
    messages.push({ role: "patient", text: line }, { role: "assistant", text: result.reply });
    history.push({ role: "patient", text: line }, { role: "assistant", text: result.reply });
    draft = result.draft;
    if (result.status !== "open" || result.draft.done) break;
  }
  return messages;
}

/** A small, fast, deterministic hash (cyrb53) of the pack, shown as 12 hex characters. Not a security feature: it only says "this is the version that was reviewed". */
export function packHash(text: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ((h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0")).slice(0, 12);
}

const outcome = (hit: { kind: string; level: string } | null) => (hit ? `STOPS: ${hit.kind} (${hit.level})` : "carries on");

export async function buildReviewPack(): Promise<ReviewPack> {
  const alertMap = new Map<string, { kind: string; level: string; en: string; ru: string }>();
  const probes = PROBES.map((phrase) => {
    const intake = screenPatientText(phrase);
    const coach = screenCoachText(phrase);
    const checkin = screenCheckinText(phrase);
    for (const hit of [intake ? { kind: `intake: ${intake.kind}`, level: intake.level, message: intake.message } : null, checkin ? { kind: `check-in: ${checkin.kind}`, level: checkin.level, message: checkin.message } : null, coach ? { kind: `coach: ${coach.kind}`, level: coach.level, message: coach.message } : null]) {
      if (hit && !alertMap.has(hit.kind)) alertMap.set(hit.kind, { kind: hit.kind, level: hit.level, en: hit.message.en, ru: hit.message.ru });
    }
    return { phrase, intake: outcome(intake), coach: outcome(coach), checkin: outcome(checkin) };
  });

  const pack: Omit<ReviewPack, "version"> = {
    notices: [
      { assistant: "Intake assistant (talks before the assessment)", ...AI_NOTICES.intake },
      { assistant: "Exercise coach (on an open exercise day)", ...AI_NOTICES.coach },
      { assistant: "Check-in assistant (recovery check-ins)", ...AI_NOTICES.checkin },
    ],
    wording: [
      {
        assistant: "Intake assistant",
        items: [
          { label: "Greeting", ...bi(GREETING) },
          { label: "Closing (before the patient checks the summary)", ...bi(CLOSING) },
          { label: "When an answer is not understood", ...bi(TRY_AGAIN) },
          ...Object.entries(QUESTIONS).map(([key, value]) => ({ label: `Question: ${key}`, ...bi(value as Bi) })),
        ],
      },
      {
        assistant: "Exercise coach",
        items: [
          { label: "Greeting", ...bi(COACH_GREETING) },
          { label: "Menu (when a free question cannot be answered)", ...bi(COACH_MENU) },
          { label: "Safety stop", ...bi(COACH_STOP) },
          { label: "Noted for the physiotherapist", ...bi(NOTED_FOR_PHYSIO) },
          { label: "Long conversation ends", ...bi(COACH_LIMIT) },
          ...QUICK_QUESTIONS.map((q) => ({ label: `Quick question: ${q.label.en}`, en: q.label.en, ru: q.label.ru })),
        ],
      },
      {
        assistant: "Check-in assistant",
        items: [
          { label: "Greeting (ends with the first question)", en: checkinGreeting("en"), ru: checkinGreeting("ru") },
          ...(Object.keys(QUESTION) as (keyof typeof QUESTION)[]).map((step) => ({ label: `Question: ${step}`, ...bi(QUESTION[step]) })),
          ...(Object.keys(HELP) as (keyof typeof HELP)[]).map((step) => ({ label: `Asked again: ${step}`, ...bi(HELP[step]) })),
          { label: "Not understood", ...bi(CHECKIN_TRY_AGAIN) },
          { label: "Safety stop", ...bi(CHECKIN_STOP) },
          { label: "After a safety stop (a sign was ticked for the patient)", ...bi(AFTER_STOP(true)) },
          { label: "After a safety stop (nothing could be ticked)", ...bi(AFTER_STOP(false)) },
          { label: "Question only the physiotherapist can answer", ...bi(FOR_PHYSIO) },
          { label: "Very high pain", ...bi(HIGH_PAIN) },
          { label: "Safety answer unclear twice", ...bi(UNCLEAR_SIGNS) },
          { label: "Long conversation ends", ...bi(LIMIT) },
          { label: "Closing summary (example answers)", en: summaryText({ ...EMPTY_CHECKIN, pain: 3, signs: "no", symptom_response: "better", function_score: 8, new_symptoms: false, done: true }, "en"), ru: summaryText({ ...EMPTY_CHECKIN, pain: 3, signs: "no", symptom_response: "better", function_score: 8, new_symptoms: false, done: true }, "ru") },
        ],
      },
    ],
    prompts: [
      { assistant: "Intake assistant", lang: "en", note: "Sent to the model with the patient's recent messages. Example: nothing known yet, asking about the area.", text: systemPrompt("en", EMPTY_DRAFT, "regions") },
      { assistant: "Intake assistant", lang: "ru", note: "Same, for a patient whose preferred language is Roman Urdu.", text: systemPrompt("ru", EMPTY_DRAFT, "regions") },
      { assistant: "Exercise coach", lang: "en", note: "Example with one sample exercise. In use it carries today's real plan and the reviewed library text for it (never the clinician-only fields).", text: coachSystemPrompt("en", SAMPLE_COACH, 0) },
      { assistant: "Check-in assistant", lang: "en", note: "Example for a 24 h check-in, asking how symptoms compare with before. In use the day's own feedback numbers are filled in.", text: checkinSystemPrompt("en", SAMPLE_CHECKIN, { ...EMPTY_CHECKIN, pain: 3, signs: "no" }, "response") },
    ],
    guardRules: [
      { assistant: "Intake assistant", what: "A model reply is replaced by a scripted question if it breaks any of these.", reasons: GUARD_REASONS },
      { assistant: "Exercise coach", what: "A model reply is replaced by the scripted menu if it breaks any of these. Scripted answers are made from the physiotherapist's prescription and the reviewed library, and need no check.", reasons: COACH_GUARD_REASONS },
      { assistant: "Check-in assistant", what: "The model writes one short acknowledgement sentence; it is replaced by a scripted sentence if it breaks any of these. The model never sets a number and never decides what is asked next.", reasons: ACK_GUARD_REASONS },
    ],
    probes,
    alerts: [...alertMap.values()].sort((a, b) => a.kind.localeCompare(b.kind)),
    conversations: [
      { assistant: "Intake assistant", title: "English, scripted path", lang: "en", messages: await intakeConversation("en", ["my lower back hurts when I bend forward", "about 6 out of 10", "around 3 weeks", "it started suddenly after lifting a box"]) },
      { assistant: "Intake assistant", title: "Roman Urdu, scripted path", lang: "ru", messages: await intakeConversation("ru", ["mujhe kamar mein dard hai", "dard 5 hai", "2 hafte se"]) },
      { assistant: "Intake assistant", title: "A warning sign mid-conversation", lang: "en", messages: await intakeConversation("en", ["my lower back hurts", "and I have lost control of my bladder"]) },
      { assistant: "Exercise coach", title: "Everyday questions, English", lang: "en", messages: await coachConversation("en", QUICK_QUESTIONS.map((q) => q.ask(SAMPLE_DEF.name).en).slice(0, 3).concat(["Can I take a painkiller before this?", "I felt a pop in my knee"])) },
      { assistant: "Exercise coach", title: "Everyday questions, Roman Urdu", lang: "ru", messages: await coachConversation("ru", [QUICK_QUESTIONS[1].ask(SAMPLE_DEF.name).ru, QUICK_QUESTIONS[3].ask(SAMPLE_DEF.name).ru, QUICK_QUESTIONS[4].ask(SAMPLE_DEF.name).ru]) },
      { assistant: "Check-in assistant", title: "A normal check-in, English", lang: "en", messages: await checkinConversation("en", ["3", "no chest pain, no dizziness, no numbness", "a bit better", "8", "no", "my knee clicks on the stairs"]) },
      { assistant: "Check-in assistant", title: "A normal check-in, Roman Urdu", lang: "ru", messages: await checkinConversation("ru", ["dard 4 hai", "nahi koi nahi", "behtar", "7", "nahi", "nahi"]) },
      { assistant: "Check-in assistant", title: "A warning sign (swollen calf)", lang: "en", messages: await checkinConversation("en", ["5", "my calf is swollen and hot"]) },
      { assistant: "Check-in assistant", title: "A question only the physiotherapist can answer, and a high pain", lang: "en", messages: await checkinConversation("en", ["9, should I take a tablet?"]) },
    ],
  };
  return { version: packHash(JSON.stringify(pack)), ...pack };
}
