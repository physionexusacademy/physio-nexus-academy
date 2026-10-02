import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users, Award, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { WORKSHOP_PORTAL_SLUG } from "@/lib/workshop-portal";
import { RegistrationForm } from "./RegistrationForm";

export const revalidate = 60;

const siteUrl = "https://physionexusacademy.com";

function getWorkshopDescription(workshop: {
  summary?: string | null;
  description?: string | null;
}) {
  const source = workshop.summary?.trim() || workshop.description?.trim();

  if (!source) {
    return "Explore this physiotherapy workshop from Physio Nexus Academy.";
  }

  return source.replace(/\s+/g, " ").slice(0, 160).trim();
}

async function getPublishedWorkshop(slug: string) {
  const supabase = await createClient();
  const { data: workshop } = await supabase
    .from("workshops")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return workshop;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getPublishedWorkshop(slug);

  if (!workshop) notFound();

  const title = `${workshop.title} | Physio Nexus Academy`;
  const description = getWorkshopDescription(workshop);
  const canonicalUrl = `${siteUrl}/workshops/${slug}`;
  const image =
    typeof workshop.poster_image_url === "string" && workshop.poster_image_url.trim()
      ? workshop.poster_image_url.trim()
      : `${siteUrl}/images/pna-logo.png`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workshop = await getPublishedWorkshop(slug);

  if (!workshop) notFound();

  const url = `${siteUrl}/workshops/${slug}`;
  const description = getWorkshopDescription(workshop);
  const image =
    typeof workshop.poster_image_url === "string" && workshop.poster_image_url.trim()
      ? workshop.poster_image_url.trim()
      : `${siteUrl}/images/pna-logo.png`;

  const hasRegularFee =
    workshop.regular_fee !== null &&
    workshop.regular_fee !== undefined &&
    workshop.regular_fee !== "";
  const hasEarlyBirdFee =
    workshop.early_bird_fee !== null &&
    workshop.early_bird_fee !== undefined &&
    workshop.early_bird_fee !== "";

  const regularFee = hasRegularFee ? Number(workshop.regular_fee) : null;
  const earlyBirdFee = hasEarlyBirdFee ? Number(workshop.early_bird_fee) : null;
  const earlyBirdDeadline = workshop.early_bird_deadline
    ? new Date(`${workshop.early_bird_deadline}T23:59:59+05:00`)
    : null;
  const earlyBirdActive =
    earlyBirdFee !== null &&
    earlyBirdDeadline !== null &&
    !Number.isNaN(earlyBirdDeadline.getTime()) &&
    earlyBirdDeadline.getTime() >= Date.now();

  const currentPrice =
    earlyBirdActive && earlyBirdFee !== null
      ? earlyBirdFee
      : regularFee !== null
        ? regularFee
        : earlyBirdFee;

  const regularOfferValidFrom =
    !earlyBirdActive && workshop.early_bird_deadline
      ? `${workshop.early_bird_deadline}T23:59:59+05:00`
      : workshop.created_at;

  const offer =
    workshop.registration_status !== "closed" &&
    currentPrice !== null &&
    Number.isFinite(currentPrice)
      ? {
          "@type": "Offer",
          url,
          price: currentPrice,
          priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
          ...(regularOfferValidFrom ? { validFrom: regularOfferValidFrom } : {}),
          ...(earlyBirdActive && workshop.early_bird_deadline
            ? { validThrough: `${workshop.early_bird_deadline}T23:59:59+05:00` }
            : {}),
        }
      : undefined;

  const instructorPerformers =
    Array.isArray(workshop.instructors) && workshop.instructors.length
      ? workshop.instructors
          .filter((name: unknown): name is string => typeof name === "string" && name.trim().length > 0)
          .map((name: string) => ({
            "@type": "Person",
            name: name.trim(),
          }))
      : [];

  const performers =
    instructorPerformers.length > 0
      ? instructorPerformers
      : [
          {
            "@type": "Organization",
            name: "Physio Nexus Academy",
            url: siteUrl,
          },
        ];

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: workshop.title,
    description,
    url,
    ...(workshop.start_date ? { startDate: workshop.start_date } : {}),
    ...(workshop.end_date ? { endDate: workshop.end_date } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [image],
    ...(workshop.city || workshop.venue
      ? {
          location: {
            "@type": "Place",
            ...(workshop.venue ? { name: workshop.venue } : {}),
            ...(workshop.city
              ? {
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: workshop.city,
                    addressCountry: "PK",
                  },
                }
              : {}),
          },
        }
      : {}),
    organizer: {
      "@type": "EducationalOrganization",
      name: "Physio Nexus Academy",
      url: siteUrl,
    },
    performer: performers,
    ...(offer ? { offers: offer } : {}),
  };

  return (
    <div className="container-content section-padding">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }} />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            Workshop
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {workshop.title}
          </h1>
          {workshop.subtitle && (
            <p className="mt-2 text-lg text-navy-500">{workshop.subtitle}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-navy-500">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-teal-500" />
              {workshop.start_date
                ? new Date(workshop.start_date).toLocaleDateString()
                : "Date to be announced"}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-500" />{" "}
              {workshop.city || "City TBA"}
              {workshop.venue ? ` — ${workshop.venue}` : ""}
            </span>
            {workshop.seat_limit && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-500" />{" "}
                {workshop.seat_limit} seats
              </span>
            )}
            {workshop.contact_hours && (
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4 text-teal-500" /> {workshop.contact_hours}{" "}
                Contact hours
              </span>
            )}
          </div>

          {workshop.description && (
            <div className="prose prose-navy mt-8 max-w-none whitespace-pre-line text-navy-600">
              {workshop.description}
            </div>
          )}

          {!!workshop.topics?.length && (
            <div className="mt-6">
              <h2 className="font-heading text-lg font-semibold text-navy-800">
                Topics Covered
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {workshop.topics.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full bg-grey-100 px-3 py-1 text-sm text-navy-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!!workshop.instructors?.length && (
            <div className="mt-6">
              <h2 className="font-heading text-lg font-semibold text-navy-800">
                Instructors
              </h2>
              <p className="mt-2 text-navy-600">
                {workshop.instructors.join(", ")}
              </p>
            </div>
          )}

          {(workshop.regular_fee || workshop.early_bird_fee) && (
            <div className="mt-6 rounded-lg border border-grey-200 bg-grey-50 p-4 text-sm text-navy-600">
              {workshop.early_bird_fee && (
                <p>
                  Early-bird fee:{" "}
                  <span className="font-semibold">
                    {workshop.early_bird_fee}
                  </span>
                </p>
              )}
              {workshop.regular_fee && (
                <p>
                  Regular fee:{" "}
                  <span className="font-semibold">{workshop.regular_fee}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {slug === WORKSHOP_PORTAL_SLUG ? (
            <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                <div>
                  <h2 className="font-heading font-semibold text-navy-800">
                    Already registered?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-navy-500">
                    Registered participants can access workshop details, assessment
                    information, and participant-only updates.
                  </p>
                  <Link
                    href={`/workshops/${slug}/portal`}
                    className="mt-3 inline-flex items-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    Open Participant Portal
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-grey-200 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-navy-800">
              Register for this workshop
            </h2>
            <p className="mt-1 text-sm text-navy-400">
              Registration status: {workshop.registration_status}
            </p>
            <div className="mt-4">
              <RegistrationForm workshopId={workshop.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
