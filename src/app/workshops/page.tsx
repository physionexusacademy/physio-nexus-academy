import type { Metadata } from "next";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Workshops",
  description:
    "Upcoming, ongoing and past physiotherapy workshops from Physio Nexus Academy.",
};

export const revalidate = 60; // re-fetch published workshops at most once a minute

export default async function WorkshopsPage() {
  const supabase = await createClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true, nullsFirst: false });

  return (
    <div className="container-content section-padding">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
        Workshops
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Clinical Skill Workshops
      </h1>
      <p className="mt-4 max-w-2xl text-navy-600">
        Hands-on physiotherapy workshops connecting theory with real clinical
        application.
      </p>

      {!workshops?.length && (
        <p className="mt-10 rounded-xl border border-grey-200 bg-grey-50 p-8 text-center text-navy-400">
          No workshops are published yet — check back soon, or follow our{" "}
          <a href="/updates" className="text-teal-600 hover:underline">
            updates page
          </a>{" "}
          for announcements.
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workshops?.map((w) => (
          <div
            key={w.id}
            className="flex flex-col rounded-xl border border-grey-200 p-6"
          >
            <span className="inline-block w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {w.is_past ? "Past" : "Upcoming"}
            </span>
            <h2 className="mt-4 font-heading text-lg font-semibold text-navy-800">
              {w.title}
            </h2>
            {w.summary && (
              <p className="mt-2 text-sm text-navy-500">{w.summary}</p>
            )}
            <div className="mt-3 space-y-1.5 text-sm text-navy-500">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-teal-500" />
                {w.start_date
                  ? new Date(w.start_date).toLocaleDateString()
                  : "Date to be announced"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-500" />{" "}
                {w.city || "City to be announced"}
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-500" />
                {w.seat_limit
                  ? `${w.seat_limit} seats`
                  : "Seats to be announced"}
              </p>
            </div>
            {!!w.topics?.length && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {w.topics.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full bg-grey-100 px-2.5 py-1 text-xs text-navy-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <Button
              href={`/workshops/${w.slug}`}
              variant="outline"
              className="mt-5"
            >
              View details &amp; register
            </Button>
          </div>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-grey-200 bg-grey-50 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
          Professional Portfolio
        </p>
        <h2 className="mt-2 text-2xl font-bold text-navy-800">
          Past Workshops &amp; Clinical Training
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-navy-600">
          Explore documented workshops, internship programs and clinical training
          activities from the professional portfolio of Physio Nexus Academy and
          Dr. Sajjad Raza PT.
        </p>
        <Button href="/training" variant="outline" className="mt-5">
          View Training Archive
        </Button>
      </section>
    </div>
  );
}
