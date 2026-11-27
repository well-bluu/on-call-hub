-- OCH-198: keep offering open shifts as workers become free,
-- and tell the owner when a new shift has nobody to offer it to.

create or replace function private.fill_open_shifts()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_shift record;
    v_count integer := 0;
begin
    for v_shift in
        select id
        from public.shifts
        where status = 'open'
          and starts_at > now()
        order by starts_at
    loop
        -- offer_next_eligible_worker returns null when the shift has enough
        -- pending + accepted workers, or nobody else is free.
        while private.offer_next_eligible_worker(v_shift.id) is not null loop
            v_count := v_count + 1;
        end loop;
    end loop;

    return v_count;
end;
$$;

revoke all on function private.fill_open_shifts() from public, anon, authenticated;

select cron.schedule(
    'fill-open-shifts',
    '*/5 * * * *',
    $$ select private.fill_open_shifts(); $$
);

create or replace function private.after_shift_insert_offer_workers()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_offered integer := 0;
begin
    loop
        exit when private.offer_next_eligible_worker(new.id) is null;
        v_offered := v_offered + 1;
    end loop;

    if v_offered = 0 and new.status = 'open' then
        perform private.notify(
            new.created_by,
            'shift',
            'no_available_workers',
            'No workers available',
            concat('No worker is free for ', new.shift_name, ' right now. It will be offered as soon as someone is free.'),
            new.id,
            null
        );
    end if;

    return new;
end;
$$;