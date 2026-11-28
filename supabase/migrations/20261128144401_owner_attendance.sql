-- OCH-238: owner attendance list.
insert into public.role_permissions (role, permission)
values ('owner', 'attendance.view.all');

create policy "Owner reads all attendance"
on public.attendance_records for select to authenticated
using ((select private.authorize('attendance.view.all')));

create or replace function private.list_attendance(p_from date, p_to date)
returns table (
  assignment_id uuid,
  shift_id uuid,
  shift_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  worker_id uuid,
  worker_name text,
  employee_number bigint,
  time_in timestamptz,
  time_out timestamptz,
  worked_minutes integer,
  attendance_status text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.authorize('attendance.view.all') then
    raise exception 'You are not allowed to view attendance' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 62 then
    raise exception 'Pick a date range of up to 2 months' using errcode = '22023';
  end if;

  return query
  select
    sa.id,
    s.id,
    s.shift_name,
    s.starts_at,
    s.ends_at,
    p.id,
    concat_ws(' ', p.first_name, p.last_name),
    p.employee_number,
    ar.time_in,
    ar.time_out,
    case when ar.time_out is not null
      then floor(extract(epoch from (ar.time_out - ar.time_in)) / 60)::integer
    end,
    case
      when ar.id is null and s.ends_at <= now() then 'no_show'
      when ar.id is null then 'upcoming'
      when ar.time_out is null and s.ends_at <= now() then 'missing_timeout'
      when ar.time_out is null then 'on_shift'
      when ar.is_late then 'late'
      else 'present'
    end
  from public.shift_assignments sa
  join public.shifts s on s.id = sa.shift_id
  join public.profiles p on p.id = sa.worker_id
  left join public.attendance_records ar on ar.assignment_id = sa.id
  where (sa.response_status = 'accepted' or ar.id is not null)
    and s.status <> 'cancelled'
    and (s.starts_at at time zone 'Asia/Manila')::date between p_from and p_to
  order by 4, 7;
end;
$$;

create or replace function public.list_attendance(p_from date, p_to date)
returns table (
  assignment_id uuid,
  shift_id uuid,
  shift_name text,
  starts_at timestamptz,
  ends_at timestamptz,
  worker_id uuid,
  worker_name text,
  employee_number bigint,
  time_in timestamptz,
  time_out timestamptz,
  worked_minutes integer,
  attendance_status text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_attendance(p_from, p_to);
$$;

revoke all on function private.list_attendance(date, date) from public, anon;
revoke all on function public.list_attendance(date, date) from public, anon;
grant execute on function private.list_attendance(date, date) to authenticated;
grant execute on function public.list_attendance(date, date) to authenticated;
