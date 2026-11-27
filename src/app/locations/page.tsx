import type { Metadata } from "next";
import { ArrowRight, Home, MapPin, MessageCircle } from "lucide-react";
import { majorCities } from "@/lib/locations";

const siteUrl = "https://physionexusacademy.com";
const ORDER = ["Sindh", "Punjab", "Islamabad Capital Territory", "Khyber Pakhtunkhwa", "Balochistan"];

export const metadata: Metadata = {
  title: { absolute: "Physiotherapy Home Visits Across Pakistan — Cities | PNA" },
  description: `Book a physiotherapist home visit in ${majorCities.length} cities across Sindh, Punjab, Islamabad, Khyber Pakhtunkhwa and Balochistan. Choose your city to see how it works.`,
  alternates: { canonical: `${siteUrl}/locations` },
};

export default function LocationsHub() {
  const provinces = [...new Set(majorCities.map((c) => c.province))].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Physio Nexus Academy home-visit cities",
    itemListElement: majorCities.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `Physiotherapy home visit in ${c.name}`, url: `${siteUrl}/locations/${c.slug}` })),
  };
  return (
    <div className="container-content section-padding max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Home physiotherapy · Pakistan</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Physiotherapy home visits in {majorCities.length} cities</h1>
      <p className="mt-4 max-w-3xl leading-7 text-navy-600">
        A physiotherapist can come to the patient&apos;s home for rehabilitation after a stroke or surgery, for arthritis, back pain, Parkinson&apos;s disease
        and many other problems. Choose your city to see how a visit works there. Every request is checked for therapist availability and travel to your
        area, and the team confirms with you before anything is scheduled.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href="/home-visit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700"><Home className="h-5 w-5" aria-hidden="true" /> Request a home visit</a>
        <a href={"https://wa.me/923489009028?text=" + encodeURIComponent("Hello Physio Nexus Academy, I want a physiotherapy home visit. Please guide me.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#20bd5a]"><MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp 0348 900 9028</a>
      </div>

      {provinces.map((p) => {
        const cities = majorCities.filter((c) => c.province === p);
        return (
          <section key={p} className="mt-10" aria-labelledby={`prov-${p}`}>
            <h2 id={`prov-${p}`} className="flex items-center gap-2 text-xl font-bold text-navy-800"><MapPin className="h-5 w-5 text-teal-600" aria-hidden="true" /> {p} <span className="text-sm font-semibold text-slate-500">· {cities.length} {cities.length === 1 ? "city" : "cities"}</span></h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((c) => (
                <li key={c.slug}>
                  <a href={`/locations/${c.slug}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-navy-800 hover:border-teal-400 hover:bg-teal-50">
                    Physiotherapist in {c.name} <ArrowRight className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-12 rounded-2xl bg-grey-50 p-6">
        <h2 className="text-lg font-bold text-navy-800">Your city is not listed?</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          You can still send a request from anywhere in Pakistan; the team will tell you honestly whether a visit is possible. If it is not, the
          {" "}<a className="font-semibold text-teal-700 hover:underline" href="/rehabverse">RehabVerse</a> online programme and the free
          {" "}<a className="font-semibold text-teal-700 hover:underline" href="/handouts">patient handouts</a> can guide exercise at home.
        </p>
      </section>
    </div>
  );
}
