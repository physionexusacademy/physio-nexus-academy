-- ═════════════════════════════════════════════════════════════════════
-- PHYSIO NEXUS ACADEMY — DATABASE SCHEMA
-- Run this in the Supabase SQL Editor (or via `supabase db push`) on a
-- fresh project. Safe to re-run: every statement is IF NOT EXISTS /
-- CREATE OR REPLACE where possible.
-- ═════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Helper: generate a short human-readable reference ID ────────────────
create or replace function generate_reference_id(prefix text)
returns text
language plpgsql
as $$
begin
  return prefix || '-' || to_char(now(), 'YYMMDD') || '-' ||
    lpad(floor(random() * 10000)::text, 4, '0');
end;
$$;

-- ── Helper: is the current session an authenticated admin? ──────────────
-- Every RLS policy below calls this instead of repeating the subquery.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

alter table profiles enable row level security;
drop policy if exists "Admins can view profiles" on profiles;
create policy "Admins can view profiles" on profiles
  for select using (is_admin());

-- ── Helper: atomically bump a resource's download counter ───────────────
-- Called by /api/resources/[id]/download via the service-role client after
-- an RLS-respecting visibility check has already passed.
create or replace function increment_resource_downloads(resource_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update resources set download_count = download_count + 1 where id = resource_id;
$$;

-- ═════════════════════════════════════════════════════════════════════
-- SITE CONTENT — editable through the Admin Dashboard instead of code
-- ═════════════════════════════════════════════════════════════════════

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists founder_profile (
  id int primary key default 1 check (id = 1), -- single-row table
  name text not null default 'Dr. Sajjad Raza PT',
  credentials_short text,
  role text,
  academic_focus text,
  photo_url text,
  message_heading text,
  message_body text[],
  updated_at timestamptz not null default now()
);
insert into founder_profile (id) values (1) on conflict (id) do nothing;

create table if not exists qualifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  issuer text,
  year text,
  certificate_image_url text,
  verification_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists editable_page_sections (
  id uuid primary key default uuid_generate_v4(),
  page text not null,       -- e.g. 'home', 'about'
  section_key text not null, -- e.g. 'hero', 'mission'
  content jsonb not null,
  updated_at timestamptz not null default now(),
  unique (page, section_key)
);

-- ═════════════════════════════════════════════════════════════════════
-- WORKSHOPS
-- ═════════════════════════════════════════════════════════════════════

create table if not exists workshops (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  summary text,
  description text,
  learning_objectives text[],
  topics text[],
  instructors text[],
  organizers text[],
  start_date date,
  end_date date,
  start_time time,
  end_time time,
  city text,
  venue text,
  map_link text,
  cpd_hours numeric,
  contact_hours numeric,
  regular_fee numeric,
  early_bird_fee numeric,
  early_bird_deadline date,
  group_discount_notes text,
  registration_status text not null default 'open' check (registration_status in ('open','closed','waitlist')),
  seat_limit int,
  seats_remaining int,
  waitlist_enabled boolean not null default false,
  poster_image_url text,
  gallery_images text[],
  is_past boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_workshops_status on workshops(status);
create index if not exists idx_workshops_start_date on workshops(start_date);

create table if not exists workshop_registrations (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid references workshops(id) on delete set null,
  reference_id text not null default generate_reference_id('WKS'),
  full_name text not null,
  email text not null,
  phone text not null,
  professional_status text check (professional_status in ('Student','Graduate','Physiotherapist','Other')),
  institute text,
  city text,
  group_registration boolean default false,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','waived')),
  transaction_ref text,
  status text not null default 'New' check (status in ('New','Contacted','Confirmed','Completed','Cancelled')),
  admin_notes text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_registrations_workshop on workshop_registrations(workshop_id);
create index if not exists idx_workshop_registrations_status on workshop_registrations(status);

-- ═════════════════════════════════════════════════════════════════════
-- COURSES (future-ready)
-- ═════════════════════════════════════════════════════════════════════

create table if not exists courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════
-- RESOURCES / BOOKS / PDFs
-- ═════════════════════════════════════════════════════════════════════

create table if not exists resource_categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);

create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text,
  description text,
  category_id uuid references resource_categories(id) on delete set null,
  tags text[],
  publication_year int,
  cover_image_url text,
  file_url text,              -- Supabase Storage path, not the raw file
  external_link text,
  visibility text not null default 'draft' check (visibility in ('Public','Members-only','Hidden','Draft')),
  access_type text not null default 'Free download' check (access_type in ('Free download','View only','External link','Future paid resource')),
  featured boolean not null default false,
  download_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_resources_visibility on resources(visibility);

-- ═════════════════════════════════════════════════════════════════════
-- PATIENT APPOINTMENTS  (public insert, admin-only read)
-- ═════════════════════════════════════════════════════════════════════

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  reference_id text not null default generate_reference_id('APT'),
  full_name text not null,
  age text,
  gender text,
  phone text not null,
  email text,
  city text not null,
  reason text not null,
  preferred_date date,
  preferred_time text,
  appointment_type text not null default 'in-person' check (appointment_type in ('in-person','online')),
  attachment_url text,
  status text not null default 'New' check (status in ('New','Contacted','Confirmed','Completed','Cancelled')),
  admin_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_appointments_status on appointments(status);

-- ═════════════════════════════════════════════════════════════════════
-- HOME VISIT REQUESTS  (public insert, admin-only read — address protected)
-- ═════════════════════════════════════════════════════════════════════

create table if not exists home_visit_requests (
  id uuid primary key default uuid_generate_v4(),
  reference_id text not null default generate_reference_id('HV'),
  full_name text not null,
  phone text not null,
  city text not null,
  area text not null,
  address text not null,
  preferred_date date,
  preferred_time text,
  mobility_summary text,
  accessibility_notes text,
  special_instructions text,
  status text not null default 'New' check (status in ('New','Contacted','Confirmed','Completed','Cancelled')),
  admin_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_home_visits_status on home_visit_requests(status);

-- ═════════════════════════════════════════════════════════════════════
-- GALLERY
-- ═════════════════════════════════════════════════════════════════════

create table if not exists gallery_items (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════
-- BLOG / UPDATES
-- ═════════════════════════════════════════════════════════════════════

create table if not exists blog_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_blog_status on blog_posts(status);

-- ═════════════════════════════════════════════════════════════════════
-- TESTIMONIALS
-- ═════════════════════════════════════════════════════════════════════

create table if not exists testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  content text not null,
  avatar_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════
-- FAQs
-- ═════════════════════════════════════════════════════════════════════

create table if not exists faqs (
  id uuid primary key default uuid_generate_v4(),
  group_label text not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════
-- CONTACT MESSAGES  (public insert, admin-only read)
-- ═════════════════════════════════════════════════════════════════════

create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'New' check (status in ('New','Read','Replied')),
  created_at timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════
-- RESEARCH SUPPORT REQUESTS  (public insert, admin-only read)
-- ═════════════════════════════════════════════════════════════════════

create table if not exists research_support_requests (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text,
  phone text,
  institute text,
  topic_area text,
  message text not null,
  status text not null default 'New' check (status in ('New','Contacted','Ongoing','Closed')),
  created_at timestamptz not null default now()
);

-- ═════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- Pattern used throughout:
--   PUBLIC content tables  → anyone can SELECT published/public rows;
--                             only admins can INSERT/UPDATE/DELETE.
--   PUBLIC submission forms → anyone can INSERT; only admins can SELECT,
--                             UPDATE or DELETE (protects patient/contact data).
--   ADMIN-ONLY tables       → only admins can do anything.
-- ═════════════════════════════════════════════════════════════════════

alter table site_settings enable row level security;
alter table founder_profile enable row level security;
alter table qualifications enable row level security;
alter table editable_page_sections enable row level security;
alter table workshops enable row level security;
alter table workshop_registrations enable row level security;
alter table courses enable row level security;
alter table resource_categories enable row level security;
alter table resources enable row level security;
alter table appointments enable row level security;
alter table home_visit_requests enable row level security;
alter table gallery_items enable row level security;
alter table blog_posts enable row level security;
alter table testimonials enable row level security;
alter table faqs enable row level security;
alter table contact_messages enable row level security;
alter table research_support_requests enable row level security;

-- site_settings / founder_profile / qualifications / editable_page_sections
-- — public read, admin write
drop policy if exists "Public read site_settings" on site_settings;
create policy "Public read site_settings" on site_settings for select using (true);
drop policy if exists "Admin write site_settings" on site_settings;
create policy "Admin write site_settings" on site_settings for all using (is_admin()) with check (is_admin());

drop policy if exists "Public read founder_profile" on founder_profile;
create policy "Public read founder_profile" on founder_profile for select using (true);
drop policy if exists "Admin write founder_profile" on founder_profile;
create policy "Admin write founder_profile" on founder_profile for all using (is_admin()) with check (is_admin());

drop policy if exists "Public read qualifications" on qualifications;
create policy "Public read qualifications" on qualifications for select using (true);
drop policy if exists "Admin write qualifications" on qualifications;
create policy "Admin write qualifications" on qualifications for all using (is_admin()) with check (is_admin());

drop policy if exists "Public read editable_page_sections" on editable_page_sections;
create policy "Public read editable_page_sections" on editable_page_sections for select using (true);
drop policy if exists "Admin write editable_page_sections" on editable_page_sections;
create policy "Admin write editable_page_sections" on editable_page_sections for all using (is_admin()) with check (is_admin());

-- workshops — public reads published only, admin reads/writes everything
drop policy if exists "Public read published workshops" on workshops;
create policy "Public read published workshops" on workshops
  for select using (status = 'published' or is_admin());
drop policy if exists "Admin write workshops" on workshops;
create policy "Admin write workshops" on workshops
  for insert with check (is_admin());
drop policy if exists "Admin update workshops" on workshops;
create policy "Admin update workshops" on workshops
  for update using (is_admin()) with check (is_admin());
drop policy if exists "Admin delete workshops" on workshops;
create policy "Admin delete workshops" on workshops
  for delete using (is_admin());

-- workshop_registrations — public can insert only, admin can read/manage
drop policy if exists "Public insert registrations" on workshop_registrations;
create policy "Public insert registrations" on workshop_registrations
  for insert
  to anon, authenticated
  with check (
    status = 'New'
    and admin_notes is null
    and (
      (
        payment_status = 'unpaid'
        and transaction_ref is null
      )
      or
      (
        payment_status = 'pending'
        and length(trim(coalesce(transaction_ref, ''))) > 0
      )
    )
  );
drop policy if exists "Admin manage registrations" on workshop_registrations;
create policy "Admin manage registrations" on workshop_registrations
  for select using (is_admin());
drop policy if exists "Admin update registrations" on workshop_registrations;
create policy "Admin update registrations" on workshop_registrations
  for update using (is_admin()) with check (is_admin());
drop policy if exists "Admin delete registrations" on workshop_registrations;
create policy "Admin delete registrations" on workshop_registrations
  for delete using (is_admin());

-- courses — public read published, admin write
drop policy if exists "Public read published courses" on courses;
create policy "Public read published courses" on courses
  for select using (status = 'published' or is_admin());
drop policy if exists "Admin write courses" on courses;
create policy "Admin write courses" on courses for all using (is_admin()) with check (is_admin());

-- resource_categories — public read, admin write
drop policy if exists "Public read categories" on resource_categories;
create policy "Public read categories" on resource_categories for select using (true);
drop policy if exists "Admin write categories" on resource_categories;
create policy "Admin write categories" on resource_categories for all using (is_admin()) with check (is_admin());

-- resources — public reads only Public visibility, admin sees all
drop policy if exists "Public read public resources" on resources;
create policy "Public read public resources" on resources
  for select using (visibility = 'Public' or is_admin());
drop policy if exists "Admin write resources" on resources;
create policy "Admin write resources" on resources for all using (is_admin()) with check (is_admin());

-- appointments — public insert only; strictly admin-only read/update/delete
drop policy if exists "Public insert appointments" on appointments;
create policy "Public insert appointments" on appointments
  for insert with check (true);
drop policy if exists "Admin read appointments" on appointments;
create policy "Admin read appointments" on appointments
  for select using (is_admin());
drop policy if exists "Admin update appointments" on appointments;
create policy "Admin update appointments" on appointments
  for update using (is_admin()) with check (is_admin());
drop policy if exists "Admin delete appointments" on appointments;
create policy "Admin delete appointments" on appointments
  for delete using (is_admin());

-- home_visit_requests — same pattern, address never public
drop policy if exists "Public insert home visits" on home_visit_requests;
create policy "Public insert home visits" on home_visit_requests
  for insert with check (true);
drop policy if exists "Admin read home visits" on home_visit_requests;
create policy "Admin read home visits" on home_visit_requests
  for select using (is_admin());
drop policy if exists "Admin update home visits" on home_visit_requests;
create policy "Admin update home visits" on home_visit_requests
  for update using (is_admin()) with check (is_admin());
drop policy if exists "Admin delete home visits" on home_visit_requests;
create policy "Admin delete home visits" on home_visit_requests
  for delete using (is_admin());

-- gallery_items — public read, admin write
drop policy if exists "Public read gallery" on gallery_items;
create policy "Public read gallery" on gallery_items for select using (true);
drop policy if exists "Admin write gallery" on gallery_items;
create policy "Admin write gallery" on gallery_items for all using (is_admin()) with check (is_admin());

-- blog_posts — public reads published only, admin all
drop policy if exists "Public read published posts" on blog_posts;
create policy "Public read published posts" on blog_posts
  for select using (status = 'published' or is_admin());
drop policy if exists "Admin write posts" on blog_posts;
create policy "Admin write posts" on blog_posts for all using (is_admin()) with check (is_admin());

-- testimonials — public reads published only, admin all
drop policy if exists "Public read published testimonials" on testimonials;
create policy "Public read published testimonials" on testimonials
  for select using (status = 'published' or is_admin());
drop policy if exists "Admin write testimonials" on testimonials;
create policy "Admin write testimonials" on testimonials for all using (is_admin()) with check (is_admin());

-- faqs — public read, admin write
drop policy if exists "Public read faqs" on faqs;
create policy "Public read faqs" on faqs for select using (true);
drop policy if exists "Admin write faqs" on faqs;
create policy "Admin write faqs" on faqs for all using (is_admin()) with check (is_admin());

-- contact_messages — public insert only, admin-only read/manage
drop policy if exists "Public insert contact messages" on contact_messages;
create policy "Public insert contact messages" on contact_messages
  for insert with check (true);
drop policy if exists "Admin manage contact messages" on contact_messages;
create policy "Admin manage contact messages" on contact_messages
  for select using (is_admin());
drop policy if exists "Admin update contact messages" on contact_messages;
create policy "Admin update contact messages" on contact_messages
  for update using (is_admin()) with check (is_admin());
drop policy if exists "Admin delete contact messages" on contact_messages;
create policy "Admin delete contact messages" on contact_messages
  for delete using (is_admin());

-- research_support_requests — public insert only, admin-only read/manage
drop policy if exists "Public insert research requests" on research_support_requests;
create policy "Public insert research requests" on research_support_requests
  for insert with check (true);
drop policy if exists "Admin manage research requests" on research_support_requests;
create policy "Admin manage research requests" on research_support_requests
  for select using (is_admin());
drop policy if exists "Admin update research requests" on research_support_requests;
create policy "Admin update research requests" on research_support_requests
  for update using (is_admin()) with check (is_admin());
drop policy if exists "Admin delete research requests" on research_support_requests;
create policy "Admin delete research requests" on research_support_requests
  for delete using (is_admin());

-- ═════════════════════════════════════════════════════════════════════
-- SEED DATA — so the site isn't empty on first deploy
-- ═════════════════════════════════════════════════════════════════════

insert into founder_profile (id, name, credentials_short, role, academic_focus, message_heading, message_body)
values (
  1,
  'Dr. Sajjad Raza PT',
  'DPT, MPhil Physical Therapy Scholar, AHPC Licensed Physiotherapist',
  'Founder and Main Instructor, Physio Nexus Academy',
  'Physical Therapy with an MSK / musculoskeletal emphasis at postgraduate level.',
  'A message from our founder',
  array[
    'Welcome to Physio Nexus Academy. Our aim is to make physiotherapy learning more practical, understandable and connected to real clinical needs.',
    'Whether you are a student developing your skills, a professional looking to grow, or a patient seeking guidance, we want you to find clear support and a professional experience here.',
    'At Physio Nexus Academy, learning, application and patient care remain our priorities.'
  ]
)
on conflict (id) do update set
  name = excluded.name,
  credentials_short = excluded.credentials_short,
  role = excluded.role,
  academic_focus = excluded.academic_focus,
  message_heading = excluded.message_heading,
  message_body = excluded.message_body;

insert into qualifications (title, sort_order) values
  ('Doctor of Physical Therapy (DPT)', 1),
  ('MPhil Physical Therapy Scholar', 2),
  ('AHPC Licensed Physiotherapist', 3),
  ('International Diploma / Training in Osteopathic Positional Release / Strain Counterstrain Technique (OMT)', 4),
  ('International Diploma / Training in Medical Acupuncture (OMT)', 5),
  ('International Diploma / Training in Dry Needling (OMT)', 6),
  ('International Dry Needling Training / Certification', 7),
  ('Manual Therapy Training (Primephysio)', 8),
  ('Kinesio Taping Mastery / Certification', 9),
  ('Diploma / Training in Hijama Therapy', 10),
  ('Diploma / Training in Cognitive Behaviour Therapy (CBT)', 11),
  ('Diploma / Training in Speech Therapy', 12),
  ('Diploma / Training in Alternative Medicine', 13)
on conflict do nothing;

insert into site_settings (key, value) values
  ('contact_phone', '"923489009028"'),
  ('contact_email', '"PLACEHOLDER — add verified academy email"'),
  ('contact_address', '"PLACEHOLDER — add verified public address"'),
  ('operating_hours', '"PLACEHOLDER — add operating hours"'),
  ('social_links', '{"facebook":"","instagram":"","linkedin":"","youtube":""}')
on conflict (key) do nothing;

-- ═════════════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ═════════════════════════════════════════════════════════════════════
