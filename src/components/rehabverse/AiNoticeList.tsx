import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { NoticeItem } from "@/lib/rehabverse/ai/notices";
import { T } from "./useLang";

/** The list of statements in an AI notice (the wording lives in lib/rehabverse/ai/notices.ts, which the physiotherapist's review pack reads too). */
export function AiNoticeList({ items, className }: { items: NoticeItem[]; className: string }) {
  return (
    <ul className={className}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          {item.icon === "alert" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />}
          <span><T en={item.en} ru={item.ru} /></span>
        </li>
      ))}
    </ul>
  );
}
