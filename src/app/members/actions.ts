"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPublicFormRateLimited } from "@/lib/security/public-form-protection";
import { MEMBER_COOKIE } from "@/lib/members/cookie";

/**
 * Registration, sign-in and sign-out for the members' door. A new account is a REQUEST the clinic approves: the server creates the sign-in already confirmed (no e-mail
 * round trip), signs the person in and records a pending member request. Until the clinic approves, the person can reach nothing but the waiting page.
 */
export type MemberResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };
export type MemberStanding = "approved" | "pending" | "rejected" | "suspended" | "none";

const ADMIN_EMAIL = "physionexusacademypk@gmail.com";
const FROM_EMAIL = "Physio Nexus Academy <notifications@physionexusacademy.com>";
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Tell the clinic a request is waiting. No personal details in the e-mail: the Members access page has them behind the admin sign-in. */
async function alertClinic() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [ADMIN_EMAIL], subject: "Website: a new member request is waiting", text: "A new person asked for access to the website. Open Admin > Members access to approve or reject (their details are shown only after you sign in)." }),
    });
  } catch (error) {
    console.error("Members alert email failed", error);
  }
}

const standing = (data: unknown): MemberStanding => {
  const value = (data as { status?: string } | null)?.status;
  return value === "approved" || value === "pending" || value === "rejected" || value === "suspended" ? value : "none";
};

export async function memberRegisterAction(form: FormData): Promise<MemberResult<{ status: MemberStanding }>> {
  if (text(form, "website")) return { ok: false, error: "failed" }; // honeypot
  if (isPublicFormRateLimited(`members-register:${await clientIp()}`)) return { ok: false, error: "rate_limited" };
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const profile = { full_name: text(form, "full_name"), phone: text(form, "phone"), city: text(form, "city") || undefined, who: text(form, "who") || undefined };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: "bad_email" };
  if (password.length < 10) return { ok: false, error: "weak_password" };
  if (profile.full_name.length < 2 || profile.full_name.length > 100) return { ok: false, error: "bad_name" };
  if (profile.phone.replace(/\D/g, "").length < 10 || profile.phone.length > 30) return { ok: false, error: "bad_phone" };
  if (profile.who && !["student", "physiotherapist", "patient", "other"].includes(profile.who)) return { ok: false, error: "bad_who" };

  const { error: createError } = await createAdminClient().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: profile.full_name } });
  if (createError) return { ok: false, error: /registered|exists|duplicate/i.test(createError.message) ? "email_taken" : /password/i.test(createError.message) ? "weak_password" : "signup_failed" };
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { ok: false, error: "signup_failed" };
  const { data, error } = await supabase.rpc("site_member_register", { p_payload: profile });
  if (error) return { ok: false, error: /phone/i.test(error.message) ? "bad_phone" : /name/i.test(error.message) ? "bad_name" : "failed" };
  await alertClinic();
  return { ok: true, status: standing(data) };
}

export async function memberLoginAction(form: FormData): Promise<MemberResult<{ status: MemberStanding }>> {
  if (isPublicFormRateLimited(`members-login:${await clientIp()}`)) return { ok: false, error: "rate_limited" };
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "bad_login" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, error: "bad_login" };
  const { data: status, error: rpcError } = await supabase.rpc("site_member_ensure");
  if (rpcError) return { ok: false, error: "failed" };
  return { ok: true, status: standing(status) };
}

/** What the waiting page asks every 20 seconds. */
export async function memberStatusAction(): Promise<MemberResult<{ status: MemberStanding; note: string | null }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "signed_out" };
  const { data, error } = await supabase.rpc("site_member_status");
  if (error) return { ok: false, error: "failed" };
  return { ok: true, status: standing(data), note: (data as { note?: string | null } | null)?.note ?? null };
}

export async function memberLogoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(MEMBER_COOKIE);
}
