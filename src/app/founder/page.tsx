import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { trainingHistory } from "@/lib/training-history";

export const metadata: Metadata = {
  title: "Dr. Sajjad Raza PT — Physiotherapist, Clinical Educator & Founder",
  description:
    "Official profile of Dr. Sajjad Raza PT, physiotherapist, clinical educator and Founder of Physio Nexus Academy in Pakistan.",
  keywords: ["Dr Sajjad Raza PT", "Physio Nexus Academy founder", "physiotherapy educator Pakistan", "physiotherapy clinical workshops"],
  alternates: {
    canonical: "https://physionexusacademy.com/founder",
  },
  openGraph: {
    title: "Dr. Sajjad Raza PT — Physiotherapist, Clinical Educator & Founder",
    description:
      "Official profile of Dr. Sajjad Raza PT, physiotherapist, clinical educator and Founder of Physio Nexus Academy.",
    url: "https://physionexusacademy.com/founder",
    type: "profile",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        alt: "Dr. Sajjad Raza PT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Sajjad Raza PT",
    description:
      "Official profile of Dr. Sajjad Raza PT, physiotherapist, clinical educator and Founder of Physio Nexus Academy.",
    images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
  },
};

export const revalidate = 60;

const siteUrl = "https://physionexusacademy.com";

export default async function FounderPage() {
  const supabase = await createClient();
  const [{ data: founderRow }, { data: qualifications }] = await Promise.all([
    supabase.from("founder_profile").select("*").eq("id", 1).maybeSingle(),
    supabase.from("qualifications").select("*").order("sort_order", { ascending: true }),
  ]);

  // Fall back to the shipped defaults for any field not yet edited in the
  // admin dashboard, so the page never looks broken or empty.
  const founder = {
    name: founderRow?.name || siteConfig.founder.name,
    role: founderRow?.role || siteConfig.founder.role,
    credentialsShort: founderRow?.credentials_short || siteConfig.founder.credentialsShort,
    academicFocus: founderRow?.academic_focus || siteConfig.founder.academicFocus,
    photo: founderRow?.photo_url || siteConfig.founder.photo,
    messageHeading: founderRow?.message_heading || siteConfig.founder.message.heading,
    messageBody: founderRow?.message_body?.length
      ? founderRow.message_body
      : siteConfig.founder.message.body,
  };

  const quals = qualifications?.length
    ? qualifications
    : siteConfig.qualifications.map((q, i) => ({ id: `fallback-${i}`, title: q.title }));

  const coreQualifications = quals.filter((q) => /doctor of physical therapy|\bDPT\b|MPhil Physical Therapy|AHPC Licensed/i.test(q.title));
  const manualTraining = quals.filter((q) =>
    !coreQualifications.includes(q) && /osteopathic|strain counterstrain|acupuncture|dry needling|manual therapy|kinesio taping|hijama/i.test(q.title),
  );
  const additionalQualifications = quals.filter((q) => !coreQualifications.includes(q) && !manualTraining.includes(q));
  const qualificationGroups = [
    { title: "Core education & professional licence", items: coreQualifications },
    { title: "Manual therapy & clinical training", items: manualTraining },
    { title: "Additional qualifications", items: additionalQualifications },
  ];

  const selectedTraining = trainingHistory
    .filter((item) =>
      [
        "advanced-myofascial-therapy-mastery-shahdadpur-2026",
        "cupping-therapy-workshop-hyderabad-2025",
        "sciatica-hands-on-workshop-hyderabad-2025",
        "two-month-physiotherapy-internship-hyderabad-2025",
      ].includes(item.slug),
    )
    .slice(0, 4);

  const founderUrl = `${siteUrl}/founder`;
  const founderImage =
    typeof founder.photo === "string" && founder.photo.startsWith("http")
      ? founder.photo
      : `${siteUrl}${founder.photo}`;

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${founderUrl}#profile`,
    url: founderUrl,
    name: `${founder.name} — Official Professional Profile`,
    description:
      "Official professional profile of Dr. Sajjad Raza PT, physiotherapist, clinical educator and Founder of Physio Nexus Academy.",
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${founderUrl}#primaryimage`,
      url: founderImage,
      contentUrl: founderImage,
      caption: `${founder.name} — Founder of Physio Nexus Academy`,
      representativeOfPage: true,
    },
    mainEntity: {
      "@type": "Person",
      "@id": `${founderUrl}#person`,
      name: founder.name,
      alternateName: ["Dr. Sajjad Raza PT", "Sajjad Raza PT"],
      url: founderUrl,
      image: {
        "@id": `${founderUrl}#primaryimage`,
      },
      sameAs: [
        "https://pk.linkedin.com/in/dr-sajjad-raza-pt-8a7455372",
      ],
      jobTitle: "Physiotherapist, Clinical Educator and Founder",
      description:
        "Physiotherapist, clinical educator, workshop instructor and Founder of Physio Nexus Academy.",
      worksFor: {
        "@type": "EducationalOrganization",
        "@id": "https://physionexusacademy.com/#organization",
        name: "Physio Nexus Academy",
        url: siteUrl,
      },
      affiliation: {
        "@type": "EducationalOrganization",
        "@id": "https://physionexusacademy.com/#organization",
        name: "Physio Nexus Academy",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Isra University",
      },
      knowsAbout: [
        "Physiotherapy education",
        "Musculoskeletal physiotherapy",
        "Clinical skills training",
        "Manual therapy",
        "Physiotherapy research support",
      ],
      hasCredential: quals.map((q) => ({
        "@type": "EducationalOccupationalCredential",
        name: q.title,
      })),
    },
  };

  return (
    <div className="container-content section-padding">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profileJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl shadow-lg">
            <Image
              src={founder.photo}
              alt={founder.name}
              width={300}
              height={370}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal-600">
            Physiotherapy Instructor &amp; Clinical Educator
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-navy-800">
            {founder.name}
          </h1>
          <p className="mt-1 text-sm text-teal-600">{founder.role}</p>
          <p className="mt-3 text-sm text-navy-500">{founder.credentialsShort}</p>
        </div>

        <div>
          <section>
            <h2 className="text-xl font-bold text-navy-800">Professional Profile</h2>
            <p className="mt-3 text-navy-600">
              {founder.name} is a physiotherapy educator, workshop instructor and mentor with
              an academic focus in {founder.academicFocus?.toLowerCase()} As Founder and Main
              Instructor of Physio Nexus Academy, {founder.name.split(" ")[1] ?? "he"} leads
              hands-on clinical workshops, contributes to academic and research support, and
              guides physiotherapy students and professionals through practical,
              evidence-informed learning.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-navy-800">
              Physiotherapy Teaching &amp; Clinical Education
            </h2>
            <p className="mt-3 text-navy-600">
              Through Physio Nexus Academy, {founder.name} supports physiotherapy students and
              professionals with practical clinical education, hands-on workshops, research
              guidance and evidence-informed learning. The focus is on making clinical concepts
              easier to understand and apply in real physiotherapy practice.
            </p>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                  Training Experience
                </p>
                <h2 className="mt-1 text-xl font-bold text-navy-800">
                  Selected Workshops &amp; Clinical Training
                </h2>
              </div>
              <Button href="/training" variant="outline" size="md">
                View Full Archive
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {selectedTraining.map((item) => (
                <a
                  key={item.slug}
                  href={`/training/${item.slug}`}
                  className="rounded-xl border border-grey-200 p-4 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-heading font-semibold text-navy-800">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-navy-500">
                    {item.displayDate} · {item.city}
                  </p>
                </a>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-navy-800">Qualifications &amp; Certifications</h2>
            <p className="mt-2 text-sm text-navy-500">
              Credentials are grouped by type. Issuer, year or verification links appear only when confirmed details are available.
            </p>
            <div className="mt-5 space-y-6">
              {qualificationGroups.filter((group) => group.items.length > 0).map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-teal-700">{group.title}</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {group.items.map((q) => (
                      <li key={q.id} className="flex items-start gap-3 rounded-xl border border-grey-200 bg-white p-4 text-sm text-navy-700 shadow-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" aria-hidden="true" />
                        <span>
                          <span className="font-semibold">{q.title}</span>
                          {"issuer" in q && q.issuer && <span className="mt-1 block text-navy-500">{q.issuer}</span>}
                          {"year" in q && q.year && <span className="mt-1 block text-xs text-navy-400">{q.year}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-xl bg-grey-50 p-6">
            <h2 className="font-heading text-lg font-bold text-navy-800">
              {founder.messageHeading}
            </h2>
            {founder.messageBody.map((p: string, i: number) => (
              <p key={i} className="mt-3 text-navy-600">
                {p}
              </p>
            ))}
            <p className="mt-4 text-right text-sm font-semibold text-navy-700">— {founder.name}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
