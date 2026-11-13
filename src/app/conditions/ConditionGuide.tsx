"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, BookOpenCheck, CheckCircle2, ChevronDown, ClipboardList, Printer, RefreshCw, Stethoscope, Target } from "lucide-react";
import { areaLabel, depths, typeLabel, type DepthId } from "@/lib/conditions/taxonomy";
import type { CatalogItem, ConditionDetail, Stage, TestFull } from "@/lib/conditions/types";

const StoryExperience = dynamic(() => import("@/components/msk/MSKStoryExperience").then((m) => m.MSKStoryExperience), { ssr: false });

const DEPTH_KEY = "pna-cond-depth";
const depthIcons = { quick: BookOpenCheck, clinical: ClipboardList, expert: Stethoscope } as const;
const isDepth = (v: string | null | undefined): v is DepthId => v === "quick" || v === "clinical" || v === "expert";

type Related = { slug: string; name: string; area: string };

export function ConditionGuide({ item, related }: { item: CatalogItem; related: Related[] }) {
  const [detail, setDetail] = useState<ConditionDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [depth, setDepth] = useState<DepthId>("quick");
  const topRef = useRef<HTMLDivElement>(null);

  // Depth: the link's #hash wins, then what the visitor chose last time.
  useEffect(() => {
    try {
      const hash = window.location.hash.replace("#", "");
      const saved = localStorage.getItem(DEPTH_KEY);
      if (isDepth(hash)) setDepth(hash);
      else if (isDepth(saved)) setDepth(saved);
    } catch {
      /* defaults are fine */
    }
  }, []);

  const load = useCallback(() => {
    setFailed(false);
    fetch(`/conditions-data/${item.slug}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<ConditionDetail>) : Promise.reject(new Error(String(r.status)))))
      .then(setDetail)
      .catch(() => setFailed(true));
  }, [item.slug]);
  useEffect(load, [load]);

  const chooseDepth = (next: DepthId) => {
    setDepth(next);
    try {
      localStorage.setItem(DEPTH_KEY, next);
      history.replaceState(null, "", `#${next}`);
    } catch {
      /* ignore */
    }
  };

  const print = () => {
    document.querySelectorAll("details").forEach((d) => d.setAttribute("open", ""));
    window.print();
  };

  const quick = detail?.quick;
  const redFlags = quick?.redFlags ?? item.redFlags;
  const firstSteps = quick?.firstSteps ?? item.firstSteps;

  return (
    <div ref={topRef}>
      <header className="rounded-3xl bg-gradient-to-br from-navy-800 via-navy-700 to-teal-800 p-6 text-white shadow-lg sm:p-9">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <a href={`/conditions?area=${item.area}`} className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25">{areaLabel(item.area)}</a>
          <span className="rounded-full bg-white/10 px-3 py-1">{typeLabel(item.type)}</span>
          {item.evidence ? <span className="rounded-full bg-white/10 px-3 py-1">{item.evidence} evidence</span> : null}
          <span className="rounded-full bg-white/10 px-3 py-1">{item.stages}-stage plan</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl">{item.name}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-teal-50 sm:text-lg">{item.summary}</p>
      </header>

      <nav aria-label="Depth of knowledge" className="cg-noprint sticky top-[69px] z-20 -mx-4 mt-5 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-3 sm:shadow-sm">
        <div role="tablist" aria-label="How deep do you want to go?" className="grid grid-cols-3 gap-2">
          {depths.map((d) => {
            const Icon = depthIcons[d.id];
            const on = depth === d.id;
            return (
              <button
                key={d.id}
                id={`tab-${d.id}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`panel-${d.id}`}
                onClick={() => chooseDepth(d.id)}
                className={"flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2.5 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:flex-row sm:gap-2 " + (on ? "bg-teal-700 text-white shadow" : "bg-slate-100 text-slate-700 hover:bg-teal-50")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-bold">{d.label}</span>
                <span className={"hidden text-[11px] font-semibold sm:inline " + (on ? "text-teal-100" : "text-slate-500")}>{d.time}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* QUICK */}
      <section id="panel-quick" role="tabpanel" aria-labelledby="tab-quick" hidden={depth !== "quick"} className="mt-6 space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title={quick?.lookLabel ?? "What it can feel like"} items={quick?.looksLike ?? []} placeholder={!detail && !failed} />
          <Card title="Get medical help first if" items={redFlags} tone="red" icon={<AlertTriangle className="h-5 w-5 text-red-700" aria-hidden="true" />} />
          <Card title="What usually helps first" items={firstSteps} tone="teal" icon={<Target className="h-5 w-5 text-teal-700" aria-hidden="true" />} />
          <Card title="At home" items={quick?.selfCare ?? []} placeholder={!detail && !failed} hideIfEmpty />
        </div>
        <GoDeeper onClinical={() => chooseDepth("clinical")} onExpert={() => chooseDepth("expert")} />
      </section>

      {/* CLINICAL */}
      <section id="panel-clinical" role="tabpanel" aria-labelledby="tab-clinical" hidden={depth !== "clinical"} className="mt-6 space-y-6">
        {detail ? <ClinicalPanel d={detail} /> : <Loading failed={failed} retry={load} />}
        <GoDeeper onExpert={() => chooseDepth("expert")} />
      </section>

      {/* EXPERT */}
      <section id="panel-expert" role="tabpanel" aria-labelledby="tab-expert" hidden={depth !== "expert"} className="mt-6 space-y-4">
        {detail ? <ExpertPanel d={detail} /> : <Loading failed={failed} retry={load} />}
      </section>

      <footer className="cg-noprint mt-10 space-y-5">
        {related.length ? (
          <div>
            <h2 className="text-lg font-bold text-navy-800">Related conditions</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <a href={`/conditions/${r.slug}#${depth}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-navy-800 hover:border-teal-400 hover:bg-teal-50">
                    {r.name} <ArrowRight className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 text-sm font-bold">
          <a href="/conditions" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">All conditions</a>
          <a href="/symptom-checker" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">Symptom checker</a>
          <a href="/msk-special-tests" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">Special tests library</a>
          <a href="/manual-therapy" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300">Manual therapy</a>
          <a href="/rehabverse" className="rounded-xl bg-teal-700 px-4 py-2.5 text-white hover:bg-teal-800">Guided 3D home rehab</a>
          <button type="button" onClick={print} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:border-teal-300"><Printer className="h-4 w-4" aria-hidden="true" /> Print this guide</button>
        </div>
        {detail?.links.length ? (
          <p className="text-sm text-slate-600">See it in 3D: {detail.links.map((l, i) => (<span key={l.href}>{i ? " · " : ""}<a className="font-bold text-teal-800 underline" href={l.href}>{l.label}</a></span>))}</p>
        ) : null}
        <p className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-7 text-amber-950">
          <strong>Education notice:</strong> this guide supports learning and clinical reasoning. It does not replace an in-person assessment, and a test result is never a diagnosis on its own.
        </p>
        <noscript>This guide needs JavaScript to show the clinical and expert levels.</noscript>
      </footer>
    </div>
  );
}

function Card({ title, items, tone = "plain", icon, placeholder, hideIfEmpty }: { title: string; items: string[]; tone?: "plain" | "red" | "teal"; icon?: React.ReactNode; placeholder?: boolean; hideIfEmpty?: boolean }) {
  if (!items.length && hideIfEmpty && !placeholder) return null;
  const tones = { plain: "border-slate-200 bg-white", red: "border-red-200 bg-red-50/60", teal: "border-teal-200 bg-teal-50/60" } as const;
  return (
    <section className={"rounded-2xl border p-5 " + tones[tone]}>
      <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800">{icon}{title}</h2>
      {items.length ? (
        <ul className="mt-3 space-y-2.5">
          {items.map((t) => (
            <li key={t} className="flex gap-2.5 text-sm leading-6 text-slate-700">
              <CheckCircle2 className={"mt-1 h-4 w-4 flex-none " + (tone === "red" ? "text-red-600" : "text-teal-600")} aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      ) : placeholder ? <div className="mt-3 space-y-2" aria-hidden="true"><div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" /><div className="h-4 w-3/5 animate-pulse rounded bg-slate-100" /></div> : null}
    </section>
  );
}

function GoDeeper({ onClinical, onExpert }: { onClinical?: () => void; onExpert?: () => void }) {
  return (
    <div className="cg-noprint flex flex-wrap items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4">
      <p className="flex-1 text-sm font-semibold text-teal-950">Want the full picture?</p>
      {onClinical ? <button type="button" onClick={onClinical} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">Open the clinical plan</button> : null}
      {onExpert ? <button type="button" onClick={onExpert} className={"rounded-xl px-4 py-2.5 text-sm font-bold " + (onClinical ? "border border-teal-300 bg-white text-teal-900 hover:bg-teal-100" : "bg-teal-700 text-white hover:bg-teal-800")}>Open expert detail</button> : null}
    </div>
  );
}

function Loading({ failed, retry }: { failed: boolean; retry: () => void }) {
  return failed ? (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
      <p className="font-bold text-red-900">We could not load this level.</p>
      <p className="mt-1 text-sm text-red-800">Check your connection and try again.</p>
      <button type="button" onClick={retry} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again</button>
    </div>
  ) : (
    <div className="space-y-3" role="status" aria-label="Loading"><div className="h-24 animate-pulse rounded-2xl bg-slate-100" /><div className="h-40 animate-pulse rounded-2xl bg-slate-100" /></div>
  );
}

/* ───────────── Clinical level ───────────── */

function ClinicalPanel({ d }: { d: ConditionDetail }) {
  const c = d.clinical;
  return (
    <>
      <StagePlanner stages={c.stages} name={d.name} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="How to assess it" items={c.assess} />
        {c.measures.length ? <Card title="Measure progress with" items={c.measures} /> : null}
      </div>
      {c.tests.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-navy-800">Key tests and what a positive result means</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="py-2 pr-3">Test</th><th className="py-2 pr-3">Why we do it</th><th className="py-2">Positive when</th></tr></thead>
              <tbody>
                {c.tests.map((t) => (
                  <tr key={t.name} className="border-b border-slate-100 align-top last:border-0">
                    <th scope="row" className="py-2.5 pr-3 font-bold text-navy-800">{t.name}</th>
                    <td className="py-2.5 pr-3 leading-6 text-slate-700">{t.purpose}</td>
                    <td className="py-2.5 leading-6 text-slate-700">{t.positive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {c.differentials.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-navy-800">Also think about</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{c.differentials.map((x) => <li key={x} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{x}</li>)}</ul>
        </section>
      ) : null}
      {c.returnCriteria.length ? <Card title="Ready to return to full activity when" items={c.returnCriteria} tone="teal" icon={<Target className="h-5 w-5 text-teal-700" aria-hidden="true" />} /> : null}
    </>
  );
}

function StagePlanner({ stages, name }: { stages: Stage[]; name: string }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [viewed, setViewed] = useState(0);
  const key = (s: number, i: number) => `${s}:${i}`;

  // "You are here" = the first stage whose exit criteria are not all ticked.
  const current = useMemo(() => {
    for (let s = 0; s < stages.length; s++) {
      const needed = stages[s].moveOn;
      if (!needed.length || !needed.every((_, i) => checks[key(s, i)])) return s;
    }
    return stages.length - 1;
  }, [stages, checks]);
  const active = Math.min(viewed, stages.length - 1);
  const stage = stages[active];
  if (!stage) return null;
  const ticked = stage.moveOn.filter((_, i) => checks[key(active, i)]).length;
  const ready = stage.moveOn.length > 0 && ticked === stage.moveOn.length && active < stages.length - 1;

  return (
    <section aria-labelledby="cg-plan-title" className="rounded-3xl border border-teal-200 bg-gradient-to-b from-teal-50/70 to-white p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Your plan · {stages.length} stages</p>
      <h2 id="cg-plan-title" className="mt-1 text-xl font-bold text-navy-800 sm:text-2xl">Which stage fits right now?</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Tick what the patient can already do at the end of each stage. The plan moves you to the next stage when everything is ticked — never by the calendar alone.</p>

      <ol className="mt-4 grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]" aria-label={`Stages of the ${name} plan`}>
        {stages.map((s, i) => {
          const isCurrent = i === current;
          const isOpen = i === active;
          return (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => setViewed(i)}
                aria-current={isCurrent ? "step" : undefined}
                aria-pressed={isOpen}
                className={"flex h-full w-full flex-col rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 " + (isOpen ? "border-teal-600 bg-white ring-2 ring-teal-600/25" : "border-slate-200 bg-white/70 hover:border-teal-300")}
              >
                <span className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Stage {i + 1}
                  {isCurrent ? <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] text-white">You are here</span> : i < current ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">Done</span> : null}
                </span>
                <span className="mt-1 text-sm font-bold leading-snug text-navy-800">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5" aria-live="polite">
        <p className="text-sm font-bold text-teal-800">Goal of this stage</p>
        <p className="mt-1 text-base leading-7 text-navy-800">{stage.goal}</p>
        {stage.when.length ? <Block title="You are ready for this stage when" items={stage.when} tone="muted" /> : null}
        <Block title="What to do" items={stage.do} />
        {stage.dose.length ? <Block title="How much (starting dose)" items={stage.dose} tone="dose" /> : null}
        {stage.moveOn.length ? (
          <fieldset className="mt-5 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
            <legend className="px-1 text-sm font-bold text-teal-900">Move on when the patient can do all of these ({ticked}/{stage.moveOn.length})</legend>
            <ul className="mt-1 space-y-2">
              {stage.moveOn.map((m, i) => (
                <li key={m}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-800">
                    <input type="checkbox" className="mt-1.5 h-4 w-4 flex-none accent-teal-700" checked={!!checks[key(active, i)]} onChange={(e) => setChecks((prev) => ({ ...prev, [key(active, i)]: e.target.checked }))} />
                    <span>{m}</span>
                  </label>
                </li>
              ))}
            </ul>
            {ready ? (
              <button type="button" onClick={() => setViewed(active + 1)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">
                Ready — open Stage {active + 2} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </fieldset>
        ) : null}
      </div>
    </section>
  );
}

function Block({ title, items, tone = "plain" }: { title: string; items: string[]; tone?: "plain" | "muted" | "dose" }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <h3 className="text-sm font-bold text-navy-800">{title}</h3>
      <ul className={"mt-2 space-y-2 " + (tone === "dose" ? "rounded-xl bg-slate-50 p-3" : "")}>
        {items.map((t) => (
          <li key={t} className={"flex gap-2.5 text-sm leading-6 " + (tone === "muted" ? "text-slate-600" : "text-slate-800")}>
            <span className={"mt-2 h-1.5 w-1.5 flex-none rounded-full " + (tone === "dose" ? "bg-amber-500" : "bg-teal-600")} aria-hidden="true" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────── Expert level ───────────── */

function ExpertPanel({ d }: { d: ConditionDetail }) {
  const e = d.expert;
  const lists: { title: string; items: string[]; open?: boolean }[] = [
    { title: "Clinical reasoning", items: e.logic, open: true },
    { title: "Structures involved", items: e.structures },
    { title: "Mechanism", items: e.mechanism },
    { title: "Classification", items: e.classification },
    { title: "Investigations", items: e.investigations },
    { title: "Manual therapy", items: e.manual },
    { title: "Modalities", items: e.modalities },
    { title: "Exercise dosing", items: e.dosing },
    { title: "Progression rules", items: e.progression },
    { title: "Common mistakes", items: e.mistakes },
    { title: "Clinical pearls", items: e.pearls },
    { title: "Patient education", items: e.education },
    { title: "Escalate or refer when", items: e.escalation },
  ].filter((x) => x.items.length);
  return (
    <>
      {d.image ? (
        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.image.url} alt={`${d.image.title} — ${d.name}`} loading="lazy" decoding="async" className="mx-auto max-h-80 w-auto" />
          <figcaption className="mt-2 text-center text-xs text-slate-500">{d.image.title} · {d.image.credit}</figcaption>
        </figure>
      ) : null}
      {lists.map((l) => <Fold key={l.title} title={l.title} count={l.items.length} open={l.open}><ul className="space-y-2.5">{l.items.map((t) => <li key={t} className="flex gap-2.5 text-sm leading-6 text-slate-800"><span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-teal-600" aria-hidden="true" /><span>{t}</span></li>)}</ul></Fold>)}
      {e.tests.length ? (
        <Fold title="Test technique, step by step" count={e.tests.length}>
          <div className="space-y-3">{e.tests.map((t) => <TestDetail key={t.name} t={t} />)}</div>
        </Fold>
      ) : null}
      {e.story ? <StoryExperience story={e.story} /> : null}
      {e.refs.length ? (
        <Fold title="Evidence and guidelines" count={e.refs.length}>
          <ul className="space-y-2">{e.refs.map((r) => <li key={r.url} className="text-sm leading-6"><a className="font-semibold text-teal-800 underline" href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a></li>)}</ul>
        </Fold>
      ) : null}
    </>
  );
}

function Fold({ title, count, open, children }: { title: string; count: number; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group rounded-2xl border border-slate-200 bg-white open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 text-base font-bold text-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 [&::-webkit-details-marker]:hidden">
        <span>{title} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{count}</span></span>
        <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-100 p-4 pt-3">{children}</div>
    </details>
  );
}

function TestDetail({ t }: { t: TestFull }) {
  return (
    <details className="rounded-xl border border-cyan-200 bg-cyan-50/40">
      <summary className="cursor-pointer list-none p-3.5 text-sm font-bold text-navy-800 [&::-webkit-details-marker]:hidden">{t.name} <span className="font-normal text-slate-600">— {t.purpose}</span></summary>
      <div className="space-y-3 border-t border-cyan-100 p-3.5 text-sm leading-6 text-slate-800">
        <dl className="grid gap-2 sm:grid-cols-3">
          {[["Patient", t.patientPosition], ["Therapist", t.therapistPosition], ["Hands", t.handPlacement]].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white p-2.5"><dt className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">{k}</dt><dd className="mt-0.5">{v}</dd></div>
          ))}
        </dl>
        <ol className="list-decimal space-y-1.5 pl-5">{t.procedure.map((s) => <li key={s}>{s}</li>)}</ol>
        <p><strong className="text-emerald-800">Positive:</strong> {t.positive}</p>
        <p><strong className="text-indigo-800">Interpretation:</strong> {t.interpretation}</p>
        {t.clinicalNote ? <p className="rounded-lg bg-amber-50 p-2.5"><strong>Note:</strong> {t.clinicalNote}</p> : null}
      </div>
    </details>
  );
}
