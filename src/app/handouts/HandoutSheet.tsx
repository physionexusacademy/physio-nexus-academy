"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Printer } from "lucide-react";
import { useLang } from "@/lib/lang";
import { siteConfig } from "@/lib/site-config";
import type { Bi, Handout } from "@/lib/handouts";
import "./handouts.css";

type Mode = "en" | "ur" | "both";

function Line({ text, mode }: { text: Bi; mode: Mode }) {
  if (mode === "both") {
    return (
      <>
        <span lang="en">{text.en}</span>
        <span className="ho-ur" lang="ur-Latn">{text.ur}</span>
      </>
    );
  }
  return <span lang={mode === "ur" ? "ur-Latn" : "en"}>{mode === "ur" ? text.ur : text.en}</span>;
}

export function HandoutSheet({ handout }: { handout: Handout }) {
  const [siteLang] = useLang();
  const [chosen, setChosen] = useState<Mode | null>(null);
  const mode: Mode = chosen ?? siteLang;
  const options: { id: Mode; label: string }[] = [
    { id: "en", label: "English" },
    { id: "ur", label: "Roman Urdu" },
    { id: "both", label: "Both" },
  ];
  return (
    <div className="ho-page">
      <div className="ho-toolbar" data-print-hide>
        <Link href="/handouts" className="ho-back"><ArrowLeft aria-hidden="true" /> All handouts</Link>
        <div className="ho-modes" role="group" aria-label="Language of the handout">
          {options.map((o) => (
            <button key={o.id} type="button" aria-pressed={mode === o.id} onClick={() => setChosen(o.id)} className="ho-mode" data-active={mode === o.id}>{o.label}</button>
          ))}
        </div>
        <button type="button" className="ho-print" onClick={() => window.print()}><Printer aria-hidden="true" /> Print or save as PDF</button>
      </div>

      <article className="ho-sheet">
        <header className="ho-head">
          <p className="ho-brand">Physio Nexus Academy</p>
          <h1><Line text={handout.title} mode={mode} /></h1>
          <p className="ho-for"><Line text={handout.forWhom} mode={mode} /></p>
        </header>
        <p className="ho-intro"><Line text={handout.intro} mode={mode} /></p>

        {handout.sections.map((section) => (
          <section key={section.heading.en} className="ho-section">
            <h2><Line text={section.heading} mode={mode} /></h2>
            {section.kind === "steps" ? (
              <ol className="ho-steps">
                {section.items.map((item) => (<li key={item.en}><Line text={item} mode={mode} /></li>))}
              </ol>
            ) : (
              <ul className="ho-bullets">
                {section.items.map((item) => (<li key={item.en}><Line text={item} mode={mode} /></li>))}
              </ul>
            )}
          </section>
        ))}

        <section className="ho-help" aria-labelledby="ho-help-title">
          <h2 id="ho-help-title"><AlertTriangle aria-hidden="true" /> <Line text={{ en: "Get help straight away if", ur: "Foran madad lein agar" }} mode={mode} /></h2>
          <ul>
            {handout.help.map((item) => (<li key={item.en}><Line text={item} mode={mode} /></li>))}
          </ul>
        </section>

        <footer className="ho-foot">
          <p><Line text={{ en: "This sheet is general advice. Your physiotherapist or doctor's advice for you comes first.", ur: "Yeh sheet aam mashwara hai. Aap ke liye aap ke physiotherapist ya doctor ka mashwara pehle hai." }} mode={mode} /></p>
          <p><strong>Physio Nexus Academy</strong> · {siteConfig.contact.phoneDisplay} · {siteConfig.contact.address}</p>
        </footer>
      </article>
    </div>
  );
}
