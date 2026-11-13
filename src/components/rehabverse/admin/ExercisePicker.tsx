"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Eye, Plus, Search, X } from "lucide-react";
import { loadAllExercises } from "@/lib/rehabverse/library";
import { LEVEL_LABEL, REGIONS, REGION_LABEL, type ExerciseDef, type Region } from "@/lib/rehabverse/types";

const ExercisePlayer = dynamic(() => import("../ExercisePlayer"), { ssr: false, loading: () => <div className="aspect-[16/10] animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" /> });

/** Clinician's exercise library: filter, preview the real 3D demonstration, add to a day. */
export function ExercisePicker({ initialRegion, onAdd, onClose }: { initialRegion?: Region; onAdd: (exercise: ExerciseDef) => void; onClose: () => void }) {
  const [all, setAll] = useState<ExerciseDef[] | null>(null);
  const [region, setRegion] = useState<Region | "all">(initialRegion ?? "all");
  const [level, setLevel] = useState<"all" | ExerciseDef["level"]>("all");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<ExerciseDef | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    loadAllExercises().then(setAll);
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (all ?? []).filter((e) => (region === "all" || e.regions.includes(region)) && (level === "all" || e.level === level) && (!q || e.name.en.toLowerCase().includes(q) || e.targets.toLowerCase().includes(q) || e.id.includes(q)));
  }, [all, region, level, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Exercise library">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 className="font-heading text-lg font-bold text-navy-800">Exercise library</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </header>
        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-[1fr_1fr]">
          <div className="flex min-h-0 flex-col border-b border-slate-200 md:border-b-0 md:border-r">
            <div className="space-y-2 p-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises or muscles" className="rv-input !pl-9" aria-label="Search" />
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => setRegion("all")} className={"rv-pill " + (region === "all" ? "rv-pill-on" : "")}>All</button>
                {REGIONS.map((r) => <button key={r} type="button" onClick={() => setRegion(r)} className={"rv-pill " + (region === r ? "rv-pill-on" : "")}>{REGION_LABEL[r].en}</button>)}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "beginner", "intermediate", "advanced"] as const).map((l) => <button key={l} type="button" onClick={() => setLevel(l)} className={"rv-pill " + (level === l ? "rv-pill-on" : "")}>{l === "all" ? "Any level" : LEVEL_LABEL[l].en}</button>)}
              </div>
            </div>
            <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
              {all === null ? <li className="p-4 text-sm text-slate-500">Loading…</li> : null}
              {list.map((e) => (
                <li key={e.id} className={"flex items-center gap-2 rounded-xl border p-2.5 " + (preview?.id === e.id ? "border-teal-400 bg-teal-50/50" : "border-slate-200")}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-navy-800">{e.name.en}</p>
                    <p className="truncate text-[11.5px] text-slate-500">{e.regions.map((r) => REGION_LABEL[r].en).join(", ")} · {LEVEL_LABEL[e.level].en} · {e.targets.split(";")[0]}</p>
                  </div>
                  <button type="button" onClick={() => setPreview(e)} className="rv-pill !px-2.5" aria-label={`Preview ${e.name.en}`}><Eye className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => { onAdd(e); setAdded(e.name.en); }} className="rv-btn rv-btn-primary !min-h-[34px] !px-3 !text-[12.5px]"><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add</button>
                </li>
              ))}
              {all && list.length === 0 ? <li className="p-4 text-sm text-slate-500">No exercises match.</li> : null}
            </ul>
          </div>
          <div className="min-h-0 overflow-y-auto p-3">
            {preview ? (
              <div className="space-y-3">
                <ExercisePlayer exercise={preview} lang="en" />
                <div className="rounded-2xl bg-slate-50 p-3 text-[13px] leading-5 text-slate-700">
                  <p><b>Targets:</b> {preview.targets}</p>
                  <p className="mt-1"><b>Indications:</b> {preview.indications.join("; ")}</p>
                  <p className="mt-1"><b>Contraindications / precautions:</b> {preview.contraindications.join("; ")}</p>
                  <p className="mt-1"><b>Default dose:</b> {preview.dosage.sets} sets{preview.dosage.reps ? ` × ${preview.dosage.reps} reps` : ""}{preview.dosage.holdSeconds ? `, hold ${preview.dosage.holdSeconds}s` : ""}, {preview.dosage.frequency}</p>
                </div>
              </div>
            ) : <p className="grid h-full place-items-center p-6 text-center text-sm text-slate-500">Select the eye icon to see the 3D demonstration and clinical details before adding.</p>}
          </div>
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-2.5 text-[13px] text-slate-600">
          <span aria-live="polite">{added ? `Added: ${added}` : "Add as many as you need, then close."}</span>
          <button type="button" onClick={onClose} className="rv-btn rv-btn-primary !min-h-[38px]">Done</button>
        </footer>
      </div>
    </div>
  );
}
