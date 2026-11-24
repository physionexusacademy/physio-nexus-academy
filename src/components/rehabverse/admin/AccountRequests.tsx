"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, Phone, UserCheck, X } from "lucide-react";
import { decideRegistrationAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { RegistrationDecision, RegistrationRequest } from "@/lib/rehabverse/api-types";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const digits = (phone: string | null) => (phone ?? "").replace(/\D/g, "").replace(/^0/, "92"); // Pakistani numbers: 03xx → 923xx for wa.me
const SITE = "https://physionexusacademy.com";

const approvedMessage = (name: string, lang: "en" | "ru") =>
  lang === "ru"
    ? `Assalam-o-alaikum ${name}, aap ka RehabVerse account approve ho gaya hai. Is link se sign in karein aur chhota sa symptom assessment shuru karein: ${SITE}/rehabverse/login`
    : `Hello ${name}, your RehabVerse account is approved. Sign in here and start the short symptom assessment: ${SITE}/rehabverse/login`;

/** New account requests: the clinic checks the person (phone or WhatsApp), then approves or rejects. Every decision goes to the audit log. */
export function AccountRequests({ pending, recent, studyRecruiting = false }: { pending: RegistrationRequest[]; recent: RegistrationDecision[]; studyRecruiting?: boolean }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState<{ id: string; name: string; phone: string | null; language: "en" | "ru" }[]>([]);

  const decide = (patient: RegistrationRequest, decision: "approve" | "reject") =>
    start(async () => {
      setError(null);
      const result = await decideRegistrationAction(patient.id, decision, decision === "reject" ? note : undefined);
      if (!result.ok) return setError(result.error);
      if (decision === "approve") setApproved((list) => [{ id: patient.id, name: result.fullName, phone: result.phone, language: result.language }, ...list]);
      setRejecting(null);
      setNote("");
      router.refresh();
    });

  return (
    <section className={"rounded-2xl border bg-white p-4 shadow-sm " + (pending.length ? "border-teal-300" : "border-slate-200")} aria-labelledby="account-requests">
      <h2 id="account-requests" className="flex items-center justify-between gap-2 font-heading text-base font-bold text-navy-800">
        <span className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-teal-600" aria-hidden="true" /> Account requests</span>
        <span className={"rv-chip " + (pending.length ? "rv-chip-teal" : "")}>{pending.length}</span>
      </h2>
      <p className="mt-1 text-[12.5px] text-slate-500">New accounts cannot do anything until you approve them. No confirmation email is sent: check the person by phone or WhatsApp, then approve.</p>
      {error ? <p className="rv-error mt-2" role="alert">Could not save the decision ({error}).</p> : null}

      {approved.length ? (
        <ul className="mt-2 space-y-1.5">
          {approved.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-[13.5px]">
              <span><b>{a.name}</b> is approved.</span>
              {digits(a.phone) ? (
                <a href={`https://wa.me/${digits(a.phone)}?text=${encodeURIComponent(approvedMessage(a.name, a.language))}`} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-ghost !min-h-[34px] !px-3"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Tell them on WhatsApp</a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-2 space-y-2">
        {pending.map((p) => (
          <li key={p.id} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[13.5px]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <b className="block text-navy-800">{p.full_name} <span className="font-normal text-slate-500">· {p.reference_code}</span></b>
                <span className="block text-[12.5px] text-slate-600">
                  {p.age_years} y{p.sex ? ` · ${p.sex}` : ""}{p.city ? ` · ${p.city}` : ""} · {p.preferred_language === "ru" ? "Roman Urdu" : "English"} · {dt(p.created_at)}
                </span>
                <span className="block text-[12.5px] text-slate-600">{p.phone ?? "no phone"}{p.email ? ` · ${p.email}` : ""}</span>
              </div>
              {digits(p.phone) ? (
                <span className="flex shrink-0 gap-1.5">
                  <a href={`tel:+${digits(p.phone)}`} className="rv-btn rv-btn-ghost !min-h-[34px] !px-2.5" aria-label={`Call ${p.full_name}`}><Phone className="h-4 w-4" aria-hidden="true" /></a>
                  <a href={`https://wa.me/${digits(p.phone)}`} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-ghost !min-h-[34px] !px-2.5" aria-label={`WhatsApp ${p.full_name}`}><MessageCircle className="h-4 w-4" aria-hidden="true" /></a>
                </span>
              ) : null}
            </div>
            {rejecting === p.id ? (
              <div className="mt-2 space-y-2">
                <label className="rv-label" htmlFor={`reject-${p.id}`}>Reason (the person reads it)</label>
                <textarea id={`reject-${p.id}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} className="rv-input" placeholder="For example: we could not reach you on this number" />
                <div className="flex gap-2">
                  <button type="button" disabled={busy || note.trim().length < 3} onClick={() => decide(p, "reject")} className="rv-btn rv-btn-primary !min-h-[38px] !bg-rose-600"><X className="h-4 w-4" aria-hidden="true" /> Reject</button>
                  <button type="button" disabled={busy} onClick={() => { setRejecting(null); setNote(""); }} className="rv-btn rv-btn-ghost !min-h-[38px]">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                {studyRecruiting ? (
                  <Link href="/admin/rehabverse/research-room" className="rv-btn rv-btn-primary !min-h-[38px]" data-testid="enrol-instead"><Check className="h-4 w-4" aria-hidden="true" /> Screen and enrol (a study is recruiting)</Link>
                ) : (
                  <button type="button" disabled={busy} onClick={() => decide(p, "approve")} className="rv-btn rv-btn-primary !min-h-[38px]"><Check className="h-4 w-4" aria-hidden="true" /> Approve</button>
                )}
                <button type="button" disabled={busy} onClick={() => { setRejecting(p.id); setNote(""); }} className="rv-btn rv-btn-ghost !min-h-[38px]"><X className="h-4 w-4" aria-hidden="true" /> Reject…</button>
              </div>
            )}
          </li>
        ))}
        {pending.length === 0 ? <li className="text-[13.5px] text-slate-500">No account is waiting.</li> : null}
      </ul>

      {recent.length ? (
        <details className="mt-3 text-[12.5px] text-slate-600">
          <summary className="cursor-pointer font-bold text-slate-700">Last decisions</summary>
          <ul className="mt-1.5 space-y-1">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{r.full_name} <span className="text-slate-400">· {r.reference_code}</span> — {r.status === "active" ? "approved" : r.status}{r.decision_note ? ` (${r.decision_note})` : ""}</span>
                <span className="text-slate-400">{dt(r.decided_at)}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
