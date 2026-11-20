"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAiPilotAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import { PILOT_NO_LIMIT, isNoLimit } from "@/lib/rehabverse/ai/pilot-limit";

/**
 * The pilot limit and "open to all patients". By default there is NO limit (research needs more than a handful of patients); the limit is an
 * optional safety valve: when one is set, the database refuses one more patient once it is reached.
 * Opening AI to everyone is allowed only after a sign-off of "approved" for the CURRENT version of the review pack; the database checks that too.
 */
export function PilotControls({ maxPatients, openToAll, canOpen, enabled }: { maxPatients: number; openToAll: boolean; canOpen: boolean; enabled: number }) {
  const router = useRouter();
  const [noLimit, setNoLimit] = useState(isNoLimit(maxPatients));
  const [limit, setLimit] = useState(isNoLimit(maxPatients) ? "25" : String(maxPatients));
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = (open: boolean) =>
    start(async () => {
      setMessage(null);
      const n = noLimit ? PILOT_NO_LIMIT : Number(limit);
      if (!noLimit && (!Number.isInteger(n) || n < 1 || n >= PILOT_NO_LIMIT)) return setMessage({ ok: false, text: "The limit must be a whole number from 1 to 99,999." });
      const result = await setAiPilotAction({ maxPatients: n, openToAll: open });
      if (!result.ok) return setMessage({ ok: false, text: result.error === "signoff_required" ? "Opening AI to everyone needs an 'approved' sign-off for the current version of the review pack." : "Could not save. Please try again." });
      setMessage({ ok: true, text: open ? "AI is now open to all patients (you still switch it on for each patient)." : "Saved." });
      router.refresh();
    });

  return (
    <div className="space-y-3" data-ai-pilot-controls>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex items-center gap-2 text-[13px] font-bold text-navy-800">
          <input type="checkbox" checked={noLimit} onChange={(e) => setNoLimit(e.target.checked)} disabled={pending} aria-label="No limit" data-pilot-nolimit />
          No limit on patients
        </label>
        <label className="text-[13px] font-bold text-navy-800">
          Limit (patients with AI on)
          <input type="number" min={1} max={PILOT_NO_LIMIT - 1} value={limit} onChange={(e) => setLimit(e.target.value)} className="rv-input mt-1 w-32 disabled:opacity-50" aria-label="Pilot limit" disabled={pending || noLimit} />
        </label>
        <button type="button" className="rv-btn rv-btn-primary" disabled={pending} onClick={() => save(openToAll)}>Save</button>
        {openToAll ? (
          <button type="button" className="rv-btn rv-btn-ghost" disabled={pending} onClick={() => save(false)}>Back to the pilot limit</button>
        ) : (
          <button type="button" className="rv-btn rv-btn-ghost" disabled={pending || !canOpen} onClick={() => save(true)} title={canOpen ? "" : "Needs an approved sign-off for the current review pack"}>Open to all patients</button>
        )}
      </div>
      <p className="text-[12.5px] leading-5 text-slate-600">
        {enabled} patient{enabled === 1 ? " has" : "s have"} AI on now. {noLimit ? "There is no limit: you can switch AI on for as many patients as the research needs, one patient at a time." : "Lowering the limit never switches anyone off; it only stops one more being added."} {openToAll ? "AI is open to all patients, and you still decide patient by patient." : canOpen ? "The review pack is signed off as approved, so you can open AI to all patients." : "To open AI to all patients, review the pack and sign it off as approved first."}
      </p>
      {message ? <p className={"text-[13px] font-bold " + (message.ok ? "text-teal-800" : "text-rose-700")} role={message.ok ? "status" : "alert"}>{message.text}</p> : null}
    </div>
  );
}
