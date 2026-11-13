"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { submitAssessmentAction, type IntakeResult } from "@/app/rehabverse/actions";
import { INTAKE_DURATION, INTAKE_REGIONS, INTAKE_RED_FLAGS, INTAKE_SYMPTOMS, PAIN_WORDS, type Option } from "@/lib/rehabverse/intake";
import { GUIDE, TOPIC_RED_FLAGS } from "@/lib/rehabverse/guide";
import { GuideStage } from "./GuideStage";
import { T, useRvLang } from "./useLang";

const STEPS = ["area", "symptoms", "pain", "history", "better", "life", "safety", "words"] as const;
type Step = (typeof STEPS)[number];

const painColour = (n: number) => (n <= 3 ? "#0db3aa" : n <= 6 ? "#d99a00" : "#d6293a");

type Form = {
  regions: string[]; symptoms: string[]; other_symptoms: string;
  pain_now: number | null; pain_worst: number | null; pain_best: number | null;
  duration: string; onset: string; possible_cause: string;
  aggravating: string; relieving: string;
  functional_limitations: string; previous_treatment: string; medical_conditions: string; medications: string;
  red_flags: string[]; no_red_flags: boolean; own_words: string;
};
const EMPTY: Form = {
  regions: [], symptoms: [], other_symptoms: "", pain_now: null, pain_worst: null, pain_best: null, duration: "", onset: "", possible_cause: "",
  aggravating: "", relieving: "", functional_limitations: "", previous_treatment: "", medical_conditions: "", medications: "", red_flags: [], no_red_flags: false, own_words: "",
};

const ONSET: Option[] = [
  { id: "sudden", label: { en: "Suddenly (an injury or one moment)", ru: "Achanak (chot ya ek lamhe mein)" } },
  { id: "gradual", label: { en: "Slowly, over time", ru: "Aahista aahista, waqt ke saath" } },
  { id: "after_surgery", label: { en: "After surgery or a procedure", ru: "Operation ya procedure ke baad" } },
  { id: "unknown", label: { en: "I am not sure", ru: "Mujhe pata nahi" } },
];

function Choice({ option, on, onClick, multi }: { option: Option; on: boolean; onClick: () => void; multi?: boolean }) {
  const [lang] = useRvLang();
  return (
    <button type="button" role={multi ? "checkbox" : "radio"} aria-checked={on} onClick={onClick} className={"rv-card flex w-full items-center gap-3 text-left " + (on ? "rv-card-on" : "")}>
      <span className={"grid h-5 w-5 shrink-0 place-items-center border-2 " + (multi ? "rounded-md " : "rounded-full ") + (on ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300")}>
        {on ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      </span>
      <span className="text-[14.5px] font-semibold leading-5 text-navy-800">{option.label[lang]}</span>
    </button>
  );
}

function Pain({ label, value, onChange, required }: { label: React.ReactNode; value: number | null; onChange: (n: number) => void; required?: boolean }) {
  const [lang] = useRvLang();
  return (
    <fieldset>
      <legend className="rv-label">{label}{required ? " *" : ""}</legend>
      <div className="rv-nprs">
        {Array.from({ length: 11 }, (_, n) => (
          <button key={n} type="button" aria-pressed={value === n} aria-label={`${n} — ${PAIN_WORDS[n][lang]}`} onClick={() => onChange(n)} style={value === n ? { background: painColour(n) } : undefined}>{n}</button>
        ))}
      </div>
      <p className="rv-hint" aria-live="polite">{value === null ? <T en="0 = no pain, 10 = worst pain you can imagine" ru="0 = dard nahi, 10 = sab se zyada dard jo aap soch sakein" /> : `${value}/10 — ${PAIN_WORDS[value][lang]}`}</p>
    </fieldset>
  );
}

function Area({ id, label, value, onChange, hint, rows = 3, max = 600 }: { id: string; label: React.ReactNode; value: string; onChange: (v: string) => void; hint?: React.ReactNode; rows?: number; max?: number }) {
  return (
    <div>
      <label className="rv-label" htmlFor={id}>{label}</label>
      <textarea id={id} rows={rows} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} className="rv-input" />
      {hint ? <p className="rv-hint">{hint}</p> : null}
    </div>
  );
}

export function IntakeWizard() {
  const [lang] = useRvLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IntakeResult | null>(null);
  const token = useRef<string>("");
  useEffect(() => {
    token.current = crypto.randomUUID();
  }, []);
  const top = useRef<HTMLDivElement>(null);

  const step: Step = STEPS[stepIndex];
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key: "regions" | "symptoms" | "red_flags", id: string) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id], ...(key === "red_flags" ? { no_red_flags: false } : {}) }));

  const valid = useMemo(() => {
    if (step === "area") return form.regions.length > 0;
    if (step === "pain") return form.pain_now !== null;
    if (step === "safety") return form.no_red_flags || form.red_flags.length > 0;
    return true;
  }, [step, form]);

  const go = (to: number) => {
    setError(null);
    setStepIndex(to);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const r = await submitAssessmentAction({
        client_token: token.current,
        regions: form.regions, symptoms: form.symptoms, pain_now: form.pain_now ?? 0,
        pain_worst: form.pain_worst ?? undefined, pain_best: form.pain_best ?? undefined,
        duration: form.duration || undefined, onset: form.onset || undefined, possible_cause: form.possible_cause || undefined,
        aggravating: form.aggravating || undefined, relieving: form.relieving || undefined,
        functional_limitations: form.functional_limitations || undefined, previous_treatment: form.previous_treatment || undefined,
        medical_conditions: form.medical_conditions || undefined, medications: form.medications || undefined,
        other_symptoms: form.other_symptoms || undefined, own_words: form.own_words || undefined,
        red_flags: form.red_flags,
      });
      if (!r.ok) {
        if (r.code === "open_assessment_exists") return router.replace("/rehabverse/me");
        return setError(r.code === "too many submissions" ? "rate" : "failed");
      }
      setResult(r.result);
      router.refresh();
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const beats = result ? (result.red_flag_level === "none" ? GUIDE.submitted : GUIDE.flagged) : step === "safety" ? GUIDE.intakeSafety : GUIDE.intake;

  /* ───────────────────────── result ───────────────────────── */
  if (result) {
    const flagged = result.red_flag_level !== "none";
    return (
      <div ref={top} className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rv-glass space-y-4 p-5 sm:p-7 rv-fade-up">
          {flagged ? (
            <>
              <span className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold " + (result.red_flag_level === "emergency" ? "rv-chip-rose" : "rv-chip-amber")}><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> <T en="Please get checked first" ru="Pehle check karwayein" /></span>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Your answers need a clinician before any exercise." ru="Aap ke jawabat ke mutabiq exercise se pehle clinician ka check zaroori hai." /></h1>
              <p className="text-[15px] leading-7 text-slate-700"><T en="No exercise programme has been started. Your physiotherapist has been alerted and will follow this up." ru="Koi exercise programme shuru nahi kiya gaya. Aap ke physiotherapist ko alert bhej diya gaya hai aur wo is par follow-up karenge." /></p>
              <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-6 text-slate-700">
                <li><T en="Book a clinical assessment with Physio Nexus Academy, or see your doctor." ru="Physio Nexus Academy se clinical assessment book karein, ya apne doctor ko dikhayein." /></li>
                {result.red_flag_level === "emergency" ? (
                  <li className="font-bold text-[#a1121f]"><T en="Because of what you reported, please seek urgent medical care today — your local emergency number (for example 1122 in much of Pakistan) or the nearest emergency department." ru="Jo aap ne bataya uski wajah se aaj hi foran medical madad lein — apna local emergency number (jaise Pakistan mein aksar jagah 1122) ya qareebi emergency department." /></li>
                ) : (
                  <li><T en="If your symptoms get worse, or you develop new weakness, numbness or trouble with bladder or bowel control, seek urgent care." ru="Agar alamaat barhein, ya nayi kamzori, sunn-pan ya peshab/pakhane par control mein mushkil ho to foran medical madad lein." /></li>
                )}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Link href="/appointment" className="rv-btn rv-btn-primary"><T en="Book an assessment" ru="Assessment book karein" /></Link>
                <Link href="/rehabverse/me" className="rv-btn rv-btn-ghost"><T en="My dashboard" ru="Mera dashboard" /></Link>
              </div>
            </>
          ) : (
            <>
              <span className="rv-chip rv-chip-teal inline-flex items-center gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> <T en="Assessment received" ru="Assessment mil gaya" /></span>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Thank you — your physiotherapist will review it." ru="Shukriya — aap ke physiotherapist isay review karenge." /></h1>
              <p className="text-[15px] leading-7 text-slate-700"><T en="You will see your programme on your dashboard once it is ready and approved. Please do not start exercises on your own until then." ru="Programme tayyar aur approve hote hi aap ke dashboard par nazar aayega. Tab tak apni marzi se exercises shuru na karein." /></p>
              {result.reference_code ? <p className="text-sm text-slate-600"><T en="Your reference:" ru="Aap ka reference:" /> <b>{result.reference_code}</b></p> : null}
              <Link href="/rehabverse/me" className="rv-btn rv-btn-primary"><T en="Go to my dashboard" ru="Mere dashboard par jayein" /> <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </>
          )}
        </div>
        <GuideStage beats={beats} restartKey={flagged ? "flagged" : "submitted"} />
      </div>
    );
  }

  /* ───────────────────────── wizard ───────────────────────── */
  return (
    <div ref={top} className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      <div className="rv-glass p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={stepIndex + 1}>
            <div className="h-full rounded-full bg-gradient-to-r from-[#0a1f3d] to-[#0db3aa] transition-[width] duration-300" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-500">{stepIndex + 1}/{STEPS.length}</span>
        </div>

        <div key={step} className="rv-fade-up space-y-4">
          {step === "area" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Where is the problem?" ru="Takleef kahan hai?" /></h1>
              <p className="text-sm text-slate-600"><T en="Choose every area that bothers you." ru="Jitni jagah takleef ho sab chunein." /></p>
              <div className="grid gap-2 sm:grid-cols-2">{INTAKE_REGIONS.map((o) => <Choice key={o.id} option={o} multi on={form.regions.includes(o.id)} onClick={() => toggle("regions", o.id)} />)}</div>
            </>
          ) : null}

          {step === "symptoms" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="What are you feeling?" ru="Aap kya mehsoos kar rahe hain?" /></h1>
              <p className="text-sm text-slate-600"><T en="Choose all that fit." ru="Jo bhi lagu ho wo chunein." /></p>
              <div className="grid gap-2 sm:grid-cols-2">{INTAKE_SYMPTOMS.map((o) => <Choice key={o.id} option={o} multi on={form.symptoms.includes(o.id)} onClick={() => toggle("symptoms", o.id)} />)}</div>
              {form.symptoms.includes("other") ? <Area id="other_symptoms" rows={2} label={<T en="Tell us about it" ru="Is ke baare mein bataein" />} value={form.other_symptoms} onChange={(v) => set("other_symptoms", v)} /> : null}
            </>
          ) : null}

          {step === "pain" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="How strong is the pain?" ru="Dard kitna tez hai?" /></h1>
              <Pain required label={<T en="Right now" ru="Abhi" />} value={form.pain_now} onChange={(n) => set("pain_now", n)} />
              <Pain label={<T en="At its worst (last week)" ru="Sab se zyada (pichle hafte)" />} value={form.pain_worst} onChange={(n) => set("pain_worst", n)} />
              <Pain label={<T en="At its best (last week)" ru="Sab se kam (pichle hafte)" />} value={form.pain_best} onChange={(n) => set("pain_best", n)} />
              <p className="text-xs text-slate-500"><T en="If you have no pain but another problem, choose 0." ru="Agar dard nahi lekin koi aur masla hai to 0 chunein." /></p>
            </>
          ) : null}

          {step === "history" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="How long, and how did it start?" ru="Kitne arse se, aur kaise shuru hua?" /></h1>
              <div className="grid gap-2 sm:grid-cols-2">{INTAKE_DURATION.map((o) => <Choice key={o.id} option={o} on={form.duration === o.id} onClick={() => set("duration", o.id)} />)}</div>
              <p className="rv-label pt-1"><T en="It started…" ru="Ye shuru hua…" /></p>
              <div className="grid gap-2 sm:grid-cols-2">{ONSET.map((o) => <Choice key={o.id} option={o} on={form.onset === o.id} onClick={() => set("onset", o.id)} />)}</div>
              <Area id="cause" rows={2} label={<T en="Do you know what caused it? (optional)" ru="Kya pata hai ye kis wajah se hua? (zaroori nahi)" />} value={form.possible_cause} onChange={(v) => set("possible_cause", v)} />
            </>
          ) : null}

          {step === "better" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="What makes it worse or better?" ru="Kis cheez se barhta ya kam hota hai?" /></h1>
              <Area id="aggravating" label={<T en="Makes it worse" ru="Isay barhata hai" />} value={form.aggravating} onChange={(v) => set("aggravating", v)} hint={<T en="For example: sitting long, climbing stairs, lifting, lying on that side." ru="Misaal: der tak baithna, seedhiyan chadhna, wazan uthana, us taraf let-na." />} />
              <Area id="relieving" label={<T en="Makes it better" ru="Isay kam karta hai" />} value={form.relieving} onChange={(v) => set("relieving", v)} hint={<T en="For example: rest, walking, heat, certain positions." ru="Misaal: aaram, chalna, sekai, kuch positions." />} />
            </>
          ) : null}

          {step === "life" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="Your daily life and health" ru="Aap ki rozmarra zindagi aur sehat" /></h1>
              <Area id="functional" label={<T en="What is hard to do now?" ru="Ab kya karna mushkil ho gaya hai?" />} value={form.functional_limitations} onChange={(v) => set("functional_limitations", v)} hint={<T en="Walking, work, sleep, prayer, driving, lifting, sport…" ru="Chalna, kaam, neend, namaz, gaari chalana, wazan uthana, khel…" />} />
              <Area id="prev" label={<T en="Any treatment you have already had?" ru="Pehle koi ilaj karwaya hai?" />} value={form.previous_treatment} onChange={(v) => set("previous_treatment", v)} rows={2} />
              <Area id="conditions" label={<T en="Other medical conditions (optional)" ru="Koi aur bimari (zaroori nahi)" />} value={form.medical_conditions} onChange={(v) => set("medical_conditions", v)} rows={2} hint={<T en="For example: diabetes, blood pressure, heart or thyroid problems." ru="Misaal: sugar, blood pressure, dil ya thyroid ka masla." />} />
              <Area id="meds" label={<T en="Medicines you take (optional)" ru="Jo dawaiyan lete hain (zaroori nahi)" />} value={form.medications} onChange={(v) => set("medications", v)} rows={2} />
            </>
          ) : null}

          {step === "safety" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="A few safety questions" ru="Kuch safety sawal" /></h1>
              <p className="text-sm text-slate-600"><T en="Do any of these apply to you right now, or since this problem started?" ru="Kya inmein se koi aap par abhi lagu hai, ya is masle ke shuru hone ke baad se?" /></p>
              <div className="grid gap-2">
                {INTAKE_RED_FLAGS.map((o) => <Choice key={o.id} option={o} multi on={form.red_flags.includes(o.id)} onClick={() => toggle("red_flags", o.id)} />)}
                <Choice multi option={{ id: "none", label: { en: "None of these apply to me", ru: "Inmein se koi mujh par lagu nahi" } }} on={form.no_red_flags} onClick={() => setForm((f) => ({ ...f, no_red_flags: !f.no_red_flags, red_flags: !f.no_red_flags ? [] : f.red_flags }))} />
              </div>
              <p className="rv-hint"><T en="A ‘yes’ is not a diagnosis — it simply means we arrange a proper check before any exercise." ru="‘Haan’ diagnosis nahi — iska matlab bas ye hai ke exercise se pehle proper check ka intezam hoga." /></p>
            </>
          ) : null}

          {step === "words" ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-navy-800"><T en="In your own words" ru="Apne alfaaz mein" /></h1>
              <Area id="own" rows={5} max={2000} label={<T en="Anything else you want your physiotherapist to know?" ru="Aur kuch jo aap chahte hain physiotherapist jaan lein?" />} value={form.own_words} onChange={(v) => set("own_words", v)} hint={<T en="You can write in English or Urdu, however you speak." ru="English ya Urdu mein, jaise aap bolte hain waise likhein." />} />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[13px] leading-5 text-slate-600">
                <b className="text-navy-800"><T en="Summary" ru="Khulasa" /></b>
                <p className="mt-1">
                  {form.regions.map((r) => INTAKE_REGIONS.find((o) => o.id === r)?.label[lang]).join(", ")} · <T en="pain now" ru="abhi dard" /> {form.pain_now}/10
                  {form.pain_now !== null ? ` (${PAIN_WORDS[form.pain_now][lang]})` : ""}
                  {form.red_flags.length ? ` · ${form.red_flags.length} ${lang === "ru" ? "safety jawab ‘haan’" : "safety answer(s) ‘yes’"}` : ""}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {error ? <p className="rv-error mt-3" role="alert">{error === "rate" ? <T en="You have sent several assessments today. Please wait and try again tomorrow." ru="Aaj aap ne kai assessments bhej diye hain. Kal dobara koshish karein." /> : <T en="We could not send it. Please check your connection and try again." ru="Bheja nahi ja saka. Apna internet check karke dobara koshish karein." />}</p> : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" className="rv-btn rv-btn-ghost" onClick={() => go(stepIndex - 1)} disabled={stepIndex === 0 || pending}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> <T en="Back" ru="Wapis" /></button>
          {stepIndex < STEPS.length - 1 ? (
            <button type="button" className="rv-btn rv-btn-primary" onClick={() => go(stepIndex + 1)} disabled={!valid}><T en="Next" ru="Aage" /> <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          ) : (
            <button type="button" className="rv-btn rv-btn-primary" onClick={submit} disabled={pending || form.pain_now === null || form.regions.length === 0}><Send className="h-4 w-4" aria-hidden="true" /> {pending ? <T en="Sending…" ru="Bhej rahe hain…" /> : <T en="Send to my physiotherapist" ru="Physiotherapist ko bhejein" />}</button>
          )}
        </div>
      </div>
      <div className="lg:sticky lg:top-24">
        <GuideStage beats={beats} restartKey={step === "safety" ? "safety" : "intro"} extraTopics={step === "safety" ? [TOPIC_RED_FLAGS] : []} compact autoPlay={step === "area" || step === "safety"} />
      </div>
    </div>
  );
}
