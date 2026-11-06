import type { Metadata } from "next";
import { ArrowRight, GraduationCap, Route } from "lucide-react";
import { teacherPaths } from "@/lib/teacher/paths";

export const metadata: Metadata = {
  title: "Courses & Structured Learning",
  description:
    "Start a free, step-by-step physiotherapy learning path with PNA Teacher — conversational lessons with analogies, interactive visuals, quick checks and flashcards, in English or Roman Urdu.",
  openGraph: {
    title: "Physiotherapy Courses & Learning Paths | Physio Nexus Academy",
    description:
      "Free step-by-step physiotherapy learning paths for students and clinicians, taught by PNA Teacher in English or Roman Urdu.",
    url: "https://physionexusacademy.com/courses",
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physiotherapy Courses & Learning Paths | Physio Nexus Academy",
    description: "Free step-by-step physiotherapy learning paths taught by PNA Teacher.",
  },
  alternates: {
    canonical: "https://physionexusacademy.com/learn",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CoursesPage() {
  return (
    <div className="container-content section-padding max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Courses / Learning</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Structured learning starts here</h1>
      <p className="mt-4 text-navy-600">
        PNA Teacher turns physiotherapy into guided, step-by-step paths. Each path mixes short conversational lessons — with analogies, interactive visuals and
        checks after every idea — with missions inside the PNA Knowledge Hub, Special Tests, Case Lab and Treatment Plans. Free, in English or Roman Urdu.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {teacherPaths.map((path) => (
          <li key={path.slug}>
            <a
              href={`/learn/paths/${path.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Route className="h-4 w-4" aria-hidden="true" /> {path.audience}
              </span>
              <span className="mt-2 text-lg font-bold text-navy-800 group-hover:text-teal-800">{path.title}</span>
              <span className="mt-1 flex-1 text-sm leading-6 text-slate-600">{path.tagline.en}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                {path.steps.length} steps <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <a
        href="/learn"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
      >
        <GraduationCap className="h-4 w-4" aria-hidden="true" /> Get my personal plan from PNA Teacher
      </a>

      <p className="mt-8 text-sm text-navy-600">
        Prefer hands-on training? Explore our{" "}
        <a href="/workshops" className="font-semibold text-teal-600 hover:underline">
          practical workshops
        </a>{" "}
        and{" "}
        <a href="/resources" className="font-semibold text-teal-600 hover:underline">
          learning resources
        </a>
        .
      </p>
    </div>
  );
}
