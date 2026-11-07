import type { Metadata } from "next";
import { ClinicalRegistrySecureClient } from "../SecureClientLoader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Therapist Portal | PNA Clinical Registry",
  description: "Secure clinical documentation and case-submission workspace for verified physiotherapists.",
  robots: { index: false, follow: false },
};

export default function TherapistPortalPage() {
  return <ClinicalRegistrySecureClient />;
}
