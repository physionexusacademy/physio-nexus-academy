"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { BiText, TeacherLang } from "@/lib/teacher/types";
import { cn } from "@/lib/utils";
import { pick } from "./ui";

export function SortActivity({
  categories,
  items,
  lang,
  revealAll = false,
  onDone,
}: {
  categories: [BiText, BiText];
  items: { text: BiText; answer: 0 | 1; why: BiText }[];
  lang: TeacherLang;
  revealAll?: boolean;
  onDone: (correct: number, total: number) => void;
}) {
  const [choices, setChoices] = useState<Record<number, 0 | 1>>({});
  const [reported, setReported] = useState(false);

  function choose(index: number, value: 0 | 1) {
    if (choices[index] !== undefined || revealAll) return;
    const next = { ...choices, [index]: value };
    setChoices(next);
    if (!reported && Object.keys(next).length === items.length) {
      setReported(true);
      const correct = items.filter((item, i) => next[i] === item.answer).length;
      onDone(correct, items.length);
    }
  }

  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, index) => {
        const chosen = revealAll ? item.answer : choices[index];
        const answered = chosen !== undefined;
        const right = answered && chosen === item.answer;
        return (
          <li
            key={item.text.en}
            className={cn(
              "rounded-xl border px-3 py-2.5 transition",
              !answered && "border-slate-200 bg-white",
              answered && right && "border-emerald-200 bg-emerald-50/70",
              answered && !right && "border-amber-300 bg-amber-50",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-bold text-navy-800">
                {answered ? (
                  right ? (
                    <CheckCircle2 className="h-4 w-4 flex-none text-emerald-600" aria-label="Correct" />
                  ) : (
                    <XCircle className="h-4 w-4 flex-none text-amber-600" aria-label="Not quite" />
                  )
                ) : null}
                {pick(item.text, lang)}
              </p>
              {answered ? (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-teal-800">{pick(categories[item.answer], lang)}</span>
              ) : (
                <span className="flex gap-1.5">
                  {categories.map((category, value) => (
                    <button
                      key={category.en}
                      type="button"
                      onClick={() => choose(index, value as 0 | 1)}
                      className="min-h-9 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 transition hover:border-teal-500 hover:bg-teal-50"
                    >
                      {pick(category, lang)}
                    </button>
                  ))}
                </span>
              )}
            </div>
            {answered ? <p className="mt-1 text-xs leading-5 text-slate-600">{pick(item.why, lang)}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
