import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, Clock3, GraduationCap, Layers, Target } from "lucide-react";
import { conceptLessonMetas, getLessonMeta } from "@/lib/teacher/lesson-index";
import { LessonPlayer } from "@/components/teacher/LessonPlayer";

const siteUrl = "https://physionexusacademy.com";

export function generateStaticParams() {
  return conceptLessonMetas.map((lesson) => ({ slug: lesson.slug }));
}

// Cloudflare (OpenNext) has no incremental cache configured, so pages must be
// renderable on demand. `false` makes the Worker return 404 for every slug.
// Unknown slugs still 404 through notFound() below.
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonMeta(slug);
  if (!lesson || lesson.kind !== "concept") return {};
  const url = `${siteUrl}/learn/${lesson.slug}`;
  const description = `${lesson.hook.en} ${lesson.goal.en} A step-by-step PNA Teacher lesson in English and Roman Urdu.`;
  return {
    title: `${lesson.title} — Explained Simply | PNA Teacher`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${lesson.title} — Explained Simply`, description, url, type: "article", siteName: "Physio Nexus Academy", locale: "en_PK" },
    twitter: { card: "summary_large_image", title: `${lesson.title} — Explained Simply`, description },
  };
}

export default async function TeacherLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Manual Therapy chapters are taught inside their own encyclopedia page.
  const lesson = getLessonMeta(slug);
  if (lesson?.kind === "manual") permanentRedirect(`/manual-therapy/${slug}#pna-teacher`);
  if (!lesson) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.goal.en,
    url: `${siteUrl}/learn/${lesson.slug}`,
    learningResourceType: "Interactive lesson",
    educationalLevel: lesson.level,
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: lesson.bestFor },
    timeRequired: `PT${lesson.minutes}M`,
    inLanguage: ["en", "ur-Latn"],
    isAccessibleForFree: true,
    teaches: lesson.summaryEn,
    provider: { "@type": "EducationalOrganization", name: "Physio Nexus Academy", url: siteUrl },
  };

  return (
    <div className="container-content pb-16 pt-6 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-3xl">
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> PNA Teacher
        </Link>
        <header className="mt-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">{lesson.area}</p>
          <h1 className="mt-1.5 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">{lesson.hook.en}</p>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <Clock3 className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> {lesson.minutes} min
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <GraduationCap className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> {lesson.bestFor}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <Target className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> {lesson.checks} checks
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
              <Layers className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" /> {lesson.flashcardCount} flashcards
            </li>
          </ul>
        </header>
      </div>

      <div className="mt-4">
        <LessonPlayer meta={lesson} />
      </div>
    </div>
  );
}
