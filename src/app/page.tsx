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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { createPublicClient } from "@/lib/supabase/public";
import { knowledgeArticles } from "@/lib/knowledge-content";
import { atlasPublished } from "@/lib/clinical-visual-atlas";
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
              <div className="dc-flagship-stats" aria-label="Daily challenge format">
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
                <a href="/daily-challenge#play-daily" className="dc-flagship-play">
                  <span className="dc-flagship-play-icon">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                  Take Today's Challenge
                  <ArrowRight className="h-4 w-4 dc-flagship-end-arrow" aria-hidden="true" />
                </a>
                <a href="/daily-challenge#hall-of-fame" className="dc-flagship-hall">
                  <Medal className="h-4 w-4" /> Hall of Fame <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <DailyChallengeCountdown />
            </div>
            <div className="dc-flagship-ranking">
              <div className="dc-flagship-ranking-heading">
                <span className="dc-flagship-ranking-live">
                  <span /> TODAY'S LEADERBOARD
                </span>
                <span className="dc-flagship-ranking-subtitle">Open to every learner</span>
              </div>
              <DailyLeaderboard compact title="Today's Top 5" />
              <a href="/daily-challenge#full-leaderboard" className="dc-flagship-ranking-more">
                Explore all scores, monthly leaders and yearly champions <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="dc-flagship-bottom">
            <span>
              <Trophy className="h-4 w-4" aria-hidden="true" /> A new mission at midnight Pakistan time
            </span>
            <span>Public scores · Monthly & yearly rankings · Clinical explanations</span>
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
              <a href="/verify" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                Verify PNA Certificate →
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
