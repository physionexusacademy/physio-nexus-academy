import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
    typeof workshop.poster_image_url === "string" &&
    workshop.poster_image_url.trim().length > 0
      ? workshop.poster_image_url.trim()
      : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
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

  return (
    <div className="container-content section-padding">
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
            {workshop.cpd_hours && (
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4 text-teal-500" /> {workshop.cpd_hours}{" "}
                CPD hours
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
