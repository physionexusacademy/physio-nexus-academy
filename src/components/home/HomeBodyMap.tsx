"use client";

import { useState } from "react";
import { ArrowRight, MousePointerClick, ScanLine, Stethoscope } from "lucide-react";
import { areas, typeLabel, type AreaId, type TypeId } from "@/lib/conditions/taxonomy";
import "./home-bodymap.css";

type Item = { slug: string; name: string; area: AreaId; type: TypeId; stages: number };

/** A limb drawn as an outlined capsule: all outlines first, then all fills, so the silhouette merges cleanly. */
const parts: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [
  { x1: 100, y1: 58, x2: 100, y2: 78, w: 16 }, // neck
  { x1: 100, y1: 108, x2: 100, y2: 168, w: 60 }, // torso
  { x1: 66, y1: 94, x2: 134, y2: 94, w: 26 }, // shoulders
  { x1: 62, y1: 98, x2: 44, y2: 170, w: 20 }, // upper arm L
  { x1: 138, y1: 98, x2: 156, y2: 170, w: 20 }, // upper arm R
  { x1: 44, y1: 170, x2: 32, y2: 244, w: 16 }, // forearm L
  { x1: 156, y1: 170, x2: 168, y2: 244, w: 16 }, // forearm R
  { x1: 82, y1: 198, x2: 118, y2: 198, w: 34 }, // hips
  { x1: 84, y1: 204, x2: 80, y2: 300, w: 28 }, // thigh L
  { x1: 116, y1: 204, x2: 120, y2: 300, w: 28 }, // thigh R
  { x1: 80, y1: 300, x2: 78, y2: 392, w: 20 }, // shin L
  { x1: 120, y1: 300, x2: 122, y2: 392, w: 20 }, // shin R
  { x1: 68, y1: 410, x2: 90, y2: 410, w: 14 }, // foot L
  { x1: 110, y1: 410, x2: 132, y2: 410, w: 14 }, // foot R
];

/** Tappable points (viewBox 200 × 440), each opens one body area. */
const hotspots: { id: string; area: AreaId; x: number; y: number; label: string }[] = [
  { id: "neck", area: "neck", x: 100, y: 66, label: "Neck and jaw" },
  { id: "sh-l", area: "shoulder", x: 64, y: 94, label: "Shoulder" },
  { id: "sh-r", area: "shoulder", x: 136, y: 94, label: "Shoulder" },
  { id: "back", area: "back", x: 100, y: 134, label: "Back and spine" },
  { id: "arm-l", area: "arm", x: 40, y: 172, label: "Elbow, wrist and hand" },
  { id: "arm-r", area: "arm", x: 160, y: 172, label: "Elbow, wrist and hand" },
  { id: "hip-l", area: "hip", x: 84, y: 204, label: "Hip and thigh" },
  { id: "hip-r", area: "hip", x: 116, y: 204, label: "Hip and thigh" },
  { id: "knee-l", area: "knee", x: 80, y: 302, label: "Knee" },
  { id: "knee-r", area: "knee", x: 120, y: 302, label: "Knee" },
  { id: "foot-l", area: "foot", x: 78, y: 386, label: "Leg, ankle and foot" },
  { id: "foot-r", area: "foot", x: 122, y: 386, label: "Leg, ankle and foot" },
];

const systemAreas: AreaId[] = ["neuro", "chest", "whole"];

export function HomeBodyMap({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<AreaId | null>(null);
  const active = selected ? areas.find((a) => a.id === selected) : null;
  const list = selected ? items.filter((i) => i.area === selected) : [];
  const countFor = (id: AreaId) => items.filter((i) => i.area === id).length;

  return (
    <section id="body-map" className="hbm" aria-labelledby="hbm-title">
      <div className="container-content">
        <div className="hbm-card nx-sky nx-grid">
          <div className="hbm-copy">
            <p className="hbm-kicker"><ScanLine className="h-4 w-4" aria-hidden="true" /> Find your area</p>
            <h2 id="hbm-title">Where does it hurt?</h2>
            <p className="hbm-lead">Tap a glowing point on the body — or choose an area below — and see the conditions, treatment plans and exercises for it.</p>

            <div className="hbm-chips" role="group" aria-label="Choose a body area">
              {areas.filter((a) => !systemAreas.includes(a.id)).map((a) => (
                <button key={a.id} type="button" aria-pressed={selected === a.id} onClick={() => setSelected(selected === a.id ? null : a.id)} className="hbm-chip">
                  {a.label} <span>{countFor(a.id)}</span>
                </button>
              ))}
              {systemAreas.map((id) => {
                const a = areas.find((x) => x.id === id)!;
                return (
                  <button key={id} type="button" aria-pressed={selected === id} onClick={() => setSelected(selected === id ? null : id)} className="hbm-chip hbm-chip-system">
                    {a.label} <span>{countFor(id)}</span>
                  </button>
                );
              })}
            </div>

            <div className="hbm-panel" aria-live="polite">
              {active ? (
                <>
                  <p className="hbm-panel-head"><strong>{active.label}</strong><span>{list.length} conditions</span></p>
                  <p className="hbm-panel-hint">{active.hint}</p>
                  <ul className="hbm-list">
                    {list.slice(0, 5).map((c) => (
                      <li key={c.slug}>
                        <a href={`/conditions/${c.slug}#quick`}>
                          <span className="hbm-list-name">{c.name}</span>
                          <span className="hbm-list-meta">{typeLabel(c.type)} · {c.stages}-stage plan</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="hbm-actions">
                    <a href={`/conditions?area=${active.id}`} className="nx-btn nx-btn-primary">See all {list.length} in this area <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                    <a href="/symptom-checker" className="nx-btn nx-btn-ghost"><Stethoscope className="h-4 w-4" aria-hidden="true" /> Symptom checker</a>
                  </div>
                </>
              ) : (
                <p className="hbm-empty"><MousePointerClick className="h-5 w-5" aria-hidden="true" /> Pick a glowing point to begin. Not sure what is wrong? <a href="/symptom-checker">Try the symptom checker</a>.</p>
              )}
            </div>
          </div>

          <div className="hbm-figure">
            <svg viewBox="0 0 200 440" className="hbm-svg" role="img" aria-label="Human body map. Use the area buttons or tap a point.">
              <g className="hbm-outline">
                {parts.map((p, i) => <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} strokeWidth={p.w + 3} />)}
                <circle cx="100" cy="36" r="23.5" />
                <circle cx="30" cy="258" r="11.5" />
                <circle cx="170" cy="258" r="11.5" />
              </g>
              <g className="hbm-fill">
                {parts.map((p, i) => <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} strokeWidth={p.w} />)}
                <circle cx="100" cy="36" r="21" />
                <circle cx="30" cy="258" r="9" />
                <circle cx="170" cy="258" r="9" />
              </g>
              <line className="hbm-spine" x1="100" y1="82" x2="100" y2="182" />
            </svg>
            <span className="hbm-scan" aria-hidden="true" />
            {hotspots.map((h) => (
              <button
                key={h.id}
                type="button"
                className={"hbm-dot" + (selected === h.area ? " is-on" : "") + (selected && selected !== h.area ? " is-dim" : "")}
                style={{ left: `${(h.x / 200) * 100}%`, top: `${(h.y / 440) * 100}%` }}
                aria-label={`${h.label} — ${countFor(h.area)} conditions`}
                aria-pressed={selected === h.area}
                onClick={() => setSelected(selected === h.area ? null : h.area)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
