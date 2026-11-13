"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CalendarPlus, Copy, Lock, Plus, Save, Trash2 } from "lucide-react";
import { programmeAction, savePlanAction } from "@/app/admin/(dashboard)/rehabverse/actions";
import type { AdminProgramme, FollowupPoint, PlanExercise, PlanPayload, UnlockMode } from "@/lib/rehabverse/api-types";
import type { ExerciseDef, Region } from "@/lib/rehabverse/types";
import { ExercisePicker } from "./ExercisePicker";

type Line = PlanExercise & { key: string };
type Day = { key: string; id?: string; day_number: number; title: string; patient_note: string; exercises: Line[]; readonly?: string };

const uid = () => Math.random().toString(36).slice(2, 10);
const REGION_FOR: Record<string, Region> = { cervical: "cervical", thoracic: "thoracic", lumbar: "lumbar", shoulder: "shoulder", elbow: "elbow_hand", wrist_hand: "elbow_hand", hip: "hip", knee: "knee", ankle_foot: "ankle_foot" };
const POINTS: { id: FollowupPoint; label: string }[] = [
  { id: "later_same_day", label: "Later the same day" },
  { id: "24h", label: "Next day (~24 h)" },
  { id: "48h", label: "~48 hours" },
];

const lineFrom = (e: ExerciseDef): Line => ({
  key: uid(), exercise_id: e.id, exercise_title: e.name.en, sets: e.dosage.sets, reps: e.dosage.reps, hold_seconds: e.dosage.holdSeconds,
  rest_seconds: e.dosage.restSeconds, duration_seconds: e.dosage.durationSeconds, side: e.dosage.side === "alternate" ? "alternate" : "both",
  frequency: e.dosage.frequency, precautions: "", notes: "",
});

function fromProgramme(p: AdminProgramme): Day[] {
  return p.sessions.map((s) => {
    const frozen = ["awaiting_review", "reviewed", "cancelled"].includes(s.session.status) || !!s.feedback;
    return {
      key: s.session.id, id: s.session.id, day_number: s.session.day_number, title: s.session.title, patient_note: s.session.patient_note ?? "",
      readonly: frozen ? (s.session.status === "reviewed" ? "Completed and reviewed" : s.session.status === "awaiting_review" ? "Feedback received — awaiting your review" : "Locked history") : undefined,
      exercises: s.exercises.map((e) => ({
        key: e.id, exercise_id: e.exercise_id, exercise_title: e.exercise_title, sets: e.sets ?? undefined, reps: e.reps ?? undefined, hold_seconds: e.hold_seconds ?? undefined,
        rest_seconds: e.rest_seconds ?? undefined, duration_seconds: e.duration_seconds ?? undefined, side: e.side, frequency: e.frequency ?? undefined, precautions: e.precautions ?? "", notes: e.notes ?? "",
      })),
    };
  });
}

const num = (v: string): number | undefined => (v === "" ? undefined : Math.max(0, Math.round(Number(v))));

export function ProgrammeBuilder({ assessmentId, programme, assessmentRegions, canCreate, patientName }: { assessmentId: string | null; programme?: AdminProgramme; assessmentRegions: string[]; canCreate: boolean; patientName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const p = programme?.programme;
  const [title, setTitle] = useState(p?.title ?? `Rehabilitation programme — ${patientName}`);
  const [goal, setGoal] = useState(p?.goal ?? "");
  const [unlock, setUnlock] = useState<UnlockMode>(p?.unlock_mode ?? "admin_approval");
  const [minHours, setMinHours] = useState(p?.min_hours_between_sessions ?? 0);
  const [autoPain, setAutoPain] = useState(p?.auto_unlock_max_pain ?? 5);
  const [schedule, setSchedule] = useState<FollowupPoint[]>(p?.errp_schedule ?? ["later_same_day", "24h"]);
  const [days, setDays] = useState<Day[]>(programme ? fromProgramme(programme) : [{ key: uid(), day_number: 1, title: "Gentle start", patient_note: "", exercises: [] }]);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [reason, setReason] = useState("");

  const closed = p ? ["completed", "discontinued"].includes(p.status) : false;
  const initialRegion = assessmentRegions.map((r) => REGION_FOR[r]).find(Boolean);

  const patchDay = (key: string, patch: Partial<Day>) => setDays((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const patchLine = (dayKey: string, lineKey: string, patch: Partial<Line>) => setDays((ds) => ds.map((d) => (d.key === dayKey ? { ...d, exercises: d.exercises.map((l) => (l.key === lineKey ? { ...l, ...patch } : l)) } : d)));
  const move = (dayKey: string, lineKey: string, dir: -1 | 1) =>
    setDays((ds) => ds.map((d) => {
      if (d.key !== dayKey) return d;
      const i = d.exercises.findIndex((l) => l.key === lineKey);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.exercises.length) return d;
      const next = [...d.exercises];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, exercises: next };
    }));
  const renumber = (ds: Day[]) => ds.map((d, i) => ({ ...d, day_number: i + 1 }));

  const problems = useMemo(() => {
    const out: string[] = [];
    if (title.trim().length < 3) out.push("Add a programme title.");
    days.forEach((d) => {
      if (d.readonly) return;
      if (!d.title.trim()) out.push(`Day ${d.day_number}: add a title.`);
      if (d.exercises.length === 0) out.push(`Day ${d.day_number}: add at least one exercise.`);
      d.exercises.forEach((l) => {
        if (!l.sets && !l.reps && !l.hold_seconds && !l.duration_seconds) out.push(`Day ${d.day_number}: "${l.exercise_title}" needs a dose (sets/reps/hold/time).`);
      });
    });
    return out;
  }, [title, days]);

  const save = () => {
    setMessage(null);
    const payload: PlanPayload = {
      title: title.trim(), goal: goal.trim() || undefined, unlock_mode: unlock, min_hours_between_sessions: minHours, auto_unlock_max_pain: autoPain, errp_schedule: schedule,
      sessions: days.map((d) => (d.readonly
        ? { id: d.id, day_number: d.day_number, title: d.title, exercises: [] }
        : { id: d.id, day_number: d.day_number, title: d.title.trim(), patient_note: d.patient_note.trim() || undefined,
            exercises: d.exercises.map(({ key: _key, ...e }) => ({ ...e, precautions: e.precautions?.trim() || undefined, notes: e.notes?.trim() || undefined, frequency: e.frequency?.trim() || undefined })) })),
    };
    start(async () => {
      const r = await savePlanAction(p ? null : assessmentId, p?.id ?? null, payload);
      if (!r.ok) return setMessage({ kind: "error", text: friendly(r.error) });
      setMessage({ kind: "ok", text: `Saved (${r.days} days). ${p?.status === "draft" || !p ? "Review, then approve to release Day 1." : ""}` });
      router.refresh();
    });
  };

  const act = (action: "approve" | "pause" | "resume" | "discontinue" | "complete") =>
    start(async () => {
      if (!p) return;
      const r = await programmeAction(p.id, action, reason);
      if (!r.ok) return setMessage({ kind: "error", text: friendly(r.error) });
      setReason("");
      setMessage({ kind: "ok", text: `Programme ${action === "approve" ? "approved — Day 1 is open to the patient" : action + "d"}.` });
      router.refresh();
    });

  if (!p && !canCreate) {
    return <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">A programme can be built once the assessment is reviewed and not flagged for clinical assessment. Use “Mark in review” or “Clear for programme” above.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="rv-label" htmlFor="pb-title">Programme title</label><input id="pb-title" className="rv-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} disabled={closed} /></div>
        <div className="sm:col-span-2"><label className="rv-label" htmlFor="pb-goal">Goal (shown to the patient)</label><input id="pb-goal" className="rv-input" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={300} placeholder="e.g. Return to comfortable walking and stairs" disabled={closed} /></div>
        <div>
          <label className="rv-label" htmlFor="pb-unlock">Next-day unlock rule</label>
          <select id="pb-unlock" className="rv-input" value={unlock} onChange={(e) => setUnlock(e.target.value as UnlockMode)} disabled={closed}>
            <option value="admin_approval">Physiotherapist approval required (recommended)</option>
            <option value="auto_after_feedback">Auto-release after safe feedback (my rule)</option>
          </select>
          <p className="rv-hint">{unlock === "admin_approval" ? "Day N+1 opens only when you review Day N and choose to continue." : `Opens automatically only if all exercises were done, no warning signs or unusual symptoms, and pain never above ${autoPain}/10. Anything else waits for you.`}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="rv-label" htmlFor="pb-gap">Min. hours between days</label><input id="pb-gap" type="number" min={0} max={168} className="rv-input" value={minHours} onChange={(e) => setMinHours(Math.min(168, Math.max(0, Number(e.target.value) || 0)))} disabled={closed} /></div>
          <div><label className="rv-label" htmlFor="pb-pain">Auto-release max pain</label><input id="pb-pain" type="number" min={0} max={10} className="rv-input" value={autoPain} onChange={(e) => setAutoPain(Math.min(10, Math.max(0, Number(e.target.value) || 0)))} disabled={closed || unlock !== "auto_after_feedback"} /></div>
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="rv-label">Recovery check-ins to ask the patient (ERRP)</legend>
          <div className="flex flex-wrap gap-2">
            {POINTS.map((pt) => (
              <label key={pt.id} className={"rv-pill inline-flex cursor-pointer items-center gap-2 " + (schedule.includes(pt.id) ? "rv-pill-on" : "")}>
                <input type="checkbox" className="sr-only" checked={schedule.includes(pt.id)} disabled={closed} onChange={() => setSchedule((s) => (s.includes(pt.id) ? s.filter((x) => x !== pt.id) : [...s, pt.id]))} /> {pt.label}
              </label>
            ))}
          </div>
          <p className="rv-hint">“Before / during / immediately after” are always recorded in the daily feedback.</p>
        </fieldset>
      </div>

      <div className="space-y-4">
        {days.map((d, di) => (
          <section key={d.key} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4" aria-label={`Day ${d.day_number}`}>
            <div className="flex flex-wrap items-start gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-800 text-sm font-extrabold text-white">{d.day_number}</span>
              <div className="min-w-[10rem] flex-1">
                <input className="rv-input !min-h-[40px] font-bold" value={d.title} placeholder="Name this day, e.g. Gentle start" onChange={(e) => patchDay(d.key, { title: e.target.value })} aria-label={`Day ${d.day_number} title`} disabled={!!d.readonly || closed} />
              </div>
              {!d.readonly && !closed ? (
                <div className="flex gap-1">
                  <button type="button" className="rv-pill" title="Duplicate day" onClick={() => setDays((ds) => renumber([...ds.slice(0, di + 1), { ...d, key: uid(), id: undefined, title: d.title + " (copy)", exercises: d.exercises.map((l) => ({ ...l, key: uid() })) }, ...ds.slice(di + 1)]))}><Copy className="h-3.5 w-3.5" /></button>
                  <button type="button" className="rv-pill" title="Remove day" onClick={() => setDays((ds) => renumber(ds.filter((x) => x.key !== d.key)))} disabled={days.length === 1}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ) : null}
            </div>
            {d.readonly ? <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12.5px] font-semibold text-slate-600"><Lock className="h-3.5 w-3.5" aria-hidden="true" /> {d.readonly} — kept as clinical history.</p> : null}
            {!d.readonly ? (
              <>
                <textarea className="rv-input mt-2" rows={2} placeholder="Note to the patient for this day (optional)" value={d.patient_note} onChange={(e) => patchDay(d.key, { patient_note: e.target.value })} disabled={closed} />
                <ul className="mt-3 space-y-2">
                  {d.exercises.map((l, li) => (
                    <li key={l.key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-navy-800">{li + 1}. {l.exercise_title}</span>
                        <button type="button" className="rv-pill !px-2" onClick={() => move(d.key, l.key, -1)} aria-label="Move up" disabled={li === 0}><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button type="button" className="rv-pill !px-2" onClick={() => move(d.key, l.key, 1)} aria-label="Move down" disabled={li === d.exercises.length - 1}><ArrowDown className="h-3.5 w-3.5" /></button>
                        <button type="button" className="rv-pill !px-2" onClick={() => patchDay(d.key, { exercises: d.exercises.filter((x) => x.key !== l.key) })} aria-label="Remove exercise"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {([["sets", "Sets", l.sets], ["reps", "Reps", l.reps], ["hold_seconds", "Hold (s)", l.hold_seconds], ["rest_seconds", "Rest (s)", l.rest_seconds], ["duration_seconds", "Time (s)", l.duration_seconds]] as const).map(([k, label, v]) => (
                          <label key={k} className="text-[11px] font-bold text-slate-600">{label}<input type="number" min={0} className="rv-input !min-h-[36px] !px-2 !text-[13px]" value={v ?? ""} onChange={(e) => patchLine(d.key, l.key, { [k]: num(e.target.value) } as Partial<Line>)} /></label>
                        ))}
                        <label className="text-[11px] font-bold text-slate-600">Side
                          <select className="rv-input !min-h-[36px] !px-2 !text-[13px]" value={l.side} onChange={(e) => patchLine(d.key, l.key, { side: e.target.value as Line["side"] })}>
                            <option value="both">Both</option><option value="left">Left</option><option value="right">Right</option><option value="alternate">Alternate</option>
                          </select>
                        </label>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input className="rv-input !min-h-[36px] !text-[13px]" placeholder="How often (e.g. once a day)" value={l.frequency ?? ""} onChange={(e) => patchLine(d.key, l.key, { frequency: e.target.value })} aria-label="Frequency" />
                        <input className="rv-input !min-h-[36px] !text-[13px]" placeholder="Precautions for this patient (shown to them)" value={l.precautions ?? ""} onChange={(e) => patchLine(d.key, l.key, { precautions: e.target.value })} aria-label="Precautions" />
                      </div>
                    </li>
                  ))}
                  {d.exercises.length === 0 ? <li className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-[13px] text-slate-500">No exercises yet.</li> : null}
                </ul>
                {!closed ? <button type="button" className="rv-btn rv-btn-ghost mt-3 !min-h-[38px] !text-[13px]" onClick={() => setPickerFor(d.key)}><Plus className="h-4 w-4" aria-hidden="true" /> Add exercises from the 3D library</button> : null}
              </>
            ) : null}
          </section>
        ))}
        {!closed ? (
          <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setDays((ds) => [...ds, { key: uid(), day_number: ds.length + 1, title: "", patient_note: "", exercises: [] }])}><CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add a day</button>
        ) : null}
      </div>

      {problems.length ? <ul className="rounded-xl bg-amber-50 px-4 py-2.5 text-[13px] text-amber-950">{problems.slice(0, 5).map((x) => <li key={x}>• {x}</li>)}</ul> : null}
      {message ? <p className={"rounded-xl px-3 py-2 text-[13.5px] font-semibold " + (message.kind === "ok" ? "bg-teal-50 text-teal-900" : "bg-rose-50 text-rose-900")} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}

      {!closed ? (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rv-btn rv-btn-primary" disabled={pending || problems.length > 0} onClick={save}><Save className="h-4 w-4" aria-hidden="true" /> {p ? "Save changes" : "Save as draft"}</button>
          {p?.status === "draft" ? <button type="button" className="rv-btn rv-btn-ghost !border-teal-400" disabled={pending || problems.length > 0} onClick={() => act("approve")}>Approve &amp; release Day 1</button> : null}
        </div>
      ) : null}

      {p && !closed ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <p className="text-[13px] font-bold text-navy-800">Programme status: <span className="rv-chip rv-chip-navy">{p.status}</span>{p.pause_reason ? <span className="ml-2 font-normal text-slate-600">— {p.pause_reason}</span> : null}</p>
          {p.status !== "draft" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input className="rv-input !min-h-[38px] min-w-[14rem] flex-1 !text-[13px]" placeholder="Reason (required to pause, resume or discontinue)" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason" />
              {p.status === "active" ? <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px] !text-[13px]" disabled={pending || reason.trim().length < 5} onClick={() => act("pause")}>Pause</button> : null}
              {p.status === "paused" ? <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px] !text-[13px]" disabled={pending || reason.trim().length < 5} onClick={() => act("resume")}>Resume</button> : null}
              <button type="button" className="rv-btn rv-btn-danger !min-h-[38px] !text-[13px]" disabled={pending || reason.trim().length < 5} onClick={() => act("discontinue")}>Discontinue</button>
              <button type="button" className="rv-btn rv-btn-ghost !min-h-[38px] !text-[13px]" disabled={pending} onClick={() => act("complete")}>Mark complete</button>
            </div>
          ) : null}
        </div>
      ) : null}

      {pickerFor ? (
        <ExercisePicker
          initialRegion={initialRegion}
          onClose={() => setPickerFor(null)}
          onAdd={(e) => setDays((ds) => ds.map((d) => (d.key === pickerFor ? { ...d, exercises: [...d.exercises, lineFrom(e)] } : d)))}
        />
      ) : null}
    </div>
  );
}

const MESSAGES: Record<string, string> = {
  patient_has_programme: "This patient already has a programme in progress.",
  assessment_not_cleared: "This assessment is flagged for clinical assessment or closed — clear it first.",
  "programme is closed": "This programme is closed.",
  "only a draft can be approved": "Only a draft can be approved.",
  "a reason is required": "A reason is required.",
  "the programme has no days": "The programme has no days.",
  failed: "Something went wrong. Please try again.",
};
const friendly = (code: string) => MESSAGES[code] ?? `Could not save (${code}).`;
