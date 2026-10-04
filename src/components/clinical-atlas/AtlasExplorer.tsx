"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bone,
  Dumbbell,
  Search,
  Stethoscope,
} from "lucide-react";
import { getImageKitUrl } from "@/lib/imagekit";
import type {
  AtlasCategory,
  AtlasRegion,
  ClinicalVisualEntry,
} from "@/lib/clinical-visual-atlas";
import AtlasPlaceholder from "@/components/clinical-atlas/AtlasPlaceholder";

const categoryIcons = {
  Anatomy: Bone,
  Pathology: Activity,
  Mechanism: Search,
  Assessment: Stethoscope,
  Rehabilitation: Dumbbell,
} satisfies Record<AtlasCategory, typeof Bone>;

const categoryTone = {
  Anatomy: "bg-cyan-50 text-cyan-800 border-cyan-100",
  Pathology: "bg-rose-50 text-rose-800 border-rose-100",
  Mechanism: "bg-amber-50 text-amber-800 border-amber-100",
  Assessment: "bg-violet-50 text-violet-800 border-violet-100",
  Rehabilitation: "bg-emerald-50 text-emerald-800 border-emerald-100",
} satisfies Record<AtlasCategory, string>;

export default function AtlasExplorer({
  entries,
  regions,
  categories,
}: {
  entries: ClinicalVisualEntry[];
  regions: AtlasRegion[];
  categories: AtlasCategory[];
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<"All" | AtlasRegion>("All");
  const [category, setCategory] = useState<"All" | AtlasCategory>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesRegion = region === "All" || entry.region === region;
      const matchesCategory = category === "All" || entry.category === category;
      const haystack = [
        entry.title,
        entry.shortTitle,
        entry.region,
        entry.category,
        entry.summary,
        ...entry.learningPoints,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesRegion && matchesCategory && matchesQuery;
    });
  }, [entries, query, region, category]);

  return (
    <div>
      <div className="rounded-3xl border border-grey-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search anatomy, condition, test or rehabilitation..."
            className="w-full rounded-2xl border border-grey-200 bg-grey-50 py-3.5 pl-12 pr-4 text-sm text-navy-800 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-100"
            aria-label="Search clinical visual atlas"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRegion("All")}
            className={
              "rounded-full border px-3.5 py-2 text-xs font-bold transition " +
              (region === "All"
                ? "border-navy-800 bg-navy-800 text-white"
                : "border-grey-200 bg-white text-navy-600 hover:border-navy-300")
            }
          >
            All regions
          </button>
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={
                "rounded-full border px-3.5 py-2 text-xs font-bold transition " +
                (region === item
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-grey-200 bg-white text-navy-600 hover:border-navy-300")
              }
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("All")}
            className={
              "rounded-full border px-3.5 py-2 text-xs font-bold transition " +
              (category === "All"
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-grey-200 bg-white text-navy-600 hover:border-teal-300")
            }
          >
            All visual types
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={
                "rounded-full border px-3.5 py-2 text-xs font-bold transition " +
                (category === item
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-grey-200 bg-white text-navy-600 hover:border-teal-300")
              }
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-navy-700">
          {filtered.length} visual{filtered.length === 1 ? "" : "s"}
        </p>
        <p className="text-xs text-navy-400">Lazy-loaded · ImageKit optimized</p>
      </div>

      {filtered.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => {
            const Icon = categoryIcons[entry.category];
            const imageSrc =
              entry.assetReady && entry.thumbnailPath
                ? getImageKitUrl(entry.thumbnailPath, { width: 720, quality: 78 })
                : "";

            return (
              <Link
                key={entry.slug}
                href={"/clinical-visual-atlas/" + entry.slug}
                className="group overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
              >
                <div className="p-3 pb-0">
                  {imageSrc ? (
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-grey-50">
                      <img
                        src={imageSrc}
                        alt={entry.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <AtlasPlaceholder
                      category={entry.category}
                      title={entry.shortTitle}
                      compact
                    />
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide " +
                        categoryTone[entry.category]
                      }
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {entry.category}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-navy-400">
                      {entry.region}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-black leading-snug text-navy-900">
                    {entry.shortTitle}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy-600">
                    {entry.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-teal-700">
                    Explore visual
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-grey-300 bg-grey-50 p-10 text-center">
          <p className="font-bold text-navy-800">No matching visual found.</p>
          <p className="mt-2 text-sm text-navy-500">
            Try a broader search or clear one of the filters.
          </p>
        </div>
      )}
    </div>
  );
}
