import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { createClient } from "@/lib/supabase/server";

const url = "https://physionexusacademy.com/faq";

export const metadata: Metadata = {
  title: {
    absolute:
      "FAQ — Physiotherapy Workshops, Appointments, Home Visits & Learning | Physio Nexus Academy",
  },
  description:
    "Frequently asked questions about Physio Nexus Academy: physiotherapy workshops, CPD, appointments, home visits, books, certificates and learning resources across Pakistan.",
  keywords: [
    "physiotherapy FAQ Pakistan",
    "physiotherapy workshop FAQ",
    "home physiotherapy FAQ",
    "physiotherapy appointment FAQ",
    "Physio Nexus Academy FAQ",
    "CPD physiotherapy questions",
  ],
  alternates: {
    canonical: url,
  },
  openGraph: {
    title: "FAQ | Physio Nexus Academy",
    description:
      "Answers about workshops, certificates, appointments, home visits and learning resources.",
    url,
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "FAQ — Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Physio Nexus Academy",
    description:
      "Quick answers about learning, workshops and patient services at Physio Nexus Academy.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
    },
  },
};

// Reads live, admin-editable data from Supabase: render on every request (prebuilt pages
// are served from a read-only cache that never refreshes).
export const dynamic = "force-dynamic";

const fallbackGroups = [
  { group: "Workshops & Students", items: [
    { q: "Who can attend PNA workshops?", a: "Physiotherapy students, fresh graduates and practising professionals are welcome, unless a specific workshop states otherwise." },
    { q: "Do workshops offer certificates?", a: "Certificates of participation may be provided per workshop; any CPD/accreditation status will only be stated if formally confirmed." },
  ] },
  { group: "Appointments & Patients", items: [
    { q: "Is this an emergency service?", a: "No. For urgent or emergency symptoms, please contact an appropriate emergency medical service directly." },
    { q: "Does submitting a request guarantee an appointment?", a: "No. Submitting a request starts the process — our team will contact you to confirm availability and details." },
  ] },
  { group: "Resources", items: [
    { q: "Are all resources free?", a: "Access varies by resource — some are free downloads, others are view-only, members-only, or planned for future paid access." },
  ] },
];

export default async function FaqPage() {
  const supabase = await createClient();
  const { data: faqs } = await supabase.from("faqs").select("*").order("group_label", { ascending: true }).order("sort_order", { ascending: true });
  const groups = faqs?.length
    ? Object.values(faqs.reduce((acc: Record<string, { group: string; items: { q: string; a: string }[] }>, f) => {
        acc[f.group_label] ??= { group: f.group_label, items: [] };
        acc[f.group_label].items.push({ q: f.question, a: f.answer });
        return acc;
      }, {}))
    : fallbackGroups;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((group) => group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))),
  };

  return (
    <>
    <NexusHero
      kicker="Academy wing · Help"
      title={<>Frequently asked <span className="nx-gradient-text">questions</span></>}
      lead={<>Quick answers about learning with PNA, workshops, certificates and patient services across Pakistan. Still stuck? Press Ctrl K and ask Physio Nexus AI.</>}
      crumbs={[{ label: "Academy", href: "/about" }, { label: "FAQ" }]}
    />
    <div className="container-content section-padding !pt-10 max-w-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <div className="mt-8 space-y-8">
        {groups.map((group) => (
          <div key={group.group}>
            <h2 className="text-lg font-bold text-navy-800">{group.group}</h2>
            <div className="mt-3 space-y-3">
              {group.items.map((item) => (
                <details key={item.q} className="rounded-lg border border-grey-200 p-4">
                  <summary className="cursor-pointer font-medium text-navy-700">{item.q}</summary>
                  <p className="mt-2 text-sm text-navy-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
