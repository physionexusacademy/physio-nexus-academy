"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "mastery", label: "Start" },
  { id: "clinical-method", label: "Practical" },
  { id: "clinical-essentials", label: "Safety" },
  { id: "mechanism", label: "Science" },
];

export function TechniqueReadingNav() {
  const [active, setActive] = useState("mastery");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      aria-label="Technique reading sections"
      className="sticky top-16 z-30 -mx-4 mb-2 border-b border-slate-200/80 bg-white/95 px-4 py-2 backdrop-blur-sm sm:-mx-0 sm:rounded-2xl sm:border sm:px-3 sm:shadow-sm"
    >
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`flex-none rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              active === section.id
                ? "bg-teal-700 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
