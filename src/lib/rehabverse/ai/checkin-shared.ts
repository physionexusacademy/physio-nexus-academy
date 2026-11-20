import type { FollowupPoint } from "../api-types.ts";
import { FEEDBACK_FLAGS } from "../intake.ts";

/**
 * The recovery check-in chat (Phase E): what a conversation records and the rules every part (the chat, the server and the admin screen)
 * shares. Light on purpose (no model, no wording), so the browser can import it. The chat only COLLECTS answers: the patient's own check-in
 * form is what is saved, after the patient has read it, so nothing the AI understood becomes a clinical record by itself.
 */
export type CheckinStep = "pain" | "signs" | "response" | "function" | "new_symptoms" | "note";
/** Asked in this order: the safety question comes second, so it is never at the end of a chat that stops early. */
export const STEP_ORDER: CheckinStep[] = ["pain", "signs", "response", "function", "new_symptoms", "note"];
export type CheckinResponse = "better" | "same" | "worse";

export type CheckinDraft = {
  pain: number | null;
  function_score: number | null;
  symptom_response: CheckinResponse | null;
  new_symptoms: boolean | null;
  /** "no": the patient said they had none of the warning signs. "reported": one was reported (the chat stopped). "unclear": the chat could not tell. */
  signs: "no" | "reported" | "unclear" | null;
  /** Warning signs (ids of the check-in form) the patient reported. They are ticked on the form for the patient to confirm. "None of these" is never ticked by the chat. */
  flags: string[];
  note: string;
  /** Steps the patient skipped or the chat could not understand after two tries: left for the form. */
  skipped: CheckinStep[];
  /** How many times a step was asked again, so the chat never loops. */
  tries: Partial<Record<CheckinStep, number>>;
  done: boolean;
};

export const EMPTY_CHECKIN: CheckinDraft = { pain: null, function_score: null, symptom_response: null, new_symptoms: null, signs: null, flags: [], note: "", skipped: [], tries: {}, done: false };

export const MAX_CHECKIN_MESSAGE = 500;
export const MAX_CHECKIN_TURNS = 24;
export const MAX_CHECKIN_NOTE = 580;
export const FLAG_IDS: string[] = FEEDBACK_FLAGS.map((flag) => flag.id);

export function isAnswered(draft: CheckinDraft, step: CheckinStep): boolean {
  if (draft.skipped.includes(step)) return true;
  switch (step) {
    case "pain": return draft.pain !== null;
    case "signs": return draft.signs !== null;
    case "response": return draft.symptom_response !== null;
    case "function": return draft.function_score !== null;
    case "new_symptoms": return draft.new_symptoms !== null;
    case "note": return draft.note !== "";
  }
}
export const nextStep = (draft: CheckinDraft): CheckinStep | null => STEP_ORDER.find((step) => !isAnswered(draft, step)) ?? null;
export const checkinProgress = (draft: CheckinDraft) => ({ done: STEP_ORDER.filter((step) => isAnswered(draft, step)).length, total: STEP_ORDER.length });

/** Reads a stored draft back into a clean CheckinDraft (the database holds whatever a past version wrote: nothing is trusted). */
export function readCheckinDraft(raw: unknown): CheckinDraft {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const scale = (value: unknown) => (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10 ? value : null);
  const response = source.symptom_response === "better" || source.symptom_response === "same" || source.symptom_response === "worse" ? source.symptom_response : null;
  const signs = source.signs === "no" || source.signs === "reported" || source.signs === "unclear" ? source.signs : null;
  const steps = (list: unknown) => (Array.isArray(list) ? list.filter((item): item is CheckinStep => typeof item === "string" && (STEP_ORDER as string[]).includes(item)) : []);
  const tries: Partial<Record<CheckinStep, number>> = {};
  if (source.tries && typeof source.tries === "object") for (const step of STEP_ORDER) { const n = (source.tries as Record<string, unknown>)[step]; if (typeof n === "number" && n > 0 && n < 10) tries[step] = Math.floor(n); }
  return {
    pain: scale(source.pain), function_score: scale(source.function_score), symptom_response: response,
    new_symptoms: typeof source.new_symptoms === "boolean" ? source.new_symptoms : null, signs,
    flags: [...new Set(Array.isArray(source.flags) ? source.flags.filter((id): id is string => typeof id === "string" && FLAG_IDS.includes(id)) : [])],
    note: typeof source.note === "string" ? source.note.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, MAX_CHECKIN_NOTE) : "",
    skipped: [...new Set(steps(source.skipped))], tries, done: source.done === true,
  };
}

/** The check-in windows (hours after the day's feedback): the same numbers as the database function rehab_submit_followup, which has the last word. */
export const CHECKIN_WINDOWS: Record<FollowupPoint, [number, number]> = { later_same_day: [2, 20], "24h": [18, 72], "48h": [40, 120] };

export type CheckinPending = { ok: true } | { ok: false; reason: "no_feedback" | "not_scheduled" | "recorded" | "too_early" | "closed" };
/** Can this check-in be answered right now? Used by the patient's page and, again, by the server before a chat is opened. */
export function checkinPending(
  data: { programme: { errp_schedule: FollowupPoint[] }; feedback: { submitted_at: string; completion: string } | null; followups: { timepoint: FollowupPoint }[] },
  point: FollowupPoint,
  now: number = Date.now(),
): CheckinPending {
  if (!data.feedback || data.feedback.completion === "none") return { ok: false, reason: "no_feedback" };
  if (!data.programme.errp_schedule.includes(point)) return { ok: false, reason: "not_scheduled" };
  if (data.followups.some((f) => f.timepoint === point)) return { ok: false, reason: "recorded" };
  const hours = (now - new Date(data.feedback.submitted_at).getTime()) / 3_600_000;
  const [from, to] = CHECKIN_WINDOWS[point];
  if (hours < from) return { ok: false, reason: "too_early" };
  if (hours > to) return { ok: false, reason: "closed" };
  return { ok: true };
}

/* ───────────────────────── for the physiotherapist: what changed between the chat and the saved form ───────────────────────── */

export type SavedCheckin = { pain: number | null; function_score: number | null; symptom_response: CheckinResponse | null; new_symptoms: boolean | null; flag_ids: string[] };
export type Difference = { field: string; chat: string; form: string };

/** Where the patient changed an answer on the form after the chat (nothing is listed when the form says what the chat understood). */
export function chatVersusForm(chat: CheckinDraft, saved: SavedCheckin): Difference[] {
  const out: Difference[] = [];
  const show = (value: unknown) => (value === null || value === undefined ? "not answered" : value === true ? "yes" : value === false ? "no" : String(value));
  if (chat.pain !== null && saved.pain !== chat.pain) out.push({ field: "Pain", chat: `${chat.pain}/10`, form: saved.pain === null ? "not answered" : `${saved.pain}/10` });
  if (chat.function_score !== null && saved.function_score !== chat.function_score) out.push({ field: "Daily activities", chat: `${chat.function_score}/10`, form: saved.function_score === null ? "not answered" : `${saved.function_score}/10` });
  if (chat.symptom_response !== null && saved.symptom_response !== chat.symptom_response) out.push({ field: "Symptoms compared with before", chat: chat.symptom_response, form: show(saved.symptom_response) });
  if (chat.new_symptoms !== null && saved.new_symptoms !== chat.new_symptoms) out.push({ field: "New symptoms", chat: show(chat.new_symptoms), form: show(saved.new_symptoms) });
  const missing = chat.flags.filter((id) => !saved.flag_ids.includes(id));
  if (missing.length) out.push({ field: "Warning signs reported in the chat but not on the form", chat: missing.join(", "), form: saved.flag_ids.length ? saved.flag_ids.join(", ") : "none ticked" });
  if (chat.signs === "no" && saved.flag_ids.length) out.push({ field: "Warning signs", chat: "none", form: saved.flag_ids.join(", ") });
  return out;
}
