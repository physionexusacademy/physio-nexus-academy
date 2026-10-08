import { BookOpenText, Brain, Lightbulb, ShieldAlert } from "lucide-react";
import { regionalLearningLabs } from "@/lib/manual-therapy-regional-learning-labs";

export function RegionalLearningLab({ slug }: { slug: string }) {
  const lab = regionalLearningLabs[slug];
  if (!lab) return null;

  return (
    <article data-pna-learning-depth="what-how-why-v1" className="mt-8 overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm">
      <header className="bg-gradient-to-r from-indigo-900 to-teal-900 p-6 text-white sm:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-100">
          <BookOpenText className="h-5 w-5" aria-hidden="true" /> Slow it down · Learn it so you can explain it
        </p>
        <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">{lab.topic}</h2>
        <p className="mt-4 max-w-3xl font-serif text-[16px] leading-8 text-indigo-50">{lab.scene}</p>
        <p className="mt-4 text-xs leading-6 text-indigo-100">Fictional teaching example. Precise hands-on performance requires trained supervision and patient-specific screening.</p>
      </header>
      <div className="p-6 sm:p-8">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-cyan-800">First, in very simple English</p>
          <p className="mt-2 text-[15px] leading-8 text-slate-800">{lab.plain}</p>
        </div>
        <div className="mt-8 space-y-4">
          {lab.stages.map((stage,index)=>(
            <section key={stage.title} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">{index+1}</span>
                <div>
                  <h3 className="font-serif text-lg font-bold leading-7 text-slate-900">{stage.title}</h3>
                  <p className="mt-3 text-[15px] leading-8 text-slate-700"><strong>What to notice or do:</strong> {stage.what}</p>
                  <p className="mt-3 rounded-xl bg-teal-50/80 px-4 py-3 text-[15px] leading-8 text-teal-950"><strong>Why it matters:</strong> {stage.why}</p>
                </div>
              </div>
              {index===2?(
                <p className="mt-5 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 font-serif text-[16px] italic leading-8 text-amber-950">
                  Hold that thought. The goal is not to make the move look fancy—it is to make the patient move better.
                </p>
              ):null}
            </section>
          ))}
        </div>
        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-900"><Lightbulb className="h-5 w-5"/> Memory spark</p>
          <p className="mt-3 font-serif text-lg font-semibold leading-8 text-slate-900">{lab.twist}</p>
        </div>
        <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-900"><Brain className="h-5 w-5"/> Wake your brain · Clinical challenge</p>
          <p className="mt-3 text-[15px] font-semibold leading-8 text-slate-900">{lab.test}</p>
          <details className="mt-4 rounded-xl border border-cyan-100 bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Think first, then check the answer</summary>
            <p className="mt-3 border-t border-slate-100 pt-3 text-[15px] leading-8 text-slate-700">{lab.answer}</p>
          </details>
        </div>
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-900"><ShieldAlert className="h-5 w-5"/> Safety comes before the funny parts</p>
          <p className="mt-3 text-[15px] leading-8 text-slate-800">{lab.safety}</p>
        </div>
      </div>
    </article>
  );
}