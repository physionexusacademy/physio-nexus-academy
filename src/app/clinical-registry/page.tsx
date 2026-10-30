import type { Metadata } from "next";
import { ClinicalRegistryClient } from "./ClinicalRegistryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PNA Clinical Registry",
  description:
    "A professional clinical documentation and outcome-reporting workspace by Physio Nexus Academy.",
  robots: { index: false, follow: false },
};

export default function ClinicalRegistryPage() {
  return <ClinicalRegistryClient />;
}
