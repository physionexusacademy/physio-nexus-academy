import Image from "next/image";
import { ArrowRight, BadgeCheck, Languages } from "lucide-react";
import { LobbySearch } from "./LobbySearch";

/**
 * The academy lobby: the first thing a visitor sees. Dark night-sky campus,
 * the founder's approved portrait in a holographic frame, an "ask anything"
 * bar. (The CPD approval lives in the site header.)
 */
export function LobbyHero({ atlasPublished }: { atlasPublished: boolean }) {
  return (
    <section className="nx-sky nx-grid nx-stars lobby-hero" aria-labelledby="lobby-title">
      <div className="lobby-orbit lobby-orbit-a" aria-hidden="true" />
      <div className="lobby-orbit lobby-orbit-b" aria-hidden="true" />
      <div className="container-content lobby-hero-grid">
        <div className="lobby-copy">
          <p className="nx-kicker">
            <span className="nx-live" /> Physio Nexus Academy · Pakistan&apos;s physiotherapy academy
          </p>
          <h1 id="lobby-title" className="nx-title lobby-title">
            Clinical confidence <span className="nx-gradient-text">starts here.</span>
          </h1>
          <p className="nx-lead lobby-lead">
            Free lessons, 3D practice patients, manual therapy, guided home rehab and books — everything a physiotherapy student,
            clinician or patient needs, in English and Roman Urdu.
          </p>

          <LobbySearch atlasPublished={atlasPublished} />

          <div className="lobby-actions">
            <a href="/learn" className="nx-btn nx-btn-primary">
              Start learning free <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#features" className="nx-btn nx-btn-ghost">
              See what you can do here
            </a>
            <a href="/patient-services" className="lobby-patient-link">
              I need physiotherapy <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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

    </section>
  );
}
