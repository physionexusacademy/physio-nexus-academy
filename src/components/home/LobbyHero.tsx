import { Fragment, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { LobbySearch } from "./LobbySearch";
import "./home-hero.css";

/**
 * The academy lobby: the first thing a visitor sees. A dark night-sky campus with an animated "Welcome to Physio Nexus Academy",
 * the search and the first buttons. What the academy offers is shown right below (HomeFeatures and the sections after it).
 * The founder's portrait is in the Founder section further down. (The CPD approval lives in the site header.)
 *
 * Everything in the heading is plain text: the letters appear one after another with CSS only, and nothing waits for script.
 */

const BRAND = "Physio Nexus Academy";
const BRAND_WORDS = ["Physio", "Nexus", "Academy"];
const GRADIENT: [number, number, number][] = [
  [46, 230, 214],
  [60, 200, 255],
  [160, 141, 255],
];

/** A colour along the brand gradient, from 0 (aqua) to 1 (violet). */
function tint(t: number) {
  const scaled = t * (GRADIENT.length - 1);
  const at = Math.min(GRADIENT.length - 2, Math.floor(scaled));
  const f = scaled - at;
  const [r, g, b] = [0, 1, 2].map((k) => Math.round(GRADIENT[at][k] + (GRADIENT[at + 1][k] - GRADIENT[at][k]) * f));
  return `rgb(${r} ${g} ${b})`;
}

/**
 * One word as separate letters (each rises into place in turn). Hidden from screen readers: the heading carries the full text as its label.
 * With `tintCount`, the letters are coloured along the brand gradient (the first tinted letter is `tintStart`).
 */
function Word({ text, from, tintStart, tintCount }: { text: string; from: number; tintStart?: number; tintCount?: number }) {
  return (
    <span className="hw-word" aria-hidden="true">
      {Array.from(text).map((letter, i) => (
        <span
          key={i}
          className="hw-ch"
          style={{ "--i": from + i, ...(tintCount ? { color: tint((from + i - (tintStart ?? 0)) / Math.max(1, tintCount - 1)) } : {}) } as CSSProperties}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

export function LobbyHero({ atlasPublished }: { atlasPublished: boolean }) {
  const intro = "Welcome to".replace(" ", "").length; // letters that come first
  const letters = BRAND_WORDS.join("").length;
  let offset = intro;
  const brand = BRAND_WORDS.map((word, index) => {
    const from = offset;
    offset += word.length;
    return (
      <Fragment key={word}>
        {index > 0 && " "}
        <Word text={word} from={from} tintStart={intro} tintCount={letters} />
      </Fragment>
    );
  });

  return (
    <section className="nx-sky nx-grid nx-stars lobby-hero" aria-labelledby="lobby-title">
      <div className="lobby-orbit lobby-orbit-a" aria-hidden="true" />
      <div className="lobby-orbit lobby-orbit-b" aria-hidden="true" />
      <div className="container-content lobby-hero-grid">
        <div className="lobby-copy lobby-copy-top">
          <p className="nx-kicker">
            <span className="nx-live" /> Pakistan&apos;s physiotherapy academy
          </p>
          <h1 id="lobby-title" className="nx-title lobby-title hw" aria-label={`Welcome to ${BRAND}`}>
            <span className="hw-small">
              <Word text="Welcome" from={0} />
              {" "}
              <Word text="to" from={7} />
            </span>
            {" "}
            <span className="hw-big">{brand}</span>
            <span className="hw-beam" aria-hidden="true" />
          </h1>
          <p className="hw-tag">
            Clinical confidence <span className="nx-gradient-text">starts here.</span>
          </p>
          <p className="nx-lead lobby-lead">
            Free lessons, 3D practice patients, manual therapy, guided home rehab and books — everything a physiotherapy student,
            clinician or patient needs, in English and Roman Urdu.
          </p>
        </div>

        <div className="lobby-copy lobby-copy-bottom">
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
      </div>
    </section>
  );
}
