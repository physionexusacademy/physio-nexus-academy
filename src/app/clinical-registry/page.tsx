import type { Metadata } from "next";
import { PublicClinicalCaseLibrary } from "./library/PublicClinicalCaseLibrary";
import { RegistryEntry } from "./RegistryEntry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PNA Clinical Case Library | Physio Nexus Academy",
  description: "Browse independently reviewed, de-identified physiotherapy case reports from Physio Nexus Academy.",
  robots: { index: true, follow: true },
};

export default function ClinicalRegistryPage() {
  return <RegistryEntry publicLibrary={<PublicClinicalCaseLibrary />} />;
}
