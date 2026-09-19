import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { footerLinks, siteConfig, whatsappLink } from "@/lib/site-config";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-300">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-grey-200 hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      <div className="container-content section-padding grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/images/pna-logo.png"
              alt={`${siteConfig.academyName} logo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-sm bg-white object-contain p-1"
            />
            <span className="font-heading text-lg font-semibold">
              Physio Nexus Academy
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-grey-200">
            Physiotherapy education, workshops, learning resources, research
            support and patient services — built to help students, professionals
            and patients grow with confidence.
          </p>
          <div className="mt-5 space-y-2 text-sm text-grey-200">
            <a
              href={whatsappLink(
                "Hello Physio Nexus Academy, I'd like to know more.",
              )}
              className="flex items-center gap-2 hover:text-white"
            >
              <MessageCircle className="h-4 w-4 text-teal-300" />{" "}
              {siteConfig.contact.phoneDisplay}
            </a>
            <span className="flex items-center gap-2 text-grey-300">
              <Mail className="h-4 w-4 text-teal-300" />{" "}
              physionexusacademypk@gmail.com
            </span>
            <span className="flex items-center gap-2 text-grey-300">
              <MapPin className="h-4 w-4 text-teal-300" /> Service cities — to
              be added
            </span>
          </div>
        </div>

        <FooterColumn title="Academy" links={footerLinks.academy} />
        <FooterColumn title="For Students" links={footerLinks.students} />
        <FooterColumn title="For Patients" links={footerLinks.patients} />
      </div>

      <div className="border-t border-white/10">
        <div className="container-content flex flex-col gap-3 py-5 text-xs text-grey-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Physio Nexus Academy. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
