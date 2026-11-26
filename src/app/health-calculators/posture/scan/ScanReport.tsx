"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AlertTriangle, Eye, EyeOff, Printer, RotateCcw, Save, Trash2 } from "lucide-react";
import { useLang } from "@/lib/lang";
import { band, metricDef, type PostureMetricId } from "@/lib/posture/measures";
import { BEND_METRICS, REGIONS, bendNotes, compareScans, isSaved, regionSeverity, skeletonPose, summarise, toSaved, type BendMetricId, type Captures, type SavedScan, type ScanView } from "@/lib/posture/scan";
import { BAND_TEXT, METRIC_TEXT, NEXT_STEPS, type Bi } from "@/lib/posture/text";
import { BEND_NOTE_TEXT, BEND_TEXT, COMPARE_TEXT, FACTORS, REGION_FACTORS, REGION_TEXT, REPORT_SAFE, SEVERITY_TEXT, VIEW_TEXT, type FactorId } from "@/lib/posture/scan-text";
import type { ViewerLabels } from "@/components/posture/SkeletonViewer";

const SkeletonViewer = dynamic(() => import("@/components/posture/SkeletonViewer"), { ssr: false, loading: () => <div className="sv-load" aria-busy="true" /> });

const STORE = "pna-posture-scan-v1";
const loadSaved = (): SavedScan[] => {
  try { const raw = JSON.parse(window.localStorage.getItem(STORE) ?? "[]"); return Array.isArray(raw) ? raw.filter(isSaved) : []; } catch { return []; }
};
const writeSaved = (list: SavedScan[]) => { try { window.localStorage.setItem(STORE, JSON.stringify(list.slice(-5))); return true; } catch { return false; } };

const ICON: Record<FactorId, string> = { phone: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 17h.01", desk: "M3 6h18v8H3zM8 18h8M12 14v4", bed: "M3 18V8M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6", bag: "M6 8h12l1 12H5zM9 8V6a3 3 0 0 1 6 0v2", driving: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 12h5M16 12h5M12 14v6", oneleg: "M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 8v6l-3 7M12 14l3 3v4", shoes: "M3 16c0-3 2-4 4-4l3 2 4-3 5 3v4H3z" };

export default function ScanReport({ captures, photos, onAgain, onMore }: { captures: Captures; photos: Partial<Record<ScanView, string>>; onAgain: () => void; onMore: (v: ScanView) => void }) {
  const [lang] = useLang();
  const t = useCallback((b: Bi) => (lang === "ur" ? b.ur : b.en), [lang]);
  const summary = useMemo(() => summarise(captures), [captures]);
  const severities = useMemo(() => regionSeverity(summary), [summary]);
  const pose = useMemo(() => skeletonPose(summary), [summary]);
  const [showPhotos, setShowPhotos] = useState(true);
  const [saved, setSaved] = useState<SavedScan[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => { setSaved(loadSaved()); }, []);

  const labels: ViewerLabels = {
    front: t({ en: "Front", ur: "Saamne" }), side: t({ en: "Side", ur: "Side" }), back: t({ en: "Back", ur: "Peeche" }),
    spin: t({ en: "Turn slowly", ur: "Aahista ghumayein" }), stop: t({ en: "Stop turning", ur: "Ghumana rokein" }),
    noGl: t({ en: "Your browser cannot show the 3D skeleton. Your numbers below are still complete.", ur: "Aap ka browser 3D skeleton nahi dikha sakta. Neeche aap ke numbers phir bhi mukammal hain." }),
    hint: t({ en: "An illustrative 3D skeleton. Drag to turn it, or use the arrow keys.", ur: "Tasveeri 3D skeleton. Ghumane ke liye drag karein, ya arrow keys istemal karein." }),
  };

  const metricIds = (Object.keys(summary) as (keyof typeof summary)[]).filter((k): k is PostureMetricId => k in METRIC_TEXT && !!summary[k as PostureMetricId]);
  const last = saved[saved.length - 1];
  const changes = last ? metricIds.map((id) => ({ id, c: compareScans(last.summary[id], summary[id]) })).filter((x): x is { id: PostureMetricId; c: "better" | "worse" | "same" } => x.c !== null) : [];
  const concern = REGIONS.filter((r) => (severities[r] ?? 0) >= 1);
  const factors = Array.from(new Set(concern.flatMap((r) => REGION_FACTORS[r]))) as FactorId[];
  const skipped = (["front", "side", "back", "bend"] as ScanView[]).filter((v) => !captures[v]?.ok);
  const bend = captures.bend;

  const save = () => { const next = [...saved, toSaved(summary)]; if (writeSaved(next)) { setSaved(next.slice(-5)); setJustSaved(true); } };
  const clear = () => { try { window.localStorage.removeItem(STORE); } catch { /* nothing to clear */ } setSaved([]); setJustSaved(false); };

  return (
    <section className="ps-card sc-report" aria-labelledby="sc-report-h">
      <h2 id="sc-report-h">{t({ en: "Your posture scan", ur: "Aap ka posture scan" })}</h2>
      <p className="ps-prov">{t({ en: "A screen with limits. The skeleton is an illustration, not an X-ray, and it cannot see your spine. The ranges are provisional until the validation study is finished. Left and right are your own sides.", ur: "Hadood wali screen. Skeleton tasveeri misaal hai, X-ray nahi, aur yeh aap ki reedh nahi dekh sakta. Ranges tab tak aarzi hain jab tak validation study khatam na ho. Left aur right aap ke apne sides hain." })}</p>
      {skipped.length > 0 && (
        <p className="ps-note" role="status">
          {t({ en: "Not done or not readable: ", ur: "Nahi hua ya parha nahi ja saka: " })}{skipped.map((v) => t(VIEW_TEXT[v].name)).join(", ")}. {t({ en: "The matching parts of the picture are left plain.", ur: "Tasveer ke mutaliq hissay saade chhode gaye hain." })}{" "}
          {skipped.map((v) => (<button key={v} type="button" className="sc-link" data-print-hide onClick={() => onMore(v)}>{t({ en: `Do the ${VIEW_TEXT[v].name.en.toLowerCase()}`, ur: `${VIEW_TEXT[v].name.ur} karein` })}</button>))}
        </p>
      )}

      <div className="sc-grid">
        <div className="sc-fig">
          <SkeletonViewer pose={pose} severities={severities} labels={labels} />
          <ul className="sc-legend" aria-label={t({ en: "Colours", ur: "Rang" })}>
            <li><i data-k="0" /> {t(SEVERITY_TEXT.stops[0])}</li>
            <li><i data-k="1" /> {t(SEVERITY_TEXT.stops[1])}</li>
            <li><i data-k="2" /> {t(SEVERITY_TEXT.stops[2])}</li>
          </ul>
          <p className="ps-note">{t({ en: "Plain bones were either in the usual range or not measured. A tilt smaller than the tool's margin of error is drawn level.", ur: "Saade rang ki haddiyan ya aam range mein thin ya naapi nahi gayin. Jo jhukao tool ki ghalti ki hadd se chhota ho woh barabar dikhaya jata hai." })}</p>
        </div>

        <ul className="sc-regions">
          {REGIONS.map((r) => {
            const s = severities[r];
            return (
              <li key={r} className="sc-region" data-sev={s === null ? "na" : s}>
                <div className="ps-result-head"><strong>{t(REGION_TEXT[r].label)}</strong><span className="ps-chip">{s === null ? t({ en: "Not measured", ur: "Naapa nahi gaya" }) : t(SEVERITY_TEXT.stops[s])}</span></div>
                <div className="sc-stops" role="img" aria-label={s === null ? t(SEVERITY_TEXT.unknown) : t(SEVERITY_TEXT.stops[s])}>
                  {[0, 1, 2].map((k) => <span key={k} data-on={s === k} data-k={k} />)}
                </div>
                <p className="ps-note">{s === null ? t(SEVERITY_TEXT.unknown) : t(REGION_TEXT[r].says)}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {Object.keys(photos).length > 0 && (
        <div className="sc-photos" data-print-hide>
          <div className="ps-row">
            <button type="button" className="ps-btn ps-ghost" onClick={() => setShowPhotos((v) => !v)} aria-pressed={showPhotos}>{showPhotos ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />} {t({ en: showPhotos ? "Hide my pictures" : "Show my pictures", ur: showPhotos ? "Meri tasveerein chhupayein" : "Meri tasveerein dikhayein" })}</button>
          </div>
          {showPhotos && (
            <ul className="sc-pics">
              {(["front", "side", "back", "bend"] as ScanView[]).filter((v) => photos[v]).map((v) => (
                <li key={v}><img src={photos[v]} alt={t({ en: `Your ${VIEW_TEXT[v].name.en.toLowerCase()} picture with the lines used for the numbers`, ur: `Aap ki ${VIEW_TEXT[v].name.ur} tasveer un lakeeron ke saath jin se numbers liye gaye` })} /><span>{t(VIEW_TEXT[v].name)}</span></li>
              ))}
            </ul>
          )}
          <p className="ps-note">{t({ en: "Pictures are shown only on this screen. They are not saved, sent or printed.", ur: "Tasveerein sirf is screen par dikhayi jati hain. Woh save, bheji ya print nahi hotin." })}</p>
        </div>
      )}

      <h3>{t({ en: "Your numbers", ur: "Aap ke numbers" })}</h3>
      <ul className="ps-results">
        {metricIds.map((id) => {
          const c = summary[id]!;
          const b = band(id, c.value, c.plusMinus);
          const unit = metricDef(id).unit === "deg" ? "°" : "%";
          return (
            <li key={id} className="ps-result" data-band={b}>
              <div className="ps-result-head"><strong>{t(METRIC_TEXT[id].label)}</strong><span className="ps-chip">{t(BAND_TEXT[b].label)}</span></div>
              <p className="ps-value">{c.value}{unit} <span>± {c.plusMinus}{unit}</span></p>
              <p>{t(BAND_TEXT[b].line)}</p>
              {c.sources.length > 1 && <p className="ps-note">{t({ en: "Averaged from the front and back views.", ur: "Saamne aur peeche ke views ka average." })}</p>}
              {c.disagree && <p className="ps-note" role="note">{t({ en: "The front and back views point in opposite directions, so treat this one as unclear and try again.", ur: "Saamne aur peeche ke views ulti taraf ishara karte hain, isliye ise ghair wazeh samjhein aur dobara koshish karein." })}</p>}
              <details><summary>{t({ en: "What this measures", ur: "Yeh kya naapta hai" })}</summary><p>{t(METRIC_TEXT[id].what)}</p></details>
            </li>
          );
        })}
      </ul>

      {bend && bend.ok && (
        <>
          <h3>{t(VIEW_TEXT.bend.name)}</h3>
          <ul className="ps-results">
            {bend.results.map((r) => {
              const id = r.id as BendMetricId;
              const unit = BEND_METRICS[id].unit === "deg" ? "°" : "%";
              return (
                <li key={id} className="ps-result" data-band="typical">
                  <div className="ps-result-head"><strong>{t(BEND_TEXT[id].label)}</strong></div>
                  <p className="ps-value">{r.value}{unit} <span>± {r.plusMinus}{unit}</span></p>
                  <details><summary>{t({ en: "What this measures", ur: "Yeh kya naapta hai" })}</summary><p>{t(BEND_TEXT[id].what)}</p></details>
                </li>
              );
            })}
          </ul>
          {bendNotes(bend).map((n) => <p key={n} className="ps-note">{t(BEND_NOTE_TEXT[n])}</p>)}
          <p className="ps-note">{t({ en: "The bend is described, not graded. It does not look for a rib hump and does not check for scoliosis.", ur: "Jhukne ko bayan kiya gaya hai, grade nahi. Yeh pasli ka ubhaar nahi dhoondta aur scoliosis ki jaanch nahi karta." })}</p>
        </>
      )}

      {factors.length > 0 && (
        <>
          <h3>{t({ en: "Everyday things that can load these areas", ur: "Roz ki cheezein jo in hissoon par bojh daal sakti hain" })}</h3>
          <ul className="sc-factors">
            {factors.map((f) => (
              <li key={f}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICON[f]} /></svg>
                <div><strong>{t(FACTORS[f].label)}</strong><span>{t(FACTORS[f].note)}</span></div>
              </li>
            ))}
          </ul>
          <p className="ps-note">{t({ en: "These are common habits, not a cause and not a diagnosis. Small changes, like moving more often, often help.", ur: "Yeh aam aadatein hain, wajah nahi aur tashkhees nahi. Chhoti tabdeeliyan, jaise zyada harkat karna, aksar madad karti hain." })}</p>
        </>
      )}

      <h3>{t({ en: "Compare with last time", ur: "Pichhli baar se muqabla" })}</h3>
      {last && changes.length > 0 ? (
        <>
          <p className="ps-note">{t({ en: `Your last saved scan on this device: ${new Date(last.at).toLocaleDateString()}. A change smaller than the margin of error of both scans is not called a change.`, ur: `Is device par aap ka pichhla save shuda scan: ${new Date(last.at).toLocaleDateString()}. Jo tabdeeli dono scans ki ghalti ki hadd se chhoti ho use tabdeeli nahi kaha jata.` })}</p>
          <ul className="sc-changes">{changes.map(({ id, c }) => (<li key={id} data-c={c}><span>{t(METRIC_TEXT[id].label)}</span><strong>{t(COMPARE_TEXT[c])}</strong></li>))}</ul>
        </>
      ) : <p className="ps-note">{t({ en: "No earlier scan is saved on this device. Saving keeps only the numbers, never a picture, and stays on this device.", ur: "Is device par koi purana scan save nahi. Save karne se sirf numbers rakhe jate hain, tasveer kabhi nahi, aur woh isi device par rehte hain." })}</p>}
      <div className="ps-row" data-print-hide>
        <button type="button" className="ps-btn ps-ghost" onClick={save} disabled={justSaved}><Save aria-hidden="true" /> {t({ en: justSaved ? "Saved on this device" : "Save numbers on this device", ur: justSaved ? "Is device par save ho gaya" : "Numbers is device par save karein" })}</button>
        {saved.length > 0 && <button type="button" className="ps-btn ps-ghost" onClick={clear}><Trash2 aria-hidden="true" /> {t({ en: "Delete saved scans", ur: "Save shuda scans mita dein" })}</button>}
      </div>

      <div className="ps-safe"><AlertTriangle aria-hidden="true" /> <span>{t(REPORT_SAFE)}</span></div>
      <h3>{t({ en: "What next", ur: "Ab aage" })}</h3>
      <ul className="ps-next">{NEXT_STEPS.map((n) => (<li key={n.href}>{t(n.text)} <Link href={n.href}>{t(n.label)}</Link></li>))}</ul>
      <div className="ps-row" data-print-hide>
        <button type="button" className="ps-btn" onClick={onAgain}><RotateCcw aria-hidden="true" /> {t({ en: "Scan again", ur: "Dobara scan karein" })}</button>
        <button type="button" className="ps-btn ps-ghost" onClick={() => window.print()}><Printer aria-hidden="true" /> {t({ en: "Print", ur: "Print" })}</button>
      </div>
    </section>
  );
}
