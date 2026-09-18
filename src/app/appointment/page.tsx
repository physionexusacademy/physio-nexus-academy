import type { Metadata } from "next";
import { AppointmentForm } from "./AppointmentForm";
import { siteConfig } from "@/lib/site-config";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Request a physiotherapy consultation appointment with Physio Nexus Academy.",
};

export default function AppointmentPage() {
  return (
    <div className="container-content section-padding max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Book Appointment</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Request a Consultation</h1>
      <p className="mt-4 text-navy-600">
        This is an appointment request, not an automated diagnosis. Our team will contact you
        to confirm the details.
      </p>

      <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>{siteConfig.medicalDisclaimer}</p>
      </div>

      <div className="mt-8">
        <AppointmentForm />
      </div>
    </div>
  );
}
