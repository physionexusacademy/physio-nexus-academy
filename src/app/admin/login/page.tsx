import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import "@/components/admin/admin.css";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  const errorMessage =
    params.error === "not-authorized"
      ? "Your account is signed in but is not registered as an admin. Contact the academy owner to be added to the profiles table."
      : params.error;

  return (
    <div className="al-root">
      <div className="al-bg" aria-hidden="true" />
      <div className="al-grid" aria-hidden="true" />
      <span className="al-orb al-orb-a" aria-hidden="true" />
      <span className="al-orb al-orb-b" aria-hidden="true" />
      <div className="al-card" role="region" aria-label="Admin sign in">
        <div className="al-head">
          <span className="al-logo"><Image src="/images/pna-logo.png" alt="Physio Nexus Academy" width={52} height={52} priority /></span>
          <h1>Admin Dashboard</h1>
          <p>Physio Nexus Academy</p>
        </div>

        <form action={login} className="al-form">
          <label className="al-field">
            <span>Email</span>
            <span className="al-input">
              <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
              <input name="email" type="email" required autoComplete="email" placeholder="Your email" />
            </span>
          </label>
          <label className="al-field">
            <span>Password</span>
            <span className="al-input">
              <Lock className="h-[18px] w-[18px]" aria-hidden="true" />
              <input name="password" type="password" required autoComplete="current-password" placeholder="Your password" />
            </span>
          </label>
          {errorMessage && <p className="al-error" role="alert">{errorMessage}</p>}
          <button type="submit" className="al-submit">
            Sign in <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </form>
        <p className="al-foot"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Authorised academy staff only. Every action is private and secure.</p>
      </div>
    </div>
  );
}
