"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronDown, Clock, PlayCircle, Route } from "lucide-react";
import type { TeacherLessonCard, TeacherPath } from "@/lib/teacher/types";
import { subjectById, unitsOf, type SubjectId } from "@/lib/teacher/subjects";
import { pathCompletion } from "@/lib/teacher/progress";
import { useTeacherSnapshot } from "./TeacherHome";
import { subjectIcons } from "./subject-ui";
import { pick, t } from "./ui";

/** One subject's room: its units in teaching order (like chapters), each with its topics; and the guided courses for this subject. */
export function SubjectRoom({ subjectId, lessons, paths }: { subjectId: SubjectId; lessons: TeacherLessonCard[]; paths: TeacherPath[] }) {
  const subject = subjectById(subjectId)!;
  const snapshot = useTeacherSnapshot();
  const lang = snapshot?.lang ?? "en";
  const done = (slug: string) => !!snapshot?.progress.lessons[slug];
  const units = unitsOf(subject, lessons);
  const Icon = subjectIcons[subject.icon];
  const finished = lessons.filter((lesson) => done(lesson.slug)).length;
  const percent = lessons.length ? Math.round((finished / lessons.length) * 100) : 0;
  // the first unit with an unfinished topic opens by itself; the student can open any other
  const firstOpen = units.find((group) => group.lessons.some((lesson) => !done(lesson.slug)))?.unit.id ?? units[0]?.unit.id;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => open[id] ?? id === firstOpen;
  const next = units.flatMap((group) => group.lessons).find((lesson) => !done(lesson.slug));

  return (
    <div className="pna-room" style={{ "--g1": subject.glow[0], "--g2": subject.glow[1] } as CSSProperties} data-pna-subject={subject.id}>
      <nav aria-label={t(lang, "Breadcrumb", "Raasta")} className="pna-room-crumbs">
        <Link href="/learn" className="pna-room-back"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t(lang, "Classroom", "Classroom")}</Link>
      </nav>

      <header className="pna-room-head">
        <span className="pna-room-icon"><Icon className="h-8 w-8" aria-hidden="true" /></span>
        <div className="min-w-0">
          <p className="pna-board-kicker">{t(lang, "Subject", "Subject")}</p>
          <h1 className="pna-room-title">{lang === "ur" ? subject.titleUr : subject.title}</h1>
          <p className="pna-room-tag">{lang === "ur" ? subject.taglineUr : subject.tagline}</p>
          <div className="pna-room-progress">
            <span className="pna-door-bar" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
            <span className="tabular-nums">{finished}/{lessons.length} {t(lang, "topics done", "topics mukammal")}</span>
          </div>
          {next ? (
            <Link href={next.href} className="pna-room-next"><PlayCircle className="h-5 w-5" aria-hidden="true" /> {t(lang, finished ? "Continue with" : "Start with", finished ? "Jaari rakhein:" : "Shuru karein:")} {next.title}</Link>
          ) : null}
        </div>
      </header>

      <ol className="pna-units">
        {units.map(({ unit, lessons: inUnit }, index) => {
          const unitDone = inUnit.filter((lesson) => done(lesson.slug)).length;
          const opened = isOpen(unit.id);
          const panelId = `unit-${unit.id}`;
          return (
            <li key={unit.id} className="pna-unit" data-open={opened}>
              <button type="button" className="pna-unit-head" aria-expanded={opened} aria-controls={panelId} onClick={() => setOpen((old) => ({ ...old, [unit.id]: !opened }))}>
                <span className="pna-unit-num" aria-hidden="true">{unitDone === inUnit.length ? <CheckCircle2 className="h-5 w-5" /> : index + 1}</span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="pna-unit-kicker">{t(lang, `Unit ${index + 1}`, `Unit ${index + 1}`)}</span>
                  <span className="pna-unit-title">{lang === "ur" ? unit.titleUr : unit.title}</span>
                  <span className="pna-unit-meta">{inUnit.length} {inUnit.length === 1 ? t(lang, "topic", "topic") : t(lang, "topics", "topics")}{unitDone ? ` · ${unitDone} ${t(lang, "done", "mukammal")}` : ""}</span>
                </span>
                <ChevronDown className="pna-unit-chev h-5 w-5 flex-none" aria-hidden="true" />
              </button>
              {opened ? (
                <ol id={panelId} className="pna-topics">
                  {inUnit.map((lesson, i) => {
                    const isDone = done(lesson.slug);
                    return (
                      <li key={lesson.slug}>
                        <Link href={lesson.href} className="pna-topic" data-done={isDone}>
                          <span className="pna-topic-num" aria-hidden="true">{isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}</span>
                          <span className="min-w-0 flex-1">
                            <span className="pna-topic-title">{lesson.title}</span>
                            <span className="pna-topic-hook">{pick(lesson.hook, lang)}</span>
                          </span>
                          <span className="pna-topic-time"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{lesson.minutes}′</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>

      {paths.length ? (
        <div role="region" className="pna-courses" aria-labelledby="pna-courses-h">
          <h2 id="pna-courses-h" className="pna-courses-h">{t(lang, "Guided courses in this subject", "Is subject ke guided courses")}</h2>
          <p className="pna-room-tag">{t(lang, "A course is a set route: lessons in order, then practice on the rest of PNA.", "Course ek tay shuda raasta hai: tarteeb se lessons, phir PNA par practice.")}</p>
          <ul className="pna-course-list">
            {paths.map((path) => {
              const status = snapshot ? pathCompletion(path, snapshot.progress) : { done: 0, total: path.steps.length, complete: false };
              return (
                <li key={path.slug}>
                  <Link href={`/learn/paths/${path.slug}`} className="pna-course">
                    <Route className="h-5 w-5 flex-none" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="pna-topic-title">{path.title}</span>
                      <span className="pna-topic-hook">{pick(path.tagline, lang)}</span>
                    </span>
                    <span className="pna-topic-time tabular-nums">{status.complete ? "✓ " : ""}{status.done}/{status.total}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
