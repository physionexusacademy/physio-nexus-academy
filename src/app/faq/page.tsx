import type { Metadata } from "next";
import { NexusHero } from "@/components/nexus/NexusHero";
import { createClient } from "@/lib/supabase/server";

const url = "https://physionexusacademy.com/faq";

export const metadata: Metadata = {
  title: "FAQ — Workshops, Appointments, Home Visits & Learning",
  description:
    "Answers about Physio Nexus Academy: workshops, CPD, appointments, home visits, books, certificates and learning resources in Pakistan.",
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
    title: "FAQ — Workshops, Appointments, Home Visits & Learning | PNA",
    description:
      "Answers about Physio Nexus Academy: workshops, CPD, appointments, home visits, books, certificates and learning resources in Pakistan.",
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
    title: "FAQ — Workshops, Appointments, Home Visits & Learning | PNA",
    description:
      "Answers about Physio Nexus Academy: workshops, CPD, appointments, home visits, books, certificates and learning resources in Pakistan.",
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

/**
 * The FAQ shown while the admin "faqs" table is empty. Answers describe what the site really does today; nothing here promises prices,
 * accreditation or availability that the team has not confirmed.
 */
const fallbackGroups = [
  { group: "About PNA", items: [
    { q: "What is Physio Nexus Academy?", a: "Physio Nexus Academy (PNA) is a Pakistani physiotherapy platform with two sides: free learning for physiotherapy students and clinicians (lessons, skills practice, a virtual patient, condition guides), and patient services (home-visit and appointment requests, the RehabVerse home programme, handouts and a symptom checker)." },
    { q: "Who runs PNA?", a: "PNA was founded by a practising physiotherapist and educator. The Founder and Faculty pages introduce the team and what each person teaches." },
    { q: "Is the content available in Urdu?", a: "Much of it is. Patient handouts, the symptom checker, RehabVerse and the PNA Teacher lessons have Roman Urdu alongside English, and the PNA Teacher can read lessons aloud in both languages." },
  ] },
  { group: "Learning (students and clinicians)", items: [
    { q: "Do I have to pay to use the lessons?", a: "No. PNA Teacher lessons, the Skills Lab, the Daily Challenge, the leagues, the condition guides and the clinical atlas are free to use." },
    { q: "What is PNA Teacher?", a: "PNA Teacher is the lesson classroom: subjects such as Movement Science, Neurology, Manual Therapy and Research, each split into units and short topics. Every lesson has a 3D teacher, quick checks and flashcards." },
    { q: "What is the Skills Lab?", a: "The Skills Lab is for hands-on exam skills: goniometry, manual muscle testing, special tests, dermatomes and myotomes, reflexes, posture, palpation and more, with simulators, practice questions, flashcards and OSCE stations." },
    { q: "What is the Virtual Patient?", a: "A realistic 3D patient you examine yourself: take a history, measure range, test muscles and reflexes, run special tests, then make a diagnosis and get an OSCE-style score." },
    { q: "How do the Daily Challenge and leagues work?", a: "The Daily Challenge gives five physiotherapy questions a day with a live leaderboard. Lessons, Skills Lab practice and the Daily Challenge earn XP that moves you up weekly leagues, from Bronze to Diamond." },
    { q: "Are the condition guides evidence-based?", a: "Yes. Each of the condition guides follows current clinical guidelines and research, at three depths (quick guide, clinical plan, expert detail), and lists its sources. They support clinical reasoning; they do not replace an assessment by a qualified clinician." },
    { q: "Can PNA help with my research or thesis?", a: "Yes. The Research track in PNA Teacher covers study design, statistics, critical appraisal and writing, and the Research page explains the research support the team offers." },
  ] },
  { group: "Workshops and certificates", items: [
    { q: "Who can attend PNA workshops?", a: "Physiotherapy students, fresh graduates and practising professionals are welcome, unless a specific workshop states otherwise." },
    { q: "Do workshops offer certificates?", a: "Certificates of participation may be provided per workshop; any CPD/accreditation status will only be stated if formally confirmed." },
    { q: "How can I check that a PNA certificate is genuine?", a: "Open the Verify page and enter the exact Certificate ID printed on the certificate. A genuine certificate shows its holder, workshop and date." },
    { q: "Where are workshop dates and venues announced?", a: "On the Workshops page. Dates, venues, instructors and registration details are published there once confirmed." },
  ] },
  { group: "Patients and home visits", items: [
    { q: "Is this an emergency service?", a: "No. For urgent or emergency symptoms, please contact an appropriate emergency medical service directly." },
    { q: "Does submitting a request guarantee an appointment?", a: "No. Submitting a request starts the process — our team will contact you to confirm availability and details." },
    { q: "Which cities do you cover for home visits?", a: "Home-visit requests are accepted from 34 cities across Sindh, Punjab, Islamabad, Khyber Pakhtunkhwa and Balochistan; the Locations page lists them all. You can also send a request from another city and the team will tell you honestly whether a visit is possible." },
    { q: "How do I request a home visit?", a: "Fill the Home Visit form or send a WhatsApp message to 0348 900 9028 with the patient's name, age, city and area, the main problem and a preferred day and time." },
    { q: "What is RehabVerse?", a: "RehabVerse is PNA's guided online rehabilitation: you describe your symptoms, a physiotherapist approves a programme, a 3D guide shows each exercise, and your progress is checked day by day." },
    { q: "Which problem do I have? Can the website tell me?", a: "The Symptom Checker asks where and how it hurts, points you to the condition guides that fit, and tells you when to see a doctor first. It is a guide, not a diagnosis." },
    { q: "Are the patient handouts free to print?", a: "Yes. The handouts (back pain, neck pain, knee arthritis, knee and hip replacement, ankle sprain, carpal tunnel, falls prevention, pelvic floor) are free to print or share, in English and Roman Urdu, and each lists the warning signs that need a doctor." },
    { q: "How is my health information protected?", a: "Only the team members who need it can see a patient's information, and it is used only for that patient's care. The Privacy Policy explains what is stored and how to ask for it to be deleted." },
  ] },
  { group: "Resources", items: [
    { q: "Are all resources free?", a: "Access varies by resource — some are free downloads, others are view-only, members-only, or planned for future paid access." },
    { q: "Can I use the health calculators for my patients?", a: "Yes. The calculators (BMI, heart rate zones, waist-hip ratio, one-rep max, daily energy, outcome change and a posture screen) are free; use their results alongside your own clinical judgement." },
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
