"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, LoaderCircle, LogIn } from "lucide-react";
import { hasStudentSession, SESSION_EVENT } from "@/lib/student/outbox";
import { useLang } from "@/lib/lang";

/**
 * The /leagues page body. Visitors see an invitation and never load the Supabase client;
 * signed-in students get their league (loaded in the browser only, like the rest of My PNA).
 */
const loading = <div className="lg lg-state" role="status" aria-busy="true"><LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /> Opening…</div>;
const LeaguePanel = dynamic(() => import("./LeaguePanel").then((m) => m.LeaguePanel), { ssr: false, loading: () => loading });

export function LeagueGate() {
  const [lang] = useLang();
  const ur = lang === "ur";
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const read = () => setSignedIn(hasStudentSession());
    read();
    window.addEventListener(SESSION_EVENT, read);
    return () => window.removeEventListener(SESSION_EVENT, read);
  }, []);

  if (signedIn === null) return loading;
  if (signedIn) return <LeaguePanel />;
  return (
    <section className="lgp-invite" aria-label="Join a league">
      <h2>{ur ? "League join karne ke liye free account banayein" : "Create a free account to join a league"}</h2>
      <p>{ur ? "Aap ki har activity — lesson, skill, patient, daily challenge — XP ban kar is hafte ki league mein ginti hai. Account free hai aur sirf aap ka record rakhta hai." : "Every lesson, skill, patient and daily challenge you finish becomes XP in this week's league. The account is free and keeps a private record only you can see."}</p>
      <div className="lgp-cta">
        <Link href="/account?m=register" className="nx-btn nx-btn-primary">{ur ? "Free account banayein" : "Create your free account"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        <Link href="/account?m=login" className="nx-btn nx-btn-ghost"><LogIn className="h-4 w-4" aria-hidden="true" /> {ur ? "Sign in" : "Sign in"}</Link>
      </div>
    </section>
  );
}
