import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Gauge,
  Hand,
  HeartPulse,
  Home,
  ShieldAlert,
  Stethoscope,
  Target,
  Workflow,
} from "lucide-react";
import { treatmentPlans } from "@/lib/treatment-plans";
import { treatmentPlanGuides } from "@/lib/treatment-plan-guides";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return treatmentPlans.map((plan) => ({ slug: plan.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plan = treatmentPlans.find((item) => item.slug === slug);
  if (!plan) return {};
  return {
    title: plan.name + " | Evidence-Informed Physiotherapy Treatment Plan",
    description: plan.summary,
    alternates: { canonical: "https://physionexusacademy.com/treatment-plans/" + plan.slug },
  };
}

function PlanSection({
  title,
  items,
  icon: Icon,
  tone = "border-grey-200 bg-white",
  eyebrow,
}: {
  title: string;
  items: string[];
  icon: typeof Stethoscope;
  tone?: string;
  eyebrow?: string;
}) {
  if (!items?.length) return null;
  return (
    <section className={"rounded-2xl border p-5 sm:p-6 " + tone}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/80 text-teal-800 shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>}
          <h2 className="text-lg font-bold text-navy-800">{title}</h2>
        </div>
      </div>
      <ol className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-navy-700">
            <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white text-[11px] font-bold text-teal-800 ring-1 ring-teal-100">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default async function TreatmentPlanDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const plan = treatmentPlans.find((item) => item.slug === slug);
  const guide = treatmentPlanGuides[slug];
  if (!plan || !guide) notFound();

  return (
    <main className="container-content section-padding">
      <a href="/treatment-plans" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-900">
        <ArrowLeft className="h-4 w-4" /> All treatment plans
      </a>

      <header className="relative mt-5 overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 p-6 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="relative">
          <span className="inline-flex rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-bold text-teal-800">{plan.category}</span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Physio Nexus Academy · Clinical Treatment Framework</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-5xl">{plan.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-navy-700">{plan.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-navy-700">
            <span className="rounded-full bg-white px-3 py-2 ring-1 ring-grey-200">Assess → classify</span>
            <span className="rounded-full bg-white px-3 py-2 ring-1 ring-grey-200">Treat → reassess</span>
            <span className="rounded-full bg-white px-3 py-2 ring-1 ring-grey-200">Load → progress</span>
          </div>
        </div>
      </header>

      <section className="mt-7 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-100 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Clinical decision pathway</p>
            <h2 className="mt-1 text-2xl font-extrabold text-navy-900 sm:text-3xl">A structured plan, not a recipe</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">Clinician-led · Individualised</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", title: "Understand", detail: "Screen safety, identify the likely clinical pattern and agree meaningful goals." },
            { n: "02", title: "Select", detail: "Choose only interventions that match the patient's impairments and preferences." },
            { n: "03", title: "Reassess", detail: "Repeat the same comparable sign or functional task after key interventions." },
            { n: "04", title: "Progress", detail: "Build capacity and participation using measurable response, not session count." },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl bg-slate-50 p-4">
              <span className="text-xs font-extrabold tracking-widest text-teal-700">{step.n}</span>
              <h3 className="mt-2 font-bold text-navy-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-navy-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <PlanSection title="Clinical reasoning" eyebrow="Before choosing an intervention" items={guide.clinicalLogic} icon={Stethoscope} tone="border-indigo-100 bg-indigo-50/60" />
        <PlanSection title="First-session workflow" eyebrow="A practical starting sequence" items={guide.firstSession} icon={ClipboardCheck} tone="border-cyan-100 bg-cyan-50/60" />
        <PlanSection title="Assessment & examination" items={plan.assessment} icon={Activity} tone="border-sky-100 bg-sky-50/60" />
        <PlanSection title="Red flags & safety screen" items={plan.redFlags} icon={ShieldAlert} tone="border-rose-200 bg-rose-50/70" />
        <PlanSection title="Manual therapy application" eyebrow="Indication · dosage · response" items={guide.manualApplication} icon={Hand} tone="border-violet-100 bg-violet-50/60" />
        <PlanSection title="Exercise prescription & dosage" eyebrow="Adapt to irritability and capacity" items={guide.exerciseDose} icon={Dumbbell} tone="border-emerald-100 bg-emerald-50/60" />
        <PlanSection title="Modalities & adjuncts" items={guide.modalityDose} icon={HeartPulse} tone="border-amber-100 bg-amber-50/60" />
        <PlanSection title="Progression & regression rules" items={guide.progressionRules} icon={Gauge} tone="border-blue-100 bg-blue-50/60" />
        <PlanSection title="Home programme" items={plan.homePlan} icon={Home} tone="border-teal-100 bg-teal-50/60" />
        <PlanSection title="Outcome measures" items={plan.outcomeMeasures} icon={Target} tone="border-slate-200 bg-slate-50" />
        <PlanSection title="Common clinical mistakes" items={guide.commonMistakes} icon={ShieldAlert} tone="border-orange-100 bg-orange-50/60" />
        <PlanSection title="Patient education & self-management" items={guide.patientEducation} icon={HeartPulse} tone="border-teal-100 bg-teal-50/60" />
        <PlanSection title="Referral & escalation" items={plan.escalation} icon={Workflow} tone="border-rose-200 bg-rose-50/60" />
      </div>

      <section className="mt-7 rounded-2xl border border-sky-200 bg-sky-50/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-sky-800" />
          <div>
            <h2 className="font-bold text-navy-900">Clinical use & safety note</h2>
            <p className="mt-2 text-sm leading-6 text-navy-700">
              This is an educational clinical framework, not an individual prescription or a substitute for diagnosis, medical assessment, local protocols or professional judgement. Exercise dose, manual techniques and adjuncts must be adapted to examination findings, irritability, comorbidities, precautions, patient goals and response. Obtain informed consent, work within training and scope, and refer when indicated. Do not apply every intervention listed to every patient.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-7 rounded-2xl border border-grey-200 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-navy-900">The PNA treatment principle</h2>
        <p className="mt-2 text-sm leading-6 text-navy-600">
          The best plan is not the one with the most techniques. It is the one that identifies the patient's main problem, selects a defensible intervention, measures the response and steadily restores meaningful function.
        </p>
      </section>

      <nav className="mt-7 flex flex-wrap gap-3">
        <a href="/treatment-plans" className="rounded-xl border border-grey-200 bg-white px-5 py-3 text-sm font-bold text-navy-800 transition hover:bg-slate-50">Browse other conditions</a>
        <a href="/manual-therapy" className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-800">Explore manual therapy</a>
      </nav>
    </main>
  );
}
