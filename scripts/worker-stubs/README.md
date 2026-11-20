# Worker stubs

The Cloudflare worker has a hard size limit (3072 KiB gzip), and the Supabase client brings parts we never use on the
server: realtime sockets, passkey (WebAuthn) sign-in, and, in the edge middleware, storage and edge functions. They are
bundled once for each server build layer, so they were paid for three times. `next.config.js` swaps them for these tiny
stand-ins in the **server and edge builds only** (the browser build keeps the real packages, so nothing changes there).

| Stub | Replaces | Where | Why it is safe |
|------|----------|-------|----------------|
| `realtime-js.mjs` | `@supabase/realtime-js` | server + edge | nothing in `src/` opens a realtime channel (`validate:worker-stubs` checks this) |
| `auth-webauthn.mjs` | `@supabase/auth-js` `lib/webauthn` | server + edge | server code never signs in with a passkey; password / session / MFA(TOTP) are untouched |
| `storage-js.mjs`, `functions-js.mjs` | `@supabase/storage-js`, `@supabase/functions-js` | edge middleware only | the middleware only reads the session and the `profiles` table; the server build keeps the real storage client for uploads |

If a stub is ever called, it throws a clear error instead of failing silently.
Measure with `docs/worker-size.md` after changing any of them.
