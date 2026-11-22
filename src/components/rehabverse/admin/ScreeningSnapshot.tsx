"use client";

import { allConditionRules, featureLabels, regions } from "@/lib/msk-symptom-checker";
import type { StoredSnapshot } from "@/lib/rehabverse/api-types";

const dt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const PRIORITY = ["Monitor and assess as needed", "Professional assessment recommended", "Prompt professional assessment recommended"];
const ARM = { immediate: "Shown to the patient straight away", after_review: "Shown to the patient after your review" } as const;

/**
 * What the patient answered in the symptom-checker pictures, which patterns the checker's engine found (and with what score), the engine version that
 * did it, and the study arm: whether and when the patient was shown it. A screening to prompt the physiotherapist's own examination, never a diagnosis.
 */
export function ScreeningSnapshot({ snapshot }: { snapshot: StoredSnapshot }) {
  const region = regions.find((r) => r.id === snapshot.region);
  const label = (id: string) => featureLabels.get(id) ?? id;
  const history = snapshot.answers.filter((id) => /^(age_|onset_|duration_|impact_)/.test(id));
  const locationIds = new Set(region?.locations.map((l) => l.id) ?? []);
  const location = snapshot.answers.filter((id) => locationIds.has(id));
  const clues = snapshot.answers.filter((id) => !history.includes(id) && !locationIds.has(id));
  return (
    <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3" data-testid="screening-snapshot">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-teal-900">Symptom-checker screening</h3>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[11.5px] font-bold text-slate-600 ring-1 ring-slate-200">Engine {snapshot.engine_version}</span>
      </div>
      {snapshot.fracture_screen ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] font-semibold text-amber-950">Acute-injury fracture screen (Ottawa-style) was triggered: consider an in-person assessment and radiography before relying on the soft-tissue patterns below.</p>
      ) : null}
      <dl className="grid gap-2 text-[13.5px] leading-6 sm:grid-cols-2">
        <div><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Area</dt><dd>{region?.label ?? snapshot.region}</dd></div>
        <div><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Next-step priority (checker)</dt><dd>{PRIORITY[snapshot.priority]}</dd></div>
        <div><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">History</dt><dd>{history.map(label).join(" · ") || "–"}</dd></div>
        <div><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Location</dt><dd>{location.map(label).join(" · ") || "–"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Symptom clues ticked ({clues.length})</dt><dd>{clues.length ? clues.map(label).join(" · ") : "None ticked"}</dd></div>
        {snapshot.nerve_hint ? <div className="sm:col-span-2"><dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Nerve-distribution hint</dt><dd>{snapshot.nerve_hint}</dd></div> : null}
      </dl>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Patterns that fit (screening, not a diagnosis)</p>
        {snapshot.top_patterns.length === 0 ? <p className="text-[13.5px] text-slate-600">No single pattern stood out.</p> : (
          <ol className="mt-1 space-y-1.5">
            {snapshot.top_patterns.map((p, index) => {
              const rule = allConditionRules.find((r) => r.id === p.id);
              return (
                <li key={p.id} className={"rounded-lg border px-3 py-2 text-[13.5px] leading-6 " + (index === 0 ? "border-teal-300 bg-white font-semibold" : "border-slate-200 bg-white")}>
                  {rule ? <><b>{rule.name}</b> <span className="text-slate-500">({rule.plainName})</span></> : p.id} — {p.matched} of {p.total} typical features, score {p.score}
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <p className="text-[12.5px] leading-5 text-slate-600" data-testid="screening-exposure">
        Study arm: <b>{ARM[snapshot.arm]}</b>. {snapshot.shown_to_patient_at ? <>The patient was first shown the screening on {dt(snapshot.shown_to_patient_at)}.</> : "The patient has not been shown the screening yet."} Language used: {snapshot.language === "ru" ? "Roman Urdu" : "English"}.
      </p>
    </div>
  );
}
