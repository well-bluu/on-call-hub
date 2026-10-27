create or replace function public.has_permission(requested_permission public.app_permission)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.authorize(requested_permission);
$$;

revoke execute on function public.has_permission(public.app_permission) from public, anon;
grant execute on function public.has_permission(public.app_permission) to authenticated;