import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BrainCircuit, Clock3, Layers3 } from "lucide-react";
import { knowledgeSpecialties } from "@/lib/knowledge-content";
import { allKnowledgeArticles } from "@/lib/all-knowledge-content";
import { clinicalCases } from "@/lib/all-clinical-cases";

export function generateStaticParams() {
  return knowledgeSpecialties.map((specialty) => ({ slug: specialty.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const specialty = knowledgeSpecialties.find((item) => item.slug === slug);
  if (!specialty) return {};
  return {
    title: specialty.name + " Physiotherapy Knowledge",
    description: specialty.description,
    alternates: { canonical: "https://physionexusacademy.com/knowledge-hub/specialty/" + specialty.slug },
  };
}

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const specialty = knowledgeSpecialties.find((item) => item.slug === slug);
  if (!specialty) notFound();

  const articles = allKnowledgeArticles.filter((article) => article.specialty === specialty.name);
  const relatedCases = clinicalCases.filter((item) => {
    const left = item.specialty.toLowerCase();
    const right = specialty.name.toLowerCase();
    if (specialty.slug === "msk") return left.includes("musculoskeletal");
    if (specialty.slug === "neuro") return left.includes("neurological");
    if (specialty.slug === "cardio") return left.includes("cardiopulmonary");
    return left.includes(right.replace(" (msk)", ""));
  });

  return (
    <div className="container-content section-padding">
      <a href="/knowledge-hub" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700"><ArrowLeft className="h-4 w-4" />All specialties</a>

      <header className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-7 ring-1 ring-grey-200 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Physiotherapy Specialty</p>
        <h1 className="mt-2 text-3xl font-bold text-navy-800 sm:text-4xl">{specialty.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-navy-600">{specialty.description}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-600 shadow-sm"><Layers3 className="h-4 w-4 text-teal-600" />{articles.length} learning {articles.length === 1 ? "article" : "articles"}</div>
      </header>

      {specialty.slug === "msk" ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">MSK Clinical Master Library</p>
          <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-navy-800">MSK Injury & Rehabilitation Library</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
                Open complete clinical guides for sprains, muscle strains, tendinopathies, tendon ruptures,
                arthritis, instability, nerve-compression disorders and other common musculoskeletal conditions.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-navy-600">
                {["Sprains", "Strains", "Tendinopathies", "Ruptures", "Arthritis", "Instability", "Nerve Compression"].map((label) => (
                  <span key={label} className="rounded-full border border-orange-100 bg-white px-3 py-1.5">{label}</span>
                ))}
              </div>
            </div>
            <a
              href="/msk-injuries"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
            >
              Open MSK Clinical Library <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Study Library</p><h2 className="mt-1 text-2xl font-bold text-navy-800">Choose a topic</h2></div>
        {articles.length ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article, index) => {
              const level = article.level ?? "Clinical";
              const accents = ["from-cyan-50 to-white border-cyan-100", "from-amber-50 to-white border-amber-100", "from-violet-50 to-white border-violet-100", "from-emerald-50 to-white border-emerald-100"];
              return (
                <a key={article.slug} href={"/knowledge-hub/" + article.slug} className={"group flex h-full flex-col rounded-3xl border bg-gradient-to-br p-6 transition hover:-translate-y-1 hover:shadow-lg " + accents[index % accents.length]}>
                  <div className="flex flex-wrap gap-2"><span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-teal-700">{article.category}</span><span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy-600">{level} Level</span></div>
                  <h3 className="mt-5 text-xl font-bold leading-snug text-navy-800">{article.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-navy-600">{article.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between"><span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-400"><Clock3 className="h-4 w-4" />{article.readTime}</span><span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">Study topic <ArrowRight className="h-4 w-4" /></span></div>
                </a>
              );
            })}
          </div>
        ) : <div className="mt-6 rounded-3xl border border-dashed border-grey-300 bg-grey-50 p-7 text-navy-600">This specialty is being expanded. New evidence-informed topics are added regularly.</div>}
      </section>

      {relatedCases.length ? (
        <section className="mt-12 rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-800 p-7 text-white sm:p-9">
          <div className="flex items-center gap-3"><BrainCircuit className="h-7 w-7 text-violet-100" /><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">Apply What You Learned</p><h2 className="mt-1 text-2xl font-bold text-white">Related Clinical Cases</h2></div></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {relatedCases.map((item) => (
              <a key={item.slug} href={"/case-lab/" + item.slug} className="rounded-2xl border border-white/10 bg-white/10 p-5 transition hover:bg-white/15">
                <p className="text-xs font-bold uppercase tracking-wide text-violet-100">{item.difficulty} · {item.estimatedTime}</p><h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-indigo-50">{item.summary}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">Open case <ArrowRight className="h-4 w-4" /></span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
