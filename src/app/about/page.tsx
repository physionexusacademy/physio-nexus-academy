import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Physio Nexus Academy | Founder, Mission & Vision",
  description:
    "Learn about Physio Nexus Academy — founded and led by Dr. Sajjad Raza PT. Discover our purpose, vision, mission and practical physiotherapy education model serving students, professionals and patients across Pakistan.",
  keywords: [
    "about Physio Nexus Academy",
    "Dr Sajjad Raza PT",
    "physiotherapy academy Pakistan",
    "physiotherapy education Karachi",
    "PNA mission vision",
  ],
  openGraph: {
    title: "About Physio Nexus Academy | Founder & Mission",
    description:
      "Physio Nexus Academy was established to bridge the gap between physiotherapy theory and real clinical practice under the leadership of Dr. Sajjad Raza PT.",
    url: "https://physionexusacademy.com/about",
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Physio Nexus Academy",
    description:
      "Purpose, vision and mission of Physio Nexus Academy — practical physiotherapy education in Pakistan.",
  },
  alternates: {
    canonical: "https://physionexusacademy.com/about",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 60;

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: section } = await supabase
    .from("editable_page_sections")
    .select("content")
    .eq("page", "about")
    .eq("section_key", "mission")
    .maybeSingle();

  const content = {
    purpose: section?.content?.purpose ?? siteConfig.mission.purpose,
    vision: section?.content?.vision ?? siteConfig.mission.vision,
    mission: section?.content?.mission ?? siteConfig.mission.mission,
  };

  return (
    <div className="container-content section-padding max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        About PNA
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Our Story &amp; Purpose
      </h1>

      <p className="mt-6 text-navy-600">
        Physio Nexus Academy was established in {siteConfig.established} to
        bridge the gap between physiotherapy theory and real clinical practice.{" "}
        {siteConfig.operatingModel}
      </p>

      <section className="mt-8 rounded-xl border border-grey-200 bg-grey-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
          Founder &amp; Leadership
        </p>
        <h2 className="mt-2 text-xl font-bold text-navy-800">
          Founded and led by {siteConfig.founder.name}
        </h2>
        <p className="mt-3 text-navy-600">
          {siteConfig.founder.name} is the Founder and Main Instructor of Physio
          Nexus Academy, leading its physiotherapy education, hands-on clinical
          workshops and professional learning initiatives.
        </p>
        <a
          href="/founder"
          className="mt-4 inline-flex text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          View the founder profile →
        </a>
      </section>

      <h2 className="mt-10 text-xl font-bold">Purpose</h2>
      <p className="mt-3 text-navy-600">{content.purpose}</p>

      <h2 className="mt-8 text-xl font-bold">Vision</h2>
      <p className="mt-3 text-navy-600">{content.vision}</p>

      <h2 className="mt-8 text-xl font-bold">Mission</h2>
      <p className="mt-3 text-navy-600">{content.mission}</p>

      <h2 className="mt-8 text-xl font-bold">Our Values</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-navy-600">
        <li>Evidence-informed, practical physiotherapy education.</li>
        <li>
          Honest, responsible communication — no guaranteed outcomes or invented
          claims.
        </li>
        <li>
          Accessible learning for students, graduates and practising
          professionals.
        </li>
        <li>
          A respectful, patient-centered approach to appointments and home
          visits.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">Why Physio Nexus Academy</h2>
      <p className="mt-3 text-navy-600">
        PNA combines structured workshops, learning resources and research
        guidance with a direct patient-service pathway — connecting scientific
        knowledge with real clinical skills under the direction of{" "}
        {siteConfig.founder.name} ({siteConfig.founder.credentialsShort}).
      </p>
    </div>
  );
}
