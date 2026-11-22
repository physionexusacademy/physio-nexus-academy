"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Home,
  Info,
  PersonStanding,
  RotateCcw,
  ShieldAlert,
  Siren,
  Stethoscope,
} from "lucide-react";
import { AnatomyRegionVisual } from "@/components/symptom/AnatomyRegionVisual";
import { ChoiceGroup, ClueList, LocationGrid, PainSlider, PatternCard, PatternHeadline, RegionGrid, TRAUMA_ONLY_CLUES, visibleCluesFor } from "@/components/symptom/parts";
import { REGION_COUNTS, REGION_PLAIN, libraryHref, regionForChecker } from "@/lib/rehabverse/area-map";
import {
  commonHistoryOptions,
  compatibilityLabel,
  getCarePriority,
  getImagingNotice,
  getNeurologicHint,
  getOverlapNote,
  getSafetyDisposition,
  redFlags,
  regions,
  scoreConditions,
  type RegionId,
} from "@/lib/msk-symptom-checker";
import { buildSummaryText } from "@/lib/msk-symptom-summary";
import { useLang, writeLang } from "@/lib/lang";
import { checkerCopy } from "@/lib/symptom/copy";
import { saveHandover } from "@/lib/symptom/handover";
import { careText, flagText, imagingText, neuroText, optionText, overlapText, regionText, safetyTitle, type CheckerLang } from "@/lib/symptom/ru";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const PRIORITY_LEVEL: Record<string, number> = {
  "Monitor and assess as needed": 0,
  "Professional assessment recommended": 1,
  "Prompt professional assessment recommended": 2,
};

export function SymptomCheckerClient() {
  const [siteLang] = useLang();
  const lang: CheckerLang = siteLang === "ur" ? "ru" : "en";
  const t = checkerCopy(lang);
  const steps = t.steps;
  const [step, setStep] = useState<Step>(0);
  const [regionId, setRegionId] = useState<RegionId | null>(null);
  const [age, setAge] = useState("");
  const [onset, setOnset] = useState("");
  const [duration, setDuration] = useState("");
  const [impact, setImpact] = useState("");
  const [pain, setPain] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [clues, setClues] = useState<Set<string>>(new Set());
  const [selectedRedFlags, setSelectedRedFlags] = useState<Set<string>>(new Set());
  const [noRedFlags, setNoRedFlags] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const consoleRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const region = regions.find((item) => item.id === regionId) ?? null;

  const selectedFeatures = useMemo(() => {
    const values = new Set<string>();
    [age, onset, duration, impact, location].filter(Boolean).forEach((item) => values.add(item));
    clues.forEach((item) => values.add(item));
    return values;
  }, [age, onset, duration, impact, location, clues]);

  const results = useMemo(() => (regionId ? scoreConditions(regionId, selectedFeatures) : []), [regionId, selectedFeatures]);
  const imagingNotice = useMemo(() => (regionId ? getImagingNotice(regionId, selectedFeatures) : null), [regionId, selectedFeatures]);
  const neurologicHint = useMemo(() => (regionId ? getNeurologicHint(regionId, selectedFeatures) : null), [regionId, selectedFeatures]);
  const overlapNote = useMemo(() => getOverlapNote(results), [results]);

  const visibleClues = useMemo(() => visibleCluesFor(region, onset === "onset_trauma", age), [region, onset, age]);

  useEffect(() => {
    if (onset === "onset_trauma") return;
    setClues((current) => {
      const next = new Set(current);
      let changed = false;
      TRAUMA_ONLY_CLUES.forEach((id) => {
        if (next.delete(id)) changed = true;
      });
      return changed ? next : current;
    });
  }, [onset]);

  // Every step change brings the console into view and moves keyboard/screen-reader focus to its heading.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const top = (consoleRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 84;
      if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  const carePriority = useMemo(() => getCarePriority(selectedFeatures, pain), [selectedFeatures, pain]);
  const safetyDisposition = useMemo(() => getSafetyDisposition(selectedRedFlags), [selectedRedFlags]);
  const selectedFlagObjects = safetyDisposition?.flags ?? [];
  const hasEmergencyFlag = safetyDisposition?.level === "emergency";

  const toggleClue = (id: string) => {
    setClues((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRedFlag = (id: string) => {
    setSelectedRedFlags((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setNoRedFlags(false);
  };

  const chooseRegion = (id: RegionId) => {
    setRegionId(id);
    setLocation("");
    setClues(new Set());
    setMessage("");
    setStep(1);
  };

  const next = () => {
    setMessage("");
    if (step === 1 && (!age || !onset || !duration || !impact)) {
      setMessage(t.errors.history);
      return;
    }
    if (step === 2 && !location) {
      setMessage(t.errors.location);
      return;
    }
    if (step === 4 && selectedRedFlags.size === 0 && !noRedFlags) {
      setMessage(t.errors.safety);
      return;
    }
    setStep((current) => Math.min(5, current + 1) as Step);
  };

  const back = () => {
    setMessage("");
    setStep((current) => Math.max(0, current - 1) as Step);
  };

  const restart = () => {
    setStep(0);
    setRegionId(null);
    setAge("");
    setOnset("");
    setDuration("");
    setImpact("");
    setPain(null);
    setLocation("");
    setClues(new Set());
    setSelectedRedFlags(new Set());
    setNoRedFlags(false);
    setMessage("");
    setCopied("idle");
  };

  const summary = useMemo(
    () =>
      region
        ? buildSummaryText({ region, selected: selectedFeatures, pain, results, priority: carePriority, imaging: imagingNotice, flagIds: selectedRedFlags })
        : "",
    [region, selectedFeatures, pain, results, carePriority, imagingNotice, selectedRedFlags],
  );

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied((value) => (value === "done" ? "idle" : value)), 2500);
  }

  const topResult = results[0];
  const reason = imagingNotice
    ? `${region?.label ?? "MSK"} acute injury — fracture screening suggests in-person assessment / possible radiography before routine MSK diagnosis.`
    : topResult
      ? `${region?.label ?? "MSK"} symptoms — screening pattern most compatible with ${topResult.condition.name}. Screening is not a confirmed diagnosis.`
      : `${region?.label ?? "Musculoskeletal"} symptoms — completed PNA MSK symptom screening; professional assessment requested.`;
  const appointmentHref = `/appointment?reason=${encodeURIComponent(reason)}`;
  const priorityLevel = PRIORITY_LEVEL[carePriority.label] ?? 0;
  const exerciseRegion = regionId ? regionForChecker(regionId) : null;
  const regionWords = region ? regionText(lang, region) : null;
  const care = careText(lang, carePriority);
  const neuro = neurologicHint ? neuroText(lang, selectedFeatures, neurologicHint) : null;
  const imaging = imagingNotice ? imagingText(lang, imagingNotice) : null;
  const overlap = overlapText(lang, results, overlapNote);

  // The headline answer: the pattern that fits best, shown big. When a fracture screen fired it waits behind the fracture notice, and an urgent priority goes first.
  const headline = topResult && !imagingNotice ? <PatternHeadline lang={lang} result={topResult} /> : null;

  const priorityBlock = (
    <div className="sc-priority" data-level={priorityLevel}>
      <div className="sc-meter" role="img" aria-label={t.result.urgency(priorityLevel + 1)}>
        {t.result.meter.map((name, index) => (
          <span key={index} data-on={index <= priorityLevel}>{name}</span>
        ))}
      </div>
      <div>
        <p className="sc-eyebrow">{t.result.priority}</p>
        <h4>{care.label}</h4>
        <p>{care.detail}</p>
      </div>
    </div>
  );

  return (
    <div className="sc-wrap" ref={consoleRef}>
      <div className="sc" data-step={step} data-lang={lang}>
        <p className="sc-emergency" role="note">
          <Siren className="h-4 w-4" aria-hidden="true" />
          <span>
            <strong>{t.emergencyLead}</strong> {t.emergencyBody}
          </span>
        </p>

        <header className="sc-head">
          <div className="sc-head-top">
            <div>
              <p className="sc-kicker">{t.kicker}</p>
              <h2 className="sc-title" tabIndex={-1} ref={headingRef}>
                {steps[step]} <span>{t.stepOf(step + 1, steps.length)}</span>
              </h2>
            </div>
            <div className="sc-head-side">
              <LangToggle lang={lang} label={t.language} />
              <span className="sc-badge">{t.badge}</span>
            </div>
          </div>
          <ol className="sc-steps" aria-label={t.progress}>
            {steps.map((label, index) => (
              <li key={label} data-state={index < step ? "done" : index === step ? "now" : "todo"} aria-current={index === step ? "step" : undefined}>
                <i aria-hidden="true">{index < step ? <Check className="h-3 w-3" /> : index + 1}</i>
                <span>{label}</span>
              </li>
            ))}
          </ol>
          <div className="sc-bar" aria-hidden="true">
            <div style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </header>

        <div className="sc-body" key={step}>
          {step === 0 && (
            <section>
              <p className="sc-eyebrow">{t.start.eyebrow}</p>
              <h3 className="sc-h">{t.start.title}</h3>
              <p className="sc-lead">{t.start.lead}</p>
              <RegionGrid lang={lang} onPick={chooseRegion} />
            </section>
          )}

          {step === 1 && region && (
            <section>
              <p className="sc-eyebrow">{t.history.eyebrow}</p>
              <h3 className="sc-h">{t.history.title}</h3>
              <p className="sc-lead">{t.history.lead}</p>
              <ChoiceGroup title={t.history.age} options={historyOptions(lang, commonHistoryOptions.age)} value={age} onChange={setAge} />
              <ChoiceGroup title={t.history.onset} options={historyOptions(lang, commonHistoryOptions.onset)} value={onset} onChange={setOnset} />
              <ChoiceGroup title={t.history.duration} options={historyOptions(lang, commonHistoryOptions.duration)} value={duration} onChange={setDuration} />
              <ChoiceGroup title={t.history.impact} options={historyOptions(lang, commonHistoryOptions.impact)} value={impact} onChange={setImpact} />
              <PainSlider copy={t.pain} value={pain} onChange={setPain} />
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
                </div>
              </div>
              <LocationGrid lang={lang} options={region.locations} value={location} onChange={setLocation} />
            </section>
          )}

          {step === 3 && region && (
            <section>
              <p className="sc-eyebrow">{t.clues.eyebrow}</p>
              <h3 className="sc-h">{t.clues.title}</h3>
              <p className="sc-lead">{t.clues.lead}</p>
              <p className="sc-count" aria-live="polite">{t.clues.count(clues.size)}</p>
              <ClueList lang={lang} items={visibleClues} selected={clues} onToggle={toggleClue} />
            </section>
          )}

          {step === 4 && (
            <section>
              <div className="sc-gate">
                <span aria-hidden="true"><ShieldAlert className="h-6 w-6" /></span>
                <div>
                  <p className="sc-eyebrow sc-eyebrow-warn">{t.safety.eyebrow}</p>
                  <h3 className="sc-h">{t.safety.title}</h3>
                  <p className="sc-lead">{t.safety.lead}</p>
                </div>
              </div>
              <div className="sc-list">
                {redFlags.map((flag) => {
                  const checked = selectedRedFlags.has(flag.id);
                  return (
                    <label key={flag.id} className="sc-check sc-flag" data-on={checked} data-level={flag.level}>
                      <input type="checkbox" checked={checked} onChange={() => toggleRedFlag(flag.id)} />
                      <i aria-hidden="true">{checked ? <Check className="h-3.5 w-3.5" /> : null}</i>
                      <span>
                        <b>{flagText(lang, flag).label}</b>
                        <em>{flag.level === "emergency" ? t.safety.emergency : t.safety.urgent}</em>
                      </span>
                    </label>
                  );
                })}
                <label className="sc-check sc-none" data-on={noRedFlags}>
                  <input
                    type="checkbox"
                    checked={noRedFlags}
                    onChange={(event) => {
                      setNoRedFlags(event.target.checked);
                      if (event.target.checked) setSelectedRedFlags(new Set());
                    }}
                  />
                  <i aria-hidden="true">{noRedFlags ? <Check className="h-3.5 w-3.5" /> : null}</i>
                  <span><b>{t.safety.none}</b></span>
                </label>
              </div>
            </section>
          )}

          {step === 5 && region && regionWords && (
            <section aria-live="polite">
              {selectedFlagObjects.length > 0 ? (
                <div>
                  <div className="sc-alert" data-level={hasEmergencyFlag ? "emergency" : "urgent"} role="alert">
                    <AlertTriangle className="h-7 w-7" aria-hidden="true" />
                    <div>
                      <h3>{safetyDisposition ? safetyTitle(lang, safetyDisposition.level, safetyDisposition.title) : t.result.stopTitle}</h3>
                      <p>{t.result.stopBody}</p>
                    </div>
                  </div>
                  <ul className="sc-flagged">
                    {selectedFlagObjects.map((flag) => {
                      const words = flagText(lang, flag);
                      return (
                        <li key={flag.id}>
                          <strong>{words.label}</strong>
                          <span>{words.advice}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="sc-actions">
                    <button type="button" onClick={copySummary} className="sc-btn sc-btn-ghost">
                      <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> {copied === "done" ? t.result.copied : t.result.copyClinician}
                    </button>
                    <button type="button" onClick={restart} className="sc-btn sc-btn-ghost">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t.result.again}
                    </button>
                  </div>
                  {copied === "failed" ? <SummaryBox text={summary} label={t.result.blocked} /> : null}
                </div>
              ) : (
                <div>
                  <div className="sc-result-head">
                    <div className="sc-figure sc-figure-lg" aria-hidden="true">
                      <AnatomyRegionVisual region={region.id} className="h-44 w-auto" />
                      <i />
                      <span className="sc-tag">{regionWords.label}</span>
                    </div>
                    <div>
                      <p className="sc-kicker"><Stethoscope className="inline h-4 w-4" aria-hidden="true" /> {t.result.kicker}</p>
                      <h3 className="sc-h">{t.result.title(regionWords.label)}</h3>
                      <p className="sc-lead">{t.result.lead}</p>
                    </div>
                  </div>

                  {priorityLevel === 2 ? priorityBlock : headline}
                  {priorityLevel === 2 ? headline : priorityBlock}

                  {neuro ? (
                    <div className="sc-note" data-tone="info">
                      <Info className="h-5 w-5" aria-hidden="true" />
                      <div>
                        <p className="sc-eyebrow">{t.result.nerve}</p>
                        <h4>{neuro.label}</h4>
                        <p>{neuro.detail}</p>
                      </div>
                    </div>
                  ) : null}

                  {imaging ? (
                    <div className="sc-note" data-tone="warn">
                      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                      <div>
                        <p className="sc-eyebrow">{t.result.fracture}</p>
                        <h4>{imaging.title}</h4>
                        <p>{imaging.body}</p>
                        <p className="sc-eyebrow sc-mt">{t.result.criteria}</p>
                        <ul>
                          {imaging.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
                        </ul>
                        <p className="sc-strong">{t.result.secondary}</p>
                      </div>
                    </div>
                  ) : null}

                  {overlap ? <p className="sc-overlap"><Info className="h-4 w-4" aria-hidden="true" /> {overlap}</p> : null}

                  {results.length > 0 ? (
                    <div className="sc-results">
                      {results.slice(0, 3).map((result, index) => <PatternCard key={result.condition.id} lang={lang} result={result} index={index} underHeadline={index === 0 && Boolean(headline)} />)}
                    </div>
                  ) : (
                    <div className="sc-note" data-tone="plain">
                      <Info className="h-5 w-5" aria-hidden="true" />
                      <div>
                        <h4>{t.result.noneTitle}</h4>
                        <p>{t.result.noneBody}</p>
                      </div>
                    </div>
                  )}

                  {exerciseRegion && priorityLevel < 2 && !imagingNotice ? (
                    <div className="sc-bridge">
                      <div>
                        <h4><PersonStanding className="inline h-5 w-5" aria-hidden="true" /> {t.result.exercisesTitle(REGION_PLAIN[exerciseRegion].toLowerCase())}</h4>
                        <p>{t.result.exercisesBody(REGION_COUNTS[exerciseRegion])}</p>
                      </div>
                      <a href={libraryHref(exerciseRegion, "checker")} className="sc-btn sc-btn-ghost">{t.result.exercisesLink} <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                    </div>
                  ) : null}

                  <div className="sc-cta">
                    <div>
                      <h4><CheckCircle2 className="inline h-5 w-5" aria-hidden="true" /> {t.result.needTitle}</h4>
                      <p>{t.result.needBody}</p>
                    </div>
                    <div className="sc-actions">
                      <a href={appointmentHref} className="sc-btn sc-btn-primary"><CalendarDays className="h-4 w-4" aria-hidden="true" /> {t.result.book}</a>
                      <a href="/home-visit" className="sc-btn sc-btn-ghost"><Home className="h-4 w-4" aria-hidden="true" /> {t.result.home}</a>
                    </div>
                  </div>

                  <div className="sc-cta sc-handover">
                    <div>
                      <h4><Stethoscope className="inline h-5 w-5" aria-hidden="true" /> {t.result.handoverTitle}</h4>
                      <p>{t.result.handoverBody}</p>
                    </div>
                    <div className="sc-actions">
                      <a
                        href="/rehabverse/start"
                        onClick={() => saveHandover({ region: region.id, answers: [...selectedFeatures], language: lang })}
                        className="sc-btn sc-btn-primary"
                      >
                        {t.result.handoverButton} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <div className="sc-actions">
                    <button type="button" onClick={copySummary} className="sc-btn sc-btn-ghost">
                      <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> {copied === "done" ? t.result.copied : t.result.copyMine}
                    </button>
                    <button type="button" onClick={restart} className="sc-btn sc-btn-ghost">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t.result.anotherProblem}
                    </button>
                  </div>
                  {copied === "failed" ? <SummaryBox text={summary} label={t.result.blocked} /> : null}

                  <p className="sc-disclaimer"><Info className="h-5 w-5" aria-hidden="true" /> {t.result.disclaimer}</p>
                </div>
              )}
            </section>
          )}

          {message ? <p className="sc-error" role="alert">{message}</p> : null}

          {step > 0 && step < 5 ? (
            <div className="sc-nav">
              <button type="button" onClick={back} className="sc-btn sc-btn-ghost"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t.nav.back}</button>
              <button type="button" onClick={next} className="sc-btn sc-btn-primary">
                {step === 4 ? t.nav.show : t.nav.next} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The checker's own English / Roman Urdu switch: the same choice as the site switch in the header. */
function LangToggle({ lang, label }: { lang: CheckerLang; label: string }) {
  return (
    <div className="sc-lang" role="group" aria-label={label}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => writeLang("en")}>English</button>
      <button type="button" aria-pressed={lang === "ru"} onClick={() => writeLang("ur")}>Roman Urdu</button>
    </div>
  );
}

function SummaryBox({ text, label }: { text: string; label: string }) {
  return (
    <label className="sc-summary">
      <span>{label}</span>
      <textarea readOnly rows={10} value={text} onFocus={(event) => event.currentTarget.select()} />
    </label>
  );
}

const historyOptions = (lang: CheckerLang, options: Array<{ id: string; label: string }>) => options.map((item) => ({ id: item.id, label: optionText(lang, item.id, item.label) }));
