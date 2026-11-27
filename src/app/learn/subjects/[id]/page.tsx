import { fitDescription, fitTitle } from "@/lib/seo/text";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadLessonIndex } from "@/lib/teacher/lesson-index";
import { teacherPaths } from "@/lib/teacher/paths";
import { lessonsOf, pathsOf, subjectById, subjects } from "@/lib/teacher/subjects";
import { SubjectRoom } from "@/components/teacher/SubjectRoom";

const siteUrl = "https://physionexusacademy.com";

export function generateStaticParams() {
  return subjects.map((subject) => ({ id: subject.id }));
}

// Cloudflare (OpenNext) has no incremental cache configured, so pages must be renderable on demand; unknown ids still 404 through notFound().
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const subject = subjectById(id);
  if (!subject) return {};
  const url = `${siteUrl}/learn/subjects/${subject.id}`;
  const description = fitDescription(`${subject.tagline} Free PNA Teacher lessons in English and Roman Urdu, arranged unit by unit.`);
  return {
    title: { absolute: `${fitTitle(subject.title, 40)} — PNA Teacher | PNA` },
    description,
    alternates: { canonical: url },
    openGraph: { title: `${subject.title} — PNA Teacher`, description, url, type: "website", siteName: "Physio Nexus Academy", locale: "en_PK" },
  };
}

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = subjectById(id);
  if (!subject) notFound();
  const index = await loadLessonIndex();
  const lessons = lessonsOf(subject, index).map(({ slug, title, hook, area, level, bestFor, minutes, flashcardCount, href }) => ({ slug, title, hook, area, level, bestFor, minutes, flashcardCount, href }));
  if (!lessons.length) notFound();
  const paths = pathsOf(subject, teacherPaths, index);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "PNA Teacher", item: `${siteUrl}/learn` },
      { "@type": "ListItem", position: 3, name: subject.title, item: `${siteUrl}/learn/subjects/${subject.id}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <div className="container-content pb-16 pt-6 sm:pt-10">
        <SubjectRoom subjectId={subject.id} lessons={lessons} paths={paths} />
      </div>
    </>
  );
}
