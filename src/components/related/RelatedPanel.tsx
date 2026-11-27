import { ArrowRight, BookOpen, FileText, Hand, Image as ImageIcon, Stethoscope } from "lucide-react";
import type { RelLink, RelatedFor } from "@/lib/related";

const GROUPS: { key: keyof RelatedFor; title: string; hint: string; Icon: typeof BookOpen }[] = [
  { key: "handouts", title: "Patient handout", hint: "Print it or send it, in English and Roman Urdu", Icon: FileText },
  { key: "atlas", title: "See it in the atlas", hint: "Labelled anatomy and pathology images", Icon: ImageIcon },
  { key: "lessons", title: "Learn it in PNA Teacher", hint: "Short lessons with checks and flashcards", Icon: BookOpen },
  { key: "skills", title: "Practise the exam", hint: "Skills Lab simulators and OSCE stations", Icon: Stethoscope },
  { key: "techniques", title: "Manual therapy for this area", hint: "Step-by-step technique guides", Icon: Hand },
];

/** "Keep going" panel on a condition guide: everything else on the site for this condition, rendered on the server so the links are in the HTML. */
export function RelatedPanel({ related, name }: { related: RelatedFor; name: string }) {
  const groups = GROUPS.filter((g) => related[g.key].length);
  if (!groups.length) return null;
  return (
    <section aria-labelledby="pna-related-h" className="mt-10 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-7" data-pna-related>
      <h2 id="pna-related-h" className="text-xl font-extrabold text-navy-800">More on {name} across PNA</h2>
      <p className="mt-1 text-sm text-slate-600">Handouts, images, lessons and hands-on practice for this condition.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {groups.map(({ key, title, hint, Icon }) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-2 font-bold text-navy-800"><Icon className="h-4 w-4 text-teal-700" aria-hidden="true" />{title}</h3>
            <p className="text-xs text-slate-500">{hint}</p>
            <LinkList links={related[key]} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LinkList({ links }: { links: RelLink[] }) {
  return (
    <ul className="mt-2.5 space-y-1">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} className="group flex items-start gap-1.5 rounded-lg px-1.5 py-1 text-sm font-semibold text-teal-800 hover:bg-teal-50 hover:underline">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden="true" />{l.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The way back: on a handout, atlas image, lesson, skill or technique page, the condition guides that use it. */
export function UsedInConditions({ links, title = "Conditions where this is used", className = "" }: { links: RelLink[]; title?: string; className?: string }) {
  if (!links.length) return null;
  return (
    <section aria-label={title} className={"rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 " + className} data-pna-used-in>
      <h2 className="text-base font-extrabold text-navy-800">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-navy-800 hover:border-teal-400 hover:bg-teal-50">
              {l.title} <ArrowRight className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
