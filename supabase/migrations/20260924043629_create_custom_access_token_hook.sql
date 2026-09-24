create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path =''
as $$
declare
    claims jsonb;
    user_role public.app_role;
begin
    select role
    into user_role
    from public.user_roles
    where user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    claims := jsonb_set(
        claims,
        '{user_role}',
        coalesce(to_jsonb(user_role), 'null'::jsonb)
    );

    return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute
on function public.custom_access_token_hook(jsonb)
to supabase_auth_admin;

revoke execute
on function public.custom_access_token_hook(jsonb)
from anon, authenticated, public;

grant select 
on table public.user_roles
to supabase_auth_admin;

revoke all
on table public.user_roles
from anon, authenticated, public