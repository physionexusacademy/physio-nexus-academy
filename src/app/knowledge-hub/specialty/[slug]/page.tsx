import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BrainCircuit, Clock3, Layers3 } from "lucide-react";
import { knowledgeSpecialties } from "@/lib/knowledge-content";
import { allKnowledgeArticles } from "@/lib/all-knowledge-content";
import { clinicalCases } from "@/lib/all-clinical-cases";

export function generateStaticParams() {
  return knowledgeSpecialties.map((specialty) => ({ slug: specialty.slug }));
}

const specialtySeo: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  msk: {
    title: "Musculoskeletal (MSK) Physiotherapy Knowledge Hub | Assessment, Manual Therapy & Rehab",
    description:
      "Complete MSK physiotherapy library for students and clinicians: spine, joints, soft tissue, special tests, clinical reasoning and evidence-informed rehabilitation pathways.",
    keywords: [
      "MSK physiotherapy",
      "musculoskeletal physiotherapy",
      "manual therapy",
      "special tests physiotherapy",
      "MSK clinical reasoning",
      "physiotherapy students Pakistan",
    ],
  },
  neuro: {
    title: "Neurological Physiotherapy Knowledge Hub | Stroke, SCI, Parkinson’s & Neurorehab",
    description:
      "Evidence-based neurological physiotherapy resources covering stroke, spinal cord injury, Parkinson’s disease, balance, gait and practical neurorehabilitation strategies.",
    keywords: [
      "neurological physiotherapy",
      "stroke rehabilitation",
      "neurorehab",
      "Parkinson physiotherapy",
      "spinal cord injury physiotherapy",
      "balance and gait training",
    ],
  },
  cardio: {
    title: "Cardiopulmonary & Respiratory Physiotherapy Knowledge Hub | Cardiac Rehab, Airway Clearance & Exercise Tolerance",
    description:
      "Cardiopulmonary and respiratory physiotherapy library: cardiac rehabilitation after MI/PCI, COPD pulmonary rehab, airway clearance techniques, breathing strategies and exercise tolerance training for students and clinicians.",
    keywords: [
      "respiratory physiotherapy",
      "cardiopulmonary physiotherapy",
      "cardiac rehabilitation",
      "COPD pulmonary rehabilitation",
      "airway clearance techniques",
      "breathing exercises physiotherapy",
      "respiratory physiotherapy Pakistan",
      "post MI cardiac rehab",
      "exercise tolerance training",
    ],
  },
  pediatrics: {
    title: "Pediatric Physiotherapy Knowledge Hub | Development, CP, Clubfoot & Pediatric Rehab",
    description:
      "Pediatric physiotherapy resources covering typical development, cerebral palsy, clubfoot, assessment and family-centered rehabilitation approaches.",
    keywords: [
      "pediatric physiotherapy",
      "cerebral palsy physiotherapy",
      "clubfoot physiotherapy",
      "child development physiotherapy",
      "pediatric rehabilitation",
    ],
  },
  sports: {
    title: "Sports Physiotherapy Knowledge Hub | Injury, Return-to-Sport & Performance",
    description:
      "Sports physiotherapy library focused on injury management, load management, return-to-sport criteria and performance-oriented rehabilitation.",
    keywords: [
      "sports physiotherapy",
      "return to sport",
      "sports injury rehabilitation",
      "load management physiotherapy",
      "athletic rehabilitation",
    ],
  },
  geriatrics: {
    title: "Geriatric Physiotherapy Knowledge Hub | Falls, Frailty, Osteoporosis & Healthy Aging",
    description:
      "Geriatric physiotherapy resources on falls prevention, frailty, osteoporosis, mobility, balance and healthy aging strategies.",
    keywords: [
      "geriatric physiotherapy",
      "falls prevention",
      "frailty rehabilitation",
      "osteoporosis physiotherapy",
      "elderly mobility",
    ],
  },
  "womens-health": {
    title: "Women’s & Pelvic Health Physiotherapy Knowledge Hub | Pregnancy, Postpartum & Pelvic Rehab",
    description:
      "Women’s and pelvic health physiotherapy topics including pregnancy, postpartum recovery, pelvic floor rehabilitation and related clinical care.",
    keywords: [
      "pelvic health physiotherapy",
      "women’s health physiotherapy",
      "postpartum physiotherapy",
      "pregnancy physiotherapy",
      "pelvic floor rehabilitation",
    ],
  },
  "pain-science": {
    title: "Pain Science Physiotherapy Knowledge Hub | Mechanisms, Sensitization & Clinical Reasoning",
    description:
      "Pain science resources for physiotherapists: pain mechanisms, central sensitization, nociplastic pain, patient education and clinically useful reasoning frameworks.",
    keywords: [
      "pain science physiotherapy",
      "central sensitization",
      "nociplastic pain",
      "pain mechanisms",
      "pain education physiotherapy",
    ],
  },
  "exercise-rehab": {
    title: "Exercise & Rehabilitation Physiotherapy Knowledge Hub | Prescription, Progression & Planning",
    description:
      "Exercise prescription and rehabilitation planning library: mobility, strengthening, progression strategies and practical clinical frameworks.",
    keywords: [
      "exercise prescription physiotherapy",
      "rehabilitation planning",
      "strength training physiotherapy",
      "exercise progression",
      "clinical exercise",
    ],
  },
  research: {
    title: "Research & Evidence Physiotherapy Knowledge Hub | Methods, Appraisal & Outcome Measures",
    description:
      "Research and evidence resources for physiotherapy learners: research methods, critical appraisal, outcome measures and evidence-informed practice.",
    keywords: [
      "physiotherapy research",
      "evidence based physiotherapy",
      "critical appraisal",
      "outcome measures physiotherapy",
      "research methods physiotherapy",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const specialty = knowledgeSpecialties.find((item) => item.slug === slug);
  if (!specialty) return {};

  const seo = specialtySeo[slug] ?? {
    title: `${specialty.name} Physiotherapy Knowledge Hub`,
    description: specialty.description,
    keywords: [specialty.name, "physiotherapy", "clinical learning"],
  };

  const url = `https://physionexusacademy.com/knowledge-hub/specialty/${specialty.slug}`;

  return {
    title: {
      absolute: seo.title,
    },
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      type: "website",
      siteName: "Physio Nexus Academy",
      locale: "en_PK",
      images: [
        {
          url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
          width: 1200,
          height: 630,
          alt: `${specialty.name} Physiotherapy — Physio Nexus Academy`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["https://physionexusacademy.com/images/founder-dr-sajjad.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const specialty = knowledgeSpecialties.find((item) => item.slug === slug);
  if (!specialty) notFound();

  const articles = allKnowledgeArticles.filter((article) => article.specialty === specialty.name);
  const relatedCases = clinicalCases.filter((item) => {
    const left = item.specialty.toLowerCase();
    const right = specialty.name.toLowerCase();
    if (specialty.slug === "msk") return left.includes("musculoskeletal");
    if (specialty.slug === "neuro") return left.includes("neurological");
    if (specialty.slug === "cardio") return left.includes("cardiopulmonary");
    return left.includes(right.replace(" (msk)", ""));
  });

  const url = `https://physionexusacademy.com/knowledge-hub/specialty/${specialty.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://physionexusacademy.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Knowledge Hub",
        item: "https://physionexusacademy.com/knowledge-hub",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: specialty.name,
        item: url,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: specialty.name + " Physiotherapy Knowledge",
    description: specialty.description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Physio Nexus Academy",
      url: "https://physionexusacademy.com",
    },
    about: {
      "@type": "MedicalSpecialty",
      name: specialty.name,
    },
    publisher: {
      "@id": "https://physionexusacademy.com/#organization",
    },
  };

  return (
    <div className="container-content section-padding">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <a href="/knowledge-hub" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
        <ArrowLeft className="h-4 w-4" />All specialties
      </a>

      <header className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-7 ring-1 ring-grey-200 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Physiotherapy Specialty</p>
        <h1 className="mt-2 text-3xl font-bold text-navy-800 sm:text-4xl">{specialty.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-navy-600">{specialty.description}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-600 shadow-sm">
          <Layers3 className="h-4 w-4 text-teal-600" />
          {articles.length} learning {articles.length === 1 ? "article" : "articles"}
        </div>
      </header>

      {specialty.slug === "msk" ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">MSK Clinical Master Library</p>
          <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-navy-800">MSK Injury & Rehabilitation Library</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-navy-600">
                Open complete clinical guides for sprains, muscle strains, tendinopathies, tendon ruptures,
                arthritis, instability, nerve-compression disorders and other common musculoskeletal conditions.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-navy-600">
                {["Sprains", "Strains", "Tendinopathies", "Ruptures", "Arthritis", "Instability", "Nerve Compression"].map(
                  (label) => (
                    <span key={label} className="rounded-full border border-orange-100 bg-white px-3 py-1.5">
                      {label}
                    </span>
                  )
                )}
              </div>
            </div>
            <a
              href="/msk-injuries"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
            >
              Open MSK Clinical Library <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Study Library</p>
          <h2 className="mt-1 text-2xl font-bold text-navy-800">Choose a topic</h2>
        </div>
        {articles.length ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article, index) => {
              const level = article.level ?? "Clinical";
              const accents = [
                "from-cyan-50 to-white border-cyan-100",
                "from-amber-50 to-white border-amber-100",
                "from-violet-50 to-white border-violet-100",
                "from-emerald-50 to-white border-emerald-100",
              ];
              return (
                <a
                  key={article.slug}
                  href={"/knowledge-hub/" + article.slug}
                  className={
                    "group flex h-full flex-col rounded-3xl border bg-gradient-to-br p-6 transition hover:-translate-y-1 hover:shadow-lg " +
                    accents[index % accents.length]
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-teal-700">
                      {article.category}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy-600">
                      {level} Level
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold leading-snug text-navy-800">{article.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-navy-600">{article.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-400">
                      <Clock3 className="h-4 w-4" />
                      {article.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                      Study topic <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-grey-300 bg-grey-50 p-7 text-navy-600">
            This specialty is being expanded. New evidence-informed topics are added regularly.
          </div>
        )}
      </section>

      {relatedCases.length ? (
        <section className="mt-12 rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-800 p-7 text-white sm:p-9">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-7 w-7 text-violet-100" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-100">Apply What You Learned</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Related Clinical Cases</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {relatedCases.map((item) => (
              <a
                key={item.slug}
                href={"/case-lab/" + item.slug}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 transition hover:bg-white/15"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-violet-100">
                  {item.difficulty} · {item.estimatedTime}
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-indigo-50">{item.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                  Open case <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
