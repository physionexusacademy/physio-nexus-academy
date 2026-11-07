import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NexusHero } from "@/components/nexus/NexusHero";
import { SkillLab } from "@/components/skills/SkillLab";
import { getSkillEntry, skillIndex } from "@/lib/skills/catalog";

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
    title: `${skill.title} — Beginner to Expert | Clinical Skills Lab`,
    description: `${skill.summary} Practise with simulators, ${skill.counts.questions} questions, ${skill.counts.cards} flashcards and OSCE stations.`,
    alternates: { canonical: `https://physionexusacademy.com/skills/${skill.slug}` },
  };
}

export default async function SkillPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = getSkillEntry(slug);
  if (!skill) notFound();

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
