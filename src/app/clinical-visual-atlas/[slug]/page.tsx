import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import ClinicalImage from "@/components/clinical/ClinicalImage";
import AtlasPlaceholder from "@/components/clinical-atlas/AtlasPlaceholder";
import {
  clinicalVisualAtlas,
  getAtlasEntry,
} from "@/lib/clinical-visual-atlas";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

export function generateStaticParams() {
  return clinicalVisualAtlas.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getAtlasEntry(slug);
  if (!item) return {};

  return {
    title: item.title + " | PNA Clinical Visual Atlas",
    description: item.summary,
    alternates: {
      canonical:
        "https://physionexusacademy.com/clinical-visual-atlas/" + item.slug,
    },
  };
}

export default async function ClinicalVisualDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getAtlasEntry(slug);
  if (!item) notFound();

  return (
    <div className="container-content section-padding">
      <Link
        href="/clinical-visual-atlas"
        className="inline-flex items-center gap-1.5 text-sm font-black text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Clinical Visual Atlas
      </Link>

      <section className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy-900 via-navy-800 to-teal-800 p-7 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
            {item.region}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
            {item.category}
          </span>
        </div>
        <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-50">
          {item.summary}
        </p>
      </section>

      <section className="mt-7">
        {item.assetReady && item.imagePath ? (
          <ClinicalImage
            path={item.imagePath}
            alt={item.title}
            label={item.category + " · " + item.region}
            caption={item.summary}
            eager
          />
        ) : (
          <AtlasPlaceholder category={item.category} title={item.title} />
        )}
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-grey-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-black text-navy-900">What to notice</h2>
          </div>
          <ul className="mt-5 space-y-4">
            {item.learningPoints.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-6 text-navy-600">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-teal-600" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <aside className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-black text-navy-900">Continue learning</h2>
          </div>
          <div className="mt-4 space-y-3">
            {item.relatedLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white p-4 text-sm font-black text-navy-800 transition hover:border-teal-200 hover:shadow-sm"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 flex-none text-teal-700 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
          <p className="text-sm leading-6 text-navy-700">
            The visual should be interpreted with the accompanying clinical context.
            PNA avoids using a single image or special test as stand-alone proof of a
            diagnosis.
          </p>
        </div>
      </section>
    </div>
  );
}
