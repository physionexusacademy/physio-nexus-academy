"use client";

/**
 * "Guide me": a card on the PNA Teacher and Skills Lab pages that opens Dr. Sajjad's tour of the academy (the avatar stage playing
 * the `site-tour` choreography) with an "Ask Dr. Sajjad" box. Nothing 3D loads until the visitor opens it. Where 3D is not available the
 * tour is a plain list with links to the same pages.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Compass, Play } from "lucide-react";
import { useLang } from "@/lib/lang";
import { AVATAR_LABEL } from "@/lib/avatar/labels";
import { plain } from "@/lib/avatar/text";
import type { BuiltChoreo } from "@/lib/avatar/choreo/built";

const Demo3D = dynamic(() => import("@/components/skills/Demo3D").then((module) => module.Demo3D), {
  ssr: false,
  loading: () => <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl border border-slate-200 bg-[#e8eef3] text-sm font-bold text-navy-800 sm:aspect-[16/10]">Preparing the tour…</div>,
});

/** The same tour as text, for browsers without WebGL and for anyone who prefers to read. */
function TourText() {
  const [lang] = useLang();
  const ur = lang === "ur";
  const [tour, setTour] = useState<BuiltChoreo | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/teacher/choreo/site-tour.json")
      .then((r) => r.json())
      .then((data: BuiltChoreo) => !cancelled && setTour(data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  if (!tour) return <p className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">Loading the tour…</p>;
  return (
    <ul className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
      {tour.steps.map((step) => (
        <li key={step.chip} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <p className="text-sm font-bold text-navy-800">{step.link ? (ur ? step.link.label.ur : step.link.label.en) : step.chip}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{plain(ur ? step.say[0].ur : step.say[0].en)}</p>
          {step.link ? <a href={step.link.href} className="mt-1 inline-block text-sm font-bold text-teal-700 underline">{ur ? "Kholein" : "Open"} →</a> : null}
        </li>
      ))}
    </ul>
  );
}

export function GuideMe() {
  const [open, setOpen] = useState(false);
  const [lang] = useLang();
  const ur = lang === "ur";
  const stage = useRef<HTMLDivElement>(null);
  // Bring the stage into view when it opens (the 3D view loads once it is in sight).
  useEffect(() => {
    if (open) stage.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }, [open]);
  return (
    <section className="rounded-3xl bg-[#0a1f3d] p-5 text-white shadow-[0_30px_70px_-45px_rgba(5,20,45,0.9)] sm:p-6" aria-labelledby="guide-me-title" data-guide-me>
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-white/10">
          <Compass className="h-6 w-6 text-[#2ee6d6]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#2ee6d6]">{AVATAR_LABEL}</p>
          <h2 id="guide-me-title" className="mt-0.5 text-lg font-bold sm:text-xl">{ur ? "Guide me — Dr. Sajjad ke saath academy ka tour" : "Guide me — a tour of the academy with Dr. Sajjad"}</h2>
          <p className="mt-1 text-sm leading-6 text-[#a9bfd6]">
            {ur
              ? "Taqreeban 2 minute mein dekhein PNA mein kya kya hai — 3D demonstrations ke saath. Koi sawal ho to unse poochh bhi sakte hain."
              : "See what PNA offers in about two minutes, with short 3D demonstrations — then ask him a question."}
          </p>
        </div>
        {!open ? (
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#2ee6d6] px-5 py-2.5 text-sm font-extrabold text-[#03202a] shadow-[0_0_20px_rgba(46,230,214,.5)] hover:bg-[#7ff2e8]">
            <Play className="h-4 w-4" aria-hidden="true" /> {ur ? "Tour shuru karein" : "Start the tour"}
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="mt-4" ref={stage}>
          <Demo3D demoKey="avatar/site-tour" title="Tour of Physio Nexus Academy" fallback={<TourText />} />
        </div>
      ) : null}
    </section>
  );
}
