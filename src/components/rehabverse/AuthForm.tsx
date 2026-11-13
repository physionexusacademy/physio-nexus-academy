"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ClipboardList, Eye, EyeOff, Info, KeyRound, LogIn, Mail, ShieldCheck, Stethoscope, UserPlus, Video } from "lucide-react";
import { forgotPasswordAction, loginAction, registerAction, resendConfirmationAction, updatePasswordAction } from "@/app/rehabverse/actions";
import { T, useRvLang } from "./useLang";

const ERRORS: Record<string, { en: string; ru: string }> = {
  bad_email: { en: "That email address does not look right. Please check it.", ru: "Ye email address durust nahi lag raha. Dobara check karein." },
  weak_password: { en: "Use a password of at least 10 characters.", ru: "Kam az kam 10 characters ka password rakhein." },
  bad_name: { en: "Please enter your full name.", ru: "Apna poora naam likhein." },
  bad_age: { en: "Please enter your age in years.", ru: "Apni umar saalon mein likhein." },
  under_18: { en: "RehabVerse is for adults (18+). Please ask a parent or guardian to book a clinic visit instead.", ru: "RehabVerse bartaaloon (18+) ke liye hai. Meherbani karke parent ya guardian se clinic visit book karwayein." },
  consent_required: { en: "Please tick the agreement box to continue.", ru: "Aage barhne ke liye agreement wale box par tick karein." },
  email_taken: { en: "This email already has an account. Use “Sign in” — or “Forgot password” if you do not remember it.", ru: "Is email ka account pehle se hai. “Sign in” karein — ya password yaad na ho to “Forgot password” dabayein." },
  signup_failed: { en: "We could not create your account. Please try again in a minute.", ru: "Account nahi ban saka. Ek minute baad dobara koshish karein." },
  bad_login: { en: "Email or password is not correct. Check both, or use “Forgot password”.", ru: "Email ya password durust nahi. Dono check karein, ya “Forgot password” istemal karein." },
  email_not_confirmed: { en: "Your email is not confirmed yet. Open the confirmation email we sent, or ask for a new one below.", ru: "Aap ka email abhi confirm nahi hua. Humari bheji hui confirmation email kholein, ya neeche se nayi mangwayein." },
  rate_limited: { en: "Too many attempts. Please wait a few minutes and try again.", ru: "Bohat zyada koshishein. Kuch minute intezar karke dobara koshish karein." },
  link_expired: { en: "This link has expired or was already used. Please ask for a new one.", ru: "Ye link expire ho gaya ya pehle istemal ho chuka. Nayi link mangwayein." },
  same_password: { en: "Please choose a password you have not used before.", ru: "Aisa password chunein jo pehle istemal na kiya ho." },
};
const NOTICES: Record<string, { tone: "info" | "ok"; en: string; ru: string }> = {
  link: { tone: "info", en: "That email link could not be used — it may have expired, or been opened on a different device. If you already confirmed your email, just sign in below.", ru: "Wo email link istemal nahi ho saki — shayad expire ho gayi, ya kisi aur device par khuli. Agar email confirm kar chuke hain to neeche sign in karein." },
  reset_link: { tone: "info", en: "That password-reset link has expired or was already used. Please request a new one.", ru: "Password reset ki wo link expire ho gayi ya pehle istemal ho chuki. Nayi link mangwayein." },
  reset_done: { tone: "ok", en: "Your password was changed. Please sign in with the new one.", ru: "Aap ka password badal gaya. Naye password se sign in karein." },
};

function useAuth() {
  const [lang] = useRvLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const message = error ? (ERRORS[error] ?? { en: "Something went wrong. Please try again.", ru: "Kuch ghalat ho gaya. Dobara koshish karein." })[lang] : null;
  return { lang, router, pending, start, error, setError, message };
}

/* ───────────────────────── password field ───────────────────────── */

function strength(password: string, email: string) {
  const checks = {
    length: password.length >= 10,
    mix: /[a-z]/i.test(password) && (/\d/.test(password) || /[^a-z0-9]/i.test(password)),
    notEmail: !email || !password || !password.toLowerCase().includes(email.split("@")[0].toLowerCase().slice(0, 5)) || email.split("@")[0].length < 3,
  };
  const score = (checks.length ? 1 : 0) + (checks.mix ? 1 : 0) + (checks.notEmail && password.length > 0 ? 1 : 0) + (password.length >= 14 ? 1 : 0);
  return { checks, score };
}

function PasswordField({ id, name = "password", label, value, onChange, autoComplete, showRules, email = "", minLength }: { id: string; name?: string; label: React.ReactNode; value: string; onChange: (v: string) => void; autoComplete: string; showRules?: boolean; email?: string; minLength?: number }) {
  const [show, setShow] = useState(false);
  const { checks, score } = useMemo(() => strength(value, email), [value, email]);
  const colour = score <= 1 ? "#d6293a" : score === 2 ? "#d99a00" : "#0db3aa";
  return (
    <div>
      <label className="rv-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} name={name} type={show ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className="rv-input !pr-12" aria-describedby={showRules ? `${id}-rules` : undefined} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-500 hover:bg-slate-100" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
          {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {showRules ? (
        <div id={`${id}-rules`} className="mt-2" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, score * 25)}%`, background: colour }} /></div>
          <ul className="mt-1.5 grid gap-0.5 text-[12px]">
            {([["length", { en: "At least 10 characters", ru: "Kam az kam 10 characters" }], ["mix", { en: "Letters plus a number or symbol", ru: "Huroof ke saath number ya symbol" }]] as const).map(([k, label]) => (
              <li key={k} className={checks[k] && value ? "font-semibold text-teal-700" : "text-slate-500"}><CheckCircle2 className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />{label.en}<span className="sr-only"> / {label.ru}</span></li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── guidance + tabs ───────────────────────── */

const STEPS = [
  { icon: UserPlus, en: ["Create your account", "Your name, age and email — about one minute."], ru: ["Account banayein", "Naam, umar aur email — lagbhag ek minute."] },
  { icon: ClipboardList, en: ["Tell us what hurts", "A few simple questions and safety checks (about 5 minutes)."], ru: ["Takleef bataein", "Kuch aasaan sawal aur safety checks (lagbhag 5 minute)."] },
  { icon: Stethoscope, en: ["Your physiotherapist builds your plan", "A real physiotherapist reviews your answers and approves your programme."], ru: ["Physiotherapist aap ka plan banate hain", "Ek real physiotherapist aap ke jawabat dekh kar programme approve karte hain."] },
  { icon: Video, en: ["Follow it day by day", "3D demos for every exercise. Give feedback and the next day opens safely."], ru: ["Din ba din follow karein", "Har exercise ka 3D demo. Feedback dein aur agla din safely khulta hai."] },
];

function Guidance({ active }: { active: "register" | "login" }) {
  return (
    <aside className="rv-glass p-5 sm:p-6" aria-label="How RehabVerse works">
      <p className="rv-h"><T en={active === "register" ? "New here? Start here" : "Welcome back"} ru={active === "register" ? "Naye hain? Yahan se shuru karein" : "Khush aamdeed"} /></p>
      <h2 className="mt-1 font-heading text-xl font-bold text-navy-800 sm:text-2xl"><T en="Here is exactly what happens" ru="Aage kya hota hai — saaf tareeqe se" /></h2>
      <ol className="mt-4 space-y-3">
        {STEPS.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0a1f3d] to-[#0db3aa] text-white"><s.icon className="h-4.5 w-4.5" aria-hidden="true" /><span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-white text-[10px] font-extrabold text-navy-800 shadow">{i + 1}</span></span>
            <span><b className="block text-[14px] text-navy-800"><T en={s.en[0]} ru={s.ru[0]} /></b><span className="block text-[13px] leading-5 text-slate-600"><T en={s.en[1]} ru={s.ru[1]} /></span></span>
          </li>
        ))}
      </ol>
      <ul className="mt-5 space-y-2 rounded-2xl bg-teal-50/70 p-3.5 text-[12.5px] leading-5 text-teal-950">
        <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="Private: only you and your physiotherapist can see your records." ru="Private: sirf aap aur aap ke physiotherapist aap ka record dekh sakte hain." /></span></li>
        <li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span><T en="The 3D guide is a virtual character, not a clinician. RehabVerse is not for emergencies." ru="3D guide ek virtual character hai, clinician nahi. RehabVerse emergency ke liye nahi hai." /></span></li>
      </ul>
      <Link href="/rehabverse/library" className="mt-4 inline-flex text-[13px] font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Just looking? Browse the 3D exercise library →" ru="Bas dekhna hai? 3D exercise library dekhein →" /></Link>
    </aside>
  );
}

function Tabs({ active }: { active: "register" | "login" }) {
  return (
    <nav className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1" aria-label="Account">
      <Link href="/rehabverse/register" aria-current={active === "register" ? "page" : undefined} className={"flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-[14px] font-extrabold " + (active === "register" ? "bg-white text-navy-800 shadow" : "text-slate-500 hover:text-navy-800")}><UserPlus className="h-4 w-4" aria-hidden="true" /> <T en="Create account" ru="Account banayein" /></Link>
      <Link href="/rehabverse/login" aria-current={active === "login" ? "page" : undefined} className={"flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-[14px] font-extrabold " + (active === "login" ? "bg-white text-navy-800 shadow" : "text-slate-500 hover:text-navy-800")}><LogIn className="h-4 w-4" aria-hidden="true" /> <T en="Sign in" ru="Sign in" /></Link>
    </nav>
  );
}

function Notice({ code }: { code?: string }) {
  const [lang] = useRvLang();
  const n = code ? NOTICES[code] : undefined;
  if (!n) return null;
  return <p className={"rounded-xl px-3.5 py-2.5 text-[13px] leading-5 " + (n.tone === "ok" ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950")} role="status">{n[lang]}</p>;
}

/* ───────────────────────── sign in ───────────────────────── */

function LoginForm({ notice }: { notice?: string }) {
  const { lang, router, pending, start, error, setError, message } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resent, setResent] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError(null);
        setResent(false);
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
      <Notice code={notice} />
      <div>
        <label className="rv-label" htmlFor="email"><T en="Email" ru="Email" /></label>
        <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rv-input" />
      </div>
      <PasswordField id="password" label={<T en="Password" ru="Password" />} value={password} onChange={setPassword} autoComplete="current-password" />
      {message ? <p className="rv-error" role="alert">{message}</p> : null}
      {error === "email_not_confirmed" ? (
        <div className="rounded-xl bg-slate-50 p-3 text-[13px]">
          {resent ? (
            <p className="font-semibold text-teal-800" role="status"><T en="Sent — check your inbox and spam folder." ru="Bhej di — inbox aur spam folder dekhein." /></p>
          ) : (
            <button type="button" disabled={pending || !email} className="font-bold text-teal-700 underline" onClick={() => start(async () => { const fd = new FormData(); fd.set("email", email); await resendConfirmationAction(fd); setResent(true); })}>
              <Mail className="mr-1 inline h-4 w-4" aria-hidden="true" /><T en="Send me a new confirmation email" ru="Mujhe nayi confirmation email bhejein" />
            </button>
          )}
        </div>
      ) : null}
      <button type="submit" disabled={pending} className="rv-btn rv-btn-primary w-full"><LogIn className="h-4 w-4" aria-hidden="true" /> {pending ? (lang === "ru" ? "Ruk jayein…" : "Signing in…") : <T en="Sign in" ru="Sign in" />}</button>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/rehabverse/forgot" className="font-bold text-slate-600 underline-offset-2 hover:underline"><T en="Forgot password?" ru="Password bhool gaye?" /></Link>
        <span className="text-slate-600"><T en="No account yet?" ru="Account nahi hai?" /> <Link href="/rehabverse/register" className="font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Create one" ru="Banayein" /></Link></span>
      </div>
    </form>
  );
}

/* ───────────────────────── create account ───────────────────────── */

function RegisterForm() {
  const { lang, router, pending, start, setError, message } = useAuth();
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resent, setResent] = useState(false);
  if (confirmEmail) {
    return (
      <div className="space-y-4" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Mail className="h-6 w-6" aria-hidden="true" /></span>
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="One last step: confirm your email" ru="Aakhri qadam: apna email confirm karein" /></h1>
        <p className="text-sm leading-6 text-slate-700"><T en="We sent a link to" ru="Humne link bheji hai" /> <b>{confirmEmail}</b>.</p>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] leading-6 text-slate-700">
          <li><T en="Open the email (check your spam or promotions folder too)." ru="Email kholein (spam ya promotions folder bhi dekhein)." /></li>
          <li><T en="Tap the button in it — it brings you straight back here to start your assessment." ru="Us mein diye button par tap karein — wo aap ko seedha yahan wapis lata hai assessment shuru karne ke liye." /></li>
          <li><T en="If the link opens on another device or the homepage, come back and use “Sign in”." ru="Agar link kisi aur device ya homepage par khule to wapis aa kar “Sign in” karein." /></li>
        </ol>
        {resent ? <p className="text-[13px] font-semibold text-teal-800"><T en="Sent again — please check your inbox." ru="Dobara bhej di — inbox dekhein." /></p> : (
          <button type="button" disabled={pending} className="text-[13px] font-bold text-teal-700 underline" onClick={() => start(async () => { const fd = new FormData(); fd.set("email", confirmEmail); await resendConfirmationAction(fd); setResent(true); })}><T en="I did not get it — send again" ru="Nahi mili — dobara bhejein" /></button>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/rehabverse/login" className="rv-btn rv-btn-primary"><T en="I confirmed — sign in" ru="Confirm kar liya — sign in" /> <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setConfirmEmail(null)}><T en="Wrong email? Go back" ru="Email ghalat hai? Wapis" /></button>
        </div>
      </div>
    );
  }
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        form.set("preferred_language", lang);
        setError(null);
        start(async () => {
          const result = await registerAction(form);
          if (!result.ok) return setError(result.error);
          if (result.needsEmailConfirmation) return setConfirmEmail(String(form.get("email")));
          router.push("/rehabverse/start");
          router.refresh();
        });
      }}
    >
      <div>
        <p className="rv-h"><T en="Step 1 of 3" ru="Qadam 1 / 3" /></p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-800"><T en="Create your RehabVerse account" ru="Apna RehabVerse account banayein" /></h1>
        <p className="mt-1 text-sm text-slate-600"><T en="Next: a short assessment. Then your physiotherapist builds your programme." ru="Phir: chhota sa assessment. Uske baad aap ke physiotherapist aap ka programme banate hain." /></p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="rv-label" htmlFor="full_name"><T en="Full name" ru="Poora naam" /></label>
          <input id="full_name" name="full_name" required minLength={2} maxLength={100} autoComplete="name" className="rv-input" />
        </div>
        <div>
          <label className="rv-label" htmlFor="age_years"><T en="Age (18 or older)" ru="Umar (18 ya zyada)" /></label>
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
          <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rv-input" />
          <p className="rv-hint"><T en="You will use it to sign in. We may send a confirmation link and programme updates (never your health details)." ru="Isi se sign in hoga. Hum confirmation link aur programme ke updates bhej sakte hain (aap ki sehat ki tafseel kabhi nahi)." /></p>
        </div>
        <div className="sm:col-span-2">
          <PasswordField id="password" label={<T en="Create a password" ru="Password banayein" />} value={password} onChange={setPassword} autoComplete="new-password" showRules email={email} minLength={10} />
        </div>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-[13px] leading-5 text-slate-700">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-teal-600" />
        <span>
          <T
            en="I am 18 or older. I understand RehabVerse supports physiotherapy but is not an emergency service or a replacement for an in-person assessment, and that the 3D guide is not a clinician. I agree that my answers and progress are stored securely and reviewed by my physiotherapist at Physio Nexus Academy, and that I may receive email updates about my programme."
            ru="Meri umar 18 saal ya zyada hai. Main samajhta/samajhti hoon ke RehabVerse physiotherapy ka saath deta hai lekin emergency service ya in-person assessment ka badal nahi, aur 3D guide clinician nahi. Main manta/manti hoon ke mere jawabat aur progress mehfooz store hote hain aur Physio Nexus Academy ke mere physiotherapist unhein dekhte hain, aur mujhe apne programme ke baare mein email updates mil sakte hain."
          />{" "}
          <Link href="/legal/privacy" className="font-bold text-teal-700 underline" target="_blank"><T en="Privacy policy" ru="Privacy policy" /></Link>
        </span>
      </label>
      {message ? <p className="rv-error" role="alert">{message}</p> : null}
      <button type="submit" disabled={pending} className="rv-btn rv-btn-primary w-full"><UserPlus className="h-4 w-4" aria-hidden="true" /> {pending ? (lang === "ru" ? "Account ban raha hai…" : "Creating your account…") : <T en="Create my account" ru="Mera account banayein" />}</button>
      <p className="text-center text-sm text-slate-600"><T en="Already registered?" ru="Pehle se registered hain?" /> <Link href="/rehabverse/login" className="font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Sign in" ru="Sign in" /></Link></p>
    </form>
  );
}

/** The page body for /rehabverse/register and /rehabverse/login: guidance beside a tabbed card. */
export function AuthShell({ mode, notice }: { mode: "register" | "login"; notice?: string }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="rv-glass order-1 space-y-5 p-5 sm:p-7 lg:order-2">
        <Tabs active={mode} />
        {mode === "register" ? <RegisterForm /> : <LoginForm notice={notice} />}
      </div>
      <div className="order-2 lg:order-1"><Guidance active={mode} /></div>
    </div>
  );
}

/* ───────────────────────── forgot / reset password ───────────────────────── */

export function ForgotForm() {
  const { lang, pending, start, setError, message } = useAuth();
  const [sent, setSent] = useState(false);
  return (
    <div className="rv-glass mx-auto w-full max-w-md space-y-4 p-5 sm:p-7">
      {sent ? (
        <div className="space-y-3" role="status">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Mail className="h-6 w-6" aria-hidden="true" /></span>
          <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Check your email" ru="Apna email dekhein" /></h1>
          <p className="text-sm leading-6 text-slate-700"><T en="If an account exists for that address, we sent a link to choose a new password. It works for a short time — check your spam folder too, and open it on this device." ru="Agar us address ka account hai to naya password chunne ki link bhej di gayi hai. Ye thori der ke liye chalti hai — spam folder bhi dekhein aur isi device par kholein." /></p>
          <Link href="/rehabverse/login" className="rv-btn rv-btn-ghost"><T en="Back to sign in" ru="Sign in par wapis" /></Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); setError(null); start(async () => { const r = await forgotPasswordAction(form); if (!r.ok) return setError(r.error); setSent(true); }); }}>
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy-800"><KeyRound className="mr-2 inline h-6 w-6 text-teal-600" aria-hidden="true" /><T en="Forgot your password?" ru="Password bhool gaye?" /></h1>
            <p className="mt-1 text-sm text-slate-600"><T en="Enter your email and we will send you a link to set a new one." ru="Apna email likhein, hum naya password set karne ki link bhej denge." /></p>
          </div>
          <div>
            <label className="rv-label" htmlFor="email"><T en="Email" ru="Email" /></label>
            <input id="email" name="email" type="email" required autoComplete="email" className="rv-input" />
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          {message ? <p className="rv-error" role="alert">{message}</p> : null}
          <button type="submit" disabled={pending} className="rv-btn rv-btn-primary w-full">{pending ? (lang === "ru" ? "Bhej rahe hain…" : "Sending…") : <T en="Send me the link" ru="Mujhe link bhejein" />}</button>
          <p className="text-center text-sm"><Link href="/rehabverse/login" className="font-bold text-teal-700 underline-offset-2 hover:underline"><T en="Back to sign in" ru="Sign in par wapis" /></Link></p>
        </form>
      )}
    </div>
  );
}

export function ResetForm() {
  const { lang, router, pending, start, setError, message } = useAuth();
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const mismatch = again.length > 0 && again !== password;
  return (
    <form
      className="rv-glass mx-auto w-full max-w-md space-y-4 p-5 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        if (mismatch) return;
        const form = new FormData(event.currentTarget);
        setError(null);
        start(async () => {
          const r = await updatePasswordAction(form);
          if (!r.ok) return setError(r.error);
          router.push("/rehabverse/me");
          router.refresh();
        });
      }}
    >
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Choose a new password" ru="Naya password chunein" /></h1>
        <p className="mt-1 text-sm text-slate-600"><T en="You are signed in through the email link. Pick a password you do not use elsewhere." ru="Aap email link se sign in hain. Aisa password chunein jo kahin aur istemal na hota ho." /></p>
      </div>
      <PasswordField id="password" label={<T en="New password" ru="Naya password" />} value={password} onChange={setPassword} autoComplete="new-password" showRules minLength={10} />
      <div>
        <label className="rv-label" htmlFor="again"><T en="Type it again" ru="Dobara likhein" /></label>
        <input id="again" type="password" required autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className="rv-input" aria-invalid={mismatch} />
        {mismatch ? <p className="rv-error"><T en="The two passwords do not match." ru="Dono password ek jaise nahi." /></p> : null}
      </div>
      {message ? <p className="rv-error" role="alert">{message}</p> : null}
      {message ? <Link href="/rehabverse/forgot" className="text-sm font-bold text-teal-700 underline"><T en="Ask for a new link" ru="Nayi link mangwayein" /></Link> : null}
      <button type="submit" disabled={pending || mismatch} className="rv-btn rv-btn-primary w-full">{pending ? (lang === "ru" ? "Save ho raha hai…" : "Saving…") : <T en="Save new password" ru="Naya password save karein" />}</button>
    </form>
  );
}
