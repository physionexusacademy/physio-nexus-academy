-- PNA Supabase Storage setup
-- Idempotent: safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('branding', 'branding', true, 5242880, array['image/png','image/jpeg','image/svg+xml']),
  ('workshop-media', 'workshop-media', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('gallery', 'gallery', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('resources', 'resources', false, 52428800, array['application/pdf']),
  ('appointment-attachments', 'appointment-attachments', false, 5242880, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read branding" on storage.objects;
create policy "Public read branding" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'branding');

drop policy if exists "Admin insert branding" on storage.objects;
create policy "Admin insert branding" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'branding' and public.is_admin());

drop policy if exists "Admin update branding" on storage.objects;
create policy "Admin update branding" on storage.objects
  for update to authenticated
  using (bucket_id = 'branding' and public.is_admin())
  with check (bucket_id = 'branding' and public.is_admin());

drop policy if exists "Admin delete branding" on storage.objects;
create policy "Admin delete branding" on storage.objects
  for delete to authenticated
  using (bucket_id = 'branding' and public.is_admin());

drop policy if exists "Public read workshop media" on storage.objects;
create policy "Public read workshop media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'workshop-media');

drop policy if exists "Admin insert workshop media" on storage.objects;
create policy "Admin insert workshop media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'workshop-media' and public.is_admin());

drop policy if exists "Admin update workshop media" on storage.objects;
create policy "Admin update workshop media" on storage.objects
  for update to authenticated
  using (bucket_id = 'workshop-media' and public.is_admin())
  with check (bucket_id = 'workshop-media' and public.is_admin());

drop policy if exists "Admin delete workshop media" on storage.objects;
create policy "Admin delete workshop media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'workshop-media' and public.is_admin());

drop policy if exists "Public read gallery" on storage.objects;
create policy "Public read gallery" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'gallery');

drop policy if exists "Admin insert gallery" on storage.objects;
create policy "Admin insert gallery" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admin update gallery" on storage.objects;
create policy "Admin update gallery" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admin delete gallery" on storage.objects;
create policy "Admin delete gallery" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admin manage resources bucket" on storage.objects;
create policy "Admin manage resources bucket" on storage.objects
  for all to authenticated
  using (bucket_id = 'resources' and public.is_admin())
  with check (bucket_id = 'resources' and public.is_admin());

drop policy if exists "Public upload appointment attachment" on storage.objects;
create policy "Public upload appointment attachment" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'appointment-attachments');

drop policy if exists "Admin read appointment attachments" on storage.objects;
create policy "Admin read appointment attachments" on storage.objects
  for select to authenticated
  using (bucket_id = 'appointment-attachments' and public.is_admin());

drop policy if exists "Admin delete appointment attachments" on storage.objects;
create policy "Admin delete appointment attachments" on storage.objects
  for delete to authenticated
  using (bucket_id = 'appointment-attachments' and public.is_admin());
