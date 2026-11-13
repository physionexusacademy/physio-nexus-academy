import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminPatient, AdminPatientRow, History, Inbox, Notification, Overview, SessionDetail,
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

// Staff
export const getInbox = () => rpc<Inbox>("rehab_admin_inbox");
export const getPatients = () => rpc<AdminPatientRow[]>("rehab_admin_patients");
export const getPatient = (id: string) => rpc<AdminPatient>("rehab_admin_patient", { p_patient_id: id });
