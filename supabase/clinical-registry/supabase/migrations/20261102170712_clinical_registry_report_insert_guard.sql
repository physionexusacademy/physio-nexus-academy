-- New clinical reports must always begin as active drafts.
-- Prevent direct authenticated INSERTs from manufacturing final/archived
-- reports and bypassing the Registry's draft-to-final workflow.

create or replace function clinical_private.guard_report_initial_state()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.status is distinct from 'draft'
    or new.finalised_at is not null
    or new.archived_at is not null then
    raise exception 'New clinical reports must begin as active drafts'
      using errcode = '42501';
  end if;
  return new;
end;
$function$;

revoke all on function clinical_private.guard_report_initial_state()
  from public, anon, authenticated;

drop trigger if exists clinical_report_initial_state_guard
  on clinical_private.clinical_reports;

create trigger clinical_report_initial_state_guard
before insert on clinical_private.clinical_reports
for each row
execute function clinical_private.guard_report_initial_state();
