"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPublicFormRateLimited } from "@/lib/security/public-form-protection";
import { RehabError, currentUser, getHistory, getMyOutcomes, getMyScreening, getNotifications, getOverview, getSession, isStaff, rpc } from "@/lib/rehabverse/api";
import type { AccountStatus, FollowupPoint, MyScreening } from "@/lib/rehabverse/api-types";
import { buildSnapshot } from "@/lib/symptom/snapshot";
import { instrumentFor } from "@/lib/outcomes/instruments";
import { timepointsFor } from "@/lib/outcomes/plan";
import { scoreResponse } from "@/lib/outcomes/scoring";
import type { TimepointKey } from "@/lib/outcomes/types";

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

/**
 * A new account is a REQUEST the clinic approves (no confirmation e-mail is sent). The server creates the sign-in already confirmed, signs the person in,
 * and creates the patient record with status "pending"; every patient function of the database refuses a patient who is not "active", so until
 * the clinic approves there is nothing a pending account can do. The clinic is told by e-mail (no patient details in it) and sees the request,
 * with the phone number it checks, in "Account requests".
 */
export async function registerAction(form: FormData): Promise<ActionResult<{ pendingApproval: true }>> {
  if (text(form, "website")) return { ok: false, error: "failed" }; // honeypot
  if (isPublicFormRateLimited(`rv-register:${await clientIp()}`)) return { ok: false, error: "rate_limited" };

  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const profile = {
    full_name: text(form, "full_name"),
    age_years: Number(text(form, "age_years")),
    sex: text(form, "sex") || undefined,
    phone: text(form, "phone"),
    city: text(form, "city") || undefined,
    preferred_language: text(form, "preferred_language") === "en" ? "en" : "ru",
    consent: text(form, "consent") === "on",
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: "bad_email" };
  if (password.length < 10) return { ok: false, error: "weak_password" };
  if (profile.full_name.length < 2) return { ok: false, error: "bad_name" };
  if (!Number.isInteger(profile.age_years) || profile.age_years < 0 || profile.age_years > 120) return { ok: false, error: "bad_age" };
  if (profile.age_years < 18) return { ok: false, error: "under_18" };
  if (profile.phone.replace(/\D/g, "").length < 10 || profile.phone.length > 30) return { ok: false, error: "bad_phone" };
  if (!profile.consent) return { ok: false, error: "consent_required" };

  // The clinic checks who this is by phone, so the sign-in itself needs no e-mail round trip.
  const { error: createError } = await createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { rehabverse_profile: profile },
  });
  if (createError) return { ok: false, error: /registered|exists|duplicate/i.test(createError.message) ? "email_taken" : /password/i.test(createError.message) ? "weak_password" : "signup_failed" };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { ok: false, error: "signup_failed" };
  try {
    await rpc("rehab_register_patient", { p_payload: { ...profile, consent_version: "v2" } });
  } catch (e) {
    return fail(e);
  }
  await alertClinic("RehabVerse: new account request", "A new RehabVerse account is waiting for your approval. Open the clinician inbox > Account requests (patient details are shown only after you sign in).");
  return { ok: true, pendingApproval: true };
}

type SignedProfile = { full_name?: string; age_years?: number; sex?: string; phone?: string; city?: string; preferred_language?: string; consent?: boolean };

export async function loginAction(form: FormData): Promise<ActionResult<{ staff: boolean; status: AccountStatus }>> {
  if (isPublicFormRateLimited(`rv-login:${await clientIp()}`)) return { ok: false, error: "rate_limited" };
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "bad_login" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, error: error?.code === "email_not_confirmed" || /not confirmed/i.test(error?.message ?? "") ? "email_not_confirmed" : "bad_login" };
  if (await isStaff()) return { ok: true, staff: true, status: "active" as const };
  // An old account (e-mail sign-up before the clinic approved accounts) may have no patient record yet: create it from the sign-up form.
  try {
    let overview = await rpc<{ patient: { status: AccountStatus } | null }>("rehab_my_overview");
    if (!overview.patient) {
      const profile = (data.user.user_metadata?.rehabverse_profile ?? null) as SignedProfile | null;
      if (profile?.consent && profile.full_name) {
        await rpc("rehab_register_patient", { p_payload: { ...profile, consent_version: "v2" } });
        overview = await rpc<{ patient: { status: AccountStatus } | null }>("rehab_my_overview");
      }
    }
    return { ok: true, staff: false, status: overview.patient?.status ?? "active" };
  } catch (e) {
    return fail(e);
  }
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

/** What the waiting screen polls: is the request still waiting, approved or declined (and why). */
export async function myAccountStatusAction(): Promise<ActionResult<{ status: AccountStatus; note: string | null }>> {
  try {
    const overview = await getOverview();
    if (!overview.patient) return { ok: false, error: "no_account" };
    return { ok: true, status: overview.patient.status ?? "active", note: overview.patient.decision_note ?? null };
  } catch (e) {
    return fail(e);
  }
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

/** The raw answers given through the symptom-checker pictures and clues. The server works the patterns out itself; nothing computed in the browser is stored. */
export type ScreeningInput = { region: string; answers: string[]; language: "en" | "ru"; source?: "checker" | "handover" };

export async function submitAssessmentAction(input: IntakeInput, aiConversationId?: string, screening?: ScreeningInput): Promise<ActionResult<{ result: IntakeResult }>> {
  try {
    const result = await rpc<IntakeResult>("rehab_submit_assessment", { p_payload: input });
    if (screening && !result.duplicate) {
      // The screening snapshot (research record). Never blocks the submission: the assessment itself is already saved.
      try {
        const built = buildSnapshot({ region: screening.region, answers: screening.answers, pain_now: input.pain_now, language: screening.language, source: screening.source });
        const overview = await getOverview();
        if (built.ok && overview.patient) {
          const { error } = await createAdminClient().rpc("rehab_checker_snapshot_save", { p_patient_id: overview.patient.id, p_assessment_id: result.id, p_snapshot: built.snapshot });
          if (error) console.error("REHAB_SNAPSHOT", error.message);
        } else console.error("REHAB_SNAPSHOT", built.ok ? "no patient" : built.reason);
      } catch (error) {
        console.error("REHAB_SNAPSHOT", error instanceof Error ? error.message : String(error));
      }
    }
    if (aiConversationId && /^[0-9a-f-]{36}$/i.test(aiConversationId)) {
      // Remember which assessment the AI conversation produced (research record). Never blocks the submission.
      try {
        const overview = await getOverview();
        if (overview.patient) await createAdminClient().rpc("rehab_ai_link_conversation", { p_patient_id: overview.patient.id, p_conversation_id: aiConversationId, p_assessment_id: result.id });
      } catch (error) {
        console.error("REHAB_AI_LINK", error instanceof Error ? error.message : String(error));
      }
    }
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

/** What the patient may see of the screening for the latest assessment (the database applies the safety rule and the study setting, and logs the first time it is shown). */
export async function myScreeningAction(): Promise<ActionResult<{ screening: MyScreening }>> {
  try {
    return { ok: true, screening: await getMyScreening() };
  } catch (e) {
    return fail(e);
  }
}

/* ─────────────────────────────── outcome measures ─────────────────────────────── */

/**
 * The patient answers a questionnaire the physiotherapist chose. The server checks that it is in the live plan at that time point, that the patient has not
 * answered it already, works the score out from the raw answers (nothing sent by the browser is trusted as a score) and saves the answers with the language
 * the words were shown in. A follow-up Patient-Specific Functional Scale re-asks the activities written at the start, in the same order.
 */
export async function submitOutcomeAction(input: { instrument: string; timepoint: TimepointKey; answers: unknown; language: "en" | "ru" }): Promise<ActionResult<{ saved: boolean }>> {
  try {
    const instrument = instrumentFor(String(input.instrument));
    if (!instrument || instrument.status !== "ready" || instrument.kind !== "patient_reported") return { ok: false, error: "not_available" };
    const mine = await getMyOutcomes();
    const item = mine.plan?.items.find((i) => i.instrument === instrument.id && i.version === instrument.version);
    if (!mine.plan || !item) return { ok: false, error: "not_in_plan" };
    if (!timepointsFor(item).includes(input.timepoint)) return { ok: false, error: "not_in_plan" };
    if (mine.responses.some((r) => r.instrument === instrument.id && r.timepoint === input.timepoint)) return { ok: false, error: "already_answered" };
    let answers = input.answers;
    if (instrument.form.type === "psfs" && input.timepoint !== "baseline") {
      const baseline = mine.responses.find((r) => r.instrument === "psfs" && r.timepoint === "baseline");
      const names = ((baseline?.answers.activities as { name: string }[] | undefined) ?? []).map((a) => a.name);
      const sent = (answers as { activities?: { rating?: unknown }[] } | null)?.activities;
      if (names.length === 0 || !Array.isArray(sent) || sent.length !== names.length) return { ok: false, error: "psfs_activities" };
      answers = { activities: names.map((name, index) => ({ name, rating: sent[index]?.rating })) };
    }
    const scored = scoreResponse(instrument, answers);
    if (!scored.ok) return { ok: false, error: "invalid_answers" };
    const overview = await getOverview();
    if (!overview.patient) return { ok: false, error: "no_patient" };
    const { data, error } = await createAdminClient().rpc("rehab_outcome_save", {
      p_patient_id: overview.patient.id, p_plan_id: mine.plan.id, p_instrument: instrument.id, p_version: instrument.version, p_timepoint: input.timepoint,
      p_answers: scored.answers, p_score: scored.score, p_language: input.language === "ru" ? "ru" : "en", p_collected_by: "patient",
    });
    if (error) {
      console.error("REHAB_OUTCOME", error.message);
      return { ok: false, error: "failed" };
    }
    const saved = Boolean((data as { saved?: boolean } | null)?.saved);
    if (saved) await logEngagement("outcome_sent");
    return { ok: true, saved };
  } catch (e) {
    return fail(e);
  }
}

/* ─────────────────────────────── engagement (research: the same record in both arms) ─────────────────────────────── */

const ENGAGEMENT_EVENTS = ["day_opened", "exercise_opened", "exercise_done", "day_left", "feedback_sent", "outcome_sent"] as const;
type EngagementEvent = (typeof ENGAGEMENT_EVENTS)[number];

/** Never throws and never blocks the patient: a missing table (before the migration) or a network error only skips the record. */
async function logEngagement(event: EngagementEvent, sessionId?: string | null, exercise?: string | null, seconds?: number | null) {
  try {
    await rpc("rehab_log_engagement", {
      p_event: event,
      p_session_id: sessionId && /^[0-9a-f-]{36}$/i.test(sessionId) ? sessionId : null,
      p_exercise: exercise && /^[a-z0-9_-]{1,80}$/.test(exercise) ? exercise : null,
      p_seconds: typeof seconds === "number" && Number.isFinite(seconds) ? Math.max(0, Math.min(7200, Math.round(seconds))) : null,
    });
  } catch {
    /* the record is for research; the patient's day goes on */
  }
}

/** Called by the day page for every patient, whatever their arm: the code path is the same with the AI switch on or off. */
export async function logEngagementAction(event: string, sessionId?: string | null, exercise?: string | null, seconds?: number | null): Promise<void> {
  if (!(ENGAGEMENT_EVENTS as readonly string[]).includes(event) || event === "feedback_sent" || event === "outcome_sent") return;
  await logEngagement(event as EngagementEvent, sessionId, exercise, seconds);
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
      await logEngagement("feedback_sent", sessionId);
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
