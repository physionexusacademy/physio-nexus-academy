"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Ruler } from "lucide-react";
import { SKILLS_EVENT, dueSkillCards, getSkillsDeck } from "@/lib/skills/progress";

type SkillRef = { slug: string; title: string };
type Row = SkillRef & { due: number; total: number };

/** Skills Lab flashcards on the main review page: what's due per skill, one tap to review it. */
export function SkillsReviewPanel({ skills }: { skills: SkillRef[] }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const deck = getSkillsDeck();
        const due = dueSkillCards(deck);
        setRows(
          skills
            .map((skill) => ({
              ...skill,
              due: due.filter((id) => deck[id]?.skill === skill.slug).length,
              total: Object.values(deck).filter((card) => card.skill === skill.slug).length,
            }))
            .filter((row) => row.total > 0)
            .sort((a, b) => b.due - a.due || b.total - a.total),
        );
      } catch {
        setRows([]);
      }
    };
    read();
    window.addEventListener(SKILLS_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SKILLS_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [skills]);

  const dueTotal = rows?.reduce((sum, row) => sum + row.due, 0) ?? 0;

  return (
    <section aria-labelledby="skills-review-title" className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6" data-pna-skills-review>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <Ruler className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="skills-review-title" className="text-lg font-bold text-navy-800">Clinical Skills Lab flashcards</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {rows === null
              ? "Checking your skills cards…"
              : rows.length === 0
                ? "MMT, goniometry, dermatomes, reflexes and more — every skill has flashcards from Beginner to Expert."
                : dueTotal > 0
                  ? `${dueTotal} skills card${dueTotal === 1 ? "" : "s"} due today.`
                  : "Nothing due today — open any skill to practise freely."}
          </p>
        </div>
      </div>
      {rows && rows.length > 0 ? (
        <ul className="mt-4 divide-y divide-slate-100">
          {rows.map((row) => (
            <li key={row.slug}>
              <a href={`/skills/${row.slug}?tab=flashcards`} className="flex items-center gap-3 py-3 text-sm hover:text-teal-700">
                <span className="min-w-0 flex-1 font-semibold text-navy-800">{row.title}</span>
                <span className={"rounded-full px-2.5 py-1 text-xs font-bold " + (row.due ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600")}>
                  {row.due ? `${row.due} due` : `${row.total} learnt`}
                </span>
                <ArrowRight className="h-4 w-4 flex-none text-slate-400" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <a href="/skills" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
        {rows && rows.length ? "All clinical skills" : "Start skills flashcards"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}
