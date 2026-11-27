import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fitDescription, fitTitle } from "@/lib/seo/text";
import foundations from "@/lib/conditions/generated/foundations.json";
import type { FoundationDetail, FoundationItem } from "@/lib/conditions/types";
import { VOLUMES } from "@/lib/conditions/book-types";
import { BookGuide } from "../../BookGuide";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

type PageProps = { params: Promise<{ slug: string }> };
const shelf = foundations as FoundationItem[];
const url = (slug: string) => `https://physionexusacademy.com/conditions/foundations/${slug}`;

/** The chapter text, read from public/conditions-data/foundations at build time (kept out of the Cloudflare worker). */
async function readDetail(slug: string): Promise<FoundationDetail | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "public", "conditions-data", "foundations", `${slug}.json`), "utf8")) as FoundationDetail;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return shelf.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = shelf.find((f) => f.slug === slug);
  if (!item) return {};
  const title = fitTitle(item.title, 54);
  return {
    title: { absolute: `${title} | PNA` },
    description: fitDescription(item.lead, "A Clinical Foundations chapter of The Complete Physiotherapy Clinical Mastery."),
    alternates: { canonical: url(item.slug) },
    openGraph: { title, description: item.lead, url: url(item.slug), siteName: "Physio Nexus Academy", type: "article", locale: "en_PK" },
  };
}

export default async function FoundationPage({ params }: PageProps) {
  const { slug } = await params;
  const item = shelf.find((f) => f.slug === slug);
  if (!item) notFound();
  const detail = await readDetail(item.slug);
  if (!detail) notFound();
  const i = shelf.findIndex((f) => f.slug === item.slug);
  const prev = shelf[i - 1];
  const next = shelf[i + 1];
  return (
    <div className="container-content section-padding">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm font-semibold text-slate-600">
        <a href="/conditions/foundations" className="text-teal-800 hover:underline">← Clinical Foundations</a>
      </nav>
      <BookGuide
        chapter={detail.book}
        help={detail.help ?? null}
        chips={[{ label: "Clinical Foundations", href: "/conditions/foundations" }, { label: VOLUMES[item.vol] }]}
        backHref="/conditions/foundations"
        backLabel="Clinical Foundations"
        footer={
          <nav key="foundation-footer" aria-label="More foundation chapters" className="grid gap-2 pt-2 sm:grid-cols-2">
            {prev ? <a href={`/conditions/foundations/${prev.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-navy-800 hover:border-teal-300"><span className="block text-xs font-semibold text-slate-500">← Previous</span>{prev.title}</a> : <span />}
            {next ? <a href={`/conditions/foundations/${next.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 text-right text-sm font-bold text-navy-800 hover:border-teal-300"><span className="block text-xs font-semibold text-slate-500">Next →</span>{next.title}</a> : null}
          </nav>
        }
      />
    </div>
  );
}
