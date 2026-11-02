import { Brain, Lightbulb, Sparkles } from "lucide-react";
import { coreAttentionCues } from "@/lib/manual-therapy-attention-cues";

type CueProps = { slug: string; moment: "wake" | "think" | "remember" };

export function AttentionReset({ slug, moment }: CueProps) {
  const cue = coreAttentionCues[slug];
  if (!cue) return null;
  if (moment === "wake") {
    return (
      <aside data-pna-attention="wake-v1" className="my-6 rounded-2xl border border-amber-200 bg-amber-50/75 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-900">
          <Sparkles className="h-5 w-5" aria-hidden="true" /> Wake-up call · The part you will remember
        </p>
        <p className="mt-3 font-serif text-lg font-semibold leading-8 text-slate-900">{cue.wake}</p>
        <p className="mt-4 border-l-[3px] border-amber-400 pl-4 text-[15px] leading-8 text-slate-700">
          <strong>In easy English:</strong> {cue.easy}
        </p>
      </aside>
    );
  }
  if (moment === "think") {
    return (
      <aside data-pna-attention="think-v1" className="my-7 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-900">
          <Brain className="h-5 w-5" aria-hidden="true" /> Brain check · No peeking first!
        </p>
        <p className="mt-3 text-[16px] font-semibold leading-8 text-slate-900">{cue.question}</p>
        <details className="mt-4 rounded-xl border border-cyan-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            I have made my choice · Show the reasoning
          </summary>
          <p className="mt-3 border-t border-slate-100 pt-3 text-[15px] leading-8 text-slate-700">{cue.answer}</p>
        </details>
      </aside>
    );
  }
  return (
    <aside data-pna-attention="remember-v1" className="my-6 flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 px-5 py-5">
      <Lightbulb className="mt-1 h-5 w-5 flex-none text-indigo-700" aria-hidden="true"/>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-800">Take-home memory line</p>
        <p className="mt-2 font-serif text-[17px] font-semibold leading-8 text-slate-800">{cue.remember}</p>
      </div>
    </aside>
  );
}

/** A region-specific thought check, never an instruction to ignore individual screening. */
export function RegionalAttentionReset({
  techniqueSlug, region, comparableSign, simpleStory,
}: {
  techniqueSlug: string;
  region: string;
  comparableSign: string;
  simpleStory?: string;
}) {
  const cue = coreAttentionCues[techniqueSlug];
  if (!cue) return null;
  return (
    <aside data-pna-attention="regional-brain-v1" className="my-8 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-800">Hold on! The {region.toLowerCase()} has a question for you</p>
      <p className="mt-3 font-serif text-[17px] font-semibold leading-8 text-slate-900">{simpleStory || cue.wake}</p>
      <p className="mt-4 text-[15px] leading-8 text-slate-700">
        <strong>Imagine the scene:</strong> You have finished a safe and appropriate trial. Do not ask only whether the contact felt impressive. Check the real target: {comparableSign}.
      </p>
      <details className="mt-4 rounded-xl border border-indigo-100 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
          Quick thinking test · What if it did not improve?
        </summary>
        <p className="mt-3 border-t border-slate-100 pt-3 text-[15px] leading-8 text-slate-700">
          Recheck the original examination and diagnosis. Consider a different safe option, or refer if warning signs appear.
          A funny clinical story is easy to remember—but it cannot replace a real result.
        </p>
      </details>
      <p className="mt-3 text-xs leading-6 text-slate-600">
        One-minute memory: {cue.remember}
      </p>
    </aside>
  );
}