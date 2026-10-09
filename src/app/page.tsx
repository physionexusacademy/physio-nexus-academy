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

export const metadata: Metadata = {
  title: { absolute: "Physio Nexus Academy | Physiotherapy Learning & Patient Care Pakistan" },
  description:
    "Physio Nexus Academy offers a daily physiotherapy clinical challenge, real-time leaderboards, practical learning, workshops, resources and patient care in Pakistan.",
  alternates: {
    canonical: "https://physionexusacademy.com",
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

const portalActions = [
  {
    title: "Knowledge Hub",
    description: "Study MSK, Neuro, Cardio, Pediatrics, Sports and more by specialty and level.",
    href: "/knowledge-hub",
    icon: LibraryBig,
    tone: "from-cyan-500 to-teal-600",
    soft: "bg-cyan-50 border-cyan-100",
  },
  ...(atlasPublished
    ? [
        {
          title: "Clinical Visual Atlas",
          description:
            "Explore premium 3D anatomy, pathology, clinical tests and rehabilitation visuals.",
          href: "/clinical-visual-atlas",
          icon: Eye,
          tone: "from-sky-500 to-cyan-600",
          soft: "bg-sky-50 border-sky-100",
        },
      ]
    : []),
  {
    title: "Clinical Challenge Arena",
    description: "Take a history, choose differentials, diagnose and plan treatment — with friendly clinical roasts.",
    href: "/clinical-arena",
    icon: BrainCircuit,
    tone: "from-teal-500 to-cyan-600",
    soft: "bg-teal-50 border-teal-100",
  },
  {
    title: "Clinical Case Lab",
    description: "Work through symptoms, differential diagnosis, reasoning and treatment planning.",
    href: "/case-lab",
    icon: BrainCircuit,
    tone: "from-violet-500 to-indigo-600",
    soft: "bg-violet-50 border-violet-100",
  },
  {
    title: "Manual Therapy Mastery",
    description: "Master major manual-therapy approaches with science, procedure, dosage, safety and clinical reasoning.",
    href: "/manual-therapy",
    icon: Hand,
    tone: "from-indigo-500 to-violet-600",
    soft: "bg-indigo-50 border-indigo-100",
  },
  {
    title: "Treatment Plans",
    description: "Study condition-based physiotherapy plans from assessment and red flags to exercise progression.",
    href: "/treatment-plans",
    icon: ClipboardList,
    tone: "from-teal-500 to-emerald-600",
    soft: "bg-teal-50 border-teal-100",
  },
  {
    title: "Daily Clinical Challenge",
    description: "Five questions every day, live scores, and monthly and yearly champion leaderboards.",
    href: "/daily-challenge",
    icon: Trophy,
    tone: "from-teal-600 to-emerald-700",
    soft: "bg-teal-50 border-teal-100",
  },
  {
    title: "Weekly Clinical Quiz",
    description: "Timed clinical questions with a weekly leaderboard and top scorers.",
    href: "/clinical-quiz",
    icon: Trophy,
    tone: "from-amber-500 to-orange-500",
    soft: "bg-amber-50 border-amber-100",
  },
  {
    title: "Workshops & CPD",
    description: "Find hands-on workshops, practical training and CPD learning opportunities.",
    href: "/workshops",
    icon: CalendarDays,
    tone: "from-orange-500 to-rose-500",
    soft: "bg-orange-50 border-orange-100",
  },
  {
    title: "Books & Resources",
    description: "Open practical physiotherapy learning material, books, PDFs and study resources.",
    href: "/resources",
    icon: BookOpen,
    tone: "from-emerald-500 to-teal-600",
    soft: "bg-emerald-50 border-emerald-100",
  },
  {
    title: "Research Support",
    description: "Research methods, evidence summaries and academic learning support.",
    href: "/research",
    icon: FlaskConical,
    tone: "from-fuchsia-500 to-violet-600",
    soft: "bg-fuchsia-50 border-fuchsia-100",
  },
  {
    title: "MSK Symptom Checker",
    description: "Answer simple questions to screen possible musculoskeletal patterns and safety warnings.",
    href: "/symptom-checker",
    icon: Stethoscope,
    tone: "from-teal-500 to-cyan-600",
    soft: "bg-teal-50 border-teal-100",
  },
  {
    title: "Patient Care",
    description: "Book physiotherapy, request a home visit or explore patient services.",
    href: "/patient-services",
    icon: HeartPulse,
    tone: "from-rose-500 to-pink-600",
    soft: "bg-rose-50 border-rose-100",
  },
  {
    title: "Verify Certificate",
    description: "Check a PNA certificate quickly using its verification ID.",
    href: "/verify",
    icon: FileBadge2,
    tone: "from-indigo-500 to-sky-600",
    soft: "bg-indigo-50 border-indigo-100",
  },
] as const;

/** Editorial groups preserve every portal destination while removing the equal-weight card wall. */
const portalGroups = [
  {
    id: "learn",
    number: "01",
    kicker: "Understand deeply",
    title: "Knowledge & clinical science",
    description: "Move from clear foundations to hands-on clinical application.",
    headline: "Study the science. See the connection.",
    hrefs: ["/knowledge-hub", "/clinical-visual-atlas", "/manual-therapy", "/treatment-plans", "/resources"],
    extras: [] as { href: string; title: string; description: string }[],
  },
  {
    id: "practice",
    number: "02",
    kicker: "Put thinking to work",
    title: "Clinical reasoning & challenges",
    description: "Explore realistic cases, test decisions and compete with fellow learners.",
    headline: "Go beyond memorizing answers.",
    hrefs: ["/case-lab", "/clinical-arena", "/clinical-quiz", "/daily-challenge"],
    extras: [] as { href: string; title: string; description: string }[],
  },
  {
    id: "professional",
    number: "03",
    kicker: "Grow with purpose",
    title: "Workshops & professional growth",
    description: "Develop practical confidence with learning, research and people.",
    headline: "Learning that travels into practice.",
    hrefs: ["/workshops", "/research"],
    extras: [
      { href: "/training", title: "Training archive", description: "Revisit professional learning" },
      { href: "/faculty", title: "Meet PNA faculty", description: "Learn from clinical educators" },
    ],
  },
  {
    id: "care",
    number: "04",
    kicker: "For patients & visitors",
    title: "Care & trusted services",
    description: "From useful symptom guidance to appointments and verified learning.",
    headline: "Clear next steps. Human-centered care.",
    hrefs: ["/symptom-checker", "/patient-services", "/verify"],
    extras: [
      { href: "/appointment", title: "Book an appointment", description: "Request a consultation" },
      { href: "/home-visit", title: "Request a home visit", description: "Physiotherapy where supported" },
    ],
  },
];

export default async function HomePage() {
  const supabase = createPublicClient();

  const [
    { data: workshopRows },
    { data: testimonialRows },
  ] = await Promise.all([
    supabase
      .from("workshops")
      .select("id,slug,title,summary,city,start_date")
      .eq("status", "published")
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
      {/* Flagship destination: open to every PNA visitor, not nested under the MSK Hub. */}
      <section data-pna-home-flagship="daily-clinical-challenge-v2" className="dc-flagship-shell" aria-labelledby="pna-daily-flagship-title">
        <div className="container-content dc-flagship-container">
          <div className="dc-flagship-stage">
            <div className="dc-flagship-copy">
              <div className="dc-flagship-eyebrow"><Flame className="h-4 w-4" aria-hidden="true"/> PNA'S DAILY FEATURED EXPERIENCE <span className="dc-flagship-eyebrow-dot"/></div>
              <div className="dc-flagship-category"><Sparkles className="h-4 w-4" aria-hidden="true"/> LEARN · COMPETE · LEAD</div>
              <h1 id="pna-daily-flagship-title" className="dc-flagship-heading">
                Five questions.<br/>
                One big <span>challenge.</span>
              </h1>
              <p className="dc-flagship-description">
                Meet the <strong>PNA Daily Clinical Challenge</strong> — a fresh physiotherapy
                knowledge mission every day. Test your clinical thinking, earn points,
                and climb the public leaderboard with learners across PNA.
              </p>
              <div className="dc-flagship-stats" aria-label="Daily challenge format">
                <div className="dc-flagship-stat"><span className="dc-flagship-stat-icon"><Sparkles className="h-4 w-4"/></span><div><strong>05</strong><span>questions daily</span></div></div>
                <div className="dc-flagship-stat"><span className="dc-flagship-stat-icon"><Timer className="h-4 w-4"/></span><div><strong>30s</strong><span>per question</span></div></div>
                <div className="dc-flagship-stat"><span className="dc-flagship-stat-icon"><Trophy className="h-4 w-4"/></span><div><strong>100</strong><span>maximum points</span></div></div>
              </div>
              <div className="dc-flagship-actions">
                <a href="/daily-challenge#play-daily" className="dc-flagship-play">
                  <span className="dc-flagship-play-icon"><ArrowRight className="h-5 w-5"/></span>
                  PLAY TODAY'S CHALLENGE
                  <ArrowRight className="h-4 w-4 dc-flagship-end-arrow" aria-hidden="true"/>
                </a>
                <a href="/daily-challenge#hall-of-fame" className="dc-flagship-hall">
                  <Medal className="h-4 w-4"/> Hall of Fame <ArrowRight className="h-4 w-4"/>
                </a>
              </div>
              <DailyChallengeCountdown/>
            </div>
            <div className="dc-flagship-ranking">
              <div className="dc-flagship-ranking-heading">
                <span className="dc-flagship-ranking-live"><span/> LIVE CHAMPIONS BOARD</span>
                <span className="dc-flagship-ranking-subtitle">The competition is open to everyone</span>
              </div>
              <DailyLeaderboard compact title="Today's Top 5"/>
              <a href="/daily-challenge#full-leaderboard" className="dc-flagship-ranking-more">
                Explore all scores, monthly leaders and yearly champions <ArrowRight className="h-4 w-4"/>
              </a>
            </div>
          </div>
          <div className="dc-flagship-bottom">
            <span><Trophy className="h-4 w-4" aria-hidden="true"/> A new mission at midnight Pakistan time</span>
            <span>Public scores · Monthly & yearly rankings · Clinical explanations</span>
          </div>
        </div>
      </section>

      <section className="pna-home-intro" aria-label="Meet Physio Nexus Academy">
        <div className="container-content pna-home-intro-inner">
          <div className="pna-home-intro-copy">
            <p className="pna-home-kicker"><span className="pna-home-signal"/> THE ACADEMY BEHIND THE EXPERIENCE</p>
            <h2>Built for curious minds. <span>Made for real clinical life.</span></h2>
            <p>
              Physio Nexus Academy connects clinical knowledge, applied skills, research,
              professional training and patient care in one thoughtful learning experience.
              Students, clinicians and patients each have a place here.
            </p>
            <div className="pna-home-intro-actions">
              <a href="#explore-pna" className="pna-home-intro-primary">
                Discover the platform <ArrowRight className="h-4 w-4" aria-hidden="true"/>
              </a>
              <a href="/about" className="pna-home-intro-secondary">Our story <ArrowRight className="h-4 w-4" aria-hidden="true"/></a>
            </div>
            <div className="pna-home-audiences" aria-label="Who PNA serves">
              <a href="#pna-zone-learn">For students</a>
              <span aria-hidden="true">·</span>
              <a href="#pna-zone-professional">For professionals</a>
              <span aria-hidden="true">·</span>
              <a href="#pna-zone-care">For patients</a>
            </div>
          </div>
          <a href="/founder" className="pna-home-founder-card">
            <Image
              src={siteConfig.founder.photo}
              alt={siteConfig.founder.name + ", founder of Physio Nexus Academy"}
              width={148}
              height={174}
              sizes="(max-width: 640px) 96px, 148px"
              className="pna-home-founder-photo"
            />
            <div className="pna-home-founder-copy">
              <span className="pna-home-founder-overline">FOUNDER · MAIN INSTRUCTOR</span>
              <strong>{siteConfig.founder.name}</strong>
              <span>{siteConfig.founder.credentialsShort}</span>
              <span className="pna-home-founder-link">Meet the founder <ArrowRight className="h-4 w-4" aria-hidden="true"/></span>
            </div>
          </a>
        </div>
      </section>

      <section id="explore-pna" data-pna-home-premium="cohesive-v1" className="pna-home-explore" aria-labelledby="pna-home-explore-title">
        <div className="container-content">
          <div className="pna-home-section-heading">
            <div>
              <p className="pna-home-kicker"><span className="pna-home-signal"/> ONE PLATFORM · FOUR CLEAR PATHWAYS</p>
              <h2 id="pna-home-explore-title">Discover everything PNA can do.</h2>
              <p>Explore by purpose, not by a crowded list. Every original feature is still here.</p>
            </div>
            <a href="/knowledge-hub" className="pna-home-heading-action">Start with Knowledge Hub <ArrowRight className="h-4 w-4" aria-hidden="true"/></a>
          </div>

          <div className="pna-home-zones">
            {portalGroups.map((group) => {
              const groupActions = portalActions.filter((action) => group.hrefs.includes(action.href));
              const ZoneIcon = group.id === "learn" ? BookOpen : group.id === "practice" ? BrainCircuit : group.id === "professional" ? CalendarDays : HeartPulse;
              return (
                <section key={group.id} id={"pna-zone-" + group.id} className={"pna-home-zone pna-home-zone-" + group.id} aria-labelledby={"pna-zone-heading-" + group.id}>
                  <div className="pna-home-zone-top">
                    <span className="pna-home-zone-number">{group.number}</span>
                    <div className="pna-home-zone-top-copy">
                      <span className="pna-home-zone-kicker">{group.kicker}</span>
                      <h3 id={"pna-zone-heading-" + group.id}>{group.title}</h3>
                    </div>
                    <span className="pna-home-zone-icon"><ZoneIcon className="h-6 w-6" aria-hidden="true"/></span>
                  </div>
                  <p className="pna-home-zone-lead">{group.headline}</p>
                  <p className="pna-home-zone-description">{group.description}</p>
                  <div className="pna-home-zone-links">
                    {groupActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <a key={action.href} className="pna-home-zone-link" href={action.href}>
                          <span className="pna-home-zone-link-icon"><Icon className="h-5 w-5" aria-hidden="true"/></span>
                          <span className="pna-home-zone-link-content">
                            <strong>{action.title}</strong>
                            <span>{action.description}</span>
                          </span>
                          <ArrowRight className="pna-home-zone-arrow h-4 w-4" aria-hidden="true"/>
                        </a>
                      );
                    })}
                    {group.extras.map((action) => (
                      <a key={action.href} className="pna-home-zone-link pna-home-zone-extra" href={action.href}>
                        <span className="pna-home-zone-link-icon"><ArrowRight className="h-4 w-4" aria-hidden="true"/></span>
                        <span className="pna-home-zone-link-content">
                          <strong>{action.title}</strong>
                          <span>{action.description}</span>
                        </span>
                        <ArrowRight className="pna-home-zone-arrow h-4 w-4" aria-hidden="true"/>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="pna-home-journey">
            <span className="pna-home-kicker">A CONNECTED WAY TO LEARN</span>
            <div className="pna-home-journey-steps">
              <a href="/knowledge-hub"><BookOpen className="h-4 w-4" aria-hidden="true"/> Understand the topic</a>
              <ArrowRight className="h-4 w-4" aria-hidden="true"/>
              <a href="/case-lab"><ClipboardList className="h-4 w-4" aria-hidden="true"/> See the clinical case</a>
              <ArrowRight className="h-4 w-4" aria-hidden="true"/>
              <a href="/clinical-arena"><BrainCircuit className="h-4 w-4" aria-hidden="true"/> Challenge your reasoning</a>
            </div>
          </div>
        </div>
      </section>

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
                The CPD Group · Provider #791052
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


      <section className="section-padding bg-white pna-home-feature-section">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
                Meet the Team
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Our Faculty</h2>
              <p className="mt-3 max-w-2xl text-navy-500">
                Meet the professionals supporting practical learning, workshops,
                clinical education and rehabilitation training at PNA.
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
                    <h3 className="text-lg font-bold text-navy-800">{member.name}</h3>
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

      <section className="section-padding pna-home-feature-section">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
                Hands-on Learning
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Upcoming Workshops</h2>
            </div>
            <a
              href="/workshops"
              className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              View all workshops <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {featuredWorkshops ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredWorkshops.map((workshop) => (
                <a
                  key={workshop.id}
                  href={"/workshops/" + workshop.slug}
                  className="pna-home-section-card rounded-2xl border border-grey-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CalendarDays className="h-6 w-6 text-teal-500" />
                  <h3 className="mt-3 text-lg font-semibold text-navy-800">{workshop.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-500">{workshop.summary}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-navy-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {workshop.city || "City TBA"} ·{" "}
                    {workshop.start_date
                      ? new Date(workshop.start_date).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date TBA"}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-6 text-center">
              <p className="font-semibold text-navy-700">New workshop dates are being prepared.</p>
              <a href="/workshops" className="mt-2 inline-flex text-sm font-semibold text-teal-600">
                Explore workshop archive →
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding pna-home-feature-section pna-home-learning-notes">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
                Learn This Week
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                Clinical learning without the clutter
              </h2>
            </div>
            <a
              href="/knowledge-hub"
              className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Open Knowledge Hub <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {latestArticles.map((article) => (
              <a
                key={article.slug}
                href={"/knowledge-hub/" + article.slug}
                className="pna-home-section-card rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  {article.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-navy-800">{article.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-500">{article.excerpt}</p>
                <p className="mt-4 text-xs font-semibold text-navy-400">{article.readTime}</p>
              </a>
            ))}
          </div>

        </div>
      </section>

      <section className="section-padding pna-home-feature-section">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
                Practical Library
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Books & Resources</h2>
            </div>
            <a
              href="/resources#order-book"
              className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Buy book <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <a
            href="/resources#order-book"
            className="group mt-8 flex flex-col gap-4 rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 flex-shrink-0 text-teal-500" />
              <div>
                <p className="font-semibold text-navy-800">Clinical Myofascial Therapy</p>
                <p className="mt-1 text-sm text-navy-500">
                  Illustrated Clinical Edition · PKR 2,000 · Expected delivery 3–4 days
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-600">
              Order now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </section>

      <section className="section-padding pna-home-light-patient">
        <div className="container-content">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
                Patient Care
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Need physiotherapy support?
              </h2>
              <p className="pna-home-patient-note mt-3 max-w-xl">
                Check your symptoms first, then book a consultation or request a home visit. Our team confirms availability before care is scheduled.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <a
                href="/symptom-checker"
                className="rounded-2xl border p-5 transition"
              >
                <Stethoscope className="h-6 w-6 text-teal-300" />
                <p className="mt-3 font-semibold text-white">Check Symptoms</p>
                <p className="mt-1 text-sm text-grey-200">Screen possible MSK patterns before booking.</p>
              </a>
              <a
                href="/appointment"
                className="rounded-2xl border p-5 transition"
              >
                <Stethoscope className="h-6 w-6 text-teal-300" />
                <p className="mt-3 font-semibold text-white">Book Appointment</p>
                <p className="mt-1 text-sm text-grey-200">In-person or online consultation request.</p>
              </a>
              <a
                href="/home-visit"
                className="rounded-2xl border p-5 transition"
              >
                <Home className="h-6 w-6 text-teal-300" />
                <p className="mt-3 font-semibold text-white">Request Home Visit</p>
                <p className="mt-1 text-sm text-grey-200">Home physiotherapy in supported service areas.</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {testimonials ? (
        <section className="section-padding bg-grey-50">
          <div className="container-content">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold sm:text-3xl">What People Say</h2>
              <Button href="/reviews" variant="outline">Share Feedback</Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <Quote className="h-6 w-6 text-teal-300" />
                  <p className="mt-3 text-sm italic leading-6 text-navy-500">
                    {testimonial.content}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-navy-700">
                    — {testimonial.name}{testimonial.role ? ", " + testimonial.role : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      </div>
    </>
  );
}
