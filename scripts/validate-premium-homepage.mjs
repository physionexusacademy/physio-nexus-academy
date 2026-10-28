import fs from "node:fs";
import assert from "node:assert/strict";

const read=(path)=>fs.readFileSync(path,"utf8");
const home=read("src/app/page.tsx");
const hero=read("src/components/home/PremiumHomeHero.tsx");
const browser=read("src/components/home/PremiumPathwayBrowser.tsx");
const artwork=read("src/components/home/PnaPathwayArtwork.tsx");
const visualCss=read("src/app/premium-vision.css");
const signatureCss=read("src/app/pna-signature-v2.css");
const challengeCss=read("src/app/daily-challenge/daily-challenge.css");
const header=read("src/components/Header.tsx");
const mobile=read("src/components/MobilePortalNav.tsx");
const whatsapp=read("src/components/WhatsAppButton.tsx");

const portraitPath="public/images/pna-founder-hero-sharp-v2.avif";
const portrait=fs.readFileSync(portraitPath);
const hrefs=[...browser.matchAll(/href:\s*"(\/[a-z0-9/-]+)"/g)].map(match=>match[1]);
const mandatoryPaths=[
  "/knowledge-hub","/clinical-visual-atlas","/manual-therapy","/treatment-plans",
  "/resources","/clinical-arena","/case-lab","/daily-challenge","/clinical-quiz",
  "/workshops","/research","/training","/faculty","/symptom-checker",
  "/patient-services","/verify","/appointment","/home-visit"
];
const zones=[
  "I’m a Student","I’m a Physiotherapist",
  "Workshops & Professional Growth","I Need Physiotherapy"
];
const tests={
  signatureLandingRetained:home.includes("<PremiumHomeHero />")&&home.includes('<PremiumPathwayBrowser showAtlas={atlasPublished} />'),
  semanticHomepage:home.includes("pna-home-lower")&&home.includes('data-pna-home-flagship="daily-clinical-challenge-v2"'),
  noDuplicatedFeatureWall:!home.includes("portalActions.map")&&!home.includes("portalGroups.map")&&!home.includes("pna-home-zones"),
  allOriginalPathsPreserved:mandatoryPaths.every(url=>hrefs.includes(url)),
  fourInteractivePathways:zones.every(label=>browser.includes(label))&&browser.includes("setSelected")&&browser.includes("aria-pressed="),
  conditionalAtlas:browser.includes('showAtlas || link.href !== "/clinical-visual-atlas"'),
  portraitExistsAndValid:portrait.length>20000&&portrait.toString("latin1",4,8)==="ftyp"&&portrait.includes(Buffer.from("avif")),
  approvedHeroImageUsed:hero.includes('src="/images/founder-dr-sajjad.jpg"')&&hero.includes("priority")&&hero.includes("pna-hero-photo"),
  noBoxedPortrait:signatureCss.includes("mask-image:none!important")&&signatureCss.includes("object-fit:contain!important"),
  brandPreserved:header.includes('src="/images/pna-logo.png"')&&hero.includes("Physio Nexus"),
  originalFounderPagesUnaffected:read("src/lib/site-config.ts").includes('photo: "/images/founder-dr-sajjad.jpg"'),
  maleOnlyClinicalArt:artwork.includes("male patient")&&artwork.includes('kind==="care"'),
  existingProfessionalLearning:home.includes("featuredWorkshops.map")&&home.includes("latestArticles.map")&&home.includes("featuredFaculty.map"),
  premiumChallengeKept:home.includes('<DailyLeaderboard compact title="Today\'s Top 5"')&&(home.includes("<DailyChallengeCountdown/>")||home.includes("<DailyChallengeCountdown />"))&&challengeCss.includes(".dc-flagship-stage"),
  patientRoutesUnchanged:home.includes('href="/symptom-checker"')&&home.includes('href="/appointment"')&&home.includes('href="/home-visit"'),
  existingCpdIdentityRetained:home.includes("Approved CPD Provider")&&home.includes("791052"),
  mobileNavPreserved:header.includes("mainNav.filter")&&mobile.includes('label: "Challenge"'),
  whatsappStillAccessible:whatsapp.includes("Chat with Physio Nexus Academy on WhatsApp")&&signatureCss.includes("bottom:calc(80px"),
  motionRespect:signatureCss.includes("prefers-reduced-motion"),
  responsiveHero:[visualCss,signatureCss].join("").includes("max-width:440px")&&signatureCss.includes("max-width:720px"),
  featureSearchKept:hero.includes("role=\"search\"")&&hero.includes("results.map(")
};
for(const [name,okay] of Object.entries(tests)){
  assert(okay,"PNA homepage validation failed: "+name);
  console.log("PASS: "+name);
}
console.log("PASS: "+Object.keys(tests).length+" signature homepage checks");
