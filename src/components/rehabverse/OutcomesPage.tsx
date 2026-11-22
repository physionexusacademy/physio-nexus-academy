"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import { submitOutcomeAction } from "@/app/rehabverse/actions";
import type { MyOutcomes } from "@/lib/rehabverse/api-types";
import { INSTRUMENT_BY_ID } from "@/lib/outcomes/instruments";
import { interpretChange } from "@/lib/outcomes/interpret";
import { dueList } from "@/lib/outcomes/plan";
import { TIMEPOINT_LABEL, type TimepointKey } from "@/lib/outcomes/types";
import { LineChart } from "./charts";
import { OutcomeForm } from "./OutcomeForm";
import { T, useRvLang } from "./useLang";

const ERRORS: Record<string, { en: string; ru: string }> = {
  already_answered: { en: "This one was already answered.", ru: "Is ka jawab pehle hi diya ja chuka hai." },
  invalid_answers: { en: "Please answer every question.", ru: "Meherbani karke har sawal ka jawab dein." },
  psfs_activities: { en: "Please rate the same activities you wrote at the start.", ru: "Meherbani karke wohi kaam rate karein jo aap ne shuru mein likhe the." },
};

/** The patient's questionnaires: what is due now, what was answered, and how the numbers moved. */
export function OutcomesPage({ outcomes }: { outcomes: MyOutcomes }) {
  const [lang] = useRvLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<{ instrument: string; timepoint: TimepointKey } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const plan = outcomes.plan;
  const answered = useMemo(() => new Set(outcomes.responses.map((r) => `${r.instrument}:${r.timepoint}`)), [outcomes.responses]);
  const due = useMemo(() => (plan ? dueList({ items: plan.items, anchor: new Date(plan.anchor_at) }, answered, new Date()).filter((d) => d.state !== "upcoming") : []), [plan, answered]);
  const upcoming = useMemo(() => (plan ? dueList({ items: plan.items, anchor: new Date(plan.anchor_at) }, answered, new Date()).filter((d) => d.state === "upcoming") : []), [plan, answered]);
  const patientReported = outcomes.responses.filter((r) => INSTRUMENT_BY_ID[r.instrument]?.kind === "patient_reported");
  const nprsRows = patientReported.filter((r) => r.instrument === "nprs");
  const psfsRows = patientReported.filter((r) => r.instrument === "psfs");

  const instrument = open ? INSTRUMENT_BY_ID[open.instrument] : null;
  const baselineActivities = open?.instrument === "psfs" ? ((outcomes.responses.find((r) => r.instrument === "psfs" && r.timepoint === "baseline")?.answers.activities as { name: string }[] | undefined) ?? []).map((a) => a.name) : undefined;

  const submit = (answers: unknown) => {
    if (!open) return;
    setError(null);
    start(async () => {
      const r = await submitOutcomeAction({ instrument: open.instrument, timepoint: open.timepoint, answers, language: lang });
      if (!r.ok) return setError((ERRORS[r.error] ?? { en: "We could not send it. Please try again.", ru: "Bheja nahi ja saka. Dobara koshish karein." })[lang === "ru" ? "ru" : "en"]);
      setDone(true);
      setOpen(null);
      router.refresh();
    });
  };

  return (
    <div className="container-content pb-20 pt-6 sm:pt-9">
      <Link href="/rehabverse/me" className="mb-3 inline-flex items-center gap-1 text-[13px] font-bold text-teal-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> <T en="My programme" ru="Mera programme" /></Link>
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <p className="rv-hero-kicker">PNA RehabVerse</p>
          <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Questions from your physiotherapist" ru="Aap ke physiotherapist ke sawal" /></h1>
          <p className="mt-1 text-[14px] leading-6 text-slate-600"><T en="A few short questionnaires help your physiotherapist see how you are doing over time. There are no right or wrong answers." ru="Chand chhote sawalnaame aap ke physiotherapist ko waqt ke saath aap ki progress dekhne mein madad karte hain. Koi jawab sahi ya ghalat nahi hota." /></p>
        </header>

        {(outcomes.feedback ?? []).length ? (
          <section className="space-y-3" aria-labelledby="oc-msg" data-testid="outcomes-messages">
            <h2 id="oc-msg" className="font-heading text-lg font-bold text-navy-800"><T en="Messages from your physiotherapist" ru="Aap ke physiotherapist ke paighaam" /></h2>
            {(outcomes.feedback ?? []).map((f) => (
              <article key={f.id ?? f.sent_at} className="rv-glass border-l-4 !border-l-[#0db3aa] p-4">
                <p className="text-[12px] font-bold text-slate-500">{new Date(f.sent_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="mt-1 whitespace-pre-line text-[14.5px] leading-6 text-navy-800">{f.message}</p>
              </article>
            ))}
          </section>
        ) : null}

        {done ? <p className="flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-3 text-[14px] font-bold text-teal-900" role="status"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> <T en="Thank you — your answers were sent." ru="Shukriya — aap ke jawab bhej diye gaye." /></p> : null}

        {!plan ? (
          <p className="rv-glass p-5 text-[14.5px] text-slate-700"><T en="Your physiotherapist has not chosen any questionnaires for you yet." ru="Aap ke physiotherapist ne abhi aap ke liye koi sawalnaama nahi chuna." /></p>
        ) : open && instrument ? (
          <section className="rv-glass space-y-4 p-5 sm:p-6" aria-labelledby="oc-title">
            <div>
              <h2 id="oc-title" className="font-heading text-xl font-bold text-navy-800">{lang === "ru" ? instrument.name.ru : instrument.name.en}</h2>
              <p className="text-[13px] font-semibold text-slate-500">{lang === "ru" ? TIMEPOINT_LABEL[open.timepoint].ru : TIMEPOINT_LABEL[open.timepoint].en}</p>
            </div>
            <OutcomeForm instrument={instrument} timepoint={open.timepoint} baselineActivities={baselineActivities} onSubmit={submit} pending={pending} error={error} />
            <button type="button" className="rv-btn rv-btn-ghost" onClick={() => { setOpen(null); setError(null); }}><T en="Not now" ru="Abhi nahi" /></button>
          </section>
        ) : (
          <>
            <section className="rv-glass p-5" aria-labelledby="oc-due">
              <h2 id="oc-due" className="flex items-center gap-2 font-heading text-lg font-bold text-navy-800"><ClipboardList className="h-5 w-5 text-teal-600" aria-hidden="true" /> <T en="Waiting for you" ru="Aap ke intezar mein" /></h2>
              {due.length === 0 ? <p className="mt-2 text-[14px] text-slate-600"><T en="Nothing is waiting for you right now." ru="Abhi aap ke liye kuch baaqi nahi." /></p> : (
                <ul className="mt-3 space-y-2">
                  {due.map((d) => {
                    const ins = INSTRUMENT_BY_ID[d.instrument];
                    return (
                      <li key={`${d.instrument}:${d.timepoint}`}>
                        <button type="button" onClick={() => { setOpen({ instrument: d.instrument, timepoint: d.timepoint }); setDone(false); }} className="rv-card flex w-full items-center justify-between gap-3 text-left">
                          <span><b className="block text-[15px] text-navy-800">{lang === "ru" ? ins.name.ru : ins.name.en}</b><span className="text-[13px] text-slate-500">{lang === "ru" ? TIMEPOINT_LABEL[d.timepoint].ru : TIMEPOINT_LABEL[d.timepoint].en}{d.state === "late" ? (lang === "ru" ? " · der ho gayi" : " · overdue") : ""}</span></span>
                          <span className="rv-btn rv-btn-primary !min-h-[38px] !text-[13px]"><T en="Answer" ru="Jawab dein" /></span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {upcoming.length ? <p className="mt-3 text-[12.5px] text-slate-500"><T en={`${upcoming.length} more will open later, on the dates your physiotherapist planned.`} ru={`${upcoming.length} aur baad mein khulenge, un tareekhon par jo aap ke physiotherapist ne tay ki hain.`} /></p> : null}
            </section>

            {nprsRows.length >= 1 ? (
              <section className="rv-glass p-5" aria-labelledby="oc-pain">
                <h2 id="oc-pain" className="font-heading text-lg font-bold text-navy-800"><T en="Your pain over time" ru="Waqt ke saath aap ka dard" /></h2>
                <div className="mx-auto max-w-md"><LineChart title={lang === "ru" ? "Pichle hafte ka average dard" : "Average pain over the week"} labels={nprsRows.map((r) => (lang === "ru" ? TIMEPOINT_LABEL[r.timepoint].ru : TIMEPOINT_LABEL[r.timepoint].en))} series={[{ name: lang === "ru" ? "Average dard" : "Average pain", colour: "#0db3aa", points: nprsRows.map((r) => r.score.primary) }]} /></div>
                {nprsRows.length >= 2 ? (() => {
                  const r = interpretChange(INSTRUMENT_BY_ID.nprs, nprsRows[0].score, nprsRows[nprsRows.length - 1].score);
                  const text = { much_better: ["Your pain is clearly lower than at the start.", "Aap ka dard shuru ke muqable mein saaf kam hai."], better: ["Your pain is lower than at the start.", "Aap ka dard shuru ke muqable mein kam hai."], no_important_change: ["Your pain is about the same as at the start.", "Aap ka dard shuru ke jaisa hi hai."], worse: ["Your pain is higher than at the start. Tell your physiotherapist.", "Aap ka dard shuru se zyada hai. Apne physiotherapist ko batayein."], much_worse: ["Your pain is clearly higher than at the start. Tell your physiotherapist soon.", "Aap ka dard shuru se saaf zyada hai. Jaldi apne physiotherapist ko batayein."], not_comparable: ["", ""] }[r.band];
                  return <p className="mt-2 text-[14px] font-semibold text-navy-800">{lang === "ru" ? text[1] : text[0]}</p>;
                })() : null}
              </section>
            ) : null}

            {psfsRows.length >= 1 ? (
              <section className="rv-glass p-5" aria-labelledby="oc-psfs">
                <h2 id="oc-psfs" className="font-heading text-lg font-bold text-navy-800"><T en="Your own activities" ru="Aap ke apne kaam" /></h2>
                <div className="mx-auto max-w-md"><LineChart title={lang === "ru" ? "Aap ke kaamon ka average (10 = pehle jaisa)" : "Average of your activities (10 = as before)"} labels={psfsRows.map((r) => (lang === "ru" ? TIMEPOINT_LABEL[r.timepoint].ru : TIMEPOINT_LABEL[r.timepoint].en))} series={[{ name: "PSFS", colour: "#2f8cff", points: psfsRows.map((r) => r.score.primary) }]} /></div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
