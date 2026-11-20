# Keeping the Cloudflare worker under its 3 MiB (gzip) limit

The deployed worker must stay below **3072 KiB gzip**. Measure it with `opennextjs-cloudflare build` followed by
`wrangler deploy --dry-run` ("Total Upload … gzip: …"). To find what grew, gzip `custom-worker.js` from the dry-run output
and diff it against the previous build (`diff` shows new `chunks/NNNN.js` modules; `grep -l GoTrueClient .next/server/chunks/*.js`
shows which chunks carry a Supabase client).

## What actually costs size (measured)
- **Server-rendered client components pull their imports into the worker.** A client component is still rendered on the
  server, so everything it imports statically ends up in the worker bundle. The Supabase browser client
  (`@/lib/supabase/client` → `@supabase/ssr` + `supabase-js`) is ~220 KB raw / **~85 KiB gzip**. The first version of the
  student-account screens imported it directly and the worker grew by ~90 KiB (2760 → 2850 KiB). Loading them client-only brought it back to 2763 KiB: the whole account feature now costs ~3 KiB of worker.
- **Fix: client-only screens.** Load anything that talks to Supabase (or is large and private) with
  `next/dynamic(..., { ssr: false })`, as the RehabVerse `*Loader.tsx` files and `AccountApp` / `StudentSync` do. The code then
  ships as a browser chunk (static asset, not counted) and never enters the worker. Do not `import()` it from a module that is
  reachable on the server either: the server build still emits a chunk for a plain dynamic `import()`.
- **Each route** adds its prerendered HTML and RSC payload: roughly **4–15 KiB gzip**. Prefer a view inside an existing route.
- Client-reference manifests (one per route, ~40 KB raw each) compress to ~53 KiB gzip in total, and adding a client component
  barely changes that. Not worth optimising.
- Static assets in `public/` and browser JS chunks are *not* counted. Content, models and large data belong there
  (fetched in the browser or through the `ASSETS` binding).

## Rules for new features
1. Put a feature on an existing route when it can live there (`/account` serves the landing page, forms and the whole
   My PNA dashboard from one client component).
2. Anything that imports the Supabase client, a 3D/AI library or a large dataset is loaded client-only (`ssr: false`).
3. Measure before and after every feature; a surprise of more than ~20 KiB means something heavy was imported statically.

## Cutting what the server never uses (Nov 2026)
Measured with the source maps of a `next build` (set `experimental.serverSourceMaps` in a scratch copy of `next.config.js` and attribute
the bytes of `.next/server/**/*.js` to their source files; the same on `.next/server/src/middleware.js`). The worker holds **three copies**
of the Supabase client (the server-component layer, the route/action layer and the edge middleware), so a dependency we do not use is paid
for three times:

- **Unused Supabase parts are stubbed in the server and edge builds** (`scripts/worker-stubs/`, wired in `next.config.js`): realtime
  sockets and `phoenix` (nothing opens a channel), the WebAuthn/passkey code in auth-js (a browser ceremony), and, in the middleware only,
  the storage and edge-functions clients. `npm run validate:worker-stubs` fails if source starts using them. The browser build is untouched.
- **A redirect-only page costs about 12 KiB** (page module + client-reference manifest) even though it never runs, because
  `next.config.js` redirects first. The old `/manual-therapy/world-approaches` pages were exactly that and are deleted (the redirects stay).
  Before adding a route that only redirects, add it to `redirects()` instead.
- Worker: 2,988.9 KiB before, **2,931.1 KiB** after (limit 3,072).

Largest remaining items (raw KB in the worker): `case-report-library.ts` 177, `teacher/lesson-index.ts` 168 (keywords 36, goal 33, summary 29,
hook 29), `daily-content/pool.generated.ts` 134, the manual-therapy data files (~700 together), zod (2 copies, ~170), `tailwind-merge` (2 copies, ~38).
