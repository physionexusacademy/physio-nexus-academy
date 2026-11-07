import { ArrowRight, GraduationCap, Languages, Layers, MousePointerClick } from "lucide-react";
import { conceptLessonMetas } from "@/lib/teacher/lesson-index";

/**
 * Homepage introduction to PNA Teacher. Server-rendered and static: the sample
 * conversation shows how the teacher talks without loading any lesson code.
 */
export function MeetPnaTeacher() {
  const featured = ["convex-concave-rule", "red-flags-screening", "dermatomes-myotomes-reflexes", "gait-cycle", "pain-science-basics"]
    .map((slug) => conceptLessonMetas.find((lesson) => lesson.slug === slug))
    .filter((lesson): lesson is (typeof conceptLessonMetas)[number] => Boolean(lesson));

  return (
    <section className="container-content py-6 sm:py-8" aria-labelledby="meet-pna-teacher-title" data-pna-home-teacher="v1">
      <div className="overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/70 to-cyan-50/60 shadow-sm">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> New · Free
            </p>
            <h2 id="meet-pna-teacher-title" className="mt-3 text-2xl font-bold leading-tight tracking-tight text-navy-800 sm:text-4xl">
              Meet PNA Teacher.
              <span className="block text-teal-700">Hard concepts, explained step by step.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Tell PNA Teacher your year and your goal. It builds your plan, then talks you through each concept — one small idea at a time, with analogies, interactive
              visuals and quick checks that explain every mistake. All 35 Manual Therapy techniques now teach this way too.
            </p>
            <ul className="mt-4 grid gap-2 text-sm font-semibold text-navy-700 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-teal-700" aria-hidden="true" /> English & Roman Urdu
              </li>
              <li className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-teal-700" aria-hidden="true" /> Interactive visuals
              </li>
              <li className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-700" aria-hidden="true" /> Spaced flashcards
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="/learn" className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800">
                Start learning with PNA Teacher <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="/learn#pna-teacher-paths" className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-50">
                See learning paths
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5" aria-label="Example of a PNA Teacher conversation">
            <div className="space-y-3 text-sm leading-6">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-navy-700 text-white" aria-hidden="true">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <p className="rounded-2xl rounded-tl-md border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-slate-700">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-sky-800">❓ Quick check</span>A patient abducts their arm. Which way
                  does the humeral head glide?
                </p>
              </div>
              <div className="flex justify-end">
                <p className="rounded-2xl rounded-tr-md bg-teal-700 px-3.5 py-2 font-semibold text-white">Superior (up)</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-8 flex-none" aria-hidden="true" />
                <p className="rounded-2xl rounded-tl-md border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-slate-700">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-800">🤔 Not quite</span>
                  Tempting! Up is the <strong className="text-navy-800">roll</strong>. A convex head glides the <strong className="text-navy-800">opposite</strong> way — inferior.
                  Want to see it move?
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pl-10">
                <span className="rounded-full bg-teal-700 px-3 py-1.5 text-xs font-bold text-white">Show me 👀</span>
                <span className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800">Roman Urdu mein samjhao</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-teal-100 bg-white/60 px-5 py-4 sm:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Popular lessons</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {featured.map((lesson) => (
              <li key={lesson.slug}>
                <a
                  href={`/learn/${lesson.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  {lesson.title} <span className="font-semibold text-slate-400">· {lesson.minutes} min</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="/learn#manual-therapy"
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 transition hover:border-teal-400"
              >
                🖐 All 35 Manual Therapy techniques
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
