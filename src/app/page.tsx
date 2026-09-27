import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  GraduationCap,
  HeartPulse,
  Home,
  MapPin,
  Quote,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";
import { knowledgeArticles } from "@/lib/knowledge-content";

export const metadata: Metadata = {
  title: { absolute: "Physio Nexus Academy | Physiotherapy Learning & Patient Care Pakistan" },
  description:
    "Physio Nexus Academy offers practical physiotherapy learning, clinical workshops, resources, weekly quizzes, patient appointments and home visits in Pakistan.",
  alternates: {
    canonical: "https://physionexusacademy.com",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const audiencePaths = [
  {
    title: "I am a Student",
    description: "Build clinical understanding with articles, quizzes, courses and practical resources.",
    icon: GraduationCap,
    links: [
      { label: "Knowledge Hub", href: "/knowledge-hub" },
      { label: "Weekly Quiz", href: "/clinical-quiz" },
      { label: "Courses", href: "/courses" },
    ],
  },
  {
    title: "I am a Physiotherapist",
    description: "Find workshops, advanced clinical learning, research support and professional resources.",
    icon: Stethoscope,
    links: [
      { label: "Workshops", href: "/workshops" },
      { label: "Research Support", href: "/research" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "I need Physiotherapy",
    description: "Choose the right patient pathway without searching through the rest of the site.",
    icon: HeartPulse,
    links: [
      { label: "Book Appointment", href: "/appointment" },
      { label: "Request Home Visit", href: "/home-visit" },
      { label: "Patient Services", href: "/patient-services" },
    ],
  },
] as const;

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: workshopRows },
    { data: resourceRows },
    { data: testimonialRows },
  ] = await Promise.all([
    supabase
      .from("workshops")
      .select("*")
      .eq("status", "published")
      .order("start_date", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("resources")
      .select("*")
      .eq("visibility", "Public")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("testimonials")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(3),
  ]);

  const featuredWorkshops = workshopRows?.length ? workshopRows : null;
  const featuredResources = resourceRows?.length ? resourceRows : null;
  const testimonials = testimonialRows?.length ? testimonialRows : null;
  const latestArticles = knowledgeArticles.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-800 text-white">
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
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-grey-300">
              <Link href="/clinical-quiz" className="hover:text-white">Weekly Clinical Quiz →</Link>
              <Link href="/resources" className="hover:text-white">Books & Resources →</Link>
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

      <section className="section-padding bg-grey-50">
        <div className="container-content">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
              Start Here
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              What brings you to PNA today?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-navy-500">
              Choose your path and go directly to the part of the website that matters to you.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {audiencePaths.map((path) => {
              const Icon = path.icon;
              return (
                <div
                  key={path.title}
                  className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-navy-800">{path.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-navy-500">{path.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {path.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-full border border-grey-200 px-3 py-2 text-xs font-semibold text-navy-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
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

      <section className="section-padding bg-grey-50">
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
              href="/resources"
              className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Browse library <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredResources ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {featuredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-start gap-3 rounded-2xl border border-grey-200 p-5"
                >
                  <BookOpen className="h-6 w-6 flex-shrink-0 text-teal-500" />
                  <div>
                    <p className="font-medium text-navy-800">{resource.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-navy-400">
                      {resource.access_type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-grey-200 bg-grey-50 p-6 text-center text-navy-500">
              Resource library is being expanded. Explore the current collection for available material.
            </p>
          )}
        </div>
      </section>

      <section className="section-padding bg-navy-800 text-white">
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
