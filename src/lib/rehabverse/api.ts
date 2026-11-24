import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BoardRow } from "@/lib/board/rules";
import type {
  AdminFollowup, AdminOutcomes, AdminPatient, AdminPatientRow, AiPilot, History, Inbox, MyOutcomes, MyScreening, Notification, Overview, PatientFollowup, Registrations, SessionDetail, StudySettings,
} from "./api-types";

/**
 * Server-side access to RehabVerse data. Every read and write goes through a database function
 * that checks who is signed in (patient → own record only, staff → clinical access), so nothing
 * here can reach another patient's data even if a page has a bug.
 */
export class RehabError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/** "rehab: open_assessment_exists" → "open_assessment_exists"; anything else → "failed". */
function codeFrom(message: string | undefined) {
  const match = /rehab:\s*([a-z0-9_ ,.\-–']+)/i.exec(message ?? "");
  return match ? match[1].trim().slice(0, 80) : "failed";
}

export async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(name, args ?? {});
  if (error) throw new RehabError(codeFrom(error.message), error.message);
  return data as T;
}

/** The signed-in Supabase user, or null. */
export async function currentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function isStaff(): Promise<boolean> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}

// Patient
export const getOverview = () => rpc<Overview>("rehab_my_overview");
export const getSession = (id: string) => rpc<SessionDetail>("rehab_my_session", { p_session_id: id });
export const getHistory = () => rpc<History>("rehab_my_history");
export const getNotifications = () => rpc<Notification[]>("rehab_my_notifications");
export const getMyFollowup = () => rpc<PatientFollowup>("rehab_my_followup");
/** `markShown: false` only asks whether there is something to show (nothing is logged); true is for when it is actually drawn on the screen. */
export const getMyScreening = (markShown = true) => rpc<MyScreening>("rehab_my_screening", { p_mark_shown: markShown });

// Staff
export const getInbox = () => rpc<Inbox>("rehab_admin_inbox");
export const getFollowups = () => rpc<AdminFollowup[]>("rehab_admin_followups");
export const getPatients = () => rpc<AdminPatientRow[]>("rehab_admin_patients");
export const getPatient = (id: string) => rpc<AdminPatient>("rehab_admin_patient", { p_patient_id: id });
export const getAiPilot = () => rpc<AiPilot>("rehab_admin_ai_pilot");
export const getRegistrations = () => rpc<Registrations>("rehab_admin_registrations");
export const getStudySettings = () => rpc<StudySettings>("rehab_admin_study_settings");

export const getMyOutcomes = () => rpc<MyOutcomes>("rehab_my_outcomes");
export type AdminFormCheckSet = { id: string; spec_id: string; pass: 1 | 2; side: "left" | "right" | null; created_at: string; reps: number | null; partial: number | null; best_hold_ms: number | null; coverage: { fraction: number } | null; cues: Record<string, number> | null; duration_ms: number | null };
/** A patient's camera sets (numbers only), newest first. Staff only. */
export const getAdminFormCheckSets = (patientId: string) => rpc<AdminFormCheckSet[]>("rehab_admin_formcheck_patient_sets", { p_patient_id: patientId });
export const getAdminOutcomes = (patientId: string) => rpc<AdminOutcomes>("rehab_admin_outcomes", { p_patient_id: patientId });

export const getBoard = () => rpc<BoardRow[]>("rehab_admin_board");
