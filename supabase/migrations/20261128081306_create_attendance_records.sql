-- OCH-233: attendance records, time in and time out.
insert into public.role_permissions (role, permission)
values ('worker', 'attendance.record.own');

create table public.attendance_records (
    id uuid primary key default gen_random_uuid(),
    assignment_id uuid not null unique references public.shift_assignments (id) on delete cascade,
    shift_id uuid not null references public.shifts (id) on delete cascade,
    worker_id uuid not null references public.profiles (id) on delete cascade,
    time_in timestamptz not null,
    time_out timestamptz,
    is_late boolean not null default false,
    created_at timestamptz not null default now(),
    constraint attendance_records_time_out_after_time_in check (time_out is null or time_out > time_in)
);

create index attendance_records_worker_time_in_idx on public.attendance_records (worker_id, time_in desc);
create index attendance_records_shift_id_idx on public.attendance_records (shift_id);
-- A worker can have only one open (not timed out) record at a time.
create unique index attendance_records_one_open_per_worker_idx
    on public.attendance_records (worker_id) where time_out is null;

alter table public.attendance_records enable row level security;
revoke all on table public.attendance_records from anon, authenticated, public;
grant select on table public.attendance_records to authenticated;

create policy "Workers read their own attendance"
on public.attendance_records
for select
to authenticated
using (
    worker_id = (select auth.uid())
    and (select private.authorize('attendance.record.own'))
);

create or replace function private.record_time_in()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_worker_id uuid := (select auth.uid());
    v_now timestamptz := clock_timestamp();
    v_assignment_id uuid;
    v_shift_id uuid;
    v_shift_name text;
    v_starts_at timestamptz;
    v_ends_at timestamptz;
    v_is_late boolean;
    v_worker_name text;
begin
    if v_worker_id is null or not private.authorize('attendance.record.own') then
        raise exception 'You are not allowed to record attendance' using errcode = '42501';
    end if;

    if exists (
        select 1 from public.attendance_records
        where worker_id = v_worker_id and time_out is null
    ) then
        raise exception 'You have already timed in. Time out first.' using errcode = 'P0001';
    end if;

    -- Earliest accepted shift whose window is open now: 30 minutes before start until the end.
    select sa.id, s.id, s.shift_name, s.starts_at, s.ends_at
    into v_assignment_id, v_shift_id, v_shift_name, v_starts_at, v_ends_at
    from public.shift_assignments sa
    join public.shifts s on s.id = sa.shift_id
    where sa.worker_id = v_worker_id
      and sa.response_status = 'accepted'
      and s.status in ('open', 'filled')
      and v_now >= s.starts_at - interval '30 minutes'
      and v_now < s.ends_at
      and not exists (
          select 1 from public.attendance_records ar where ar.assignment_id = sa.id
      )
    order by s.starts_at
    limit 1
    for update of sa;

    if v_assignment_id is null then
        raise exception 'You have no shift to time in for right now. You can time in from 30 minutes before your shift starts.'
            using errcode = 'P0001';
    end if;

    v_is_late := v_now > v_starts_at;

    insert into public.attendance_records (assignment_id, shift_id, worker_id, time_in, is_late)
    values (v_assignment_id, v_shift_id, v_worker_id, v_now, v_is_late);

    select concat_ws(' ', first_name, last_name) into v_worker_name
    from public.profiles where id = v_worker_id;

    return jsonb_build_object(
        'worker_name', v_worker_name,
        'shift_name', v_shift_name,
        'starts_at', v_starts_at,
        'ends_at', v_ends_at,
        'time_in', v_now,
        'is_late', v_is_late
    );
end;
$$;

create or replace function private.record_time_out()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_worker_id uuid := (select auth.uid());
    v_now timestamptz := clock_timestamp();
    v_record_id uuid;
    v_time_in timestamptz;
    v_shift_name text;
    v_worker_name text;
begin
    if v_worker_id is null or not private.authorize('attendance.record.own') then
        raise exception 'You are not allowed to record attendance' using errcode = '42501';
    end if;

    select ar.id, ar.time_in, s.shift_name
    into v_record_id, v_time_in, v_shift_name
    from public.attendance_records ar
    join public.shifts s on s.id = ar.shift_id
    where ar.worker_id = v_worker_id
      and ar.time_out is null
    for update of ar;

    if v_record_id is null then
        raise exception 'You have not timed in yet.' using errcode = 'P0001';
    end if;

    update public.attendance_records
    set time_out = v_now
    where id = v_record_id;

    select concat_ws(' ', first_name, last_name) into v_worker_name
    from public.profiles where id = v_worker_id;

    return jsonb_build_object(
        'worker_name', v_worker_name,
        'shift_name', v_shift_name,
        'time_in', v_time_in,
        'time_out', v_now,
        'worked_minutes', floor(extract(epoch from (v_now - v_time_in)) / 60)::integer
    );
end;
$$;

create or replace function public.record_time_in()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
    return private.record_time_in();
end;
$$;

create or replace function public.record_time_out()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
    return private.record_time_out();
end;
$$;

-- The station looks up the sign-in email for an employee number. Server key only:
-- service_role can't read profiles directly (OCH-195), and the browser must never call this.
create or replace function public.station_login_email(p_employee_number bigint)
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select u.email
    from public.profiles p
    join auth.users u on u.id = p.id
    join public.user_roles ur on ur.user_id = p.id and ur.role = 'worker'
    where p.employee_number = p_employee_number
      and p.account_status = 'active';
$$;

revoke all on function private.record_time_in() from public, anon;
revoke all on function private.record_time_out() from public, anon;
revoke all on function public.record_time_in() from public, anon;
revoke all on function public.record_time_out() from public, anon;
revoke all on function public.station_login_email(bigint) from public, anon, authenticated;
grant execute on function private.record_time_in() to authenticated;
grant execute on function private.record_time_out() to authenticated;
grant execute on function public.record_time_in() to authenticated;
grant execute on function public.record_time_out() to authenticated;
grant execute on function public.station_login_email(bigint) to service_role;