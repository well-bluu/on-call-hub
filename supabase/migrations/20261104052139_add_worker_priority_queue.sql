create sequence public.worker_priority_position_seq;
revoke all on sequence public.worker_priority_position_seq
from public, anon, authenticated;

create table public.worker_priority_queue (
    worker_id uuid primary key references public.profiles(id) on delete cascade,
    queue_position bigint not null,
    consecutive_declines integer not null default 0,
    constraint worker_priority_queue_position_positive check (queue_position > 0),
    constraint worker_priority_queue_declines_nonnegative check (consecutive_declines >= 0)
);

alter table public.worker_priority_queue enable row level security;

revoke all on table public.worker_priority_queue from anon, authenticated, public;

insert into public.worker_priority_queue (worker_id, queue_position)
select id, row_number() over (order by employee_number)
from public.profiles;

select setval(
    'public.worker_priority_position_seq',
    coalesce((select max(queue_position) from public.worker_priority_queue), 1),
    true
);

alter table public.worker_priority_queue
    alter column queue_position set default nextval('public.worker_priority_position_seq');

create or replace function private.add_worker_to_priority_queue()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.worker_priority_queue (worker_id)
    values (new.id)
    on conflict (worker_id) do nothing;
    return new;
end;
$$;

revoke all on function private.add_worker_to_priority_queue()
from public, anon, authenticated;

create trigger add_worker_to_priority_queue_on_profile_insert
after insert on public.profiles
for each row
execute function private.add_worker_to_priority_queue();

create or replace function private.record_worker_decline(p_worker_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_declines integer;
begin
    insert into public.worker_priority_queue (worker_id)
    values (p_worker_id)
    on conflict (worker_id) do nothing;

    select consecutive_declines
    into v_declines
    from public.worker_priority_queue
    where worker_id = p_worker_id
    for update;

    v_declines := v_declines + 1;

    update public.worker_priority_queue
    set consecutive_declines = v_declines,
        queue_position = case
        when v_declines = 3
            then nextval('public.worker_priority_position_seq')
            else queue_position
        end
    where worker_id = p_worker_id;
end;
$$;

revoke all on function private.record_worker_decline(uuid)
from public, anon, authenticated;

create or replace function private.reset_worker_declines(p_worker_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.worker_priority_queue
    set consecutive_declines = 0
    where worker_id = p_worker_id;
end;
$$;

revoke all on function private.reset_worker_declines(uuid)
from public, anon, authenticated;

create or replace function private.next_eligible_worker_for_shift(p_shift_id uuid)
returns uuid
language sql
stable
set search_path = ''
as $$
    select p.id
    from public.profiles p
    join public.worker_priority_queue q on q.worker_id = p.id
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
    order by q.queue_position, p.employee_number
    limit 1;
$$;

create or replace function private.decline_shift_offer(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
    v_worker_id uuid;
begin
    if not private.authorize('shift.decline') then
        raise exception 'You are not allowed to decline shift offers' using errcode = '42501';
    end if;

    select a.shift_id, a.worker_id
    into v_shift_id, v_worker_id
    from public.shift_assignments a
    join public.shifts s on s.id = a.shift_id
    where a.id = p_assignment_id
      and a.worker_id = (select auth.uid())
      and a.response_status = 'pending'
    for update of s;

    if v_shift_id is null then
        raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
    end if;

    update public.shift_assignments
    set response_status = 'declined',
        responded_at = now()
    where id = p_assignment_id
      and response_status = 'pending';

    perform private.record_worker_decline(v_worker_id);
    perform private.offer_next_eligible_worker(v_shift_id);
end;
$$;

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

    select required_workers, status
    into v_required, v_status
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
        where a.response_status = 'pending'
          and a.created_at < now() - interval '1 hour'
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
            perform private.record_worker_decline(v_offer.worker_id);

            if v_starts_at > now() then
                perform private.offer_next_eligible_worker(v_offer.shift_id);
            end if;
        end if;
    end loop;

    return v_count;
end;
$$;