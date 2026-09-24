create schema if not exists private;

create or replace function private.authorize(
  requested_permission public.app_permission
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  user_role public.app_role;
begin
  select (auth.jwt() ->> 'user_role')::public.app_role 
  into user_role;

  return exists (
    select 1
    from public.role_permissions
    where role = user_role
      and permission = requested_permission
  );
end;
$$;

revoke all on function private.authorize(public.app_permission)
from public;

grant usage on schema private to authenticated;

grant execute
on function private.authorize(public.app_permission)
to authenticated;