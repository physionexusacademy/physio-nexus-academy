import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
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

  const url = `${siteUrl}/knowledge-hub/${article.slug}`;

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

  const url = `${siteUrl}/knowledge-hub/${article.slug}`;
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

      <header className="mx-auto mt-7 max-w-3xl">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {article.category}
          </span>
          <span className="rounded-full bg-grey-100 px-3 py-1 text-xs font-semibold text-navy-500">
            {article.audience}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-navy-600">
          {article.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap gap-5 border-y border-grey-200 py-4 text-xs text-navy-400">
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
        </div>
      </header>

      <div className="mx-auto mt-9 max-w-3xl">
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

        <aside className="mt-10 rounded-2xl border border-grey-200 bg-grey-50 p-6">
          <p className="font-semibold text-navy-800">Educational note</p>
          <p className="mt-2 text-sm leading-6 text-navy-500">
            This article is for education and does not replace an individual clinical assessment.
            Symptoms, precautions and treatment choices should be considered in the context of the
            person&apos;s full history and examination.
          </p>
        </aside>
      </div>
    </article>
  );
}
