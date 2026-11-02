# Backups & data safety

Two things need backing up: the **database** (appointments, workshops, resources, everything
in `supabase/schema.sql`) and **uploaded files** (PDFs, photos — everything in Storage). The
website's code itself is safe as long as it's in Git; this guide is about the data that lives
only in Supabase.

## Automatic backups (do this first — takes 2 minutes)

Supabase's paid plans include automatic daily backups out of the box (Settings → Database →
Backups). The free tier does not, so until you upgrade, use the manual method below on a
regular schedule — weekly is reasonable for a site this size, more often once patient/workshop
volume grows.

## Manual database backup

From your own computer, with the [Supabase CLI](https://supabase.com/docs/guides/cli)
installed:

```bash
supabase db dump --db-url "your-connection-string-from-Settings-Database" > backup-$(date +%Y%m%d).sql
```

Store that `.sql` file somewhere safe (a private cloud drive folder, not committed to Git —
it will contain patient data). To restore it into a fresh Supabase project if ever needed:

```bash
psql "your-new-project-connection-string" < backup-20260101.sql
```

## Manual storage backup

Storage (uploaded PDFs, gallery photos, founder photo) isn't included in a database dump —
it's file storage, backed up separately. Simplest approach for this scale: from the Supabase
Dashboard, Storage → each bucket → select all → Download, periodically. There's no CLI
one-liner for bulk download at the time of writing; scripting against the Storage API is an
option later if the volume of files grows large enough to make manual download impractical.

## What's actually at risk if you skip this

- **Patient data** (appointments, home visit requests, including addresses) — the most
  important thing to protect, and the reason backups matter even for a small site.
- **Workshop registrations** — losing these mid-way through running a paid workshop would be a
  real problem.
- **Resource PDFs** you uploaded yourself — if you still have the original files on your own
  computer, this is low-risk; if not, back up the bucket.

## A simple recurring habit

Until automatic backups are in place (i.e., until upgrading past the free tier), set a
recurring reminder — weekly is a reasonable starting cadence — to run the manual database dump
above. It takes under a minute once the CLI is installed.
