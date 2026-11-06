"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, ExternalLink, RotateCcw, Target } from "lucide-react";
import type { TeacherLessonCard, TeacherPath } from "@/lib/teacher/types";
import { completeMission, isStepDone, pathCompletion, setTeacherLang, undoMission } from "@/lib/teacher/progress";
import { cn } from "@/lib/utils";
import { withPath } from "@/lib/teacher/href";
import { useTeacherSnapshot } from "./TeacherHome";
import { LangToggle, RichText, TeacherBubble, pick, t } from "./ui";

export function PathJourney({ path, lessons }: { path: TeacherPath; lessons: TeacherLessonCard[] }) {
  const snapshot = useTeacherSnapshot();
  const lang = snapshot?.lang ?? "en";
  const progress = snapshot?.progress;
  const status = progress ? pathCompletion(path, progress) : { done: 0, total: path.steps.length, nextIndex: 0, complete: false };
  const lessonMap = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  const name = snapshot?.profile?.name ? `, ${snapshot.profile.name}` : "";

  const intro = status.complete
    ? t(lang, `You've completed every step${name}! 🏆 Come back to any lesson to revise, and keep your flashcards going.`, `Aap ne har qadam mukammal kar liya${name}! 🏆 Revision ke liye kisi bhi lesson par wapas aayein, aur flashcards jaari rakhein.`)
    : status.done === 0
      ? t(lang, `Here's the route${name}. **${path.steps.length} steps**, one at a time. Lessons are taught by me; missions send you into the PNA website with one clear job. Tick each mission when it's done.`, `Yeh raasta hai${name}. **${path.steps.length} qadam**, ek waqt mein ek. Lessons main parhaunga; missions aap ko PNA website ke andar ek wazeh kaam ke saath bhejte hain. Har mission mukammal hone par tick karein.`)
      : t(lang, `Nice progress${name}: **${status.done} of ${status.total}** steps done. Your next step is highlighted below.`, `Achi progress${name}: **${status.total} mein se ${status.done}** qadam mukammal. Agla qadam neeche highlight hai.`);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LangToggle lang={lang} onChange={(value) => setTeacherLang(value)} />
        <div className="flex min-w-48 flex-1 items-center gap-3 sm:max-w-xs">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Path progress" aria-valuemin={0} aria-valuemax={status.total} aria-valuenow={status.done}>
            <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(status.done / status.total) * 100}%` }} />
          </div>
          <span className="text-xs font-bold tabular-nums text-slate-600">
            {status.done}/{status.total}
          </span>
        </div>
      </div>

      <TeacherBubble tone={status.complete ? "correct" : "plain"}>
        <RichText text={intro} />
      </TeacherBubble>

      <ol className="relative space-y-3 border-l-2 border-dashed border-teal-200 pl-6 sm:pl-8">
        {path.steps.map((step, index) => {
          const done = progress ? isStepDone(path, step, progress) : false;
          const isNext = !status.complete && index === status.nextIndex;
          const lesson = step.kind === "lesson" ? lessonMap.get(step.lesson) : undefined;
          const title = step.kind === "lesson" ? lesson?.title ?? step.lesson : step.title;
          const minutes = step.kind === "lesson" ? lesson?.minutes ?? 10 : step.minutes;
          return (
            <li key={step.id} id={`step-${step.id}`} className="relative scroll-mt-28">
              <span
                className={cn(
                  "absolute -left-[2.15rem] top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-extrabold sm:-left-[2.65rem]",
                  done ? "border-emerald-500 bg-emerald-500 text-white" : isNext ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white text-slate-500",
                )}
                aria-hidden="true"
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <div
                className={cn(
                  "rounded-2xl border bg-white p-4 shadow-sm sm:p-5",
                  isNext ? "border-teal-400 ring-2 ring-teal-100" : done ? "border-emerald-200" : "border-slate-200",
                )}
              >
                <p className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700">
                  {step.kind === "lesson" ? <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> : <Target className="h-3.5 w-3.5" aria-hidden="true" />}
                  {t(lang, `Step ${index + 1}`, `Qadam ${index + 1}`)} · {step.kind === "lesson" ? t(lang, "Lesson with PNA Teacher", "PNA Teacher ke saath lesson") : t(lang, "Mission", "Mission")} · {minutes} min
                  {isNext ? <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] text-white">{t(lang, "Next up", "Agla")}</span> : null}
                  {done ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">{t(lang, "Done", "Mukammal")}</span> : null}
                </p>
                <h3 className="mt-2 text-lg font-bold text-navy-800">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {step.kind === "lesson" ? (lesson ? pick(lesson.hook, lang) : null) : pick(step.mission, lang)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {step.kind === "lesson" ? (
                    <Link
                      href={withPath(lesson?.href ?? `/learn/${step.lesson}`, path.slug)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition",
                        done ? "border border-teal-200 bg-white text-teal-800 hover:bg-teal-50" : "bg-teal-700 text-white hover:bg-teal-800",
                      )}
                    >
                      {done ? t(lang, "Revise lesson", "Lesson dohrayein") : t(lang, "Start lesson", "Lesson shuru karein")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={step.href}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
                      >
                        {t(lang, "Open the page", "Page kholein")} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      {done ? (
                        <button
                          type="button"
                          onClick={() => undoMission(path.slug, step.id)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t(lang, "Undo", "Wapas")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => completeMission(path.slug, step.id, step.title)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" /> {t(lang, "I've done this", "Main ne kar liya")}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
