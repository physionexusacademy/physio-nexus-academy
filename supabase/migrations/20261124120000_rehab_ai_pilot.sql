-- RehabVerse AI assistant, Phase F: pilot and sign-off.
--
-- Before the AI assistants are opened to everyone, a physiotherapist reviews them (the review pack in Admin) and a small pilot runs.
-- This migration adds, all admin-only and additive:
--   rehab_ai_pilot            one row: how many patients may have AI on during the pilot (default 5), and whether it is open to all.
--   rehab_ai_signoffs         an append-only record of reviews: who, when, the decision, notes, and the version (hash) of the review pack
--                             that was reviewed. Any later change to a prompt or wording changes the version, so a sign-off never
--                             silently covers text nobody reviewed.
--   rehab_admin_ai_pilot()    what the pilot dashboard shows: settings, enabled patients, usage per assistant, models used, how often a
--                             scripted reply was needed, safety stops, notices routed to the physiotherapist, and how often a patient changed a
--                             check-in answer on the form after the chat.
--   rehab_admin_ai_signoff()  records a review.
--   rehab_admin_set_ai_pilot() changes the limit; "open to all" needs the LATEST sign-off to be "approved" for the CURRENT pack version.
--   rehab_admin_set_ai_assist  (replaced) turning AI on for one more patient is refused once the pilot limit is reached, unless open to all.
--                             Turning it off is never refused, and patients who already have it keep it.

create table if not exists public.rehab_ai_pilot (
  id boolean primary key default true check (id),
  max_patients integer not null default 5 check (max_patients between 1 and 500),
  open_to_all boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
insert into public.rehab_ai_pilot (id) values (true) on conflict do nothing;
alter table public.rehab_ai_pilot enable row level security;
revoke all on public.rehab_ai_pilot from anon, authenticated;
create or replace trigger rehab_ai_pilot_touch before update on public.rehab_ai_pilot for each row execute function public.rehab__touch();

create table if not exists public.rehab_ai_signoffs (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null check (char_length(btrim(reviewer_name)) between 2 and 100),
  decision text not null check (decision in ('approved', 'approved_with_changes', 'not_approved')),
  notes text check (char_length(notes) <= 3000),
  pack_version text not null check (char_length(pack_version) between 6 and 40),
  signed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.rehab_ai_signoffs enable row level security;
revoke all on public.rehab_ai_signoffs from anon, authenticated;

create or replace function public.rehab_ai_signoffs_immutable() returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'rehab: sign-offs cannot be changed or deleted' using errcode = '42501';
end $$;
revoke all on function public.rehab_ai_signoffs_immutable() from public, anon, authenticated;
create or replace trigger rehab_ai_signoffs_no_change before update or delete on public.rehab_ai_signoffs for each row execute function public.rehab_ai_signoffs_immutable();

create or replace function public.rehab_admin_ai_pilot()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare cfg public.rehab_ai_pilot%rowtype;
begin
  perform public.rehab__require_admin();
  select * into cfg from public.rehab_ai_pilot limit 1;
  return jsonb_build_object(
    'settings', jsonb_build_object('max_patients', coalesce(cfg.max_patients, 5), 'open_to_all', coalesce(cfg.open_to_all, false), 'updated_at', cfg.updated_at),
    'enabled_patients', (select count(*) from public.rehab_patients where ai_assist = 'on'),
    'patients', coalesce((
      select jsonb_agg(row_to_json(x)::jsonb order by x.enabled_at desc nulls last)
        from (select p.id, p.reference_code, p.ai_assist_changed_at as enabled_at,
                     (select count(*) from public.rehab_ai_conversations c where c.patient_id = p.id) as conversations,
                     (select max(c.updated_at) from public.rehab_ai_conversations c where c.patient_id = p.id) as last_at
                from public.rehab_patients p where p.ai_assist = 'on' order by p.ai_assist_changed_at desc nulls last limit 50) x), '[]'::jsonb),
    'signoffs', coalesce((
      select jsonb_agg(row_to_json(s)::jsonb order by s.created_at desc)
        from (select id, reviewer_name, decision, notes, pack_version, created_at from public.rehab_ai_signoffs order by created_at desc limit 10) s), '[]'::jsonb),
    'kinds', coalesce((
      select jsonb_agg(row_to_json(k)::jsonb order by k.kind)
        from (select kind, count(*) as conversations,
                     count(*) filter (where status = 'completed') as completed,
                     count(*) filter (where status = 'abandoned') as abandoned,
                     count(*) filter (where status = 'open') as open,
                     count(*) filter (where status = 'safety_stop') as safety_stops,
                     coalesce(sum(turns), 0) as turns, coalesce(sum(fallback_turns), 0) as fallback_turns,
                     count(distinct patient_id) as patients
                from public.rehab_ai_conversations group by kind) k), '[]'::jsonb),
    'models', coalesce((
      select jsonb_agg(row_to_json(m)::jsonb order by m.conversations desc)
        from (select model, count(*) as conversations from public.rehab_ai_conversations c, unnest(c.models) as model group by model) m), '[]'::jsonb),
    'routed', coalesce((
      select jsonb_object_agg(kind, n)
        from (select kind, count(*) as n from public.rehab_notifications
               where audience = 'admin' and kind in ('ai_coach_safety', 'ai_coach_question', 'ai_checkin_safety', 'ai_checkin_question') group by kind) r), '{}'::jsonb),
    'checkin', (
      select jsonb_build_object('saved', count(*), 'changed', count(*) filter (where changed))
        from (select
                ((a ->> 'pain') ~ '^\d+$' and (a ->> 'pain')::int is distinct from o.pain)
                or ((a ->> 'symptom_response') in ('better', 'same', 'worse') and (a ->> 'symptom_response') is distinct from o.symptom_response)
                or ((a ->> 'function_score') ~ '^\d+$' and (a ->> 'function_score')::int is distinct from o.function_score)
                or ((a ->> 'new_symptoms') in ('true', 'false') and (a ->> 'new_symptoms')::boolean is distinct from o.new_symptoms) as changed
                from public.rehab_ai_conversations c
                cross join lateral (select case when jsonb_typeof(c.draft -> 'answers') = 'object' then c.draft -> 'answers' end as a) x
                join public.rehab_errp_observations o on o.session_id::text = c.draft ->> 'session_id' and o.timepoint = c.draft ->> 'timepoint'
               where c.kind = 'feedback' and a is not null) t)
  );
end $$;

create or replace function public.rehab_admin_ai_signoff(p_reviewer text, p_decision text, p_notes text, p_pack_version text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := public.rehab__require_admin(); rec public.rehab_ai_signoffs%rowtype;
begin
  if char_length(btrim(coalesce(p_reviewer, ''))) not between 2 and 100 then raise exception 'rehab: reviewer name required' using errcode = '22023'; end if;
  if p_decision not in ('approved', 'approved_with_changes', 'not_approved') then raise exception 'rehab: invalid decision' using errcode = '22023'; end if;
  if char_length(btrim(coalesce(p_pack_version, ''))) not between 6 and 40 then raise exception 'rehab: pack version required' using errcode = '22023'; end if;
  insert into public.rehab_ai_signoffs (reviewer_name, decision, notes, pack_version, signed_by)
  values (btrim(p_reviewer), p_decision, nullif(left(btrim(coalesce(p_notes, '')), 3000), ''), btrim(p_pack_version), actor)
  returning * into rec;
  perform public.rehab__audit('ai_pack_signoff', 'rehab_ai_signoffs', rec.id, null, jsonb_build_object('decision', rec.decision, 'pack_version', rec.pack_version));
  return jsonb_build_object('id', rec.id, 'decision', rec.decision, 'pack_version', rec.pack_version, 'created_at', rec.created_at);
end $$;

create or replace function public.rehab_admin_set_ai_pilot(p_max integer, p_open_to_all boolean, p_pack_version text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := public.rehab__require_admin(); last_signoff public.rehab_ai_signoffs%rowtype; cfg public.rehab_ai_pilot%rowtype;
begin
  if p_max is null or p_max not between 1 and 500 then raise exception 'rehab: invalid_limit' using errcode = '22023'; end if;
  if coalesce(p_open_to_all, false) then
    select * into last_signoff from public.rehab_ai_signoffs order by created_at desc limit 1;
    if not found or last_signoff.decision <> 'approved' or last_signoff.pack_version is distinct from p_pack_version then
      raise exception 'rehab: signoff_required' using errcode = '55000';
    end if;
  end if;
  insert into public.rehab_ai_pilot (id, max_patients, open_to_all, updated_by) values (true, p_max, coalesce(p_open_to_all, false), actor)
  on conflict (id) do update set max_patients = excluded.max_patients, open_to_all = excluded.open_to_all, updated_by = excluded.updated_by
  returning * into cfg;
  perform public.rehab__audit('ai_pilot_settings', 'rehab_ai_pilot', null, null, jsonb_build_object('max_patients', cfg.max_patients, 'open_to_all', cfg.open_to_all, 'pack_version', p_pack_version));
  return jsonb_build_object('max_patients', cfg.max_patients, 'open_to_all', cfg.open_to_all);
end $$;

create or replace function public.rehab_admin_set_ai_assist(p_patient_id uuid, p_enabled boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := public.rehab__require_admin(); cur text; nxt text; cfg public.rehab_ai_pilot%rowtype;
begin
  select ai_assist into cur from public.rehab_patients where id = p_patient_id;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  nxt := case when p_enabled then 'on' else 'off' end;
  if nxt <> cur then
    if p_enabled then
      -- the pilot limit: one more patient is refused once the limit is reached (unless the physiotherapist has opened AI to everyone)
      select * into cfg from public.rehab_ai_pilot limit 1;
      if not coalesce(cfg.open_to_all, false) and (select count(*) from public.rehab_patients where ai_assist = 'on') >= coalesce(cfg.max_patients, 5) then
        raise exception 'rehab: pilot_limit' using errcode = '54000';
      end if;
    end if;
    update public.rehab_patients set ai_assist = nxt, ai_assist_changed_at = now(), ai_assist_changed_by = actor where id = p_patient_id;
    perform public.rehab__audit(case when p_enabled then 'ai_assist_enabled' else 'ai_assist_disabled' end,
      'rehab_patients', p_patient_id, p_patient_id, jsonb_build_object('from', cur, 'to', nxt, 'by', 'admin'));
    perform public.rehab__notify_patient(p_patient_id, 'ai_assist', 'info',
      case when p_enabled then 'An AI assistant is now available to you' else 'AI assistance is now off for you' end,
      case when p_enabled then 'Your physiotherapist switched on the AI assistant for your RehabVerse. When you start your assessment you can talk with it instead of filling in the form. Your physiotherapist stays in charge of your care.'
           else 'Your physiotherapist switched off AI assistance. RehabVerse works as usual.' end,
      '{}'::jsonb, '/rehabverse/me');
  end if;
  return jsonb_build_object('ai_assist', nxt);
end $$;

do $$
declare f text;
begin
  foreach f in array array['rehab_admin_ai_pilot()', 'rehab_admin_ai_signoff(text, text, text, text)', 'rehab_admin_set_ai_pilot(integer, boolean, text)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
