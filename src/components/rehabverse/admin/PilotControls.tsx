"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAiPilotAction } from "@/app/admin/(dashboard)/rehabverse/actions";

/**
 * The pilot limit and "open to all patients". While the pilot runs only that many patients can have AI switched on (the database refuses one more).
 * Opening AI to everyone is allowed only after a sign-off of "approved" for the CURRENT version of the review pack; the database checks that too.
 */
export function PilotControls({ maxPatients, openToAll, canOpen, enabled }: { maxPatients: number; openToAll: boolean; canOpen: boolean; enabled: number }) {
  const router = useRouter();
  const [limit, setLimit] = useState(String(maxPatients));
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = (open: boolean) =>
    start(async () => {
      setMessage(null);
      const n = Number(limit);
      if (!Number.isInteger(n) || n < 1 || n > 500) return setMessage({ ok: false, text: "The limit must be a whole number from 1 to 500." });
      const result = await setAiPilotAction({ maxPatients: n, openToAll: open });
      if (!result.ok) return setMessage({ ok: false, text: result.error === "signoff_required" ? "Opening AI to everyone needs an 'approved' sign-off for the current version of the review pack." : "Could not save. Please try again." });
      setMessage({ ok: true, text: open ? "AI is now open to all patients (you still switch it on for each patient)." : "Saved." });
      router.refresh();
    });

  return (
    <div className="space-y-3" data-ai-pilot-controls>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-[13px] font-bold text-navy-800">
          Pilot limit (patients with AI on)
          <input type="number" min={1} max={500} value={limit} onChange={(e) => setLimit(e.target.value)} className="rv-input mt-1 w-32" aria-label="Pilot limit" disabled={pending} />
        </label>
        <button type="button" className="rv-btn rv-btn-primary" disabled={pending} onClick={() => save(openToAll)}>Save limit</button>
        {openToAll ? (
          <button type="button" className="rv-btn rv-btn-ghost" disabled={pending} onClick={() => save(false)}>Back to the pilot limit</button>
        ) : (
          <button type="button" className="rv-btn rv-btn-ghost" disabled={pending || !canOpen} onClick={() => save(true)} title={canOpen ? "" : "Needs an approved sign-off for the current review pack"}>Open to all patients</button>
        )}
      </div>
      <p className="text-[12.5px] leading-5 text-slate-600">
        {enabled} patient{enabled === 1 ? " has" : "s have"} AI on now. Lowering the limit never switches anyone off; it only stops one more being added. {openToAll ? "AI is open to all patients: the limit does not apply, and you still decide patient by patient." : canOpen ? "The review pack is signed off as approved, so you can open AI to all patients." : "To open AI to all patients, review the pack and sign it off as approved first."}
      </p>
      {message ? <p className={"text-[13px] font-bold " + (message.ok ? "text-teal-800" : "text-rose-700")} role={message.ok ? "status" : "alert"}>{message.text}</p> : null}
    </div>
  );
}
