import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Home, ShieldCheck } from "lucide-react";
import { HomeVisitForm } from "./HomeVisitForm";

export const metadata: Metadata = {
  title: "Physiotherapy Home Visit Service",
  description:
    "Request a physiotherapy home visit from Physio Nexus Academy. Choose your area, preferred date and time, then share essential patient details for confirmation.",
  alternates: {
    canonical: "https://physionexusacademy.com/home-visit",
  },
};

export default function HomeVisitPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://physionexusacademy.com/home-visit#service",
    name: "Physiotherapy Home Visit Service",
    serviceType: "Physiotherapy home visit",
    url: "https://physionexusacademy.com/home-visit",
    description:
      "A physiotherapy home visit request pathway for patients in service areas where Physio Nexus Academy confirms availability.",
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
          Physiotherapy Home Visit Service
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-600">
          Request a home physiotherapy visit by sharing your area, preferred date and time,
          and essential patient details. Our team will contact you to confirm service
          availability before any visit is finalized.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/appointment"
          className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grey-100 text-teal-700">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Clinic / Online Appointment</p>
          <p className="mt-1 text-sm text-navy-500">Book a consultation instead.</p>
        </Link>
        <div className="rounded-2xl border-2 border-teal-500 bg-teal-50 p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Home className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Home Visit</p>
          <p className="mt-1 text-sm text-navy-500">You are requesting this service.</p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-navy-800">How a home physiotherapy visit request works</h2>
        <ol className="mt-4 grid gap-4 text-sm text-navy-600 sm:grid-cols-3">
          <li><span className="font-semibold text-teal-700">1. Choose location &amp; time.</span><br />Tell us your city, area and preferred appointment slot.</li>
          <li><span className="font-semibold text-teal-700">2. Share patient details.</span><br />Add contact information, address and a brief condition summary.</li>
          <li><span className="font-semibold text-teal-700">3. Receive confirmation.</span><br />Our team confirms service-area and schedule availability before the visit.</li>
        </ol>
      </section>

      <div className="mt-8">
        <HomeVisitForm />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-grey-200 bg-white p-4 text-sm text-navy-500">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
        <p>Your address and contact details are used only to process and follow up on your home visit request.</p>
      </div>
    </div>
  );
}
