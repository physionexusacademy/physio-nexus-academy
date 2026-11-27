"use client";

import { useState, useTransition } from "react";
import { ShieldAlert } from "lucide-react";
import { saveSafetyReportAction, type SafetyReport } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";

const CRITERIA: [string, string][] = [["death", "Death"], ["life_threatening", "Life-threatening"], ["hospitalisation", "Hospital admission or longer stay"], ["disability", "Lasting disability"], ["other_important", "Other important medical event"]];
const RELATED: [string, string][] = [["unrelated", "Unrelated"], ["unlikely", "Unlikely"], ["possible", "Possible"], ["probable", "Probable"], ["definite", "Definite"]];
const OUTCOME: [string, string][] = [["recovering", "Recovering"], ["recovered", "Recovered"], ["recovered_with_sequelae", "Recovered with lasting effects"], ["not_recovered", "Not recovered"], ["fatal", "Fatal"], ["unknown", "Unknown"]];
const localDateTime = (iso?: string) => { const d = iso ? new Date(iso) : new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

/**
 * Research Room phase 3: the trial safety assessment of one adverse event. Each save is a new version (nothing is edited); the database works out the deadline
 * for reporting a serious event to the ethics committee (7 or 15 days from when the team first knew).
 */
export function SafetyReportForm({ eventId, eventDate, reports, onSaved }: { eventId: string; eventDate: string; reports: SafetyReport[]; onSaved: () => void }) {
  const latest = reports.filter((r) => r.adverse_event_id === eventId).sort((a, b) => b.version - a.version)[0];
  const [open, setOpen] = useState(false);
  const [criteria, setCriteria] = useState<string[]>(latest?.criteria ?? []);
  const [relatedness, setRelatedness] = useState(latest?.relatedness ?? "");
  const [expectedness, setExpectedness] = useState(latest?.expectedness ?? "");
  const [outcome, setOutcome] = useState(latest?.outcome ?? "");
  const [onset, setOnset] = useState(latest?.onset_date ?? eventDate.slice(0, 10));
  const [aware, setAware] = useState(localDateTime(latest?.aware_at ?? eventDate));
  const [reported, setReported] = useState(latest?.ethics_reported_at ? localDateTime(latest.ethics_reported_at) : "");
  const [ethicsRef, setEthicsRef] = useState(latest?.ethics_ref ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ready = relatedness && expectedness && outcome && onset && aware;
  const save = () => {
    setError(null);
    start(async () => {
      const r = await saveSafetyReportAction(eventId, {
        criteria, relatedness, expectedness, outcome, onset_date: onset, aware_at: new Date(aware).toISOString(),
        ethics_reported_at: reported ? new Date(reported).toISOString() : undefined, ethics_ref: ethicsRef || undefined, note: note || undefined,
      });
      if (!r.ok) return setError(r.error);
      setOpen(false); setNote("");
      onSaved();
    });
  };
  const overdue = latest?.report_due_at && !latest.ethics_reported_at && new Date(latest.report_due_at) < new Date();
  return (
    <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-[13px]" data-rv-safety={eventId}>
      {latest ? (
        <p className="flex flex-wrap items-center gap-2">
          <ShieldAlert className={"h-4 w-4 " + (latest.serious ? "text-red-600" : "text-slate-500")} aria-hidden="true" />
          <b>{latest.serious ? "Serious" : "Not serious"}</b> · {latest.relatedness} · {latest.expectedness} · {latest.outcome.replace(/_/g, " ")} · v{latest.version}
          {latest.report_due_at ? <span className={overdue ? "font-bold text-red-700" : "text-amber-800"}>{latest.ethics_reported_at ? `reported to ethics ${new Date(latest.ethics_reported_at).toLocaleDateString()}` : `report to ethics by ${new Date(latest.report_due_at).toLocaleDateString()}${overdue ? " (overdue)" : ""}`}</span> : null}
        </p>
      ) : <p className="text-slate-600">No trial safety assessment yet.</p>}
      <button type="button" className="rv-pill mt-1.5" onClick={() => setOpen(!open)} aria-expanded={open}>{latest ? "Add a follow-up assessment" : "Assess for the trial"}</button>
      {open ? (
        <div className="mt-2 space-y-2">
          <fieldset><legend className="font-bold text-navy-800">Serious because of (leave empty if not serious)</legend>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{CRITERIA.map(([k, l]) => (
              <label key={k} className="inline-flex items-center gap-1.5"><input type="checkbox" checked={criteria.includes(k)} onChange={(e) => setCriteria((c) => (e.target.checked ? [...c, k] : c.filter((x) => x !== k)))} /> {l}</label>
            ))}</div>
          </fieldset>
          <div className="grid gap-2 sm:grid-cols-3">
            <label>Related to the intervention<select className="rv-input mt-1" value={relatedness} onChange={(e) => setRelatedness(e.target.value)}><option value="">Choose…</option>{RELATED.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
            <label>Expected?<select className="rv-input mt-1" value={expectedness} onChange={(e) => setExpectedness(e.target.value)}><option value="">Choose…</option><option value="expected">Expected</option><option value="unexpected">Unexpected</option></select></label>
            <label>Outcome<select className="rv-input mt-1" value={outcome} onChange={(e) => setOutcome(e.target.value)}><option value="">Choose…</option>{OUTCOME.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
            <label>Began on<input type="date" className="rv-input mt-1" value={onset} onChange={(e) => setOnset(e.target.value)} /></label>
            <label>Team first aware<input type="datetime-local" className="rv-input mt-1" value={aware} onChange={(e) => setAware(e.target.value)} /></label>
            <label>Reported to ethics (if done)<input type="datetime-local" className="rv-input mt-1" value={reported} onChange={(e) => setReported(e.target.value)} /></label>
          </div>
          <input className="rv-input" placeholder="Ethics report reference (optional)" value={ethicsRef} onChange={(e) => setEthicsRef(e.target.value)} maxLength={120} />
          <textarea className="rv-input" rows={2} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
          {error ? <p className="rv-error" role="alert">{error}</p> : null}
          <button type="button" className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]" disabled={!ready || pending} onClick={save}>Save assessment</button>
        </div>
      ) : null}
    </div>
  );
}
