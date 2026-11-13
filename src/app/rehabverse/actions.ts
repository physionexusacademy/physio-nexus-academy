"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isPublicFormRateLimited } from "@/lib/security/public-form-protection";
import { RehabError, isStaff, rpc } from "@/lib/rehabverse/api";
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
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { rehabverse_profile: profile } } });
  if (error) return { ok: false, error: /registered|exists/i.test(error.message) ? "email_taken" : "signup_failed" };
  // Email confirmation on: there is no session yet; the profile is created at first sign-in.
  if (!data.session) return { ok: true, needsEmailConfirmation: true };
  try {
    await rpc("rehab_register_patient", { p_payload: { ...profile, consent_version: "v1" } });
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
  if (error || !data.user) return { ok: false, error: "bad_login" };
  if (await isStaff()) return { ok: true, staff: true };
  // First sign-in after email confirmation: create the patient record from the sign-up form.
  try {
    const overview = await rpc<{ patient: unknown }>("rehab_my_overview");
    if (!overview.patient) {
      const profile = (data.user.user_metadata?.rehabverse_profile ?? null) as SignedProfile | null;
      if (profile?.consent && profile.full_name) {
        await rpc("rehab_register_patient", { p_payload: { ...profile, consent_version: "v1" } });
      }
    }
  } catch (e) {
    return fail(e);
  }
  return { ok: true, staff: false };
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
      void alertClinic(
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
      void alertClinic(
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
      void alertClinic("RehabVerse: patient reported a safety symptom — urgent", "A patient reported a concerning symptom at a recovery check-in. Open the admin dashboard (RehabVerse) to review.");
    }
    return { ok: true, flagLevel: r.flag_level ?? "none" };
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
