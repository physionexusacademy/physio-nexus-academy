import type { Metadata } from "next";
import { LibraryBrowser } from "@/components/rehabverse/LibraryBrowser";
import type { Region } from "@/lib/rehabverse/types";
import { REGIONS } from "@/lib/rehabverse/types";

export const metadata: Metadata = {
  title: "3D Exercise Library",
  description:
    "Rehabilitation exercises for the neck, back, shoulder, hand, hip, knee and ankle — each performed in 3D by a virtual physiotherapist guide, with English and Roman Urdu instructions.",
  alternates: { canonical: "https://physionexusacademy.com/rehabverse/library" },
};

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ id?: string; region?: string }> }) {
  const params = await searchParams;
  const region = REGIONS.includes(params.region as Region) ? (params.region as Region) : undefined;
  return (
    <div className="container-content pb-16 pt-8 sm:pt-10">
      <p className="rv-h">PNA RehabVerse</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-navy-800 sm:text-4xl">3D exercise library</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
        Watch the PNA virtual physiotherapist guide perform each exercise — correct start position, controlled movement, return, common mistakes and
        breathing — in English or Roman Urdu. These demonstrations are for learning. Which exercises suit <em>you</em> depends on your assessment, and your
        physiotherapist decides.
      </p>
      <div className="mt-6">
        <LibraryBrowser initialId={params.id} initialRegion={region} />
      </div>
    </div>
  );
}
