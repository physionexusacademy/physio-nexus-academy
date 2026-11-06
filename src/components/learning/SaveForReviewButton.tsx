"use client";

import {useState} from "react";
import {BookmarkPlus,Check} from "lucide-react";
import {queueForReview} from "@/lib/clinical-review-queue";

export function SaveForReviewButton({
  id,
  title,
  href,
  source = "case-lab",
}: {
  id: string;
  title: string;
  href: string;
  source?: "case-lab" | "daily-challenge" | "stupid-intern" | "knowledge-hub";
}) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        queueForReview({id, title, href, source});
        setSaved(true);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 transition hover:border-teal-400 hover:bg-teal-50"
    >
      {saved ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Saved for review
        </>
      ) : (
        <>
          <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" /> Save for spaced review
        </>
      )}
    </button>
  );
}
