create or replace function private.list_workers()
returns table (
    id uuid,
    employee_number bigint,
    first_name text,
    last_name text,
    phone_number text,
    account_status text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    if not private.authorize('worker.view') then
        raise exception 'You are not allowed to view workers' using errcode = '42501';
    end if;

    return query
    select p.id, p.employee_number, p.first_name, p.last_name,
           p.phone_number, p.account_status
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    where ur.role = 'worker'
    order by p.employee_number;
end;
$$;

create or replace function public.list_workers()
returns table (
    id uuid,
    employee_number bigint,
    first_name text,
    last_name text,
    phone_number text,
    account_status text
)
language sql
stable
security invoker
set search_path = ''
as $$
    select * from private.list_workers();
$$;

revoke all on function private.list_workers() from public, anon;
revoke all on function public.list_workers() from public, anon;
grant execute on function private.list_workers() to authenticated;
grant execute on function public.list_workers() to authenticated;
