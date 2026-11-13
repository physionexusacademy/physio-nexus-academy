"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { loginAction, registerAction } from "@/app/rehabverse/actions";
import { T, useRvLang } from "./useLang";

const ERRORS: Record<string, { en: string; ru: string }> = {
  bad_email: { en: "Please enter a valid email address.", ru: "Meherbani karke durust email likhein." },
  weak_password: { en: "Use a password of at least 10 characters.", ru: "Kam az kam 10 characters ka password rakhein." },
  bad_name: { en: "Please enter your full name.", ru: "Apna poora naam likhein." },
  bad_age: { en: "Please enter your age.", ru: "Apni umar likhein." },
  under_18: { en: "RehabVerse is for adults (18+). Please ask a parent or guardian to book a clinic visit.", ru: "RehabVerse bartaaloon (18+) ke liye hai. Meherbani karke parent ya guardian se clinic visit book karwayein." },
  consent_required: { en: "Please tick the agreement to continue.", ru: "Aage barhne ke liye agreement par tick karein." },
  email_taken: { en: "This email already has an account — try signing in.", ru: "Is email ka account pehle se hai — sign in karke dekhein." },
  signup_failed: { en: "We could not create your account. Please try again.", ru: "Account nahi ban saka. Dobara koshish karein." },
  bad_login: { en: "Email or password is not correct.", ru: "Email ya password durust nahi." },
  rate_limited: { en: "Too many attempts. Please wait a few minutes.", ru: "Bohat zyada koshishein. Kuch minute intezar karein." },
};

function useAuth() {
  const [lang] = useRvLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const message = error ? (ERRORS[error] ?? { en: "Something went wrong. Please try again.", ru: "Kuch ghalat ho gaya. Dobara koshish karein." })[lang] : null;
  return { lang, router, pending, start, error, setError, message };
}

export function LoginForm() {
  const { lang, router, pending, start, setError, message } = useAuth();
  return (
    <form
      className="rv-glass mx-auto w-full max-w-md space-y-4 p-5 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError(null);
        start(async () => {
          const result = await loginAction(form);
          if (!result.ok) return setError(result.error);
          router.push(result.staff ? "/admin/rehabverse" : "/rehabverse/me");
          router.refresh();
        });
      }}
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Sign in" ru="Sign in karein" /></h1>
        <p className="mt-1 text-sm text-slate-600"><T en="Continue your guided programme." ru="Apna guided programme jaari rakhein." /></p>
      </div>
      <div>
        <label className="rv-label" htmlFor="email"><T en="Email" ru="Email" /></label>
        <input id="email" name="email" type="email" required autoComplete="email" className="rv-input" />
      </div>
      <div>
        <label className="rv-label" htmlFor="password"><T en="Password" ru="Password" /></label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="rv-input" />
      </div>
      {message ? <p className="rv-error" role="alert">{message}</p> : null}
      <button type="submit" disabled={pending} className="rv-btn rv-btn-primary w-full"><LogIn className="h-4 w-4" aria-hidden="true" /> {pending ? (lang === "ru" ? "Ruk jayein…" : "Signing in…") : <T en="Sign in" ru="Sign in" />}</button>
      <p className="text-center text-sm text-slate-600">
        <T en="New here?" ru="Naye hain?" />{" "}
        <Link href="/rehabverse/register" className="font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Create an account" ru="Account banayein" /></Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const { lang, router, pending, start, setError, message } = useAuth();
  const [confirmEmail, setConfirmEmail] = useState(false);
  if (confirmEmail) {
    return (
      <div className="rv-glass mx-auto w-full max-w-md space-y-3 p-6 text-center" role="status">
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Check your email" ru="Apna email dekhein" /></h1>
        <p className="text-sm leading-6 text-slate-600">
          <T en="We sent you a link to confirm your email. After confirming, sign in to continue to your assessment." ru="Humne email confirm karne ka link bheja hai. Confirm karne ke baad sign in karke apne assessment par jayein." />
        </p>
        <Link href="/rehabverse/login" className="rv-btn rv-btn-primary"><T en="Go to sign in" ru="Sign in par jayein" /></Link>
      </div>
    );
  }
  return (
    <form
      className="rv-glass mx-auto w-full max-w-xl space-y-4 p-5 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        form.set("preferred_language", lang);
        setError(null);
        start(async () => {
          const result = await registerAction(form);
          if (!result.ok) return setError(result.error);
          if (result.needsEmailConfirmation) return setConfirmEmail(true);
          router.push("/rehabverse/start");
          router.refresh();
        });
      }}
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Create your RehabVerse account" ru="Apna RehabVerse account banayein" /></h1>
        <p className="mt-1 text-sm text-slate-600"><T en="Your details are private. Only you and your physiotherapist can see them." ru="Aap ki maloomat private hain. Sirf aap aur aap ke physiotherapist inhein dekh sakte hain." /></p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="rv-label" htmlFor="full_name"><T en="Full name" ru="Poora naam" /></label>
          <input id="full_name" name="full_name" required minLength={2} maxLength={100} autoComplete="name" className="rv-input" />
        </div>
        <div>
          <label className="rv-label" htmlFor="age_years"><T en="Age" ru="Umar" /></label>
          <input id="age_years" name="age_years" type="number" inputMode="numeric" min={18} max={120} required className="rv-input" />
        </div>
        <div>
          <label className="rv-label" htmlFor="sex"><T en="Sex (optional)" ru="Jins (zaroori nahi)" /></label>
          <select id="sex" name="sex" className="rv-input" defaultValue="">
            <option value="">—</option>
            <option value="female">{lang === "ru" ? "Aurat (female)" : "Female"}</option>
            <option value="male">{lang === "ru" ? "Mard (male)" : "Male"}</option>
            <option value="other">{lang === "ru" ? "Dosra" : "Other"}</option>
            <option value="prefer_not_to_say">{lang === "ru" ? "Batana nahi chahta/chahti" : "Prefer not to say"}</option>
          </select>
        </div>
        <div>
          <label className="rv-label" htmlFor="phone"><T en="Phone (optional)" ru="Phone (zaroori nahi)" /></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="rv-input" />
        </div>
        <div>
          <label className="rv-label" htmlFor="city"><T en="City (optional)" ru="Shehar (zaroori nahi)" /></label>
          <input id="city" name="city" maxLength={80} autoComplete="address-level2" className="rv-input" />
        </div>
        <div className="sm:col-span-2">
          <label className="rv-label" htmlFor="email"><T en="Email" ru="Email" /></label>
          <input id="email" name="email" type="email" required autoComplete="email" className="rv-input" />
        </div>
        <div className="sm:col-span-2">
          <label className="rv-label" htmlFor="password"><T en="Password (10+ characters)" ru="Password (kam az kam 10 characters)" /></label>
          <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="rv-input" />
        </div>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-[13px] leading-5 text-slate-700">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-teal-600" />
        <span>
          <T
            en="I am 18 or older. I understand RehabVerse supports physiotherapy but is not an emergency service or a replacement for an in-person assessment, and that the 3D guide is not a clinician. I agree that my answers and progress are stored securely and reviewed by my physiotherapist at Physio Nexus Academy."
            ru="Meri umar 18 saal ya zyada hai. Main samajhta/samajhti hoon ke RehabVerse physiotherapy ka saath deta hai lekin emergency service ya in-person assessment ka badal nahi, aur 3D guide clinician nahi. Main manta/manti hoon ke mere jawabat aur progress mehfooz store hote hain aur Physio Nexus Academy ke mere physiotherapist unhein dekhte hain."
          />{" "}
          <Link href="/legal/privacy" className="font-bold text-teal-700 underline" target="_blank"><T en="Privacy policy" ru="Privacy policy" /></Link>
        </span>
      </label>
      {message ? <p className="rv-error" role="alert">{message}</p> : null}
      <button type="submit" disabled={pending} className="rv-btn rv-btn-primary w-full"><UserPlus className="h-4 w-4" aria-hidden="true" /> {pending ? (lang === "ru" ? "Ruk jayein…" : "Creating…") : <T en="Create account" ru="Account banayein" />}</button>
      <p className="text-center text-sm text-slate-600">
        <T en="Already registered?" ru="Pehle se registered hain?" />{" "}
        <Link href="/rehabverse/login" className="font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Sign in" ru="Sign in" /></Link>
      </p>
    </form>
  );
}
