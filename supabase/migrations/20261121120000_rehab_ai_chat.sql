-- RehabVerse AI assistant, Phases A and B: the admin-only switch (research design) and the stored conversations.
--
-- 1. The switch is the admin's alone. For research on AI use, a patient can neither ask for AI, turn it on, nor turn it off: the patient
--    controls added in Phase 0 are removed (the sign-up request, rehab_patient_ai_choice, the 'requested' state).
-- 2. rehab_ai_conversations stores every AI conversation (transcript, the form it filled, the model that answered, safety stops) so the
--    admin can read it and the research team can study it. Patients and admin can READ; only the server (service role) can write, and only
--    while the patient's switch is ON, so a transcript cannot be forged from the browser.

-- ───────────────────────── 1. admin-only switch ─────────────────────────
drop function if exists public.rehab_patient_ai_choice(boolean);
update public.rehab_patients set ai_assist = 'off' where ai_assist = 'requested';
do $$
declare c text;
begin
  for c in select conname from pg_constraint
            where conrelid = 'public.rehab_patients'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%ai_assist%' loop
    execute format('alter table public.rehab_patients drop constraint %I', c);
  end loop;
end $$;
alter table public.rehab_patients add constraint rehab_patients_ai_assist_check check (ai_assist in ('off', 'on'));

-- Registration no longer reads any AI request: every new patient starts OFF.
create or replace function public.rehab_register_patient(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare uid uuid := auth.uid(); age int; rec public.rehab_patients%rowtype; mail text;
begin
  if uid is null then raise exception 'rehab: not authorised' using errcode = '42501'; end if;
  if public.is_admin() then raise exception 'rehab: staff accounts cannot be patients' using errcode = '42501'; end if;
  age := public.rehab__int(p_payload, 'age_years', 0, 120, true);
  if age < 18 then raise exception 'rehab: under_18' using errcode = '22023'; end if;
  if not public.rehab__bool(p_payload, 'consent', false) then
    raise exception 'rehab: consent is required' using errcode = '22023';
  end if;
  mail := nullif(btrim(coalesce(auth.jwt() ->> 'email', '')), '');
  insert into public.rehab_patients (user_id, full_name, email, age_years, sex, phone, city, preferred_language, consent_version)
  values (
    uid,
    public.rehab__text(p_payload, 'full_name', 100, true),
    mail,
    age,
    public.rehab__text(p_payload, 'sex', 20),
    public.rehab__text(p_payload, 'phone', 30),
    public.rehab__text(p_payload, 'city', 80),
    coalesce(public.rehab__text(p_payload, 'preferred_language', 2), 'ru'),
    coalesce(public.rehab__text(p_payload, 'consent_version', 40), 'v1')
  )
  on conflict (user_id) do update
    set full_name = excluded.full_name, age_years = excluded.age_years, sex = excluded.sex, phone = excluded.phone,
        city = excluded.city, preferred_language = excluded.preferred_language, email = coalesce(excluded.email, public.rehab_patients.email)
  returning * into rec;
  return jsonb_build_object('id', rec.id, 'reference_code', rec.reference_code, 'preferred_language', rec.preferred_language);
end $$;

create or replace function public.rehab_admin_set_ai_assist(p_patient_id uuid, p_enabled boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := public.rehab__require_admin(); cur text; nxt text;
begin
  select ai_assist into cur from public.rehab_patients where id = p_patient_id;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  nxt := case when p_enabled then 'on' else 'off' end;
  if nxt <> cur then
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

-- ───────────────────────── 2. stored AI conversations ─────────────────────────
create table if not exists public.rehab_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.rehab_patients (id) on delete restrict,
  kind text not null check (kind in ('intake', 'coach', 'feedback')),
  language text not null default 'ru' check (language in ('en', 'ru')),
  status text not null default 'open' check (status in ('open', 'completed', 'abandoned', 'safety_stop')),
  messages jsonb not null default '[]'::jsonb check (jsonb_typeof(messages) = 'array' and jsonb_array_length(messages) <= 120),
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and pg_column_size(draft) <= 20000),
  consent_version text not null check (char_length(consent_version) between 1 and 40),
  consented_at timestamptz not null default now(),
  models text[] not null default '{}',
  turns integer not null default 0,
  fallback_turns integer not null default 0,
  safety_alert text check (safety_alert is null or char_length(safety_alert) <= 60),
  assessment_id uuid references public.rehab_assessments (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rehab_ai_conversations_patient_idx on public.rehab_ai_conversations (patient_id, created_at desc);
alter table public.rehab_ai_conversations enable row level security;
revoke all on public.rehab_ai_conversations from anon, authenticated;
grant select on public.rehab_ai_conversations to authenticated;
drop policy if exists rehab_ai_conversations_read on public.rehab_ai_conversations;
create policy rehab_ai_conversations_read on public.rehab_ai_conversations for select to authenticated
  using (patient_id = public.rehab_my_patient_id() or public.is_admin());
drop trigger if exists rehab_ai_conversations_touch on public.rehab_ai_conversations;
create trigger rehab_ai_conversations_touch before update on public.rehab_ai_conversations for each row execute function public.rehab__touch();

-- Server-only writers (service role). They re-check the switch themselves, so a switched-off patient can never have an AI turn recorded.
create or replace function public.rehab_ai_open_conversation(p_patient_id uuid, p_kind text, p_language text, p_consent_version text, p_greeting text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype; conv public.rehab_ai_conversations%rowtype; lang text := case when p_language = 'en' then 'en' else 'ru' end;
begin
  select * into pat from public.rehab_patients where id = p_patient_id;
  if not found or pat.status <> 'active' or pat.ai_assist <> 'on' then
    raise exception 'rehab: AI assistance is not enabled' using errcode = '42501';
  end if;
  if p_kind not in ('intake', 'coach', 'feedback') then raise exception 'rehab: unknown conversation kind' using errcode = '22023'; end if;
  select * into conv from public.rehab_ai_conversations where patient_id = p_patient_id and kind = p_kind and status = 'open' order by created_at desc limit 1;
  if not found then
    if (select count(*) from public.rehab_ai_conversations where patient_id = p_patient_id and created_at > now() - interval '24 hours') >= 6 then
      raise exception 'rehab: too many conversations today' using errcode = '54000';
    end if;
    insert into public.rehab_ai_conversations (patient_id, kind, language, consent_version, messages)
    values (p_patient_id, p_kind, lang, left(coalesce(nullif(btrim(p_consent_version), ''), 'ai-v1'), 40),
            case when nullif(btrim(coalesce(p_greeting, '')), '') is null then '[]'::jsonb
                 else jsonb_build_array(jsonb_build_object('role', 'assistant', 'text', left(p_greeting, 2000), 'at', now(), 'model', 'script', 'fallback', false)) end)
    returning * into conv;
    perform public.rehab__audit('ai_conversation_started', 'rehab_ai_conversations', conv.id, p_patient_id, jsonb_build_object('kind', p_kind, 'language', lang));
  end if;
  return jsonb_build_object('id', conv.id, 'status', conv.status, 'language', conv.language, 'messages', conv.messages, 'draft', conv.draft, 'turns', conv.turns);
end $$;

create or replace function public.rehab_ai_append_turn(
  p_patient_id uuid, p_conversation_id uuid, p_patient_text text, p_assistant_text text, p_draft jsonb,
  p_model text, p_fallback boolean, p_status text, p_safety text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype; conv public.rehab_ai_conversations%rowtype;
begin
  select * into pat from public.rehab_patients where id = p_patient_id;
  if not found or pat.status <> 'active' or pat.ai_assist <> 'on' then
    raise exception 'rehab: AI assistance is not enabled' using errcode = '42501';
  end if;
  select * into conv from public.rehab_ai_conversations where id = p_conversation_id and patient_id = p_patient_id for update;
  if not found then raise exception 'rehab: conversation not found' using errcode = 'P0002'; end if;
  if conv.status <> 'open' then raise exception 'rehab: conversation is closed' using errcode = '22023'; end if;
  if p_status not in ('open', 'completed', 'safety_stop') then raise exception 'rehab: bad status' using errcode = '22023'; end if;
  if char_length(coalesce(p_patient_text, '')) not between 1 and 2000 or char_length(coalesce(p_assistant_text, '')) not between 1 and 2000 then
    raise exception 'rehab: message length' using errcode = '22023';
  end if;
  if jsonb_array_length(conv.messages) + 2 > 120 then raise exception 'rehab: conversation is too long' using errcode = '54000'; end if;
  update public.rehab_ai_conversations set
    messages = messages || jsonb_build_array(
      jsonb_build_object('role', 'patient', 'text', p_patient_text, 'at', now()),
      jsonb_build_object('role', 'assistant', 'text', p_assistant_text, 'at', now(), 'model', left(coalesce(p_model, 'script'), 80), 'fallback', coalesce(p_fallback, false))),
    draft = coalesce(p_draft, draft),
    turns = turns + 1,
    fallback_turns = fallback_turns + case when coalesce(p_fallback, false) then 1 else 0 end,
    models = case when p_model is null or p_model = any (models) then models else array_append(models, left(p_model, 80)) end,
    status = p_status,
    safety_alert = coalesce(left(p_safety, 60), safety_alert)
  where id = p_conversation_id
  returning * into conv;
  if p_status = 'safety_stop' then
    perform public.rehab__audit('ai_safety_stop', 'rehab_ai_conversations', conv.id, p_patient_id, jsonb_build_object('alert', p_safety));
  elsif p_status = 'completed' then
    perform public.rehab__audit('ai_conversation_completed', 'rehab_ai_conversations', conv.id, p_patient_id, jsonb_build_object('turns', conv.turns));
  end if;
  return jsonb_build_object('id', conv.id, 'status', conv.status, 'turns', conv.turns);
end $$;

create or replace function public.rehab_ai_get_conversation(p_patient_id uuid, p_conversation_id uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object('id', c.id, 'status', c.status, 'language', c.language, 'messages', c.messages, 'draft', c.draft, 'turns', c.turns)
    from public.rehab_ai_conversations c where c.id = p_conversation_id and c.patient_id = p_patient_id
$$;

create or replace function public.rehab_ai_close_conversation(p_patient_id uuid, p_conversation_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_status not in ('completed', 'abandoned') then raise exception 'rehab: bad status' using errcode = '22023'; end if;
  update public.rehab_ai_conversations set status = p_status
   where id = p_conversation_id and patient_id = p_patient_id and status = 'open';
end $$;

-- After the patient submits the assessment the AI helped fill, remember which assessment that conversation produced.
create or replace function public.rehab_ai_link_conversation(p_patient_id uuid, p_conversation_id uuid, p_assessment_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not exists (select 1 from public.rehab_assessments where id = p_assessment_id and patient_id = p_patient_id) then
    raise exception 'rehab: assessment not found' using errcode = 'P0002';
  end if;
  update public.rehab_ai_conversations set assessment_id = p_assessment_id, status = case when status = 'safety_stop' then status else 'completed' end
   where id = p_conversation_id and patient_id = p_patient_id;
  if not found then raise exception 'rehab: conversation not found' using errcode = 'P0002'; end if;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'rehab_ai_open_conversation(uuid, text, text, text, text)',
    'rehab_ai_append_turn(uuid, uuid, text, text, jsonb, text, boolean, text, text)',
    'rehab_ai_get_conversation(uuid, uuid)',
    'rehab_ai_close_conversation(uuid, uuid, text)',
    'rehab_ai_link_conversation(uuid, uuid, uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;

-- The admin's record of a patient now carries their AI conversations (transcript, the form it filled, the model that answered).
create or replace function public.rehab_admin_patient(p_patient_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype;
begin
  perform public.rehab__require_admin();
  select * into pat from public.rehab_patients where id = p_patient_id;
  if not found then raise exception 'rehab: patient not found' using errcode = 'P0002'; end if;
  return jsonb_build_object(
    'patient', to_jsonb(pat) - 'user_id',
    'assessments', coalesce((select jsonb_agg(to_jsonb(a) order by a.submitted_at desc) from public.rehab_assessments a where a.patient_id = pat.id), '[]'::jsonb),
    'programmes', coalesce((select jsonb_agg(jsonb_build_object(
        'programme', to_jsonb(pr),
        'sessions', coalesce((select jsonb_agg(jsonb_build_object(
            'session', to_jsonb(s),
            'exercises', coalesce((select jsonb_agg(to_jsonb(e) order by e.position) from public.rehab_session_exercises e where e.session_id = s.id), '[]'::jsonb),
            'feedback', (select to_jsonb(f) from public.rehab_feedback f where f.session_id = s.id),
            'completions', coalesce((select jsonb_agg(to_jsonb(c)) from public.rehab_exercise_completions c where c.session_id = s.id), '[]'::jsonb),
            'observations', coalesce((select jsonb_agg(to_jsonb(o) order by o.recorded_at) from public.rehab_errp_observations o where o.session_id = s.id), '[]'::jsonb),
            'reviews', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at) from public.rehab_reviews r where r.session_id = s.id), '[]'::jsonb)
          ) order by s.day_number) from public.rehab_sessions s where s.programme_id = pr.id), '[]'::jsonb)
      ) order by pr.created_at desc) from public.rehab_programmes pr where pr.patient_id = pat.id), '[]'::jsonb),
    'adverse_events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc) from public.rehab_adverse_events e where e.patient_id = pat.id), '[]'::jsonb),
    'audit', coalesce((select jsonb_agg(to_jsonb(l) order by l.at desc) from (select * from public.rehab_audit_log where patient_id = pat.id order by at desc limit 60) l), '[]'::jsonb),
    'ai_conversations', coalesce((select jsonb_agg(to_jsonb(c) - 'patient_id' order by c.created_at desc) from public.rehab_ai_conversations c where c.patient_id = pat.id), '[]'::jsonb)
  );
end $$;
