-- OCH-199: release workers when the owner cancels a shift.
create or replace function private.cancel_shift(p_shift_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_status text;
begin
    if not private.authorize('shift.cancel') then
        raise exception 'You are not allowed to cancel shifts' using errcode = '42501';
    end if;

    select status
    into v_status
    from public.shifts
    where id = p_shift_id
    for update;

    if v_status is null then
        raise exception 'Shift not found' using errcode = 'P0002';
    end if;

    if v_status in ('cancelled', 'completed') then
        raise exception 'This shift is already %', v_status using errcode = 'P0001';
    end if;

    -- Notify pending and accepted workers before cancelling their assignments.
    update public.shifts
    set status = 'cancelled'
    where id = p_shift_id;

    update public.shift_assignments
    set response_status = 'cancelled',
        responded_at = now()
    where shift_id = p_shift_id
      and response_status in ('pending', 'accepted');
end;
$$;

-- Check whether a worker has an overlapping offer or accepted shift.
create or replace function private.shift_has_time_conflict(p_worker_id uuid, p_shift_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
    select exists (
        select 1
        from public.shift_assignments sa
        join public.shifts s on s.id = sa.shift_id
        where sa.worker_id = p_worker_id
          and sa.response_status in ('pending', 'accepted')
          and s.status not in ('cancelled', 'completed')
          and s.id <> p_shift_id
          and s.starts_at < (select ends_at from public.shifts where id = p_shift_id)
          and s.ends_at > (select starts_at from public.shifts where id = p_shift_id)
    );
$$;

-- Repair assignments on shifts cancelled before this migration.
update public.shift_assignments a
set response_status = 'cancelled',
    responded_at = now()
from public.shifts s
where s.id = a.shift_id
  and s.status = 'cancelled'
  and a.response_status in ('pending', 'accepted');
