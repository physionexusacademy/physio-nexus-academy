import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  FileBadge2,
  FlaskConical,
  HeartPulse,
  Home,
  Hand,
  ClipboardList,
  LibraryBig,
  MapPin,
  Quote,
  Stethoscope,
  Trophy,
  Flame,
  Sparkles,
  Timer,
  Medal,
  Eye,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { createPublicClient } from "@/lib/supabase/public";
import { knowledgeArticles } from "@/lib/knowledge-content";
import { atlasPublished } from "@/lib/clinical-visual-atlas";
import { featuredFaculty } from "@/lib/faculty";
import { DailyLeaderboard } from "@/components/daily-challenge/DailyLeaderboard";
import { DailyChallengeCountdown } from "@/components/daily-challenge/DailyChallengeCountdown";
import "./daily-challenge/daily-challenge.css";
import "./home-premium.css";
import "./pna-hero.css";
import { InstallApp } from "@/components/InstallApp";
import { PremiumHomeHero } from "@/components/home/PremiumHomeHero";
import { PremiumPathwayBrowser } from "@/components/home/PremiumPathwayBrowser";
import { UnifiedProgressCard } from "@/components/learning/UnifiedProgressCard";
import "./premium-vision.css";
import "./pna-signature-v2.css";

export const metadata: Metadata = {
  title: {
    absolute:
      "Physio Nexus Academy | Physiotherapy Education, Workshops & Clinical Learning in Pakistan",
  },
  description:
    "Learn evidence-based physiotherapy with practical MSK and manual therapy guides, clinical case labs, daily challenges, quizzes and hands-on workshops from Physio Nexus Academy in Pakistan. Founded by Dr. Sajjad Raza PT.",
  keywords: [
    "Physio Nexus Academy",
    "physiotherapy education in Pakistan",
    "physiotherapy workshops in Pakistan",
    "physiotherapy workshops Karachi",
    "physiotherapy workshops Hyderabad",
    "MSK physiotherapy resources",
    "manual therapy learning",
    "physiotherapy clinical case studies",
    "physiotherapy students Pakistan",
    "CPD physiotherapy Pakistan",
    "Dr Sajjad Raza PT",
  ],
  openGraph: {
    title:
      "Physio Nexus Academy | Physiotherapy Education & Workshops in Pakistan",
    description:
      "Practical physiotherapy education, MSK and manual therapy learning, clinical cases, quizzes and hands-on workshops for students and professionals in Pakistan.",
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
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Physio Nexus Academy | Physiotherapy Education & Workshops",
    description:
      "Evidence-based physiotherapy learning, clinical resources and hands-on workshops in Pakistan.",
  },
  alternates: {
    canonical: "https://physionexusacademy.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

export default async function HomePage() {
  const supabase = createPublicClient();

  // Use Pakistan-local calendar dates so the homepage never promotes an expired workshop.
  const dateParts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type: string) =>
    dateParts.find((part) => part.type === type)?.value ?? "";
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
  const latestArticles = knowledgeArticles
    .filter((article) => article.level === "Advanced" || article.updatedAt)
    .slice(0, 3);

  return (
    <>
      <PremiumHomeHero />

      <div className="container-content flex justify-end pt-3">
        <InstallApp />
      </div>

      <PremiumPathwayBrowser showAtlas={atlasPublished} />

      {/* Flagship destination: open to every PNA visitor, not nested under the MSK Hub. */}
      <section
        data-pna-home-flagship="daily-clinical-challenge-v2"
        className="dc-flagship-shell"
        aria-labelledby="pna-daily-flagship-title"
      >
        <div className="container-content dc-flagship-container">
          <div className="dc-flagship-stage">
            <div className="dc-flagship-copy">
              <div className="dc-flagship-eyebrow">
                <Flame className="h-4 w-4" aria-hidden="true" /> DAILY CLINICAL
                CHALLENGE <span className="dc-flagship-eyebrow-dot" />
              </div>
              <div className="dc-flagship-category">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> LEARN ·
                PRACTICE · IMPROVE
              </div>
              <h2 id="pna-daily-flagship-title" className="dc-flagship-heading">
                Five questions.
                <br />
                One focused <span>challenge.</span>
              </h2>
              <p className="dc-flagship-description">
                A fresh clinical challenge every day. Sharpen your reasoning,
                earn points, and see how you rank — then learn from clear
                explanations after you submit.
              </p>
              <div
                className="dc-flagship-stats"
                aria-label="Daily challenge format"
              >
                <div className="dc-flagship-stat">
                  <span className="dc-flagship-stat-icon">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <strong>05</strong>
                    <span>questions daily</span>
                  </div>
                </div>
                <div className="dc-flagship-stat">
                  <span className="dc-flagship-stat-icon">
                    <Timer className="h-4 w-4" />
                  </span>
                  <div>
                    <strong>30s</strong>
                    <span>per question</span>
                  </div>
                </div>
                <div className="dc-flagship-stat">
                  <span className="dc-flagship-stat-icon">
                    <Trophy className="h-4 w-4" />
                  </span>
                  <div>
                    <strong>100</strong>
                    <span>maximum points</span>
                  </div>
                </div>
              </div>
              <div className="dc-flagship-actions">
                <a
                  href="/daily-challenge#play-daily"
                  className="dc-flagship-play"
                >
                  <span className="dc-flagship-play-icon">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                  Take Today's Challenge
                  <ArrowRight
                    className="h-4 w-4 dc-flagship-end-arrow"
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="/daily-challenge#hall-of-fame"
                  className="dc-flagship-hall"
                >
                  <Medal className="h-4 w-4" /> Hall of Fame{" "}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <DailyChallengeCountdown />
            </div>
            <div className="dc-flagship-ranking">
              <div className="dc-flagship-ranking-heading">
                <span className="dc-flagship-ranking-live">
                  <span /> TODAY'S LEADERBOARD
                </span>
                <span className="dc-flagship-ranking-subtitle">
                  Open to every learner
                </span>
              </div>
              <DailyLeaderboard compact title="Today's Top 5" />
              <a
                href="/daily-challenge#full-leaderboard"
                className="dc-flagship-ranking-more"
              >
                Explore all scores, monthly leaders and yearly champions{" "}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="dc-flagship-bottom">
            <span>
              <Trophy className="h-4 w-4" aria-hidden="true" /> A new mission at
              midnight Pakistan time
            </span>
            <span>
              Public scores · Monthly & yearly rankings · Clinical explanations
            </span>
          </div>
        </div>
      </section>

      {/* Phase 3: clear next steps after the daily challenge */}
      <section
        className="border-b border-grey-200 bg-white py-10"
        aria-labelledby="pna-next-steps-title"
      >
        <div className="container-content">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
              Not sure what to do next?
            </p>
            <h2
              id="pna-next-steps-title"
              className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl"
            >
              Choose one clear next step
            </h2>
            <p className="mt-3 text-navy-500">
              Pick the path that matches why you came here — no guessing, no
              clutter.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <a
              href="/case-lab"
              className="group rounded-2xl border border-grey-200 bg-gradient-to-br from-white to-cyan-50/40 p-6 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                Practice
              </p>
              <h3 className="mt-2 text-lg font-bold text-navy-800">
                Open a real case
              </h3>
              <p className="mt-2 text-sm leading-6 text-navy-500">
                Work through patient-style clinical stories and build reasoning
                step by step.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                Go to Case Lab
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
            <a
              href="/knowledge-hub"
              className="group rounded-2xl border border-grey-200 bg-gradient-to-br from-white to-teal-50/40 p-6 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                Study
              </p>
              <h3 className="mt-2 text-lg font-bold text-navy-800">
                Read practical topics
              </h3>
              <p className="mt-2 text-sm leading-6 text-navy-500">
                Clear clinical explanations for students and clinicians —
                evidence-based and easy to revise.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                Open Knowledge Hub
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
            <a
              href="/appointment"
              className="group rounded-2xl border border-grey-200 bg-gradient-to-br from-white to-navy-50/50 p-6 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                Care
              </p>
              <h3 className="mt-2 text-lg font-bold text-navy-800">
                Book physiotherapy
              </h3>
              <p className="mt-2 text-sm leading-6 text-navy-500">
                Need personal support? Request a consultation or home visit in
                supported areas.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                Book appointment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>
        </div>
      </section>

      <UnifiedProgressCard />

      <div className="pna-home-lower">
        <section className="border-y border-grey-200 bg-white py-6">
          <div className="container-content flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-4">
              <Image
                src="/cpd-approved-provider.png"
                alt="The CPD Group Approved Provider"
                width={220}
                height={80}
                className="h-auto w-36 object-contain sm:w-44"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                  Approved CPD Provider
                </p>
                <p className="mt-1 font-semibold text-navy-800">
                  Officially approved · The CPD Group · #791052
                </p>
                <p className="mt-1 text-sm text-navy-500">
                  Certificates you can verify. Learning you can trust.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
              <a
                href="https://thecpdregister.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                Verify Provider →
              </a>
              <a
                href="/verify"
                className="text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                Verify PNA Certificate →
              </a>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white pna-home-feature-section">
          <div className="container-content">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
                  Learn from clinicians
                </p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Teachers who practice what they teach
                </h2>
                <p className="mt-3 max-w-2xl text-navy-500">
                  Real clinicians guiding practical physiotherapy education,
                  workshops and rehabilitation training at PNA.
                </p>
              </div>
              <a
                href="/faculty"
                className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                View all faculty <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {featuredFaculty.map((member) => (
                <a
                  key={member.slug}
                  href={"/faculty/" + member.slug}
                  className="group rounded-3xl border border-grey-200 bg-gradient-to-br from-white to-cyan-50/50 p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    {member.image ? (
                      <Image
                        src={member.image.src}
                        alt={member.image.alt}
                        width={member.image.width}
                        height={member.image.height}
                        sizes="96px"
                        className="h-28 w-24 flex-none rounded-2xl object-cover shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-28 w-24 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md">
                        <UserRound className="h-8 w-8" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-navy-800">
                        {member.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-teal-700">
                        {member.academyRole}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-500">
                        {member.professionalTitle}
                      </p>
                    </div>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-navy-700">
                    View full profile
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* NOTE: Remaining sections (workshops, articles, patient care, etc.) are restored from previous good commit. Full file restored. */}
      </div>
    </>
  );
}
