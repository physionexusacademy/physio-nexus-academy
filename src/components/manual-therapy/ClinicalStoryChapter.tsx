import { ArrowRight, BookOpenText, Lightbulb } from "lucide-react";
import type { ClinicalEpisode } from "@/lib/manual-therapy-episodes";
import type { ManualTherapyAhaMoment } from "@/lib/manual-therapy-aha-moments";
import { clinicalRoomScenes } from "@/lib/manual-therapy-room-scenes";
import type { LessonWeave } from "@/lib/manual-therapy-lesson-weave";

type Props = {
  slug: string;
  episode: ClinicalEpisode;
  challenge?: ManualTherapyAhaMoment;
  weave?: LessonWeave;
};

export function ClinicalStoryChapter({ slug, episode, challenge, weave }: Props) {
  const room = clinicalRoomScenes[slug];
  return (
    <article
      id="clinical-story"
      data-pna-reading="clinical-story-v3"
      className="mt-9 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
      aria-labelledby="clinical-story-heading"
    >
      <div className="border-b border-slate-200 bg-gradient-to-r from-white to-teal-50/60 px-6 py-7 sm:px-9">
        <div className="flex items-center gap-2 text-teal-800">
          <BookOpenText className="h-5 w-5" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[0.18em]">PNA · Inside the clinic</p>
        </div>
        <h2 id="clinical-story-heading" className="mt-3 max-w-3xl font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          {challenge?.hook ?? "One patient. Three decisions. No magic tricks."}
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
          A fictional teaching scenario to make the clinical reasoning memorable. The real patient,
          of course, always gets an individual assessment.
        </p>
      </div>

      <div className="px-6 py-7 sm:px-9 sm:py-9">
        {weave ? (
          <aside className="mb-8 rounded-2xl border border-violet-100 bg-violet-50/60 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-violet-700">
              Scene zero · Listen to the conversation
            </p>
            <p className="mt-3 max-w-3xl font-serif text-lg leading-8 text-slate-800">{weave.dialogue}</p>
          </aside>
        ) : null}
        <div className="relative ml-3 border-l-2 border-teal-100 pl-7 sm:pl-9">
          <section className="relative pb-8 sm:pb-10" aria-label="The first clue">
            <span className="absolute -left-[38px] top-0 h-4 w-4 rounded-full border-4 border-white bg-teal-500 ring-1 ring-teal-100 sm:-left-[46px]" />
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-700">01 · The patient walks in</p>
            <h3 className="mt-2 font-serif text-xl font-bold text-slate-900">Here is the problem. What would you notice?</h3>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">{room?.arrival ?? episode.patient}</p>
          </section>

          <section className="relative pb-8 sm:pb-10" aria-label="The clinical decision">
            <span className="absolute -left-[38px] top-0 h-4 w-4 rounded-full border-4 border-white bg-teal-500 ring-1 ring-teal-100 sm:-left-[46px]" />
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-700">02 · The decision</p>
            <h3 className="mt-2 font-serif text-xl font-bold text-slate-900">Now the hands—and the thinking—come in.</h3>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">{room?.touch ?? episode.decision}</p>
            {weave ? (
              <div className="mt-5 rounded-xl bg-teal-50 px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
                  Freeze-frame · Picture it happening
                </p>
                <p className="mt-2 text-[15px] leading-8 text-slate-700">{weave.watch}</p>
              </div>
            ) : null}
          </section>

          <section className="relative" aria-label="The retest">
            <span className="absolute -left-[38px] top-0 h-4 w-4 rounded-full border-4 border-white bg-teal-500 ring-1 ring-teal-100 sm:-left-[46px]" />
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-700">03 · The moment of truth</p>
            <h3 className="mt-2 font-serif text-xl font-bold text-slate-900">After the hands leave, what is different?</h3>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-700">{room?.retest ?? episode.retest}</p>
          </section>
        </div>

        <p className="mt-8 max-w-3xl border-l-[3px] border-cyan-500 pl-4 font-serif text-lg italic leading-8 text-slate-800">
          {weave?.closer ?? episode.spark}
        </p>

        {!weave && challenge ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-teal-700">
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.17em]">Your turn · One clinical curveball</p>
            </div>
            <p className="mt-3 text-[15px] font-semibold leading-7 text-slate-900">{challenge.challenge}</p>
            <details className="group mt-4 border-t border-slate-200 pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 [&::-webkit-details-marker]:hidden">
                Think first. Then reveal the reasoning.
                <ArrowRight className="h-4 w-4 flex-none transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-700">{challenge.reveal}</p>
            </details>
          </div>
        ) : null}

        <a
          href="#clinical-method"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-800 underline-offset-4 hover:underline"
        >
          Ready for the actual technique? Continue to the practical guide
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
