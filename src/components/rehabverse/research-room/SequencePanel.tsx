"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff } from "lucide-react";
import { generateListAction, importListAction } from "@/app/admin/(dashboard)/rehabverse/research-room/actions";
import type { StudyOverview } from "@/lib/research-room";

/**
 * The allocation list. It is loaded once and then hidden: this screen shows how many rows each group has and how many are left, never which arm comes next.
 * In the real trial the list should come from an independent person (a statistician), so the people who enrol participants cannot know it.
 */
export function SequencePanel({ overview }: { overview: StudyOverview }) {
  const router = useRouter();
  const study = overview.study;
  const [csv, setCsv] = useState("");
  const [perGroup, setPerGroup] = useState(40);
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  if (!study) return null;
  const draft = study.status === "draft";

  const run = (fn: () => Promise<{ ok: boolean; error?: string; rows?: number; warnings?: string[] }>) => start(async () => {
    setNote(null);
    const r = await fn();
    if (r.ok) { setNote({ tone: "ok", text: `Loaded ${r.rows} rows.${r.warnings?.length ? " " + r.warnings.join(" ") : ""}` }); router.refresh(); } else setNote({ tone: "bad", text: r.error ?? "Could not load the list." });
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="rr-list">
      <h2 id="rr-list" className="flex items-center gap-2 font-heading text-base font-bold text-navy-800"><EyeOff className="h-4 w-4 text-teal-600" aria-hidden="true" /> Allocation list (hidden)</h2>
      <p className="mt-1 text-[12.5px] text-slate-600">Nobody can see which arm comes next, including you. This is what keeps the allocation concealed.</p>
      {overview.list?.length ? (
        <ul className="mt-2 grid gap-2 sm:grid-cols-2" data-testid="list-counts">
          {overview.list.map((g) => (
            <li key={g.stratum} className="rounded-xl border border-slate-200 px-3 py-2 text-[13.5px]">Pain {g.stratum}: <b>{g.left}</b> of {g.total} left{g.left <= 3 ? <span className="rv-chip rv-chip-amber ml-2">running low</span> : null}</li>
          ))}
        </ul>
      ) : <p className="mt-2 text-[13.5px] text-slate-500">No list loaded yet.</p>}
      {study.sequence_source ? <p className="mt-2 text-[12.5px] text-slate-600">Source: {study.sequence_source === "independent" ? "prepared by an independent person" : "generated here. This is a placeholder for testing or a small pilot, not independent."}</p> : null}

      {draft ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[13.5px] font-bold text-navy-800">Import the list from your statistician</p>
            <p className="text-[12px] text-slate-500">CSV with the header <code>stratum,position,arm</code>; arms are <code>ai</code> and <code>no_ai</code>; positions run 1, 2, 3 in each pain band.</p>
            <input type="file" accept=".csv,text/csv" aria-label="Allocation list file" className="mt-1 text-[13px]" onChange={async (e) => setCsv((await e.target.files?.[0]?.text()) ?? "")} />
            <button type="button" className="rv-btn rv-btn-primary mt-2" disabled={pending || !csv} onClick={() => run(() => importListAction(csv))}>Load this list</button>
          </div>
          <div>
            <p className="text-[13.5px] font-bold text-navy-800">Or make a placeholder list here</p>
            <p className="text-[12px] text-slate-500">Random permuted blocks of 4 and 6, 1:1, a separate list for each pain band. The random seed is never stored or shown.</p>
            <label className="rv-label" htmlFor="rr-per">Rows per pain band (at least)</label>
            <input id="rr-per" type="number" className="rv-input" value={perGroup} min={4} max={2000} onChange={(e) => setPerGroup(Number(e.target.value))} />
            <button type="button" className="rv-btn rv-btn-ghost mt-2" disabled={pending} onClick={() => run(() => generateListAction(perGroup))}>Make a placeholder list</button>
          </div>
        </div>
      ) : null}
      {note ? <p className={"mt-2 text-[13px] font-bold " + (note.tone === "ok" ? "text-teal-700" : "text-rose-700")} role="status">{note.text}</p> : null}
    </section>
  );
}
