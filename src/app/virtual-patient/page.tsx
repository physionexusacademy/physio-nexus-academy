import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { VirtualPatientLoader } from "@/components/virtual-patient/VirtualPatientLoader";
import "./virtual-patient.css";

const url = "https://physionexusacademy.com/virtual-patient";

export const metadata: Metadata = {
  title: "Virtual Patient — 3D Physiotherapy Exam Simulator",
  description:
    "Examine a realistic 3D patient: take a history, measure range, test muscles and reflexes, run special tests, then diagnose and get an OSCE-style score.",
  keywords: [
    "virtual patient physiotherapy",
    "3D patient simulator physiotherapy",
    "OSCE practice physiotherapy",
    "physiotherapy exam simulator",
    "clinical skills simulator",
    "goniometry practice online",
    "MMT practice online",
    "physiotherapy OSCE Pakistan",
    "virtual patient DPT",
    "clinical examination simulator",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "Virtual Patient — 3D Physiotherapy Exam Simulator | PNA",
    description:
      "Examine a realistic 3D patient: take a history, measure range, test muscles and reflexes, run special tests, then diagnose and get an OSCE-style score.",
    url,
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "Virtual Patient — Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Patient — 3D Physiotherapy Exam Simulator | PNA",
    description:
      "Examine a realistic 3D patient: take a history, measure range, test muscles and reflexes, run special tests, then diagnose and get an OSCE-style score.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function VirtualPatientPage() {
  const learningResourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "Virtual Patient — 3D Physiotherapy Exam Simulator",
    description: metadata.description,
    url,
    learningResourceType: "Interactive simulation",
    educationalLevel: "Undergraduate physiotherapy / DPT",
    isAccessibleForFree: true,
    inLanguage: "en",
    provider: {
      "@type": "EducationalOrganization",
      "@id": "https://physionexusacademy.com/#organization",
      name: "Physio Nexus Academy",
    },
    about: {
      "@type": "Thing",
      name: "Physiotherapy clinical examination",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://physionexusacademy.com" },
      { "@type": "ListItem", position: 2, name: "Clinical Skills Lab", item: "https://physionexusacademy.com/skills" },
      { "@type": "ListItem", position: 3, name: "Virtual Patient", item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <NexusHero
        kicker="Practise wing · Virtual Patient"
        title={<>Your patient is <span className="nx-gradient-text">waiting.</span></>}
        lead="A realistic 3D patient you can examine like a real one — history, positioning, goniometry, MMT, reflexes, sensation, palpation and special tests — then diagnose and get an OSCE-style score."
        crumbs={[{ label: "Practise", href: "/daily-challenge" }, { label: "Virtual Patient" }]}
      />
      <section className="container-content pb-16 pt-8" aria-label="Exam room" data-pna-virtual-patient>
        <VirtualPatientLoader />
      </section>
    </>
  );
}
