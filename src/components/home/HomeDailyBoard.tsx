"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Trophy } from "lucide-react";
import { DailyLeaderboard } from "@/components/daily-challenge/DailyLeaderboard";

/**
 * The "Today's leaderboard — top 5" fold on the homepage. The scores are only requested when the visitor opens it, so opening the
 * homepage makes no database call at all.
 */
export function HomeDailyBoard() {
  const [opened, setOpened] = useState(false);
  return (
    <details className="hdc-board" onToggle={(event) => event.currentTarget.open && setOpened(true)}>
      <summary><Trophy className="h-4 w-4 text-[var(--nx-amber)]" aria-hidden="true" /> Today&apos;s leaderboard — top 5 <ChevronDown className="hdc-chev h-4 w-4" aria-hidden="true" /></summary>
      <div className="hdc-board-body">
        {opened ? <DailyLeaderboard compact title="Today's Top 5" /> : null}
        <a href="/daily-challenge#full-leaderboard" className="hdc-board-link">All scores, monthly leaders and yearly champions <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
      </div>
    </details>
  );
}
