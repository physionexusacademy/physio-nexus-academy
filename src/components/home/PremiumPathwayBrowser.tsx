"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight, BookOpen, BrainCircuit, CalendarDays, ChevronRight,
  ClipboardList, Eye, FileBadge2, FlaskConical, Hand, HeartPulse,
  Home, LibraryBig, ShieldCheck, Stethoscope, Trophy, Users
} from "lucide-react";
import { PnaPathwayArtwork } from "./PnaPathwayArtwork";

const icons = {
  library: LibraryBig, eye: Eye, hand: Hand, clipboard: ClipboardList,
  book: BookOpen, brain: BrainCircuit, trophy: Trophy, calendar: CalendarDays,
  research: FlaskConical, people: Users, care: HeartPulse, shield: ShieldCheck,
  symptoms: Stethoscope, home: Home, certificate: FileBadge2,
} as const;

type IconKey = keyof typeof icons;
type GroupId = "learn" | "practice" | "professional" | "care";

const featureArt: Record<string, string> = {
  "/knowledge-hub": "knowledge-hub",
  "/clinical-visual-atlas": "clinical-visual-atlas",
  "/manual-therapy": "manual-therapy",
  "/treatment-plans": "treatment-plans",
  "/resources": "books-resources",
  "/daily-challenge": "daily-challenge",
  "/clinical-quiz": "weekly-quiz",
  "/case-lab": "clinical-case-lab",
  "/clinical-arena": "clinical-arena",
  "/workshops": "workshops-cpd",
  "/training": "training-archive",
  "/research": "research-support",
  "/faculty": "pna-faculty",
  "/symptom-checker": "msk-symptom-checker",
  "/patient-services": "appointment",
  "/appointment": "appointment",
  "/home-visit": "home-visit",
};

function FeatureArtwork({ href, title }: { href: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const name = featureArt[href];
  if (!name || failed) return null;
  return <span className="pna-sig-link-art" aria-hidden="true"><Image src={`/images/pathway-features/${name}.webp`} alt="" fill unoptimized sizes="(max-width: 640px) 110px, 160px" onError={() => setFailed(true)} /></span>;
}

type PortalLink = {
  title: string;
  description: string;
  href: string;
  icon: IconKey;
  featured?: boolean;
};

type Group = {
  id: GroupId;
  number: string;
  kicker: string;
  title: string;
  headline: string;
  description: string;
  links: PortalLink[];
};

const groups: Group[] = [
  {
    id: "learn", number: "01", kicker: "Understand deeply",
    title: "I’m a Student",
    headline: "Learn, practice and build clinical confidence.",
    description: "Explore learning resources, cases, quizzes and clinical skills.",
    links: [
      { title: "Knowledge Hub", description: "Study MSK, neuro, cardio, pediatrics, sports and more.", href: "/knowledge-hub", icon: "library", featured: true },
      { title: "Clinical Visual Atlas", description: "See clinical anatomy, pathology and rehabilitation visuals.", href: "/clinical-visual-atlas", icon: "eye" },
      { title: "Manual Therapy Mastery", description: "Approaches, hand placement, dosage, safety and reasoning.", href: "/manual-therapy", icon: "hand" },
      { title: "Treatment Plans", description: "Condition-based assessment and exercise progression.", href: "/treatment-plans", icon: "clipboard" },
      { title: "Books & Resources", description: "Practical physiotherapy books, PDFs and study materials.", href: "/resources", icon: "book" },
      { title: "Daily Clinical Challenge", description: "Practice with five clinical questions every day.", href: "/daily-challenge", icon: "trophy" },
      { title: "Weekly Clinical Quiz", description: "Timed clinical questions and weekly rankings.", href: "/clinical-quiz", icon: "trophy" },
      { title: "Clinical Case Lab", description: "Reason through realistic patient scenarios.", href: "/case-lab", icon: "clipboard" },
    ],
  },
  {
    id: "practice", number: "02", kicker: "Put thinking to work",
    title: "I’m a Physiotherapist",
    headline: "Strengthen your clinical decisions and hands-on skills.",
    description: "Advanced clinical learning, techniques and case-based reasoning.",
    links: [
      { title: "Manual Therapy Mastery", description: "Explore techniques, application, dosage and safety.", href: "/manual-therapy", icon: "hand", featured: true },
      { title: "Treatment Plans", description: "Assessment, management and rehabilitation progression.", href: "/treatment-plans", icon: "clipboard" },
      { title: "Knowledge Hub", description: "Evidence-informed specialty articles and clinical updates.", href: "/knowledge-hub", icon: "library" },
      { title: "Clinical Challenge Arena", description: "Take a history, consider differentials and plan care.", href: "/clinical-arena", icon: "brain" },
      { title: "Clinical Case Lab", description: "Work through symptoms and clinical reasoning step by step.", href: "/case-lab", icon: "clipboard" },
      { title: "Daily Clinical Challenge", description: "Five questions daily, points and public leaderboards.", href: "/daily-challenge", icon: "trophy" },
      { title: "Weekly Clinical Quiz", description: "Timed clinical questions and weekly rankings.", href: "/clinical-quiz", icon: "trophy" },
    ],
  },
  {
    id: "professional", number: "03", kicker: "Grow with purpose",
    title: "Workshops & Professional Growth",
    headline: "Learning that travels into practice.",
    description: "Hands-on skills, continuing professional development and research.",
    links: [
      { title: "Workshops & CPD", description: "Explore upcoming practical training opportunities.", href: "/workshops", icon: "calendar", featured: true },
      { title: "Training Archive", description: "Revisit previous workshops and learning activities.", href: "/training", icon: "book" },
      { title: "Research Support", description: "Study research methods and evidence-informed practice.", href: "/research", icon: "research" },
      { title: "Meet PNA Faculty", description: "Learn about the academy's clinical educators.", href: "/faculty", icon: "people" },
      { title: "Verify Certificate", description: "Verify your PNA workshop or training certificate.", href: "/verify", icon: "certificate" },
    ],
  },
  {
    id: "care", number: "04", kicker: "For patients & visitors",
    title: "I Need Physiotherapy",
    headline: "Clear next steps. Human-centered care.",
    description: "Explore your condition, find care and request an appointment.",
    links: [
      { title: "MSK Symptom Checker", description: "Screen possible patterns and identify safety warnings.", href: "/symptom-checker", icon: "symptoms", featured: true },
      { title: "Patient Care", description: "Explore physiotherapy services and appointment options.", href: "/patient-services", icon: "care" },
      { title: "Book an Appointment", description: "Request a physiotherapy consultation.", href: "/appointment", icon: "calendar" },
      { title: "Request a Home Visit", description: "Ask about physiotherapy where service is available.", href: "/home-visit", icon: "home" },

    ],
  },
];

export function PremiumPathwayBrowser({ showAtlas = true }: { showAtlas?: boolean }) {
  const [selected, setSelected] = useState<GroupId>("learn");
  const active = groups.find(group => group.id === selected) ?? groups[0];

  useEffect(() => {
    const fragment = window.location.hash.replace("#pna-zone-", "");
    if (groups.some(group => group.id === fragment)) setSelected(fragment as GroupId);
  }, []);

  const choose = (id: GroupId) => {
    setSelected(id);
    window.history.replaceState(null, "", "#pna-zone-" + id);
    // Let React render the selected panel before bringing it into view.
    window.requestAnimationFrame(() => {
      const target = document.getElementById("pna-pathway-details");
      if (!target) return;
      target.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  };

  return (
    <section id="explore-pna" data-pna-home-signature="v2" className="pna-sig-explore" aria-labelledby="pna-sig-heading">
      <div className="container-content">
        <div className="pna-sig-header">
          <div>
            <span className="pna-sig-overline">FOUR PATHWAYS · ONE ACADEMY</span>
            <h2 id="pna-sig-heading">Explore PNA</h2>
            <p>Choose where you want to begin. Everything you need is one tap away.</p>
          </div>
          <span className="pna-sig-header-aside"><ShieldCheck size={17} aria-hidden="true"/> Learn · Practice · Grow · Care</span>
        </div>

        <div className="pna-vision-pathways" role="group" aria-label="Choose a PNA pathway">
          {groups.map(group => (
            <button
              type="button"
              key={group.id}
              className={"pna-vision-pathway " + group.id + (selected === group.id ? " is-selected" : "")}
              onClick={() => choose(group.id)}
              aria-pressed={selected === group.id}
              aria-controls="pna-pathway-details"
            >
              <span className="pna-vision-pathway-num">{group.number}</span>
              <strong>{group.title}</strong>
              <span>{group.description}</span>
              <PnaPathwayArtwork kind={group.id} className="pna-vision-pathway-art" />
              <span className="pna-vision-pathway-state" aria-hidden="true">{selected === group.id ? "Selected" : "Explore"}</span>
              <span className="pna-vision-pathway-arrow"><ChevronRight size={18} aria-hidden="true"/></span>
            </button>
          ))}
        </div>

        <section id="pna-pathway-details" className={"pna-sig-detail pna-sig-detail-" + active.id}
          aria-labelledby="pna-sig-active-heading" aria-live="polite">
          <div className="pna-sig-detail-meta" aria-hidden="true"><span><span className="pna-sig-detail-meta-dot"/> SELECTED PATHWAY</span><strong>{active.number} / 04</strong></div>
          <div className="pna-sig-detail-head">
            <div className="pna-sig-detail-head-main">
              <span className="pna-sig-overline">{active.kicker}</span>
              <h3 id="pna-sig-active-heading">{active.title}</h3>
              <p className="pna-sig-detail-lead">{active.headline}</p>
              <p className="pna-sig-detail-description">{active.description}</p>
            </div>
            <PnaPathwayArtwork kind={active.id} className="pna-sig-detail-art" />
          </div>
          <div className="pna-sig-detail-grid">
            {active.links.filter(link => showAtlas || link.href !== "/clinical-visual-atlas").map(link => {
              const Icon = icons[link.icon];
              return (
                <a key={link.href} className={"pna-sig-link" + (link.featured ? " pna-sig-link-featured" : "")} href={link.href}>
                  <span className="pna-sig-link-icon"><Icon size={22} aria-hidden="true"/></span>
                  <span className="pna-sig-link-copy"><strong>{link.title}{link.featured && <em className="pna-sig-featured-tag">Featured</em>}</strong><span>{link.description}</span></span>
                  <FeatureArtwork href={link.href} title={link.title} />
                  <ArrowRight className="pna-sig-link-arrow" size={19} aria-hidden="true"/>
                </a>
              );
            })}
          </div>
          <p className="pna-sig-access-note">Looking for something else? Select another pathway above or use the search bar.</p>
        </section>
      </div>
    </section>
  );
}
