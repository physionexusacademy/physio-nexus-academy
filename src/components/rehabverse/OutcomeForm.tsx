"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import type { Bi, FormSpec, Instrument, TimepointKey } from "@/lib/outcomes/types";
import { scoreResponse } from "@/lib/outcomes/scoring";
import { T, useRvLang } from "./useLang";

/**
 * One questionnaire the physiotherapist chose. In Roman Urdu the official English wording is shown under every line, because the Roman Urdu is a help and not
 * a validated translation (the language shown is stored with the answers). Nothing is scored here for storage: the server scores the raw answers again.
 */
const colour = (n: number, max = 10) => (n / max <= 0.3 ? "#0db3aa" : n / max <= 0.6 ? "#d99a00" : "#d6293a");

function Words({ text, className = "" }: { text: Bi; className?: string }) {
  const [lang] = useRvLang();
  return (
    <span className={className}>
      {lang === "ru" ? text.ru : text.en}
      {lang === "ru" ? <small className="mt-0.5 block text-[12px] font-normal leading-4 text-slate-500">{text.en}</small> : null}
    </span>
  );
}

function Scale({ value, onChange, min, max, label }: { value: number | undefined; onChange: (n: number) => void; min: number; max: number; label: string }) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="rv-nprs" role="group" aria-label={label}>
      {values.map((n) => (
        <button key={n} type="button" aria-pressed={value === n} onClick={() => onChange(n)} style={value === n ? { background: colour(n - min, max - min) } : undefined}>{n}</button>
      ))}
    </div>
  );
}

export function OutcomeForm({ instrument, timepoint, baselineActivities, onSubmit, pending, error }: {
  instrument: Instrument;
  timepoint: TimepointKey;
  /** The activities written at the start (a follow-up PSFS asks about the same ones). */
  baselineActivities?: string[];
  onSubmit: (answers: unknown) => void;
  pending: boolean;
  error: string | null;
}) {
  const [lang] = useRvLang();
  const form: FormSpec = instrument.form;
  const [numbers, setNumbers] = useState<Record<string, number>>({});
  const [activities, setActivities] = useState<{ name: string; rating?: number }[]>(() => (baselineActivities?.length ? baselineActivities.map((name) => ({ name })) : [{ name: "" }]));
  const [change, setChange] = useState<number | undefined>();
  const [ticked, setTicked] = useState<string[]>([]);
  const [choices, setChoices] = useState<Record<string, number>>({});

  const answers = useMemo<unknown>(() => {
    if (form.type === "numbers") return numbers;
    if (form.type === "psfs") return { activities: activities.filter((a) => a.name.trim() || a.rating !== undefined).map((a) => ({ name: a.name, rating: a.rating })) };
    if (form.type === "change") return { value: change };
    if (form.type === "checklist") return { ticked };
    if (form.type === "sbst") return choices;
    return {};
  }, [form, numbers, activities, change, ticked, choices]);
  const ready = scoreResponse(instrument, answers).ok;

  return (
    <div className="space-y-5">
      {form.type === "numbers" ? form.items.map((item) => (
        <fieldset key={item.id} className="space-y-1.5">
          <legend className="rv-label"><Words text={item.prompt} /></legend>
          <Scale value={numbers[item.id]} onChange={(n) => setNumbers((s) => ({ ...s, [item.id]: n }))} min={item.min} max={item.max} label={item.prompt.en} />
          <p className="rv-hint">{item.minLabel ? (lang === "ru" ? item.minLabel.ru : item.minLabel.en) : ""} · {item.maxLabel ? (lang === "ru" ? item.maxLabel.ru : item.maxLabel.en) : ""}</p>
        </fieldset>
      )) : null}

      {form.type === "psfs" ? (
        <div className="space-y-4">
          <p className="text-[14px] leading-6 text-slate-700"><Words text={form.instruction} /></p>
          {activities.map((a, index) => (
            <fieldset key={index} className="space-y-1.5 rounded-2xl border border-slate-200 bg-white/70 p-3">
              <legend className="rv-label"><T en={`Activity ${index + 1}`} ru={`Kaam ${index + 1}`} /></legend>
              {baselineActivities?.length ? <p className="text-[15px] font-bold text-navy-800">{a.name}</p> : (
                <input className="rv-input" maxLength={80} value={a.name} onChange={(e) => setActivities((list) => list.map((x, i) => (i === index ? { ...x, name: e.target.value } : x)))} aria-label={`${lang === "ru" ? "Kaam" : "Activity"} ${index + 1}`} placeholder={lang === "ru" ? "Jaise: bachay ko uthana, baith kar kaam karna" : "For example: lifting my child, sitting at work"} />
              )}
              <Scale value={a.rating} onChange={(n) => setActivities((list) => list.map((x, i) => (i === index ? { ...x, rating: n } : x)))} min={form.min} max={form.max} label={a.name || `Activity ${index + 1}`} />
              <p className="rv-hint">{lang === "ru" ? form.minLabel.ru : form.minLabel.en} · {lang === "ru" ? form.maxLabel.ru : form.maxLabel.en}</p>
            </fieldset>
          ))}
          {!baselineActivities?.length && activities.length < form.maxActivities ? (
            <button type="button" className="rv-btn rv-btn-ghost" onClick={() => setActivities((list) => [...list, { name: "" }])}><T en="Add another activity" ru="Aur ek kaam shamil karein" /></button>
          ) : null}
        </div>
      ) : null}

      {form.type === "change" ? (
        <fieldset className="space-y-2">
          <legend className="rv-label"><Words text={form.prompt} /></legend>
          <div className="grid gap-1.5">
            {form.options.map((o) => (
              <button key={o.value} type="button" role="radio" aria-checked={change === o.value} onClick={() => setChange(o.value)} className={"rv-card flex w-full items-center gap-3 text-left " + (change === o.value ? "rv-card-on" : "")}>
                <span className="w-8 shrink-0 text-center font-heading text-[15px] font-bold text-navy-800">{o.value > 0 ? `+${o.value}` : o.value}</span>
                <span className="text-[14.5px] font-semibold leading-5 text-navy-800"><Words text={o.label} /></span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {form.type === "checklist" ? (
        <fieldset className="space-y-2">
          <legend className="rv-label"><Words text={form.instruction} /></legend>
          <div className="grid gap-1.5">
            {form.items.map((item) => {
              const on = ticked.includes(item.id);
              return (
                <button key={item.id} type="button" role="checkbox" aria-checked={on} onClick={() => setTicked((list) => (on ? list.filter((x) => x !== item.id) : [...list, item.id]))} className={"rv-card flex w-full items-center gap-3 text-left " + (on ? "rv-card-on" : "")}>
                  <span className={"grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 " + (on ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300")}>{on ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}</span>
                  <span className="text-[14px] font-semibold leading-5 text-navy-800"><Words text={item.text} /></span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {form.type === "sbst" ? (
        <div className="space-y-4">
          <p className="text-[14px] leading-6 text-slate-700"><Words text={form.instruction} /></p>
          {form.items.map((item) => (
            <fieldset key={item.id} className="space-y-1.5">
              <legend className="rv-label"><Words text={item.prompt} /></legend>
              <div className={"grid gap-1.5 " + (item.options.length > 2 ? "" : "sm:grid-cols-2")}>
                {item.options.map((o) => (
                  <button key={o.value} type="button" role="radio" aria-checked={choices[item.id] === o.value} onClick={() => setChoices((s) => ({ ...s, [item.id]: o.value }))} className={"rv-card text-left " + (choices[item.id] === o.value ? "rv-card-on" : "")}>
                    <span className="text-[14px] font-semibold text-navy-800"><Words text={o.label} /></span>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}

      {lang === "ru" ? <p className="rounded-xl bg-slate-50 px-3 py-2 text-[12.5px] leading-5 text-slate-600"><T en="" ru="Roman Urdu sirf samajhne mein madad ke liye hai. Asal (official) lafz English mein hain, jo har line ke neeche likhe hain." /></p> : null}
      {error ? <p className="rv-error" role="alert">{error}</p> : null}
      <button type="button" className="rv-btn rv-btn-primary" disabled={!ready || pending} onClick={() => onSubmit(answers)} data-timepoint={timepoint}>
        <Send className="h-4 w-4" aria-hidden="true" /> {pending ? <T en="Sending…" ru="Bhej rahe hain…" /> : <T en="Send my answers" ru="Mere jawab bhejein" />}
      </button>
    </div>
  );
}
