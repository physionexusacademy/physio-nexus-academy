-- RehabVerse Research Room, phase 1: study set-up, screening, consent evidence and concealed randomisation (2 Dec 2026).
--
-- What this adds (all new; nothing existing is changed except where stated at the bottom):
--   rehab_studies             one study record: title, version, ethics and registry numbers, the rules (config), and a hash taken when recruiting starts.
--   rehab_study_sequence      the allocation list, prepared in advance per stratum. The next unused row decides the arm. Nobody can read it through the API.
--   rehab_study_screening     every person assessed for the study, including those who were not eligible or who declined, with the reasons (append only).
--   rehab_study_consents      consent evidence: which version, how it was obtained, when, who recorded it (append only).
--   rehab_study_allocations   the arm each participant was randomised to. One per person, never changed or deleted (append only).
--   rehab_study_deviations    every departure from the allocated arm, with a reason (append only).
--
-- The rules this enforces in the database (not only in the app):
--   * Randomisation happens in ONE step with approval (rehab_admin_study_enrol): eligibility is judged here from the study rules, consent is
--     required, the stratum comes from the baseline pain score, the arm comes from the next unused row of the prepared list, and the patient's AI
--     switch is set from the arm. The therapist never chooses the arm and cannot see the list.
--   * After allocation the AI switch of a participant cannot be changed by the patient, the therapist or any other function. The only way is the
--     logged override rehab_admin_study_override_ai, which needs a reason and is recorded as a deviation (the person stays in the arm they were
--     allocated to for the analysis).
--   * A study cannot start recruiting until an ethics reference and date, a consent version and a complete allocation list exist. The rules are
--     then frozen (their hash is stored).
--   * While a study is recruiting, an account request is approved through enrolment. A person who is not eligible or who declines is logged and can
--     still be approved as an ordinary clinic patient (outside the study, AI switch by hand as before).
--   * Existing patients are not touched.

-- ───────────────────────────────── tables ─────────────────────────────────
create table if not exists public.rehab_studies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9-]{1,18}[A-Z0-9]$'),
  title text not null check (char_length(btrim(title)) between 5 and 300),
  version text not null default '1.0' check (char_length(version) between 1 and 20),
  status text not null default 'draft' check (status in ('draft', 'recruiting', 'closed')),
  config jsonb not null check (jsonb_typeof(config) = 'object' and pg_column_size(config) <= 30000),
  ethics_ref text check (ethics_ref is null or char_length(btrim(ethics_ref)) between 3 and 120),
  ethics_date date,
  registry_id text check (registry_id is null or char_length(btrim(registry_id)) between 3 and 60),
  consent_version text check (consent_version is null or char_length(btrim(consent_version)) between 1 and 40),
  sequence_source text check (sequence_source in ('independent', 'generated')),
  frozen_at timestamptz,
  frozen_hash text,
  closed_at timestamptz,
  closed_reason text check (closed_reason is null or char_length(closed_reason) <= 500),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Only one study may be open (draft or recruiting) at a time.
create unique index if not exists rehab_studies_one_open on public.rehab_studies ((true)) where status in ('draft', 'recruiting');
alter table public.rehab_studies enable row level security;
revoke all on public.rehab_studies from anon, authenticated;

create table if not exists public.rehab_study_sequence (
  id bigint generated always as identity primary key,
  study_id uuid not null references public.rehab_studies (id) on delete cascade,
  stratum text not null check (char_length(stratum) between 1 and 40),
  position int not null check (position >= 1),
  arm text not null check (arm in ('ai', 'no_ai')),
  used_at timestamptz,
  patient_id uuid references public.rehab_patients (id) on delete restrict,
  unique (study_id, stratum, position)
);
alter table public.rehab_study_sequence enable row level security;
revoke all on public.rehab_study_sequence from anon, authenticated;

create table if not exists public.rehab_study_screening (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.rehab_studies (id) on delete restrict,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  region text check (region is null or region in ('low_back', 'neck')),
  baseline_nprs smallint check (baseline_nprs is null or baseline_nprs between 0 and 10),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 6000),
  outcome text not null check (outcome in ('eligible', 'excluded', 'declined')),
  reasons text[] not null default '{}',
  note text check (note is null or char_length(note) <= 500),
  screened_by uuid references auth.users (id) on delete set null,
  screened_at timestamptz not null default now(),
  unique (study_id, patient_id)
);
create index if not exists rehab_study_screening_study_idx on public.rehab_study_screening (study_id, screened_at desc);
alter table public.rehab_study_screening enable row level security;
revoke all on public.rehab_study_screening from anon, authenticated;

create table if not exists public.rehab_study_consents (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.rehab_studies (id) on delete restrict,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  consent_version text not null,
  method text not null check (method in ('in_person_written', 'remote_recorded', 'verbal_witnessed')),
  obtained_at timestamptz not null,
  witness text check (witness is null or char_length(witness) <= 120),
  note text check (note is null or char_length(note) <= 500),
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_at timestamptz not null default now(),
  unique (study_id, patient_id)
);
alter table public.rehab_study_consents enable row level security;
revoke all on public.rehab_study_consents from anon, authenticated;

create table if not exists public.rehab_study_allocations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.rehab_studies (id) on delete restrict,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  stratum text not null,
  arm text not null check (arm in ('ai', 'no_ai')),
  sequence_id bigint not null unique references public.rehab_study_sequence (id) on delete restrict,
  screening_id uuid not null references public.rehab_study_screening (id) on delete restrict,
  allocated_by uuid references auth.users (id) on delete set null,
  allocated_at timestamptz not null default now(),
  unique (patient_id)
);
create index if not exists rehab_study_allocations_study_idx on public.rehab_study_allocations (study_id, allocated_at);
alter table public.rehab_study_allocations enable row level security;
revoke all on public.rehab_study_allocations from anon, authenticated;

create table if not exists public.rehab_study_deviations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.rehab_studies (id) on delete restrict,
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  kind text not null check (kind in ('ai_override')),
  allocated_arm text not null check (allocated_arm in ('ai', 'no_ai')),
  received_ai text not null check (received_ai in ('on', 'off')),
  reason text not null check (char_length(btrim(reason)) between 10 and 500),
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_at timestamptz not null default now()
);
create index if not exists rehab_study_deviations_patient_idx on public.rehab_study_deviations (patient_id, recorded_at);
alter table public.rehab_study_deviations enable row level security;
revoke all on public.rehab_study_deviations from anon, authenticated;

-- Records that were written cannot be changed or removed.
create or replace function public.rehab_study_append_only() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'rehab: a study record cannot be changed or removed' using errcode = '55000';
end $$;
revoke all on function public.rehab_study_append_only() from public, anon, authenticated;
do $$
declare t text;
begin
  foreach t in array array['rehab_study_screening', 'rehab_study_consents', 'rehab_study_allocations', 'rehab_study_deviations'] loop
    execute format('drop trigger if exists %I_append_only on public.%I', t, t);
    execute format('create trigger %I_append_only before update or delete on public.%I for each row execute function public.rehab_study_append_only()', t, t);
  end loop;
end $$;

-- A participant's AI switch is set by the allocation. Nothing else may change it, unless the change goes through the two functions below,
-- which raise the flag for the length of their own transaction.
create or replace function public.rehab_study_ai_guard() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.ai_assist is distinct from old.ai_assist
     and coalesce(current_setting('rehab.study_write', true), '') <> '1'
     and exists (select 1 from public.rehab_study_allocations a where a.patient_id = old.id) then
    raise exception 'rehab: AI assistance for a study participant is set by the study, not by hand' using errcode = '55000';
  end if;
  return new;
end $$;
revoke all on function public.rehab_study_ai_guard() from public, anon, authenticated;
drop trigger if exists rehab_study_ai_guard on public.rehab_patients;
create trigger rehab_study_ai_guard before update on public.rehab_patients
  for each row execute function public.rehab_study_ai_guard();

-- ─────────────────────────────── helpers ───────────────────────────────
-- The strata come from the baseline pain score: the lowest eligible score, then each cut point starts a new band ("3-5", "6-10").
create or replace function public.rehab_study__strata(p_config jsonb)
returns text[] language plpgsql immutable set search_path = public, pg_temp as $$
declare lo int := (p_config ->> 'min_nprs')::int; cuts int[]; out text[] := '{}'; c int; start_at int;
begin
  select coalesce(array_agg(x::int order by x::int), '{}') into cuts from jsonb_array_elements_text(p_config -> 'strata_cuts') x;
  start_at := lo;
  foreach c in array cuts loop
    out := out || (start_at || '-' || (c - 1));
    start_at := c;
  end loop;
  out := out || (start_at || '-10');
  return out;
end $$;

create or replace function public.rehab_study__stratum(p_config jsonb, p_nprs int)
returns text language plpgsql immutable set search_path = public, pg_temp as $$
declare s text; lo int; hi int;
begin
  if p_nprs is null or p_nprs < (p_config ->> 'min_nprs')::int or p_nprs > 10 then return null; end if;
  foreach s in array public.rehab_study__strata(p_config) loop
    lo := split_part(s, '-', 1)::int; hi := split_part(s, '-', 2)::int;
    if p_nprs between lo and hi then return s; end if;
  end loop;
  return null;
end $$;

-- The rules the database depends on are checked here; the app checks the rest (wording, instruments).
create or replace function public.rehab_study__check_config(p_config jsonb)
returns void language plpgsql immutable set search_path = public, pg_temp as $$
declare e jsonb; seen text[] := '{}'; prev int := -1; c int; n int;
begin
  if jsonb_typeof(p_config) is distinct from 'object' then raise exception 'rehab: study rules are missing' using errcode = '22023'; end if;
  if coalesce(p_config ->> 'age_min', '') !~ '^[0-9]{1,3}$' or coalesce(p_config ->> 'age_max', '') !~ '^[0-9]{1,3}$'
     or (p_config ->> 'age_min')::int < 18 or (p_config ->> 'age_max')::int < (p_config ->> 'age_min')::int or (p_config ->> 'age_max')::int > 110 then
    raise exception 'rehab: the age range must be between 18 and 110' using errcode = '22023';
  end if;
  if coalesce(p_config ->> 'min_nprs', '') !~ '^[0-9]{1,2}$' or (p_config ->> 'min_nprs')::int > 9 then
    raise exception 'rehab: the lowest pain score must be 0 to 9' using errcode = '22023';
  end if;
  if jsonb_typeof(p_config -> 'strata_cuts') is distinct from 'array' or jsonb_array_length(p_config -> 'strata_cuts') > 3 then
    raise exception 'rehab: use at most 3 cut points for the pain bands' using errcode = '22023';
  end if;
  for c in select x::int from jsonb_array_elements_text(p_config -> 'strata_cuts') x loop
    if c <= prev or c <= (p_config ->> 'min_nprs')::int or c > 10 then raise exception 'rehab: pain cut points must rise and sit above the lowest score' using errcode = '22023'; end if;
    prev := c;
  end loop;
  if jsonb_typeof(p_config -> 'regions') is distinct from 'array' or jsonb_array_length(p_config -> 'regions') not between 1 and 2
     or exists (select 1 from jsonb_array_elements_text(p_config -> 'regions') r where r not in ('low_back', 'neck')) then
    raise exception 'rehab: choose low back and/or neck' using errcode = '22023';
  end if;
  if jsonb_typeof(p_config -> 'eligibility') is distinct from 'array' or jsonb_array_length(p_config -> 'eligibility') not between 1 and 20 then
    raise exception 'rehab: give between 1 and 20 eligibility questions' using errcode = '22023';
  end if;
  for e in select * from jsonb_array_elements(p_config -> 'eligibility') loop
    if jsonb_typeof(e) is distinct from 'object' or coalesce(e ->> 'id', '') !~ '^[a-z][a-z0-9_]{1,30}$'
       or coalesce(e ->> 'kind', '') not in ('include', 'exclude') or char_length(btrim(coalesce(e ->> 'en', ''))) < 5 then
      raise exception 'rehab: an eligibility question is not valid' using errcode = '22023';
    end if;
    if (e ->> 'id') = any (seen) then raise exception 'rehab: an eligibility question is repeated' using errcode = '22023'; end if;
    seen := seen || (e ->> 'id');
  end loop;
  if jsonb_typeof(p_config -> 'outcome_plan') is distinct from 'array' or jsonb_array_length(p_config -> 'outcome_plan') not between 1 and 8 then
    raise exception 'rehab: choose between 1 and 8 outcome measures' using errcode = '22023';
  end if;
  seen := '{}';
  for e in select * from jsonb_array_elements(p_config -> 'outcome_plan') loop
    if jsonb_typeof(e) is distinct from 'object' or coalesce(e ->> 'instrument', '') !~ '^[a-z0-9_]{2,30}$'
       or coalesce(e ->> 'version', '') !~ '^[0-9]{1,3}$' or coalesce(e ->> 'schedule', '') not in ('standard', 'intensive', 'single') then
      raise exception 'rehab: an outcome measure is not valid' using errcode = '22023';
    end if;
    if (e ->> 'instrument') = any (seen) then raise exception 'rehab: an outcome measure is chosen twice' using errcode = '22023'; end if;
    seen := seen || (e ->> 'instrument');
  end loop;
  if not (p_config -> 'primary' ? 'instrument') or not (seen @> array[p_config -> 'primary' ->> 'instrument']) then
    raise exception 'rehab: the primary outcome must be one of the chosen outcome measures' using errcode = '22023';
  end if;
  n := coalesce((p_config ->> 'target_per_arm')::int, 0);
  if n < 0 or n > 5000 then raise exception 'rehab: the target per arm is not valid' using errcode = '22023'; end if;
end $$;

create or replace function public.rehab_study__open()
returns public.rehab_studies language sql stable security definer set search_path = public, pg_temp as $$
  select * from public.rehab_studies where status in ('draft', 'recruiting') limit 1
$$;
revoke all on function public.rehab_study__open() from public, anon, authenticated;

-- ─────────────────────────────── study set-up ───────────────────────────────
-- Create or update the draft. Once recruiting has started the study cannot be edited (a change is a new version, made on purpose).
create or replace function public.rehab_admin_study_save(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); cur public.rehab_studies%rowtype; cfg jsonb; new_code text; new_title text; new_version text;
begin
  if jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'rehab: invalid study' using errcode = '22023'; end if;
  cfg := p_payload -> 'config';
  perform public.rehab_study__check_config(cfg);
  new_code := upper(btrim(coalesce(p_payload ->> 'code', '')));
  new_title := btrim(coalesce(p_payload ->> 'title', ''));
  new_version := coalesce(nullif(btrim(coalesce(p_payload ->> 'version', '')), ''), '1.0');
  select * into cur from public.rehab_studies where status in ('draft', 'recruiting') limit 1;
  if found and cur.status = 'recruiting' then raise exception 'rehab: the study is recruiting and its rules are frozen' using errcode = '55000'; end if;
  if found then
    update public.rehab_studies
       set code = new_code, title = new_title, version = new_version, config = cfg,
           ethics_ref = nullif(btrim(coalesce(p_payload ->> 'ethics_ref', '')), ''),
           ethics_date = nullif(p_payload ->> 'ethics_date', '')::date,
           registry_id = nullif(btrim(coalesce(p_payload ->> 'registry_id', '')), ''),
           consent_version = nullif(btrim(coalesce(p_payload ->> 'consent_version', '')), ''),
           updated_at = now()
     where id = cur.id;
    -- A changed set of pain bands makes the prepared list wrong: it must be loaded again.
    if public.rehab_study__strata(cfg) is distinct from public.rehab_study__strata(cur.config) then
      delete from public.rehab_study_sequence where study_id = cur.id;
      update public.rehab_studies set sequence_source = null where id = cur.id;
    end if;
    perform public.rehab__audit('study.updated', 'rehab_studies', cur.id, null, jsonb_build_object('code', new_code, 'version', new_version));
    return jsonb_build_object('id', cur.id, 'created', false);
  end if;
  insert into public.rehab_studies (code, title, version, config, ethics_ref, ethics_date, registry_id, consent_version, created_by)
  values (new_code, new_title, new_version, cfg,
          nullif(btrim(coalesce(p_payload ->> 'ethics_ref', '')), ''), nullif(p_payload ->> 'ethics_date', '')::date,
          nullif(btrim(coalesce(p_payload ->> 'registry_id', '')), ''), nullif(btrim(coalesce(p_payload ->> 'consent_version', '')), ''), uid)
  returning id into cur.id;
  perform public.rehab__audit('study.created', 'rehab_studies', cur.id, null, jsonb_build_object('code', new_code));
  return jsonb_build_object('id', cur.id, 'created', true);
end $$;

-- Load the prepared allocation list (replaces any earlier one while the study is a draft). Rows: [{stratum, position, arm}].
create or replace function public.rehab_admin_study_load_sequence(p_rows jsonb, p_source text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare cur public.rehab_studies%rowtype; strata text[]; s text; n int; got int; hi int; r jsonb;
begin
  perform public.rehab__require_admin();
  select * into cur from public.rehab_studies where status in ('draft', 'recruiting') limit 1;
  if not found then raise exception 'rehab: there is no study yet' using errcode = 'P0002'; end if;
  if cur.status <> 'draft' then raise exception 'rehab: the study is recruiting and its allocation list is frozen' using errcode = '55000'; end if;
  if p_source not in ('independent', 'generated') then raise exception 'rehab: say whether the list came from an independent person' using errcode = '22023'; end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) not between 2 and 20000 then
    raise exception 'rehab: the allocation list has the wrong size' using errcode = '22023';
  end if;
  strata := public.rehab_study__strata(cur.config);
  for r in select * from jsonb_array_elements(p_rows) loop
    if jsonb_typeof(r) is distinct from 'object' or not ((r ->> 'stratum') = any (strata)) or coalesce(r ->> 'arm', '') not in ('ai', 'no_ai')
       or coalesce(r ->> 'position', '') !~ '^[0-9]{1,5}$' or (r ->> 'position')::int < 1 then
      raise exception 'rehab: the allocation list has a row that does not match the study (stratum, position or arm)' using errcode = '22023';
    end if;
  end loop;
  foreach s in array strata loop
    select count(*), count(distinct (x ->> 'position')::int), coalesce(max((x ->> 'position')::int), 0) into n, got, hi
      from jsonb_array_elements(p_rows) x where x ->> 'stratum' = s;
    if n = 0 then raise exception 'rehab: the allocation list has no rows for the group %', s using errcode = '22023'; end if;
    -- rows, distinct positions and the highest position must all agree: 1..n with no gap and no repeat
    if got <> n or hi <> n then
      raise exception 'rehab: positions in group % must run 1, 2, 3 ... with no gap or repeat', s using errcode = '22023';
    end if;
  end loop;
  delete from public.rehab_study_sequence where study_id = cur.id;
  insert into public.rehab_study_sequence (study_id, stratum, position, arm)
  select cur.id, x ->> 'stratum', (x ->> 'position')::int, x ->> 'arm' from jsonb_array_elements(p_rows) x;
  update public.rehab_studies set sequence_source = p_source, updated_at = now() where id = cur.id;
  perform public.rehab__audit('study.sequence_loaded', 'rehab_studies', cur.id, null,
    jsonb_build_object('rows', jsonb_array_length(p_rows), 'source', p_source));
  return jsonb_build_object('rows', jsonb_array_length(p_rows), 'source', p_source);
end $$;

-- draft → recruiting (needs ethics, consent version and a complete list; freezes the rules) and recruiting → closed (needs a reason).
create or replace function public.rehab_admin_study_set_status(p_to text, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare cur public.rehab_studies%rowtype; strata text[]; s text; digest text; clean text := btrim(coalesce(p_reason, ''));
begin
  perform public.rehab__require_admin();
  select * into cur from public.rehab_studies where status in ('draft', 'recruiting') limit 1 for update;
  if not found then raise exception 'rehab: there is no open study' using errcode = 'P0002'; end if;
  if p_to = 'recruiting' then
    if cur.status <> 'draft' then raise exception 'rehab: the study is already recruiting' using errcode = '22023'; end if;
    perform public.rehab_study__check_config(cur.config);
    if cur.ethics_ref is null or cur.ethics_date is null then raise exception 'rehab: record the ethics approval number and date first' using errcode = '22023'; end if;
    if cur.ethics_date > current_date then raise exception 'rehab: the ethics approval date is in the future' using errcode = '22023'; end if;
    if cur.consent_version is null then raise exception 'rehab: record the consent version first' using errcode = '22023'; end if;
    if cur.sequence_source is null then raise exception 'rehab: load the allocation list first' using errcode = '22023'; end if;
    strata := public.rehab_study__strata(cur.config);
    foreach s in array strata loop
      if (select count(*) from public.rehab_study_sequence where study_id = cur.id and stratum = s) < 4 then
        raise exception 'rehab: the allocation list needs at least 4 rows in group %', s using errcode = '22023';
      end if;
    end loop;
    digest := encode(sha256(convert_to(jsonb_build_object('code', cur.code, 'title', cur.title, 'version', cur.version, 'config', cur.config,
              'ethics_ref', cur.ethics_ref, 'ethics_date', cur.ethics_date, 'registry_id', cur.registry_id, 'consent_version', cur.consent_version,
              'sequence_source', cur.sequence_source)::text, 'UTF8')), 'hex');
    update public.rehab_studies set status = 'recruiting', frozen_at = now(), frozen_hash = digest, updated_at = now() where id = cur.id;
    perform public.rehab__audit('study.recruiting_started', 'rehab_studies', cur.id, null, jsonb_build_object('hash', digest, 'code', cur.code));
    return jsonb_build_object('status', 'recruiting', 'hash', digest);
  elsif p_to = 'closed' then
    if cur.status <> 'recruiting' then raise exception 'rehab: only a recruiting study can be closed' using errcode = '22023'; end if;
    if char_length(clean) < 10 then raise exception 'rehab: give a reason of at least 10 characters' using errcode = '22023'; end if;
    update public.rehab_studies set status = 'closed', closed_at = now(), closed_reason = left(clean, 500), updated_at = now() where id = cur.id;
    perform public.rehab__audit('study.closed', 'rehab_studies', cur.id, null, jsonb_build_object('reason', left(clean, 500)));
    return jsonb_build_object('status', 'closed');
  end if;
  raise exception 'rehab: unknown status' using errcode = '22023';
end $$;

-- ──────────────────────── screening, consent, randomisation ────────────────────────
-- The one step that approves a study participant: judge eligibility from the study rules, record consent, randomise, set the AI switch,
-- give both arms the same outcome plan, tell the patient. Everything happens together or not at all.
create or replace function public.rehab_admin_study_enrol(p_patient_id uuid, p_screen jsonb, p_consent jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := public.rehab__require_admin(); st public.rehab_studies%rowtype; pat public.rehab_patients%rowtype; cfg jsonb;
  region text; nprs int; grp text; e jsonb; answered jsonb; ans jsonb; reasons text[] := '{}'; screen_id uuid; seq public.rehab_study_sequence%rowtype;
  alloc_id uuid; method text; obtained timestamptz; ver text; ai_state text; note_text text; plan_id uuid; items jsonb;
begin
  select * into st from public.rehab_studies where status = 'recruiting' limit 1;
  if not found then raise exception 'rehab: no study is recruiting' using errcode = '22023'; end if;
  cfg := st.config;
  select * into pat from public.rehab_patients where id = p_patient_id for update;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  if pat.status <> 'pending' then raise exception 'rehab: this account is not waiting for a decision' using errcode = '22023'; end if;
  if exists (select 1 from public.rehab_study_screening where study_id = st.id and patient_id = pat.id) then
    raise exception 'rehab: this person has already been screened for the study' using errcode = '22023';
  end if;
  if jsonb_typeof(p_screen) is distinct from 'object' or jsonb_typeof(p_consent) is distinct from 'object' then
    raise exception 'rehab: the screening form is incomplete' using errcode = '22023';
  end if;

  -- eligibility, judged here from the rules
  region := p_screen ->> 'region';
  if region is null or not (cfg -> 'regions' ? region) then reasons := array_append(reasons, ('region_not_in_study')::text); end if;
  if coalesce(p_screen ->> 'nprs', '') !~ '^[0-9]{1,2}$' or (p_screen ->> 'nprs')::int > 10 then
    raise exception 'rehab: enter the baseline pain score (0 to 10)' using errcode = '22023';
  end if;
  nprs := (p_screen ->> 'nprs')::int;
  if nprs < (cfg ->> 'min_nprs')::int then reasons := array_append(reasons, ('pain_below_minimum')::text); end if;
  if pat.age_years < (cfg ->> 'age_min')::int or pat.age_years > (cfg ->> 'age_max')::int then reasons := array_append(reasons, ('age_outside_range')::text); end if;
  answered := coalesce(p_screen -> 'answers', '{}'::jsonb);
  if jsonb_typeof(answered) is distinct from 'object' then raise exception 'rehab: the screening form is incomplete' using errcode = '22023'; end if;
  for e in select * from jsonb_array_elements(cfg -> 'eligibility') loop
    ans := answered -> (e ->> 'id');
    if ans is null or jsonb_typeof(ans) <> 'boolean' then raise exception 'rehab: answer every eligibility question' using errcode = '22023'; end if;
    if (e ->> 'kind') = 'include' and ans = 'false'::jsonb then reasons := array_append(reasons, (('not_' || (e ->> 'id')))::text); end if;
    if (e ->> 'kind') = 'exclude' and ans = 'true'::jsonb then reasons := array_append(reasons, ((e ->> 'id'))::text); end if;
  end loop;

  if array_length(reasons, 1) is not null then
    insert into public.rehab_study_screening (study_id, patient_id, region, baseline_nprs, answers, outcome, reasons, screened_by)
    values (st.id, pat.id, region, nprs, answered, 'excluded', reasons, uid);
    perform public.rehab__audit('study.screened_out', 'rehab_studies', st.id, pat.id, jsonb_build_object('reasons', reasons));
    return jsonb_build_object('enrolled', false, 'reasons', reasons);
  end if;

  -- consent evidence is required for anyone who is enrolled
  method := p_consent ->> 'method';
  ver := p_consent ->> 'version';
  if coalesce((p_consent ->> 'given')::boolean, false) is not true then raise exception 'rehab: consent has not been given' using errcode = '22023'; end if;
  if method is null or method not in ('in_person_written', 'remote_recorded', 'verbal_witnessed') then raise exception 'rehab: say how consent was obtained' using errcode = '22023'; end if;
  if ver is distinct from st.consent_version then raise exception 'rehab: the consent version does not match the study' using errcode = '22023'; end if;
  if coalesce(p_consent ->> 'obtained_at', '') = '' then raise exception 'rehab: record when consent was obtained' using errcode = '22023'; end if;
  obtained := (p_consent ->> 'obtained_at')::timestamptz;
  if obtained > now() + interval '5 minutes' then raise exception 'rehab: the consent time is in the future' using errcode = '22023'; end if;
  if method = 'verbal_witnessed' and char_length(btrim(coalesce(p_consent ->> 'witness', ''))) < 2 then
    raise exception 'rehab: a witness is needed for verbal consent' using errcode = '22023';
  end if;

  grp := public.rehab_study__stratum(cfg, nprs);
  -- one allocation at a time per group keeps the list strictly in order
  perform pg_advisory_xact_lock(hashtextextended('rehab_study:' || st.id::text || ':' || grp, 0));
  select * into seq from public.rehab_study_sequence where study_id = st.id and stratum = grp and used_at is null order by position limit 1;
  if not found then raise exception 'rehab: the allocation list for this group is used up; load more rows' using errcode = '22023'; end if;

  insert into public.rehab_study_screening (study_id, patient_id, region, baseline_nprs, answers, outcome, reasons, screened_by)
  values (st.id, pat.id, region, nprs, answered, 'eligible', '{}', uid) returning id into screen_id;
  insert into public.rehab_study_consents (study_id, patient_id, consent_version, method, obtained_at, witness, note, recorded_by)
  values (st.id, pat.id, ver, method, obtained, nullif(btrim(coalesce(p_consent ->> 'witness', '')), ''), nullif(left(btrim(coalesce(p_consent ->> 'note', '')), 500), ''), uid);

  update public.rehab_study_sequence set used_at = now(), patient_id = pat.id where id = seq.id;
  insert into public.rehab_study_allocations (study_id, patient_id, stratum, arm, sequence_id, screening_id, allocated_by)
  values (st.id, pat.id, grp, seq.arm, seq.id, screen_id, uid) returning id into alloc_id;

  -- approve the account and set the AI switch from the arm (the guard lets this one change through)
  ai_state := case seq.arm when 'ai' then 'on' else 'off' end;
  perform set_config('rehab.study_write', '1', true);
  update public.rehab_patients
     set status = 'active', decided_by = uid, decided_at = now(), decision_note = 'Enrolled in study ' || st.code,
         ai_assist = ai_state, ai_assist_changed_at = now(), ai_assist_changed_by = uid
   where id = pat.id;
  perform set_config('rehab.study_write', '', true);

  -- the same outcome plan for both arms
  items := cfg -> 'outcome_plan';
  insert into public.rehab_outcome_plans (patient_id, items, note, created_by)
  values (pat.id, items, 'Study plan, the same for every participant (' || st.code || ')', uid) returning id into plan_id;

  perform public.rehab__audit('study.enrolled', 'rehab_study_allocations', alloc_id, pat.id,
    jsonb_build_object('study', st.code, 'stratum', grp, 'arm', seq.arm, 'sequence_position', seq.position, 'consent_method', method));
  note_text := coalesce(nullif(cfg -> 'notify' ->> (case pat.preferred_language when 'en' then 'en' else 'ru' end), ''),
    'Your account is approved and you are taking part in the research study. Your physiotherapist will guide you from here.');
  perform public.rehab__notify_patient(pat.id, 'study_enrolled', 'info', 'Your account is approved', note_text, '{}'::jsonb, '/rehabverse/me');
  return jsonb_build_object('enrolled', true, 'arm', seq.arm, 'stratum', grp, 'full_name', pat.full_name, 'phone', pat.phone,
    'preferred_language', pat.preferred_language, 'plan_id', plan_id);
end $$;

-- Not enrolled: the person declines, or the clinician judges they cannot take part. Logged for the flow diagram. The account stays waiting, and
-- can then be approved as an ordinary clinic patient or rejected.
create or replace function public.rehab_admin_study_screen_out(p_patient_id uuid, p_outcome text, p_reasons text[], p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); st public.rehab_studies%rowtype; pat public.rehab_patients%rowtype; r text;
begin
  select * into st from public.rehab_studies where status = 'recruiting' limit 1;
  if not found then raise exception 'rehab: no study is recruiting' using errcode = '22023'; end if;
  if p_outcome not in ('excluded', 'declined') then raise exception 'rehab: unknown outcome' using errcode = '22023'; end if;
  if p_reasons is null or coalesce(array_length(p_reasons, 1), 0) not between 1 and 6 then raise exception 'rehab: give a reason' using errcode = '22023'; end if;
  foreach r in array p_reasons loop
    if r !~ '^[a-z][a-z0-9_]{1,40}$' then raise exception 'rehab: invalid reason' using errcode = '22023'; end if;
  end loop;
  select * into pat from public.rehab_patients where id = p_patient_id for update;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  if pat.status not in ('pending', 'rejected') then raise exception 'rehab: this account is not waiting for a decision' using errcode = '22023'; end if;
  if exists (select 1 from public.rehab_study_screening where study_id = st.id and patient_id = pat.id) then
    raise exception 'rehab: this person has already been screened for the study' using errcode = '22023';
  end if;
  insert into public.rehab_study_screening (study_id, patient_id, outcome, reasons, note, screened_by)
  values (st.id, pat.id, p_outcome, p_reasons, nullif(left(btrim(coalesce(p_note, '')), 500), ''), uid);
  perform public.rehab__audit('study.' || p_outcome, 'rehab_studies', st.id, pat.id, jsonb_build_object('reasons', p_reasons));
  return jsonb_build_object('outcome', p_outcome);
end $$;

-- The one allowed way to change a participant's AI switch after allocation. They stay in the arm they were allocated to for the analysis.
create or replace function public.rehab_admin_study_override_ai(p_patient_id uuid, p_ai_on boolean, p_reason text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := public.rehab__require_admin(); alloc public.rehab_study_allocations%rowtype; cur text; nxt text; clean text := btrim(coalesce(p_reason, ''));
begin
  select * into alloc from public.rehab_study_allocations where patient_id = p_patient_id;
  if not found then raise exception 'rehab: this patient is not in the study' using errcode = 'P0002'; end if;
  if char_length(clean) < 10 then raise exception 'rehab: give a reason of at least 10 characters' using errcode = '22023'; end if;
  nxt := case when p_ai_on then 'on' else 'off' end;
  select ai_assist into cur from public.rehab_patients where id = p_patient_id for update;
  if nxt = cur then raise exception 'rehab: the AI switch is already %', nxt using errcode = '22023'; end if;
  perform set_config('rehab.study_write', '1', true);
  update public.rehab_patients set ai_assist = nxt, ai_assist_changed_at = now(), ai_assist_changed_by = uid where id = p_patient_id;
  perform set_config('rehab.study_write', '', true);
  insert into public.rehab_study_deviations (study_id, patient_id, kind, allocated_arm, received_ai, reason, recorded_by)
  values (alloc.study_id, p_patient_id, 'ai_override', alloc.arm, nxt, left(clean, 500), uid);
  perform public.rehab__audit('study.ai_override', 'rehab_study_allocations', alloc.id, p_patient_id,
    jsonb_build_object('from', cur, 'to', nxt, 'allocated_arm', alloc.arm));
  return jsonb_build_object('ai_assist', nxt);
end $$;

-- ───────────────────────────────── reading ─────────────────────────────────
-- The set-up screen: the open (or last) study, how many list rows are left per group (never which arm), and the counts for the flow diagram.
create or replace function public.rehab_admin_study_overview()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare st public.rehab_studies%rowtype;
begin
  perform public.rehab__require_admin();
  select * into st from public.rehab_studies order by case status when 'recruiting' then 0 when 'draft' then 1 else 2 end, created_at desc limit 1;
  if not found then return jsonb_build_object('study', null); end if;
  return jsonb_build_object(
    'study', jsonb_build_object('id', st.id, 'code', st.code, 'title', st.title, 'version', st.version, 'status', st.status, 'config', st.config,
      'ethics_ref', st.ethics_ref, 'ethics_date', st.ethics_date, 'registry_id', st.registry_id, 'consent_version', st.consent_version,
      'sequence_source', st.sequence_source, 'frozen_at', st.frozen_at, 'frozen_hash', st.frozen_hash, 'closed_at', st.closed_at),
    'list', coalesce((select jsonb_agg(jsonb_build_object('stratum', x.stratum, 'total', x.total, 'left', x.remaining) order by x.stratum)
        from (select stratum, count(*) as total, count(*) filter (where used_at is null) as remaining
                from public.rehab_study_sequence where study_id = st.id group by stratum) x), '[]'::jsonb),
    'flow', jsonb_build_object(
      'screened', (select count(*) from public.rehab_study_screening where study_id = st.id),
      'excluded', (select count(*) from public.rehab_study_screening where study_id = st.id and outcome = 'excluded'),
      'declined', (select count(*) from public.rehab_study_screening where study_id = st.id and outcome = 'declined'),
      'allocated', (select count(*) from public.rehab_study_allocations where study_id = st.id),
      'allocated_ai', (select count(*) from public.rehab_study_allocations where study_id = st.id and arm = 'ai'),
      'allocated_no_ai', (select count(*) from public.rehab_study_allocations where study_id = st.id and arm = 'no_ai'),
      'deviations', (select count(*) from public.rehab_study_deviations where study_id = st.id)),
    'exclusion_reasons', coalesce((select jsonb_agg(jsonb_build_object('reason', r.reason, 'n', r.n) order by r.n desc)
        from (select u.reason, count(*) as n from public.rehab_study_screening s, unnest(s.reasons) u (reason)
               where s.study_id = st.id and s.outcome <> 'eligible' group by u.reason) r), '[]'::jsonb));
end $$;

-- The people who can be enrolled right now (waiting accounts) and what is known about each of them in the study.
create or replace function public.rehab_admin_study_queue()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return jsonb_build_object(
    'recruiting', exists (select 1 from public.rehab_studies where status = 'recruiting'),
    'waiting', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'reference_code', p.reference_code, 'full_name', p.full_name,
        'age_years', p.age_years, 'sex', p.sex, 'city', p.city, 'phone', p.phone, 'preferred_language', p.preferred_language, 'created_at', p.created_at,
        'screened', (select s.outcome from public.rehab_study_screening s join public.rehab_studies st on st.id = s.study_id and st.status = 'recruiting' where s.patient_id = p.id)) order by p.created_at)
        from public.rehab_patients p where p.status in ('pending', 'rejected')), '[]'::jsonb));
end $$;

-- One patient: are they in the study, and in which arm (the clinician is not blinded to arm; a blinded assessor view comes later).
create or replace function public.rehab_admin_study_patient(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare a public.rehab_study_allocations%rowtype;
begin
  perform public.rehab__require_admin();
  select * into a from public.rehab_study_allocations where patient_id = p_patient_id;
  if not found then return jsonb_build_object('enrolled', false); end if;
  return jsonb_build_object('enrolled', true, 'arm', a.arm, 'stratum', a.stratum, 'allocated_at', a.allocated_at,
    'deviations', coalesce((select jsonb_agg(jsonb_build_object('received_ai', d.received_ai, 'reason', d.reason, 'recorded_at', d.recorded_at) order by d.recorded_at)
        from public.rehab_study_deviations d where d.patient_id = p_patient_id), '[]'::jsonb));
end $$;

-- The log of everyone screened and everyone allocated.
create or replace function public.rehab_admin_study_log()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform public.rehab__require_admin();
  return jsonb_build_object(
    'screening', coalesce((select jsonb_agg(jsonb_build_object('reference_code', p.reference_code, 'full_name', p.full_name, 'outcome', s.outcome,
        'reasons', s.reasons, 'baseline_nprs', s.baseline_nprs, 'screened_at', s.screened_at) order by s.screened_at desc)
        from public.rehab_study_screening s join public.rehab_patients p on p.id = s.patient_id), '[]'::jsonb),
    'allocations', coalesce((select jsonb_agg(jsonb_build_object('reference_code', p.reference_code, 'full_name', p.full_name, 'stratum', a.stratum,
        'arm', a.arm, 'allocated_at', a.allocated_at) order by a.allocated_at desc)
        from public.rehab_study_allocations a join public.rehab_patients p on p.id = a.patient_id), '[]'::jsonb));
end $$;

-- ─────────────── what changes in existing functions (and why) ───────────────
-- 1. While a study is recruiting, a waiting account is approved through enrolment (rehab_admin_study_enrol). A person who was screened out or
--    who declined can still be approved as an ordinary clinic patient. A rejection while a study is recruiting is written to the screening log.
-- 2. A patient cannot ask for AI assistance for themselves once they are in a study (the trigger above refuses it; the function says so clearly).
create or replace function public.rehab_admin_decide_patient(p_patient_id uuid, p_decision text, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype; next_status text; st public.rehab_studies%rowtype; screened text;
begin
  perform public.rehab__require_admin();
  if p_decision not in ('approve', 'reject') then raise exception 'rehab: unknown decision' using errcode = '22023'; end if;
  select * into pat from public.rehab_patients where id = p_patient_id for update;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  if pat.status not in ('pending', 'rejected') then
    raise exception 'rehab: this account is not waiting for a decision' using errcode = '22023';
  end if;
  select * into st from public.rehab_studies where status = 'recruiting' limit 1;
  if found then
    select outcome into screened from public.rehab_study_screening where study_id = st.id and patient_id = pat.id;
    if p_decision = 'approve' and screened is distinct from 'excluded' and screened is distinct from 'declined' then
      raise exception 'rehab: a study is recruiting; approve this person through study enrolment' using errcode = '22023';
    end if;
    if p_decision = 'reject' and screened is null then
      insert into public.rehab_study_screening (study_id, patient_id, outcome, reasons, note, screened_by)
      values (st.id, pat.id, 'excluded', array['rejected_at_approval'], nullif(left(btrim(coalesce(p_note, '')), 500), ''), auth.uid());
    end if;
  end if;
  next_status := case p_decision when 'approve' then 'active' else 'rejected' end;
  update public.rehab_patients
     set status = next_status, decided_by = auth.uid(), decided_at = now(), decision_note = nullif(btrim(coalesce(p_note, '')), '')
   where id = pat.id;
  perform public.rehab__audit('patient.' || p_decision, 'patient', pat.id, pat.id, jsonb_build_object('note', left(coalesce(p_note, ''), 500)));
  return jsonb_build_object('id', pat.id, 'status', next_status, 'full_name', pat.full_name, 'phone', pat.phone, 'preferred_language', pat.preferred_language);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'rehab_admin_study_save(jsonb)', 'rehab_admin_study_load_sequence(jsonb, text)', 'rehab_admin_study_set_status(text, text)',
    'rehab_admin_study_enrol(uuid, jsonb, jsonb)', 'rehab_admin_study_screen_out(uuid, text, text[], text)',
    'rehab_admin_study_override_ai(uuid, boolean, text)', 'rehab_admin_study_overview()', 'rehab_admin_study_queue()',
    'rehab_admin_study_patient(uuid)', 'rehab_admin_study_log()'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  revoke all on function public.rehab_study__strata(jsonb) from public, anon, authenticated;
  revoke all on function public.rehab_study__stratum(jsonb, int) from public, anon, authenticated;
  revoke all on function public.rehab_study__check_config(jsonb) from public, anon, authenticated;
end $$;
