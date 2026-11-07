import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FlashcardReview } from "@/components/teacher/FlashcardReview";
import { SkillsReviewPanel } from "@/components/skills/SkillsReviewPanel";
import { skillIndex } from "@/lib/skills/catalog";

export const metadata: Metadata = {
  title: "My Flashcards — Spaced Review | PNA Teacher",
  description: "Review the key facts from your PNA Teacher lessons and Clinical Skills Lab with spaced repetition.",
  alternates: { canonical: "https://physionexusacademy.com/learn/review" },
  robots: { index: false, follow: true },
};

export default function TeacherReviewPage() {
  return (
    <div className="container-content pb-16 pt-6 sm:pt-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> PNA Teacher
        </Link>
        <header className="mt-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">Spaced review</p>
          <h1 className="mt-1.5 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl">My flashcards</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Two minutes a day. Cards you know come back later; cards you miss come back sooner — so you remember them for good.
          </p>
        </header>
        <div className="mt-6">
          <FlashcardReview />
        </div>
        <div className="mt-8">
          <SkillsReviewPanel skills={skillIndex.map((skill) => ({ slug: skill.slug, title: skill.title }))} />
        </div>
      </div>
    </div>
  );
}
