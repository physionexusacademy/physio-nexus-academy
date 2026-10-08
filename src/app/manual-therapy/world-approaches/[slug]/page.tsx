import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { worldManualApproaches } from "@/lib/manual-therapy-world";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = false;

export function generateStaticParams() {
  return worldManualApproaches.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: { canonical: "https://physionexusacademy.com/manual-therapy/" + slug },
    robots: { index: false, follow: true },
  };
}

/** Preserve old URLs; all chapters now live in the same root library. */
export default async function LegacyWorldChapterRedirect({ params }: Props) {
  const { slug } = await params;
  redirect("/manual-therapy/" + slug);
}
