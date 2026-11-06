"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Route } from "lucide-react";
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
};

export function TeacherCatalog({ lessons, paths }: { lessons: TeacherLessonCard[]; paths: TeacherPath[] }) {
  const snapshot = useTeacherSnapshot();
  const lang = snapshot?.lang ?? "en";
  const progress = snapshot?.progress;

  return (
    <div className="space-y-12">
      <section aria-labelledby="pna-teacher-paths">
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
          All lessons
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          The topics students struggle with most — taught as a conversation, with analogies, interactive visuals and checks after every idea.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const done = Boolean(progress?.lessons[lesson.slug]);
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/learn/${lesson.slug}`}
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
    </div>
  );
}
