import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, GraduationCap, Stethoscope } from "lucide-react";
import { knowledgeArticles } from "@/lib/knowledge-content";

export const metadata: Metadata = {
  title: "Physiotherapy Knowledge Hub",
  description:
    "Simple, practical and evidence-informed physiotherapy learning for students, professionals and patients from Physio Nexus Academy.",
  alternates: {
    canonical: "https://physionexusacademy.com/knowledge-hub",
  },
};

export default function KnowledgeHubPage() {
  return (
    <div className="container-content section-padding">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
          Learn with PNA
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Physiotherapy Knowledge Hub
        </h1>
        <p className="mt-4 text-navy-600">
          Clear clinical concepts, patient education and practical physiotherapy learning —
          published as lightweight static content so the library can grow without filling the PNA database.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-grey-200 bg-grey-50 p-5">
          <GraduationCap className="h-6 w-6 text-teal-500" />
          <p className="mt-3 font-semibold text-navy-800">For Students</p>
          <p className="mt-1 text-sm text-navy-500">Concepts explained in practical clinical language.</p>
        </div>
        <div className="rounded-xl border border-grey-200 bg-grey-50 p-5">
          <BookOpen className="h-6 w-6 text-teal-500" />
          <p className="mt-3 font-semibold text-navy-800">For Professionals</p>
          <p className="mt-1 text-sm text-navy-500">Quick refreshers and evidence-informed summaries.</p>
        </div>
        <div className="rounded-xl border border-grey-200 bg-grey-50 p-5">
          <Stethoscope className="h-6 w-6 text-teal-500" />
          <p className="mt-3 font-semibold text-navy-800">For Patients</p>
          <p className="mt-1 text-sm text-navy-500">Simple education, safety guidance and when-to-seek-care information.</p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {knowledgeArticles.map((article) => (
          <article
            key={article.slug}
            className="flex h-full flex-col rounded-2xl border border-grey-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {article.category}
              </span>
              <span className="rounded-full bg-grey-100 px-3 py-1 text-xs font-semibold text-navy-500">
                {article.audience}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold leading-snug text-navy-800">
              {article.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-navy-500">
              {article.excerpt}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-navy-400">
                <Clock3 className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
              <Link
                href={`/knowledge-hub/${article.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                Read article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-navy-800 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
          Weekly Clinical Challenge
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Test your clinical reasoning in 5 questions
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-grey-200">
          You get one attempt per Gmail, 30 seconds for each question, and your score/time are stored for the weekly leaderboard.
        </p>
        <Link
          href="/clinical-quiz"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
        >
          Take this week&apos;s quiz <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
