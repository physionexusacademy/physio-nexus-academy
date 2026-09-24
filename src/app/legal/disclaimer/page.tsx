import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Medical disclaimer for Physio Nexus Academy educational content, appointments and home-visit requests.",
  alternates: {
    canonical: "https://physionexusacademy.com/legal/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Medical Disclaimer">
      <p>{siteConfig.medicalDisclaimer}</p>
      <h2>Home Visits & Appointments</h2>
      <p>
        Submitting an appointment or home-visit request does not itself establish a
        patient-provider treatment relationship. This is established only after appropriate
        professional assessment.
      </p>
    </LegalPage>
  );
}
