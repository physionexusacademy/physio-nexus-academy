import { BookOpenText, Clock3, Languages, Layers, Target } from "lucide-react";
import { getLessonMeta } from "@/lib/teacher/lesson-index";
import { LessonPlayer } from "./LessonPlayer";
import { TeacherAvatar } from "./ui";
import "@/app/learn/teacher.css";

/**
 * PNA Teacher at the top of a Manual Therapy chapter. The full reference chapter
 * stays below for reading and revision.
 */
export function TechniqueTeacher({ slug, readAnchor = "#mastery" }: { slug: string; readAnchor?: string }) {
  const lesson = getLessonMeta(slug);
  if (!lesson || lesson.kind !== "manual") return null;
  const checks = lesson.checks;

  return (
    <section
      id="pna-teacher"
      aria-labelledby="pna-technique-teacher-title"
      data-pna-technique-teacher={slug}
      className="mt-6 scroll-mt-24 rounded-3xl border border-teal-100 bg-gradient-to-b from-teal-50/70 via-white to-white px-4 pb-6 pt-5 shadow-sm sm:px-6 sm:pt-6"
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-3">
          <TeacherAvatar size="lg" />
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-700">Learn it step by step · PNA Teacher</p>
            <h2 id="pna-technique-teacher-title" className="mt-1 text-xl font-bold leading-snug text-navy-800 sm:text-2xl">
              Let me teach you {lesson.title}
            </h2>
            <ul className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-600">
              <li className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                <Clock3 className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> ~{lesson.minutes} min
              </li>
              <li className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                <Target className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> {checks} checks
              </li>
              <li className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                <Layers className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> {lesson.flashcardCount} flashcards
              </li>
              <li className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                <Languages className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> English · Roman Urdu
              </li>
            </ul>
            <a href={readAnchor} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700">
              <BookOpenText className="h-3.5 w-3.5" aria-hidden="true" /> Prefer to read? The full reference chapter is below.
            </a>
          </div>
        </div>
      </div>
      <LessonPlayer meta={lesson} />
    </section>
  );
}
