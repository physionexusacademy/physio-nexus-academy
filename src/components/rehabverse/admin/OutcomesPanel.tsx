"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, FlaskConical, MessageSquareText, Sparkles } from "lucide-react";
import { polishOutcomeFeedbackAction, recordOutcomeAction, sendOutcomeFeedbackAction, setOutcomePlanAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { AdminOutcomes, OutcomePlanItem, OutcomeResponseRow } from "@/lib/rehabverse/api-types";
import { AVAILABLE_INSTRUMENTS, INSTRUMENTS, INSTRUMENT_BY_ID } from "@/lib/outcomes/instruments";
import { collectFacts, draftFeedback } from "@/lib/outcomes/feedback";
import { interpretChange, measureImprovement } from "@/lib/outcomes/interpret";
import { dueList, timepointsFor } from "@/lib/outcomes/plan";
import { SCHEDULES, TIMEPOINT_LABEL, type Instrument, type ScheduleKey, type TimepointKey } from "@/lib/outcomes/types";
import { INTAKE_REGIONS } from "@/lib/rehabverse/intake";
import { LineChart } from "../charts";
import { OutcomeForm } from "../OutcomeForm";

/** Which instruments suit which area (a starting suggestion: the physiotherapist chooses). */
const SUGGESTED: Record<string, string[]> = {
  cervical: ["nprs", "psfs", "groc", "neck_rom", "neck_endurance"],
  lumbar: ["nprs", "psfs", "groc", "back_function_tests"],
};
const BAND = {
  much_better: ["Much better", "bg-emerald-100 text-emerald-900"],
  better: ["Better", "bg-teal-100 text-teal-900"],
  no_important_change: ["No important change", "bg-slate-100 text-slate-700"],
  worse: ["Worse", "bg-amber-100 text-amber-900"],
  much_worse: ["Much worse", "bg-rose-100 text-rose-900"],
  not_comparable: ["", ""],
} as const;
const dt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function ScoreText({ instrument, row }: { instrument: Instrument; row: OutcomeResponseRow }) {
  const form = instrument.form;
  if (form.type === "measures") return <>{form.fields.filter((f) => row.score.parts[f.id] !== undefined).map((f) => `${f.label.en}: ${row.score.parts[f.id]} ${f.unit}`).join(" · ")}</>;
  if (form.type === "psfs") return <>{`${row.score.primary} (mean of ${(row.answers.activities as unknown[]).length})`}</>;
  if (form.type === "change") return <>{`${(row.score.primary ?? 0) > 0 ? "+" : ""}${row.score.primary}`}</>;
  if (form.type === "sbst") return <>{`${row.score.primary} of 9 · ${row.score.band} risk`}</>;
  if (form.type === "checklist") return <>{`${row.score.primary} of ${form.items.length}`}</>;
  return <>{`${row.score.primary}/10 (average over the week)`}</>;
}

function MeasureEntry({ instrument, onSave, pending, error }: { instrument: Instrument; onSave: (answers: unknown) => void; pending: boolean; error: string | null }) {
  const form = instrument.form;
  const [values, setValues] = useState<Record<string, string>>({});
  if (form.type !== "measures") return null;
  const answers = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim() !== "").map(([k, v]) => [k, Number(v)]));
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-[12.5px] leading-5 text-slate-600">{form.protocol.en}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {form.fields.map((f) => (
          <label key={f.id} className="text-[12.5px] font-bold text-slate-700">{f.label.en} ({f.unit})
            <input className="rv-input mt-1" inputMode="decimal" value={values[f.id] ?? ""} onChange={(e) => setValues((s) => ({ ...s, [f.id]: e.target.value }))} aria-label={`${f.label.en} (${f.unit})`} />
          </label>
        ))}
      </div>
      {error ? <p className="rv-error" role="alert">{error}</p> : null}
      <button type="button" className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]" disabled={pending || Object.keys(answers).length === 0} onClick={() => onSave(answers)}>Save measurement</button>
    </div>
  );
}

/**
 * Outcome measures for one patient: choose what to follow and how often, see every answer with its change from the start and the threshold it is read against,
 * and record the measurements taken in clinic. Records are never edited; a wrong entry is explained in the clinical notes, not rewritten.
 */
export function OutcomesPanel({ patientId, outcomes, regions, preferredLanguage = "en" }: { patientId: string; outcomes: AdminOutcomes; regions: string[]; preferredLanguage?: "en" | "ru" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(!outcomes.plan);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, ScheduleKey | null>>(() => Object.fromEntries((outcomes.plan?.items ?? []).map((i) => [i.instrument, i.schedule])));
  const [recording, setRecording] = useState<{ instrument: string; timepoint: TimepointKey } | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [fbLang, setFbLang] = useState<"en" | "ru">(preferredLanguage);
  const [fbText, setFbText] = useState("");
  const [fbSource, setFbSource] = useState<"rules" | "ai" | "written">("written");
  const [fbNote, setFbNote] = useState<string | null>(null);

  const suggestion = useMemo(() => [...new Set(regions.flatMap((r) => SUGGESTED[r] ?? []))], [regions]);
  const plan = outcomes.plan;
  const answered = useMemo(() => new Set(outcomes.responses.map((r) => `${r.instrument}:${r.timepoint}`)), [outcomes.responses]);
  const dueNow = useMemo(() => (plan ? dueList({ items: plan.items, anchor: new Date(plan.anchor_at) }, answered, new Date(), false) : []), [plan, answered]);

  const savePlan = () => {
    const items: OutcomePlanItem[] = Object.entries(chosen).filter(([, schedule]) => schedule).map(([instrument, schedule]) => ({ instrument, version: INSTRUMENT_BY_ID[instrument].version, schedule: schedule as ScheduleKey }));
    setMessage(null);
    start(async () => {
      const r = await setOutcomePlanAction(patientId, items, note);
      if (!r.ok) return setMessage(r.error);
      setMessage("Plan saved. The patient has been told.");
      setEditing(false);
      router.refresh();
    });
  };
  const record = (instrument: string, timepoint: TimepointKey, answers: unknown) => {
    setRecordError(null);
    start(async () => {
      const r = await recordOutcomeAction(patientId, { instrument, timepoint, answers, language: "en" });
      if (!r.ok) return setRecordError(r.error);
      setRecording(null);
      router.refresh();
    });
  };

  const facts = useMemo(() => (plan ? collectFacts({ items: plan.items, anchor: new Date(plan.anchor_at) }, outcomes.responses, new Date()) : null), [plan, outcomes.responses]);
  const makeDraft = () => {
    if (!facts) return;
    setFbText(draftFeedback(facts, fbLang));
    setFbSource("rules");
    setFbNote("Draft made from the stored scores by fixed rules. Read it, change anything, then send.");
  };
  const polish = () => {
    setFbNote(null);
    start(async () => {
      const r = await polishOutcomeFeedbackAction(fbText, fbLang);
      if (!r.ok) return setFbNote(r.error);
      setFbText(r.text);
      setFbSource("ai");
      setFbNote("Wording smoothed by an AI service (same numbers, nothing added). Read it before sending.");
    });
  };
  const sendFeedback = () => {
    setFbNote(null);
    start(async () => {
      const r = await sendOutcomeFeedbackAction(patientId, { message: fbText, language: fbLang, source: fbSource, basedOn: { instruments: plan?.items.map((i) => i.instrument) ?? [], answers: outcomes.responses.length } });
      if (!r.ok) return setFbNote(r.error);
      setFbText("");
      setFbSource("written");
      setFbNote("Sent. The patient has been told a message is waiting.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4" data-testid="outcomes-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13.5px] text-slate-600">
          {plan ? <>Following {plan.items.length} measure(s) since {dt(plan.anchor_at)}{outcomes.earlier_plans ? ` (${outcomes.earlier_plans} earlier plan${outcomes.earlier_plans > 1 ? "s" : ""} kept)` : ""}.</> : "No outcome measures chosen yet."}
          {dueNow.filter((d) => d.state !== "upcoming").length ? <b className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[12px] text-amber-900">{dueNow.filter((d) => d.state !== "upcoming").length} open</b> : null}
        </p>
        {plan && !editing ? <button type="button" className="rv-btn rv-btn-ghost !min-h-[36px] !text-[13px]" onClick={() => setEditing(true)}>Change plan</button> : null}
      </div>

      {editing ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3" data-testid="outcomes-plan-editor">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13.5px] font-bold text-navy-800"><ClipboardList className="mr-1 inline h-4 w-4 text-teal-600" aria-hidden="true" /> What do you want to follow for this patient?</p>
            {suggestion.length ? <button type="button" className="rv-btn rv-btn-ghost !min-h-[34px] !text-[12.5px]" onClick={() => setChosen((c) => ({ ...c, ...Object.fromEntries(suggestion.map((id) => [id, c[id] ?? "standard"])) }))}>Suggest for {regions.map((r) => INTAKE_REGIONS.find((o) => o.id === r)?.label.en).filter(Boolean).join(", ")}</button> : null}
          </div>
          <ul className="space-y-1.5">
            {AVAILABLE_INSTRUMENTS.map((ins) => {
              const schedule = chosen[ins.id] ?? null;
              return (
                <li key={ins.id} className={"rounded-xl border p-2.5 " + (schedule ? "border-teal-300 bg-white" : "border-slate-200 bg-white/70")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <label className="flex min-w-0 flex-1 items-start gap-2 text-[13.5px]">
                      <input type="checkbox" className="mt-1 h-4 w-4" checked={schedule !== null} onChange={(e) => setChosen((c) => ({ ...c, [ins.id]: e.target.checked ? "standard" : null }))} aria-label={ins.name.en} />
                      <span><b className="text-navy-800">{ins.name.en}</b> <span className="text-[11.5px] font-semibold text-slate-500">{ins.kind === "clinician_measured" ? "you measure" : "patient answers"}{ins.regions[0] !== "any" ? ` · ${ins.regions.map((r) => INTAKE_REGIONS.find((o) => o.id === r)?.label.en).join(", ")}` : ""}</span><span className="block text-[12.5px] leading-5 text-slate-600">{ins.purpose.en}</span></span>
                    </label>
                    {schedule ? (
                      <select className="rv-input !w-auto !py-1.5 text-[12.5px]" value={schedule} onChange={(e) => setChosen((c) => ({ ...c, [ins.id]: e.target.value as ScheduleKey }))} aria-label={`How often: ${ins.short}`}>
                        {(Object.keys(SCHEDULES) as ScheduleKey[]).map((k) => <option key={k} value={k}>{SCHEDULES[k].label.en}</option>)}
                      </select>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          <details className="rounded-xl border border-slate-200 bg-white/70 p-2.5">
            <summary className="cursor-pointer text-[12.5px] font-bold text-slate-600">Not available yet ({INSTRUMENTS.filter((i) => i.status !== "ready").length}) and why</summary>
            <ul className="mt-2 space-y-1.5 text-[12.5px] leading-5 text-slate-600">
              {INSTRUMENTS.filter((i) => i.status !== "ready").map((i) => <li key={i.id}><b className="text-slate-800">{i.name.en}</b> — {i.statusNote}</li>)}
            </ul>
          </details>
          <textarea className="rv-input" rows={2} maxLength={500} placeholder="Note for the record (optional): why these measures" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note for the record" />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]" disabled={pending || Object.values(chosen).every((v) => !v)} onClick={savePlan}>Save plan and tell the patient</button>
            {plan ? <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px] !text-[13px]" onClick={() => setEditing(false)}>Cancel</button> : null}
          </div>
          <p className="text-[12px] leading-5 text-slate-500">A new plan replaces the live one for new answers; every answer and earlier plan stays in the record.</p>
        </div>
      ) : null}
      {message ? <p className="text-[13px] font-semibold text-slate-700" role="status">{message}</p> : null}

      {plan && !editing ? plan.items.map((item) => {
        const ins = INSTRUMENT_BY_ID[item.instrument];
        if (!ins) return null;
        const rows = outcomes.responses.filter((r) => r.instrument === item.instrument);
        const baseline = rows.find((r) => r.timepoint === "baseline") ?? null;
        const points = [...new Set<TimepointKey>([...timepointsFor(item), ...rows.map((r) => r.timepoint)])];
        const series = ins.id === "nprs" ? rows : [];
        return (
          <section key={item.instrument} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3" aria-label={ins.name.en}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[14.5px] font-bold text-navy-800">{ins.name.en} <span className="text-[11.5px] font-semibold text-slate-500">· {SCHEDULES[item.schedule].label.en}</span></h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{ins.kind === "clinician_measured" ? "measured by you" : "patient-reported"}</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {points.map((tp) => {
                const row = rows.find((r) => r.timepoint === tp);
                const dueEntry = dueNow.find((d) => d.instrument === item.instrument && d.timepoint === tp);
                const change = row && baseline && row !== baseline && ins.kind === "patient_reported" ? interpretChange(ins, baseline.score, row.score) : row && ins.id === "groc" ? interpretChange(ins, null, row.score) : null;
                return (
                  <li key={tp} className="py-2 text-[13.5px] leading-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <b className="text-slate-800">{TIMEPOINT_LABEL[tp].en}</b>
                      {row ? <span className="text-[12px] text-slate-500">{dt(row.taken_at)} · {row.collected_by === "patient" ? "answered by the patient" : "recorded by you"} · {row.language === "ru" ? "Roman Urdu" : "English"}</span> : <span className={"text-[12px] font-bold " + (dueEntry?.state === "late" ? "text-amber-700" : dueEntry?.state === "due" ? "text-teal-700" : "text-slate-400")}>{dueEntry?.state === "late" ? "overdue" : dueEntry?.state === "due" ? "due now" : "not due yet"}</span>}
                    </div>
                    {row ? (
                      <div className="space-y-1">
                        <p className="text-slate-700"><ScoreText instrument={ins} row={row} /></p>
                        {change && change.band !== "not_comparable" ? <p><span className={"rounded-full px-2 py-0.5 text-[11.5px] font-extrabold " + BAND[change.band][1]}>{BAND[change.band][0]}</span> {change.improvement !== null ? <span className="text-[12.5px] text-slate-600">change {change.improvement > 0 ? "+" : ""}{change.improvement}{change.percent !== null ? ` (${change.percent > 0 ? "+" : ""}${change.percent}%)` : ""} from the start</span> : null} <span className="block text-[11.5px] leading-4 text-slate-500">{change.basis}</span></p> : null}
                        {ins.form.type === "measures" && baseline && row !== baseline ? (
                          <p className="text-[12.5px] text-slate-600">{ins.form.fields.filter((f) => row.score.parts[f.id] !== undefined && baseline.score.parts[f.id] !== undefined).map((f) => { const d = measureImprovement(f.better, baseline.score.parts[f.id], row.score.parts[f.id]); return `${f.label.en}: ${d > 0 ? "+" : ""}${d} ${f.unit} ${d > 0 ? "better" : d < 0 ? "worse" : "same"}`; }).join(" · ")}. No validated threshold is built in: judge clinically.</p>
                        ) : null}
                      </div>
                    ) : recording?.instrument === item.instrument && recording.timepoint === tp ? (
                      <div className="mt-1">
                        {ins.form.type === "measures" ? <MeasureEntry instrument={ins} onSave={(a) => record(item.instrument, tp, a)} pending={pending} error={recordError} /> : (
                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"><OutcomeForm instrument={ins} timepoint={tp} baselineActivities={ins.id === "psfs" && tp !== "baseline" ? ((baseline?.answers.activities as { name: string }[] | undefined) ?? []).map((a) => a.name) : undefined} onSubmit={(a) => record(item.instrument, tp, a)} pending={pending} error={recordError} /></div>
                        )}
                        <button type="button" className="mt-1 text-[12.5px] font-bold text-slate-500 hover:underline" onClick={() => setRecording(null)}>Cancel</button>
                      </div>
                    ) : (dueEntry && dueEntry.state !== "upcoming") || ins.kind === "clinician_measured" ? (
                      <button type="button" className="text-[12.5px] font-bold text-teal-700 hover:underline" onClick={() => { setRecording({ instrument: item.instrument, timepoint: tp }); setRecordError(null); }}>{ins.kind === "clinician_measured" ? "Record measurement" : "Record answers taken in clinic"}</button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {series.length >= 2 ? <div className="max-w-md"><LineChart title="Average pain over the week" labels={series.map((r) => TIMEPOINT_LABEL[r.timepoint].en)} series={[{ name: "NPRS (average)", colour: "#0db3aa", points: series.map((r) => r.score.primary) }]} height={150} /></div> : null}
            <details className="text-[11.5px] leading-4 text-slate-500"><summary className="cursor-pointer font-bold">Source and licence</summary><p className="mt-1">{ins.citation} {ins.licence} Version {ins.version}.{ins.translation === "assist_not_validated" ? " Roman Urdu is a help beside the English wording, not a validated translation." : ""}</p></details>
          </section>
        );
      }) : null}
      {plan && !editing ? (
        <section className="space-y-2 rounded-xl border border-teal-200 bg-teal-50/40 p-3" aria-label="Feedback to the patient" data-testid="outcomes-feedback">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-[14.5px] font-bold text-navy-800"><MessageSquareText className="h-4 w-4 text-teal-600" aria-hidden="true" /> Feedback to the patient</h3>
            <select className="rv-input !w-auto !py-1.5 text-[12.5px]" value={fbLang} onChange={(e) => setFbLang(e.target.value as "en" | "ru")} aria-label="Language of the message">
              <option value="en">English</option>
              <option value="ru">Roman Urdu</option>
            </select>
          </div>
          <p className="text-[12.5px] leading-5 text-slate-600">Draft a message from the results, change it as you like and send it. Nothing reaches the patient unless you send it.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rv-btn rv-btn-ghost !min-h-[36px] !text-[13px]" onClick={makeDraft} disabled={!facts}>Draft from the results</button>
            <button type="button" className="rv-btn rv-btn-ghost !min-h-[36px] !text-[13px]" onClick={polish} disabled={pending || fbText.trim().length < 20}><Sparkles className="h-4 w-4" aria-hidden="true" /> Smooth the wording with AI</button>
          </div>
          <textarea className="rv-input" rows={7} maxLength={1500} value={fbText} onChange={(e) => setFbText(e.target.value)} aria-label="Message to the patient" placeholder="Write a message, or draft one from the results." />
          {fbNote ? <p className="text-[12.5px] font-semibold text-slate-700" role="status">{fbNote}</p> : null}
          <button type="button" className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]" disabled={pending || fbText.trim().length < 10} onClick={sendFeedback}>Send to the patient</button>
          {facts && (facts.patient.length || facts.measures.length) ? (
            <details className="text-[12px] leading-5 text-slate-500"><summary className="cursor-pointer font-bold">What a draft is based on</summary>
              <ul className="mt-1 list-disc pl-5">
                {facts.patient.map((f) => <li key={f.instrument}>{f.name.en}: {f.first ?? "–"} → {f.last} ({f.band.replace(/_/g, " ")})</li>)}
                {facts.measures.map((m) => <li key={m.instrument + m.label.en}>{m.label.en}: {m.first} → {m.last} {m.unit}</li>)}
                <li>{facts.open} open questionnaire(s), {facts.late} late</li>
              </ul>
            </details>
          ) : null}
          {(outcomes.feedback ?? []).length ? (
            <details className="text-[12.5px]"><summary className="cursor-pointer font-bold text-slate-600">Messages already sent ({outcomes.feedback?.length})</summary>
              <ul className="mt-1 space-y-2">{(outcomes.feedback ?? []).map((f) => <li key={f.id ?? f.sent_at} className="rounded-lg bg-white p-2"><span className="text-[11.5px] text-slate-500">{dt(f.sent_at)} · {f.language === "ru" ? "Roman Urdu" : "English"} · started as {f.source === "ai" ? "an AI-smoothed draft" : f.source === "rules" ? "a rules draft" : "written by you"}</span><span className="mt-0.5 block whitespace-pre-line text-slate-700">{f.message}</span></li>)}</ul>
            </details>
          ) : null}
        </section>
      ) : null}
      <p className="text-[11.5px] text-slate-500"><FlaskConical className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Thresholds are guides from the published literature, shown with their source, and never a verdict. Answers are stored with the instrument version, the language shown and who collected them, and cannot be edited.</p>
    </div>
  );
}
