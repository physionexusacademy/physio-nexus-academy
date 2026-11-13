"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, MailCheck, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AccountLink, useAccountNav } from "@/components/student/AccountApp";

type Mode = "login" | "register" | "forgot" | "reset";

const stages = [
  ["year1-2", "DPT year 1–2"],
  ["year3-4", "DPT year 3–4"],
  ["final-intern", "Final year / intern"],
  ["graduate", "Practising physiotherapist"],
  ["other", "Something else"],
] as const;
const goals = [
  ["understand", "Understand concepts deeply"],
  ["exams", "Prepare for exams and viva"],
  ["clinic", "Be better in the clinic"],
  ["manual", "Learn manual therapy"],
] as const;

const notices: Record<string, string> = {
  link: "That confirmation or reset link has expired or was opened on another device. Sign in below, or ask for a new link.",
  signedout: "You are signed out.",
};

function ruleChecks(password: string) {
  return { length: password.length >= 10, mix: /[a-z]/i.test(password) && (/\d/.test(password) || /[^a-z0-9]/i.test(password)) };
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="acct-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function AccountForm({ mode }: { mode: Mode }) {
  const nav = useAccountNav();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState({ display_name: "", email: "", password: "", stage: "year3-4", goal: "understand", university: "", city: "", consent: false });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sentTo, setSentTo] = useState<"confirm" | "reset" | null>(null);
  const [resent, setResent] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const checks = ruleChecks(form.password);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("notice");
    if (code && notices[code]) setNotice(notices[code]);
  }, []);

  const origin = () => window.location.origin;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        if (form.display_name.trim().length < 2) throw new Error("Please enter your name (at least 2 letters).");
        if (!checks.length || !checks.mix) throw new Error("Use a password of at least 10 characters with letters and a number or symbol.");
        if (!form.consent) throw new Error("Please tick the box to confirm you are happy for PNA to save your learning activity.");
        const { data, error: err } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: `${origin()}/rehabverse/auth/callback?next=/account`,
            data: { display_name: form.display_name.trim(), stage: form.stage, goal: form.goal, university: form.university.trim(), city: form.city.trim(), account_kind: "student" },
          },
        });
        if (err) throw new Error(err.message.includes("registered") ? "This email already has an account — use “Sign in”." : err.message);
        if (data.session) nav.done();
        else if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error("This email already has an account — use “Sign in”, or “Forgot password”.");
        else setSentTo("confirm");
      } else if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (err) throw new Error(err.code === "email_not_confirmed" ? "Please confirm your email first — check your inbox for our message." : "Email or password is not correct. Check both, or use “Forgot password”.");
        nav.done();
      } else if (mode === "forgot") {
        await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: `${origin()}/rehabverse/auth/callback?next=/account/reset` });
        setSentTo("reset");
      } else {
        if (!checks.length || !checks.mix) throw new Error("Use a password of at least 10 characters with letters and a number or symbol.");
        const { error: err } = await supabase.auth.updateUser({ password: form.password });
        if (err) throw new Error(err.message);
        nav.done();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setResent(false);
    await supabase.auth.resend({ type: "signup", email: form.email.trim(), options: { emailRedirectTo: `${origin()}/rehabverse/auth/callback?next=/account` } });
    setResent(true);
  }

  if (sentTo) {
    return (
      <div className="acct-card acct-done" role="status">
        <span className="acct-done-icon"><MailCheck className="h-7 w-7" aria-hidden="true" /></span>
        <h1>{sentTo === "confirm" ? "One last step: confirm your email" : "Check your email"}</h1>
        <p>{sentTo === "confirm" ? <>We sent a confirmation link to <strong>{form.email}</strong>. Open it on this device and your personal PNA record opens.</> : <>If <strong>{form.email}</strong> has an account, a reset link is on its way.</>}</p>
        {sentTo === "confirm" ? (
          <button type="button" className="acct-link" onClick={resend}>{resent ? "Sent — check your inbox (and spam)" : "Send the email again"}</button>
        ) : null}
        <AccountLink mode="login" className="acct-link">Back to sign in</AccountLink>
      </div>
    );
  }

  const titles: Record<Mode, [string, string]> = {
    register: ["Create your free PNA account", "Every lesson, skill, patient and challenge you finish is saved to your own private record."],
    login: ["Welcome back", "Sign in to see your record, insights and progress."],
    forgot: ["Reset your password", "Enter your email and we will send a link."],
    reset: ["Choose a new password", "Use at least 10 characters."],
  };

  return (
    <form onSubmit={submit} className="acct-card" noValidate>
      <h1>{titles[mode][0]}</h1>
      <p className="acct-sub">{titles[mode][1]}</p>
      {notice ? <p className="acct-notice" role="status">{notice}</p> : null}

      {mode === "register" ? (
        <>
          <Field id="display_name" label="Your name"><input id="display_name" autoComplete="name" value={form.display_name} onChange={(e) => set("display_name", e.target.value)} maxLength={40} required /></Field>
          <div className="acct-row">
            <Field id="stage" label="You are"><select id="stage" value={form.stage} onChange={(e) => set("stage", e.target.value)}>{stages.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field id="goal" label="Your main goal"><select id="goal" value={form.goal} onChange={(e) => set("goal", e.target.value)}>{goals.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          </div>
          <div className="acct-row">
            <Field id="university" label="University / institute" hint="Optional"><input id="university" value={form.university} onChange={(e) => set("university", e.target.value)} maxLength={80} /></Field>
            <Field id="city" label="City" hint="Optional"><input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={60} /></Field>
          </div>
        </>
      ) : null}

      {mode !== "reset" ? (
        <Field id="email" label="Email"><input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></Field>
      ) : null}

      {mode === "register" || mode === "login" || mode === "reset" ? (
        <Field id="password" label={mode === "reset" ? "New password" : "Password"}>
          <div className="acct-pass">
            <input id="password" type={show ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e) => set("password", e.target.value)} required />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
          {mode !== "login" ? (
            <ul className="acct-rules" aria-label="Password rules">
              <li data-ok={checks.length}><Check className="h-3.5 w-3.5" aria-hidden="true" /> At least 10 characters</li>
              <li data-ok={checks.mix}><Check className="h-3.5 w-3.5" aria-hidden="true" /> Letters and a number or symbol</li>
            </ul>
          ) : null}
        </Field>
      ) : null}

      {mode === "register" ? (
        <label className="acct-consent">
          <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
          <span>I am happy for PNA to save my learning activity (lessons, practice, scores) in my private record. Only I can see it, and I can download or delete it any time.</span>
        </label>
      ) : null}

      {error ? <p className="acct-error" role="alert">{error}</p> : null}

      <button type="submit" className="nx-btn nx-btn-primary acct-submit" disabled={busy}>
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {mode === "register" ? "Create my account" : mode === "login" ? "Sign in" : mode === "forgot" ? "Send me the link" : "Save new password"}
        {!busy ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
      </button>

      <div className="acct-foot">
        {mode === "login" ? (<><AccountLink mode="forgot">Forgot password?</AccountLink><AccountLink mode="register">Create an account</AccountLink></>) : null}
        {mode === "register" ? <AccountLink mode="login">I already have an account</AccountLink> : null}
        {mode === "forgot" ? <AccountLink mode="login">Back to sign in</AccountLink> : null}
      </div>
      <p className="acct-safe"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Private by design. PNA never shares your record.</p>
    </form>
  );

}
