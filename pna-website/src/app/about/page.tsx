import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About PNA",
  description:
    "Learn about Physio Nexus Academy's story, purpose, vision, mission and operating model.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const supabase = createClient();
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
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">About PNA</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Our Story &amp; Purpose</h1>

      <p className="mt-6 text-navy-600">
        Physio Nexus Academy was established in {siteConfig.established} to bridge the gap
        between physiotherapy theory and real clinical practice. {siteConfig.operatingModel}
      </p>

      <h2 className="mt-10 text-xl font-bold">Purpose</h2>
      <p className="mt-3 text-navy-600">{content.purpose}</p>

      <h2 className="mt-8 text-xl font-bold">Vision</h2>
      <p className="mt-3 text-navy-600">{content.vision}</p>

      <h2 className="mt-8 text-xl font-bold">Mission</h2>
      <p className="mt-3 text-navy-600">{content.mission}</p>

      <h2 className="mt-8 text-xl font-bold">Our Values</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-navy-600">
        <li>Evidence-informed, practical physiotherapy education.</li>
        <li>Honest, responsible communication — no guaranteed outcomes or invented claims.</li>
        <li>Accessible learning for students, graduates and practising professionals.</li>
        <li>A respectful, patient-centered approach to appointments and home visits.</li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">Why Physio Nexus Academy</h2>
      <p className="mt-3 text-navy-600">
        PNA combines structured workshops, learning resources and research guidance with a
        direct patient-service pathway — connecting scientific knowledge with real clinical
        skills under the direction of {siteConfig.founder.name} ({siteConfig.founder.credentialsShort}).
      </p>
    </div>
  );
}
