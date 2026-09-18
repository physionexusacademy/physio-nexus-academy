import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>What We Collect</h2>
      <p>
        We collect information you submit through workshop registrations, appointment
        requests, home-visit requests and contact forms — such as your name, contact details
        and the details of your request.
      </p>
      <h2>How We Use It</h2>
      <p>
        Information is used to respond to your request, manage workshop registrations, and
        provide patient services. We do not sell your personal information.
      </p>
      <h2>Data Protection</h2>
      <p>
        Appointment and home-visit data, including addresses, are restricted from public
        access and are only visible to authorized academy staff through the Admin Dashboard.
      </p>
      <h2>Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by
        contacting us directly.
      </p>
    </LegalPage>
  );
}
