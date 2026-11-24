"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Lock, Plus, Trash2 } from "lucide-react";
import { closeStudyAction, saveStudyAction, startRecruitingAction } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";
import { INSTRUMENTS } from "@/lib/outcomes/instruments";
import { DEFAULT_CONFIG, checkStudyConfig, strataOf, type EligibilityItem, type Region, type StudyConfig, type StudyOverview } from "@/lib/research-room";

const SOURCE_NOTE = { independent: "Prepared by an independent person", generated: "Generated here (placeholder: not independent)" } as const;

/** Study set-up: identity, ethics and registry numbers, the rules, the outcome plan. A draft can be edited; once recruiting starts the rules are frozen and hashed. */
export function StudySetup({ overview }: { overview: StudyOverview }) {
  const router = useRouter();
  const study = overview.study;
  const draft = !study || study.status === "draft";
  const [code, setCode] = useState(study?.code ?? "RV-AI-01");
  const [title, setTitle] = useState(study?.title ?? "AI-assisted versus standard telerehabilitation on the same therapist-led platform: a two-arm randomised controlled trial");
  const [version, setVersion] = useState(study?.version ?? "1.0");
  const [ethicsRef, setEthicsRef] = useState(study?.ethics_ref ?? "");
  const [ethicsDate, setEthicsDate] = useState(study?.ethics_date ?? "");
  const [registry, setRegistry] = useState(study?.registry_id ?? "");
  const [consentVersion, setConsentVersion] = useState(study?.consent_version ?? "");
  const [config, setConfig] = useState<StudyConfig>(study?.config ?? DEFAULT_CONFIG);
  const [cuts, setCuts] = useState((study?.config ?? DEFAULT_CONFIG).strata_cuts.join(", "));
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [closing, setClosing] = useState(false);
  const [closeReason, setCloseReason] = useState("");

  const effective: StudyConfig = { ...config, strata_cuts: cuts.split(",").map((s) => s.trim()).filter(Boolean).map(Number) };
  const problems = checkStudyConfig(effective);
  const bands = problems.length === 0 ? strataOf(effective) : [];
  const patch = (p: Partial<StudyConfig>) => setConfig((c) => ({ ...c, ...p }));
  const setItem = (i: number, p: Partial<EligibilityItem>) => patch({ eligibility: config.eligibility.map((e, j) => (j === i ? { ...e, ...p } : e)) });
  const toggleInstrument = (id: string, version: number) => {
    const has = config.outcome_plan.some((o) => o.instrument === id);
    const outcome_plan = has ? config.outcome_plan.filter((o) => o.instrument !== id) : [...config.outcome_plan, { instrument: id, version, schedule: "standard" as const }];
    patch({ outcome_plan, primary: outcome_plan.some((o) => o.instrument === config.primary.instrument) ? config.primary : { ...config.primary, instrument: outcome_plan[0]?.instrument ?? "" } });
  };
  const toggleRegion = (r: Region) => patch({ regions: config.regions.includes(r) ? config.regions.filter((x) => x !== r) : [...config.regions, r] });

  const save = () => start(async () => {
    setNote(null);
    const r = await saveStudyAction({ code, title, version, ethics_ref: ethicsRef, ethics_date: ethicsDate, registry_id: registry, consent_version: consentVersion, config: effective });
    if (r.ok) { setNote({ tone: "ok", text: "Saved." }); router.refresh(); } else setNote({ tone: "bad", text: r.error });
  });
  const begin = () => start(async () => {
    setNote(null);
    const r = await startRecruitingAction();
    if (r.ok) { setNote({ tone: "ok", text: "Recruiting has started. The rules are frozen." }); router.refresh(); } else setNote({ tone: "bad", text: r.error });
  });
  const close = () => start(async () => {
    const r = await closeStudyAction(closeReason);
    if (r.ok) { setClosing(false); router.refresh(); } else setNote({ tone: "bad", text: r.error });
  });

  const missing = [
    !study?.ethics_ref || !study?.ethics_date ? "ethics approval number and date" : null,
    !study?.consent_version ? "consent version" : null,
    !study?.sequence_source ? "allocation list" : null,
  ].filter(Boolean) as string[];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="rr-setup">
      <h2 id="rr-setup" className="flex flex-wrap items-center gap-2 font-heading text-base font-bold text-navy-800">
        <ClipboardCheck className="h-4 w-4 text-teal-600" aria-hidden="true" /> Study set-up
        {study ? <span className={"rv-chip " + (study.status === "recruiting" ? "rv-chip-teal" : study.status === "draft" ? "rv-chip-amber" : "")}>{study.status}</span> : null}
      </h2>

      {!draft && study ? (
        <div className="mt-2 space-y-1 text-[13.5px] text-slate-700">
          <p className="flex items-center gap-1.5 font-bold text-navy-800"><Lock className="h-4 w-4" aria-hidden="true" /> {study.code} · version {study.version} · rules are frozen</p>
          <p>{study.title}</p>
          <p>Ethics: {study.ethics_ref} ({study.ethics_date}) · Registry: {study.registry_id ?? "not recorded"} · Consent version: {study.consent_version}</p>
          <p>Allocation list: {study.sequence_source ? SOURCE_NOTE[study.sequence_source] : "none"}</p>
          <p className="break-all text-[12px] text-slate-500">Rules fingerprint (SHA-256): <span data-testid="study-hash">{study.frozen_hash}</span></p>
          <p>Primary outcome: <b>{study.config.primary.instrument.toUpperCase()}</b> at 12 weeks. Pain bands: {strataOf(study.config).join(", ")}. Regions: {study.config.regions.join(", ").replace("_", " ")}. Ages {study.config.age_min} to {study.config.age_max}.</p>
          {study.status === "recruiting" ? (
            closing ? (
              <div className="mt-2 space-y-2">
                <label className="rv-label" htmlFor="rr-close">Why is recruitment closing? (at least 10 characters)</label>
                <input id="rr-close" className="rv-input" value={closeReason} onChange={(e) => setCloseReason(e.target.value)} />
                <div className="flex gap-2"><button type="button" className="rv-btn rv-btn-danger" disabled={pending || closeReason.trim().length < 10} onClick={close}>Close the study</button><button type="button" className="rv-btn rv-btn-ghost" onClick={() => setClosing(false)}>Cancel</button></div>
              </div>
            ) : <button type="button" className="rv-btn rv-btn-ghost mt-2" onClick={() => setClosing(true)}>Close recruitment</button>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="rv-label" htmlFor="rr-code">Study code</label><input id="rr-code" className="rv-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></div>
            <div><label className="rv-label" htmlFor="rr-version">Protocol version</label><input id="rr-version" className="rv-input" value={version} onChange={(e) => setVersion(e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="rv-label" htmlFor="rr-title">Title</label><input id="rr-title" className="rv-input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className="rv-label" htmlFor="rr-eth">Ethics approval number</label><input id="rr-eth" className="rv-input" value={ethicsRef} onChange={(e) => setEthicsRef(e.target.value)} placeholder="From your ethics committee" /></div>
            <div><label className="rv-label" htmlFor="rr-ethd">Ethics approval date</label><input id="rr-ethd" type="date" className="rv-input" value={ethicsDate} onChange={(e) => setEthicsDate(e.target.value)} /></div>
            <div><label className="rv-label" htmlFor="rr-reg">Trial registration number</label><input id="rr-reg" className="rv-input" value={registry} onChange={(e) => setRegistry(e.target.value)} placeholder="Optional until registered" /></div>
            <div><label className="rv-label" htmlFor="rr-cons">Consent form version</label><input id="rr-cons" className="rv-input" value={consentVersion} onChange={(e) => setConsentVersion(e.target.value)} placeholder="e.g. C1 (the version your ethics committee approved)" /></div>
          </div>

          <fieldset className="grid gap-3 sm:grid-cols-4">
            <legend className="rv-label">Who can take part</legend>
            <div><label className="rv-label" htmlFor="rr-amin">Age from</label><input id="rr-amin" type="number" className="rv-input" value={config.age_min} onChange={(e) => patch({ age_min: Number(e.target.value) })} /></div>
            <div><label className="rv-label" htmlFor="rr-amax">Age to</label><input id="rr-amax" type="number" className="rv-input" value={config.age_max} onChange={(e) => patch({ age_max: Number(e.target.value) })} /></div>
            <div><label className="rv-label" htmlFor="rr-nprs">Lowest pain score (0–10)</label><input id="rr-nprs" type="number" className="rv-input" value={config.min_nprs} onChange={(e) => patch({ min_nprs: Number(e.target.value) })} /></div>
            <div><label className="rv-label" htmlFor="rr-cuts">Pain band cut points</label><input id="rr-cuts" className="rv-input" value={cuts} onChange={(e) => setCuts(e.target.value)} /></div>
            <div className="sm:col-span-4 flex flex-wrap gap-3 text-[13.5px]">
              {(["low_back", "neck"] as Region[]).map((r) => (
                <label key={r} className="flex items-center gap-1.5"><input type="checkbox" checked={config.regions.includes(r)} onChange={() => toggleRegion(r)} /> {r === "low_back" ? "Low back pain" : "Neck pain"}</label>
              ))}
              <span className="text-[12px] text-slate-500">The RMDQ-24 is a low back questionnaire: add neck pain only with a neck-specific primary measure.</span>
            </div>
            <p className="sm:col-span-4 text-[12.5px] text-slate-600">Randomisation groups (pain bands): <b>{bands.length ? bands.join(" · ") : "fix the rules to see them"}</b>. Each group has its own allocation list, so keep them few.</p>
            <div><label className="rv-label" htmlFor="rr-target">Target per arm</label><input id="rr-target" type="number" className="rv-input" value={config.target_per_arm} onChange={(e) => patch({ target_per_arm: Number(e.target.value) })} /></div>
          </fieldset>

          <fieldset>
            <legend className="rv-label">Eligibility questions (asked at enrolment)</legend>
            <ul className="mt-1 space-y-2">
              {config.eligibility.map((e, i) => (
                <li key={e.id} className="rounded-xl border border-slate-200 p-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <select aria-label="Kind" className="rv-input !w-auto" value={e.kind} onChange={(ev) => setItem(i, { kind: ev.target.value as "include" | "exclude" })}>
                      <option value="include">Must be yes</option><option value="exclude">Must be no</option>
                    </select>
                    <code className="text-[12px] text-slate-500">{e.id}</code>
                    <button type="button" className="rv-btn rv-btn-ghost ml-auto !min-h-[34px]" aria-label={`Remove ${e.id}`} onClick={() => patch({ eligibility: config.eligibility.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                  <input aria-label="English wording" className="rv-input mt-1.5" value={e.en} onChange={(ev) => setItem(i, { en: ev.target.value })} />
                  <input aria-label="Roman Urdu wording" className="rv-input mt-1.5" value={e.ru} onChange={(ev) => setItem(i, { ru: ev.target.value })} />
                </li>
              ))}
            </ul>
            <button type="button" className="rv-btn rv-btn-ghost mt-2" onClick={() => patch({ eligibility: [...config.eligibility, { id: `question_${config.eligibility.length + 1}`, kind: "exclude", en: "", ru: "" }] })}><Plus className="h-4 w-4" aria-hidden="true" /> Add a question</button>
          </fieldset>

          <fieldset>
            <legend className="rv-label">Outcome measures (the same for both arms)</legend>
            <ul className="mt-1 grid gap-1.5 sm:grid-cols-2">
              {INSTRUMENTS.map((inst) => {
                const on = config.outcome_plan.some((o) => o.instrument === inst.id);
                return (
                  <li key={inst.id} className={"rounded-xl border px-3 py-2 text-[13.5px] " + (on ? "border-teal-300 bg-teal-50" : "border-slate-200")}>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" checked={on} disabled={inst.status === "needs_permission" || inst.status === "needs_licence"} onChange={() => toggleInstrument(inst.id, inst.version)} />
                      <span><b>{inst.short}</b> <span className={"rv-chip " + (inst.status === "ready" ? "rv-chip-teal" : "rv-chip-amber")}>{inst.status.replace(/_/g, " ")}</span>
                        <span className="block text-[12px] text-slate-500">{inst.purpose.en}</span></span>
                    </label>
                    {on ? <label className="mt-1 flex items-center gap-1.5 text-[12.5px]"><input type="radio" name="primary" checked={config.primary.instrument === inst.id} onChange={() => patch({ primary: { instrument: inst.id, timepoint: "w12" } })} /> Primary outcome (12 weeks)</label> : null}
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="rv-label">Message to the patient when enrolled (leave empty for the standard wording; your ethics committee may require specific wording)</legend>
            <textarea aria-label="English message" className="rv-input" rows={3} value={config.notify.en} onChange={(e) => patch({ notify: { ...config.notify, en: e.target.value } })} />
            <textarea aria-label="Roman Urdu message" className="rv-input" rows={3} value={config.notify.ru} onChange={(e) => patch({ notify: { ...config.notify, ru: e.target.value } })} />
          </fieldset>

          {problems.length ? <ul className="rv-error list-disc pl-5" role="alert">{problems.map((p) => <li key={p}>{p}</li>)}</ul> : null}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="rv-btn rv-btn-primary" disabled={pending || problems.length > 0} onClick={save} data-testid="study-save">Save the draft</button>
            {study ? <button type="button" className="rv-btn rv-btn-ghost" disabled={pending || missing.length > 0} onClick={begin} data-testid="study-start">Start recruiting (freezes the rules)</button> : null}
            {study && missing.length ? <span className="text-[12.5px] text-slate-600">Still needed before recruiting: {missing.join(", ")}.</span> : null}
          </div>
        </div>
      )}
      {note ? <p className={"mt-2 text-[13px] font-bold " + (note.tone === "ok" ? "text-teal-700" : "text-rose-700")} role="status">{note.text}</p> : null}
    </section>
  );
}
