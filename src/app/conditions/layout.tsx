import type { ReactNode } from "react";
import "../dark-zone.css";

/** Conditions & Treatment runs in the dark futuristic zone (see src/app/dark-zone.css). */
export default function ConditionsLayout({ children }: { children: ReactNode }) {
  return <div className="nx-dz">{children}</div>;
}
