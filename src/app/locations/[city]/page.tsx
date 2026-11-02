import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MapPin,
  Stethoscope,
  GraduationCap,
  ArrowRight,
  MessageCircle,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { getAllCitySlugs, getCityBySlug } from "@/lib/locations";

const siteUrl = "https://physionexusacademy.com";

const whatsappBase =
  "https://wa.me/923489009028?text=" +
  encodeURIComponent(
    "Hello Physio Nexus Academy, I want physiotherapy home visit service in my city. Please guide me.",
  );

export function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return {};

  const title = `Physiotherapy Home Visit in ${city.name} | Home Physiotherapy Service`;
  const description = `Request physiotherapy home visit service in ${city.name}, ${city.province}. Book home physiotherapy through Physio Nexus Academy. Submit the form or contact us on WhatsApp for confirmation.`;
  const pageUrl = `${siteUrl}/locations/${city.slug}`;

  return {
    title,
    description,
    keywords: [
      `physiotherapy home visit ${city.name}`,
      `home physiotherapy ${city.name}`,
      `physiotherapy home service ${city.name}`,
      `physiotherapy at home ${city.name}`,
      `home physiotherapist ${city.name}`,
      `physiotherapy ${city.name}`,
      "physiotherapy home visit Pakistan",
      "Physio Nexus Academy",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `Physiotherapy Home Visit in ${city.name} | Physio Nexus Academy`,
      description,
      url: pageUrl,
      siteName: "Physio Nexus Academy",
      locale: "en_PK",
      type: "website",
      images: [
        {
          url: `${siteUrl}/images/founder-dr-sajjad.jpg`,
          width: 1200,
          height: 630,
          alt: `Physiotherapy Home Visit in ${city.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Physiotherapy Home Visit in ${city.name}`,
      description,
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
}

export default async function CityLocationPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const pageUrl = `${siteUrl}/locations/${city.slug}`;
  const whatsappUrl =
    "https://wa.me/923489009028?text=" +
    encodeURIComponent(
      `Hello Physio Nexus Academy, I want physiotherapy home visit service in ${city.name}. Please guide me.`,
    );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#home-visit-service`,
        name: `Physiotherapy Home Visit in ${city.name}`,
        serviceType: "Physiotherapy home visit",
        url: pageUrl,
        description: city.description,
        provider: {
          "@type": "EducationalOrganization",
          "@id": `${siteUrl}/#organization`,
          name: "Physio Nexus Academy",
          url: siteUrl,
          telephone: "+923489009028",
        },
        areaServed: {
          "@type": "City",
          name: city.name,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: city.province,
          },
        },
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: `${siteUrl}/home-visit`,
          servicePhone: "+923489009028",
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
            name: "Locations",
            item: `${siteUrl}/home-visit`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: city.name,
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
        {city.name} · {city.province}
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Physiotherapy Home Visit in {city.name}
      </h1>
      <p className="mt-4 max-w-3xl text-navy-600">{city.description}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#20bd5a]"
        >
          <MessageCircle className="h-5 w-5" />
          Contact us on WhatsApp
        </a>
        <Button href="/home-visit" className="inline-flex items-center justify-center gap-2">
          <Home className="h-5 w-5" />
          Request Home Visit Form
        </Button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border-2 border-teal-500 bg-teal-50 p-6 shadow-sm">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          <h2 className="mt-3 text-xl font-bold text-navy-800">
            Physiotherapy Home Visits in {city.name}
          </h2>
          <p className="mt-3 text-sm leading-6 text-navy-600">{city.homeVisitNote}</p>
          <p className="mt-3 text-sm leading-6 text-navy-600">
            Fill the home visit form with your area, preferred date/time and patient details, or
            message us directly on WhatsApp for faster guidance.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/home-visit">Request a Home Visit</Button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <GraduationCap className="h-6 w-6 text-teal-600" />
          <h2 className="mt-3 text-xl font-bold text-navy-800">
            Physiotherapy Workshops & Learning
          </h2>
          <p className="mt-3 text-sm leading-6 text-navy-600">
            Physio Nexus Academy also offers practical physiotherapy workshops, clinical learning
            resources and professional development pathways. Workshop locations vary by schedule.
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
            <h2 className="text-xl font-bold text-navy-800">
              How home physiotherapy works in {city.name}
            </h2>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-navy-600">
              <li>
                <strong>1.</strong> Submit your city ({city.name}), area, preferred date and time.
              </li>
              <li>
                <strong>2.</strong> Share patient contact details and a short condition summary.
              </li>
              <li>
                <strong>3.</strong> Our team confirms whether a home visit can be arranged for your
                area and schedule.
              </li>
            </ol>
            <p className="mt-3 text-sm text-navy-500">
              Submitting a request does not automatically guarantee a visit. Confirmation depends
              on therapist availability and practical coverage.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-navy-800">
          Physio Nexus Academy — Home Physiotherapy Requests
        </h2>
        <p className="mt-3 leading-7 text-navy-600">
          Physio Nexus Academy was founded by{" "}
          <a href="/founder" className="font-semibold text-teal-600 hover:underline">
            {siteConfig.founder.name}
          </a>
          . The academy provides physiotherapy education, workshops, research support and a clear
          patient pathway for home-visit and appointment requests across Pakistan, including{" "}
          {city.name}.
        </p>
        <div className="mt-5 flex flex-wrap gap-4">
          <a
            href="/home-visit"
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Go to Home Visit Form <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Contact PNA <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <div className="mt-10 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-5 text-center sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#128C7E]">
          Need quick help for {city.name}?
        </p>
        <p className="mt-2 text-navy-700">
          Message Physio Nexus Academy on WhatsApp about physiotherapy home visit availability in{" "}
          {city.name}.
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
        <p className="mt-3 text-xs text-navy-500">0348 900 9028</p>
      </div>
    </div>
  );
}
