import { fitDescription, fitTitle } from "@/lib/seo/text";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NexusHero } from "@/components/nexus/NexusHero";
import { SkillLab } from "@/components/skills/SkillLab";
import { ArrowRight, PersonStanding } from "lucide-react";
import { getSkillEntry, skillIndex } from "@/lib/skills/catalog";
import { SKILL_CASES, vpCaseHref } from "@/lib/virtual-patient/links";

type PageProps = { params: Promise<{ slug: string }> };

// Rendered on demand on Cloudflare (no incremental cache); see /learn/[slug].
export const dynamicParams = true;

export function generateStaticParams() {
  return skillIndex.map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillEntry(slug);
  if (!skill) return {};
  return {
    title: `${fitTitle(skill.title, 40)} — Skills Lab`,
    description: fitDescription(`${skill.summary} Practise with simulators, ${skill.counts.questions} questions, ${skill.counts.cards} flashcards and OSCE stations.`),
    alternates: { canonical: `https://physionexusacademy.com/skills/${skill.slug}` },
  };
}

export default async function SkillPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = getSkillEntry(slug);
  if (!skill) notFound();
  const patients = SKILL_CASES[skill.slug] ?? [];

  return (
    <>
      <NexusHero
        kicker="Clinical Skills Lab"
        title={skill.title}
        lead={
          <>
            {skill.summary}
            <span className="mt-2 block text-sm text-[#a9bfd6]">
              <strong className="text-white">Roman Urdu:</strong> {skill.ur}
            </span>
          </>
        }
        crumbs={[{ label: "Practise", href: "/daily-challenge" }, { label: "Skills Lab", href: "/skills" }, { label: skill.short }]}
        stats={[
          { value: skill.counts.atlas, label: skill.atlasLabel.toLowerCase() + " items" },
          { value: skill.counts.questions, label: "practice questions" },
          { value: skill.counts.cards, label: "flashcards" },
          { value: skill.counts.stations, label: "OSCE stations" },
        ]}
      />
      <div data-pna-skill-page={skill.slug}>
        <SkillLab entry={skill} />
      </div>
      {patients.length ? (
        <section className="container-content pb-8" aria-labelledby="skill-patients" data-pna-skill-patients>
          <div className="rounded-3xl bg-[#0a1f3d] p-5 text-white sm:p-6">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#2ee6d6]">
              <PersonStanding className="h-4 w-4" aria-hidden="true" /> Use it on a patient
            </p>
            <h2 id="skill-patients" className="mt-2 text-xl font-bold">Practise {skill.short} on the Virtual Patient</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <li key={patient.id}>
                  <a href={vpCaseHref(patient.id)} className="flex h-full flex-col rounded-2xl bg-white/[0.07] p-4 transition hover:bg-white/[0.12]">
                    <strong className="text-[15px]">{patient.title}</strong>
                    <span className="mt-1 flex-1 text-[13px] leading-5 text-[#a9bfd6]">Practise {patient.why}.</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#2ee6d6]">See this patient <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <section className="container-content pb-16" aria-labelledby="skill-contents">
        <details className="rounded-3xl border border-slate-200 bg-white p-5">
          <summary id="skill-contents" className="cursor-pointer text-base font-bold text-navy-800">
            Everything in this skill ({skill.atlasTitles.length} items) and sources
          </summary>
          <ul className="mt-4 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
            {skill.atlasTitles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Sources</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
            {skill.sources.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </details>
      </section>
    </>
  );
}
