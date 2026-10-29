"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

function countdownToNextPakistanMidnight(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value || 0);
  // Pakistan Standard Time is UTC+05:00 and currently has no daylight-saving time.
  const nextResetUtc = Date.UTC(part("year"), part("month") - 1, part("day") + 1) - 5 * 60 * 60 * 1000;
  const seconds = Math.max(0, Math.ceil((nextResetUtc - now.getTime()) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":");
}

export function DailyChallengeCountdown() {
  const [remaining, setRemaining] = useState("Updating…");
  useEffect(() => {
    const update = () => setRemaining(countdownToNextPakistanMidnight(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="dc-flagship-countdown" aria-label="Time until the next daily clinical challenge">
      <div className="dc-flagship-countdown-icon"><Clock3 className="h-5 w-5" aria-hidden="true" /></div>
      <div>
        <p className="dc-flagship-countdown-label">NEXT CHALLENGE IN</p>
        <p className="dc-flagship-countdown-time tabular-nums" aria-live="off">{remaining}</p>
      </div>
      <span className="dc-flagship-countdown-tz">PKT</span>
    </div>
  );
}
