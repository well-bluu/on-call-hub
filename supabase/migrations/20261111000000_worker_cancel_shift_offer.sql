-- Allow a worker to cancel an accepted shift offer and refill the opening.
create or replace function private.cancel_shift_offer(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
    v_status text;
    v_required integer;
    v_accepted integer;
begin
    if not private.authorize('shift.decline') then
        raise exception 'You are not allowed to cancel shift offers' using errcode = '42501';
    end if;

    select shift_id, response_status
    into v_shift_id, v_status
    from public.shift_assignments
    where id = p_assignment_id
      and worker_id = (select auth.uid())
    for update;

    if v_shift_id is null then
        raise exception 'This offer is not yours' using errcode = 'P0002';
    end if;

    if v_status <> 'accepted' then
        raise exception 'This offer is not accepted' using errcode = 'P0001';
    end if;

    update public.shift_assignments
    set response_status = 'cancelled',
        responded_at = now()
    where id = p_assignment_id;

    select required_workers, status
    into v_required, v_status
    from public.shifts
    where id = v_shift_id
    for update;

    select count(*) into v_accepted
    from public.shift_assignments
    where shift_id = v_shift_id
      and response_status = 'accepted';

    if v_accepted < v_required and v_status = 'filled' then
        update public.shifts
        set status = 'open'
        where id = v_shift_id
          and status = 'filled';
        v_status := 'open';
    end if;

    if v_status = 'open' then
        perform private.offer_next_eligible_worker(v_shift_id);
    end if;
end;
$$;

create or replace function public.cancel_shift_offer(p_assignment_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
    select private.cancel_shift_offer(p_assignment_id);
$$;

revoke all on function private.cancel_shift_offer(uuid) from public, anon, authenticated;
revoke all on function public.cancel_shift_offer(uuid) from public, anon, authenticated;

grant execute on function private.cancel_shift_offer(uuid) to authenticated;
grant execute on function public.cancel_shift_offer(uuid) to authenticated;
