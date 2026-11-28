import type { Metadata } from "next";
import { ArrowRight, Flame, Medal } from "lucide-react";
import { atlasPublished } from "@/lib/clinical-visual-atlas";
import { HomeDailyBoard } from "@/components/home/HomeDailyBoard";
import { DailyChallengeCountdown } from "@/components/daily-challenge/DailyChallengeCountdown";
import { LobbyHero } from "@/components/home/LobbyHero";
import { StudentPass } from "@/components/home/StudentPass";
import { PremiumPathwayBrowser } from "@/components/home/PremiumPathwayBrowser";
import { HomeBooks } from "@/components/home/HomeBooks";
import { HomeLeagues } from "@/components/home/HomeLeagues";
import { HomeFeaturesMore, HomeFeaturesTop } from "@/components/home/HomeFeatures";
import { HomeNeedHelp } from "@/components/home/HomeNeedHelp";
import { HomeBodyMap } from "@/components/home/HomeBodyMap";
import { GuideMe } from "@/components/avatar/GuideMe";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { HomeFounder } from "@/components/home/HomeFounder";
import { conditionCatalog } from "@/lib/conditions/catalog";
import { Ur } from "@/components/Ur";
import "./daily-challenge/daily-challenge.css";
import "./home-lobby.css";

export const metadata: Metadata = {
  title: { absolute: "Physio Nexus Academy — Physiotherapy Learning in Pakistan" },
  description:
    "Physio Nexus Academy (PNA): free clinical learning, PNA Teacher, Skills Lab, Virtual Patient, RehabVerse, workshops and physiotherapy care in Pakistan.",
  keywords: [
    "Physio Nexus Academy",
    "Physio Nexus Academy Pakistan",
    "PNA physiotherapy",
    "Physio Nexus Academy official",
    "physiotherapy education Pakistan",
    "physiotherapy workshops Pakistan",
    "manual therapy training Pakistan",
    "Dr Sajjad Raza PT",
    "PNA Teacher",
    "physiotherapy students Pakistan",
  ],
  openGraph: {
    title: "Physio Nexus Academy — Physiotherapy Learning in Pakistan",
    description:
      "Physio Nexus Academy (PNA): free clinical learning, PNA Teacher, Skills Lab, Virtual Patient, RehabVerse, workshops and physiotherapy care in Pakistan.",
    url: "https://physionexusacademy.com",
    siteName: "Physio Nexus Academy",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "https://physionexusacademy.com/images/pna-logo.png",
        width: 512,
        height: 512,
        alt: "Physio Nexus Academy",
      },
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Sajjad Raza PT — Founder of Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Physio Nexus Academy — Physiotherapy Learning in Pakistan",
    description:
      "Physio Nexus Academy (PNA): free clinical learning, PNA Teacher, Skills Lab, Virtual Patient, RehabVerse, workshops and physiotherapy care in Pakistan.",
    images: ["https://physionexusacademy.com/images/pna-logo.png"],
  },
  alternates: {
    canonical: "https://physionexusacademy.com",
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

// A prebuilt (static) page: it is served straight from Cloudflare's edge in a fraction of a second and never renders per visit.
// Everything live on it (countdown, leaderboard, testimonials) loads in the browser.
export default function HomePage() {
  const brandHomeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://physionexusacademy.com/#webpage",
        url: "https://physionexusacademy.com",
        name: "Physio Nexus Academy",
        description:
          "Official website of Physio Nexus Academy — practical physiotherapy education, clinical learning and workshops in Pakistan.",
        isPartOf: { "@id": "https://physionexusacademy.com/#website" },
        about: { "@id": "https://physionexusacademy.com/#organization" },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: "https://physionexusacademy.com/images/pna-logo.png",
        },
        inLanguage: "en-PK",
      },
      {
        "@type": "ItemList",
        name: "Physio Nexus Academy — Main sections",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: 11,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PNA Teacher", url: "https://physionexusacademy.com/learn" },
          { "@type": "ListItem", position: 2, name: "Clinical Skills Lab", url: "https://physionexusacademy.com/skills" },
          { "@type": "ListItem", position: 3, name: "Virtual Patient", url: "https://physionexusacademy.com/virtual-patient" },
          { "@type": "ListItem", position: 4, name: "Conditions & Treatment Guide", url: "https://physionexusacademy.com/conditions" },
          { "@type": "ListItem", position: 5, name: "Manual Therapy", url: "https://physionexusacademy.com/manual-therapy" },
          { "@type": "ListItem", position: 6, name: "Workshops & CPD", url: "https://physionexusacademy.com/workshops" },
          { "@type": "ListItem", position: 7, name: "Books & Resources", url: "https://physionexusacademy.com/resources" },
          { "@type": "ListItem", position: 8, name: "Home Visit", url: "https://physionexusacademy.com/home-visit" },
          { "@type": "ListItem", position: 9, name: "Book Appointment", url: "https://physionexusacademy.com/appointment" },
          { "@type": "ListItem", position: 10, name: "About", url: "https://physionexusacademy.com/about" },
          { "@type": "ListItem", position: 11, name: "Contact", url: "https://physionexusacademy.com/contact" },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(brandHomeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <LobbyHero atlasPublished={atlasPublished} />

      {/* "I'm a student / physiotherapist / I need physiotherapy": the first choice a new visitor makes, straight after the hero */}
      <PremiumPathwayBrowser showAtlas={atlasPublished} />

      <HomeNeedHelp />

      <GuideMe />

      <HomeBodyMap items={conditionCatalog.map(({ slug, name, area, type, stages }) => ({ slug, name, area, type, stages }))} />

      <HomeFeaturesTop />

      <section data-pna-home-flagship="daily-clinical-challenge-v2" className="hdc" aria-labelledby="pna-daily-flagship-title">
        <div className="container-content">
          <div className="hdc-card nx-sky nx-grid">
            <div className="hdc-lead">
              <span className="hdc-flame" aria-hidden="true"><Flame className="h-6 w-6" /></span>
              <div className="min-w-0">
                <p className="hdc-kicker"><Ur en="Daily Clinical Challenge" ur="Rozana Clinical Challenge" /> <span className="nx-live" /></p>
                <h2 id="pna-daily-flagship-title"><Ur en="Five questions." ur="Paanch sawal." /> <span className="nx-gradient-text"><Ur en="One focused challenge." ur="Ek focused challenge." /></span></h2>
                <p className="hdc-facts"><Ur en="5 questions · 30 seconds each · up to 100 points" ur="5 sawal · har sawal 30 second · 100 points tak" /></p>
              </div>
            </div>
            <div className="hdc-time"><DailyChallengeCountdown /></div>
            <ol className="hdc-track" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n}><i />Q{n}</li>
              ))}
              <li className="hdc-track-end"><i />100</li>
            </ol>
            <div className="hdc-actions">
              <a href="/daily-challenge#play-daily" className="nx-btn nx-btn-primary">
                <Ur en="Take today's challenge" ur="Aaj ka challenge dein" /> <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="/daily-challenge#full-leaderboard" className="nx-btn nx-btn-ghost">
                <Medal className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /> <Ur en="All rankings" ur="Tamam rankings" />
              </a>
            </div>
            <HomeDailyBoard />
          </div>
        </div>
      </section>

      <HomeFeaturesMore />

      <HomeLeagues />

      <HomeBooks />

      <StudentPass />

      <HomeFounder />

      <HomeTestimonials />

    </>
  );
}
