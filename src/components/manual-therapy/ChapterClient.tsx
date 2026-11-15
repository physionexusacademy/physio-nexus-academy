"use client";

import { useState } from "react";
import { ChevronDown, Languages, ListChecks, Sparkles } from "lucide-react";
import { useLang } from "@/lib/lang";
import type { ChapterComponents } from "@/lib/manual-therapy-components";
import TechniqueDemo2D from "@/components/manual-therapy/TechniqueDemo2D";
import type { DemoKind } from "@/lib/manual-therapy-depth-types";
import "./chapter-reader.css";

/** Which drawing fits a named technique best (its own steps are the captions). */
function kindFor(name: string, fallback: DemoKind): DemoKind {
  const n = name.toLowerCase();
  if (/slider|tensioner/.test(n)) return "neural";
  if (/grade v\b|thrust/.test(n)) return "thrust";
  if (/hold-relax|contract-relax|rhythmic|slow reversal|pir\b|reciprocal|isotonic|isometric/.test(n)) return "contract";
  if (/triggerband|cylinder|folding|continuum|tectonic|herniated|release/.test(n)) return "fascia";
  if (/friction/.test(n)) return "friction";
  if (/derangement|dysfunction|postural/.test(n)) return "response";
  if (/grade|glide|traction|snag|nag|extension|flexion|abduction|adduction|circumduction/.test(n)) return "glide";
  return fallback;
}

export type UrduSection = { heading: string; text: string };

/** "1. … 2. …" text into separate steps. */
function steps(text: string): string[] | null {
  if (!/^\s*1[.)]\s/.test(text)) return null;
  const parts = text.split(/\s*\n\s*|\s+(?=\d{1,2}[.)]\s)/).map((part) => part.replace(/^\d{1,2}[.)]\s*/, "").trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
}

/** "Sawal: … Jawab: …" text into question and answer pairs. */
function quiz(text: string): { q: string; a: string }[] | null {
  const pairs = [...text.matchAll(/Sawal:\s*([\s\S]*?)\s*Jawab:\s*([\s\S]*?)(?=\s*Sawal:|$)/g)].map((match) => ({ q: match[1].trim(), a: match[2].trim() }));
  return pairs.length ? pairs : null;
}

function Body({ section }: { section: UrduSection }) {
  const list = steps(section.text);
  const pairs = /self-test/i.test(section.heading) ? quiz(section.text) : null;
  if (list) {
    return (
      <ol className="cr-steps">
        {list.map((line, index) => (
          <li key={index} style={{ ["--i" as string]: index }}><b>{index + 1}</b><span>{line}</span></li>
        ))}
      </ol>
    );
  }
  if (pairs) {
    return (
      <div className="cr-quiz">
        {pairs.map((pair) => (
          <details key={pair.q}>
            <summary>{pair.q}</summary>
            <p>{pair.a}</p>
          </details>
        ))}
      </div>
    );
  }
  return <p className="cr-text">{section.text}</p>;
}

/**
 * The whole chapter theory in natural spoken Roman Urdu (English technical words kept as they are said in the clinic). Shown only when the
 * visitor has chosen Roman Urdu with the site switch; the English chapter stays below it.
 */
export function UrduChapterGuide({ name, short, sections, deeper }: { name: string; short: string; sections: UrduSection[]; deeper: UrduSection[] }) {
  const [lang] = useLang();
  const [all, setAll] = useState(false);
  if (lang !== "ur") return null;
  const groups: [string, UrduSection[]][] = [["Chapter ka poora nizam", sections], ["Aur gehraai mein", deeper]];
  return (
    <section id="urdu" className="cr-ur" aria-labelledby="cr-ur-title">
      <header>
        <span className="cr-chip"><Languages className="h-4 w-4" aria-hidden="true" /> Roman Urdu mein poora chapter</span>
        <h2 id="cr-ur-title">{name}: asaan alfaaz mein</h2>
        <p className="cr-lead">{short}</p>
        <button type="button" className="cr-toggle" onClick={() => setAll((value) => !value)} aria-pressed={all}>
          <ListChecks className="h-4 w-4" aria-hidden="true" /> {all ? "Sab band karein" : "Sab sections kholein"}
        </button>
      </header>
      {groups.map(([label, list]) =>
        list.length ? (
          <div key={label} className="cr-group">
            <p className="cr-group-label">{label}</p>
            <div className="cr-grid" key={String(all)}>
              {list.map((section, index) => (
                <details key={section.heading} open={all || (label === groups[0][0] && index < 3)} className="cr-card">
                  <summary>
                    <span className="cr-num">{index + 1}</span>
                    <span className="cr-card-title">{section.heading}</span>
                    <ChevronDown className="cr-chev h-4 w-4" aria-hidden="true" />
                  </summary>
                  <Body section={section} />
                </details>
              ))}
            </div>
          </div>
        ) : null,
      )}
      <p className="cr-foot">Yeh Roman Urdu learning aid hai. Doses aur techniques ko apne supervisor se approve karwayein; hands-on skill certified training se seekhein.</p>
    </section>
  );
}

/** The named techniques of a chapter, one by one: pick one, read what it is, then watch its steps appear in order. */
export function ChapterComponentsView({ data, name, defaultKind }: { data: ChapterComponents; name: string; defaultKind: DemoKind }) {
  const [lang] = useLang();
  const [index, setIndex] = useState(0);
  const ur = lang === "ur";
  const text = (pair: { en: string; ur: string }) => (ur ? pair.ur : pair.en);
  const item = data.items[Math.min(index, data.items.length - 1)];
  const list = ur ? item.perform.ur : item.perform.en;
  return (
    <section id="components" className="cr-comp scroll-mt-28" aria-labelledby="cr-comp-title">
      <p className="cr-kicker"><Sparkles className="h-4 w-4" aria-hidden="true" /> {ur ? "Techniques ek ek karke" : "The techniques, one by one"}</p>
      <h2 id="cr-comp-title">{text(data.heading)}</h2>
      <p className="cr-comp-intro">{text(data.intro)}</p>
      <div className="cr-comp-body">
        <div className="cr-tabs" role="tablist" aria-label={name}>
          {data.items.map((entry, i) => (
            <button key={entry.name} type="button" role="tab" aria-selected={i === index} onClick={() => setIndex(i)} className="cr-tab">
              {entry.name}
            </button>
          ))}
        </div>
        <article className="cr-panel" key={`${index}-${lang}`} role="tabpanel">
          <p className="cr-tag">{text(item.tag)}</p>
          <h3>{item.name}</h3>
          <p className="cr-what">{text(item.what)}</p>
          <div className="cr-demo">
            <TechniqueDemo2D
              key={`${index}-${lang}`}
              kind={kindFor(item.name, defaultKind)}
              title={item.name}
              captions={item.perform.en.map((detail, n) => ({ title: `Step ${n + 1}`, detail }))}
              captionsUr={item.perform.ur.map((detail, n) => ({ title: `Qadam ${n + 1}`, detail }))}
            />
          </div>
          <p className="cr-perform-label">{ur ? "Kaise ki jati hai" : "How it is performed"}</p>
          <ol className="cr-steps">
            {list.map((line, i) => (
              <li key={i} style={{ ["--i" as string]: i }}><b>{i + 1}</b><span>{line}</span></li>
            ))}
          </ol>
          {item.watch ? <p className="cr-watch"><b>{ur ? "Dhyan rakhein: " : "Watch for: "}</b>{text(item.watch)}</p> : null}
        </article>
      </div>
      <p className="cr-comp-note">
        {ur
          ? "Yeh teaching summary hai ke har method aam taur par kaise sikhayi jati hai. Hands-on skill certified training se aati hai; supervisor se protocol approve karwayein."
          : "A teaching summary of how each method is commonly taught. Hands-on skill comes from certified training; have a supervisor approve the protocol."}
      </p>
    </section>
  );
}
