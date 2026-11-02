import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the Physio Nexus Academy website, educational resources, workshop registration and patient-service request pathways.",
  alternates: {
    canonical: "https://physionexusacademy.com/legal/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <h2>Use of This Website</h2>
      <p>
        This website provides physiotherapy education, workshops, learning resources and a
        pathway to request physiotherapy appointments and home visits. Content is provided for
        general educational and informational purposes.
      </p>
      <h2>No Guaranteed Outcomes</h2>
      <p>
        Physio Nexus Academy does not guarantee publication, treatment outcomes, cure, job
        placement, or professional accreditation as a result of using this website or attending
        our workshops.
      </p>
      <h2>Workshop & Registration Terms</h2>
      <p>
        Workshop dates, fees and seat availability are subject to change. Registration status
        will be confirmed directly by the academy.
      </p>
      <h2>Intellectual Property</h2>
      <p>
        Books, manuals, PDFs and other resources on this site remain the property of Physio
        Nexus Academy or their respective contributors and may not be redistributed without
        permission.
      </p>
    </LegalPage>
  );
}
