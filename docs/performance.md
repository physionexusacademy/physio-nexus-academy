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

## Measured (mobile Lighthouse, production)

| | Before this change | After |
|---|---|---|
| Time to first byte (homepage) | 1,190 ms | see the release notes of the deploy |
| Largest contentful paint | 3.0 s | |
| Total blocking time | 350 ms | |
| Performance score | 84 | |
