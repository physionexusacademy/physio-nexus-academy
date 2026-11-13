"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { flushStudentOutbox, OUTBOX_EVENT, SESSION_EVENT, SYNCED_EVENT } from "@/lib/student/outbox";

/**
 * Rendered by the site header (a client component that is already on every page — a separate layout-level client
 * component would add an entry to every page's client manifest and grow the worker). For signed-in students it sends
 * queued activity to their PNA record and shows a small confirmation. For everyone else it does nothing and loads nothing.
 */
export function StudentSync() {
  const [toast, setToast] = useState<{ xp: number; sent: number } | null>(null);

  useEffect(() => {
    const run = () => void flushStudentOutbox(); // a no-op unless a student is signed in and something is queued
    run();
    const onSynced = (event: Event) => {
      const detail = (event as CustomEvent<{ sent: number; xp: number }>).detail;
      setToast(detail);
      window.setTimeout(() => setToast(null), 3800);
    };
    window.addEventListener(OUTBOX_EVENT, run);
    window.addEventListener(SESSION_EVENT, run);
    window.addEventListener("online", run);
    window.addEventListener(SYNCED_EVENT, onSynced);
    return () => {
      window.removeEventListener(OUTBOX_EVENT, run);
      window.removeEventListener(SESSION_EVENT, run);
      window.removeEventListener("online", run);
      window.removeEventListener(SYNCED_EVENT, onSynced);
    };
  }, []);

  if (!toast) return null;
  return createPortal(
    <div role="status" className="fixed bottom-24 left-3 z-[95] flex max-w-[16rem] items-center gap-2.5 rounded-2xl border border-teal-300/40 bg-[#06182f]/95 px-3.5 py-2.5 text-sm text-white shadow-xl backdrop-blur sm:bottom-6">
      <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-teal-400 text-[#03202a]"><Check className="h-4 w-4" aria-hidden="true" /></span>
      <span><strong className="block text-[13px]">Saved to your PNA record</strong><small className="text-[11px] text-teal-100/80">{toast.xp > 0 ? `+${toast.xp} XP` : "Activity recorded"}</small></span>
    </div>,
    document.body,
  );
}
