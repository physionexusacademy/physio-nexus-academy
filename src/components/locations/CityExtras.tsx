import { ArrowRight, ClipboardList, HeartPulse, Laptop, MapPin } from "lucide-react";
import { majorCities, type CityLocation } from "@/lib/locations";
import { getCondition } from "@/lib/conditions/catalog";

/** Conditions families most often ask a home visit for: people who cannot easily travel to a clinic. Each links to its full guide. */
const HOME_CONDITIONS: { slug: string; why: string }[] = [
  { slug: "stroke-rehabilitation", why: "walking, arm use and balance practised where the patient lives" },
  { slug: "knee-and-hip-arthroplasty-rehabilitation", why: "the first weeks after a knee or hip replacement: safe transfers, stairs and walking at home" },
  { slug: "knee-osteoarthritis", why: "strength and daily activity for older adults" },
  { slug: "parkinsons-disease", why: "gait, turning and fall prevention in the real home" },
  { slug: "non-specific-low-back-pain", why: "when sitting in a vehicle makes the pain worse" },
  { slug: "spinal-cord-injury-rehabilitation", why: "bed mobility, transfers and wheelchair skills" },
  { slug: "copd-pulmonary-rehabilitation", why: "breathing and building walking tolerance" },
  { slug: "adhesive-capsulitis", why: "a stiff, painful shoulder that blocks daily tasks" },
  { slug: "osteoporosis", why: "bone-safe exercise and making the home fall-safe" },
];

const PREPARE = [
  "Any reports, X-rays or MRI and the doctor's notes or discharge summary",
  "A list of the medicines the patient takes",
  "A clear space of about 2 by 2 metres, a firm chair and, if possible, a bed the therapist can reach from both sides",
  "Comfortable clothes that let the painful area be seen and moved",
  "A family member present, especially for older or bed-bound patients",
];

export function cityFaq(city: CityLocation) {
  return [
    { q: `Do you provide physiotherapy at home in ${city.name}?`, a: `Yes, ${city.name} is one of the cities we accept home-visit requests from. ${city.homeVisitNote}` },
    { q: `How do I book a home physiotherapist in ${city.name}?`, a: `Fill the home-visit form or send a WhatsApp message to 0348 900 9028 with the patient's name, age, area in ${city.name}, the main problem and a preferred day and time. The team replies to confirm what is possible.` },
    { q: "Is a visit guaranteed once I submit a request?", a: "No. Every request is checked for therapist availability and travel to your area first. Nothing is scheduled until the team confirms it with you." },
    { q: "Which problems can be treated at home?", a: "Most rehabilitation can be done at home: after a stroke, after knee or hip replacement, back and neck pain, arthritis, Parkinson's disease, spinal cord injury, frozen shoulder, breathing problems and recovery after a hospital stay. Emergencies are not treated at home: for chest pain, sudden weakness, a fall with severe pain or loss of bladder or bowel control, go to the nearest emergency department." },
    { q: "Can I get help online if a visit is not possible?", a: "Yes. RehabVerse gives a guided home-exercise plan with a therapist checking progress, and the free patient handouts in English and Roman Urdu explain safe exercises and warning signs." },
  ];
}

/** Shared, practical sections for a city page: what is treated at home, how to prepare, online options, nearby cities and a city FAQ. */
export function CityExtras({ city }: { city: CityLocation }) {
  const nearby = majorCities.filter((c) => c.province === city.province && c.slug !== city.slug);
  const conditions = HOME_CONDITIONS.map((h) => ({ ...h, item: getCondition(h.slug) })).filter((h) => h.item);
  const faq = cityFaq(city);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div data-pna-city-extras className="text-left">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />

      <section className="mt-8" aria-labelledby="city-cond">
        <h2 id="city-cond" className="flex items-center gap-2 text-xl font-bold text-navy-800"><HeartPulse className="h-5 w-5 text-teal-600" aria-hidden="true" /> What families in {city.name} most often ask a home visit for</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">Each link opens PNA&apos;s full guide: what the condition is, how it is assessed and the stage-by-stage rehab plan your therapist will follow.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {conditions.map(({ slug, why, item }) => (
            <li key={slug}>
              <a href={`/conditions/${slug}`} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 hover:border-teal-400 hover:bg-teal-50">
                <span className="font-bold text-navy-800">{item!.name}</span>
                <span className="text-[13px] text-slate-600">{why}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="city-prep">
          <h2 id="city-prep" className="flex items-center gap-2 text-lg font-bold text-navy-800"><ClipboardList className="h-5 w-5 text-teal-600" aria-hidden="true" /> Before the therapist arrives</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-navy-600">{PREPARE.map((p) => <li key={p}>{p}</li>)}</ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="city-online">
          <h2 id="city-online" className="flex items-center gap-2 text-lg font-bold text-navy-800"><Laptop className="h-5 w-5 text-teal-600" aria-hidden="true" /> Between visits, or if a visit is not possible</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a className="font-semibold text-teal-700 hover:underline" href="/rehabverse">RehabVerse</a> <span className="text-navy-600">— a guided home-exercise plan, checked by a physiotherapist</span></li>
            <li><a className="font-semibold text-teal-700 hover:underline" href="/handouts">Patient handouts</a> <span className="text-navy-600">— printable exercises and warning signs in English and Roman Urdu</span></li>
            <li><a className="font-semibold text-teal-700 hover:underline" href="/symptom-checker">Symptom checker</a> <span className="text-navy-600">— find out which guide fits your pain, and when to see a doctor first</span></li>
          </ul>
        </section>
      </div>

      <section className="mt-8" aria-labelledby="city-faq">
        <h2 id="city-faq" className="text-xl font-bold text-navy-800">Questions about home physiotherapy in {city.name}</h2>
        <div className="mt-3 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faq.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer font-semibold text-navy-800">{f.q}</summary>
              <p className="mt-2 text-sm leading-6 text-navy-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="city-near">
        <h2 id="city-near" className="flex items-center gap-2 text-lg font-bold text-navy-800"><MapPin className="h-5 w-5 text-teal-600" aria-hidden="true" /> {nearby.length ? `Other cities in ${city.province}` : "Other cities we cover"}</h2>
        {nearby.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {nearby.map((c) => (
              <li key={c.slug}><a href={`/locations/${c.slug}`} className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-navy-800 hover:border-teal-400">{c.name}</a></li>
            ))}
          </ul>
        ) : null}
        <a href="/locations" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">All {majorCities.length} cities we cover <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
      </section>
    </div>
  );
}
