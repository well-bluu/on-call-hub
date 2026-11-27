-- OCH-208: offers can't be accepted once the shift has started.

create or replace function private.accept_shift_offer(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
    v_worker_id uuid;
    v_required integer;
    v_status text;
    v_starts_at timestamptz;
    v_accepted integer;
begin
    if not private.authorize('shift.accept') then
        raise exception 'You are not allowed to accept shift offers' using errcode = '42501';
    end if;

    select a.shift_id, a.worker_id
    into v_shift_id, v_worker_id
    from public.shift_assignments a
    join public.shifts s on s.id = a.shift_id
    where a.id = p_assignment_id
      and a.worker_id = (select auth.uid())
    for update of s;

    if v_shift_id is null then
        raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
    end if;

    select required_workers, status, starts_at
    into v_required, v_status, v_starts_at
    from public.shifts
    where id = v_shift_id;

    perform 1
    from public.shift_assignments
    where id = p_assignment_id
      and response_status = 'pending'
    for update;

    if not found then
        raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
    end if;

    if v_status <> 'open' then
        raise exception 'This shift is no longer open' using errcode = 'P0001';
    end if;

    if v_starts_at <= now() then
        raise exception 'This shift has already started' using errcode = 'P0001';
    end if;

    select count(*) into v_accepted
    from public.shift_assignments
    where shift_id = v_shift_id
      and response_status = 'accepted';

    if v_accepted >= v_required then
        raise exception 'This shift is already filled' using errcode = 'P0001';
    end if;

    update public.shift_assignments
    set response_status = 'accepted',
        responded_at = now()
    where id = p_assignment_id;

    perform private.reset_worker_declines(v_worker_id);
    perform private.close_shift_if_filled(v_shift_id);
end;
$$;

create or replace function private.expire_stale_offers()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_offer record;
    v_starts_at timestamptz;
    v_count integer := 0;
begin
    for v_offer in
        select a.id, a.shift_id, a.worker_id
        from public.shift_assignments a
        join public.shifts s on s.id = a.shift_id
        where a.response_status = 'pending'
          and (a.created_at < now() - interval '1 hour' or s.starts_at <= now())
        order by a.created_at
    loop
        select starts_at
        into v_starts_at
        from public.shifts
        where id = v_offer.shift_id
        for update;

        update public.shift_assignments
        set response_status = 'expired',
            responded_at = now()
        where id = v_offer.id
          and response_status = 'pending';

        if found then
            v_count := v_count + 1;
            -- Count it against the worker only if the shift hadn't started yet.
            if v_starts_at > now() then
                perform private.record_worker_decline(v_offer.worker_id);
                perform private.offer_next_eligible_worker(v_offer.shift_id);
            end if;
        end if;
    end loop;

    return v_count;
end;
$$;