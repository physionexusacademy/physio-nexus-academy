"use client";

import type { FormEvent } from "react";

type Props = {
  busy: boolean;
  // Initial assessment
  assessSubjective: string; setAssessSubjective: (v: string) => void;
  assessObjective: string; setAssessObjective: (v: string) => void;
  assessPainScore: string; setAssessPainScore: (v: string) => void;
  assessImpression: string; setAssessImpression: (v: string) => void;
  assessGoals: string; setAssessGoals: (v: string) => void;
  onSaveAssessment: (e: FormEvent) => void;
  // Follow-up / session
  followUpDate: string; setFollowUpDate: (v: string) => void;
  followUpSubjective: string; setFollowUpSubjective: (v: string) => void;
  followUpObjective: string; setFollowUpObjective: (v: string) => void;
  followUpPainScore: string; setFollowUpPainScore: (v: string) => void;
  followUpNotes: string; setFollowUpNotes: (v: string) => void;
  onAddFollowUp: (e: FormEvent) => void;
  // Intervention
  interventionDate: string; setInterventionDate: (v: string) => void;
  interventionBodyRegion: string; setInterventionBodyRegion: (v: string) => void;
  interventionTechnique: string; setInterventionTechnique: (v: string) => void;
  interventionDosage: string; setInterventionDosage: (v: string) => void;
  interventionResponse: string; setInterventionResponse: (v: string) => void;
  interventionHomeAdvice: string; setInterventionHomeAdvice: (v: string) => void;
  onAddIntervention: (e: FormEvent) => void;
  // Outcome
  outcomeName: string; setOutcomeName: (v: string) => void;
  outcomeCode: string; setOutcomeCode: (v: string) => void;
  outcomeValue: string; setOutcomeValue: (v: string) => void;
  outcomeDirection: string; setOutcomeDirection: (v: string) => void;
  outcomeUnit: string; setOutcomeUnit: (v: string) => void;
  onAddOutcome: (e: FormEvent) => void;
};

/**
 * Clinician-friendly clinical documentation forms for PNA Clinical Registry.
 * Phase 1: structured fields instead of raw JSON. Phase 2 will add Manual Therapy
 * and Modality pick-lists plus graphical outcomes.
 */
export function ClinicalDocumentationForms(props: Props) {
  const p = props;
  return (
    <div className="mt-5 space-y-5 border-t border-slate-100 pt-5 no-print">
      <p className="text-[11px] leading-5 text-slate-500">
        Record each session in plain clinical language. No technical JSON required.
        Full Manual Therapy and Modality libraries will be added in the next phase.
      </p>

      <form onSubmit={p.onSaveAssessment} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <h3 className="text-xs font-bold text-[#173653]">Initial assessment</h3>
        <label className="block text-[11px] font-semibold text-slate-600">
          Subjective / presenting complaint
          <textarea value={p.assessSubjective} onChange={(e) => p.setAssessSubjective(e.target.value)} rows={3}
            placeholder="What the patient reports (pain, onset, aggravating factors…)"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <label className="block text-[11px] font-semibold text-slate-600">
          Objective findings
          <textarea value={p.assessObjective} onChange={(e) => p.setAssessObjective(e.target.value)} rows={3}
            placeholder="Observation, ROM, special tests, palpation findings…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[11px] font-semibold text-slate-600">
            Pain score (0–10)
            <input type="number" min={0} max={10} step={1} value={p.assessPainScore}
              onChange={(e) => p.setAssessPainScore(e.target.value)} placeholder="e.g. 6"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Clinical impression
            <input value={p.assessImpression} onChange={(e) => p.setAssessImpression(e.target.value)}
              placeholder="Working diagnosis / impression"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
        </div>
        <label className="block text-[11px] font-semibold text-slate-600">
          Goals (one per line or comma-separated)
          <textarea value={p.assessGoals} onChange={(e) => p.setAssessGoals(e.target.value)} rows={2}
            placeholder="Reduce pain, restore ROM, return to work…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <button disabled={p.busy} className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
          Save initial assessment
        </button>
      </form>

      <form onSubmit={p.onAddFollowUp} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <h3 className="text-xs font-bold text-[#173653]">Session / follow-up assessment</h3>
        <p className="text-[10px] text-slate-500">Use this for Session 2, 3, 4… or any review visit. Keep a clear record of every session.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[11px] font-semibold text-slate-600">
            Session date
            <input type="date" value={p.followUpDate} onChange={(e) => p.setFollowUpDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Pain score (0–10)
            <input type="number" min={0} max={10} step={1} value={p.followUpPainScore}
              onChange={(e) => p.setFollowUpPainScore(e.target.value)} placeholder="e.g. 4"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
        </div>
        <label className="block text-[11px] font-semibold text-slate-600">
          Subjective update
          <textarea value={p.followUpSubjective} onChange={(e) => p.setFollowUpSubjective(e.target.value)} rows={2}
            placeholder="How the patient feels since last session…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <label className="block text-[11px] font-semibold text-slate-600">
          Objective update
          <textarea value={p.followUpObjective} onChange={(e) => p.setFollowUpObjective(e.target.value)} rows={2}
            placeholder="Re-assessment findings…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <label className="block text-[11px] font-semibold text-slate-600">
          Session notes / plan
          <textarea value={p.followUpNotes} onChange={(e) => p.setFollowUpNotes(e.target.value)} rows={2}
            placeholder="Progress, concerns, plan for next visit…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <button disabled={p.busy} className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
          Save this session
        </button>
      </form>

      <form onSubmit={p.onAddIntervention} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <h3 className="text-xs font-bold text-[#173653]">Treatment given this session</h3>
        <p className="text-[10px] text-slate-500">Record what you did. Ready-made Manual Therapy and Modality options will appear here in the next phase.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[11px] font-semibold text-slate-600">
            Date
            <input type="date" value={p.interventionDate} onChange={(e) => p.setInterventionDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Body region
            <input value={p.interventionBodyRegion} onChange={(e) => p.setInterventionBodyRegion(e.target.value)}
              placeholder="e.g. Right shoulder, Lumbar spine"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
        </div>
        <label className="block text-[11px] font-semibold text-slate-600">
          Technique / treatment <span className="font-normal text-slate-400">(required)</span>
          <textarea required value={p.interventionTechnique} onChange={(e) => p.setInterventionTechnique(e.target.value)} rows={2}
            placeholder="e.g. Grade II PA mobilisation L4-5, soft-tissue release upper trapezius, TENS 15 min…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[11px] font-semibold text-slate-600">
            Dosage / parameters
            <input value={p.interventionDosage} onChange={(e) => p.setInterventionDosage(e.target.value)}
              placeholder="e.g. 3×10 reps, 15 minutes, Grade II"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Immediate response
            <input value={p.interventionResponse} onChange={(e) => p.setInterventionResponse(e.target.value)}
              placeholder="e.g. Pain reduced, ROM improved"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
        </div>
        <label className="block text-[11px] font-semibold text-slate-600">
          Home advice / exercises
          <textarea value={p.interventionHomeAdvice} onChange={(e) => p.setInterventionHomeAdvice(e.target.value)} rows={2}
            placeholder="Stretches, activity advice, precautions…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
        </label>
        <button disabled={p.busy} className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
          Save intervention
        </button>
      </form>

      <form onSubmit={p.onAddOutcome} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <h3 className="text-xs font-bold text-[#173653]">Outcome measure</h3>
        <p className="text-[10px] text-slate-500">Record scores such as NPRS, VAS, DASH, ODI so progress can be compared over sessions.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[11px] font-semibold text-slate-600">
            Measure name
            <input required value={p.outcomeName} onChange={(e) => p.setOutcomeName(e.target.value)}
              placeholder="e.g. Numeric Pain Rating Scale"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Short code
            <input required value={p.outcomeCode} onChange={(e) => p.setOutcomeCode(e.target.value)}
              placeholder="e.g. NPRS"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-[11px] font-semibold text-slate-600">
            Value
            <input required type="number" step="any" value={p.outcomeValue} onChange={(e) => p.setOutcomeValue(e.target.value)}
              placeholder="e.g. 4"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Unit (optional)
            <input value={p.outcomeUnit} onChange={(e) => p.setOutcomeUnit(e.target.value)}
              placeholder="e.g. /10, degrees"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Direction
            <select value={p.outcomeDirection} onChange={(e) => p.setOutcomeDirection(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs">
              <option value="lower_is_better">Lower is better</option>
              <option value="higher_is_better">Higher is better</option>
              <option value="descriptive">Descriptive</option>
            </select>
          </label>
        </div>
        <button disabled={p.busy} className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
          Save outcome
        </button>
      </form>
    </div>
  );
}
