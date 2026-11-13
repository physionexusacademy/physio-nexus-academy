# Keeping the Cloudflare worker under its 3 MiB (gzip) limit

The deployed worker must stay below **3072 KiB gzip**. Measure it with `opennextjs-cloudflare build` followed by
`wrangler deploy --dry-run` ("Total Upload … gzip: …").

## What actually costs size (measured, not guessed)
- **Every `"use client"` file imported directly by a server component** (a page, a layout, a server component) adds an
  entry to the client-reference manifest of **every route** (~100 manifests, each listing all client modules).
  One such file costs roughly **20+ KiB gzip**, whatever its size. A client file imported only by another client
  component adds nothing there.
- **Every route** adds its prerendered HTML, RSC payload and manifest: roughly **15 KiB gzip**.
- Static assets in `public/` and browser JS chunks are *not* counted. Content, models and large data belong there
  (fetched in the browser or through the `ASSETS` binding).

## Rules for new features
1. Put a feature on an existing route when it can live there (e.g. `/account` serves the landing page, forms and the
   whole My PNA dashboard from one client component).
2. One client boundary per feature: the server page imports a single client component; everything else is imported by that component.
3. Never add a layout-level client component. Render it from a client component that is already on every page (the header).
4. Measure before and after; the difference per boundary/route is easy to see.

History: the student-account work first added six routes and three client boundaries (+93 KiB); moving to one route and one
boundary removed most of it.
