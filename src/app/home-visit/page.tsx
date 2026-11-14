import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { Building2, Home, MessageCircle, ShieldCheck, MapPin } from "lucide-react";
import { HomeVisitForm } from "./HomeVisitForm";

const siteUrl = "https://physionexusacademy.com";
const whatsappUrl =
  "https://wa.me/923489009028?text=" +
  encodeURIComponent(
    "Hello Physio Nexus Academy, I want to request a Physiotherapy Home Visit. Please guide me.",
  );

export const metadata: Metadata = {
  title: "Home Physiotherapy Visits Across Pakistan",
  description:
    "Request a physiotherapist home visit anywhere in Pakistan. Submit the form or WhatsApp and we confirm availability before the visit.",
  keywords: [
    "home physiotherapy Pakistan",
    "physiotherapy home visit Pakistan",
    "physiotherapy at home",
    "home physiotherapist near me",
    "book physiotherapy home visit",
    "physiotherapy home service Pakistan",
    "home visit physiotherapist",
    "physiotherapy home visit Karachi",
    "physiotherapy home visit Lahore",
    "physiotherapy home visit Islamabad",
    "physiotherapy home visit Hyderabad",
    "Physio Nexus Academy home visit",
  ],
  alternates: {
    canonical: `${siteUrl}/home-visit`,
  },
  openGraph: {
    title: "Home Physiotherapy Visits Across Pakistan | PNA",
    description:
      "Request a physiotherapist home visit anywhere in Pakistan. Submit the form or WhatsApp and we confirm availability before the visit.",
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
    title: "Home Physiotherapy Visits Across Pakistan | PNA",
    description:
      "Request a physiotherapist home visit anywhere in Pakistan. Submit the form or WhatsApp and we confirm availability before the visit.",
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
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Bahawalpur",
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
      "Physiotherapy home visit request service for patients across Pakistan. Availability is confirmed before any visit is scheduled.",
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
    <>
    <NexusHero
      kicker="Clinic wing · Home physiotherapy across Pakistan"
      title={<>Physiotherapy at <span className="nx-gradient-text">your home</span></>}
      lead={<>Request a <strong className="text-white">physiotherapy home visit</strong> from anywhere in Pakistan. Share your city, area, preferred date & time and essential patient details. Availability is confirmed before any visit is finalised.</>}
      crumbs={[{ label: "Clinic", href: "/patient-services" }, { label: "Home Visit" }]}
      actions={<><a href="#home-visit-form" className="nx-btn nx-btn-primary">Fill the request form</a><a href="/appointment" className="nx-btn nx-btn-ghost">Clinic appointment instead</a></>}
    />
    <div className="container-content section-padding !pt-10 max-w-3xl">
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
              Home physiotherapy across Pakistan
            </h2>
            <p className="mt-2 text-sm leading-6 text-navy-600">
              You can submit a request from any city in Pakistan. We evaluate every request and confirm
              whether a home visit can be arranged in your area.
            </p>
            <p className="mt-3 text-sm leading-6 text-navy-600">
              Common request cities include: Karachi, Hyderabad, Lahore, Islamabad, Rawalpindi,
              Faisalabad, Multan, Peshawar, Quetta, Sukkur, Larkana, Nawabshah, Mirpurkhas and many more.
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
        <div id="home-visit-form" className="scroll-mt-24">
          <HomeVisitForm />
        </div>
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
    </>
  );
}
