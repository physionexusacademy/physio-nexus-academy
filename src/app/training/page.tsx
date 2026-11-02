import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, MapPin, ArrowRight, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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

export const revalidate = 60;

export default async function TrainingArchivePage() {
  const supabase = await createClient();
  const { data: galleryPhotos } = await supabase
    .from("gallery_items")
    .select("id,image_url,caption")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(12);

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
      </div>

      {galleryPhotos && galleryPhotos.length > 0 && (
        <section className="mt-12 overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-cyan-50/40 to-white p-5 shadow-sm sm:p-8" aria-labelledby="training-moments-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-700"><Camera className="h-4 w-4" aria-hidden="true" /> Real moments from PNA</p>
              <h2 id="training-moments-title" className="mt-2 text-2xl font-bold text-navy-800 sm:text-3xl">Workshop Moments</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">A glimpse into our hands-on workshops, training sessions and academy activities, featuring photographs from the PNA Gallery.</p>
            </div>
            <a href="/gallery" className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:border-teal-400 hover:shadow-sm">View full gallery <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {galleryPhotos.map((photo, index) => (
              <a key={photo.id} href="/gallery" className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-grey-100 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                <Image src={photo.image_url} alt={photo.caption || `Physio Nexus Academy workshop gallery photograph ${index + 1}`} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" />
                {photo.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 to-transparent px-3 pb-3 pt-8 text-xs font-medium text-white">{photo.caption}</span>}
              </a>
            ))}
          </div>
        </section>
      )}

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
