import type { Metadata } from "next";
import { PublicClinicalCaseLibrary } from "./PublicClinicalCaseLibrary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Clinical Case Library | Physio Nexus Academy",
  description: "Reviewed, de-identified physiotherapy case reports for open educational access.",
  robots: { index: true, follow: true },
};

export default function PublicClinicalCaseLibraryPage() {
  return <PublicClinicalCaseLibrary />;
}
