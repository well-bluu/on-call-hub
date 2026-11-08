grant update (shift_name, notes) on public.shifts to authenticated;

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

    update public.shifts
    set status = 'cancelled'
    where id = p_shift_id;

    update public.shift_assignments
    set response_status = 'cancelled',
        responded_at = now()
    where shift_id = p_shift_id
      and response_status = 'pending';
end;
$$;

create or replace function public.cancel_shift(p_shift_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    perform private.cancel_shift(p_shift_id);
end;
$$;

revoke all on function private.cancel_shift(uuid) from public, anon;
revoke all on function public.cancel_shift(uuid) from public, anon;
grant execute on function private.cancel_shift(uuid) to authenticated;
grant execute on function public.cancel_shift(uuid) to authenticated;
