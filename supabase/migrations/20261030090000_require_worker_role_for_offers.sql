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
