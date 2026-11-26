-- OCH-210: withdraw future work when a worker becomes inactive.
create or replace function private.withdraw_inactive_worker_shifts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
begin
    if new.account_status = 'inactive'
       and old.account_status is distinct from new.account_status then
        for v_shift_id in
            update public.shift_assignments a
            set response_status = 'cancelled',
                responded_at = now()
            from public.shifts s
            where s.id = a.shift_id
              and a.worker_id = new.id
              and a.response_status in ('pending', 'accepted')
              and s.status in ('open', 'filled')
              and s.starts_at > now()
            returning a.shift_id
        loop
            update public.shifts
            set status = 'open'
            where id = v_shift_id
              and status = 'filled';

            perform private.offer_next_eligible_worker(v_shift_id);
        end loop;
    end if;
    return new;
end;
$$;

drop trigger if exists withdraw_inactive_worker_shifts on public.profiles;
create trigger withdraw_inactive_worker_shifts
after update of account_status on public.profiles
for each row
execute function private.withdraw_inactive_worker_shifts();

create or replace function private.authorize(requested_permission public.app_permission)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    user_role public.app_role;
begin
    select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

    -- A worker's existing access token can outlive their active account status.
    if user_role = 'worker' and not exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
          and account_status = 'active'
    ) then
        return false;
    end if;

    return exists (
        select 1
        from public.role_permissions
        where role = user_role
          and permission = requested_permission
    );
end;
$$;
