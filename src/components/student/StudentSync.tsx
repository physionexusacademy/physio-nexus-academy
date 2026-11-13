"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { hasStudentSession, SESSION_EVENT, SYNCED_EVENT } from "@/lib/student/outbox";

// The sync code talks to Supabase, so it is loaded in the browser only and only for signed-in students (never in the worker).
const StudentSyncRunner = dynamic(() => import("./StudentSyncRunner"), { ssr: false });

/**
 * Rendered by the site header (a client component that is already on every page — a separate layout-level client
 * component would add an entry to every page's client manifest and grow the worker). For signed-in students it sends
 * queued activity to their PNA record and shows a small confirmation. For everyone else it does nothing and loads nothing.
 */
export function StudentSync() {
  const [toast, setToast] = useState<{ xp: number; sent: number } | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const check = () => setSignedIn(hasStudentSession());
    check();
    const onSynced = (event: Event) => {
      const detail = (event as CustomEvent<{ sent: number; xp: number }>).detail;
      setToast(detail);
      window.setTimeout(() => setToast(null), 3800);
    };
    window.addEventListener(SESSION_EVENT, check);
    window.addEventListener(SYNCED_EVENT, onSynced);
    return () => {
      window.removeEventListener(SESSION_EVENT, check);
      window.removeEventListener(SYNCED_EVENT, onSynced);
    };
  }, []);

  const savedToast = toast ? (
    <div role="status" className="fixed bottom-24 left-3 z-[95] flex max-w-[16rem] items-center gap-2.5 rounded-2xl border border-teal-300/40 bg-[#06182f]/95 px-3.5 py-2.5 text-sm text-white shadow-xl backdrop-blur sm:bottom-6">
      <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-teal-400 text-[#03202a]"><Check className="h-4 w-4" aria-hidden="true" /></span>
      <span><strong className="block text-[13px]">Saved to your PNA record</strong><small className="text-[11px] text-teal-100/80">{toast.xp > 0 ? `+${toast.xp} XP` : "Activity recorded"}</small></span>
    </div>
  ) : null;

  return (
    <>
      {signedIn ? <StudentSyncRunner /> : null}
      {savedToast ? createPortal(savedToast, document.body) : null}
    </>
  );
}
