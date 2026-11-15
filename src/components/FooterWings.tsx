"use client";

import type { AcademyWing } from "@/lib/academy-map";
import { useLang } from "@/lib/lang";
import { localizeWing, shellText } from "@/lib/shell-ur";

/** The wings of the campus directory in the footer, in the language chosen with the site switch. */
export function FooterWings({ wings }: { wings: AcademyWing[] }) {
  const [lang] = useLang();
  return (
    <>
      {wings.map((wing) => localizeWing(wing, lang)).map((wing) => (
        <nav key={wing.id} aria-label={`${wing.label} ${shellText("wingSuffix", lang)}`}>
          <p className="nx-footer-title">{wing.label}</p>
          <p className="mt-1 text-xs text-[var(--nx-dim)]">{wing.tagline}</p>
          <ul className="mt-4 space-y-2.5">
            {wing.places.map((place) => (
              <li key={place.href}>
                <a href={place.href} className="text-sm">
                  {place.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </>
  );
}
