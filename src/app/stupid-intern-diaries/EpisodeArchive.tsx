"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import type { StupidInternEpisode } from "@/lib/stupid-intern-diaries";
import { StupidInternClient } from "./StupidInternClient";

type Props = { episodes: StupidInternEpisode[] };

function keyword(title: string) {
  const clean = title.replace(/^The\s+/i, "").replace(/\s+(Special|Expert)$/i, "");
  if (/frozen shoulder/i.test(clean)) return "Frozen Shoulder";
  if (/neuro consultation/i.test(clean)) return "Neuro";
  if (/pediatric stretch/i.test(clean)) return "Pediatric Stretch";
  if (/sports return/i.test(clean)) return "Sports Return";
  if (/pacemaker/i.test(clean)) return "Pacemaker";
  return clean;
}

export function EpisodeArchive({ episodes }: Props) {
  const [showList, setShowList] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(episodes[0]?.id ?? null);
  const selected = episodes.find((ep) => ep.id === selectedId);

  return (
    <section className="mt-10 rounded-3xl border border-[#c5e8df] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-teal-800">
            <BookOpen className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-[0.16em]">Episode Library</p>
          </div>
          <h2 className="mt-2 text-xl font-bold text-[#193e50] sm:text-2xl">Choose an episode</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Browse by episode number and its main topic. Pick any story to read the full conversation and clinical takeaway.</p>
        </div>
        <button type="button" onClick={() => setShowList((v) => !v)} aria-expanded={showList}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800">
          {showList ? "Hide episode list" : `Browse all ${episodes.length} episodes`}
          {showList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {showList && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {episodes.map((ep) => (
            <button key={ep.id} type="button" onClick={() => { setSelectedId(ep.id); setShowList(false); }} aria-pressed={selectedId === ep.id}
              className={`rounded-2xl border p-4 text-left transition hover:border-teal-300 hover:shadow-sm ${selectedId === ep.id ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">EP {String(ep.id).padStart(2, "0")}</span>
                <span className="text-xs text-slate-400">{ep.date}</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-[#193e50]">{keyword(ep.title)}</h3>
              <p className="mt-1 text-xs font-medium text-teal-700">{ep.field}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{ep.title}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-800">{selectedId === ep.id ? "Selected" : "Read episode"} <ArrowUpRight className="h-3.5 w-3.5" /></span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <article className="mt-6 overflow-hidden rounded-2xl border border-teal-100 bg-white">
          <div className="bg-gradient-to-r from-teal-50 to-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">EP {String(selected.id).padStart(2, "0")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{keyword(selected.title)}</span>
              <span className="text-xs text-slate-500">{selected.field}</span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-[#193e50] sm:text-2xl">{selected.title}</h3>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            {selected.dialogue.map((line, idx) => (
              <div key={idx} className="flex justify-start">
                <div className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-6 ${line.speaker === "Dr. Sajjad" ? "bg-teal-700 text-white" : line.speaker === "Intern" ? "border border-slate-200 bg-slate-50 text-slate-800" : "border border-amber-200 bg-amber-50 text-amber-900"}`}>
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-80">{line.speaker === "Other" ? "Senior Doctor" : line.speaker}</span>
                  {line.text}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">Clinical takeaway</p>
              <p className="mt-1 text-sm leading-6 text-red-900">{selected.lesson}</p>
            </div>
            <StupidInternClient episodeId={selected.id} episodeTitle={selected.title} />
          </div>
        </article>
      )}

      
    </section>
  );
}
