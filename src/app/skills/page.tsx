import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck, ClipboardCheck, Dumbbell, Layers, PersonStanding, Trophy } from "lucide-react";
import { NexusHero } from "@/components/nexus/NexusHero";
import { SkillIcon } from "@/components/skills/SkillIcon";
import { GuideMe } from "@/components/avatar/GuideMe";
import { SkillProgressBadge } from "@/components/skills/SkillProgressBadge";
import { skillIndex, skillPhases } from "@/lib/skills/catalog";

const url = "https://physionexusacademy.com/skills";

export const metadata: Metadata = {
  title: "Clinical Skills Lab — MMT, Goniometry & OSCE",
  description:
    "Practise MMT, goniometry, reflexes, dermatomes and more with 3D demos, quizzes and OSCE stations — beginner to expert, free at Physio Nexus Academy.",
  keywords: [
    "clinical skills lab physiotherapy",
    "MMT practice",
    "manual muscle testing physiotherapy",
    "goniometry practice",
    "neuro exam physiotherapy",
    "OSCE physiotherapy practice",
    "dermatomes myotomes",
    "physiotherapy clinical skills Pakistan",
    "DPT clinical skills",
    "physiotherapy OSCE stations",
    "clinical skills for physiotherapy students",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "Clinical Skills Lab — MMT, Goniometry & OSCE | PNA",
    description:
      "Practise MMT, goniometry, reflexes, dermatomes and more with 3D demos, quizzes and OSCE stations — beginner to expert, free at Physio Nexus Academy.",
    url,
    siteName: "Physio Nexus Academy",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://physionexusacademy.com/images/founder-dr-sajjad.jpg",
        width: 1200,
        height: 630,
        alt: "Clinical Skills Lab — Physio Nexus Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinical Skills Lab — MMT, Goniometry & OSCE | PNA",
    description:
      "Practise MMT, goniometry, reflexes, dermatomes and more with 3D demos, quizzes and OSCE stations — beginner to expert, free at Physio Nexus Academy.",
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

export default function SkillsHubPage() {
  const totals = skillIndex.reduce(
    (sum, skill) => ({ questions: sum.questions + skill.counts.questions, cards: sum.cards + skill.counts.cards, stations: sum.stations + skill.counts.stations }),
    { questions: 0, cards: 0, stations: 0 },
  );
  const steps = [
    { icon: BookOpenCheck, title: "Learn", text: "Short lessons with animated demonstrations, in English with Roman Urdu notes." },
    { icon: Dumbbell, title: "Practise", text: "Simulators — drag a goniometer, grade a muscle, find a dermatome — plus quick drills." },
    { icon: Layers, title: "Remember", text: "Spaced-repetition flashcards bring back what you keep missing." },
    { icon: Trophy, title: "Prove it", text: "Pass each level test at 80% to unlock the next: Beginner → Expert." },
    { icon: ClipboardCheck, title: "OSCE ready", text: "Timed stations with examiner checklists — practise with a partner." },
  ];

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Clinical Skills Lab",
    description: metadata.description,
    url,
    isPartOf: { "@type": "WebSite", name: "Physio Nexus Academy", url: "https://physionexusacademy.com" },
    about: { "@type": "Thing", name: "Physiotherapy clinical skills" },
    isAccessibleForFree: true,
    hasPart: skillIndex.map((skill) => ({
      "@type": "LearningResource",
      name: skill.title,
      description: skill.summary,
      url: `https://physionexusacademy.com/skills/${skill.slug}`,
      learningResourceType: "Clinical skill module",
      isAccessibleForFree: true,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://physionexusacademy.com" },
      { "@type": "ListItem", position: 2, name: "Clinical Skills Lab", item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <NexusHero
        kicker="Practise wing · Clinical Skills Lab"
        title={<>Clinical skills, <span className="nx-gradient-text">beginner to expert.</span></>}
        lead="The hands-on skills every DPT student must master — taught step by step with demonstrations, simulators, flashcards, level tests and OSCE stations. Your progress is saved privately on this device."
        crumbs={[{ label: "Practise", href: "/daily-challenge" }, { label: "Clinical Skills Lab" }]}
        actions={
          <>
            <a href="/skills/manual-muscle-testing" className="nx-btn nx-btn-primary">
              Start with MMT <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/skills/goniometry" className="nx-btn nx-btn-ghost">Goniometry</a>
          </>
        }
        stats={[
          { value: skillIndex.length, label: "clinical skills" },
          { value: totals.questions.toLocaleString("en"), label: "practice questions" },
          { value: totals.cards.toLocaleString("en"), label: "flashcards" },
          { value: totals.stations, label: "OSCE stations" },
        ]}
      />

      <div className="container-content section-padding !pt-10">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="How the Skills Lab works">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="rounded-3xl border border-slate-200 bg-white p-4">
                <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-700">
                  <Icon className="h-4 w-4" aria-hidden="true" /> {index + 1}. {step.title}
                </span>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </li>
            );
          })}
        </ol>

        <a href="/virtual-patient" className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl bg-[#0a1f3d] p-5 text-white shadow-[0_30px_70px_-45px_rgba(5,20,45,0.9)] sm:p-6" data-pna-skills-vp-link>
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-white/10">
            <PersonStanding className="h-6 w-6 text-[#2ee6d6]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-lg">Ready for a real patient? Try the Virtual Patient</strong>
            <span className="text-sm text-[#a9bfd6]">Put every skill together on a 3D patient with a hidden diagnosis — history, examination, diagnosis and an OSCE score.</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2ee6d6]">Enter the exam room <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </a>

        <div className="mt-6">
          <GuideMe />
        </div>

        {skillPhases.map((phase) => {
          const skills = skillIndex.filter((skill) => skill.phase === phase.id);
          if (!skills.length) return null;
          return (
            <section key={phase.id} className="mt-12" aria-labelledby={`phase-${phase.id}`}>
              <p className="nx-kicker nx-kicker-light">{phase.tagline}</p>
              <h2 id={`phase-${phase.id}`} className="nx-title mt-2 text-3xl text-navy-800">{phase.title}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => (
                  <a key={skill.slug} href={`/skills/${skill.slug}`} className="group nx-holo flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-50px_rgba(10,60,90,0.6)]" data-nx-reveal>
                    <span className="flex items-start justify-between gap-3">
                      <span className="nx-icon-tile">
                        <SkillIcon name={skill.icon} className="h-5 w-5" />
                      </span>
                      <SkillProgressBadge slug={skill.slug} />
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-navy-800 group-hover:text-teal-800">{skill.title}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">{skill.summary}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {skill.counts.atlas} {skill.atlasLabel.toLowerCase().replace(/ atlas$/, "")} items · {skill.counts.questions} questions · {skill.counts.cards} flashcards · {skill.counts.stations} OSCE
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700">
                      Open skill <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          );
        })}

        <p className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Demonstrations are animated illustrations for learning. Always practise hands-on techniques under supervision and follow your institution&apos;s protocols.
        </p>
      </div>
    </>
  );
}
