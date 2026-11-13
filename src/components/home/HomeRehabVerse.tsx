import { ArrowRight, Sparkles } from "lucide-react";
import "./home-rehabverse.css";

/**
 * Homepage feature for PNA RehabVerse: what it is, how to start (create an account first), and a
 * look at the 3D guide. Server-rendered, no JavaScript. The picture is a still from the guide's own
 * 3D demonstration, so the homepage does not load the 3D engine.
 */
const steps = [
  "Create your account — one minute, with a clear consent step.",
  "Answer a few simple questions about your pain, plus safety questions.",
  "Your physiotherapist reviews them and builds your own programme.",
  "Follow Day 1 with 3D demos, give feedback, and the next day opens safely.",
];

export function HomeRehabVerse() {
  return (
    <section className="container-content home-rv" data-pna-home-feature="rehabverse-v1" aria-labelledby="home-rv-title">
      <div className="nx-sky nx-grid home-rv-card">
        <div className="home-rv-copy">
          <p className="nx-kicker"><Sparkles className="h-4 w-4" aria-hidden="true" /> New · PNA RehabVerse</p>
          <h2 id="home-rv-title" className="nx-title mt-3 text-3xl text-white sm:text-4xl">Guided rehab at home, with a 3D physio guide.</h2>
          <p className="nx-lead mt-3 max-w-xl text-sm sm:text-base">
            A physiotherapist-approved exercise programme made for you — every exercise shown in 3D, in English or Roman Urdu. Ghar par rehab, step by step.
          </p>
          <ol className="home-rv-steps" aria-label="How RehabVerse works">
            {steps.map((text, index) => (
              <li key={text}><b aria-hidden="true">{index + 1}</b><span>{text}</span></li>
            ))}
          </ol>
          <div className="home-rv-cta">
            <a href="/rehabverse/register" className="nx-btn nx-btn-primary">Create your account <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            <a href="/rehabverse/login" className="nx-btn nx-btn-ghost">I already have an account</a>
            <a href="/rehabverse/library" className="home-rv-link">Browse the 3D exercise library</a>
          </div>
        </div>
        <figure className="home-rv-figure">
          <img src="/images/rehabverse-guide.webp" width={800} height={500} loading="lazy" decoding="async" alt="The PNA virtual physio guide demonstrating a bird-dog exercise in 3D" />
          <figcaption>Virtual guide — not a real clinician. Your physiotherapist reviews and approves everything. RehabVerse supports your care; it is not for emergencies.</figcaption>
        </figure>
      </div>
    </section>
  );
}
