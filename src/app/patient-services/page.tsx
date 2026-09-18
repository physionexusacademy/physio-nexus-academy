import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Patient Services",
  description:
    "Physiotherapy consultation and appointment pathway offered by Physio Nexus Academy.",
};

export default function PatientServicesPage() {
  return (
    <div className="container-content section-padding max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Patient Services</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Physiotherapy Consultation Pathway</h1>

      <p className="mt-4 text-navy-600">
        Physio Nexus Academy provides a clear pathway for patients seeking physiotherapy
        guidance and consultation. Submitting a request below is the first step — our team
        will follow up to confirm details.
      </p>

      <h2 className="mt-8 text-xl font-bold">General Service Categories</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-navy-600">
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
        <Button href="/appointment">Book Appointment</Button>
        <Button href="/home-visit" variant="outline">
          Request Home Visit
        </Button>
      </div>
    </div>
  );
}
