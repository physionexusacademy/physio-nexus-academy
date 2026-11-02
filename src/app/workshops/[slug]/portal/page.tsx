import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  LogOut,
  MapPin,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  getWorkshopPortalPublicInfo,
  getWorkshopPortalSession,
} from "@/lib/workshop-portal";
import { logoutFromWorkshopPortal } from "./actions";
import { PortalLoginForm } from "./PortalLoginForm";
import { WorkshopAssessmentClient } from "./WorkshopAssessmentClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workshop Participant Portal | Physio Nexus Academy",
  description:
    "Secure participant portal for registered Physio Nexus Academy workshop attendees.",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value?: string | null) {
  if (!value) return "To be announced";

  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "TBA";

  const [hour = "0", minute = "00"] = value.split(":");
  const date = new Date(2000, 0, 1, Number(hour), Number(minute));

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function WorkshopParticipantPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const workshop = await getWorkshopPortalPublicInfo(slug);

  if (!workshop) notFound();

  const session = await getWorkshopPortalSession(slug);

  if (!session) {
    return (
      <div className="container-content section-padding">
        <Link
          href={`/workshops/${slug}`}
          className="text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          ← Back to workshop
        </Link>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-teal-50 p-3">
                <ShieldCheck className="h-7 w-7 text-teal-600" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
                  Registered Participants Only
                </p>
                <h1 className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">
                  Workshop Participant Portal
                </h1>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-grey-50 p-4">
              <p className="font-semibold text-navy-800">{workshop.title}</p>
              <p className="mt-1 text-sm text-navy-500">
                {formatDate(workshop.start_date)}
                {workshop.end_date && workshop.end_date !== workshop.start_date
                  ? ` – ${formatDate(workshop.end_date)}`
                  : ""}
                {workshop.city ? ` · ${workshop.city}` : ""}
              </p>
            </div>

            <PortalLoginForm
              slug={slug}
              error={
                query.error === "invalid-details"
                  ? "Registration ID and email do not match an active participant."
                  : query.error === "unavailable"
                    ? "This workshop portal is not available."
                    : query.error === "system"
                      ? "Unable to verify your registration right now. Please try again."
                      : null
              }
            />
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-grey-200 bg-grey-50 p-4 text-sm text-navy-500">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <p>
              The portal checks your Registration ID and registered email on the
              server. Participant details are not exposed publicly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { registration } = session;

  return (
    <div className="container-content section-padding">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
            Participant Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy-800">
            Welcome, {registration.full_name}
          </h1>
          <p className="mt-2 text-sm text-navy-500">
            Registration ID:{" "}
            <span className="font-mono font-semibold text-navy-700">
              {registration.reference_id}
            </span>
          </p>
        </div>

        <form action={logoutFromWorkshopPortal.bind(null, slug)}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-grey-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-600 hover:border-grey-300 hover:bg-grey-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-grey-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-teal-50 p-2.5">
              <CalendarDays className="h-5 w-5 text-teal-600" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-600">
                Your Workshop
              </p>
              <h2 className="text-xl font-bold text-navy-800">
                {workshop.title}
              </h2>
            </div>
          </div>

          {workshop.subtitle ? (
            <p className="mt-4 leading-7 text-navy-500">{workshop.subtitle}</p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-grey-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy-700">
                <CalendarDays className="h-4 w-4 text-teal-600" />
                Date
              </div>
              <p className="mt-2 text-sm text-navy-500">
                {formatDate(workshop.start_date)}
                {workshop.end_date && workshop.end_date !== workshop.start_date
                  ? ` – ${formatDate(workshop.end_date)}`
                  : ""}
              </p>
            </div>

            <div className="rounded-xl bg-grey-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy-700">
                <Clock3 className="h-4 w-4 text-teal-600" />
                Timing
              </div>
              <p className="mt-2 text-sm text-navy-500">
                {formatTime(workshop.start_time)} – {formatTime(workshop.end_time)}
              </p>
            </div>

            <div className="rounded-xl bg-grey-50 p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy-700">
                <MapPin className="h-4 w-4 text-teal-600" />
                Venue
              </div>
              <p className="mt-2 text-sm text-navy-500">
                {workshop.venue || "To be announced"}
              </p>
            </div>
          </div>

          {Array.isArray(workshop.topics) && workshop.topics.length ? (
            <div className="mt-7">
              <h3 className="font-semibold text-navy-800">Workshop Topics</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {workshop.topics.map((topic: string) => (
                  <span
                    key={topic}
                    className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
              <h2 className="font-bold text-navy-800">Registration Status</h2>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-navy-400">Registration</span>
                <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-700">
                  {registration.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-navy-400">Payment</span>
                <span className="font-semibold capitalize text-navy-700">
                  {registration.payment_status}
                </span>
              </div>
              {workshop.contact_hours ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-navy-400">Contact hours</span>
                  <span className="font-semibold text-navy-700">
                    {workshop.contact_hours}
                  </span>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-teal-700" />
              <h2 className="font-bold text-navy-800">Final Assessment</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-navy-600">
              The post-workshop assessment contains 30 English BCQs with 30
              seconds for each question. Scores are not shown to participants.
              PNA administration receives the complete ranked result list.
            </p>

            {workshop.assessment_open ? (
              <WorkshopAssessmentClient slug={slug} />
            ) : (
              <div className="mt-4 rounded-lg border border-teal-200 bg-white/70 px-3 py-3 text-xs font-semibold leading-5 text-teal-800">
                Assessment is currently closed. PNA will open it at the end of
                the workshop.
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="h-5 w-5 text-teal-600" />
            <h2 className="font-bold text-navy-800">Workshop Materials</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-navy-500">
            Participant handouts, workshop resources, and any post-workshop
            material shared by the PNA team will be available through this
            portal.
          </p>
        </section>

        <section className="rounded-2xl border border-grey-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-teal-600" />
            <h2 className="font-bold text-navy-800">Participant Access</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-navy-500">
            Keep your Registration ID and registered email private. This portal
            is linked to your workshop registration and is intended only for the
            registered participant.
          </p>
        </section>
      </div>
    </div>
  );
}
