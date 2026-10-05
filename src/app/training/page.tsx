import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, MapPin, ArrowRight, History } from "lucide-react";
import {
  trainingCategories,
  trainingHistory,
  type TrainingCategory,
} from "@/lib/training-history";

export const metadata: Metadata = {
  title: "Past Physiotherapy Workshops, Internships & Clinical Training",
  description:
    "Explore past physiotherapy workshops, internship programs and clinical training activities from the professional portfolio of Physio Nexus Academy and Dr. Sajjad Raza PT.",
  alternates: {
    canonical: "https://physionexusacademy.com/training",
  },
};

const siteUrl = "https://physionexusacademy.com";

function categoryHeading(category: TrainingCategory) {
  if (category === "Workshop") return "Past Workshops";
  if (category === "Internship Program") return "Internship Programs";
  return "Clinical Camps";
}

export default function TrainingArchivePage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Past Workshops & Clinical Training — Physio Nexus Academy",
    url: `${siteUrl}/training`,
    description:
      "Archive of physiotherapy workshops, internship programs and clinical training activities.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: trainingHistory.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${siteUrl}/training/${item.slug}`,
      })),
    },
  };

  return (
    <div className="container-content section-padding">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
          Training Archive
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Past Workshops &amp; Clinical Training
        </h1>
        <p className="mt-4 text-navy-600">
          A documented portfolio of physiotherapy workshops, internship programs
          and clinical initiatives led by Dr. Sajjad Raza PT and presented as
          part of the Physio Nexus Academy professional training record.
        </p>
        <div className="mt-5 flex gap-3 rounded-xl border border-grey-200 bg-grey-50 p-4 text-sm text-navy-500">
          <History className="mt-0.5 h-5 w-5 flex-none text-teal-600" />
          <p>
            These are historical records. Dates, fees, seat counts and
            registration details visible in old posters are not current offers.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {trainingCategories.map((category) => {
          const items = trainingHistory.filter((item) => item.category === category);
          if (!items.length) return null;

          return (
            <section key={category}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                    {category}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-navy-800">
                    {categoryHeading(category)}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <article
                    key={item.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-grey-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex min-h-[250px] items-center justify-center bg-grey-50 p-4">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        width={item.imageWidth}
                        height={item.imageHeight}
                        className="h-auto max-h-[320px] w-auto max-w-full rounded-lg object-contain"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {item.category}
                      </span>
                      <h3 className="mt-3 font-heading text-lg font-semibold text-navy-800">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-navy-500">
                        {item.summary}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-navy-500">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 flex-none text-teal-500" />
                          {item.displayDate}
                          {item.time ? ` · ${item.time}` : ""}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-none text-teal-500" />
                          {item.city}
                        </p>
                      </div>

                      <a
                        href={`/training/${item.slug}`}
                        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
                      >
                        View training record
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
