"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, UserPlus } from "lucide-react";
import { decideRegistrationAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import { enrolAction, screenOutAction, type EnrolResult } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";
import { reasonLabel, type ConsentMethod, type QueueEntry, type StudyConfig } from "@/lib/research-room";

const SITE = "https://physionexusacademy.com";
const digits = (phone: string | null) => (phone ?? "").replace(/\D/g, "").replace(/^0/, "92");
const message = (name: string, lang: "en" | "ru") =>
  lang === "ru"
    ? `Assalam-o-alaikum ${name}, aap ka RehabVerse account approve ho gaya hai. Is link se sign in karein: ${SITE}/rehabverse/login`
    : `Hello ${name}, your RehabVerse account is approved. Sign in here: ${SITE}/rehabverse/login`;
const METHODS: { id: ConsentMethod; label: string }[] = [
  { id: "in_person_written", label: "Signed form, in person" },
  { id: "remote_recorded", label: "Agreed remotely and recorded (call or message)" },
  { id: "verbal_witnessed", label: "Verbal, with a witness" },
];
const localNow = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

function Person({ p, config, consentVersion }: { p: QueueEntry; config: StudyConfig; consentVersion: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState(config.regions[0]);
  const [nprs, setNprs] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [given, setGiven] = useState(false);
  const [method, setMethod] = useState<ConsentMethod>("in_person_written");
  const [obtainedAt, setObtainedAt] = useState(localNow());
  const [witness, setWitness] = useState("");
  const [consentNote, setConsentNote] = useState("");
  const [result, setResult] = useState<EnrolResult | null>(null);

  const complete = nprs !== null && config.eligibility.every((e) => e.id in answers) && given && (method !== "verbal_witnessed" || witness.trim().length >= 2);
  const refresh = () => router.refresh();

  const enrol = () => start(async () => {
    setError(null);
    const r = await enrolAction(p.id, { region, nprs: nprs ?? 0, answers }, { given, method, version: consentVersion, obtained_at: new Date(obtainedAt).toISOString(), witness: witness.trim() || undefined, note: consentNote.trim() || undefined });
    if (!r.ok) return setError(r.error);
    setResult(r.result);
    refresh();
  });
  const out = (outcome: "excluded" | "declined", reason: string) => start(async () => {
    setError(null);
    const r = await screenOutAction(p.id, outcome, [reason], "");
    if (r.ok) { setOpen(false); refresh(); } else setError(r.error);
  });
  const ordinary = () => start(async () => {
    const r = await decideRegistrationAction(p.id, "approve");
    if (r.ok) refresh(); else setError(r.error);
  });

  return (
    <li className="rounded-xl border border-slate-200 px-3 py-2.5 text-[13.5px]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <b className="block text-navy-800">{p.full_name} <span className="font-normal text-slate-500">· {p.reference_code}</span></b>
          <span className="block text-[12.5px] text-slate-600">{p.age_years} y{p.sex ? ` · ${p.sex}` : ""}{p.city ? ` · ${p.city}` : ""} · {p.phone ?? "no phone"} · {p.preferred_language === "ru" ? "Roman Urdu" : "English"}</span>
        </div>
        {p.screened === null && !result ? (
          <button type="button" className="rv-btn rv-btn-primary !min-h-[38px]" onClick={() => setOpen((o) => !o)} aria-expanded={open}><UserPlus className="h-4 w-4" aria-hidden="true" /> {open ? "Close" : "Screen and enrol"}</button>
        ) : p.screened && p.screened !== "eligible" ? (
          <span className="flex flex-wrap items-center gap-2"><span className="rv-chip rv-chip-amber">{p.screened === "declined" ? "declined the study" : "not in the study"}</span>
            <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px]" disabled={pending} onClick={ordinary}>Approve as an ordinary patient</button></span>
        ) : null}
      </div>

      {result ? (
        <div className="mt-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2" role="status" data-testid="enrol-result">
          {result.enrolled ? (
            <>
              <p><b>{result.full_name}</b> is enrolled and approved. Allocation: <b>{result.arm === "ai" ? "AI-assisted arm" : "standard (no AI) arm"}</b> (pain band {result.stratum}).</p>
              {digits(result.phone) ? <a href={`https://wa.me/${digits(result.phone)}?text=${encodeURIComponent(message(result.full_name, result.preferred_language))}`} target="_blank" rel="noopener noreferrer" className="rv-btn rv-btn-ghost mt-1 !min-h-[34px] !px-3"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Tell them on WhatsApp</a> : null}
            </>
          ) : (
            <p>Not eligible: {result.reasons.map((r) => reasonLabel(r, config)).join("; ")}. Logged. You can approve them as an ordinary patient.</p>
          )}
        </div>
      ) : null}

      {open && p.screened === null && !result ? (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="rv-label">Baseline</legend>
            <div>
              <label className="rv-label" htmlFor={`reg-${p.id}`}>Where is the main pain?</label>
              <select id={`reg-${p.id}`} className="rv-input" value={region} onChange={(e) => setRegion(e.target.value as typeof region)}>
                <option value="low_back">Low back</option><option value="neck">Neck</option>
              </select>
            </div>
            <div>
              <span className="rv-label">Pain now, 0 to 10 (ask the patient)</span>
              <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Pain now">
                {Array.from({ length: 11 }, (_, n) => (
                  <button key={n} type="button" role="radio" aria-checked={nprs === n} onClick={() => setNprs(n)} className={"rv-pill !min-w-[40px] !min-h-[40px] " + (nprs === n ? "rv-pill-on" : "")}>{n}</button>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="rv-label">Eligibility (answer every question)</legend>
            <ul className="space-y-1.5">
              {config.eligibility.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
                  <span className="min-w-0 flex-1 text-[13px]">{e.en}</span>
                  <span className="flex gap-1" role="radiogroup" aria-label={e.en}>
                    {[true, false].map((v) => (
                      <button key={String(v)} type="button" role="radio" aria-checked={answers[e.id] === v} onClick={() => setAnswers((a) => ({ ...a, [e.id]: v }))} className={"rv-pill !min-h-[38px] " + (answers[e.id] === v ? "rv-pill-on" : "")}>{v ? "Yes" : "No"}</button>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="rv-label">Consent (version {consentVersion})</legend>
            <label className="sm:col-span-2 flex items-start gap-2 text-[13.5px]"><input type="checkbox" className="mt-1" checked={given} onChange={(e) => setGiven(e.target.checked)} /> The person has read the information sheet, had the chance to ask questions, and agreed to take part, including being randomly assigned to a version of the platform.</label>
            <div><label className="rv-label" htmlFor={`m-${p.id}`}>How was consent obtained?</label>
              <select id={`m-${p.id}`} className="rv-input" value={method} onChange={(e) => setMethod(e.target.value as ConsentMethod)}>{METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
            <div><label className="rv-label" htmlFor={`t-${p.id}`}>When?</label><input id={`t-${p.id}`} type="datetime-local" className="rv-input" value={obtainedAt} onChange={(e) => setObtainedAt(e.target.value)} /></div>
            {method === "verbal_witnessed" ? <div><label className="rv-label" htmlFor={`w-${p.id}`}>Witness name</label><input id={`w-${p.id}`} className="rv-input" value={witness} onChange={(e) => setWitness(e.target.value)} /></div> : null}
            <div className={method === "verbal_witnessed" ? "" : "sm:col-span-2"}><label className="rv-label" htmlFor={`n-${p.id}`}>Note (optional)</label><input id={`n-${p.id}`} className="rv-input" value={consentNote} onChange={(e) => setConsentNote(e.target.value)} /></div>
          </fieldset>

          {error ? <p className="rv-error" role="alert">Could not enrol ({error}).</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rv-btn rv-btn-primary" disabled={!complete || pending} onClick={enrol} data-testid="enrol-go">Enrol and randomise</button>
            <button type="button" className="rv-btn rv-btn-ghost" disabled={pending} onClick={() => out("declined", "declined")}>They declined</button>
            <button type="button" className="rv-btn rv-btn-ghost" disabled={pending} onClick={() => out("excluded", "clinical_judgement")}>Not suitable (my judgement)</button>
          </div>
          <p className="text-[12px] text-slate-500">You do not choose the arm. It comes from the hidden allocation list when you press the button, and approval, the AI setting and the questionnaires follow together. This cannot be undone.</p>
        </div>
      ) : null}
      {error && !open ? <p className="rv-error mt-1" role="alert">{error}</p> : null}
    </li>
  );
}

/** Accounts waiting for the clinic while a study is recruiting: screened and enrolled here instead of a plain approval. */
export function EnrolPanel({ waiting, config, consentVersion }: { waiting: QueueEntry[]; config: StudyConfig; consentVersion: string }) {
  return (
    <section className={"rounded-2xl border bg-white p-4 shadow-sm " + (waiting.length ? "border-teal-300" : "border-slate-200")} aria-labelledby="rr-enrol">
      <h2 id="rr-enrol" className="flex items-center justify-between gap-2 font-heading text-base font-bold text-navy-800"><span className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-teal-600" aria-hidden="true" /> Enrolment</span><span className={"rv-chip " + (waiting.length ? "rv-chip-teal" : "")}>{waiting.length}</span></h2>
      <p className="mt-1 text-[12.5px] text-slate-500">New account requests. Check the person by phone first, then screen, record consent and enrol. Only enrolment can approve a study participant.</p>
      {waiting.length ? <ul className="mt-2 space-y-2">{waiting.map((p) => <Person key={p.id} p={p} config={config} consentVersion={consentVersion} />)}</ul> : <p className="mt-2 text-[13.5px] text-slate-500">Nobody is waiting.</p>}
    </section>
  );
}
