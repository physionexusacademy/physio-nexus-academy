import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Physiotherapy Services & Patient Appointments",
  description:
    "Explore physiotherapy consultation, appointment and home visit request pathways from Physio Nexus Academy.",
  alternates: {
    canonical: "https://physionexusacademy.com/patient-services",
  },
};

export default function PatientServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Physio Nexus Academy Physiotherapy Services",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        url: "https://physionexusacademy.com/symptom-checker",
        name: "Musculoskeletal Symptom Checker",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: "https://physionexusacademy.com/appointment",
        name: "Physiotherapy Appointment & Consultation",
      },
      {
        "@type": "ListItem",
        position: 3,
        url: "https://physionexusacademy.com/home-visit",
        name: "Physiotherapy Home Visit Service",
      },
    ],
  };

  return (
    <div className="container-content section-padding max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Patient Services</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Physiotherapy Services &amp; Patient Appointments
      </h1>

      <p className="mt-4 text-navy-600">
        Physio Nexus Academy provides a clear pathway for patients seeking physiotherapy
        consultation, appointment support and home visit requests. Submitting a request is
        the first step — our team will follow up to confirm availability and details.
      </p>

      <h2 className="mt-8 text-xl font-bold">Physiotherapy Service Options</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-navy-600">
        <li>Patient-friendly MSK symptom screening with possible clinical patterns and safety guidance.</li>
        <li>Musculoskeletal (MSK) consultation and guidance.</li>
        <li>In-person consultation requests.</li>
        <li>Home visit requests, where the service is available.</li>
        <li>Online consultation — availability to be confirmed.</li>
      </ul>

      <div className="mt-8 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>{siteConfig.medicalDisclaimer}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/symptom-checker">Check Your Symptoms</Button>
        <Button href="/appointment" variant="outline">Book Appointment</Button>
        <Button href="/home-visit" variant="outline">
          Request Home Visit
        </Button>
      </div>
    </div>
  );
}
