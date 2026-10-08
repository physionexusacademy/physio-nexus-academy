"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight, BookOpenCheck, BookOpenText, CheckCircle2,
  Compass, GraduationCap, Search, ShieldCheck, Sparkles,
  Stethoscope, X,
} from "lucide-react";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { getEditorialArt } from "@/lib/manual-therapy-editorial-art";
import { approvedManualAvifCards } from "@/lib/manual-therapy-avif-cards";

export type EncyclopediaItem = {
  slug: string;
  href: string;
  family: string;
  name: string;
  summary: string;
  tag: string;
  story: string;
  scene: string;
  closer: string;
  evidence: string;
};

function readableHook(item: EncyclopediaItem) {
  // The cinematic chapter itself retains its full case, humor and clinical content.
  const hook = item.story || item.summary || item.scene;
  return hook.length > 154 ? hook.slice(0, 151).trimEnd() + "…" : hook;
}

function Card({ item, index }: { item: EncyclopediaItem; index: number }) {
  const art = getEditorialArt(item.slug, item.family);
  const artUrl = approvedManualAvifCards[item.slug] ?? (
    art ? getCloudinaryUrl(art.publicId, { width: 560, quality: 64, format: "auto" }) : ""
  );
  const level = item.tag.toLowerCase();
  const tone = art?.tone === "teal" ? "teal" : "violet";

  return (
    <a
      href={item.href}
      data-pna-editorial-card={item.slug}
      data-tone={tone}
      className="pna-editorial-card group"
      aria-label={item.name + ". Explore the clinical story"}
    >
      {artUrl ? (
        <div className="pna-editorial-card-art" aria-hidden="true">
          {/* Lightweight approved AVIF for nine techniques, CDN-compressed illustration for remaining entries. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artUrl}
            loading="lazy"
            decoding="async"
            width="400"
            height="500"
            alt=""
            style={{ objectPosition: art?.position ?? "center" }}
          />
        </div>
      ) : (
        <div className="pna-editorial-card-art pna-editorial-card-art-empty" aria-hidden="true" />
      )}
      <span className="pna-editorial-card-number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="pna-editorial-card-content">
        <span className="pna-editorial-level" data-level={level}>
          {item.tag}
        </span>
        <h4 className="pna-editorial-card-title">{item.name}</h4>
        <p className="pna-editorial-card-hook">{readableHook(item)}</p>
        {item.evidence ? (
          <span className="pna-editorial-evidence">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Evidence notes inside
          </span>
        ) : null}
        <span className="pna-editorial-card-cta">
          Explore this story
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

export function EditorialManualEncyclopedia({
  items,
  families,
}: {
  items: EncyclopediaItem[];
  families: string[];
}) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All approaches");
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return items.filter((item) =>
      (family === "All approaches" || family === item.family) &&
      (!q || [item.name, item.family, item.tag, item.story, item.summary, item.scene, item.evidence]
        .some((value) => value.toLocaleLowerCase().includes(q)))
    );
  }, [items, query, family]);

  const familyGroups = families
    .map((name) => ({ name, results: filtered.filter((item) => item.family === name) }))
    .filter((group) => group.results.length > 0);
  const heroArt = getEditorialArt("maitland-joint-mobilization", "Spinal Mobilization");
  const heroUrl = heroArt ? getCloudinaryUrl(heroArt.publicId, { width: 840, quality: 70, format: "auto" }) : "";

  return (
    <div className="pna-editorial pb-12">
      <section
        data-pna-editorial-design="anatomy-luxe-v1"
        data-pna-content-revision="storytelling-v1"
        data-pna-library="unified-35-v1"
        className="pna-editorial-hero"
        aria-labelledby="pna-editorial-heading"
      >
        {heroUrl ? (
          <div className="pna-editorial-hero-art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} width="840" height="700" alt="" decoding="async" fetchPriority="high" />
          </div>
        ) : null}
        <div className="pna-editorial-hero-body">
          <p className="pna-editorial-eyebrow">
            <BookOpenText className="h-5 w-5" aria-hidden="true" />
            PNA Education
          </p>
          <h1 id="pna-editorial-heading" className="pna-editorial-title">
            World Manual Therapy Encyclopedia
          </h1>
          <p className="pna-editorial-lead">
            Trusted approaches. Memorable clinical stories. A deeper way to learn.
          </p>
          <div className="pna-editorial-stats" aria-label="Encyclopedia highlights">
            <span className="pna-editorial-stat"><BookOpenCheck className="h-4 w-4" aria-hidden="true" /> {items.length} clinical chapters</span>
            <span className="pna-editorial-stat"><Compass className="h-4 w-4" aria-hidden="true" /> {families.length} groups</span>
            <span className="pna-editorial-stat"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Evidence-aware</span>
          </div>
        </div>
      </section>

      <section aria-label="Find your manual therapy approach" className="pna-editorial-toolbar" id="encyclopedia-library">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet-700">Complete clinical library</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold leading-tight text-navy-900">
              Choose your next clinical mystery
            </h2>
          </div>
          <p aria-live="polite" className="text-xs font-semibold text-slate-600">
            {filtered.length} of {items.length} chapters
          </p>
        </div>
        <label className="pna-editorial-search mt-5">
          <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="sr-only">Search all manual therapy chapters</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Maitland, MFR, Mulligan, osteopathic..."
          />
          {query ? (
            <button onClick={() => setQuery("")} type="button" className="rounded-lg p-1 text-slate-500 hover:text-violet-700" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
        <div className="pna-editorial-filters" role="group" aria-label="Filter techniques by category">
          {["All approaches", ...families].map((name) => (
            <button
              key={name}
              type="button"
              className="pna-editorial-filter"
              aria-pressed={family === name}
              onClick={() => setFamily(name)}
            >
              {name === "All approaches" ? "All 35" : name}
            </button>
          ))}
        </div>
      </section>

      {familyGroups.length ? (
        <div>
          {familyGroups.map((group) => (
            <section key={group.name} className="pna-editorial-family" aria-label={group.name}>
              <div className="pna-editorial-family-heading">
                <div className="pna-editorial-family-symbol" aria-hidden="true">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="pna-editorial-family-title">{group.name}</h3>
                  <span className="pna-editorial-family-count">{group.results.length} approaches · Clinical story collection</span>
                </div>
              </div>
              <div className="pna-editorial-grid">
                {group.results.map((item, index) => <Card key={item.slug} item={item} index={index} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="pna-editorial-no-results mt-6" role="status">
          <p className="font-semibold text-navy-900">No chapters found for that search.</p>
          <p className="mt-2 text-sm text-slate-600">Try a simpler name, or choose All approaches.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setFamily("All approaches"); }}
            className="mt-4 rounded-full bg-violet-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Show all 35 chapters
          </button>
        </div>
      )}

      <section className="pna-editorial-intro" aria-label="Your learning journey">
        <div className="pna-editorial-intro-item">
          <strong><Sparkles className="mr-1 inline h-4 w-4 text-violet-600" aria-hidden="true" /> Laugh and remember</strong>
          Patient conversations, memorable Aha Moments and real-world clinical questions.
        </div>
        <div className="pna-editorial-intro-item">
          <strong><Stethoscope className="mr-1 inline h-4 w-4 text-cyan-700" aria-hidden="true" /> Learn and apply</strong>
          Clear mechanisms, assessment, practical reasoning and regional applications.
        </div>
        <div className="pna-editorial-intro-item">
          <strong><ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-700" aria-hidden="true" /> Think safely</strong>
          Evidence limitations, red flags and reassessment are always part of the lesson.
        </div>
      </section>

      <div className="pna-editorial-bottom">
        <a href="/manual-therapy/regions" className="group">
          <h2>Explore the Regional Encyclopedia <ArrowRight className="inline h-4 w-4 text-violet-600 group-hover:translate-x-1" aria-hidden="true" /></h2>
          <p>See how safe positioning, force direction, dosage and reassessment vary across body regions.</p>
        </a>
        <a href="/treatment-plans" className="group">
          <h2>Apply it in treatment plans <ArrowRight className="inline h-4 w-4 text-teal-700 group-hover:translate-x-1" aria-hidden="true" /></h2>
          <p>Connect the concepts to tailored exercises and rehabilitation progressions.</p>
        </a>
        <aside aria-label="Clinical safety notice">
          <h2>Clinical safety first</h2>
          <p>Educational content is not patient-specific advice. Manipulation, cervical and specialist techniques require screening, training and informed consent.</p>
        </aside>
      </div>
    </div>
  );
}
