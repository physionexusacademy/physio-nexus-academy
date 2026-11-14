"use client";

import "./symptom-checker.css";
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
  RotateCcw,
  ShieldAlert,
  Siren,
  Stethoscope,
} from "lucide-react";
import { AnatomyRegionVisual } from "./AnatomyRegionVisual";
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

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const steps = ["Body area", "Your history", "Pain location", "Symptoms", "Safety check", "Result"];

const traumaOnlyClueIds = new Set([
  "clue_knee_age55",
  "clue_knee_fibular_head_tender",
  "clue_knee_patella_isolated_tender",
  "clue_knee_cant_flex90",
  "clue_knee_no_weight_initial",
  "clue_knee_no4steps",
  "clue_ankle_no_weight_initial",
  "clue_ankle_no4steps",
  "clue_ankle_malleolus_tender",
  "clue_ankle_hindfoot_tender",
]);

const PRIORITY_LEVEL: Record<string, number> = {
  "Monitor and assess as needed": 0,
  "Professional assessment recommended": 1,
  "Prompt professional assessment recommended": 2,
};

export function SymptomCheckerClient() {
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

  const visibleClues = useMemo(
    () =>
      region
        ? region.clues.filter((item) => {
            if (traumaOnlyClueIds.has(item.id) && onset !== "onset_trauma") return false;
            if (item.id === "clue_knee_age55") return age === "age_40_59";
            return true;
          })
        : [],
    [region, onset, age],
  );

  useEffect(() => {
    if (onset === "onset_trauma") return;
    setClues((current) => {
      const next = new Set(current);
      let changed = false;
      traumaOnlyClueIds.forEach((id) => {
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
      setMessage("Please choose your age range, how the problem started, how long it has been present and how much it affects daily activity.");
      return;
    }
    if (step === 2 && !location) {
      setMessage("Please choose the location that best matches your symptoms.");
      return;
    }
    if (step === 4 && selectedRedFlags.size === 0 && !noRedFlags) {
      setMessage("Please confirm whether any safety warning applies, or choose ‘None of these apply’.");
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

  return (
    <div className="sc-wrap" ref={consoleRef}>
      <div className="sc" data-step={step}>
        <p className="sc-emergency" role="note">
          <Siren className="h-4 w-4" aria-hidden="true" />
          <span>
            <strong>Emergency?</strong> Chest pain, trouble breathing, sudden weakness or numbness, or loss of bladder/bowel control — call your local emergency number now (1122 in much of Pakistan). This tool is not for emergencies.
          </span>
        </p>

        <header className="sc-head">
          <div className="sc-head-top">
            <div>
              <p className="sc-kicker">PNA MSK Screening Assistant</p>
              <h2 className="sc-title" tabIndex={-1} ref={headingRef}>
                {steps[step]} <span>Step {step + 1} / {steps.length}</span>
              </h2>
            </div>
            <span className="sc-badge">Adults 18+ · Clinical screening</span>
          </div>
          <ol className="sc-steps" aria-label="Progress">
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
              <p className="sc-eyebrow">Start here</p>
              <h3 className="sc-h">Where is your main problem?</h3>
              <p className="sc-lead">Choose the body area that bothers you most. Simple wording comes first; the medical term is shown underneath.</p>
              <div className="sc-regions">
                {regions.map((item) => (
                  <button key={item.id} type="button" onClick={() => chooseRegion(item.id)} className="sc-region">
                    <span className="sc-figure">
                      <AnatomyRegionVisual region={item.id} compact className="h-[88px] w-[64px]" />
                      <i aria-hidden="true" />
                    </span>
                    <span className="sc-region-text">
                      <b>{item.label}</b>
                      <em>{item.medical}</em>
                      <small>{item.hint}</small>
                    </span>
                    <ArrowRight className="sc-go h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 1 && region && (
            <section>
              <p className="sc-eyebrow">Clinical context</p>
              <h3 className="sc-h">A few basics first</h3>
              <p className="sc-lead">These details help separate injury, overuse and longer-term patterns.</p>
              <ChoiceGroup title="Your age" options={commonHistoryOptions.age} value={age} onChange={setAge} />
              <ChoiceGroup title="How did it start?" options={commonHistoryOptions.onset} value={onset} onChange={setOnset} />
              <ChoiceGroup title="How long has it been present?" options={commonHistoryOptions.duration} value={duration} onChange={setDuration} />
              <ChoiceGroup title="How much is it affecting normal life?" options={commonHistoryOptions.impact} value={impact} onChange={setImpact} />
              <PainSlider value={pain} onChange={setPain} />
            </section>
          )}

          {step === 2 && region && (
            <section>
              <div className="sc-split">
                <div>
                  <p className="sc-eyebrow">Symptom location</p>
                  <h3 className="sc-h">Where exactly do you feel it?</h3>
                  <p className="sc-lead">Choose the closest match for your main symptom location.</p>
                </div>
                <div className="sc-figure sc-figure-lg" aria-hidden="true">
                  <AnatomyRegionVisual region={region.id} className="h-40 w-auto" />
                  <i />
                </div>
              </div>
              <div className="sc-grid">
                {region.locations.map((item) => (
                  <button key={item.id} type="button" aria-pressed={location === item.id} onClick={() => setLocation(item.id)} className="sc-choice" data-on={location === item.id}>
                    <span>
                      <b>{item.label}</b>
                      {item.medical ? <em>{item.medical}</em> : null}
                    </span>
                    <i aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && region && (
            <section>
              <p className="sc-eyebrow">Pattern matching</p>
              <h3 className="sc-h">Which statements fit you?</h3>
              <p className="sc-lead">Select every option that clearly matches. Leave an option unticked if you are unsure — unsure is fine.</p>
              <p className="sc-count" aria-live="polite">{clues.size} selected</p>
              <div className="sc-list">
                {visibleClues.map((item) => {
                  const checked = clues.has(item.id);
                  return (
                    <label key={item.id} className="sc-check" data-on={checked}>
                      <input type="checkbox" checked={checked} onChange={() => toggleClue(item.id)} />
                      <i aria-hidden="true">{checked ? <Check className="h-3.5 w-3.5" /> : null}</i>
                      <span>
                        <b>{item.label}</b>
                        {item.medical ? <em>{item.medical}</em> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <div className="sc-gate">
                <span aria-hidden="true"><ShieldAlert className="h-6 w-6" /></span>
                <div>
                  <p className="sc-eyebrow sc-eyebrow-warn">Safety gate</p>
                  <h3 className="sc-h">Safety check</h3>
                  <p className="sc-lead">Before showing musculoskeletal possibilities, we screen for symptoms that need medical care first. Tick anything that applies right now.</p>
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
                        <b>{flag.label}</b>
                        <em>{flag.level === "emergency" ? "Emergency warning" : "Urgent warning"}</em>
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
                  <span><b>None of these apply to me</b></span>
                </label>
              </div>
            </section>
          )}

          {step === 5 && region && (
            <section aria-live="polite">
              {selectedFlagObjects.length > 0 ? (
                <div>
                  <div className="sc-alert" data-level={hasEmergencyFlag ? "emergency" : "urgent"} role="alert">
                    <AlertTriangle className="h-7 w-7" aria-hidden="true" />
                    <div>
                      <h3>{safetyDisposition?.title ?? "Medical assessment recommended"}</h3>
                      <p>The checker has stopped before giving a musculoskeletal differential because one or more safety warnings were selected.</p>
                    </div>
                  </div>
                  <ul className="sc-flagged">
                    {selectedFlagObjects.map((flag) => (
                      <li key={flag.id}>
                        <strong>{flag.label}</strong>
                        <span>{flag.advice}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="sc-actions">
                    <button type="button" onClick={copySummary} className="sc-btn sc-btn-ghost">
                      <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> {copied === "done" ? "Copied" : "Copy summary for a clinician"}
                    </button>
                    <button type="button" onClick={restart} className="sc-btn sc-btn-ghost">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start again
                    </button>
                  </div>
                  {copied === "failed" ? <SummaryBox text={summary} /> : null}
                </div>
              ) : (
                <div>
                  <div className="sc-result-head">
                    <div className="sc-figure sc-figure-lg" aria-hidden="true">
                      <AnatomyRegionVisual region={region.id} className="h-44 w-auto" />
                      <i />
                      <span className="sc-tag">{region.label}</span>
                    </div>
                    <div>
                      <p className="sc-kicker"><Stethoscope className="inline h-4 w-4" aria-hidden="true" /> Your screening result</p>
                      <h3 className="sc-h">Possible {region.label} patterns</h3>
                      <p className="sc-lead">These are ranked compatibility patterns from your answers — not confirmed diagnoses.</p>
                    </div>
                  </div>

                  <div className="sc-priority" data-level={priorityLevel}>
                    <div className="sc-meter" role="img" aria-label={`Urgency level ${priorityLevel + 1} of 3`}>
                      {["Monitor", "Assess", "Prompt"].map((name, index) => (
                        <span key={name} data-on={index <= priorityLevel}>{name}</span>
                      ))}
                    </div>
                    <div>
                      <p className="sc-eyebrow">Next-step priority</p>
                      <h4>{carePriority.label}</h4>
                      <p>{carePriority.detail}</p>
                    </div>
                  </div>

                  {neurologicHint ? (
                    <div className="sc-note" data-tone="info">
                      <Info className="h-5 w-5" aria-hidden="true" />
                      <div>
                        <p className="sc-eyebrow">Nerve distribution hint</p>
                        <h4>{neurologicHint.label}</h4>
                        <p>{neurologicHint.detail}</p>
                      </div>
                    </div>
                  ) : null}

                  {imagingNotice ? (
                    <div className="sc-note" data-tone="warn">
                      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                      <div>
                        <p className="sc-eyebrow">Fracture screening</p>
                        <h4>{imagingNotice.title}</h4>
                        <p>{imagingNotice.body}</p>
                        <p className="sc-eyebrow sc-mt">Matched criteria</p>
                        <ul>
                          {imagingNotice.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
                        </ul>
                        <p className="sc-strong">The MSK possibilities below are secondary until a fracture is reasonably excluded.</p>
                      </div>
                    </div>
                  ) : null}

                  {overlapNote ? <p className="sc-overlap"><Info className="h-4 w-4" aria-hidden="true" /> {overlapNote}</p> : null}

                  {results.length > 0 ? (
                    <div className="sc-results">
                      {results.slice(0, 3).map((result, index) => {
                        const share = Math.round((result.matchedCount / Math.max(1, result.featureCount)) * 100);
                        return (
                          <article key={result.condition.id} className="sc-card" data-top={index === 0}>
                            <div className="sc-card-top">
                              <div>
                                <p className="sc-eyebrow">{index === 0 ? "Most compatible pattern" : "Alternative possibility"}</p>
                                <h4>{result.condition.plainName}</h4>
                                <p className="sc-sub">{result.condition.name}</p>
                              </div>
                              <span className="sc-pill">{compatibilityLabel(result.score)}</span>
                            </div>
                            <p>{result.condition.summary}</p>
                            <div className="sc-fit" role="img" aria-label={`You reported ${result.matchedCount} of ${result.featureCount} typical features`}>
                              <div><i style={{ width: `${Math.max(6, share)}%` }} /></div>
                              <span>You reported <b>{result.matchedCount}</b> of {result.featureCount} typical features</span>
                            </div>
                            {result.matches.length > 0 ? (
                              <div className="sc-why">
                                <p className="sc-eyebrow">Why it matched</p>
                                <ul>{result.matches.map((match) => <li key={match}>{match}</li>)}</ul>
                              </div>
                            ) : null}
                            {result.missing.length > 0 ? (
                              <div className="sc-why">
                                <p className="sc-eyebrow">Often also present — not reported</p>
                                <ul>{result.missing.map((item) => <li key={item}>{item}</li>)}</ul>
                              </div>
                            ) : null}
                            {result.contradictions.length > 0 ? (
                              <div className="sc-against">
                                <p className="sc-eyebrow">What argues against it</p>
                                <ul>{result.contradictions.map((item) => <li key={item}>{item}</li>)}</ul>
                              </div>
                            ) : null}
                            <p className="sc-advice">{result.condition.advice}</p>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="sc-note" data-tone="plain">
                      <Info className="h-5 w-5" aria-hidden="true" />
                      <div>
                        <h4>No single pattern stands out strongly</h4>
                        <p>Your answers are not specific enough for a useful ranking. An in-person assessment can clarify the source of symptoms.</p>
                      </div>
                    </div>
                  )}

                  <div className="sc-cta">
                    <div>
                      <h4><CheckCircle2 className="inline h-5 w-5" aria-hidden="true" /> Need a professional assessment?</h4>
                      <p>Book with Physio Nexus Academy for examination, confirmation of the clinical pattern and an individualized management plan.</p>
                    </div>
                    <div className="sc-actions">
                      <a href={appointmentHref} className="sc-btn sc-btn-primary"><CalendarDays className="h-4 w-4" aria-hidden="true" /> Book Appointment</a>
                      <a href="/home-visit" className="sc-btn sc-btn-ghost"><Home className="h-4 w-4" aria-hidden="true" /> Request Home Visit</a>
                    </div>
                  </div>

                  <div className="sc-actions">
                    <button type="button" onClick={copySummary} className="sc-btn sc-btn-ghost">
                      <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> {copied === "done" ? "Copied" : "Copy summary for my clinician"}
                    </button>
                    <button type="button" onClick={restart} className="sc-btn sc-btn-ghost">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> Check another problem
                    </button>
                  </div>
                  {copied === "failed" ? <SummaryBox text={summary} /> : null}

                  <p className="sc-disclaimer"><Info className="h-5 w-5" aria-hidden="true" /> This screening result does not replace physical examination, neurologic/vascular testing, imaging when indicated, or medical diagnosis. Your answers stay in this browser tab and are not saved.</p>
                </div>
              )}
            </section>
          )}

          {message ? <p className="sc-error" role="alert">{message}</p> : null}

          {step > 0 && step < 5 ? (
            <div className="sc-nav">
              <button type="button" onClick={back} className="sc-btn sc-btn-ghost"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button>
              <button type="button" onClick={next} className="sc-btn sc-btn-primary">
                {step === 4 ? "Show My Screening Result" : "Continue"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ text }: { text: string }) {
  return (
    <label className="sc-summary">
      <span>Your browser blocked copying. Select and copy the text below:</span>
      <textarea readOnly rows={10} value={text} onFocus={(event) => event.currentTarget.select()} />
    </label>
  );
}

function PainSlider({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  const shown = value ?? 0;
  const tone = value === null ? "none" : value >= 8 ? "high" : value >= 5 ? "mid" : "low";
  return (
    <div className="sc-group">
      <p className="sc-group-title">
        How strong is the pain right now? <small>(optional)</small>
      </p>
      <div className="sc-pain" data-tone={tone}>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={shown}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="Pain right now from 0 (none) to 10 (worst imaginable)"
          aria-valuetext={value === null ? "not set" : `${value} out of 10`}
          style={{ ["--p" as string]: `${shown * 10}%` }}
        />
        <div className="sc-pain-scale" aria-hidden="true">
          <span>0 none</span>
          <span>5 moderate</span>
          <span>10 worst</span>
        </div>
        <p className="sc-pain-read">
          {value === null ? <span>Not set — slide to rate it, or skip.</span> : <span><b>{value}</b>/10</span>}
          {value !== null ? <button type="button" onClick={() => onChange(null)}>Clear</button> : null}
        </p>
      </div>
    </div>
  );
}

function ChoiceGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="sc-group" role="group" aria-label={title}>
      <p className="sc-group-title">{title}</p>
      <div className="sc-options">
        {options.map((item) => (
          <button key={item.id} type="button" aria-pressed={value === item.id} onClick={() => onChange(item.id)} className="sc-option" data-on={value === item.id}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
