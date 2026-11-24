-- Members-only website: who may enter, and the admin approval of new members (3 Dec 2026).
--
-- A switch (site_access_settings.members_only, default OFF) decides whether the website is open to everyone or only to approved members. When it is ON the
-- Worker sends anyone who is not an approved member to the sign-in/registration page. This migration adds the data and the staff functions; it changes
-- nothing for visitors while the switch is OFF.
--
--   site_members          one row per person who asked for access: their details, status (pending, approved, rejected, suspended), who decided and when
--   site_access_settings  one row: members_only on/off
--
-- Who counts as approved (site_member_status):
--   * staff (owner/admin/editor)                    always
--   * a person whose site_members row says approved   yes
--   * a person with an ACTIVE RehabVerse patient record  yes (the clinic already approved them)
--   * a rejected or suspended site_members row overrides the two rules above, so a suspension always wins
--   * everyone else with a row is pending; a signed-in person with no row gets a pending row when they first arrive (site_member_ensure)
-- People who already use the site (staff, students with a profile, active RehabVerse patients) are approved by this migration so nobody is locked out when the
-- switch is turned on. Nothing is readable through the API tables: every read and write goes through the functions below.

create table if not exists public.site_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 30),
  city text check (city is null or char_length(city) <= 80),
  who text check (who is null or who in ('student', 'physiotherapist', 'patient', 'other')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  source text not null default 'signup' check (source in ('signup', 'existing_staff', 'existing_student', 'existing_patient', 'admin')),
  requested_at timestamptz not null default now(),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  decision_note text check (decision_note is null or char_length(decision_note) <= 500),
  updated_at timestamptz not null default now()
);
create index if not exists site_members_status_idx on public.site_members (status, requested_at desc);
alter table public.site_members enable row level security;
revoke all on public.site_members from anon, authenticated;

create table if not exists public.site_access_settings (
  id boolean primary key default true check (id),
  members_only boolean not null default false,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.site_access_settings (id, members_only) values (true, false) on conflict (id) do nothing;
alter table public.site_access_settings enable row level security;
revoke all on public.site_access_settings from anon, authenticated;

-- People who already use the site are approved, so turning the switch on locks nobody out.
insert into public.site_members (user_id, full_name, email, status, source, decided_at)
select p.id, coalesce(p.full_name, ''), u.email, 'approved', 'existing_staff', now()
  from public.profiles p join auth.users u on u.id = p.id
 where p.role in ('owner', 'admin', 'editor')
on conflict (user_id) do nothing;
insert into public.site_members (user_id, full_name, email, status, source, decided_at)
select sp.user_id, left(sp.display_name, 100), u.email, 'approved', 'existing_student', now()
  from public.student_profiles sp join auth.users u on u.id = sp.user_id
on conflict (user_id) do nothing;
insert into public.site_members (user_id, full_name, email, phone, city, status, source, decided_at)
select rp.user_id, left(rp.full_name, 100), rp.email, rp.phone, rp.city, 'approved', 'existing_patient', now()
  from public.rehab_patients rp
 where rp.status = 'active'
on conflict (user_id) do nothing;

-- ─────────────────────────────── for everyone ───────────────────────────────
-- Is the website members-only right now? (The Worker asks this; it reveals nothing else.)
create or replace function public.site_access_mode()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((select members_only from public.site_access_settings where id), false)
$$;

-- The signed-in person's own standing: 'approved', 'pending', 'rejected', 'suspended' or 'none' (no request yet).
create or replace function public.site_member_status()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); m public.site_members%rowtype; st text;
begin
  if uid is null then return jsonb_build_object('status', 'none', 'staff', false); end if;
  select * into m from public.site_members where user_id = uid;
  if found and m.status in ('rejected', 'suspended') then
    st := m.status;
  elsif public.is_admin() then
    st := 'approved';
  elsif found and m.status = 'approved' then
    st := 'approved';
  elsif exists (select 1 from public.rehab_patients where user_id = uid and status = 'active') then
    st := 'approved';
  elsif found then
    st := 'pending';
  else
    st := 'none';
  end if;
  return jsonb_build_object('status', st, 'staff', public.is_admin(), 'full_name', case when found then m.full_name else null end,
                            'note', case when found and m.status in ('rejected', 'suspended') then m.decision_note else null end);
end $$;

-- A signed-in person with no request yet gets one (pending). Staff, active patients and existing rows are left alone.
create or replace function public.site_member_ensure()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); mail text; nm text;
begin
  if uid is null then raise exception 'members: not signed in' using errcode = '42501'; end if;
  if not exists (select 1 from public.site_members where user_id = uid) then
    select email, left(coalesce(raw_user_meta_data -> 'rehabverse_profile' ->> 'full_name', raw_user_meta_data ->> 'full_name', ''), 100) into mail, nm from auth.users where id = uid;
    insert into public.site_members (user_id, full_name, email, status, source)
    values (uid, coalesce(nm, ''), mail, case when public.is_admin() then 'approved' else 'pending' end, case when public.is_admin() then 'existing_staff' else 'signup' end)
    on conflict (user_id) do nothing;
  end if;
  return public.site_member_status();
end $$;

-- The registration form: the person's details, kept while the request is pending. Approved, rejected and suspended people cannot change their record this way.
create or replace function public.site_member_register(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); mail text; nm text; ph text; ct text; wh text; cur text;
begin
  if uid is null then raise exception 'members: not signed in' using errcode = '42501'; end if;
  if jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'members: invalid request' using errcode = '22023'; end if;
  nm := btrim(coalesce(p_payload ->> 'full_name', ''));
  ph := btrim(coalesce(p_payload ->> 'phone', ''));
  ct := nullif(btrim(coalesce(p_payload ->> 'city', '')), '');
  wh := nullif(btrim(coalesce(p_payload ->> 'who', '')), '');
  if char_length(nm) not between 2 and 100 then raise exception 'members: enter your full name' using errcode = '22023'; end if;
  if char_length(regexp_replace(ph, '\D', '', 'g')) < 10 or char_length(ph) > 30 then raise exception 'members: enter a phone number the clinic can call' using errcode = '22023'; end if;
  if wh is not null and wh not in ('student', 'physiotherapist', 'patient', 'other') then raise exception 'members: say who you are' using errcode = '22023'; end if;
  if ct is not null and char_length(ct) > 80 then raise exception 'members: city is too long' using errcode = '22023'; end if;
  select email into mail from auth.users where id = uid;
  select status into cur from public.site_members where user_id = uid;
  if cur is null then
    insert into public.site_members (user_id, full_name, email, phone, city, who, status, source)
    values (uid, nm, mail, ph, ct, wh, case when public.is_admin() then 'approved' else 'pending' end, case when public.is_admin() then 'existing_staff' else 'signup' end);
  elsif cur = 'pending' then
    update public.site_members set full_name = nm, phone = ph, city = ct, who = wh, email = coalesce(mail, email), updated_at = now() where user_id = uid;
  end if;
  return public.site_member_status();
end $$;

-- ─────────────────────────────── for staff only ───────────────────────────────
-- The members list with counts. p_status: null = every status; p_search matches name, e-mail, phone and city.
create or replace function public.site_admin_members(p_status text default null, p_search text default null)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare needle text := nullif(btrim(coalesce(p_search, '')), '');
begin
  perform public.rehab__require_admin();
  if p_status is not null and p_status not in ('pending', 'approved', 'rejected', 'suspended') then raise exception 'members: unknown status' using errcode = '22023'; end if;
  return jsonb_build_object(
    'members_only', public.site_access_mode(),
    'counts', jsonb_build_object(
      'pending', (select count(*) from public.site_members where status = 'pending'),
      'approved', (select count(*) from public.site_members where status = 'approved'),
      'rejected', (select count(*) from public.site_members where status = 'rejected'),
      'suspended', (select count(*) from public.site_members where status = 'suspended')),
    'members', coalesce((select jsonb_agg(x order by (x ->> 'requested_at') desc) from (
        select jsonb_build_object('user_id', m.user_id, 'full_name', m.full_name, 'email', m.email, 'phone', m.phone, 'city', m.city, 'who', m.who,
               'status', m.status, 'source', m.source, 'requested_at', m.requested_at, 'decided_at', m.decided_at, 'decision_note', m.decision_note) x
          from public.site_members m
         where (p_status is null or m.status = p_status)
           and (needle is null or m.full_name ilike '%' || needle || '%' or m.email ilike '%' || needle || '%' or m.phone ilike '%' || needle || '%' or m.city ilike '%' || needle || '%')
         order by m.requested_at desc limit 500) t), '[]'::jsonb));
end $$;

-- approve (pending or rejected -> approved), reject (pending -> rejected), suspend (approved -> suspended), reinstate (suspended -> approved).
create or replace function public.site_admin_decide_member(p_user_id uuid, p_decision text, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); m public.site_members%rowtype; nxt text; clean text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if p_decision not in ('approve', 'reject', 'suspend', 'reinstate') then raise exception 'members: unknown decision' using errcode = '22023'; end if;
  select * into m from public.site_members where user_id = p_user_id for update;
  if not found then raise exception 'members: person not found' using errcode = 'P0002'; end if;
  if p_user_id = uid and p_decision in ('reject', 'suspend') then raise exception 'members: you cannot lock yourself out' using errcode = '22023'; end if;
  if p_decision in ('reject', 'suspend') and (clean is null or char_length(clean) < 3) then raise exception 'members: give a reason the person can read' using errcode = '22023'; end if;
  nxt := case
    when p_decision = 'approve' and m.status in ('pending', 'rejected') then 'approved'
    when p_decision = 'reject' and m.status = 'pending' then 'rejected'
    when p_decision = 'suspend' and m.status = 'approved' then 'suspended'
    when p_decision = 'reinstate' and m.status = 'suspended' then 'approved'
    else null end;
  if nxt is null then raise exception 'members: this person cannot be % from the status %', p_decision, m.status using errcode = '22023'; end if;
  update public.site_members
     set status = nxt, decided_by = uid, decided_at = now(), decision_note = left(clean, 500), updated_at = now()
   where user_id = p_user_id;
  perform public.rehab__audit('member.' || p_decision, 'site_members', p_user_id, null, jsonb_build_object('from', m.status, 'to', nxt, 'note', left(coalesce(clean, ''), 500)));
  return jsonb_build_object('user_id', p_user_id, 'status', nxt, 'full_name', m.full_name, 'phone', m.phone);
end $$;

-- The switch. Staff are always approved members, so turning it on can never lock the clinic out.
create or replace function public.site_admin_set_access_mode(p_on boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); before boolean := public.site_access_mode();
begin
  if p_on is null then raise exception 'members: say on or off' using errcode = '22023'; end if;
  update public.site_access_settings set members_only = p_on, updated_by = uid, updated_at = now() where id;
  perform public.rehab__audit('member.access_mode', 'site_access_settings', null, null, jsonb_build_object('from', before, 'to', p_on));
  return jsonb_build_object('members_only', p_on);
end $$;

do $$
declare f text;
begin
  foreach f in array array['site_access_mode()', 'site_member_status()', 'site_member_ensure()', 'site_member_register(jsonb)'] loop
    execute format('revoke all on function public.%s from public', f);
  end loop;
  -- anyone may ask whether the site is members-only (the Worker does, before sign-in); the rest need a signed-in person
  grant execute on function public.site_access_mode() to anon, authenticated, service_role;
  revoke all on function public.site_member_status() from anon;
  revoke all on function public.site_member_ensure() from anon;
  revoke all on function public.site_member_register(jsonb) from anon;
  grant execute on function public.site_member_status() to authenticated;
  grant execute on function public.site_member_ensure() to authenticated;
  grant execute on function public.site_member_register(jsonb) to authenticated;
  foreach f in array array['site_admin_members(text, text)', 'site_admin_decide_member(uuid, text, text)', 'site_admin_set_access_mode(boolean)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
