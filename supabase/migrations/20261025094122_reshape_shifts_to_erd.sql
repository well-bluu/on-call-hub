-- 1. Rename columns (the FK from shift_assignments and all policies follow automatically)
alter table public.shifts rename column shift_id to id;
alter table public.shifts rename column profile_id to created_by;
alter table public.shifts rename column shift_status to status;

-- 2. Replace date + times with two timestamps (Philippine time).
--    An end time at or before the start time means the shift ends the next day.
alter table public.shifts
  add column starts_at timestamptz,
  add column ends_at timestamptz;

update public.shifts
set starts_at = (shift_date + start_time) at time zone 'Asia/Manila',
    ends_at = (shift_date + end_time
               + case when end_time <= start_time
                      then interval '1 day' else interval '0' end)
              at time zone 'Asia/Manila';

alter table public.shifts
  alter column starts_at set not null,
  alter column ends_at set not null,
  drop column shift_date,
  drop column start_time,
  drop column end_time;

-- 3. Defaults (the form no longer sends id, created_by or status)
alter table public.shifts
  alter column id set default gen_random_uuid(),
  alter column created_by set default auth.uid(),
  alter column status set default 'open';

-- 4. Checks
alter table public.shifts
  add constraint shifts_ends_after_starts check (ends_at > starts_at),
  add constraint shifts_required_workers_positive check (required_workers > 0),
  add constraint shifts_status_check
    check (status in ('open', 'filled', 'cancelled', 'completed'));

-- 5. Foreign key: a profile with shifts cannot be deleted
alter table public.shifts drop constraint fk_profile;
alter table public.shifts
  add constraint shifts_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete restrict;

-- 6. Indexes
create index shifts_created_by_idx on public.shifts (created_by);
create index shifts_starts_at_idx on public.shifts (starts_at);
create index shifts_status_idx on public.shifts (status);

-- 7. Keep updated_at server-controlled (function already exists)
create trigger set_shifts_updated_at
before update on public.shifts
for each row
execute function private.set_updated_at();

-- 8. Cancelled and completed shifts can no longer be changed
create function private.prevent_closed_shift_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status in ('cancelled', 'completed') then
    raise exception 'This shift is % and can no longer be changed', old.status;
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_closed_shift_changes()
from public, anon, authenticated;

create trigger prevent_closed_shift_changes
before update on public.shifts
for each row
execute function private.prevent_closed_shift_changes();

-- 9. Owners can update shifts (only these columns; no DELETE, cancelling keeps the row)
grant update (shift_name, starts_at, ends_at, required_workers, notes, status)
on table public.shifts
to authenticated;

create policy "Owners can update shifts"
on public.shifts
for update
to authenticated
using ((select private.authorize('shift.update')))
with check ((select private.authorize('shift.update')));
