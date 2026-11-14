"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { hasStudentSession } from "@/lib/student/outbox";

/**
 * What follows a finished challenge: for signed-in students the weekly league and the reminder switch (both load Supabase,
 * so only in the browser); for everyone else an invitation. Visitors never load the Supabase client from here.
 */
const LeaguePanel = dynamic(() => import("@/components/student/LeaguePanel").then((m) => m.LeaguePanel), { ssr: false });
const ReminderCard = dynamic(() => import("./ReminderCard").then((m) => m.ReminderCard), { ssr: false });

export function ResultExtras({ xp }: { xp: number }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => { setSignedIn(hasStudentSession()); }, []);
  if (signedIn === null) return null;
  if (!signedIn) {
    return (
      <div className="dc-extras dc-join">
        <p className="dc-join-title"><Sparkles className="h-4 w-4" aria-hidden="true" /> Make every challenge count</p>
        <p>A free PNA account keeps your XP, joins you to a <b>weekly league</b> (Bronze to Diamond) and can e-mail you a <b>daily reminder</b> so you never miss a mission.</p>
        <div className="dc-join-cta">
          <Link href="/account?m=register" className="dc-primary">Create free account <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          <Link href="/leagues" className="dc-secondary">See how leagues work</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="dc-extras">
      <p className="dc-xp-chip"><Zap className="h-4 w-4" aria-hidden="true" /> +{xp} XP is being added to your PNA record</p>
      <LeaguePanel compact />
      <ReminderCard />
    </div>
  );
}
