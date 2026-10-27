import type { Metadata } from "next";
import {
  AlertTriangle,
  Building2,
  Home,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Video,
} from "lucide-react";
import { AppointmentForm } from "./AppointmentForm";
import { siteConfig } from "@/lib/site-config";

const siteUrl = "https://physionexusacademy.com";
const whatsappUrl =
  "https://wa.me/923489009028?text=" +
  encodeURIComponent(
    "Hello Physio Nexus Academy, I want to book a Physiotherapy Appointment / Consultation. Please guide me.",
  );

export const metadata: Metadata = {
  title: "Book Physiotherapy Appointment in Pakistan | Online & In-Person Consultation",
  description:
    "Request a physiotherapy appointment or consultation across Pakistan. Book in-person or online physiotherapy consultation in Karachi, Hyderabad, Lahore, Islamabad and other cities. Fill the form or contact us on WhatsApp for confirmation.",
  keywords: [
    "physiotherapy appointment",
    "physiotherapy consultation",
    "book physiotherapy appointment Pakistan",
    "physiotherapy appointment Karachi",
    "physiotherapy appointment Hyderabad",
    "physiotherapy appointment Lahore",
    "physiotherapy appointment Islamabad",
    "online physiotherapy consultation",
    "in-person physiotherapy appointment",
    "physiotherapy clinic appointment",
    "book physiotherapist Pakistan",
    "Physio Nexus Academy appointment",
  ],
  alternates: {
    canonical: `${siteUrl}/appointment`,
  },
  openGraph: {
    title: "Book Physiotherapy Appointment in Pakistan | Physio Nexus Academy",
    description:
      "Request in-person or online physiotherapy consultation. Available pathway for patients across Pakistan. Confirm via form or WhatsApp.",
    url: `${siteUrl}/appointment`,
    siteName: "Physio Nexus Academy",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/founder-dr-sajjad.jpg`,
        width: 1200,
        height: 630,
        alt: "Physiotherapy Appointment & Consultation — Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Physiotherapy Appointment in Pakistan",
    description:
      "In-person or online physiotherapy consultation. Form + WhatsApp confirmation available.",
    images: [`${siteUrl}/images/founder-dr-sajjad.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const majorCities = [
  "Karachi",
  "Hyderabad",
  "Sukkur",
  "Larkana",
  "Nawabshah",
  "Mirpurkhas",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

export default function AppointmentPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/appointment#service`,
    name: "Physiotherapy Appointment & Consultation",
    serviceType: "Physiotherapy consultation",
    url: `${siteUrl}/appointment`,
    description:
      "Physiotherapy appointment and consultation request service for patients across Pakistan. Choose in-person or online consultation. Availability is confirmed before any appointment is finalized.",
    provider: {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "Physio Nexus Academy",
      url: siteUrl,
      telephone: "+923489009028",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Raja Ghazanfar Ali Khan Road, Saddar",
        addressLocality: "Karachi",
        addressRegion: "Sindh",
        postalCode: "74400",
        addressCountry: "PK",
      },
    },
    areaServed: [
      { "@type": "Country", name: "Pakistan" },
      { "@type": "AdministrativeArea", name: "Sindh" },
      ...majorCities.map((city) => ({ "@type": "City", name: city })),
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${siteUrl}/appointment`,
      servicePhone: "+923489009028",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Patient Services",
        item: `${siteUrl}/patient-services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Physiotherapy Appointment",
        item: `${siteUrl}/appointment`,
      },
    ],
  };

  return (
    <div className="container-content section-padding max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
          Patient Services · Pakistan
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Book Physiotherapy Appointment in Pakistan
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-600">
          Request an <strong>in-person</strong> or <strong>online physiotherapy consultation</strong>.
          Choose your preferred date and time, share essential details, and our team will contact
          you to confirm availability. Requests are accepted from across Pakistan.
        </p>
      </div>

      {/* Prominent WhatsApp CTA */}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#20bd5a] sm:w-auto"
        >
          <MessageCircle className="h-5 w-5" />
          Contact us on WhatsApp
        </a>
        <a
          href="#appointment-form"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-6 py-3.5 text-sm font-bold text-teal-700 transition hover:bg-teal-50 sm:w-auto"
        >
          <Building2 className="h-5 w-5" />
          Fill Appointment Form
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-teal-500 bg-teal-50 p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Clinic / Online Appointment</p>
          <p className="mt-1 text-sm text-navy-500">You are booking this service.</p>
        </div>
        <a
          href="/home-visit"
          className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grey-100 text-teal-700">
            <Home className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Home Visit</p>
          <p className="mt-1 text-sm text-navy-500">Request physiotherapy at your location.</p>
        </a>
      </div>

      <section className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-navy-800">
          How a physiotherapy appointment request works
        </h2>
        <ol className="mt-4 grid gap-4 text-sm text-navy-600 sm:grid-cols-3">
          <li>
            <span className="font-semibold text-teal-700">1. Choose type & time.</span>
            <br />
            Select in-person or online consultation, then preferred date and time slot.
          </li>
          <li>
            <span className="font-semibold text-teal-700">2. Share your details.</span>
            <br />
            Add contact information and a brief summary of your concern.
          </li>
          <li>
            <span className="font-semibold text-teal-700">3. Receive confirmation.</span>
            <br />
            Our team confirms schedule availability before the appointment is finalized.
          </li>
        </ol>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-teal-100 bg-white p-5">
          <Building2 className="h-6 w-6 text-teal-600" />
          <h3 className="mt-3 font-semibold text-navy-800">In-person consultation</h3>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Meet the physiotherapy team in person for assessment and guidance. Strongest pathways
            currently in Karachi and Hyderabad; other cities subject to confirmation.
          </p>
        </div>
        <div className="rounded-2xl border border-teal-100 bg-white p-5">
          <Video className="h-6 w-6 text-teal-600" />
          <h3 className="mt-3 font-semibold text-navy-800">Online consultation</h3>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Request a remote physiotherapy consultation when available. Useful for guidance,
            follow-up discussion and patients outside immediate clinic areas.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-teal-100 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
          <div>
            <h2 className="text-lg font-bold text-navy-800">
              Physiotherapy appointments across Pakistan
            </h2>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              You can request an appointment from any city in Pakistan. In-person options are
              strongest in <strong>Karachi</strong> and <strong>Hyderabad</strong>. Online
              consultation requests are evaluated based on availability.
            </p>
            <p className="mt-3 text-sm leading-6 text-navy-600">
              Common request cities include: {majorCities.join(", ")} and other areas across
              Sindh and Pakistan.
            </p>
            <p className="mt-3 text-sm font-medium text-navy-700">
              Prefer a quick conversation? Message us on WhatsApp for faster guidance.
            </p>
          </div>
        </div>
      </section>

      <div id="appointment-form" className="mt-10 scroll-mt-28">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-navy-800">
            Request a Physiotherapy Appointment
          </h2>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp us instead
          </a>
        </div>
        <AppointmentForm />
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>{siteConfig.medicalDisclaimer}</p>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-grey-200 bg-white p-4 text-sm text-navy-500">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
        <p>
          Your details are used only to process and follow up on your appointment request.
          Submitting a form does not automatically guarantee an appointment — confirmation depends
          on schedule availability.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-5 text-center sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#128C7E]">
          Prefer a quick conversation?
        </p>
        <p className="mt-2 text-navy-700">
          Contact Physio Nexus Academy on WhatsApp for faster guidance about physiotherapy
          appointments and consultations.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#20bd5a]"
        >
          <MessageCircle className="h-5 w-5" />
          Contact us on WhatsApp
        </a>
        <p className="mt-3 text-xs text-navy-500">0348 900 9028 · Available for appointment queries</p>
      </div>
    </div>
  );
}
