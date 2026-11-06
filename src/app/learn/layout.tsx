import type { ReactNode } from "react";
import "./teacher.css";

export default function LearnLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gradient-to-b from-[#f4fbfa] via-white to-white">{children}</div>;
}
