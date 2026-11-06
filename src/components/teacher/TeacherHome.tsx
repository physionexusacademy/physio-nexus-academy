"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Compass, Flame, Layers, RefreshCcw, Target, Trophy, Zap } from "lucide-react";
import type { TeacherLang, TeacherLessonCard, TeacherPath, TeacherProfile } from "@/lib/teacher/types";
import { recommendPathSlug, stepsPerDay } from "@/lib/teacher/paths";
import {
  TEACHER_EVENT,
  clearTeacherProfile,
  getDeck,
  getDueCardIds,
  getTeacherLang,
  getTeacherProfile,
  getTeacherProgress,
  isStepDone,
  pathCompletion,
  setTeacherLang,
  type TeacherProgress,
} from "@/lib/teacher/progress";
import { getUnifiedProgress } from "@/lib/unified-progress";
import { cn } from "@/lib/utils";
import { WelcomeChat } from "./WelcomeChat";
import { LangToggle, RichText, TeacherBubble, pick, t } from "./ui";

type Snapshot = {
  profile: TeacherProfile | null;
  progress: TeacherProgress;
  due: number;
  deckSize: number;
  streak: number;
  xp: number;
  lang: TeacherLang;
};

function readSnapshot(): Snapshot {
  const deck = getDeck();
  const unified = getUnifiedProgress();
  return {
    profile: getTeacherProfile(),
    progress: getTeacherProgress(),
    due: getDueCardIds(deck).length,
    deckSize: Object.keys(deck).length,
    streak: unified.currentStreak,
    xp: unified.totalXP,
    lang: getTeacherLang(),
  };
}

export function useTeacherSnapshot() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const refresh = useCallback(() => setSnapshot(readSnapshot()), []);
  useEffect(() => {
    refresh();
    window.addEventListener(TEACHER_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("pna-unified-progress-updated", refresh);
    return () => {
      window.removeEventListener(TEACHER_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pna-unified-progress-updated", refresh);
    };
  }, [refresh]);
  return snapshot;
}

export function TeacherHome({ lessons, paths }: { lessons: TeacherLessonCard[]; paths: TeacherPath[] }) {
  const snapshot = useTeacherSnapshot();
  // Keep the welcome conversation on screen until the learner has seen their plan,
  // even though the profile is saved the moment the last question is answered.
  const [onboarding, setOnboarding] = useState(false);
  useEffect(() => {
    if (snapshot && !snapshot.profile) setOnboarding(true);
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm" aria-busy="true">
        Preparing your teacher…
      </div>
    );
  }

  if (!snapshot.profile || onboarding) {
    return (
      <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/40 to-white p-4 shadow-sm sm:p-6">
        <WelcomeChat lessons={lessons} onComplete={() => setOnboarding(false)} />
      </div>
    );
  }

  const { profile, progress, lang } = snapshot;
  const lessonMap = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  const path = paths.find((item) => item.slug === recommendPathSlug(profile)) ?? paths[0];
  const completion = pathCompletion(path, progress);
  const todaySteps = path.steps.filter((step) => !isStepDone(path, step, progress)).slice(0, stepsPerDay(profile.minutes));
  const lessonsDone = Object.keys(progress.lessons).length;
  const name = profile.name ? `, ${profile.name}` : "";
  const otherPath = paths.find((item) => item.slug !== path.slug && !pathCompletion(item, progress).complete);

  const greeting =
    lessonsDone === 0
      ? t(lang, `Assalam-o-Alaikum${name}! 👋 Ready for your first lesson? I've picked the perfect starting point for you.`, `Assalam-o-Alaikum${name}! 👋 Pehle lesson ke liye tayyar? Main ne aap ke liye behtareen shuruaat chuni hai.`)
      : t(lang, `Welcome back${name}! 👋 You've completed **${lessonsDone} lesson${lessonsDone > 1 ? "s" : ""}** so far. Let's keep the momentum going.`, `Khush aamdeed${name}! 👋 Aap ab tak **${lessonsDone} lesson** mukammal kar chuke hain. Raftaar barqarar rakhte hain.`);

  return (
    <div className="space-y-5" data-pna-teacher-dashboard="v1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LangToggle lang={lang} onChange={(value) => setTeacherLang(value)} />
        <button
          type="button"
          onClick={() => {
            setOnboarding(true);
            clearTeacherProfile();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700"
        >
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t(lang, "Change my answers", "Apne jawab badlein")}
        </button>
      </div>

      <TeacherBubble>
        <RichText text={greeting} />
        <p className="mt-2 font-bold text-navy-800">
          {completion.complete
            ? t(lang, `You've finished the ${path.title} path. 🏆 Amazing work!`, `Aap ne ${path.title} path mukammal kar liya. 🏆 Kamaal!`)
            : t(lang, `Here's your plan for today (about ${profile.minutes} minutes):`, `Aaj ka plan (taqreeban ${profile.minutes} minute):`)}
        </p>
      </TeacherBubble>

      <ol className="grid gap-3 sm:grid-cols-2">
        {todaySteps.map((step, index) => {
          const isLesson = step.kind === "lesson";
          const lesson = isLesson ? lessonMap.get(step.lesson) : undefined;
          const title = isLesson ? lesson?.title ?? step.lesson : step.title;
          const href = isLesson ? `/learn/${step.lesson}?path=${path.slug}` : `/learn/paths/${path.slug}#step-${step.id}`;
          const minutes = isLesson ? lesson?.minutes ?? 10 : step.minutes;
          return (
            <li key={step.id}>
              <Link
                href={href}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                  index === 0 ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200",
                )}
              >
                <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700">
                  {isLesson ? <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> : <Target className="h-3.5 w-3.5" aria-hidden="true" />}
                  {index === 0 ? t(lang, "Start here", "Yahan se shuru") : t(lang, "Then", "Phir")} · {isLesson ? t(lang, "Lesson", "Lesson") : t(lang, "Mission", "Mission")} · {minutes} min
                </span>
                <span className="mt-2 font-bold leading-snug text-navy-800 group-hover:text-teal-800">{title}</span>
                {lesson ? <span className="mt-1 text-sm leading-6 text-slate-600">{pick(lesson.hook, lang)}</span> : null}
                {!isLesson ? <span className="mt-1 text-sm leading-6 text-slate-600">{pick(step.mission, lang)}</span> : null}
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-teal-700">
                  {isLesson ? t(lang, "Start lesson", "Lesson shuru") : t(lang, "Open mission", "Mission kholein")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
        {snapshot.due > 0 ? (
          <li>
            <Link href="/learn/review" className="group flex h-full flex-col rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-700">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" /> {t(lang, "Spaced review · 2 min", "Spaced review · 2 min")}
              </span>
              <span className="mt-2 font-bold text-navy-800">
                {t(lang, `${snapshot.due} flashcard${snapshot.due > 1 ? "s" : ""} due today`, `Aaj ${snapshot.due} flashcards due hain`)}
              </span>
              <span className="mt-1 text-sm leading-6 text-slate-600">
                {t(lang, "Reviewing right before you forget is the fastest way to remember for good.", "Bhoolne se theek pehle review karna hamesha yaad rakhne ka sab se tez tareeqa hai.")}
              </span>
            </Link>
          </li>
        ) : null}
        {completion.complete && otherPath ? (
          <li>
            <Link href={`/learn/paths/${otherPath.slug}`} className="group flex h-full flex-col rounded-2xl border border-teal-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {t(lang, "Next path", "Agla path")}
              </span>
              <span className="mt-2 font-bold text-navy-800">{otherPath.title}</span>
              <span className="mt-1 text-sm leading-6 text-slate-600">{pick(otherPath.tagline, lang)}</span>
            </Link>
          </li>
        ) : null}
        <li>
          <Link href="/daily-challenge#play-daily" className="group flex h-full flex-col rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> {t(lang, "Bonus · 3 min", "Bonus · 3 min")}
            </span>
            <span className="mt-2 font-bold text-navy-800">{t(lang, "Today's Daily Clinical Challenge", "Aaj ka Daily Clinical Challenge")}</span>
            <span className="mt-1 text-sm leading-6 text-slate-600">{t(lang, "Five questions to test yourself against other learners.", "Paanch sawal — doosre learners ke muqablay mein khud ko test karein.")}</span>
          </Link>
        </li>
      </ol>

      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <Link href={`/learn/paths/${path.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{t(lang, "Your learning path", "Aap ka learning path")}</p>
          <p className="mt-1 font-bold text-navy-800 group-hover:text-teal-800">{path.title}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={completion.total} aria-valuenow={completion.done} aria-label={t(lang, "Path progress", "Path progress")}>
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(completion.done / completion.total) * 100}%` }} />
            </div>
            <span className="text-xs font-bold tabular-nums text-slate-600">
              {completion.done}/{completion.total}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
            {t(lang, "See every step", "Har qadam dekhein")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" /> {t(lang, "Lessons", "Lessons")}
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-navy-800">
              {lessonsDone}/{lessons.length}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Layers className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" /> {t(lang, "Cards due", "Cards due")}
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-navy-800">
              {snapshot.due}
              <span className="text-xs font-semibold text-slate-400">/{snapshot.deckSize}</span>
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" /> {t(lang, "Streak", "Streak")}
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-navy-800">
              {snapshot.streak}
              <span className="ml-1 text-xs font-semibold text-slate-400">{t(lang, "days", "din")}</span>
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Zap className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" /> XP
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-navy-800">{snapshot.xp.toLocaleString()}</dd>
          </div>
        </dl>
      </div>
      <p className="text-xs text-slate-500">{t(lang, "Your progress is saved on this device and browser.", "Aap ki progress isi device aur browser par save hoti hai.")}</p>
    </div>
  );
}
