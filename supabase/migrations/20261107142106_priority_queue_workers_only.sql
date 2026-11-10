-- Keep only workers in the offer priority queue.

-- Remove everyone who is not a worker.
delete from public.worker_priority_queue q
where not exists (
    select 1 from public.user_roles ur
    where ur.user_id = q.worker_id and ur.role = 'worker'
);

-- New profiles join the queue only if they are workers.
create or replace function private.add_worker_to_priority_queue()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if exists (
        select 1 from public.user_roles ur
        where ur.user_id = new.id and ur.role = 'worker'
    ) then
        insert into public.worker_priority_queue (worker_id)
        values (new.id)
        on conflict (worker_id) do nothing;
    end if;
    return new;
end;
$$;

-- A role change adds the user to, or removes them from, the queue.
create or replace function private.sync_priority_queue_with_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.role = 'worker' then
        insert into public.worker_priority_queue (worker_id)
        select p.id from public.profiles p where p.id = new.user_id
        on conflict (worker_id) do nothing;
    else
        delete from public.worker_priority_queue
        where worker_id = new.user_id;
    end if;
    return new;
end;
$$;

revoke all on function private.sync_priority_queue_with_role()
from public, anon, authenticated;

create trigger sync_priority_queue_on_role_change
after insert or update of role on public.user_roles
for each row
execute function private.sync_priority_queue_with_role();
