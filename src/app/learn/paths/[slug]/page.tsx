import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Route } from "lucide-react";
import { teacherLessonCards } from "@/lib/teacher/lessons";
import { getTeacherPath, teacherPaths } from "@/lib/teacher/paths";
import { PathJourney } from "@/components/teacher/PathJourney";

const siteUrl = "https://physionexusacademy.com";

export function generateStaticParams() {
  return teacherPaths.map((path) => ({ slug: path.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = getTeacherPath(slug);
  if (!path) return {};
  const url = `${siteUrl}/learn/paths/${path.slug}`;
  const description = `${path.tagline.en} A free, step-by-step PNA Teacher learning path for ${path.audience}.`;
  return {
    title: `${path.title} — Learning Path | PNA Teacher`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${path.title} — Learning Path`, description, url, type: "website", siteName: "Physio Nexus Academy", locale: "en_PK" },
  };
}

export default async function TeacherPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = getTeacherPath(slug);
  if (!path) notFound();

  const lessonSlugs = new Set(path.steps.flatMap((step) => (step.kind === "lesson" ? [step.lesson] : [])));
  const lessons = teacherLessonCards.filter((lesson) => lessonSlugs.has(lesson.slug));
  const totalMinutes = path.steps.reduce(
    (sum, step) => sum + (step.kind === "lesson" ? lessons.find((lesson) => lesson.slug === step.lesson)?.minutes ?? 10 : step.minutes),
    0,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: path.title,
    description: path.tagline.en,
    url: `${siteUrl}/learn/paths/${path.slug}`,
    isAccessibleForFree: true,
    inLanguage: ["en", "ur-Latn"],
    educationalLevel: path.audience,
    teaches: path.outcomes.map((outcome) => outcome.en),
    provider: { "@type": "EducationalOrganization", name: "Physio Nexus Academy", url: siteUrl },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${totalMinutes}M` },
  };

  return (
    <div className="container-content pb-16 pt-6 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-3xl">
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> PNA Teacher
        </Link>
        <header className="mt-4 rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-7">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">
            <Route className="h-4 w-4" aria-hidden="true" /> Learning path · {path.audience}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl">{path.title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{path.tagline.en}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {path.steps.length} steps · about {Math.round(totalMinutes / 5) * 5} minutes in total
          </p>
          <div className="mt-5">
            <p className="text-sm font-bold text-navy-800">By the end you&apos;ll be able to:</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {path.outcomes.map((outcome) => (
                <li key={outcome.en} className="flex gap-2 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal-600" aria-hidden="true" />
                  {outcome.en}
                </li>
              ))}
            </ul>
          </div>
        </header>
        <div className="mt-6">
          <PathJourney path={path} lessons={lessons} />
        </div>
      </div>
    </div>
  );
}
