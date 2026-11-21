"use client";

/**
 * The symptom checker's questions inside the RehabVerse assessment: the same body pictures, the same location choices and the same symptom
 * clues as the public checker (same dark console look), but with RehabVerse's own "how did it start / how long" options and without a second
 * safety step (the assessment has its own, fuller safety questions) or a result (the result comes after the physiotherapist's form is sent).
 *
 * It only collects answers; the wizard turns them into the assessment and the server builds the screening snapshot from the raw answers.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { commonHistoryOptions, regions, type RegionId } from "@/lib/msk-symptom-checker";
import { checkerCopy } from "@/lib/symptom/copy";
import { optionText, regionText, type CheckerLang } from "@/lib/symptom/ru";
import { INTAKE_DURATION, INTAKE_ONSET } from "@/lib/rehabverse/intake";
import { ChoiceGroup, ClueList, LocationGrid, RegionGrid, TRAUMA_ONLY_CLUES, visibleCluesFor } from "./parts";
import { AnatomyRegionVisual } from "./AnatomyRegionVisual";
import { ageBandForYears } from "@/lib/symptom/snapshot";

export type FlowAnswers = {
  region: RegionId | null;
  /** RehabVerse ids (INTAKE_ONSET / INTAKE_DURATION) and the checker's own impact id. */
  onset: string;
  duration: string;
  impact: string;
  location: string;
  clues: string[];
};
export const EMPTY_FLOW: FlowAnswers = { region: null, onset: "", duration: "", impact: "", location: "", clues: [] };

type FlowStep = 0 | 1 | 2 | 3;

export function SymptomFlow({
  lang,
  ageYears,
  value,
  onChange,
  onDone,
}: {
  lang: CheckerLang;
  ageYears: number;
  value: FlowAnswers;
  onChange: (next: FlowAnswers) => void;
  /** Called when the person has finished the last question. */
  onDone: (answers: FlowAnswers) => void;
}) {
  const t = checkerCopy(lang);
  const [step, setStep] = useState<FlowStep>(value.region ? 1 : 0);
  const [message, setMessage] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const region = regions.find((item) => item.id === value.region) ?? null;
  const regionWords = region ? regionText(lang, region) : null;
  const patch = (next: Partial<FlowAnswers>) => onChange({ ...value, ...next });

  const visibleClues = useMemo(() => visibleCluesFor(region, value.onset === "sudden", ageBandForYears(ageYears)), [region, value.onset, ageYears]);
  // Answers that only make sense after an injury are cleared when the person says it did not start with one.
  useEffect(() => {
    if (value.onset === "sudden") return;
    const kept = value.clues.filter((id) => !TRAUMA_ONLY_CLUES.has(id));
    if (kept.length !== value.clues.length) onChange({ ...value, clues: kept });
  }, [value, onChange]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const names = [t.steps[0], t.rehab.historyTitle, t.steps[2], t.steps[3]];
  const choose = (id: RegionId) => {
    patch({ region: id, location: "", clues: [] });
    setMessage("");
    setStep(1);
  };
  const toggleClue = (id: string) => patch({ clues: value.clues.includes(id) ? value.clues.filter((x) => x !== id) : [...value.clues, id] });
  const next = () => {
    setMessage("");
    if (step === 1 && (!value.onset || !value.duration || !value.impact)) return setMessage(t.rehab.errHistory);
    if (step === 2 && !value.location) return setMessage(t.errors.location);
    if (step === 3) return onDone(value);
    setStep((current) => (current + 1) as FlowStep);
  };
  const back = () => {
    setMessage("");
    setStep((current) => Math.max(0, current - 1) as FlowStep);
  };

  return (
    <div className="sc-wrap sc-embedded">
      <div className="sc" data-step={step} data-lang={lang}>
        <header className="sc-head">
          <div className="sc-head-top">
            <div>
              <p className="sc-kicker">{t.rehab.kicker}</p>
              <h2 className="sc-title" tabIndex={-1} ref={headingRef}>
                {names[step]} <span>{t.stepOf(step + 1, 4)}</span>
              </h2>
            </div>
          </div>
          <div className="sc-bar" aria-hidden="true"><div style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
        </header>

        <div className="sc-body" key={step}>
          {step === 0 && (
            <section>
              <p className="sc-eyebrow">{t.start.eyebrow}</p>
              <h3 className="sc-h">{t.start.title}</h3>
              <p className="sc-lead">{t.start.lead}</p>
              <RegionGrid lang={lang} onPick={choose} />
            </section>
          )}

          {step === 1 && region && (
            <section>
              <p className="sc-eyebrow">{t.history.eyebrow}</p>
              <h3 className="sc-h">{t.rehab.historyTitle}</h3>
              <p className="sc-lead">{t.rehab.historyLead}</p>
              <ChoiceGroup title={t.rehab.onset} options={INTAKE_ONSET.map((o) => ({ id: o.id, label: o.label[lang === "ru" ? "ru" : "en"] }))} value={value.onset} onChange={(id) => patch({ onset: id })} />
              <ChoiceGroup title={t.rehab.duration} options={INTAKE_DURATION.map((o) => ({ id: o.id, label: o.label[lang === "ru" ? "ru" : "en"] }))} value={value.duration} onChange={(id) => patch({ duration: id })} />
              <ChoiceGroup title={t.rehab.impact} options={commonHistoryOptions.impact.map((o) => ({ id: o.id, label: optionText(lang, o.id, o.label) }))} value={value.impact} onChange={(id) => patch({ impact: id })} />
            </section>
          )}

          {step === 2 && region && (
            <section>
              <div className="sc-split">
                <div>
                  <p className="sc-eyebrow">{t.location.eyebrow}</p>
                  <h3 className="sc-h">{t.location.title}</h3>
                  <p className="sc-lead">{t.location.lead}</p>
                </div>
                <div className="sc-figure sc-figure-lg" aria-hidden="true">
                  <AnatomyRegionVisual region={region.id} className="h-40 w-auto" />
                  <i />
                  {regionWords ? <span className="sc-tag">{regionWords.label}</span> : null}
                </div>
              </div>
              <LocationGrid lang={lang} options={region.locations} value={value.location} onChange={(id) => patch({ location: id })} />
            </section>
          )}

          {step === 3 && region && (
            <section>
              <p className="sc-eyebrow">{t.clues.eyebrow}</p>
              <h3 className="sc-h">{t.clues.title}</h3>
              <p className="sc-lead">{t.clues.lead}</p>
              <p className="sc-count" aria-live="polite">{t.clues.count(value.clues.length)}</p>
              <ClueList lang={lang} items={visibleClues} selected={new Set(value.clues)} onToggle={toggleClue} />
            </section>
          )}

          {message ? <p className="sc-error" role="alert">{message}</p> : null}

          {step > 0 ? (
            <div className="sc-nav">
              <button type="button" onClick={back} className="sc-btn sc-btn-ghost"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t.nav.back}</button>
              <button type="button" onClick={next} className="sc-btn sc-btn-primary">
                {step === 3 ? <><Check className="h-4 w-4" aria-hidden="true" /> {t.rehab.next}</> : <>{t.nav.next} <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
