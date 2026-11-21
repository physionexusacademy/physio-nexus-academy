"use client";

import { ArrowRight } from "lucide-react";
import { HomeTodayBoard } from "@/components/daily-challenge/ChampionBoards";

/**
 * "Today's Top 5" on the home page: always open, in the same dark, glowing design as the Weekly Leagues and the Daily Challenge page. The
 * scores are requested only when it comes near the screen (HomeTodayBoard), so opening the home page makes no database call.
 */
export function HomeDailyBoard() {
  return (
    <div className="hdc-today cb" data-pna-home-today-board="v1">
      <HomeTodayBoard />
      <a href="/daily-challenge#full-leaderboard" className="hdc-board-link">All scores, monthly leaders and yearly champions <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
    </div>
  );
}
