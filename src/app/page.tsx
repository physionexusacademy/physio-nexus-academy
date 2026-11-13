import type { Metadata } from "next";
import { ArrowRight, ChevronDown, Flame, Medal, Quote, Trophy } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { atlasPublished } from "@/lib/clinical-visual-atlas";
import { DailyLeaderboard } from "@/components/daily-challenge/DailyLeaderboard";
import { DailyChallengeCountdown } from "@/components/daily-challenge/DailyChallengeCountdown";
import { LobbyHero } from "@/components/home/LobbyHero";
import { StudentPass } from "@/components/home/StudentPass";
import { PremiumPathwayBrowser } from "@/components/home/PremiumPathwayBrowser";
import { HomeBooks } from "@/components/home/HomeBooks";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeNeedHelp } from "@/components/home/HomeNeedHelp";
import "./daily-challenge/daily-challenge.css";
import "./home-lobby.css";

export const metadata: Metadata = {
  title: {
    absolute: "Physio Nexus Academy | Official Site — Physiotherapy Education & Workshops in Pakistan",
  },
  description:
    "Official website of Physio Nexus Academy (PNA) — Pakistan’s practical physiotherapy academy. Free clinical learning, PNA Teacher, Skills Lab, Virtual Patient, Conditions & Treatment Guide, manual therapy, CPD workshops, books, home visits and appointments. Founded by Dr. Sajjad Raza PT.",
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
    title: "Physio Nexus Academy | Official Site",
    description:
      "Official website of Physio Nexus Academy — practical physiotherapy education, workshops and clinical learning in Pakistan.",
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
    title: "Physio Nexus Academy | Official Site",
    description:
      "Official website of Physio Nexus Academy — physiotherapy education and workshops in Pakistan.",
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

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createPublicClient();

  const { data: testimonialRows } = await supabase
    .from("testimonials")
    .select("id,content,name,role,sort_order")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(3);

  const testimonials = testimonialRows?.length ? testimonialRows : null;

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
        numberOfItems: 12,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PNA Teacher", url: "https://physionexusacademy.com/learn" },
          { "@type": "ListItem", position: 2, name: "Clinical Skills Lab", url: "https://physionexusacademy.com/skills" },
          { "@type": "ListItem", position: 3, name: "Virtual Patient", url: "https://physionexusacademy.com/virtual-patient" },
          { "@type": "ListItem", position: 4, name: "Conditions & Treatment Guide", url: "https://physionexusacademy.com/conditions" },
          { "@type": "ListItem", position: 5, name: "Manual Therapy", url: "https://physionexusacademy.com/manual-therapy" },
          { "@type": "ListItem", position: 6, name: "Case Lab", url: "https://physionexusacademy.com/case-lab" },
          { "@type": "ListItem", position: 7, name: "Workshops & CPD", url: "https://physionexusacademy.com/workshops" },
          { "@type": "ListItem", position: 8, name: "Books & Resources", url: "https://physionexusacademy.com/resources" },
          { "@type": "ListItem", position: 9, name: "Home Visit", url: "https://physionexusacademy.com/home-visit" },
          { "@type": "ListItem", position: 10, name: "Book Appointment", url: "https://physionexusacademy.com/appointment" },
          { "@type": "ListItem", position: 11, name: "About", url: "https://physionexusacademy.com/about" },
          { "@type": "ListItem", position: 12, name: "Contact", url: "https://physionexusacademy.com/contact" },
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

      <HomeNeedHelp />

      <HomeFeatures />

      <HomeBooks />

      <section data-pna-home-flagship="daily-clinical-challenge-v2" className="hdc" aria-labelledby="pna-daily-flagship-title">
        <div className="container-content">
          <div className="hdc-card nx-sky nx-grid">
            <div className="hdc-lead">
              <span className="hdc-flame" aria-hidden="true"><Flame className="h-6 w-6" /></span>
              <div className="min-w-0">
                <p className="hdc-kicker">Daily Clinical Challenge <span className="nx-live" /></p>
                <h2 id="pna-daily-flagship-title">Five questions. <span className="nx-gradient-text">One focused challenge.</span></h2>
                <p className="hdc-facts">5 questions · 30 seconds each · up to 100 points</p>
              </div>
            </div>
            <div className="hdc-time"><DailyChallengeCountdown /></div>
            <div className="hdc-actions">
              <a href="/daily-challenge#play-daily" className="nx-btn nx-btn-primary">
                Take today&apos;s challenge <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="/daily-challenge#hall-of-fame" className="nx-btn nx-btn-ghost">
                <Medal className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /> Hall of Fame
              </a>
            </div>
            <details className="hdc-board">
              <summary><Trophy className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /> Today&apos;s leaderboard — top 5 <ChevronDown className="hdc-chev h-4 w-4" aria-hidden="true" /></summary>
              <div className="hdc-board-body">
                <DailyLeaderboard compact title="Today's Top 5" />
                <a href="/daily-challenge#full-leaderboard" className="hdc-board-link">All scores, monthly leaders and yearly champions <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              </div>
            </details>
          </div>
        </div>
      </section>

      <StudentPass />

      <PremiumPathwayBrowser showAtlas={atlasPublished} />

      {testimonials ? (
        <section className="container-content pb-12" aria-labelledby="home-testimonials-title">
          <p className="nx-kicker nx-kicker-light">Trusted by learners</p>
          <h2 id="home-testimonials-title" className="nx-title mt-3 text-3xl text-navy-800">What physiotherapists & students say</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <Quote className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-7 text-slate-700">“{t.content}”</blockquote>
                <figcaption className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-sm font-bold text-navy-800">{t.name}</p>
                  {t.role ? <p className="text-xs font-medium text-slate-500">{t.role}</p> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

    </>
  );
}
