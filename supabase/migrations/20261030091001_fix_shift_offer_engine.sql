-- OCH-45 fixes: prevent over-offering and lock down offer helpers.

-- Count active offers and lock the shift before creating an offer.
create or replace function private.offer_next_eligible_worker(p_shift_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_status text;
    v_required integer;
    v_accepted integer;
    v_active integer;
    v_worker_id uuid;
begin
    select status, required_workers
    into v_status, v_required
    from public.shifts
    where id = p_shift_id
    for update;

    if v_status is null then
        raise exception 'Shift not found' using errcode = 'P0002';
    end if;

    if v_status <> 'open' then
        return null;
    end if;

    select
        count(*) filter (where response_status = 'accepted'),
        count(*) filter (where response_status in ('pending', 'accepted'))
    into v_accepted, v_active
    from public.shift_assignments
    where shift_id = p_shift_id;

    if v_accepted >= v_required then
        update public.shifts
        set status = 'filled'
        where id = p_shift_id
          and status = 'open';
        return null;
    end if;

    if v_active >= v_required then
        return null;
    end if;

    v_worker_id := private.next_eligible_worker_for_shift(p_shift_id);

    if v_worker_id is null then
        return null;
    end if;

    insert into public.shift_assignments (shift_id, worker_id)
    values (p_shift_id, v_worker_id)
    on conflict (shift_id, worker_id) do nothing;

    return v_worker_id;
end;
$$;

-- Create initial offers without requiring a request JWT.
create or replace function private.after_shift_insert_offer_workers()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    loop
        exit when private.offer_next_eligible_worker(new.id) is null;
    end loop;

    return new;
end;
$$;

-- Decline through the private helper, then offer the next worker.
create or replace function private.decline_shift_offer(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
begin
    if not private.authorize('shift.decline') then
        raise exception 'You are not allowed to decline shift offers' using errcode = '42501';
    end if;

    update public.shift_assignments
    set response_status = 'declined',
        responded_at = now()
    where id = p_assignment_id
      and worker_id = (select auth.uid())
      and response_status = 'pending'
    returning shift_id into v_shift_id;

    if v_shift_id is null then
        raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
    end if;

    perform private.offer_next_eligible_worker(v_shift_id);
end;
$$;

-- These functions are internal and must not be public RPCs.
drop function public.offer_next_worker_for_shift(uuid);
drop function public.create_shift_offers(uuid);

revoke all on function private.offer_next_eligible_worker(uuid)
from public, anon, authenticated;
revoke all on function private.close_shift_if_filled(uuid)
from public, anon, authenticated;
revoke all on function private.next_eligible_worker_for_shift(uuid)
from public, anon, authenticated;
revoke all on function private.shift_has_time_conflict(uuid, uuid)
from public, anon, authenticated;
revoke all on function private.after_shift_insert_offer_workers()
from public, anon, authenticated;