"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardCheck, FileClock, ShieldAlert } from "lucide-react";
import { logAdverseEventAction, setAssessmentStatusAction, updateAdverseEventAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { AdminAssessment, AdminPatient } from "@/lib/rehabverse/api-types";
import { INTAKE_DURATION, INTAKE_REGIONS, INTAKE_SYMPTOMS, flagLabel } from "@/lib/rehabverse/intake";
import { ProgrammeBuilder } from "./ProgrammeBuilder";
import { SessionReview } from "./SessionReview";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const label = (opts: { id: string; label: { en: string } }[], id: string) => opts.find((o) => o.id === id)?.label.en ?? id;
const LIVE = ["draft", "active", "paused"];

function Section({ title, children, id, aside }: { title: string; children: React.ReactNode; id?: string; aside?: React.ReactNode }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-heading text-lg font-bold text-navy-800">{title}</h2>{aside}</div>
      {children}
    </section>
  );
}

function Field({ k, v }: { k: string; v?: string | null }) {
  if (!v) return null;
  return <div><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{k}</dt><dd className="text-[14px] leading-6 text-slate-800">{v}</dd></div>;
}

function AssessmentPanel({ a }: { a: AdminAssessment }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const flagged = a.red_flag_ids.length > 0;
  const set = (status: "in_review" | "cleared_for_programme" | "closed" | "needs_clinical_assessment") =>
    start(async () => {
      const r = await setAssessmentStatusAction(a.id, status, note);
      setResult(r.ok ? "Updated." : r.error === "a clinical clearance note is required" ? "A clearance note (10+ characters) is required." : `Could not update (${r.error}).`);
      if (r.ok) { setNote(""); router.refresh(); }
    });
  return (
    <div className="space-y-4">
      {flagged ? (
        <div className={"rounded-xl border p-3 " + (a.red_flag_level === "emergency" ? "border-rose-300 bg-rose-50 text-rose-950" : "border-amber-300 bg-amber-50 text-amber-950")} role="alert">
          <p className="flex items-center gap-2 font-bold"><ShieldAlert className="h-5 w-5" aria-hidden="true" /> Red-flag screening: {a.red_flag_level.toUpperCase()} — no exercise programme should start until a clinical assessment has been done.</p>
          <ul className="mt-1 list-disc pl-6 text-[13.5px]">{a.red_flag_ids.map((f) => <li key={f}>{flagLabel(f)?.en ?? f}</li>)}</ul>
        </div>
      ) : <p className="rounded-xl bg-teal-50 px-3 py-2 text-[13px] font-semibold text-teal-900">No red flags reported on the screening questions.</p>}
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field k="Submitted" v={dt(a.submitted_at)} />
        <Field k="Status" v={a.status.replace(/_/g, " ")} />
        <Field k="Areas" v={a.regions.map((r) => label(INTAKE_REGIONS, r)).join(", ")} />
        <Field k="Symptoms" v={a.symptoms.map((s) => label(INTAKE_SYMPTOMS, s)).join(", ")} />
        <Field k="Pain (NPRS) now / worst / best" v={`${a.pain_now} / ${a.pain_worst ?? "–"} / ${a.pain_best ?? "–"}`} />
        <Field k="Duration" v={a.duration ? label(INTAKE_DURATION, a.duration) : null} />
        <Field k="Onset" v={a.onset} />
        <Field k="Possible cause" v={a.possible_cause} />
        <Field k="Aggravating" v={a.aggravating} />
        <Field k="Relieving" v={a.relieving} />
        <Field k="Functional limitations" v={a.functional_limitations} />
        <Field k="Previous treatment" v={a.previous_treatment} />
        <Field k="Medical conditions" v={a.medical_conditions} />
        <Field k="Medications" v={a.medications} />
        <Field k="Other symptoms" v={a.other_symptoms} />
        <div className="sm:col-span-2"><Field k="In the patient's own words" v={a.own_words} /></div>
        <Field k="Clearance note" v={a.clearance_note} />
        <Field k="Admin notes" v={a.admin_notes} />
      </dl>
      {["submitted", "in_review", "needs_clinical_assessment", "cleared_for_programme"].includes(a.status) ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <textarea className="rv-input" rows={2} placeholder={flagged ? "Clinical note (required to clear a flagged assessment: what you assessed and why exercise is appropriate)" : "Note (required to clear for a programme: 10+ characters)"} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} aria-label="Clinical note" />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px] !text-[13px]" disabled={pending} onClick={() => set("in_review")}>Mark in review</button>
            <button type="button" className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]" disabled={pending || note.trim().length < 10} onClick={() => set("cleared_for_programme")}><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Clear for programme</button>
            <button type="button" className="rv-btn rv-btn-danger !min-h-[38px] !text-[13px]" disabled={pending} onClick={() => set("needs_clinical_assessment")}>Needs clinical assessment</button>
            <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px] !text-[13px]" disabled={pending} onClick={() => set("closed")}>Close</button>
          </div>
          {result ? <p className="text-[13px] font-semibold text-slate-700" role="status">{result}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function AdverseEvents({ patient }: { patient: AdminPatient }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [description, setDescription] = useState("");
  const [action, setAction] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {patient.adverse_events.map((e) => (
          <li key={e.id} className="rounded-xl border border-slate-200 p-3 text-[13.5px] leading-6">
            <p className="flex flex-wrap items-center gap-2"><span className={"rv-chip " + (e.severity === "severe" ? "rv-chip-rose" : e.severity === "moderate" ? "rv-chip-amber" : "")}>{e.severity}</span><span className="rv-chip">{e.status}</span><span className="text-slate-500">{e.source} · {dt(e.created_at)}</span></p>
            <p className="mt-1 text-slate-800">{e.description}</p>
            {e.action_taken ? <p className="text-slate-600">Action: {e.action_taken}</p> : null}
            {e.status !== "closed" ? (
              <div className="mt-1.5 flex gap-2">
                {e.status === "open" ? <button type="button" className="rv-pill" disabled={pending} onClick={() => start(async () => { await updateAdverseEventAction(e.id, "reviewed", ""); router.refresh(); })}>Mark reviewed</button> : null}
                <button type="button" className="rv-pill" disabled={pending} onClick={() => start(async () => { await updateAdverseEventAction(e.id, "closed", ""); router.refresh(); })}>Close</button>
              </div>
            ) : null}
          </li>
        ))}
        {patient.adverse_events.length === 0 ? <li className="text-[13.5px] text-slate-500">No adverse events recorded.</li> : null}
      </ul>
      <details className="rounded-xl border border-slate-200 p-3">
        <summary className="cursor-pointer text-[13px] font-bold text-navy-800">Record an adverse event</summary>
        <div className="mt-2 space-y-2">
          <select className="rv-input" value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)} aria-label="Severity"><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select>
          <textarea className="rv-input" rows={2} placeholder="What happened?" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={3000} aria-label="Description" />
          <textarea className="rv-input" rows={2} placeholder="Action taken" value={action} onChange={(e) => setAction(e.target.value)} maxLength={3000} aria-label="Action taken" />
          {msg ? <p className="text-[13px] font-semibold text-slate-700" role="status">{msg}</p> : null}
          <button type="button" className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]" disabled={pending || description.trim().length < 5} onClick={() => start(async () => {
            const r = await logAdverseEventAction(patient.patient.id, null, severity, description, action);
            setMsg(r.ok ? "Recorded." : `Could not record (${r.error}).`);
            if (r.ok) { setDescription(""); setAction(""); router.refresh(); }
          })}>Record event</button>
        </div>
      </details>
    </div>
  );
}

export function AdminPatientRecord({ data }: { data: AdminPatient }) {
  const { patient, assessments, programmes, adverse_events, audit } = data;
  const live = programmes.find((p) => LIVE.includes(p.programme.status));
  const latest = assessments[0];
  const openAdverse = adverse_events.filter((e) => e.status === "open").length;
  const canCreate = !!latest && !live && ["submitted", "in_review", "cleared_for_programme"].includes(latest.status);
  const shown = live ?? programmes[0];

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="rv-h">{patient.reference_code}</p>
            <h1 className="font-heading text-2xl font-bold text-navy-800">{patient.full_name}</h1>
            <p className="mt-1 text-[13.5px] text-slate-600">{patient.age_years} years{patient.sex ? ` · ${patient.sex.replace(/_/g, " ")}` : ""}{patient.city ? ` · ${patient.city}` : ""} · prefers {patient.preferred_language === "ru" ? "Roman Urdu" : "English"}</p>
            <p className="text-[13px] text-slate-500">{patient.email}{patient.phone ? ` · ${patient.phone}` : ""} · joined {dt(patient.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {shown ? <span className="rv-chip rv-chip-navy">programme: {shown.programme.status}</span> : <span className="rv-chip">no programme</span>}
            {openAdverse ? <span className="rv-chip rv-chip-rose">{openAdverse} open adverse event(s)</span> : null}
          </div>
        </div>
        <nav className="mt-3 flex flex-wrap gap-1.5 text-[12.5px] font-bold" aria-label="Sections">
          {[["#assessment", "Assessment"], ["#programme", "Programme"], ["#days", "Days & review"], ["#events", "Adverse events"], ["#audit", "Audit trail"]].map(([h, t]) => <a key={h} href={h} className="rv-pill">{t}</a>)}
        </nav>
      </header>

      <Section id="assessment" title="Initial assessment" aside={latest ? <span className="rv-chip">{latest.status.replace(/_/g, " ")}</span> : null}>
        {latest ? <AssessmentPanel a={latest} /> : <p className="text-[13.5px] text-slate-500">No assessment submitted yet.</p>}
        {assessments.length > 1 ? (
          <details className="mt-3 text-[13px]"><summary className="cursor-pointer font-bold text-slate-600">Earlier assessments ({assessments.length - 1})</summary>
            <ul className="mt-2 space-y-1">{assessments.slice(1).map((a) => <li key={a.id}>{dt(a.submitted_at)} — {a.status.replace(/_/g, " ")} · {a.regions.map((r) => label(INTAKE_REGIONS, r)).join(", ")} · NPRS {a.pain_now}</li>)}</ul>
          </details>
        ) : null}
      </Section>

      <Section id="programme" title={live ? "Programme" : "Build a programme"}>
        <ProgrammeBuilder
          key={live?.programme.id ?? latest?.id ?? "new"}
          assessmentId={latest?.id ?? null}
          programme={live ?? undefined}
          assessmentRegions={latest?.regions ?? []}
          canCreate={canCreate}
          patientName={patient.full_name}
        />
      </Section>

      <Section id="days" title="Days, feedback & review">
        {shown && shown.sessions.length ? (
          <div className="space-y-2.5">
            {shown.sessions.map((s, i) => <SessionReview key={s.session.id} bundle={s} previous={shown.sessions.slice(0, i)} programmeStatus={shown.programme.status} />)}
          </div>
        ) : <p className="text-[13.5px] text-slate-500">No days yet.</p>}
        {programmes.length > 1 ? <p className="mt-3 text-[12.5px] text-slate-500">{programmes.length - 1} earlier programme(s) are kept in the audit trail.</p> : null}
      </Section>

      <Section id="events" title="Adverse events" aside={openAdverse ? <span className="rv-chip rv-chip-rose"><AlertTriangle className="mr-1 h-3 w-3" /> {openAdverse} open</span> : null}>
        <AdverseEvents patient={data} />
      </Section>

      <Section id="audit" title="Audit trail" aside={<FileClock className="h-4 w-4 text-slate-400" aria-hidden="true" />}>
        <ol className="max-h-80 space-y-1 overflow-y-auto text-[12.5px] leading-5 text-slate-700">
          {audit.map((l) => <li key={l.id}><span className="text-slate-400">{dt(l.at)}</span> · <b>{l.action.replace(/_/g, " ")}</b> <span className="text-slate-500">({l.entity}{l.actor_role ? `, ${l.actor_role}` : ""})</span>{l.details && Object.keys(l.details).length ? <span className="text-slate-500"> — {JSON.stringify(l.details).slice(0, 140)}</span> : null}</li>)}
          {audit.length === 0 ? <li className="text-slate-500">Nothing recorded yet.</li> : null}
        </ol>
        <p className="mt-2 text-[11.5px] text-slate-500">The audit trail is append-only: entries cannot be edited or deleted.</p>
      </Section>
    </div>
  );
}
