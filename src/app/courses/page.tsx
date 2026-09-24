import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses & Learning",
  description: "Short courses and structured learning modules from Physio Nexus Academy.",
  alternates: {
    canonical: "https://physionexusacademy.com/courses",
  },
};

export default function CoursesPage() {
  return (
    <div className="container-content section-padding max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Courses / Learning</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Structured Learning, Coming Soon</h1>
      <p className="mt-4 text-navy-600">
        Physio Nexus Academy is developing short courses and structured learning modules for
        physiotherapy students and professionals. This page — and its database structure — is
        built to expand into full course listings, enrollment and progress tracking (see
        "Optional Future-Ready Modules" in the project README) without rebuilding the site.
      </p>
      <p className="mt-4 text-navy-600">
        In the meantime, explore our{" "}
        <a href="/workshops" className="font-semibold text-teal-600 hover:underline">
          hands-on workshops
        </a>{" "}
        or{" "}
        <a href="/resources" className="font-semibold text-teal-600 hover:underline">
          learning resources
        </a>
        .
      </p>
    </div>
  );
}
