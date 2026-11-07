"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Bot, CornerDownLeft, Search, X } from "lucide-react";
import { popularLessons, searchAcademy, visibleWings, type AcademySearchHit } from "@/lib/academy-map";
import { AcademyIcon } from "./AcademyIcon";

type Item =
  | { kind: "place"; hit: AcademySearchHit }
  | { kind: "ask"; query: string };

/** Opens the Physio Nexus AI chat with a question (listened to by PhysioNexusAI). */
export function askPhysioNexusAI(query: string) {
  window.dispatchEvent(new CustomEvent("pna-ai:ask", { detail: query }));
}

export function CommandPalette({ open, onClose, atlasPublished }: { open: boolean; onClose: () => void; atlasPublished: boolean }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  const items: Item[] = useMemo(() => {
    const clean = query.trim();
    if (!clean) {
      const start = [
        ...visibleWings(atlasPublished).flatMap((wing) => wing.places.slice(0, wing.id === "academy" ? 2 : 3).map((place) => ({ ...place, wing: wing.label }))),
        ...popularLessons.slice(0, 3).map((place) => ({ ...place, wing: "Lesson" })),
      ];
      return start.map((hit) => ({ kind: "place" as const, hit }));
    }
    const hits = searchAcademy(clean, atlasPublished, 8).map((hit) => ({ kind: "place" as const, hit }));
    return [...hits, { kind: "ask" as const, query: clean }];
  }, [query, atlasPublished]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open || typeof document === "undefined") return null;

  function choose(item: Item) {
    onClose();
    if (item.kind === "ask") {
      askPhysioNexusAI(item.query);
      return;
    }
    window.location.href = item.hit.href;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(items.length - 1, value + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[active];
      if (item) choose(item);
    } else if (event.key === "Tab") {
      // Keep focus inside the dialog.
      event.preventDefault();
      inputRef.current?.focus();
    }
  }

  let lastGroup = "";

  return createPortal(
    <div className="nx-cmdk-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="nx-cmdk" role="dialog" aria-modal="true" aria-label="Search the academy" onKeyDown={onKeyDown}>
        <div className="nx-cmdk-input">
          <Search className="h-5 w-5 flex-none text-[var(--nx-aqua)]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lessons, cases, services… or ask a question"
            aria-label="Search the academy"
            role="combobox"
            aria-expanded="true"
            aria-controls="nx-cmdk-results"
            aria-activedescendant={items[active] ? `nx-cmdk-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[var(--nx-dim)] hover:text-white" aria-label="Close search">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div ref={listRef} id="nx-cmdk-results" role="listbox" aria-label="Results" className="nx-cmdk-list">
          {items.map((item, index) => {
            const group = item.kind === "ask" ? "Physio Nexus AI" : query.trim() ? "Best matches" : item.hit.wing === "Lesson" ? "Popular lessons" : "Jump to";
            const heading = group !== lastGroup ? group : null;
            lastGroup = group;
            return (
              <div key={item.kind === "ask" ? "ask" : item.hit.href}>
                {heading ? <p className="nx-cmdk-group">{heading}</p> : null}
                <button
                  type="button"
                  id={`nx-cmdk-${index}`}
                  role="option"
                  aria-selected={index === active}
                  data-index={index}
                  data-active={index === active}
                  className="nx-cmdk-item"
                  onMouseMove={() => setActive(index)}
                  onClick={() => choose(item)}
                >
                  {item.kind === "ask" ? (
                    <>
                      <span className="nx-mega-icon"><Bot className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">Ask Physio Nexus AI: “{item.query}”</span>
                        <small>Grounded answer from PNA content, in English or Roman Urdu</small>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="nx-mega-icon"><AcademyIcon name={item.hit.icon} className="h-[18px] w-[18px]" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{item.hit.label}</span>
                        <small>{item.hit.wing} · {item.hit.description}</small>
                      </span>
                    </>
                  )}
                  {index === active ? <CornerDownLeft className="h-4 w-4 flex-none text-[var(--nx-dim)]" aria-hidden="true" /> : null}
                </button>
              </div>
            );
          })}
        </div>
        <div className="nx-cmdk-foot">
          <span>↑ ↓ to move · Enter to open · Esc to close</span>
          <span className="hidden sm:inline">Tip: press Ctrl K or / anywhere</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
