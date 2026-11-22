"use client";

import { useState, useTransition } from "react";
import { FlaskConical } from "lucide-react";
import { setResearchConsentAction } from "@/app/admin/(dashboard)/rehabverse/actions";

const dt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * Research consent is recorded by the physiotherapist, on the patient's record, after the patient agreed in person or on paper. Registration consent is for
 * the service and is not research consent. A patient is in the de-identified research record only while this is on. Recording and withdrawing are both in the audit log.
 */
export function ResearchConsent({ patientId, consent, at, note: savedNote }: { patientId: string; consent: boolean; at: string | null; note: string | null }) {
  const [on, setOn] = useState(consent);
  const [when, setWhen] = useState(at);
  const [how, setHow] = useState(savedNote ?? "");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const record = () => {
    setMessage(null);
    if (draft.trim().length < 5) { setMessage("Write how consent was obtained (a few words), for example “signed form, 12 Dec”."); return; }
    start(async () => {
      const r = await setResearchConsentAction(patientId, true, draft);
      if (r.ok) { setOn(true); setWhen(new Date().toISOString()); setHow(draft.trim().slice(0, 300)); setDraft(""); } else setMessage("Could not save. Try again.");
    });
  };
  const withdraw = () => {
    setMessage(null);
    start(async () => {
      const r = await setResearchConsentAction(patientId, false);
      if (r.ok) { setOn(false); setWhen(null); setMessage("Withdrawn. This patient is no longer in the research record."); } else setMessage("Could not save. Try again.");
    });
  };

  return (
    <div data-testid="research-consent">
      <p className="flex items-center gap-2 text-[13.5px] text-slate-700">
        <FlaskConical className="h-4 w-4 text-teal-600" aria-hidden="true" />
        {on ? <span><b data-testid="research-state">Research consent recorded</b>{when ? ` on ${dt(when)}` : ""}{how ? ` — ${how}` : ""}.</span> : <span data-testid="research-state">No research consent recorded. This patient is not in the research record.</span>}
      </p>
      {on ? (
        <button type="button" onClick={withdraw} disabled={pending} className="rv-btn rv-btn-ghost mt-2 !min-h-[40px]" data-testid="research-withdraw">Withdraw research consent</button>
      ) : (
        <div className="mt-2 space-y-2">
          <label className="block text-[12.5px] font-bold text-slate-600" htmlFor="research-note">How was research consent obtained?</label>
          <input id="research-note" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300} placeholder="e.g. signed form, 12 Dec" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[14px]" />
          <button type="button" onClick={record} disabled={pending} className="rv-btn rv-btn-primary !min-h-[40px]" data-testid="research-record">Record research consent</button>
          <p className="text-[12px] leading-5 text-slate-500">Only after the patient has agreed to research use, in person or on paper, with wording approved by an ethics committee. Registration consent is not research consent.</p>
        </div>
      )}
      {message ? <p className="mt-2 text-[12.5px] font-semibold text-slate-600" role="status">{message}</p> : null}
    </div>
  );
}
