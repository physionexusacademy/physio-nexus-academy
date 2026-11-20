"use server";

import { aiAssistAllowed } from "@/lib/rehabverse/ai-access";
import { getOverview } from "@/lib/rehabverse/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { callChat } from "@/lib/rehabverse/ai/model";
import { runIntakeTurn } from "@/lib/rehabverse/ai/intake-turn";
import { applyUpdates, EMPTY_DRAFT, MAX_PATIENT_MESSAGE, progress, type IntakeDraft, type Lang } from "@/lib/rehabverse/ai/intake-spec";
import { GREETING } from "@/lib/rehabverse/ai/questions";

/**
 * The intake assistant's server side. Every call, in this order: (1) the AI switch is checked on the server (global kill switch and this
 * patient's own switch, which only the admin can turn on), (2) the patient is taken from the signed-in session, never from the request,
 * (3) the conversation must belong to that patient. Conversations are written with the service role, and only through database functions
 * that re-check the switch, so a transcript cannot be forged from the browser.
 */
export type ChatMessageOut = { role: "assistant" | "patient"; text: string };
export type ChatResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: "ai_off" | "rate_limited" | "bad_request" | "failed" };

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
