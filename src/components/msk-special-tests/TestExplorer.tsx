"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, CheckCircle2, ChevronDown, ClipboardCheck, Hand, RotateCcw, Search, ShieldAlert, Stethoscope, Target } from "lucide-react";
import { MSK_TEST_REGIONS, type MskSpecialTest } from "@/lib/msk-special-tests-types";

type Region = "All tests" | (typeof MSK_TEST_REGIONS)[number];

export function TestExplorer({ tests }: { tests: MskSpecialTest[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region>("All tests");
  const [visibleCount, setVisibleCount] = useState(12);
  const [expanded, setExpanded] = useState<string[]>([]);

  const counts = useMemo(() => new Map(MSK_TEST_REGIONS.map((item) => [item, tests.filter((t) => t.region === item).length])), [tests]);
  const matches = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return tests.filter((test) => {
      if (region !== "All tests" && test.region !== region) return false;
      if (!search) return true;
      return [test.name, test.region, test.purpose, test.position, test.positive, test.meaning, ...test.steps].join(" ").toLocaleLowerCase().includes(search);
    });
  }, [tests, region, query]);
  const visible = matches.slice(0, visibleCount);
  const selectRegion = (next: Region) => { setRegion(next); setVisibleCount(12); setExpanded([]); };
  const toggle = (id: string) => setExpanded((before) => before.includes(id) ? before.filter((v) => v !== id) : [...before, id]);
  const reset = () => { setQuery(""); setRegion("All tests"); setVisibleCount(12); setExpanded([]); };

  return (
    <div className="grid items-start gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_45px_-36px_rgba(10,47,62,0.4)] lg:sticky lg:top-28" aria-label="Filter tests by body region">
        <p className="px-3 pt-2 text-xs font-bold uppercase tracking-[0.15em] text-teal-700">Body regions</p>
        <div className="mt-3 space-y-1">
          {(["All tests", ...MSK_TEST_REGIONS] as Region[]).map((name) => {
            const selected = region === name;
            const count = name === "All tests" ? tests.length : counts.get(name) || 0;
            return (
              <button
                type="button" key={name} onClick={() => selectRegion(name)} aria-pressed={selected}
                className={"flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition " +
                  (selected ? "bg-teal-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-teal-800")}
              >
                <span className="leading-5">{name}</span>
                <span className={"min-w-7 rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums " + (selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 border-t border-slate-100 px-3 pt-4 text-xs leading-6 text-slate-500">
          Choose a region or search by test, structure, symptom or technique.
        </div>
      </aside>

      <section aria-label="Searchable MSK special tests">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_45px_-38px_rgba(10,47,62,0.3)] sm:p-5">
          <label htmlFor="msk-test-search" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-600">Find a clinical test</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-700" aria-hidden="true"/>
            <input
              id="msk-test-search" type="search" value={query}
              onChange={(e) => {setQuery(e.target.value);setVisibleCount(12);setExpanded([]);}}
              placeholder="Search Lachman, shoulder, ACL, nerve, instability..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600"><span className="font-bold text-teal-800">{matches.length}</span> {matches.length===1?"test":"tests"} found</p>
            {(query || region !== "All tests") && <button onClick={reset} type="button" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline"><RotateCcw className="h-3.5 w-3.5"/>Clear filters</button>}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-teal-700"/>
            <h2 className="mt-3 text-lg font-bold text-slate-900">No matching tests</h2>
            <p className="mt-2 text-sm text-slate-600">Try a different test name, body region, symptom or joint structure.</p>
            <button onClick={reset} type="button" className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white">Show all tests</button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {visible.map((test, index) => {
              const open = expanded.includes(test.id);
              return (
                <article key={test.id} id={test.id} className="scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_35px_-32px_rgba(4,46,62,0.45)]">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">{test.region}</span>
                      <span className="text-slate-400">TEST {String(index + 1).padStart(2,"0")}</span>
                    </div>
                    <h2 className="mt-3 font-serif text-xl font-bold leading-snug text-slate-900 sm:text-2xl">{test.name}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600"><strong className="font-bold text-slate-800">Purpose:</strong> {test.purpose}</p>
                    <button
                      type="button" onClick={() => toggle(test.id)} aria-expanded={open} aria-controls={test.id + "-method"}
                      className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                    >
                      {open ? "Hide technique" : "View applying method"} <ChevronDown className={"h-4 w-4 transition-transform " + (open ? "rotate-180" : "")}/>
                    </button>
                  </div>
                  {open && <div id={test.id + "-method"} className="border-t border-slate-100 bg-slate-50/70 px-5 py-6 sm:px-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-800"><Stethoscope className="h-4 w-4"/>Patient position</div>
                      <p className="mt-2 text-sm leading-7 text-slate-700">{test.position}</p>
                    </div>
                    <div className="mt-5">
                      <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Hand className="h-5 w-5 text-teal-700"/>How to perform — step by step</h3>
                      <ol className="mt-4 space-y-3">
                        {test.steps.map((step, i) => <li key={i} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-teal-700 text-xs font-bold text-white">{i+1}</span><span>{step}</span>
                        </li>)}
                      </ol>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-900"><CheckCircle2 className="h-4 w-4"/>Positive finding</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{test.positive}</p>
                      </div>
                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-900"><Target className="h-4 w-4"/>What it means</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{test.meaning}</p>
                      </div>
                    </div>
                    {test.caution && <div className="mt-3 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                      <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-amber-700"/><div><h3 className="text-sm font-bold text-amber-900">Safety note</h3><p className="mt-1 text-sm leading-7 text-amber-950">{test.caution}</p></div>
                    </div>}
                    <p className="mt-4 text-xs leading-6 text-slate-500">Interpret findings with history, function, symptom behavior and other appropriate examinations. A single special test rarely confirms or excludes a condition.</p>
                  </div>}
                </article>
              );
            })}
          </div>
        )}

        {visibleCount < matches.length && <div className="mt-7 text-center">
          <button type="button" onClick={()=>setVisibleCount((n)=>n+12)} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800">
            Load more tests <ArrowRight className="h-4 w-4"/>
          </button>
          <p className="mt-2 text-xs text-slate-500">Showing {visible.length} of {matches.length}</p>
        </div>}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
          <p className="flex items-center gap-2 font-bold text-slate-800"><ClipboardCheck className="h-5 w-5 text-teal-700"/>How to study a special test</p>
          <p className="mt-2">Remember the sequence: <strong>purpose → patient position → stabilization → movement / force → positive sign → clinical meaning.</strong> Practise under competent clinical supervision, and screen for red flags before provocative examination.</p>
        </div>
      </section>
    </div>
  );
}
