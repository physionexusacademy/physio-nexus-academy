import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  UserRound,
  Clock3,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTrainingItem, trainingHistory } from "@/lib/training-history";

const siteUrl = "https://physionexusacademy.com";

export function generateStaticParams() {
  return trainingHistory.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getTrainingItem(slug);

  if (!item) return {};

  const url = `${siteUrl}/training/${item.slug}`;
  const image = `${siteUrl}${item.image}`;

  return {
    title: `${item.title} — Past Training Record`,
    description: item.summary,
    alternates: { canonical: url },
    openGraph: {
      title: item.title,
      description: item.summary,
      url,
      type: "article",
      images: [image],
    },
  };
}

export default async function TrainingRecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getTrainingItem(slug);

  if (!item) notFound();

  const url = `${siteUrl}/training/${item.slug}`;
  const imageUrl = `${siteUrl}${item.image}`;
  const recordJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.summary,
    url,
    image: imageUrl,
    ...(item.date ? { datePublished: item.date } : {}),
    about: [
      { "@type": "Thing", name: item.category },
      { "@type": "Person", name: "Dr. Sajjad Raza PT" },
    ],
    publisher: {
      "@type": "EducationalOrganization",
      "@id": "https://physionexusacademy.com/#organization",
      name: "Physio Nexus Academy",
      url: siteUrl,
    },
  };

  return (
    <div className="container-content section-padding">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recordJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <a
        href="/training"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to training archive
      </a>

      <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(260px,380px)_1fr] lg:items-start">
        <div className="rounded-2xl border border-grey-200 bg-grey-50 p-4">
          <Image
            src={item.image}
            alt={item.imageAlt}
            width={item.imageWidth}
            height={item.imageHeight}
            className="mx-auto h-auto w-full max-w-[320px] rounded-xl object-contain"
            priority
          />
        </div>

        <div>
          <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {item.category} · Historical record
          </span>
          <h1 className="mt-4 text-3xl font-bold text-navy-800 sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-navy-600">
            {item.summary}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-xl border border-grey-200 p-4">
              <CalendarDays className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                  Date
                </p>
                <p className="mt-1 text-sm font-medium text-navy-700">
                  {item.displayDate}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border border-grey-200 p-4">
              <MapPin className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                  Location
                </p>
                <p className="mt-1 text-sm font-medium text-navy-700">
                  {item.city}
                  {item.venue ? ` · ${item.venue}` : ""}
                </p>
                {item.address && (
                  <p className="mt-1 text-xs text-navy-400">{item.address}</p>
                )}
              </div>
            </div>

            {item.time && (
              <div className="flex gap-3 rounded-xl border border-grey-200 p-4">
                <Clock3 className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-medium text-navy-700">{item.time}</p>
                </div>
              </div>
            )}

            {item.role && (
              <div className="flex gap-3 rounded-xl border border-grey-200 p-4">
                <UserRound className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-medium text-navy-700">{item.role}</p>
                </div>
              </div>
            )}
          </div>

          <section className="mt-9">
            <h2 className="text-xl font-bold text-navy-800">Topics &amp; Highlights</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-grey-100 px-3 py-1.5 text-sm text-navy-600"
                >
                  {topic}
                </span>
              ))}
            </div>
          </section>

          {!!item.details?.length && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-navy-800">Record Details</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {item.details.map((detail) => (
                  <div key={detail.label} className="rounded-xl bg-grey-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 text-sm text-navy-700">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="mt-8 flex gap-3 rounded-xl border border-grey-200 bg-grey-50 p-4 text-sm text-navy-500">
            <Info className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
            <p>
              This page documents a past activity. Any pricing, seat availability,
              registration wording or contact details visible inside the historical
              poster are archival and should not be treated as a current offer.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/workshops">View Upcoming Workshops</Button>
            <Button href="/founder" variant="outline">
              View Instructor Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
