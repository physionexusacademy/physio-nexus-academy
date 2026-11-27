"use client";

import { useEffect, useState, useTransition } from "react";
import { EyeOff, UserMinus, UserPlus } from "lucide-react";
import { assessorsAction, setAssessorAction, type StudyAssessor } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";

/**
 * Name the study's blinded outcome assessor (phase 2). The person makes an ordinary account first; a clinic admin or a patient cannot be named (the database
 * refuses), because an admin can see the groups. The assessor works at /rehabverse/assessor and never sees the arm.
 */
export function AssessorPanel() {
  const [list, setList] = useState<StudyAssessor[] | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const load = () => assessorsAction().then((r) => setList(r.ok ? r.assessors : []));
  useEffect(() => { void load(); }, []);
  const change = (address: string, active: boolean) => {
    setError(null);
    start(async () => {
      const r = await setAssessorAction(address, active);
      if (!r.ok) return setError(r.error);
      setEmail("");
      await load();
    });
  };
  return (
    <section className="rv-glass p-5" aria-labelledby="rr-assessor-h">
      <h2 id="rr-assessor-h" className="flex items-center gap-2 font-heading text-lg font-bold text-navy-800"><EyeOff className="h-5 w-5 text-teal-600" aria-hidden="true" /> Blinded outcome assessor</h2>
      <p className="mt-1 text-[13.5px] leading-6 text-slate-600">
        A person who is not a clinic admin collects the outcome questionnaires by phone or in person, without knowing the groups. They sign in and open
        <b> /rehabverse/assessor</b>, which shows participants by code only. Ask them to make an ordinary account first, then add their e-mail here.
      </p>
      <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); if (email.trim()) change(email, true); }}>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="assessor@example.com" className="rv-input min-w-0 flex-1" aria-label="Assessor's e-mail" />
        <button type="submit" className="rv-btn rv-btn-primary" disabled={pending}><UserPlus className="h-4 w-4" aria-hidden="true" /> Add assessor</button>
      </form>
      {error ? <p className="rv-error mt-2" role="alert">{error}</p> : null}
      <ul className="mt-3 space-y-1.5">
        {list === null ? <li className="text-sm text-slate-500">Loading…</li> : null}
        {list?.length === 0 ? <li className="text-sm text-slate-500">No assessor yet.</li> : null}
        {list?.map((a) => (
          <li key={a.user_id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <span><b className="text-navy-800">{a.email}</b> <span className={a.active ? "text-teal-700" : "text-slate-500"}>· {a.active ? "active" : "removed"}</span></span>
            <button type="button" className="inline-flex items-center gap-1 font-bold text-teal-700" disabled={pending} onClick={() => change(a.email, !a.active)}>
              {a.active ? <><UserMinus className="h-4 w-4" aria-hidden="true" /> Remove</> : <><UserPlus className="h-4 w-4" aria-hidden="true" /> Add again</>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
