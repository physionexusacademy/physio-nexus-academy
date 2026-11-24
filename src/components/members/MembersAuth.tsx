"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { memberLoginAction, memberRegisterAction } from "@/app/members/actions";
import { T, useRvLang } from "@/components/rehabverse/useLang";

const ERRORS: Record<string, { en: string; ru: string }> = {
  bad_email: { en: "Please enter a valid email address.", ru: "Sahi email address likhein." },
  weak_password: { en: "The password needs at least 10 characters.", ru: "Password kam az kam 10 harf ka hona chahiye." },
  bad_name: { en: "Please enter your full name.", ru: "Apna poora naam likhein." },
  bad_phone: { en: "Please enter a phone number we can call (10 digits or more).", ru: "Aisa phone number likhein jis par hum call kar saken (10 ya zyada digits)." },
  bad_who: { en: "Please say who you are.", ru: "Batayein aap kaun hain." },
  email_taken: { en: "This email already has an account. Please sign in instead.", ru: "Is email ka account pehle se hai. Sign in karein." },
  bad_login: { en: "The email or the password is not right.", ru: "Email ya password sahi nahi." },
  rate_limited: { en: "Too many tries. Please wait a few minutes and try again.", ru: "Bohat zyada koshishein. Chand minute ruk kar dobara koshish karein." },
  signup_failed: { en: "We could not create the account. Please try again.", ru: "Account nahi ban saka. Dobara koshish karein." },
  failed: { en: "Something went wrong. Please try again.", ru: "Kuch ghalat ho gaya. Dobara koshish karein." },
  unavailable: { en: "Members access is not available right now. Please try again in a moment.", ru: "Members access abhi available nahi. Thori der baad koshish karein." },
  not_configured: { en: "Members access is not set up yet. Please tell the clinic.", ru: "Members access abhi set up nahi. Clinic ko batayein." },
};

const WHO = [
  { id: "student", en: "Student", ru: "Student" },
  { id: "physiotherapist", en: "Physiotherapist", ru: "Physiotherapist" },
  { id: "patient", en: "Patient", ru: "Patient" },
  { id: "other", en: "Other", ru: "Koi aur" },
];

/** Sign in, or ask for access. A new account is approved by the clinic before anything on the website opens. */
export function MembersAuth({ next, error }: { next: string; error?: string }) {
  const [lang] = useRvLang();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [pending, start] = useTransition();
  const [problem, setProblem] = useState<string | null>(error ?? null);

  const submit = (form: FormData) => start(async () => {
    setProblem(null);
    const result = tab === "login" ? await memberLoginAction(form) : await memberRegisterAction(form);
    if (!result.ok) return setProblem(result.error);
    if (result.status === "approved") router.replace(`/members/check?next=${encodeURIComponent(next)}`);
    else router.replace(result.status === "rejected" || result.status === "suspended" ? "/members/blocked" : "/members/waiting");
    router.refresh();
  });

  return (
    <div className="rv-glass mx-auto w-full max-w-lg space-y-5 p-5 sm:p-8" data-testid="members-auth">
      <div>
        <p className="rv-h flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> <T en="Members only" ru="Sirf members ke liye" /></p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-800 sm:text-3xl"><T en="Welcome to Physio Nexus Academy" ru="Physio Nexus Academy mein khush aamdeed" /></h1>
        <p className="mt-2 text-[16px] leading-7 text-slate-700"><T en="This website is for approved members. Sign in, or ask for a new account. The clinic approves every new account before it opens." ru="Yeh website approved members ke liye hai. Sign in karein, ya naye account ki request karein. Clinic har naya account kholne se pehle approve karta hai." /></p>
      </div>

      <div className="grid grid-cols-2 gap-2" role="tablist">
        {(["login", "register"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setProblem(null); }} data-testid={`tab-${t}`}
            className={"rv-btn !min-h-[52px] " + (tab === t ? "rv-btn-primary" : "rv-btn-ghost")}>
            {t === "login" ? <><LogIn className="h-5 w-5" aria-hidden="true" /> <T en="Sign in" ru="Sign in" /></> : <><UserPlus className="h-5 w-5" aria-hidden="true" /> <T en="New account" ru="Naya account" /></>}
          </button>
        ))}
      </div>

      <form action={submit} className="space-y-4" noValidate>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {tab === "register" ? (
          <>
            <div><label className="rv-label" htmlFor="m-name"><T en="Full name" ru="Poora naam" /></label><input id="m-name" name="full_name" className="rv-input" autoComplete="name" required /></div>
            <div><label className="rv-label" htmlFor="m-phone"><T en="Phone or WhatsApp number" ru="Phone ya WhatsApp number" /></label><input id="m-phone" name="phone" type="tel" className="rv-input" autoComplete="tel" required /><p className="rv-hint"><T en="The clinic may call to check who you are." ru="Clinic aap ki pehchan check karne ke liye call kar sakta hai." /></p></div>
            <div><label className="rv-label" htmlFor="m-who"><T en="Who are you?" ru="Aap kaun hain?" /></label>
              <select id="m-who" name="who" className="rv-input" defaultValue="student">{WHO.map((w) => <option key={w.id} value={w.id}>{lang === "ru" ? w.ru : w.en}</option>)}</select></div>
            <div><label className="rv-label" htmlFor="m-city"><T en="City (optional)" ru="Shehar (zaroori nahi)" /></label><input id="m-city" name="city" className="rv-input" autoComplete="address-level2" /></div>
          </>
        ) : null}
        <div><label className="rv-label" htmlFor="m-email">Email</label><input id="m-email" name="email" type="email" className="rv-input" autoComplete="email" required /></div>
        <div><label className="rv-label" htmlFor="m-pass">Password</label><input id="m-pass" name="password" type="password" className="rv-input" autoComplete={tab === "login" ? "current-password" : "new-password"} minLength={tab === "register" ? 10 : undefined} required />
          {tab === "register" ? <p className="rv-hint"><T en="At least 10 characters." ru="Kam az kam 10 harf." /></p> : null}</div>
        {problem ? <p className="rv-error" role="alert">{ERRORS[problem] ? ERRORS[problem][lang] : ERRORS.failed[lang]}</p> : null}
        <button type="submit" disabled={pending} className="rv-btn rv-btn-primary w-full !min-h-[56px] text-[17px]" data-testid="members-submit">
          {tab === "login" ? <T en="Sign in" ru="Sign in karein" /> : <T en="Send my request" ru="Meri request bhejein" />}
        </button>
        {tab === "login" ? <p className="text-center text-[14px]"><a href="/rehabverse/forgot" className="font-bold text-teal-700 underline"><T en="Forgot your password?" ru="Password bhool gaye?" /></a></p> : null}
      </form>
    </div>
  );
}
