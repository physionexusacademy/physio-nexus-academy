import type { Metadata } from "next";
import { ClinicalAssessmentClient } from "./ClinicalAssessmentClient";

export const metadata: Metadata = {
  title: "PNA Clinical Assessment & Management",
  description:
    "A clinician-facing, structured musculoskeletal assessment workspace from Physio Nexus Academy.",
  alternates: {
    canonical: "https://physionexusacademy.com/clinical-assessment",
  },
};

export default function ClinicalAssessmentPage() {
  return <ClinicalAssessmentClient />;
}
