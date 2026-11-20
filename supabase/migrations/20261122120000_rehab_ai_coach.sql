-- RehabVerse AI assistant, Phase D: the exercise coach.
--
-- The coach is a text chat on the patient's open exercise day (kind 'coach' in rehab_ai_conversations, which already exists). Two server-only
-- helpers (service role, never callable from a browser), both re-checking that the admin switched AI on for this patient:
--   rehab_ai_coach_notify  tells the treating physiotherapist when the coach routed something to them: a safety problem during exercise
--                          (urgent) or a question only they can answer (attention). At most once per conversation per kind, so a
--                          chatty patient cannot flood the inbox. The patient's own words (shortened) are in the message.
--   rehab_ai_coach_hold    true while the coach has stopped on a safety problem for this day (24 h), so it stays quiet until the physiotherapist
--                          has looked. The patient can still use the normal feedback form.
-- Additive only: no existing object is changed or dropped.

create or replace function public.rehab_ai_coach_notify(p_patient_id uuid, p_conversation_id uuid, p_kind text, p_alert text, p_excerpt text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype; conv public.rehab_ai_conversations%rowtype; flag text; day_no int; ref text;
begin
  select * into pat from public.rehab_patients where id = p_patient_id;
  if not found or pat.status <> 'active' or pat.ai_assist <> 'on' then
    raise exception 'rehab: AI assistance is not enabled' using errcode = '42501';
  end if;
  if p_kind not in ('safety', 'question') then raise exception 'rehab: bad notification kind' using errcode = '22023'; end if;
  select * into conv from public.rehab_ai_conversations where id = p_conversation_id and patient_id = p_patient_id and kind = 'coach' for update;
  if not found then raise exception 'rehab: conversation not found' using errcode = 'P0002'; end if;
  flag := 'notified_' || p_kind;
  if coalesce((conv.draft ->> flag)::boolean, false) then return; end if;
  update public.rehab_ai_conversations set draft = draft || jsonb_build_object(flag, true) where id = conv.id;
  day_no := nullif(conv.draft ->> 'day_number', '')::int;
  ref := pat.reference_code;
  perform public.rehab__notify_admin(
    'ai_coach_' || p_kind,
    case when p_kind = 'safety' then 'urgent' else 'attention' end,
    case when p_kind = 'safety' then 'Exercise coach: ' || ref || ' reported a problem during exercise' else 'Exercise coach: ' || ref || ' has a question for you' end,
    left(ref || case when day_no is not null then ' (day ' || day_no || ')' else '' end || ': ' || regexp_replace(left(coalesce(p_excerpt, ''), 300), '[\r\n\t]+', ' ', 'g'), 1000),
    p_patient_id,
    jsonb_build_object('conversation_id', conv.id, 'alert', left(coalesce(p_alert, ''), 60), 'day', day_no),
    '/admin/rehabverse/patients/' || p_patient_id);
  perform public.rehab__audit('ai_coach_' || p_kind, 'rehab_ai_conversations', conv.id, p_patient_id, jsonb_build_object('alert', left(coalesce(p_alert, ''), 60), 'day', day_no));
end $$;

create or replace function public.rehab_ai_coach_hold(p_patient_id uuid, p_session_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.rehab_ai_conversations c
     where c.patient_id = p_patient_id and c.kind = 'coach' and c.status = 'safety_stop'
       and c.draft ->> 'session_id' = p_session_id::text and c.created_at > now() - interval '24 hours')
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'rehab_ai_coach_notify(uuid, uuid, text, text, text)',
    'rehab_ai_coach_hold(uuid, uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;
