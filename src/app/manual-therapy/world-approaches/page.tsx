import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Clapperboard, Lightbulb, Microscope, ShieldCheck } from "lucide-react";
import { worldManualApproaches, type WorldManualApproach } from "@/lib/manual-therapy-world";

export const metadata: Metadata = {
  title: "World Manual Therapy Encyclopedia | PNA",
  description: "Explore 13 additional orthopedic, osteopathic and bodywork approaches through fun clinical stories, safe reasoning, Aha moments, interactive questions and explicit evidence limitations.",
  alternates: { canonical: "https://physionexusacademy.com/manual-therapy/world-approaches" },
};

const categories: Array<{ name: WorldManualApproach["category"]; subtitle: string }> = [
  { name: "Orthopedic reasoning", subtitle: "Clinical frameworks that help you choose—and sometimes refuse—a technique." },
  { name: "Osteopathic methods", subtitle: "Historical hands-on traditions explained carefully, without magical anatomy claims." },
  { name: "Fascial and bodywork", subtitle: "Popular approaches, patient stories and an honest look at the research." },
  { name: "Emerging and disputed", subtitle: "Understand what exists without confusing a fascinating idea with proven care." },
];

export default function WorldManualApproachesPage() {
  return (
    <main className="container-content section-padding">
      <a href="/manual-therapy" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Manual Therapy Mastery
      </a>
      <header data-pna-world-library="v1" className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-900 to-teal-900 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-200">
          <Clapperboard className="h-5 w-5" aria-hidden="true" /> PNA · The worldwide collection
        </p>
        <h1 className="mt-4 max-w-4xl font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">
          World Manual Therapy Encyclopedia
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-indigo-50">
          Imagine every manual therapy school sitting in one classroom—each convinced it has the most interesting story.
          We let the patients, reasoning and evidence do the talking. Some chapters will make you laugh.
          Others will teach you when not to touch. Both matter.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">{worldManualApproaches.length} authored approaches</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Individual patient stories</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Evidence and safety checks</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Interactive clinical decisions</span>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="How to use this library">
        {[
          { Icon: BookOpen, title: "Follow the story", text: "A fresh patient scene, believable dialogue, and one little joke worth remembering." },
          { Icon: Brain, title: "Catch the Aha Moment", text: "What the model says, what your assessment can show, and where they diverge." },
          { Icon: ShieldCheck, title: "Know when to stop", text: "Contraindications and evidence are not the boring part. They are the plot's safety rails." },
        ].map(({ Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
            <Icon className="h-6 w-6 text-indigo-700" aria-hidden="true" />
            <h2 className="mt-3 font-serif text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-9 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6 sm:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
          <Lightbulb className="h-4 w-4" aria-hidden="true" /> Important distinction
        </p>
        <h2 className="mt-2 font-serif text-xl font-bold text-slate-900">Not every named approach is a new hands-on maneuver.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">
          McKenzie MDT primarily emphasizes active assessment and self-management. Paris and Mennell provide
          clinical or mechanical frameworks. Other entries are named osteopathic or complementary bodywork traditions.
          A historical label, certificate or persuasive mechanism does not automatically establish clinical effectiveness.
          This extension complements the original 22 detailed technique chapters; it does not replace them.
        </p>
      </section>

      {categories.map((category) => {
        const entries = worldManualApproaches.filter((item) => item.category === category.name);
        return (
          <section key={category.name} className="mt-12" aria-labelledby={"cat-" + category.name.replaceAll(" ", "-")}>
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-indigo-700">Explore another school of thought</p>
            <h2 id={"cat-" + category.name.replaceAll(" ", "-")} className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
              {category.name}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{category.subtitle}</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {entries.map((lesson) => (
                <a key={lesson.slug} href={"/manual-therapy/world-approaches/" + lesson.slug} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">{lesson.kind}</span>
                  <h3 className="mt-3 font-serif text-xl font-bold leading-7 text-slate-900">{lesson.title}</h3>
                  <p className="mt-3 font-semibold leading-7 text-indigo-900">{lesson.headline}</p>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-slate-600">{lesson.scene}</p>
                  <p className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">
                    <Microscope className="mt-0.5 h-4 w-4 flex-none text-teal-700" aria-hidden="true" />
                    Evidence: {lesson.evidenceLabel}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-teal-800">
                    Enter this clinical story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
        <h2 className="text-lg font-bold text-slate-900">Evidence matters even when a story is entertaining.</h2>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">
          These are fictional educational scenarios. Some approaches are historical descriptions or have insufficient
          evidence for clinical benefit. Techniques requiring specialist training cannot be learned safely from text alone.
          Always assess red flags, consent, scope of practice and established treatment alternatives.
        </p>
      </section>
    </main>
  );
}
