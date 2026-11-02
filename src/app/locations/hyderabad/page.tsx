import type { Metadata } from "next";
import { Stethoscope, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

const siteUrl = "https://physionexusacademy.com";
const pageUrl = `${siteUrl}/locations/hyderabad`;

export const metadata: Metadata = {
  title: "Physiotherapy Home Visits & Workshops in Hyderabad",
  description:
    "Physio Nexus Academy provides physiotherapy home-visit requests and scheduled hands-on physiotherapy workshops in Hyderabad, Sindh.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Physiotherapy Services & Workshops in Hyderabad | Physio Nexus Academy",
    description:
      "Explore physiotherapy home visits and clinical skills workshops from Physio Nexus Academy in Hyderabad, Sindh.",
    url: pageUrl,
    type: "website",
  },
};

export default function HyderabadLocationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#physiotherapy-services`,
        name: "Physiotherapy Services in Hyderabad",
        serviceType: "Physiotherapy appointment and home visit services",
        url: pageUrl,
        provider: {
          "@id": `${siteUrl}/#organization`,
        },
        areaServed: {
          "@type": "City",
          name: "Hyderabad",
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: "Sindh",
          },
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
            name: "Hyderabad",
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
        Hyderabad, Sindh
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Physiotherapy Services &amp; Workshops in Hyderabad
      </h1>
      <p className="mt-4 max-w-3xl text-navy-600">
        Physio Nexus Academy supports patients and physiotherapy learners in Hyderabad
        through home-visit requests and scheduled hands-on clinical workshops.
        Availability, venue and appointment details are confirmed for each request or event.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          <h2 className="mt-3 text-xl font-bold text-navy-800">
            Physiotherapy Home Visits in Hyderabad
          </h2>
          <p className="mt-3 text-sm leading-6 text-navy-600">
            Patients can submit a home-visit request with their Hyderabad area,
            preferred date and time, contact details and a brief condition summary.
            The team confirms service coverage and schedule before the visit is finalized.
          </p>
          <Button href="/home-visit" className="mt-5">
            Request a Home Visit
          </Button>
        </section>

        <section className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <GraduationCap className="h-6 w-6 text-teal-600" />
          <h2 className="mt-3 text-xl font-bold text-navy-800">
            Physiotherapy Workshops in Hyderabad
          </h2>
          <p className="mt-3 text-sm leading-6 text-navy-600">
            PNA conducts practical physiotherapy training in Hyderabad when workshops
            are scheduled. Current workshop dates, topics, venues, instructors and
            registration details are published online.
          </p>
          <Button href="/workshops" variant="outline" className="mt-5">
            View Workshops
          </Button>
        </section>
      </div>

      <section className="mt-8 rounded-2xl bg-grey-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-navy-800">
          Clinical Education in Hyderabad
        </h2>
        <p className="mt-3 leading-7 text-navy-600">
          Physio Nexus Academy combines structured clinical workshops with learning
          resources and professional development for physiotherapy students and
          practitioners. Workshop availability in Hyderabad depends on the published schedule.
        </p>
        <a
          href="/training"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          View documented training activities <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-navy-800">
          About Physio Nexus Academy
        </h2>
        <p className="mt-3 leading-7 text-navy-600">
          PNA was founded by{" "}
          <a href="/founder" className="font-semibold text-teal-600 hover:underline">
            {siteConfig.founder.name}
          </a>
          , with a focus on practical physiotherapy education, clinical skills and
          evidence-informed learning.
        </p>
        <a
          href="/contact"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          Contact PNA <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
