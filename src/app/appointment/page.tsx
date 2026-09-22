import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Building2, Home, ShieldCheck } from "lucide-react";
import { AppointmentForm } from "./AppointmentForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Physiotherapy Appointment & Consultation",
  description:
    "Request a physiotherapy appointment or consultation with Physio Nexus Academy. Choose in-person or online consultation, then select your preferred date and time.",
  alternates: {
    canonical: "https://physionexusacademy.com/appointment",
  },
};

export default function AppointmentPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://physionexusacademy.com/appointment#service",
    name: "Physiotherapy Appointment & Consultation",
    serviceType: "Physiotherapy consultation",
    url: "https://physionexusacademy.com/appointment",
    description:
      "A physiotherapy consultation appointment request pathway with in-person and online options subject to confirmation.",
    provider: {
      "@type": "EducationalOrganization",
      "@id": "https://physionexusacademy.com/#organization",
      name: "Physio Nexus Academy",
      url: "https://physionexusacademy.com",
    },
  };

  return (
    <div className="container-content section-padding max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Patient Services</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Physiotherapy Appointment &amp; Consultation
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-600">
          Request an in-person or online physiotherapy consultation, choose your preferred
          date and time, and share only the essential details. Our team will contact you to
          confirm availability.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-teal-500 bg-teal-50 p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Clinic / Online Appointment</p>
          <p className="mt-1 text-sm text-navy-500">You are booking this service.</p>
        </div>
        <Link
          href="/home-visit"
          className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grey-100 text-teal-700">
            <Home className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Home Visit</p>
          <p className="mt-1 text-sm text-navy-500">Request physiotherapy at your location.</p>
        </Link>
      </div>

      <div className="mt-8">
        <AppointmentForm />
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>{siteConfig.medicalDisclaimer}</p>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-grey-200 bg-white p-4 text-sm text-navy-500">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
        <p>Your details are used only to process and follow up on your appointment request.</p>
      </div>
    </div>
  );
}
