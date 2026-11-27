import type { ReactNode } from "react";
import "../dark-zone.css";

/** Manual Therapy runs in the dark futuristic zone (see src/app/dark-zone.css). */
export default function ManualTherapyLayout({ children }: { children: ReactNode }) {
  return <div className="nx-dz">{children}</div>;
}
