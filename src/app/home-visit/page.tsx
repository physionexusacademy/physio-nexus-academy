import type { Metadata } from "next";
import { Building2, Home, MessageCircle, ShieldCheck, MapPin } from "lucide-react";
import { HomeVisitForm } from "./HomeVisitForm";

const siteUrl = "https://physionexusacademy.com";
const whatsappUrl =
  "https://wa.me/923489009028?text=" +
  encodeURIComponent(
    "Hello Physio Nexus Academy, I want to request a Physiotherapy Home Visit. Please guide me.",
  );

export const metadata: Metadata = {
  title: "Physiotherapy Home Visit Service in Pakistan | Book Home Physiotherapy",
  description:
    "Request physiotherapy home visit service across Pakistan. Strong coverage in Sindh (Karachi, Hyderabad, Sukkur, Larkana, Nawabshah, Mirpurkhas and more) plus Lahore, Islamabad and other cities. Fill the form or contact us on WhatsApp.",
  keywords: [
    "physiotherapy home visit",
    "physiotherapy home service",
    "home physiotherapy Pakistan",
    "physiotherapy home visit Karachi",
    "physiotherapy home visit Hyderabad",
    "physiotherapy home visit Sukkur",
    "physiotherapy home visit Larkana",
    "physiotherapy home visit Nawabshah",
    "physiotherapy home visit Mirpurkhas",
    "physiotherapy home visit Lahore",
    "physiotherapy home visit Islamabad",
    "home physiotherapist near me",
    "home physiotherapy service Pakistan",
    "physiotherapy at home",
    "book physiotherapy home visit",
    "Physio Nexus Academy home visit",
  ],
  alternates: {
    canonical: `${siteUrl}/home-visit`,
  },
  openGraph: {
    title: "Physiotherapy Home Visit Service in Pakistan | Physio Nexus Academy",
    description:
      "Book a physiotherapy home visit. Available request pathway for patients across Pakistan, with strong focus on Sindh cities. Confirm availability via form or WhatsApp.",
    url: `${siteUrl}/home-visit`,
    siteName: "Physio Nexus Academy",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/founder-dr-sajjad.jpg`,
        width: 1200,
        height: 630,
        alt: "Physiotherapy Home Visit Service — Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Physiotherapy Home Visit Service in Pakistan",
    description:
      "Request home physiotherapy across Pakistan. Form + WhatsApp confirmation available.",
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
  // Sindh focus
  "Karachi",
  "Hyderabad",
  "Sukkur",
  "Larkana",
  "Nawabshah",
  "Mirpurkhas",
  "Jacobabad",
  "Shikarpur",
  "Khairpur",
  "Dadu",
  "Thatta",
  "Badin",
  "Tando Allahyar",
  "Tando Adam",
  "Sanghar",
  "Ghotki",
  "Jamshoro",
  // Other major
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

export default function HomeVisitPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/home-visit#service`,
    name: "Physiotherapy Home Visit Service",
    serviceType: "Physiotherapy home visit",
    url: `${siteUrl}/home-visit`,
    description:
      "Physiotherapy home visit request service for patients across Pakistan, with strong pathways in Sindh cities including Karachi, Hyderabad, Sukkur, Larkana, Nawabshah and more. Availability is confirmed before any visit is scheduled.",
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
      serviceUrl: `${siteUrl}/home-visit`,
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
        name: "Physiotherapy Home Visit",
        item: `${siteUrl}/home-visit`,
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
          Patient Services · Pakistan · Sindh Focus
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Physiotherapy Home Visit Service in Pakistan
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-600">
          Request a <strong>physiotherapy home visit</strong> or{" "}
          <strong>home physiotherapy service</strong> by sharing your city, area,
          preferred date & time, and essential patient details. We accept
          requests from across Pakistan — with especially strong pathways across
          Sindh — and confirm service availability before any visit is finalized.
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
          href="#home-visit-form"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-6 py-3.5 text-sm font-bold text-teal-700 transition hover:bg-teal-50 sm:w-auto"
        >
          <Home className="h-5 w-5" />
          Fill Home Visit Form
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="/appointment"
          className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grey-100 text-teal-700">
            <Building2 className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Clinic / Online Appointment</p>
          <p className="mt-1 text-sm text-navy-500">Book a consultation instead.</p>
        </a>
        <div className="rounded-2xl border-2 border-teal-500 bg-teal-50 p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Home className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-navy-800">Home Visit</p>
          <p className="mt-1 text-sm text-navy-500">You are requesting this service.</p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-navy-800">
          How a home physiotherapy visit request works
        </h2>
        <ol className="mt-4 grid gap-4 text-sm text-navy-600 sm:grid-cols-3">
          <li>
            <span className="font-semibold text-teal-700">1. Choose location & time.</span>
            <br />
            Tell us your city (anywhere in Pakistan), area and preferred appointment slot.
          </li>
          <li>
            <span className="font-semibold text-teal-700">2. Share patient details.</span>
            <br />
            Add contact information, full address and a brief condition summary.
          </li>
          <li>
            <span className="font-semibold text-teal-700">3. Receive confirmation.</span>
            <br />
            Our team confirms service-area and schedule availability before the visit.
          </li>
        </ol>
      </section>

      <section className="mt-8 rounded-2xl border border-teal-100 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
          <div>
            <h2 className="text-lg font-bold text-navy-800">
              Strong focus on Sindh + requests from across Pakistan
            </h2>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              You can submit a request from any city in Pakistan. We currently have the strongest
              coverage and faster confirmation pathways in <strong>Karachi</strong> and{" "}
              <strong>Hyderabad</strong>, and we actively receive and evaluate requests from many
              other Sindh cities as well as major cities nationwide.
            </p>
            <p className="mt-3 text-sm leading-6 text-navy-600">
              <strong>Sindh cities include:</strong> Karachi, Hyderabad, Sukkur, Larkana,
              Nawabshah, Mirpurkhas, Jacobabad, Shikarpur, Khairpur, Dadu, Thatta, Badin, Tando
              Allahyar, Tando Adam, Sanghar, Ghotki, Jamshoro and more.
            </p>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              Other common request cities: Lahore, Islamabad, Rawalpindi, Faisalabad, Multan,
              Peshawar, Quetta.
            </p>
            <p className="mt-3 text-sm font-medium text-navy-700">
              Not sure about your area? Message us on WhatsApp — we will tell you honestly whether
              a home visit can be arranged.
            </p>
          </div>
        </div>
      </section>

      <div id="home-visit-form" className="mt-10 scroll-mt-28">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-navy-800">Request a Physiotherapy Home Visit</h2>
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
        <HomeVisitForm />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-grey-200 bg-white p-4 text-sm text-navy-500">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
        <p>
          Your address and contact details are used only to process and follow up on your home visit
          request. Submitting a form does not automatically guarantee a visit — confirmation depends
          on area coverage and therapist schedule.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-5 text-center sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#128C7E]">
          Prefer a quick conversation?
        </p>
        <p className="mt-2 text-navy-700">
          Contact Physio Nexus Academy on WhatsApp for faster guidance about home physiotherapy in
          your city.
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
        <p className="mt-3 text-xs text-navy-500">0348 900 9028 · Available for home visit queries</p>
      </div>
    </div>
  );
}
