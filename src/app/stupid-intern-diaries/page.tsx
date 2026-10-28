import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { stupidInternEpisodes, getLatestEpisode } from "@/lib/stupid-intern-diaries";
import { EpisodeArchive } from "./EpisodeArchive";

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f9f7] to-white">
      <div className="container-content py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 text-teal-800 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <span aria-hidden="true">/</span>
          <span>Stupid Intern Diaries</span>
        </nav>

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

        <EpisodeArchive episodes={stupidInternEpisodes} />

        <p className="mt-10 text-center text-sm text-slate-500">
          New episode every day at 12:00 AM Pakistan Time. All previous episodes stay available.
        </p>
      </div>
    </main>
  );
}
