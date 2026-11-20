-- RehabVerse AI assistant, Phase E: the recovery check-in chat.
--
-- The check-in chat is a text conversation on the patient's recovery check-in (kind 'feedback' in rehab_ai_conversations, which already
-- exists). It only collects answers and pre-fills the patient's own check-in form; the form (rehab_submit_followup) is what is saved.
-- Two changes, both additive:
--   rehab_ai_coach_notify  (replaced, same signature) now serves conversations of kind 'coach' AND 'feedback'. For a check-in conversation the
--                          message says "Check-in assistant", names the check-in (24h, 48h...) and the notification kind is ai_checkin_*.
--                          Behaviour for the exercise coach is unchanged. Still at most once per conversation per kind, service role only,
--                          and it re-checks that the admin switched AI on for this patient.
--   rehab_ai_checkin_held  (new) the safety-stopped check-in conversation for this day and check-in, if there was one in the last 24 hours,
--                          so the chat stays quiet (and the form stays pre-ticked) until the physiotherapist has looked.

create or replace function public.rehab_ai_coach_notify(p_patient_id uuid, p_conversation_id uuid, p_kind text, p_alert text, p_excerpt text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare pat public.rehab_patients%rowtype; conv public.rehab_ai_conversations%rowtype; flag text; day_no int; ref text; tp text; checkin boolean; who text;
begin
  select * into pat from public.rehab_patients where id = p_patient_id;
  if not found or pat.status <> 'active' or pat.ai_assist <> 'on' then
    raise exception 'rehab: AI assistance is not enabled' using errcode = '42501';
  end if;
  if p_kind not in ('safety', 'question') then raise exception 'rehab: bad notification kind' using errcode = '22023'; end if;
  select * into conv from public.rehab_ai_conversations where id = p_conversation_id and patient_id = p_patient_id and kind in ('coach', 'feedback') for update;
  if not found then raise exception 'rehab: conversation not found' using errcode = 'P0002'; end if;
  flag := 'notified_' || p_kind;
  if coalesce((conv.draft ->> flag)::boolean, false) then return; end if;
  update public.rehab_ai_conversations set draft = draft || jsonb_build_object(flag, true) where id = conv.id;
  checkin := conv.kind = 'feedback';
  who := case when checkin then 'Check-in assistant' else 'Exercise coach' end;
  day_no := nullif(conv.draft ->> 'day_number', '')::int;
  tp := case when conv.draft ->> 'timepoint' in ('later_same_day', '24h', '48h') then conv.draft ->> 'timepoint' else null end;
  ref := pat.reference_code;
  perform public.rehab__notify_admin(
    case when checkin then 'ai_checkin_' else 'ai_coach_' end || p_kind,
    case when p_kind = 'safety' then 'urgent' else 'attention' end,
    case when p_kind = 'safety' then who || ': ' || ref || case when checkin then ' reported a warning sign' else ' reported a problem during exercise' end
         else who || ': ' || ref || case when checkin then ' has something for you to look at' else ' has a question for you' end end,
    left(ref || case when day_no is not null then ' (day ' || day_no || case when checkin and tp is not null then ', ' || tp || ' check-in' else '' end || ')' else '' end
         || ': ' || regexp_replace(left(coalesce(p_excerpt, ''), 300), '[\r\n\t]+', ' ', 'g'), 1000),
    p_patient_id,
    jsonb_build_object('conversation_id', conv.id, 'alert', left(coalesce(p_alert, ''), 60), 'day', day_no, 'timepoint', tp),
    '/admin/rehabverse/patients/' || p_patient_id);
  perform public.rehab__audit(case when checkin then 'ai_checkin_' else 'ai_coach_' end || p_kind, 'rehab_ai_conversations', conv.id, p_patient_id,
    jsonb_build_object('alert', left(coalesce(p_alert, ''), 60), 'day', day_no, 'timepoint', tp));
end $$;

create or replace function public.rehab_ai_checkin_held(p_patient_id uuid, p_session_id uuid, p_timepoint text)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object('id', c.id, 'language', c.language, 'messages', c.messages, 'draft', c.draft)
    from public.rehab_ai_conversations c
   where c.patient_id = p_patient_id and c.kind = 'feedback' and c.status = 'safety_stop'
     and c.draft ->> 'session_id' = p_session_id::text and c.draft ->> 'timepoint' = p_timepoint
     and c.created_at > now() - interval '24 hours'
   order by c.created_at desc
   limit 1
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'rehab_ai_coach_notify(uuid, uuid, text, text, text)',
    'rehab_ai_checkin_held(uuid, uuid, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;
