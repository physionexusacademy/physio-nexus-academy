import type { Metadata } from "next";
import { ClinicalRegistrySecureClient } from "../SecureClientLoader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviewer Dashboard | PNA Clinical Registry",
  description: "Restricted case-review workspace for authorised PNA Clinical Registry reviewers.",
  robots: { index: false, follow: false },
};

export default function ClinicalRegistryReviewerPage() {
  return <ClinicalRegistrySecureClient />;
}
