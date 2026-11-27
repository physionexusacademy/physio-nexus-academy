import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fitDescription } from "@/lib/seo/text";
import { handoutBySlug, handouts } from "@/lib/handouts";
import { HandoutSheet } from "../HandoutSheet";
import { conditionsLinkingTo } from "@/lib/related";
import { UsedInConditions } from "@/components/related/RelatedPanel";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return handouts.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const handout = handoutBySlug(slug);
  if (!handout) return {};
  const title = `${handout.title.en} | Patient Handout | PNA`;
  const description = fitDescription(`${handout.intro.en} A printable patient handout in English and Roman Urdu from Physio Nexus Academy.`);
  const url = `https://physionexusacademy.com/handouts/${handout.slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Physio Nexus Academy", type: "article", locale: "en_PK" },
  };
}

export default async function HandoutPage({ params }: PageProps) {
  const { slug } = await params;
  const handout = handoutBySlug(slug);
  if (!handout) notFound();
  return (
    <>
      <HandoutSheet handout={handout} />
      <div className="container-content pb-12" data-print-hide>
        <UsedInConditions links={conditionsLinkingTo(`/handouts/${handout.slug}`)} title="Read the full condition guide" />
      </div>
    </>
  );
}
