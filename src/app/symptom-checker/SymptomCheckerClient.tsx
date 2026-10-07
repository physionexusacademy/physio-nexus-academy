"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Home,
  Info,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import {
  commonHistoryOptions,
  compatibilityLabel,
  getCarePriority,
  getImagingNotice,
  getNeurologicHint,
  getSafetyDisposition,
  redFlags,
  regions,
  scoreConditions,
  type RegionId,
} from "@/lib/msk-symptom-checker";

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

export function SymptomCheckerClient() {
  const [step, setStep] = useState<Step>(0);
  const [regionId, setRegionId] = useState<RegionId | null>(null);
  const [age, setAge] = useState("");
  const [onset, setOnset] = useState("");
  const [duration, setDuration] = useState("");
  const [impact, setImpact] = useState("");
  const [location, setLocation] = useState("");
  const [clues, setClues] = useState<Set<string>>(new Set());
  const [selectedRedFlags, setSelectedRedFlags] = useState<Set<string>>(new Set());
  const [noRedFlags, setNoRedFlags] = useState(false);
  const [message, setMessage] = useState("");

  const region = regions.find((item) => item.id === regionId) ?? null;

  const selectedFeatures = useMemo(() => {
    const values = new Set<string>();
    [age, onset, duration, impact, location].filter(Boolean).forEach((item) => values.add(item));
    clues.forEach((item) => values.add(item));
    return values;
  }, [age, onset, duration, impact, location, clues]);

  const results = useMemo(
    () => (regionId ? scoreConditions(regionId, selectedFeatures) : []),
    [regionId, selectedFeatures],
  );

  const imagingNotice = useMemo(
    () => (regionId ? getImagingNotice(regionId, selectedFeatures) : null),
    [regionId, selectedFeatures],
  );

  const neurologicHint = useMemo(
    () => (regionId ? getNeurologicHint(regionId, selectedFeatures) : null),
    [regionId, selectedFeatures],
  );

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

  const carePriority = useMemo(() => getCarePriority(selectedFeatures), [selectedFeatures]);

  const safetyDisposition = useMemo(
    () => getSafetyDisposition(selectedRedFlags),
    [selectedRedFlags],
  );
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
    setLocation("");
    setClues(new Set());
    setSelectedRedFlags(new Set());
    setNoRedFlags(false);
    setMessage("");
  };

  const topResult = results[0];
  const reason = imagingNotice
    ? `${region?.label ?? "MSK"} acute injury — fracture screening suggests in-person assessment / possible radiography before routine MSK diagnosis.`
    : topResult
      ? `${region?.label ?? "MSK"} symptoms — screening pattern most compatible with ${topResult.condition.name}. Screening is not a confirmed diagnosis.`
      : `${region?.label ?? "Musculoskeletal"} symptoms — completed PNA MSK symptom screening; professional assessment requested.`;

  const appointmentHref = `/appointment?reason=${encodeURIComponent(reason)}`;

  return (
    <div className="mt-7">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-2xl shadow-navy-900/10">
        <div className="border-b border-white/10 bg-navy-900 px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">
                PNA MSK Screening Assistant
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-lg font-bold text-white">{steps[step]}</p>
                <span className="text-xs font-semibold text-slate-400">Step {step + 1} / {steps.length}</span>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur">
              Adults 18+ · Clinical screening
            </span>
          </div>

          <div className="mt-5 hidden grid-cols-6 gap-2 sm:grid">
            {steps.map((label, index) => {
              const complete = index < step;
              const active = index === step;
              return (
                <div key={label} className="min-w-0">
                  <div
                    className={`flex h-9 items-center justify-center rounded-xl border px-2 text-[11px] font-bold transition-all ${
                      active
                        ? "border-teal-300/50 bg-teal-300/15 text-teal-100"
                        : complete
                          ? "border-white/10 bg-white/[0.08] text-slate-200"
                          : "border-white/5 bg-white/[0.035] text-slate-500"
                    }`}
                  >
                    <span className="truncate">{index + 1}. {label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-300 to-cyan-300 transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfe_100%)] p-5 sm:p-7 lg:p-8">
          {step === 0 && (
            <section>
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Start here</p>
                <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">Where is your main problem?</h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">
                Choose the body area that bothers you most. Simple wording comes first; the medical term is shown underneath.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {regions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseRegion(item.id)}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/10"
                  >
                    <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700 transition group-hover:scale-105 group-hover:bg-teal-100">
                        <Activity className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold text-navy-900">{item.label}</span>
                        <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-wide text-teal-700">{item.medical}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-600" />
                    </span>
                    <span className="mt-4 block text-sm leading-5 text-navy-500">{item.hint}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 1 && region && (
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Clinical context</p>
              <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">A few basics first</h2>
              <p className="mt-2 text-sm text-navy-600">
                These details help separate injury, overuse and longer-term patterns.
              </p>

              <ChoiceGroup title="Your age" options={commonHistoryOptions.age} value={age} onChange={setAge} />
              <ChoiceGroup title="How did it start?" options={commonHistoryOptions.onset} value={onset} onChange={setOnset} />
              <ChoiceGroup title="How long has it been present?" options={commonHistoryOptions.duration} value={duration} onChange={setDuration} />
              <ChoiceGroup title="How much is it affecting normal life?" options={commonHistoryOptions.impact} value={impact} onChange={setImpact} />
            </section>
          )}

          {step === 2 && region && (
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Symptom location</p>
              <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">Where exactly do you feel it?</h2>
              <p className="mt-2 text-sm text-navy-600">Choose the closest match for your main symptom location.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {region.locations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLocation(item.id)}
                    className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                      location === item.id
                        ? "border-teal-400 bg-teal-50/80 shadow-md shadow-teal-900/5 ring-1 ring-teal-300"
                        : "border-slate-200 bg-white shadow-sm hover:border-teal-300 hover:shadow-md"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-navy-900">{item.label}</span>
                      <span className={`h-3.5 w-3.5 rounded-full border-2 ${
                        location === item.id ? "border-teal-600 bg-teal-500 ring-4 ring-teal-100" : "border-slate-300"
                      }`} />
                    </span>
                    {item.medical ? <span className="mt-1 block text-xs text-teal-700">{item.medical}</span> : null}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && region && (
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Pattern matching</p>
              <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">Which statements fit you?</h2>
              <p className="mt-2 text-sm text-navy-600">
                Select every option that clearly matches. Leave an option unticked if you are unsure.
              </p>
              <div className="mt-5 grid gap-3">
                {visibleClues.map((item) => {
                  const checked = clues.has(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                        checked
                          ? "border-teal-400 bg-teal-50/80 shadow-sm ring-1 ring-teal-200"
                          : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleClue(item.id)}
                        className="mt-1 h-4 w-4 accent-teal-600"
                      />
                      <span>
                        <span className="block font-medium text-navy-800">{item.label}</span>
                        {item.medical ? <span className="mt-1 block text-xs text-teal-700">{item.medical}</span> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <ShieldAlert className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Safety gate</p>
                  <h2 className="mt-1 text-2xl font-bold text-navy-900 sm:text-3xl">Safety check</h2>
                  <p className="mt-1 text-sm leading-6 text-navy-600">
                    Before showing musculoskeletal possibilities, we screen for symptoms that need medical care first.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {redFlags.map((flag) => {
                  const checked = selectedRedFlags.has(flag.id);
                  return (
                    <label
                      key={flag.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                        checked
                          ? "border-red-300 bg-red-50 shadow-sm ring-1 ring-red-200"
                          : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRedFlag(flag.id)}
                        className="mt-1 h-4 w-4 accent-red-600"
                      />
                      <span className="text-sm leading-6 text-navy-700">{flag.label}</span>
                    </label>
                  );
                })}

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                    noRedFlags
                      ? "border-teal-400 bg-teal-50 shadow-sm ring-1 ring-teal-200"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={noRedFlags}
                    onChange={(event) => {
                      setNoRedFlags(event.target.checked);
                      if (event.target.checked) setSelectedRedFlags(new Set());
                    }}
                    className="h-4 w-4 accent-teal-600"
                  />
                  <span className="font-semibold text-navy-800">None of these apply to me</span>
                </label>
              </div>
            </section>
          )}

          {step === 5 && region && (
            <section aria-live="polite">
              {selectedFlagObjects.length > 0 ? (
                <div>
                  <div className={`rounded-2xl border p-5 ${
                    hasEmergencyFlag ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`mt-0.5 h-6 w-6 flex-none ${
                        hasEmergencyFlag ? "text-red-700" : "text-amber-700"
                      }`} />
                      <div>
                        <h2 className="text-xl font-bold text-navy-900">
                          {safetyDisposition?.title ?? "Medical assessment recommended"}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-navy-700">
                          The checker has stopped before giving a musculoskeletal differential because one or more safety warnings were selected.
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {selectedFlagObjects.map((flag) => (
                        <li key={flag.id} className="rounded-xl bg-white/80 p-3 text-sm text-navy-700">
                          <strong>{flag.label}</strong>
                          <span className="mt-1 block">{flag.advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={restart}
                    className="mt-5 inline-flex items-center gap-2 rounded-md border border-grey-300 px-4 py-2.5 text-sm font-semibold text-navy-700 hover:bg-grey-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start again
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-teal-100 text-teal-700">
                      <Stethoscope className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Your screening result</p>
                      <h2 className="mt-1 text-2xl font-bold text-navy-900 sm:text-3xl">Possible {region.label} patterns</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">
                        These are ranked compatibility patterns from your answers — not confirmed diagnoses.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Next-step priority
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-navy-900">{carePriority.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-navy-700">{carePriority.detail}</p>
                      </div>
                    </div>
                  </div>

                  {neurologicHint ? (
                    <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 flex-none text-sky-700" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                            Nerve distribution hint
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-navy-900">{neurologicHint.label}</h3>
                          <p className="mt-2 text-sm leading-6 text-navy-700">{neurologicHint.detail}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {imagingNotice ? (
                    <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-6 w-6 flex-none text-amber-700" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Fracture screening
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-navy-900">{imagingNotice.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-navy-700">{imagingNotice.body}</p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl bg-white/80 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-navy-500">Matched criteria</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-700">
                          {imagingNotice.criteria.map((criterion) => (
                            <li key={criterion}>{criterion}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-amber-900">
                        The MSK possibilities below are secondary until a fracture is reasonably excluded.
                      </p>
                    </div>
                  ) : null}

                  {results.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      {results.slice(0, 3).map((result, index) => (
                        <article
                          key={result.condition.id}
                          className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                            index === 0
                              ? "border-navy-800 bg-navy-900 text-white shadow-xl shadow-navy-900/10"
                              : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${
                                index === 0 ? "text-teal-300" : "text-teal-700"
                              }`}>
                                {index === 0 ? "Most compatible pattern" : "Alternative possibility"}
                              </p>
                              <h3 className={`mt-1 text-lg font-bold ${
                                index === 0 ? "text-white" : "text-navy-900"
                              }`}>{result.condition.plainName}</h3>
                              <p className={`mt-1 text-sm font-semibold ${
                                index === 0 ? "text-slate-300" : "text-navy-600"
                              }`}>{result.condition.name}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                              index === 0
                                ? "border border-teal-300/20 bg-teal-300/10 text-teal-200"
                                : "bg-teal-50 text-teal-700"
                            }`}>
                              {compatibilityLabel(result.score)}
                            </span>
                          </div>
                          <p className={`mt-3 text-sm leading-6 ${
                            index === 0 ? "text-slate-300" : "text-navy-600"
                          }`}>{result.condition.summary}</p>
                          {result.matches.length > 0 ? (
                            <div className="mt-4">
                              <p className={`text-xs font-bold uppercase tracking-wide ${
                                index === 0 ? "text-slate-400" : "text-navy-500"
                              }`}>Why it matched</p>
                              <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${
                                index === 0 ? "text-slate-300" : "text-navy-600"
                              }`}>
                                {result.matches.map((match) => <li key={match}>{match}</li>)}
                              </ul>
                            </div>
                          ) : null}
                          {result.contradictions.length > 0 ? (
                            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                                What argues against it
                              </p>
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                                {result.contradictions.map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                          ) : null}
                          <p className={`mt-4 text-sm font-medium ${
                            index === 0 ? "text-slate-200" : "text-navy-700"
                          }`}>{result.condition.advice}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-grey-200 bg-grey-50 p-5">
                      <h3 className="font-bold text-navy-800">No single pattern stands out strongly</h3>
                      <p className="mt-2 text-sm leading-6 text-navy-600">
                        Your answers are not specific enough for a useful ranking. An in-person assessment can clarify the source of symptoms.
                      </p>
                    </div>
                  )}

                  <div className="mt-7 overflow-hidden rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-900 to-navy-800 p-5 text-white shadow-xl shadow-navy-900/10">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
                      <div>
                        <h3 className="font-bold text-white">Need a professional assessment?</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Book with Physio Nexus Academy for examination, confirmation of the clinical pattern and an individualized management plan.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={appointmentHref}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-navy-950 transition hover:-translate-y-0.5 hover:bg-teal-300"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Book Appointment
                      </a>
                      <a
                        href="/home-visit"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                      >
                        <Home className="h-4 w-4" />
                        Request Home Visit
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    <Info className="mt-0.5 h-5 w-5 flex-none" />
                    <p>
                      This screening result does not replace physical examination, neurologic/vascular testing, imaging when indicated, or medical diagnosis.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={restart}
                    className="mt-5 inline-flex items-center gap-2 rounded-md border border-grey-300 px-4 py-2.5 text-sm font-semibold text-navy-700 hover:bg-grey-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Check another problem
                  </button>
                </div>
              )}
            </section>
          )}

          {message ? (
            <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {message}
            </p>
          ) : null}

          {step > 0 && step < 5 ? (
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-grey-200 pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={back}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-navy-900/10 transition hover:-translate-y-0.5 hover:bg-navy-800"
              >
                {step === 4 ? "Show My Screening Result" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
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
    <div className="mt-7">
      <p className="text-sm font-bold text-navy-900">{title}</p>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`min-h-12 rounded-2xl border px-4 py-3.5 text-left text-sm transition-all duration-200 ${
              value === item.id
                ? "border-teal-400 bg-teal-50 font-semibold text-navy-900 shadow-sm ring-1 ring-teal-200"
                : "border-slate-200 bg-white text-navy-600 shadow-sm hover:border-teal-300 hover:bg-slate-50/60"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
