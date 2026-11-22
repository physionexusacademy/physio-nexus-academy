"use client";

/**
 * The building blocks of the symptom checker, shared by the public checker page and the RehabVerse intake (which asks the same questions with the
 * same pictures). Everything here is presentation: the screening rules stay in src/lib/msk-symptom-checker.ts and the words in src/lib/symptom/.
 */
import "./symptom.css";
import { ArrowRight, Check, Info, Sparkles } from "lucide-react";
import { AnatomyRegionVisual } from "./AnatomyRegionVisual";
import { regions, type CheckerOption, type RegionId, type ScoredCondition, compatibilityLabel } from "@/lib/msk-symptom-checker";
import { checkerCopy, type CheckerCopy } from "@/lib/symptom/copy";
import { compatText, conditionText, labelText, optionText, regionText, type CheckerLang } from "@/lib/symptom/ru";

/** Answers that only make sense after an acute injury (the Ottawa-style fracture screen); they are hidden, and cleared, otherwise. */
export const TRAUMA_ONLY_CLUES = new Set([
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

/** The clues to show for a region, given how the problem started and the age band. */
export function visibleCluesFor(region: { clues: CheckerOption[] } | null, onsetIsTrauma: boolean, ageId: string): CheckerOption[] {
  if (!region) return [];
  return region.clues.filter((item) => {
    if (TRAUMA_ONLY_CLUES.has(item.id) && !onsetIsTrauma) return false;
    if (item.id === "clue_knee_age55") return ageId === "age_40_59";
    return true;
  });
}

export function RegionGrid({ lang, onPick }: { lang: CheckerLang; onPick: (id: RegionId) => void }) {
  return (
    <div className="sc-regions">
      {regions.map((item) => {
        const words = regionText(lang, item);
        return (
          <button key={item.id} type="button" onClick={() => onPick(item.id)} className="sc-region">
            <span className="sc-figure">
              <AnatomyRegionVisual region={item.id} compact className="h-[88px] w-[64px]" />
              <i aria-hidden="true" />
            </span>
            <span className="sc-region-text">
              <b>{words.label}</b>
              <em>{item.medical}</em>
              <small>{words.hint}</small>
            </span>
            <ArrowRight className="sc-go h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

export function LocationGrid({ lang, options, value, onChange }: { lang: CheckerLang; options: CheckerOption[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="sc-grid">
      {options.map((item) => (
        <button key={item.id} type="button" aria-pressed={value === item.id} onClick={() => onChange(item.id)} className="sc-choice" data-on={value === item.id}>
          <span>
            <b>{optionText(lang, item.id, item.label)}</b>
            {item.medical ? <em>{item.medical}</em> : null}
          </span>
          <i aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function ClueList({ lang, items, selected, onToggle }: { lang: CheckerLang; items: CheckerOption[]; selected: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div className="sc-list">
      {items.map((item) => {
        const checked = selected.has(item.id);
        return (
          <label key={item.id} className="sc-check" data-on={checked}>
            <input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} />
            <i aria-hidden="true">{checked ? <Check className="h-3.5 w-3.5" /> : null}</i>
            <span>
              <b>{optionText(lang, item.id, item.label)}</b>
              {item.medical ? <em>{item.medical}</em> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function PainSlider({ copy, value, onChange }: { copy: CheckerCopy["pain"]; value: number | null; onChange: (value: number | null) => void }) {
  const shown = value ?? 0;
  const tone = value === null ? "none" : value >= 8 ? "high" : value >= 5 ? "mid" : "low";
  return (
    <div className="sc-group">
      <p className="sc-group-title">
        {copy.title} <small>{copy.optional}</small>
      </p>
      <div className="sc-pain" data-tone={tone}>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={shown}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={copy.aria}
          aria-valuetext={copy.valueText(value)}
          style={{ ["--p" as string]: `${shown * 10}%` }}
        />
        <div className="sc-pain-scale" aria-hidden="true">
          <span>{copy.none}</span>
          <span>{copy.moderate}</span>
          <span>{copy.worst}</span>
        </div>
        <p className="sc-pain-read">
          {value === null ? <span>{copy.notSet}</span> : <span><b>{value}</b>/10</span>}
          {value !== null ? <button type="button" onClick={() => onChange(null)}>{copy.clear}</button> : null}
        </p>
      </div>
    </div>
  );
}

export function ChoiceGroup({
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

/** The pattern that fits best, shown big. Always says it is a screening pattern, not a diagnosis. */
export function PatternHeadline({ lang, result }: { lang: CheckerLang; result: Pick<ScoredCondition, "condition" | "score" | "matchedCount" | "featureCount"> }) {
  const t = checkerCopy(lang);
  const words = conditionText(lang, result.condition);
  return (
    <div className="sc-headline" role="group" aria-label={t.result.headline}>
      <span className="sc-headline-ico" aria-hidden="true"><Sparkles className="h-6 w-6" /></span>
      <div>
        <p className="sc-eyebrow">{t.result.headline}</p>
        <h4>{words.plainName}</h4>
        <p className="sc-sub">{result.condition.name}</p>
        <div className="sc-headline-meta">
          <span className="sc-pill">{compatText(lang, compatibilityLabel(result.score))}</span>
        </div>
        <p className="sc-headline-how">{t.result.headlineHow}</p>
        <p className="sc-headline-not"><Info className="h-4 w-4" aria-hidden="true" /> {t.result.headlineNot}</p>
      </div>
    </div>
  );
}

/**
 * One pattern with why it matched, what is often also present, what argues against it, and what to do. Directly under the headline answer
 * (`underHeadline`) its name and level are not repeated: the headline already says them.
 */
export function PatternCard({ lang, result, index, underHeadline = false }: { lang: CheckerLang; result: ScoredCondition; index: number; underHeadline?: boolean }) {
  const t = checkerCopy(lang);
  const share = Math.round((result.matchedCount / Math.max(1, result.featureCount)) * 100);
  const words = conditionText(lang, result.condition);
  return (
    <article className="sc-card" data-top={index === 0} data-under-headline={underHeadline}>
      {underHeadline ? null : (
        <div className="sc-card-top">
          <div>
            <p className="sc-eyebrow">{index === 0 ? t.result.mostCompatible : t.result.alternative}</p>
            <h4>{words.plainName}</h4>
            <p className="sc-sub">{result.condition.name}</p>
          </div>
          <span className="sc-pill">{compatText(lang, compatibilityLabel(result.score))}</span>
        </div>
      )}
      <p>{words.summary}</p>
      <div className="sc-fit" role="img" aria-label={t.result.reportedAria(result.matchedCount, result.featureCount)}>
        <div><i style={{ width: `${Math.max(6, share)}%` }} /></div>
        <span>{t.result.reported(result.matchedCount, result.featureCount)}</span>
      </div>
      {result.matches.length > 0 ? (
        <div className="sc-why">
          <p className="sc-eyebrow">{t.result.why}</p>
          <ul>{result.matches.map((match) => <li key={match}>{labelText(lang, match)}</li>)}</ul>
        </div>
      ) : null}
      {result.missing.length > 0 ? (
        <div className="sc-why">
          <p className="sc-eyebrow">{t.result.missing}</p>
          <ul>{result.missing.map((item) => <li key={item}>{labelText(lang, item)}</li>)}</ul>
        </div>
      ) : null}
      {result.contradictions.length > 0 ? (
        <div className="sc-against">
          <p className="sc-eyebrow">{t.result.against}</p>
          <ul>{result.contradictions.map((item) => <li key={item}>{labelText(lang, item)}</li>)}</ul>
        </div>
      ) : null}
      <p className="sc-advice">{words.advice}</p>
    </article>
  );
}
