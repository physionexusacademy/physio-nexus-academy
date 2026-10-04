import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  Bone,
  Eye,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AtlasExplorer from "@/components/clinical-atlas/AtlasExplorer";
import {
  atlasCategories,
  atlasRegions,
  atlasPublished,
  clinicalVisualAtlas,
} from "@/lib/clinical-visual-atlas";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "PNA Clinical Visual Atlas | 3D Physiotherapy Learning",
  description:
    "Explore premium clinical visuals connecting anatomy, pathology, assessment and rehabilitation across physiotherapy body regions.",
  alternates: {
    canonical: "https://physionexusacademy.com/clinical-visual-atlas",
  },
};

export default function ClinicalVisualAtlasPage() {
  if (!atlasPublished) notFound();

  const readyCount = clinicalVisualAtlas.filter((item) => item.assetReady).length;

  return (
    <div className="container-content section-padding">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy-900 via-navy-800 to-teal-800 p-7 text-white shadow-2xl sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
            <Sparkles className="h-4 w-4" />
            PNA Clinical Visual Atlas
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            See the anatomy. Understand the pathology. Apply it clinically.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-cyan-50 sm:text-lg">
            A lightweight 3D-first learning library that connects body structures with
            injury mechanisms, clinical assessment and rehabilitation — without loading
            heavy 3D engines on every page.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5 text-xs font-bold">
            {[
              "Anatomy",
              "Pathology",
              "Mechanisms",
              "Clinical tests",
              "Rehabilitation",
            ].map((item) => (
              <span key={item} className="rounded-full bg-white/10 px-3.5 py-2 text-cyan-50">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Layers,
            title: "Layer-based learning",
            text: "Move from bones and soft tissue to pathology and clinical meaning.",
          },
          {
            icon: Eye,
            title: "Visual before text",
            text: "One focused clinical concept per visual, with minimal label clutter.",
          },
          {
            icon: Gauge,
            title: "Fast by design",
            text: "Responsive ImageKit delivery, thumbnails and on-demand loading.",
          },
          {
            icon: ShieldCheck,
            title: "Clinically reviewed",
            text: "Visuals are checked for anatomy, biomechanics and misleading claims.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-3xl border border-grey-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-black text-navy-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-navy-600">{item.text}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-10 rounded-[2rem] border border-grey-200 bg-gradient-to-br from-grey-50 via-white to-cyan-50/40 p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
              Explore by region and clinical purpose
            </p>
            <h2 className="mt-2 text-2xl font-black text-navy-900 sm:text-3xl">
              Clinical visuals, connected to the rest of PNA
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-navy-500">
            <Bone className="h-4 w-4 text-cyan-600" />
            {clinicalVisualAtlas.length} mapped visuals
            {readyCount > 0 ? ` · ${readyCount} live` : ""}
          </div>
        </div>

        <div className="mt-6">
          <AtlasExplorer
            entries={clinicalVisualAtlas}
            regions={atlasRegions}
            categories={atlasCategories}
          />
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-6">
          <Bone className="h-6 w-6 text-cyan-700" />
          <h2 className="mt-3 text-xl font-black text-navy-900">
            Anatomy → condition → assessment
          </h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Visual entries link directly to the relevant MSK guide, treatment plan,
            manual-therapy page or case so students can move from seeing a structure to
            reasoning about it.
          </p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6">
          <Activity className="h-6 w-6 text-emerald-700" />
          <h2 className="mt-3 text-xl font-black text-navy-900">
            Premium without a heavy 3D runtime
          </h2>
          <p className="mt-2 text-sm leading-6 text-navy-600">
            Most interactions use optimized pre-rendered 3D images, image swapping and
            lightweight overlays. Real-time 3D can be reserved for selected flagship
            modules later.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm leading-6 text-navy-700">
          <strong>Educational use:</strong> visuals support learning and clinical
          reasoning. They do not replace individual assessment, diagnostic imaging or
          professional medical decision-making when those are indicated.
        </p>
      </section>
    </div>
  );
}
