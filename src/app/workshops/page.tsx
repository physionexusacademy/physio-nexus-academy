import type { Metadata } from "next";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NexusHero } from "@/components/nexus/NexusHero";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Physiotherapy Workshops & Courses in Pakistan",
  description:
    "Hands-on physiotherapy workshops and CPD courses in manual therapy and clinical skills — Karachi, Hyderabad and across Pakistan, with verifiable certificates.",
  keywords: [
    "physiotherapy workshops Pakistan",
    "physiotherapy workshops Karachi",
    "physiotherapy workshops Hyderabad",
    "manual therapy workshops",
    "physiotherapy training Karachi",
    "clinical skills workshops",
    "CPD physiotherapy Pakistan",
    "hands-on physiotherapy training",
  ],
  openGraph: {
    title: "Physiotherapy Workshops in Pakistan | Physio Nexus Academy",
    description:
      "Practical physiotherapy workshops and clinical skills training in Karachi, Hyderabad and other Pakistani cities.",
    url: "https://physionexusacademy.com/workshops",
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physiotherapy Workshops in Pakistan | Physio Nexus Academy",
    description:
      "Hands-on clinical skills and CPD workshops for physiotherapy students and professionals.",
  },
  alternates: {
    canonical: "https://physionexusacademy.com/workshops",
  },
  robots: { index: true, follow: true },
};

// Reads live, admin-editable data from Supabase: render on every request (prebuilt pages
// are served from a read-only cache that never refreshes).
export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const dateParts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type: string) =>
    dateParts.find((part) => part.type === type)?.value ?? "";
  const todayInPakistan = `${datePart("year")}-${datePart("month")}-${datePart("day")}`;

  const supabase = createPublicClient();
  const { data: workshops } = await supabase
    .from("workshops")
    .select("id,slug,title,summary,start_date,city,seat_limit,topics,is_past")
    .eq("status", "published")
    .order("start_date", { ascending: true, nullsFirst: false });

  return (
    <>
    <NexusHero
      kicker="Academy wing · Hands-on CPD"
      title={<>Clinical skill <span className="nx-gradient-text">workshops</span></>}
      lead={<>Hands-on physiotherapy workshops that connect theory with real clinical application — in <a href="/locations/karachi" className="font-semibold text-white underline decoration-[var(--nx-aqua)] underline-offset-4">Karachi</a>, <a href="/locations/hyderabad" className="font-semibold text-white underline decoration-[var(--nx-aqua)] underline-offset-4">Hyderabad</a> and other cities where PNA schedules training.</>}
      crumbs={[{ label: "Academy", href: "/about" }, { label: "Workshops & CPD" }]}
      actions={
        <>
          <a href="#workshop-list" className="nx-btn nx-btn-primary">See workshops</a>
          <a href="/verify" className="nx-btn nx-btn-ghost">Verify a certificate</a>
          <a href="/training" className="nx-btn nx-btn-ghost">Training archive</a>
        </>
      }
      stats={[
        { value: "CPD", label: "Approved provider · #791052" },
        { value: "Hands-on", label: "small-group practicals" },
        { value: "Verified", label: "certificates you can check" },
      ]}
    />
    <div id="workshop-list" className="container-content section-padding !pt-10 scroll-mt-24">
      {!workshops?.length && (
        <p className="mt-10 rounded-xl border border-grey-200 bg-grey-50 p-8 text-center text-navy-400">
          No workshops are published yet — check back soon, or follow us on{" "}
          <a href="https://www.instagram.com/physionexusacademy/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
            Instagram
          </a>{" "}
          for announcements.
        </p>
      )}

      {(workshops?.length ?? 0) > 0 && !(workshops ?? []).some((w) => w.start_date && String(w.start_date).slice(0, 10) >= todayInPakistan) && (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-navy-700">
          No upcoming workshop date is currently confirmed. Past workshop details remain available below; follow PNA on Instagram or message us on WhatsApp for the next announced date.
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...(workshops ?? [])]
          .sort((a, b) => {
            const getPast = (item: { start_date: string | null; is_past: boolean | null }) =>
              item.start_date
                ? String(item.start_date).slice(0, 10) < todayInPakistan
                : Boolean(item.is_past);
            const pastDifference = Number(getPast(a)) - Number(getPast(b));
            if (pastDifference !== 0) return pastDifference;
            if (!a.start_date) return 1;
            if (!b.start_date) return -1;
            return String(a.start_date).localeCompare(String(b.start_date));
          })
          .map((w) => {
          // The event date is authoritative when available; stale database flags
          // must never keep an expired event labelled as upcoming (or vice versa).
          const isPast = w.start_date
            ? String(w.start_date).slice(0, 10) < todayInPakistan
            : Boolean(w.is_past);
          const hasConfirmedDate = Boolean(w.start_date);
          return (
            <div
              key={w.id}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-40px_rgba(10,60,90,0.6)]"
            >
              <span className="inline-block w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {isPast ? "Past event" : hasConfirmedDate ? "Upcoming" : "Date to be announced"}
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
                    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(w.start_date))
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
                {isPast || !hasConfirmedDate ? "View workshop details" : "View details & register"}
              </Button>
            </div>
          );
        })}
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
    </>
  );
}
