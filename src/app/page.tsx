import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
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
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { createPublicClient } from "@/lib/supabase/public";
import { knowledgeArticles } from "@/lib/knowledge-content";
import { atlasPublished } from "@/lib/clinical-visual-atlas";

export const metadata: Metadata = {
  title: { absolute: "Physio Nexus Academy | Physiotherapy Learning & Patient Care Pakistan" },
  description:
    "Physio Nexus Academy offers practical physiotherapy learning, clinical workshops, resources, weekly quizzes, patient appointments and home visits in Pakistan.",
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
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-teal-800 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="container-content grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
              Physiotherapy Education · Workshops · Patient Care
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              Learn better. Practice confidently. Find the care you need.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-grey-200 sm:text-lg">
              Physio Nexus Academy brings practical physiotherapy learning, clinical workshops
              and patient services together in one clear place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/knowledge-hub" size="lg">Start Learning</Button>
              <Button
                href="/workshops"
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                View Workshops
              </Button>
              <Button
                href="/appointment"
                variant="secondary"
                size="lg"
                className="bg-white text-navy-800 hover:bg-grey-100"
              >
                Book Physiotherapy
              </Button>
              <Button
                href="/resources#order-book"
                variant="secondary"
                size="lg"
                className="bg-amber-300 text-navy-900 hover:bg-amber-200"
              >
                <BookOpen className="h-4 w-4" />
                Order Book
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-grey-300">
              <Link href="/case-lab" className="hover:text-white">Clinical Case Lab →</Link>
              <Link href="/clinical-quiz" className="hover:text-white">Weekly Clinical Quiz →</Link>
              <Link href="/verify" className="hover:text-white">Verify Certificate →</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image
                src={siteConfig.founder.photo}
                alt={siteConfig.founder.name + ", Founder of Physio Nexus Academy"}
                width={480}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-5 left-1/2 w-[92%] -translate-x-1/2 rounded-xl bg-white p-4 text-center shadow-lg">
              <p className="font-heading text-sm font-semibold text-navy-800">
                {siteConfig.founder.name}
              </p>
              <p className="mt-1 text-xs text-navy-500">
                Founder & Main Instructor · {siteConfig.founder.credentialsShort}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-grey-50 via-white to-cyan-50/40">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
                PNA Portal
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                What do you want to do today?
              </h2>
              <p className="mt-3 max-w-2xl text-navy-500">
                Every major part of the academy has its own clear entry point.
              </p>
            </div>
            <Link
              href="/about"
              className="text-sm font-semibold text-navy-500 hover:text-teal-700"
            >
              About PNA →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {portalActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={"group relative overflow-hidden rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-xl " + action.soft}
                >
                  <div className={"absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-20 blur-2xl " + action.tone} />
                  <div className="relative">
                    <span className={"flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md " + action.tone}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-navy-800">{action.title}</h3>
                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-navy-600">
                      {action.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-navy-700">
                      Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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
            <Link href="/verify" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
              Verify PNA Certificate →
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
                Hands-on Learning
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Upcoming Workshops</h2>
            </div>
            <Link
              href="/workshops"
              className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              View all workshops <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredWorkshops ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredWorkshops.map((workshop) => (
                <Link
                  key={workshop.id}
                  href={"/workshops/" + workshop.slug}
                  className="rounded-2xl border border-grey-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
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
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-6 text-center">
              <p className="font-semibold text-navy-700">New workshop dates are being prepared.</p>
              <Link href="/workshops" className="mt-2 inline-flex text-sm font-semibold text-teal-600">
                Explore workshop archive →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-violet-50/60 via-white to-cyan-50/50">
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
            <Link
              href="/knowledge-hub"
              className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Open Knowledge Hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.slug}
                href={"/knowledge-hub/" + article.slug}
                className="rounded-2xl border border-grey-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  {article.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-navy-800">{article.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-500">{article.excerpt}</p>
                <p className="mt-4 text-xs font-semibold text-navy-400">{article.readTime}</p>
              </Link>
            ))}
          </div>

          <Link
            href="/clinical-quiz"
            className="mt-6 flex flex-col gap-4 rounded-2xl bg-navy-800 p-6 text-white transition hover:bg-navy-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <Brain className="mt-0.5 h-7 w-7 flex-shrink-0 text-teal-300" />
              <div>
                <p className="font-semibold text-white">Weekly Clinical Challenge</p>
                <p className="mt-1 text-sm text-grey-200">
                  5 questions · 30 seconds per question · one Gmail attempt · weekly top scorers
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-200">
              Take the quiz <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
                Practical Library
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Books & Resources</h2>
            </div>
            <Link
              href="/resources#order-book"
              className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Buy book <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Link
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
          </Link>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-emerald-800 via-teal-800 to-navy-800 text-white">
        <div className="container-content">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">
                Patient Care
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Need physiotherapy support?
              </h2>
              <p className="mt-3 max-w-xl text-grey-200">
                Choose a consultation or request a home visit. Our team confirms availability before care is scheduled.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/appointment"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-300 hover:bg-white/10"
              >
                <Stethoscope className="h-6 w-6 text-teal-300" />
                <p className="mt-3 font-semibold text-white">Book Appointment</p>
                <p className="mt-1 text-sm text-grey-200">In-person or online consultation request.</p>
              </Link>
              <Link
                href="/home-visit"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-300 hover:bg-white/10"
              >
                <Home className="h-6 w-6 text-teal-300" />
                <p className="mt-3 font-semibold text-white">Request Home Visit</p>
                <p className="mt-1 text-sm text-grey-200">Home physiotherapy in supported service areas.</p>
              </Link>
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

    </>
  );
}
