import Image from "next/image";
import { ArrowRight, BadgeCheck, Languages, Trophy } from "lucide-react";
import { lessonIndex, manualLessonMetas } from "@/lib/teacher/lesson-index";
import { LobbySearch } from "./LobbySearch";

/**
 * The academy lobby: the first thing a visitor sees. Dark night-sky campus,
 * the founder's approved portrait in a holographic frame, an "ask anything"
 * bar and live numbers from the academy's own content.
 */
export function LobbyHero({ atlasPublished, conditionCount }: { atlasPublished: boolean; conditionCount: number }) {
  const stats = [
    { value: lessonIndex.length, label: "step-by-step lessons" },
    { value: manualLessonMetas.length, label: "manual therapy techniques" },
    { value: conditionCount, label: "MSK conditions explained" },
    { value: "5", label: "daily challenge questions" },
  ];

  return (
    <section className="nx-sky nx-grid nx-stars lobby-hero" aria-labelledby="lobby-title">
      <div className="lobby-orbit lobby-orbit-a" aria-hidden="true" />
      <div className="lobby-orbit lobby-orbit-b" aria-hidden="true" />
      <div className="container-content lobby-hero-grid">
        <div className="lobby-copy">
          <p className="nx-kicker">
            <span className="nx-live" /> Physio Nexus Academy · Campus online
          </p>
          <h1 id="lobby-title" className="nx-title lobby-title">
            Clinical confidence <span className="nx-gradient-text">starts here.</span>
          </h1>
          <p className="nx-lead lobby-lead">
            Welcome to Pakistan&apos;s online physiotherapy academy. Learn hard concepts step by step, practise on real patient cases,
            and get expert care — in English or Roman Urdu.
          </p>

          <LobbySearch atlasPublished={atlasPublished} />

          <div className="lobby-actions">
            <a href="/learn" className="nx-btn nx-btn-primary">
              Start learning free <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/daily-challenge" className="nx-btn nx-btn-ghost">
              <Trophy className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /> Today&apos;s challenge
            </a>
            <a href="/patient-services" className="lobby-patient-link">
              I&apos;m a patient <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="lobby-founder">
          <div className="lobby-founder-frame">
            <Image
              src="/images/founder-dr-sajjad.jpg"
              alt="Dr. Sajjad Raza PT, founder of Physio Nexus Academy"
              width={960}
              height={1200}
              sizes="(max-width: 900px) 70vw, 400px"
              className="pna-hero-photo lobby-founder-photo"
              priority
            />
            <span className="lobby-scan" aria-hidden="true" />
          </div>
          <a href="/founder" className="nx-glass lobby-founder-id">
            <span className="nx-icon-tile !h-9 !w-9 !rounded-xl"><BadgeCheck className="h-4 w-4" aria-hidden="true" /></span>
            <span className="min-w-0">
              <strong>Dr. Sajjad Raza PT</strong>
              <small>Founder · Clinical educator</small>
            </span>
          </a>
          <div className="nx-glass lobby-founder-chip">
            <Languages className="h-4 w-4 text-[var(--nx-aqua)]" aria-hidden="true" />
            English + Roman Urdu
          </div>
        </div>
      </div>

      <div className="container-content">
        <dl className="lobby-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="nx-stat">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </dd>
            </div>
          ))}
          <div className="nx-stat lobby-cpd">
            <dt className="sr-only">Accreditation</dt>
            <dd>
              <strong className="nx-gradient-text">CPD</strong>
              <span>Approved CPD Provider · #791052</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
