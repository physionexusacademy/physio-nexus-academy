import fs from "node:fs";
import assert from "node:assert/strict";

// The PNA academy lobby (homepage). Guards the decisions behind it: the four
// approved pathways with their supplied photos, the founder's approved portrait,
// every original destination reachable, the Daily Challenge flagship, the CPD
// identity, an accessible search, WhatsApp and the mobile dock.
const read=(path)=>fs.readFileSync(path,"utf8");
const home=read("src/app/page.tsx");
const hero=read("src/components/home/LobbyHero.tsx");
const search=read("src/components/home/LobbySearch.tsx");
const pass=read("src/components/home/StudentPass.tsx");
const browser=read("src/components/home/PremiumPathwayBrowser.tsx");
const artwork=read("src/components/home/PnaPathwayArtwork.tsx");
const lobbyCss=read("src/app/home-lobby.css");
const nexusCss=read("src/app/nexus.css");
const challengeCss=read("src/app/daily-challenge/daily-challenge.css");
const header=read("src/components/Header.tsx");
const palette=read("src/components/nexus/CommandPalette.tsx");
const mobile=read("src/components/MobilePortalNav.tsx");
const whatsapp=read("src/components/WhatsAppButton.tsx");
const directory=read("src/components/home/HomeDirectory.tsx");
const booksRow=read("src/components/home/HomeBooks.tsx");
const bookIds=[...read("src/lib/books.ts").matchAll(/^\s+id: "([a-z0-9-]+)",/gm)].map(match=>match[1]);

const portraitPath="public/images/pna-founder-hero-sharp-v2.avif";
const portrait=fs.readFileSync(portraitPath);
const founderJpg=fs.readFileSync("public/images/founder-dr-sajjad.jpg");
const jpgSize=(()=>{for(let i=2;i<founderJpg.length;){if(founderJpg[i]!==0xff)break;const m=founderJpg[i+1];const len=founderJpg.readUInt16BE(i+2);if(m>=0xc0&&m<=0xc3)return{h:founderJpg.readUInt16BE(i+5),w:founderJpg.readUInt16BE(i+7)};i+=2+len;}return null;})();
const hrefs=[...browser.matchAll(/href:\s*"(\/[a-z0-9/-]+)"/g)].map(match=>match[1]);
const mandatoryPaths=[
  "/learn","/knowledge-hub","/clinical-visual-atlas","/manual-therapy","/treatment-plans",
  "/resources","/clinical-arena","/case-lab","/daily-challenge",
  "/workshops","/research","/training","/faculty","/symptom-checker",
  "/patient-services","/verify","/appointment","/home-visit"
];
const zones=[
  "I’m a Student","I’m a Physiotherapist",
  "Workshops & Professional Growth","I Need Physiotherapy"
];
const tests={
  academyLobbyStructure:home.includes("<LobbyHero")&&home.includes("<StudentPass />")&&home.includes('<PremiumPathwayBrowser showAtlas={atlasPublished} />')&&home.includes("<MeetPnaTeacher />"),
  lobbyOrder:home.indexOf("<LobbyHero")<home.indexOf("<StudentPass />")&&home.indexOf("<StudentPass />")<home.indexOf("<PremiumPathwayBrowser")&&home.indexOf("<PremiumPathwayBrowser")<home.indexOf('data-pna-home-flagship="daily-clinical-challenge-v2"'),
  noDuplicatedFeatureWall:!home.includes("portalActions.map")&&!home.includes("portalGroups.map")&&!home.includes("pna-home-zones"),
  allOriginalPathsPreserved:mandatoryPaths.every(url=>hrefs.includes(url)),
  retiredWeeklyQuizGone:!hrefs.includes("/clinical-quiz")&&!home.includes("/clinical-quiz"),
  fourInteractivePathways:zones.every(label=>browser.includes(label))&&browser.includes("setSelected")&&browser.includes("aria-pressed="),
  suppliedPathwayPhotosUncropped:browser.includes("/images/pathway-backgrounds/")&&lobbyCss.includes("aspect-ratio: 754 / 498")&&lobbyCss.includes("object-fit: contain"),
  conditionalAtlas:browser.includes('showAtlas || link.href !== "/clinical-visual-atlas"'),
  portraitExistsAndValid:portrait.length>20000&&portrait.toString("latin1",4,8)==="ftyp"&&portrait.includes(Buffer.from("avif")),
  approvedHeroImageUsed:hero.includes('src="/images/founder-dr-sajjad.jpg"')&&hero.includes("priority")&&hero.includes("pna-hero-photo"),
  portraitNotDistorted:jpgSize&&jpgSize.w*5===jpgSize.h*4&&lobbyCss.includes("aspect-ratio: 4 / 5"),
  brandPreserved:header.includes('src="/images/pna-logo.png"')&&hero.includes("Physio Nexus"),
  originalFounderPagesUnaffected:read("src/lib/site-config.ts").includes('photo: "/images/founder-dr-sajjad.jpg"'),
  maleOnlyClinicalArt:artwork.includes("male patient")&&artwork.includes('kind==="care"'),
  existingProfessionalLearning:home.includes("const supabase = createPublicClient()")&&home.includes('.from("workshops")')&&home.includes("knowledgeArticles")&&home.includes("featuredWorkshops = workshopRows?.length ? workshopRows : null")&&home.includes("featuredWorkshops.map("),
  premiumChallengeKept:home.includes('<DailyLeaderboard compact title="Today\'s Top 5"')&&(home.includes("<DailyChallengeCountdown/>")||home.includes("<DailyChallengeCountdown />"))&&challengeCss.includes(".dc-flagship-countdown"),
  patientRoutesUnchanged:browser.includes('href: "/symptom-checker"')&&browser.includes('href: "/appointment"')&&browser.includes('href: "/home-visit"'),
  existingCpdIdentityRetained:hero.includes("Approved CPD Provider")&&hero.includes("791052"),
  studentPassIsPrivate:pass.includes("saved privately on this device")&&!pass.includes("fetch("),
  mobileNavPreserved:header.includes('aria-label="Mobile navigation"')&&header.includes("<InstallApp />")&&mobile.includes('label: "Challenge"'),
  commandPaletteEverywhere:header.includes("<CommandPalette")&&palette.includes('aria-modal="true"')&&palette.includes("pna-ai:ask"),
  whatsappStillAccessible:whatsapp.includes("Chat with Physio Nexus Academy on WhatsApp")&&lobbyCss.includes("bottom: calc(112px"),
  motionRespect:lobbyCss.includes("prefers-reduced-motion")&&nexusCss.includes("prefers-reduced-motion"),
  responsiveHero:lobbyCss.includes("max-width: 560px")&&lobbyCss.includes("max-width: 900px"),
  featureSearchKept:search.includes('role="search"')&&search.includes("results.map("),
  // A plain-language directory straight after the hero: patients and learners find everything in one tap.
  startHereDirectory:home.indexOf("<HomeDirectory />")>home.indexOf("<LobbyHero")&&home.indexOf("<HomeDirectory />")<home.indexOf("<StudentPass />")&&["/appointment","/home-visit","/symptom-checker","/learn","/skills","/virtual-patient","/workshops","/treatment-plans"].every(url=>directory.includes(`href: "${url}"`)),
  // Every book in the catalogue shows on the homepage, three across, with a small cover thumbnail.
  booksRowOnHome:home.includes("<HomeBooks />")&&booksRow.includes("BOOKS.map(")&&lobbyCss.includes("grid-template-columns: repeat(3, minmax(0, 1fr))")&&bookIds.length>=3&&bookIds.every(id=>fs.existsSync(`public/images/books/thumbs/${id}.webp`))
};
for(const [name,okay] of Object.entries(tests)){
  assert(okay,"PNA homepage validation failed: "+name);
  console.log("PASS: "+name);
}
console.log("PASS: "+Object.keys(tests).length+" academy lobby checks");
