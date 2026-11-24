"use server";

import { RehabError, rpc } from "@/lib/rehabverse/api";
import type { MemberDecision } from "@/lib/members/types";

/** Members access actions. The database functions refuse anyone who is not staff and re-check every rule (reasons for reject and suspend, no locking yourself out). */
export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };
const fail = (e: unknown): { ok: false; error: string } => ({ ok: false, error: e instanceof RehabError ? e.code : "failed" });

export async function decideMemberAction(userId: string, decision: MemberDecision, note?: string): Promise<Result<{ status: string; fullName: string; phone: string | null }>> {
  try {
    const r = await rpc<{ status: string; full_name: string; phone: string | null }>("site_admin_decide_member", { p_user_id: userId, p_decision: decision, p_note: (note ?? "").trim().slice(0, 500) || null });
    return { ok: true, status: r.status, fullName: r.full_name, phone: r.phone };
  } catch (e) { return fail(e); }
}

export async function setMembersOnlyAction(on: boolean): Promise<Result<{ membersOnly: boolean }>> {
  try {
    const r = await rpc<{ members_only: boolean }>("site_admin_set_access_mode", { p_on: on });
    return { ok: true, membersOnly: r.members_only };
  } catch (e) { return fail(e); }
}
