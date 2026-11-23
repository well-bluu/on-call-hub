insert into public.role_permissions (role, permission)
values ('owner', 'worker.create');

-- Reserve an address across the separate database and Auth requests.
-- Abandoned requests can be retried after five minutes.
create table private.worker_invite_reservations (
    email text primary key,
    expires_at timestamptz not null
);
revoke all on private.worker_invite_reservations from public, anon, authenticated;

create function public.reserve_worker_invite(owner_id uuid, worker_email text)
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

-- Auth sets invited_at inside the invitation transaction. The profile insert
-- feeds the existing worker queue and its per-owner notification trigger.
create function private.create_invited_worker_profile()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, first_name, last_name, phone_number)
    values (
        new.id, new.raw_user_meta_data ->> 'first_name',
        coalesce(new.raw_user_meta_data ->> 'last_name', ''),
        new.raw_user_meta_data ->> 'phone_number'
    ) on conflict (id) do nothing;
    delete from private.worker_invite_reservations where email = lower(new.email);
    return new;
end;
$$;
revoke all on function private.create_invited_worker_profile() from public, anon, authenticated;

create trigger create_invited_worker_profile
after update of invited_at on auth.users
for each row when (
    old.invited_at is null and new.invited_at is not null
    and new.raw_user_meta_data ->> 'worker_invite_id' is not null
)
execute function private.create_invited_worker_profile();
