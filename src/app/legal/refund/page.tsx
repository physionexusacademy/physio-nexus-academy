import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  alternates: {
    canonical: "https://physionexusacademy.com/legal/refund",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <h2>Workshop Registrations</h2>
      <p>
        Refund and cancellation terms for paid workshop registrations will be defined once
        paid registration is enabled, and will be displayed clearly at the point of
        registration.
      </p>
      <h2>Appointments & Home Visits</h2>
      <p>
        Patients may cancel or reschedule an appointment or home-visit request by contacting
        the academy directly. Specific cancellation windows will be confirmed by our team.
      </p>
      <h2>Policy Status</h2>
      <p>
        Paid online registration is not currently enabled. Detailed refund windows,
        transfer rules and payment-specific terms will be published before paid online
        registration is introduced.
      </p>
    </LegalPage>
  );
}
