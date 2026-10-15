import type { Metadata } from "next";
import { MapPin, Stethoscope, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

const siteUrl = "https://physionexusacademy.com";
const pageUrl = `${siteUrl}/locations/karachi`;

export const metadata: Metadata = {
  title: "Physiotherapy Home Visits in Karachi",
  description:
    "Request home physiotherapy in Karachi through Physio Nexus Academy. Share your area and preferred time; visit coverage and scheduling are confirmed before booking.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Physiotherapy Services & Workshops in Karachi | Physio Nexus Academy",
    description:
      "Explore physiotherapy home visits, appointment support and clinical skills workshops from Physio Nexus Academy in Karachi.",
    url: pageUrl,
    type: "website",
  },
};

export default function KarachiLocationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#physiotherapy-services`,
        name: "Physiotherapy Services in Karachi",
        serviceType: "Physiotherapy appointment and home visit services",
        url: pageUrl,
        provider: {
          "@id": `${siteUrl}/#organization`,
        },
        areaServed: {
          "@type": "City",
          name: "Karachi",
        },
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: `${siteUrl}/home-visit`,
        },
      },
      {
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
            name: "Karachi",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="container-content section-padding max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        Karachi
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Physiotherapy Home Visits in Karachi
      </h1>
      <p className="mt-4 max-w-3xl text-navy-600">
        Looking for physiotherapy at home in Karachi? Physio Nexus Academy lets you
        request a home visit by sharing your Karachi area, preferred date and time, and
        a brief description of the patient’s needs. Our team confirms service coverage
        and schedule availability before any visit is finalized. We also publish hands-on
        physiotherapy workshops and clinical learning opportunities in Karachi.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          <h2 className="mt-3 text-xl font-bold text-navy-800">
            Physiotherapy Home Visits in Karachi
          </h2>
          <p className="mt-3 text-sm leading-6 text-navy-600">
            Request a home physiotherapy visit in Karachi by sharing your area,
            preferred date and time, contact details, and a brief condition summary.
            The team confirms whether your location and requested time are covered
            before finalizing the visit.
          </p>
          <p className="mt-3 text-sm leading-6 text-navy-600">
            Home visits can be useful for patients who find travel difficult or prefer
            assessment and rehabilitation planning in their home environment. The exact
            service and visit plan depend on clinical needs and confirmed availability.
          </p>
          <Button href="/home-visit" className="mt-5">
            Request a Home Visit
          </Button>
        </section>

        <section className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <GraduationCap className="h-6 w-6 text-teal-600" />
          <h2 className="mt-3 text-xl font-bold text-navy-800">
            Physiotherapy Workshops in Karachi
          </h2>
          <p className="mt-3 text-sm leading-6 text-navy-600">
            PNA schedules practical physiotherapy workshops covering clinical skills
            and evidence-informed techniques. Current dates, venues, instructors and
            registration details are published on the workshops page.
          </p>
          <Button href="/workshops" variant="outline" className="mt-5">
            View Workshops
          </Button>
        </section>
      </div>

      <section className="mt-8 rounded-2xl bg-grey-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 h-5 w-5 flex-none text-teal-600" />
          <div>
            <h2 className="text-xl font-bold text-navy-800">Karachi Contact Address</h2>
            <p className="mt-2 text-navy-600">{siteConfig.contact.address}</p>
            <p className="mt-2 text-sm text-navy-500">
              Appointments and workshop schedules are confirmed in advance.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-navy-800">
          Physio Nexus Academy in Karachi
        </h2>
        <p className="mt-3 leading-7 text-navy-600">
          Physio Nexus Academy was founded by{" "}
          <a href="/founder" className="font-semibold text-teal-600 hover:underline">
            {siteConfig.founder.name}
          </a>
          . The academy combines physiotherapy education, professional workshops,
          research support and patient-service pathways within one platform.
        </p>
        <a
          href="/contact"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          Contact PNA in Karachi <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
