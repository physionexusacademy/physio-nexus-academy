import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Workshop photos, educational events and academy media from Physio Nexus Academy.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="container-content section-padding">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        Gallery
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Workshop &amp; Academy Media
      </h1>
      <p className="mt-4 max-w-2xl text-navy-600">
        Photos from workshops, educational events and academy activities.
      </p>

      {!items?.length && (
        <p className="mt-10 rounded-xl border border-grey-200 bg-grey-50 p-8 text-center text-navy-400">
          No photos uploaded yet — check back soon.
        </p>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items?.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-grey-100"
          >
            <Image
              src={item.image_url}
              alt={item.caption || "Physio Nexus Academy gallery photo"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
