import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Baby,
  Brain,
  BrainCircuit,
  Clock3,
  Dumbbell,
  FlaskConical,
  HeartPulse,
  Stethoscope,
  Users,
  Hand,
  ClipboardList,
} from "lucide-react";
import {
  knowledgeSpecialties,
  type KnowledgeSpecialty,
} from "@/lib/knowledge-content";
import { allKnowledgeArticles } from "@/lib/all-knowledge-content";

export const metadata: Metadata = {
  title: "Physiotherapy Knowledge Hub",
  description:
    "Explore evidence-informed physiotherapy learning by specialty, level and clinical topic, with a dedicated case-based reasoning lab.",
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

const specialtyTones = [
  "from-cyan-50 to-teal-50 border-cyan-100 text-cyan-800",
  "from-violet-50 to-indigo-50 border-violet-100 text-violet-800",
  "from-rose-50 to-orange-50 border-rose-100 text-rose-800",
  "from-amber-50 to-yellow-50 border-amber-100 text-amber-800",
  "from-emerald-50 to-lime-50 border-emerald-100 text-emerald-800",
  "from-sky-50 to-blue-50 border-sky-100 text-sky-800",
  "from-pink-50 to-rose-50 border-pink-100 text-pink-800",
  "from-fuchsia-50 to-violet-50 border-fuchsia-100 text-fuchsia-800",
  "from-teal-50 to-emerald-50 border-teal-100 text-teal-800",
  "from-indigo-50 to-cyan-50 border-indigo-100 text-indigo-800",
];

export default function KnowledgeHubPage() {
  const featured = allKnowledgeArticles
    .slice()
    .sort((a, b) => (b.level === "Advanced" ? 1 : 0) - (a.level === "Advanced" ? 1 : 0))
    .slice(0, 4);

  return (
    <div className="container-content section-padding">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-700 to-navy-800 p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
          PNA Physiotherapy Library
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
          Study by specialty. Go deeper by level. Apply it in cases.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-cyan-50 sm:text-lg">
          A structured physiotherapy learning portal for students and professionals — from core
          concepts to advanced clinical reasoning, evidence sources and case-based learning.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="#specialties"
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy-800 shadow-sm transition hover:-translate-y-0.5"
          >
            Browse Specialties
          </Link>
          <Link
            href="/case-lab"
            className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            Open Clinical Case Lab
          </Link>
          <Link
            href="/clinical-quiz"
            className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            Weekly Clinical Quiz
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <div className="grid gap-5 md:grid-cols-3">
          <a
            href="/msk-injuries"
            className="group overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white">
              <Activity className="h-6 w-6" />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-orange-700">
              MSK Clinical Library
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800">
              MSK Injury & Rehabilitation
            </h2>
            <p className="mt-3 text-sm leading-6 text-navy-600">
              Study sprains, strains, tendinopathies, tendon ruptures, arthritis,
              instability and nerve-compression conditions with tests and phased rehabilitation.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-orange-700">
              Open clinical library
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
          <Link
            href="/manual-therapy"
            className="group overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white">
              <Hand className="h-6 w-6" />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-violet-700">
              Clinical Mastery
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800">
              Manual Therapy Mastery
            </h2>
            <p className="mt-3 text-sm leading-6 text-navy-600">
              Study major manual-therapy systems with science, setup, hand placement,
              dosage, safety, procedure and immediate reassessment.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-violet-700">
              Open mastery library
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/treatment-plans"
            className="group overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white">
              <ClipboardList className="h-6 w-6" />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-teal-700">
              Clinical Pathways
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800">
              Condition-Based Treatment Plans
            </h2>
            <p className="mt-3 text-sm leading-6 text-navy-600">
              Move from assessment and red flags to modalities, manual therapy,
              exercise prescription, home program, progression and referral criteria.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
              Browse treatment plans
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      <section id="specialties" className="mt-12 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
              Browse by Specialty
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
              Choose what you want to study
            </h2>
          </div>
          <p className="text-sm text-navy-400">
            {allKnowledgeArticles.length} learning articles and growing
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeSpecialties.map((specialty, index) => {
            const Icon = specialtyIcons[specialty.name];
            const count = allKnowledgeArticles.filter(
              (article) => article.specialty === specialty.name
            ).length;

            return (
              <Link
                key={specialty.slug}
                href={"/knowledge-hub/specialty/" + specialty.slug}
                className={"group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 transition hover:-translate-y-1 hover:shadow-lg " + specialtyTones[index % specialtyTones.length]}
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/35 blur-2xl" />
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-navy-800">{specialty.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy-600">
                    {specialty.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-navy-500">
                      {count} {count === 1 ? "article" : "articles"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-700">
              Higher-Level Learning
            </p>
            <h2 className="mt-1 text-2xl font-bold text-navy-800 sm:text-3xl">
              Featured clinical topics
            </h2>
          </div>
          <Link href="/case-lab" className="text-sm font-bold text-violet-700">
            Clinical Case Lab →
          </Link>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {featured.map((article, index) => {
            const level = article.level ?? "Clinical";
            const tones = [
              "from-violet-50 to-white border-violet-100",
              "from-amber-50 to-white border-amber-100",
              "from-cyan-50 to-white border-cyan-100",
              "from-emerald-50 to-white border-emerald-100",
            ];
            return (
              <Link
                key={article.slug}
                href={"/knowledge-hub/" + article.slug}
                className={"rounded-3xl border bg-gradient-to-br p-6 transition hover:-translate-y-1 hover:shadow-lg " + tones[index % tones.length]}
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-700">
                    {article.specialty}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-700">
                    {level} Level
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-navy-800">{article.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-navy-600">{article.excerpt}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-400">
                    <Clock3 className="h-4 w-4" /> {article.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-navy-700">
                    Study <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-navy-800 p-7 text-white shadow-xl sm:p-9">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-white/10 p-3">
              <BrainCircuit className="h-7 w-7 text-violet-100" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">
                Clinical Case Lab
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Symptoms → differential → diagnosis → treatment
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-50">
                Work through evidence-based simulated cases and see exactly how clinical findings
                change the diagnosis, urgency and rehabilitation plan.
              </p>
            </div>
          </div>
          <Link
            href="/case-lab"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-800 shadow-sm"
          >
            Open Case Lab <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
