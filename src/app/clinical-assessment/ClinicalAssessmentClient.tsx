"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCheck,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { AnatomyRegionVisual } from "@/app/symptom-checker/AnatomyRegionVisual";
import type { RegionId } from "@/lib/msk-symptom-checker";

type Region = { id: RegionId; label: string; detail: string };
type Question = {
  id: string;
  title: string;
  hint: string;
  options: { value: string; label: string; detail?: string }[];
};

const regions: Region[] = [
  { id: "neck", label: "Neck", detail: "Cervical spine" },
  { id: "shoulder", label: "Shoulder", detail: "Shoulder complex" },
  { id: "elbow", label: "Elbow & forearm", detail: "Elbow region" },
  { id: "wrist-hand", label: "Wrist & hand", detail: "Distal upper limb" },
  { id: "upper-back-ribs", label: "Upper back & ribs", detail: "Thoracic region" },
  { id: "low-back", label: "Lower back", detail: "Lumbar region" },
  { id: "hip-groin", label: "Hip & groin", detail: "Hip region" },
  { id: "knee", label: "Knee", detail: "Knee complex" },
  { id: "lower-leg", label: "Lower leg", detail: "Calf & shin" },
  { id: "ankle-foot", label: "Ankle & foot", detail: "Foot and ankle" },
];

const historyQuestions: Question[] = [
  {
    id: "onset",
    title: "How did the problem begin?",
    hint: "Select the best fit from the patient's history.",
    options: [
      { value: "gradual", label: "Gradual onset", detail: "Developed over time" },
      { value: "sudden", label: "Sudden onset", detail: "Started at a clear moment" },
      { value: "trauma", label: "Trauma or accident", detail: "Fall, impact, twist or other injury" },
      { value: "recurrent", label: "Recurrent episode", detail: "Similar symptoms have occurred before" },
    ],
  },
  {
    id: "duration",
    title: "How long have symptoms been present?",
    hint: "Use the patient's reported timeline.",
    options: [
      { value: "under-week", label: "Less than 1 week" },
      { value: "1-6-weeks", label: "1–6 weeks" },
      { value: "6-12-weeks", label: "6–12 weeks" },
      { value: "over-12-weeks", label: "More than 12 weeks" },
    ],
  },
  {
    id: "irritability",
    title: "How irritable are the symptoms?",
    hint: "Consider severity, ease of provocation and settling time.",
    options: [
      { value: "low", label: "Low", detail: "Higher loads; settles quickly" },
      { value: "moderate", label: "Moderate", detail: "Several activities provoke symptoms" },
      { value: "high", label: "High", detail: "Easily provoked or slow to settle" },
      { value: "unclear", label: "Not established yet", detail: "Needs further history" },
    ],
  },
];

const safetyQuestions: Question[] = [
  {
    id: "safety",
    title: "Have safety concerns been screened?",
    hint: "Complete a region-appropriate red-flag screen before routine examination. This selection is a workflow reminder, not a red-flag rule engine.",
    options: [
      { value: "screened-none", label: "Screen completed — no concerning features identified" },
      { value: "concern", label: "Potential concern identified", detail: "Pause routine workflow and assess urgency" },
      { value: "not-screened", label: "Not screened yet", detail: "Complete screening before proceeding" },
    ],
  },
];

const stages = ["Region", "History", "Safety", "Examination", "Clinical plan"];

export function ClinicalAssessmentClient() {
  const [regionId, setRegionId] = useState<RegionId | null>(null);
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeQuestion, setActiveQuestion] = useState(0);

  const region = regions.find((item) => item.id === regionId);
  const currentQuestions = stage === 1 ? historyQuestions : stage === 2 ? safetyQuestions : [];
  const currentQuestion = currentQuestions[activeQuestion];

  const completedCount = useMemo(() => {
    const required = stage === 1 ? historyQuestions : stage === 2 ? safetyQuestions : [];
    return required.filter((question) => Boolean(answers[question.id])).length;
  }, [answers, stage]);

  const chooseAnswer = (questionId: string, value: string) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const next = () => {
    if (stage === 1 && activeQuestion < historyQuestions.length - 1) {
      setActiveQuestion((current) => current + 1);
      return;
    }
    if (stage === 2 && answers.safety !== "screened-none") return;
    setStage((current) => Math.min(4, current + 1));
    setActiveQuestion(0);
  };

  const back = () => {
    if (stage === 1 && activeQuestion > 0) {
      setActiveQuestion((current) => current - 1);
      return;
    }
    setStage((current) => Math.max(0, current - 1));
    setActiveQuestion(0);
  };

  const reset = () => {
    setRegionId(null);
    setStage(0);
    setAnswers({});
    setActiveQuestion(0);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2fbfa_0%,#ffffff_38%,#f7fafc_100%)]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="container-content relative max-w-7xl py-7 sm:py-10 lg:py-14">
        <section className="relative overflow-hidden rounded-[2rem] bg-navy-900 px-5 py-7 text-white shadow-2xl shadow-navy-900/15 sm:px-8 sm:py-9 lg:px-11">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-100">
                <Stethoscope className="h-3.5 w-3.5" /> Physio Nexus Academy
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Clinical Assessment <span className="text-teal-300">&amp; Management</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                A clinician-facing workspace to structure the history, prioritize safety, guide examination and organize clinical reasoning.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Assess", "Reason", "Plan", "Reassess"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-slate-100">{item}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                <Activity className="h-5 w-5 text-teal-300" />
                <p className="mt-3 text-sm font-bold text-white">Guided assessment</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Structured, step-by-step flow</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                <BookOpen className="h-5 w-5 text-teal-300" />
                <p className="mt-3 text-sm font-bold text-white">Knowledge library</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Detailed clinical learning</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 rounded-2xl border border-teal-100 bg-white/90 p-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-teal-50 text-teal-700"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-bold text-navy-900">Safety-first clinical workflow</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">This is an initial interface foundation. It does not provide validated triage rules or a confirmed diagnosis. Use professional judgment and local referral pathways.</p>
            </div>
          </div>
          {region && <button onClick={reset} className="mt-3 text-sm font-bold text-teal-800 underline underline-offset-4 sm:mt-0">Start new assessment</button>}
        </div>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-700">Clinical workspace</p>
                <h2 className="mt-1 text-xl font-bold text-navy-900 sm:text-2xl">{stages[stage]}</h2>
              </div>
              <p className="text-xs font-semibold text-slate-500">Step {stage + 1} of {stages.length}</p>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-1.5" aria-label="Assessment progress">
              {stages.map((label, index) => (
                <div key={label} className="min-w-0">
                  <div className={`h-1.5 rounded-full ${index <= stage ? "bg-teal-500" : "bg-slate-100"}`} />
                  <p className={`mt-2 hidden truncate text-[10px] font-bold sm:block ${index <= stage ? "text-teal-800" : "text-slate-400"}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-7 lg:p-8">
            {stage === 0 && (
              <>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-navy-900 sm:text-xl">Where is the patient's main problem?</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Choose a region to begin. These cards reuse the existing PNA anatomical illustrations.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {regions.map((item) => {
                    const selected = regionId === item.id;
                    return (
                      <button key={item.id} onClick={() => { setRegionId(item.id); setAnswers({}); setStage(1); setActiveQuestion(0); }} className={`group relative flex min-h-48 flex-col items-center overflow-hidden rounded-2xl border p-3 text-center transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${selected ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fbfc)] hover:border-teal-200"}`}>
                        {selected && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white"><Check className="h-3.5 w-3.5" /></span>}
                        <div className="flex h-32 w-full items-center justify-center">
                          <AnatomyRegionVisual region={item.id} compact className="h-32 w-full transition-transform duration-200 group-hover:scale-[1.04]" />
                        </div>
                        <span className="mt-2 text-sm font-extrabold text-navy-900">{item.label}</span>
                        <span className="mt-1 text-[11px] text-slate-500">{item.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {stage === 1 && currentQuestion && (
              <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  {regionId && <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-white"><AnatomyRegionVisual region={regionId} compact className="h-12 w-12" /></div>}
                  <div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Selected region</p><p className="font-bold text-navy-900">{region?.label}</p></div>
                  <button onClick={() => setStage(0)} className="ml-auto text-xs font-bold text-teal-800 underline underline-offset-4">Change</button>
                </div>
                <div className="mb-5 flex items-center justify-between gap-3"><span className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal-700">Patient history · {activeQuestion + 1}/{historyQuestions.length}</span><span className="text-xs text-slate-500">{completedCount} answered on this step</span></div>
                <h3 className="text-xl font-bold text-navy-900 sm:text-2xl">{currentQuestion.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{currentQuestion.hint}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option) => {
                    const selected = answers[currentQuestion.id] === option.value;
                    return <button key={option.value} onClick={() => chooseAnswer(currentQuestion.id, option.value)} className={`flex min-h-20 items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"}`}>
                      <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border ${selected ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300"}`}>{selected && <Check className="h-3 w-3" />}</span>
                      <span><span className="block text-sm font-bold text-navy-900">{option.label}</span>{option.detail && <span className="mt-1 block text-xs leading-5 text-slate-500">{option.detail}</span>}</span>
                    </button>;
                  })}
                </div>
                {!answers[currentQuestion.id] && <p className="mt-3 text-xs text-slate-500">Choose an option to continue.</p>}
              </div>
            )}

            {stage === 2 && currentQuestion && (
              <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <ShieldCheck className="h-6 w-6 flex-none text-amber-700" />
                  <div><p className="font-bold text-amber-950">Safety gate</p><p className="mt-1 text-sm leading-5 text-amber-900">Do not proceed to routine testing when urgent features are suspected. Follow local emergency and referral pathways.</p></div>
                </div>
                <h3 className="text-xl font-bold text-navy-900 sm:text-2xl">{currentQuestion.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{currentQuestion.hint}</p>
                <div className="mt-5 grid gap-3">
                  {currentQuestion.options.map((option) => {
                    const selected = answers.safety === option.value;
                    const concern = option.value !== "screened-none";
                    return <button key={option.value} onClick={() => chooseAnswer("safety", option.value)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? concern ? "border-amber-400 bg-amber-50 ring-2 ring-amber-100" : "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 hover:border-teal-200"}`}>
                      <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border ${selected ? concern ? "border-amber-600 bg-amber-600" : "border-teal-600 bg-teal-600" : "border-slate-300"}`}>{selected && <Check className="h-3 w-3 text-white" />}</span>
                      <span><span className="block text-sm font-bold text-navy-900">{option.label}</span>{option.detail && <span className="mt-1 block text-xs leading-5 text-slate-500">{option.detail}</span>}</span>
                    </button>;
                  })}
                </div>
                {answers.safety === "concern" && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">Pause this guided workflow. Determine urgency and follow the appropriate referral pathway.</p>}
                {answers.safety === "not-screened" && <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">Complete the relevant safety screen before moving to routine physical examination.</p>}
              </div>
            )}

            {stage === 3 && (
              <div className="mx-auto max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800"><ClipboardCheck className="h-4 w-4" /> Examination planning</span>
                <h3 className="mt-4 text-xl font-bold text-navy-900 sm:text-2xl">Build a hypothesis-led examination</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">The next development milestone will add region-specific examination branches with indications, contraindications, test interpretation and limitations. For this foundation, use the checklist below to plan rather than auto-selecting unvalidated tests.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {["Observation and functional task", "Active movement and symptom response", "Relevant neurological screen, when indicated", "Targeted tests linked to a clinical hypothesis", "Compare supporting and conflicting findings", "Record baseline outcome measure"].map((item) => <div key={item} className="flex gap-3 rounded-xl border border-slate-200 p-4"><span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-teal-50 text-teal-700"><Check className="h-4 w-4" /></span><p className="text-sm font-semibold leading-5 text-navy-800">{item}</p></div>)}
                </div>
              </div>
            )}

            {stage === 4 && (
              <div className="mx-auto max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800"><BookOpen className="h-4 w-4" /> Clinical reasoning & management</span>
                <h3 className="mt-4 text-xl font-bold text-navy-900 sm:text-2xl">Assessment foundation saved in this session</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">This first milestone establishes the interface and structured pathway. It does not yet generate a diagnosis, automated differential or treatment prescription.</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="bg-slate-50 px-4 py-3 text-sm font-bold text-navy-900">Session summary</div>
                  <dl className="divide-y divide-slate-100">
                    <div className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Region</dt><dd className="text-sm font-semibold text-navy-900">{region?.label ?? "Not selected"}</dd></div>
                    {historyQuestions.map((question) => <div key={question.id} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{question.title}</dt><dd className="text-sm font-semibold text-navy-900">{question.options.find((option) => option.value === answers[question.id])?.label ?? "Not answered"}</dd></div>)}
                    <div className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Safety screen</dt><dd className="text-sm font-semibold text-navy-900">{currentSafetyLabel(answers.safety)}</dd></div>
                  </dl>
                </div>
                <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><p className="text-sm font-bold text-indigo-950">Knowledge Library — next layer</p><p className="mt-1 text-sm leading-6 text-indigo-900">The detailed region-by-region chapters will cover clinical anatomy, mechanisms, examination rationale, differential diagnosis, management options, dosage, progression, evidence quality, precautions and clinical cases.</p></div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button onClick={back} disabled={stage === 0} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-navy-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button>
              {stage < 4 ? (
                <button onClick={next} disabled={stage === 0 || (stage === 1 && !answers[currentQuestion?.id ?? ""]) || (stage === 2 && answers.safety !== "screened-none")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-navy-900/10 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40">Continue <ArrowRight className="h-4 w-4" /></button>
              ) : (
                <button onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800">New assessment <ChevronRight className="h-4 w-4" /></button>
              )}
            </div>
          </div>
        </section>
        <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-5 text-slate-500">PNA Clinical Assessment &amp; Management · Initial development preview · No patient data is saved or transmitted by this interface.</p>
      </div>
    </main>
  );
}

function currentSafetyLabel(value?: string) {
  if (value === "screened-none") return "Screen completed — no concerning features identified";
  if (value === "concern") return "Potential concern identified — routine workflow paused";
  if (value === "not-screened") return "Not screened yet";
  return "Not answered";
}
