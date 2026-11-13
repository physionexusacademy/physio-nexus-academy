import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { MessageCircle, Mail, MapPin, Star } from "lucide-react";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { ContactForm } from "./ContactForm";

const url = "https://physionexusacademy.com/contact";

export const metadata: Metadata = {
  title: {
    absolute:
      "Contact Physio Nexus Academy — Workshops, Appointments & Home Visits Across Pakistan",
  },
  description:
    "Contact Physio Nexus Academy for physiotherapy workshops, patient appointments, home visits and general enquiries across Pakistan. WhatsApp, email or contact form.",
  keywords: [
    "contact Physio Nexus Academy",
    "physiotherapy contact Pakistan",
    "physiotherapy appointment contact",
    "home physiotherapy contact",
    "physiotherapy workshop enquiry",
    "Dr Sajjad Raza contact",
  ],
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: "Contact Physio Nexus Academy",
    description:
      "Questions about workshops, resources or appointments across Pakistan? Message us on WhatsApp, email or the contact form.",
    url,
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Physio Nexus Academy",
    description:
      "Workshops, appointments and home visit enquiries across Pakistan.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://physionexusacademy.com/contact#page",
    url,
    name: "Contact Physio Nexus Academy",
    description: metadata.description,
    about: {
      "@id": "https://physionexusacademy.com/#organization",
    },
    mainEntity: {
      "@id": "https://physionexusacademy.com/#organization",
    },
  };

  return (
    <>
    <NexusHero
      kicker="Academy wing · Contact"
      title={<>Get in <span className="nx-gradient-text">touch</span></>}
      lead={<>Questions about workshops, resources or appointments across Pakistan? Message us on WhatsApp, email, or use the form below.</>}
      crumbs={[{ label: "Academy", href: "/about" }, { label: "Contact" }]}
    />
    <div className="container-content section-padding !pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-navy-600">
            Have a question about workshops, resources or appointments? Send us
            a message or reach out directly.
          </p>
          <div className="mt-6 space-y-3">
            <a
              href={whatsappLink(
                "Hello Physio Nexus Academy, I have a question.",
              )}
              className="flex items-center gap-3 text-navy-700 hover:text-teal-600"
            >
              <MessageCircle className="h-5 w-5 text-teal-500" />{" "}
              {siteConfig.contact.phoneDisplay}
            </a>
            <p className="flex items-start gap-3 text-navy-500">
              <Mail className="mt-0.5 h-5 w-5 text-teal-500" />{" "}
              {siteConfig.contact.email}
            </p>
            <p className="flex items-start gap-3 text-navy-500">
              <MapPin className="mt-0.5 h-5 w-5 flex-none text-teal-500" />{" "}
              {siteConfig.contact.address}
            </p>
          </div>
          <p className="mt-6 text-sm text-navy-500">
            We serve patients and learners across Pakistan. Home visits and
            appointment times are confirmed before booking. For location-specific
            details see{" "}
            <a href="/locations/karachi" className="font-semibold text-teal-600 hover:underline">
              Karachi
            </a>{" "}
            and{" "}
            <a href="/locations/hyderabad" className="font-semibold text-teal-600 hover:underline">
              Hyderabad
            </a>
            .
          </p>

          <div className="mt-6 rounded-xl border border-grey-200 bg-grey-50 p-4">
            <p className="text-sm font-semibold text-navy-800">Already attended a PNA workshop or used our service?</p>
            <p className="mt-1 text-sm text-navy-500">
              Share your honest experience on Google. Reviews help future students and patients make informed decisions.
            </p>
            <a
              href={siteConfig.contact.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              <Star className="h-4 w-4" />
              Leave a Google review
            </a>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
    </>
  );
}
