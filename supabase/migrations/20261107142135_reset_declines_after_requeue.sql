-- Move a worker to the back after every 3 consecutive declines, then reset the count.
create or replace function private.record_worker_decline(p_worker_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_declines integer;
begin
    insert into public.worker_priority_queue (worker_id)
    values (p_worker_id)
    on conflict (worker_id) do nothing;

    select consecutive_declines
    into v_declines
    from public.worker_priority_queue
    where worker_id = p_worker_id
    for update;

    v_declines := v_declines + 1;

    update public.worker_priority_queue
    set consecutive_declines = case when v_declines >= 3 then 0 else v_declines end,
        queue_position = case
            when v_declines >= 3 then nextval('public.worker_priority_position_seq')
            else queue_position
        end
    where worker_id = p_worker_id;
end;
$$;

revoke all on function private.record_worker_decline(uuid)
from public, anon, authenticated;
