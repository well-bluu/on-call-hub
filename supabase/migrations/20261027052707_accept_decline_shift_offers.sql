-- Decline
create function private.decline_shift_offer(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not private.authorize('shift.decline') then
        raise exception 'You are not allowed to decline shift offers' using errcode = '42501';
    end if;

update public.shift_assignments
set response_status = 'declined',
    responded_at = now()
where id = p_assignment_id
    and worker_id = (select auth.uid())
    and response_status = 'pending';

if not found then
    raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
end if;
end;
$$;

-- Accept with a capacity check
create function private.accept_shift_offer(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift_id uuid;
    v_required integer;
    v_status text;
    v_accepted integer;
begin
    if not private.authorize('shift.accept') then
        raise exception 'You are not allowed to accept shift offers' using errcode = '42501';
    end if;

-- Which sgift is this offer for (onlt the caller's own offer)
select shift_id into v_shift_id
from public.shift_assignments
where id = p_assignment_id
    and worker_id = (select auth.uid());

if v_shift_id is null then
    raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
end if;

-- Lock the shift first: a second worker accepting at the same moment waits here
select required_workers, status into v_required, v_status
from public.shifts
where id = v_shift_id
for update;

-- Lock the offer and check it is still pending
perform 1
from public.shift_assignments
where id = p_assignment_id
    and response_status = 'pending'
for update;

if not found then
    raise exception 'This offer is not pending or is not yours' using errcode = 'P0002';
end if;

if v_status <> 'open' then
    raise exception 'This shift is no longer open' using errcode = 'P0001';
end if;

select count(*) into v_accepted
from public.shift_assignments
where shift_id = v_shift_id
    and response_status = 'accepted';

if v_accepted >= v_required then
    raise exception 'This shift is already filled' using errcode = 'P0001';
end if;

update public.shift_assignments
set response_status = 'accepted',
    responded_at = now()
where id = p_assignment_id;
end;
$$;

-- Public wrappers the app calls with supabase.rpc
create function public.decline_shift_offer(p_assignment_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
    select private.decline_shift_offer(p_assignment_id);
$$;

create function public.accept_shift_offer(p_assignment_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
    select private.accept_shift_offer(p_assignment_id);
$$;

-- Only signed-in users can call them; the permission checks inside decide therest
revoke all on function private.decline_shift_offer(uuid) from public, anon;
revoke all on function private.accept_shift_offer(uuid) from public, anon;
revoke all on function public.decline_shift_offer(uuid) from public, anon;
revoke all on function public.accept_shift_offer(uuid) from public, anon;

grant execute on function private.decline_shift_offer(uuid) to authenticated;
grant execute on function private.accept_shift_offer(uuid) to authenticated;
grant execute on function public.decline_shift_offer(uuid) to authenticated;
grant execute on function public.accept_shift_offer(uuid) to authenticated;