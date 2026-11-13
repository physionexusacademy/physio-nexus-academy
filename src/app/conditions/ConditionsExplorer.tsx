"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, ClipboardList, Search, Stethoscope, X } from "lucide-react";
import { areas, depths, typeLabel, types, areaLabel, type AreaId, type DepthId, type TypeId } from "@/lib/conditions/taxonomy";

export type ExplorerItem = {
  slug: string;
  name: string;
  area: AreaId;
  type: TypeId;
  summary: string;
  stages: number;
  kind: "injury" | "plan" | "both";
  aka: string;
};

const DEPTH_KEY = "pna-cond-depth";
const depthIcons = { quick: BookOpenCheck, clinical: ClipboardList, expert: Stethoscope } as const;

function isDepth(value: string | null): value is DepthId {
  return value === "quick" || value === "clinical" || value === "expert";
}

export function ConditionsExplorer({ items }: { items: ExplorerItem[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<AreaId | "all">("all");
  const [type, setType] = useState<TypeId | "all">("all");
  const [depth, setDepth] = useState<DepthId>("quick");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEPTH_KEY);
      if (isDepth(saved)) setDepth(saved);
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) setQuery(q.slice(0, 80));
      const a = params.get("area");
      if (a && areas.some((x) => x.id === a)) setArea(a as AreaId);
    } catch {
      /* private mode: defaults are fine */
    }
  }, []);

  const chooseDepth = (next: DepthId) => {
    setDepth(next);
    try {
      localStorage.setItem(DEPTH_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const counts = useMemo(() => {
    const byArea: Record<string, number> = {};
    for (const item of items) byArea[item.area] = (byArea[item.area] ?? 0) + 1;
    return byArea;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (area === "all" || item.area === area) &&
        (type === "all" || item.type === type) &&
        (!q || item.name.toLowerCase().includes(q) || item.aka.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || typeLabel(item.type).toLowerCase().includes(q) || areaLabel(item.area).toLowerCase().includes(q)),
    );
  }, [items, query, area, type]);

  const filtered = query.trim() !== "" || area !== "all" || type !== "all";
  const usedTypes = useMemo(() => types.filter((t) => items.some((i) => i.type === t.id && (area === "all" || i.area === area))), [items, area]);

  return (
    <div className="container-content section-padding !pt-8">
      <section aria-labelledby="cg-depth-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Step 1 · Choose how deep to go</p>
        <h2 id="cg-depth-title" className="mt-1 text-xl font-bold text-navy-800 sm:text-2xl">Every condition has three levels. Pick yours — we remember it.</h2>
        <div role="radiogroup" aria-labelledby="cg-depth-title" className="mt-4 grid gap-3 md:grid-cols-3">
          {depths.map((d) => {
            const Icon = depthIcons[d.id];
            const on = depth === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => chooseDepth(d.id)}
                className={"rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 " + (on ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/30" : "border-slate-200 bg-white hover:border-teal-300")}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-base font-bold text-navy-800"><Icon className="h-5 w-5 text-teal-700" aria-hidden="true" /> {d.label}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{d.time}</span>
                </span>
                <span className="mt-1 block text-xs font-semibold text-teal-800">{d.for}</span>
                <span className="mt-1.5 block text-sm leading-6 text-slate-600">{d.gives}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="cg-find-title" className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Step 2 · Find the condition</p>
        <h2 id="cg-find-title" className="mt-1 text-xl font-bold text-navy-800 sm:text-2xl">Where is it, or what is it called?</h2>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search conditions</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: knee, tennis elbow, sciatica, stroke…"
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-base text-navy-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
            />
          </label>
          <a href="/symptom-checker" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-900 transition hover:bg-teal-100">
            Not sure what it is? Symptom checker <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by body area">
          <button type="button" onClick={() => setArea("all")} aria-pressed={area === "all"} className={chip(area === "all")}>All areas <span className="opacity-70">{items.length}</span></button>
          {areas.map((a) => (
            <button key={a.id} type="button" onClick={() => setArea(a.id)} aria-pressed={area === a.id} title={a.hint} className={chip(area === a.id)}>
              {a.label} <span className="opacity-70">{counts[a.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by kind of problem">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kind of problem</span>
          <button type="button" onClick={() => setType("all")} aria-pressed={type === "all"} className={chip(type === "all", true)}>Any</button>
          {usedTypes.map((t) => (
            <button key={t.id} type="button" onClick={() => setType(t.id)} aria-pressed={type === t.id} title={t.hint} className={chip(type === t.id, true)}>{t.label}</button>
          ))}
          {filtered ? (
            <button type="button" onClick={() => { setQuery(""); setArea("all"); setType("all"); }} className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
            </button>
          ) : null}
        </div>

        <p className="mt-5 text-sm text-slate-600" role="status" aria-live="polite">
          Showing {visible.length} of {items.length} conditions · opening at <strong className="text-navy-800">{depths.find((d) => d.id === depth)?.label}</strong>
        </p>

        {visible.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-bold text-navy-800">Nothing matches that yet.</p>
            <p className="mt-1 text-sm text-slate-600">Try the body part (for example “shoulder”), or use the symptom checker.</p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <li key={item.slug}>
                <a href={`/conditions/${item.slug}#${depth}`} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                  <span className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-800">{areaLabel(item.area)}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{typeLabel(item.type)}</span>
                  </span>
                  <strong className="mt-2 text-base font-bold leading-snug text-navy-800 group-hover:text-teal-800">{item.name}</strong>
                  <span className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</span>
                  <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs font-bold text-teal-800">
                    <span>{item.stages}-stage plan</span>
                    <span className="inline-flex items-center gap-1">Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-7 text-amber-950">
        <strong>Education notice:</strong> these guides support learning and clinical reasoning. They do not replace an in-person assessment. If someone has red-flag symptoms (listed on every page), they need medical care first.
      </p>
    </div>
  );
}

function chip(on: boolean, small = false) {
  return (
    "rounded-full border font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 " +
    (small ? "px-3 py-1.5 text-xs " : "px-3.5 py-2 text-sm ") +
    (on ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50")
  );
}
