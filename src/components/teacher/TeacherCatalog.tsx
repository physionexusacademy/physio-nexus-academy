"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Hand, Route } from "lucide-react";
import type { TeacherLessonCard, TeacherPath } from "@/lib/teacher/types";
import { pathCompletion } from "@/lib/teacher/progress";
import { cn } from "@/lib/utils";
import { useTeacherSnapshot } from "./TeacherHome";
import { pick } from "./ui";

const areaTone: Record<string, string> = {
  "Movement Science": "bg-sky-100 text-sky-800",
  "Manual Therapy": "bg-amber-100 text-amber-800",
  "Clinical Reasoning": "bg-violet-100 text-violet-800",
  Neurology: "bg-fuchsia-100 text-fuchsia-800",
  "Tissue Healing": "bg-emerald-100 text-emerald-800",
  "Pain Science": "bg-rose-100 text-rose-800",
  "Exercise Prescription": "bg-lime-100 text-lime-800",
  Electrotherapy: "bg-orange-100 text-orange-800",
  Cardiorespiratory: "bg-cyan-100 text-cyan-800",
};

const manualGroups: { area: TeacherLessonCard["area"]; title: string; blurb: string }[] = [
  { area: "Manual Therapy · Joint", title: "Joint mobilization & manipulation", blurb: "Maitland, Kaltenborn, Mulligan, traction, neurodynamics and more." },
  { area: "Manual Therapy · Soft Tissue", title: "Soft-tissue techniques", blurb: "MET, strain-counterstrain, myofascial release, trigger points, IASTM, lymphatic drainage…" },
  { area: "Manual Therapy · World Approaches", title: "World approaches", blurb: "McKenzie, Paris, Mennell, osteopathic methods — and an honest look at disputed ones." },
];

export function TeacherCatalog({
  conceptLessons,
  manualLessons,
  paths,
}: {
  conceptLessons: TeacherLessonCard[];
  manualLessons: TeacherLessonCard[];
  paths: TeacherPath[];
}) {
  const snapshot = useTeacherSnapshot();
  const lang = snapshot?.lang ?? "en";
  const progress = snapshot?.progress;
  const manualDone = manualLessons.filter((lesson) => progress?.lessons[lesson.slug]).length;

  return (
    <div className="space-y-12">
      <section aria-labelledby="pna-teacher-paths" id="pna-teacher-paths-section">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">Step-by-step</p>
        <h2 id="pna-teacher-paths" className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
          Learning paths
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Each path is a guided route: short lessons with PNA Teacher, then missions inside the rest of the PNA website — so every page you read has a purpose.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {paths.map((path) => {
            const status = progress ? pathCompletion(path, progress) : { done: 0, total: path.steps.length, complete: false };
            return (
              <Link
                key={path.slug}
                href={`/learn/paths/${path.slug}`}
                className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-teal-700 text-white">
                    <Route className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{path.audience}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-navy-800 group-hover:text-teal-800">{path.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{pick(path.tagline, lang)}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${(status.done / status.total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-slate-500">
                    {status.complete ? "✓ " : ""}
                    {status.done}/{status.total} steps
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="pna-teacher-lessons">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">Hard concepts, made easy</p>
        <h2 id="pna-teacher-lessons" className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
          Concept lessons
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          The topics students struggle with most — taught as a conversation, with analogies, interactive visuals and checks after every idea.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {conceptLessons.map((lesson) => {
            const done = Boolean(progress?.lessons[lesson.slug]);
            return (
              <li key={lesson.slug}>
                <Link
                  href={lesson.href}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", areaTone[lesson.area] ?? "bg-slate-100 text-slate-700")}>{lesson.area}</span>
                    {done ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Done
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-navy-800 group-hover:text-teal-800">{lesson.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">{pick(lesson.hook, lang)}</p>
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {lesson.minutes} min · {lesson.bestFor}
                    </span>
                    <ArrowRight className="h-4 w-4 text-teal-700 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="pna-teacher-manual" id="manual-therapy">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">
              <Hand className="h-4 w-4" aria-hidden="true" /> Manual Therapy Encyclopedia
            </p>
            <h2 id="pna-teacher-manual" className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
              All {manualLessons.length} techniques, taught step by step
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Every chapter of the encyclopedia now opens with PNA Teacher: what it is, an analogy, when it&apos;s safe, the steps with their reasons, a patient case, checks and flashcards.
            </p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 ring-1 ring-teal-100">
            {manualDone}/{manualLessons.length} completed
          </span>
        </div>
        <div className="mt-6 space-y-6">
          {manualGroups.map((group) => {
            const lessons = manualLessons.filter((lesson) => lesson.area === group.area);
            if (!lessons.length) return null;
            return (
              <div key={group.area} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-navy-800">{group.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{group.blurb}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((lesson) => {
                    const done = Boolean(progress?.lessons[lesson.slug]);
                    return (
                      <li key={lesson.slug}>
                        <Link
                          href={lesson.href}
                          className={cn(
                            "group flex h-full items-center justify-between gap-2 rounded-2xl border px-3.5 py-3 text-sm font-bold transition hover:border-teal-300 hover:bg-teal-50/50",
                            done ? "border-emerald-200 bg-emerald-50/50 text-emerald-900" : "border-slate-200 text-navy-800",
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {done ? <CheckCircle2 className="h-4 w-4 flex-none text-emerald-600" aria-label="Done" /> : null}
                            <span className="leading-snug">{lesson.title}</span>
                          </span>
                          <span className="flex flex-none items-center gap-1 text-xs font-semibold text-slate-400">
                            {lesson.minutes}m <ArrowRight className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
