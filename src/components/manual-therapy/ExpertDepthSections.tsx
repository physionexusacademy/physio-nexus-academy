import { ClipboardCheck, Gauge, ShieldAlert, ShieldCheck } from "lucide-react";
import { DEPTH_NOTE, getTechniqueDepth } from "@/lib/manual-therapy-depth";
import { EditorialBlock } from "@/components/manual-therapy/EditorialBlock";
import TechniqueDemo2D from "@/components/manual-therapy/TechniqueDemo2D";
import { Ur } from "@/components/Ur";
import { DemoLab } from "@/components/manual-therapy/DemoLab";
import { ComponentsSection, demoCaptions } from "@/components/manual-therapy/ChapterExtras";

/** "See it in 2D" and "Expert depth" for one technique or world approach (nothing is rendered for a slug without depth data). */
export function ExpertDepthSections({ slug, name }: { slug: string; name: string }) {
  const depth = getTechniqueDepth(slug);
  if (!depth) return null;
  const captions = demoCaptions(slug);
  const own = captions.en.length >= 3;
  const sentences = (text: string) => text.split(/\.\s+/).map((part) => part.trim().replace(/\.$/, "")).filter((part) => part.length > 8).map((part) => part + ".");
  const how = sentences(depth.why).slice(0, 6);
  const ladder = sentences(depth.progress.replace(/;\s+/g, ". ")).slice(0, 5);
  const labData = { how: how.length ? how : [depth.why], parameters: depth.parameters, measure: depth.measure, choose: depth.choose, screen: depth.screen, pitfalls: depth.pitfalls, ladder: ladder.length ? ladder : [depth.progress] };
  return (
    <>
      <ComponentsSection slug={slug} name={name} />
      <section id="demo" className="mt-12 scroll-mt-28" aria-labelledby="demo-heading">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700"><Ur en="See it in 2D" ur="2D mein dekhein" /></p>
        <h2 id="demo-heading" className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
          {own ? <Ur en="Walk through it, step by step" ur="Qadam ba qadam dekhein" /> : depth.demo === "appraise" ? "How to test the claim, step by step" : "What the hands do, and what the tissue does in answer"}
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
          {own ? (
            <Ur
              en={`${captions.en.length} steps taken from this technique's own method; the picture shows what the hands and the tissue do at each one. It plays by itself while you read: pause it, step through it or tap a step.`}
              ur={`Is technique ke apne ${captions.ur.length || captions.en.length} steps; tasveer dikhati hai ke har step par haath aur tissue kya karte hain. Parhte waqt khud chalta hai: roken, qadam ba qadam dekhein ya kisi step par tap karein.`}
            />
          ) : (
            "Four steps, each with its reason. It plays by itself while you read, and you can pause it, step through it or tap a step."
          )}
        </p>
        <DemoLab data={{ ...labData, doIt: (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <TechniqueDemo2D kind={depth.demo} title={name} captions={own ? captions.en : undefined} captionsUr={own && captions.ur.length >= 3 ? captions.ur : undefined} />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700"><Ur en="Why it works · expert view" ur="Yeh kyun kaam karta hai · expert nazariya" /></p>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">{depth.why}</p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">How strong is the evidence</p>
            <p className="mt-2 text-[15px] leading-8 text-slate-700">{depth.evidence}</p>
          </div>
        </div>
        ) }} />
      </section>

      <section id="expert-depth" className="mt-12 scroll-mt-28" aria-labelledby="expert-depth-heading">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700"><Ur en="Expert depth" ur="Expert gehraai" /></p>
        <h2 id="expert-depth-heading" className="mt-2 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
          <Ur en="Reason like a senior clinician" ur="Senior clinician ki tarah sochein" />
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
          The choices an experienced therapist makes before and after the technique: when to pick it, the dose, how to measure it and what to watch for.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Dose parameters">
          {depth.parameters.map(([label, value]) => (
            <div key={label} role="listitem" className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-violet-50 p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-800">{label}</p>
              <p className="mt-1.5 text-[15px] font-semibold leading-6 text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <EditorialBlock title="When to choose it (and when not)" items={depth.choose} icon={ClipboardCheck} />
          <EditorialBlock title="Measure before and after" items={depth.measure} icon={Gauge} />
          <EditorialBlock title="Where experienced clinicians still go wrong" items={depth.pitfalls} icon={ShieldAlert} />
          <EditorialBlock title="Screen first: stop or refer if" items={depth.screen} icon={ShieldCheck} />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">Regress and progress</p>
          <p className="mt-2 text-[15px] leading-8 text-slate-700">{depth.progress}</p>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-6 text-slate-500">{DEPTH_NOTE}</p>
      </section>
    </>
  );
}
