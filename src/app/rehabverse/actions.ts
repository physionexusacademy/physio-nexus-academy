"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isPublicFormRateLimited } from "@/lib/security/public-form-protection";
import { RehabError, currentUser, getHistory, getNotifications, getOverview, getSession, isStaff, rpc } from "@/lib/rehabverse/api";
import type { FollowupPoint } from "@/lib/rehabverse/api-types";

const ADMIN_EMAIL = "physionexusacademypk@gmail.com";
const FROM_EMAIL = "Physio Nexus Academy <notifications@physionexusacademy.com>";

export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string; code?: string };

/** Alert the clinician by email. Never includes patient details: the dashboard has them behind a login. */
async function alertClinic(subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [ADMIN_EMAIL], subject, text }),
    });
  } catch (error) {
    console.error("RehabVerse alert email failed", error);
  }
}

/** Where e-mail links should send people back to (the site itself, never a value from the request body). */
async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return host ? `${h.get("x-forwarded-proto") ?? "https"}://${host}` : "https://physionexusacademy.com";
}

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function fail(error: unknown, fallback = "failed"): { ok: false; error: string; code: string } {
  if (error instanceof RehabError) return { ok: false, error: error.code, code: error.code };
  return { ok: false, error: fallback, code: fallback };
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

/* ─────────────────────────────── account ─────────────────────────────── */

export async function registerAction(form: FormData): Promise<ActionResult<{ needsEmailConfirmation: boolean }>> {
  if (text(form, "website")) return { ok: false, error: "failed" }; // honeypot
  if (isPublicFormRateLimited(`rv-register:${await clientIp()}`)) return { ok: false, error: "rate_limited" };

  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const profile = {
    full_name: text(form, "full_name"),
    age_years: Number(text(form, "age_years")),
    sex: text(form, "sex") || undefined,
    phone: text(form, "phone") || undefined,
    city: text(form, "city") || undefined,
    preferred_language: text(form, "preferred_language") === "en" ? "en" : "ru",
    consent: text(form, "consent") === "on",
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: "bad_email" };
  if (password.length < 10) return { ok: false, error: "weak_password" };
  if (profile.full_name.length < 2) return { ok: false, error: "bad_name" };
  if (!Number.isInteger(profile.age_years) || profile.age_years < 0 || profile.age_years > 120) return { ok: false, error: "bad_age" };
  if (profile.age_years < 18) return { ok: false, error: "under_18" };
  if (!profile.consent) return { ok: false, error: "consent_required" };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { rehabverse_profile: profile }, emailRedirectTo: `${origin}/rehabverse/auth/callback?next=/rehabverse/start` },
  });
  if (error) return { ok: false, error: /registered|exists/i.test(error.message) ? "email_taken" : /password/i.test(error.message) ? "weak_password" : "signup_failed" };
  // With e-mail confirmation on, signing up an address that already has an account returns a user with no identities.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return { ok: false, error: "email_taken" };
  // Email confirmation on: there is no session yet; the profile is created at first sign-in.
  if (!data.session) return { ok: true, needsEmailConfirmation: true };
  try {
    await rpc("rehab_register_patient", { p_payload: { ...profile, consent_version: "v2" } });
  } catch (e) {
    return fail(e);
  }
  return { ok: true, needsEmailConfirmation: false };
}

type SignedProfile = { full_name?: string; age_years?: number; sex?: string; phone?: string; city?: string; preferred_language?: string; consent?: boolean };

export async function loginAction(form: FormData): Promise<ActionResult<{ staff: boolean }>> {
  if (isPublicFormRateLimited(`rv-login:${await clientIp()}`)) return { ok: false, error: "rate_limited" };
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "bad_login" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, error: error?.code === "email_not_confirmed" || /not confirmed/i.test(error?.message ?? "") ? "email_not_confirmed" : "bad_login" };
  if (await isStaff()) return { ok: true, staff: true };
  // First sign-in after email confirmation: create the patient record from the sign-up form.
  try {
    const overview = await rpc<{ patient: unknown }>("rehab_my_overview");
    if (!overview.patient) {
      const profile = (data.user.user_metadata?.rehabverse_profile ?? null) as SignedProfile | null;
      if (profile?.consent && profile.full_name) {
        await rpc("rehab_register_patient", { p_payload: { ...profile, consent_version: "v2" } });
      }
    }
  } catch (e) {
    return fail(e);
  }
  return { ok: true, staff: false };
}

/** Same answer whether or not an account exists, so nobody can probe which e-mails are registered. */
export async function forgotPasswordAction(form: FormData): Promise<ActionResult> {
  if (text(form, "website")) return { ok: true };
  if (isPublicFormRateLimited(`rv-forgot:${await clientIp()}`)) return { ok: false, error: "rate_limited" };
  const email = text(form, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: "bad_email" };
  const supabase = await createClient();
  const origin = await siteOrigin();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/rehabverse/auth/callback?next=/rehabverse/reset` });
  return { ok: true };
}

export async function resendConfirmationAction(form: FormData): Promise<ActionResult> {
  if (isPublicFormRateLimited(`rv-resend:${await clientIp()}`)) return { ok: false, error: "rate_limited" };
  const email = text(form, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: "bad_email" };
  const supabase = await createClient();
  const origin = await siteOrigin();
  await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${origin}/rehabverse/auth/callback?next=/rehabverse/start` } });
  return { ok: true };
}

/** Used on the reset page, after the e-mailed link has signed the person in. */
export async function updatePasswordAction(form: FormData): Promise<ActionResult> {
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { ok: false, error: "weak_password" };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "link_expired" };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: /same|different/i.test(error.message) ? "same_password" : /password/i.test(error.message) ? "weak_password" : "failed" };
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function setLanguageAction(language: "en" | "ru"): Promise<ActionResult> {
  try {
    await rpc("rehab_set_language", { p_language: language });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ─────────────────────────────── intake ─────────────────────────────── */

export type IntakeInput = {
  client_token: string;
  regions: string[];
  symptoms: string[];
  pain_now: number;
  pain_worst?: number;
  pain_best?: number;
  duration?: string;
  onset?: string;
  possible_cause?: string;
  aggravating?: string;
  relieving?: string;
  functional_limitations?: string;
  previous_treatment?: string;
  medical_conditions?: string;
  medications?: string;
  other_symptoms?: string;
  own_words?: string;
  red_flags: string[];
};
export type IntakeResult = { id: string; status: string; red_flag_level: "none" | "urgent" | "emergency"; red_flag_ids: string[]; reference_code?: string; duplicate: boolean };

export async function submitAssessmentAction(input: IntakeInput): Promise<ActionResult<{ result: IntakeResult }>> {
  try {
    const result = await rpc<IntakeResult>("rehab_submit_assessment", { p_payload: input });
    if (!result.duplicate) {
      await alertClinic(
        result.red_flag_level === "none" ? "RehabVerse: new assessment to review" : "RehabVerse: assessment with red flags — urgent review",
        "A RehabVerse assessment is waiting in the admin dashboard (RehabVerse → Inbox). No patient details are sent by email.",
      );
    }
    return { ok: true, result };
  } catch (e) {
    return fail(e);
  }
}

/* ─────────────────────────────── daily feedback ─────────────────────────────── */

export type FeedbackInput = {
  completion: "all" | "partial" | "none";
  pain_before?: number;
  pain_during?: number;
  pain_after?: number;
  difficulty?: number;
  unusual_symptoms: boolean;
  unusual_text?: string;
  safety_flags: string[];
  notes?: string;
  exercises: { session_exercise_id: string; done: boolean; sets_done?: number; reps_done?: number; difficulty?: number; pain_during?: number; note?: string }[];
};

export async function submitFeedbackAction(sessionId: string, input: FeedbackInput): Promise<ActionResult<{ status: string; flagLevel: string; autoReleased: boolean; duplicate: boolean }>> {
  try {
    const r = await rpc<{ status: string; flag_level?: string; auto_released?: boolean; duplicate: boolean }>("rehab_submit_feedback", { p_session_id: sessionId, p_payload: input });
    if (!r.duplicate) {
      const concerning = !!r.flag_level && r.flag_level !== "none";
      await alertClinic(
        concerning ? "RehabVerse: patient reported a safety symptom — urgent" : "RehabVerse: daily feedback received",
        concerning
          ? "A patient reported a concerning symptom. Their programme is paused. Open the admin dashboard (RehabVerse) to review. No patient details are sent by email."
          : "Daily feedback is waiting for review in the admin dashboard (RehabVerse → Inbox). No patient details are sent by email.",
      );
    }
    return { ok: true, status: r.status, flagLevel: r.flag_level ?? "none", autoReleased: !!r.auto_released, duplicate: r.duplicate };
  } catch (e) {
    return fail(e);
  }
}

export type FollowupInput = { pain: number; function_score?: number; symptom_response: "better" | "same" | "worse"; new_symptoms: boolean; safety_flags: string[]; note?: string };

export async function submitFollowupAction(sessionId: string, timepoint: FollowupPoint, input: FollowupInput): Promise<ActionResult<{ flagLevel: string }>> {
  try {
    const r = await rpc<{ flag_level?: string; duplicate: boolean }>("rehab_submit_followup", { p_session_id: sessionId, p_timepoint: timepoint, p_payload: input });
    if (!r.duplicate && (r.flag_level ?? "none") !== "none") {
      await alertClinic("RehabVerse: patient reported a safety symptom — urgent", "A patient reported a concerning symptom at a recovery check-in. Open the admin dashboard (RehabVerse) to review.");
    }
    return { ok: true, flagLevel: r.flag_level ?? "none" };
  } catch (e) {
    return fail(e);
  }
}

/* ─────────────────────────────── your data ─────────────────────────────── */

/** Everything the signed-in patient can see about themselves, as one downloadable record. */
export async function exportMyDataAction(): Promise<ActionResult<{ filename: string; json: string }>> {
  try {
    const overview = await getOverview();
    if (!overview.patient) return { ok: false, error: "no_record" };
    const [history, notifications] = await Promise.all([overview.programme ? getHistory() : Promise.resolve(null), getNotifications()]);
    const days = await Promise.all((overview.sessions ?? []).filter((s) => s.status !== "locked").map((s) => getSession(s.id).catch(() => null)));
    const record = { exported_at: new Date().toISOString(), note: "Your RehabVerse record from Physio Nexus Academy.", patient: overview.patient, assessments: overview.assessments, programme: overview.programme, days: days.filter(Boolean), history, notifications };
    return { ok: true, filename: `rehabverse-${overview.patient.reference_code}.json`, json: JSON.stringify(record, null, 2) };
  } catch (e) {
    return fail(e);
  }
}

/** A deletion request goes to the clinic (reference code only, no details) so it can be handled with the right care. */
export async function requestDeletionAction(): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  if (isPublicFormRateLimited(`rv-delete:${user.id}`)) return { ok: false, error: "rate_limited" };
  try {
    const overview = await getOverview();
    if (!overview.patient) return { ok: false, error: "no_record" };
    await alertClinic("RehabVerse: a patient asked to delete their account", `A patient (reference ${overview.patient.reference_code}) asked to delete their RehabVerse account and records. Please review it in the admin dashboard and reply to them by email. No other details are sent by email.`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function markNotificationsReadAction(): Promise<ActionResult> {
  try {
    await rpc("rehab_mark_notifications_read");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Switches the follow-up reminder e-mails (a check-in is open, a day is waiting) on or off for the signed-in patient. */
export async function setFollowupRemindersAction(enabled: boolean): Promise<ActionResult<{ remindEmail: boolean }>> {
  try {
    const result = await rpc<{ remind_email: boolean }>("rehab_set_reminders", { p_enabled: enabled === true });
    return { ok: true, remindEmail: result.remind_email };
  } catch (e) {
    return fail(e);
  }
}
