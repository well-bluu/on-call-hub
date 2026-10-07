-- Assign the default application role to every authenticated user.

insert into public.user_roles (user_id, role)
select users.id, $role$worker$role$::public.app_role
from auth.users as users
where not exists (
  select 1
  from public.user_roles as roles
  where roles.user_id = users.id
);

create or replace function private.assign_default_worker_role()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $function$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, $role$worker$role$::public.app_role)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;

revoke all
on function private.assign_default_worker_role()
from public, anon, authenticated;

drop trigger if exists assign_default_worker_role_on_auth_user
on auth.users;

create trigger assign_default_worker_role_on_auth_user
after insert on auth.users
for each row
execute function private.assign_default_worker_role();
