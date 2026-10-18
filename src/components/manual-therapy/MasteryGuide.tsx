import { getMasteryGuide } from "@/lib/manual-therapy-mastery";

/**
 * Concept-first lesson shown at the top of every manual therapy chapter.
 * Fixed order: what it is -> why it works -> words you need -> when/when not -> how -> dose
 * -> real example -> mistakes -> self-test -> recap -> evidence.
 */
export function MasteryGuide({ slug }: { slug: string }) {
  const g = getMasteryGuide(slug);
  if (!g) return null;

  return (
    <section id="mastery" data-pna-mastery="v1" className="mt-8 scroll-mt-28 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
      <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-indigo-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Master it · Start here</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">What it is, in plain words</h2>
        <p className="mt-4 text-[17px] font-semibold leading-8 text-slate-900">{g.oneLine}</p>
        <p className="mt-3 text-[15px] leading-8 text-slate-700">{g.whatItIs}</p>
        <p className="mt-4 rounded-2xl border-l-4 border-amber-400 bg-white/80 p-4 text-[15px] leading-7 text-slate-800">
          <span className="font-bold">Think of it like this: </span>{g.analogy}
        </p>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">1. The three ideas behind it</h3>
          <ol className="mt-3 space-y-3">
            {g.coreIdeas.map((idea, i) => (
              <li key={idea} className="flex gap-3 text-[15px] leading-7 text-slate-700">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">{i + 1}</span>
                <span>{idea}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">2. Words you need (no dictionary required)</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {g.terms.map((t) => (
              <div key={t.term} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt className="text-sm font-bold text-indigo-900">{t.term}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-700">{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">3. When to use it, and when not to</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <p className="text-sm font-bold text-emerald-900">Good fit</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-800">
                {g.whenToUse.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
              <p className="text-sm font-bold text-rose-900">Do not use, or get advice first</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-800">
                {g.whenNot.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">4. How to do it, step by step</h3>
          <ol className="mt-3 space-y-3">
            {g.steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-teal-900">Step {i + 1} · {s.title}</p>
                <p className="mt-1 text-[15px] leading-7 text-slate-700">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
          <h3 className="font-serif text-xl font-bold text-slate-900">5. How much is enough?</h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-800">{g.dose}</p>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 sm:p-6">
          <h3 className="font-serif text-xl font-bold text-slate-900">6. A real-life example, start to finish</h3>
          <p className="mt-1 text-xs text-slate-500">Fictional teaching case. Real patients always need individual assessment.</p>
          <dl className="mt-4 space-y-3 text-[15px] leading-7 text-slate-800">
            <div><dt className="font-bold text-violet-900">The patient</dt><dd>{g.example.patient}</dd></div>
            <div><dt className="font-bold text-violet-900">What you find</dt><dd>{g.example.assessment}</dd></div>
            <div><dt className="font-bold text-violet-900">What you do</dt><dd>{g.example.treatment}</dd></div>
            <div><dt className="font-bold text-violet-900">What changed</dt><dd>{g.example.reassess}</dd></div>
          </dl>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <h3 className="font-serif text-xl font-bold text-slate-900">7. Mistakes that spoil it</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-slate-800">
            {g.mistakes.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">8. Check yourself</h3>
          <div className="mt-3 space-y-3">
            {g.selfTest.map((t) => (
              <details key={t.q} className="rounded-2xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-900">{t.q}</summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-[15px] leading-7 text-slate-700">{t.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Remember this one line</p>
          <p className="mt-2 font-serif text-xl font-bold leading-8">{g.recap}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-700">What the research does and does not support</h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-700">{g.evidence}</p>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            Educational content. Hands-on skills require supervised practice, screening and informed consent.
          </p>
        </div>
      </div>
    </section>
  );
}
