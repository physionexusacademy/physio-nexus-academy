"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {BookOpen, CheckCircle2, Flame} from "lucide-react";
import {
  getDueReviews,
  getReviewQueue,
  markReviewed,
  type ReviewItem,
} from "@/lib/clinical-review-queue";

export function ReviewQueueCard({className = ""}: {className?: string}) {
  const [due, setDue] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [ready, setReady] = useState(false);

  const refresh = () => {
    setDue(getDueReviews().slice(0, 5));
    setTotal(getReviewQueue().length);
    setReady(true);
  };

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("pna-review-queue-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("pna-review-queue-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  if (!ready || (total === 0 && due.length === 0)) return null;

  return (
    <section
      className={`rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/40 p-4 shadow-sm sm:p-5 ${className}`}
      aria-label="Your clinical review queue"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white">
          <Flame className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal-700">
            Spaced review · local only
          </p>
          <h2 className="text-sm font-bold text-navy-800 sm:text-base">
            {due.length > 0
              ? `${due.length} item${due.length === 1 ? "" : "s"} due today`
              : `${total} saved for later review`}
          </h2>
        </div>
      </div>

      {due.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {due.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-50 bg-white px-3 py-2"
            >
              <Link
                href={item.href}
                className="min-w-0 flex-1 text-sm font-semibold text-teal-900 hover:underline"
              >
                <BookOpen className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                {item.title}
              </Link>
              <button
                type="button"
                onClick={() => {
                  markReviewed(item.id);
                  refresh();
                }}
                className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 transition hover:bg-teal-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Reviewed
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Nothing due right now. Keep learning — items return after 1, 3, 7, 14 then 30 days.
        </p>
      )}
    </section>
  );
}
