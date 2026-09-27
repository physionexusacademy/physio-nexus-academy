import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Baby,
  BookOpen,
  Brain,
  Clock3,
  Dumbbell,
  FlaskConical,
  HeartPulse,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  knowledgeArticles,
  knowledgeSpecialties,
  type KnowledgeSpecialty,
} from "@/lib/knowledge-content";

export const metadata: Metadata = {
  title: "Physiotherapy Knowledge Hub",
  description:
    "Browse physiotherapy knowledge by specialty: MSK, neurological, cardiopulmonary, pediatrics, sports, geriatrics, pelvic health, pain science, rehabilitation and research.",
  alternates: {
    canonical: "https://physionexusacademy.com/knowledge-hub",
  },
};

const specialtyIcons: Record<KnowledgeSpecialty, typeof Stethoscope> = {
  "Musculoskeletal (MSK)": Activity,
  Neurological: Brain,
  Cardiopulmonary: HeartPulse,
  Pediatrics: Baby,
  Sports: Dumbbell,
  Geriatrics: Users,
  "Women's & Pelvic Health": Stethoscope,
  "Pain Science": Brain,
  "Exercise & Rehabilitation": Dumbbell,
  "Research & Evidence": FlaskConical,
};

export default function KnowledgeHubPage() {
  return (
    <div className="container-content section-padding">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
          PNA Physiotherapy Library
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Explore Physiotherapy by Specialty
        </h1>
        <p className="mt-4 leading-7 text-navy-600">
          Choose a specialty, then open the clinical topic you want to study. The library is
          designed for students, professionals and patients without making you search through
          unrelated material.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-navy-800">Browse by Specialty</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeSpecialties.map((specialty) => {
            const Icon = specialtyIcons[specialty.name];
            const count = knowledgeArticles.filter(
              (article) => article.specialty === specialty.name
            ).length;

            return (
              <Link
                key={specialty.slug}
                href={"#" + specialty.slug}
                className="group rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-navy-800">{specialty.name}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-500">{specialty.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-navy-400">
                    {count === 1 ? "1 article" : count + " articles"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-teal-600">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-14 space-y-14">
        {knowledgeSpecialties.map((specialty) => {
          const articles = knowledgeArticles.filter(
            (article) => article.specialty === specialty.name
          );

          return (
            <section
              key={specialty.slug}
              id={specialty.slug}
              className="scroll-mt-28"
            >
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-grey-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                    Specialty
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-navy-800">
                    {specialty.name}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-500">
                    {specialty.description}
                  </p>
                </div>
                <span className="text-sm font-semibold text-navy-400">
                  {articles.length === 1 ? "1 article" : articles.length + " articles"}
                </span>
              </div>

              {articles.length ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <article
                      key={article.slug}
                      className="flex h-full flex-col rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                          {article.category}
                        </span>
                        <span className="rounded-full bg-grey-100 px-3 py-1 text-xs font-semibold text-navy-500">
                          {article.audience}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold leading-snug text-navy-800">
                        {article.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-6 text-navy-500">
                        {article.excerpt}
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-navy-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {article.readTime}
                        </span>
                        <Link
                          href={"/knowledge-hub/" + article.slug}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
                        >
                          Read article <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-grey-300 bg-grey-50 p-5">
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
                    <div>
                      <p className="font-semibold text-navy-700">
                        This specialty is part of the PNA library.
                      </p>
                      <p className="mt-1 text-sm leading-6 text-navy-500">
                        New evidence-informed topics will be added here as the library grows.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-14 rounded-2xl bg-navy-800 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
          Weekly Clinical Challenge
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Test your clinical reasoning
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-grey-200">
          Five questions, 30 seconds per question, one Gmail attempt and a weekly leaderboard.
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
