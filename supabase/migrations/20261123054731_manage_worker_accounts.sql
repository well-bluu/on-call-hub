-- Limit profile edits to personal details and the existing active/inactive flag.
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, phone_number, avatar_path, account_status)
on public.profiles to authenticated;

alter policy "Users can update their own profile" on public.profiles
using (id = (select auth.uid()) and account_status = 'active')
with check (id = (select auth.uid()) and account_status = 'active');

alter policy "Users can create their own profile" on public.profiles
with check (id = (select auth.uid()) and account_status = 'active');

-- Read the target role without exposing the role table to clients.
create function private.can_edit_worker(worker_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
    select private.authorize('worker.update') and exists (
        select 1 from public.user_roles caller
        where caller.user_id = (select auth.uid()) and caller.role = 'owner'
    ) and exists (
        select 1 from public.user_roles ur
        where ur.user_id = worker_id and ur.role = 'worker'
    );
$$;
revoke all on function private.can_edit_worker(uuid) from public, anon;
grant execute on function private.can_edit_worker(uuid) to authenticated;

create policy "Owners can update workers" on public.profiles
for update to authenticated
using (private.can_edit_worker(id))
with check (
    private.can_edit_worker(id)
    and (account_status = 'active' or (select private.authorize('worker.delete')))
);

-- Auth needs only the status and the profile key to refuse a new token.
grant select (id, account_status) on public.profiles to supabase_auth_admin;
create policy "Auth can read profile status" on public.profiles
for select to supabase_auth_admin using (true);

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql stable
set search_path = ''
as $$
declare
    user_role public.app_role;
    status text;
begin
    select ur.role, p.account_status into user_role, status
    from public.user_roles ur
    left join public.profiles p on p.id = ur.user_id
    where ur.user_id = (event->>'user_id')::uuid;

    if user_role = 'worker' and status = 'inactive' then
        return jsonb_build_object('error', jsonb_build_object(
            'http_code', 403, 'message', 'This worker account is inactive.'
        ));
    end if;

    return jsonb_set(event, '{claims,user_role}', coalesce(to_jsonb(user_role), 'null'::jsonb));
end;
$$;

-- Hold the candidate's profile lock until the offer is recorded. A concurrent
-- deactivation either finishes first (and excludes them) or follows the offer.
create or replace function private.next_eligible_worker_for_shift(p_shift_id uuid)
returns uuid
language sql volatile
set search_path = ''
as $$
    select p.id
    from public.worker_priority_queue q
    join public.profiles p on p.id = q.worker_id
    join public.user_roles ur on ur.user_id = p.id
    where p.account_status = 'active' and ur.role = 'worker'
      and not exists (
          select 1 from public.shift_assignments sa
          where sa.shift_id = p_shift_id and sa.worker_id = p.id
      )
      and not private.shift_has_time_conflict(p.id, p_shift_id)
    order by q.queue_position, p.employee_number
    limit 1 for share of p;
$$;
