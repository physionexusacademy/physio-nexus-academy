"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Activity,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Search,
  Stethoscope,
  Trophy,
  Hand,
  Eye,
  LibraryBig,
  FlaskConical,
  FileBadge2,
  Sparkles,
} from "lucide-react";
import "@/app/pna-hero.css";

const destinations = [
  { title: "Knowledge Hub", description: "MSK, neurology, cardiopulmonary, sports and more", href: "/knowledge-hub", icon: LibraryBig },
  { title: "Clinical Visual Atlas", description: "Anatomy, pathology and visual learning", href: "/clinical-visual-atlas", icon: Eye },
  { title: "Manual Therapy Mastery", description: "Maitland, Mulligan and manual therapy", href: "/manual-therapy", icon: Hand },
  { title: "Treatment Plans", description: "Condition-based assessment and rehabilitation", href: "/treatment-plans", icon: ClipboardList },
  { title: "Clinical Challenge Arena", description: "Practice differential diagnosis and clinical decisions", href: "/clinical-arena", icon: BrainCircuit },
  { title: "Clinical Case Lab", description: "Clinical cases and treatment reasoning", href: "/case-lab", icon: Stethoscope },
  { title: "Daily Clinical Challenge", description: "Five clinical questions every day", href: "/daily-challenge", icon: Trophy },
  { title: "Weekly Clinical Quiz", description: "Timed questions and leaderboards", href: "/clinical-quiz", icon: CheckCircle2 },
  { title: "Workshops & CPD", description: "Hands-on physiotherapy training", href: "/workshops", icon: CalendarDays },
  { title: "Research Support", description: "Evidence and academic learning", href: "/research", icon: FlaskConical },
  { title: "Books & Resources", description: "Learning material and clinical books", href: "/resources", icon: BookOpen },
  { title: "MSK Symptom Checker", description: "Screen possible musculoskeletal symptom patterns", href: "/symptom-checker", icon: Stethoscope },
  { title: "BMI Calculator", description: "Calculate BMI with age-aware interpretation guidance", href: "/health-calculators/bmi", icon: Activity },
  { title: "Patient Care", description: "Appointments and physiotherapy services", href: "/patient-services", icon: HeartPulse },
  { title: "Verify Certificate", description: "Check a PNA verification ID", href: "/verify", icon: FileBadge2 },
  { title: "Book an Appointment", description: "Request a physiotherapy consultation", href: "/appointment", icon: CalendarDays },
  { title: "Request a Home Visit", description: "Physiotherapy support in eligible service areas", href: "/home-visit", icon: HeartPulse },
] as const;

export function PremiumHomeHero() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [] as (typeof destinations)[number][];
    return destinations
      .filter((item) => (item.title + " " + item.description).toLowerCase().includes(needle))
      .slice(0, 6);
  }, [query]);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results.length) window.location.assign(results[0].href);
  }

  return (
    <section className="pna-hero" aria-label="Welcome to Physio Nexus Academy">
      <div className="pna-hero-inner">
        {/* Main content + small corner photo */}
        <div className="pna-hero-main">
          <div className="pna-hero-content">
            <p className="pna-hero-kicker">
              <Sparkles size={14} aria-hidden="true" />
              Evidence · Experience · Excellence
            </p>

            <h1 className="pna-hero-title">
              Clinical Confidence
              <span>Starts Here</span>
            </h1>

            <p className="pna-hero-lead">
              Evidence-based learning. Real clinical skills. Built for Pakistan.
            </p>

            <div className="pna-hero-actions">
              <a href="#explore-pna" className="pna-hero-btn-primary">
                Start Exploring
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href="/founder" className="pna-hero-btn-secondary">
                Meet the Founder
              </a>
            </div>
          </div>

          {/* Small corner photo - your real photo, not forced */}
          <div className="pna-hero-corner-photo">
            <a href="/founder" aria-label="Meet Dr. Sajjad Raza PT">
              <Image
                src="/images/founder-dr-sajjad.jpg"
                alt="Dr. Sajjad Raza PT"
                width={280}
                height={340}
                priority
                className="pna-hero-photo"
              />
            </a>
          </div>
        </div>

        {/* 4 working buttons - keep as is */}
        <div className="pna-hero-quicklinks" aria-label="Quick actions">
          <a href="/appointment" className="pna-hero-ql">
            <CalendarDays size={20} aria-hidden="true" />
            <span>Book Physiotherapy Appointment</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a href="/workshops" className="pna-hero-ql">
            <Trophy size={20} aria-hidden="true" />
            <span>Register for Workshop</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a href="/knowledge-hub" className="pna-hero-ql">
            <LibraryBig size={20} aria-hidden="true" />
            <span>Knowledge Hub</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a href="/symptom-checker" className="pna-hero-ql">
            <Stethoscope size={20} aria-hidden="true" />
            <span>Symptoms Checker</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        {/* Search - keep as is */}
        <div className="pna-hero-search-block" id="explore-pna">
          <form className="pna-hero-search" role="search" onSubmit={onSearch}>
            <Search size={20} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Find a PNA feature"
              autoComplete="off"
              placeholder="Search topics, techniques, cases or services..."
            />
            <button type="submit" aria-label="Open first matching result">
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>

          {query.trim() && (
            <div className="pna-hero-results" role="listbox" aria-label="Matching features">
              {results.length ? (
                results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <a key={result.href} href={result.href}>
                      <Icon size={17} aria-hidden="true" />
                      <span>
                        <strong>{result.title}</strong>
                        <small>{result.description}</small>
                      </span>
                      <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  );
                })
              ) : (
                <p>No direct match. Try “manual therapy,” “case” or “workshop.”</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
