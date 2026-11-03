-- Supabase Cron (job scheduler)
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create or replace function private.expire_stale_offers()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_offer record;
    v_starts_at timestamptz;
    v_count integer :=0;
begin
    for v_offer in
        select a.id, a.shift_id
        from public.shift_assignments a
        where a.response_status = 'pending'
            and a.created_at < now() - interval '1 hour'
        order by a.created_at
    loop
    -- Lock the shift first (same order as accept and the offer engine)
    select starts_at into v_starts_at
    from public.shifts
    where id = v_offer.shift_id
    for update;

-- Skip it if the worker answered in the meantime
update public.shift_assignments
set response_status = 'expired',
    responded_at = now()
where id = v_offer.id
    and response_status = 'pending';

if found then
    v_count := v_count + 1;
    -- Only look for a replacement if the shift has not started
    if v_starts_at > now() then
        perform private.offer_next_eligible_worker(v_offer.shift_id);
    end if;
end if;
end loop;

    return v_count;
end;
$$;

-- Internal: only the scheduled job runs it
revoke all on function private.expire_stale_offers() from public, anon, authenticated;

-- Run every minute
select cron.schedule(
    'expire-stale-shift-offers',
    '* * * * *',
    $$ select private.expire_stale_offers(); $$
);