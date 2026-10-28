import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Flame, AlertTriangle } from "lucide-react";
import { stupidInternEpisodes, getLatestEpisode } from "@/lib/stupid-intern-diaries";

export const metadata: Metadata = {
  title: "Stupid Intern Diaries | Daily Clinical Humor & Lessons",
  description:
    "Daily funny conversations between Dr. Sajjad and the Stupid Intern. Learn important physiotherapy lessons through sharp humor and real clinical mistakes.",
  alternates: {
    canonical: "https://physionexusacademy.com/stupid-intern-diaries",
  },
};

export default function StupidInternDiariesPage() {
  const latest = getLatestEpisode();
  const older = stupidInternEpisodes.slice(1);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f9f7] to-white">
      <div className="container-content py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 text-teal-800 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <span aria-hidden="true">/</span>
          <span>Stupid Intern Diaries</span>
        </nav>

        {/* Hero */}
        <header className="mt-6 rounded-3xl border border-[#c5e8df] bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-800">
              <Flame className="h-4 w-4" /> Daily Series
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800">
              Episode #{latest.id}
            </span>
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#193e50] sm:text-4xl">
            Stupid Intern Diaries
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Real clinic conversations. Dangerous mistakes. Sharp lessons.
            Learn what <span className="font-semibold text-teal-800">never</span> to do — through the daily disasters of one very confident intern.
          </p>
        </header>

        {/* Today's Episode */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#193e50]">Today’s Episode</h2>
            <span className="text-sm text-slate-500">{latest.date}</span>
          </div>

          <article className="overflow-hidden rounded-3xl border border-[#c5e8df] bg-white shadow-md">
            {/* Episode Header */}
            <div className="border-b border-[#e0f2ee] bg-gradient-to-r from-teal-50 to-white px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">
                  EP {latest.id}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {latest.field}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-[#193e50] sm:text-2xl">{latest.title}</h3>
            </div>

            {/* Dialogue */}
            <div className="space-y-5 px-6 py-6">
              {latest.dialogue.map((line, idx) => (
                <div key={idx} className="flex gap-3 justify-start">
                  <div className="min-w-0 flex-1">
                    <div
                      className={`inline-block max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-6 sm:text-[15px] ${
                        line.speaker === "Dr. Sajjad"
                          ? "bg-teal-700 text-white"
                          : line.speaker === "Intern"
                          ? "bg-slate-100 text-slate-800"
                          : "bg-amber-50 text-amber-900 border border-amber-200"
                      }`}
                    >
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-80">
                        {line.speaker === "Other" ? "Senior Doctor" : line.speaker}
                      </span>
                      {line.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lesson Box */}
            <div className="border-t border-red-100 bg-red-50 px-6 py-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-red-700">Never do this</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-red-900">{latest.lesson}</p>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* Archive */}
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-700" />
            <h2 className="text-lg font-bold text-[#193e50]">Previous Episodes</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {older.map((ep) => (
              <div
                key={ep.id}
                className="rounded-2xl border border-[#dbece7] bg-white p-5 transition hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                    EP {ep.id}
                  </span>
                  <span className="text-xs text-slate-400">{ep.date}</span>
                </div>
                <h3 className="mt-2 font-bold text-[#193e50]">{ep.title}</h3>
                <p className="mt-1 text-xs font-medium text-teal-700">{ep.field}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{ep.lesson}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <p className="mt-10 text-center text-sm text-slate-500">
          New episode every day at 12:00 AM Pakistan Time. All previous episodes stay available.
        </p>
      </div>
    </main>
  );
}
