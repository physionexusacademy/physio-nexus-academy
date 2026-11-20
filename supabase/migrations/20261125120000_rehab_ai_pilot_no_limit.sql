-- RehabVerse AI assistant: the pilot no longer limits how many patients may have AI on.
--
-- Phase F capped the pilot at 5 patients. For the research study that is too few, and a cap is not a safety control (each patient's AI is
-- already switched on by the physiotherapist, one by one, and every conversation is guarded and logged), so by default there is now no
-- limit. The limit stays available as an optional setting: "no limit" is stored as 100000 (a number no clinic reaches), so the existing
-- functions keep working unchanged and the dashboard simply shows "No limit".
--
-- Additive and safe to run twice: it widens a check, changes a default, moves the default row from the old 5 to "no limit" (a limit someone
-- set on purpose is left alone) and replaces rehab_admin_set_ai_pilot so that the new range is accepted.

alter table public.rehab_ai_pilot drop constraint if exists rehab_ai_pilot_max_patients_check;
alter table public.rehab_ai_pilot add constraint rehab_ai_pilot_max_patients_check check (max_patients between 1 and 100000);
alter table public.rehab_ai_pilot alter column max_patients set default 100000;
update public.rehab_ai_pilot set max_patients = 100000 where max_patients = 5;

create or replace function public.rehab_admin_set_ai_pilot(p_max integer, p_open_to_all boolean, p_pack_version text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := public.rehab__require_admin(); last_signoff public.rehab_ai_signoffs%rowtype; cfg public.rehab_ai_pilot%rowtype;
begin
  if p_max is null or p_max not between 1 and 100000 then raise exception 'rehab: invalid_limit' using errcode = '22023'; end if;
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

revoke all on function public.rehab_admin_set_ai_pilot(integer, boolean, text) from public, anon;
grant execute on function public.rehab_admin_set_ai_pilot(integer, boolean, text) to authenticated;
