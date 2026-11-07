import Image from "next/image";
import { Instagram, Mail, MapPin, MessageCircle, Star } from "lucide-react";
import { footerLinks, siteConfig, whatsappLink } from "@/lib/site-config";
import { atlasPublished } from "@/lib/clinical-visual-atlas";
import { visibleWings } from "@/lib/academy-map";
import { BackToTop } from "@/components/BackToTop";

/** The campus directory: every wing of the academy, contact and trust details. */
export function Footer() {
  const wings = visibleWings(atlasPublished);

  return (
    <footer className="nx-sky nx-grid nx-stars nx-footer">
      <div className="container-content pb-8 pt-14 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))]">
          <div>
            <a href="/" className="nx-brand">
              <Image src="/images/pna-logo.png" alt="Physio Nexus Academy logo" width={44} height={44} className="nx-brand-logo !h-11 !w-11" />
              <span>
                <span className="nx-brand-name !text-lg">Physio Nexus Academy</span>
                <span className="nx-brand-sub">Learn · Apply · Transform lives</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--nx-mute)]">
              Pakistan&apos;s online physiotherapy academy — step-by-step lessons, clinical practice, hands-on CPD workshops
              and patient care, built to help students, professionals and patients grow with confidence.
            </p>
            <div className="mt-5 space-y-2.5 text-sm">
              <a href={whatsappLink("Hello Physio Nexus Academy, I'd like to know more.")} className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-[var(--nx-aqua)]" aria-hidden="true" /> {siteConfig.contact.phoneDisplay}
              </a>
              <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[var(--nx-aqua)]" aria-hidden="true" /> {siteConfig.contact.email}
              </a>
              <p className="flex items-start gap-2.5 text-[#c4d6e8]">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-[var(--nx-aqua)]" aria-hidden="true" /> {siteConfig.contact.address}
              </p>
              <a href={siteConfig.contact.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
                <Instagram className="h-4 w-4 text-[var(--nx-aqua)]" aria-hidden="true" /> @physionexusacademy
              </a>
              <a href={siteConfig.contact.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-semibold !text-[var(--nx-amber)]">
                <Star className="h-4 w-4" aria-hidden="true" /> Leave an honest Google review
              </a>
            </div>
          </div>

          {wings.map((wing) => (
            <nav key={wing.id} aria-label={`${wing.label} wing`}>
              <p className="nx-footer-title">{wing.label}</p>
              <p className="mt-1 text-xs text-[var(--nx-dim)]">{wing.tagline}</p>
              <ul className="mt-4 space-y-2.5">
                {wing.places.map((place) => (
                  <li key={place.href}>
                    <a href={place.href} className="text-sm">
                      {place.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-[var(--nx-line)] bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="nx-icon-tile nx-icon-tile-ghost !h-12 !w-12 text-xs font-black">CPD</span>
            <div>
              <p className="nx-kicker">Approved CPD Provider</p>
              <p className="mt-1.5 text-sm font-semibold text-white">Officially approved · The CPD Group · #791052</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="https://thecpdregister.com" target="_blank" rel="noopener noreferrer" className="nx-btn nx-btn-ghost !min-h-[40px] !text-[0.85rem]">
              Verify provider
            </a>
            <a href="/verify" className="nx-btn nx-btn-ghost !min-h-[40px] !text-[0.85rem]">
              Verify PNA certificate
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--nx-line)] pt-6 text-xs text-[var(--nx-dim)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Physio Nexus Academy. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {footerLinks.legal.map((link) => (
              <a key={link.href} href={link.href} className="!text-[var(--nx-dim)] hover:!text-white">
                {link.label}
              </a>
            ))}
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
