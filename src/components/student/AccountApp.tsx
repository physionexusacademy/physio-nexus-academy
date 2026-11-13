"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Activity, ArrowRight, BarChart3, LoaderCircle, LockKeyhole, Radar, Smartphone, Sparkles } from "lucide-react";
import { AccountLink, AccountNavContext, type AccountMode, type AccountNavApi } from "@/components/student/AccountNav";
import { hasStudentSession, SESSION_EVENT } from "@/lib/student/outbox";

/**
 * One route (/account) for everything a student does with their account, so the site ships a single
 * page instead of six. The server-rendered landing page is the default view; ?m=login|register|forgot|reset
 * shows a form; and a signed-in student sees their My PNA record instead of the landing page.
 *
 * The forms and the dashboard talk to Supabase, so they are loaded in the browser only (ssr: false), exactly like the
 * RehabVerse "Loader" screens. That keeps the Supabase client out of the Cloudflare worker (it is ~85 KiB gzip there).
 */
const modes: AccountMode[] = ["login", "register", "forgot", "reset"];

const screenLoading = (
  <div className="mp-state" role="status" aria-busy="true"><LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /> Opening…</div>
);
const AccountForm = dynamic(() => import("./AccountForms").then((m) => m.AccountForm), { ssr: false, loading: () => screenLoading });
const MyPna = dynamic(() => import("./MyPna").then((m) => m.MyPna), { ssr: false, loading: () => screenLoading });

const features = [
  { icon: Activity, title: "Every activity recorded", text: "Lessons, skill levels, virtual patients and daily challenges are saved the moment you finish them, with XP and scores." },
  { icon: Sparkles, title: "PNA notices for you", text: "See your strongest area, the skill you have neglected, your week against last week and your next best step." },
  { icon: Radar, title: "Your learning balance", text: "A live map of how you split your time between learning, practising, examining and testing yourself." },
  { icon: BarChart3, title: "Streaks and levels", text: "A five-week activity map, your streak and your level from New Student to Clinical Legend." },
  { icon: Smartphone, title: "Every device", text: "Start on your phone, continue on a laptop. Progress you already made on this device is brought over." },
  { icon: LockKeyhole, title: "Private by design", text: "Only you can see your record. Download it or delete it whenever you like." },
];

/** The landing page. It is part of this client component (and still server-rendered, so it is indexed) so the route needs one client boundary, not several. */
function Landing() {
  return (
    <main className="acct-page">
      <section className="acct-hero nx-sky nx-grid">
        <div className="container-content">
          <p className="acct-kicker"><Sparkles className="h-4 w-4" aria-hidden="true" /> Student account · free</p>
          <h1>Your personal PNA.</h1>
          <p className="acct-lead">Every lesson, skill, patient and challenge you finish is recorded in your own private record — so PNA can show your strengths, your gaps and your next best step.</p>
          <div className="acct-cta">
            <AccountLink mode="register" className="nx-btn nx-btn-primary">Create your free account <ArrowRight className="h-4 w-4" aria-hidden="true" /></AccountLink>
            <AccountLink mode="login" className="nx-btn nx-btn-ghost">Sign in</AccountLink>
          </div>
        </div>
      </section>
      <section className="container-content acct-features" aria-label="What you get">
        <ul>
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title}><span><Icon className="h-5 w-5" aria-hidden="true" /></span><strong>{title}</strong><p>{text}</p></li>
          ))}
        </ul>
        <p className="acct-fine">Free for every student and physiotherapist. No payment details. Patients using RehabVerse sign in separately — your clinical information is never mixed with your learning record.</p>
      </section>
    </main>
  );
}

const bannerText: Record<string, string> = { deleted: "Your PNA record has been deleted. Your learning on this device is unchanged." };

export function AccountApp() {
  const [view, setView] = useState<{ mode: AccountMode; signedIn: boolean; notice: string } | null>(null);

  const read = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("m") as AccountMode | null;
    setView({ mode: m && modes.includes(m) ? m : "landing", signedIn: hasStudentSession(), notice: params.get("notice") ?? "" });
    window.dispatchEvent(new Event(SESSION_EVENT));
  }, []);

  useEffect(() => {
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [read]);

  const nav = useMemo<AccountNavApi>(() => ({
    go: (mode, notice) => {
      const query = [mode === "landing" ? "" : `m=${mode}`, notice ? `notice=${notice}` : ""].filter(Boolean).join("&");
      window.history.pushState(null, "", `/account${query ? `?${query}` : ""}`);
      window.scrollTo(0, 0);
      read();
    },
    done: () => {
      window.history.replaceState(null, "", "/account");
      window.scrollTo(0, 0);
      read();
    },
  }), [read]);

  let body: ReactNode = <Landing />; // before the browser has checked who is here, show the server-rendered landing page
  if (view) {
    if (view.mode === "reset") {
      body = <main className="acct-page acct-center"><div className="container-content"><AccountForm key="reset" mode="reset" /></div></main>;
    } else if (view.signedIn) {
      body = <main className="acct-page"><div className="container-content"><MyPna /></div></main>;
    } else if (view.mode !== "landing") {
      body = <main className="acct-page acct-center"><div className="container-content"><AccountForm key={view.mode} mode={view.mode} /></div></main>;
    } else if (bannerText[view.notice]) {
      body = <><div className="container-content"><p className="acct-notice acct-banner" role="status">{bannerText[view.notice]}</p></div><Landing /></>;
    }
  }
  return <AccountNavContext.Provider value={nav}>{body}</AccountNavContext.Provider>;
}
