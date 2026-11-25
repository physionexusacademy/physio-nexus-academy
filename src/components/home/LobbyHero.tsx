import { Fragment, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { lessonCounts } from "@/lib/teacher/counts";
import { conditionCatalog } from "@/lib/conditions/catalog";
import { VP_CASE_COUNT } from "@/lib/virtual-patient/links";
import { LobbySearch } from "./LobbySearch";
import { HeroSlideshow, type HeroSlide } from "./HeroSlideshow";
import { sceneConditions, sceneDaily, sceneLeagues, sceneManual, sceneRehab, sceneSkills, sceneSymptom, sceneTeacher, sceneVirtual } from "./hero-scenes";
import "./home-hero.css";

/**
 * The academy lobby: the first thing a visitor sees. A dark night-sky campus with an animated "Welcome to Physio Nexus Academy"
 * and a slideshow of what the academy offers, one animated card per feature (HeroSlideshow). The founder's portrait is in the
 * Founder section further down. (The CPD approval lives in the site header.)
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
  const guides = conditionCatalog.length;
  const slides: HeroSlide[] = [
    {
      id: "teacher",
      href: "/learn",
      badge: "Learn · Free",
      title: "PNA Teacher",
      tag: "Hard concepts, explained like a great teacher would.",
      chips: [`${lessonCounts.lessons} lessons`, "English + Roman Urdu", "Quick checks"],
      cta: "Start learning",
      accent: "46 230 214",
      icon: "learn",
      scene: sceneTeacher(),
    },
    {
      id: "skills",
      href: "/skills",
      badge: "Practise · Free",
      title: "Clinical Skills Lab",
      tag: "Measure, test and examine like a clinician.",
      chips: ["Goniometry", "Muscle testing", "Four levels"],
      cta: "Open the Skills Lab",
      accent: "143 124 255",
      icon: "skills",
      scene: sceneSkills(),
    },
    {
      id: "virtual-patient",
      href: "/virtual-patient",
      badge: "Examine · Free",
      title: "Virtual Patient",
      tag: "A 3D patient. A hidden diagnosis. Your move.",
      chips: [`${VP_CASE_COUNT} patients`, "Guided or timed OSCE", "Red flags included"],
      cta: "Meet a patient",
      accent: "60 200 255",
      icon: "patient",
      scene: sceneVirtual(),
    },
    {
      id: "rehabverse",
      href: "/rehabverse",
      badge: "For patients · New",
      title: "PNA RehabVerse",
      tag: "Guided rehab at home, with a 3D physio guide.",
      chips: ["3D exercise library", "English + Roman Urdu", "Home programme"],
      cta: "Open RehabVerse",
      accent: "59 229 157",
      icon: "rehab",
      scene: sceneRehab(),
    },
    {
      id: "manual-therapy",
      href: "/manual-therapy",
      badge: "Technique · Free",
      title: "Manual Therapy",
      tag: `${lessonCounts.manual} technique lessons, with 3D demonstrations.`,
      chips: ["Step by step", "3D demonstrations", "English + Roman Urdu"],
      cta: "Explore techniques",
      accent: "255 198 92",
      icon: "manual",
      scene: sceneManual(),
    },
    {
      id: "daily-challenge",
      href: "/daily-challenge",
      badge: "Every day · Free",
      title: "Daily Clinical Challenge",
      tag: "Five questions. One streak. A new challenge every day.",
      chips: ["5 questions a day", "Live leaderboard", "Monthly champions"],
      cta: "Take today's challenge",
      accent: "255 122 162",
      icon: "daily",
      scene: sceneDaily(),
    },
    {
      id: "conditions",
      href: "/conditions",
      badge: "Reference · Free",
      title: "Conditions Guide",
      tag: "Clear guides with red flags, first steps and stage-based plans.",
      chips: [`${guides} guides`, "Three depth levels", "Stage-based plans"],
      cta: "Browse conditions",
      accent: "111 231 255",
      icon: "conditions",
      scene: sceneConditions(),
    },
    {
      id: "symptom-checker",
      href: "/symptom-checker",
      badge: "For patients · Free",
      title: "Symptom Checker",
      tag: "Not sure what is wrong? Find your next step.",
      chips: ["Neck to ankle", "Red-flag aware", "Plain language"],
      cta: "Check my symptoms",
      accent: "255 160 92",
      icon: "symptom",
      scene: sceneSymptom(),
    },
    {
      id: "leagues",
      href: "/leagues",
      badge: "Compete · Free",
      title: "Weekly Leagues",
      tag: "Earn XP and climb seven tiers, from Bronze to Diamond.",
      chips: ["Free weekly league", "XP from your learning", "Seven tiers"],
      cta: "Join a league",
      accent: "201 139 255",
      icon: "leagues",
      scene: sceneLeagues(),
    },
  ];

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

        <HeroSlideshow slides={slides} />

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
