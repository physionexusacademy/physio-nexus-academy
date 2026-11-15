"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

/** The record cards of the list pages (a stack of bordered cards) and the rows of their tables. Create-forms and headings never match. */
const ITEMS = '[class*="space-y-"] > [class*="rounded-xl"][class*="border-grey-200"][class*="bg-white"], tbody > tr';

/**
 * "Filter this page": types a few letters and only the matching records stay on screen (name, phone, status, book title, city…).
 * It searches what is already on the page; it changes no data and no action, and it restores everything when cleared or when you leave.
 */
export function PageFilter({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState({ total: 0, shown: 0 });

  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(ITEMS));
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const item of items) {
      const typed = Array.from(item.querySelectorAll<HTMLInputElement>("input, textarea")).map((field) => field.value).join(" ");
      const text = `${item.textContent ?? ""} ${typed}`.toLowerCase();
      const hit = words.every((word) => text.includes(word));
      item.style.display = hit ? "" : "none";
      if (hit) shown++;
    }
    setCount({ total: items.length, shown });
    return () => {
      for (const item of items) item.style.display = "";
    };
  }, [query, scope]);

  if (!count.total) return null;
  return (
    <div className="ad-filter" role="search">
      <Search className="h-4 w-4" aria-hidden="true" />
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter this page…" aria-label="Filter the records on this page" />
      {query ? (
        <>
          <span aria-live="polite">{count.shown} of {count.total}</span>
          <button type="button" onClick={() => setQuery("")} aria-label="Clear the filter"><X className="h-4 w-4" aria-hidden="true" /></button>
        </>
      ) : null}
    </div>
  );
}
