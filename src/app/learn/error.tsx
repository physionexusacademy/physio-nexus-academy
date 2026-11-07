"use client";

import { useEffect, useState } from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { repairTeacherData } from "@/lib/teacher/progress";

const AUTO_REPAIR_KEY = "pna-teacher-auto-repair";

/**
 * PNA Teacher keeps progress in this browser. If anything saved there is
 * damaged, repair it and reopen automatically (once per tab session), so a
 * learner normally never sees an error. A manual path stays available.
 */
export default function LearnError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [repairing, setRepairing] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(AUTO_REPAIR_KEY)) return;
      window.sessionStorage.setItem(AUTO_REPAIR_KEY, "1");
    } catch {
      return;
    }
    repairTeacherData();
    reset();
  }, [reset]);

  const repair = () => {
    setRepairing(true);
    repairTeacherData();
    window.location.reload();
  };

  return (
    <div className="container-content py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_30px_70px_-50px_rgba(10,60,90,0.6)]">
        <span className="nx-icon-tile mx-auto"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
        <h1 className="mt-4 text-2xl font-bold text-navy-800">Let&apos;s fix your PNA Teacher progress</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Some learning progress saved on this device couldn&apos;t be read. Repairing keeps your lessons, flashcards and profile —
          only damaged entries are removed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={repair} disabled={repairing} className="nx-btn nx-btn-primary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {repairing ? "Repairing…" : "Repair and reopen"}
          </button>
          <a href="/" className="nx-btn nx-btn-light">Back to the lobby</a>
        </div>
      </div>
    </div>
  );
}
