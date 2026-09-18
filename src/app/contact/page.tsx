import type { Metadata } from "next";
import { MessageCircle, Mail } from "lucide-react";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Physio Nexus Academy for workshops, resources or general enquiries.",
};

export default function ContactPage() {
  return (
    <div className="container-content section-padding">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Contact</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Get in Touch</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-navy-600">
            Have a question about workshops, resources or appointments? Send us a message or
            reach out directly.
          </p>
          <div className="mt-6 space-y-3">
            <a
              href={whatsappLink("Hello Physio Nexus Academy, I have a question.")}
              className="flex items-center gap-3 text-navy-700 hover:text-teal-600"
            >
              <MessageCircle className="h-5 w-5 text-teal-500" /> {siteConfig.contact.phoneDisplay}
            </a>
            <p className="flex items-center gap-3 text-navy-400">
              <Mail className="h-5 w-5 text-teal-500" /> Email — to be added by the academy
            </p>
          </div>
          <p className="mt-6 text-xs text-navy-400">
            A map/location block will appear here once a verified public address is provided.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
