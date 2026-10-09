import fs from "node:fs";
import assert from "node:assert/strict";
const read=(path)=>fs.readFileSync(path,"utf8");
const data=read("src/lib/daily-challenge.ts");
const actions=read("src/app/daily-challenge/actions.ts");
const api=read("src/app/api/daily-challenge/leaderboard/route.ts");
const page=read("src/app/daily-challenge/page.tsx");
const quiz=read("src/app/daily-challenge/DailyChallengeClient.tsx");
const board=read("src/components/daily-challenge/DailyLeaderboard.tsx");
const css=read("src/app/daily-challenge/daily-challenge.css");
const home=read("src/app/page.tsx");
const hub=read("src/app/knowledge-hub/page.tsx");
const migration=read("supabase/migrations/20261009_pna_daily_challenge.sql");
const questions=[...data.matchAll(/\{id:"([^"]+)",topic:"([^"]+)",question:"/g)];
const ids=new Set(questions.map(m=>m[1]));
const tests={
  thirtyUniqueQuestions:questions.length===30&&ids.size===30,
  fiveRotatingQuestions:data.includes("Array.from({length:5}"),
  exactlyKarachiTimezone:data.includes('timeZone:"Asia/Karachi"')&&data.includes("formatToParts(now)"),
  midnightCalculatedInUTC:data.includes("date+\"T00:00:00Z\"")&&data.includes("19*3600000"),
  noAnswerKeyInPublicPayload:data.includes("publicDailyQuestions(date:string)")&&!data.slice(data.indexOf("export function publicDailyQuestions"),data.indexOf("export function pakistanMidnightUTC")).includes("correct:"),
  serverOwnedScore:actions.includes("correctCount*20")&&actions.includes("questions.reduce"),
  oneAttemptEveryDay:migration.includes("unique (challenge_date, email_key)"),
  databaseRls:migration.includes("enable row level security")&&migration.includes("revoke all on public.daily_challenge_attempts from anon, authenticated"),
  noPublicEmailInApi:!api.includes("email_key")&&!api.includes("select(\"email")&&api.includes("name:String(r.display_name)"),
  scoresSafelyAggregated:migration.includes("sum(a.score)::bigint")&&migration.includes("count(*)::bigint")&&migration.includes("p_period in ('today','month','year')"),
  oldScoresNotCleared:!migration.includes("truncate table")&&!migration.includes("delete from"),
  serverMidnightDeadline:actions.includes("time>=midnight")&&actions.includes("Today's challenge is closing"),
  publicPager:board.includes('Next</button>')&&board.includes('Previous</button>'),
  topFive:board.includes("compact?5:30")&&home.includes("<DailyLeaderboard compact"),
  allRankings:board.includes('"month"')&&board.includes('"year"')&&board.includes('"today"'),
  monthAndYearChampions:board.includes('initialPeriod="month"')&&board.includes('initialPeriod="year"'),
  archiveArrows:board.includes("changeAnchor")&&board.includes("onClick={()=>shift(-1)}"),
  liveRefresh:board.includes("45000"),
  quizScoring:quiz.includes("submitDailyChallenge")&&quiz.includes("30"),
  completedExplanations:quiz.includes("Review all answers")&&quiz.includes("explanations.find"),
  quizMidnightUnlock:quiz.includes("today!==active.date&&result"),
  premiumCss:css.includes(".dc-mission-mast")&&css.includes(".dc-table"),
  responsive:css.includes("@media(max-width:480px)"),
  landingLinked:home.includes('href: "/daily-challenge"')&&hub.includes('href="/daily-challenge"'),
  noIdentityOverclaim:quiz.includes("Email ownership is not verified"),
  noGeneratedFakeRanks:!board.includes("Demo Participant"),
  challengeMarker:quiz.includes('data-pna-daily-challenge="v1"')
};
for(const [name,ok] of Object.entries(tests)){
 assert(ok,"Daily Challenge check failed: "+name);
 console.log("✓ "+name);
}
console.log("PASS: "+Object.keys(tests).length+" PNA Daily Challenge code-level validations");
