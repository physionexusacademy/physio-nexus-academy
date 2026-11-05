import type { Metadata } from "next";
import { PublicClinicalCaseLibrary } from "./library/PublicClinicalCaseLibrary";
import { RegistryEntry } from "./RegistryEntry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PNA Clinical Case Library | Reviewed Physiotherapy Case Reports",
  description: "Browse independently reviewed, de-identified physiotherapy case reports shared by clinicians. Learn real-world assessment, management and follow-up from Physio Nexus Academy.",
  keywords: [
    "physiotherapy case library",
    "clinical case reports physiotherapy",
    "de-identified case studies",
    "physiotherapy clinical registry",
    "real world physiotherapy cases",
    "Physio Nexus Academy",
  ],
  alternates: { canonical: "https://physionexusacademy.com/clinical-registry" },
  openGraph: {
    title: "PNA Clinical Case Library | Reviewed Physiotherapy Cases",
    description: "Independently reviewed, de-identified physiotherapy case reports for education and professional development.",
    url: "https://physionexusacademy.com/clinical-registry",
    siteName: "Physio Nexus Academy",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function ClinicalRegistryPage() {
  return <RegistryEntry publicLibrary={<PublicClinicalCaseLibrary />} />;
}
