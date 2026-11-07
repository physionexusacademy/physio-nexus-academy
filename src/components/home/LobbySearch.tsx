"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Bot, Search } from "lucide-react";
import { searchAcademy } from "@/lib/academy-map";
import { AcademyIcon } from "@/components/nexus/AcademyIcon";
import { askPhysioNexusAI } from "@/components/nexus/CommandPalette";

const suggestions = ["Convex–concave rule", "Frozen shoulder", "Maitland grades", "Kamar dard", "Viva preparation"];

/** The lobby's "ask the academy" bar: jumps to a place, or hands the question to Physio Nexus AI. */
export function LobbySearch({ atlasPublished }: { atlasPublished: boolean }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const listId = useId();
  const results = useMemo(() => searchAcademy(query, atlasPublished, 5), [query, atlasPublished]);
  const showResults = focused && query.trim().length > 1;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    // A strong, single destination match goes straight there; anything else is a question for the AI.
    const top = results[0];
    if (top && results.length === 1) {
      window.location.href = top.href;
      return;
    }
    askPhysioNexusAI(clean);
  }

  return (
    <div className="lobby-search-wrap">
      <form role="search" aria-label="Search Physio Nexus Academy" className="lobby-search" onSubmit={submit}>
        <Search className="h-5 w-5 flex-none text-[var(--nx-aqua)]" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Ask anything — a topic, a technique, or your symptoms…"
          aria-label="Search lessons, cases and services, or ask a question"
          aria-controls={showResults ? listId : undefined}
          autoComplete="off"
        />
        <button type="submit" className="lobby-search-go" aria-label="Search or ask">
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      {showResults ? (
        <ul id={listId} className="lobby-search-results" aria-label="Suggestions">
          {results.map((place) => (
            <li key={place.href}>
              <a href={place.href} className="lobby-search-hit">
                <span className="nx-mega-icon"><AcademyIcon name={place.icon} className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0">
                  <strong>{place.label}</strong>
                  <small>{place.wing} · {place.description}</small>
                </span>
              </a>
            </li>
          ))}
          <li>
            <button type="button" className="lobby-search-hit w-full text-left" onMouseDown={(event) => event.preventDefault()} onClick={() => askPhysioNexusAI(query.trim())}>
              <span className="nx-mega-icon"><Bot className="h-[18px] w-[18px]" aria-hidden="true" /></span>
              <span className="min-w-0">
                <strong>Ask Physio Nexus AI</strong>
                <small className="block truncate">“{query.trim()}” — answered from PNA content</small>
              </span>
            </button>
          </li>
        </ul>
      ) : null}

      <div className="lobby-search-chips" aria-label="Try asking">
        {suggestions.map((text) => (
          <button key={text} type="button" className="nx-chip" onClick={() => askPhysioNexusAI(text)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
