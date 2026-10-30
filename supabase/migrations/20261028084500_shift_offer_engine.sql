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
          and s.id <> p_shift_id
          and s.starts_at < (select ends_at from public.shifts where id = p_shift_id)
          and s.ends_at > (select starts_at from public.shifts where id = p_shift_id)
    );
$$;

-- Return the next active worker without a conflict or previous offer.
create or replace function private.next_eligible_worker_for_shift(p_shift_id uuid)
returns uuid
language sql
stable
set search_path = ''
as $$
    select p.id
    from public.profiles p
    where p.account_status = 'active'
      and exists (
          select 1
          from public.user_roles ur
          where ur.user_id = p.id
            and ur.role = 'worker'
      )
      and not exists (
          select 1
          from public.shift_assignments sa
          where sa.shift_id = p_shift_id
            and sa.worker_id = p.id
      )
      and not private.shift_has_time_conflict(p.id, p_shift_id)
    order by p.employee_number asc
    limit 1;
$$;

-- Mark the shift filled when enough workers accept.
create or replace function private.close_shift_if_filled(p_shift_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_required integer;
    v_accepted integer;
begin
    select required_workers into v_required
    from public.shifts
    where id = p_shift_id;

    if v_required is null then
        return;
    end if;

    select count(*) into v_accepted
    from public.shift_assignments
    where shift_id = p_shift_id
      and response_status = 'accepted';

    if v_accepted >= v_required then
        update public.shifts
        set status = 'filled'
        where id = p_shift_id
          and status = 'open';
    end if;
end;
$$;

-- Create one offer for the next eligible worker.
create or replace function private.offer_next_eligible_worker(p_shift_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_status text;
    v_required integer;
    v_accepted integer;
    v_worker_id uuid;
begin
    select status, required_workers into v_shift_status, v_required
    from public.shifts
    where id = p_shift_id;

    if v_shift_status is null then
        raise exception 'Shift not found' using errcode = 'P0002';
    end if;

    if v_shift_status <> 'open' then
        return null;
    end if;

    select count(*) into v_accepted
    from public.shift_assignments
    where shift_id = p_shift_id
      and response_status = 'accepted';

    if v_accepted >= v_required then
        update public.shifts
        set status = 'filled'
        where id = p_shift_id
          and status = 'open';
        return null;
    end if;

    select private.next_eligible_worker_for_shift(p_shift_id) into v_worker_id;

    if v_worker_id is null then
        return null;
    end if;

    insert into public.shift_assignments (shift_id, worker_id, response_status)
    values (p_shift_id, v_worker_id, 'pending')
    on conflict (shift_id, worker_id)
    do update set
        response_status = 'pending',
        responded_at = null;

    return v_worker_id;
end;
$$;

-- Create the first round of offers for a new shift.
create or replace function public.create_shift_offers(p_shift_id uuid)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_shift_status text;
    v_required integer;
    v_worker_id uuid;
    v_offered integer := 0;
begin
    if not private.authorize('shift.create') then
        raise exception 'You are not allowed to create shift offers' using errcode = '42501';
    end if;

    select status, required_workers into v_shift_status, v_required
    from public.shifts
    where id = p_shift_id;

    if v_shift_status is null then
        raise exception 'Shift not found' using errcode = 'P0002';
    end if;

    if v_shift_status <> 'open' then
        return 0;
    end if;

    while v_offered < v_required loop
        select private.offer_next_eligible_worker(p_shift_id) into v_worker_id;
        exit when v_worker_id is null;
        v_offered := v_offered + 1;
    end loop;

    return v_offered;
end;
$$;

-- Start offer distribution after a shift is created.
create or replace function private.after_shift_insert_offer_workers()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    perform public.create_shift_offers(new.id);
    return new;
end;
$$;

drop trigger if exists create_shift_offers_on_insert on public.shifts;
create trigger create_shift_offers_on_insert
after insert on public.shifts
for each row
execute function private.after_shift_insert_offer_workers();

-- Offer the next worker after a decline.
create or replace function public.offer_next_worker_for_shift(p_shift_id uuid)
returns uuid
language sql
security invoker
set search_path = ''
as $$
    select private.offer_next_eligible_worker(p_shift_id);
$$;

-- Record a decline and offer the next eligible worker.
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
      and response_status = 'pending';

    if not found then
        raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
    end if;

    select shift_id into v_shift_id
    from public.shift_assignments
    where id = p_assignment_id;

    if v_shift_id is not null then
        perform public.offer_next_worker_for_shift(v_shift_id);
    end if;
end;
$$;

-- Record an acceptance and close the shift when full.
create or replace function private.accept_shift_offer(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
    v_required integer;
    v_status text;
    v_accepted integer;
begin
    if not private.authorize('shift.accept') then
        raise exception 'You are not allowed to accept shift offers' using errcode = '42501';
    end if;

    select shift_id into v_shift_id
    from public.shift_assignments
    where id = p_assignment_id
      and worker_id = (select auth.uid());

    if v_shift_id is null then
        raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
    end if;

    select required_workers, status into v_required, v_status
    from public.shifts
    where id = v_shift_id
    for update;

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

    perform private.close_shift_if_filled(v_shift_id);
end;
$$;

create or replace function public.decline_shift_offer(p_assignment_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
    select private.decline_shift_offer(p_assignment_id);
$$;

create or replace function public.accept_shift_offer(p_assignment_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
    select private.accept_shift_offer(p_assignment_id);
$$;

revoke all on function private.decline_shift_offer(uuid) from public, anon;
revoke all on function private.accept_shift_offer(uuid) from public, anon;
revoke all on function public.decline_shift_offer(uuid) from public, anon;
revoke all on function public.accept_shift_offer(uuid) from public, anon;

grant execute on function private.decline_shift_offer(uuid) to authenticated;
grant execute on function private.accept_shift_offer(uuid) to authenticated;
grant execute on function public.decline_shift_offer(uuid) to authenticated;
grant execute on function public.accept_shift_offer(uuid) to authenticated;

grant execute on function public.create_shift_offers(uuid) to authenticated;
grant execute on function public.offer_next_worker_for_shift(uuid) to authenticated;
