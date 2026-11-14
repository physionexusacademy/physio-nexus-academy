"use client";

/**
 * "Guide me": the homepage card where Dr. Sajjad (the AI teaching assistant) tours the academy and answers questions. The card itself is
 * light: a picture, two lines of text and a button. Nothing 3D is downloaded until the visitor starts the tour (and a hover, focus or
 * touch on the button warms the 3D code, so the tour opens quickly). Where 3D is not available the tour is a plain list of the same pages.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Compass, Play } from "lucide-react";
import { useLang } from "@/lib/lang";
import { AVATAR_LABEL, AVATAR_NOTICE } from "@/lib/avatar/labels";
import { plain } from "@/lib/avatar/text";
import type { BuiltChoreo } from "@/lib/avatar/choreo/built";
import "./guide-me.css";

const loadDemo = () => import("@/components/skills/Demo3D").then((module) => module.Demo3D);
const Demo3D = dynamic(loadDemo, {
  ssr: false,
  loading: () => <div className="gm-loading" role="status">Preparing the tour…</div>,
});

/** The topics Dr. Sajjad covers, in tour order (shown as small chips; each is a real page). */
const TOPICS: { label: string; href: string }[] = [
  { label: "PNA Teacher", href: "/learn" },
  { label: "Skills Lab", href: "/skills" },
  { label: "Virtual Patient", href: "/virtual-patient" },
  { label: "RehabVerse", href: "/rehabverse" },
  { label: "Manual Therapy", href: "/manual-therapy" },
  { label: "Conditions", href: "/conditions" },
  { label: "Daily Challenge", href: "/daily-challenge" },
];

/** The same tour as text, for browsers without WebGL and for anyone who prefers to read. */
function TourText() {
  const [lang] = useLang();
  const ur = lang === "ur";
  const [tour, setTour] = useState<BuiltChoreo | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/teacher/choreo/site-tour.json")
      .then((r) => r.json())
      .then((data: BuiltChoreo) => !cancelled && setTour(data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  if (!tour) return <p className="gm-note">Loading the tour…</p>;
  return (
    <ul className="gm-text">
      {tour.steps.map((step) => (
        <li key={step.chip}>
          <p className="gm-text-title">{step.link ? (ur ? step.link.label.ur : step.link.label.en) : step.chip}</p>
          <p className="gm-text-body">{plain(ur ? step.say[0].ur : step.say[0].en)}</p>
          {step.link ? <a href={step.link.href} className="gm-text-link">{ur ? "Kholein" : "Open"} →</a> : null}
        </li>
      ))}
    </ul>
  );
}

export function GuideMe() {
  const [open, setOpen] = useState(false);
  const [lang] = useLang();
  const ur = lang === "ur";
  const stage = useRef<HTMLDivElement>(null);
  // Bring the stage into view when it opens (the 3D view loads once it is in sight).
  useEffect(() => {
    if (open) stage.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }, [open]);
  const warm = () => void loadDemo();

  return (
    <section id="guide" className={`gm${open ? " gm-open" : ""}`} aria-labelledby="guide-me-title" data-guide-me>
      <div className="container-content">
        <div className="gm-card nx-sky nx-grid">
          <div className="gm-copy">
            <p className="gm-kicker"><Compass className="h-4 w-4" aria-hidden="true" /> {AVATAR_LABEL}</p>
            <h2 id="guide-me-title" className="gm-title">
              {ur ? "Guide me — Dr. Sajjad ke saath academy ka tour" : "Guide me — a tour of the academy with Dr. Sajjad"}
            </h2>
            <p className="gm-lead">
              {ur
                ? "Taqreeban 2 minute mein dekhein PNA mein kya kya hai — 3D demonstrations ke saath. Koi sawal ho to unse poochh bhi sakte hain."
                : "See what PNA offers in about two minutes, with short 3D demonstrations — then ask him anything about the academy."}
            </p>
            <ul className="gm-chips" aria-label={ur ? "Tour mein ye sab shamil hai" : "What the tour covers"}>
              {TOPICS.map((topic) => (
                <li key={topic.href}>
                  <a href={topic.href}>{topic.label}</a>
                </li>
              ))}
            </ul>
            {!open ? (
              <div className="gm-actions">
                <button type="button" className="gm-start" onClick={() => setOpen(true)} onPointerEnter={warm} onFocus={warm} onTouchStart={warm}>
                  <Play className="h-4 w-4" aria-hidden="true" /> {ur ? "Tour shuru karein" : "Start the tour"}
                </button>
                <span className="gm-hint">{ur ? "Free · koi sign-up nahin" : "Free · no sign-up"} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
              </div>
            ) : null}
          </div>
          {!open ? (
            <div className="gm-visual" aria-hidden="true">
              <span className="gm-ring gm-ring-a" />
              <span className="gm-ring gm-ring-b" />
              <img src="/teacher/dr-sajjad-poster.webp" alt="" width={410} height={547} loading="lazy" decoding="async" className="gm-poster" />
              <span className="gm-badge gm-badge-a">3D demos</span>
              <span className="gm-badge gm-badge-b">English · Roman Urdu</span>
              <span className="gm-badge gm-badge-c">Ask anything</span>
            </div>
          ) : null}
          {open ? (
            <div className="gm-stage" ref={stage}>
              <Demo3D demoKey="avatar/site-tour" title="Tour of Physio Nexus Academy" fallback={<TourText />} />
            </div>
          ) : null}
        </div>
        {!open ? <p className="gm-fine">{AVATAR_NOTICE}</p> : null}
      </div>
    </section>
  );
}
