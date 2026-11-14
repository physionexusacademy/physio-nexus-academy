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
const needHelp=read("src/components/home/HomeNeedHelp.tsx");
const features=read("src/components/home/HomeFeatures.tsx");
const dailyBoard=read("src/components/home/HomeDailyBoard.tsx");
const guide=read("src/components/avatar/GuideMe.tsx");
const guideCss=read("src/components/avatar/guide-me.css");
const learnPage=read("src/app/learn/page.tsx");
const skillsPage=read("src/app/skills/page.tsx");
const flagshipCss=read("src/components/home/home-flagships.css");
const booksRow=read("src/components/home/HomeBooks.tsx");
const bookIds=[...read("src/lib/books.ts").matchAll(/^\s+id: "([a-z0-9-]+)",/gm)].map(match=>match[1]);

const portraitPath="public/images/pna-founder-hero-sharp-v2.avif";
const portrait=fs.readFileSync(portraitPath);
const founderJpg=fs.readFileSync("public/images/founder-dr-sajjad.jpg");
const jpgSize=(()=>{for(let i=2;i<founderJpg.length;){if(founderJpg[i]!==0xff)break;const m=founderJpg[i+1];const len=founderJpg.readUInt16BE(i+2);if(m>=0xc0&&m<=0xc3)return{h:founderJpg.readUInt16BE(i+5),w:founderJpg.readUInt16BE(i+7)};i+=2+len;}return null;})();
const hrefs=[...browser.matchAll(/href:\s*"(\/[a-z0-9/-]+)"/g)].map(match=>match[1]);
const mandatoryPaths=[
  "/learn","/conditions","/clinical-visual-atlas","/manual-therapy",
  "/resources","/case-lab","/daily-challenge",
  "/workshops","/research","/training","/faculty","/symptom-checker",
  "/patient-services","/verify","/appointment","/home-visit"
];
const zones=[
  "I’m a Student","I’m a Physiotherapist",
  "Workshops & Professional Growth","I Need Physiotherapy"
];
const tests={
  academyLobbyStructure:home.includes("<LobbyHero")&&home.includes("<HomeNeedHelp />")&&home.includes("<HomeFeatures />")&&home.includes("<StudentPass />")&&home.includes('<PremiumPathwayBrowser showAtlas={atlasPublished} />'),
  lobbyOrder:(()=>{const at=(needle)=>home.indexOf(needle);const flagship=at('data-pna-home-flagship="daily-clinical-challenge-v2"');const order=[at("<LobbyHero"),at("<HomeNeedHelp />"),at("<GuideMe />"),at("<HomeBodyMap"),at("<HomeFeatures />"),flagship,at("<HomeBooks />"),at("<StudentPass />"),at("<PremiumPathwayBrowser")];return order.every((position,index)=>position>=0&&(index===0||position>order[index-1]));})(),
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
  existingProfessionalLearning:home.includes("<HomeTestimonials />")&&read("src/components/home/HomeTestimonials.tsx").includes("/rest/v1/testimonials")&&read("src/components/home/HomeTestimonials.tsx").includes("status=eq.published")&&home.includes("<HomeBooks />"),
  // The homepage is a prebuilt static page (instant from the edge), not rendered on every visit.
  homepageIsStatic:!home.includes('export const dynamic = "force-dynamic"')&&!home.includes("createPublicClient")&&!home.includes("async function HomePage"),
  premiumChallengeKept:dailyBoard.includes('<DailyLeaderboard compact title="Today\'s Top 5"')&&home.includes("<HomeDailyBoard />")&&(home.includes("<DailyChallengeCountdown/>")||home.includes("<DailyChallengeCountdown />"))&&challengeCss.includes(".dc-flagship-countdown"),
  patientRoutesUnchanged:browser.includes('href: "/symptom-checker"')&&browser.includes('href: "/appointment"')&&browser.includes('href: "/home-visit"'),
  existingCpdIdentityRetained:header.includes("CPD Provider · #791052")&&!hero.includes("lobby-stats"),
  studentPassIsPrivate:pass.includes("saved privately on this device")&&!pass.includes("fetch("),
  mobileNavPreserved:header.includes('aria-label="Mobile navigation"')&&header.includes("<InstallApp />")&&mobile.includes('label: "Challenge"'),
  commandPaletteEverywhere:header.includes("<CommandPalette")&&palette.includes('aria-modal="true"')&&palette.includes("pna-ai:ask"),
  whatsappStillAccessible:whatsapp.includes("Chat with Physio Nexus Academy on WhatsApp")&&lobbyCss.includes("bottom: calc(112px"),
  motionRespect:lobbyCss.includes("prefers-reduced-motion")&&nexusCss.includes("prefers-reduced-motion"),
  responsiveHero:lobbyCss.includes("max-width: 560px")&&lobbyCss.includes("max-width: 900px"),
  featureSearchKept:search.includes('role="search"')&&search.includes("results.map("),
  // Patients find care in one strip right under the hero.
  patientStrip:home.indexOf("<HomeNeedHelp />")>home.indexOf("<LobbyHero")&&["/appointment","/home-visit","/symptom-checker","/rehabverse"].every(url=>needHelp.includes(`href: "${url}"`))&&needHelp.includes("whatsappLink("),
  // The highlighted features: three dark cards and RehabVerse in the grid; Manual Therapy stays one link away; the Daily Challenge and the books have their own dark sections.
  highlightedFeatures:["/learn","/skills","/virtual-patient","/rehabverse/register","/manual-therapy"].every(url=>features.includes(`href="${url}`))&&features.includes('data-pna-home-feature="rehabverse-v1"')&&features.includes("Guided rehab at home")&&features.includes("Create your account")&&features.includes("I already have an account")&&home.includes('href="/daily-challenge#play-daily"')&&booksRow.includes('href="/resources"'),
  // The three big white boxes (Manual Therapy, Daily Clinical Challenge, Books & Resources) are gone from the homepage.
  noBigWhiteBoxes:!features.includes("hf-mt")&&!features.includes("hf-daily")&&!features.includes("hf-books")&&!features.includes("pathway-features/daily-challenge")&&!features.includes("pathway-features/books-resources")&&!features.includes("pathway-features/manual-therapy"),
  // The Daily Clinical Challenge stays on the site and is a dark, glowing panel (five-question track) on the homepage.
  dailyChallengeFuturistic:home.includes('className="hdc-card nx-sky nx-grid"')&&home.includes("hdc-track")&&flagshipCss.includes(".hdc-track")&&flagshipCss.includes("hdc-scan")&&flagshipCss.includes("prefers-reduced-motion"),
  // Dr. Sajjad's guide lives on the homepage (the 3D tour loads only when started), not on the Teacher / Skills Lab pages.
  guideOnHome:home.includes('import { GuideMe } from "@/components/avatar/GuideMe"')&&guide.includes("data-guide-me")&&guide.includes("ssr: false")&&guide.includes('demoKey="avatar/site-tour"')&&guide.includes("loading=\"lazy\"")&&guideCss.includes(".gm-card")&&!learnPage.includes("GuideMe")&&!skillsPage.includes("GuideMe")&&fs.existsSync("public/teacher/dr-sajjad-poster.webp")&&fs.statSync("public/teacher/dr-sajjad-poster.webp").size<60000,
  // Every book in the catalogue shows on the homepage, three across, with a small cover thumbnail.
  // The page stays short: no stats strip in the hero, no news block, the Registry sits in the physiotherapist pathway, Student Pass is one button.
  calmerHome:!hero.includes("lobby-stats")&&!home.includes("lobby-news")&&!home.includes("clinical-registry-v1")&&browser.includes('data-pna-home-feature="clinical-registry-v1"')&&pass.includes("aria-expanded={open}")&&dailyBoard.includes('className="hdc-board"'),
  booksRowOnHome:home.includes("<HomeBooks />")&&booksRow.includes("BOOKS.slice(0, HOME_BOOK_COUNT).map(")&&booksRow.includes("const HOME_BOOK_COUNT = 3;")&&lobbyCss.includes("grid-template-columns: repeat(3, minmax(0, 1fr))")&&bookIds.length>=3&&bookIds.every(id=>fs.existsSync(`public/images/books/thumbs/${id}.webp`))
};
for(const [name,okay] of Object.entries(tests)){
  assert(okay,"PNA homepage validation failed: "+name);
  console.log("PASS: "+name);
}
console.log("PASS: "+Object.keys(tests).length+" academy lobby checks");
