import fs from "node:fs";
import assert from "node:assert/strict";
const read=(path)=>fs.readFileSync(path,"utf8");
const home=read("src/app/page.tsx");
const css=read("src/app/home-premium.css");
const dailyCss=read("src/app/daily-challenge/daily-challenge.css");
const header=read("src/components/Header.tsx");
const mobile=read("src/components/MobilePortalNav.tsx");
const whatsapp=read("src/components/WhatsAppButton.tsx");
const portalSource=home.slice(home.indexOf("const portalActions = ["),home.indexOf("] as const;"));
const groupsSource=home.slice(home.indexOf("const portalGroups = ["),home.indexOf("export default async function HomePage"));
const portalUrls=[...portalSource.matchAll(/\bhref:\s*"([^"]+)"/g)].map(m=>m[1]);
const groupedUrls=[...groupsSource.matchAll(/"\/(?:[a-z][a-z0-9-]*)(?:\/[^"]*)?"/g)].map(m=>m[0].slice(1,-1));
const tests={
  noLostPortalFeatures:portalUrls.length>=13&&portalUrls.every(url=>groupedUrls.includes(url)),
  fourClearlyNamedZones:["Knowledge & clinical science","Clinical reasoning & challenges","Workshops & professional growth","Care & trusted services"].every(label=>home.includes(label)),
  oldCardWallRemoved:!home.includes("portalActions.map")&&home.includes("portalActions.filter")&&home.includes("portalGroups.map"),
  noCompetingDarkHero:!home.includes("from-navy-900 via-navy-800 to-teal-800")&&home.includes("pna-home-intro"),
  flagshipAboveAll:home.indexOf('data-pna-home-flagship="daily-clinical-challenge-v2"')<home.indexOf('data-pna-home-premium="cohesive-v1"'),
  flagshipLeaderboardKept:home.includes('<DailyLeaderboard compact title="Today\'s Top 5"')&&home.includes("<DailyChallengeCountdown/>"),
  allMainModulesStillVisible:["Knowledge Hub","Clinical Case Lab","Clinical Challenge Arena","Manual Therapy Mastery","Treatment Plans","Daily Clinical Challenge","Weekly Clinical Quiz","Workshops & CPD","Books & Resources","Research Support","MSK Symptom Checker","Patient Care","Verify Certificate"].every(name=>home.includes('title: "'+name+'"')),
  founderIdentityRetained:home.includes("siteConfig.founder.photo")&&home.includes("siteConfig.founder.name"),
  existingEvidenceAndEvents:home.includes("featuredWorkshops.map")&&home.includes("latestArticles.map")&&home.includes("featuredFaculty.map"),
  cpdRetained:home.includes("Approved CPD Provider")&&home.includes("791052"),
  patientRoutesRetained:home.includes('href="/symptom-checker"')&&home.includes('href="/appointment"')&&home.includes('href="/home-visit"'),
  lightPatientCare:home.includes("pna-home-light-patient")&&css.includes(".pna-home-light-patient"),
  noRepeatedWeeklyBanner:!home.includes("Weekly Clinical Challenge</p>"),
  designSystemPresent:css.includes(".pna-home-zone-link")&&css.includes(".pna-home-founder-card")&&css.includes(".pna-home-journey"),
  explicitMobileLayouts:css.includes("@media(max-width:540px)")&&css.includes("@media(max-width:900px)"),
  accessibleSemanticGrouping:home.includes('aria-labelledby={"pna-zone-heading-" + group.id}')&&home.includes('id={"pna-zone-" + group.id}'),
  signatureLogoUntouched:header.includes('src="/images/pna-logo.png"'),
  mainNavUnbroken:header.includes("mainNav.filter")&&header.includes('<details className="group relative">')&&mobile.includes('label: "Challenge"'),
  mobileWhatsappLessIntrusive:whatsapp.includes("bottom-24 right-3")&&whatsapp.includes("h-12 w-12"),
  reducedMotionRespected:css.includes("prefers-reduced-motion"),
  flagshipCssPreserved:dailyCss.includes(".dc-flagship-stage")&&dailyCss.includes("@media(max-width:560px)"),
  hasProductionMarker:home.includes('data-pna-home-premium="cohesive-v1"'),
};
for(const [key,ok]of Object.entries(tests)){
 assert(ok,"Premium homepage validation failed: "+key);
 console.log("✓ "+key);
}
console.log("PASS: "+Object.keys(tests).length+" PNA premium-homepage validations");
