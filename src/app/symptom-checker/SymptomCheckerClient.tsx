"use client";

import { useMemo, useState } from "react";
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
  getImagingNotice,
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
  const [location, setLocation] = useState("");
  const [clues, setClues] = useState<Set<string>>(new Set());
  const [selectedRedFlags, setSelectedRedFlags] = useState<Set<string>>(new Set());
  const [noRedFlags, setNoRedFlags] = useState(false);
  const [message, setMessage] = useState("");

  const region = regions.find((item) => item.id === regionId) ?? null;

  const selectedFeatures = useMemo(() => {
    const values = new Set<string>();
    [age, onset, duration, location].filter(Boolean).forEach((item) => values.add(item));
    clues.forEach((item) => values.add(item));
    return values;
  }, [age, onset, duration, location, clues]);

  const results = useMemo(
    () => (regionId ? scoreConditions(regionId, selectedFeatures) : []),
    [regionId, selectedFeatures],
  );

  const imagingNotice = useMemo(
    () => (regionId ? getImagingNotice(regionId, selectedFeatures) : null),
    [regionId, selectedFeatures],
  );

  const visibleClues = useMemo(
    () =>
      region
        ? region.clues.filter((item) => onset === "onset_trauma" || !traumaOnlyClueIds.has(item.id))
        : [],
    [region, onset],
  );

  const selectedFlagObjects = redFlags.filter((flag) => selectedRedFlags.has(flag.id));
  const hasEmergencyFlag = selectedFlagObjects.some((flag) => flag.level === "emergency");

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

    if (step === 1 && (!age || !onset || !duration)) {
      setMessage("Please choose your age range, how the problem started and how long it has been present.");
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
    <div className="mt-8">
      <div className="overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-lg">
        <div className="border-b border-grey-200 bg-navy-50 px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                PNA MSK Screening Assistant
              </p>
              <p className="mt-1 text-sm text-navy-500">
                Step {step + 1} of {steps.length}: {steps[step]}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-navy-600">
              Adults 18+
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-grey-200" aria-hidden="true">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {step === 0 && (
            <section>
              <h2 className="text-2xl font-bold text-navy-800">Where is your main problem?</h2>
              <p className="mt-2 text-sm leading-6 text-navy-600">
                Choose the body area that bothers you most. Simple wording comes first; the medical term is shown underneath.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {regions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseRegion(item.id)}
                    className="group rounded-2xl border border-grey-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 group-hover:bg-white">
                        <Activity className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-bold text-navy-800">{item.label}</span>
                        <span className="block text-xs text-teal-700">{item.medical}</span>
                      </span>
                    </span>
                    <span className="mt-3 block text-sm leading-5 text-navy-500">{item.hint}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 1 && region && (
            <section>
              <h2 className="text-2xl font-bold text-navy-800">A few basics first</h2>
              <p className="mt-2 text-sm text-navy-600">
                These details help separate injury, overuse and longer-term patterns.
              </p>

              <ChoiceGroup title="Your age" options={commonHistoryOptions.age} value={age} onChange={setAge} />
              <ChoiceGroup title="How did it start?" options={commonHistoryOptions.onset} value={onset} onChange={setOnset} />
              <ChoiceGroup title="How long has it been present?" options={commonHistoryOptions.duration} value={duration} onChange={setDuration} />
            </section>
          )}

          {step === 2 && region && (
            <section>
              <h2 className="text-2xl font-bold text-navy-800">Where exactly do you feel it?</h2>
              <p className="mt-2 text-sm text-navy-600">Choose the closest match for your main symptom location.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {region.locations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLocation(item.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      location === item.id
                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500"
                        : "border-grey-200 hover:border-teal-300"
                    }`}
                  >
                    <span className="font-semibold text-navy-800">{item.label}</span>
                    {item.medical ? <span className="mt-1 block text-xs text-teal-700">{item.medical}</span> : null}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && region && (
            <section>
              <h2 className="text-2xl font-bold text-navy-800">Which statements fit you?</h2>
              <p className="mt-2 text-sm text-navy-600">
                Select every option that clearly matches. Leave an option unticked if you are unsure.
              </p>
              <div className="mt-5 grid gap-3">
                {visibleClues.map((item) => {
                  const checked = clues.has(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        checked ? "border-teal-500 bg-teal-50" : "border-grey-200 bg-white"
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
                  <h2 className="text-2xl font-bold text-navy-800">Safety check</h2>
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
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        checked ? "border-red-400 bg-red-50" : "border-grey-200 bg-white"
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
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    noRedFlags ? "border-teal-500 bg-teal-50" : "border-grey-200"
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
                          {hasEmergencyFlag ? "Emergency medical assessment recommended" : "Urgent medical assessment recommended"}
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
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Screening result</p>
                      <h2 className="mt-1 text-2xl font-bold text-navy-800">Possible {region.label} patterns</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-navy-600">
                        These are ranked compatibility patterns from your answers — not confirmed diagnoses.
                      </p>
                    </div>
                  </div>

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
                          className={`rounded-2xl border p-5 ${
                            index === 0 ? "border-teal-300 bg-teal-50/60" : "border-grey-200 bg-white"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                                {index === 0 ? "Most compatible pattern" : "Alternative possibility"}
                              </p>
                              <h3 className="mt-1 text-lg font-bold text-navy-800">{result.condition.plainName}</h3>
                              <p className="mt-1 text-sm font-semibold text-navy-600">{result.condition.name}</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-700 shadow-sm">
                              {compatibilityLabel(result.score)}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-navy-600">{result.condition.summary}</p>
                          {result.matches.length > 0 ? (
                            <div className="mt-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-navy-500">Why it matched</p>
                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-600">
                                {result.matches.map((match) => <li key={match}>{match}</li>)}
                              </ul>
                            </div>
                          ) : null}
                          <p className="mt-4 text-sm font-medium text-navy-700">{result.condition.advice}</p>
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

                  <div className="mt-7 rounded-2xl border border-navy-100 bg-navy-50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-teal-700" />
                      <div>
                        <h3 className="font-bold text-navy-800">Need a professional assessment?</h3>
                        <p className="mt-1 text-sm leading-6 text-navy-600">
                          Book with Physio Nexus Academy for examination, confirmation of the clinical pattern and an individualized management plan.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={appointmentHref}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Book Appointment
                      </a>
                      <a
                        href="/home-visit"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal-300 bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-grey-300 px-5 py-2.5 text-sm font-semibold text-navy-700 hover:bg-grey-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
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
    <div className="mt-6">
      <p className="text-sm font-bold text-navy-800">{title}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`min-h-11 rounded-xl border px-4 py-3 text-left text-sm transition ${
              value === item.id
                ? "border-teal-500 bg-teal-50 font-semibold text-navy-800 ring-1 ring-teal-500"
                : "border-grey-200 text-navy-600 hover:border-teal-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
