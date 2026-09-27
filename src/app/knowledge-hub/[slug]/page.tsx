import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  Clock3,
  ExternalLink,
  GraduationCap,
  Target,
} from "lucide-react";
import { getKnowledgeArticle, knowledgeArticles } from "@/lib/knowledge-content";

const siteUrl = "https://physionexusacademy.com";

export function generateStaticParams() {
  return knowledgeArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getKnowledgeArticle(slug);

  if (!article) return {};

  const url = siteUrl + "/knowledge-hub/" + article.slug;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
    },
  };
}

export default async function KnowledgeArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getKnowledgeArticle(slug);

  if (!article) notFound();

  const level = article.level ?? "Clinical";
  const url = siteUrl + "/knowledge-hub/" + article.slug;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    url,
    author: {
      "@type": "Organization",
      name: "Physio Nexus Academy",
      url: siteUrl,
    },
    publisher: {
      "@type": "EducationalOrganization",
      "@id": "https://physionexusacademy.com/#organization",
      name: "Physio Nexus Academy",
      url: siteUrl,
    },
  };

  const levelTone =
    level === "Advanced"
      ? "bg-violet-100 text-violet-800"
      : level === "Foundation"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-amber-100 text-amber-800";

  return (
    <article className="container-content section-padding">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link
        href="/knowledge-hub"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Knowledge Hub
      </Link>

      <header className="mx-auto mt-7 max-w-4xl overflow-hidden rounded-3xl border border-grey-200 bg-gradient-to-br from-white via-cyan-50 to-indigo-50 p-6 shadow-sm sm:p-9">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
            {article.specialty}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-navy-600">
            {article.category}
          </span>
          <span className={"rounded-full px-3 py-1 text-xs font-bold " + levelTone}>
            {level} Level
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-navy-500">
            {article.audience}
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-navy-600">
          {article.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap gap-5 border-t border-grey-200 pt-5 text-xs text-navy-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {new Date(article.publishedAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            {article.readTime}
          </span>
          {article.references?.length ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700">
              <BookOpenCheck className="h-4 w-4" />
              Evidence sources included
            </span>
          ) : null}
        </div>
      </header>

      <div className="mx-auto mt-9 max-w-4xl">
        {article.learningObjectives?.length ? (
          <section className="mb-9 rounded-3xl border border-amber-100 bg-amber-50 p-6">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-amber-700" />
              <h2 className="text-2xl font-semibold text-navy-800">What You Should Be Able to Explain After Reading</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {article.learningObjectives.map((objective) => (
                <li key={objective} className="flex gap-3 text-navy-700">
                  <GraduationCap className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
                  <span className="leading-7">{objective}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {article.sections.map((section) => (
          <section key={section.heading} className="mb-9">
            <h2 className="text-2xl font-semibold text-navy-800">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-7 text-navy-600">
                {paragraph}
              </p>
            ))}
            {section.bullets?.length ? (
              <ul className="mt-4 space-y-2 pl-5 text-navy-600">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="list-disc leading-7">
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {article.references?.length ? (
          <section className="mt-10 rounded-3xl border border-grey-200 bg-grey-50 p-6">
            <h2 className="text-xl font-bold text-navy-800">Evidence & Further Reading</h2>
            <p className="mt-2 text-sm leading-6 text-navy-500">
              These sources are provided so learners can trace the clinical recommendations and read the original guidance.
            </p>
            <div className="mt-4 space-y-3">
              {article.references.map((reference) => (
                <a
                  key={reference.url}
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-navy-800">{reference.title}</p>
                    <p className="mt-1 text-navy-500">
                      {reference.organization}{reference.year ? " · " + reference.year : ""}
                    </p>
                  </div>
                  <ExternalLink className="mt-1 h-4 w-4 flex-none text-teal-600" />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <aside className="mt-10 rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-navy-800">Educational note</p>
          <p className="mt-2 text-sm leading-6 text-navy-500">
            This article is for education and does not replace an individual clinical assessment.
            Symptoms, precautions and treatment choices should be considered in the context of the
            person&apos;s full history, examination, local pathways and professional scope of practice.
          </p>
        </aside>
      </div>
    </article>
  );
}
