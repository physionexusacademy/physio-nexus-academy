import fs from "node:fs";
import assert from "node:assert/strict";
const read=(path)=>fs.readFileSync(path,"utf8");
const data=read("src/lib/daily-challenge.ts");
const actions=read("src/app/daily-challenge/actions.ts");
const service=read("src/lib/daily-challenge-service.ts");
const startEndpoint=read("src/app/api/daily-challenge/start/route.ts");
const submitEndpoint=read("src/app/api/daily-challenge/submit/route.ts");
const statusEndpoint=read("src/app/api/daily-challenge/status/route.ts");
const serverPermissions=read("supabase/migrations/20261009_fix_daily_challenge_service_permissions.sql");
const api=read("src/app/api/daily-challenge/leaderboard/route.ts");
const page=read("src/app/daily-challenge/page.tsx");
const quiz=read("src/app/daily-challenge/DailyChallengeClient.tsx");
const board=read("src/components/daily-challenge/DailyLeaderboard.tsx");
const css=read("src/app/daily-challenge/daily-challenge.css");
const home=read("src/app/page.tsx");
const pathwayBrowser=read("src/components/home/PremiumPathwayBrowser.tsx");
const hub=read("src/app/knowledge-hub/page.tsx");
const migration=read("supabase/migrations/20261009_pna_daily_challenge.sql");
const nav=read("src/lib/site-config.ts");
const mobile=read("src/components/MobilePortalNav.tsx");
const desktop=read("src/components/Header.tsx");
const countdown=read("src/components/daily-challenge/DailyChallengeCountdown.tsx");
const questions=[...data.matchAll(/\{id:"([^"]+)",topic:"([^"]+)",question:"/g)];
const ids=new Set(questions.map(m=>m[1]));
const tests={
  thirtyUniqueQuestions:questions.length===30&&ids.size===30,
  fiveRotatingQuestions:data.includes("Array.from({length:5}"),
  exactlyKarachiTimezone:data.includes('timeZone:"Asia/Karachi"')&&data.includes("formatToParts(now)"),
  midnightCalculatedInUTC:data.includes("date+\"T00:00:00Z\"")&&data.includes("19*3600000"),
  noAnswerKeyInPublicPayload:data.includes("publicDailyQuestions(date:string)")&&!data.slice(data.indexOf("export function publicDailyQuestions"),data.indexOf("export function pakistanMidnightUTC")).includes("correct:"),
  serverOwnedScore:service.includes("correctCount*20")&&service.includes("questions.reduce"),
  oneAttemptEveryDay:migration.includes("unique (challenge_date, email_key)"),
  databaseRls:migration.includes("enable row level security")&&migration.includes("revoke all on public.daily_challenge_attempts from anon, authenticated"),
  noPublicEmailInApi:!api.includes("email_key")&&!api.includes("select(\"email")&&api.includes("name:String(r.display_name)"),
  scoresSafelyAggregated:migration.includes("sum(a.score)::bigint")&&migration.includes("count(*)::bigint")&&migration.includes("p_period in ('today','month','year')"),
  oldScoresNotCleared:!migration.includes("truncate table")&&!migration.includes("delete from"),
  serverMidnightDeadline:actions.includes("time>=midnight")&&actions.includes("Today's challenge is closing"),
  publicPager:board.includes('Next</button>')&&board.includes('Previous</button>'),
  topFive:board.includes("compact||preview?5:30")&&home.includes("<DailyLeaderboard compact"),
  allRankings:board.includes('"month"')&&board.includes('"year"')&&board.includes('"today"'),
  monthAndYearChampions:board.includes('initialPeriod="month"')&&board.includes('initialPeriod="year"'),
  archiveArrows:board.includes("changeAnchor")&&board.includes("onClick={()=>shift(-1)}"),
  liveRefresh:board.includes("45000"),
  quizScoring:quiz.includes('dailyRequest<Completed>("submit"')&&quiz.includes("30"),
  completedExplanations:quiz.includes("Review all answers")&&quiz.includes("explanations.find"),
  quizMidnightUnlock:quiz.includes("today!==active.date&&result"),
  refreshSafeResume:quiz.includes("pna-daily-running-v1")&&quiz.includes("setDeadline(time)")&&quiz.includes("sessionStorage.removeItem"),
  premiumCss:css.includes(".dc-mission-mast")&&css.includes(".dc-table"),
  responsive:css.includes("@media(max-width:480px)"),
  landingLinked:pathwayBrowser.includes('href: "/daily-challenge"')&&hub.includes('href="/daily-challenge"'),
  noIdentityOverclaim:quiz.includes("Email ownership is not verified"),
  noGeneratedFakeRanks:!board.includes("Demo Participant"),
  challengeMarker:quiz.includes('data-pna-daily-challenge="v1"'),
  homepageFlagshipAccessible:home.includes('data-pna-home-flagship="daily-clinical-challenge-v2"') && home.includes("<PremiumHomeHero />") && home.indexOf("<PremiumHomeHero />") < home.indexOf('data-pna-home-flagship'),
  flagshipSingleHero:(home.match(/data-pna-home-flagship/g)||[]).length===1 && (home.match(/<DailyLeaderboard compact/g)||[]).length===1,
  flagshipActivePlay:home.includes('href="/daily-challenge#play-daily"'),
  flagshipLiveBoard:home.includes('title="Today\'s Top 5"') && home.includes("DailyChallengeCountdown"),
  topLevelNav:nav.includes('label: "Daily Challenge", href: "/daily-challenge"') && !nav.includes('label: "MSK Hub", href: "/msk-injuries"'),
  mobileChallengeShortcut:mobile.includes('label: "Challenge", href: "/daily-challenge"'),
  desktopChallengeHighlight:desktop.includes('item.href === "/daily-challenge"') && desktop.includes('bg-teal-700'),
  midnightCounter:countdown.includes('timeZone: "Asia/Karachi"') && countdown.includes('Date.UTC('),
  retainedKnowledgeSections:home.includes('href="/symptom-checker"') && home.includes('href="/case-lab"') && pathwayBrowser.includes('href: "/knowledge-hub"') && pathwayBrowser.includes('href: "/symptom-checker"') && pathwayBrowser.includes('href: "/case-lab"'),
  themedResponsiveFlagship:css.includes(".dc-flagship-stage") && css.includes("@media(max-width:560px)"),
  stableApiStart:quiz.includes('dailyRequest<StartResponse>("start"') && startEndpoint.includes('startDailyChallenge('),
  stableApiSubmit:quiz.includes('dailyRequest<Completed>("submit"') && submitEndpoint.includes('submitDailyChallenge('),
  appNoActionBinding:!quiz.includes('from "./actions"'),
  privateApiOrigins:startEndpoint.includes('Invalid request origin.') && submitEndpoint.includes('Invalid request origin.'),
  apiErrorHandling:startEndpoint.includes("START_SERVICE_ERROR") && submitEndpoint.includes("SUBMIT_SERVICE_ERROR"),
  serviceOnlySecrets:service.includes('import "server-only"') && !quiz.includes("SUPABASE_SERVICE_ROLE_KEY"),
  healthRoute:statusEndpoint.includes('select("id").limit(0)') && statusEndpoint.includes('code:"CONFIG_UNAVAILABLE"'),
  permissionsFixed:serverPermissions.includes("grant select, insert, update on table public.daily_challenge_attempts to service_role") &&
   serverPermissions.includes("revoke all on table public.daily_challenge_attempts from anon, authenticated")
};
for(const [name,ok] of Object.entries(tests)){
 assert(ok,"Daily Challenge check failed: "+name);
 console.log("✓ "+name);
}
console.log("PASS: "+Object.keys(tests).length+" PNA Daily Challenge code-level validations");
