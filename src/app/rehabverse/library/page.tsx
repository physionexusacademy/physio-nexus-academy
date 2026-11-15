import type { Metadata } from "next";
import { LibraryBrowser } from "@/components/rehabverse/LibraryBrowser";
import type { Region } from "@/lib/rehabverse/types";
import { REGIONS } from "@/lib/rehabverse/types";
import { REGION_COUNTS, REGION_PLAIN } from "@/lib/rehabverse/area-map";

export const metadata: Metadata = {
  title: "3D Rehab Exercise Library — RehabVerse",
  description:
    "Neck, back, shoulder, hip, knee and ankle rehab exercises performed in 3D by a virtual physiotherapist, with English and Roman Urdu instructions.",
  alternates: { canonical: "https://physionexusacademy.com/rehabverse/library" },
};

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ id?: string; region?: string; from?: string }> }) {
  const params = await searchParams;
  const region = REGIONS.includes(params.region as Region) ? (params.region as Region) : undefined;
  const source = { bodymap: "the body map", checker: "your symptom check", condition: "the condition guide" }[params.from ?? ""];
  return (
    <div className="container-content pb-16 pt-8 sm:pt-10">
      <p className="rv-h">PNA RehabVerse</p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-navy-800 sm:text-4xl">3D exercise library</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
        Watch the PNA virtual physiotherapist guide perform each exercise — correct start position, controlled movement, return, common mistakes and
        breathing — in English or Roman Urdu. These demonstrations are for learning. Which exercises suit <em>you</em> depends on your assessment, and your
        physiotherapist decides.
      </p>
      {region && source ? (
        <p className="mt-4 max-w-2xl rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-sm leading-6 text-teal-950">
          <strong>{REGION_PLAIN[region]} exercises ({REGION_COUNTS[region]})</strong>, chosen from {source}. Open one to watch it in 3D. Start with the beginner level, stop if pain
          increases, and have your problem assessed first if it is getting worse or comes with numbness, weakness or fever.
        </p>
      ) : null}
      <div className="mt-6">
        <LibraryBrowser initialId={params.id} initialRegion={region} />
      </div>
    </div>
  );
}
