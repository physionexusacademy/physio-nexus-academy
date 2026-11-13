"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAdminNotificationsReadAction } from "./actions";

export function MarkRead() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className="text-[12.5px] font-bold text-teal-700 hover:underline" onClick={() => start(async () => { await markAdminNotificationsReadAction(); router.refresh(); })}>
      Mark all read
    </button>
  );
}
