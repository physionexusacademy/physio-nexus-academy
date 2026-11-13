"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { loadAllExercises } from "@/lib/rehabverse/library";
import { CATEGORY_LABEL, LEVELS, LEVEL_LABEL, REGIONS, REGION_LABEL, type ExerciseDef, type Level, type Region } from "@/lib/rehabverse/types";
import { ExerciseDetails } from "./ExerciseDetails";
import { LangToggle, useRvLang } from "./useLang";

const ExercisePlayer = dynamic(() => import("./ExercisePlayer"), {
  ssr: false,
  loading: () => <div className="aspect-[4/3] w-full animate-pulse rounded-3xl bg-slate-200 sm:aspect-[16/10]" aria-hidden="true" />,
});

/** The public 3D exercise library: browse by region and level, watch the physio guide perform each exercise. */
export function LibraryBrowser({ initialId, initialRegion }: { initialId?: string; initialRegion?: Region }) {
  const [lang, setLang] = useRvLang("en");
  const [all, setAll] = useState<ExerciseDef[] | null>(null);
  const [region, setRegion] = useState<Region | "all">(initialRegion ?? "all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(initialId ?? null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    loadAllExercises().then(setAll);
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (all ?? [])
      .filter((e) => (region === "all" || e.regions.includes(region)) && (level === "all" || e.level === level))
      .filter((e) => !q || `${e.name.en} ${e.name.ru} ${e.summary.en} ${e.targets}`.toLowerCase().includes(q))
      .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.name.en.localeCompare(b.name.en));
  }, [all, region, level, query]);

  const current = all?.find((e) => e.id === selected) ?? null;
  const t = (v: { en: string; ru: string }) => (lang === "ru" ? v.ru : v.en);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Body region">
          <button type="button" onClick={() => setRegion("all")} aria-pressed={region === "all"} className={"rv-pill " + (region === "all" ? "rv-pill-on" : "")}>{lang === "ru" ? "Sab" : "All"}{all ? ` (${all.length})` : ""}</button>
          {REGIONS.map((r) => (
            <button key={r} type="button" onClick={() => setRegion(r)} aria-pressed={region === r} className={"rv-pill " + (region === r ? "rv-pill-on" : "")}>
              {t(REGION_LABEL[r]).replace(/ \(.*\)/, "")}
            </button>
          ))}
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={lang === "ru" ? "Exercise dhoondein…" : "Search exercises…"} aria-label="Search exercises" className="h-11 w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="flex gap-1.5" role="group" aria-label="Level">
          {(["all", ...LEVELS] as (Level | "all")[]).map((l) => (
            <button key={l} type="button" onClick={() => setLevel(l)} aria-pressed={level === l} className={"rv-pill " + (level === l ? "rv-pill-on" : "")}>
              {l === "all" ? (lang === "ru" ? "Har level" : "All levels") : t(LEVEL_LABEL[l]).replace(/ \(.*\)/, "")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className={"order-2 space-y-2 lg:order-1 " + (current ? "" : "lg:col-span-2")}>
          {!all ? <p className="rv-glass p-4 text-sm text-slate-600">Loading the library…</p> : null}
          {all && !list.length ? <p className="rv-glass p-4 text-sm text-slate-600">{lang === "ru" ? "Koi exercise nahi mili." : "No exercises match."}</p> : null}
          <ul className={"grid gap-2 " + (current ? "" : "sm:grid-cols-2 xl:grid-cols-3")}>
            {list.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => { setSelected(e.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-current={selected === e.id} className={"rv-card w-full text-left " + (selected === e.id ? "rv-card-on" : "")}>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="rv-chip rv-chip-teal">{t(REGION_LABEL[e.regions[0]]).replace(/ \(.*\)/, "")}</span>
                    <span className="rv-chip">{t(LEVEL_LABEL[e.level]).replace(/ \(.*\)/, "")}</span>
                  </span>
                  <strong className="mt-1.5 block text-[15px] leading-5 text-navy-800">{t(e.name)}</strong>
                  <span className="mt-0.5 block text-[13px] leading-5 text-slate-500">{t(CATEGORY_LABEL[e.category])}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {current ? (
          <section className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-2" aria-label="Exercise demonstration">
            <div className="flex items-center justify-between">
              <p className="rv-h">{lang === "ru" ? "3D demonstration" : "3D demonstration"}</p>
              <button type="button" onClick={() => setSelected(null)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"><X className="h-3.5 w-3.5" aria-hidden="true" /> {lang === "ru" ? "Band karein" : "Close"}</button>
            </div>
            {webgl ? (
              <ExercisePlayer key={current.id} exercise={current} lang={lang} onFail={() => setWebgl(false)} />
            ) : (
              <p className="rv-glass p-4 text-sm text-slate-600">{lang === "ru" ? "Is device par 3D support nahi hai — neeche likhi hui hidayat dekhein." : "3D is not available on this device — follow the written instructions below."}</p>
            )}
            <ExerciseDetails exercise={current} lang={lang} clinical />
          </section>
        ) : null}
      </div>
    </div>
  );
}
