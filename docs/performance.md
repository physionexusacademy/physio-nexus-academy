# Speed: how the site stays fast

The goal is a site that opens instantly and stays easy to use, without removing a feature. These are the rules the homepage and the
shared shell follow, and why. Measure before and after any change (`lighthouse` mobile preset against production; numbers below).

## What is static, what is dynamic

| Page | How it is served | Why |
|------|------------------|-----|
| `/` (homepage), `/learn`, `/skills`, `/conditions`, the lessons, atlases … | **Prebuilt (static)**: served from Cloudflare's edge from the static-assets cache, no rendering per visit (`x-opennext-cache: HIT`, about 0.1–0.3 s) | Nothing on them is private or per-visitor |
| `/resources`, `/workshops`, `/faq`, `/about`, `/founder`, `/training`, `/daily-challenge` | Rendered by the Worker, **plus an edge copy** (`custom-worker.ts`): fresh for 5 minutes, then served instantly while a new copy is made in the background (up to one hour old) | They show content the admin edits in the database. A page the admin just edited shows the change within about 5 minutes |
| Admin, RehabVerse patient pages, clinical registry, APIs | Rendered per request, never cached | Private data |

The homepage used to be `force-dynamic` only to read the published testimonials. That made every first visit wait for the Worker to
start, query the database and render (1.2–1.9 s before the first byte; half of the mobile "largest paint" time). It is now static; the
testimonials load in the browser (`HomeTestimonials`, only when scrolled near, nothing is shown when none are published) and the
leaderboard loads only when its fold is opened (`HomeDailyBoard`). **Opening the homepage makes no database call.**

## Rules for the homepage and other long pages

1. **Below the fold costs nothing until near**: the long sections use `content-visibility: auto` with a `contain-intrinsic-size`
   (see the end of `src/app/home-lobby.css`). The browser skips styling, layout and painting (and any animation) for what is off screen.
2. **Animations run on the GPU**: only `transform` and `opacity` (a glow pulse is an opacity animation of a pseudo-element, a scan line is a
   `translateY`), never `top`, `box-shadow` or `background-position`. Everything is switched off for `prefers-reduced-motion`.
3. **3D, AI and voice load on intent**: the "Guide me" card on the homepage is a picture and a button; the 3D stage (three.js, the model,
   textures) is requested only after Start, and a hover/focus/touch on the button warms the code. The AI chat is the same (`PhysioNexusAILauncher`).
4. **No request on load that is not needed** (the homepage makes zero API calls).
5. **Worker size is the cold-start cost**: stay under 3072 KiB gzip (`docs/worker-size.md`). The static homepage made it slightly smaller.

## Measured on production (Lighthouse, same method before and after, 14 Nov 2026)

| Homepage | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| Performance score | 84 | **92** | 99 | 99 |
| Server response (Lighthouse lab) | 1,190 ms | **520 ms** | 680 ms | 420 ms |
| Total blocking time | 350 ms | **80 ms** | 20 ms | **0 ms** |
| Main-thread work | 5.1 s | **2.1 s** | 0.9 s | 0.9 s |
| Script boot-up | 1.0 s | **0.5 s** | 0.2 s | 0.1 s |
| Requests that are API calls | 1 (leaderboard) | **0** | 1 | **0** |

Real first byte from `curl` after the change: about 0.2 s (`x-opennext-cache: HIT`). Largest contentful paint is the founder photo (24 KB, already
prioritised) and is unchanged at about 3 s on the throttled mobile profile; it is dominated by the simulated network, not by the server.

## The hero: animated welcome and feature slideshow

The top of the homepage (`src/components/home/LobbyHero.tsx`) is an animated "Welcome to Physio Nexus Academy" beside a slideshow of what the academy offers.
It was designed to cost almost nothing:

- **The heading is plain text** (one `<h1>`, the full sentence is its `aria-label`). The letters rise into place one after another with CSS animations only
  (`.hw-ch`, `--i` sets each letter's delay), so nothing waits for JavaScript and search engines read normal text. The brand gradient is a colour per letter, not
  `background-clip`, so the letters can move freely. A light beam passes over the heading every few seconds; the tagline "types" in once.
- **The slideshow has no images.** `HeroSlideshow.tsx` (a client component, the only JavaScript in the hero) shows one card per feature; each card's small
  "screen" is markup and SVG from `HeroScenes.tsx`, rendered on the server. The first card is in the HTML, so the page is complete before script runs.
- **Only the card on screen animates** (`.hs-slide:not([data-pos="idle"])`), and only with `transform`, `opacity` and a few small SVG strokes. When the hero is
  scrolled off screen or the tab is hidden everything pauses (`data-awake="0"`, `IntersectionObserver`, `visibilitychange`).
- **The progress bar is the timer**: a CSS animation per card; when it ends (`onAnimationEnd`) the next card shows. Hover, keyboard focus, a touch, the pause
  button, a hidden tab and "reduce motion" all stop it, with no timers to leak. Arrow keys, the dots, the buttons and a swipe move it by hand.
- **Every card is one link to a real page** (`/learn`, `/skills`, `/virtual-patient`, `/rehabverse`, `/manual-therapy`, `/daily-challenge`, `/conditions`,
  `/symptom-checker`, `/leagues`); `scripts/validate-premium-homepage.mjs` checks each exists. Counts on the cards (lessons, patients, guides) come from the data, not from typing.

Measured on the production build served locally (same method as before, Lighthouse mobile preset, three runs): score 89–90 (88 with the previous hero),
total blocking time 120 ms (130–160 ms before), layout shift 0, desktop 99. The slideshow adds about 9 KB (gzip) to the page HTML (nine cards of markup) and
nothing to download: no image, no extra request. Worker size 2,865 KiB gzip.
Why a controller and not a React component: React hydrates what it renders on the client, so a client slideshow made the page do that work for nine cards
(measured: blocking time about 250 ms). `HeroShowController` renders nothing and only attaches to the server markup.

To add a card: add an entry to `slides` in `LobbyHero.tsx` and a `Scene…` in `HeroScenes.tsx` (give its animation rule the
`.hs-slide:not([data-pos="idle"])` prefix in `home-hero.css`).

## The built-in male voice

`public/teacher/espeak/` (about 0.8 MB compressed) is loaded only when the avatar stage opens or a voice button is used, never on first paint, and is
cached for a month (`public/_headers`). Measured in Chromium: the engine is ready in 0.2 s and speaks about 60× faster than real time.
