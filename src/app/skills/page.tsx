import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck, ClipboardCheck, Dumbbell, Layers, Trophy } from "lucide-react";
import { NexusHero } from "@/components/nexus/NexusHero";
import { SkillIcon } from "@/components/skills/SkillIcon";
import { SkillProgressBadge } from "@/components/skills/SkillProgressBadge";
import { skillIndex, skillPhases } from "@/lib/skills/catalog";

export const metadata: Metadata = {
  title: "Clinical Skills Lab — MMT, Goniometry & Neuro Exam Practice",
  description:
    "Master the clinical skills every DPT student must know — manual muscle testing, goniometry, dermatomes, myotomes, reflexes and more — from beginner to expert with demonstrations, simulators, flashcards, level tests and OSCE stations.",
  alternates: { canonical: "https://physionexusacademy.com/skills" },
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

  return (
    <>
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

        {skillPhases.map((phase) => {
          const skills = skillIndex.filter((skill) => skill.phase === phase.id);
          if (!skills.length) return null;
          return (
            <section key={phase.id} className="mt-12" aria-labelledby={`phase-${phase.id}`}>
              <p className="nx-kicker nx-kicker-light">{phase.tagline}</p>
              <h2 id={`phase-${phase.id}`} className="nx-title mt-2 text-3xl text-navy-800">{phase.title}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => (
                  <a key={skill.slug} href={`/skills/${skill.slug}`} className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-50px_rgba(10,60,90,0.6)]">
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
