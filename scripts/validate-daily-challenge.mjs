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
const champions=read("src/components/daily-challenge/ChampionBoards.tsx");
const championsCss=read("src/components/daily-challenge/champion-boards.css");
const css=read("src/app/daily-challenge/daily-challenge.css");
const home=read("src/app/page.tsx");
const homeBoard=read("src/components/home/HomeDailyBoard.tsx");
const features=read("src/components/home/HomeFeatures.tsx");
const pathwayBrowser=read("src/components/home/PremiumPathwayBrowser.tsx");
const hub=read("src/app/learn/page.tsx");
const migration=read("supabase/migrations/20261009_pna_daily_challenge.sql");
const nav=read("src/lib/academy-map.ts");
const mobile=read("src/components/MobilePortalNav.tsx");
const desktop=read("src/components/Header.tsx");
const countdown=read("src/components/daily-challenge/DailyChallengeCountdown.tsx");
const poolText=read("src/lib/daily-content/pool.generated.ts");
const pool=JSON.parse(poolText.slice(poolText.indexOf("= [")+2,poolText.lastIndexOf("];")+1));
const lessonQuestions=new Set(fs.readdirSync("public/teacher-data/lessons").flatMap(f=>JSON.parse(fs.readFileSync("public/teacher-data/lessons/"+f,"utf8")).beats.filter(b=>b.type==="check").map(b=>b.question.en.replace(/\*\*/g,"").replace(/\s+/g," ").trim())));
const questions=[...data.matchAll(/\{id:"([^"]+)",topic:"([^"]+)",question:"/g)];
const ids=new Set(questions.map(m=>m[1]));
const tests={
  oneHundredUniqueQuestions:questions.length===100&&ids.size===100,
  dailyPoolFromWholeSite:pool.length>=150&&pool.every(q=>q.href&&q.linkTitle&&q.explanation.length>=20&&q.options.length>=2&&q.options.length<=4&&q.correct>=0&&q.correct<q.options.length&&new Set(q.options).size===q.options.length),
  dailyPoolIsFresh:pool.every(q=>lessonQuestions.has(q.question)),
  poolUsedForSelection:data.includes("generatedDailyPool")&&data.includes("cycleOrder"),
  wrongAnswersLinkToConcept:quiz.includes("Learn this concept")&&quiz.includes("data-pna-daily-gaps")&&service.includes("href:q.href"),
  fiveRotatingQuestions:data.includes("Array.from({length:5}")&&data.includes("day*5"),
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
  topFive:board.includes("compact||preview?5:30")&&champions.includes("const SHORT = 5")&&champions.includes("const LONG = 15"),
  allRankings:board.includes('"month"')&&board.includes('"year"')&&board.includes('"today"'),
  monthAndYearChampions:page.includes("<ChampionBoards")&&!page.includes("DailyHallOfFame")&&['today','month','year'].every(p=>champions.includes('<Board period="'+p+'" />'))&&champions.includes('id="full-leaderboard"')&&championsCss.includes('.cb-board[data-period="month"]')&&championsCss.includes('.cb-board[data-period="year"]'),
  championBoardsLiveAndPlayable:champions.includes("pna-daily-score-saved")&&champions.includes("45000")&&champions.includes('href="#play-daily"')&&page.includes('id="play-daily"'),
  archiveArrows:board.includes("changeAnchor")&&board.includes("onClick={()=>shift(-1)}"),
  liveRefresh:board.includes("45000"),
  quizScoring:quiz.includes('dailyRequest<Completed>("submit"')&&quiz.includes("30"),
  completedExplanations:quiz.includes("Review all answers")&&quiz.includes("explanations.find"),
  quizMidnightUnlock:quiz.includes("today!==active.date&&result"),
  refreshSafeResume:quiz.includes("pna-daily-running-v1")&&quiz.includes("setDeadline(time)")&&quiz.includes("sessionStorage.removeItem"),
  premiumCss:css.includes(".dc-mission-mast")&&css.includes(".dc-table"),
  responsive:css.includes("@media(max-width:480px)"),
  landingLinked:pathwayBrowser.includes('href: "/daily-challenge"')&&hub.includes('href: "/daily-challenge"'),
  noIdentityOverclaim:quiz.includes("Email ownership is not verified"),
  noGeneratedFakeRanks:!board.includes("Demo Participant"),
  challengeMarker:quiz.includes('data-pna-daily-challenge="v1"'),
  homepageFlagshipAccessible:home.includes('data-pna-home-flagship="daily-clinical-challenge-v2"') && home.includes("<LobbyHero") && home.indexOf("<LobbyHero") < home.indexOf('data-pna-home-flagship'),
  flagshipSingleHero:(home.match(/data-pna-home-flagship="daily-clinical-challenge-v2"/g)||[]).length===1 && (home.match(/<HomeDailyBoard/g)||[]).length===1&&!home.includes("<DailyLeaderboard"),
  flagshipActivePlay:home.includes('href="/daily-challenge#play-daily"'),
  flagshipLiveBoard:homeBoard.includes("<HomeTodayBoard")&&homeBoard.includes('data-pna-home-today-board')&&!homeBoard.includes("<details")&&home.includes("DailyChallengeCountdown"),
  homeBoardLoadsLazily:champions.includes("export function HomeTodayBoard")&&champions.includes("lazy")&&champions.includes("IntersectionObserver")&&champions.includes("document.hidden"),
  homeOrderTeacherRehabDaily:home.indexOf("<HomeFeaturesTop")>0&&home.indexOf("<HomeFeaturesTop")<home.indexOf('data-pna-home-flagship="daily-clinical-challenge-v2"')&&home.indexOf('data-pna-home-flagship="daily-clinical-challenge-v2"')<home.indexOf("<HomeFeaturesMore")&&features.indexOf('hx-teacher')<features.indexOf('data-pna-home-feature="rehabverse-v1"')&&features.indexOf('data-pna-home-feature="rehabverse-v1"')<features.indexOf("export function HomeFeaturesMore"),
  topLevelNav:nav.includes('label: "Daily Challenge", href: "/daily-challenge"') && desktop.includes('href="/daily-challenge" className="nx-pill-challenge"'),
  mobileChallengeShortcut:mobile.includes('label: "Challenge", href: "/daily-challenge"'),
  desktopChallengeHighlight:desktop.includes('className="nx-pill-challenge"') && read("src/app/nexus.css").includes(".nx-pill-challenge {"),
  midnightCounter:countdown.includes('timeZone: "Asia/Karachi"') && countdown.includes('Date.UTC('),
  retainedKnowledgeSections:home.includes("<PremiumPathwayBrowser") && ["/conditions","/symptom-checker"].every(url=>pathwayBrowser.includes('href: "'+url+'"')),
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
