# Supabase Storage — bucket setup

Run these in the Supabase SQL Editor **after** `schema.sql`. Buckets are created via SQL here
so the whole setup is scriptable, but you can also create them from the Dashboard
(Storage → New bucket) and just apply the policies below.

## 1. Create buckets

```sql
insert into storage.buckets (id, name, public)
values
  ('branding', 'branding', true),              -- logo, founder photo (public)
  ('workshop-media', 'workshop-media', true),   -- posters, workshop gallery (public)
  ('gallery', 'gallery', true),                 -- academy gallery photos (public)
  ('resources', 'resources', false),            -- books/PDFs (private, served via signed URL)
  ('appointment-attachments', 'appointment-attachments', false) -- patient uploads (private)
on conflict (id) do nothing;
```

## 2. Policies

Public, read-only buckets (`branding`, `workshop-media`, `gallery`):

```sql
create policy "Public read branding" on storage.objects
  for select using (bucket_id = 'branding');
create policy "Admin write branding" on storage.objects
  for insert with check (bucket_id = 'branding' and is_admin());
create policy "Admin update branding" on storage.objects
  for update using (bucket_id = 'branding' and is_admin());
create policy "Admin delete branding" on storage.objects
  for delete using (bucket_id = 'branding' and is_admin());

-- Repeat the same four policies for 'workshop-media' and 'gallery',
-- swapping the bucket_id value.
```

Private buckets (`resources`, `appointment-attachments`) — admin manages everything,
public gets access only through short-lived signed URLs your server generates:

```sql
create policy "Admin manage resources bucket" on storage.objects
  for all using (bucket_id = 'resources' and is_admin())
  with check (bucket_id = 'resources' and is_admin());

create policy "Public upload appointment attachment" on storage.objects
  for insert with check (bucket_id = 'appointment-attachments');
  -- Anyone can upload their own attachment when submitting the form, but
  -- only admins can read/list/delete them:
create policy "Admin read appointment attachments" on storage.objects
  for select using (bucket_id = 'appointment-attachments' and is_admin());
create policy "Admin delete appointment attachments" on storage.objects
  for delete using (bucket_id = 'appointment-attachments' and is_admin());
```

## 3. File limits (set in Dashboard → Storage → bucket settings, or via API)

| Bucket | Max file size | Allowed MIME types |
|---|---|---|
| branding | 5 MB | image/png, image/jpeg, image/svg+xml |
| workshop-media | 10 MB | image/png, image/jpeg, image/webp |
| gallery | 10 MB | image/png, image/jpeg, image/webp |
| resources | 50 MB | application/pdf |
| appointment-attachments | 5 MB | application/pdf, image/jpeg, image/png |

These limits are enforced Storage-side; the upload forms in the app also check file type and
size client-side before upload as a first line of defense — never rely on client-side
validation alone.
