"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, X } from "lucide-react";
import type { TeacherLessonCard } from "@/lib/teacher/types";
import { lessonsOf, placeLesson, subjects, unitsOf } from "@/lib/teacher/subjects";
import { useTeacherSnapshot } from "./TeacherHome";
import { subjectIcons } from "./subject-ui";
import { t } from "./ui";

/**
 * The PNA Teacher classroom: one door per subject. Opening a door goes to the subject's own room (/learn/subjects/<id>), where its units and topics are.
 * Lessons are never shown here as one mixed list; the search shows matches under their subject and unit.
 */
export function Classroom({ lessons }: { lessons: TeacherLessonCard[] }) {
  const snapshot = useTeacherSnapshot();
  const lang = snapshot?.lang ?? "en";
  const done = (slug: string) => !!snapshot?.progress.lessons[slug];
  const [query, setQuery] = useState("");

  const rooms = useMemo(
    () => subjects.map((subject) => ({ subject, lessons: lessonsOf(subject, lessons), units: unitsOf(subject, lessons).length })).filter((room) => room.lessons.length > 0),
    [lessons],
  );

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (q.length < 2) return [];
    return lessons
      .filter((lesson) => `${lesson.title} ${lesson.hook.en} ${lesson.area}`.toLowerCase().includes(q))
      .slice(0, 12)
      .map((lesson) => ({ lesson, place: placeLesson(lesson) }));
  }, [lessons, q]);

  return (
    <div role="region" aria-labelledby="pna-classroom-h" className="pna-classroom" data-pna-classroom="v1">
      <div className="pna-board">
        <p className="pna-board-kicker">{t(lang, "Your classroom", "Aap ki classroom")}</p>
        <h2 id="pna-classroom-h" className="pna-board-title">{t(lang, "Choose a subject", "Subject chunein")}</h2>
        <p className="pna-board-sub">
          {t(lang, `${rooms.length} subjects · ${lessons.length} topics. Open a subject, pick a unit, then a topic.`, `${rooms.length} subjects · ${lessons.length} topics. Subject kholein, unit chunein, phir topic.`)}
        </p>
        <label className="pna-search">
          <Search aria-hidden="true" className="h-5 w-5 flex-none" />
          <span className="sr-only">{t(lang, "Search all topics", "Saare topics mein dhoondein")}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(lang, "Search a topic, e.g. ACL, p-value, stroke", "Topic dhoondein, jaise ACL, p-value, stroke")} />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label={t(lang, "Clear the search", "Search saaf karein")} className="pna-search-clear"><X className="h-4 w-4" aria-hidden="true" /></button>
          ) : null}
        </label>
        {q.length >= 2 ? (
          <ul className="pna-search-results" aria-live="polite">
            {matches.length === 0 ? <li className="pna-search-empty">{t(lang, "No topic found. Try another word.", "Koi topic nahi mila. Koi aur lafz try karein.")}</li> : null}
            {matches.map(({ lesson, place }) => (
              <li key={lesson.slug}>
                <Link href={lesson.href} className="pna-search-hit">
                  <span className="pna-search-where">{place ? `${lang === "ur" ? place.subject.titleUr : place.subject.title} › ${lang === "ur" ? place.unit.titleUr : place.unit.title}` : lesson.area}</span>
                  <span className="pna-search-title">{done(lesson.slug) ? <CheckCircle2 aria-label={t(lang, "Done", "Mukammal")} className="mr-1 inline h-4 w-4 text-teal-300" /> : null}{lesson.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ul className="pna-doors" aria-label={t(lang, "Subjects", "Subjects")}>
        {rooms.map(({ subject, lessons: inSubject, units }) => {
          const Icon = subjectIcons[subject.icon];
          const finished = inSubject.filter((lesson) => done(lesson.slug)).length;
          const percent = inSubject.length ? Math.round((finished / inSubject.length) * 100) : 0;
          return (
            <li key={subject.id}>
              <Link href={`/learn/subjects/${subject.id}`} className="pna-door" style={{ "--g1": subject.glow[0], "--g2": subject.glow[1] } as CSSProperties} data-subject={subject.id}>
                <span className="pna-door-icon"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <span className="pna-door-title">{lang === "ur" ? subject.titleUr : subject.title}</span>
                <span className="pna-door-tag">{lang === "ur" ? subject.taglineUr : subject.tagline}</span>
                <span className="pna-door-meta">
                  {units > 1 ? `${units} ${t(lang, "units", "units")} · ` : ""}
                  {inSubject.length} {inSubject.length === 1 ? t(lang, "topic", "topic") : t(lang, "topics", "topics")}
                  {finished ? ` · ${finished} ${t(lang, "done", "mukammal")}` : ""}
                </span>
                <span className="pna-door-bar" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
                <span className="pna-door-go">{t(lang, finished ? "Continue" : "Enter", finished ? "Jaari rakhein" : "Andar jayein")} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
