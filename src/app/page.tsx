import type { Metadata } from "next";
import { ArrowRight, BookMarked, BookOpen, CalendarDays, Flame, Laugh, LibraryBig, MapPin, Medal, Quote, Sparkles, Timer, Trophy } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { conditionCatalog } from "@/lib/conditions/catalog";
import { areaLabel } from "@/lib/conditions/taxonomy";
import { atlasPublished } from "@/lib/clinical-visual-atlas";
import { DailyLeaderboard } from "@/components/daily-challenge/DailyLeaderboard";
import { DailyChallengeCountdown } from "@/components/daily-challenge/DailyChallengeCountdown";
import { LobbyHero } from "@/components/home/LobbyHero";
import { StudentPass } from "@/components/home/StudentPass";
import { PremiumPathwayBrowser } from "@/components/home/PremiumPathwayBrowser";
import { MeetPnaTeacher } from "@/components/home/MeetPnaTeacher";
import { HomeDirectory } from "@/components/home/HomeDirectory";
import { HomeBooks } from "@/components/home/HomeBooks";
import { HomeRehabVerse } from "@/components/home/HomeRehabVerse";
import { getLatestEpisode, stupidInternEpisodes } from "@/lib/stupid-intern-diaries";
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

  const dateParts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type: string) => dateParts.find((part) => part.type === type)?.value ?? "";
  const todayInPakistan = `${datePart("year")}-${datePart("month")}-${datePart("day")}`;

  const [{ data: workshopRows }, { data: testimonialRows }] = await Promise.all([
    supabase
      .from("workshops")
      .select("id,slug,title,summary,city,start_date")
      .eq("status", "published")
      .gte("start_date", todayInPakistan)
      .order("start_date", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("testimonials")
      .select("id,content,name,role,sort_order")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(3),
  ]);

  const featuredWorkshops = workshopRows?.length ? workshopRows : null;
  const testimonials = testimonialRows?.length ? testimonialRows : null;
  // Three popular starting points from the Conditions & Treatment Guide.
  const popularConditions = ["non-specific-low-back-pain", "knee-osteoarthritis", "rotator-cuff-tendinopathy"]
    .map((slug) => conditionCatalog.find((item) => item.slug === slug))
    .filter((item): item is (typeof conditionCatalog)[number] => Boolean(item));
  const latestEpisode = getLatestEpisode();

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
      <LobbyHero atlasPublished={atlasPublished} conditionCount={conditionCatalog.length} />

      <HomeDirectory />

      <HomeRehabVerse />

      <HomeBooks />

      <StudentPass />

      <PremiumPathwayBrowser showAtlas={atlasPublished} />

      <section data-pna-home-flagship="daily-clinical-challenge-v2" className="nx-sky nx-grid lobby-arena" aria-labelledby="pna-daily-flagship-title">
        <div className="container-content lobby-arena-grid">
          <div>
            <p className="nx-kicker">
              <Flame className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /> Daily Clinical Challenge <span className="nx-live" />
            </p>
            <h2 id="pna-daily-flagship-title" className="nx-title mt-4 text-4xl text-white sm:text-5xl">
              Five questions.<br /> <span className="nx-gradient-text">One focused challenge.</span>
            </h2>
            <p className="nx-lead mt-4 max-w-xl">
              Five timed questions every day. Score points, climb the leaderboard and learn from every explanation — open to every learner.
            </p>
            <div className="lobby-arena-stats" aria-label="Daily challenge format">
              <div className="nx-stat"><Sparkles className="mb-2 h-4 w-4 text-[var(--nx-aqua)]" aria-hidden="true" /><strong>05</strong><span>questions daily</span></div>
              <div className="nx-stat"><Timer className="mb-2 h-4 w-4 text-[var(--nx-aqua)]" aria-hidden="true" /><strong>30s</strong><span>per question</span></div>
              <div className="nx-stat"><Trophy className="mb-2 h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /><strong>100</strong><span>maximum points</span></div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="/daily-challenge#play-daily" className="nx-btn nx-btn-primary">
                Take today's challenge <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="/daily-challenge#hall-of-fame" className="nx-btn nx-btn-ghost">
                <Medal className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /> Hall of Fame
              </a>
            </div>
            <div className="lobby-countdown">
              <DailyChallengeCountdown />
            </div>
          </div>
          <div className="lobby-scoreboard">
            <div className="flex items-center justify-between gap-3 px-1 pb-3">
              <span className="nx-kicker"><span className="nx-live" /> Today's leaderboard</span>
              <span className="text-xs font-semibold text-[var(--nx-dim)]">Resets at midnight PKT</span>
            </div>
            <DailyLeaderboard compact title="Today's Top 5" />
            <a href="/daily-challenge#full-leaderboard" className="mt-3 inline-flex items-center gap-2 px-1 text-sm font-semibold text-[var(--nx-aqua)] hover:text-white">
              All scores, monthly leaders and yearly champions <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <MeetPnaTeacher />

      <section className="container-content lobby-news" aria-labelledby="campus-news-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="nx-kicker nx-kicker-light"><span className="nx-live" /> Campus news</p>
            <h2 id="campus-news-title" className="nx-title mt-3 text-3xl text-navy-800 sm:text-4xl">Fresh on campus today</h2>
          </div>
          <a href="/conditions" className="nx-btn nx-btn-light !min-h-[40px] !text-[0.85rem]">
            Explore conditions &amp; treatment plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="lobby-news-grid">
          <a href={`/stupid-intern-diaries#ep-${latestEpisode.id}`} className="lobby-news-card lobby-news-episode rounded-3xl border">
            <span className="lobby-news-tag"><Laugh className="h-4 w-4" aria-hidden="true" /> Stupid Intern Diaries · EP {String(latestEpisode.id).padStart(2, "0")}</span>
            <strong className="lobby-news-title">{latestEpisode.title}</strong>
            <span className="lobby-news-text">{latestEpisode.field} — funny clinic moments, questionable intern decisions and the lesson you should actually remember.</span>
            <span className="lobby-news-more">Read the episode · {stupidInternEpisodes.length} episodes <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </a>

          <div className="lobby-news-card rounded-3xl border">
            <span className="lobby-news-tag"><CalendarDays className="h-4 w-4" aria-hidden="true" /> Workshops & CPD</span>
            {featuredWorkshops ? (
              <ul className="mt-3 space-y-3">
                {featuredWorkshops.map((workshop) => (
                  <li key={workshop.id}>
                    <a href={`/workshops/${workshop.slug}`} className="group block rounded-2xl border border-slate-200 bg-white p-3 hover:border-teal-300">
                      <strong className="block text-sm font-bold text-navy-800 group-hover:text-teal-800">{workshop.title}</strong>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                        {workshop.start_date ? <span>{new Date(workshop.start_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : null}
                        {workshop.city ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{workshop.city}</span> : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <strong className="lobby-news-title">Hands-on training that transfers to the clinic</strong>
                <span className="lobby-news-text">Practical CPD workshops across Pakistan with verifiable certificates.</span>
              </>
            )}
            <a href="/workshops" className="lobby-news-more">See all workshops <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>

          <div className="lobby-news-card rounded-3xl border">
            <span className="lobby-news-tag"><LibraryBig className="h-4 w-4" aria-hidden="true" /> Conditions &amp; treatment plans</span>
            <ul className="mt-3 space-y-2.5">
              {popularConditions.map((item) => (
                <li key={item.slug}>
                  <a href={`/conditions/${item.slug}`} className="group flex items-start gap-3 rounded-2xl p-2 hover:bg-teal-50/70">
                    <BookOpen className="mt-0.5 h-4 w-4 flex-none text-teal-700" aria-hidden="true" />
                    <span className="min-w-0">
                      <strong className="block text-sm font-bold leading-snug text-navy-800 group-hover:text-teal-800">{item.name}</strong>
                      <span className="text-xs text-slate-500">{areaLabel(item.area)} · {item.stages}-stage plan</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a href="/conditions" className="lobby-news-more">All {conditionCatalog.length} conditions <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className="container-content pb-12" data-pna-home-feature="clinical-registry-v1" aria-labelledby="home-registry-title">
        <div className="nx-sky nx-grid lobby-registry">
          <div className="min-w-0">
            <p className="nx-kicker"><BookMarked className="h-4 w-4" aria-hidden="true" /> PNA Clinical Registry</p>
            <h2 id="home-registry-title" className="nx-title mt-3 text-2xl text-white sm:text-3xl">Real cases, reviewed and de-identified.</h2>
            <p className="nx-lead mt-2 max-w-2xl text-sm sm:text-base">
              Learn from clinicians' documented assessments, decisions and outcomes — and, if you are a verified physiotherapist, submit your own cases through a secure, consent-first workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/clinical-registry" className="nx-btn nx-btn-primary">
              Explore Registry <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/clinical-registry/therapist" className="nx-btn nx-btn-ghost">Therapist portal</a>
          </div>
        </div>
      </section>

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
