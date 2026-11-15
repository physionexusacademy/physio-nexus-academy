import { getMasteryGuide } from "@/lib/manual-therapy-mastery";
import { Ur } from "@/components/Ur";

/**
 * Concept-first lesson shown at the top of every manual therapy chapter.
 * Fixed order: what it is -> why it works -> words you need -> when/when not -> how -> dose
 * -> real example -> mistakes -> self-test -> recap -> evidence. Laid out as a guided lesson: a dark opening panel, a jump bar,
 * numbered sections with their own colour, a timeline for the steps and a one-line takeaway at the end.
 */
const SECTIONS: { id: string; en: string; ur: string }[] = [
  { id: "m-ideas", en: "The big ideas", ur: "Bunyadi ideas" },
  { id: "m-words", en: "Key words", ur: "Aham alfaaz" },
  { id: "m-when", en: "When to use it", ur: "Kab use karein" },
  { id: "m-steps", en: "Step by step", ur: "Qadam ba qadam" },
  { id: "m-dose", en: "How much", ur: "Kitna" },
  { id: "m-example", en: "Real example", ur: "Asal misal" },
  { id: "m-mistakes", en: "Mistakes", ur: "Ghaltiyan" },
  { id: "m-check", en: "Check yourself", ur: "Khud check karein" },
];

function Head({ n, id, en, ur, tone }: { n: number; id: string; en: string; ur: string; tone: string }) {
  return (
    <h3 id={id} className="flex scroll-mt-32 items-center gap-3 font-serif text-xl font-bold text-slate-900 sm:text-2xl">
      <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-sm font-extrabold text-white shadow-sm`}>{n}</span>
      <Ur en={en} ur={ur} />
    </h3>
  );
}

export function MasteryGuide({ slug }: { slug: string }) {
  const g = getMasteryGuide(slug);
  if (!g) return null;
  const hues = ["from-teal-500 to-cyan-500", "from-violet-500 to-indigo-500", "from-amber-500 to-orange-500"];

  return (
    <section id="mastery" data-pna-mastery="v1" className="mt-8 scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="nx-sky relative overflow-hidden p-6 text-white sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-cyan-300"><Ur en="Master it · Start here" ur="Master karein · Yahan se shuru" /></p>
        <h2 className="relative mt-2 font-serif text-2xl font-bold text-white sm:text-3xl"><Ur en="What it is, in plain words" ur="Yeh kya hai, seedhe alfaaz mein" /></h2>
        <p className="relative mt-4 max-w-4xl text-lg font-semibold leading-8 text-white">{g.oneLine}</p>
        <p className="relative mt-3 max-w-4xl text-[15px] leading-8 text-slate-100">{g.whatItIs}</p>
        <p className="relative mt-5 max-w-4xl rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-[15px] leading-7 text-amber-50">
          <span className="font-bold text-amber-200"><Ur en="Think of it like this: " ur="Aise socheein: " /></span>{g.analogy}
        </p>
        <nav className="relative mt-6 flex flex-wrap gap-2" aria-label="In this lesson">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20">
              <Ur en={section.en} ur={section.ur} />
            </a>
          ))}
        </nav>
      </div>

      <div className="space-y-10 p-6 sm:p-9">
        <div>
          <Head n={1} id="m-ideas" en="The big ideas behind it" ur="Iske peeche bunyadi ideas" tone="from-teal-500 to-cyan-500" />
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {g.coreIdeas.map((idea, i) => (
              <li key={idea} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${hues[i % 3]}`} aria-hidden="true" />
                <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${hues[i % 3]} text-sm font-extrabold text-white`}>{i + 1}</span>
                <p className="mt-3 text-[15px] leading-7 text-slate-800">{idea}</p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <Head n={2} id="m-words" en="Words you need (no dictionary required)" ur="Zaroori alfaaz (dictionary ki zaroorat nahi)" tone="from-violet-500 to-indigo-500" />
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {g.terms.map((t) => (
              <div key={t.term} className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-4">
                <dt className="text-sm font-extrabold text-indigo-900">{t.term}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-700">{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <Head n={3} id="m-when" en="When to use it, and when not to" ur="Kab use karein, kab nahi" tone="from-emerald-500 to-teal-500" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <p className="text-sm font-extrabold text-emerald-900"><Ur en="Good fit" ur="Munasib" /></p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-800">
                {g.whenToUse.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
              <p className="text-sm font-extrabold text-rose-900"><Ur en="Do not use, or get advice first" ur="Use na karein, ya pehle mashwara lein" /></p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-800">
                {g.whenNot.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <Head n={4} id="m-steps" en="How to do it, step by step" ur="Kaise karein, qadam ba qadam" tone="from-sky-500 to-blue-600" />
          <ol className="relative mt-5 space-y-4 border-l-2 border-sky-200 pl-7">
            {g.steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="absolute -left-[2.45rem] top-4 flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-extrabold text-white ring-4 ring-white">{i + 1}</span>
                <p className="text-sm font-extrabold text-sky-900">{s.title}</p>
                <p className="mt-1 text-[15px] leading-7 text-slate-700">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        <div id="m-dose" className="scroll-mt-32 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <Head n={5} id="m-dose-h" en="How much is enough?" ur="Kitna kaafi hai?" tone="from-blue-500 to-indigo-600" />
          <p className="mt-3 text-[15px] leading-7 text-slate-800">{g.dose}</p>
        </div>

        <div id="m-example" className="scroll-mt-32 rounded-2xl border border-violet-200 bg-violet-50/60 p-5 sm:p-6">
          <Head n={6} id="m-example-h" en="A real-life example, start to finish" ur="Ek asal zindagi ki misal, shuru se aakhir" tone="from-violet-500 to-fuchsia-500" />
          <p className="mt-1 text-xs text-slate-500"><Ur en="Fictional teaching case. Real patients always need individual assessment." ur="Farzi teaching case. Asal patients ka hamesha alag assessment zaroori hai." /></p>
          <dl className="mt-4 grid gap-3 text-[15px] leading-7 text-slate-800 sm:grid-cols-2">
            <div className="rounded-xl bg-white/80 p-3"><dt className="text-xs font-extrabold uppercase tracking-wide text-violet-900"><Ur en="The patient" ur="Patient" /></dt><dd>{g.example.patient}</dd></div>
            <div className="rounded-xl bg-white/80 p-3"><dt className="text-xs font-extrabold uppercase tracking-wide text-violet-900"><Ur en="What you find" ur="Aap kya paate hain" /></dt><dd>{g.example.assessment}</dd></div>
            <div className="rounded-xl bg-white/80 p-3"><dt className="text-xs font-extrabold uppercase tracking-wide text-violet-900"><Ur en="What you do" ur="Aap kya karte hain" /></dt><dd>{g.example.treatment}</dd></div>
            <div className="rounded-xl bg-white/80 p-3"><dt className="text-xs font-extrabold uppercase tracking-wide text-violet-900"><Ur en="What changed" ur="Kya badla" /></dt><dd>{g.example.reassess}</dd></div>
          </dl>
        </div>

        <div id="m-mistakes" className="scroll-mt-32 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <Head n={7} id="m-mistakes-h" en="Mistakes that spoil it" ur="Woh ghaltiyan jo bigaad deti hain" tone="from-amber-500 to-orange-500" />
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-slate-800">
            {g.mistakes.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>

        <div id="m-check" className="scroll-mt-32">
          <Head n={8} id="m-check-h" en="Check yourself" ur="Khud ko check karein" tone="from-pink-500 to-rose-500" />
          <div className="mt-4 space-y-3">
            {g.selfTest.map((t) => (
              <details key={t.q} className="group rounded-2xl border border-slate-200 bg-white p-4 open:border-pink-300 open:bg-pink-50/40">
                <summary className="cursor-pointer text-sm font-bold text-slate-900">{t.q}</summary>
                <p className="mt-3 border-t border-slate-100 pt-3 text-[15px] leading-7 text-slate-700">{t.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300"><Ur en="Remember this one line" ur="Yeh ek line yaad rakhein" /></p>
          <p className="mt-2 font-serif text-xl font-bold leading-8">{g.recap}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-700"><Ur en="What the research does and does not support" ur="Research kya support karti hai aur kya nahi" /></h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-700">{g.evidence}</p>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            <Ur en="Educational content. Hands-on skills require supervised practice, screening and informed consent." ur="Educational content. Hands-on skills ke liye supervised practice, screening aur informed consent zaroori hain." />
          </p>
        </div>
      </div>
    </section>
  );
}
