import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Physio Nexus Academy | Karachi & Hyderabad",
  description:
    "Contact Physio Nexus Academy for physiotherapy workshops, patient appointments, home visits and general enquiries in Karachi, Hyderabad and across Pakistan.",
  alternates: {
    canonical: "https://physionexusacademy.com/contact",
  },
};

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://physionexusacademy.com/contact#page",
    url: "https://physionexusacademy.com/contact",
    name: "Contact Physio Nexus Academy",
    about: {
      "@id": "https://physionexusacademy.com/#organization",
    },
    mainEntity: {
      "@id": "https://physionexusacademy.com/#organization",
    },
  };

  return (
    <div className="container-content section-padding">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        Contact
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Get in Touch</h1>

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
            Current service areas include{" "}
            <Link href="/locations/karachi" className="font-semibold text-teal-600 hover:underline">
              Karachi
            </Link>{" "}
            and{" "}
            <Link href="/locations/hyderabad" className="font-semibold text-teal-600 hover:underline">
              Hyderabad
            </Link>
            . Home visits and appointment times are confirmed before booking.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
