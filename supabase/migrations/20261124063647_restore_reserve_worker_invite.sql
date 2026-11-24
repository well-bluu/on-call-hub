create table if not exists private.worker_invite_reservations (
    email text primary key,
    expires_at timestamptz not null
);
revoke all on private.worker_invite_reservations from public, anon, authenticated;

create or replace function public.reserve_worker_invite(owner_id uuid, worker_email text)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1 from public.user_roles ur
        join public.role_permissions rp on rp.role = ur.role
        where ur.user_id = owner_id and rp.permission = 'worker.create'
    ) then
        return false;
    end if;

    delete from private.worker_invite_reservations where expires_at <= now();
    insert into private.worker_invite_reservations (email, expires_at)
    values (lower(worker_email), now() + interval '5 minutes')
    on conflict (email) do nothing;
    if not found then
        return false;
    end if;

    if exists (select 1 from auth.users u where lower(u.email) = lower(worker_email)) then
        delete from private.worker_invite_reservations where email = lower(worker_email);
        return false;
    end if;
    return true;
end;
$$;
revoke all on function public.reserve_worker_invite(uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_worker_invite(uuid, text) to service_role;