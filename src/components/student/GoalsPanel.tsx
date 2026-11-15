"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Award, Lock, Target } from "lucide-react";
import { DEFAULT_GOAL, GOALS, buildBadges, goalXp, weekProgress, type GoalId } from "@/lib/student/goals";
import type { StudentSummary } from "@/lib/student/insights";

const KEY = "pna-weekly-goal";

/** My PNA: the weekly XP goal (Monday to Sunday, chosen by the student, kept in this browser) and the badges earned so far. */
export function GoalsPanel({ summary, today }: { summary: StudentSummary; today: string }) {
  const [goal, setGoal] = useState<GoalId>(DEFAULT_GOAL);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && GOALS.some((g) => g.id === saved)) setGoal(saved as GoalId);
    } catch {
      /* private mode: the default goal is used */
    }
  }, []);
  const pick = (id: GoalId) => {
    setGoal(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* not saved, still shown */
    }
  };
  const week = weekProgress(summary, today, goalXp(goal));
  const badges = buildBadges(summary, today);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <>
      <section className="mp-panel" aria-labelledby="mp-goal">
        <h2 id="mp-goal"><Target className="h-4 w-4" aria-hidden="true" /> This week’s goal</h2>
        <div className="mp-goal-pick" role="group" aria-label="Choose a weekly goal">
          {GOALS.map((g) => (
            <button key={g.id} type="button" aria-pressed={goal === g.id} onClick={() => pick(g.id)} className="mp-goal-chip">
              <strong>{g.label}</strong>
              <span>{g.xp} XP · {g.note}</span>
            </button>
          ))}
        </div>
        <div className="mp-goal-bar" role="progressbar" aria-valuemin={0} aria-valuemax={week.goal} aria-valuenow={Math.min(week.xp, week.goal)} aria-label="XP this week" data-done={week.achieved}>
          <i style={{ width: `${week.percent}%` }} />
        </div>
        <p className="mp-goal-line">{week.achieved ? <><strong>{week.xp}</strong> XP this week (goal {week.goal})</> : <><strong>{week.xp}</strong> of {week.goal} XP this week</>}</p>
        {week.achieved ? (
          <p className="mp-note">Goal reached. Anything more this week is a bonus.</p>
        ) : (
          <p className="mp-note">{week.left} XP to go, {week.daysLeft} {week.daysLeft === 1 ? "day" : "days"} left (the week ends on Sunday), about {week.perDay} XP a day.</p>
        )}
        {!week.achieved ? <a className="mp-goal-cta" href="/learn">Open PNA Teacher <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></a> : null}
      </section>

      <section className="mp-panel" aria-labelledby="mp-badges">
        <h2 id="mp-badges"><Award className="h-4 w-4" aria-hidden="true" /> Badges <small className="mp-badge-count">{earned} of {badges.length}</small></h2>
        <ul className="mp-badges">
          {badges.map((b) => (
            <li key={b.id} data-earned={b.earned}>
              <span className="mp-badge-ico" aria-hidden="true">{b.earned ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}</span>
              <div>
                <strong>{b.name}</strong>
                <small>{b.earned ? b.text : b.progress}</small>
              </div>
              <span className="sr-only">{b.earned ? "Earned" : "Not earned yet"}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
