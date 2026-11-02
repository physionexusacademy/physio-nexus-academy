import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses & Learning",
  description:
    "Explore structured physiotherapy learning modules from Physio Nexus Academy. Course enrollment is not open yet; use the free Knowledge Hub, clinical case library and practical workshops while new courses are prepared.",
  openGraph: {
    title: "Physiotherapy Courses & Learning | Physio Nexus Academy",
    description:
      "Structured physiotherapy learning modules for students and clinicians. Enrollment is not open yet; explore PNA's free learning resources and workshops in the meantime.",
    url: "https://physionexusacademy.com/courses",
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physiotherapy Courses & Learning | Physio Nexus Academy",
    description:
      "Explore structured physiotherapy learning modules and free learning resources from PNA. Enrollment is not open yet.",
  },
  alternates: {
    canonical: "https://physionexusacademy.com/courses",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CoursesPage() {
  return (
    <div className="container-content section-padding max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Courses / Learning</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Physiotherapy Courses &amp; Structured Learning</h1>
      <p className="mt-4 text-navy-600">
        Physio Nexus Academy is developing structured physiotherapy learning modules for
        students and professionals. Course enrollment is not open yet, so this page is kept
        out of search results until real course listings, learning outcomes and enrollment
        details are published.
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
