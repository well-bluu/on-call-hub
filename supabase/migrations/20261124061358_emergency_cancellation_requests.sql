create table public.emergency_cancellation_requests (
    id uuid primary key default gen_random_uuid(),
    assignment_id uuid not null references public.shift_assignments(id) on delete cascade,
    shift_id uuid not null references public.shifts(id) on delete cascade,
    worker_id uuid not null references public.profiles(id) on delete cascade,
    reason text not null,
    status text not null default 'pending',
    review_note text,
    reviewed_by uuid references public.profiles(id) on delete set null,
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),

    constraint emergency_cancellation_requests_status_check
        check (status in ('pending', 'approved', 'rejected')),
    constraint emergency_cancellation_requests_reason_check
        check (length(trim(reason)) between 1 and 500)
);

comment on table public.emergency_cancellation_requests is
    'Worker requests to cancel an accepted shift. Changed only through the request/approve/reject functions.';

alter table public.emergency_cancellation_requests enable row level security;

create unique index emergency_cancellation_requests_one_pending_idx
    on public.emergency_cancellation_requests (assignment_id)
    where status = 'pending';
create index emergency_cancellation_requests_worker_created_idx
    on public.emergency_cancellation_requests (worker_id, created_at desc);
create index emergency_cancellation_requests_pending_idx
    on public.emergency_cancellation_requests (created_at)
    where status = 'pending';
create index emergency_cancellation_requests_shift_id_idx
    on public.emergency_cancellation_requests (shift_id);
create index emergency_cancellation_requests_reviewed_by_idx
    on public.emergency_cancellation_requests (reviewed_by);

revoke all on table public.emergency_cancellation_requests from anon, authenticated, public;
grant select on table public.emergency_cancellation_requests to authenticated;

create policy "Workers can view their own cancellation requests"
on public.emergency_cancellation_requests
for select
to authenticated
using (
    worker_id = (select auth.uid())
    and (select private.authorize('cancellation.create.own'))
);

create policy "Owners can view all cancellation requests"
on public.emergency_cancellation_requests
for select
to authenticated
using ((select private.authorize('cancellation.approve')));

create or replace function private.request_shift_cancellation(p_assignment_id uuid, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
    v_response_status text;
    v_shift_status text;
    v_starts_at timestamptz;
    v_shift_name text;
    v_worker_name text;
    v_request_id uuid;
    v_owner record;
begin
    if not private.authorize('cancellation.create.own') then
        raise exception 'You are not allowed to request cancellations' using errcode = '42501';
    end if;

    if p_reason is null or length(trim(p_reason)) = 0 then
        raise exception 'A reason is required' using errcode = '22023';
    end if;

    select a.shift_id, a.response_status, s.status, s.starts_at, s.shift_name
    into v_shift_id, v_response_status, v_shift_status, v_starts_at, v_shift_name
    from public.shift_assignments a
    join public.shifts s on s.id = a.shift_id
    where a.id = p_assignment_id
      and a.worker_id = (select auth.uid())
    for update of s;

    if v_shift_id is null then
        raise exception 'This shift is not yours' using errcode = 'P0002';
    end if;

    if v_response_status <> 'accepted' then
        raise exception 'Only accepted shifts can be cancelled' using errcode = 'P0001';
    end if;

    if v_shift_status in ('cancelled', 'completed') then
        raise exception 'This shift is already %', v_shift_status using errcode = 'P0001';
    end if;

    if v_starts_at <= now() then
        raise exception 'This shift has already started' using errcode = 'P0001';
    end if;

    if exists (
        select 1 from public.emergency_cancellation_requests
        where assignment_id = p_assignment_id and status = 'pending'
    ) then
        raise exception 'A cancellation request is already pending' using errcode = 'P0001';
    end if;

    insert into public.emergency_cancellation_requests (assignment_id, shift_id, worker_id, reason)
    values (p_assignment_id, v_shift_id, (select auth.uid()), trim(p_reason))
    returning id into v_request_id;

    select trim(concat(p.first_name, ' ', p.last_name))
    into v_worker_name
    from public.profiles p
    where p.id = (select auth.uid());

    for v_owner in
        select ur.user_id
        from public.user_roles ur
        join public.profiles p on p.id = ur.user_id
        where ur.role = 'owner'
    loop
        perform private.notify(
            v_owner.user_id,
            'cancellation',
            'cancellation_request',
            'Cancellation request',
            concat(coalesce(v_worker_name, 'A worker'), ' asked to cancel ', v_shift_name, '. Reason: ', trim(p_reason)),
            v_shift_id,
            p_assignment_id
        );
    end loop;

    return v_request_id;
end;
$$;

create or replace function private.approve_cancellation_request(p_request_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_assignment_id uuid;
    v_shift_id uuid;
    v_worker_id uuid;
    v_request_status text;
    v_required integer;
    v_shift_status text;
    v_starts_at timestamptz;
    v_shift_name text;
    v_accepted integer;
begin
    if not private.authorize('cancellation.approve') then
        raise exception 'You are not allowed to approve cancellations' using errcode = '42501';
    end if;

    select assignment_id, shift_id, worker_id, status
    into v_assignment_id, v_shift_id, v_worker_id, v_request_status
    from public.emergency_cancellation_requests
    where id = p_request_id
    for update;

    if v_assignment_id is null then
        raise exception 'Cancellation request not found' using errcode = 'P0002';
    end if;

    if v_request_status <> 'pending' then
        raise exception 'This request was already %', v_request_status using errcode = 'P0001';
    end if;

    select required_workers, status, starts_at, shift_name
    into v_required, v_shift_status, v_starts_at, v_shift_name
    from public.shifts
    where id = v_shift_id
    for update;

    update public.emergency_cancellation_requests
    set status = 'approved',
        review_note = nullif(trim(p_note), ''),
        reviewed_by = (select auth.uid()),
        reviewed_at = now()
    where id = p_request_id;

    update public.shift_assignments
    set response_status = 'cancelled',
        responded_at = now()
    where id = v_assignment_id
      and response_status = 'accepted';

    if found then
        select count(*) into v_accepted
        from public.shift_assignments
        where shift_id = v_shift_id
          and response_status = 'accepted';

        if v_accepted < v_required and v_shift_status = 'filled' then
            update public.shifts
            set status = 'open'
            where id = v_shift_id
              and status = 'filled';
            v_shift_status := 'open';
        end if;

        if v_shift_status = 'open' and v_starts_at > now() then
            perform private.offer_next_eligible_worker(v_shift_id);
        end if;
    end if;

    perform private.notify(
        v_worker_id,
        'cancellation',
        'cancellation_approved',
        'Cancellation approved',
        concat('Your cancellation for ', v_shift_name, ' was approved.'),
        v_shift_id,
        v_assignment_id
    );
end;
$$;

create or replace function private.reject_cancellation_request(p_request_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_assignment_id uuid;
    v_shift_id uuid;
    v_worker_id uuid;
    v_request_status text;
    v_shift_name text;
begin
    if not private.authorize('cancellation.reject') then
        raise exception 'You are not allowed to reject cancellations' using errcode = '42501';
    end if;

    select r.assignment_id, r.shift_id, r.worker_id, r.status, s.shift_name
    into v_assignment_id, v_shift_id, v_worker_id, v_request_status, v_shift_name
    from public.emergency_cancellation_requests r
    join public.shifts s on s.id = r.shift_id
    where r.id = p_request_id
    for update of r;

    if v_assignment_id is null then
        raise exception 'Cancellation request not found' using errcode = 'P0002';
    end if;

    if v_request_status <> 'pending' then
        raise exception 'This request was already %', v_request_status using errcode = 'P0001';
    end if;

    update public.emergency_cancellation_requests
    set status = 'rejected',
        review_note = nullif(trim(p_note), ''),
        reviewed_by = (select auth.uid()),
        reviewed_at = now()
    where id = p_request_id;

    perform private.notify(
        v_worker_id,
        'cancellation',
        'cancellation_rejected',
        'Cancellation rejected',
        concat('Your cancellation for ', v_shift_name, ' was not approved.',
               case when nullif(trim(p_note), '') is not null then concat(' Note: ', trim(p_note)) else '' end),
        v_shift_id,
        v_assignment_id
    );
end;
$$;

create or replace function public.request_shift_cancellation(p_assignment_id uuid, p_reason text)
returns uuid
language sql
security invoker
set search_path = ''
as $$
    select private.request_shift_cancellation(p_assignment_id, p_reason);
$$;

create or replace function public.approve_cancellation_request(p_request_id uuid, p_note text default null)
returns void
language sql
security invoker
set search_path = ''
as $$
    select private.approve_cancellation_request(p_request_id, p_note);
$$;

create or replace function public.reject_cancellation_request(p_request_id uuid, p_note text default null)
returns void
language sql
security invoker
set search_path = ''
as $$
    select private.reject_cancellation_request(p_request_id, p_note);
$$;

revoke all on function private.request_shift_cancellation(uuid, text) from public, anon, authenticated;
revoke all on function private.approve_cancellation_request(uuid, text) from public, anon, authenticated;
revoke all on function private.reject_cancellation_request(uuid, text) from public, anon, authenticated;
revoke all on function public.request_shift_cancellation(uuid, text) from public, anon, authenticated;
revoke all on function public.approve_cancellation_request(uuid, text) from public, anon, authenticated;
revoke all on function public.reject_cancellation_request(uuid, text) from public, anon, authenticated;

grant execute on function private.request_shift_cancellation(uuid, text) to authenticated;
grant execute on function private.approve_cancellation_request(uuid, text) to authenticated;
grant execute on function private.reject_cancellation_request(uuid, text) to authenticated;
grant execute on function public.request_shift_cancellation(uuid, text) to authenticated;
grant execute on function public.approve_cancellation_request(uuid, text) to authenticated;
grant execute on function public.reject_cancellation_request(uuid, text) to authenticated;