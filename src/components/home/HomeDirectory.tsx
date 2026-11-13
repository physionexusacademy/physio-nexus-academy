import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Hand,
  HeartPulse,
  House,
  MessageCircle,
  PersonStanding,
  Ruler,
  Stethoscope,
  Trophy,
} from "lucide-react";
import { whatsappLink } from "@/lib/site-config";

/**
 * "What do you want to do today?" — the plain-language directory right under the hero.
 * Every main part of the site is one tap away, with no hidden menus: patients get four
 * big buttons, learners get eight labelled tiles, and everything else is in one row of
 * small links. Server-rendered (no JavaScript needed).
 */
const patientActions = [
  { href: "/rehabverse", label: "Guided 3D home rehab", note: "RehabVerse — a programme made for you", icon: PersonStanding },
  { href: "/appointment", label: "Book an appointment", note: "Clinic or online", icon: CalendarCheck },
  { href: "/home-visit", label: "Physiotherapy at home", note: "A physio visits you", icon: House },
  { href: "/symptom-checker", label: "Check my symptoms", note: "Free, 2 minutes", icon: Stethoscope },
  { href: whatsappLink("Assalam-o-alaikum, I need physiotherapy help."), label: "Ask on WhatsApp", note: "Quick reply", icon: MessageCircle, external: true },
];

const learnerTiles = [
  { href: "/learn", label: "Free lessons", note: "PNA Teacher — step by step, English & Roman Urdu", icon: GraduationCap },
  { href: "/skills", label: "Clinical Skills Lab", note: "MMT, goniometry, neuro exam and more", icon: Ruler },
  { href: "/virtual-patient", label: "Virtual Patient", note: "Examine a 3D patient and get an OSCE score", icon: PersonStanding },
  { href: "/daily-challenge", label: "Daily Challenge", note: "5 questions a day and a leaderboard", icon: Trophy },
  { href: "/manual-therapy", label: "Manual Therapy", note: "35+ techniques with hand placement", icon: Hand },
  { href: "/treatment-plans", label: "Treatment Plans", note: "Condition-by-condition rehab plans", icon: ClipboardList },
  { href: "/workshops", label: "Workshops & CPD", note: "Hands-on training with certificates", icon: CalendarDays },
  { href: "#books", label: "Books", note: "By Dr. Sajjad Raza PT — order online", icon: BookOpen },
];

const moreLinks = [
  { href: "/knowledge-hub", label: "Knowledge Hub" },
  { href: "/msk-injuries", label: "MSK injuries" },
  { href: "/case-lab", label: "Case Lab" },
  { href: "/clinical-visual-atlas", label: "Visual Atlas" },
  { href: "/msk-special-tests", label: "Special tests" },
  { href: "/research", label: "Research help" },
  { href: "/verify", label: "Verify a certificate" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
];

export function HomeDirectory() {
  return (
    <section className="home-dir" aria-labelledby="home-dir-title" data-pna-home-directory>
      <div className="container-content">
        <p className="nx-kicker nx-kicker-light">Start here</p>
        <h2 id="home-dir-title" className="nx-title mt-2 text-3xl text-navy-800 sm:text-4xl">What do you want to do today?</h2>
        <p className="mt-2 max-w-2xl text-base text-slate-600">Tap one — every part of Physio Nexus Academy is one click away.</p>

        <div className="home-dir-grid">
          <div className="home-dir-patient" aria-labelledby="home-dir-patient-title">
            <h3 id="home-dir-patient-title" className="home-dir-heading">
              <HeartPulse className="h-5 w-5" aria-hidden="true" /> I need physiotherapy
            </h3>
            <p className="home-dir-sub">For patients and families</p>
            <ul className="home-dir-patient-list">
              {patientActions.map(({ href, label, note, icon: Icon, external }) => (
                <li key={label}>
                  <a href={href} className="home-dir-patient-btn" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <Icon className="h-5 w-5 flex-none" aria-hidden="true" />
                    <span className="min-w-0">
                      <strong>{label}</strong>
                      <small>{note}</small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-dir-learn" aria-labelledby="home-dir-learn-title">
            <h3 id="home-dir-learn-title" className="home-dir-heading">
              <GraduationCap className="h-5 w-5" aria-hidden="true" /> I&apos;m a student or physiotherapist
            </h3>
            <p className="home-dir-sub">Learn, practise and grow — most of it is free</p>
            <ul className="home-dir-tiles">
              {learnerTiles.map(({ href, label, note, icon: Icon }) => (
                <li key={label}>
                  <a href={href} className="home-dir-tile">
                    <span className="home-dir-tile-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <strong>{label}</strong>
                    <small>{note}</small>
                    <ArrowRight className="home-dir-tile-arrow h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav className="home-dir-more" aria-label="More on Physio Nexus Academy">
          <span>More:</span>
          {moreLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
      </div>
    </section>
  );
}
