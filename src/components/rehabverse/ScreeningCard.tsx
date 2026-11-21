"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Hourglass, Info } from "lucide-react";
import { myScreeningAction } from "@/app/rehabverse/actions";
import type { MyScreening } from "@/lib/rehabverse/api-types";
import { getImagingNotice, scoreConditions, type RegionId, type ScoredCondition } from "@/lib/msk-symptom-checker";
import { checkerCopy } from "@/lib/symptom/copy";
import { imagingText } from "@/lib/symptom/ru";
import { PatternCard, PatternHeadline } from "@/components/symptom/parts";
import "@/components/symptom/symptom.css";
import { useRvLang } from "./useLang";

/**
 * What the patient's answers point to, in the same highlighted look as the public symptom checker. The database decides whether it may be shown
 * (never with a safety warning; after the physiotherapist's review when the study setting says so) and records the first time it is shown.
 * It is always framed as a screening, never as a diagnosis.
 */
export function ScreeningCard({ initial }: { initial?: MyScreening }) {
  const [lang] = useRvLang();
  const [data, setData] = useState<MyScreening | null>(initial ?? null);
  useEffect(() => {
    if (initial) return;
    let live = true;
    myScreeningAction().then((r) => { if (live && r.ok) setData(r.screening); });
    return () => { live = false; };
  }, [initial]);

  const snapshot = data?.visible ? data.snapshot : undefined;
  const results = useMemo<ScoredCondition[]>(() => {
    if (!snapshot) return [];
    const all = scoreConditions(snapshot.region as RegionId, new Set(snapshot.answers));
    return snapshot.top.map((t) => all.find((r) => r.condition.id === t.id)).filter((r): r is ScoredCondition => Boolean(r));
  }, [snapshot]);
  const imaging = useMemo(() => (snapshot ? getImagingNotice(snapshot.region as RegionId, new Set(snapshot.answers)) : null), [snapshot]);

  if (!data) return null;
  const t = checkerCopy(lang);
  if (!data.visible) {
    if (!data.waiting_for_review) return null;
    return (
      <div className="sc sc-inline" data-lang={lang}>
        <div className="sc-body">
          <div className="sc-note" data-tone="info">
            <Hourglass className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="sc-eyebrow">{t.rehab.resultKicker}</p>
              <h4>{t.rehab.waitingTitle}</h4>
              <p>{t.rehab.waitingBody}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const notice = imaging ? imagingText(lang, imaging) : null;
  return (
    <div className="sc sc-inline" data-lang={lang} aria-live="polite">
      <div className="sc-body">
        <p className="sc-kicker">{t.rehab.resultKicker}</p>
        <h3 className="sc-h">{t.rehab.resultTitle}</h3>
        <p className="sc-lead">{t.rehab.resultLead}</p>
        {notice ? (
          <div className="sc-note" data-tone="warn">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="sc-eyebrow">{t.result.fracture}</p>
              <h4>{notice.title}</h4>
              <p>{t.rehab.fractureNote}</p>
            </div>
          </div>
        ) : results[0] ? <PatternHeadline lang={lang} result={results[0]} /> : null}
        {results.length > 0 ? (
          <div className="sc-results">{results.map((result, index) => <PatternCard key={result.condition.id} lang={lang} result={result} index={index} underHeadline={index === 0 && !notice} />)}</div>
        ) : (
          <div className="sc-note" data-tone="plain">
            <Info className="h-5 w-5" aria-hidden="true" />
            <div><h4>{t.result.noneTitle}</h4><p>{t.result.noneBody}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
