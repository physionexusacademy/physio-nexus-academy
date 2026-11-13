import type { ReactNode } from "react";
import "./account.css";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="acct-root">{children}</div>;
}
