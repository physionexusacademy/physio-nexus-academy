"use server";

import { aiAssistAllowed } from "@/lib/rehabverse/ai-access";
import { getOverview, getSession } from "@/lib/rehabverse/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { callChat } from "@/lib/rehabverse/ai/model";
import { runIntakeTurn } from "@/lib/rehabverse/ai/intake-turn";
import { applyUpdates, EMPTY_DRAFT, MAX_PATIENT_MESSAGE, progress, type IntakeDraft, type Lang } from "@/lib/rehabverse/ai/intake-spec";
import { GREETING } from "@/lib/rehabverse/ai/questions";
import { buildCoachContext, COACH_GREETING, MAX_COACH_MESSAGE, type CoachContext, type CoachDef, type PlanLine } from "@/lib/rehabverse/ai/coach-spec";
import { runCoachTurn } from "@/lib/rehabverse/ai/coach-turn";
import { coachLibrary } from "@/lib/rehabverse/ai/library-server";
import type { Bi } from "@/lib/rehabverse/types";

/**
 * The intake assistant's server side. Every call, in this order: (1) the AI switch is checked on the server (global kill switch and this
 * patient's own switch, which only the admin can turn on), (2) the patient is taken from the signed-in session, never from the request,
 * (3) the conversation must belong to that patient. Conversations are written with the service role, and only through database functions
 * that re-check the switch, so a transcript cannot be forged from the browser.
 */
export type ChatMessageOut = { role: "assistant" | "patient"; text: string };
export type ChatResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: "ai_off" | "rate_limited" | "bad_request" | "held" | "failed" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const windows = new Map<string, { startedAt: number; count: number }>();
const limited = (patientId: string) => {
  const now = Date.now();
  const current = windows.get(patientId);
  if (!current || now - current.startedAt > 60_000) { windows.set(patientId, { startedAt: now, count: 1 }); return false; }
  current.count += 1;
  return current.count > 14;
};

async function patientContext(): Promise<{ patientId: string; preferred: Lang } | null> {
  if (!(await aiAssistAllowed())) return null;
  const overview = await getOverview();
  const patient = overview.patient;
  return patient ? { patientId: patient.id, preferred: patient.preferred_language === "en" ? "en" : "ru" } : null;
}

const asMessages = (value: unknown): ChatMessageOut[] =>
  (Array.isArray(value) ? value : [])
    .map((item) => item as { role?: string; text?: unknown })
    .filter((item) => (item.role === "assistant" || item.role === "patient") && typeof item.text === "string")
    .map((item) => ({ role: item.role as "assistant" | "patient", text: item.text as string }));

type OpenedConversation = { id: string; status: string; language: Lang; messages: unknown; draft: unknown; turns: number };

/** Opens (or resumes) the patient's intake conversation after they have accepted the AI notice. */
export async function startIntakeChatAction(input: { lang: Lang; accepted: boolean }): Promise<ChatResult<{ conversationId: string; messages: ChatMessageOut[]; draft: IntakeDraft; progress: { done: number; total: number }; language: Lang }>> {
  try {
    if (!input.accepted) return { ok: false, error: "bad_request" };
    const context = await patientContext();
    if (!context) return { ok: false, error: "ai_off" };
    const lang: Lang = input.lang === "en" ? "en" : "ru";
    const { data, error } = await createAdminClient().rpc("rehab_ai_open_conversation", {
      p_patient_id: context.patientId, p_kind: "intake", p_language: lang, p_consent_version: "ai-v1", p_greeting: GREETING[lang],
    });
    if (error) return { ok: false, error: /not enabled/i.test(error.message) ? "ai_off" : /too many/i.test(error.message) ? "rate_limited" : "failed" };
    const conversation = data as OpenedConversation;
    const draft = applyUpdates(EMPTY_DRAFT, conversation.draft).draft;
    return { ok: true, conversationId: conversation.id, messages: asMessages(conversation.messages), draft, progress: progress(draft), language: conversation.language };
  } catch (error) {
    console.error("REHAB_AI_START", error instanceof Error ? error.message : String(error));
    return { ok: false, error: "failed" };
  }
}

/** One patient message in, one reply out (and the form filled so far). */
export async function intakeChatTurnAction(input: { conversationId: string; text: string }): Promise<
  ChatResult<{ reply: string; draft: IntakeDraft; ready: boolean; status: "open" | "completed" | "safety_stop"; safety: { kind: string; flags: string[] } | null; progress: { done: number; total: number } }>
> {
  try {
    const text = typeof input.text === "string" ? input.text.trim() : "";
    if (!UUID.test(input.conversationId) || text.length < 1 || text.length > MAX_PATIENT_MESSAGE) return { ok: false, error: "bad_request" };
    const context = await patientContext();
    if (!context) return { ok: false, error: "ai_off" };
    if (limited(context.patientId)) return { ok: false, error: "rate_limited" };

    const db = createAdminClient();
    const { data } = await db.rpc("rehab_ai_get_conversation", { p_patient_id: context.patientId, p_conversation_id: input.conversationId });
    const conversation = data as OpenedConversation | null;
    if (!conversation || conversation.status !== "open") return { ok: false, error: "bad_request" };

    const lang: Lang = conversation.language === "en" ? "en" : "ru";
    const draft = applyUpdates(EMPTY_DRAFT, conversation.draft).draft;
    const result = await runIntakeTurn(
      { lang, history: asMessages(conversation.messages), draft, patientText: text, turnNumber: Number(conversation.turns ?? 0) + 1 },
      { callModel: (messages) => callChat(messages) },
    );
    const { error } = await db.rpc("rehab_ai_append_turn", {
      p_patient_id: context.patientId, p_conversation_id: input.conversationId, p_patient_text: text, p_assistant_text: result.reply,
      p_draft: result.draft, p_model: result.model, p_fallback: result.fallback, p_status: result.status, p_safety: result.safety?.kind ?? null,
    });
    if (error) return { ok: false, error: /not enabled/i.test(error.message) ? "ai_off" : "failed" };
    return {
      ok: true, reply: result.reply, draft: result.draft, ready: result.ready, status: result.status,
      safety: result.safety ? { kind: result.safety.kind, flags: result.safety.suggestedFlags } : null, progress: progress(result.draft),
    };
  } catch (error) {
    console.error("REHAB_AI_TURN", error instanceof Error ? error.message : String(error));
    return { ok: false, error: "failed" };
  }
}

/** The patient moved on to the form (or finished reviewing): close the conversation record. */
export async function closeIntakeChatAction(conversationId: string, status: "completed" | "abandoned"): Promise<void> {
  try {
    if (!UUID.test(conversationId)) return;
    const context = await patientContext();
    if (!context) return;
    await createAdminClient().rpc("rehab_ai_close_conversation", { p_patient_id: context.patientId, p_conversation_id: conversationId, p_status: status });
  } catch {
    /* closing is best effort: the record itself is already saved turn by turn */
  }
}


/* ───────────────────────── the exercise coach (Phase D) ───────────────────────── */

/** Today's prescription for a day that is open to the signed-in patient (the database only returns the patient's own days), with the library text for it. */
async function openDay(sessionId: string): Promise<{ ctx: CoachContext; catalogue: Bi[]; dayNumber: number } | null> {
  if (!UUID.test(sessionId)) return null;
  let data;
  try {
    data = await getSession(sessionId);
  } catch {
    return null;
  }
  if (data.access !== "open" || !data.exercises.length) return null;
  let defs = new Map<string, CoachDef>();
  let catalogue: Bi[] = [];
  try {
    ({ defs, catalogue } = await coachLibrary());
  } catch (error) {
    console.error("REHAB_COACH_LIBRARY", error instanceof Error ? error.message : String(error)); // the coach still works from the prescription alone
  }
  const plan: PlanLine[] = data.exercises.map((e) => ({
    exercise_id: e.exercise_id, exercise_title: e.exercise_title, sets: e.sets, reps: e.reps, hold_seconds: e.hold_seconds, rest_seconds: e.rest_seconds,
    duration_seconds: e.duration_seconds, side: e.side, frequency: e.frequency, precautions: e.precautions, notes: e.notes,
  }));
  return { ctx: buildCoachContext({ day_number: data.session.day_number, title: data.session.title }, plan, defs), catalogue, dayNumber: data.session.day_number };
}

type CoachDraft = { session_id?: string; day_number?: number } & Record<string, unknown>;

/** Opens (or resumes) the coach conversation for an open exercise day, after the patient has accepted the AI notice. */
export async function startCoachChatAction(input: { sessionId: string; lang: Lang; accepted: boolean }): Promise<ChatResult<{ conversationId: string; messages: ChatMessageOut[]; language: Lang; status: string }>> {
  try {
    if (!input.accepted) return { ok: false, error: "bad_request" };
    const context = await patientContext();
    if (!context) return { ok: false, error: "ai_off" };
    const day = await openDay(input.sessionId);
    if (!day) return { ok: false, error: "bad_request" };
    const db = createAdminClient();
    const held = await db.rpc("rehab_ai_coach_hold", { p_patient_id: context.patientId, p_session_id: input.sessionId });
    if (held.data === true) return { ok: false, error: "held" };
    const lang: Lang = input.lang === "en" ? "en" : "ru";
    const open = () => db.rpc("rehab_ai_open_conversation", { p_patient_id: context.patientId, p_kind: "coach", p_language: lang, p_consent_version: "ai-v1", p_greeting: COACH_GREETING[lang] });
    let { data, error } = await open();
    // an open coach conversation about another day is finished: each day gets its own record
    const other = (data as (OpenedConversation & { draft: CoachDraft }) | null)?.draft?.session_id;
    if (!error && other && other !== input.sessionId) {
      await db.rpc("rehab_ai_close_conversation", { p_patient_id: context.patientId, p_conversation_id: (data as OpenedConversation).id, p_status: "completed" });
      ({ data, error } = await open());
    }
    if (error) return { ok: false, error: /not enabled/i.test(error.message) ? "ai_off" : /too many/i.test(error.message) ? "rate_limited" : "failed" };
    const conversation = data as OpenedConversation;
    return { ok: true, conversationId: conversation.id, messages: asMessages(conversation.messages), language: conversation.language, status: conversation.status };
  } catch (error) {
    console.error("REHAB_COACH_START", error instanceof Error ? error.message : String(error));
    return { ok: false, error: "failed" };
  }
}

/** One patient message in, one reply out. The exercise the patient has open is passed as a position in today's list (checked against it). */
export async function coachChatTurnAction(input: { conversationId: string; sessionId: string; text: string; exerciseIndex: number | null }): Promise<
  ChatResult<{ reply: string; status: "open" | "completed" | "safety_stop"; safety: string | null; how: string; routed: boolean }>
> {
  try {
    const text = typeof input.text === "string" ? input.text.trim() : "";
    if (!UUID.test(input.conversationId) || !UUID.test(input.sessionId) || text.length < 1 || text.length > MAX_COACH_MESSAGE) return { ok: false, error: "bad_request" };
    const context = await patientContext();
    if (!context) return { ok: false, error: "ai_off" };
    if (limited(context.patientId)) return { ok: false, error: "rate_limited" };

    const day = await openDay(input.sessionId);
    if (!day) return { ok: false, error: "bad_request" };
    const db = createAdminClient();
    const { data } = await db.rpc("rehab_ai_get_conversation", { p_patient_id: context.patientId, p_conversation_id: input.conversationId });
    const conversation = data as (OpenedConversation & { draft: CoachDraft }) | null;
    if (!conversation || conversation.status !== "open") return { ok: false, error: "bad_request" };
    const owner = conversation.draft?.session_id;
    if (owner && owner !== input.sessionId) return { ok: false, error: "bad_request" };

    const focus = Number.isInteger(input.exerciseIndex) && (input.exerciseIndex as number) >= 0 && (input.exerciseIndex as number) < day.ctx.exercises.length ? (input.exerciseIndex as number) : null;
    const lang: Lang = conversation.language === "en" ? "en" : "ru";
    const result = await runCoachTurn(
      { lang, history: asMessages(conversation.messages), patientText: text, ctx: day.ctx, focus, turnNumber: Number(conversation.turns ?? 0) + 1, catalogue: day.catalogue },
      { callModel: (messages) => callChat(messages, { maxTokens: 420, temperature: 0.4 }) },
    );
    const draft: CoachDraft = { ...(conversation.draft ?? {}), session_id: input.sessionId, day_number: day.dayNumber };
    const { error } = await db.rpc("rehab_ai_append_turn", {
      p_patient_id: context.patientId, p_conversation_id: input.conversationId, p_patient_text: text, p_assistant_text: result.reply,
      p_draft: draft, p_model: result.model, p_fallback: result.fallback, p_status: result.status, p_safety: result.safety?.kind ?? null,
    });
    if (error) return { ok: false, error: /not enabled/i.test(error.message) ? "ai_off" : "failed" };
    if (result.notify) {
      // best effort: the turn itself is already saved
      const told = await db.rpc("rehab_ai_coach_notify", { p_patient_id: context.patientId, p_conversation_id: input.conversationId, p_kind: result.notify, p_alert: result.safety?.kind ?? result.intent ?? "question", p_excerpt: text });
      if (told.error) console.error("REHAB_COACH_NOTIFY", told.error.message);
    }
    return { ok: true, reply: result.reply, status: result.status, safety: result.safety?.kind ?? null, how: result.how, routed: result.notify !== null };
  } catch (error) {
    console.error("REHAB_COACH_TURN", error instanceof Error ? error.message : String(error));
    return { ok: false, error: "failed" };
  }
}

export async function closeCoachChatAction(conversationId: string): Promise<void> {
  await closeIntakeChatAction(conversationId, "completed");
}
